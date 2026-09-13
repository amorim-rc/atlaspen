// O veredito de um atributo na ficha do tipo penal
// (design_handoff_atlaspen/09, item 1).
//
// Três estados, não dois: cabe, não cabe, e o valor calculado — prazo, fração,
// regime. O atributo que depende de circunstância do caso mostra "depende",
// com a hipótese ao lado. E a ordem das listas é obrigatória: cabíveis
// primeiro, condicionais depois, incabíveis por último.

import type {AtributoResultado, Natureza} from './types';

export type TipoVeredito = 'cabe' | 'valor' | 'depende' | 'nao-cabe';

export interface Veredito {
  tipo: TipoVeredito;
  rotulo: string;
}

export function veredito(r: AtributoResultado): Veredito {
  if (r.status === 'incabivel') return {tipo: 'nao-cabe', rotulo: 'não cabe'};
  if (r.status === 'condicional') return {tipo: 'depende', rotulo: 'depende'};
  return r.valor ? {tipo: 'valor', rotulo: r.valor} : {tipo: 'cabe', rotulo: 'cabe'};
}

const PESO: Record<TipoVeredito, number> = {cabe: 0, valor: 0, depende: 1, 'nao-cabe': 2};

/** Cabíveis, condicionais, incabíveis — estável dentro de cada grupo (a ordem do catálogo). */
export function ordenarPorVeredito<T extends AtributoResultado>(lista: T[]): T[] {
  return lista
    .map((r, i) => ({r, i}))
    .sort((a, b) => PESO[veredito(a.r).tipo] - PESO[veredito(b.r).tipo] || a.i - b.i)
    .map((x) => x.r);
}

/** Os atributos de uma natureza — a repartição entre as abas sai do campo, nunca de uma lista à mão. */
export function daNatureza<T extends {natureza: Natureza}>(lista: T[], natureza: Natureza): T[] {
  return lista.filter((r) => r.natureza === natureza);
}

/** Contagem por veredito, para o resumo anunciado aos leitores de tela. */
export function contarVereditos(lista: AtributoResultado[]): Record<'cabe' | 'depende' | 'naoCabe', number> {
  const out = {cabe: 0, depende: 0, naoCabe: 0};
  for (const r of lista) {
    const t = veredito(r).tipo;
    if (t === 'nao-cabe') out.naoCabe += 1;
    else if (t === 'depende') out.depende += 1;
    else out.cabe += 1;
  }
  return out;
}
