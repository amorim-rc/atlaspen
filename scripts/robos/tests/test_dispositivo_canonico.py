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


class TestGrafiaCanonica:
    """A régua de grafia do campo `artigo` (débito técnico 4, fechado em 25/09/2026).

    Em 23/09/2026, 37 registros escreviam `§ 2º` com espaço contra 375 sem, e a
    exclusão que tirava a forma culposa do art. 273 do CP do rol de hediondos
    nunca casou. A normalização consertou o dado; a régua impede a volta.
    """

    def test_aceita_as_formas_do_catalogo(self):
        from dispositivo_canonico import problemas_de_grafia
        for a in ["Art. 121", "Art. 121, caput", "Art. 121, §2º, I", "Art. 129, §12",
                  "Art. 163, parágrafo único, I", "Art. 146, par. único", "Art. 333, §único",
                  "Art. 1º, c", "Art. 408, par. único, a)", "Art. 2º c/c art. 1º, a",
                  "Art. 129, §12, II c/c caput", "Art. 122, §3º c/c §1º",
                  "Art. 350 (se o documento é particular)", "Art. 1º, III a XXIII",
                  "Art. 121, §4º, 1ª parte", "Art. 359-M", "Art. 7º-B, caput", "Art. 121, §2º-D"]:
            assert problemas_de_grafia(a) == [], a

    def test_todo_o_catalogo_passa(self):
        """A régua é a do catálogo de hoje: registro que ela não lê é registro a corrigir."""
        import json
        from pathlib import Path
        from dispositivo_canonico import problemas_de_grafia
        raiz = Path(__file__).resolve().parents[3]
        crimes = json.loads((raiz / "data" / "crimes.json").read_text(encoding="utf-8"))
        ruins = [(c["id"], c["artigo"], problemas_de_grafia(c["artigo"])) for c in crimes
                 if problemas_de_grafia(c["artigo"])]
        assert ruins == []

    def test_acusa_o_espaco_depois_do_paragrafo(self):
        from dispositivo_canonico import problemas_de_grafia
        assert any("§" in m for m in problemas_de_grafia("Art. 273, § 1º-B"))

    def test_acusa_as_outras_variacoes(self):
        from dispositivo_canonico import problemas_de_grafia
        assert problemas_de_grafia("art. 121")
        assert problemas_de_grafia("Art.121")
        assert problemas_de_grafia("Art. 121,I")
        assert problemas_de_grafia("Art. 121, ii")
        assert problemas_de_grafia("Art. 121, §2")        # falta o ordinal
        assert problemas_de_grafia("Art. 121, §10º")      # ordinal acima de 9
        assert problemas_de_grafia("Art. 1, a")
        assert problemas_de_grafia("")
        assert problemas_de_grafia("Art. 121, Parágrafo Único")
