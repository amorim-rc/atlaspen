# Violência e grave ameaça: catálogo × texto da lei

Gerado por `scripts/robos/auditor/conferir_violencia.py`. 3058 respostas conferidas: **2878 conferem**, **88 conferem com ressalva** (o catálogo declara a condição que a regra reconhece), **33 divergem** e **59 pedem juízo**.

O critério está em `scripts/violencia.py`: `violencia` afirma violência **dolosa** contra **pessoa**, como meio ou como núcleo do tipo. Violência contra a coisa não conta; crime culposo não conta; cláusula de resultado não descreve a conduta.

## Divergências

O catálogo e a lei não dizem a mesma coisa. Cada linha é uma pergunta.

| id | diploma | dispositivo | tipo | campo | catálogo | derivado | regra | o que a lei diz |
|---|---|---|---|---|---|---|---|---|
| 75 | CP | Art. 150, §1º | Violação de domicílio qualificada (noturna/com violência/arm | violencia | Não | Sim | violencia-meio | o durante a noite, ou em lugar ermo, ou com o emprego de violencia ou de arma, ou por duas |
| 102 | CP | Art. 157, §2º-A, I | Roubo majorado — emprego de arma de fogo | violencia | Sim | Não | meio-alternativo | luido pela lei nº 13.654, de 2018) se a violencia ou ameaca e exercida com emprego de arma |
| 102 | CP | Art. 157, §2º-A, I | Roubo majorado — emprego de arma de fogo | grave_ameaca | Sim | Não | meio-alternativo | luido pela lei nº 13.654, de 2018) se a violencia ou ameaca e exercida com emprego de arma |
| 140 | CP | Art. 217-A, caput | Estupro de vulnerável | violencia | Sim | Não | silencio-da-lei |  |
| 141 | CP | Art. 217-A, §3º | Estupro de vulnerável com resultado lesão grave | violencia | Sim | Não | silencio-da-lei |  |
| 142 | CP | Art. 217-A, §4º | Estupro de vulnerável com resultado morte | violencia | Sim | Não | silencio-da-lei |  |
| 611 | CP | Art. 217-A, §1º | Estupro de vulnerável — vítima deficiente ou sem discernimen | violencia | Sim | Não | silencio-da-lei |  |
| 680 | CPM (DL 1.001/69) | Art. 150, caput | Organização de grupo para a prática de violência | violencia | Sim | Não | violencia-a-pessoa-ou-a-coisa | lico de propriedade militar, praticando violencia a pessoa ou a coisa publica ou particula |
| 1082 | CPM (DL 1.001/69) | Art. 209, §3º | Lesão leve — Se os resultados previstos nos §§ 1º e 2º deste | violencia | Não | Sim | violencia-nucleo | lesao leve ofender a integridade corporal ou a saude de outrem: |
| 1085 | CPM (DL 1.001/69) | Art. 211, caput | Participação em rixa | violencia | Não | Sim | rixa | participacao em rixa participar de rixa, salvo para separar os contendores: |
| 1087 | CPM (DL 1.001/69) | Art. 212, §1º | Abandono de pessoa — Se do abandono resulta lesão grave | violencia | Sim | Não | silencio-da-lei |  |
| 1269 | CPM (DL 1.001/69) | Art. 389, par. único | Violência contra superior ou militar de serviço — Se ao crim | violencia | Sim | Não | silencio-da-lei |  |
| 1280 | CPM (DL 1.001/69) | Art. 400, I | Homicídio simples | violencia | Sim | Não | silencio-da-lei |  |
| 1281 | CPM (DL 1.001/69) | Art. 400, III | Homicídio qualificado em presença do inimigo | violencia | Sim | Não | silencio-da-lei |  |
| 1285 | CPM (DL 1.001/69) | Art. 403, §1º | Lesão leve — No caso do § 1° do art. 209 | violencia | Sim | Não | silencio-da-lei |  |
| 1286 | CPM (DL 1.001/69) | Art. 403, §2º | Lesão leve — No caso do § 2º do art. 209 | violencia | Sim | Não | silencio-da-lei |  |
| 1287 | CPM (DL 1.001/69) | Art. 403, §3º | Lesão leve — No caso do § 3º do art. 209 | violencia | Sim | Não | silencio-da-lei |  |
| 1389 | CPM (DL 1.001/69) | Art. 403, §3º (no caso de morte) | Lesão leve (no caso de morte) | violencia | Sim | Não | silencio-da-lei |  |
| 1451 | CPM (DL 1.001/69) | Art. 242, §2º | Roubo qualificado (tempo de paz) | grave_ameaca | Sim | Não | ameaca-sem-qualificativo | ameaca |
| 1452 | CPM (DL 1.001/69) | Art. 242, §3º | Latrocínio (tempo de paz) | grave_ameaca | Sim | Não | ameaca-sem-qualificativo | ameaca |
| 1456 | CPM (DL 1.001/69) | Art. 400, II | Homicídio privilegiado em presença do inimigo | violencia | Sim | Não | silencio-da-lei |  |
| 1457 | CPM (DL 1.001/69) | Art. 242, §2º, I | Roubo qualificado pelo emprego de arma (tempo de paz) | violencia | Sim | Não | meio-alternativo | aumenta-se de um terco ate metade: se a violencia ou ameaca e exercida com emprego de arma |
| 1457 | CPM (DL 1.001/69) | Art. 242, §2º, I | Roubo qualificado pelo emprego de arma (tempo de paz) | grave_ameaca | Sim | Não | meio-alternativo | aumenta-se de um terco ate metade: se a violencia ou ameaca e exercida com emprego de arma |
| 1458 | CPM (DL 1.001/69) | Art. 242, §2º, VIII | Roubo qualificado pela restrição da liberdade da vítima (tem | grave_ameaca | Sim | Não | ameaca-sem-qualificativo | ameaca |
| 1520 | CPM (DL 1.001/69) | Art. 208, par. único | Genocídio — casos assimilados (lesões graves, condições de e | violencia | Não | Sim | violencia-nucleo | genocidio matar membros de um grupo nacional, etnico, r |
| 1522 | CPM (DL 1.001/69) | Art. 242, §2º, V | Roubo qualificado pela lesão grave causada dolosamente (temp | grave_ameaca | Sim | Não | ameaca-sem-qualificativo | ameaca |
| 1523 | CPM (DL 1.001/69) | Art. 242, §2º, VI | Roubo qualificado pela morte não querida pelo agente (tempo  | grave_ameaca | Sim | Não | ameaca-sem-qualificativo | ameaca |
| 547 | Lei 1.579/52 | Art. 4º, I | Impedimento ou tentativa de impedimento de funcionamento de  | violencia | Não | Sim | violencia-meio | itui crime: impedir, ou tentar impedir, mediante violencia, ameaca ou assuadas, o regular  |
| 551 | Lei 2.889/56 | Art. 1º, a | Genocídio — matar membros do grupo | violencia | Sim | Não | silencio-da-lei |  |
| 552 | Lei 2.889/56 | Art. 1º, b | Genocídio — causar lesão grave à integridade física ou menta | violencia | Sim | Não | silencio-da-lei |  |
| 642 | Lei 9.434/97 | Art. 14, §2º | Remoção de tecidos ou órgãos em pessoa viva com resultado le | violencia | Sim | Não | pessoa-ou-cadaver | r tecidos, orgaos ou partes do corpo de pessoa ou cadaver, em desacordo com as disposicoes |
| 643 | Lei 9.434/97 | Art. 14, §3º | Remoção de tecidos ou órgãos em pessoa viva com resultado le | violencia | Sim | Não | pessoa-ou-cadaver | r tecidos, orgaos ou partes do corpo de pessoa ou cadaver, em desacordo com as disposicoes |
| 989 | Lei 9.434/97 | Art. 14, §4º | Remoção de tecidos ou órgãos em pessoa viva com resultado mo | violencia | Sim | Não | pessoa-ou-cadaver | r tecidos, orgaos ou partes do corpo de pessoa ou cadaver, em desacordo com as disposicoes |

## Pedem juízo

As regras não decidem: a violência é meio alternativo a outros não violentos, ou a palavra está em sentido que a regra não resolve.

| id | diploma | dispositivo | tipo | campo | catálogo | derivado | regra | o que a lei diz |
|---|---|---|---|---|---|---|---|---|
| 720 | CPM (DL 1.001/69) | Art. 383, caput | Dano especial | violencia | Não | — | remissao | ou tentar praticar qualquer dos crimes definidos nos arts. 262, 263, §§ 1º e 2º, e 264, em |
| 720 | CPM (DL 1.001/69) | Art. 383, caput | Dano especial | grave_ameaca | Não | — | remissao | ou tentar praticar qualquer dos crimes definidos nos arts. 262, 263, §§ 1º e 2º, e 264, em |
| 1233 | CPM (DL 1.001/69) | Art. 357, caput | Tentativa contra a soberania do Brasil (tempo de guerra) | violencia | Não | — | remissao | a do brasil praticar o nacional o crime definido no art. 142: |
| 1233 | CPM (DL 1.001/69) | Art. 357, caput | Tentativa contra a soberania do Brasil (tempo de guerra) | grave_ameaca | Não | — | remissao | a do brasil praticar o nacional o crime definido no art. 142: |
| 1243 | CPM (DL 1.001/69) | Art. 368, caput (co-autores) | Motim, revolta ou conspiração em tempo de guerra — co-autore | violencia | Não | — | remissao | onspiracao praticar qualquer dos crimes definidos nos arts. 149 e seu paragrafo unico, e 1 |
| 1243 | CPM (DL 1.001/69) | Art. 368, caput (co-autores) | Motim, revolta ou conspiração em tempo de guerra — co-autore | grave_ameaca | Não | — | remissao | onspiracao praticar qualquer dos crimes definidos nos arts. 149 e seu paragrafo unico, e 1 |
| 1265 | CPM (DL 1.001/69) | Art. 386, caput | Crimes de perigo comum (tempo de guerra) | violencia | Não | — | remissao | go comum praticar crime de perigo comum definido nos arts. 268 a 276 e 278, na modalidade  |
| 1265 | CPM (DL 1.001/69) | Art. 386, caput | Crimes de perigo comum (tempo de guerra) | grave_ameaca | Não | — | remissao | go comum praticar crime de perigo comum definido nos arts. 268 a 276 e 278, na modalidade  |
| 1266 | CPM (DL 1.001/69) | Art. 387, caput | Recusa de obediência ou oposição | violencia | Não | — | remissao | resenca do inimigo, qualquer dos crimes definidos nos arts. 163 e 164: |
| 1266 | CPM (DL 1.001/69) | Art. 387, caput | Recusa de obediência ou oposição | grave_ameaca | Não | — | remissao | resenca do inimigo, qualquer dos crimes definidos nos arts. 163 e 164: |
| 1268 | CPM (DL 1.001/69) | Art. 389, caput | Violência contra superior ou militar de serviço (tempo de gu | violencia | Sim | — | remissao | de servico praticar qualquer dos crimes definidos nos arts. 157 e 158, a que esteja comina |
| 1268 | CPM (DL 1.001/69) | Art. 389, caput | Violência contra superior ou militar de serviço (tempo de gu | grave_ameaca | Não | — | remissao | de servico praticar qualquer dos crimes definidos nos arts. 157 e 158, a que esteja comina |
| 1270 | CPM (DL 1.001/69) | Art. 390, caput | Abandono de posto em presença do inimigo | violencia | Não | — | remissao | do inimigo, crime de abandono de posto, definido no art. 195: |
| 1270 | CPM (DL 1.001/69) | Art. 390, caput | Abandono de posto em presença do inimigo | grave_ameaca | Não | — | remissao | do inimigo, crime de abandono de posto, definido no art. 195: |
| 1284 | CPM (DL 1.001/69) | Art. 403, caput | Lesão leve | violencia | Sim | — | remissao | praticar, em presenca do inimigo, crime definido no art. 209: |
| 1284 | CPM (DL 1.001/69) | Art. 403, caput | Lesão leve | grave_ameaca | Não | — | remissao | praticar, em presenca do inimigo, crime definido no art. 209: |
| 1288 | CPM (DL 1.001/69) | Art. 404, caput | Furto (tempo de guerra) | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1288 | CPM (DL 1.001/69) | Art. 404, caput | Furto (tempo de guerra) | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1289 | CPM (DL 1.001/69) | Art. 405, caput | Roubo ou extorsão (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1289 | CPM (DL 1.001/69) | Art. 405, caput | Roubo ou extorsão (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1294 | CPM (DL 1.001/69) | Art. 408, caput | Violência carnal | violencia | Sim | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1294 | CPM (DL 1.001/69) | Art. 408, caput | Violência carnal | grave_ameaca | Não | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1295 | CPM (DL 1.001/69) | Art. 408, par. único, a) | Violência carnal — Se da violência resulta | violencia | Sim | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1295 | CPM (DL 1.001/69) | Art. 408, par. único, a) | Violência carnal — Se da violência resulta | grave_ameaca | Não | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1296 | CPM (DL 1.001/69) | Art. 408, par. único, b) | Violência carnal — morte | violencia | Sim | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1296 | CPM (DL 1.001/69) | Art. 408, par. único, b) | Violência carnal — morte | grave_ameaca | Não | — | remissao | qualquer dos crimes de violencia carnal definidos nos arts. 232 e 233, em lugar de efetiva |
| 1436 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §4º | Furto qualificado — noturno (tempo de guerra) | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1436 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §4º | Furto qualificado — noturno (tempo de guerra) | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1437 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §5º | Furto qualificado — coisa pertencente à Fazenda Pública (tem | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1437 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §5º | Furto qualificado — coisa pertencente à Fazenda Pública (tem | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1438 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §6º | Furto qualificado (tempo de guerra) | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1438 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §6º | Furto qualificado (tempo de guerra) | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1439 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §6º-A | Furto qualificado — material de uso restrito militar (tempo  | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1439 | CPM (DL 1.001/69) | Art. 404 c/c art. 240, §6º-A | Furto qualificado — material de uso restrito militar (tempo  | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1440 | CPM (DL 1.001/69) | Art. 404 c/c art. 241, caput | Furto de uso (tempo de guerra) | violencia | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1440 | CPM (DL 1.001/69) | Art. 404 c/c art. 241, caput | Furto de uso (tempo de guerra) | grave_ameaca | Não | — | remissao | furto praticar crime de furto definido nos arts. 240 e 241 e seus paragrafos, em zona de o |
| 1441 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §1º | Roubo impróprio (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1441 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §1º | Roubo impróprio (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1442 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §2º | Roubo qualificado (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1442 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §2º | Roubo qualificado (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1443 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §3º | Latrocínio (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1443 | CPM (DL 1.001/69) | Art. 405 c/c art. 242, §3º | Latrocínio (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1444 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, caput | Extorsão (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1444 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, caput | Extorsão (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1445 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, §1º | Extorsão qualificada (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1445 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, §1º | Extorsão qualificada (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1446 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, §2º | Extorsão qualificada pela morte (tempo de guerra) | violencia | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1446 | CPM (DL 1.001/69) | Art. 405 c/c art. 243, §2º | Extorsão qualificada pela morte (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1447 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, caput | Extorsão mediante sequestro (tempo de guerra) | violencia | Não | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1447 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, caput | Extorsão mediante sequestro (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1448 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, §1º | Extorsão mediante sequestro qualificada (tempo de guerra) | violencia | Não | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1448 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, §1º | Extorsão mediante sequestro qualificada (tempo de guerra) | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1449 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, §2º | Extorsão mediante sequestro — grave sofrimento físico ou mor | violencia | Não | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1449 | CPM (DL 1.001/69) | Art. 405 c/c art. 244, §2º | Extorsão mediante sequestro — grave sofrimento físico ou mor | grave_ameaca | Sim | — | remissao | praticar crime de roubo, ou de extorsao definidos nos arts. 242, 243 e 244, em zona de ope |
| 1507 | CPM (DL 1.001/69) | Art. 368, caput (cabeças) | Motim, revolta ou conspiração em tempo de guerra — cabeças | violencia | Não | — | remissao | onspiracao praticar qualquer dos crimes definidos nos arts. 149 e seu paragrafo unico, e 1 |
| 1507 | CPM (DL 1.001/69) | Art. 368, caput (cabeças) | Motim, revolta ou conspiração em tempo de guerra — cabeças | grave_ameaca | Não | — | remissao | onspiracao praticar qualquer dos crimes definidos nos arts. 149 e seu paragrafo unico, e 1 |
| 424 | Lei 13.869/19 | Art. 9º | Decretação de privação da liberdade em desconformidade com a | violencia | Não | Não | privacao-da-liberdade | s crimes e das penas decretar medida de privacao da liberdade em manifesta desconformidade |
| 1518 | Lei 8.176/91 | Art. 1º-A | Receptação de combustível no exercício de atividade comercia | violencia | Não | — | — | Sem texto do dispositivo para ler. |
| 1518 | Lei 8.176/91 | Art. 1º-A | Receptação de combustível no exercício de atividade comercia | grave_ameaca | Não | — | — | Sem texto do dispositivo para ler. |

## Conferem com ressalva

A regra reconhece que o tipo se consuma SEM violência mas comporta a hipótese violenta, e o catálogo declara essa hipótese em `violencia_condicao`. Os dois dizem a mesma coisa: não é divergência. A lista existe para que a condição seja revisável como texto — foi o que a decisão 8 criou, em 23/09/2026.

| id | diploma | dispositivo | tipo | campo | catálogo | derivado | regra | o que a lei diz |
|---|---|---|---|---|---|---|---|---|
| 513 | CDC (Lei 8.078/90) | Art. 71 | Cobrança vexatória ou abusiva de dívida | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameaca |
| 1508 | CE (Lei 4.737/65) | Art. 326-B | Violência política contra candidata ou detentora de mandato  | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameacar |
| 54 | CP | Art. 136, caput | Maus-tratos | violencia | Não | Não | perigo-a-pessoa | expor a perigo a vida ou a saude |
| 56 | CP | Art. 136, §2º | Maus-tratos com resultado morte | violencia | Não | Não | perigo-a-pessoa | expor a perigo a vida ou a saude |
| 65 | CP | Art. 146 | Constrangimento ilegal | violencia | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 65 | CP | Art. 146 | Constrangimento ilegal | grave_ameaca | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 67 | CP | Art. 147-A | Perseguição | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameacando |
| 68 | CP | Art. 147-B | Violência psicológica contra a mulher | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameaca |
| 69 | CP | Art. 148, caput | Sequestro e cárcere privado | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 70 | CP | Art. 148, §1º | Sequestro qualificado (fins libidinosos, menor de 18, maus-t | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 71 | CP | Art. 148, §2º | Sequestro ou cárcere privado — grave sofrimento físico ou mo | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 73 | CP | Art. 149-A | Tráfico de Pessoas | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 73 | CP | Art. 149-A | Tráfico de Pessoas | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 110 | CP | Art. 159, caput | Extorsão mediante sequestro | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 111 | CP | Art. 159, §1º | Extorsão mediante sequestro com duração > 24h / menor de 18  | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 112 | CP | Art. 159, §2º | Extorsão mediante sequestro — resultado lesão corporal grave | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 113 | CP | Art. 159, §3º | Extorsão mediante sequestro — resultado morte | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 114 | CP | Art. 159, §4º | Extorsão mediante sequestro — diminuição de 1/3 a 2/3 (delaç | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 154 | CP | Art. 200 | Paralisação de trabalho seguida de violência ou perturbação  | violencia | Não | Não | violencia-a-pessoa-ou-a-coisa | andono coletivo de trabalho, praticando violencia contra pessoa ou contra coisa: |
| 157 | CP | Art. 203 | Frustração de direito assegurado por lei trabalhista | violencia | Não | Não | meio-alternativo | por lei trabalhista frustrar, mediante fraude ou violencia, direito assegurado pela legisl |
| 157 | CP | Art. 203 | Frustração de direito assegurado por lei trabalhista | grave_ameaca | Não | Não | meio-alternativo | por lei trabalhista frustrar, mediante fraude ou violencia, direito assegurado pela legisl |
| 158 | CP | Art. 204 | Frustração de lei sobre a nacionalização do trabalho | violencia | Não | Não | meio-alternativo | alizacao do trabalho frustrar, mediante fraude ou violencia, obrigacao legal relativa a na |
| 158 | CP | Art. 204 | Frustração de lei sobre a nacionalização do trabalho | grave_ameaca | Não | Não | meio-alternativo | alizacao do trabalho frustrar, mediante fraude ou violencia, obrigacao legal relativa a na |
| 267 | CP | Art. 329 | Resistência | violencia | Não | Não | meio-alternativo | or-se a execucao de ato legal, mediante violencia ou ameaca a funcionario competente para  |
| 267 | CP | Art. 329 | Resistência | grave_ameaca | Não | Não | meio-alternativo | or-se a execucao de ato legal, mediante violencia ou ameaca a funcionario competente para  |
| 277 | CP | Art. 335 | Impedimento, perturbação ou fraude de concorrência | violencia | Não | Não | meio-alternativo | r concorrente ou licitante, por meio de violencia, grave ameaca, fraude ou oferecimento de |
| 277 | CP | Art. 335 | Impedimento, perturbação ou fraude de concorrência | grave_ameaca | Não | Não | meio-alternativo | r concorrente ou licitante, por meio de violencia, grave ameaca, fraude ou oferecimento de |
| 296 | CP | Art. 358 | Fraude em arrematação judicial | violencia | Não | Não | meio-alternativo | violencia ou fraude em arrematacao judicial impedir, pertur |
| 296 | CP | Art. 358 | Fraude em arrematação judicial | grave_ameaca | Não | Não | meio-alternativo | violencia ou fraude em arrematacao judicial impedir, pertur |
| 496 | CP | Art. 337-K | Afastamento de licitante | violencia | Não | Não | meio-alternativo | ou tentar afastar licitante por meio de violencia, grave ameaca, fraude ou oferecimento de |
| 496 | CP | Art. 337-K | Afastamento de licitante | grave_ameaca | Não | Não | meio-alternativo | ou tentar afastar licitante por meio de violencia, grave ameaca, fraude ou oferecimento de |
| 621 | CP | Art. 148, §1º, I | Sequestro/cárcere privado qualificado — se a vítima é ascend | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 622 | CP | Art. 148, §1º, II | Sequestro/cárcere privado qualificado — internação da vítima | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 623 | CP | Art. 148, §1º, III | Sequestro/cárcere privado qualificado — se a vítima é menor  | violencia | Não | Não | privacao-da-liberdade | de reclusao, de dois a cinco anos: se a privacao da liberdade dura mais de quinze dias. |
| 624 | CP | Art. 148, §1º, IV | Sequestro/cárcere privado qualificado — se o crime é pratica | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 625 | CP | Art. 148, §1º, V | Sequestro/cárcere privado qualificado — se o crime é pratica | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 635 | CP | Art. 149-A, I | Tráfico de pessoas — para remoção de órgãos, tecidos ou part | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 635 | CP | Art. 149-A, I | Tráfico de pessoas — para remoção de órgãos, tecidos ou part | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 636 | CP | Art. 149-A, II | Tráfico de pessoas com a finalidade de submissão a trabalho  | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 636 | CP | Art. 149-A, II | Tráfico de pessoas com a finalidade de submissão a trabalho  | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 637 | CP | Art. 149-A, III | Tráfico de pessoas — para submissão a qualquer tipo de servi | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 637 | CP | Art. 149-A, III | Tráfico de pessoas — para submissão a qualquer tipo de servi | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 638 | CP | Art. 149-A, IV | Tráfico de pessoas — para adoção ilegal | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 638 | CP | Art. 149-A, IV | Tráfico de pessoas — para adoção ilegal | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 639 | CP | Art. 149-A, V | Tráfico de pessoas — para exploração sexual | violencia | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 639 | CP | Art. 149-A, V | Tráfico de pessoas — para exploração sexual | grave_ameaca | Não | Não | meio-alternativo | rar, alojar ou acolher pessoa, mediante grave ameaca, violencia, coacao, fraude ou abuso,  |
| 734 | CP | Art. 146, §1º | Constrangimento ilegal com aumento — concurso de mais de 3 p | violencia | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 734 | CP | Art. 146, §1º | Constrangimento ilegal com aumento — concurso de mais de 3 p | grave_ameaca | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 1315 | CP | Art. 148, §3º | Sequestro ou cárcere privado por integrante de organização c | violencia | Não | Não | privacao-da-liberdade | sequestro e carcere privado privar alguem de sua liberdade, mediant |
| 1343 | CP | Art. 227, §2º | Mediação para servir a lascívia de outrem — Se o crime é com | violencia | Não | Não | meio-alternativo | se o crime e cometido com emprego de violencia, grave ameaca ou fraude: |
| 1343 | CP | Art. 227, §2º | Mediação para servir a lascívia de outrem — Se o crime é com | grave_ameaca | Não | Não | meio-alternativo | se o crime e cometido com emprego de violencia, grave ameaca ou fraude: |
| 1345 | CP | Art. 228, §2º | Favorecimento da prostituição ou outra forma de exploração s | violencia | Não | Não | meio-alternativo | se o crime, e cometido com emprego de violencia, grave ameaca ou fraude: |
| 1345 | CP | Art. 228, §2º | Favorecimento da prostituição ou outra forma de exploração s | grave_ameaca | Não | Não | meio-alternativo | se o crime, e cometido com emprego de violencia, grave ameaca ou fraude: |
| 1347 | CP | Art. 230, §2º | Rufianismo — Se o crime é cometido mediante violência, grave | violencia | Não | Não | meio-alternativo | se o crime e cometido mediante violencia, grave ameaca, fraude ou outro meio que impeca ou |
| 1347 | CP | Art. 230, §2º | Rufianismo — Se o crime é cometido mediante violência, grave | grave_ameaca | Não | Não | meio-alternativo | se o crime e cometido mediante violencia, grave ameaca, fraude ou outro meio que impeca ou |
| 1374 | CP | Art. 329, §1º | Resistência — Se o ato, em razão da resistência, não se exec | violencia | Não | Não | meio-alternativo | or-se a execucao de ato legal, mediante violencia ou ameaca a funcionario competente para  |
| 1374 | CP | Art. 329, §1º | Resistência — Se o ato, em razão da resistência, não se exec | grave_ameaca | Não | Não | meio-alternativo | or-se a execucao de ato legal, mediante violencia ou ameaca a funcionario competente para  |
| 1483 | CP | Art. 159, §4º c/c §1º | Extorsão mediante sequestro qualificada com delação premiada | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 1484 | CP | Art. 159, §4º c/c §2º | Extorsão mediante sequestro com lesão grave e delação premia | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 1485 | CP | Art. 159, §4º c/c §3º | Extorsão mediante sequestro com resultado morte e delação pr | violencia | Não | Não | extorsao-mediante-sequestro | a si ou para outrem, qualquer vantagem, como condicao ou preco do resgate: vide lei nº 8.0 |
| 578 | CP (atualiz.) | Art. 147-A, §1º, III | Stalking qualificado contra mulher por razões de gênero (per | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameacando |
| 747 | CPM (DL 1.001/69) | Art. 222, caput | Constrangimento ilegal | violencia | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 747 | CPM (DL 1.001/69) | Art. 222, caput | Constrangimento ilegal | grave_ameaca | Não | Não | meio-alternativo | nto ilegal constranger alguem, mediante violencia ou grave ameaca, ou depois de lhe haver  |
| 750 | CPM (DL 1.001/69) | Art. 225, caput | Sequestro ou cárcere privado | violencia | Não | Não | privacao-da-liberdade | sequestro ou carcere privado privar alguem de sua liberdade, mediant |
| 1053 | CPM (DL 1.001/69) | Art. 177, caput | Resistência mediante ameaça ou violência | violencia | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1053 | CPM (DL 1.001/69) | Art. 177, caput | Resistência mediante ameaça ou violência | grave_ameaca | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1054 | CPM (DL 1.001/69) | Art. 177, §1º | Resistência mediante ameaça ou violência — Se o ato não se e | violencia | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1054 | CPM (DL 1.001/69) | Art. 177, §1º | Resistência mediante ameaça ou violência — Se o ato não se e | grave_ameaca | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1055 | CPM (DL 1.001/69) | Art. 177, §1º-A | Resistência mediante ameaça ou violência — Se da resistência | violencia | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1055 | CPM (DL 1.001/69) | Art. 177, §1º-A | Resistência mediante ameaça ou violência — Se da resistência | grave_ameaca | Não | Não | meio-alternativo | resistencia mediante ameaca ou violencia opor-se a execucao de ato legal, median |
| 1089 | CPM (DL 1.001/69) | Art. 213, caput | Maus tratos | violencia | Não | Não | perigo-a-pessoa | privando-a de alimentacao |
| 1091 | CPM (DL 1.001/69) | Art. 213, §2º | Maus tratos — Se resulta morte | violencia | Não | Não | perigo-a-pessoa | privando-a de alimentacao |
| 1095 | CPM (DL 1.001/69) | Art. 225, §2º | Sequestro ou cárcere privado — Se resulta à vítima, em razão | violencia | Não | Não | privacao-da-liberdade | sequestro ou carcere privado privar alguem de sua liberdade, mediant |
| 1096 | CPM (DL 1.001/69) | Art. 225, §3º | Sequestro ou cárcere privado — Se, pela razão do parágrafo a | violencia | Não | Não | privacao-da-liberdade | sequestro ou carcere privado privar alguem de sua liberdade, mediant |
| 1116 | CPM (DL 1.001/69) | Art. 244, caput | Extorsão mediante seqüestro (tempo de paz) | violencia | Não | Não | extorsao-mediante-sequestro | mediante sequestro extorquir ou tentar extorquir para si ou para outrem, mediante sequestr |
| 1234 | CPM (DL 1.001/69) | Art. 358, caput | Coação a comandante | violencia | Não | Não | meio-alternativo | e entrar o nacional em conluio, usar de violencia ou ameaca, provocar tumulto ou desordem  |
| 1234 | CPM (DL 1.001/69) | Art. 358, caput | Coação a comandante | grave_ameaca | Não | Não | meio-alternativo | e entrar o nacional em conluio, usar de violencia ou ameaca, provocar tumulto ou desordem  |
| 1521 | CPM (DL 1.001/69) | Art. 225, §1º | Sequestro ou cárcere privado qualificado | violencia | Não | Não | privacao-da-liberdade | sequestro ou carcere privado privar alguem de sua liberdade, mediant |
| 1525 | CPM (DL 1.001/69) | Art. 244, §1º | Extorsão mediante sequestro qualificada (tempo de paz) | violencia | Não | Não | extorsao-mediante-sequestro | mediante sequestro extorquir ou tentar extorquir para si ou para outrem, mediante sequestr |
| 1526 | CPM (DL 1.001/69) | Art. 244, §2º | Extorsão mediante sequestro — grave sofrimento físico ou mor | violencia | Não | Não | extorsao-mediante-sequestro | mediante sequestro extorquir ou tentar extorquir para si ou para outrem, mediante sequestr |
| 1397 | ECA | Art. 239, parágrafo único | Promover/auxiliar envio de criança/adolescente ao exterior s | violencia | Não | Não | meio-alternativo | se ha emprego de violencia, grave ameaca ou fraude: (incluido pela lei nº 10.764, de 12.11 |
| 1397 | ECA | Art. 239, parágrafo único | Promover/auxiliar envio de criança/adolescente ao exterior s | grave_ameaca | Não | Não | meio-alternativo | se ha emprego de violencia, grave ameaca ou fraude: (incluido pela lei nº 10.764, de 12.11 |
| 547 | Lei 1.579/52 | Art. 4º, I | Impedimento ou tentativa de impedimento de funcionamento de  | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameaca |
| 428 | Lei 13.869/19 | Art. 15 | Constranger a depor pessoa que deva guardar segredo ou que s | grave_ameaca | Não | Não | ameaca-sem-qualificativo | ameaca |
| 479 | Lei 14.811/24 | Art. 146-A, caput (CP) | Intimidação sistemática (bullying) | violencia | Não | Não | meio-alternativo | , individualmente ou em grupo, mediante violencia fisica ou psicologica, uma ou mais pesso |
| 480 | Lei 14.811/24 | Art. 146-A, §único (CP) | Intimidação sistemática virtual (cyberbullying) | violencia | Não | Não | meio-alternativo | , individualmente ou em grupo, mediante violencia fisica ou psicologica, uma ou mais pesso |
| 561 | Lei 9.434/97 | Art. 14 | Remover tecidos/órgãos/partes do corpo de pessoa ou cadáver  | violencia | Não | Não | pessoa-ou-cadaver | r tecidos, orgaos ou partes do corpo de pessoa ou cadaver, em desacordo com as disposicoes |
| 562 | Lei 9.434/97 | Art. 14, §1º | Remoção de tecidos, órgãos ou partes do corpo em desacordo c | violencia | Não | Não | pessoa-ou-cadaver | r tecidos, orgaos ou partes do corpo de pessoa ou cadaver, em desacordo com as disposicoes |

## Por regra aplicada

| regra | respostas |
|---|---:|
| silencio-da-lei | 2437 |
| culposo-nao-e-violento | 134 |
| violencia-meio | 87 |
| violencia-nucleo | 74 |
| ameaca-meio | 63 |
| remissao | 56 |
| meio-alternativo | 54 |
| tipo-associativo | 38 |
| vitima-animal | 26 |
| extorsao-mediante-sequestro | 22 |
| perigo-a-pessoa | 18 |
| privacao-da-liberdade | 14 |
| ameaca-sem-qualificativo | 12 |
| violencia-em-sentido-proprio | 5 |
| pessoa-ou-cadaver | 5 |
| ameaca-mal-injusto-e-grave | 3 |
| rixa | 2 |
| ameaca-de-mal-necessariamente-grave | 2 |
| violencia-a-pessoa-ou-a-coisa | 2 |
| — | 2 |
| aborto-sem-consentimento | 1 |
| violencia-contra-a-coisa | 1 |
