#!/usr/bin/env node
/* =============================================================================
   redeskript.mjs · Redeskript aus den Sprechtexten der Präsentation erzeugen
   -----------------------------------------------------------------------------
   Liest index.html in Chromium (Playwright), nimmt je Hauptfolie Titel, Sollzeit
   und die Absätze aus <aside class="notizen"> mit data-schritt oder
   class="gesprochen". Text in „…“ ist gesprochen, alles andere Regie.
   Absätze, die mit „Rückfragen“ beginnen, sammelt der Anhang.
   Ergebnis: export/redeskript.html und export/redeskript.pdf (A4).

   AUFRUF (im Ordner praesentation/):
     PLAYWRIGHT_CORE=/pfad/zu/playwright CHROME_PFAD=/pfad/zu/chrome \
     node werkzeuge/redeskript.mjs
   ============================================================================= */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const ordner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ziel = path.join(ordner, 'export');

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROME_PFAD || undefined, args: ['--no-sandbox'] });
const seite = await browser.newPage();
await seite.goto(pathToFileURL(path.join(ordner, 'index.html')).href + '?druck', { waitUntil: 'load' });

const folien = await seite.evaluate(() => [...document.querySelectorAll('section.folie')]
  .filter((f) => !f.hasAttribute('data-backup'))
  .map((f) => {
    const titel = (f.querySelector('.titel') || {}).textContent || f.getAttribute('data-titel') || '';
    const absaetze = [...f.querySelectorAll(':scope > aside.notizen > p')].map((p) => ({
      schritt: p.hasAttribute('data-schritt') ? Number(p.getAttribute('data-schritt')) : null,
      gesprochen: p.classList.contains('gesprochen'),
      text: p.textContent.replace(/\s+/g, ' ').trim()
    }));
    return { id: f.id, titel: titel.replace(/\s+/g, ' ').trim(), zeit: Number(f.getAttribute('data-zeit')) || 0, absaetze };
  }));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

/* Text in „…“ (äußerste Ebene) ist gesprochen, der Rest Regie; die äußeren Anführungszeichen fallen weg */
function teile(text) {
  const out = [];
  let tiefe = 0, puffer = '';
  const weg = (art) => { if (puffer.trim()) out.push({ art, text: puffer.trim() }); puffer = ''; };
  for (const z of text) {
    if (z === '„') { if (tiefe === 0) weg('regie'); else puffer += z; tiefe++; }
    else if (z === '“' && tiefe > 0) { tiefe--; if (tiefe === 0) weg('rede'); else puffer += z; }
    else puffer += z;
  }
  weg(tiefe > 0 ? 'rede' : 'regie');
  return out;
}

let uhr = 0;
const rueckfragen = [];
const bloecke = folien.map((f, i) => {
  const start = uhr; uhr += f.zeit;
  const teileHtml = [];
  f.absaetze.forEach((a) => {
    if (/^(Mögliche )?Rückfragen/.test(a.text)) { rueckfragen.push({ nr: i + 1, titel: f.titel, text: a.text.replace(/^(Mögliche )?Rückfragen:?\s*/, '') }); return; }
    if (a.schritt === null && !a.gesprochen) return;
    if (a.schritt > 0) teileHtml.push('<p class="klick">Klick</p>');
    teileHtml.push(teile(a.text).map((t) => `<p class="${t.art}">${esc(t.text)}</p>`).join(''));
  });
  return `<section><h2><span class="nr">${String(i + 1).padStart(2, '0')}</span> ${esc(f.titel)}<span class="zeit">${mmss(start)} bis ${mmss(uhr)}</span></h2>${teileHtml.join('')}</section>`;
});

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Redeskript · KI-Compliance im KMU</title>
<style>
  @font-face { font-family: "Fraunces R"; src: url("../schriften/fraunces-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: "Inter R"; src: url("../schriften/inter-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: "Inter R"; src: url("../schriften/inter-latin-opsz-italic.woff2") format("woff2"); font-weight: 100 900; font-style: italic; }
  :root { --text: #1d1d1b; --leise: #6b6b66; --akzent: #0b4f6c; --linie: #d8d4cb; --papier: #fff; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --text: #ecebe6; --leise: #a5a49e; --akzent: #7cc3e0; --linie: #3d3d3a; --papier: #161618; } }
  :root[data-theme="dark"] { --text: #ecebe6; --leise: #a5a49e; --akzent: #7cc3e0; --linie: #3d3d3a; --papier: #161618; }
  body { margin: 0; background: var(--papier); color: var(--text); font: 11pt/1.5 "Inter R", system-ui, sans-serif; }
  main { max-width: 170mm; margin: 0 auto; padding: 24px 16px; }
  h1, h2 { font-family: "Fraunces R", Georgia, serif; font-weight: 380; margin: 0; }
  h1 { font-size: 24pt; }
  .unter { color: var(--leise); margin: 4px 0 14px; }
  section { border-top: 1px solid var(--linie); padding: 10px 0 6px; break-inside: avoid-page; }
  h2 { font-size: 14pt; display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px; break-after: avoid; }
  .nr { color: var(--akzent); font-variant-numeric: tabular-nums; }
  .zeit { margin-left: auto; font: 9pt "Inter R", sans-serif; color: var(--leise); font-variant-numeric: tabular-nums; }
  p { margin: 0 0 6px; }
  .regie { font-style: italic; color: var(--leise); font-size: 10pt; }
  .klick { font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--akzent); margin: 8px 0 3px; }
  .klick::before { content: "▸ "; }
  .anhang p { font-size: 10pt; }
  .anhang b { color: var(--akzent); }
  @page { size: A4; margin: 15mm 18mm 14mm 18mm; }
  @media print { :root { --text: #1d1d1b; --leise: #6b6b66; --akzent: #0b4f6c; --linie: #d8d4cb; --papier: #fff; } main { padding: 0; max-width: none; } }
</style></head><body><main>
<h1>Redeskript: Welches Risiko hat Ihre KI?</h1>
<p class="unter">Elias Knauber und Yannick Heisler · Montag, 9. November 2026 · Rechtsstand 31.10.2026 · ${folien.length} Folien, Sollzeit ${mmss(uhr)} Min. · Normal gesetzt: sprechen. Kursiv: Regie. „Klick“: nächster Schritt.</p>
${bloecke.join('\n')}
<section class="anhang"><h2>Mögliche Rückfragen</h2>
${rueckfragen.map((r) => `<p><b>Folie ${String(r.nr).padStart(2, '0')}:</b> ${esc(r.text)}</p>`).join('\n')}
</section>
</main></body></html>`;

fs.mkdirSync(ziel, { recursive: true });
fs.writeFileSync(path.join(ziel, 'redeskript.html'), html);
const druck = await browser.newPage();
await druck.goto(pathToFileURL(path.join(ziel, 'redeskript.html')).href);
await druck.evaluate(() => document.fonts.ready);
await druck.emulateMedia({ media: 'print', colorScheme: 'light' });
const klein = 'font: 7px Arial, sans-serif; color: #6b6b66; width: 100%; padding: 0 18mm;';
await druck.pdf({
  path: path.join(ziel, 'redeskript.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="${klein}">Redeskript · KI-Compliance im KMU · Elias Knauber, Yannick Heisler</div>`,
  footerTemplate: `<div style="${klein} text-align: right;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>`
});
await browser.close();
console.log(`redeskript.html und redeskript.pdf erzeugt: ${folien.length} Folien, Sollzeit ${mmss(uhr)}, ${rueckfragen.length} Rückfragen`);
