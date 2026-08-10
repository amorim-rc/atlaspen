import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-10-simulador-sem-moldura',
  date: '2026-08-10',
  title: 'O simulador deixa de calcular benefício onde não há moldura',
  summary:
    'Os quatro tipos que importam a pena de outro dispositivo entraram na v2.0.0 com moldura ausente — o que é correto. Mas o simulador continuava aberto sobre ela, e uma moldura de zero a zero faz caber todo benefício que depende de patamar de pena. Agora esses registros explicam onde a pena está, em vez de calcular a partir do que não têm.',
  body: [
    'O art. 304 do CP e o art. 315 do CPM punem o uso de documento falso com "a pena cominada à falsificação"; os arts. 2º e 3º da Lei 2.889/56 aplicam frações das penas do art. 1º. Nenhum dos quatro comina moldura própria, e a v2.0.0 passou a dizer isso com o campo pena_por_remissao, em vez de publicar a moldura de um dos dispositivos-fonte como se fosse a do tipo.',
    'Faltava a consequência na tela. As barras do simulador partem da moldura do registro, e com mínimo e máximo em zero o resultado era o pior possível: menor potencial ofensivo, transação penal, prescrição em três anos — tudo cabível, tudo errado. É o mesmo modo de falhar que o projeto já evita nos dispositivos que deixaram de vigorar, e que só não apareceu antes porque o campo é novo.',
    'Nesses quatro registros o simulador, a dosimetria e os cartões de benefício não são mais oferecidos. No lugar deles, o registro diz de qual dispositivo a pena vem e manda simular por ele, que tem moldura própria. A busca por benefício já os deixava de fora da contagem — a tela agora concorda com ela.',
  ],
  tipo: 'correcao',
  areas: ['Interface', 'Benefícios'],
  version: 'v2.0.1',
};

export default entrada;
