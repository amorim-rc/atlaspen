# Backlog

O que o projeto pode fazer a seguir. É a referência de próximos passos e substituiu o
roadmap em 10/09/2026.

O backlog **não amarra número de versão**. Uma frente aqui é uma pergunta em aberto, não
uma promessa com data. A regra de versionamento está em revisão (frente 10).

**Como ler.** As frentes estão em **ordem de exequibilidade**, dentro de duas fases. O
número de cada frente é o da lista original e não muda, porque é por ele que o resto do
repositório as cita ("frente 1", "frente 10"). Cada frente diz o que se quer, **o que já
se sabe** (achados tirados do código e dos dados, não de memória), o que foi decidido e o
que falta.

---

## A estratégia: lançar enxuto, crescer por módulos

Decisão da equipe em 10/09/2026. O lançamento oficial, a **v1.0.0**, sai com uma versão
enxuta:

1. **todos os tipos penais**, que são o grande atrativo da ferramenta;
2. **os atributos penais que já existem**, mais os novos que forem **bem fáceis**;
3. **só normas vigentes**.

O que for difícil vira **módulo**, depois do lançamento, com plano próprio, financiamento
e pessoas alocadas. O caso que fixou a regra é a prescrição completa. Ela ajuda muito na
atuação profissional, mas as regras não são simples e há modulação no tempo. Pensá-la e
implementá-la é empreitada do porte de um mestrado. O recuo histórico segue o mesmo
caminho.

| Fase | Frentes, em ordem |
|---|---|
| **1. Até o lançamento** | 11, 10, 2, 3, 5 (só a última alteração), 1 (os 22 e os novos fáceis), 6, 7, 8 |
| **2. Módulos** | os atributos complexos, 4, 5 (a cadeia completa), 9 e o herdado do roadmap |

---

# Fase 1: até o lançamento (v1.0.0)

## 11. Repositório pronto para trabalho em grupo

**Objetivo.** Preparar o repositório para mais de uma pessoa: workflows, proteção de
branch, templates, acessos.

**O que já existe**, segundo a decisão de 30/07/2026. O push do merge de 10/09/2026
confirmou uma parte: o ruleset da `main` está ativo, exige o check da CI e deixa o admin
passar por bypass. O resto precisa ser conferido no GitHub. Desta máquina não dá para ler
as configurações, porque o `gh` não está instalado e o conector do GitHub não está
autorizado.

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

**Decidido e feito em 10/09/2026.**

- **Os PRs do mantenedor entram por bypass de admin.** O GitHub não deixa ninguém aprovar
  o próprio PR, e o único Code Owner hoje é o mantenedor: ele aprova os PRs dos outros, e
  os dele passam pelo bypass.
- **Template de PR reescrito:** fonte legal (dispositivo e link do compilado), verificação
  completa, Arquivista, uso de agente de IA, e o lembrete de que changelog e versão estão
  suspensos até a v1.0.0.
- **CODEOWNERS com os caminhos atuais**, do geral para o específico (vale a última regra
  que casa), com o time futuro de cada linha anotado.
- O modelo de issue passa a apontar a documentação para `/docs/metodologia`.

**Falta: transferir o repositório para uma organização**, com três pessoas de início: o
mantenedor e mais duas, que ainda vão criar conta no GitHub. Pontos da transferência, a
conferir quando chegar a hora:

- **O endereço `amorim-rc.github.io/sispenas` deixa de responder.** Antes do lançamento
  isso não quebra contrato público (frente 10), mas quebra os links já passados à equipe.
  O repositório-toco da frente 3 resolve; ou a transferência espera o domínio.
- **O app de automação é instalado por conta.** Depois da transferência, ele precisa ser
  instalado na organização; se for app privado, o próprio app tem de ser transferido para
  ela. Sem isso, `regen-data`, `release` e o carimbo do conferidor param de empurrar.
- **Times e CODEOWNERS:** criar os times (o arquivo sugere jurídico, engenharia e
  conteúdo), dar a eles permissão de escrita e trocar `@amorim-rc` linha a linha.
- **Com que credencial o Codex roda**, e quem enxerga os secrets.
- **Convenção de branch e de commit para três pessoas e dois agentes.** Hoje ela está no
  `AGENTS.md`, só para agentes; o `CONTRIBUTING.md` trata do catálogo.
