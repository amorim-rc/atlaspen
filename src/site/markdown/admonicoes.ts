// Admonições dos docs: `:::note[Título]` vira um <aside class="nota">.
//
// A sintaxe é a do Docusaurus v3 (e a que o hook do projeto impõe), lida pelo
// remark-directive. Diretiva que não é admonição volta a ser o texto que era:
// "11:30" ou "art. 5º:" num parágrafo não podem sumir por parecerem diretiva.

import type {Root} from 'mdast';
import {SKIP, visit} from 'unist-util-visit';

const TITULO_PADRAO: Record<string, string> = {
  note: 'Nota',
  tip: 'Dica',
  info: 'Informação',
  warning: 'Atenção',
  danger: 'Perigo',
  caution: 'Cuidado',
};

interface NoDiretiva {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  children: any[];
  data?: Record<string, unknown>;
}

export function remarkAdmonicoes() {
  return (arvore: Root) => {
    visit(arvore, (no: any, indice, pai: any) => {
      if (!['containerDirective', 'leafDirective', 'textDirective'].includes(no.type)) return;
      const d = no as NoDiretiva;

      if (d.type === 'containerDirective' && d.name in TITULO_PADRAO) {
        const primeiro = d.children[0];
        let titulo: any[] = [{type: 'text', value: TITULO_PADRAO[d.name]}];
        if (primeiro?.type === 'paragraph' && primeiro.data?.directiveLabel) {
          titulo = primeiro.children;
          d.children.shift();
        }
        d.data = {hName: 'aside', hProperties: {className: ['nota', `nota-${d.name}`]}};
        d.children.unshift({
          type: 'paragraph',
          data: {hName: 'p', hProperties: {className: ['nota-titulo']}},
          children: titulo,
        });
        return;
      }

      // Não é admonição: devolve o texto como estava escrito.
      if (!pai || indice === undefined) return;
      const marcador = d.type === 'textDirective' ? ':' : d.type === 'leafDirective' ? '::' : ':::';
      pai.children.splice(indice, 1, {type: 'text', value: marcador + d.name}, ...d.children);
      return [SKIP, indice];
    });
  };
}
