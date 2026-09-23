# Revisão fina de 23/09/2026 — simulação da aplicação

Anexo A: **413 mudanças** declaradas, em 251 registros.

| resultado | mudanças |
|---|---:|
| aplicáveis (o valor de origem confere) | 412 |
| já estavam no valor decidido | 0 |
| **recusadas** (o catálogo mudou desde 23/09) | **0** |
| id inexistente no catálogo | 0 |
| adiadas para a etapa 5 (aposentadoria) | 1 |

## O que muda, por campo

| campo | mudanças |
|---|---:|
| `violencia` | 85 |
| `violencia_condicao` | 84 |
| `elemento` | 60 |
| `acao_condicao` | 57 |
| `grave_ameaca` | 42 |
| `hediondo_condicao` | 36 |
| `tentativa` | 23 |
| `hediondo` | 13 |
| `acao` | 4 |
| `hediondo_nota` | 4 |
| `vigencia_ate` | 2 |
| `vigencia_nota` | 2 |

## O que muda, por decisão

| decisão | mudanças |
|---|---:|
| 8 | 87 |
| 12 | 33 |
| 31 (A/B) | 28 |
| 1a | 26 |
| 28 | 25 |
| 1b | 23 |
| 10 | 22 |
| 20 | 22 |
| 29 | 21 |
| 7 | 19 |
| 31 (C) | 15 |
| C7 | 9 |
| 9 | 9 |
| 12+33 | 9 |
| 31-D | 9 |
| 13/15 | 8 |
| 31-D2 | 7 |
| 6 | 6 |
| 3 | 5 |
| C12 | 4 |
| 34 | 4 |
| 5 | 3 |
| 11 | 3 |
| 17 | 3 |
| 28 (sai da condição) | 3 |
| C3 | 2 |
| C5 | 2 |
| C4 | 1 |
| C4/16 | 1 |
| C7 (decorre: culposo) | 1 |
| 33 | 1 |
| 15 | 1 |

## Mudança a mudança

