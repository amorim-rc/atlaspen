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
import type {AtributoDef, AtributoResultado, Avaliacao} from '../src/lib/atributos/types';
import {num} from '../src/lib/atributos/types';
import {cenarioReversoPadrao} from '../src/lib/atributos/reverso';
import {
  CAMPOS_TIPO_PADRAO,
  aplicarPacote,
  avaliarEstado,
  comparar,
  atributoNovo,
  estadoLegal,
  etiquetasDa,
  pacoteValido,
  problemaDa,
  removerMudanca,
  sinalDe,
  tipoCriadoNoPacote,
  tiposCriadosAntes,
  valorPorFaixa,
} from '../src/lib/simulacao/motor';
import type {Mudanca} from '../src/lib/simulacao/tipos';
import {cenarioFromCrime} from '../src/lib/cenario';
import {CATALOGO} from '../src/lib/atributos';
import {escreverFracao, escreverPacote, lerFracao, lerPacote} from '../src/components/simulacao/estado';
import {RECORTE_PADRAO, descrever, recorte} from '../src/components/simulacao/nota';

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
  pena_por_remissao: null,
  tipo_pena: 'Reclusão',
  ...extra,
});

const T1 = tipo(1, 'Art. 1º', 'Furto fictício', 12, 24);
const T2 = tipo(2, 'Art. 1º, §1º', 'Furto fictício qualificado', 24, 36);
const T3 = tipo(3, 'Art. 2º', 'Roubo fictício', 48, 120, {violencia: 'Sim'});
const T4 = tipo(4, 'Art. 3º', 'Sem pena privativa', 0, 0, {tem_pena_privativa: false});

const base = {categoria: 'processual' as const, natureza: 'abstrato' as const, descricao: '', requisitos: [], vedacoes: [], alcancaSemPenaPrivativa: false};
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

console.log('\nA premissa vai e volta pela URL do pacote');
{
  const porId = {teto, 'sem-violencia': semViolencia, prazo};
  const m: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 36}};
  const padrao = cenarioReversoPadrao();

  ok(escreverPacote([m], 0, porId, padrao) === escreverPacote([m], 0, porId), 'passar o padrão é o mesmo que não passar');
  ok(!escreverPacote([m], 0, porId, padrao).includes('base='), 'a premissa padrão não suja a URL');

  const mexida = {...padrao, base: 'maxima' as const, reincidencia: 'especifico' as const};
  const url = escreverPacote([m], 0, porId, mexida);
  ok(url.includes('base=maxima') && url.includes('reu=especifico'), `a premissa mexida entra na URL: ${url}`);

  const volta = lerPacote(url, porId);
  ok(volta.rev.base === 'maxima', 'a base volta da URL');
  ok(volta.rev.reincidencia === 'especifico', 'a circunstância volta da URL');
  ok(volta.pacote.length === 1, 'o pacote continua chegando inteiro');
  ok(lerPacote('?m=am;teto;tetoMeses=3a', porId).rev.base === 'minima', 'link antigo, sem premissa, abre no padrão');
}

console.log('\nO recorte da nota acompanha a premissa');
{
  const padrao = cenarioReversoPadrao();
  ok(recorte(padrao) === RECORTE_PADRAO, 'no padrão, o recorte é o texto de antes, palavra por palavra');

  const maxima = recorte({...padrao, base: 'maxima'});
  ok(maxima.includes('pena máxima cominada') && !maxima.includes('pena mínima cominada'), 'na máxima, o recorte fala da máxima e não da mínima');

  const reinc = recorte({...padrao, reincidencia: 'especifico' as const});
  ok(reinc.includes('reincidente específico') && !reinc.includes('primário'), 'a reincidência substitui o réu primário');

  const fixa = recorte({...padrao, base: 'fixa', penaFixaMeses: 36});
  ok(fixa.includes('3 anos'), `a pena fixa entra por extenso: ${fixa}`);

  const confesso = recorte({...padrao, confessou: true});
  ok(confesso.includes('com confissão formal'), 'a circunstância usa o mesmo vocabulário da ficha');
}

