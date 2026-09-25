---
title: Os robôs
description: Como o AtlasPen descobre que a lei mudou — o que cada robô vigia, com que critério, e o que nenhum deles alcança.
---

# Os robôs

Um catálogo de direito penal envelhece sozinho. A lei muda toda semana, e a
defasagem não avisa: um registro errado tem a mesma aparência de um registro
certo. A resposta do projeto a isso são **rotinas automáticas** que rodam toda
segunda-feira, às 5h de Brasília, cada uma vigiando uma coisa diferente. Hoje são
cinco, e cada uma tem nome próprio — o log diz qual falhou sem que ninguém precise
abrir a execução.

Esta página existe para que você possa **discordar dos critérios**. Todos eles
são escolhas, várias são discutíveis, e quase todas já mudaram pelo menos uma vez
por causa de um erro que passou. Se um critério lhe parecer estreito demais ou
largo demais, [abra uma issue](https://github.com/amorim-rc/atlaspen/issues) — é
o tipo de retorno que mais serve ao catálogo.

:::note[Determinístico, sem IA]
Nenhum dos cinco usa modelo de linguagem. São expressões regulares e comparação
de texto, lidas contra o texto **compilado** oficial do `planalto.gov.br`. Onde
não há certeza, o resultado é uma **pergunta para leitura humana**, nunca uma
alteração automática do dado.
:::

## O que cada um vigia

| Robô | Pergunta que responde | Onde procura |
|---|---|---|
| **Vigia** | A pena publicada é a que a lei comina hoje? | O texto compilado de cada diploma de `data/fontes.json` |
| **Sentinela** | Nasceu lei penal que ainda não vigiamos? | A Seção 1 do Diário Oficial da União |
| **Auditor** | Os campos que a pena não alcança estão certos? | Hediondez, ação penal, causas de aumento e nomes |
| **Arquivista** | A prosa ainda descreve o sistema? | A documentação, contra os arquivos de que ela fala |
| **Recenseador** | Existe lei penal que ninguém leu? | Todas as leis do ano, uma a uma (mensal) |

Sentinela e Arquivista correm em paralelo com o Vigia; o Auditor espera por ele,
porque lê as páginas que ele baixou. O Recenseador roda uma vez por mês, na
primeira semana. Se algum tiver o que dizer, nasce **uma issue por rodada**. Se todos
se calarem, a rodada deixa só o carimbo de que a conferência aconteceu.

A issue da semana **substitui a da semana passada**, que é fechada como superada — mas só
a que ninguém comentou. A conferência é sem estado: ela recalcula tudo a cada rodada, então
achado que continua valendo reaparece sozinho na issue nova. O que não reaparece é o que
uma pessoa escreveu. Issue com comentário deixou de ser a foto da semana e virou conversa:
fica aberta, e só se fecha quando a discussão tiver destino.

Na **sexta-feira anterior**, às 23h, um ensaio baixa os mesmos compilados e joga fora. Não
é para adiantar trabalho — a segunda baixa os dela e sempre lê o texto do dia. É para
descobrir com o fim de semana pela frente que uma fonte saiu do ar ou mudou de forma:
quando isso acontece, o Vigia cai e leva o Auditor com ele; Sentinela e Arquivista
seguem, porque não dependem do que ele baixou.

---

## Vigia — a moldura contra o compilado

Baixa a página compilada de cada diploma de `data/fontes.json`, estrutura dispositivo por
dispositivo, lê as molduras de pena e compara com o que o catálogo publica. Os diplomas
de referência — a Lei dos Crimes Hediondos, a LEP, o CPP, a Lei 9.099/95 e a CF — não
têm tipo penal no catálogo: são baixados porque fundamentam a hediondez e os atributos.

**O que ele acusa:** moldura ou espécie de pena divergente; dispositivo que a lei
comina e o catálogo não tem; registro cujo dispositivo não foi localizado.

**O que ele não faz:** criar nem remover registro. Criar exige decidir se o
dispositivo é crime autônomo, causa de aumento ou nada — e essa decisão é humana.
A primeira leva automática de criação trouxe 29 registros que não eram tipos
penais vigentes, e foi preciso retirá-los na versão seguinte.

### A trava de cobertura

É a peça mais importante do Vigia, e a menos óbvia. Ele conta **quantos registros
não consegue garantir**, separados por motivo, e guarda um teto para cada um.
Passar do teto é regressão e vira achado.

A razão é o modo de falhar que mais dói aqui, que é o silencioso: quando o Vigia
lê um registro e a pena não bate, sai um achado — você vê. Mas quando o registro
**sai da conferência**, ele não aparece como divergente; aparece como nada. E
silêncio não é aprovação.

A trava nasceu de um caso concreto: três incisos do art. 151 do Código Penal
publicaram por anos seis vezes a pena que a lei comina, e nenhuma rodada disse
nada — porque um dispositivo cuja pena está em outro dispositivo nunca tem pena
escrita para conferir.

**Motivos pelos quais um registro fica fora da conferência**, todos declarados:

| Motivo | O que significa |
|---|---|
| `pena_derivada` | A lei manda calcular sobre uma base ("aumenta-se de um terço") |
| `pena_importada` | A lei manda aplicar a pena de outro dispositivo |
| `sancao_nao_privativa` | O tipo não comina prisão (multa, ou outra sanção) |
| `sem_preceito_proprio` | O dispositivo não comina pena: é norma explicativa |
| `ilegivel` | **A lei escreveu a pena e o leitor não conseguiu ler.** É lacuna a fechar, não número aceito |
| `nao_localizado` | O dispositivo do registro não foi achado no compilado. **O teto é zero** |

### Quando o catálogo já diz que a pena é de outro artigo

Alguns tipos não cominam moldura própria: o art. 304 do Código Penal pune o uso
de documento falso com "a pena cominada à falsificação". Outros derivam de outro
artigo por um fator — os crimes de tempo de guerra do Código Penal Militar. Nesses
casos o Vigia não compara nada, porque o próprio registro já declarou de onde a
pena vem. Ele conta o registro entre os que não garante, com o motivo ao lado.

---

## Sentinela — a lei penal que ainda não existe para nós

O Vigia relê o que já conhece. Ele é cego para uma coisa só: **lei penal nova e
autônoma**, publicada num diploma que ainda não está na lista. O Sentinela cobre
exatamente esse ponto cego.

### Os critérios, na ordem em que se aplicam

**1. Só lei ordinária e lei complementar.** A Seção 1 publica cerca de 330 atos
por dia, e mais de 90% são portaria e despacho. Pelo **princípio da reserva
legal** (art. 5º, XXXIX, da Constituição; art. 1º do Código Penal), só há duas
espécies capazes de criar tipo penal, e o Sentinela olha apenas essas duas.

:::note[Por que medida provisória não entra]
Não é economia de requisição: é direito. A Constituição veda medida provisória
sobre direito penal (art. 62, §1º, I, "b"), e MP não gera tipo — vigiá-la seria
vigiar o que não pode existir. Pela mesma razão saem a **lei delegada** (a
delegação não alcança direitos individuais, art. 68, §1º, II), o **decreto-lei**
(espécie extinta em 1988: nenhum novo será publicado) e a **emenda
constitucional** (os arts. 5º, XLI a XLIII, são mandados de criminalização,
dirigidos ao legislador ordinário — não criam crime).
:::

**2. Texto integral, sempre.** Os poucos atos que sobram são baixados por
inteiro. Não há filtro por palavra-chave antes da leitura — havia, com treze
termos, e ele foi removido: poupava vinte segundos por quinzena e, em troca,
decidia sem ler o que merecia leitura. Uma lei cuja ementa dissesse "altera o
Decreto-Lei nº 2.848 para dispor sobre a conduta de X" não tinha nenhum dos treze
termos e nem chegava a ser aberta.

**3. O corte é o preceito secundário.** O que separa lei penal de lei que *fala*
de pena é a cominação: `Pena –`, `reclusão, de`, `detenção, de`, `prisão simples,
de`. Um ato que fale de pena sem cominar nenhuma não cria nem altera crime.

Mas há tipo penal que não escreve nada disso, e por isso o teste também reconhece
a **pena por remissão** — "nas mesmas penas", "a pena cominada à falsificação",
"metade da pena", "no dobro da pena cominada para o tempo de paz" — e a pena
cominada fora da fórmula, como o "será submetido às seguintes penas" do art. 28
da Lei de Drogas. São ao menos nove registros do próprio catálogo redigidos
assim.

**4. Rede de segurança pela ementa.** Quando a página do ato não abre, não há
texto onde procurar. Aí vale a ementa, e ela reconhece tanto a lei autônoma
("institui o crime de") quanto a **alteradora**, que é a forma dominante da
legislação penal brasileira e tem redação padronizada pela LC 95/98: "para
tipificar", "para agravar a pena", "para tornar hediondo", "acrescenta o art.".

### Três níveis, e o descartado não some

| Nível | Quando | O que significa |
|---|---|---|
| **novo** | Comina pena e não cita diploma que já vigiamos | O ponto cego real: tipo penal em página que ninguém acompanha |
| **monitorado** | Comina pena, ou revoga dispositivo, e cita diploma vigiado | O Vigia veria na rodada seguinte; o ganho aqui é a antecedência |
| **descartado** | O resto | Sai **nomeado**, em uma linha, com o motivo |

O descartado sair nomeado é deliberado: três segundos de leitura, e a decisão do
filtro fica auditável. Um corte que apaga o que cortou não pode ser conferido.

---

## Recenseador — a lei que ninguém leu

O Vigia é completo sobre o que conhece. O Sentinela cobre o que nasce. Fica ainda
uma terceira pergunta, e é a mais desconfortável: **e o que já existia e nunca foi
lido?**

O sistema sabe quantos alarmes falsos gera — o descartado do Sentinela sai nomeado
toda semana. Do inverso não sabia nada. Uma lei penal publicada que o filtro semanal
não pegasse não deixaria rastro em lugar nenhum, e esse é o erro que custa meses de
catálogo desatualizado justamente porque **não faz barulho**.

Uma vez por mês, o Recenseador **baixa todas as leis do ano, uma a uma**, e testa
cada uma contra o mesmo critério do Sentinela — o preceito secundário. As que cominam
pena e não estão entre os diplomas vigiados viram lista de leitura, curta, com a
ementa de cada uma ao lado.

Não há índice a consultar: o portal de legislação do Planalto está atrás de proteção
anti-bot, e nenhum quadro por ano responde. Mas a página de cada lei responde, e a
numeração das leis é sequencial e nacional — então a enumeração é feita por sondagem,
do primeiro ao último número do ano, com o corte de ano vindo do cabeçalho que a
própria lei declara. Custa alguns minutos, uma vez por mês.

:::note[Ele aponta, não conclui]
Cominar pena **não é** criar tipo penal novo: a lei pode estar apenas alterando um
diploma que já acompanhamos, ou repetindo preceito. O Recenseador diz que a lei
existe e que ninguém a leu — quem decide se ela entra é gente. E, se não conseguir
ler as leis, **não afirma nada**: reportar "nenhuma ficou de fora" sem ter lido a
fonte seria produzir exatamente o silêncio que ele existe para quebrar.
:::

---

## Auditor — os campos que a pena não alcança

A pena não é o único dado que decide a vida de alguém. Hediondez muda a fração de
progressão e veda o livramento; a espécie de ação penal decide se o processo
começa. O Auditor vigia o que o Vigia não vê.

**Hediondez.** Comparação contra uma tabela curada, mais um alarme quando o texto
do rol muda: o Auditor guarda uma **digital do art. 1º da Lei 8.072/90** e a
confere a cada rodada. Foi ela que, em agosto de 2026, avisou que a Lei
15.487/2026 tinha reescrito o inciso que trata do Estatuto da Criança e do
Adolescente — de duas hipóteses para catorze. O alarme não diz o que mudou: diz
que mudou, e manda reler antes de confiar em qualquer outro achado da semana.

**Ação penal.** A regra é a pública incondicionada (art. 100 do CP), e a exceção
está escrita no próprio diploma, em fórmulas reconhecíveis ("somente se procede
mediante representação").

**Causas de aumento e diminuição.** Lista o que a lei tem e o catálogo de
modificadores não. Não propõe modelagem: definir sobre quais tipos o aumento
incide não se lê do dispositivo isolado.

**Nome do tipo.** Duas perguntas, em direções opostas: o rótulo conversa com o
próprio dispositivo? E há outro artigo do mesmo diploma com quem ele converse
*mais*? A segunda é o ponto cego da conferência de penas, e já custou caro — o
art. 313 do Código Eleitoral publicou por meses a pena do art. 348, de onde o
nome tinha vindo. Quando dois artigos vizinhos cominam a mesma pena, a troca de
nome é invisível para o Vigia.

:::caution[Falso positivo é esperado aqui]
A heurística é de palavras em comum, e artigos de um mesmo capítulo descrevem
condutas parecidas. Ela serve para leitura, nunca para troca automática. O nome
doutrinário costuma não compartilhar vocabulário com a descrição legal —
"corrupção passiva desportiva" não tem palavra em comum com "solicitar ou aceitar
vantagem", e nem por isso está errado.
:::

### Achado e limite declarado não são a mesma coisa

O Auditor imprime, de propósito, aquilo que **não** garante: registro fora do seu
alcance, hediondez que depende do caso concreto, achado já julgado em rodada
anterior, pendência cuja ação prevista é "nenhuma". Isso aparece no relatório —
um limite que ninguém vê é indistinguível de um achado que nunca apareceu — mas
não conta como trabalho a fazer, e não abre issue.

A distinção é prática: uma issue que chega toda segunda-feira sem nada dentro
ensina a não abrir a issue. E é justamente ela o único lugar onde o achado real
apareceria.

---

## Arquivista — a prosa envelhece como o dado

Um documento que descreve o sistema errado é tão ruim quanto um registro errado,
e envelhece sem avisar. O Arquivista acusa um documento em dois casos: quando
vence o prazo, e quando **um arquivo de que ele fala muda depois da última vez
que alguém o leu**.

Editar conta como ler — a data efetiva é a mais recente entre a conferência
declarada e o último commit do próprio arquivo. Assim só há escrituração manual
quando alguém relê e **não** encontra o que corrigir.

Prazo é relógio; dependência é sinal. A convenção que manda a pena vir de
`pena_min`/`pena_max` ficou meses documentada ao contrário do que o transformador
fazia, e o prazo do documento nem havia corrido.

---

## Onde cada um mora no código

Cada robô é um sistema próprio, em diretório próprio com o nome dele. O que fica no
**núcleo** é o que dois ou mais precisam aplicar de forma **idêntica** — e essa é a
única razão para algo morar lá.

```
scripts/robos/
  nucleo/        tempo · baixar · parsear · dispositivo · preceito · vigencia · revogacao
  vigia/         conferir · cobertura-limites · excecoes
  sentinela/     dou_watcher
  recenseador/   leis_do_ano
  auditor/       auditar · excecoes-auditoria
  arquivista/    verificar_documentacao
  proponente/    propor · corrigir · criar        (não é robô: é quem abre o PR)
```

Duas peças do núcleo merecem explicação, porque a tentação de duplicá-las é grande e
o custo de ceder já foi pago:

- **`dispositivo`** guarda a normalização que transforma "Art. 121, §2º, I" no
  identificador com que os robôs se entendem. O Vigia confere a moldura contra o
  dispositivo que o registro diz ser, e o Auditor pergunta se o nome conversa com esse
  mesmo dispositivo. Se cada um tiver a sua cópia, os dois divergem em silêncio — e o
  registro passa a existir para um e não para o outro. Foi assim que nasceram artigos
  inexistentes como `Art. 13-O`.
- **`preceito`** guarda o critério que separa lei que cria crime de lei que fala de
  pena. O Sentinela aplica-o ao Diário Oficial da semana; o Recenseador, a todas as
  leis do ano. Comparar os dois resultados só faz sentido se o critério for um só:
  com duas cópias, uma divergência não distinguiria "a lei mudou" de "os filtros
  discordam".

---

## O que nenhum deles alcança

Declarar o limite vale mais que fingir cobertura.

**Decisão do Supremo.** Uma ADI que declara inconstitucionalidade não é ato
normativo do Diário Oficial, Seção 1 — é publicada no Diário da Justiça. E altera
o catálogo com a mesma força de uma lei revogadora: a ADI 7555 tornou
inconstitucional o §3º do art. 232 do Código Penal Militar e deslocou o estupro
de vulnerável praticado por militar para o art. 217-A do Código Penal. Três
registros afetados, **nenhum ato no DOU**. O Sentinela jamais veria. É a lacuna
mais séria que resta, e vai exigir robô próprio — para o **STF**, o **STJ** e o
**STM**, que é quem julga os registros do Código Penal Militar — hoje o segundo maior
diploma do catálogo (ver [Completude](./completude.md)). Está no
[README](https://github.com/amorim-rc/atlaspen/blob/main/README.md#o-que-falta).

**O tipo penal antigo que nunca foi cadastrado, e o que morreu sem aviso.** O
Recenseador varre o ano corrente; a legislação penal brasileira tem quase dois
séculos. Existe tipo em lei esparsa antiga que o catálogo nunca viu, e existe tipo
que foi revogado sem que ninguém percebesse — e este segundo é pior, porque um crime
revogado que continua publicado afirma que a conduta é punível quando ela não é. O
**Curador** é o robô previsto para isso, e está no
[README](https://github.com/amorim-rc/atlaspen/blob/main/README.md#o-que-falta), junto com os
tribunais.

**Revogação tácita.** Lei posterior que regula inteiramente a matéria revoga a
anterior sem dizê-lo (LINDB, art. 2º, §1º), e não há sinal textual para isso. A
Lei 7.802/89 foi inteiramente revogada pela Lei 14.785/2023, e a página da lei
antiga não anuncia isso em lugar nenhum. Depois da LC 107/2001, que exige cláusula
de revogação expressa, o caso virou defeito de técnica legislativa em vez de
regra — mas continua invisível a um robô, e por isso é limite declarado, não
problema perseguido.

**Lei estadual e municipal.** Não existem em matéria penal: a competência é
privativa da União (art. 22, I, da Constituição). Por isso a Seção 1 basta.

**O juízo jurídico.** Nenhum dos cinco decide se um dispositivo é crime
autônomo, se a hediondez alcança um tipo militar por identidade, ou se um nome
está errado. Eles apontam. Quem decide assina.
