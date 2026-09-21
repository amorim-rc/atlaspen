/**
 * O motor recebe o catálogo por parâmetro — e funciona com qualquer catálogo.
 *
 * Os casos-âncora de scripts/verificar_atributos.ts avaliam o catálogo real.
 * Aqui o motor corre sobre catálogos FICTÍCIOS: uma base de atributos inventada,
 * modificadores inventados e tipos penais inventados. Se alguma função do
 * núcleo ainda lesse o dado real por baixo dos panos, o resultado sairia do
 * catálogo errado e estes testes acusariam. É a garantia de que a simulação
 * legislativa, que roda sobre uma cópia editada, avalia a cópia e não a lei.
 *
 * Uso: npm run verificar
 */

import type {Cenario, Crime} from '../src/lib/types';
import type {Avaliacao, Parametros} from '../src/lib/atributos/types';
import {num} from '../src/lib/atributos/types';
import {montarCatalogo, indexarCatalogo, type BaseAtributos} from '../src/lib/atributos/carregador';
import {avaliarAtributo, calcularAtributos} from '../src/lib/atributos/nucleo';
import {avaliarCatalogo, cenarioReversoPadrao, contar} from '../src/lib/atributos/reverso';
import {CATALOGO} from '../src/lib/atributos';
import {calcularDosimetria, indexarModificadores} from '../src/lib/dosimetria/motor';
import type {Modificador} from '../src/lib/dosimetria/types';
import {cenarioFromCrime} from '../src/lib/cenario';

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    falhas += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
};

// ── Um catálogo de atributos inventado ──────────────────────────────────
const base: BaseAtributos = {
  atributos: [
    {
      id: 1,
      slug: 'teto-ficticio',
      nome: 'Atributo fictício de teto',
      fundamento: 'Lei inventada, art. 1º',
      categoria: 'processual',
      natureza: 'abstrato',
      descricao: 'Cabe quando a pena máxima não passa do teto.',
      requisitos: ['Pena máxima até o teto.'],
      vedacoes: [],
      alcanca_sem_pena_privativa: false,
      parametros: [
        {id: 'teto', rotulo: 'Teto', tipo: 'meses', padrao: 36, min: 0, max: 600, passo: 1, ajuda: '—'},
      ],
    },
  ],
};
const avaliadores = {
  'teto-ficticio': (c: Cenario, p: Parametros): Avaliacao => ({
    status: c.penaMax <= num(p, 'teto') ? 'cabivel' : 'incabivel',
    resumo: `teto ${num(p, 'teto')}`,
    detalhes: [],
  }),
};

// ── Tipos penais inventados, no formato do derivado ─────────────────────
function tipo(id: number, min: number, max: number): Crime {
  return {
    id, lei: 'LEI-FICTICIA', artigo: `Art. ${id}`, crime: `Tipo ${id}`,
    pena_min: min, pena_max: max, tipo_pena: 'Reclusão', acao: 'Pública Incondicionada',
    hediondo: 'Não', elemento: 'Doloso', tentativa: 'Sim', violencia: 'Não', grave_ameaca: 'Não',
    hediondo_especie: 'nao', hediondo_fundamento: null,
    obs: '', pena_privativa: 'Reclusão', tem_multa: false, multa_regime: 'nenhuma',
    infracao_menor_potencial: false, contravencao: false, derivado_auto: false,
    hediondo_condicional: false, acao_condicional: false, vigente: true,
    pena_min_meses: min, pena_max_meses: max, pena_min_rotulo: '', pena_max_rotulo: '',
    pena_faixa_rotulo: '', tem_pena_privativa: true, sancoes_nao_privativas: [],
    pena_por_remissao: null, resultado_morte: false, resultado_morte_derivado: false,
    perdao_judicial_previsto: false, chave_dispositivo: `ficticia|art. ${id}`, dispositivo_canonico: null,
    duplicata: false, duplicata_divergente: false, duplicata_ids: [],
  };
}
const tipos = [tipo(1, 12, 24), tipo(2, 24, 48), tipo(3, 6, 36)];

console.log('\nInjeção de catálogo: o motor avalia o catálogo que recebe');

{
  const catalogo = montarCatalogo(base, avaliadores);
  ok(catalogo.length === 1 && catalogo[0].id === 'teto-ficticio', 'monta o catálogo a partir de uma base fictícia');
  ok(indexarCatalogo(catalogo)['teto-ficticio'] === catalogo[0], 'indexa o catálogo fictício por id');

  const r = calcularAtributos(catalogo, cenarioFromCrime(tipos[0]));
  ok(r.length === 1 && r[0].status === 'cabivel', 'calcula só os atributos do catálogo passado (1, e não os 22 reais)');
  ok(
    calcularAtributos(catalogo, cenarioFromCrime(tipos[1]))[0].status === 'incabivel',
    'o limiar lido é o do parâmetro fictício (36 meses), e não um valor da lei',
  );
  ok(
    avaliarAtributo(catalogo[0], cenarioFromCrime(tipos[1]), {teto: 48}).status === 'cabivel',
    'parâmetro editado muda o resultado do atributo fictício',
  );

  const c = contar(avaliarCatalogo(catalogo[0], {teto: 36}, tipos, cenarioReversoPadrao()));
  ok(c.cabivel === 2 && c.incabivel === 1, 'busca reversa sobre tipos fictícios: 2 cabíveis, 1 incabível');

  let recusou = false;
  try {
    montarCatalogo(base, {});
  } catch {
    recusou = true;
  }
  ok(recusou, 'atributo sem função de avaliação é erro, e não silêncio');

  ok(CATALOGO.length === 22, 'o catálogo real segue intacto depois de montar o fictício');
}

{
  // Um aumento de metade, na 3ª fase, sobre a moldura de 12 a 24 meses.
  const fict: Modificador[] = [{
    id: 'aumento-ficticio', nome: 'Aumento fictício', dispositivo: 'Lei inventada, art. 2º',
    natureza: 'aumento', fase: 3, sobre: 'pena_provisoria', fracao_min: 0.5, fracao_max: 0.5,
    piso_minimo: false, escopo: {tipo: 'geral'},
  }];
  const porId = indexarModificadores(fict);
  const r = calcularDosimetria(tipos[0], [{id: 'aumento-ficticio'}], porId);
  ok(r.penaDefinitiva === 18, `dosimetria com modificador fictício: 12 + 1/2 = 18 (obtido ${r.penaDefinitiva})`);
  const semMod = calcularDosimetria(tipos[0], [{id: 'agravante-reincidencia'}], porId);
  ok(semMod.penaDefinitiva === 12, 'modificador real não é achado num índice fictício que não o contém');
}

console.log(falhas === 0 ? '\n✓ Injeção de catálogo verificada.\n' : `\n✗ ${falhas} verificação(ões) falharam.\n`);
process.exit(falhas === 0 ? 0 : 1);
