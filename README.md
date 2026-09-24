# AtlasPen

**Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo** — ferramenta aberta
de pesquisa de políticas públicas para estudar o **impacto dos atributos penais** sobre os
tipos penais brasileiros.

Construído em **Astro + React + TypeScript**. Catálogo de **1.529 tipos penais** de 66
diplomas, conferido toda semana contra o texto compilado do `planalto.gov.br`.

## Recursos

- **Tipos penais** (`/tipos`): busca por **nome, artigo, lei ou observações** e filtros
  combinados — **modalidade de pena** (reclusão, detenção, prisão simples, multa),
  hediondez, elemento subjetivo, violência/grave ameaça, ação penal, menor potencial
  ofensivo. Cada tipo tem ficha com endereço próprio (`/tipos/{id}`): a pena cominada, os
  atributos penais que ela abre ou fecha e a simulação da pena concreta.
  - A multa é uma **dimensão independente**: filtrar por "Reclusão" inclui os tipos com
    reclusão **+ multa**; combine com "Multa" para restringir.
- **Atributos penais** (`/atributos`): os 22 atributos — ANPP, transação, suspensão do
  processo, substituição por PRD, sursis, regime inicial, progressão, livramento,
  prescrição, saída temporária, detração, remição, indulto e os demais —, cada um com ficha
  própria, parâmetros editáveis e o alcance sobre o catálogo em duas unidades: dispositivos
  e cenários.
- **Simulação legislativa** (`/simulacao`): simular com um atributo penal ou com um tipo
  penal — criar, modificar, extinguir —, em pacote, e ver o que entra, o que sai e o que não
  se move. O link é a hipótese; a nota sai em PDF, markdown e CSV.
- **Acervo histórico** (`/acervo`): os tipos que saíram de vigência, com a linha do tempo
  da lei penal desde 1822.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev        # servidor local com hot-reload
