# Estudo: o modelo de dados dos atributos penais

> Frente 5 do [backlog](../backlog.md). Proposta de 10/09/2026, validada em 11/09/2026.
> Nada aqui está implementado ainda. Os achados da seção 2 foram conferidos nesta data no texto compilado
> do Planalto (LEP e Lei 9.099/95) e no catálogo derivado.

Os termos seguem o glossário do `CONTRIBUTING.md`. **Atributo penal** é o instituto
(transação, progressão…), que o site chamava de benefício. **Parâmetro** é o patamar, a fração ou
a vedação editável de um atributo. **Campo** é o campo do registro de tipo penal.

---

## 1. De onde se parte

- **22 atributos, todos em código**, em `src/lib/atributos/catalogo/`: 4 processuais, 6
  de aplicação da pena e 12 de execução. Ao todo são **71 parâmetros**; a progressão
  tem 11, a prescrição 7 e o livramento 6.
- Cada atributo é um `AtributoDef` (`src/lib/atributos/types.ts`): `id`, `nome`,
  `fundamento`, `categoria`, `natureza`, `descricao`, `requisitos`, `vedacoes`,
  `parametros` e a função `avaliar(cenario, parametros)`.
- **O fundamento é texto livre**, por exemplo `Art. 112, VI, "b", LEP (redação da Lei
  15.358/2026)`. Nenhum programa sabe a que dispositivo ele se refere, e por isso nenhum
  robô confere atributo.
- **A sucessão de leis está embutida caso a caso.** O cenário tem uma única marcação
  temporal, `fatoAnteriorA15402`, e a progressão guarda lado a lado parâmetros de duas
  redações do art. 112 da LEP.
- **Cinco consumidores** leem o catálogo em código. É o que o PR da migração troca
  (seção 6):

| Onde | O que usa |
|---|---|
| `src/pages/index.tsx` | `CATALOGO.length`, no contador da página inicial |
| `src/components/Pesquisa/Detalhe.tsx` | `calcularAtributos`, na página do tipo penal |
| `src/components/BuscaAtributo/index.tsx` | `CATALOGO`, `POR_ID` e os rótulos, na lista da busca por atributo |
| `src/components/BuscaAtributo/DetalheAtributo.tsx` | o motor e a busca reversa (`reverso.ts`), no detalhe da busca por atributo |
| `scripts/verificar_atributos.ts` | o motor, a busca reversa e os casos-âncora da CI |

---

## 2. O que o estudo encontrou

### A. A progressão cita a numeração de 2019 do art. 112 da LEP

A Lei 15.402/2026 reescreveu o caput e os incisos I a III do art. 112. A função de
avaliação já usa a numeração nova, mas os parâmetros continuam com a de 2019:

| Parâmetro | Padrão | Fundamento no código | Inciso na redação da Lei 15.402/2026 |
|---|---|---|---|
| `fracaoPrimarioViolencia` | 25% | Art. 112, III | I |
| `fracaoReincidenteViolencia` | 30% | Art. 112, IV | II |
| `fracaoReincidenteSemViolencia` | 20% | Art. 112, II | III ("reincidente em crime diverso dos crimes referidos nos incisos I e II") |

Quem abre a progressão na busca por atributo lê o inciso de 2019 ao lado do percentual de
hoje. O resultado do cálculo não muda; muda o que se cita. No compilado, o inciso IV
continua com o texto de 2019 (30%, reincidente com violência), sem redação nova e sem
revogação.

É o caso que o modelo precisa resolver: **um parâmetro, duas redações, dois números de
inciso.**

**Corrigido em 10/09/2026:** os três parâmetros e o fundamento do atributo passaram a
citar a redação vigente, com o inciso de 2019 entre parênteses na ajuda.

### B. A milícia privada não tem ramo no cálculo da progressão

O art. 112, VI, "c", da LEP alcança o "condenado pela prática do crime de constituição
de milícia privada". A alínea foi incluída pela Lei 13.964/2019 e está em vigor no
compilado, sob o inciso VI, que a Lei 15.358/2026 elevou a **75%**.

A função de avaliação da progressão não tem ramo para essa alínea, e o cenário não tem
campo que a marque. O catálogo tem o tipo: **id 221, CP, art. 288-A**, "Constituição de
milícia privada", com violência e grave ameaça, não hediondo. O site calcula hoje **25%**
para o primário (inciso I) e **30%** para o reincidente (inciso II). A lei diz 75% nos
dois casos, porque a alínea "c" não distingue primário de reincidente.

