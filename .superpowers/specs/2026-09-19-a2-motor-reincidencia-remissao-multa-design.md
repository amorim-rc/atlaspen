# A2, primeira parte: reincidência, pena por remissão e tipos só com multa

**Data:** 19/09/2026
**Estado:** desenho aprovado em conversa, seção a seção.
**Origem:** spec `2026-09-17-revamp-atlaspen-design.md` (A2) e lote `2026-09-18-a4-lote-de-decisoes.md`
(itens 1 e 2).
**Branch:** `revamp/atlaspen`

Três correções do motor de atributos. As três corrigem **veredito errado ou ausente já publicado**,
inclusive na `main`: o motor é anterior ao revamp. Nenhuma é mudança de lei, e por isso nenhuma
gera nota de atualização (`AGENTS.md`).

---

## 1. Reincidência em quatro estados

### 1.1 O problema

O cenário (`Cenario`, em `src/lib/types.ts`) tem `primario` e `reincidenteEspecifico`, mas nenhum
avaliador lê `primario`, e a interface só oferece "reincidente específico" — na ficha do tipo
(`PainelConcreta.tsx`), na ficha do atributo e na simulação (`CenarioReverso`, que deriva
`primario = !reincidenteEspecifico`). O reincidente não específico é lido como primário.

Sete atributos erram por isso:

| Atributo | Dispositivo | O que a lei pede | O motor hoje |
|---|---|---|---|
| ANPP | CPP, art. 28-A, §2º, II | qualquer reincidente | só o específico |
| Sursis da pena | CP, art. 77, I | reincidente em crime doloso | só o específico |
| Substituição | CP, art. 44, II e §3º | em doloso: depende (§3º); específico: veda | só o específico |
| Regime inicial | CP, art. 33, §2º | qualquer reincidente | só o específico |
| Livramento | CP, art. 83, I e II | em doloso: metade | só o específico |
| Saída temporária | LEP, art. 123, II | qualquer reincidente: um quarto | só o específico |
| Prescrição executória | CP, art. 110, *caput* | qualquer reincidente: +1/3 | não lê |

### 1.2 Os quatro estados

A lei distingue "reincidente" (ANPP, regime, saída temporária, prescrição) de "reincidente em
crime doloso" (sursis, substituição, livramento). Decisão do mantenedor: quatro estados.

```ts
export type Reincidencia = 'primario' | 'culposo' | 'doloso' | 'especifico';
```

- `culposo` — reincidente, e a condenação anterior foi por crime culposo.
- `doloso` — reincidente em crime doloso, não específico.
- `especifico` — reincidente no mesmo crime ou em crime da mesma natureza. Nos sete atributos isso
  é sempre doloso (hediondos; CP, art. 44, §3º), e o estado é tratado como caso particular de
  `doloso`.

`Cenario.primario` e `Cenario.reincidenteEspecifico` saem; entra `Cenario.reincidencia`. O mesmo
em `CenarioReverso`. Os avaliadores leem por três funções, em `src/lib/atributos/reincidencia.ts`:

```ts
export const ehReincidente = (c: Pick<Cenario, 'reincidencia'>) => c.reincidencia !== 'primario';
export const reincidenteEmDoloso = (c: Pick<Cenario, 'reincidencia'>) =>
  c.reincidencia === 'doloso' || c.reincidencia === 'especifico';
export const reincidenteEspecifico = (c: Pick<Cenario, 'reincidencia'>) => c.reincidencia === 'especifico';
```

### 1.3 Cada atributo

| Atributo | Lê | Efeito |
|---|---|---|
| ANPP | `ehReincidente` | incabível (parâmetro `vedadoReincidente`) |
| Sursis da pena | `reincidenteEmDoloso` | incabível (parâmetro `vedadoReincidente`) |
| Substituição | `reincidenteEspecifico` / `reincidenteEmDoloso` | incabível / condicional (§3º: "socialmente recomendável") |
| Regime inicial | `ehReincidente` | o regime mais gravoso que o código já aplica ao reincidente, com a lógica da Súmula 269 do STJ que já está lá |
| Livramento | `reincidenteEmDoloso` | fração do reincidente (metade); o culposo segue a do inciso I |
| Saída temporária | `ehReincidente` | fração do reincidente (um quarto) |
| Prescrição executória | `ehReincidente` | prazo +1/3; a da pretensão punitiva não muda (Súmula 220 do STJ) |
| Progressão, hediondos (LEP, art. 112, V a VIII) | `reincidenteEspecifico` | sem mudança: o reincidente genérico recebe o percentual do primário (STJ, Tema 1084, REsp 1.910.240) |
| Progressão, comuns (LEP, art. 112, II a IV) | `reincidenteEspecifico` | **sem mudança nesta entrega**: falta conferir a jurisprudência sobre o reincidente genérico nos incisos comuns. Registrado no backlog |

