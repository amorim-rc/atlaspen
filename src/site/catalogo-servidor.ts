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

/** O artigo-base de um registro: "Art. 121, §2º, I" → "121"; "Art. 359-M" → "359-m". */
function artigoBase(artigo: string): string | null {
  const m = /art\.?\s*(\d+(?:-[A-Za-z])?)/i.exec(artigo || '');
  return m ? m[1].toLowerCase() : null;
}

const chaveFamilia = (c: Crime) => {
  const base = artigoBase(c.artigo);
  return base ? `${c.lei}|${base}` : null;
};

let familias: Map<string, Crime[]> | null = null;

/**
 * A família de um registro: os do mesmo artigo-base na mesma lei — o caput, os
 * parágrafos, as formas qualificadas e privilegiadas. É a mesma regra dos
 * "tipos correlatos" da busca antiga.
 */
export function familiaDe(crime: Crime): Crime[] {
  if (!familias) {
    familias = new Map();
    for (const c of todosOsTipos()) {
      const k = chaveFamilia(c);
      if (!k) continue;
      if (!familias.has(k)) familias.set(k, []);
      familias.get(k)!.push(c);
    }
  }
  const k = chaveFamilia(crime);
  return (k && familias.get(k)) || [crime];
}

const porArtigo = (a: Crime, b: Crime) => a.artigo.localeCompare(b.artigo, 'pt-BR', {numeric: true});

/** Os outros registros do mesmo artigo, em ordem de dispositivo. */
export function correlatosDe(crime: Crime): Crime[] {
  return familiaDe(crime)
    .filter((x) => x.id !== crime.id)
    .sort(porArtigo);
}

/**
 * Os patamares de pena que o artigo usa, em dias: os atalhos do campo de pena
 * (07-layout-movel.md). Derivados do registro e da família, e não de uma lista
 * global.
 */
export function patamaresDe(crime: Crime): number[] {
  const valores = new Set<number>();
  for (const c of familiaDe(crime)) {
    if (!c.tem_pena_privativa) continue;
    for (const m of [c.pena_min_meses, c.pena_max_meses]) if (m > 0) valores.add(Math.round(m * 30));
  }
  return [...valores].sort((a, b) => a - b).slice(0, 14);
}

/**
 * Os registros de onde a moldura vem, quando o tipo não comina a própria (art.
 * 304 do CP: "a pena cominada à falsificação"). Casam por PREFIXO do artigo:
 * "Art. 297" alcança o caput, o §3º e o §4º, cada um com sua pena.
 */
export function fontesRemissaoDe(crime: Crime): Crime[] {
  const r = crime.pena_por_remissao;
  if (!r) return [];
  return todosOsTipos()
    .filter((x) => x.id !== crime.id && x.lei === r.lei_fonte && r.artigos_fonte.some((a) => x.artigo.startsWith(a)))
    .sort(porArtigo);
}
