# -*- coding: utf-8 -*-
"""Testes do orquestrador do PR semanal (F6b).

Sem rede e sem tocar no repositório: o que se testa aqui é a montagem — versão,
corpo do PR e notas de atualização —, porque é onde um erro passa despercebido
até virar nota publicada. A escolha do diploma e a aplicação no catálogo são
exercitadas contra os snapshots reais nas rodadas do workflow.

A regra das notas (decisão de 14/09/2026): só vai para o feed a alteração de
LEI, lida da anotação do compilado — redação dada, ou dispositivo incluído, por
lei deste ano ou do anterior. Correção de dado fica fora.
"""
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))  # scripts/
from proponente import propor  # noqa: E402

LEI_NOVA = {"acao": "redacao", "norma": "Lei nº 15.397", "ano": 2026,
            "texto": "(Redação dada pela Lei nº 15.397, de 2026)",
            "url": "https://exemplo/l15397.htm#art1"}


@pytest.fixture
def escolha():
    """Uma rodada com uma correção e uma linha nova, as duas vindas de lei recente."""
    antes = {"id": 42, "artigo": "Art. 155, §4º", "crime": "Furto qualificado",
             "pena_min": 24, "pena_max": 96, "tipo_pena": "Reclusão",
             "obs": "2 a 8 anos reclusão"}
    depois = dict(antes, pena_min=24, pena_max=120, tipo_pena="Reclusão",
                  obs="2 a 10 anos reclusão")
    return {
        "fonte": {"id": "cp", "rotulos": ["CP"], "url": "https://exemplo/cp.htm"},
        "correcoes": [{"id": 42, "antes": antes, "depois": depois,
                       "evidencia": "Pena - reclusão, de dois a dez anos",
                       "anotacao": dict(LEI_NOVA)}],
        "novas": [{"linha": {"id": 1700, "artigo": "Art. 155, §5º",
                             "crime": "Furto de veículo", "pena_min": 36,
                             "pena_max": 96, "tipo_pena": "Reclusão",
                             "elemento": "Doloso"},
                   "achado": {"tipo": "AUSENTE", "detalhe": "dispositivo com pena própria",
                              "anotacao": dict(LEI_NOVA, acao="incluido",
                                               texto="(Incluído pela Lei nº 15.397, de 2026)")},
                   "herdado": ["acao"], "caput_id": 7}],
        "humanos": [{"chave": "Art. 180|caput", "tipo": "REVOGADO",
                     "detalhe": "a lei marca como revogado"}],
        "total": 2,
    }


class TestVersao:
    def test_correcao_de_dado_sobe_o_patch(self):
        assert propor.proxima_versao("1.3.0") == "1.3.1"
        assert propor.proxima_versao("1.3.9") == "1.3.10"

    def test_em_0x_a_versao_anda_em_0_0_x(self, monkeypatch):
        """Até o lançamento o projeto anda em 0.0.x (decisão de 14/09/2026)."""
        monkeypatch.setattr(propor, "versao_atual", lambda: "0.0.0")
        assert propor.versao_da_rodada() == "0.0.1"

    def test_bump_que_nao_pega_derruba_o_processo(self, tmp_path):
        """O bump por substituição de texto já falhou em silêncio neste
        repositório — três entradas anunciaram versões que nunca saíram. Aqui,
        não casar é erro fatal, nunca "seguir com o arquivo intacto"."""
        alvo = tmp_path / "package.json"
        alvo.write_bytes(b'{\r\n  "version": "9.9.9"\r\n}\r\n')
        with pytest.raises(SystemExit):
            propor._substituir_versao(alvo, r'"version":\s*"{v}"', "1.3.0", "1.3.1")

    def test_bump_preserva_o_crlf_do_arquivo(self, tmp_path):
        """Reescrever em LF trocaria a quebra de linha do arquivo inteiro e o
        diff do PR mostraria cinquenta linhas no lugar de uma."""
        alvo = tmp_path / "package.json"
        alvo.write_bytes(b'{\r\n  "name": "atlaspen",\r\n  "version": "1.3.0"\r\n}\r\n')
        propor._substituir_versao(alvo, r'"version":\s*"{v}"', "1.3.0", "1.3.1")
        bruto = alvo.read_bytes()
        assert b'"version": "1.3.1"' in bruto
        assert bruto.count(b"\r\n") == 4 and b"\n\n" not in bruto.replace(b"\r\n", b"")

    def test_o_lockfile_sobe_nas_duas_raizes(self, tmp_path):
        alvo = tmp_path / "package-lock.json"
        alvo.write_bytes(b'{\n  "version": "0.0.1",\n  "packages": {\n    "": {\n'
                         b'      "version": "0.0.1"\n    },\n    "x": {"version": "0.0.1"}\n  }\n}\n')
        propor._substituir_versao(alvo, r'"version":\s*"{v}"', "0.0.1", "0.0.2", vezes=2)
        bruto = alvo.read_bytes()
        assert bruto.count(b'"0.0.2"') == 2 and b'"x": {"version": "0.0.1"}' in bruto


