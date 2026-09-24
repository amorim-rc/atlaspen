import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15410-tortura-mulher',
  date: '2026-09-14',
  title: 'Lei nº 15.410, de 2026: tortura de mulher no contexto de violência doméstica',
  summary:
    'A lei incluiu o inciso III no art. 1º da Lei 9.455/97: submeter mulher, reiteradamente, a intenso sofrimento físico ou mental no contexto de violência doméstica e familiar.',
  body: [
    'A pena é de reclusão de 2 a 8 anos, sem prejuízo das penas de outras infrações. Como forma de tortura, o crime é equiparado a hediondo (CF, art. 5º, XLIII).',
  ],
  alcance: ['tipo'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.410, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15410.htm'},
    {label: 'Lei 9.455/97, art. 1º, III', href: urlPublica('/tipos/1332')},
  ],
};

export default entrada;
