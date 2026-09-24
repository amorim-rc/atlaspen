// Construção do cenário de cálculo a partir de um tipo penal do catálogo.

import type {Cenario, TipoDoMotor} from './types';
import {ehTituloXII} from './dosimetria/aplicaveis';
import {hojeISO} from './tempo';

/**
 * Cenário inicial de um tipo penal: penas cominadas + características objetivas
 * lidas do catálogo, com o réu presumido primário e de bons antecedentes.
 *
 * Tudo o que é campo do TIPO (hediondez, violência, culpa, resultado morte,
 * previsão de perdão judicial) vem do catálogo; o que é circunstância do RÉU ou do
 * caso concreto (primariedade, confissão, reparação) recebe um padrão neutro e
 * é ajustável na simulação.
 */
/** Um dia, em meses — o mínimo legal da pena privativa (CP, art. 11). */
const UM_DIA = 1 / 30;

/**
 * A pena de partida da aba concreta: a mínima cominada.
 *
 * **Quando a lei não comina mínimo** — os arts. 36 a 42 da Lei 6.538/78 dizem
 * só "detenção, até seis meses" —, o mínimo é o do art. 11 do CP: UM DIA.
 * Nunca o máximo, e nunca o mínimo de outro diploma.
 *
 * Decisão 24, de 23/09/2026, e ela corrigiu um erro que estava aqui: com
 * `pena_min_meses` igual a zero, o `||` caía no máximo, e a ficha do art. 36
 * abria com oito anos de pena aplicada. Presumir o teto contra o réu é o
 * oposto do que a falta de mínimo significa. Aplicar por analogia o art. 284
 * do Código Eleitoral ou o art. 58 do CPM seria o mesmo vício, com outra
 * roupa: integração *in malam partem*.
 */
function penaConcretaPadrao(c: TipoDoMotor): number {
  if (c.pena_min_meses > 0) return c.pena_min_meses;
  if (c.pena_max_meses > 0) return UM_DIA;
  return 12;
}

export function cenarioFromCrime(c: TipoDoMotor): Cenario {
  return {
    penaMin: c.pena_min_meses,
    penaMax: c.pena_max_meses,
    penaConcreta: penaConcretaPadrao(c),
    reincidencia: 'primario',
    hediondo: c.hediondo === 'Sim',
    resultadoMorte: c.resultado_morte === true,
    // Feminicídio deriva do NOME do tipo, pela mesma razão que `resultado_morte`
    // (convenção C5): o `obs` descreve os demais parágrafos do artigo e produziria
    // falso positivo. É o que aciona a alínea "d" do art. 112, VI da LEP.
    feminicidio: /feminic[íi]dio/i.test(c.crime ?? ''),
    // Circunstância do caso concreto: parte-se de "não", e quem conhece os autos
    // marca na simulação.
    comandoOrgcrimUltraviolenta: false,
    // Topográfico, e por isso lido do próprio registro: basta o tipo estar nos
    // arts. 359-A a 359-T do CP. O art. 112 da LEP os ressalva sem perguntar se
    // a conduta foi violenta — o art. 359-L (abolição violenta) e o art. 359-M
    // (golpe de Estado) são violentos por definição típica e ainda assim entram.
    tituloXII: ehTituloXII(c.lei ?? '', c.artigo ?? ''),
    // Também pelo dispositivo, e não pelo nome: o homicídio com aumento do
    // art. 121, §6º, fala em "milícia privada" no nome e não é o crime de
    // constituição de milícia. A mesma detecção de CP do Título XII (CPM fora).
    miliciaPrivada:
      /^CP(?![A-Z])/.test(c.lei ?? '') && /^Art\.?\s*288\s*-\s*A\b/i.test(c.artigo ?? ''),
    // Parte-se do fato de HOJE, e portanto da lei vigente. Quem consulta um
    // fato anterior muda a data na simulação, e o motor escolhe sozinho a
    // redação de cada lei que incide (src/lib/tempo.ts).
    dataDoFato: hojeISO(),
    violencia: c.violencia === 'Sim',
    graveAmeaca: c.grave_ameaca === 'Sim',
    violenciaCondicao: c.violencia_condicao ?? undefined,
    confessou: false,
    reparouDano: false,
    bonsAntecedentes: true,
    culposo: c.elemento === 'Culposo',
    admiteTentativa: c.tentativa === 'Sim',
    perdaoJudicialPrevisto: c.perdao_judicial_previsto === true,
    contravencao: c.contravencao === true,
    semPenaPrivativa: c.tem_pena_privativa === false,
    multaIsolada: c.tem_pena_privativa === false && c.tipo_pena === 'Multa',
    // Pelo diploma, como o CPM é reconhecido no resto do motor.
    justicaMilitar: /^CPM/.test(c.lei ?? ''),
  };
}
