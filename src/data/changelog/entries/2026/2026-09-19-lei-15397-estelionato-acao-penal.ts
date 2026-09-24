import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-19-lei-15397-estelionato-acao-penal',
  date: '2026-09-19',
  title: 'Lei nº 15.397, de 2026: o estelionato volta a ser de ação penal pública incondicionada',
  summary:
    'A Lei nº 15.397, vigente desde 4 de maio de 2026, revogou o §5º do art. 171 do Código Penal, que condicionava a ação penal do estelionato à representação do ofendido desde a Lei 13.964/2019. Sem esse parágrafo, vale a regra geral do art. 100: a ação é pública incondicionada, e o Ministério Público denuncia sem depender da vítima.',
  body: [
    'O §5º havia sido incluído pelo Pacote Anticrime e trazia quatro exceções, nos incisos I a IV, em que a ação seguia incondicionada — vítima administração pública, criança ou adolescente, pessoa com deficiência mental e maior de setenta anos. A Lei 15.397 revogou o parágrafo e os quatro incisos, de modo que a distinção deixou de existir: toda vítima de estelionato está sob a mesma regra.',
    'No catálogo, a mudança alcança oito registros: o caput do art. 171 e as sete figuras do §2º — disposição de coisa alheia como própria, alienação ou oneração fraudulenta de coisa própria, defraudação de penhor, fraude na entrega de coisa, fraude para recebimento de seguro, fraude no pagamento por meio de cheque e cessão de conta bancária para atividade ilícita.',
    'A alteração é in pejus: a persecução deixa de depender da iniciativa do ofendido, e o prazo decadencial de seis meses para representar, que podia extinguir a punibilidade, não se aplica mais.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.2',
  links: [
    {label: 'Lei nº 15.397, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15397.htm'},
    {label: 'Estelionato (CP, art. 171, caput)', href: urlPublica('/tipos/127')},
    {label: 'Fraude no pagamento por meio de cheque (CP, art. 171, §2º, VI)', href: urlPublica('/tipos/594')},
  ],
};

export default entrada;