- **Conferir no GitHub** se o resto das configurações bate com o decidido em 30/07.

---

## 10. Versionamento até o lançamento oficial

**Objetivo.** Voltar à versão 0. O site no GitHub Pages serve para acompanhar o
desenvolvimento, e ainda não houve lançamento. O lançamento oficial, com domínio, será a
**v1.0.0**.

**O que já se sabe.**

- Há **42 tags** publicadas, de v1.0.0 a v2.0.6, cada uma com sua Release no GitHub.
  **A tag `v1.0.0` já existe**: sem tirar as tags do lugar, o lançamento não tem número
  livre.
- O `release.yml` publica uma Release sempre que a `main` recebe uma versão do
  `package.json` que ainda não tem Release.
- **O Proponente sobe a versão sozinho.** O `propor.py` incrementa o patch a cada PR de
  correção que abre.

**Decidido em 10/09/2026: retirar a numeração até o lançamento (opção B).** É aplicar ao
projeto o que ele já exige do dado: não registrar o que não aconteceu. A opção de
renumerar tudo em `v0.0.X` foi descartada, porque esses números nunca existiram na época.

**Decidido em 10/09/2026: as Notas de atualizações são expurgadas.** Depois da v1.0.0, o
feed publica exclusivamente alterações de tipos penais e de atributos penais, e as
Releases do GitHub são enxugadas.

**Roteiro.**

1. Expurgar as Notas de atualizações que o site mostra hoje.
2. Parar o `release.yml` enquanto a versão for `0.x`, por condição no próprio workflow.
3. Fazer o Proponente parar de subir a versão.
4. Ajustar o `validar-changelog.mjs` à ausência de notas até a 1.0.0.
5. `package.json` em `0.0.0`, e o `CITATION.cff` citando a data em vez da versão.
6. Reescrever a regra onde ela mora: `AGENTS.md`, `CONTRIBUTING.md`,
   `create-changelog-entry.md`, a seção Estabilidade e versionamento de Dados abertos e a
   skill do catálogo. O `AGENTS.md`, o `CONTRIBUTING.md` e o template de PR já avisam da
   suspensão.
7. **No GitHub, ação do mantenedor:** apagar as 42 Releases e tags, ou renomeá-las para
   `prototipo-vX.Y.Z`. O ruleset de tags `v*` só deixa passar o admin e o app.

**Até a execução:** nenhuma entrada de changelog é criada e nenhuma Release é publicada.
Não mergear PR do Proponente sem tirar dele a subida de versão, senão sai uma v2.0.7.

**Oportunidade que só existe antes da 1.0.0.** Até o lançamento, `?tipo=N` e as URLs
ainda não são contrato com o público. Se o nome (frente 3), o domínio e a numeração dos
ids vão mudar, o momento de mudar é antes da v1.0.0, numa virada só.

---

## 2. "Benefícios penais" passa a "atributos penais"

**Feito em 10/09/2026.** O glossário:

- **atributo penal** é o instituto (transação, progressão…), que o site chamava de
  benefício;
- **parâmetro** é o patamar, a fração ou a vedação editável de um atributo, que a tela
  chamava de "atributos do benefício";
- **campo** é o campo do registro de tipo penal, que o `CONTRIBUTING.md` chamava de
  "atributo do tipo".

**O que mudou.**

- A busca passou a **Busca por atributo**, em `/pesquisa/atributos`, e a página de
  documentação a **Atributos penais**, em `/docs/atributos-penais`. Os endereços antigos
  redirecionam, e o redirecionamento repassa a query: o link antigo com `?beneficio=`
  continua abrindo o atributo, e o novo é `?atributo=`.
- O código: `src/lib/atributos`, `AtributoDef`, `calcularAtributos`, `BuscaAtributo` e
  `scripts/verificar_atributos.ts`.
- O nome expandido do projeto passou a **Sistema de Pesquisa de Tipos e Atributos
  Penais**, até que a frente 3 dê o nome novo.

**O que ficou com "benefício", de propósito.**

- A linguagem da lei e das súmulas: "beneficiado por transação penal", a "compatibilidade
  do benefício" do art. 123 da LEP, a "concessão de outros benefícios" da Súmula 715.
- A descrição da proposta de 2008, que usava esse termo.
- As notas de atualização e a área `Benefícios` do feed, que serão expurgadas (frente 10).
- O "fim de benefício" do crime de fraude em contratação pública, que é outro sentido.

