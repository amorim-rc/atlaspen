# -*- coding: utf-8 -*-
"""A chave canônica do dispositivo de um registro do catálogo (frente 4).

O histórico legislativo (`data/historico-legislativo.json`) é indexado pela chave
canônica — `<id em data/fontes.json>|<dispositivo>`, em minúsculas: `cp|art. 121,
§2º, i`, `cp|art. 163, parágrafo único, iv`, `lep|art. 112, vi, c`. O campo
`artigo` do catálogo é texto livre, escrito para o leitor, e varia:

    "Art. 121, §2º, I"                 -> cp|art. 121, §2º, i
    "Art. 121, § 3º"                   -> cp|art. 121, §3º
    "Art. 163, §único, I"              -> cp|art. 163, parágrafo único, i
    "Art. 146-A, caput (CP)"           -> cp|art. 146-a, caput
    "Art. 350 (se o documento é público)" -> ce|art. 350, caput
    "Art. 405 c/c art. 242, §3º"       -> cpm|art. 405, caput
    "Art. 121, §4º, 2ª parte"          -> cp|art. 121, §4º

A regra é a do leitor que abre o compilado: o dispositivo é o PRIMEIRO citado (o
"c/c" diz de onde vem a pena, não onde o tipo está); parêntese e "parte" são
recortes do catálogo dentro do mesmo dispositivo, e não unidades da lei.

Módulo compartilhado de propósito: o robô do histórico decide quais dispositivos
gerar a partir destas chaves, e o construtor do catálogo lê o histórico por elas.
Duas implementações divergiriam em silêncio, e a ficha diria "sem data" para um
tipo que o histórico tem.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
FONTES = RAIZ / "data" / "fontes.json"

_ARTIGO = re.compile(r"^\s*art\.?\s*(\d+)\s*[ºo°]?\s*((?:-[a-z])*)", re.I)
_PARAGRAFO = re.compile(r"^§\s*(\d+)\s*[ºo°]?\s*((?:-[a-z])?)$", re.I)
_PAR_UNICO = re.compile(r"^(?:§\s*[úu]nico|par[áa]grafo\s+[úu]nico|par\.\s*[úu]nico|p\.\s*[úu]nico)$", re.I)
_INCISO = re.compile(r"^([ivxlc]+)$", re.I)
_ALINEA = re.compile(r"^([a-z])\)?$", re.I)


def rotulos_para_fonte(caminho: Path = FONTES) -> dict[str, str]:
    """{rótulo do catálogo: id da fonte}. O CP aparece sob vários rótulos."""
    fontes = json.loads(caminho.read_text(encoding="utf-8"))["fontes"]
    return {r: f["id"] for f in fontes for r in f.get("rotulos", [])}


def partes(artigo: str) -> tuple[str, str, list[str]] | None:
    """(número, sufixo, unidades abaixo do artigo), ou None se não for lido."""
    texto = (artigo or "").split(" c/c ")[0]
    texto = re.sub(r"\([^)]*\)", " ", texto)             # recorte do catálogo
    texto = re.sub(r",?\s*\d+ª\s*parte\b", " ", texto, flags=re.I)
    m = _ARTIGO.match(texto)
    if not m:
        return None
    numero, sufixo = m.group(1), m.group(2).lower()
    unidades: list[str] = []
    for bruto in texto[m.end():].split(","):
        u = re.sub(r"\s+", " ", bruto).strip()
        if not u or u.lower() == "caput":
            continue
        if _PAR_UNICO.match(u):
            unidades.append("parágrafo único")
        elif (p := _PARAGRAFO.match(u)):
            unidades.append(f"§{p.group(1)}º{p.group(2).lower()}")
        elif _INCISO.match(u):
            unidades.append(u.lower())
        elif _ALINEA.match(u):
            unidades.append(_ALINEA.match(u).group(1).lower())
        else:
            # Unidade que o leitor escreveu e a lei não tem ("1ª parte" já
            # saiu acima): para aqui, sem inventar o resto da chave.
            break
    return numero, sufixo, unidades


def chave(registro: dict, rotulos: dict[str, str]) -> str | None:
    """A chave canônica do registro, ou None se o diploma ou o artigo não se lerem."""
    fonte = rotulos.get(registro.get("lei") or "")
    p = partes(registro.get("artigo") or "")
    if not fonte or not p:
        return None
    numero, sufixo, unidades = p
    corpo = [f"art. {numero}{sufixo}"] + (unidades or ["caput"])
    return f"{fonte}|" + ", ".join(corpo)
