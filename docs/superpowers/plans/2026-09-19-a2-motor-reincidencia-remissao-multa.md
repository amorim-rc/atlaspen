# A2, primeira parte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir três defeitos do motor de atributos que publicam veredito errado ou ausente: a reincidência (quatro estados), os tipos com pena por remissão (avaliação por origem) e os tipos só com multa (vereditos na ficha).

**Architecture:** Primeiro troca-se o contrato da reincidência sem mudar veredito nenhum, e o teste de equivalência prova isso; depois cada regra muda com a âncora que a exige. A remissão ganha um módulo próprio e um ponto de entrada único (`avaliarTipo`), por onde passam todas as avaliações de tipo do catálogo. Os tipos só com multa ganham um campo em `data/atributos.json` e uma seção própria na ficha do tipo, gerada no build.

**Tech Stack:** TypeScript (motor e site, Astro 7 + React), Python (pipeline de dados e robôs). Testes são scripts TS com `ok(cond, msg)`, rodados por `npm run verificar`; o pipeline tem validadores Python.

**Spec:** `docs/superpowers/specs/2026-09-19-a2-motor-reincidencia-remissao-multa-design.md`

## Global Constraints

- **Acuidade jurídica é o valor central.** Todo número novo vem de dispositivo conferido no compilado do Planalto; nada é preenchido por plausibilidade (`AGENTS.md`).
- **Nenhuma nota de atualização.** São correções do motor, não mudanças de lei (`AGENTS.md`).
- **Parâmetro, nunca constante.** Todo patamar legal lido por avaliador é parâmetro em `data/atributos.json`, com `redacoes` ligadas ao histórico legislativo.
- **`data/atributos.json` reserializa sem diferença** com `json.dumps(d, ensure_ascii=False, indent=2) + '\n'`, e está em CRLF na cópia de trabalho: carregar, alterar, gravar e devolver o CRLF.
- **Preservar o EOL** de todo arquivo editado (`AGENTS.md`); conferir `LF solto: 0` nos que estavam em CRLF.
- **`docs/dados-abertos.md` e `textos/historia.md` têm modificações do mantenedor, não commitadas.** Em `docs/dados-abertos.md`, editar só as linhas deste plano e commitar com `git add -p`, só os hunks próprios. Não tocar em `textos/historia.md`.
- **Não fazer push nem abrir PR.** Commits locais na branch `revamp/atlaspen`.
- **Bateria do `AGENTS.md`** ao fim de cada tarefa que mexe em dado ou motor:
  ```
  python scripts/transform_data.py --estrito --max-contradicoes=0
  python scripts/validar_modificadores.py
  python scripts/validar_atributos.py
  python scripts/robos/arquivista/verificar_documentacao.py
  python -m pytest scripts/robos/tests
  node scripts/validar-changelog.mjs
  npm run atributos && npm run typecheck && npm run verificar && npm run build
  ```

---

### Task 1: O contrato da reincidência, sem mudar veredito

Troca os dois booleanos do cenário (`primario`, `reincidenteEspecifico`) por um campo de quatro estados. **Nenhum veredito muda**: todo avaliador passa a ler `reincidenteEspecifico(c)`, que responde o mesmo que o campo antigo, e a interface continua oferecendo só primário e específico. O teste de equivalência é a prova.

**Files:**
- Create: `src/lib/atributos/reincidencia.ts`
- Modify: `src/lib/types.ts` (interface `Cenario`, linhas 199-200)
- Modify: `src/lib/cenario.ts:20-21`
- Modify: `src/lib/atributos/reverso.ts` (`CenarioReverso`, `circunstanciasPorExtenso`, `cenarioReversoPadrao`, `cenarioParaCrime`)
- Modify: `src/lib/atributos/avaliadores.ts` (21 leituras de `c.reincidenteEspecifico`)
- Modify: `src/lib/atributos/premissa-url.ts`
- Modify: `src/lib/simulacao/motor.ts` (requisito `primario` do atributo novo)
- Modify: `src/components/premissa/ControlesPremissa.tsx`
- Modify: `src/components/ficha/PainelConcreta.tsx:43-44`
- Modify: `src/components/simulacao/nota.ts:40`
- Modify: `scripts/derivar_atributos.ts:144`
- Test: `scripts/verificar_atributos.ts`, `scripts/verificar_simulacao.ts`, `scripts/equivalencia_atributos.ts`

**Interfaces:**
- Produces:
  - `export type Reincidencia = 'primario' | 'culposo' | 'doloso' | 'especifico';` em `src/lib/types.ts`
  - `Cenario.reincidencia: Reincidencia` (substitui `primario` e `reincidenteEspecifico`)
  - `CenarioReverso.reincidencia: Reincidencia` (substitui `reincidenteEspecifico`)
  - em `src/lib/atributos/reincidencia.ts`: `REINCIDENCIAS: Reincidencia[]`, `ROTULO_REINCIDENCIA: Record<Reincidencia, string>`, `ehReincidente(c)`, `reincidenteEmDoloso(c)`, `reincidenteEspecifico(c)` — as três com parâmetro `c: {reincidencia: Reincidencia}` e retorno `boolean`.

- [ ] **Step 1: Confirmar a linha de base**

A equivalência tem de passar ANTES da troca; se falhar já agora, o congelamento está velho e a prova não vale.

Run: `npm run equivalencia`
Expected: saída sem divergência (a mensagem de sucesso do script). Se acusar divergência, PARE e reporte: não dá para provar que a troca não muda veredito.

- [ ] **Step 2: O tipo e as funções**

Em `src/lib/types.ts`, logo antes de `export interface Cenario {`, acrescente:

```ts
/**
 * A reincidência do réu, em quatro estados, porque a lei distingue: "reincidente"
 * (ANPP, regime, saída temporária, prescrição executória) e "reincidente em crime
 * doloso" (sursis, substituição, livramento). O específico — no mesmo crime ou em
 * crime da mesma natureza — é sempre doloso nos atributos que o leem.
 */
export type Reincidencia = 'primario' | 'culposo' | 'doloso' | 'especifico';
```

Na `interface Cenario`, troque as linhas

```ts
  primario: boolean;
  reincidenteEspecifico: boolean;
```

por

```ts
  /** A reincidência do réu. Circunstância do CASO, não do tipo. */
  reincidencia: Reincidencia;
```

Crie `src/lib/atributos/reincidencia.ts`:

```ts
// A reincidência do réu, lida do jeito que cada lei pergunta.
//
// Os avaliadores não comparam o campo direto: perguntam o que o dispositivo
// pergunta. "Reincidente" (CPP, art. 28-A, §2º, II; CP, art. 33, §2º; LEP,
// art. 123, II; CP, art. 110) é qualquer reincidência; "reincidente em crime
// doloso" (CP, arts. 44, II, 77, I, e 83, II) exclui a culposa; o específico
// (CP, arts. 44, §3º, e 83, V; LEP, art. 112, V a VIII) é um caso do doloso.

import type {Reincidencia} from '../types';

type ComReincidencia = {reincidencia: Reincidencia};

export const REINCIDENCIAS: Reincidencia[] = ['primario', 'culposo', 'doloso', 'especifico'];

export const ROTULO_REINCIDENCIA: Record<Reincidencia, string> = {
  primario: 'primário',
  culposo: 'reincidente em crime culposo',
  doloso: 'reincidente em crime doloso',
  especifico: 'reincidente específico',
};

export const ehReincidente = (c: ComReincidencia): boolean => c.reincidencia !== 'primario';

export const reincidenteEmDoloso = (c: ComReincidencia): boolean =>
  c.reincidencia === 'doloso' || c.reincidencia === 'especifico';

export const reincidenteEspecifico = (c: ComReincidencia): boolean => c.reincidencia === 'especifico';
```

- [ ] **Step 3: O cenário e a premissa**

Em `src/lib/cenario.ts`, troque

```ts
    primario: true,
    reincidenteEspecifico: false,
```

por

```ts
    reincidencia: 'primario',
```

Em `src/lib/atributos/reverso.ts`:
- import: acrescente `import type {Reincidencia} from '../types';` e `import {ROTULO_REINCIDENCIA} from './reincidencia';`
- na `interface CenarioReverso`, troque `reincidenteEspecifico: boolean;` por `reincidencia: Reincidencia;`
- em `circunstanciasPorExtenso`, troque `if (rev.reincidenteEspecifico) partes.push('réu reincidente específico');` por
  ```ts
  if (rev.reincidencia !== 'primario') partes.push(`réu ${ROTULO_REINCIDENCIA[rev.reincidencia]}`);
  ```
- em `cenarioReversoPadrao`, troque `reincidenteEspecifico: false,` por `reincidencia: 'primario',`
- em `cenarioParaCrime`, troque as duas linhas
  ```ts
      primario: !rev.reincidenteEspecifico,
      reincidenteEspecifico: rev.reincidenteEspecifico,
  ```
  por
  ```ts
      reincidencia: rev.reincidencia,
  ```

- [ ] **Step 4: Os avaliadores, lendo pela função (mesmo veredito)**

```bash
sed -i 's/c\.reincidenteEspecifico/reincidenteEspecifico(c)/g' src/lib/atributos/avaliadores.ts
grep -c "reincidenteEspecifico(c)" src/lib/atributos/avaliadores.ts
```

Expected: `21`. Acrescente ao topo, junto dos imports:

```ts
import {reincidenteEspecifico} from './reincidencia';
```

O `sed` não muda o fim de linha do arquivo (ele está em LF); confira com o comando do Step 9.

- [ ] **Step 5: Os demais pontos**

`src/lib/simulacao/motor.ts` — no filtro dos requisitos do atributo novo, troque `(r === 'primario' && c.primario)` por `(r === 'primario' && c.reincidencia === 'primario')`.

`src/components/simulacao/nota.ts:40` — troque

```ts
  const reu = rev.reincidenteEspecifico ? circ : ['réu primário', ...circ];
```

por

```ts
  const reu = rev.reincidencia === 'primario' ? ['réu primário', ...circ] : circ;
```

`src/components/ficha/PainelConcreta.tsx:43-44` — troque as duas linhas por

```tsx
        reincidencia: e.reincidente ? 'especifico' : 'primario',
```

`scripts/derivar_atributos.ts:144` — troque `reincidente_especifico: rev.reincidenteEspecifico,` por `reincidencia: rev.reincidencia,`. Antes, confira que nenhum documento cita a chave velha:

```bash
git grep -n "reincidente_especifico" -- ':!static/data/atributos.json' ':!docs/superpowers'
```

Expected: nenhuma linha. Se houver, troque ali também para `reincidencia`.

`src/lib/atributos/premissa-url.ts` — nesta tarefa a URL continua a mesma (`reincidente=sim` para o específico); a chave nova entra na Task 4.
- no tipo `Circunstancia`, remova `'reincidenteEspecifico' | `;
- em `LIGA`, remova a linha `['reincidenteEspecifico', 'reincidente'],`;
- em `lerPremissa`, logo depois do laço `for (const [chave, nome] of LIGA)`, acrescente
  ```ts
  rev.reincidencia = q.get('reincidente') === 'sim' ? 'especifico' : 'primario';
  ```
- em `escreverPremissa`, logo depois do laço de `LIGA`, acrescente
  ```ts
  if (rev.reincidencia === 'especifico') q.set('reincidente', 'sim');
  ```

