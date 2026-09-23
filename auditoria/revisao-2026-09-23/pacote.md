# AtlasPen — revisão fina de 23/09/2026: pacote de execução para o Claude Code

**Para quem é este arquivo.** Para o Claude Code, dentro do repositório `sispenas-atlaspen`, como parte do conjunto de tarefas de preparação para o lançamento. Ele traz tudo o que a revisão jurídica fina de 23/09/2026 decidiu e tudo o que precisa mudar no repositório por causa dela: dados, esquema, derivadores, auditor, robôs, motor, histórico, notas e changelog.

**Quem decidiu.** Luccas de Amorim, mantenedor, decisão a decisão, em sessão Cowork de 23/09/2026. Cada decisão tem leitura adotada, grau de confiança (A, M ou B), fundamento com página do compilado e ids afetados. O registro completo está no **Anexo C**. Grau B não é publicado.

**Fontes.** Os compilados do Planalto foram impressos em PDF em 23/09/2026, entre 10:24 e 15:48, na pasta `G:\Meu Drive\Obra\Projetos\AtlasPen - revisão legislativa`. As páginas citadas neste arquivo são páginas desses PDFs. As datas de publicação das leis de 2026 foram conferidas no DOU pelo `dou_watcher.py` (pasta `dou/` do Drive). A jurisprudência foi conferida em andamentos e súmulas impressos dos portais do STF, do STJ e do STM.

---

## 0. Regras de execução (leia antes de tudo)

1. **Leia `AGENTS.md` e `CONTRIBUTING.md` primeiro.** Onde este arquivo e as convenções do repositório divergirem na forma (nomes de arquivo, rotinas, testes), vale a convenção do repositório. O conteúdo jurídico vale como está aqui.
2. **Nada é apagado.** Registro que sai do catálogo vai para `data/ids-aposentados.json`, com redirecionamento. Nenhum arquivo é removido.
3. **O id nunca é reatribuído.** Registro novo recebe `max(id em uso, id aposentado) + 1`, por `scripts/robos/proponente/criar.py` ou pela mesma regra de `transform_data.py` (`validar_ids`).
4. **Toda mudança de dado é por (id, campo), com valor de origem conferido.** Escreva um aplicador (sugestão: `scripts/revisao/aplicar_2026_09_23.py`) que lê o JSON do **Anexo A**.
   - Por padrão ele **só simula** e escreve um relatório do que mudaria.
   - Só grava com `--aplicar`.
   - Recusa a mudança quando o valor atual do campo não for o `de` informado: o catálogo pode ter mudado depois de 23/09. Nesse caso, lista a divergência e não aplica.
5. **Mostre o relatório da simulação ao Luccas e espere a ordem dele antes de aplicar.** Vale para o Anexo A, o Anexo B e as aposentadorias.
6. **Ordem obrigatória:** código (etapa 1) → esquema (etapa 2) → dados (etapas 3 a 5) → motor e site (etapa 6) → histórico e notas (etapa 7) → regeneração dos relatórios e conferência (etapa 8) → changelog (etapa 9). Não regenere os relatórios de auditoria antes de corrigir o auditor.
7. **Não sobrescreva `auditoria/revisao-fina.md`.** Depois da regeneração, compare os relatórios novos com o apêndice anotado dele. Uma anotação só sai de lá quando virar regra escrita nos derivadores.
8. **Uma sessão, uma release.** Tudo isto é uma release, com uma entrada de changelog (etapa 9).
9. **Onde algo não fechar, pare e registre.** Exemplos: um id do Anexo A que não existe, um dispositivo que não bate, um teste que não passa. Não resolva por plausibilidade.

---

## 1. Código: derivadores, auditor, hediondez e robôs

### 1.1 `scripts/acao_penal.py` (derivador de ação penal)

| # | O que mudar | Por quê |
|---|---|---|
| a | **C1.** No ramo `_NESTE_CAPITULO` de `achar_regras`, o alcance descarta o título (`alcance.pop('titulo')`). Mantenha título, capítulo e seção, e faça `alcanca()` comparar a cadeia inteira. Procure o mesmo defeito em toda regra com referência relativa ("neste Título", "nesta Seção") | O art. 145 do CP ("neste Capítulo") estava alcançando os Capítulos V dos Títulos II, VI e X |
| b | Regra do art. 145, parágrafo único, do CP: ela depende da hipótese do art. 141 (I ou II), não do artigo citado. Deve sair como regra com ressalva, que vai para `acao_condicao`, e não como espécie para os artigos citados | O relatório atual deriva "Requisição" para os ids 60 a 64 |
| c | `EXTERNAS`: acrescentar como **fundamento**, sem mudar a espécie: (i) CPM, art. 121 (a ação é sempre promovida pelo MP) para todo registro do CPM; (ii) Lei 11.340/06, art. 41, com STF, ADI 4424, e STJ, Súmula 542, para CP 129, § 9º e § 13 (lesão em violência doméstica é incondicionada) | Decisão 18 |
| d | Campo novo `acao_fundamento` (decisão 18): gravar `Classificacao.fundamento` em todos os registros. Tipos: "regra do diploma: <dispositivo>"; "regra geral: CP, art. 100, c/c art. 12"; "lei externa: <dispositivo>"; "jurisprudência: <precedente>"; "intertemporal: ver `acao_condicao`" | Decisão 18 |
| e | C3: procure onde "art. 184" é resolvido sem o diploma. É provável que a Lei 9.279 tenha colidido com o art. 184 do CP, cujos §§ 1º e 2º são incondicionados | Ids 1425 e 1426 |
| f | Testes em `scripts/robos/tests/test_acao_penal.py`: capítulo V em títulos diferentes; art. 145, parágrafo único; externas do CPM e da violência doméstica | — |

### 1.2 `scripts/violencia.py` (derivador de violência e grave ameaça)

As regras abaixo transformam as decisões 1 a 11 e a C6 em regra escrita. A partir delas, o próximo tipo da mesma família já nasce decidido.

| # | Regra | Resultado | Decisão |
|---|---|---|---|
| a | Violência literal: acrescentar a `violencia-meio` os padrões `praticar violencia`, `praticando violencia`, `ato de violencia`, `consiste em violencia`, `violencia ou grave ameaca` quando não houver meio alternativo | Sim | C6 |
| b | **Nunca usar a rubrica como texto do dispositivo.** A rubrica marginal ("Violência política", "Violência arbitrária") não é trecho da lei | — | C6 |
| c | **Seguir remissões**: "definidos nos arts. …", "nas penas do art. …", "qualquer dos crimes definidos no art. …". O registro herda a classificação do tipo remetido, e a regra registra a remissão | herda | C6; CPM 389, 405 e 408 |
| d | Associação e incitação com pena por remissão (Lei 2.889, arts. 2º e 3º): a conduta é associar-se ou incitar, e a remissão não importa o meio de execução do crime remetido | Não | 6 |
| e | `meio-alternativo` deixa de sair como indeciso: violência "Não", grave ameaça "Não" e `violencia_condicao` = "Sim quando o meio empregado for violência à pessoa ou grave ameaça (<dispositivo>)". Violência "ou ameaça", sem "grave", também é meio alternativo (CP 329, CPM 177, CPM 358, Lei 1.579, art. 4º, I) | Não + condição | 8, C6-177 |
| f | Violência "contra pessoa ou contra coisa" (CP 200): condição "Sim somente quando a violência é praticada contra a pessoa" | Não + condição | 8 |
| g | Privação da liberdade ("sequestro", "cárcere privado", "privar alguém de sua liberdade"): violência "Não", com condição "Sim quando a privação é executada ou mantida mediante violência à pessoa ou grave ameaça" | Não + condição | 1a |
| h | Extorsão mediante sequestro ("como condição ou preço do resgate"; CPM 244, "extorquir… mediante seqüestro"): violência "Não" com a mesma condição; **grave ameaça "Sim"** | Não + cond. / Sim | 1b |
| i | `ameaca-sem-qualificativo`: grave ameaça "Não" + condição "Sim quando a ameaça empregada for grave". **Exceções "Sim"**: "ameaça de emprego de violência contra pessoa" (CPM 242) e "ameaça de revelar fato" que lesa a reputação (CPM 245) | Não + cond. / Sim | 9 |
| j | `perigo-a-pessoa` deixa de sair como indeciso: "Não". Quando o tipo tem "abusando de meios de correção ou disciplina" ou "maus-tratos", entra a condição "Sim quando … envolvem violência física" | Não (+ condição) | 10 |
| k | `violencia-em-sentido-proprio`: psicológica e institucional → "Não". "Física ou psicológica" → meio alternativo (regra e) | Não | 11 |
| l | Vítima animal ("animais silvestres, domésticos"; Lei 9.605, art. 32): "Não". O CP 44, I, fala em violência "à pessoa", e o CPP 28-A se lê no mesmo sentido | Não | 7 |
| m | "Pessoa ou cadáver" (Lei 9.434, art. 14): "Não" + condição "Sim quando a remoção é feita em pessoa viva". "Em pessoa viva, e resulta…" → "Sim" | Não + cond. / Sim | 3 |
| n | Tipo associativo, inclusive com causa de aumento por arma (Lei 12.850, art. 2º, § 2º; CP 288-A): "Não" | Não | C7, 7 |
| o | "Participar de rixa": "Sim" (rixa pressupõe vias de fato) | Sim | 7 |
| p | Causa de aumento não muda o meio de execução. Um registro "§ x c/c caput" herda a violência do tipo-base (CP 250, § 1º; CP 133, § 3º) | herda | 5, 10 (C10) |
| q | Lei 9.455, art. 1º, § 3º (tortura com resultado): condição "Sim nas hipóteses do art. 1º, I e II; Não no § 1º e no inciso III" | Não + condição | 8 |
| r | Lei 9.455, art. 1º, III ("submeter mulher, reiteradamente, a intenso sofrimento físico ou mental"): "Não" + condição "Sim quando o sofrimento físico é infligido mediante agressão" | Não + condição | 11 |
| s | Crime culposo: "Não". A regra já existe; confira que ela vence as regras de núcleo (CPM 206, id 695) | Não | C7 |

Testes em `scripts/robos/tests/test_violencia.py`: um caso por linha da tabela, com o texto do dispositivo como fixture.

### 1.3 Auditor: `scripts/robos/auditor/conferir_violencia.py` e `conferir_acao_penal.py`

- **C6:** reconhecer violência literal (1.2 a), nunca ler a rubrica (1.2 b), seguir remissões (1.2 c) e manter a distinção entre violência contra a pessoa e contra a coisa.
- **C1:** passa a valer pela correção 1.1 a.
- Os dois relatórios passam a contar à parte as condições (`violencia_condicao`, `acao_condicao`). Um registro com condição declarada não é divergência; é "confere com ressalva".

### 1.4 Hediondez: `data/hediondos.json` e `scripts/hediondez.py`

| # | O que mudar | Decisão |
|---|---|---|
| a | **C15.** Ancorar o fim de todas as expressões de `artigo`. Por exemplo, `^Art\. 157, §2º, V$` em vez de `^Art\. 157, §2º, V`, e `^Art\. 157, §2º-A, I$`. Sem isso, "V" casa "VI, VII, VIII" e "I" casa "II". Foi o que deixou passar a C12 | C15 |
| b | Acrescentar às `regras` do CPM, por identidade (Lei 8.072, art. 1º, parágrafo único, VI, p. 3): 208 caput e 401 (genocídio); 208 parágrafo único e 402 (condicional: incisos I, II, IV e V); 244, caput, §§ 1º e 2º; 405 c/c 244 (todas as formas); 408 (todas as formas); 400, III; 242, § 2º, V e VI; 243, § 1º, c/c 242, § 2º, V; 292, § 1º; 225, § 1º (condicional: vítima menor de 18) | 29 |
| c | Condicionais novas do CPM: 205 caput e 400, I (grupo de extermínio, I); 209, § 2º e § 3º-A, 403, § 2º e § 3º, morte (I-A, a); agregadores do roubo e da extorsão (242, § 2º; 243, § 1º; 405 c/c 242, § 2º; 405 c/c 243, § 1º; 405 caput) | 29 |
| d | `excecoes`: CP 121, § 2º-D, "Não", com nota: "o rol remete ao § 2º; o § 2º-D (Lei 15.358/2026) é parágrafo autônomo e não foi acrescentado ao rol" | 28 |
| e | `pendentes`: fechar a varredura do Livro II do CPM (item "O inverso — varrer o Livro II…"), citando a decisão 29 | 29 |
| f | Testes em `test_hediondez.py`: um caso para cada âncora e para cada regra nova | — |

### 1.5 Robôs

