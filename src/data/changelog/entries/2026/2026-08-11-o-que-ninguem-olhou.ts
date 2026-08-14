import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-11-o-que-ninguem-olhou',
  date: '2026-08-11',
  title: 'Uma conferência mensal contra a lista de leis do ano',
  summary:
    'O sistema sabia quantos alarmes falsos gerava, e nada sobre o inverso. Uma lei penal publicada que o filtro não pegasse não deixava rastro em lugar nenhum — e é esse o erro que custa meses de catálogo desatualizado, porque não faz barulho.',
  body: [
    'Uma vez por mês, a lista de leis sancionadas no ano, no próprio Planalto, é confrontada com o que o vigia do Diário Oficial examinou. A lista é a fonte, não um comentário sobre a fonte: repositório de doutrina noticia o que alguém achou relevante, e a conferência semanal só enxerga o que já está no catálogo. O que sobra da comparação é a lista de leis que ninguém olhou.',
    'A conferência não classifica nada. Não diz se a lei é penal — diz que ela existe e que o filtro não a examinou. A leitura é humana e curta, porque basta a ementa de cada uma; e quando alguma criar, agravar ou revogar tipo penal, ela vira entrada no registro de fontes e passa a ser vigiada toda semana.',
    'Se a lista do ano não puder ser lida, a conferência não afirma nada — e dizê-lo é o certo. Reportar "nenhuma lei ficou de fora" sem ter conseguido ler a fonte seria produzir exatamente o silêncio que ela existe para quebrar.',
    'Junto veio uma mudança pequena e de consequência longa: o relatório do vigia passou a guardar o texto integral dos atos examinados, e não só a ementa. Sem isso, mudar o filtro não permitia retriar o que já havia passado — a pergunta "este ato teria entrado pelo critério novo?" virava ato de fé. Com o texto guardado, cada mudança de critério é um teste retroativo contra as rodadas anteriores.',
  ],
  tipo: 'melhoria',
  areas: ['Tipos penais', 'Documentação'],
  version: 'v2.0.6',
};

export default entrada;
