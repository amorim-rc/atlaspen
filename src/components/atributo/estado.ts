// O estado da ficha do atributo na URL (design_handoff_atlaspen/09, item 2;
// Atributos, acervo e eixo temporal.dc.html, 4a).
//
//   /atributos/sursis-processual?p.limiteMinMeses=2a
//   /atributos/progressao?base=maxima&reincidente=sim&p.fracaoPrimarioViolencia=1/5
//
// Todo parâmetro editável vai para a query com o id real da base, prefixado por
// `p.`; a premissa da varredura também. Quem cita um recorte cita o recorte, e
// não a tela: o link é reproduzível. O padrão nunca é gravado.

import type {AtributoDef, ParametroDef, Parametros, Status} from '../../lib/atributos';
import type {BasePenaConcreta, CenarioReverso} from '../../lib/atributos/reverso';
import {cenarioReversoPadrao} from '../../lib/atributos/reverso';
import {compor, decompor, diasDeMeses} from '../../lib/pena';

export type Situacao = Status | 'todos' | 'fora';

export interface EstadoAtributo {
  params: Parametros;
  rev: CenarioReverso;
  situacao: Situacao | null;
  q: string;
  pagina: number;
}

// ── duração compacta: 1a, 18m, 2a6m15d ────────────────────────────────────

export function lerDuracao(t: string): number | null {
  const m = /^(?:(\d+)a)?(?:(\d+)m)?(?:(\d+)d)?$/.exec(t.trim());
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return compor({anos: Number(m[1] ?? 0), meses: Number(m[2] ?? 0), dias: Number(m[3] ?? 0)});
}

export function escreverDuracao(dias: number): string {
  const p = decompor(dias);
  const s = `${p.anos ? `${p.anos}a` : ''}${p.meses ? `${p.meses}m` : ''}${p.dias ? `${p.dias}d` : ''}`;
  return s || '0d';
}

// ── valor de um parâmetro ─────────────────────────────────────────────────

/** Fração que a lei escreve em percentual (passo de 1%) ou em fração ordinária. */
export function emPercentual(d: ParametroDef): boolean {
  return d.tipo === 'fracao' && (d.passo ?? 0.01) >= 0.009 && (d.passo ?? 0.01) <= 0.011;
}

