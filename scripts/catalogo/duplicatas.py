# -*- coding: utf-8 -*-
"""Registros repetidos do mesmo dispositivo, e a contradição entre eles.

Dois registros com a mesma `chave_dispositivo` (lei + artigo normalizados) são
duplicata. Quando divergem na pena ou na hediondez há uma CONTRADIÇÃO factual,
e `classificar_contradicao` diz de que espécie — `identidade`, `hediondez` ou
`pena`, da pior para a menor. É o número que `--estrito --max-contradicoes=N`
vigia na CI, para que nenhuma contradição nova entre sem ser vista.
"""
import re
from collections import defaultdict

from .fontes import url_planalto


def chave_dispositivo(c: dict) -> str:
    """Identidade do dispositivo, para detectar registros repetidos."""
    lei = re.sub(r"\s+", " ", (c.get("lei") or "")).strip().lower()
    art = re.sub(r"\s+", " ", (c.get("artigo") or "")).strip().lower()
    return f"{lei}|{art}"


# Palavras vazias que não ajudam a decidir se dois registros descrevem a MESMA
# conduta (aparecem em quase todo nome de tipo penal).
_VAZIAS = {
    "a", "ao", "aos", "as", "com", "contra", "da", "das", "de", "do", "dos", "e",
    "em", "na", "nas", "no", "nos", "o", "os", "ou", "para", "por", "que", "se",
    "sem", "um", "uma", "aumento", "qualificado", "qualificada", "majorado",
    "majorada", "art", "pena", "caput",
}


def _radical(p: str) -> str:
    """Radical grosseiro: os 5 primeiros caracteres, sem acento.

    Basta para casar as flexões que o catálogo usa para a MESMA conduta —
    "Inscrição fraudulenta de eleitor" × "Inscrever-se fraudulentamente como
    eleitor" viram {inscr, fraud, eleit} nos dois casos. Sem isso, a diferença
    entre substantivo e verbo seria lida como crime diferente.
    """
    sem_acento = p.translate(str.maketrans("áàâãäéèêëíìîïóòôõöúùûüç", "aaaaaeeeeiiiiooooouuuuc"))
    return sem_acento[:5]


def _termos(nome: str) -> set:
    palavras = re.findall(r"[a-zà-ú]{3,}", (nome or "").lower())
    return {_radical(p) for p in palavras if p not in _VAZIAS}


def mesma_conduta(a: dict, b: dict) -> bool:
    """Dois registros do mesmo dispositivo descrevem a mesma conduta?

    Compara o vocabulário dos nomes (Jaccard). Serve para separar dois defeitos
    de gravidade muito diferente:

    - nomes PARECIDOS + penas diferentes -> divergência de pena: um dos dois erra
      o quantum do mesmo crime;
    - nomes DIFERENTES -> divergência de IDENTIDADE: o catálogo afirma dois
      crimes distintos sob o mesmo dispositivo, ou seja, ao menos um registro
      está sob o rótulo errado. É o defeito mais grave, porque a pena "certa"
      pode estar atribuída ao artigo errado.

    Ex.: `LCP, Art. 32` aparece como "Disparar arma de fogo" e como "Dirigir sem
    habilitação" — não é divergência de pena, é rótulo trocado.

    Usa o coeficiente de SOBREPOSIÇÃO (interseção / menor conjunto), não Jaccard:
    é comum um registro trazer o nome curto ("Peculato culposo") e o outro uma
    paráfrase longa ("Peculato culposo — concorre culposamente para o crime de
    outrem"). Jaccard puniria a paráfrase (a união cresce) e acusaria identidade
    onde a conduta é a mesma.
    """
    ta, tb = _termos(a.get("crime")), _termos(b.get("crime"))
    if not ta or not tb:
        return True  # sem vocabulário útil: não afirmar divergência de identidade
    return (len(ta & tb) / min(len(ta), len(tb))) >= 0.5


def classificar_contradicao(grupo: list) -> str:
    """`identidade` | `hediondez` | `pena` — o tipo do defeito, do pior ao menor."""
    for i in range(len(grupo)):
        for j in range(i + 1, len(grupo)):
            if not mesma_conduta(grupo[i], grupo[j]):
                return "identidade"
    if len({g["hediondo"] for g in grupo}) > 1:
        return "hediondez"
    return "pena"


def marcar_duplicatas(crimes: list) -> tuple[dict, list]:
    """Marca `duplicata*` em cada registro e devolve (por_chave, contraditorios).

    `por_chave` agrupa os registros por `chave_dispositivo`; `contraditorios` é
    a lista das duplicatas divergentes, na forma que o relatório de qualidade
    publica. Pressupõe `chave_dispositivo`, `pena_*_meses` e `hediondo` já
    preenchidos em cada registro.
    """
    # ── Duplicatas ──────────────────────────────────────────────────────────
    # Mesmo dispositivo (lei + artigo) registrado mais de uma vez. Quando as
    # penas divergem entre as cópias, há uma CONTRADIÇÃO factual no catálogo:
    # não é possível saber qual está correta sem revisão jurídica do artigo.
    por_chave = defaultdict(list)
    for c in crimes:
        por_chave[c["chave_dispositivo"]].append(c)

    contraditorios = []
    for chave, grupo in por_chave.items():
        if len(grupo) == 1:
            continue
        penas = {(g["pena_min_meses"], g["pena_max_meses"]) for g in grupo}
        hedis = {g["hediondo"] for g in grupo}
        divergente = len(penas) > 1 or len(hedis) > 1
        tipo = classificar_contradicao(grupo) if divergente else ""
        for g in grupo:
            g["duplicata"] = True
            g["duplicata_divergente"] = divergente
            g["duplicata_tipo"] = tipo
            g["duplicata_ids"] = sorted(x["id"] for x in grupo if x["id"] != g["id"])
        if divergente:
            contraditorios.append(
                {
                    "chave": chave,
                    "tipo": tipo,
                    "ids": sorted(g["id"] for g in grupo),
                    "crimes": [g["crime"][:90] for g in grupo],
                    "fonte": url_planalto(grupo[0].get("lei")),
                    "crime": grupo[0]["crime"][:80],
                    "penas_meses": sorted(f"{a}-{b}" for a, b in penas),
                    "hediondo": sorted(hedis),
                }
            )
    for c in crimes:
        c.setdefault("duplicata", False)
        c.setdefault("duplicata_divergente", False)
        c.setdefault("duplicata_ids", [])
    return por_chave, contraditorios
