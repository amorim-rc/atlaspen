# O que o `decidendo-ghoul` faz, e o que ele nos ensina

Leitura de 23/09/2026 do bot deixado em `estudos/bot para estudo/jurisbot` (1.801 linhas,
20 arquivos). O bot **não entra no repositório**: é código de terceiro, trazido para estudo, e
está no `.gitignore` para não cair no squash desta branch.

## Em uma frase

Ele **não atende a nossa demanda** e não deveria: resolve o problema oposto ao nosso. Mas a
camada de rede dele é melhor que a nossa, e o mecanismo anti-alucinação dele é a versão
automatizada da disciplina que hoje aplicamos à mão.

## Por que não atende

| | `decidendo-ghoul` | robôs do AtlasPen |
|---|---|---|
| Pergunta | "quais julgados se parecem com este caso?" | "o catálogo diz o mesmo que o texto compilado?" |
| Resposta | um ranking, com nota de 0 a 1 | confere / diverge / pede juízo |
| Matéria-prima | ementas e acórdãos (texto argumentativo) | a lei compilada (texto normativo) |
| Postura | aproximação assumida: BM25, cosseno, nota 0/1/2 de uma LLM | recusa de plausibilidade; toda afirmação traz o dispositivo |
| Quem decide | o pesquisador, lendo o relatório | a regra escrita; o que ela não alcança vai para o mantenedor |

São epistemologias opostas, e cada uma está certa no seu lugar. Similaridade é uma medida
contínua e o bot a trata como tal — o próprio README fecha com "similaridade automática é
triagem; a leitura jurídica é sua". Nosso catálogo não tem grau: um tipo é hediondo ou não é.
Importar o motor de similaridade para cá seria trocar a nossa única vantagem real — a
asserção conferida — por um número com três casas decimais.

## Onde ele é, sim, útil para nós

