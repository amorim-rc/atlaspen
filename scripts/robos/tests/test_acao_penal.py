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


class TestArt183:
    """O art. 183, I, do CP tira do art. 182 o que é roubo, extorsão ou violento.

        Art. 183. Não se aplica o disposto nos dois artigos anteriores:
        I - se o crime é de roubo ou de extorsão, ou, em geral, quando haja
            emprego de grave ameaça ou violência à pessoa;

    Sem ele, a regra do art. 182 alcançava o roubo e a extorsão, e 37 registros
    iam para "pede juízo" com o auditor afirmando que a ação penal do latrocínio
    poderia depender de representação da família. É leitura de dispositivo: o
    próprio Código diz que não se aplica.
    """

    REGRA = ap.RegraAcao(
        especie="Pública Condicionada à Representação",
        formula="representacao",
        dispositivo="Art. 182",
        texto="Somente se procede mediante representação, se o crime é cometido em "
              "prejuízo de cônjuge desquitado, de irmão, ou de tio ou sobrinho.",
        ressalva=True,
        alcance={"titulo": "II"})

    def _fora(self, **registro):
        return ap._fora_pelo_art_183(self.REGRA, registro)

    def test_roubo_sai_pelo_nome(self):
        assert self._fora(crime="Roubo simples", violencia="Sim", grave_ameaca="Sim")

    def test_extorsao_sai_pelo_nome(self):
        assert self._fora(crime="Extorsão", violencia="Sim", grave_ameaca="Sim")

    def test_extorsao_mediante_sequestro_sai(self):
        """A violência é condicional, mas a espécie é extorsão — e basta."""
        assert self._fora(crime="Extorsão mediante sequestro",
                          violencia="Não", grave_ameaca="Sim")

    def test_extorsao_indireta_sai_pelo_nomen_iuris(self):
        """Art. 160. Nem violência nem grave ameaça no campo, e ainda assim sai:
        o Capítulo II se chama 'Do roubo e da extorsão' (decisão C2, grau M)."""
        assert self._fora(crime="Extorsão indireta", violencia="Não", grave_ameaca="Não")

    def test_furto_continua_alcancado(self):
        """O art. 155 é o caso central do art. 182: fica, com a condição."""
        assert not self._fora(crime="Furto simples", violencia="Não", grave_ameaca="Não")

    def test_violento_sem_ser_roubo_tambem_sai(self):
        """'ou, em geral, quando haja emprego de grave ameaça ou violência'."""
        assert self._fora(crime="Dano qualificado por violência à pessoa",
                          violencia="Sim", grave_ameaca="Não")

    def test_outra_regra_nao_e_tocada(self):
        """A exclusão é do art. 182, e não de toda regra de representação."""
        outra = ap.RegraAcao(
            especie="Pública Condicionada à Representação", formula="representacao",
            dispositivo="Art. 88 da Lei 9.099", texto="lesões corporais leves",
            ressalva=False, alcance={"artigos": ["129"]})
        assert not ap._fora_pelo_art_183(
            outra, {"crime": "Roubo simples", "violencia": "Sim", "grave_ameaca": "Sim"})


class TestExcecaoPorMarcador:
    """A exceção da regra às vezes nomeia PARÁGRAFO e INCISO, não artigo.

        CP, art. 151, § 4º — Somente se procede mediante representação, salvo
        nos casos do § 1º, IV, e do § 3º.

    A regra diz, com todas as letras, quais dois dos seis registros do art. 151
    são de ação incondicionada — e é o que o catálogo publica. Sem ler o
    marcador, ela parecia alcançar os seis com uma ressalva que ninguém
    conseguia resolver, e os seis iam para "pede juízo" toda semana.
    """

    def _regra(self, texto):
        disp = {"Art. 151|§ 4º": Disp(texto)}
        return ap.achar_regras(disp, f"TÍTULO I CAPÍTULO VI Art. 151. x {texto}")

    def test_a_excecao_vira_marcador(self):
        r = self._regra("Somente se procede mediante representação, "
                        "salvo nos casos do § 1º, IV, e do § 3º")
        assert r and r[0].alcance.get("exceto_marcadores") == ["§ 1º, IV", "§ 3º"]

    def test_ressalva_resolvida_deixa_de_ser_ressalva(self):
        r = self._regra("Somente se procede mediante representação, "
                        "salvo nos casos do § 1º, IV, e do § 3º")
        assert r[0].ressalva is False

    def test_o_inciso_excetuado_nao_e_alcancado(self):
        r = self._regra("Somente se procede mediante representação, "
                        "salvo nos casos do § 1º, IV, e do § 3º")[0]
        lugar = {"titulo": "I", "capitulo": "VI"}
        assert not ap.alcanca(r, "151", lugar, "§ 1º, IV")
        assert not ap.alcanca(r, "151", lugar, "§ 3º")

    def test_os_demais_incisos_continuam_alcancados(self):
        r = self._regra("Somente se procede mediante representação, "
                        "salvo nos casos do § 1º, IV, e do § 3º")[0]
        lugar = {"titulo": "I", "capitulo": "VI"}
        assert ap.alcanca(r, "151", lugar, "§ 1º, I")
        assert ap.alcanca(r, "151", lugar, "caput")


class TestEnumeracaoComIncisoDoParagrafo:
    """A regra que ENUMERA, em vez de excetuar.

        CP, art. 167 — Nos casos do art. 163, do inciso IV do seu parágrafo e
        do art. 164, somente se procede mediante queixa.

    São três dispositivos nomeados, e os incisos I a III do mesmo parágrafo
    ficam de fora: o dano qualificado por violência segue de ação pública.
    """

    def _regra(self):
        texto = ("Nos casos do art. 163, do inciso IV do seu parágrafo e do "
                 "art. 164, somente se procede mediante queixa.")
        return ap.achar_regras({"Art. 167|caput": Disp(texto)},
                               f"TÍTULO II CAPÍTULO IV Art. 167. {texto}")[0]

    def test_enumera_caput_e_o_inciso_nomeado(self):
        assert self._regra().alcance["marcadores"] == ["caput", "parágrafo único, IV"]

    def test_alcanca_o_caput_e_o_inciso_IV(self):
        r, lugar = self._regra(), {"titulo": "II", "capitulo": "IV"}
        assert ap.alcanca(r, "163", lugar, "caput")
        assert ap.alcanca(r, "163", lugar, "parágrafo único, IV")

    def test_nao_alcanca_os_demais_incisos(self):
        r, lugar = self._regra(), {"titulo": "II", "capitulo": "IV"}
        assert not ap.alcanca(r, "163", lugar, "parágrafo único, I")
        assert not ap.alcanca(r, "163", lugar, "parágrafo único, III")
