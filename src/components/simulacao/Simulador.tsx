// Simulação legislativa — ilha React (/simulacao; Simulacao legislativa.dc.html,
// 9a e 9b).
//
// A tela é uma frase montada da esquerda para a direita — sentido, operação,
// objeto — e o impacto, à direita, muda enquanto se monta. Roda no cliente,
// sobre uma cópia em memória do catálogo: nada é gravado, e o estado inteiro
// vive na query. O link é a hipótese.
//
// Regra dura: nenhum número de alcance sem o denominador e sem o recorte.

import {useEffect, useMemo, useState} from 'react';
import {ELEMENTOS} from '../../lib/simulacao/tipos';
import type {TipoDoMotor} from '../../lib/types';
import {CATALOGO, POR_ID} from '../../lib/atributos';
import {cenarioReversoPadrao, type CenarioReverso} from '../../lib/atributos/reverso';
import {premissaIgualAoPadrao} from '../../lib/atributos/premissa-url';
import ControlesPremissa from '../premissa/ControlesPremissa';
import {
  RESULTADO_MORTE,
  ROTULO_INCIDENCIA,
  ROTULO_REQUISITO,
  ROTULO_VEDACAO,
  aplicarPacote,
  avaliarEstado,
  camposDoTipo,
  comparar,
  estadoLegal,
  etiquetasDa,
  problemaDa,
  type EstadoCatalogo,
} from '../../lib/simulacao/motor';
import type {
  AlcanceAtributo,
  CamposTipo,
  DefinicaoAtributo,
  Etiqueta,
  Incidencia,
  Mudanca,
  Operacao,
  Par,
  RequisitoReu,
  Resultado,
  Sentido,
  VedacaoNova,
} from '../../lib/simulacao/tipos';
import CampoPena from '../ficha/CampoPena';
import ControleParametro from '../atributo/ControleParametro';
import {normalizar} from '../tipos/filtros';
import {caminho} from '../../site/url';
import {NOME_EXTENSO, SITE_URL} from '../../site/config';
import {escreverPacote, lerPacote, mudancaPadrao} from './estado';
import {
  ROTULO_ETIQUETA,
  alcanceTexto,
  descrever,
  identificador,
  montarNota,
  notaEmMarkdown,
  recorte,
  paresEmCsv,
  rotuloAntes,
  rotuloDepois,
  tituloAutomatico,
} from './nota';
import s from './simulacao.module.css';

interface Props {
  versao: string;
  conferidoEm: string | null;
}

const fmt = (n: number) => n.toLocaleString('pt-BR');
const delta = (n: number) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : '±0');
/** O regime inicial não se extingue: toda pena privativa começa em algum regime. */
const EXTINGUIVEIS = CATALOGO.filter((d) => d.id !== 'regime');
const LIMITE_LINHAS = 12;

const SENTIDOS: {id: Sentido; etiqueta: string; titulo: string; descricao: string}[] = [
  {
    id: 'atributo',
    etiqueta: 'sentido 1',
    titulo: 'Simular com atributo penal',
    descricao: 'Criar, alterar ou extinguir um instituto, e ver quantos tipos penais entram ou saem do alcance dele.',
  },
  {
    id: 'tipo',
    etiqueta: 'sentido 2',
    titulo: 'Simular com tipo penal',
    descricao: 'Criar, alterar ou extinguir um dispositivo, e ver o que isso faz com os atributos que dependem dele.',
  },
];

const NOTA_OPERACAO: Record<Sentido, Record<Operacao, string>> = {
  tipo: {
    criar: 'Cria um dispositivo que não existe. Pede a moldura e as qualificações que o motor lê; resultado morte é derivado do nome, nunca pedido.',
    modificar: 'Altera um dispositivo que já existe: a moldura e as qualificações são editáveis; o nome e o dispositivo ficam como referência.',
    extinguir: 'Retira um dispositivo do catálogo vigente, como faria uma revogação sem tipo que o absorva.',
  },
  atributo: {
    criar: 'Cria um instituto que não existe e define de que ele depende: a pena, o limiar, as vedações e os requisitos do réu.',
    modificar: 'Move os parâmetros de um instituto que já existe (limiar, fração, vedação) e recalcula o alcance dele sobre o catálogo.',
    extinguir: 'Retira um instituto do sistema e mostra os tipos que ficam sem ele.',
  },
};

