# -*- coding: utf-8 -*-
"""Aposenta o id 559 (etapa 5 da revisão fina de 23/09/2026), com redirecionamento.

O 559 e o 1508 são o MESMO dispositivo — o art. 326-B do Código Eleitoral. O 559
estava rotulado pela lei que o criou, a Lei 14.192/21, e não pelo diploma em que
o crime vive: é a armadilha 5 do README dos robôs, e foi assim que o dispositivo
entrou duas vezes.

**Nada é apagado.** O registro sai do catálogo e entra em `data/ids-aposentados.json`,
com data, motivo e destino, para que o id nunca seja reatribuído — ele já foi URL
pública, e um link antigo apontando para outro crime é falha silenciosa. O
redirecionamento para o 1508 é acrescentado à mão em `src/site/redirecionamentos.ts`.

Uso:
    python scripts/revisao/aposentar_2026_09_23.py            # simula
    python scripts/revisao/aposentar_2026_09_23.py --aplicar  # grava
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

ID, DESTINO, DATA = 559, 1508, "2026-09-23"
MOTIVO = (
    "Duplicata do art. 326-B do Código Eleitoral. O registro estava rotulado pela lei "
    "que criou o dispositivo (Lei 14.192/21) e não pelo diploma em que ele vive, e por "
    "isso não colidiu com o id 1508, que traz o mesmo artigo sob o rótulo do CE. É a "
    "armadilha 5 do README dos robôs. Decisão C13 da revisão fina de 23/09/2026."
)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--aplicar", action="store_true")
    args = p.parse_args()

    crimes = json.loads(CATALOGO.read_text(encoding="utf-8"))
    alvo = next((c for c in crimes if c["id"] == ID), None)
    destino = next((c for c in crimes if c["id"] == DESTINO), None)
    if alvo is None:
        print(f"id {ID} já não está no catálogo — nada a fazer.")
        return 0
    if destino is None:
        print(f"ERRO: o destino {DESTINO} não existe.", file=sys.stderr)
        return 2

    print(f"sai   {ID}: {alvo['lei']} | {alvo['artigo']}")
    print(f"      {alvo['crime'][:80]}")
    print(f"fica {DESTINO}: {destino['lei']} | {destino['artigo']}")
    print(f"      {destino['crime'][:80]}")

    registro = json.loads(APOSENTADOS.read_text(encoding="utf-8"))
    ja = {i for g in registro.get("aposentados", []) for i in g["ids"]}
    if ID in ja:
        print(f"id {ID} já consta em ids-aposentados.json.")
        return 0

    if not args.aplicar:
        print("\nsimulação: nada foi gravado. Use --aplicar para gravar.")
        return 0

    crimes = [c for c in crimes if c["id"] != ID]
    CATALOGO.write_bytes((json.dumps(crimes, ensure_ascii=False, indent=2) + "\n")
                         .encode("utf-8"))
    registro.setdefault("aposentados", []).append({
        "data": DATA, "ids": [ID], "motivo": MOTIVO, "destino": DESTINO,
        "redirecionamento": f"/tipos/{ID} -> /tipos/{DESTINO}",
    })
    APOSENTADOS.write_bytes((json.dumps(registro, ensure_ascii=False, indent=2) + "\n")
                            .encode("utf-8"))
    print(f"\ngravado: {ID} fora do catálogo e registrado em ids-aposentados.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
