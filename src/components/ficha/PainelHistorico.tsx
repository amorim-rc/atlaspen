// Aba Histórico: o que mudou no artigo, do mais recente para o mais antigo
// (Ficha do tipo penal.dc.html, 7b).
//
// A ficha não repete o acervo: diz o suficiente para o leitor saber se precisa
// ir até lá. Lista truncada declara o corte e leva ao acervo já filtrado no
// artigo. Artigo sem evento registrado diz isso — o histórico dos tipos penais
// está em coleta (frente 4 do backlog), e a ficha não preenche a lacuna.
//
// Renderiza também sem JS e fora da ilha: a página do tipo sem pena calculável
// usa este mesmo componente como HTML estático.

import {caminho} from '../../site/url';
import s from './ficha.module.css';

export interface EventoResumo {
  ano: number | null;
  tipo: 'origem' | 'inclusao' | 'alteracao' | 'revogacao' | 'renumeracao' | 'transferencia';
  norma: string | null;
  dispositivo: string;
  anotacao?: string;
  url?: string;
}

export interface DadosHistorico {
  /** Rótulo do artigo ("CP · art. 121"). */
  artigo: string;
  /** Eventos do artigo inteiro, do mais recente para o mais antigo. */
  eventos: EventoResumo[];
  /** Identificador do artigo no acervo (/acervo?artigo=cp-121). */
  slugArtigo: string;
}

const ROTULO: Record<EventoResumo['tipo'], string> = {
  origem: 'origem',
  inclusao: 'inclusão',
  alteracao: 'alteração',
  revogacao: 'revogação',
  renumeracao: 'renumeração',
  transferencia: 'transferência',
};

const TITULO: Record<EventoResumo['tipo'], string> = {
  origem: 'Texto original',
  inclusao: 'Incluído por lei posterior',
  alteracao: 'Nova redação',
  revogacao: 'Revogado',
  renumeracao: 'Renumerado',
  transferencia: 'Transferido',
};

const MAXIMO = 6;

/** Os mais recentes e a origem: é o que a ficha mostra quando o artigo tem mais eventos. */
function recorte(eventos: EventoResumo[]): EventoResumo[] {
  if (eventos.length <= MAXIMO) return eventos;
  const origem = eventos[eventos.length - 1];
  return [...eventos.slice(0, MAXIMO - 1), origem];
}

export default function PainelHistorico({dados, comoAba = true}: {dados: DadosHistorico; comoAba?: boolean}) {
  const {eventos} = dados;
  const mostrados = recorte(eventos);
  const anos = eventos.map((e) => e.ano).filter((a): a is number => a !== null);
  const acervo = caminho(`/acervo?artigo=${encodeURIComponent(dados.slugArtigo)}`);

  const atributosPainel = comoAba
    ? {id: 'painel-historico', 'data-painel': 'historico', role: 'tabpanel', 'aria-labelledby': 'aba-historico'}
    : {id: 'historico'};

  return (
    <section {...atributosPainel} className={s.painel}>
      <h2 className={comoAba ? s.tituloPainel : s.tituloSecao}>Histórico</h2>
      <div className={s.cabecalhoHistorico}>
        <span className={s.norma}>{dados.artigo}</span>
        <span className={s.norma}>
          {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
          {anos.length > 0 && ` · ${Math.min(...anos)} — ${Math.max(...anos)}`}
        </span>
      </div>

      {eventos.length === 0 ? (
        <div className={s.historicoVazio}>
          <p>
            Nenhum evento registrado ainda para este artigo. O histórico legislativo cobre hoje os dispositivos
            citados pelos atributos penais; a cadeia de alterações de cada tipo penal está em coleta (frente 4 do
            backlog). Até lá, a ficha não afirma de quando é a redação.
          </p>
          <p>
            <a href={acervo}>Ver o acervo deste artigo →</a>
          </p>
        </div>
      ) : (
        <>
          <p className={s.intro}>
            O que mudou no artigo, na ordem inversa, lido do texto compilado do Planalto. A consulta pela data do
            fato — a ficha inteira na redação daquele dia — está reservada para quando a cadeia de redações de cada
            dispositivo estiver registrada.
          </p>
          <ol className={s.linhaTempo}>
            {mostrados.map((ev, i) => (
              <li key={`${ev.dispositivo}-${ev.ano}-${i}`} className={s.eventoTempo}>
                <span className={`${s.anoEvento} num`}>{ev.ano ?? 'original'}</span>
                <span className={`${s.pontoEvento} ${ev.tipo === 'origem' ? s.pontoOrigem : ''}`} aria-hidden="true" />
                <span className={s.corpoEvento}>
                  <span className={s.linhaTag}>
                    <span className={`${s.tagEvento} ${ev.tipo === 'origem' ? s.tagOrigem : ''}`}>{ROTULO[ev.tipo]}</span>
                    {ev.norma && ev.norma !== 'original' && (
                      <span className={s.norma}>
                        {ev.url ? (
                          <a href={ev.url} rel="noopener" target="_blank">
                            {ev.norma}
                          </a>
                        ) : (
                          ev.norma
                        )}
                      </span>
                    )}
                  </span>
                  <span className={s.tituloEvento}>
                    {TITULO[ev.tipo]} — {ev.dispositivo}
                  </span>
                  {ev.anotacao && <span className={s.efeitoEvento}>{ev.anotacao}</span>}
                </span>
              </li>
            ))}
          </ol>
          {eventos.length > mostrados.length && (
            <div className={s.corteHistorico}>
              <span>
                Mostrando {mostrados.length} dos {eventos.length} eventos, os mais recentes e a origem.
              </span>
              <a href={acervo}>ver os {eventos.length} no acervo →</a>
            </div>
          )}
        </>
      )}
    </section>
  );
}
