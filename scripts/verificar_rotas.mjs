// Teste de fumaça das rotas, sobre o build (dist/). Roda na CI depois do build.
//
// Duas garantias:
//
//   1. Toda rota pública ANTIGA responde e leva ao destino certo, preservando a
//      query. O script de cada stub é tirado do HTML publicado e EXECUTADO numa
//      sandbox, com a query de teste; o endereço que ele produz tem de ser o que
//      a tabela (src/site/redirecionamentos.ts) manda. Uma URL citada que vira
//      404 em silêncio é o pior defeito possível neste projeto.
//   2. Toda rota NOVA existe: uma ficha por tipo penal do catálogo, com o nome
//      do crime no HTML (e não um shell vazio); uma por atributo; as seções.
//
// Uso, a partir da raiz, depois de `npm run build`:  node scripts/verificar_rotas.mjs

import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {RAIZ_LEGADA, REDIRECIONAMENTOS, destinoDe} from '../src/site/redirecionamentos.ts';

const RAIZ = process.cwd();
const DIST = join(RAIZ, 'dist');
const BASE = '/sispenas/';

let falhas = 0;
let conferidas = 0;
const falha = (msg) => {
  falhas += 1;
  if (falhas <= 40) console.error(`  ✗ ${msg}`);
};

if (!existsSync(DIST)) {
  console.error('✗ dist/ não existe: rode `npm run build` antes.');
  process.exit(2);
}

const pagina = (rota) => join(DIST, ...rota.split('/').filter(Boolean), 'index.html');

const escapar = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// O script de redirecionamento publicado numa página (o stub, ou a raiz).
const scriptRedirecionador = (html) => /<script data-redirecionador>([\s\S]*?)<\/script>/.exec(html)?.[1];

/**
 * Executa o script numa sandbox, para a query e a âncora dadas, e confere o
 * endereço que ele produz com o que a tabela manda. Na raiz, sem o parâmetro,
 * o script não redireciona (a página inicial é a própria página).
 */
