// Os tipos penais que o atributo alcança — e os que não alcança.
//
// Filtro por situação com a contagem de cada uma, busca, paginação e
// exportação em CSV da lista inteira do filtro corrente (backlog, frente 14).
// Os tipos sem pena privativa ganham situação própria, "fora da varredura":
// é decisão metodológica, e não ausência de dado (Atributos, acervo e eixo
// temporal.dc.html, 4a).

import type {Status} from '../../lib/atributos';
import {normalizar} from '../tipos/filtros';
import {caminho} from '../../site/url';
import {SITE_URL} from '../../site/config';
import {hojeIso} from '../../site/datas';
import type {Situacao} from './estado';
import s from './atributo.module.css';

export interface LinhaResumo {
  id: number;
  lei: string;
  artigo: string;
  crime: string;
  faixa: string;
  status: Status | 'fora';
  resumo: string;
}

const ROTULO: Record<Status | 'fora', string> = {
  cabivel: 'cabível',
  condicional: 'condicional',
  incabivel: 'incabível',
  fora: 'fora da varredura',
};

const POR_PAGINA = 40;
const fmt = (n: number) => n.toLocaleString('pt-BR');

interface Props {
  slug: string;
  /** Todas as linhas avaliadas; `null` enquanto o catálogo carrega. */
  linhas: LinhaResumo[] | null;
  /** A primeira página do estado legal, renderizada no build. */
  inicial: LinhaResumo[];
  contagem: Record<Status | 'fora', number> | null;
  situacao: Situacao;
  q: string;
  pagina: number;
  mudar: (patch: {situacao?: Situacao; q?: string; pagina?: number}) => void;
}

function baixarCsv(linhas: LinhaResumo[], nome: string) {
  const cab = ['id', 'lei', 'artigo', 'crime', 'pena_cominada', 'situacao', 'fundamento_do_resultado', 'endereco'];
  const aspas = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const corpo = linhas.map((l) =>
    [l.id, l.lei, l.artigo, l.crime, l.faixa, ROTULO[l.status], l.resumo, `${SITE_URL}tipos/${l.id}`].map(aspas).join(';'),
  );
  // BOM e ponto e vírgula: é o que o Excel em português abre sem pedir nada.
  const blob = new Blob(['﻿' + [cab.join(';'), ...corpo].join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TabelaAlcance({slug, linhas, inicial, contagem, situacao, q, pagina, mudar}: Props) {
  const filtradas = linhas
    ? linhas.filter(
        (l) =>
          (situacao === 'todos' ? l.status !== 'fora' : l.status === situacao) &&
          (!q.trim() || normalizar(`${l.crime} ${l.artigo} ${l.lei}`).includes(normalizar(q.trim()))),
      )
    : null;
  const total = filtradas ? filtradas.length : null;
  const paginas = total ? Math.max(1, Math.ceil(total / POR_PAGINA)) : 1;
  const p = Math.min(pagina, paginas);
  const visiveis = filtradas ? filtradas.slice((p - 1) * POR_PAGINA, p * POR_PAGINA) : inicial;

  const chips: {chave: Situacao; rotulo: string; n: number | null}[] = [
    {chave: 'cabivel', rotulo: 'Cabível', n: contagem?.cabivel ?? null},
    {chave: 'condicional', rotulo: 'Condicional', n: contagem?.condicional ?? null},
    {chave: 'incabivel', rotulo: 'Incabível', n: contagem?.incabivel ?? null},
    {chave: 'todos', rotulo: 'Todos', n: contagem ? contagem.cabivel + contagem.condicional + contagem.incabivel : null},
    {chave: 'fora', rotulo: 'Fora da varredura', n: contagem?.fora ?? null},
  ];

  return (
    <section className={s.secaoTabela} id="tipos-alcancados" aria-label="Tipos penais alcançados">
      <div className={s.cabecalhoSecao}>
        <span className="rotulo">Cruzamento com tipos penais</span>
        {filtradas && filtradas.length > 0 && (
          <button
            type="button"
            className={s.botaoLink}
            onClick={() => baixarCsv(filtradas, `atlaspen-${slug}-${situacao}-${hojeIso()}.csv`)}
          >
            exportar estes {fmt(filtradas.length)} em CSV
          </button>
        )}
      </div>
      <div className={s.chipsSituacao} role="group" aria-label="Situação">
        {chips.map((c) => (
          <button
            key={c.chave}
            type="button"
            aria-pressed={situacao === c.chave}
            className={`${s.chipSituacao} ${situacao === c.chave ? s.chipSituacaoAtivo : ''} ${s[`chip_${c.chave}`] ?? ''}`}
            onClick={() => mudar({situacao: c.chave, pagina: 1})}
          >
            {c.rotulo}
            {c.n !== null && <span className="num"> {fmt(c.n)}</span>}
          </button>
        ))}
      </div>
      {situacao === 'fora' && (
        <p className={s.notaFora}>
          Tipos que não cominam pena privativa de liberdade — o porte para consumo pessoal (art. 28 da Lei 11.343/06),
          os que só cominam multa, os que importam a pena de outro dispositivo. Os atributos se medem por patamar de
          pena, e um tipo sem pena privativa satisfaria qualquer teto: por isso ficam fora das estatísticas de alcance,
          e não por falta de dado.
        </p>
      )}
      <label className="sr-only" htmlFor="busca-alcance">
        Filtrar os tipos
      </label>
      <input
        id="busca-alcance"
        type="search"
        className={s.buscaTabela}
        placeholder="Filtrar por crime, artigo ou lei…"
        value={q}
        onChange={(ev) => mudar({q: ev.target.value, pagina: 1})}
      />
      {visiveis.length === 0 ? (
        <p className={s.vazioTabela}>Nenhum tipo penal nessa situação com o filtro atual.</p>
      ) : (
        <div className={s.rolagemTabela}>
        <table className={s.tabela}>
          <caption className="sr-only">
            {total !== null ? `${fmt(total)} tipos, página ${p} de ${paginas}` : 'primeira página'}
          </caption>
          <thead>
            <tr>
              <th scope="col">Dispositivo</th>
              <th scope="col">Crime</th>
              <th scope="col">Pena cominada</th>
              <th scope="col">Situação</th>
              <th scope="col">Fundamento do resultado</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.id}>
                <td className={s.celDispositivo}>
                  {l.lei} · {l.artigo}
                </td>
                <td className={s.celCrime}>
                  <a href={caminho(`/tipos/${l.id}`)}>{l.crime}</a>
                </td>
                <td className={s.celPena}>{l.faixa}</td>
                <td>
                  <span className={`${s.selo} ${s[`selo_${l.status}`]}`}>{ROTULO[l.status]}</span>
                </td>
                <td className={s.celResumo}>{l.resumo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {total !== null && paginas > 1 && (
        <nav className={s.paginacao} aria-label="Páginas">
          <button type="button" disabled={p === 1} onClick={() => mudar({pagina: p - 1})} aria-label="Página anterior">
            ‹
          </button>
          <span className="num">
            página {p} de {paginas}
          </span>
          <button type="button" disabled={p === paginas} onClick={() => mudar({pagina: p + 1})} aria-label="Próxima página">
            ›
          </button>
        </nav>
      )}
    </section>
  );
}
