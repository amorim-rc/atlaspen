// A premissa da varredura na URL, em chaves partilhadas pela ficha do atributo
// e pela simulação legislativa.
//
//   ?base=maxima&reincidente=sim
//   ?base=fixa&fixa=3a&antecedentes=nao
//
// O padrão NUNCA é gravado: um link carrega o que foi mexido, e só. Quem cita
// um recorte cita o recorte, e não a tela.
//
// Sem framework de propósito: o codec entra na ilha React da ficha, na ilha do
// simulador e nos scripts de verificação, e não pode arrastar nenhum dos três.

import {diasDeMeses, escreverDuracao, lerDuracao} from '../pena';
import type {BasePenaConcreta, CenarioReverso} from './reverso';
import {cenarioReversoPadrao} from './reverso';

const BASES: BasePenaConcreta[] = ['minima', 'maxima', 'fixa'];

type Circunstancia = 'reincidenteEspecifico' | 'comandoOrgcrimUltraviolenta' | 'confessou' | 'reparouDano';

/** As circunstâncias do réu cujo padrão é `false`: a URL grava `sim` quando ligadas. */
const LIGA: [Circunstancia, string][] = [
  ['reincidenteEspecifico', 'reincidente'],
  ['comandoOrgcrimUltraviolenta', 'comando'],
  ['confessou', 'confessou'],
  ['reparouDano', 'reparou'],
];

export function lerPremissa(q: URLSearchParams): CenarioReverso {
  const rev = cenarioReversoPadrao();
  const base = q.get('base') as BasePenaConcreta | null;
  if (base && BASES.includes(base)) rev.base = base;
  const fixa = q.get('fixa');
  if (fixa) {
    const dias = lerDuracao(fixa);
    if (dias !== null) rev.penaFixaMeses = dias / 30;
  }
  for (const [chave, nome] of LIGA) rev[chave] = q.get(nome) === 'sim';
  // Bons antecedentes é o único cujo padrão é `true`: grava-se a negativa.
  rev.bonsAntecedentes = q.get('antecedentes') !== 'nao';
  return rev;
}

export function escreverPremissa(q: URLSearchParams, rev: CenarioReverso): void {
  const padrao = cenarioReversoPadrao();
  if (rev.base !== padrao.base) q.set('base', rev.base);
  if (rev.base === 'fixa' && rev.penaFixaMeses !== padrao.penaFixaMeses) {
    q.set('fixa', escreverDuracao(diasDeMeses(rev.penaFixaMeses)));
  }
  for (const [chave, nome] of LIGA) if (rev[chave]) q.set(nome, 'sim');
  if (!rev.bonsAntecedentes) q.set('antecedentes', 'nao');
}

export function premissaIgualAoPadrao(rev: CenarioReverso): boolean {
  const p = cenarioReversoPadrao();
  return (Object.keys(p) as (keyof CenarioReverso)[]).every((k) => p[k] === rev[k]);
}
