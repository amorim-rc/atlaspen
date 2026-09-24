import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15487-pejus',
  date: '2026-09-14',
  title: 'Lei nº 15.487, de 2026: crimes do ECA no rol dos hediondos',
  summary:
    'A lei reescreveu o inciso VII do parágrafo único do art. 1º da Lei 8.072/90, que passou de duas para catorze hipóteses do Estatuto da Criança e do Adolescente.',
  body: [
    'Entram no rol, no catálogo, os caputs dos arts. 240, 241, 241-A, 241-D e 244-A do ECA, e o caput do art. 241-B. O art. 241-C, simulação da participação de criança ou adolescente em cena de sexo explícito, ficou de fora.',
    'A hediondez muda os atributos penais que a leem, como a progressão de regime e o livramento condicional.',
  ],
  alcance: ['tipo', 'atributo'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.487, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15487.htm'},
    {label: 'ECA, art. 240', href: urlPublica('/tipos/455')},
    {label: 'ECA, art. 241', href: urlPublica('/tipos/456')},
    {label: 'ECA, art. 241-A', href: urlPublica('/tipos/457')},
    {label: 'ECA, art. 241-B', href: urlPublica('/tipos/458')},
    {label: 'ECA, art. 241-D', href: urlPublica('/tipos/460')},
    {label: 'ECA, art. 244-A', href: urlPublica('/tipos/464')},
  ],
};

export default entrada;
