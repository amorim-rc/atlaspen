# -*- coding: utf-8 -*-
"""Deixa os robôs importáveis e carrega as fixtures de HTML.

Dois caminhos, e a razão de serem dois: `scripts/robos` traz os pacotes dos
robôs e do núcleo; `scripts` traz o `pena_parser` e o `transform_data`, que são
do construtor do catálogo e não pertencem a robô nenhum.
"""
import sys
from pathlib import Path

import pytest

ROBOS = Path(__file__).resolve().parent.parent
RAIZ = ROBOS.parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))
sys.path.insert(0, str(ROBOS))
FIXTURES = ROBOS / "fixtures"


@pytest.fixture
def carregar():
    """carregar('cp-art121') -> HTML congelado daquele trecho do Planalto."""
    def _ler(nome: str) -> str:
        return (FIXTURES / f"{nome}.html").read_text(encoding="utf-8")
    return _ler
