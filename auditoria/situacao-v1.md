# Onde estamos e o que falta para a v1.0.0

Situação em 20/09/2026, na branch `revamp/atlaspen`, que está 57 commits à frente da `main`,
sem push. O backlog completo está em `backlog.md`; este documento é o recorte do que decide o
lançamento.

## Em uma frase

A base está conferida e o motor está testado. O que separa a v1 de hoje é: decisões jurídicas
de revisão fina que só você pode assinar, o merge do revamp, o nome e o domínio, e a auditoria
por amostra — que só roda depois de todo o resto.

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
| Tipos penais | 1.512 (1.479 com pena privativa) |
| Conferência da moldura | 1.244 conferidos, 265 com moldura derivada de conta, 3 dispensados, 0 divergentes |
| Hediondez | 114 por natureza, 17 equiparados, 24 condicionais — cada um com o dispositivo que o sustenta |
| Ação penal | 1.363 conferem com a regra do diploma, 0 divergem, 149 pedem juízo |
| Violência e grave ameaça | 2.792 respostas conferem com o texto da lei, 149 divergem, 83 pedem juízo |
| Motor | 22 atributos; 47 casos-padrão; congelamento de 22 × 1.479 × 4 cenários |
| Testes | 276 dos robôs, mais as seis baterias de `npm run verificar` |
| Versão | 0.0.2, com 11 notas no feed |

## Cobertura: o que "todos os tipos" ainda não garante

- **Código Penal Militar marcado "em coleta".** O inventário mede 351 de 351 preceitos, e a
  marca vem de uma lista fixa em `scripts/gerar_completude.py`. Falta decidir se ela ainda
  procede ou se o CPM pode passar a "concluído".
- **Dois "não iniciado" falsos na página de completude.** A Lei 4.595/64 não tem crime vigente
  (o do art. 38, §7º, foi revogado pela LC 105/2001), e o crime da Lei de Migração está no CP,
  art. 232-A, onde já está catalogado. Correção de inventário, pequena.
- **O que nenhum robô alcança**, e está declarado como limite: decisão de tribunal que retira
  tipo do ordenamento (ADI) e tipo antigo nunca cadastrado. São o Robô dos tribunais e o
  Curador, ambos da fase 2.

## As frentes da fase 1

| Frente | Estado | O que falta | Depende de |
|---|---|---|---|
| 1. Repositório para trabalho em grupo | parcial | transferir para uma organização; credencial do Codex; convenção de branch e commit para três pessoas e dois agentes; conferir o ruleset de tags `v*` | você |
| 2. Versionamento | concluída | — | — |
| 3. Nome e identidade | nome provisório AtlasPen no que o leitor vê | validação da equipe; compra de atlaspen.org.br; depois, um PR só com URL, repositório e robôs | você e a equipe |
| 4. Histórico: a última alteração de cada registro | 2 de 4 passos | a chave canônica de dispositivo; o Vigia gravar a redação vigente de cada tipo e o construtor derivar a data da última alteração | eu |
| 5. Atributos em dados | concluída | — | — |
| 6. Ação penal | vocabulário fechado, derivador pronto, 66 registros conferidos à mão | os 149 com ressalva (revisão fina, bloco C); decidir o campo de fundamento, que o derivador já tem pronto para 1.363 registros | você |
| 7. Amostra de validação | protocolo registrado (`auditoria/protocolo.md`) | o sorteio, só na versão amadurecida; uma segunda pessoa para a dupla conferência | tudo o resto, e uma pessoa |
| 8. Pena cominada × pena concreta | o site novo já as separa na ficha do tipo | conferir e riscar | eu |
| 17. Hediondo × equiparado | primeira parte feita | condição em texto livre (24); varredura do CPM contra o rol (374) | você e eu |

## O revamp, antes do merge

- **A2, segunda parte** — a simulação legislativa ainda não aceita atributo novo com mais de
  um limiar, não edita nome nem dispositivo do tipo, não classifica o sentido da mudança que
  só altera valor, e não tem teste de interface. **Decisão sua: entra na v1 ou vira módulo?**
  A estratégia de 10/09 ("o que for difícil vira módulo") sugere módulo, com as limitações
  declaradas na tela, como já estão.
- **Revisão dos textos do site** — leitura sua.
- **História do projeto** (`textos/historia.md`) — em edição por você, fora dos commits.
- **O merge** — 57 commits, com a bateria verde.

## Qualidade dos dados, antes de declarar a versão madura

1. **Revisão fina** (`auditoria/revisao-fina.md`): violência (149 heranças e 83 juízos), ação
   penal com ressalva (149), e dez assuntos avulsos.
2. **Critério escrito para tentativa e elemento subjetivo**, os dois campos que ainda não têm
   régua nem derivador.
3. **Confirmar três leituras que já estão aplicadas**: a progressão do reincidente genérico
   (20% e 30%), a ANPP no crime militar e os atributos não calculados em tipo sem pena
   privativa.

## Autoria e citação

Antes da v1, porque a v1 é a primeira versão citável: `CITATION.cff`, `LICENSE` e a página
de créditos precisam dizer quem concebeu e construiu o sistema, e o lançamento pode vir com
DOI (Zenodo) e registro do programa no INPI. Proposta em separado.

## Caminho crítico sugerido

| # | Passo | Quem | Pode correr em paralelo com |
|---|---|---|---|
| 1 | Decisões da revisão fina, por família | você | 2, 3 |
| 2 | Cada decisão vira regra escrita no derivador, e o dado é corrigido | eu | 1 |
| 3 | Frente 4 (histórico) e frente 8 (conferir) | eu | 1 |
| 4 | Decidir o escopo do A2, segunda parte | você | 1 |
| 5 | Autoria e citação | você decide, eu escrevo | qualquer um |
| 6 | Merge do revamp na `main` | você autoriza | — |
| 7 | Nome, domínio e organização do repositório (frentes 1 e 3), num PR de endereço | você e a equipe | — |
| 8 | Sorteio e conferência da auditoria (frente 7), e as correções que ela trouxer | você, uma segunda pessoa e eu | — |
| 9 | v1.0.0: versão, Release, DOI | — | — |

O passo 8 fica por último de propósito: a auditoria mede a base amadurecida, e medi-la antes
contaria erros que já estão sendo corrigidos (decisão de 19/09/2026).
