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

export const REPOSITORIO = 'https://github.com/amorim-rc/sispenas';

/**
 * Endereço público. NÃO muda com o nome: o domínio é decisão do grupo (frente 3
 * do backlog), e quando vier, a troca é um PR próprio.
 */
export const SITE_URL = 'https://amorim-rc.github.io/sispenas/';
