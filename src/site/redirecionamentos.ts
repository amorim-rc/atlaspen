// A camada de redirecionamento: toda rota pública antiga responde e leva ao
// endereço novo, preservando a query string. O caso crítico é `?tipo=N`,
// citado em pareceres. Uma URL citada que vira 404 em silêncio é o pior
// defeito possível neste projeto.
//
// Esta tabela é a fonte ÚNICA. Leem-na:
//   - src/pages/[...legado].astro, que publica um stub em cada rota antiga;
//   - src/site/markdown/links.ts, que reescreve os links internos dos docs;
//   - scripts/verificar_rotas.mjs, o teste de fumaça da CI.
//
// Num site estático não há 301 de servidor: a rota antiga continua publicada
// como página mínima que monta o destino e faz `location.replace`, com
// `<meta http-equiv="refresh">` para quem não executa JS.
//
// Feita para receber o segundo movimento, a troca de domínio (frente 3 do
// backlog): o destino é sempre uma ROTA do site, e quem a transforma em
// endereço é o stub. No dia da mudança, basta o stub montar o endereço com a
// origem nova.
//
// Sem import, de propósito: o teste de fumaça importa este arquivo direto pelo
// Node (type stripping), sem bundler. Só sintaxe de tipo apagável.

export interface Redirecionamento {
  /** Rota antiga, sem o base do site (ex.: '/pesquisa/tipos'). */
  de: string;
  /** Rota nova, sem o base. */
  para: string;
  /**
   * Parâmetro da query que, presente, vira segmento do caminho novo: com
   * `{nome: 'tipo', para: '/tipos/{valor}'}`, `?tipo=12` leva a `/tipos/12`.
   * O parâmetro sai da query; o resto dela é preservado.
   */
  parametro?: {nome: string; para: string};
}

/**
 * As doze notas por versão, de quando o feed era blog (até a v1.2.0). O
 * Docusaurus já as redirecionava para o feed único; o feed agora é /notas.
 */
const NOTAS_POR_VERSAO = [
  'v1-0-0', 'v1-1-0', 'v1-1-1', 'v1-1-2', 'v1-1-3', 'v1-1-4',
  'v1-1-5', 'v1-1-6', 'v1-1-7', 'v1-1-8', 'v1-1-9', 'v1-2-0',
];

/** Os documentos que passam de /docs/ para /projeto/, um a um. */
export const DOCUMENTOS_DO_PROJETO = [
  'metodologia',
  'completude',
  'catalogo-tipos-penais',
  'atributos-penais',
  'progressao-de-regime',
  'os-robos',
  'dados-abertos',
];