Todo ponto de `src/lib/atributos/avaliadores.ts` que lê reincidência é revisto contra esta tabela;
o que não está nela (ex.: a ressalva do Título XII, `:449`) mantém o comportamento, trocando só a
leitura do campo.

O requisito `primario` do atributo novo da simulação (`src/lib/simulacao/motor.ts`) passa a ler
`c.reincidencia === 'primario'`.

### 1.4 Interface e URL

- **Ficha do tipo** (`src/components/ficha/PainelConcreta.tsx`): as pílulas passam de duas para
  quatro — primário, reincidente em crime culposo, reincidente em crime doloso, reincidente
  específico. O estado da ficha troca `reincidente: boolean` por `reincidencia`.
- **Ficha do atributo e simulação** (`src/components/premissa/ControlesPremissa.tsx`): o chip
  "reincidente específico" sai das circunstâncias e vira um seletor de quatro opções, acima delas.
- **Recorte e premissa por extenso** (`circunstanciasPorExtenso`, `recorte`): dizem a reincidência
  presumida. Sob a premissa padrão, o recorte continua o texto de antes, palavra por palavra.
- **URL** (`src/lib/atributos/premissa-url.ts`): chave `reu=culposo|doloso|especifico`; o primário
  não se grava. **Compatibilidade:** `reincidente=sim`, a chave de hoje, continua sendo lida como
  `especifico`, e nunca mais é escrita. Um link já citado não muda de sentido.

---

## 2. Pena por remissão

### 2.1 O problema

Quatro tipos não cominam moldura própria e declaram `pena_por_remissao`: CP, art. 304; Lei
2.889/56, arts. 2º e 3º (hediondos); CPM, art. 315. O derivado os marca com
`tem_pena_privativa: false`, e eles saem de toda a varredura. Publicar uma moldura só afirmaria uma
pena que depende de qual origem se aplica (o docstring de `transform_data.py` o proíbe); marcá-los
como tendo pena privativa sem moldura daria pena zero, que passa em qualquer teto.

### 2.2 Avaliar por origem

Em `src/lib/atributos/remissao.ts`, duas funções puras:

```ts
/** Os registros de origem, com a moldura já transformada pelo operador da remissão. */
export function origensDaRemissao(tipo: TipoDoMotor, catalogo: TipoDoMotor[]): Origem[];

/** Um veredito por tipo: o das origens, se concordam; "condicional", com uma linha por origem, se não. */
export function avaliarPorRemissao(
  def: AtributoDef, params: Parametros, tipo: TipoDoMotor, origens: Origem[], rev: CenarioReverso,
): AtributoResultado;
```

- **Origens**: os registros com `lei === lei_fonte` e `artigo` começando por um dos `artigos_fonte`
  — o mesmo critério de `validar_pena_por_remissao`. A moldura de cada uma passa pelo operador:
  `nenhum` (a mesma), `diminuicao` (× (1 − fração)), `aumento` (× (1 + fração)). É a convenção da
  dosimetria ("diminui-se de um terço"), a mesma de `data/modificadores.json`. O projeto nunca a
  escreveu para a remissão; hoje os dois registros com operador (Lei 2.889/56, arts. 2º e 3º,
  "metade da pena", `diminuicao` com `1/2`) dão o mesmo número nas duas leituras possíveis, mas a
  próxima fração não daria. A definição entra em `docs/dados-abertos.md` e em
  `docs/catalogo-tipos-penais.md`, junto com a correção da frase que diz que esses tipos "ficam
  fora das estatísticas de alcance".
- **Cenário de cada origem**: `cenarioFromCrime(tipo)` com `penaMin`/`penaMax` da origem. Os campos
  do tipo (hediondez, violência, culpa) são **do tipo que remete**, não da origem.
- **Junção**: mesmo `status` e mesmo `valor` em todas as origens → esse resultado. Senão, `status:
  'condicional'`, `resumo: 'Depende da origem da pena.'`, e em `detalhes` uma linha por origem
  ("art. 297 (falsificação de documento público): cabe").

### 2.3 Um ponto de entrada

