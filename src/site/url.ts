// Caminhos internos com o `base` do site.
//
// O site mora em /atlaspen/ e vai mudar de endereço quando o domínio for
// decidido. Todo link interno passa por aqui, e não é escrito à mão com o
// prefixo, para que a troca de `base` no astro.config.mjs baste — nas páginas
// estáticas e nas ilhas React, que recebem o mesmo valor do Vite.

const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/**
 * Caminho interno com o prefixo do site: `caminho('/tipos/1')` →
 * `/atlaspen/tipos/1`. Endereço absoluto, âncora e `mailto:` passam intactos.
 */
export function caminho(rota: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(rota) || rota.startsWith('#') || rota.startsWith('//')) {
    return rota;
  }
  return BASE + rota.replace(/^\/+/, '');
}

