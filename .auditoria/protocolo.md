# Auditoria do AtlasPen: protocolo

**Estado:** aprovado pelo mantenedor em 19/09/2026. O commit que o traz é o **registro prévio
do método**.
**Quando se sorteia:** só na versão amadurecida — depois de fechado e mergeado na `main` o
trabalho em curso (revamp, A2, critérios de hediondez e de ação penal, testes do motor, a
troca das heurísticas por regra). Conferir antes seria medir erros que já estão sendo
corrigidos. A semente do sorteio é o hash do **commit de merge** que o mantenedor declarar como
a versão a auditar; os tamanhos das tabelas abaixo são da data de redação e o script os
recalcula nesse commit. Nada deste texto muda depois do sorteio sem entrar na seção 10
(desvios); mudança antes do sorteio é commit comum, e o histórico do arquivo a registra.
**Publicação:** interna. Nem o protocolo nem o resultado vão para o site por ora (decisão de
19/09/2026).

---

## 1. Pergunta

Com que frequência o que o repositório afirma — dado, decisão e prosa — diverge do texto legal
vigente? A resposta é uma **taxa com intervalo de confiança**, por população e por estrato, mais
a lista de divergências achadas, cada uma corrigida no dado.

Não é pergunta deste protocolo se o catálogo está **completo** (o tipo que falta): isso é do
Recenseador e do Curador (`docs/os-robos.md`). Aqui se confere o que está publicado.

## 2. Referência

A verdade de referência é o **texto compilado do `planalto.gov.br`**, na data da conferência, a
mesma de `AGENTS.md`. Onde o compilado não basta (vigência de lei nova, redação controversa), a
publicação original no DOU. Jurisprudência só entra onde o próprio dado a invoca (Súmula, Tema
repetitivo, ADI) e é conferida contra o acórdão ou o enunciado.

## 3. Populações e estratégia

| # | População | Tamanho | Estratégia | Fase |
|---|---|---|---|---|
| P1 | Registros de tipo penal (`data/crimes.json`) | 1.507 | amostra estratificada, 300 | 1 |
| P1r | Registros de risco (seção 5) | ~55 | censo, fora da estimativa | 1 |
| P2 | Parâmetros de atributo (`data/atributos.json`) | 77 | censo | 2 |
| P3 | Notas, acervo, regras e exceções de hediondez, exceções da auditoria | ~100 | censo | 2 |
| P4 | Modificadores (`data/modificadores.json`) | 187 | amostra, 59 | 2 |
| P5 | Eventos do histórico legislativo | 227 | amostra, 59 | 2 |
| P6 | Vereditos do motor (tipo × atributo) | ~32 mil | 10 por atributo, estratificados por veredito, conferidos à mão contra a lei; **não substitui** a bateria de testes do motor, que é pré-requisito do sorteio | 2 |
| P7 | Afirmações verificáveis da prosa (`docs/`, textos do site) | a extrair | censo | 2 |

Censo onde a população é pequena e o erro mudaria veredito publicado; amostra onde não é.

## 4. P1: o desenho amostral

**Unidade:** o registro. **Moldura amostral:** `data/crimes.json` (a fonte, não o derivado) no
commit da semente.

**Campos conferidos** (11): dispositivo (existe e está vigente), nome do tipo, `pena_min`,
`pena_max`, `tipo_pena`, `hediondo` (e `hediondo_condicao`), `violencia`, `grave_ameaca`,
`elemento`, `tentativa`, `acao`.

**Estratos:** diploma × origem da moldura.

| | Moldura conferida pelo Vigia | Moldura derivada ou sem carimbo |
|---|---|---|
| CP | h1 | h2 |
| CPM | h3 | h4 |
| Leis especiais e LCP | h5 | h6 |

"Moldura derivada" é o resultado `sem_moldura_na_lei` de `data/conferencia.json`, mais o
registro sem carimbo: a pena publicada sai de uma conta (forma privilegiada, causa com fração)
que o Vigia não refaz, ou ninguém a conferiu. São 266 registros hoje, 131 deles no CP.

**Tamanho e alocação:** n = 300. Cada estrato recebe no mínimo 20; o restante se reparte
proporcionalmente ao tamanho, arredondado pelo método de Hamilton (maiores restos) para somar
exatamente 300. Sem o piso, o estrato CPM × moldura derivada (35 registros) receberia 7, e é
justamente a moldura que nenhum robô confere. Com o piso a amostra não é autoponderada: a taxa
global é a estimativa estratificada, com peso N_h/n_h por registro.

Tamanhos na data de redação (o script recalcula no commit de aprovação):

| Estrato | N_h | proporcional | com piso |
|---|---|---|---|
| CP, Vigia | 395 | 78,6 | ~77 |
| CP, derivada | 131 | 26,1 | ~26 |
| CPM, Vigia | 359 | 71,5 | ~70 |
| CPM, derivada | 35 | 7,0 | 20 |
| Especiais, Vigia | 487 | 96,9 | ~95 |
| Especiais, derivada | 100 | 19,9 | 20 |

Por que 300: com zero divergências em 299 registros, o limite superior unilateral de 95% da taxa
é 1 − 0,05^(1/299) ≈ 1,0%; com o piso, o efeito de delineamento é pequeno e o relatório dá o
número exato. Um estrato com 20 sorteados e nenhuma divergência tem limite de ~14%: a precisão é
do conjunto, não de cada estrato, e o relatório diz isso.

