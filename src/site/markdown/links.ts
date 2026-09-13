// Links internos dos docs, levados às rotas novas.
//
// Os .md continuam escritos para o GitHub e para o site antigo: `./metodologia.md`,
// `/docs/completude`, `/pesquisa/tipos?tipo=1`, e o escape do Docusaurus para
// arquivo estático, `pathname:///sispenas/data/crimes.json`. Em vez de reescrever
// os arquivos — o que quebraria os links no GitHub —, o build traduz cada link
// pela mesma tabela dos redirecionamentos e acrescenta o base do site.

import type {Root} from 'mdast';
import {visit} from 'unist-util-visit';
// Com a extensão: a config do Astro carrega este plugin pelo Node, que não
// resolve import relativo sem extensão.
import {rotaAtual, rotaDoDocumento} from '../redirecionamentos.ts';

/** O base que o site antigo embutia em alguns links absolutos. */
const BASE_ANTIGO = '/sispenas/';

export function reescreverLink(url: string, base: string): string {
  let alvo = url.startsWith('pathname://') ? url.slice('pathname://'.length) : url;

  // Endereço externo, âncora local, mailto: intactos.
  if (/^[a-z][a-z0-9+.-]*:/i.test(alvo) || alvo.startsWith('#') || alvo.startsWith('//')) return alvo;

  // Outro documento de docs/, por caminho relativo: ./metodologia.md#ancora.
  const relativo = /^(?:\.\/)?([\w-]+)\.mdx?(#.*)?$/.exec(alvo);
  if (relativo) return base + rotaDoDocumento(relativo[1]).replace(/^\//, '') + (relativo[2] ?? '');

  if (!alvo.startsWith('/')) return alvo;
  if (alvo.startsWith(BASE_ANTIGO)) alvo = alvo.slice(BASE_ANTIGO.length - 1);
  return base + rotaAtual(alvo).replace(/^\//, '');
}

export function remarkLinks(opcoes: {base: string}) {
  const base = opcoes.base.endsWith('/') ? opcoes.base : `${opcoes.base}/`;
  return (arvore: Root) => {
    visit(arvore, (no: any) => {
      if ((no.type === 'link' || no.type === 'definition') && typeof no.url === 'string') {
        no.url = reescreverLink(no.url, base);
      }
    });
  };
}