**É erro de cálculo publicado.** A correção vem antes do congelamento (seção 6).
A documentação, curiosamente, estava certa: a tabela de `docs/atributos-penais.md` já
dizia 75% para a alínea "c". Errado estava só o motor.

**Corrigido em 10/09/2026:** o parâmetro `fracaoMiliciaPrivada` (75%) e o campo
`miliciaPrivada` no cenário. O campo é lido do registro pelo dispositivo (CP,
art. 288-A), e não pelo nome, porque o nome do homicídio com aumento do art. 121, §6º,
também fala em milícia privada. A verificação ganhou um caso-âncora.

### C. O caso concreto só conhece uma lei no tempo

A Lei 15.358/2026 elevou as frações dos hediondos. Conferido no compilado: inciso V de
40% para 70%, VI de 50% para 75%, VII de 60% para 80% e VIII de 70% para 85%. Lei mais
gravosa não retroage (art. 5º, XL, da CF), mas o cenário só distingue o fato anterior a
08/05/2026, isto é, à Lei 15.402. Para os hediondos, o cálculo aplica sempre as frações
novas. O fato anterior à vigência da Lei 15.358 recebe a fração mais gravosa.

Isso é limite do caso concreto, e não do cálculo em abstrato. É também o argumento para
que, **no caso concreto e só nele**, a marcação por lei vire uma data do fato (seção 4.4).

### D. A `chave_dispositivo` atual não é canônica

`transform_data.py` monta a chave com o **rótulo** do catálogo, em minúsculas:
`f"{lei}|{artigo}"`. O mesmo diploma aparece sob mais de um rótulo. O CP tem quatro
(`CP`, `CP (atualiz.)`, `Lei 14.478/22`, `Lei 14.811/24`); o Código Eleitoral, a Lei
9.605 e a Lei 9.613 têm dois cada. E há registros que trazem o diploma dentro do artigo,
como `Art. 146-A, caput (CP)` e `Art. 326-B (CE)`:

| Registro | `chave_dispositivo` hoje |
|---|---|
| id 1: CP, Art. 121, caput | `cp\|art. 121, caput` |
| id 479: Lei 14.811/24, Art. 146-A, caput (CP) | `lei 14.811/24\|art. 146-a, caput (cp)` |

Como está, a chave não serve de endereço do histórico: o art. 146-A do CP ficaria sob uma
chave que não diz "CP". Pela mesma razão, a detecção de duplicatas não enxerga dois
registros do mesmo dispositivo com rótulos diferentes.

### E. Faltam diplomas em `data/fontes.json`

Os fundamentos dos atributos citam a **LEP** 26 vezes, o **CPP** 8, a **Lei 9.099/95** 6
e a **CF** 6. Nenhum desses está no registro de fontes. A Lei 12.850/13 e a Lei 8.072/90
já estão. O registro aceita diploma sem tipo penal: `hediondos-8072` tem `rotulos: []`.

Quatro fundamentos são **súmulas** (a Súmula 536 do STJ, duas vezes; a Súmula Vinculante
56; a Súmula 715 do STF), que não têm texto no Planalto. São outra espécie de fonte.

### F. O link para o item já está no compilado

As anotações do compilado são links para a lei alteradora, com a âncora do artigo
(`crawler/DECISOES-F0.md`, §3). No art. 112 da LEP:

| Anotação | `href`, resolvido contra `.../ccivil_03/leis/l7210.htm` |
|---|---|
| (Incluído pela Lei nº 13.964, de 2019) | `https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2019/Lei/L13964.htm#art4` |
| (Vigência) | `https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2019/Lei/L13964.htm#art20` |
| (Redação dada pela Lei nº 15.402, de 2026) | `https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15402.htm#art1` |

O parser do Vigia (`scripts/robos/nucleo/parsear.py`, função `paragrafos`) guarda o
**texto** de cada link e descarta o `href`. Guardar os dois é mudança pequena, e é ela que
torna mecânico o "link para o item no Planalto".

**Feito em 11/09/2026** (frente 4, passo 1): a anotação guarda o `href`, e
`url_absoluta` o resolve contra a página do diploma.

