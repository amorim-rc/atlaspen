// O que o site lê dos dados em tempo de build — só para páginas estáticas.
//
// NÃO importe este módulo numa ilha React: ele carrega data/conferencia.json
// (centenas de KB) e o levaria para o bundle do cliente. Passe o valor pronto
// como prop.

import pacote from '../../package.json';
import conferencia from '../../data/conferencia.json';

/** Versão do catálogo, a do package.json. Não sobe até a v1.0.0 (AGENTS.md). */
export const VERSAO: string = pacote.version;

interface Carimbo {
  conferido_em?: string;
}

/** O que cada resultado da conferência quer dizer, nas palavras da própria trilha. */
export const RESULTADOS_CONFERENCIA: Record<string, string> = (
  conferencia as unknown as {_meta: {resultados: Record<string, string>}}
)._meta.resultados;

/**
 * A data da conferência mais recente contra o texto compilado, lida da trilha
 * de auditoria (data/conferencia.json). É a que o rodapé e a página inicial
 * mostram: o que separa um catálogo mantido de um arquivo abandonado.
 */
export const CONFERIDO_EM: string | null = (() => {
  const registros = Object.values(
    (conferencia as unknown as {registros: Record<string, Carimbo>}).registros,
  );
  const datas = registros.map((r) => r.conferido_em).filter((d): d is string => Boolean(d));
  return datas.length ? datas.sort().at(-1)! : null;
})();