| id | dispositivo | campo | de | para | decisão |
|---|---|---|---|---|---|
| 1425 | Lei 9.279/96 Art. 184, I | `acao` | `Pública Incondicionada` | `Ação Penal Privada` | C3 |
| 1426 | Lei 9.279/96 Art. 184, II | `acao` | `Pública Incondicionada` | `Ação Penal Privada` | C3 |
| 604 | CP Art. 163, §único, IV | `acao` | `Pública Incondicionada` | `Ação Penal Privada` | C4 |
| 120 | CP Art. 163, parágrafo único | `acao_condicao` | — | `Ação penal privada (queixa) na hipótese do in` | C4/16 |
| 80 | CP Art. 153, §1º-A | `acao` | `Pública Incondicionada` | `Pública Condicionada à Representação` | C5 |
| 80 | CP Art. 153, §1º-A | `acao_condicao` | `Incondicionada quando resulta prejuízo para a` | `Incondicionada quando resultar prejuízo para ` | C5 |
| 495 | CP Art. 337-J | `violencia` | `Sim` | `Não` | C7 |
| 311 | CP Art. 359-N | `violencia` | `Sim` | `Não` | C7 |
| 221 | CP Art. 288-A | `violencia` | `Sim` | `Não` | C7 |
| 495 | CP Art. 337-J | `grave_ameaca` | `Sim` | `Não` | C7 |
| 311 | CP Art. 359-N | `grave_ameaca` | `Sim` | `Não` | C7 |
| 221 | CP Art. 288-A | `grave_ameaca` | `Sim` | `Não` | C7 |
| 253 | CP Art. 316, caput | `grave_ameaca` | `Sim` | `Não` | C7 |
| 695 | CPM (DL 1.001/69 Art. 206, caput | `violencia` | `Sim` | `Não` | C7 |
| 695 | CPM (DL 1.001/69 Art. 206, caput | `elemento` | `Doloso` | `Culposo` | C7 |
| 695 | CPM (DL 1.001/69 Art. 206, caput | `tentativa` | `Sim` | `Não` | C7 (decorre: culposo) |
| 100 | CP Art. 157, §2º, VI | `hediondo` | `Sim` | `Não` | C12 |
| 101 | CP Art. 157, §2º, VII | `hediondo` | `Sim` | `Não` | C12 |
| 812 | CP Art. 157, §2º, VIII | `hediondo` | `Sim` | `Não` | C12 |
| 588 | CP Art. 157, §2º-A, II | `hediondo` | `Sim` | `Não` | C12 |
| 69 | CP Art. 148, caput | `violencia` | `Sim` | `Não` | 1a |
| 69 | CP Art. 148, caput | `grave_ameaca` | `Sim` | `Não` | 1a |
| 69 | CP Art. 148, caput | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 70 | CP Art. 148, §1º | `violencia` | `Sim` | `Não` | 1a |
| 70 | CP Art. 148, §1º | `grave_ameaca` | `Sim` | `Não` | 1a |
| 70 | CP Art. 148, §1º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 71 | CP Art. 148, §2º | `violencia` | `Sim` | `Não` | 1a |
| 71 | CP Art. 148, §2º | `grave_ameaca` | `Sim` | `Não` | 1a |
| 71 | CP Art. 148, §2º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 1315 | CP Art. 148, §3º | `violencia` | `Sim` | `Não` | 1a |
| 1315 | CP Art. 148, §3º | `grave_ameaca` | `Sim` | `Não` | 1a |
| 1315 | CP Art. 148, §3º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 621 | CP Art. 148, §1º, I | `violencia` | `Sim` | `Não` | 1a |
| 621 | CP Art. 148, §1º, I | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 622 | CP Art. 148, §1º, II | `violencia` | `Sim` | `Não` | 1a |
| 622 | CP Art. 148, §1º, II | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 623 | CP Art. 148, §1º, III | `violencia` | `Sim` | `Não` | 1a |
| 623 | CP Art. 148, §1º, III | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 624 | CP Art. 148, §1º, IV | `violencia` | `Sim` | `Não` | 1a |
| 624 | CP Art. 148, §1º, IV | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 625 | CP Art. 148, §1º, V | `violencia` | `Sim` | `Não` | 1a |
| 625 | CP Art. 148, §1º, V | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 750 | CPM (DL 1.001/69 Art. 225, caput | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 1095 | CPM (DL 1.001/69 Art. 225, §2º | `violencia` | `Sim` | `Não` | 1a |
| 1095 | CPM (DL 1.001/69 Art. 225, §2º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 1096 | CPM (DL 1.001/69 Art. 225, §3º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1a |
| 110 | CP Art. 159, caput | `violencia` | `Sim` | `Não` | 1b |
| 110 | CP Art. 159, caput | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 111 | CP Art. 159, §1º | `violencia` | `Sim` | `Não` | 1b |
| 111 | CP Art. 159, §1º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 112 | CP Art. 159, §2º | `violencia` | `Sim` | `Não` | 1b |
| 112 | CP Art. 159, §2º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 113 | CP Art. 159, §3º | `violencia` | `Sim` | `Não` | 1b |
| 113 | CP Art. 159, §3º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 114 | CP Art. 159, §4º | `violencia` | `Sim` | `Não` | 1b |
| 114 | CP Art. 159, §4º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1483 | CP Art. 159, §4º c/c §1º | `violencia` | `Sim` | `Não` | 1b |
| 1483 | CP Art. 159, §4º c/c §1º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1484 | CP Art. 159, §4º c/c §2º | `violencia` | `Sim` | `Não` | 1b |
| 1484 | CP Art. 159, §4º c/c §2º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1485 | CP Art. 159, §4º c/c §3º | `violencia` | `Sim` | `Não` | 1b |
| 1485 | CP Art. 159, §4º c/c §3º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1116 | CPM (DL 1.001/69 Art. 244, caput | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1447 | CPM (DL 1.001/69 Art. 405 c/c art. 244, cap | `violencia` | `Sim` | `Não` | 1b |
| 1447 | CPM (DL 1.001/69 Art. 405 c/c art. 244, cap | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1448 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §1º | `violencia` | `Sim` | `Não` | 1b |
| 1448 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §1º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 1449 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §2º | `violencia` | `Sim` | `Não` | 1b |
| 1449 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §2º | `violencia_condicao` | — | `Sim quando a privação da liberdade é executad` | 1b |
| 561 | Lei 9.434/97 Art. 14 | `violencia` | `Sim` | `Não` | 3 |
| 562 | Lei 9.434/97 Art. 14, §1º | `violencia` | `Sim` | `Não` | 3 |
| 561 | Lei 9.434/97 Art. 14 | `violencia_condicao` | — | `Sim quando a remoção é feita em pessoa viva (` | 3 |
| 562 | Lei 9.434/97 Art. 14, §1º | `violencia_condicao` | — | `Sim quando a remoção é feita em pessoa viva (` | 3 |
| 989 | Lei 9.434/97 Art. 14, §4º | `violencia` | `Não` | `Sim` | 3 |
| 722 | CP Art. 250, §1º, I | `violencia` | `Sim` | `Não` | 5 |
| 723 | CP Art. 250, §1º, II, a | `violencia` | `Sim` | `Não` | 5 |
| 724 | CP Art. 250, §1º, II, b | `violencia` | `Sim` | `Não` | 5 |
| 1462 | Lei 2.889/56 Art. 2º c/c art. 1º, a | `violencia` | `Sim` | `Não` | 6 |
| 1463 | Lei 2.889/56 Art. 2º c/c art. 1º, b | `violencia` | `Sim` | `Não` | 6 |
| 1472 | Lei 2.889/56 Art. 3º, §1º c/c art. 1º,  | `violencia` | `Sim` | `Não` | 6 |
| 1473 | Lei 2.889/56 Art. 3º, §1º c/c art. 1º,  | `violencia` | `Sim` | `Não` | 6 |
| 1461 | Lei 13.260/16 Art. 5º, §2º | `violencia` | `Sim` | `Não` | 6 |
| 1461 | Lei 13.260/16 Art. 5º, §2º | `grave_ameaca` | `Sim` | `Não` | 6 |
| 65 | CP Art. 146 | `violencia` | `Sim` | `Não` | 8 |
| 65 | CP Art. 146 | `grave_ameaca` | `Sim` | `Não` | 8 |
| 65 | CP Art. 146 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 73 | CP Art. 149-A | `violencia` | `Sim` | `Não` | 8 |
| 73 | CP Art. 149-A | `grave_ameaca` | `Sim` | `Não` | 8 |
| 73 | CP Art. 149-A | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 635 | CP Art. 149-A, I | `violencia` | `Sim` | `Não` | 8 |
| 635 | CP Art. 149-A, I | `grave_ameaca` | `Sim` | `Não` | 8 |
| 635 | CP Art. 149-A, I | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 636 | CP Art. 149-A, II | `violencia` | `Sim` | `Não` | 8 |
| 636 | CP Art. 149-A, II | `grave_ameaca` | `Sim` | `Não` | 8 |
| 636 | CP Art. 149-A, II | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 637 | CP Art. 149-A, III | `violencia` | `Sim` | `Não` | 8 |
| 637 | CP Art. 149-A, III | `grave_ameaca` | `Sim` | `Não` | 8 |
| 637 | CP Art. 149-A, III | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 638 | CP Art. 149-A, IV | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 639 | CP Art. 149-A, V | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 734 | CP Art. 146, §1º | `violencia` | `Sim` | `Não` | 8 |
| 734 | CP Art. 146, §1º | `grave_ameaca` | `Sim` | `Não` | 8 |
| 734 | CP Art. 146, §1º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 747 | CPM (DL 1.001/69 Art. 222, caput | `violencia` | `Sim` | `Não` | 8 |
| 747 | CPM (DL 1.001/69 Art. 222, caput | `grave_ameaca` | `Sim` | `Não` | 8 |
| 747 | CPM (DL 1.001/69 Art. 222, caput | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 277 | CP Art. 335 | `violencia` | `Sim` | `Não` | 8 |
| 277 | CP Art. 335 | `grave_ameaca` | `Sim` | `Não` | 8 |
| 277 | CP Art. 335 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 312 | CP Art. 359-P | `violencia` | `Sim` | `Não` | 8 |
| 312 | CP Art. 359-P | `grave_ameaca` | `Sim` | `Não` | 8 |
| 312 | CP Art. 359-P | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 790 | Lei 13.260/16 Art. 2º | `violencia` | `Sim` | `Não` | 8 |
| 790 | Lei 13.260/16 Art. 2º | `grave_ameaca` | `Sim` | `Não` | 8 |
| 790 | Lei 13.260/16 Art. 2º | `violencia_condicao` | — | `Sim nas hipóteses do art. 2º, § 1º, V, e quan` | 8 |
| 386 | Lei 9.455/97 Art. 1º, §3º (resultado le | `violencia` | `Sim` | `Não` | 8 |
| 386 | Lei 9.455/97 Art. 1º, §3º (resultado le | `grave_ameaca` | `Sim` | `Não` | 8 |
| 386 | Lei 9.455/97 Art. 1º, §3º (resultado le | `violencia_condicao` | — | `Sim nas hipóteses do art. 1º, I e II (emprego` | 8 |
| 387 | Lei 9.455/97 Art. 1º, §3º (resultado mo | `violencia` | `Sim` | `Não` | 8 |
| 387 | Lei 9.455/97 Art. 1º, §3º (resultado mo | `grave_ameaca` | `Sim` | `Não` | 8 |
| 387 | Lei 9.455/97 Art. 1º, §3º (resultado mo | `violencia_condicao` | — | `Sim nas hipóteses do art. 1º, I e II (emprego` | 8 |
| 75 | CP Art. 150, §1º | `violencia` | `Sim` | `Não` | 8 |
| 75 | CP Art. 150, §1º | `grave_ameaca` | `Sim` | `Não` | 8 |
| 75 | CP Art. 150, §1º | `violencia_condicao` | — | `Sim quando há emprego de violência (CP, art. ` | 8 |
| 283 | CP Art. 345 | `violencia` | `Sim` | `Não` | 8 |
| 283 | CP Art. 345 | `grave_ameaca` | `Sim` | `Não` | 8 |
| 283 | CP Art. 345 | `violencia_condicao` | — | `Sim quando há emprego de violência (CP, art. ` | 8 |
| 1234 | CPM (DL 1.001/69 Art. 358, caput | `violencia` | `Sim` | `Não` | 8 |
| 1234 | CPM (DL 1.001/69 Art. 358, caput | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1234 | CPM (DL 1.001/69 Art. 358, caput | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 547 | Lei 1.579/52 Art. 4º, I | `violencia` | `Sim` | `Não` | 8 |
| 547 | Lei 1.579/52 Art. 4º, I | `grave_ameaca` | `Sim` | `Não` | 8 |
| 547 | Lei 1.579/52 Art. 4º, I | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1053 | CPM (DL 1.001/69 Art. 177, caput | `violencia` | `Sim` | `Não` | 8 |
| 1053 | CPM (DL 1.001/69 Art. 177, caput | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1053 | CPM (DL 1.001/69 Art. 177, caput | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1054 | CPM (DL 1.001/69 Art. 177, §1º | `violencia` | `Sim` | `Não` | 8 |
| 1054 | CPM (DL 1.001/69 Art. 177, §1º | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1054 | CPM (DL 1.001/69 Art. 177, §1º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1055 | CPM (DL 1.001/69 Art. 177, §1º-A | `violencia` | `Sim` | `Não` | 8 |
| 1055 | CPM (DL 1.001/69 Art. 177, §1º-A | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1055 | CPM (DL 1.001/69 Art. 177, §1º-A | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 154 | CP Art. 200 | `violencia` | `Sim` | `Não` | 8 |
| 154 | CP Art. 200 | `violencia_condicao` | — | `Sim somente quando a violência é praticada co` | 8 |
| 120 | CP Art. 163, parágrafo único | `violencia` | `Sim` | `Não` | 8 |
| 120 | CP Art. 163, parágrafo único | `violencia_condicao` | — | `Sim no inciso I — violência à pessoa ou grave` | 8 |
| 157 | CP Art. 203 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 158 | CP Art. 204 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 296 | CP Art. 358 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 496 | CP Art. 337-K | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1343 | CP Art. 227, § 2º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1345 | CP Art. 228, § 2º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1347 | CP Art. 230, § 2º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1397 | ECA Art. 239, parágrafo único | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 479 | Lei 14.811/24 Art. 146-A, caput (CP) | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 480 | Lei 14.811/24 Art. 146-A, §único (CP) | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 72 | CP Art. 149, caput | `violencia` | `Sim` | `Não` | 8 |
| 72 | CP Art. 149, caput | `grave_ameaca` | `Sim` | `Não` | 8 |
| 72 | CP Art. 149, caput | `violencia_condicao` | — | `Sim quando a redução à condição análoga à de ` | 8 |
| 871 | Lei 14.597/23 Art. 201 | `violencia` | `Sim` | `Não` | 8 |
| 871 | Lei 14.597/23 Art. 201 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1402 | Lei 15.358/26 Art. 2º, caput | `violencia` | `Sim` | `Não` | 8 |
| 1402 | Lei 15.358/26 Art. 2º, caput | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1402 | Lei 15.358/26 Art. 2º, caput | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 267 | CP Art. 329 | `violencia` | `Sim` | `Não` | 8 |
| 267 | CP Art. 329 | `grave_ameaca` | `Sim` | `Não` | 8 |
| 267 | CP Art. 329 | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 1374 | CP Art. 329, § 1º | `violencia` | `Sim` | `Não` | 8 |
| 1374 | CP Art. 329, § 1º | `grave_ameaca` | `Sim` | `Não` | 8 |
| 1374 | CP Art. 329, § 1º | `violencia_condicao` | — | `Sim quando o meio empregado for violência à p` | 8 |
| 513 | CDC (Lei 8.078/9 Art. 71 | `grave_ameaca` | `Sim` | `Não` | 9 |
| 513 | CDC (Lei 8.078/9 Art. 71 | `violencia_condicao` | — | `Sim quando a ameaça empregada for grave (CDC,` | 9 |
| 1508 | CE (Lei 4.737/65 Art. 326-B | `grave_ameaca` | `Sim` | `Não` | 9 |
| 1508 | CE (Lei 4.737/65 Art. 326-B | `violencia_condicao` | — | `Sim quando a ameaça empregada for grave (CE, ` | 9 |
| 67 | CP Art. 147-A | `grave_ameaca` | `Sim` | `Não` | 9 |
| 67 | CP Art. 147-A | `violencia_condicao` | — | `Sim quando a ameaça empregada for grave (CP, ` | 9 |
| 578 | CP (atualiz.) Art. 147-A, §1º, III | `grave_ameaca` | `Sim` | `Não` | 9 |
| 578 | CP (atualiz.) Art. 147-A, §1º, III | `violencia_condicao` | — | `Sim quando a ameaça empregada for grave (CP, ` | 9 |
| 428 | Lei 13.869/19 Art. 15 | `violencia_condicao` | — | `Sim quando a ameaça empregada for grave (Lei ` | 9 |
| 156 | CP Art. 202 | `violencia` | `Sim` | `Não` | 7 |
| 292 | CP Art. 354 | `violencia` | `Sim` | `Não` | 7 |
| 351 | Lei 9.605/98 Art. 32 | `violencia` | `Sim` | `Não` | 7 |
| 579 | Lei 9.605/98 (at Art. 32, §1º-A | `violencia` | `Sim` | `Não` | 7 |
| 1327 | Lei 9.605/98 Art. 32, §1º-B | `violencia` | `Sim` | `Não` | 7 |
| 768 | LCP (DL 3.688/41 Art. 28 | `violencia` | `Sim` | `Não` | 7 |
| 906 | Lei 4.947/66 Art. 20 | `violencia` | `Sim` | `Não` | 7 |
| 1455 | CPM (DL 1.001/69 Art. 368, par. único (co-a | `violencia` | `Sim` | `Não` | 7 |
| 671 | Lei 12.850/13 Art. 2º, §2º | `violencia` | `Sim` | `Não` | 7 |
| 1455 | CPM (DL 1.001/69 Art. 368, par. único (co-a | `grave_ameaca` | `Sim` | `Não` | 7 |
| 671 | Lei 12.850/13 Art. 2º, §2º | `grave_ameaca` | `Sim` | `Não` | 7 |
| 291 | CP Art. 353 | `violencia` | `Sim` | `Não` | 7 |
| 291 | CP Art. 353 | `grave_ameaca` | `Sim` | `Não` | 7 |
| 291 | CP Art. 353 | `violencia_condicao` | — | `Sim quando o arrebatamento é executado median` | 7 |
| 1118 | CPM (DL 1.001/69 Art. 246, caput | `grave_ameaca` | `Sim` | `Não` | 7 |
| 1267 | CPM (DL 1.001/69 Art. 388, caput | `grave_ameaca` | `Sim` | `Não` | 7 |
| 1267 | CPM (DL 1.001/69 Art. 388, caput | `violencia_condicao` | — | `Sim quando a coação é exercida mediante violê` | 7 |
| 475 | Lei 10.741/03 Art. 107 | `grave_ameaca` | `Sim` | `Não` | 7 |
| 475 | Lei 10.741/03 Art. 107 | `violencia_condicao` | — | `Sim quando a coação é exercida mediante violê` | 7 |
| 1479 | CP Art. 133, §3º c/c §1º | `violencia` | `Sim` | `Não` | 10 |
| 1480 | CP Art. 133, §3º c/c §2º | `violencia` | `Sim` | `Não` | 10 |
| 54 | CP Art. 136, caput | `violencia` | `Sim` | `Não` | 10 |
| 54 | CP Art. 136, caput | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 55 | CP Art. 136, §1º | `violencia` | `Sim` | `Não` | 10 |
| 55 | CP Art. 136, §1º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 56 | CP Art. 136, §2º | `violencia` | `Sim` | `Não` | 10 |
| 56 | CP Art. 136, §2º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 57 | CP Art. 136, §3º | `violencia` | `Sim` | `Não` | 10 |
| 57 | CP Art. 136, §3º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1481 | CP Art. 136, §3º c/c §1º | `violencia` | `Sim` | `Não` | 10 |
| 1481 | CP Art. 136, §3º c/c §1º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1482 | CP Art. 136, §3º c/c §2º | `violencia` | `Sim` | `Não` | 10 |
| 1482 | CP Art. 136, §3º c/c §2º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1089 | CPM (DL 1.001/69 Art. 213, caput | `violencia` | `Sim` | `Não` | 10 |
| 1089 | CPM (DL 1.001/69 Art. 213, caput | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1090 | CPM (DL 1.001/69 Art. 213, §1º | `violencia` | `Sim` | `Não` | 10 |
| 1090 | CPM (DL 1.001/69 Art. 213, §1º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1091 | CPM (DL 1.001/69 Art. 213, §2º | `violencia` | `Sim` | `Não` | 10 |
| 1091 | CPM (DL 1.001/69 Art. 213, §2º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 1080 | CPM (DL 1.001/69 Art. 207, §2º | `violencia` | `Sim` | `Não` | 10 |
| 1080 | CPM (DL 1.001/69 Art. 207, §2º | `violencia_condicao` | — | `Sim quando o abuso dos meios de correção ou d` | 10 |
| 68 | CP Art. 147-B | `violencia_condicao` | — | `Sim quando o meio empregado for ameaça grave ` | 11 |
| 1332 | Lei 9.455/97 Art. 1º, III | `violencia` | `Sim` | `Não` | 11 |
| 1332 | Lei 9.455/97 Art. 1º, III | `violencia_condicao` | — | `Sim quando o sofrimento físico é infligido me` | 11 |
| 86 | CP Art. 155, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 87 | CP Art. 155, §1º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 88 | CP Art. 155, §2º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 89 | CP Art. 155, §3º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 90 | CP Art. 155, §4º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 91 | CP Art. 155, §4º-A | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 92 | CP Art. 155, §4º-B | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 93 | CP Art. 155, §5º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 122 | CP Art. 165 | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 123 | CP Art. 166 | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 129 | CP Art. 180, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 130 | CP Art. 180, §1º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 131 | CP Art. 180, §3º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 132 | CP Art. 180-A | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 576 | Lei 14.478/22 Art. 171-A (CP) | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 582 | CP Art. 155, §4º, I | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 583 | CP Art. 155, §4º, II | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 584 | CP Art. 155, §4º, III | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 585 | CP Art. 155, §4º, IV | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 586 | CP Art. 155, §6º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 587 | CP Art. 155, §7º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 815 | CP Art. 155, §4º, V | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 816 | CP Art. 155, §8º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 820 | CP Art. 171, §2º, VII | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 994 | CP Art. 162, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 995 | CP Art. 172, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 996 | CP Art. 173, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 997 | CP Art. 174, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 998 | CP Art. 175, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 999 | CP Art. 177, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 1000 | CP Art. 178, caput | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 1316 | CP Art. 155, §9º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 1341 | CP Art. 175, § 1º | `acao_condicao` | — | `Condicionada à representação se o crime é com` | 12 |
| 127 | CP Art. 171, caput | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 128 | CP Art. 171, §2º-A | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 580 | CP (atualiz.) Art. 171, §4º | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 589 | CP Art. 171, §2º, I | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 590 | CP Art. 171, §2º, II | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 591 | CP Art. 171, §2º, III | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 592 | CP Art. 171, §2º, IV | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 593 | CP Art. 171, §2º, V | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 594 | CP Art. 171, §2º, VI | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 12+33 |
| 595 | CP Art. 171, §3º | `acao_condicao` | — | `Fatos até 03/05/2026: condicionada à represen` | 33 |
| 58 | CP Art. 138, caput | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 59 | CP Art. 139 | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 730 | CP Art. 138, §1º | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 60 | CP Art. 140, caput | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 63 | CP Art. 141, III | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 64 | CP Art. 141, §2º | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 1504 | CP Art. 141, §2º c/c Art. 139 | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 1505 | CP Art. 141, §2º c/c Art. 140 | `acao_condicao` | — | `Mediante requisição do Ministro da Justiça se` | 13/15 |
| 61 | CP Art. 140, §2º | `acao_condicao` | `Pública incondicionada quando da violência re` | `Pública quando da violência resulta lesão cor` | 15 |
| 539 | Lei 9.609/98 Art. 12, caput | `acao_condicao` | — | `Pública incondicionada quando praticado em pr` | 17 |
| 540 | Lei 9.609/98 Art. 12, §1º | `acao_condicao` | `Privada, salvo quando praticado em prejuízo d` | `Pública incondicionada quando praticado em pr` | 17 |
| 541 | Lei 9.609/98 Art. 12, §2º | `acao_condicao` | `Privada, salvo quando praticado em prejuízo d` | `Pública incondicionada quando praticado em pr` | 17 |
| 76 | CP Art. 151 | `vigencia_ate` | — | `1978-06-23` | 34 |
| 77 | CP Art. 151, §1º, I | `vigencia_ate` | — | `1978-06-23` | 34 |
| 76 | CP Art. 151 | `vigencia_nota` | — | `REVOGADO TACITAMENTE pelo art. 40 da Lei 6.53` | 34 |
| 77 | CP Art. 151, §1º, I | `vigencia_nota` | — | `REVOGADO TACITAMENTE pelo art. 40 da Lei 6.53` | 34 |
| 1494 | CP Art. 129, §4º c/c §3º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1496 | CP Art. 129, §10 c/c §3º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1499 | CP Art. 129, §12, I c/c §3º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1503 | CP Art. 129, §12, II c/c §3º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1314 | CP Art. 129, §3º-A | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1083 | CPM (DL 1.001/69 Art. 209, §3º-A | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1082 | CPM (DL 1.001/69 Art. 209, §3º | `elemento` | `Culposo` | `Preterdoloso` | 31 (A/B) |
| 1287 | CPM (DL 1.001/69 Art. 403, §3º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1389 | CPM (DL 1.001/69 Art. 403, § 3º (no caso de | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 30 | CP Art. 127, 1ª parte | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 31 | CP Art. 127, 2ª parte | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1488 | CP Art. 127, 1ª parte c/c art | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1489 | CP Art. 127, 2ª parte c/c art | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1479 | CP Art. 133, §3º c/c §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1480 | CP Art. 133, §3º c/c §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1481 | CP Art. 136, §3º c/c §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1482 | CP Art. 136, §3º c/c §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1338 | CP Art. 134, § 1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1339 | CP Art. 134, § 2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1087 | CPM (DL 1.001/69 Art. 212, §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1088 | CPM (DL 1.001/69 Art. 212, §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1090 | CPM (DL 1.001/69 Art. 213, §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1091 | CPM (DL 1.001/69 Art. 213, §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 982 | Lei 10.741/03 Art. 99, §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 983 | Lei 10.741/03 Art. 99, §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 985 | Lei 13.146/15 Art. 90, §1º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 986 | Lei 13.146/15 Art. 90, §2º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 989 | Lei 9.434/97 Art. 14, §4º | `elemento` | `Doloso` | `Preterdoloso` | 31 (A/B) |
| 1494 | CP Art. 129, §4º c/c §3º | `tentativa` | `Sim` | `Não` | 20 |
| 1496 | CP Art. 129, §10 c/c §3º | `tentativa` | `Sim` | `Não` | 20 |
| 1499 | CP Art. 129, §12, I c/c §3º | `tentativa` | `Sim` | `Não` | 20 |
| 1503 | CP Art. 129, §12, II c/c §3º | `tentativa` | `Sim` | `Não` | 20 |
| 1083 | CPM (DL 1.001/69 Art. 209, §3º-A | `tentativa` | `Sim` | `Não` | 20 |
| 1287 | CPM (DL 1.001/69 Art. 403, §3º | `tentativa` | `Sim` | `Não` | 20 |
| 1389 | CPM (DL 1.001/69 Art. 403, § 3º (no caso de | `tentativa` | `Sim` | `Não` | 20 |
| 30 | CP Art. 127, 1ª parte | `tentativa` | `Sim` | `Não` | 20 |
| 31 | CP Art. 127, 2ª parte | `tentativa` | `Sim` | `Não` | 20 |
| 1488 | CP Art. 127, 1ª parte c/c art | `tentativa` | `Sim` | `Não` | 20 |
| 1489 | CP Art. 127, 2ª parte c/c art | `tentativa` | `Sim` | `Não` | 20 |
| 1479 | CP Art. 133, §3º c/c §1º | `tentativa` | `Sim` | `Não` | 20 |
| 1480 | CP Art. 133, §3º c/c §2º | `tentativa` | `Sim` | `Não` | 20 |
| 1481 | CP Art. 136, §3º c/c §1º | `tentativa` | `Sim` | `Não` | 20 |
| 1482 | CP Art. 136, §3º c/c §2º | `tentativa` | `Sim` | `Não` | 20 |
| 1338 | CP Art. 134, § 1º | `tentativa` | `Sim` | `Não` | 20 |
| 1339 | CP Art. 134, § 2º | `tentativa` | `Sim` | `Não` | 20 |
| 1087 | CPM (DL 1.001/69 Art. 212, §1º | `tentativa` | `Sim` | `Não` | 20 |
| 1088 | CPM (DL 1.001/69 Art. 212, §2º | `tentativa` | `Sim` | `Não` | 20 |
| 1090 | CPM (DL 1.001/69 Art. 213, §1º | `tentativa` | `Sim` | `Não` | 20 |
| 1091 | CPM (DL 1.001/69 Art. 213, §2º | `tentativa` | `Sim` | `Não` | 20 |
| 104 | CP Art. 157, §3º, I | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31 (C) |
| 105 | CP Art. 157, §3º, II | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31 (C) |
| 108 | CP Art. 158, §2º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31 (C) |
| 112 | CP Art. 159, §2º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31 (C) |
| 113 | CP Art. 159, §3º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31 (C) |
| 1317 | CP Art. 157, §5º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 817 | CP Art. 158, §3º (lesão grave | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 818 | CP Art. 158, §3º (morte) | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1490 | CP Art. 158, §2º c/c art. 157 | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1484 | CP Art. 159, §4º c/c §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1485 | CP Art. 159, §4º c/c §3º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1452 | CPM (DL 1.001/69 Art. 242, §3º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1443 | CPM (DL 1.001/69 Art. 405 c/c art. 242, §3º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1454 | CPM (DL 1.001/69 Art. 243, §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1446 | CPM (DL 1.001/69 Art. 405 c/c art. 243, §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31 (C) |
| 1317 | CP Art. 157, §5º | `tentativa` | `Não` | `Sim` | 20 |
| 134 | CP Art. 213, §1º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31-D |
| 609 | CP Art. 213, §1º, 1ª parte | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D |
| 135 | CP Art. 213, §2º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31-D |
| 141 | CP Art. 217-A, §3º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31-D |
| 142 | CP Art. 217-A, §4º | `elemento` | `Preterdoloso` | `Qualificado pelo resultado` | 31-D |
| 1104 | CPM (DL 1.001/69 Art. 232, §1º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D |
| 1105 | CPM (DL 1.001/69 Art. 232, §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D |
| 1295 | CPM (DL 1.001/69 Art. 408, par. único, a) | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D |
| 1296 | CPM (DL 1.001/69 Art. 408, par. único, b) | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D |
| 1292 | CPM (DL 1.001/69 Art. 407, §1º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1293 | CPM (DL 1.001/69 Art. 407, §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1038 | CPM (DL 1.001/69 Art. 157, §4º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1040 | CPM (DL 1.001/69 Art. 158, §3º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1055 | CPM (DL 1.001/69 Art. 177, §1º-A | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1095 | CPM (DL 1.001/69 Art. 225, §2º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1096 | CPM (DL 1.001/69 Art. 225, §3º | `elemento` | `Doloso` | `Qualificado pelo resultado` | 31-D2 |
| 1081 | CPM (DL 1.001/69 Art. 208, caput | `hediondo` | `Não` | `Sim` | 29 |
| 1282 | CPM (DL 1.001/69 Art. 401, caput | `hediondo` | `Não` | `Sim` | 29 |
| 1294 | CPM (DL 1.001/69 Art. 408, caput | `hediondo` | `Não` | `Sim` | 29 |
| 1295 | CPM (DL 1.001/69 Art. 408, par. único, a) | `hediondo` | `Não` | `Sim` | 29 |
| 1296 | CPM (DL 1.001/69 Art. 408, par. único, b) | `hediondo` | `Não` | `Sim` | 29 |
| 1447 | CPM (DL 1.001/69 Art. 405 c/c art. 244, cap | `hediondo` | `Não` | `Sim` | 29 |
| 1448 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §1º | `hediondo` | `Não` | `Sim` | 29 |
| 1449 | CPM (DL 1.001/69 Art. 405 c/c art. 244, §2º | `hediondo` | `Não` | `Sim` | 29 |
| 1281 | CPM (DL 1.001/69 Art. 400, III | `hediondo` | `Não` | `Sim` | 29 |
| 1451 | CPM (DL 1.001/69 Art. 242, §2º | `hediondo_condicao` | — | `Hediondo somente nos incisos I (quando a arma` | 29 |
| 1442 | CPM (DL 1.001/69 Art. 405 c/c art. 242, §2º | `hediondo_condicao` | — | `Hediondo somente nos incisos I (quando a arma` | 29 |
| 1453 | CPM (DL 1.001/69 Art. 243, §1º | `hediondo_condicao` | — | `Hediondo somente quando incide o inciso V, VI` | 29 |
| 1445 | CPM (DL 1.001/69 Art. 405 c/c art. 243, §1º | `hediondo_condicao` | — | `Hediondo somente quando incide o inciso V, VI` | 29 |
| 1289 | CPM (DL 1.001/69 Art. 405, caput | `hediondo_condicao` | — | `Hediondo nas formas que correspondem às hedio` | 29 |
| 1283 | CPM (DL 1.001/69 Art. 402, caput | `hediondo_condicao` | — | `Hediondo nas hipóteses dos incisos I, II, IV ` | 29 |
| 692 | CPM (DL 1.001/69 Art. 205, caput | `hediondo_condicao` | — | `Hediondo somente quando praticado em atividad` | 29 |
| 1280 | CPM (DL 1.001/69 Art. 400, I | `hediondo_condicao` | — | `Hediondo somente quando praticado em atividad` | 29 |
| 699 | CPM (DL 1.001/69 Art. 209, §2º | `hediondo_condicao` | — | `Hediondo somente quando praticada contra auto` | 29 |
| 1083 | CPM (DL 1.001/69 Art. 209, §3º-A | `hediondo_condicao` | — | `Hediondo somente quando praticada contra auto` | 29 |
| 1286 | CPM (DL 1.001/69 Art. 403, §2º | `hediondo_condicao` | — | `Hediondo somente quando praticada contra auto` | 29 |
| 1389 | CPM (DL 1.001/69 Art. 403, § 3º (no caso de | `hediondo_condicao` | — | `Hediondo somente quando praticada contra auto` | 29 |
| 1 | CP Art. 121, caput | `hediondo_condicao` | `Só quando praticado em atividade típica de gr` | `Hediondo somente quando praticado em atividad` | 28 |
| 20 | CP Art. 122, caput | `hediondo_condicao` | `Só na modalidade praticada por rede de comput` | `Hediondo somente quando realizado por meio da` | 28 |
| 24 | CP Art. 122, §4º | `hediondo_condicao` | `Só na modalidade praticada por rede de comput` | `Hediondo somente quando realizado por meio da` | 28 |
| 34 | CP Art. 129, §2º | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 630 | CP Art. 129, §2º, I | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 631 | CP Art. 129, §2º, II | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 632 | CP Art. 129, §2º, III | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 633 | CP Art. 129, §2º, IV | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 634 | CP Art. 129, §2º, V | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão gra` | 28 |
| 35 | CP Art. 129, §3º | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão cor` | 28 |
| 1314 | CP Art. 129, §3º-A | `hediondo_condicao` | `Lesão gravíssima e seguida de morte, só nas h` | `Hediondo somente quando praticada a lesão cor` | 28 |
| 73 | CP Art. 149-A | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 635 | CP Art. 149-A, I | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 636 | CP Art. 149-A, II | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 637 | CP Art. 149-A, III | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 638 | CP Art. 149-A, IV | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 639 | CP Art. 149-A, V | `hediondo_condicao` | `Hediondo apenas quando cometido contra crianç` | `Hediondo somente quando cometido contra crian` | 28 |
| 388 | Lei 12.850/13 Art. 2º, caput | `hediondo_condicao` | `Só quando a organização é direcionada à práti` | `Hediondo somente quando a organização crimino` | 28 |
| 671 | Lei 12.850/13 Art. 2º, §2º | `hediondo_condicao` | `Só quando a organização é direcionada à práti` | `Hediondo somente quando a organização crimino` | 28 |
| 1457 | CPM (DL 1.001/69 Art. 242, §2º, I | `hediondo_condicao` | `Somente quando a arma empregada é de fogo: o ` | `Hediondo somente quando a arma empregada é de` | 28 |
| 320 | Lei 11.343/06 Art. 34 | `hediondo_condicao` | `Maquinário: o STJ tem decisões nos dois senti` | *(esvaziado)* | 28 (sai da condição) |
| 323 | Lei 11.343/06 Art. 37 | `hediondo_condicao` | `Informante/colaborador: a equiparação é recon` | *(esvaziado)* | 28 (sai da condição) |
| 385 | Lei 9.455/97 Art. 1º, §2º | `hediondo_condicao` | `Omissão perante a tortura: pena própria de de` | *(esvaziado)* | 28 (sai da condição) |
| 320 | Lei 11.343/06 Art. 34 | `hediondo_nota` | — | `Divergência jurisprudencial sobre a equiparaç` | 28 |
| 323 | Lei 11.343/06 Art. 37 | `hediondo_nota` | — | `Divergência jurisprudencial sobre a equiparaç` | 28 |
| 385 | Lei 9.455/97 Art. 1º, §2º | `hediondo_nota` | — | `Divergência doutrinária sobre estender a equi` | 28 |
| 1306 | CP Art. 121, §2º-D | `hediondo_condicao` | `O rol remete ao §2º; o §2º-D é parágrafo próp` | *(esvaziado)* | 28 |
| 1306 | CP Art. 121, §2º-D | `hediondo_nota` | — | `O rol (Lei 8.072, art. 1º, I) alcança o homic` | 28 |
