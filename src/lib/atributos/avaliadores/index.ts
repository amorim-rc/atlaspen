// Funções de avaliação dos atributos penais — AtlasPen.
//
// O atributo é dado (data/atributos.json: nome, fundamento, requisitos,
// vedações, parâmetros e as redações de cada um); aqui fica só o cálculo, uma
// função pura por atributo, que lê os parâmetros em vez de constantes. A chave é
// o `slug` da base. `scripts/verificar_atributos.ts` reprova atributo sem
// avaliador, avaliador sem atributo e parâmetro lido que não exista nos dados.
//
// As funções saíram do antigo catálogo em código por recorte mecânico (frente 5
// do backlog), e o teste de equivalência provou que o cálculo não mudou.
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.
//
// Em 25/09/2026 o arquivo único (815 linhas) foi partido por categoria de
// atributo — processual.ts, aplicacao.ts, execucao.ts — com o que é comum em
// comum.ts. Só mudou o lugar: o congelamento (`npm run equivalencia`) confere que
// nenhum veredito se moveu. A ordem das chaves é a de sempre.

import type {Cenario} from '../../types';
import type {Avaliacao, Parametros} from '../types';
import {AVALIADORES_PROCESSUAL} from './processual';
import {AVALIADORES_APLICACAO} from './aplicacao';
import {AVALIADORES_EXECUCAO} from './execucao';

export {vedacaoLivramentoArt112} from './comum';

export const AVALIADORES: Record<string, (c: Cenario, p: Parametros) => Avaliacao> = {
  ...AVALIADORES_PROCESSUAL,
  ...AVALIADORES_APLICACAO,
  ...AVALIADORES_EXECUCAO,
};
