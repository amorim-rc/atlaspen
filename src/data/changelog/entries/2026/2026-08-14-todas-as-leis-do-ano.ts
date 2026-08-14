import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-14-todas-as-leis-do-ano',
  date: '2026-08-14',
  title: 'Todas as leis do ano, uma a uma, para achar a que ninguém viu',
  summary:
    'A conferência mensal deixou de comparar números e passou a baixar cada lei do ano e ler o texto. É a diferença entre supor que uma lei foi examinada e verificar que ela não cria crime.',
  body: [
    'A vigilância semanal é completa sobre o que conhece: relê os 64 diplomas de onde o catálogo tira dados e compara moldura por moldura. Ela é cega para outra coisa — a lei penal publicada num diploma que ainda não está na lista. Esse erro não faz barulho: nada aparece errado, porque nada aparece.',
    'A primeira versão desta conferência tentava ler um índice de leis do ano. Não há: o portal de legislação do Planalto está atrás de proteção anti-bot e nenhum quadro por ano responde. Mas a página de cada lei responde, e a numeração é sequencial e nacional — então a varredura passou a ser por sondagem, do primeiro ao último número do ano, baixando o texto de cada uma e testando contra o mesmo critério do vigia do Diário Oficial.',
    'O teste contra o Planalto real encontrou a Lei 15.487/2026 — que é justamente a que, nesta mesma semana, agravou seis crimes do Estatuto da Criança e do Adolescente e reescreveu o inciso do rol dos hediondos que trata deles. A mecânica pega o caso real.',
    'A varredura não conclui: cominar pena não é criar tipo penal novo, e a lei pode estar apenas alterando diploma que já acompanhamos. Ela aponta o que ninguém leu, com a ementa ao lado, e a leitura é humana. E quando não consegue ler as leis, não afirma nada — porque reportar "nenhuma ficou de fora" sem ter lido a fonte seria produzir exatamente o silêncio que ela existe para quebrar.',
  ],
  tipo: 'melhoria',
  areas: ['Tipos penais'],
  version: 'v2.0.6',
};

export default entrada;
