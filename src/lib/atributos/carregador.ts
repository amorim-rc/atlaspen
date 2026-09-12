// Carregador do catálogo de atributos penais — SISPENAS.
//
// Monta os `AtributoDef` que o motor usa a partir da base (data/atributos.json)
// e das funções de avaliação (avaliadores.ts). A ordem é a da base, e é ela a
// ordem de exibição dentro de cada categoria. Para acrescentar um atributo:
// registro novo na base, com o próximo id, e a função dele em avaliadores.ts.
//
// Lê a FONTE, e não o derivado de static/data: o derivado (última alteração e
// alcance) é produzido por este mesmo motor, e ler um do outro faria círculo.

import fonte from '../../../data/atributos.json';
import type {AtributoDef, Categoria, Natureza, ParametroDef, ParamTipo} from './types';
import {AVALIADORES} from './avaliadores';

interface ParametroFonte {
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

interface AtributoFonte {
  id: number;
  slug: string;
  nome: string;
  fundamento: string;
  categoria: Categoria;
  natureza: Natureza;
  descricao: string;
  requisitos: string[];
  vedacoes: string[];
  parametros: ParametroFonte[];
}

const ATRIBUTOS = (fonte as unknown as {atributos: AtributoFonte[]}).atributos;

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

export const CATALOGO: AtributoDef[] = ATRIBUTOS.map((a) => {
  const avaliar = AVALIADORES[a.slug];
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
    parametros: a.parametros.map(parametro),
    avaliar,
  };
});

export const POR_ID: Record<string, AtributoDef> = Object.fromEntries(
  CATALOGO.map((b) => [b.id, b]),
);
