# Proteção da `main`, em dois níveis

A proteção do repositório é **versionada aqui**, e não só clicada na interface web. O
arquivo é a fonte; o GitHub é o derivado. Mexeu pela web? Traga a mudança para cá, senão a
próxima execução do `aplicar.sh` a desfaz em silêncio.

São dois níveis, e **só o primeiro está ativo**.

| arquivo | estado | o que impõe |
|---|---|---|
| [`main-base.json`](main-base.json) | **ativo** | `deletion` e `non_fast_forward` na `main`, sem exceção para ninguém |
| [`main-colaboracao.json`](main-colaboracao.json) | `"enforcement": "disabled"` | o mesmo, mais PR com aprovação de code owner e CI verde |

## Por que o base é só isso

Hoje o projeto tem um mantenedor. Exigir aprovação de PR num repositório de uma pessoa só
não protege nada — **trava o trabalho**, porque o GitHub não deixa ninguém aprovar o
próprio PR. O que o nível base impede é o que dói de verdade e não tem desfazer:

- **`non_fast_forward`** — reescrever a história da `main`. Um `push --force` sobre uma
  base citável apaga o commit que fundamenta um dado publicado, e a trilha de auditoria
  perde o sentido.
- **`deletion`** — apagar a `main`.

Sem `bypass_actors`: a regra vale para o mantenedor também. É deliberado — a trava existe
justamente contra o acidente de quem tem a permissão. Para uma exceção pontual, ponha o
ruleset em `"evaluate"` ou `"disabled"` pela web, faça o que precisa e volte a `"active"`
rodando o `aplicar.sh`.

**O que o nível base NÃO precisa impedir:** push vindo de um fork. Um fork não escreve no
repositório de origem — não é permissão que se negue, é coisa que o GitHub não oferece.
Quem tem cópia do projeto, tenha ela o nome que tiver, só chega à `main` por **pull
request**, que o mantenedor lê e mergeia. Pela mesma razão, ruleset nenhum alcança branch
de fork: as regras daqui valem para as branches DESTE repositório.

O que um fork consegue, e por isso importa: rodar o `ci.yml`, que dispara em
`pull_request`. Isso é seguro porque `pull_request` roda o workflow **da base**, com token
somente-leitura e sem acesso a segredo. **Nunca troque esse gatilho por
`pull_request_target`** fazendo checkout do código do PR: essa combinação executa código de
terceiro com o token e os segredos do repositório de origem, e é o furo clássico das
Actions.

## Quando ligar o nível de colaboração

**Só quando entrar um colaborador com permissão de escrita.** Até lá ele fica aqui,
escrito e desligado, para que a decisão já esteja tomada quando a hora chegar — e para que
se possa discutir o texto dela sem pressa.

O que ele acrescenta:

- **`pull_request`** — nada entra na `main` sem PR, com **1 aprovação** e **revisão do code
  owner** ([`.github/CODEOWNERS`](../CODEOWNERS)). Aprovação obsoleta cai quando chega
  commit novo.
- **`required_status_checks`** — o job `Typecheck, verificação e build` do `ci.yml` tem de
  passar, e o PR tem de estar atualizado com a `main` (`strict`).
- **`bypass_actors`: administrador do repositório** — o mantenedor continua mergeando o
  próprio PR sem esperar aprovação de ninguém. Sem isso o repositório se tranca: o dono
  seria obrigado a pedir revisão a alguém que talvez ainda não conheça o código.

O `actor_id: 5` é o papel **admin** do repositório. Depois de aplicar, confira na tela
Settings ▸ Rules que o bypass aparece como "Repository admin" — o `aplicar.sh` imprime o
que o GitHub aceitou.

Convenção de nome de branch **não** virou regra de ruleset. Ela só alcançaria branches
deste repositório, nunca as de um fork, e uma regra que vale para metade dos casos ensina
menos que uma linha no [`CONTRIBUTING.md`](../../CONTRIBUTING.md), que é onde ela está.

## Aplicar

```bash
./.github/rulesets/aplicar.sh --listar                    # o que está no ar
./.github/rulesets/aplicar.sh --ensaio main-base.json     # mostra e não envia
./.github/rulesets/aplicar.sh main-base.json              # cria ou atualiza pelo nome
```

O script é repetível: casa pelo `name`, então rodar duas vezes atualiza em vez de duplicar.
Requer o `gh` autenticado com administração do repositório.

## O que ainda não está coberto

- **Tags.** O `release.yml` cria a tag `vX.Y.Z` a partir da v1.0.0. Um ruleset de `target:
  tag` com `deletion` e `update` impediria que uma versão publicada fosse reescrita. Vale
  escrever junto com o lançamento da v1.0.0, não antes — hoje não há tag a proteger.
- **Regra de ambiente.** O `environment: automacao` já é a trava server-side dos segredos
  do app de automação, e a política de branch dele restringe a entrega da chave à `main`.
  Isso vive em Settings ▸ Environments, não em ruleset.
