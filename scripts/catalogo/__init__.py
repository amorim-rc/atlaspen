# -*- coding: utf-8 -*-
"""O construtor do catálogo, repartido por responsabilidade.

Até 25/09/2026 tudo isto vivia num só `scripts/transform_data.py`, que passou de
mil linhas e virou o débito técnico 6 do README. A divisão é por *o que cada
parte responde*, e não por tamanho:

- `caminhos`    — onde ficam fonte, derivado e os arquivos auxiliares;
- `tabelas`     — as tabelas CURADAS (`CORRECOES`, `CORRECOES_MORTE`,
                  `PERDAO_JUDICIAL`, `VOCABULARIO`…): juízo humano datado, que
                  a heurística não sobrepõe;
- `fontes`      — o texto compilado de cada diploma (`data/fontes.json`);
- `validacoes`  — os invariantes DUROS que falham o build (`validar_*`);
- `pena`        — a moldura em meses vira rótulo, e o `obs` vira regime de multa;
- `derivacoes`  — os demais campos derivados, e o laço que enriquece cada
                  registro;
- `duplicatas`  — registros repetidos e a contradição entre eles;
- `relatorio`   — o relatório de qualidade (`static/data/qualidade.json`).

`scripts/transform_data.py` continua sendo a linha de comando e reexporta TODOS
os nomes que os robôs e os testes sempre importaram dele — ninguém precisa saber
que a casa foi dividida em cômodos. Nenhuma regra mudou na mudança: o derivado
tem de sair byte a byte igual ao de antes, e é assim que a divisão se confere.
"""