`avaliarTipo(def, params, tipo, rev, catalogo)` em `src/lib/atributos/nucleo.ts` despacha para
`avaliarPorRemissao` quando `tipo.pena_por_remissao` existe, e para o caminho de sempre quando não.
Passam a usá-lo **todos** os lugares que avaliam um tipo do catálogo: a varredura do atributo
(`reverso.ts`, `avaliarCatalogo`), a simulação (`avaliarEstado`), a ficha do tipo e a derivação
(`scripts/derivar_atributos.ts`). Um teste confere que nenhum deles avalia um tipo de remissão com
pena zero.

### 2.4 Estatística e interface

- O derivado passa a marcar `tem_pena_privativa: true` para quem tem `pena_por_remissao` e cujas
  origens têm todas pena privativa. Os quatro entram no recorte "com pena privativa": **1.472 →
  1.476 cenários**. É correção; o denominador publicado muda.
- A ficha do tipo mostra os vereditos juntados. Não oferece a pena concreta nem o editor de
  moldura: a moldura depende da origem.
- A simulação não oferece "modificar" para eles (não há moldura própria a editar) — o motivo aparece
  na tela quando o tipo é escolhido.

---

## 3. Tipos só com multa

### 3.1 O problema

31 tipos são punidos só com multa, e 2 com "outras penas" (Lei 11.343/06, art. 28, porte para
consumo pessoal; Lei 7.437/85, art. 8º, contravenção de preconceito).
A ficha não mostra veredito nenhum, e em vários a resposta existe: a transação penal cabe (Lei
9.099/95, art. 61, "cumulada ou não com multa").

### 3.2 Decisão: só na ficha

Decisão do mantenedor: os vereditos aparecem **na ficha do tipo**. As estatísticas de alcance
continuam no recorte declarado ("tipos com pena privativa") e nenhum denominador muda por causa
destes tipos.

### 3.3 Dado e motor

- `data/atributos.json`: cada atributo ganha `alcanca_sem_pena_privativa` (booleano) e, quando
  verdadeiro, `fundamento_sem_pena_privativa`. `scripts/validar_atributos.py` passa a exigir o
  campo. Verdadeiro para:
  - **transação penal** — Lei 9.099/95, art. 61 ("cumulada ou não com multa");
  - **suspensão condicional do processo** — Lei 9.099/95, art. 89;
  - **ANPP** — CPP, art. 28-A: incabível, pelo §2º, I, quando cabe transação;
  - **prescrição** — CP, art. 114, I: 2 anos para a multa isolada.
- `Cenario` ganha `semPenaPrivativa`, lido de `tem_pena_privativa`. A prescrição passa a aplicar o
  art. 114, I, quando ele é verdadeiro; a ANPP confere a vedação do §2º, I.

### 3.4 Ficha do tipo

Para os tipos sem pena privativa (e sem remissão): os vereditos dos atributos com
`alcanca_sem_pena_privativa`, e uma linha só para os demais — "Não se aplicam: o tipo não comina
pena privativa de liberdade", com a lista.

---

## 4. Testes

- **Âncoras** em `scripts/verificar_atributos.ts`, uma por regra da tabela 1.3, nos quatro estados
  quando a regra os distingue. Por exemplo: ANPP para reincidente culposo (incabível); sursis para
  reincidente culposo (segue o resto dos requisitos); livramento para reincidente em doloso (metade)
  e culposo (um terço); prescrição executória do reincidente (+1/3); a da pretensão punitiva do
  reincidente (sem aumento).
- **Remissão**: o art. 304 do CP com origens divergentes (condicional, uma linha por origem) e
  concordantes (o veredito comum); a Lei 2.889, art. 2º, com a metade da pena e a hediondez do
  próprio tipo; nenhum ponto de avaliação lendo pena zero.
- **Só multa**: o art. 146-A do CP (*bullying*): transação cabível, prescrição de 2 anos, ANPP
  incabível pelo §2º, I; regime "não se aplica".
- **URL**: `reincidente=sim` lido como `especifico`; `reu=` na ida e volta; a premissa padrão sem
  sujar a URL, e o recorte padrão palavra por palavra igual ao de hoje.
- **Congelamento**: `scripts/equivalencia_atributos.ts` vai acusar diferenças. Cada uma é revisada
  contra a tabela 1.3 e as seções 2 e 3; o congelamento é regravado com a lista das mudanças no
  corpo do commit.
- **Bateria do `AGENTS.md`** inteira, mais `scripts/verificar_rotas.mjs`.

---

## 5. Fora desta entrega

- A progressão dos crimes comuns para o reincidente genérico (LEP, art. 112, II a IV): conferir a
  jurisprudência antes de mexer.
- Os demais itens do A2: atributo novo com mais de um limiar, tipo modificado, etiqueta de sentido,
  testes de interface.
- As estatísticas por atributo com universo próprio (decisão: não).
