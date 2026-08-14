# -*- coding: utf-8 -*-
"""Quando a alteração passa a valer (F4).

Uma lei publicada não é uma lei em vigor. A revisão manual quase caiu nessa duas
vezes: a **Lei 15.190/2025** (licenciamento ambiental) só passou a valer 180 dias
depois de publicada, e a **LC 224/2025** produz efeitos a partir de 1º/01/2026.
Corrigir o catálogo antes disso seria publicar como vigente o que ainda não é —
o oposto do que o projeto promete.

Este módulo lê a cláusula final de vigência de uma lei e responde: **em que data
ela passa (ou passou) a valer?** Achados de norma ainda não vigente vão para uma
seção própria do relatório, com a data — não somem, mas também não viram patch.

As funções são puras (recebem texto). O download fica em `baixar.py`, para que
os testes rodem sem rede.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, timedelta

MESES = {
    "janeiro": 1, "fevereiro": 2, "março": 3, "marco": 3, "abril": 4,
    "maio": 5, "junho": 6, "julho": 7, "agosto": 8, "setembro": 9,
    "outubro": 10, "novembro": 11, "dezembro": 12,
}
_EXTENSO_DIAS = {
    "trinta": 30, "sessenta": 60, "noventa": 90, "cento e oitenta": 180,
    "cento e vinte": 120, "um ano": 365, "dois anos": 730,
}

_PUBLICACAO = re.compile(
    rf"\bDE\s+(\d{{1,2}})\s*[ºo°]?\s+DE\s+({'|'.join(MESES)})\s+DE\s+(\d{{4}})", re.I)
_IMEDIATA = re.compile(r"entra em vigor na data (?:de sua|da) publica", re.I)
_VACATIO = re.compile(
    r"entra em vigor ap[óo]s decorridos?\s+(\d+)\s*(?:\([^)]*\))?\s*dias", re.I)
_VACATIO_EXTENSO = re.compile(
    rf"entra em vigor ap[óo]s decorridos?\s+({'|'.join(_EXTENSO_DIAS)})\s+dias", re.I)
_DATA_CERTA = re.compile(
    rf"(?:a partir de|em)\s+(\d{{1,2}})\s*[ºo°]?\s+de\s+({'|'.join(MESES)})\s+de\s+(\d{{4}})",
    re.I)


_VACATIO_MESES = re.compile(
    r"entra em vigor ap[óo]s decorridos?\s+(\d+)\s*(?:\([^)]*\))?\s*meses", re.I)
_EXERCICIO_SEGUINTE = re.compile(
    r"entra em vigor (?:no|em) (?:o\s+)?primeiro dia do exerc[íi]cio "
    r"(?:financeiro\s+)?seguinte", re.I)
# "Esta Lei entra em vigor: I - na data de sua publicação…; II - após
# decorridos 180 dias…" — duas datas no mesmo diploma.
_ESCALONADA = re.compile(
    r"entra em vigor\s*:\s*(?:\n|\s)*[IVX]+\s*[-–—]", re.I)


def _fim_da_vacatio(publicacao, dias: int):
    """A data em que a lei passa a valer, contada como a LC 95/98 manda.

    Art. 8º, §1º: a contagem **inclui a data da publicação e o último dia do
    prazo**, e a lei entra em vigor **no dia subsequente** à consumação
    integral. O dia da publicação é o dia 1, não o dia 0.

    Some-se a conta e o resultado é `publicação + dias`, que é o que estava
    escrito aqui desde sempre: se o dia 1 é o da publicação, o último dia do
    prazo é `publicação + (dias − 1)`, e o dia subsequente é `publicação +
    dias`. Lei publicada em 08/08/2025 com 180 dias de vacância vigora em
    04/02/2026 — confere.

    A função existe para que a regra fique ESCRITA junto da conta. Uma revisão
    externa apontou aqui um erro de um dia; não havia, e a checagem custou o
    tempo de refazer a soma. Sem o fundamento ao lado, ela vai ser refeita toda
    vez que alguém olhar.
    """
    if publicacao is None:
        return None
    return publicacao + timedelta(days=dias)


def _fim_da_vacatio_em_meses(publicacao, meses: int):
    """Mesma regra, com o prazo contado pelo calendário, não em múltiplos de 30."""
    if publicacao is None:
        return None
    ano = publicacao.year + (publicacao.month - 1 + meses) // 12
    mes = (publicacao.month - 1 + meses) % 12 + 1
    dia = publicacao.day
    while True:
        try:
            return date(ano, mes, dia)
        except ValueError:      # 31 de janeiro + 1 mês
            dia -= 1


@dataclass
class Vigencia:
    publicacao: date | None
    inicio: date | None          # quando passa a valer
    clausula: str                # trecho que fundamentou a leitura
    incerta: bool = False        # não foi possível determinar com segurança

    def vigente_em(self, quando: date) -> bool:
        """Na dúvida, responde True: um achado suprimido por engano é pior que
        um achado a mais — o relatório é revisado por humano de qualquer modo."""
        return True if self.inicio is None else quando >= self.inicio


def ler_publicacao(texto: str) -> date | None:
    """Data do cabeçalho: "LEI Nº 15.190, DE 8 DE AGOSTO DE 2025"."""
    m = _PUBLICACAO.search(texto)
    if not m:
        return None
    try:
        return date(int(m.group(3)), MESES[m.group(2).lower()], int(m.group(1)))
    except ValueError:
        return None


def analisar(texto: str) -> Vigencia:
    """Interpreta cabeçalho + cláusula de vigência de uma lei."""
    publicacao = ler_publicacao(texto)

    m = _VACATIO.search(texto) or _VACATIO_EXTENSO.search(texto)
    if m:
        bruto = m.group(1)
        dias = int(bruto) if bruto.isdigit() else _EXTENSO_DIAS[bruto.lower()]
        inicio = _fim_da_vacatio(publicacao, dias)
        return Vigencia(publicacao, inicio, m.group(0), incerta=publicacao is None)

    m = _VACATIO_MESES.search(texto)
    if m:
        # Meses não são 30 dias: "após decorridos 6 meses" conta pelo calendário.
        inicio = _fim_da_vacatio_em_meses(publicacao, int(m.group(1)))
        return Vigencia(publicacao, inicio, m.group(0), incerta=publicacao is None)

    if _EXERCICIO_SEGUINTE.search(texto):
        inicio = date(publicacao.year + 1, 1, 1) if publicacao else None
        return Vigencia(publicacao, inicio, _EXERCICIO_SEGUINTE.search(texto).group(0),
                        incerta=publicacao is None)

    # Vigência escalonada por artigo: "Esta Lei entra em vigor: I – na data de
    # sua publicação, quanto a…; II – após decorridos 180 dias, quanto a…". Não
    # há UMA data, e fingir que há seria pior que declarar a incerteza.
    if _ESCALONADA.search(texto):
        return Vigencia(publicacao, None,
                        "vigência escalonada por dispositivo — ler a cláusula",
                        incerta=True)

    # "produzirá efeitos a partir de 1º de janeiro de 2026" — a lei entra em
    # vigor na publicação, mas os dispositivos só valem na data indicada.
    if re.search(r"produzir[áa] efeitos", texto, re.I):
        md = _DATA_CERTA.search(texto)
        if md:
            try:
                inicio = date(int(md.group(3)), MESES[md.group(2).lower()],
                              int(md.group(1)))
                return Vigencia(publicacao, inicio, md.group(0))
            except ValueError:
                pass
        # Há produção de efeitos diferida, mas em termo que não sabemos ler
        # ("primeiro dia do quarto mês subsequente"): marcar como incerta.
        return Vigencia(publicacao, None, "produção de efeitos diferida",
                        incerta=True)

    if _IMEDIATA.search(texto):
        return Vigencia(publicacao, publicacao, _IMEDIATA.search(texto).group(0),
                        incerta=publicacao is None)

    # O SILÊNCIO tem regra, e ela não é "vale já": a lei que nada diz entra em
    # vigor 45 dias depois de publicada (LINDB, art. 1º). Tratar silêncio como
    # vigência imediata errava em 45 dias, e errava para o lado de publicar como
    # vigente o que ainda não é — o oposto do que o projeto promete.
    if publicacao:
        return Vigencia(publicacao, _fim_da_vacatio(publicacao, 45),
                        "sem cláusula de vigência — LINDB, art. 1º: 45 dias")
    return Vigencia(None, None, "cláusula de vigência não localizada", incerta=True)


def url_da_lei(norma: str, ano: int) -> str | None:
    """URL provável do texto da lei-reforma no Planalto.

    Só cobre 2023+ — que é o alcance de interesse: alteração antiga já está em
    vigor, e o custo de errar a URL de uma lei velha não se justifica.
    """
    m = re.search(r"([\d.]+)$", (norma or "").strip())
    if not m or ano < 2023:
        return None
    numero = m.group(1).replace(".", "")
    tipo = "lcp/Lcp" if "complementar" in (norma or "").lower() else "lei/L"
    if "complementar" in (norma or "").lower():
        return f"https://www.planalto.gov.br/ccivil_03/leis/{tipo}{numero}.htm"
    return (f"https://www.planalto.gov.br/ccivil_03/_ato2023-2026/{ano}/"
            f"{tipo}{numero}.htm")


def main() -> int:
    """CLI: `python scripts/crawler/vigencia.py "Lei nº 15.190" 2025`.

    Útil na triagem — antes de corrigir o catálogo por causa de uma lei nova,
    confirmar que ela já vale. O download fica aqui, e não nas funções puras,
    para que os testes rodem sem rede.
    """
    import argparse
    import sys
    from datetime import date as _date

    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
    from baixar import buscar, decodificar, normalizar  # noqa: E402
    from parsear import paragrafos  # noqa: E402

    p = argparse.ArgumentParser(description="Diz desde quando uma lei vale.")
    p.add_argument("norma", help='ex.: "Lei nº 15.190"')
    p.add_argument("ano", type=int)
    args = p.parse_args()

    url = url_da_lei(args.norma, args.ano)
    if not url:
        print(f"Sem URL conhecida para {args.norma} ({args.ano}) — anterior a 2023?")
        return 1
    texto = normalizar(" ".join(x.texto for x in paragrafos(decodificar(buscar(url))[0])))
    v = analisar(texto)
    hoje = _date.today()
    print(f"{args.norma} ({args.ano})  {url}")
    print(f"  publicação : {v.publicacao}")
    print(f"  em vigor   : {v.inicio or '(indeterminado)'}"
          f"{'  ⚠ leitura incerta' if v.incerta else ''}")
    print(f"  cláusula   : {v.clausula[:100]}")
    print(f"  vale hoje? : {'SIM' if v.vigente_em(hoje) else 'NÃO — não corrigir ainda'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