Ele é um protótipo quase pronto do **Robô dos tribunais**, da fase 2 — o que hoje está
declarado como limite em `auditoria/situacao-v1.md` ("decisão de tribunal que retira tipo do
ordenamento"). E a revisão fina de 23/09 já cobra exatamente isso: o item 10 do pacote deixa
cinco itens **fora da release por falta de conferência em portal de tribunal** (Súmula 471 do
STJ, IRDR do STM, data do Tema 506, e os andamentos das ADIs). Hoje essa conferência é manual.

O que se aproveitaria, quando essa frente abrir:

- **`fontes/datajud.py`** — cliente da API pública do CNJ com paginação por `search_after`
  (sem o teto de 10.000 do `from`/`size`) e cache por página. Serve para acompanhar ADI e
  ADPF pelo número CNJ.
- **`fontes/stj.py`** e **`citacoes.py`** — leitura dos espelhos do STJ, incluindo o parser
  do campo `jurisprudenciaCitada`, que é um formato hostil e está resolvido.
- **O conhecimento negativo, registrado em código**: `pipeline.coletar()` avisa, em tempo de
  execução, que o STF bloqueia acesso automatizado (WAF) e que os precedentes do STF só saem
  por citação de terceiros. É a informação no lugar onde alguém tropeçaria nela, e não só num
  documento. Vale copiar o hábito.

## As três lições que valem agora

### 1. A verificação do trecho literal (`llm.py`)

O bot pede à LLM uma nota **e um trecho literal** que a justifique. Depois confere se o trecho
existe mesmo no texto — `in` direto, e `difflib.SequenceMatcher` com limiar de 0,85 para o
caso de a LLM ter normalizado a pontuação. Não existindo, a nota vira zero, guarda-se a nota
original em `nota_original`, e o relatório imprime `⚠ zerada (LLM deu 2, trecho não
encontrado)`.

Duas coisas são boas aí, e nenhuma depende de haver uma LLM:

- **A afirmação carrega a prova, e a prova é verificada por máquina.** É o que fazemos à mão:
  nada entra sem conferir contra o compilado do Planalto.
- **O que foi rejeitado aparece no relatório.** Não se apaga a nota errada; mostra-se que ela
  foi dada e por que caiu.

**Onde isso se aplica a nós, hoje.** `scripts/violencia.py` e `scripts/acao_penal.py` já
devolvem `{regra, fundamento}`. O que eles ainda não fazem é **conferir que o fundamento tem
lastro no snapshot** — que o dispositivo citado existe e que o trecho que a regra diz estar lá
está lá. É barato: o texto já está carregado no auditor. Um campo `fundamento_verificado`, com
a mesma regra ("sem lastro, a derivação não vale"), fecharia o círculo. Fica como proposta
para depois desta release, não dentro dela.

### 2. A rede: o `rede.py` dele é melhor que o nosso `baixar.py`

Comparação honesta, item a item:

| | `rede.py` (dele) | `baixar.py` (nosso) |
|---|---|---|
| Intervalo entre requisições | AIMD por host: dobra em 429/503/timeout, cai 10% a cada sucesso | fixo, 1,2 s |
| Backoff | *equal jitter*, respeitando `Retry-After` | `2 × tentativa`, sem jitter |
| O que vale retentar | 408, 425, 429, 500, 502, 503, 504; outros 4xx propagam direto | qualquer `URLError`/`OSError`, indistintamente |
| Download | streaming para `.part`, retomada por `Range`, confere `Content-Length` | `urlopen().read()` inteiro na memória |
| Gravação | `replace()` atômico: o cache **nunca** guarda arquivo pela metade | `write_text()` direto no caminho canônico |
| TLS | cadeia incompleta é erro **não transitório**: repara uma vez via AIA, sem retry | — |

O ponto que mais nos custa é o da gravação atômica, e ele se combina com um defeito nosso que
achei ao ler os dois lado a lado. Está na seção seguinte.

### 3. Invariante conferido no carregamento (`pipeline.carregar_config`)

O bot recusa subir se `ranking.pesos_pre` não somar 1, ou se os pesos da rubrica não somarem
1 — `ConfigInvalida`, com a soma achada na mensagem. A regra do arquivo de configuração é
conferida **uma vez, na entrada**, em vez de produzir resultado torto lá na frente.

Isso tem aplicação direta e imediata na decisão **C15** da revisão fina. O pacote manda
ancorar o fim de toda expressão de `artigo` em `data/hediondos.json` (`^Art\. 157, §2º, V$` em
vez de `^Art\. 157, §2º, V`), porque sem a âncora "V" casa "VI", "VII" e "VIII". Conferi:
**47 das 61 regras estão sem a âncora final**. Corrigir as 47 à mão resolve hoje e não impede
que a 62ª nasça torta.

O que resolve de vez é a lição do bot: `scripts/hediondez.py` recusar carregar uma regra cuja
expressão comece com `^` e não termine com `$`. A C15 deixa de ser 47 edições torcendo para
não ter esquecido nenhuma, e passa a ser uma trava. Isto **entra nesta release**, junto com a
própria C15.

## Um defeito nosso, achado na comparação

`scripts/robos/nucleo/baixar.py` valida a sentinela — a string que prova que a página é a
versão fresca e íntegra — e **grava o snapshot mesmo quando a sentinela falha**. O `ok` só vai
para o `meta.json` e para a mensagem na tela; o arquivo é escrito no caminho canônico
`crawler/snapshots/<id>/<AAAA-MM-DD>.html` de qualquer modo.

E nenhum consumidor lê o `meta.json`. Conferi: `vigia/conferir.py`, `auditor/conferir_violencia.py`,
`auditor/conferir_acao_penal.py` e `nucleo/dispositivo.py` varrem os `.html` por `glob` e
nunca olham o `sentinela_ok`.

O efeito é o que o próprio docstring do módulo diz querer evitar, uma camada acima: quem roda
`baixar.py --todas` recebe código de saída 2 e a linha com `✗`, mas **o snapshot ruim já está
no lugar do bom**. Se o conferidor for chamado em seguida — à mão, fora do workflow que olha o
código de saída —, ele confere o catálogo contra uma página truncada ou velha, e o resultado
tem a mesma aparência de um resultado bom.

Nunca nos mordeu porque o `conferidor.yml` encadeia os dois passos e para no código 2. É uma
proteção de processo, não de código, e ela não existe quando se roda à mão — que é como as
rodadas desta fase têm sido feitas.

**A correção, na forma do bot:** escrever em `.part` e só renomear para o nome definitivo
quando a sentinela passar. Snapshot no caminho canônico passa a significar, por construção,
"conferido". Cabe nesta release; é pequeno e tem teste fácil.

## O que nós temos e ele não

Para registro, porque a comparação não é de mão única:

- **`decodificar()`**, em `baixar.py`, resolve BOM de UTF-16, `meta charset` e o `windows-1252`
  não declarado do acervo antigo do Planalto, com a história do bug de corrupção silenciosa no
  próprio docstring. O bot decodifica com `"utf-8", "replace"` — correto para uma API JSON,
  desastroso para o Planalto.
- **A sentinela** não tem equivalente lá: `baixar_com_cache` confere tamanho, não conteúdo.
  Tamanho certo com texto velho passa.
- **Testes**: temos 276; o bot **não tem nenhum**. Não há um arquivo de teste no pacote. Num
  código cuja saída é um ranking que ninguém consegue conferir de cabeça, isso é o ponto fraco
  dele — e é exatamente o inverso do nosso arranjo, onde a tabela de casos-padrão existe para
  que o motor não possa mudar de opinião em silêncio.

## O que eu proponho fazer com isto

| | O quê | Quando |
|---|---|---|
| 1 | Âncora final obrigatória em `hediondos.json`, conferida no carregamento de `hediondez.py` | nesta release, com a C15 |
| 2 | `baixar.py` grava em `.part` e só promove o snapshot quando a sentinela passa | nesta release |
| 3 | `fundamento_verificado` nos derivadores de violência e de ação penal | depois da release |
| 4 | Guardar o `decidendo-ghoul` como referência do Robô dos tribunais (fase 2) | quando a frente abrir |

Nada disto muda dado do catálogo; os itens 1 e 2 são travas, e travas a gente aperta antes de
medir, não depois.
