// Aba Pena cominada: os atributos que se resolvem só com a moldura, a espécie
// de pena e as qualificações do tipo — nenhum depende de pena aplicada.
//
// O simulador de moldura (design_handoff_reestruturacao/03 e 07) fica recolhido:
// a vista inicial é a do desenho de alta fidelidade (7a), e quem quer estudar
// outra moldura abre o painel. Aberto, ele mostra a moldura se mover — sem
// "fase", sem "pena-base", sem "dosimetria": o motor é interno.

import {useMemo, type MouseEvent} from 'react';
import type {Crime} from '../../lib/types';
import type {ModificadorDoMotor as Modificador, SelecaoModificador} from '../../lib/dosimetria/types';
import {CATALOGO, calcularAtributos} from '../../lib/atributos';
import {contarVereditos, daNatureza} from '../../lib/atributos/veredito';
import {cenarioFromCrime} from '../../lib/cenario';
import {formatDias, formatFaixa, mesesDeDias} from '../../lib/pena';
import type {MolduraDias} from '../../lib/dosimetria/moldura';
import {fracaoPadrao, fracoesEntre, rotuloFracao, type EstadoFicha, type Modo} from './estado';
import CampoPena from './CampoPena';
import Regua from './Regua';
import ListaVereditos from './ListaVereditos';
import s from './ficha.module.css';

interface Props {
  crime: Crime;
  estado: EstadoFicha;
  atualizar: (patch: Partial<EstadoFicha>) => void;
  legal: {min: number; max: number};
  base: MolduraDias;
  faixa: MolduraDias;
  modificadores: Modificador[];
  patamares: number[];
  irPara: (m: Modo) => void;
}

const NATUREZAS = {
  concreto: CATALOGO.filter((d) => d.natureza === 'concreto'),
  incondicionado: CATALOGO.filter((d) => d.natureza === 'incondicionado'),
};

const SINAL: Record<string, string> = {agravante: '+', atenuante: '−', aumento: '+', diminuicao: '−'};

function Atalhos({patamares, onEscolher, rotulo}: {patamares: number[]; onEscolher: (d: number) => void; rotulo: string}) {
  if (!patamares.length) return null;
  return (
    <div className={s.atalhos} aria-label={`Atalhos da ${rotulo}: os patamares do próprio artigo`}>
      {patamares.map((d) => (
        <button key={d} type="button" className={s.ficha} onClick={() => onEscolher(d)}>
          {formatDias(d)}
        </button>
      ))}
    </div>
  );
}

