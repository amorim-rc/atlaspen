// Entrega um arquivo gerado no cliente (CSV, markdown) como download, sem
// servidor: o conteúdo vira um Blob com URL temporária, e o link se clica sozinho.

export function baixar(conteudo: string, nome: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], {type: tipo}));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
