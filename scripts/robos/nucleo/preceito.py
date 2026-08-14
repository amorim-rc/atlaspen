# -*- coding: utf-8 -*-
"""O critério penal — o que separa lei que CRIA crime de lei que fala de pena.

Mora no núcleo porque dois robôs o aplicam, e é essencial que apliquem o MESMO.
O Sentinela usa-o para triar o Diário Oficial da semana; o Recenseador, para
varrer todas as leis do ano. Comparar os dois resultados só faz sentido se o
critério for um só — com duas cópias, uma divergência entre eles não distinguiria
"a lei mudou" de "os filtros discordam".
"""
from __future__ import annotations

import re


_TIPIFICA = re.compile(
    r"Pena\s*[-–—:]|reclus[ãa]o,\s*de|deten[çc][ãa]o,\s*de|pris[ãa]o simples,\s*de",
    re.IGNORECASE)

# O tipo cuja pena vem de OUTRO dispositivo não traz "Pena –" nenhum, e o
# catálogo tem pelo menos nove assim: art. 304 do CP e art. 315 do CPM ("a pena
# cominada à falsificação"), arts. 353 e 354 do Código Eleitoral, arts. 2º e 3º
# da Lei 2.889/56 ("metade da cominada aos crimes ali previstos"), art. 391 do
# CPM ("com aumento da metade") e arts. 404 e 405 ("no dobro da pena cominada
# para o tempo de paz"). Sem estes padrões, uma lei nova redigida assim seria
# invisível para os dois robôs.
#
# E há a pena cominada FORA da fórmula: o art. 28 da Lei 11.343/06 escreve "será
# submetido às seguintes penas: I – advertência…", e o art. 8º da Lei 7.437/85
# comina perda do cargo sem a palavra "Pena".
_PENA_POR_REMISSAO = re.compile(
    r"pena\s+cominada|nas\s+penas\s+do\s+art|nas\s+mesmas\s+penas|"
    r"incorre\s+nas\s+penas|punid[oa]\s+com\s+as\s+penas|"
    r"com\s+a\s+pena\s+do\s+art|metade\s+da(?:s)?\s+pena|"
    r"no\s+dobro\s+da\s+pena|"
    r"[àa]s\s+seguintes\s+penas|submetid[oa]\s+[àa]s\s+penas",
    re.IGNORECASE)


def comina_pena(texto: str) -> bool:
    """O ato comina pena — pela fórmula canônica OU por remissão a outra."""
    return bool(_TIPIFICA.search(texto) or _PENA_POR_REMISSAO.search(texto))
_NUMERO_LEI = re.compile(r"LEI\s+(?:COMPLEMENTAR\s+)?N[ºo°.\s]*\s*([\d.]+)", re.IGNORECASE)
_ANO = re.compile(r"DE\s+\d{1,2}\s+DE\s+\w+\s+DE\s+(\d{4})", re.IGNORECASE)


# A lista original reconhecia só a lei penal AUTÔNOMA ("institui o crime de").
# Mas a esmagadora maioria da legislação penal brasileira é ALTERADORA, e a
# ementa alteradora tem forma própria, padronizada pela LC 95/98: identifica o
# diploma e enuncia a finalidade com "para".
_EMENTA_CRIMINALIZA = re.compile(
    r"tipifica|criminaliza|institui o crime|institui o tipo penal|torna crime|"
    r"define o crime|disp[õo]e sobre o crime|"
    r"para tipificar|para criminalizar|para prever o crime|para punir|"
    r"para agravar a pena|para aumentar a pena|para majorar a pena|"
    r"para tornar hediondo|torna hediondo|"
    r"para incluir o crime|para incluir no rol|"
    r"acrescenta o art|acrescenta dispositivo|pune com",
    re.IGNORECASE)
# Revogação de dispositivo — "Revogam-se os arts. 12 e 13". Sozinha não diz nada;
# junto da citação de diploma monitorado, diz que um tipo pode ter saído.
_REVOGA_DISPOSITIVO = re.compile(
    # "Revogam-se os arts. 12 e 13" — e também sem o complemento, porque a
    # cláusula às vezes vem sozinha na linha.
    r"revoga(?:m)?-se\b|"
    # A forma que a LC 95/98 recomenda, e a mais comum na prática.
    r"fica(?:m)?\s+revogad[oa]s?\b|"
    # A marca INLINE do compilado: é assim que o Planalto sinaliza dispositivo
    # revogado dentro do articulado, e foi ela que permitiu identificar os arts.
    # 51, 60, 64, 65 e 78 do CPM como revogados pela Lei 14.688/2023.
    r"\(\s*revogad[oa]s?\b|"
    # Medida provisória não convertida.
    r"perde\s+a\s+efic[áa]cia|fica\s+sem\s+efeito|"
    # Revogação anunciada na própria ementa.
    r"revoga\s+a\s+Lei\s+n",
    re.IGNORECASE)
