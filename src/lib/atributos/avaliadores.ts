// Funções de avaliação dos atributos penais — AtlasPen.
//
// O atributo é dado (data/atributos.json: nome, fundamento, requisitos,
// vedações, parâmetros e as redações de cada um); aqui fica só o cálculo, uma
// função pura por atributo, que lê os parâmetros em vez de constantes. A chave é
// o `slug` da base. `scripts/verificar_atributos.ts` reprova atributo sem
// avaliador, avaliador sem atributo e parâmetro lido que não exista nos dados.
//
// As funções saíram do antigo catálogo em código por recorte mecânico (frente 5
// do backlog), e o teste de equivalência provou que o cálculo não mudou.
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';
import type {Avaliacao, Parametros} from './types';
import {num, bool} from './types';
import {formatPena, formatFracao} from '../format';
import {ehReincidente, reincidenteEmDoloso, reincidenteEspecifico} from './reincidencia';

const ANO = 12;

/**
 * As quatro hipóteses em que o próprio art. 112 da LEP diz, na letra do inciso,
 * "vedado o livramento condicional": VI, "a", "b" e "d", e VIII. Devolve o
 * fundamento, ou `null` quando nenhuma incide.
 *
 * A vedação vive aqui, e não apenas no texto de `vedacoes`, porque é regra de
 * CÁLCULO. Enquanto ficou só escrita, o motor seguia oferecendo o livramento aos
 * 2/3 a quem a LEP o proíbe — o texto dizia uma coisa e o número dizia outra.
 *
 * A ordem espelha a da progressão: a alínea "b" (comando de facção) não depende
 * do resultado morte e por isso é testada antes da "a".
 */
export function vedacaoLivramentoArt112(c: Cenario): string | null {
  if (c.hediondo && c.resultadoMorte && reincidenteEspecifico(c)) {
    return (
      'Art. 112, VIII, LEP: reincidente em crime hediondo ou equiparado com resultado ' +
      'morte — 85% da pena, vedado o livramento condicional.'
    );
  }
  if (c.comandoOrgcrimUltraviolenta && c.hediondo) {
    return (
      'Art. 112, VI, "b", LEP (redação da Lei 15.358/2026): condenado por exercer o ' +
      'comando, individual ou coletivo, de organização criminosa ultraviolenta ' +
      'estruturada para a prática de crime hediondo ou equiparado — vedado o livramento ' +
      'condicional.'
    );
  }
  if (c.feminicidio && !reincidenteEspecifico(c)) {
    return (
      'Art. 112, VI, "d", LEP (alínea incluída pela Lei 15.358/2026): primário condenado ' +
      'pela prática de feminicídio — vedado o livramento condicional.'
    );
  }
  if (c.hediondo && c.resultadoMorte) {
    return (
      'Art. 112, VI, "a", LEP: primário condenado por crime hediondo ou equiparado com ' +
      'resultado morte — vedado o livramento condicional.'
    );
  }
  return null;
}

/**
 * Lei 9.099/95, art. 90-A, incluído pela Lei 9.839/1999: "As disposições desta
 * Lei não se aplicam no âmbito da Justiça Militar." Nem transação penal nem
 * suspensão condicional do processo nos crimes do CPM.
 */
function foraDaJusticaMilitar(): Avaliacao {
  return {
    status: 'incabivel',
    resumo: 'Crime militar: a Lei 9.099/95 não se aplica no âmbito da Justiça Militar (art. 90-A).',
    detalhes: [
      'Art. 90-A da Lei 9.099/95, incluído pela Lei 9.839/1999: "As disposições desta Lei não se aplicam no âmbito da Justiça Militar."',
      'Nem a transação penal nem a suspensão condicional do processo alcançam os crimes do CPM.',
    ],
  };
}

