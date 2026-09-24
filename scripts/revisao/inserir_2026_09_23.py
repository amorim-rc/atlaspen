# -*- coding: utf-8 -*-
"""Insere no catálogo os registros novos do Anexo B da revisão fina de 23/09/2026.

Dezoito tipos: sete da Lei 15.517/2026 (decisão 38), dez da varredura do Livro
II do Código Penal Militar contra o rol (decisão 29) e um da Lei 6.538/78
(decisão 34).

**O id é append-only.** Cada registro novo recebe `max(id em uso, id
aposentado) + 1`, na regra do `CONTRIBUTING.md` e do `validar_ids`. Incluir o
aposentado no máximo não é preciosismo: retirar o topo da numeração e voltar a
calcular `max + 1` devolveria um número já usado, e o id é a URL pública.

Como o aplicador do Anexo A, **por padrão só simula**.

Uso:
    python scripts/revisao/inserir_2026_09_23.py            # simula
    python scripts/revisao/inserir_2026_09_23.py --aplicar  # grava
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
APOSENTADOS = RAIZ / "data" / "ids-aposentados.json"
ANEXO_B = RAIZ / "auditoria" / "revisao-2026-09-23" / "anexo-b.json"


def proximo_id(crimes: list) -> int:
    em_uso = max(c["id"] for c in crimes)
    if APOSENTADOS.exists():
        dados = json.loads(APOSENTADOS.read_text(encoding="utf-8"))
        itens = dados.get("aposentados", dados) if isinstance(dados, dict) else dados
        ids = [x["id"] for x in itens if isinstance(x, dict) and "id" in x]
        if ids:
            em_uso = max(em_uso, max(ids))
    return em_uso + 1


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--aplicar", action="store_true", help="grava em data/crimes.json")
    args = p.parse_args()

    crimes = json.loads(CATALOGO.read_text(encoding="utf-8"))
    novos = json.loads(ANEXO_B.read_text(encoding="utf-8"))
    existentes = {(c["lei"], c["artigo"]) for c in crimes}

    a_inserir, ja_existem = [], []
    proximo = proximo_id(crimes)
    for r in novos:
        chave = (r["lei"], r["artigo"])
        if chave in existentes:
            ja_existem.append(r)
            continue
        a_inserir.append({"id": proximo, **r})
        existentes.add(chave)
        proximo += 1

    print(f"primeiro id livre: {proximo_id(crimes)}")
    for r in a_inserir:
        print(f"  {r['id']:5d}  {r['lei'][:20]:20s} {r['artigo'][:34]:34s} "
              f"{r['pena_min']}-{r['pena_max']} {r['tipo_pena'][:9]}")
    for r in ja_existem:
        print(f"  JÁ EXISTE: {r['lei']} {r['artigo']} — não inserido")
    print(f"\n{len(a_inserir)} a inserir, {len(ja_existem)} já existentes.")

    if not args.aplicar:
        print("simulação: nada foi gravado. Use --aplicar para gravar.")
        return 0
    if ja_existem:
        print("ERRO: há registro do Anexo B que já existe no catálogo.", file=sys.stderr)
        return 2

    crimes.extend(a_inserir)
    CATALOGO.write_bytes((json.dumps(crimes, ensure_ascii=False, indent=2) + "\n")
                         .encode("utf-8"))
    print(f"gravado: {len(a_inserir)} registros novos em {CATALOGO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
