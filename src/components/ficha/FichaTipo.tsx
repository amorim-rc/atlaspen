// A ficha do tipo penal — ilha React das abas (design_handoff_atlaspen/09, item 1;
// Ficha do tipo penal.dc.html, 7a e 7b).
//
// Cominada e concreta não estão em relação de derivação: a pena da sentença não
// sai da moldura simulada, e simular uma alteração legislativa não muda a pena
// que já foi aplicada. Por isso são abas, e cada aba carrega só os atributos
// que aquela pena governa — repartidos pelo campo `natureza`, nunca à mão.
//
// Cada aba é uma URL (?modo=), com âncora real: sem JS, as três aparecem
// empilhadas; com JS, uma por vez, e o script do <head> da página já esconde as
// outras antes da hidratação, para nada saltar.

import {useEffect, useMemo, useState, type KeyboardEvent} from 'react';
import type {Crime} from '../../lib/types';
import type {ModificadorDoMotor} from '../../lib/dosimetria/types';
import {indexarModificadores} from '../../lib/dosimetria/motor';
import {moverMoldura} from '../../lib/dosimetria/moldura';
import {cenarioFromCrime} from '../../lib/cenario';
import {diasDeMeses, formatDias, formatFaixa} from '../../lib/pena';
import {ESTADO_LEGAL, escreverEstado, lerEstado, type EstadoFicha, type Modo} from './estado';
import PainelCominada from './PainelCominada';
import PainelConcreta from './PainelConcreta';
import PainelHistorico, {type DadosHistorico} from './PainelHistorico';
import s from './ficha.module.css';

export interface PropsFicha {
  crime: Crime;
  /** Os modificadores que deslocam a moldura deste tipo (agravantes, atenuantes, causas). */
  modificadores: ModificadorDoMotor[];
  /** Os patamares de pena da família do artigo, em dias: os atalhos do campo de pena. */
  patamares: number[];
  /** O histórico do artigo; `null` tira a aba (registro fora de vigência). */
  historico: DadosHistorico | null;
}

const ROTULO: Record<Modo, string> = {
  cominada: 'Pena cominada',
  concreta: 'Pena concreta',
  historico: 'Histórico',
};

/** Em tela estreita as abas dividem a linha com o resumo da pena (Atributo, bordas e chrome.dc.html, 8f). */
const ROTULO_CURTO: Record<Modo, string> = {
  cominada: 'Cominada',
  concreta: 'Concreta',
  historico: 'Histórico',
};

