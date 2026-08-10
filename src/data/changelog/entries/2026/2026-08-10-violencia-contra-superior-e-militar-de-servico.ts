import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-10-violencia-contra-superior-e-militar-de-servico',
  date: '2026-08-10',
  title: 'Três causas de aumento do CPM que não estavam em lugar nenhum',
  summary:
    'Os arts. 157 e 158 do Código Penal Militar aumentam a pena quando a violência é praticada com arma, e o art. 157 aumenta de novo quando o crime ocorre em serviço. Nenhum dos três constava — nem como tipo penal, nem como modificador —, e por isso não apareciam para quem simulava a dosimetria desses crimes.',
  body: [
    'A lacuna tinha uma causa reconhecível: são parágrafos que não cominam moldura própria, e o catálogo de tipos penais só aceita quem comina. Ficavam no vão entre os dois arquivos — fora de crimes.json por não serem tipo, fora de modificadores.json por ninguém os ter movido para lá.',
    'Entram agora como causas de aumento de terceira fase: violência praticada com arma, mais um terço, nos arts. 157, §2º e 158, §1º; crime ocorrido em serviço, mais um sexto, no art. 157, §5º. Os três alcançam todas as molduras do respectivo artigo, inclusive a do resultado morte — os parágrafos não restringem a hipótese.',
    'O que continua fora, e de propósito: o §3º do art. 157 e o §2º do art. 158, que mandam aplicar, além da pena da violência, a do crime contra a pessoa. Isso é cúmulo material, não alteração de moldura, e quem o modela é a tela de concurso de crimes.',
  ],
  tipo: 'correcao',
  areas: ['Dosimetria', 'Tipos penais'],
  version: 'v2.0.1',
};

export default entrada;
