// A pena por remissão: o tipo que não comina moldura própria e importa a de
// outro dispositivo — art. 304 do CP ("a pena cominada à falsificação"), art. 315
// do CPM, arts. 2º e 3º da Lei 2.889/56.
//
// A moldura depende de qual origem incide no caso, e o catálogo não a inventa.
// Por isso o tipo é avaliado uma vez por origem, com a moldura dela, e o veredito
// é o comum às origens — ou "condicional", com uma linha por origem, quando elas
// divergem. Avaliá-lo com a própria moldura (zero) faria caber todo atributo que
// depende de teto de pena.
//
// O operador segue a convenção da dosimetria, a mesma de data/modificadores.json:
// "diminui-se de f" multiplica por (1 − f); "aumenta-se de f", por (1 + f).

import type {Cenario, TipoDoMotor} from '../types';
import type {AtributoDef, AtributoResultado, Parametros} from './types';
import {avaliarAtributo} from './nucleo';

export interface Origem {
  tipo: TipoDoMotor;
  /** Moldura da origem já transformada pelo operador da remissão, em meses. */
  penaMin: number;
  penaMax: number;
}

/** "1/2" → 0,5. `null` ou texto fora do formato → 0. */
export function fracaoDe(texto: string | null): number {
  const m = /^(\d+)\/(\d+)$/.exec((texto ?? '').trim());
  return m ? Number(m[1]) / Number(m[2]) : 0;
}

export function origensDaRemissao(tipo: TipoDoMotor, catalogo: readonly TipoDoMotor[]): Origem[] {
  const r = tipo.pena_por_remissao;
  if (!r) return [];
  const f = fracaoDe(r.fracao);
  const fator = r.operador === 'aumento' ? 1 + f : r.operador === 'diminuicao' ? 1 - f : 1;
  return catalogo
    .filter(
      (x) =>
        x.id !== tipo.id &&
        x.lei === r.lei_fonte &&
        (r.artigos_fonte ?? []).some((a) => (x.artigo ?? '').startsWith(a)) &&
        !x.pena_por_remissao,
    )
    .map((x) => ({tipo: x, penaMin: x.pena_min_meses * fator, penaMax: x.pena_max_meses * fator}));
}

const ROTULO: Record<string, string> = {cabivel: 'cabe', condicional: 'depende', incabivel: 'não cabe'};

/**
 * Um tipo do catálogo avaliado por um atributo. É o ponto de entrada de toda
 * avaliação de tipo — varredura, simulação, ficha e derivação —, para que nenhuma
 * leia a pena zero de um tipo de remissão.
 *
 * `montar` transforma um tipo em cenário: `cenarioParaCrime(t, rev)` na
 * varredura e na simulação, `cenarioFromCrime` na ficha do tipo.
 */
export function avaliarTipo(
  def: AtributoDef,
  params: Parametros,
  tipo: TipoDoMotor,
  catalogo: readonly TipoDoMotor[],
  montar: (t: TipoDoMotor) => Cenario,
): AtributoResultado {
  if (!tipo.pena_por_remissao) return avaliarAtributo(def, montar(tipo), params);
  const origens = origensDaRemissao(tipo, catalogo);
  if (!origens.length) {
    // O validador do catálogo (validar_pena_por_remissao) impede remissão para o
    // vazio; se ela chegar aqui, a resposta honesta é não afirmar nada.
    return {
      ...avaliarAtributo(def, montar(tipo), params),
      status: 'condicional',
      resumo: 'Origem da pena não encontrada no catálogo.',
      detalhes: [],
      valor: undefined,
      limiar: undefined,
    };
  }
  const resultados = origens.map((o) => ({
    o,
    r: avaliarAtributo(def, montar({...tipo, pena_min_meses: o.penaMin, pena_max_meses: o.penaMax}), params),
  }));
  const [primeiro] = resultados;
  const concordam = resultados.every(
    ({r}) => r.status === primeiro.r.status && (r.valor ?? '') === (primeiro.r.valor ?? ''),
  );
  if (concordam) return primeiro.r;
  return {
    ...primeiro.r,
    status: 'condicional',
    resumo: 'Depende da origem da pena.',
    detalhes: resultados.map(
      ({o, r}) => `${o.tipo.artigo} (${o.tipo.crime}): ${ROTULO[r.status]}${r.valor ? ` · ${r.valor}` : ''}`,
    ),
    valor: undefined,
    limiar: undefined,
  };
}
