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


# ── C15: a âncora de fim, e a trava que a cobra ─────────────────────────────

ANCORA = r"(?=$|,| )"


def test_sem_ancora_o_inciso_V_engole_VI_VII_e_VIII():
    """A C12, reproduzida: era assim que quatro formas do roubo afirmavam
    hediondez que o rol não dá."""
    torta = {"regras": [{"fundamento": "Lei 8.072, art. 1º, II, a", "lei": "^CP$",
                         "artigo": r"^Art\. 157, §2º, V"}],
             "excecoes": []}
    for inciso in ("VI", "VII", "VIII"):
        r = hediondez.classificar(registro("CP", f"Art. 157, §2º, {inciso}"), torta)
        assert r["especie"] == "natureza", inciso


def test_com_ancora_o_inciso_V_alcanca_so_o_V():
    certa = {"regras": [{"fundamento": "Lei 8.072, art. 1º, II, a", "lei": "^CP$",
                         "artigo": r"^Art\. 157, §2º, V" + ANCORA}],
             "excecoes": []}
    assert hediondez.classificar(registro("CP", "Art. 157, §2º, V"), certa)["especie"] == "natureza"
    for inciso in ("VI", "VII", "VIII"):
        r = hediondez.classificar(registro("CP", f"Art. 157, §2º, {inciso}"), certa)
        assert r["especie"] == "nao", inciso


def test_a_ancora_admite_inciso_parentese_e_c_c():
    """O rótulo do catálogo continua depois do dispositivo de três formas, e a
    âncora tem de deixar as três passarem."""
    regra = {"regras": [{"fundamento": "f", "lei": "^CP$",
                         "artigo": r"^Art\. 158, §3º" + ANCORA}], "excecoes": []}
    for artigo in ("Art. 158, §3º", "Art. 158, §3º (morte)", "Art. 158, §3º, I"):
        assert hediondez.classificar(registro("CP", artigo), regra)["especie"] == "natureza", artigo
    assert hediondez.classificar(registro("CP", "Art. 158, §3º-A"), regra)["especie"] == "nao"


def test_a_trava_recusa_expressao_que_nao_diz_onde_termina():
    torta = {"regras": [{"fundamento": "f", "lei": "^CP$", "artigo": r"^Art\. 157, §2º, V"}],
             "excecoes": []}
    problemas = hediondez.validar(torta)
    assert len(problemas) == 1
    assert "não diz onde termina" in problemas[0]


def test_a_trava_aceita_regra_declaradamente_aberta():
    """Lei 13.260: a regra alcança o diploma inteiro de propósito."""
    aberta = {"regras": [{"fundamento": "CF, art. 5º, XLIII (equiparado)",
                          "lei": r"Lei 13\.260", "artigo": r"^Art\. ", "aberta": True}],
              "excecoes": []}
    assert hediondez.validar(aberta) == []


def test_a_trava_confere_cada_alternativa_da_expressao():
    meio = {"regras": [{"fundamento": "f", "lei": "^CP$",
                        "artigo": r"^Art\. 33, caput$|^Art\. 33, §1º"}], "excecoes": []}
    assert len(hediondez.validar(meio)) == 1


def test_a_tabela_real_passa_na_propria_trava():
    assert hediondez.validar(hediondez.carregar()) == []


# ── Decisão 29: o CPM contra o rol, por identidade ──────────────────────────

def _real():
    return hediondez.carregar()


def test_cpm_genocidio_e_hediondo_por_identidade():
    for artigo in ("Art. 208, caput", "Art. 401, caput"):
        r = hediondez.classificar(registro("CPM (DL 1.001/69)", artigo), _real())
        assert r["especie"] == "natureza", artigo
        assert not r["condicional"], artigo


def test_cpm_violencia_carnal_alcanca_todas_as_formas():
    for artigo in ("Art. 408, caput", "Art. 408, par. único, a)", "Art. 408, par. único, b)"):
        assert hediondez.classificar(registro("CPM (DL 1.001/69)", artigo),
                                     _real())["especie"] == "natureza", artigo


def test_cpm_extorsao_mediante_sequestro_na_paz_e_na_guerra():
    for artigo in ("Art. 244, caput", "Art. 244, §1º", "Art. 244, §2º",
                   "Art. 405 c/c art. 244, caput", "Art. 405 c/c art. 244, §1º"):
        assert hediondez.classificar(registro("CPM (DL 1.001/69)", artigo),
                                     _real())["especie"] == "natureza", artigo


def test_cpm_agregador_do_roubo_e_condicional():
    """O § 2º do art. 242 reúne incisos hediondos e não hediondos: o registro do
    parágrafo inteiro não pode afirmar hediondez sem dizer em qual hipótese."""
    r = hediondez.classificar(registro("CPM (DL 1.001/69)", "Art. 242, §2º"), _real())
    assert r["especie"] == "natureza"
    assert r["condicional"]


def test_cpm_homicidio_simples_so_e_hediondo_em_grupo_de_exterminio():
    for artigo in ("Art. 205, caput", "Art. 400, I"):
        r = hediondez.classificar(registro("CPM (DL 1.001/69)", artigo), _real())
        assert r["condicional"], artigo


def test_cpm_qualificadora_sem_correspondencia_no_cp_nao_e_hediondo():
    """Art. 205, § 2º, VI: prevalecer-se da situação de serviço não figura entre
    as qualificadoras do art. 121, § 2º, do CP, e a hediondez do CPM vem da
    identidade com o crime comum."""
    r = hediondez.classificar(registro("CPM (DL 1.001/69)", "Art. 205, §2º, VI"), _real())
    assert r["especie"] == "nao"
    assert r["regra"] == "excecao"


def test_cp_121_2D_saiu_do_rol():
    """Decisão 28: o rol remete ao § 2º; o § 2º-D é parágrafo autônomo."""
    r = hediondez.classificar(registro("CP", "Art. 121, §2º-D"), _real())
    assert r["especie"] == "nao"
    assert r["regra"] == "excecao"


def test_cp_403_3_do_cpm_separa_as_duas_molduras():
    """O art. 403, § 3º tem duas molduras; só a do resultado morte entra."""
    real = _real()
    assert hediondez.classificar(
        registro("CPM (DL 1.001/69)", "Art. 403, § 3º (no caso de morte)"),
        real)["especie"] == "natureza"
    assert hediondez.classificar(
        registro("CPM (DL 1.001/69)", "Art. 403, §3º"), real)["especie"] == "nao"
