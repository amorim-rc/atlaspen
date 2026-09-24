# -*- coding: utf-8 -*-
"""Etapa 7 da revisão fina de 23/09/2026: as datas de publicação e de vigência.

O `_meta` de `data/historico-legislativo.json` declarava a pendência desde que o
arquivo nasceu: "`publicacao` e `vigencia` ainda não são preenchidas: o
compilado dá só o ano, e a data exata vem da lei alteradora". A decisão 32
fechou essa lacuna para as leis que a revisão tocou — conferidas no DOU pelo
Sentinela em 23/09/2026 —, e este script as grava.

**Por que a data importa, e não é enfeite.** A nota de atualização usa a data de
VIGÊNCIA, não a da lei; e o motor escolhe a redação do art. 112 da LEP pela data
do fato (`src/lib/tempo.ts`). Uma data errada aqui é um cálculo errado lá.

Uso:
    python scripts/revisao/datas_2026_09_23.py            # simula
    python scripts/revisao/datas_2026_09_23.py --aplicar  # grava
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[2]
HISTORICO = RAIZ / "data" / "historico-legislativo.json"

# (norma, data da lei, publicação no DOU, vigência, observação)
# Conferidas no DOU pelo robô do Sentinela em 23/09/2026 (decisão 32).
DATAS = [
    ("Lei nº 15.280", "2025-12-05", "2025-12-08", "2025-12-08", None),
    ("Lei Complementar nº 225", "2026-01-08", "2026-01-09", None,
     "vigência escalonada: conferir o artigo de vigência para os arts. 168-A e 337-A do CP"),
    ("Lei nº 15.348", "2026-02-13", "2026-02-13", "2026-02-13", "DOU de 13/02/2026, edição extra"),
    ("Lei nº 15.353", "2026-03-08", "2026-03-08", "2026-03-08", "DOU de 08/03/2026, edição extra"),
    ("Lei nº 15.355", "2026-03-11", "2026-03-12", "2026-03-12", None),
    ("Lei nº 15.358", "2026-03-24", "2026-03-25", "2026-03-25", None),
    ("Lei nº 15.383", "2026-04-09", "2026-04-10", "2026-04-10", None),
    ("Lei nº 15.384", "2026-04-09", "2026-04-10", "2026-04-10",
     "retificação da ementa no DOU de 15/04/2026, seção 1, p. 17 — sem efeito penal"),
    ("Lei nº 15.397", "2026-04-30", "2026-05-04", "2026-05-04", None),
    ("Lei nº 15.402", "2026-05-08", "2026-05-08", "2026-05-08", "DOU de 08/05/2026, edição extra"),
    ("Lei nº 15.410", "2026-05-20", "2026-05-21", "2026-05-21", None),
    ("Lei nº 15.425", "2026-06-03", "2026-06-08", "2026-06-08", None),
    ("Lei nº 15.438", "2026-06-18", "2026-06-19", "2026-06-19", None),
    ("Lei nº 15.455", "2026-07-01", "2026-07-02", "2026-07-02", None),
    ("Lei nº 15.487", "2026-08-06", "2026-08-07", "2026-08-07", None),
    ("Lei nº 15.517", "2026-09-22", "2026-09-23", "2026-09-23", None),
    # Decisão 33: as duas leis do § 5º do art. 171 do CP.
    ("Lei nº 13.964", "2019-12-24", "2019-12-24", "2020-01-23",
     "DOU de 24/12/2019, edição extra; vigência em 30 dias (art. 20)"),
    ("Lei nº 15.229", "2025-10-03", "2025-10-03", "2025-10-03", None),
]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--aplicar", action="store_true")
    args = p.parse_args()

    h = json.loads(HISTORICO.read_text(encoding="utf-8"))
    por_norma = {n: (lei, pub, vig, obs) for n, lei, pub, vig, obs in DATAS}

    tocados, sem_evento = 0, []
    achados: dict[str, int] = {}
    for e in h["eventos"]:
        dados = por_norma.get(e.get("norma"))
        if not dados:
            continue
        achados[e["norma"]] = achados.get(e["norma"], 0) + 1
        if args.aplicar:
            lei, pub, vig, obs = dados
            e["data_da_norma"] = lei
            e["publicacao"] = pub
            if vig:
                e["vigencia"] = vig
            if obs:
                e["nota_de_vigencia"] = obs
        tocados += 1

    for n in por_norma:
        if n not in achados:
            sem_evento.append(n)

    for n, q in sorted(achados.items()):
        lei, pub, vig, obs = por_norma[n]
        print(f"  {n:26s} {q:3d} evento(s)  lei {lei}  DOU {pub}  vigência {vig or '(escalonada)'}")
    for n in sem_evento:
        print(f"  {n:26s}   sem evento no histórico — nada a datar")

    print(f"\n{tocados} eventos datados, de {len(achados)} normas.")
    if not args.aplicar:
        print("simulação: nada foi gravado. Use --aplicar para gravar.")
        return 0

    h["_meta"]["pendente"] = (
        "`publicacao` e `vigencia` estão preenchidas para as leis que a revisão fina de "
        "23/09/2026 tocou (decisão 32), conferidas no DOU pelo Sentinela. Para as demais "
        "continua valendo o limite de origem: o compilado dá só o ano, e a data exata vem "
        "da lei alteradora."
    )
    HISTORICO.write_bytes((json.dumps(h, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(f"gravado em {HISTORICO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