const FRACOES: [number, number][] = [
  [1, 12], [1, 8], [1, 6], [1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [3, 4], [5, 6], [1, 1],
];

export function rotuloFracao(v: number, percentual: boolean): string {
  if (!percentual) {
    for (const [a, b] of FRACOES) if (Math.abs(v - a / b) < 1e-9) return b === 1 ? 'integral' : `${a}/${b}`;
    // Frações de 24 avos que não reduzem a uma das comuns.
    const n = Math.round(v * 24);
    if (Math.abs(v - n / 24) < 1e-9) return `${n}/24`;
  }
  return `${(Math.round(v * 10000) / 100).toLocaleString('pt-BR')}%`;
}

export function rotuloValor(d: ParametroDef, v: number | boolean): string {
  switch (d.tipo) {
    case 'meses':
      return formatDiasDeMeses(v as number);
    case 'fracao':
      return rotuloFracao(v as number, emPercentual(d));
    case 'inteiro':
      return String(v);
    case 'booleano':
      return v ? 'sim' : 'não';
  }
}

function formatDiasDeMeses(meses: number): string {
  const dias = diasDeMeses(meses);
  const p = decompor(dias);
  const partes: string[] = [];
  if (p.anos) partes.push(`${p.anos} ${p.anos === 1 ? 'ano' : 'anos'}`);
  if (p.meses) partes.push(`${p.meses} ${p.meses === 1 ? 'mês' : 'meses'}`);
  if (p.dias) partes.push(`${p.dias} ${p.dias === 1 ? 'dia' : 'dias'}`);
  if (!partes.length) return 'zero';
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}`;
}

function lerValor(d: ParametroDef, t: string): number | boolean | undefined {
  switch (d.tipo) {
    case 'booleano':
      return t === 'sim' ? true : t === 'nao' ? false : undefined;
    case 'meses': {
      const dias = lerDuracao(t);
      return dias === null ? undefined : dias / 30;
    }
    case 'inteiro': {
      const n = Number(t);
      return Number.isInteger(n) ? n : undefined;
    }
    case 'fracao': {
      const m = /^(\d+)\/(\d+)$/.exec(t);
      const v = m ? Number(m[1]) / Number(m[2]) : Number(t.replace(',', '.').replace(/%$/, '')) / (t.endsWith('%') ? 100 : 1);
      return Number.isFinite(v) && v >= 0 ? v : undefined;
    }
  }
}

function escreverValor(d: ParametroDef, v: number | boolean): string {
  switch (d.tipo) {
    case 'booleano':
      return v ? 'sim' : 'nao';
    case 'meses':
      return escreverDuracao(diasDeMeses(v as number));
    case 'inteiro':
      return String(v);
    case 'fracao': {
      const n = v as number;
      for (const [a, b] of FRACOES) if (Math.abs(n - a / b) < 1e-9) return `${a}/${b}`;
      const k = Math.round(n * 24);
      if (Math.abs(n - k / 24) < 1e-9) return `${k}/24`;
      return `${Math.round(n * 10000) / 100}%`;
    }
  }
}

function limitar(d: ParametroDef, v: number | boolean): number | boolean {
  if (typeof v === 'boolean') return v;
  return Math.min(Math.max(v, d.min ?? 0), d.max ?? Number.POSITIVE_INFINITY);
}

// ── URL ───────────────────────────────────────────────────────────────────

const BASES: BasePenaConcreta[] = ['minima', 'maxima', 'fixa'];
const SITUACOES: Situacao[] = ['cabivel', 'condicional', 'incabivel', 'todos', 'fora'];

export function lerEstado(search: string, def: AtributoDef, padroes: Parametros): EstadoAtributo {
  const q = new URLSearchParams(search);
  const params: Parametros = {...padroes};
  for (const d of def.parametros) {
    const t = q.get(`p.${d.id}`);
    if (t === null) continue;
    const v = lerValor(d, t);
    if (v !== undefined) params[d.id] = limitar(d, v);
  }
  const rev = cenarioReversoPadrao();
  const base = q.get('base') as BasePenaConcreta | null;
  if (base && BASES.includes(base)) rev.base = base;
  const fixa = q.get('fixa');
  if (fixa) {
    const dias = lerDuracao(fixa);
    if (dias !== null) rev.penaFixaMeses = dias / 30;
  }
  rev.reincidenteEspecifico = q.get('reincidente') === 'sim';
  rev.comandoOrgcrimUltraviolenta = q.get('comando') === 'sim';
  rev.confessou = q.get('confessou') === 'sim';
  rev.reparouDano = q.get('reparou') === 'sim';
  rev.bonsAntecedentes = q.get('antecedentes') !== 'nao';
  const sit = q.get('situacao') as Situacao | null;
  const pagina = Number(q.get('pag'));
  return {
    params,
    rev,
    situacao: sit && SITUACOES.includes(sit) ? sit : null,
    q: q.get('q') ?? '',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

export function escreverEstado(e: EstadoAtributo, def: AtributoDef): string {
  const q = new URLSearchParams();
  for (const d of def.parametros) {
    const v = e.params[d.id];
    if (v !== undefined && v !== d.padrao) q.set(`p.${d.id}`, escreverValor(d, v));
  }
  const padrao = cenarioReversoPadrao();
  if (e.rev.base !== padrao.base) q.set('base', e.rev.base);
  if (e.rev.base === 'fixa' && e.rev.penaFixaMeses !== padrao.penaFixaMeses) {
    q.set('fixa', escreverDuracao(diasDeMeses(e.rev.penaFixaMeses)));
  }
  if (e.rev.reincidenteEspecifico) q.set('reincidente', 'sim');
  if (e.rev.comandoOrgcrimUltraviolenta) q.set('comando', 'sim');
  if (e.rev.confessou) q.set('confessou', 'sim');
  if (e.rev.reparouDano) q.set('reparou', 'sim');
  if (!e.rev.bonsAntecedentes) q.set('antecedentes', 'nao');
  if (e.situacao) q.set('situacao', e.situacao);
  if (e.q.trim()) q.set('q', e.q.trim());
  if (e.pagina > 1) q.set('pag', String(e.pagina));
  const s = q.toString().replace(/%2F/gi, '/').replace(/%25/g, '%');
  return s ? `?${s}` : '';
}

/**
 * As hipóteses rápidas de um parâmetro de pena (Atributo, bordas e
 * chrome.dc.html, 8a): o valor legal, a metade, o dobro e o teto do controle.
 * Derivadas do próprio parâmetro, nunca de uma lista global.
 */
export function hipoteses(d: ParametroDef): number[] {
  if (d.tipo !== 'meses') return [];
  const legal = d.padrao as number;
  const max = d.max ?? legal * 4;
  const passo = d.passo ?? 1;
  const arredonda = (m: number) => Math.round(m / passo) * passo;
  const lista = [legal, arredonda(legal / 2), arredonda(legal * 2), max].filter(
    (m) => m >= (d.min ?? 0) && m <= max,
  );
  return [...new Set(lista)];
}
