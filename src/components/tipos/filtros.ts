// A busca por tipo penal — a lógica, sem tela.
//
// Os filtros são os da busca antiga, com a mesma semântica (a modalidade de
// pena é OU entre as privativas e E com a multa), e passam a morar na URL:
// /tipos?lei=CP&hed=sim é endereço, e o estado vazio consegue dizer quantos
// tipos voltariam soltando cada filtro.

import type {Crime, PenaPrivativa, SimNao} from '../../lib/types';

/** Um registro na lista: só o que a busca e a tabela usam. */
export interface LinhaTipo {
  id: number;
  lei: string;
  artigo: string;
  crime: string;
  obs: string;
  min: number;
  max: number;
  minRotulo: string;
  maxRotulo: string;
  faixa: string;
  privativa: PenaPrivativa;
  multa: boolean;
  hediondo: SimNao;
  elemento: string;
  violencia: SimNao;
  ameaca: SimNao;
  acao: string;
  menorPotencial: boolean;
  vigente: boolean;
}

export function paraLinha(c: Crime): LinhaTipo {
  return {
    id: c.id,
    lei: c.lei,
    artigo: c.artigo,
    crime: c.crime,
    obs: c.obs ?? '',
    min: c.pena_min_meses,
    max: c.pena_max_meses,
    minRotulo: c.pena_min_rotulo,
    maxRotulo: c.pena_max_rotulo,
    faixa: c.pena_faixa_rotulo,
    privativa: c.pena_privativa,
    multa: c.tem_multa,
    hediondo: c.hediondo,
    elemento: c.elemento,
    violencia: c.violencia,
    ameaca: c.grave_ameaca,
    acao: c.acao,
    menorPotencial: c.infracao_menor_potencial,
    vigente: c.vigente !== false,
  };
}

export const MODALIDADES: {chave: string; rotulo: string; privativa?: PenaPrivativa}[] = [
  {chave: 'reclusao', rotulo: 'Reclusão', privativa: 'Reclusão'},
  {chave: 'detencao', rotulo: 'Detenção', privativa: 'Detenção'},
  {chave: 'prisao-simples', rotulo: 'Prisão simples', privativa: 'Prisão simples'},
  {chave: 'multa', rotulo: 'Multa'},
];

export type CampoOrdem = 'lei' | 'artigo' | 'crime' | 'min' | 'max';

export interface Filtros {
  q: string;
  lei: string;
  modalidades: string[];
  hediondo: '' | 'sim' | 'nao';
  elemento: '' | 'doloso' | 'culposo' | 'preterdoloso';
  violencia: '' | 'violencia' | 'grave-ameaca' | 'ambos' | 'nenhuma';
  acao: string;
  menorPotencial: boolean;
  ordem: CampoOrdem;
  decrescente: boolean;
  pagina: number;
}

export const FILTROS_VAZIOS: Filtros = {
  q: '',
  lei: '',
  modalidades: [],
  hediondo: '',
  elemento: '',
  violencia: '',
  acao: '',
  menorPotencial: false,
  ordem: 'lei',
  decrescente: false,
  pagina: 1,
};

export const POR_PAGINA = 40;

/** Minúsculas e sem acento: "homicidio" acha "Homicídio". */
export function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const ELEMENTO: Record<string, string> = {doloso: 'Doloso', culposo: 'Culposo', preterdoloso: 'Preterdoloso'};

export function passa(l: LinhaTipo, f: Filtros): boolean {
  if (f.q) {
    const q = normalizar(f.q.trim());
    const alvo = normalizar(`${l.crime} ${l.artigo} ${l.lei} ${l.obs}`);
    if (!q.split(/\s+/).every((p) => alvo.includes(p))) return false;
  }
  if (f.lei && l.lei !== f.lei) return false;
  if (f.modalidades.length) {
    const privativas = MODALIDADES.filter((m) => m.privativa && f.modalidades.includes(m.chave)).map((m) => m.privativa);
    // Privativas: OU entre as marcadas. Multa: E — exige multa quando marcada.
    if (privativas.length && !privativas.includes(l.privativa)) return false;
    if (f.modalidades.includes('multa') && !l.multa) return false;
  }
  if (f.hediondo === 'sim' && l.hediondo !== 'Sim') return false;
  if (f.hediondo === 'nao' && l.hediondo === 'Sim') return false;
  if (f.elemento && l.elemento !== ELEMENTO[f.elemento]) return false;
  if (f.violencia === 'violencia' && l.violencia !== 'Sim') return false;
  if (f.violencia === 'grave-ameaca' && l.ameaca !== 'Sim') return false;
  if (f.violencia === 'ambos' && !(l.violencia === 'Sim' && l.ameaca === 'Sim')) return false;
  if (f.violencia === 'nenhuma' && (l.violencia === 'Sim' || l.ameaca === 'Sim')) return false;
  if (f.acao && l.acao !== f.acao) return false;
  if (f.menorPotencial && !l.menorPotencial) return false;
  return true;
}

