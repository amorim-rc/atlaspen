---
id: metodologia
title: Metodologia
sidebar_position: 2
---

# Metodologia

## Unidade de análise: o tipo penal

A unidade de análise é o
**tipo penal**: cada conduta com cominação de pena própria — incluindo formas simples,
qualificadas, privilegiadas, culposas, e cada inciso/alínea que gere pena autônoma.

O catálogo cobre o Código Penal, o Código Penal Militar, a Lei de Drogas, o Estatuto do
Desarmamento, o CTB, o ECA, a Lei Maria da Penha, os Crimes Ambientais e dezenas de
outros diplomas.

## Campos do catálogo

Cada tipo penal registra, entre outros: `lei`, `artigo`, `crime`, `pena_min` e
`pena_max` (em **meses**), `tipo_pena`, `acao`, `hediondo`, `elemento` (doloso, culposo, preterdoloso ou
qualificado pelo resultado), `tentativa`,
`violencia`, `grave_ameaca` e `obs`.

Seis campos são opcionais e existem para não afirmar o que a lei não afirma:
`hediondo_condicao`, `acao_condicao` e `violencia_condicao` guardam, em texto, a
hipótese de que a classificação depende — o homicídio só é hediondo se praticado em
atividade típica de grupo de extermínio; o exercício arbitrário das próprias razões só
é de ação privada se não houver violência; e sequestrar não pressupõe violência, porque
a privação da liberdade pode ser obtida por fraude ou engano. Nos três, o campo
principal fica no valor seguro — "Não" —, e a hipótese contrária fica escrita ao lado.
No caso da violência, o motor calcula os atributos nas duas hipóteses e mostra as duas.

`hediondo_nota` é diferente, e a diferença importa: ela registra divergência de
**jurisprudência ou de doutrina**, não circunstância do caso. O tipo não muda conforme
o que aconteceu; muda conforme quem julga. `vigencia_ate`, com a nota obrigatória `vigencia_nota`,
registra a data em que o dispositivo deixou de vigorar, sem tirá-lo do catálogo: fato
anterior continua regido por ele. E `pena_por_remissao` diz de onde a moldura vem,
quando o tipo não comina uma: o art. 304 do Código Penal pune o uso de documento falso
com "a pena cominada à falsificação", e qual é ela depende de qual falsificação foi
usada.

### Campos derivados automaticamente

Para viabilizar filtros combinados e o cálculo de atributos, alguns campos são
**derivados por heurística** a partir do texto legal e das observações:

| Campo | Descrição | Como é derivado |
|-------|-----------|-----------------|
| `pena_privativa` | Reclusão, Detenção, Prisão simples ou Nenhuma | mapeado de `tipo_pena` — `Multa`, `Morte` e `Outras penas` viram `Nenhuma`, porque não são pena de prisão |
| `tem_multa` | se há pena de multa (cumulativa, alternativa ou isolada) | regex sobre `obs` |
| `multa_regime` | `cumulativa` / `alternativa` / `isolada` / `nenhuma` | conectores no texto |
| `infracao_menor_potencial` | contravenção, ou crime com pena máxima ≤ 2 anos ou só com multa (art. 61 da Lei 9.099/95); nunca crime militar (art. 90-A) | `contravencao`, ou `pena_max ≤ 24`, ou multa isolada; fora o CPM; dentro o art. 28 da Lei 11.343/06 (art. 48, §1º) |
| `vigente` | o dispositivo ainda vigora? | ausência de `vigencia_ate` |
| `hediondo_especie` | `natureza`, `equiparado` ou `nao` | **não é heurística**: casamento com a tabela curada `data/hediondos.json` (`scripts/hediondez.py`), a mesma contra a qual a auditoria roda |
| `hediondo_fundamento` | o dispositivo que torna o tipo hediondo | o `fundamento` da regra que casou |

:::warning[Multa é uma dimensão independente]
No Direito Penal brasileiro a multa é, na maioria dos casos, **cumulada** com a pena
privativa ("reclusão de 1 a 4 anos, **e multa**"). Por isso a multa é modelada como uma
dimensão **independente** (`tem_multa`), e não como um valor mutuamente exclusivo de
reclusão/detenção. Consequência prática: filtrar por **"Reclusão"** retorna também os
tipos com **reclusão + multa**. Para restringir apenas aos que têm multa, combine
"Reclusão" com o chip "Multa".
:::

Todos os campos derivados carregam a marca `derivado_auto: true` e serão revisados
individualmente. Correções manuais podem ser registradas em `CORRECOES` no
`scripts/transform_data.py` e regeneradas com `python3 scripts/transform_data.py`.

## Cálculo dos atributos

Os atributos são calculados por **funções puras** sobre um *cenário* (pena em abstrato,
pena concreta e características do réu/caso). O cálculo é **recalculado em tempo real** à
medida que o usuário altera qualquer parâmetro — inclusive a própria pena cominada, o que
permite **simular alterações legislativas**.

Os patamares legais adotados (limiares de 1, 2 e 4 anos; frações de progressão do
Art. 112 LEP; tabela de prescrição do Art. 109 CP; etc.) estão documentados em
[Atributos penais](./atributos-penais.md). São dados, e não código: ficam em
`data/atributos.json`, cada um com o dispositivo e a lei de cada redação, conferidos contra
o texto compilado, e a história de cada dispositivo fica em `data/historico-legislativo.json`.