// ── A2, de 24/09/2026: as quatro pendências da simulação ──────────────────

console.log('\nAtributo novo com FAIXA (mais de um limiar)');
{
  // O limiar único não representava o que a lei faz com frequência: o sursis
  // vai até dois anos, o semiaberto de quatro a oito. Com `entre`, o piso é
  // exclusivo e o teto inclusivo, como nos institutos.
  const faixa = atributoNovo(
    {nome: 'Faixa fictícia', incidencia: 'cominada_maxima', comparacao: 'entre',
     limiarDias: 24 * 30, limiarSuperiorDias: 60 * 30, vedacoes: [], requisitos: []},
    'faixa',
  );
  const av = (t: TipoDoMotor) => faixa.avaliar(cenarioFromCrime(t), {}).status;
  ok(av(T1) === 'incabivel', `pena máxima 24m não passa do piso de 24m (obtido ${av(T1)})`);
  ok(av(T2) === 'cabivel', `pena máxima 36m está na faixa (obtido ${av(T2)})`);
  ok(av(T3) === 'incabivel', `pena máxima 120m passa do teto de 60m (obtido ${av(T3)})`);
  ok(faixa.descricao.includes('acima de') && faixa.descricao.includes('e até'),
    `a descrição diz os dois limiares (obtido "${faixa.descricao}")`);
  // E a validação cobra o teto.
  const semTeto: Mudanca = {sentido: 'atributo', op: 'criar',
    def: {nome: 'x', incidencia: 'cominada_maxima', comparacao: 'entre', limiarDias: 720,
          vedacoes: [], requisitos: []}};
  ok(problemaDa(semTeto, legal) === 'Informe o teto da faixa.',
    'faixa sem teto não entra no cálculo');
  const tetoBaixo: Mudanca = {sentido: 'atributo', op: 'criar',
    def: {nome: 'x', incidencia: 'cominada_maxima', comparacao: 'entre', limiarDias: 720,
          limiarSuperiorDias: 360, vedacoes: [], requisitos: []}};
  ok(problemaDa(tetoBaixo, legal) === 'O teto da faixa não passa do piso.',
    'faixa invertida não entra no cálculo');
}

console.log('\nTipo modificado: nome, dispositivo e elemento');
{
  // Os três faltavam. Renomear importa porque o resultado morte deriva do nome.
  const m: Mudanca = {sentido: 'tipo', op: 'modificar', id: 1,
    campos: {nome: 'Furto fictício seguido de morte', lei: 'LX', artigo: 'Art. 9º'}};
  const {sim} = simular([m]);
  const t = sim.tipos.find((x) => x.id === 1)!;
  ok(t.crime === 'Furto fictício seguido de morte', 'o nome muda');
  ok(t.lei === 'LX' && t.artigo === 'Art. 9º', 'o dispositivo muda');
  ok(t.resultado_morte === true,
    'o resultado morte RE-DERIVA do nome novo — manter o antigo publicaria contradição');

  // O elemento decide a tentativa, pela régua das decisões 20 e 31.
  const paraPreterdoloso: Mudanca = {sentido: 'tipo', op: 'modificar', id: 1,
    campos: {elemento: 'Preterdoloso'}};
  const t2 = aplicarPacote(legal, [paraPreterdoloso]).tipos.find((x) => x.id === 1)!;
  ok(t2.elemento === 'Preterdoloso' && t2.tentativa === 'Não',
    `preterdoloso não admite tentativa (obtido ${t2.elemento}/${t2.tentativa})`);
  const paraQualificado: Mudanca = {sentido: 'tipo', op: 'modificar', id: 1,
    campos: {elemento: 'Qualificado pelo resultado'}};
  const t3 = aplicarPacote(legal, [paraQualificado]).tipos.find((x) => x.id === 1)!;
  ok(t3.tentativa === 'Sim',
    `qualificado pelo resultado admite tentativa (obtido ${t3.tentativa})`);
  // E o tipo que nada disso toca mantém o valor do catálogo.
  const soPena: Mudanca = {sentido: 'tipo', op: 'modificar', id: 1, campos: {penaMaxDias: 900}};
  const t4 = aplicarPacote(legal, [soPena]).tipos.find((x) => x.id === 1)!;
  ok(t4.tentativa === T1.tentativa && t4.crime === T1.crime,
    'mexer só na pena não reescreve nome nem tentativa');
}