| # | Robô | O que mudar |
|---|---|---|
| a | `sentinela/dou_watcher.py` | Hoje descarta como "não comina pena" duas espécies de lei que alteram tipos: (i) a que **inclui inciso** sob uma pena já cominada (Lei 15.410 → Lei 9.455, art. 1º, III); (ii) a que dá **nova redação** a um tipo sem cominar pena (Leis 15.353, 15.438, 15.455, 15.348). Acrescentar um nível de triagem: "altera redação ou inclui dispositivo em diploma monitorado" → vai para leitura humana |
| b | `sentinela/dou_watcher.py` | Atos de retificação ("RETIFICAÇÃO") de lei monitorada ficam fora do filtro por espécie. A retificação da Lei 15.384 (DOU de 15/04/2026, seção 1, p. 17) só foi achada à mão. Capturar retificações que citem lei monitorada |
| c | `data/fontes.json` | Atualizar a `sentinela` do CP e de `combustiveis-8176` para a Lei 15.517/2026, que o próprio relatório do robô de 23/09 recomendou |
| d | `recenseador/leis_do_ano.py` | Conferir que o backlog das "oito leis de 2026" passa a incluir as que ficaram fora: 15.348, 15.355, 15.407, 15.410 e 15.517 (e as leis do ECA, da Lei 14.597 e da Lei 4.117 citadas nos compilados) |

---

## 2. Esquema: campos e valores novos

Documente cada item na tabela de campos do `CONTRIBUTING.md` e nas regras do `AGENTS.md`. Atualize os validadores (`validar_atributos.py` e o que mais validar `crimes.json`), o `transform_data.py` e a ficha do tipo no site.

| Campo ou valor | Definição | Decisões |
|---|---|---|
| `violencia_condicao` (texto, opcional) | Condição em que a violência à pessoa **ou** a grave ameaça está presente, com o dispositivo, no mesmo padrão de `acao_condicao` e `hediondo_condicao`. Quando existe, o motor mostra os atributos nas duas hipóteses | 1, 3, 7, 8, 9, 10, 11 |
| `acao_fundamento` (texto, gerado) | De onde vem a espécie de ação penal (ver 1.1 d) | 18 |
| `elemento` = **"Qualificado pelo resultado"** | Dolo no antecedente e dolo **ou** culpa no resultado; crime único, sem concurso de crimes. Tentativa admitida | 31, 31-D, 31-D2 |
| `elemento` = "Preterdoloso" (redefinido) | Dolo no antecedente e culpa no resultado: quando a lei exclui o dolo no resultado (CP 129, § 3º; CPM 209, § 3º-A) ou quando o resultado doloso configura outro crime. Tentativa "Não" | 31, 20 |
| `hediondo_nota` (texto, opcional) | Divergência de jurisprudência ou de doutrina sobre a hediondez. Não é condição do fato | 28 |
| Aviso de controle concentrado ou de repercussão geral | Dado versionado (sugestão: `data/avisos.json`), exibido na ficha e no cálculo: ADIs contra a Lei 15.402 (decisão 36); Tema 506 (C16); divergência sobre o ANPP no CPM (decisão 25) | 25, 36, C16 |
| Natureza de nota "abolitio parcial" | Quarta natureza das notas de lei, ao lado de incriminadora, *in pejus* e *in mellius*. Régua: "abolitio (parcial)" é a conduta que deixa de ser típica; *in mellius* é a conduta que segue punível com tratamento mais favorável. Registrar em `AGENTS.md` e em `create-changelog-entry.md` | 37 |

**Régua escrita do `elemento`** (vai para o `AGENTS.md`), grau M:

1. **Preterdoloso**: a lei exclui o dolo no resultado, ou o resultado doloso é outro crime (tratado em concurso, fora do registro). Tentativa "Não".
2. **Qualificado pelo resultado**: o tipo abriga resultado doloso ou culposo (latrocínio, STF, Súmula 610; estupro e formas qualificadas, NUCCI, *Manual de Direito Penal*, 22. ed., 2026, p. 665–666). Tentativa "Sim".
3. **Doloso**: os demais casos. O CP 19 já exige que o resultado agravador seja causado ao menos culposamente.

---

## 3. Dados: mudanças por (id, campo)

O **Anexo A** traz **413 mudanças efetivas** em JSON. Das 507 mudanças derivadas das decisões, 94 já tinham o valor decidido e ficaram fora. Os textos repetidos estão em `textos` (T01, T02…) e são referenciados por `para_texto`.

Resumo por decisão:

| Decisão | Ids | O quê |
|---|---|---|
| C3, C4, C5 | 1425, 1426, 604, 80, 120 | Espécie de ação penal contra a lei |
| C7 | 495, 311, 221, 253, 695 | Violência ou grave ameaça sem base no texto; 695 passa a Culposo, tentativa "Não" |
| C12 | 100, 101, 812, 588 | Hediondo "Sim" sem base no rol → "Não" |
| 1a | 69, 70, 71, 621–625, 1315; CPM 750, 1095, 1096 | Sequestro: "Não" + condição |
| 1b | 110–114, 1483–1485; CPM 1116, 1447–1449 | Extorsão mediante sequestro: violência "Não" + condição; grave ameaça "Sim" |
| 3, 5, 6 | 561, 562, 989; 722–724; 1461–1463, 1472, 1473 | Núcleo, incêndio majorado, associação e incitação |
| 7 | 156, 291, 292, 351, 475, 579, 671, 768, 906, 1118, 1267, 1327, 1455 | Avulsos |
| 8 | 38 ids (ver Anexo A) | Meio alternativo: "Não" + condição |
| 9 | 67, 428, 513, 578, 1508 | Ameaça sem "grave": "Não" + condição |
| 10 | 54–57, 1080, 1089–1091, 1479–1482 | Tipos de perigo |
| 11 | 68, 1332 | Violência em sentido próprio |
| 12, 33 | 43 ids, e 595 | `acao_condicao` do art. 182 e do regime no tempo do estelionato |
| 13, 15, 17 | 58–64, 730, 1504, 1505; 539–541 | Condições de ação penal |
| 34 | 76, 77 | `vigencia_ate` e `vigencia_nota` (revogação tácita pela Lei 6.538) |
| 31, 20 | 81 ids | `elemento` e `tentativa` |
| 28, 29 | 45 ids | `hediondo`, `hediondo_condicao` e `hediondo_nota` |
| C13 | 559 | Aposentar, com redirecionamento para 1508 (duplicata do CE, art. 326-B) |

**Atenção às condições do estelionato** (ids 127, 128, 580 e 589 a 594). O texto de `acao_condicao` reúne a regra no tempo (decisão 33) e o art. 182 (decisão 12). O motor precisa da **data do fato** para escolher o trecho que se aplica (etapa 6).

---

## 4. Dados: registros novos

O **Anexo B** traz os 18 registros novos, com todos os campos. Os ids são atribuídos pela regra do item 0.3. O campo `obs` de cada um cita a lei e a decisão.

Resumo:

| Origem | Registros |
|---|---|
| Lei 15.517/2026 (decisão 38) | CP 155, § 10; 155, § 11 c/c § 10; 155, § 12 c/c § 10; 157, § 2º, XI; 157, § 2º-A, III; Lei 8.176, art. 1º-A; art. 1º-B |
| Varredura do CPM (decisão 29) | CPM 208, parágrafo único; 225, § 1º; 242, § 2º, V; 242, § 2º, VI; 243, § 1º c/c 242, § 2º, V; 244, § 1º; 244, § 2º; 292, § 1º; 292, § 2º (simples); 292, § 2º (com morte) |
| Decisão 34 | Lei 6.538, art. 40, § 1º |

Modificadores (catálogo `data/modificadores.json`), e não registros:
- a Lei 8.176, art. 1º-B, § 1º (primário: redução de 1/3 a 2/3 ou dispensa da multa);
- os efeitos da condenação dos arts. 1º-A, § 3º, e 1º-C da Lei 8.176.

---

## 5. Aposentadoria

| Id | Destino | Fundamento |
|---|---|---|
| 559 | aposenta; redireciona para **1508** | C13: é o mesmo dispositivo (CE, art. 326-B). O id 559 estava rotulado pela lei que o criou (Lei 14.192/21), que é a armadilha 5 do README dos robôs |

Entrada em `data/ids-aposentados.json` com data 23/09/2026, motivo e destino. Redirecionamento no site (camada de redirecionamentos existente).

---

## 6. Motor e site

| # | O que mudar | Decisão |
|---|---|---|
| a | **Data do fato** como entrada do cálculo (padrão: hoje). Ela escolhe a regra no tempo da progressão (35) e da ação penal do estelionato (33) | 33, 35 |
| b | **Progressão (LEP, art. 112):** primário sem violência: 16% para fatos até 07/05/2026 e 1/6 a partir de 08/05/2026 (Lei 15.402, vigente desde 08/05/2026). Reincidente com violência: 30% (fundamento: inciso II; o IV no mesmo sentido). Reincidente nos demais: 20% (inciso III). Primário com violência: 25% (inciso I). Hediondos: 40/50/55 (feminicídio de primário)/60/70% para fatos até 24/03/2026; 70/75/80/85% a partir de 25/03/2026 (Lei 15.358, vigente desde 25/03/2026) | 21, 35 |
| c | **Título XII do CP (arts. 359-I a 359-T):** primário, 1/6. Reincidente: resultado condicional — sem violência, 1/6 (caput) ou 20% (III); com violência, 30% (IV) ou a leitura de derrogação. O motor calcula pela mais favorável e mostra a divergência. A lei mais benéfica retroage | 27, 35 |
| d | **Aviso das ADIs** nas fichas do Título XII e no cálculo da progressão, com o texto da decisão 36 (Anexo C). Dado com data de consulta, para revisar periodicamente | 36 |
| e | **`violencia_condicao`:** quando existe, o motor mostra ANPP, substituição, arrependimento posterior e progressão nas duas hipóteses (com e sem violência), com a condição escrita | 1–11 |
| f | **Pena mínima não cominada** (`pena_min` 0 com nota; Lei 6.538, arts. 36–42): o motor usa **1 dia** como mínimo, nunca o máximo. É proibido aplicar por analogia o mínimo do CE 284 ou do CPM 58 | 24 |
| g | **ANPP no CPM:** calcular pelos critérios do CPP 28-A (incluído o § 1º: causas de aumento e diminuição) e exibir o aviso de divergência: "Cabível em tese: STF, 2ª T., HC 232.254/PE (2024); STF, RE 1.613.372 (dec. monocrática, 29/07/2026); STJ, 5ª T., HC 993.294/MG (2025). Contra: STM, Súmula 18 (2022)" | 25 |
| h | **Tipos sem pena de prisão (33 registros):** desistência voluntária e arrependimento eficaz (CP 15) calculados quando a tentativa é "Sim"; "Não se aplica" nas contravenções (LCP 4). Perdão judicial (CP 107, IX): "Não previsto", salvo previsão no tipo ou diploma. Arrependimento posterior (CP 16): calculado pelo campo de violência. Ids 556 e 557: atributos nos registros derivados (1462–1476) | 26 |
| i | **Tentativa pelo `elemento`:** "Qualificado pelo resultado" admite tentativa; "Preterdoloso" não. Desistência e arrependimento eficaz seguem a tentativa | 20, 31 |
| j | **Aviso do Tema 506** no id 314: "Não constitui infração penal a conduta com cannabis sativa para consumo pessoal; presunção relativa de usuário até 40 g ou seis plantas-fêmeas; as sanções dos incisos I e III são aplicadas em procedimento não penal (STF, RE 635.659, Tema 506). Para as demais drogas o tipo permanece" | C16 |
| k | **Nome do tipo** (decisão 30): gerar a lista dos registros cujo `crime` viola a régua (cópia do texto da lei, sem rubrica, ou mais de ~80 caracteres) e **entregá-la ao Luccas antes de alterar**. A régua está no item 2 e no Anexo C | 30 |

---

## 7. Histórico legislativo e notas de lei

| # | O que mudar | Decisão |
|---|---|---|
| a | `data/historico-legislativo.json`: o evento `combustiveis-8176\|art. 1, ii` (alteração pela Lei 15.348/2026) ganha natureza penal **"abolitio parcial"**, com a ressalva de possível subsunção ao art. 56 da Lei 9.605/98. O id 543 mantém id e moldura, e o `obs` ganha a frase sobre a supressão das hipóteses "motores de qualquer espécie, saunas, caldeiras e aquecimento de piscinas" (vigência: 13/02/2026) | 37 |
| b | Eventos da Lei 15.517/2026 (CP 155 e 157; Lei 8.176, arts. 1º-A a 1º-D). Notas de natureza *in pejus* (a conduta já era punível como furto, roubo ou receptação). Vigência: 23/09/2026 | 38 |
| c | Datas de publicação e de vigência das leis de 2026 (preencher `publicacao` e `vigencia`, pendentes no `_meta`): | 32 |

