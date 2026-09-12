# -*- coding: utf-8 -*-
"""O histórico legislativo lido do compilado (frentes 4 e 5 do backlog).

A fixture é o art. 112 da LEP como o Planalto o servia em 11/09/2026: quatro
redações do caput, os incisos de 2019 e os de 2026, o inciso VI-A criado em
2024 e revogado em 2026, as alíneas do inciso VI e dois incisos vetados.
"""
from pathlib import Path

from nucleo.historico import chave_canonica, eventos, linhas_de, versoes

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"
LEP = "https://www.planalto.gov.br/ccivil_03/leis/l7210.htm"


def _linhas():
    html = (FIXTURES / "lep-art112.html").read_text(encoding="utf-8")
    return eventos(versoes(html, "lep"), LEP)[0]


def _de(chave):
    return [(l["evento"], l["norma"], l.get("ano"), l.get("valor_antes"), l.get("valor_depois"))
            for l in linhas_de(chave, _linhas())]


def test_chave_canonica():
    assert chave_canonica("cp", "121") == "cp|art. 121, caput"
    assert chave_canonica("cp", "146", "A") == "cp|art. 146-a, caput"
    assert chave_canonica("lep", "112", inciso="VI", alinea="c") == "lep|art. 112, vi, c"
    assert chave_canonica("cp", "44", paragrafo="§3º") == "cp|art. 44, §3º"
    assert chave_canonica("cp", "33", paragrafo="§2º", alinea="a") == "cp|art. 33, §2º, a"
    assert (chave_canonica("lep", "112", paragrafo="parágrafo único")
            == "lep|art. 112, parágrafo único")


def test_o_inciso_i_mudou_de_assunto_e_de_valor():
    """O exemplo do estudo: 16% ao primário sem violência, depois 25% ao primário
    com violência — o mesmo inciso, outra regra."""
    assert _de("lep|art. 112, i") == [
        ("criacao", "Lei nº 13.964", 2019, None, "16%"),
        ("alteracao", "Lei nº 15.402", 2026, "16%", "25%"),
    ]


def test_a_linha_leva_a_anotacao_e_o_link_resolvido():
    _, alteracao = linhas_de("lep|art. 112, i", _linhas())
    assert alteracao["anotacao"] == "(Redação dada pela Lei nº 15.402, de 2026)"
    assert (alteracao["url"]
            == "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15402.htm#art1")
    assert alteracao["natureza"] == "legislativa" and alteracao["origem"] == "compilado"


def test_o_caput_tem_quatro_redacoes_e_a_primeira_e_a_original():
    assert [e[:3] for e in _de("lep|art. 112, caput")] == [
        ("criacao", "original", None),
        ("alteracao", "Lei nº 10.792", 2003),
        ("alteracao", "Lei nº 13.964", 2019),
        ("alteracao", "Lei nº 15.402", 2026),
    ]


def test_o_percentual_das_alineas_mora_no_inciso_vi():
    """A Lei 15.358 elevou o inciso VI de 50% a 75% sem tocar na alínea "c": quem
    quer o patamar da milícia privada tem de citar o inciso junto."""
    assert _de("lep|art. 112, vi") == [
        ("criacao", "Lei nº 13.964", 2019, None, "50%"),
        ("alteracao", "Lei nº 15.358", 2026, "50%", "75%"),
    ]
    assert _de("lep|art. 112, vi, c") == [("criacao", "Lei nº 13.964", 2019, None, None)]


def test_inciso_com_sufixo_revogado_por_redacao_dada():
    """VI-A: o parser do Vigia não lê o sufixo, e a revogação vem como texto
    "(revogado)" numa "Redação dada"."""
    assert _de("lep|art. 112, vi-a") == [
        ("criacao", "Lei nº 14.994", 2024, None, "55%"),
        ("revogacao", "Lei nº 15.358", 2026, "55%", None),
    ]


def test_inciso_vetado_nao_vira_evento():
    assert _de("lep|art. 112, ix") == []


def test_capitular_partida_e_epigrafe_de_pena():
    """Dois tropeços do acervo real, no molde do CP: a capitular do art. 107 sai
    como "A rt." do HTML, e a epígrafe "Pena de tentativa", anotada, não é linha
    de pena de ninguém."""
    trecho = (
        "<p>A rt. 107 - Extingue-se a punibilidade: "
        "<a href='x.htm'>(Redação dada pela Lei nº 7.209, de 11.7.1984)</a></p>"
        "<p>IX - pelo perdão judicial, nos casos previstos em lei.</p>"
        "<p>Art. 14 - Diz-se o crime: "
        "<a href='x.htm'>(Redação dada pela Lei nº 7.209, de 11.7.1984)</a></p>"
        "<p>II - tentado, quando, iniciada a execução, não se consuma. "
        "<a href='x.htm'>(Incluído pela Lei nº 7.209, de 11.7.1984)</a></p>"
        "<p>Pena de tentativa <a href='x.htm'>(Incluído pela Lei nº 7.209, de 11.7.1984)</a></p>"
    )
    vs = versoes(trecho, "cp")
    assert [v.chave for v in vs] == ["cp|art. 107, caput", "cp|art. 107, ix",
                                     "cp|art. 14, caput", "cp|art. 14, ii"]
    assert vs[1].chapeu_anotado  # IX sem anotação sob caput anotado: não é "original"
    linhas, avisos = eventos(vs, "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm")
    assert linhas_de("cp|art. 107, ix", linhas) == []
    assert any(a.startswith("cp|art. 107, ix:") for a in avisos)
    [tentado] = linhas_de("cp|art. 14, ii", linhas)
    assert tentado["_texto"].startswith("tentado")


def test_o_artigo_inteiro_junta_as_unidades_dele_e_so_dele():
    chaves = {l["dispositivo"] for l in linhas_de("lep|art. 112", _linhas())}
    assert {"lep|art. 112, caput", "lep|art. 112, §1º", "lep|art. 112, §3º, i",
            "lep|art. 112, parágrafo único"} <= chaves
    assert all(k.startswith("lep|art. 112, ") for k in chaves)
