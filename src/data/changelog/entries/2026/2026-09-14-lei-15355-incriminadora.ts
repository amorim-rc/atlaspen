import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15355-incriminadora',
  date: '2026-09-14',
  title: 'Lei nº 15.355, de 2026: desastre ambiental que prejudica animais',
  summary:
    'A lei incluiu o §1º-C no art. 32 da Lei 9.605/98: provocar desastre ambiental que prejudique a vida, a integridade física ou o bem-estar de animais silvestres ou domésticos.',
  body: [
    'A pena é a do caput do art. 32: detenção de 3 meses a 1 ano, e multa.',
    'O art. 54 da mesma lei já punia, com reclusão de 1 a 4 anos, a poluição que provoque a mortandade de animais.',
  ],
  tipo: 'incriminadora',
  areas: ['Tipos penais'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.355, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15355.htm'},
    {label: 'Lei 9.605/98, art. 32, §1º-C', href: urlPublica('/tipos/1328')},
  ],
};

export default entrada;