| Lei | Data da lei | DOU | Vigência |
|---|---|---|---|
| 15.280/2025 | 05/12/2025 | 08/12/2025 | publicação |
| LC 225/2026 | 08/01/2026 | 09/01/2026 | escalonada (conferir no art. de vigência) |
| 15.348 | 13/02/2026 | 13/02/2026, ed. extra | publicação |
| 15.353 | 08/03/2026 | 08/03/2026, ed. extra | publicação |
| 15.355 | 11/03/2026 | 12/03/2026 | publicação |
| 15.358 | 24/03/2026 | 25/03/2026 | publicação |
| 15.384 | 09/04/2026 | 10/04/2026 (retificação da ementa em 15/04/2026, p. 17) | publicação |
| 15.397 | 30/04/2026 | 04/05/2026 | publicação |
| 15.402 | 08/05/2026 | 08/05/2026, ed. extra | publicação |
| 15.410 | 20/05/2026 | 21/05/2026 | publicação |
| 15.425 | 03/06/2026 | 08/06/2026 | publicação |
| 15.438 | 18/06/2026 | 19/06/2026 | publicação |
| 15.455 | 01/07/2026 | 02/07/2026 | publicação |
| 15.487 | 06/08/2026 | 07/08/2026 | publicação |
| 15.517 | 22/09/2026 | 23/09/2026 | publicação |

| # | O que mudar | Decisão |
|---|---|---|
| d | Lei 13.964/2019: DOU 24/12/2019 (ed. extra), vigência em 30 dias → **23/01/2020**. Lei 15.229/2025: DOU 03/10/2025, vigência na publicação. Registrar como eventos do CP 171, § 5º (criação, alteração do inciso III, revogação pela Lei 15.397) | 33 |
| e | CP 151, caput e § 1º, I: evento de revogação tácita pela Lei 6.538/78 (vigência 23/06/1978) | 34 |

---

## 8. Regeneração e conferência

1. Rode os testes: `python -m pytest scripts/robos/tests`.
2. Regenere os relatórios, **só depois** das etapas 1 a 5:
   ```
   python scripts/robos/auditor/conferir_violencia.py --md auditoria/violencia-e-grave-ameaca.md
   python scripts/robos/auditor/conferir_acao_penal.py --md auditoria/acao-penal.md
   ```
3. Compare com o apêndice anotado de `auditoria/revisao-fina.md` e com o Anexo C. O esperado:
   - nenhum dos ids tratados aqui aparece como divergência;
   - os registros com condição aparecem como "confere com ressalva";
   - o bloco A de violência some ou fica só com o que não foi decidido.
4. Liste o que sobrar e entregue ao Luccas. **Não decida.**
5. Rode o conferidor de penas e o `verificar_*.ts` do repositório para garantir que nenhuma moldura mudou por acidente.

---

## 9. Entrada de changelog (proposta: grave em `src/data/changelog/entries/` com o formato do repositório)

> **Revisão jurídica fina — 23/09/2026.**
> Conferência campo a campo contra os textos compilados do Planalto (impressos em 23/09/2026) e o DOU.
>
> - **Ação penal.** Corrigidas quatro espécies contra a lei (LPI, art. 199; CP, arts. 167 e 153). Declaradas as condições do art. 182 do CP, das representações e requisições dos crimes contra a honra (com a Súmula 714 do STF) e da Lei 9.609. A ação penal do estelionato passa a variar com a data do fato: condicionada à representação de 23/01/2020 a 03/05/2026 (e, em processos sem trânsito, para fatos anteriores: STF, HC 208.817 AgR), incondicionada a partir de 04/05/2026 (Lei 15.397). Todo registro passa a dizer de onde vem a sua ação penal.
> - **Violência e grave ameaça.** O catálogo passa a declarar a condição quando a violência é só um dos meios do tipo (campo novo `violencia_condicao`): sequestro, constrangimento, tráfico de pessoas, fraudes em licitação e arrematação, resistência e outros. Corrigidos registros que afirmavam violência sem base no texto e tipos de perigo que tinham valores incoerentes entre si.
> - **Elemento subjetivo e tentativa.** Nova régua: preterdoloso quando a lei exclui o dolo no resultado ou quando o resultado doloso é outro crime; "qualificado pelo resultado" (dolo ou culpa no resultado) no latrocínio, na extorsão e no estupro com resultado, que passam a admitir tentativa.
> - **Hediondez.** Retirada de quatro formas do roubo que não estão no rol; varredura completa do Código Penal Militar pelo critério de identidade da Lei 8.072, art. 1º, parágrafo único, VI, com condições padronizadas e fundamentadas.
> - **Leis de 2026.** Lei 15.517 (furto, roubo e receptação de combustíveis: sete registros novos, *in pejus*); Lei 15.348 (supressão de hipóteses do art. 1º, II, da Lei 8.176: *abolitio* parcial); datas de publicação e vigência conferidas no DOU; progressão (Leis 15.358 e 15.402) calculada pela data do fato; aviso das ADIs 7966 a 7969 e 7985.
> - **Outros.** ANPP no crime militar calculado com divergência declarada; aviso do Tema 506 do STF no porte de cannabis para consumo; revogação tácita do art. 151, caput e § 1º, I, do CP pela Lei 6.538/78; uma duplicata aposentada (id 559 → 1508).

---

## 10. O que fica fora desta release

| Item | Situação | O que falta |
|---|---|---|
| **Decisão 19** (crimes de atentado: tentativa "Não" em 15 registros: 290, 309, 310, 496, 529, 678, 716, 720, 783, 1016, 1060, 1116, 1117, 1135, 1239) | **Pendente.** Ficou fora da ordem de lotes do roteiro | Doutrina nomeada com obra, edição e página. Até lá, não aplicar. Os registros novos do CPM 244, §§ 1º e 2º, nascem com a tentativa do id 1116 e entram nesta decisão |
| Decisão 4 (CP 217-A) | Grau B: "Sim" mantido, com nota | Jurisprudência sobre violência e benefícios no art. 217-A |
| C14 (id 641, `vigencia_ate` 1962-08-27) | Grau B: não muda | Texto original de 1962 do art. 70 da Lei 4.117. O compilado só mostra a redação do DL 236/1967 |
| STJ, Súmula 471 (decisão 35) | Citada como apoio; não conferida | Conferir no portal do STJ. A decisão se sustenta no CP 2º, par. único, e na CF, art. 5º, XL |
| IRDR 7000457-17.2023.7.00.0000 (STM) | Não conferido | Conferir antes de citar no aviso da decisão 25 |
| Tema 506 | Data do julgamento não conferida | Conferir no portal do STF |
| LC 225/2026 | Vigência escalonada | Conferir o artigo de vigência para os arts. 168-A e 337-A do CP |
| CPM, art. 408 | Remete ao art. 233, revogado pela Lei 14.688/2023 | Registrar no `obs` do id 1294 que a remissão válida é ao art. 232 |
| CPM compilado | Última alteração anotada: Lei 14.688/2023 | Confirmar que nenhuma lei de 2024 a 2026 alterou o CPM |
| Decisão 29 (varredura contínua) | Feita para esta release | Voltar a ela quando o rol ou o CPM mudar |

---

# Anexo A — Mudanças por (id, campo)

Formato: `{"textos": {chave: texto}, "mudancas": [{"id", "campo", "de", "para" | "para_texto", "decisao"}]}`.
- `para_texto` aponta para uma chave de `textos`.
- `para: null` significa **esvaziar o campo**: o campo fica sem valor, e nada é apagado do registro.
- Quando `de` é longo, aparece truncado com "…". Nesse caso, compare só o prefixo.
- `campo: "(aposentar)"` é tratado pela etapa 5, não pelo aplicador.

