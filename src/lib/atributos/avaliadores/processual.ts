// Avaliadores dos atributos PROCESSUAIS (pena em abstrato) — AtlasPen.
//
// Transação penal, suspensão condicional do processo, acordo de não persecução
// penal e colaboração premiada. Medem a pena cominada, não a aplicada.

import type {Avaliador} from './comum';
import {foraDaJusticaMilitar} from './comum';
import {num, bool} from '../types';
import {formatPena, formatFracao} from '../../format';
import {ehReincidente} from '../reincidencia';

export const AVALIADORES_PROCESSUAL: Record<string, Avaliador> = {
  transacao: (c, p) => {
    const limite = num(p, 'limiteMaxMeses');
    if (c.justicaMilitar) return foraDaJusticaMilitar();
    // A contravenção é de menor potencial ofensivo pela espécie (art. 61): o teto
    // de pena só mede os crimes.
    const dentroPena = c.contravencao || c.penaMax <= limite;
    const ressalva = bool(p, 'vedadoViolencia') && (c.violencia || c.graveAmeaca);
    return {
      status: dentroPena ? (ressalva ? 'condicional' : 'cabivel') : 'incabivel',
      resumo: !dentroPena
        ? `Pena máxima acima de ${formatPena(limite)}.`
        : ressalva
          ? 'Dentro do teto, mas há violência/grave ameaça (ver Súmula 536, STJ).'
          : c.contravencao
            ? 'Contravenção penal → infração de menor potencial ofensivo, qualquer que seja a pena.'
            : `Pena máxima ≤ ${formatPena(limite)} → infração de menor potencial ofensivo.`,
      detalhes: [
        `Teto da infração de menor potencial ofensivo: ${formatPena(limite)}.`,
        ...(c.contravencao
          ? ['As contravenções penais são de menor potencial ofensivo pela espécie, qualquer que seja a pena (art. 61, Lei 9.099/95).']
          : []),
        'Proposta pelo Ministério Público antes do oferecimento da denúncia.',
        'Vedada em casos de violência doméstica e familiar contra a mulher (Súmula 536, STJ).',
      ],
      ...(c.contravencao
        ? {}
        : {
            limiar: {
              descricao: `Pena máxima ≤ ${formatPena(limite)}`,
              referenciaMeses: c.penaMax,
              limiarMeses: limite,
              folgaMeses: limite - c.penaMax,
            },
          }),
    };
  },
  'sursis-processual': (c, p) => {
    const limite = num(p, 'limiteMinMeses');
    if (c.justicaMilitar) return foraDaJusticaMilitar();
    const dentroPena = c.penaMin <= limite;
    const ressalva = bool(p, 'vedadoViolencia') && (c.violencia || c.graveAmeaca);
    return {
      status: dentroPena ? (ressalva ? 'condicional' : 'cabivel') : 'incabivel',
      resumo: !dentroPena
        ? `Pena mínima acima de ${formatPena(limite)}.`
        : ressalva
          ? 'Dentro do teto, mas há violência/grave ameaça (ver Súmula 536, STJ).'
          : `Pena mínima ≤ ${formatPena(limite)}.`,
      detalhes: [
        `Cabível quando a pena mínima cominada for igual ou inferior a ${formatPena(limite)}.`,
        `Período de prova de ${num(p, 'periodoProvaMinAnos')} a ${num(p, 'periodoProvaMaxAnos')} anos, com condições (art. 89, §1º).`,
        'Vedada em violência doméstica e familiar contra a mulher (Súmula 536, STJ).',
      ],
      limiar: {
        descricao: `Pena mínima ≤ ${formatPena(limite)}`,
        referenciaMeses: c.penaMin,
        limiarMeses: limite,
        folgaMeses: limite - c.penaMin,
      },
    };
  },
  anpp: (c, p) => {
    const limite = num(p, 'limiteMinMeses');
    const dentroPena = c.penaMin < limite;
    const semViolencia = !bool(p, 'exigeSemViolencia') || (!c.violencia && !c.graveAmeaca);
    // Art. 28-A, §2º, II, CPP: "se o investigado for reincidente" — qualquer reincidência.
    const naoVedado = !bool(p, 'vedadoReincidente') || !ehReincidente(c);
    const confissaoOk = !bool(p, 'exigeConfissao') || c.confessou;
    // Art. 28-A, §2º, I, CPP: não cabe se for cabível transação penal — a infração
    // de menor potencial ofensivo (contravenção, ou pena máxima até o teto do art.
    // 61 da Lei 9.099/95). Fora da Justiça Militar, onde a Lei 9.099/95 não se aplica.
    const cabeTransacao =
      bool(p, 'vedadoSeCabeTransacao') &&
      !c.justicaMilitar &&
      (c.contravencao || c.penaMax <= num(p, 'tetoMenorPotencialMeses'));

    let status: 'cabivel' | 'incabivel' | 'condicional' = 'incabivel';
    let resumo: string;
    if (!dentroPena) {
      resumo = `Pena mínima igual ou superior a ${formatPena(limite)}.`;
    } else if (cabeTransacao) {
      resumo = 'Cabe transação penal: o acordo não se aplica (art. 28-A, §2º, I).';
    } else if (!semViolencia) {
      resumo = 'Infração praticada com violência ou grave ameaça.';
    } else if (!naoVedado) {
      resumo = 'Vedado ao reincidente (art. 28-A, §2º, II).';
    } else {
      status = confissaoOk ? 'cabivel' : 'condicional';
      resumo = confissaoOk
        ? 'Requisitos objetivos preenchidos.'
        : 'Requisitos objetivos preenchidos; depende de confissão formal.';
    }
    return {
      status,
      resumo,
      detalhes: [
        `Pena mínima inferior a ${formatPena(limite)}.`,
        bool(p, 'exigeSemViolencia')
          ? 'Infração cometida sem violência ou grave ameaça à pessoa.'
          : 'Requisito de ausência de violência DESATIVADO (simulação de reforma).',
        'Confissão formal e circunstanciada do investigado.',
        'Vedado a reincidentes e quando cabível transação penal (art. 28-A, §2º).',
      ],
      limiar: {
        descricao: `Pena mínima < ${formatPena(limite)}`,
        referenciaMeses: c.penaMin,
        limiarMeses: limite,
        folgaMeses: limite - c.penaMin,
      },
    };
  },
  'colaboracao-premiada': (c, p) => {
    const frMax = num(p, 'fracaoReducaoMax');
    const penaBase = c.penaConcreta || c.penaMin;
    const reduzida = penaBase * (1 - frMax);
    return {
      status: 'condicional',
      resumo: `Redução de até ${formatFracao(frMax)}${bool(p, 'admitePerdaoJudicial') ? ' ou perdão judicial' : ''}, conforme a efetividade da colaboração.`,
      detalhes: [
        `Redução de até ${formatFracao(frMax)}: pena de ${formatPena(penaBase)} poderia cair para ${formatPena(reduzida)}.`,
        `Colaboração posterior à sentença: redução de até ${formatFracao(num(p, 'fracaoReducaoPosSentenca'))} (art. 4º, §5º).`,
        'Aplicável a qualquer tipo penal, desde que a colaboração produza um dos resultados do art. 4º, I a V.',
        'Depende de acordo com o Ministério Público ou a autoridade policial e de homologação judicial.',
      ],
    };
  },
};
