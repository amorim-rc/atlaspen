# Backlog

O que o projeto pode fazer a seguir. É a referência de próximos passos e substituiu o
roadmap em 10/09/2026.

**Como ler.** As frentes estão numeradas de 1 a 16 **na ordem de exequibilidade**, em duas
fases. A numeração foi refeita em 11/09/2026. Quem renumerar de novo atualiza as citações
no resto do repositório (`git grep -n "frente [0-9]"`). Cada frente diz o que se quer,
**o que já se sabe** (achados tirados do código e dos dados, não de memória), o que foi
decidido e o que falta. O glossário, que foi uma frente, está concluído e mora no
`CONTRIBUTING.md`.

---

## A estratégia: lançar enxuto, crescer por módulos

Decisão da equipe em 10/09/2026. O lançamento oficial, a **v1.0.0**, sai com uma versão
enxuta:

1. **todos os tipos penais**, que são o grande atrativo da ferramenta;
2. **os 22 atributos penais que já existem**, migrados para dados;
3. **só normas vigentes**.

O que for difícil vira **módulo**, depois do lançamento, com plano próprio, financiamento
e pessoas alocadas. O caso que fixou a regra é a prescrição completa. Ela ajuda muito na
atuação profissional, mas as regras não são simples e há modulação no tempo. Pensá-la e
implementá-la é empreitada do porte de um mestrado. O recuo histórico segue o mesmo
caminho. Os 22 atributos novos já mapeados, inclusive os fáceis, ficam juntos na
frente 10.

O site será reconstruído, com nova arquitetura e novo framework. Até lá, **o que importa
é a base de dados**: nenhuma frente investe em compatibilidade de endereços do site
atual.

| Fase | Frentes |
|---|---|
| **1. Até o lançamento** | 1 a 8 |
| **2. Módulos** | 9 a 16 |

---

# Fase 1: até o lançamento (v1.0.0)

## 1. Repositório pronto para trabalho em grupo

**Situação: em andamento, sem data definida para o que falta.** O que já está feito
vai riscado.

- ~~Ruleset da `main` ativo: PR obrigatório, aprovação de Code Owner, CI verde, sem
  force-push nem deleção, bypass para o admin e para o app de automação (a parte da CI e
  do bypass de admin foi confirmada no push de 10/09/2026)~~
- ~~Os PRs do mantenedor entram por bypass de admin, porque o GitHub não deixa ninguém
  aprovar o próprio PR~~
- ~~Template de PR reescrito: fonte legal, verificação completa, Arquivista, uso de agente
  de IA, changelog e versão suspensos até a v1.0.0~~
- ~~CODEOWNERS com os caminhos atuais, do geral para o específico, com o time futuro de
  cada linha anotado~~
- ~~Modelos de issue atualizados~~

**Falta.**

- **Transferir o repositório para uma organização**, com três pessoas de início: o
  mantenedor e mais duas, que ainda vão criar conta no GitHub. Na transferência:
  - o endereço `amorim-rc.github.io/sispenas` deixa de responder. Como o site não é
    consumido e será reconstruído, isso só afeta os links passados à equipe;
  - o app de automação é instalado por conta. Depois da transferência, precisa ser
    instalado na organização; se for app privado, o próprio app tem de ser transferido.
    Sem isso, `regen-data`, `release` e o carimbo do conferidor param de empurrar;
  - criar os times (o `CODEOWNERS` sugere jurídico, engenharia e conteúdo), dar a eles
    permissão de escrita e trocar `@amorim-rc` linha a linha.
- **Com que credencial o Codex roda**, e quem enxerga os secrets.
- **Convenção de branch e de commit** para três pessoas e dois agentes. Hoje ela está no
  `AGENTS.md`, só para agentes.
- **Conferir no GitHub** o resto do decidido em 30/07/2026: o ruleset de tags `v*` e o
  Environment `automacao`, restrito à `main`, que guarda a chave do app. Desta máquina
  não dá para ler as configurações: o `gh` não está instalado e o conector do GitHub não
  está autorizado.

**Os cinco workflows, para referência.**

| Workflow | Quando roda | Escreve na `main`? |
|---|---|---|
| `ci` | PR e push na `main` | não |
| `deploy` | push na `main` (Pages) | não |
| `regen-data` | push na `main` | sim: regenera o derivado |
| `release` | push na `main` | sim: tag e Release (parado enquanto a versão for `0.x`) |
| `conferidor` | segunda-feira, 8h UTC | sim: carimbo da conferência, issues e PR do Proponente |

