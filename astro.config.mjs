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

import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import {remarkAdmonicoes} from './src/site/markdown/admonicoes.ts';
import {remarkComentarios} from './src/site/markdown/comentarios.ts';
import {remarkLinks} from './src/site/markdown/links.ts';

const BASE = '/sispenas/';

export default defineConfig({
  site: 'https://amorim-rc.github.io',
  base: BASE,
  publicDir: './static',
  outDir: './dist',
  trailingSlash: 'ignore',
  build: {format: 'directory'},
  integrations: [react(), sitemap()],
  markdown: {
    // Os docs/ continuam escritos para o GitHub e na sintaxe que o hook do
    // projeto impõe; estes plugins os servem no site: admonições
    // :::note[Título], o carimbo {/* ... */} do gerador fora do HTML, e os
    // links internos levados às rotas novas pela tabela de redirecionamentos.
    remarkPlugins: [remarkDirective, remarkAdmonicoes, remarkComentarios, [remarkLinks, {base: BASE}]],
  },
});
