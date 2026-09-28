import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-24-lei-15517-combustiveis',
  date: '2026-09-24',
  title: 'Lei nº 15.517, de 2026: furto, roubo e receptação de combustíveis',
  summary:
    'A lei criou sete tipos penais em torno do combustível desviado de instalação de produção, armazenamento ou transporte: três no furto (CP, art. 155, §§ 10 a 12), dois no roubo (art. 157, § 2º, XI, e § 2º-A, III) e dois na Lei 8.176/91 (arts. 1º-A e 1º-B). Em vigor desde 23 de setembro de 2026.',
  body: [
    'No furto, o § 10 do art. 155 pune com reclusão de 4 a 10 anos, e multa, a subtração de petróleo e derivados, gás natural, etanol e demais combustíveis, e óleos lubrificantes, removidos de instalação de produção, armazenamento ou transporte, incluídos dutos e unidades de transporte em qualquer modal. O § 11 aumenta essa pena de um terço quando há destruição ou rompimento de obstáculo ou dano de qualquer natureza, concurso de duas ou mais pessoas, abuso de confiança ou vínculo atual ou passado com o ente lesado, ou quando o autor ocupa cargo, emprego ou função pública. O § 12 aumenta de dois terços quando do crime resulta suspensão ou paralisação das atividades do estabelecimento, desabastecimento, incêndio, poluição efetiva ou potencial ao meio ambiente, lesão corporal grave ou morte.',
    'No roubo, o inciso XI do § 2º do art. 157 leva a subtração do mesmo combustível ao aumento de um terço até metade, e o inciso III do § 2º-A, ao aumento de dois terços quando dela resulta paralisação das atividades, desabastecimento, incêndio ou poluição. A alínea que previa o resultado morte foi vetada. Nenhuma das duas formas entrou no rol dos crimes hediondos.',
    'Na Lei 8.176/91, o art. 1º-A pune com reclusão de 3 a 8 anos, e multa, quem, no exercício de atividade comercial ou industrial, adquire, recebe, transporta, armazena, vende ou utiliza esse combustível sabendo que é produto de crime. O art. 1º-B pune com reclusão de 1 a 4 anos, e multa, quem o adquire, recebe ou mantém quando, pela natureza, pela desproporção entre valor e preço ou pela condição de quem oferece, devia presumir a origem criminosa: é a figura simétrica à receptação culposa do art. 180, § 3º, do Código Penal, e o § 1º permite ao juiz reduzir a pena de um a dois terços, ou dispensar a multa, se o agente é primário. Nenhum dos sete é hediondo: o rol do art. 1º da Lei 8.072/90 não os alcança.',
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
