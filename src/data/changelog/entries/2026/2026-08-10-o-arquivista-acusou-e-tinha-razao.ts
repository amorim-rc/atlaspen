import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-10-o-arquivista-acusou-e-tinha-razao',
  date: '2026-08-10',
  title: 'A documentação descrevia um vocabulário de penas que ficou para trás',
  summary:
    'O robô que vigia a saúde da prosa apontou cinco documentos. Dois estavam de fato errados: descreviam as espécies de pena sem os dois valores que a revisão criou. Um terceiro descrevia uma rotina semanal que deixou de existir. Os outros dois só precisavam ser confirmados.',
  body: [
    'A página que descreve como o catálogo é estruturado listava as espécies de pena como "Reclusão, Detenção, Prisão simples, Multa" — de fora ficavam "Morte", que os crimes de guerra do Código Penal Militar cominam, e "Outras penas", criada para a sanção que não é privativa de liberdade nem pecuniária, como a do art. 28 da Lei de Drogas. A mesma tabela não trazia o campo de pena por remissão. A página de metodologia tinha o mesmo buraco, do outro lado: não dizia que essas três espécies derivam para "nenhuma pena privativa".',
    'O documento de operação interna descrevia a rodada semanal como um robô só, e ela virou quatro com nome próprio. Foi corrigido junto, com a tabela de quem vigia o quê e de qual falha derruba a rodada.',
    'Vale registrar como o aviso chegou, porque o mecanismo é o ponto: o documento não vence só por prazo, vence quando um arquivo de que ele fala muda depois da última vez que alguém o leu. Editar conta como ler — só há escrituração manual quando se relê e não se encontra o que corrigir. Foi o que aconteceu com os outros dois documentos apontados: estavam certos, e receberam a data.',
  ],
  tipo: 'correcao',
  areas: ['Documentação'],
  version: 'v2.0.4',
};

export default entrada;
