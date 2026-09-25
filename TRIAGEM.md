# A segunda-feira do AtlasPen

Documento interno de operação — não é publicado no site. Responde a uma pergunta:
**o que chega para mim toda semana, e o que cada coisa exige.**

Na **sexta-feira, 23:00**, um ensaio (`fontes.yml`) baixa os ~70 compilados
exatamente como a segunda os baixará, e joga fora. Não é para deixar texto
pronto — a segunda baixa o dela e sempre opera com o do dia. É para descobrir
na sexta, e não na segunda de manhã, que uma fonte saiu do ar ou mudou de forma
e perdeu a sentinela: quando isso acontece, o `vigia` cai e leva os outros três
com ele. Falhou, abre issue com rótulo `fontes`; voltou, ela se fecha sozinha.

A rodada automática acontece **toda segunda-feira, 05:00 de Brasília**
(`.github/workflows/conferidor.yml`), e também sob demanda em Actions ▸ *Conferidor
semanal* ▸ **Run workflow**. Ela produz, no máximo, **três coisas**: um commit, uma issue
e um pull request.

São **seis robôs**, e desde 10/08/2026 cada um é um job com nome próprio — o log diz
qual falhou sem que você precise abrir o passo. Quatro conferem, e desses três correm
em paralelo: só o auditor espera, porque lê as páginas que o vigia baixou. Os dois
últimos entregam — a triagem abre a issue, o proponente abre o PR.

| Job | O que vigia | Falha dele derruba a rodada? |
|---|---|---|
| **vigia** | A moldura de cada tipo contra o texto compilado do Planalto | Sim — é o único de que os outros dependem |
| **sentinela** | O DOU da semana, atrás de lei penal nova e autônoma | Não: o in.gov.br fora do ar não pode calar o relatório do catálogo |
| **recenseador** | Uma vez por mês, todas as leis sancionadas no ano — a defesa contra o falso negativo | Não: roda dentro do job da sentinela |
| **auditor** | Hediondez, ação penal, causas de aumento e nome do tipo | Não |
| **arquivista** | Saúde da prosa: documento vencido ou cuja dependência mudou | Não |
| **triagem** | Junta os relatórios e abre a issue | — |
| **proponente** | Transforma em PR o que é leitura direta, e escreve a nota quando a lei é recente | Não: só roda se houver o que propor |

Na **primeira semana de cada mês**, a sentinela roda também a conferência contra a
lista de leis sancionadas do ano. É a defesa contra o falso negativo: ela não diz se
a lei é penal, diz que existe e que o filtro não a examinou. Leitura curta — basta a
ementa —, e o que criar, agravar ou revogar tipo penal vira entrada em
`data/fontes.json`.

A issue **só nasce se pelo menos um dos quatro tiver o que dizer**. Silêncio dos quatro
significa catálogo em dia, e nesse caso a rodada deixa apenas o commit do carimbo.

## 1. Um commit que chega sozinho — nada a fazer

`chore(catalogo): carimbo da conferência semanal`

É a trilha de auditoria: `data/conferencia.json` mais o derivado, registrando **quando
cada tipo penal foi confrontado com a lei** e com que resultado. Vai direto para a `main`
porque não muda dado nenhum — só anota o que a máquina fez. Se este commit **não** aparecer
numa semana, a rodada falhou: vale abrir o log em Actions.

## 2. Uma issue — leitura, não ação imediata

Título: `Conferidor: achados de AAAA-MM-DD`, rótulo `conferidor`.

Ela só nasce quando há o que dizer, **é uma só** e **substitui a da semana
passada** — mas só a que ninguém comentou. O conferidor é SEM ESTADO: re-deriva
tudo a cada rodada, então achado que continua valendo reaparece sozinho na
issue nova. O que não reaparece é o que uma pessoa escreveu. Issue com
comentário deixou de ser foto da semana e virou conversa: ela fica aberta,
ganha um ponteiro para a rodada nova, e só se fecha quando a discussão tiver
destino — um commit, uma exceção julgada, ou uma issue própria. Achado de conferidor é foto de um
momento: a issue de 21/09/2026 acusou como ausente um artigo do Código
Eleitoral que já existia numa branch não mergeada, e continuou aberta dias
depois de ter deixado de valer. O que sobreviver de verdade a uma rodada vira
issue própria, com título que diga o quê — não fica esperando dentro da foto.

