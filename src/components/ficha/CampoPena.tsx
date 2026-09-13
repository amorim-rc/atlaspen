// Campo composto de pena: anos, meses e dias (design_handoff_reestruturacao/07, 3a).
//
// Três casas sempre visíveis, nunca um seletor de unidade. Casa vazia conta
// como zero, e o zero sai em tinta fraca para o olho ir ao valor preenchido.
// Normaliza ao SAIR do campo, não a cada tecla — normalizar durante a digitação
// rouba o cursor: 18 meses viram "1 ano e 6 meses" no blur. A soma legível
// abaixo das casas é a única coisa anunciada aos leitores de tela.

import {useEffect, useId, useState} from 'react';
import {compor, decompor, formatDias, limitarPena, type PenaComposta} from '../../lib/pena';
import s from './ficha.module.css';

interface Props {
  /** Rótulo do campo, em minúsculas ("pena mínima"). */
  rotulo: string;
  dias: number;
  onChange: (dias: number) => void;
  /** O que dizer quando a pena é zero. */
  zero?: string;
  /** Valor legal, para marcar o campo quando dele difere. */
  legal?: number;
}

type Casas = Record<keyof PenaComposta, string>;

const CASAS: {chave: keyof PenaComposta; unidade: string}[] = [
  {chave: 'anos', unidade: 'anos'},
  {chave: 'meses', unidade: 'meses'},
  {chave: 'dias', unidade: 'dias'},
];

function paraCasas(dias: number): Casas {
  const p = decompor(dias);
  return {anos: String(p.anos), meses: String(p.meses), dias: String(p.dias)};
}

function paraDias(c: Casas): number {
  const n = (t: string) => (/^\d+$/.test(t.trim()) ? Number(t) : 0);
  return limitarPena(compor({anos: n(c.anos), meses: n(c.meses), dias: n(c.dias)}));
}

export default function CampoPena({rotulo, dias, onChange, zero = 'zero', legal}: Props) {
  const id = useId();
  const [casas, setCasas] = useState<Casas>(() => paraCasas(dias));
  const [editando, setEditando] = useState(false);

  // Valor que muda por fora (atalho, "voltar à lei") entra nas casas — mas não
  // enquanto a pessoa digita.
  useEffect(() => {
    if (!editando) setCasas(paraCasas(dias));
  }, [dias, editando]);

  const mudar = (chave: keyof PenaComposta, valor: string) => {
    const limpo = valor.replace(/\D/g, '').slice(0, 5);
    const novas = {...casas, [chave]: limpo};
    setCasas(novas);
    onChange(paraDias(novas));
  };

  const sair = () => {
    setEditando(false);
    setCasas(paraCasas(paraDias(casas)));
  };

  const alterado = legal !== undefined && dias !== legal;

  return (
    <fieldset className={`${s.campoPena} ${alterado ? s.campoAlterado : ''}`}>
      <legend className="rotulo">{rotulo}</legend>
      <div className={s.casas}>
        {CASAS.map(({chave, unidade}) => {
          const valor = casas[chave];
          const vazio = valor === '' || Number(valor) === 0;
          return (
            <label key={chave} className={s.casa}>
              <input
                id={`${id}-${chave}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                className={`${s.casaInput} ${vazio ? s.casaZero : ''}`}
                value={valor}
                aria-label={`${rotulo}, ${unidade}`}
                onFocus={() => setEditando(true)}
                onBlur={sair}
                onChange={(ev) => mudar(chave, ev.target.value)}
              />
              <span className={s.casaUnidade}>{unidade}</span>
            </label>
          );
        })}
      </div>
      <p className={s.soma} aria-live="polite">
        = {formatDias(dias, zero)}
      </p>
    </fieldset>
  );
}