`src/components/premissa/ControlesPremissa.tsx` — remova do array `CIRCUNSTANCIAS` o item `reincidenteEspecifico` (e tire `'reincidenteEspecifico' | ` do tipo de `chave`). Dentro de `<div className={s.circunstancias}>`, logo depois do `<span className={s.notaMono}>…</span>`, acrescente o chip que mantém o comportamento de hoje:

```tsx
        <button
          type="button"
          aria-pressed={rev.reincidencia === 'especifico'}
          className={`${s.chip} ${rev.reincidencia === 'especifico' ? s.chipAtivo : ''}`}
          onClick={() => onChange({reincidencia: rev.reincidencia === 'especifico' ? 'primario' : 'especifico'})}
        >
          reincidente específico
        </button>
```

- [ ] **Step 6: Os testes que montam cenário à mão**

```bash
sed -i \
  -e "s/{primario: false, reincidenteEspecifico: true}/{reincidencia: 'especifico' as const}/g" \
  -e "s/reincidenteEspecifico: true/reincidencia: 'especifico' as const/g" \
  -e "s/volta\.reincidenteEspecifico === true/volta.reincidencia === 'especifico'/g" \
  -e "s/e\.rev\.reincidenteEspecifico === true/e.rev.reincidencia === 'especifico'/g" \
  -e "s/volta\.rev\.reincidenteEspecifico === true/volta.rev.reincidencia === 'especifico'/g" \
  scripts/verificar_atributos.ts scripts/verificar_simulacao.ts
grep -n "reincidenteEspecifico\|primario:" scripts/verificar_atributos.ts scripts/verificar_simulacao.ts
```

Expected: nenhuma linha. `scripts/verificar_atributos.ts` está em **CRLF**: o `sed` do Git Bash preserva o `\r` no fim das linhas, mas confira no Step 9.

- [ ] **Step 7: Compilar e verificar**

Run: `npm run typecheck && npm run verificar`
Expected: `0 errors` e as quatro mensagens de sucesso. Um erro de tipo aponta um leitor esquecido; corrija-o pelo mesmo padrão dos Steps 3 a 6.

- [ ] **Step 8: A prova — nenhum veredito mudou**

Run: `npm run equivalencia`
Expected: sem divergência, como no Step 1.

- [ ] **Step 9: EOL**

```bash
for f in scripts/verificar_atributos.ts; do python -c "import sys;b=open(sys.argv[1],'rb').read();print(sys.argv[1],'LF solto:',b.count(b'\n')-b.count(b'\r\n'))" $f; done
```

Expected: `LF solto: 0`.

- [ ] **Step 10: Commit**

```bash
git add src/lib scripts/derivar_atributos.ts scripts/verificar_atributos.ts scripts/verificar_simulacao.ts src/components/premissa src/components/ficha/PainelConcreta.tsx src/components/simulacao/nota.ts
git commit -m "refactor: a reincidencia em quatro estados, sem mudar veredito

A equivalencia prova: os avaliadores leem reincidenteEspecifico(c), que
responde o mesmo que o campo antigo, e a interface ainda so oferece
primario e especifico.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Os dois parâmetros da prescrição e o histórico deles

A prescrição precisa de dois números que hoje não existem: o aumento de 1/3 da executória do reincidente (CP, art. 110, *caput*) e os 2 anos da multa isolada (CP, art. 114, I). Conferidos no compilado do CP em 19/09/2026:

- art. 110, *caput*: "…os quais se aumentam de um terço, se o condenado é reincidente. (Redação dada pela Lei nº 7.209, de 11.7.1984)"
- art. 114, I: "em 2 (dois) anos, quando a multa for a única cominada ou aplicada; (Incluído pela Lei nº 9.268, de 1º.4.1996)"

**Files:**
- Modify: `data/atributos.json` (atributo `prescricao`: `dispositivos` e `parametros`)
- Modify: `data/historico-legislativo.json` (regenerado pelo robô)
- Modify: `static/data/atributos.json` (derivado, por `npm run atributos`)

**Interfaces:**
- Produces: parâmetros `aumentoReincidente` (fração, padrão 1/3) e `prazoMultaIsolada` (meses, padrão 24) no atributo `prescricao`, lidos por `num(p, 'aumentoReincidente')` e `num(p, 'prazoMultaIsolada')` nas Tasks 3 e 7.

- [ ] **Step 1: Os parâmetros na base**

Rode, da raiz:

```bash
python - <<'PY'
import json
p = 'data/atributos.json'
d = json.loads(open(p, 'rb').read().decode('utf-8').replace('\r\n', '\n'))
a = next(x for x in d['atributos'] if x['slug'] == 'prescricao')
assert not any(q['id'] in ('aumentoReincidente', 'prazoMultaIsolada') for q in a['parametros'])
a['dispositivos'] += ['cp|art. 110, caput', 'cp|art. 114, i']
a['parametros'] += [
    {
        'id': 'aumentoReincidente',
        'rotulo': 'Aumento do prazo da executória para o reincidente',
        'tipo': 'fracao',
        'padrao': 1 / 3,
        'min': 0,
        'max': 1,
        'passo': 1 / 24,
        'ajuda': 'Art. 110, caput: depois do trânsito em julgado, os prazos do art. 109, '
                 'regulados pela pena aplicada, aumentam-se de um terço se o condenado é '
                 'reincidente. Não alcança a prescrição da pretensão punitiva (Súmula 220, STJ).',
        'redacoes': [{'fonte': {'dispositivo': 'cp|art. 110, caput'},
                      'norma': 'Lei nº 7.209', 'fundamento': 'Art. 110, caput, CP'}],
    },
    {
        'id': 'prazoMultaIsolada',
        'rotulo': 'Multa única cominada ou aplicada → prazo',
        'tipo': 'meses',
        'padrao': 24,
        'min': 0,
        'max': 240,
        'passo': 12,
        'ajuda': 'Art. 114, I: a prescrição da pena de multa ocorre em 2 anos quando a multa '
                 'for a única cominada ou aplicada.',
        'redacoes': [{'fonte': {'dispositivo': 'cp|art. 114, i'},
                      'norma': 'Lei nº 9.268', 'fundamento': 'Art. 114, I, CP'}],
    },
]
open(p, 'wb').write((json.dumps(d, ensure_ascii=False, indent=2) + '\n').replace('\n', '\r\n').encode('utf-8'))
print('ok')
PY
```

- [ ] **Step 2: O validador acusa a falta do histórico**

Run: `python scripts/validar_atributos.py`
Expected: FAIL com duas linhas do tipo `'Lei nº 7.209' não consta do histórico de ['cp|art. 110, caput']` e `'Lei nº 9.268' não consta do histórico de ['cp|art. 114, i']`. É a trava funcionando: nenhum parâmetro entra sem a linha do histórico.

- [ ] **Step 3: Os snapshots do Planalto no worktree**

O robô do histórico lê `crawler/snapshots/` (ignorado pelo git). O checkout principal os tem:

```bash
cp -r ../sispenas/crawler/snapshots crawler/snapshots
ls crawler/snapshots/cp
```

Expected: arquivos `AAAA-MM-DD.html`. Se `../sispenas/crawler/snapshots` não existir, baixe: `python scripts/robos/nucleo/baixar.py --todas` (o Planalto às vezes derruba a conexão; repita).

- [ ] **Step 4: Regenerar o histórico**

Run: `python scripts/robos/nucleo/historico.py`
Then: `git diff --stat data/historico-legislativo.json && git diff data/historico-legislativo.json | grep "^[-+] " | head -20`

Expected: **só linhas acrescentadas**, e todas de `cp|art. 110, caput` e `cp|art. 114, i` — com `"norma": "Lei nº 7.209", "ano": 1984` e `"norma": "Lei nº 9.268", "ano": 1996`. **Se qualquer outra linha mudar ou sair, PARE**: o snapshot copiado difere do que gerou o histórico atual, e aceitar a diferença seria mudar dado sem conferência. Desfaça com `git checkout data/historico-legislativo.json` e reporte.

- [ ] **Step 5: Validar e derivar**

Run: `python scripts/validar_atributos.py && npm run atributos && npm run verificar`
Expected: `✓ atributos.json: 22 atributos, 75 parâmetros`, derivado regravado, verificação verde (os parâmetros ainda não são lidos: nenhum veredito muda).

- [ ] **Step 6: Commit**

```bash
git add data/atributos.json data/historico-legislativo.json static/data/atributos.json
git commit -m "atributos: o aumento do art. 110 e o prazo da multa isolada, como parametros

Conferidos no compilado do CP: art. 110, caput, na redacao da Lei
7.209/1984 (+1/3 da executoria ao reincidente), e art. 114, I, incluido
pela Lei 9.268/1996 (2 anos para a multa unica). O historico vem do robo,
e so ganhou as linhas desses dois dispositivos.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: A reincidência pela letra de cada lei

Sete atributos passam a ler a reincidência que a lei deles pergunta (spec, tabela 1.3). Cada regra entra com a âncora que a exige.

**Files:**
- Modify: `src/lib/atributos/avaliadores.ts` (`anpp`, `substituicao`, `sursis-pena`, `regime`, `livramento`, `prescricao`, `saida-temporaria`)
- Test: `scripts/verificar_atributos.ts`

**Interfaces:**
- Consumes: `ehReincidente`, `reincidenteEmDoloso`, `reincidenteEspecifico` (Task 1); `num(p, 'aumentoReincidente')` (Task 2).

- [ ] **Step 1: As âncoras que falham**

Em `scripts/verificar_atributos.ts`, no bloco onde já estão `progressaoDef`, `livramentoDef` e `avaliar` (logo depois da declaração de `avaliar`, perto da linha 353), acrescente. `formatPena` e `formatFracao` vêm de `../src/lib/format` — acrescente-os ao import do topo se ainda não estiverem.

