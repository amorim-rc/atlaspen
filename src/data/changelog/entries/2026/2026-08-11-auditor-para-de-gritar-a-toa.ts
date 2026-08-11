import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-11-auditor-para-de-gritar-a-toa',
  date: '2026-08-11',
  title: 'O auditor deixa de abrir issue quando não há nada a fazer',
  summary:
    'A auditoria imprime, de propósito, aquilo que ela não garante. Mas contava esses itens como se fossem achados, e a rodada semanal abria issue toda segunda-feira sem uma linha de trabalho dentro. Uma issue que nunca tem trabalho ensina a não abrir a issue — e é justamente ela o único lugar onde o achado real apareceria.',
  body: [
    'São quatro coisas que o relatório mostra e que ninguém precisa fazer: o registro que está fora do alcance da auditoria, a hediondez que depende do caso concreto, o achado já julgado em rodada anterior e a pendência cuja ação prevista é, textualmente, "nenhuma". Elas continuam impressas — um limite que ninguém vê é indistinguível de um achado que nunca apareceu —, mas pararam de contar para o código de saída e para o cabeçalho.',
    'O cabeçalho passou a separar as duas coisas: diz quantos achados pedem revisão e, ao lado, quantos limites declarados existem. Quando não há nada a rever, ele diz isso com todas as letras em vez de anunciar cinco achados.',
    'Na mesma rodada, o auditor de nomes aprendeu a ler o registro composto. Um tipo de tempo de guerra do Código Penal Militar aponta dois dispositivos — "Art. 405 c/c art. 242, §3º" —, e o nome dele pode descrever qualquer um dos dois: no CPM a moldura vem do primeiro e a conduta do segundo, enquanto na lei dos cetáceos é o contrário. Escolher um lado acertava um diploma e errava o outro. Agora o rótulo só é suspeito quando não conversa com nenhum dos dois.',
  ],
  tipo: 'correcao',
  areas: ['Tipos penais'],
  version: 'v2.0.5',
};

export default entrada;
