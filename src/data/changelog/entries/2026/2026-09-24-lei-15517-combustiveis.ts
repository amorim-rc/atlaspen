import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-24-lei-15517-combustiveis',
  date: '2026-09-24',
  title: 'Lei nº 15.517, de 2026: furto, roubo e receptação de combustíveis',
  summary:
    'A lei criou sete tipos penais em torno do combustível desviado de instalação de produção, armazenamento ou transporte: três no furto (CP, art. 155, §§ 10 a 12), dois no roubo (art. 157, § 2º, XI, e § 2º-A, III) e dois na Lei 8.176/91 (arts. 1º-A e 1º-B). Em vigor desde 23 de setembro de 2026.',
  body: [
    'No furto, o § 10 do art. 155 pune com reclusão de 4 a 10 anos a subtração de combustível de instalação de produção, armazenamento ou transporte. Os §§ 11 e 12 elevam a pena quando há concurso de pessoas ou emprego de explosivo.',
    'No roubo, o inciso XI do § 2º e o inciso III do § 2º-A do art. 157 tratam da mesma matéria com as penas próprias do tipo, que já pressupõe violência ou grave ameaça.',
    'Na Lei 8.176/91, o art. 1º-A pune a conduta dolosa e o art. 1º-B a culposa. Nenhum dos sete é hediondo: o rol do art. 1º da Lei 8.072/90 não os alcança.',
    'A natureza da mudança é novatio legis in pejus, e não incriminadora: a conduta já era punível como furto, roubo ou receptação. O que a lei fez foi destacá-la com moldura própria e mais severa.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.3',
  links: [
    {
      label: 'Lei nº 15.517, de 2026, no Planalto',
      href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15517.htm',
    },
    {label: 'CP, art. 155, § 10', href: urlPublica('/tipos/1513')},
    {label: 'CP, art. 157, § 2º, XI', href: urlPublica('/tipos/1516')},
    {label: 'Lei 8.176/91, art. 1º-A', href: urlPublica('/tipos/1518')},
  ],
};

export default entrada;