```ts
    // ── A reincidência pela letra de cada lei (A2, spec 1.3) ────────────────
    // Furto simples: sem violência, pena mínima de 1 ano, fora do menor potencial
    // ofensivo — o tipo em que as sete regras se leem sem interferência.
    const furtoR = achar(/^CP$/i, /^Art\. 155, caput/);
    if (furtoR) {
      const def = (id: string) => CATALOGO.find((b) => b.id === id)!;
      const reu = (r: Reincidencia, extra: Partial<Cenario> = {}) => ({reincidencia: r, ...extra});

      ok(avaliar(def('anpp'), furtoR, reu('culposo')).status === 'incabivel',
        'ANPP: reincidente em crime culposo é reincidente (CPP, art. 28-A, §2º, II)');
      ok(avaliar(def('anpp'), furtoR, reu('primario')).status !== 'incabivel',
        'ANPP: o primário continua podendo');

      ok(avaliar(def('sursis-pena'), furtoR, reu('culposo')).status === 'cabivel',
        'sursis: reincidente em crime culposo não é vedado (CP, art. 77, I)');
      ok(avaliar(def('sursis-pena'), furtoR, reu('doloso')).status === 'incabivel',
        'sursis: reincidente em crime doloso é vedado, também no etário (CP, art. 77, I e §2º)');

      ok(avaliar(def('substituicao'), furtoR, reu('culposo')).status === 'cabivel',
        'substituição: reincidente em crime culposo não é vedado (CP, art. 44, II)');
      ok(avaliar(def('substituicao'), furtoR, reu('doloso')).status === 'condicional',
        'substituição: reincidente em crime doloso depende de ser socialmente recomendável (CP, art. 44, §3º)');
      ok(avaliar(def('substituicao'), furtoR, reu('especifico')).status === 'incabivel',
        'substituição: reincidente específico é vedado (CP, art. 44, §3º)');

      ok(avaliar(def('regime'), furtoR, reu('primario')).valor === 'aberto',
        'regime: primário com pena de 1 ano começa no aberto');
      ok(avaliar(def('regime'), furtoR, reu('culposo')).valor === 'semiaberto',
        'regime: qualquer reincidente sai do aberto (CP, art. 33, §2º, c)');

      const livr = (r: Reincidencia) => avaliar(livramentoDef, furtoR, reu(r, {penaConcreta: 36})).valor ?? '';
      ok(livr('culposo').startsWith(formatFracao(1 / 3)), `livramento: reincidente culposo fica no inciso I (obtido "${livr('culposo')}")`);
      ok(livr('doloso').startsWith(formatFracao(1 / 2)), `livramento: reincidente em doloso cumpre metade, inciso II (obtido "${livr('doloso')}")`);

      const saida = (r: Reincidencia) => avaliar(def('saida-temporaria'), furtoR, reu(r)).detalhes.join(' ');
      ok(saida('culposo').includes(formatFracao(1 / 4)), 'saída temporária: qualquer reincidente cumpre 1/4 (LEP, art. 123, II)');
      ok(saida('primario').includes(formatFracao(1 / 6)), 'saída temporária: o primário, 1/6');

      const presc = (r: Reincidencia) => avaliar(def('prescricao'), furtoR, reu(r));
      ok(presc('culposo').detalhes.join(' ').includes(formatPena(48 * (4 / 3))),
        `prescrição executória do reincidente: 4 anos + 1/3 (CP, art. 110) — "${presc('culposo').detalhes.join(' | ')}"`);
      ok(presc('culposo').valor === presc('primario').valor,
        'prescrição da pretensão punitiva: a reincidência não influi (Súmula 220, STJ)');
    }
```

Acrescente ao import de tipos do topo: `import type {Cenario, Crime, Reincidencia} from '../src/lib/types';` (o arquivo já importa `Cenario` e `Crime` da mesma origem — só inclua `Reincidencia`).

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run verificar`
Expected: FAIL — as âncoras de ANPP (culposo), sursis (doloso), substituição (doloso), regime (culposo), livramento (doloso), saída temporária (culposo) e prescrição acusam `✗`. As do primário e do específico passam.

- [ ] **Step 3: As sete regras**

Em `src/lib/atributos/avaliadores.ts`, troque o import da Task 1 por:

```ts
import {ehReincidente, reincidenteEmDoloso, reincidenteEspecifico} from './reincidencia';
```

**ANPP** — troque

```ts
    const naoVedado = !bool(p, 'vedadoReincidente') || !reincidenteEspecifico(c);
```
por
```ts
    // Art. 28-A, §2º, II, CPP: "se o investigado for reincidente" — qualquer reincidência.
    const naoVedado = !bool(p, 'vedadoReincidente') || !ehReincidente(c);
```

**Substituição** — troque o bloco que vai de `const naoVedado = !bool(p, 'vedadoReincidenteEspecifico')` até o fechamento do objeto `resumo: …,` por:

```ts
    // Art. 44, II e §3º, CP: o reincidente em crime doloso não tem direito, mas o juiz
    // pode substituir se for socialmente recomendável e a reincidência não for
    // específica. O reincidente em crime culposo não é alcançado pelo inciso II.
    const especifico = bool(p, 'vedadoReincidenteEspecifico') && reincidenteEspecifico(c);
    const dolosoNaoEspecifico = !especifico && reincidenteEmDoloso(c);
    const cabivel = dentroPena && semViolencia && !especifico;
    return {
      status: !cabivel ? 'incabivel' : dolosoNaoEspecifico ? 'condicional' : 'cabivel',
      resumo: !dentroPena
        ? `Pena concreta superior a ${formatPena(limite)}.`
        : !semViolencia
          ? 'Crime doloso com violência ou grave ameaça.'
          : especifico
            ? 'Reincidência específica.'
            : dolosoNaoEspecifico
              ? 'Reincidente em crime doloso: depende de a substituição ser socialmente recomendável (art. 44, §3º).'
              : viaCulposo
                ? 'Crime culposo: substituição cabível qualquer que seja a pena.'
                : `Pena concreta ≤ ${formatPena(limite)}, crime sem violência/grave ameaça.`,
```

(Os `detalhes` e o `limiar` que seguem ficam como estão; apague as linhas `const naoVedado = …` e `const cabivel = dentroPena && semViolencia && naoVedado;` antigas.)

**Sursis da pena** — troque

```ts
    const naoVedado = !bool(p, 'vedadoReincidente') || !reincidenteEspecifico(c);
    const cabivel = c.penaConcreta <= limite && naoVedado;
    const cabivelEtario = c.penaConcreta <= limiteEtario;
```
por
```ts
    // Art. 77, I, CP: "não seja reincidente em crime doloso". O §2º (etário e
    // humanitário) amplia só o teto de pena; os requisitos do caput continuam.
    const naoVedado = !bool(p, 'vedadoReincidente') || !reincidenteEmDoloso(c);
    const cabivel = c.penaConcreta <= limite && naoVedado;
    const cabivelEtario = c.penaConcreta <= limiteEtario && naoVedado;
```

e, no `resumo`, troque o último ramo `: 'Pena concreta acima do limite do sursis.',` por

```ts
          : !naoVedado
            ? 'Reincidente em crime doloso (art. 77, I).'
            : 'Pena concreta acima do limite do sursis.',
```

**Regime** — nas duas linhas do cálculo, troque `reincidenteEspecifico(c)` por `ehReincidente(c)`:

```ts
    else if (c.penaConcreta > pisoSemi) regime = ehReincidente(c) ? 'Fechado' : 'Semiaberto';
    else regime = ehReincidente(c) ? 'Semiaberto' : 'Aberto';
```

**Livramento** — no ramo da fração, troque `} else if (reincidenteEspecifico(c)) {` por `} else if (reincidenteEmDoloso(c)) {`. A vedação do inciso V (`c.hediondo && reincidenteEspecifico(c)`) fica como está.

**Saída temporária** — troque as duas ocorrências de `reincidenteEspecifico(c)` por `ehReincidente(c)` (na `fracao` e no texto `'reincidente' : 'primário'`).

**Prescrição** — troque

```ts
    const concreta = c.penaConcreta > 0 ? prazo(c.penaConcreta) : null;
```
por
```ts
    const concreta = c.penaConcreta > 0 ? prazo(c.penaConcreta) : null;
    // Art. 110, caput, CP: depois do trânsito em julgado, os prazos aumentam de um
    // terço se o condenado é reincidente. A pretensão punitiva não muda (Súmula 220, STJ).
    const aumento = ehReincidente(c) ? num(p, 'aumentoReincidente') : 0;
    const executoria = concreta !== null && aumento > 0 ? concreta * (1 + aumento) : null;
```

e, nos `detalhes`, logo depois da linha da pena concreta, acrescente

```ts
        ...(executoria !== null
          ? [`Executória, reincidente: ${formatPena(concreta!)} aumentados de ${formatFracao(aumento)} → ${formatPena(executoria)} (art. 110).`]
          : []),
```

Os ramos da progressão e a ressalva do Título XII (`tituloXII && reincidenteEspecifico(c)`) ficam com `reincidenteEspecifico(c)`: é o que a spec manda (Tema 1084; progressão comum a conferir).

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run verificar`
Expected: `0 errors`; todas as âncoras novas em `✓`; nenhuma antiga regride.

- [ ] **Step 5: Quantos vereditos mudam (vai no commit)**

A premissa padrão é o primário: nenhum número publicado muda. O efeito aparece só quando se escolhe outra reincidência — por isso não há derivado a regravar aqui. Confirme:

Run: `npm run atributos && git status --short static/data/atributos.json`
Expected: nenhuma mudança no derivado.

- [ ] **Step 6: Commit**

```bash
git add src/lib/atributos/avaliadores.ts scripts/verificar_atributos.ts
git commit -m "atributos: cada lei le a reincidencia que pergunta

ANPP, regime, saida temporaria e prescricao executoria: qualquer
reincidente. Sursis, substituicao e livramento: reincidente em crime
doloso (o sursis etario tambem). Substituicao do reincidente em doloso
nao especifico vira condicional (art. 44, par. 3). A prescricao
executoria do reincidente ganha o terco do art. 110; a da pretensao
punitiva nao muda (Sumula 220, STJ). Progressao: sem mudanca (Tema 1084;
a dos crimes comuns fica a conferir).

A premissa padrao e o primario: nenhum numero publicado muda.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: A reincidência na interface e na URL

**Files:**
- Modify: `src/lib/atributos/premissa-url.ts`
- Modify: `src/components/premissa/ControlesPremissa.tsx`
- Modify: `src/components/ficha/estado.ts`
- Modify: `src/components/ficha/PainelConcreta.tsx`
- Test: `scripts/verificar_atributos.ts`, `scripts/verificar_pena.ts`

**Interfaces:**
- Consumes: `REINCIDENCIAS`, `ROTULO_REINCIDENCIA` (Task 1).
- Produces: `EstadoFicha.reincidencia: Reincidencia` (substitui `reincidente: boolean`); URL `reu=culposo|doloso|especifico` nas duas fichas e na simulação.

- [ ] **Step 1: Os testes de URL que falham**

Em `scripts/verificar_atributos.ts`, no bloco `console.log('\nPremissa da varredura na URL');`, acrescente antes do `}` que o fecha:

```ts
  const culposo = new URLSearchParams();
  escreverPremissa(culposo, {...padrao, reincidencia: 'culposo'});
  ok(culposo.get('reu') === 'culposo', 'a reincidência vai na chave reu');
  ok(culposo.get('reincidente') === null, 'a chave antiga não é mais escrita');
  ok(lerPremissa(new URLSearchParams('reu=doloso')).reincidencia === 'doloso', 'reu=doloso volta');
  ok(lerPremissa(new URLSearchParams('reincidente=sim')).reincidencia === 'especifico',
    'link antigo: reincidente=sim continua sendo o específico');
  ok(lerPremissa(new URLSearchParams('reu=inventado')).reincidencia === 'primario', 'reu fora do vocabulário cai no primário');
