// O controle de um parâmetro do atributo: o patamar, a fração, a vedação.
//
// Pena em campo composto de anos, meses e dias (o mesmo da ficha do tipo), com
// as hipóteses rápidas do próprio parâmetro; fração no modo em que a lei a
// escreve — percentual onde ela diz "25%", fração ordinária onde diz "um
// terço"; vedação como sim ou não. Valor diferente do legal ganha o selo "em
// simulação" com o valor da lei ao lado.

import CampoPena from '../ficha/CampoPena';
import type {ParametroDef} from '../../lib/atributos';
import {diasDeMeses, formatDias} from '../../lib/pena';
import {emPercentual, hipoteses, rotuloFracao, rotuloValor} from './estado';
import s from './atributo.module.css';

export interface AlteracaoResumo {
  norma: string | null;
  ano: number | null;
  url: string | null;
}

interface Props {
  def: ParametroDef;
  valor: number | boolean;
  onChange: (v: number | boolean) => void;
  /** A última alteração legislativa do parâmetro; `null` = não se sabe; ausente = sem dado. */
  ultima?: AlteracaoResumo | null;
}

function opcoesDeFracao(def: ParametroDef, atual: number): number[] {
  const den = Math.round(1 / (def.passo ?? 1 / 24));
  const min = Math.ceil((def.min ?? 0) * den - 1e-9);
  const max = Math.floor((def.max ?? 1) * den + 1e-9);
  const lista: number[] = [];
  for (let k = min; k <= max; k++) lista.push(k / den);
  if (!lista.some((v) => Math.abs(v - atual) < 1e-9)) lista.push(atual);
  return lista.sort((a, b) => a - b);
}

export default function ControleParametro({def, valor, onChange, ultima}: Props) {
  const alterado = valor !== def.padrao;
  const idCampo = `param-${def.id}`;

  let controle;
  if (def.tipo === 'meses') {
    controle = (
      <>
        <CampoPena
          rotulo={def.rotulo}
          dias={diasDeMeses(valor as number)}
          legal={diasDeMeses(def.padrao as number)}
          onChange={(d) => onChange(d / 30)}
        />
        <div className={s.hipoteses} aria-label={`Hipóteses para: ${def.rotulo}`}>
          {hipoteses(def).map((m) => (
            <button
              key={m}
              type="button"
              className={`${s.hipotese} ${Math.abs(m - (valor as number)) < 1e-9 ? s.hipoteseAtiva : ''}`}
              onClick={() => onChange(m)}
            >
              {m === def.padrao ? `vigente — ${formatDias(diasDeMeses(m))}` : m === def.max ? `teto do controle — ${formatDias(diasDeMeses(m))}` : formatDias(diasDeMeses(m))}
            </button>
          ))}
        </div>
      </>
    );
  } else if (def.tipo === 'fracao' && emPercentual(def)) {
    controle = (
      <label className={s.linhaControle} htmlFor={idCampo}>
        <span className={s.rotuloParam}>{def.rotulo}</span>
        <span className={s.campoPercentual}>
          <input
            id={idCampo}
            type="number"
            inputMode="decimal"
            min={(def.min ?? 0) * 100}
            max={(def.max ?? 1) * 100}
            step={1}
            value={Math.round((valor as number) * 10000) / 100}
            onChange={(ev) => {
              const n = Number(ev.target.value);
              if (Number.isFinite(n)) onChange(Math.min(Math.max(n / 100, def.min ?? 0), def.max ?? 1));
            }}
          />
          <span aria-hidden="true">%</span>
        </span>
      </label>
    );
  } else if (def.tipo === 'fracao') {
    controle = (
      <label className={s.linhaControle} htmlFor={idCampo}>
        <span className={s.rotuloParam}>{def.rotulo}</span>
        <select id={idCampo} value={String(valor)} onChange={(ev) => onChange(Number(ev.target.value))}>
          {opcoesDeFracao(def, valor as number).map((v) => (
            <option key={v} value={String(v)}>
              {rotuloFracao(v, false)}
            </option>
          ))}
        </select>
      </label>
    );
  } else if (def.tipo === 'inteiro') {
    controle = (
      <label className={s.linhaControle} htmlFor={idCampo}>
        <span className={s.rotuloParam}>{def.rotulo}</span>
        <input
          id={idCampo}
          type="number"
          inputMode="numeric"
          min={def.min}
          max={def.max}
          step={def.passo ?? 1}
          value={valor as number}
          className={s.campoInteiro}
          onChange={(ev) => {
            const n = Math.round(Number(ev.target.value));
            if (Number.isFinite(n)) onChange(Math.min(Math.max(n, def.min ?? 0), def.max ?? n));
          }}
        />
      </label>
    );
  } else {
    controle = (
      <label className={s.linhaBooleana}>
        <input type="checkbox" checked={valor as boolean} onChange={(ev) => onChange(ev.target.checked)} />
        <span className={s.rotuloParam}>{def.rotulo}</span>
      </label>
    );
  }

  return (
    <div className={`${s.parametro} ${alterado ? s.parametroAlterado : ''}`}>
      {controle}
      <div className={s.metaParam}>
        {alterado ? (
          <span className={s.seloSimulacao}>em simulação · valor legal: {rotuloValor(def, def.padrao)}</span>
        ) : (
          <span className={s.valorLegal}>valor legal: {rotuloValor(def, def.padrao)}</span>
        )}
        {def.fundamento && <span className={s.fundamento}>{def.fundamento}</span>}
        {ultima !== undefined && (
          <span className={s.fundamento}>
            {ultima === null
              ? 'última alteração: não datada'
              : ultima.norma === 'original' || !ultima.norma
                ? 'texto original, sem alteração registrada'
                : <>
                    última alteração:{' '}
                    {ultima.url ? (
                      <a href={ultima.url} rel="noopener" target="_blank">
                        {ultima.norma}
                        {ultima.ano ? `, de ${ultima.ano}` : ''}
                      </a>
                    ) : (
                      `${ultima.norma}${ultima.ano ? `, de ${ultima.ano}` : ''}`
                    )}
                  </>}
          </span>
        )}
        <details className={s.ajuda}>
          <summary>o que este parâmetro representa</summary>
          <p>{def.ajuda}</p>
        </details>
      </div>
    </div>
  );
}
