// A lista de tipos penais — ilha da busca (/tipos).
//
// "Lista filtrável existente, sem redesenho pedido": os filtros, a ordenação e
// a paginação da busca antiga, agora com o estado na URL, a primeira página
// renderizada no build (indexável, legível sem JS) e cada linha levando à ficha
// com endereço próprio. Os estados de borda são os de Atributo, bordas e
// chrome.dc.html: busca vazia que diz o que soltar (8b) e esqueleto de
// carregamento sem girador (8d). Em tela estreita, as linhas viram cartões (8f).

import {useEffect, useMemo, useState} from 'react';
import {caminho} from '../../site/url';
import {
  FILTROS_VAZIOS,
  MODALIDADES,
  POR_PAGINA,
  escreverFiltros,
  filtrar,
  filtrosAtivos,
  lerFiltros,
  ordenar,
  type CampoOrdem,
  type Filtros,
  type LinhaTipo,
} from './filtros';
import s from './lista.module.css';

interface Props {
  total: number;
  leis: string[];
  acoes: string[];
  /** A primeira página, na ordem padrão — o que o build renderiza. */
  inicial: LinhaTipo[];
}

const COLUNAS: {campo: CampoOrdem; rotulo: string}[] = [
  {campo: 'lei', rotulo: 'Lei'},
  {campo: 'artigo', rotulo: 'Artigo'},
  {campo: 'crime', rotulo: 'Crime'},
  {campo: 'min', rotulo: 'Pena mín.'},
  {campo: 'max', rotulo: 'Pena máx.'},
];

const LARGURAS_ESQUELETO = [62, 84, 71, 90, 58, 77, 66, 88];