```

E troque, no mesmo bloco, a asserção `ok(q.get('reincidente') === 'sim', 'grava reincidente=sim');` por `ok(q.get('reu') === 'especifico', 'grava reu=especifico');`.

Em `scripts/verificar_pena.ts`, no fim (antes do `console.log(falhas === 0 …`), acrescente:

```ts
console.log('\nA reincidência na URL da ficha do tipo');
{
  const legal = {min: 360, max: 1440, concreta: 360};
  const e = {...ESTADO_LEGAL, modo: 'concreta' as const, reincidencia: 'doloso' as const};
  const s = escreverEstadoFicha(e, legal);
  ok(s.includes('reu=doloso'), `a ficha grava reu=doloso: ${s}`);
  ok(lerEstadoFicha('?reu=culposo').reincidencia === 'culposo', 'a ficha lê reu=culposo');
  ok(lerEstadoFicha('?reincidente=sim').reincidencia === 'especifico', 'link antigo da ficha: reincidente=sim é o específico');
  ok(escreverEstadoFicha(ESTADO_LEGAL, legal) === '', 'o primário não suja a URL da ficha');
}
```

com o import no topo:

```ts
import {ESTADO_LEGAL, escreverEstado as escreverEstadoFicha, lerEstado as lerEstadoFicha} from '../src/components/ficha/estado';
```

Antes de escrever o import, confirme os nomes exportados: `grep -n "^export function" src/components/ficha/estado.ts` — se a leitura se chamar de outro jeito, use o nome real.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run verificar`
Expected: FAIL de compilação (`reincidencia` não existe em `EstadoFicha`) e, depois de corrigido isso, as asserções de `reu=`.

- [ ] **Step 3: A URL da premissa**

Em `src/lib/atributos/premissa-url.ts`:

```ts
import type {Reincidencia} from '../types';

/** Os estados que a URL grava; o primário é o padrão e não se grava. */
const REUS: Reincidencia[] = ['culposo', 'doloso', 'especifico'];
```

Em `lerPremissa`, troque a linha da Task 1 (`rev.reincidencia = q.get('reincidente') === 'sim' ? …`) por:

```ts
  const reu = q.get('reu') as Reincidencia | null;
  // `reincidente=sim` é a chave de antes de 19/09/2026, quando só havia o
  // específico: um link citado não muda de sentido.
  rev.reincidencia = reu && REUS.includes(reu) ? reu : q.get('reincidente') === 'sim' ? 'especifico' : 'primario';
```

Em `escreverPremissa`, troque `if (rev.reincidencia === 'especifico') q.set('reincidente', 'sim');` por:

```ts
  if (rev.reincidencia !== 'primario') q.set('reu', rev.reincidencia);
```

Atualize o comentário de cabeçalho do arquivo: troque `//   ?base=maxima&reincidente=sim` por `//   ?base=maxima&reu=doloso`.

- [ ] **Step 4: O seletor da premissa**

Em `src/components/premissa/ControlesPremissa.tsx`, remova o chip "reincidente específico" da Task 1 e acrescente, logo antes de `<div className={s.circunstancias}>`:

```tsx
      <div className={s.bases} role="group" aria-label="Reincidência presumida">
        <span className={s.rotuloBases}>Réu:</span>
        {REINCIDENCIAS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={rev.reincidencia === r}
            className={`${s.base} ${rev.reincidencia === r ? s.baseAtiva : ''}`}
            onClick={() => onChange({reincidencia: r})}
          >
            {ROTULO_REINCIDENCIA[r]}
          </button>
        ))}
      </div>
```

com `import {REINCIDENCIAS, ROTULO_REINCIDENCIA} from '../../lib/atributos/reincidencia';`. O seletor aparece também nos atributos abstratos (fora do `mostrarBase`): a reincidência pesa na ANPP, que é abstrata.

- [ ] **Step 5: A ficha do tipo**

Em `src/components/ficha/estado.ts`:
- `import type {Reincidencia} from '../../lib/types';`
- no comentário de cabeçalho, troque `reincidente=sim` por `reu=doloso`;
- na interface, troque `reincidente: boolean;` por `reincidencia: Reincidencia;`;
- em `ESTADO_LEGAL`, troque `reincidente: false,` por `reincidencia: 'primario',`;
- na leitura, troque `reincidente: sim(q.get('reincidente')),` por
  ```ts
      reincidencia: (['culposo', 'doloso', 'especifico'] as const).includes(q.get('reu') as never)
        ? (q.get('reu') as Reincidencia)
        : sim(q.get('reincidente'))
          ? 'especifico'
          : 'primario',
  ```
- na escrita, troque `if (e.reincidente) q.set('reincidente', 'sim');` por `if (e.reincidencia !== 'primario') q.set('reu', e.reincidencia);`.

Em `src/components/ficha/PainelConcreta.tsx`:
- a linha da Task 1 vira `reincidencia: e.reincidencia,`;
- no array de dependências do `useMemo`, troque `e.reincidente` por `e.reincidencia`;
- troque o array das pílulas e o `map` por:
  ```tsx
            {REINCIDENCIAS.map((r) => (
              <label key={r} className={`${s.pilula} ${e.reincidencia === r ? s.pilulaAtiva : ''}`}>
                <input
                  type="radio"
                  name="reincidencia"
                  className="sr-only"
                  checked={e.reincidencia === r}
                  onChange={() => atualizar({reincidencia: r})}
                />
                {ROTULO_REINCIDENCIA[r]}
              </label>
            ))}
  ```
  com o import de `REINCIDENCIAS` e `ROTULO_REINCIDENCIA`;
- atualize o comentário da linha 8 (`// O perfil tem o que o motor distingue, e nada além: primário ou reincidente`) para dizer os quatro estados.

Procure outros leitores de `e.reincidente`: `grep -rn "\.reincidente\b\|reincidente:" src/components/ficha` — troque cada um por `reincidencia`.

- [ ] **Step 6: Rodar e ver passar**

Run: `npm run typecheck && npm run verificar && npm run build`
Expected: `0 errors`, todas verdes, build com o número de páginas de antes.

- [ ] **Step 7: Na tela**

Com o servidor (`atlaspen-revamp` em `Projetos/.claude/launch.json`):
1. `/sispenas/tipos/<id do furto simples>?modo=concreta` — as quatro pílulas; "reincidente em crime doloso" põe a substituição em "depende" e a URL ganha `reu=doloso`.
2. `/sispenas/atributos/anpp` — o seletor "Réu:" aparece; "reincidente em crime culposo" derruba o alcance.
3. `/sispenas/atributos/anpp?reincidente=sim` — abre com "reincidente específico" marcado.
4. `/sispenas/simulacao` — o seletor aparece no bloco da premissa, e o recorte diz a reincidência escolhida.

- [ ] **Step 8: Commit**

```bash
git add src/lib/atributos/premissa-url.ts src/components/premissa src/components/ficha scripts/verificar_atributos.ts scripts/verificar_pena.ts
git commit -m "feat: o reu em quatro estados, nas duas fichas e na simulacao

A URL grava reu=culposo|doloso|especifico; reincidente=sim, a chave de
antes, continua lida como o especifico, para link citado nao mudar de
sentido.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: O módulo da remissão

Funções puras, testadas sobre um catálogo fictício. Nada ainda as usa.

**Files:**
- Modify: `src/lib/types.ts` (`TipoDoMotor` ganha `pena_por_remissao`)
- Create: `src/lib/atributos/remissao.ts`
- Create: `scripts/verificar_remissao.ts`
- Modify: `package.json` (script `verificar`)
- Modify: `src/lib/simulacao/motor.ts` (`montarTipo` grava `pena_por_remissao: null`)
- Modify: `scripts/verificar_simulacao.ts` (helper `tipo()` grava `pena_por_remissao: null`)

**Interfaces:**
- Produces, em `src/lib/atributos/remissao.ts`:
  ```ts
  export interface Origem {tipo: TipoDoMotor; penaMin: number; penaMax: number}
  export function fracaoDe(texto: string | null): number
  export function origensDaRemissao(tipo: TipoDoMotor, catalogo: readonly TipoDoMotor[]): Origem[]
  export function avaliarTipo(
    def: AtributoDef, params: Parametros, tipo: TipoDoMotor,
    catalogo: readonly TipoDoMotor[], montar: (t: TipoDoMotor) => Cenario,
  ): AtributoResultado
  ```
  `montar` é quem transforma um tipo em cenário: `(t) => cenarioParaCrime(t, rev)` na varredura e na simulação, `cenarioFromCrime` na ficha. (A spec punha `avaliarTipo` em `nucleo.ts`; ele fica em `remissao.ts` porque `nucleo.ts` não pode importar `remissao.ts` sem ciclo.)

- [ ] **Step 1: O teste que falha**

Crie `scripts/verificar_remissao.ts`:

```ts
/**
 * A pena por remissão, sobre um catálogo FICTÍCIO: o tipo que não comina
 * moldura própria é avaliado contra cada dispositivo de origem, e o veredito é o
 * comum, ou "condicional" com uma linha por origem.
 *
 * Uso: npm run verificar
 */

import type {Cenario, TipoDoMotor} from '../src/lib/types';
import type {AtributoDef} from '../src/lib/atributos/types';
import {num} from '../src/lib/atributos/types';
import {cenarioFromCrime} from '../src/lib/cenario';
import {avaliarTipo, fracaoDe, origensDaRemissao} from '../src/lib/atributos/remissao';

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    falhas += 1;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
};

const tipo = (id: number, artigo: string, crime: string, min: number, max: number, extra: Partial<TipoDoMotor> = {}): TipoDoMotor => ({
  id, lei: 'LF', artigo, crime,
  pena_min_meses: min, pena_max_meses: max, pena_faixa_rotulo: '',
  hediondo: 'Não', resultado_morte: false, violencia: 'Não', grave_ameaca: 'Não',
  elemento: 'Doloso', tentativa: 'Sim', perdao_judicial_previsto: false,
  contravencao: false, tem_pena_privativa: true, pena_por_remissao: null,
  ...extra,
});
const remissao = (artigos: string[], operador: 'nenhum' | 'aumento' | 'diminuicao', fracao: string | null) => ({
  dispositivo_fonte: `LF, ${artigos.join(', ')}`, lei_fonte: 'LF', artigos_fonte: artigos, operador, fracao,
});

const F1 = tipo(1, 'Art. 1º', 'Falsificação A', 24, 72);
const F2 = tipo(2, 'Art. 2º', 'Falsificação B', 12, 60);
const F2q = tipo(3, 'Art. 2º, §1º', 'Falsificação B qualificada', 24, 60);
const USO = tipo(4, 'Art. 3º', 'Uso', 0, 0, {pena_por_remissao: remissao(['Art. 1º', 'Art. 2º'], 'nenhum', null)});
const METADE = tipo(5, 'Art. 4º', 'Metade', 0, 0, {pena_por_remissao: remissao(['Art. 1º'], 'diminuicao', '1/2'), hediondo: 'Sim'});
const catalogo = [F1, F2, F2q, USO, METADE];

const teto: AtributoDef = {
  id: 'teto', nome: 'Teto fictício', fundamento: 'Lei inventada', categoria: 'processual', natureza: 'abstrato',
  descricao: '', requisitos: [], vedacoes: [],
  parametros: [{id: 'tetoMeses', rotulo: '', tipo: 'meses', padrao: 60, ajuda: ''}],
  avaliar: (c, p) => ({status: c.penaMax <= num(p, 'tetoMeses') ? 'cabivel' : 'incabivel', resumo: '', detalhes: []}),
};
const vistos: Cenario[] = [];
const espiao: AtributoDef = {...teto, id: 'espiao', avaliar: (c) => (vistos.push(c), {status: 'cabivel', resumo: '', detalhes: []})};
const montar = (t: TipoDoMotor) => cenarioFromCrime(t);

console.log('\nAs frações');
ok(fracaoDe('1/2') === 0.5 && fracaoDe('1/3') === 1 / 3 && fracaoDe(null) === 0, '1/2, 1/3 e nenhuma');

