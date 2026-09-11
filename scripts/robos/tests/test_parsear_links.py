# -*- coding: utf-8 -*-
"""O link de cada anotação (frente 4 do backlog, passo 1).

Toda anotação do compilado — "(Redação dada pela Lei nº 15.402, de 2026)" — é um
link para a lei alteradora, com a âncora do artigo que fez a alteração. É o "link
para o item no Planalto" que a última alteração de cada tipo e de cada atributo
precisa trazer. O parser guardava só o texto e jogava o `href` fora.
"""
from pathlib import Path

from nucleo.parsear import ler_anotacao, parsear, url_absoluta

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"
LEP = "https://www.planalto.gov.br/ccivil_03/leis/l7210.htm"

# Trecho no molde do art. 112 da LEP: a mesma anotação, com o href relativo que o
# Planalto usa de fato (conferido no compilado em 10/09/2026).
TRECHO = (
    "<p>Art. 112. A pena privativa de liberdade será executada de forma progressiva."
    ' <a href="../_ato2023-2026/2026/lei/l15402.htm#art1">'
    "(Redação dada pela Lei nº 15.402, de 2026)</a></p>"
)


def test_anotacao_leva_o_href_do_link_que_a_contem():
    [d] = [d for d in parsear(TRECHO) if d.rotulo_artigo == "Art. 112"]
    assert d.anotacao.acao == "redacao"
    assert d.anotacao.norma == "Lei nº 15.402" and d.anotacao.ano == 2026
    assert d.anotacao.href == "../_ato2023-2026/2026/lei/l15402.htm#art1"


def test_href_resolvido_contra_a_pagina_do_diploma():
    assert (url_absoluta(LEP, "../_ato2023-2026/2026/lei/l15402.htm#art1")
            == "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15402.htm#art1")
    assert url_absoluta(LEP, None) is None


def test_sem_links_a_leitura_antiga_continua_igual():
    a = ler_anotacao("(Redação dada pela Lei nº 15.402, de 2026)")
    assert (a.acao, a.norma, a.ano, a.href) == ("redacao", "Lei nº 15.402", 2026, None)


def test_fixture_real_do_art_121_do_cp():
    """No trecho real do CP, as anotações com link saem com href, e todo href
    resolvido aponta para uma página do Planalto, com a âncora do artigo."""
    base = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm"
    html = (FIXTURES / "cp-art121.html").read_text(encoding="utf-8")
    anotadas = [d.anotacao for d in parsear(html) if d.anotacao and d.anotacao.href]
    assert anotadas, "nenhuma anotação do art. 121 saiu com href"
    for a in anotadas:
        url = url_absoluta(base, a.href)
        assert url.startswith("https://www.planalto.gov.br/ccivil_03/"), url
        assert ".htm" in url.lower(), url
