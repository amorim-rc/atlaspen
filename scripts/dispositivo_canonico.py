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


# ── A grafia canônica do campo `artigo` ─────────────────────────────────────
# O campo é texto livre, escrito para o leitor, e regra que casa nele erra em
# silêncio quando a grafia varia. Em 23/09/2026 isso escondeu um erro jurídico
# por meses: 37 registros escreviam `§ 2º` com espaço contra 375 sem, e a
# exclusão que tirava a forma culposa do art. 273 do CP do rol de hediondos
# nunca casou. A grafia foi normalizada; esta régua impede que a variação volte.
#
# É a mesma gramática que `partes()` lê, escrita como aceitação: o que a régua
# não reconhece reprova na entrada (`transform_data.py --estrito`), em vez de
# passar e não casar regra nenhuma. As formas aceitas são as que o catálogo
# usa hoje — inclusive as três grafias do parágrafo único, porque `partes()` lê
# as três e unificá-las seria reescrever quatro dezenas de registros sem ganho
# de leitura.
_ARTIGO_CANONICO = r"[Aa]rt\. \d+º?(?:-[A-Z])*"
_UNIDADE_CANONICA = (
    r"caput"
    r"|§\d+º?(?:-[A-Z])?"                   # §2º, §10, §1º-A — sem espaço depois do §
    r"|§único|par\. único|parágrafo único"
    r"|[IVXLC]+(?: (?:a|e) [IVXLC]+)?"      # inciso, ou faixa/par de incisos
    r"|[a-z]\)?"                            # alínea, com ou sem parêntese
    r"|\dª parte"                           # recorte do catálogo dentro do dispositivo
)
_RECORTE = r"(?: \([^()]+\))?"
_DISPOSITIVO_CANONICO = rf"{_ARTIGO_CANONICO}(?:, (?:{_UNIDADE_CANONICA}))*{_RECORTE}"
# Depois do c/c vem outro dispositivo do mesmo diploma, ou só a unidade (§, caput).
_C_C = rf"(?: c/c (?:{_DISPOSITIVO_CANONICO}|(?:{_UNIDADE_CANONICA})(?:, (?:{_UNIDADE_CANONICA}))*{_RECORTE}))?"
GRAFIA_CANONICA = re.compile(rf"^{_DISPOSITIVO_CANONICO}{_C_C}$")

_ORDINAL_ERRADO = re.compile(r"(?:Art\. |§)(\d+)(º?)")


def problemas_de_grafia(artigo: str) -> list[str]:
    """O que impede `artigo` de ser lido pela régua canônica; vazio quando está certo.

    Uma mensagem por defeito, para a CI dizer o que corrigir: `Art. 121, § 2º`
    acusa o espaço depois do §; `art. 121` acusa o A minúsculo; `Art. 121, §2`
    acusa o ordinal que falta (só 1º a 9º levam º).
    """
    a = artigo or ""
    problemas: list[str] = []
    if not a.strip():
        return ["campo vazio"]
    if a != a.strip() or "  " in a:
        problemas.append("espaço sobrando no início, no fim ou duplicado")
    if not a.startswith("Art. "):
        problemas.append("tem de começar por `Art. ` (A maiúsculo, ponto e um espaço)")
    if re.search(r"§ ", a):
        problemas.append("`§` colado ao número, sem espaço (`§2º`, não `§ 2º`)")
    if re.search(r",\S", a):
        problemas.append("vírgula seguida de espaço")
    for numero, ordinal in _ORDINAL_ERRADO.findall(a):
        if int(numero) <= 9 and not ordinal:
            problemas.append(f"`{numero}` pede ordinal: `{numero}º`")
        if int(numero) > 9 and ordinal:
            problemas.append(f"`{numero}º` não leva ordinal acima de 9")
    # Duas letras ou mais: uma só (`c`, `i`) é alínea, e alínea é minúscula.
    if re.search(r", [ivxlc]{2,}(?:,|$| )", a):
        problemas.append("inciso em maiúsculas (`I`, `II`, não `i`)")
    if re.search(r", [A-Z]\)?(?:,|$)", a) and not re.search(r", [IVXLC]+(?:,|$)", a):
        problemas.append("alínea em minúscula (`a`, não `A`)")
    if not GRAFIA_CANONICA.match(a):
        if not problemas:
            problemas.append("forma que a régua não lê: `Art. N`, `Art. N, §Nº`, `Art. N, §Nº, I`, "
                             "`Art. N, parágrafo único`, `Art. N, I, a`, `… c/c art. N, …`, "
                             "com recorte entre parênteses ao fim")
    return problemas
