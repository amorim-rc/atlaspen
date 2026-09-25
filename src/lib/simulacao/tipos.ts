// Simulação legislativa — os tipos (design_handoff_atlaspen/09, item 7).
//
// Uma simulação é um PACOTE de mudanças, cada uma num dos dois sentidos — mexer
// num tipo penal ou num atributo penal — e com uma de três operações: criar,
// modificar, extinguir. O impacto é sempre o do pacote inteiro.

import type {TipoDoMotor} from '../types';
import type {AtributoResultado, Parametros} from '../atributos/types';

export type Sentido = 'tipo' | 'atributo';
export type Operacao = 'criar' | 'modificar' | 'extinguir';

/**
 * Os campos livres de um tipo penal na simulação: só o que o motor lê. Espécie
 * de pena (reclusão ou detenção) e ação penal ficam de fora porque nenhum
 * atributo as lê hoje — um campo sem efeito no cálculo sugeriria um efeito que
 * não há. Resultado morte não é pedido: deriva do nome, como no catálogo.
 */
export interface CamposTipo {
  nome: string;
  lei: string;
  artigo: string;
  penaMinDias: number;
  penaMaxDias: number;
  hediondo: boolean;
  violencia: boolean;
  graveAmeaca: boolean;
  /**
   * O elemento subjetivo, nos quatro valores do catálogo. Era um booleano
   * `culposo` até 24/09/2026, o que impedia simular a diferença que a decisão
   * 31 criou: preterdoloso e qualificado pelo resultado separam-se justamente
   * pela tentativa, e um booleano não os representava.
   */
  elemento: ElementoTipo;
  contravencao: boolean;
}

/** Os quatro valores do campo `elemento`, como o catálogo os fecha. */
export type ElementoTipo = 'Doloso' | 'Culposo' | 'Preterdoloso' | 'Qualificado pelo resultado';

export const ELEMENTOS: ElementoTipo[] = [
  'Doloso',
  'Culposo',
  'Preterdoloso',
  'Qualificado pelo resultado',
];

/**
 * A régua das decisões 20 e 31, em código: o elemento decide a tentativa.
 * Culposo e preterdoloso não a admitem — não se tenta o resultado que a lei não
 * quer doloso. "Qualificado pelo resultado" a admite, porque o tipo abriga
 * resultado doloso. A contravenção nunca a admite (LCP, art. 4º).
 *
 * É a mesma régua que `scripts/transform_data.py` impõe ao catálogo. Estar nos
 * dois lugares é de propósito: o catálogo a exige do dado, e a simulação a
 * aplica ao tipo que ainda não existe.
 */
export function admiteTentativa(elemento: ElementoTipo, contravencao: boolean): boolean {
  if (contravencao) return false;
  return elemento === 'Doloso' || elemento === 'Qualificado pelo resultado';
}

/** De qual pena o atributo novo depende. */
export type Incidencia = 'cominada_minima' | 'cominada_maxima' | 'aplicada';
/**
 * Como a pena se compara ao limiar. "Até" e "acima" bastam para a maioria dos
 * institutos; **"entre"** existe desde 24/09/2026 porque a lei também trabalha
 * com FAIXA — o sursis da pena vai de mais de nada até dois anos, e o regime
 * semiaberto começa em quatro e termina em oito. Com um limiar só, essas
 * hipóteses não se simulavam: ou se perdia o piso, ou se perdia o teto.
 */
export type Comparacao = 'ate' | 'acima' | 'entre';
export type VedacaoNova = 'violencia' | 'graveAmeaca' | 'hediondo' | 'resultadoMorte' | 'culposo' | 'contravencao';
export type RequisitoReu = 'primario' | 'confissao' | 'reparacao';

/**
 * O que o atributo novo DEVOLVE, além de caber ou não (25/09/2026, débito
 * técnico 5). Até então a definição genérica só comparava pena com limiar, e
 * os institutos que calculam um valor — progressão, saída temporária,
 * prescrição, regime inicial — não se simulavam senão editando os que existem.
 *
 * - `veredito`: só cabível, incabível ou condicional. É o padrão e o de sempre.
 * - `fracao`: o valor é a pena-base (a da `incidencia`) vezes uma fração — a
 *   forma da progressão e da saída temporária.
 * - `faixas`: o valor é lido de uma tabela por faixa de pena: até X, vale Y; a
 *   última linha (`acimaDias`) vale acima do maior degrau — a forma da
 *   prescrição (art. 109 do CP) e do regime inicial (art. 33, §2º).
 *
 * O veredito continua decidido por limiar, vedações e requisitos; o valor é
 * ACRÉSCIMO, e sai em `Avaliacao.valor`, para que `sinalDe` marque "~" quando
 * só ele muda. Em `faixas`, o valor de cada degrau é uma DURAÇÃO em dias, o que
 * serve à prescrição e à progressão; rótulo livre por faixa (como "fechado",
 * "semiaberto" para o regime) fica para uma rodada futura — exigiria um valor
 * que não é tempo, e nada no motor compara rótulo com rótulo ainda.
 */
export type Devolucao = 'veredito' | 'fracao' | 'faixas';

