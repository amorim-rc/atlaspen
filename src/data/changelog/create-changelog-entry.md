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

   const entrada: ChangelogEntry = {
     id: '2027-03-02-progressao-nova-fracao',
     date: '2027-03-02',
     title: 'Título curto: a lei, e o que ela mudou',
     summary: 'Um parágrafo que resume a mudança para quem só lê o resumo.',
     body: [
       'Primeiro parágrafo de detalhe, texto puro.',
       'Segundo parágrafo. Cada string é um parágrafo, renderizado as-is.',
     ],
     tipo: 'pejus',
     areas: ['Atributos'],
     version: 'v1.1.0',
     links: [
       {label: 'Ver o atributo de progressão de regime', href: 'https://amorim-rc.github.io/sispenas/atributos/progressao'},
     ],
   };

   export default entrada;
   ```

3. **`body` é TEXTO PURO** — sem markdown, sem backticks, sem listas, sem tabelas.
   Um item do array = um parágrafo. Se precisar enumerar, escreva em prosa.

4. **`tipo`** (a natureza da mudança, um só, em termos penais; a interface
   mostra o rótulo em latim, em itálico):
   - `incriminadora` — *novatio legis incriminadora*: torna crime uma conduta que
     antes era atípica;
   - `pejus` — *novatio legis in pejus*: altera para pior;
   - `mellius` — *novatio legis in mellius*: altera para melhor;
   - `abolitio` — *abolitio criminis*: deixa de ser crime.

   A régua é a doutrinária (decisão de 18/09/2026). Forma qualificada, causa de
   aumento com moldura própria, ou tipo novo para conduta que já era punível é
   `pejus`, mesmo quando entra no catálogo como registro novo: o vicaricídio
   (CP, art. 121-B) é `pejus`, porque a conduta já era homicídio. Quando só parte
   da conduta era atípica, vale o núcleo, e a nota diz o que já era punível.
   O Proponente propõe pela régua mecânica (dispositivo novo = `incriminadora`);
   quem revisa confirma ou corrige.

   A natureza não decide a versão: a regra de versionamento está em
   `docs/dados-abertos.md` (Estabilidade e versionamento).

5. **`areas`** (uma ou mais): `Tipos penais`, `Atributos`, `Dosimetria`,
   `Acervo histórico`, `Interface`, `Documentação`. Grafia exata, com acento.
   Use `Documentação` para mudanças nas páginas de Documentação e na página
   inicial; `Interface` para a ferramenta de busca em si.

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
