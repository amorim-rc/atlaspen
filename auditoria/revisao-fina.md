# Revisão fina: o que ainda depende de decisão jurídica

Gerado em 20/09/2026 a partir de `auditoria/violencia-e-grave-ameaca.md`, `auditoria/acao-penal.md` e do `backlog.md`. Regenere os dois relatórios antes de começar uma rodada, porque a lista muda a cada correção:

```
python scripts/robos/auditor/conferir_violencia.py --md auditoria/violencia-e-grave-ameaca.md
python scripts/robos/auditor/conferir_acao_penal.py --md auditoria/acao-penal.md
```

## Como ler

Cada bloco é **uma pergunta**, e a lista dos registros em que ela se repete. Nenhum item é erro conhecido: são pontos em que a lei não decide sozinha, e por isso ficaram fora das correções automáticas. Onde a lei decidia, a correção já entrou (18 registros de violência e 4 de ação penal, em 19/09/2026).

O `id` é o id público (`/tipos/<id>`). "Publicado" é o que o site mostra hoje.

**Sugestão de ordem:** resolva por família, não por registro. Uma decisão por família fecha dezenas de registros de uma vez e vira regra escrita em `scripts/violencia.py` ou `scripts/acao_penal.py` — assim o próximo tipo da mesma família já nasce decidido.

## Resumo

| Bloco | Pergunta | Alcance |
|---|---|---|
| A | O tipo é violento, mesmo sem a lei dizer? (herança do caput) | 149 respostas |
| B | A violência do tipo é a que veda ANPP e substituição? | 83 respostas |
| C | A regra de ação penal com ressalva vira condição no registro? | 149 registros |
| D | Pontos abertos fora desses dois campos | 10 assuntos |

## Bloco A — Violência afirmada que a lei não descreve

**O ponto exato.** O registro afirma violência ou grave ameaça, e o texto do dispositivo — o próprio e o do caput — não traz fórmula de violência à pessoa. O valor veio de herança do caput, sem critério escrito.

**A pergunta, família a família:** o tipo pressupõe violência dolosa contra pessoa, como meio ou como núcleo? Se sim, o registro fica e ganha uma regra que o sustente (por exemplo: "privar alguém de sua liberdade" é violência?). Se não, o campo muda e o tipo passa a admitir ANPP, substituição e arrependimento posterior.

Famílias que pedem uma decisão só: formas do homicídio que a regra não alcança pelo caput, sequestro e cárcere privado, infanticídio, crimes militares (deserção, motim, insubordinação), genocídio (Lei 2.889/56), remoção de órgãos (Lei 9.434/97).

