// Coleções de conteúdo do site.
//
// A árvore de `docs/` espelha a de `/projeto`, por decisão de 24/09/2026 — e
// `docs/` é, sem exceção, o que vai ao ar. O que existe só no repositório mora
// fora dele: o pré-registro da auditoria em `.auditoria/`, os planos e specs em
// `.superpowers/`. Antes a distinção morava apenas aqui e na lista
// DOCUMENTOS_DO_PROJETO, e foi assim que `docs/acervo-historico.md` passou
// meses sendo gerado sem que nada o renderizasse.
//
// `docs/*.md` é o grupo "Documentação" da barra lateral. O front matter é o que
// o Docusaurus usava (id, title, sidebar_position) e é aceito como está.
//
// `docs/textos/*.md` é o grupo "Textos": o que o grupo escreve sobre a própria
// base (Linha do tempo e tela inicial.dc.html, 5c). Datado e assinado no topo:
// uma posição que muda sem deixar rastro perde a autoridade que a fez ser
// escrita. O gênero é campo do registro, e é o que permite o índice se
// organizar sem virar um blog. Coleção própria porque o esquema é estrito, ao
// contrário do de `docs`.

import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';
import {z} from 'astro/zod';

const docs = defineCollection({
  loader: glob({pattern: '*.md', base: './docs'}),   // só a raiz: docs/textos tem coleção própria
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      sidebar_position: z.number().optional(),
    })
    .passthrough(),
});

const textos = defineCollection({
  loader: glob({pattern: '*.md', base: './docs/textos'}),
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
