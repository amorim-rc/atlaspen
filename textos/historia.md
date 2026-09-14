---
titulo: De um catálogo de 2008 a uma base mantida
genero: história
data: '2026-09-13'
assinatura: Equipe AtlasPen
resumo: Da pesquisa de Maíra Rocha Machado e Marta Rodriguez de Assis Machado, publicada em 2008, à retomada digital de 2026 e ao lançamento do AtlasPen.
---

## A pesquisa de 2008

Em 2008, a *Revista Jurídica* (Brasília, v. 10, n. 90, edição especial de abril e maio)
publicou o relatório final de uma pesquisa que as próprias autoras chamaram de atípica: o
produto dela não era um texto, era um software. Coordenada por Maíra Rocha Machado e Marta
Rodriguez de Assis Machado, professoras da Direito GV, com Fabio Andrade, Priscilla Soares
de Oliveira e Yuri Luz na equipe, a pesquisa respondia a um edital da Secretaria de
Assuntos Legislativos do Ministério da Justiça. Dela saiu o SISPENAS — Sistema de Consulta
sobre Crimes, Penas e Alternativas à Prisão.

O diagnóstico era de acesso. A legislação penal brasileira tinha ficado complexa a ponto de
ninguém enxergar o conjunto: de um lado, as penas cominadas a cada conduta; de outro, as
regras que substituem, suspendem ou abreviam a prisão. Os dois conjuntos mudavam ao mesmo
tempo, sem que se medisse o efeito de um sobre o outro. O exemplo do artigo é a Lei
11.313/2006, que mudou a definição de infração de menor potencial ofensivo sem que se
pudesse ver, à época, quais crimes passavam a ser alcançados.

O SISPENAS cruzava as duas coisas nos dois sentidos — do crime para as alternativas
cabíveis, e de cada alternativa para os crimes que ela alcança — e permitia simular
propostas de alteração legislativa. O catálogo reunia 1.529 tipos, do Código Penal e de
trinta e sete leis penais especiais. O sistema foi feito em PHP e PostgreSQL, sobre
servidor Apache, e ao fim do projeto a equipe entregou o código-fonte à Secretaria de
Assuntos Legislativos. A [íntegra do artigo](/artigos/machado-machado-2008-sispenas-rev-juridica-90.pdf)
está publicada junto com esta base.

## A retomada

A retomada começou em junho de 2026, a partir do artigo lido como especificação: os
objetivos, o modelo de dados e a metodologia estão lá. A intuição central ficou — catalogar
os tipos penais, cruzá-los com as consequências que a lei liga a cada patamar de pena e
simular o que muda quando a lei muda. Quase todo o resto foi refeito.

O sistema virou um site estático sobre dados abertos em JSON, versionado em Git, sem
servidor nem banco. A carga inicial veio de planilha. As alternativas de 2008 foram
atualizadas à lei vigente, com o que surgiu depois — o acordo de não persecução penal, de
2019, é o exemplo maior —, e passaram a se chamar atributos penais.

A primeira versão foi publicada em 13 de julho de 2026. Em julho e agosto vieram dezenas de
versões, e com elas a regra que hoje sustenta a base: nada entra no catálogo sem
conferência contra o texto compilado oficial do Planalto. A conferência virou rotina
semanal, feita por programas determinísticos, sem inteligência artificial, que leem a lei,
extraem a moldura da pena, comparam com o catálogo e abrem para decisão humana o que
diverge. Os registros que ela mostrou revogados saíram do catálogo vigente e deram origem
ao acervo histórico, que a proposta de 2008 não tinha.

Em 6 de agosto de 2026, uma revisão aplicou sobre o catálogo inteiro a planilha de
conferência: nove registros saíram, noventa e seis entraram, e a numeração dos tipos foi
reiniciada — pela segunda vez, depois da de 31 de julho.

## O recomeço da numeração

Em 10 de setembro de 2026, a equipe decidiu que nenhuma daquelas versões tinha sido um
lançamento. No dia seguinte o projeto voltou à versão 0.0.0: as notas de atualização
publicadas até ali foram expurgadas, e as releases antigas, apagadas. Ficou decidido também
o que é o lançamento: uma versão enxuta, com todos os tipos penais, os 22 atributos penais
já existentes e só normas vigentes. O que for difícil — a prescrição completa, o recuo
histórico — vira módulo depois, com plano, financiamento e pessoas próprias.

Em 12 de setembro, os 22 atributos saíram do código e passaram a ser dados, cada um com o
histórico legislativo dos dispositivos em que se apoia.

## AtlasPen

O nome também mudou. SISPENAS homenageava a pesquisa de origem e continua a identificá-la; a
base que a retoma passa a se chamar AtlasPen — Atlas Penal Brasileiro dos Tipos, Atributos e
Impacto Legislativo —, e o site foi reconstruído junto com o nome. A linhagem fica explícita
aqui e na [forma de citar](/projeto/dados-abertos#como-citar).

## O lançamento

O lançamento oficial é a versão 1.0.0, com domínio próprio. Até lá, o repositório passa a
uma organização, com três pessoas de início, e o projeto, a um grupo de trabalho e
pesquisa. A partir da 1.0.0, cada alteração que crie, modifique ou extinga um tipo penal ou
um atributo penal ganha [nota própria](/notas).

## O que ficou de 2008, e o que mudou

| Em 2008 | Hoje |
|---|---|
| Software com servidor e banco de dados, entregue ao Ministério da Justiça | Site estático sobre dados abertos, com código e dados públicos |
| Cadastro manual por alimentadores, com fluxo de aprovação | Conferência semanal contra o texto compilado; criar, remover e reclassificar continua humano |
| As alternativas à prisão vigentes em 2008 | Os 22 atributos penais, à lei vigente |
| Simulações gravadas no banco | Simulação na tela, sem nada gravado |
| — | O acervo histórico do que saiu de vigência |
