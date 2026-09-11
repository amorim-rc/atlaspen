// Modelo declarativo do catálogo de atributos penais — SISPENAS.
//
// Cada atributo é um REGISTRO de dados (nome, fundamento, requisitos, vedações e
// PARÂMETROS editáveis) acompanhado de uma função pura de avaliação que lê esses
// parâmetros em vez de constantes embutidas. Isso permite:
//
//   1. editar qualquer parâmetro do atributo em tempo de execução (tela "Busca por
//      atributo") e observar o efeito sobre o catálogo de tipos penais;
//   2. no futuro, mover o catálogo para JSON e atualizá-lo como `data/crimes.json`,
//      sem tocar no código do motor (ver backlog.md, frente 1).
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias doutrinárias
// e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';

export type Status = 'cabivel' | 'incabivel' | 'condicional';
export type Categoria = 'processual' | 'aplicacao' | 'execucao';

/**
 * De qual pena o atributo depende. Determina como a "Busca por atributo"
 * monta o cenário de cada tipo penal:
 *  - `abstrato`: lê a pena cominada no tipo (mín./máx.) — avaliação exata;
 *  - `concreto`: depende da pena fixada na sentença, que NÃO é campo do tipo
 *    penal; a busca reversa adota uma pena concreta presumida (ver `reverso.ts`);
 *  - `incondicionado`: não depende de patamar de pena (ex.: detração, remição).
 */
export type Natureza = 'abstrato' | 'concreto' | 'incondicionado';

export type ParamTipo = 'meses' | 'fracao' | 'booleano' | 'inteiro';

/** Um parâmetro editável do atributo (patamar legal, fração, vedação). */
export interface ParametroDef {
  id: string;
  rotulo: string;
  tipo: ParamTipo;
  padrao: number | boolean;
  /** Limites do controle na interface (apenas para tipos numéricos). */
  min?: number;
  max?: number;
  passo?: number;
  /** Explicação jurídica do que o parâmetro representa. */
  ajuda: string;
  /** Dispositivo legal de onde o valor padrão foi extraído. */
  fundamento?: string;
}

/** Valores correntes dos parâmetros de um atributo, por `ParametroDef.id`. */
export type Parametros = Record<string, number | boolean>;

export interface Limiar {
  descricao: string;
  /** Valor de referência do cenário (meses). */
  referenciaMeses: number;
  /** Limiar legal (meses). */
  limiarMeses: number;
  /** Distância até perder/ganhar o atributo (meses); negativo = fora por X. */
  folgaMeses: number;
}

/** Resultado da função pura de avaliação de um atributo. */
export interface Avaliacao {
  status: Status;
  resumo: string;
  detalhes: string[];
  limiar?: Limiar;
}

/** Registro completo de um atributo penal. */
export interface AtributoDef {
  id: string;
  nome: string;
  fundamento: string;
  categoria: Categoria;
  natureza: Natureza;
  /** Síntese do instituto, exibida no cabeçalho da tela do atributo. */
  descricao: string;
  /** Requisitos legais cumulativos. */
  requisitos: string[];
  /** Hipóteses de vedação legal ou sumular. */
  vedacoes: string[];
  parametros: ParametroDef[];
  avaliar: (c: Cenario, p: Parametros) => Avaliacao;
}

/** Atributo avaliado: metadados do registro + resultado da avaliação. */
export interface AtributoResultado extends Avaliacao {
  id: string;
  nome: string;
  fundamento: string;
  categoria: Categoria;
  natureza: Natureza;
}

// ── Acessores tipados de parâmetros ──────────────────────────────────────
// As funções de avaliação recebem `Parametros` (união número|booleano). Estes
// helpers evitam repetir o cast em cada leitura.

export const num = (p: Parametros, k: string): number => p[k] as number;
export const bool = (p: Parametros, k: string): boolean => p[k] as boolean;

/** Valores padrão de um atributo, prontos para edição na interface. */
export function valoresPadrao(def: AtributoDef): Parametros {
  const out: Parametros = {};
  for (const p of def.parametros) out[p.id] = p.padrao;
  return out;
}

/** True se algum parâmetro divergir do padrão legal do registro. */
export function foiEditado(def: AtributoDef, p: Parametros): boolean {
  return def.parametros.some((d) => p[d.id] !== d.padrao);
}