const OBJETO: Record<Sentido, Record<Operacao, string>> = {
  tipo: {criar: 'dispositivo novo', modificar: 'dispositivo alterado', extinguir: 'dispositivo extinto'},
  atributo: {criar: 'instituto novo', modificar: 'instituto alterado', extinguir: 'instituto extinto'},
};

const CLASSE_SINAL: Record<Par['sinal'], string> = {'+': 'sinalMais', '−': 'sinalMenos', '~': 'sinalMuda', '=': 'sinalIgual'};
const NOME_SINAL: Record<Par['sinal'], string> = {'+': 'entra', '−': 'sai', '~': 'muda de valor', '=': 'não muda'};
const ORDEM_SINAL: Record<Par['sinal'], number> = {'+': 0, '−': 1, '~': 2, '=': 3};

// Só os campos BOOLEANOS do tipo. O elemento subjetivo saiu daqui em
// 24/09/2026: deixou de ser um "culposo: sim/não" e passou a ter quatro
// valores, que a tela mostra por extenso.
const MARCAS: [keyof CamposTipo, string][] = [
  ['hediondo', 'hediondo'],
  ['violencia', 'com violência à pessoa'],
  ['graveAmeaca', 'com grave ameaça'],
  ['contravencao', 'contravenção penal'],
];

function baixar(conteudo: string, nome: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], {type: tipo}));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const mudou = (a: AlcanceAtributo) => a.entra + a.sai + a.muda > 0 || !a.antes || !a.depois;

// ── O objeto da mudança ────────────────────────────────────────────────────

function Marcas({atual, antes, onChange}: {atual: CamposTipo; antes?: CamposTipo; onChange: (p: Partial<CamposTipo>) => void}) {
  return (
    <fieldset className={s.marcas}>
      <legend className={s.legenda}>Qualificações do tipo</legend>
      {MARCAS.map(([k, r]) => (
        <label key={k} className={s.marca}>
          <input
            type="checkbox"
            checked={atual[k] as boolean}
            onChange={(e) => onChange({[k]: e.target.checked} as Partial<CamposTipo>)}
          />
          <span>{r}</span>
          {antes && atual[k] !== antes[k] && <span className={s.naLei}>na lei: {antes[k] ? 'sim' : 'não'}</span>}
        </label>
      ))}
    </fieldset>
  );
}


/**
 * O elemento subjetivo, nos quatro valores do catálogo. Era uma caixa
 * "culposo: sim/não" até 24/09/2026; com a decisão 31 passaram a ser quatro, e
 * a diferença entre preterdoloso e qualificado pelo resultado decide a
 * tentativa — que por sua vez decide desistência e arrependimento eficaz.
 */
