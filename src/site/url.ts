// Caminhos internos com o `base` do site.
//
// O site mora na raiz de atlaspen.com.br; antes morou em /atlaspen/ e em
// /sispenas/. Todo link interno passa por aqui, e não é escrito à mão com o
// prefixo, para que a troca de `SITE_URL` (src/site/config.ts) baste: nas páginas
// estáticas e nas ilhas React, que recebem o mesmo valor do Vite.

const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/**
 * Caminho interno com o prefixo do site: `caminho('/tipos/1')` →
 * `/tipos/1`, ou `/<base>/tipos/1` se houver base. Endereço absoluto, âncora
 * e `mailto:` passam intactos.
 */
export function caminho(rota: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(rota) || rota.startsWith('#') || rota.startsWith('//')) {
    return rota;
  }
  return BASE + rota.replace(/^\/+/, '');
}

