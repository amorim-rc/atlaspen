// Simulação legislativa — o motor (design_handoff_atlaspen/09, item 7).
//
// Puro: recebe o catálogo de tipos e o de atributos como parâmetro, aplica o
// pacote de mudanças sobre CÓPIAS e compara com a lei vigente, par a par (tipo
// penal × atributo penal), sob a premissa da varredura reversa. Nada aqui lê
// dado real — é o que permite testá-lo com catálogos fictícios
// (scripts/verificar_simulacao.ts).
//
// As duas unidades de sempre: dispositivos (lei e artigo-base, as formas de um
// crime contam uma vez) e cenários (cada moldura). Alcance é cabível mais
// condicional, como na ficha do atributo.

import type {TipoDoMotor} from '../types';
import type {AtributoDef, AtributoResultado, Parametros} from '../atributos/types';
import {valoresPadrao} from '../atributos/types';
import {avaliarTipo} from '../atributos/remissao';
import {cenarioParaCrime, chaveDispositivo, type CenarioReverso} from '../atributos/reverso';
import {diasDeMeses, formatDias, formatFaixa, mesesDeDias} from '../pena';
import {admiteTentativa} from './tipos';
import type {
  AlcanceAtributo,
  CamposTipo,
  DefinicaoAtributo,
  Etiqueta,
  Incidencia,
  Mudanca,
  Par,
  RequisitoReu,
  Resultado,
  Sinal,
  Unidades,
  VedacaoNova,
} from './tipos';

/**
 * Resultado morte, derivado do NOME do tipo — a mesma expressão de
 * scripts/transform_data.py (RESULTADO_MORTE), para que o tipo criado na
 * simulação seja lido como o catálogo leria.
 */
export const RESULTADO_MORTE = /\bmortes?\b|latroc[íi]nio|homic[íi]dio|feminic[íi]dio|infantic[íi]dio|genoc[íi]dio/i;

export const CAMPOS_TIPO_PADRAO: CamposTipo = {
  nome: '',
  lei: 'Lei nova',
  artigo: 'Art. 1º',
  penaMinDias: 360,
  penaMaxDias: 4 * 360,
  hediondo: false,
  violencia: false,
  graveAmeaca: false,
  elemento: 'Doloso',
  contravencao: false,
};

export const DEFINICAO_PADRAO: DefinicaoAtributo = {
  nome: '',
  incidencia: 'aplicada',
  comparacao: 'ate',
  limiarDias: 4 * 360,
  vedacoes: [],
  requisitos: [],
};

export const ROTULO_INCIDENCIA: Record<Incidencia, string> = {
  cominada_minima: 'pena mínima cominada',
  cominada_maxima: 'pena máxima cominada',
  aplicada: 'pena aplicada',
};

export const ROTULO_VEDACAO: Record<VedacaoNova, string> = {
  violencia: 'crime com violência à pessoa',
  graveAmeaca: 'crime com grave ameaça',
  hediondo: 'crime hediondo',
  resultadoMorte: 'crime com resultado morte',
  culposo: 'crime culposo',
  contravencao: 'contravenção penal',
};

export const ROTULO_REQUISITO: Record<RequisitoReu, string> = {
  primario: 'réu primário',
  confissao: 'confissão',
  reparacao: 'reparação do dano',
};

