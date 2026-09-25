# -*- coding: utf-8 -*-
"""O download só ocupa o caminho canônico depois de passar pela sentinela.

Até 25/09/2026 `baixar_fonte` gravava a página direto em `<data>.html` e anotava
`sentinela_ok` só no `meta.json`, que nenhum consumidor lê: o Vigia, os auditores
e o histórico varrem os `.html` por `glob`. Um snapshot truncado ou servido de
cache velho tomava o lugar do bom, e a rodada seguinte comparava o catálogo com
ele — em silêncio, que é o modo de falhar que mais dói aqui.
"""
from datetime import date

from nucleo import baixar

FONTE = {"id": "cp", "url": "https://exemplo.test/cp", "sentinela": "Lei nº 15.517, de 2026",
         "rotulos": ["CP"]}


def _com_pagina(monkeypatch, html: str):
    monkeypatch.setattr(baixar, "buscar", lambda url: html.encode("utf-8"))
    monkeypatch.setattr(baixar, "hoje", lambda: date(2026, 9, 25))


def test_sentinela_presente_promove_ao_caminho_canonico(tmp_path, monkeypatch):
    _com_pagina(monkeypatch, "<html>Art. 1º … (Redação dada pela Lei nº 15.517, de 2026)</html>")
    meta = baixar.baixar_fonte(FONTE, tmp_path)
    assert meta["sentinela_ok"] is True
    assert (tmp_path / "cp" / "2026-09-25.html").exists()
    assert not (tmp_path / "cp" / "2026-09-25.html.part").exists()
    assert meta["arquivo"] == "2026-09-25.html"


def test_sentinela_ausente_nao_ocupa_o_caminho_canonico(tmp_path, monkeypatch):
    """A página velha fica em `.part`, fora do `glob("*.html")` dos consumidores."""
    _com_pagina(monkeypatch, "<html>Art. 1º … (Redação dada pela Lei nº 13.964, de 2019)</html>")
    meta = baixar.baixar_fonte(FONTE, tmp_path)
    assert meta["sentinela_ok"] is False
    assert not (tmp_path / "cp" / "2026-09-25.html").exists()
    assert (tmp_path / "cp" / "2026-09-25.html.part").exists()
    assert meta["arquivo"] == "2026-09-25.html.part"
    assert sorted(p.name for p in (tmp_path / "cp").glob("*.html")) == []


def test_snapshot_bom_anterior_sobrevive_ao_download_ruim(tmp_path, monkeypatch):
    """O que os consumidores veem depois de um download reprovado é o último
    snapshot que PASSOU — e o Vigia avisa a idade dele no relatório."""
    (tmp_path / "cp").mkdir()
    (tmp_path / "cp" / "2026-09-18.html").write_text("bom", encoding="utf-8")
    _com_pagina(monkeypatch, "<html>página truncada</html>")
    baixar.baixar_fonte(FONTE, tmp_path)
    assert [p.name for p in sorted((tmp_path / "cp").glob("*.html"))] == ["2026-09-18.html"]


def test_sem_sentinela_declarada_promove(tmp_path, monkeypatch):
    """Fonte sem sentinela não tem o que conferir: passa, como antes."""
    _com_pagina(monkeypatch, "<html>qualquer coisa</html>")
    meta = baixar.baixar_fonte({**FONTE, "sentinela": ""}, tmp_path)
    assert meta["sentinela_ok"] is True
    assert (tmp_path / "cp" / "2026-09-25.html").exists()
