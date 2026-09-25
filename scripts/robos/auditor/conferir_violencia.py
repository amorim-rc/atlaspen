# -*- coding: utf-8 -*-
"""Confere `violencia` e `grave_ameaca` do catálogo contra o texto do dispositivo.

Lê os snapshots do Planalto, aplica as regras escritas de `scripts/violencia.py`
e abre três listas: **confere**, **diverge** e **pede juízo**. Não escreve no
catálogo — a correção vai pelo fluxo normal, e o que depende de juízo espera
quem assina.

Uso:
    python scripts/robos/auditor/conferir_violencia.py            # relatório no terminal
    python scripts/robos/auditor/conferir_violencia.py --md ARQ   # relatório em Markdown

Saídas: 0 = nada a rever; 3 = há divergência ou caso a julgar.
"""
from __future__ import annotations

import argparse
import collections
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(RAIZ / "scripts"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from auditor.auditar import carregar_excecoes, dispositivos_de  # noqa: E402
from vigia.conferir import indexar_catalogo  # noqa: E402
from violencia import classificar  # noqa: E402

# Inciso em romano OU alínea em letra: o art. 1º da Lei 2.889 desce a "a",
# "b", "c", e com o padrão só-romano o registro da alínea recebia o texto do
# caput — que é um chapéu sem conduta ("Quem, com a intenção de destruir…").
# Os dois crimes de genocídio que MATAM saíam sem violência nenhuma.
_INCISO_FINAL = re.compile(r",\s*([IVXLC]+|[a-z])\s*$")


def textos_do_registro(registro: dict, disp: dict, chave: str) -> tuple[str, str]:
    """(texto próprio, texto do caput). O inciso do registro entra no próprio."""
    d = disp.get(chave)
    base = disp.get(chave.split("|")[0] + "|caput")
    inciso = ""
    m = _INCISO_FINAL.search(registro.get("artigo") or "")
    if d and m:
        inciso = " ".join(
            i.get("texto", "") for i in d.incisos
            if (i.get("marcador") or "").upper() == m.group(1).upper()
        )
    proprio = " ".join(filter(None, [d.epigrafe if d else "", d.texto if d else "", inciso]))
    caput = " ".join(filter(None, [base.epigrafe if base else "", base.texto if base else ""]))
    return proprio, caput


# Remissão a outro dispositivo do MESMO diploma: "no caso do § 1º do art. 209",
# "qualquer dos crimes definidos nos arts. 205 a 208". O derivador só registra
# que há remissão — resolvê-la exige o texto do dispositivo remetido, e quem o
# tem é este arquivo.
_REMETIDO = re.compile(
    r"(?:§\s*(\d+)[º°]?\s*d[oe]\s*)?art(?:s|igos?)?\.?\s*(\d+(?:-[A-Za-z])?)", re.I)


def _chave_remetida(m: re.Match) -> str:
    artigo = f"Art. {m.group(2)}"
    return f"{artigo}|§ {m.group(1)}º" if m.group(1) else f"{artigo}|caput"


def resolver_remissao(registro: dict, proprio: str, caput: str,
                      disp: dict) -> dict | None:
    """A classificação do tipo REMETIDO, quando os remetidos concordam.

    Decisão B1/e. O CPM de guerra é escrito quase todo por remissão ao CPM de
    paz — "praticar qualquer dos crimes definidos nos arts. 205 a 208", "no caso
    do § 1º do art. 209" —, e o parágrafo às vezes nem repete a remissão do
    caput (art. 389, parágrafo único). Sem resolvê-la, 56 registros militares
    ficavam permanentemente em "pede juízo", e a lesão corporal de guerra saía
    tão pacífica quanto uma infração de trânsito.

    Herda os DOIS campos, e só quando todos os remetidos dizem a mesma coisa:
    remissão que alcança tipos de classificação diferente é juízo, não leitura.
    """
    # O rótulo manda sobre o texto. "Art. 405 c/c art. 244, caput" é remissão a
    # UM dispositivo, escolhido por quem montou o registro; o texto do art. 405
    # remete a uma faixa inteira ("qualquer dos crimes definidos nos arts. …"),
    # e resolver a faixa daria a classificação do roubo à extorsão mediante
    # sequestro, que é condicional por decisão própria.
    rotulo = re.search(r"c/c\s*art\.\s*(\d+(?:-[A-Za-z])?)(?:,\s*§\s*(\d+))?",
                       registro.get("artigo") or "", re.I)
    if rotulo:
        k = (f"Art. {rotulo.group(1)}|§ {rotulo.group(2)}º" if rotulo.group(2)
             else f"Art. {rotulo.group(1)}|caput")
        fontes_de_remissao = [[k]]
    else:
        fontes_de_remissao = [[_chave_remetida(m) for m in _REMETIDO.finditer(x or "")]
                              for x in (proprio, caput)]

    for alvos in fontes_de_remissao:
        vistos: dict[str, set] = {"violencia": set(), "grave_ameaca": set()}
        achou = False
        for k in alvos:
            d = disp.get(k)
            if d is None or d.chave == (proprio and None):
                continue
            base = disp.get(k.split("|")[0] + "|caput")
            r = classificar(
                registro,
                " ".join(filter(None, [d.epigrafe or "", d.texto or ""])),
                " ".join(filter(None, [base.epigrafe or "", base.texto or ""])) if base else "")
            if any(r[c].valor is None for c in vistos):
                continue
            achou = True
            for c in vistos:
                vistos[c].add(r[c].valor)
        if achou and all(len(v) == 1 for v in vistos.values()):
            return {c: next(iter(v)) for c, v in vistos.items()}
    return None


def _ja_julgado(campo: str, ident: int) -> bool:
    """A divergência está em `excecoes-auditoria.json`, com motivo e data?

    Casa por CAMPO mais id, nunca por id sozinho: o estupro de vulnerável tem
    juízo tomado sobre `violencia` (decisão 4, grau B) e nada decidido sobre
    `grave_ameaca`. Exceção ampla demais cala o que ninguém julgou.
    """
    for e in carregar_excecoes():
        if e.get("campo") == campo and ident in (e.get("ids") or []):
            return True
    return False


def rodar() -> dict[str, list[dict]]:
    listas: dict[str, list[dict]] = {"confere": [], "ressalva": [], "diverge": [], "juizo": []}
    for fonte, por_chave in indexar_catalogo().items():
        disp = dispositivos_de(fonte)
        for chave, linhas in por_chave.items():
            for registro in linhas:
                proprio, caput = textos_do_registro(registro, disp, chave)
                r = classificar(registro, proprio, caput)
                if any(r[c].valor is None for c in ("violencia", "grave_ameaca")):
                    if herdado := resolver_remissao(registro, proprio, caput, disp):
                        for c, valor in herdado.items():
                            if r[c].valor is None:
                                r[c].valor = valor
                                r[c].regra = "remissao-resolvida"
                                r[c].origem = "remetido"
                                r[c].alerta = ("Herdado do tipo a que a lei remete; "
                                               "os remetidos concordam.")
                for campo in ("violencia", "grave_ameaca"):
                    c = r[campo]
                    item = {
                        "id": registro["id"], "lei": registro["lei"], "artigo": registro["artigo"],
                        "crime": registro["crime"], "campo": campo, "catalogo": registro[campo],
                        "derivado": c.valor, "regra": c.regra, "origem": c.origem,
                        "fundamento": c.fundamento, "alerta": c.alerta,
                        "condicao": c.condicao,
                        "condicao_no_catalogo": registro.get("violencia_condicao"),
                    }
                    if c.valor is None:
                        listas["juizo"].append(item)
                    elif c.valor != registro[campo] and _ja_julgado(campo, registro["id"]):
                        # Divergência que o mantenedor já julgou, com motivo e
                        # data em excecoes-auditoria.json. Não é correção de dado
                        # pendente: é juízo tomado. Volta a aparecer no dia em
                        # que a exceção for retirada, e não antes.
                        item["alerta"] = "Divergência já julgada (excecoes-auditoria.json)."
                        listas["ressalva"].append(item)
                    elif (c.valor == "Sim" and registro[campo] == "Não"
                          and registro.get("violencia_condicao")):
                        # CONFERE COM RESSALVA, segunda forma (decisão B1, 1.2).
                        # A regra achou a hipótese violenta num dos incisos; o
                        # catálogo responde "Não" e declara a condição que aponta
                        # esse mesmo inciso (id 1520, CPM 208, parágrafo único).
                        # Os dois dizem a mesma coisa por caminhos diferentes —
                        # contar como divergência mandaria corrigir o que está
                        # certo, e apagaria a condição que a decisão 8 criou.
                        item["alerta"] = ("A regra acha a hipótese violenta; o catálogo "
                                          "a declara em `violencia_condicao`.")
                        listas["ressalva"].append(item)
                    elif c.valor != registro[campo]:
                        listas["diverge"].append(item)
                    elif c.condicao and registro.get("violencia_condicao"):
                        # CONFERE COM RESSALVA (item 1.3 da revisão de 23/09/2026).
                        # A regra diz "Não, mas depende" e o catálogo declara a
                        # condição: os dois dizem a mesma coisa, e contá-los como
                        # simples conferência esconderia justamente o que a
                        # decisão 8 criou. Divergência isto não é.
                        listas["ressalva"].append(item)
                    elif c.condicao:
                        # A regra vê condição e o catálogo não a declara: falta
                        # o texto, e é pergunta, não erro de valor.
                        item["alerta"] = ("a regra reconhece hipótese condicional e o registro "
                                          "não declara `violencia_condicao`")
                        listas["juizo"].append(item)
                    else:
                        listas["confere"].append(item)
    return listas


def linha(i: dict) -> str:
    return (f"| {i['id']} | {i['lei']} | {i['artigo']} | {i['crime'][:60]} | {i['campo']} | "
            f"{i['catalogo']} | {i['derivado'] or '—'} | {i['regra'] or '—'} | "
            f"{(i['fundamento'] or i['alerta'] or '').replace('|', '/')[:90]} |")


def markdown(listas: dict[str, list[dict]]) -> str:
    cab = ("| id | diploma | dispositivo | tipo | campo | catálogo | derivado | regra | o que a lei diz |\n"
           "|---|---|---|---|---|---|---|---|---|")
    total = sum(len(v) for v in listas.values())
    L = [
        "# Violência e grave ameaça: catálogo × texto da lei",
        "",
        f"Gerado por `scripts/robos/auditor/conferir_violencia.py`. {total} respostas conferidas: "
        f"**{len(listas['confere'])} conferem**, **{len(listas['ressalva'])} conferem com "
        f"ressalva** (o catálogo declara a condição que a regra reconhece), "
        f"**{len(listas['diverge'])} divergem** e **{len(listas['juizo'])} pedem juízo**.",
        "",
        "O critério está em `scripts/violencia.py`: `violencia` afirma violência **dolosa** "
        "contra **pessoa**, como meio ou como núcleo do tipo. Violência contra a coisa não "
        "conta; crime culposo não conta; cláusula de resultado não descreve a conduta.",
        "",
        "## Divergências",
        "",
        "O catálogo e a lei não dizem a mesma coisa. Cada linha é uma pergunta.",
        "",
        cab,
    ]
    L += [linha(i) for i in sorted(listas["diverge"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Pedem juízo", "",
          "As regras não decidem: a violência é meio alternativo a outros não violentos, ou a "
          "palavra está em sentido que a regra não resolve.", "", cab]
    L += [linha(i) for i in sorted(listas["juizo"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Conferem com ressalva", "",
          "A regra reconhece que o tipo se consuma SEM violência mas comporta a hipótese "
          "violenta, e o catálogo declara essa hipótese em `violencia_condicao`. Os dois "
          "dizem a mesma coisa: não é divergência. A lista existe para que a condição seja "
          "revisável como texto — foi o que a decisão 8 criou, em 23/09/2026.", "", cab]
    L += [linha(i) for i in sorted(listas["ressalva"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Por regra aplicada", "",
          "| regra | respostas |", "|---|---:|"]
    contagem = collections.Counter(
        i["regra"] or "—" for v in listas.values() for i in v)
    L += [f"| {k} | {v} |" for k, v in contagem.most_common()]
    return "\n".join(L) + "\n"


def main() -> int:
    p = argparse.ArgumentParser(description="Confere violência e grave ameaça contra a lei.")
    p.add_argument("--md", metavar="ARQ", help="grava o relatório em Markdown")
    args = p.parse_args()
    listas = rodar()
    if args.md:
        Path(args.md).write_bytes(markdown(listas).encode("utf-8"))
        print(f"relatório em {args.md}")
    print(f"confere {len(listas['confere'])} | com ressalva {len(listas['ressalva'])} | "
          f"diverge {len(listas['diverge'])} | pede juízo {len(listas['juizo'])}")
    for i in listas["diverge"][:10]:
        print(f"  ~ id {i['id']} ({i['lei']} {i['artigo']}) {i['campo']}: "
              f"catálogo {i['catalogo']}, lei {i['derivado']} ({i['regra']})")
    return 3 if listas["diverge"] or listas["juizo"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
