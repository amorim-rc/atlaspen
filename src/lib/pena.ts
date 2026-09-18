// A pena em dias inteiros (design_handoff_reestruturacao/07, "Unidade interna").
//
// Mês de 30 dias, ano de 360 — a contagem do art. 11 do CP; nunca 365, nunca
// mês de calendário. O catálogo continua em meses (data/crimes.json: 0,5 são
// 15 dias), e a conversão acontece na fronteira, ao carregar. Daí em diante o
// estado de toda simulação trafega em dias inteiros, até a URL: `?penaMin=2160`
// é permalink estável, sem vírgula decimal nem dízima que falhe um limiar por
// arredondamento.

export const DIAS_POR_MES = 30;
export const DIAS_POR_ANO = 360;

/** Limite de entrada: zero a cinquenta anos. Fora da moldura é legítimo (é simulação); só o absurdo é barrado. */
export const PENA_MAXIMA_ENTRADA = 50 * DIAS_POR_ANO;

/** Meses do catálogo (0,5 = 15 dias) → dias inteiros. */
export function diasDeMeses(meses: number): number {
  return Math.round(meses * DIAS_POR_MES);
}

/** Dias → meses, para o motor, que conta em meses sobre a grade do dia inteiro. */
export function mesesDeDias(dias: number): number {
  return dias / DIAS_POR_MES;
}

export interface PenaComposta {
  anos: number;
  meses: number;
  dias: number;
}

/** 2.892 dias → 8 anos, 0 meses e 12 dias. */
export function decompor(dias: number): PenaComposta {
  const d = Math.max(0, Math.trunc(dias));
  return {
    anos: Math.floor(d / DIAS_POR_ANO),
    meses: Math.floor((d % DIAS_POR_ANO) / DIAS_POR_MES),
    dias: d % DIAS_POR_MES,
  };
}

/** Anos, meses e dias → dias. Casa vazia conta como zero. */
export function compor(p: Partial<PenaComposta>): number {
  return (p.anos ?? 0) * DIAS_POR_ANO + (p.meses ?? 0) * DIAS_POR_MES + (p.dias ?? 0);
}

export function limitarPena(dias: number): number {
  return Math.min(Math.max(0, Math.trunc(dias)), PENA_MAXIMA_ENTRADA);
}

function juntar(partes: string[]): string {
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

/**
 * A forma composta, omitindo as casas nulas: "6 anos", "4 anos, 8 meses e 12
 * dias". É a mesma função que alimenta os rótulos, a régua e o `aria-valuetext`.
 *
 * @param zero o que dizer quando a pena é zero — na mínima cominada, zero é
 *   "sem mínimo cominado", e não "sem pena".
 */
export function formatDias(dias: number, zero = 'zero'): string {
  const {anos, meses, dias: d} = decompor(dias);
  const partes: string[] = [];
  if (anos) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (d) partes.push(`${d} ${d === 1 ? 'dia' : 'dias'}`);
  return partes.length ? juntar(partes) : zero;
}

/** A faixa de uma moldura: "6 a 20 anos", "4 anos a 26 anos e 8 meses", "até 3 meses". */
export function formatFaixa(min: number, max: number): string {
  if (min <= 0) return `até ${formatDias(max)}`;
  const a = decompor(min);
  const b = decompor(max);
  // Os dois em anos redondos: "6 a 20 anos", como o catálogo escreve.
  if (!a.meses && !a.dias && !b.meses && !b.dias && a.anos && b.anos) {
    return `${a.anos} a ${b.anos} ${b.anos === 1 ? 'ano' : 'anos'}`;
  }
  return `${formatDias(min)} a ${formatDias(max)}`;
}

/** Contagem de dias com separador de milhar: "2.160 dias". */
export function formatContagemDias(dias: number): string {
  return `${dias.toLocaleString('pt-BR')} ${dias === 1 ? 'dia' : 'dias'}`;
}

// ── Duração compacta: 1a, 18m, 2a6m15d ────────────────────────────────────
//
// A forma que a URL usa para uma duração. Mora aqui, e não no estado de um
// componente, porque é conversão de pena e porque a ficha do atributo, a
// simulação e o codec da premissa dependem dela.

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
