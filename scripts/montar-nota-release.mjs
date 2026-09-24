// Monta o corpo da Release do GitHub a partir das entradas do changelog daquela
// versão. Uso: node scripts/montar-nota-release.mjs v1.2.1  (imprime markdown).
//
// É o que substitui a antiga leitura de release-notes/*-vX.Y.Z.md: a nota grande
// deixa de ser escrita à mão e passa a ser o acúmulo das entradas da versão.

import {lerEntradas} from './_ler-changelog.mjs';

// O alcance da mudança: tipo penal, atributo penal, ou os dois. Espelha
// ROTULO_ALCANCE de src/data/changelog/types.ts.
const ALCANCE_ROTULO = {
  tipo: 'Tipos penais',
  atributo: 'Atributos penais',
};

const versao = process.argv[2];
if (!versao) {
  console.error('Uso: node scripts/montar-nota-release.mjs vX.Y.Z');
  process.exit(2);
}

const todas = await lerEntradas();
const daVersao = todas.filter((e) => e.version === versao);

if (daVersao.length === 0) {
  // Sem entradas: corpo mínimo, para não travar a publicação.
  process.stdout.write(`Release ${versao}.\n`);
  process.exit(0);
}

const partes = [];
for (const e of daVersao) {
  const tags = (e.alcance || []).map((a) => ALCANCE_ROTULO[a] || a).join(' · ');
  partes.push(`## ${e.title}`);
  partes.push(`*${tags}*`);
  partes.push(e.summary);
  for (const p of e.body || []) partes.push(p);
  for (const l of e.links || []) partes.push(`→ [${l.label}](${l.href})`);
  partes.push('');
}

process.stdout.write(partes.join('\n\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
