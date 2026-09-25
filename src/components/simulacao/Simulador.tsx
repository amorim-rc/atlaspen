// Simulação legislativa — ilha React (/simulacao; Simulacao legislativa.dc.html,
// 9a e 9b).
//
// A tela é uma frase montada da esquerda para a direita — sentido, operação,
// objeto — e o impacto, à direita, muda enquanto se monta. Roda no cliente,
// sobre uma cópia em memória do catálogo: nada é gravado, e o estado inteiro
// vive na query. O link é a hipótese.
//
// Regra dura: nenhum número de alcance sem o denominador e sem o recorte.
//
// Este arquivo guarda o ESTADO e a composição da tela. Os formulários do objeto
// (Formularios.tsx, FormAtributoNovo.tsx, Objeto.tsx), o impacto (Impacto.tsx),
// a nota (PainelNota.tsx) e os rótulos (rotulos.ts) saíram daqui em 25/09/2026,
// quando o arquivo passava de mil linhas (débito técnico 6).

import {useEffect, useMemo, useState} from 'react';
import type {TipoDoMotor} from '../../lib/types';
import {CATALOGO, POR_ID} from '../../lib/atributos';
import {cenarioReversoPadrao, type CenarioReverso} from '../../lib/atributos/reverso';
import {premissaIgualAoPadrao} from '../../lib/atributos/premissa-url';
import ControlesPremissa from '../premissa/ControlesPremissa';
import {
  aplicarPacote,
  avaliarEstado,
  comparar,
  estadoLegal,
  etiquetasDa,
  pacoteValido,
  problemaDa,
  removerMudanca,
  tiposCriadosAntes,
} from '../../lib/simulacao/motor';
import type {Etiqueta, Mudanca, Operacao, Sentido} from '../../lib/simulacao/tipos';
import {caminho} from '../../site/url';
import {SITE_URL} from '../../site/config';
import {escreverPacote, lerPacote, mudancaPadrao} from './estado';
import {ROTULO_ETIQUETA, descrever, identificador, montarNota, paresEmCsv, tituloAutomatico} from './nota';
import {NOTA_OPERACAO, OBJETO, SENTIDOS, fmt} from './rotulos';
import {baixar} from './baixar';
import Objeto from './Objeto';
import Impacto from './Impacto';
import PainelNota from './PainelNota';
import s from './simulacao.module.css';

interface Props {
  versao: string;
  conferidoEm: string | null;
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
  // A posição no pacote é o contexto: a mudança que aponta para tipo criado por
  // outra mudança só o encontra sabendo onde está (25/09/2026).
  const problemas = useMemo(() => pacote.map((x, k) => (legal ? problemaDa(x, legal, {pacote, indice: k}) : null)), [pacote, legal]);
  // O pacote reduzido ao que entra no cálculo, com os ids dos tipos criados
  // remapeados para as posições novas — filtrar sem remapear quebraria a referência.
  const validas = useMemo(() => (legal ? pacoteValido(pacote, legal) : []), [pacote, legal]);
  const simulado = useMemo(() => (legal ? aplicarPacote(legal, validas) : null), [legal, validas]);
  const resultado = useMemo(() => {
    if (!legal || !simulado || !avLegal) return null;
    return comparar(legal, simulado, avLegal, avaliarEstado(simulado, rev, {legal, avaliacoes: avLegal}));
  }, [legal, simulado, avLegal, rev]);
  const etiquetas: Etiqueta[][] = useMemo(
    () => pacote.map((x, k) => (legal && avLegal ? etiquetasDa(x, legal, rev, avLegal, {pacote, indice: k}) : [])),
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
    // `removerMudanca` renumera as referências a tipo criado no pacote junto com as posições.
    setPacote((p) => (p.length > 1 ? removerMudanca(p, k) : [mudancaPadrao('atributo', 'modificar')]));
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
            <Objeto m={m} tipos={tipos} criados={tiposCriadosAntes(pacote, i)} atualizar={atualizar} />
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
                          title="O pacote move o alcance nos dois sentidos ao mesmo tempo, mexe em parâmetro cujo sentido não está declarado, ou desfaz um tipo criado neste mesmo pacote."
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
                  <p className={s.descricaoItem}>{legal ? descrever(it, legal, {pacote, indice: k}) : '…'}</p>
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
        <PainelNota nota={nota} titulo={titulo} onTitulo={setTituloEditado} copiar={copiar} fechar={() => setNotaAberta(false)} />
      )}
    </div>
  );
}
