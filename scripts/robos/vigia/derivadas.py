# -*- coding: utf-8 -*-
"""Recalcula as linhas de PENA DERIVADA a partir da base e da fração que a lei escreve.

O vigia confere a moldura que a lei comina diretamente. Cento e sessenta linhas
do catálogo não têm essa moldura: são aumento, diminuição, dobro ou metade de
OUTRA moldura ("na hipótese do § 10, a pena é aumentada de um terço"), e até
28/09/2026 saíam da conferência como `pena_derivada` — um limite declarado,
contado e nunca conferido. Foi debaixo dele que três linhas do incêndio majorado
(CP, art. 250, § 1º) publicaram por meses a pena do caput sem o aumento, e que a
corrupção passiva majorada (art. 317, § 1º) publicou a pena simples.

A conta é determinística e a lei dá os dois operandos: a BASE é o registro que o
próprio catálogo aponta — o `c/c` ("Art. 155, §11 c/c §10") ou, sem ele, o caput
do mesmo artigo — e a FRAÇÃO é a do texto do dispositivo que manda calcular. O
que a regra não decide sai como *pede juízo*, nunca como número: base em outro
artigo sem `c/c` que a declare, fração ilegível, texto que sobe e desce.

Não escreve no catálogo. O que diverge vira achado da rodada.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from nucleo.dispositivo import chave  # noqa: E402
from nucleo.fracao import (aplicar, direcao, fracao_humana, fracoes_do_texto,  # noqa: E402
                           parte)

TOLERANCIA_MESES = 1 / 30 + 1e-6
# CPM, art. 58: o máximo da reclusão é trinta anos. O dobro do latrocínio
# militar (15 a 30) não passa daí — e o catálogo publica o teto em 360.
TETO_CPM_MESES = 360.0

_INCISO = re.compile(r",\s*([IVXLC]+)\s*(?:,\s*([a-z])\s*)?(?:\(|$|\s+c/c)")
_PARTE = re.compile(r"\b(\d)ª\s+parte\b")
_PARENTESE = re.compile(r"\s*\([^)]*\)\s*$")
_ARTIGO = re.compile(r"^(Art\.\s*[\w-]+)", re.I)


def _norm(artigo: str) -> str:
    """"Art. 126" e "art. 126, caput" são o mesmo registro; espaço e ordinal não contam."""
    a = _PARENTESE.sub("", artigo or "").strip()
    a = re.sub(r"^art\.", "Art.", a, flags=re.I)
    a = re.sub(r"[\sº°]", "", a).lower()
    return re.sub(r",caput$", "", a)


def _artigo_base(artigo: str) -> str:
    m = _ARTIGO.match(artigo.strip())
    return m.group(1) if m else artigo


def alvo_do_c_c(artigo: str) -> str | None:
    """O que vem depois do `c/c`, resolvido para um rótulo de artigo do catálogo.

    "§10" e "caput" são do mesmo artigo que a primeira parte; "art. 242, §2º, V"
    já vem inteiro. O parêntese de desambiguação ("(morte)") sai: ele é do
    registro, não do dispositivo.
    """
    if " c/c " not in artigo:
        return None
    cabeca, resto = artigo.split(" c/c ", 1)
    resto = _PARENTESE.sub("", resto).strip()
    if re.match(r"^art\.", resto, re.I):
        return re.sub(r"^art\.", "Art.", resto, flags=re.I)
    return f"{_artigo_base(cabeca)}, {resto}"


def candidatos_a_base(linha: dict, registros: list[dict]) -> tuple[list[dict], str]:
    """(registros que podem ser a base, como foi escolhida).

    Com `c/c`, a base é declarada: casa por igualdade normalizada, ou por
    prefixo quando o alvo é um parágrafo desdobrado em incisos ("art. 157, §3º"
    tem o I e o II). Sem `c/c`, a base presumida é o caput do mesmo artigo; as
    outras molduras do artigo entram como segunda tentativa, e o resultado diz
    qual delas fechou a conta.
    """
    meu = _norm(linha["artigo"])
    alvo = alvo_do_c_c(linha["artigo"])
    if alvo:
        n = _norm(alvo)
        exatos = [c for c in registros if _norm(c["artigo"]) == n and c["id"] != linha["id"]]
        if exatos:
            return exatos, "declarada"
        prefixo = [c for c in registros if _norm(c["artigo"]).startswith(n + ",")
                   and c["id"] != linha["id"]]
        return prefixo, "declarada"
    art = _norm(_artigo_base(linha["artigo"]))
    caput = [c for c in registros if _norm(c["artigo"]) == art and c["id"] != linha["id"]]
    if not caput:
        # Sem caput no catálogo, a base é de OUTRO artigo (art. 141 majora os
        # arts. 138 a 140; art. 127 majora os arts. 125 e 126), e o registro
        # não a declara. Não se adivinha.
        return [], "presumida"
    outras = [c for c in registros
              if _norm(c["artigo"]).startswith(art + ",") and c["id"] != linha["id"]
              and _norm(c["artigo"]) != meu and " c/c " not in c["artigo"]
              and not _PARTE.search(c["artigo"])]
    return caput + outras, "presumida"


def _texto_do_multiplicador(linha: dict, da_lei: dict) -> tuple[str, list[str]]:
    """(texto onde a lei escreve a fração, textos dos incisos do dispositivo).

    O texto é o do dispositivo da primeira parte do registro, mais o do inciso
    quando o registro é de inciso e a fração mora nele. Os incisos voltam à
    parte para o registro que agrega o parágrafo inteiro ("Art. 129, §12"): a
    fração de cada um é uma hipótese a tentar.
    """
    cabeca = linha["artigo"].split(" c/c ", 1)[0]
    k = chave(cabeca)
    d = da_lei.get(k) if k else None
    if d is None:
        return "", []
    texto = f"{d.texto or ''} {d.pena_texto or ''}"

    def _campo(inc, nome):
        return inc.get(nome) if isinstance(inc, dict) else getattr(inc, nome, None)
    incisos = [str(_campo(i, "texto") or "") for i in (getattr(d, "incisos", None) or [])]
    m = _INCISO.search(_PARENTESE.sub("", cabeca) + " ")
    if m and getattr(d, "incisos", None):
        for inc in d.incisos:
            marcador = _campo(inc, "marcador")
            if marcador and marcador.strip().upper() == m.group(1).upper():
                texto += " " + str(_campo(inc, "texto") or "")
        incisos = []
    return re.sub(r"\s+", " ", texto).strip(), incisos


def _fracoes_candidatas(linha: dict, texto: str, incisos: list[str]) -> list[tuple[float, float]]:
    """As frações que a lei pode estar mandando aplicar a esta linha.

    Uma só, em regra. Duas exceções: o registro de "Nª parte" pega a N-ésima
    fração do texto (art. 127: um terço na lesão, dobro na morte); o registro
    que agrega um parágrafo dividido em incisos, cada um com a sua fração,
    tenta a de cada inciso.
    """
    m = _PARTE.search(linha["artigo"].split(" c/c ", 1)[0])
    if m:
        oracao = parte(texto, int(m.group(1)))
        f = fracoes_do_texto(oracao) if oracao else None
        return [f] if f else []
    f = fracoes_do_texto(texto)
    if f:
        return [f]
    saida = []
    for inc in incisos:
        fi = fracoes_do_texto(inc)
        if fi and fi not in saida:
            saida.append(fi)
    return saida


def _moldura(c: dict) -> tuple[float, float]:
    return (float(c.get("pena_min_meses", c.get("pena_min") or 0) or 0),
            float(c.get("pena_max_meses", c.get("pena_max") or 0) or 0))


# O catálogo guarda meses, e a fração raramente fecha em mês inteiro: 2 meses
# aumentados de um terço são 2 meses e 20 dias, que o registro escreve como 2.
# Um mês de folga cobre o arredondamento sem cobrir erro nenhum — os erros que
# este verificador achou ficavam a 8, 12 e 48 meses da conta.
TOLERANCIA_DERIVADA_MESES = 1.0 + 1e-6


def avaliar(linha: dict, registros: list[dict], da_lei: dict,
            molduras_da_lei=None) -> dict:
    """Um veredito por linha derivada.

    `status`: `confere`, `diverge` ou `pede_juizo`. Sempre com `motivo` em
    prosa, e — quando há conta — `base`, `fracao`, `natureza`, `esperado`.

    `molduras_da_lei(rotulo_de_artigo) -> [(min, max)]` resolve a base que o
    `c/c` declara e o catálogo não tem como registro: a Lei 7.643 pune a pesca
    de cetáceo "Art. 1º c/c Art. 2º", e o art. 2º é só o preceito da pena.
    """
    texto, incisos = _texto_do_multiplicador(linha, da_lei)
    bases, origem = candidatos_a_base(linha, registros)
    tem_c_c = " c/c " in linha["artigo"]
    saida = {"id": linha["id"], "artigo": linha["artigo"], "origem_da_base": origem,
             "texto": texto[:220], "publicado": _moldura(linha)}

    if not texto:
        return dict(saida, status="pede_juizo",
                    motivo="o dispositivo da primeira parte do registro não foi localizado no compilado")
    # Base declarada que não é registro: vale a moldura que a lei escreve nela.
    molduras_base: list[tuple[str, int | None, tuple[float, float]]] = [
        (b["artigo"], b["id"], _moldura(b)) for b in bases]
    if not molduras_base and tem_c_c and molduras_da_lei is not None:
        alvo = alvo_do_c_c(linha["artigo"])
        for m in molduras_da_lei(alvo) or []:
            molduras_base.append((f"{alvo} (moldura lida na lei)", None, m))
    if not molduras_base:
        return dict(saida, status="pede_juizo",
                    motivo=("a base declarada no c/c não existe no catálogo nem tem moldura legível na lei"
                            if tem_c_c else
                            "sem c/c e sem caput no mesmo artigo: a base está em outro artigo, "
                            "e o registro não a declara"))
    # Base presumida (o caput) só vale se o caput tem moldura PRÓPRIA na lei.
    # Se ele mesmo é derivado ("pena correspondente ao delito consumado"), a
    # base real está em outro artigo, e o registro não a declara.
    if origem == "presumida" and molduras_da_lei is not None:
        if not molduras_da_lei(bases[0]["artigo"]):
            return dict(saida, status="pede_juizo",
                        motivo="o caput do artigo não tem moldura própria na lei; a base está em "
                               "outro artigo, e o registro não a declara")

    natureza = direcao(texto)
    fracoes = _fracoes_candidatas(linha, texto, incisos)
    # Sem fração, um `c/c` ainda tem leitura: a pena é a da base, sem operação
    # ("aplicam-se as disposições do art. 242, §2º"; "Pena: a mesma do crime
    # incitado"). Sem `c/c`, texto sem fração é texto que o vigia não lê.
    if not fracoes:
        if tem_c_c and not natureza:
            natureza, fracoes = "aumento", [(0.0, 0.0)]
        else:
            return dict(saida, status="pede_juizo",
                        motivo="o texto do dispositivo não traz fração legível")
    if natureza is None:
        return dict(saida, status="pede_juizo",
                    motivo="o texto sobe e desce a pena, ou não diz a direção")

    teto = TETO_CPM_MESES if (linha.get("lei") or "").startswith("CPM") else None
    pmin, pmax = _moldura(linha)
    tentativas = []
    for rotulo, bid, (bmin, bmax) in molduras_base:
        for fracao in fracoes:
            emin, emax = aplicar(bmin, bmax, natureza, fracao)
            if teto is not None and emin >= teto:
                # O dobro de 15 a 30 anos chega ao teto nos DOIS limites (CPM,
                # art. 58) — e o art. 405 comina MORTE, grau máximo, justamente
                # quando a pena de paz é de trinta anos. Não é conta: é decisão
                # de modelagem, e não se acusa.
                return dict(saida, status="pede_juizo", base=rotulo, base_id=bid,
                            natureza=natureza, fracao=fracao,
                            motivo=f"{rotulo} ({bmin:g}–{bmax:g}) {'+' if natureza == 'aumento' else '−'}"
                                   f"{fracao_humana(*fracao)} chega ao teto de {teto:g} meses (CPM, "
                                   f"art. 58) nos dois limites; o catálogo publica {pmin:g}–{pmax:g}. "
                                   "Onde a lei comina morte no grau máximo (art. 405), a moldura é "
                                   "decisão de modelagem, não aritmética")
            if teto is not None:
                emin, emax = min(emin, teto), min(emax, teto)
            bate = (abs(emin - pmin) <= TOLERANCIA_DERIVADA_MESES
                    and abs(emax - pmax) <= TOLERANCIA_DERIVADA_MESES)
            tentativas.append({"base": rotulo, "base_id": bid, "base_moldura": (bmin, bmax),
                               "fracao": fracao, "esperado": (emin, emax), "bate": bate})
            if bate:
                nota = ""
                if origem == "presumida" and bid != molduras_base[0][1]:
                    nota = " — base presumida, não é o caput"
                if len(fracoes) > 1:
                    nota += " — fração de um dos incisos"
                return dict(saida, status="confere", base=rotulo, base_id=bid, natureza=natureza,
                            fracao=fracao, esperado=(emin, emax),
                            motivo=f"{rotulo} ({bmin:g}–{bmax:g}) {'+' if natureza == 'aumento' else '−'}"
                                   f"{fracao_humana(*fracao)} = {emin:g}–{emax:g}{nota}")
    t = tentativas[0]
    return dict(saida, status="diverge", base=t["base"], base_id=t["base_id"], natureza=natureza,
                fracao=t["fracao"], esperado=t["esperado"], tentativas=tentativas,
                motivo=(f"{t['base']} ({t['base_moldura'][0]:g}–{t['base_moldura'][1]:g}) "
                        f"{'+' if natureza == 'aumento' else '−'}{fracao_humana(*t['fracao'])} = "
                        f"{t['esperado'][0]:g}–{t['esperado'][1]:g}, e o catálogo publica {pmin:g}–{pmax:g}"
                        + (f"; nenhuma das {len(tentativas)} contas possíveis fecha"
                           if len(tentativas) > 1 else "")))
