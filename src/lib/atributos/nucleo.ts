// O motor de atributos penais, sem catálogo embutido.
//
// Toda função daqui recebe o catálogo que avalia. É o que permite rodar o mesmo
// motor sobre o catálogo vigente, sobre uma cópia editada em memória (simulação
// legislativa) ou sobre um catálogo fictício (scripts/verificar_injecao.ts).
// Nada aqui importa dado.
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';
import type {AtributoDef, AtributoResultado, Parametros} from './types';
import {valoresPadrao} from './types';

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
 * Avalia um catálogo inteiro para um cenário.
 *
 * @param overrides parâmetros editados, por id de atributo. Atributos ausentes
 *   do mapa são avaliados com os valores legais padrão.
 */
export function calcularAtributos(
  catalogo: readonly AtributoDef[],
  c: Cenario,
  overrides?: Record<string, Parametros>,
): AtributoResultado[] {
  return catalogo.map((def) => avaliarAtributo(def, c, overrides?.[def.id]));
}
