# -*- coding: utf-8 -*-
"""Os campos derivados de cada registro, e o laço que os preenche.

Tudo que `static/data/crimes.json` tem e `data/crimes.json` não tem nasce aqui
ou em `pena.py`: menor potencial e contravenção, hediondez pela tabela curada,
avisos, perdão judicial, resultado morte, última alteração legislativa, trilha
do conferidor. `enriquecer` é o laço que aplica tudo isso registro a registro,
na ordem em que o construtor sempre aplicou — a ordem decide a ordem das chaves
no JSON derivado, e o derivado é conferido byte a byte pela CI.
"""
import json
import re

# A hediondez tem tabela curada (`data/hediondos.json`) e módulo próprio, que o
# Auditor e este construtor compartilham para não divergirem em silêncio.
import hediondez as _hediondez  # noqa: E402

# ── A última alteração de cada registro (frente 4) ──────────────────────────
# A chave canônica vem de `scripts/dispositivo_canonico.py`, o mesmo módulo com
# que o robô do histórico decide quais dispositivos gerar. A regra de "alteração"
# é a dos atributos (`scripts/derivar_atributos.ts`, `resumo`), para que a ficha
# do tipo e a do atributo contem a mesma coisa:
#
# - alteração é todo evento legislativo que não seja o nascimento no texto
#   original (a inclusão por lei posterior conta);
# - nenhuma linha no histórico = não se sabe (o compilado cala): `null`;
# - só a linha do original = zero alterações, e `ultima_alteracao` é `null`.
import dispositivo_canonico as _dc  # noqa: E402

from .caminhos import AVISOS, CONFERENCIA, HISTORICO
from .duplicatas import chave_dispositivo
from .fontes import DIPLOMA
from .pena import derivar_pena, detect_multa
from .tabelas import (
    CORRECOES, CORRECOES_MORTE, DIPLOMAS_DE_CONTRAVENCOES, PENA_PRIVATIVA_MAP,
    PERDAO_JUDICIAL, RESULTADO_MORTE,
)


def _casa(regra, c: dict) -> bool:
    lei_re, art_re, exige_culposo = regra
    if not re.search(lei_re, c.get("lei") or "", re.I):
        return False
    if not re.search(art_re, c.get("artigo") or "", re.I):
        return False
    if exige_culposo and c.get("elemento") != "Culposo":
        return False
    return True


def derivar_hediondez(c: dict, tabela: dict) -> None:
    """`hediondo_especie` e `hediondo_fundamento`, da tabela curada.

    O catálogo diz SE o tipo é hediondo; a tabela diz por qual dispositivo, e é
    ela que separa o hediondo por natureza (rol do art. 1º da Lei 8.072/90) do
    equiparado (art. 5º, XLIII, da CF). Derivar em vez de digitar impede que o
    campo publicado discorde da tabela contra a qual a auditoria roda.
    """
    r = _hediondez.classificar(c, tabela)
    if c.get("hediondo") == "Sim":
        c["hediondo_especie"] = r["especie"]
        c["hediondo_fundamento"] = r["fundamento"]
    else:
        c["hediondo_especie"] = "nao"
        c["hediondo_fundamento"] = r["fundamento"] if r["regra"] == "excecao" else None


_ART_28 = re.compile(r"^Art\.?\s*28\b")


