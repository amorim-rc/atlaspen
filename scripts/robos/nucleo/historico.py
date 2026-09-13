# -*- coding: utf-8 -*-
"""O histórico legislativo de cada dispositivo, lido do compilado (frentes 4 e 5).

O compilado do Planalto guarda a vida inteira de um dispositivo: a redação
original, sem anotação, e cada redação posterior logo abaixo da anterior, com a
anotação da lei que a deu — "(Redação dada pela Lei nº 15.402, de 2026)" — e o
link para o artigo da lei alteradora. Este módulo lê essa sequência e a devolve
como eventos, uma linha por acontecimento, no formato de
`data/historico-legislativo.json` (estudos/modelo-atributos.md, seção 4.5).

Diferente de `parsear`, que consolida o dispositivo na redação vigente para o
Vigia conferir a pena, aqui nada se consolida: toda versão conta, e a unidade
desce ao inciso e à alínea, porque é neles que os patamares dos atributos moram
(o 25% da progressão é o inciso I do art. 112 da LEP).

**A chave** é a canônica: `<id em data/fontes.json>|<dispositivo>`, em
minúsculas — `lep|art. 112, i`, `lep|art. 112, vi, c`, `cp|art. 44, §3º`,
`cp|art. 121, caput`. O caput só aparece quando a unidade é ele mesmo: o inciso
que o completa não o repete. Chave sem vírgula (`lep|art. 112`) é o artigo
inteiro, e junta as linhas de todas as unidades dele (`linhas_de`).

**O evento espelha a anotação, e só ela:**

    sem anotação (1ª versão)   -> criacao, norma "original"
    "Incluído pela…"           -> criacao
    "Redação dada pela…"       -> alteracao
    "Revogado pela…"           -> revogacao (também "(revogado)" como texto)
    "Renumerado…"              -> renumeracao

Três silêncios, deliberados:

- versão vetada não gera evento: o dispositivo vetado nunca vigeu;
- versão posterior sem anotação não gera evento, e sim um aviso: o compilado não
  disse quem a deu, e o histórico não adivinha;
- inciso ou alínea sem anotação própria, sob um chapéu anotado, também vira
  aviso, e não "original". No CP é comum a Lei 7.209/84 anotar só o caput do §
  que ela reescreveu inteiro; chamar a alínea de original seria datá-la de 1940.
  E datá-la pelo chapéu também não serve: o caput do art. 109 do CP é da Lei
  12.234/2010, e os incisos I a V, de 1984. A base dos atributos registra essas
  unidades com `norma: null`.

`publicacao` e `vigencia` ainda não são preenchidas: o compilado dá só o ano, e
a data exata vem da própria lei alteradora (próximo passo da frente 4).

Uso, a partir da raiz — regenera as linhas extraídas do compilado para os
dispositivos citados em `data/atributos.json`, e preserva as de origem manual:

    python scripts/robos/nucleo/historico.py
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
# `scripts/robos`, para o pacote do núcleo. Antes dos imports dele: rodado como
# script, o `sys.path[0]` é `scripts/robos/nucleo`.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from nucleo.dispositivo import SNAPSHOTS  # noqa: E402
from nucleo.parsear import (  # noqa: E402
    _ACAO, _ALINEA, _ARTIGO, _PAR_UNICO, _REVOGADO_TXT, _VETADO,
    ACOES_DE_VERSAO, Anotacao, ler_anotacao, ler_paragrafo, paragrafos, parsear,
    url_absoluta)

FONTES = RAIZ / "data" / "fontes.json"
ATRIBUTOS = RAIZ / "data" / "atributos.json"
HISTORICO = RAIZ / "data" / "historico-legislativo.json"

# O inciso do parser, mais o sufixo de letra COLADO ao numeral ("VI-A – 55%…").
# O `_INCISO` de parsear exige espaço depois do hífen e não lê o VI-A do art.
# 112 da LEP — o inciso do feminicídio, criado em 2024 e revogado em 2026.
_INCISO = re.compile(r"^([IVXLC]+)(?:-((?-i:[A-Z])))?\s*[-–—]\s", re.I)
# A linha da pena, e só ela: "Pena - reclusão…", "Pena: …". O `_PENA` de parsear
# aceita qualquer "Pena" no começo, e aqui isso custa caro: a epígrafe "Pena de
# tentativa (Incluído pela Lei nº 7.209…)", anotada, virava a última versão do
# art. 14, II, do CP.
_PENA_LINHA = re.compile(r"^Penas?\s*[-–—:]", re.I)
_PERCENTUAL = re.compile(r"(\d+(?:,\d+)?)\s*%")
# "A rt. 107": a capitular do HTML, separada do resto da palavra. Três casos no
# acervo inteiro (CP 107, CPP 405, Lei 4.729 art. 9), nenhum com tipo penal.
_CAPITULAR = re.compile(r"^A\s+rt\b")
_PARENTESE = re.compile(r"\([^)]*\)")

EVENTO = {"incluido": "criacao", "redacao": "alteracao",
          "revogado": "revogacao", "renumerado": "renumeracao"}

META = {
    "descricao": (
        "Histórico legislativo dos dispositivos citados pelos atributos penais: uma "
        "linha por acontecimento na vida de cada dispositivo, em ordem cronológica "
        "(estudos/modelo-atributos.md, seção 4.5). A chave estrangeira é "
        "`dispositivo`, a chave canônica de data/fontes.json."),
    "eventos": {
        "criacao": "nasceu, no texto original ou incluído por lei posterior",
        "alteracao": "uma lei lhe deu texto novo",
        "revogacao": "uma lei, ou uma decisão, o tirou de vigência",
        "renumeracao": "mudou de número",
        "transferencia": "mudou de lugar",
    },
    "origem": (
        "`compilado`: extraída do texto compilado do Planalto por "
        "scripts/robos/nucleo/historico.py, que a regenera; `manual`: escrita à mão, "
        "e preservada na regeneração."),
    "pendente": (
        "`publicacao` e `vigencia` ainda não são preenchidas: o compilado dá só o "
        "ano, e a data exata vem da lei alteradora."),
}


def chave_canonica(fonte: str, artigo: str, sufixo: str | None = None,
                   paragrafo: str | None = None, inciso: str | None = None,
                   alinea: str | None = None) -> str:
    """("lep", "112", inciso="VI", alinea="c") -> "lep|art. 112, vi, c"."""
    partes = [f"art. {artigo}" + (f"-{sufixo}" if sufixo else "")]
    partes += [p for p in (paragrafo, inciso, alinea) if p]
    if len(partes) == 1:
        partes.append("caput")
    return f"{fonte}|" + ", ".join(partes).lower()


def e_artigo(chave: str) -> bool:
    """A chave é o artigo inteiro (`lep|art. 112`), e não uma unidade dele?"""
    return ", " not in chave.split("|", 1)[1]


def linhas_de(chave: str, linhas: list[dict]) -> list[dict]:
    """As linhas de uma chave: exatas para a unidade, todas as do artigo inteiro."""
    if e_artigo(chave):
        return [l for l in linhas
                if l["dispositivo"] == chave or l["dispositivo"].startswith(chave + ", ")]
    return [l for l in linhas if l["dispositivo"] == chave]


@dataclass
class Versao:
    chave: str
    ordem: int
    texto: str
    anotacoes: list[Anotacao]
    revogada: bool = False
    # Inciso ou alínea cujo chapéu (o caput, o § ou o inciso que ela completa)
    # está anotado na última versão impressa antes dela.
    chapeu_anotado: bool = False


def _anotacoes_de_versao(p) -> list[Anotacao]:
    """As anotações que datam uma versão, com o href de cada uma, sem repetição.

    O link é a fonte preferida, porque traz o href. Parágrafo cuja anotação veio
    só como texto cai na leitura do texto, que percorre TODOS os parênteses: um
    "(Vide …)" antes da "(Redação dada …)" não pode escondê-la.
    """
    vistas, saida = set(), []
    for texto, href in zip(p.anotacoes, p.links):
        a = ler_anotacao(texto)
        if a and a.acao in ACOES_DE_VERSAO and (a.acao, a.norma, a.ano) not in vistas:
            vistas.add((a.acao, a.norma, a.ano))
            a.href = href
            saida.append(a)
    if not saida:
        for m in _ACAO.finditer(p.texto):
            a = ler_anotacao(p.texto[m.start():])
            if a and a.acao in ACOES_DE_VERSAO and (a.acao, a.norma, a.ano) not in vistas:
                vistas.add((a.acao, a.norma, a.ano))
                saida.append(a)
    return saida


def versoes(documento: str, fonte: str) -> list[Versao]:
    """Toda versão impressa de toda unidade (caput, §, inciso, alínea), em ordem."""
    # Texto transcrito por artigo meramente alterador não é do diploma: a Lei
    # 12.850 "contém" o art. 288 do CP (ver `_marcar_citacoes`).
    citados = {d.rotulo_artigo for d in parsear(documento) if d.citacao}
    saida: list[Versao] = []
    art = suf = par = inc = None
    chapeu: dict[str, bool] = {}
    ultima: str | None = None
    for ordem, p in enumerate(paragrafos(documento)):
        # Capitular partida: o HTML do Planalto imprime "A rt. 107 - Extingue-se a
        # punibilidade", e sem a emenda o art. 107 do CP não existia, e os incisos
        # dele viravam incisos do art. 106.
        t = _CAPITULAR.sub("Art", p.texto)
        anots = _anotacoes_de_versao(p)
        alinea = None
        m = _ARTIGO.match(t)
        if m:
            art = m.group(1)
            suf = re.sub(r"[–—]", "-", m.group(2)).strip("-").upper() or None
            par = inc = None
            corpo, nivel = t[m.end():], "caput"
        elif art is None:
            continue
        elif (mp := ler_paragrafo(t)) or _PAR_UNICO.match(t):
            par = (f"§{mp[0]}º" + (f"-{mp[1]}" if mp[1] else "")) if mp else "parágrafo único"
            inc = None
            corpo = t[mp[2]:] if mp else t[_PAR_UNICO.match(t).end():]
            nivel = "par"
        elif mi := _INCISO.match(t):
            inc = mi.group(1).upper() + (f"-{mi.group(2)}" if mi.group(2) else "")
            corpo, nivel = t[mi.end():], "inc"
        elif ma := _ALINEA.match(t):
            corpo, nivel, alinea = t[ma.end():], "ali", ma.group(1)
        elif _PENA_LINHA.match(t) and ultima and anots:
            # Pena com redação nova é versão da unidade a que pertence.
            saida.append(Versao(ultima, ordem, t, anots))
            continue
        else:
            continue

        if f"Art. {art}" + (f"-{suf}" if suf else "") in citados:
            continue
        chave = chave_canonica(fonte, art, suf, par, inc, alinea)

        if nivel == "inc":
            chapeu_anotado = chapeu.get("par" if par else "caput", False)
        elif nivel == "ali":
            chapeu_anotado = chapeu.get("inc" if inc else ("par" if par else "caput"), False)
        else:
            chapeu_anotado = False
        if nivel == "caput":
            chapeu = {"caput": bool(anots)}
        elif nivel == "par":
            chapeu["par"] = bool(anots)
            chapeu.pop("inc", None)
        elif nivel == "inc":
            chapeu["inc"] = bool(anots)

        util = _PARENTESE.sub("", corpo).strip(" ;.,:-–—")
        if _VETADO.search(corpo) and not util:
            continue
        revogada = (any(a.acao == "revogado" for a in anots)
                    or bool(_REVOGADO_TXT.search(corpo) and not util))
        saida.append(Versao(chave, ordem, corpo, anots, revogada, chapeu_anotado))
        ultima = chave
    return saida


def _valor(texto: str) -> str | None:
    """O percentual da redação, quando ela tem um e só um ("16%")."""
    achados = set(_PERCENTUAL.findall(_PARENTESE.sub("", texto)))
    return f"{achados.pop()}%" if len(achados) == 1 else None


def _linha(chave: str, evento: str, norma: str | None, texto: str, *,
           ano: int | None = None, anotacao: str | None = None, url: str | None = None,
           valor_antes: str | None = None, valor_depois: str | None = None) -> dict:
    linha = {"dispositivo": chave, "evento": evento, "norma": norma, "ano": ano,
             "anotacao": anotacao, "url": url, "valor_antes": valor_antes,
             "valor_depois": valor_depois, "natureza": "legislativa",
             "origem": "compilado"}
    linha = {k: v for k, v in linha.items() if v is not None}
    # O texto da redação acompanha a linha em memória (quem gera a base dos
    # atributos confere evidências contra ele) e não vai para o arquivo.
    linha["_texto"] = texto
    return linha


def eventos(vs: list[Versao], base: str) -> tuple[list[dict], list[str]]:
    """Versões -> linhas do histórico, e os avisos do que o compilado não diz."""
    por_chave: dict[str, list[Versao]] = {}
    for v in vs:
        por_chave.setdefault(v.chave, []).append(v)
    linhas: list[dict] = []
    avisos: list[str] = []
    for chave, lista in por_chave.items():
        anterior = None
        for i, v in enumerate(lista):
            valor = None if v.revogada else _valor(v.texto)
            if not v.anotacoes:
                if i == 0 and not v.chapeu_anotado:
                    linhas.append(_linha(chave, "criacao", "original", v.texto,
                                         valor_depois=valor))
                elif i == 0:
                    avisos.append(f"{chave}: sem anotação própria, sob chapéu anotado — "
                                  "não se sabe se é original ou veio com a lei do chapéu")
                else:
                    avisos.append(f"{chave}: versão posterior sem anotação (parágrafo {v.ordem})")
                anterior = valor
                continue
            for j, a in enumerate(v.anotacoes):
                ultima = j == len(v.anotacoes) - 1
                evento = "revogacao" if (v.revogada and ultima) else EVENTO[a.acao]
                linhas.append(_linha(
                    chave, evento, a.norma, v.texto, ano=a.ano, anotacao=a.texto,
                    url=url_absoluta(base, a.href),
                    valor_antes=(anterior if ultima and anterior
                                 and (valor or evento == "revogacao") else None),
                    valor_depois=valor if ultima else None))
            anterior = valor
    return linhas, avisos


def ler_fontes() -> dict[str, dict]:
    return {f["id"]: f for f in json.loads(FONTES.read_text(encoding="utf-8"))["fontes"]}


def snapshot(fonte: str) -> Path:
    arquivos = sorted((SNAPSHOTS / fonte).glob("*.html"))
    if not arquivos:
        raise FileNotFoundError(
            f"sem snapshot de {fonte}: rode scripts/robos/nucleo/baixar.py --fonte {fonte}")
    return arquivos[-1]


def gerar(chaves: list[str]) -> tuple[list[dict], list[str]]:
    """As linhas do compilado para as chaves citadas, diploma a diploma."""
    fontes = ler_fontes()
    por_fonte: dict[str, list[str]] = {}
    for k in chaves:
        por_fonte.setdefault(k.split("|", 1)[0], []).append(k)
    linhas: list[dict] = []
    avisos: list[str] = []
    for fonte, ks in por_fonte.items():
        if fonte not in fontes:
            avisos.append(f"{fonte}: diploma fora de data/fontes.json")
            continue
        html = snapshot(fonte).read_text(encoding="utf-8")
        todas, avs = eventos(versoes(html, fonte), fontes[fonte]["url"])
        vistas: set[int] = set()
        for k in ks:
            for l in linhas_de(k, todas):
                if id(l) not in vistas:
                    vistas.add(id(l))
        linhas += [l for l in todas if id(l) in vistas]
        avisos += [a for a in avs
                   if any(linhas_de(k, [{"dispositivo": a.split(":", 1)[0]}]) for k in ks)]
    return linhas, avisos


def ultimos_textos(chaves: list[str]) -> dict[str, str]:
    """O texto da última versão impressa de cada unidade sob as chaves citadas.

    Inclui as unidades que não geram linha (sem anotação sob chapéu anotado): a
    data delas o compilado não dá, mas o texto está lá, e é contra ele que se
    confere o que a base dos atributos diz sobre elas.
    """
    fontes = ler_fontes()
    por_fonte: dict[str, list[str]] = {}
    for k in chaves:
        por_fonte.setdefault(k.split("|", 1)[0], []).append(k)
    saida: dict[str, str] = {}
    for fonte, ks in por_fonte.items():
        if fonte not in fontes:
            continue
        for v in versoes(snapshot(fonte).read_text(encoding="utf-8"), fonte):
            if any(linhas_de(k, [{"dispositivo": v.chave}]) for k in ks):
                saida[v.chave] = v.texto
    return saida


def chaves_citadas(atributos: list[dict]) -> list[str]:
    """Toda chave de dispositivo que a base dos atributos cita, sem repetição."""
    chaves: list[str] = []
    for a in atributos:
        chaves += a.get("dispositivos", [])
        for p in a.get("parametros", []):
            for r in p.get("redacoes", []):
                f = r["fonte"]
                chaves += ([f["dispositivo"]] if "dispositivo" in f else []) + f.get("dispositivos", [])
    return list(dict.fromkeys(chaves))


def gravar(linhas: list[dict], destino: Path = HISTORICO) -> None:
    """Grava o histórico: as linhas do compilado, mais as manuais que já havia."""
    manuais: list[dict] = []
    if destino.exists():
        antigo = json.loads(destino.read_text(encoding="utf-8"))
        manuais = [l for l in antigo.get("eventos", []) if l.get("origem") != "compilado"]
    saida = [{k: v for k, v in l.items() if not k.startswith("_")} for l in linhas] + manuais
    destino.write_text(
        json.dumps({"_meta": META, "eventos": saida}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8", newline="\n")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    atributos = json.loads(ATRIBUTOS.read_text(encoding="utf-8"))["atributos"]
    chaves = chaves_citadas(atributos)
    linhas, avisos = gerar(chaves)
    # Falha é chave que não existe no texto. Unidade que existe e não tem linha
    # é o compilado calando (ver o docstring), e isso já saiu como aviso.
    textos = ultimos_textos(chaves)
    faltam = [k for k in chaves
              if not any(linhas_de(k, [{"dispositivo": u}]) for u in textos)]
    gravar(linhas)
    for a in avisos:
        print("  aviso:", a)
    for k in faltam:
        print("  ✗ não existe no compilado:", k)
    print(f"{len(linhas)} eventos de {len(chaves)} dispositivos -> "
          f"{HISTORICO.relative_to(RAIZ).as_posix()}")
    return 1 if faltam else 0


if __name__ == "__main__":
    sys.exit(main())
