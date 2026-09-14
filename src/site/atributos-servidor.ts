// O derivado dos atributos penais em tempo de build (static/data/atributos.json,
// produzido por scripts/derivar_atributos.ts): a última alteração legislativa de
// cada atributo e de cada parâmetro, e quantas houve. `null` é "não se sabe"
// (parâmetro sem dispositivo, ou redação que o compilado não data); zero é o
// texto original. Lido pelo sistema de arquivos: é arquivo público, e o Vite não
// deixa importar de lá.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';

export interface Alteracao {
  norma: string | null;
  ano: number | null;
  evento: string;
  dispositivo: string;
  url: string | null;
  vigencia?: string;
}

export interface AtributoDerivado {
  slug: string;
  ultima_alteracao: Alteracao | null;
  alteracoes_legislativas: number | null;
  parametros: {id: string; ultima_alteracao: Alteracao | null; alteracoes_legislativas: number | null}[];
  alcance: {cabivel: number[]; condicional: number[]};
}

let cache: Map<string, AtributoDerivado> | null = null;

export function derivadoDe(slug: string): AtributoDerivado | undefined {
  if (!cache) {
    const bruto = JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', 'atributos.json'), 'utf-8')) as {
      atributos: AtributoDerivado[];
    };
    cache = new Map(bruto.atributos.map((a) => [a.slug, a]));
  }
  return cache.get(slug);
}
