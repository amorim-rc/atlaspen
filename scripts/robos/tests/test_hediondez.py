# -*- coding: utf-8 -*-
"""A espécie da hediondez e o dispositivo que a sustenta (`scripts/hediondez.py`).

Cada teste guarda uma decisão que custou leitura da lei, não uma linha de código.
"""
import hediondez


TABELA = {
    "regras": [
        {"fundamento": "CF, art. 5º, XLIII (equiparado)", "lei": r"Lei 11\.343", "artigo": r"^Art\. 33, caput"},
        {"fundamento": "Lei 8.072, art. 1º, I", "lei": "^CP$", "artigo": r"^Art\. 121, §2º"},
        {"fundamento": "Lei 8.072/90, art. 1º, parágrafo único, VI (identidade com o art. 157, §2º-A, I, do CP)",
         "lei": "^CPM", "artigo": r"^Art\. 242, §2º, I$", "condicional": True},
    ],
    "excecoes": [
        {"lei": r"Lei 11\.343", "artigo": r"^Art\. 33, §4º", "hediondo": "Não",
         "fundamento": "STF, HC 118.533: o tráfico privilegiado não é equiparado"},
    ],
    "fora_de_alcance": [
        {"lei": "^CPM", "exceto": [r"^Art\. 242, §2º, I$"], "motivo": "identidade é juízo"},
    ],
}


def registro(lei, artigo):
    return {"id": 1, "lei": lei, "artigo": artigo}


def test_rol_da_lei_8072_e_hediondo_por_natureza():
    r = hediondez.classificar(registro("CP", "Art. 121, §2º, I"), TABELA)
    assert r["especie"] == "natureza"
    assert r["fundamento"] == "Lei 8.072, art. 1º, I"


def test_equiparacao_da_constituicao_nao_torna_hediondo():
    """O art. 5º, XLIII, da CF estende o REGIME a tortura, tráfico e terrorismo;
    hediondo é o do rol do art. 1º da Lei 8.072/90, que é taxativo. Colapsar os
    dois num "Sim" foi o que a frente 17 abriu."""
    r = hediondez.classificar(registro("Lei 11.343/06", "Art. 33, caput"), TABELA)
    assert r["especie"] == "equiparado"


def test_excecao_julgada_vence_a_regra():
    """O tráfico privilegiado casa com a regra do tráfico pelo artigo, e a
    exceção do HC 118.533 é que decide."""
    r = hediondez.classificar(registro("Lei 11.343/06", "Art. 33, §4º"), TABELA)
    assert r["especie"] == "nao"
    assert "118.533" in r["fundamento"]


def test_sem_regra_nao_ganha_fundamento():
    """É o que transforma hediondez sem lastro em erro duro no construtor: o
    registro não recebe fundamento nenhum, e `validar_hediondez` o acusa."""
    r = hediondez.classificar(registro("CP", "Art. 155"), TABELA)
    assert r == {"especie": "nao", "fundamento": None, "condicional": False, "regra": None}


def test_regra_condicional_e_marcada():
    """O roubo militar com 'arma' só tem identidade com o rol quando a arma é de
    fogo (CP, art. 157, §2º-A, I). A condição é do caso, não do tipo."""
    r = hediondez.classificar(registro("CPM (DL 1.001/69)", "Art. 242, §2º, I"), TABELA)
    assert r["condicional"] is True


def test_fora_de_alcance_respeita_o_exceto():
    """O CPM inteiro está fora da tabela, menos os dispositivos já julgados —
    senão decidir um artigo não produziria vigilância nenhuma sobre ele."""
    assert hediondez.fora_de_alcance(registro("CPM (DL 1.001/69)", "Art. 205, §2º"), TABELA)
    assert not hediondez.fora_de_alcance(registro("CPM (DL 1.001/69)", "Art. 242, §2º, I"), TABELA)
    assert not hediondez.fora_de_alcance(registro("CP", "Art. 121, §2º"), TABELA)


def test_tabela_real_sustenta_todo_hediondo_do_catalogo():
    """A trava, contra os dados de verdade: nenhum registro afirma hediondez sem
    dispositivo que a produza."""
    import json
    from pathlib import Path
    raiz = Path(hediondez.__file__).resolve().parents[1]
    tabela = hediondez.carregar()
    catalogo = json.loads((raiz / "data" / "crimes.json").read_text(encoding="utf-8"))
    sem = [c["id"] for c in catalogo
           if c.get("hediondo") == "Sim" and hediondez.classificar(c, tabela)["especie"] == "nao"]
    assert sem == []