/** Um degrau da tabela por faixa: pena até `ateDias` → `valorDias`. */
export interface FaixaValor {
  ateDias: number;
  valorDias: number;
}

/** A definição genérica de um atributo penal que ainda não existe. */
export interface DefinicaoAtributo {
  nome: string;
  incidencia: Incidencia;
  comparacao: Comparacao;
  /** O limiar; em `entre`, é o PISO (exclusivo: a pena tem de passar dele). */
  limiarDias: number;
  /** Só em `entre`: o TETO, inclusivo. */
  limiarSuperiorDias?: number;
  vedacoes: VedacaoNova[];
  requisitos: RequisitoReu[];
  /** O que o atributo devolve; ausente vale `veredito`. */
  devolve?: Devolucao;
  /** Só em `fracao`: a fração da pena-base, entre 0 (exclusivo) e 1. */
  fracao?: number;
  /** Só em `faixas`: os degraus, em ordem crescente de `ateDias`. */
  faixas?: FaixaValor[];
  /** Só em `faixas`: o valor acima do último degrau — "o último vale acima". */
  acimaDias?: number;
}

/**
 * Uma mudança que aponta para um tipo penal aponta por `id`. O id POSITIVO é o
 * do catálogo (a URL pública `?tipo=N`). O id NEGATIVO é o de um tipo criado
 * neste mesmo pacote: `-(k + 1)`, sendo `k` a posição da mudança `criar` no
 * pacote. É determinístico, e por isso vai e volta pela URL (`tm;-1;max=8a`
 * modifica o tipo criado pela primeira mudança). Uma mudança só alcança tipo
 * criado ANTES dela; o motor reprova a referência ao que vem depois ou ao que
 * já não está lá (25/09/2026, débito técnico 5).
 */
export type Mudanca =
  | {sentido: 'tipo'; op: 'criar'; campos: CamposTipo}
  | {sentido: 'tipo'; op: 'modificar'; id: number | null; campos: Partial<CamposTipo>}
  | {sentido: 'tipo'; op: 'extinguir'; id: number | null}
  | {sentido: 'atributo'; op: 'criar'; def: DefinicaoAtributo}
  | {sentido: 'atributo'; op: 'modificar'; atributo: string | null; params: Parametros}
  | {sentido: 'atributo'; op: 'extinguir'; atributo: string | null};

/**
 * Onde a mudança está no pacote: o que ela precisa saber para resolver um id
 * negativo. Sem contexto, a referência a tipo criado no pacote é problema.
 */
export interface ContextoPacote {
  pacote: Mudanca[];
  indice: number;
}

/** O id provisório do tipo criado pela mudança na posição `k` do pacote. */
export const idDeCriado = (k: number): number => -(k + 1);
/** A posição, no pacote, da mudança `criar` que o id negativo aponta. */
export const posicaoDeCriado = (id: number): number => -id - 1;

/** + entra no alcance; − sai; ~ fica, mas muda o status ou o valor; = não se move. */
export type Sinal = '+' | '−' | '~' | '=';

export interface Par {
  tipo: TipoDoMotor;
  atributo: {id: string; nome: string; fundamento: string};
  antes: AtributoResultado | null;
  depois: AtributoResultado | null;
  sinal: Sinal;
  tipoNovo: boolean;
  tipoExtinto: boolean;
  atributoNovo: boolean;
  atributoExtinto: boolean;
}

export interface Unidades {
  dispositivos: number;
  cenarios: number;
}

export interface AlcanceAtributo {
  id: string;
  nome: string;
  fundamento: string;
  /** null: o atributo não existe na lei vigente. */
  antes: Unidades | null;
  /** null: o atributo é extinto pela simulação. */
  depois: Unidades | null;
  entra: number;
  sai: number;
  muda: number;
}

export interface Resultado {
  /** Só os pares que mudam. */
  pares: Par[];
  porAtributo: AlcanceAtributo[];
  /** Tipos com pena privativa, na lei vigente e no catálogo simulado. */
  totalAntes: Unidades;
  totalDepois: Unidades;
  /** A união dos dois: o denominador de "atingidos", que conta também o tipo extinto. */
  totalUniao: Unidades;
  atingidos: Unidades;
  atributosAntes: number;
  atributosDepois: number;
  atributosQueMudam: number;
}

/**
 * A direção que a mudança simulada toma, em termos penais.
 *
 * Era o vocabulário do feed de notas até 24/09/2026, quando o feed foi
 * simplificado e passou a dizer só o que a lei alcança (tipo ou atributo). Aqui
 * a distinção permanece, e por uma razão: na simulação ela não é rótulo de
 * notícia, é o RESULTADO — a pergunta "que direção esta proposta toma?" é a que
 * a ferramenta existe para responder. As duas coisas compartilhavam o mesmo
 * vocabulário por acidente, e o acidente acabou.
 */
export type Etiqueta = 'incriminadora' | 'pejus' | 'mellius' | 'abolitio' | 'proposta';

export const ROTULO_ETIQUETA_BASE: Record<Exclude<Etiqueta, 'proposta'>, string> = {
  incriminadora: 'novatio legis incriminadora',
  pejus: 'novatio legis in pejus',
  mellius: 'novatio legis in mellius',
  abolitio: 'abolitio criminis',
};
