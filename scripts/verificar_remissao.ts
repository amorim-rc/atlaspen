/**
 * A pena por remissão, sobre um catálogo FICTÍCIO: o tipo que não comina
 * moldura própria é avaliado contra cada dispositivo de origem, e o veredito é o
 * comum, ou "condicional" com uma linha por origem.
 *
 * Uso: npm run verificar
 */

import type {Cenario, TipoDoMotor} from '../src/lib/types';
import type {AtributoDef} from '../src/lib/atributos/types';
import {num} from '../src/lib/atributos/types';
import {cenarioFromCrime} from '../src/lib/cenario';
import {avaliarTipo, fracaoDe, origensDaRemissao} from '../src/lib/atributos/remissao';

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    falhas += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
};

const tipo = (id: number, artigo: string, crime: string, min: number, max: number, extra: Partial<TipoDoMotor> = {}): TipoDoMotor => ({
  id,
  lei: 'LF',
  artigo,
  crime,
  pena_min_meses: min,
  pena_max_meses: max,
  pena_faixa_rotulo: '',
  hediondo: 'Não',
  resultado_morte: false,
  violencia: 'Não',
  grave_ameaca: 'Não',
  elemento: 'Doloso',
  tentativa: 'Sim',
  perdao_judicial_previsto: false,
  contravencao: false,
  tem_pena_privativa: true,
  pena_por_remissao: null,
  tipo_pena: 'Reclusão',
  ...extra,
});
const remissao = (artigos: string[], operador: 'nenhum' | 'aumento' | 'diminuicao', fracao: string | null) => ({
  dispositivo_fonte: `LF, ${artigos.join(', ')}`,
  lei_fonte: 'LF',
  artigos_fonte: artigos,
  operador,
  fracao,
});

const F1 = tipo(1, 'Art. 1º', 'Falsificação A', 24, 72);
const F2 = tipo(2, 'Art. 2º', 'Falsificação B', 12, 60);
const F2q = tipo(3, 'Art. 2º, §1º', 'Falsificação B qualificada', 24, 60);
const USO = tipo(4, 'Art. 3º', 'Uso', 0, 0, {pena_por_remissao: remissao(['Art. 1º', 'Art. 2º'], 'nenhum', null)});
const METADE = tipo(5, 'Art. 4º', 'Metade', 0, 0, {pena_por_remissao: remissao(['Art. 1º'], 'diminuicao', '1/2'), hediondo: 'Sim'});
const catalogo = [F1, F2, F2q, USO, METADE];

const teto: AtributoDef = {
  id: 'teto',
  nome: 'Teto fictício',
  fundamento: 'Lei inventada',
  categoria: 'processual',
  natureza: 'abstrato',
  descricao: '',
  requisitos: [],
  vedacoes: [],
  alcancaSemPenaPrivativa: false,
  parametros: [{id: 'tetoMeses', rotulo: '', tipo: 'meses', padrao: 60, ajuda: ''}],
  avaliar: (c, p) => ({status: c.penaMax <= num(p, 'tetoMeses') ? 'cabivel' : 'incabivel', resumo: '', detalhes: []}),
};
const vistos: Cenario[] = [];
const espiao: AtributoDef = {
  ...teto,
  id: 'espiao',
  avaliar: (c) => {
    vistos.push(c);
    return {status: 'cabivel', resumo: '', detalhes: []};
  },
};
const montar = (t: TipoDoMotor) => cenarioFromCrime(t);

console.log('\nAs frações');
ok(fracaoDe('1/2') === 0.5 && fracaoDe('1/3') === 1 / 3 && fracaoDe(null) === 0, '1/2, 1/3 e nenhuma');

console.log('\nAs origens');
{
  const o = origensDaRemissao(USO, catalogo);
  ok(o.map((x) => x.tipo.id).join(',') === '1,2,3', 'o art. 3º acha os três registros dos arts. 1º e 2º, com o parágrafo');
  const m = origensDaRemissao(METADE, catalogo);
  ok(m.length === 1 && m[0].penaMin === 12 && m[0].penaMax === 36, 'diminuição de metade: 24–72 vira 12–36');
  ok(origensDaRemissao(F1, catalogo).length === 0, 'tipo sem remissão não tem origem');
}

console.log('\nA junção');
{
  const r = avaliarTipo(teto, {tetoMeses: 60}, USO, catalogo, montar);
  ok(r.status === 'condicional', 'origens divergem (72 passa do teto; 60 não): condicional');
  ok(r.resumo === 'Depende da origem da pena.', 'o resumo diz por quê');
  ok(r.detalhes.length === 3 && r.detalhes.some((d) => /Art\. 1º.*não cabe/.test(d)), 'uma linha por origem, com o veredito dela');

  const todas = avaliarTipo(teto, {tetoMeses: 100}, USO, catalogo, montar);
  ok(todas.status === 'cabivel', 'origens concordam: o veredito comum');

  const sem = avaliarTipo(teto, {tetoMeses: 60}, F1, catalogo, montar);
  ok(sem.status === 'incabivel', 'tipo sem remissão segue o caminho de sempre');
}

console.log('\nNinguém avalia pena zero');
{
  vistos.length = 0;
  avaliarTipo(espiao, {}, METADE, catalogo, montar);
  ok(vistos.length === 1 && vistos[0].penaMax === 36, 'o cenário de remissão tem a moldura da origem, não zero');
  ok(vistos[0].hediondo === true, 'e os campos do tipo que remete (a hediondez é dele)');
}

console.log(falhas === 0 ? '\n✓ Pena por remissão verificada.\n' : `\n✗ ${falhas} falha(s) na remissão.\n`);
process.exit(falhas === 0 ? 0 : 1);