def menor_potencial(c: dict) -> tuple[bool, bool]:
    """(contravenção, infração de menor potencial ofensivo) do registro.

    Contravenção (LICP, art. 1º) é a infração a que a lei comina prisão simples
    ou multa, isoladamente ou em conjunto. A prisão simples a denuncia pela
    espécie — é o que põe o art. 45 do DL 6.259/44 (até 4 anos) entre elas —, e
    a LCP e a Lei 7.437/85 declaram contravenção tudo o que tipificam.

    Menor potencial ofensivo (Lei 9.099/95, art. 61): as contravenções, pela
    espécie, e os crimes com pena máxima até 2 anos, cumulada ou não com multa —
    e, a fortiori, os punidos só com multa. A regra antiga exigia pena máxima
    maior que zero, e 29 registros com multa isolada ficavam de fora. Duas
    exceções, decididas em 13/09/2026:

    - a Justiça Militar, a que a Lei 9.099 não se aplica (art. 90-A);
    - o porte para consumo pessoal (art. 28 da Lei 11.343/06), sem pena
      privativa nem multa, que o art. 48, §1º, manda ao rito da Lei 9.099.
    """
    diploma = DIPLOMA.get(c.get("lei"))
    contravencao = (c.get("pena_privativa") == "Prisão simples"
                    or diploma in DIPLOMAS_DE_CONTRAVENCOES)
    if diploma == "cpm":
        return contravencao, False
    if diploma == "drogas-11343" and _ART_28.match(c.get("artigo") or ""):
        return contravencao, True
    pmax = c["pena_max_meses"]
    multa_isolada = not c["tem_pena_privativa"] and c["tem_multa"]
    return contravencao, bool(contravencao or multa_isolada or (pmax and pmax <= 24))


def carregar_avisos() -> list:
    if not AVISOS.exists():
        return []
    return json.loads(AVISOS.read_text(encoding="utf-8"))["avisos"]


def _ehTituloXII(c: dict) -> bool:
    """Arts. 359-A a 359-T do CP. Mesmo critério de `src/lib/dosimetria/aplicaveis`."""
    if not re.match(r"^CP(?![A-Za-z])", c.get("lei") or ""):
        return False
    m = re.match(r"^Art\.?\s*359-([A-T])\b", c.get("artigo") or "", re.I)
    return bool(m)


def derivar_avisos(c: dict, avisos: list) -> None:
    """Os avisos que alcançam este registro (decisões 25, 36 e C16).

    O aviso não muda o cálculo: ele diz que a NORMA está em disputa — ADI em
    curso, tese de repercussão geral, divergência entre tribunais. A ficha o
    exibe ao lado do atributo que ele qualifica, ou no cabeçalho quando vale
    para o tipo inteiro.
    """
    do_registro = []
    for a in avisos:
        alcance = a.get("alcance") or {}
        if "ids" in alcance and c["id"] in alcance["ids"]:
            pass
        elif alcance.get("tituloXII") and _ehTituloXII(c):
            pass
        elif alcance.get("lei") and re.search(alcance["lei"], c.get("lei") or ""):
            pass
        else:
            continue
        do_registro.append({
            "id": a["id"], "titulo": a["titulo"], "texto": a["texto"],
            "fonte": a["fonte"], "consultado_em": a["consultado_em"],
            "atributo": alcance.get("atributo"),
        })
    c["avisos"] = do_registro or None


def carregar_trilha() -> dict:
    """Trilha de auditoria da última rodada do conferidor, se houver.

    Ausente num clone que ainda não rodou o conferidor — nesse caso os campos
    saem nulos, e a aplicação trata como "ainda não conferido". Nunca falha o
    build por causa disso: a trilha é informação SOBRE o dado, não o dado.
    """
    if not CONFERENCIA.exists():
        return {}
    return json.loads(CONFERENCIA.read_text(encoding="utf-8")).get("registros", {})


def carregar_historico() -> dict[str, list[dict]]:
    """{chave canônica da unidade: linhas, na ordem do arquivo}."""
    if not HISTORICO.exists():
        return {}
    por: dict[str, list[dict]] = {}
    for i, l in enumerate(json.loads(HISTORICO.read_text(encoding="utf-8"))["eventos"]):
        por.setdefault(l["dispositivo"], []).append({**l, "_ordem": i})
    return por


