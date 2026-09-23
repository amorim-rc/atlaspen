# -*- coding: utf-8 -*-
"""A espécie da hediondez e o dispositivo que a produz, lidos de `data/hediondos.json`.

O catálogo diz *se* o tipo é hediondo; esta camada diz **por quê**, e de onde:

- `hediondo_especie` — `natureza`, `equiparado` ou `nao`. A distinção é
  constitucional: o art. 5º, XLIII, da CF equipara tortura, tráfico e terrorismo
  ao hediondo **quanto ao regime jurídico**, sem torná-los hediondos; hediondo é
  o que está no rol do art. 1º da Lei 8.072/90, que é taxativo.
- `hediondo_fundamento` — o inciso do rol, ou o dispositivo da equiparação, como
  a tabela curada o escreve.

**Nada aqui adivinha.** O casamento é o mesmo do Auditor (`auditar.py`), por
expressão regular sobre o diploma e o artigo, e quem não casa com regra nenhuma
não ganha fundamento nenhum: vira erro duro em `transform_data.py`. Foi assim
que apareceram, em 19/09/2026, oito registros militares que afirmavam hediondez
sem nada na tabela que a sustentasse.

Módulo compartilhado de propósito: duas implementações do mesmo casamento
divergem em silêncio, e o campo publicado passaria a discordar da auditoria.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
HEDIONDOS = RAIZ / "data" / "hediondos.json"

# A equiparação do art. 5º, XLIII, da CF, como a tabela a escreve no fundamento.
_EQUIPARADO = re.compile(r"art\.\s*5º,\s*XLIII", re.I)


# Uma alternativa da expressão de `artigo` termina de três formas legítimas:
# em `$`, na âncora de fim padrão, ou num grupo que já a contém.
_ANCORA = r"(?=$|,| )"


def _partes(expressao: str) -> list[str]:
    """As alternativas de topo de `a|b(c|d)`: `a` e `b(c|d)`."""
    partes, nivel, atual = [], 0, ""
    for c in expressao:
        if c == "(":
            nivel += 1
        elif c == ")":
            nivel -= 1
        if c == "|" and nivel == 0:
            partes.append(atual)
            atual = ""
        else:
            atual += c
    return partes + [atual]


def validar(tabela: dict) -> list[str]:
    """Toda regra ancorada em `^` tem de dizer onde termina.

    É a trava da decisão C15, e existe porque a C12 nasceu do silêncio oposto:
    `^Art\\. 157, §2º, V` sem fim casava `VI`, `VII` e `VIII`, e quatro formas do
    roubo passaram a afirmar hediondez que o rol não dá. Corrigir as expressões
    resolvia aquelas quatro; conferir no carregamento é o que impede a próxima
    de nascer torta.

    Regra que alcança o diploma inteiro é legítima — e então declara
    `aberta: true`, para que a largura seja escolha, e não descuido.
    """
    problemas = []
    for secao in ("regras", "excecoes"):
        for i, r in enumerate(tabela.get(secao, [])):
            if r.get("aberta"):
                continue
            for p in _partes(r["artigo"]):
                if p.endswith("$") or p.endswith(_ANCORA):
                    continue
                problemas.append(
                    f"hediondos.json: {secao}[{i}] ({r['lei']}) — a alternativa {p!r} não "
                    f"diz onde termina. Acrescente {_ANCORA!r} ou '$', ou declare "
                    f"\"aberta\": true se ela deve alcançar o diploma inteiro.")
    return problemas


class TabelaInvalida(ValueError):
    pass


def carregar(caminho: Path | None = None) -> dict:
    tabela = json.loads((caminho or HEDIONDOS).read_text(encoding="utf-8"))
    if problemas := validar(tabela):
        raise TabelaInvalida("\n".join(problemas))
    return tabela


def casa(regra: dict, registro: dict) -> bool:
    """O mesmo critério do Auditor: diploma e artigo, por expressão regular."""
    return bool(re.search(regra["lei"], registro.get("lei") or "")
                and re.search(regra["artigo"], registro.get("artigo") or ""))


def fora_de_alcance(registro: dict, tabela: dict) -> bool:
    """Diploma que a tabela não audita — salvo os dispositivos já decididos."""
    for f in tabela.get("fora_de_alcance", []):
        if not re.search(f["lei"], registro.get("lei") or ""):
            continue
        if any(re.search(e, registro.get("artigo") or "") for e in f.get("exceto", [])):
            return False
        return True
    return False


def classificar(registro: dict, tabela: dict) -> dict:
    """{especie, fundamento, condicional, regra} do registro.

    `especie` é `nao` quando nenhuma regra alcança o registro, ou quando uma
    exceção já julgada o tira do rol (tráfico privilegiado, associação para o
    tráfico, homicídio privilegiado).
    """
    excecao = next((e for e in tabela["excecoes"] if casa(e, registro)), None)
    if excecao and excecao["hediondo"] == "Não":
        return {"especie": "nao", "fundamento": excecao["fundamento"],
                "condicional": False, "regra": "excecao"}
    regra = next((r for r in tabela["regras"] if casa(r, registro)), None)
    if not regra:
        return {"especie": "nao", "fundamento": None, "condicional": False, "regra": None}
    especie = "equiparado" if _EQUIPARADO.search(regra["fundamento"]) else "natureza"
    return {"especie": especie, "fundamento": regra["fundamento"],
            "condicional": bool(regra.get("condicional")), "regra": "regra"}