---

## 3. Requisitos

Decididos em 10/09/2026:

1. **Glossário** (`CONTRIBUTING.md`): atributo penal, parâmetro, campo.
2. **Chave de dispositivo** para tipos e atributos, servindo a um só
   `historico-legislativo.json`.
3. **Última alteração legislativa em cada atributo**, como nos tipos: data e lei que o
   editou, com link para o item no Planalto. É derivada do histórico, nunca digitada.
4. **Sem data do fato na simulação em abstrato.** Ela usa a lei vigente. No máximo o caso
   concreto registra a data do fato.
5. **Tudo vai para dados, menos a função de avaliação.**
6. **Teste de equivalência antes de migrar.** A migração só entra se nada mudar.
7. **Um PR só.** O PR que cria a base troca, nele mesmo, todos os usos da seção 1, e o
   catálogo em código sai junto. Não há período com duas fontes.
8. **O acervo histórico registra a história dos atributos**, não só a dos tipos (seção 7).

Em aberto: o **escopo do inventário** (causas de extinção da punibilidade, regimes
próprios do CPM). Decide-se depois de descoberto o como.

---

## 4. Proposta

### 4.1 Chave canônica de dispositivo

```
<id do diploma em data/fontes.json>|<dispositivo normalizado>
```

A normalização segue a de hoje: minúsculas e espaços únicos. A diferença é que o diploma
sai do registro de fontes, não do rótulo, e que o sufixo "(CP)" do artigo desaparece.

| O quê | Chave |
|---|---|
| id 1, CP, Art. 121, caput | `cp\|art. 121, caput` |
| id 479, Lei 14.811/24, Art. 146-A, caput (CP) | `cp\|art. 146-a, caput` |
| progressão, primário com violência | `lep\|art. 112, i` |
| progressão, milícia privada | `lep\|art. 112, vi, c` |
| transação, teto do menor potencial ofensivo | `juizados-9099\|art. 61` |

O rótulo vira diploma pelo mapa `rotulos` de `data/fontes.json`. Pela regra do próprio
arquivo, todo rótulo distinto do catálogo consta de exatamente um diploma, e o conferidor
já usa esse mapa para casar registro e diploma.

**Recomendação:** redefinir a própria `chave_dispositivo` nesse formato, em vez de criar
um segundo campo parecido. Ela é campo derivado e público, e mudar seu significado seria
quebra de contrato depois da 1.0. Antes dela, pela opção B da frente 2, não é. De
quebra, a detecção de duplicatas passa a enxergar o mesmo dispositivo sob rótulos
diferentes.

### 4.2 Diplomas novos em `data/fontes.json`

Entram, sem rótulos de catálogo, como o `hediondos-8072`: `lep` (Lei 7.210/84), `cpp`
(DL 3.689/41), `juizados-9099` (Lei 9.099/95) e `cf` (Constituição de 1988). Cada um com
sua URL do compilado e sua sentinela de frescor. O Vigia passa a baixá-los toda semana.
Ainda não confere patamar de atributo, mas o texto baixado é a matéria-prima do histórico.

### 4.3 `data/atributos.json` — a fonte

| Campo | O que é |
|---|---|
| `id` | **Número inteiro**, estável e append-only, como o dos tipos: o retirado vai para uma lista de aposentados e nunca volta. Os 22 atuais recebem 1 a 22 na ordem do catálogo (processuais, aplicação, execução). O nome é para gente; o número, para scripts e referências cruzadas (ajuste aprovado em 11/09/2026). |
| `nome`, `categoria`, `natureza`, `descricao`, `requisitos`, `vedacoes` | Como hoje. `requisitos` e `vedacoes` continuam em prosa. |
| `fundamento` | Texto de exibição. |
| `dispositivos` | Chaves canônicas em que o atributo se funda. É por elas que o histórico se junta. |
| `vigencia` | Opcional. `ate` e `nota` quando o atributo deixa de valer, como nos tipos (seção 7). |
| `parametros` | A lista de parâmetros. |

Cada parâmetro tem `id`, `rotulo`, `tipo`, `padrao`, `min`, `max`, `passo` e `ajuda`,
como hoje, e ganha **`redacoes`**. Cada redação diz de onde o valor vem:

