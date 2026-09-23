# Dano qualificado: os registros 120 e 601 no histórico do repositório

O registro **120** é o parágrafo único inteiro do art. 163 do Código Penal; o **601** é o inciso I (dano com violência à pessoa ou grave ameaça), que tem registro próprio. A pergunta do guarda-chuva — se o registro do parágrafo inteiro pode afirmar o que só vale de um dos seus incisos — se lê nos dois juntos.

:::warning[A numeração de ids foi reiniciada duas vezes]
Em 31/07/2026 (v1.4.0) e em 06/08/2026 (v2.0.0). **Antes dessas datas o mesmo id era outro crime**: o 601 chegou a ser o art. 359-O do Código Penal. Só o que vem depois de 06/08/2026 fala destes registros.
:::

Cada seção é um commit em que o registro mudou, do mais antigo para o mais novo, lido com `git show <commit>:data/crimes.json`.

## Registro 120

### 2026-06-23 — `b43eafe` Update crimes.json

```json
{
  "id": 120,
  "lei": "CP",
  "artigo": "Art. 159, §3º",
  "crime": "Extorsão mediante sequestro com resultado morte",
  "pena_min": 288,
  "pena_max": 360,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "hediondo": "Sim",
  "elemento": "Preterdoloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "obs": "24-30 anos reclusão. Hediondo"
}
```

### 2026-07-13 — `afbaf34` Delete data/crimes.json

O registro não existe nesta versão.

### 2026-07-13 — `f8da1ae` Add files via upload

```json
{
  "id": 120,
  "lei": "CP",
  "artigo": "Art. 159, §3º",
  "crime": "Extorsão mediante sequestro com resultado morte",
  "pena_min": 288,
  "pena_max": 360,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "hediondo": "Sim",
  "elemento": "Preterdoloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "obs": "24-30 anos reclusão. Hediondo"
}
```

### 2026-08-01 — `584e44c` fix(catalogo): fecha os doze pendentes e renumera os ids de 1 a 1.412

Campos que mudaram: artigo, crime, elemento, grave_ameaca, hediondo, obs, pena_max, pena_min, tipo_pena.

- `artigo`: 'Art. 159, §3º' → 'Art. 163, parágrafo único'
- `crime`: 'Extorsão mediante sequestro com resultado morte' → 'Dano qualificado (violência/substância inflamável/patrimônio público/motivo egoístico)'
- `elemento`: 'Preterdoloso' → 'Doloso'
- `grave_ameaca`: 'Sim' → 'Não'
- `hediondo`: 'Sim' → 'Não'
- `obs`: '24-30 anos reclusão. Hediondo' → '6 meses a 3 anos detenção + multa. I - com violência ou ameaça; II - com substância inflamável/explosiva; III - contra patrimônio público/União/Estado/Município; IV - por motivo egoístico ou com prejuízo considerável'
- `pena_max`: 360 → 36
- `pena_min`: 288 → 6
- `tipo_pena`: 'Reclusão' → 'Detenção'

```json
{
  "id": 120,
  "lei": "CP",
  "artigo": "Art. 163, parágrafo único",
  "crime": "Dano qualificado (violência/substância inflamável/patrimônio público/motivo egoístico)",
  "pena_min": 6,
  "pena_max": 36,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Não",
  "obs": "6 meses a 3 anos detenção + multa. I - com violência ou ameaça; II - com substância inflamável/explosiva; III - contra patrimônio público/União/Estado/Município; IV - por motivo egoístico ou com prejuízo considerável"
}
```

### 2026-08-06 — `0f96505` revisao: aplica a planilha de conferencia sobre o catalogo

Campos que mudaram: crime.

- `crime`: 'Dano qualificado (violência/substância inflamável/patrimônio público/motivo egoístico)' → 'Dano qualificado'

