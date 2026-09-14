# -*- coding: utf-8 -*-
"""Monta a proposta da rodada: escolhe o diploma, aplica e escreve o PR (F6b).

`corrigir.py` e `criar.py` sabem propor mudanças de UM diploma; este módulo é o
que falta entre eles e o workflow semanal — decide qual diploma vai na rodada,
aplica as duas coisas na mesma árvore e deixa pronto o corpo do PR com a
evidência de cada mudança. Depois da v1.0.0, também escreve a entrada de
changelog e sobe a versão.

Quatro decisões, todas para que o PR seja revisável por gente:

- **Um diploma por PR.** Revisar pena exige abrir o texto compilado; misturar
  vinte diplomas num PR só produz aprovação no atacado. O escolhido é o de mais
  propostas, e o próximo vai na semana seguinte.
- **Por padrão, só CORRIGE linha existente.** Criar linha é decidir se o
  dispositivo é crime autônomo, causa de aumento ou nada — e a primeira leva
  automática de linhas novas (F6) trouxe 29 registros que não eram tipos penais
  vigentes: contravenções revogadas, infrações administrativas do ECA e, sobre-
  tudo, redações do Código Penal transcritas dentro das leis que o alteraram.
  As guardas contra esses casos existem agora (`parsear._marcar_citacoes`,
  espécie de pena, revogação anotada), mas quem cria linha continua sendo gente:
  `--com-novas` liga a proposta de linha nova, e o workflow só a usa quando
  alguém pedir explicitamente.
- **Nota só para alteração de lei** (decisão de 14/09/2026). O feed publica o
  que uma lei nova cria ou modifica, e não o erro antigo do catálogo que a
  conferência achou. O que separa os dois é a anotação do compilado: redação
  dada, ou dispositivo incluído, por lei deste ano ou do anterior. Com nota, o
  PR fecha uma versão (em `0.0.x` até o lançamento) e sobe `package.json` e o
  lockfile; sem nota, não sobe nada. Entrada sem bump seria pior: anunciaria
  no feed uma versão já publicada.
- **Nada de silencioso.** O bump é conferido depois de escrito (substituição de
  texto já falhou em silêncio aqui) e cada mudança leva no corpo o trecho da lei
  que a motivou.

Uso:
    python scripts/robos/propor/propor.py                 # o que sairia (não escreve)
    python scripts/robos/propor/propor.py --aplicar --saida crawler/proposta

Saídas: 0 = proposta pronta; 1 = nada mecânico nesta rodada; 2 = erro.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
# `scripts/robos` para os pacotes dos robôs e do núcleo; `scripts` para o
# `pena_parser`, que é compartilhado com o construtor do catálogo e por isso
# não mora aqui.
sys.path.insert(0, str(RAIZ / "scripts"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from proponente import corrigir  # noqa: E402
from proponente import criar  # noqa: E402
from nucleo.dispositivo import SNAPSHOTS  # noqa: E402
from nucleo.tempo import hoje  # noqa: E402
from transform_data import _faixa_de_meses, proximo_id  # noqa: E402

FONTES = RAIZ / "data" / "fontes.json"
CATALOGO_FONTE = RAIZ / "data" / "crimes.json"
PACKAGE = RAIZ / "package.json"
LOCK = RAIZ / "package-lock.json"
CITATION = RAIZ / "CITATION.cff"
ENTRADAS = RAIZ / "src" / "data" / "changelog" / "entries"
SITE = "https://amorim-rc.github.io/sispenas"


# ── Versão ──────────────────────────────────────────────────────────────────
def versao_atual() -> str:
    return json.loads(PACKAGE.read_text(encoding="utf-8"))["version"]


def proxima_versao(atual: str) -> str:
    """Correção de dado é patch (docs/dados-abertos.md, Estabilidade e versionamento)."""
    maior, menor, patch = (int(x) for x in atual.split("."))
    return f"{maior}.{menor}.{patch + 1}"


def versao_da_rodada() -> str:
    """A versão que o PR fecha SE a rodada tiver nota (ver `aplicar`).

    Até o lançamento o projeto anda em 0.0.x (decisão de 14/09/2026): o patch
    sobe, e o `release.yml` continua sem publicar nada enquanto a versão for 0.x.
    """
    return proxima_versao(versao_atual())


def _substituir_versao(caminho: Path, padrao: str, atual: str, nova: str,
                       vezes: int = 1) -> None:
    """Troca a versão e CONFERE o resultado.

    O bump por substituição de texto já falhou em silêncio neste repositório
    (três entradas anunciaram versões que nunca saíram). Aqui, se a troca não
    pegar, o processo morre — nunca segue com o arquivo intacto.

    Trabalha sobre os bytes porque o repositório é CRLF: reescrever pelo modo
    texto trocaria a quebra de linha do arquivo inteiro e o diff do PR deixaria
    de mostrar uma linha para mostrar cinquenta.
    """
    texto = caminho.read_bytes().decode("utf-8")
    novo, trocas = re.subn(padrao.format(v=re.escape(atual)),
                           lambda m: m.group(0).replace(atual, nova), texto, count=vezes)
    if trocas != vezes or nova not in novo:
        raise SystemExit(f"bump falhou em {caminho.name}: {trocas} substituição(ões)")
    caminho.write_bytes(novo.encode("utf-8"))


def subir_versao(nova: str) -> None:
    atual = versao_atual()
    _substituir_versao(PACKAGE, r'"version":\s*"{v}"', atual, nova)
    # A raiz do lockfile repete a versão duas vezes: o pacote e packages[""].
    if LOCK.exists():
        _substituir_versao(LOCK, r'"version":\s*"{v}"', atual, nova, vezes=2)
    # Até a v1.0.0 o CITATION.cff cita pela data e não tem campo de versão.
    if re.search(r"^version:", CITATION.read_text(encoding="utf-8"), re.M):
        _substituir_versao(CITATION, r'version:\s*"{v}"', atual, nova)
    conferida = json.loads(PACKAGE.read_text(encoding="utf-8"))["version"]
    if conferida != nova:
        raise SystemExit(f"package.json ficou em {conferida}, não em {nova}")


# ── Escolha do diploma ──────────────────────────────────────────────────────
def carregar_fontes() -> list[dict]:
    return json.loads(FONTES.read_text(encoding="utf-8"))["fontes"]


def propostas_da_fonte(fonte_id: str, proximo_id: int,
                       com_novas: bool) -> tuple[list[dict], list[dict], list[dict]]:
    """(correções, linhas novas, achados que ficam para gente)."""
    correcoes, humanos = corrigir.gerar(fonte_id)
    novas = criar.gerar(fonte_id, proximo_id)[0] if com_novas else []
    return correcoes, novas, humanos


def escolher(com_novas: bool, apenas: str | None = None) -> dict | None:
    """O diploma da rodada: o de mais propostas mecânicas.

    Empate desfeito pela ordem de `fontes.json`, que é estável — duas execuções
    na mesma árvore têm de produzir o mesmo PR.
    """
    catalogo = json.loads(CATALOGO_FONTE.read_text(encoding="utf-8"))
    # Conta os ids aposentados: um endereço público nunca é reaproveitado.
    proximo = proximo_id(catalogo)

    melhor = None
    for f in carregar_fontes():
        if apenas and f["id"] != apenas:
            continue
        if not (SNAPSHOTS / f["id"]).exists():
            continue  # sem snapshot não há o que conferir (nem o que propor)
        correcoes, novas, humanos = propostas_da_fonte(f["id"], proximo, com_novas)
        if not correcoes and not novas:
            continue
        if melhor is None or len(correcoes) + len(novas) > melhor["total"]:
            melhor = {"fonte": f, "correcoes": correcoes, "novas": novas,
                      "humanos": humanos, "total": len(correcoes) + len(novas)}
    return melhor


# ── Auditoria: propostas que dependem de juízo ──────────────────────────────
# Regra da casa: o que a máquina lê com segurança ela corrige; o que depende de
# juízo jurídico ela PROPÕE, em PR, com o fundamento ao lado. Corrigir um PR é
# mais barato do que montar um do zero — e o diff mostra exatamente o que muda.
CAMPO_DO_ACHADO = {"hediondez": "hediondo", "acao_penal": "acao"}


def propostas_de_auditoria(achados: list[dict]) -> list[dict]:
    """Achados da auditoria que viram mudança concreta de campo."""
    catalogo = {c["id"]: c for c in json.loads(CATALOGO_FONTE.read_text(encoding="utf-8"))}
    propostas = []
    for a in achados:
        campo = CAMPO_DO_ACHADO.get(a.get("campo"))
        if not campo or "id" not in a or not a.get("para"):
            continue
        linha = catalogo.get(a["id"])
        if linha is None or linha.get(campo) == a["para"]:
            continue
        propostas.append({
            "id": a["id"], "campo": campo,
            "de": linha.get(campo), "para": a["para"],
            "fundamento": a.get("fundamento") or a["detalhe"],
            "lei": linha["lei"], "artigo": linha["artigo"], "crime": linha["crime"],
        })
    return propostas


def aplicar_auditoria(propostas: list[dict]) -> None:
    dados = json.loads(CATALOGO_FONTE.read_text(encoding="utf-8"))
    por_id = {p["id"]: p for p in propostas}
    for c in dados:
        p = por_id.get(c["id"])
        if p:
            c[p["campo"]] = p["para"]
    texto = json.dumps(dados, ensure_ascii=False, indent=2) + "\n"
    CATALOGO_FONTE.write_bytes(texto.replace("\n", "\r\n").encode("utf-8"))


def aplicar_fontes_propostas() -> list[dict]:
    """Acrescenta a `data/fontes.json` os diplomas que o watcher propôs.

    Entram com `id` provisório (`NOVA-15410`) e `obs` explicando o que conferir:
    a URL do compilado segue padrão, mas o Planalto foge dele em lei
    complementar e em lei antiga. Corrigir isso no PR é mais barato do que
    escrever a entrada do zero — que é o ponto.
    """
    proposto = RAIZ / "crawler" / "relatorios" / "fontes-propostas.json"
    if not proposto.exists():
        return []
    novas = json.loads(proposto.read_text(encoding="utf-8"))
    if not novas:
        return []
    texto = FONTES.read_bytes().decode("utf-8")
    existentes = {f["id"] for f in json.loads(texto)["fontes"]}
    entram = [n for n in novas if n["id"] not in existentes]
    if not entram:
        return []
    i = texto.rindex("}\r\n  ]")
    bloco = ",\r\n" + ",\r\n".join(
        "    " + json.dumps(n, ensure_ascii=False) for n in entram)
    FONTES.write_bytes((texto[:i + 1] + bloco + texto[i + 1:]).encode("utf-8"))
    return entram


def corpo_auditoria(propostas: list[dict], versao: str | None, relatorio: str,
                    fontes_novas: list[dict] | None = None) -> str:
    """Corpo do PR de auditoria: cada mudança com o fundamento que a sustenta."""
    por_campo: dict[str, list[dict]] = {}
    for p in propostas:
        por_campo.setdefault(p["campo"], []).append(p)

    L = [
        "## Auditoria dos campos de classificação", "",
        f"{len(propostas)} mudança(s) propostas em campos que **decidem atributos** e que "
        "a conferência de penas não alcançava."
        + " Não escreve nota nem sobe versão: classificação corrigida contra o rol é "
        "correção de dado. Se a mudança vier de lei nova, a entrada se escreve à mão "
        "(`src/data/changelog/create-changelog-entry.md`).", "",
        "> ⚠️ **Isto pede o seu juízo, não só uma conferida.** A máquina comparou o "
        "catálogo com o rol legal e com as fórmulas de ação penal do próprio diploma; "
        "onde a lei condiciona a classificação a circunstância do caso, ela não propôs "
        "nada. Cada linha abaixo cita o fundamento — confira antes de aprovar.", "",
    ]
    titulos = {"hediondo": "Hediondez", "acao": "Ação penal"}
    for campo, itens in sorted(por_campo.items()):
        L += [f"### {titulos.get(campo, campo)} — {len(itens)}", ""]
        for p in itens:
            L += [
                f"- **id {p['id']}** `{p['lei']} {p['artigo']}` — {p['de']} → **{p['para']}**",
                f"  - *{p['crime'][:100]}*",
                f"  - {p['fundamento']}",
                f"  - <{SITE}/tipos/{p['id']}>",
            ]
        L.append("")
    if fontes_novas:
        L += [f"### Diplomas novos ({len(fontes_novas)})", "",
              "O watcher do DOU encontrou lei que **parece criar tipo penal** e que nenhum "
              "diploma monitorado cobre. A entrada já vai aplicada em `data/fontes.json`, "
              "com `id` provisório — **confira a URL do compilado e troque o `id` por um "
              "descritivo** antes de aprovar. A partir do merge, o diploma passa a ser "
              "conferido toda semana.", ""]
        for n in fontes_novas:
            L += [f"- **{n['id']}** — {', '.join(n['rotulos'])}", f"  - <{n['url']}>",
                  f"  - {n['obs']}"]
        L.append("")
    L += ["---", "", "Relatório completo da auditoria, com o que NÃO virou proposta:", "",
          "<details><summary>abrir</summary>", "", relatorio, "", "</details>", ""]
    return "\n".join(L) + "\n"


# ── Textos ──────────────────────────────────────────────────────────────────
def _rotulo(fonte: dict) -> str:
    return fonte["rotulos"][0]


def corpo_pr(escolha: dict, versao: str | None, legais: list[dict] | None = None,
             fora: list[dict] | None = None) -> str:
    """Corpo do PR: uma seção por mudança, cada uma com o trecho da lei."""
    f = escolha["fonte"]
    correcoes, novas, humanos = escolha["correcoes"], escolha["novas"], escolha["humanos"]
    L = [
        f"## Diploma: **{', '.join(f['rotulos'])}**", "",
        f"Rodada automática do conferidor. Texto oficial conferido: <{f['url']}>", "",
        f"- **{len(correcoes)}** correção(ões) de moldura ou espécie de pena em linha existente;",
        f"- **{len(novas)}** linha(s) nova(s) proposta(s);",
        (f"- fecha a versão **v{versao}**, com {_plural(len(legais or []), 'nota', 'notas')} "
         "de atualização." if versao
         else "- não escreve nota nem sobe versão: nenhuma mudança vem de lei recente."), "",
        "> Cada mudança é uma **proposta** conferida contra o texto compilado, não uma "
        "conclusão jurídica. O merge continua exigindo revisão humana.", "",
    ]

    if legais or fora:
        L += ["## Notas de atualização", "",
              "Vai para o feed só a alteração de lei: redação dada, ou dispositivo "
              "incluído, por lei deste ano ou do anterior. **Confira a natureza** de "
              "cada uma antes de aprovar.", ""]
        for m in legais or []:
            a = m["anotacao"]
            L.append(f"- id {m['id']} `{m['depois']['artigo']}`: *{ROTULO_NATUREZA[m['natureza']]}*, "
                     f"{a['norma']}, de {a['ano']}")
        for x in fora or []:
            L.append(f"- id {x['id']} `{x['artigo']}`: fora do feed, {x['motivo']}")
        L.append("")

    if correcoes:
        L += ["## Correções de linha existente", ""]
        for p in correcoes:
            a, d = p["antes"], p["depois"]
            L += [
                f"### `{a['artigo']}` — id {a['id']}", f"*{a['crime'][:110]}*", "",
                f"- **Na lei:** {p['evidencia']}",
                f"- **Antes:** {a['pena_min']}–{a['pena_max']} meses, {a['tipo_pena']}",
                f"- **Depois:** {d['pena_min']}–{d['pena_max']} meses, {d['tipo_pena']}",
                f"- **obs:** `{d['obs'][:150]}`",
                f"- Conferir: <{SITE}/tipos/{a['id']}>", "",
            ]

    if novas:
        L += [
            "## Linhas novas", "",
            "Do texto saem seis campos; `acao`, `violencia` e `grave_ameaca` são "
            "herdados do caput do mesmo artigo, e `tentativa`/`hediondo` seguem a "
            "regra do crime culposo. **É aí que a revisão deve olhar primeiro.**", "",
        ]
        for p in novas:
            linha, achado = p["linha"], p["achado"]
            herdado = ", ".join(p["herdado"]) or "nenhum"
            L += [
                f"### `{linha['artigo']}` — id {linha['id']} (novo)",
                f"*{linha['crime'][:110]}*", "",
                f"- **Na lei:** {achado['detalhe'][:220]}",
                f"- **Pena proposta:** {linha['pena_min']}–{linha['pena_max']} meses, "
                f"{linha['tipo_pena']} ({linha['elemento'].lower()})",
                f"- **Herdado do caput** (id {p['caput_id']}): {herdado}",
                f"- **Origem do achado:** {achado['tipo']}", "",
            ]

    if humanos:
        L += [
            f"## Fora do automático ({len(humanos)}) — seguem na issue", "",
            "Dispositivo revogado, pena só de multa, leitura incerta ou mais de uma "
            "linha do catálogo para o mesmo dispositivo: decisão de modelagem, não "
            "leitura de texto.", "",
        ]
        for a in humanos[:25]:
            L += [f"- `{a.get('chave', '?')}` — **{a['tipo']}**: {a['detalhe'][:110]}"]
        L += [""]

    L += [
        "---", "",
        "Gerado por `scripts/robos/propor/propor.py` a partir do texto compilado baixado "
        "nesta execução. Reproduzível localmente:", "",
        "```", f"python scripts/robos/nucleo/baixar.py --fonte {f['id']}",
        f"python scripts/robos/propor/propor.py --fonte {f['id']}", "```", "",
    ]
    return "\n".join(L) + "\n"


def _plural(n: int, singular: str, plural: str) -> str:
    return f"{n} {singular if n == 1 else plural}"


def _artigo_em_prosa(artigo: str) -> str:
    """"Art. 50, I" -> "art. 50, I" — sem derrubar o algarismo romano."""
    return re.sub(r"^Art\.", "art.", artigo.strip())


def _frase_correcoes(correcoes: list[dict]) -> str:
    """Até três correções descritas em prosa, para o corpo da entrada.

    Em anos e meses, como a lei fala e como o site mostra: o feed é lido por
    gente, e "12 a 60 meses" obriga quem lê a fazer a conta.
    """
    exemplos = []
    for p in correcoes[:3]:
        a, d = p["antes"], p["depois"]
        exemplos.append(
            f"o {_artigo_em_prosa(a['artigo'])} constava com "
            f"{_faixa_de_meses(a['pena_min'], a['pena_max'])} de "
            f"{a['tipo_pena'].lower()} e passa a "
            f"{_faixa_de_meses(d['pena_min'], d['pena_max'])} de "
            f"{d['tipo_pena'].lower()}")
    return "; ".join(exemplos)


# ── Notas de atualização ────────────────────────────────────────────────────
# O feed publica só alteração de LEI que cria, modifica ou extingue tipo penal
# (AGENTS.md). Uma moldura divergente pode ser lei nova ou dado que estava
# errado, e o que separa os dois é a anotação do compilado: redação dada, ou
# dispositivo incluído, por lei deste ano ou do anterior é alteração
# legislativa. A divergência sob redação antiga é correção de dado e fica fora
# do feed; o corpo do PR diz o porquê de cada uma.
ANOS_DE_LEI_RECENTE = 1
# Espelha ROTULO_TIPO de src/data/changelog/types.ts.
ROTULO_NATUREZA = {
    "incriminadora": "novatio legis incriminadora",
    "pejus": "novatio legis in pejus",
    "mellius": "novatio legis in mellius",
    "abolitio": "abolitio criminis",
}
_GRAVIDADE_ESPECIE = {"Prisão simples": 0, "Detenção": 1, "Reclusão": 2}


def _lei_recente(anot: dict | None, ano: int) -> bool:
    return bool(anot and anot.get("norma") and anot.get("ano")
                and anot["ano"] >= ano - ANOS_DE_LEI_RECENTE)


def natureza_da_correcao(p: dict) -> str | None:
    """in pejus se a pena só sobe; in mellius se só desce; None se sobe e desce."""
    a, d = p["antes"], p["depois"]
    sobe = d["pena_min"] > a["pena_min"] or d["pena_max"] > a["pena_max"]
    desce = d["pena_min"] < a["pena_min"] or d["pena_max"] < a["pena_max"]
    ga = _GRAVIDADE_ESPECIE.get(a.get("tipo_pena"))
    gd = _GRAVIDADE_ESPECIE.get(d.get("tipo_pena"))
    if ga is not None and gd is not None:
        sobe, desce = sobe or gd > ga, desce or gd < ga
    if sobe and not desce:
        return "pejus"
    if desce and not sobe:
        return "mellius"
    return None


def mudancas_da_lei(escolha: dict, ano: int) -> tuple[list[dict], list[dict]]:
    """(o que vai para as notas, o que fica fora delas e por quê)."""
    legais, fora = [], []
    for p in escolha["correcoes"]:
        anot, artigo = p.get("anotacao"), p["antes"]["artigo"]
        natureza = natureza_da_correcao(p)
        if not _lei_recente(anot, ano):
            fora.append({"id": p["id"], "artigo": artigo,
                         "motivo": "correção de dado; a redação vigente não é de lei recente"})
        elif natureza is None:
            fora.append({"id": p["id"], "artigo": artigo,
                         "motivo": "a pena sobe num limite e desce no outro; a natureza fica para a revisão"})
        else:
            legais.append({"id": p["id"], "natureza": natureza, "anotacao": anot,
                           "antes": p["antes"], "depois": p["depois"]})
    for n in escolha["novas"]:
        anot, linha = n["achado"].get("anotacao"), n["linha"]
        if _lei_recente(anot, ano) and anot.get("acao") == "incluido":
            legais.append({"id": linha["id"], "natureza": "incriminadora", "anotacao": anot,
                           "antes": None, "depois": linha})
        else:
            fora.append({"id": linha["id"], "artigo": linha["artigo"],
                         "motivo": "linha que faltava no catálogo; o dispositivo não foi incluído por lei recente"})
    return legais, fora


def _pela(norma: str) -> str:
    return "pelo" if norma.lower().startswith("decreto") else "pela"


def _faixa(linha: dict) -> str:
    return f"{_faixa_de_meses(linha['pena_min'], linha['pena_max'])} de {linha['tipo_pena'].lower()}"


def _links_ts(links: list[dict]) -> str:
    return "\n".join(f"    {{label: {json.dumps(l['label'], ensure_ascii=False)}, "
                     f"href: {json.dumps(l['href'], ensure_ascii=False)}}}," for l in links)


def entradas_changelog(escolha: dict, legais: list[dict], versao: str,
                       dia: str) -> list[tuple[Path, str]]:
    """Uma entrada por lei e por natureza. Texto puro (contrato do ChangelogEntry)."""
    rotulo = _rotulo(escolha["fonte"])
    grupos: dict[tuple[str, int, str], list[dict]] = {}
    for m in legais:
        a = m["anotacao"]
        grupos.setdefault((a["norma"], a["ano"], m["natureza"]), []).append(m)

    saida: list[tuple[Path, str]] = []
    for (norma, ano, natureza), itens in sorted(grupos.items()):
        base = f"{dia}-lei-{re.sub(r'[^0-9]', '', norma)}-{natureza}"
        ident, n = base, 2
        destino = ENTRADAS / dia[:4] / f"{ident}.ts"
        while destino.exists() or any(d == destino for d, _ in saida):
            ident = f"{base}-{n}"
            destino = ENTRADAS / dia[:4] / f"{ident}.ts"
            n += 1

        lei, qtd = f"{norma}, de {ano}", len(itens)
        if natureza == "incriminadora":
            titulo = f"{lei}: {_plural(qtd, 'tipo penal incluído', 'tipos penais incluídos')} ({rotulo})"
            acao = "incluídos" if qtd > 1 else "incluído"
            corpo = [f"{_artigo_em_prosa(m['depois']['artigo'])}: {m['depois']['crime']}, "
                     f"{_faixa(m['depois'])}." for m in itens[:8]]
        else:
            verbo = "agravada" if natureza == "pejus" else "abrandada"
            titulo = f"{lei}: {_plural(qtd, 'pena ' + verbo, 'penas ' + verbo + 's')} ({rotulo})"
            acao = "com redação dada"
            corpo = [f"{_artigo_em_prosa(m['antes']['artigo'])}: de {_faixa(m['antes'])} "
                     f"para {_faixa(m['depois'])}." for m in itens[:8]]
        if qtd > 8:
            corpo.append(f"E mais {qtd - 8} dispositivos, na mesma lei.")
        corpo.append(
            "A conferência é semanal e determinística: baixa o texto compilado, lê as "
            "molduras e compara com o publicado. A lei que deu a redação vem da anotação "
            "do próprio compilado.")
        resumo = (f"{rotulo}: {_plural(qtd, 'dispositivo', 'dispositivos')} {acao} "
                  f"{_pela(norma)} {lei}, segundo o texto compilado do Planalto.")
        links = []
        if itens[0]["anotacao"].get("url"):
            links.append({"label": f"{lei}, no Planalto", "href": itens[0]["anotacao"]["url"]})
        links += [{"label": _artigo_em_prosa(m["depois"]["artigo"]),
                   "href": f"{SITE}/tipos/{m['id']}"} for m in itens[:5]]

        ts = f"""import type {{ChangelogEntry}} from '../../types';

