---
id: catalogo-tipos-penais
title: Catálogo de tipos penais
sidebar_position: 2
---

# Catálogo de tipos penais

O catálogo é a base factual do AtlasPen: é dele que saem as penas cominadas, a hediondez,
a violência e as demais características que alimentam o cálculo dos atributos penais. Esta
página descreve **como ele é estruturado, como é derivado e como sua qualidade é garantida
nele**.

## Os dois arquivos

O catálogo existe em duas formas, e a distinção importa para quem for contribuir:

| Arquivo | Papel | Quem edita |
|---|---|---|
| `data/crimes.json` | **Fonte da verdade.** Campos redigidos à mão. | Pessoas (inclusive pela interface web do GitHub) |
| `static/data/crimes.json` | **Derivado.** Fonte + campos calculados. É o único que a aplicação lê. | `scripts/transform_data.py` |

Nunca edite `static/data/crimes.json`: ele é sobrescrito. O workflow
`.github/workflows/regen-data.yml` observa `data/crimes.json`, roda a transformação e
commita o resultado — não é preciso ter Python instalado para contribuir. Ele regenera
também o derivado dos atributos, cujo alcance depende das penas do catálogo.

```
data/crimes.json  ──►  scripts/transform_data.py  ──►  static/data/crimes.json
   (fonte, à mão)          (deriva + audita)              (consumido pelo site)
                                   │
                                   └──►  static/data/qualidade.json  (relatório)
```

## Campos da fonte

| Campo | Descrição |
|---|---|
| `id` | Identificador estável. É o que aparece em `?tipo=N` na URL. Nunca reatribuído. |
| `lei` | Diploma (`CP`, `CTB`, `Lei 11.343/06`…). |
| `artigo` | Dispositivo (`Art. 121, §2º, I`). |
| `crime` | Nome do tipo penal. |
| `pena_min` / `pena_max` | Pena cominada **em meses**. |
| `tipo_pena` | `Reclusão`, `Detenção`, `Prisão simples`, `Multa`, `Morte` (crimes de guerra do CPM, art. 56), `Outras penas` (sanção cominada que não é privativa nem pecuniária) ou `—`. |
| `acao` | Ação penal (pública incondicionada, condicionada, privada). |
| `acao` | Espécie de ação penal, em vocabulário fechado desde 19/09/2026: `Pública Incondicionada`, `Pública Condicionada à Representação`, `Pública Condicionada à Requisição`, `Ação Penal Privada` e `Ação Penal Privada Personalíssima` (CP, art. 236, parágrafo único). |
| `hediondo` | `Sim` / `Não` — inclui os **equiparados** (tráfico, tortura, terrorismo). |
| `hediondo_especie`, `hediondo_fundamento` | Derivados da tabela `data/hediondos.json`: `natureza` (rol do art. 1º da Lei 8.072/90, taxativo), `equiparado` (art. 5º, XLIII, da CF — o crime responde como hediondo sem o ser) ou `nao`, mais o dispositivo que produz a classificação. Hediondez afirmada sem regra na tabela reprova na CI. |
| `hediondo_condicao` | Opcional. Quando a hediondez depende do CASO — o homicídio só é hediondo se praticado em atividade de grupo de extermínio —, aqui fica a hipótese, em texto, e `hediondo` permanece `Não`. |
| `acao_condicao` | Opcional, mesma ideia para a ação penal (art. 161, §3º: privada se a propriedade é particular). |
| `pena_por_remissao` | Opcional. `{dispositivo_fonte, lei_fonte, artigos_fonte, operador, fracao}` quando o tipo não comina moldura própria e importa a de outro dispositivo — art. 304 do CP, "a pena cominada à falsificação". Incompatível com `pena_min`/`pena_max`. O operador segue a dosimetria: `diminuicao` com `1/3` multiplica a moldura de origem por 2/3; `aumento`, por 4/3. |
| `vigencia_ate` | Opcional. Data (AAAA-MM-DD) em que o dispositivo deixou de vigorar. Deriva `vigente: false`. |
| `vigencia_nota` | **Obrigatória quando há `vigencia_ate`.** O que houve e qual dispositivo passa a reger a conduta. Um registro que sai do ar sem dizer por quê é pior que um registro errado: quem consulta um fato anterior não sabe se ainda pode se apoiar nele. |
| `elemento` | `Doloso`, `Culposo`, `Preterdoloso`. |
| `tentativa` | O tipo admite tentativa? |
| `violencia` / `grave_ameaca` | Elementares que vedam vários atributos. |
| `obs` | Texto livre com a descrição legal. **Descritivo**: a pena publicada vem de `pena_min`/`pena_max`, não daqui. |

## Campos derivados

Gerados por `scripts/transform_data.py`. **Todos são heurísticos** e sujeitos a revisão.

