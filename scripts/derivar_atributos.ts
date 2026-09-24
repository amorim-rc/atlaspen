/**
 * O derivado dos atributos penais (frente 5 do backlog, commit 4 da migração).
 *
 * Lê a fonte (data/atributos.json), o histórico (data/historico-legislativo.json)
 * e o catálogo de tipos já derivado (static/data/crimes.json), e grava
 * static/data/atributos.json: a fonte mais, em cada atributo e em cada parâmetro,
 * a última alteração legislativa e quantas houve; e, em cada atributo, o
 * alcance — os ids dos tipos em que ele é cabível e condicional sob o cenário de
 * referência declarado no próprio arquivo. Incabível é o resto.
 *
 * Nada aqui se digita: rodar de novo sobre os mesmos dados dá o mesmo arquivo, e
 * a CI exige o derivado sincronizado com a fonte, como no catálogo de tipos.
 *
 * Uso, a partir da raiz (depois de scripts/transform_data.py):
 *   npm run atributos
 */

import * as fs from 'fs';
import * as path from 'path';
import type {Crime} from '../src/lib/types';
import {POR_ID} from '../src/lib/atributos';
import {avaliarTipo} from '../src/lib/atributos/remissao';
import {
  cenarioParaCrime,
  cenarioReversoPadrao,
  crimesComPenaPrivativa,
} from '../src/lib/atributos/reverso';

const RAIZ = process.cwd();
const SAIDA = path.join(RAIZ, 'static', 'data', 'atributos.json');
const ler = (p: string) => JSON.parse(fs.readFileSync(path.join(RAIZ, p), 'utf-8'));

interface Linha {
  dispositivo: string;
  evento: string;
  norma: string | null;
  ano?: number;
  url?: string;
  vigencia?: string;
  natureza: string;
}

const fonte = ler('data/atributos.json');
const historico: Linha[] = ler('data/historico-legislativo.json').eventos;
const todos: Crime[] = ler('static/data/crimes.json');
const crimes = crimesComPenaPrivativa(todos).sort((a, b) => a.id - b.id);
const rev = cenarioReversoPadrao();

// Chave sem vírgula é o artigo inteiro (scripts/robos/nucleo/historico.py).
const eArtigo = (k: string) => !k.split('|', 2)[1].includes(', ');
const linhasDe = (k: string): Linha[] =>
  historico.filter(
    (l) => l.dispositivo === k || (eArtigo(k) && l.dispositivo.startsWith(k + ', ')),
  );
const chavesDe = (f: {dispositivo?: string; dispositivos?: string[]}): string[] => [
  ...(f.dispositivo ? [f.dispositivo] : []),
  ...(f.dispositivos ?? []),
];

// Alteração é o que uma lei fez depois do texto original: nascer no original não conta.
const eAlteracao = (l: Linha) =>
  l.natureza === 'legislativa' && !(l.evento === 'criacao' && l.norma === 'original');

function resumo(linhas: Linha[]) {
  const unicas = [...new Set(linhas)].filter(eAlteracao);
  if (!unicas.length) return {ultima_alteracao: null, alteracoes_legislativas: 0};
  const peso = (l: Linha) => [l.ano ?? 0, historico.indexOf(l)];
  const ultima = unicas.reduce((a, b) => {
    const [pa, pb] = [peso(a), peso(b)];
    return pb[0] > pa[0] || (pb[0] === pa[0] && pb[1] > pa[1]) ? b : a;
  });
  return {
    ultima_alteracao: {
      norma: ultima.norma,
      ano: ultima.ano ?? null,
      evento: ultima.evento,
      dispositivo: ultima.dispositivo,
      url: ultima.url ?? null,
      ...(ultima.vigencia ? {vigencia: ultima.vigencia} : {}),
    },
    // Conta LEIS, e não linhas do histórico: o Pacote Anticrime criou o art.
    // 28-A do CPP em 25 unidades, e a ANPP aparecia com "25 alterações". Uma lei
    // que inclui e altera no mesmo ato também é uma só. scripts/transform_data.py
    // (derivar_ultima_alteracao) faz a mesma conta para os tipos.
    alteracoes_legislativas: new Set(unicas.map((l) => `${l.norma}|${l.ano ?? ''}`)).size,
  };
}

