/**
 * A simulação legislativa sobre um catálogo FICTÍCIO.
 *
 * O motor de src/lib/simulacao recebe os tipos e os atributos por parâmetro.
 * Aqui ele corre sobre três atributos e quatro tipos inventados, com contas que
 * se fazem de cabeça: cada operação (criar, modificar, extinguir, nos dois
 * sentidos) tem de mover exatamente os pares que deve, contar as duas unidades
 * certo e não tocar na lei vigente. E o pacote tem de sobreviver à ida e volta
 * pela URL, porque o link é a hipótese.
 *
 * Uso: npm run verificar
 */

import type {TipoDoMotor} from '../src/lib/types';
import type {AtributoDef} from '../src/lib/atributos/types';
import {num} from '../src/lib/atributos/types';
import {cenarioReversoPadrao} from '../src/lib/atributos/reverso';
import {
  CAMPOS_TIPO_PADRAO,
  aplicarPacote,
  avaliarEstado,
  comparar,
  estadoLegal,
  etiquetasDa,
  problemaDa,
} from '../src/lib/simulacao/motor';
import type {Mudanca} from '../src/lib/simulacao/tipos';
import {escreverPacote, lerPacote} from '../src/components/simulacao/estado';

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    falhas += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
};

// ── Um catálogo inventado ────────────────────────────────────────────────
const tipo = (id: number, artigo: string, crime: string, min: number, max: number, extra: Partial<TipoDoMotor> = {}): TipoDoMotor => ({
  id,
  lei: 'LF',
  artigo,
  crime,
  pena_min_meses: min,
  pena_max_meses: max,
  pena_faixa_rotulo: `${min} a ${max} meses`,
  hediondo: 'Não',
  resultado_morte: false,
  violencia: 'Não',
  grave_ameaca: 'Não',
  elemento: 'Doloso',
  tentativa: 'Sim',
  perdao_judicial_previsto: false,
  contravencao: false,
  tem_pena_privativa: true,
  ...extra,
});

const T1 = tipo(1, 'Art. 1º', 'Furto fictício', 12, 24);
const T2 = tipo(2, 'Art. 1º, §1º', 'Furto fictício qualificado', 24, 36);
const T3 = tipo(3, 'Art. 2º', 'Roubo fictício', 48, 120, {violencia: 'Sim'});
const T4 = tipo(4, 'Art. 3º', 'Sem pena privativa', 0, 0, {tem_pena_privativa: false});

const base = {categoria: 'processual' as const, natureza: 'abstrato' as const, descricao: '', requisitos: [], vedacoes: []};
const teto: AtributoDef = {
  ...base,
  id: 'teto',
  nome: 'Teto fictício',
  fundamento: 'Lei inventada, art. 1º',
  parametros: [{id: 'tetoMeses', rotulo: 'Pena máxima até', tipo: 'meses', padrao: 24, min: 0, max: 600, passo: 1, ajuda: ''}],
  avaliar: (c, p) => ({status: c.penaMax <= num(p, 'tetoMeses') ? 'cabivel' : 'incabivel', resumo: '', detalhes: []}),
};
const semViolencia: AtributoDef = {
  ...base,
  id: 'sem-violencia',
  nome: 'Sem violência fictício',
  fundamento: 'Lei inventada, art. 2º',
  parametros: [],
  avaliar: (c) => ({status: c.violencia ? 'incabivel' : 'cabivel', resumo: '', detalhes: []}),
};
const prazo: AtributoDef = {
  ...base,
  id: 'prazo',
  nome: 'Prazo fictício',
  fundamento: 'Lei inventada, art. 3º',
  parametros: [{id: 'fator', rotulo: 'Fator', tipo: 'inteiro', padrao: 2, min: 1, max: 10, passo: 1, ajuda: ''}],
  avaliar: (c, p) => ({status: 'cabivel', resumo: '', detalhes: [], valor: `${Math.round(c.penaMax * num(p, 'fator'))} meses`}),
};

const REV = cenarioReversoPadrao();
const legal = estadoLegal([T1, T2, T3, T4], [teto, semViolencia, prazo]);
const avLegal = avaliarEstado(legal, REV);
const simular = (pacote: Mudanca[]) => {
  const sim = aplicarPacote(legal, pacote);
  return {sim, r: comparar(legal, sim, avLegal, avaliarEstado(sim, REV, {legal, avaliacoes: avLegal}))};
};

console.log('\nPacote vazio');
{
  const {r} = simular([]);
  ok(r.pares.length === 0, 'nada muda');
  ok(r.totalAntes.cenarios === 3 && r.totalAntes.dispositivos === 2, 'três cenários com pena privativa em dois dispositivos (o tipo sem pena fica fora)');
}

