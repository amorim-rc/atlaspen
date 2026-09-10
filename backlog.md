# Backlog

O que o projeto pode fazer a seguir. É a referência de próximos passos e substituiu o
roadmap em 10/09/2026.

Diferente do roadmap, o backlog **não amarra número de versão**. Uma frente aqui é uma
pergunta em aberto, não uma promessa com data. A versão é escolhida quando a mudança
fica pronta, segundo a regra de
[Estabilidade e versionamento](docs/dados-abertos.md#estabilidade-e-versionamento). Essa
regra está em revisão: ver a frente 10.

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
  público citado em pareceres. O endereço `github.io` do Pages **não** redireciona quando
  o repositório é renomeado ou transferido. Sem um redirecionamento planejado, a mudança
  quebra os links.
- O nome atual homenageia a pesquisa de origem (Machado & Machado, 2008). O novo nome
  deve manter essa linhagem explícita na seção Origem e na citação.
- Se o endereço vai mudar de qualquer forma, nome e domínio devem mudar **no mesmo
  movimento**, com uma só camada de redirecionamento. É o que a frente 10 chama de
  virada da v1.0.0.

**Passo a passo já levantado (30/07/2026).** A ordem é obrigatória: **domínio antes de
qualquer mudança de dono ou de nome**, porque com o domínio configurado a URL canônica
sobrevive à troca.

1. Registrar o domínio (ex.: Registro.br).
2. DNS: no apex, registros `A` para `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153` e `185.199.111.153` (opcionalmente `AAAA` para `2606:50c0:8000::153`
   a `:8003::153`); em `www`, `CNAME` para `amorim-rc.github.io`.
3. GitHub: Settings ▸ Pages ▸ Custom domain, aguardar a checagem de DNS e marcar
   Enforce HTTPS.
4. Verificar o domínio na conta (Settings da conta ▸ Pages ▸ Verified domains), o que
   impede apropriação por terceiros.
5. No repositório: `url` e `baseUrl: '/'` no `docusaurus.config.ts`; as URLs absolutas
   (changelog, README, CITATION) passam ao domínio.
6. Testar: `https://amorim-rc.github.io/sispenas/pesquisa/tipos?tipo=1` deve responder
   301 para o domínio.

Depois, se houver: transferir o repositório para uma organização (issues, PRs, Actions,
secrets e estrelas migram, e as URLs `github.com` redirecionam), re-verificar o domínio
na organização, atualizar `organizationName`, README, `CITATION.cff` e o remote local, e
criar um repositório-toco com o nome antigo cujo `index.html` e `404.html` redirecionam
preservando caminho e query. Assim, os links `github.io` já citados continuam vivos.

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

## 5. Histórico legislativo de cada registro

**Objetivo.** Em corolário da frente 4, registrar a data de atualização de cada moldura
de pena e de cada atributo penal, e o número e o link da lei que a alterou. Se forem
muitas alterações, guardam-se todas.

A forma pensada é uma base de dados própria, sincronizada com o catálogo. O id 1
(art. 121 do CP) ganha um campo que informa a sua chave no arquivo
`historico-legislativo.json`. Ali constam todas as atualizações que o tipo já sofreu,
cada uma com a data e a lei que a fez.

**Esquema proposto, para discussão.** `data/historico-legislativo.json` é a fonte,
append-only: um objeto por chave, com a lista de eventos em ordem cronológica. Cada
evento tem:

- data de publicação e data de **vigência**, que são coisas distintas (vacatio legis);
- lei alteradora (número e ano) e o link para ela no `planalto.gov.br`;
- dispositivo alterador;
- campo afetado (moldura, espécie de pena, hediondez, ação penal…), com o valor antes e
  depois;
- natureza do evento: alteração legislativa ou correção de dado (ver frente 4);
- origem da informação.

A contagem de alterações da frente 4 e a data da última são **derivadas** pelo
`transform_data.py` e publicadas no derivado; ninguém as digita. Segue a convenção de
sempre: fonte em `data/`, derivado em `static/data/`.

**A decidir: a chave é o id ou o dispositivo?** O pedido fala em id. Há um argumento
para chavear pelo dispositivo, que o catálogo já tem pronto em `chave_dispositivo`
(`cp|art. 121, caput`):

- **o histórico é do texto da lei, não do catálogo.** Ele existe antes do registro e já
  teria atravessado os dois reinícios da numeração dos ids. Chaveado por dispositivo,
  um terceiro reinício (ver frente 10) não o toca;
- **uma lei alteradora atinge vários dispositivos de uma vez**, e o evento fica gravado
  em cada dispositivo sem depender de quais ids o catálogo tem naquele momento;
- **os atributos penais também têm dispositivo de origem** (a progressão, o art. 112 da
  LEP), e o mesmo arquivo serve aos dois.

Nesse desenho, o campo que aponta para o histórico já existe no registro: é a
`chave_dispositivo`. Cada id continua achando seu histórico sem ambiguidade. O caso a
tratar à parte é o do conteúdo que muda de lugar, como um inciso que vira artigo próprio.
Ele pede um evento de **transferência** que ligue as duas chaves. Exemplo a conferir no
compilado: o feminicídio, que saiu do art. 121, §2º, VI, para o art. 121-A com a
Lei 14.994/2024.

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

## 10. Versionamento até o lançamento oficial

**Objetivo.** Voltar à versão 0. O site no GitHub Pages é acompanhamento do
desenvolvimento, para você e a equipe; ainda não houve lançamento. O lançamento oficial,
com domínio, será a **v1.0.0**.

**O que já se sabe.**

- Há **42 tags** publicadas, de v1.0.0 a v2.0.6, cada uma com sua Release no GitHub.
- **80 das 101 notas** do feed carregam versão.
- As versões aparecem em cerca de **230 lugares no texto**: uns 120 no código e na
  documentação ("a v2.0.0 reiniciou a numeração") e uns 110 dentro das próprias notas.
- **A tag `v1.0.0` já existe.** Qualquer caminho exige tirar as tags atuais do lugar,
  senão o lançamento não tem número livre.
- O `release.yml` publica uma Release sempre que a `main` recebe uma versão do
  `package.json` que ainda não tem Release.

**As duas opções levantadas.**

- **A. Renumerar em `v0.0.X`.** Cada release antiga vira v0.0.1 a v0.0.42, em ordem, com
  uma tabela de equivalência aplicada por script às tags, às notas e ao texto. Preserva a
  sequência e o filtro por versão do feed. Custo: recriar 42 tags e Releases no GitHub e
  reescrever as ~230 menções. E os números nunca existiram na época: uma nota datada de
  julho passaria a anunciar uma versão cunhada em setembro.
- **B. Retirar a numeração até o lançamento.** As notas ficam, datadas e sem versão (o
  campo já é opcional). As tags e Releases saem do GitHub ou vão para um prefixo de
  arquivo (`prototipo-v2.0.6`), o que libera a `v1.0.0`. O `release.yml` fica parado até a
  1.0.0 e o `package.json` passa a `0.x`. O texto das notas antigas continua citando as
  versões da época, com uma linha no feed explicando que eram a numeração do protótipo.

**Recomendação: B.** É aplicar ao próprio projeto o que ele já exige do dado: não
registrar o que não aconteceu. Custa menos, e a v1.0.0 nasce como o primeiro número de
verdade. Apagar as notas antigas também seria possível, mas elas são o registro do
aprendizado e custam nada para ficar.

**Oportunidade que só existe antes da 1.0.0.** Até o lançamento, `?tipo=N` e as URLs
ainda não são contrato com o público. Se o nome (frente 3), o domínio e a numeração dos
ids (frente 4) vão mudar, o momento de mudar é antes da v1.0.0, numa virada só.

**Enquanto não se decide:** as notas novas entram sem número e nenhuma Release é
publicada. A regra de versionamento em Dados abertos e o fluxo de release do `AGENTS.md`
mudam conforme a escolha.

---

## 11. Repositório pronto para trabalho em grupo

**Objetivo.** Preparar o repositório para mais de uma pessoa: workflows, proteção de
branch, templates, acessos.

**O que já existe**, segundo a decisão de 30/07/2026. O estado real no GitHub precisa ser
conferido: desta máquina não dá para ler as configurações, porque o `gh` não está
instalado e o conector do GitHub não está autorizado.

- **Ruleset da `main`:** PR obrigatório, aprovação de Code Owner, CI verde, sem
  force-push nem deleção. Bypass para admin do repositório e para o app de automação.
- **Ruleset de tags `v*`**, com o mesmo bypass: a tag é criada pelo workflow, nunca por
  push manual.
- **App de automação** do projeto, com a chave num Environment (`automacao`) restrito à
  `main`. O GitHub recusa entregar o secret a jobs de outras branches do lado do
  servidor, e essa é a trava que importa.
- `CODEOWNERS`, template de PR e dois templates de issue.

**Os cinco workflows.**

| Workflow | Quando roda | Escreve na `main`? |
|---|---|---|
| `ci` | PR e push na `main` | não |
| `deploy` | push na `main` (Pages) | não |
| `regen-data` | push na `main` | sim: regenera o derivado |
| `release` | push na `main` | sim: tag e Release |
| `conferidor` | segunda-feira, 8h UTC | sim: carimbo da conferência, issues e PR do Proponente |

Três deles escrevem direto na `main` pelo app: é por isso que o bypass do app existe, e
ele não pode sair.

**O que falta ou envelheceu.**

- **Com um só Code Owner, o fluxo solo depende do bypass de admin.** O GitHub não deixa
  ninguém aprovar o próprio PR. Quando o colaborador abrir PR, quem aprova é você. Quando
  você abrir, ou ele revisa (e para isso precisa ser Code Owner do caminho), ou você usa
  o bypass. É preciso decidir a regra.
- **O template de PR está defasado.** Cita `src/lib/beneficios.ts` (hoje é diretório) e
  "planilha → `data/crimes.json`". Não pede a entrada de changelog nem a verificação
  completa (`--estrito --max-contradicoes=0`, pytest, `validar-changelog`).
- O `CODEOWNERS` cita `/src/lib/beneficios.ts` e `/src/theme/`, que não existem.
- O modelo de issue aponta a documentação para `/docs/sobre`, que só redireciona para a
  página inicial.
- **Acesso do colaborador:** write direto ou fork; quem enxerga os secrets; com que
  credencial o Codex roda.
- **Convenção de branch e de commit para duas pessoas e dois agentes.** Hoje ela está no
  `AGENTS.md`, só para agentes; o `CONTRIBUTING.md` trata do catálogo.
- **Conferir no GitHub** se as configurações batem com o decidido em 30/07.

---

## Herdado do roadmap, fora das frentes acima

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

**Antes de tudo: 11, e a decisão de 10.** O colaborador chega em breve, e cada nota nova
já depende de como se numera. Nenhuma das duas é trabalho longo.

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
