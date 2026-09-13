// A régua da moldura — leitura, não controle (design_handoff_reestruturacao/07).
//
// Não arrastável, sem punhos. A faixa sólida é a moldura legal, em tinta; a
// tracejada, a moldura com os elementos marcados, no acento suave. Escala
// logarítmica só para caber quatro ordens de grandeza (dias a décadas), e por
// isso rotulada como não proporcional: não serve para comparar magnitudes.

import {formatFaixa, PENA_MAXIMA_ENTRADA} from '../../lib/pena';
import s from './ficha.module.css';

interface Props {
  legal: {min: number; max: number};
  simulada: {min: number; max: number};
}

const MARCAS: [number, string][] = [
  [30, '1m'],
  [180, '6m'],
  [360, '1a'],
  [720, '2a'],
  [1440, '4a'],
  [2880, '8a'],
  [7200, '20a'],
  [14400, '40a'],
];

const TOPO = Math.log1p(PENA_MAXIMA_ENTRADA / 30);
const pos = (dias: number) => `${(Math.log1p(Math.max(0, dias) / 30) / TOPO) * 100}%`;
const larg = (a: number, b: number) =>
  `calc(${pos(Math.max(a, b))} - ${pos(Math.min(a, b))})`;

export default function Regua({legal, simulada}: Props) {
  const mudou = legal.min !== simulada.min || legal.max !== simulada.max;
  return (
    <div className={s.regua}>
      <div
        className={s.reguaTrilho}
        role="img"
        aria-label={`Moldura legal: ${formatFaixa(legal.min, legal.max)}${
          mudou ? `. Com os elementos marcados: ${formatFaixa(simulada.min, simulada.max)}` : ''
        }.`}
      >
        {mudou && (
          <span
            className={s.reguaSimulada}
            style={{left: pos(simulada.min), width: larg(simulada.min, simulada.max)}}
          />
        )}
        <span className={s.reguaLegal} style={{left: pos(legal.min), width: larg(legal.min, legal.max)}} />
        {MARCAS.map(([d, r]) => (
          <span key={r} className={s.reguaMarca} style={{left: pos(d)}} aria-hidden="true">
            {r}
          </span>
        ))}
      </div>
      <p className={s.reguaLegenda}>
        <span>
          <i className={s.legLegal} aria-hidden="true" /> moldura legal
        </span>
        <span>
          <i className={s.legSimulada} aria-hidden="true" /> com os elementos marcados
        </span>
        <span>escala logarítmica, não proporcional</span>
      </p>
    </div>
  );
}
