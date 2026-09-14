// O pacote da simulação na URL. O link é a hipótese: quem o recebe abre a mesma
// simulação e refaz a conta, em vez de acreditar nela.
//
//   /simulacao?m=am;anpp;limiteMinMeses=6a
//   /simulacao?m=tm;1122;max=8a&m=tn;n=Fraude+eletrônica;min=2a;max=6a&i=1
//
// Uma mudança por `m`, na ordem do pacote; `i` é a que está em edição. Cada
// mudança começa pelo tipo (t|a + n|m|x: novo, modificado, extinto) e segue em
// campos `chave=valor` separados por ponto e vírgula. Só se grava o que difere
// do padrão. Pena em duração compacta (1a, 18m, 2a6m15d); parâmetro de atributo
// no formato da ficha do atributo.

import type {AtributoDef} from '../../lib/atributos';
import type {
  CamposTipo,
  Comparacao,
  DefinicaoAtributo,
  Incidencia,
  Mudanca,
  Operacao,
  RequisitoReu,
  Sentido,
  VedacaoNova,
} from '../../lib/simulacao/tipos';
import {CAMPOS_TIPO_PADRAO, DEFINICAO_PADRAO} from '../../lib/simulacao/motor';
import {escreverDuracao, escreverValor, lerDuracao, lerValor, limitar} from '../atributo/estado';

export function mudancaPadrao(sentido: Sentido, op: Operacao): Mudanca {
  if (sentido === 'tipo') {
    if (op === 'criar') return {sentido, op, campos: {...CAMPOS_TIPO_PADRAO}};
    if (op === 'modificar') return {sentido, op, id: null, campos: {}};
    return {sentido, op, id: null};
  }
  if (op === 'criar') return {sentido, op, def: {...DEFINICAO_PADRAO, vedacoes: [], requisitos: []}};
  if (op === 'modificar') return {sentido, op, atributo: null, params: {}};
  return {sentido, op, atributo: null};
}

// Texto livre (nome, lei, artigo) não pode carregar o separador.
const esc = (t: string) => t.replace(/%/g, '%25').replace(/;/g, '%3B').replace(/=/g, '%3D');
const des = (t: string) => t.replace(/%3D/gi, '=').replace(/%3B/gi, ';').replace(/%25/g, '%');

const CHAVE_BOOL: [keyof CamposTipo, string][] = [
  ['hediondo', 'h'],
  ['violencia', 'v'],
  ['graveAmeaca', 'g'],
  ['culposo', 'c'],
  ['contravencao', 'k'],
];
const VEDACOES: [VedacaoNova, string][] = [
  ['violencia', 'v'],
  ['graveAmeaca', 'g'],
  ['hediondo', 'h'],
  ['resultadoMorte', 'm'],
  ['culposo', 'c'],
  ['contravencao', 'k'],
];
const REQUISITOS: [RequisitoReu, string][] = [
  ['primario', 'p'],
  ['confissao', 'c'],
  ['reparacao', 'r'],
];
const INCIDENCIAS: [Incidencia, string][] = [
  ['cominada_minima', 'min'],
  ['cominada_maxima', 'max'],
  ['aplicada', 'apl'],
];

function camposTipo(c: Partial<CamposTipo>, completos: boolean): string[] {
  const out: string[] = [];
  if (c.nome !== undefined && (completos || c.nome)) out.push(`n=${esc(c.nome)}`);
  if (c.lei !== undefined) out.push(`l=${esc(c.lei)}`);
  if (c.artigo !== undefined) out.push(`a=${esc(c.artigo)}`);
  if (c.penaMinDias !== undefined) out.push(`min=${escreverDuracao(c.penaMinDias)}`);
  if (c.penaMaxDias !== undefined) out.push(`max=${escreverDuracao(c.penaMaxDias)}`);
  for (const [k, s] of CHAVE_BOOL) {
    const v = c[k];
    // No tipo novo só se grava o que está marcado; no modificado, também o que foi desmarcado.
    if (v === true || (v === false && !completos)) out.push(`${s}=${v ? 1 : 0}`);
  }
  return out;
}

export function escreverMudanca(m: Mudanca, porId: Record<string, AtributoDef>): string {
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') return ['tn', ...camposTipo(m.campos, true)].join(';');
    if (m.op === 'modificar') return [`tm`, String(m.id ?? ''), ...camposTipo(m.campos, false)].join(';');
    return `tx;${m.id ?? ''}`;
  }
  if (m.op === 'criar') {
    const d = m.def;
    const out = ['an', `n=${esc(d.nome)}`];
    out.push(`inc=${INCIDENCIAS.find(([k]) => k === d.incidencia)![1]}`);
    if (d.comparacao !== 'ate') out.push(`cmp=${d.comparacao}`);
    out.push(`lim=${escreverDuracao(d.limiarDias)}`);
    if (d.vedacoes.length) out.push(`ved=${VEDACOES.filter(([k]) => d.vedacoes.includes(k)).map(([, s]) => s).join('.')}`);
    if (d.requisitos.length) out.push(`req=${REQUISITOS.filter(([k]) => d.requisitos.includes(k)).map(([, s]) => s).join('.')}`);
    return out.join(';');
  }
  if (m.op === 'modificar') {
    const def = m.atributo ? porId[m.atributo] : undefined;
    const params = def
      ? def.parametros.filter((p) => m.params[p.id] !== undefined).map((p) => `${p.id}=${esc(escreverValor(p, m.params[p.id]))}`)
      : [];
    return ['am', m.atributo ?? '', ...params].join(';');
  }
  return `ax;${m.atributo ?? ''}`;
}

