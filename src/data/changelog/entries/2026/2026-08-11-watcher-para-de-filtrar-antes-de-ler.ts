import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-11-watcher-para-de-filtrar-antes-de-ler',
  date: '2026-08-11',
  title: 'O vigia do Diário Oficial para de filtrar antes de ler',
  summary:
    'O robô que procura lei penal nova decidia, por uma lista de treze palavras, quais atos valia a pena abrir. A lista custava vinte segundos por quinzena e comprava uma classe inteira de falso negativo: uma lei que altera o Código Penal sem dizer "crime", "pena" nem "tipifica" nem chegava a ser aberta.',
  body: [
    'A conta é curta. A Seção 1 publica cerca de 330 atos por dia, e em duas semanas foram 3.569 atos e apenas 16 normativos — os únicos que podem criar crime. Abrir os dezesseis inteiros custa vinte segundos. A lista de palavras existia para poupar esses vinte segundos, e em troca decidia, sem ler, o que merecia leitura. Agora todo ato normativo é baixado por inteiro, e quem decide é o preceito secundário, que foi medido e funciona. O descartado continua saindo nomeado no relatório, com o motivo, para que o corte seja auditável.',
    'O discriminador também cresceu, porque tinha um buraco de forma. Ele procurava "Pena –", "reclusão, de", "detenção, de" — e há tipo penal que não escreve nada disso: o art. 304 do Código Penal pune o uso de documento falso com "a pena cominada à falsificação", e o art. 28 da Lei de Drogas comina "as seguintes penas" sem a fórmula. São pelo menos nove registros do próprio catálogo redigidos assim, e uma lei nova com essa redação seria invisível para os dois robôs. As fórmulas de remissão entraram no teste.',
    'A rede de segurança — a ementa, para quando a página do ato não abre — reconhecia apenas a lei penal autônoma ("institui o crime de"). Mas a legislação penal brasileira é sobretudo alteradora, e a ementa alteradora tem forma própria, padronizada pela LC 95/98: identifica o diploma e enuncia a finalidade com "para". Entraram "para tipificar", "para agravar a pena", "para tornar hediondo", "acrescenta o art." e as demais.',
    'A detecção de revogação ganhou as fórmulas que faltavam, entre elas a marca que o compilado usa dentro do articulado — o "(Revogado)" ao lado do dispositivo —, que é como se descobre que um artigo saiu sem que a página anuncie nada no topo.',
  ],
  tipo: 'melhoria',
  areas: ['Tipos penais'],
  version: 'v2.0.6',
};

export default entrada;
