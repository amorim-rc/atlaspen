// Motor de cálculo de atributos penais — SISPENAS.
//
// API pública do módulo. `calcularAtributos(cenario)` mantém a assinatura usada
// pela "Busca por tipo penal"; o segundo argumento (opcional) permite avaliar o
// catálogo com parâmetros editados, base da "Busca por atributo".
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';
import type {AtributoDef, AtributoResultado, Categoria, Parametros} from './types';
import {valoresPadrao} from './types';
import {CATALOGO, POR_ID} from './catalogo';

export type {
  Avaliacao,
  AtributoDef,
  AtributoResultado,
  Categoria,
  Limiar,
  Natureza,
  ParametroDef,
  ParamTipo,
  Parametros,
  Status,
} from './types';
export {foiEditado, valoresPadrao} from './types';
export {CATALOGO, POR_ID} from './catalogo';

/** Avalia um único atributo, com parâmetros próprios ou padrão. */
export function avaliarAtributo(
  def: AtributoDef,
  c: Cenario,
  params?: Parametros,
): AtributoResultado {
  const p = params ?? valoresPadrao(def);
  return {
    id: def.id,
    nome: def.nome,
    fundamento: def.fundamento,
    categoria: def.categoria,
    natureza: def.natureza,
    ...def.avaliar(c, p),
  };
}

/**
 * Avalia o catálogo inteiro para um cenário.
 *
 * @param overrides parâmetros editados, por id de atributo. Atributos ausentes
 *   do mapa são avaliados com os valores legais padrão.
 */
export function calcularAtributos(
  c: Cenario,
  overrides?: Record<string, Parametros>,
): AtributoResultado[] {
  return CATALOGO.map((def) => avaliarAtributo(def, c, overrides?.[def.id]));
}

export function getAtributo(id: string): AtributoDef | undefined {
  return POR_ID[id];
}

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  processual: 'Atributos processuais (pena em abstrato)',
  aplicacao: 'Aplicação da pena (pena concreta)',
  execucao: 'Execução penal',
};

/** Rótulo curto, para chips e listagens. */
export const CATEGORIA_CURTA: Record<Categoria, string> = {
  processual: 'Processual',
  aplicacao: 'Aplicação',
  execucao: 'Execução',
};

export const NATUREZA_LABEL: Record<string, string> = {
  abstrato: 'Pena em abstrato',
  concreto: 'Pena concreta',
  incondicionado: 'Independe da pena',
};