console.log('\nEtiqueta da mudança que só altera VALOR');
{
  // Até 24/09/2026 a tela dizia "sentido não classificado" aqui. O sentido
  // existe: cada parâmetro declara se aumentar favorece o réu.
  const comSentido: AtributoDef = {
    ...base,
    id: 'com-sentido',
    nome: 'Prazo com sentido',
    fundamento: 'Lei inventada, art. 4º',
    parametros: [{id: 'fator', rotulo: 'Fator', tipo: 'inteiro', padrao: 2, min: 1, max: 10,
                  passo: 1, ajuda: '', aumentarFavorece: false,
                  aumentarPorque: 'prazo de ônus: subir prolonga'}],
    avaliar: (c, p) => ({status: 'cabivel', resumo: '', detalhes: [],
                         valor: `${Math.round(c.penaMax * num(p, 'fator'))} meses`}),
  };
  const comLegal = estadoLegal([T1, T2, T3, T4], [comSentido]);
  const comAv = avaliarEstado(comLegal, REV);
  const sobe: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'com-sentido',
    params: {fator: 4}};
  const desce: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'com-sentido',
    params: {fator: 1}};
  ok(etiquetasDa(sobe, comLegal, REV, comAv).join() === 'pejus',
    `fator para cima, num parâmetro que desfavorece: in pejus (obtido "${etiquetasDa(sobe, comLegal, REV, comAv).join()}")`);
  ok(etiquetasDa(desce, comLegal, REV, comAv).join() === 'mellius',
    `fator para baixo: in mellius (obtido "${etiquetasDa(desce, comLegal, REV, comAv).join()}")`);
  // Sem a anotação, continua sem etiqueta: a tela não adivinha.
  const semSentido: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'prazo',
    params: {fator: 4}};
  ok(etiquetasDa(semSentido, legal, REV, avLegal).length === 0,
    'parâmetro sem sentido declarado continua sem etiqueta');
}

console.log('\nA base real declara o sentido de todo parâmetro');
{
  const semSentido = CATALOGO.flatMap((a) =>
    a.parametros.filter((p) => p.aumentarFavorece === undefined).map((p) => `${a.id}/${p.id}`),
  );
  ok(semSentido.length === 0,
    `todo parâmetro dos 22 atributos diz se aumentar favorece (faltam: ${semSentido.join(', ') || 'nenhum'})`);
}

// ── 25/09/2026: o débito técnico 5 ────────────────────────────────────────