const entrada: ChangelogEntry = {{
  id: '{ident}',
  date: '{dia}',
  title: {json.dumps(titulo, ensure_ascii=False)},
  summary:
    {json.dumps(resumo, ensure_ascii=False)},
  body: [
{chr(10).join('    ' + json.dumps(p, ensure_ascii=False) + ',' for p in corpo)}
  ],
  tipo: '{natureza}',
  areas: ['Tipos penais'],
  version: 'v{versao}',
  links: [
{_links_ts(links)}
  ],
}};

export default entrada;
"""
        saida.append((destino, ts))
    return saida


# ── Execução ────────────────────────────────────────────────────────────────
def _relativo(destino: Path) -> str:
    return str(destino if RAIZ not in destino.parents
               else destino.relative_to(RAIZ)).replace("\\", "/")


def aplicar(escolha: dict, versao: str | None, dia: str, saida: Path) -> dict:
    """Aplica a rodada. Nota, e versão, só quando alguma mudança vem de lei recente."""
    if escolha["correcoes"]:
        corrigir.aplicar(escolha["correcoes"])
    if escolha["novas"]:
        criar.aplicar(escolha["novas"])

    legais, fora = mudancas_da_lei(escolha, int(dia[:4]))
    destinos: list[Path] = []
    if versao and legais:
        for destino, ts in entradas_changelog(escolha, legais, versao, dia):
            destino.parent.mkdir(parents=True, exist_ok=True)
            # CRLF como o resto do repositório (as demais entradas são CRLF).
            destino.write_bytes(ts.replace("\n", "\r\n").encode("utf-8"))
            destinos.append(destino)
        subir_versao(versao)
    fechada = versao if destinos else None

    fonte = escolha["fonte"]
    meta = {
        "fonte": fonte["id"],
        "rotulo": _rotulo(fonte),
        "correcoes": len(escolha["correcoes"]),
        "novas": len(escolha["novas"]),
        "humanos": len(escolha["humanos"]),
        # O workflow lê as chaves; vazias, e não ausentes, quando não há nota.
        "versao": fechada or "",
        "ramo": f"conferidor/{fonte['id']}-{dia}",
        "titulo": (f"fix(catalogo): {escolha['total']} ajuste(s) em "
                   f"{_rotulo(fonte)} conferidos com o texto compilado"),
        "entrada": _relativo(destinos[0]) if destinos else "",
        "entradas": [_relativo(d) for d in destinos],
    }
    saida.mkdir(parents=True, exist_ok=True)
    (saida / "corpo.md").write_text(corpo_pr(escolha, fechada, legais, fora),
                                    encoding="utf-8", newline="\n")
    (saida / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
                                     encoding="utf-8", newline="\n")
    return meta


def _rodada_de_auditoria(args) -> int:
    """PR das mudanças de classificação.

    Só corre quando não há correção de PENA pendente: um PR por rodada, e a pena
    tem prioridade — é o que a máquina lê com segurança. A classificação vem
    depois, e vem como proposta.
    """
    import auditar

    achados = auditar.rodar()
    propostas = propostas_de_auditoria(achados)
    print(f"auditoria: {len(achados)} achado(s), {len(propostas)} viram proposta")
    for p in propostas[:40]:
        print(f"  id {p['id']:5d} {p['campo']:9s} {p['de']} -> {p['para']}  "
              f"{p['lei']} {p['artigo']}")
    if not propostas:
        return 1

    # Classificação corrigida contra o rol é correção de dado: sem nota e sem
    # versão. Se a mudança vier de lei nova, a entrada se escreve à mão.
    if not args.aplicar:
        print("(simulacao - nada foi escrito; a auditoria não escreve nota nem sobe versão)")
        return 0

    aplicar_auditoria(propostas)
    fontes_novas = aplicar_fontes_propostas()
    dia = hoje().isoformat()
    versao = None

    saida = Path(args.saida)
    saida.mkdir(parents=True, exist_ok=True)
    (saida / "corpo.md").write_text(
        corpo_auditoria(propostas, versao, auditar.montar_relatorio(achados),
                        fontes_novas),
        encoding="utf-8", newline="\n")
    meta = {
        "fonte": "auditoria", "rotulo": "classificação",
        "correcoes": len(propostas), "novas": 0,
        "humanos": len(achados) - len(propostas), "versao": versao or "",
        "ramo": f"conferidor/auditoria-{dia}",
        "titulo": f"fix(catalogo): {len(propostas)} ajuste(s) de hediondez e ação penal",
        "entrada": "", "entradas": [],
    }
    (saida / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
                                     encoding="utf-8", newline="\n")
    print(f"aplicado; ramo {meta['ramo']}, " + (f"versão v{versao}" if versao else "sem versão"))
    return 0


def main() -> int:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    p = argparse.ArgumentParser(description="Monta a proposta da rodada do conferidor.")
    p.add_argument("--fonte", help="força o diploma (padrão: o de mais propostas)")
    p.add_argument("--com-novas", action="store_true",
                   help="também propõe linhas NOVAS (exige revisão de modelagem)")
    p.add_argument("--aplicar", action="store_true",
                   help="escreve no catálogo, no changelog e na versão")
    p.add_argument("--saida", default=str(RAIZ / "crawler" / "proposta"))
    p.add_argument("--auditoria", action="store_true",
                   help="propõe as mudanças de hediondez e ação penal (exigem juízo)")
    args = p.parse_args()

    if args.auditoria:
        return _rodada_de_auditoria(args)

    escolha = escolher(com_novas=args.com_novas, apenas=args.fonte)
    if escolha is None:
        print("nada mecânico nesta rodada — os achados restantes exigem decisão humana")
        return 1

    f = escolha["fonte"]
    print(f"{f['id']}: {len(escolha['correcoes'])} correção(ões), "
          f"{len(escolha['novas'])} linha(s) nova(s), "
          f"{len(escolha['humanos'])} para decisão humana")
    for x in escolha["correcoes"]:
        a, d = x["antes"], x["depois"]
        print(f"  corrige id {x['id']:5d} {a['artigo']:24s} {a['pena_min']}–{a['pena_max']} "
              f"→ {d['pena_min']}–{d['pena_max']} {d['tipo_pena']}")
    for x in escolha["novas"]:
        linha = x["linha"]
        print(f"  cria    id {linha['id']:5d} {linha['artigo']:24s} "
              f"{linha['pena_min']}–{linha['pena_max']} {linha['tipo_pena']}")

    versao = versao_da_rodada()
    if not args.aplicar:
        legais, _ = mudancas_da_lei(escolha, hoje().year)
        fecho = (f"fecharia a v{versao} com {_plural(len(legais), 'nota', 'notas')}" if legais
                 else "sem nota nem versão: nada vem de lei recente")
        print(f"(simulação — nada foi escrito; {fecho})")
        return 0

    meta = aplicar(escolha, versao, hoje().isoformat(), Path(args.saida))
    print(f"aplicado; ramo {meta['ramo']}, "
          + (f"versão v{meta['versao']}, " if meta["versao"] else "sem versão, ")
          + f"corpo em {args.saida}/corpo.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