Três deles escrevem direto na `main` pelo app: é por isso que o bypass do app existe, e
ele não pode sair.

---

## 2. ~~Versionamento até o lançamento oficial~~ — concluída

**Concluída em 11/09/2026.** O projeto está em `0.0.0` e nada é publicado até a
**v1.0.0**, o lançamento oficial, com domínio. A regra está no `AGENTS.md`.

**Revista em 14/09/2026.** O feed de notas volta a registrar, já em `0.0.x`, as alterações
de lei, com a natureza em termos penais; a primeira leva, a v0.0.1, traz as leis penais de
2026. A Release no GitHub continua suspensa até a v1.0.0.

**Decidido em 10/09/2026.** Retirar a numeração até o lançamento, porque os números
antigos nunca existiram como lançamento (renumerá-los em `v0.0.X` foi descartado).
Expurgar as Notas de atualizações; depois da v1.0.0, o feed publica exclusivamente
alterações que criem, modifiquem ou extingam tipos penais ou atributos penais, e as
Releases do GitHub são enxugadas.

**Roteiro.** O que está feito vai riscado.

1. ~~Expurgar as 101 Notas de atualizações e deixar na página só o aviso de que ela será
   alimentada depois da v1.0.0~~
2. ~~Parar o `release.yml` enquanto a versão for `0.x`~~
3. ~~Fazer o Proponente parar de subir a versão e de escrever nota enquanto a versão for
   `0.x`~~
4. ~~Ajustar o `validar-changelog.mjs`: em `0.x`, qualquer entrada é erro~~
5. ~~`package.json` e `package-lock.json` em `0.0.0`, e o `CITATION.cff` citando a data em
   vez da versão~~
6. ~~Reescrever a regra no `AGENTS.md`, no `CONTRIBUTING.md`, no guia de entradas, na
   seção Estabilidade e versionamento de Dados abertos e na skill do catálogo~~
7. ~~Apagar as 42 Releases e tags antigas, de v1.0.0 a v2.0.6 (feito pelo mantenedor)~~

**Oportunidade que só existe antes da 1.0.0.** Até o lançamento, `?tipo=N` e as URLs
ainda não são contrato com o público. Se o nome (frente 3), o domínio e a numeração dos
ids vão mudar, o momento de mudar é antes da v1.0.0, numa virada só.

---

## 3. Novo nome do projeto, e talvez nova identidade visual

**Objetivo.** Renomear o projeto. Pode incluir rebranding. Está na fase 1 porque o
lançamento sai com domínio próprio, e nome e domínio devem mudar juntos.

**O que já se sabe.**

- O nome aparece no repositório (`amorim-rc/sispenas`), no `baseUrl` do site
  (`/sispenas/`), no `package.json`, no `CITATION.cff`, no logo, no favicon, no social
  card, no rodapé, na página inicial e em toda a documentação. O nome expandido é, desde
  10/09/2026, "Sistema de Pesquisa de Tipos e Atributos Penais".
- O nome atual homenageia a pesquisa de origem (Machado & Machado, 2008). O novo nome
  deve manter essa linhagem explícita na seção Origem e na citação.
- O endereço `github.io` do Pages **não** redireciona quando o repositório é renomeado ou
  transferido. Com o site ainda sem uso público, isso não pesa agora; pesa no lançamento,
  quando as URLs viram contrato.

**Passo a passo do domínio, já levantado (30/07/2026).**

1. Registrar o domínio (ex.: Registro.br).
2. DNS: no apex, registros `A` para `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153` e `185.199.111.153` (opcionalmente `AAAA` para `2606:50c0:8000::153`
   a `:8003::153`); em `www`, `CNAME` para o endereço do Pages.
3. GitHub: Settings ▸ Pages ▸ Custom domain, aguardar a checagem de DNS e marcar
   Enforce HTTPS.
4. Verificar o domínio na conta ou na organização (Settings ▸ Pages ▸ Verified domains),
   o que impede apropriação por terceiros.
5. No repositório: `site` e `base` no `astro.config.mjs`, `SITE_URL` em
   `src/site/config.ts`, e as URLs absolutas (README, CITATION).

**Próximo passo, do mantenedor:** um plano completo de revamp, com nome provisório. Ele
decide o nome, a marca e o que combina com a reconstrução do site.

**Em curso (14/09/2026).** O revamp adota o nome provisório AtlasPen no que o leitor vê.
Falta a validação da equipe inteira e a compra do domínio atlaspen.org.br; só então mudam a
URL, o repositório e os robôs. Ver "Pendências do revamp AtlasPen", no fim desta fase.

