// Os controles da premissa da varredura, partilhados pela ficha do atributo e
// pela simulação legislativa.
//
// Extraídos de FichaAtributo em 17/09/2026: as duas telas varrem o catálogo sob
// a mesma presunção, e uma oferecer controles que a outra não oferece era a
// pendência do revamp ("Premissa fixa", backlog.md).

import {BASE_AJUDA, BASE_LABEL, type BasePenaConcreta, type CenarioReverso} from '../../lib/atributos/reverso';
import {diasDeMeses} from '../../lib/pena';
import CampoPena from '../ficha/CampoPena';
import s from './premissa.module.css';

const CIRCUNSTANCIAS: {chave: 'comandoOrgcrimUltraviolenta' | 'confessou' | 'reparouDano'; rotulo: string}[] = [
  {chave: 'comandoOrgcrimUltraviolenta', rotulo: 'comando de orgcrim ultraviolenta'},
  {chave: 'confessou', rotulo: 'confessou'},
  {chave: 'reparouDano', rotulo: 'reparou o dano'},
];

export interface PropsControlesPremissa {
  rev: CenarioReverso;
  onChange: (patch: Partial<CenarioReverso>) => void;
  /** `false` esconde a base de pena: o atributo é abstrato e não presume pena concreta. */
  mostrarBase: boolean;
}

export default function ControlesPremissa({rev, onChange, mostrarBase}: PropsControlesPremissa) {
  return (
    <>
      {mostrarBase && (
        <>
          <div className={s.bases} role="group" aria-label="Pena concreta presumida">
            <span className={s.rotuloBases}>Pena concreta presumida:</span>
            {(Object.keys(BASE_LABEL) as BasePenaConcreta[]).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={rev.base === b}
                className={`${s.base} ${rev.base === b ? s.baseAtiva : ''}`}
                onClick={() => onChange({base: b})}
              >
                {BASE_LABEL[b]}
              </button>
            ))}
          </div>
          {rev.base === 'fixa' && (
            <CampoPena
              rotulo="pena concreta fixa"
              dias={diasDeMeses(rev.penaFixaMeses)}
              onChange={(d) => onChange({penaFixaMeses: d / 30})}
            />
          )}
          <p className={s.ajudaBase}>
            {BASE_AJUDA[rev.base]} Os números abaixo valem sob esta premissa e mudam se ela mudar.
          </p>
        </>
      )}
      <div className={s.circunstancias}>
        <span className={s.notaMono}>circunstâncias do réu aplicadas a todo o catálogo</span>
        <button
          type="button"
          aria-pressed={rev.reincidencia === 'especifico'}
          className={`${s.chip} ${rev.reincidencia === 'especifico' ? s.chipAtivo : ''}`}
          onClick={() => onChange({reincidencia: rev.reincidencia === 'especifico' ? 'primario' : 'especifico'})}
        >
          reincidente específico
        </button>
        {CIRCUNSTANCIAS.map((c) => (
          <button
            key={c.chave}
            type="button"
            aria-pressed={rev[c.chave]}
            className={`${s.chip} ${rev[c.chave] ? s.chipAtivo : ''}`}
            onClick={() => onChange({[c.chave]: !rev[c.chave]})}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
      <p className={`${s.notaMono} sem-recuo`}>
        Hediondez, violência, grave ameaça, culpa, resultado morte e previsão de perdão judicial não entram aqui: são
        campos de cada tipo penal, lidos do catálogo dispositivo a dispositivo.
      </p>
    </>
  );
}