console.log('\nAtributo modificado: teto de 24 para 36 meses');
{
  const m: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 36}};
  const {r} = simular([m]);
  const a = r.porAtributo.find((x) => x.id === 'teto')!;
  ok(r.pares.length === 1 && r.pares[0].tipo.id === 2 && r.pares[0].sinal === '+', 'só o furto qualificado entra');
  ok(a.antes!.cenarios === 1 && a.depois!.cenarios === 2, 'cenários: 1 → 2');
  ok(a.antes!.dispositivos === 1 && a.depois!.dispositivos === 1, 'dispositivos: 1 → 1 (o art. 1º já era alcançado pelo caput)');
  ok(etiquetasDa(m, legal, REV, avLegal).join() === 'mellius', 'só entra: in mellius');
}

console.log('\nTipo novo');
{
  const m: Mudanca = {
    sentido: 'tipo',
    op: 'criar',
    campos: {...CAMPOS_TIPO_PADRAO, nome: 'Homicídio fictício', lei: 'LF', artigo: 'Art. 9º', penaMinDias: 1800, penaMaxDias: 7200, violencia: true},
  };
  const {sim, r} = simular([m]);
  const novo = sim.tipos.find((t) => t.id < 0)!;
  ok(novo !== undefined && novo.resultado_morte === true, 'resultado morte derivado do nome, como no catálogo');
  ok(novo.pena_max_meses === 240, 'pena em dias vira meses (7.200 dias = 240 meses)');
  ok(r.totalDepois.cenarios === 4 && r.totalDepois.dispositivos === 3, 'o denominador cresce: 4 cenários, 3 dispositivos');
  ok(r.pares.length === 1 && r.pares[0].atributo.id === 'prazo' && r.pares[0].tipoNovo, 'entra só no atributo que não tem limiar nem vedação');
  ok(etiquetasDa(m, legal, REV, avLegal).join() === 'incriminadora', 'novatio legis incriminadora');
}

console.log('\nTipo extinto');
{
  const m: Mudanca = {sentido: 'tipo', op: 'extinguir', id: 1};
  const {r} = simular([m]);
  ok(r.pares.length === 3 && r.pares.every((p) => p.sinal === '−' && p.tipoExtinto), 'sai dos três atributos que o alcançavam');
  ok(r.totalDepois.cenarios === 2 && r.totalDepois.dispositivos === 2, 'o art. 1º segue no catálogo pelo §1º');
  ok(r.atingidos.cenarios === 1 && r.totalUniao.cenarios === 3, 'atingido 1 de 3 cenários (o denominador conta o extinto)');
  ok(etiquetasDa(m, legal, REV, avLegal).join() === 'abolitio', 'abolitio criminis');
}

console.log('\nTipo modificado');
{
  const baixa: Mudanca = {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 720}};
  const {r} = simular([baixa]);
  const teto2 = r.pares.find((p) => p.atributo.id === 'teto');
  const prazo2 = r.pares.find((p) => p.atributo.id === 'prazo');
  ok(r.pares.length === 2, 'dois pares mudam');
  ok(teto2?.sinal === '+', 'pena máxima para 24 meses: entra no teto');
  ok(prazo2?.sinal === '~' && prazo2.antes?.valor === '72 meses' && prazo2.depois?.valor === '48 meses', 'o prazo muda de valor: 72 → 48 meses');
  ok(etiquetasDa(baixa, legal, REV, avLegal).join() === 'mellius', 'pena para baixo: in mellius');
  const alta: Mudanca = {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 1440, hediondo: true}};
  ok(etiquetasDa(alta, legal, REV, avLegal).join() === 'pejus', 'pena para cima e hediondez: in pejus');
  // Roubo fictício: máxima de 120 para 144 meses (sobe), e deixa de ser violento (desce).
  const mista: Mudanca = {sentido: 'tipo', op: 'modificar', id: 3, campos: {penaMaxDias: 4320, violencia: false}};
  ok(etiquetasDa(mista, legal, REV, avLegal).join() === 'pejus,mellius', 'para cima num campo e para baixo noutro: as duas etiquetas');
  ok(problemaDa({sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMinDias: 2000}}, legal) !== null, 'mínima acima da máxima não entra no cálculo');
}