| Campo da redação | O que é |
|---|---|
| `fonte` | `{"dispositivo": "<chave>"}` ou `{"sumula": "STJ 536"}` |
| `norma` | A lei que deu essa redação (`"Lei nº 15.402"`), ou `"original"` |
| `fundamento` | Texto de exibição daquela redação |
| `valor` | Opcional. Ausente, vale o `padrao` |

As datas **não** se repetem aqui. A vigência de cada redação sai do evento
correspondente no histórico (mesmo dispositivo, mesma norma), que é o único lugar onde uma
data é escrita. A redação **vigente** é a de evento mais recente. É ela que a simulação em
abstrato usa, e é o fundamento dela que a tela mostra. Isso resolve o achado A sem mexer
em nenhum número.

### 4.4 O tempo na simulação

- **Em abstrato:** a busca por atributo e a página do tipo penal sem caso concreto usam
  a redação vigente de cada parâmetro. Nenhuma data entra.
- **No caso concreto:** a data do fato, e só ali. Hoje ela é a marcação
  `fatoAnteriorA15402`. O achado C mostra que uma marcação por lei não escala, e a
  proposta é trocá-la por uma data que escolhe, em cada parâmetro, a redação vigente
  naquele dia. **Isso muda resultado** e por isso fica fora do PR da migração (seção 6).
- **Decidido em 10/09/2026:** a alavanca "fato anterior a 08/05/2026" saiu da busca por
  atributo. A marcação continua só no caso concreto, na página do tipo penal.

### 4.5 `data/historico-legislativo.json`

Uma tabela de eventos: **uma linha por acontecimento** na vida de um dispositivo, em
ordem cronológica. É append-only e compartilhada por tipos e atributos. (Ajuste aprovado
em 11/09/2026: a primeira versão deste estudo agrupava os eventos sob a chave; a tabela
plana é mais legível e é, literalmente, uma tabela de banco de dados.)

| Campo | O que é |
|---|---|
| `dispositivo` | A chave canônica (4.1). É a **chave estrangeira**: liga a linha ao tipo penal (`chave_dispositivo`) e ao atributo (`dispositivos` e `redacoes[].fonte`) |
| `evento` | `criacao`, `alteracao`, `revogacao`, `renumeracao` ou `transferencia` (tabela abaixo) |
| `norma`, `ano` | A lei, ou a decisão, que produziu o evento, como o parser do Vigia a lê |
| `anotacao` | O texto da anotação no compilado, tal como está: "(Redação dada pela Lei nº 15.402, de 2026)" |
| `url` | O link para o item na lei alteradora (achado F) |
| `publicacao`, `vigencia` | Datas. O compilado dá só o ano; a data exata vem da própria lei alteradora |
| `valor_antes`, `valor_depois` | O valor que mudou, quando é número (percentual, pena) |
| `natureza` | `legislativa` ou `correcao` (frente 9: uma coisa é a lei mudar, outra é o catálogo errar) |
| `origem` | `compilado` (extraído pelo robô) ou `manual` |

| `evento` | O que aconteceu com o dispositivo | Depois dele |
|---|---|---|
| `criacao` | nasceu, no texto original da lei ou incluído por lei posterior ("Incluído pela…") | vigente |
| `alteracao` | uma lei lhe deu texto novo ("Redação dada pela…") | vigente, com o texto novo |
| `revogacao` | uma lei, ou uma decisão, o tirou de vigência ("Revogado pela…") | não vige; continua regendo o fato anterior |
| `renumeracao`, `transferencia` | mudou de número ou de lugar | vigente, sob a chave nova |

Se o dispositivo vige não se escreve em lugar nenhum: sai do último evento. Quantas vezes
ele mudou é o número de linhas de natureza `legislativa` (frente 9); a última alteração é
a linha mais recente (frente 4); um tipo revogado é uma linha `revogacao`, com lei e link
(frente 12).

Exemplo, com o que o compilado do art. 112, I, da LEP traz hoje:

```json
[
  {
    "dispositivo": "lep|art. 112, i",
    "evento": "criacao",
    "norma": "Lei nº 13.964",
    "ano": 2019,
    "anotacao": "(Incluído pela Lei nº 13.964, de 2019)",
    "url": "https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2019/Lei/L13964.htm#art4",
    "valor_depois": "16%",
    "natureza": "legislativa",
    "origem": "compilado"
  },
  {
    "dispositivo": "lep|art. 112, i",
    "evento": "alteracao",
    "norma": "Lei nº 15.402",
    "ano": 2026,
    "anotacao": "(Redação dada pela Lei nº 15.402, de 2026)",
    "url": "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15402.htm#art1",
    "vigencia": "2026-05-08",
    "valor_antes": "16%",
    "valor_depois": "25%",
    "natureza": "legislativa",
    "origem": "compilado"
  }
]
```

