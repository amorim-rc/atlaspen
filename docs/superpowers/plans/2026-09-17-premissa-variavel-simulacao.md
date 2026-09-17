# Premissa variável na simulação legislativa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A tela `/simulacao` passa a oferecer os controles de premissa da varredura — base da pena concreta e circunstâncias do réu — que hoje só existem na ficha do atributo, e os grava na URL.

**Architecture:** Nada de motor novo. `src/lib/atributos/reverso.ts` já define `CenarioReverso` e `avaliarEstado(e, rev)` já o recebe por parâmetro; `src/components/simulacao/Simulador.tsx:69` é que o congela em `const REV = cenarioReversoPadrao()`. O trabalho é extrair, da ficha do atributo, o codec de URL da premissa e os controles, e ligá-los no simulador. Três extrações e uma fiação.

**Tech Stack:** TypeScript, Astro 7, React (ilhas), CSS Modules. Testes são scripts TS com `ok(cond, msg)`, rodados por `npm run verificar`.

## Global Constraints

- **Acuidade jurídica é o valor central.** Nenhum dado do catálogo é tocado neste plano.
- **Mês de 30 dias, ano de 360** (art. 11 do CP). A pena trafega em **dias inteiros** até a URL.
- **O padrão nunca é gravado na URL.** É a regra escrita em `src/components/atributo/estado.ts:1-10`.
- **`npm run verificar` não pode regredir.** Ele roda `verificar_atributos`, `verificar_injecao`, `verificar_pena` e `verificar_simulacao`.
- **Não faça push nem abra PR** (`AGENTS.md`, última linha). Commits locais, na branch `revamp/atlaspen`.
- **Editar `.md` no Windows introduz CRLF.** Confira o EOL ao mexer em documentação.
- Comentários e identificadores em **português**, como o resto do código.

---

### Task 1: `lerDuracao` e `escreverDuracao` vão para `src/lib/pena.ts`

São funções puras de pena (`1a`, `18m`, `2a6m15d` ↔ dias) que hoje moram em `src/components/atributo/estado.ts` e já são importadas de fora (`src/components/simulacao/estado.ts:26`). Movê-las para `lib/pena.ts` tira o import cruzado entre componentes e dá ao codec da premissa (Task 2) um lugar de onde importar sem depender de componente.

**Files:**
- Modify: `src/lib/pena.ts` (acrescentar ao fim)
- Modify: `src/components/atributo/estado.ts:27-38` (remover as duas funções, importar de `lib/pena`)
- Modify: `src/components/simulacao/estado.ts:26` (importar de `lib/pena`)
- Test: `scripts/verificar_pena.ts`

**Interfaces:**
- Consumes: `compor`, `decompor` de `src/lib/pena.ts` (já existem).
- Produces: `lerDuracao(t: string): number | null` e `escreverDuracao(dias: number): string`, exportadas de `src/lib/pena.ts`.

- [ ] **Step 1: Escrever o teste que falha**

No fim de `scripts/verificar_pena.ts`, antes do bloco que soma as falhas, acrescente o import e o bloco:

```ts
// no bloco de import de '../src/lib/pena', acrescente:
//   escreverDuracao,
//   lerDuracao,

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
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm run verificar`
Expected: FAIL na compilação — `tsc` acusa que `lerDuracao` e `escreverDuracao` não são exportadas de `../src/lib/pena`.

- [ ] **Step 3: Mover as duas funções**

Acrescente ao fim de `src/lib/pena.ts`:

```ts
// ── Duração compacta: 1a, 18m, 2a6m15d ────────────────────────────────────
//
// A forma que a URL usa para uma duração. Mora aqui, e não no estado de um
// componente, porque é conversão de pena e porque a ficha do atributo, a
// simulação e o codec da premissa dependem dela.

export function lerDuracao(t: string): number | null {
  const m = /^(?:(\d+)a)?(?:(\d+)m)?(?:(\d+)d)?$/.exec(t.trim());
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return compor({anos: Number(m[1] ?? 0), meses: Number(m[2] ?? 0), dias: Number(m[3] ?? 0)});
}

export function escreverDuracao(dias: number): string {
  const p = decompor(dias);
  const s = `${p.anos ? `${p.anos}a` : ''}${p.meses ? `${p.meses}m` : ''}${p.dias ? `${p.dias}d` : ''}`;
  return s || '0d';
}
```

Em `src/components/atributo/estado.ts`, **apague** o bloco `// ── duração compacta ...` com as duas funções (linhas 27-38) e troque a linha de import:

```ts
import {compor, decompor, diasDeMeses} from '../../lib/pena';
```

por:

