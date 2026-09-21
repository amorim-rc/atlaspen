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
    ],
  },
  {
    grupo: 'Documentação',
    itens: [
      {
        titulo: 'Metodologia',
        resumo: 'A unidade de análise, os campos do catálogo, o que é derivado por heurística e como os atributos são calculados.',
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
        resumo: 'O que é um registro do catálogo, e como os tipos foram reunidos.',
        rota: '/projeto/catalogo-tipos-penais',
      },
      {
        titulo: 'Atributos penais',
        resumo: 'Os 22 atributos, os parâmetros de cada um e a lei em que se apoiam.',
        rota: '/projeto/atributos-penais',
      },
      {
        titulo: 'Dados abertos',
        resumo: 'Cada campo do registro, o formato dos dados, a licença de uso e como citar.',
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
      {titulo: 'Notas de atualizações', resumo: 'O que muda na base, a partir da 1.0.0.', rota: '/notas'},
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
