// O motor de atributos penais, sem catálogo embutido.
//
// Toda função daqui recebe o catálogo que avalia. É o que permite rodar o mesmo
// motor sobre o catálogo vigente, sobre uma cópia editada em memória (simulação
// legislativa) ou sobre um catálogo fictício (scripts/verificar_injecao.ts).
// Nada aqui importa dado.
//
// AVISO: implementação para fins de PESQUISA. Simplifica controvérsias
// doutrinárias e jurisprudenciais. Não substitui análise jurídica.

import type {Cenario} from '../types';
import type {AtributoDef, AtributoResultado, Parametros, Status} from './types';
import {valoresPadrao} from './types';

const ROTULO_STATUS: Record<Status, string> = {
  cabivel: 'CABÍVEL',
  condicional: 'CONDICIONAL',
  incabivel: 'INCABÍVEL',
};

/** Avalia um único atributo, com parâmetros próprios ou padrão. */
export function avaliarAtributo(
  def: AtributoDef,
  c: Cenario,
  params?: Parametros,
): AtributoResultado {
  const p = params ?? valoresPadrao(def);
  const base: AtributoResultado = {
    id: def.id,
    nome: def.nome,
    fundamento: def.fundamento,
    categoria: def.categoria,
    natureza: def.natureza,
    ...def.avaliar(c, p),
  };

  // AS DUAS HIPÓTESES (decisão 8, item 6.e, de 23/09/2026).
  //
  // O tipo com `violencia_condicao` se consuma SEM violência — sequestrar pode
  // ser obtido por fraude, resistir por ameaça que não é grave —, e por isso o
  // campo publicado é "Não". Mas a hipótese violenta existe, e calcular só a
  // primeira a esconderia do leitor: a ficha diria "cabe ANPP" sem ressalva,
  // num tipo em que o ANPP some se houve violência.
  //
  // Em vez de marcar à mão quais atributos a violência governa — lista que
  // envelheceria a cada atributo novo —, avalia-se o MESMO atributo duas vezes
  // e comparam-se as respostas. Onde divergem, o veredito vira condicional e as
  // duas aparecem, com a condição escrita ao lado.
  //
  // Aqui, e não em `calcularAtributos`: o congelamento de equivalência avalia
  // atributo a atributo, e a regra posta uma camada acima ficaria fora dele —
  // viva na ficha e invisível para a trava que existe para vigiá-la.
  if (!c.violenciaCondicao || c.violencia || c.graveAmeaca) return base;
  const naHipotese = def.avaliar({...c, violencia: true, graveAmeaca: true}, p);
  if (naHipotese.status === base.status) return base;
  return {
    ...base,
    status: 'condicional',
    detalhes: [
      ...base.detalhes,
      'DEPENDE DA HIPÓTESE. O tipo não pressupõe violência, e o resultado acima é o do ' +
        'caso sem ela. Havendo violência à pessoa ou grave ameaça, este atributo passa a ' +
        `ser ${ROTULO_STATUS[naHipotese.status]}: ${naHipotese.resumo}`,
      `A condição, como o catálogo a declara: ${c.violenciaCondicao}`,
    ],
  };
}

/**
 * Avalia um catálogo inteiro para um cenário.
 *
 * @param overrides parâmetros editados, por id de atributo. Atributos ausentes
 *   do mapa são avaliados com os valores legais padrão.
 */
export function calcularAtributos(
  catalogo: readonly AtributoDef[],
  c: Cenario,
  overrides?: Record<string, Parametros>,
): AtributoResultado[] {
  return catalogo.map((def) => avaliarAtributo(def, c, overrides?.[def.id]));
}
