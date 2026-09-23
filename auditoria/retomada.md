# Prompt de retomada (sessão nova, janela menor)

Copie daqui para baixo, preenchendo as respostas da revisão fina no lugar indicado.

---

Trabalho no **AtlasPen**, em `C:\Users\LC\Desktop\Projetos\sispenas-atlaspen` — worktree da
branch **`revamp/atlaspen`**, que está 68 commits à frente da `main` e **sem push**. Tudo
continua nessa branch: um merge grande no fim, e nada de push ou PR sem eu pedir. As regras do
projeto estão em `AGENTS.md` (lido via `CLAUDE.md`); a bateria de verificação está lá e roda
inteira antes de cada commit.

## Onde paramos (22/09/2026)

A base está conferida contra os compilados do Planalto baixados em 19/09: 1.512 tipos, 0
divergências de moldura, nenhum artigo ausente. Nesta rodada fechamos: conferência integral do
Código Eleitoral (5 tipos que faltavam), hediondez com espécie e fundamento derivados da tabela
curada, vocabulário fechado da ação penal com derivador próprio, tabela de 47 casos-padrão do
motor, congelamento de vereditos em 4 cenários, a última alteração legislativa de cada tipo
(frente 4), completude em 61 de 61 diplomas e a autoria no nome de Luccas de Amorim.

Três documentos guiam o resto, todos em `auditoria/`:

- **`revisao-fina.md`** — as 32 decisões jurídicas numeradas, com a lista de registros de cada
  uma. É a parte do mantenedor.
- **`situacao-v1.md`** — o que falta para a v1.0.0, frente a frente, e o caminho crítico.
- **`protocolo.md`** — o método da auditoria por amostra, que só roda na versão amadurecida.

Os dois derivadores que produzem as listas, e que **não escrevem no catálogo**:

```
python scripts/robos/auditor/conferir_violencia.py --md auditoria/violencia-e-grave-ameaca.md
python scripts/robos/auditor/conferir_acao_penal.py --md auditoria/acao-penal.md
```

## Decisões já tomadas, que valem como contexto

- **A v1.0.0 é o lançamento com endereço próprio** (domínio atlaspen.org.br e repositório
  renomeado). Até lá é fase pré-v1, e tudo o que puder entrar antes entra.
- **A simulação legislativa entra na v1** (decisão de 22/09/2026). Não vira módulo: as quatro
  pendências dela — atributo novo com mais de um limiar, tipo modificado (nome, dispositivo,
  elemento), etiqueta de sentido da mudança que só altera valor, e testes de interface — são
  entrega, e se trabalha nelas o quanto for necessário.
- **Domínio e organização no GitHub estão em espera**, sem prazo.
- A violência afirma violência **dolosa contra pessoa**; a hediondez distingue **natureza** de
  **equiparado**; a ação penal tem vocabulário fechado. Onde a lei decide, a correção entra;
  onde é juízo, a decisão é minha e fica registrada.

## O que fazer, nesta ordem

1. **Aplicar as respostas da revisão fina** (abaixo). Cada decisão vira, primeiro, **regra
   escrita** no derivador (`scripts/violencia.py`, `scripts/acao_penal.py`) e só depois
   correção no dado, para que o próximo tipo da mesma família já nasça decidido. Regenerar os
   relatórios, rodar a bateria e regravar o congelamento (`npm run equivalencia -- --gravar`)
   quando o veredito mudar, dizendo no commit o que mudou e por quê.
2. **A segunda parte da simulação (A2)**, que entra na v1. Comece pelo desenho: contrato do
   atributo novo com mais de um limiar; edição de nome, dispositivo e elemento do tipo
   modificado; a etiqueta de sentido para a mudança que só altera valor; e os testes de
   interface. Os specs anteriores estão em `docs/superpowers/specs/`.
3. **O resto da frente 4**: a data exata de publicação e de vigência de cada lei alteradora — o
   compilado dá só o ano.
4. **O critério do elemento subjetivo** (decisão 31 da revisão fina).

## Respostas da revisão fina

> Cole aqui as respostas, no formato "1 ok", "5 não: …", item a item. O índice numerado está no
> topo de `auditoria/revisao-fina.md`.

(preencher)
