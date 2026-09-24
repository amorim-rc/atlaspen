# -*- coding: utf-8 -*-
"""A base inteira em uma planilha assinada, para quem trabalha em Excel.

Derivado dos derivados: lê ``static/data/crimes.json`` e
``static/data/atributos.json`` — nunca a fonte —, porque é o mesmo arquivo que
o site serve, e planilha que discorde da tela é pior que planilha nenhuma.

**Não é versionada.** O `deploy.yml` a gera dentro de ``dist/`` logo antes de
publicar, sempre no MESMO caminho. Cada publicação substitui a anterior, e não
existem duas planilhas no ar ao mesmo tempo. Commitar um binário que se
regenera a cada build encheria o histórico de diffs ilegíveis, e a cópia
commitada envelheceria em relação ao catálogo — que é exatamente o defeito que
esta planilha existe para não ter.

Quatro abas:

    Leia-me            a assinatura: versão, data, commit, licença, como citar
                       e as armadilhas de leitura
    Tipos penais       um registro por linha, com a URL pública de cada um
    Atributos          os 22, com fundamento, parâmetros e alcance
    Matriz de alcance  os 1.496 tipos com pena privativa × os 22 atributos

**A armadilha do Excel.** Ela mora na importação de TEXTO: quem abre um CSV vê
"1-3" virar 3 de janeiro e "147-A" perder o sentido. Uma planilha .xlsx não tem
esse problema — a célula carrega o tipo —, desde que quem a escreve não peça
conversão. Aqui todo campo textual é escrito como texto e recebe formato `@`,
que também desliga o aviso de "número armazenado como texto"; e todo campo
numérico é escrito como número de verdade, para ordenar e filtrar como número.

Uso:
    python scripts/gerar_planilha.py                      # -> dist/data/atlaspen-base.xlsx
    python scripts/gerar_planilha.py --saida outro.xlsx
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

RAIZ = Path(__file__).resolve().parents[1]
SAIDA_PADRAO = RAIZ / "dist" / "data" / "atlaspen-base.xlsx"
SITE = "https://amorim-rc.github.io/atlaspen"

TEXTO = "@"
INTEIRO = "0"

CABECALHO_FUNDO = PatternFill("solid", fgColor="1F3A5F")
CABECALHO_FONTE = Font(color="FFFFFF", bold=True)
TITULO = Font(bold=True, size=14)
FORTE = Font(bold=True)

VEREDITOS = {
    "cabível": PatternFill("solid", fgColor="D8EFD8"),
    "condicional": PatternFill("solid", fgColor="FDF2CC"),
    "incabível": PatternFill("solid", fgColor="F2F2F2"),
}


# ── o que entra em cada aba ─────────────────────────────────────────────────
# (cabeçalho, chave no JSON, numérico?). A ordem é a da leitura: quem é o tipo,
# quanto pega, e só depois as qualificações.
COLUNAS_TIPOS: list[tuple[str, str, bool]] = [
    ("id", "id", True),
    ("Diploma", "lei", False),
    ("Artigo", "artigo", False),
    ("Tipo penal", "crime", False),
    ("Espécie de pena", "tipo_pena", False),
    ("Pena mínima (meses)", "pena_min_meses", True),
    ("Pena máxima (meses)", "pena_max_meses", True),
    ("Moldura (como a lei escreve)", "pena_faixa_rotulo", False),
    ("Tem multa", "tem_multa", False),
    ("Regime da multa", "multa_regime", False),
    ("Hediondo", "hediondo", False),
    ("Espécie de hediondez", "hediondo_especie", False),
    ("Fundamento da hediondez", "hediondo_fundamento", False),
    ("Hediondez — condição do caso", "hediondo_condicao", False),
    ("Hediondez — divergência", "hediondo_nota", False),
    ("Ação penal", "acao", False),
    ("Ação penal — condição do caso", "acao_condicao", False),
    ("Elemento subjetivo", "elemento", False),
    ("Admite tentativa", "tentativa", False),
    ("Violência", "violencia", False),
    ("Grave ameaça", "grave_ameaca", False),
    ("Violência — condição do caso", "violencia_condicao", False),
    ("Contravenção", "contravencao", False),
    ("Menor potencial ofensivo", "infracao_menor_potencial", False),
    ("Resultado morte", "resultado_morte", False),
    ("Perdão judicial previsto", "perdao_judicial_previsto", False),
    ("Tem pena privativa", "tem_pena_privativa", False),
    ("Em vigor", "vigente", False),
    ("Dispositivo (chave canônica)", "dispositivo_canonico", False),
    ("Conferido em", "conferido_em", False),
    ("Fonte da conferência", "fonte", False),
    ("Observações", "obs", False),
    ("Endereço público", "__url", False),
]

COLUNAS_ATRIBUTOS: list[tuple[str, str, bool]] = [
    ("id", "id", True),
    ("Atributo", "nome", False),
    ("Identificador", "slug", False),
    ("Categoria", "categoria", False),
    ("Natureza", "natureza", False),
    ("Fundamento legal", "fundamento", False),
    ("Dispositivos", "__dispositivos", False),
    ("O que é", "descricao", False),
    ("Alcança tipo sem pena privativa", "alcanca_sem_pena_privativa", False),
    ("Última alteração legislativa", "ultima_alteracao", False),
    ("Parâmetros editáveis", "__parametros", False),
    ("Cabível em", "__n_cabivel", True),
    ("Condicional em", "__n_condicional", True),
    ("Incabível em", "__n_incabivel", True),
    ("Endereço público", "__url", False),
]


def _texto(valor) -> str:
    """O valor como o leitor o lê. `None` é vazio, e vazio não é zero."""
    if valor is None or valor == "":
        return ""
    if isinstance(valor, bool):
        return "Sim" if valor else "Não"
    if isinstance(valor, list):
        return "; ".join(_texto(v) for v in valor if v not in (None, ""))
    return ILLEGAL_CHARACTERS_RE.sub("", str(valor))


def _escrever(aba, linha: int, coluna: int, valor, numerico: bool) -> None:
    celula = aba.cell(row=linha, column=coluna)
    if numerico and isinstance(valor, (int, float)) and not isinstance(valor, bool):
        celula.value = valor
        celula.number_format = INTEIRO
    else:
        celula.value = _texto(valor)
        celula.number_format = TEXTO
        # Texto começado por `=` o openpyxl guarda como FÓRMULA, e o Excel a
        # executa ao abrir. Hoje nenhum campo do catálogo começa assim; um dia
        # um `obs` pode começar, e ninguém perceberia até a planilha exibir
        # #NOME? no lugar do dado. Forçar o tipo fecha a porta antes.
        celula.data_type = "s"
    celula.alignment = Alignment(vertical="top")


def _cabecalho(aba, rotulos: list[str]) -> None:
    for i, rotulo in enumerate(rotulos, start=1):
        c = aba.cell(row=1, column=i, value=rotulo)
        c.fill, c.font = CABECALHO_FUNDO, CABECALHO_FONTE
        c.alignment = Alignment(vertical="center", wrap_text=True)
    aba.row_dimensions[1].height = 30
    aba.freeze_panes = "A2"


def _largura(aba, larguras: list[int]) -> None:
    for i, largura in enumerate(larguras, start=1):
        aba.column_dimensions[get_column_letter(i)].width = largura


def _autofiltro(aba, linhas: int, colunas: int) -> None:
    aba.auto_filter.ref = f"A1:{get_column_letter(colunas)}{linhas}"


# ── as abas ─────────────────────────────────────────────────────────────────
def aba_leia_me(wb: Workbook, ctx: dict) -> None:
    aba = wb.create_sheet("Leia-me")
    aba.sheet_properties.tabColor = "1F3A5F"
    _largura(aba, [34, 96])

    def linha(rotulo: str, valor: str = "", forte: bool = False) -> None:
        i = aba.max_row + 1 if aba.max_row > 1 or aba["A1"].value else 1
        a = aba.cell(row=i, column=1, value=rotulo)
        a.font = FORTE if rotulo else Font()
        a.alignment = Alignment(vertical="top")
        b = aba.cell(row=i, column=2, value=valor)
        b.number_format = TEXTO
        b.alignment = Alignment(vertical="top", wrap_text=True)
        if forte:
            a.font = TITULO
            b.font = TITULO

    aba["A1"] = "AtlasPen — base de tipos e atributos penais"
    aba["A1"].font = TITULO
    linha("")
    linha("Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo.")
    linha("")

    linha("Versão", ctx["versao"])
    linha("Gerada em", ctx["hoje"])
    linha("Commit de origem", ctx["commit"])
    linha("Endereço", f"{SITE}/")
    linha("Repositório", "https://github.com/amorim-rc/atlaspen")
    linha("")

    linha("O QUE ESTÁ AQUI")
    linha("Tipos penais", f"{ctx['total_tipos']} registros, de {ctx['diplomas']} diplomas")
    linha("Atributos penais", f"{ctx['total_atributos']}")
    linha("Universo do alcance",
          f"{ctx['com_pena_privativa']} tipos com pena privativa. Os {ctx['sem_pena_privativa']} "
          "sem pena privativa ficam fora das estatísticas de alcance, como no site.")
    linha("")

    linha("AS ABAS")
    linha("Tipos penais", "Um registro por linha, com a moldura, as qualificações e a URL pública.")
    linha("Atributos", "Os institutos, com fundamento, parâmetros editáveis e o alcance de cada um.")
    linha("Matriz de alcance",
          "Tipo × atributo: cabível, condicional ou incabível, no cenário padrão — "
          "pena mínima cominada, réu primário, fato de hoje. Mudar a premissa muda o "
          "veredito, e é para isso que o site tem os controles.")
    linha("")

    linha("TRÊS COISAS QUE EVITAM ERRO DE LEITURA")
    linha("1. O id é endereço, não posição.",
          "É a URL pública de cada tipo e nunca é reatribuído a outro crime. A numeração "
          "foi REINICIADA DUAS VEZES, em 31/07 e em 06/08/2026: um id anotado antes "
          "dessas datas se refere a outro dispositivo. Confira pela URL, não pelo número.")
    linha("2. A pena canônica é em meses.",
          "As colunas de mínima e máxima estão em meses (o mês de 30 dias, art. 11 do CP). "
          "A coluna 'Moldura' repete a faixa na unidade em que a lei a escreveu, e serve "
          "para leitura — não para cálculo.")
    linha("3. Campo condicional não é campo vazio.",
          "Onde a lei não decide pelo tipo, o campo principal fica no valor seguro e a "
          "hipótese fica escrita ao lado, nas colunas de condição. Ler só o campo "
          "principal é ler metade. Nada aqui foi preenchido por plausibilidade: o que o "
          "catálogo não sabe, ele diz que não sabe.")
    linha("")

    linha("EM PESQUISA")
    linha("", "Os cálculos simplificam controvérsias doutrinárias e jurisprudenciais. "
              "NÃO CONSTITUEM ACONSELHAMENTO JURÍDICO.")
    linha("")

    linha("LICENÇA E ATRIBUIÇÃO")
    linha("", "MIT com exigência de atribuição. Use, copie, modifique e redistribua, "
              "inclusive comercialmente. Ao usar estes dados, dê crédito a "
              "\"AtlasPen, da Equipe AtlasPen\", indique a fonte e sinalize as "
              "alterações que fizer.")
    linha("Como citar",
          f"EQUIPE ATLASPEN. AtlasPen: Atlas Penal Brasileiro dos Tipos, Atributos e "
          f"Impacto Legislativo. Versão {ctx['versao']}. {ctx['hoje']}. "
          f"Disponível em: {SITE}/.")
    linha("")

    linha("ESTA PLANILHA É DERIVADA")
    linha("", "Gerada a cada publicação a partir dos dados abertos do projeto, sempre no "
              "mesmo endereço — a nova substitui a anterior. Não a edite esperando que a "
              "edição volte para a base: o caminho de correção é uma issue ou um pull "
              "request no repositório, contra o texto compilado do planalto.gov.br.")
    linha("Dados em JSON", f"{SITE}/data/crimes.json e {SITE}/data/atributos.json")


def aba_tipos(wb: Workbook, tipos: list[dict]) -> None:
    aba = wb.create_sheet("Tipos penais")
    _cabecalho(aba, [c[0] for c in COLUNAS_TIPOS])
    for i, t in enumerate(tipos, start=2):
        for j, (_, chave, numerico) in enumerate(COLUNAS_TIPOS, start=1):
            valor = f"{SITE}/tipos/{t['id']}" if chave == "__url" else t.get(chave)
            _escrever(aba, i, j, valor, numerico)
    _largura(aba, [7, 16, 26, 52, 16, 12, 12, 26, 10, 16, 10, 16, 30, 40, 34,
                   34, 40, 16, 10, 10, 12, 40, 12, 14, 12, 14, 14, 10, 28, 12,
                   14, 70, 42])
    _autofiltro(aba, len(tipos) + 1, len(COLUNAS_TIPOS))


def aba_atributos(wb: Workbook, atributos: list[dict], universo: int) -> None:
    aba = wb.create_sheet("Atributos")
    _cabecalho(aba, [c[0] for c in COLUNAS_ATRIBUTOS])
    for i, a in enumerate(atributos, start=2):
        cabivel = len(a["alcance"]["cabivel"])
        condicional = len(a["alcance"]["condicional"])
        derivados = {
            "__dispositivos": a.get("dispositivos"),
            "__parametros": "; ".join(
                f"{p['rotulo']}: {p.get('padrao')}" for p in a.get("parametros") or []),
            "__n_cabivel": cabivel,
            "__n_condicional": condicional,
            "__n_incabivel": universo - cabivel - condicional,
            "__url": f"{SITE}/atributos/{a['slug']}",
        }
        for j, (_, chave, numerico) in enumerate(COLUNAS_ATRIBUTOS, start=1):
            valor = derivados[chave] if chave.startswith("__") else a.get(chave)
            _escrever(aba, i, j, valor, numerico)
    _largura(aba, [6, 30, 22, 16, 14, 40, 40, 80, 14, 16, 60, 12, 14, 12, 42])
    _autofiltro(aba, len(atributos) + 1, len(COLUNAS_ATRIBUTOS))


def aba_matriz(wb: Workbook, tipos: list[dict], atributos: list[dict]) -> None:
    """Tipo × atributo, em formato largo: uma linha por tipo.

    Largo, e não longo: 1.496 linhas de 26 colunas cabem na tela e na cabeça;
    as 32.912 linhas do formato longo só servem a quem for montar uma tabela
    dinâmica — e essa pessoa tem o JSON.
    """
    aba = wb.create_sheet("Matriz de alcance")
    fixas = ["id", "Diploma", "Artigo", "Tipo penal"]
    _cabecalho(aba, fixas + [a["nome"] for a in atributos])

    indices = [({i: "cabível" for i in a["alcance"]["cabivel"]}
                | {i: "condicional" for i in a["alcance"]["condicional"]})
               for a in atributos]

    for i, t in enumerate(tipos, start=2):
        _escrever(aba, i, 1, t["id"], True)
        for j, chave in enumerate(("lei", "artigo", "crime"), start=2):
            _escrever(aba, i, j, t.get(chave), False)
        for j, indice in enumerate(indices, start=len(fixas) + 1):
            _escrever(aba, i, j, indice.get(t["id"], "incabível"), False)

    _largura(aba, [7, 16, 26, 52] + [18] * len(atributos))
    aba.freeze_panes = "E2"
    _autofiltro(aba, len(tipos) + 1, len(fixas) + len(atributos))

    # A cor faz a matriz ser lida de relance; o texto continua lá para quem
    # filtra, ordena ou exporta. Formatação condicional, e não cor fixa, para
    # que sobreviva a quem reordenar as linhas.
    faixa = (f"{get_column_letter(len(fixas) + 1)}2:"
             f"{get_column_letter(len(fixas) + len(atributos))}{len(tipos) + 1}")
    for veredito, fundo in VEREDITOS.items():
        aba.conditional_formatting.add(
            faixa, CellIsRule(operator="equal", formula=[f'"{veredito}"'], fill=fundo))


# ── o contexto da assinatura ────────────────────────────────────────────────
def _commit() -> str:
    try:
        r = subprocess.run(["git", "log", "-1", "--format=%h (%cs)"],
                           cwd=RAIZ, capture_output=True, text=True, timeout=30)
        return r.stdout.strip() or "não versionado"
    except (OSError, subprocess.SubprocessError):
        return "não versionado"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--saida", type=Path, default=SAIDA_PADRAO)
    args = ap.parse_args()

    def ler(*partes) -> dict | list:
        return json.loads((RAIZ.joinpath(*partes)).read_text(encoding="utf-8"))

    tipos = ler("static", "data", "crimes.json")
    atributos = ler("static", "data", "atributos.json")["atributos"]
    qualidade = ler("static", "data", "qualidade.json")
    versao = ler("package.json")["version"]

    # O universo do alcance é o dos tipos COM pena privativa — o mesmo do site e
    # do congelamento. Sem isso, "incabível" incluiria 33 tipos que nem sequer
    # entram na conta, e a planilha afirmaria mais do que a base afirma.
    com_pena = [t for t in tipos if t.get("tem_pena_privativa")]

    wb = Workbook()
    wb.remove(wb.active)
    aba_leia_me(wb, {
        "versao": f"v{versao}",
        "hoje": date.today().isoformat(),
        "commit": _commit(),
        "total_tipos": qualidade["total_tipos_penais"],
        "diplomas": len({t["lei"] for t in tipos}),
        "total_atributos": qualidade["total_atributos"],
        "com_pena_privativa": qualidade["com_pena_privativa"],
        "sem_pena_privativa": qualidade["sem_pena_privativa"],
    })
    aba_tipos(wb, tipos)
    aba_atributos(wb, atributos, len(com_pena))
    aba_matriz(wb, com_pena, atributos)

    args.saida.parent.mkdir(parents=True, exist_ok=True)
    wb.save(args.saida)
    tamanho = args.saida.stat().st_size
    print(f"escrito {args.saida} ({tamanho // 1024} KB)")
    print(f"  Tipos penais ....... {len(tipos)} linhas")
    print(f"  Atributos .......... {len(atributos)} linhas")
    print(f"  Matriz de alcance .. {len(com_pena)} × {len(atributos)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
