# Como contribuir — AtlasPen

## Visão geral

- **Fonte canônica do catálogo:** `data/crimes.json` (uma entrada por tipo penal).
- **Catálogo consumido pelo site:** `static/data/crimes.json` — **gerado** por
  `scripts/transform_data.py`. Não edite à mão; ele é regenerado a cada mudança da fonte.
- **Campos derivados** (`pena_privativa`, `tem_multa`, `multa_regime`,
  `infracao_menor_potencial`, `pena_min_meses`, `pena_max_meses`, rótulos de exibição)
  são produzidos pelo transformador a partir de `data/crimes.json`.

## Glossário

Quatro termos têm sentido fixo no projeto (decisão de 10/09/2026):

- **Tipo penal** — a unidade do catálogo: o dispositivo que comina moldura de pena própria
  (ver C1).
- **Atributo penal** — o instituto que a lei liga ao tipo e à pena: transação, ANPP,
  substituição, progressão, prescrição… O site os chamava de "benefícios penais".
- **Parâmetro** — o patamar, a fração ou a vedação editável de um atributo: o teto de 2
  anos da transação, os 25% da progressão.
- **Campo** — o campo do registro de tipo penal: `hediondo`, `acao`,
  `perdao_judicial_previsto`.

"Benefício" continua só onde é a palavra da própria lei ou de súmula ("beneficiado", a
Súmula 715 do STF). Trocá-la aí seria adulterar a citação.

## Como o catálogo é atualizado

A carga inicial veio de uma planilha; a manutenção, hoje, é o **conferidor** — um pipeline
determinístico, sem IA, descrito em [`scripts/robos/README.md`](scripts/robos/README.md).

1. **Toda segunda-feira, 05:00 de Brasília**, o workflow `conferidor.yml` baixa o texto
   compilado dos diplomas de `data/fontes.json`, compara pena a pena com o catálogo e olha
   os atos normativos da Seção 1 do Diário Oficial da semana.
2. **O que diverge vira issue.** Cada achado é uma pergunta, não uma conclusão.
3. **O que é leitura direta vira PR**, aberto pelo próprio robô (`sispenas-automacao[bot]`):
   moldura ou espécie de pena de um registro que já existe divergindo do que a lei comina.
   Um diploma por rodada, um PR aberto por vez, evidência ao lado de cada mudança.
4. **O que exige juízo continua humano:** criar registro, remover registro, decidir se um
   dispositivo é tipo autônomo, causa de aumento ou nada disso. O merge do PR também.

> Em resumo: **a máquina confere e propõe; gente decide e aprova.** Nada entra no catálogo
> sem conferência contra o texto compilado do Planalto.

## Passos de uma atualização (PR)

1. Edite **apenas** `data/crimes.json` (a fonte) — direto na interface do GitHub ou local.
2. Regenere o derivado (duas opções):
   - **Automático (GitHub):** ao abrir/pushar a mudança em `data/crimes.json` na branch
     `main`, o workflow `Regenerar dados derivados` roda o transformador e **commita**
     `static/data/crimes.json` de volta. Não precisa rodar Python localmente.
   - **Local:** `python3 scripts/transform_data.py` e commit do `static/data/crimes.json`.
3. Abra um Pull Request. O CI valida, nesta ordem:
   - `transform_data.py --estrito` — convenções C1, C2, C3 e o teto de contradições (C4);
   - se o derivado commitado corresponde à fonte;
   - `npm run typecheck`;
   - `npm run verificar` — invariantes do motor de atributos e casos-âncora de direito
     penal contra o catálogo real;
   - `npm run build`.

### Correções finas (multa e afins)

Ajustes que a heurística não acerta devem ir em `CORRECOES`, dentro de
`scripts/transform_data.py` (chaveado por `id`), e **não** no JSON gerado.
Exemplo presente: Art. 227 do CP (a multa só incide na hipótese do §3º).

