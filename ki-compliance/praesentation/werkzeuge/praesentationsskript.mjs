#!/usr/bin/env node
/* =============================================================================
   praesentationsskript.mjs · Präsentationsskript als gestaltetes PDF
   -----------------------------------------------------------------------------
   Liest index.html in Chromium, nimmt je Hauptfolie Titel, Sprecher, Sollzeit,
   ein Vorschaubild des Endzustands und die Absätze aus <aside class="notizen">
   (class="gesprochen": Text in „…“ wird gesprochen, der Rest ist Regie).
   Überblick, Übergaben, Regeln, Rückfragen, Kürzungsplan und Plan B kommen aus
   werkzeuge/skript-zusatz.json (gleicher Inhalt wie das Claude-Dokument).
   Ergebnis: export/praesentationsskript.html, export/skript-bilder/*.jpg und
   export/praesentationsskript.pdf (A4, mit Seitenzahlen).

   AUFRUF (im Ordner praesentation/):
     PLAYWRIGHT_CORE=/pfad/zu/playwright-core CHROME_PFAD=/pfad/zu/chrome \
     node werkzeuge/praesentationsskript.mjs
   ============================================================================= */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const ordner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ziel = path.join(ordner, 'export');
const bilder = path.join(ziel, 'skript-bilder');
fs.mkdirSync(bilder, { recursive: true });
const zusatz = JSON.parse(fs.readFileSync(path.join(ordner, 'werkzeuge', 'skript-zusatz.json'), 'utf8'));

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROME_PFAD || undefined, args: ['--no-sandbox', '--allow-file-access-from-files'] });

/* 1. Folien lesen und den Endzustand jeder Hauptfolie fotografieren */
const deck = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5, reducedMotion: 'reduce' });
await deck.goto(pathToFileURL(path.join(ordner, 'index.html')).href + '?aufnahme', { waitUntil: 'load' });
await deck.waitForFunction(() => window.Deck && window.Deck.istBereit, null, { timeout: 20000 });
await deck.evaluate(() => document.fonts && document.fonts.ready);
await deck.evaluate(() => window.Deck.testmodus(true));
const liste = await deck.evaluate(() => window.Deck.folien().filter((f) => !f.backup)
  .map((f) => ({ id: f.id, nummer: f.nummer, schritte: f.schritteGesamt })));

const folien = [];
for (const f of liste) {
  await deck.evaluate(({ id, n }) => window.Deck.gehe(id, n, { sofort: true, still: true }), { id: f.id, n: f.schritte });
  await deck.waitForTimeout(350);
  const datei = `${f.nummer}.jpg`;
  await deck.screenshot({ path: path.join(bilder, datei), type: 'jpeg', quality: 82 });
  const daten = await deck.evaluate((id) => {
    const el = document.getElementById(id);
    const titel = (el.querySelector('.titel') || {}).textContent || el.getAttribute('data-titel') || '';
    const absaetze = [...el.querySelectorAll(':scope > aside.notizen > p')].map((p) => ({
      schritt: p.hasAttribute('data-schritt') ? Number(p.getAttribute('data-schritt')) : null,
      gesprochen: p.classList.contains('gesprochen'),
      text: p.textContent.replace(/\s+/g, ' ').trim()
    }));
    return { titel: titel.replace(/\s+/g, ' ').trim(), zeit: Number(el.getAttribute('data-zeit')) || 0, absaetze };
  }, f.id);
  folien.push({ ...f, ...daten, bild: 'skript-bilder/' + datei });
}

/* 2. Hilfen */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const sprecherVon = (n) => ((n >= 6 && n <= 19) || (n >= 28 && n <= 30)) ? 'Elias' : 'Yannick';
const TEILE = [
  { name: 'Einstieg', von: 1, bis: 5 },
  { name: 'Grundlagen', von: 6, bis: 10 },
  { name: 'Risikoklassen', von: 11, bis: 19 },
  { name: 'Selbst prüfen', von: 20, bis: 25 },
  { name: 'KMU-Praxis', von: 26, bis: 34 },
  { name: 'Schluss', von: 35, bis: 37 }
];