---

## 4. Histórico legislativo: a última alteração de cada registro

**Objetivo.** Registrar, para cada moldura de pena e cada atributo penal, a data da
atualização e o número e o link da lei que a alterou.

**Nesta fase, só a última alteração**: norma, ano e link para o item no Planalto, em cada
tipo e em cada atributo. Ela é mecânica, porque o compilado já traz esse link em cada
anotação ("Redação dada pela Lei nº…"). A cadeia completa é a frente 11.

**Decidido em 10/09/2026: a chave é o dispositivo**, e não o id, por três razões:

- **o histórico é do texto da lei, não do catálogo.** Ele existe antes do registro e já
  teria atravessado os dois reinícios da numeração dos ids;
- **uma lei alteradora atinge vários dispositivos de uma vez**, e o evento fica gravado
  em cada dispositivo sem depender de quais ids o catálogo tem naquele momento;
- **os atributos penais também têm dispositivo de origem** (a progressão, o art. 112 da
  LEP), e o mesmo arquivo serve aos dois.

A `chave_dispositivo` atual não serve como está: ela usa o rótulo do catálogo, e o CP
aparece sob quatro rótulos. A chave canônica é `<id do diploma em data/fontes.json>|
<dispositivo>` (`cp|art. 121, caput`, `lep|art. 112, vi, c`).

**Esquema proposto.** `data/historico-legislativo.json` é a fonte, append-only: um
objeto por chave, com a lista de eventos em ordem cronológica. Cada evento traz a ação
(incluído, redação, revogado…), a lei alteradora (número, ano e link), as datas de
publicação e de vigência, o valor antes e depois quando é número, a natureza (alteração
legislativa ou correção de dado) e a origem da informação. A data da última alteração é
**derivada** pelo `transform_data.py`; ninguém a digita. Detalhes em
`estudos/modelo-atributos.md`, seções 4.1 e 4.5.

**Plano, em PRs pequenos (11/09/2026).**

1. ~~O parser do Vigia guarda o `href` das anotações, que traz a URL da lei alteradora e
   a âncora do artigo~~ (feito em 11/09/2026).
2. A chave canônica de dispositivo, no lugar da `chave_dispositivo` atual. É a chave
   estrangeira que cada registro de tipo penal leva para o histórico (ver a frente 9).
3. ~~A LEP, o CPP, a Lei 9.099/95 e a CF entram em `data/fontes.json`, como referência,
   com URL e sentinela conferidas~~ (feito em 11/09/2026).
4. O Vigia registra, para cada tipo que confere, a anotação da redação vigente e o link
   dela; o `transform_data.py` deriva a última alteração no catálogo.

O evento `revogado` do mesmo esquema é o molde da base de tipos revogados da frente 12.

---

## 5. ~~Atributos penais versionados em dados~~ — concluída

**Concluída em 12/09/2026**, na branch `frente-5-atributos`. Os 22 atributos saíram do código:

- `data/atributos.json` é a base: 72 parâmetros, id numérico, os dispositivos em chave
  canônica e as redações de cada parâmetro, com cada norma conferida contra o compilado;
- `data/historico-legislativo.json` guarda os eventos dos 74 dispositivos citados,
  extraídos do compilado por `scripts/robos/nucleo/historico.py`;
- `static/data/atributos.json` é o derivado, com a última alteração legislativa e o
  alcance de cada atributo;
- no código ficou só `src/lib/atributos/avaliadores.ts`, e o teste de equivalência provou
  que o cálculo não mudou;
- a CI valida a base (`scripts/validar_atributos.py`, que cobre o "CI de validação" herdado
  do roadmap) e exige o derivado sincronizado.
- A saída temporária passou à redação da Lei 14.843/2024 (13/09/2026): vedada a crime
  hediondo ou com violência ou grave ameaça contra pessoa, e só para estudo.

**Ficou para depois**, em PRs próprios, porque muda resultado ou é de outra frente:

- **Oito unidades sem data** no compilado (CP, art. 33, §2º, "a" e "b"; art. 107, IX;
  art. 109, I a V). Quem as data é a cadeia completa do histórico (frente 11).
- **Capitular partida** no parser do Vigia ("A rt. 107"), que pendura os incisos do art.
  107 do CP no art. 106 (frente 4).
- A data do fato no caso concreto (achado C do estudo) e o permalink de simulação.