export const AVALIADORES: Record<string, (c: Cenario, p: Parametros) => Avaliacao> = {
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

    let status: 'cabivel' | 'incabivel' | 'condicional' = 'incabivel';
    let resumo: string;
    if (!dentroPena) {
      resumo = `Pena mínima igual ou superior a ${formatPena(limite)}.`;
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
  progressao: (c, p) => {
    const comViolencia = c.violencia || c.graveAmeaca;
    let fracao: number;
    let inciso: string;
    if (c.hediondo && c.resultadoMorte && reincidenteEspecifico(c)) {
      fracao = num(p, 'fracaoReincidenteHediondoMorte');
      inciso = 'VIII — reincidente específico, hediondo com resultado morte (livramento vedado)';
    } else if (c.comandoOrgcrimUltraviolenta && c.hediondo) {
      // Alínea "b" antes da "a": o comando de facção ultraviolenta não depende do
      // resultado morte, e sem esta ordem o comandante condenado por crime hediondo
      // SEM morte cairia no inciso V (70%, livramento aos 2/3) — perdendo tanto o
      // percentual quanto a vedação que a Lei 15.358/2026 impôs.
      fracao = num(p, 'fracaoComandoOrgcrim');
      inciso =
        'VI, "b" — comando de organização criminosa ultraviolenta estruturada para crime ' +
        'hediondo (livramento vedado)';
    } else if (c.feminicidio && !reincidenteEspecifico(c)) {
      fracao = num(p, 'fracaoFeminicidioPrimario');
      inciso = 'VI, "d" — primário, feminicídio (livramento vedado)';
    } else if (c.hediondo && c.resultadoMorte) {
      fracao = num(p, 'fracaoPrimarioHediondoMorte');
      inciso = 'VI, "a" — primário, hediondo com resultado morte (livramento vedado)';
    } else if (c.hediondo && reincidenteEspecifico(c)) {
      fracao = num(p, 'fracaoReincidenteHediondo');
      inciso = 'VII — reincidente, hediondo';
    } else if (c.hediondo) {
      fracao = num(p, 'fracaoPrimarioHediondo');
      inciso = 'V — primário, hediondo/equiparado';
    } else if (c.miliciaPrivada) {
      // Alínea "c" do inciso VI. A constituição de milícia privada (art. 288-A do
      // CP) não é hedionda, e o catálogo a registra com violência e grave ameaça:
      // sem este ramo ela caía no inciso I ou II e saía com 25% ou 30%, quando a
      // lei manda 75% ao primário e ao reincidente. Fica antes do ramo da redação
      // de 2019 porque a alínea já existia nela (com 50%); o caso concreto só
      // distingue a Lei 15.402, e a fração aqui é a da Lei 15.358 — a mesma
      // limitação dos hediondos (estudos/modelo-atributos.md, achado C).
      fracao = num(p, 'fracaoMiliciaPrivada');
      inciso = 'VI, "c" — constituição de milícia privada';
    } else if (c.fatoAnteriorA15402) {
      // Tabela do Pacote Anticrime, para fato até 07/05/2026. Ela não é "a
      // antiga": continua sendo a lei do caso, porque a Lei 15.402/2026 é mais
      // gravosa para o primário sem violência (16% viraram 16,67%) e lei mais
      // gravosa não retroage. A retroatividade da lei benéfica se apura por
      // SITUAÇÃO CONCRETA, não em bloco.
      if (comViolencia && reincidenteEspecifico(c)) {
        fracao = num(p, 'fracaoReincidenteViolencia');
        inciso = 'IV — reincidente, crime com violência/grave ameaça (redação de 2019)';
      } else if (comViolencia) {
        fracao = num(p, 'fracaoPrimarioViolencia');
        inciso = 'III — primário, crime com violência/grave ameaça (redação de 2019)';
      } else if (reincidenteEspecifico(c)) {
        fracao = num(p, 'fracaoReincidenteSemViolencia');
        inciso = 'II — reincidente, sem violência/grave ameaça (redação de 2019)';
      } else {
        fracao = num(p, 'fracaoPrimarioSemViolencia');
        inciso = 'I — primário, sem violência/grave ameaça (redação de 2019)';
      }
    } else if (c.tituloXII) {
      // Os incisos I e II ressalvam expressamente os crimes do Título XII, e a
      // ressalva é TOPOGRÁFICA: não pergunta se houve violência. Para o
      // primário sobra o caput, e isso é leitura literal. Para o REINCIDENTE o
      // texto comporta duas saídas — ver o resumo devolvido abaixo.
      fracao = num(p, 'fracaoCaputRegimeAnterior');
      inciso = reincidenteEspecifico(c)
        ? 'caput — crime do Título XII, reincidente (LEITURA EM DISPUTA: 1/6 pelo ' +
          'caput, ou 20% pelo inciso III)'
        : 'caput — crime do Título XII, primário (os incisos I e II o ressalvam)';
    } else if (comViolencia && reincidenteEspecifico(c)) {
      fracao = num(p, 'fracaoReincidenteViolencia');
      inciso = 'II — reincidente, crime com violência/grave ameaça';
    } else if (comViolencia) {
      fracao = num(p, 'fracaoPrimarioViolencia');
      inciso = 'I — primário, crime com violência/grave ameaça';
    } else if (reincidenteEspecifico(c)) {
      fracao = num(p, 'fracaoReincidenteSemViolencia');
      inciso = 'III — reincidente em crime diverso dos dos incisos I e II';
    } else {
      fracao = num(p, 'fracaoCaputRegimeAnterior');
      inciso = 'caput — primário, crime sem violência/grave ameaça';
    }
    const tempo = c.penaConcreta * fracao;
    const peloCaput = inciso.startsWith('caput');
    const detalhes = [
      `Percentual aplicável: ${inciso}.`,
      `Tempo necessário sobre a pena de ${formatPena(c.penaConcreta)}: ${formatPena(tempo)}.`,
      'Requisito subjetivo: boa conduta carcerária (art. 112, §1º).',
    ];
    if (peloCaput) {
      detalhes.push(
        'O caput conta 1/6 da pena NO REGIME ANTERIOR, e não da pena total como os ' +
          'incisos. Na primeira progressão as duas bases coincidem — é o que está ' +
          'calculado acima; nas seguintes, a base é o remanescente.',
      );
    }
    if (!c.fatoAnteriorA15402 && !c.hediondo && !c.miliciaPrivada) {
      detalhes.push(
        'Redação da Lei 15.402/2026, em vigor desde 08/05/2026. Para fato anterior, ' +
          'marque a circunstância correspondente: para o primário em crime sem ' +
          'violência a lei nova é mais gravosa (16% → 16,67%) e não retroage.',
      );
    }
    if (c.tituloXII && reincidenteEspecifico(c)) {
      detalhes.push(
        'DUAS LEITURAS SUSTENTÁVEIS, e a diferença é de 3,33 pontos. Pelo inciso III ' +
          '(20%): ele alcança o "reincidente em crime diverso dos referidos nos incisos ' +
          'I e II", e os do Título XII estão expressamente fora do alcance de I e II. ' +
          'Pelo caput (1/6): "crimes referidos nos incisos I e II" significaria crimes ' +
          'com violência ou grave ameaça, categoria a que os do Título XII pertencem ' +
          'materialmente — não sendo diversos, restariam no caput. Está calculado pelo ' +
          'caput, que é o resultado mais favorável; a questão é dos tribunais de execução.',
      );
    }
    const percentual = `${(fracao * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
    return {
      status: c.tituloXII && reincidenteEspecifico(c) ? 'condicional' : 'cabivel',
      resumo: `Fração de ${percentual} → ${formatPena(tempo)} de cumprimento.`,
      detalhes,
      valor: `${percentual} — ${formatPena(tempo)}`,
    };
  },
  livramento: (c, p) => {
    const minimo = num(p, 'penaMinimaMeses');
    if (c.penaConcreta < minimo) {
      return {
        status: 'incabivel',
        resumo: `Exige pena privativa igual ou superior a ${formatPena(minimo)}.`,
        detalhes: [`Pressuposto objetivo: pena privativa de liberdade igual ou superior a ${formatPena(minimo)}.`],
        limiar: {
          descricao: `Pena concreta ≥ ${formatPena(minimo)}`,
          referenciaMeses: c.penaConcreta,
          limiarMeses: minimo,
          folgaMeses: c.penaConcreta - minimo,
        },
      };
    }
    if (c.hediondo && reincidenteEspecifico(c) && bool(p, 'vedadoReincidenteHediondo')) {
      return {
        status: 'incabivel',
        resumo: 'Vedado ao reincidente específico em crime hediondo.',
        detalhes: ['Art. 83, V, CP: vedado para reincidente específico em crimes hediondos ou equiparados.'],
      };
    }
    const vedacao112 = bool(p, 'vedadoArt112') ? vedacaoLivramentoArt112(c) : null;
    if (vedacao112) {
      return {
        status: 'incabivel',
        resumo: 'Vedado pelo inciso do art. 112 da LEP aplicável à progressão.',
        detalhes: [vedacao112],
      };
    }
    let fracao: number;
    let base: string;
    if (c.hediondo) {
      fracao = num(p, 'fracaoHediondo');
      base = `crime hediondo/equiparado (${formatFracao(num(p, 'fracaoHediondo'))})`;
    } else if (reincidenteEmDoloso(c)) {
      // Art. 83, II, CP: "reincidente em crime doloso"; o culposo fica no inciso I.
      fracao = num(p, 'fracaoReincidente');
      base = `reincidente em crime doloso (${formatFracao(num(p, 'fracaoReincidente'))})`;
    } else {
      fracao = num(p, 'fracaoPrimario');
      base = `primário e bons antecedentes (${formatFracao(num(p, 'fracaoPrimario'))})`;
    }
    const tempo = c.penaConcreta * fracao;
    return {
      status: 'cabivel',
      valor: `${formatFracao(fracao)} — ${formatPena(tempo)}`,
      resumo: `Fração de ${formatFracao(fracao)} → ${formatPena(tempo)} cumpridos.`,
      detalhes: [
        `Fração aplicável: ${base}.`,
        `Tempo mínimo de cumprimento: ${formatPena(tempo)}.`,
        'Requisitos: bom comportamento, aptidão para o trabalho e reparação do dano (salvo impossibilidade).',
      ],
    };
  },
  prescricao: (c, p) => {
    const fator = bool(p, 'reducaoEtaria') ? 0.5 : 1;
    const prazo = (penaMeses: number): number => {
      let base: number;
      if (penaMeses > 12 * ANO) base = num(p, 'prazoMaisDe12Anos');
      else if (penaMeses > 8 * ANO) base = num(p, 'prazoMaisDe8Anos');
      else if (penaMeses > 4 * ANO) base = num(p, 'prazoMaisDe4Anos');
      else if (penaMeses > 2 * ANO) base = num(p, 'prazoMaisDe2Anos');
      else if (penaMeses >= 1 * ANO) base = num(p, 'prazoMaisDe1Ano');
      else base = num(p, 'prazoAteUmAno');
      return base * fator;
    };
    const abstrata = prazo(c.penaMax);
    const concreta = c.penaConcreta > 0 ? prazo(c.penaConcreta) : null;
    // Art. 110, caput, CP: depois do trânsito em julgado, os prazos aumentam de um
    // terço se o condenado é reincidente. A pretensão punitiva não muda (Súmula 220, STJ).
    const aumento = ehReincidente(c) ? num(p, 'aumentoReincidente') : 0;
    const executoria = concreta !== null && aumento > 0 ? concreta * (1 + aumento) : null;
    return {
      status: 'cabivel',
      valor: formatPena(abstrata),
      resumo: `Em abstrato (pena máx.): ${formatPena(abstrata)}.`,
      detalhes: [
        `Prescrição em abstrato, pela pena máxima de ${formatPena(c.penaMax)}: ${formatPena(abstrata)}.`,
        concreta
          ? `Prescrição pela pena concreta de ${formatPena(c.penaConcreta)}: ${formatPena(concreta)}.`
          : 'Informe uma pena concreta para calcular a prescrição retroativa/executória.',
        ...(executoria !== null
          ? [`Executória, reincidente: ${formatPena(concreta!)} aumentados de ${formatFracao(aumento)} → ${formatPena(executoria)} (art. 110).`]
          : []),
        fator === 0.5
          ? 'Redução do art. 115 APLICADA (menor de 21 no fato ou maior de 70 na sentença).'
          : 'Redução pela metade se o agente é menor de 21 na data do fato ou maior de 70 na sentença (art. 115).',
      ],
    };
  },
  'saida-temporaria': (c, p) => {
    // Art. 122, §2º, da LEP, na redação da Lei 14.843/2024. Até ela, a vedação
    // alcançava só o hediondo com resultado morte (redação da Lei 13.964/2019).
    const porHediondo = bool(p, 'vedadoHediondo') && c.hediondo;
    const porViolencia = bool(p, 'vedadoViolencia') && (c.violencia || c.graveAmeaca);
    // Art. 123, II, LEP: 1/4 "se reincidente" — qualquer reincidência.
    const fracao = ehReincidente(c) ? num(p, 'fracaoReincidente') : num(p, 'fracaoPrimario');
    const tempo = c.penaConcreta * fracao;
    return {
      status: porHediondo || porViolencia ? 'incabivel' : 'condicional',
      resumo: porHediondo
        ? 'Vedada ao condenado por crime hediondo (art. 122, §2º, LEP).'
        : porViolencia
          ? 'Vedada ao condenado por crime com violência ou grave ameaça contra pessoa (art. 122, §2º, LEP).'
          : `Regime semiaberto, para estudo, após ${formatFracao(fracao)} da pena (${formatPena(tempo)}).`,
      detalhes: [
        'Exclusiva do regime semiaberto.',
        'Só para frequência a curso supletivo profissionalizante ou de instrução do 2º grau ou superior (art. 122, II): a Lei 14.843/2024 revogou a visita à família e as atividades de retorno ao convívio social.',
        `Cumprimento mínimo: ${formatFracao(fracao)} da pena (${ehReincidente(c) ? 'reincidente' : 'primário'}) → ${formatPena(tempo)}.`,
        'Depende de comportamento adequado e compatibilidade com os objetivos da pena (art. 123, I e III).',
        'Vedada ao condenado por crime hediondo ou com violência ou grave ameaça contra pessoa, que também não tem trabalho externo sem vigilância direta (art. 122, §2º, na redação da Lei 14.843/2024). Antes dela, a vedação alcançava só o hediondo com resultado morte.',
      ],
    };
  },
  detracao: (c, p) => ({
    status: 'cabivel',
    resumo: 'Desconto do tempo de prisão provisória/internação.',
    detalhes: [
      'Computa-se na pena privativa e na medida de segurança o tempo de prisão provisória, administrativa ou internação.',
      'Aplicável a qualquer tipo penal; independe da quantidade de pena.',
      bool(p, 'aplicaMedidaSeguranca')
        ? 'Alcança também o tempo de internação em hospital de custódia e tratamento psiquiátrico.'
        : 'Restrito à pena privativa de liberdade (simulação: exclui a medida de segurança).',
      'A detração pode antecipar a data-base da progressão e do livramento condicional.',
    ],
  }),
  remicao: (c, p) => ({
    status: 'cabivel',
    resumo: `Trabalho (1 dia/${num(p, 'diasTrabalhadosPorDiaRemido')}) e estudo (1 dia/${num(p, 'horasEstudoPorDiaRemido')}h).`,
    detalhes: [
      `Trabalho: 1 dia de pena remido a cada ${num(p, 'diasTrabalhadosPorDiaRemido')} dias trabalhados (regime fechado e semiaberto).`,
      `Estudo: 1 dia de pena remido a cada ${num(p, 'horasEstudoPorDiaRemido')} horas de frequência escolar (qualquer regime).`,
      `Conclusão de curso: acréscimo de ${formatFracao(num(p, 'acrescimoConclusaoCurso'))} sobre o tempo remido (art. 126, §5º).`,
      'Aplicável a qualquer tipo penal.',
    ],
  }),
  'prisao-domiciliar': (c, p) => {
    const vedado = bool(p, 'vedadoViolencia') && (c.violencia || c.graveAmeaca);
    return {
      status: vedado ? 'incabivel' : 'condicional',
      resumo: vedado
        ? 'Crime com violência ou grave ameaça — ressalva do HC 143.641/SP.'
        : 'Depende de hipótese humanitária (idade, saúde, filho menor ou gestação).',
      detalhes: [
        bool(p, 'somenteRegimeAberto')
          ? 'Execução: restrita ao regime aberto (art. 117, LEP).'
          : 'Restrição de regime DESATIVADA: considera a domiciliar por falta de vaga (Súmula Vinculante 56).',
        'Hipóteses do art. 117, LEP: maior de 70 anos, doença grave, filho menor ou deficiente, gestante.',
        'Processo: art. 318, CPP, substitui a prisão preventiva em hipóteses humanitárias.',
        'HC 143.641/SP, STF: domiciliar coletiva para gestantes e mães de crianças até 12 anos, salvo crime com violência/grave ameaça ou contra descendentes.',
      ],
    };
  },
  'monitoracao-eletronica': (c, p) => {
    const vedado = bool(p, 'vedadoHediondo') && c.hediondo;
    return {
      status: vedado ? 'incabivel' : 'condicional',
      resumo: vedado
        ? 'Vedada em crime hediondo (parâmetro de simulação — não há vedação legal vigente).'
        : 'Acompanha a saída temporária, a domiciliar ou substitui a preventiva.',
      detalhes: [
        'Execução: aplicável na saída temporária (regime semiaberto) e na prisão domiciliar (art. 146-B, LEP).',
        bool(p, 'admiteComoCautelar')
          ? 'Processo: medida cautelar diversa da prisão (art. 319, IX, CPP), aplicável a qualquer tipo penal.'
          : 'Uso como cautelar processual DESATIVADO nesta simulação.',
        'Deveres do monitorado: receber visitas, atender contatos e cuidar do equipamento (art. 146-C, LEP).',
        'Não há, na legislação vigente, vedação de monitoração por hediondez.',
      ],
    };
  },
  indulto: (c, p) => {
    const vedado = bool(p, 'vedadoHediondo') && c.hediondo;
    const fracao = num(p, 'fracaoTipica');
    return {
      status: vedado ? 'incabivel' : 'condicional',
      resumo: vedado
        ? 'Vedado a crimes hediondos e equiparados.'
        : `Depende do decreto anual (fração típica: ${formatFracao(fracao)} → ${formatPena(c.penaConcreta * fracao)}).`,
      detalhes: [
        'Concedido por decreto presidencial, com requisitos variáveis a cada ano.',
        'Vedado a crimes hediondos, tortura, tráfico e terrorismo (art. 5º, XLIII, CF).',
        `Fração de referência adotada nesta simulação: ${formatFracao(fracao)} da pena.`,
        'ADI 5.874, STF: ampla discricionariedade do Presidente da República na concessão.',
      ],
    };
  },
  comutacao: (c, p) => {
    const vedado = bool(p, 'vedadoHediondo') && c.hediondo;
    const fr = num(p, 'fracaoReducao');
    return {
      status: vedado ? 'incabivel' : 'condicional',
      resumo: vedado
        ? 'Vedada a crimes hediondos e equiparados.'
        : `Redução de ${formatFracao(fr)} da pena remanescente (${formatPena(c.penaConcreta * fr)} sobre ${formatPena(c.penaConcreta)}).`,
      detalhes: [
        'Indulto parcial: reduz a pena em vez de extingui-la.',
        `Fração de redução adotada nesta simulação: ${formatFracao(fr)}.`,
        'Requisitos definidos no decreto presidencial anual (art. 192, LEP).',
        'Vedada a crimes hediondos, tortura, tráfico e terrorismo (art. 5º, XLIII, CF).',
      ],
    };
  },
  graca: (c, p) => {
    const vedado = bool(p, 'vedadoHediondo') && c.hediondo;
    return {
      status: vedado ? 'incabivel' : 'condicional',
      resumo: vedado
        ? 'Vedada a crimes hediondos e equiparados (art. 5º, XLIII, CF).'
        : 'Clemência individual, discricionária, mediante petição e parecer do Conselho Penitenciário.',
      detalhes: [
        'Concedida a pessoa determinada, diferentemente do indulto coletivo.',
        'Processamento: petição instruída, parecer do Conselho Penitenciário e decisão do Presidente da República (arts. 188 a 192, LEP).',
        'Vedada a crimes hediondos, tortura, tráfico e terrorismo (art. 5º, XLIII, CF).',
      ],
    };
  },
  unificacao: (c, p) => {
    const limite = num(p, 'limiteAnos') * ANO;
    const excede = c.penaConcreta > limite;
    return {
      status: 'cabivel',
      valor: excede ? `unificada em ${formatPena(limite)}` : 'sem unificação',
      resumo: excede
        ? `Pena de ${formatPena(c.penaConcreta)} unificada em ${formatPena(limite)} para cumprimento.`
        : `Pena abaixo do teto de ${formatPena(limite)} — sem unificação.`,
      detalhes: [
        `Limite de cumprimento: ${formatPena(limite)} (art. 75, caput).`,
        excede
          ? `Cumprimento limitado a ${formatPena(limite)}, ainda que a pena aplicada seja de ${formatPena(c.penaConcreta)}.`
          : 'A unificação só incide quando a soma das penas supera o teto legal.',
        bool(p, 'aplicaSumula715')
          ? 'Súmula 715, STF: os demais benefícios (progressão, livramento) são calculados sobre a pena TOTAL aplicada, não sobre a unificada.'
          : 'Simulação: progressão e livramento calculados sobre a pena UNIFICADA (contrária à Súmula 715, STF).',
        'Sobrevindo nova condenação, procede-se a nova unificação (art. 75, §2º).',
      ],
      limiar: {
        descricao: `Pena de cumprimento ≤ ${formatPena(limite)}`,
        referenciaMeses: c.penaConcreta,
        limiarMeses: limite,
        folgaMeses: limite - c.penaConcreta,
      },
    };
  },
};
