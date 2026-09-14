// O acervo histórico — tipos e regras puras, sem dado.
//
// Separado do leitor de build (src/site/acervo-servidor.ts), que carrega os
// JSON: as ilhas importam daqui e não arrastam dado para o navegador.

export type CategoriaAcervo = 'revogado' | 'nao_recepcionado' | 'vetado';

export interface NormaDeSaida {
  norma: string;
  /** O ano da norma (lido da própria designação), e não o da perda de vigência. */
  ano: number | null;
  alcance?: string;
}

export interface RegistroAcervo {
  id: string;
  tipo: 'dispositivo' | 'diploma';
  nome: string;
  dispositivo: string;
  categoria: CategoriaAcervo;
  oQueHouve: string;
  normas: NormaDeSaida[];
  retirado: {versao: string; nota: string} | null;
  artigos: string[];
  diploma: {id: string; nome: string; norma: string} | null;
  fonteUrl: string | null;
  /** Para os diplomas: a data da própria lei, lida de data/diplomas.json. */
  publicacao: {data: string; norma: string} | null;
  dataRevogacao: string | null;
  textoOriginal: string | null;
}

export const ROTULO_CATEGORIA: Record<CategoriaAcervo, string> = {
  revogado: 'revogado',
  nao_recepcionado: 'não recepcionado',
  vetado: 'vetado',
};

export interface Marco {
  data: string;
  ano: number;
  tipo: 'constituicao' | 'codigo';
  rotulo: string;
  eixo: string;
  norma: string;
  nota?: string;
}

export interface EventoDoAno {
  ano: number;
  categoria: string;
  /** saida: revogação; excecao: veto ou não recepção; marco; lei: alteração; publicacao. */
  tom: 'saida' | 'excecao' | 'marco' | 'lei' | 'publicacao';
  titulo: string;
  norma: string;
  rota?: string;
}

export interface PassoRegistro {
  quando: string;
  fato: string;
  norma: string;
}

const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/**
 * A vida do registro, no que a fonte diz: a publicação (dos diplomas), a norma
 * que o tirou de vigência, a saída do catálogo. O que não se sabe — a data de
 * criação de um dispositivo, a data exata da revogação — não entra.
 */
export function passosDoRegistro(r: RegistroAcervo): PassoRegistro[] {
  const passos: PassoRegistro[] = [];
  if (r.publicacao) passos.push({quando: dataCurta(r.publicacao.data), fato: 'Publicado', norma: r.publicacao.norma});
  for (const n of r.normas) {
    const fato =
      r.categoria === 'vetado'
        ? 'Vetado na sanção — nunca vigorou'
        : r.categoria === 'nao_recepcionado'
          ? 'Declarado não recepcionado pela Constituição de 1988'
          : // Só "revogado": revogação não é abolitio criminis. A conduta pode ter
            // seguido punível noutro tipo (o ECA, art. 233, foi para a Lei de
            // Tortura), e isso o registro diz em "o que houve", não o passo.
            `Revogado${n.alcance ? ` (${n.alcance})` : ''}`;
    passos.push({
      quando: r.dataRevogacao ? dataCurta(r.dataRevogacao) : n.ano ? String(n.ano) : 's/ data',
      fato,
      norma: n.norma,
    });
  }
  if (r.retirado) {
    passos.push({quando: r.retirado.versao, fato: 'Retirado do catálogo vigente', norma: r.retirado.nota});
  }
  return passos;
}