```json
{
 "textos": {
  "T01": "Condicionada à representação se o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita (CP, art. 182); a regra não se aplica ao estranho que participa do crime nem quando a vítima tem 60 anos ou mais (CP, art. 183, II e III).",
  "T02": "Fatos até 03/05/2026: condicionada à representação (CP, art. 171, § 5º, redação da Lei 13.964/2019, vigente desde 23/01/2020), salvo se a vítima for a Administração Pública, direta ou indireta; criança ou adolescente; pessoa com deficiência mental (pessoa com deficiência, a partir de 03/10/2025 — Lei 15.229/2025); maior de 70 anos ou incapaz. A exigência alcança fatos anteriores a 23/01/2020 em processos sem trânsito em julgado (STF, HC 208.817 AgR, Plenário, 2023). Fatos a partir de 04/05/2026: incondicionada (Lei 15.397/2026, art. 3º). Em qualquer data: condicionada à representação se o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita (CP, art. 182); a regra não se aplica ao estranho que participa do crime nem quando a vítima tem 60 anos ou mais (CP, art. 183, II e III).",
  "T03": "Mediante requisição do Ministro da Justiça se o crime é cometido contra o Presidente da República ou chefe de governo estrangeiro (CP, art. 141, I, c/c art. 145, parágrafo único); mediante representação se contra funcionário público em razão de suas funções ou contra os Presidentes do Senado Federal, da Câmara dos Deputados ou do Supremo Tribunal Federal (art. 141, II, c/c art. 145, parágrafo único), com legitimidade concorrente do ofendido mediante queixa (STF, Súmula 714).",
  "T04": "Hediondo somente quando praticada a lesão gravíssima (a) contra autoridade ou agente descrito nos arts. 142 e 144 da Constituição, integrante do sistema prisional ou da Força Nacional de Segurança Pública, no exercício da função ou em decorrência dela, ou contra seu cônjuge, companheiro ou parente consanguíneo até o terceiro grau, em razão dessa condição; (b) contra membro do Poder Judiciário, do Ministério Público, da Defensoria Pública ou da Advocacia Pública, ou oficial de justiça, nas mesmas condições; ou (c) nas dependências de instituição de ensino. Fundamento: Lei 8.072, art. 1º, I-A.",
  "T05": "Hediondo somente quando cometido contra criança ou adolescente. Fundamento: Lei 8.072, art. 1º, XII.",
  "T06": "Hediondo somente quando praticada contra autoridade ou agente descrito nos arts. 142 e 144 da Constituição, integrante do sistema prisional ou da Força Nacional de Segurança Pública, no exercício da função ou em decorrência dela, ou contra seu cônjuge, companheiro ou parente consanguíneo até o terceiro grau, em razão dessa condição. Fundamento: Lei 8.072, art. 1º, I-A, a, c/c parágrafo único, VI.",
  "T07": "Pública incondicionada quando praticado em prejuízo de entidade de direito público, autarquia, empresa pública, sociedade de economia mista ou fundação instituída pelo poder público (Lei 9.609/98, art. 12, § 3º, I), ou quando resultar sonegação fiscal, perda de arrecadação tributária ou crime contra a ordem tributária ou contra as relações de consumo (§ 3º, II).",
  "T08": "Sim nas hipóteses do art. 1º, I e II (emprego de violência ou grave ameaça); Não no § 1º e no inciso III (Lei 9.455/97, art. 1º, § 3º).",
  "T09": "REVOGADO TACITAMENTE pelo art. 40 da Lei 6.538/78 (caput e § 1º), que regula inteiramente a matéria (LINDB, art. 2º, § 1º). Lei 6.538 em vigor na data da publicação (art. 49; DOU 23/06/1978).",
  "T10": "Hediondo somente nos incisos I (quando a arma empregada é de fogo), V, VI e VIII do § 2º do art. 242 do CPM. Fundamento: Lei 8.072, art. 1º, parágrafo único, VI, c/c art. 1º, II, a, b e c.",
  "T11": "Hediondo somente quando incide o inciso V, VI ou VIII do § 2º do art. 242 do CPM (lesão grave dolosa, morte ou restrição da liberdade). Fundamento: Lei 8.072, art. 1º, parágrafo único, VI, c/c art. 1º, III.",
  "T12": "Hediondo somente quando praticado em atividade típica de grupo de extermínio, ainda que por um só agente. Fundamento: Lei 8.072, art. 1º, I, c/c parágrafo único, VI.",
  "T13": "Hediondo somente quando realizado por meio da rede de computadores, de rede social ou transmitido em tempo real. Fundamento: Lei 8.072, art. 1º, X.",
  "T14": "Hediondo somente quando praticada a lesão corporal seguida de morte (a) contra autoridade ou agente descrito nos arts. 142 e 144 da Constituição, integrante do sistema prisional ou da Força Nacional de Segurança Pública, no exercício da função ou em decorrência dela, ou contra seu cônjuge, companheiro ou parente consanguíneo até o terceiro grau, em razão dessa condição; (b) contra membro do Poder Judiciário, do Ministério Público, da Defensoria Pública ou da Advocacia Pública, ou oficial de justiça, nas mesmas condições; ou (c) nas dependências de instituição de ensino. Fundamento: Lei 8.072, art. 1º, I-A.",
  "T15": "Hediondo somente quando a organização criminosa é direcionada à prática de crime hediondo ou equiparado. Fundamento: Lei 8.072, art. 1º, parágrafo único, V."
 },
 "mudancas": [
  {
   "id": 1425,
   "campo": "acao",
   "de": "Pública Incondicionada",
   "para": "Ação Penal Privada",
   "decisao": "C3"
  },
  {
   "id": 1426,
   "campo": "acao",
   "de": "Pública Incondicionada",
   "para": "Ação Penal Privada",
   "decisao": "C3"
  },
  {
   "id": 604,
   "campo": "acao",
   "de": "Pública Incondicionada",
   "para": "Ação Penal Privada",
   "decisao": "C4"
  },
  {
   "id": 120,
   "campo": "acao_condicao",
   "de": null,
   "para": "Ação penal privada (queixa) na hipótese do inciso IV — motivo egoístico ou prejuízo considerável para a vítima (CP, art. 167).",
   "decisao": "C4/16"
  },
  {
   "id": 80,
   "campo": "acao",
   "de": "Pública Incondicionada",
   "para": "Pública Condicionada à Representação",
   "decisao": "C5"
  },
  {
   "id": 80,
   "campo": "acao_condicao",
   "de": "Incondicionada quando resulta prejuízo para a Administração Pública (CP, art. 153, §2º); nas demais hipóteses, condicionada a representaç…",
   "para": "Incondicionada quando resultar prejuízo para a Administração Pública (CP, art. 153, § 2º).",
   "decisao": "C5"
  },
  {
   "id": 495,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 311,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 221,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 495,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 311,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 221,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 253,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 695,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7"
  },
  {
   "id": 695,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Culposo",
   "decisao": "C7"
  },
  {
   "id": 695,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "C7 (decorre: culposo)"
  },
  {
   "id": 100,
   "campo": "hediondo",
   "de": "Sim",
   "para": "Não",
   "decisao": "C12"
  },
  {
   "id": 101,
   "campo": "hediondo",
   "de": "Sim",
   "para": "Não",
   "decisao": "C12"
  },
  {
   "id": 812,
   "campo": "hediondo",
   "de": "Sim",
   "para": "Não",
   "decisao": "C12"
  },
  {
   "id": 588,
   "campo": "hediondo",
   "de": "Sim",
   "para": "Não",
   "decisao": "C12"
  },
  {
   "id": 69,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 69,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 69,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, caput).",
   "decisao": "1a"
  },
  {
   "id": 70,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 70,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 70,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º).",
   "decisao": "1a"
  },
  {
   "id": 71,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 71,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 71,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §2º).",
   "decisao": "1a"
  },
  {
   "id": 1315,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 1315,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 1315,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §3º).",
   "decisao": "1a"
  },
  {
   "id": 621,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 621,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º, I).",
   "decisao": "1a"
  },
  {
   "id": 622,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 622,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º, II).",
   "decisao": "1a"
  },
  {
   "id": 623,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 623,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º, III).",
   "decisao": "1a"
  },
  {
   "id": 624,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 624,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º, IV).",
   "decisao": "1a"
  },
  {
   "id": 625,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 625,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, Art. 148, §1º, V).",
   "decisao": "1a"
  },
  {
   "id": 750,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CPM, Art. 225, caput).",
   "decisao": "1a"
  },
  {
   "id": 1095,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1a"
  },
  {
   "id": 1095,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CPM, Art. 225, §2º).",
   "decisao": "1a"
  },
  {
   "id": 1096,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CPM, Art. 225, §3º).",
   "decisao": "1a"
  },
  {
   "id": 110,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 110,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, caput).",
   "decisao": "1b"
  },
  {
   "id": 111,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 111,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §1º).",
   "decisao": "1b"
  },
  {
   "id": 112,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 112,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §2º).",
   "decisao": "1b"
  },
  {
   "id": 113,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 113,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §3º).",
   "decisao": "1b"
  },
  {
   "id": 114,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 114,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §4º).",
   "decisao": "1b"
  },
  {
   "id": 1483,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1483,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §4º c/c §1º).",
   "decisao": "1b"
  },
  {
   "id": 1484,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1484,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §4º c/c §2º).",
   "decisao": "1b"
  },
  {
   "id": 1485,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1485,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CP, Art. 159, §4º c/c §3º).",
   "decisao": "1b"
  },
  {
   "id": 1116,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, Art. 244, caput).",
   "decisao": "1b"
  },
  {
   "id": 1447,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1447,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, Art. 405 c/c art. 244, caput).",
   "decisao": "1b"
  },
  {
   "id": 1448,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1448,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, Art. 405 c/c art. 244, §1º).",
   "decisao": "1b"
  },
  {
   "id": 1449,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "1b"
  },
  {
   "id": 1449,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, Art. 405 c/c art. 244, §2º).",
   "decisao": "1b"
  },
  {
   "id": 561,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "3"
  },
  {
   "id": 562,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "3"
  },
  {
   "id": 561,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a remoção é feita em pessoa viva (Lei 9.434/97, art. 14).",
   "decisao": "3"
  },
  {
   "id": 562,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a remoção é feita em pessoa viva (Lei 9.434/97, art. 14).",
   "decisao": "3"
  },
  {
   "id": 989,
   "campo": "violencia",
   "de": "Não",
   "para": "Sim",
   "decisao": "3"
  },
  {
   "id": 722,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "5"
  },
  {
   "id": 723,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "5"
  },
  {
   "id": 724,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "5"
  },
  {
   "id": 1462,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 1463,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 1472,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 1473,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 1461,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 1461,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "6"
  },
  {
   "id": 65,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 65,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 65,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 146).",
   "decisao": "8"
  },
  {
   "id": 73,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 73,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 73,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A).",
   "decisao": "8"
  },
  {
   "id": 635,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 635,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 635,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A, I).",
   "decisao": "8"
  },
  {
   "id": 636,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 636,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 636,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A, II).",
   "decisao": "8"
  },
  {
   "id": 637,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 637,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 637,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A, III).",
   "decisao": "8"
  },
  {
   "id": 638,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A, IV).",
   "decisao": "8"
  },
  {
   "id": 639,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 149-A, V).",
   "decisao": "8"
  },
  {
   "id": 734,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 734,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 734,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 146, §1º).",
   "decisao": "8"
  },
  {
   "id": 747,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 747,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 747,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CPM, Art. 222, caput).",
   "decisao": "8"
  },
  {
   "id": 277,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 277,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 277,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 335).",
   "decisao": "8"
  },
  {
   "id": 312,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 312,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 312,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 359-P).",
   "decisao": "8"
  },
  {
   "id": 790,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 790,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 790,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim nas hipóteses do art. 2º, § 1º, V, e quando os atos dos incisos I e IV forem praticados com violência à pessoa ou grave ameaça (Lei 13.260/16, art. 2º, § 1º).",
   "decisao": "8"
  },
  {
   "id": 386,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 386,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 386,
   "campo": "violencia_condicao",
   "de": null,
   "para_texto": "T08",
   "decisao": "8"
  },
  {
   "id": 387,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 387,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 387,
   "campo": "violencia_condicao",
   "de": null,
   "para_texto": "T08",
   "decisao": "8"
  },
  {
   "id": 75,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 75,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 75,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando há emprego de violência (CP, art. 150, § 1º).",
   "decisao": "8"
  },
  {
   "id": 283,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 283,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 283,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando há emprego de violência (CP, art. 345, parágrafo único).",
   "decisao": "8"
  },
  {
   "id": 1234,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1234,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1234,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CPM, Art. 358, caput).",
   "decisao": "8"
  },
  {
   "id": 547,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 547,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 547,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (Lei 1.579/52, Art. 4º, I).",
   "decisao": "8"
  },
  {
   "id": 1053,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1053,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1053,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CPM, Art. 177, caput).",
   "decisao": "8"
  },
  {
   "id": 1054,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1054,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1054,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CPM, Art. 177, §1º).",
   "decisao": "8"
  },
  {
   "id": 1055,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1055,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1055,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CPM, Art. 177, §1º-A).",
   "decisao": "8"
  },
  {
   "id": 154,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 154,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim somente quando a violência é praticada contra a pessoa, e não contra a coisa (CP, art. 200).",
   "decisao": "8"
  },
  {
   "id": 120,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 120,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim no inciso I — violência à pessoa ou grave ameaça (CP, art. 163, parágrafo único, I).",
   "decisao": "8"
  },
  {
   "id": 157,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 203).",
   "decisao": "8"
  },
  {
   "id": 158,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 204).",
   "decisao": "8"
  },
  {
   "id": 296,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 358).",
   "decisao": "8"
  },
  {
   "id": 496,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 337-K).",
   "decisao": "8"
  },
  {
   "id": 1343,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 227, § 2º).",
   "decisao": "8"
  },
  {
   "id": 1345,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 228, § 2º).",
   "decisao": "8"
  },
  {
   "id": 1347,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 230, § 2º).",
   "decisao": "8"
  },
  {
   "id": 1397,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (ECA, Art. 239, parágrafo único).",
   "decisao": "8"
  },
  {
   "id": 479,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (Lei 14.811/24, Art. 146-A, caput (CP)).",
   "decisao": "8"
  },
  {
   "id": 480,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (Lei 14.811/24, Art. 146-A, §único (CP)).",
   "decisao": "8"
  },
  {
   "id": 72,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 72,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 72,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a redução à condição análoga à de escravo é executada ou mantida mediante violência à pessoa ou grave ameaça (CP, art. 149).",
   "decisao": "8"
  },
  {
   "id": 871,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 871,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (Lei 14.597/23, Art. 201).",
   "decisao": "8"
  },
  {
   "id": 1402,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1402,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1402,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (Lei 15.358/26, Art. 2º, caput).",
   "decisao": "8"
  },
  {
   "id": 267,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 267,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 267,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 329).",
   "decisao": "8"
  },
  {
   "id": 1374,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1374,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "8"
  },
  {
   "id": 1374,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for violência à pessoa ou grave ameaça (CP, Art. 329, § 1º).",
   "decisao": "8"
  },
  {
   "id": 513,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "9"
  },
  {
   "id": 513,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a ameaça empregada for grave (CDC, Art. 71).",
   "decisao": "9"
  },
  {
   "id": 1508,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "9"
  },
  {
   "id": 1508,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a ameaça empregada for grave (CE, Art. 326-B).",
   "decisao": "9"
  },
  {
   "id": 67,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "9"
  },
  {
   "id": 67,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a ameaça empregada for grave (CP, Art. 147-A).",
   "decisao": "9"
  },
  {
   "id": 578,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "9"
  },
  {
   "id": 578,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a ameaça empregada for grave (CP, Art. 147-A, §1º, III).",
   "decisao": "9"
  },
  {
   "id": 428,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a ameaça empregada for grave (Lei 13.869/19, Art. 15).",
   "decisao": "9"
  },
  {
   "id": 156,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 292,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 351,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 579,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 1327,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 768,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 906,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 1455,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 671,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 1455,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 671,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 291,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 291,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 291,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o arrebatamento é executado mediante violência à pessoa ou grave ameaça (CP, art. 353).",
   "decisao": "7"
  },
  {
   "id": 1118,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 1267,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 1267,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a coação é exercida mediante violência à pessoa ou grave ameaça (CPM, art. 388).",
   "decisao": "7"
  },
  {
   "id": 475,
   "campo": "grave_ameaca",
   "de": "Sim",
   "para": "Não",
   "decisao": "7"
  },
  {
   "id": 475,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando a coação é exercida mediante violência à pessoa ou grave ameaça (Lei 10.741/03, art. 107).",
   "decisao": "7"
  },
  {
   "id": 1479,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1480,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 54,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 54,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, caput).",
   "decisao": "10"
  },
  {
   "id": 55,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 55,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, §1º).",
   "decisao": "10"
  },
  {
   "id": 56,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 56,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, §2º).",
   "decisao": "10"
  },
  {
   "id": 57,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 57,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, §3º).",
   "decisao": "10"
  },
  {
   "id": 1481,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1481,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, §3º c/c §1º).",
   "decisao": "10"
  },
  {
   "id": 1482,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1482,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CP, Art. 136, §3º c/c §2º).",
   "decisao": "10"
  },
  {
   "id": 1089,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1089,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CPM, Art. 213, caput).",
   "decisao": "10"
  },
  {
   "id": 1090,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1090,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CPM, Art. 213, §1º).",
   "decisao": "10"
  },
  {
   "id": 1091,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1091,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CPM, Art. 213, §2º).",
   "decisao": "10"
  },
  {
   "id": 1080,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "10"
  },
  {
   "id": 1080,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o abuso dos meios de correção ou disciplina, ou os maus-tratos, envolvem violência física (CPM, Art. 207, §2º).",
   "decisao": "10"
  },
  {
   "id": 68,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o meio empregado for ameaça grave (CP, art. 147-B).",
   "decisao": "11"
  },
  {
   "id": 1332,
   "campo": "violencia",
   "de": "Sim",
   "para": "Não",
   "decisao": "11"
  },
  {
   "id": 1332,
   "campo": "violencia_condicao",
   "de": null,
   "para": "Sim quando o sofrimento físico é infligido mediante agressão (Lei 9.455/97, art. 1º, III).",
   "decisao": "11"
  },
  {
   "id": 86,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 87,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 88,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 89,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 90,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 91,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 92,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 93,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 122,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 123,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 129,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 130,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 131,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 132,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 576,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 582,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 583,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 584,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 585,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 586,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 587,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 815,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 816,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 820,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 994,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 995,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 996,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 997,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 998,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 999,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 1000,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 1316,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 1341,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T01",
   "decisao": "12"
  },
  {
   "id": 127,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 128,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 580,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 589,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 590,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 591,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 592,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 593,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 594,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T02",
   "decisao": "12+33"
  },
  {
   "id": 595,
   "campo": "acao_condicao",
   "de": null,
   "para": "Fatos até 03/05/2026: condicionada à representação quando a vítima é instituto de economia popular, assistência social ou beneficência (CP, art. 171, §§ 3º e 5º, redação da Lei 13.964/2019); incondicionada quando é entidade de direito público. Fatos a partir de 04/05/2026: incondicionada (Lei 15.397/2026).",
   "decisao": "33"
  },
  {
   "id": 58,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 59,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 730,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 60,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 63,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 64,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 1504,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 1505,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T03",
   "decisao": "13/15"
  },
  {
   "id": 61,
   "campo": "acao_condicao",
   "de": "Pública incondicionada quando da violência resulta lesão corporal (CP, art. 145, caput); nas demais hipóteses, privada.",
   "para": "Pública quando da violência resulta lesão corporal (CP, art. 145, caput): condicionada à representação se a lesão é leve (Lei 9.099/95, art. 88) e incondicionada se grave ou gravíssima. Nas demais hipóteses: mediante requisição do Ministro da Justiça se o crime é cometido contra o Presidente da República ou chefe de governo estrangeiro (CP, art. 141, I, c/c art. 145, parágrafo único); mediante representação se contra funcionário público em razão de suas funções ou contra os Presidentes do Senado Federal, da Câmara dos Deputados ou do Supremo Tribunal Federal (art. 141, II, c/c art. 145, parágrafo único), com legitimidade concorrente do ofendido mediante queixa (STF, Súmula 714).",
   "decisao": "15"
  },
  {
   "id": 539,
   "campo": "acao_condicao",
   "de": null,
   "para_texto": "T07",
   "decisao": "17"
  },
  {
   "id": 540,
   "campo": "acao_condicao",
   "de": "Privada, salvo quando praticado em prejuízo de entidade de direito público, empresa pública, sociedade de economia mista ou fundação (Lei…",
   "para_texto": "T07",
   "decisao": "17"
  },
  {
   "id": 541,
   "campo": "acao_condicao",
   "de": "Privada, salvo quando praticado em prejuízo de entidade de direito público, empresa pública, sociedade de economia mista ou fundação (Lei…",
   "para_texto": "T07",
   "decisao": "17"
  },
  {
   "id": 76,
   "campo": "vigencia_ate",
   "de": null,
   "para": "1978-06-23",
   "decisao": "34"
  },
  {
   "id": 77,
   "campo": "vigencia_ate",
   "de": null,
   "para": "1978-06-23",
   "decisao": "34"
  },
  {
   "id": 76,
   "campo": "vigencia_nota",
   "de": null,
   "para_texto": "T09",
   "decisao": "34"
  },
  {
   "id": 77,
   "campo": "vigencia_nota",
   "de": null,
   "para_texto": "T09",
   "decisao": "34"
  },
  {
   "id": 1494,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1496,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1499,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1503,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1314,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1083,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1082,
   "campo": "elemento",
   "de": "Culposo",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1287,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1389,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 30,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 31,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1488,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1489,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1479,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1480,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1481,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1482,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1338,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1339,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1087,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1088,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1090,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1091,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 982,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 983,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 985,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 986,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 989,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Preterdoloso",
   "decisao": "31 (A/B)"
  },
  {
   "id": 1494,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1496,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1499,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1503,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1083,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1287,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1389,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 30,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 31,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1488,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1489,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1479,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1480,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1481,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1482,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1338,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1339,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1087,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1088,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1090,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 1091,
   "campo": "tentativa",
   "de": "Sim",
   "para": "Não",
   "decisao": "20"
  },
  {
   "id": 104,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 105,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 108,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 112,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 113,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1317,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 817,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 818,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1490,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1484,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1485,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1452,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1443,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1454,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1446,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31 (C)"
  },
  {
   "id": 1317,
   "campo": "tentativa",
   "de": "Não",
   "para": "Sim",
   "decisao": "20"
  },
  {
   "id": 134,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 609,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 135,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 141,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 142,
   "campo": "elemento",
   "de": "Preterdoloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 1104,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 1105,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 1295,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 1296,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D"
  },
  {
   "id": 1292,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1293,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1038,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1040,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1055,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1095,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1096,
   "campo": "elemento",
   "de": "Doloso",
   "para": "Qualificado pelo resultado",
   "decisao": "31-D2"
  },
  {
   "id": 1081,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1282,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1294,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1295,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1296,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1447,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1448,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1449,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1281,
   "campo": "hediondo",
   "de": "Não",
   "para": "Sim",
   "decisao": "29"
  },
  {
   "id": 1451,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T10",
   "decisao": "29"
  },
  {
   "id": 1442,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T10",
   "decisao": "29"
  },
  {
   "id": 1453,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T11",
   "decisao": "29"
  },
  {
   "id": 1445,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T11",
   "decisao": "29"
  },
  {
   "id": 1289,
   "campo": "hediondo_condicao",
   "de": null,
   "para": "Hediondo nas formas que correspondem às hediondas do tempo de paz: roubo com arma de fogo, lesão grave dolosa, morte ou restrição da liberdade; extorsão com lesão grave, morte ou restrição da liberdade; extorsão mediante sequestro. Fundamento: Lei 8.072, art. 1º, parágrafo único, VI, c/c art. 1º, II, III e IV.",
   "decisao": "29"
  },
  {
   "id": 1283,
   "campo": "hediondo_condicao",
   "de": null,
   "para": "Hediondo nas hipóteses dos incisos I, II, IV e V do parágrafo único do art. 208 do CPM; não no inciso III (dispersão do grupo), sem correspondente na Lei 2.889/56. Fundamento: Lei 8.072, art. 1º, parágrafo único, I e VI.",
   "decisao": "29"
  },
  {
   "id": 692,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T12",
   "decisao": "29"
  },
  {
   "id": 1280,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T12",
   "decisao": "29"
  },
  {
   "id": 699,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T06",
   "decisao": "29"
  },
  {
   "id": 1083,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T06",
   "decisao": "29"
  },
  {
   "id": 1286,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T06",
   "decisao": "29"
  },
  {
   "id": 1389,
   "campo": "hediondo_condicao",
   "de": null,
   "para_texto": "T06",
   "decisao": "29"
  },
  {
   "id": 1,
   "campo": "hediondo_condicao",
   "de": "Só quando praticado em atividade típica de grupo de extermínio. Fundamento: Lei 8.072, art. 1º, I.",
   "para": "Hediondo somente quando praticado em atividade típica de grupo de extermínio, ainda que por um só agente. Fundamento: Lei 8.072, art. 1º, I.",
   "decisao": "28"
  },
  {
   "id": 20,
   "campo": "hediondo_condicao",
   "de": "Só na modalidade praticada por rede de computadores ou transmissão em tempo real. Fundamento: Lei 8.072, art. 1º, X.",
   "para_texto": "T13",
   "decisao": "28"
  },
  {
   "id": 24,
   "campo": "hediondo_condicao",
   "de": "Só na modalidade praticada por rede de computadores ou transmissão em tempo real. Fundamento: Lei 8.072, art. 1º, X.",
   "para_texto": "T13",
   "decisao": "28"
  },
  {
   "id": 34,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 630,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 631,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 632,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 633,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 634,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T04",
   "decisao": "28"
  },
  {
   "id": 35,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T14",
   "decisao": "28"
  },
  {
   "id": 1314,
   "campo": "hediondo_condicao",
   "de": "Lesão gravíssima e seguida de morte, só nas hipóteses das alíneas a, b e c (vítima qualificada ou dependências de instituição de ensino).…",
   "para_texto": "T14",
   "decisao": "28"
  },
  {
   "id": 73,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 635,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 636,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 637,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 638,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 639,
   "campo": "hediondo_condicao",
   "de": "Hediondo apenas quando cometido contra criança ou adolescente (art. 1º, XII), pois o tipo, sozinho, não decide. Fundamento: Lei 8.072, ar…",
   "para_texto": "T05",
   "decisao": "28"
  },
  {
   "id": 388,
   "campo": "hediondo_condicao",
   "de": "Só quando a organização é direcionada à prática de crime hediondo ou equiparado, circunstância do caso. Fundamento: Lei 8.072, art. 1º, §…",
   "para_texto": "T15",
   "decisao": "28"
  },
  {
   "id": 671,
   "campo": "hediondo_condicao",
   "de": "Só quando a organização é direcionada à prática de crime hediondo ou equiparado, circunstância do caso. Fundamento: Lei 8.072, art. 1º, §…",
   "para_texto": "T15",
   "decisao": "28"
  },
  {
   "id": 1457,
   "campo": "hediondo_condicao",
   "de": "Somente quando a arma empregada é de fogo: o rol (Lei 8.072/90, art. 1º, II, b) alcança o roubo pelo emprego de arma de fogo, e o art. 24…",
   "para": "Hediondo somente quando a arma empregada é de fogo. Fundamento: Lei 8.072, art. 1º, parágrafo único, VI, c/c art. 1º, II, b.",
   "decisao": "28"
  },
  {
   "id": 320,
   "campo": "hediondo_condicao",
   "de": "Maquinário: o STJ tem decisões nos dois sentidos sobre a equiparação, e a classificação é escolha do projeto, não leitura de texto. Funda…",
   "para": null,
   "decisao": "28 (sai da condição)"
  },
  {
   "id": 323,
   "campo": "hediondo_condicao",
   "de": "Informante/colaborador: a equiparação é reconhecida por parte da jurisprudência e negada por outra, e a classificação é decisão do projet…",
   "para": null,
   "decisao": "28 (sai da condição)"
  },
  {
   "id": 385,
   "campo": "hediondo_condicao",
   "de": "Omissão perante a tortura: pena própria de detenção, e a doutrina diverge sobre estender a equiparação. Fundamento: CF, art. 5º, XLIII (e…",
   "para": null,
   "decisao": "28 (sai da condição)"
  },
  {
   "id": 320,
   "campo": "hediondo_nota",
   "de": null,
   "para": "Divergência jurisprudencial sobre a equiparação do art. 34 da Lei 11.343/06 a crime hediondo (CF, art. 5º, XLIII). O catálogo publica 'Não' até precedente vinculante.",
   "decisao": "28"
  },
  {
   "id": 323,
   "campo": "hediondo_nota",
   "de": null,
   "para": "Divergência jurisprudencial sobre a equiparação do art. 37 da Lei 11.343/06 a crime hediondo (CF, art. 5º, XLIII). O catálogo publica 'Não' até precedente vinculante.",
   "decisao": "28"
  },
  {
   "id": 385,
   "campo": "hediondo_nota",
   "de": null,
   "para": "Divergência doutrinária sobre estender a equiparação da tortura (CF, art. 5º, XLIII) à omissão do § 2º, que tem pena própria de detenção. O catálogo publica 'Não'.",
   "decisao": "28"
  },
  {
   "id": 1306,
   "campo": "hediondo_condicao",
   "de": "O rol remete ao §2º; o §2º-D é parágrafo próprio, criado depois. Alcance a definir. Fundamento: Lei 8.072, art. 1º, I.",
   "para": null,
   "decisao": "28"
  },
  {
   "id": 1306,
   "campo": "hediondo_nota",
   "de": null,
   "para": "O rol (Lei 8.072, art. 1º, I) alcança o homicídio qualificado do § 2º; o § 2º-D, incluído pela Lei 15.358/2026, é parágrafo autônomo e não foi acrescentado ao rol.",
   "decisao": "28"
  },
  {
   "id": 559,
   "campo": "(aposentar)",
   "de": null,
   "para": "→ 1508",
   "decisao": "C13"
  }
 ]
}
```

