// Utilidades de formatação de pena (valores em MESES).

/**
 * Anos, meses e DIAS — nessa ordem, e sem arredondar.
 *
 * A versão anterior fazia `Math.round(meses)`, e com isso a pena de 5 meses e
 * 13 dias aparecia como "5 meses": os treze dias sumiam da tela depois de terem
 * sido calculados com cuidado. Pena penal se conta em dia (art. 11 do CP), e o
 * dia é a unidade que decide prescrição, progressão e detração.
 */
export function formatPena(meses: number | null | undefined): string {
  if (meses === null || meses === undefined || Number.isNaN(meses)) return '—';
  if (meses <= 0) return '—';
  const totalDias = Math.trunc(meses * 30 + 1e-9);
  const anos = Math.floor(totalDias / 360);
  const m = Math.floor((totalDias % 360) / 30);
  const d = totalDias % 30;
  const partes: string[] = [];
  if (anos) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (m) partes.push(`${m} ${m === 1 ? 'mês' : 'meses'}`);
  if (d) partes.push(`${d} ${d === 1 ? 'dia' : 'dias'}`);
  if (!partes.length) return '—';
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

export function formatPenaCurta(meses: number | null | undefined): string {
  if (meses === null || meses === undefined || Number.isNaN(meses)) return '—';
  if (meses <= 0) return '—';
  if (meses < 1) return `${Math.round(meses * 30)}d`;
  const m = Math.round(meses);
  const anos = Math.floor(m / 12);
  const rem = m % 12;
  if (anos === 0) return `${rem}m`;
  if (rem === 0) return `${anos}a`;
  return `${anos}a${rem}m`;
}

const FRACOES: Record<string, string> = {
  '0.167': '1/6',
  '0.200': '1/5',
  '0.250': '1/4',
  '0.333': '1/3',
  '0.400': '2/5',
  '0.500': '1/2',
  '0.600': '3/5',
  '0.667': '2/3',
  '0.700': '7/10',
};

export function formatFracao(f: number): string {
  return FRACOES[f.toFixed(3)] ?? `${(f * 100).toFixed(0)}%`;
}
