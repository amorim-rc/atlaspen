import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-14-reserva-legal-no-sentinela',
  date: '2026-08-14',
  title: 'Só lei ordinária e lei complementar criam crime — e o robô passou a saber disso',
  summary:
    'O vigia do Diário Oficial aceitava seis espécies normativas. São duas. O princípio da reserva legal não é um detalhe de eficiência do filtro: é o que define o universo daquilo que ele pode encontrar.',
  body: [
    'A lista aceitava lei, lei complementar, lei delegada, medida provisória, decreto-lei e emenda constitucional. A medida provisória estava lá por um argumento de desenho — o robô registra o que foi publicado, não julga constitucionalidade —, e o argumento não resiste ao art. 62, §1º, I, "b", da Constituição, que veda medida provisória sobre direito penal. Vigiar por ela era vigiar o que não pode existir.',
    'Pela mesma razão saíram as outras três. A lei delegada não alcança direitos individuais (art. 68, §1º, II). O decreto-lei é espécie extinta desde 1988: os que existem são anteriores, e nenhum novo será publicado. A emenda constitucional não cria tipo — os arts. 5º, XLI a XLIII, são mandados de criminalização, dirigidos ao legislador ordinário.',
    'O efeito prático apareceu na primeira rodada real depois da mudança: três medidas provisórias que a janela anterior listava, para serem descartadas uma a uma, simplesmente deixaram de ser baixadas. Menos ruído, e por um motivo que é de direito, não de desempenho.',
    'A mesma rodada estreou a página que explica os quatro robôs — o que cada um vigia, com que critério corta e o que nenhum deles alcança. Ela existe para receber discordância: os critérios são escolhas, várias são discutíveis, e esta foi corrigida exatamente assim.',
  ],
  tipo: 'correcao',
  areas: ['Tipos penais', 'Documentação'],
  version: 'v2.0.6',
};

export default entrada;