A primeira linha diz **contra o quê a rodada correu**: branch, commit e o
tamanho do catálogo. Sem isso não há como distinguir "o catálogo não tem" de
"a `main` ainda não recebeu".

O corpo traz o **resumo**; o relatório completo, com id por id, vai no artifact
da execução. Os dois saem do mesmo apuro — `conferir.py` escreve
`AAAA-MM-DD.md` e `AAAA-MM-DD-resumo.md`.

Os blocos, na ordem em que aparecem — o que pede ação primeiro:

| Bloco | O que é | O que costuma exigir |
|---|---|---|
| **Achados de pena** | Moldura ou espécie de pena divergindo do compilado; dispositivo revogado; dispositivo com pena própria ausente do catálogo | Ler o artigo no Planalto. O que for mecânico já veio em PR (item 3); o resto é decisão de modelagem |
| **A lei escreveu a pena e o parser não leu** | Os `ilegivel`: registros em que há moldura no compilado e o `pena_parser` não a extraiu | Ação NOSSA, e o único balde do "sem moldura" que pede alguma. Abrir o dispositivo e ver o que o parser não leu; o número tende a zero. Tem seção própria, no alto, desde 24/09/2026 — antes dividia a tela com 152 registros que estavam certos |
| **Cobertura** | Quantos registros foram conferidos e, por motivo, quantos não têm moldura própria na lei | Nada, em regra: são limites DECLARADOS, a lei não deixou moldura ali. No corpo da issue vêm como contagem; id por id fica no artifact. Se "não localizado" subir, é sinal de rótulo errado no catálogo ou de mudança na página |
| **Auditoria de classificação** | Hediondez, ação penal, causas de aumento ausentes e nomes — inclusive o nome que descreve MELHOR outro artigo do mesmo diploma | Juízo jurídico. Hediondez e ação penal já vêm propostas em PR; aumentos e nomes ficam só aqui. `NOME-DE-OUTRO-ARTIGO` pede reconferência da PENA junto com o nome: quando os dois artigos cominam a mesma moldura, a troca é invisível para a conferência |
| **Já julgado** | Uma linha dizendo quantos achados foram omitidos por decisão anterior | Nada. Se o número subir sem motivo, abrir `scripts/robos/auditor/excecoes-auditoria.json` e conferir se alguma exceção está ampla demais |
| **Saúde da documentação** | Documento que passou da cadência (90 dias) ou de que algum arquivo dependente mudou depois da última conferência | Reler. Se nada mudar, atualizar `conferido_em` em `data/documentacao.json`; se corrigir, o commit já responde |
| **DOU da semana** | Atos normativos da Seção 1 triados em três níveis pelo PRECEITO SECUNDÁRIO — quem fala de pena sem cominar nenhuma não cria crime | Ler só os dois primeiros níveis. **Possível tipo penal em diploma não monitorado** é o ponto cego do conferidor, e o PR da semana já traz a entrada de `data/fontes.json` para conferir. **Mexe em diploma que já vigiamos** é antecedência: o conferidor veria na rodada seguinte, mas a `sentinela` daquela fonte talvez precise mudar. Os **descartados** ficam nomeados no fim, uma linha cada, para o corte ser auditável |

**Fechar a issue significa "triado"** — não "resolvido". O que virar tarefa vira commit ou
PR próprio.

## 3. Um pull request — é aqui que você decide

Um por rodada, um aberto por vez, autor `atlaspen-automacao[bot]`, rótulo `conferidor`.
Quando alguma mudança vem de **lei recente**, ele escreve a nota de atualização e sobe o
patch da versão (em `0.0.x` até o lançamento; o merge não publica release antes da v1.0.0).
**Confira o alcance** de cada nota (`tipo` ou `atributo`) e a direção que o título afirma — pena agravada ou abrandada — na seção
"Notas de atualização" do corpo. Correção de dado não vira nota, e o corpo diz o motivo.

Dois tipos, nesta ordem de prioridade:

**a) PR de pena** — `fix(catalogo): N correção(ões) em <diploma>`

