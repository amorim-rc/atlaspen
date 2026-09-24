# Como criar uma entrada do changelog

> **Desde 14/09/2026 as entradas valem também em `0.0.x`**: o feed registra as
> alterações de lei antes do lançamento, e o PR que traz a entrada sobe o patch da
> versão. O feed publica **exclusivamente** alterações de lei que criem, modifiquem ou
> extingam tipos penais ou atributos penais; correção de dado do catálogo não vira nota.

As Notas de atualizações (`/notas`) são um **feed de mudanças**: cada
alteração é uma entrada própria. Não há lista central — **adicionar uma nota é
criar um arquivo**. O feed no site e o corpo da Release no GitHub leem os mesmos
arquivos.

## Regras (valem também para uma IA gerar o arquivo)

1. **Um arquivo por mudança.** Local:
   `src/data/changelog/entries/<ano>/<id>.ts`, onde
   `<id> = AAAA-MM-DD-<slug>` (ex.: `2027-03-02-progressao-nova-fracao`).
   O `<slug>` é curto, em minúsculas, sem acentos, palavras separadas por hífen.
   O nome do arquivo (sem `.ts`) **é** o `id`.

2. **O arquivo faz `export default` de um objeto `ChangelogEntry`** (contrato em
   `../../types.ts`). Modelo:

   ```ts
   import type {ChangelogEntry} from '../../types';
   import {urlPublica} from '../../../../site/config.ts';

   const entrada: ChangelogEntry = {
     id: '2027-03-02-progressao-nova-fracao',
     date: '2027-03-02',
     title: 'Título curto: a lei, e o que ela mudou',
     summary: 'Um parágrafo que resume a mudança para quem só lê o resumo.',
     body: [
       'Primeiro parágrafo de detalhe, texto puro.',
       'Segundo parágrafo. Cada string é um parágrafo, renderizado as-is.',
     ],
     alcance: ['atributo'],
     version: 'v1.1.0',
     links: [
       {label: 'Ver o atributo de progressão de regime', href: urlPublica('/atributos/progressao')},
     ],
   };

   export default entrada;
   ```

3. **`body` é TEXTO PURO** — sem markdown, sem backticks, sem listas, sem tabelas.
   Um item do array = um parágrafo. Se precisar enumerar, escreva em prosa.

4. **`alcance`** (uma ou duas): `tipo` quando a lei mexeu em tipo penal,
   `atributo` quando mexeu em atributo penal. Os dois quando mexeu nos dois.

   **Simplificado em 24/09/2026.** Antes eram duas classificações: uma
   "natureza" em latim (*incriminadora*, *in pejus*, *in mellius*, *abolitio*,
   *abolitio parcial*) e seis "áreas". As duas custavam caro a quem escreve a
   nota — a régua que separava *abolitio* parcial de *in mellius* precisou de um
   parágrafo de doutrina para ficar de pé — e entregavam pouco ao leitor.

   **A direção da mudança continua no feed**, dita em português no `summary` e
   no `body`: se a lei ficou mais severa ou mais branda, se a conduta deixou de
   ser crime, se retroage. Ali cabe a ressalva que um rótulo nunca comporta — e
   é ali que o leitor a procura.

   A distinção em latim sobrevive onde é ferramenta, e não rótulo: na simulação
   legislativa (`src/lib/simulacao/tipos.ts`), para etiquetar a direção de uma
   hipótese. Lá ela é o resultado, não a etiqueta.

5. **`date`** decide o período. O feed filtra por semestre, derivado da data —
   não há campo a preencher.

6. **`version`** é a versão que a mudança fecha (ex.: `v1.2.1`). Opcional só para
   algo fora de uma release.

7. **`links`** (opcional): o local exato onde a mudança aparece. É o que abre na
   seção de detalhes. Prefira URLs absolutas do site publicado.

## O que NÃO fazer

- Não editar uma lista central (não existe).
- Não reaproveitar um `id`/arquivo: `id` compõe a âncora e deve ser único.
- Não pôr markdown em `summary` nem em `body`.

## Como é consumido

- **Frontend**: `src/data/changelog/index.ts` agrega tudo por `import.meta.glob` e
  ordena por data (mais recentes primeiro); `/notas` lê esse array no build.
- **CI / Release**: `scripts/montar-nota-release.mjs vX.Y.Z` concatena as entradas
  daquela versão para formar o corpo da Release no GitHub.
- **Paridade**: `scripts/gerar-changelog-json.mjs` emite `static/data/changelog.json`
  (o mesmo array), para que um backend futuro produza exatamente o mesmo formato.