O que se decidiu, e como: [`estudos/modelo-atributos.md`](estudos/modelo-atributos.md).

---

## 6. Revisão da ação penal, começando pelo método de registro

**Objetivo.** Revisar todas as ações penais registradas, começando por como elas são
registradas. Está na fase 1 porque o campo é publicado com todos os tipos, e dado errado
publicado é pior que dado ausente.

**O que já se sabe (derivado da v2.0.6).**

| `acao` | registros |
|---|---|
| Pública Incondicionada | 1.446 |
| Pública Condicionada | 33 |
| Ação Penal Privada | 27 |
| Privada | 1 |

- **O vocabulário não é fechado.** "Privada" (id 730, CP, art. 138, §1º) e "Ação Penal
  Privada" são a mesma categoria com dois rótulos, e o filtro da Busca por tipo penal
  mostra as duas como opções distintas.
- "Pública Condicionada" não distingue **representação** de **requisição do Ministro da
  Justiça**.
- Só 7 registros usam `acao_condicional` / `acao_condicao`.
- Nenhum registro diz **de onde vem** a espécie de ação. Pela regra geral (art. 100 do
  CP), o silêncio da lei faz a ação pública incondicionada. Não se sabe quais dos 1.446
  são regra geral e quais são previsão expressa.

**Proposta de método, ponto de partida para o estudo com o grupo**, de onde sai o
método (decisão de 11/09/2026).

- Vocabulário fechado e imposto pela CI: pública incondicionada; pública condicionada à
  representação; pública condicionada à requisição; privada; privada personalíssima
  (art. 236, parágrafo único, do CP). A ação privada subsidiária da pública fica fora:
  cabe em qualquer crime de ação pública e não é campo do tipo.
- Um campo de **fundamento**: o dispositivo que define a ação (arts. 145 e 225 do CP,
  art. 171, §5º, art. 88 da Lei 9.099/95…) ou a marca "regra geral, art. 100".
- **Temporalidade.** A espécie de ação muda por lei: a Lei 13.718/2018 alterou o
  art. 225 do CP e a Lei 13.964/2019 incluiu o §5º do art. 171. Nesta fase basta a
  redação vigente; a sucessão é da frente 11.

**Primeiro passo.** O estudo com o grupo fecha o vocabulário e o campo de fundamento.
Depois, escrever a convenção no `CONTRIBUTING.md` e revisar primeiro os 61 registros que
não são incondicionados; em seguida, uma amostra dos incondicionados.

---

## 7. Amostra qualitativa para validação técnico-científica

**Objetivo.** Extrair uma amostra qualitativa dos registros para validar os achados.

**Perguntas para o estudo com o grupo**, de onde sai o desenho da amostra (decisão de
11/09/2026):

- **Estratificação:** por diploma, espécie de pena, origem do registro (criado à mão ×
  `derivado_auto`) e campos condicionais (`hediondo_condicao`, `acao_condicao`,
  `pena_por_remissao`, `vigencia_ate`).
- **Tamanho** e critério de suficiência.
- **Quem valida e como:** dupla codificação, concordância entre avaliadores. A planilha
  `docs/sispenas-revisao.xlsx` pode servir de instrumento.
- **O que conta como erro**, com as mesmas categorias da conferência.

**Condições.** Reprodutível: semente e script no repositório. E presa a um estado fixo do
catálogo (um commit marcado), para que a validação diga respeito a algo conhecido. O erro
encontrado vira correção pelo fluxo normal, nunca exceção.

**Relação com 6.** Validar a ação penal antes de revisar o método mede um campo que vai
mudar. Por isso vem depois dela.

---

## 8. Pena cominada separada da pena concreta

**Objetivo.** Separar a exibição e a descrição da pena cominada das da pena concreta.
**Vai junto com a reconstrução do site, que traz os detalhes.**

**Como é hoje** (para servir de ponto de partida):

- Na página do tipo penal, a coluna "Pena cominada — simulação legislativa" traz as
  barras da mínima, da máxima **e** da pena concreta aplicada, juntas.
- A pena concreta tem três origens, nesta precedência: **concurso de crimes >
  dosimetria > barra manual** (`src/components/Pesquisa/Detalhe.tsx`).
- Na busca por atributo, a pena concreta dos atributos de natureza `concreto` é
  **presumida** para varrer o catálogo, com base selecionável e padrão na mínima
  cominada.

---

## Pendências do revamp AtlasPen, antes de ir ao ar

