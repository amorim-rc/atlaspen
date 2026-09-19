# A4: o lote de decisões do mantenedor

**Data:** 18/09/2026
**Origem:** sub-projeto A do spec `2026-09-17-revamp-atlaspen-design.md`, § 3.1 (A4), mais o que a
conferência do A3 abriu.

Cada item traz a evidência, as saídas e a recomendação. Os três primeiros não são preferência:
são **veredito ou dado errado já publicado**, inclusive na `main` — o motor de atributos e o
derivado do catálogo são anteriores ao revamp.

---

## 1. Reincidência: o réu só tem dois estados, e a lei pede três

**Evidência.** O cenário do réu (`Cenario`, `CenarioReverso`) só tem `reincidenteEspecifico`;
`primario` é a negação dele. Três atributos cuja lei veda **qualquer** reincidência leem o campo
específico (`src/lib/atributos/avaliadores.ts`):

| Atributo | Lei | O motor |
|---|---|---|
| ANPP (`:142`) | CPP, art. 28-A, §2º, II — "se o investigado for reincidente" | veda só o específico |
| Sursis da pena (`:228`) | CP, art. 77, I — "não seja reincidente em crime doloso" | veda só o específico |
| Regime inicial (`:257`) | CP, art. 33, §2º, *b* e *c* — "não reincidente" | agrava só o específico |

O parâmetro dos dois primeiros chama-se `vedadoReincidente`: a intenção era a regra certa, mas o
cenário não tem como dizer "reincidente, não específico", e esse réu é lido como primário. Hoje
a tela diz "cabe ANPP" para quem a lei veda.

Na progressão (LEP, art. 112) e no livramento (CP, art. 83, V), o específico é o que a lei e o
STJ pedem, e ali o motor está certo.

**Saídas.** (a) Três estados — primário, reincidente, reincidente específico — no cenário, nos
controles de premissa e na ficha do tipo; cada avaliador lê o que a lei dele pede. (b) Manter dois
estados e declarar a limitação nos três atributos.

**Recomendação: (a), dentro do A2.** É mudança de contrato do cenário, que o A2 já abre.

## 2. Os 35 tipos "sem pena privativa" são três grupos, e um está errado

**Evidência.** `tem_pena_privativa: false` em 35 registros do derivado:

- **29 só com multa e 2 com "outras penas"** (art. 28 da Lei de Drogas e similar). 31 dos 35 são
  infração de menor potencial ofensivo — e a transação penal (Lei 9.099/95, art. 76) **cabe**
  neles. A ficha não mostra veredito nenhum.
- **4 com pena por remissão:** CP, art. 304 (uso de documento falso); Lei 2.889/56, arts. 2º e 3º
  (associação e incitação ao genocídio, **hediondos**); CPM, art. 315. Eles **têm** pena privativa,
  a do dispositivo a que remetem, e o registro já diz isso em `pena_por_remissao`. O derivado os
  marca como sem pena privativa e os tira de toda a varredura: a associação para genocídio não
  mostra progressão, livramento nem prescrição.

O comentário de `crimesComPenaPrivativa` (`src/lib/atributos/reverso.ts`) diz que "a única exceção
é o art. 28 da Lei 11.343/06". Está desatualizado.

**Saídas.** (a) Corrigir a derivação para os 4 de remissão e mostrar, nos 31, os vereditos dos
atributos que não dependem de pena privativa (transação, sobretudo). (b) Só a correção dos 4.
(c) Manter e declarar.

**Recomendação: (a).** A correção dos 4 é dado errado; a dos 31 é resposta verdadeira escondida.

## 3. A régua da natureza das notas

**Evidência.** A régua aplicada (contratual): *incriminadora* é todo dispositivo com pena própria
que entra no catálogo, inclusive forma qualificada e causa de aumento com moldura própria. Das 10
notas de 2026, 5 são *incriminadora*. Pela leitura doutrinária — *novatio legis incriminadora* é a
conduta antes atípica; a forma nova de conduta já punível é *in pejus* —, quatro mudariam:

| Nota | Por que seria *pejus* na leitura doutrinária |
|---|---|
| 15.358 — formas por organização criminosa ultraviolenta | homicídio, furto, sequestro, latrocínio e ameaça já eram crime |
| 15.384 — vicaricídio (CP, art. 121-B) | a conduta já era homicídio |
| 15.397 — dispositivos incluídos nos crimes patrimoniais | formas qualificadas de furto e roubo |
| 15.410 — tortura de mulher em violência doméstica | a conduta já era punível (CP, art. 147-B, entre outros) |

A quinta, **15.355** (desastre ambiental que prejudica animais, Lei 9.605/98, art. 32, §1º-C),
pede análise caso a caso: parte da conduta pode ter sido atípica.

