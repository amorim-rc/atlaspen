# Onde estamos e o que falta para a v1.0.0

Situação em 24/09/2026, na branch `revamp/atlaspen`, que está 85 commits à frente da `main`,
sem push. O prompt para retomar o trabalho em outra sessão está em `auditoria/retomada.md`. O backlog completo está em `backlog.md`; este documento é o recorte do que decide o
lançamento.

## Em uma frase

A revisão fina de 23/09/2026 foi aplicada por inteiro — as nove etapas do pacote, 416 mudanças
de dado, 18 tipos novos e 1.681 vereditos movidos. O que separa a v1 de hoje é: a segunda parte
da simulação, o merge do revamp, o domínio, e a auditoria por amostra — que só roda depois de
todo o resto. As decisões jurídicas que dependiam de você estão feitas; o que sobrou está
listado em `auditoria/material/08-o-que-sobrou.md`, e nada ali é bloqueio.

## O marco da virada

Decisão do mantenedor em 20/09/2026: **a v1.0.0 é o lançamento com endereço próprio** — o
domínio atlaspen.org.br no ar e o repositório inteiramente renomeado, com os robôs. Até lá,
tudo o que for possível entra antes, para que a primeira versão pública já saia madura: a v1
não é o começo da revisão, é o resultado dela.

## O que a v1.0.0 promete

Decisão da equipe em 10/09/2026: lançar enxuto.

| Promessa | Situação |
|---|---|
| **Todos os tipos penais** | 1.512 tipos em 63 diplomas vigentes. A conferência de 19/09/2026 contra os 68 compilados baixados no dia achou 0 divergências de moldura, e o Vigia não acusa nenhum artigo ausente. Ver "Cobertura", abaixo. |
| **Os 22 atributos penais em dados** | Feito (frente 5). 77 parâmetros ligados a 227 eventos do histórico legislativo. |
| **Só normas vigentes** | Feito. Três registros com `vigencia_ate`, que ficam no catálogo para fatos anteriores. |

## Os números de hoje

| | |
|---|---|
| Tipos penais | **1.529** (1.496 com pena privativa), depois dos 18 novos e de uma duplicata aposentada |
| Conferência da moldura | 1.244 conferidos, 265 com moldura derivada de conta, 3 dispensados, 0 divergentes |
| Hediondez | **124 por natureza**, 17 equiparados, **34 condicionais** — cada um com o dispositivo que o sustenta |
| Ação penal | **1.390 conferem**, 13 conferem com ressalva, **0 divergem**, 126 pedem juízo |
| Violência e grave ameaça | **2.878 conferem**, 88 conferem com ressalva, 33 divergem, 59 pedem juízo |
| Condições declaradas | 88 de violência (campo novo), 70 de ação penal, 34 de hediondez |
| Avisos sobre a norma | 424 registros: ADIs contra a Lei 15.402, ANPP no crime militar, Tema 506 |
| Motor | 22 atributos; 47 casos-padrão; congelamento de 22 × 1.496 × 4 cenários; **data do fato** como entrada |
| Testes | **347** dos robôs, mais as seis baterias de `npm run verificar` |
| Versão | **0.0.3**, com 14 notas no feed |

## Cobertura: o que "todos os tipos" ainda não garante

- ~~**Código Penal Militar marcado "em coleta"**~~ e ~~**dois "não iniciado" falsos**~~ —
  corrigidos em 20/09/2026. O comparador de tipos acha 351 preceitos no CPM e nenhum sem
  registro; a Lei 4.595/64 não tem crime vigente, e o crime da Lei de Migração é contado no
  CP. Hoje: **61 de 61 diplomas com coleta**, denominador de 1.172 preceitos.
- **O que nenhum robô alcança**, e está declarado como limite: decisão de tribunal que retira
  tipo do ordenamento (ADI) e tipo antigo nunca cadastrado. São o Robô dos tribunais e o
  Curador, ambos da fase 2.

## As frentes da fase 1

| Frente | Estado | O que falta | Depende de |
|---|---|---|---|
| 1. Repositório para trabalho em grupo | parcial; **em espera** desde 20/09/2026, sem prazo | transferir para uma organização; credencial do Codex; convenção de branch e commit para três pessoas e dois agentes; conferir o ruleset de tags `v*` | você |
| 2. Versionamento | concluída | — | — |
| 3. Nome e identidade | **renomeação completa em 23/09/2026**: repositório `amorim-rc/atlaspen`, base `/atlaspen/`, robôs `atlaspen-automacao` e `atlaspen-bot`, e as 34 URLs literais das notas derivadas de `SITE_URL`. O SISPENAS (2008) segue creditado como antecedente | comprar atlaspen.org.br e trocar `SITE_URL`, `base` e `CNAME` — agora uma constante, não uma varredura | você |
| 4. Histórico: a última alteração de cada registro | **concluída**. Em 20/09 todo tipo passou a dizer a lei que por último lhe deu texto; em 23/09 vieram as datas: 220 eventos de 15 normas com publicação e vigência conferidas no DOU (decisão 32), mais os 12 eventos que nenhum compilado traz | a LC 225/2026 tem vigência escalonada e segue a conferir | você |
| 5. Atributos em dados | concluída | — | — |
| 6. Ação penal | **concluída**. Vocabulário fechado, derivador com a C1 corrigida, `acao_fundamento` em todos os registros (decisão 18), 70 condições declaradas e **zero divergências** | os 126 que pedem juízo por ressalva do próprio diploma — não são erro, são hipótese do caso | você, quando quiser |
| 7. Amostra de validação | protocolo registrado (`auditoria/protocolo.md`) | o sorteio, só na versão amadurecida; uma segunda pessoa para a dupla conferência | tudo o resto, e uma pessoa |
| 8. Pena cominada × pena concreta | **concluída** (20/09/2026): três abas na ficha — cominada, concreta e histórico | — | — |
| 17. Hediondo × equiparado | **concluída**. Varredura do Livro II do CPM contra o rol (decisão 29), 34 condições em formato único (decisão 28), e a âncora de fim em toda regra, com trava no carregamento (C15) | — | — |

