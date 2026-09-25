# AtlasPen

**Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo.** Uma base aberta com
**todos os tipos penais brasileiros em vigor** e os institutos que a lei liga a cada um —
ANPP, transação, substituição, progressão, livramento, prescrição e os demais —, com motor
de cálculo e simulação de alteração legislativa.

**1.529 tipos penais**, de 66 diplomas, conferidos contra o texto compilado do
`planalto.gov.br`. Astro + React + TypeScript sobre JSON versionado. Sem servidor, sem
banco: tudo o que a ferramenta sabe é arquivo de texto que você pode ler, conferir e
corrigir por pull request.

> **Em pesquisa.** Os cálculos simplificam controvérsias doutrinárias e jurisprudenciais.
> **Não constituem aconselhamento jurídico.** O que o catálogo não sabe, ele diz que não
> sabe: nenhum campo é preenchido por plausibilidade.

---

## Para quem usa os dados

Os dados são abertos e estáveis. Você não precisa clonar nada.

| endereço | o que é |
|---|---|
| [`/data/crimes.json`](https://amorim-rc.github.io/atlaspen/data/crimes.json) | o catálogo completo, um objeto por tipo penal |
| [`/data/atributos.json`](https://amorim-rc.github.io/atlaspen/data/atributos.json) | os 22 atributos, com parâmetros, fundamento e o alcance sobre o catálogo |
| [`/data/qualidade.json`](https://amorim-rc.github.io/atlaspen/data/qualidade.json) | o relatório de qualidade de cada geração |
| [`/data/changelog.json`](https://amorim-rc.github.io/atlaspen/data/changelog.json) | o que mudou na lei, entrada a entrada |
| [`/data/atlaspen-base.xlsx`](https://amorim-rc.github.io/atlaspen/data/atlaspen-base.xlsx) | a base inteira em planilha, assinada e datada: Leia-me, Tipos penais, Atributos e a matriz de alcance |

O contrato dos campos, a política de versionamento e a forma de citar estão em
[Dados abertos](https://amorim-rc.github.io/atlaspen/projeto/dados-abertos).

**Três coisas que evitam erro de leitura:**

- **`id` é a URL pública e nunca é reatribuído.** Um id que sai do catálogo vai para
  `data/ids-aposentados.json` e não volta a ser usado. A numeração foi reiniciada duas
  vezes, em 31/07 e 06/08/2026, por decisão registrada: id anterior a essas datas se refere
  a outro crime.
- **Pena em meses**, sempre, no campo canônico (`pena_min_meses`, `pena_max_meses`). Os
  rótulos legíveis vêm à parte.
- **Campo condicional não é campo vazio.** Quando a lei não decide pelo tipo —
  `hediondo_condicao`, `acao_condicao`, `violencia_condicao` —, o campo principal fica no
  valor seguro e a hipótese fica escrita ao lado, em texto. Ler só o campo principal e
  ignorar a condição é ler metade.

## O que a ferramenta faz

- **Tipos penais** (`/tipos`) — busca por nome, artigo, lei ou observações, com filtros
  combinados: modalidade de pena, hediondez, elemento subjetivo, violência e grave ameaça,
  ação penal, menor potencial ofensivo. Cada tipo tem ficha própria (`/tipos/{id}`), com a
  pena cominada, a pena concreta e o histórico do dispositivo.
- **Atributos penais** (`/atributos`) — cada instituto com ficha própria, **parâmetros
  editáveis** (mexa na fração da progressão e veja o alcance mudar) e o alcance sobre o
  catálogo em duas unidades: dispositivos e cenários.
- **Simulação legislativa** (`/simulacao`) — criar, modificar ou extinguir um tipo ou um
  atributo, em pacote, e medir o que entra, o que sai e o que não se move. O link é a
  hipótese; a nota sai em PDF, markdown e CSV.
- **Acervo histórico** (`/acervo`) — os tipos que saíram de vigência, com a linha do tempo
  da lei penal desde 1822.

## Arquitetura

### O caminho de um dado

```
texto compilado do Planalto          data/*.json              static/data/*.json
 (crawler/snapshots/, 48 MB,   ──▶    a FONTE, editável  ──▶   o DERIVADO, consumido
  fora do versionamento)              à mão e por PR            pelo site e pela API
                                           │
                                           └── scripts/transform_data.py
```

A separação **fonte × derivado** é a regra que mais quebra em silêncio se ignorada: quem
edita o derivado perde a edição na próxima geração, e quem testa contra a fonte testa o que
ninguém consome. O derivado é commitado, e a CI exige que esteja sincronizado.

| arquivo-fonte | o que guarda |
|---|---|
| `data/crimes.json` | o catálogo: um registro por tipo penal |
| `data/atributos.json` | os 22 atributos penais, com os parâmetros da lei e as redações de cada um |
| `data/historico-legislativo.json` | a vida de cada dispositivo: criação, alteração, revogação, com data de publicação e de vigência |
| `data/hediondos.json` | o rol do art. 1º da Lei 8.072/90 transcrito, contra o qual a hediondez de cada tipo é auditada |
| `data/modificadores.json` | agravantes, atenuantes e causas de aumento e diminuição que deslocam a moldura |
| `data/fontes.json` | os diplomas monitorados, com a URL do compilado e a *sentinela* que prova o frescor da página |
| `data/avisos.json` | ADI em curso, tese de repercussão geral, divergência entre tribunais — com a data em que a fonte foi consultada |
| `data/conferencia.json` | a trilha: o que foi conferido contra o texto da lei, quando e por quem |
| `data/ids-aposentados.json` | os ids que já foram URL pública e saíram do catálogo |
| `data/acervo.json`, `data/marcos.json` | o acervo histórico e a linha do tempo da lei penal |
| `data/documentacao.json` | de que arquivos cada documento depende — é o que o Arquivista vigia |

### O motor de atributos

`src/lib/atributos/` recebe um **cenário** (pena, reincidência, violência, hediondez, data do
fato) e devolve, para cada atributo, **cabível / condicional / incabível**, com o fundamento
legal e o limiar que decidiu.

O cálculo é uma função pura por atributo e **lê os parâmetros dos dados** em vez de
constantes — é o que permite editar a fração da progressão na tela e ver o alcance mudar.
`src/lib/simulacao/` roda o mesmo motor sobre uma cópia do catálogo em memória: é assim que
a simulação mede o impacto de uma lei que ainda não existe.

**A data do fato escolhe a lei.** O art. 112 da LEP mudou duas vezes em 2026, em datas
diferentes — os hediondos em 25/03 e os comuns em 08/05 —, e um fato de abril cai na tabela
nova de uns e na antiga de outros. Os marcos ficam em `src/lib/tempo.ts`.

### Os robôs

Programas determinísticos, **sem inteligência artificial**, que leem a lei e comparam com o
catálogo. Nenhum deles escreve no catálogo: abrem issue, abrem PR ou imprimem relatório, e
quem decide assina. Documentação própria em [`scripts/robos/README.md`](scripts/robos/README.md).

| robô | o que faz |
|---|---|
| **Vigia** | confere a moldura de pena de cada registro contra o texto compilado |
| **Auditor** | confere hediondez, ação penal, violência e grave ameaça contra as regras escritas |
| **Sentinela** | tria o Diário Oficial da semana atrás de lei que cria ou altera tipo penal |
| **Recenseador** | varre todas as leis do ano, para que nada passe entre uma semana e outra |
| **Proponente** | transforma o que é leitura direta em PR, com a nota de atualização |
| **Arquivista** | acusa documento cuja dependência mudou depois da última releitura |

### O que impede o erro de entrar

A acuidade jurídica não se sustenta em cuidado: sustenta-se em trava. As que falham o build:

- **`transform_data.py --estrito`** — vocabulário fechado de cada campo, `id` append-only,
  hediondez afirmada sem regra que a produza, condição declarada ao lado de afirmação
  categórica, elemento subjetivo incompatível com a tentativa.
- **`hediondez.carregar()`** — recusa regra que não diga onde termina. Uma expressão sem
  âncora de fim fez `V` casar `VI`, `VII` e `VIII`, e quatro formas do roubo afirmaram
  hediondez que o rol não dá.
- **`npm run verificar`** — seis baterias, entre elas 47 casos-padrão em que a resposta
  correta está escrita à mão, com o dispositivo que a fundamenta.
- **`npm run equivalencia`** — congelamento de 22 atributos × 1.496 tipos × 4 cenários.
  Mudança de veredito só passa se for regravada de propósito, e o commit diz por quê.
- **`pytest scripts/robos/tests`** — 347 testes. Cada um guarda um caso que já deu errado.

## Rodando o projeto

```bash
npm install
npm run dev          # servidor local com hot-reload
npm run build        # build de produção
npm run preview      # testar o build localmente
```

Regenerar os dados derivados, depois de editar a fonte:

```bash
python scripts/transform_data.py --estrito --max-contradicoes=0
npm run atributos    # grava static/data/atributos.json
```

A bateria completa de verificação, na ordem, está no [`AGENTS.md`](AGENTS.md) — o mesmo
arquivo que orienta agentes de IA que trabalham no repositório. Rode-a inteira antes de
abrir PR.

## Como contribuir

As convenções do catálogo (C1 a C8), o glossário e o passo a passo estão em
[`CONTRIBUTING.md`](CONTRIBUTING.md). O essencial:

1. **Nada entra sem conferência contra o texto compilado oficial** do `planalto.gov.br`. Um
   dado errado publicado é pior que um dado ausente.
2. **Nunca preencha lacuna com plausibilidade.** Se a lei não decide, o registro diz que não
   decide — é para isso que existem os campos de condição.
3. **Trabalhe em branch própria**, com commits pequenos que expliquem o *porquê*, não o *o
   quê*. O diff já diz o quê.
4. **Correção de dado não vira nota de atualização.** O feed publica alteração de LEI; erro
   antigo que a conferência achou é conserto, e o corpo do PR diz o motivo.

Achou um erro no catálogo e não quer mexer em código?
[Abra uma issue](https://github.com/amorim-rc/atlaspen/issues) com o dispositivo e o que o
texto da lei diz. É contribuição das mais úteis.

## O que falta — e onde você pode ajudar

Esta seção substituiu o `backlog.md` em 24/09/2026. A razão é deliberada: um backlog em
arquivo separado é documento interno, e quem clona o repositório não o lê. Aqui é convite.
Vários destes itens têm solução mais elegante do que a nossa, e quem chegar de fora pode
enxergá-la melhor do que quem já olhou demais.

Se um deles te interessar, [abra uma issue](https://github.com/amorim-rc/atlaspen/issues)
antes de escrever código — alguns carregam decisões jurídicas que precisam ser combinadas.

### Antes do lançamento (v1.0.0)

A v1.0.0 é o lançamento com endereço próprio: domínio `atlaspen.org.br` no ar e o
repositório renomeado. Até lá, tudo o que puder entrar entra, para que a primeira versão
pública já saia madura.

| | o que falta |
|---|---|
| **Repositório em grupo** | Transferir para uma organização, com times e `CODEOWNERS` por área. O app de automação precisa ser reinstalado na organização, ou `regen-data`, `release` e o carimbo do conferidor param de empurrar. |
| **Endereço próprio** | Comprar o domínio e trocar `SITE_URL` em `src/site/config.ts`, o `base` do `astro.config.mjs` e um `CNAME`. Hoje é uma constante, não uma varredura. |
| **Datas de vigência** | 220 eventos do histórico já têm publicação e vigência conferidas no DOU. Falta a LC 225/2026, que tem vigência escalonada. |
| **Amostra de validação** | O protocolo está registrado e a semente é o hash do commit da versão madura. Falta o sorteio e uma segunda pessoa para a dupla conferência (κ de Cohen). |

### Depois do lançamento: módulos

Cada um com plano, financiamento e pessoas próprias. A ordem é de exequibilidade.

| | o que é |
|---|---|
| **Quantas vezes cada registro mudou** | Um contador de atualizações por tipo e por atributo, para medir a instabilidade de cada área da lei penal. |
| **22 atributos mapeados e não integrados** | Estão levantados e fora do catálogo. Os fáceis entram juntos; a **prescrição completa** é empreitada do porte de um mestrado — as regras não são simples e há modulação no tempo. |
| **A cadeia completa do histórico** | Hoje cada tipo diz a *última* lei que lhe deu texto. O módulo completa: todas as redações, em ordem, para responder "o que este artigo dizia em 2014?". É o que falta para a data do fato escolher também o TEXTO, e não só o cálculo. |
| **Acervo histórico** | O que já foi crime no Brasil: revogados, alterados e não recepcionados. A pergunta "o que deixou de ser crime, e quando?" não tem hoje ferramenta que a responda de forma estruturada. |
| **Robô dos tribunais** | Vigiar decisão de tribunal superior que muda o catálogo — ADI que retira tipo do ordenamento, tese de repercussão geral, súmula cancelada. Ver o débito técnico abaixo: metade do caminho está andada. |
| **Usabilidade, processo penal, plataforma de pesquisa** | Ganhos de uso, extensão ao que rege os atributos na prática, e exportação para pesquisa empírica. |

### Débito técnico

Coisas que sabemos que estão erradas ou incompletas, e ainda não consertamos. Estão aqui
porque dívida não declarada vira surpresa.

**1. O snapshot ruim ocupa o lugar do bom.** `scripts/robos/nucleo/baixar.py` valida a
*sentinela* — a string que prova que a página baixada é a versão fresca e íntegra — e
**grava o arquivo mesmo quando ela falha**. O `sentinela_ok` só vai para o `meta.json`, e
nenhum consumidor o lê: `vigia/conferir.py`, os dois auditores e `nucleo/dispositivo.py`
varrem os `.html` por `glob`. Quem roda `baixar.py --todas` recebe código de saída 2, mas o
snapshot ruim já está no caminho canônico. Hoje só o encadeamento do `conferidor.yml`
protege; rodando à mão, não protege.
**A correção:** gravar em `.part` e só promover quando a sentinela passar, como faz
`baixar_com_cache` do `decidendo-ghoul`. Snapshot no caminho canônico passaria a significar
"conferido", por construção.

**2. A derivação não confere o próprio fundamento.** `scripts/violencia.py` e
`scripts/acao_penal.py` devolvem `{regra, fundamento}` — mas não verificam que o trecho que
o fundamento cita existe mesmo no texto do dispositivo. É barato: o texto já está carregado
no auditor.
**A correção:** um campo `fundamento_verificado`, com a regra "sem lastro, a derivação não
vale". É o mesmo mecanismo que o `decidendo-ghoul` usa para tornar confiável uma LLM de 7B:
a nota que cita um trecho inexistente é zerada, e o relatório mostra que ela foi zerada.

**3. Meio caminho do Robô dos tribunais já existe.** O `decidendo-ghoul`, lido em
24/09/2026, traz um cliente da API pública do CNJ (DataJud) com paginação por `search_after`
e cache por página, e um leitor dos espelhos do STJ que já resolve o formato hostil do campo
`jurisprudenciaCitada`. Quando a frente abrir, começar dali em vez do zero.
**A ressalva, que é dele:** o STF bloqueia acesso automatizado por WAF, e o DataJud não tem
texto — só metadados. Para acompanhar ADI, é o DataJud por número CNJ; para súmula e
precedente, os espelhos do STJ.

**4. A grafia do dispositivo é frágil.** O campo `artigo` é texto livre, e regra que casa
nele erra em silêncio quando a grafia varia. Em 23/09/2026 isso escondeu um erro jurídico
por meses: 37 registros escreviam `§ 2º` com espaço contra 375 sem, e a exclusão que tirava
a forma culposa do art. 273 do CP do rol de hediondos nunca funcionou. A grafia foi
normalizada, mas a fragilidade continua: o campo não tem forma canônica imposta.
**A correção:** validar a grafia de `artigo` na entrada, com a mesma régua de
`scripts/dispositivo_canonico.py`.

**5. Um tipo criado na simulação não pode ser modificado por outra mudança do mesmo
pacote.** E a definição genérica de atributo novo só compara pena com limiar — fração,
prazo e valor calculado (progressão, prescrição, regime) seguem fora.

**6. Quatro arquivos que cresceram além da conta.** `src/components/simulacao/Simulador.tsx`
(997 linhas), `scripts/transform_data.py` (1.124), `src/pages/tipos/[id].astro` (906) e
`src/lib/atributos/avaliadores.ts` (815). Nenhum deles está errado — todos estão testados e
travados —, mas o tamanho já cobra pedágio de quem chega: para mudar uma regra é preciso ler
muito mais do que a regra.
**A correção:** modularizar por responsabilidade, sem mudar comportamento. O congelamento
(`npm run equivalencia`) é exatamente a rede que torna esse refactor seguro: se um veredito
se mexer, ele reprova. É uma boa primeira contribuição de quem quer entender o motor.

**7. Não há ferramenta de código morto na verificação.** A varredura de 24/09/2026 achou
seis exportações que ninguém importava, dois scripts de migração de julho e um documento
gerado que nada renderizava. Foi tudo à mão, e à mão não se repete.
**A correção:** `knip` ou `ts-prune` no `ci.yml`, com uma lista de exceções versionada. Sem
isso, daqui a três meses o morto volta a acumular e ninguém percebe.

## Documentação

Publicada no próprio site, em [`/projeto`](https://amorim-rc.github.io/atlaspen/projeto):
Metodologia, Catálogo de tipos penais, Atributos penais, Completude, Dados abertos e Os
robôs.

A árvore de `docs/` **espelha a do site**, e `docs/` é, sem exceção, o que vai ao ar:
`docs/*.md` é o grupo *Documentação* da barra lateral, `docs/textos/` é o grupo *Textos*.
O que existe só no repositório fica fora dele: os documentos de operação ficam na raiz
([`AGENTS.md`](AGENTS.md), [`TRIAGEM.md`](TRIAGEM.md), [`AUDITORIA.md`](AUDITORIA.md)) e os
planos e specs do desenvolvimento em `.superpowers/`, que é diretório de ferramenta, como
`.github/`.

## Autoria

O AtlasPen é desenvolvido pela **Equipe AtlasPen**. Quem faz o quê — desenvolvimento,
pesquisa e colaboração acadêmica — está em
[Autoria e créditos](https://amorim-rc.github.io/atlaspen/projeto/creditos).

O projeto tem como **antecedente de pesquisa** o SISPENAS, concebido em 2008 pelas
professoras **Maíra Rocha Machado** e **Marta Rodriguez de Assis Machado** (Direito GV/FGV),
em pesquisa vinculada a edital da Secretaria de Assuntos Legislativos do Ministério da
Justiça. A intuição de cruzar tipos e atributos penais, e de medir o efeito de uma mudança
legislativa sobre o conjunto, vem de lá:

> MACHADO, Maíra Rocha; MACHADO, Marta Rodriguez de Assis (coord.). **SISPENAS: Sistema de
> Consulta sobre Crimes, Penas e Alternativas à Prisão**. Revista Jurídica, Brasília, v. 10,
> n. 90, ed. esp., p. 1-26, abr./maio 2008. (Íntegra em
> [`static/artigos/`](./static/artigos/machado-machado-2008-sispenas-rev-juridica-90.pdf).)

O AtlasPen é obra nova, escrita para a lei vigente. A história completa está em
[O projeto](https://amorim-rc.github.io/atlaspen/projeto).

## Licença

**MIT com atribuição** — *AtlasPen, da Equipe AtlasPen*. Veja [`LICENSE`](./LICENSE).

Use, copie, modifique e redistribua, inclusive comercialmente. Ao usar o **código** ou a
**base de dados**, dê crédito ao AtlasPen, indique a fonte e sinalize as mudanças que fizer.
A forma de citar em trabalho acadêmico está em
[Dados abertos](https://amorim-rc.github.io/atlaspen/projeto/dados-abertos#como-citar), e o
`CITATION.cff` traz a mesma informação em formato que o GitHub e os gerenciadores de
referência leem.
