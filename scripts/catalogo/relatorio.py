# -*- coding: utf-8 -*-
"""O relatório de qualidade (`static/data/qualidade.json`) e o resumo impresso.

O relatório é o que a página inicial lê para os contadores e o que a CI vigia
pelo número de contradições; o resumo é o que quem roda o construtor vê no
terminal. Os dois contam as mesmas coisas a partir dos mesmos registros já
enriquecidos e já marcados por `duplicatas.marcar_duplicatas`.
"""
import json
import re
from collections import Counter

from .caminhos import OUT, RELATORIO, ROOT
from .tabelas import PERDAO_JUDICIAL_SEM_TIPO


# Condutas-base: dispositivos colapsados ao artigo-base (sem §/inciso/alínea/
# caput). Cada tipo é uma moldura penal própria; a conduta-base agrupa as
# formas (simples, qualificada, privilegiada) de um mesmo crime. A home usa
# os dois números: "N condutas se desdobram em M tipos/molduras".
def _base(c):
    m = re.match(r"(Art\.?\s*\d+(?:-[A-Z])?)", c["artigo"])
    return (c["lei"], m.group(1) if m else c["artigo"])


def montar_relatorio(crimes: list, por_chave: dict, contraditorios: list,
                     review_rows: list) -> dict:
    """O dicionário que vai para `static/data/qualidade.json`."""
    # ── Relatório de qualidade ──────────────────────────────────────────────
    com_pena = [c for c in crimes if c["tem_pena_privativa"]]
    return {
        "total_tipos_penais": len(crimes),
        "condutas_base": len({_base(c) for c in crimes}),
        # O terceiro contador da página inicial (frente 5 do backlog).
        "total_atributos": len(json.loads(
            (ROOT / "data" / "atributos.json").read_text(encoding="utf-8"))["atributos"]),
        "com_pena_privativa": len(com_pena),
        "sem_pena_privativa": len(crimes) - len(com_pena),
        "dispositivos_distintos": len(por_chave),
        "registros_duplicados": sum(1 for c in crimes if c["duplicata"]),
        "duplicatas_divergentes": len(contraditorios),
        "resultado_morte": sum(1 for c in crimes if c["resultado_morte"]),
        "perdao_judicial_previsto": sum(1 for c in crimes if c["perdao_judicial_previsto"]),
        "multa_ambigua": len(review_rows),
        "perdao_judicial_sem_tipo": PERDAO_JUDICIAL_SEM_TIPO,
        "contradicoes": sorted(contraditorios, key=lambda x: x["ids"][0]),
    }


def imprimir_resumo(crimes: list, relatorio: dict, review_rows: list) -> None:
    """O que o construtor diz no terminal ao fim de uma rodada."""
    priv = Counter(c["pena_privativa"] for c in crimes)
    multa = Counter(c["multa_regime"] for c in crimes)
    print("pena_privativa:", dict(priv))
    print("multa_regime:", dict(multa))
    print("tem_multa=True:", sum(1 for c in crimes if c["tem_multa"]))
    print("ambiguos remanescentes:", len(review_rows))
    print("correções manuais aplicadas:", sum(1 for c in crimes if c.get("multa_revisado")))
    print()
    print(f"tipos penais ............ {relatorio['total_tipos_penais']}")
    print(f"  com pena privativa .... {relatorio['com_pena_privativa']}")
    print(f"  sem pena privativa .... {relatorio['sem_pena_privativa']} (fora das estatísticas de alcance)")
    print(f"dispositivos distintos .. {relatorio['dispositivos_distintos']}")
    print(f"  registros duplicados .. {relatorio['registros_duplicados']}")
    print(f"  com dados divergentes . {relatorio['duplicatas_divergentes']}  <-- contradições a revisar")
    print(f"resultado morte ......... {relatorio['resultado_morte']}")
    print(f"perdão judicial previsto  {relatorio['perdao_judicial_previsto']}")
    print("escrito em:", OUT)
    print("relatório em:", RELATORIO)
