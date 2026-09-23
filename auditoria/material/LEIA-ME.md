# Material de apoio às decisões

Cada arquivo abaixo existe para uma decisão do índice de `auditoria/revisao-fina.md`. Copie a
pasta `auditoria/` inteira: ela se basta, e os arquivos se referenciam entre si.

## O que abrir para cada decisão

| Decisão | Arquivo | O que olhar |
|---|---|---|
| **7** — os 63 avulsos de violência | `../violencia-e-grave-ameaca.md`, seção **Divergências** | As linhas com regra `silencio-da-lei` que não caem nas famílias 1 a 6. O relatório traz, por linha, o valor publicado, o derivado e o trecho da lei. |
| **8 a 11** — as famílias de juízo | `../violencia-e-grave-ameaca.md`, seção **Pedem juízo** | Agrupadas por regra: `meio-alternativo`, `ameaca-sem-qualificativo`, `perigo-a-pessoa`, `violencia-em-sentido-proprio`. |
| **11** — o guarda-chuva do dano qualificado | `11-dano-qualificado-120-e-601.md` | O histórico dos registros 120 (parágrafo único inteiro) e 601 (inciso I), versão a versão. **Atenção ao aviso sobre a renumeração de ids.** |
| **12 a 17** — ação penal com ressalva | `../acao-penal.md`, seção **Pedem juízo** | Agrupadas pela regra que as alcança (art. 182, art. 145, art. 199 da Lei 9.279/96…), com o texto da regra em citação. |
| **13** — art. 145 do CP | `../acao-penal.md` | As 23 linhas sob "Art. 145"; a ressalva está no próprio texto citado. |
| **19 e 20** — tentativa | `../revisao-fina.md`, **Bloco E** | As duas listas completas: 15 crimes de atentado e 9 preterdolosos. |
| **26** — atributos não calculados | `26-sem-pena-privativa.md` | Os 33 registros sem pena privativa, quais 4 atributos o motor calcula neles e quais 18 não. |
| **31** — elemento subjetivo | `31-preterdolosos.md` | Os 21 preterdolosos, com moldura e o que o catálogo diz de tentativa em cada um. |

## O texto da lei, para conferir qualquer decisão

Os compilados do Planalto ficam em `crawler/snapshots/<diploma>/<AAAA-MM-DD>.html`, **fora do
versionamento** (são grandes e refazíveis). Os desta rodada foram baixados em 19/09/2026. Para
copiá-los junto, leve a pasta `crawler/snapshots/`; para baixá-los de novo:

```
python scripts/robos/nucleo/baixar.py --todas
```

## Onde está o resto

| Arquivo | O que é |
|---|---|
| `../revisao-fina.md` | O índice das 32 decisões e as listas completas de cada bloco. |
| `../violencia-e-grave-ameaca.md` | Catálogo × texto da lei, campo a campo: 2.792 conferem, 149 divergem, 83 pedem juízo. |
| `../acao-penal.md` | Catálogo × regras de ação penal do diploma: 1.363 conferem, 0 divergem, 149 pedem juízo. |
| `../situacao-v1.md` | O que falta para a v1.0.0, e de quem depende. |
| `../protocolo.md` | O método da auditoria por amostra, registrado antes do sorteio. |
| `../retomada.md` | O prompt para retomar o trabalho em outra sessão. |

## Como estes arquivos são refeitos

Os dois relatórios e o material saem de scripts, e não da mão:

```
python scripts/robos/auditor/conferir_violencia.py --md auditoria/violencia-e-grave-ameaca.md
python scripts/robos/auditor/conferir_acao_penal.py --md auditoria/acao-penal.md
```

Refaça-os depois de cada correção no catálogo: a lista muda, e decidir sobre uma lista velha é
decidir duas vezes.
