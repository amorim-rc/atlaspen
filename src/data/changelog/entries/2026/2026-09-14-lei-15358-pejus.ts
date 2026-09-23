import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15358-pejus',
  date: '2026-09-14',
  title: 'Lei nº 15.358, de 2026: progressão mais longa para crimes hediondos',
  summary:
    'A lei deu nova redação aos incisos V a VIII do art. 112 da Lei de Execução Penal e incluiu a alínea "d" do inciso VI. As frações de progressão dos crimes hediondos e equiparados sobem.',
  body: [
    'Para o condenado por crime hediondo ou equiparado, a progressão passa a exigir 70% da pena (inciso V, antes 40%), 75% (inciso VI, antes 50%), 80% (inciso VII, antes 60%) e 85% (inciso VIII, antes 70%).',
    'O inciso VI alcança, com 75%, o comando de organização criminosa ultraviolenta (alínea "b") e a constituição de milícia privada, ao primário e ao reincidente (alínea "c"). A alínea "d", incluída, exige 75% do primário condenado por feminicídio e veda a ele o livramento condicional.',
  ],
  tipo: 'pejus',
  areas: ['Atributos'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.358, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15358.htm#art35'},
    {label: 'Progressão de regime', href: urlPublica('/atributos/progressao')},
    {label: 'Livramento condicional', href: urlPublica('/atributos/livramento')},
  ],
};

export default entrada;