## Versão e notas

> **Até a v1.0.0 nada é publicado** (decisão de 10/09/2026, executada em 11/09/2026). O
> projeto está na versão `0.0.0`: não se sobe versão nem se criam entradas de changelog, e
> a CI reprova entrada criada nesse período. A página Notas de atualizações só avisa que
> será alimentada depois do lançamento.

Depois da v1.0.0, cada versão publica **duas coisas a partir dos mesmos arquivos**: a
Release no GitHub e a nota no site, em `/release-notes`. As notas registram
**exclusivamente** alterações que criem, modifiquem ou extingam tipos penais ou atributos
penais.

1. **Cada alteração dessas vira uma entrada** em
   `src/data/changelog/entries/<ano>/<id>.ts`, um arquivo por mudança, texto puro, com
   `tipo`, `areas` e `version`. O passo a passo está em
   [`src/data/changelog/create-changelog-entry.md`](src/data/changelog/create-changelog-entry.md).
2. **A versão segue a [regra de versionamento](docs/dados-abertos.md#estabilidade-e-versionamento):**
   correção sobe o último número; funcionalidade nova compatível, o do meio; quebra de
   contrato, o primeiro.
3. **O PR que fecha a versão sobe `version` em `package.json` e `CITATION.cff`.** Ao mergear
   na `main`, o `release.yml` monta o corpo com as entradas da versão, **cria a tag `vX.Y.Z`
   e publica a Release**. **Não faça `git push` de tag manual.**

## Convenções do catálogo

**Estas regras valem para qualquer origem de atualização — IA, scraper do DOU ou
correção humana.** Várias são impostas por `scripts/transform_data.py`, que **falha o
build** quando violadas; as demais dependem de disciplina de quem escreve.

### C1. O catálogo contém APENAS tipos penais ⛔ imposta

Um registro = um tipo penal. **Não** entram no catálogo:

- notas de referência ("a LGPD não tipifica crimes específicos");
- agravantes e atenuantes (art. 61 a 66, CP);
- causas de aumento e diminuição (art. 141, CP; art. 258, CP);
- excludentes de ilicitude (art. 128, I e II, CP);
- causas de extinção da punibilidade em si (art. 121, §5º — o perdão judicial é
  campo do tipo (`perdao_judicial_previsto`), não um tipo);
- regras de ação penal (art. 171, §5º, CP — isso é o campo `acao`);
- **regras de punibilidade** ("é punível a calúnia contra os mortos", art. 138, §2º;
  "a receptação é punível ainda que desconhecido o autor do crime de que proveio a
  coisa", art. 180, §4º) — não cominam pena;
- **extinção ou redução da punibilidade pela reparação do dano** (art. 312, §3º) — a
  primeira metade é causa extintiva; só a segunda produz moldura, e é ela que vira
  registro;
- **efeitos da condenação** — perda do cargo, inabilitação (art. 92 do CP; DL 201/67,
  art. 1º, §2º). Não é pena, é consequência;
- **regras de presunção** (art. 236 do CPM) — definem elementar, não cominam nada;
- **regras de conversão ou de execução da pena** (art. 9º, parágrafo único, da LCP:
  conversão da multa em prisão simples). Parece moldura e não é — opera na execução,
  não na cominação;
- **definições legais e normas interpretativas** (arts. 22 a 27 do CPM: quem é militar,
  o que é navio);
- **regras de cúmulo** ("aplica-se, além da pena da violência, a do crime contra a
  pessoa" — CPM, arts. 157, §3º e 158, §2º). É concurso material, e quem o modela é a
  tela de concurso, não um registro;
- **cabeça de artigo ou de parágrafo que não comina pena** (art. 400 do CPM; art. 408,
  parágrafo único) — a moldura é do inciso ou da alínea, e o registro é do inciso.

21 registros assim foram removidos na v1.1.0: com pena zero, satisfaziam qualquer teto e
eram contados como "cabíveis" em transação penal, ANPP e sursis, inflando as estatísticas.

#### O teste que decide: comina moldura, ou deriva de uma?

O critério antigo perguntava se o dispositivo descrevia **conduta autônoma** — verbo
nuclear e objeto, prática isolada possível, concurso de crimes com os vizinhos. Ele
errava, porque testava autonomia de conduta quando o que o catálogo indexa é **moldura
de pena**: a lesão corporal seguida de morte não pode ser praticada isoladamente e não
gera concurso com a lesão — e, no entanto, tem moldura própria de 4 a 12 anos e
obviamente precisa de registro. A terceira pergunta ainda era circular: "gera concurso"
é consequência de serem dois tipos, não critério para saber se são.

São dois passos, nesta ordem:

1. **Moldura.** O dispositivo comina ou determina moldura própria — mínimo, máximo e
   espécie? Se sim, **é registro**. Isso cobre de uma vez o caput, a forma qualificada
   pelo resultado, a privilegiada, a culposa e o inciso com pena autônoma.
2. **Derivação.** Se não comina, mas remete a outra moldura ou opera fração sobre ela:
   é registro **derivado**, e vale a regra de **um registro por moldura-base**. Base
   única, um registro; se alcança caput e parágrafos, um por parágrafo alcançado.

Não cominando nem determinando moldura alguma, **não é registro** — é modificador, ou
cai numa das exclusões acima. O teste foi aplicado aos 96 registros criados na v2.0.0 e
não produziu caso ambíguo.

> Causas de aumento/diminuição abstratas são **entidade própria** da dosimetria por fases,
> em `data/modificadores.json` (3ª fase, art. 68 do CP) — não tipos penais.

### C2. Todo tipo declara uma sanção ⛔ imposta

Pena privativa em `pena_min`/`pena_max`, **ou** `sancoes_nao_privativas` quando o tipo não
comina prisão — como o art. 28 da Lei 11.343/06 (porte para consumo):

```json
"sancoes_nao_privativas": [
  {"inciso": "I", "sancao": "Advertência sobre os efeitos das drogas"},
  {"inciso": "II", "sancao": "Prestação de serviços à comunidade"},
  {"inciso": "III", "sancao": "Medida educativa de comparecimento a programa ou curso educativo"}
]
```

**Ou** `pena_por_remissao`, quando o tipo não comina moldura própria porque importa a de
outro dispositivo — o art. 304 do CP pune o uso com "a pena cominada à falsificação":

```json
"pena_por_remissao": {
  "dispositivo_fonte": "CP, arts. 297 a 302",
  "operador": "nenhum",
  "fracao": null
}
```

O `operador` é `nenhum`, `aumento` ou `diminuicao`; os dois últimos exigem `fracao`. Quem
declara remissão **não publica moldura própria**: seriam duas respostas para a mesma
pergunta, e o build reprova. A razão de o estado existir é que as duas saídas anteriores
erravam — publicar a moldura de um dos dispositivos-fonte afirma como certa uma pena que
depende do caso, e deixar em branco é indistinguível de campo não preenchido.

Sem nenhum dos três, o build falha — é sinal de que o registro não é tipo penal (C1) ou de
que falta dado.

### C3. `id` é append-only ⛔ imposta

O `id` é a **URL pública** de cada tipo (`/pesquisa/tipos?tipo=N`) e o site está publicado.

- Id novo = `max(id em uso, id aposentado) + 1`. Nunca no meio, nunca renumerando.
- Id removido vira **buraco permanente** e entra em `data/ids-aposentados.json`; jamais é
  reatribuído a outro dispositivo — um link antigo passaria a apontar para o crime errado,
  falha silenciosa. Contar só o `max` em uso não basta: remover o topo da numeração faz o
  máximo cair, e o próximo id repetiria um endereço já usado. `--estrito` reprova isso.
- A numeração foi **reiniciada duas vezes**, as duas por decisão explícita do mantenedor:
  na v1.4.0 (1 a 1.412), com o projeto ainda em protótipo, e na v2.0.0 (1 a 1.505), ao
  fim da revisão que fechou a conferência da base. Reiniciar quebra todo link externo e
  obriga a versão a ser MAIOR; quem o fizer precisa remapear na mesma passada **tudo** o
  que é indexado por id — `data/conferencia.json`, as tabelas `CORRECOES_*` do
  `transform_data.py`, os `ids` de `scripts/robos/auditor/excecoes-auditoria.json` e os links
  `?tipo=N` das notas já publicadas. Não é decisão de quem edita o catálogo.

### C4. Um registro por dispositivo

A chave é `lei + artigo`. Repetir o mesmo dispositivo cria uma **duplicata**; se as cópias
divergirem em pena ou hediondez, cria uma **contradição** — o catálogo passa a afirmar
duas penas para o mesmo artigo.

As 42 contradições herdadas foram **todas resolvidas** contra o texto compilado. A CI roda
`--max-contradicoes=0`: o catálogo não pode regredir.

Para distinguir incisos do mesmo parágrafo, use o inciso no `artigo`
(`Art. 121, §2º, I`), nunca dois registros com `Art. 121, §2º`.

### C5. O nome do tipo é dado, não rótulo

`crime` alimenta derivação automática. Em especial, **`resultado_morte` é derivado do
nome** (art. 112, VI e VIII, LEP → frações de 50% e 70%).

- Diga no nome quando o tipo for qualificado pela morte: *"Lesão corporal seguida de
  morte"*, *"Latrocínio"*, *"Extorsão com resultado morte"*.
- **Não** confie no `obs` para isso: ele descreve os demais parágrafos do artigo ("se
  resulta morte, triplica"), e por isso é ignorado nessa derivação — do contrário, o art.
  135 (omissão de socorro) seria marcado indevidamente.

### C6. `hediondo` inclui os equiparados

Tráfico, tortura e terrorismo entram como `hediondo: "Sim"` — é o que aciona as vedações
do art. 5º, XLIII, da CF (graça, indulto, anistia). Exceções consolidadas ficam como
`"Não"`: tráfico privilegiado (art. 33, §4º — STF, HC 118.533) e associação para o
tráfico (art. 35).

### C7. A faixa de pena vem de `pena_min`/`pena_max` ⛔ imposta

Os dois campos, **em meses**, são a autoridade: é deles que saem a moldura publicada e
todo o cálculo de atributos. O `obs` é descritivo — escreva nele a faixa na unidade
natural ("15 dias a 6 meses", "1-5 anos") para quem lê, mas **ele não define pena**.

Foi o contrário até a v1.2.16, e o preço apareceu: a moldura era extraída do texto do
`obs` por expressão regular, e uma frase secundária mudava a pena publicada — o art. 32,
§1º-A da Lei 9.605 exibia "3 meses a 1 ano" porque o `obs` mencionava a pena antiga.

Regras verificadas a cada build: `pena_min <= pena_max`, e inteiro escrito como inteiro
(`24`, não `24.0`).

**Tipo sem pena mínima.** Nem todo tipo comina os dois extremos. Vários só têm teto —
"detenção **até** 3 meses" (art. 32 da LCP; arts. 289, 290, 300, 301 e 309 do Código
Eleitoral). Nesses casos `pena_min` é `0` e o rótulo sai como "até 3 meses". **Zero na
mínima não é "sem pena"**: o tipo é punível, apenas não tem piso cominado — e, por isso,
os atributos que dependem da pena mínima (ANPP, suspensão condicional do processo)
são-lhe os mais favoráveis possíveis. Não preencha a mínima com um chute.

Não confunda com o **tipo sem pena privativa** (C2), que não tem prisão alguma.

### C8. Perdão judicial é lista curada, não inferência

Não existe perdão judicial genérico e ele não se estende por analogia (art. 107, IX, CP).
Um tipo novo que o admita exige entrada em `PERDAO_JUDICIAL`, no
`scripts/transform_data.py`, **com revisão humana** — nenhuma automação deve inferi-lo do
elemento culposo.

---

## Schema de `data/crimes.json`

| campo | tipo | observação |
|-------|------|------------|
| `id` | inteiro único | append-only; é a URL pública (C3) |
| `lei` | texto | diploma (ex.: "CP", "Lei 11.343/06") |
| `artigo` | texto | ex.: "Art. 155, caput"; com inciso quando houver (C4) |
| `crime` | texto | nome do tipo — **alimenta `resultado_morte`** (C5) |
| `pena_min` | inteiro | **em meses** (compat.; a unidade real é derivada de `obs`) |
| `pena_max` | inteiro | **em meses** (compat.; a unidade real é derivada de `obs`) |
| `sancoes_nao_privativas` | lista | só quando não há pena privativa (C2) |
| `pena_por_remissao` | objeto | opcional; `{dispositivo_fonte, operador, fracao}` quando a moldura é a de outro dispositivo (C2). Incompatível com `pena_min`/`pena_max` |
| `tipo_pena` | texto | Reclusão / Detenção / Prisão simples / Multa / Morte / Outras penas / — |
| `acao` | texto | ação penal |
| `hediondo` | Sim / Não / — | inclui equiparados (C6) |
| `elemento` | texto | Doloso / Culposo / Preterdoloso |
| `tentativa` | Sim / Não / — | pressuposto do art. 15 do CP |
| `violencia` | Sim / Não / — | |
| `grave_ameaca` | Sim / Não / — | |
| `vigencia_ate` | data | opcional (AAAA-MM-DD). Desde quando o dispositivo NÃO vigora mais |
| `vigencia_nota` | texto | **obrigatória** com `vigencia_ate`: o que houve e qual dispositivo passa a reger a conduta |
| `obs` | texto | descrição / notas. **A faixa de pena é lida daqui** (ex.: "15 dias a 6 meses", "1-5 anos") |

Campos derivados (não escreva à mão): `pena_privativa`, `tem_multa`, `multa_regime`,
`pena_*_meses`, `pena_*_rotulo`, `pena_faixa_rotulo`, `infracao_menor_potencial`,
`tem_pena_privativa`, `resultado_morte`, `perdao_judicial_previsto`, `vigente`,
`chave_dispositivo`, `duplicata*`. Ver [Catálogo de tipos penais](docs/catalogo-tipos-penais.md).

### Unidades de pena (dias / meses / anos)

O transformador extrai a faixa de pena do texto de `obs` e converte tudo para uma
unidade canônica em **meses** (`pena_min_meses`/`pena_max_meses`, contando o mês como
30 dias — Art. 11 do CP), preservando a unidade natural para exibição
(`pena_min_rotulo`/`pena_max_rotulo`/`pena_faixa_rotulo`). Assim "15 dias a 6 meses"
aparece corretamente e é calculado sem inverter mínimo/máximo.

> Regra de consistência: `pena_min_meses <= pena_max_meses`. Se a faixa não puder ser lida
> de `obs`, o transformador cai para `pena_min`/`pena_max` (em meses) como fallback.

## Desenvolvimento

```bash
npm install
npm run start       # dev server
npm run typecheck
npm run verificar   # motor de atributos × catálogo real
npm run build
python3 scripts/transform_data.py   # regenera static/data/crimes.json + qualidade.json
python3 scripts/transform_data.py --estrito --max-contradicoes=0   # como na CI
python3 scripts/validar_atributos.py   # base dos atributos e histórico legislativo
npm run atributos   # regenera static/data/atributos.json (depois do transform)
```