export const REDIRECIONAMENTOS: Redirecionamento[] = [
  // Busca por tipo penal: a lista e, com ?tipo=N, a ficha — que ganha rota própria.
  {de: '/pesquisa/tipos', para: '/tipos', parametro: {nome: 'tipo', para: '/tipos/{valor}'}},
  // Busca por atributo, com o nome de hoje e com o da rodada anterior.
  {de: '/pesquisa/atributos', para: '/atributos', parametro: {nome: 'atributo', para: '/atributos/{valor}'}},
  {de: '/pesquisa/beneficios', para: '/atributos', parametro: {nome: 'beneficio', para: '/atributos/{valor}'}},
  // Documentação.
  {de: '/docs', para: '/projeto'},
  {de: '/docs/sobre', para: '/'},
  {de: '/docs/acervo-historico', para: '/acervo'},
  ...DOCUMENTOS_DO_PROJETO.map((doc) => ({de: `/docs/${doc}`, para: `/projeto/${doc}`})),
  {de: '/docs/beneficios-penais', para: '/projeto/atributos-penais'},
  // Notas de atualizações.
  {de: '/release-notes', para: '/notas'},
  ...NOTAS_POR_VERSAO.map((v) => ({de: `/release-notes/${v}`, para: '/notas'})),
  // Registros do acervo que deixaram de existir (data/acervo.json, ids_aposentados).
  // lei9807-19: o veto que ele afirmava não tem fonte, e a lei não tem crime.
  // lcp-60-61: desmembrado em lcp-60 e lcp-61; a lista mostra os dois.
  {de: '/acervo/lei9807-19', para: '/acervo'},
  {de: '/acervo/lcp-60-61', para: '/acervo'},
  // Tipo penal aposentado (data/ids-aposentados.json). O 559 e o 1508 eram o
  // MESMO art. 326-B do Código Eleitoral: o 559 estava rotulado pela lei que o
  // criou (Lei 14.192/21) e não pelo diploma em que o crime vive, e por isso a
  // duplicata não colidiu. Decisão C13 de 23/09/2026. O id já foi URL pública,
  // então não some: aponta para o registro que ficou.
  {de: '/tipos/559', para: '/tipos/1508'},
  // O art. 312, §3º, do CP não comina pena: a reparação do dano extingue a
  // punibilidade do peculato culposo antes da sentença irrecorrível, e reduz de
  // metade a pena IMPOSTA depois dela. O registro publicava uma moldura que não
  // está em lugar nenhum da lei. Decisão H8 de 24/09/2026; o conteúdo do § foi
  // para o `obs` do peculato culposo, que é para onde o endereço aponta.
  {de: '/tipos/608', para: '/tipos/248'},
  // O art. 334, §1º, III é UM crime escrito com muitos verbos — adquirir,
  // receber, ocultar, ter em depósito, transportar, revender. O catálogo o
  // trazia duas vezes, cada vez nomeando um punhado diferente dos mesmos
  // verbos. Ficou o 614, que nomeia o inciso inteiro. Decisão de 25/09/2026.
  {de: '/tipos/616', para: '/tipos/614'},
];

/**
 * A raiz `/?tipo=N`, de quando a pesquisa era servida na página inicial (até a
 * v1.0.0). A raiz não pode virar stub — é a página inicial —, e por isso ela
 * mesma trata o parâmetro. Mesma forma das regras acima.
 */
export const RAIZ_LEGADA: Redirecionamento = {
  de: '/',
  para: '/',
  parametro: {nome: 'tipo', para: '/tipos/{valor}'},
};

/** O destino de uma regra para uma query: a rota nova e o resto da query. */
export function destinoDe(regra: Redirecionamento, query: string): {rota: string; query: string} {
  const q = new URLSearchParams(query);
  let rota = regra.para;
  if (regra.parametro) {
    const valor = q.get(regra.parametro.nome);
    if (valor) {
      rota = regra.parametro.para.replace('{valor}', encodeURIComponent(valor));
      q.delete(regra.parametro.nome);
    }
  }
  const resto = q.toString();
  return {rota, query: resto ? `?${resto}` : ''};
}

/** A rota de um documento de docs/ no site novo. */
export function rotaDoDocumento(nome: string): string {
  if (nome === 'acervo-historico') return '/acervo';
  return DOCUMENTOS_DO_PROJETO.includes(nome) ? `/projeto/${nome}` : `/projeto/${nome}`;
}

/**
 * Reescreve uma rota antiga — com query e âncora — para a nova. Rota que não é
 * antiga volta intacta. Serve aos links escritos à mão nos docs.
 */
export function rotaAtual(href: string): string {
  const m = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(href);
  if (!m) return href;
  const caminho = m[1].replace(/\/+$/, '') || '/';
  const query = m[2] ?? '';
  const ancora = m[3] ?? '';
  const regra =
    REDIRECIONAMENTOS.find((r) => r.de === caminho) ??
    (caminho === '/' && new URLSearchParams(query).has('tipo') ? RAIZ_LEGADA : undefined);
  if (!regra) return href;
  const destino = destinoDe(regra, query);
  return destino.rota + destino.query + ancora;
}
