/**
 * A pena em dias inteiros, a moldura deslocada e o veredito da ficha.
 *
 * Casos conferíveis à mão: a unidade (mês de 30, ano de 360, art. 11 do CP), a
 * forma composta que a tela escreve, o deslocamento da moldura pelos elementos
 * marcados — com as travas de cada fase — e os vereditos que a ficha mostra.
 *
 * Uso: npm run verificar
 */

import * as fs from 'fs';
import * as path from 'path';
import type {Crime} from '../src/lib/types';
import {
  PENA_MAXIMA_ENTRADA,
  compor,
  decompor,
  diasDeMeses,
  escreverDuracao,
  formatDias,
  formatFaixa,
  lerDuracao,
  limitarPena,
} from '../src/lib/pena';
import {moverMoldura} from '../src/lib/dosimetria/moldura';
import {POR_ID} from '../src/lib/dosimetria';
import {CATALOGO, calcularAtributos} from '../src/lib/atributos';
import {ordenarPorVeredito, veredito} from '../src/lib/atributos/veredito';
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

console.log('\nA pena em dias inteiros');
ok(diasDeMeses(0.5) === 15, '0,5 mês do catálogo são 15 dias');
ok(diasDeMeses(72) === 2160 && diasDeMeses(240) === 7200, '6 a 20 anos são 2.160 a 7.200 dias');
const dezoito = decompor(compor({meses: 18}));
ok(
  dezoito.anos === 1 && dezoito.meses === 6 && dezoito.dias === 0,
  '18 meses digitados normalizam para 1 ano e 6 meses',
);
ok(formatDias(15) === '15 dias', '"15 dias"');
ok(formatDias(2892) === '8 anos e 12 dias', `"8 anos e 12 dias" (obtido "${formatDias(2892)}")`);
ok(formatDias(1692) === '4 anos, 8 meses e 12 dias', `forma composta com as três casas (obtido "${formatDias(1692)}")`);
ok(formatDias(0, 'sem mínimo cominado') === 'sem mínimo cominado', 'zero na mínima é "sem mínimo cominado", não "sem pena"');
ok(formatFaixa(2160, 7200) === '6 a 20 anos', `"6 a 20 anos" (obtido "${formatFaixa(2160, 7200)}")`);
ok(formatFaixa(1440, 9600) === '4 anos a 26 anos e 8 meses', `faixa composta (obtido "${formatFaixa(1440, 9600)}")`);
ok(formatFaixa(0, 90) === 'até 3 meses', 'tipo sem mínimo: "até 3 meses"');
ok(limitarPena(-5) === 0 && limitarPena(99999) === PENA_MAXIMA_ENTRADA, 'entrada presa entre zero e cinquenta anos');
ok(limitarPena(1440.7) === 1440, 'sem fração de dia na entrada');

console.log('\nA moldura deslocada — homicídio simples, 6 a 20 anos');
const hom = {min: 2160, max: 7200};
{
  const t = moverMoldura(hom, [{id: 'tentativa', fracao: 1 / 3}], POR_ID);
  ok(t.min === 1440 && t.max === 4800, `tentativa (−1/3): 4 anos a 13 anos e 4 meses (obtido ${formatFaixa(t.min, t.max)})`);

  const a = moverMoldura(hom, [{id: 'aumento-homicidio-doloso-vitima-121-p4'}], POR_ID);
  ok(a.min === 2880 && a.max === 9600, `aumento de 1/3 rompe o teto: 8 anos a 26 anos e 8 meses (obtido ${formatFaixa(a.min, a.max)})`);

  const ag = moverMoldura(hom, [{id: 'agravante-reincidencia'}], POR_ID);
  ok(ag.min === 2520 && ag.max === 7200, `agravante sobe o piso e para no teto: 7 a 20 anos (obtido ${formatFaixa(ag.min, ag.max)})`);

  const at = moverMoldura(hom, [{id: 'atenuante-confissao'}], POR_ID);
  ok(at.min === 2160 && at.max === 6000, `atenuante para no piso (Súmula 231) e baixa o teto: 6 anos a 16 anos e 8 meses (obtido ${formatFaixa(at.min, at.max)})`);

  const j = moverMoldura(hom, [{id: 'jud-culpabilidade'}], POR_ID);
  ok(j.min === hom.min && j.max === hom.max, 'circunstância judicial (art. 59) não desloca a moldura');

  const nada = moverMoldura(hom, [], POR_ID);
  ok(nada.min === hom.min && nada.max === hom.max, 'sem elemento marcado, a moldura é a legal');
}

console.log('\nO veredito da ficha');
{
  const crimes: Crime[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'static', 'data', 'crimes.json'), 'utf-8'),
  );
  const homicidio = crimes.find((c) => c.id === 1)!;
  ok(homicidio.crime === 'Homicídio simples', 'o registro 1 é o homicídio simples');
  const cen = cenarioFromCrime(homicidio);
  const r = calcularAtributos(cen);
  const prescricao = r.find((x) => x.id === 'prescricao')!;
  ok(
    veredito(prescricao).tipo === 'valor' && veredito(prescricao).rotulo === '20 anos',
    `prescrição da pretensão punitiva: valor "20 anos" (obtido "${veredito(prescricao).rotulo}")`,
  );
  const oito = calcularAtributos({...cen, penaConcreta: 96});
  const regime = oito.find((x) => x.id === 'regime')!;
  ok(veredito(regime).rotulo === 'semiaberto', `8 anos exatos não excedem 8: regime semiaberto (obtido "${veredito(regime).rotulo}")`);
  const transacao = r.find((x) => x.id === 'transacao')!;
  ok(veredito(transacao).tipo === 'nao-cabe', 'transação penal no homicídio: não cabe');

  const ordenados = ordenarPorVeredito(r);
  const pesos = ordenados.map((x) => ({cabe: 0, valor: 0, depende: 1, 'nao-cabe': 2})[veredito(x).tipo]);
  ok(pesos.every((p, i) => i === 0 || pesos[i - 1] <= p), 'ordem: cabíveis, condicionais, incabíveis');

  const naturezas = {abstrato: 0, concreto: 0, incondicionado: 0};
  for (const def of CATALOGO) naturezas[def.natureza] += 1;
  ok(
    naturezas.abstrato === 8 && naturezas.concreto === 12 && naturezas.incondicionado === 2,
    `repartição pela natureza: 8 / 12 / 2 (obtido ${naturezas.abstrato} / ${naturezas.concreto} / ${naturezas.incondicionado})`,
  );
}

console.log('\nDuração compacta da URL');
{
  ok(lerDuracao('1a') === 360, '1a = 360 dias');
  ok(lerDuracao('18m') === 540, '18m = 540 dias');
  ok(lerDuracao('2a6m15d') === 915, '2a6m15d = 915 dias');
  ok(lerDuracao('') === null, 'string vazia não é duração');
  ok(lerDuracao('xyz') === null, 'lixo não é duração');
  ok(escreverDuracao(360) === '1a', '360 dias escreve 1a');
  ok(escreverDuracao(915) === '2a6m15d', '915 dias escreve 2a6m15d');
  ok(escreverDuracao(0) === '0d', 'zero escreve 0d');
  ok(lerDuracao(escreverDuracao(2160)) === 2160, 'ida e volta preserva 2.160 dias');
}

console.log(falhas === 0 ? '\n✓ Pena, moldura e veredito verificados.\n' : `\n✗ ${falhas} verificação(ões) falharam.\n`);
process.exit(falhas === 0 ? 0 : 1);
