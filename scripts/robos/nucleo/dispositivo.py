# -*- coding: utf-8 -*-
"""A normalização de dispositivo — o identificador comum a todos os robôs.

Mora no núcleo, e não no Vigia, por uma razão que já custou caro: o Vigia
confere a moldura contra o dispositivo que o registro DIZ ser, e o Auditor
pergunta se o nome do registro conversa com esse mesmo dispositivo. Os dois
lados têm de reduzir ao **mesmo** identificador — se cada um tiver a sua cópia,
eles divergem em silêncio, e o registro passa a existir para um e não para o
outro.

Foi assim que nasceram artigos inexistentes como `Art. 13-O` e `Art. 100-A`: o
parser e o differ discordavam sobre onde terminava o número.
"""
from __future__ import annotations

import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
SNAPSHOTS = RAIZ / "crawler" / "snapshots"


# ── Normalização de dispositivo ─────────────────────────────────────────────
# O sufixo de letra vem COLADO ao número e pode repetir-se, com ou sem o
# marcador ordinal no meio: o catálogo escreve "Art. 121-A", "Art. 2º-A" e
# "Art. 359-M-B". A forma com ordinal era a que faltava, e por ela o art. 2º-A
# da Lei 7.716 (injúria racial) e o art. 7º-B da Lei 8.906 (prerrogativa de
# advogado) caíam na chave do artigo-base e ficavam sem conferência. Espelha o
# `_ARTIGO` de parsear.py — os dois lados têm de reduzir à MESMA chave.
_ART = re.compile(r"Art\.?\s*(\d+)\s*(?-i:[ºo°])?((?:[-–—](?-i:[A-Z]))*)", re.I)
_PAR = re.compile(r"§\s*(\d+)\s*[ºo°]?\s*(?:[-–—]\s*([A-Z]))?", re.I)


def chave(artigo: str) -> str | None:
    """"Art. 121, §2º, I" -> "Art. 121|§ 2º"  (o inciso herda a pena do §).

    O catálogo desce ao inciso quando a conduta muda; a pena, porém, é do caput
    ou do parágrafo. Reduzir os dois lados à mesma granularidade é o que faz o
    casamento funcionar sem inventar divergência.

    O "c/c" é cortado antes de tudo. "Art. 391 c/c art. 190, §1º" é um tipo de
    tempo de guerra cuja moldura DERIVA do art. 190 por um fator do art. 391 —
    não é o §1º de nenhum dos dois. Sem o corte, `_PAR` encontrava o "§1º" da
    segunda metade e montava `Art. 391|§ 1º`, chave que não existe em lugar
    nenhum: catorze registros saíam da conferência como "não localizado", que é
    o silêncio que a trava de cobertura existe para pegar.
    """
    artigo = re.split(r"\bc/c\b", artigo or "", maxsplit=1)[0]
    ma = _ART.search(artigo or "")
    if not ma:
        return None
    sufixo = re.sub(r"[–—]", "-", ma.group(2)).strip("-").upper()
    base = f"Art. {ma.group(1)}" + (f"-{sufixo}" if sufixo else "")
    mp = _PAR.search(artigo)
    if mp:
        marcador = f"§ {mp.group(1)}º" + (f"-{mp.group(2)}" if mp.group(2) else "")
    elif re.search(r"(?:par[áa]grafo|par\.|§)\s*[úu]nico", artigo, re.I):
        # O catálogo abrevia ("par. único"); a lei escreve por extenso. Sem
        # aceitar as duas formas, as linhas do parágrafo único caem no caput e
        # o differ acusa divergência contra a moldura errada.
        marcador = "parágrafo único"
    else:
        marcador = "caput"
    return f"{base}|{marcador}"


def chaves_do_registro(artigo: str) -> list[str]:
    """TODOS os dispositivos que compõem este registro, para o auditor de nomes.

    `chave()` devolve um só — o que a conferência de PENAS precisa, porque a
    moldura tem um dono. O NOME não: num registro "c/c", ele pode legitimamente
    descrever qualquer um dos dois lados, e qual deles depende do diploma.

    Nos tipos de tempo de guerra do CPM a ordem é *moldura c/c conduta*: "Art.
    405 c/c art. 242, §3º" tem a pena no art. 405 e o latrocínio no art. 242. Na
    Lei 7.643/87 é o contrário — "Art. 1º c/c Art. 2º" descreve a pesca de
    cetáceo no art. 1º e vai buscar a pena no art. 2º.

    Escolher um lado, portanto, acerta um diploma e erra o outro: foi o que
    aconteceu ao tentar. A regra que se sustenta é não escolher — o nome
    conversa com o registro se conversar com QUALQUER um dos dispositivos que o
    compõem.
    """
    partes = [p for p in re.split(r"\bc/c\b", artigo or "") if p.strip()]
    vistas: list[str] = []
    for parte in partes:
        k = chave(parte)
        if k and k not in vistas:
            vistas.append(k)
    return vistas
