#!/usr/bin/env node
/* =============================================================================
   redeskript.mjs · Redeskript „SEO-Fallstudie unter der Lupe“ (frei gesprochen)
   -----------------------------------------------------------------------------
   Schlichte Leseversion zum Üben und Mitnehmen (Vorbild: fuehrung/praesentation/
   werkzeuge/redeskript.mjs). Liest index.html in Chromium (Playwright) und nimmt
   je Hauptfolie Titel, Sollzeit (data-zeit) und die Sprechtext-Absätze aus
   <aside class="notizen">. Den Wortlaut ersetzt die frei gesprochene Fassung
   aus werkzeuge/skript-frei.json (Schlüssel „f07/0“, „f04/g“; anderer Text mit
   REDESKRIPT_TEXTE=<datei>). Kürzungssätze dieser Fassung stehen grau in
   eckigen Klammern. Anhang: Beispielantworten für die Diskussion
   (werkzeuge/diskussion.json) und Rückfragen (werkzeuge/skript-zusatz.json).
   Ergebnis: export/redeskript.html und export/redeskript.pdf (A4).

   AUFRUF (im Ordner praesentation/):
     CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
     PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
     node werkzeuge/redeskript.mjs
   Exit-Code 1, wenn ein Text aus der Fassung keinem Absatz zugeordnet ist,
   ein Absatz ohne freie Fassung bleibt oder die Diskussionsfragen nicht
   wortgleich zu Folie 28 sind.
   ============================================================================= */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const ordner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ziel = path.join(ordner, 'export');
const lies = (datei) => JSON.parse(fs.readFileSync(path.resolve(ordner, datei), 'utf8'));
const fassung = lies(process.env.REDESKRIPT_TEXTE || 'werkzeuge/skript-frei.json');
const diskussion = lies('werkzeuge/diskussion.json');
const zusatz = lies('werkzeuge/skript-zusatz.json');
const fehler = [];

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROME_PFAD || undefined, args: ['--no-sandbox'] });
const seite = await browser.newPage();
await seite.goto(pathToFileURL(path.join(ordner, 'index.html')).href + '?druck', { waitUntil: 'load' });

const folien = await seite.evaluate(() => [...document.querySelectorAll('section.folie')]
  .filter((f) => !f.hasAttribute('data-backup'))
  .map((f) => {
    const titel = (f.querySelector('.titel, .s-trenner-name') || {}).textContent || f.getAttribute('data-titel') || '';
    const absaetze = [...f.querySelectorAll(':scope > aside.notizen > p.gesprochen')].map((p) => ({
      schritt: p.hasAttribute('data-schritt') ? Number(p.getAttribute('data-schritt')) : null,
      text: p.textContent.replace(/\s+/g, ' ').trim()
    }));
    const fragen = [...f.querySelectorAll('.s-fragen-text')].map((p) => p.textContent.replace(/\s+/g, ' ').trim());
    return { id: f.id, titel: titel.replace(/\s+/g, ' ').trim(), nummer: f.getAttribute('data-nummer') || f.id.replace(/^f/, ''),
      zeit: Number(f.getAttribute('data-zeit')) || 0, absaetze, fragen };
  }));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const woerter = (s) => (s.match(/\S+/g) || []).length;

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

/* Kürzungssätze je Folie: Stufe 1 → ¹, Stufe 2 → ² */
const kurz = {};
((fassung.kuerzung || {}).stufen || []).forEach((st, i) => st.saetze.forEach((s) => (kurz[s.folie] = kurz[s.folie] || []).push({ text: s.text, stufe: i + 1 })));
const kurzGefunden = new Set();
function mitKuerzung(id, html) {
  for (const k of kurz[id] || []) {
    const e = esc(k.text);
    if (!html.includes(e)) continue;
    kurzGefunden.add(id + '|' + k.text);
    html = html.replace(e, `<span class="kurz">[<sup>${k.stufe}</sup>${e}]</span>`);
  }
  return html;
}

