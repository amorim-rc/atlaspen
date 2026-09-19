// A reincidência do réu, lida do jeito que cada lei pergunta.
//
// Os avaliadores não comparam o campo direto: perguntam o que o dispositivo
// pergunta. "Reincidente" (CPP, art. 28-A, §2º, II; CP, art. 33, §2º; LEP,
// art. 123, II; CP, art. 110) é qualquer reincidência; "reincidente em crime
// doloso" (CP, arts. 44, II, 77, I, e 83, II) exclui a culposa; o específico
// (CP, arts. 44, §3º, e 83, V; LEP, art. 112, V a VIII) é um caso do doloso.

import type {Reincidencia} from '../types';

type ComReincidencia = {reincidencia: Reincidencia};

export const REINCIDENCIAS: Reincidencia[] = ['primario', 'culposo', 'doloso', 'especifico'];

export const ROTULO_REINCIDENCIA: Record<Reincidencia, string> = {
  primario: 'primário',
  culposo: 'reincidente em crime culposo',
  doloso: 'reincidente em crime doloso',
  especifico: 'reincidente específico',
};

export const ehReincidente = (c: ComReincidencia): boolean => c.reincidencia !== 'primario';

export const reincidenteEmDoloso = (c: ComReincidencia): boolean =>
  c.reincidencia === 'doloso' || c.reincidencia === 'especifico';

export const reincidenteEspecifico = (c: ComReincidencia): boolean => c.reincidencia === 'especifico';
