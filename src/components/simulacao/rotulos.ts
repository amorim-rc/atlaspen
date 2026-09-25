// Os rótulos e as constantes da simulação: o texto que a tela mostra para cada
// sentido, operação e sinal, e as tabelas que mais de um componente lê. Saiu de
// Simulador.tsx em 25/09/2026 (débito técnico 6), sem mudar uma palavra.

import {CATALOGO} from '../../lib/atributos';
import type {CamposTipo, Operacao, Par, Sentido} from '../../lib/simulacao/tipos';

export const fmt = (n: number) => n.toLocaleString('pt-BR');
export const delta = (n: number) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : '±0');
/** O regime inicial não se extingue: toda pena privativa começa em algum regime. */
export const EXTINGUIVEIS = CATALOGO.filter((d) => d.id !== 'regime');
export const LIMITE_LINHAS = 12;

export const SENTIDOS: {id: Sentido; etiqueta: string; titulo: string; descricao: string}[] = [
  {
    id: 'atributo',
    etiqueta: 'sentido 1',
    titulo: 'Simular com atributo penal',
    descricao: 'Criar, alterar ou extinguir um instituto, e ver quantos tipos penais entram ou saem do alcance dele.',
  },
  {
    id: 'tipo',
    etiqueta: 'sentido 2',
    titulo: 'Simular com tipo penal',
    descricao: 'Criar, alterar ou extinguir um dispositivo, e ver o que isso faz com os atributos que dependem dele.',
  },
];

export const NOTA_OPERACAO: Record<Sentido, Record<Operacao, string>> = {
  tipo: {
    criar: 'Cria um dispositivo que não existe. Pede a moldura e as qualificações que o motor lê; resultado morte é derivado do nome, nunca pedido.',
    modificar: 'Altera um dispositivo que já existe: a moldura e as qualificações são editáveis; o nome e o dispositivo ficam como referência.',
    extinguir: 'Retira um dispositivo do catálogo vigente, como faria uma revogação sem tipo que o absorva.',
  },
  atributo: {
    criar: 'Cria um instituto que não existe e define de que ele depende: a pena, o limiar, as vedações e os requisitos do réu.',
    modificar: 'Move os parâmetros de um instituto que já existe (limiar, fração, vedação) e recalcula o alcance dele sobre o catálogo.',
    extinguir: 'Retira um instituto do sistema e mostra os tipos que ficam sem ele.',
  },
};

export const OBJETO: Record<Sentido, Record<Operacao, string>> = {
  tipo: {criar: 'dispositivo novo', modificar: 'dispositivo alterado', extinguir: 'dispositivo extinto'},
  atributo: {criar: 'instituto novo', modificar: 'instituto alterado', extinguir: 'instituto extinto'},
};

export const CLASSE_SINAL: Record<Par['sinal'], string> = {'+': 'sinalMais', '−': 'sinalMenos', '~': 'sinalMuda', '=': 'sinalIgual'};
export const NOME_SINAL: Record<Par['sinal'], string> = {'+': 'entra', '−': 'sai', '~': 'muda de valor', '=': 'não muda'};
export const ORDEM_SINAL: Record<Par['sinal'], number> = {'+': 0, '−': 1, '~': 2, '=': 3};

// Só os campos BOOLEANOS do tipo. O elemento subjetivo saiu daqui em
// 24/09/2026: deixou de ser um "culposo: sim/não" e passou a ter quatro
// valores, que a tela mostra por extenso.
export const MARCAS: [keyof CamposTipo, string][] = [
  ['hediondo', 'hediondo'],
  ['violencia', 'com violência à pessoa'],
  ['graveAmeaca', 'com grave ameaça'],
  ['contravencao', 'contravenção penal'],
];

/** O selo do tipo que não está na lei: é criação de mudança anterior deste mesmo pacote. */
export const CRIADO_NESTE_PACOTE = 'criado neste pacote';
