# -*- coding: utf-8 -*-
"""A defesa contra o falso NEGATIVO: o que o watcher não viu.

O sistema sabe quantos falsos positivos gera — o descartado sai nomeado no
relatório da semana. Não sabia nada sobre o inverso: **uma lei penal publicada
que o filtro não pegou não deixa rastro em lugar nenhum.**

Este módulo fecha essa janela pelo único caminho autoritativo: a lista de leis
sancionadas no ano, no próprio Planalto. Ela é a FONTE, não um comentário sobre
a fonte — repositório de doutrina noticia o que alguém achou relevante, e o
conferidor só enxerga o que já está no catálogo.

O que ele responde: *destas N leis do ano, quais o watcher examinou?* O que sobra
é a lista de leis que ninguém olhou — e é aí que uma lei penal pode ter passado.

Não classifica nada. Não diz se a lei é penal: diz que ela existe e que o watcher
não a viu. A leitura é humana, e é curta — leis sancionadas por ano ficam na casa
das centenas, e as que o watcher já examinou saem da conta.

Uso:
    python scripts/crawler/leis_do_ano.py               # ano corrente
    python scripts/crawler/leis_do_ano.py --ano 2025
    python scripts/crawler/leis_do_ano.py --saida crawler/relatorios

Saídas: 0 = nenhuma lei fora do exame; 2 = erro; 3 = há leis não examinadas.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from tempo import hoje  # noqa: E402

RELATORIOS = RAIZ / "crawler" / "relatorios"

# O índice de leis ordinárias do ano, no Planalto. É a página que o próprio
# governo mantém — e a razão de ela ser a fonte escolhida.
INDICE = "https://www.planalto.gov.br/ccivil_03/portaria/quadro_lei{ano}.htm"
INDICE_ALT = "https://www.planalto.gov.br/ccivil_03/leis/quadro/{ano}.htm"

CABECALHOS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
}

_NUMERO_DE_LEI = re.compile(r"Lei\s+n[ºo°.\s]*\s*([\d.]+)[,\s]", re.IGNORECASE)


def baixar(url: str) -> str | None:
    try:
        pedido = urllib.request.Request(url, headers=CABECALHOS)
        with urllib.request.urlopen(pedido, timeout=60) as r:
            bruto = r.read()
    except (urllib.error.URLError, TimeoutError, urllib.error.HTTPError):
        return None
    try:
        return bruto.decode("utf-8")
    except UnicodeDecodeError:
        return bruto.decode("cp1252", errors="replace")


def numeros_do_indice(html: str) -> set[str]:
    """Os números de lei que a página do ano lista, sem pontuação."""
    texto = re.sub(r"<[^>]+>", " ", html or "")
    return {m.group(1).replace(".", "").lstrip("0")
            for m in _NUMERO_DE_LEI.finditer(texto)}


def numeros_examinados(relatorios: Path) -> dict[str, str]:
    """Leis que o watcher já abriu, por número — venha de que rodada vier.

    Lê os JSON das rodadas guardadas. É por isso que guardar o texto integral
    importa: aqui basta o número, mas quem quiser RETRIAR um achado antigo
    contra um filtro novo precisa do corpo do ato, e ele está no mesmo arquivo.
    """
    vistos: dict[str, str] = {}
    for arquivo in sorted(relatorios.glob("dou-*.json")):
        try:
            dados = json.loads(arquivo.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        # O JSON da rodada já teve dois formatos: lista solta de candidatas e
        # objeto com a chave `candidatas`. Aceitar os dois evita que a conferência
        # perca as rodadas antigas — que são justamente as que interessam.
        if isinstance(dados, list):
            candidatas = dados
        elif isinstance(dados, dict):
            candidatas = dados.get("candidatas") or []
        else:
            continue
        for c in candidatas:
            if not isinstance(c, dict):
                continue
            m = _NUMERO_DE_LEI.search(c.get("titulo") or "")
            if m:
                vistos[m.group(1).replace(".", "").lstrip("0")] = arquivo.name
    return vistos


def montar_relatorio(ano: int, no_indice: set[str], vistos: dict[str, str]) -> str:
    fora = sorted(no_indice - set(vistos), key=lambda n: int(n) if n.isdigit() else 0)
    L = [f"## Leis de {ano} que o watcher não examinou — {hoje().isoformat()}", ""]
    if not no_indice:
        L += ["> A lista de leis do ano não pôde ser lida. Sem ela esta conferência "
              "não afirma nada — e não afirmar é o certo: o número que ela produz "
              "só vale se a fonte inteira tiver sido lida.", ""]
        return "\n".join(L) + "\n"

    L += [f"Das **{len(no_indice)}** leis sancionadas em {ano}, o watcher examinou "
          f"**{len(set(vistos) & no_indice)}**.", ""]
    if not fora:
        L += ["Nenhuma ficou de fora. A janela do falso negativo está fechada "
              "para este ano.", ""]
        return "\n".join(L) + "\n"

    L += [f"**{len(fora)}** não passaram pelo filtro — não quer dizer que sejam "
          "penais, quer dizer que ninguém olhou:", ""]
    for n in fora:
        formatado = f"{n[:-3]}.{n[-3:]}" if len(n) > 3 else n
        L.append(f"- Lei nº {formatado}/{ano} — "
                 f"https://www.planalto.gov.br/ccivil_03/_ato{ano}/{ano}/lei/l{n}.htm")
    L += ["", "> Leitura humana, e curta: basta a ementa de cada uma. O que "
          "interessa é a que cria, agrava ou revoga tipo penal — essa vira "
          "entrada em `data/fontes.json`, e o conferidor passa a vigiá-la.", ""]
    return "\n".join(L) + "\n"


def main() -> int:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    p = argparse.ArgumentParser(
        description="Compara a lista de leis do ano com o que o watcher examinou.")
    p.add_argument("--ano", type=int, default=hoje().year)
    p.add_argument("--saida", default=str(RELATORIOS))
    args = p.parse_args()

    html = baixar(INDICE.format(ano=args.ano)) or baixar(INDICE_ALT.format(ano=args.ano))
    no_indice = numeros_do_indice(html or "")
    vistos = numeros_examinados(Path(args.saida))

    relatorio = montar_relatorio(args.ano, no_indice, vistos)
    destino = Path(args.saida)
    destino.mkdir(parents=True, exist_ok=True)
    (destino / f"leis-do-ano-{args.ano}.md").write_text(relatorio, encoding="utf-8")
    print(relatorio)
    return 3 if (no_indice - set(vistos)) else 0


if __name__ == "__main__":
    raise SystemExit(main())