---

## 3. Novo nome do projeto, e talvez nova identidade visual

**Objetivo.** Renomear o projeto. Pode incluir rebranding. Está na fase 1 porque o
lançamento sai com domínio próprio, e nome e domínio devem mudar juntos.

**O que já se sabe.**

- O nome aparece no repositório (`amorim-rc/sispenas`), no `baseUrl` do site
  (`/sispenas/`), no `package.json`, no `CITATION.cff`, no logo, no favicon, no social
  card, no rodapé, na página inicial e em toda a documentação.
- **A troca do `baseUrl` muda todas as URLs**, inclusive `?tipo=N`. O endereço
  `github.io` do Pages **não** redireciona quando o repositório é renomeado ou
  transferido. Sem um redirecionamento planejado, a mudança quebra os links.
- O nome atual homenageia a pesquisa de origem (Machado & Machado, 2008). O novo nome
  deve manter essa linhagem explícita na seção Origem e na citação.
- Se o endereço vai mudar de qualquer forma, nome e domínio devem mudar **no mesmo
  movimento**, com uma só camada de redirecionamento.

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

---

## 5. Histórico legislativo: a última alteração agora, a cadeia depois

**Objetivo.** Registrar, para cada moldura de pena e cada atributo penal, a data da
atualização e o número e o link da lei que a alterou. Se forem muitas, todas.

**Divisão pelas fases.** Na **fase 1** entra a **última alteração legislativa** de cada
tipo e de cada atributo: norma, ano e link para o item no Planalto. Ela é mecânica,
porque o compilado já traz esse link em cada anotação ("Redação dada pela Lei nº…"). Na
**fase 2** entram a cadeia completa de alterações, a contagem (frente 4) e o acervo
(frente 9).

**Decidido em 10/09/2026: a chave é o dispositivo**, e não o id, por três razões:

- **o histórico é do texto da lei, não do catálogo.** Ele existe antes do registro e já
  teria atravessado os dois reinícios da numeração dos ids;
- **uma lei alteradora atinge vários dispositivos de uma vez**, e o evento fica gravado
  em cada dispositivo sem depender de quais ids o catálogo tem naquele momento;
- **os atributos penais também têm dispositivo de origem** (a progressão, o art. 112 da
  LEP), e o mesmo arquivo serve aos dois.

A `chave_dispositivo` atual não serve como está: ela usa o rótulo do catálogo, e o CP
aparece sob quatro rótulos. A chave canônica é `<id do diploma em data/fontes.json>|
<dispositivo>` (`cp|art. 121, caput`, `lep|art. 112, vi, c`). O caso a tratar à parte é
o do conteúdo que muda de lugar, como um inciso que vira artigo próprio: ele pede um
evento de **transferência** que ligue as duas chaves.

**Esquema proposto.** `data/historico-legislativo.json` é a fonte, append-only: um
objeto por chave, com a lista de eventos em ordem cronológica. Cada evento traz a ação
(incluído, redação, revogado…), a lei alteradora (número, ano e link), as datas de
publicação e de vigência (que são coisas distintas), o valor antes e depois quando é
número, a natureza (alteração legislativa ou correção de dado; ver frente 4) e a origem
da informação. A data da última alteração e a contagem são **derivadas** pelo
`transform_data.py`; ninguém as digita. Detalhes em `estudos/modelo-atributos.md`, seções
4.1 e 4.5.

**O que já se sabe da fonte.** O parser do Vigia já lê as anotações do compilado, mas
guarda só o texto do link e descarta o `href`, que traz a URL da lei alteradora e a
âncora do artigo. Guardar os dois é mudança pequena. As redações anteriores, que o
compilado mantém no texto, são parcialmente mecanizáveis e exigem conferência. O que for
anterior ao compilado é trabalho manual e fica para a fase 2.

---

## 1. Atributos penais versionados em dados

**Objetivo.** Tirar os atributos do código e versioná-los em dados, como já se faz com os
tipos penais. Na fase 1: **os 22 que existem, mais os novos que forem bem fáceis.**

**O que já se sabe.**

