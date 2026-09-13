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

export default defineConfig({
  site: 'https://amorim-rc.github.io',
  base: '/sispenas/',
  publicDir: './static',
  outDir: './dist',
  trailingSlash: 'ignore',
  build: {format: 'directory'},
  integrations: [react(), sitemap()],
});