O exemplo mostra o que torna o histórico indispensável: **o mesmo inciso I mudou de
assunto**, de "primário sem violência, 16%" para "primário com violência, 25%". Só o
histórico do dispositivo conta essa história direito.

### 4.6 O derivado, e o que o site lê

- **`static/data/atributos.json`** é a fonte mais os campos derivados: em cada atributo e
  em cada parâmetro, `ultima_alteracao` (`norma`, `ano`, `url`, `vigencia`) e
  `alteracoes_legislativas`, a contagem. Sai do mesmo passo de transformação, e a CI exige
  o derivado sincronizado, como no catálogo.
- **O alcance de cada atributo também é derivado** (ajuste aprovado em 11/09/2026): as
  listas de ids dos tipos em que ele é `cabivel` e `condicional`, sob um cenário de
  referência declarado ao lado (lei vigente, réu primário, pena concreta igual à mínima
  cominada). Incabível é o resto. Nunca se digita, porque depende do cenário e muda a cada
  pena corrigida; e, como as funções de avaliação estão em TypeScript, é um passo em
  TypeScript que o calcula, com a CI exigindo o derivado sincronizado. É a mesma tabela
  que o teste de equivalência congela.
- **O site importa o derivado no build**, como a dosimetria já importa
  `data/modificadores.json`. Não há carregamento assíncrono de atributos.
- **`qualidade.json` ganha `total_atributos`.** A página inicial lê o terceiro contador
  de lá, como já lê os outros dois.
- **Em código fica só** `src/lib/atributos/avaliadores.ts`: um mapa `id → avaliar`. A
  verificação reprova atributo sem avaliador, avaliador sem atributo e parâmetro lido por
  um avaliador que não exista nos dados.
- **Validação dos dados na CI:** frações em [0, 1], `min ≤ padrao ≤ max`, toda chave de
  dispositivo com diploma em `fontes.json`, todo parâmetro com ao menos uma redação.

---

## 5. Os três pilotos

Serializados do código atual. Os textos são os mesmos; o que muda está marcado abaixo de
cada um.

### Transação penal: natureza abstrata, um parâmetro com súmula

```json
{
  "id": 1,
  "nome": "Transação penal",
  "fundamento": "Art. 76, Lei 9.099/95",
  "dispositivos": ["juizados-9099|art. 76"],
  "categoria": "processual",
  "natureza": "abstrato",
  "descricao": "Proposta pelo Ministério Público de aplicação imediata de pena restritiva de direitos ou multa, antes do oferecimento da denúncia, nas infrações de menor potencial ofensivo. Não gera reincidência nem efeitos civis.",
  "requisitos": [
    "Infração de menor potencial ofensivo (pena máxima não superior a 2 anos, cumulada ou não com multa).",
    "Não ter sido o autor condenado, por sentença definitiva, à pena privativa de liberdade.",
    "Não ter sido beneficiado por transação penal nos 5 anos anteriores.",
    "Antecedentes, conduta social e personalidade favoráveis."
  ],
  "vedacoes": [
    "Violência doméstica e familiar contra a mulher (Súmula 536, STJ; art. 41, Lei 11.340/06).",
    "Concurso de crimes cuja soma das penas máximas ultrapasse o limite legal."
  ],
  "parametros": [
    {
      "id": "limiteMaxMeses",
      "rotulo": "Teto da pena máxima cominada",
      "tipo": "meses",
      "padrao": 24,
      "min": 0,
      "max": 240,
      "passo": 1,
      "ajuda": "Limite da pena MÁXIMA em abstrato que define a infração de menor potencial ofensivo. Elevá-lo simula uma reforma que ampliasse o alcance dos Juizados Especiais Criminais.",
      "redacoes": [
        {
          "fonte": {"dispositivo": "juizados-9099|art. 61"},
          "norma": "original",
          "fundamento": "Art. 61, Lei 9.099/95 (redação original)",
          "valor": 12
        },
        {
          "fonte": {"dispositivo": "juizados-9099|art. 61"},
          "norma": "Lei nº 11.313",
          "fundamento": "Art. 61, Lei 9.099/95"
        }
      ]
    },
    {
      "id": "vedadoViolencia",
      "rotulo": "Vedar quando houver violência ou grave ameaça",
      "tipo": "booleano",
      "padrao": true,
      "ajuda": "A Lei 9.099/95 não veda a transação por violência em geral, mas a Súmula 536 do STJ a afasta na violência doméstica. Desmarcar remove a ressalva e trata esses tipos como cabíveis.",
      "redacoes": [
        {"fonte": {"sumula": "STJ 536"}, "norma": "original", "fundamento": "Súmula 536, STJ"}
      ]
    }
  ]
}
```

