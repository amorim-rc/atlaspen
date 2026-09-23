# -*- coding: utf-8 -*-
"""As regras de derivação da ação penal (`scripts/acao_penal.py`).

Cada teste guarda um caso que a primeira rodada errou contra o catálogo real.
"""
import acao_penal as ap


class Disp:
    """O mínimo do dispositivo que o módulo lê."""

    def __init__(self, texto, incisos=None):
        self.texto = texto
        self.incisos = incisos or []


def regras(dispositivos, bruto=''):
    return ap.achar_regras(dispositivos, bruto)


def test_formula_de_queixa_alcanca_o_proprio_artigo():
    r = regras({'Art. 179|parágrafo único': Disp('Somente se procede mediante queixa')})
    assert len(r) == 1 and r[0].especie == 'Ação Penal Privada'
    assert r[0].alcance == {'artigos': ['179']}


def test_requisicao_do_ministro_e_especie_propria():
    """Requisição do Ministro da Justiça não é representação do ofendido: são
    institutos diferentes, e o vocabulário fechado em 19/09/2026 os separa."""
    r = regras({'Art. 145|parágrafo único': Disp(
        'Procede-se mediante requisição do Ministro da Justiça, no caso do inciso I do art. 141')})
    assert r[0].especie == 'Pública Condicionada à Requisição'


def test_regra_com_ressalva_nao_decide():
    """O art. 182 manda representação só quando o crime é cometido em prejuízo
    de cônjuge ou parente: a espécie depende do caso."""
    r = regras({'Art. 182|caput': Disp(
        'Somente se procede mediante representação, se o crime previsto neste título é cometido em prejuízo:')})
    assert r[0].ressalva is True


def test_regra_por_capitulo_usa_a_topografia():
    bruto = 'CAPÍTULO V DOS CRIMES CONTRA A HONRA Art. 138 - Caluniar alguém: Art. 145 - Nos crimes previstos neste Capítulo somente se procede mediante queixa'
    disp = {'Art. 145|caput': Disp('Nos crimes previstos neste Capítulo somente se procede mediante queixa')}
    r = regras(disp, bruto)
    marc, pos = ap.topografia(bruto), ap.posicoes_dos_artigos(bruto)
    lugar = ap.onde_esta('138', marc, pos)
    assert lugar.get('capitulo') == 'V'
    assert ap.alcanca(r[0], '138', lugar)


def test_sufixo_nao_se_confunde_com_o_artigo_base():
    """A representação do §2º do art. 147 não alcança o art. 147-B, que é outro
    crime — foi o erro que marcou a violência psicológica como condicionada."""
    r = regras({'Art. 147|§ 2º': Disp('Somente se procede mediante representação')})
    assert ap.alcanca(r[0], '147', {})
    assert not ap.alcanca(r[0], '147-B', {})


def test_regra_distribuida_em_incisos_desce_ao_marcador():
    """O art. 186 do CP manda queixa no caput do art. 184 e ação pública
    incondicionada nos §§ 1º e 2º: ler só o caput da regra dava queixa para
    todos os parágrafos."""
    disp = {'Art. 186|caput': Disp('Procede-se mediante:', [
        {'marcador': 'I', 'texto': 'queixa, nos crimes previstos no caput do art. 184;'},
        {'marcador': 'II', 'texto': 'ação penal pública incondicionada, nos crimes previstos nos §§ 1º e 2º do art. 184;'},
        {'marcador': 'IV', 'texto': 'ação penal pública condicionada à representação, nos crimes previstos no § 3º do art. 184.'},
    ])}
    r = regras(disp)
    assert {x.especie for x in r} == {
        'Ação Penal Privada', 'Pública Incondicionada', 'Pública Condicionada à Representação'}
    queixa = next(x for x in r if x.especie == 'Ação Penal Privada')
    assert queixa.alcance['marcadores'] == ['caput']
    assert ap.alcanca(queixa, '184', {}, 'caput')
    assert not ap.alcanca(queixa, '184', {}, '§ 3º')


def test_silencio_do_diploma_e_a_regra_geral_do_art_100():
    """Silêncio VERIFICADO: a varredura passou pelo diploma e não achou regra."""
    c = ap.classificar({'lei': 'CP', 'artigo': 'Art. 249'}, [], {})
    assert c.especie == 'Pública Incondicionada'
    assert 'art. 100' in c.fundamento


def test_lei_de_fora_do_diploma_tambem_decide():
    """A Lei 9.099/95, art. 88, condicionou a lesão leve e a culposa à
    representação, e a regra não está no Código Penal."""
    c = ap.classificar({'lei': 'CP', 'artigo': 'Art. 129, caput'}, [], {})
    assert c.especie == 'Pública Condicionada à Representação'
    assert '9.099' in c.fundamento


def test_a_regra_do_proprio_artigo_vence_a_do_capitulo():
    proprio = ap.RegraAcao('Pública Condicionada à Representação', 'representacao',
                           'Art. 130, §2º', '', False, {'artigos': ['130']})
    capitulo = ap.RegraAcao('Ação Penal Privada', 'queixa', 'Art. 145', '', False, {'capitulo': 'V'})
    c = ap.classificar({'lei': 'CP', 'artigo': 'Art. 130'}, [capitulo, proprio], {'capitulo': 'V'})
    assert c.especie == 'Pública Condicionada à Representação'