### CP — 63

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 26 | Art. 123 | Infanticídio | violência | Sim |
| 69 | Art. 148, caput | Sequestro e cárcere privado | violência | Sim |
| 69 | Art. 148, caput | Sequestro e cárcere privado | grave ameaça | Sim |
| 70 | Art. 148, §1º | Sequestro qualificado (fins libidinosos, menor de 18, maus-t | violência | Sim |
| 70 | Art. 148, §1º | Sequestro qualificado (fins libidinosos, menor de 18, maus-t | grave ameaça | Sim |
| 71 | Art. 148, §2º | Sequestro ou cárcere privado — grave sofrimento físico ou mo | violência | Sim |
| 71 | Art. 148, §2º | Sequestro ou cárcere privado — grave sofrimento físico ou mo | grave ameaça | Sim |
| 72 | Art. 149, caput | Redução a condição análoga à de escravo | violência | Sim |
| 72 | Art. 149, caput | Redução a condição análoga à de escravo | grave ameaça | Sim |
| 75 | Art. 150, §1º | Violação de domicílio qualificada (noturna/com violência/arm | grave ameaça | Sim |
| 110 | Art. 159, caput | Extorsão mediante sequestro | violência | Sim |
| 110 | Art. 159, caput | Extorsão mediante sequestro | grave ameaça | Sim |
| 111 | Art. 159, §1º | Extorsão mediante sequestro com duração > 24h / menor de 18 | violência | Sim |
| 111 | Art. 159, §1º | Extorsão mediante sequestro com duração > 24h / menor de 18 | grave ameaça | Sim |
| 112 | Art. 159, §2º | Extorsão mediante sequestro — resultado lesão corporal grave | violência | Sim |
| 112 | Art. 159, §2º | Extorsão mediante sequestro — resultado lesão corporal grave | grave ameaça | Sim |
| 113 | Art. 159, §3º | Extorsão mediante sequestro — resultado morte | violência | Sim |
| 113 | Art. 159, §3º | Extorsão mediante sequestro — resultado morte | grave ameaça | Sim |
| 114 | Art. 159, §4º | Extorsão mediante sequestro — diminuição de 1/3 a 2/3 (delaç | violência | Sim |
| 114 | Art. 159, §4º | Extorsão mediante sequestro — diminuição de 1/3 a 2/3 (delaç | grave ameaça | Sim |
| 120 | Art. 163, parágrafo único | Dano qualificado | violência | Sim |
| 140 | Art. 217-A, caput | Estupro de vulnerável | violência | Sim |
| 141 | Art. 217-A, §3º | Estupro de vulnerável com resultado lesão grave | violência | Sim |
| 142 | Art. 217-A, §4º | Estupro de vulnerável com resultado morte | violência | Sim |
| 154 | Art. 200 | Paralisação de trabalho seguida de violência ou perturbação | violência | Sim |
| 156 | Art. 202 | Invasão de estabelecimento industrial/comercial/agrícola e s | violência | Sim |
| 221 | Art. 288-A | Constituição de milícia privada | violência | Sim |
| 221 | Art. 288-A | Constituição de milícia privada | grave ameaça | Sim |
| 253 | Art. 316, caput | Concussão | grave ameaça | Sim |
| 261 | Art. 322 | Violência arbitrária | violência | Sim |
| 283 | Art. 345 | Exercício arbitrário das próprias razões | violência | Sim |
| 283 | Art. 345 | Exercício arbitrário das próprias razões | grave ameaça | Sim |
| 291 | Art. 353 | Arrebatamento de preso | violência | Sim |
| 291 | Art. 353 | Arrebatamento de preso | grave ameaça | Sim |
| 292 | Art. 354 | Motim de presos | violência | Sim |
| 307 | Art. 359-J | Atentado à integridade nacional | violência | Sim |
| 310 | Art. 359-M | Tentativa de deposição do governo legitimamente constituído | violência | Sim |
| 311 | Art. 359-N | Interrupção do processo eleitoral por violação de mecanismos | violência | Sim |
| 311 | Art. 359-N | Interrupção do processo eleitoral por violação de mecanismos | grave ameaça | Sim |
| 495 | Art. 337-J | Violação de sigilo em licitação | violência | Sim |
| 495 | Art. 337-J | Violação de sigilo em licitação | grave ameaça | Sim |
| 611 | Art. 217-A, §1º | Estupro de vulnerável — vítima deficiente ou sem discernimen | violência | Sim |
| 621 | Art. 148, §1º, I | Sequestro/cárcere privado qualificado — se a vítima é ascend | violência | Sim |
| 622 | Art. 148, §1º, II | Sequestro/cárcere privado qualificado — internação da vítima | violência | Sim |
| 623 | Art. 148, §1º, III | Sequestro/cárcere privado qualificado — se a vítima é menor | violência | Sim |
| 624 | Art. 148, §1º, IV | Sequestro/cárcere privado qualificado — se o crime é pratica | violência | Sim |
| 625 | Art. 148, §1º, V | Sequestro/cárcere privado qualificado — se o crime é pratica | violência | Sim |
| 722 | Art. 250, §1º, I | Incêndio — aumento pelo intuito de obter vantagem pecuniária | violência | Sim |
| 723 | Art. 250, §1º, II, a | Incêndio — em casa habitada ou destinada a habitação | violência | Sim |
| 724 | Art. 250, §1º, II, b | Incêndio — em edifício público ou destinado a uso público, a | violência | Sim |
| 992 | Art. 137, caput | Rixa (participar de rixa, salvo para separar os contendores) | violência | Sim |
| 1308 | Art. 121-B, caput | Vicaricídio | violência | Sim |
| 1309 | Art. 121-B, par. único, I | Vicaricídio — na presença da mulher a quem se pretende causa | violência | Sim |
| 1310 | Art. 121-B, par. único, II | Vicaricídio — contra criança, adolescente, pessoa idosa ou p | violência | Sim |
| 1311 | Art. 121-B, par. único, III | Vicaricídio — em descumprimento de medida protetiva de urgên | violência | Sim |
| 1315 | Art. 148, §3º | Sequestro ou cárcere privado por integrante de organização c | violência | Sim |
| 1315 | Art. 148, §3º | Sequestro ou cárcere privado por integrante de organização c | grave ameaça | Sim |
| 1483 | Art. 159, §4º c/c §1º | Extorsão mediante sequestro qualificada com delação premiada | violência | Sim |
| 1483 | Art. 159, §4º c/c §1º | Extorsão mediante sequestro qualificada com delação premiada | grave ameaça | Sim |
| 1484 | Art. 159, §4º c/c §2º | Extorsão mediante sequestro com lesão grave e delação premia | violência | Sim |
| 1484 | Art. 159, §4º c/c §2º | Extorsão mediante sequestro com lesão grave e delação premia | grave ameaça | Sim |
| 1485 | Art. 159, §4º c/c §3º | Extorsão mediante sequestro com resultado morte e delação pr | violência | Sim |
| 1485 | Art. 159, §4º c/c §3º | Extorsão mediante sequestro com resultado morte e delação pr | grave ameaça | Sim |

### CPM (DL 1.001/69) — 55

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 682 | Art. 157, caput | Violência contra superior | violência | Sim |
| 695 | Art. 206, caput | Homicídio culposo | violência | Sim |
| 762 | Art. 175, caput | Praticar violência contra inferior hierárquico | violência | Sim |
| 763 | Art. 176, caput | Ofensa aviltante a inferior hierárquico | violência | Sim |
| 1037 | Art. 157, §1º | Violência contra superior — Se o superior é comandante da un | violência | Sim |
| 1038 | Art. 157, §4º | Violência contra superior — resultado morte | violência | Sim |
| 1039 | Art. 158, caput | Violência contra militar de serviço | violência | Sim |
| 1040 | Art. 158, §3º | Violência contra militar de serviço — resultado morte | violência | Sim |
| 1053 | Art. 177, caput | Resistência mediante ameaça ou violência | violência | Sim |
| 1054 | Art. 177, §1º | Resistência mediante ameaça ou violência — Se o ato não se e | violência | Sim |
| 1055 | Art. 177, §1º-A | Resistência mediante ameaça ou violência — Se da resistência | violência | Sim |
| 1080 | Art. 207, §2º | Provocação indireta ao suicídio (maus-tratos que levam ao su | violência | Sim |
| 1081 | Art. 208, caput | Genocídio | violência | Sim |
| 1087 | Art. 212, §1º | Abandono de pessoa — Se do abandono resulta lesão grave | violência | Sim |
| 1093 | Art. 217, caput | Injúria real | violência | Sim |
| 1095 | Art. 225, §2º | Sequestro ou cárcere privado — Se resulta à vítima, em razão | violência | Sim |
| 1116 | Art. 244, caput | Extorsão mediante seqüestro (tempo de paz) | grave ameaça | Sim |
| 1118 | Art. 246, caput | Extorsão indireta | grave ameaça | Sim |
| 1207 | Art. 333, caput | Violência arbitrária | violência | Sim |
| 1267 | Art. 388, caput | Coação contra oficial general ou comandante | grave ameaça | Sim |
| 1268 | Art. 389, caput | Violência contra superior ou militar de serviço (tempo de gu | violência | Sim |
| 1269 | Art. 389, par. único | Violência contra superior ou militar de serviço — Se ao crim | violência | Sim |
| 1280 | Art. 400, I | Homicídio simples | violência | Sim |
| 1281 | Art. 400, III | Homicídio qualificado em presença do inimigo | violência | Sim |
| 1284 | Art. 403, caput | Lesão leve | violência | Sim |
| 1285 | Art. 403, §1º | Lesão leve — No caso do § 1° do art. 209 | violência | Sim |
| 1286 | Art. 403, §2º | Lesão leve — No caso do § 2º do art. 209 | violência | Sim |
| 1287 | Art. 403, §3º | Lesão leve — No caso do § 3º do art. 209 | violência | Sim |
| 1289 | Art. 405, caput | Roubo ou extorsão (tempo de guerra) | violência | Sim |
| 1289 | Art. 405, caput | Roubo ou extorsão (tempo de guerra) | grave ameaça | Sim |
| 1294 | Art. 408, caput | Violência carnal | violência | Sim |
| 1295 | Art. 408, par. único, a) | Violência carnal — Se da violência resulta | violência | Sim |
| 1296 | Art. 408, par. único, b) | Violência carnal — morte | violência | Sim |
| 1389 | Art. 403, § 3º (no caso de morte) | Lesão leve (no caso de morte) | violência | Sim |
| 1441 | Art. 405 c/c art. 242, §1º | Roubo impróprio (tempo de guerra) | violência | Sim |
| 1441 | Art. 405 c/c art. 242, §1º | Roubo impróprio (tempo de guerra) | grave ameaça | Sim |
| 1442 | Art. 405 c/c art. 242, §2º | Roubo qualificado (tempo de guerra) | violência | Sim |
| 1442 | Art. 405 c/c art. 242, §2º | Roubo qualificado (tempo de guerra) | grave ameaça | Sim |
| 1443 | Art. 405 c/c art. 242, §3º | Latrocínio (tempo de guerra) | violência | Sim |
| 1443 | Art. 405 c/c art. 242, §3º | Latrocínio (tempo de guerra) | grave ameaça | Sim |
| 1444 | Art. 405 c/c art. 243, caput | Extorsão (tempo de guerra) | violência | Sim |
| 1444 | Art. 405 c/c art. 243, caput | Extorsão (tempo de guerra) | grave ameaça | Sim |
| 1445 | Art. 405 c/c art. 243, §1º | Extorsão qualificada (tempo de guerra) | violência | Sim |
| 1445 | Art. 405 c/c art. 243, §1º | Extorsão qualificada (tempo de guerra) | grave ameaça | Sim |
| 1446 | Art. 405 c/c art. 243, §2º | Extorsão qualificada pela morte (tempo de guerra) | violência | Sim |
| 1446 | Art. 405 c/c art. 243, §2º | Extorsão qualificada pela morte (tempo de guerra) | grave ameaça | Sim |
| 1447 | Art. 405 c/c art. 244, caput | Extorsão mediante sequestro (tempo de guerra) | violência | Sim |
| 1447 | Art. 405 c/c art. 244, caput | Extorsão mediante sequestro (tempo de guerra) | grave ameaça | Sim |
| 1448 | Art. 405 c/c art. 244, §1º | Extorsão mediante sequestro qualificada (tempo de guerra) | violência | Sim |
| 1448 | Art. 405 c/c art. 244, §1º | Extorsão mediante sequestro qualificada (tempo de guerra) | grave ameaça | Sim |
| 1449 | Art. 405 c/c art. 244, §2º | Extorsão mediante sequestro — grave sofrimento físico ou mor | violência | Sim |
| 1449 | Art. 405 c/c art. 244, §2º | Extorsão mediante sequestro — grave sofrimento físico ou mor | grave ameaça | Sim |
| 1455 | Art. 368, par. único (co-autores) | Motim, revolta ou conspiração em tempo de guerra — co-autore | violência | Sim |
| 1455 | Art. 368, par. único (co-autores) | Motim, revolta ou conspiração em tempo de guerra — co-autore | grave ameaça | Sim |
| 1456 | Art. 400, II | Homicídio privilegiado em presença do inimigo | violência | Sim |

### Lei 2.889/56 — 6

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 551 | Art. 1º, a | Genocídio — matar membros do grupo | violência | Sim |
| 552 | Art. 1º, b | Genocídio — causar lesão grave à integridade física ou menta | violência | Sim |
| 1462 | Art. 2º c/c art. 1º, a | Associação para o genocídio — matar membros do grupo | violência | Sim |
| 1463 | Art. 2º c/c art. 1º, b | Associação para o genocídio — causar lesão grave à integrida | violência | Sim |
| 1472 | Art. 3º, §1º c/c art. 1º, a | Incitação ao genocídio com o crime incitado consumado — mata | violência | Sim |
| 1473 | Art. 3º, §1º c/c art. 1º, b | Incitação ao genocídio com o crime incitado consumado — caus | violência | Sim |

### Lei 9.455/97 — 5

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 386 | Art. 1º, §3º (resultado lesão grave) | Tortura qualificada pelo resultado lesão grave | violência | Sim |
| 386 | Art. 1º, §3º (resultado lesão grave) | Tortura qualificada pelo resultado lesão grave | grave ameaça | Sim |
| 387 | Art. 1º, §3º (resultado morte) | Tortura qualificada pelo resultado morte | violência | Sim |
| 387 | Art. 1º, §3º (resultado morte) | Tortura qualificada pelo resultado morte | grave ameaça | Sim |
| 1332 | Art. 1º, III | Tortura de mulher no contexto de violência doméstica e famil | violência | Sim |

### Lei 13.260/16 — 4

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 790 | Art. 2º | Terrorismo (praticar atos por razões de xenofobia/discrimina | violência | Sim |
| 790 | Art. 2º | Terrorismo (praticar atos por razões de xenofobia/discrimina | grave ameaça | Sim |
| 1461 | Art. 5º, §2º | Atos preparatórios de terrorismo sem viagem ou treinamento n | violência | Sim |
| 1461 | Art. 5º, §2º | Atos preparatórios de terrorismo sem viagem ou treinamento n | grave ameaça | Sim |

### Lei 9.434/97 — 4

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 561 | Art. 14 | Remover tecidos/órgãos/partes do corpo de pessoa ou cadáver | violência | Sim |
| 562 | Art. 14, §1º | Remoção de tecidos, órgãos ou partes do corpo em desacordo c | violência | Sim |
| 642 | Art. 14, §2º | Remoção de tecidos ou órgãos em pessoa viva com resultado le | violência | Sim |
| 643 | Art. 14, §3º | Remoção de tecidos ou órgãos em pessoa viva com resultado le | violência | Sim |

### Lei 12.850/13 — 2

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 671 | Art. 2º, §2º | Organização criminosa armada (com emprego de arma de fogo) — | violência | Sim |
| 671 | Art. 2º, §2º | Organização criminosa armada (com emprego de arma de fogo) — | grave ameaça | Sim |

### Lei 15.358/26 — 2

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 1402 | Art. 2º, caput | Domínio social estruturado | violência | Sim |
| 1402 | Art. 2º, caput | Domínio social estruturado | grave ameaça | Sim |

### Lei 9.605/98 — 2

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 351 | Art. 32 | Maus-tratos a animais | violência | Sim |
| 1327 | Art. 32, §1º-B | Tatuagem ou piercing em cães e gatos com fins estéticos | violência | Sim |

### LCP (DL 3.688/41) — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 768 | Art. 28 | Disparar arma de fogo em lugar habitado ou nas suas adjacênc | violência | Sim |

### Lei 10.741/03 — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 475 | Art. 107 | Coação de pessoa idosa a doar, contratar, testar ou outorgar | grave ameaça | Sim |

### Lei 14.192/21 — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 559 | Art. 326-B (CE) | Violência política contra a mulher (assediar/constranger/hum | violência | Sim |

### Lei 14.597/23 — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 871 | Art. 201 | Tumulto ou violência em evento esportivo (promover tumulto, | violência | Sim |

### Lei 4.947/66 — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 906 | Art. 20 | Invasão de terras da União, dos Estados e dos Municípios com | violência | Sim |

### Lei 9.605/98 (atualiz.) — 1

| id | dispositivo | tipo penal | campo | publicado |
|---|---|---|---|---|
| 579 | Art. 32, §1º-A | Maus-tratos contra cão ou gato (aumento de pena) | violência | Sim |

## Bloco B — A violência do tipo é a que a lei usa como vedação?

A lei fala em violência ou em ameaça, e ainda assim a regra não decide: o sentido da palavra no tipo pode não ser o do art. 44, I, do CP e do art. 28-A do CPP.

### Violência ou grave ameaça como meio ALTERNATIVO a meios não violentos — 36

**O ponto exato.** O tipo se consuma sem violência ("por meio de violência, grave ameaça, fraude ou oferecimento de vantagem"). "Sim" bloqueia benefícios em condutas que os admitem; "Não" esconde a hipótese violenta. A terceira saída é uma condição no registro, como já existe para hediondez e ação penal — o que pede um campo `violencia_condicao`.

| id | diploma | dispositivo | tipo penal | campo | publicado | trecho da lei |
|---|---|---|---|---|---|---|
| 65 | CP | Art. 146 | Constrangimento ilegal | violência | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 65 | CP | Art. 146 | Constrangimento ilegal | grave ameaça | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 73 | CP | Art. 149-A | Tráfico de Pessoas | violência | Sim | grave ameaca, violencia, coacao, fraude |
| 73 | CP | Art. 149-A | Tráfico de Pessoas | grave ameaça | Sim | grave ameaca, violencia, coacao, fraude |
| 157 | CP | Art. 203 | Frustração de direito assegurado por lei trabalhista | violência | Não | fraude ou violencia |
| 157 | CP | Art. 203 | Frustração de direito assegurado por lei trabalhista | grave ameaça | Não | fraude ou violencia |
| 158 | CP | Art. 204 | Frustração de lei sobre a nacionalização do trabalho | violência | Não | fraude ou violencia |
| 158 | CP | Art. 204 | Frustração de lei sobre a nacionalização do trabalho | grave ameaça | Não | fraude ou violencia |
| 277 | CP | Art. 335 | Impedimento, perturbação ou fraude de concorrência | violência | Sim | violencia, grave ameaca, fraude ou oferecimento de vantagem |
| 277 | CP | Art. 335 | Impedimento, perturbação ou fraude de concorrência | grave ameaça | Sim | violencia, grave ameaca, fraude ou oferecimento de vantagem |
| 296 | CP | Art. 358 | Fraude em arrematação judicial | violência | Não | violencia ou fraude |
| 296 | CP | Art. 358 | Fraude em arrematação judicial | grave ameaça | Não | violencia ou fraude |
| 496 | CP | Art. 337-K | Afastamento de licitante | violência | Não | violencia, grave ameaca, fraude ou oferecimento de vantagem |
| 496 | CP | Art. 337-K | Afastamento de licitante | grave ameaça | Não | violencia, grave ameaca, fraude ou oferecimento de vantagem |
| 635 | CP | Art. 149-A, I | Tráfico de pessoas — para remoção de órgãos, tecidos ou part | violência | Sim | grave ameaca, violencia, coacao, fraude |
| 635 | CP | Art. 149-A, I | Tráfico de pessoas — para remoção de órgãos, tecidos ou part | grave ameaça | Sim | grave ameaca, violencia, coacao, fraude |
| 636 | CP | Art. 149-A, II | Tráfico de pessoas com a finalidade de submissão a trabalho | violência | Sim | grave ameaca, violencia, coacao, fraude |
| 636 | CP | Art. 149-A, II | Tráfico de pessoas com a finalidade de submissão a trabalho | grave ameaça | Sim | grave ameaca, violencia, coacao, fraude |
| 637 | CP | Art. 149-A, III | Tráfico de pessoas — para submissão a qualquer tipo de servi | violência | Sim | grave ameaca, violencia, coacao, fraude |
| 637 | CP | Art. 149-A, III | Tráfico de pessoas — para submissão a qualquer tipo de servi | grave ameaça | Sim | grave ameaca, violencia, coacao, fraude |
| 638 | CP | Art. 149-A, IV | Tráfico de pessoas — para adoção ilegal | violência | Não | grave ameaca, violencia, coacao, fraude |
| 638 | CP | Art. 149-A, IV | Tráfico de pessoas — para adoção ilegal | grave ameaça | Não | grave ameaca, violencia, coacao, fraude |
| 639 | CP | Art. 149-A, V | Tráfico de pessoas — para exploração sexual | violência | Não | grave ameaca, violencia, coacao, fraude |
| 639 | CP | Art. 149-A, V | Tráfico de pessoas — para exploração sexual | grave ameaça | Não | grave ameaca, violencia, coacao, fraude |
| 734 | CP | Art. 146, §1º | Constrangimento ilegal com aumento — concurso de mais de 3 p | violência | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 734 | CP | Art. 146, §1º | Constrangimento ilegal com aumento — concurso de mais de 3 p | grave ameaça | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 1343 | CP | Art. 227, § 2º | Mediação para servir a lascívia de outrem — Se o crime é com | violência | Não | violencia, grave ameaca ou fraude |
| 1343 | CP | Art. 227, § 2º | Mediação para servir a lascívia de outrem — Se o crime é com | grave ameaça | Não | violencia, grave ameaca ou fraude |
| 1345 | CP | Art. 228, § 2º | Favorecimento da prostituição ou outra forma de exploração s | violência | Não | violencia, grave ameaca ou fraude |
| 1345 | CP | Art. 228, § 2º | Favorecimento da prostituição ou outra forma de exploração s | grave ameaça | Não | violencia, grave ameaca ou fraude |
| 1347 | CP | Art. 230, § 2º | Rufianismo — Se o crime é cometido mediante violência, grave | violência | Não | violencia, grave ameaca, fraude |
| 1347 | CP | Art. 230, § 2º | Rufianismo — Se o crime é cometido mediante violência, grave | grave ameaça | Não | violencia, grave ameaca, fraude |
| 747 | CPM (DL 1.001/69) | Art. 222, caput | Constrangimento ilegal | violência | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 747 | CPM (DL 1.001/69) | Art. 222, caput | Constrangimento ilegal | grave ameaça | Sim | violencia ou grave ameaca, ou depois de lhe haver reduzido, por qualqu |
| 1397 | ECA | Art. 239, parágrafo único | Promover/auxiliar envio de criança/adolescente ao exterior s | violência | Não | violencia, grave ameaca ou fraude |
| 1397 | ECA | Art. 239, parágrafo único | Promover/auxiliar envio de criança/adolescente ao exterior s | grave ameaça | Não | violencia, grave ameaca ou fraude |

### A lei fala em "ameaça", sem dizer que é grave — 20

**O ponto exato.** A ameaça do tipo é a GRAVE ameaça da lei penal? O art. 147 do CP resolve sozinho ("mal injusto e grave"); estes não.

| id | diploma | dispositivo | tipo penal | campo | publicado | trecho da lei |
|---|---|---|---|---|---|---|
| 513 | CDC (Lei 8.078/90) | Art. 71 | Cobrança vexatória ou abusiva de dívida | grave ameaça | Sim | ameaca |
| 1508 | CE (Lei 4.737/65) | Art. 326-B | Violência política contra candidata ou detentora de mandato | grave ameaça | Sim | ameacar |
| 67 | CP | Art. 147-A | Perseguição | grave ameaça | Sim | ameacando |
| 68 | CP | Art. 147-B | Violência psicológica contra a mulher | grave ameaça | Não | ameaca |
| 267 | CP | Art. 329 | Resistência | grave ameaça | Sim | ameaca |
| 1374 | CP | Art. 329, § 1º | Resistência — Se o ato, em razão da resistência, não se exec | grave ameaça | Sim | ameaca |
| 578 | CP (atualiz.) | Art. 147-A, §1º, III | Stalking qualificado contra mulher por razões de gênero (per | grave ameaça | Sim | ameacando |
| 1053 | CPM (DL 1.001/69) | Art. 177, caput | Resistência mediante ameaça ou violência | grave ameaça | Sim | ameaca |
| 1054 | CPM (DL 1.001/69) | Art. 177, §1º | Resistência mediante ameaça ou violência — Se o ato não se e | grave ameaça | Sim | ameaca |
| 1055 | CPM (DL 1.001/69) | Art. 177, §1º-A | Resistência mediante ameaça ou violência — Se da resistência | grave ameaça | Sim | ameaca |
| 1114 | CPM (DL 1.001/69) | Art. 242, caput | Roubo simples | grave ameaça | Sim | ameaca |
| 1117 | CPM (DL 1.001/69) | Art. 245, caput | Chantagem | grave ameaça | Sim | ameaca |
| 1234 | CPM (DL 1.001/69) | Art. 358, caput | Coação a comandante | grave ameaça | Sim | ameaca |
| 1451 | CPM (DL 1.001/69) | Art. 242, §2º | Roubo qualificado (tempo de paz) | grave ameaça | Sim | ameaca |
| 1452 | CPM (DL 1.001/69) | Art. 242, §3º | Latrocínio (tempo de paz) | grave ameaça | Sim | ameaca |
| 1457 | CPM (DL 1.001/69) | Art. 242, §2º, I | Roubo qualificado pelo emprego de arma (tempo de paz) | grave ameaça | Sim | ameaca |
| 1458 | CPM (DL 1.001/69) | Art. 242, §2º, VIII | Roubo qualificado pela restrição da liberdade da vítima (tem | grave ameaça | Sim | ameaca |
| 547 | Lei 1.579/52 | Art. 4º, I | Impedimento ou tentativa de impedimento de funcionamento de | grave ameaça | Sim | ameaca |
| 428 | Lei 13.869/19 | Art. 15 | Constranger a depor pessoa que deva guardar segredo ou que s | grave ameaça | Não | ameaca |
| 559 | Lei 14.192/21 | Art. 326-B (CE) | Violência política contra a mulher (assediar/constranger/hum | grave ameaça | Sim | ameacar |

### Tipo de PERIGO à pessoa: expõe a vida ou a saúde sem descrever violência — 18

**O ponto exato.** Maus-tratos, abandono e perigo de contágio expõem a vida sem descrever violência. A conduta é violenta para efeito de vedação?

| id | diploma | dispositivo | tipo penal | campo | publicado | trecho da lei |
|---|---|---|---|---|---|---|
| 47 | CP | Art. 133, caput | Abandono de incapaz | violência | Não | abandonar pessoa que esta sob seu cuidado |
| 48 | CP | Art. 133, §1º | Abandono de incapaz com resultado lesão grave | violência | Não | abandonar pessoa que esta sob seu cuidado |
| 49 | CP | Art. 133, §2º | Abandono de incapaz com resultado morte | violência | Não | abandonar pessoa que esta sob seu cuidado |
| 50 | CP | Art. 133, §3º | Abandono de incapaz com aumento de 1/3 (ascendente/tutor/cur | violência | Não | abandonar pessoa que esta sob seu cuidado |
| 54 | CP | Art. 136, caput | Maus-tratos | violência | Sim | expor a perigo a vida ou a saude |
| 55 | CP | Art. 136, §1º | Maus-tratos com resultado lesão grave | violência | Sim | expor a perigo a vida ou a saude |
| 56 | CP | Art. 136, §2º | Maus-tratos com resultado morte | violência | Sim | expor a perigo a vida ou a saude |
| 57 | CP | Art. 136, §3º | Maus-tratos com aumento de 1/3 (contra menor de 14 anos) | violência | Sim | expor a perigo a vida ou a saude |
| 1479 | CP | Art. 133, §3º c/c §1º | Abandono de incapaz com resultado lesão grave e aumento de 1 | violência | Sim | abandonar pessoa que esta sob seu cuidado |
| 1480 | CP | Art. 133, §3º c/c §2º | Abandono de incapaz com resultado morte e aumento de 1/3 | violência | Sim | abandonar pessoa que esta sob seu cuidado |
| 1481 | CP | Art. 136, §3º c/c §1º | Maus-tratos com resultado lesão grave e aumento de 1/3 | violência | Sim | expor a perigo a vida ou a saude |
| 1482 | CP | Art. 136, §3º c/c §2º | Maus-tratos com resultado morte e aumento de 1/3 | violência | Sim | expor a perigo a vida ou a saude |
| 1089 | CPM (DL 1.001/69) | Art. 213, caput | Maus tratos | violência | Sim | privando-a de alimentacao |
| 1090 | CPM (DL 1.001/69) | Art. 213, §1º | Maus tratos — Se do fato resulta lesão grave | violência | Sim | privando-a de alimentacao |
| 1091 | CPM (DL 1.001/69) | Art. 213, §2º | Maus tratos — Se resulta morte | violência | Sim | privando-a de alimentacao |
| 469 | Lei 10.741/03 | Art. 99 | Exposição a perigo da integridade e da saúde da pessoa idosa | violência | Não | sujeitando-a a trabalho excessivo |
| 982 | Lei 10.741/03 | Art. 99, §1º | Exposição a perigo da pessoa idosa com resultado lesão corpo | violência | Não | sujeitando-a a trabalho excessivo |
| 983 | Lei 10.741/03 | Art. 99, §2º | Exposição a perigo da pessoa idosa com resultado morte | violência | Não | sujeitando-a a trabalho excessivo |

### A lei usa "violência" em sentido próprio (psicológica, política, institucional) — 9

**O ponto exato.** Violência psicológica, política, institucional e "física ou psicológica" (bullying) são a violência do art. 44, I, do CP? O nome do tipo usa a palavra, e a conduta pode não ser física.

| id | diploma | dispositivo | tipo penal | campo | publicado | trecho da lei |
|---|---|---|---|---|---|---|
| 68 | CP | Art. 147-B | Violência psicológica contra a mulher | violência | Não | violencia psicologica |
| 312 | CP | Art. 359-P | Violência política | violência | Sim | violencia politica |
| 312 | CP | Art. 359-P | Violência política | grave ameaça | Sim | violencia politica |
| 1329 | Lei 13.869/19 | Art. 15-A | Violência institucional — submeter vítima ou testemunha de c | violência | Não | violencia institucional |
| 1329 | Lei 13.869/19 | Art. 15-A | Violência institucional — submeter vítima ou testemunha de c | grave ameaça | Não | violencia institucional |
| 479 | Lei 14.811/24 | Art. 146-A, caput (CP) | Intimidação sistemática (bullying) | violência | Não | violencia fisica ou psicologica |
| 479 | Lei 14.811/24 | Art. 146-A, caput (CP) | Intimidação sistemática (bullying) | grave ameaça | Não | violencia fisica ou psicologica |
| 480 | Lei 14.811/24 | Art. 146-A, §único (CP) | Intimidação sistemática virtual (cyberbullying) | violência | Não | violencia fisica ou psicologica |
| 480 | Lei 14.811/24 | Art. 146-A, §único (CP) | Intimidação sistemática virtual (cyberbullying) | grave ameaça | Não | violencia fisica ou psicologica |

## Bloco C — Ação penal: regra com ressalva

Uma regra de ação penal alcança estes registros, mas vale só em certas hipóteses. O catálogo publica uma espécie só.

**O ponto exato, por regra:** (a) qual espécie fica no campo, como padrão; (b) se o registro recebe a condição em `acao_condicao`. Hoje só 14 registros têm condição declarada.

### Art. 182 — 78

> Art. 182: Somente se procede mediante representação, se o crime previsto neste título é cometido em prejuízo:

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 86 | CP | Art. 155, caput | Furto simples | Pública Incondicionada |
| 87 | CP | Art. 155, §1º | Furto durante o repouso noturno (aumento de metade) | Pública Incondicionada |
| 88 | CP | Art. 155, §2º | Furto privilegiado (diminuição de 1/3 a 2/3) | Pública Incondicionada |
| 89 | CP | Art. 155, §3º | Furto de energia elétrica ou de valor econômico (equipa | Pública Incondicionada |
| 90 | CP | Art. 155, §4º | Furto qualificado (destruição de obstáculo/abuso de con | Pública Incondicionada |
| 91 | CP | Art. 155, §4º-A | Furto qualificado — emprego de explosivo ou artefato an | Pública Incondicionada |
| 92 | CP | Art. 155, §4º-B | Furto mediante fraude eletrônica | Pública Incondicionada |
| 93 | CP | Art. 155, §5º | Furto de veículo automotor transportado para outro Esta | Pública Incondicionada |
| 95 | CP | Art. 157, caput | Roubo simples | Pública Incondicionada |
| 96 | CP | Art. 157, §2º, II | Roubo majorado — concurso de duas ou mais pessoas | Pública Incondicionada |
| 97 | CP | Art. 157, §2º, III | Roubo majorado — vítima em serviço de transporte de val | Pública Incondicionada |
| 98 | CP | Art. 157, §2º, IV | Roubo majorado — veículo automotor transportado para ou | Pública Incondicionada |
| 99 | CP | Art. 157, §2º, V | Roubo majorado — restrição da liberdade da vítima | Pública Incondicionada |
| 100 | CP | Art. 157, §2º, VI | Roubo majorado — subtração de substâncias explosivas ou | Pública Incondicionada |
| 101 | CP | Art. 157, §2º, VII | Roubo majorado — emprego de arma branca | Pública Incondicionada |
| 102 | CP | Art. 157, §2º-A, I | Roubo majorado — emprego de arma de fogo | Pública Incondicionada |
| 103 | CP | Art. 157, §2º-B | Roubo — emprego de arma de fogo de uso restrito ou proi | Pública Incondicionada |
| 104 | CP | Art. 157, §3º, I | Roubo qualificado pela lesão corporal grave | Pública Incondicionada |
| 105 | CP | Art. 157, §3º, II | Latrocínio — roubo qualificado pelo resultado morte | Pública Incondicionada |
| 106 | CP | Art. 158, caput | Extorsão | Pública Incondicionada |
| 107 | CP | Art. 158, §1º | Extorsão majorada (2+ pessoas, arma) | Pública Incondicionada |
| 108 | CP | Art. 158, §2º | Extorsão qualificada pela lesão grave | Pública Incondicionada |
| 109 | CP | Art. 158, §3º (restrição da liberdade) | Extorsão mediante restrição da liberdade da vítima | Pública Incondicionada |
| 110 | CP | Art. 159, caput | Extorsão mediante sequestro | Pública Incondicionada |
| 111 | CP | Art. 159, §1º | Extorsão mediante sequestro com duração > 24h / menor d | Pública Incondicionada |
| 112 | CP | Art. 159, §2º | Extorsão mediante sequestro — resultado lesão corporal | Pública Incondicionada |
| 113 | CP | Art. 159, §3º | Extorsão mediante sequestro — resultado morte | Pública Incondicionada |
| 114 | CP | Art. 159, §4º | Extorsão mediante sequestro — diminuição de 1/3 a 2/3 ( | Pública Incondicionada |
| 115 | CP | Art. 160 | Extorsão indireta | Pública Incondicionada |
| 122 | CP | Art. 165 | Dano em coisa de valor artístico, arqueológico ou histó | Pública Incondicionada |
| 123 | CP | Art. 166 | Alteração de local especialmente protegido | Pública Incondicionada |
| 127 | CP | Art. 171, caput | Estelionato | Pública Incondicionada |
| 128 | CP | Art. 171, §2º-A | Fraude eletrônica (estelionato digital) | Pública Incondicionada |
| 129 | CP | Art. 180, caput | Receptação simples | Pública Incondicionada |
| 130 | CP | Art. 180, §1º | Receptação qualificada — no exercício de atividade come | Pública Incondicionada |
| 131 | CP | Art. 180, §3º | Receptação culposa | Pública Incondicionada |
| 132 | CP | Art. 180-A | Receptação de animal (semovente domesticável de produçã | Pública Incondicionada |
| 582 | CP | Art. 155, §4º, I | Furto qualificado com destruição ou rompimento de obstá | Pública Incondicionada |
| 583 | CP | Art. 155, §4º, II | Furto qualificado com abuso de confiança, fraude, escal | Pública Incondicionada |
| 584 | CP | Art. 155, §4º, III | Furto qualificado com emprego de chave falsa | Pública Incondicionada |
| 585 | CP | Art. 155, §4º, IV | Furto qualificado mediante concurso de duas ou mais pes | Pública Incondicionada |
| 586 | CP | Art. 155, §6º | Furto de semovente de produção, animal doméstico ou dis | Pública Incondicionada |
| 587 | CP | Art. 155, §7º | Furto de substâncias explosivas ou de arma de fogo | Pública Incondicionada |
| 588 | CP | Art. 157, §2º-A, II | Roubo majorado — destruição de obstáculo com explosivo | Pública Incondicionada |
| 589 | CP | Art. 171, §2º, I | Estelionato — venda ou hipoteca de coisa alheia como pr | Pública Incondicionada |
| 590 | CP | Art. 171, §2º, II | Estelionato — alienação ou oneração fraudulenta de cois | Pública Incondicionada |
| 591 | CP | Art. 171, §2º, III | Estelionato — defraudação de penhor | Pública Incondicionada |
| 592 | CP | Art. 171, §2º, IV | Estelionato — fraude na entrega de coisa | Pública Incondicionada |
| 593 | CP | Art. 171, §2º, V | Estelionato — fraude para receber seguro ou indenização | Pública Incondicionada |
| 594 | CP | Art. 171, §2º, VI | Estelionato — fraude no pagamento por meio de cheque | Pública Incondicionada |
| 595 | CP | Art. 171, §3º | Estelionato contra a Previdência Social (fraude previde | Pública Incondicionada |
| 596 | CP | Art. 158, §1º, I | Extorsão com aumento — concurso de duas ou mais pessoas | Pública Incondicionada |
| 597 | CP | Art. 158, §1º, II | Extorsão com aumento — emprego de arma | Pública Incondicionada |
| 811 | CP | Art. 157, §1º-A | Roubo qualificado — subtração de bens que comprometam s | Pública Incondicionada |
| 812 | CP | Art. 157, §2º, VIII | Roubo majorado — subtração de fios/cabos de energia, te | Pública Incondicionada |
| 813 | CP | Art. 157, §2º, IX | Roubo majorado — subtração de celular/computador/dispos | Pública Incondicionada |
| 814 | CP | Art. 157, §2º, X | Roubo majorado — subtração de arma de fogo | Pública Incondicionada |
| 815 | CP | Art. 155, §4º, V | Furto qualificado — bens de órgãos públicos ou serviços | Pública Incondicionada |
| 816 | CP | Art. 155, §8º | Furto de fios, cabos ou equipamentos de energia, telefo | Pública Incondicionada |
| 817 | CP | Art. 158, §3º (lesão grave) | Extorsão mediante restrição da liberdade — resultado le | Pública Incondicionada |
| 818 | CP | Art. 158, §3º (morte) | Extorsão mediante restrição da liberdade — resultado mo | Pública Incondicionada |
| 820 | CP | Art. 171, §2º, VII | Estelionato — cessão de conta bancária para financiar/o | Pública Incondicionada |
| 994 | CP | Art. 162, caput | Alteração de marca ou sinal indicativo de propriedade d | Pública Incondicionada |
| 995 | CP | Art. 172, caput | Duplicata simulada (emitir fatura, duplicata ou nota de | Pública Incondicionada |
| 996 | CP | Art. 173, caput | Abuso de incapazes (abusar de necessidade, paixão ou in | Pública Incondicionada |
| 997 | CP | Art. 174, caput | Induzimento à especulação (abusar da inexperiência, sim | Pública Incondicionada |
| 998 | CP | Art. 175, caput | Fraude no comércio (enganar o adquirente ou consumidor, | Pública Incondicionada |
| 999 | CP | Art. 177, caput | Fraude na fundação de sociedade por ações | Pública Incondicionada |
| 1000 | CP | Art. 178, caput | Emissão irregular de conhecimento de depósito ou warran | Pública Incondicionada |
| 1316 | CP | Art. 155, §9º | Furto por integrante de organização criminosa ultraviol | Pública Incondicionada |
| 1317 | CP | Art. 157, §5º | Latrocínio (roubo com resultado morte) por integrante d | Pública Incondicionada |
| 1341 | CP | Art. 175, § 1º | Fraude no comércio (enganar o adquirente ou consumidor, | Pública Incondicionada |
| 1483 | CP | Art. 159, §4º c/c §1º | Extorsão mediante sequestro qualificada com delação pre | Pública Incondicionada |
| 1484 | CP | Art. 159, §4º c/c §2º | Extorsão mediante sequestro com lesão grave e delação p | Pública Incondicionada |
| 1485 | CP | Art. 159, §4º c/c §3º | Extorsão mediante sequestro com resultado morte e delaç | Pública Incondicionada |
| 1490 | CP | Art. 158, §2º c/c art. 157, §3º (morte) | Extorsão qualificada pelo resultado morte | Pública Incondicionada |
| 580 | CP (atualiz.) | Art. 171, §4º | Estelionato contra idoso ou vulnerável (aumento de 1/3 | Pública Incondicionada |
| 576 | Lei 14.478/22 | Art. 171-A (CP) | Fraude com utilização de ativos virtuais, valores mobil | Pública Incondicionada |

### Art. 145 — 23

> Art. 145: Nos crimes previstos neste Capítulo somente se procede mediante queixa, salvo quando, no caso do art

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 58 | CP | Art. 138, caput | Calúnia | Ação Penal Privada |
| 59 | CP | Art. 139 | Difamação | Ação Penal Privada |
| 124 | CP | Art. 168, caput | Apropriação indébita | Pública Incondicionada |
| 125 | CP | Art. 168-A | Apropriação indébita previdenciária | Pública Incondicionada |
| 126 | CP | Art. 169 | Apropriação de coisa havida por erro, caso fortuito ou | Pública Incondicionada |
| 167 | CP | Art. 227 | Mediação para servir a lascívia de outrem | Pública Incondicionada |
| 168 | CP | Art. 228 | Favorecimento da prostituição ou de outra forma de expl | Pública Incondicionada |
| 169 | CP | Art. 229 | Casa de prostituição | Pública Incondicionada |
| 170 | CP | Art. 230 | Rufianismo | Pública Incondicionada |
| 245 | CP | Art. 311-A | Fraudes em certames de interesse público | Pública Incondicionada |
| 549 | CP | Art. 232-A, §1º | Promoção de migração ilegal — saída de pessoa do territ | Pública Incondicionada |
| 598 | CP | Art. 168, §1º, I | Apropriação indébita com aumento — coisa recebida em de | Pública Incondicionada |
| 599 | CP | Art. 168, §1º, II | Apropriação indébita com aumento — na qualidade de tuto | Pública Incondicionada |
| 600 | CP | Art. 168, §1º, III | Apropriação indébita com aumento — em razão de ofício/e | Pública Incondicionada |
| 730 | CP | Art. 138, §1º | Calúnia — quem sabendo falsa a imputação a propala ou d | Ação Penal Privada |
| 1002 | CP | Art. 232-A, caput | Promoção de migração ilegal (promover, com fim de obter | Pública Incondicionada |
| 1342 | CP | Art. 227, § 1º | Favorecimento da prostituição — vítima maior de 14 e me | Pública Incondicionada |
| 1343 | CP | Art. 227, § 2º | Mediação para servir a lascívia de outrem — Se o crime | Pública Incondicionada |
| 1344 | CP | Art. 228, § 1º | Favorecimento da prostituição ou outra forma de explora | Pública Incondicionada |
| 1345 | CP | Art. 228, § 2º | Favorecimento da prostituição ou outra forma de explora | Pública Incondicionada |
| 1346 | CP | Art. 230, § 1º | Rufianismo — Se a vítima é menor de 18 (dezoito) e maio | Pública Incondicionada |
| 1347 | CP | Art. 230, § 2º | Rufianismo — Se o crime é cometido mediante violência, | Pública Incondicionada |
| 1368 | CP | Art. 311-A, § 2º | Fraudes em certames de interesse público — Se da ação o | Pública Incondicionada |

### Art. 199 — 14

> Art. 199: Nos crimes previstos neste Título somente se procede mediante queixa, salvo quanto ao crime do art.

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 534 | Lei 9.279/96 | Art. 183 | Crimes contra patentes (fabricar/usar/vender produto ob | Ação Penal Privada |
| 535 | Lei 9.279/96 | Art. 184 | Crime contra patente de invenção ou de modelo de utilid | Ação Penal Privada |
| 536 | Lei 9.279/96 | Art. 189 | Crime contra registro de marca (reproduzir/imitar/falsi | Ação Penal Privada |
| 537 | Lei 9.279/96 | Art. 190 | Crime contra registro de marca — importação, venda ou e | Ação Penal Privada |
| 538 | Lei 9.279/96 | Art. 195 | Crime de concorrência desleal | Ação Penal Privada |
| 854 | Lei 9.279/96 | Art. 185 | Fornecimento de componente de produto patenteado ou de | Ação Penal Privada |
| 855 | Lei 9.279/96 | Art. 187 | Fabricação não autorizada de produto que incorpore dese | Ação Penal Privada |
| 856 | Lei 9.279/96 | Art. 188 | Crime contra registro de desenho industrial (exportar, | Ação Penal Privada |
| 857 | Lei 9.279/96 | Art. 191 | Reprodução ou imitação de armas, brasões ou distintivos | Pública Incondicionada |
| 858 | Lei 9.279/96 | Art. 192 | Falsa indicação geográfica | Ação Penal Privada |
| 859 | Lei 9.279/96 | Art. 193 | Uso de termo retificativo sem ressalva da verdadeira pr | Ação Penal Privada |
| 860 | Lei 9.279/96 | Art. 194 | Uso de sinal ou marca que indique procedência falsa | Ação Penal Privada |
| 1425 | Lei 9.279/96 | Art. 184, I | Crime contra patente — comércio ou estoque de produto o | Pública Incondicionada |
| 1426 | Lei 9.279/96 | Art. 184, II | Crime contra patente — importação de produto patenteado | Pública Incondicionada |

### Art. 145, parágrafo único — 7

> Art. 145, parágrafo único: Procede-se mediante requisição do Ministro da Justiça, no caso do inciso I do caput

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 60 | CP | Art. 140, caput | Injúria simples | Ação Penal Privada |
| 61 | CP | Art. 140, §2º | Injúria real | Ação Penal Privada |
| 62 | CP | Art. 140, §3º | Injúria por elementos referentes a religião ou à condiç | Pública Condicionada à Representação |
| 63 | CP | Art. 141, III | Crimes contra honra com aumento de 1/3 (meios que facil | Ação Penal Privada |
| 64 | CP | Art. 141, §2º | Calúnia cometida ou divulgada em redes sociais — pena e | Ação Penal Privada |
| 1504 | CP | Art. 141, §2º c/c Art. 139 | Difamação cometida ou divulgada em redes sociais — pena | Ação Penal Privada |
| 1505 | CP | Art. 141, §2º c/c Art. 140 | Injúria cometida ou divulgada em redes sociais — pena e | Ação Penal Privada |

### Art. 167 — 7

> Art. 167: Nos casos do art. 163, do inciso IV do seu parágrafo e do art. 164, somente se procede mediante quei

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 119 | CP | Art. 163, caput | Dano simples | Ação Penal Privada |
| 120 | CP | Art. 163, parágrafo único | Dano qualificado | Pública Incondicionada |
| 121 | CP | Art. 164 | Introdução ou abandono de animais em propriedade alheia | Ação Penal Privada |
| 601 | CP | Art. 163, §único, I | Dano qualificado — com violência à pessoa ou grave amea | Pública Incondicionada |
| 602 | CP | Art. 163, §único, II | Dano qualificado — com emprego de substância inflamável | Pública Incondicionada |
| 603 | CP | Art. 163, §único, III | Dano qualificado — contra o patrimônio da União, de Est | Pública Incondicionada |
| 604 | CP | Art. 163, §único, IV | Dano qualificado — por motivo egoístico ou com prejuízo | Pública Incondicionada |

### Art. 151, § 4º — 6

> Art. 151, § 4º: Somente se procede mediante representação, salvo nos casos do § 1º, IV, e do § 3º

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 76 | CP | Art. 151 | Violação de correspondência | Pública Condicionada à Representação |
| 77 | CP | Art. 151, §1º, I | Sonegação ou destruição de correspondência | Pública Condicionada à Representação |
| 78 | CP | Art. 151, §1º, II | Violação de comunicação telegráfica, radioelétrica ou t | Pública Condicionada à Representação |
| 640 | CP | Art. 151, §1º, III | Impedir a comunicação telegráfica, radioelétrica ou tel | Pública Condicionada à Representação |
| 641 | CP | Art. 151, §1º, IV | Instalar ou utilizar estação ou aparelho radioelétrico | Pública Incondicionada |
| 1340 | CP | Art. 151, § 3º | Violação de correspondência com abuso de função em serv | Pública Incondicionada |

### Art. 154-B — 6

> Art. 154-B: Nos crimes definidos no art. 154-A, somente se procede mediante representação, salvo se o crime é

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 82 | CP | Art. 154-A, caput | Invasão de dispositivo informático | Pública Condicionada à Representação |
| 83 | CP | Art. 154-A, §2º | Invasão de dispositivo informático com aumento de 1/3 a | Pública Condicionada à Representação |
| 84 | CP | Art. 154-A, §3º | Invasão de dispositivo com obtenção de conteúdo privado | Pública Condicionada à Representação |
| 85 | CP | Art. 154-A, §4º | Invasão de dispositivo com divulgação/comercialização/t | Pública Condicionada à Representação |
| 735 | CP | Art. 154-A, §5º | Invasão de dispositivo informático com aumento — se con | Pública Condicionada à Representação |
| 1486 | CP | Art. 154-A, §5º c/c §3º | Invasão de dispositivo informático qualificada com aume | Pública Condicionada à Representação |

### Art. 161, § 3º — 3

> Art. 161, § 3º: Se a propriedade é particular, e não há emprego de violência, somente se procede mediante quei

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 116 | CP | Art. 161, caput | Alteração de limites (usurpação) | Pública Incondicionada |
| 117 | CP | Art. 161, §1º, I | Usurpação de águas | Pública Incondicionada |
| 118 | CP | Art. 161, §1º, II | Esbulho possessório | Pública Incondicionada |

### Art. 12, § 3º — 3

> Art. 12, § 3º: Nos crimes previstos neste artigo, somente se procede mediante queixa, salvo:

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 539 | Lei 9.609/98 | Art. 12, caput | Violação de direitos de autor de programa de computador | Ação Penal Privada |
| 540 | Lei 9.609/98 | Art. 12, §1º | Violação de direitos de autor de programa de computador | Ação Penal Privada |
| 541 | Lei 9.609/98 | Art. 12, §2º | Venda/exposição à venda/introdução no País/aquisição/gu | Ação Penal Privada |

### Art. 153, § 1º — 1

> Art. 153, § 1º: Somente se procede mediante representação. (Parágrafo único renumerado pela Lei nº 9.983, de 2

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 80 | CP | Art. 153, §1º-A | Divulgação de informações sigilosas da administração pú | Pública Incondicionada |

### Art. 345, parágrafo único — 1

> Art. 345, parágrafo único: Se não há emprego de violência, somente se procede mediante queixa

| id | diploma | dispositivo | tipo penal | publicado |
|---|---|---|---|---|
| 283 | CP | Art. 345 | Exercício arbitrário das próprias razões | Pública Incondicionada |

## Bloco D — Pontos abertos fora desses dois campos

| assunto | alcance | o ponto exato |
|---|---|---|
| Mínimo legal na Lei 6.538/78 | 7 registros | A lei comina "reclusão até oito anos" sem grau mínimo, e não tem regra de parte geral que o fixe (o CE tem o art. 284; o CPM, o art. 58). Qual é o mínimo? Enquanto isso, o motor presume a pena máxima como pena concreta. |
| Hediondez condicional | 24 registros | `hediondo_condicao` é texto livre, sem fundamento próprio. Padronizar e citar o dispositivo de cada uma. |
| CPM contra o rol de hediondos | 374 registros | O art. 1º, parágrafo único, VI, da Lei 8.072/90 exige "identidade" com o rol. Varrer o Livro II do CPM, artigo a artigo; hoje só oito estão decididos. |
| Tentativa | 1.512 registros | Campo sem critério escrito nem conferência. Definir a régua (atentado, unissubsistente, omissivo próprio, culposo) e conferir primeiro os 241 que dizem "não". |
| Elemento subjetivo | 1.512 registros | Preterdoloso em só 21 tipos; a régua entre preterdolo e qualificação pelo resultado nunca foi escrita. |
| Nome do tipo | 12 registros | Nomes que são cópia do texto da lei (os cortados no meio da palavra já foram corrigidos). O nome deve ser o *nomen iuris*, a conduta, ou os dois? |
| ANPP no crime militar | 394 registros | O art. 90-A da Lei 9.099 afasta os juizados da Justiça Militar. A vedação alcança o art. 28-A do CPP, que não está na Lei 9.099? |
| Atributos não calculados | 35 registros | Nos tipos sem pena privativa, o motor não calcula desistência voluntária, arrependimento eficaz e perdão judicial. Eles dependem da espécie de pena? |
| Progressão no Título XII do CP | arts. 359-A a 359-T | Os incisos I e II do art. 112 da LEP ressalvam o Título XII. Para o reincidente, 1/6 pelo caput ou 20% pelo inciso III? O motor mostra a dúvida em vez de escondê-la. |
| Progressão do reincidente genérico | crimes comuns | Aplicado em 19/09/2026 (20% sem violência, 30% com violência — LEP, art. 112, II e III, redação da Lei 15.402/2026). **Falta a sua confirmação da leitura.** |

## Bloco E — Tentativa: duas famílias que a lei não decide sozinha

Acrescentado em 22/09/2026. A regra que a **lei** decide já entrou: as 13 contravenções que constavam como admitindo tentativa passaram a "Não" (LCP, art. 4º). Estas duas famílias são doutrina, e ficam com você.

### Crimes de atentado — 15

O núcleo do tipo já contém o "tentar" ("evadir-se ou tentar evadir-se", "votar ou tentar votar", "tentar desmembrar parte do território"). Para a doutrina majoritária, nesses crimes a tentativa é a própria consumação, e por isso não se pune tentativa de tentativa. **O ponto exato:** o campo passa a "Não" nestes registros?

| id | diploma | dispositivo | tipo penal |
|---|---|---|---|
| 290 | CP | Art. 352 | Evasão mediante violência contra a pessoa |
| 309 | CP | Art. 359-L | Abolição violenta do Estado Democrático de Direito |
| 310 | CP | Art. 359-M | Tentativa de deposição do governo legitimamente constituído |
| 496 | CP | Art. 337-K | Afastamento de licitante |
| 529 | CE (Lei 4.737/65) | Art. 309 | Votar ou tentar votar mais de uma vez, ou em lugar de outrem |
| 678 | CPM (DL 1.001/69) | Art. 142, caput | Tentativa contra a soberania do Brasil |
| 716 | CPM (DL 1.001/69) | Art. 356, caput | Favor ao inimigo |
| 720 | CPM (DL 1.001/69) | Art. 383, caput | Dano especial |
| 783 | CE (Lei 4.737/65) | Art. 312 | Violar ou tentar violar o sigilo do voto |
| 1016 | CPM (DL 1.001/69) | Art. 140, caput | Entendimento para empenhar o Brasil à neutralidade ou à guerra |
| 1060 | CPM (DL 1.001/69) | Art. 180, caput | Evasão de prêso ou internado |
| 1116 | CPM (DL 1.001/69) | Art. 244, caput | Extorsão mediante seqüestro (tempo de paz) |
| 1117 | CPM (DL 1.001/69) | Art. 245, caput | Chantagem |
| 1135 | CPM (DL 1.001/69) | Art. 269, caput | Explosão |
| 1239 | CPM (DL 1.001/69) | Art. 363, caput | Cobardia |

### Crimes preterdolosos — 9

No preterdolo o resultado agravador é culposo, e a doutrina majoritária nega a tentativa. Os 12 preterdolosos restantes do catálogo já constam como não admitindo. **O ponto exato:** a régua vale para todos, ou há exceção a preservar?

| id | diploma | dispositivo | tipo penal |
|---|---|---|---|
| 104 | CP | Art. 157, §3º, I | Roubo qualificado pela lesão corporal grave |
| 105 | CP | Art. 157, §3º, II | Latrocínio — roubo qualificado pelo resultado morte |
| 108 | CP | Art. 158, §2º | Extorsão qualificada pela lesão grave |
| 112 | CP | Art. 159, §2º | Extorsão mediante sequestro — resultado lesão corporal grave |
| 113 | CP | Art. 159, §3º | Extorsão mediante sequestro — resultado morte |
| 134 | CP | Art. 213, §1º | Estupro com resultado lesão corporal grave ou contra menor de 18 / mai |
| 135 | CP | Art. 213, §2º | Estupro com resultado morte |
| 141 | CP | Art. 217-A, §3º | Estupro de vulnerável com resultado lesão grave |
| 142 | CP | Art. 217-A, §4º | Estupro de vulnerável com resultado morte |
