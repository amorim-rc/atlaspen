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

from auditor.auditar import dispositivos_de  # noqa: E402
from vigia.conferir import indexar_catalogo  # noqa: E402
from violencia import classificar  # noqa: E402

_INCISO_FINAL = re.compile(r",\s*([IVXLC]+)\s*$")


def textos_do_registro(registro: dict, disp: dict, chave: str) -> tuple[str, str]:
    """(texto próprio, texto do caput). O inciso do registro entra no próprio."""
    d = disp.get(chave)
    base = disp.get(chave.split("|")[0] + "|caput")
    inciso = ""
    m = _INCISO_FINAL.search(registro.get("artigo") or "")
    if d and m:
        inciso = " ".join(
            i.get("texto", "") for i in d.incisos
            if (i.get("marcador") or "").upper() == m.group(1)
        )
    proprio = " ".join(filter(None, [d.epigrafe if d else "", d.texto if d else "", inciso]))
    caput = " ".join(filter(None, [base.epigrafe if base else "", base.texto if base else ""]))
    return proprio, caput


def rodar() -> dict[str, list[dict]]:
    listas: dict[str, list[dict]] = {"confere": [], "ressalva": [], "diverge": [], "juizo": []}
    for fonte, por_chave in indexar_catalogo().items():
        disp = dispositivos_de(fonte)
        for chave, linhas in por_chave.items():
            for registro in linhas:
                proprio, caput = textos_do_registro(registro, disp, chave)
                r = classificar(registro, proprio, caput)
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
