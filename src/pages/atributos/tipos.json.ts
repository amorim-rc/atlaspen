// O catálogo de tipos penais que a ficha do atributo varre no navegador: um
// registro por tipo, só com o que o motor lê (TipoDoMotor). O dado aberto
// completo continua em /data/crimes.json.

import type {APIRoute} from 'astro';
import type {TipoDoMotor} from '../../lib/types';
import {todosOsTipos} from '../../site/catalogo-servidor';

export function paraOMotor(c: TipoDoMotor): TipoDoMotor {
  return {
    id: c.id,
    lei: c.lei,
    artigo: c.artigo,
    crime: c.crime,
    pena_min_meses: c.pena_min_meses,
    pena_max_meses: c.pena_max_meses,
    pena_faixa_rotulo: c.pena_faixa_rotulo,
    hediondo: c.hediondo,
    resultado_morte: c.resultado_morte,
    violencia: c.violencia,
    grave_ameaca: c.grave_ameaca,
    elemento: c.elemento,
    tentativa: c.tentativa,
    perdao_judicial_previsto: c.perdao_judicial_previsto,
    contravencao: c.contravencao,
    tem_pena_privativa: c.tem_pena_privativa,
    pena_por_remissao: c.pena_por_remissao,
    tipo_pena: c.tipo_pena,
  };
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(todosOsTipos().map(paraOMotor)), {
    headers: {'Content-Type': 'application/json; charset=utf-8'},
  });
