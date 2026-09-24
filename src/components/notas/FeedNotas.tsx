// O feed das notas de atualizações, depois da v1.0.0 (Notas e projeto.dc.html,
// 6b).
//
// Uma entrada por mudança, mais recentes primeiro. Dois filtros na URL
// (?alcance=&periodo=), como em toda busca do sistema; cada entrada tem âncora
// pelo id do arquivo, e o detalhe abre no lugar. A tela não inventa campo: tudo
// vem de ChangelogEntry.
//
// Os filtros eram três antes de 24/09/2026 — natureza em latim, área e nada de
// tempo. A natureza saiu porque classificar custava mais do que entregava; as
// seis áreas viraram dois alcances; e entrou o período, que é o que falta numa
// base que recebe lei quase toda semana.

import {useEffect, useState} from 'react';
import {dataCurta} from '../../site/datas';
import {
  ALCANCES,
  ROTULO_ALCANCE,
  rotuloSemestre,
  semestreDe,
  type ChangelogAlcance,
  type ChangelogEntry,
} from '../../data/changelog/types';
import s from './notas.module.css';

interface Props {
  entradas: ChangelogEntry[];
}

export default function FeedNotas({entradas}: Props) {
  const [alcance, setAlcance] = useState<ChangelogAlcance | ''>('');
  const [periodo, setPeriodo] = useState<string>('');
  const [aberta, setAberta] = useState<string | null>(entradas[0]?.id ?? null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const a = p.get('alcance') as ChangelogAlcance | null;
    if (a && ALCANCES.includes(a)) setAlcance(a);
    const s = p.get('periodo');
    if (s && entradas.some((e) => semestreDe(e.date) === s)) setPeriodo(s);
    const alvo = window.location.hash.slice(1);
    if (alvo && entradas.some((e) => e.id === alvo)) setAberta(alvo);
    setMontado(true);
  }, [entradas]);

  useEffect(() => {
    if (!montado) return;
    const p = new URLSearchParams();
    if (alcance) p.set('alcance', alcance);
    if (periodo) p.set('periodo', periodo);
    const q = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : '') + window.location.hash);
  }, [alcance, periodo, montado]);

  // O título abre e fecha o detalhe no lugar; o endereço ganha a âncora da nota
  // (para citar), sem a página saltar até ela.
  const alternar = (id: string, estaAberta: boolean) => {
    setAberta(estaAberta ? null : id);
    window.history.replaceState(null, '', window.location.pathname + window.location.search + (estaAberta ? '' : `#${id}`));
  };

  const alcances = ALCANCES.filter((a) => entradas.some((e) => e.alcance.includes(a)));
  // Do mais recente para o mais antigo, como o próprio feed.
  const periodos = [...new Set(entradas.map((e) => semestreDe(e.date)))].sort().reverse();
  const visiveis = entradas.filter(
    (e) => (!alcance || e.alcance.includes(alcance)) && (!periodo || semestreDe(e.date) === periodo),
  );
  const versoes = new Set(visiveis.map((e) => e.version).filter(Boolean)).size;

  return (
    <div className={s.feed}>
      <div className={s.filtros}>
        <div className={s.linhaFiltro} role="group" aria-label="O que mudou">
          <span className={s.rotuloFiltro}>O que mudou</span>
          <button
            type="button"
            aria-pressed={!alcance}
            className={`${s.chip} ${!alcance ? s.chipAtivo : ''}`}
            onClick={() => setAlcance('')}
          >
            tudo
          </button>
          {alcances.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={alcance === a}
              className={`${s.chip} ${alcance === a ? s.chipAtivo : ''}`}
              onClick={() => setAlcance(alcance === a ? '' : a)}
            >
              {ROTULO_ALCANCE[a]}
            </button>
          ))}
        </div>
        <div className={s.linhaFiltro} role="group" aria-label="Quando">
          <span className={s.rotuloFiltro}>Quando</span>
          <button
            type="button"
            aria-pressed={!periodo}
            className={`${s.chip} ${!periodo ? s.chipAtivo : ''}`}
            onClick={() => setPeriodo('')}
          >
            sempre
          </button>
          {periodos.map((sem) => (
            <button
              key={sem}
              type="button"
              aria-pressed={periodo === sem}
              className={`${s.chip} ${periodo === sem ? s.chipAtivo : ''}`}
              onClick={() => setPeriodo(periodo === sem ? '' : sem)}
            >
              {rotuloSemestre(sem)}
            </button>
          ))}
        </div>
      </div>

      <div className={s.total} aria-live="polite">
        <span>
          {visiveis.length} {visiveis.length === 1 ? 'entrada' : 'entradas'} · {versoes} {versoes === 1 ? 'versão' : 'versões'}
        </span>
        <span>mais recentes primeiro</span>
      </div>

      {visiveis.length === 0 ? (
        <p className={s.vazio}>Nenhuma entrada com esse recorte.</p>
      ) : (
        <ol className={s.entradas}>
          {visiveis.map((e) => {
            const estaAberta = aberta === e.id;
            const temDetalhe = e.body.length > 0 || (e.links?.length ?? 0) > 0;
            return (
              <li key={e.id} id={e.id} className={`${s.entrada} ${estaAberta ? s.entradaAberta : ''}`}>
                <div className={s.quando}>
                  <span className="num">{dataCurta(e.date)}</span>
                  {e.version && <span className={s.versao}>{e.version}</span>}
                </div>
                <div className={s.corpo}>
                  <div className={s.etiquetas}>
                    {e.alcance.map((a) => (
                      <span key={a} className={s.area}>
                        {ROTULO_ALCANCE[a]}
                      </span>
                    ))}
                  </div>
                  <h2 className={s.titulo}>
                    {temDetalhe ? (
                      <button
                        type="button"
                        className={s.tituloBotao}
                        aria-expanded={estaAberta}
                        aria-controls={`detalhe-${e.id}`}
                        onClick={() => alternar(e.id, estaAberta)}
                      >
                        {e.title}
                      </button>
                    ) : (
                      e.title
                    )}
                  </h2>
                  <p className={s.resumo}>{e.summary}</p>
                  {estaAberta && temDetalhe && (
                    <div className={s.detalhe} id={`detalhe-${e.id}`}>
                      {e.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {e.links?.map((l) => (
                        <a key={l.href} href={l.href}>
                          {l.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
