// A moldura deslocada pelos elementos marcados — o que a aba de pena cominada
// da ficha mostra como faixa tracejada.
//
// Na tela não há vocabulário de dosimetria (design_handoff_reestruturacao/03):
// o usuário vê a moldura se mover. Por dentro, é o mesmo motor das três fases,
// rodado duas vezes — uma a partir do mínimo, outra a partir do máximo. As
// agravantes e as atenuantes ficam presas à moldura (a Súmula 231 no piso, o
// máximo no teto); as causas de aumento e de diminuição a rompem, nos dois
// sentidos. As circunstâncias judiciais do art. 59 (1ª fase) não entram: são
// do caso, não do tipo, e não deslocam a moldura.
//
// Entra e sai em dias inteiros; o motor conta em meses sobre a grade do dia.

import type {ModificadorDoMotor, SelecaoModificador} from './types';
import {calcularDosimetria} from './motor';
import {diasDeMeses, mesesDeDias} from '../pena';

export interface MolduraDias {
  min: number;
  max: number;
}

/** Só os modificadores que deslocam a moldura: agravantes, atenuantes e causas. */
export function deslocaMoldura(m: ModificadorDoMotor): boolean {
  return m.fase === 2 || m.fase === 3;
}

/** O modificador só com o que o motor lê: é o que vai para o navegador. */
export function paraOMotor(m: ModificadorDoMotor): ModificadorDoMotor {
  return {
    id: m.id,
    nome: m.nome,
    dispositivo: m.dispositivo,
    natureza: m.natureza,
    fase: m.fase,
    fracao_min: m.fracao_min,
    fracao_max: m.fracao_max,
  };
}

export function moverMoldura(
  moldura: MolduraDias,
  selecoes: SelecaoModificador[],
  porId: Record<string, ModificadorDoMotor>,
): MolduraDias {
  const validas = selecoes.filter((s) => porId[s.id] && deslocaMoldura(porId[s.id]));
  if (!validas.length) return {...moldura};
  const base = {pena_min_meses: mesesDeDias(moldura.min), pena_max_meses: mesesDeDias(moldura.max)};
  const doMinimo = calcularDosimetria(base, validas, porId).penaDefinitiva;
  const doMaximo = calcularDosimetria(base, validas, porId, {penaBase: base.pena_max_meses}).penaDefinitiva;
  return {min: diasDeMeses(doMinimo), max: diasDeMeses(doMaximo)};
}
