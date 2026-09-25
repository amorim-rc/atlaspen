---
id: atributos-penais
title: Atributos penais
description: Os 22 atributos, os parâmetros de cada um e a lei em que se apoiam.
sidebar_position: 3
---

# Atributos penais

O AtlasPen modela os **22 atributos** abaixo — as consequências que a lei liga a cada tipo
penal, favoreçam ou não quem responde por ele. Todos os valores de pena são tratados em
**meses**. A implementação é para fins de pesquisa e simplifica controvérsias; por que
chamamos isso de *atributo*, e não de *benefício*, está no
[Manifesto pelo termo "atributo"](/projeto/manifesto-atributo).

## Como os atributos são modelados

Cada atributo é um **registro de dados**, em
[`data/atributos.json`](https://github.com/amorim-rc/atlaspen/blob/main/data/atributos.json),
e não uma regra embutida no código. O registro reúne:

- **metadados** — número (estável, como o id dos tipos penais), nome, fundamento legal,
  categoria e *natureza*;
- **requisitos** e **vedações**, com citação do dispositivo ou súmula;
- **parâmetros editáveis** — cada patamar, fração ou vedação é um dado, com o valor padrão
  da legislação vigente e as **redações** de onde ele vem: o dispositivo, a lei que deu
  cada redação e, quando o número mudou, o valor antigo.

No código fica só uma **função pura de avaliação** por atributo, que lê os parâmetros em
vez de constantes. Essa separação é o que permite a **busca por atributo**: alterar um
patamar recalcula o catálogo inteiro de tipos penais sem tocar no código.

A vida de cada dispositivo — criação, alterações e revogação, com a lei e o link para o
artigo dela no Planalto — fica em `data/historico-legislativo.json`, extraída do texto
compilado. Dela saem, no arquivo público
[`/data/atributos.json`](pathname:///atlaspen/data/atributos.json), a **última alteração legislativa** de
cada atributo e de cada parâmetro, e o **alcance** de cada atributo sobre o catálogo de
tipos penais (ver [Dados abertos](./dados-abertos.md#atributos-penais)).

### Natureza do atributo

A *natureza* indica de qual pena o atributo depende — e determina se a busca por atributo
é exata ou presumida:

| Natureza | Significado | Busca por atributo |
| --- | --- | --- |
| **Pena em abstrato** | Depende da pena cominada no tipo | Avaliação **exata** |
| **Pena concreta** | Depende da pena fixada na sentença | Exige **pena concreta presumida** |
| **Independe da pena** | Não há patamar (detração, remição) | Alcança todo o catálogo |

:::note[Pressuposto metodológico da busca por atributo]
A pena concreta **não é campo do tipo penal**. Para varrer o catálogo, o sistema presume
uma pena concreta — por padrão, a **pena mínima cominada** (hipótese do réu condenado no
mínimo legal, a mais favorável e a de uso corrente na pesquisa empírica). A base pode ser
trocada por pena máxima ou por um valor fixo aplicado a todos os tipos.
:::

## Atributos processuais (pena em abstrato)

| Atributo | Fundamento | Critério objetivo |
| --- | --- | --- |
| **Transação penal** | Art. 76, Lei 9.099/95 | Pena máxima ≤ 2 anos, ou contravenção (menor potencial ofensivo); nunca no crime militar (art. 90-A) |
| **Suspensão condicional do processo** | Art. 89, Lei 9.099/95 | Pena mínima ≤ 1 ano; nunca no crime militar (art. 90-A) |
| **ANPP** | Art. 28-A, CPP | Pena mínima < 4 anos, sem violência/grave ameaça, confissão; vedado ao reincidente (§2º, II) e quando cabe transação penal (§2º, I) |
| **Colaboração premiada** | Art. 4º, Lei 12.850/13 | Redução de até 2/3 ou perdão judicial; até 1/2 se posterior à sentença |

## Aplicação da pena

| Atributo | Fundamento | Critério objetivo |
| --- | --- | --- |
| **Substituição por PRD** | Art. 44, CP | Pena ≤ 4 anos, sem violência/grave ameaça (doloso); culposo sempre |
| **Sursis da pena** | Art. 77, CP | Pena ≤ 2 anos (comum); ≤ 4 anos (etário/humanitário) |
| **Regime inicial** | Art. 33, §2º, CP | > 8 anos fechado; > 4 e ≤ 8 semiaberto; ≤ 4 aberto |
| **Perdão judicial** | Art. 107, IX, CP | Só nas hipóteses expressas em lei (em regra, culposas) |
| **Arrependimento posterior** | Art. 16, CP | Sem violência/grave ameaça + reparação até o recebimento da denúncia → redução de 1/3 a 2/3 |
| **Desistência voluntária e arrependimento eficaz** | Art. 15, CP | Tipo que admita tentativa; responde só pelos atos praticados |

## Execução penal

| Atributo | Fundamento | Critério |
| --- | --- | --- |
| **Progressão de regime** | Art. 112, LEP | Frações de 1/6 a 85% conforme reincidência, violência, hediondez e resultado morte; duas tabelas, com corte pela data do fato — ver [Progressão de regime](./progressao-de-regime.md) |
| **Livramento condicional** | Art. 83, CP | 1/3 (primário, ou reincidente em crime culposo), 1/2 (reincidente em crime doloso), 2/3 (hediondo); vedado ao reincidente específico em hediondo e nas quatro hipóteses do art. 112 da LEP |
| **Prescrição** | Art. 109, CP | Tabela por pena (abstrata e concreta) — abaixo |
| **Saída temporária** | Art. 122, LEP | Regime semiaberto, só para estudo (art. 122, II); 1/6 (primário) ou 1/4 (reincidente); vedada a crime hediondo ou com violência ou grave ameaça contra pessoa (art. 122, §2º, Lei 14.843/2024) |
| **Detração** | Art. 42, CP | Desconto de prisão provisória (qualitativo) |
| **Remição** | Art. 126, LEP | Trabalho (1 dia/3) e estudo (1 dia/12h); +1/3 por conclusão de curso |
| **Prisão domiciliar** | Art. 117, LEP; art. 318, CPP | Hipóteses humanitárias; HC 143.641/SP (gestantes e mães) |
| **Monitoração eletrônica** | Art. 146-B, LEP; art. 319, IX, CPP | Saída temporária, domiciliar ou cautelar diversa da prisão |
| **Indulto coletivo** | Art. 84, XII, CF | Decreto anual; vedado a hediondos/equiparados |
| **Comutação de penas** | Art. 84, XII, CF; art. 192, LEP | Indulto parcial: reduz a pena remanescente |
| **Graça (indulto individual)** | Art. 84, XII, CF; art. 188, LEP | Clemência individual; vedada a hediondos/equiparados |
| **Unificação de penas** | Art. 75, CP | Teto de cumprimento de 40 anos; Súmula 715, STF |

## Progressão de regime

O art. 112 da LEP mudou duas vezes em 2026, em datas diferentes, e a lei nova não é
uniformemente mais benéfica: para um grupo de condenados ela agrava, e portanto não
retroage. O motor mantém as duas tabelas e escolhe pela data do fato; onde há mais de uma
leitura sustentável — o reincidente em crime do Título XII —, devolve *condicional* com as
leituras escritas. Frações, tabelas de transição, o efeito do veto e as ADIs em curso
estão em [Progressão de regime](./progressao-de-regime.md).

## Tabela de prescrição (art. 109, CP)

| Pena máxima cominada | Prazo prescricional |
| --- | --- |
| Superior a 12 anos | 20 anos |
| Superior a 8 e até 12 anos | 16 anos |
| Superior a 4 e até 8 anos | 12 anos |
| Superior a 2 e até 4 anos | 8 anos |
| Igual a 1 ano, ou superior e até 2 anos | 4 anos |
| Inferior a 1 ano | 3 anos |

:::note[Reduções e aumentos]
As reduções e aumentos do prazo (art. 115 — metade para quem era menor de 21 na data do
fato ou maior de 70 na sentença; art. 110 — aumento de 1/3 para o reincidente, na
prescrição da pretensão executória) são indicados nos detalhes de cada resultado.
:::
