// Motor da dosimetria por fases (art. 68 do CP), sem catálogo embutido.
//
// Recebe os modificadores por parâmetro, como o motor de atributos recebe o
// catálogo: nada aqui importa data/modificadores.json. Quem liga os
// modificadores reais é index.ts; os testes passam modificadores fictícios.
//
// A ordem das fases é normativa, não cosmética — cada uma incide sobre a base
// produzida pela anterior, e os limites são diferentes:
//
//   1ª  pena-base .......... mínimo + Σ(1/8 do intervalo por circunstância
//                            judicial desfavorável), PRESA à moldura
//   2ª  pena intermediária . pena-base ± Σ(fração da pena-base), PRESA à
//                            moldura — piso é a Súmula 231 do STJ
//   3ª  pena definitiva .... intermediária ± Σ(fração da intermediária),
//                            LIVRE: pode ficar abaixo do mínimo ou acima do
//                            máximo legal
//
// É essa assimetria da 3ª fase que permite, por exemplo, a tentativa levar a
// pena abaixo do mínimo cominado.

import type {Crime} from '../types';
import type {
  ModificadorDoMotor,
  PassoCalculo,
  ResultadoConcurso,
  ResultadoDosimetria,
  SelecaoModificador,
} from './types';

/** A moldura sobre a qual a dosimetria corre: basta a pena mínima e a máxima. */
export type Moldura = Pick<Crime, 'pena_min_meses' | 'pena_max_meses'>;

/** Índice por id de uma lista de modificadores. */
export function indexarModificadores<M extends ModificadorDoMotor>(lista: readonly M[]): Record<string, M> {
  return Object.fromEntries(lista.map((m) => [m.id, m]));
}

const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Art. 11 do Código Penal: *"Desprezam-se, nas penas privativas de liberdade e
 * nas restritivas de direitos, as frações de dia"*.
 *
 * Duas coisas, e o motor errava as duas. A primeira é a UNIDADE: o que se
 * despreza é a fração de **dia** — as horas —, não a fração de mês. A segunda é
 * a OPERAÇÃO: **despreza-se**, não se arredonda. Arredondar pode subir a pena,
 * e agravar por analogia é o que o art. 11 existe para impedir.
 *
 * O desprezo incide sobre o EFEITO — o quanto se soma ou se subtrai —, não
 * sobre o resultado. Pena de 6 meses e 15 dias, reduzida de 1/6: a extração é
 * de 1 mês, 2 dias e 12 horas; desprezam-se as 12 horas, extraem-se 1 mês e 2
 * dias, e a pena final é de 5 meses e 13 dias. Truncar o resultado daria 5
 * meses e 12 dias — um dia a menos, por conta errada.
 *
 * `Math.trunc` corre para o zero, o que é o certo nos dois sentidos: na
 * diminuição subtrai-se menos, no aumento soma-se menos.
 */
const desprezarFracaoDeDia = (meses: number) => {
  // O épsilon protege do binário: 1,0666… × 30 pode dar 31,999999999999996.
  const dias = Math.trunc(meses * 30 + Math.sign(meses) * 1e-9);
  return dias / 30;
};

/** Fração efetiva de uma seleção: a escolhida, ou a mínima do modificador. */
function fracaoDe(sel: SelecaoModificador, m: ModificadorDoMotor): number {
  if (sel.fracao !== undefined) return sel.fracao;
  return m.fracao_min ?? 0;
}

/**
 * Percorre as três fases sobre a moldura do tipo penal.
 *
 * `selecoes` são os modificadores marcados pelo usuário; os de natureza
 * `concurso` são ignorados aqui (têm cálculo próprio em `calcularConcurso`).
 * Seleção cujo id não está em `porId` é ignorada.
 *
 * `opcoes.penaBase` parte a 1ª fase de outro ponto da moldura que não o mínimo
 * (em meses; presa à moldura como sempre). Serve para deslocar o MÁXIMO da
 * moldura com os mesmos limites de cada fase (moldura.ts). Sem ela, o cálculo
 * é o de sempre.
 */
