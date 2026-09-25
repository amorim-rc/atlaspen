// O índice de /projeto: os textos e os documentos, na barra lateral de todas as
// páginas do projeto (Notas e projeto.dc.html, 6c).
//
// A história do projeto é a página /projeto em si — carregada por padrão —, e
// os documentos são o markdown de docs/ em /projeto/{doc}.

import {REPOSITORIO} from './config';

export interface ItemProjeto {
  titulo: string;
  resumo: string;
  rota: string;
  /** "gerado": a página sai de um script, e não é escrita à mão. */
  marca?: 'gerado' | 'pdf' | 'externo';
}

export const INDICE_DO_PROJETO: {grupo: string; itens: ItemProjeto[]}[] = [
  {
    grupo: 'Textos',
    itens: [
      {
        titulo: 'História do projeto',
        resumo: 'Como o AtlasPen nasceu, o antecedente de 2008 e o caminho até o lançamento.',
        rota: '/projeto',
      },
      {
        titulo: 'Autoria e créditos',
        resumo: 'Quem concebeu e constrói o AtlasPen, o antecedente de 2008 e quem colabora.',
        rota: '/projeto/creditos',
      },
      {
        titulo: 'Manifesto pelo termo "atributo"',
        resumo: 'Por que "atributo", e não "benefício": a palavra que serve aos dois lados do catálogo.',
        rota: '/projeto/manifesto-atributo',
      },
    ],
  },
  {
    grupo: 'Documentação',
    itens: [
      {
        titulo: 'Metodologia',
        resumo: 'A unidade de análise, o que o catálogo afirma e o que deliberadamente cala, e como os atributos são calculados.',
        rota: '/projeto/metodologia',
      },
      {
        titulo: 'Completude do catálogo',
        resumo: 'Quanto de cada diploma já foi conferido, dispositivo a dispositivo, e o que ainda falta.',
        rota: '/projeto/completude',
        marca: 'gerado',
      },
      {
        titulo: 'Catálogo de tipos penais',
        resumo: 'Como o catálogo é construído: os dois arquivos, as regras que decidem o que entra e o que a CI impede de regredir.',
        rota: '/projeto/catalogo-tipos-penais',
      },
      {
        titulo: 'Atributos penais',
        resumo: 'Os 22 atributos, os parâmetros de cada um e a lei em que se apoiam.',
        rota: '/projeto/atributos-penais',
      },
      {
        titulo: 'Progressão de regime',
        resumo: 'As duas tabelas do art. 112 da LEP, o corte pela data do fato e as ADIs em curso.',
        rota: '/projeto/progressao-de-regime',
      },
      {
        titulo: 'Dados abertos',
        resumo: 'Cada campo do registro, de onde vem cada dado e como é revisado, a licença de uso e como citar.',
        rota: '/projeto/dados-abertos',
      },
      {
        titulo: 'Os robôs',
        resumo: 'Os programas que leem o texto da lei, extraem a moldura da pena e conferem o resultado.',
        rota: '/projeto/os-robos',
      },
    ],
  },
  {
    grupo: 'Também aqui',
    itens: [
      {titulo: 'Notas de atualizações', resumo: 'O que mudou na lei, entrada a entrada.', rota: '/notas'},
      {
        titulo: 'O artigo de 2008',
        resumo: 'Machado & Machado, Revista Jurídica, v. 10, n. 90.',
        rota: '/artigos/machado-machado-2008-sispenas-rev-juridica-90.pdf',
        marca: 'pdf',
      },
      {titulo: 'Código, licença e como contribuir', resumo: 'O repositório no GitHub.', rota: REPOSITORIO, marca: 'externo'},
    ],
  },
];
