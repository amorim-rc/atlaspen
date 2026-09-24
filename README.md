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

## Documentação

Publicada no próprio site, em [`/projeto`](https://amorim-rc.github.io/atlaspen/projeto):
Metodologia, Catálogo de tipos penais, Atributos penais, Completude, Dados abertos e Os
robôs.

A árvore de `docs/` **espelha a do site**, e `docs/` é, sem exceção, o que vai ao ar:
`docs/*.md` é o grupo *Documentação* da barra lateral, `docs/textos/` é o grupo *Textos*.
O que existe só no repositório fica fora dele — o pré-registro da auditoria em
`.auditoria/`, os planos e specs de desenvolvimento em `.superpowers/`. Os dois continuam
versionados; o ponto só os tira do caminho de quem navega o código.

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
