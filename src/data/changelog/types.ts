// Contrato de uma entrada do changelog.
//
// O formato foi desenhado para que um backend futuro produza EXATAMENTE o mesmo
// JSON (um array de ChangelogEntry) sem que o frontend precise mudar. Por isso:
//   - `body` é texto puro (sem markdown, sem backticks); cada string é um
//     parágrafo, renderizado as-is.
//   - não há lista central: cada entrada é um arquivo próprio em
//     entries/<ano>/<id>.ts, e index.ts agrega tudo por import.meta.glob.
//
// Adaptado da abordagem do EBANX à realidade do projeto.

/**
 * O que a mudança da lei alcança: o tipo penal, o atributo penal, ou os dois.
 *
 * **Simplificado em 24/09/2026, por decisão do mantenedor.** Até então cada
 * entrada declarava uma "natureza" em latim — *incriminadora*, *in pejus*, *in
 * mellius*, *abolitio* e *abolitio parcial* — e uma lista de seis "áreas". As
 * duas classificações custavam caro a quem escreve a nota: a régua que separa
 * *abolitio* parcial de *in mellius* precisou de um parágrafo inteiro de
 * doutrina para ficar de pé, e errar nela é fácil. O custo não se pagava.
 *
 * O que o leitor do feed precisa é mais simples: mudou tipo penal ou mudou
 * atributo? E quando? A direção da mudança — se a lei ficou mais severa ou mais
 * branda — continua no feed, dita em português no `summary` e no `body`, onde
 * cabe a ressalva que um rótulo nunca comporta.
 *
 * A distinção em latim NÃO morreu: ela vive onde é ferramenta de análise, e não
 * rótulo de notícia — em `src/lib/simulacao/tipos.ts`, para etiquetar a hipótese
 * que alguém simula. Lá ela responde "que direção esta proposta toma?", que é a
 * pergunta da simulação. As duas coisas usavam o mesmo vocabulário por acidente.
 */
export type ChangelogAlcance = 'tipo' | 'atributo';

export const ALCANCES: ChangelogAlcance[] = ['tipo', 'atributo'];

export const ROTULO_ALCANCE: Record<ChangelogAlcance, string> = {
  tipo: 'Tipos penais',
  atributo: 'Atributos penais',
};

/**
 * O semestre de uma data ISO: "2026-1". É o recorte do filtro de período.
 *
 * Semestre, e não mês nem ano: mês daria dezenas de fatias quase vazias, e ano
 * é grosso demais para uma base que recebe lei quase toda semana.
 */
export function semestreDe(dataISO: string): string {
  const mes = Number(dataISO.slice(5, 7));
  return `${dataISO.slice(0, 4)}-${mes <= 6 ? 1 : 2}`;
}

export function rotuloSemestre(semestre: string): string {
  const [ano, s] = semestre.split('-');
  return `${s}º semestre de ${ano}`;
}

/** "Onde a mudança aparece" — o link para o local exato. */
export interface ChangelogLink {
  label: string;
  href: string;
}

export interface ChangelogEntry {
  /** YYYY-MM-DD-<slug>, idêntico ao nome do arquivo (sem extensão). */
  id: string;
  /** Data ISO, YYYY-MM-DD. */
  date: string;
  title: string;
  /** Um parágrafo de resumo. */
  summary: string;
  /** Parágrafos em texto puro, renderizados as-is (sem markdown). */
  body: string[];
  /** O que a lei alcançou: tipo penal, atributo penal, ou os dois. */
  alcance: ChangelogAlcance[];
  /** Ex.: "v1.2.0". Ausente em entradas não atreladas a uma versão. */
  version?: string;
  links?: ChangelogLink[];
}
