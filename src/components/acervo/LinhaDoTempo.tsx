// A linha do tempo da lei penal brasileira, de 1822 a hoje
// (Linha do tempo e tela inicial.dc.html, 5a).
//
// Escala linear: cada ano ocupa a mesma largura. É decisão, não conveniência —
// comprimir o século XIX faria o volume legislativo recente parecer normal,
// quando é ele o fato a mostrar. Constituições acima do eixo (losango), códigos
// abaixo (círculo): glifo, e não cor, para sobreviver à impressão em preto. As
// faixas de fundo dizem que constituição vigorava.
//
// Os rótulos nunca se cruzam: os marcos ficam na posição verdadeira e os
// rótulos são afastados até um vão mínimo, com conector em cotovelo, sobre a
// largura MEDIDA do contêiner e refeita a cada redimensionamento.
//
// Passar o mouse pré-visualiza o ano; clicar o fixa (e o leva à URL, ?ano=) e
// recorta a lista do acervo abaixo. No teclado, a faixa de anos é um slider:
// setas andam um ano, Page Up e Page Down dez, Home e End vão às pontas.

import {useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import {caminho} from '../../site/url';
import ListaAcervo from './ListaAcervo';
import type {EventoDoAno, Marco, RegistroAcervo} from './tipos';
import s from './acervo.module.css';

interface Props {
  inicio: number;
  fim: number;
  marcos: Marco[];
  eventos: EventoDoAno[];
  registros: RegistroAcervo[];
  /** A lista abaixo lê e grava os seus filtros na URL (na página /acervo). */
  naUrl?: boolean;
}

/** Que constituição vigorava — as faixas de fundo e o contexto do ano. */
const ERAS: {ini: number; fim: number | null; rotulo: string; curto: string}[] = [
  {ini: 1822, fim: 1824, rotulo: 'Independência', curto: ''},
  {ini: 1824, fim: 1891, rotulo: 'Constituição de 1824', curto: '1824'},
  {ini: 1891, fim: 1934, rotulo: 'Constituição de 1891', curto: '1891'},
  {ini: 1934, fim: 1937, rotulo: 'Constituição de 1934', curto: '1934'},
  {ini: 1937, fim: 1946, rotulo: 'Constituição de 1937', curto: '1937'},
  {ini: 1946, fim: 1967, rotulo: 'Constituição de 1946', curto: '1946'},
  {ini: 1967, fim: 1988, rotulo: 'Constituição de 1967 e EC 1/1969', curto: '1967'},
  {ini: 1988, fim: null, rotulo: 'Constituição de 1988', curto: '1988'},
];

function contextoDe(ano: number): string {
  const era = [...ERAS].reverse().find((e) => ano >= e.ini);
  if (!era || era.rotulo === 'Independência') return 'entre a Independência e a primeira Constituição';
  return `sob a ${era.rotulo}`;
}

const TOM: Record<EventoDoAno['tom'], string> = {
  saida: s.tomSaida,
  excecao: s.tomExcecao,
  marco: s.tomMarco,
  lei: s.tomLei,
  publicacao: s.tomMarco,
};

interface Rotulo {
  x: number;
  tick: number;
  texto: string;
}

/** Afasta os rótulos até o vão mínimo, sem sair do contêiner. */
function distribuir(marcas: {pos: number; texto: string}[], largura: number, vao: number, meia: number): Rotulo[] {
  const min = meia;
  const max = largura - meia;
  const out = marcas.map((m) => ({tick: m.pos, x: m.pos, texto: m.texto}));
  for (let i = 0; i < out.length; i++) {
    if (out[i].x < min) out[i].x = min;
    if (i > 0 && out[i].x - out[i - 1].x < vao) out[i].x = out[i - 1].x + vao;
  }
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i].x > max) out[i].x = max;
    if (i < out.length - 1 && out[i + 1].x - out[i].x < vao) out[i].x = out[i + 1].x - vao;
  }
  return out;
}

