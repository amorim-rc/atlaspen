// O IMPACTO do pacote: o placar, o recorte e as listas do que entra, sai e muda
// de valor, lidas por dispositivo (sentido do tipo) ou por atributo (sentido do
// atributo). Saiu de Simulador.tsx em 25/09/2026 (débito técnico 6).
//
// Regra dura: nenhum número de alcance sem o denominador e sem o recorte.

import type {CenarioReverso} from '../../lib/atributos/reverso';
import type {EstadoCatalogo} from '../../lib/simulacao/motor';
import type {AlcanceAtributo, Mudanca, Par, Resultado} from '../../lib/simulacao/tipos';
import {caminho} from '../../site/url';
import {alcanceTexto, recorte, rotuloAntes, rotuloDepois} from './nota';
import {CLASSE_SINAL, LIMITE_LINHAS, NOME_SINAL, ORDEM_SINAL, delta, fmt} from './rotulos';
import s from './simulacao.module.css';

export const mudou = (a: AlcanceAtributo) => a.entra + a.sai + a.muda > 0 || !a.antes || !a.depois;

// ── O impacto ──────────────────────────────────────────────────────────────

export function LinhaPar({p, modo}: {p: Par; modo: 'tipo' | 'atributo'}) {
  return (
    <li className={s.linhaPar}>
      <span className={`${s.sinal} ${s[CLASSE_SINAL[p.sinal]]}`} title={NOME_SINAL[p.sinal]}>
        <span aria-hidden="true">{p.sinal}</span>
        <span className="sr-only">{NOME_SINAL[p.sinal]}</span>
      </span>
      <span className={s.objetoPar}>
        {modo === 'tipo' ? (
          <>
            {p.tipoNovo ? <span>{p.tipo.crime}</span> : <a href={caminho(`/tipos/${p.tipo.id}`)}>{p.tipo.crime}</a>}
            <span className={s.notaMono}>
              {p.tipo.lei} · {p.tipo.artigo}
            </span>
          </>
        ) : (
          <>
            <span>{p.atributo.nome}</span>
            <span className={s.notaMono}>{p.atributo.fundamento}</span>
          </>
        )}
      </span>
      <span className={s.mudancaPar}>
        <span className={s.antes}>{rotuloAntes(p)}</span>
        <span className={s.seta} aria-hidden="true">
          →
        </span>
        <span className="sr-only">passa a</span>
        <span className={s.depois}>{rotuloDepois(p)}</span>
      </span>
    </li>
  );
}

