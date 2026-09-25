// A nota de simulação na tela (Simulacao legislativa.dc.html, 9b): o cabeçalho
// com a marca, o título editável, as seções e as ações — imprimir, baixar em
// markdown, copiar a citação. O conteúdo vem pronto de nota.ts; aqui é só a
// apresentação. Saiu de Simulador.tsx em 25/09/2026 (débito técnico 6).

import {NOME_EXTENSO} from '../../site/config';
import {notaEmMarkdown, type Nota} from './nota';
import {baixar} from './baixar';
import s from './simulacao.module.css';

export default function PainelNota({
  nota,
  titulo,
  onTitulo,
  copiar,
  fechar,
}: {
  nota: Nota;
  /** O título em edição: o automático, ou o que a pessoa escreveu. */
  titulo: string;
  onTitulo: (t: string) => void;
  copiar: (texto: string, rotulo: string) => void;
  fechar: () => void;
}) {
  return (
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
        <input value={titulo} onChange={(e) => onTitulo(e.target.value)} />
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
        <button type="button" className={s.botao} onClick={fechar}>
          fechar
        </button>
      </div>
    </section>
  );
}
