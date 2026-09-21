# -*- coding: utf-8 -*-
"""A chave canônica do dispositivo de um registro (`scripts/dispositivo_canonico.py`).

O campo `artigo` é texto para o leitor; a chave é a do histórico legislativo. Cada
caso abaixo é uma forma que o catálogo usa de verdade.
"""
import pytest

import dispositivo_canonico as dc

ROTULOS = {"CP": "cp", "CPM (DL 1.001/69)": "cpm", "CE (Lei 4.737/65)": "ce",
           "Lei 14.811/24": "cp", "Lei 2.889/56": "genocidio-2889"}


@pytest.mark.parametrize("lei, artigo, chave", [
    ("CP", "Art. 121, caput", "cp|art. 121, caput"),
    ("CP", "Art. 121", "cp|art. 121, caput"),
    ("CP", "Art. 121, §2º, I", "cp|art. 121, §2º, i"),
    ("CP", "Art. 121, § 3º", "cp|art. 121, §3º"),
    ("CP", "Art. 121, §2º, VII, a", "cp|art. 121, §2º, vii, a"),
    ("CP", "Art. 155, §4º-A", "cp|art. 155, §4º-a"),
    ("CP", "Art. 163, §único, I", "cp|art. 163, parágrafo único, i"),
    ("CP", "Art. 163, parágrafo único", "cp|art. 163, parágrafo único"),
    ("CE (Lei 4.737/65)", "Art. 336, par. único", "ce|art. 336, parágrafo único"),
    # O parêntese é recorte do catálogo dentro do mesmo dispositivo.
    ("Lei 14.811/24", "Art. 146-A, caput (CP)", "cp|art. 146-a, caput"),
    ("CE (Lei 4.737/65)", "Art. 350 (se o documento é público)", "ce|art. 350, caput"),
    ("CP", "Art. 158, §1º (concurso de pessoas)", "cp|art. 158, §1º"),
    # "Nª parte" também.
    ("CP", "Art. 121, §4º, 2ª parte", "cp|art. 121, §4º"),
    # O "c/c" diz de onde vem a pena, e não onde o tipo está.
    ("CPM (DL 1.001/69)", "Art. 405 c/c art. 242, §3º", "cpm|art. 405, caput"),
    ("Lei 2.889/56", "Art. 2º c/c art. 1º, c", "genocidio-2889|art. 2, caput"),
])
def test_chave(lei, artigo, chave):
    assert dc.chave({"lei": lei, "artigo": artigo}, ROTULOS) == chave


def test_diploma_sem_fonte_nao_ganha_chave():
    assert dc.chave({"lei": "Lei inventada", "artigo": "Art. 1º"}, ROTULOS) is None


def test_unidade_que_a_lei_nao_tem_para_a_chave():
    """Sem inventar o resto: "Art. 5º, alínea z do anexo" para no artigo."""
    assert dc.chave({"lei": "CP", "artigo": "Art. 5º, do anexo"}, ROTULOS) == "cp|art. 5, caput"
