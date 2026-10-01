"""Endereços públicos do projeto, lidos de `src/site/config.ts`.

`SITE_URL` e `REPOSITORIO` em `src/site/config.ts` são a fonte única dos dois
endereços: o Astro deriva de `SITE_URL` o `site` e o `base`, as notas o usam por
`urlPublica`, e os scripts Python leem os dois daqui. Trocar o endereço (o
domínio próprio, por exemplo) é mudar aquela constante e nada mais.

`SITE` sai sem a barra final: `f"{SITE}/tipos/{id}"`.
"""

from __future__ import annotations

import re
from pathlib import Path

CONFIG = Path(__file__).resolve().parents[1] / "src" / "site" / "config.ts"


def _ler(nome: str) -> str:
    texto = CONFIG.read_text(encoding="utf-8")
    achado = re.search(rf"^export const {nome} = '([^']+)';", texto, re.MULTILINE)
    if not achado:
        raise RuntimeError(f"{nome} não encontrado em {CONFIG}")
    return achado.group(1)


SITE = _ler("SITE_URL").rstrip("/")
REPOSITORIO = _ler("REPOSITORIO")
