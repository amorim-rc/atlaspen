// Motor de cálculo de atributos penais — API pública.
//
// O motor em si (nucleo.ts) recebe o catálogo por parâmetro. Este módulo é a
// ligação com o catálogo real (catalogo.ts): mantém as assinaturas que as telas
// e os scripts de verificação já usam, e por isso `calcularAtributos(cenario)`
// continua avaliando a lei vigente quando ninguém passa outro catálogo.
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';
import type {AtributoDef, AtributoResultado, Categoria, Parametros} from './types';
import {CATALOGO, POR_ID} from './catalogo';
import {calcularAtributos as calcularSobre} from './nucleo';

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
export {avaliarAtributo} from './nucleo';
export {indexarCatalogo, montarCatalogo} from './carregador';
export type {AtributoFonte, BaseAtributos, ParametroFonte} from './carregador';
export {CATALOGO, POR_ID};

/**
 * Avalia o catálogo para um cenário: o vigente, ou o que for passado.
 *
 * @param overrides parâmetros editados, por id de atributo. Atributos ausentes
 *   do mapa são avaliados com os valores legais padrão.
 */
export function calcularAtributos(
  c: Cenario,
  overrides?: Record<string, Parametros>,
  catalogo: readonly AtributoDef[] = CATALOGO,
): AtributoResultado[] {
  return calcularSobre(catalogo, c, overrides);
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
