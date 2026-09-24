import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-24-estelionato-acao-no-tempo',
  date: '2026-09-24',
  title: 'A ação penal do estelionato passa a variar com a data do fato',
  summary:
    'A Lei 15.397/2026 revogou o § 5º do art. 171 do Código Penal, e o estelionato voltou a ser de ação penal pública incondicionada para fatos a partir de 4 de maio de 2026. Para os anteriores continua valendo a exigência de representação, e a ficha do tipo passa a dizer qual regra se aplica conforme a data.',
  body: [
    'A exigência de representação nasceu com o Pacote Anticrime, em vigor desde 23 de janeiro de 2020, e alcançava também fatos anteriores em processos sem trânsito em julgado — é o que o Supremo Tribunal Federal decidiu no HC 208.817 AgR, em 2023.',
    'Entre 23 de janeiro de 2020 e 3 de maio de 2026 a ação dependia de representação, salvo quando a vítima fosse a Administração Pública, criança ou adolescente, pessoa com deficiência mental, maior de 70 anos ou incapaz. A Lei 15.229/2025 ampliou essa última hipótese: desde 3 de outubro de 2025 basta ser pessoa com deficiência.',
    'Para fatos a partir de 4 de maio de 2026 a ação é incondicionada. Em qualquer data continua valendo o art. 182 do Código Penal, que condiciona a representação quando o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita.',
    'A ficha do tipo penal ganhou um campo de data do fato. Ele escolhe a regra aplicável aqui e também nos percentuais de progressão de regime, que mudaram duas vezes em 2026, em datas diferentes.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.3',
  links: [
    {label: 'Estelionato (CP, art. 171, caput)', href: urlPublica('/tipos/127')},
    {
      label: 'Lei nº 15.397, de 2026, no Planalto',
      href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15397.htm',
    },
  ],
};

export default entrada;