function SeletorElemento({
  atual,
  antes,
  onChange,
}: {
  atual: CamposTipo['elemento'];
  antes?: CamposTipo['elemento'];
  onChange: (e: CamposTipo['elemento']) => void;
}) {
  return (
    <label className={s.campo}>
      <span className="rotulo">elemento subjetivo</span>
      <select value={atual} onChange={(e) => onChange(e.target.value as CamposTipo['elemento'])}>
        {ELEMENTOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <span className={s.ajudaCampo}>
        decide a tentativa: culposo e preterdoloso não a admitem; qualificado pelo resultado, sim
        {antes && atual !== antes ? ` · na lei: ${antes.toLowerCase()}` : ''}
      </span>
    </label>
  );
}

function SeletorTipo({
  tipos,
  escolhido,
  onEscolher,
}: {
  tipos: TipoDoMotor[];
  escolhido: TipoDoMotor | null;
  onEscolher: (id: number) => void;
}) {
  const [q, setQ] = useState('');
  const achados = useMemo(() => {
    const t = normalizar(q.trim());
    if (t.length < 2) return [];
    return tipos.filter((x) => normalizar(`${x.crime} ${x.lei} ${x.artigo}`).includes(t)).slice(0, 8);
  }, [q, tipos]);
  return (
    <div className={s.seletor}>
      {escolhido && (
        <div className={s.escolhido}>
          <span className={s.normaObjeto}>
            {escolhido.lei} · {escolhido.artigo}
          </span>
          <span className={s.nomeObjeto}>{escolhido.crime}</span>
          <span className={s.notaMono}>{escolhido.pena_faixa_rotulo}</span>
        </div>
      )}
      <label className={s.campo}>
        <span>{escolhido ? 'Trocar o tipo penal' : 'Buscar o tipo penal'}</span>
        <input type="search" value={q} placeholder="nome, lei ou artigo — ex.: furto, art. 155" onChange={(e) => setQ(e.target.value)} />
      </label>
      {achados.length > 0 && (
        <ul className={s.achados}>
          {achados.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => {
                  onEscolher(x.id);
                  setQ('');
                }}
              >
                <span>{x.crime}</span>
                <span className={s.notaMono}>
                  {x.lei} · {x.artigo} · {x.pena_faixa_rotulo}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && achados.length === 0 && <p className={s.notaBloco}>Nenhum tipo penal responde a essa busca.</p>}
    </div>
  );
}

function FormTipoAlterado({tipo, campos, onChange}: {tipo: TipoDoMotor; campos: Partial<CamposTipo>; onChange: (c: Partial<CamposTipo>) => void}) {
  const antes = camposDoTipo(tipo);
  const atual = {...antes, ...campos};
  const mudar = (patch: Partial<CamposTipo>) => {
    const novo: Partial<CamposTipo> = {...campos, ...patch};
    for (const k of Object.keys(novo) as (keyof CamposTipo)[]) if (novo[k] === antes[k]) delete novo[k];
    onChange(novo);
  };
  return (
    <div className={s.campos}>
      {/* Nome e dispositivo entraram em 24/09/2026. Faltavam para simular o que
          a lei faz com frequência: renomear o tipo, transferi-lo de artigo ou
          movê-lo de diploma. O resultado morte é derivado do nome, e acompanha. */}
      <label className={s.campo}>
        <span className="rotulo">nome do tipo</span>
        <input value={atual.nome} onChange={(e) => mudar({nome: e.target.value})} />
        {atual.nome !== antes.nome && <span className={s.naLei}>na lei: {antes.nome}</span>}
      </label>
      <div className={s.dupla}>
        <label className={s.campo}>
          <span className="rotulo">diploma</span>
          <input value={atual.lei} onChange={(e) => mudar({lei: e.target.value})} />
          {atual.lei !== antes.lei && <span className={s.naLei}>na lei: {antes.lei}</span>}
        </label>
        <label className={s.campo}>
          <span className="rotulo">dispositivo</span>
          <input value={atual.artigo} onChange={(e) => mudar({artigo: e.target.value})} />
          {atual.artigo !== antes.artigo && <span className={s.naLei}>na lei: {antes.artigo}</span>}
        </label>
      </div>
      <CampoPena rotulo="pena mínima" dias={atual.penaMinDias} legal={antes.penaMinDias} zero="sem mínimo" onChange={(d) => mudar({penaMinDias: d})} />
      <CampoPena rotulo="pena máxima" dias={atual.penaMaxDias} legal={antes.penaMaxDias} onChange={(d) => mudar({penaMaxDias: d})} />
      <SeletorElemento atual={atual.elemento} antes={antes.elemento} onChange={(e) => mudar({elemento: e})} />
      <Marcas atual={atual} antes={antes} onChange={mudar} />
      {atual.nome !== antes.nome && RESULTADO_MORTE.test(atual.nome) !== RESULTADO_MORTE.test(antes.nome) && (
        <p className={s.ajudaCampo}>
          O resultado morte deriva do nome, e muda com ele: passa a{' '}
          {RESULTADO_MORTE.test(atual.nome) ? 'sim' : 'não'}.
        </p>
      )}
    </div>
  );
}

function FormTipoNovo({campos, onChange}: {campos: CamposTipo; onChange: (c: CamposTipo) => void}) {
  const mudar = (p: Partial<CamposTipo>) => onChange({...campos, ...p});
  return (
    <div className={s.campos}>
      <label className={s.campo}>
        <span>Nome do tipo</span>
        <input value={campos.nome} placeholder="ex.: fraude por sistema automatizado" onChange={(e) => mudar({nome: e.target.value})} />
      </label>
      <div className={s.duasColunas}>
        <label className={s.campo}>
          <span>Diploma</span>
          <input value={campos.lei} onChange={(e) => mudar({lei: e.target.value})} />
        </label>
        <label className={s.campo}>
          <span>Dispositivo</span>
          <input value={campos.artigo} onChange={(e) => mudar({artigo: e.target.value})} />
        </label>
      </div>
      <CampoPena rotulo="pena mínima" dias={campos.penaMinDias} zero="sem mínimo" onChange={(d) => mudar({penaMinDias: d})} />
      <CampoPena rotulo="pena máxima" dias={campos.penaMaxDias} onChange={(d) => mudar({penaMaxDias: d})} />
      <SeletorElemento atual={campos.elemento} onChange={(e) => mudar({elemento: e})} />
      <Marcas atual={campos} onChange={mudar} />
      <p className={s.notaBloco}>
        Derivado, nunca pedido: resultado morte — {RESULTADO_MORTE.test(campos.nome) ? 'sim' : 'não'}, pela leitura do nome, como no
        catálogo.
      </p>
    </div>
  );
}

function FormAtributoNovo({def, onChange}: {def: DefinicaoAtributo; onChange: (d: DefinicaoAtributo) => void}) {
  const mudar = (p: Partial<DefinicaoAtributo>) => onChange({...def, ...p});
  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);
  return (
    <div className={s.campos}>
      <label className={s.campo}>
        <span>Nome do instituto</span>
        <input value={def.nome} placeholder="ex.: acordo na execução da pena" onChange={(e) => mudar({nome: e.target.value})} />
      </label>
      <div className={s.duasColunas}>
        <label className={s.campo}>
          <span>Depende da</span>
          <select value={def.incidencia} onChange={(e) => mudar({incidencia: e.target.value as Incidencia})}>
            {(Object.keys(ROTULO_INCIDENCIA) as Incidencia[]).map((k) => (
              <option key={k} value={k}>
                {ROTULO_INCIDENCIA[k]}
              </option>
            ))}
          </select>
        </label>
        <label className={s.campo}>
          <span>Cabe quando a pena for</span>
          <select
            value={def.comparacao}
            onChange={(e) => mudar({comparacao: e.target.value as DefinicaoAtributo['comparacao']})}
          >
            <option value="ate">até o limiar</option>
            <option value="acima">acima do limiar</option>
            <option value="entre">entre dois limiares</option>
          </select>
        </label>
      </div>
      {/* A faixa entrou em 24/09/2026: a lei trabalha com ela tanto quanto com
          o limiar único — o sursis vai até dois anos, o semiaberto de quatro a
          oito. O piso é exclusivo e o teto inclusivo, como nos institutos. */}
      <CampoPena
        rotulo={def.comparacao === 'entre' ? 'piso da faixa' : 'limiar'}
        dias={def.limiarDias}
        onChange={(d) => mudar({limiarDias: d})}
      />
      {def.comparacao === 'entre' && (
        <CampoPena
          rotulo="teto da faixa"
          dias={def.limiarSuperiorDias ?? 0}
          onChange={(d) => mudar({limiarSuperiorDias: d})}
        />
      )}
      {def.incidencia === 'aplicada' && (
        <p className={s.notaBloco}>A pena aplicada não é campo do tipo penal: presume-se a pena da premissa da varredura, no bloco de impacto.</p>
      )}
      <fieldset className={s.marcas}>
        <legend className={s.legenda}>Vedado a</legend>
        {(Object.keys(ROTULO_VEDACAO) as VedacaoNova[]).map((v) => (
          <label key={v} className={s.marca}>
            <input type="checkbox" checked={def.vedacoes.includes(v)} onChange={() => mudar({vedacoes: alternar(def.vedacoes, v)})} />
            <span>{ROTULO_VEDACAO[v]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className={s.marcas}>
        <legend className={s.legenda}>Requisitos do réu</legend>
        {(Object.keys(ROTULO_REQUISITO) as RequisitoReu[]).map((r) => (
          <label key={r} className={s.marca}>
            <input type="checkbox" checked={def.requisitos.includes(r)} onChange={() => mudar({requisitos: alternar(def.requisitos, r)})} />
            <span>{ROTULO_REQUISITO[r]}</span>
          </label>
        ))}
      </fieldset>
      <p className={s.notaBloco}>
        Primariedade, confissão e reparação do dano seguem a premissa da varredura, no bloco de impacto. Requisito que a
        premissa não liga deixa o tipo como condicional, e não como cabível.
      </p>
    </div>
  );
}

function Objeto({m, tipos, atualizar}: {m: Mudanca; tipos: TipoDoMotor[] | null; atualizar: (m: Mudanca) => void}) {
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') return <FormTipoNovo campos={m.campos} onChange={(campos) => atualizar({...m, campos})} />;
    if (!tipos) return <p className={s.carregando}>carregando o catálogo…</p>;
    const t = m.id !== null ? (tipos.find((x) => x.id === m.id) ?? null) : null;
    const comPena = tipos.filter((x) => x.tem_pena_privativa !== false);
    return (
      <>
        <SeletorTipo
          tipos={comPena}
          escolhido={t}
          onEscolher={(id) => atualizar(m.op === 'modificar' ? {...m, id, campos: {}} : {...m, id})}
        />
        {t && m.op === 'modificar' && <FormTipoAlterado tipo={t} campos={m.campos} onChange={(campos) => atualizar({...m, campos})} />}
        {t && m.op === 'extinguir' && (
          <p className={s.notaBloco}>
            Numa revogação real, o registro não some: passa ao acervo histórico, consultável para fato anterior.
          </p>
        )}
      </>
    );
  }
  if (m.op === 'criar') return <FormAtributoNovo def={m.def} onChange={(def) => atualizar({...m, def})} />;
  const lista = m.op === 'extinguir' ? EXTINGUIVEIS : CATALOGO;
  const def = m.atributo ? POR_ID[m.atributo] : undefined;
  return (
    <>
      <label className={s.campo}>
        <span>Atributo penal</span>
        <select
          value={m.atributo ?? ''}
          onChange={(e) =>
            atualizar(m.op === 'modificar' ? {...m, atributo: e.target.value || null, params: {}} : {...m, atributo: e.target.value || null})
          }
        >
          <option value="">escolha…</option>
          {lista.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </label>
      {def && <p className={`${s.normaObjeto} sem-recuo`}>{def.fundamento}</p>}
      {def && m.op === 'modificar' && (
        <div className={s.parametros}>
          {def.parametros.map((p) => (
            <ControleParametro
              key={p.id}
              def={p}
              valor={m.params[p.id] ?? p.padrao}
              onChange={(v) => {
                const params = {...m.params};
                if (v === p.padrao) delete params[p.id];
                else params[p.id] = v;
                atualizar({...m, params});
              }}
            />
          ))}
        </div>
      )}
      {m.op === 'extinguir' && (
        <p className={s.notaBloco}>O regime inicial não entra na lista: toda pena privativa de liberdade começa em algum regime.</p>
      )}
    </>
  );
}

// ── O impacto ──────────────────────────────────────────────────────────────

function LinhaPar({p, modo}: {p: Par; modo: 'tipo' | 'atributo'}) {
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

function Impacto({
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

// ── A tela ─────────────────────────────────────────────────────────────────

export default function Simulador({versao, conferidoEm}: Props) {
  const [tipos, setTipos] = useState<TipoDoMotor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pacote, setPacote] = useState<Mudanca[]>([mudancaPadrao('atributo', 'modificar')]);
  const [ativo, setAtivo] = useState(0);
  const [montado, setMontado] = useState(false);
  const [notaAberta, setNotaAberta] = useState(false);
  const [tituloEditado, setTituloEditado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [endereco, setEndereco] = useState(`${SITE_URL}simulacao`);
  const [hoje, setHoje] = useState<Date | null>(null);
  const [rev, setRev] = useState<CenarioReverso>(cenarioReversoPadrao);
  const mudarRev = (patch: Partial<CenarioReverso>) => setRev((a) => ({...a, ...patch}));

  useEffect(() => {
    const ler = () => {
      const e = lerPacote(window.location.search, POR_ID);
      setRev(e.rev);
      if (e.pacote.length) {
        setPacote(e.pacote);
        setAtivo(e.ativo);
      }
    };
    ler();
    setMontado(true);
    setHoje(new Date());
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
  }, []);

  const i = Math.min(ativo, pacote.length - 1);
  const m = pacote[i];
  const padrao = pacote.length === 1 && m.sentido === 'atributo' && m.op === 'modificar' && m.atributo === null;

  useEffect(() => {
    if (!montado) return;
    const limpo = padrao && premissaIgualAoPadrao(rev);
    const novo = window.location.pathname + (limpo ? '' : escreverPacote(padrao ? [] : pacote, i, POR_ID, rev));
    if (novo !== window.location.pathname + window.location.search) window.history.replaceState(null, '', novo);
    setEndereco(window.location.href.split('#')[0]);
  }, [pacote, i, montado, padrao, rev]);

  const legal = useMemo(() => (tipos ? estadoLegal(tipos, CATALOGO) : null), [tipos]);
  const avLegal = useMemo(() => (legal ? avaliarEstado(legal, rev) : null), [legal, rev]);
  const problemas = useMemo(() => pacote.map((x) => (legal ? problemaDa(x, legal) : null)), [pacote, legal]);
  const validas = useMemo(() => (legal ? pacote.filter((_, k) => problemas[k] === null) : []), [pacote, problemas, legal]);
  const simulado = useMemo(() => (legal ? aplicarPacote(legal, validas) : null), [legal, validas]);
  const resultado = useMemo(() => {
    if (!legal || !simulado || !avLegal) return null;
    return comparar(legal, simulado, avLegal, avaliarEstado(simulado, rev, {legal, avaliacoes: avLegal}));
  }, [legal, simulado, avLegal, rev]);
  const etiquetas: Etiqueta[][] = useMemo(
    () => pacote.map((x) => (legal && avLegal ? etiquetasDa(x, legal, rev, avLegal) : [])),
    [pacote, legal, avLegal, rev],
  );

  const atualizar = (novo: Mudanca) => setPacote((p) => p.map((x, k) => (k === i ? novo : x)));
  const escolherSentido = (sd: Sentido) => m.sentido !== sd && atualizar(mudancaPadrao(sd, m.op));
  const escolherOperacao = (op: Operacao) => m.op !== op && atualizar(mudancaPadrao(m.sentido, op));
  const acrescentar = () => {
    setPacote((p) => [...p, mudancaPadrao(m.sentido, 'modificar')]);
    setAtivo(pacote.length);
  };
  const remover = (k: number) => {
    setPacote((p) => (p.length > 1 ? p.filter((_, j) => j !== k) : [mudancaPadrao('atributo', 'modificar')]));
    setAtivo((a) => (a > k ? a - 1 : a === k ? Math.max(0, k - 1) : a));
  };
  const copiar = (texto: string, rotulo: string) => {
    const avisar = (t: string) => {
      setAviso(t);
      window.setTimeout(() => setAviso(null), 2500);
    };
    if (!navigator.clipboard) return avisar('não foi possível copiar');
    navigator.clipboard.writeText(texto).then(
      () => avisar(rotulo),
      () => avisar('não foi possível copiar'),
    );
  };

  const etiquetasValidas = etiquetas.filter((_, k) => problemas[k] === null);
  const idNota = hoje ? identificador(escreverPacote(validas, 0, POR_ID, rev), hoje) : '';
  const titulo = tituloEditado?.trim() ? tituloEditado : legal ? tituloAutomatico(validas, legal) : '';
  const nota =
    notaAberta && legal && resultado && hoje
      ? montarNota({validas, etiquetas: etiquetasValidas, legal, resultado, titulo, versao, conferidoEm, url: endereco, hoje, id: idNota, rev})
      : null;

  return (
    <div className={s.simulador}>
      <section className={s.blocoSentidos} aria-labelledby="rotulo-sentido">
        <h2 className={s.rotuloBloco} id="rotulo-sentido">
          1 · sentido da operação
        </h2>
        <div className={s.sentidos} role="radiogroup" aria-labelledby="rotulo-sentido">
        {SENTIDOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={m.sentido === d.id}
            className={`${s.sentido} ${m.sentido === d.id ? s.sentidoAtivo : ''}`}
            onClick={() => escolherSentido(d.id)}
          >
            <span className={s.etiquetaSentido}>
              {d.etiqueta}
              <span className={s.marcaSentido} aria-hidden="true" />
            </span>
            <span className={s.tituloSentido}>{d.titulo}</span>
            <span className={s.descricaoSentido}>{d.descricao}</span>
          </button>
        ))}
        </div>
      </section>

      <div className={s.corpo}>
        <div className={s.composicao}>
          <section className={s.bloco} aria-labelledby="rotulo-operacao">
            <h2 className={s.rotuloBloco} id="rotulo-operacao">
              2 · operação
            </h2>
            <div className={s.chips} role="radiogroup" aria-labelledby="rotulo-operacao">
              {(['criar', 'modificar', 'extinguir'] as Operacao[]).map((op) => (
                <button
                  key={op}
                  type="button"
                  role="radio"
                  aria-checked={m.op === op}
                  className={`${s.chip} ${m.op === op ? s.chipAtivo : ''}`}
                  onClick={() => escolherOperacao(op)}
                >
                  {op}
                </button>
              ))}
            </div>
            <p className={s.notaBloco}>{NOTA_OPERACAO[m.sentido][m.op]}</p>
          </section>

          <section className={`${s.bloco} ${s.blocoObjeto}`} aria-labelledby="rotulo-objeto">
            <h2 className={s.rotuloBloco} id="rotulo-objeto">
              3 · {OBJETO[m.sentido][m.op]}
            </h2>
            <Objeto m={m} tipos={tipos} atualizar={atualizar} />
            {legal && problemas[i] && <p className={s.falta}>{problemas[i]}</p>}
          </section>

          <section className={s.bloco} aria-labelledby="rotulo-pacote">
            <div className={s.cabecaBloco}>
              <h2 className={s.rotuloBloco} id="rotulo-pacote">
                Pacote de simulação
              </h2>
              <span className={s.notaMono}>
                {fmt(validas.length)} de {fmt(pacote.length)} {pacote.length === 1 ? 'mudança' : 'mudanças'} no cálculo
              </span>
            </div>
            <ol className={s.pacote}>
              {pacote.map((it, k) => (
                <li key={k} className={`${s.item} ${k === i ? s.itemAtivo : ''}`}>
                  <div className={s.topoItem}>
                    <span className={s.etiquetas}>
                      {!legal ? null : problemas[k] ? (
                        <span className={s.etiquetaNeutra}>incompleta</span>
                      ) : etiquetas[k].length ? (
                        etiquetas[k].map((e) => (
                          <span key={e} className={`${s.etiqueta} ${s[`et_${e}`]}`}>
                            {ROTULO_ETIQUETA[e]}
                          </span>
                        ))
                      ) : (
                        <span
                          className={s.etiquetaNeutra}
                          title="O pacote move o alcance nos dois sentidos ao mesmo tempo, ou mexe em parâmetro cujo sentido não está declarado."
                        >
                          sentido não classificado
                        </span>
                      )}
                    </span>
                    <span className={s.acoesItem}>
                      {k !== i && (
                        <button type="button" className={s.botaoLink} onClick={() => setAtivo(k)}>
                          editar
                        </button>
                      )}
                      <button type="button" className={s.botaoLink} onClick={() => remover(k)} aria-label={`Remover a mudança ${k + 1}`}>
                        remover
                      </button>
                    </span>
                  </div>
                  <p className={s.descricaoItem}>{legal ? descrever(it, legal) : '…'}</p>
                </li>
              ))}
            </ol>
            <button type="button" className={s.botao} onClick={acrescentar}>
              + acrescentar outra mudança
            </button>
            <p className={s.notaBloco}>
              Mudanças se acumulam: o impacto é o do pacote inteiro, não o da última alteração. Uma emenda que só faça sentido junto com
              outra pode ser testada junto.
            </p>
          </section>
        </div>

        <div className={s.impacto}>
          <div className={s.cabecaImpacto}>
            <h2 className={s.rotuloBloco}>Impacto</h2>
            <span className={s.notaMono}>recalculado a cada mudança</span>
          </div>
          <section className={s.premissa} aria-label="Premissa da varredura">
            <p className={s.linhaPremissa}>
              <span className={s.rotuloAcento}>Premissa da varredura</span> A pena aplicada e as circunstâncias do réu não são
              campos do tipo penal: a varredura as presume. Os números do impacto valem sob esta premissa e mudam se ela mudar.
            </p>
            <ControlesPremissa rev={rev} onChange={mudarRev} mostrarBase />
          </section>
          <div className={s.miolo} aria-live="polite">
            {erro ? (
              <p className={s.erro}>Não foi possível carregar o catálogo ({erro}). Recarregue a página.</p>
            ) : !resultado || !legal || !simulado ? (
              <p className={s.carregando}>carregando o catálogo…</p>
            ) : validas.length === 0 ? (
              <div className={s.vazio}>
                <p>Monte a primeira mudança à esquerda: o sentido, a operação e o objeto. O impacto aparece aqui enquanto se monta.</p>
                <p className={`${s.notaMono} sem-recuo`}>
                  Lei vigente: {fmt(resultado.totalAntes.dispositivos)} dispositivos e {fmt(resultado.totalAntes.cenarios)} cenários com pena
                  privativa; {fmt(resultado.atributosAntes)} atributos.
                </p>
              </div>
            ) : (
              <Impacto r={resultado} validas={validas} legal={legal} simulado={simulado} rev={rev} />
            )}
          </div>

          {resultado && validas.length > 0 && (
            <div className={s.rodapeImpacto}>
              <div className={s.ressalva}>
                <span className={s.rotuloBloco}>Ressalva desta rodada</span>
                <p>
                  O alcance pressupõe a premissa da varredura declarada no recorte, sem circunstância que altere a moldura. A base conta dispositivos e cenários, não processos.
                  {validas.some((x) => x.sentido === 'tipo' && x.op === 'modificar') &&
                    ' Cada dispositivo é tratado isoladamente: as formas qualificadas e privilegiadas têm moldura própria e não acompanham o caput — para mover o crime inteiro, acrescente cada dispositivo ao pacote.'}
                  {validas.some((x) => x.sentido === 'tipo' && x.op === 'criar') &&
                    ' Tipo novo é hipótese pura: o cálculo não lhe aplica vedação específica além das declaradas.'}
                  {validas.some((x) => x.sentido === 'atributo' && x.op === 'criar') &&
                    ' Atributo sem norma vigente é exercício de política criminal: o cálculo diz o alcance, não a constitucionalidade nem a conveniência.'}
                </p>
              </div>
              <div className={s.acoes}>
                <button
                  type="button"
                  className={s.botaoPrimario}
                  onClick={() => {
                    setNotaAberta(true);
                    window.requestAnimationFrame(() =>
                      document.getElementById('nota-simulacao')?.scrollIntoView({behavior: 'smooth', block: 'start'}),
                    );
                  }}
                >
                  Exportar nota de simulação
                </button>
                <button type="button" className={s.botao} onClick={() => copiar(endereco, 'link copiado')}>
                  copiar link com a hipótese
                </button>
                <button
                  type="button"
                  className={s.botao}
                  disabled={!resultado.pares.length}
                  onClick={() => baixar(paresEmCsv(resultado), `atlaspen-simulacao-${idNota}.csv`, 'text/csv;charset=utf-8')}
                >
                  baixar CSV
                </button>
                {aviso && (
                  <span className={s.aviso} role="status">
                    {aviso}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {nota && (
        <section className={s.nota} id="nota-simulacao" aria-labelledby="titulo-nota">
          <div className={s.topoNota}>
            <span className={s.marcaNota}>
              <span className={s.assinaturaNota}>
                <svg width="17" height="17" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" aria-hidden="true">
                  <rect x="4" y="4" width="24" height="24" />
                  <path d="M10 11v10M22 11v10M10 16h12" />
                </svg>
                Atlas<span>Pen</span>
              </span>
              <span className={s.extensoNota}>{NOME_EXTENSO}</span>
            </span>
            <span className={s.metaNota}>{nota.cabecalho}</span>
          </div>
          <label className={`${s.campo} ${s.semImpressao}`}>
            <span>Título da nota</span>
            <input value={titulo} onChange={(e) => setTituloEditado(e.target.value)} />
          </label>
          <h2 id="titulo-nota" className={s.tituloNota}>
            {nota.titulo}
          </h2>
          {nota.secoes.map((sec) => (
            <div key={sec.titulo} className={s.secaoNota}>
              <h3>{sec.titulo}</h3>
              {sec.texto.split('\n').map((l, k) => (
                <p key={k}>{l}</p>
              ))}
            </div>
          ))}
          <div className={s.citarNota}>
            <h3>Como citar</h3>
            <p>{nota.citacao}</p>
          </div>
          <div className={`${s.acoes} ${s.semImpressao}`}>
            <button type="button" className={s.botaoPrimario} onClick={() => window.print()}>
              imprimir ou salvar em PDF
            </button>
            <button
              type="button"
              className={s.botao}
              onClick={() => baixar(notaEmMarkdown(nota), `atlaspen-simulacao-${nota.id}.md`, 'text/markdown;charset=utf-8')}
            >
              baixar markdown
            </button>
            <button type="button" className={s.botao} onClick={() => copiar(nota.citacao, 'citação copiada')}>
              copiar citação
            </button>
            <button type="button" className={s.botao} onClick={() => setNotaAberta(false)}>
              fechar
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
