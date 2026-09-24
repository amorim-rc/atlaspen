import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15384-vicaricidio',
  date: '2026-09-14',
  title: 'Lei nº 15.384, de 2026: vicaricídio',
  summary: 'A lei incluiu no Código Penal o art. 121-B, o vicaricídio, com reclusão de 20 a 40 anos.',
  body: [
    'O vicaricídio é crime hediondo (art. 1º, I-C, da Lei 8.072/90).',
    'O parágrafo único aumenta a pena de um terço até a metade quando o crime é praticado na presença da mulher a quem se pretende causar sofrimento, punição ou controle; contra criança, adolescente, pessoa idosa ou pessoa com deficiência; ou em descumprimento de medida protetiva de urgência. O catálogo registra cada hipótese de aumento com a sua moldura, de 26 anos e 8 meses a 60 anos.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.384, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15384.htm'},
    {label: 'Vicaricídio (CP, art. 121-B)', href: urlPublica('/tipos/1308')},
    {label: 'CP, art. 121-B, parágrafo único, I', href: urlPublica('/tipos/1309')},
    {label: 'CP, art. 121-B, parágrafo único, II', href: urlPublica('/tipos/1310')},
    {label: 'CP, art. 121-B, parágrafo único, III', href: urlPublica('/tipos/1311')},
  ],
};

export default entrada;
