import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-11-fracoes-de-dia',
  date: '2026-08-11',
  title: 'A dosimetria passa a desprezar as frações de dia, como manda o art. 11',
  summary:
    'O motor arredondava a pena ao décimo de mês. O Código Penal manda outra coisa: despreza-se a fração de DIA, e despreza-se — não se arredonda. Arredondar podia subir a pena, que é exatamente o que o art. 11 existe para impedir.',
  body: [
    'O art. 11 diz que se desprezam, nas penas privativas de liberdade e nas restritivas de direitos, as frações de dia. Duas coisas estavam erradas. A unidade: o que se despreza são as horas, não os décimos de mês — e um décimo de mês são três dias. E a operação: desprezar é truncar, nunca arredondar; arredondar para cima agrava a pena por conta de máquina, sem lei que autorize.',
    'O desprezo incide sobre o efeito — o quanto se soma ou se subtrai —, e não sobre o resultado. O exemplo clássico: pena de 6 meses e 15 dias, reduzida de 1/6. A extração dá 1 mês, 2 dias e 12 horas; desprezam-se as 12 horas, extraem-se 1 mês e 2 dias, e a pena final é de 5 meses e 13 dias. Truncar o resultado em vez do efeito daria 5 meses e 12 dias — um dia a menos, por conta errada. O motor agora reproduz o primeiro caminho.',
    'A tela acompanhou, e aqui a diferença é maior do que parece: a pena era exibida com Math.round sobre os meses, de modo que 5 meses e 13 dias apareciam como "5 meses". Os dias sumiam da tela depois de terem sido calculados. Agora a pena é escrita em anos, meses e dias — que é como se conta pena penal, e é a unidade que decide prescrição, progressão e detração.',
    'Fica registrado o que NÃO foi feito: a segunda metade do art. 11 manda desprezar, na pena de multa, as frações da menor unidade da moeda — os centavos, lido "cruzeiro" como a moeda vigente. O catálogo modela a multa como presença e regime, não como valor, e por isso não há o que truncar ainda. Quando a multa virar número, a regra é a mesma: despreza-se, não se arredonda.',
  ],
  tipo: 'correcao',
  areas: ['Dosimetria', 'Interface'],
  version: 'v2.0.6',
};

export default entrada;
