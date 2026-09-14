// @ts-check
// Configuração do site em Astro. Substitui o docusaurus.config.ts ao fim da
// migração (design_handoff_atlaspen, commit 11).
//
// O que NÃO muda aqui, de propósito:
//   - `site` e `base`: o endereço continua amorim-rc.github.io/sispenas/ até o
//     grupo decidir o domínio (frente 3 do backlog). Quando decidir, a troca é
//     um PR próprio, e a camada de redirecionamento absorve o movimento.
//   - `publicDir` aponta para `static/`, e não para `public/`: é lá que o
//     pipeline de dados grava o derivado (scripts/transform_data.py,
//     scripts/derivar_atributos.ts) e é esse caminho que a CI, o regen-data e o
//     conferidor conferem. Mover a pasta seria mexer no pipeline de dados, que
//     este revamp não toca. O endereço público continua /data/crimes.json.

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import {remarkAdmonicoes} from './src/site/markdown/admonicoes.ts';
import {remarkComentarios} from './src/site/markdown/comentarios.ts';
import {remarkLinks} from './src/site/markdown/links.ts';

const BASE = '/sispenas/';

/**
 * As FONTES de data/*.json importadas pelo código viram módulo virtual.
 *
 * Em desenvolvimento o Vite serve um JSON importado na URL do próprio arquivo
 * (/data/atributos.json), e essa URL é também a do DERIVADO homônimo que
 * static/ publica. O Vite se recusa a transformar caminho que coincide com
 * arquivo público, e a ilha que importa a base dos atributos morria com 404.
 * Como módulo virtual, o dado sai por /@id/..., sem colisão possível. O código
 * continua importando o caminho relativo de sempre — o tsc e o Node do
 * `npm run verificar` não percebem nada.
 */
function fontesSemColisao() {
  const PREFIXO = '\0atlaspen-fonte:';
  const DADOS = resolve('data').replace(/\\/g, '/') + '/';
  return {
    name: 'atlaspen-fontes-sem-colisao',
    enforce: /** @type {const} */ ('pre'),
    async resolveId(fonte, importador) {
      if (!importador || !fonte.endsWith('.json')) return null;
      const r = await this.resolve(fonte, importador, {skipSelf: true});
      const id = r?.id.replace(/\\/g, '/');
      return id && id.startsWith(DADOS) ? PREFIXO + id : null;
    },
    // Devolve o JSON cru: o id ainda termina em .json, e o plugin de JSON do
    // próprio Vite o converte em módulo, como faria com o arquivo.
    load(id) {
      if (!id.startsWith(PREFIXO)) return null;
      return readFileSync(id.slice(PREFIXO.length), 'utf-8');
    },
  };
}

export default defineConfig({
  site: 'https://amorim-rc.github.io',
  base: BASE,
  publicDir: './static',
  outDir: './dist',
  trailingSlash: 'ignore',
  build: {format: 'directory'},
  integrations: [react(), sitemap()],
  vite: {
    plugins: [fontesSemColisao()],
    // Só em desenvolvimento. O React entra pré-empacotado já na partida: quando o
    // Vite o descobria no meio da sessão, reotimizava as dependências e a página
    // aberta ficava com pedaços de duas versões ("_jsxDEV is not a function"),
    // e as ilhas não montavam até apagar node_modules/.vite.
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  },
  markdown: {
    // Os docs/ continuam escritos para o GitHub e na sintaxe que o hook do
    // projeto impõe; estes plugins os servem no site: admonições
    // :::note[Título], o carimbo {/* ... */} do gerador fora do HTML, e os
    // links internos levados às rotas novas pela tabela de redirecionamentos.
    remarkPlugins: [remarkDirective, remarkAdmonicoes, remarkComentarios, [remarkLinks, {base: BASE}]],
  },
});