**O que muda:** `dispositivos` e `redacoes`. A redação original do art. 61, com teto de
um ano, foi conferida no compilado, assim como a redação da Lei 11.313/2006. Ela entra
como história e não altera o padrão de 24 meses.

### Substituição por restritivas de direitos: natureza concreta, quatro parâmetros

```json
{
  "id": 5,
  "nome": "Substituição por penas restritivas de direitos",
  "fundamento": "Art. 44, CP",
  "dispositivos": ["cp|art. 44"],
  "categoria": "aplicacao",
  "natureza": "concreto",
  "descricao": "Troca da pena privativa de liberdade por restritivas de direitos (prestação de serviços, interdição temporária, limitação de fim de semana, prestação pecuniária ou perda de bens). É o principal instrumento de desencarceramento na fase de aplicação.",
  "requisitos": [
    "Pena privativa não superior a 4 anos e crime cometido sem violência ou grave ameaça — ou crime culposo, qualquer que seja a pena.",
    "Réu não reincidente em crime doloso.",
    "Culpabilidade, antecedentes, conduta social e personalidade indicarem suficiência da substituição."
  ],
  "vedacoes": [
    "Reincidência específica em crime doloso (art. 44, §3º, parte final).",
    "Crime doloso cometido com violência ou grave ameaça à pessoa (art. 44, I)."
  ],
  "parametros": [
    {
      "id": "limiteConcretaMeses",
      "rotulo": "Teto da pena concreta",
      "tipo": "meses",
      "padrao": 48,
      "min": 0,
      "max": 240,
      "passo": 1,
      "ajuda": "Pena aplicada na sentença não pode superar este valor (crimes dolosos). Elevá-lo é a medida de desencarceramento de maior impacto agregado sobre o catálogo.",
      "redacoes": [{"fonte": {"dispositivo": "cp|art. 44, i"}, "norma": "a extrair", "fundamento": "Art. 44, I, CP"}]
    },
    {
      "id": "exigeSemViolencia",
      "rotulo": "Exigir ausência de violência ou grave ameaça (crime doloso)",
      "tipo": "booleano",
      "padrao": true,
      "ajuda": "Requisito do art. 44, I. Não se aplica aos crimes culposos.",
      "redacoes": [{"fonte": {"dispositivo": "cp|art. 44, i"}, "norma": "a extrair", "fundamento": "Art. 44, I, CP"}]
    },
    {
      "id": "culposoSemTeto",
      "rotulo": "Crime culposo cabível qualquer que seja a pena",
      "tipo": "booleano",
      "padrao": true,
      "ajuda": "Parte final do art. 44, I: nos crimes culposos a substituição independe do quantum da pena aplicada e da existência de violência.",
      "redacoes": [{"fonte": {"dispositivo": "cp|art. 44, i"}, "norma": "a extrair", "fundamento": "Art. 44, I, parte final, CP"}]
    },
    {
      "id": "vedadoReincidenteEspecifico",
      "rotulo": "Vedar ao reincidente específico",
      "tipo": "booleano",
      "padrao": true,
      "ajuda": "Art. 44, §3º: o reincidente NÃO específico pode ser beneficiado se a medida for socialmente recomendável; a vedação é absoluta apenas na reincidência específica.",
      "redacoes": [{"fonte": {"dispositivo": "cp|art. 44, §3º"}, "norma": "a extrair", "fundamento": "Art. 44, §3º, CP"}]
    }
  ]
}
```

