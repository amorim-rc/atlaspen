# AtlasPen

**Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo** — ferramenta aberta
de pesquisa de políticas públicas para estudar o **impacto dos atributos penais** sobre os
tipos penais brasileiros.

Construído em **Astro + React + TypeScript**. Catálogo de **1.507 tipos penais** de 61
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
`scripts/robos/README.md`. Os próximos passos possíveis estão em [`backlog.md`](backlog.md).

## Origem e proposta original × implementação atual

O AtlasPen retoma o SISPENAS, concebido em 2008 pelas professoras **Maíra Rocha Machado** e
**Marta Rodriguez de Assis Machado** (Direito GV/FGV), em pesquisa vinculada a edital da
Secretaria de Assuntos Legislativos do Ministério da Justiça:

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
  card próprio: está na frente 10 do [backlog](backlog.md), com os atributos mapeados.
- **Simulação efêmera:** para uso exploratório imediato, a simulação acontece na tela sem
  necessidade de gravar "tipos simulados", como fazia o sistema original voltado ao
  Ministério da Justiça.

### Lacunas conhecidas em relação ao original

- Cobertura do catálogo (1.507 vs 1.529) e geração de "tipos mistos" (majorantes/minorantes).
- Instituto ainda sem card: a composição civil dos danos.

## Aviso

Ferramenta destinada à **pesquisa e simulação**. Os cálculos simplificam controvérsias
e **não constituem aconselhamento jurídico**. Parte dos dados foi derivada
automaticamente do texto legal e será revisada individualmente.

## Licença

**MIT com atribuição** à **Equipe AtlasPen**. Veja [`LICENSE`](./LICENSE).
