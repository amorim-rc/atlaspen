# -*- coding: utf-8 -*-
"""Migração dos 22 atributos penais do código para dados (frente 5, commit 3).

Lê a parte declarativa do catálogo em TypeScript, serializada por
`scripts/migracao_atributos.ts`, acrescenta o que o código não tinha — o id
numérico, os dispositivos em chave canônica e as redações de cada parâmetro — e
grava `data/atributos.json`. Grava também `data/historico-legislativo.json`, com
os eventos dos dispositivos citados, extraídos do compilado.

Nada de texto jurídico é redigitado: nome, descrição, requisitos, vedações,
rótulos, ajudas e padrões saem do código como estão. O que se escreve aqui à mão
é só o MAPA de cada parâmetro para o dispositivo de onde ele vem — a transcrição,
em chave canônica, do `fundamento` que o código já trazia —, e cada entrada é
conferida contra o compilado:

- a chave tem de existir no texto baixado;
- a norma de cada redação sai do histórico, não do mapa: "vigente" é o evento
  mais recente do dispositivo; uma norma escrita no mapa (redação antiga) tem de
  constar do histórico daquele dispositivo;
- a `evidencia`, quando dada, é um trecho que tem de estar no texto daquela
  redação. É assim que o 70% do primário em crime hediondo fica provado contra a
  Lei 15.358, e não contra a memória de quem escreveu o mapa. A evidência não vai
  para a base: serve só para a conferência.

A redação que leva o fundamento do código (a que não traz `fundamento` no mapa)
tem de ser a de evento mais recente: é o fundamento dela que a tela continua
mostrando.

Uso, a partir da raiz (uma vez; depois da migração a base é editada à mão e o
histórico é regenerado por scripts/robos/nucleo/historico.py):

    npx tsc -p scripts/tsconfig.verificar.json
    node .verificar-build/scripts/migracao_atributos.js
    python scripts/migracao_atributos.py

Some junto com o catálogo em código, no commit 6 da migração.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts" / "robos"))

from nucleo import historico as H  # noqa: E402

CATALOGO = RAIZ / ".verificar-build" / "catalogo-atributos.json"
SAIDA = RAIZ / "data" / "atributos.json"

META = {
    "descricao": (
        "Catálogo dos atributos penais: a fonte. O derivado, com a última alteração "
        "legislativa e o alcance de cada atributo, é static/data/atributos.json. "
        "Modelo em estudos/modelo-atributos.md, seção 4.3."),
    "id": (
        "Número inteiro, estável e append-only, como o dos tipos penais: atributo "
        "retirado vai para `aposentados`, e o número nunca volta."),
    "slug": "O identificador de texto usado nas URLs do site (?atributo=…).",
    "dispositivos": (
        "Chaves canônicas (<id em data/fontes.json>|<dispositivo>) em que o atributo "
        "se funda. Chave sem vírgula é o artigo inteiro."),
    "redacoes": (
        "De onde vem cada parâmetro. A redação vigente é a de evento mais recente no "
        "histórico (data/historico-legislativo.json, mesmo dispositivo e mesma "
        "norma); é o fundamento dela que a tela mostra. `valor` só aparece quando "
        "a redação dava número diferente do padrão. `norma: null` é o compilado "
        "calando: a unidade não tem anotação própria e está sob um chapéu anotado, "
        "e a base não a data pelo chapéu."),
    "sem_fonte_legal": "Parâmetro de simulação, sem dispositivo que o fixe; o texto diz por quê.",
}


def D(*chaves, norma="vigente", fundamento=None, valor=None, evidencia=None, sumula=None):
    """Redação apoiada em dispositivo(s). Mais de uma chave: o patamar mora num
    e a hipótese noutro (o inciso VI da LEP e a alínea dele)."""
    fonte = {"dispositivo": chaves[0]} if len(chaves) == 1 else {"dispositivos": list(chaves)}
    if sumula:
        fonte["sumula"] = sumula
    return {"fonte": fonte, "norma": norma, "fundamento": fundamento,
            "valor": valor, "evidencia": evidencia}


def S(sumula):
    return {"fonte": {"sumula": sumula}, "norma": "original", "fundamento": None,
            "valor": None, "evidencia": None}


def J(decisao):
    return {"fonte": {"decisao": decisao}, "norma": "original", "fundamento": None,
            "valor": None, "evidencia": None}


def SEM(motivo):
    return {"sem_fonte_legal": motivo}


# Parâmetro cujo fundamento no código cita a lei errada. A migração não muda o
# que o motor calcula (a equivalência proíbe), mas não copia para a base uma
# citação que o compilado desmente: a redação registrada é a que o motor
# aplica, com a lei que de fato a deu. A correção do cálculo é PR próprio.
FUNDAMENTO_CORRIGIDO = {
    "saida-temporaria.vedadoHediondoMorte": (
        "A vedação ao hediondo com resultado morte é a redação da Lei 13.964/2019; "
        "a Lei 14.843/2024 a trocou pela vedação a todo crime hediondo ou cometido "
        "com violência ou grave ameaça (e ao trabalho externo sem vigilância)."),
}

L112 = "lep|art. 112"
R2019 = "Lei nº 13.964"


def _p2019(unidade, rotulo, **kw):
    """A redação de 2019 de uma unidade do art. 112 da LEP."""
    chaves = [f"{L112}, {u}" for u in unidade]
    return D(*chaves, norma=R2019, fundamento=f"Art. 112, {rotulo}, LEP (redação da Lei 13.964/2019)", **kw)


MAPA = {
    "transacao": {
        "dispositivos": ["juizados-9099|art. 76"],
        "parametros": {
            "limiteMaxMeses": [
                D("juizados-9099|art. 61", norma="original",
                  fundamento="Art. 61, Lei 9.099/95 (redação original)",
                  valor=12, evidencia="não superior a um ano"),
                D("juizados-9099|art. 61", evidencia="não superior a 2 (dois) anos"),
            ],
            "vedadoViolencia": [S("STJ 536")],
        },
    },
    "sursis-processual": {
        "dispositivos": ["juizados-9099|art. 89"],
        "parametros": {
            "limiteMinMeses": [D("juizados-9099|art. 89, caput", evidencia="igual ou inferior a um ano")],
            "periodoProvaMinAnos": [D("juizados-9099|art. 89, caput", evidencia="dois a quatro anos")],
            "periodoProvaMaxAnos": [D("juizados-9099|art. 89, caput", evidencia="dois a quatro anos")],
            "vedadoViolencia": [S("STJ 536")],
        },
    },
    "anpp": {
        "dispositivos": ["cpp|art. 28-a"],
        "parametros": {
            "limiteMinMeses": [D("cpp|art. 28-a, caput", evidencia="inferior a 4 (quatro) anos")],
            "exigeSemViolencia": [D("cpp|art. 28-a, caput", evidencia="sem violência ou grave ameaça")],
            "exigeConfissao": [D("cpp|art. 28-a, caput", evidencia="confessado formal")],
            "vedadoReincidente": [D("cpp|art. 28-a, §2º, ii", evidencia="reincidente")],
        },
    },
    "colaboracao-premiada": {
        "dispositivos": ["orgcrim-12850|art. 4"],
        "parametros": {
            "fracaoReducaoMax": [D("orgcrim-12850|art. 4, caput", evidencia="2/3 (dois terços)")],
            "fracaoReducaoPosSentenca": [D("orgcrim-12850|art. 4, §5º", evidencia="metade")],
            "admitePerdaoJudicial": [D("orgcrim-12850|art. 4, caput", "orgcrim-12850|art. 4, §2º",
                                       evidencia="perdão judicial")],
        },
    },
    "substituicao": {
        "dispositivos": ["cp|art. 44"],
        "parametros": {
            "limiteConcretaMeses": [D("cp|art. 44, i", evidencia="não superior a quatro anos")],
            "exigeSemViolencia": [D("cp|art. 44, i", evidencia="violência ou grave ameaça")],
            "culposoSemTeto": [D("cp|art. 44, i", evidencia="culposo")],
            "vedadoReincidenteEspecifico": [D("cp|art. 44, §3º", evidencia="mesmo crime")],
        },
    },
    "sursis-pena": {
        "dispositivos": ["cp|art. 77"],
        "parametros": {
            "limiteComumMeses": [D("cp|art. 77, caput", evidencia="não superior a 2 (dois) anos")],
            "limiteEtarioMeses": [D("cp|art. 77, §2º", evidencia="não superior a quatro anos")],
            "vedadoReincidente": [D("cp|art. 77, i", "cp|art. 77, §1º", evidencia="reincidente em crime doloso")],
        },
    },
    "regime": {
        "dispositivos": ["cp|art. 33, §2º", "cp|art. 33, §3º"],
        "parametros": {
            "limiteFechadoMeses": [D("cp|art. 33, §2º, a", evidencia="superior a 8 (oito) anos")],
            "limiteSemiabertoMeses": [D("cp|art. 33, §2º, b", evidencia="superior a 4 (quatro) anos")],
            "hediondoFechado": [J("STF HC 111.840/ES")],
        },
    },
    "perdao-judicial": {
        "dispositivos": ["cp|art. 107, ix"],
        "parametros": {
            "exigePrevisaoExpressa": [D("cp|art. 107, ix", evidencia="perdão judicial")],
        },
    },
    "arrependimento-posterior": {
        "dispositivos": ["cp|art. 16"],
        "parametros": {
            "fracaoMin": [D("cp|art. 16", evidencia="um a dois terços")],
            "fracaoMax": [D("cp|art. 16", evidencia="um a dois terços")],
            "exigeSemViolencia": [D("cp|art. 16", evidencia="sem violência ou grave ameaça")],
            "exigeReparacao": [D("cp|art. 16", evidencia="reparado o dano")],
        },
    },
    "arrependimento-eficaz": {
        "dispositivos": ["cp|art. 15"],
        "parametros": {
            "exigeTentativaAdmitida": [D("cp|art. 14, ii", "cp|art. 15", evidencia="tentado")],
        },
    },
    "progressao": {
        "dispositivos": [L112],
        "parametros": {
            "fracaoPrimarioSemViolencia": [
                D(f"{L112}, i", norma=R2019, evidencia="16% (dezesseis por cento)")],
            "fracaoCaputRegimeAnterior": [D(f"{L112}, caput", evidencia="1/6")],
            "fracaoReincidenteSemViolencia": [
                _p2019(["ii"], "II", evidencia="20% (vinte por cento)"),
                D(f"{L112}, iii", evidencia="20%")],
            "fracaoPrimarioViolencia": [
                _p2019(["iii"], "III", evidencia="25% (vinte e cinco por cento)"),
                D(f"{L112}, i", evidencia="25%")],
            "fracaoReincidenteViolencia": [
                _p2019(["iv"], "IV", evidencia="30% (trinta por cento)"),
                D(f"{L112}, ii", evidencia="30%")],
            "fracaoPrimarioHediondo": [
                _p2019(["v"], "V", valor=0.4, evidencia="40% (quarenta por cento)"),
                D(f"{L112}, v", evidencia="70% (setenta por cento)")],
            "fracaoPrimarioHediondoMorte": [
                _p2019(["vi", "vi, a"], 'VI, "a"', valor=0.5, evidencia="50% (cinquenta por cento)"),
                D(f"{L112}, vi", f"{L112}, vi, a", evidencia="75% (setenta e cinco por cento)")],
            "fracaoComandoOrgcrim": [
                _p2019(["vi", "vi, b"], 'VI, "b"', valor=0.5, evidencia="50% (cinquenta por cento)"),
                D(f"{L112}, vi", f"{L112}, vi, b", evidencia="ultraviolenta")],
            "fracaoMiliciaPrivada": [
                _p2019(["vi", "vi, c"], 'VI, "c"', valor=0.5, evidencia="50% (cinquenta por cento)"),
                D(f"{L112}, vi", f"{L112}, vi, c", evidencia="75% (setenta e cinco por cento)")],
            "fracaoFeminicidioPrimario": [
                D(f"{L112}, vi", f"{L112}, vi, d", evidencia="feminicídio")],
            "fracaoReincidenteHediondo": [
                _p2019(["vii"], "VII", valor=0.6, evidencia="60% (sessenta por cento)"),
                D(f"{L112}, vii", evidencia="80% (oitenta por cento)")],
            "fracaoReincidenteHediondoMorte": [
                _p2019(["viii"], "VIII", valor=0.7, evidencia="70% (setenta por cento)"),
                D(f"{L112}, viii", evidencia="85% (oitenta e cinco por cento)")],
        },
    },
    "livramento": {
        "dispositivos": ["cp|art. 83"],
        "parametros": {
            "penaMinimaMeses": [D("cp|art. 83, caput", evidencia="igual ou superior a 2 (dois) anos")],
            "fracaoPrimario": [D("cp|art. 83, i", evidencia="mais de um terço")],
            "fracaoReincidente": [D("cp|art. 83, ii", evidencia="mais da metade")],
            "fracaoHediondo": [D("cp|art. 83, v", evidencia="mais de dois terços")],
            "vedadoReincidenteHediondo": [D("cp|art. 83, v", evidencia="reincidente específico")],
            "vedadoArt112": [D(f"{L112}, vi", f"{L112}, vi, a", f"{L112}, vi, b", f"{L112}, vi, d",
                               f"{L112}, viii", evidencia="vedado o livramento condicional")],
        },
    },
    "prescricao": {
        "dispositivos": ["cp|art. 109"],
        "parametros": {
            "prazoMaisDe12Anos": [D("cp|art. 109, i", evidencia="vinte anos")],
            "prazoMaisDe8Anos": [D("cp|art. 109, ii", evidencia="dezesseis anos")],
            "prazoMaisDe4Anos": [D("cp|art. 109, iii", evidencia="doze anos")],
            "prazoMaisDe2Anos": [D("cp|art. 109, iv", evidencia="oito anos")],
            "prazoMaisDe1Ano": [D("cp|art. 109, v", evidencia="quatro anos")],
            "prazoAteUmAno": [D("cp|art. 109, vi", evidencia="3 (três) anos")],
            "reducaoEtaria": [D("cp|art. 115", evidencia="reduzidos de metade")],
        },
    },
    "saida-temporaria": {
        "dispositivos": ["lep|art. 122"],
        "parametros": {
            "fracaoPrimario": [D("lep|art. 123, ii", evidencia="1/6 (um sexto)")],
            "fracaoReincidente": [D("lep|art. 123, ii", evidencia="1/4 (um quarto)")],
            # O motor aplica a redação de 2019 (ver FUNDAMENTO_CORRIGIDO).
            "vedadoHediondoMorte": [D("lep|art. 122, §2º", norma=R2019,
                                      fundamento="Art. 122, §2º, LEP (redação da Lei 13.964/2019)",
                                      evidencia="crime hediondo com resultado morte")],
        },
    },
    "detracao": {
        "dispositivos": ["cp|art. 42"],
        "parametros": {
            "aplicaMedidaSeguranca": [D("cp|art. 42", evidencia="medida de segurança")],
        },
    },
    "remicao": {
        "dispositivos": ["lep|art. 126"],
        "parametros": {
            "diasTrabalhadosPorDiaRemido": [D("lep|art. 126, §1º, ii", evidencia="3 (três) dias de trabalho")],
            "horasEstudoPorDiaRemido": [D("lep|art. 126, §1º, i", evidencia="12 (doze) horas")],
            "acrescimoConclusaoCurso": [D("lep|art. 126, §5º", evidencia="1/3 (um terço)")],
        },
    },
    "prisao-domiciliar": {
        "dispositivos": ["lep|art. 117", "cpp|art. 318"],
        "parametros": {
            "somenteRegimeAberto": [D("lep|art. 117", sumula="STF SV 56", evidencia="regime aberto")],
            "vedadoViolencia": [J("STF HC 143.641/SP")],
        },
    },
    "monitoracao-eletronica": {
        "dispositivos": ["lep|art. 146-b", "cpp|art. 319, ix"],
        "parametros": {
            "admiteComoCautelar": [D("cpp|art. 319, ix", evidencia="monitoração eletrônica")],
            "vedadoHediondo": SEM(
                "Não há vedação legal de monitoração por hediondez: o parâmetro existe "
                "para simular propostas legislativas que a introduzam."),
        },
    },
    "indulto": {
        "dispositivos": ["cf|art. 84, xii", "cp|art. 107, ii"],
        "parametros": {
            "vedadoHediondo": [D("cf|art. 5, xliii", evidencia="graça ou anistia")],
            "fracaoTipica": SEM(
                "A fração vem do decreto de indulto de cada ano: não há patamar legal fixo."),
        },
    },
    "comutacao": {
        "dispositivos": ["cf|art. 84, xii", "lep|art. 192"],
        "parametros": {
            "vedadoHediondo": [D("cf|art. 5, xliii", evidencia="graça ou anistia")],
            "fracaoReducao": SEM(
                "A fração vem do decreto de comutação de cada ano: não há patamar legal fixo."),
        },
    },
    "graca": {
        "dispositivos": ["cf|art. 84, xii", "lep|art. 188"],
        "parametros": {
            "vedadoHediondo": [D("cf|art. 5, xliii", "hediondos-8072|art. 2, i", evidencia="graça")],
        },
    },
    "unificacao": {
        "dispositivos": ["cp|art. 75"],
        "parametros": {
            "limiteAnos": [D("cp|art. 75, caput", evidencia="40 (quarenta) anos")],
            "aplicaSumula715": [S("STF 715")],
        },
    },
}


def _chaves(fonte: dict) -> list[str]:
    return ([fonte["dispositivo"]] if "dispositivo" in fonte else []) + fonte.get("dispositivos", [])


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip().lower()


def _ordem(linha: dict, pos: dict) -> tuple:
    return (linha.get("ano") or 0, pos[id(linha)])


def resolver(spec: dict, linhas: list[dict], pos: dict, textos: dict[str, str],
             onde: str, erros: list[str]):
    """(norma, ano) da redação, conferidos contra o histórico; None se falhar.

    Norma `None` é o compilado calando: a unidade existe no texto, mas não tem
    anotação própria e está sob um chapéu anotado (ver nucleo/historico.py). A
    base registra o silêncio em vez de datar a unidade pelo chapéu.
    """
    chaves = _chaves(spec["fonte"])
    if not chaves:
        return spec["norma"], None
    unidades = {k: [u for u in textos if H.linhas_de(k, [{"dispositivo": u}])] for k in chaves}
    ausentes = [k for k, us in unidades.items() if not us]
    if ausentes:
        erros.append(f"{onde}: {ausentes} não existe no compilado")
        return None
    por_chave = {k: H.linhas_de(k, linhas) for k in chaves}
    if spec["norma"] == "vigente":
        # A redação vigente de cada dispositivo é o evento mais recente dele; a da
        # redação é a mais recente entre eles.
        escolhidas = [max(ls, key=lambda l: _ordem(l, pos)) for ls in por_chave.values() if ls]
        revogadas = [l["dispositivo"] for l in escolhidas if l["evento"] == "revogacao"]
        if revogadas:
            erros.append(f"{onde}: citado como vigente, mas revogado: {revogadas}")
            return None
        if escolhidas and all(por_chave.values()):
            ultima = max(escolhidas, key=lambda l: _ordem(l, pos))
            norma, ano = ultima["norma"], ultima.get("ano")
        else:
            norma, ano = None, None
        # O texto vigente de cada unidade citada, com linha ou sem.
        conferir = [textos[u] for us in unidades.values() for u in us]
    else:
        conferir = [l["_texto"] for ls in por_chave.values() for l in ls
                    if l["norma"] == spec["norma"]]
        if not conferir:
            erros.append(f"{onde}: {spec['norma']} não consta do histórico de {chaves}")
            return None
        norma = spec["norma"]
        ano = next(l.get("ano") for ls in por_chave.values() for l in ls if l["norma"] == norma)
    ev = spec.get("evidencia")
    if ev and not any(_norm(ev) in _norm(t) for t in conferir):
        erros.append(f"{onde}: evidência {ev!r} ausente do texto da redação ({norma}) de {chaves}")
    return norma, ano


def parametro(p: dict, specs, linhas, pos, textos, onde, erros) -> dict:
    saida = {k: p[k] for k in ("id", "rotulo", "tipo", "padrao", "min", "max", "passo", "ajuda")
             if k in p}
    if isinstance(specs, dict):
        if p.get("fundamento"):
            erros.append(f"{onde}: o código dá fundamento ({p['fundamento']}), o mapa diz sem fonte")
        saida["sem_fonte_legal"] = specs["sem_fonte_legal"]
        return saida
    if not p.get("fundamento"):
        erros.append(f"{onde}: o código não dá fundamento; o mapa precisa dizer por quê (SEM)")
        return saida
    vigentes = [s for s in specs if s["fundamento"] is None]
    corrigido = onde in FUNDAMENTO_CORRIGIDO
    if len(vigentes) != (0 if corrigido else 1):
        erros.append(f"{onde}: {len(vigentes)} redações sem fundamento próprio "
                     f"(tem de ser {'nenhuma' if corrigido else 'uma'})")
        return saida
    if corrigido:
        print(f"  fundamento corrigido em {onde}: {p['fundamento']!r} -> "
              f"{specs[-1]['fundamento']!r}. {FUNDAMENTO_CORRIGIDO[onde]}")
    redacoes, anos = [], []
    for s in specs:
        r = resolver(s, linhas, pos, textos, onde, erros)
        if r is None:
            continue
        norma, ano = r
        red = {"fonte": s["fonte"], "norma": norma, "fundamento": s["fundamento"] or p["fundamento"]}
        if s["valor"] is not None:
            if s["valor"] == p["padrao"]:
                erros.append(f"{onde}: valor {s['valor']} igual ao padrão; omita")
            red["valor"] = s["valor"]
        redacoes.append(red)
        anos.append((ano or 0, bool(vigentes) and s is vigentes[0]))
    if len(redacoes) == len(specs) and not corrigido:
        mais_recente = max(range(len(anos)), key=lambda i: (anos[i][0], i))
        if not anos[mais_recente][1]:
            erros.append(f"{onde}: a redação com o fundamento do código não é a mais recente")
    saida["redacoes"] = redacoes
    return saida


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    if not CATALOGO.exists():
        print(f"✗ falta {CATALOGO.relative_to(RAIZ)}: rode o migracao_atributos.ts antes")
        return 2
    catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
    erros: list[str] = []

    slugs = [d["id"] for d in catalogo]
    if set(slugs) != set(MAPA):
        erros.append(f"mapa e código divergem: {sorted(set(slugs) ^ set(MAPA))}")

    chaves: list[str] = []
    for m in MAPA.values():
        chaves += m["dispositivos"]
        for specs in m["parametros"].values():
            if isinstance(specs, list):
                for s in specs:
                    chaves += _chaves(s["fonte"])
    chaves = list(dict.fromkeys(chaves))
    linhas, avisos = H.gerar(chaves)
    pos = {id(l): i for i, l in enumerate(linhas)}
    textos = H.ultimos_textos(chaves)

    atributos = []
    for n, d in enumerate(catalogo, start=1):
        m = MAPA.get(d["id"])
        if m is None:
            continue
        for k in m["dispositivos"]:
            if not any(H.linhas_de(k, [{"dispositivo": u}]) for u in textos):
                erros.append(f"{d['id']}: dispositivo {k} não existe no compilado")
        faltam = {p["id"] for p in d["parametros"]} ^ set(m["parametros"])
        if faltam:
            erros.append(f"{d['id']}: parâmetros sem mapa ou sobrando no mapa: {sorted(faltam)}")
        atributos.append({
            "id": n,
            "slug": d["id"],
            "nome": d["nome"],
            "fundamento": d["fundamento"],
            "dispositivos": m["dispositivos"],
            "categoria": d["categoria"],
            "natureza": d["natureza"],
            "descricao": d["descricao"],
            "requisitos": d["requisitos"],
            "vedacoes": d["vedacoes"],
            "parametros": [parametro(p, m["parametros"].get(p["id"], []), linhas, pos, textos,
                                     f"{d['id']}.{p['id']}", erros)
                           for p in d["parametros"]],
        })

    for a in avisos:
        print("  aviso:", a)
    if erros:
        print(f"✗ {len(erros)} erro(s); nada foi gravado:")
        for e in erros:
            print("  ✗", e)
        return 1

    SAIDA.write_text(
        json.dumps({"_meta": META, "aposentados": [], "atributos": atributos},
                   indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8", newline="\n")
    H.gravar(linhas)
    n_par = sum(len(a["parametros"]) for a in atributos)
    n_red = sum(len(p.get("redacoes", [])) for a in atributos for p in a["parametros"])
    print(f"✓ {len(atributos)} atributos, {n_par} parâmetros, {n_red} redações -> "
          f"{SAIDA.relative_to(RAIZ).as_posix()}")
    print(f"✓ {len(linhas)} eventos de {len(chaves)} dispositivos -> "
          f"{H.HISTORICO.relative_to(RAIZ).as_posix()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
