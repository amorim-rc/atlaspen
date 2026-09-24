import type {ChangelogEntry} from '../../types';
import {urlPublica} from '../../../../site/config.ts';

const entrada: ChangelogEntry = {
  id: '2026-09-14-lei-15397-pejus',
  date: '2026-09-14',
  title: 'Lei nº 15.397, de 2026: penas agravadas nos crimes patrimoniais',
  summary:
    'A Lei nº 15.397, vigente desde 4 de maio de 2026, elevou as penas de furto, roubo, latrocínio, receptação e interrupção de serviço de comunicação. Cada moldura foi conferida no texto compilado do Planalto.',
  body: [
    'Furto (CP, art. 155): o caput passa de 1 a 4 anos para 1 a 6 anos de reclusão; o aumento do repouso noturno (§1º), de um terço para metade; a fraude eletrônica (§4º-B), de 4 a 8 para 4 a 10 anos; o furto de veículo levado a outro Estado ou ao exterior (§5º), de 3 a 8 para 4 a 10 anos. Os §§ 6º e 7º ganham nova redação, com 4 a 10 anos.',
    'Roubo (CP, art. 157): o caput passa de 4 a 10 para 6 a 10 anos; o latrocínio (§3º, II), de 20 a 30 para 24 a 30 anos.',
    'Receptação (CP, art. 180, caput): de 1 a 4 para 2 a 6 anos. Receptação de animal (art. 180-A): de 2 a 5 para 3 a 8 anos. Interrupção ou perturbação de serviço telegráfico, telefônico, informático, telemático ou de informação de utilidade pública (art. 266): de 1 a 3 para 2 a 4 anos.',
  ],
  alcance: ['tipo'],
  version: 'v0.0.1',
  links: [
    {label: 'Lei nº 15.397, de 2026, no Planalto', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15397.htm'},
    {label: 'Furto simples (CP, art. 155, caput)', href: urlPublica('/tipos/86')},
    {label: 'Roubo simples (CP, art. 157, caput)', href: urlPublica('/tipos/95')},
    {label: 'Latrocínio (CP, art. 157, §3º, II)', href: urlPublica('/tipos/105')},
    {label: 'Receptação simples (CP, art. 180, caput)', href: urlPublica('/tipos/129')},
  ],
};

export default entrada;
