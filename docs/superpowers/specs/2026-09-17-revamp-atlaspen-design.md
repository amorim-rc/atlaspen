# Revamp AtlasPen: ir ao ar, renomear e incorporar a pesquisa do SISPENAS original

**Data:** 17/09/2026
**Estado:** desenho aprovado em conversa; pendente de revisão do mantenedor.
**Branch de trabalho:** `revamp/atlaspen`

---

## 1. O estado real, apurado nesta sessão

Quatro constatações que mudam o enunciado do pedido original.

**Não há dois repositórios.** `sispenas-atlaspen` é um *worktree* de `sispenas`, mesmo `origin`
(`amorim-rc/sispenas`), na branch `revamp/atlaspen`. Implementar o revamp é **mergear**, não portar.

**O revamp já está construído.** São 17 commits sobre `main`: 175 arquivos, +23.779/−22.249.
Docusaurus aposentado (`abe68ac`), Astro no lugar, tokens e estilos novos, rotas e redirects,
acervo, linha do tempo, simulação legislativa. `npm run build` fecha verde: **1.594 páginas em
15s**. O que falta são as pendências de `backlog.md:327-402`.

**A renomeação está meio-feita.** Já são `atlaspen`: `package.json`, a constante `NOME`, logos,
favicon, social card. Continuam `sispenas`: o `base` da URL, `SITE_URL`, `REPOSITORIO`, os robôs e
41 ocorrências em arquivos versionados.

**O arquivo de materiais é uma proposta de dez itens, não conhecimento solto.**
`estudos/materiais-sispenas-originais.md` (582 linhas) lê cinco documentos inéditos cedidos pela
Dra. Luisa Moraes Abreu Ferreira e propõe P1 a P10, com ordem e esforço estimados.

---

## 2. Decomposição

Três sub-projetos, cada um com spec e plano próprios.

| | Sub-projeto | Entrega |
|---|---|---|
| **A** | Revamp ao ar | Pendências fechadas e merge de `revamp/atlaspen` em `main`, na URL atual |
| **B** | Renomeação interna | Nome, robôs e documentação; mais um PR de endereço escrito e **não disparado** |
| **C** | O material da pesquisa | P1 a P10, em oito PRs |

A ordem é A → B → C. A razão de C vir por último é que P3, P4 e P6 tocam a ficha do tipo e a
varredura de atributos que o revamp acabou de construir: fazê-los antes do merge obrigaria a
revisitar os mesmos arquivos duas vezes.

---

## 3. Sub-projeto A: revamp ao ar

### 3.1 Os vinte itens, classificados

O pedido foi "fechar todas as pendências antes de mergear". Apuradas uma a uma, elas não são da
mesma natureza, e parte delas não se fecha por esforço de implementação.

**A1 — fiação (barato, reaproveita mecanismo existente)**

- **Premissa variável na simulação.** `src/lib/atributos/reverso.ts` já define `BasePenaConcreta`
  (`minima | maxima | fixa`) e `CenarioReverso` com as circunstâncias do réu; `avaliarEstado(e, rev)`
  recebe isso por parâmetro (`src/lib/simulacao/motor.ts:259`). Quem trava é a interface:
  `src/components/simulacao/Simulador.tsx:69` faz `const REV = cenarioReversoPadrao()`, constante de
  módulo. Fechar é subir `REV` para estado e reaproveitar os controles que a ficha do atributo já tem.

**A2 — feature (o grosso do esforço)**

- **Atributo novo com mais de um limiar.** `DefinicaoAtributo` (`src/lib/simulacao/tipos.ts`) tem
  `limiarDias` escalar, `incidencia` e `comparacao`. Cobrir frações, prazos e valores calculados
  (progressão, prescrição, regime) é redesenhar esse contrato.
- **Tipo modificado.** Nome e dispositivo não se editam; o elemento subjetivo só alterna entre doloso
  e culposo; um tipo criado no pacote não pode ser modificado por outra mudança do mesmo pacote.
- **Etiqueta de "sentido não classificado".** Reclassificada de A1 para A2 em 17/09/2026, ao
  escrever o plano. `src/lib/simulacao/motor.ts:377` recusa a etiqueta de propósito: *"o sentido
  depende do valor, e a tela não o adivinha"*. O `valor` de `AtributoResultado` é **string**
  (`"36 meses"`); classificar a direção exige que `AtributoDef` declare um numérico comparável e
  o sentido dele (maior é pior, ou maior é melhor). É mudança de contrato, não fiação.
