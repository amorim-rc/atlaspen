// Gera as imagens raster da marca: o social card (1200×630) e o
// apple-touch-icon (180×180), em static/img/.
//
// As peças são desenhadas em HTML, com as mesmas fontes auto-hospedadas do site
// (@fontsource), e fotografadas por um navegador headless — Edge ou Chrome, o
// que houver. Os PNGs são commitados: a CI não tem navegador, e as imagens só
// mudam quando a marca muda. Rodar de novo sobre a mesma marca dá o mesmo
// desenho.
//
// Uso, a partir da raiz:  node scripts/marca/gerar.mjs
// Navegador em outro lugar: NAVEGADOR=/caminho/do/chrome node scripts/marca/gerar.mjs

import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = join(RAIZ, 'static', 'img');

// Chrome antes do Edge: no Windows, o executável do Edge entrega a captura a
// outro processo e devolve o controle antes de gravar o arquivo.
const CANDIDATOS = [
  process.env.NAVEGADOR,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const navegador = CANDIDATOS.find((c) => existsSync(c));
if (!navegador) {
  console.error('Nenhum navegador headless encontrado. Defina NAVEGADOR=/caminho/do/chrome.');
  process.exit(2);
}

function fonte(pacote, arquivo) {
  const caminho = join(RAIZ, 'node_modules', '@fontsource', pacote, 'files', arquivo);
  if (!existsSync(caminho)) throw new Error(`fonte ausente: ${caminho} (rode npm ci)`);
  return pathToFileURL(caminho).href;
}

const FONTES = `
  @font-face { font-family: 'Newsreader'; font-weight: 500; font-style: normal;
    src: url('${fonte('newsreader', 'newsreader-latin-500-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 400; font-style: normal;
    src: url('${fonte('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}') format('woff2'); }
`;

// Os traços do símbolo: prancha e cota (design_handoff_atlaspen/10).
const SIMBOLO = (cor, traco) =>
  `<svg viewBox="0 0 32 32" fill="none" stroke="${cor}" stroke-width="${traco}" stroke-linecap="square">` +
  '<rect x="4" y="4" width="24" height="24"/><path d="M10 11v10M22 11v10M10 16h12"/></svg>';

// Social card: papel de fundo, símbolo e assinatura à esquerda, título por
// extenso abaixo em mono versalete, régua em acento no pé. Sem captura de tela:
// o card é lido em miniatura.
const CARTAO = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTES}
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #faf7f0; }
  .cartao { position: relative; width: 1200px; height: 630px; box-sizing: border-box;
    padding: 0 104px 20px; display: flex; flex-direction: column; justify-content: center; gap: 40px; }
  .marca { display: flex; align-items: center; gap: 34px; }
  .marca svg { width: 118px; height: 118px; flex: none; }
  .palavra { font-family: 'Newsreader'; font-weight: 500; font-size: 140px; line-height: 1;
    letter-spacing: 0.005em; color: #211f1b; }
  .palavra span { color: #8c2f22; }
  .titulo { font-family: 'IBM Plex Mono'; font-size: 23px; line-height: 1.75; letter-spacing: 0.22em;
    text-transform: uppercase; color: #5c574c; max-width: 980px; }
  .regua { position: absolute; left: 0; right: 0; bottom: 0; height: 16px; background: #8c2f22; }
</style></head><body><div class="cartao">
  <div class="marca">${SIMBOLO('#8c2f22', 2.2)}<span class="palavra">Atlas<span>Pen</span></span></div>
  <div class="titulo">Atlas Penal Brasileiro dos Tipos, Atributos e Impacto Legislativo</div>
  <div class="regua"></div>
</div></body></html>`;

// apple-touch-icon: o símbolo em tinta sobre papel (design_handoff_rodada2/06).
const ICONE = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 180px; height: 180px; overflow: hidden; background: #faf7f0; }
  body { display: grid; place-items: center; }
  svg { width: 132px; height: 132px; }
</style></head><body>${SIMBOLO('#211f1b', 2.4)}</body></html>`;

const trabalho = mkdtempSync(join(tmpdir(), 'atlaspen-marca-'));
const perfil = join(trabalho, 'perfil');

function fotografar(html, largura, altura, destino) {
  const pagina = join(trabalho, `${destino}.html`);
  writeFileSync(pagina, html, 'utf-8');
  const saida = join(SAIDA, destino);
  execFileSync(navegador, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${perfil}`,
    '--force-device-scale-factor=1',
    '--virtual-time-budget=3000',
    `--window-size=${largura},${altura}`,
    `--screenshot=${saida}`,
    pathToFileURL(pagina).href,
  ], {stdio: 'pipe'});
  if (!existsSync(saida)) throw new Error(`o navegador não gravou ${saida}`);
  console.log(`${destino} (${largura}×${altura})`);
}

try {
  fotografar(CARTAO, 1200, 630, 'atlaspen-social-card.png');
  fotografar(ICONE, 180, 180, 'apple-touch-icon.png');
} finally {
  rmSync(trabalho, {recursive: true, force: true});
}
