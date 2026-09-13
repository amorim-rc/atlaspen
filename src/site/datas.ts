// Datas na forma que o leitor brasileiro espera. Sem dependência: as datas do
// catálogo são ISO (AAAA-MM-DD) e dia civil, sem hora nem fuso.

const MESES_ABNT = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function partes(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** `2026-08-10` → `10/08/2026`. */
export function dataCurta(iso: string): string {
  const p = partes(iso);
  if (!p) return iso;
  return `${String(p[2]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[0]}`;
}

/** `2026-08-10` → `10 de agosto de 2026`. */
export function dataExtenso(iso: string): string {
  const p = partes(iso);
  if (!p) return iso;
  return `${p[2]} de ${MESES[p[1] - 1]} de ${p[0]}`;
}

/** Data de acesso no formato ABNT: `13 set. 2026`. */
export function dataAbnt(d: Date = new Date()): string {
  return `${d.getDate()} ${MESES_ABNT[d.getMonth()]} ${d.getFullYear()}`;
}

/** Hoje, em ISO, no fuso de quem lê. */
export function hojeIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