```ts
import {diasDeMeses, escreverDuracao, lerDuracao} from '../../lib/pena';
```

`compor` e `decompor` deixam de ser usados neste arquivo — se o `tsc` acusar import não usado, remova-os.

Em `src/components/simulacao/estado.ts:26`, separe os imports:

```ts
import {escreverValor, lerValor, limitar} from '../atributo/estado';
import {escreverDuracao, lerDuracao} from '../../lib/pena';
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm run verificar`
Expected: PASS. As nove asserções novas aparecem com `✓`, e nenhuma asserção antiga regride.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pena.ts src/components/atributo/estado.ts src/components/simulacao/estado.ts scripts/verificar_pena.ts
git commit -m "refactor: a duracao compacta da URL mora em lib/pena"
```

---

### Task 2: O codec de URL da premissa, compartilhado

A leitura e a escrita de `CenarioReverso` na query string estão hoje dentro de `lerEstado`/`escreverEstado` (`src/components/atributo/estado.ts:132-200`), misturadas com os parâmetros do atributo e com a paginação. Extrair para um módulo próprio é o que permite o simulador usar as **mesmas chaves** — `base`, `fixa`, `reincidente`, `comando`, `confessou`, `reparou`, `antecedentes` — sem duplicar a regra.

**Files:**
- Create: `src/lib/atributos/premissa-url.ts`
- Test: `scripts/verificar_atributos.ts` (acrescentar bloco ao fim)

**Interfaces:**
- Consumes: `CenarioReverso`, `BasePenaConcreta`, `cenarioReversoPadrao` de `src/lib/atributos/reverso.ts`; `diasDeMeses`, `escreverDuracao`, `lerDuracao` de `src/lib/pena.ts` (Task 1).
- Produces:
  - `lerPremissa(q: URLSearchParams): CenarioReverso`
  - `escreverPremissa(q: URLSearchParams, rev: CenarioReverso): void` — grava **só o que difere do padrão**.
  - `premissaIgualAoPadrao(rev: CenarioReverso): boolean`

- [ ] **Step 1: Escrever o teste que falha**

No fim de `scripts/verificar_atributos.ts`, acrescente:

```ts
import {escreverPremissa, lerPremissa, premissaIgualAoPadrao} from '../src/lib/atributos/premissa-url';

console.log('\nPremissa da varredura na URL');
{
  const padrao = cenarioReversoPadrao();
  ok(premissaIgualAoPadrao(padrao), 'o padrão é igual ao padrão');

  const vazio = new URLSearchParams();
  escreverPremissa(vazio, padrao);
  ok(vazio.toString() === '', 'o padrão não grava nada na URL');

  const mexido = {...padrao, base: 'maxima' as const, reincidenteEspecifico: true, bonsAntecedentes: false};
  ok(!premissaIgualAoPadrao(mexido), 'premissa mexida difere do padrão');

  const q = new URLSearchParams();
  escreverPremissa(q, mexido);
  ok(q.get('base') === 'maxima', 'grava base=maxima');
  ok(q.get('reincidente') === 'sim', 'grava reincidente=sim');
  ok(q.get('antecedentes') === 'nao', 'grava antecedentes=nao');
  ok(q.get('confessou') === null, 'não grava o que está no padrão');

  const volta = lerPremissa(new URLSearchParams(q.toString()));
  ok(volta.base === 'maxima', 'lê base=maxima de volta');
  ok(volta.reincidenteEspecifico === true, 'lê reincidente de volta');
  ok(volta.bonsAntecedentes === false, 'lê antecedentes de volta');
  ok(volta.confessou === false, 'o ausente volta como padrão');

  const fixa = {...padrao, base: 'fixa' as const, penaFixaMeses: 36};
  const qf = new URLSearchParams();
  escreverPremissa(qf, fixa);
  ok(qf.get('fixa') === '3a', 'a pena fixa vai em duração compacta');
  ok(lerPremissa(new URLSearchParams(qf.toString())).penaFixaMeses === 36, 'a pena fixa volta em meses');

  const ruim = lerPremissa(new URLSearchParams('base=inventada'));
  ok(ruim.base === 'minima', 'base fora do vocabulário cai no padrão');
}
```

O `ok` e `cenarioReversoPadrao` já existem no arquivo (`scripts/verificar_atributos.ts:17,248`); não os redeclare.

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm run verificar`
Expected: FAIL — `tsc` acusa que o módulo `../src/lib/atributos/premissa-url` não existe.

- [ ] **Step 3: Escrever o módulo**

Crie `src/lib/atributos/premissa-url.ts`:

