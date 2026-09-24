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


def test_ameaca_sem_qualificativo_responde_nao_com_condicao():
    """Nem toda ameaça típica é a GRAVE ameaça que veda ANPP e substituição.

    Decisão 9 (23/09/2026): deixa de ser indeciso. A resposta é "Não" — o tipo
    se consuma com ameaça que não seja grave —, e a hipótese grave fica
    declarada em condição."""
    r = classificar('Utilizar, na cobrança de dívidas, de ameaça, coação ou constrangimento:')
    assert r['grave_ameaca'].valor == 'Não'
    assert r['grave_ameaca'].regra == 'ameaca-sem-qualificativo'
    assert r['grave_ameaca'].condicao is not None


def test_meio_alternativo_responde_nao_com_condicao():
    """"Por meio de violência, grave ameaça, fraude ou oferecimento de vantagem"
    (CP, art. 358): o tipo se consuma sem violência nenhuma. Decisão 8: "Não",
    com a hipótese violenta declarada em condição."""
    r = classificar('Afastar concorrente ou licitante, por meio de violência, grave ameaça, fraude ou '
                    'oferecimento de vantagem:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'meio-alternativo'
    assert r['violencia'].condicao is not None


def test_tipo_de_perigo_a_pessoa_responde_nao():
    """Decisão 10 (23/09/2026): tipo de perigo é "Não". A lei expõe a perigo; não
    descreve violência. Onde a execução admite agressão — maus-tratos, abuso de
    meios de correção —, a hipótese violenta vira condição."""
    r = classificar('Expor a perigo a vida ou a saúde de pessoa sob sua autoridade, guarda ou vigilância:')
    assert r['violencia'].valor == 'Não'
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


# -- Revisao fina de 23/09/2026: uma linha da tabela 1.2, um teste ----------

def test_a_violencia_dita_com_todas_as_letras():  # C6/a
    """O compilado escreve a violencia de varias formas, e nenhuma formula de
    meio alcancava "praticar violencia" ou "ato de violencia"."""
    for texto in ('Praticar violência contra o inferior:',
                  'Praticando violência contra superior:',
                  'Constranger alguém, consistindo o crime em violência:'):
        r = classificar(texto)
        assert r['violencia'].valor == 'Sim', texto


def test_violencia_ou_ameaca_sem_grave_e_meio_alternativo():  # 8/e
    """CP 329, CPM 177: "mediante violencia ou ameaca". A ameaca sem o
    qualificativo nao e a grave ameaca que veda ANPP."""
    r = classificar('Opor-se à execução de ato legal, mediante violência ou ameaça a funcionário:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'meio-alternativo'


def test_o_roubo_nao_e_meio_alternativo():
    """A forma e a mesma -- dois meios ligados por "ou" --, e o qualificativo e
    que decide. Sem este teste a regra de 8/e engolia o roubo."""
    r = classificar('Subtrair coisa móvel alheia, mediante grave ameaça ou violência à pessoa:')
    assert r['violencia'].valor == 'Sim'
    assert r['violencia'].regra == 'violencia-meio'


def test_violencia_contra_pessoa_ou_coisa_responde_nao_com_condicao():  # 8/f
    """CP 200: so a violencia dirigida a pessoa conta para o art. 44, I."""
    r = classificar('Participar de suspensão de trabalho, praticando violência contra pessoa ou coisa:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'violencia-a-pessoa-ou-a-coisa'
    assert 'contra a pessoa' in r['violencia'].condicao


def test_privacao_da_liberdade_responde_nao_com_condicao():  # 1a
    """Sequestrar nao descreve violencia: a privacao pode vir de fraude ou
    engano. A hipotese violenta fica na condicao."""
    for texto in ('Privar alguém de sua liberdade, mediante sequestro ou cárcere privado:',
                  'Sequestrar pessoa com o fim de obter vantagem:'):
        r = classificar(texto)
        assert r['violencia'].valor == 'Não', texto
        assert r['violencia'].regra in ('privacao-da-liberdade',
                                        'extorsao-mediante-sequestro'), texto
        assert r['violencia'].condicao is not None, texto


def test_extorsao_mediante_sequestro_separa_os_dois_campos():  # 1b
    """Violencia "Nao" com condicao; grave ameaca "Sim" -- exigir resgate com a
    vitima em poder do agente e a grave ameaca."""
    r = classificar('Sequestrar pessoa com o fim de obter, para si ou para outrem, '
                    'qualquer vantagem, como condição ou preço do resgate:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'extorsao-mediante-sequestro'
    assert r['violencia'].condicao is not None


def test_remocao_de_pessoa_ou_cadaver():  # 3
    """Lei 9.434, art. 14: condicao. "Em pessoa viva" ja resolve: "Sim"."""
    r = classificar('Remover tecidos, órgãos ou partes do corpo de pessoa ou cadáver, '
                    'em desacordo com esta Lei:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'pessoa-ou-cadaver'
    viva = classificar('Remover tecidos, órgãos ou partes do corpo em pessoa viva, '
                       'em desacordo com esta Lei:')
    assert viva['violencia'].valor == 'Sim'


def test_vitima_animal_nao_e_violencia():  # 7/l
    """Lei 9.605, art. 32: o art. 44, I, do CP fala em violencia A PESSOA."""
    r = classificar('Praticar ato de abuso ou maus-tratos a animais silvestres, '
                    'domésticos ou domesticados:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'vitima-animal'


def test_tipo_associativo_nao_herda_o_meio_do_crime_fim():  # 7/n, C7
    """Lei 12.850, art. 2o e CP 288-A: a conduta e associar-se. Nem a causa de
    aumento por arma muda isso."""
    for texto in ('Promover, constituir, financiar ou integrar organização criminosa:',
                  'Constituir organização criminosa para a prática de crimes:'):
        r = classificar(texto)
        assert r['violencia'].valor == 'Não', texto
        assert r['violencia'].regra == 'tipo-associativo', texto


def test_incitacao_com_pena_por_remissao_nao_herda_o_meio():  # 6/d
    """Lei 2.889, art. 3o: incitar e a conduta; a remissao e so da pena."""
    r = classificar('Incitar diretamente e publicamente alguém a cometer '
                    'qualquer dos crimes definidos no art. 1º:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'tipo-associativo'


def test_rixa_pressupoe_vias_de_fato():  # 7/o
    r = classificar('Participar de rixa, salvo para separar os contendores:')
    assert r['violencia'].valor == 'Sim'
    assert r['violencia'].regra == 'rixa'


def test_violencia_psicologica_e_institucional_respondem_nao():  # 11
    """Decisao 11: nao e a violencia do art. 44, I, do CP."""
    for texto in ('Causar dano emocional mediante violência psicológica:',
                  'Submeter a vítima a violência institucional:'):
        r = classificar(texto)
        assert r['violencia'].valor == 'Não', texto
        assert r['violencia'].regra == 'violencia-em-sentido-proprio', texto


def test_violencia_fisica_ou_psicologica_e_meio_alternativo():  # 11, remetendo a 8
    """CP 146-A, o bullying: o tipo se consuma so com a psicologica."""
    r = classificar('Intimidar sistematicamente, mediante violência física ou psicológica:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'meio-alternativo'
    assert r['violencia'].condicao is not None


def test_maus_tratos_ganha_condicao_e_perigo_puro_nao():  # 10
    com = classificar('Expor a perigo a vida ou a saúde de pessoa sob sua autoridade, '
                      'abusando de meios de correção ou disciplina:')
    assert com['violencia'].valor == 'Não'
    assert com['violencia'].condicao is not None
    sem = classificar('Abandonar pessoa que está sob seu cuidado, guarda ou vigilância:')
    assert sem['violencia'].valor == 'Não'
    assert sem['violencia'].condicao is None


def test_ameaca_de_mal_necessariamente_grave_responde_sim():  # 9, excecoes
    """CPM 242 e 245: o proprio texto descreve o mal como grave."""
    for texto in ('Obter vantagem mediante ameaça de emprego de violência à pessoa:',
                  'Obter vantagem mediante ameaça de revelar fato que lesa a reputação:'):
        r = classificar(texto)
        assert r['grave_ameaca'].valor == 'Sim', texto
        assert r['grave_ameaca'].regra == 'ameaca-de-mal-necessariamente-grave', texto


def test_culposo_vence_a_regra_de_nucleo():  # C7/s, id 695
    """CPM 206: "matar alguem" culposamente nao e crime violento para o art.
    44, I, do CP, que exige violencia dolosa."""
    r = classificar('Matar alguém culposamente:', elemento='Culposo')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'culposo-nao-e-violento'


def test_remissao_e_registrada_para_o_auditor_resolver():  # C6/c
    """O registro herda do dispositivo remetido; quem tem os dois textos e o
    Auditor, e por isso a regra so marca a remissao."""
    r = classificar('Aplicar-se as penas dos crimes definidos nos arts. 242 e 243:')
    assert r['violencia'].regra == 'remissao'
    assert r['violencia'].remissao is not None


def test_matar_vale_com_qualquer_vitima_humana():  # decisao 3
    """A lista de complementos era estreita e deixava de fora tres familias que
    a decisao 3 manda afirmar."""
    for texto in ('Matar, sob a influência do estado puerperal, o próprio filho:',
                  'Matar descendente, ascendente, dependente, enteado ou pessoa sob guarda:',
                  'Matar membros de um grupo nacional, étnico, religioso:'):
        r = classificar(texto)
        assert r['violencia'].valor == 'Sim', texto
        assert r['violencia'].regra == 'violencia-nucleo', texto


def test_mas_a_fauna_nao_vira_crime_violento():
    """O art. 29 da Lei 9.605 pune "matar, perseguir, cacar [...] especimes da
    fauna silvestre". A familia da vitima animal intercepta ANTES do nucleo, e e
    o que permite ao verbo valer sozinho."""
    r = classificar('Matar, perseguir, caçar, apanhar, utilizar espécimes da fauna silvestre:')
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].regra == 'vitima-animal'


def test_extorsao_mediante_sequestro_tem_grave_ameaca_propria():  # decisao 1b
    """Os dois campos se separam: a violencia e condicional -- a privacao pode
    ter comecado por engano --, mas a grave ameaca e do tipo."""
    r = classificar('Sequestrar pessoa com o fim de obter vantagem, como condição '
                    'ou preço do resgate:')
    assert r['grave_ameaca'].valor == 'Sim'
    assert r['grave_ameaca'].regra == 'extorsao-mediante-sequestro'
    assert r['violencia'].valor == 'Não'
    assert r['violencia'].condicao is not None
