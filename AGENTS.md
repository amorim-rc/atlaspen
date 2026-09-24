# Instruções para agentes de IA — AtlasPen

Ferramenta aberta de pesquisa de tipos penais e atributos penais. **Acuidade jurídica é o valor
central**: um dado errado publicado é pior que um dado ausente. Nada entra no catálogo sem
conferência contra o **texto compilado** oficial do `planalto.gov.br`.

Este arquivo é lido pelo Codex e demais agentes pelo nome; o Claude Code o lê via
`CLAUDE.md`, que só o importa. Regra nova entra **aqui**. Os próximos passos possíveis do
projeto estão em `backlog.md`.

## Versão e notas: o feed já registra, a Release espera a v1.0.0

Decisões de 10/09/2026 e de 14/09/2026:

- Até o lançamento oficial, a **v1.0.0**, o projeto anda em **`0.0.x`**. O `release.yml`
  não publica Release nem tag enquanto a versão for `0.x`.
- **O feed de notas já funciona em `0.0.x`** e publica **exclusivamente** alterações de
  LEI que criem, modifiquem ou extingam tipos penais ou atributos penais. Correção de dado
  do catálogo (o erro antigo que a conferência achou) **não** vira nota.
- Cada entrada (`src/data/changelog/entries/<ano>/<id>.ts`, um arquivo por mudança; passo
  a passo em `src/data/changelog/create-changelog-entry.md`) declara a natureza em termos
  penais: `incriminadora`, `pejus`, `mellius`, `abolitio` ou `abolitio-parcial`, pela
  régua doutrinária (decisões de 18/09/2026 e 37, de 23/09/2026): `incriminadora` é só
  a conduta antes atípica; a forma nova de conduta já punível é `pejus`; e
  **`abolitio-parcial` é a conduta que DEIXA de ser típica — a que segue punível com
  tratamento mais favorável é `mellius`**. A distinção não é de rótulo: decide
  retroatividade e extinção da punibilidade (CP, arts. 2º e 107, III). O
  `scripts/validar-changelog.mjs` reprova natureza fora do contrato e versão que não existe.
- O PR que traz nota sobe o patch em `package.json` e no lockfile. O Proponente faz isso
  sozinho quando a rodada tem alteração de lei recente: redação dada, ou dispositivo
  incluído, por lei deste ano ou do anterior, lido da anotação do compilado.

**Depois da v1.0.0**, cada versão volta a publicar também a Release no GitHub, a partir das
mesmas entradas. A versão segue a regra de `docs/dados-abertos.md` (Estabilidade e
versionamento), e o merge na `main` dispara o `release.yml`, que cria a tag. **Nunca faça
`git push origin vX.Y.Z` manual.**

## Convenções do catálogo

Estão em `CONTRIBUTING.md` (C1–C8) e são **impostas pela CI**. As que quebram em silêncio se
ignoradas:

- `data/crimes.json` é a **fonte**; `static/data/crimes.json` é **derivado** por
  `scripts/transform_data.py` — teste sempre contra o derivado.
- `id` é **append-only**: é a URL pública (`?tipo=N`). Nunca reatribua nem renumere. A
  numeração foi reiniciada DUAS vezes, as duas por decisão explícita do dono do projeto
  — v1.4.0 (protótipo) e v2.0.0 (fim da revisão da base). Fora disso, id retirado entra
  em `data/ids-aposentados.json` e `--estrito` reprova reaproveitamento — inclusive o
  caso silencioso de remover o topo da numeração e o `max + 1` devolver um número já
  usado. Reiniciar exige remapear TUDO que é indexado por id: `data/conferencia.json`,
  as tabelas `CORRECOES_*` do `transform_data.py`, os `ids` das exceções da auditoria e
  os links `?tipo=N` das notas já publicadas.
- **Glossário.** *Atributo penal* é o instituto (transação, progressão, prescrição…);
  *parâmetro*, o patamar, a fração ou a vedação editável de um atributo; *campo*, o
  campo do registro de tipo penal. "Benefício" só onde é a palavra da lei ou de
  súmula. Ver o `CONTRIBUTING.md`.
- `resultado_morte` deriva do **nome** do tipo, nunca do `obs`.
- Editar `.md` com Python/`sed` no Windows introduz **CRLF** (quebra os admonitions
  `:::note[...]`); use `write_bytes` ou confira o EOL.
- Admonitions: `:::note[Título]`, não `:::note Título` — é a sintaxe que
  `src/site/markdown/admonicoes.ts` lê.

## Verificação antes de concluir

```
python scripts/transform_data.py --estrito --max-contradicoes=0
python scripts/validar_modificadores.py
python scripts/validar_atributos.py
python scripts/robos/arquivista/verificar_documentacao.py
python -m pytest scripts/robos/tests
node scripts/validar-changelog.mjs
npm run atributos && npm run typecheck && npm run verificar && npm run build
```

A CI trava em `--max-contradicoes=0` e exige o derivado sincronizado com a fonte. Extraia
PDFs de leis com `pdftotext -layout -enc UTF-8` (o poppler não renderiza página aqui).

Mexeu no conferidor ou nos dados que ele lê? Rode também
`python scripts/robos/auditor/auditar.py` e `python scripts/robos/vigia/conferir.py`, que não
falham o build mas dizem o que ficou aberto.

Mexeu em `violencia`, `grave_ameaca` ou `acao`? Rode os dois derivadores, que comparam o
campo publicado com o texto do dispositivo e abrem três listas — confere, diverge e pede
juízo:

```
python scripts/robos/auditor/conferir_violencia.py --md auditoria/violencia-e-grave-ameaca.md
python scripts/robos/auditor/conferir_acao_penal.py --md auditoria/acao-penal.md
```

Eles NÃO escrevem no catálogo. O que a regra não decide sai marcado como juízo, e juízo é da
pessoa que assina.

## O que NÃO entra no catálogo, e onde entra

- **`scripts/robos/auditor/excecoes-auditoria.json`** — o achado da auditoria que já foi julgado
  e não precisa voltar. Casa por tipo de achado MAIS um alvo, nunca por tipo sozinho, e
  declara motivo e data. Divergência real nunca vira exceção: vira correção no dado.
- **A questão jurídica em aberto não vira dado.** Havia um `REVISAO-PENDENTE.md` na raiz
  para isso; ele saiu na v2.0.0, quando a revisão da base fechou as perguntas que ele
  guardava. Se a próxima aparecer, o lugar dela é o mesmo de sempre: **o registro diz o
  que se sabe e cala o que não se sabe** — moldura condicional, `hediondo_condicao`,
  `acao_condicao`, `pena_por_remissao`, `vigencia_ate` — e a discussão vai para a issue,
  não para o campo. Nunca preencha lacuna com plausibilidade.

Trabalhe em branch própria, commits pequenos e descritivos; **não faça push nem abra PR sem
o usuário pedir**.
