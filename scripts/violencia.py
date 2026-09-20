# -*- coding: utf-8 -*-
"""Violência e grave ameaça derivadas do texto do dispositivo, por regra escrita.

**O que o campo afirma** (decisão do mantenedor, 19/09/2026): `violencia: "Sim"`
quer dizer que o tipo pressupõe **violência DOLOSA contra PESSOA** — como meio
(roubo, estupro, constrangimento) ou como resultado (homicídio, lesão corporal).
Violência contra a coisa não conta: o art. 44, I, do CP e o art. 28-A do CPP
falam em violência *à pessoa*, e o furto qualificado por rompimento de obstáculo
admite ANPP. Crime culposo não conta: a violência que veda substituição é dolosa.
`grave_ameaca: "Sim"` é a grave ameaça como meio do tipo.

**Por que derivar em vez de digitar.** Os dois campos vinham de herança do caput
(`criar.py`), sem critério escrito e sem fundamento: ninguém conseguia dizer, de
um registro, POR QUE ele era violento. Aqui cada resposta vem com a regra que a
produziu e o trecho da lei que a sustenta — e o que as regras não alcançam sai
como `indeciso`, que é uma resposta honesta e contável, não um "Não" disfarçado.

**Este módulo não escreve no catálogo.** Ele classifica; o Auditor compara com o
publicado e abre as listas. Quem decide assina.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field


def normalizar(texto: str) -> str:
    """Sem acento e em minúsculas: o compilado varia a grafia ('emprêgo', 'violencia')."""
    sem = unicodedata.normalize('NFD', texto or '')
    return ''.join(c for c in sem if unicodedata.category(c) != 'Mn').lower()


@dataclass
class Regra:
    id: str
    campo: str                 # "violencia" | "grave_ameaca"
    valor: str                 # "Sim" | "Não"
    padrao: re.Pattern
    nota: str
    # Quando casa, a regra encerra a classificação daquele campo.
    excludente: bool = False


# ── Violência contra a COISA: casa antes das demais e não marca violência ────
# "Rompimento de obstáculo" e "destruição" são violência contra o patrimônio. O
# registro do furto qualificado (CP, art. 155, §4º, I) estava marcado como
# violento e por isso perdia ANPP e substituição, que a lei lhe dá.
_COISA = re.compile(
    r'romp(imento|er|endo) de obstaculo|violencia contra a coisa'
    r'|destruicao ou rompimento de obstaculo', re.I)

# Palavras de violência em sentido que a regra não decide sozinha. Não são
# "não": são "alguém precisa ler". A violência psicológica do art. 147-B é o
# caso-limite — o tipo se chama violência e a conduta não é física.
_AMBIGUO = re.compile(
    r'violencia fisica ou psicologica|violencia psicologica ou fisica'
    r'|violencia psicologica|violencia moral|violencia patrimonial'
    r'|violencia institucional|violencia obstetrica|violencia politica', re.I)

# Tipos de PERIGO à pessoa: expõem a vida ou a saúde sem descrever violência
# (maus-tratos, abandono, perigo de contágio). Chamá-los de não violentos por
# silêncio esconde a pergunta; chamá-los de violentos afirma o que a lei não diz.
_PERIGO = re.compile(
    r'expor a perigo a vida ou a saude|abusando de meios de correcao'
    r'|privando-a de alimentacao|sujeitando-a a trabalho excessivo'
    r'|abandonar pessoa que esta sob (seu|sua) (cuidado|guarda)', re.I)

# "Ameaça" sem o qualificativo "grave". O art. 147 do CP resolve sozinho, porque
# diz "mal injusto e grave"; os demais — a cobrança vexatória do art. 71 do CDC,
# o assédio do art. 326-B do Código Eleitoral — pedem juízo: nem toda ameaça
# típica é a GRAVE ameaça que veda ANPP e substituição.
_AMEACA_SIMPLES = re.compile(r'\bamea[czç]\w*', re.I)

REGRAS: list[Regra] = [
    # ── Meio ────────────────────────────────────────────────────────────────
    Regra('violencia-meio', 'violencia', 'Sim', re.compile(
        r'mediante (o emprego de |emprego de )?violencia'
        r'|com (o emprego de )?violencia'
        r'|uso de violencia|usar de violencia|usando de violencia'
        r'|empreg\w* (de )?violencia'
        r'|violencia (a|contra a) pessoa'
        r'|vias de fato'
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
        r'\bmatar (alguem|outrem|mulher|o militar|superior|inferior)\b'
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
# vantagem" (CP, art. 358). O tipo se consuma sem violência nenhuma, e responder
# "Sim" bloquearia ANPP e substituição em condutas que as admitem; responder
# "Não" esconderia a hipótese violenta. A decisão é do mantenedor, tipo a tipo.
_ALTERNATIVO = re.compile(
    r'(violencia|grave ameaca)[^.]{0,80}\b(fraude|fraudulent\w+|artificio|ardil'
    r'|oferecimento de vantagem|suborno|qualquer outro meio|meio fraudulento)\b'
    r'|\b(fraude|artificio|ardil|qualquer outro meio)\b[^.]{0,80}(violencia|grave ameaca)', re.I)

# Cláusulas de RESULTADO. O que vem depois delas qualifica o crime pelo que dele
# decorre, e não descreve a conduta: o abandono de incapaz "se resulta lesão
# corporal" continua sendo abandono, e a ANPP e a substituição olham a CONDUTA.
# Sem este corte, todo parágrafo com resultado morte virava crime violento.
_RESULTADO = re.compile(
    r'\bse resulta\b|\bresulta[m]? (lesao|morte)|com resultado (morte|lesao)'
    r'|\bsobrevem\b|se da violencia resulta', re.I)


@dataclass
class Classificacao:
    valor: str | None                 # "Sim" | "Não" | None (indeciso)
    regra: str | None
    fundamento: str | None            # o trecho da lei que decidiu
    origem: str                       # "propria" | "caput" | "elemento" | "indecisa"
    alerta: str | None = None


def _casa(regra: Regra, texto: str) -> str | None:
    m = regra.padrao.search(texto)
    if not m:
        return None
    ini = max(0, m.start() - 40)
    return texto[ini:m.end() + 40].strip()


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
            # Regra de elemento, e não de texto: a violência que veda a
            # substituição (CP, art. 44, I) e a ANPP (CPP, art. 28-A) é dolosa.
            saida[campo] = Classificacao(
                'Não', 'culposo-nao-e-violento', None, 'elemento',
                'Crime culposo: a violência do art. 44, I, do CP é dolosa.')
            continue
        decidido = False
        for origem, texto in (('propria', proprio), ('caput', caput)):
            if not texto:
                continue
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
            ambiguo = _AMBIGUO.search(texto)
            if campo == 'violencia' and ambiguo:
                # Também antes das regras: "mediante violência física ou
                # psicológica" (CP, art. 146-A, o bullying) casa com a fórmula de
                # meio e sairia como violento, quando a conduta se consuma só com
                # a psicológica. Quem decide se aquilo é a violência do art. 28-A
                # do CPP é uma pessoa.
                saida[campo] = Classificacao(
                    None, 'violencia-em-sentido-proprio', ambiguo.group(0), 'indecisa',
                    'A lei usa "violência" em sentido que a regra não resolve.')
                decidido = True
                break
            alternativo = _ALTERNATIVO.search(texto)
            if alternativo:
                # Antes das regras, e não depois: "por meio de violência, grave
                # ameaça, fraude ou oferecimento de vantagem" nem sempre casa
                # com uma fórmula de meio, e o tipo cairia no silêncio como se
                # violência não houvesse.
                saida[campo] = Classificacao(
                    None, 'meio-alternativo', alternativo.group(0)[:120], 'indecisa',
                    'A violência é um meio ENTRE OUTROS, e o tipo se consuma sem ela.')
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
            if not proprio and not caput:
                # Sem texto não há leitura: o dispositivo não foi baixado, ou o
                # registro é de um artigo que o parser não estrutura.
                saida[campo] = Classificacao(None, None, None, 'indecisa',
                                             'Sem texto do dispositivo para ler.')
            elif campo == 'violencia' and (_PERIGO.search(proprio) or _PERIGO.search(caput)):
                saida[campo] = Classificacao(
                    None, 'perigo-a-pessoa', (_PERIGO.search(proprio) or _PERIGO.search(caput)).group(0),
                    'indecisa', 'Tipo de perigo à pessoa: a lei não descreve violência.')
            elif campo == 'grave_ameaca' and (_AMEACA_SIMPLES.search(proprio) or _AMEACA_SIMPLES.search(caput)):
                saida[campo] = Classificacao(
                    None, 'ameaca-sem-qualificativo',
                    (_AMEACA_SIMPLES.search(proprio) or _AMEACA_SIMPLES.search(caput)).group(0),
                    'indecisa', 'A lei fala em ameaça sem dizer que é grave.')
            elif _AMBIGUO.search(proprio) or _AMBIGUO.search(caput):
                # A lei usa palavra de violência em sentido que a regra não
                # resolve — "violência psicológica" (CP, art. 147-B) é violência
                # para o art. 44, I? Isso é juízo, e vai para a fila.
                achado = _AMBIGUO.search(proprio) or _AMBIGUO.search(caput)
                saida[campo] = Classificacao(
                    None, 'violencia-em-sentido-proprio', achado.group(0), 'indecisa',
                    'A lei usa a palavra em sentido que a regra não resolve.')
            else:
                # Silêncio da lei: o tipo não descreve violência nem grave ameaça,
                # e por isso não as pressupõe. É leitura, não suposição — a mesma
                # forma do art. 100 do CP para a ação penal. Sai marcada como
                # `silencio` justamente para que se possa revisar só ela.
                saida[campo] = Classificacao('Não', 'silencio-da-lei', None, 'silencio', None)
    return saida