```ts
// A premissa da varredura na URL, em chaves partilhadas pela ficha do atributo
// e pela simulação legislativa.
//
//   ?base=maxima&reincidente=sim
//   ?base=fixa&fixa=3a&antecedentes=nao
//
// O padrão NUNCA é gravado: um link carrega o que foi mexido, e só. Quem cita
// um recorte cita o recorte, e não a tela.
//
// Framework-free de propósito: o codec entra na ilha React da ficha, na ilha do
// simulador e nos scripts de verificação, e não pode arrastar nenhum dos três.

import {diasDeMeses, escreverDuracao, lerDuracao} from '../pena';
import type {BasePenaConcreta, CenarioReverso} from './reverso';
import {cenarioReversoPadrao} from './reverso';

const BASES: BasePenaConcreta[] = ['minima', 'maxima', 'fixa'];

/** As circunstâncias do réu que a URL grava quando ligadas. */
const LIGA: [keyof CenarioReverso, string][] = [
  ['reincidenteEspecifico', 'reincidente'],
  ['comandoOrgcrimUltraviolenta', 'comando'],
  ['confessou', 'confessou'],
  ['reparouDano', 'reparou'],
];

export function lerPremissa(q: URLSearchParams): CenarioReverso {
  const rev = cenarioReversoPadrao();
  const base = q.get('base') as BasePenaConcreta | null;
  if (base && BASES.includes(base)) rev.base = base;
  const fixa = q.get('fixa');
  if (fixa) {
    const dias = lerDuracao(fixa);
    if (dias !== null) rev.penaFixaMeses = dias / 30;
  }
  for (const [chave, nome] of LIGA) {
    (rev[chave] as boolean) = q.get(nome) === 'sim';
  }
  // Bons antecedentes é o único cujo padrão é `true`: grava-se a negativa.
  rev.bonsAntecedentes = q.get('antecedentes') !== 'nao';
  return rev;
}

export function escreverPremissa(q: URLSearchParams, rev: CenarioReverso): void {
  const padrao = cenarioReversoPadrao();
  if (rev.base !== padrao.base) q.set('base', rev.base);
  if (rev.base === 'fixa' && rev.penaFixaMeses !== padrao.penaFixaMeses) {
    q.set('fixa', escreverDuracao(diasDeMeses(rev.penaFixaMeses)));
  }
  for (const [chave, nome] of LIGA) {
    if (rev[chave]) q.set(nome, 'sim');
  }
  if (!rev.bonsAntecedentes) q.set('antecedentes', 'nao');
}

export function premissaIgualAoPadrao(rev: CenarioReverso): boolean {
  const p = cenarioReversoPadrao();
  return (Object.keys(p) as (keyof CenarioReverso)[]).every((k) => p[k] === rev[k]);
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm run verificar`
Expected: PASS, com as catorze asserções novas em `✓`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/atributos/premissa-url.ts scripts/verificar_atributos.ts
git commit -m "feat: o codec de URL da premissa, partilhavel entre ficha e simulacao"
```

---

### Task 3: A ficha do atributo passa a usar o codec

Refactor puro: o comportamento e as URLs geradas não mudam. O teste é a ida e volta continuar valendo.

**Files:**
- Modify: `src/components/atributo/estado.ts:132-200` (`lerEstado` e `escreverEstado`)
- Modify: `src/components/atributo/FichaAtributo.tsx:84-87` (`iguaisAoPadrao` sai; usa `premissaIgualAoPadrao`)
- Test: `scripts/verificar_atributos.ts` (o bloco da Task 2 cobre; acrescente a asserção de compatibilidade abaixo)

**Interfaces:**
- Consumes: `lerPremissa`, `escreverPremissa`, `premissaIgualAoPadrao` de `src/lib/atributos/premissa-url.ts` (Task 2).
- Produces: nada novo. `lerEstado` e `escreverEstado` mantêm a assinatura.

- [ ] **Step 1: Escrever o teste que falha**

Acrescente ao bloco da Task 2, em `scripts/verificar_atributos.ts`:

```ts
console.log('\nA ficha grava a premissa nas mesmas chaves do codec');
{
  const def = CATALOGO.find((d) => d.natureza === 'concreto')!;
  const padroes = valoresPadrao(def);
  const e = lerEstado('?base=maxima&reincidente=sim', def, padroes);
  ok(e.rev.base === 'maxima', 'a ficha lê base=maxima');
  ok(e.rev.reincidenteEspecifico === true, 'a ficha lê reincidente=sim');
  const s = escreverEstado(e, def);
  ok(s.includes('base=maxima'), 'a ficha reescreve base=maxima');
  ok(s.includes('reincidente=sim'), 'a ficha reescreve reincidente=sim');
}
```

Acrescente ao import do topo do arquivo, se ainda não estiverem lá:

```ts
import {escreverEstado, lerEstado} from '../src/components/atributo/estado';
import {valoresPadrao} from '../src/lib/atributos/types';
```

- [ ] **Step 2: Rodar e verificar que passa (ainda com o código velho)**

Run: `npm run verificar`
Expected: PASS. Este teste é a **rede**: ele passa antes do refactor e tem de continuar passando depois. Se falhar agora, pare — a premissa do refactor está errada.

- [ ] **Step 3: Trocar a implementação por chamadas ao codec**

Em `src/components/atributo/estado.ts`, no import do topo acrescente:

```ts
import {escreverPremissa, lerPremissa} from '../../lib/atributos/premissa-url';
```

Em `lerEstado`, **apague** o bloco que vai de `const rev = cenarioReversoPadrao();` até `rev.bonsAntecedentes = q.get('antecedentes') !== 'nao';` e ponha:

```ts
  const rev = lerPremissa(q);