console.log('\nAtributo extinto');
{
  const m: Mudanca = {sentido: 'atributo', op: 'extinguir', atributo: 'sem-violencia'};
  const {r} = simular([m]);
  const a = r.porAtributo.find((x) => x.id === 'sem-violencia')!;
  ok(r.pares.length === 2 && r.pares.every((p) => p.sinal === '−' && p.atributoExtinto), 'saem os dois que ele alcançava; o violento, que já não cabia, não conta');
  ok(a.depois === null && a.antes!.cenarios === 2, 'alcance depois: extinto');
  ok(etiquetasDa(m, legal, REV, avLegal).join() === 'pejus', 'in pejus');
}

console.log('\nAtributo novo, genérico');
{
  const m: Mudanca = {
    sentido: 'atributo',
    op: 'criar',
    def: {nome: 'Instituto fictício', incidencia: 'cominada_maxima', comparacao: 'ate', limiarDias: 720, vedacoes: ['violencia'], requisitos: ['confissao']},
  };
  const {r} = simular([m]);
  ok(r.pares.length === 1 && r.pares[0].tipo.id === 1, 'só o furto simples: o qualificado passa do limiar e o roubo é vedado');
  ok(r.pares[0].depois?.status === 'condicional', 'confissão é requisito que o catálogo não conhece: condicional');
  ok(r.atributosDepois === 4 && r.porAtributo.find((x) => x.antes === null)?.depois?.cenarios === 1, 'o sistema passa a ter quatro atributos');
  ok(problemaDa({...m, def: {...m.def, nome: ''}}, legal) !== null, 'sem nome, não entra no cálculo');
}

console.log('\nA lei vigente não se move');
{
  simular([
    {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 720}},
    {sentido: 'tipo', op: 'extinguir', id: 1},
    {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 60}},
  ]);
  ok(legal.tipos.length === 4 && T2.pena_max_meses === 36, 'os tipos da lei vigente ficam como estavam');
  ok(legal.atributos[0].params.tetoMeses === 24, 'os parâmetros da lei vigente ficam como estavam');
}

console.log('\nO reaproveitamento não muda a conta');
{
  const pacote: Mudanca[] = [
    {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 720}},
    {sentido: 'atributo', op: 'modificar', atributo: 'prazo', params: {fator: 3}},
  ];
  const sim = aplicarPacote(legal, pacote);
  const comReuso = avaliarEstado(sim, REV, {legal, avaliacoes: avLegal});
  const semReuso = avaliarEstado(sim, REV);
  let iguais = true;
  for (const [atr, mapa] of semReuso) {
    for (const [id, r] of mapa) {
      const o = comReuso.get(atr)?.get(id);
      if (!o || o.status !== r.status || (o.valor ?? '') !== (r.valor ?? '')) iguais = false;
    }
  }
  ok(iguais, 'avaliar tudo de novo e reaproveitar o que não mudou dão o mesmo resultado');
}

console.log('\nIda e volta pela URL');
{
  const porId = {teto, 'sem-violencia': semViolencia, prazo};
  const pacote: Mudanca[] = [
    {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'Fraude; com = sinais e 100% espaço', penaMinDias: 720, penaMaxDias: 2160, violencia: true}},
    {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 720, hediondo: false}},
    {sentido: 'tipo', op: 'extinguir', id: 1},
    {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 36}},
    {sentido: 'atributo', op: 'extinguir', atributo: 'sem-violencia'},
    {
      sentido: 'atributo',
      op: 'criar',
      def: {nome: 'Novo', incidencia: 'aplicada', comparacao: 'acima', limiarDias: 1440, vedacoes: ['hediondo', 'culposo'], requisitos: ['reparacao']},
    },
  ];
  const ordenado = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(ordenado)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, ordenado((v as Record<string, unknown>)[k])]))
        : v;
  const q = escreverPacote(pacote, 3, porId);
  const lido = lerPacote(q, porId);
  ok(JSON.stringify(ordenado(lido.pacote)) === JSON.stringify(ordenado(pacote)), 'as seis mudanças voltam iguais, com texto livre e tudo');
  ok(lido.ativo === 3, 'e a mudança em edição também');
  // O separador dentro de texto livre precisa de escape duplo; o resto da URL, não.
  const simples = escreverPacote(
    [
      {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 36}},
      {sentido: 'tipo', op: 'modificar', id: 2, campos: {penaMaxDias: 720}},
    ],
    0,
    porId,
  );
  ok(simples === '?m=am;teto;tetoMeses=3a&m=tm;2;max=2a', `a URL de uma hipótese comum é legível: ${simples}`);
}

console.log(falhas === 0 ? '\n✓ Simulação legislativa verificada.\n' : `\n✗ ${falhas} falha(s) na simulação.\n`);
process.exit(falhas === 0 ? 0 : 1);
