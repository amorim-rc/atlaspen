# Backlog

O que o projeto pode fazer a seguir. É a referência de próximos passos e substituiu o
roadmap na v2.0.7.

Diferente do roadmap, o backlog **não amarra número de versão**. Uma frente aqui é uma
pergunta em aberto, não uma promessa com data. A versão é escolhida quando a mudança
fica pronta, segundo a regra de
[Estabilidade e versionamento](docs/dados-abertos.md#estabilidade-e-versionamento).

Cada frente diz o que se quer, **o que já se sabe** (achados tirados do código e dos
dados, não de memória), o que falta decidir e qual é o primeiro passo. A ordem das
seções é a da lista original. A sugestão de sequência está no fim.

---

## 1. Atributos penais versionados em dados

**Objetivo.** Tirar os benefícios do código e versioná-los em dados, como já se faz com
os tipos penais. Antes disso, conferir se falta algum, por mais discreto que seja.

**O que já se sabe.**

- Hoje são **22 institutos**, todos em código, em `src/lib/beneficios/catalogo/`:
  - *processuais* (4): transação penal, suspensão condicional do processo, ANPP,
    colaboração premiada;
  - *aplicação da pena* (6): substituição por restritivas, sursis, regime inicial,
    perdão judicial, arrependimento posterior, desistência voluntária e arrependimento
    eficaz;
  - *execução* (12): progressão, livramento condicional, prescrição da pretensão
    punitiva, saída temporária, detração, remição, prisão domiciliar, monitoração
    eletrônica, indulto coletivo, comutação, graça, unificação de penas.
- Cada um já é um registro declarativo (`BeneficioDef`) com metadados, requisitos,
  vedações e parâmetros editáveis, mais uma função de avaliação. A *natureza*
  (`abstrato`, `concreto`, `incondicionado`) diz de qual pena ele depende.
- **Nenhum robô os confere.** O Vigia lê molduras, não patamares de benefício. Quando
  uma lei muda a fração de progressão, ninguém acusa a defasagem.

**Perguntas do estudo do modelo.**

- **O que é dado e o que é regra.** Parâmetro (patamar, fração, vedação) vira dado. A
  função de avaliação fica em código ou vira vocabulário de predicados declarativos
  (`penaMax <= X`, `semViolencia`, `naoReincidente`)?
- **Vigência temporal por parâmetro.** Qual redação valia em cada data: art. 112 da
  LEP antes e depois da Lei 13.964/2019 e da Lei 15.402/2026, saída temporária antes e
  depois da Lei 14.843/2024. O esquema é o mesmo das frentes 4 e 5 e deve nascer junto.
- **Lei mais benéfica** (art. 5º, XL, CF) quando houver sucessão de leis.
- **Regime especial por diploma.** O mesmo instituto com patamar diferente em lei
  especial. Candidatos a conferir: Lei 9.605/98 (arts. 7º e 16), Lei 11.340/06
  (art. 41, que afasta a Lei 9.099), Lei 9.099/95 (art. 90-A, Justiça Militar) com o
  sursis e o livramento próprios do CPM, e as vedações do art. 44 da Lei 11.343/06,
  parte delas afastada pelo STF. O catálogo tem 393 registros do CPM, e hoje o simulador
  aplica a eles o regime comum.
- **Taxonomia.** Os 22 misturam naturezas: instituto despenalizador, causa de extinção
  da punibilidade, incidente de execução. O registro precisa dizer qual é?

**Inventário do que pode faltar.** São candidatos a conferir contra o texto compilado,
não conclusões:

- composição civil dos danos (Lei 9.099/95, art. 74);
- prescrição da pretensão **executória**, retroativa e intercorrente (art. 110 do CP).
  Hoje só a punitiva em abstrato é modelada;
- decadência, renúncia, perdão do ofendido e perempção nos crimes de ação privada
  (art. 107, IV e V, do CP);
- retratação (art. 107, VI; arts. 143 e 342, §2º, do CP);
- reparação do dano no peculato culposo (art. 312, §3º, do CP);
- extinção pelo pagamento e suspensão pelo parcelamento nos crimes tributários
  (Lei 9.430/96, art. 83; Lei 10.684/03, art. 9º);
- escusas absolutórias (arts. 181 a 183 do CP);
- reabilitação (arts. 93 a 95 do CP);
- multa substitutiva (art. 60, §2º, do CP): verificar se já está dentro da substituição;
- permissão de saída (LEP, art. 120) e trabalho externo (LEP, arts. 36 e 37);
- anistia;
- sursis e livramento condicional do CPM (arts. 84 e 89);
- colaboração em outras leis (Lei 9.807/99, arts. 13 e 14; Lei 11.343/06, art. 41).

**Herdado do roadmap (v2.1.0).** Serializar `BeneficioDef` para um JSON de fonte, CI de
validação (frações em [0,1], fundamento citado), permalink de simulação (uma URL que
carrega os parâmetros editados).

**Primeiro passo.** Um documento curto com o esquema proposto e três institutos-piloto
serializados: um de natureza abstrata (transação), um concreta (substituição) e um com
sucessão de leis (progressão). Depois de validado o modelo, a migração.

**Depende de** 2 (nome do arquivo e dos campos) e de 4 e 5 (o mesmo modelo de histórico).

---

## 2. "Benefícios penais" passa a "atributos penais"

**Objetivo.** Trocar a nomenclatura em todas as ocorrências.

**O que já se sabe.**

- **O termo "atributo" já está em uso, com outro sentido, em dois lugares:**
  - na Busca por benefício, os parâmetros editáveis de cada benefício se chamam
    "Atributos do benefício" e "atributos editáveis";
  - no `CONTRIBUTING.md` (C1), "atributo do tipo" quer dizer *campo do registro de tipo
    penal* ("o perdão judicial é atributo do tipo, campo `perdao_judicial_previsto`").

  Se o benefício passa a se chamar atributo penal, os dois usos precisam de outro nome
  antes da troca. Senão a tela terá "atributos do atributo".
- **Alcance:** textos do site e da documentação, navbar e rodapé, `docs/beneficios-penais.md`
  (e seu endereço), a rota `/pesquisa/beneficios` e o parâmetro `?beneficio=`, o código
  (`src/lib/beneficios`, `BuscaBeneficio`, `BeneficioDef`), a área `Benefícios` do
  changelog, as palavras-chave do `CITATION.cff`, o README.
- **Contrato público:** o `crimes.json` publicado não tem campo com "benefício" no nome,
  então os dados abertos não quebram. As URLs quebram: `/pesquisa/beneficios?beneficio=x`
  precisa de redirecionamento. É preciso conferir se o redirecionamento preserva a query.

**Primeiro passo.** Fechar um glossário curto (atributo penal, parâmetro, campo do
tipo) antes de tocar em texto ou código.

**Afeta** 1: convém trocar o nome antes de criar o arquivo de dados, para não nascer
`beneficios.json` e ser renomeado depois.

---

## 3. Novo nome do projeto, e talvez nova identidade visual

**Objetivo.** Renomear o projeto. Pode incluir rebranding.

**O que já se sabe.**

- O nome aparece no repositório (`amorim-rc/sispenas`), no `baseUrl` do site
  (`/sispenas/`), no `package.json`, no `CITATION.cff`, no logo, no favicon, no social
  card, no rodapé, na página inicial e em toda a documentação.
- **A troca do `baseUrl` muda todas as URLs**, inclusive `?tipo=N`, que é contrato
  público citado em pareceres. Pelo que se sabe hoje, o GitHub Pages não redireciona
  sozinho o endereço antigo de um repositório renomeado. É preciso verificar isso e
  planejar o redirecionamento, ou a mudança é MAIOR.
- O nome atual homenageia a pesquisa de origem (Machado & Machado, 2008). O novo nome
  deve manter essa linhagem explícita na seção Origem e na citação.
- O roadmap já previa um domínio próprio. Se o endereço vai mudar de qualquer forma,
  nome e domínio devem mudar **no mesmo movimento**, com uma só camada de
  redirecionamento.

**Perguntas.** O nome. Se o rebranding troca a paleta (`src/css/custom.css`) e a marca.
Se o repositório muda de dono (organização).

---

## 4. Quantas vezes cada registro mudou: id versionado ou etiqueta

**Objetivo.** Registrar, em cada tipo penal e em cada atributo, quantas atualizações ele
sofreu desde a criação.

**Posição inicial, para discussão: não versionar o id.**

- O `id` é a URL pública (`?tipo=N`) e é append-only. Pôr versão nele (`123.4`) faria
  cada alteração legislativa trocar a URL citada. Quem citou `?tipo=123` num parecer
  ficaria preso a um estado antigo sem saber, ou a URL deixaria de existir.
- O que se quer é **identidade estável mais histórico**. O id fica como está, o
  histórico da frente 5 é a fonte, e a contagem é **derivada** pelo `transform_data.py`,
  não digitada. Um contador escrito à mão diverge do histórico na primeira distração.
- Se for preciso citar um estado específico, um permalink de data resolve sem tocar no
  id: `?tipo=N&em=AAAA-MM-DD`, o registro como era naquela data. É a mesma peça de que o
  acervo histórico precisa.

**Distinção que não pode se perder.** "Atualização" são duas coisas:

- **alteração legislativa**: a lei mudou;
- **correção de dado**: o catálogo errou e foi corrigido.

Precisam ser contadas em separado. O paper da frente 9 mede só a primeira. A segunda é
indicador de qualidade do catálogo, e misturá-las faria erro nosso parecer flutuação
legislativa.

---

## 5. Data, número e link da lei de cada alteração

**Objetivo.** Para cada moldura de pena e cada atributo penal, registrar a data da
atualização e o número e o link da lei que a alterou. Se forem muitas, todas.

> O texto original desta frente foi interrompido: *"Nesse particular, podemos pensar em
> uma base de dados, sincronizada por id, informa…"*. **A completar.**

**Forma proposta, para discussão.** Um registro de alterações separado do catálogo,
chaveado por id e append-only. Cada evento tem:

- data de publicação e data de **vigência**, que são coisas distintas (vacatio legis);
- lei alteradora (número e ano) e o link para ela no `planalto.gov.br`;
- dispositivo alterador;
- campo afetado (moldura, espécie de pena, hediondez, ação penal…), com o valor antes e
  depois;
- origem da informação.

Segue a convenção de sempre: arquivo-fonte em `data/`, derivado em `static/data/`.

**O que já se sabe da fonte.** O texto compilado anota cada dispositivo com "Redação
dada pela Lei nº…" ou "Incluído pela Lei nº…", e o parser do Vigia já extrai essa
anotação. A **última** alteração, portanto, é mecanizável. A cadeia inteira depende das
redações anteriores que o compilado mantém riscadas: é parcialmente mecanizável e exige
conferência. O que for anterior ao compilado é trabalho manual.

**Serve a** 4 (a contagem sai daqui), 1 (vigência dos atributos), 6 (a ação penal também
muda por lei) e 9 (o acervo e o paper são esta base lida ao longo do tempo).

---

## 6. Revisão da ação penal, começando pelo método de registro

**Objetivo.** Revisar todas as ações penais registradas, começando por como elas são
registradas.

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

**Proposta de método, para discussão.**

- Vocabulário fechado e imposto pela CI: pública incondicionada; pública condicionada à
  representação; pública condicionada à requisição; privada; privada personalíssima
  (art. 236, parágrafo único, do CP). A ação privada subsidiária da pública fica fora:
  cabe em qualquer crime de ação pública e não é atributo do tipo.
- Um campo de **fundamento**: o dispositivo que define a ação (arts. 145 e 225 do CP,
  art. 171, §5º, art. 88 da Lei 9.099/95…) ou a marca "regra geral, art. 100".
- **Temporalidade.** A espécie de ação muda por lei: a Lei 13.718/2018 alterou o
  art. 225 do CP e a Lei 13.964/2019 incluiu o §5º do art. 171. Isso liga esta frente à 5.

**Primeiro passo.** Fechar o vocabulário e o campo de fundamento, escrever a convenção no
`CONTRIBUTING.md`, e revisar primeiro os 61 registros que não são incondicionados; em
seguida, uma amostra dos incondicionados.

---

## 7. Amostra qualitativa para validação técnico-científica

**Objetivo.** Extrair uma amostra qualitativa dos registros para validar os achados.

**Perguntas a decidir.**

- **Estratificação:** por diploma, espécie de pena, origem do registro (criado à mão ×
  `derivado_auto`) e campos condicionais (`hediondo_condicao`, `acao_condicao`,
  `pena_por_remissao`, `vigencia_ate`).
- **Tamanho** e critério de suficiência.
- **Quem valida e como:** dupla codificação, concordância entre avaliadores. A planilha
  `docs/sispenas-revisao.xlsx` pode servir de instrumento.
- **O que conta como erro**, com as mesmas categorias da conferência.

**Condições.** Reprodutível: semente e script no repositório. E presa a uma **versão
fixa** (a tag), para que a validação diga respeito a um estado conhecido do catálogo. O
erro encontrado vira correção pelo fluxo normal, nunca exceção.

**Relação com 6.** Validar a ação penal antes de revisar o método mede um campo que vai
mudar. A amostra pode, por outro lado, ajudar a diagnosticar o próprio método. Decidir a
ordem.

---

## 8. Pena cominada separada da pena concreta

**Objetivo.** Separar a exibição e a descrição da pena cominada das da pena concreta.
**Detalhes a vir: é a frente visualmente mais complexa.**

**Como é hoje** (para servir de ponto de partida):

- Na página do tipo penal, a coluna "Pena cominada — simulação legislativa" traz as
  barras da mínima, da máxima **e** da pena concreta aplicada, juntas.
- A pena concreta tem três origens, nesta precedência: **concurso de crimes >
  dosimetria > barra manual** (`src/components/Pesquisa/Detalhe.tsx`).
- Na Busca por benefício, a pena concreta dos benefícios de natureza `concreto` é
  **presumida** para varrer o catálogo, com base selecionável e padrão na mínima
  cominada.

---

## 9. Acervo histórico e panorama das alterações da lei penal

**Objetivo.** Planejar como registrar o acervo histórico e como exibi-lo. A meta é um
panorama completo das atualizações das leis penais no Brasil desde o Império. O recuo no
tempo começa pelas alterações do Código Penal de 1940 até hoje.

É também a base de um **segundo paper**, sobre a flutuação e as características das
alterações, reaproveitando os protocolos da pesquisa do Pensando o Direito *Atividade
legislativa e obstáculos à inovação em matéria penal no Brasil*.

**Duas coisas distintas, com a mesma base:**

- **o acervo de tipos**: o que foi crime, e deixou de ser ou mudou (herdado do roadmap);
- **o panorama das alterações**: a lei penal como série temporal, que é o objeto do
  paper.

As duas se alimentam do registro de alterações da frente 5.

**Perguntas a decidir.**

- **Unidade de análise:** a lei alteradora, o dispositivo alterado ou o evento de
  alteração? Os protocolos da pesquisa anterior provavelmente já respondem. Eles precisam
  entrar no repositório.
- **Fonte das redações antigas**, sobretudo as anteriores à reforma da Parte Geral
  (Lei 7.209/1984). É preciso identificar onde estão e com que confiabilidade.
- **Exibição:** linha do tempo por dispositivo, por diploma, e séries agregadas de
  endurecimento e abrandamento penal.

**Herdado do roadmap (v2.2.0 e o Curador).**

- aba própria em Pesquisa ▸ Acervo histórico, por categoria (`revogado`, `alterado`,
  `nao_recepcionado`), no mesmo formato da lista de vigentes;
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

## Herdado do roadmap, fora das nove frentes

O que o roadmap ainda tinha em aberto quando saiu (v2.0.6) e não cabe em nenhuma frente
acima. Fica aqui para não se perder.

**Robô dos tribunais.** Decisão de tribunal superior muda o catálogo com a força de uma
lei revogadora e não passa pelo DOU. A ADI 7555 deslocou o estupro de vulnerável
praticado por militar do art. 232, §3º, do CPM para o art. 217-A do CP: três registros,
nenhum ato no Diário Oficial. São três fontes: STF (controle concentrado e **modulação**,
que decide o `vigencia_ate`), STJ (súmulas e repetitivos) e STM. O achado vira issue,
nunca dado.

**Usabilidade.** Acessibilidade (teclado na tabela, `aria-live` nos contadores, foco
visível); busca tolerante a acentos e a erros de digitação; exportar o resultado da busca
por benefício em CSV; comparar dois benefícios lado a lado; testes de regressão da
dosimetria com casos reais; dashboards analíticos.

**Processo penal e jurisprudência.** Monitorar CPP, Lei 9.099/95 e LEP; monitorar
súmulas e teses que alterem limiares ou vedações; alertar quando decisão vinculante
invalidar uma regra implementada.

**Plataforma de pesquisa.** Matriz de elegibilidade tipos × atributos; simulação
legislativa em lote ("aumentar em 2 anos a pena dos crimes patrimoniais"); exportação
para pesquisa e API versionada; esquema versionado dos dados abertos com política de
depreciação. As séries temporais do endurecimento penal foram para a frente 9.

---

## Sequência sugerida

É sugestão, não decisão.

1. **Nomes primeiro: 2, e se possível 3.** Tudo o que vier depois nasce com o nome
   certo: arquivo, campo, URL. O rebranding pode demorar mais, mas a decisão sobre
   mudar ou não o endereço deve vir cedo, para que haja uma só migração de URLs.
2. **O modelo de histórico: 4 e 5 juntos.** É o esqueleto comum de 1, 6 e 9.
3. **1**, sobre esse modelo.
4. **6**, que reaproveita o modelo e o vocabulário fechado.
5. **7**, depois de 6 e sobre uma versão marcada.
6. **8** corre em paralelo quando os detalhes chegarem: é interface e não depende do
   modelo de dados, mas mexe na mesma página que 1 e 2.
7. **9** é a mais longa. O planejamento (protocolos, unidade de análise, fontes) pode
   começar já, em paralelo.
