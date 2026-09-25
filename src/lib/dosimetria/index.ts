// Dosimetria por fases (art. 68 do CP) — ligação com os modificadores reais.
//
// O cálculo mora em motor.ts e recebe os modificadores por parâmetro. Este
// módulo é o único da dosimetria que importa data/modificadores.json, e mantém
// a assinatura de sempre: `calcularDosimetria(crime, selecoes)` corre sobre os
// modificadores do catálogo quando ninguém passa outros.
//
// Um MODIFICADOR não é tipo penal: é um componente que desloca a moldura de
// pena. É aplicado sobre a linha do catálogo no momento da consulta — nenhum
// campo de crimes.json muda.

// Caminho relativo (e não um alias) para que o módulo resolva tanto no
// bundler do site quanto no tsc/node do `npm run verificar`.
import brutos from '../../../data/modificadores.json';
import type {Modificador, ResultadoDosimetria, SelecaoModificador} from './types';
import {
  calcularDosimetria as calcularSobre,
  indexarModificadores,
  type Moldura,
} from './motor';

export {calcularConcurso} from './motor';
export type {Moldura} from './motor';

export const MODIFICADORES = (brutos as {modificadores: Modificador[]}).modificadores;

export const POR_ID: Record<string, Modificador> = indexarModificadores(MODIFICADORES);

/** Percorre as três fases com os modificadores do catálogo, ou com os passados. */
export function calcularDosimetria(
  crime: Moldura,
  selecoes: SelecaoModificador[],
  porId: Record<string, Modificador> = POR_ID,
  opcoes: {penaBase?: number} = {},
): ResultadoDosimetria {
  return calcularSobre(crime, selecoes, porId, opcoes);
}
