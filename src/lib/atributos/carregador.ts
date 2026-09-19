// Montagem do catálogo de atributos penais — função pura.
//
// Recebe a base (o conteúdo de data/atributos.json, ou uma cópia editada dela)
// e as funções de avaliação (avaliadores.ts), e devolve os `AtributoDef` que o
// motor usa. A ordem é a da base, e é ela a ordem de exibição dentro de cada
// categoria. Para acrescentar um atributo: registro novo na base, com o próximo
// id, e a função dele em avaliadores.ts.
//
// Este módulo não importa dado nenhum. Quem liga o catálogo real é catalogo.ts;
// a simulação legislativa monta o seu a partir de uma cópia em memória, e os
// testes, de uma base fictícia.

import type {AtributoDef, Avaliacao, Categoria, Natureza, ParametroDef, ParamTipo, Parametros} from './types';
import type {Cenario} from '../types';
import {AVALIADORES} from './avaliadores';

export interface ParametroFonte {
  id: string;
  rotulo: string;
  tipo: ParamTipo;
  padrao: number | boolean;
  min?: number;
  max?: number;
  passo?: number;
  ajuda: string;
  redacoes?: {fundamento: string}[];
}

export interface AtributoFonte {
  id: number;
  slug: string;
  nome: string;
  fundamento: string;
  categoria: Categoria;
  natureza: Natureza;
  descricao: string;
  requisitos: string[];
  vedacoes: string[];
  alcanca_sem_pena_privativa: boolean;
  fundamento_sem_pena_privativa?: string;
  parametros: ParametroFonte[];
}

/** A forma de data/atributos.json que o motor lê. */
export interface BaseAtributos {
  atributos: AtributoFonte[];
}

export type Avaliador = (c: Cenario, p: Parametros) => Avaliacao;

function parametro(p: ParametroFonte): ParametroDef {
  // As redações vêm em ordem cronológica (o validador exige): a vigente é a
  // última, e é o fundamento dela que a tela mostra.
  const vigente = p.redacoes?.[p.redacoes.length - 1];
  return {
    id: p.id,
    rotulo: p.rotulo,
    tipo: p.tipo,
    padrao: p.padrao,
    ...(p.min !== undefined ? {min: p.min} : {}),
    ...(p.max !== undefined ? {max: p.max} : {}),
    ...(p.passo !== undefined ? {passo: p.passo} : {}),
    ajuda: p.ajuda,
    ...(vigente ? {fundamento: vigente.fundamento} : {}),
  };
}

/**
 * Monta os `AtributoDef` a partir de uma base. Atributo sem função de avaliação
 * é erro, e não silêncio: um atributo que o motor não sabe avaliar sairia da
 * tela sem que ninguém notasse.
 */
export function montarCatalogo(
  base: BaseAtributos,
  avaliadores: Record<string, Avaliador> = AVALIADORES,
): AtributoDef[] {
  return base.atributos.map((a) => {
    const avaliar = avaliadores[a.slug];
    if (!avaliar) throw new Error(`Atributo ${a.id} (${a.slug}) sem função de avaliação`);
    return {
      id: a.slug,
      nome: a.nome,
      fundamento: a.fundamento,
      categoria: a.categoria,
      natureza: a.natureza,
      descricao: a.descricao,
      requisitos: a.requisitos,
      vedacoes: a.vedacoes,
      alcancaSemPenaPrivativa: a.alcanca_sem_pena_privativa,
      ...(a.fundamento_sem_pena_privativa ? {fundamentoSemPenaPrivativa: a.fundamento_sem_pena_privativa} : {}),
      parametros: a.parametros.map(parametro),
      avaliar,
    };
  });
}

/** Índice por id (o `slug` da base). */
export function indexarCatalogo(catalogo: readonly AtributoDef[]): Record<string, AtributoDef> {
  return Object.fromEntries(catalogo.map((b) => [b.id, b]));
}
