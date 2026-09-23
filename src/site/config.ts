// Identidade e endereços do AtlasPen — seguro para o navegador.
//
// Nada aqui importa dado: este módulo entra nas ilhas React (citação, links) e
// não pode arrastar JSON para o bundle do cliente. O que vem dos dados em tempo
// de build (versão, data da conferência) mora em servidor.ts.
//
// Nome e grafia: design_handoff_atlaspen/10-nome-e-identidade.md. Uma palavra
// só, A e P maiúsculos; nunca "Atlaspen", "Atlas Pen" nem "o sistema AtlasPen".

export const NOME = 'AtlasPen';

/** Por extenso: na primeira menção e em capa de documento. */
export const NOME_EXTENSO = 'Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo';

/** Descritor curto, quando precisar de um. */
export const DESCRITOR = 'catálogo aberto de tipos e atributos penais';

/** O titular do código e da base (LICENSE), e quem se cita. Decisão de 20/09/2026. */
export const TITULAR = 'Luccas de Amorim e contribuidores';

export const REPOSITORIO = 'https://github.com/amorim-rc/atlaspen';

/**
 * Endereço público. Renomeado em 23/09/2026, por decisão do mantenedor, junto
 * com o repositório: `amorim-rc.github.io/sispenas/` **deixou de responder** —
 * o GitHub redireciona tudo ao renomear um repositório, menos a URL de project
 * site. O endereço antigo nunca foi divulgado, que é por que a troca cabia aqui.
 *
 * Quando o domínio próprio existir, é esta constante que muda, e só ela: nada
 * mais no repositório escreve o endereço à mão. Junto com ela mudam o `base` do
 * `astro.config.mjs` (para `/`) e um arquivo `CNAME` em `static/`.
 */
export const SITE_URL = 'https://amorim-rc.github.io/atlaspen/';

/**
 * Endereço absoluto de uma rota do site: `urlPublica('/tipos/477')`.
 *
 * Existe para que nota do changelog e mensagem de robô não escrevam o endereço
 * à mão. Era a dívida apontada no desenho do revamp (sub-projeto B): trinta e
 * poucas URLs literais nas notas já publicadas fariam de toda troca de endereço
 * uma reescrita de texto publicado. Agora é uma constante.
 */
export function urlPublica(rota: string): string {
  return SITE_URL.replace(/\/$/, '') + '/' + rota.replace(/^\/+/, '');
}
