// O índice da lista de tipos penais: um arquivo enxuto, gerado no build, com
// só os campos que a busca e a tabela usam. O catálogo inteiro
// (/data/crimes.json, o dado aberto) continua publicado como está; a lista não
// precisa baixar os 2 MB dele para filtrar.

import type {APIRoute} from 'astro';
import {todosOsTipos} from '../../site/catalogo-servidor';
import {paraLinha} from '../../components/tipos/filtros';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(todosOsTipos().map(paraLinha)), {
    headers: {'Content-Type': 'application/json; charset=utf-8'},
  });
