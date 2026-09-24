// Aba Pena concreta: o que a sentença fixou, e o perfil do condenado.
//
// A pena aplicada não deriva da moldura legal — é a pena da sentença, em dias
// inteiros. Governa os atributos de natureza `concreto`; os de natureza
// `incondicionado` (detração, remição) não têm patamar e ficam no pé, fora da
// lista (design_handoff_atlaspen/09, item 1).
//
// O perfil tem o que o motor distingue, e nada além: a reincidência em quatro
// estados (primário, em crime culposo, em crime doloso, específico), o comando
// de facção ultraviolenta (art. 112, VI, "b", LEP), a DATA DO FATO e, quando o
// tipo a condiciona, a hediondez do caso.
//
// A data do fato entrou em 23/09/2026 (decisão 35) no lugar da caixa "fato
// anterior a 08/05/2026". Uma caixa dava conta de uma lei; já são duas, com
// marcos diferentes, e a próxima não caberia sem uma terceira caixa.

import {useMemo, type MouseEvent} from 'react';
import type {Crime} from '../../lib/types';
import {CATALOGO, calcularAtributos} from '../../lib/atributos';
import {contarVereditos, daNatureza} from '../../lib/atributos/veredito';
import {cenarioFromCrime} from '../../lib/cenario';
import {hojeISO} from '../../lib/tempo';
import {DIAS_POR_ANO, PENA_MAXIMA_ENTRADA, formatContagemDias, formatDias, mesesDeDias} from '../../lib/pena';
import {REINCIDENCIAS, ROTULO_REINCIDENCIA} from '../../lib/atributos/reincidencia';
import {caminho} from '../../site/url';
import type {EstadoFicha, Modo} from './estado';
import CampoPena from './CampoPena';
import ListaVereditos from './ListaVereditos';
import s from './ficha.module.css';

interface Props {
  crime: Crime;
  estado: EstadoFicha;
  atualizar: (patch: Partial<EstadoFicha>) => void;
  pena: number;
  legal: {min: number; max: number; concreta: number};
  patamares: number[];
  irPara: (m: Modo) => void;
}

const ABSTRATOS = CATALOGO.filter((d) => d.natureza === 'abstrato').length;

export default function PainelConcreta({crime, estado: e, atualizar, pena, legal, patamares, irPara}: Props) {
  const hediondoNoCaso = crime.hediondo === 'Sim' || (crime.hediondo_condicional && e.hediondo);
  const todos = useMemo(
    () =>
      calcularAtributos({
        ...cenarioFromCrime(crime),
        penaConcreta: mesesDeDias(pena),
        reincidencia: e.reincidencia,
        comandoOrgcrimUltraviolenta: e.comando,
        dataDoFato: e.em ?? hojeISO(),
        hediondo: hediondoNoCaso,
      }),
    [crime, pena, e.reincidencia, e.comando, e.em, hediondoNoCaso],
  );
  const concretos = daNatureza(todos, 'concreto');
  const incondicionados = daNatureza(todos, 'incondicionado');
  const c = contarVereditos(concretos);

  // A barra vai um pouco além da maior pena da família do artigo, em anos redondos.
  const topo = Math.min(
    PENA_MAXIMA_ENTRADA,
    Math.ceil((Math.max(legal.max, pena, ...patamares, 2 * DIAS_POR_ANO) * 1.25) / DIAS_POR_ANO) * DIAS_POR_ANO,
  );
  const outra = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    irPara('cominada');
  };

  return (
    <section id="painel-concreta" data-painel="concreta" role="tabpanel" aria-labelledby="aba-concreta" className={s.painel}>
      <h2 className={s.tituloPainel}>Pena concreta</h2>
      <p className={s.intro}>
        O que a sentença fixou. Esta pena não deriva da moldura legal: é a pena aplicada, e é ela que governa os{' '}
        {concretos.length} atributos abaixo.
      </p>

      <div className={s.entradaConcreta}>
        <CampoPena rotulo="pena aplicada" dias={pena} legal={legal.concreta} onChange={(d) => atualizar({concreta: d})} />
        <label className={s.barraConcreta}>
          <span className="sr-only">Pena aplicada</span>
          <input
            type="range"
            min={0}
            max={topo}
            step={30}
            value={Math.min(pena, topo)}
            aria-valuetext={formatDias(pena)}
            onChange={(ev) => atualizar({concreta: Number(ev.target.value)})}
          />
          <span className={s.barraLimites} aria-hidden="true">
            <span>0</span>
            <span>{formatDias(topo)}</span>
          </span>
        </label>
        <div className={s.emDias}>
          <span className="rotulo">Em dias inteiros</span>
          <span className="mono num">{formatContagemDias(pena)}</span>
        </div>
      </div>

      <div className={s.perfil}>
        <fieldset className={s.grupoPerfil}>
          <legend className="rotulo">Condenado</legend>
          <div className={s.pilulas} role="radiogroup" aria-label="Reincidência">
            {REINCIDENCIAS.map((r) => (
              <label key={r} className={`${s.pilula} ${e.reincidencia === r ? s.pilulaAtiva : ''}`}>
                <input
                  type="radio"
                  name="reincidencia"
                  className="sr-only"
                  checked={e.reincidencia === r}
                  onChange={() => atualizar({reincidencia: r})}
                />
                {ROTULO_REINCIDENCIA[r]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={s.grupoPerfil}>
          <legend className="rotulo">Circunstâncias do caso</legend>
          {crime.hediondo_condicional && (
            <label className={s.circunstancia}>
              <input type="checkbox" checked={e.hediondo} onChange={(ev) => atualizar({hediondo: ev.target.checked})} />
              <span>
                Hediondo neste caso
                <span className={s.norma}>{crime.hediondo_condicao}</span>
              </span>
            </label>
          )}
          <label className={s.circunstancia}>
            <input type="checkbox" checked={e.comando} onChange={(ev) => atualizar({comando: ev.target.checked})} />
            <span>
              Comando de organização criminosa ultraviolenta
              <span className={s.norma}>
                art. 112, VI, "b", LEP (Lei 15.358/2026) — só pesa em crime hediondo ou equiparado
              </span>
            </span>
          </label>
          <label className={s.circunstancia}>
            <input
              type="date"
              value={e.em ?? hojeISO()}
              max={hojeISO()}
              onChange={(ev) => atualizar({em: ev.target.value || null})}
            />
            <span>
              Data do fato
              <span className={s.norma}>
                a lei do tempo do fato: Lei 15.358/2026 nos hediondos (desde 25/03) e Lei
                15.402/2026 nos comuns (desde 08/05). Lei mais gravosa não retroage.
              </span>
            </span>
          </label>
        </fieldset>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Pena concreta de ${formatDias(pena)}: ${c.cabe} cabem, ${c.depende} dependem do caso, ${c.naoCabe} não cabem.`}
      </p>
      <ListaVereditos itens={concretos} />

      <div className={s.incondicionados}>
        <span className="rotulo">Não dependem do patamar</span>
        <ul>
          {incondicionados.map((r) => (
            <li key={r.id}>
              <span className={s.nomeAtributo}>
                <a href={caminho(`/atributos/${r.id}`)} className={s.linkAtributo}>
                  {r.nome}
                </a>
                <span className={s.norma}>{r.fundamento}</span>
              </span>
              <span className={s.razao}>{r.resumo}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className={s.outraAba}>
        {ABSTRATOS} atributos dependem da pena cominada —{' '}
        <a href="?modo=cominada" onClick={outra}>
          ver na outra aba
        </a>
        .
      </p>
    </section>
  );
}