console.log('\nAs origens');
{
  const o = origensDaRemissao(USO, catalogo);
  ok(o.map((x) => x.tipo.id).join(',') === '1,2,3', 'o art. 3º acha os três registros dos arts. 1º e 2º, com o parágrafo');
  const m = origensDaRemissao(METADE, catalogo);
  ok(m.length === 1 && m[0].penaMin === 12 && m[0].penaMax === 36, 'diminuição de metade: 24–72 vira 12–36');
  ok(origensDaRemissao(F1, catalogo).length === 0, 'tipo sem remissão não tem origem');
}

console.log('\nA junção');
{
  const r = avaliarTipo(teto, {tetoMeses: 60}, USO, catalogo, montar);
  ok(r.status === 'condicional', 'origens divergem (72 passa do teto; 60 não): condicional');
  ok(r.resumo === 'Depende da origem da pena.', 'o resumo diz por quê');
  ok(r.detalhes.length === 3 && r.detalhes.some((d) => /Art\. 1º.*não cabe/.test(d)), 'uma linha por origem, com o veredito dela');

  const todas = avaliarTipo(teto, {tetoMeses: 100}, USO, catalogo, montar);
  ok(todas.status === 'cabivel', 'origens concordam: o veredito comum');

  const sem = avaliarTipo(teto, {tetoMeses: 60}, F1, catalogo, montar);
  ok(sem.status === 'incabivel', 'tipo sem remissão segue o caminho de sempre');
}

console.log('\nNinguém avalia pena zero');
{
  vistos.length = 0;
  avaliarTipo(espiao, {}, METADE, catalogo, montar);
  ok(vistos.length === 1 && vistos[0].penaMax === 36, 'o cenário de remissão tem a moldura da origem, não zero');
  ok(vistos[0].hediondo === true, 'e os campos do tipo que remete (a hediondez é dele)');
}

console.log(falhas === 0 ? '\n✓ Pena por remissão verificada.\n' : `\n✗ ${falhas} falha(s) na remissão.\n`);
process.exit(falhas === 0 ? 0 : 1);
```

Em `package.json`, no script `verificar`, acrescente `&& node .verificar-build/scripts/verificar_remissao.js` ao fim.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run verificar`
Expected: FAIL de compilação — `remissao` não existe e `TipoDoMotor` não tem `pena_por_remissao`.

- [ ] **Step 3: `TipoDoMotor` e o módulo**

Em `src/lib/types.ts`, acrescente `| 'pena_por_remissao'` à lista do `Pick` de `TipoDoMotor`, depois de `| 'tem_pena_privativa'`.

Em `src/lib/simulacao/motor.ts`, na função que monta o `TipoDoMotor` do tipo simulado (`montarTipo`, perto da linha 133, que grava `tem_pena_privativa: c.penaMaxDias > 0 || c.penaMinDias > 0,`), acrescente `pena_por_remissao: null,`. Em `scripts/verificar_simulacao.ts`, no helper `tipo()`, acrescente `pena_por_remissao: null,` depois de `tem_pena_privativa: true,`.

Crie `src/lib/atributos/remissao.ts`:

```ts
// A pena por remissão: o tipo que não comina moldura própria e importa a de
// outro dispositivo — art. 304 do CP ("a pena cominada à falsificação"), art. 315
// do CPM, arts. 2º e 3º da Lei 2.889/56.
//
// A moldura depende de qual origem incide no caso, e o catálogo não a inventa.
// Por isso o tipo é avaliado uma vez por origem, com a moldura dela, e o veredito
// é o comum às origens — ou "condicional", com uma linha por origem, quando elas
// divergem. Avaliá-lo com a própria moldura (zero) faria caber todo atributo que
// depende de teto de pena.
//
// O operador segue a convenção da dosimetria, a mesma de data/modificadores.json:
// "diminui-se de f" multiplica por (1 − f); "aumenta-se de f", por (1 + f).

import type {Cenario, TipoDoMotor} from '../types';
import type {AtributoDef, AtributoResultado, Parametros} from './types';
import {avaliarAtributo} from './nucleo';

export interface Origem {
  tipo: TipoDoMotor;
  /** Moldura da origem já transformada pelo operador da remissão, em meses. */
  penaMin: number;
  penaMax: number;
}

/** "1/2" → 0,5. `null` ou texto fora do formato → 0. */
export function fracaoDe(texto: string | null): number {
  const m = /^(\d+)\/(\d+)$/.exec((texto ?? '').trim());
  return m ? Number(m[1]) / Number(m[2]) : 0;
}

export function origensDaRemissao(tipo: TipoDoMotor, catalogo: readonly TipoDoMotor[]): Origem[] {
  const r = tipo.pena_por_remissao;
  if (!r) return [];
  const f = fracaoDe(r.fracao);
  const fator = r.operador === 'aumento' ? 1 + f : r.operador === 'diminuicao' ? 1 - f : 1;
  return catalogo
    .filter(
      (x) =>
        x.id !== tipo.id &&
        x.lei === r.lei_fonte &&
        (r.artigos_fonte ?? []).some((a) => (x.artigo ?? '').startsWith(a)) &&
        !x.pena_por_remissao,
    )
    .map((x) => ({tipo: x, penaMin: x.pena_min_meses * fator, penaMax: x.pena_max_meses * fator}));
}

const ROTULO: Record<string, string> = {cabivel: 'cabe', condicional: 'depende', incabivel: 'não cabe'};

/**
 * Um tipo do catálogo avaliado por um atributo. É o ponto de entrada de toda
 * avaliação de tipo — varredura, simulação, ficha e derivação —, para que nenhuma
 * leia a pena zero de um tipo de remissão.
 */
export function avaliarTipo(
  def: AtributoDef,
  params: Parametros,
  tipo: TipoDoMotor,
  catalogo: readonly TipoDoMotor[],
  montar: (t: TipoDoMotor) => Cenario,
): AtributoResultado {
  if (!tipo.pena_por_remissao) return avaliarAtributo(def, montar(tipo), params);
  const origens = origensDaRemissao(tipo, catalogo);
  if (!origens.length) {
    // O validador do catálogo (validar_pena_por_remissao) impede remissão para o
    // vazio; se ela chegar aqui, a resposta honesta é não afirmar nada.
    return {...avaliarAtributo(def, montar(tipo), params), status: 'condicional', resumo: 'Origem da pena não encontrada no catálogo.', detalhes: []};
  }
  const resultados = origens.map((o) => ({
    o,
    r: avaliarAtributo(def, montar({...tipo, pena_min_meses: o.penaMin, pena_max_meses: o.penaMax}), params),
  }));
  const [primeiro] = resultados;
  const concordam = resultados.every(
    ({r}) => r.status === primeiro.r.status && (r.valor ?? '') === (primeiro.r.valor ?? ''),
  );
  if (concordam) return primeiro.r;
  return {
    ...primeiro.r,
    status: 'condicional',
    resumo: 'Depende da origem da pena.',
    detalhes: resultados.map(({o, r}) => `${o.tipo.artigo} (${o.tipo.crime}): ${ROTULO[r.status]}${r.valor ? ` · ${r.valor}` : ''}`),
    valor: undefined,
    limiar: undefined,
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run typecheck && npm run verificar`
Expected: `0 errors`; `✓ Pena por remissão verificada.` Se o typecheck acusar outros literais de `TipoDoMotor` sem `pena_por_remissao` (em `scripts/` ou `src/`), acrescente `pena_por_remissao: null` neles.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/atributos/remissao.ts src/lib/simulacao/motor.ts scripts/verificar_remissao.ts scripts/verificar_simulacao.ts package.json
git commit -m "feat: a pena por remissao avaliada por origem

Modulo puro, testado num catalogo ficticio: o tipo que nao comina moldura
propria e avaliado com a moldura de cada origem (com o operador da
remissao), e o veredito e o comum, ou 'depende da origem da pena' com uma
linha por origem. Ainda nao ligado ao resto.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: A remissão ligada ao motor, ao derivado e à documentação

**Files:**
- Modify: `scripts/transform_data.py` (derivação de `tem_pena_privativa` e rótulo)
- Modify: `src/pages/atributos/tipos.json.ts` (`paraOMotor`)
- Modify: `src/lib/atributos/reverso.ts` (`avaliarCatalogo`, e o comentário de `crimesComPenaPrivativa`)
- Modify: `src/lib/simulacao/motor.ts` (`avaliarEstado`, `problemaDa`)
- Modify: `scripts/derivar_atributos.ts`, `scripts/equivalencia_atributos.ts`
- Modify: `docs/dados-abertos.md:80` (só esta linha; o arquivo tem modificação do mantenedor), `docs/catalogo-tipos-penais.md:49`
- Modify: `src/lib/types.ts` (comentário de `tem_pena_privativa`)
- Test: `scripts/verificar_atributos.ts`
- Regenerate: `static/data/crimes.json`, `static/data/qualidade.json`, `static/data/atributos.json`

**Interfaces:**
- Consumes: `avaliarTipo` (Task 5).
- Produces: `avaliarCatalogo(def, params, crimes, rev, catalogo?)` — o quinto parâmetro, opcional, é o catálogo onde se procuram as origens (padrão: `crimes`).

- [ ] **Step 1: A âncora do catálogo real que falha**

Em `scripts/verificar_atributos.ts`, depois das âncoras da Task 3, acrescente:

```ts
    // ── A pena por remissão, no catálogo real (A2, spec 2) ──────────────────
    const uso = achar(/^CP$/i, /^Art\. 304/);
    ok(!!uso, 'o art. 304 do CP está entre os tipos com pena privativa');
    if (uso) {
      const molduras: number[] = [];
      const transacao = avaliarTipo(def('transacao'), valoresPadrao(def('transacao')), uso, todos, (t) => {
        molduras.push(t.pena_max_meses);
        return cenarioFromCrime(t);
      });
      ok(molduras.length > 1 && molduras.every((m) => m > 0),
        `o art. 304 é avaliado com a moldura de cada falsificação, nunca com zero (${molduras.join(', ')})`);
      // Os arts. 301 e 302 (até 1 ano) são de menor potencial ofensivo; o 297 (2 a 6
      // anos), não. A transação depende de qual falsificação foi usada.
      ok(transacao.status === 'condicional' && transacao.detalhes.length > 1,
        `uso de documento falso: transação "depende", uma linha por origem (obtido ${transacao.status})`);
    }
    const genocidio = achar(/2\.889/, /^Art\. 2º/);
    ok(!!genocidio && genocidio.hediondo === 'Sim', 'a associação para genocídio (Lei 2.889/56, art. 2º) é hedionda no catálogo');
    if (genocidio) {
      const cenarios: Cenario[] = [];
      avaliarTipo(def('livramento'), valoresPadrao(def('livramento')), genocidio, todos, (t) => {
        const c = {...cenarioFromCrime(t), penaConcreta: 120};
        cenarios.push(c);
        return c;
      });
      ok(cenarios.length > 0 && cenarios.every((c) => c.hediondo),
        'associação para genocídio: toda origem avaliada como hedionda — o campo é do tipo que remete');
    }
```

Os nomes `def` e `achar` são os do bloco da Task 3; se estas âncoras ficarem fora do `if (furtoR)`, declare `const def = (id: string) => CATALOGO.find((b) => b.id === id)!;` antes delas. `achar` procura em `crimes` (os com pena privativa): antes da troca do Step 3, o art. 304 não está lá.