| Campo | Como é derivado |
|---|---|
| `pena_privativa` | Mapeado de `tipo_pena`. |
| `tem_multa`, `multa_regime` | Regex sobre `obs` (`e multa` → cumulativa; `ou multa` → alternativa). |
| `pena_min_meses`, `pena_max_meses` | Cópia de `pena_min`/`pena_max`, que são a autoridade. O mês vale 30 dias, e a unidade real da pena é o **dia**: o art. 11 do CP manda **desprezar** as frações de dia — desprezar, não arredondar, porque arredondar para cima agravaria a pena sem lei. Na dosimetria o desprezo incide sobre o efeito, antes de somar. |
| `pena_*_rotulo`, `pena_faixa_rotulo` | Exibição na unidade natural. |
| `infracao_menor_potencial` | `contravencao`, **ou** `pena_max_meses <= 24`, **ou** multa isolada (art. 61 da Lei 9.099/95). Nunca no CPM (art. 90-A); sempre no art. 28 da Lei 11.343/06, que o art. 48, §1º, manda ao rito da Lei 9.099. |
| `contravencao` | Pena de prisão simples (LICP, art. 1º), ou registro da LCP ou da Lei 7.437/85, que declaram contravenção tudo o que tipificam. |
| `tem_pena_privativa` | O tipo comina prisão, própria ou por remissão? Se não, declara `sancoes_nao_privativas`, ou é o guarda-chuva de uma remissão desdobrada em registros "c/c". |
| `resultado_morte` | Regex sobre o **nome** do tipo (art. 112, VI e VIII, LEP). |
| `perdao_judicial_previsto` | Lista curada de dispositivos (art. 107, IX, CP). |
| `chave_dispositivo`, `duplicata`, `duplicata_divergente` | Detecção de registros repetidos. |
| `fonte`, `conferido_em`, `conferido_resultado` | Trilha de auditoria: contra qual página, quando e com que resultado o registro foi conferido. Vem de `data/conferencia.json`, escrito pela rodada semanal. |
| `duplicata_tipo` | `pena` · `identidade` · `hediondez` — o tipo do defeito (ver abaixo). |

### `tem_pena_privativa` — e por que o catálogo só tem tipos penais

Até a v1.1.0 o catálogo carregava, além dos tipos penais, **notas de referência e
dispositivos sem pena própria**: `REFERÊNCIA — A LGPD não tipifica crimes`, `CP, Art. 141,
I` (causa de aumento), `CP, Art. 171, §5º` (regra de ação penal), `CP, Art. 128` (excludente
de ilicitude). Eram 21 registros com pena zero.

Com pena zero, eles **satisfaziam qualquer teto de pena** e eram contados como "cabíveis"
em transação penal, ANPP e sursis — inflando o alcance desses atributos. A transação
reportava 325 tipos cabíveis; o correto era 303.

Foram removidos, e a regra passou a ser **imposta** pelo transformador: um registro que não
declare pena nem sanção falha o build (convenção C1, no `CONTRIBUTING.md`).

Sobram duas distinções legítimas.

A primeira é o **tipo penal que não comina prisão**. O exemplo mais claro é o art. 28 da
Lei 11.343/06 (porte para consumo), cujas sanções são as do art. 28, I a III — advertência,
prestação de serviços e medida educativa; a maior parte dos demais são contravenções
punidas só com multa, como o art. 32 da LCP (dirigir sem habilitação). São tipos penais,
ficam no catálogo, declaram `sancoes_nao_privativas` ou `tipo_pena: "Multa"` e recebem
`tem_pena_privativa: false`, que os mantém fora das estatísticas de alcance (que se medem
por patamar de pena) sem excluí-los da consulta.

A segunda é o **tipo que não comina moldura própria porque importa a de outro
dispositivo**. O art. 304 do Código Penal pune o uso de documento falso com "a pena
cominada à falsificação", e a moldura depende de qual dos arts. 297 a 302 foi usado — as
faixas vão de detenção de um mês a reclusão de seis anos. Esses registros declaram
`pena_por_remissao`, e o motor os avalia com a moldura de cada dispositivo de origem: o
veredito é o comum às origens, ou "depende" quando elas divergem. Por isso entram nas
estatísticas de alcance (decisão de 19/09/2026). A exceção é a remissão que o catálogo já
desdobra em registros "c/c" — a Lei 2.889/56, arts. 2º e 3º, desdobrada nas alíneas do
art. 1º —: ali os desdobrados contam, e o guarda-chuva não, para o mesmo crime não contar
duas vezes. A alternativa que o catálogo praticava — publicar a moldura de um dos
dispositivos-fonte — afirmava como certa uma pena que depende do caso.

:::note[Majorantes com pena própria são exibidas]
As causas de aumento que constituem um **dispositivo com pena própria** — como o roubo
majorado (art. 157, §2º) — são tipos do catálogo e aparecem normalmente na busca. O que
não entra é a causa de aumento **abstrata**, que só diz "aumenta-se de 1/3" sobre a pena
de *outro* crime, sem patamar próprio (ex.: art. 141, aumento nos crimes contra a honra):
como registro de pena zero, ela distorceria as estatísticas de alcance. Essas majorantes
abstratas são modeladas como **entidade própria**, em `data/modificadores.json`, e
aplicadas na 3ª fase da dosimetria (art. 68, CP).
:::