def derivar_ultima_alteracao(c: dict, historico: dict[str, list[dict]], rotulos: dict) -> None:
    chave = _dc.chave(c, rotulos)
    c["dispositivo_canonico"] = chave
    linhas = historico.get(chave or "", [])
    if not linhas:
        c["ultima_alteracao"] = None
        c["alteracoes_legislativas"] = None
        return
    alteracoes = [l for l in linhas if l.get("natureza") == "legislativa"
                  and not (l["evento"] == "criacao" and l.get("norma") == "original")]
    if not alteracoes:
        c["ultima_alteracao"] = None
        c["alteracoes_legislativas"] = 0
        return
    ultima = max(alteracoes, key=lambda l: (l.get("ano") or 0, l["_ordem"]))
    c["ultima_alteracao"] = {
        "norma": ultima.get("norma"),
        "ano": ultima.get("ano"),
        "evento": ultima["evento"],
        "dispositivo": ultima["dispositivo"],
        "url": ultima.get("url"),
        **({"vigencia": ultima["vigencia"]} if ultima.get("vigencia") else {}),
    }
    # Conta LEIS, e não linhas: o compilado anota o caput e a linha da pena de um
    # dispositivo incluído, e o robô registra as duas como versões — contar linhas
    # dava "2 alterações" ao art. 326-B do Código Eleitoral, incluído uma vez só.
    # A mesma conta de scripts/derivar_atributos.ts (resumo), para os atributos.
    c["alteracoes_legislativas"] = len({(l.get("norma"), l.get("ano")) for l in alteracoes})


