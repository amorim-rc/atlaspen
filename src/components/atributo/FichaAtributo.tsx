// A ficha do atributo penal — ilha React (/atributos/{slug}).
//
// "A mesma máquina da busca por atributo, com um atributo já escolhido e
// endereço próprio" (Atributo, bordas e chrome.dc.html, 8a; Atributos, acervo e
// eixo temporal.dc.html, 4a). O miolo da tela antiga se preserva — pressuposto
// declarado, base de pena presumida, duas unidades, delta de alcance —; o que
// muda é o endereço, o estado inteiro na URL e a citação do recorte.
//
// Regra dura: nenhum número de alcance sem o denominador ao lado, e as duas
// unidades sempre juntas. O delta compara com a lei vigente sob a MESMA premissa.

import {useEffect, useMemo, useState} from 'react';
import type {TipoDoMotor} from '../../lib/types';
import {CATEGORIA_CURTA, NATUREZA_LABEL, POR_ID, foiEditado, valoresPadrao, type AtributoDef} from '../../lib/atributos';
import {
  avaliarCatalogo,
  cenarioReversoPadrao,
  contarDuasUnidades,
  crimesComPenaPrivativa,
  type AlcanceDuasUnidades,
  type CenarioReverso,
  type Contagem,
} from '../../lib/atributos/reverso';
import {diasDeMeses, formatDias} from '../../lib/pena';
import ControlesPremissa from '../premissa/ControlesPremissa';
import {caminho} from '../../site/url';
import {NOME, SITE_URL} from '../../site/config';
import {dataAbnt} from '../../site/datas';
import {escreverEstado, lerEstado, rotuloValor, type EstadoAtributo, type Situacao} from './estado';
import ControleParametro, {type AlteracaoResumo} from './ControleParametro';
import TabelaAlcance, {type LinhaResumo} from './TabelaAlcance';
import {premissaIgualAoPadrao} from '../../lib/atributos/premissa-url';
import s from './atributo.module.css';

export interface PropsFichaAtributo {
  slug: string;
  /** O estado legal, calculado no build: o que a página mostra antes de o catálogo carregar. */
  inicial: {alcance: AlcanceDuasUnidades; linhas: LinhaResumo[]; situacao: Situacao; fora: number};
  /** A última alteração legislativa dos dispositivos do atributo; `null` = não datada. */
  ultima: AlteracaoResumo | null;
  alteracoes: number | null;
  ultimaPorParametro: Record<string, AlteracaoResumo | null>;
}

const fmt = (n: number) => n.toLocaleString('pt-BR');
const pct = (n: number, t: number) =>
  t ? `${((n / t) * 100).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%` : '—';
