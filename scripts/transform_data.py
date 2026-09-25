#!/usr/bin/env python3
"""
Enriquece o catálogo de tipos penais (crimes.json).

Deriva campos estruturados a partir do texto legal para permitir filtros
combinados por modalidade de pena e cálculo de atributos penais:

  - pena_privativa : Reclusão | Detenção | Prisão simples | Nenhuma
  - tem_multa      : bool  (multa cumulada OU alternativa OU isolada)
  - multa_regime   : cumulativa | alternativa | isolada | nenhuma
  - infracao_menor_potencial : bool (art. 61 da Lei 9.099: contravenção, pena máx.
    <= 2 anos ou só multa; nunca o CPM, art. 90-A)
  - contravencao : bool (prisão simples, ou registro da LCP ou da Lei 7.437/85)
  - tem_pena_privativa : bool (comina prisão, própria ou por remissão? entra nas estatísticas de alcance?)
  - resultado_morte : bool (qualificado pelo resultado morte -> art. 112, VI/VIII, LEP)
  - perdao_judicial_previsto : bool (há previsão legal expressa de perdão judicial?)
  - chave_dispositivo / duplicata : rastreiam registros repetidos

Impõe também as convenções do catálogo (ver CONTRIBUTING.md, C1 a C3): só tipos
penais, toda sanção declarada e `id` append-only. Violá-las falha o build.

Todos os campos derivados são heurísticos (regex sobre `crime`/`obs`/`artigo`) e
serão revisados individualmente. Correções finas ficam nas tabelas CORRECOES_*.

O arquivo de saída (static/data/crimes.json) é o único consumido pela aplicação;
data/crimes.json é a FONTE editável à mão (inclusive pela interface web do
GitHub) e regenerada pelo workflow .github/workflows/regen-data.yml.

Desde 25/09/2026 este arquivo é só a linha de comando: as regras moram no pacote
`scripts/catalogo/`, repartido por responsabilidade (ver o `__init__.py` de lá).
Tudo que os robôs e os testes sempre importaram daqui — `_faixa_de_meses`,
`proximo_id`, `validar_moldura`, as tabelas `CORRECOES*`… — continua importável
por este nome: os reexports abaixo são o contrato, e é por isso que são
explícitos, um a um, em vez de `*`.
"""
import json
import re  # noqa: F401
import sys
from collections import Counter, defaultdict  # noqa: F401
from pathlib import Path  # noqa: F401

# Roda tanto como `python scripts/transform_data.py` (sys.path[0] é `scripts/`)
# quanto importado pelos robôs e testes, que já põem `scripts/` no caminho.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from catalogo.caminhos import (  # noqa: E402,F401
    APOSENTADOS, AVISOS, CONFERENCIA, HISTORICO, OUT, RELATORIO, ROOT, SRC,
)
from catalogo.tabelas import (  # noqa: E402,F401
    CORRECOES, CORRECOES_MORTE, DIPLOMAS_DE_CONTRAVENCOES, NAO_TIPIFICA, NEG_MULTA,
    OPERADORES_REMISSAO, PENA_PRIVATIVA_MAP, PERDAO_JUDICIAL, PERDAO_JUDICIAL_SEM_TIPO,
    RESULTADO_MORTE, VOCABULARIO, _CP,
)
from catalogo.fontes import (  # noqa: E402,F401
    DIPLOMA, PLANALTO, _carregar_fontes, _diplomas_por_rotulo, url_planalto,
)
from catalogo.validacoes import (  # noqa: E402,F401
    _hediondez, ids_aposentados, proximo_id, validar_condicionais,
    validar_elemento_e_tentativa, validar_hediondez, validar_ids, validar_moldura,
    validar_pena_por_remissao, validar_tipos_penais, validar_tudo, validar_vigencia,
    validar_vocabulario,
)
from catalogo.pena import (  # noqa: E402,F401
    ABBR, RANGE_1U, RANGE_2U, UNIDADE_EM_MESES, _ABBR_U, _NOMES_UNIDADE,
    _faixa_de_meses, _meses, _norm_unidade, _ponta, _rotulo, _rotulo_de_meses,
    derivar_pena, detect_multa, parse_pena_range,
)
from catalogo.duplicatas import (  # noqa: E402,F401
    _VAZIAS, _radical, _termos, chave_dispositivo, classificar_contradicao,
    marcar_duplicatas, mesma_conduta,
)
from catalogo.derivacoes import (  # noqa: E402,F401
    _ART_28, _casa, _dc, _ehTituloXII, carregar_avisos, carregar_historico,
    carregar_trilha, derivar_avisos, derivar_hediondez, derivar_ultima_alteracao,
    enriquecer, menor_potencial,
)
from catalogo.relatorio import imprimir_resumo, montar_relatorio  # noqa: E402


def main():
    crimes = json.loads(SRC.read_text(encoding="utf-8"))
    trilha = carregar_trilha()

    # Invariantes estruturais: falham sempre, independentemente de --estrito.
    tabela_hediondez = _hediondez.carregar()
    avisos = carregar_avisos()
    historico = carregar_historico()
    rotulos_fonte = _dc.rotulos_para_fonte()
    problemas = validar_tudo(crimes, tabela_hediondez)
    if problemas:
        for p in problemas:
            print(f"ERRO: {p}", file=sys.stderr)
        return 1

    review_rows = enriquecer(
        crimes, trilha=trilha, tabela_hediondez=tabela_hediondez, avisos=avisos,
        historico=historico, rotulos_fonte=rotulos_fonte,
    )
    por_chave, contraditorios = marcar_duplicatas(crimes)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(crimes, ensure_ascii=False, indent=1), encoding="utf-8")

    relatorio = montar_relatorio(crimes, por_chave, contraditorios, review_rows)
    RELATORIO.write_text(json.dumps(relatorio, ensure_ascii=False, indent=1), encoding="utf-8")

    imprimir_resumo(crimes, relatorio, review_rows)

    # --estrito: usado pela CI para impedir a INTRODUÇÃO de novas contradições.
    if "--estrito" in sys.argv:
        limite = int(next((a.split("=")[1] for a in sys.argv if a.startswith("--max-contradicoes=")), 0))
        if len(contraditorios) > limite:
            print(
                f"\nERRO: {len(contraditorios)} duplicatas divergentes (limite: {limite}).",
                file=sys.stderr,
            )
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