export function filtrar(linhas: LinhaTipo[], f: Filtros): LinhaTipo[] {
  return linhas.filter((l) => passa(l, f));
}

export function ordenar(linhas: LinhaTipo[], f: Filtros): LinhaTipo[] {
  const chave: Record<CampoOrdem, (l: LinhaTipo) => string | number> = {
    lei: (l) => l.lei,
    artigo: (l) => l.artigo,
    crime: (l) => l.crime,
    min: (l) => l.min,
    max: (l) => l.max,
  };
  const k = chave[f.ordem];
  const sinal = f.decrescente ? -1 : 1;
  return [...linhas].sort((a, b) => {
    const va = k(a);
    const vb = k(b);
    const cmp =
      typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'pt-BR', {numeric: true});
    // Empate: a ordem do catálogo (o id), como na busca antiga — o caput antes
    // dos parágrafos, que o texto do artigo inverteria ("§" vem antes de "c").
    return sinal * cmp || a.id - b.id;
  });
}

/** Os filtros ativos, cada um com o rótulo que a tela mostra e o estado sem ele. */
export function filtrosAtivos(f: Filtros): {rotulo: string; sem: Filtros}[] {
  const base = {...f, pagina: 1};
  const out: {rotulo: string; sem: Filtros}[] = [];
  if (f.q.trim()) out.push({rotulo: `"${f.q.trim()}"`, sem: {...base, q: ''}});
  if (f.lei) out.push({rotulo: f.lei, sem: {...base, lei: ''}});
  for (const m of f.modalidades) {
    const rot = MODALIDADES.find((x) => x.chave === m)?.rotulo ?? m;
    out.push({rotulo: rot.toLowerCase(), sem: {...base, modalidades: f.modalidades.filter((x) => x !== m)}});
  }
  if (f.hediondo) out.push({rotulo: f.hediondo === 'sim' ? 'hediondo' : 'não hediondo', sem: {...base, hediondo: ''}});
  if (f.elemento) out.push({rotulo: f.elemento, sem: {...base, elemento: ''}});
  if (f.violencia) {
    const rot = {violencia: 'com violência', 'grave-ameaca': 'com grave ameaça', ambos: 'violência e grave ameaça', nenhuma: 'sem violência nem ameaça'}[f.violencia];
    out.push({rotulo: rot, sem: {...base, violencia: ''}});
  }
  if (f.acao) out.push({rotulo: f.acao.toLowerCase(), sem: {...base, acao: ''}});
  if (f.menorPotencial) out.push({rotulo: 'menor potencial ofensivo', sem: {...base, menorPotencial: false}});
  return out;
}

// ── URL ───────────────────────────────────────────────────────────────────

export function lerFiltros(search: string): Filtros {
  const q = new URLSearchParams(search);
  const um = <T extends string>(v: string | null, validos: readonly T[]): T | '' =>
    v && (validos as readonly string[]).includes(v) ? (v as T) : '';
  const ordemBruta = q.get('ordem') ?? '';
  const [campo, dir] = ordemBruta.split('-');
  const pagina = Number(q.get('pag'));
  return {
    q: q.get('q') ?? '',
    lei: q.get('lei') ?? '',
    modalidades: (q.get('mod') ?? '').split(',').filter((m) => MODALIDADES.some((x) => x.chave === m)),
    hediondo: um(q.get('hed'), ['sim', 'nao'] as const),
    elemento: um(q.get('elem'), ['doloso', 'culposo', 'preterdoloso'] as const),
    violencia: um(q.get('viol'), ['violencia', 'grave-ameaca', 'ambos', 'nenhuma'] as const),
    acao: q.get('acao') ?? '',
    menorPotencial: q.get('mpo') === '1',
    ordem: (['lei', 'artigo', 'crime', 'min', 'max'] as const).includes(campo as CampoOrdem) ? (campo as CampoOrdem) : 'lei',
    decrescente: dir === 'desc',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

export function escreverFiltros(f: Filtros): string {
  const q = new URLSearchParams();
  if (f.q.trim()) q.set('q', f.q.trim());
  if (f.lei) q.set('lei', f.lei);
  if (f.modalidades.length) q.set('mod', f.modalidades.join(','));
  if (f.hediondo) q.set('hed', f.hediondo);
  if (f.elemento) q.set('elem', f.elemento);
  if (f.violencia) q.set('viol', f.violencia);
  if (f.acao) q.set('acao', f.acao);
  if (f.menorPotencial) q.set('mpo', '1');
  if (f.ordem !== 'lei' || f.decrescente) q.set('ordem', `${f.ordem}${f.decrescente ? '-desc' : ''}`);
  if (f.pagina > 1) q.set('pag', String(f.pagina));
  const s = q.toString().replace(/%2C/gi, ',');
  return s ? `?${s}` : '';
}
