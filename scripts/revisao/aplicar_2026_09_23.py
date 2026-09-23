# -*- coding: utf-8 -*-
"""Aplica ao catálogo as mudanças por (id, campo) da revisão fina de 23/09/2026.

Lê `auditoria/revisao-2026-09-23/anexo-a.json` e escreve em `data/crimes.json`,
que é a FONTE — o derivado sai de `transform_data.py` depois.

**Por padrão só simula.** Sem `--aplicar` nada é gravado: sai um relatório do
que mudaria, e é ele que vai ao mantenedor. Foi condição posta por ele na regra
0.5 do pacote, e existe porque 413 mudanças em 251 registros não se conferem
relendo um diff.

**Recusa mudança cujo valor de origem não confere.** Cada mudança declara `de`,
o valor que o campo tinha em 23/09/2026. Se o catálogo mudou desde então, a
mudança não é aplicada: ela foi decidida sobre um texto que não é mais o que
está lá. O `de` longo vem truncado com reticências no pacote, e nesse caso a
comparação é por prefixo — o que basta para pegar troca de valor, que é o risco.

Uso:
    python scripts/revisao/aplicar_2026_09_23.py                  # simula
    python scripts/revisao/aplicar_2026_09_23.py --md relatorio.md
    python scripts/revisao/aplicar_2026_09_23.py --aplicar        # grava
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[2]
CATALOGO = RAIZ / "data" / "crimes.json"
ANEXO = RAIZ / "auditoria" / "revisao-2026-09-23" / "anexo-a.json"

# O pacote trunca o `de` longo com reticências; a comparação passa a ser por
# prefixo. Reticências de três pontos e o caractere único, que o Word gera.
RETICENCIAS = ("…", "...")


def valor_alvo(m: dict, textos: dict):
    """O valor que a mudança quer gravar. `para: null` esvazia o campo."""
    if "para_texto" in m:
        return textos[m["para_texto"]]
    return m.get("para")


def confere_origem(atual, esperado) -> bool:
    """O campo hoje é o que a decisão viu em 23/09?"""
    if esperado is None:
        # "sem valor" abrange campo ausente, nulo e string vazia: os três dizem
        # a mesma coisa no catálogo, e o pacote não os distingue.
        return atual in (None, "")
    if atual is None:
        return False
    a, e = str(atual), str(esperado)
    if e.endswith(RETICENCIAS):
        for r in RETICENCIAS:
            if e.endswith(r):
                return a.startswith(e[: -len(r)])
    return a == e


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--aplicar", action="store_true",
                   help="grava em data/crimes.json (sem isto, só simula)")
    p.add_argument("--md", metavar="ARQUIVO", help="escreve o relatório em markdown")
    args = p.parse_args()

    anexo = json.loads(ANEXO.read_text(encoding="utf-8"))
    textos, mudancas = anexo["textos"], anexo["mudancas"]
    crimes = json.loads(CATALOGO.read_text(encoding="utf-8"))
    porid = {c["id"]: c for c in crimes}

    aplicaveis, iguais, recusadas, ausentes, adiadas = [], [], [], [], []

    for m in mudancas:
        if m["campo"] == "(aposentar)":
            adiadas.append(m)                      # etapa 5, fora do aplicador
            continue
        c = porid.get(m["id"])
        if c is None:
            ausentes.append(m)
            continue
        atual, novo = c.get(m["campo"]), valor_alvo(m, textos)
        if not confere_origem(atual, m.get("de")):
            recusadas.append((m, atual))
            continue
        if atual == novo or (atual in (None, "") and novo in (None, "")):
            iguais.append(m)
            continue
        aplicaveis.append((m, atual, novo))

    # ── relatório ───────────────────────────────────────────────────────────
    L = ["# Revisão fina de 23/09/2026 — simulação da aplicação", "",
         f"Anexo A: **{len(mudancas)} mudanças** declaradas, em "
         f"{len({m['id'] for m in mudancas})} registros.", "",
         "| resultado | mudanças |", "|---|---:|",
         f"| aplicáveis (o valor de origem confere) | {len(aplicaveis)} |",
         f"| já estavam no valor decidido | {len(iguais)} |",
         f"| **recusadas** (o catálogo mudou desde 23/09) | **{len(recusadas)}** |",
         f"| id inexistente no catálogo | {len(ausentes)} |",
         f"| adiadas para a etapa 5 (aposentadoria) | {len(adiadas)} |", ""]

    if recusadas:
        L += ["## Recusadas — o valor de origem não confere", "",
              "A decisão foi tomada sobre um texto que não é mais o que está no catálogo. "
              "**Nenhuma delas é aplicada**, nem com `--aplicar`.", "",
              "| id | campo | o pacote viu | está hoje | decisão |", "|---|---|---|---|---|"]
        for m, atual in recusadas:
            L.append(f"| {m['id']} | `{m['campo']}` | `{str(m.get('de'))[:60]}` | "
                     f"`{str(atual)[:60]}` | {m['decisao']} |")
        L.append("")

    if ausentes:
        L += ["## Id inexistente no catálogo", ""]
        L += [f"- id {m['id']}, campo `{m['campo']}` (decisão {m['decisao']})" for m in ausentes]
        L.append("")

    por_campo: dict[str, int] = {}
    por_decisao: dict[str, int] = {}
    for m, _, _ in aplicaveis:
        por_campo[m["campo"]] = por_campo.get(m["campo"], 0) + 1
        por_decisao[str(m["decisao"])] = por_decisao.get(str(m["decisao"]), 0) + 1

    L += ["## O que muda, por campo", "", "| campo | mudanças |", "|---|---:|"]
    L += [f"| `{k}` | {v} |" for k, v in sorted(por_campo.items(), key=lambda x: -x[1])]
    L += ["", "## O que muda, por decisão", "", "| decisão | mudanças |", "|---|---:|"]
    L += [f"| {k} | {v} |" for k, v in sorted(por_decisao.items(), key=lambda x: -x[1])]

    L += ["", "## Mudança a mudança", "",
          "| id | dispositivo | campo | de | para | decisão |", "|---|---|---|---|---|---|"]
    for m, atual, novo in aplicaveis:
        c = porid[m["id"]]
        de = "—" if atual in (None, "") else f"`{str(atual)[:45]}`"
        para = "*(esvaziado)*" if novo in (None, "") else f"`{str(novo)[:45]}`"
        L.append(f"| {m['id']} | {c['lei'][:16]} {c['artigo'][:26]} | `{m['campo']}` | "
                 f"{de} | {para} | {m['decisao']} |")
    L.append("")

    texto = "\n".join(L)
    if args.md:
        Path(args.md).write_bytes(texto.encode("utf-8"))
        print(f"relatório em {args.md}")

    print(f"aplicáveis {len(aplicaveis)} | já no valor {len(iguais)} | "
          f"RECUSADAS {len(recusadas)} | id ausente {len(ausentes)} | adiadas {len(adiadas)}")

    if not args.aplicar:
        print("simulação: nada foi gravado. Use --aplicar para gravar.")
        return 0

    if recusadas:
        print("ERRO: há mudanças recusadas. Resolva-as antes de aplicar.", file=sys.stderr)
        return 2

    for m, _, novo in aplicaveis:
        porid[m["id"]][m["campo"]] = novo
    CATALOGO.write_bytes((json.dumps(crimes, ensure_ascii=False, indent=2) + "\n")
                         .encode("utf-8"))
    print(f"gravado: {len(aplicaveis)} mudanças em {CATALOGO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