export function calcularDosimetria(
  crime: Moldura,
  selecoes: SelecaoModificador[],
  porId: Record<string, ModificadorDoMotor>,
  opcoes: {penaBase?: number} = {},
): ResultadoDosimetria {
  const minimo = crime.pena_min_meses;
  const maximo = crime.pena_max_meses;
  const intervalo = Math.max(maximo - minimo, 0);
  const passos: PassoCalculo[] = [];

  const ativos = selecoes
    .map((s) => ({sel: s, mod: porId[s.id]}))
    .filter((x): x is {sel: SelecaoModificador; mod: ModificadorDoMotor} => Boolean(x.mod))
    .filter((x) => x.mod.natureza !== 'concurso');

  // ── 1ª fase — pena-base (art. 59) ─────────────────────────────────────────
  let penaBase = opcoes.penaBase ?? minimo;
  for (const {sel, mod} of ativos.filter((x) => x.mod.fase === 1)) {
    const fracao = fracaoDe(sel, mod);
    // O desprezo do art. 11 incide sobre o EFEITO, antes de somar — é isso que
    // mantém a pena na grade do dia inteiro e dá o resultado que a doutrina
    // ensina. Truncar só o acumulado produziria um dia a menos.
    const efeito = desprezarFracaoDeDia(intervalo * fracao);
    penaBase += efeito;
    passos.push({fase: 1, modificador: mod.nome, dispositivo: mod.dispositivo, fracao, efeito});
  }
  penaBase = desprezarFracaoDeDia(limitar(penaBase, minimo, maximo));

  // ── 2ª fase — agravantes e atenuantes (arts. 61-66) ───────────────────────
  let intermediaria = penaBase;
  for (const {sel, mod} of ativos.filter((x) => x.mod.fase === 2)) {
    const fracao = fracaoDe(sel, mod);
    const bruto = penaBase * fracao; // incide sempre sobre a PENA-BASE
    const efeito = desprezarFracaoDeDia(mod.natureza === 'atenuante' ? -bruto : bruto);
    intermediaria += efeito;
    passos.push({fase: 2, modificador: mod.nome, dispositivo: mod.dispositivo, fracao, efeito});
  }
  const semLimite2 = intermediaria;
  intermediaria = desprezarFracaoDeDia(limitar(intermediaria, minimo, maximo));
  const sumula231Aplicada = semLimite2 < minimo;
  const tetoAplicado = semLimite2 > maximo;

  // ── 3ª fase — causas de aumento e diminuição ──────────────────────────────
  let definitiva = intermediaria;
  for (const {sel, mod} of ativos.filter((x) => x.mod.fase === 3)) {
    const fracao = fracaoDe(sel, mod);
    const bruto = intermediaria * fracao; // incide sobre a INTERMEDIÁRIA
    const efeito = desprezarFracaoDeDia(mod.natureza === 'diminuicao' ? -bruto : bruto);
    definitiva += efeito;
    passos.push({fase: 3, modificador: mod.nome, dispositivo: mod.dispositivo, fracao, efeito});
  }
  // A 3ª fase não se prende à moldura; só não pode ser negativa.
  definitiva = desprezarFracaoDeDia(Math.max(definitiva, 0));

  return {
    minimo,
    maximo,
    penaBase,
    penaIntermediaria: intermediaria,
    penaDefinitiva: definitiva,
    sumula231Aplicada,
    tetoAplicado,
    passos,
  };
}

/**
 * Concurso de crimes (arts. 69-71) sobre penas JÁ definitivas.
 *
 * Regra do art. 70, par. único (concurso material benéfico): se a exasperação
 * resultar em pena maior que a soma do cúmulo material, aplica-se a soma.
 */
export function calcularConcurso(
  penas: number[],
  modalidade: 'material' | 'formal' | 'continuado',
  fracao = 1 / 6,
): ResultadoConcurso {
  const validas = penas.filter((p) => p > 0);
  const soma = desprezarFracaoDeDia(validas.reduce((a, b) => a + b, 0));
  const maior = validas.length ? Math.max(...validas) : 0;

  if (modalidade === 'material') {
    return {
      modalidade: 'Concurso material',
      dispositivo: 'CP, art. 69',
      total: soma,
      memoria: `Soma das ${validas.length} penas (cúmulo material).`,
    };
  }

  const exasperada = desprezarFracaoDeDia(maior * (1 + fracao));
  const rotulo = modalidade === 'formal' ? 'Concurso formal próprio' : 'Crime continuado';
  const disp = modalidade === 'formal' ? 'CP, art. 70' : 'CP, art. 71';
  const fracaoTxt = `${Math.round(fracao * 100)}%`;

  if (exasperada > soma) {
    return {
      modalidade: `${rotulo} (limitado pelo cúmulo material)`,
      dispositivo: `${disp}, c/c art. 70, par. único`,
      total: soma,
      memoria: `Maior pena (${maior}) + ${fracaoTxt} = ${exasperada}, que excede a soma ` +
        `(${soma}); pelo art. 70, par. único, aplica-se a soma.`,
    };
  }
  return {
    modalidade: rotulo,
    dispositivo: disp,
    total: exasperada,
    memoria: `Maior pena (${maior}) aumentada de ${fracaoTxt}.`,
  };
}