console.log('\nTipo criado no pacote, modificado por mudança posterior');
{
  // O tipo criado recebe o id -(k+1) da posição da sua mudança, e a mudança
  // seguinte o alcança por esse id. Aqui: criado com máxima de 24 meses (entra
  // no teto fictício, que vai até 24), depois levado a 48 (sai do teto).
  const criar: Mudanca = {
    sentido: 'tipo',
    op: 'criar',
    campos: {...CAMPOS_TIPO_PADRAO, nome: 'Tipo criado', lei: 'LF', artigo: 'Art. 20', penaMinDias: 360, penaMaxDias: 720},
  };
  const so = simular([criar]);
  ok(so.r.pares.filter((p) => p.tipo.id === -1).length === 3, 'sozinho, o criado entra nos três atributos (teto, sem violência, prazo)');
  const modificar: Mudanca = {sentido: 'tipo', op: 'modificar', id: -1, campos: {penaMaxDias: 1440}};
  const {sim, r} = simular([criar, modificar]);
  const criado = sim.tipos.find((t) => t.id === -1)!;
  ok(criado !== undefined && criado.pena_max_meses === 48, `a modificação alcança o criado: máxima 48 meses (obtido ${criado?.pena_max_meses})`);
  ok(sim.tipos.filter((t) => t.id < 0).length === 1, 'um só tipo novo no catálogo simulado, e não dois');
  const teto1 = r.pares.find((p) => p.tipo.id === -1 && p.atributo.id === 'teto');
  ok(teto1 === undefined && r.pares.filter((p) => p.tipo.id === -1).length === 2, 'com a máxima em 48, o criado já não entra no teto: o impacto mudou');
  ok(problemaDa(modificar, legal, {pacote: [criar, modificar], indice: 1}) === null, 'a referência ao criar anterior é válida');
  ok(etiquetasDa(modificar, legal, REV, avLegal, {pacote: [criar, modificar], indice: 1}).join() === 'pejus', 'pena para cima no criado: in pejus');
  ok(
    descrever(modificar, legal, {pacote: [criar, modificar], indice: 1}).startsWith('o tipo criado nesta simulação, Tipo criado (LF, art. 20): pena máxima de 2 anos para 4 anos'),
    `a nota diz que o alvo é o tipo criado nesta simulação (obtido "${descrever(modificar, legal, {pacote: [criar, modificar], indice: 1})}")`,
  );

  // A segunda modificação parte do estado que a primeira deixou.
  const segunda: Mudanca = {sentido: 'tipo', op: 'modificar', id: -1, campos: {hediondo: true}};
  const pacote3 = [criar, modificar, segunda];
  const visto = tipoCriadoNoPacote(-1, pacote3, 2)!;
  ok(visto.pena_max_meses === 48, 'quem vem depois vê o criado já modificado');
  const t3 = aplicarPacote(legal, pacote3).tipos.find((t) => t.id === -1)!;
  ok(t3.pena_max_meses === 48 && t3.hediondo === 'Sim', 'as duas modificações se acumulam sobre o criado');
  ok(tiposCriadosAntes(pacote3, 3).length === 1 && tiposCriadosAntes(pacote3, 0).length === 0, 'a lista dos criados respeita a posição');
}

console.log('\nTipo criado no pacote, extinto por mudança posterior');
{
  const criar: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'Efêmero', penaMaxDias: 720}};
  const extinguir: Mudanca = {sentido: 'tipo', op: 'extinguir', id: -1};
  const {sim, r} = simular([criar, extinguir]);
  ok(r.pares.length === 0, 'criar e extinguir o criado anula: nenhum par muda');
  ok(sim.tipos.length === legal.tipos.length && r.totalDepois.cenarios === r.totalAntes.cenarios, 'o catálogo simulado é o vigente');
  ok(etiquetasDa(extinguir, legal, REV, avLegal, {pacote: [criar, extinguir], indice: 1}).length === 0, 'extinguir o criado não é abolitio criminis: sem etiqueta');
  ok(descrever(extinguir, legal, {pacote: [criar, extinguir], indice: 1}).includes('retirado do pacote'), 'a nota diz que o criado não chega ao catálogo');
  // Depois de extinto, ninguém mais o alcança.
  const tarde: Mudanca = {sentido: 'tipo', op: 'modificar', id: -1, campos: {penaMaxDias: 900}};
  const p = problemaDa(tarde, legal, {pacote: [criar, extinguir, tarde], indice: 2});
  ok(p !== null && p.includes('extinto'), `modificar o criado depois de extinto é problema (obtido "${p}")`);
}

console.log('\nReferência a criar que vem depois, ou que já não está lá');
{
  const criar: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'Tardio', penaMaxDias: 720}};
  const cedo: Mudanca = {sentido: 'tipo', op: 'modificar', id: -2, campos: {penaMaxDias: 900}};
  const pacote = [cedo, criar];
  const p1 = problemaDa(cedo, legal, {pacote, indice: 0});
  ok(p1 !== null && p1.includes('vem depois'), `apontar para um criar posterior é problema (obtido "${p1}")`);
  ok(aplicarPacote(legal, pacote).tipos.find((t) => t.id === -2)?.pena_max_meses === 24, 'e o criar posterior entra intacto');
  ok(problemaDa(cedo, legal) !== null, 'sem o contexto do pacote, a referência não se resolve');
  const trocado: Mudanca = {sentido: 'atributo', op: 'extinguir', atributo: 'teto'};
  const p2 = problemaDa({...cedo, id: -1}, legal, {pacote: [trocado, {...cedo, id: -1}], indice: 1});
  ok(p2 !== null && p2.includes('já não cria'), `apontar para posição que já não é um criar é problema (obtido "${p2}")`);
  const semNome: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: '', penaMaxDias: 720}};
  const p3 = problemaDa({...cedo, id: -1}, legal, {pacote: [semNome, {...cedo, id: -1}], indice: 1});
  ok(p3 !== null && p3.includes('Complete primeiro'), `apontar para um criar incompleto é problema (obtido "${p3}")`);
}

