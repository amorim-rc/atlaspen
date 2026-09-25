---
id: progressao-de-regime
title: Progressão de regime
description: As duas tabelas do art. 112 da LEP, o corte pela data do fato, o que o veto fez com o inciso IV e as ADIs em curso.
sidebar_position: 3
---

# Progressão de regime

O art. 112 da Lei de Execução Penal é o dispositivo mais instável do catálogo, e o que
mais exige do motor: mudou duas vezes em 2026, em datas diferentes, e a lei nova é mais
gravosa para um grupo e mais branda para outro. Esta página documenta o que o motor
calcula, por qual regra e onde ele se recusa a escolher. É também a página mais perecível
do site: **reconfira o andamento das ADIs antes de citar qualquer dado daqui.**

## As frações em vigor

| Inciso | Situação | Fração |
| --- | --- | --- |
| *caput* | Regra geral — **1/6 da pena no regime anterior** | 16,67% |
| I | Primário, com violência/grave ameaça, **salvo Título XII** | 25% |
| II | Reincidente, com violência/grave ameaça, **salvo Título XII** | 30% |
| III | Reincidente em crime diverso dos dos incisos I e II | 20% |
| IV | Reincidente, com violência/grave ameaça — **sem** a ressalva do Título XII (redação de 2019; a nova foi vetada) | 30% |
| V | Primário, hediondo/equiparado | 70% |
| VI, "a" | Primário, hediondo com resultado morte (livramento vedado) | 75% |
| VI, "b" | Comando de organização criminosa **ultraviolenta** estruturada para crime hediondo (livramento vedado) | 75% |
| VI, "c" | Constituição de milícia privada | 75% |
| VI, "d" | Primário, feminicídio (livramento vedado) | 75% |
| VII | Reincidente, hediondo | 80% |
| VIII | Reincidente específico, hediondo com resultado morte (livramento vedado) | 85% |
| IX e X | *(vetados — nunca existiram)* | — |

Os incisos V a VIII vêm da **Lei 15.358/2026**, que também acrescentou a alínea "d", pôs
"ultraviolenta" e a vedação do livramento na alínea "b" e revogou o inciso VI-A. O *caput*
e os incisos I a III vêm da **Lei 15.402/2026**, de 08/05/2026.

**Quatro incisos vedam o livramento condicional na própria letra** — VI, "a", "b" e "d",
e VIII. A vedação é regra de cálculo do motor, não apenas texto de nota.

## Duas tabelas, com corte pela data do fato

A Lei 15.402/2026 não é uniformemente mais benéfica. Para o **primário condenado por
crime sem violência**, a hipótese saiu do inciso I (16%) e passou a cair no *caput* (1/6 =
**16,67%**): a lei nova é mais **gravosa** para esse grupo e, portanto, **não retroage**
(CF, art. 5º, XL; CP, art. 2º, parágrafo único). A retroatividade da lei mais benéfica
apura-se **por situação concreta**, não em bloco.

| Perfil | Fato até 07/05/2026 | Fato a partir de 08/05/2026 |
| --- | --- | --- |
| Primário, sem violência | 16% da pena (inciso I de 2019) | 1/6 da pena no regime anterior (*caput*) |
| Reincidente, sem violência | 20% (inciso II de 2019) | 20% (inciso III) |
| Primário, com violência | 25% (inciso III de 2019) | 25% (inciso I) |
| Reincidente, com violência | 30% (inciso IV de 2019) | 30% (inciso II) |
| Título XII, primário | 16% ou 25% conforme violência | 1/6 pelo *caput* |

Marque **"fato anterior a 08/05/2026"** na simulação da página do tipo penal para calcular
pela tabela do Pacote Anticrime. A busca por atributo não tem essa opção: ela varre o
catálogo em abstrato, pela lei vigente.

:::note[A base de cálculo do caput não é a dos incisos]
O *caput* conta **1/6 da pena no regime anterior**; os incisos contam percentual **da
pena total**. São operações distintas dentro do mesmo artigo. Na **primeira** progressão
as duas bases coincidem, e é ela que o sistema calcula; nas seguintes, a base do *caput*
é o remanescente. Progressão sucessiva não é modelada.
:::

## Título XII — o critério é topográfico

Os incisos I e II ressalvam "os crimes previstos no Título XII da Parte Especial do
Código Penal" — arts. 359-A a 359-T, contra o Estado Democrático de Direito. A ressalva
**não pergunta se houve violência**: o art. 359-L (abolição violenta) e o art. 359-M
(golpe de Estado) são violentos por definição típica e ainda assim entram. Para o
primário sobra o *caput*, por exclusão expressa.

Para o **reincidente** há duas leituras sustentáveis, e o sistema devolve o resultado
como *condicional*, com as duas escritas: pelo **inciso III** (20%), porque os crimes do
Título XII estão fora do alcance de I e II e são portanto "diversos" deles; ou pelo
***caput*** (16,67%), porque "crimes referidos nos incisos I e II" significaria crimes
violentos, categoria a que eles materialmente pertencem. A diferença é de 3,33 pontos, e
é matéria que os tribunais de execução vão fixar.

## O inciso IV, e o que o veto fez com ele

A Lei 15.402/2026 **propôs redação nova para os incisos IV a X** — e **todos os sete
foram vetados**. O que sobra, no texto consolidado, é: o inciso IV na redação de 2019
(30% para o reincidente em crime com violência ou grave ameaça, **sem** a ressalva do
Título XII), os incisos V a VIII na redação da Lei 15.358/2026, e os incisos IX e X como
"(VETADO)".

Isso importa porque o inciso IV passou a repetir o conteúdo do novo inciso II — e a
sobrevivência dele **não é descuido de técnica legislativa**: é o resultado deliberado do
processo de veto. O argumento de revogação tácita, que essa sobreposição sugeriria, fica
enfraquecido, e abre-se uma terceira leitura para o reincidente em crime violento do
Título XII: ele cairia no inciso IV, que não o ressalva, a 30%.

**O sistema não escolhe.** Para o reincidente em crime do Título XII o resultado sai como
*condicional*, com as leituras concorrentes escritas. A escolha depende das razões do
veto aos incisos IV a X e de pronunciamento do STJ ou do STF, e enquanto não houver um nem
outro, calcular pelo *caput* — o mais favorável ao apenado — é o que o catálogo pode
afirmar.

## Sob controle de constitucionalidade

Contra a Lei 15.402/2026 tramitam as **ADIs 7966, 7967, 7968 e 7969**, por vício formal
na apreciação do veto e por inconstitucionalidade material. **Não há cautelar com eficácia
*erga omnes***: o que houve, em 09/05/2026, foi o afastamento pontual da lei em oito
Execuções Penais. A lei está em vigor e o catálogo a aplica — não aplicá-la estenderia ao
catálogo inteiro uma restrição que existe em oito processos.

Os parâmetros que esta página descreve vivem em `data/atributos.json`, com a redação de
cada um e a lei que a deu; a história do dispositivo, em `data/historico-legislativo.json`.
Se um tribunal superior fixar uma das leituras, ou se o Supremo decidir as ADIs, é lá que
o dado muda — e o [Arquivista](./os-robos.md#arquivista--a-prosa-envelhece-como-o-dado) acusa
esta página até que alguém a releia.
