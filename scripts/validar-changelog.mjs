// Impede que o feed anuncie versão que ainda não existe, ou publique fora do
// contrato.
//
// Aconteceu: três entradas foram escritas com v1.2.16, v1.2.17 e v1.2.18
// enquanto o `package.json` seguia em 1.2.15, porque o bump era feito por
// substituição de texto e falhava em silêncio quando a versão de origem não
// batia. O feed prometia releases que nunca saíram.
//
// Três regras, verificáveis sem rede e sem depender de tags — o checkout da CI
// nem sempre as traz, e a primeira versão desta checagem quebrou por isso:
//
//   1. nenhuma entrada pode citar versão MAIOR que a do `package.json` — é o
//      sintoma exato do bump que não aconteceu;
//   2. havendo entradas, a versão atual precisa ter ao menos uma, senão o bump
//      subiu sem nota;
//   3. a natureza (`tipo`) e as áreas são as do contrato, em
//      src/data/changelog/types.ts.
//
// Desde 14/09/2026 as regras valem também em 0.0.x: o feed já registra as
// alterações de lei antes do lançamento. O que segue suspenso até a v1.0.0 é a
// Release no GitHub, e isso o release.yml garante sozinho.
import {readFileSync} from 'node:fs';

import {lerEntradas} from './_ler-changelog.mjs';
import {AREAS_CHANGELOG, TIPOS_CHANGELOG} from '../src/data/changelog/types.ts';

/** Compara "v1.2.10" com "v1.3.0" por número, não por texto. */
function comparar(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) < (pb[i] ?? 0) ? -1 : 1;
  }
  return 0;
}

const atual = `v${JSON.parse(readFileSync('package.json', 'utf8')).version}`;
const entradas = await lerEntradas();

const fora = entradas.flatMap((e) => [
  ...(TIPOS_CHANGELOG.includes(e.tipo) ? [] : [`${e.id}: natureza "${e.tipo}" fora do contrato`]),
  ...(e.areas ?? []).filter((a) => !AREAS_CHANGELOG.includes(a)).map((a) => `${e.id}: área "${a}" fora do contrato`),
]);
if (fora.length) {
  console.error(`✗ ${fora.length} problema(s) de contrato no changelog:`);
  for (const f of fora) console.error(`  ${f}`);
  console.error(`\nNaturezas válidas: ${TIPOS_CHANGELOG.join(', ')}.`);
  process.exit(1);
}

if (!entradas.length) {
  console.log(`✓ ${atual}: nenhuma entrada`);
  process.exit(0);
}

const futuras = entradas
  .filter((e) => e.version && comparar(e.version, atual) > 0)
  .map((e) => `${e.id} -> ${e.version}`);

if (futuras.length) {
  console.error(
    `✗ ${futuras.length} entrada(s) anunciam versão posterior à do projeto (${atual}):`);
  for (const f of futuras) console.error(`  ${f}`);
  console.error('\nProvável causa: o bump de versão não foi aplicado.');
  process.exit(1);
}

if (!entradas.some((e) => e.version === atual)) {
  console.error(`✗ nenhuma entrada carrega a versão atual (${atual}) — a versão ` +
    'subiu sem nota.');
  process.exit(1);
}

console.log(`✓ changelog coerente com ${atual} (${entradas.length} entradas)`);
