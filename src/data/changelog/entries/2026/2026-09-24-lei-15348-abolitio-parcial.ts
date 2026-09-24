import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-24-lei-15348-abolitio-parcial',
  date: '2026-09-24',
  title: 'Lei nº 15.348, de 2026: parte do crime de combustíveis deixou de existir',
  summary:
    'A lei restringiu o inciso II do art. 1º da Lei 8.176/91 ao uso de GLP para fins automotivos. As hipóteses de motores de qualquer espécie não automotivos, saunas, caldeiras e aquecimento de piscinas deixaram de ser típicas. É abolitio criminis parcial, com vigência desde 13 de fevereiro de 2026.',
  body: [
    'O tipo continua existindo no que restou do inciso, e por isso o registro mantém o mesmo identificador e a mesma moldura de pena. O que mudou foi o alcance: condutas que eram crime deixaram de ser.',
    'A distinção importa. Não se trata de novatio legis in mellius, em que a conduta segue punível com tratamento mais favorável: quem usava GLP em sauna ou caldeira não passou a responder mais brandamente, deixou de responder. A consequência é a do art. 2º do Código Penal — a lei retroage — e a do art. 107, III, que extingue a punibilidade.',
    'Fica a ressalva de que a conduta pode, conforme o caso, subsumir-se ao art. 56 da Lei 9.605/98, que trata do produto ou substância tóxica em desacordo com as exigências legais.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.3',
  links: [
    {
      label: 'Lei nº 15.348, de 2026, no Planalto',
      href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15348.htm',
    },
    {label: 'Lei 8.176/91, art. 1º', href: urlPublica('/tipos/543')},
  ],
};

export default entrada;