Acrescente ao topo: `import {avaliarTipo} from '../src/lib/atributos/remissao';`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run verificar`
Expected: FAIL em `o art. 304 do CP está entre os tipos com pena privativa`.

- [ ] **Step 3: A derivação**

Em `scripts/transform_data.py`, troque

```python
        c["tem_pena_privativa"] = bool(pmax or c["pena_min_meses"])
```

por

```python
        # A pena por remissão É privativa: a do dispositivo de origem, que o motor
        # aplica origem a origem (src/lib/atributos/remissao.ts). Sem esta marca o
        # tipo saía de toda a varredura; com moldura zero, cabia em todo teto.
        c["tem_pena_privativa"] = bool(pmax or c["pena_min_meses"] or c.get("pena_por_remissao"))
```

e, logo abaixo, troque o bloco `if not c["tem_pena_privativa"]:` que grava `pena_faixa_rotulo` por:

```python
        if c.get("pena_por_remissao"):
            c["pena_faixa_rotulo"] = "pena definida por remissão a outro dispositivo"
        elif not c["tem_pena_privativa"]:
            # Sem moldura não há número a prefixar com "pena:", e o rótulo passa
            # a ser a frase inteira do cabeçalho — por isso ele se basta e não
            # repete a palavra "pena".
            c["pena_faixa_rotulo"] = "sem pena privativa de liberdade"
```

Em `validar_pena_por_remissao`, depois do `elif not alvos:`, acrescente o ramo que garante que toda origem tem moldura:

```python
        elif any(not (x.get("pena_max") or x.get("pena_min")) for x in alvos):
            problemas.append(
                f"id {c['id']}: alguma origem de `pena_por_remissao` não tem moldura "
                "própria — a remissão tem de chegar a uma pena")
