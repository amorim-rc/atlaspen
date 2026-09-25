# -*- coding: utf-8 -*-
"""As tabelas CURADAS do catálogo: juízo humano, datado, que a heurística não sobrepõe.

Reúne o que a documentação pública chama de "tabelas explícitas do
`transform_data.py`" — `CORRECOES`, `CORRECOES_MORTE`, `PERDAO_JUDICIAL` — e as
demais constantes de decisão: o mapa de pena privativa, o padrão do que NÃO é
tipo penal, a regex do resultado morte, o vocabulário fechado de cada campo
categórico e os diplomas que só tipificam contravenções. Cada entrada carrega o
motivo ao lado, porque é o motivo, e não o valor, que quem revisa precisa ler.
Todas continuam acessíveis por `transform_data.<NOME>`.
"""
import re

PENA_PRIVATIVA_MAP = {
    "Reclusão": "Reclusão",
    "Detenção": "Detenção",
    "Prisão simples": "Prisão simples",
    "Multa": "Nenhuma",
    # Pena cominada que não é privativa de liberdade nem pecuniária (art. 28 da
    # Lei 11.343/06; art. 8º da Lei 7.437/85). Criado em 06/08/2026 para que o
    # campo vazio volte a significar apenas "não preenchido".
    "Outras penas": "Nenhuma",
    # A pena de morte do CPM em tempo de guerra (art. 56) não é privativa de
    # liberdade. A moldura em meses do registro é a graduação do art. 81, §2º.
    "Morte": "Nenhuma",
    "—": "Nenhuma",
    "": "Nenhuma",
    None: "Nenhuma",
}

# padrões negativos que NÃO indicam pena de multa criminal
NEG_MULTA = re.compile(r"sem multa|multa reparat|reparação do dano", re.IGNORECASE)

# Correções manuais (revisão do usuário). Sobrepõem a heurística e retiram o
# registro da lista de casos ambíguos.
CORRECOES = {
    # Art. 227 CP (caput): a multa só incide na hipótese do §3º (fim de lucro);
    # o tipo-base não comina multa.
    167: {"tem_multa": False, "multa_regime": "nenhuma"},
    888: {"tem_multa": False, "multa_regime": "nenhuma"},
    # Art. 310 do Código Eleitoral: "detenção até seis meses OU pagamento de 90 a
    # 120 dias-multa". A cominação é alternativa, mas a heurística lê "dias-multa"
    # antes de "ou" e conclui cumulativa. A diferença não é de rótulo: com multa
    # alternativa, a multa isolada basta para punir o fato.
    782: {"tem_multa": True, "multa_regime": "alternativa"},
    # Dois registros cujo `obs` EXPLICA que o artigo não comina multa. A palavra
    # está lá — a heurística só sabe procurá-la, não negá-la. Art. 338 do CP
    # ("reclusão, de um a quatro anos, sem prejuízo de nova expulsão") e art. 72
    # da Lei 9.504/97 ("puníveis com reclusão, de cinco a dez anos"): a multa que
    # os dois publicavam veio junto com o nome importado de outro artigo.
    740: {"tem_multa": False, "multa_regime": "nenhuma"},
    533: {"tem_multa": False, "multa_regime": "nenhuma"},
}

# ── O catálogo contém APENAS tipos penais ───────────────────────────────────
# Regra estrutural: cada registro é um tipo penal. Não entram notas de
# referência, agravantes, causas de aumento, excludentes de ilicitude nem regras
# de ação penal — todos foram removidos na v1.1.0. Com pena zero, eles
# satisfaziam qualquer teto de pena e eram contados como "cabíveis" em transação
# penal, ANPP e sursis.
#
# A regra é IMPOSTA aqui (e não apenas sinalizada) para que as atualizações
# automáticas da v2.0.0 não a violem: ver docs/catalogo-tipos-penais.md.
NAO_TIPIFICA = re.compile(r"REFER[ÊE]NCIA|EXCLUDENTE", re.IGNORECASE)

# ── Resultado morte (art. 112, VI e VIII, LEP; art. 122, §2º, LEP) ──────────
# Casa apenas contra o NOME do tipo, nunca contra `obs`: o campo obs costuma
# descrever a pena de OUTROS parágrafos do mesmo artigo ("se resulta morte,
# triplica"), o que produziria falsos positivos — p.ex. Art. 135 (omissão de
# socorro), Art. 267 (epidemia dolosa) e Art. 270 (envenenamento), cujos caputs
# não são qualificados pela morte.
RESULTADO_MORTE = re.compile(
    r"\bmortes?\b|latroc[íi]nio|homic[íi]dio|feminic[íi]dio|infantic[íi]dio|genoc[íi]dio",
    re.IGNORECASE,
)

# Exceções à regra acima, por id. Revisão manual.
CORRECOES_MORTE = {
    # Art. 158, §3º, CP: o dispositivo remete às penas do art. 159, §§2º e 3º,
    # cobrindo TANTO lesão grave QUANTO morte no mesmo registro. Não é possível
    # afirmar o resultado morte a partir deste registro — fica em revisão.
    # (mantido False; ver relatório de qualidade)
    #
    # Vicaricídio (art. 121-B, incluído pela Lei 15.384/2026): é homicídio, mas
    # o nomen juris não contém "homicídio" nem "morte", e a heurística deriva do
    # NOME. Sem estas linhas o crime deixaria de constar como resultado morte —
    # com efeito direto sobre livramento condicional e progressão.
    1308: True,
    1309: True,
    1310: True,
    1311: True,
}

