// O pacote da simulação na URL. O link é a hipótese: quem o recebe abre a mesma
// simulação e refaz a conta, em vez de acreditar nela.
//
//   /simulacao?m=am;anpp;limiteMinMeses=6a
//   /simulacao?m=tm;1122;max=8a&m=tn;n=Fraude+eletrônica;min=2a;max=6a&i=1
//   /simulacao?m=tn;n=Fraude;max=6a&m=tm;-1;max=8a
//
// Uma mudança por `m`, na ordem do pacote; `i` é a que está em edição. Cada
// mudança começa pelo tipo (t|a + n|m|x: novo, modificado, extinto) e segue em
// campos `chave=valor` separados por ponto e vírgula. Só se grava o que difere
// do padrão. Pena em duração compacta (1a, 18m, 2a6m15d); parâmetro de atributo
// no formato da ficha do atributo. O id NEGATIVO em `tm`/`tx` aponta para o
// tipo criado por outra mudança do mesmo pacote: `-1` é o da primeira, `-2` o
// da segunda — a posição no pacote, que a URL preserva porque a ordem dos `m` é
// a ordem do pacote (25/09/2026).
//
// O atributo novo que devolve valor (25/09/2026) grava `dev=f;fr=1/6` (fração)
// ou `dev=x;fx=1a:3a.2a:4a;fxa=8a` (faixas: até 1 ano → 3 anos, até 2 → 4,
// acima → 8). O veredito puro não grava nada, e o link antigo abre como abria.

import type {AtributoDef} from '../../lib/atributos';
import type {
  CamposTipo,
  Comparacao,
  DefinicaoAtributo,
  Devolucao,
  FaixaValor,
  Incidencia,
  Mudanca,
  Operacao,
  RequisitoReu,
  Sentido,
  VedacaoNova,
} from '../../lib/simulacao/tipos';
import {CAMPOS_TIPO_PADRAO, DEFINICAO_FRACAO_PADRAO, DEFINICAO_PADRAO} from '../../lib/simulacao/motor';
import {escreverValor, lerValor, limitar} from '../atributo/estado';
import {escreverDuracao, lerDuracao} from '../../lib/pena';
import {escreverPremissa, lerPremissa} from '../../lib/atributos/premissa-url';
import {cenarioReversoPadrao, type CenarioReverso} from '../../lib/atributos/reverso';

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
  ['contravencao', 'k'],
];
/**
 * O elemento subjetivo na URL, por inicial. Era a chave booleana `c`
 * (culposo/não) até 24/09/2026; com quatro valores, virou uma letra por valor.
 * O `c` antigo continua sendo lido, e vale "Culposo".
 */