- Hoje são **22 atributos**, todos em código, em `src/lib/atributos/catalogo/`, com 71
  parâmetros ao todo:
  - *processuais* (4): transação penal, suspensão condicional do processo, ANPP,
    colaboração premiada;
  - *aplicação da pena* (6): substituição por restritivas, sursis, regime inicial,
    perdão judicial, arrependimento posterior, desistência voluntária e arrependimento
    eficaz;
  - *execução* (12): progressão, livramento condicional, prescrição da pretensão
    punitiva, saída temporária, detração, remição, prisão domiciliar, monitoração
    eletrônica, indulto coletivo, comutação, graça, unificação de penas.
- **Nenhum robô os confere.** O Vigia lê molduras, não patamares de atributo.

**Estudo do modelo:** [`estudos/modelo-atributos.md`](estudos/modelo-atributos.md), com
os achados, o esquema, os três pilotos (transação, substituição e progressão) e o plano do
PR da migração. Falta validá-lo. Dois achados já foram corrigidos em 10/09/2026: a
progressão da milícia privada (art. 288-A do CP), que saía com 25% ou 30% quando o
art. 112, VI, "c", da LEP manda 75%; e três parâmetros da progressão que citavam o inciso
na numeração de 2019. Na mesma data saiu da busca por atributo a opção "fato anterior a
08/05/2026".

**Decidido em 10/09/2026.**

- O arquivo será `data/atributos.json`, com o glossário da frente 2.
- **Chave de dispositivo também nos atributos** (frente 5). A LEP, o CPP, a Lei 9.099/95
  e a CF não estão em `data/fontes.json`, e entram.
- **Última alteração legislativa em cada atributo**, como nos tipos: data e lei que o
  editou, com link para o item no Planalto. É derivada do histórico, não digitada.
- **Sem data do fato na simulação em abstrato.** Ela usa a lei vigente. No máximo o caso
  concreto registra a data do fato.
- **Tudo vai para dados, menos a função de avaliação.** Predicados declarativos ficam
  para depois.
- **Rede de segurança:** um teste que congela o resultado atual dos 22 atributos sobre os
  tipos. A migração só entra se nada mudar.
- **Um PR só.** O PR que cria a base troca, nele mesmo, todos os usos: o contador da
  página inicial, a busca por tipo penal, a busca por atributo e a verificação do motor.
  O catálogo em código sai no mesmo PR.
- **O acervo histórico registra também a história dos atributos** (frente 9).

**Herdado do roadmap.** CI de validação (frações em [0, 1], fundamento citado) e
permalink de simulação (uma URL que carrega os parâmetros editados).

### Atributos ainda não abordados

São candidatos a conferir contra o texto compilado, não conclusões. Estão em faixas de
exequibilidade, que dizem em que fase cada um cabe. Quais dos fáceis entram no lançamento
é escolha da equipe.

**Fáceis: regra fechada, sobre o que o catálogo já tem. Candidatos à fase 1.**

| Atributo | Fundamento | Por que é fácil |
|---|---|---|
| Fiança e inafiançabilidade | CPP, arts. 322 e 323; CF, art. 5º, XLII a XLIV | Depende da pena máxima e da hediondez, que o catálogo tem |
| Anistia | CF, art. 5º, XLIII; Lei 8.072/90, art. 2º, I | Vedação aos hediondos e equiparados, espelho da graça |
| Reparação do dano no peculato culposo | CP, art. 312, §3º | Um tipo só |
| Retratação | CP, art. 107, VI; arts. 143 e 342, §2º | Lista curada de poucos tipos |
| Reabilitação | CP, arts. 93 a 95 | Regra de tempo, sem patamar de pena |
| Permissão de saída | LEP, arts. 120 e 121 | Não depende de pena |
| Trabalho externo | LEP, arts. 36 e 37 | Fração da pena cumprida, como a progressão |

**Moderados: dependem de outra frente ou de circunstância do caso.**