console.log('\nO pacote válido remapeia os ids; remover uma mudança renumera');
{
  const semNome: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: '', penaMaxDias: 720}};
  const criarA: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'A', penaMaxDias: 720}};
  const criarB: Mudanca = {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'B', penaMaxDias: 720}};
  const modB: Mudanca = {sentido: 'tipo', op: 'modificar', id: -3, campos: {penaMaxDias: 900}};
  const validas = pacoteValido([semNome, criarA, criarB, modB], legal);
  ok(validas.length === 3, 'o criar sem nome fica de fora');
  ok(validas[2].sentido === 'tipo' && validas[2].op === 'modificar' && validas[2].id === -2, `o -3 vira -2, porque o B passou à segunda posição (obtido ${(validas[2] as {id: number}).id})`);
  const antes = aplicarPacote(legal, [semNome, criarA, criarB, modB]).tipos.find((t) => t.crime === 'B')!.pena_max_meses;
  const depois = aplicarPacote(legal, validas).tipos.find((t) => t.crime === 'B')!.pena_max_meses;
  ok(antes === 30 && depois === 30, 'aplicar o pacote inteiro ou só o válido dá o mesmo catálogo');

  const semA = removerMudanca([criarA, criarB, {...modB, id: -2}], 0);
  ok((semA[1] as {id: number}).id === -1, 'remover a primeira: quem apontava para a segunda passa a apontar para a primeira');
  const semB = removerMudanca([criarA, criarB, {...modB, id: -2}], 1);
  ok((semB[1] as {id: number | null}).id === null, 'remover o próprio alvo: a referência volta a "escolha o tipo"');
  const semOutra = removerMudanca([criarA, {...modB, id: -1}, criarB], 2);
  ok((semOutra[1] as {id: number}).id === -1, 'remover quem vem depois não mexe na referência');
}

console.log('\nO id negativo vai e volta pela URL');
{
  const porId = {teto, 'sem-violencia': semViolencia, prazo};
  const pacote: Mudanca[] = [
    {sentido: 'tipo', op: 'criar', campos: {...CAMPOS_TIPO_PADRAO, nome: 'Criado', penaMinDias: 360, penaMaxDias: 720}},
    {sentido: 'tipo', op: 'modificar', id: -1, campos: {penaMaxDias: 1440}},
    {sentido: 'tipo', op: 'extinguir', id: -1},
  ];
  const q = escreverPacote(pacote, 1, porId);
  ok(q.includes('m=tm;-1;max=4a') && q.includes('m=tx;-1'), `o id negativo aparece como está: ${q}`);
  const lido = lerPacote(q, porId);
  ok(JSON.stringify(lido.pacote) === JSON.stringify(pacote), 'e volta igual, inclusive o alvo criado no pacote');
  ok(lerPacote('?m=tm;0;max=4a', porId).pacote[0]?.sentido === 'tipo' && (lerPacote('?m=tm;0;max=4a', porId).pacote[0] as {id: number | null}).id === null, 'zero não é ninguém');
}

/** `sinalDe` lê status e valor; a avaliação solta vira resultado com metadados vazios. */
const res = (a: Avaliacao): AtributoResultado => ({...a, id: 'x', nome: '', fundamento: '', categoria: 'processual', natureza: 'abstrato'});

