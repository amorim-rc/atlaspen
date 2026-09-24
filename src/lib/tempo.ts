// A data do fato, e as leis que dependem dela — AtlasPen.
//
// Decisão do mantenedor em 23/09/2026 (decisões 33 e 35): o motor passa a
// receber a DATA DO FATO, e não um punhado de booleanos "fato anterior à lei
// tal". A diferença não é de forma. Cada lei nova que muda pena ou regime abre
// uma pergunta intertemporal própria, e a resposta se apura por SITUAÇÃO
// CONCRETA, não em bloco: a mesma Lei 15.402/2026 é mais gravosa para o
// primário em crime sem violência (16% viraram 16,67%) e mais benéfica para
// outros. Com um booleano por lei, a terceira lei do ano vira a terceira caixa
// de seleção; com a data, o motor responde sozinho.
//
// A regra de fundo é o art. 2º, parágrafo único, do CP e o art. 5º, XL, da
// Constituição: a lei penal mais benéfica retroage, a mais gravosa não.

/**
 * Início de vigência das leis que o cálculo consulta. ISO, e conferidas no DOU
 * pelo Sentinela em 23/09/2026 (decisão 32).
 */
export const VIGENCIA = {
  /** Pacote Anticrime: deu ao art. 112 da LEP a tabela de percentuais. */
  lei13964: '2020-01-23',
  /** Estelionato: passou a exigir representação (CP, art. 171, § 5º). */
  estelionatoRepresentacao: '2020-01-23',
  /** Ampliou a vítima protegida no § 5º do art. 171 (pessoa com deficiência). */
  lei15229: '2025-10-03',
  /** Reescreveu os percentuais dos HEDIONDOS no art. 112 da LEP. */
  lei15358: '2026-03-25',
  /** Revogou o § 5º do art. 171: o estelionato volta a ser incondicionado. */
  lei15397: '2026-05-04',
  /** Reescreveu os incisos I a IV do art. 112 da LEP (crimes comuns). */
  lei15402: '2026-05-08',
} as const;

/** Hoje, em ISO (UTC), que é o padrão da data do fato. */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * O fato é anterior ao início de vigência da lei?
 *
 * Comparação de strings ISO, que é ordenação lexicográfica correta para
 * `AAAA-MM-DD` e não depende de fuso — o que importa aqui é o DIA, e converter
 * para Date reintroduziria o fuso do navegador de quem consulta.
 */
export function anteriorA(dataDoFato: string, vigencia: string): boolean {
  return dataDoFato < vigencia;
}

/**
 * A tabela de percentuais do art. 112 da LEP aplicável aos crimes COMUNS: a da
 * Lei 15.402/2026 ou a do Pacote Anticrime.
 */
export function regimeComumAnterior(dataDoFato: string): boolean {
  return anteriorA(dataDoFato, VIGENCIA.lei15402);
}

/**
 * A tabela dos HEDIONDOS: a da Lei 15.358/2026 (70/75/80/85%) ou a anterior
 * (40/50/55/60/70%). São marcos DIFERENTES — 25/03/2026 e 08/05/2026 —, e um
 * fato entre as duas datas cai na tabela nova dos hediondos e na antiga dos
 * comuns. Era o que nenhum booleano único conseguia representar.
 */
export function regimeHediondoAnterior(dataDoFato: string): boolean {
  return anteriorA(dataDoFato, VIGENCIA.lei15358);
}