export default function Impacto({
  r,
  validas,
  legal,
  simulado,
  rev,
}: {
  r: Resultado;
  validas: Mudanca[];
  legal: EstadoCatalogo;
  simulado: EstadoCatalogo;
  rev: CenarioReverso;
}) {
  const soTipos = validas.every((m) => m.sentido === 'tipo');
  const parados = r.porAtributo.filter((a) => !mudou(a));
  const placar = [
    {rotulo: 'Dispositivos atingidos', valor: r.atingidos.dispositivos, nota: `de ${fmt(r.totalUniao.dispositivos)} dispositivos com pena privativa`},
    {rotulo: 'Cenários atingidos', valor: r.atingidos.cenarios, nota: `de ${fmt(r.totalUniao.cenarios)} cenários com pena privativa`},
    {rotulo: 'Atributos que mudam', valor: r.atributosQueMudam, nota: `de ${fmt(r.porAtributo.length)} atributos`},
  ];
  const catalogoMudou =
    r.totalAntes.cenarios !== r.totalDepois.cenarios || r.totalAntes.dispositivos !== r.totalDepois.dispositivos;

  // No sentido do tipo, o resultado se lê por dispositivo tocado; no do atributo, por atributo.
  const porIdLegal = new Map(legal.tipos.map((t) => [t.id, t]));
  const idsSim = new Set(simulado.tipos.map((t) => t.id));
  const tocados = [
    ...simulado.tipos.filter((t) => porIdLegal.get(t.id) !== t),
    ...legal.tipos.filter((t) => !idsSim.has(t.id)),
  ];

  return (
    <>
      <div className={s.placar}>
        {placar.map((p) => (
          <div key={p.rotulo} className={s.numeroPlacar}>
            <span className={s.rotuloPlacar}>{p.rotulo}</span>
            <span className={`${s.valorPlacar} num`}>{fmt(p.valor)}</span>
            <span className={s.notaPlacar}>{p.nota}</span>
          </div>
        ))}
      </div>
      <p className={s.recorte}>
        <strong>Recorte:</strong> {recorte(rev)}. Atingido é o que tem ao menos um atributo que entra, sai ou muda de valor.
        {catalogoMudou && (
          <>
            {' '}
            Catálogo simulado: {fmt(r.totalDepois.dispositivos)} dispositivos e {fmt(r.totalDepois.cenarios)} cenários (hoje,{' '}
            {fmt(r.totalAntes.dispositivos)} e {fmt(r.totalAntes.cenarios)}).
          </>
        )}
      </p>

      <div className={s.listas}>
        {soTipos
          ? tocados.map((t) => {
              const ps = r.pares.filter((p) => p.tipo.id === t.id).sort((a, b) => ORDEM_SINAL[a.sinal] - ORDEM_SINAL[b.sinal]);
              const extinto = !idsSim.has(t.id);
              const novo = !porIdLegal.has(t.id);
              const quantos = new Set(ps.map((p) => p.atributo.id)).size;
              return (
                <section key={t.id} className={s.grupo}>
                  <h3 className={s.tituloGrupo}>
                    <span className={s.nomeGrupo}>{t.crime}</span>
                    <span className={s.notaMono}>
                      {t.lei} · {t.artigo} · {t.pena_faixa_rotulo}
                      {novo ? ' · tipo novo' : extinto ? ' · extinto' : ''}
                    </span>
                  </h3>
                  {ps.length ? (
                    <ul className={s.linhas}>
                      {ps.map((p) => (
                        <LinhaPar key={p.atributo.id} p={p} modo="atributo" />
                      ))}
                    </ul>
                  ) : (
                    <p className={s.notaBloco}>Nenhum atributo muda para este dispositivo.</p>
                  )}
                  <p className={`${s.notaMono} sem-recuo`}>
                    {fmt(r.porAtributo.length - quantos)} de {fmt(r.porAtributo.length)} atributos não se movem neste dispositivo.
                  </p>
                </section>
              );
            })
          : r.porAtributo.filter(mudou).map((a) => {
              const ps = r.pares.filter((p) => p.atributo.id === a.id).sort((x, y) => ORDEM_SINAL[x.sinal] - ORDEM_SINAL[y.sinal]);
              return (
                <section key={a.id} className={s.grupo}>
                  <h3 className={s.tituloGrupo}>
                    <span className={s.nomeGrupo}>{a.nome}</span>
                    <span className={s.notaMono}>{a.fundamento}</span>
                  </h3>
                  <dl className={s.unidades}>
                    {a.antes && (
                      <div>
                        <dt>hoje</dt>
                        <dd>{alcanceTexto(a.antes, r.totalAntes)}</dd>
                      </div>
                    )}
                    <div>
                      <dt>simulado</dt>
                      <dd>
                        {a.depois ? alcanceTexto(a.depois, r.totalDepois) : 'atributo extinto'}
                        {a.antes && a.depois && (
                          <span className={s.delta}>
                            {' '}
                            ({delta(a.depois.dispositivos - a.antes.dispositivos)} dispositivos, {delta(a.depois.cenarios - a.antes.cenarios)}{' '}
                            cenários)
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                  {ps.length > 0 && (
                    <ul className={s.linhas}>
                      {ps.slice(0, LIMITE_LINHAS).map((p) => (
                        <LinhaPar key={`${p.tipo.id}`} p={p} modo="tipo" />
                      ))}
                    </ul>
                  )}
                  {ps.length > LIMITE_LINHAS && (
                    <p className={`${s.notaMono} sem-recuo`}>e mais {fmt(ps.length - LIMITE_LINHAS)} — a lista completa sai no CSV</p>
                  )}
                </section>
              );
            })}
        {parados.length > 0 && (
          <section className={s.grupo}>
            <h3 className={s.tituloGrupo}>
              <span className={s.nomeGrupo}>O que não se move</span>
              <span className={s.notaMono}>
                {fmt(parados.length)} de {fmt(r.porAtributo.length)} atributos
              </span>
            </h3>
            <ul className={s.parados}>
              {parados.map((a) => (
                <li key={a.id}>{a.nome}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
