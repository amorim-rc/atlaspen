# -*- coding: utf-8 -*-
"""A conferência contra a lista de leis do ano — a defesa do falso negativo.

Sem rede: as funções puras recebem o HTML e o diretório de relatórios.
"""
import json

import leis_do_ano as lda


class TestNumerosDoIndice:
    HTML = """
    <table>
      <tr><td><a href="l15358.htm">Lei nº 15.358, de 3 de março de 2026</a></td></tr>
      <tr><td><a href="l15409.htm">Lei nº 15.409, de 10 de maio de 2026</a></td></tr>
      <tr><td>Lei n. 15.487, de 5 de agosto de 2026 </td></tr>
    </table>"""

    def test_le_os_numeros_sem_pontuacao(self):
        assert lda.numeros_do_indice(self.HTML) == {"15358", "15409", "15487"}

    def test_pagina_vazia_nao_inventa_nada(self):
        assert lda.numeros_do_indice("") == set()


class TestExaminados:
    def _rodada(self, tmp_path, nome, titulos):
        (tmp_path / nome).write_text(
            json.dumps([{"titulo": t} for t in titulos]), encoding="utf-8")

    def test_le_as_rodadas_guardadas(self, tmp_path):
        self._rodada(tmp_path, "dou-2026-03-09.json",
                     ["LEI Nº 15.358, DE 3 DE MARÇO DE 2026"])
        self._rodada(tmp_path, "dou-2026-05-17.json",
                     ["LEI Nº 15.409, DE 10 DE MAIO DE 2026"])
        vistos = lda.numeros_examinados(tmp_path)
        assert set(vistos) == {"15358", "15409"}

    def test_json_corrompido_nao_derruba_a_conferencia(self, tmp_path):
        (tmp_path / "dou-2026-01-01.json").write_text("{ nao é json", encoding="utf-8")
        assert lda.numeros_examinados(tmp_path) == {}


class TestRelatorio:
    def test_aponta_a_lei_que_ninguem_olhou(self):
        texto = lda.montar_relatorio(2026, {"15358", "15487"}, {"15358": "x.json"})
        assert "1** não passaram pelo filtro" in texto
        assert "15.487" in texto
        # Não classifica: só diz que ninguém olhou.
        assert "não quer dizer que sejam penais" in texto

    def test_janela_fechada(self):
        texto = lda.montar_relatorio(2026, {"15358"}, {"15358": "x.json"})
        assert "Nenhuma ficou de fora" in texto

    def test_sem_a_fonte_nao_afirma_nada(self):
        """O número só vale se a lista inteira tiver sido lida. Não ler e
        reportar zero seria o pior resultado possível: silêncio que parece
        aprovação."""
        texto = lda.montar_relatorio(2026, set(), {})
        assert "não pôde ser lida" in texto
        assert "não afirma nada" in texto