**O que muda:** `dispositivos` e `redacoes`. As normas ficam como `"a extrair"`: o art. 44
do CP já teve mais de uma redação, e é o robô, lendo o compilado, quem preenche a norma de
cada uma. Nenhuma norma é escrita de memória.

### Progressão de regime: sucessão de leis e os achados A e B

Só o cabeçalho e três dos onze parâmetros. Os demais seguem o mesmo molde.

```json
{
  "id": 11,
  "nome": "Progressão de regime",
  "fundamento": "Art. 112, LEP",
  "dispositivos": ["lep|art. 112"],
  "categoria": "execucao",
  "natureza": "concreto",
  "parametros": [
    {
      "id": "fracaoPrimarioViolencia",
      "rotulo": "Primário, com violência/grave ameaça",
      "tipo": "fracao",
      "padrao": 0.25,
      "min": 0,
      "max": 1,
      "passo": 0.01,
      "ajuda": "25% da pena para o primário condenado por crime cometido com violência ou grave ameaça: inciso I desde a Lei 15.402/2026, inciso III na redação de 2019.",
      "redacoes": [
        {"fonte": {"dispositivo": "lep|art. 112, iii"}, "norma": "Lei nº 13.964", "fundamento": "Art. 112, III, LEP (redação da Lei 13.964/2019)"},
        {"fonte": {"dispositivo": "lep|art. 112, i"}, "norma": "Lei nº 15.402", "fundamento": "Art. 112, I, LEP (redação da Lei 15.402/2026)"}
      ]
    },
    {
      "id": "fracaoPrimarioHediondo",
      "rotulo": "Primário, hediondo/equiparado",
      "tipo": "fracao",
      "padrao": 0.7,
      "min": 0,
      "max": 1,
      "passo": 0.01,
      "ajuda": "Inciso V: 70% da pena para o primário condenado por crime hediondo ou equiparado. Era 40% até a Lei 15.358/2026.",
      "redacoes": [
        {"fonte": {"dispositivo": "lep|art. 112, v"}, "norma": "Lei nº 13.964", "fundamento": "Art. 112, V, LEP (redação da Lei 13.964/2019)", "valor": 0.4},
        {"fonte": {"dispositivo": "lep|art. 112, v"}, "norma": "Lei nº 15.358", "fundamento": "Art. 112, V, LEP (redação da Lei 15.358/2026)"}
      ]
    },
    {
      "id": "fracaoMiliciaPrivada",
      "rotulo": "Constituição de milícia privada",
      "tipo": "fracao",
      "padrao": 0.75,
      "min": 0,
      "max": 1,
      "passo": 0.01,
      "ajuda": "Inciso VI, \"c\": 75% da pena para o condenado pela prática do crime de constituição de milícia privada (art. 288-A do CP), primário ou reincidente. Era 50% até a Lei 15.358/2026.",
      "redacoes": [
        {"fonte": {"dispositivo": "lep|art. 112, vi, c"}, "norma": "Lei nº 13.964", "fundamento": "Art. 112, VI, \"c\", LEP (redação da Lei 13.964/2019)", "valor": 0.5},
        {"fonte": {"dispositivo": "lep|art. 112, vi, c"}, "norma": "Lei nº 15.358", "fundamento": "Art. 112, VI, \"c\", LEP (redação da Lei 15.358/2026)"}
      ]
    }
  ]
}
```

**O que muda:**

- **`fracaoPrimarioViolencia`** passa a citar o inciso certo para cada redação (achado A).
  O número continua 25%.
- **`fracaoPrimarioHediondo`** guarda os 40% de 2019 como história. Hoje eles só existem
  num texto de ajuda. Pela decisão 4, a simulação em abstrato continua usando 70%.
- **`fracaoMiliciaPrivada`** entrou no código em 10/09/2026, com a correção do achado B.
  A migração só a serializa.
- O `fundamento` do cabeçalho deixa de dizer "redação da Lei 13.964/2019". O caput vigente
  é da Lei 15.402/2026, e a redação de cada parâmetro já diz de onde vem.

---

## 6. O PR da migração, e o que vem antes

**Antes, e fora dele:**

1. **O glossário no texto e no código.** Feito em 10/09/2026. Assim a base já nasce como
   `data/atributos.json`, em `src/lib/atributos`, com `?atributo=`. Renomear e migrar no
   mesmo PR misturaria uma mudança mecânica com uma semântica e turvaria a prova de
   equivalência.
