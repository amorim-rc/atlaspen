// A navegação do site: a barra de topo, a gaveta e o rodapé.
//
// Barra e gaveta seguem o turno mais recente dos desenhos (Simulacao
// legislativa.dc.html): seis destinos. "Textos" saiu da barra depois do turno 5:
// os textos moram em /projeto, que abre na história do projeto.

import {REPOSITORIO} from './config';

export type ChaveNav = 'tipos' | 'atributos' | 'simulacao' | 'acervo' | 'notas' | 'projeto';

export interface ItemNav {
  chave: ChaveNav;
  /** Rótulo da barra de topo. */
  rotulo: string;
  /** Rótulo da gaveta, onde cabe o nome inteiro. */
  rotuloLongo: string;
  rota: string;
}

export const NAVEGACAO: ItemNav[] = [
  {chave: 'tipos', rotulo: 'Tipos penais', rotuloLongo: 'Tipos penais', rota: '/tipos'},
  {chave: 'atributos', rotulo: 'Atributos', rotuloLongo: 'Atributos penais', rota: '/atributos'},
  {chave: 'simulacao', rotulo: 'Simulação', rotuloLongo: 'Simulação legislativa', rota: '/simulacao'},
  {chave: 'acervo', rotulo: 'Acervo', rotuloLongo: 'Acervo histórico', rota: '/acervo'},
  {chave: 'notas', rotulo: 'Notas', rotuloLongo: 'Notas de atualizações', rota: '/notas'},
  {chave: 'projeto', rotulo: 'Projeto', rotuloLongo: 'O projeto', rota: '/projeto'},
];

export interface LinkRodape {
  rotulo: string;
  rota: string;
}

/** As três colunas do rodapé global (Atributo, bordas e chrome.dc.html, 8e). */
export const RODAPE: {titulo: string; itens: LinkRodape[]}[] = [
  {
    titulo: 'Consultar',
    itens: [
      {rotulo: 'Tipos penais', rota: '/tipos'},
      {rotulo: 'Atributos', rota: '/atributos'},
      {rotulo: 'Simulação legislativa', rota: '/simulacao'},
      {rotulo: 'Acervo histórico', rota: '/acervo'},
      {rotulo: 'Linha do tempo', rota: '/acervo/linha-do-tempo'},
    ],
  },
  {
    titulo: 'O projeto',
    itens: [
      {rotulo: 'Metodologia', rota: '/projeto/metodologia'},
      {rotulo: 'Completude', rota: '/projeto/completude'},
      {rotulo: 'Dicionário de dados', rota: '/projeto/dados-abertos'},
      {rotulo: 'Os robôs', rota: '/projeto/os-robos'},
      {rotulo: 'História do projeto', rota: '/projeto'},
    ],
  },
  {
    titulo: 'Aberto',
    itens: [
      {rotulo: 'Dados em JSON', rota: '/projeto/dados-abertos'},
      {rotulo: 'Repositório', rota: REPOSITORIO},
      {rotulo: 'Notas de atualizações', rota: '/notas'},
      {rotulo: 'Como citar', rota: '/projeto/dados-abertos#como-citar'},
    ],
  },
];