---

# Anexo B — Registros novos

Os ids são atribuídos pela regra do item 0.3. Os campos seguem o esquema atual, mais os campos novos do item 2. A multa cumulativa fica anotada em `obs`, como no catálogo.

```json
[
 {
  "lei": "CP",
  "artigo": "Art. 155, §10",
  "crime": "Furto de combustível de instalação de produção, armazenamento ou transporte",
  "pena_min": 48,
  "pena_max": 120,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": "Condicionada à representação se o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita (CP, art. 182); a regra não se aplica ao estranho que participa do crime nem quando a vítima tem 60 anos ou mais (CP, art. 183, II e III).",
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "4-10 anos reclusão + multa. Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "CP",
  "artigo": "Art. 155, §11 c/c §10",
  "crime": "Furto de combustível com aumento de 1/3 (dano ou rompimento de obstáculo, concurso, abuso de confiança ou agente público)",
  "pena_min": 64,
  "pena_max": 160,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": "Condicionada à representação se o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita (CP, art. 182); a regra não se aplica ao estranho que participa do crime nem quando a vítima tem 60 anos ou mais (CP, art. 183, II e III).",
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "§ 10 aumentado de 1/3 (incisos I a IV do § 11). Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "CP",
  "artigo": "Art. 155, §12 c/c §10",
  "crime": "Furto de combustível com aumento de 2/3 (suspensão das atividades, desabastecimento, incêndio, poluição, lesão grave ou morte)",
  "pena_min": 80,
  "pena_max": 200,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": "Condicionada à representação se o crime é cometido em prejuízo de cônjuge desquitado ou judicialmente separado, de irmão, ou de tio ou sobrinho com quem o agente coabita (CP, art. 182); a regra não se aplica ao estranho que participa do crime nem quando a vítima tem 60 anos ou mais (CP, art. 183, II e III).",
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Qualificado pelo resultado",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "§ 10 aumentado de 2/3 (incisos I a VI do § 12). Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "CP",
  "artigo": "Art. 157, §2º, XI",
  "crime": "Roubo majorado — subtração de combustível de instalação de produção, armazenamento ou transporte",
  "pena_min": 96,
  "pena_max": 180,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "violencia_condicao": null,
  "obs": "Caput (6-10 anos) aumentado de 1/3 até metade. Não hediondo: o rol (Lei 8.072, art. 1º, II) não alcança o inciso XI. Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "CP",
  "artigo": "Art. 157, §2º-A, III",
  "crime": "Roubo majorado — de combustível, com suspensão das atividades, desabastecimento, incêndio ou poluição",
  "pena_min": 120,
  "pena_max": 200,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Qualificado pelo resultado",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "violencia_condicao": null,
  "obs": "Caput aumentado de 2/3 (alíneas a a d; a alínea e foi vetada). Não hediondo: o rol alcança só o § 2º-A, I. Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "Lei 8.176/91",
  "artigo": "Art. 1º-A",
  "crime": "Receptação de combustível no exercício de atividade comercial ou industrial",
  "pena_min": 36,
  "pena_max": 96,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "3-8 anos reclusão + multa. § 3º e art. 1º-C: efeitos da condenação (modificadores). Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "Lei 8.176/91",
  "artigo": "Art. 1º-B",
  "crime": "Receptação de combustível que deva presumir-se obtido por meio criminoso",
  "pena_min": 12,
  "pena_max": 48,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Culposo",
  "tentativa": "Não",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "1-4 anos reclusão + multa. § 1º (primário: redução de 1/3 a 2/3 ou dispensa da multa) vai para modificadores. Elemento culposo pela simetria com o CP 180, § 3º (grau M). Incluído pela Lei 15.517/2026 (DOU 23/09/2026, vigência na publicação). Decisão 38 da revisão de 23/09/2026."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 208, par. único",
  "crime": "Genocídio — casos assimilados (lesões graves, condições de existência, dispersão, impedimento de nascimentos, transferência de crianças)",
  "pena_min": 48,
  "pena_max": 180,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": "Hediondo somente nas hipóteses dos incisos I, II, IV e V; não no inciso III (dispersão do grupo), sem correspondente na Lei 2.889/56. Fundamento: Lei 8.072, art. 1º, parágrafo único, I e VI.",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": "Sim no inciso I (lesões graves a membros do grupo) (CPM, art. 208, parágrafo único, I).",
  "obs": "4-15 anos reclusão. Decisão 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 225, §1º",
  "crime": "Sequestro ou cárcere privado qualificado",
  "pena_min": 24,
  "pena_max": 60,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": "Hediondo somente quando a vítima é menor de 18 anos. Fundamento: Lei 8.072, art. 1º, XI, c/c parágrafo único, VI.",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa ou grave ameaça (CPM, art. 225, § 1º).",
  "obs": "2-5 anos reclusão (redação da Lei 14.688/2023). Decisões 1a e 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 242, §2º, V",
  "crime": "Roubo qualificado pela lesão grave causada dolosamente (tempo de paz)",
  "pena_min": 64,
  "pena_max": 270,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "violencia_condicao": null,
  "obs": "Caput (4-15 anos) aumentado de 1/3 até metade. Hediondo por identidade com o CP 157, § 3º (Lei 8.072, art. 1º, II, c, c/c parágrafo único, VI; grau M). Decisão 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 242, §2º, VI",
  "crime": "Roubo qualificado pela morte não querida pelo agente (tempo de paz)",
  "pena_min": 64,
  "pena_max": 270,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Preterdoloso",
  "tentativa": "Não",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "violencia_condicao": null,
  "obs": "Caput aumentado de 1/3 até metade; fórmula expressa de preterdolo. Hediondo por identidade com o CP 157, § 3º, II (grau M). Decisões 29 e 31."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 243, §1º c/c art. 242, §2º, V",
  "crime": "Extorsão qualificada pela lesão grave causada dolosamente (tempo de paz)",
  "pena_min": 64,
  "pena_max": 270,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "violencia_condicao": null,
  "obs": "Hediondo por identidade com o CP 158, § 3º (Lei 8.072, art. 1º, III, c/c parágrafo único, VI; grau M). Decisão 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 244, §1º",
  "crime": "Extorsão mediante sequestro qualificada (tempo de paz)",
  "pena_min": 96,
  "pena_max": 240,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Sim",
  "violencia_condicao": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, art. 244, § 1º).",
  "obs": "8-20 anos reclusão (mais de 24 horas; vítima menor de 16 ou maior de 60; mais de duas pessoas). Tentativa segue a decisão 19 (pendente), como o id 1116. Decisões 1b e 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 244, §2º",
  "crime": "Extorsão mediante sequestro — grave sofrimento físico ou moral (tempo de paz)",
  "pena_min": 96,
  "pena_max": 240,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Qualificado pelo resultado",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Sim",
  "violencia_condicao": "Sim quando a privação da liberdade é executada ou mantida mediante violência à pessoa (CPM, art. 244, § 2º).",
  "obs": "Caput (6-15 anos) aumentado de 1/3. Hediondo (grau M). Tentativa segue a decisão 19 (pendente). Decisões 1b, 29 e 31."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 292, §1º",
  "crime": "Epidemia com resultado morte",
  "pena_min": 120,
  "pena_max": 360,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Sim",
  "hediondo_condicao": null,
  "elemento": "Preterdoloso",
  "tentativa": "Não",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "Pena do caput (5-15 anos) em dobro, limitada a 30 anos (CPM, art. 58). Hediondo por identidade com o CP 267, § 1º (Lei 8.072, art. 1º, VII, c/c parágrafo único, VI). Elemento como o id 738 (família B). Decisões 29 e 31."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 292, §2º",
  "crime": "Epidemia culposa",
  "pena_min": 12,
  "pena_max": 24,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Culposo",
  "tentativa": "Não",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "Detenção de 1 a 2 anos. Decisão 29."
 },
 {
  "lei": "CPM (DL 1.001/69)",
  "artigo": "Art. 292, §2º (resultado morte)",
  "crime": "Epidemia culposa com resultado morte",
  "pena_min": 24,
  "pena_max": 48,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Culposo",
  "tentativa": "Não",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "Detenção de 2 a 4 anos. Decisão 29."
 },
 {
  "lei": "Lei 6.538/78",
  "artigo": "Art. 40, §1º",
  "crime": "Sonegação ou destruição de correspondência",
  "pena_min": 0,
  "pena_max": 6,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "acao_condicao": null,
  "hediondo": "Não",
  "hediondo_condicao": null,
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "violencia_condicao": null,
  "obs": "Detenção, até seis meses, ou pagamento não excedente a vinte dias-multa. Mínimo não cominado (decisão 24). Substitui o CP 151, § 1º, I (id 77), revogado tacitamente (decisão 34)."
 }
]
```

