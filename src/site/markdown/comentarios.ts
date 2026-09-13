// Comentários MDX nos docs: `{/* ... */}` sai do HTML.
//
// O scripts/gerar_completude.py carimba docs/completude.md e
// docs/acervo-historico.md com `{/* GERADO AUTOMATICAMENTE ... */}`, que o
// Docusaurus lia como MDX. Aqui os .md são markdown puro, e o carimbo apareceria
// como texto. Ele continua no arquivo, para quem o abre no editor.

import type {Root} from 'mdast';
import {SKIP, visit} from 'unist-util-visit';

const COMENTARIO = /^\{\/\*[\s\S]*\*\/\}$/;

export function remarkComentarios() {
  return (arvore: Root) => {
    visit(arvore, 'paragraph', (no: any, indice, pai: any) => {
      const texto = (no.children ?? []).map((f: any) => f.value ?? '').join('').trim();
      if (pai && indice !== undefined && COMENTARIO.test(texto)) {
        pai.children.splice(indice, 1);
        return [SKIP, indice];
      }
    });
  };
}