**Sorteio:** determinístico e conferível sem o código. Semente `S` = hash completo do commit de
merge declarado como versão a auditar (ver o cabeçalho). Para cada registro, `chave = sha256(S + ":" + id)` em hexadecimal; em cada estrato,
os `n_h` registros de menor chave. O script (`scripts/auditoria/sortear.py`) só aplica a regra;
qualquer pessoa pode refazê-la à mão.

**Subamostra de dupla conferência:** os 50 registros de menor chave **entre os 300**, sem olhar
estrato.

## 5. P1r: os registros de risco

Conferidos inteiros, com o mesmo protocolo, e **relatados à parte**: entraram por suspeita, e
misturá-los à amostra aleatória viciaria a taxa.

- os 16 registros sem carimbo em `data/conferencia.json` (ids 1430–1449 e 1506–1507, na data de
  redação);
- os 9 com resultado `divergente`;
- os 23 com `hediondo_condicao`;
- os alterados em `data/crimes.json` depois da última rodada do Vigia (10/08/2026), lidos do
  `git log`.

Registro que cai nas duas listas conta na amostra e é marcado na de risco.

## 6. A ficha e a cegueira

Cada registro vira uma ficha com: id, diploma, dispositivo e o link do compilado.

- **Cegos:** `pena_min`, `pena_max`, `tipo_pena`, `hediondo`, `violencia`, `grave_ameaca`,
  `elemento`, `tentativa`, `acao`. A pessoa lê a lei e preenche; o valor publicado fica num
  gabarito separado, e a comparação é do script de apuração. Mostrar o valor antes induz a
  confirmá-lo.
- **Abertos:** nome do tipo e vigência do dispositivo. Nome é texto livre e não se compara
  mecanicamente; a pessoa vê o nome publicado **depois** de ter lido o dispositivo.

Para cada campo, uma de quatro saídas:

| Saída | Quando |
|---|---|
| confere | a lei diz o que o dado diz |
| diverge | a lei diz outra coisa |
| fonte insuficiente | o compilado não permite decidir; diz o que faltou |
| juízo discutível | a lei permite mais de uma leitura; diz qual e por quê |

As duas últimas **não** contam como divergência, e são relatadas com a mesma visibilidade. Elas
não se resolvem na ficha: a regra de `AGENTS.md` vale aqui ("a questão jurídica em aberto não
vira dado").

**Gravidade** de cada divergência:

- **S1** — muda veredito publicado de atributo penal ou a moldura;
- **S2** — dado errado sem efeito sobre veredito (ex.: nome do tipo);
- **S3** — forma (vocabulário, grafia, `"Privada"` onde o contrato diz `"Ação Penal Privada"`).

Tempo registrado por ficha, para calibrar a fase 2.

## 7. Dupla conferência

Duas pessoas conferem os 50 registros da subamostra, **sem ver a ficha uma da outra** e sem
ver o gabarito. Concordância medida pelo κ de Cohen, por campo, sobre as quatro saídas.

- κ ≥ 0,80 no campo: o critério é reproduzível; vale a conferência simples nos outros 250.
- 0,60 ≤ κ < 0,80: as discordâncias são lidas juntas, o critério do campo ganha uma regra
  escrita (entra na seção 10), e segue.
- κ < 0,60: o campo é reconferido nos 300 depois da regra escrita.

Campo com prevalência extrema (hediondez, ~9%) pode ter κ baixo com concordância alta; o
relatório traz as duas medidas.

## 8. Regras de decisão

- **Toda divergência vira correção no dado**, pelo fluxo normal (PR, conferência, CI). Nenhuma
  vira exceção.
- **Escalonamento:** uma divergência S1 num campo, dentro de um estrato, leva o **campo** a
  censo **naquele estrato**. Se o campo tiver robô possível, escreve-se o robô em vez de
  conferir à mão.
- **Padrão sistemático:** duas divergências da mesma natureza em estratos diferentes levam o
  campo a censo no catálogo inteiro.
- O que o censo achar não entra na taxa (já é pós-escalonamento); entra na lista de
  correções.

## 9. Apuração

- Taxa de registros com ao menos uma divergência, e taxa por campo, com **intervalo exato de
  Clopper-Pearson** a 95%, global e por estrato.
- Separadas por gravidade: a taxa de S1 é o número que importa.
- κ por campo e concordância bruta (seção 7).
- A lista de risco, as saídas "fonte insuficiente" e "juízo discutível" e o tempo por ficha.
- Para P2 a P7, a mesma forma, com a estratégia de cada linha da seção 3.

## 10. Desvios

Toda mudança deste protocolo depois do commit de aprovação entra aqui, com data e motivo. O
sorteio não se refaz: registro adicionado depois é outra rodada.

*(nenhum)*

## 11. Limites declarados

- A referência é o compilado do Planalto, que pode errar; divergência entre compilado e DOU é
  relatada como achado à parte.
- A precisão de 1% é do conjunto de P1. Estratos pequenos têm intervalos largos.
- A subamostra de dupla conferência mede o critério, não a atenção de cada conferente nos
  outros 250.
- Completude (o tipo que falta) e decisão de tribunal não publicada no DOU estão fora (seção 1).
