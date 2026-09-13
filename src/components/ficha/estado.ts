// O estado da ficha do tipo penal na URL (design_handoff_reestruturacao/03 e 07).
//
//   /tipos/1?modo=cominada&penaMin=1440&penaMax=9600&mod=tentativa:1/3
//   /tipos/1?modo=concreta&concreta=2880&reincidente=sim
//
// Penas em DIAS inteiros. Ausência de parâmetro = valor legal do tipo, e o
// padrão nunca é gravado: /tipos/1 limpo é a ficha em estado legal puro, e o
// link copiado É a hipótese. `em` (AAAA-MM-DD) é reservado ao eixo temporal:
// aceito e mantido na URL, ainda sem efeito.

import type {SelecaoModificador} from '../../lib/dosimetria/types';
import {limitarPena} from '../../lib/pena';

export type Modo = 'cominada' | 'concreta' | 'historico';

export interface EstadoFicha {
  modo: Modo;
  /** Moldura simulada, em dias; `null` = a legal. */
  penaMin: number | null;
  penaMax: number | null;
  /** Elementos marcados que deslocam a moldura. */
  mod: SelecaoModificador[];
  /** Pena aplicada, em dias; `null` = o padrão (a mínima cominada). */
  concreta: number | null;
  reincidente: boolean;
  comando: boolean;
  /** Fato anterior a 08/05/2026, vigência da Lei 15.402/2026. */
  anterior: boolean;
  /** A hipótese de hediondez do caso, quando o tipo a condiciona. */
  hediondo: boolean;
  /** Reservado: a data do fato. */
  em: string | null;
}

export const ESTADO_LEGAL: EstadoFicha = {
  modo: 'cominada',
  penaMin: null,
  penaMax: null,
  mod: [],
  concreta: null,
  reincidente: false,
  comando: false,
  anterior: false,
  hediondo: false,
  em: null,
};

/**
 * As frações da lei, exatas. Os modificadores guardam decimais aproximados
 * (0,333 para um terço; 0,1667 para um sexto), e 72 meses × 0,333 dá 719 dias
 * em vez de 720: a ficha passa ao motor sempre a fração canônica.
 */
export const FRACOES_CANONICAS: [number, number][] = [
  [1, 12], [1, 10], [1, 8], [1, 6], [1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [3, 4],
  [1, 1], [2, 1], [3, 1],
];

export function canonica(f: number): number {
  for (const [a, b] of FRACOES_CANONICAS) if (Math.abs(f - a / b) < 0.002) return a / b;
  return f;
}

export function rotuloFracao(f: number): string {
  for (const [a, b] of FRACOES_CANONICAS) {
    if (Math.abs(f - a / b) < 1e-9) return b === 1 ? (a === 1 ? 'o dobro' : a === 2 ? 'o triplo' : 'o quádruplo') : `${a}/${b}`;
  }
  return `${Math.round(f * 1000) / 10}%`;
}

/**
 * As frações oferecidas a um modificador: as canônicas entre a mínima e a
 * máxima dele. Zero não é oferecido — "aumento de até um terço" que não aumenta
 * nada não é hipótese.
 */
export function fracoesEntre(min: number | null, max: number | null): number[] {
  const a = canonica(min ?? 0);
  const b = canonica(max ?? min ?? 0);
  const lista = FRACOES_CANONICAS.map(([x, y]) => x / y).filter((f) => f >= a - 1e-9 && f <= b + 1e-9);
  return [...new Set([a, ...lista, b].map(canonica))].filter((f) => f > 0).sort((x, y) => x - y);
}

/**
 * A fração marcada por padrão: a mínima do modificador; nas faixas que começam
 * em zero ("até um terço", "até o dobro"), o limite superior, que é o único
 * número que a lei dá.
 */
export function fracaoPadrao(min: number | null, max: number | null): number | undefined {
  const opcoes = fracoesEntre(min, max);
  if (!opcoes.length) return undefined;
  return canonica(min ?? 0) > 0 ? opcoes[0] : opcoes[opcoes.length - 1];
}

function lerFracao(t: string): number | undefined {
  const m = /^(\d+)\/(\d+)$/.exec(t);
  if (m && Number(m[2]) > 0) return Number(m[1]) / Number(m[2]);
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function escreverFracao(f: number): string {
  for (const [a, b] of FRACOES_CANONICAS) if (Math.abs(f - a / b) < 1e-9) return `${a}/${b}`;
  return String(Math.round(f * 10000) / 10000);
}

function lerDias(v: string | null): number | null {
  if (v === null || v.trim() === '' || !/^\d+$/.test(v.trim())) return null;
  return limitarPena(Number(v));
}

const sim = (v: string | null) => v === 'sim' || v === '1' || v === 'true';

export function lerEstado(search: string, modos: Modo[]): EstadoFicha {
  const q = new URLSearchParams(search);
  const modo = q.get('modo') as Modo | null;
  const mod: SelecaoModificador[] = (q.get('mod') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const [id, fr] = t.split(':');
      const fracao = fr ? lerFracao(fr) : undefined;
      return fracao !== undefined ? {id, fracao} : {id};
    });
  const em = q.get('em');
  return {
    modo: modo && modos.includes(modo) ? modo : 'cominada',
    penaMin: lerDias(q.get('penaMin')),
    penaMax: lerDias(q.get('penaMax')),
    mod,
    concreta: lerDias(q.get('concreta')),
    reincidente: sim(q.get('reincidente')),
    comando: sim(q.get('comando')),
    anterior: sim(q.get('anterior')),
    hediondo: sim(q.get('hediondo')),
    em: em && /^\d{4}-\d{2}-\d{2}$/.test(em) ? em : null,
  };
}

/**
 * A query do estado, sem nada que seja padrão. `legal` são os valores legais
 * do tipo, para não gravar a moldura legal como se fosse simulação.
 */
export function escreverEstado(
  e: EstadoFicha,
  legal: {min: number; max: number; concreta: number},
): string {
  const q = new URLSearchParams();
  if (e.modo !== 'cominada') q.set('modo', e.modo);
  if (e.penaMin !== null && e.penaMin !== legal.min) q.set('penaMin', String(e.penaMin));
  if (e.penaMax !== null && e.penaMax !== legal.max) q.set('penaMax', String(e.penaMax));
  if (e.mod.length) {
    q.set('mod', e.mod.map((s) => (s.fracao !== undefined ? `${s.id}:${escreverFracao(s.fracao)}` : s.id)).join(','));
  }
  if (e.concreta !== null && e.concreta !== legal.concreta) q.set('concreta', String(e.concreta));
  if (e.reincidente) q.set('reincidente', 'sim');
  if (e.comando) q.set('comando', 'sim');
  if (e.anterior) q.set('anterior', 'sim');
  if (e.hediondo) q.set('hediondo', 'sim');
  if (e.em) q.set('em', e.em);
  // A vírgula e os dois-pontos da lista de modificadores ficam legíveis na URL.
  const s = q.toString().replace(/%2C/gi, ',').replace(/%3A/gi, ':').replace(/%2F/gi, '/');
  return s ? `?${s}` : '';
}