2. **Correção do achado B (milícia privada).** O teste de equivalência congela o
   resultado de hoje, e congelar um erro conhecido é certificá-lo. Feita em 10/09/2026,
   junto com o achado A.

**O PR da migração, em commits que se leem em ordem:**

1. **O congelamento.** Com o código atual, `scripts/equivalencia_atributos.ts` registra,
   para cada atributo, o status em cada tipo com pena privativa e uma impressão digital
   (hash) de todos os `resumo`, `detalhes` e `limiar` devolvidos. Faz isso em dois cenários: o da página do tipo (`cenarioFromCrime`) e o
   padrão da busca por atributo (`cenarioReversoPadrao`). São 22 × 1.472 × 2 avaliações.
2. **Fontes e parser.** Os quatro diplomas novos em `fontes.json` (4.2), e o parser passa
   a guardar o `href` das anotações (achado F).
3. **As bases.** `data/atributos.json`, gerado **por script** a partir do código (a
   serialização é mecânica, não se redigita texto jurídico), com ids numéricos (1 a 22, na
   ordem do catálogo), `dispositivos` e `redacoes`. E `data/historico-legislativo.json` com os eventos dos
   dispositivos dos atributos, extraídos do compilado. A chave canônica entra também nos
   tipos (4.1), mas o histórico deles é a frente 4, com a mesma máquina.
4. **O derivado e a validação.** `static/data/atributos.json`, com a última alteração e o
   alcance, `total_atributos` no `qualidade.json` e as checagens de 4.6 na CI.
5. **A troca.** `src/lib/atributos` (carregador e avaliadores), e os cinco consumidores da
   seção 1 passam a ler a nova base.
6. **A prova.** O teste de equivalência roda contra o congelamento do commit 1 e precisa
   dar zero diferença. Com ele verde, `src/lib/atributos/catalogo/` é apagado.
7. **O texto.** `docs/atributos-penais.md`,
   `docs/metodologia.md`, `docs/dados-abertos.md` (novo arquivo público
   `static/data/atributos.json`, e o novo formato da `chave_dispositivo`) e o registro do
   Arquivista. Sem nota de changelog: até a v1.0.0 não se criam entradas (frente 2).

**Depois, em PRs próprios, porque mudam resultado:** a data do fato no caso concreto
(achado C) e o que o inventário acrescentar.

---

## 7. Os atributos no acervo histórico

O acervo registra a história dos atributos com a mesma base e o mesmo cuidado dos tipos:

- **Um atributo nasce.** O ANPP entrou no CPP (art. 28-A) com a Lei 13.964/2019: antes
  disso, nenhum tipo o alcançava.
- **Um parâmetro muda.** O inciso V do art. 112 da LEP foi de 40% a 70%, e o art. 61 da
  Lei 9.099/95 foi de um a dois anos.
- **Um parâmetro morre.** O inciso VI-A do art. 112, com 55% para o primário condenado
  por feminicídio, foi incluído pela Lei 14.994/2024 e revogado pela Lei 15.358/2026.
  Ambas as anotações estão no compilado.

Nada disso se apaga. O atributo ou o parâmetro que deixa de valer ganha fim de vigência e
passa ao acervo, como o tipo revogado: continua regendo o fato anterior. A linha do tempo
do acervo mostra tipos e atributos lado a lado, porque a pergunta de pesquisa é a relação
entre os dois ao longo do tempo: o que acontece com o acesso a um atributo quando a pena
de um tipo muda, e com o alcance de um tipo quando o patamar de um atributo muda.

---

## 8. Em aberto

- **O escopo do inventário.** Decisão adiada até se ter feito o trabalho.
- **A alavanca "fato anterior a 08/05/2026" na busca por atributo** (4.4).
- **Datas exatas.** O compilado dá norma, ano e link. A data de publicação e a de vigência
  exigem abrir a lei alteradora: é um segundo passo mecânico, com o link já na mão.
- **Súmulas.** São fonte sem histórico legislativo. O acompanhamento delas é o robô dos
  tribunais.
- **`docs/atributos-penais.md`.** Hoje as tabelas de patamares são escritas à mão.
  Geradas a partir de `static/data/atributos.json`, como a página de completude, elas
  deixariam de envelhecer em silêncio.