# -- C1: referencia relativa se compara em CADEIA --------------------------

def test_capitulo_v_de_titulos_diferentes_nao_se_confundem():
    """A C1 da revisao fina. "Neste Capitulo", no art. 145, alcanca o Capitulo V
    do Titulo I -- e nao os Capitulos V dos Titulos II, VI e X, que existem e
    tratam de outra coisa."""
    regra = ap.RegraAcao(
        especie='Ação Penal Privada', formula='somente-se-procede-mediante-queixa',
        dispositivo='Art. 145', texto='Nos crimes previstos neste Capítulo, somente se '
                                      'procede mediante queixa',
        ressalva=False, alcance={'titulo': 'I', 'capitulo': 'V'})
    assert ap.alcanca(regra, '138', {'titulo': 'I', 'capitulo': 'V'})
    for titulo in ('II', 'VI', 'X'):
        assert not ap.alcanca(regra, '155', {'titulo': titulo, 'capitulo': 'V'}), titulo


def test_secao_se_compara_com_titulo_e_capitulo_junto():
    regra = ap.RegraAcao(
        especie='Pública Condicionada à Representação', formula='somente-se-procede',
        dispositivo='Art. 172', texto='Nos crimes previstos nesta Seção',
        ressalva=False, alcance={'titulo': 'II', 'capitulo': 'VI', 'secao': 'III'})
    assert ap.alcanca(regra, '168', {'titulo': 'II', 'capitulo': 'VI', 'secao': 'III'})
    # mesma Secao III, outro Capitulo: nao alcanca
    assert not ap.alcanca(regra, '99', {'titulo': 'II', 'capitulo': 'V', 'secao': 'III'})
    # mesmo Capitulo VI, outra Secao
    assert not ap.alcanca(regra, '165', {'titulo': 'II', 'capitulo': 'VI', 'secao': 'I'})


def test_topografia_le_secao_em_caixa_alta_e_baixa():
    """O Planalto escreve "CAPITULO VI" em versais e "Secao I" logo abaixo em
    caixa alta e baixa. Lendo so as versais, a secao sumia da topografia."""
    bruto = 'CAPÍTULO VI DOS CRIMES Seção I Do Crime de Corrupção Art. 165. Exigir'
    tipos = [t for _, t, _ in ap.topografia(bruto)]
    assert 'CAPÍTULO' in tipos
    assert 'SEÇÃO' in tipos


def test_a_excecao_escrita_na_regra_sai_do_alcance_dela():
    """Lei 14.597, art. 172: representacao "com excecao do crime previsto no
    art. 169 desta Lei, em que a acao e publica incondicionada"."""
    regra = ap.RegraAcao(
        especie='Pública Condicionada à Representação', formula='somente-se-procede',
        dispositivo='Art. 172', texto='...', ressalva=False,
        alcance={'titulo': 'II', 'capitulo': 'VI', 'secao': 'III', 'exceto': ['169']})
    lugar = {'titulo': 'II', 'capitulo': 'VI', 'secao': 'III'}
    assert ap.alcanca(regra, '168', lugar)
    assert not ap.alcanca(regra, '169', lugar)


# -- Decisao 18: o fundamento publicado -------------------------------------

def test_fundamento_do_crime_militar_cita_o_cpm_e_nao_o_cp():
    """Dizer "regra geral, CP, art. 100" num crime militar seria citar o
    dispositivo errado: quem manda ali e o art. 121 do CPM."""
    reg = {'lei': 'CPM (DL 1.001/69)', 'artigo': 'Art. 205, caput'}
    f = ap.fundamento_de(reg, ap.REGRA_GERAL)
    assert 'CPM, art. 121' in f
    assert f.startswith('lei externa:')


def test_fundamento_da_lesao_em_violencia_domestica_e_jurisprudencial():
    reg = {'lei': 'CP', 'artigo': 'Art. 129, §9º'}
    f = ap.fundamento_de(reg, ap.REGRA_GERAL)
    assert 'Súmula 542' in f and 'ADI 4424' in f
    assert f.startswith('jurisprudência:')


def test_fundamento_do_silencio_cita_a_regra_geral():
    reg = {'lei': 'Lei 8.137/90', 'artigo': 'Art. 1º'}
    f = ap.fundamento_de(reg, ap.REGRA_GERAL)
    assert f.startswith('regra geral:')
    assert 'art. 100' in f


def test_fundamento_intertemporal_aponta_para_a_condicao():
    """O estelionato (decisao 33) nao cabe numa linha: depende da data do fato."""
    reg = {'lei': 'CP', 'artigo': 'Art. 171, caput',
           'acao_condicao': 'Fatos até 03/05/2026: condicionada à representação...'}
    f = ap.fundamento_de(reg, ap.REGRA_GERAL)
    assert f == 'intertemporal: ver `acao_condicao`'
