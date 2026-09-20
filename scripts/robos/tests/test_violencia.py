# -*- coding: utf-8 -*-
"""As regras de violência e grave ameaça (`scripts/violencia.py`).

Cada teste guarda um caso que a primeira rodada errou. A regra nasceu do erro,
e é por isso que ela fica aqui: sem o caso, a regra volta a ser palpite.
"""
import violencia


def reg(elemento='Doloso', **kw):
    return {'id': 1, 'lei': 'CP', 'artigo': 'Art. 1º', 'crime': 'x', 'elemento': elemento, **kw}


def classificar(texto, caput='', elemento='Doloso'):
    return violencia.classificar(reg(elemento), texto, caput)


def test_violencia_como_meio():
    r = classificar('Subtrair coisa alheia móvel, mediante grave ameaça ou violência à pessoa:')
    assert r['violencia'].valor == 'Sim'
    assert r['violencia'].regra == 'violencia-meio'
    assert r['grave_ameaca'].valor == 'Sim'


def test_usar_de_violencia_tambem_e_meio():
    """O Código Eleitoral escreve "usar de violência", e a fórmula "mediante
    violência" não a alcança. O art. 301 saiu como não violento na primeira
    rodada."""
    assert classificar('Usar de violência ou grave ameaça para coagir alguém a votar:')['violencia'].valor == 'Sim'


def test_violencia_contra_a_coisa_nao_conta():
    """O furto qualificado por rompimento de obstáculo perdia ANPP e
    substituição, que o art. 28-A do CPP e o art. 44, I, do CP lhe dão: a
    violência deles é à PESSOA."""
    r = classificar('Se o crime é cometido com destruição ou rompimento de obstáculo à subtração da coisa:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'violencia-contra-a-coisa'


def test_crime_culposo_nunca_e_violento():
    r = classificar('Se a lesão é culposa:', elemento='Culposo')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'culposo-nao-e-violento'


def test_clausula_de_resultado_nao_descreve_a_conduta():
    """"Abandonar pessoa […] se resulta lesão corporal" continua sendo abandono.
    Sem este corte, todo parágrafo com resultado morte virava crime violento."""
    r = classificar('Expor ou abandonar recém-nascido para ocultar desonra própria. Se resulta lesão corporal de natureza grave:')
    assert r['violencia'].valor != 'Sim'


def test_matar_so_conta_com_vitima_pessoa():
    """O art. 29 da Lei 9.605 pune "matar, perseguir, caçar […] espécimes da
    fauna silvestre" — e virou crime violento na primeira rodada."""
    assert classificar('Matar, perseguir, caçar, apanhar espécimes da fauna silvestre:')['violencia'].valor == 'Não'
    assert classificar('Matar alguém:')['violencia'].valor == 'Sim'


def test_ameaca_de_mal_injusto_e_grave():
    """O art. 147 do CP não escreve "grave ameaça"."""
    r = classificar('Ameaçar alguém, por palavra, escrito ou gesto, ou qualquer outro meio simbólico, '
                    'de causar-lhe mal injusto e grave:')
    assert r['grave_ameaca'].valor == 'Sim'
    assert r['grave_ameaca'].regra == 'ameaca-mal-injusto-e-grave'


def test_ameaca_sem_qualificativo_pede_juizo():
    """Nem toda ameaça típica é a GRAVE ameaça que veda ANPP e substituição."""
    r = classificar('Utilizar, na cobrança de dívidas, de ameaça, coação ou constrangimento:')
    assert r['grave_ameaca'].valor is None
    assert r['grave_ameaca'].regra == 'ameaca-sem-qualificativo'


def test_meio_alternativo_pede_juizo():
    """"Por meio de violência, grave ameaça, fraude ou oferecimento de vantagem"
    (CP, art. 358): o tipo se consuma sem violência nenhuma."""
    r = classificar('Afastar concorrente ou licitante, por meio de violência, grave ameaça, fraude ou '
                    'oferecimento de vantagem:')
    assert r['violencia'].valor is None
    assert r['violencia'].regra == 'meio-alternativo'


def test_tipo_de_perigo_a_pessoa_pede_juizo():
    """Maus-tratos não descreve violência, e chamá-lo de não violento em
    silêncio esconderia a pergunta."""
    r = classificar('Expor a perigo a vida ou a saúde de pessoa sob sua autoridade, guarda ou vigilância:')
    assert r['violencia'].valor is None
    assert r['violencia'].regra == 'perigo-a-pessoa'


def test_silencio_da_lei_responde_nao():
    """Tipo que não descreve violência não a pressupõe. É leitura, e por isso
    sai marcada: dá para revisar só ela."""
    r = classificar('Fazer declaração falsa em documento público:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'silencio-da-lei'


def test_caput_responde_quando_o_paragrafo_cala():
    r = classificar('Se o crime é cometido contra pessoa maior de 60 anos:',
                    caput='Constranger alguém, mediante violência ou grave ameaça:')
    assert r['violencia'].valor == 'Sim'
    assert r['violencia'].origem == 'caput'


def test_o_modulo_nao_decide_por_falta_de_texto():
    r = classificar('', '')
    assert r['violencia'].valor is None and r['violencia'].origem == 'indecisa'