console.log('\nAtributo novo que devolve FRAÇÃO da pena');
{
  // A forma da progressão: o valor é a pena-base vezes a fração. Sobre a pena
  // máxima cominada, o furto fictício (24 meses) a 1/6 dá 4 meses.
  const base = {nome: 'Fração fictícia', incidencia: 'cominada_maxima' as const, comparacao: 'acima' as const, limiarDias: 0, vedacoes: [], requisitos: []};
  const umSexto = atributoNovo({...base, devolve: 'fracao', fracao: 1 / 6}, 'f1');
  const umTerco = atributoNovo({...base, devolve: 'fracao', fracao: 1 / 3}, 'f2');
  const r1 = umSexto.avaliar(cenarioFromCrime(T1), {});
  ok(r1.status === 'cabivel' && r1.valor === '1/6 — 4 meses', `1/6 de 24 meses: "1/6 — 4 meses" (obtido "${r1.valor}")`);
  const r3 = umSexto.avaliar(cenarioFromCrime(T3), {});
  ok(r3.valor === '1/6 — 1 ano e 8 meses', `1/6 de 120 meses: "1 ano e 8 meses" (obtido "${r3.valor}")`);
  const r2 = umTerco.avaliar(cenarioFromCrime(T1), {});
  ok(r2.valor === '1/3 — 8 meses', `1/3 de 24 meses (obtido "${r2.valor}")`);
  ok(sinalDe(res(r1), res(r2)) === '~', 'entre duas simulações do mesmo tipo, mudar só a fração é "muda de valor"');
  ok(sinalDe(res(r1), res(umSexto.avaliar(cenarioFromCrime(T1), {}))) === '=', 'e a mesma fração não se move');
  ok(umSexto.descricao.includes('Devolve 1/6 da pena máxima cominada'), `a descrição diz o que devolve (obtido "${umSexto.descricao}")`);
  // O veredito continua decidido pelo limiar e pelas vedações; o valor é acréscimo.
  const vedado = atributoNovo({...base, devolve: 'fracao', fracao: 1 / 6, vedacoes: ['violencia']}, 'f3').avaliar(cenarioFromCrime(T3), {});
  ok(vedado.status === 'incabivel' && vedado.valor === undefined, 'vedado: incabível e sem valor');
  const semFracao: Mudanca = {sentido: 'atributo', op: 'criar', def: {...base, devolve: 'fracao', fracao: 0}};
  ok(problemaDa(semFracao, legal) !== null, 'fração zero não entra no cálculo');
  ok(problemaDa({...semFracao, def: {...base, devolve: 'fracao', fracao: 1.5}}, legal) !== null, 'fração acima da pena inteira não entra no cálculo');
  const {r} = simular([{sentido: 'atributo', op: 'criar', def: {...base, devolve: 'fracao', fracao: 1 / 6}}]);
  ok(r.pares.length === 3 && r.pares.every((p) => p.sinal === '+' && p.depois?.valor?.startsWith('1/6 — ')), 'no pacote, o atributo novo entra nos três tipos com pena, cada um com o seu valor');
}

