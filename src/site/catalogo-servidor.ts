// O catálogo de tipos penais em tempo de build — só para páginas estáticas.
//
// Lê o DERIVADO (static/data/crimes.json), e não a fonte: os campos que as
// telas usam (pena em meses canônicos, rótulos, pena_privativa, vigente…) só
// existem depois de scripts/transform_data.py. É o mesmo arquivo que o
// navegador baixa, então página estática e ilha veem o mesmo dado.
//
// NÃO importe numa ilha React: são 2 MB.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Crime} from '../lib/types';

let cache: Crime[] | null = null;

/** Todos os registros do catálogo, na ordem do arquivo. */
export function todosOsTipos(): Crime[] {
  if (!cache) {
    cache = JSON.parse(
      readFileSync(join(process.cwd(), 'static', 'data', 'crimes.json'), 'utf-8'),
    ) as Crime[];
  }
  return cache;
}

let indice: Map<number, Crime> | null = null;

export function tipoPorId(id: number): Crime | undefined {
  if (!indice) indice = new Map(todosOsTipos().map((c) => [c.id, c]));
  return indice.get(id);
}