const pontos = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})} pp`;
const alcance = (c: Contagem) => c.cabivel + c.condicional;
const sinal = (n: number) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : '0');

const PARAMETROS_VISIVEIS = 6;

/** A premissa da varredura, por extenso — vai para a citação. */
function premissa(def: AtributoDef, rev: CenarioReverso): string {
  const partes: string[] = [];
  if (def.natureza === 'concreto') {
    partes.push(
      rev.base === 'fixa'
        ? `presumida a mesma pena concreta de ${formatDias(diasDeMeses(rev.penaFixaMeses))} para todos os tipos`
        : rev.base === 'maxima'
          ? 'presumida a pena máxima cominada'
          : 'presumida a pena mínima cominada',
    );
  } else if (def.natureza === 'abstrato') partes.push('avaliação exata pela pena cominada');
  else partes.push('atributo que não depende de patamar de pena');
  if (rev.reincidenteEspecifico) partes.push('réu reincidente específico');
  if (rev.comandoOrgcrimUltraviolenta) partes.push('com comando de organização criminosa ultraviolenta');
  if (rev.confessou) partes.push('com confissão formal');
  if (rev.reparouDano) partes.push('com reparação do dano');
  return partes.join(', ');
}

function Unidade({
  titulo,
  unidade,
  explica,
  c,
  total,
  legal,
  totalLegal,
}: {
  titulo: string;
  unidade: string;
  explica: string;
  c: Contagem | null;
  total: number | null;
  legal: Contagem | null;
  totalLegal: number | null;
}) {
  return (
    <div className={s.cartaoUnidade}>
      <div className={s.cabecalhoUnidade}>
        <span className={s.tituloUnidade}>{titulo}</span>
        <span className={s.notaMono}>{total !== null ? `de ${fmt(total)} ${unidade}` : '…'}</span>
      </div>
      <p className={s.explicaUnidade}>{explica}</p>
      <div className={s.barraEmpilhada} aria-hidden="true">
        {c && total
          ? (['cabivel', 'condicional', 'incabivel'] as const).map((k) => (
              <span key={k} className={s[`faixa_${k}`]} style={{width: `${(c[k] / total) * 100}%`}} />
            ))
          : null}
      </div>
      <dl className={s.linhasUnidade}>
        {(['cabivel', 'condicional', 'incabivel'] as const).map((k) => (
          <div key={k}>
            <dt>
              <span className={`${s.ponto} ${s[`ponto_${k}`]}`} aria-hidden="true" />
              {k === 'cabivel' ? 'Cabível' : k === 'condicional' ? 'Condicional' : 'Incabível'}
            </dt>
            <dd className="num">{c ? fmt(c[k]) : '…'}</dd>
            <dd className={`${s.pctUnidade} num`}>{c && total ? pct(c[k], total) : ''}</dd>
          </div>
        ))}
      </dl>
      {c && legal && total && totalLegal && (
        <p className={s.deltaUnidade}>
          Alcance, em relação à lei vigente: <strong className="num">{sinal(alcance(c) - alcance(legal))}</strong> {unidade} (
          {pontos((alcance(c) / total - alcance(legal) / totalLegal) * 100)})
        </p>
      )}
    </div>
  );
}

export default function FichaAtributo({slug, inicial, ultima, alteracoes, ultimaPorParametro}: PropsFichaAtributo) {
  const def = POR_ID[slug];
  const padroes = useMemo(() => valoresPadrao(def), [def]);
  const [tipos, setTipos] = useState<TipoDoMotor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [e, setE] = useState<EstadoAtributo>({params: padroes, rev: cenarioReversoPadrao(), situacao: null, q: '', pagina: 1});
  const [montado, setMontado] = useState(false);
  const [todosParametros, setTodosParametros] = useState(false);
  const [endereco, setEndereco] = useState(`${SITE_URL}atributos/${slug}`);
  const [hoje, setHoje] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const ler = () => setE(lerEstado(window.location.search, def, padroes));
    ler();
    setMontado(true);
    setHoje(dataAbnt());
    window.addEventListener('popstate', ler);
    let vivo = true;
    fetch(caminho('/atributos/tipos.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: TipoDoMotor[]) => vivo && setTipos(d))
      .catch((err: Error) => vivo && setErro(err.message));
    return () => {
      vivo = false;
      window.removeEventListener('popstate', ler);
    };
  }, [def, padroes]);

  useEffect(() => {
    if (!montado) return;
    const novo = window.location.pathname + escreverEstado(e, def) + window.location.hash;
    if (novo !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, '', novo);
    }
    setEndereco(window.location.href.split('#')[0]);
  }, [e, montado, def]);

  const mudar = (patch: Partial<EstadoAtributo>) => setE((a) => ({...a, ...patch}));
  const mudarRev = (patch: Partial<CenarioReverso>) => setE((a) => ({...a, rev: {...a.rev, ...patch}, pagina: 1}));

  const cp = useMemo(() => (tipos ? crimesComPenaPrivativa(tipos) : null), [tipos]);
  const fora = useMemo(() => (tipos ? tipos.filter((t) => t.tem_pena_privativa === false) : null), [tipos]);
  const linhas = useMemo(() => (cp ? avaliarCatalogo(def, e.params, cp, e.rev) : null), [cp, def, e.params, e.rev]);
  const editado = foiEditado(def, e.params);
  const atual = useMemo(() => (linhas ? contarDuasUnidades(linhas) : null), [linhas]);
  const legal = useMemo(
    () => (cp && editado ? contarDuasUnidades(avaliarCatalogo(def, padroes, cp, e.rev)) : null),
    [cp, editado, def, padroes, e.rev],
  );
  // Antes de o catálogo carregar, só o estado legal com a premissa padrão tem número pronto.
  const numeros: AlcanceDuasUnidades | null = atual ?? (!editado && premissaIgualAoPadrao(e.rev) ? inicial.alcance : null);

  const linhasTabela: LinhaResumo[] | null =
    linhas && fora
      ? [
          ...linhas.map((l) => ({
            id: l.crime.id,
            lei: l.crime.lei,
            artigo: l.crime.artigo,
            crime: l.crime.crime,
            faixa: l.crime.pena_faixa_rotulo,
            status: l.resultado.status,
            resumo: l.resultado.resumo,
          })),
          ...fora.map((t) => ({
            id: t.id,
            lei: t.lei,
            artigo: t.artigo,
            crime: t.crime,
            faixa: t.pena_faixa_rotulo,
            status: 'fora' as const,
            resumo: 'Sem pena privativa de liberdade: fora da estatística de alcance, que se mede por patamar de pena.',
          })),
        ]
      : null;
  const contagem = atual && fora ? {...atual.cenarios, fora: fora.length} : null;
  const situacao: Situacao =
    e.situacao ??
    (contagem ? (contagem.cabivel > 0 ? 'cabivel' : contagem.condicional > 0 ? 'condicional' : 'todos') : inicial.situacao);

  const ondeIncide = (linhasTabela ?? inicial.linhas)
    .filter((l) => l.status === 'cabivel')
    .concat((linhasTabela ?? inicial.linhas).filter((l) => l.status === 'condicional'))
    .slice(0, 5);
  const restantesOnde = contagem ? contagem.cabivel + contagem.condicional - ondeIncide.length : null;

  const alterados = def.parametros.filter((p) => e.params[p.id] !== p.padrao);
  const parametrosVisiveis = todosParametros
    ? def.parametros
    : def.parametros.filter((p, i) => i < PARAMETROS_VISIVEIS || e.params[p.id] !== p.padrao);

  const citacao = numeros
    ? `${NOME}. ${def.nome}${
        editado
          ? ` (em simulação: ${alterados.map((p) => `${p.rotulo.toLowerCase()} ${rotuloValor(p, e.params[p.id])}, na lei ${rotuloValor(p, p.padrao)}`).join('; ')})`
          : ''
      }. ${fmt(alcance(numeros.dispositivos))} de ${fmt(numeros.totalDispositivos)} dispositivos (${pct(
        alcance(numeros.dispositivos),
        numeros.totalDispositivos,
      )}) e ${fmt(alcance(numeros.cenarios))} de ${fmt(numeros.totalCenarios)} cenários de condenação alcançados, ${premissa(
        def,
        e.rev,
      )}. Disponível em: ${endereco}. Acesso em: ${hoje ?? '[data da consulta]'}.`
    : '';

  const copiar = () => {
    navigator.clipboard?.writeText(citacao).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const marcas = [
    CATEGORIA_CURTA[def.categoria],
    NATUREZA_LABEL[def.natureza],
    `${def.parametros.length} ${def.parametros.length === 1 ? 'parâmetro editável' : 'parâmetros editáveis'}`,
    alteracoes === null ? null : alteracoes === 0 ? 'texto original' : `${alteracoes} ${alteracoes === 1 ? 'alteração legislativa' : 'alterações legislativas'}`,
  ].filter(Boolean) as string[];

  const textoPressuposto =
    def.natureza === 'concreto'
      ? 'este atributo depende da pena da sentença, que não é campo do tipo penal'
      : def.natureza === 'abstrato'
        ? 'este atributo depende só da pena cominada: a avaliação de cada tipo é exata'
        : 'este atributo não depende de patamar de pena e alcança, em princípio, todo o catálogo';

  return (
    <div className={s.ficha}>
      <header className={s.topo}>
        <div className={s.identidade}>
          <span className={s.fundamentoTopo}>{def.fundamento}</span>
          <h1>{def.nome}</h1>
          <p className={s.descricao}>{def.descricao}</p>
          <ul className={s.marcas}>
            {marcas.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div className={s.caixaAlcance}>
          <span className="rotulo">Alcance no catálogo</span>
          <span className={`${s.numeroAlcance} num`}>{numeros ? fmt(alcance(numeros.dispositivos)) : '…'}</span>
          <span className={s.textoAlcance}>
            {numeros ? (
              <>
                dispositivos de {fmt(numeros.totalDispositivos)} com o atributo cabível ou condicional.
                <br />
                {pct(alcance(numeros.dispositivos), numeros.totalDispositivos)} do catálogo com pena privativa.
              </>
            ) : erro ? (
              `o catálogo não carregou (${erro})`
            ) : (
              'recalculando sobre o catálogo…'
            )}
          </span>
          <span className={s.barraAlcance} aria-hidden="true">
            {numeros && (
              <span
                className={editado ? s.barraSimulada : s.barraLegal}
                style={{width: `${(alcance(numeros.dispositivos) / numeros.totalDispositivos) * 100}%`}}
              />
            )}
          </span>
          {editado && atual && legal ? (
            <span className={s.seloSimulacao}>
              em simulação · {sinal(alcance(atual.dispositivos) - alcance(legal.dispositivos))} dispositivos (
              {pontos(
                (alcance(atual.dispositivos) / atual.totalDispositivos - alcance(legal.dispositivos) / legal.totalDispositivos) * 100,
              )}
              )
            </span>
          ) : (
            <span className={s.notaMono}>lei vigente{def.natureza === 'concreto' ? `, ${premissa(def, e.rev)}` : ''}</span>
          )}
        </div>
      </header>

      <section className={s.faixa} aria-label="Última alteração legislativa">
        <span className="rotulo">Última alteração legislativa</span>
        <span className={s.textoFaixa}>
          {ultima && ultima.norma && ultima.norma !== 'original' ? (
            <>
              {ultima.url ? (
                <a href={ultima.url} rel="noopener" target="_blank">
                  {ultima.norma}
                  {ultima.ano ? `, de ${ultima.ano}` : ''}
                </a>
              ) : (
                `${ultima.norma}${ultima.ano ? `, de ${ultima.ano}` : ''}`
              )}
              {alteracoes !== null && (
                <span className={s.notaMono}>
                  {' '}
                  · {alteracoes} {alteracoes === 1 ? 'alteração' : 'alterações'} nos dispositivos citados, desde o texto original
                </span>
              )}
            </>
          ) : alteracoes === 0 ? (
            'Texto original: nenhuma alteração legislativa registrada nos dispositivos citados.'
          ) : (
            <>
              Não datada.{' '}
              <span className={s.notaMono}>
                algum dispositivo ou parâmetro não tem data no texto compilado (súmula, decisão ou redação sem anotação)
              </span>
            </>
          )}
        </span>
      </section>

      <section className={s.reqVed}>
        <div>
          <span className="rotulo">Requisitos</span>
          <ul>
            {def.requisitos.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="rotulo">Vedações</span>
          {def.vedacoes.length ? (
            <ul>
              {def.vedacoes.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          ) : (
            <p className={s.semVedacao}>Sem vedações legais específicas.</p>
          )}
        </div>
      </section>

      <div className={s.grade}>
        <aside className={s.colunaParametros} aria-label="Parâmetros do atributo">
          <div className={s.cabecalhoSecao}>
            <span className="rotulo">A regra, e os parâmetros que a movem</span>
            <span className={s.notaMono}>
              {alterados.length} de {def.parametros.length} {alterados.length === 1 ? 'alterado' : 'alterados'}
            </span>
          </div>
          <p className={s.notaParametros}>
            Os valores partem da lei vigente. Alterá-los simula uma reforma do próprio atributo, e o catálogo inteiro é
            reavaliado.
          </p>
          {parametrosVisiveis.map((p) => (
            <ControleParametro
              key={p.id}
              def={p}
              valor={e.params[p.id]}
              ultima={ultimaPorParametro[p.id]}
              onChange={(v) => mudar({params: {...e.params, [p.id]: v}, pagina: 1})}
            />
          ))}
          {!todosParametros && parametrosVisiveis.length < def.parametros.length && (
            <button type="button" className={s.botaoSecundario} onClick={() => setTodosParametros(true)}>
              ver os {def.parametros.length - parametrosVisiveis.length} parâmetros restantes
            </button>
          )}
          {editado && (
            <button type="button" className={s.botaoRestaurar} onClick={() => mudar({params: padroes, pagina: 1})}>
              Restaurar os valores legais
            </button>
          )}
        </aside>

        <div className={s.colunaResultados}>
          <section className={s.pressuposto} aria-label="Pressuposto da varredura">
            <p className={s.linhaPressuposto}>
              <span className={s.rotuloAcento}>Pressuposto da varredura</span> {textoPressuposto}
            </p>
            <ControlesPremissa rev={e.rev} onChange={mudarRev} mostrarBase={def.natureza === 'concreto'} />
          </section>

          <section className={s.unidades} aria-label="Alcance em duas unidades">
            <div className={s.cabecalhoSecao}>
              <span className="rotulo">Duas unidades de medida</span>
              <span className={s.notaMono}>as duas são verdadeiras</span>
            </div>
            <div className={s.gradeUnidades}>
              <Unidade
                titulo="Por dispositivo"
                unidade="dispositivos"
                explica="As formas de um mesmo crime contam uma vez só; basta uma delas ser alcançada."
                c={numeros?.dispositivos ?? null}
                total={numeros?.totalDispositivos ?? null}
                legal={legal?.dispositivos ?? null}
                totalLegal={legal?.totalDispositivos ?? null}
              />
              <Unidade
                titulo="Por cenário de condenação"
                unidade="cenários"
                explica="Cada moldura de pena conta: homicídio simples, qualificado e culposo são três. É a unidade comparável ao levantamento de 2008."
                c={numeros?.cenarios ?? null}
                total={numeros?.totalCenarios ?? null}
                legal={legal?.cenarios ?? null}
                totalLegal={legal?.totalCenarios ?? null}
              />
            </div>
            <p className={s.notaTracejada}>
              A diferença entre as duas colunas não é erro: um crime com muitas molduras, como homicídio ou furto, produz
              muitos cenários variados de cabimento dos atributos. Ao citar um número, cite a unidade, o denominador e a
              premissa. Use a citação no pé desta página, pois ela já carrega a explicação.
            </p>
          </section>

          {ondeIncide.length > 0 && (
            <section className={s.onde} aria-label="Onde incide">
              <div className={s.cabecalhoSecao}>
                <span className="rotulo">Onde incide</span>
                <a href="#tipos-alcancados" className={s.notaMono}>
                  abrir a lista completa
                </a>
              </div>
              <ul>
                {ondeIncide.map((l) => (
                  <li key={l.id}>
                    <span className={s.celDispositivo}>
                      {l.lei} · {l.artigo}
                    </span>
                    <a href={caminho(`/tipos/${l.id}`)} className={s.nomeOnde}>
                      {l.crime}
                    </a>
                    <span className={s.celPena}>{l.faixa}</span>
                  </li>
                ))}
              </ul>
              {restantesOnde !== null && restantesOnde > 0 && (
                <p className={`${s.notaMono} sem-recuo`}>e mais {fmt(restantesOnde)} cenários de condenação</p>
              )}
            </section>
          )}

        </div>
      </div>

      {/* A tabela ocupa a largura inteira da ficha: dentro da coluna de resultados,
          o fundamento de cada linha ficava com uma palavra por linha. */}
      <div className={s.tabelaLarga}>
        <TabelaAlcance
          slug={slug}
          linhas={linhasTabela}
          inicial={inicial.linhas}
          contagem={contagem}
          situacao={situacao}
          q={e.q}
          pagina={e.pagina}
          mudar={(patch) => mudar(patch)}
        />
      </div>

      <footer className={s.pe}>
        <div>
          <span className="rotulo">Pressuposto metodológico</span>
          <p>
            {def.natureza === 'concreto'
              ? 'O alcance pressupõe uma pena concreta que o catálogo não tem, por padrão a do réu condenado no mínimo legal, e as circunstâncias do réu marcadas acima. É a hipótese que permite comparar os tipos entre si; não é previsão do que acontece num processo.'
              : def.natureza === 'abstrato'
                ? 'O alcance lê a pena cominada de cada tipo e as circunstâncias do réu marcadas acima. Onde o atributo depende de requisito que o catálogo não registra, como a confissão, a reparação ou a circunstância que a lei elege, o resultado é condicional, e não cabível.'
                : 'O atributo não depende de patamar de pena. O alcance mede os tipos com pena privativa; os demais ficam fora da varredura, como em todo o catálogo.'}{' '}
            A <a href={caminho('/projeto/metodologia')}>metodologia</a> diz o que essa escolha mede e o que deixa de fora.
          </p>
        </div>
        <div>
          <span className="rotulo">Citação deste recorte</span>
          <p className={s.citacao}>{citacao || 'A citação sai quando o alcance estiver calculado.'}</p>
          {citacao && (
            <button type="button" className={s.botaoLink} onClick={copiar}>
              {copiado ? 'citação copiada ✓' : 'copiar, com os parâmetros no endereço'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
