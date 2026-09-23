import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15397-dispositivos-incluidos',
  date: '2026-09-14',
  title: 'Lei nº 15.397, de 2026: dispositivos incluídos nos crimes patrimoniais',
  summary:
    'A mesma lei incluiu no Código Penal dispositivos com pena própria, que o catálogo passou a registrar como tipos penais.',
  body: [
    'Furto qualificado de bens de órgãos públicos ou de serviços essenciais (art. 155, §4º, V), 2 a 8 anos; furto de fios, cabos ou equipamentos de energia, telefonia ou dados (art. 155, §8º), 2 a 8 anos.',
    'Roubo de bens que comprometam serviços públicos ou de relevância pública (art. 157, §1º-A), 6 a 12 anos; roubo com subtração de celular, computador ou dispositivo eletrônico, e de arma de fogo (art. 157, §2º, IX e X), causas de aumento que levam a moldura a 8 a 15 anos.',
    'Cessão de conta bancária para financiar ou ocultar atividade criminosa (art. 171, §2º, VII), nas penas do caput do estelionato, 1 a 5 anos.',
  ],
  tipo: 'pejus',
  areas: ['Tipos penais'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.397, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15397.htm'},
    {label: 'CP, art. 155, §4º, V', href: urlPublica('/tipos/815')},
    {label: 'CP, art. 155, §8º', href: urlPublica('/tipos/816')},
    {label: 'CP, art. 157, §1º-A', href: urlPublica('/tipos/811')},
    {label: 'CP, art. 157, §2º, IX', href: urlPublica('/tipos/813')},
    {label: 'CP, art. 157, §2º, X', href: urlPublica('/tipos/814')},
    {label: 'CP, art. 171, §2º, VII', href: urlPublica('/tipos/820')},
  ],
};

export default entrada;
