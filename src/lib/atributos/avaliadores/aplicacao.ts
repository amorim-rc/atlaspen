// Avaliadores dos atributos de APLICAÇÃO DA PENA (pena concreta) — AtlasPen.
//
// Substituição por restritivas de direitos, sursis da pena, regime inicial,
// perdão judicial, arrependimento posterior e arrependimento eficaz (com a
// desistência voluntária).

import type {Avaliador} from './comum';
import {num, bool} from '../types';
import {formatPena, formatFracao} from '../../format';
import {ehReincidente, reincidenteEmDoloso, reincidenteEspecifico} from '../reincidencia';

export const AVALIADORES_APLICACAO: Record<string, Avaliador> = {
  substituicao: (c, p) => {
    const limite = num(p, 'limiteConcretaMeses');
    const viaCulposo = bool(p, 'culposoSemTeto') && c.culposo;
    const dentroPena = viaCulposo || c.penaConcreta <= limite;
    const semViolencia = viaCulposo || !bool(p, 'exigeSemViolencia') || (!c.violencia && !c.graveAmeaca);
    // Art. 44, II e §3º, CP: o reincidente em crime doloso não tem direito, mas o juiz
    // pode substituir se for socialmente recomendável e a reincidência não for
    // específica. O reincidente em crime culposo não é alcançado pelo inciso II.
    const especifico = bool(p, 'vedadoReincidenteEspecifico') && reincidenteEspecifico(c);
    const dolosoNaoEspecifico = !especifico && reincidenteEmDoloso(c);
    const cabivel = dentroPena && semViolencia && !especifico;
    return {
      status: !cabivel ? 'incabivel' : dolosoNaoEspecifico ? 'condicional' : 'cabivel',
      resumo: !dentroPena
        ? `Pena concreta superior a ${formatPena(limite)}.`
        : !semViolencia
          ? 'Crime doloso com violência ou grave ameaça.'
          : especifico
            ? 'Reincidência específica.'
            : dolosoNaoEspecifico
              ? 'Reincidente em crime doloso: depende de a substituição ser socialmente recomendável (art. 44, §3º).'
              : viaCulposo
                ? 'Crime culposo: substituição cabível qualquer que seja a pena.'
                : `Pena concreta ≤ ${formatPena(limite)}, crime sem violência/grave ameaça.`,
      detalhes: [
        `Pena privativa não superior a ${formatPena(limite)} e crime cometido sem violência ou grave ameaça (crime doloso).`,
        'Crimes culposos: cabível qualquer que seja a pena.',
        'Réu não reincidente em crime doloso (reincidente não específico: possível se socialmente recomendável, art. 44, §3º).',
      ],
      limiar: viaCulposo
        ? undefined
        : {
            descricao: `Pena concreta ≤ ${formatPena(limite)}`,
            referenciaMeses: c.penaConcreta,
            limiarMeses: limite,
            folgaMeses: limite - c.penaConcreta,
          },
    };
  },
  'sursis-pena': (c, p) => {
    const limite = num(p, 'limiteComumMeses');
    const limiteEtario = num(p, 'limiteEtarioMeses');
    // Art. 77, I, CP: "não seja reincidente em crime doloso". O §2º (etário e
    // humanitário) amplia só o teto de pena; os requisitos do caput continuam.
    const naoVedado = !bool(p, 'vedadoReincidente') || !reincidenteEmDoloso(c);
    const cabivel = c.penaConcreta <= limite && naoVedado;
    const cabivelEtario = c.penaConcreta <= limiteEtario && naoVedado;
    return {
      status: cabivel ? 'cabivel' : cabivelEtario ? 'condicional' : 'incabivel',
      resumo: cabivel
        ? `Pena concreta ≤ ${formatPena(limite)}.`
        : cabivelEtario
          ? `Sursis etário/humanitário: pena ≤ ${formatPena(limiteEtario)} (maior de 70 anos ou por saúde).`
          : !naoVedado
            ? 'Reincidente em crime doloso (art. 77, I).'
            : 'Pena concreta acima do limite do sursis.',
      detalhes: [
        `Sursis comum: pena privativa não superior a ${formatPena(limite)}, réu não reincidente em crime doloso.`,
        `Sursis etário: pena ≤ ${formatPena(limiteEtario)} para condenado maior de 70 anos.`,
        `Sursis humanitário: pena ≤ ${formatPena(limiteEtario)} por razões de saúde.`,
        'Subsidiário à substituição por PRD (art. 77, III).',
      ],
      limiar: {
        descricao: `Pena concreta ≤ ${formatPena(limite)} (comum)`,
        referenciaMeses: c.penaConcreta,
        limiarMeses: limite,
        folgaMeses: limite - c.penaConcreta,
      },
    };
  },
  regime: (c, p) => {
    const pisoFechado = num(p, 'limiteFechadoMeses');
    const pisoSemi = num(p, 'limiteSemiabertoMeses');
    let regime: string;
    if (c.penaConcreta > pisoFechado) regime = 'Fechado';
    // Art. 33, §2º, "b" e "c", CP: "não reincidente" — qualquer reincidência.
    else if (c.penaConcreta > pisoSemi) regime = ehReincidente(c) ? 'Fechado' : 'Semiaberto';
    else regime = ehReincidente(c) ? 'Semiaberto' : 'Aberto';

    const detalhes = [
      `Pena superior a ${formatPena(pisoFechado)}: regime inicial fechado.`,
      `Pena superior a ${formatPena(pisoSemi)} e até ${formatPena(pisoFechado)}: semiaberto (não reincidente).`,
      `Pena até ${formatPena(pisoSemi)}: aberto (não reincidente).`,
    ];
    if (c.hediondo && bool(p, 'hediondoFechado')) {
      detalhes.push(
        'Crimes hediondos/equiparados: na prática, regime inicial fechado; o STF (HC 111.840) afastou a obrigatoriedade automática — deve haver fundamentação.',
      );
      regime = c.penaConcreta > pisoSemi ? 'Fechado' : regime;
    }
    return {
      status: 'cabivel',
      resumo: `Regime inicial: ${regime}.`,
      detalhes,
      valor: regime.toLowerCase(),
    };
  },
  'perdao-judicial': (c, p) => {
    // Sem previsão expressa não há perdão judicial. Com a exigência desativada,
    // a simulação o estende aos culposos — a hipótese de generalização mais
    // discutida na doutrina.
    const compativel = bool(p, 'exigePrevisaoExpressa') ? c.perdaoJudicialPrevisto : c.culposo;
    return {
      status: compativel ? 'condicional' : 'incabivel',
      resumo: compativel
        ? 'Há previsão legal expressa; depende da circunstância eleita pela lei.'
        : bool(p, 'exigePrevisaoExpressa')
          ? 'Sem previsão legal expressa de perdão judicial para o tipo.'
          : 'Crime doloso — fora da hipótese de generalização simulada.',
      detalhes: [
        'Só é cabível nas hipóteses expressamente previstas em lei — não existe perdão judicial genérico.',
        'Hipóteses catalogadas: homicídio culposo (art. 121, §5º), lesão corporal culposa (art. 129), receptação culposa (art. 180, §5º), apropriação indébita previdenciária (art. 168-A, §3º), sonegação de contribuição previdenciária (art. 337-A, §2º), parto suposto (art. 242), subtração de incapazes (art. 249), colaboração premiada (art. 4º, Lei 12.850/13) e proteção a testemunhas (art. 13, Lei 9.807/99).',
        'Súmula 18, STJ: a sentença concessiva é declaratória da extinção da punibilidade e não subsiste qualquer efeito condenatório.',
      ],
    };
  },
  'arrependimento-posterior': (c, p) => {
    const semViolencia = !bool(p, 'exigeSemViolencia') || (!c.violencia && !c.graveAmeaca);
    const reparou = !bool(p, 'exigeReparacao') || c.reparouDano;
    const frMin = num(p, 'fracaoMin');
    const frMax = num(p, 'fracaoMax');
    const base = c.penaConcreta || c.penaMin;

    let status: 'cabivel' | 'incabivel' | 'condicional';
    let resumo: string;
    if (!semViolencia) {
      status = 'incabivel';
      resumo = 'Crime cometido com violência ou grave ameaça à pessoa.';
    } else if (!reparou) {
      status = 'condicional';
      resumo = 'Cabível se houver reparação do dano até o recebimento da denúncia.';
    } else {
      status = 'cabivel';
      resumo = `Redução de ${formatFracao(frMin)} a ${formatFracao(frMax)} → pena de ${formatPena(base * (1 - frMax))} a ${formatPena(base * (1 - frMin))}.`;
    }
    return {
      status,
      resumo,
      detalhes: [
        'Crime cometido sem violência ou grave ameaça à pessoa.',
        'Reparação do dano ou restituição da coisa, por ato voluntário, até o recebimento da denúncia ou da queixa.',
        `Causa obrigatória de diminuição de ${formatFracao(frMin)} a ${formatFracao(frMax)}; a fração varia conforme a celeridade e a integralidade da reparação.`,
        'Reparação após o recebimento da denúncia: atenuante genérica do art. 65, III, "b".',
      ],
    };
  },
  'arrependimento-eficaz': (c, p) => {
    // Contravenção: o art. 4º da LCP diz que a tentativa não é punível, e sem
    // tentativa punível não há de que desistir. A resposta não é "incabível
    // neste caso" — é que o instituto não alcança a espécie. Decisão 26.
    if (c.contravencao) {
      return {
        status: 'incabivel',
        resumo: 'Não se aplica às contravenções: a tentativa não é punível (LCP, art. 4º).',
        detalhes: [
          'Art. 4º da Lei das Contravenções Penais: "Não é punível a tentativa de contravenção."',
          'A desistência voluntária e o arrependimento eficaz excluem a tipicidade da ' +
            'tentativa; onde a tentativa já não é punível, não há o que excluir.',
        ],
      };
    }
    const exige = bool(p, 'exigeTentativaAdmitida');
    const compativel = !exige || c.admiteTentativa;
    return {
      status: compativel ? 'condicional' : 'incabivel',
      resumo: compativel
        ? 'Responde só pelos atos já praticados, se a desistência for voluntária ou o resultado for impedido.'
        : 'Tipo não admite tentativa — não há execução da qual desistir.',
      detalhes: [
        'Desistência voluntária: o agente interrompe a execução ainda em curso.',
        'Arrependimento eficaz: esgotados os atos executórios, o agente impede o resultado.',
        'Efeito: exclusão da tipicidade da tentativa — o agente responde apenas pelos atos já praticados.',
        'Se o resultado ocorrer apesar do esforço, resta a atenuante do art. 65, III, "b".',
      ],
    };
  },
};