### `resultado_morte` — por que só o nome do tipo

A regex roda **apenas contra o nome do tipo**, nunca contra `obs`. O campo `obs` costuma
descrever a pena de *outros parágrafos* do mesmo artigo ("se resulta morte, triplica"), o
que produziria falsos positivos em tipos cujo caput não é qualificado pela morte — como o
art. 135 (omissão de socorro), o art. 267 (epidemia dolosa) e o art. 270 (envenenamento).

O campo importa porque o art. 112, VI e VIII, da LEP reserva as frações de 50% e 70% ao
condenado por **crime hediondo com resultado morte**, e o art. 122, §2º, lhe veda a saída
temporária.

### `perdao_judicial_previsto` — por que uma lista curada

Não existe perdão judicial genérico: ele só incide **onde a lei o prevê expressamente** e
**não se estende por analogia**. Por isso o campo não é inferido do elemento culposo, e
sim de uma lista de dispositivos mantida em `PERDAO_JUDICIAL`, no script de transformação.
Onde a lei restringe o perdão à modalidade culposa, a regra exige `elemento == "Culposo"`
— o art. 121, §4º, por exemplo, tem uma 1ª parte culposa e uma 2ª parte dolosa, e só a
primeira o admite.

## Garantias de qualidade

A cada regeneração, o script emite `static/data/qualidade.json` com o estado do catálogo
(e o total de atributos penais, contado de `data/atributos.json`),
e a CI o valida antes de qualquer publicação.

Os números vivos ficam em duas páginas geradas, para não envelhecerem aqui:
[Completude](/docs/completude) (quantos tipos, por diploma) e
[`/data/qualidade.json`](pathname:///atlaspen/data/qualidade.json) (o relatório completo,
com os `id` de cada pendência). O que esta página fixa são os **invariantes**:

| Invariante | Estado |
|---|---|
| Contradições internas | **0**, travadas pela CI |
| Registros sem pena declarada | **0** (todo tipo declara pena ou sanção) |
| `id` reaproveitado | **0**, travado pela CI |
| Divergência com o texto compilado | **0** na última conferência semanal |

### Contradições: zeradas e travadas

Uma contradição interna ocorreria se dois registros do mesmo dispositivo (`lei + artigo`)
divergissem em pena ou hediondez. **Não há nenhuma** — todas foram conferidas contra o
texto compilado do Planalto. O transformador as classificava em três tipos (`pena`,
`identidade`, `hediondez`) por um **coeficiente de sobreposição** de vocabulário, e esse
classificador segue ativo como guarda: a CI roda
`transform_data.py --estrito --max-contradicoes=0` e **falha se uma nova contradição
entrar**. O catálogo não pode regredir.

### O que a CI garante a cada mudança

- **Só tipos penais** (convenção C1): notas de referência, agravantes e excludentes não
  entram.
- **Toda sanção declarada** (C2) e **`id` append-only** (C3): a URL pública nunca aponta
  para o crime errado.
- **Zero contradições** (C4) e derivado sincronizado com a fonte.
- **Casos-âncora de direito penal** (`npm run verificar`): cada atributo avaliado contra o
  catálogo real, com os invariantes do motor.
- **Casos-padrão do motor** (`scripts/verificar_casos.ts`, no mesmo comando): 47 afirmações
  com tipo real, premissa explícita, veredito esperado e o dispositivo que o sustenta —
  transação, ANPP, sursis, substituição, regime, progressão, livramento, prescrição,
  clemência e execução, nos quatro estados de reincidência. Tipo não encontrado é FALHA, e
  não caso pulado: uma tabela que se desliga sozinha não verifica nada. Foi ela que, em
  19/09/2026, mostrou que o reincidente genérico recebia a fração de progressão do primário.
- **Congelamento dos vereditos** (`npm run equivalencia`): 22 atributos × 1.496 tipos × 4
  cenários (página do tipo, busca por atributo, reincidente em crime doloso e reincidente
  específico). Refatorar o motor sem mudar resposta nenhuma é o resultado esperado; mudança
  de veredito só passa se alguém regravar o congelamento e disser por quê.
- **Conferência semanal contra o Planalto** (`conferidor.yml`): pena, espécie, existência e
  situação de cada dispositivo, com a cobertura publicada no relatório — ver
  [Dados abertos](/docs/dados-abertos#de-onde-vem-cada-registro-e-como-ele-é-revisado).

## Como corrigir um tipo penal

1. Edite `data/crimes.json` — direto pela interface do GitHub, se preferir.
2. Abra um Pull Request descrevendo a fonte legal da correção.
3. A CI valida; ao integrar, o `regen-data` regenera o derivado automaticamente.

Correções finas que a heurística não acerta ficam em tabelas explícitas no
`scripts/transform_data.py` (`CORRECOES`, `CORRECOES_MORTE`), com o motivo documentado —
assim a exceção sobrevive à próxima regeneração.
