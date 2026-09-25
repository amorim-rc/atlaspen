# -*- coding: utf-8 -*-
"""A espécie de ação penal, derivada do texto da lei, com o dispositivo que a decide.

**O problema.** O catálogo afirma a ação penal de 1.512 registros e não diz de
onde ela vem. Marcar os 1.446 incondicionados como "regra geral, art. 100" seria
preenchimento por plausibilidade — a regra do `AGENTS.md` proíbe, e com razão: em
19/09/2026 a conferência à mão dos 66 não incondicionados achou seis grupos
errados, um deles porque uma lei de 2026 revogou o parágrafo que condicionava a
ação do estelionato.

**O método.** A ação penal é definida por dispositivo, não por doutrina, e os
dispositivos são reconhecíveis: "somente se procede mediante queixa", "dependerá
de representação", "procede-se mediante requisição do Ministro da Justiça". Este
módulo varre o diploma, acha essas regras, descobre o ALCANCE de cada uma — o
próprio artigo, os artigos que ela lista, ou o capítulo e o título em que está —
e responde, para cada registro, qual regra o alcança. Onde nenhuma alcança, a
resposta é a regra geral do art. 100 do CP, e aí "silêncio" é achado verificado:
a varredura passou pelo diploma inteiro e não encontrou regra.

**O que ele não decide.** Regra com ressalva ("salvo", "se a propriedade é
particular", "em prejuízo de cônjuge") não fixa a espécie: ela depende do caso, e
o catálogo tem campo próprio para isso (`acao_condicao`). Esses saem como juízo.

Este módulo não escreve no catálogo.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass


def normalizar(texto: str) -> str:
    sem = unicodedata.normalize('NFD', texto or '')
    return ''.join(c for c in sem if unicodedata.category(c) != 'Mn').lower()


# ── Fórmulas que definem a espécie ──────────────────────────────────────────
FORMULAS: list[tuple[str, str, re.Pattern]] = [
    ('Ação Penal Privada', 'queixa', re.compile(
        r'(somente )?se procede mediante queixa|depende de queixa|mediante queixa do', re.I)),
    ('Pública Condicionada à Requisição', 'requisicao', re.compile(
        r'mediante requisicao do ministro da justica', re.I)),
    ('Pública Condicionada à Representação', 'representacao', re.compile(
        r'(somente )?se procede mediante representacao|procede-se mediante representacao'
        r'|depender[a]? de representacao|depende de representacao', re.I)),
    ('Pública Incondicionada', 'incondicionada', re.compile(
        r'procede-se mediante acao penal publica incondicionada'
        r'|a acao penal (e|sera) publica incondicionada'
        r'|acao penal (e|sera) incondicionada'
        r'|sao de acao (penal )?publica', re.I)),
]

# Ressalva: a regra existe, mas o que ela vale depende do caso.
_RESSALVA = re.compile(
    r'\bsalvo\b|se a propriedade e particular|em prejuizo\b|se nao ha emprego de violencia'
    r'|quando resultar prejuizo|se o crime e cometido em prejuizo'
    # A regra que desce ao INCISO não vale para o artigo inteiro: o art. 167 só
    # manda queixa no art. 163, caput, e no inciso IV do parágrafo único — o
    # dano qualificado dos incisos I a III segue de ação pública.
    r'|\binciso\b|\bincisos\b', re.I)

# Regra distribuída em incisos, e as fórmulas como aparecem DENTRO deles.
_PROCEDE_SE_MEDIANTE = re.compile(r'procede-se mediante:?\s*$|procede-se mediante:', re.I)
FORMULAS_INCISO: list[tuple[str, str, re.Pattern]] = [
    ('Ação Penal Privada', 'queixa', re.compile(r'^\s*queixa\b', re.I)),
    ('Pública Condicionada à Requisição', 'requisicao', re.compile(
        r'requisicao do ministro da justica', re.I)),
    ('Pública Condicionada à Representação', 'representacao', re.compile(
        r'acao penal publica condicionada a representacao|mediante representacao', re.I)),
    ('Pública Incondicionada', 'incondicionada', re.compile(
        r'acao penal publica incondicionada', re.I)),
]

_SO_CAPUT = re.compile(r'no caput do art', re.I)
_PARAGRAFOS_CITADOS = re.compile(r'§{1,2}\s*(\d+)', re.I)

# Alcance declarado no próprio texto da regra.
_NESTE_CAPITULO = re.compile(r'(neste|deste) capitulo|nos crimes previstos neste capitulo', re.I)
_NESTA_SECAO = re.compile(r'(nesta|desta) secao', re.I)
_NESTE_TITULO = re.compile(r'(neste|deste) titulo|capitulos i e ii deste titulo', re.I)
_ARTIGOS_CITADOS = re.compile(r'art(?:igo)?s?\.?\s*(\d+(?:-[a-z])?)', re.I)

# A própria regra exclui artigos do seu alcance: "Nos crimes previstos nesta
# Seção, somente se procede mediante representação […], com exceção do crime
# previsto no art. 169 desta Lei, em que a ação é pública incondicionada"
# (Lei 14.597, art. 172). Sem ler a exceção, a regra contradizia o artigo que
# ela mesma ressalva.
_EXCETO = re.compile(
    r'(?:com excecao|excetuad[oa]s?|salvo|ressalvad[oa]s?)[^.]{0,80}?'
    r'art(?:igo)?s?\.?\s*(\d+(?:-[a-z])?(?:\s*(?:,|e)\s*\d+(?:-[a-z])?)*)', re.I)
_CAPITULOS_CITADOS = re.compile(r'capitulos? ([ivx]+(?: e [ivx]+)?) deste titulo', re.I)


@dataclass
class RegraAcao:
    especie: str
    formula: str
    dispositivo: str           # "Art. 145, caput"
    texto: str
    ressalva: bool
    alcance: dict              # {'artigos': [...]} | {'capitulo': 'V'} | {'titulo': 'VI'}


def topografia(bruto: str) -> list[tuple[int, str, str]]:
    """Marcadores de TÍTULO, CAPÍTULO e SEÇÃO, com a posição em que aparecem.

    Sem distinguir caixa, de propósito. O Planalto escreve os títulos e capítulos
    em versais e as seções em caixa alta e baixa — "CAPÍTULO VI" e, logo abaixo,
    "Seção I". Lendo só as versais, a seção desaparecia da topografia, e uma
    regra dita "nesta Seção" caía para o capítulo inteiro: o art. 172 da Lei
    14.597 passava a condicionar à representação os sete crimes do Capítulo VI,
    quando alcança só os da sua própria Seção.
    """
    return [(m.start(), m.group(1).upper(), m.group(2).upper())
            for m in re.finditer(
                r'\b(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O)\s+([IVXL]+(?:-[A-Z])?)\b',
                bruto, re.I)]


def posicoes_dos_artigos(bruto: str) -> dict[str, int]:
    """Onde cada artigo é ENUNCIADO (e não citado): "Art. 155 - Subtrair…".

    A citação dentro de outro artigo não abre dispositivo, e usá-la deslocaria o
    artigo para o capítulo errado.
    """
    pos: dict[str, int] = {}
    for m in re.finditer(r'\bArt\.\s*(\d+(?:-[A-Z])?)\s*(?:[ºo°]\s*)?[.\-–—]?\s+[A-ZÀ-Ý“"(]', bruto):
        pos.setdefault(m.group(1), m.start())
        pos[m.group(1)] = m.start()
    return pos


def onde_esta(artigo: str, marcadores: list, posicoes: dict[str, int], secao: bool = False) -> dict:
    """{'titulo': 'VI', 'capitulo': 'I-A', 'secao': 'II'} do artigo, pela posição.

    Os três são guardados SEPARADOS e sempre comparados em cadeia. "Capítulo V"
    não identifica nada sozinho: o Código Penal tem um em cada Título, e foi por
    isso que a regra do art. 145 ("neste Capítulo", nos crimes contra a honra)
    alcançava os Capítulos V dos Títulos II, VI e X — a C1 da revisão fina.
    """
    p = posicoes.get(artigo)
    if p is None:
        return {}
    lugar: dict[str, str] = {}
    for pos, tipo, numero in marcadores:
        if pos > p:
            break
        if tipo.startswith('T'):
            lugar = {'titulo': numero}
        elif tipo.startswith('C'):
            lugar['capitulo'] = numero
            lugar.pop('secao', None)
        elif tipo.startswith('S'):
            lugar['secao'] = numero
    return lugar


def achar_regras(dispositivos: dict, bruto: str) -> list[RegraAcao]:
    """As regras de ação penal do diploma, com o alcance de cada uma."""
    marcadores, posicoes = topografia(bruto), posicoes_dos_artigos(bruto)
    regras: list[RegraAcao] = []
    for chave, d in dispositivos.items():
        texto = normalizar(getattr(d, 'texto', '') or '')
        if not texto:
            continue
        artigo_base = chave.split('|')[0].replace('Art. ', '')
        # Regra distribuída em INCISOS: "Art. 186. Procede-se mediante: I -
        # queixa, nos crimes previstos no caput do art. 184; II - ação penal
        # pública incondicionada, nos crimes previstos nos §§ 1º e 2º…". Cada
        # inciso é uma regra com espécie e alcance próprios, e ler só o caput
        # devolvia a regra geral para o art. 184, que é de queixa.
        if _PROCEDE_SE_MEDIANTE.search(texto) and getattr(d, 'incisos', None):
            for inciso in d.incisos:
                t_inc = normalizar(inciso.get('texto', ''))
                for especie, formula, padrao in FORMULAS_INCISO:
                    if not padrao.search(t_inc):
                        continue
                    citados = _ARTIGOS_CITADOS.findall(t_inc)
                    alcance: dict = {'artigos': citados} if citados else {}
                    # "no caput do art. 184" e "nos §§ 1º e 2º do art. 184" são
                    # regras DIFERENTES sobre o mesmo artigo: sem descer ao
                    # marcador, a queixa do caput contaminava os parágrafos, que
                    # a lei manda apurar por ação pública incondicionada.
                    if citados and _SO_CAPUT.search(t_inc):
                        alcance['marcadores'] = ['caput']
                    pars = _PARAGRAFOS_CITADOS.findall(t_inc)
                    if citados and pars:
                        alcance['marcadores'] = [f'§ {n}º' for n in pars]
                    regras.append(RegraAcao(
                        especie=especie, formula=f'{formula}-inciso',
                        dispositivo=f"Art. {artigo_base}, {inciso.get('marcador', '?')}",
                        texto=inciso.get('texto', '')[:220],
                        ressalva=bool(_RESSALVA.search(t_inc)) or not citados,
                        alcance=alcance))
                    break
            continue
        for especie, formula, padrao in FORMULAS:
            if not padrao.search(texto):
                continue
            artigo = chave.split('|')[0].replace('Art. ', '')
            alcance: dict = {}
            if _NESTA_SECAO.search(texto):
                # A Lei 14.597/2023 (Lei Geral do Esporte) define a ação penal
                # por SEÇÃO, e não por capítulo: "nos crimes previstos nesta
                # Seção, somente se procede mediante representação". A cadeia
                # inteira vai junto: "Seção II" se repete diploma afora.
                lugar = onde_esta(artigo, marcadores, posicoes, secao=True)
                alcance = {k: lugar.get(k) for k in ('titulo', 'capitulo', 'secao')
                           if lugar.get(k)}
            elif _NESTE_CAPITULO.search(texto):
                # A cadeia inteira, e não só o capítulo (C1). Descartar o título
                # fazia "neste Capítulo" valer para todo Capítulo V do diploma.
                lugar = onde_esta(artigo, marcadores, posicoes)
                alcance = {k: lugar.get(k) for k in ('titulo', 'capitulo') if lugar.get(k)}
            elif _NESTE_TITULO.search(texto):
                lugar = onde_esta(artigo, marcadores, posicoes)
                caps = _CAPITULOS_CITADOS.search(texto)
                alcance = {'titulo': lugar.get('titulo'),
                           'capitulos': [c.strip().upper() for c in caps.group(1).split(' e ')]
                           if caps else None}
            else:
                citados = [a for a in _ARTIGOS_CITADOS.findall(texto) if a != artigo]
                alcance = {'artigos': citados} if citados else {'artigos': [artigo]}
            # A exceção escrita na própria regra sai do alcance dela. É leitura
            # do texto, não juízo: o art. 172 da Lei 14.597 diz, com todas as
            # letras, que o art. 169 fica de fora.
            if excecao := _EXCETO.search(texto):
                fora = _ARTIGOS_CITADOS.findall(excecao.group(0))
                if fora:
                    alcance['exceto'] = fora
            regras.append(RegraAcao(
                especie=especie, formula=formula,
                dispositivo=f"Art. {artigo}" + ('' if chave.endswith('caput') else f", {chave.split('|')[1]}"),
                texto=(getattr(d, 'texto', '') or '')[:220],
                ressalva=bool(_RESSALVA.search(texto)),
                alcance=alcance))
            break
    return regras


def alcanca(regra: RegraAcao, artigo: str, lugar: dict, marcador: str = 'caput') -> bool:
    a = regra.alcance
    # O que a própria regra exclui não é alcançado por ela, venha o alcance de
    # artigo citado ou de referência relativa.
    if artigo.upper() in [x.upper() for x in a.get('exceto', [])]:
        return False
    if a.get('artigos'):
        # Sem reduzir o sufixo: o art. 147-B (violência psicológica) NÃO é o
        # art. 147, e a regra de representação do §2º do 147 não o alcança.
        # A comparação ignora a caixa porque a regra foi lida do texto
        # normalizado ("art. 154-a") e o registro traz "Art. 154-A".
        if artigo.upper() not in [x.upper() for x in a['artigos']]:
            return False
        if a.get('marcadores'):
            return marcador in a['marcadores']
        return True
    # Referência relativa: a cadeia inteira tem de bater, do título para baixo.
    # "Nesta Seção" é Seção X do Capítulo Y do Título Z, e não toda Seção X do
    # diploma; "neste Capítulo", idem. Comparar só o degrau mais fundo foi a C1.
    if a.get('secao'):
        return all(lugar.get(k) == a.get(k) for k in ('titulo', 'capitulo', 'secao')
                   if a.get(k))
    if a.get('capitulo'):
        return all(lugar.get(k) == a.get(k) for k in ('titulo', 'capitulo') if a.get(k))
    if a.get('titulo'):
        if lugar.get('titulo') != a['titulo']:
            return False
        if a.get('capitulos'):
            return lugar.get('capitulo') in a['capitulos']
        return True
    return False


@dataclass
class Classificacao:
    especie: str | None
    fundamento: str | None
    regra: str | None
    ressalva: bool = False


REGRA_GERAL = Classificacao(
    'Pública Incondicionada',
    'regra geral, CP, art. 100: nenhuma regra de ação penal do diploma alcança o dispositivo',
    'silencio-do-diploma')


# O art. 182 do CP condiciona à representação os crimes patrimoniais entre
# parentes próximos. O art. 183 diz onde essa regra NÃO se aplica, e o inciso I
# é o que mais alcança:
#
#   Art. 183. Não se aplica o disposto nos dois artigos anteriores:
#   I - se o crime é de roubo ou de extorsão, ou, em geral, quando haja emprego
#       de grave ameaça ou violência à pessoa;
#
# Sem ele, a regra do art. 182 alcançava o roubo, a extorsão, a extorsão
# mediante sequestro e o latrocínio, e o auditor mandava 22 registros para
# "pede juízo" afirmando que a ação deles poderia depender de representação. É
# leitura de dispositivo, não juízo: o próprio Código diz que não se aplica.
_ART_182 = re.compile(r'art\.\s*182', re.I)
_ROUBO_OU_EXTORSAO = re.compile(r'roubo|extors[ãa]o|latroc[íi]nio', re.I)


def _fora_pelo_art_183(regra: RegraAcao, registro: dict) -> bool:
    """O art. 183, I, tira este registro do alcance do art. 182?

    A violência e a grave ameaça saem dos campos do próprio registro, que são
    derivados e conferidos por `scripts/violencia.py` — e não de uma segunda
    leitura do texto, que poderia discordar da primeira.

    A extorsão INDIRETA (art. 160) entra pelo *nomen iuris*: o Capítulo II do
    Título II se chama "Do roubo e da extorsão", e o art. 183, I, diz "se o
    crime é de roubo ou de extorsão" — pela espécie, e não pelo meio empregado
    no caso (decisão C2 de 23/09/2026, grau M).
    """
    if 'Art. 182' not in regra.dispositivo and not _ART_182.search(regra.texto or ''):
        return False
    if _ROUBO_OU_EXTORSAO.search(registro.get('crime') or ''):
        return True
    return 'Sim' in (registro.get('violencia'), registro.get('grave_ameaca'))


def classificar(registro: dict, regras: list[RegraAcao], lugar: dict) -> Classificacao:
    """A regra que alcança o registro; se nenhuma, a regra geral do art. 100."""
    artigo = re.sub(r'^Art\.?\s*', '', (registro.get('artigo') or '').split(',')[0]).strip()
    artigo = re.sub(r'[ºo°].*$', '', artigo).strip()
    externa = regra_externa(registro)
    if externa:
        return externa
    marcador = 'caput'
    resto = (registro.get('artigo') or '').split(',', 1)
    if len(resto) > 1 and '§' in resto[1]:
        m = re.search(r'§\s*(\d+)', resto[1])
        if m:
            marcador = f'§ {m.group(1)}º'
    candidatas = [r for r in regras if alcanca(r, artigo, lugar, marcador)
                  and not _fora_pelo_art_183(r, registro)]
    if not candidatas:
        return REGRA_GERAL
    # A regra do PRÓPRIO artigo vence a do capítulo, e esta vence a do título.
    candidatas.sort(key=lambda r: (0 if r.alcance.get('artigos') == [artigo] else
                                   1 if r.alcance.get('artigos') else
                                   2 if r.alcance.get('capitulo') else 3))
    r = candidatas[0]
    return Classificacao(r.especie, f"{r.dispositivo}: {r.texto}", r.formula, r.ressalva)


# ── Regras de FORA do diploma ───────────────────────────────────────────────
# A ação penal de um tipo pode ser definida por outra lei. A Lei 9.099/95, art.
# 88, condicionou à representação as lesões corporais leves e culposas, onde
# quer que estejam — menos na Justiça Militar, que o art. 90-A exclui. Cada
# entrada é uma leitura conferida, com o dispositivo que a sustenta.
EXTERNAS: list[tuple[re.Pattern, re.Pattern, str, str]] = [
    (re.compile(r'^CP$'), re.compile(r'^Art\. 129(, caput|, §4º|, §6º|, §7º)?$'),
     'Pública Condicionada à Representação',
     'Lei 9.099/95, art. 88: dependerá de representação a ação penal relativa aos '
     'crimes de lesões corporais leves e lesões culposas'),
]


def regra_externa(registro: dict) -> Classificacao | None:
    for lei, artigo, especie, fundamento in EXTERNAS:
        if lei.search(registro.get('lei') or '') and artigo.search(registro.get('artigo') or ''):
            return Classificacao(especie, fundamento, 'lei-externa')
    return None


# ── Fundamentos de fora do diploma, que NÃO mudam a espécie ─────────────────
# Decisão 18, de 23/09/2026. Há regra de fora que não altera a espécie derivada
# e mesmo assim é o que a sustenta: dizer "regra geral, CP, art. 100" num crime
# militar seria citar o dispositivo errado, porque quem manda ali é o art. 121
# do CPM. O campo `acao_fundamento` passa a dizer de onde vem cada resposta, e
# estes casos existem para que ele não minta por omissão.
FUNDAMENTOS_EXTERNOS: list[tuple[re.Pattern, re.Pattern, str, str]] = [
    (re.compile(r'^CPM'), re.compile(r'.'), 'Pública Incondicionada',
     'lei externa: CPM, art. 121 — a ação penal militar é sempre pública, promovida '
     'por denúncia do Ministério Público Militar'),
    (re.compile(r'^CP$'), re.compile(r'^Art\. 129, § ?(9º|13)'), 'Pública Incondicionada',
     'jurisprudência: STF, ADI 4424, e STJ, Súmula 542 — a ação penal da lesão corporal '
     'praticada com violência doméstica e familiar contra a mulher é pública '
     'incondicionada (Lei 11.340/06, art. 41)'),
]


def fundamento_externo(registro: dict) -> tuple[str, str] | None:
    """(espécie esperada, fundamento) de fora do diploma, sem mudar a espécie."""
    for lei, artigo, especie, fundamento in FUNDAMENTOS_EXTERNOS:
        if lei.search(registro.get('lei') or '') and artigo.search(registro.get('artigo') or ''):
            return especie, fundamento
    return None


# ── O fundamento publicado (decisão 18) ─────────────────────────────────────
def fundamento_de(registro: dict, c: Classificacao) -> str:
    """O texto de `acao_fundamento`: de onde vem a espécie deste registro.

    Cinco formas, e só elas: regra do diploma, regra geral, lei externa,
    jurisprudência e intertemporal. Um registro cuja ação penal varia no tempo
    (o estelionato, decisão 33) aponta para `acao_condicao`, porque a resposta
    não cabe numa linha e depende da data do fato.
    """
    if registro.get('acao_condicao') and 'Fatos até' in (registro.get('acao_condicao') or ''):
        return 'intertemporal: ver `acao_condicao`'
    if ext := fundamento_externo(registro):
        return ext[1]
    if c.regra == 'lei-externa':
        return f'lei externa: {c.fundamento}'
    if c.regra == 'silencio-do-diploma':
        return ('regra geral: CP, art. 100, c/c art. 12 — nenhuma regra de ação penal do '
                'diploma alcança o dispositivo')
    return f'regra do diploma: {c.fundamento}'
