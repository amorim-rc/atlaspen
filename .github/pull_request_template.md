<!--
Antes de abrir: o AGENTS.md traz as regras que valem para gente e para agente, e o
CONTRIBUTING.md traz as convenções C1 a C8 do catálogo.
-->

## O que muda e por quê

<!-- Uma ou duas frases. Se corrige dado, diga qual registro (`?tipo=N`) e o que estava errado. -->

## Onde

- [ ] Catálogo de tipos penais (`data/crimes.json`)
- [ ] Modificadores da dosimetria (`data/modificadores.json`)
- [ ] Outros dados (`data/*.json`)
- [ ] Benefícios penais (`src/lib/beneficios/`)
- [ ] Dosimetria e demais regras (`src/lib/`)
- [ ] Robôs e scripts (`scripts/`, `crawler/`)
- [ ] Interface (`src/components/`, `src/pages/`, `src/css/`)
- [ ] Documentação (`docs/`, `*.md`)
- [ ] Notas de atualizações (`src/data/changelog/`)
- [ ] Infra e CI (`.github/`, configuração do Docusaurus)

## Fonte legal

<!-- Obrigatório quando o PR toca dado ou regra jurídica. -->

- Dispositivo(s):
- Link do texto compilado no `planalto.gov.br`:
- [ ] Conferi contra o **texto compilado**, não contra a lei publicada no dia, um resumo
      ou a memória.
- [ ] Onde a lei deixa em aberto, o registro cala (`hediondo_condicao`, `acao_condicao`,
      `pena_por_remissao`, `vigencia_ate`) e a discussão foi para uma issue.

## Checklist

- [ ] Editei só a **fonte** (`data/*.json`). O derivado em `static/data/` foi regenerado
      pelo `transform_data.py`, nunca à mão.
- [ ] Nenhum `id` foi reatribuído, renumerado ou reaproveitado.
- [ ] Mudança substantiva ganhou entrada em `src/data/changelog/entries/<ano>/<id>.ts`
      (passo a passo em `src/data/changelog/create-changelog-entry.md`).
- [ ] Se mudei algo de que um documento fala, reli o documento. O Arquivista acusa o que
      venceu: `python scripts/robos/arquivista/verificar_documentacao.py`.
- [ ] A verificação passa:

```
python scripts/transform_data.py --estrito --max-contradicoes=0
python scripts/validar_modificadores.py
python -m pytest scripts/robos/tests
node scripts/validar-changelog.mjs
npm run typecheck && npm run verificar && npm run build
```

## Agente de IA

<!-- Se o PR foi feito com Claude Code, Codex ou outro agente: qual, e o que uma pessoa conferiu. -->

## Para a revisão

<!-- O que precisa de olho jurídico, o que ficou em aberto, o que não foi testado. -->