Registradas em 14/09/2026, na branch `revamp/atlaspen`. O mantenedor trata todas antes de
o site novo ir ao ar. Sem número de frente, para não renumerar o resto.

### Simulação legislativa: o que a primeira versão não faz

- **Premissa fixa.** A varredura presume réu primário, condenado na pena mínima cominada
  nos atributos que dependem da pena aplicada. A tela não oferece os controles de premissa
  que a ficha do atributo tem (base da pena concreta, circunstâncias do réu).
- **Campos livres do tipo.** Espécie de pena (reclusão ou detenção) e ação penal ficaram de
  fora porque o motor não os lê. Entram quando algum atributo passar a lê-los; o regime
  inicial do art. 33 do CP depende da espécie e é o primeiro candidato.
- **Tipo modificado.** Nome e dispositivo não se editam, e o elemento subjetivo só alterna
  entre doloso e culposo. Um tipo criado no pacote não pode ser modificado por outra
  mudança do mesmo pacote.
- **Atributo novo.** A definição genérica tem um limiar só (até ou acima dele), sobre uma
  pena. Não cobre frações, prazos nem valores calculados (progressão, prescrição, regime),
  nem mais de um limiar.
- **Etiqueta das mudanças em atributo.** Só aparece quando a mudança só alarga ou só
  estreita o alcance. A que só altera valores (prazo, fração, regime) fica "sentido não
  classificado".
- **Regime inicial** não entra na extinção de atributo.
- **Nota exportada.** O identificador é `AAAA-MMDD-XXXX`, um resumo da hipótese, e não um
  contador (não há servidor); não há link curto, e o link completo é a hipótese. A versão do
  catálogo e a data da conferência vão escritas na nota, mas o link reabre sobre o catálogo
  do dia: não há arquivo das versões antigas para refazer a conta na base citada. O PDF é a
  impressão do navegador, e o CSV traz só os pares que mudam.
- **Fora do cálculo.** A simulação não mexe na dosimetria nem na moldura concreta, só nos
  atributos. O denominador de "atingidos" é a união do catálogo vigente com o simulado.
- **Testes.** Há testes do motor e da URL (`scripts/verificar_simulacao.ts`); não há teste
  de interface nem medida de desempenho além de 22 atributos × 1.472 tipos.

### Dados e conteúdo

- **Linha do tempo.** Conferir as 16 datas de `data/marcos.json`.
- **Acervo.** São 25 registros (o desenho dizia 27). Texto original e data exata da
  revogação estão ausentes em todos, e declarados como ausentes.
- **História do projeto** (`textos/historia.md`). Conferir o início da retomada (primeiro
  commit em 22/06/2026), as "três pessoas de início" e os nomes da equipe de 2008. O
  exemplo do artigo de 2008 sobre a Lei 11.313/2006 fala em pena mínima onde a regra do
  art. 61 da Lei 9.099/95 é a máxima, e não foi reproduzido.
- **Notas de 2026.** O repositório só tem a vigência das Leis 15.397 (04/05/2026) e 15.402
  (08/05/2026); as datas de publicação das demais ficaram de fora, porque o Planalto não
  respondeu nas sessões de 14/09/2026. Pelo mesmo motivo, os links das notas para as Leis
  15.355, 15.383, 15.384, 15.397, 15.410 e 15.487 seguem o padrão de endereço do Planalto (o
  mesmo dos links já conferidos das Leis 15.358 e 15.402) sem terem sido abertos: conferir
  um a um.
- **Lei 15.348/2026 (Auxílio Gás do Povo).** Entre as leis que ela altera está a 8.176/91;
  pelo registro do catálogo, restringiu o art. 1º, II, ao uso de GLP para fins automotivos.
  Não virou nota: reduzir o alcance do tipo pede decisão entre *in mellius* e *abolitio*
  parcial.
- **Natureza das notas.** Aplicou-se a régua do contrato: *incriminadora* é o dispositivo
  com pena própria que entra no catálogo, inclusive as formas qualificadas e as causas de
  aumento com moldura própria. Confirmar se o grupo quer essa leitura ou a doutrinária, em
  que a forma nova de conduta já punível é *in pejus*.
- **Proponente.** A régua "lei deste ano ou do anterior" (`ANOS_DE_LEI_RECENTE`) é
  heurística; validar com as primeiras rodadas reais.
- **Última alteração dos tipos.** A ficha do tipo diz "ainda não datada" até entrar a coleta
  das datas de redação.

### Nome, endereço e robôs

