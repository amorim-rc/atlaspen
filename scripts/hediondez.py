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


def carregar(caminho: Path | None = None) -> dict:
    return json.loads((caminho or HEDIONDOS).read_text(encoding="utf-8"))


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