# ── Perdão judicial (art. 107, IX, CP) ──────────────────────────────────────
# NÃO existe perdão judicial genérico: só incide onde a lei o prevê
# expressamente, e não se estende por analogia (daí a lista ser curada, e não
# inferida do elemento culposo). O perdão é atribuído ao CRIME que o admite,
# não apenas ao parágrafo que o institui: o perdão do art. 121, §5º alcança o
# homicídio culposo do §3º.
#
# `^CP$` é ancorado de propósito: `^CP` casaria também "CPM (DL 1.001/69)",
# atribuindo perdão judicial à ofensa aviltante a inferior (art. 176 do CPM).
# Cada regra é (regex da lei, regex do artigo, exige_culposo). `exige_culposo`
# filtra os dispositivos cujo perdão a lei restringe à modalidade culposa: o
# art. 121, §4º tem uma 1ª parte culposa e uma 2ª parte DOLOSA (aumento contra
# menor de 14), e só a primeira admite o perdão do §5º.
_CP = r"^CP( \(atualiz\.\))?$"
PERDAO_JUDICIAL = [
    (_CP, r"^Art\. 121, §[345]º", True),      # homicídio culposo (§3º/§4º) e o perdão (§5º)
    (_CP, r"^Art\. 129, §(5|6|7|11)º?", True),  # lesão corporal culposa e o perdão
    (_CP, r"^Art\. 180, §3º", True),          # receptação culposa (perdão no §5º)
    (_CP, r"^Art\. 168-A", False),            # apropriação indébita previdenciária (§3º)
    (_CP, r"^Art\. 337-A", False),            # sonegação de contribuição previdenciária (§2º)
    (_CP, r"^Art\. 242", False),              # parto suposto (par. único — motivo de nobreza)
    (_CP, r"^Art\. 249", False),              # subtração de incapazes (§2º)
    (_CP, r"^Art\. 140, caput", False),       # injúria simples (§1º: provocação reprovável / retorsão) — não alcança a injúria racial do §3º
    (_CP, r"^Art\. 176$", False),             # outras fraudes (par. único)
    (r"9\.807", r"^Art\. 13", False),         # proteção a vítimas e testemunhas — colaborador
    (r"12\.850", r"^Art\. 4º", False),        # colaboração premiada
]

# Hipóteses legais de perdão judicial AUSENTES do catálogo de tipos penais.
# Não são inventadas aqui: entram no relatório de qualidade como lacuna.
# Perdão judicial de base JURISPRUDENCIAL (não expresso em lei) — fica de fora da lista
# curada, que é só de hipóteses legais expressas, mas registrado como nota.
PERDAO_JUDICIAL_SEM_TIPO = [
    "CP, Art. 218-B, §2º, II — favorecimento da prostituição (cliente): hipótese sem tipo próprio no catálogo",
    "CTB, Art. 302/303 — homicídio/lesão culposa na direção: perdão admitido pelo STJ por ANALOGIA ao CP 121, §5º, não por previsão expressa; por isso não é marcado no campo",
]

# O vocabulário fechado de cada campo categórico. Grafia fora dele não é erro de
# forma: o site filtra por igualdade, e o id 730 (CP, art. 138, §1º), gravado
# "Privada" em vez de "Ação Penal Privada", sumia do filtro de ação privada.
VOCABULARIO = {
    # Fechado em 19/09/2026 (frente 6 do backlog): a espécie da ação penal, como a
    # lei a nomeia. "Pública Condicionada" sozinha não dizia se depende de
    # representação do ofendido ou de requisição do Ministro da Justiça, que são
    # institutos diferentes; "Privada" e "Ação Penal Privada" eram o mesmo valor
    # com dois rótulos, e a privada personalíssima (CP, art. 236, parágrafo único)
    # não tinha onde ser registrada.
    "acao": {"Pública Incondicionada", "Pública Condicionada à Representação",
             "Pública Condicionada à Requisição", "Ação Penal Privada",
             "Ação Penal Privada Personalíssima"},
    "tipo_pena": {"Reclusão", "Detenção", "Prisão simples", "Morte", "Impedimento",
                  "Multa", "Outras penas", "—"},
    # Régua escrita em 23/09/2026 (decisões 31, 31-D e 31-D2), e documentada no
    # AGENTS.md. "Preterdoloso" foi REDEFINIDO: vale quando a lei exclui o dolo
    # no resultado (CP 129, §3º; CPM 209, §3º-A) ou quando o resultado doloso
    # configura outro crime, tratado em concurso. "Qualificado pelo resultado" é
    # o valor novo: o tipo abriga resultado doloso OU culposo, num crime só
    # (latrocínio, STF Súmula 610; estupro com resultado, NUCCI, 22. ed., p.
    # 665-666). A diferença decide a tentativa (decisão 20): o preterdoloso não
    # a admite, o qualificado pelo resultado admite.
    "elemento": {"Doloso", "Culposo", "Preterdoloso", "Qualificado pelo resultado"},
    "hediondo": {"Sim", "Não"},
    "tentativa": {"Sim", "Não"},
    "violencia": {"Sim", "Não"},
    "grave_ameaca": {"Sim", "Não"},
}

# Diplomas que declaram contravenção tudo o que tipificam: a LCP, e a Lei
# 7.437/85 ("Constitui contravenção [...] a prática de atos resultantes de
# preconceito"), cujo art. 8º comina só a perda do cargo.
DIPLOMAS_DE_CONTRAVENCOES = {"lcp", "preconceitos-7437"}

OPERADORES_REMISSAO = {"nenhum", "aumento", "diminuicao"}