class TestCorpoDoPR:
    def test_cada_mudanca_leva_a_evidencia_da_lei(self, escolha):
        corpo = propor.corpo_pr(escolha, "1.3.1")
        assert "https://exemplo/cp.htm" in corpo          # o texto conferido
        assert "Pena - reclusão, de dois a dez anos" in corpo
        assert "24–96 meses" in corpo and "24–120 meses" in corpo
        assert "/tipos/42" in corpo                       # onde conferir publicado

    def test_linha_nova_declara_o_que_foi_herdado(self, escolha):
        """Do texto saem seis campos; o resto herda do caput. A revisão precisa
        saber onde olhar primeiro."""
        corpo = propor.corpo_pr(escolha, "1.3.1")
        assert "Herdado do caput" in corpo and "acao" in corpo

    def test_o_que_nao_e_mecanico_aparece_como_pendente(self, escolha):
        corpo = propor.corpo_pr(escolha, "1.3.1")
        assert "Fora do automático" in corpo and "REVOGADO" in corpo

    def test_o_corpo_diz_o_que_vai_e_o_que_nao_vai_para_o_feed(self, escolha):
        escolha["correcoes"][0]["anotacao"] = dict(LEI_NOVA, ano=2009)
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        corpo = propor.corpo_pr(escolha, "1.3.1", legais, fora)
        assert "novatio legis incriminadora" in corpo
        assert "fora do feed, correção de dado" in corpo


class TestQueVaiParaAsNotas:
    def test_alteracao_de_lei_recente_vira_nota_com_a_natureza(self, escolha):
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        assert [(m["id"], m["natureza"]) for m in legais] == [(42, "pejus"), (1700, "incriminadora")]
        assert fora == []

    def test_correcao_de_dado_fica_fora_do_feed(self, escolha):
        """Moldura divergente sob redação antiga é erro do catálogo, não lei nova."""
        escolha["correcoes"][0]["anotacao"] = dict(LEI_NOVA, ano=2009)
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        assert [m["id"] for m in legais] == [1700]
        assert fora[0]["id"] == 42 and "correção de dado" in fora[0]["motivo"]

    def test_sem_anotacao_nao_ha_como_afirmar_lei_nova(self, escolha):
        escolha["correcoes"][0]["anotacao"] = None
        escolha["novas"][0]["achado"]["anotacao"] = None
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        assert legais == [] and len(fora) == 2

    def test_pena_que_desce_e_in_mellius(self, escolha):
        c = escolha["correcoes"][0]
        c["depois"] = dict(c["antes"], pena_max=72)
        legais, _ = propor.mudancas_da_lei(escolha, 2026)
        assert legais[0]["natureza"] == "mellius"

    def test_sentido_misto_vai_para_a_revisao(self, escolha):
        c = escolha["correcoes"][0]
        c["depois"] = dict(c["antes"], pena_min=36, pena_max=72)
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        assert [m["id"] for m in legais] == [1700]
        assert "natureza fica para a revisão" in fora[0]["motivo"]

    def test_linha_que_so_faltava_no_catalogo_nao_e_incriminadora(self, escolha):
        """Dispositivo antigo que o catálogo não tinha é completude, não lei nova."""
        escolha["novas"][0]["achado"]["anotacao"] = dict(LEI_NOVA, acao="incluido", ano=1998)
        legais, fora = propor.mudancas_da_lei(escolha, 2026)
        assert [m["id"] for m in legais] == [42]
        assert fora[0]["id"] == 1700


