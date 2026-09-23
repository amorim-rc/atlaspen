import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15383-pejus',
  date: '2026-09-14',
  title: 'Lei nº 15.383, de 2026: aumento de pena no descumprimento de medida protetiva',
  summary:
    'A lei incluiu o §4º no art. 24-A da Lei 11.340/2006 (Lei Maria da Penha). A pena do descumprimento de medida protetiva de urgência, reclusão de 2 a 5 anos, é aumentada de um terço até a metade em duas hipóteses.',
  body: [
    'O aumento vale quando o descumprimento decorre da violação de área de exclusão monitorada eletronicamente, ou da remoção ou alteração do dispositivo de monitoração. Entra como causa de aumento na dosimetria da ficha do tipo.',
  ],
  tipo: 'pejus',
  areas: ['Tipos penais', 'Dosimetria'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.383, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15383.htm'},
    {label: 'Lei 11.340/2006, art. 24-A', href: urlPublica('/tipos/477')},
  ],
};

export default entrada;