- ~~**Reincidência em três estados**~~ (lote do A4, item 1) — **fechado em 19/09/2026**, em quatro
  estados; ver `2026-09-19-a2-motor-reincidencia-remissao-multa-design.md`. O cenário só tem
  `reincidenteEspecifico`, e ANPP (CPP, art. 28-A, §2º, II), sursis (CP, art. 77, I) e
  regime inicial (CP, art. 33, §2º) vedam ou agravam **qualquer** reincidência. Primário,
  reincidente e reincidente específico, no cenário, nos controles de premissa e na ficha.
- ~~**Os 35 tipos sem veredito**~~ (lote do A4, item 2) — **fechado em 19/09/2026**; a remissão da
  Lei 2.889/56 já estava desdobrada em "c/c", e só o CP 304 e o CPM 315 entraram. Os 4 de pena por remissão (CP, art.
  304; Lei 2.889/56, arts. 2º e 3º; CPM, art. 315) avaliados contra cada dispositivo de
  origem, com veredito "depende" quando as origens divergem — publicar uma só moldura
  afirmaria uma pena que depende de qual origem se aplica, e marcá-los como tendo pena
  privativa sem moldura daria pena zero, que passa em qualquer teto. Os 31 punidos só com
  multa passam a mostrar os atributos que não dependem de pena privativa (transação).
- **Testes de interface e medida de desempenho.** Hoje há teste de motor e de URL
  (`scripts/verificar_simulacao.ts`, 254 linhas); não há teste de interface nem medição além de
  22 atributos × 1.472 tipos.

**A3 — dado (meu, porém lento)**

- Conferir as 16 datas de `data/marcos.json`.
- O acervo: 25 registros, quando o desenho previa 27. Texto original e data exata da revogação
  ausentes em todos, e declarados como ausentes.

**A4 — decisão do mantenedor (preparo com evidência, você decide em lote)**

- Régua da natureza das notas: contratual (a que foi aplicada) ou doutrinária.
- Heurística `ANOS_DE_LEI_RECENTE` do Proponente, a validar com as primeiras rodadas reais.
- Revisão dos textos do site.
- As seis decisões de acuidade do revamp: frações canônicas no lugar das aproximações decimais; os
  35 tipos sem pena privativa sem vereditos; "bons antecedentes" fora da ficha; perfil do réu com
  dois estados; editor de moldura recolhido; símbolo colorido todo no acento.

**A5 — reclassificar (não são pendências)**

- **Regime inicial fora da extinção de atributo.** `Simulador.tsx:72-73` exclui de propósito, com a
  razão escrita: *"O regime inicial não se extingue: toda pena privativa começa em algum regime."*
  Está correto. Vira decisão documentada.
- **"Fora do cálculo": a simulação não mexe na dosimetria.** Escopo declarado.
- **`?em=` reservado.** Implementá-lo é a frente 9 inteira, não acabamento do revamp.

**A6 — sai de A**

- **Nota da Lei 15.348/2026** → vai para P9, em C (ver 6.2).
- **Campos livres do tipo** (espécie de pena, ação penal) → depende de existir atributo que os leia,
  o que é P4, em C. O `src/lib/simulacao/tipos.ts:16-19` já explica: *"nenhum atributo as lê hoje —
  um campo sem efeito no cálculo sugeriria um efeito que não há."*
- **"Última alteração ainda não datada"** → depende da coleta da frente 4.
- **Datas de publicação das leis de 2026** → o Planalto não respondeu em 14/09/2026. Nenhum esforço
  interno destrava.

**A7 — depende do grupo**

- Os nomes da equipe de 2008 e as "três pessoas de início" em `textos/historia.md`.
- **Já resolvido nesta sessão:** o primeiro commit é `ad30273`, de **22/06/2026**. A data que o
  backlog mandava conferir está correta.

### 3.2 Critério de merge

O merge acontece quando A1, A2 e A3 estiverem fechados e A4 respondido. A5 vira texto no backlog; A6 e A7
ficam declarados no corpo do PR, com o motivo de cada um.

---

## 4. Sub-projeto B: renomeação interna

As 41 ocorrências de "sispenas" em arquivos versionados (fora de `node_modules`, `dist`, `.git`,
`__pycache__` e `.verificar-build`) **não são um find-and-replace**. Dividem-se em quatro classes.

