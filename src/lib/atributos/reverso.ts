// Busca reversa: dado UM atributo, quais tipos penais ele alcança?
//
// O fluxo direto ("Busca por tipo penal") fixa o tipo e varia os atributos.
// Aqui o atributo é fixo — inclusive com seus parâmetros editados — e varremos
// o catálogo de tipos penais.
//
// PRESSUPOSTO METODOLÓGICO (importante)
// ─────────────────────────────────────
// Atributos de natureza `concreto` dependem da pena fixada na SENTENÇA, que não
// é campo do tipo penal. Para varrer o catálogo é preciso presumir uma pena
// concreta. O padrão é a PENA MÍNIMA COMINADA — hipótese do réu condenado no
// mínimo legal, a mais favorável e a de uso corrente na pesquisa empírica. O
// usuário pode trocá-la por pena máxima ou por um valor fixo.
//
// Atributos de natureza `abstrato` não dependem dessa presunção: sua avaliação
// é exata a partir das penas cominadas.

import type {Cenario, TipoDoMotor} from '../types';
import {cenarioFromCrime} from '../cenario';
import type {AtributoDef, AtributoResultado, Parametros, Status} from './types';
// Do núcleo, e não do index: a busca reversa recebe o atributo que avalia e não
// deve arrastar consigo o catálogo real.
import {avaliarAtributo} from './nucleo';

/** De onde sai a pena concreta presumida na varredura do catálogo. */
export type BasePenaConcreta = 'minima' | 'maxima' | 'fixa';

export const BASE_LABEL: Record<BasePenaConcreta, string> = {
  minima: 'Pena mínima cominada',
  maxima: 'Pena máxima cominada',
  fixa: 'Valor fixo',
};

export const BASE_AJUDA: Record<BasePenaConcreta, string> = {
  minima:
    'Presume o réu condenado no mínimo legal — hipótese mais favorável e a de uso ' +
    'corrente na pesquisa empírica sobre acesso a atributos.',
  maxima:
    'Presume o réu condenado no máximo legal — cenário de reprovação mais severa; ' +
    'mede o alcance mínimo do atributo.',
  fixa:
    'Aplica a mesma pena concreta a todos os tipos penais. Útil para isolar o efeito ' +
    'de um patamar de pena específico sobre o catálogo inteiro.',
};

/**
 * Circunstâncias do RÉU aplicadas a todo o catálogo durante a varredura.
 *
 * Só entram aqui circunstâncias que não pertencem ao tipo penal. Hediondez,
 * violência, culpa, resultado morte e previsão de perdão judicial são lidos do
 * catálogo, tipo a tipo — não são alavancas globais.
 *
 * Também não entra a data do fato: a varredura simula em abstrato, pela lei
 * vigente. A marcação "fato anterior" fica só no caso concreto, na página do
 * tipo penal (decisão de 10/09/2026; estudos/modelo-atributos.md, 4.4).
 */
export interface CenarioReverso {
  base: BasePenaConcreta;
  /** Pena concreta em meses, usada quando `base === 'fixa'`. */
  penaFixaMeses: number;
  reincidenteEspecifico: boolean;
  /**
   * Comando de organização criminosa ultraviolenta (art. 112, VI, "b", LEP).
   * É circunstância do RÉU — o mesmo tipo penal responde de um jeito para quem
   * comandava a facção e de outro para quem não comandava —, e por isso entra
   * como alavanca global da varredura, ao lado da reincidência.
   */
  comandoOrgcrimUltraviolenta: boolean;
  confessou: boolean;
  reparouDano: boolean;
  bonsAntecedentes: boolean;
}

export function cenarioReversoPadrao(): CenarioReverso {
  return {
    base: 'minima',
    penaFixaMeses: 24,
    reincidenteEspecifico: false,
    comandoOrgcrimUltraviolenta: false,
    confessou: false,
    reparouDano: false,
    bonsAntecedentes: true,
  };
}

/**
 * Tipos penais que entram nas estatísticas de alcance dos atributos.
 *
 * Atributos se medem por patamar de pena, então um tipo sem pena privativa
 * cominada satisfaria qualquer teto e seria contado como "cabível". Hoje a
 * única exceção é o art. 28 da Lei 11.343/06, cujas sanções (advertência,
 * prestação de serviços, medida educativa) não são privativas de liberdade.
 */
export function crimesComPenaPrivativa<T extends Pick<TipoDoMotor, 'tem_pena_privativa'>>(crimes: T[]): T[] {
  return crimes.filter((c) => c.tem_pena_privativa !== false);
}