export default function FichaTipo({crime, modificadores, patamares, historico}: PropsFicha) {
  const modos: Modo[] = historico ? ['cominada', 'concreta', 'historico'] : ['cominada', 'concreta'];
  const porId = useMemo(() => indexarModificadores(modificadores), [modificadores]);
  const legal = useMemo(
    () => ({
      min: diasDeMeses(crime.pena_min_meses),
      max: diasDeMeses(crime.pena_max_meses),
      concreta: diasDeMeses(cenarioFromCrime(crime).penaConcreta),
    }),
    [crime],
  );

  const [montado, setMontado] = useState(false);
  const [e, setE] = useState<EstadoFicha>(ESTADO_LEGAL);

  useEffect(() => {
    const ler = () => setE(lerEstado(window.location.search, modos));
    ler();
    setMontado(true);
    window.addEventListener('popstate', ler);
    return () => window.removeEventListener('popstate', ler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O estado vai para a URL sem entrar no histórico do navegador: editar não
  // polui o botão voltar. Só a troca de aba empilha (irPara).
  useEffect(() => {
    if (!montado) return;
    const atual = window.location.pathname + window.location.search + window.location.hash;
    const novo = window.location.pathname + escreverEstado(e, legal) + window.location.hash;
    if (novo !== atual) window.history.replaceState(null, '', novo);
    document.documentElement.dataset.modoFicha = e.modo;
  }, [e, montado, legal]);

  const atualizar = (patch: Partial<EstadoFicha>) => setE((a) => ({...a, ...patch}));

  const irPara = (modo: Modo) => {
    const novo = {...e, modo};
    setE(novo);
    window.history.pushState(null, '', window.location.pathname + escreverEstado(novo, legal));
    document.getElementById(`aba-${modo}`)?.focus();
  };

  const teclas = (ev: KeyboardEvent<HTMLAnchorElement>) => {
    const i = modos.indexOf(e.modo);
    const alvo =
      ev.key === 'ArrowRight' ? modos[(i + 1) % modos.length]
      : ev.key === 'ArrowLeft' ? modos[(i - 1 + modos.length) % modos.length]
      : ev.key === 'Home' ? modos[0]
      : ev.key === 'End' ? modos[modos.length - 1]
      : null;
    if (alvo) {
      ev.preventDefault();
      irPara(alvo);
    }
  };

  // A moldura da aba cominada: a legal, ou a editada, deslocada pelos elementos marcados.
  const base = {min: e.penaMin ?? legal.min, max: e.penaMax ?? legal.max};
  const ordenada = {min: Math.min(base.min, base.max), max: Math.max(base.min, base.max)};
  const faixa = useMemo(
    () => moverMoldura(ordenada, e.mod, porId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ordenada.min, ordenada.max, e.mod, porId],
  );
  const penaConcreta = e.concreta ?? legal.concreta;

  const resumoDaAba =
    e.modo === 'cominada' ? formatFaixa(faixa.min, faixa.max)
    : e.modo === 'concreta' ? formatDias(penaConcreta)
    : historico ? `${historico.eventos.length} ${historico.eventos.length === 1 ? 'evento' : 'eventos'}`
    : '';

  const visivel = (m: Modo) => !montado || e.modo === m;

  return (
    <div className={s.fichaInterativa}>
      {e.em && (
        <p className={s.avisoReservado}>
          O endereço traz <code>em={e.em}</code>, a data do fato. O parâmetro está reservado ao eixo
          temporal e ainda não altera a ficha: a redação de cada dispositivo em cada data entra com a
          cadeia completa do histórico legislativo (frente 11 do backlog). O que se lê abaixo é a lei
          vigente.
        </p>
      )}

      <div className={`${s.abas} nao-imprimir`}>
        <div role="tablist" aria-label="Modos da ficha" className={s.listaAbas}>
          {modos.map((m) => (
            <a
              key={m}
              id={`aba-${m}`}
              role="tab"
              href={`?modo=${m}`}
              aria-selected={e.modo === m}
              aria-controls={`painel-${m}`}
              tabIndex={e.modo === m ? 0 : -1}
              className={`${s.aba} ${e.modo === m ? s.abaAtiva : ''}`}
              onClick={(ev) => {
                ev.preventDefault();
                irPara(m);
              }}
              onKeyDown={teclas}
              aria-label={ROTULO[m]}
            >
              <span className={s.rotuloLongo}>{ROTULO[m]}</span>
              <span className={s.rotuloCurto} aria-hidden="true">
                {ROTULO_CURTO[m]}
              </span>
            </a>
          ))}
        </div>
        <span className={s.resumoAba} aria-hidden="true">
          {resumoDaAba}
        </span>
      </div>

      {visivel('cominada') && (
        <PainelCominada
          crime={crime}
          estado={e}
          atualizar={atualizar}
          legal={legal}
          base={base}
          faixa={faixa}
          modificadores={modificadores}
          patamares={patamares}
          irPara={irPara}
        />
      )}
      {visivel('concreta') && (
        <PainelConcreta
          crime={crime}
          estado={e}
          atualizar={atualizar}
          pena={penaConcreta}
          legal={legal}
          patamares={patamares}
          irPara={irPara}
        />
      )}
      {historico && visivel('historico') && <PainelHistorico dados={historico} />}
    </div>
  );
}