const benutzt = new Set();
let uhr = 0, woerterGesamt = 0;
const bloecke = folien.map((f) => {
  const start = uhr; uhr += f.zeit;
  const teileHtml = [];
  let w = 0;
  f.absaetze.forEach((a) => {
    const schluessel = `${f.id}/${a.schritt ?? 'g'}`;
    const text = fassung.texte[schluessel];
    if (!text) fehler.push(`Keine freie Fassung für ${schluessel}.`);
    else benutzt.add(schluessel);
    if (a.schritt > 0) teileHtml.push(`<p class="klick">Klick ${a.schritt}</p>`);
    teile(text || a.text).forEach((t) => {
      if (t.art === 'rede') w += woerter(t.text);
      teileHtml.push(`<p class="${t.art}">${mitKuerzung(f.id, esc(t.text))}</p>`);
    });
  });
  woerterGesamt += w;
  const knapp = w / 130 * 60 > f.zeit * 1.1 ? ' <span class="warn">knapp</span>' : '';
  const nr = /^T\d/.test(f.nummer) ? f.nummer : String(f.nummer).padStart(2, '0');
  return `<section class="${/^t\d/.test(f.id) ? 'trenner' : ''}"><h2><span class="nr">${esc(nr)}</span> ${esc(f.titel)}<span class="zeit">${mmss(start)} bis ${mmss(uhr)} · ${f.zeit} s${knapp}</span></h2>${teileHtml.join('')}</section>`;
});
for (const [id, liste] of Object.entries(kurz)) for (const k of liste) if (!kurzGefunden.has(id + '|' + k.text)) fehler.push(`Kürzungssatz fehlt in ${id}: ${k.text}`);
for (const k of Object.keys(fassung.texte)) if (!benutzt.has(k)) fehler.push(`Fassung: Schlüssel ${k} passt zu keinem Sprechtext-Absatz.`);

/* Diskussionsfragen müssen wortgleich zur letzten Folie sein */
const letzte = folien[folien.length - 1];
diskussion.fragen.forEach((d, i) => { if (letzte.fragen[i] !== d.frage) fehler.push(`Diskussionsfrage ${i + 1} weicht von Folie ${letzte.nummer} ab: „${d.frage}“ / „${letzte.fragen[i]}“`); });

const diskussionHtml = `<section class="anhang diskussion"><h2><span class="nr">D</span> Diskussion: Beispielantworten<span class="zeit">nach dem Vortrag</span></h2>
${diskussion.vorab.map((p) => `<p class="regie">${esc(p)}</p>`).join('\n')}
${diskussion.fragen.map((d, i) => `<div class="frage">
  <h3><span class="nr">${i + 1}</span> ${esc(d.frage)}</h3>
  <p class="label">Einstieg</p><p>${esc(d.einstieg)}</p>
  <p class="label">Mögliche Antworten aus dem Publikum und wie ihr reagieren könnt</p>
  <dl>${d.antworten.map((a) => `<div><dt>${esc(a.publikum)}</dt><dd>${esc(a.reaktion)}</dd></div>`).join('')}</dl>
  <p class="label">Unsere Position</p><p class="position">${esc(d.position)}</p>
  <p class="label">Nachfrage, um weiterzukommen</p><p>${esc(d.nachfrage)}</p>
</div>`).join('\n')}
<h3 class="klein">Wenn die Diskussion stockt</h3>
<ul>${diskussion.stockt.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
</section>`;

