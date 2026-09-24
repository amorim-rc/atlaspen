# -*- coding: utf-8 -*-
"""Etapa 7 da revisão fina: os eventos legislativos que o compilado não dá.

Quatro grupos, das decisões 33, 34, 37 e 38:

- **Lei 15.517/2026** (decisão 38) — criou os §§ 10 a 12 do art. 155, o inciso XI
  do § 2º e o inciso III do § 2º-A do art. 157 do CP, e os arts. 1º-A a 1º-D da
  Lei 8.176/91. O compilado dessas normas ainda não foi rebaixado com a lei nova.
- **Lei 15.348/2026** (decisão 37) — suprimiu hipóteses do art. 1º, II, da Lei
  8.176/91. É **abolitio criminis parcial**: conduta que era típica deixou de
  ser. Natureza penal nova, ao lado de incriminadora, *in pejus* e *in mellius*.
- **CP, art. 151** (decisão 34) — revogado tacitamente pela Lei 6.538/78, que
  regula inteiramente a matéria (LINDB, art. 2º, § 1º). Revogação tácita não
  aparece em compilado nenhum: quem a reconhece é o intérprete.
- **CP, art. 171, § 5º** (decisão 33) — a Lei 15.229/2025 alterou o inciso III.

Uso:
    python scripts/revisao/eventos_2026_09_23.py            # simula
    python scripts/revisao/eventos_2026_09_23.py --aplicar  # grava
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

L15517 = {
    "norma": "Lei nº 15.517", "ano": 2026, "natureza": "legislativa", "origem": "manual",
    "data_da_norma": "2026-09-22", "publicacao": "2026-09-23", "vigencia": "2026-09-23",
}
NOVOS = [
    # ── Lei 15.517/2026, decisão 38 ──────────────────────────────────────────
    *[{**L15517, "dispositivo": d, "evento": "criacao",
       "anotacao": "Incluído pela Lei nº 15.517, de 2026"}
      for d in ("cp|art. 155, §10", "cp|art. 155, §11", "cp|art. 155, §12",
                "cp|art. 157, §2º, xi", "cp|art. 157, §2º-a, iii",
                "combustiveis-8176|art. 1-a", "combustiveis-8176|art. 1-b",
                "combustiveis-8176|art. 1-c", "combustiveis-8176|art. 1-d")],
    # ── Decisão 34: a revogação tácita do art. 151 do CP ─────────────────────
    {"dispositivo": "cp|art. 151, caput", "evento": "revogacao",
     "norma": "Lei nº 6.538", "ano": 1978, "natureza": "legislativa", "origem": "manual",
     "data_da_norma": "1978-06-22", "publicacao": "1978-06-23", "vigencia": "1978-06-23",
     "anotacao": "Revogado tacitamente pelo art. 40 da Lei nº 6.538, de 1978, que regula "
                 "inteiramente a matéria (LINDB, art. 2º, § 1º)",
     "nota_de_vigencia": "Revogação TÁCITA: não consta do compilado, porque nenhuma lei a "
                         "declarou. Quem a reconhece é o intérprete, e por isso o evento é "
                         "manual. Decisão 34 da revisão fina de 23/09/2026."},
    {"dispositivo": "cp|art. 151, §1º, i", "evento": "revogacao",
     "norma": "Lei nº 6.538", "ano": 1978, "natureza": "legislativa", "origem": "manual",
     "data_da_norma": "1978-06-22", "publicacao": "1978-06-23", "vigencia": "1978-06-23",
     "anotacao": "Revogado tacitamente pelo art. 40, § 1º, da Lei nº 6.538, de 1978",
     "nota_de_vigencia": "Revogação TÁCITA, como a do caput. Decisão 34."},
    # ── Decisão 33: a Lei 15.229/2025 no § 5º do art. 171 ───────────────────
    {"dispositivo": "cp|art. 171, §5º", "evento": "alteracao",
     "norma": "Lei nº 15.229", "ano": 2025, "natureza": "legislativa", "origem": "manual",
     "data_da_norma": "2025-10-03", "publicacao": "2025-10-03", "vigencia": "2025-10-03",
     "anotacao": "Redação dada ao inciso III pela Lei nº 15.229, de 2025 — a vítima "
                 "protegida passa de \"pessoa com deficiência mental\" a \"pessoa com "
                 "deficiência\""},
]

# O evento que muda de natureza penal (decisão 37).
ABOLITIO = {
    "dispositivo": "combustiveis-8176|art. 1, ii", "norma": "Lei nº 15.348",
    "natureza_penal": "abolitio-parcial",
    "nota_penal": "Abolitio criminis PARCIAL: a Lei 15.348/2026 suprimiu do inciso II as "
                  "hipóteses de motores não automotivos, saunas, caldeiras e aquecimento de "
                  "piscinas, que deixaram de ser típicas. Não é novatio legis in mellius — a "
                  "conduta não passou a ser punida mais brandamente, deixou de ser punida. "
                  "Ressalva: pode haver subsunção ao art. 56 da Lei 9.605/98. Decisão 37.",
}


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--aplicar", action="store_true")
    args = p.parse_args()

    h = json.loads(HISTORICO.read_text(encoding="utf-8"))
    existentes = {(e["dispositivo"], e["evento"], e.get("norma")) for e in h["eventos"]}

    a_inserir = [e for e in NOVOS
                 if (e["dispositivo"], e["evento"], e.get("norma")) not in existentes]
    for e in a_inserir:
        print(f"  + {e['dispositivo']:34s} {e['evento']:11s} {e['norma']}")
    if len(a_inserir) < len(NOVOS):
        print(f"  ({len(NOVOS) - len(a_inserir)} já existiam e não foram duplicados)")

    alvo = [e for e in h["eventos"]
            if e["dispositivo"] == ABOLITIO["dispositivo"] and e.get("norma") == ABOLITIO["norma"]]
    print(f"\n  abolitio parcial: {len(alvo)} evento(s) do art. 1º, II da Lei 8.176 "
          f"pela Lei 15.348")
    if not alvo:
        print("  ERRO: o evento da Lei 15.348 não foi encontrado.", file=sys.stderr)
        return 2

    if not args.aplicar:
        print("\nsimulação: nada foi gravado. Use --aplicar para gravar.")
        return 0

    h["eventos"].extend(a_inserir)
    for e in alvo:
        e["natureza_penal"] = ABOLITIO["natureza_penal"]
        e["nota_penal"] = ABOLITIO["nota_penal"]
    h["_meta"]["natureza_penal"] = (
        "Em que direção a lei andou, para a nota de atualização: `incriminadora` (a conduta "
        "era atípica), `pejus` (ficou mais grave), `mellius` (ficou mais branda) e "
        "`abolitio-parcial` (parte da conduta deixou de ser típica). A quarta entrou em "
        "23/09/2026, pela decisão 37. A régua que separa a última da terceira: *in mellius* "
        "é a conduta que SEGUE punível com tratamento mais favorável; abolitio é a que deixa "
        "de ser típica. Presente só onde foi decidido; a ausência não significa neutralidade."
    )
    HISTORICO.write_bytes((json.dumps(h, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(f"\ngravado: {len(a_inserir)} eventos novos, {len(alvo)} marcado(s) como "
          f"abolitio parcial")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