// Parâmetro sem dispositivo (só súmula ou decisão), sem fonte legal, ou com uma
// redação que o compilado não data: não se sabe, e o derivado diz null. Zero
// quer dizer outra coisa — o texto é o original.
function doParametro(p: any) {
  const redacoes: any[] = p.redacoes ?? [];
  const chaves = redacoes.flatMap((r) => chavesDe(r.fonte));
  if (!chaves.length || redacoes.some((r) => r.norma === null)) {
    return {...p, ultima_alteracao: null, alteracoes_legislativas: null};
  }
  return {...p, ...resumo(chaves.flatMap(linhasDe))};
}

const atributos = fonte.atributos.map((a: any) => {
  const def = POR_ID[a.slug];
  if (!def) throw new Error(`atributo ${a.id} (${a.slug}) sem avaliador no motor`);
  const params = Object.fromEntries(a.parametros.map((p: any) => [p.id, p.padrao]));
  const cabivel: number[] = [];
  const condicional: number[] = [];
  for (const c of crimes) {
    const st = avaliarTipo(def, params, c, crimes, (t) => cenarioParaCrime(t, rev)).status;
    if (st === 'cabivel') cabivel.push(c.id);
    else if (st === 'condicional') condicional.push(c.id);
  }
  const chaves = [
    ...a.dispositivos,
    ...a.parametros.flatMap((p: any) => (p.redacoes ?? []).flatMap((r: any) => chavesDe(r.fonte))),
  ];
  const {parametros, ...resto} = a;
  // Chave sem nenhuma linha é unidade que o compilado não data (sob chapéu
  // anotado). Sem alteração conhecida e com uma delas no meio, o atributo não
  // pode dizer zero: diz null, como o parâmetro.
  const sabido = resumo(chaves.flatMap(linhasDe));
  const cala = chaves.some((k) => !linhasDe(k).length);
  return {
    ...resto,
    ...(sabido.alteracoes_legislativas === 0 && cala
      ? {ultima_alteracao: null, alteracoes_legislativas: null}
      : sabido),
    parametros: parametros.map(doParametro),
    alcance: {cabivel, condicional},
  };
});

const meta = {
  descricao:
    'Derivado de data/atributos.json por scripts/derivar_atributos.ts: não edite à mão. ' +
    'Fonte mais a última alteração legislativa e o alcance de cada atributo ' +
    '(.superpowers/specs/2026-09-10-modelo-atributos.md, seção 4.6).',
  ultima_alteracao:
    'O evento legislativo mais recente nos dispositivos citados, lido de ' +
    'data/historico-legislativo.json; `alteracoes_legislativas` conta os eventos ' +
    'posteriores ao texto original. null é "não se sabe": no parâmetro, sem ' +
    'dispositivo (súmula, decisão), sem fonte legal, ou com redação que o compilado ' +
    'não data; no atributo, nenhuma alteração conhecida e algum dispositivo não datado.',
  alcance:
    'Ids dos tipos penais com pena privativa em que o atributo é cabível e condicional, ' +
    'com os parâmetros no padrão (lei vigente) e sob o cenário de referência. ' +
    'Incabível é o resto.',
  cenario_referencia: {
    pena_concreta: rev.base === 'minima' ? 'mínima cominada' : rev.base,
    reincidencia: rev.reincidencia,
    comando_orgcrim_ultraviolenta: rev.comandoOrgcrimUltraviolenta,
    confessou: rev.confessou,
    reparou_dano: rev.reparouDano,
    bons_antecedentes: rev.bonsAntecedentes,
  },
  tipos_avaliados: crimes.length,
};

// As listas de ids numa linha só: indentadas, seriam trinta mil linhas de números.
const texto = JSON.stringify({_meta: meta, atributos}, null, 2).replace(
  /\[\n\s+(\d+(?:,\n\s+\d+)*)\n\s+\]/g,
  (_, nums: string) => '[' + nums.split(/,\s+/).join(', ') + ']',
);
fs.writeFileSync(SAIDA, texto + '\n', 'utf-8');
console.log(
  `${atributos.length} atributos × ${crimes.length} tipos -> ${path.relative(RAIZ, SAIDA)}`,
);