console.log('\nAtributo novo que devolve PRAZO POR FAIXA da pena');
{
  // A forma do art. 109 do CP: até X, vale Y; o último vale acima. Degraus fora
  // de ordem são ordenados pelo motor.
  const base = {nome: 'Faixas fictícias', incidencia: 'cominada_maxima' as const, comparacao: 'acima' as const, limiarDias: 0, vedacoes: [], requisitos: []};
  const def = {
    ...base,
    devolve: 'faixas' as const,
    faixas: [
      {ateDias: 36 * 30, valorDias: 4 * 360},
      {ateDias: 24 * 30, valorDias: 3 * 360},
    ],
    acimaDias: 8 * 360,
  };
  const a = atributoNovo(def, 'x1');
  ok(a.avaliar(cenarioFromCrime(T1), {}).valor === '3 anos', `pena máxima 24 meses cai no degrau de 24: 3 anos (obtido "${a.avaliar(cenarioFromCrime(T1), {}).valor}")`);
  ok(a.avaliar(cenarioFromCrime(T2), {}).valor === '4 anos', `36 meses cai no degrau de 36: 4 anos (obtido "${a.avaliar(cenarioFromCrime(T2), {}).valor}")`);
  ok(a.avaliar(cenarioFromCrime(T3), {}).valor === '8 anos', `120 meses passa de todos: vale o de acima, 8 anos (obtido "${a.avaliar(cenarioFromCrime(T3), {}).valor}")`);
  ok(valorPorFaixa(def, 24 * 30) === 3 * 360 && valorPorFaixa(def, 24 * 30 + 1) === 4 * 360, 'o degrau é inclusivo: até 24 meses vale 3 anos; um dia a mais, 4');
  ok(a.descricao.includes('até 2 anos, 3 anos; até 3 anos, 4 anos; acima, 8 anos'), `a descrição lista os degraus em ordem (obtido "${a.descricao}")`);
  const outra = atributoNovo({...def, acimaDias: 12 * 360}, 'x2');
  ok(sinalDe(res(a.avaliar(cenarioFromCrime(T3), {})), res(outra.avaliar(cenarioFromCrime(T3), {}))) === '~', 'mudar o valor de acima muda o valor de quem está acima');
  ok(sinalDe(res(a.avaliar(cenarioFromCrime(T1), {})), res(outra.avaliar(cenarioFromCrime(T1), {}))) === '=', 'e não move quem está nos degraus');
  const m = (d: Partial<typeof def>): Mudanca => ({sentido: 'atributo', op: 'criar', def: {...def, ...d}});
  ok(problemaDa(m({faixas: []}), legal) !== null, 'sem degrau não entra no cálculo');
  ok(problemaDa(m({faixas: [{ateDias: 720, valorDias: 360}, {ateDias: 720, valorDias: 720}]}), legal) !== null, 'dois degraus no mesmo limite não entram');
  ok(problemaDa(m({acimaDias: 0}), legal) !== null, 'sem o valor de acima não entra');
  ok(problemaDa(m({}), legal) === null, 'a tabela completa entra');
}

console.log('\nOs dois modos vão e voltam pela URL');
{
  const porId = {teto, 'sem-violencia': semViolencia, prazo};
  const pacote: Mudanca[] = [
    {
      sentido: 'atributo',
      op: 'criar',
      def: {nome: 'Fração', incidencia: 'aplicada', comparacao: 'ate', limiarDias: 2880, vedacoes: [], requisitos: [], devolve: 'fracao', fracao: 1 / 6},
    },
    {
      sentido: 'atributo',
      op: 'criar',
      def: {
        nome: 'Faixas',
        incidencia: 'cominada_maxima',
        comparacao: 'acima',
        limiarDias: 0,
        vedacoes: [],
        requisitos: [],
        devolve: 'faixas',
        faixas: [
          {ateDias: 360, valorDias: 3 * 360},
          {ateDias: 720, valorDias: 4 * 360},
        ],
        acimaDias: 8 * 360,
      },
    },
    {sentido: 'atributo', op: 'criar', def: {nome: 'Veredito', incidencia: 'aplicada', comparacao: 'ate', limiarDias: 1440, vedacoes: [], requisitos: []}},
  ];
  const q = escreverPacote(pacote, 0, porId);
  ok(q.includes('dev=f;fr=1/6'), `a fração vai como a lei a escreve: ${q}`);
  ok(q.includes('dev=x;fx=1a:3a.2a:4a;fxa=8a'), 'as faixas vão como degrau:valor');
  ok(!q.split('&')[2].includes('dev='), 'o veredito puro não grava nada a mais, e o link antigo abre como abria');
  const lido = lerPacote(q, porId).pacote;
  ok(JSON.stringify(lido) === JSON.stringify(pacote), 'os três voltam iguais');
  ok(lerFracao('7/24') === 7 / 24 && escreverFracao(7 / 24) === '7/24' && escreverFracao(0.3) === '3/10' && lerFracao('0.37') === 0.37, 'a fração aceita a/b e decimal');
}

console.log(falhas === 0 ? '\n✓ Simulação legislativa verificada.\n' : `\n✗ ${falhas} falha(s) na simulação.\n`);
process.exit(falhas === 0 ? 0 : 1);