**O custo de cada lado.** A régua contratual é mecânica: o Proponente a aplica sozinho. A
doutrinária exige, a cada nota, um juízo sobre se a conduta já era punível — trabalho humano, toda
vez. O efeito jurídico não muda (as duas são irretroativas, CF, art. 5º, XL); muda o que o feed
**conta**, e a frente 12 vai contar exatamente isso: quanto do movimento legislativo é
criminalização nova e quanto é endurecimento.

**Recomendação: doutrinária**, com o Proponente propondo pela régua mecânica e a pessoa
confirmando. "Incriminadora" é termo técnico, e usá-lo fora do sentido técnico é imprecisão
publicada.

## 4. O acervo: o que a conferência do A3 abriu

- **`lei9807-19` — o veto não se confirma.** A Lei 9.807/1999 publicada vai do art. 1º ao 21, sem
  lacuna e sem nenhum "(VETADO)", e o art. 19 vigente trata de estabelecimentos para
  colaboradores. O registro nasceu do commit `7f39f21` (19/07/2026), que removeu do catálogo um
  "registro fantasma" e disse, sem fonte, que o crime fora vetado. Pela regra do acervo, registro
  que saiu do catálogo porque estava errado não é acervo. **Recomendação:** retirar do acervo,
  com a URL `/acervo/lei9807-19` redirecionada para `/acervo`.
- **`lcp-60-61` — duas leis, um campo de data.** Art. 60 (mendicância), Lei 11.983/2009, vigente
  em 17/07/2009; art. 61 (importunação ofensiva ao pudor), Lei 13.718/2018, vigente em 25/09/2018.
  **Recomendação:** desmembrar em `lcp-60` e `lcp-61`, com `lcp-60-61` redirecionado — o acervo já
  é, no resto, um dispositivo (ou uma revogação) por registro.
- **Data de revogação dos 11 diplomas inteiros.** `data/diplomas.json` não tem o campo, e o site
  fixa `null`. Três deles pedem escolha: a Lei 8.666/1993 (os crimes caíram em 2021; o resto, em
  2023), a Lei 5.250/1967 (não recepcionada: 1988, ou a ADPF 130, de 2009?) e a Lei 6.815/1980
  (revogada por lei com *vacatio*). **Recomendação:** acrescentar o campo, com a data da perda de
  vigência **dos dispositivos penais** do diploma — é o que o acervo mede. Para a Lei de Imprensa,
  **5/10/1988**, com a ADPF 130 na nota: a não recepção opera desde a promulgação da Constituição,
  e o STF a declarou em 2009. (Corrigido em 18/09/2026; a primeira versão deste lote recomendava a
  data da ADPF.)
- **25 e não 27.** 14 dispositivos e 11 diplomas; os 27 eram do protótipo do desenho. Não há
  registro faltando.

## 5. As quatro decisões de acuidade restantes do revamp

Conferidas contra o código; nenhuma esconde erro. **Recomendação: confirmar as quatro.**

- **Frações canônicas (1/3) no lugar das decimais dos dados (0,3333…).** Só apresentação:
  `rotuloFracao` reconhece a fração exata; o cálculo usa o número.
- **"Bons antecedentes" fora da ficha.** Nenhum avaliador o lê; mostrá-lo sugeriria efeito que
  não há.
- **Editor de moldura da ficha recolhido.** Interface.
- **Símbolo colorido todo no acento.** Identidade visual.

(O "perfil do réu com dois estados", que estava nesta lista, virou o item 1.)

## 6. O que não é decisão agora

- **`ANOS_DE_LEI_RECENTE` do Proponente.** Só se valida com rodadas reais; fica como está.
- **Revisão dos textos do site.** É leitura sua; não há o que decidir antes dela.

---

## Decisões do mantenedor, 18/09/2026

| Item | Decisão | Onde entra |
|---|---|---|
| 1. Reincidência | Três estados — primário, reincidente, reincidente específico | A2 (contrato do cenário) |
| 2. Os 35 tipos | Corrigir os 4 de remissão e mostrar os vereditos dos 31 | A2 (motor), os dois. A remissão não se corrige no dado: sem moldura única, marcar pena privativa daria pena zero no motor; a avaliação tem de ser por dispositivo de origem |
| 3. Natureza das notas | Régua doutrinária; o Proponente propõe pela mecânica e a pessoa confirma | Agora (notas e `AGENTS.md`) |
| 4. `lei9807-19` | Retirar do acervo e redirecionar. O veto não consta do Planalto, da publicação original no DOU nem do LegIn da Câmara | Agora |
| 4. `lcp-60-61` | Desmembrar em `lcp-60` e `lcp-61`, com redirecionamento | Agora |
| 4. Diplomas | Campo de data de revogação, com as três regras deste lote | Agora |
| 5. Acuidade | As quatro confirmadas | Backlog |