function penaConcretaPresumida(c: TipoDoMotor, rev: CenarioReverso): number {
  switch (rev.base) {
    case 'minima':
      return c.pena_min_meses || c.pena_max_meses;
    case 'maxima':
      return c.pena_max_meses || c.pena_min_meses;
    case 'fixa':
      return rev.penaFixaMeses;
  }
}

/**
 * Cenário de um tipo penal sob as circunstâncias globais da busca reversa.
 *
 * `cenarioFromCrime` já traz os campos do tipo (inclusive `resultadoMorte` e
 * `perdaoJudicialPrevisto`, lidos do catálogo); aqui só se sobrepõem a pena
 * concreta presumida e as circunstâncias do réu.
 */
export function cenarioParaCrime(c: TipoDoMotor, rev: CenarioReverso): Cenario {
  return {
    ...cenarioFromCrime(c),
    penaConcreta: penaConcretaPresumida(c, rev),
    primario: !rev.reincidenteEspecifico,
    reincidenteEspecifico: rev.reincidenteEspecifico,
    comandoOrgcrimUltraviolenta: rev.comandoOrgcrimUltraviolenta,
    confessou: rev.confessou,
    reparouDano: rev.reparouDano,
    bonsAntecedentes: rev.bonsAntecedentes,
  };
}

export interface LinhaReversa<T extends TipoDoMotor = TipoDoMotor> {
  crime: T;
  resultado: AtributoResultado;
}

/** Avalia um atributo (com seus parâmetros correntes) contra todo o catálogo. */
export function avaliarCatalogo<T extends TipoDoMotor>(
  def: AtributoDef,
  params: Parametros,
  crimes: T[],
  rev: CenarioReverso,
): LinhaReversa<T>[] {
  return crimes.map((crime) => ({
    crime,
    resultado: avaliarAtributo(def, cenarioParaCrime(crime, rev), params),
  }));
}

export type Contagem = Record<Status, number>;

export function contar(linhas: LinhaReversa[]): Contagem {
  const out: Contagem = {cabivel: 0, condicional: 0, incabivel: 0};
  for (const l of linhas) out[l.resultado.status] += 1;
  return out;
}

/** Artigo-base de um registro ("Art. 121, §2º, I" → "Art. 121"). */
function artigoBase(artigo: string): string {
  const m = /^(Art\.?\s*\d+(?:-[A-Z])?)/i.exec(artigo.trim());
  return m ? m[1] : artigo.trim();
}

function leiBase(lei: string): string {
  return lei.replace(/\s*\(atualiz\.?\)/, '').trim();
}

/** A unidade DISPOSITIVO: lei e artigo-base. As formas de um crime partilham a chave. */
export function chaveDispositivo(c: Pick<TipoDoMotor, 'lei' | 'artigo'>): string {
  return `${leiBase(c.lei)}|${artigoBase(c.artigo)}`;
}

/** Melhor status entre variantes: basta uma alcançar para o crime ser alcançado. */
const RANK: Record<Status, number> = {cabivel: 2, condicional: 1, incabivel: 0};

export interface AlcanceDuasUnidades {
  /** Por CENÁRIO DE CONDENAÇÃO — cada moldura de pena (linha do catálogo). */
  cenarios: Contagem;
  totalCenarios: number;
  /**
   * Por DISPOSITIVO — as formas de um mesmo crime (simples, qualificada,
   * privilegiada) contam uma vez só. Um dispositivo é alcançado quando ao
   * menos uma de suas formas o é.
   */
  dispositivos: Contagem;
  totalDispositivos: number;
}

/**
 * Alcance de um atributo nas DUAS unidades de medida.
 *
 * A distinção importa porque a granularidade muda a estatística: um crime
 * muito desdobrado (homicídio, furto) pesa uma vez por moldura na contagem por
 * cenário, e uma única vez na contagem por dispositivo. É também o que torna o
 * número comparável ao do SISPENAS original de 2008, que media em unidades
 * mais granulares.
 */
export function contarDuasUnidades(linhas: LinhaReversa[]): AlcanceDuasUnidades {
  const cenarios = contar(linhas);

  const melhorPorDispositivo = new Map<string, Status>();
  for (const l of linhas) {
    const chave = chaveDispositivo(l.crime);
    const atual = melhorPorDispositivo.get(chave);
    if (atual === undefined || RANK[l.resultado.status] > RANK[atual]) {
      melhorPorDispositivo.set(chave, l.resultado.status);
    }
  }
  const dispositivos: Contagem = {cabivel: 0, condicional: 0, incabivel: 0};
  for (const st of melhorPorDispositivo.values()) dispositivos[st] += 1;

  return {
    cenarios,
    totalCenarios: linhas.length,
    dispositivos,
    totalDispositivos: melhorPorDispositivo.size,
  };
}