## O revamp, antes do merge

- ~~**A2, segunda parte**~~ — **entregue em 24/09/2026**. A simulação aceita atributo novo
  com faixa (dois limiares), edita nome, diploma, dispositivo e elemento do tipo modificado,
  classifica o sentido da mudança que só altera valor — os 82 parâmetros declaram se
  aumentar favorece o réu — e tem dezesseis verificações novas, mais a conferência no
  navegador. O que sobra está declarado como limite no `backlog.md`, não como pendência.
- **Revisão dos textos do site** — leitura sua.
- **História do projeto** (`textos/historia.md`) — em edição por você, fora dos commits.
- **O merge** — 57 commits, com a bateria verde.

## Qualidade dos dados, antes de declarar a versão madura

1. ~~**Revisão fina**~~ — **aplicada em 23-24/09/2026**, nas nove etapas do pacote. O que
   sobrou está em `auditoria/material/08-o-que-sobrou.md`: 33 divergências de violência (quatro
   delas o art. 217-A, que a decisão 4 mandou manter), 59 juízos de violência e 126 de ação
   penal. Nenhum é bloqueio para a v1.
2. ~~**Critério escrito para tentativa e elemento subjetivo**~~ — **escrito** (decisões 20 e
   31), com o valor novo "Qualificado pelo resultado" e trava no `transform_data`.
3. ~~**Confirmar três leituras**~~ — **confirmadas**: a progressão do reincidente genérico, a
   ANPP no crime militar (com aviso de divergência) e os atributos em tipo sem pena privativa,
   que passaram de quatro a sete.
4. **Falta a decisão 19** (crimes de atentado, tentativa "Não" em 15 registros), que ficou fora
   por falta de doutrina nomeada com obra, edição e página. E os itens do capítulo 10 do pacote,
   que dependem de conferência em portal de tribunal.

## Autoria e citação

**Feito em 20/09/2026:** Luccas de Amorim como autor e titular, com os contribuidores, no
`CITATION.cff`, na `LICENSE`, no README, no rodapé do site, em "Como citar" e na página nova
`/projeto/creditos`. O SISPENAS (2008) fica como antecedente de pesquisa, com a referência
completa, e a professora Maíra Rocha Machado aparece como colaboradora acadêmica desde junho
de 2026.

**Depois das melhorias técnicas, antes da v1:** os registros formais — o programa no INPI, o
ORCID, o DOI no Zenodo (na própria v1) e o termo de colaboração com as professoras —, e a
reescrita da história do projeto (`textos/historia.md`), que já tem a seção "O AtlasPen" no
lugar de "A retomada" e ainda assina "Equipe AtlasPen". Decisão do mantenedor em 20/09/2026.

**A data da planilha ainda não está provada.** Os detalhes enviados em 20/09/2026 são da
**pasta** "Obra" do Google Drive, criada em 03/09/2026 — depois do primeiro commit. A prova é o
"Criado em" e o histórico de versões do próprio arquivo `algo-pen.xlsx`.

## Caminho crítico sugerido

| # | Passo | Quem | Pode correr em paralelo com |
|---|---|---|---|
| 1 | ~~Decisões da revisão fina~~ — feitas em 23/09/2026 | — | — |
| 2 | ~~Cada decisão vira regra escrita, e o dado é corrigido~~ — feito em 23-24/09 | — | — |
| 3 | ~~Frente 4 (histórico) e frente 8 (conferir)~~ — feitas | — | — |
| 4 | ~~A segunda parte da simulação (A2)~~ — feita em 24/09/2026 | — | — |
| 5 | ~~Autoria e citação~~ — feita em 20/09/2026 | — | — |
| 6 | Merge do revamp na `main` | você autoriza | — |
| 7 | Nome, domínio e organização do repositório (frentes 1 e 3), num PR de endereço | você e a equipe | — |
| 8 | Sorteio e conferência da auditoria (frente 7), e as correções que ela trouxer | você, uma segunda pessoa e eu | — |
| 9 | v1.0.0: versão, Release, DOI | — | — |

O passo 8 fica por último de propósito: a auditoria mede a base amadurecida, e medi-la antes
contaria erros que já estão sendo corrigidos (decisão de 19/09/2026).