function kv(partes: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const p of partes) {
    const i = p.indexOf('=');
    if (i > 0) out.set(p.slice(0, i), des(p.slice(i + 1)));
  }
  return out;
}

function lerCamposTipo(c: Map<string, string>): Partial<CamposTipo> {
  const out: Partial<CamposTipo> = {};
  if (c.has('n')) out.nome = c.get('n')!;
  if (c.has('l')) out.lei = c.get('l')!;
  if (c.has('a')) out.artigo = c.get('a')!;
  const min = c.has('min') ? lerDuracao(c.get('min')!) : null;
  if (min !== null) out.penaMinDias = min;
  const max = c.has('max') ? lerDuracao(c.get('max')!) : null;
  if (max !== null) out.penaMaxDias = max;
  for (const [k, s] of CHAVE_BOOL) if (c.has(s)) (out as Record<string, unknown>)[k] = c.get(s) === '1';
  return out;
}

const idDeTipo = (t: string | undefined) => {
  const n = Number(t);
  return t && Number.isInteger(n) && n > 0 ? n : null;
};

export function lerMudanca(texto: string, porId: Record<string, AtributoDef>): Mudanca | null {
  const [cabeca, ...resto] = texto.split(';');
  switch (cabeca) {
    case 'tn': {
      const c = lerCamposTipo(kv(resto));
      const campos: CamposTipo = {...CAMPOS_TIPO_PADRAO, ...c};
      for (const [k] of CHAVE_BOOL) if (c[k] === undefined) (campos as unknown as Record<string, boolean>)[k] = false;
      return {sentido: 'tipo', op: 'criar', campos};
    }
    case 'tm':
      return {sentido: 'tipo', op: 'modificar', id: idDeTipo(resto[0]), campos: lerCamposTipo(kv(resto.slice(1)))};
    case 'tx':
      return {sentido: 'tipo', op: 'extinguir', id: idDeTipo(resto[0])};
    case 'an': {
      const c = kv(resto);
      const inc = INCIDENCIAS.find(([, s]) => s === c.get('inc'))?.[0] ?? DEFINICAO_PADRAO.incidencia;
      const lim = c.has('lim') ? lerDuracao(c.get('lim')!) : null;
      const def: DefinicaoAtributo = {
        nome: c.get('n') ?? '',
        incidencia: inc,
        comparacao: (c.get('cmp') === 'acima' ? 'acima' : 'ate') as Comparacao,
        limiarDias: lim ?? DEFINICAO_PADRAO.limiarDias,
        vedacoes: VEDACOES.filter(([, s]) => (c.get('ved') ?? '').split('.').includes(s)).map(([k]) => k),
        requisitos: REQUISITOS.filter(([, s]) => (c.get('req') ?? '').split('.').includes(s)).map(([k]) => k),
      };
      return {sentido: 'atributo', op: 'criar', def};
    }
    case 'am': {
      const def = resto[0] ? porId[resto[0]] : undefined;
      const params: Record<string, number | boolean> = {};
      if (def) {
        const c = kv(resto.slice(1));
        for (const p of def.parametros) {
          const t = c.get(p.id);
          if (t === undefined) continue;
          const v = lerValor(p, t);
          if (v !== undefined && v !== p.padrao) params[p.id] = limitar(p, v);
        }
      }
      return {sentido: 'atributo', op: 'modificar', atributo: def ? def.id : null, params};
    }
    case 'ax': {
      const def = resto[0] ? porId[resto[0]] : undefined;
      return {sentido: 'atributo', op: 'extinguir', atributo: def ? def.id : null};
    }
  }
  return null;
}

export function escreverPacote(pacote: Mudanca[], ativo: number, porId: Record<string, AtributoDef>): string {
  const q = new URLSearchParams();
  for (const m of pacote) q.append('m', escreverMudanca(m, porId));
  if (ativo > 0) q.set('i', String(ativo));
  const s = q
    .toString()
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=')
    .replace(/%2F/gi, '/');
  return s ? `?${s}` : '';
}

export function lerPacote(search: string, porId: Record<string, AtributoDef>): {pacote: Mudanca[]; ativo: number} {
  const q = new URLSearchParams(search);
  const pacote = q
    .getAll('m')
    .map((t) => lerMudanca(t, porId))
    .filter((m): m is Mudanca => m !== null);
  const i = Number(q.get('i'));
  return {pacote, ativo: Number.isInteger(i) && i >= 0 && i < pacote.length ? i : 0};
}
