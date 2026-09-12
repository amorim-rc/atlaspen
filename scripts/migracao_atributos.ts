/**
 * Serializa a parte declarativa do catálogo de atributos penais (frente 5 do
 * backlog, commit 3 da migração).
 *
 * Nome, fundamento, descrição, requisitos, vedações e parâmetros saem daqui como
 * estão no código; as funções de avaliação ficam de fora (o JSON as descarta).
 * Quem lê é `scripts/migracao_atributos.py`, que acrescenta ids, dispositivos e
 * redações e grava `data/atributos.json`. Some com o catálogo, no commit 6.
 *
 * Uso, a partir da raiz:
 *   npx tsc -p scripts/tsconfig.verificar.json
 *   node .verificar-build/scripts/migracao_atributos.js
 */

import * as fs from 'fs';
import * as path from 'path';
import {CATALOGO} from '../src/lib/atributos';

const SAIDA = path.join(process.cwd(), '.verificar-build', 'catalogo-atributos.json');

fs.mkdirSync(path.dirname(SAIDA), {recursive: true});
fs.writeFileSync(SAIDA, JSON.stringify(CATALOGO, null, 2) + '\n', 'utf-8');
console.log(`${CATALOGO.length} atributos -> ${path.relative(process.cwd(), SAIDA)}`);
