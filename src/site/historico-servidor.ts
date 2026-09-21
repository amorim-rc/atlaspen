// O histórico legislativo de um dispositivo, em tempo de build.
//
// Lê data/historico-legislativo.json, que tem por chave o dispositivo em forma
// canônica (`cp|art. 121, caput`), a do campo `dispositivo_canonico` do catálogo.
// Desde 20/09/2026 (frente 4) ele cobre os artigos de todos os tipos penais, além
// dos dispositivos citados pelos atributos. Onde não há evento, a ficha diz que
// não há — nunca preenche.
//
// "Alteração" segue a regra de scripts/derivar_atributos.ts: o que uma lei fez
// depois do texto original. Nascer no original não conta, e correção de dado
// do catálogo não é alteração legislativa (frente 9).

import historico from '../../data/historico-legislativo.json';

export interface EventoHistorico {
  dispositivo: string;
  evento: 'criacao' | 'alteracao' | 'revogacao' | 'renumeracao' | 'transferencia' | string;
  norma: string | null;
  ano?: number;
  anotacao?: string;
  url?: string;
  vigencia?: string;
  natureza: string;
  origem?: string;
}

const EVENTOS = (historico as unknown as {eventos: EventoHistorico[]}).eventos;

/** A chave do artigo inteiro: `cp|art. 121, caput` → `cp|art. 121`. */
export function chaveDoArtigo(chave: string): string {
  const [diploma, resto = ''] = chave.split('|');
  return `${diploma}|${resto.split(', ')[0]}`;
}

/** O identificador do artigo na URL do acervo: `cp|art. 121-a, caput` → `cp-121-a`. */
export function slugDoArtigo(chave: string): string {
  const [diploma, resto = ''] = chaveDoArtigo(chave).split('|');
  const numero = resto.replace(/^art\.?\s*/i, '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-');
  return `${diploma}-${numero}`.replace(/-+$/, '');
}

const eAlteracao = (e: EventoHistorico) =>
  e.natureza === 'legislativa' && !(e.evento === 'criacao' && e.norma === 'original');

/** Em ordem cronológica; sem ano (o texto original) vem primeiro, como no arquivo. */
function cronologico(lista: EventoHistorico[]): EventoHistorico[] {
  return lista
    .map((e, i) => ({e, i: EVENTOS.indexOf(e), j: i}))
    .sort((a, b) => (a.e.ano ?? 0) - (b.e.ano ?? 0) || a.i - b.i)
    .map((x) => x.e);
}

export interface Historico {
  /** O histórico cobre este artigo? Sem nenhum evento, não se sabe nada dele ainda. */
  datado: boolean;
  /** A alteração legislativa mais recente que alcança o dispositivo (ele próprio ou o artigo inteiro). */
  ultima: EventoHistorico | null;
  /** O dispositivo tem registro de texto original, sem alteração depois dele. */
  original: boolean;
  alteracoesDispositivo: number;
  alteracoesArtigo: number;
  /** Todos os eventos do artigo, do mais recente para o mais antigo. */
  eventosArtigo: EventoHistorico[];
}

export function historicoDe(chave: string): Historico {
  const artigo = chaveDoArtigo(chave);
  const doArtigo = EVENTOS.filter((e) => e.dispositivo === artigo || e.dispositivo.startsWith(`${artigo}, `));
  const doDispositivo = EVENTOS.filter((e) => e.dispositivo === chave || e.dispositivo === artigo);
  const alteracoes = cronologico(doDispositivo.filter(eAlteracao));
  return {
    datado: doArtigo.length > 0,
    ultima: alteracoes.at(-1) ?? null,
    original: doDispositivo.some((e) => e.evento === 'criacao' && e.norma === 'original') && !alteracoes.length,
    alteracoesDispositivo: alteracoes.length,
    // Leis, e não linhas: a mesma conta da derivação dos tipos e dos atributos.
    alteracoesArtigo: new Set(doArtigo.filter(eAlteracao).map((e) => `${e.norma}|${e.ano ?? ''}`)).size,
    eventosArtigo: cronologico(doArtigo).reverse(),
  };
}
