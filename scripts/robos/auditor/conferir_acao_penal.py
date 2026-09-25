# -*- coding: utf-8 -*-
"""Confere a espécie de ação penal do catálogo contra as regras do diploma.

Varre cada diploma atrás das regras de ação penal ("somente se procede mediante
queixa", "dependerá de representação", "procede-se mediante requisição do
Ministro da Justiça"), descobre o alcance de cada uma — o próprio artigo, os
artigos que ela lista, ou a seção, o capítulo e o título em que está — e diz,
para cada registro, qual regra o alcança e com que fundamento.

Três listas: **confere**, **diverge** e **pede juízo**. Não escreve no catálogo.

Uso:
    python scripts/robos/auditor/conferir_acao_penal.py            # no terminal
    python scripts/robos/auditor/conferir_acao_penal.py --md ARQ   # em Markdown

Saídas: 0 = nada a rever; 3 = há divergência ou caso a julgar.
"""
from __future__ import annotations

import argparse
import collections
import glob
import html
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(RAIZ / "scripts"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import acao_penal as ap  # noqa: E402
from auditor.auditar import dispositivos_de  # noqa: E402
from vigia.conferir import indexar_catalogo  # noqa: E402

# A privada personalíssima é ESPÉCIE da privada: o art. 236 do CP restringe a
# queixa ao contraente enganado, e a regra do diploma não desce a esse detalhe.
COMPATIVEL = {'Ação Penal Privada Personalíssima': 'Ação Penal Privada'}


def texto_bruto(fonte: str) -> str:
    arquivos = sorted(glob.glob(str(RAIZ / "crawler" / "snapshots" / fonte / "*.html")))
    if not arquivos:
        return ""
    cru = re.sub(r"<[^>]+>", " ", Path(arquivos[-1]).read_text(encoding="utf-8"))
    return re.sub(r" {2,}", " ", html.unescape(re.sub(r"\s+", " ", cru)).replace("\xa0", " "))


def rodar() -> dict[str, list[dict]]:
    listas: dict[str, list[dict]] = {"confere": [], "ressalva": [], "diverge": [], "juizo": []}
    for fonte, por_chave in indexar_catalogo().items():
        disp = dispositivos_de(fonte)
        bruto = texto_bruto(fonte)
        regras = ap.achar_regras(disp, bruto)
        marcadores, posicoes = ap.topografia(bruto), ap.posicoes_dos_artigos(bruto)
        for chave, linhas in por_chave.items():
            artigo = chave.split("|")[0].replace("Art. ", "")
            lugar = ap.onde_esta(artigo, marcadores, posicoes)
            for registro in linhas:
                c = ap.classificar(registro, regras, lugar)
                item = {
                    "id": registro["id"], "lei": registro["lei"], "artigo": registro["artigo"],
                    "crime": registro["crime"], "catalogo": registro["acao"],
                    "derivado": c.especie, "regra": c.regra, "fundamento": c.fundamento,
                    "condicao_no_registro": bool(registro.get("acao_condicao")),
                }
                item["fundamento_publicado"] = ap.fundamento_de(registro, c)
                atual = COMPATIVEL.get(registro["acao"], registro["acao"])
                if registro.get("acao_condicao"):
                    # CONFERE COM RESSALVA (item 1.3 da revisão de 23/09/2026,
                    # ampliado pela decisão C1 de 24/09). Condição declarada é
                    # decisão TOMADA: o registro diz "esta é a espécie, e ela
                    # depende de circunstância do caso". A regra que enxerga a
                    # mesma dependência não está discordando — está confirmando.
                    #
                    # Antes, só entrava aqui quando a espécie derivada também
                    # batia; quando divergia, o registro ia para "pede juízo" ao
                    # lado dos que ninguém olhou. Mas é precisamente onde há
                    # condição que a espécie publicada é a de UMA das hipóteses,
                    # e comparar as duas por igualdade não diz nada.
                    #
                    # O que sobra para o mantenedor é o inverso, e é a lista que
                    # importa: espécie divergente SEM condição declarada.
                    listas["ressalva"].append(item)
                elif c.ressalva:
                    listas["juizo"].append(item)
                elif c.especie == atual:
                    listas["confere"].append(item)
                else:
                    listas["diverge"].append(item)
    return listas


def linha(i: dict) -> str:
    return (f"| {i['id']} | {i['lei']} | {i['artigo']} | {i['crime'][:55]} | {i['catalogo']} | "
            f"{i['derivado'] or '—'} | {i['regra'] or '—'} | "
            f"{(i['fundamento'] or '').replace('|', '/')[:110]} |")


def markdown(listas: dict[str, list[dict]]) -> str:
    cab = ("| id | diploma | dispositivo | tipo | catálogo | derivado | regra | fundamento |\n"
           "|---|---|---|---|---|---|---|---|")
    total = sum(len(v) for v in listas.values())
    L = [
        "# Ação penal: catálogo × regras do diploma",
        "",
        f"Gerado por `scripts/robos/auditor/conferir_acao_penal.py`. {total} registros "
        f"**{len(listas['confere'])} conferem**, **{len(listas['ressalva'])} conferem com "
        f"ressalva** (a espécie bate e o registro declara a condição), "
        f"**{len(listas['diverge'])} divergem** e **{len(listas['juizo'])} pedem juízo**.",
        "",
        "O método está em `scripts/acao_penal.py`: a espécie vem do dispositivo que a define, "
        "e onde nenhuma regra do diploma alcança o artigo vale a regra geral do art. 100 do CP "
        "— um silêncio verificado, e não presumido.",
        "",
        "## Divergências", "", cab,
    ]
    L += [linha(i) for i in sorted(listas["diverge"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Pedem juízo", "",
          "A regra existe mas tem ressalva ('salvo', 'se a propriedade é particular', 'em "
          "prejuízo de cônjuge'), ou o próprio registro já declara a condição em "
          "`acao_condicao`. A espécie depende do caso, e não do tipo.", "", cab]
    L += [linha(i) for i in sorted(listas["juizo"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Conferem com ressalva", "",
          "A espécie derivada bate com a publicada E o registro declara a condição em "
          "`acao_condicao`. Não é pergunta: é resposta completa, com a hipótese à vista.", "",
          cab]
    L += [linha(i) for i in sorted(listas["ressalva"], key=lambda x: (x["lei"], x["id"]))]
    L += ["", "## Por regra aplicada", "", "| regra | registros |", "|---|---:|"]
    contagem = collections.Counter(i["regra"] or "—" for v in listas.values() for i in v)
    L += [f"| {k} | {v} |" for k, v in contagem.most_common()]
    return "\n".join(L) + "\n"


def main() -> int:
    p = argparse.ArgumentParser(description="Confere a ação penal contra as regras do diploma.")
    p.add_argument("--md", metavar="ARQ", help="grava o relatório em Markdown")
    args = p.parse_args()
    listas = rodar()
    if args.md:
        Path(args.md).write_bytes(markdown(listas).encode("utf-8"))
        print(f"relatório em {args.md}")
    print(f"confere {len(listas['confere'])} | com ressalva {len(listas['ressalva'])} | "
          f"diverge {len(listas['diverge'])} | pede juízo {len(listas['juizo'])}")
    for i in listas["diverge"][:10]:
        print(f"  ~ id {i['id']} ({i['lei']} {i['artigo']}): catálogo {i['catalogo']}, "
              f"lei {i['derivado']} — {i['fundamento'][:80]}")
    return 3 if listas["diverge"] or listas["juizo"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
