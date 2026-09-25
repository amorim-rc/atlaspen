// Avaliadores dos atributos de EXECUÇÃO PENAL — AtlasPen.
//
// Progressão de regime, livramento condicional, prescrição, saída temporária,
// detração, remição, prisão domiciliar, monitoração eletrônica, indulto,
// comutação, graça e unificação de penas. A progressão e o livramento leem a
// mesma vedação do art. 112 da LEP, que vive em comum.ts.

import type {Avaliador} from './comum';
import {ANO, vedacaoLivramentoArt112} from './comum';
import {num, bool} from '../types';
import {formatPena, formatFracao} from '../../format';
import {ehReincidente, reincidenteEmDoloso, reincidenteEspecifico} from '../reincidencia';
import {regimeComumAnterior, regimeHediondoAnterior} from '../../tempo';

export const AVALIADORES_EXECUCAO: Record<string, Avaliador> = {
  progressao: (c, p) => {
    const comViolencia = c.violencia || c.graveAmeaca;
    // Os dois regimes do art. 112 mudaram em datas DIFERENTES: a tabela dos
    // hediondos em 25/03/2026 (Lei 15.358) e a dos comuns em 08/05/2026 (Lei
    // 15.402). Um fato entre as duas cai na tabela nova dos hediondos e na
    // antiga dos comuns — era o que o antigo booleano único não representava.
    const hediondoAnterior = regimeHediondoAnterior(c.dataDoFato);
    const comumAnterior = regimeComumAnterior(c.dataDoFato);
    let fracao: number;
    let inciso: string;
    if (c.hediondo && c.resultadoMorte && reincidenteEspecifico(c)) {
      fracao = hediondoAnterior
        ? num(p, 'fracaoReincidenteHediondoMorteAnterior')
        : num(p, 'fracaoReincidenteHediondoMorte');
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
      // A partir daqui, os HEDIONDOS. A tabela deles mudou em 25/03/2026 (Lei
      // 15.358) e a dos comuns em 08/05/2026 (Lei 15.402): são marcos
      // diferentes, e um fato entre as duas datas cai na tabela nova dos
      // hediondos e na antiga dos comuns. Por isso a escolha é pela data do
      // fato, e não por um "fato anterior" só.
      fracao = hediondoAnterior
        ? num(p, 'fracaoFeminicidioPrimarioAnterior')
        : num(p, 'fracaoFeminicidioPrimario');
      inciso = hediondoAnterior
        ? 'VI-A — primário, feminicídio (redação da Lei 14.994/2024; livramento vedado)'
        : 'VI, "d" — primário, feminicídio (livramento vedado)';
    } else if (c.hediondo && c.resultadoMorte) {
      fracao = hediondoAnterior
        ? num(p, 'fracaoPrimarioHediondoMorteAnterior')
        : num(p, 'fracaoPrimarioHediondoMorte');
      inciso = 'VI, "a" — primário, hediondo com resultado morte (livramento vedado)';
    } else if (c.hediondo && reincidenteEspecifico(c)) {
      fracao = hediondoAnterior
        ? num(p, 'fracaoReincidenteHediondoAnterior')
        : num(p, 'fracaoReincidenteHediondo');
      inciso = 'VII — reincidente, hediondo';
    } else if (c.hediondo) {
      fracao = hediondoAnterior
        ? num(p, 'fracaoPrimarioHediondoAnterior')
        : num(p, 'fracaoPrimarioHediondo');
      inciso = 'V — primário, hediondo/equiparado';
    } else if (c.miliciaPrivada) {
      // Alínea "c" do inciso VI. A constituição de milícia privada (art. 288-A do
      // CP) não é hedionda, e o catálogo a registra com violência e grave ameaça:
      // sem este ramo ela caía no inciso I ou II e saía com 25% ou 30%, quando a
      // lei manda 75% ao primário e ao reincidente. Fica antes do ramo da redação
      // de 2019 porque a alínea já existia nela (com 50%); o caso concreto só
      // distingue a Lei 15.402, e a fração aqui é a da Lei 15.358 — a mesma
      // limitação dos hediondos (.superpowers/specs/2026-09-10-modelo-atributos.md, achado C).
      fracao = num(p, 'fracaoMiliciaPrivada');
      inciso = 'VI, "c" — constituição de milícia privada';
    } else if (comumAnterior) {
      // Tabela do Pacote Anticrime, para fato até 07/05/2026. Ela não é "a
      // antiga": continua sendo a lei do caso, porque a Lei 15.402/2026 é mais
      // gravosa para o primário sem violência (16% viraram 16,67%) e lei mais
      // gravosa não retroage. A retroatividade da lei benéfica se apura por
      // SITUAÇÃO CONCRETA, não em bloco.
      if (comViolencia && ehReincidente(c)) {
        fracao = num(p, 'fracaoReincidenteViolencia');
        inciso = 'IV — reincidente, crime com violência/grave ameaça (redação de 2019)';
      } else if (comViolencia) {
        fracao = num(p, 'fracaoPrimarioViolencia');
        inciso = 'III — primário, crime com violência/grave ameaça (redação de 2019)';
      } else if (ehReincidente(c)) {
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
      // Decisão 27, de 23/09/2026: para o REINCIDENTE o resultado é condicional,
      // e a alternativa depende de ter havido violência. Sem ela, a disputa é
      // entre 1/6 (caput) e 20% (inciso III); com ela, entre 1/6 e 30% (inciso
      // IV, que a Lei 15.402 não tocou). Nos dois casos o motor calcula pela
      // leitura MAIS FAVORÁVEL — 1/6 — e mostra a outra, porque escolher em
      // silêncio a mais gravosa seria decidir contra o réu sem dizer.
      fracao = num(p, 'fracaoCaputRegimeAnterior');
      inciso = !ehReincidente(c)
        ? 'caput — crime do Título XII, primário (os incisos I e II o ressalvam)'
        : comViolencia
          ? 'caput — crime do Título XII, reincidente com violência (LEITURA EM ' +
            'DISPUTA: 1/6 pelo caput, ou 30% pelo inciso IV)'
          : 'caput — crime do Título XII, reincidente (LEITURA EM DISPUTA: 1/6 pelo ' +
            'caput, ou 20% pelo inciso III)';
    } else if (comViolencia && ehReincidente(c)) {
      // "Reincidente", nos incisos dos crimes COMUNS, é a reincidência genérica:
      // o texto não a qualifica. A exigência de reincidência ESPECÍFICA vale nos
      // incisos dos hediondos (V a VIII), que falam em "crime hediondo ou
      // equiparado" — é o que o STJ decidiu no Tema 1084 (REsp 1.910.240), e o
      // fundamento de lá não se transporta para cá. Conferido em 19/09/2026,
      // contra a redação da Lei 15.402/2026.
      fracao = num(p, 'fracaoReincidenteViolencia');
      inciso = 'II — reincidente, crime com violência/grave ameaça';
    } else if (comViolencia) {
      fracao = num(p, 'fracaoPrimarioViolencia');
      inciso = 'I — primário, crime com violência/grave ameaça';
    } else if (ehReincidente(c)) {
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
    if (!comumAnterior && !c.hediondo && !c.miliciaPrivada) {
      detalhes.push(
        'Redação da Lei 15.402/2026, em vigor desde 08/05/2026. Para fato anterior, ' +
          'marque a circunstância correspondente: para o primário em crime sem ' +
          'violência a lei nova é mais gravosa (16% → 16,67%) e não retroage.',
      );
    }
    if (c.tituloXII && ehReincidente(c)) {
      detalhes.push(
        comViolencia
          ? 'DUAS LEITURAS SUSTENTÁVEIS, e a diferença é de 13,33 pontos. Pelo inciso IV ' +
            '(30%): ele alcança o "reincidente em crime cometido com violência à pessoa ' +
            'ou grave ameaça" e a Lei 15.402/2026 não o tocou, de modo que continuaria ' +
            'valendo. Pelo caput (1/6): a ressalva que a lei nova pôs nos incisos I e II ' +
            'retirou os crimes do Título XII da tabela por inteiro, e o inciso IV, ' +
            'remanescente de uma redação cuja lógica foi substituída, estaria derrogado. ' +
            'Está calculado pelo caput, que é o resultado mais favorável; a questão é dos ' +
            'tribunais de execução.'
          : 'DUAS LEITURAS SUSTENTÁVEIS, e a diferença é de 3,33 pontos. Pelo inciso III ' +
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
      status: c.tituloXII && ehReincidente(c) ? 'condicional' : 'cabivel',
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
    if (c.multaIsolada) {
      // Art. 114, I, CP: a multa única cominada prescreve em 2 anos.
      const prazoMulta = num(p, 'prazoMultaIsolada');
      return {
        status: 'cabivel',
        valor: formatPena(prazoMulta),
        resumo: `Multa única cominada: ${formatPena(prazoMulta)}.`,
        detalhes: [`A multa, quando é a única cominada ou aplicada, prescreve em ${formatPena(prazoMulta)} (art. 114, I, CP).`],
      };
    }
    if (c.semPenaPrivativa) {
      // "Outras penas" (Lei 11.343/06, art. 28; Lei 7.437/85, art. 8º): o prazo
      // depende da sanção, e o motor não o inventa.
      return {
        status: 'condicional',
        resumo: 'Sem pena privativa nem multa isolada: o prazo depende da sanção cominada.',
        detalhes: ['O art. 109 do CP mede o prazo pela pena privativa, e o art. 114, pela multa; a sanção deste tipo é outra, com regra própria.'],
      };
    }
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
