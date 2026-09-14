// Contrato de uma entrada do changelog.
//
// O formato foi desenhado para que um backend futuro produza EXATAMENTE o mesmo
// JSON (um array de ChangelogEntry) sem que o frontend precise mudar. Por isso:
//   - `body` é texto puro (sem markdown, sem backticks); cada string é um
//     parágrafo, renderizado as-is.
//   - não há lista central: cada entrada é um arquivo próprio em
//     entries/<ano>/<id>.ts, e index.ts agrega tudo por import.meta.glob.
//
// Adaptado da abordagem do EBANX à realidade do projeto: no lugar de
// status/domain/countries/paymentMethods, os dois eixos que definimos —
// `tipo` (a natureza da mudança) e `areas` (a parte do sistema).

/**
 * A natureza da mudança, em termos penais (design_handoff_atlaspen/09, item 3).
 * O feed só publica o que cria, modifica ou extingue tipo ou atributo penal; a
 * natureza diz em que direção a lei andou. Na interface, o rótulo em latim vai
 * em itálico (ROTULO_TIPO).
 */
export type ChangelogTipo =
  | 'incriminadora' // cria tipo penal
  | 'pejus' // altera para pior
  | 'mellius' // altera para melhor
  | 'abolitio'; // deixa de ser crime

export const TIPOS_CHANGELOG: ChangelogTipo[] = ['incriminadora', 'pejus', 'mellius', 'abolitio'];

/** O rótulo exibido. Espelhado em scripts/montar-nota-release.mjs. */
export const ROTULO_TIPO: Record<ChangelogTipo, string> = {
  incriminadora: 'novatio legis incriminadora',
  pejus: 'novatio legis in pejus',
  mellius: 'novatio legis in mellius',
  abolitio: 'abolitio criminis',
};

/** A parte do sistema afetada. */
export type ChangelogArea =
  | 'Tipos penais'
  | 'Atributos'
  | 'Dosimetria'
  | 'Acervo histórico'
  | 'Interface'
  | 'Documentação';

export const AREAS_CHANGELOG: ChangelogArea[] = [
  'Tipos penais',
  'Atributos',
  'Dosimetria',
  'Acervo histórico',
  'Interface',
  'Documentação',
];

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
  tipo: ChangelogTipo;
  areas: ChangelogArea[];
  /** Ex.: "v1.2.0". Ausente em entradas não atreladas a uma versão. */
  version?: string;
  links?: ChangelogLink[];
}
