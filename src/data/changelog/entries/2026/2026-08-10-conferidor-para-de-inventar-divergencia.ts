import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-10-conferidor-para-de-inventar-divergencia',
  date: '2026-08-10',
  title: 'O conferidor aprendeu a ler quando a pena está em outro artigo',
  summary:
    'Catorze crimes militares de tempo de guerra tinham saído da conferência sem que ninguém decidisse isso — e o relatório não os mostrava como errados, mostrava como nada. A trava de cobertura os pegou. Agora o conferidor entende que uma moldura declarada como sendo de outro dispositivo não se confere contra a letra deste.',
  body: [
    'Os tipos de tempo de guerra do CPM têm moldura própria, derivada do artigo de tempo de paz por um fator: o art. 405 combinado com o art. 242, §2º é o roubo qualificado dobrado. O conferidor normaliza o dispositivo antes de comparar, e ao ler "Art. 405 c/c art. 242, §2º" ele juntava o artigo da primeira metade com o parágrafo da segunda, montando uma referência que não existe em lugar nenhum. Catorze registros caíam como "dispositivo não localizado" — que é o silêncio que a trava de cobertura existe para tornar visível.',
    'A regra que entra é a de ler a declaração do catálogo em vez de adivinhar pelo texto da lei: quem diz de onde a pena vem — pelo campo de pena por remissão ou pelo "c/c" no dispositivo — está dizendo que o próprio artigo não a comina, e não há o que comparar. Esses registros passam a contar entre os que o sistema declara não garantir, com o motivo ao lado, em vez de sumirem.',
    'Junto vieram duas correções menores e uma reorganização. O reinício da numeração da v2.0.0 deixou para trás os identificadores de uma decisão já tomada sobre o art. 158, §3º, e por isso o achado voltou a aparecer como se fosse novo. O art. 400 do CPM, cujo caput não comina pena e cujos incisos cominam três penas diferentes, ganhou a sua dispensa registrada, com o motivo. E a rodada semanal, que era um robô só aos olhos do log, passou a ser quatro com nome próprio — vigia, sentinela, auditor e arquivista —, três deles em paralelo, para que uma falha diga qual falhou.',
    'O resultado da rodada de hoje: zero divergências entre o catálogo e o texto compilado, e zero registros fora da conferência por dispositivo não localizado.',
  ],
  tipo: 'correcao',
  areas: ['Tipos penais'],
  version: 'v2.0.3',
};

export default entrada;
