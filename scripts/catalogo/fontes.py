# -*- coding: utf-8 -*-
"""O texto compilado de cada diploma, lido de `data/fontes.json`.

Dois mapas casados por RÓTULO exato do campo `lei`: `PLANALTO` (rótulo -> URL do
compilado) e `DIPLOMA` (rótulo -> id do diploma em `data/fontes.json`). O
primeiro põe o link de onde resolver cada contradição no relatório de
qualidade; o segundo é o que `menor_potencial` usa para reconhecer o CPM, a
LCP e a Lei de Drogas sem depender da grafia do rótulo.
"""
import json

from .caminhos import ROOT


# ── Fonte oficial por diploma (planalto.gov.br) ─────────────────────────────
# Texto COMPILADO (com as alterações posteriores), nunca o original: é ele que
# vale para conferência. Usado no relatório de qualidade, para que cada
# contradição venha com o link de onde resolvê-la.
#
# O registro vive em `data/fontes.json` — mesma fonte que o conferidor usa para
# baixar os textos (scripts/robos/nucleo/baixar.py). Antes o mapa era duplicado aqui,
# por expressão regular, e envelheceu: quatro diplomas apontavam para URLs
# "…compilado.htm" que hoje respondem 404. Uma fonte só, casada por rótulo
# exato, elimina a duplicação e mantém os links verificados pelo download.
def _carregar_fontes() -> dict:
    caminho = ROOT / "data" / "fontes.json"
    dados = json.loads(caminho.read_text(encoding="utf-8"))
    return {rotulo: f["url"] for f in dados["fontes"] for rotulo in f["rotulos"]}


PLANALTO = _carregar_fontes()


def _diplomas_por_rotulo() -> dict:
    caminho = ROOT / "data" / "fontes.json"
    dados = json.loads(caminho.read_text(encoding="utf-8"))
    return {rotulo: f["id"] for f in dados["fontes"] for rotulo in f["rotulos"]}


DIPLOMA = _diplomas_por_rotulo()


def url_planalto(lei: str) -> str:
    """Link do texto compilado do diploma, ou busca no Planalto se desconhecido."""
    url = PLANALTO.get((lei or "").strip())
    if url:
        return url
    return f"https://www.planalto.gov.br/ccivil_03/ (buscar: {lei})"
