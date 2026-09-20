/**
 * Casos-padrão do motor de atributos: tipo real, premissa explícita, veredito
 * esperado e o dispositivo que o sustenta.
 *
 * Por que uma bateria à parte da `verificar_atributos.ts`: lá os invariantes são
 * estruturais ("nenhum hediondo tem graça") e os casos-âncora **pulam em
 * silêncio** quando o tipo não é encontrado — uma renumeração do catálogo
 * desligaria a verificação sem falhar nada. Aqui, tipo não encontrado é FALHA, e
 * cada caso é uma afirmação jurídica datada: se o motor mudar de resposta, alguém
 * teve de mexer nesta tabela e escrever por quê.
 *
 * O que um caso NÃO é: prova de que a resposta está certa. É prova de que a
 * resposta continua sendo a que foi conferida contra a lei em 19/09/2026.
 *
 * Uso: npm run verificar
 */

import * as fs from 'fs';
import * as path from 'path';
import type {Cenario, Crime} from '../src/lib/types';
import {CATALOGO, avaliarAtributo, valoresPadrao} from '../src/lib/atributos';
import {cenarioFromCrime} from '../src/lib/cenario';

const todos: Crime[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'static', 'data', 'crimes.json'), 'utf-8'),
);

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    falhas += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
};

type Status = 'cabivel' | 'condicional' | 'incabivel';

interface Caso {
  /** O dispositivo que decide o caso. Vai na mensagem do teste. */
  fundamento: string;
  tipo: {lei: RegExp; artigo: RegExp; nome?: RegExp};
  /** O que se afirma do caso concreto, além do que o tipo já diz. */
  premissa?: Partial<Cenario>;
  atributo: string;
  status: Status;
  /** Trecho que tem de aparecer no valor ou no resumo (a fração, o regime, o prazo). */
  valor?: RegExp;
}

// ── Os tipos usados, uma vez cada ───────────────────────────────────────────
const LESAO_LEVE = {lei: /^CP$/, artigo: /^Art\. 129, caput$/};
const FURTO = {lei: /^CP$/, artigo: /^Art\. 155, caput$/};
const HOMICIDIO = {lei: /^CP$/, artigo: /^Art\. 121, caput$/};
const HOMICIDIO_QUALIFICADO = {lei: /^CP$/, artigo: /^Art\. 121, §2º, I$/};
const HOMICIDIO_CULPOSO = {lei: /^CP$/, artigo: /^Art\. 121, §3º/};
const ROUBO = {lei: /^CP$/, artigo: /^Art\. 157, caput$/};
const BULLYING = {lei: /^Lei 14\.811/, artigo: /^Art\. 146-A, caput/};
const ESTUPRO = {lei: /^CP$/, artigo: /^Art\. 213, caput$/};
const DESACATO_MILITAR = {lei: /^CPM/, artigo: /^Art\. 299, caput$/};