const CHAVE_ELEMENTO: [CamposTipo['elemento'], string][] = [
  ['Doloso', 'd'],
  ['Culposo', 'c'],
  ['Preterdoloso', 'p'],
  ['Qualificado pelo resultado', 'q'],
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
const DEVOLUCOES: [Devolucao, string][] = [
  ['fracao', 'f'],
  ['faixas', 'x'],
];

/** A fração na URL como a lei a escreve ("1/6"); decimal quando não reduz a denominador pequeno. */
export function escreverFracao(f: number): string {
  for (let den = 1; den <= 24; den++) {
    const n = Math.round(f * den);
    if (n > 0 && Math.abs(f - n / den) < 1e-9) return `${n}/${den}`;
  }
  return String(Math.round(f * 10000) / 10000);
}

export function lerFracao(t: string): number | null {
  const m = /^(\d+)\/(\d+)$/.exec(t.trim());
  if (m) return Number(m[2]) > 0 ? Number(m[1]) / Number(m[2]) : null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** As faixas na URL: `1a:3a.2a:4a` — degrau:valor, separados por ponto. */
function escreverFaixas(faixas: FaixaValor[]): string {
  return faixas.map((f) => `${escreverDuracao(f.ateDias)}:${escreverDuracao(f.valorDias)}`).join('.');
}

function lerFaixas(t: string): FaixaValor[] {
  const out: FaixaValor[] = [];
  for (const parte of t.split('.')) {
    const [a, v] = parte.split(':');
    const ateDias = a !== undefined ? lerDuracao(a) : null;
    const valorDias = v !== undefined ? lerDuracao(v) : null;
    if (ateDias !== null && valorDias !== null) out.push({ateDias, valorDias});
  }
  return out;
}

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
  // O elemento só entra quando não é o padrão, para não encompridar a URL do
  // caso comum. No tipo MODIFICADO entra sempre que foi tocado, porque ali o
  // padrão não é "Doloso": é o que o tipo já era.
  if (c.elemento !== undefined && (!completos || c.elemento !== 'Doloso')) {
    const sigla = CHAVE_ELEMENTO.find(([e]) => e === c.elemento)?.[1];
    if (sigla) out.push(`e=${sigla}`);
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
    if (d.comparacao === 'entre') out.push(`lim2=${escreverDuracao(d.limiarSuperiorDias ?? 0)}`);
    if (d.vedacoes.length) out.push(`ved=${VEDACOES.filter(([k]) => d.vedacoes.includes(k)).map(([, s]) => s).join('.')}`);
    if (d.requisitos.length) out.push(`req=${REQUISITOS.filter(([k]) => d.requisitos.includes(k)).map(([, s]) => s).join('.')}`);
    const dev = DEVOLUCOES.find(([k]) => k === d.devolve);
    if (dev) {
      out.push(`dev=${dev[1]}`);
      if (d.devolve === 'fracao') out.push(`fr=${escreverFracao(d.fracao ?? 0)}`);
      else {
        out.push(`fx=${escreverFaixas(d.faixas ?? [])}`);
        out.push(`fxa=${escreverDuracao(d.acimaDias ?? 0)}`);
      }
    }
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
  if (c.has('e')) {
    const achado = CHAVE_ELEMENTO.find(([, s]) => s === c.get('e'));
    if (achado) out.elemento = achado[0];
  } else if (c.get('c') === '1') {
    // Link antigo, de antes de 24/09/2026: `c=1` era "culposo: sim".
    out.elemento = 'Culposo';
  }
  return out;
}

// O id do catálogo é positivo; o negativo é o do tipo criado no pacote. Zero não é ninguém.
const idDeTipo = (t: string | undefined) => {
  const n = Number(t);
  return t && Number.isInteger(n) && n !== 0 ? n : null;
};

export function lerMudanca(texto: string, porId: Record<string, AtributoDef>): Mudanca | null {
  const [cabeca, ...resto] = texto.split(';');
  switch (cabeca) {
    case 'tn': {
      const c = lerCamposTipo(kv(resto));
      const campos: CamposTipo = {...CAMPOS_TIPO_PADRAO, ...c};
      for (const [k] of CHAVE_BOOL) if (c[k] === undefined) (campos as unknown as Record<string, boolean>)[k] = false;
      if (c.elemento === undefined) campos.elemento = 'Doloso';
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
        comparacao: (['acima', 'entre'].includes(c.get('cmp') ?? '') ? c.get('cmp') : 'ate') as Comparacao,
        limiarDias: lim ?? DEFINICAO_PADRAO.limiarDias,
        limiarSuperiorDias: c.has('lim2') ? (lerDuracao(c.get('lim2')!) ?? undefined) : undefined,
        vedacoes: VEDACOES.filter(([, s]) => (c.get('ved') ?? '').split('.').includes(s)).map(([k]) => k),
        requisitos: REQUISITOS.filter(([, s]) => (c.get('req') ?? '').split('.').includes(s)).map(([k]) => k),
      };
      const dev = DEVOLUCOES.find(([, s]) => s === c.get('dev'))?.[0];
      if (dev === 'fracao') {
        def.devolve = 'fracao';
        def.fracao = lerFracao(c.get('fr') ?? '') ?? DEFINICAO_FRACAO_PADRAO;
      } else if (dev === 'faixas') {
        def.devolve = 'faixas';
        def.faixas = c.has('fx') ? lerFaixas(c.get('fx')!) : [];
        def.acimaDias = c.has('fxa') ? (lerDuracao(c.get('fxa')!) ?? 0) : 0;
      }
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

/**
 * O pacote na URL, com a premissa da varredura junto: o link é a hipótese, e a
 * hipótese inclui sob que réu e que pena ela foi medida. A premissa padrão não
 * se grava, e por isso um link antigo, sem premissa, abre como abria.
 */
export function escreverPacote(
  pacote: Mudanca[],
  ativo: number,
  porId: Record<string, AtributoDef>,
  rev: CenarioReverso = cenarioReversoPadrao(),
): string {
  const q = new URLSearchParams();
  for (const m of pacote) q.append('m', escreverMudanca(m, porId));
  if (ativo > 0) q.set('i', String(ativo));
  escreverPremissa(q, rev);
  // Os separadores internos são legais na query e ficam legíveis; `:` é o das faixas.
  const s = q
    .toString()
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=')
    .replace(/%2F/gi, '/')
    .replace(/%3A/gi, ':');
  return s ? `?${s}` : '';
}

export function lerPacote(
  search: string,
  porId: Record<string, AtributoDef>,
): {pacote: Mudanca[]; ativo: number; rev: CenarioReverso} {
  const q = new URLSearchParams(search);
  const pacote = q
    .getAll('m')
    .map((t) => lerMudanca(t, porId))
    .filter((m): m is Mudanca => m !== null);
  const i = Number(q.get('i'));
  return {pacote, ativo: Number.isInteger(i) && i >= 0 && i < pacote.length ? i : 0, rev: lerPremissa(q)};
}