---

# Anexo C — Registro das decisões (23/09/2026)

Aberto em 23/09/2026, na sessão Cowork que continua o roteiro `revisao-fina.md` (revisado em 23/09/2026).

Cada linha registra uma resposta do Luccas ("n ok" ou "n não: …"). A leitura é a que ficou, não a recomendada. Grau B não é publicado. Páginas = página do PDF compilado impresso em 23/09/2026 na pasta `AtlasPen - revisão legislativa`.

## Parte 1 — correções conferidas no texto oficial

Aval em bloco do Luccas em 23/09/2026 ("Tem meu aval em todos os pontos até agora").

| data | correção | resultado | leitura adotada | grau | fundamento (diploma, dispositivo, página) | ids |
|---|---|---|---|---|---|---|
| 23/09/2026 | C1 | confirmada | "neste Capítulo" do art. 145 alcança só o Título I, Cap. V; os 20 registros saem da decisão 13 (valor publicado não muda). Auditor passa a resolver a referência pela cadeia Título > Capítulo > Seção | A | CP, art. 145 (p. 32); Título I, Cap. V (p. 30–32); Título II, Cap. V (p. 42); Título VI, Cap. V (p. 54–56); Título X, Cap. V (p. 71) | 124, 125, 126, 598, 599, 600, 167, 168, 169, 170, 549, 1002, 1342–1347, 245, 1368 |
| 23/09/2026 | C2 | confirmada, com ajuste | Roubo, extorsão e extorsão mediante sequestro: incondicionada sem condição (art. 183, I). "Extorsão" do inciso I lida pelo *nomen iuris* do Cap. II; por coerência o art. 160 (id 115) entra na decisão 12 como M. Condição dos 44 restantes: art. 182, com as exceções do art. 183, II e III; o inciso I do art. 182 é "cônjuge desquitado ou judicialmente separado" | A (157, 158, 159); M (160) | CP, arts. 182 e 183 (p. 47); art. 159 (p. 40); art. 160 (p. 41) | 95–114, 588, 596, 597, 811–814, 817, 818, 1317, 1483–1485, 1490; 115 |
| 23/09/2026 | C3 | confirmada | ids 1425 e 1426 → Ação Penal Privada; decisão 14 dissolvida; só o art. 191 (id 857) é público (incondicionada, CP art. 100) | A | Lei 9.279/96, art. 199 (p. 28), art. 184 (p. 25); CP, art. 100 (p. 19) | 1425, 1426 |
| 23/09/2026 | C4 | confirmada | id 604 → Ação Penal Privada; id 120 vai para a decisão 16 | A | CP, art. 163, par. único, IV, e art. 167 (p. 42) | 604; 120 |
| 23/09/2026 | C5 | confirmada | id 80: padrão "Pública Condicionada à Representação"; condição "incondicionada quando resultar prejuízo para a Administração Pública (§ 2º)" | A | CP, art. 153, §§ 1º, 1º-A e 2º (p. 36) | 80 |
| 23/09/2026 | C6 | confirmada em parte | Violência literal: confirma 261, 307, 310, 682, 1037, 1038, 1039, 1040, 762, 763, 1207, 1053–1055 (campo violência), 1093; por remissão: 1268, 1269, 1289, 1441–1446, 1294–1296. Vão para a decisão 8: 154, 312, 479, 480, 386, 387. Vão para a decisão 1: 1447–1449 (CPM 244 descreve sequestro, não violência). Vai para a decisão 11: 1332. id 312: grave ameaça sem base no texto | A (CP e CPM conferidos) | CP 322 (p. 74), 359-J e 359-M (p. 85), 200 (p. 49), 359-P (p. 86), 146-A (p. 32); CPM 157 (p. 32), 158 (p. 33), 175 e 176 (p. 35), 177 (p. 36), 217 (p. 46), 242 (p. 53), 243 e 244 (p. 54), 232 (p. 50), 333 (p. 72), 389 (p. 82), 405 e 408 (p. 85); Lei 9.455, art. 1º (p. 1) | ver coluna "leitura" |
| 23/09/2026 | C7 | confirmada | 495 e 311: violência e grave ameaça → Não; 253: grave ameaça → Não; 695: violência → Não e elemento Doloso → Culposo; 221: violência e grave ameaça → Não (grau elevado para A) | A | CP 337-J (p. 79), 359-N (p. 86), 316 (p. 73), 288-A (p. 66); CPM 206 (p. 42); CP 44, I | 495, 311, 253, 695, 221 |
| 23/09/2026 | C8 | confirmada | Tentativa admitida em 104, 105 e 134; elemento "Preterdoloso" desses ids vai para a decisão 31 | A | CP 157, § 3º (p. 40); 213, § 1º (p. 51); STJ (latrocínio tentado) | 104, 105, 134 |
| 23/09/2026 | C9 | confirmada | § 5º do art. 171 revogado pela Lei 15.397, vigente desde 04/05/2026 (DOU conferido pelo robô); intertemporal na decisão 33 | A | CP, art. 171 (p. 44); Lei 15.397, arts. 3º e 4º (p. 3); DOU 04/05/2026 | 127, 128, 580, 589–594, 820 |
| 23/09/2026 | C10 | confirmada e ampliada | Incoerência 48/49 × 1479/1480 em violência, elemento e tentativa; resolve-se nas decisões 10 e 31 | A | CP, art. 133 (p. 29) | 48, 49, 1479, 1480; 283 |
| 23/09/2026 | C11 | derrubada | Não houve reatribuição de id depois da regra: a numeração foi reiniciada em 06/08/2026 (v2.0.0) | A | `data/ids-aposentados.json`, `_meta.reinicio`; commit `0f96505` (06/08/2026) | 601 |
| 23/09/2026 | C12 (nova) | confirmada | Hediondo "Sim" sem base no rol → "Não" | A | Lei 8.072/90, art. 1º, II (p. 2) | 100, 101, 812, 588 |