- A URL do site (`amorim-rc.github.io/sispenas`), o nome do repositório e os robôs
  (`sispenas-automacao`, `sispenas-bot`) mudam quando o nome for validado pela equipe
  inteira e o domínio **atlaspen.org.br** for comprado. Um PR só, com a camada de
  redirecionamento de `src/site/redirecionamentos.ts`.
- "Equipe AtlasPen" permanece, por enquanto, como titular na LICENSE e no CITATION.

### Interface

- Os textos do site passam por revisão do mantenedor.
- O parâmetro `?em=` (eixo temporal, desenho 4c) segue reservado e sem implementação.
- Decisões de acuidade tomadas no revamp, a confirmar: frações canônicas (1/3) no lugar das
  aproximações decimais dos dados; os 35 tipos sem pena privativa sem vereditos; "bons
  antecedentes" fora da ficha, porque o motor não o lê; perfil do réu com dois estados; o
  editor de moldura da ficha recolhido; o símbolo colorido todo no acento.

---

# Fase 2: módulos, com plano, financiamento e pessoas

Cada frente desta fase pede plano próprio e, em geral, pessoas interessadas no tema.

## 9. Quantas vezes cada registro mudou

**Objetivo.** Registrar, em cada tipo penal e em cada atributo, quantas atualizações ele
sofreu desde a criação. A decisão e o esquema podem vir primeiro; a contagem em si sai da
cadeia completa da frente 11.

**Decidido em 11/09/2026: não versionar o id.** A contagem sai do histórico legislativo,
e cada registro de tipo penal leva uma chave estrangeira para ele: a chave canônica de
dispositivo (frente 4).

- O `id` é a URL pública (`?tipo=N`) e é append-only. Pôr versão nele (`123.4`) faria
  cada alteração legislativa trocar a URL citada.
- O que se quer é **identidade estável mais histórico**. O id fica como está, o
  histórico é a fonte, e a contagem é **derivada**, não digitada.
- Se for preciso citar um estado específico, um permalink de data resolve sem tocar no
  id: `?tipo=N&em=AAAA-MM-DD`. É a mesma peça de que o acervo histórico precisa.

**Distinção que não pode se perder.** "Atualização" são duas coisas: **alteração
legislativa** (a lei mudou) e **correção de dado** (o catálogo errou e foi corrigido).
Precisam ser contadas em separado. O paper da frente 12 mede só a primeira; a segunda é
indicador de qualidade do catálogo.

---

## 10. Atributos penais mapeados e ainda não integrados

**Objetivo.** Integrar ao catálogo os **22 atributos penais mapeados** que ainda não
existem, todos nesta frente. São candidatos a conferir contra o texto compilado, não
conclusões. A faixa diz o esforço de cada um.

