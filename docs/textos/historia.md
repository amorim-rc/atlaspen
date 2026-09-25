---
titulo: História do projeto
genero: história
data: '2026-09-25'
assinatura: Equipe AtlasPen
resumo: Da pesquisa de Maíra Rocha Machado e Marta Rodriguez de Assis Machado, publicada em 2008, à retomada de 2026 e ao lançamento do AtlasPen.
---

## Uma pergunta sem resposta

Quantos tipos penais existem no Brasil?

A pergunta parece de almanaque, mas ninguém sabe respondê-la com segurança. O Código Penal é
um pedaço; o resto está espalhado por dezenas de leis especiais que se sobrepõem, se remetem
umas às outras e mudam a cada legislatura. E cada tipo carrega consigo um conjunto de
consequências que a lei liga a ele: a pena, o regime, o que pode e o que não pode substituir a
prisão, se é hediondo, se prescreve, quem pode processar — e esse conjunto também muda, muitas
vezes sem que ninguém meça o efeito sobre o resto.

Quem precisa enxergar o todo — quem legisla, quem defende, quem julga, quem pesquisa — enxerga
por partes. O AtlasPen existe para tentar juntar as partes numa base só, aberta, conferível e
mantida.

Não fomos os primeiros a tentar.

## A pesquisa de 2008

Em 2008, a *Revista Jurídica* (Brasília, v. 10, n. 90, edição especial de abril e maio)
publicou o relatório final de uma pesquisa que as próprias autoras chamaram de atípica: o
produto não era um texto, era um software. Coordenada por Maíra Rocha Machado e Marta
Rodriguez de Assis Machado, professoras da Direito GV, com Fabio Andrade, Priscilla Soares de
Oliveira e Yuri Luz na equipe, a pesquisa respondia a um edital da Secretaria de Assuntos
Legislativos do Ministério da Justiça. Dela saiu o SISPENAS — Sistema de Consulta sobre
Crimes, Penas e Alternativas à Prisão.

O diagnóstico era de acesso. A legislação penal tinha ficado complexa a ponto de ninguém
enxergar o conjunto: de um lado, as penas cominadas a cada conduta; de outro, as regras que
substituem, suspendem ou abreviam a prisão. Os dois lados mudavam ao mesmo tempo, sem que se
medisse o efeito de um sobre o outro. O exemplo do artigo é a Lei 11.313/2006, que redefiniu a
infração de menor potencial ofensivo sem que se pudesse ver, à época, quais crimes passavam a
ser alcançados.

O SISPENAS cruzava os dois lados nos dois sentidos — do crime para as alternativas cabíveis, e
de cada alternativa para os crimes que ela alcança — e permitia simular propostas de alteração
legislativa. O catálogo reunia 1.529 tipos, do Código Penal e de trinta e sete leis penais
especiais. O sistema foi feito em PHP e PostgreSQL, sobre servidor Apache, e ao fim do projeto
a equipe entregou o código-fonte à Secretaria de Assuntos Legislativos. A
[íntegra do artigo](../artigos/machado-machado-2008-sispenas-rev-juridica-90.pdf) está
publicada junto com esta base.

[**A confirmar:** o que destino do SISPENAS depois de 2008.]

## O AtlasPen

A retomada começou em junho de 2026, e começou por uma planilha.

A ideia inicial era modesta: listar todos os tipos penais brasileiros em vigor, um por linha,
com a moldura da pena ao lado. Foi na busca por um número de referência — quantos são, afinal,
os tipos penais do Brasil? — que encontramos o artigo de 2008, e com ele a constatação de que a
pergunta já tinha sido feita, e bem respondida, dezoito anos antes. A planilha ganhou colunas;
as colunas viraram um modelo de dados; o modelo virou código. O nome de trabalho era
*algo-pen*, e o primeiro registro do repositório público é de 22 de junho de 2026.

Três decisões tomadas cedo definiram o projeto:

**Tudo aberto, desde o primeiro dia.** Código, dados e critérios de classificação vivem no
mesmo repositório público, com histórico de cada alteração. Qualquer pessoa pode conferir e
auditar a base, a qualquer tempo — e qualquer pessoa pode contribuir com ela.

**Descrever, não avaliar.** O catálogo registra o que a lei liga a cada tipo — os atributos, da
pena cominada à hediondez, da ação penal cabível à possibilidade de fiança — sem nunca dizer se
isso é bom ou ruim. É por isso que falamos em *atributos*, e não em *benefícios*: a escolha
está explicada no [Manifesto pelo termo "atributo"](manifesto-atributo).

**Máquinas conferem e pessoas decidem.** Boa parte do trabalho de manter uma base assim é
braçal: reler o texto compilado da lei, comparar com o que está registrado, achar o que mudou.
Delegamos isso a programas, [os robôs](os-robos), que rodam periodicamente contra o texto
compilado do Planalto e apontam divergências. Mas um achado não altera o catálogo por si: a
decisão é sempre de um integrante do grupo, e fica registrada com data e fundamento.

Em junho, Maíra Rocha Machado, coordenadora da pesquisa de 2008, passou a colaborar com o
projeto; em agosto, Luisa Moraes Abreu Ferreira trouxe documentos de pesquisa que orientaram
decisões de modelo e de método. Com elas, o AtlasPen deixou de ser um exercício de organização
de dados e virou um grupo de pesquisa. As contribuições, inclusive as pontuais, estão em
[Autoria e créditos](creditos).

## Por que "atlas"

Um atlas não julga o território: mapeia-o. Mostra o que está onde, em que escala, com que
fronteiras, e deixa a quem lê decidir o que fazer com isso. Foi esse o compromisso que o nome
quis carregar. O AtlasPen é um mapa da legislação penal brasileira tal como ela está — não
como gostaríamos que fosse.

## O que ainda falta

Muito. A [Completude do catálogo](completude) mostra, diploma a diploma, quanto já foi
conferido dispositivo a dispositivo e quanto ainda espera. E mesmo do que já foi conferido pode
ter escapado algo: a