| Classe | Onde | Ação |
|---|---|---|
| **Procedência** | `README.md:83,87,90`; `CITATION.cff` (`references`); `src/lib/atributos/reverso.ts:192`; `src/site/projeto.ts:71`; `estudos/materiais-sispenas-originais.md`; `textos/historia.md`; o PDF em `static/artigos/` | **Não muda.** "SISPENAS" nomeia o projeto de 2008 das Profas. Machado, que o AtlasPen retoma. Trocar apagaria a linhagem que o próprio `CITATION.cff` credita. |
| **Endereço** | `astro.config.mjs` (`BASE`); `src/site/config.ts` (`SITE_URL`, `REPOSITORIO`); `src/site/url.ts`; `src/site/markdown/links.ts` (`BASE_ANTIGO`); `.github/workflows/deploy.yml` | PR escrito, testado e **não disparado**. |
| **Dívida a pagar agora** | 30+ URLs absolutas em `src/data/changelog/entries/2026/*.ts` e em `static/data/changelog.json`, do tipo `https://amorim-rc.github.io/sispenas/tipos/95` | Derivar de `SITE_URL` em vez de literal. |
| **Renomeável agora** | `sispenas-automacao` e `sispenas-bot` (`conferidor.yml:389,390,448,449`; `regen-data.yml:79,80`); `.github/ISSUE_TEMPLATE/`; `TRIAGEM.md:61`; `CONTRIBUTING.md:37`; `scripts/bootstrap_changelog_entries.py`; `scripts/gerar_completude.py`; `scripts/verificar_rotas.mjs` | Troca direta. |

**O ganho de B não é cosmético.** Pagar a dívida da terceira linha transforma a futura troca de
endereço de "reescrever nota publicada" em "mudar uma constante".

**Por que o repositório não é renomeado agora.** A documentação do GitHub é explícita: ao renomear um
repositório, tudo é redirecionado **exceto as URLs de project site**. Renomear `sispenas` para
`atlaspen` moveria o Pages para `amorim-rc.github.io/atlaspen/` e o endereço antigo passaria a dar
404, sem redirecionamento. A própria documentação recomenda domínio próprio para quem pretende
renomear. Decisão: adiar o repositório, fazer todo o resto, e deixar o PR de endereço engatilhado
para quando **atlaspen.org.br** existir.

**Higiene, de passagem.** Não há `.gitattributes`. Corrigido em 18/09/2026: o que parecia
inconsistência do repositório não é. `git ls-files --eol` mostra **LF em todo o índice**; o CRLF
de `CONTRIBUTING.md`, `AGENTS.md`, `backlog.md` e dos `docs/` existe só na cópia de trabalho, por
causa do `core.autocrlf=true` da máquina do mantenedor. Um `.gitattributes` com `* text=auto eol=lf`
ainda vale a pena — tira a dependência da configuração de cada máquina, que é o que faz o aviso de
CRLF nos admonitions do `AGENTS.md` existir —, mas é prevenção, não conserto.

---

## 5. Sub-projeto C: o material da pesquisa

Oito PRs, na ordem que o próprio arquivo de materiais recomenda.

| PR | Propostas | Por que nesta ordem |
|---|---|---|
| 1 | **P2** — oráculo do documento D | 29 regras de 2008–2011 × 1.507 registros. Diagnóstico, **não falha o build**. Mede a saúde do motor antes de qualquer mudança. |
| 2 | **P4** — cinco atributos novos | Perdimento alargado (CP, art. 91-A), perfil genético (LEP, art. 9º-A), interceptação (Lei 9.296/96, art. 2º, III), captação ambiental (art. 8º-A) e espécie de procedimento. Destrava o "campos livres" que saiu de A. |
| 3 | **P6** — `texto_legal` | Derivado próprio em `static/data/textos.json`, preenchido pelo Vigia. Não entra em `crimes.json`. |
| 4 | **P3** — `titulo` e `capitulo` | Depende de P6. Destrava três das quatro regras de procedimento especial. |
| 5 | **P5** — cenários materializados | Depende de P3. `static/data/cenarios.csv`, só modificadores de terceira fase com fração tabelada. |
| 6 | **P1** — exportação em planilha | Consome tudo acima. |
| 7 | **P7** — procedência por tipo | Acompanha a frente 4. |
| 8 | **P8, P9, P10** | Liberadas pela autorização (ver 6.1). P9 leva a nota da Lei 15.348. |

**Decisão técnica sobre P1.** O arquivo deixa em aberto se a exportação é `.xlsx` ou CSV. Decisão:
**os dois**. CSV UTF-8 com BOM, que o Excel abre, e `.xlsx` via `openpyxl` — dependência barata, só
de build, e o grupo trabalha em Excel (a planilha de 2011 é `.xls`).

**Decisão de modelagem sobre P4.** A espécie de procedimento vira **campo derivado** (`procedimento`),
e não `AtributoDef`: ela responde *qual*, e não *cabe/não cabe*, e torcer o contrato de `AtributoDef`
por um caso custa mais do que resolve. É a recomendação do próprio arquivo.

---

## 6. Decisões tomadas nesta sessão

### 6.1 Autorização e crédito

A autorização da Dra. Luisa Moraes Abreu Ferreira foi dada **por e-mail e em reunião**, para uso
integral do material com registro de crédito. P8, P9 e P10 estão liberadas.

