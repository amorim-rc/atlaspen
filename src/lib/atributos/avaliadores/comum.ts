// O que os avaliadores partilham — AtlasPen.
//
// Reúne a constante de tempo, a vedação de livramento do art. 112 da LEP (regra
// de CÁLCULO, lida pela progressão e pelo livramento) e a resposta padrão para o
// crime militar, fora do alcance da Lei 9.099/95. Os avaliadores em si ficam em
// processual.ts, aplicacao.ts e execucao.ts; index.ts os junta.

import type {Cenario} from '../../types';
import type {Avaliacao, Parametros} from '../types';
import {reincidenteEspecifico} from '../reincidencia';

/** Uma função pura por atributo: recebe o cenário e os parâmetros, devolve o veredito. */
export type Avaliador = (c: Cenario, p: Parametros) => Avaliacao;

export const ANO = 12;

/**
 * As quatro hipóteses em que o próprio art. 112 da LEP diz, na letra do inciso,
 * "vedado o livramento condicional": VI, "a", "b" e "d", e VIII. Devolve o
 * fundamento, ou `null` quando nenhuma incide.
 *
 * A vedação vive aqui, e não apenas no texto de `vedacoes`, porque é regra de
 * CÁLCULO. Enquanto ficou só escrita, o motor seguia oferecendo o livramento aos
 * 2/3 a quem a LEP o proíbe — o texto dizia uma coisa e o número dizia outra.
 *
 * A ordem espelha a da progressão: a alínea "b" (comando de facção) não depende
 * do resultado morte e por isso é testada antes da "a".
 */
export function vedacaoLivramentoArt112(c: Cenario): string | null {
  if (c.hediondo && c.resultadoMorte && reincidenteEspecifico(c)) {
    return (
      'Art. 112, VIII, LEP: reincidente em crime hediondo ou equiparado com resultado ' +
      'morte — 85% da pena, vedado o livramento condicional.'
    );
  }
  if (c.comandoOrgcrimUltraviolenta && c.hediondo) {
    return (
      'Art. 112, VI, "b", LEP (redação da Lei 15.358/2026): condenado por exercer o ' +
      'comando, individual ou coletivo, de organização criminosa ultraviolenta ' +
      'estruturada para a prática de crime hediondo ou equiparado — vedado o livramento ' +
      'condicional.'
    );
  }
  if (c.feminicidio && !reincidenteEspecifico(c)) {
    return (
      'Art. 112, VI, "d", LEP (alínea incluída pela Lei 15.358/2026): primário condenado ' +
      'pela prática de feminicídio — vedado o livramento condicional.'
    );
  }
  if (c.hediondo && c.resultadoMorte) {
    return (
      'Art. 112, VI, "a", LEP: primário condenado por crime hediondo ou equiparado com ' +
      'resultado morte — vedado o livramento condicional.'
    );
  }
  return null;
}

/**
 * Lei 9.099/95, art. 90-A, incluído pela Lei 9.839/1999: "As disposições desta
 * Lei não se aplicam no âmbito da Justiça Militar." Nem transação penal nem
 * suspensão condicional do processo nos crimes do CPM.
 */
export function foraDaJusticaMilitar(): Avaliacao {
  return {
    status: 'incabivel',
    resumo: 'Crime militar: a Lei 9.099/95 não se aplica no âmbito da Justiça Militar (art. 90-A).',
    detalhes: [
      'Art. 90-A da Lei 9.099/95, incluído pela Lei 9.839/1999: "As disposições desta Lei não se aplicam no âmbito da Justiça Militar."',
      'Nem a transação penal nem a suspensão condicional do processo alcançam os crimes do CPM.',
    ],
  };
}
