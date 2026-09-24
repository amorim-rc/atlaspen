# -*- coding: utf-8 -*-
"""Violência e grave ameaça derivadas do texto do dispositivo, por regra escrita.

**O que o campo afirma** (decisão do mantenedor, 19/09/2026): `violencia: "Sim"`
quer dizer que o tipo pressupõe **violência DOLOSA contra PESSOA** — como meio
(roubo, estupro, constrangimento) ou como resultado (homicídio, lesão corporal).
Violência contra a coisa não conta: o art. 44, I, do CP e o art. 28-A do CPP
falam em violência *à pessoa*, e o furto qualificado por rompimento de obstáculo
admite ANPP. Crime culposo não conta: a violência que veda substituição é dolosa.
`grave_ameaca: "Sim"` é a grave ameaça como meio do tipo.

**A terceira resposta, desde 23/09/2026.** Muita coisa que saía como `indeciso`
não era dúvida da lei: era tipo em que a violência é UM dos meios, ou em que ela
pode ou não estar presente. Para esses a resposta passou a ser "Não" com
**condição declarada** (`violencia_condicao`), na mesma forma de `acao_condicao`
e `hediondo_condicao`. "Não" porque o tipo se consuma sem violência — e negar
isso retiraria ANPP e substituição de quem tem direito a elas; condição porque a
hipótese violenta existe e o leitor precisa vê-la. O texto da condição é do
catálogo, registro a registro; aqui se decide QUE há condição, e de que família.

**Por que derivar em vez de digitar.** Os dois campos vinham de herança do caput
(`criar.py`), sem critério escrito e sem fundamento: ninguém conseguia dizer, de
um registro, POR QUE ele era violento. Aqui cada resposta vem com a regra que a
produziu e o trecho da lei que a sustenta.

**Este módulo não escreve no catálogo.** Ele classifica; o Auditor compara com o
publicado e abre as listas. Quem decide assina.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass


def normalizar(texto: str) -> str:
    """Sem acento e em minúsculas: o compilado varia a grafia ('emprêgo', 'violencia')."""
    sem = unicodedata.normalize('NFD', texto or '')
    return ''.join(c for c in sem if unicodedata.category(c) != 'Mn').lower()


@dataclass
class Classificacao:
    valor: str | None                 # "Sim" | "Não" | None (indeciso)
    regra: str | None
    fundamento: str | None            # o trecho da lei que decidiu
    origem: str                       # "propria" | "caput" | "elemento" | "indecisa" | "silencio"
    alerta: str | None = None
    # Quando existe, o registro tem de declarar `violencia_condicao`. O texto é
    # do catálogo; aqui vai o MODELO, que diz que hipótese a condição descreve.
    condicao: str | None = None
    # Remissão a outro dispositivo: o Auditor resolve e herda a classificação.
    remissao: str | None = None


@dataclass
class Regra:
    id: str
    campo: str                 # "violencia" | "grave_ameaca"
    valor: str                 # "Sim" | "Não"
    padrao: re.Pattern
    nota: str


# ── Violência contra a COISA: casa antes das demais e não marca violência ────
# "Rompimento de obstáculo" e "destruição" são violência contra o patrimônio. O
# registro do furto qualificado (CP, art. 155, §4º, I) estava marcado como
# violento e por isso perdia ANPP e substituição, que a lei lhe dá.
_COISA = re.compile(
    r'romp(imento|er|endo) de obstaculo|violencia contra a coisa'
    r'|destruicao ou rompimento de obstaculo', re.I)

# Violência que a lei dirige INDIFERENTEMENTE à pessoa ou à coisa (CP, art. 200:
# "violência contra pessoa ou coisa"). Decisão 8/f: "Não", com condição — só a
# dirigida à pessoa conta para o art. 44, I, do CP.
_PESSOA_OU_COISA = re.compile(
    r'violencia (contra|a) (a )?pessoa ou (contra )?(a )?coisa'
    r'|violencia (contra|a) (a )?coisa ou (contra )?(a )?pessoa', re.I)

# "Violência" em sentido próprio, não físico. Decisão 11: psicológica,
# institucional, política e obstétrica são "Não" — não são a violência do art.
# 44, I, do CP, que a doutrina e o CPP leem como violência à pessoa.
_SENTIDO_PROPRIO = re.compile(
    r'violencia psicologica|violencia moral|violencia patrimonial'
    r'|violencia institucional|violencia obstetrica|violencia politica', re.I)

# "Física OU psicológica": o tipo se consuma só com a psicológica, então é meio
# alternativo (CP, art. 146-A, o bullying) — decisão 11, remetendo à 8.
_FISICA_OU_PSICOLOGICA = re.compile(
    r'violencia fisica ou psicologica|violencia psicologica ou fisica', re.I)

# Tipos de PERIGO à pessoa. Decisão 10: "Não" — a lei não descreve violência.
_PERIGO = re.compile(
    r'expor a perigo a vida ou a saude'
    r'|privando-a de alimentacao|sujeitando-a a trabalho excessivo'
    r'|abandonar pessoa que esta sob (seu|sua) (cuidado|guarda)', re.I)

# Dentro dos tipos de perigo, os que podem ser executados com agressão física
# ganham condição (decisão 10): maus-tratos e abuso de meios de correção.
_PERIGO_COM_CONDICAO = re.compile(
    r'abusando de meios de correcao|maus-tratos|meios de correcao ou disciplina', re.I)

# Privação da liberdade. Decisão 1a: "Não" + condição — sequestrar não descreve
# violência; a privação pode ser obtida por fraude, engano ou aproveitamento.
_PRIVACAO_LIBERDADE = re.compile(
    r'privar alguem de sua liberdade|sequestrar|seqüestrar|carcere privado'
    r'|privacao da liberdade', re.I)

# Extorsão mediante sequestro. Decisão 1b: violência "Não" + condição, e grave
# ameaça "Sim" — exigir resgate com a vítima em poder do agente é grave ameaça.
_EXTORSAO_SEQUESTRO = re.compile(
    r'como condicao ou preco do resgate'
    r'|extorquir[^.]{0,40}mediante seq(u|ü)estro', re.I)

# Remoção de tecido "de pessoa ou cadáver" (Lei 9.434, art. 14). Decisão 3.
_REMOCAO = re.compile(r'remover (tecidos|orgaos|partes do corpo)|remocao de (tecidos|orgaos)', re.I)
_PESSOA_OU_CADAVER = re.compile(r'pessoa ou cadaver', re.I)
_EM_PESSOA_VIVA = re.compile(r'em pessoa viva', re.I)

# Vítima animal. Decisão 7/l: o art. 44, I, do CP fala em violência À PESSOA.
_ANIMAL = re.compile(
    r'especimes? da fauna|animais silvestres|animais domesticos'
    r'|animal (silvestre|domestico|nativo|exotico)|maus-tratos a animais', re.I)

# Tipo associativo. Decisão 7/n: associar-se é a conduta; o meio de execução do
# crime-fim não entra no tipo da associação, nem a arma que o majora.
_ASSOCIATIVO = re.compile(
    r'associar(em)?-se|constituir organizacao criminosa|promover, constituir, financiar'
    r'|integrar(em)?, pessoalmente ou por interposta pessoa, organizacao criminosa'
    r'|reunirem-se em (quadrilha|bando)|associacao criminosa', re.I)

# Associação e incitação COM PENA POR REMISSÃO (Lei 2.889, arts. 2º e 3º).
# Decisão 6/d: a conduta é associar-se ou incitar, e a remissão não importa o
# meio de execução do crime remetido.
_INCITACAO = re.compile(r'incitar (publica|diretamente)|incitacao', re.I)

# Rixa. Decisão 7/o: participar de rixa pressupõe vias de fato.
_RIXA = re.compile(r'participar de rixa', re.I)

# "Ameaça" sem o qualificativo "grave". Decisão 9: "Não" + condição.
_AMEACA_SIMPLES = re.compile(r'\bamea[czç]\w*', re.I)

# Exceções da decisão 9: o mal ameaçado já é, no próprio texto, necessariamente
# grave — CPM 242 (ameaça de violência à pessoa) e CPM 245 (ameaça de revelar
# fato que lesa a reputação).
_AMEACA_GRAVE_NO_TEXTO = re.compile(
    r'ameaca de (emprego de )?violencia (a|contra) (a )?pessoa'
    r'|ameaca de revelar fato|ameaca de causar-lhe mal', re.I)

REGRAS: list[Regra] = [
    # ── Meio ────────────────────────────────────────────────────────────────
    Regra('violencia-meio', 'violencia', 'Sim', re.compile(
        r'mediante (o emprego de |emprego de )?violencia'
        r'|com (o emprego de )?violencia'
        r'|uso de violencia|usar de violencia|usando de violencia'
        r'|empreg\w* (de )?violencia'
        r'|violencia (a|contra a) pessoa'
        r'|vias de fato'
        # Decisão C6/a: a violência dita com todas as letras, nas formas em que
        # o compilado a escreve e que nenhuma fórmula de meio alcançava.
        r'|pratic\w* violencia|praticando violencia|ato de violencia'
        r'|consiste em violencia|violencia ou grave ameaca'
        r'|reduzid[oa] a impossibilidade de resistencia', re.I),
        'A lei descreve a violência à pessoa como MEIO da conduta.'),
    # "Mediante ameaça", sem o qualificativo, NÃO entra aqui: o art. 147-B pune
    # causar dano emocional "mediante ameaça, constrangimento, humilhação", e
    # decidir que ali há a GRAVE ameaça do art. 28-A do CPP é juízo, não leitura.
    Regra('ameaca-meio', 'grave_ameaca', 'Sim', re.compile(
        r'grave ameaca|seria ameaca', re.I),
        'A lei descreve a grave ameaça como MEIO da conduta.'),
    # O art. 147 do CP não escreve "grave ameaça": escreve "ameaçar alguém […]
    # de causar-lhe mal injusto e grave". É a mesma coisa, e só uma regra
    # própria a alcança — foi o caso que mostrou que casar palavra solta não
    # serve de método.
    Regra('ameaca-mal-injusto-e-grave', 'grave_ameaca', 'Sim', re.compile(
        r'amea[czç]\w*[^.]{0,160}mal injusto e grave', re.I),
        'A lei descreve a ameaça de mal injusto e grave (CP, art. 147).'),
    # ── Resultado ───────────────────────────────────────────────────────────
    Regra('violencia-nucleo', 'violencia', 'Sim', re.compile(
        # "Matar" só conta com vítima PESSOA: o art. 29 da Lei 9.605 pune
        # "matar, perseguir, caçar […] espécimes da fauna silvestre", e o verbo
        # sozinho transformava crime ambiental em crime violento.
        #
        # A lista de complementos era estreita demais e deixava de fora três
        # famílias que a decisão 3 manda afirmar: o infanticídio ("matar […] o
        # próprio filho"), o vicaricídio ("matar descendente, ascendente,
        # dependente, enteado") e o genocídio militar ("matar membros de um
        # grupo nacional, étnico, religioso"). Desde 23/09/2026 o verbo vale
        # sozinho — a vítima animal é interceptada ANTES, pela família própria,
        # e não depende mais de o complemento estar nesta lista.
        r'\bmatar\b'
        r'|ofender a integridade corporal|ofensa a integridade corporal'
        r'|praticar tortura|submeter\w* alguem[^.]{0,60}sofrimento fisico'
        r'|constranger\w*[^.]{0,40}(violencia|forca)', re.I),
        'O NÚCLEO do tipo é a ofensa à vida ou à integridade corporal.'),
    # O aborto só é violento quando praticado SEM o consentimento da gestante: o
    # autoaborto e o aborto consentido não têm vítima constrangida, e o catálogo
    # sempre os registrou como não violentos.
    Regra('aborto-sem-consentimento', 'violencia', 'Sim', re.compile(
        r'provocar aborto[^.]{0,60}sem o consentimento', re.I),
        'Aborto provocado sem o consentimento da gestante (CP, art. 125).'),
]

# Violência ou grave ameaça como MEIO ALTERNATIVO, ao lado de meios que não são
# violentos: "por meio de violência, grave ameaça, fraude ou oferecimento de
# vantagem" (CP, art. 358). Decisão 8: "Não" + condição. O tipo se consuma sem
# violência nenhuma — responder "Sim" bloquearia ANPP e substituição em condutas
# que as admitem; a condição preserva a hipótese violenta à vista.
_ALTERNATIVO = re.compile(
    r'(violencia|grave ameaca)[^.]{0,80}\b(fraude|fraudulent\w+|artificio|ardil'
    r'|oferecimento de vantagem|suborno|qualquer outro meio|meio fraudulento)\b'
    r'|\b(fraude|artificio|ardil|qualquer outro meio)\b[^.]{0,80}(violencia|grave ameaca)'
    # Decisão 8/e: "violência OU ameaça", sem o "grave", também é meio
    # alternativo (CP 329, CPM 177, CPM 358, Lei 1.579, art. 4º, I).
    #
    # Os dois olhares são o que separa esta hipótese do roubo. "Mediante GRAVE
    # ameaça ou violência à pessoa" (CP 157) tem a mesma forma — dois meios
    # ligados por "ou" — e não é meio alternativo: os dois são violentos. O que
    # faz a diferença é o qualificativo, e só ele.
    r'|violencia ou (?!grave )amea[czç]a'
    r'|(?<!grave )\bamea[czç]a ou violencia', re.I)

# Remissão a outro dispositivo: o registro herda a classificação do remetido.
# Decisão C6/c. A regra REGISTRA a remissão; quem a resolve é o Auditor, que tem
# o texto dos dois dispositivos.
_REMISSAO = re.compile(
    r'definidos? nos? arts?\.\s*([\d\-ºA-Za-z,\s e]+)'
    r'|nas penas do art\.\s*([\d\-ºA-Za-z]+)'
    r'|qualquer dos crimes definidos no art\.\s*([\d\-ºA-Za-z]+)'
    r'|nas penas cominadas ao art\.\s*([\d\-ºA-Za-z]+)', re.I)

# Cláusulas de RESULTADO. O que vem depois delas qualifica o crime pelo que dele
# decorre, e não descreve a conduta: o abandono de incapaz "se resulta lesão
# corporal" continua sendo abandono, e a ANPP e a substituição olham a CONDUTA.
# Sem este corte, todo parágrafo com resultado morte virava crime violento.
_RESULTADO = re.compile(
    r'\bse resulta\b|\bresulta[m]? (lesao|morte)|com resultado (morte|lesao)'
    r'|\bsobrevem\b|se da violencia resulta', re.I)


def _casa(regra: Regra, texto: str) -> str | None:
    m = regra.padrao.search(texto)
    if not m:
        return None
    ini = max(0, m.start() - 40)
    return texto[ini:m.end() + 40].strip()


def _trecho(m: re.Match, texto: str) -> str:
    ini = max(0, m.start() - 40)
    return texto[ini:m.end() + 40].strip()


def _cond(regra: str, modelo: str, trecho: str, origem: str) -> Classificacao:
    return Classificacao('Não', regra, trecho, origem, condicao=modelo)


def _violencia_por_familia(texto: str, origem: str, bruto: str) -> Classificacao | None:
    """As famílias do campo `violencia`, na ordem em que a decisão as resolve."""
    if m := _ANIMAL.search(texto):
        return Classificacao(
            'Não', 'vitima-animal', _trecho(m, texto), origem,
            'A vítima é animal; o art. 44, I, do CP exige violência À PESSOA.')
    if m := _RIXA.search(texto):
        return Classificacao('Sim', 'rixa', _trecho(m, texto), origem,
                             'Participar de rixa pressupõe vias de fato.')
    if (m := _INCITACAO.search(texto)) or (m := _ASSOCIATIVO.search(texto)):
        return Classificacao(
            'Não', 'tipo-associativo', _trecho(m, texto), origem,
            'A conduta é associar-se, integrar ou incitar; o meio de execução do '
            'crime-fim não entra neste tipo.')
    if m := _EXTORSAO_SEQUESTRO.search(texto):
        return _cond('extorsao-mediante-sequestro',
                     'Sim quando a privação da liberdade é executada ou mantida '
                     'mediante violência à pessoa ({disp}).', _trecho(m, texto), origem)
    if m := _PRIVACAO_LIBERDADE.search(texto):
        return _cond('privacao-da-liberdade',
                     'Sim quando a privação da liberdade é executada ou mantida '
                     'mediante violência à pessoa ou grave ameaça ({disp}).',
                     _trecho(m, texto), origem)
    if _REMOCAO.search(texto):
        # Lei 9.434, art. 14. A vítima decide: em cadáver não há violência a
        # pessoa nenhuma, e o tipo abrange as duas hipóteses num texto só.
        if m := _EM_PESSOA_VIVA.search(texto):
            return Classificacao('Sim', 'remocao-em-pessoa-viva', _trecho(m, texto), origem,
                                 'A remoção é feita em pessoa viva.')
        if m := _PESSOA_OU_CADAVER.search(texto):
            return _cond('pessoa-ou-cadaver',
                         'Sim quando a remoção é feita em pessoa viva ({disp}).',
                         _trecho(m, texto), origem)
    if m := _PESSOA_OU_COISA.search(texto):
        return _cond('violencia-a-pessoa-ou-a-coisa',
                     'Sim somente quando a violência é praticada contra a pessoa ({disp}).',
                     _trecho(m, texto), origem)
    if m := _FISICA_OU_PSICOLOGICA.search(texto):
        return _cond('meio-alternativo',
                     'Sim quando o meio empregado for violência à pessoa ({disp}).',
                     _trecho(m, texto), origem)
    if m := _SENTIDO_PROPRIO.search(texto):
        return Classificacao(
            'Não', 'violencia-em-sentido-proprio', _trecho(m, texto), origem,
            'A lei usa "violência" em sentido não físico; não é a violência do '
            'art. 44, I, do CP.')
    return None


def _grave_ameaca_por_familia(texto: str, origem: str) -> Classificacao | None:
    """As famílias que decidem o campo `grave_ameaca` antes das regras gerais."""
    if m := _EXTORSAO_SEQUESTRO.search(texto):
        # Decisão 1b. Aqui os dois campos se separam: a violência é condicional
        # — a privação pode ter sido obtida por engano —, mas a grave ameaça é
        # do tipo. Exigir resgate tendo a vítima em poder do agente É a ameaça,
        # e ela não depende de como o sequestro começou.
        return Classificacao(
            'Sim', 'extorsao-mediante-sequestro', _trecho(m, texto), origem,
            'A exigência de resgate com a vítima em poder do agente é a grave ameaça.')
    if m := _ANIMAL.search(texto):
        return Classificacao(
            'Não', 'vitima-animal', _trecho(m, texto), origem,
            'A vítima é animal; não há pessoa a quem ameaçar.')
    if (m := _INCITACAO.search(texto)) or (m := _ASSOCIATIVO.search(texto)):
        return Classificacao(
            'Não', 'tipo-associativo', _trecho(m, texto), origem,
            'A conduta é associar-se, integrar ou incitar; o meio de execução do '
            'crime-fim não entra neste tipo.')
    return None


def classificar(registro: dict, texto_proprio: str, texto_caput: str = '') -> dict:
    """{'violencia': Classificacao, 'grave_ameaca': Classificacao}.

    `texto_proprio` é o do dispositivo do registro (com o inciso, quando o
    registro é de inciso); `texto_caput`, o do caput do mesmo artigo, que só
    responde quando o próprio não diz nada — e a resposta sai marcada como
    herdada, porque herança é proposta, não leitura.
    """
    saida: dict[str, Classificacao] = {}
    culposo = (registro.get('elemento') or '') == 'Culposo'
    proprio, caput = normalizar(texto_proprio), normalizar(texto_caput)
    # A conduta vem antes da cláusula de resultado; o que vem depois dela não
    # descreve o que o agente fez.
    proprio, caput = _RESULTADO.split(proprio)[0], _RESULTADO.split(caput)[0]

    for campo in ('violencia', 'grave_ameaca'):
        if culposo:
            # Regra de elemento, e não de texto, e ela vence as de núcleo: a
            # violência que veda a substituição (CP, art. 44, I) e a ANPP (CPP,
            # art. 28-A) é dolosa. Era o caso do art. 206 do CPM (id 695).
            saida[campo] = Classificacao(
                'Não', 'culposo-nao-e-violento', None, 'elemento',
                'Crime culposo: a violência do art. 44, I, do CP é dolosa.')
            continue
        decidido = False
        for origem, texto in (('propria', proprio), ('caput', caput)):
            if not texto:
                continue
            fam = (_violencia_por_familia(texto, origem, texto_proprio)
                   if campo == 'violencia' else _grave_ameaca_por_familia(texto, origem))
            if fam is not None:
                saida[campo] = fam
                decidido = True
                break
            # A violência contra a coisa só responde quando NENHUM texto — nem o
            # do dispositivo, nem o do caput — descreve violência à pessoa. O
            # roubo majorado por destruição de obstáculo (CP, art. 157, §2º-A, II)
            # saía não violento, embora o caput do roubo exija violência à pessoa.
            tem_pessoa = any(
                _casa(r, t) for r in REGRAS if r.campo == 'violencia' and r.valor == 'Sim'
                for t in (proprio, caput) if t)
            if campo == 'violencia' and _COISA.search(texto) and not tem_pessoa:
                saida[campo] = Classificacao(
                    'Não', 'violencia-contra-a-coisa', _COISA.search(texto).group(0), origem,
                    'A violência do dispositivo é contra a COISA, e o art. 44, I, do CP '
                    'exige violência à pessoa.')
                decidido = True
                break
            if m := _ALTERNATIVO.search(texto):
                # Antes das regras, e não depois: "por meio de violência, grave
                # ameaça, fraude ou oferecimento de vantagem" nem sempre casa
                # com uma fórmula de meio, e o tipo cairia no silêncio como se
                # violência não houvesse.
                saida[campo] = _cond(
                    'meio-alternativo',
                    'Sim quando o meio empregado for violência à pessoa ou grave '
                    'ameaça ({disp}).', _trecho(m, texto), origem)
                decidido = True
                break
            for regra in REGRAS:
                if regra.campo != campo:
                    continue
                trecho = _casa(regra, texto)
                if not trecho:
                    continue
                saida[campo] = Classificacao(regra.valor, regra.id, trecho, origem, None)
                decidido = True
                break
            if decidido:
                break
        if not decidido:
            juntos = proprio or caput
            if not proprio and not caput:
                # Sem texto não há leitura: o dispositivo não foi baixado, ou o
                # registro é de um artigo que o parser não estrutura.
                saida[campo] = Classificacao(None, None, None, 'indecisa',
                                             'Sem texto do dispositivo para ler.')
            elif m := _REMISSAO.search(juntos):
                # Decisão C6/c: o registro herda do dispositivo remetido. Quem
                # resolve é o Auditor, que tem os dois textos.
                saida[campo] = Classificacao(
                    None, 'remissao', _trecho(m, juntos), 'indecisa',
                    'A pena vem por remissão: a classificação é a do tipo remetido.',
                    remissao=next(g for g in m.groups() if g))
            elif campo == 'violencia' and (_PERIGO.search(proprio) or _PERIGO.search(caput)):
                achado = _PERIGO.search(proprio) or _PERIGO.search(caput)
                # Decisão 10: tipo de perigo é "Não". Quando a execução admite
                # agressão física — maus-tratos, abuso de meios de correção —,
                # a hipótese violenta fica declarada em condição.
                if _PERIGO_COM_CONDICAO.search(juntos):
                    saida[campo] = _cond(
                        'perigo-a-pessoa',
                        'Sim quando o abuso dos meios de correção ou disciplina, ou os '
                        'maus-tratos, envolvem violência física ({disp}).',
                        achado.group(0), 'propria')
                else:
                    saida[campo] = Classificacao(
                        'Não', 'perigo-a-pessoa', achado.group(0), 'propria',
                        'Tipo de perigo à pessoa: a lei não descreve violência.')
            elif campo == 'grave_ameaca' and (_AMEACA_SIMPLES.search(proprio)
                                              or _AMEACA_SIMPLES.search(caput)):
                achado = _AMEACA_SIMPLES.search(proprio) or _AMEACA_SIMPLES.search(caput)
                if m := _AMEACA_GRAVE_NO_TEXTO.search(juntos):
                    # Decisão 9, exceções: o mal ameaçado já é, no texto,
                    # necessariamente grave (CPM 242 e 245).
                    saida[campo] = Classificacao(
                        'Sim', 'ameaca-de-mal-necessariamente-grave', _trecho(m, juntos),
                        'propria', 'O próprio tipo descreve o mal ameaçado como grave.')
                else:
                    saida[campo] = _cond(
                        'ameaca-sem-qualificativo',
                        'Sim quando a ameaça empregada for grave ({disp}).',
                        achado.group(0), 'propria')
            elif _SENTIDO_PROPRIO.search(juntos):
                m = _SENTIDO_PROPRIO.search(juntos)
                saida[campo] = Classificacao(
                    'Não', 'violencia-em-sentido-proprio', _trecho(m, juntos), 'propria',
                    'A lei usa "violência" em sentido não físico.')
            else:
                # Silêncio da lei: o tipo não descreve violência nem grave ameaça,
                # e por isso não as pressupõe. É leitura, não suposição — a mesma
                # forma do art. 100 do CP para a ação penal. Sai marcada como
                # `silencio` justamente para que se possa revisar só ela.
                saida[campo] = Classificacao('Não', 'silencio-da-lei', None, 'silencio', None)
    return saida
