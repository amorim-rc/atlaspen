#!/usr/bin/env bash
# Aplica um ruleset versionado ao repositório, criando ou atualizando pelo NOME.
#
#   ./.github/rulesets/aplicar.sh --listar                       # o que está no ar
#   ./.github/rulesets/aplicar.sh --ensaio protecao-main.json    # mostra e não envia
#   ./.github/rulesets/aplicar.sh protecao-main.json             # cria ou atualiza
#   ./.github/rulesets/aplicar.sh tags-release.json
#
# O arquivo é a fonte; o GitHub é o derivado. Mexeu na proteção pela interface
# web? Traga a mudança para cá, senão a próxima execução a desfaz em silêncio.
#
# Requer o `gh` autenticado com escopo de administração do repositório.
set -euo pipefail

# O repositório sai do remoto do próprio clone, e não de uma constante: ele
# ainda se chama `sispenas` e passa a `atlaspen` no lançamento. Constante aqui
# significaria um 404 no dia da renomeação.
REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)}"
[ -n "$REPO" ] || { echo "não descobri o repositório; passe REPO=dono/nome" >&2; exit 1; }
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

listar() {
  gh api "repos/$REPO/rulesets" \
    --jq '.[] | "\(.id)\t\(.enforcement)\t\(.name)"' 2>/dev/null \
    || { echo "não consegui ler os rulesets de $REPO (o gh está autenticado?)" >&2; exit 1; }
}

case "${1:-}" in
  --listar|-l) listar; exit 0 ;;
  "") echo "uso: $0 <arquivo.json> | --listar | --ensaio <arquivo.json>" >&2; exit 2 ;;
esac

ENSAIO=0
if [ "$1" = "--ensaio" ]; then ENSAIO=1; shift; fi

ARQ="$AQUI/$(basename "$1")"
[ -f "$ARQ" ] || { echo "não existe: $ARQ" >&2; exit 1; }
NOME="$(jq -r .name "$ARQ")"

if [ "$ENSAIO" = 1 ]; then
  echo "=== $NOME (ensaio, nada é enviado) ==="
  jq . "$ARQ"
  exit 0
fi

# Atualiza se já houver um ruleset com o mesmo nome; do contrário, cria. É o que
# torna o script repetível: rodar duas vezes não cria duas proteções iguais.
ID="$(gh api "repos/$REPO/rulesets" --jq ".[] | select(.name == \"$NOME\") | .id" | head -1)"

if [ -n "$ID" ]; then
  echo "atualizando \"$NOME\" (id $ID) em $REPO"
  gh api --method PUT "repos/$REPO/rulesets/$ID" --input "$ARQ" \
    --jq '"\(.name): \(.enforcement), \(.rules | length) regras"'
else
  echo "criando \"$NOME\" em $REPO"
  gh api --method POST "repos/$REPO/rulesets" --input "$ARQ" \
    --jq '"\(.name): \(.enforcement), \(.rules | length) regras"'
fi

echo
echo "estado atual:"
listar