/* Text in „…“ (äußerste Ebene) ist gesprochen, der Rest Regie */
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
  /* „z. B. „…““ in der Regie bleibt Regie */
  for (let i = 1; i < out.length; i++) {
    if (out[i].art === 'rede' && out[i - 1].art === 'regie' && /z\. B\.$/.test(out[i - 1].text)) {
      out[i - 1].text += ' „' + out[i].text + '“'; out.splice(i, 1); i--;
    }
  }
  return out;
}
const INTERN = /^(Sprecher:|Hinweis zum Stand|Die frühere QR-Umfrage)/;

let uhr = 0;
for (const f of folien) {
  f.n = Number(f.nummer); f.start = uhr; uhr += f.zeit; f.sprecher = sprecherVon(f.n);
  f.titel = zusatz.titelErsatz[f.id] || f.titel;
}
const gesamt = uhr;

/* 3. Bausteine */
function folieHtml(f) {
  const zeilen = [];
  for (const a of f.absaetze) {
    if (a.text.startsWith('Sprecherwechsel')) {
      zeilen.push(`<p class="wechsel"><span class="pfeil" aria-hidden="true">⇄</span>${esc(a.text.replace(/–/g, ' bis '))}</p>`);
      continue;
    }
    if (a.gesprochen) {
      const label = a.schritt === null || a.schritt === 0 ? 'Start' : 'Klick ' + a.schritt;
      const inhalt = teile(a.text).map((t) => t.art === 'rede'
        ? `<span class="rede">${esc(t.text)}</span>`
        : `<span class="regie">${esc(t.text)}</span>`).join(' ');
      zeilen.push(`<div class="schritt"><span class="klick${label === 'Start' ? ' klick--start' : ''}">${label}</span><p>${inhalt}</p></div>`);
    } else if (/^(Technik|Bedienung|Freier Modus|Wer kein eigenes)/.test(a.text)) {
      zeilen.push(`<div class="schritt"><span class="klick klick--leer"></span><p><span class="regie">${esc(a.text.replace(/^Bedienung: /, ''))}</span></p></div>`);
    }
  }
  return `<article class="folie sp-${f.sprecher.toLowerCase()}">
  <div class="links">
    <img src="${f.bild}" alt="Folie ${f.nummer}">
    <p class="meta"><b class="nr">${f.nummer}</b><span class="wer">${f.sprecher}</span></p>
    <p class="zeit">ab ${mmss(f.start)} · ${f.zeit} s</p>
  </div>
  <div class="rechts">
    <h3>${esc(f.titel)}</h3>
    ${zeilen.join('\n    ')}
  </div>
</article>`;
}

function zeitleiste() {
  const bl = [];
  for (const f of folien) {
    const letzter = bl.at(-1);
    if (letzter && letzter.wer === f.sprecher) { letzter.bis = f.start + f.zeit; letzter.nb = f.n; }
    else bl.push({ wer: f.sprecher, von: f.start, bis: f.start + f.zeit, na: f.n, nb: f.n });
  }
  const B = 640, x = (s) => (s / gesamt) * B;
  const balken = bl.map((b) => `<g><rect x="${x(b.von).toFixed(1)}" y="18" width="${(x(b.bis) - x(b.von)).toFixed(1)}" height="26" rx="4" class="${b.wer.toLowerCase()}"/>
    <text x="${((x(b.von) + x(b.bis)) / 2).toFixed(1)}" y="35" text-anchor="middle" class="balken-text">${String(b.na).padStart(2, '0')} bis ${String(b.nb).padStart(2, '0')}</text>
    <text x="${x(b.von).toFixed(1)}" y="60" class="tick">${mmss(b.von)}</text></g>`).join('');
  return `<svg class="zeitleiste" viewBox="0 0 ${B + 40} 70" role="img" aria-label="Wer spricht wann">
  ${balken}<text x="${B}" y="60" class="tick" text-anchor="end">${mmss(gesamt)}</text></svg>`;
}

const teilTabelle = TEILE.map((t) => {
  const fs_ = folien.filter((f) => f.n >= t.von && f.n <= t.bis);
  const wer = [...new Set(fs_.map((f) => f.sprecher))].join(', ');
  const dauer = fs_.reduce((s, f) => s + f.zeit, 0);
  return `<tr><td>${t.name}</td><td>${String(t.von).padStart(2, '0')} bis ${String(t.bis).padStart(2, '0')}</td><td>${wer}</td><td>${mmss(fs_[0].start)}</td><td>${mmss(dauer)}</td></tr>`;
}).join('\n');