```

Em `escreverEstado`, **apague** o bloco que vai de `const padrao = cenarioReversoPadrao();` até `if (!e.rev.bonsAntecedentes) q.set('antecedentes', 'nao');` e ponha:

```ts
  escreverPremissa(q, e.rev);
```

Remova a constante `BASES` (linha 130) e os imports que ficarem sem uso (`cenarioReversoPadrao`, `BasePenaConcreta`) — o `tsc` acusa.

Em `src/components/atributo/FichaAtributo.tsx`, apague a função `iguaisAoPadrao` (linhas 84-87), importe `premissaIgualAoPadrao` de `../../lib/atributos/premissa-url` e troque as chamadas de `iguaisAoPadrao(` por `premissaIgualAoPadrao(`.

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm run verificar && npm run typecheck && npm run build`
Expected: PASS nos três. O build tem de continuar em 1.594 páginas.

- [ ] **Step 5: Commit**

```bash
git add src/components/atributo/estado.ts src/components/atributo/FichaAtributo.tsx scripts/verificar_atributos.ts
git commit -m "refactor: a ficha do atributo le a premissa pelo codec partilhado"
```

---

### Task 4: Os controles de premissa viram componente compartilhado

Hoje a marcação dos botões de base, do campo de pena fixa e dos chips de circunstância está embutida em `FichaAtributo.tsx:415-462`. O simulador precisa da mesma coisa. Extrair para um componente evita que as duas telas divirjam.

**Files:**
- Create: `src/components/premissa/ControlesPremissa.tsx`
- Create: `src/components/premissa/premissa.module.css`
- Modify: `src/components/atributo/FichaAtributo.tsx:415-462`
- Test: verificação visual (Step 4) — o componente é marcação, e o projeto não tem teste de interface (é pendência A2 do spec).

**Interfaces:**
- Consumes: `CenarioReverso`, `BASE_LABEL`, `BASE_AJUDA`, `BasePenaConcreta` de `src/lib/atributos/reverso.ts`; `diasDeMeses` de `src/lib/pena.ts`; o `CampoPena` que `FichaAtributo.tsx` já usa.
- Produces: o componente

```tsx
export function ControlesPremissa(props: {
  rev: CenarioReverso;
  onChange: (patch: Partial<CenarioReverso>) => void;
  /** `false` esconde os botões de base: o atributo é abstrato e não presume pena concreta. */
  mostrarBase: boolean;
}): JSX.Element
```

- [ ] **Step 1: Criar o componente**

Crie `src/components/premissa/ControlesPremissa.tsx`:

```tsx
// Os controles da premissa da varredura, partilhados pela ficha do atributo e
// pela simulação legislativa.
//
// Extraídos de FichaAtributo em 17/09/2026: as duas telas varrem o catálogo sob
// a mesma presunção, e uma oferecer controles que a outra não oferece é o que a
// pendência do revamp apontava.

import React from 'react';
import {BASE_AJUDA, BASE_LABEL, type BasePenaConcreta, type CenarioReverso} from '../../lib/atributos/reverso';
import {diasDeMeses} from '../../lib/pena';
import CampoPena from '../ficha/CampoPena';
import s from './premissa.module.css';

const CIRCUNSTANCIAS: {chave: 'reincidenteEspecifico' | 'comandoOrgcrimUltraviolenta' | 'confessou' | 'reparouDano'; rotulo: string}[] = [
  {chave: 'reincidenteEspecifico', rotulo: 'reincidente específico'},
  {chave: 'comandoOrgcrimUltraviolenta', rotulo: 'comando de orgcrim ultraviolenta'},
  {chave: 'confessou', rotulo: 'confessou'},
  {chave: 'reparouDano', rotulo: 'reparou o dano'},
];

export function ControlesPremissa({
  rev,
  onChange,
  mostrarBase,
}: {
  rev: CenarioReverso;
  onChange: (patch: Partial<CenarioReverso>) => void;
  mostrarBase: boolean;
}) {
  return (
    <>
      {mostrarBase && (
        <>
          <div className={s.bases} role="group" aria-label="Pena concreta presumida">
            <span className={s.rotuloBases}>Pena concreta presumida:</span>
            {(Object.keys(BASE_LABEL) as BasePenaConcreta[]).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={rev.base === b}
                className={`${s.base} ${rev.base === b ? s.baseAtiva : ''}`}
                onClick={() => onChange({base: b})}
              >
                {BASE_LABEL[b]}
              </button>
            ))}
          </div>
          {rev.base === 'fixa' && (
            <CampoPena
              rotulo="pena concreta fixa"
              dias={diasDeMeses(rev.penaFixaMeses)}
              onChange={(d) => onChange({penaFixaMeses: d / 30})}
            />
          )}
          <p className={s.ajudaBase}>
            {BASE_AJUDA[rev.base]} Os números abaixo valem sob esta premissa e mudam se ela mudar.
          </p>
        </>
      )}
      <div className={s.circunstancias}>
        <span className={s.notaMono}>circunstâncias do réu aplicadas a todo o catálogo</span>
        {CIRCUNSTANCIAS.map((c) => (
          <button
            key={c.chave}
            type="button"
            aria-pressed={rev[c.chave]}
            className={`${s.chip} ${rev[c.chave] ? s.chipAtivo : ''}`}
            onClick={() => onChange({[c.chave]: !rev[c.chave]})}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
      <p className={`${s.notaMono} sem-recuo`}>
        Hediondez, violência, grave ameaça, culpa, resultado morte e previsão de perdão judicial não entram aqui: são
        campos de cada tipo penal, lidos do catálogo dispositivo a dispositivo.
      </p>
    </>
  );
}
```

`CampoPena` é **export default** de `src/components/ficha/CampoPena.tsx` — o import é sem chaves, como em `FichaAtributo.tsx:28`.

- [ ] **Step 2: Criar o CSS, copiando as regras da ficha**

De `src/components/atributo/atributo.module.css` — o módulo que `FichaAtributo.tsx:35` importa como `s` — **copie** para `src/components/premissa/premissa.module.css` as classes: `bases`, `rotuloBases`, `base`, `baseAtiva`, `ajudaBase`, `circunstancias`, `chip`, `chipAtivo`, `notaMono`.

Copie, não mova: a ficha continua usando `notaMono` em outros pontos do arquivo.

- [ ] **Step 3: A ficha passa a usar o componente**

Em `src/components/atributo/FichaAtributo.tsx`, substitua o trecho que vai de `{def.natureza === 'concreto' && (` até o `</p>` que fecha a nota "Hediondez, violência..." — inclusive o `<div className={s.circunstancias}>` inteiro — por:

```tsx
            <ControlesPremissa rev={e.rev} onChange={mudarRev} mostrarBase={def.natureza === 'concreto'} />
```

Acrescente o import:

```tsx
import {ControlesPremissa} from '../premissa/ControlesPremissa';
```

Remova de `FichaAtributo.tsx` a constante `CIRCUNSTANCIAS` (linhas 77-82) e os imports que ficarem sem uso (`BASE_AJUDA`, `BASE_LABEL`, `BasePenaConcreta`, possivelmente `CampoPena` e `diasDeMeses`) — o `tsc` acusa.

- [ ] **Step 4: Verificar que a ficha não mudou de aparência**

```bash
npm run typecheck && npm run build
```

Depois, com o servidor de desenvolvimento, abra `/atributos/progressao` (atributo `concreto`, mostra os botões de base) e `/atributos/sursis-processual` (atributo `abstrato`, não mostra). Confirme: os botões de base, o campo de pena fixa ao escolher "Valor fixo", os quatro chips e as duas notas aparecem como antes.

- [ ] **Step 5: Commit**

```bash
git add src/components/premissa/ src/components/atributo/FichaAtributo.tsx
git commit -m "refactor: os controles de premissa viram componente partilhado"
```

---

### Task 5: O simulador oferece a premissa, e a grava na URL

O passo que fecha a pendência. `REV` deixa de ser constante de módulo e vira estado; os controles entram na tela; a premissa entra na URL do pacote, junto da hipótese.

**Files:**
- Modify: `src/components/simulacao/Simulador.tsx:69` (a constante), `:563-615` (estado e URL), e a marcação onde os controles entram
- Modify: `src/components/simulacao/estado.ts` (`lerPacote` e `escreverPacote` passam a carregar a premissa)
- Modify: `src/components/simulacao/nota.ts` (a nota exportada declara a premissa)
- Test: `scripts/verificar_simulacao.ts`

**Interfaces:**
- Consumes: `lerPremissa`, `escreverPremissa` de `src/lib/atributos/premissa-url.ts` (Task 2); `ControlesPremissa` de `src/components/premissa/ControlesPremissa.tsx` (Task 4).
- Produces: `lerPacote` devolve `{pacote, ativo, rev}` em vez de `{pacote, ativo}`; `escreverPacote(pacote, ativo, porId, rev)` ganha o quarto parâmetro. A nota deixa de exportar a constante `RECORTE` e passa a exportar a função `recorte(rev)`.

- [ ] **Step 1: Escrever o teste que falha**

Em `scripts/verificar_simulacao.ts`, no fim, acrescente:

```ts
import {cenarioReversoPadrao} from '../src/lib/atributos/reverso';

console.log('\nA premissa vai e volta pela URL do pacote');
{
  const m: Mudanca = {sentido: 'atributo', op: 'modificar', atributo: 'teto', params: {tetoMeses: 36}};
  const padrao = cenarioReversoPadrao();

  const semMexer = escreverPacote([m], 0, porId, padrao);
  ok(!semMexer.includes('base='), 'a premissa padrão não suja a URL');

  const mexida = {...padrao, base: 'maxima' as const, reincidenteEspecifico: true};
  const url = escreverPacote([m], 0, porId, mexida);
  ok(url.includes('base=maxima'), 'a premissa mexida entra na URL');

  const volta = lerPacote(url, porId);
  ok(volta.rev.base === 'maxima', 'a premissa volta da URL');
  ok(volta.rev.reincidenteEspecifico === true, 'a circunstância volta da URL');
  ok(volta.pacote.length === 1, 'o pacote continua chegando inteiro');
}

console.log('\nO recorte da nota acompanha a premissa');
{
  const padrao = cenarioReversoPadrao();
  ok(recorte(padrao).includes('pena mínima cominada'), 'no padrão, o recorte fala da mínima');
  ok(recorte(padrao).includes('réu primário'), 'no padrão, o recorte fala do réu primário');

  const maxima = recorte({...padrao, base: 'maxima'});
  ok(maxima.includes('pena máxima cominada'), 'na máxima, o recorte fala da máxima');
  ok(!maxima.includes('pena mínima cominada'), 'e não fala mais da mínima');

  const reincidente = recorte({...padrao, reincidenteEspecifico: true});
  ok(reincidente.includes('reincidente específico'), 'a reincidência entra no recorte');
  ok(!reincidente.includes('réu primário'), 'e o réu primário sai');

  const fixa = recorte({...padrao, base: 'fixa', penaFixaMeses: 36});
  ok(fixa.includes('3 anos'), 'a pena fixa entra no recorte por extenso');
}
```

Acrescente ao import do topo: `import {recorte} from '../src/components/simulacao/nota';`

`porId` é o mapa de atributos fictícios que o arquivo já monta e usa nas asserções de URL existentes (`scripts/verificar_simulacao.ts:237-238`).

**Atenção à asserção existente da linha 249**, que compara a URL byte a byte:

```ts
ok(simples === '?m=am;teto;tetoMeses=3a&m=tm;2;max=2a', ...)
```

Ela tem de continuar passando — é a prova de que a premissa padrão não suja a URL. Se ela quebrar, `escreverPremissa` está gravando o padrão, contra a regra.

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm run verificar`
Expected: FAIL — `tsc` acusa que `escreverPacote` aceita três argumentos, não quatro, e que `lerPacote` não devolve `rev`.

- [ ] **Step 3: Estender o codec do pacote**

Em `src/components/simulacao/estado.ts`:

```ts
import {escreverPremissa, lerPremissa} from '../../lib/atributos/premissa-url';
import type {CenarioReverso} from '../../lib/atributos/reverso';
```

Na assinatura de `escreverPacote`, acrescente o parâmetro e, logo antes de devolver a query string, grave a premissa no mesmo `URLSearchParams` que a função já monta:

```ts
export function escreverPacote(
  pacote: Mudanca[],
  i: number,
  porId: Map<string, AtributoDef>,
  rev: CenarioReverso,
): string {
  // ... o corpo existente, até ter o URLSearchParams pronto ...
  escreverPremissa(q, rev);
  // ... e então o return existente
}
```

Em `lerPacote`, acrescente `rev` ao objeto devolvido:

```ts
  return {pacote, ativo, rev: lerPremissa(q)};
```

Ajuste o tipo de retorno declarado para incluir `rev: CenarioReverso`.

- [ ] **Step 4: Ligar no Simulador**

Em `src/components/simulacao/Simulador.tsx`:

Apague a linha 69 (`const REV = cenarioReversoPadrao();`) e, junto dos outros `useState` (perto da linha 563), acrescente:

```tsx
  const [rev, setRev] = useState(cenarioReversoPadrao());
  const mudarRev = (patch: Partial<CenarioReverso>) => setRev((a) => ({...a, ...patch}));
```

Importe o tipo:

```tsx
import {cenarioReversoPadrao, type CenarioReverso} from '../../lib/atributos/reverso';
import {ControlesPremissa} from '../premissa/ControlesPremissa';
```

No `useEffect` que lê a URL na montagem (linha 568), acrescente a premissa:

```tsx
      const e = lerPacote(window.location.search, POR_ID);
      setRev(e.rev);
```

Troque **todas** as ocorrências de `REV` por `rev` — são as das linhas 604, 610 e 613 — e acrescente `rev` ao array de dependências dos três `useMemo` correspondentes (`avLegal`, `resultado`, `etiquetas`).

Na linha 598, passe a premissa ao escrever a URL:

```tsx
    const novo = window.location.pathname + (padrao ? '' : escreverPacote(pacote, i, POR_ID, rev));
```

Acrescente `rev` ao array de dependências desse `useEffect`. Na linha 641, o identificador da nota também passa a considerar a premissa:

```tsx
  const idNota = hoje ? identificador(escreverPacote(validas, 0, POR_ID, rev), hoje) : '';
```

Por fim, ponha os controles na tela, logo acima do bloco que mostra o resultado da simulação:

```tsx
        <section className={s.premissa} aria-label="Premissa da varredura">
          <p className={s.linhaPremissa}>
            <span className={s.rotuloAcento}>Premissa da varredura</span> A varredura presume o réu condenado segundo a
            base escolhida. Os números do impacto valem sob esta premissa e mudam se ela mudar.
          </p>
          <ControlesPremissa rev={rev} onChange={mudarRev} mostrarBase />
        </section>
```

Acrescente ao `src/components/simulacao/simulacao.module.css` as classes `premissa`, `linhaPremissa` e `rotuloAcento`, copiando de `atributo.module.css` as regras de `pressuposto`, `linhaPressuposto` e `rotuloAcento`.

- [ ] **Step 5: O recorte da nota deixa de mentir sobre a premissa**

**Este passo não é acabamento — sem ele a mudança introduz um erro.** `src/components/simulacao/nota.ts:26-27` define o recorte como constante, com a premissa escrita por extenso:

```ts
export const RECORTE =
  'tipos penais com pena privativa de liberdade, presumido o réu primário e condenado na pena mínima cominada nos atributos que dependem da pena aplicada';
```

Essa frase vai para a nota exportada (`nota.ts:173`) e para a tela (`Simulador.tsx:449`). Se a premissa passa a variar e o recorte não, a nota citável afirma "pena mínima cominada" enquanto os números foram calculados na máxima. Isso é o que o cabeçalho do próprio arquivo proíbe: *"nenhum número sai sem denominador e sem a definição do recorte na mesma linha"*.

Troque a constante por uma função. Em `src/components/simulacao/nota.ts`:

```ts
import {BASE_LABEL, type CenarioReverso, cenarioReversoPadrao} from '../../lib/atributos/reverso';
import {diasDeMeses, formatDias, formatFaixa} from '../../lib/pena';
```

(`formatDias` e `formatFaixa` já são importados de `../../lib/pena`; acrescente `diasDeMeses` à mesma linha.)

```ts
/** As circunstâncias do réu que diferem do padrão, por extenso. */
function circunstanciasDo(rev: CenarioReverso): string[] {
  const p = cenarioReversoPadrao();
  const fora: string[] = [];
  if (rev.reincidenteEspecifico !== p.reincidenteEspecifico) fora.push(rev.reincidenteEspecifico ? 'reincidente específico' : 'réu primário');
  if (rev.comandoOrgcrimUltraviolenta !== p.comandoOrgcrimUltraviolenta) fora.push('com comando de organização criminosa ultraviolenta');
  if (rev.confessou !== p.confessou) fora.push('confesso');
  if (rev.reparouDano !== p.reparouDano) fora.push('com o dano reparado');
  if (rev.bonsAntecedentes !== p.bonsAntecedentes) fora.push('sem bons antecedentes');
  return fora;
}

/**
 * O recorte, por extenso: acompanha todo número de alcance.
 *
 * Deixou de ser constante em 17/09/2026, quando a premissa da varredura passou a
 * ser editável. Uma nota que declara premissa diferente da que calculou o número
 * é pior que uma nota sem premissa.
 */
export function recorte(rev: CenarioReverso): string {
  const base =
    rev.base === 'minima'
      ? 'condenado na pena mínima cominada'
      : rev.base === 'maxima'
        ? 'condenado na pena máxima cominada'
        : `condenado a ${formatDias(diasDeMeses(rev.penaFixaMeses))}`;
  const circ = circunstanciasDo(rev);
  const reu = ['réu primário', ...circ].filter((x, k, l) => l.indexOf(x) === k);
  return (
    'tipos penais com pena privativa de liberdade, presumido o ' +
    `${juntar(reu)} e ${base} nos atributos que dependem da pena aplicada`
  );
}
```

`juntar` já existe no arquivo (`nota.ts:24`).

Em `nota.ts:173`, troque `${RECORTE}` por `${recorte(rev)}` e acrescente `rev: CenarioReverso` aos parâmetros da função que monta o markdown. Em `Simulador.tsx:50`, troque o import de `RECORTE` por `recorte`, e em `Simulador.tsx:449` troque `{RECORTE}` por `{recorte(rev)}`. Ajuste a chamada que gera o markdown para passar `rev`.

- [ ] **Step 6: Rodar tudo**

```bash
npm run verificar && npm run typecheck && npm run build
```

Expected: PASS nos três; as cinco asserções novas em `✓`; o build continua em 1.594 páginas.

- [ ] **Step 7: Verificar na tela**

Com o servidor de desenvolvimento, abra `/simulacao`:

1. Monte uma mudança qualquer (por exemplo, modificar um atributo).
2. Troque a base para "Pena máxima cominada". Os números do impacto têm de mudar.
3. Confirme que a URL ganhou `base=maxima`.
4. Recarregue a página. A base tem de voltar como "Pena máxima cominada".
5. Volte para "Pena mínima cominada". A URL tem de **perder** o `base=`.
6. Exporte a nota e confira que ela declara a premissa.

- [ ] **Step 8: Commit**

```bash
git add src/components/simulacao/ scripts/verificar_simulacao.ts
git commit -m "feat: a simulacao oferece a premissa da varredura, e a grava na URL"
```

---

### Task 6: Fechar a pendência no backlog

**Files:**
- Modify: `backlog.md:334-337` (o item "Premissa fixa")

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Trocar o texto da pendência**

Em `backlog.md`, na seção "Simulação legislativa: o que a primeira versão não faz", **apague** o item:

```
- **Premissa fixa.** A varredura presume réu primário, condenado na pena mínima cominada
  nos atributos que dependem da pena aplicada. A tela não oferece os controles de premissa
  que a ficha do atributo tem (base da pena concreta, circunstâncias do réu).
```

e ponha, no fim da mesma seção:

```
- ~~**Premissa fixa.**~~ Fechada em 17/09/2026. A tela oferece os mesmos controles da ficha
  do atributo — base da pena concreta e circunstâncias do réu —, e a premissa entra na URL e
  na nota exportada. Os controles moram em `src/components/premissa/ControlesPremissa.tsx`,
  partilhados pelas duas telas.
```

**Confira o EOL antes de salvar:** `backlog.md` está em CRLF puro. Se editar com Python, escreva bytes e converta `\n` para `\r\n`.

- [ ] **Step 2: Verificar o EOL**

```bash
python -c "d=open('backlog.md','rb').read(); print('LF solto:', d.count(b'\n')-d.count(b'\r\n'))"
```

Expected: `LF solto: 0`

- [ ] **Step 3: Rodar o Arquivista**

Run: `python scripts/robos/arquivista/verificar_documentacao.py`
Expected: nenhum `⚠️`.

- [ ] **Step 4: Commit**

```bash
git add backlog.md
git commit -m "docs: a premissa fixa sai das pendencias do revamp"
```

---

## Verificação final do plano

Antes de dar o plano por concluído, rode a bateria inteira do `AGENTS.md`:

```bash
python scripts/transform_data.py --estrito --max-contradicoes=0
python scripts/validar_modificadores.py
python scripts/validar_atributos.py
python scripts/robos/arquivista/verificar_documentacao.py
python -m pytest scripts/robos/tests
node scripts/validar-changelog.mjs
npm run atributos && npm run typecheck && npm run verificar && npm run build
```

Nenhum dado do catálogo foi tocado neste plano, então `transform_data.py` e os validadores têm de passar sem mudança. Se algum acusar diferença, algo saiu do escopo.