| Atributo | Fundamento | O que falta |
|---|---|---|
| Composição civil dos danos | Lei 9.099/95, art. 74 | A ação penal revista (frente 6) |
| Decadência, renúncia, perdão do ofendido, perempção | CP, arts. 103 a 106; CPP, art. 60 | Idem |
| Escusas absolutórias | CP, arts. 181 a 183 | Circunstância do caso (parentesco) e as exceções do art. 183 |
| Crimes tributários: pagamento e parcelamento | Lei 9.430/96, art. 83; Lei 10.684/03, art. 9º | Escopo curado; o momento do pagamento é matéria de jurisprudência |
| Colaboração premiada nas leis especiais | Lei 9.807/99, arts. 13 e 14; Lei 11.343/06, art. 41; Lei 9.613/98, art. 1º, §5º; CP, art. 159, §4º; Lei 8.072/90, art. 8º, parágrafo único | Escopo por diploma |
| Violência doméstica contra a mulher | Lei 11.340/06, arts. 17 e 41; Súmulas 536 e 588 do STJ | Circunstância do caso que veda transação, suspensão do processo e substituição |
| Regime da Lei 9.605/98 | Arts. 7º, 16, 27 e 28 | Patamares próprios de substituição e sursis; transação e suspensão ligadas à reparação ambiental |
| Vedações do art. 44 da Lei 11.343/06 | Art. 44 | Parte foi afastada pelo STF: é questão jurídica, e o registro deve dizer a condição, não preenchê-la |
| Multa substitutiva | CP, art. 60, §2º | Vigência controvertida diante do art. 44, §2º |

**Complexos: módulo próprio, na fase 2.**

| Atributo | Fundamento | Por que é módulo |
|---|---|---|
| Prescrição completa | CP, arts. 110 a 117 | Retroativa, superveniente e executória, causas suspensivas e interruptivas, e sucessão de leis no tempo (a Lei 12.234/2010 vedou a retroativa com termo anterior à denúncia). Hoje só a punitiva em abstrato é modelada |
| Regime próprio do CPM | CPM, arts. 84 e 89; Lei 9.099/95, art. 90-A | Sursis e livramento militares, e a Lei 9.099 afastada da Justiça Militar. São 394 registros |
| Sucessão de leis no caso concreto | CF, art. 5º, XL | A data do fato escolhendo a redação de cada parâmetro (estudo, achado C) |

**Escopo a decidir: atributos que não são benefício.** Com o nome novo, a pergunta
aparece: o catálogo de atributos inclui o que agrava a situação do acusado?

- Cabimento da prisão preventiva pelo patamar de pena (CPP, art. 313, I: crime doloso com
  pena máxima acima de 4 anos).
- Competência do Tribunal do Júri (CF, art. 5º, XXXVIII: crimes dolosos contra a vida).
- O menor potencial ofensivo já é campo do catálogo (`infracao_menor_potencial`), e a regra
  dele está em revisão: 29 infrações só com multa estão fora da marcação.

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

**Proposta de método, para discussão.**

- Vocabulário fechado e imposto pela CI: pública incondicionada; pública condicionada à
  representação; pública condicionada à requisição; privada; privada personalíssima
  (art. 236, parágrafo único, do CP). A ação privada subsidiária da pública fica fora:
  cabe em qualquer crime de ação pública e não é campo do tipo.
- Um campo de **fundamento**: o dispositivo que define a ação (arts. 145 e 225 do CP,
  art. 171, §5º, art. 88 da Lei 9.099/95…) ou a marca "regra geral, art. 100".
- **Temporalidade.** A espécie de ação muda por lei: a Lei 13.718/2018 alterou o
  art. 225 do CP e a Lei 13.964/2019 incluiu o §5º do art. 171. Na fase 1 basta a
  redação vigente; a sucessão é da fase 2.

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

**Condições.** Reprodutível: semente e script no repositório. E presa a um estado fixo do
catálogo (um commit marcado), para que a validação diga respeito a algo conhecido. O erro
encontrado vira correção pelo fluxo normal, nunca exceção.

**Relação com 6.** Validar a ação penal antes de revisar o método mede um campo que vai
mudar. Por isso vem depois dela.

---

## 8. Pena cominada separada da pena concreta

**Objetivo.** Separar a exibição e a descrição da pena cominada das da pena concreta.
**Os detalhes vêm com a reconstrução do site, que absorve esta frente.**

**Como é hoje** (para servir de ponto de partida):

- Na página do tipo penal, a coluna "Pena cominada — simulação legislativa" traz as
  barras da mínima, da máxima **e** da pena concreta aplicada, juntas.
- A pena concreta tem três origens, nesta precedência: **concurso de crimes >
  dosimetria > barra manual** (`src/components/Pesquisa/Detalhe.tsx`).