function Esqueleto() {
  return (
    <div className={s.esqueleto} aria-hidden="true">
      {LARGURAS_ESQUELETO.map((w, i) => (
        <div key={i} className={s.linhaEsqueleto}>
          <span />
          <span style={{width: `${w}%`}} />
          <span />
        </div>
      ))}
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function ListaTipos({total, leis, acoes, inicial}: Props) {
  const [linhas, setLinhas] = useState<LinhaTipo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [f, setF] = useState<Filtros>(FILTROS_VAZIOS);
  const [montado, setMontado] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(true);

  useEffect(() => {
    const ler = () => setF(lerFiltros(window.location.search));
    ler();
    setMontado(true);
    if (window.matchMedia('(max-width: 640px)').matches) setFiltrosAbertos(false);
    window.addEventListener('popstate', ler);
    let vivo = true;
    fetch(caminho('/tipos/indice.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((dados: LinhaTipo[]) => vivo && setLinhas(dados))
      .catch((e: Error) => vivo && setErro(e.message));
    return () => {
      vivo = false;
      window.removeEventListener('popstate', ler);
    };
  }, []);

  useEffect(() => {
    if (!montado) return;
    const novo = window.location.pathname + escreverFiltros(f);
    if (novo !== window.location.pathname + window.location.search) window.history.replaceState(null, '', novo);
  }, [f, montado]);

  const mudar = (patch: Partial<Filtros>) => setF((a) => ({...a, pagina: 1, ...patch}));

  const padrao = escreverFiltros({...f, pagina: 1}) === '';
  const resultado = useMemo(() => (linhas ? ordenar(filtrar(linhas, f), f) : null), [linhas, f]);
  const n = resultado ? resultado.length : total;
  const paginas = Math.max(1, Math.ceil(n / POR_PAGINA));
  const pagina = Math.min(f.pagina, paginas);
  const visiveis: LinhaTipo[] | null = resultado
    ? resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
    : padrao && pagina === 1
      ? inicial
      : null;
  const ativos = filtrosAtivos(f);

  const ordenarPor = (campo: CampoOrdem) =>
    mudar({ordem: campo, decrescente: f.ordem === campo ? !f.decrescente : false});

  const alternarModalidade = (chave: string) =>
    mudar({
      modalidades: f.modalidades.includes(chave) ? f.modalidades.filter((m) => m !== chave) : [...f.modalidades, chave],
    });

  // Busca vazia (8b): quantos tipos voltariam soltando cada filtro, já calculado.
  const sugestoes =
    resultado && resultado.length === 0 && linhas
      ? ativos
          .map((a) => ({rotulo: a.rotulo, sem: a.sem, total: filtrar(linhas, a.sem).length}))
          .sort((x, y) => y.total - x.total)
      : [];

  return (
    <div className={s.lista}>
      <div className={s.barraBusca}>
        <label htmlFor="busca-tipos" className="sr-only">
          Buscar tipo penal
        </label>
        <input
          id="busca-tipos"
          type="search"
          className={s.busca}
          placeholder="Buscar por crime, artigo ou lei…"
          value={f.q}
          onChange={(ev) => mudar({q: ev.target.value})}
          autoComplete="off"
        />
        <span className={s.contagem} aria-live="polite">
          {erro ? (
            'o catálogo não carregou'
          ) : linhas === null ? (
            <>
              {fmt(total)} tipos · carregando o catálogo
              <span className={s.progresso} aria-hidden="true">
                <span />
              </span>
            </>
          ) : (
            `${fmt(n)} de ${fmt(total)} tipos`
          )}
        </span>
      </div>

      <details
        className={s.filtros}
        open={filtrosAbertos}
        onToggle={(ev) => setFiltrosAbertos((ev.target as HTMLDetailsElement).open)}
      >
        <summary>
          Filtros
          {ativos.length > 0 && <span className={s.nAtivos}>{ativos.length} ativos</span>}
        </summary>
        <div className={s.corpoFiltros}>
          <div className={s.selects}>
            <label>
              <span className="rotulo">Lei</span>
              <select value={f.lei} onChange={(ev) => mudar({lei: ev.target.value})}>
                <option value="">Todas as leis</option>
                {leis.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="rotulo">Hediondez</span>
              <select value={f.hediondo} onChange={(ev) => mudar({hediondo: ev.target.value as Filtros['hediondo']})}>
                <option value="">Todos</option>
                <option value="sim">Hediondos</option>
                <option value="nao">Não hediondos</option>
              </select>
            </label>
            <label>
              <span className="rotulo">Elemento subjetivo</span>
              <select value={f.elemento} onChange={(ev) => mudar({elemento: ev.target.value as Filtros['elemento']})}>
                <option value="">Todos</option>
                <option value="doloso">Doloso</option>
                <option value="culposo">Culposo</option>
                <option value="preterdoloso">Preterdoloso</option>
              </select>
            </label>
            <label>
              <span className="rotulo">Violência ou ameaça</span>
              <select value={f.violencia} onChange={(ev) => mudar({violencia: ev.target.value as Filtros['violencia']})}>
                <option value="">Todos</option>
                <option value="violencia">Com violência</option>
                <option value="grave-ameaca">Com grave ameaça</option>
                <option value="ambos">Com as duas</option>
                <option value="nenhuma">Sem violência nem ameaça</option>
              </select>
            </label>
            <label>
              <span className="rotulo">Ação penal</span>
              <select value={f.acao} onChange={(ev) => mudar({acao: ev.target.value})}>
                <option value="">Todas</option>
                {acoes.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={s.linhaChips}>
            <span className="rotulo">Modalidade de pena</span>
            {MODALIDADES.map((m) => (
              <button
                key={m.chave}
                type="button"
                aria-pressed={f.modalidades.includes(m.chave)}
                className={`${s.chip} ${f.modalidades.includes(m.chave) ? s.chipAtivo : ''}`}
                onClick={() => alternarModalidade(m.chave)}
              >
                {m.rotulo}
              </button>
            ))}
            <label className={s.checkMpo}>
              <input type="checkbox" checked={f.menorPotencial} onChange={(ev) => mudar({menorPotencial: ev.target.checked})} />
              Menor potencial ofensivo
            </label>
          </div>
          <p className={`${s.dica} sem-recuo`}>
            "Reclusão" inclui reclusão com multa. Combine com "Multa" para visualizar apenas os que cominam multa.
          </p>
          {ativos.length > 0 && (
            <button type="button" className={s.limpar} onClick={() => setF({...FILTROS_VAZIOS, ordem: f.ordem, decrescente: f.decrescente})}>
              Limpar os filtros
            </button>
          )}
        </div>
      </details>

      {erro && (
        <p className={s.erro}>
          O catálogo não carregou ({erro}). O arquivo completo continua em{' '}
          <a href={caminho('/data/crimes.json')}>/data/crimes.json</a>.
        </p>
      )}

      {visiveis === null ? (
        <Esqueleto />
      ) : resultado && resultado.length === 0 ? (
        <div className={s.vazio}>
          <div className={s.chipsAtivos}>
            {ativos.map((a) => (
              <span key={a.rotulo} className={s.chipAtivoFixo}>
                {a.rotulo}
              </span>
            ))}
          </div>
          <h2>Nenhum tipo penal responde a isso</h2>
          <p>
            Nenhum registro do catálogo reúne todos estes filtros. A combinação pode não existir na lei, ou o tipo que
            você procura pode ainda não ter sido coletado.
          </p>
          {sugestoes.length > 0 && (
            <div className={s.sugestoes}>
              <span className="rotulo">Soltando um filtro por vez</span>
              <ul>
                {sugestoes.map((sg) => (
                  <li key={sg.rotulo}>
                    <button type="button" onClick={() => setF(sg.sem)} disabled={sg.total === 0}>
                      <span>sem {sg.rotulo}</span>
                      <span className={s.totalSugestao}>
                        {sg.total === 0 ? 'nenhum' : `${fmt(sg.total)} ${sg.total === 1 ? 'tipo' : 'tipos'}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className={s.lacuna}>
            Se o tipo deveria estar aqui, pode ser lacuna de coleta: a{' '}
            <a href={caminho('/projeto/completude')}>completude do catálogo</a> diz o que já foi reunido de cada diploma.
          </p>
        </div>
      ) : (
        <table className={s.tabela}>
          <caption className="sr-only">
            Tipos penais: {fmt(n)} resultados, página {pagina} de {paginas}
          </caption>
          <thead>
            <tr>
              {COLUNAS.map((c) => (
                <th
                  key={c.campo}
                  scope="col"
                  aria-sort={f.ordem === c.campo ? (f.decrescente ? 'descending' : 'ascending') : 'none'}
                  className={c.campo === 'min' || c.campo === 'max' ? s.colPena : undefined}
                >
                  <button type="button" onClick={() => ordenarPor(c.campo)}>
                    {c.rotulo}
                    <span aria-hidden="true">{f.ordem === c.campo ? (f.decrescente ? ' ▼' : ' ▲') : ''}</span>
                  </button>
                </th>
              ))}
              <th scope="col">Modalidade</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.id}>
                <td className={s.celLei}>{l.lei}</td>
                <td className={s.celArtigo}>{l.artigo}</td>
                <td className={s.celCrime}>
                  <span className={s.dispositivoMovel} aria-hidden="true">
                    {l.lei} · {l.artigo}
                  </span>
                  <a href={caminho(`/tipos/${l.id}`)} className={s.linkTipo}>
                    {l.crime}
                  </a>
                  {!l.vigente && <span className={s.foraVigencia}>fora de vigência</span>}
                  <span className={s.penaMovel}>
                    {l.privativa === 'Nenhuma' ? '' : `${l.privativa.toLowerCase()}, `}
                    {l.faixa}
                  </span>
                </td>
                <td className={s.celPena}>{l.minRotulo}</td>
                <td className={s.celPena}>{l.maxRotulo}</td>
                <td className={s.celModalidade}>
                  <span className={s.tag}>{l.privativa === 'Nenhuma' ? '—' : l.privativa}</span>
                  {l.multa && <span className={s.tag}>+ multa</span>}
                  {l.hediondo === 'Sim' && (
                    <span className={`${s.tag} ${s.tagHediondo}`} title="Hediondo">
                      hediondo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {visiveis !== null && paginas > 1 && (
        <nav className={s.paginacao} aria-label="Páginas">
          <button type="button" disabled={pagina === 1} onClick={() => mudar({pagina: 1})} aria-label="Primeira página">
            «
          </button>
          <button type="button" disabled={pagina === 1} onClick={() => mudar({pagina: pagina - 1})} aria-label="Página anterior">
            ‹
          </button>
          <span className="num">
            página {pagina} de {paginas}
          </span>
          <button type="button" disabled={pagina === paginas} onClick={() => mudar({pagina: pagina + 1})} aria-label="Próxima página">
            ›
          </button>
          <button type="button" disabled={pagina === paginas} onClick={() => mudar({pagina: paginas})} aria-label="Última página">
            »
          </button>
        </nav>
      )}
    </div>
  );
}