| # | Atributo | Fundamento | Faixa | O que exige |
|---|---|---|---|---|
| 1 | Fiança e inafiançabilidade | CPP, arts. 322 e 323; CF, art. 5º, XLII a XLIV | fácil | Pena máxima e hediondez, que o catálogo tem |
| 2 | Anistia | CF, art. 5º, XLIII; Lei 8.072/90, art. 2º, I | fácil | Vedação aos hediondos e equiparados, espelho da graça |
| 3 | Reparação do dano no peculato culposo | CP, art. 312, §3º | fácil | Um tipo só |
| 4 | Retratação | CP, art. 107, VI; arts. 143 e 342, §2º | fácil | Lista curada de poucos tipos |
| 5 | Reabilitação | CP, arts. 93 a 95 | fácil | Regra de tempo, sem patamar de pena |
| 6 | Permissão de saída | LEP, arts. 120 e 121 | fácil | Não depende de pena |
| 7 | Trabalho externo | LEP, arts. 36 e 37 | fácil | Fração da pena cumprida, como a progressão |
| 8 | Composição civil dos danos | Lei 9.099/95, art. 74 | moderado | A ação penal revista (frente 6) |
| 9 | Decadência, renúncia, perdão do ofendido e perempção | CP, arts. 103 a 106; CPP, art. 60 | moderado | Idem |
| 10 | Escusas absolutórias | CP, arts. 181 a 183 | moderado | Circunstância do caso (parentesco) e as exceções do art. 183 |
| 11 | Crimes tributários: extinção pelo pagamento e suspensão pelo parcelamento | Lei 9.430/96, art. 83; Lei 10.684/03, art. 9º | moderado | Escopo curado; o momento do pagamento é matéria de jurisprudência |
| 12 | Colaboração premiada nas leis especiais | Lei 9.807/99, arts. 13 e 14; Lei 11.343/06, art. 41; Lei 9.613/98, art. 1º, §5º; CP, art. 159, §4º; Lei 8.072/90, art. 8º, parágrafo único | moderado | Escopo por diploma |
| 13 | Violência doméstica contra a mulher | Lei 11.340/06, arts. 17 e 41; Súmulas 536 e 588 do STJ | moderado | Circunstância do caso que veda transação, suspensão do processo e substituição |
| 14 | Regime da Lei 9.605/98 | Arts. 7º, 16, 27 e 28 | moderado | Patamares próprios de substituição e sursis; transação e suspensão ligadas à reparação ambiental |
| 15 | Vedações do art. 44 da Lei 11.343/06 | Art. 44 | moderado | Parte foi afastada pelo STF: é questão jurídica, e o registro diz a condição, não a preenche |
| 16 | Multa substitutiva | CP, art. 60, §2º | moderado | Vigência controvertida diante do art. 44, §2º |
| 17 | Prescrição completa | CP, arts. 110 a 117 | complexo | Retroativa, superveniente e executória, causas suspensivas e interruptivas, e sucessão de leis (a Lei 12.234/2010 vedou a retroativa com termo anterior à denúncia). Hoje só a punitiva em abstrato é modelada |
| 18 | Regime próprio do CPM | CPM, arts. 84 e 89; Lei 9.099/95, art. 90-A | complexo | Sursis e livramento militares, e a Lei 9.099 afastada da Justiça Militar. São 394 registros |
| 19 | Sucessão de leis no caso concreto | CF, art. 5º, XL | complexo | A data do fato escolhendo a redação de cada parâmetro (estudo, achado C) |
| 20 | Cabimento da prisão preventiva pelo patamar de pena | CPP, art. 313, I | fácil | Crime doloso com pena máxima acima de 4 anos. Agrava a situação do acusado, e entra |
| 21 | Competência do Tribunal do Júri | CF, art. 5º, XXXVIII | fácil | Crimes dolosos contra a vida: lista curada. Também agrava, e também entra |
| 22 | Menor potencial ofensivo | Lei 9.099/95, art. 61 | moderado | Já é campo do catálogo (`infracao_menor_potencial`), com a regra em revisão: 29 infrações só com multa estão fora da marcação |

**Decidido em 11/09/2026:** entram também os atributos que agravam a situação do acusado,
como a preventiva e a competência do Júri. O catálogo de atributos registra o que a lei
liga ao tipo e à pena, favorável ou não.

---

## 11. A cadeia completa do histórico legislativo

**Objetivo.** Completar o que a frente 4 começa com a última alteração: **todas** as
alterações de cada tipo e de cada atributo, com data, lei e link. É a base da contagem
(frente 9) e do acervo (frente 12).

**O que já se sabe.**

- As redações anteriores que o compilado mantém no texto são parcialmente mecanizáveis:
  o parser as lê, mas a ligação de cada redação à sua lei exige conferência.
- O que é anterior ao compilado, ou que o compilado não guarda, é trabalho manual.
- O conteúdo que muda de lugar (um inciso que vira artigo próprio) pede um evento de
  **transferência** que ligue as duas chaves. Exemplo a conferir no compilado: o
  feminicídio, que saiu do art. 121, §2º, VI, para o art. 121-A com a Lei 14.994/2024.
- A espécie de ação penal também muda por lei (frente 6), e entra aqui.

---

## 12. Acervo histórico e panorama das alterações da lei penal

**Objetivo.** Registrar o acervo histórico e exibi-lo. A meta é um panorama completo das
atualizações das leis penais no Brasil desde o Império. O recuo no tempo começa pelas
alterações do Código Penal de 1940 até hoje.

É também a base de um **segundo paper**, sobre a flutuação e as características das
alterações, reaproveitando os protocolos da pesquisa do Pensando o Direito *Atividade
legislativa e obstáculos à inovação em matéria penal no Brasil*.

**Decidido em 11/09/2026: o primeiro passo é registrar como base de dados os tipos penais
revogados já mapeados.** Cada registro traz, obrigatoriamente, a data da revogação, o
instrumento que a promoveu (lei revogadora, decisão em controle de constitucionalidade,
não recepção) e o link para a referência no Planalto. Hoje esses casos vivem como texto:
nas listas `ACERVO_CASOS` e `RETIRADOS` do `scripts/gerar_completude.py` e nos diplomas
revogados de `data/diplomas.json`. O evento `revogado` do histórico legislativo (frente 4)
é o molde. A visualização e os métodos de busca de outros tipos revogados ficam para o
planejamento desta frente.