- Na busca por atributo, a pena concreta dos atributos de natureza `concreto` é
  **presumida** para varrer o catálogo, com base selecionável e padrão na mínima
  cominada.

---

# Fase 2: módulos, com plano, financiamento e pessoas

Cada módulo pede plano próprio e, em geral, pessoas interessadas no tema. O que já se
sabe de cada um fica registrado aqui para quando chegar a vez.

## Os atributos complexos

A prescrição completa, o regime próprio do CPM e a sucessão de leis no caso concreto,
listados na frente 1 com o fundamento e o motivo. São os candidatos naturais a módulos de
pesquisa, porque cada um exige estudo jurídico antes de qualquer linha de código.

---

## 4. Quantas vezes cada registro mudou

**Objetivo.** Registrar, em cada tipo penal e em cada atributo, quantas atualizações ele
sofreu desde a criação. Depende da cadeia completa da frente 5.

**Posição inicial, para discussão: não versionar o id.**

- O `id` é a URL pública (`?tipo=N`) e é append-only. Pôr versão nele (`123.4`) faria
  cada alteração legislativa trocar a URL citada.
- O que se quer é **identidade estável mais histórico**. O id fica como está, o
  histórico da frente 5 é a fonte, e a contagem é **derivada**, não digitada.
- Se for preciso citar um estado específico, um permalink de data resolve sem tocar no
  id: `?tipo=N&em=AAAA-MM-DD`. É a mesma peça de que o acervo histórico precisa.

**Distinção que não pode se perder.** "Atualização" são duas coisas: **alteração
legislativa** (a lei mudou) e **correção de dado** (o catálogo errou e foi corrigido).
Precisam ser contadas em separado. O paper da frente 9 mede só a primeira; a segunda é
indicador de qualidade do catálogo.

---

## 9. Acervo histórico e panorama das alterações da lei penal

**Objetivo.** Registrar o acervo histórico e exibi-lo. A meta é um panorama completo das
atualizações das leis penais no Brasil desde o Império. O recuo no tempo começa pelas
alterações do Código Penal de 1940 até hoje.

É também a base de um **segundo paper**, sobre a flutuação e as características das
alterações, reaproveitando os protocolos da pesquisa do Pensando o Direito *Atividade
legislativa e obstáculos à inovação em matéria penal no Brasil*.

**Três coisas distintas, com a mesma base:**

- **o acervo de tipos**: o que foi crime, e deixou de ser ou mudou;
- **a história dos atributos penais**: quando cada um nasceu, mudou de parâmetro ou
  deixou de valer (o ANPP nasce em 2019; o inciso VI-A do art. 112 da LEP nasce em 2024 e
  é revogado em 2026). O atributo que deixa de valer não se apaga: passa ao acervo, como
  o tipo revogado;
- **o panorama das alterações**: a lei penal como série temporal, que é o objeto do
  paper.

As três se alimentam do registro de alterações da frente 5, e a linha do tempo mostra
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

## Herdado do roadmap, fora das frentes acima

**Robô dos tribunais.** Decisão de tribunal superior muda o catálogo com a força de uma
lei revogadora e não passa pelo DOU. A ADI 7555 deslocou o estupro de vulnerável
praticado por militar do art. 232, §3º, do CPM para o art. 217-A do CP: três registros,
nenhum ato no Diário Oficial. São três fontes: STF (controle concentrado e **modulação**,
que decide o `vigencia_ate`), STJ (súmulas e repetitivos) e STM. O achado vira issue,
nunca dado.

**Usabilidade.** Acessibilidade (teclado na tabela, `aria-live` nos contadores, foco
visível); busca tolerante a acentos e a erros de digitação; exportar o resultado da busca
por atributo em CSV; comparar dois atributos lado a lado; testes de regressão da
dosimetria com casos reais; dashboards analíticos. Parte disso pode vir antes, com a
reconstrução do site.

**Processo penal e jurisprudência.** Monitorar CPP, Lei 9.099/95 e LEP; monitorar
súmulas e teses que alterem limiares ou vedações; alertar quando decisão vinculante
invalidar uma regra implementada.

**Plataforma de pesquisa.** Matriz de elegibilidade tipos × atributos; simulação
legislativa em lote ("aumentar em 2 anos a pena dos crimes patrimoniais"); exportação
para pesquisa e API versionada; esquema versionado dos dados abertos com política de
depreciação.