def enriquecer(crimes: list, *, trilha: dict, tabela_hediondez: dict, avisos: list,
               historico: dict, rotulos_fonte: dict) -> list:
    """Preenche os campos derivados de cada registro, no lugar.

    Devolve as linhas de revisão da multa ambígua — (id, lei, artigo, crime,
    regime, motivo, obs) —, que o relatório de qualidade conta e a saída do
    construtor resume. Pressupõe os invariantes de `validacoes` já satisfeitos.
    """
    review_rows = []

    # A remissão já desdobrada em registros "c/c" (Lei 2.889/56, arts. 2º e 3º,
    # desde a revisão de 06/08/2026): os desdobrados contam nas estatísticas, e o
    # guarda-chuva não, para o mesmo crime não contar duas vezes (decisão de
    # 19/09/2026). Sem desdobramento, o guarda-chuva é quem conta.
    desdobrados = {
        (c.get("lei"), c.get("artigo")) for c in crimes if c.get("pena_por_remissao")
        and any(x.get("lei") == c.get("lei") and "c/c" in (x.get("artigo") or "")
                and re.match(re.escape(c.get("artigo") or "") + r"[ ,]", x.get("artigo") or "")
                for x in crimes)}

    for c in crimes:
        tipo = c.get("tipo_pena")
        c["pena_privativa"] = PENA_PRIVATIVA_MAP.get(tipo, "Nenhuma")
        tem_multa, regime, ambiguo, motivo = detect_multa(c.get("obs"), tipo)
        correcao = CORRECOES.get(c["id"])
        if correcao is not None:
            tem_multa = correcao["tem_multa"]
            regime = correcao["multa_regime"]
            ambiguo = False
            c["multa_revisado"] = True
        c["tem_multa"] = tem_multa
        c["multa_regime"] = regime
        c["derivado_auto"] = True

        derivar_pena(c)
        pmax = c["pena_max_meses"]

        # Todo registro é tipo penal (garantido por validar_tipos_penais). O que
        # varia é ter ou não pena PRIVATIVA: só quem tem entra nas estatísticas de
        # alcance dos atributos, que se medem por patamar de pena.
        # A pena por remissão É privativa: a do dispositivo de origem, que o motor
        # aplica origem a origem (src/lib/atributos/remissao.ts). Sem esta marca o
        # tipo saía de toda a varredura; com moldura zero, cabia em todo teto.
        remissao_conta = bool(c.get("pena_por_remissao")) and (c.get("lei"), c.get("artigo")) not in desdobrados
        c["tem_pena_privativa"] = bool(pmax or c["pena_min_meses"] or remissao_conta)
        c["contravencao"], c["infracao_menor_potencial"] = menor_potencial(c)
        derivar_hediondez(c, tabela_hediondez)
        derivar_avisos(c, avisos)
        c.setdefault("sancoes_nao_privativas", [])
        c.setdefault("pena_por_remissao", None)
        if c["pena_por_remissao"]:
            c["pena_faixa_rotulo"] = "pena definida por remissão a outro dispositivo"
        elif not c["tem_pena_privativa"]:
            # Sem moldura não há número a prefixar com "pena:", e o rótulo passa
            # a ser a frase inteira do cabeçalho — por isso ele se basta e não
            # repete a palavra "pena".
            c["pena_faixa_rotulo"] = "sem pena privativa de liberdade"

        # Resultado morte — derivado do nome do tipo, sobreponível por revisão.
        morte = bool(RESULTADO_MORTE.search(c.get("crime") or ""))
        if c["id"] in CORRECOES_MORTE:
            morte = CORRECOES_MORTE[c["id"]]
            c["resultado_morte_revisado"] = True
        c["resultado_morte"] = morte
        c["resultado_morte_derivado"] = c["id"] not in CORRECOES_MORTE

        # Perdão judicial — só onde a lei prevê expressamente.
        c["perdao_judicial_previsto"] = any(_casa(p, c) for p in PERDAO_JUDICIAL)

        c["chave_dispositivo"] = chave_dispositivo(c)
        derivar_ultima_alteracao(c, historico, rotulos_fonte)

        # Classificação CIRCUNSTANCIADA: a lei não decide pelo tipo. O art. 121
        # só é hediondo quando praticado em atividade de grupo de extermínio; a
        # ação do art. 161 só é privada se a propriedade for particular. Nesses,
        # o catálogo guarda a CONDIÇÃO e deixa o campo no padrão seguro — quem
        # marca é quem conhece o caso, na simulação.
        c["hediondo_condicional"] = bool(c.get("hediondo_condicao"))
        c["acao_condicional"] = bool(c.get("acao_condicao"))
        # Decisão 8, de 23/09/2026. Onde existe, o motor mostra os atributos que
        # a violência governa — ANPP, substituição, arrependimento posterior e
        # progressão — nas DUAS hipóteses, com a condição escrita ao lado.
        c["violencia_condicional"] = bool(c.get("violencia_condicao"))
        c.setdefault("violencia_condicao", None)
        # Divergência de jurisprudência ou de doutrina sobre a hediondez
        # (decisão 28). Não é condição do fato: o tipo não muda conforme o caso,
        # muda conforme quem julga. Por isso campo próprio, e não
        # `hediondo_condicao` — foi o que os ids 320, 323 e 385 mostraram.
        c.setdefault("hediondo_nota", None)

        # VIGÊNCIA. Um dispositivo pode deixar de valer sem sair do catálogo:
        # declarado inconstitucional com eficácia ex nunc (CPM, art. 232, §3º —
        # ADI 7555) ou revogado. O registro CONTINUA consultável, porque os fatos
        # anteriores seguem regidos por ele; o que muda é que a aplicação passa a
        # dizê-lo. Excluir seria apagar a lei que valia quando o fato ocorreu.
        #
        # O derivado é a ausência do campo, não uma comparação com a data de
        # hoje: o arquivo derivado é commitado e conferido pela CI, e um campo
        # que muda sozinho num dia qualquer quebraria o build sem ninguém ter
        # tocado em nada. Vacatio legis é outro problema, do conferidor
        # (scripts/robos/nucleo/vigencia.py), e não se modela aqui.
        c["vigente"] = not c.get("vigencia_ate")

        # Trilha de auditoria: quando este registro foi confrontado com a lei,
        # com que resultado e contra qual página. Vem da última rodada do
        # conferidor (data/conferencia.json) — quem cita um dado precisa saber
        # de quando é a conferência, e não só que ela existe.
        auditoria = trilha.get(str(c["id"]))
        c["fonte"] = (auditoria or {}).get("fonte")
        c["conferido_em"] = (auditoria or {}).get("conferido_em")
        c["conferido_resultado"] = (auditoria or {}).get("resultado")

        if ambiguo:
            review_rows.append(
                (c["id"], c["lei"], c["artigo"], c["crime"], regime, motivo, (c.get("obs") or "")[:120])
            )

    return review_rows
