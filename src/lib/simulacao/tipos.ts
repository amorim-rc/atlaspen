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
  culposo: boolean;
  contravencao: boolean;
}

/** De qual pena o atributo novo depende. */
export type Incidencia = 'cominada_minima' | 'cominada_maxima' | 'aplicada';
/** "até" o limiar (a maioria dos institutos) ou "acima" dele. */
export type Comparacao = 'ate' | 'acima';
export type VedacaoNova = 'violencia' | 'graveAmeaca' | 'hediondo' | 'resultadoMorte' | 'culposo' | 'contravencao';
export type RequisitoReu = 'primario' | 'confissao' | 'reparacao';

/** A definição genérica de um atributo penal que ainda não existe. */
export interface DefinicaoAtributo {
  nome: string;
  incidencia: Incidencia;
  comparacao: Comparacao;
  limiarDias: number;
  vedacoes: VedacaoNova[];
  requisitos: RequisitoReu[];
}

export type Mudanca =
  | {sentido: 'tipo'; op: 'criar'; campos: CamposTipo}
  | {sentido: 'tipo'; op: 'modificar'; id: number | null; campos: Partial<CamposTipo>}
  | {sentido: 'tipo'; op: 'extinguir'; id: number | null}
  | {sentido: 'atributo'; op: 'criar'; def: DefinicaoAtributo}
  | {sentido: 'atributo'; op: 'modificar'; atributo: string | null; params: Parametros}
  | {sentido: 'atributo'; op: 'extinguir'; atributo: string | null};

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

/** A etiqueta das notas de atualização, e "proposta" para o atributo sem norma. */
export type Etiqueta = 'incriminadora' | 'pejus' | 'mellius' | 'abolitio' | 'proposta';