function Elementos({
  modificadores,
  marcados,
  onMudar,
}: {
  modificadores: Modificador[];
  marcados: SelecaoModificador[];
  onMudar: (lista: SelecaoModificador[]) => void;
}) {
  const grupos = [
    {titulo: 'Agravantes e atenuantes', nota: 'presas à moldura legal', itens: modificadores.filter((m) => m.fase === 2)},
    {titulo: 'Causas de aumento e de diminuição', nota: 'rompem a moldura', itens: modificadores.filter((m) => m.fase === 3)},
  ];
  const marcado = (id: string) => marcados.find((x) => x.id === id);
  const alternar = (m: Modificador) => {
    if (marcado(m.id)) onMudar(marcados.filter((x) => x.id !== m.id));
    else {
      const fracao = fracaoPadrao(m.fracao_min, m.fracao_max);
      onMudar([...marcados, fracao !== undefined ? {id: m.id, fracao} : {id: m.id}]);
    }
  };
  const porId = new Map(modificadores.map((m) => [m.id, m]));

  return (
    <div className={s.elementos}>
      {marcados.length > 0 && (
        <ul className={s.fichasMarcadas} aria-label="Elementos marcados">
          {marcados.map((x) => {
            const m = porId.get(x.id);
            if (!m) return null;
            return (
              <li key={x.id}>
                <button type="button" className={s.fichaRemovivel} onClick={() => onMudar(marcados.filter((y) => y.id !== x.id))}>
                  {m.nome}
                  {x.fracao !== undefined && ` · ${SINAL[m.natureza] ?? ''}${rotuloFracao(x.fracao)}`}
                  <span aria-hidden="true"> ×</span>
                  <span className="sr-only">, remover</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {grupos.map((g) =>
        g.itens.length ? (
          <details key={g.titulo} className={s.grupoElementos}>
            <summary>
              <span>{g.titulo}</span>
              <span className={s.contador}>
                {g.itens.filter((m) => marcado(m.id)).length} de {g.itens.length}
              </span>
              <span className={s.notaGrupo}>{g.nota}</span>
            </summary>
            <ul>
              {g.itens.map((m) => {
                const sel = marcado(m.id);
                const opcoes = fracoesEntre(m.fracao_min, m.fracao_max);
                return (
                  <li key={m.id} className={s.elemento}>
                    <label className={s.elementoRotulo}>
                      <input type="checkbox" checked={Boolean(sel)} onChange={() => alternar(m)} />
                      <span>
                        {m.nome}
                        <span className={s.norma}>
                          {m.dispositivo}
                          {opcoes.length === 1 && ` · ${SINAL[m.natureza] ?? ''}${rotuloFracao(opcoes[0])}`}
                        </span>
                      </span>
                    </label>
                    {sel && opcoes.length > 1 && (
                      <label className={s.fracao}>
                        <span className="sr-only">Fração de {m.nome}</span>
                        <select
                          value={String(sel.fracao ?? opcoes[0])}
                          onChange={(ev) =>
                            onMudar(marcados.map((y) => (y.id === m.id ? {id: m.id, fracao: Number(ev.target.value)} : y)))
                          }
                        >
                          {opcoes.map((f) => (
                            <option key={f} value={String(f)}>
                              {SINAL[m.natureza] ?? ''}
                              {rotuloFracao(f)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null,
      )}
    </div>
  );
}

export default function PainelCominada({crime, estado: e, atualizar, legal, base, faixa, modificadores, patamares, irPara}: Props) {
  const resultados = useMemo(
    () =>
      daNatureza(
        calcularAtributos({...cenarioFromCrime(crime), penaMin: mesesDeDias(faixa.min), penaMax: mesesDeDias(faixa.max)}),
        'abstrato',
      ),
    [crime, faixa.min, faixa.max],
  );
  const c = contarVereditos(resultados);
  const emSimulacao =
    (e.penaMin !== null && e.penaMin !== legal.min) || (e.penaMax !== null && e.penaMax !== legal.max) || e.mod.length > 0;
  const outra = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    irPara('concreta');
  };

  return (
    <section id="painel-cominada" data-painel="cominada" role="tabpanel" aria-labelledby="aba-cominada" className={s.painel}>
      <h2 className={s.tituloPainel}>Pena cominada</h2>
      <p className={s.intro}>
        Estes {resultados.length} atributos se resolvem só com a moldura, a espécie de pena e as qualificações do
        tipo. Nenhum depende de pena aplicada.
        {emSimulacao && (
          <>
            {' '}
            <strong className={s.seloSimulacao}>em simulação</strong> — calculados sobre{' '}
            {formatFaixa(faixa.min, faixa.max)}, e não sobre a moldura legal.
          </>
        )}
      </p>

      <details className={`${s.simular} nao-imprimir`} open={emSimulacao || undefined}>
        <summary>
          <span>Simular outra moldura</span>
          <span className={s.notaGrupo}>edite a pena cominada e marque o que a desloca</span>
        </summary>
        <div className={s.simuladorCorpo}>
          <div className={s.camposMoldura}>
            <div>
              <CampoPena
                rotulo="pena mínima"
                dias={base.min}
                legal={legal.min}
                zero="sem mínimo cominado"
                onChange={(d) => atualizar({penaMin: d})}
              />
              <Atalhos rotulo="pena mínima" patamares={patamares} onEscolher={(d) => atualizar({penaMin: d})} />
            </div>
            <div>
              <CampoPena
                rotulo="pena máxima"
                dias={base.max}
                legal={legal.max}
                onChange={(d) => atualizar({penaMax: d})}
              />
              <Atalhos rotulo="pena máxima" patamares={patamares} onEscolher={(d) => atualizar({penaMax: d})} />
            </div>
          </div>
          {base.min > base.max && (
            <p className={s.alerta}>A mínima passou da máxima: a faixa abaixo é calculada com os dois limites trocados.</p>
          )}

          <Elementos modificadores={modificadores} marcados={e.mod} onMudar={(mod) => atualizar({mod})} />

          <div className={s.resultadoMoldura}>
            <span className="rotulo">Resultado da simulação</span>
            <strong className={`${s.faixaSimulada} num`}>{formatFaixa(faixa.min, faixa.max)}</strong>
            <span className={s.notaGrupo}>moldura legal: {crime.pena_faixa_rotulo}</span>
          </div>
          <Regua legal={legal} simulada={faixa} />

          {emSimulacao && (
            <button type="button" className={s.botaoSecundario} onClick={() => atualizar({penaMin: null, penaMax: null, mod: []})}>
              Voltar à moldura legal
            </button>
          )}
        </div>
      </details>

      <p className="sr-only" aria-live="polite">
        {`Pena cominada: ${c.cabe} cabem, ${c.depende} dependem do caso, ${c.naoCabe} não cabem.`}
      </p>
      <ListaVereditos itens={resultados} />

      <p className={s.outraAba}>
        {NATUREZAS.concreto.length} atributos dependem da pena concreta —{' '}
        <a href="?modo=concreta" onClick={outra}>
          ver na outra aba
        </a>
        . {NATUREZAS.incondicionado.length} não dependem de patamar de pena (
        {NATUREZAS.incondicionado.map((d) => d.nome.toLowerCase()).join(' e ')}) e estão no pé daquela aba.
      </p>
    </section>
  );
}