A forma do crédito — a pergunta 2 da seção 6 do arquivo de materiais, que estava em aberto:

- **`CITATION.cff` permanece com "Equipe AtlasPen"** como autor. O grupo são três pessoas e a autoria
  do software é coletiva.
- **Crédito nominal no `_meta`** de cada arquivo de dado que use material da pesquisa dela.
- **`data/contribuicoes.json`**, novo: registra **quem fez qual contribuição**. É a base da página de
  contribuições, cujo desenho fica para depois.

A razão, nas palavras do mantenedor: ter referência de contribuição de pesquisadoras importa para
estimular outras pessoas a contribuírem.

### 6.2 Lei 15.348/2026: adiada para P9

A Lei 15.348/2026 (Auxílio Gás do Povo) não comina pena. O que ela faz é dar redação nova ao
**art. 1º, II, da Lei 8.176/91** — essa sim penal. Conferido no compilado do Planalto em 17/09/2026:

- **Antes:** "usar gás liqüefeito de petróleo **em motores de qualquer espécie, saunas, caldeiras e
  aquecimento de piscinas, ou** para fins automotivos, em desacordo com as normas estabelecidas na
  forma da lei."
- **Depois:** "usar gás liquefeito de petróleo **para fins automotivos**, em desacordo com as normas
  estabelecidas na forma da lei." *(Redação dada pela Lei nº 15.348, de 2026)*
- **Pena: detenção de um a cinco anos — inalterada.**

Saíram quatro hipóteses de conduta. Para elas, o fato deixou de ser crime: art. 2º, *caput*, do CP,
com extinção da punibilidade pelo art. 107, III, e apagamento dos efeitos penais da condenação.
Chamar de *mellius* subestima — *mellius* pressupõe que o fato siga típico sob tratamento melhor, e
aqui a conduta ficou **atípica**.

**Por que travou.** Duas razões de esquema, e não de direito:

1. `natureza` é escalar. `scripts/validar-changelog.mjs:41` faz `TIPOS_CHANGELOG.includes(e.tipo)`;
   uma lista reprova.
2. O registro **543** é do artigo, não do inciso: cobre I e II num só. Uma nota `abolitio` apareceria
   ao lado de um registro intacto, com a mesma moldura de 1 a 5 anos.

**Decisão:** adiar para P9, que traz `natureza` como lista e o estado do dispositivo no tempo — onde a
mudança de alcance se representa corretamente.

### 6.3 Frente 17, acrescentada ao backlog

Separar, no registro do tipo, o crime **hediondo** do **equiparado a hediondo**. Hoje o catálogo
colapsa os dois em `hediondo: "Sim"`: 133 registros, entre os quais tráfico (Lei 11.343/06), tortura
(Lei 9.455/97) e terrorismo (Lei 13.260/16), que são equiparados pelo art. 5º, XLIII, da CF e não
hediondos do rol do art. 1º da Lei 8.072/90. Os avaliadores já escrevem "hediondo ou equiparado" na
justificativa — **a interface usa um vocabulário que o dado não registra**.

---

## 7. Em aberto

1. **A4** — as quatro decisões do mantenedor, a serem apresentadas em lote com a evidência de cada.
2. **A7** — os nomes da equipe de 2008, que só o grupo tem.
3. **Domínio atlaspen.org.br** — compra e apontamento de DNS; destrava o PR de endereço de B.
4. **Datas de publicação das leis de 2026** — dependem de o Planalto responder.
5. **Unidade de análise do panorama** (pergunta 4 da seção 6 do arquivo de materiais): o documento B
   sugere que é o **estado do dispositivo**, e não a lei alteradora. Confirmar com quem desenhou.
6. **O resto do acervo do SISPENAS** (pergunta 3): as planilhas integrais das 37 leis especiais e o
   código PHP entregue ao Ministério da Justiça.

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| **Divergência longa entre `revamp/atlaspen` e `main`.** A2 é trabalho de feature; enquanto ele corre, a branch se afasta da `main` que as colegas usam. | Rebase periódico. Se A2 se alongar, reconsiderar o merge antecipado com A2 virando frente. |
| **P2 pode revelar erro no motor.** O oráculo compara duas especificações independentes com quinze anos de distância. | É o objetivo, não o risco. Divergência se **classifica** antes de corrigir, nas três espécies que o arquivo prevê: erro do motor, a lei mudou, a leitura mudou. |
| **P3 e P6 dependem de o Vigia baixar o Planalto.** O Planalto derrubou a conexão nesta sessão e não respondeu em 14/09/2026. | Os dois toleram `null`. O `null` é informação, não lacuna. |
| **Renomear o repositório quebra a URL do Pages.** | Já mitigado: o repositório não é renomeado até o domínio existir. |
