// Coleções de conteúdo do site.
//
// `docs`: os documentos do projeto, lidos ONDE ESTÃO, em docs/. Não migram de
// pasta: o Arquivista (data/documentacao.json) e o scripts/gerar_completude.py
// os esperam lá, e o GitHub continua mostrando cada um com os links relativos
// funcionando. O front matter é o que o Docusaurus usava (id, title,
// sidebar_position) e é aceito como está.
//
// `textos`: o que o grupo escreve sobre a própria base (Linha do tempo e tela
// inicial.dc.html, 5c). Datado e assinado no topo: uma posição que muda sem
// deixar rastro perde a autoridade que a fez ser escrita. O gênero é campo do
// registro, e é o que permite o índice se organizar sem virar um blog.

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

const textos = defineCollection({
  loader: glob({pattern: '*.md', base: './textos'}),
  schema: z.object({
    titulo: z.string(),
    genero: z.enum(['história', 'manifesto', 'nota de método', 'posição', 'créditos']),
    /** AAAA-MM-DD, entre aspas no front matter. */
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    revisado_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    assinatura: z.string(),
    resumo: z.string(),
  }),
});

export const collections = {docs, textos};