```json
{
  "id": 120,
  "lei": "CP",
  "artigo": "Art. 163, parágrafo único",
  "crime": "Dano qualificado",
  "pena_min": 6,
  "pena_max": 36,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Não",
  "obs": "6 meses a 3 anos detenção + multa. I - com violência ou ameaça; II - com substância inflamável/explosiva; III - contra patrimônio público/União/Estado/Município; IV - por motivo egoístico ou com prejuízo considerável"
}
```

## Registro 601

### 2026-06-23 — `b43eafe` Update crimes.json

```json
{
  "id": 601,
  "lei": "CP",
  "artigo": "Art. 359-O",
  "crime": "Comunicação enganosa em massa (espalhar desinformação por qualquer meio de comunicação para comprometer processo eleitoral)",
  "pena_min": 12,
  "pena_max": 60,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "obs": "1-5 anos reclusão + multa. Lei 14.197/21. Se cometido por agente público: aumento de 1/3"
}
```

### 2026-07-13 — `afbaf34` Delete data/crimes.json

O registro não existe nesta versão.

### 2026-07-13 — `f8da1ae` Add files via upload

```json
{
  "id": 601,
  "lei": "CP",
  "artigo": "Art. 359-O",
  "crime": "Comunicação enganosa em massa (espalhar desinformação por qualquer meio de comunicação para comprometer processo eleitoral)",
  "pena_min": 12,
  "pena_max": 60,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "obs": "1-5 anos reclusão + multa. Lei 14.197/21. Se cometido por agente público: aumento de 1/3"
}
```

### 2026-08-01 — `584e44c` fix(catalogo): fecha os doze pendentes e renumera os ids de 1 a 1.412

Campos que mudaram: artigo, crime, obs, pena_max, pena_min.

- `artigo`: 'Art. 359-O' → 'Art. 180, §4º'
- `crime`: 'Comunicação enganosa em massa (espalhar desinformação por qualquer meio de comunicação para comprometer processo eleitoral)' → 'Receptação de veículo automotor ou componente (qualificada)'
- `obs`: '1-5 anos reclusão + multa. Lei 14.197/21. Se cometido por agente público: aumento de 1/3' → '3-8 anos reclusão + multa. Receptação de veículo com sinal adulterado'
- `pena_max`: 60 → 96
- `pena_min`: 12 → 36

```json
{
  "id": 601,
  "lei": "CP",
  "artigo": "Art. 180, §4º",
  "crime": "Receptação de veículo automotor ou componente (qualificada)",
  "pena_min": 36,
  "pena_max": 96,
  "tipo_pena": "Reclusão",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Não",
  "grave_ameaca": "Não",
  "obs": "3-8 anos reclusão + multa. Receptação de veículo com sinal adulterado"
}
```

### 2026-08-06 — `0f96505` revisao: aplica a planilha de conferencia sobre o catalogo

Campos que mudaram: artigo, crime, grave_ameaca, obs, pena_max, pena_min, tipo_pena, violencia.

- `artigo`: 'Art. 180, §4º' → 'Art. 163, §único, I'
- `crime`: 'Receptação de veículo automotor ou componente (qualificada)' → 'Dano qualificado — com violência à pessoa ou grave ameaça'
- `grave_ameaca`: 'Não' → 'Sim'
- `obs`: '3-8 anos reclusão + multa. Receptação de veículo com sinal adulterado' → '6 meses a 3 anos detenção + multa'
- `pena_max`: 96 → 36
- `pena_min`: 36 → 6
- `tipo_pena`: 'Reclusão' → 'Detenção'
- `violencia`: 'Não' → 'Sim'

```json
{
  "id": 601,
  "lei": "CP",
  "artigo": "Art. 163, §único, I",
  "crime": "Dano qualificado — com violência à pessoa ou grave ameaça",
  "pena_min": 6,
  "pena_max": 36,
  "tipo_pena": "Detenção",
  "acao": "Pública Incondicionada",
  "hediondo": "Não",
  "elemento": "Doloso",
  "tentativa": "Sim",
  "violencia": "Sim",
  "grave_ameaca": "Sim",
  "obs": "6 meses a 3 anos detenção + multa"
}
```

