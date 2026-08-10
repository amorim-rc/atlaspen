import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-10-conferidor-eca',
  date: '2026-08-10',
  title: "ECA — 6 penas corrigidas contra o texto oficial",
  summary:
    "Rodada automática do conferidor — ECA: 6 penas corrigidas, contra o texto compilado do Planalto.",
  body: [
    "São 6 registros cuja moldura ou espécie de pena não correspondia ao que o diploma comina hoje: o art. 240 constava com 4 a 8 anos de reclusão e passa a 4 a 10 anos de reclusão; o art. 241-A constava com 3 a 6 anos de reclusão e passa a 4 a 10 anos de reclusão; o art. 241-B constava com 1 a 4 anos de reclusão e passa a 3 a 6 anos de reclusão. Cada correção foi conferida contra o texto compilado no Planalto, dispositivo a dispositivo.",
    "A conferência é semanal e determinística: baixa o texto compilado, lê as molduras e compara com o publicado. Onde não há leitura segura, o achado vira pergunta na triagem da semana em vez de virar dado.",
  ],
  tipo: 'correcao',
  areas: ['Tipos penais'],
  version: 'v2.0.1',
};

export default entrada;