```

Atualize o docstring do topo do arquivo (linha 14, `tem_pena_privativa : bool (comina prisão? …)`) para: `tem_pena_privativa : bool (comina prisão, própria ou por remissão? entra nas estatísticas de alcance?)`.

Run: `python scripts/transform_data.py --estrito --max-contradicoes=0`
Expected: sucesso; `git diff --stat static/data/crimes.json` mostra mudança só em 4 registros (ids 237, 556, 557, 1185).

- [ ] **Step 4: O ponto de entrada em todo lugar**

`src/pages/atributos/tipos.json.ts`, em `paraOMotor`, acrescente `pena_por_remissao: c.pena_por_remissao,` depois de `tem_pena_privativa`.

`src/lib/atributos/reverso.ts`:
- import: `import {avaliarTipo} from './remissao';`
- `avaliarCatalogo` passa a ser:
  ```ts
  export function avaliarCatalogo<T extends TipoDoMotor>(
    def: AtributoDef,
    params: Parametros,
    crimes: T[],
    rev: CenarioReverso,
    catalogo: readonly TipoDoMotor[] = crimes,
  ): LinhaReversa<T>[] {
    return crimes.map((crime) => ({
      crime,
      resultado: avaliarTipo(def, params, crime, catalogo, (t) => cenarioParaCrime(t, rev)),
    }));
  }
  ```
- o comentário de `crimesComPenaPrivativa` ("Hoje a única exceção é o art. 28…") passa a dizer: os tipos sem pena privativa são os punidos só com multa ou com outras penas (art. 28 da Lei 11.343/06); a pena por remissão conta como privativa.

`src/lib/simulacao/motor.ts`:
- import: `import {avaliarTipo} from '../atributos/remissao';`
- em `avaliarEstado`, troque
  ```ts
      const pronto = base && tipoLegal!.get(t.id) === t ? base.get(t.id) : undefined;
      mapa.set(t.id, pronto ?? avaliarAtributo(a.def, cenarioParaCrime(t, rev), a.params));
  ```
  por
  ```ts
      // O tipo de remissão depende das origens, que o pacote pode ter mudado mesmo
      // sem tocá-lo: ele nunca é reaproveitado.
      const pronto = base && tipoLegal!.get(t.id) === t && !t.pena_por_remissao ? base.get(t.id) : undefined;
      mapa.set(t.id, pronto ?? avaliarTipo(a.def, a.params, t, e.tipos, (x) => cenarioParaCrime(x, rev)));
  ```
- em `problemaDa`, dentro de `if (m.op === 'modificar') {`, antes do cálculo de `c`, acrescente
  ```ts
      if (t.pena_por_remissao) return 'Este tipo não comina moldura própria: a pena é a do dispositivo de origem. Modifique a origem.';
  ```

`scripts/derivar_atributos.ts` — troque `avaliarAtributo(def, cenarioParaCrime(c, rev), params).status` por `avaliarTipo(def, params, c, crimes, (t) => cenarioParaCrime(t, rev)).status`, com o import de `avaliarTipo`.

`scripts/equivalencia_atributos.ts` — nos dois cenários de `CENARIOS`, a avaliação passa por `avaliarTipo` com `todos` como catálogo: onde o script chama `avaliarAtributo(def, montar(c), valoresPadrao(def))`, troque por `avaliarTipo(def, valoresPadrao(def), c, todos, montar)`. Localize com `grep -n "avaliarAtributo" scripts/equivalencia_atributos.ts`. O tipo de `CENARIOS` passa de `[string, (c: Crime) => Cenario][]` para `[string, (c: TipoDoMotor) => Cenario][]` (importe `TipoDoMotor` de `../src/lib/types`): `avaliarTipo` chama `montar` com um `TipoDoMotor` de moldura trocada.

Procure qualquer outra avaliação de tipo que escapou:

```bash
grep -rn "avaliarAtributo(" src scripts --include=*.ts --include=*.tsx --include=*.astro | grep -v "\.verificar-build\|remissao.ts\|nucleo.ts"
```

Expected: só `PainelConcreta` (via `calcularAtributos`, que só roda nos tipos com moldura própria — `calculavel` em `src/pages/tipos/[id].astro` exclui a remissão) e as âncoras de `scripts/verificar_atributos.ts` que usam tipos com moldura. Qualquer outro: troque por `avaliarTipo`.

- [ ] **Step 5: A documentação**

`docs/catalogo-tipos-penais.md:49` — troque a descrição de `pena_por_remissao` por:

```
| `pena_por_remissao` | Opcional. `{dispositivo_fonte, lei_fonte, artigos_fonte, operador, fracao}` quando o tipo não comina moldura própria e importa a de outro dispositivo — art. 304 do CP, "a pena cominada à falsificação". Incompatível com `pena_min`/`pena_max`. O operador segue a dosimetria: `diminuicao` com `1/3` multiplica a moldura de origem por 2/3; `aumento`, por 4/3. |
```

`docs/dados-abertos.md:80` — **só esta linha**. Troque o trecho "…e fica fora das estatísticas de alcance: a moldura depende de qual dispositivo-fonte incide no caso, e o catálogo não a inventa." por "…e o motor avalia o tipo com a moldura de cada dispositivo de origem: o veredito é o comum às origens, ou "depende" quando elas divergem. `tem_pena_privativa` é `true`, e o tipo entra nas estatísticas de alcance. O operador segue a dosimetria: `diminuicao` com `1/3` multiplica a moldura por 2/3; `aumento`, por 4/3." Na hora do commit, use `git add -p docs/dados-abertos.md` e aceite só o hunk desta linha.

`src/lib/types.ts` — o comentário de `tem_pena_privativa` ("A exceção é o art. 28…") passa a: "Própria ou por remissão (`pena_por_remissao`). Sem ela ficam os tipos punidos só com multa ou com outras penas."

- [ ] **Step 6: Rodar tudo**

Run: `npm run atributos && npm run typecheck && npm run verificar && npm run build && node scripts/verificar_rotas.mjs`
Expected: verde; a âncora do art. 304 passa; o derivado registra `tipos_avaliados: 1476`.

- [ ] **Step 7: Commit**

```bash
git add scripts/transform_data.py static/data/crimes.json static/data/qualidade.json static/data/atributos.json src/pages/atributos/tipos.json.ts src/lib/atributos/reverso.ts src/lib/simulacao/motor.ts scripts/derivar_atributos.ts scripts/equivalencia_atributos.ts scripts/verificar_atributos.ts docs/catalogo-tipos-penais.md src/lib/types.ts
git add -p docs/dados-abertos.md
git commit -m "atributos: os quatro tipos de remissao entram na varredura

CP 304, Lei 2.889/56 arts. 2 e 3 e CPM 315 passam a ter pena privativa -
a da origem - e sao avaliados por origem em todo lugar: varredura,
simulacao, derivacao e equivalencia. 1.472 -> 1.476 cenarios. Na
simulacao, o tipo de remissao nao se modifica (modifique a origem) e nunca
e reaproveitado entre catalogos, porque a origem pode ter mudado.

O operador da remissao fica escrito nos dados abertos: e o da dosimetria.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Os tipos só com multa, e a ANPP quando cabe transação

**Files:**
- Modify: `data/atributos.json` (campo `alcanca_sem_pena_privativa` em todos; `fundamento_sem_pena_privativa` nos quatro; parâmetro novo da ANPP)
- Modify: `scripts/validar_atributos.py`
- Modify: `src/lib/atributos/carregador.ts`, `src/lib/atributos/types.ts`
- Modify: `src/lib/types.ts` (`Cenario.semPenaPrivativa`), `src/lib/cenario.ts`
- Modify: `src/lib/atributos/avaliadores.ts` (`anpp`, `prescricao`)
- Test: `scripts/verificar_atributos.ts`

**Interfaces:**
- Produces:
  - `AtributoDef.alcancaSemPenaPrivativa: boolean` e `AtributoDef.fundamentoSemPenaPrivativa?: string`
  - `Cenario.semPenaPrivativa: boolean` (de `!tem_pena_privativa`) e `Cenario.multaIsolada: boolean` (sem pena privativa e `tipo_pena === 'Multa'`)
  - `TipoDoMotor` ganha `tipo_pena` (o motor precisa distinguir multa isolada de "outras penas")
  - parâmetro `vedadoSeCabeTransacao` (booleano) e `tetoMenorPotencialMeses` (meses, 24) na ANPP.

A vedação do §2º, I, da ANPP vale para **toda** infração de menor potencial ofensivo, e não só para os tipos só com multa: o avaliador de hoje não a aplica em tipo nenhum. O efeito é mudar a ANPP de "cabe"/"depende" para "não cabe" nos tipos com pena máxima de até 2 anos e nas contravenções. O Step 7 conta quantos.

- [ ] **Step 1: As âncoras que falham**

Em `scripts/verificar_atributos.ts`, depois das âncoras da Task 6:

```ts
    // ── Só multa, e a ANPP quando cabe transação (A2, spec 3) ───────────────
    // O bullying está no catálogo com a lei que o incluiu (Lei 14.811/24) e o artigo
    // do CP no rótulo: "Art. 146-A, caput (CP)".
    const bullying = todos.find((c) => /^Art\. 146-A, caput/.test(c.artigo));
    ok(!!bullying && !bullying.tem_pena_privativa, 'o bullying (CP, art. 146-A) é só multa');
    if (bullying) {
      const c = cenarioFromCrime(bullying);
      ok(c.semPenaPrivativa === true && c.multaIsolada === true, 'o cenário sabe que o tipo é só multa');
      const t = avaliarAtributo(def('transacao'), c, valoresPadrao(def('transacao')));
      ok(t.status === 'cabivel', 'bullying: transação cabível (Lei 9.099/95, art. 61, "cumulada ou não com multa")');
      const p = avaliarAtributo(def('prescricao'), c, valoresPadrao(def('prescricao')));
      ok(p.valor === formatPena(24), `bullying: prescrição da multa isolada em 2 anos (CP, art. 114, I) — obtido ${p.valor}`);
      const a = avaliarAtributo(def('anpp'), c, valoresPadrao(def('anpp')));
      ok(a.status === 'incabivel' && /transação/.test(a.resumo), 'bullying: ANPP incabível porque cabe transação (CPP, art. 28-A, §2º, I)');
    }
    // "Outras penas" não é multa isolada: o art. 114, I, não é dele.
    const preconceito = todos.find((c) => /7\.437/.test(c.lei) && /^Art\. 8º/.test(c.artigo));
    if (preconceito) {
      const c = cenarioFromCrime(preconceito);
      ok(c.semPenaPrivativa === true && c.multaIsolada === false, 'Lei 7.437/85, art. 8º: sem pena privativa, e não é multa');
      const p = avaliarAtributo(def('prescricao'), c, valoresPadrao(def('prescricao')));
      ok(p.status === 'condicional' && p.valor === undefined,
        `Lei 7.437/85, art. 8º: a prescrição depende da sanção, sem prazo inventado (obtido ${p.status} ${p.valor})`);
    }
    const domicilio = achar(/^CP$/i, /^Art\. 150, caput/);
    if (domicilio) {
      const a = avaliar(def('anpp'), domicilio, {});
      ok(a.status === 'incabivel', `violação de domicílio (menor potencial): ANPP incabível, cabe transação (obtido ${a.status})`);
    }
    const alcancam = CATALOGO.filter((d) => d.alcancaSemPenaPrivativa).map((d) => d.id).sort().join(',');
    ok(alcancam === 'anpp,prescricao,sursis-processual,transacao', `os quatro atributos que alcançam tipo sem pena privativa (obtido ${alcancam})`);
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run verificar`
Expected: FAIL de compilação (`semPenaPrivativa`, `alcancaSemPenaPrivativa`).

- [ ] **Step 3: O dado**

```bash
python - <<'PY'
import json
p = 'data/atributos.json'
d = json.loads(open(p, 'rb').read().decode('utf-8').replace('\r\n', '\n'))
FUND = {
    'transacao': 'Art. 61, Lei 9.099/95: infração de menor potencial ofensivo é o crime com pena máxima não superior a 2 anos, "cumulada ou não com multa".',
    'sursis-processual': 'Art. 89, Lei 9.099/95: alcança o crime com pena mínima cominada igual ou inferior a um ano, e a multa isolada está nesse patamar.',
    'anpp': 'Art. 28-A, §2º, I, CPP: não cabe quando for cabível transação penal — o que ocorre no tipo só com multa.',
    'prescricao': 'Art. 114, I, CP: a multa única cominada prescreve em 2 anos. As demais sanções não privativas têm regra própria, e a ficha diz "depende".',
}
for a in d['atributos']:
    a['alcanca_sem_pena_privativa'] = a['slug'] in FUND
    if a['slug'] in FUND:
        a['fundamento_sem_pena_privativa'] = FUND[a['slug']]
anpp = next(a for a in d['atributos'] if a['slug'] == 'anpp')
transacao = next(a for a in d['atributos'] if a['slug'] == 'transacao')
teto = next(q for q in transacao['parametros'] if q['id'] == 'limiteMaxMeses')
anpp['parametros'] += [
    {'id': 'vedadoSeCabeTransacao', 'rotulo': 'Vedar quando cabe transação', 'tipo': 'booleano', 'padrao': True,
     'ajuda': 'Art. 28-A, §2º, I: o acordo não se aplica se for cabível transação penal de competência dos Juizados Especiais Criminais.',
     'redacoes': [{'fonte': {'dispositivo': 'cpp|art. 28-a, §2º, i'}, 'norma': 'Lei nº 13.964', 'fundamento': 'Art. 28-A, §2º, I, CPP'}]},
    {'id': 'tetoMenorPotencialMeses', 'rotulo': 'Teto do menor potencial ofensivo', 'tipo': 'meses', 'padrao': teto['padrao'],
     'min': teto['min'], 'max': teto['max'], 'passo': teto['passo'],
     'ajuda': 'O mesmo teto da transação penal (art. 61, Lei 9.099/95): até ele, cabe transação, e por isso não cabe o acordo.',
     'redacoes': json.loads(json.dumps(teto['redacoes']))},
]
open(p, 'wb').write((json.dumps(d, ensure_ascii=False, indent=2) + '\n').replace('\n', '\r\n').encode('utf-8'))
print('ok')
PY
```

Em `scripts/validar_atributos.py`, dentro do laço `for a in base["atributos"]:`, depois da checagem de `nome/fundamento/descricao`:

```python
        if not isinstance(a.get("alcanca_sem_pena_privativa"), bool):
            erros.append(f"{onde}: alcanca_sem_pena_privativa tem de ser true/false")
        elif a["alcanca_sem_pena_privativa"] and not a.get("fundamento_sem_pena_privativa"):
            erros.append(f"{onde}: alcança tipo sem pena privativa sem dizer o fundamento")
```

Run: `python scripts/validar_atributos.py`
Expected: `✓ atributos.json: 22 atributos, 77 parâmetros`.

- [ ] **Step 4: O contrato e o carregador**

`src/lib/atributos/types.ts`, em `AtributoDef`, depois de `vedacoes: string[];`:

```ts
  /** O atributo alcança tipo sem pena privativa (só multa, outras penas)? */
  alcancaSemPenaPrivativa: boolean;
  /** Por quê, quando alcança: o dispositivo que o diz. */
  fundamentoSemPenaPrivativa?: string;
```

`src/lib/atributos/carregador.ts`, em `AtributoFonte`, acrescente `alcanca_sem_pena_privativa: boolean;` e `fundamento_sem_pena_privativa?: string;`; em `montarCatalogo`, no objeto devolvido, depois de `vedacoes: a.vedacoes,`:

```ts
      alcancaSemPenaPrivativa: a.alcanca_sem_pena_privativa,
      ...(a.fundamento_sem_pena_privativa ? {fundamentoSemPenaPrivativa: a.fundamento_sem_pena_privativa} : {}),
```

O typecheck vai acusar todo `AtributoDef` montado à mão (`scripts/verificar_simulacao.ts`, `scripts/verificar_remissao.ts`, `scripts/verificar_injecao.ts`, `atributoNovo` em `src/lib/simulacao/motor.ts`): acrescente `alcancaSemPenaPrivativa: false` em cada um.

`src/lib/types.ts`, na `interface Cenario`, depois de `contravencao: boolean;` (e do comentário dela):

```ts
  /** O tipo não comina pena privativa (só multa, ou outras penas): lido de `tem_pena_privativa`. */
  semPenaPrivativa: boolean;
  /**
   * Sem pena privativa, e a sanção é só multa. É só a ela que o art. 114, I, do CP
   * dá o prazo de 2 anos: "outras penas" (Lei 7.437/85, art. 8º; Lei 11.343/06,
   * art. 28) têm regra própria, que o motor não calcula.
   */
  multaIsolada: boolean;
```

Ainda em `src/lib/types.ts`, acrescente `| 'tipo_pena'` à lista do `Pick` de `TipoDoMotor`.

`src/lib/cenario.ts`, depois de `contravencao: c.contravencao === true,`:

```ts
    semPenaPrivativa: c.tem_pena_privativa === false,
    multaIsolada: c.tem_pena_privativa === false && c.tipo_pena === 'Multa',
```

`src/pages/atributos/tipos.json.ts`, em `paraOMotor`, acrescente `tipo_pena: c.tipo_pena,`. O typecheck vai acusar os `TipoDoMotor` montados à mão: em `montarTipo` (`src/lib/simulacao/motor.ts`) grave `tipo_pena: c.penaMaxDias > 0 || c.penaMinDias > 0 ? 'Reclusão' : 'Multa',`; nos helpers `tipo()` de `scripts/verificar_simulacao.ts` e `scripts/verificar_remissao.ts`, `tipo_pena: 'Reclusão',` (e `'Multa'` onde o tipo fictício tem `tem_pena_privativa: false`).

- [ ] **Step 5: As duas regras**

**ANPP** — logo depois de `const confissaoOk = …`, acrescente:

```ts
    // Art. 28-A, §2º, I, CPP: não cabe se for cabível transação penal — a infração
    // de menor potencial ofensivo (contravenção, ou pena máxima até o teto do art.
    // 61 da Lei 9.099/95). Fora da Justiça Militar, onde a Lei 9.099/95 não se aplica.
    const cabeTransacao =
      bool(p, 'vedadoSeCabeTransacao') &&
      !c.justicaMilitar &&
      (c.contravencao || c.penaMax <= num(p, 'tetoMenorPotencialMeses'));
```

e, no encadeamento de `if`, logo depois do ramo `if (!dentroPena) {…}`, acrescente:

```ts
    } else if (cabeTransacao) {
      resumo = 'Cabe transação penal: o acordo não se aplica (art. 28-A, §2º, I).';
```

**Prescrição** — logo no início do avaliador, antes de `const fator = …`, acrescente os dois casos sem pena privativa:

```ts
    if (c.multaIsolada) {
      // Art. 114, I, CP: a multa única cominada prescreve em 2 anos.
      const prazoMulta = num(p, 'prazoMultaIsolada');
      return {
        status: 'cabivel',
        valor: formatPena(prazoMulta),
        resumo: `Multa única cominada: ${formatPena(prazoMulta)}.`,
        detalhes: [`A multa, quando é a única cominada ou aplicada, prescreve em ${formatPena(prazoMulta)} (art. 114, I, CP).`],
      };
    }
    if (c.semPenaPrivativa) {
      // "Outras penas" (Lei 11.343/06, art. 28; Lei 7.437/85, art. 8º): o prazo
      // depende da sanção, e o motor não o inventa.
      return {
        status: 'condicional',
        resumo: 'Sem pena privativa nem multa isolada: o prazo depende da sanção cominada.',
        detalhes: ['O art. 109 do CP mede o prazo pela pena privativa, e o art. 114, pela multa; a sanção deste tipo é outra, com regra própria.'],
      };
    }
```

O resto do avaliador fica como está.

- [ ] **Step 6: Rodar e ver passar**

Run: `npm run typecheck && npm run atributos && npm run verificar`
Expected: `0 errors`; as âncoras novas em `✓`.

- [ ] **Step 7: Quantas ANPP mudam (vai no commit)**

```bash
git diff static/data/atributos.json | grep -c "^[-+]" ; node -e "
const a=require('./static/data/atributos.json').atributos.find(x=>x.slug==='anpp'||x.id==='anpp');
console.log('ANPP, cabível+condicional agora:', (a.alcance.cabivel||[]).length + (a.alcance.condicional||[]).length);"
git show HEAD:static/data/atributos.json | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const a=JSON.parse(s).atributos.find(x=>x.slug==='anpp'||x.id==='anpp');
console.log('ANPP, cabível+condicional antes:', (a.alcance.cabivel||[]).length + (a.alcance.condicional||[]).length);});"
```

Anote os dois números no commit.

- [ ] **Step 8: Commit**

```bash
git add data/atributos.json static/data/atributos.json scripts/validar_atributos.py src/lib scripts/verificar_atributos.ts scripts/verificar_simulacao.ts scripts/verificar_remissao.ts scripts/verificar_injecao.ts
git commit -m "atributos: tipo so com multa, e a ANPP quando cabe transacao

Cada atributo declara se alcanca tipo sem pena privativa, com fundamento:
transacao, suspensao do processo, ANPP e prescricao. A prescricao da
multa isolada segue o art. 114, I (2 anos).

A ANPP passa a aplicar o art. 28-A, par. 2, I: nao cabe quando cabe
transacao. O avaliador so o escrevia no texto. Alcance da ANPP: <antes>
-> <depois> tipos.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

(Troque `<antes>` e `<depois>` pelos números do Step 7.)

---

### Task 8: A ficha do tipo para a remissão e para os tipos só com multa

A seção "Por que esta ficha não calcula atributos" (`src/pages/tipos/[id].astro`) vira uma lista de vereditos, gerada no build.

**Files:**
- Create: `src/components/ficha/VereditosSemMoldura.astro`
- Modify: `src/pages/tipos/[id].astro` (a seção `sem-calculo`)

**Interfaces:**
- Consumes: `avaliarTipo` (Task 5), `alcancaSemPenaPrivativa` (Task 7), `CATALOGO` e `valoresPadrao` de `src/lib/atributos`, `cenarioFromCrime`, `todosOsTipos()` de `src/site/catalogo-servidor.ts`.

- [ ] **Step 1: O componente**

Crie `src/components/ficha/VereditosSemMoldura.astro`:

```astro
---
// Os vereditos de um tipo sem moldura própria, calculados no build: o tipo de
// pena por remissão, avaliado origem a origem, e o tipo só com multa, avaliado
// só pelos atributos que o alcançam. Sem pena concreta nem simulação: a moldura
// é a da origem, ou não há moldura.
import type {Crime} from '../../lib/types';
import {CATALOGO, valoresPadrao} from '../../lib/atributos';
import {cenarioFromCrime} from '../../lib/cenario';
import {avaliarTipo} from '../../lib/atributos/remissao';
import {todosOsTipos} from '../../site/catalogo-servidor';

interface Props {
  crime: Crime;
}
const {crime} = Astro.props;
const remissao = !!crime.pena_por_remissao;
const alcancados = remissao ? CATALOGO : CATALOGO.filter((d) => d.alcancaSemPenaPrivativa);
const fora = remissao ? [] : CATALOGO.filter((d) => !d.alcancaSemPenaPrivativa);
const catalogo = todosOsTipos();
const vereditos = alcancados.map((d) => ({
  d,
  r: avaliarTipo(d, valoresPadrao(d), crime, catalogo, (t) => cenarioFromCrime(t)),
}));
const ROTULO = {cabivel: 'cabe', condicional: 'depende', incabivel: 'não cabe'} as const;
---

<section class="sem-moldura" aria-labelledby="titulo-sem-moldura">
  <h2 id="titulo-sem-moldura">Atributos penais</h2>
  <p class="nota">
    {
      remissao
        ? 'A moldura depende do dispositivo de origem: cada atributo foi avaliado com a de cada origem. Quando elas divergem, o veredito é "depende", e a lista diz qual origem dá o quê.'
        : 'O tipo não comina pena privativa de liberdade. Estes são os atributos que o alcançam mesmo assim.'
    }
  </p>
  <ul class="vereditos">
    {
      vereditos.map(({d, r}) => (
        <li class={`veredito veredito-${r.status}`}>
          <a href={`../../atributos/${d.id}`}>{d.nome}</a>
          <span class="status">{ROTULO[r.status]}{r.valor ? ` · ${r.valor}` : ''}</span>
          <p class="resumo">{r.resumo}</p>
          {!remissao && d.fundamentoSemPenaPrivativa && <p class="fundamento">{d.fundamentoSemPenaPrivativa}</p>}
          {r.status === 'condicional' && remissao && (
            <ul class="origens">
              {r.detalhes.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          )}
        </li>
      ))
    }
  </ul>
  {
    fora.length > 0 && (
      <p class="nota">
        Não se aplicam, porque o tipo não comina pena privativa de liberdade: {fora.map((d) => d.nome).join(', ')}.
      </p>
    )
  }
</section>

<style>
  .sem-moldura {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .vereditos {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0;
    list-style: none;
  }
  .veredito {
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--cor-borda);
    border-radius: var(--raio);
  }
  .status {
    margin-left: 0.5rem;
    font-family: var(--fonte-mono);
    font-size: var(--fs-rotulo);
    text-transform: uppercase;
  }
  .veredito-cabivel .status {
    color: var(--cor-acento);
  }
  .resumo,
  .fundamento,
  .nota {
    font-size: var(--fs-pequeno);
    color: var(--cor-tinta-corpo);
  }
  .origens {
    font-size: var(--fs-pequeno);
  }
</style>
```

Antes de escrever os `href`, confira como a ficha do tipo monta os links para atributos em outros pontos (`grep -n "atributos/" src/pages/tipos/[id].astro src/components/ficha/*.tsx`) e use o mesmo helper (provavelmente `caminho(...)` de `src/site/url.ts`) em vez do relativo `../../atributos/`.

- [ ] **Step 2: A ficha usa o componente**

Em `src/pages/tipos/[id].astro`, dentro do ramo `: (` que hoje renderiza `<section class="sem-calculo">`, troque a seção inteira por:

```astro
            <VereditosSemMoldura crime={crime} />
```

mantendo o que vier depois dela (a lista `fontesRemissao`, que leva às origens, continua útil: mova-a para logo depois do componente, dentro do mesmo fragmento). Acrescente o import no frontmatter:

```ts
import VereditosSemMoldura from '../../components/ficha/VereditosSemMoldura.astro';
```

- [ ] **Step 3: Build e conferência no HTML**

Run: `npm run build`
Then:

```bash
for id in 237 556 479; do python - "$id" <<'PY'
import re,sys,html
t=open(f'dist/tipos/{sys.argv[1]}/index.html',encoding='utf-8').read()
x=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',t)))
i=x.find('Atributos penais'); print(sys.argv[1],'→',x[i:i+400]); print()
PY
done
```

Expected:
- **237** (CP, art. 304): 22 atributos, vários "depende" com uma linha por falsificação de origem.
- **556** (Lei 2.889, art. 2º): vereditos de hediondo (progressão e livramento na fração do hediondo).
- **479** (CP, art. 146-A, *bullying*): transação "cabe", suspensão do processo, ANPP "não cabe", prescrição "· 2 anos"; a frase "Não se aplicam…" com os outros 18.

Confira o id do *bullying* antes: `node -e "const c=require('./static/data/crimes.json');console.log(c.filter(x=>/146-A, caput/.test(x.artigo)).map(x=>x.id))"`.

- [ ] **Step 4: Na tela**

Com o servidor, abra `/sispenas/tipos/237` e `/sispenas/tipos/<id do bullying>`: a seção aparece, os links para os atributos funcionam, nada de "Por que esta ficha não calcula atributos".

- [ ] **Step 5: Commit**

```bash
git add src/components/ficha/VereditosSemMoldura.astro "src/pages/tipos/[id].astro"
git commit -m "feat: a ficha do tipo sem moldura propria mostra os vereditos

Tipo de pena por remissao: os 22 atributos, avaliados origem a origem.
Tipo so com multa: os que o alcancam, com o fundamento, e a lista dos que
nao se aplicam. Calculado no build.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: O congelamento, a bateria e o registro

**Files:**
- Modify: `scripts/equivalencia/atributos.json` (regravado)
- Modify: `backlog.md`, `docs/superpowers/specs/2026-09-17-revamp-atlaspen-design.md`

- [ ] **Step 1: A equivalência acusa, e cada acusação se explica**

Run: `npm run equivalencia`
Expected: o script se recusa a comparar, porque a impressão digital de `static/data/crimes.json` mudou na Task 6. É o comportamento certo: ele não compara motor contra dado diferente.

A conferência das mudanças se faz pelo derivado publicado, que lista o alcance de cada atributo sob a premissa padrão:

```bash
BASE=$(git log --grep "a reincidencia em quatro estados, sem mudar veredito" --format=%h -1)
git show $BASE:static/data/atributos.json > "$TEMP/antes.json"
node -e "
const a=require(process.env.TEMP+'/antes.json').atributos, d=require('./static/data/atributos.json').atributos;
const ids=(x)=>new Set([...(x.alcance.cabivel||[]),...(x.alcance.condicional||[])]);
for (const x of d){ const y=a.find(z=>z.slug===x.slug||z.id===x.id); const A=ids(y), D=ids(x);
  const entra=[...D].filter(i=>!A.has(i)), sai=[...A].filter(i=>!D.has(i));
  if(entra.length||sai.length) console.log(x.slug||x.id,'entra',entra.join(',')||'-','| sai',sai.length,'tipos'); }"
```

Cada linha tem de caber numa destas explicações:
- **entra** só os ids 237, 556, 557 e 1185 — os tipos de remissão (Task 6);
- **sai**, na ANPP, os tipos de menor potencial ofensivo (Task 7) — o número tem de bater com o do commit da Task 7.

**Qualquer outra entrada ou saída é regressão**: PARE e investigue antes de regravar. A reincidência (Tasks 3 e 4) não aparece aqui: a premissa padrão é o primário.

- [ ] **Step 2: Regravar**

Run: `npm run equivalencia -- --gravar && npm run equivalencia`
Expected: gravado; a comparação seguinte passa.

- [ ] **Step 3: A bateria inteira**

Rode a bateria do `AGENTS.md` (Global Constraints) e `node scripts/verificar_rotas.mjs`.
Expected: tudo verde. Se o Arquivista acusar documento vencido por dependência que estas tarefas mudaram, releia o documento contra a mudança, e só então atualize `conferido_em` em `data/documentacao.json`, dizendo no commit o que foi conferido.

- [ ] **Step 4: O registro**

Em `backlog.md`, na seção "Pendências do revamp AtlasPen", acrescente ao fim de "Simulação legislativa":

```
- **A2, primeira parte, fechada em <data>.** Reincidência em quatro estados (primário,
  reincidente em crime culposo, em crime doloso, específico), cada atributo lendo a que a
  lei dele pergunta; pena por remissão avaliada por origem (1.472 → 1.476 cenários); tipos
  só com multa com vereditos na ficha; ANPP vedada quando cabe transação (art. 28-A, §2º,
  I). **Em aberto:** a progressão dos crimes comuns (LEP, art. 112, II a IV) para o
  reincidente genérico — conferir a jurisprudência antes de mexer.
```

No spec `2026-09-17-revamp-atlaspen-design.md`, § 3.1, A2: marque os dois itens (reincidência e os 35 tipos) como fechados, com o mesmo parágrafo resumido.

Confira o EOL (`LF solto: 0`) nos dois e rode o Arquivista.

- [ ] **Step 5: Commit**

```bash
git add scripts/equivalencia/atributos.json backlog.md docs/superpowers/specs/2026-09-17-revamp-atlaspen-design.md data/documentacao.json
git commit -m "docs: a primeira parte do A2 fechada, e o congelamento regravado

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