const CASOS: Caso[] = [
  // ── Lei 9.099/95: os dois institutos do juizado ──────────────────────────
  {
    fundamento: 'Lei 9.099/95, art. 61 e art. 76: menor potencial ofensivo é a pena máxima de até 2 anos',
    tipo: LESAO_LEVE, atributo: 'transacao', status: 'condicional',
  },
  {
    fundamento: 'Lei 9.099/95, art. 61: a pena máxima do furto simples passa de 2 anos',
    tipo: FURTO, atributo: 'transacao', status: 'incabivel',
  },
  {
    fundamento: 'Lei 9.099/95, art. 89: a suspensão do processo olha a pena MÍNIMA, de até 1 ano',
    tipo: FURTO, atributo: 'sursis-processual', status: 'cabivel',
  },
  {
    fundamento: 'Lei 9.099/95, art. 89: a mínima do roubo é de 6 anos',
    tipo: ROUBO, atributo: 'sursis-processual', status: 'incabivel',
  },
  {
    fundamento: 'Lei 9.099/95, art. 90-A: a lei dos juizados não se aplica na Justiça Militar',
    tipo: DESACATO_MILITAR, atributo: 'transacao', status: 'incabivel',
  },

  // ── ANPP: CPP, art. 28-A ─────────────────────────────────────────────────
  {
    fundamento: 'CPP, art. 28-A: pena mínima inferior a 4 anos, sem violência, mediante confissão',
    tipo: FURTO, atributo: 'anpp', status: 'condicional',
  },
  {
    fundamento: 'CPP, art. 28-A, §2º, II: vedado ao reincidente, e o inciso não exige dolo',
    tipo: FURTO, premissa: {reincidencia: 'culposo'}, atributo: 'anpp', status: 'incabivel',
  },
  {
    fundamento: 'CPP, art. 28-A, caput: o crime cometido com violência está fora',
    tipo: HOMICIDIO, atributo: 'anpp', status: 'incabivel',
  },
  {
    fundamento: 'CPP, art. 28-A, §2º, I: vedado quando cabe transação penal',
    tipo: LESAO_LEVE, atributo: 'anpp', status: 'incabivel',
  },

  // ── Sursis da pena: CP, art. 77 ──────────────────────────────────────────
  {
    fundamento: 'CP, art. 77: pena concreta não superior a 2 anos',
    tipo: FURTO, premissa: {penaConcreta: 12}, atributo: 'sursis-pena', status: 'cabivel',
  },
  {
    fundamento: 'CP, art. 77, I: veda o reincidente em crime DOLOSO',
    tipo: FURTO, premissa: {penaConcreta: 12, reincidencia: 'doloso'}, atributo: 'sursis-pena', status: 'incabivel',
  },
  {
    fundamento: 'CP, art. 77, I: a reincidência em crime CULPOSO não veda o sursis',
    tipo: FURTO, premissa: {penaConcreta: 12, reincidencia: 'culposo'}, atributo: 'sursis-pena', status: 'cabivel',
  },
  {
    fundamento: 'CP, art. 77, §2º: o sursis etário alcança a pena de até 4 anos do maior de 70 anos',
    tipo: FURTO, premissa: {penaConcreta: 40}, atributo: 'sursis-pena', status: 'condicional',
  },

  // ── Substituição: CP, art. 44 ────────────────────────────────────────────
  {
    fundamento: 'CP, art. 44, I: até 4 anos e sem violência ou grave ameaça',
    tipo: FURTO, premissa: {penaConcreta: 12}, atributo: 'substituicao', status: 'cabivel',
  },
  {
    fundamento: 'CP, art. 44, I: o roubo é cometido com violência ou grave ameaça',
    tipo: ROUBO, premissa: {penaConcreta: 72}, atributo: 'substituicao', status: 'incabivel',
  },
  {
    fundamento: 'CP, art. 44, §3º: ao reincidente em crime doloso, se socialmente recomendável',
    tipo: FURTO, premissa: {penaConcreta: 12, reincidencia: 'doloso'}, atributo: 'substituicao', status: 'condicional',
  },
  {
    fundamento: 'CP, art. 44, §3º, parte final: vedada ao reincidente ESPECÍFICO',
    tipo: FURTO, premissa: {penaConcreta: 12, reincidencia: 'especifico'}, atributo: 'substituicao', status: 'incabivel',
  },

  // ── Regime inicial: CP, art. 33, §2º ─────────────────────────────────────
  {
    fundamento: 'CP, art. 33, §2º, a: pena superior a 8 anos, regime fechado',
    tipo: ROUBO, premissa: {penaConcreta: 108}, atributo: 'regime', status: 'cabivel', valor: /Fechado/,
  },
  {
    fundamento: 'CP, art. 33, §2º, b: mais de 4 e até 8 anos, semiaberto ao não reincidente',
    tipo: ROUBO, premissa: {penaConcreta: 72}, atributo: 'regime', status: 'cabivel', valor: /Semiaberto/,
  },
  {
    fundamento: 'CP, art. 33, §2º, b: o mesmo quantum, ao reincidente, fecha o regime',
    tipo: ROUBO, premissa: {penaConcreta: 72, reincidencia: 'culposo'}, atributo: 'regime', status: 'cabivel', valor: /Fechado/,
  },

  // ── Progressão: LEP, art. 112, nas redações das Leis 15.402 e 15.358/2026 ─
  {
    fundamento: 'LEP, art. 112, caput (Lei 15.402/2026): primário, crime sem violência, 1/6 da pena',
    tipo: FURTO, premissa: {penaConcreta: 24}, atributo: 'progressao', status: 'cabivel', valor: /16[.,]67%/,
  },
  {
    fundamento: 'LEP, art. 112, III (Lei 15.402/2026): reincidente em crime diverso dos dos incisos I e II, '
      + '20%. O texto diz "reincidente" e não o qualifica: a reincidência genérica basta',
    tipo: FURTO, premissa: {penaConcreta: 24, reincidencia: 'doloso'}, atributo: 'progressao', status: 'cabivel', valor: /20%/,
  },
  {
    fundamento: 'LEP, art. 112, I (Lei 15.402/2026): primário, crime com violência ou grave ameaça, 25%',
    tipo: ROUBO, premissa: {penaConcreta: 72}, atributo: 'progressao', status: 'cabivel', valor: /25%/,
  },
  {
    fundamento: 'LEP, art. 112, II (Lei 15.402/2026): reincidente, crime com violência ou grave ameaça, 30%',
    tipo: ROUBO, premissa: {penaConcreta: 72, reincidencia: 'doloso'}, atributo: 'progressao', status: 'cabivel', valor: /30%/,
  },
  {
    fundamento: 'LEP, art. 112, V (Lei 15.358/2026): hediondo sem resultado morte, primário, 70%',
    tipo: ESTUPRO, premissa: {penaConcreta: 96}, atributo: 'progressao', status: 'cabivel', valor: /70%/,
  },
  {
    fundamento: 'STJ, Tema 1084 (REsp 1.910.240): o reincidente GENÉRICO em hediondo fica com o percentual do '
      + 'primário, porque os incisos V a VIII exigem reincidência no próprio crime hediondo',
    tipo: ESTUPRO, premissa: {penaConcreta: 96, reincidencia: 'doloso'}, atributo: 'progressao', status: 'cabivel', valor: /70%/,
  },
  {
    fundamento: 'LEP, art. 112, VII (Lei 15.358/2026): reincidente em crime hediondo, 80%',
    tipo: ESTUPRO, premissa: {penaConcreta: 96, reincidencia: 'especifico'}, atributo: 'progressao', status: 'cabivel', valor: /80%/,
  },
  {
    fundamento: 'LEP, art. 112, VI, "a" (Lei 15.358/2026): hediondo com resultado morte, primário, 75%',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'progressao', status: 'cabivel', valor: /75%/,
  },

  // ── Livramento: CP, art. 83 ──────────────────────────────────────────────
  {
    fundamento: 'CP, art. 83, caput: exige pena privativa igual ou superior a 2 anos',
    tipo: FURTO, premissa: {penaConcreta: 12}, atributo: 'livramento', status: 'incabivel',
  },
  {
    fundamento: 'CP, art. 83, I: primário e de bons antecedentes, mais de um terço',
    tipo: FURTO, premissa: {penaConcreta: 48}, atributo: 'livramento', status: 'cabivel', valor: /1\/3/,
  },
  {
    fundamento: 'CP, art. 83, II: reincidente em crime DOLOSO, mais da metade',
    tipo: FURTO, premissa: {penaConcreta: 48, reincidencia: 'doloso'}, atributo: 'livramento', status: 'cabivel', valor: /1\/2/,
  },
  {
    fundamento: 'CP, art. 83, I e II: a reincidência em crime CULPOSO não agrava a fração',
    tipo: FURTO, premissa: {penaConcreta: 48, reincidencia: 'culposo'}, atributo: 'livramento', status: 'cabivel', valor: /1\/3/,
  },
  {
    fundamento: 'CP, art. 83, V: hediondo sem resultado morte, dois terços',
    tipo: ESTUPRO, premissa: {penaConcreta: 96}, atributo: 'livramento', status: 'cabivel', valor: /2\/3/,
  },
  {
    fundamento: 'LEP, art. 112, VI, "a" (Lei 15.358/2026): no hediondo com resultado morte o livramento é VEDADO',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'livramento', status: 'incabivel',
  },

  // ── Prescrição: CP, arts. 109 e 114 ──────────────────────────────────────
  {
    fundamento: 'CP, art. 109, III: pena máxima superior a 4 e não superior a 8 anos, 12 anos',
    tipo: FURTO, atributo: 'prescricao', status: 'cabivel', valor: /12 anos/,
  },
  {
    fundamento: 'CP, art. 114, I: multa isolada prescreve em 2 anos',
    tipo: BULLYING, atributo: 'prescricao', status: 'cabivel', valor: /2 anos/,
  },

  // ── Clemência: CF, art. 5º, XLIII ────────────────────────────────────────
  {
    fundamento: 'CF, art. 5º, XLIII: graça vedada ao hediondo',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'graca', status: 'incabivel',
  },
  {
    fundamento: 'CF, art. 5º, XLIII: indulto vedado ao hediondo',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'indulto', status: 'incabivel',
  },
  {
    fundamento: 'Lei 8.072/90, art. 2º, I, a contrario: a clemência do crime comum depende do decreto',
    tipo: FURTO, premissa: {penaConcreta: 24}, atributo: 'comutacao', status: 'condicional',
  },

  // ── Execução ─────────────────────────────────────────────────────────────
  {
    fundamento: 'CP, art. 75: o cumprimento não passa de 40 anos',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 600}, atributo: 'unificacao', status: 'cabivel', valor: /40 anos/,
  },
  {
    fundamento: 'CP, art. 42: a detração não depende do crime',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'detracao', status: 'cabivel',
  },
  {
    fundamento: 'LEP, art. 126: a remição não depende do crime',
    tipo: HOMICIDIO_QUALIFICADO, premissa: {penaConcreta: 144}, atributo: 'remicao', status: 'cabivel',
  },
  {
    fundamento: 'LEP, art. 123, II: saída temporária ao primário, um sexto da pena',
    tipo: FURTO, premissa: {penaConcreta: 48}, atributo: 'saida-temporaria', status: 'condicional', valor: /1\/6/,
  },
  {
    fundamento: 'LEP, art. 123, II: ao reincidente, um quarto',
    tipo: FURTO, premissa: {penaConcreta: 48, reincidencia: 'culposo'}, atributo: 'saida-temporaria', status: 'condicional', valor: /1\/4/,
  },

  // ── Causas de extinção e de redução ──────────────────────────────────────
  {
    fundamento: 'CP, art. 107, IX: o perdão judicial só existe onde a lei o prevê',
    tipo: HOMICIDIO_CULPOSO, atributo: 'perdao-judicial', status: 'condicional',
  },
  {
    fundamento: 'CP, art. 107, IX: não se estende por analogia ao furto',
    tipo: FURTO, atributo: 'perdao-judicial', status: 'incabivel',
  },
  {
    fundamento: 'CP, art. 16: o arrependimento posterior exige crime sem violência ou grave ameaça',
    tipo: ROUBO, atributo: 'arrependimento-posterior', status: 'incabivel',
  },
  {
    fundamento: 'CP, art. 16: no furto, depende da reparação até o recebimento da denúncia',
    tipo: FURTO, atributo: 'arrependimento-posterior', status: 'condicional',
  },
];