function conferirScript(rotulo, script, regra, query, ancora, redirecionaSemParametro) {
  let obtido = null;
  const location = {search: query, hash: ancora, replace: (u) => (obtido = u)};
  try {
    vm.runInNewContext(script, {location, URLSearchParams, encodeURIComponent});
  } catch (e) {
    falha(`${rotulo}${query}: o script falhou (${e.message})`);
    return;
  }
  conferidas += 1;
  const temParametro = regra.parametro && new URLSearchParams(query).has(regra.parametro.nome);
  if (!redirecionaSemParametro && !temParametro) {
    if (obtido !== null) falha(`${rotulo}${query}${ancora}: redirecionou para ${obtido} sem motivo`);
    return;
  }
  const d = destinoDe(regra, query);
  const esperado = BASE + d.rota.replace(/^\//, '') + d.query + ancora;
  if (obtido !== esperado) falha(`${rotulo}${query}${ancora}: foi a ${obtido}, esperado ${esperado}`);
}

function consultasDe(regra) {
  const consultas = ['', '?filtro=x'];
  if (regra.parametro) consultas.push(`?${regra.parametro.nome}=1`, `?${regra.parametro.nome}=12&filtro=x`);
  return consultas;
}

// ── 1. As rotas antigas ────────────────────────────────────────────────────
console.log(`\n1. ${REDIRECIONAMENTOS.length} rotas antigas, e a raiz com ?tipo=N`);
for (const regra of REDIRECIONAMENTOS) {
  const arquivo = pagina(regra.de);
  if (!existsSync(arquivo)) {
    falha(`${regra.de}: sem página publicada`);
    continue;
  }
  const html = readFileSync(arquivo, 'utf-8');
  const script = scriptRedirecionador(html);
  if (!script) {
    falha(`${regra.de}: sem o script de redirecionamento`);
    continue;
  }
  if (!html.includes(`url=${BASE}${regra.para.replace(/^\//, '')}`)) {
    falha(`${regra.de}: o <meta refresh> não aponta para ${regra.para}`);
  }
  for (const query of consultasDe(regra)) {
    for (const ancora of ['', '#secao']) conferirScript(regra.de, script, regra, query, ancora, true);
  }
}
{
  const script = scriptRedirecionador(readFileSync(join(DIST, 'index.html'), 'utf-8'));
  if (!script) falha('/: a página inicial não trata o /?tipo=N antigo');
  else {
    for (const query of consultasDe(RAIZ_LEGADA)) {
      for (const ancora of ['', '#origem']) conferirScript('/', script, RAIZ_LEGADA, query, ancora, false);
    }
  }
}
console.log(`  ${conferidas} redirecionamentos executados`);

// ── 2. As rotas novas ──────────────────────────────────────────────────────
console.log('\n2. Rotas novas');
const crimes = JSON.parse(readFileSync(join(RAIZ, 'static', 'data', 'crimes.json'), 'utf-8'));
let fichas = 0;
for (const c of crimes) {
  const arquivo = pagina(`/tipos/${c.id}`);
  if (!existsSync(arquivo)) {
    falha(`/tipos/${c.id}: ficha ausente`);
    continue;
  }
  const html = readFileSync(arquivo, 'utf-8');
  if (!html.includes(escapar(c.crime))) falha(`/tipos/${c.id}: o nome do crime não está no HTML`);
  else fichas += 1;
}
console.log(`  ${fichas} de ${crimes.length} fichas de tipo penal com o nome do crime no HTML`);

const atributos = JSON.parse(readFileSync(join(RAIZ, 'data', 'atributos.json'), 'utf-8')).atributos;
for (const a of atributos) {
  if (!existsSync(pagina(`/atributos/${a.slug}`))) falha(`/atributos/${a.slug}: ficha ausente`);
}
console.log(`  ${atributos.length} fichas de atributo`);

// O acervo: os dispositivos de data/acervo.json e os diplomas não vigentes.
const acervo = JSON.parse(readFileSync(join(RAIZ, 'data', 'acervo.json'), 'utf-8')).registros;
const diplomasHistoricos = JSON.parse(readFileSync(join(RAIZ, 'data', 'diplomas.json'), 'utf-8')).diplomas.filter(
  (d) => d.situacao !== 'vigente',
);
let fichasAcervo = 0;
for (const r of [...acervo, ...diplomasHistoricos]) {
  const arquivo = pagina(`/acervo/${r.id}`);
  if (!existsSync(arquivo)) {
    falha(`/acervo/${r.id}: ficha do acervo ausente`);
    continue;
  }
  if (!readFileSync(arquivo, 'utf-8').includes(escapar(r.nome))) falha(`/acervo/${r.id}: o nome não está no HTML`);
  else fichasAcervo += 1;
}
console.log(`  ${fichasAcervo} de ${acervo.length + diplomasHistoricos.length} fichas do acervo com o nome no HTML`);

const SECOES = [
  '/', '/tipos', '/atributos', '/acervo', '/acervo/linha-do-tempo', '/notas', '/projeto', '/simulacao',
  ...['metodologia', 'completude', 'catalogo-tipos-penais', 'atributos-penais', 'os-robos', 'dados-abertos']
    .map((d) => `/projeto/${d}`),
];
for (const rota of SECOES) if (!existsSync(pagina(rota))) falha(`${rota}: página ausente`);
if (!existsSync(join(DIST, '404.html'))) falha('404.html ausente');
console.log(`  ${SECOES.length} seções e a página 404`);

if (falhas > 40) console.error(`  … e mais ${falhas - 40}`);
console.log(falhas === 0 ? '\n✓ Rotas verificadas.\n' : `\n✗ ${falhas} falha(s) nas rotas.\n`);
process.exit(falhas === 0 ? 0 : 1);