Moldura ou espécie de pena de registro que já existe, divergindo do texto compilado. Um
diploma por PR. Cada mudança traz o trecho da lei ao lado. **É leitura de texto, não
juízo**: a revisão aqui é conferir se o trecho citado sustenta o número.

**b) PR de classificação** — `fix(catalogo): N ajuste(s) de hediondez e ação penal`

Só sai quando não há PR de pena pendente. **Este exige juízo jurídico**, e por isso vem
como proposta com o fundamento ao lado:

- **hediondez** — comparação com o rol do art. 1º da Lei 8.072/1990, transcrito em
  `data/hediondos.json`. Onde a lei condiciona a hediondez a circunstância do caso
  (grupo de extermínio, vítima criança, organização direcionada a crime hediondo), **nada
  é proposto** — a lei não decide pelo tipo;
- **ação penal** — fórmulas do próprio artigo ("somente se procede mediante
  representação"). Regra de ação penal que more em artigo de encerramento de capítulo ou
  em outro diploma não é alcançada;
- **fontes novas** — quando o DOU trouxe lei que parece criar tipo penal, a entrada
  proposta para `data/fontes.json` vem junto, para você corrigir em vez de escrever.

## O que a máquina NUNCA faz sozinha

- criar registro de tipo penal (a leva automática da v1.3.0 trouxe 29 que não eram crime);
- remover registro (decidir o destino do `id`, que é URL pública);
- transformar dispositivo em modificador, ou o contrário;
- mergear qualquer PR.

## O que fica esperando decisão sua, hoje

Registrado aqui para não se perder entre uma semana e outra. Ao resolver, tire da lista.

| Pendência | Onde | Por que depende de você |
|---|---|---|
| Hediondez dos crimes do **CPM** | `data/hediondos.json`, campo `fora_de_alcance` | O inciso VI do § único da Lei 8.072 declara hediondos os crimes militares "que apresentem identidade" com os do rol. Identidade é juízo de correspondência entre tipos; a tabela não resolve, e o catálogo hoje marca 7 tipos militares como hediondos |
| **Domínio social estruturado** (Lei 15.358/2026) | `data/hediondos.json`, campo `pendentes` | O inciso VIII remete ao "marco legal do combate ao crime organizado". Falta identificar o diploma, ver se o catálogo o registra e acrescentá-lo a `data/fontes.json` |
| **109 causas de aumento** presentes na lei e ausentes de `modificadores.json` | `auditar.py`, em `crawler/relatorios/` | Modelar exige decidir o escopo — sobre quais tipos o aumento incide —, e isso não se lê do dispositivo isolado |
| **13 nomes suspeitos** | `auditar.py`, em `crawler/relatorios/` | A heurística compara palavras; a decisão de renomear é de conteúdo. Pelo menos seis parecem erro real (o art. 338 do CP está com o nome da sonegação previdenciária, que é o art. 337-A) |
| Auditoria de **`tentativa`** | ainda não existe | Não há fonte textual que a declare: é qualificação doutrinária do tipo, derivada do `elemento`. Precisaria de tabela curada, como a da hediondez. `violencia`, `grave_ameaca` e `acao` deixaram de estar nesta linha em 23/09/2026, quando ganharam derivadores próprios (`conferir_violencia.py` e `conferir_acao_penal.py`), que leem o texto do dispositivo e separam o que confere, o que diverge e o que pede juízo |

## Quando algo falha

| Sintoma | Provável causa | O que fazer |
|---|---|---|
| A rodada falha em "Baixar os textos compilados" | Sentinela ausente: a página veio truncada ou de cache velho | Reexecutar. Se persistir, abrir a URL da fonte no navegador e conferir se o texto mudou de forma |
| A issue vem com muitos "não localizado" | Rótulo do catálogo apontando para dispositivo que não existe, ou mudança na numeração da lei | Conferir os ids listados contra o compilado |
| `ROL-ALTERADO` na auditoria de hediondez | O art. 1º da Lei 8.072 mudou | Reler o artigo, ajustar `data/hediondos.json` e regravar `impressao_do_texto` com o valor que o relatório informa |
| Nenhum PR, mesmo com achados | Não havia correção mecânica, ou já existe PR aberto do robô | Normal. Ver a issue |
