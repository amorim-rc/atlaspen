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

/**
 * Quem assina o código e a base: o NOTICE, o rodapé e "Como citar".
 *
 * Coletivo por decisão de 24/09/2026. A assinatura curta nomeava uma pessoa só
 * num projeto que é colaborativo, e isso soava mal ao lado das professoras que
 * colaboram com ele. Quem faz o quê fica em /projeto/creditos, que nomeia mais
 * do que a assinatura nomeava.
 */
export const TITULAR = 'Equipe AtlasPen';

export const REPOSITORIO = 'https://github.com/luccas-amorim/atlaspen';

/**
 * Endereço público: o domínio próprio, `atlaspen.com.br`, na raiz. Com o
 * domínio configurado no Pages, o endereço `github.io` redireciona para ele,
 * preservando o caminho.
 *
 * Endereço que muda, muda aqui, e só aqui: nada mais no repositório o escreve
 * à mão. O `astro.config.mjs` deriva desta constante o `site` e o `base`, o
 * `scripts/verificar_rotas.mjs` o `base`, e os scripts Python a leem por
 * `scripts/endereco_publico.py`. O domínio em si se declara em Settings > Pages,
 * e não num `CNAME`: o deploy por Actions ignora esse arquivo.
 */
export const SITE_URL = 'https://atlaspen.com.br/';

/**
 * Endereço absoluto de uma rota do site: `urlPublica('/tipos/477')`.
 *
 * Existe para que nota do changelog e mensagem de robô não escrevam o endereço
 * à mão: com URLs literais nas notas já publicadas, toda troca de endereço
 * viraria uma reescrita de texto publicado.
 */
export function urlPublica(rota: string): string {
  return SITE_URL.replace(/\/$/, '') + '/' + rota.replace(/^\/+/, '');
}