console.log(`\nCasos-padrão do motor: ${CASOS.length} afirmações conferidas contra a lei.\n`);

for (const caso of CASOS) {
  const tipo = todos.find(
    (c) => caso.tipo.lei.test(c.lei) && caso.tipo.artigo.test(c.artigo)
      && (!caso.tipo.nome || caso.tipo.nome.test(c.crime)),
  );
  const onde = `${caso.atributo} — ${caso.fundamento}`;
  if (!tipo) {
    // Falha, e não "pulado": o caso deixaria de verificar o que promete.
    ok(false, `${onde} — TIPO NÃO ENCONTRADO no catálogo (${caso.tipo.lei}, ${caso.tipo.artigo})`);
    continue;
  }
  const def = CATALOGO.find((d) => d.id === caso.atributo);
  if (!def) {
    ok(false, `${onde} — ATRIBUTO NÃO ENCONTRADO`);
    continue;
  }
  const cenario: Cenario = {...cenarioFromCrime(tipo), ...caso.premissa};
  const r = avaliarAtributo(def, cenario, valoresPadrao(def));
  ok(r.status === caso.status, `${onde} → ${caso.status}${r.status !== caso.status ? ` (veio "${r.status}")` : ''}`);
  if (caso.valor) {
    const texto = `${r.valor ?? ''} ${r.resumo} ${r.detalhes.join(' ')}`;
    ok(caso.valor.test(texto), `${onde} → valor casa ${caso.valor}${caso.valor.test(texto) ? '' : ` (veio "${r.valor ?? ''} ${r.resumo}")`}`);
  }
}

console.log(falhas === 0 ? '\n✓ Casos-padrão verificados.\n' : `\n✗ ${falhas} falha(s) nos casos-padrão.\n`);
process.exit(falhas === 0 ? 0 : 1);