## Parte 2 — decisões

| data | nº | resposta | leitura adotada | grau | fundamento | ids afetados |
|---|---|---|---|---|---|---|
| 23/09/2026 | 21 | ok | Reincidente em crime com violência ou grave ameaça: 30% (LEP 112, II; IV da Lei 13.964 no mesmo sentido). Reincidente nos demais: 20% (III). O fundamento citado é o II; o IV entra quando a violência é "à pessoa" | A | LEP, art. 112, caput, I a IV (p. 22–23); Lei 15.402, art. 1º (p. 1) | todos (atributo progressão) |
| 23/09/2026 | 27 | ok | Reincidente em crime do Título XII: resultado condicional. Sem violência: 1/6 (caput) ou 20% (III). Com violência: 30% (IV, sem ressalva) ou a leitura de derrogação pela ressalva nova. Motor calcula pela mais favorável e mostra a divergência | M | LEP, art. 112 (p. 22–23) | arts. 359-I a 359-T do CP |
| 23/09/2026 | 35 | ok | Motor recebe a data do fato. Primário sem violência: 16% até 07/05/2026; 1/6 a partir de 08/05/2026. Título XII: lei mais benéfica retroage. Hediondos: 40/50/60/70% (55% no feminicídio de primário, Lei 14.994/2024 — conferir vigência) até 24/03/2026; 70/75/80/85% a partir de 25/03/2026 | A | LEP, art. 112 (p. 22–24); Lei 15.402 (DOU 08/05/2026, ed. extra, vigência na publicação); Lei 15.358 (DOU 25/03/2026, vigência na publicação); CP art. 2º, par. único (p. 1); STJ, Súmula 471 (conferir no portal) | todos |
| 23/09/2026 | 36 | ok, com ajuste de 23/09 | Aviso: "A Lei 15.402/2026 é objeto das ADIs 7966, 7967, 7968 e 7969 (rel. min. Alexandre de Moraes), em rito do art. 10 da Lei 9.868/99. Não há medida cautelar: em 23/09/2026 os autos estavam conclusos ao relator desde 08/07/2026, com manifestações da AGU e da PGR. A ADI 7985 teve seguimento negado em 17/07/2026, com agravo regimental pendente. A decisão de 09/05/2026 foi proferida nas execuções penais do 8 de janeiro em curso no STF, e não nas ADIs." | A | STF, andamentos das ADIs 7966, 7967, 7968, 7969 e 7985 (impressos em 23/09/2026) | Título XII; art. 112 |
| 23/09/2026 | 33 | ok (textos conferidos depois do aval, sem alteração da leitura) | Fatos até 22/01/2020: representação exigida mesmo com ação em curso, até o trânsito (lei intermediária mais benéfica; STF Pleno, HC 208.817 AgR); STJ, Tema 1.138 sem tese. Fatos de 23/01/2020 a 03/05/2026: condicionada à representação, salvo vítima Administração Pública, criança ou adolescente, pessoa com deficiência mental (a partir de 03/10/2025, pessoa com deficiência), maior de 70 anos ou incapaz. Fatos a partir de 04/05/2026: incondicionada, com o art. 182. id 576 (art. 171-A) fora do § 5º. id 595: a segunda parte do § 3º ("instituto de economia popular, assistência social ou beneficência") não é Administração e recebe a condição | M | Lei 13.964, art. 2º (§ 5º do art. 171, p. 3) e art. 20 (vigência em 30 dias, p. 25; DOU 24/12/2019, ed. extra); Lei 15.229, art. 1º (p. 1; DOU 03/10/2025, vigência na publicação); Lei 15.397, art. 3º (p. 3); CP art. 171, § 3º (p. 44); STF, HC 208.817 AgR, Plenário, sessão virtual de 31/03 a 12/04/2023, ordem concedida por maioria (vencidos Moraes, Barroso, Toffoli e Fux); STJ, Tema 1.138 ("Sem Processo Vinculado", sem tese) | 127, 128, 580, 589–594, 595; fora: 576, 820 |
| 23/09/2026 | 37 | ok | Lei 15.348: *abolitio criminis* parcial do art. 1º, II, da Lei 8.176 (motores não automotivos, saunas, caldeiras e aquecimento de piscinas), com ressalva de possível subsunção ao art. 56 da Lei 9.605. Registro 543 mantém id e moldura; o evento do histórico (`combustiveis-8176\|art. 1, ii`) recebe a natureza "abolitio parcial" (categoria nova de nota) | A (não é *in mellius*); M (descriminalização efetiva) | Lei 8.176, art. 1º, II (p. 1); Lei 15.348, art. 4º (DOU 13/02/2026, ed. extra); CP arts. 2º (p. 1) e 107, III (p. 20); Lei 9.605, art. 56 (p. 10) | 543 |
| 23/09/2026 | 38 | ok | Lei 15.517: sete registros novos — CP 155 § 10 (48–120), 155 § 11 c/c § 10 (64–160), 155 § 12 c/c § 10 (80–200), 157 § 2º, XI (96–180), 157 § 2º-A, III (120–200); Lei 8.176, art. 1º-A (36–96, doloso) e art. 1º-B (12–48, culposo, tentativa Não). Nenhum hediondo. Notas de natureza *in pejus* | A (molduras, hediondez); M (culposo no 1º-B; registro único nos §§ 11 e 12) | CP 155 §§ 10–12 (p. 38), 157 § 2º, XI (p. 39), § 2º-A, III (p. 40); Lei 8.176, arts. 1º-A e 1º-B (p. 1); Lei 8.072, art. 1º, II (p. 2); DOU 23/09/2026 | novos |
| 23/09/2026 | 31 | ok (famílias A, B, C e E) | Campo `elemento` ganha o valor "Qualificado pelo resultado". Preterdoloso: quando a lei exclui o dolo no resultado (A) ou quando o resultado doloso configura outro crime, tratado em concurso (B). Qualificado pelo resultado: quando o tipo abriga resultado doloso ou culposo (C). Demais: Doloso. Família A → Preterdoloso: 35 (mantém), 1494, 1496, 1499, 1503, 1314, 1083; 1389 se a remissão ao CPM 209 se confirmar. Família B → Preterdoloso: 629, 634, 48, 49, 55, 56, 642, 643, 386, 387 (mantêm); 30, 31, 1488, 1489, 1479, 1480, 1481, 1482, 1338, 1339, 1087, 1088, 1090, 1091, 982, 983, 985, 986, 989. Família C → Qualificado pelo resultado: 104, 105, 108, 112, 113, 1317, 817, 818, 1490, 1484, 1485, 1452, 1443, 1454, 1446. Família E: sem mudança | A (texto expresso; latrocínio) / M (demais) | CP arts. 14, II (p. 3), 18 e 19 (p. 4), 127 (p. 26), 129, § 3º (p. 27), 133 (p. 29), 136 (p. 30); CPM arts. 33 e 34 (p. 7), 209, § 3º-A (p. 44); Lei 9.434, art. 14 (p. 4–5); STF, Súmula 610 (conferir no portal) | ver leitura |
| 23/09/2026 | 31-D | não: segue Nucci | Estupro e suas formas qualificadas pelo resultado recebem o tratamento do roubo: dolo no antecedente, dolo ou culpa no resultado; crime único, sem concurso → "Qualificado pelo resultado", tentativa "Sim": 134, 609, 135, 141, 142 (CP 213 e 217-A), 1104, 1105 (CPM 232), 1295, 1296 (CPM 408, por remissão ao 232). Restante da família D (1292, 1293, 1038, 1040, 1055, 1095, 1096, 738) → proposta "D2", pendente | M (doutrina nomeada) | CP 19 (p. 4), 213, §§ 1º e 2º (p. 51), 217-A, §§ 3º e 4º (p. 52); NUCCI, Guilherme de Souza. *Manual de Direito Penal*. 22. ed. 2026, p. 665–666 (art. 213, § 2º); STF, Súmula 610 | 134, 609, 135, 141, 142, 1104, 1105, 1295, 1296 |
| 23/09/2026 | 20 | ok (decorre da 31) | Tentativa: Preterdoloso → "Não"; Qualificado pelo resultado → "Sim". O id 134 mantém "Sim" pela hipótese da vítima de 14 a 18 anos (C8) | A | CP 14, II (p. 3) | os da 31 |
| 23/09/2026 | 2 | dissolvida pela C6 | CPM 405: a remissão aos arts. 242 e 243 decide (violência "Sim"); os registros com remissão ao art. 244 vão para a decisão 1 | A | CPM 405 (p. 85), 242 (p. 53), 243 e 244 (p. 54) | 1289, 1441–1446; 1447–1449 → decisão 1 |
| 23/09/2026 | 31-D2 | ok | Mesmo critério (crime complexo com violência antecedente e resultado agravador) → "Qualificado pelo resultado", tentativa "Sim": 1292, 1293 (CPM 407), 1038, 1040 (CPM 157 e 158 com morte), 1055 (CPM 177, § 1º-A), 1095, 1096 (CPM 225). O 738 (epidemia com morte) fica Preterdoloso (família B) | M | idem 31-D | 1292, 1293, 1038, 1040, 1055, 1095, 1096; 738 |
| 23/09/2026 | 1a | ok | Sequestro e cárcere privado: violência "Não" e grave ameaça "Não", com `violencia_condicao` = "Sim quando a privação é executada ou mantida mediante violência ou grave ameaça" | M | CP 148 (p. 33–34); CPM 225 (p. 48); regra literal da C6 | 69, 70, 71, 621–625, 1315; CPM 750, 1095, 1096 |
| 23/09/2026 | 1b | ok | Extorsão mediante sequestro: violência "Não" com a mesma condição; grave ameaça "Sim" (exigência de resgate com a vítima em poder do agente) | M | CP 159 e § 4º (p. 40–41); CPM 244 (p. 54) | 110–114, 1483–1485; CPM 1116, 1447–1449 |
| 23/09/2026 | 3 | ok | Núcleo matar/ofender: mantêm "Sim" 26, 1308–1311, 1280, 1281, 1456, 1284–1287, 1389. Lei 9.434, art. 14: 561 e 562 → "Não" com condição "Sim se em pessoa viva"; 642, 643, 989 → "Sim" (989 muda) | A / M (561, 562) | CP 121-B, 123; CPM 400, 403; Lei 9.434, art. 14 (p. 4–5) | ver leitura |
| 23/09/2026 | 4 | ok (grau B) | Estupro de vulnerável: "Sim" mantido, com nota; não se publica mudança até haver jurisprudência sobre violência/benefícios no art. 217-A. A presunção do § 4º-A é de vulnerabilidade, não de violência | B | CP 217-A e § 4º-A (p. 52; Lei 15.353) | 140, 141, 142, 611 |
| 23/09/2026 | 5 | ok | Incêndio majorado: "Não", coerente com o tipo-base (id 185) | A (divergência com o roteiro, que dava M) | CP 250 (p. 59) | 722, 723, 724 |
| 23/09/2026 | 6 | ok | Genocídio: 551 "Sim" (A), 552 "Sim" (M); associação e incitação → "Não": 1462, 1463, 1472, 1473 (1467, 1468 já "Não"). Terrorismo: 790 → família 8 (Não + condição); 1461 → "Não" | A / M | Lei 2.889, arts. 1º a 3º (p. 1–2); Lei 13.260, arts. 2º, § 1º, e 5º, § 2º (p. 1–2) | ver leitura |
| 23/09/2026 | 8 | ok | Criar `violencia_condicao` (texto + dispositivo). Meio alternativo → violência "Não" e grave ameaça "Não", com condição "Sim quando o meio empregado for violência à pessoa ou grave ameaça (dispositivo)"; no CP 200, só violência contra a pessoa | M | CP 146 (p. 32), 149-A (p. 34), 150 § 1º (p. 35), 163 par. único (p. 42), 200 (p. 49), 203–204 (p. 49–50), 227–230 §§ 2º (p. 55), 335 (p. 77), 337-K (p. 79), 345 (p. 81), 358 (p. 83), 359-P (p. 86), 146-A (p. 32); CPM 222 (p. 47), 358 (p. 77); ECA 239 par. único (p. 61); Lei 13.260, art. 2º, § 1º; Lei 9.455, art. 1º, § 3º | 65, 73, 635–639, 734, 747, 277, 312, 790, 386, 387, 75, 283, 1234, 547, 1053–1055, 154, 120, 157, 158, 296, 496, 1343, 1345, 1347, 1397, 479, 480, 72, 871, 1402 |
| 23/09/2026 | C6-177 | ok (correção de erro da C6) | CPM 177 ("mediante ameaça ou violência") é meio alternativo, como o CP 329 → família 8 | A | CPM 177 (p. 36) | 1053, 1054, 1055 |
| 23/09/2026 | 9 | ok | "Ameaça" sem qualificativo entre outros meios → grave ameaça "Não" + condição "Sim quando a ameaça for grave". Mal necessariamente grave descrito no tipo → "Sim" (CPM 242: A; CPM 245: M) | M | CDC 71 (p. 16); CE 326-B (p. 54); CP 147-A (p. 33), 329 (p. 75); Lei 1.579, art. 4º, I (p. 1); Lei 13.869, art. 15 (p. 3); CPM 242 (p. 53), 245 (p. 54) | Não+cond.: 513, 1508, 559, 67, 578, 428, 267, 1374, 547, 1234; Sim: 1114, 1451, 1452, 1457, 1458, 1117 |
| 23/09/2026 | C13 (nova) | ok | ids 559 e 1508 são o mesmo dispositivo (CE 326-B); aposentar 559 em `ids-aposentados.json`, com redirecionamento para 1508 | A | CE 326-B (p. 54) | 559 → 1508 |
| 23/09/2026 | 10 | ok | Perigo à pessoa: CP 133 e Lei 10.741, art. 99 → "Não"; CP 136 e CPM 213 → "Não" + condição "Sim quando o abuso de meios de correção envolve violência física"; formas com resultado seguem o tipo-base. Resolve a C10 | A / M | CP 133 (p. 29), 136 (p. 30); CPM 213 (p. 45), 207, § 2º (p. 42); Lei 10.741, art. 99 (p. 22) | 1479, 1480 → Não; 54–57, 1481, 1482, 1089–1091, 1080 → Não + condição; demais mantêm |
| 23/09/2026 | 11 | ok | 68 (CP 147-B): violência "Não"; grave ameaça "Não" + condição. 1329 (Lei 13.869, art. 15-A): "Não". 1332 (Lei 9.455, art. 1º, III): violência "Não" + condição "Sim quando o sofrimento físico é infligido por agressão" | M / A (1329) | CP 147-B (p. 33); Lei 13.869, art. 15-A (p. 4); Lei 9.455, art. 1º, III (p. 1); CPP 28-A, § 2º, IV | 68, 1329, 1332 |
| 23/09/2026 | 7 | ok | Avulsos: 72 → família 8; 156 → Não; 291 → Não + condição; 292 → Não; 992 → mantém Sim; 1118 → grave ameaça Não; 1267 → Não + condição; 1455 → Não; 671 → Não; 351, 579, 1327 → Não; 768 → Não; 475 → Não + condição; 906 → Não | A / M | CP 149 (p. 34), 202 (p. 49), 353–354 (p. 82), 137 (p. 30); CPM 246 (p. 54), 388 (p. 82), 368 e 149 (p. 78, 31); Lei 12.850, art. 2º, § 2º (p. 1); Lei 9.605, art. 32 (p. 5); LCP 28 (p. 4); Lei 10.741, art. 107 (p. 23); Lei 4.947, art. 20 (p. 4) | ver leitura |
| 23/09/2026 | 18 | ok | Criar `acao_fundamento` em todos os registros, preenchido pelo derivador: regra do diploma (dispositivo); regra geral (CP 100 c/c 12); lei externa (Lei 9.099, art. 88; CPM 121); jurisprudência (ADI 4424, Súmula 542 STJ, Súmula 714 STF); intertemporal (decisão 33) | A | CP 100 (p. 19), 12 (p. 3); Lei 9.099, arts. 88 (p. 12) e 90-A (p. 13); CPM 121 (p. 24); CE 355 | todos |
| 23/09/2026 | 12 | ok | Padrão "Pública Incondicionada"; `acao_condicao`: "Condicionada à representação se a vítima é cônjuge desquitado ou judicialmente separado, irmão, ou tio ou sobrinho com quem o agente coabita (CP 182); não se aplica ao estranho que participa do crime nem à vítima de 60 anos ou mais (CP 183, II e III)". Fora: 595 (vítima sempre entidade). O art. 181 é isenção de pena, não regra de ação | A | CP 181, 182, 183 (p. 47) | 86–93, 122, 123, 127, 128, 129–132, 576, 580, 582–587, 589–594, 815, 816, 820, 994–1000, 1316, 1341 + novos da Lei 15.517 (155 §§ 10–12) |
| 23/09/2026 | 13 e 15 | ok | 58, 59, 730, 60, 63, 64, 1504, 1505: Privada + condição "requisição do Ministro da Justiça na hipótese do art. 141, I; representação na do art. 141, II (inclusive Presidentes do Senado, da Câmara e do STF), com legitimidade concorrente do ofendido mediante queixa (STF, Súmula 714)". 61: condição "pública se da violência resulta lesão (art. 145, caput): condicionada à representação se leve (Lei 9.099, art. 88); incondicionada se grave ou gravíssima". 62: representação mantida | A (texto); M (61; Súmula 714 a conferir no portal) | CP 140, 141 (p. 31), 145 (p. 32); Lei 9.099, art. 88 (p. 12) | 58, 59, 730, 60, 61, 62, 63, 64, 1504, 1505 |
| 23/09/2026 | 16 | fechada pela C4 | id 120: Pública Incondicionada + condição "queixa no inciso IV (art. 167)" | A | CP 163, 167 (p. 42) | 120 |
| 23/09/2026 | 17 | ok | Condições conferidas: 154-B (82–85, 735, 1486), 161 § 3º (116–118), 345 (283), 151 § 4º (78, 640, 1340). Lei 9.609: 539 ganha condição; 540 e 541 completam com o inciso II. Texto: "pública quando em prejuízo de entidade de direito público, autarquia, empresa pública, sociedade de economia mista ou fundação pública (I), ou quando resultar sonegação fiscal, perda de arrecadação tributária ou crime contra a ordem tributária ou as relações de consumo (II)" | A | CP 154-B (p. 37), 161 § 3º (p. 41), 345 (p. 81), 151 § 4º; Lei 9.609, art. 12, § 3º (p. 3) | 539, 540, 541 |
| 23/09/2026 | 34 | ok | 76 e 77: `vigencia_ate` = 1978-06-23; `vigencia_nota`: "REVOGADO TACITAMENTE pelo art. 40, caput e § 1º, da Lei 6.538/78, que regula inteiramente a matéria (LINDB, art. 2º, § 1º)". Criar registro Lei 6.538, art. 40, § 1º. Ação no art. 40: incondicionada (art. 45 é dever de representar da autoridade, não condição de procedibilidade) | M | CP 151 (p. 35); Lei 6.538, arts. 40 (p. 7), 45 (p. 8), 49 (p. 9); LINDB, art. 2º, § 1º (p. 1); precedente interno: id 641 | 76, 77, 884; novo |
| 23/09/2026 | C14 | pendente (não muda) | id 641: `vigencia_ate` 1962-08-27 é a data da Lei 4.117, não a de vigência; a nota cita a redação do DL 236/1967. O compilado (p. 16) só mostra a redação do DL 236; o texto original de 1962 do art. 70 não aparece. Manter e anotar para conferência | B | Lei 4.117, art. 70 (p. 16) | 641 |
| 23/09/2026 | 29 | ok (implícito: "se tudo estiver concluído") | Varredura do CPM contra o rol. Sim: 1081, 1282 (genocídio), 1294–1296 (art. 408 → estupro), 1447, 1448, 1449 (405 c/c 244), 1281 (400, III). Não + condição: 1451, 1442 (roubo: incisos I com arma de fogo, V, VI, VIII), 1453, 1445 (extorsão: V, VI, VIII), 1289, 1283 (208 par. único I, II, IV, V), 692, 1280 (grupo de extermínio), 699, 1083, 1286, 1389 (I-A). Mantêm Não: 1291–1293, 1165, 721. Registros novos: CPM 208 par. único, 244 §§ 1º e 2º, 292 §§ 1º e 2º, 242 § 2º V e VI, 243 § 1º c/c 242 § 2º V, 225 § 1º | A / M | Lei 8.072, art. 1º (p. 1–2) e par. único, I, V e VI (p. 3); CPM 208 (p. 43), 242 (p. 53), 243–244 (p. 54), 292 (p. 65), 400–408 (p. 84–85) | ver leitura |
| 23/09/2026 | C15 (nova) | ok (implícito) | Causa da C12: as expressões regulares de `data/hediondos.json` não ancoram o fim (`^Art\. 157, §2º, V` casa VI, VII, VIII; `§2º-A, I` casa II). Ancorar com `$` ou fronteira | A | — | 100, 101, 812, 588 |
| 23/09/2026 | 22 | ok (implícito) | Confirma: 1457 hediondo só com arma de fogo; 1459 não hediondo | A | Lei 8.072, art. 1º, II, b, e III (p. 2); `hediondos.json` | 1457, 1459 |
| 23/09/2026 | 23 | ok (implícito) | Confirma: 150 representação (CP 186, IV, p. 48); 176, 183, 184 incondicionada (Título VII sem regra; CP 100); 173 personalíssima (CP 236, par. único, p. 57) | A | idem | 150, 173, 176, 183, 184 |
| 23/09/2026 | 24 | ok (implícito) | `pena_min` 0 = mínimo não cominado, com nota; motor usa 1 dia como mínimo (CP 11), nunca o máximo; vedada a analogia com CE 284 ou CPM 58 (in malam partem) | M | Lei 6.538, arts. 36–42 (p. 6–7); CP 11 (p. 3); CE 284 (p. 51); CPM 58 (p. 11) | 880–884, 886 |
| 23/09/2026 | 25 | ok (implícito) | "Cabível em tese, com divergência declarada": motor calcula o ANPP pelos critérios do CPP 28-A e exibe aviso da divergência em todos os registros do CPM | M | CPP 28-A (p. 8); CPPM 3º, a (p. 1); Lei 9.099, art. 90-A (p. 13). A favor: STF, 2ª T., HC 232.254/PE (sessão virtual de 19 a 26/04/2024, unânime; trânsito 11/06/2024); STF, RE 1.613.372 (dec. monocrática, Min. Dias Toffoli, 29/07/2026; trânsito 13/08/2026) — **o roteiro dava 27/07; a data certa é 29/07**; STJ, 5ª T., HC 993.294/MG (05/08/2025, DJEN 14/08/2025). Contra: STM, Súmula 18 (DJe 140, 22/08/2022). IRDR do STM não conferido | CPM (todos) |
| 23/09/2026 | 26 | ok (implícito) | 33 registros (não 35). Desistência e arrependimento eficaz (CP 15): calculados quando tentativa "Sim"; "Não se aplica" nas contravenções (LCP 4). Perdão judicial (CP 107, IX): "Não previsto", salvo previsão no tipo ou diploma. Arrependimento posterior (CP 16): calculado pelo campo de violência. 556 e 557: pena por remissão, atributos nos registros derivados | A / M (CP 16) | CP 15, 16 (p. 4), 107, IX (p. 20), 120 (p. 23); LCP 4 (p. 1) | lista de `26-sem-pena-privativa.md` |
| 23/09/2026 | 28 | ok (implícito) | Formato único "Hediondo somente quando …. Fundamento: Lei 8.072, art. 1º, …". 35 e 1314: "seguida de morte". 320, 323, 385: saem da condição para `hediondo_nota` (divergência). 1306: "Não", condição removida, nota | A | Lei 8.072, art. 1º (p. 1–3) | 1, 20, 24, 34, 35, 73, 320, 323, 385, 388, 630–639, 671, 1306, 1314, 1457 |
| 23/09/2026 | 30 | ok (implícito) | Nome = rubrica marginal do compilado; em parágrafo/inciso, "Rubrica — especificação curta"; sem rubrica, conduta nuclear substantivada (até ~80 caracteres), sem cópia do texto. Claude Code lista os nomes que violam a régua para conferência antes de aplicar | A | régua editorial | a listar |
| 23/09/2026 | 32 | ok (implícito) | Datas de publicação e vigência das leis de 2026 conferidas no DOU pelo robô; notas usam a data de vigência. Retificação da Lei 15.384 (DOU 15/04/2026, seção 1, p. 17): só a ementa, sem efeito penal | A | `dou/*.json` (robô, 23/09/2026); Câmara dos Deputados, legin (retificação) | notas de 2026 |
| 23/09/2026 | C16 (nova) | ok (implícito; tese enviada pelo Luccas) | id 314 (Lei 11.343, art. 28): aviso "Não constitui infração penal a conduta com cannabis sativa para consumo pessoal; presunção relativa de usuário até 40 g ou seis plantas-fêmeas; sanções dos incisos I e III em procedimento não penal (STF, RE 635.659, Tema 506)". Para as demais drogas, o tipo permanece | A | STF, RE 635.659, Tema 506 (tese transcrita pelo Luccas em 23/09/2026; data do julgamento a conferir) | 314 |
| 23/09/2026 | 19 | **pendente** | Crimes de atentado ("tentar" no núcleo): recomendação tentativa "Não". Fora da ordem de lotes do roteiro (Parte 3); falta doutrina nomeada com página | B até a citação | — | 290, 309, 310, 496, 529, 678, 716, 720, 783, 1016, 1060, 1116, 1117, 1135, 1239 |
