// Coleções de conteúdo do site.
//
// `docs`: os documentos do projeto, lidos ONDE ESTÃO, em docs/. Não migram de
// pasta: o Arquivista (data/documentacao.json) e o scripts/gerar_completude.py
// os esperam lá, e o GitHub continua mostrando cada um com os links relativos
// funcionando. O front matter é o que o Docusaurus usava (id, title,
// sidebar_position) e é aceito como está.

import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';
import {z} from 'astro/zod';

const docs = defineCollection({
  loader: glob({pattern: '*.md', base: './docs'}),
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      sidebar_position: z.number().optional(),
    })
    .passthrough(),
});

export const collections = {docs};
