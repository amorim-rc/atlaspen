# -*- coding: utf-8 -*-
"""Valida a base dos atributos penais e o histórico legislativo (frente 5).

Depois da migração, `data/atributos.json` é editado à mão, como
`data/crimes.json`. Estas checagens são o que impede um patamar digitado
errado de chegar ao site:

- id inteiro, único, fora dos aposentados; slug único;
- categoria, natureza e tipo de parâmetro dentro do vocabulário;
- fração em [0, 1]; `min ≤ padrão ≤ max`; booleano com padrão booleano;
- todo parâmetro com ao menos uma redação, ou com `sem_fonte_legal` dizendo por quê;
- toda chave de dispositivo com diploma em `data/fontes.json`;
- toda redação datada (norma não nula) com a MESMA norma no histórico do seu
  dispositivo — é essa junção que dá a vigência de cada redação;
- o histórico só com eventos, naturezas e origens do vocabulário.

Uso: python scripts/validar_atributos.py   (sai com 1 se algo falhar)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CATEGORIAS = {"processual", "aplicacao", "execucao"}
NATUREZAS = {"abstrato", "concreto", "incondicionado"}
TIPOS = {"meses", "fracao", "booleano", "inteiro"}
EVENTOS = {"criacao", "alteracao", "revogacao", "renumeracao", "transferencia"}
FONTE_CHAVES = {"dispositivo", "dispositivos", "sumula", "decisao"}


def _ler(rel: str):
    return json.loads((RAIZ / rel).read_text(encoding="utf-8"))


def _e_artigo(chave: str) -> bool:
    return ", " not in chave.split("|", 1)[1]


def _linhas_de(chave: str, linhas: list[dict]) -> list[dict]:
    if _e_artigo(chave):
        return [l for l in linhas
                if l["dispositivo"] == chave or l["dispositivo"].startswith(chave + ", ")]
    return [l for l in linhas if l["dispositivo"] == chave]


def _chaves(fonte: dict) -> list[str]:
    return ([fonte["dispositivo"]] if "dispositivo" in fonte else []) + fonte.get("dispositivos", [])


def validar() -> list[str]:
    erros: list[str] = []
    fontes = {f["id"] for f in _ler("data/fontes.json")["fontes"]}
    base = _ler("data/atributos.json")
    historico = _ler("data/historico-legislativo.json")["eventos"]

    def chave_ok(onde: str, k: str) -> None:
        if "|" not in k or k.split("|", 1)[0] not in fontes:
            erros.append(f"{onde}: chave {k!r} sem diploma em data/fontes.json")

    aposentados = set(base.get("aposentados", []))
    ids, slugs = set(), set()
    for a in base["atributos"]:
        onde = f"atributo {a.get('id')} ({a.get('slug')})"
        if not isinstance(a.get("id"), int) or isinstance(a.get("id"), bool) or a["id"] < 1:
            erros.append(f"{onde}: id tem de ser inteiro positivo")
        elif a["id"] in ids or a["id"] in aposentados:
            erros.append(f"{onde}: id repetido ou aposentado")
        ids.add(a.get("id"))
        if a.get("slug") in slugs:
            erros.append(f"{onde}: slug repetido")
        slugs.add(a.get("slug"))
        if a.get("categoria") not in CATEGORIAS:
            erros.append(f"{onde}: categoria {a.get('categoria')!r}")
        if a.get("natureza") not in NATUREZAS:
            erros.append(f"{onde}: natureza {a.get('natureza')!r}")
        for k in ("nome", "fundamento", "descricao"):
            if not a.get(k):
                erros.append(f"{onde}: {k} vazio")
        for k in a.get("dispositivos", []):
            chave_ok(onde, k)

        for p in a.get("parametros", []):
            op = f"{onde}.{p.get('id')}"
            tipo = p.get("tipo")
            if tipo not in TIPOS:
                erros.append(f"{op}: tipo {tipo!r}")
                continue
            padrao = p.get("padrao")
            if tipo == "booleano":
                if not isinstance(padrao, bool):
                    erros.append(f"{op}: padrão de booleano tem de ser true/false")
            else:
                if isinstance(padrao, bool) or not isinstance(padrao, (int, float)):
                    erros.append(f"{op}: padrão numérico ausente")
                else:
                    lo, hi = p.get("min"), p.get("max")
                    if lo is not None and padrao < lo or hi is not None and padrao > hi:
                        erros.append(f"{op}: padrão {padrao} fora de [{lo}, {hi}]")
                    if tipo == "fracao" and not (0 <= padrao <= 1 and (lo is None or lo >= 0)
                                                  and (hi is None or hi <= 1)):
                        erros.append(f"{op}: fração fora de [0, 1]")
            redacoes = p.get("redacoes") or []
            if bool(redacoes) == bool(p.get("sem_fonte_legal")):
                erros.append(f"{op}: precisa de redações OU de sem_fonte_legal (e só de um)")
            # O carregador do site toma a ÚLTIMA redação como a vigente: a ordem
            # tem de ser cronológica, pelo ano da norma no histórico.
            anos: list[int] = []
            for i, r in enumerate(redacoes):
                orr = f"{op}, redação {i + 1}"
                f = r.get("fonte") or {}
                if not f or set(f) - FONTE_CHAVES:
                    erros.append(f"{orr}: fonte {f!r}")
                if not r.get("fundamento"):
                    erros.append(f"{orr}: fundamento vazio")
                if "valor" in r and tipo == "fracao" and not 0 <= r["valor"] <= 1:
                    erros.append(f"{orr}: valor fora de [0, 1]")
                chaves = _chaves(f)
                for k in chaves:
                    chave_ok(orr, k)
                norma = r.get("norma", "")
                if chaves and norma is not None:
                    linhas = [l for k in chaves for l in _linhas_de(k, historico)]
                    casadas = [l for l in linhas if l.get("norma") == norma]
                    if not casadas:
                        erros.append(f"{orr}: {norma!r} não consta do histórico de {chaves}")
                    else:
                        anos.append(casadas[0].get("ano") or 0)
            if anos != sorted(anos):
                erros.append(f"{op}: redações fora de ordem cronológica ({anos})")

    for i, l in enumerate(historico):
        ol = f"histórico, linha {i + 1} ({l.get('dispositivo')})"
        chave_ok(ol, l.get("dispositivo", ""))
        if l.get("evento") not in EVENTOS:
            erros.append(f"{ol}: evento {l.get('evento')!r}")
        if l.get("natureza") not in {"legislativa", "correcao"}:
            erros.append(f"{ol}: natureza {l.get('natureza')!r}")
        if l.get("origem") not in {"compilado", "manual"}:
            erros.append(f"{ol}: origem {l.get('origem')!r}")
    return erros


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    erros = validar()
    if erros:
        for e in erros:
            print("  ✗", e)
        print(f"✗ {len(erros)} erro(s) em data/atributos.json ou data/historico-legislativo.json")
        return 1
    base = _ler("data/atributos.json")["atributos"]
    n_par = sum(len(a["parametros"]) for a in base)
    n_hist = len(_ler("data/historico-legislativo.json")["eventos"])
    print(f"✓ atributos.json: {len(base)} atributos, {n_par} parâmetros; "
          f"histórico: {n_hist} eventos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