**Três coisas distintas, com a mesma base:**

- **o acervo de tipos**: o que foi crime, e deixou de ser ou mudou;
- **a história dos atributos penais**: quando cada um nasceu, mudou de parâmetro ou
  deixou de valer (o ANPP nasce em 2019; o inciso VI-A do art. 112 da LEP nasce em 2024 e
  é revogado em 2026). O atributo que deixa de valer não se apaga: passa ao acervo, como
  o tipo revogado;
- **o panorama das alterações**: a lei penal como série temporal, que é o objeto do
  paper.

As três se alimentam da cadeia de alterações da frente 11, e a linha do tempo mostra
tipos e atributos lado a lado.

**Perguntas a decidir.**

- **Unidade de análise:** a lei alteradora, o dispositivo alterado ou o evento de
  alteração? Os protocolos da pesquisa anterior provavelmente já respondem. Eles precisam
  entrar no repositório.
- **Fonte das redações antigas**, sobretudo as anteriores à reforma da Parte Geral
  (Lei 7.209/1984). É preciso identificar onde estão e com que confiabilidade.
- **Exibição:** linha do tempo por dispositivo, por diploma, e séries agregadas de
  endurecimento e abrandamento penal.

**Herdado do roadmap.**

- aba própria de acervo, por categoria (`revogado`, `alterado`, `nao_recepcionado`), no
  mesmo formato da lista de vigentes;
- tela de detalhe por tipo: texto original, o que houve, quando, por qual dispositivo,
  com link para o sucessor;
- dataset separado, fonte e derivado, com ids próprios;
- ponto de partida já conhecido: adultério (art. 240), sedução (217), rapto (219 a 222),
  ECA art. 233, LCP arts. 27, 39, 60, 61 e 65, Lei de Imprensa, LSN, Estatuto do
  Torcedor, o art. 19 (vetado) da Lei 9.807/99, e as redações alteradas registradas nas
  conferências;
- rotina de revogação: o registro revogado sai da busca de vigentes, entra no acervo e
  a rota antiga `?tipo=N` passa a apontar para ele, em vez de erro;
- **o Curador**, robô do acervo: uma varredura completa, uma vez, com duas perguntas
  (há tipo que o catálogo perdeu? há tipo revogado que ele ainda publica?), e depois uma
  rotina mensal só sobre a segunda.

---

## 13. Robô dos tribunais

**Objetivo.** Vigiar as decisões de tribunal superior que mudam o catálogo. Elas têm a
força de uma lei revogadora e não passam pelo Diário Oficial.

**O que já se sabe.** A ADI 7555 deslocou o estupro de vulnerável praticado por militar
do art. 232, §3º, do CPM para o art. 217-A do CP: três registros, nenhum ato no DOU. São
três fontes:

- **STF:** controle concentrado e **modulação**, que decide o `vigencia_ate`;
- **STJ:** súmulas e repetitivos;
- **STM:** a jurisdição militar.

**Regra.** O achado vira issue, nunca dado. É também o robô que acompanha as súmulas que
fundamentam atributos (a 536 e a 588 do STJ, a Vinculante 56, a 715 do STF).

---

## 14. Usabilidade

**Objetivo.** Os ganhos de uso que o roadmap previa:

- acessibilidade: teclado na tabela, `aria-live` nos contadores, foco visível;
- busca tolerante a acentos e a erros de digitação;
- exportar o resultado da busca por atributo em CSV;
- comparar dois atributos lado a lado;
- testes de regressão da dosimetria com casos reais;
- dashboards analíticos.

A reconstrução do site pode absorver parte disso antes do lançamento.

---

## 15. Processo penal e jurisprudência

**Objetivo.** Estender a vigilância ao que rege, na prática, os atributos:

- monitorar o CPP, a Lei 9.099/95 e a LEP;
- monitorar súmulas e teses que alterem limiares ou vedações;
- alertar quando uma decisão vinculante invalidar uma regra implementada.

---

## 16. Plataforma de pesquisa

**Objetivo.** Fazer da ferramenta de consulta uma plataforma de pesquisa:

- matriz de elegibilidade tipos × atributos;
- simulação legislativa em lote ("aumentar em 2 anos a pena dos crimes patrimoniais");
- exportação para pesquisa e API versionada;
- esquema versionado dos dados abertos, com política de depreciação.
