// O feed das notas de atualizações, depois da v1.0.0 (Notas e projeto.dc.html,
// 6b).
//
// Uma entrada por mudança, mais recentes primeiro. Filtro por natureza e por
// área na URL (?tipo=&area=), como em toda busca do sistema; cada entrada tem
// âncora pelo id do arquivo, e o detalhe abre no lugar. A tela não inventa
// campo: tudo vem de ChangelogEntry.

import {useEffect, useState} from 'react';
import {dataCurta} from '../../site/datas';
import {
  AREAS_CHANGELOG,
  ROTULO_TIPO,
  TIPOS_CHANGELOG,
  type ChangelogArea,
  type ChangelogEntry,
  type ChangelogTipo,
} from '../../data/changelog/types';
import s from './notas.module.css';

interface Props {
  entradas: ChangelogEntry[];
}

export default function FeedNotas({entradas}: Props) {
  const [tipo, setTipo] = useState<ChangelogTipo | ''>('');
  const [area, setArea] = useState<ChangelogArea | ''>('');
  const [aberta, setAberta] = useState<string | null>(entradas[0]?.id ?? null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tipo') as ChangelogTipo | null;
    if (t && TIPOS_CHANGELOG.includes(t)) setTipo(t);
    const a = p.get('area') as ChangelogArea | null;
    if (a && AREAS_CHANGELOG.includes(a)) setArea(a);
    const alvo = window.location.hash.slice(1);
    if (alvo && entradas.some((e) => e.id === alvo)) setAberta(alvo);
    setMontado(true);
  }, [entradas]);

  useEffect(() => {
    if (!montado) return;
    const p = new URLSearchParams();
    if (tipo) p.set('tipo', tipo);
    if (area) p.set('area', area);
    const q = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : '') + window.location.hash);
  }, [tipo, area, montado]);

  const areas = AREAS_CHANGELOG.filter((a) => entradas.some((e) => e.areas.includes(a)));
  const visiveis = entradas.filter((e) => (!tipo || e.tipo === tipo) && (!area || e.areas.includes(area)));
  const versoes = new Set(visiveis.map((e) => e.version).filter(Boolean)).size;

  return (
    <div className={s.feed}>
      <div className={s.filtros}>
        <div className={s.linhaFiltro} role="group" aria-label="Natureza">
          <span className={s.rotuloFiltro}>Natureza</span>
          <button type="button" aria-pressed={!tipo} className={`${s.chip} ${!tipo ? s.chipAtivo : ''}`} onClick={() => setTipo('')}>
            todas
          </button>
          {TIPOS_CHANGELOG.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              className={`${s.chip} ${s.latim} ${tipo === t ? s.chipAtivo : ''}`}
              onClick={() => setTipo(tipo === t ? '' : t)}
            >
              {ROTULO_TIPO[t]}
            </button>
          ))}
        </div>
        <div className={s.linhaFiltro} role="group" aria-label="Área">
          <span className={s.rotuloFiltro}>Área</span>
          <button type="button" aria-pressed={!area} className={`${s.chip} ${!area ? s.chipAtivo : ''}`} onClick={() => setArea('')}>
            todas
          </button>
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={area === a}
              className={`${s.chip} ${area === a ? s.chipAtivo : ''}`}
              onClick={() => setArea(area === a ? '' : a)}
            >
              {a}
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
        <p className={s.vazio}>Nenhuma entrada com essa natureza nessa área.</p>
      ) : (
        <ol className={s.entradas}>
          {visiveis.map((e) => {
            const estaAberta = aberta === e.id;
            return (
              <li key={e.id} id={e.id} className={`${s.entrada} ${estaAberta ? s.entradaAberta : ''}`}>
                <div className={s.quando}>
                  <span className="num">{dataCurta(e.date)}</span>
                  {e.version && <span className={s.versao}>{e.version}</span>}
                </div>
                <div className={s.corpo}>
                  <div className={s.etiquetas}>
                    <span className={`${s.natureza} ${s[`natureza_${e.tipo}`]}`}>{ROTULO_TIPO[e.tipo]}</span>
                    {e.areas.map((a) => (
                      <span key={a} className={s.area}>
                        {a}
                      </span>
                    ))}
                  </div>
                  <h2 className={s.titulo}>
                    <a href={`#${e.id}`}>{e.title}</a>
                  </h2>
                  <p className={s.resumo}>{e.summary}</p>
                  {estaAberta && (e.body.length > 0 || (e.links?.length ?? 0) > 0) && (
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
                  {(e.body.length > 0 || (e.links?.length ?? 0) > 0) && (
                    <button
                      type="button"
                      className={s.alternar}
                      aria-expanded={estaAberta}
                      aria-controls={`detalhe-${e.id}`}
                      onClick={() => setAberta(estaAberta ? null : e.id)}
                    >
                      {estaAberta ? 'menos detalhe' : 'mais detalhe'}
                    </button>
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