const rueckfragenHtml = `<section class="anhang"><h2><span class="nr">R</span> Mögliche Rückfragen<span class="zeit">${(zusatz.rueckfragen || []).length} Fragen</span></h2>
${(zusatz.rueckfragen || []).map((r) => `<p><b>Folie ${esc(r.folie.replace(/^f/, ''))}: ${esc(r.frage)}</b> ${esc(r.antwort)}</p>`).join('\n')}
</section>`;

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Redeskript · SEO-Fallstudie</title>
<style>
  @font-face { font-family: "Bricolage R"; src: url("../schriften/bricolage-grotesque-latin-standard-normal.woff2") format("woff2"); font-weight: 200 800; }
  @font-face { font-family: "Bricolage R"; src: url("../schriften/bricolage-grotesque-latin-ext-standard-normal.woff2") format("woff2"); font-weight: 200 800; unicode-range: U+0100-024F, U+1E00-1EFF; }
  @font-face { font-family: "Inter R"; src: url("../schriften/inter-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: "Inter R"; src: url("../schriften/inter-latin-ext-opsz-normal.woff2") format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+1E00-1EFF; }
  @font-face { font-family: "Inter R"; src: url("../schriften/inter-latin-opsz-italic.woff2") format("woff2"); font-weight: 100 900; font-style: italic; }
  :root { --text: #15171C; --leise: #555A64; --akzent: #B23C0A; --blau: #1F4FD8; --linie: #D3D3CE; --flaeche: #F5F4F0; --papier: #fff; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --text: #F2F1EC; --leise: #B3B7C0; --akzent: #FF8A4C; --blau: #7EA2FF; --linie: #3A3E47; --flaeche: #1F2229; --papier: #14161B; } }
  :root[data-theme="dark"] { --text: #F2F1EC; --leise: #B3B7C0; --akzent: #FF8A4C; --blau: #7EA2FF; --linie: #3A3E47; --flaeche: #1F2229; --papier: #14161B; }
  body { margin: 0; background: var(--papier); color: var(--text); font: 11pt/1.52 "Inter R", system-ui, sans-serif; }
  main { max-width: 170mm; margin: 0 auto; padding: 24px 16px; }
  h1, h2, h3 { font-family: "Bricolage R", "Inter R", Arial, sans-serif; font-weight: 650; margin: 0; letter-spacing: -0.01em; }
  h1 { font-size: 22pt; line-height: 1.1; }
  .unter { color: var(--leise); margin: 6px 0 4px; }
  .legende { color: var(--leise); font-size: 9pt; margin: 0 0 14px; }
  section { border-top: 1px solid var(--linie); padding: 10px 0 6px; break-inside: avoid-page; }
  section.trenner { border-top: 3px solid var(--akzent); }
  h2 { font-size: 13.5pt; display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px; break-after: avoid; }
  .nr { color: var(--akzent); font-variant-numeric: tabular-nums; min-width: 1.6em; }
  .zeit { margin-left: auto; font: 9pt "Inter R", sans-serif; color: var(--leise); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .warn { color: var(--akzent); font-weight: 600; }
  p { margin: 0 0 6px; }
  .regie { font-style: italic; color: var(--leise); font-size: 10pt; }
  .klick { font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--akzent); margin: 8px 0 3px; }
  .klick::before { content: "▸ "; }
  .kurz { color: var(--leise); }
  .kurz sup { font-size: 7pt; font-weight: 700; color: var(--akzent); margin-right: 1px; }
  .anhang { break-before: page; break-inside: auto; }
  .anhang p { font-size: 10pt; }
  .anhang b { color: var(--text); }
  .frage { background: var(--flaeche); border-radius: 8px; padding: 10px 12px 6px; margin: 10px 0; break-inside: avoid; }
  .frage h3 { font-size: 12pt; line-height: 1.25; display: flex; gap: 8px; margin-bottom: 6px; }
  .label { font-size: 8pt !important; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--blau); margin: 8px 0 2px; }
  dl { margin: 0; }
  dl div { margin: 0 0 6px; padding-left: 10px; border-left: 3px solid var(--linie); }
  dt { font-weight: 600; font-size: 10pt; }
  dd { margin: 1px 0 0; font-size: 10pt; }
  .position { border-left: 3px solid var(--akzent); padding-left: 10px; }
  h3.klein { font-size: 11.5pt; margin: 12px 0 4px; }
  ul { margin: 0 0 6px; padding-left: 18px; font-size: 10pt; }
  li { margin-bottom: 3px; }
  @page { size: A4; margin: 15mm 18mm 14mm 18mm; }
  @media print { :root { --text: #15171C; --leise: #555A64; --akzent: #B23C0A; --blau: #1F4FD8; --linie: #D3D3CE; --flaeche: #F5F4F0; --papier: #fff; } main { padding: 0; max-width: none; } }
</style></head><body><main>
<h1>Redeskript: 150.732 Besuche – was steckt dahinter?</h1>
<p class="unter">Elias Knauber und Yannick Heisler · Management im KMU · ${folien.length} Folien, Sollzeit ${mmss(uhr)} Min. · frei gesprochene Fassung</p>
<p class="legende">Normal gesetzt: sprechen. Kursiv: Regie. „Klick“: nächster Schritt auf der Folie. Grau in [eckigen Klammern]: kann bei Zeitnot wegfallen (¹ zuerst, ² danach). Am Ende: Beispielantworten für die Diskussion und mögliche Rückfragen.</p>
${bloecke.join('\n')}
${diskussionHtml}
${rueckfragenHtml}
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
  headerTemplate: `<div style="${klein}">Redeskript · SEO-Fallstudie unter der Lupe · Elias Knauber und Yannick Heisler</div>`,
  footerTemplate: `<div style="${klein} text-align: right;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>`
});
await browser.close();
const seiten = (fs.readFileSync(path.join(ziel, 'redeskript.pdf'), 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`redeskript.html und redeskript.pdf erzeugt: ${folien.length} Folien, Sollzeit ${mmss(uhr)}, ${woerterGesamt} gesprochene Wörter (${(woerterGesamt / 130).toFixed(1)} min bei 130 Wörtern/min), ${diskussion.fragen.length} Diskussionsfragen, ${(zusatz.rueckfragen || []).length} Rückfragen, ${seiten} Seiten`);
for (const f of fehler) console.error('FEHLER: ' + f);
if (fehler.length) process.exit(1);