class TestEntradaDeChangelog:
    def test_uma_entrada_por_lei_e_por_natureza(self, escolha, monkeypatch, tmp_path):
        monkeypatch.setattr(propor, "ENTRADAS", tmp_path)
        legais, _ = propor.mudancas_da_lei(escolha, 2026)
        saida = propor.entradas_changelog(escolha, legais, "0.0.2", "2026-09-14")
        nomes = sorted(d.name for d, _ in saida)
        assert nomes == ["2026-09-14-lei-15397-incriminadora.ts", "2026-09-14-lei-15397-pejus.ts"]
        por_nome = {d.name: ts for d, ts in saida}
        pejus = por_nome["2026-09-14-lei-15397-pejus.ts"]
        assert "tipo: 'pejus'" in pejus and "version: 'v0.0.2'" in pejus
        assert "de 2 a 8 anos de reclusão para 2 a 10 anos de reclusão" in pejus
        assert "https://exemplo/l15397.htm#art1" in pejus and "/tipos/42" in pejus
        assert "tipo: 'incriminadora'" in por_nome["2026-09-14-lei-15397-incriminadora.ts"]
        # body é texto puro: sem markdown, sem backtick (contrato do ChangelogEntry)
        corpo = pejus.split("body: [")[1].split("],")[0]
        assert "`" not in corpo and "**" not in corpo

    def test_id_nao_colide_no_mesmo_dia(self, escolha, monkeypatch, tmp_path):
        monkeypatch.setattr(propor, "ENTRADAS", tmp_path)
        (tmp_path / "2026").mkdir()
        (tmp_path / "2026" / "2026-09-14-lei-15397-pejus.ts").write_text("já existe")
        escolha["novas"] = []
        legais, _ = propor.mudancas_da_lei(escolha, 2026)
        [(destino, ts)] = propor.entradas_changelog(escolha, legais, "0.0.2", "2026-09-14")
        assert destino.name == "2026-09-14-lei-15397-pejus-2.ts"
        assert "id: '2026-09-14-lei-15397-pejus-2'" in ts


def _sem_catalogo(monkeypatch, tmp_path):
    monkeypatch.setattr(propor, "ENTRADAS", tmp_path / "entries")
    monkeypatch.setattr(propor, "corrigir", type("X", (), {"aplicar": staticmethod(lambda p: None)}))
    monkeypatch.setattr(propor, "criar", type("X", (), {"aplicar": staticmethod(lambda p: None)}))


def test_meta_do_pr_tem_ramo_titulo_e_as_notas(escolha, monkeypatch, tmp_path):
    """O workflow lê este JSON para nomear o ramo e o PR — se mudar de formato,
    o passo de abertura falha calado."""
    _sem_catalogo(monkeypatch, tmp_path)
    subiu = []
    monkeypatch.setattr(propor, "subir_versao", lambda v: subiu.append(v))
    meta = propor.aplicar(escolha, "0.0.2", "2026-09-14", tmp_path / "saida")
    assert meta["ramo"] == "conferidor/cp-2026-09-14"
    assert meta["fonte"] == "cp" and meta["versao"] == "0.0.2" and subiu == ["0.0.2"]
    assert len(meta["entradas"]) == 2 and meta["entrada"] == meta["entradas"][0]
    assert (tmp_path / "saida" / "corpo.md").exists()
    gravado = json.loads((tmp_path / "saida" / "meta.json").read_text(encoding="utf-8"))
    assert gravado["correcoes"] == 1 and gravado["novas"] == 1


def test_sem_lei_recente_nao_ha_nota_nem_versao(escolha, monkeypatch, tmp_path):
    """Rodada só de correção de dado: aplica, mas não escreve nota nem sobe versão
    (a versão sem entrada seria reprovada pelo validar-changelog). As chaves do
    meta continuam existindo, vazias, porque o workflow as lê."""
    _sem_catalogo(monkeypatch, tmp_path)
    escolha["correcoes"][0]["anotacao"] = None
    escolha["novas"][0]["achado"]["anotacao"] = None
    subiu = []
    monkeypatch.setattr(propor, "subir_versao", lambda v: subiu.append(v))
    meta = propor.aplicar(escolha, "0.0.2", "2026-09-14", tmp_path / "saida")
    assert meta["versao"] == "" and meta["entrada"] == "" and meta["entradas"] == []
    assert not subiu and not (tmp_path / "entries").exists()
    corpo = (tmp_path / "saida" / "corpo.md").read_text(encoding="utf-8")
    assert "fecha a versão" not in corpo and "nenhuma mudança vem de lei recente" in corpo
