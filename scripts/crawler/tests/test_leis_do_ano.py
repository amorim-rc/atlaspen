# -*- coding: utf-8 -*-
"""A varredura anual — a defesa contra o falso negativo.

Sem rede: a caminhada recebe um `buscar` falso, que devolve as páginas de um
Planalto imaginário. É o que permite testar o corte de ano e o de orçamento, que
são justamente as duas coisas que uma varredura real esconderia.
"""
import leis_do_ano as lda


def pagina(numero, ano, corpo=""):
    return (f"<p>LEI N&ordm; {numero}, DE 5 DE AGOSTO DE {ano}</p><p>{corpo}</p>")


class TestEnderecos:
    def test_pasta_por_quadrienio(self):
        assert lda.pasta_do_ato(2026) == "_ato2023-2026"
        assert lda.pasta_do_ato(2023) == "_ato2023-2026"
        assert lda.pasta_do_ato(2022) == "_ato2019-2022"
        assert lda.pasta_do_ato(2007) == "_ato2007-2010"

    def test_url_da_lei(self):
        assert lda.url_da_lei(15487, 2026).endswith(
            "/ccivil_03/_ato2023-2026/2026/lei/l15487.htm")


class TestLeituraDaPagina:
    def test_ano_vem_do_cabecalho_da_propria_lei(self):
        assert lda.ano_do_texto("LEI Nº 15.487, DE 5 DE AGOSTO DE 2026") == 2026
        assert lda.ano_do_texto("LEI COMPLEMENTAR Nº 214, DE 16 DE JANEIRO DE 2025") == 2025

    def test_pagina_sem_cabecalho_nao_inventa_ano(self):
        assert lda.ano_do_texto("Página em manutenção") is None


class TestCaminhada:
    """O Planalto imaginário: 15.400 a 15.404 de 2026, e 15.399 de 2025."""

    ACERVO = {
        15399: (2025, "Dispõe sobre o orçamento."),
        15400: (2026, "Pena - reclusão, de 2 (dois) a 5 (cinco) anos."),
        15401: (2026, "Altera a Lei de Diretrizes e Bases da Educação."),
        15402: (2026, "Incorre nas mesmas penas quem financia a conduta."),
        15403: (2026, "Dispõe sobre o Dia Nacional do Cooperativismo."),
        15404: (2026, "Pena - detenção, de 6 (seis) meses a 2 (dois) anos."),
    }

    def _buscar(self, url):
        import re
        m = re.search(r"/l(\d+)\.htm$", url)
        if not m:
            return None
        n = int(m.group(1))
        if n not in self.ACERVO:
            return None
        ano, corpo = self.ACERVO[n]
        return pagina(n, ano, corpo)

    def test_acha_todas_as_leis_do_ano(self):
        achadas, avisos = lda.caminhar(2026, semente=15402,
                                       buscar=self._buscar, pausa=0)
        assert sorted(achadas) == [15400, 15401, 15402, 15403, 15404]
        assert not avisos

    def test_para_ao_sair_do_ano(self):
        """Abaixo da primeira lei do ano vem a do ano anterior — e o corte é o
        que o cabeçalho DECLARA, não o endereço."""
        achadas, _ = lda.caminhar(2026, semente=15402,
                                  buscar=self._buscar, pausa=0)
        assert 15399 not in achadas

    def test_separa_quem_comina_pena(self):
        achadas, _ = lda.caminhar(2026, semente=15402,
                                  buscar=self._buscar, pausa=0)
        penais = sorted(n for n, v in achadas.items() if v["penal"])
        # 15.402 entra pela remissão ("incorre nas mesmas penas"), que é o
        # padrão que o filtro antigo não via.
        assert penais == [15400, 15402, 15404]

    def test_orcamento_esgotado_vira_aviso(self):
        """Uma semente errada não pode virar varredura de milhares de páginas —
        e, se o teto for atingido, o relatório TEM de dizer que pode estar
        incompleto."""
        achadas, avisos = lda.caminhar(2026, semente=15402, buscar=self._buscar,
                                       orcamento=3, pausa=0)
        assert avisos and "incompleta" in avisos[0]


class TestRelatorio:
    LEI = {"numero": 15487, "ano_declarado": 2026, "penal": True,
           "url": "https://exemplo/l15487.htm", "ementa": "Pena - reclusão."}

    def test_aponta_a_lei_penal_fora_da_vigilancia(self):
        texto = lda.montar_relatorio(2026, {15487: self.LEI}, set(), [])
        assert "1 lei(s) cominam pena e NÃO são vigiadas" in texto
        assert "15.487" in texto
        # Não conclui que é tipo novo: manda ler.
        assert "não é criar tipo penal novo" in texto

    def test_lei_ja_vigiada_nao_vira_leitura(self):
        texto = lda.montar_relatorio(2026, {15487: self.LEI}, {15487}, [])
        assert "Nenhuma lei penal ficou de fora" in texto

    def test_sem_ter_lido_nada_nao_afirma_nada(self):
        texto = lda.montar_relatorio(2026, {}, {15358}, [])
        assert "não afirma nada" in texto
        assert "Nenhuma lei penal ficou de fora" not in texto