export default function LinhaDoTempo({inicio, fim, marcos, eventos, registros, naUrl = false}: Props) {
  const vao = fim - inicio;
  const grafico = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(1096);
  const [ano, setAno] = useState(1940);
  const [fixado, setFixado] = useState(false);

  useEffect(() => {
    const el = grafico.current;
    if (!el) return;
    const medir = () => setLargura(el.clientWidth);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    const a = Number(new URLSearchParams(window.location.search).get('ano'));
    if (Number.isInteger(a) && a >= inicio && a <= fim) {
      setAno(a);
      setFixado(true);
    }
    return () => ro.disconnect();
  }, [inicio, fim]);

  const fixar = (a: number, manter?: boolean) => {
    const novoFixado = manter ?? !(fixado && ano === a);
    setAno(a);
    setFixado(novoFixado);
    const url = new URL(window.location.href);
    if (novoFixado) url.searchParams.set('ano', String(a));
    else url.searchParams.delete('ano');
    window.history.replaceState(null, '', url.toString());
  };

  const porAno = useMemo(() => {
    const m = new Map<number, EventoDoAno[]>();
    for (const e of eventos) {
      if (!m.has(e.ano)) m.set(e.ano, []);
      m.get(e.ano)!.push(e);
    }
    return m;
  }, [eventos]);
  const maxNoAno = Math.max(1, ...[...porAno.values()].map((l) => l.length));

  const px = (a: number) => ((a - inicio) / vao) * largura;
  const pct = (a: number) => `${((a - inicio) / vao) * 100}%`;

  const constituicoes = distribuir(
    marcos.filter((m) => m.tipo === 'constituicao').map((m) => ({pos: px(m.ano), texto: m.eixo})),
    largura,
    42,
    21,
  );

  // Códigos a até dois anos um do outro dividem o rótulo: "1940–41 · CP, CPP e LCP".
  const grupos: {anos: number[]; textos: string[]}[] = [];
  for (const m of marcos.filter((x) => x.tipo === 'codigo').sort((a, b) => a.ano - b.ano)) {
    const g = grupos[grupos.length - 1];
    if (g && m.ano - g.anos[0] <= 2) {
      g.anos.push(m.ano);
      g.textos.push(m.eixo);
    } else grupos.push({anos: [m.ano], textos: [m.eixo]});
  }
  const juntar = (t: string[]) => (t.length === 1 ? t[0] : `${t.slice(0, -1).join(', ')} e ${t[t.length - 1]}`);
  const codigos = distribuir(
    [
      ...grupos.map((g) => {
        const a0 = g.anos[0];
        const a1 = g.anos[g.anos.length - 1];
        return {pos: px(a0), texto: `${a1 > a0 ? `${a0}–${String(a1).slice(2)}` : a0}\n${juntar([...new Set(g.textos)])}`};
      }),
      {pos: px(fim), texto: `${fim}\nhoje`},
    ],
    // Vão e meia-largura casam com .rotuloCodigo (6,6rem ≈ 106px).
    largura,
    112,
    54,
  );

  const eras = ERAS.map((e) => {
    const f = e.fim ?? fim;
    const larg = ((f - e.ini) / vao) * largura;
    // Largura do rótulo em Plex Mono 11px (~6,7px por caractere) e a folga da borda.
    const cabe = (t: string) => t.length * 6.7 + 16 <= larg;
    return {...e, largura: ((f - e.ini) / vao) * 100, texto: cabe(e.rotulo) ? e.rotulo : cabe(e.curto) ? e.curto : ''};
  });

  const decadas: number[] = [];
  for (let a = Math.ceil(inicio / 30) * 30; a < fim - 10; a += 30) decadas.push(a);

  const doAno = porAno.get(ano) ?? [];
  const teclas = (ev: KeyboardEvent<HTMLDivElement>) => {
    const passo = ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? 1
      : ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -1
      : ev.key === 'PageUp' ? 10
      : ev.key === 'PageDown' ? -10
      : 0;
    if (passo) {
      ev.preventDefault();
      fixar(Math.min(fim, Math.max(inicio, ano + passo)), true);
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      fixar(inicio, true);
    } else if (ev.key === 'End') {
      ev.preventDefault();
      fixar(fim, true);
    }
  };

  const marcosTotal = marcos.length;

  return (
    <div className={s.linha} id="linha-do-tempo">
      <div className={s.cartaoLinha}>
        <div className={s.cabecalhoLinha}>
          <span className={s.intervalo}>
            <span className="rotulo">
              {inicio} — {fim}
            </span>
            <span className={s.resumoLinha}>
              {vao} anos · {registros.length} registros no acervo · {marcosTotal} marcos
            </span>
          </span>
          <span className={s.legenda}>
            <span>
              <i className={s.glifoConstituicao} aria-hidden="true" /> constituição
            </span>
            <span>
              <i className={s.glifoCodigo} aria-hidden="true" /> código
            </span>
            <span>
              <i className={s.glifoBarra} aria-hidden="true" /> eventos no ano
            </span>
          </span>
        </div>

        <div className={s.rolagemLinha}>
          <div className={s.grafico} ref={grafico}>
            <div className={s.eras} aria-hidden="true">
              {eras.map((e, i) => (
                <div key={e.ini} className={`${s.era} ${i % 2 ? s.eraAlt : ''}`} style={{width: `${e.largura}%`}} title={e.rotulo}>
                  <span>{e.texto}</span>
                </div>
              ))}
            </div>

            <div className={s.faixaMarcos} aria-hidden="true">
              {constituicoes.map((c) => (
                <span key={`c-${c.tick}`}>
                  <span className={s.rotuloMarco} style={{left: c.x, top: 0}}>
                    {c.texto}
                  </span>
                  <span className={s.conectorV} style={{left: c.x, top: 18, height: 8}} />
                  <span className={s.conectorH} style={{left: Math.min(c.x, c.tick), top: 26, width: Math.abs(c.x - c.tick)}} />
                  <span className={s.conectorV} style={{left: c.tick, top: 26, height: 22}} />
                  <span className={s.losango} style={{left: c.tick, top: 48}} />
                </span>
              ))}
            </div>

            <div
              className={s.anos}
              role="slider"
              tabIndex={0}
              aria-label="Ano na linha do tempo"
              aria-valuemin={inicio}
              aria-valuemax={fim}
              aria-valuenow={ano}
              aria-valuetext={`${ano}: ${doAno.length} ${doAno.length === 1 ? 'evento' : 'eventos'}`}
              onKeyDown={teclas}
            >
              {Array.from({length: vao + 1}, (_, i) => inicio + i).map((a) => {
                const n = porAno.get(a)?.length ?? 0;
                return (
                  <div
                    key={a}
                    className={`${s.ano} ${a === ano ? s.anoAtivo : ''}`}
                    onMouseEnter={() => !fixado && setAno(a)}
                    onClick={() => fixar(a)}
                  >
                    <span className={s.barraAno} style={{height: n ? `${Math.max(12, (n / maxNoAno) * 100)}%` : 0}} />
                  </div>
                );
              })}
            </div>

            <div className={s.faixaCodigos} aria-hidden="true">
              {codigos.map((c) => (
                <span key={`k-${c.tick}-${c.texto}`}>
                  {!c.texto.endsWith('hoje') && <span className={s.circulo} style={{left: c.tick, top: 0}} />}
                  <span className={s.conectorV} style={{left: c.tick, top: 12, height: 22}} />
                  <span className={s.conectorH} style={{left: Math.min(c.x, c.tick), top: 34, width: Math.abs(c.x - c.tick)}} />
                  <span className={s.conectorV} style={{left: c.x, top: 34, height: 12}} />
                  <span className={s.rotuloCodigo} style={{left: c.x, top: 46}}>
                    {c.texto}
                  </span>
                </span>
              ))}
            </div>

            <div className={s.decadas} aria-hidden="true">
              {decadas.map((d) => (
                <span key={d} style={{left: pct(d)}}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={s.painelAno}>
          <div className={s.anoGrande}>
            <span className="num">{ano}</span>
            <span className={s.contextoAno}>{contextoDe(ano)}</span>
            <button type="button" className={`${s.fixar} ${fixado ? s.fixarAtivo : ''}`} onClick={() => fixar(ano)}>
              {fixado ? 'fixado · soltar' : 'fixar este ano'}
            </button>
          </div>
          <div className={s.eventosAno} aria-live="polite">
            {doAno.length === 0 ? (
              <p className={s.semEventos}>
                Nenhum evento registrado neste ano — nos marcos, no acervo e no histórico dos dispositivos que os
                atributos citam. A cobertura recua no tempo à medida que o acervo cresce.
              </p>
            ) : (
              doAno.map((e, i) => {
                const conteudo = (
                  <>
                    <span className={`${s.categoriaEvento} ${TOM[e.tom]}`}>{e.categoria}</span>
                    <span className={s.textoEvento}>
                      <span className={s.tituloEvento}>{e.titulo}</span>
                      <span className={s.normaEvento}>{e.norma}</span>
                    </span>
                  </>
                );
                return e.rota ? (
                  <a key={i} className={`${s.evento} ${TOM[e.tom]}`} href={caminho(e.rota)}>
                    {conteudo}
                  </a>
                ) : (
                  <div key={i} className={`${s.evento} ${TOM[e.tom]}`}>
                    {conteudo}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className={s.cartaoLinha}>
        <div className={s.cabecalhoLista}>
          <span className="rotulo">O que saiu de vigência</span>
          {fixado ? (
            <button type="button" className={s.recorteAtivo} onClick={() => fixar(ano, false)}>
              recorte: {ano} · limpar
            </button>
          ) : (
            <span className={s.notaMono}>lista completa — fixe um ano na linha para recortar</span>
          )}
        </div>
        <div className={s.corpoLista}>
          <ListaAcervo registros={registros} ano={fixado ? ano : null} naUrl={naUrl} />
        </div>
      </div>
    </div>
  );
}
