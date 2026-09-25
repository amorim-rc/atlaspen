# -*- coding: utf-8 -*-
"""A moldura em meses vira rótulo, e o `obs` vira regime de multa.

A leitura da pena em si (`parse_pena_range`, unidades) está em
`scripts/pena_parser.py`, compartilhado com o conferidor; este módulo cuida do
caminho de volta — dos meses guardados para o texto exibido ("15 dias a 3
meses", "2 a 5 anos") — e da heurística de multa sobre o `obs`, que
`tabelas.CORRECOES` sobrepõe onde a revisão humana discordou.
"""
import re

# ── Unidades e leitura de pena ──────────────────────────────────────────────
# Extraídas para `scripts/pena_parser.py` (F3 do conferidor): o catálogo e o
# conferidor precisam ler a MESMA moldura do MESMO jeito — duas implementações
# discordando produziriam divergência falsa no relatório semanal.
from pena_parser import (  # noqa: E402,F401
    UNIDADE_EM_MESES, _NOMES_UNIDADE, _norm_unidade, _rotulo, _meses,
    RANGE_2U, RANGE_1U, ABBR, _ABBR_U, parse_pena_range,
)

from .tabelas import NEG_MULTA


def _ponta(meses: float) -> tuple[str, float | None, str | None]:
    """(rótulo, valor, unidade) de uma ponta da moldura, a partir dos MESES.

    A unidade volta como None quando a pena é composta ("26 anos e 8 meses"):
    nesse caso não há como compactar o intervalo, e cada ponta se escreve por
    inteiro. Causas de aumento produzem molduras assim (20 anos com um terço
    são 320 meses).

    Dias: o mês do art. 11 do CP tem 30 dias, então `meses * 30` devolve o
    número exato — 0,3333 mês são 10 dias, 0,5 são 15. A ida e volta é exata
    para todo valor de 1 a 29 dias (ver os testes do conferidor).
    """
    if meses <= 0:
        return "—", None, None
    if meses < 1:
        dias = round(meses * 30)
        return _rotulo(dias, "dias"), dias, "dias"
    if float(meses).is_integer() and meses % 12 == 0:
        anos = int(meses // 12)
        return _rotulo(anos, "anos"), anos, "anos"
    if float(meses).is_integer() and meses >= 24:
        anos, resto = divmod(int(meses), 12)
        return f"{_rotulo(anos, 'anos')} e {_rotulo(resto, 'meses')}", None, None
    valor = int(meses) if float(meses).is_integer() else round(meses, 1)
    return _rotulo(valor, "meses"), valor, "meses"


def _rotulo_de_meses(meses: float) -> str:
    return _ponta(meses)[0]


def _faixa_de_meses(minimo: float, maximo: float) -> str:
    """Intervalo por extenso: "2 a 5 anos", "15 dias a 3 meses", "até 6 meses"."""
    rot_min, v_min, u_min = _ponta(minimo)
    rot_max, v_max, u_max = _ponta(maximo)
    if maximo <= 0:
        return "—"
    if minimo <= 0:
        return f"até {rot_max}"
    if minimo == maximo:
        return rot_max          # pena fixa: "1 ano", não "1 a 1 ano"
    if u_min is not None and u_min == u_max:
        sing, plur = _NOMES_UNIDADE[u_max]
        return f"{v_min} a {v_max} {sing if v_max == 1 else plur}"
    return f"{rot_min} a {rot_max}"


def derivar_pena(c: dict):
    """Rótulos de exibição a partir da moldura em meses.

    **`pena_min`/`pena_max` são a autoridade.** Até a v1.2.16 a moldura era
    extraída do TEXTO do `obs` por expressão regular, e o número só valia como
    reserva — o que fazia uma frase secundária mudar a pena publicada: o art.
    32, §1º-A da Lei 9.605 exibia "3 meses a 1 ano" porque o `obs` mencionava a
    pena antiga. Invertida a ordem, o `obs` voltou a ser o que o nome diz.

    Campos acrescentados:
      pena_min_meses / pena_max_meses  -> float (unidade de cálculo)
      pena_min_rotulo / pena_max_rotulo -> str (exibição com unidade natural)
      pena_faixa_rotulo -> str (o intervalo como se lê)
    """
    mn = float(c.get("pena_min") or 0)
    mx = float(c.get("pena_max") or 0)
    c["pena_min_meses"] = round(mn, 4)
    c["pena_max_meses"] = round(mx, 4)
    c["pena_min_rotulo"] = _rotulo_de_meses(mn)
    c["pena_max_rotulo"] = _rotulo_de_meses(mx)
    c["pena_faixa_rotulo"] = _faixa_de_meses(mn, mx)


def detect_multa(obs: str, tipo_pena: str):
    """Retorna (tem_multa, regime, ambiguo, motivo)."""
    text = obs or ""
    low = text.lower()

    if tipo_pena == "Multa":
        return True, "isolada", False, ""

    has_word = "multa" in low
    if not has_word:
        return False, "nenhuma", False, ""

    ambiguo = False
    motivo = ""
    if NEG_MULTA.search(text):
        ambiguo = True
        motivo = "menção a multa possivelmente não-criminal (ex.: 'sem multa'/'multa reparatória')"

    # cumulativa: "e multa", "+ multa", ", multa", "dias-multa" (multa cumulada,
    # inclusive Lei 11.343/06: "reclusão + 500-1.500 dias-multa")
    if re.search(r"(?:\be\s+multa|\+[^.;]*multa|,\s*multa|e,?\s*multa|dias-multa)", low):
        return True, "cumulativa", ambiguo, motivo
    # alternativa: "ou multa"
    if re.search(r"\bou\s+multa", low):
        return True, "alternativa", ambiguo, motivo
    # menção genérica -> tratar como cumulativa mas marcar ambíguo
    ambiguo = True
    if not motivo:
        motivo = "menção a 'multa' sem conector claro (e/ou) — regime presumido"
    return True, "cumulativa", ambiguo, motivo