const juntar = (l: string[]) => (l.length <= 1 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} e ${l.at(-1)}`);

// ── Os tipos ──────────────────────────────────────────────────────────────

export function camposDoTipo(t: TipoDoMotor): CamposTipo {
  return {
    nome: t.crime,
    lei: t.lei,
    artigo: t.artigo,
    penaMinDias: diasDeMeses(t.pena_min_meses),
    penaMaxDias: diasDeMeses(t.pena_max_meses),
    hediondo: t.hediondo === 'Sim',
    violencia: t.violencia === 'Sim',
    graveAmeaca: t.grave_ameaca === 'Sim',
    elemento: (t.elemento as CamposTipo['elemento']) ?? 'Doloso',
    contravencao: t.contravencao === true,
  };
}

/**
 * O registro de um tipo com os campos da simulação. Sobre um tipo existente,
 * só se reescreve o campo que mudou: o resto do registro — o valor exato do
 * elemento subjetivo, a tentativa, o perdão judicial — fica como está.
 */
function montarTipo(id: number, c: CamposTipo, base?: TipoDoMotor): TipoDoMotor {
  const b = base ? camposDoTipo(base) : null;
  const penaMudou = !b || b.penaMinDias !== c.penaMinDias || b.penaMaxDias !== c.penaMaxDias;
  const sn = (v: boolean) => (v ? 'Sim' : 'Não') as TipoDoMotor['hediondo'];
  return {
    id,
    lei: c.lei,
    artigo: c.artigo,
    crime: c.nome,
    pena_min_meses: mesesDeDias(c.penaMinDias),
    pena_max_meses: mesesDeDias(c.penaMaxDias),
    pena_faixa_rotulo: penaMudou ? formatFaixa(c.penaMinDias, c.penaMaxDias) : base!.pena_faixa_rotulo,
    hediondo: base && b!.hediondo === c.hediondo ? base.hediondo : sn(c.hediondo),
    // O resultado morte deriva do NOME, como no catálogo (convenção C5). Desde
    // que o nome passou a ser editável (24/09/2026), rederivar quando ele muda
    // deixou de ser opcional: renomear "lesão corporal" para "lesão corporal
    // seguida de morte" e manter o campo antigo publicaria uma contradição.
    resultado_morte: base && b!.nome === c.nome ? base.resultado_morte : RESULTADO_MORTE.test(c.nome),
    violencia: base && b!.violencia === c.violencia ? base.violencia : sn(c.violencia),
    grave_ameaca: base && b!.graveAmeaca === c.graveAmeaca ? base.grave_ameaca : sn(c.graveAmeaca),
    elemento: c.elemento,
    // A régua das decisões 20 e 31: o elemento decide a tentativa, e a
    // contravenção nunca a admite (LCP, art. 4º). Mantém-se o valor do
    // catálogo quando nada que a governa mudou — há tipo doloso com tentativa
    // "Não" por razão própria, e a simulação não a apaga sem motivo.
    tentativa:
      base && b!.elemento === c.elemento && b!.contravencao === c.contravencao
        ? base.tentativa
        : sn(admiteTentativa(c.elemento, c.contravencao)),
    perdao_judicial_previsto: base?.perdao_judicial_previsto ?? false,
    contravencao: c.contravencao,
    tem_pena_privativa: c.penaMaxDias > 0 || c.penaMinDias > 0,
    pena_por_remissao: null,
    tipo_pena: c.penaMaxDias > 0 || c.penaMinDias > 0 ? 'Reclusão' : 'Multa',
  };
}

// ── O atributo novo, genérico ─────────────────────────────────────────────

export function atributoNovo(d: DefinicaoAtributo, id: string): AtributoDef {
  const limiar =
    d.comparacao === 'ate'
      ? `até ${formatDias(d.limiarDias)}`
      : d.comparacao === 'acima'
        ? `acima de ${formatDias(d.limiarDias)}`
        : `acima de ${formatDias(d.limiarDias)} e até ${formatDias(d.limiarSuperiorDias ?? 0)}`;
  return {
    id,
    nome: d.nome.trim() || 'Atributo novo',
    fundamento: 'proposta, sem norma',
    categoria: d.incidencia === 'aplicada' ? 'aplicacao' : 'processual',
    natureza: d.incidencia === 'aplicada' ? 'concreto' : 'abstrato',
    descricao: `Cabe quando a ${ROTULO_INCIDENCIA[d.incidencia]} for ${limiar}.`,
    requisitos: d.requisitos.map((r) => ROTULO_REQUISITO[r]),
    vedacoes: d.vedacoes.map((v) => ROTULO_VEDACAO[v]),
    alcancaSemPenaPrivativa: false,
    parametros: [],
    avaliar: (c) => {
      const pena =
        d.incidencia === 'cominada_minima' ? c.penaMin : d.incidencia === 'cominada_maxima' ? c.penaMax : c.penaConcreta;
      const tem: Record<VedacaoNova, boolean> = {
        violencia: c.violencia,
        graveAmeaca: c.graveAmeaca,
        hediondo: c.hediondo,
        resultadoMorte: c.resultadoMorte,
        culposo: c.culposo,
        contravencao: c.contravencao,
      };
      const vedada = d.vedacoes.find((v) => tem[v]);
      if (vedada) return {status: 'incabivel', resumo: `Vedado: ${ROTULO_VEDACAO[vedada]}.`, detalhes: []};
      const lim = mesesDeDias(d.limiarDias);
      const teto = mesesDeDias(d.limiarSuperiorDias ?? 0);
      const dentro =
        d.comparacao === 'ate'
          ? pena <= lim + 1e-9
          : d.comparacao === 'acima'
            ? pena > lim + 1e-9
            : pena > lim + 1e-9 && pena <= teto + 1e-9;
      if (!dentro) {
        return {
          status: 'incabivel',
          resumo: `A ${ROTULO_INCIDENCIA[d.incidencia]} (${formatDias(diasDeMeses(pena), 'zero')}) não é ${limiar}.`,
          detalhes: [],
        };
      }
      const faltam = d.requisitos.filter(
        (r) => !((r === 'primario' && c.reincidencia === 'primario') || (r === 'confissao' && c.confessou) || (r === 'reparacao' && c.reparouDano)),
      );
      if (faltam.length) {
        return {status: 'condicional', resumo: `Depende de ${juntar(faltam.map((r) => ROTULO_REQUISITO[r]))}.`, detalhes: []};
      }
      return {status: 'cabivel', resumo: 'Cabe.', detalhes: []};
    },
  };
}

// ── O estado do catálogo, e o pacote aplicado sobre ele ────────────────────

export interface EstadoCatalogo {
  tipos: TipoDoMotor[];
  atributos: {def: AtributoDef; params: Parametros}[];
}

export function estadoLegal(tipos: TipoDoMotor[], catalogo: readonly AtributoDef[]): EstadoCatalogo {
  return {tipos, atributos: catalogo.map((def) => ({def, params: valoresPadrao(def)}))};
}

/** O que falta para a mudança entrar no cálculo; `null` quando está completa. */
export function problemaDa(m: Mudanca, legal: EstadoCatalogo): string | null {
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') {
      if (!m.campos.nome.trim()) return 'Dê um nome ao tipo novo.';
      if (m.campos.penaMaxDias <= 0) return 'Informe a pena máxima do tipo novo.';
      if (m.campos.penaMinDias > m.campos.penaMaxDias) return 'A pena mínima passa da máxima.';
      return null;
    }
    const t = m.id === null ? undefined : legal.tipos.find((x) => x.id === m.id);
    if (!t) return 'Escolha o tipo penal.';
    if (m.op === 'modificar') {
      if (t.pena_por_remissao) return 'Este tipo não comina moldura própria: a pena é a do dispositivo de origem. Modifique a origem.';
      const c = {...camposDoTipo(t), ...m.campos};
      if (c.penaMinDias > c.penaMaxDias) return 'A pena mínima passa da máxima.';
    }
    return null;
  }
  if (m.op === 'criar') {
    if (!m.def.nome.trim()) return 'Dê um nome ao atributo novo.';
    if (m.def.comparacao === 'ate' && m.def.limiarDias <= 0) return 'Informe o limiar de pena.';
    if (m.def.comparacao === 'entre') {
      const teto = m.def.limiarSuperiorDias ?? 0;
      if (teto <= 0) return 'Informe o teto da faixa.';
      if (teto <= m.def.limiarDias) return 'O teto da faixa não passa do piso.';
    }
    return null;
  }
  if (!m.atributo || !legal.atributos.some((a) => a.def.id === m.atributo)) return 'Escolha o atributo penal.';
  return null;
}

/**
 * O catálogo simulado. Tipo e atributo que o pacote não toca são o MESMO objeto
 * da lei vigente: é por identidade que a avaliação reaproveita o que não mudou.
 */
export function aplicarPacote(legal: EstadoCatalogo, pacote: Mudanca[]): EstadoCatalogo {
  let tipos = legal.tipos;
  let atributos = legal.atributos;
  let proximoId = -1;
  let novos = 0;
  for (const m of pacote) {
    if (problemaDa(m, legal) !== null) continue;
    if (m.sentido === 'tipo') {
      if (m.op === 'criar') tipos = [...tipos, montarTipo(proximoId--, m.campos)];
      else if (m.op === 'modificar')
        tipos = tipos.map((t) => (t.id === m.id ? montarTipo(t.id, {...camposDoTipo(t), ...m.campos}, t) : t));
      else tipos = tipos.filter((t) => t.id !== m.id);
    } else if (m.op === 'criar') {
      atributos = [...atributos, {def: atributoNovo(m.def, `novo-${++novos}`), params: {}}];
    } else if (m.op === 'modificar') {
      atributos = atributos.map((a) => (a.def.id === m.atributo ? {def: a.def, params: {...a.params, ...m.params}} : a));
    } else {
      atributos = atributos.filter((a) => a.def.id !== m.atributo);
    }
  }
  return {tipos, atributos};
}

// ── A avaliação e a comparação ─────────────────────────────────────────────

export type Avaliacoes = Map<string, Map<number, AtributoResultado>>;

const comPenaPrivativa = (tipos: TipoDoMotor[]) => tipos.filter((t) => t.tem_pena_privativa !== false);

/**
 * Avalia cada atributo contra cada tipo com pena privativa. Com `reuso` (a lei
 * vigente já avaliada), o par em que nem o tipo nem o atributo mudaram não é
 * recalculado.
 */
export function avaliarEstado(
  e: EstadoCatalogo,
  rev: CenarioReverso,
  reuso?: {legal: EstadoCatalogo; avaliacoes: Avaliacoes},
): Avaliacoes {
  const out: Avaliacoes = new Map();
  const tipos = comPenaPrivativa(e.tipos);
  const tipoLegal = reuso ? new Map(reuso.legal.tipos.map((t) => [t.id, t])) : null;
  const atrLegal = reuso ? new Map(reuso.legal.atributos.map((a) => [a.def.id, a])) : null;
  for (const a of e.atributos) {
    const base = atrLegal?.get(a.def.id) === a ? reuso!.avaliacoes.get(a.def.id) : undefined;
    const mapa = new Map<number, AtributoResultado>();
    for (const t of tipos) {
      // O tipo de remissão depende das origens, que o pacote pode ter mudado mesmo
      // sem tocá-lo: ele nunca é reaproveitado.
      const pronto = base && tipoLegal!.get(t.id) === t && !t.pena_por_remissao ? base.get(t.id) : undefined;
      mapa.set(t.id, pronto ?? avaliarTipo(a.def, a.params, t, e.tipos, (x) => cenarioParaCrime(x, rev)));
    }
    out.set(a.def.id, mapa);
  }
  return out;
}

const alcanca = (r: AtributoResultado | null) => r !== null && r.status !== 'incabivel';

export function sinalDe(antes: AtributoResultado | null, depois: AtributoResultado | null): Sinal {
  if (alcanca(antes) !== alcanca(depois)) return alcanca(depois) ? '+' : '−';
  if (!antes || !depois || !alcanca(antes)) return '=';
  if (antes.status !== depois.status || (antes.valor ?? '') !== (depois.valor ?? '')) return '~';
  return '=';
}

function unidades(tipos: TipoDoMotor[], mapa?: Map<number, AtributoResultado>): Unidades {
  const disp = new Set<string>();
  let cenarios = 0;
  for (const t of tipos) {
    if (mapa && !alcanca(mapa.get(t.id) ?? null)) continue;
    cenarios += 1;
    disp.add(chaveDispositivo(t));
  }
  return {dispositivos: disp.size, cenarios};
}

export function comparar(
  legal: EstadoCatalogo,
  simulado: EstadoCatalogo,
  avLegal: Avaliacoes,
  avSim: Avaliacoes,
): Resultado {
  const privLegal = comPenaPrivativa(legal.tipos);
  const privSim = comPenaPrivativa(simulado.tipos);
  const tipoLegal = new Map(privLegal.map((t) => [t.id, t]));
  const tipoSim = new Map(privSim.map((t) => [t.id, t]));
  const ids = [...new Set([...tipoLegal.keys(), ...tipoSim.keys()])];
  const defLegal = new Map(legal.atributos.map((a) => [a.def.id, a.def]));
  const defSim = new Map(simulado.atributos.map((a) => [a.def.id, a.def]));
  const atrIds = [...new Set([...defLegal.keys(), ...defSim.keys()])];

  const pares: Par[] = [];
  const porAtributo: AlcanceAtributo[] = [];
  for (const atrId of atrIds) {
    const def = (defSim.get(atrId) ?? defLegal.get(atrId))!;
    const mA = avLegal.get(atrId);
    const mD = avSim.get(atrId);
    const meta = {id: def.id, nome: def.nome, fundamento: def.fundamento};
    let entra = 0;
    let sai = 0;
    let muda = 0;
    for (const id of ids) {
      const antes = mA?.get(id) ?? null;
      const depois = mD?.get(id) ?? null;
      const sinal = sinalDe(antes, depois);
      if (sinal === '=') continue;
      if (sinal === '+') entra += 1;
      else if (sinal === '−') sai += 1;
      else muda += 1;
      pares.push({
        tipo: (tipoSim.get(id) ?? tipoLegal.get(id))!,
        atributo: meta,
        antes,
        depois,
        sinal,
        tipoNovo: !tipoLegal.has(id),
        tipoExtinto: !tipoSim.has(id),
        atributoNovo: !defLegal.has(atrId),
        atributoExtinto: !defSim.has(atrId),
      });
    }
    porAtributo.push({
      ...meta,
      antes: mA ? unidades(privLegal, mA) : null,
      depois: mD ? unidades(privSim, mD) : null,
      entra,
      sai,
      muda,
    });
  }

  const atingidos = new Map(pares.map((p) => [p.tipo.id, p.tipo]));
  return {
    pares,
    porAtributo,
    totalAntes: unidades(privLegal),
    totalDepois: unidades(privSim),
    totalUniao: unidades([...privLegal, ...privSim.filter((t) => !tipoLegal.has(t.id))]),
    atingidos: unidades([...atingidos.values()]),
    atributosAntes: defLegal.size,
    atributosDepois: defSim.size,
    atributosQueMudam: porAtributo.filter((a) => a.entra + a.sai + a.muda > 0 || !a.antes || !a.depois).length,
  };
}

// ── A etiqueta de cada mudança ────────────────────────────────────────────

/**
 * A etiqueta das notas de atualização, só onde o sentido é inequívoco. No tipo,
 * pela direção dos campos: pena para cima, ou hediondez, violência e grave
 * ameaça acrescidas, é in pejus; o inverso, in mellius; os dois juntos, as duas
 * etiquetas. No atributo modificado, pelo efeito medido: só entra, in mellius;
 * só sai, in pejus. Quando a mudança só altera valores — prazo, fração, regime —
 * não há etiqueta: o sentido depende do valor, e a tela não o adivinha.
 * Extinguir um dos 22 atributos é in pejus: todos favorecem o réu quando cabem.
 */
export function etiquetasDa(m: Mudanca, legal: EstadoCatalogo, rev: CenarioReverso, avLegal: Avaliacoes): Etiqueta[] {
  if (problemaDa(m, legal) !== null) return [];
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') return ['incriminadora'];
    if (m.op === 'extinguir') return ['abolitio'];
    const t = legal.tipos.find((x) => x.id === m.id)!;
    const a = camposDoTipo(t);
    const d = {...a, ...m.campos};
    const piora =
      d.penaMinDias > a.penaMinDias ||
      d.penaMaxDias > a.penaMaxDias ||
      (d.hediondo && !a.hediondo) ||
      (d.violencia && !a.violencia) ||
      (d.graveAmeaca && !a.graveAmeaca);
    const melhora =
      d.penaMinDias < a.penaMinDias ||
      d.penaMaxDias < a.penaMaxDias ||
      (!d.hediondo && a.hediondo) ||
      (!d.violencia && a.violencia) ||
      (!d.graveAmeaca && a.graveAmeaca);
    return [...(piora ? (['pejus'] as const) : []), ...(melhora ? (['mellius'] as const) : [])];
  }
  if (m.op === 'criar') return ['proposta'];
  if (m.op === 'extinguir') return ['pejus'];
  const sim = aplicarPacote(legal, [m]);
  const r = comparar(legal, sim, avLegal, avaliarEstado(sim, rev, {legal, avaliacoes: avLegal}));
  const a = r.porAtributo.find((x) => x.id === m.atributo);
  if (!a) return [];
  if (a.entra > 0 && a.sai === 0) return ['mellius'];
  if (a.sai > 0 && a.entra === 0) return ['pejus'];
  if (a.entra > 0 && a.sai > 0) return [];
  // NINGUÉM ENTRA NEM SAI, e ainda assim algo mudou: é mudança de VALOR —
  // prazo, fração, regime. Até 24/09/2026 a etiqueta ficava em branco aqui, e
  // a tela dizia "sentido não classificado". Mas o sentido existe e é
  // determinado: cada parâmetro declara, em `data/atributos.json`, se aumentar
  // o valor favorece o réu. Subir um teto de pena faz caber em mais tipos;
  // subir a fração da pena a cumprir faz cumprir mais.
  //
  // Quando o pacote mexe em vários parâmetros e eles apontam para lados
  // opostos, saem as DUAS etiquetas — como já acontece no tipo modificado cuja
  // pena mínima sobe e a máxima desce.
  return etiquetasPorValor(m, legal);
}

/** O sentido de uma mudança que só altera valores, pela direção de cada parâmetro. */
function etiquetasPorValor(m: Mudanca, legal: EstadoCatalogo): Etiqueta[] {
  if (m.sentido !== 'atributo' || m.op !== 'modificar') return [];
  const alvo = legal.atributos.find((x) => x.def.id === m.atributo);
  if (!alvo) return [];
  let melhora = false;
  let piora = false;
  for (const [id, novo] of Object.entries(m.params)) {
    const def = alvo.def.parametros.find((x) => x.id === id);
    if (!def || def.aumentarFavorece === undefined) continue;
    const antes = Number(def.padrao);
    const depois = Number(novo);
    if (!Number.isFinite(antes) || !Number.isFinite(depois) || antes === depois) continue;
    // Booleano: `true` é 1 e `false` é 0, e a comparação vale igual.
    const subiu = depois > antes;
    if (subiu === def.aumentarFavorece) melhora = true;
    else piora = true;
  }
  return [...(piora ? (['pejus'] as const) : []), ...(melhora ? (['mellius'] as const) : [])];
}