```

## Build de produção

```bash
npm run build
npm run preview                    # testar o build localmente
node scripts/verificar_rotas.mjs   # teste de fumaça das rotas, sobre o build
```

## Dados

O catálogo-fonte fica em `data/crimes.json`. Os campos derivados
(`pena_privativa`, `tem_multa`, `multa_regime`, `infracao_menor_potencial`) são gerados por:

```bash
python3 scripts/transform_data.py
```

O script grava o catálogo enriquecido em `static/data/crimes.json` (consumido pelo site).
Correções manuais podem ser registradas em `CORRECOES`, no próprio script.

Os atributos penais ficam em `data/atributos.json`, e a história dos dispositivos em que
eles se fundam, em `data/historico-legislativo.json`. O derivado público, com a última
alteração legislativa e o alcance de cada atributo, é gerado depois do catálogo:

```bash
python3 scripts/validar_atributos.py
npm run atributos    # grava static/data/atributos.json
```

O acervo histórico fica em `data/acervo.json`, e os marcos da linha do tempo, em
`data/marcos.json`.

## Documentação

A documentação (Metodologia, Catálogo de tipos penais, Atributos penais, Completude,
Dados abertos, Os robôs) fica em `docs/` e é publicada no próprio site, em `/projeto`, ao
lado dos textos do grupo (`textos/`). O pipeline de conferência tem documentação própria em
`scripts/robos/README.md`. Os próximos passos possíveis estão [abaixo](#o-que-falta--e-onde-você-pode-ajudar).

## Autoria e origem

O AtlasPen é desenvolvido pela **Equipe AtlasPen**. Quem faz o quê está em
[Autoria e créditos](https://amorim-rc.github.io/atlaspen/projeto/creditos). O projeto nasceu em junho
de 2026, com o nome de trabalho *algo-pen*, como uma base com cobertura completa dos tipos
penais brasileiros, em código e dados abertos. Os créditos completos estão em
[Autoria e créditos](https://amorim-rc.github.io/atlaspen/projeto/creditos).

Na busca por um número de referência de tipos penais existentes, o projeto encontrou o
SISPENAS, concebido em 2008 pelas professoras **Maíra Rocha Machado** e **Marta Rodriguez de
Assis Machado** (Direito GV/FGV), em pesquisa vinculada a edital da Secretaria de Assuntos
Legislativos do Ministério da Justiça — o antecedente de pesquisa do AtlasPen. Desde junho
de 2026, a professora Maíra Rocha Machado colabora com o projeto:

> MACHADO, Maíra Rocha; MACHADO, Marta Rodriguez de Assis (coord.). **SISPENAS: Sistema de
> Consulta sobre Crimes, Penas e Alternativas à Prisão**. Revista Jurídica, Brasília, v. 10,
> n. 90, ed. esp., p. 1-26, abr./maio 2008. (Íntegra em
> [`static/artigos/`](./static/artigos/machado-machado-2008-sispenas-rev-juridica-90.pdf).)

O artigo original define os objetivos, o modelo de dados e a metodologia do sistema. Esta
implementação **preserva a intuição central** (catalogar tipos penais e cruzá-los com
benefícios, permitindo simular alterações legislativas) e a **atualiza**. Comparação:

| Aspecto | Proposta original (2008) | Esta implementação |
|---|---|---|
| **Arquitetura** | Software com servidor: Apache + **PHP + PostgreSQL**, com CRUD, controle de acesso e fluxo de aprovação (papéis administrador/alimentador/usuário); código entregue ao Ministério da Justiça | Site **estático** (Astro + React + TS) sobre **JSON**, publicável no GitHub Pages, sem servidor/banco; sem CRUD nem papéis |
| **Unidade "tipo"** | Conduta + circunstâncias com cominação própria; um artigo é desmembrado em várias unidades; inclui **"tipos mistos"** (margens de majorantes/minorantes pré-calculadas em abstrato) | Mesmo conceito de tipo por artigo/parágrafo, exposto via **"tipos correlatos"**; **não** gera sistematicamente os "tipos mistos" calculados (lacuna) |
| **Tamanho do catálogo** | **1.529** tipos (CP + 37 leis especiais) | **1.507** tipos (61 diplomas; meta de ~1.688) |
| **Pena (armazenamento)** | Cadastrada **em dias** (1 mês = 30 dias, 1 ano = 360 dias); exibida em anos/meses | Canônica **em meses**; exibida na **unidade natural** (dias/meses/anos), com conversão automática |
| **Multa** | Critério com conectores **"E" / "E/OU" / "OU"** (cumulativa/alternativa/isolada) | Dimensão independente: `tem_multa` + `multa_regime` (`cumulativa`/`alternativa`/`isolada`/`nenhuma`), espelhando os conectores |
| **Critérios "em abstrato"** | 9: pena mín., pena máx., tipo de prisão, multa, violência, grave ameaça, hediondo, elemento subjetivo, vedação específica | Mesmos critérios como filtros; acrescenta ação penal e menor potencial ofensivo |
| **Benefícios (hoje, atributos penais)** | Composição civil, transação, suspensão do processo, substituição por PRD/multa, sursis (2-4 e 4-6 anos), limite de cumprimento (30 anos), livramento (1/3, 1/2, 2/3), regime inicial | Conjunto **atualizado à lei vigente**: **ANPP** (Lei 13.964/2019), transação, suspensão do processo, substituição por PRD, sursis, regime inicial, **progressão**, livramento, **prescrição**, **saída temporária**, **detração**, **remição**, **indulto** |
| **Consultas cruzadas** | Dois sentidos: tipo → benefícios **e** benefício → tipos atingidos | Os dois sentidos, com recálculo dinâmico: **tipo → atributos** (ficha do tipo penal) e **atributo → tipos atingidos** (ficha do atributo) |
| **Simulação** | Entidades "simuladas" **persistidas** e marcadas no banco, para projetos de lei | Simulação **efêmera**: na ficha do tipo, a pena concreta e as circunstâncias; em `/simulacao`, um pacote de mudanças em tipos e atributos. Nada é persistido — o estado vive no link |
| **Atualização dos dados** | Cadastro manual por "alimentadores", com aprovação | Carga inicial via planilha; manutenção por **conferência semanal determinística** contra o texto compilado, que abre issue e PR — sem IA. Criar, remover e reclassificar continua humano |
| **Critérios concretos** | Ex.: reincidência exibida como "critério não-generalizável" (descritivo) | Circunstâncias concretas (primariedade, reincidência, confissão, etc.) entram na simulação e alteram os resultados |

### Por que as decisões diferentes

- **Estático em vez de PHP/PostgreSQL:** o objetivo aqui é uma ferramenta de pesquisa
  pública, versionada em Git e publicável no GitHub Pages, sem custo de servidor/banco. O
  preço disso é abrir mão de CRUD, papéis de usuário e do fluxo de aprovação do original —
  substituídos por um pipeline de dados (planilha → `data/crimes.json` → build) e pela
  conferência semanal contra a fonte oficial.
- **Pena em meses + exibição natural:** o original armazenava tudo em dias por limitação
  técnica; aqui a conversão dias/meses/anos é automática e a exibição usa a unidade natural
  ("15 dias", "1 a 4 anos"), evitando leituras confusas.
- **Conjunto de atributos atualizado:** o artigo é de 2008 e antecede a **ANPP** e outras
  mudanças (ex.: limite de cumprimento hoje é de 40 anos). O motor foi reescrito para a
  legislação atual. Um instituto do original, a composição civil dos danos, ainda não tem
  card próprio: está entre os módulos, [abaixo](#o-que-falta--e-onde-você-pode-ajudar).
- **Simulação efêmera:** para uso exploratório imediato, a simulação acontece na tela sem
  necessidade de gravar "tipos simulados", como fazia o sistema original voltado ao
  Ministério da Justiça.

### Lacunas conhecidas em relação ao original

- ~~Cobertura do catálogo~~ — fechada em 24/09/2026: são 1.529 tipos, o mesmo número do
  original de 2008. Falta a geração de "tipos mistos" (majorantes/minorantes).
- Instituto ainda sem card: a composição civil dos danos.

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

## Aviso

Ferramenta destinada à **pesquisa e simulação**. Os cálculos simplificam controvérsias
e **não constituem aconselhamento jurídico**. Parte dos dados foi derivada
automaticamente do texto legal e será revisada individualmente.

## Licença

**MIT com atribuição** — *AtlasPen, da Equipe AtlasPen*. Veja [`LICENSE`](./LICENSE).