const koerper = TEILE.map((t) => {
  const fs_ = folien.filter((f) => f.n >= t.von && f.n <= t.bis);
  const dauer = fs_.reduce((s, f) => s + f.zeit, 0);
  const wer = [...new Set(fs_.map((f) => f.sprecher))].join(' und ');
  return `<section class="teil">
<header class="teil-kopf"><p class="teil-nr">Teil ${TEILE.indexOf(t) + 1}</p><h2>${t.name}</h2><p>${wer} · Folien ${String(t.von).padStart(2, '0')} bis ${String(t.bis).padStart(2, '0')} · ab ${mmss(fs_[0].start)} · ${mmss(dauer)} min</p></header>
${fs_.map(folieHtml).join('\n')}
${t.bis === 37 ? `<aside class="hinweis"><b>Diskussion:</b> ${esc(zusatz.diskussion)}</aside>` : ''}
</section>`;
}).join('\n');

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>Präsentationsskript: Welches Risiko hat Ihre KI?</title>
<style>
@font-face { font-family: "Inter Deck"; src: url("../schriften/inter-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Inter Deck"; src: url("../schriften/inter-latin-ext-opsz-normal.woff2") format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20C0; }
@font-face { font-family: "Inter Deck"; src: url("../schriften/inter-latin-opsz-italic.woff2") format("woff2"); font-weight: 100 900; font-style: italic; }
@font-face { font-family: "Inter Tight Deck"; src: url("../schriften/inter-tight-latin-wght-normal.woff2") format("woff2"); font-weight: 100 900; }
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
:root { --navy: #122E55; --blau: #2563EB; --teal: #0E9790; --grau: #4B5468; --linie: #D5D9E0; --flaeche: #F3F4F6; --papier: #FFFFFF; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 10pt/1.45 "Inter Deck", Arial, sans-serif; color: var(--navy); }
h1, h2, h3 { font-family: "Inter Tight Deck", "Inter Deck", Arial, sans-serif; letter-spacing: -0.015em; margin: 0; }
/* Titelseite */
.titelseite { height: 255mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
.marke { display: flex; align-items: center; gap: 10px; font: 700 13pt "Inter Tight Deck", Arial, sans-serif; }
.marke img { width: 30px; }
.marke span { color: var(--grau); font: 500 9.5pt "Inter Deck", Arial, sans-serif; margin-left: 6px; }
.titelseite .art { font-size: 10pt; font-weight: 600; color: var(--blau); text-transform: uppercase; letter-spacing: .08em; margin: 0 0 8mm; }
.titelseite h1 { font-size: 38pt; line-height: 1.02; letter-spacing: -0.03em; }
.titelseite .unter { font-size: 15pt; color: var(--grau); margin: 5mm 0 0; }
.kennzahlen { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin: 12mm 0 8mm; }
.kennzahlen div { border-top: 2.5px solid var(--navy); padding-top: 2.5mm; }
.kennzahlen b { display: block; font: 700 20pt "Inter Tight Deck", Arial, sans-serif; letter-spacing: -0.02em; }
.kennzahlen span { color: var(--grau); font-size: 9pt; }
.zeitleiste { width: 100%; height: auto; }
.zeitleiste .yannick { fill: var(--blau); } .zeitleiste .elias { fill: var(--teal); }
.balken-text { fill: #fff; font: 600 8.5px "Inter Deck", Arial, sans-serif; }
.tick { fill: var(--grau); font: 8px "Inter Deck", Arial, sans-serif; }
.legende { display: flex; gap: 6mm; font-size: 9pt; color: var(--grau); margin: 1mm 0 0; }
.legende i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.titelfuss { display: flex; justify-content: space-between; font-size: 9pt; color: var(--grau); border-top: 1px solid var(--linie); padding-top: 3mm; }
/* Überblick */
.ueberblick { break-after: page; }
h2 { font-size: 18pt; margin: 0 0 4mm; }
.ueberblick h3 { font-size: 11.5pt; margin: 7mm 0 2.5mm; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
th { text-align: left; font-weight: 600; color: var(--grau); border-bottom: 1.5px solid var(--navy); padding: 1.6mm 2mm 1.6mm 0; }
td { border-bottom: 1px solid var(--linie); padding: 1.8mm 2mm 1.8mm 0; vertical-align: top; }
.lesehilfe { display: grid; grid-template-columns: auto 1fr; gap: 2mm 4mm; align-items: baseline; font-size: 9.5pt; }
ul.regeln { margin: 0; padding-left: 4.5mm; } ul.regeln li { margin: 0 0 1.2mm; }
/* Teile und Folien */
.teil-kopf { break-before: page; border-bottom: 2.5px solid var(--navy); padding-bottom: 3mm; margin-bottom: 5mm; }
.teil:first-of-type .teil-kopf { break-before: auto; }
.teil-nr { margin: 0; font-size: 8.5pt; font-weight: 600; color: var(--blau); text-transform: uppercase; letter-spacing: .08em; }
.teil-kopf h2 { font-size: 22pt; margin: 1mm 0 1mm; }
.teil-kopf p:last-child { margin: 0; color: var(--grau); font-size: 9.5pt; }
.folie { display: grid; grid-template-columns: 58mm 1fr; gap: 6mm; padding: 4mm 0 5mm; border-bottom: 1px solid var(--linie); }
.links { break-inside: avoid; } .rechts h3 { break-after: avoid; } .schritt, .wechsel { break-inside: avoid; }
p { orphans: 3; widows: 3; }
.folie img { width: 58mm; aspect-ratio: 16 / 9; border-radius: 2mm; border: 1px solid var(--linie); display: block; }
.meta { display: flex; align-items: center; gap: 2.5mm; margin: 2.5mm 0 0; }
.nr { font: 700 16pt "Inter Tight Deck", Arial, sans-serif; letter-spacing: -0.02em; }
.wer { font-size: 8.5pt; font-weight: 600; color: #fff; border-radius: 99px; padding: .4mm 2.4mm; }
.sp-yannick .wer { background: var(--blau); } .sp-elias .wer { background: var(--teal); }
.zeit { margin: .6mm 0 0; color: var(--grau); font-size: 8.5pt; font-variant-numeric: tabular-nums; }
.rechts h3 { font-size: 12.5pt; line-height: 1.25; margin: 0 0 2.5mm; }
.schritt { display: grid; grid-template-columns: 15mm 1fr; gap: 2.5mm; margin: 0 0 2.2mm; }
.schritt p { margin: 0; }
.klick { justify-self: start; align-self: start; margin-top: .4mm; font-size: 7.5pt; font-weight: 700; color: var(--navy); background: var(--flaeche); border-radius: 99px; padding: .3mm 2mm; white-space: nowrap; }
.klick--start { color: #fff; background: var(--navy); }
.klick--leer { background: none; }
.rede { font-size: 10.5pt; line-height: 1.5; }
.regie { color: var(--grau); font-style: italic; font-size: 9pt; }
.regie::before { content: "Regie: "; font-style: normal; font-weight: 600; }
.wechsel { margin: 0 0 2.5mm; padding: 1.6mm 3mm; border-radius: 1.5mm; background: #EAF1FE; color: var(--navy); font-size: 9pt; font-weight: 600; }
.sp-elias .wechsel { background: #E3F4F2; }
.pfeil { margin-right: 2mm; }
.hinweis { margin: 4mm 0 0; padding: 3mm 4mm; border-left: 3px solid var(--blau); background: var(--flaeche); font-size: 9.5pt; }
/* Anhang */
.anhang .teil-kopf { break-before: page; }
.rf { display: grid; grid-template-columns: 9mm 1fr; gap: 3mm; padding: 2mm 0; border-bottom: 1px solid var(--linie); break-inside: avoid; font-size: 9.3pt; }
.rf b.n { font: 700 11pt "Inter Tight Deck", Arial, sans-serif; }
.rf p { margin: 0; } .rf p b { display: block; margin-bottom: .5mm; }
.anhang h3 { font-size: 12pt; margin: 7mm 0 2.5mm; }
.anhang ol, .anhang ul { margin: 0; padding-left: 5mm; font-size: 9.5pt; } .anhang li { margin: 0 0 1.4mm; }
</style></head>
<body>
<section class="titelseite">
  <div>
    <p class="marke"><img src="../bilder/simpleact-zeichen-128.png" alt="">SimpleAct<span>KI-Compliance mit System.</span></p>
  </div>
  <div>
    <p class="art">Präsentationsskript</p>
    <h1>Welches Risiko<br>hat Ihre KI?</h1>
    <p class="unter">Der EU AI Act und was er für KMU bedeutet</p>
    <div class="kennzahlen">
      <div><b>${folien.length}</b><span>Folien, dazu 6 Backup</span></div>
      <div><b>${mmss(gesamt)}</b><span>Sollzeit in Minuten</span></div>
      <div><b>6</b><span>Live-Fragen per QR-Code</span></div>
      <div><b>10</b><span>Minuten Diskussion danach</span></div>
    </div>
    ${zeitleiste()}
    <p class="legende"><span><i style="background:#2563EB"></i>Yannick Heisler</span><span><i style="background:#0E9790"></i>Elias Knauber</span><span>Startzeiten in Minuten ab Vortragsbeginn</span></p>
  </div>
  <p class="titelfuss"><span>Vortrag Mo, 9.11.2026 · Hochschule Kaiserslautern · Management im KMU</span><span>Rechtsstand 31.10.2026 · Stand Skript ${esc(zusatz.stand)}</span></p>
</section>

<section class="ueberblick">
  <h2>Überblick</h2>
  <table><thead><tr><th>Teil</th><th>Folien</th><th>Sprecher</th><th>Start (min)</th><th>Dauer (min)</th></tr></thead>
  <tbody>${teilTabelle}</tbody></table>
  <h3>So liest du das Skript</h3>
  <div class="lesehilfe">
    <span class="klick klick--start">Start</span><span>Text, sobald die Folie erscheint.</span>
    <span class="klick">Klick 2</span><span>Text nach dem zweiten Klick auf dieser Folie.</span>
    <span class="regie">kursiv</span><span>tun, nicht sagen. Alles andere wird gesprochen.</span>
  </div>
  <h3>Übergaben (wörtlich)</h3>
  <table><thead><tr><th>Wann</th><th>Wer übergibt</th><th>Letzter Satz</th><th>Erster Satz danach</th></tr></thead>
  <tbody>${zusatz.uebergaben.map((u) => `<tr><td>${esc(u[0])}</td><td>${esc(u[1])}</td><td>${esc(u[2])}</td><td>${esc(u[3])}</td></tr>`).join('')}</tbody></table>
  <h3>Regeln für Umfragen und Bedienung</h3>
  <ul class="regeln">${zusatz.regeln.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
</section>

${koerper}

<section class="anhang">
  <header class="teil-kopf"><p class="teil-nr">Anhang</p><h2>Rückfragen, Kürzungsplan, Plan B</h2><p>Die Antworten stehen auch in den Notizen der Referentenansicht. Nur nutzen, wenn gefragt wird.</p></header>
  ${zusatz.rueckfragen.map((r) => `<div class="rf"><b class="n">${esc(r[0])}</b><p><b>${esc(r[1])}</b>${esc(r[2])}</p></div>`).join('\n  ')}
  <h3>Kürzungsplan bei Verzug</h3>
  <ul>${zusatz.kuerzung.map((k) => `<li><b>${esc(k[0])}:</b> ${esc(k[1])}</li>`).join('')}</ul>
  <h3>Plan B, wenn etwas hängt</h3>
  <ol>${zusatz.planb.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
</section>
</body></html>`;

fs.writeFileSync(path.join(ziel, 'praesentationsskript.html'), html);

/* 4. PDF mit Seitenzahlen */
const druck = await browser.newPage();
await druck.goto(pathToFileURL(path.join(ziel, 'praesentationsskript.html')).href, { waitUntil: 'load' });
await druck.evaluate(() => document.fonts && document.fonts.ready);
await druck.pdf({
  path: path.join(ziel, 'praesentationsskript.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font:8px Arial,sans-serif;color:#4B5468;padding:0 15mm;display:flex;justify-content:space-between"><span>Präsentationsskript · Welches Risiko hat Ihre KI?</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
});
await browser.close();
console.log(`praesentationsskript.pdf erzeugt: ${folien.length} Folien, Sollzeit ${mmss(gesamt)}, ${zusatz.rueckfragen.length} Rückfragen`);
