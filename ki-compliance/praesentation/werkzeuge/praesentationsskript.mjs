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

/* Sprecherblöcke: zusammenhängende Folien desselben Sprechers */
const bloecke = [];
for (const f of folien) {
  const letzter = bloecke.at(-1);
  if (letzter && letzter.wer === f.sprecher) { letzter.bis = f.start + f.zeit; letzter.nb = f.n; }
  else bloecke.push({ wer: f.sprecher, von: f.start, bis: f.start + f.zeit, na: f.n, nb: f.n });
}
const nn = (n) => String(n).padStart(2, '0');
const VOLL = { Yannick: 'Yannick Heisler', Elias: 'Elias Knauber' };
const pille = (wer) => `<span class="pille sp-${wer.toLowerCase()}"><i>${wer[0]}</i>${wer}</span>`;
/* Übergabe-Sätze aus skript-zusatz.json: „Nach Folie 05“ gehört vor Folie 06 */
const uebergabeVor = {};
for (const u of zusatz.uebergaben) {
  const m = /Folie (\d+)/.exec(u[0]);
  if (m) uebergabeVor[Number(m[1]) + 1] = { von: u[1], letzter: u[2], erster: u[3] };
}
function uebergabeHtml(b) {
  const u = uebergabeVor[b.na];
  const dauer = mmss(b.bis - b.von);
  const saetze = u ? `<div class="ue-saetze"><p><span>${esc(u.von)} sagt zuletzt</span>${esc(u.letzter)}</p><p><span>${esc(b.wer)} beginnt mit</span>${esc(u.erster)}</p></div>` : '';
  return `<div class="uebergabe sp-${b.wer.toLowerCase()}">
  <div class="ue-kopf"><span class="ue-mono">${b.wer[0]}</span><div><p class="ue-klein">${b.na === 1 ? 'Es beginnt' : 'Sprecherwechsel · ab hier spricht'}</p><p class="ue-name">${esc(VOLL[b.wer])}</p></div>
  <p class="ue-bereich">Folien ${nn(b.na)} bis ${nn(b.nb)}<br>ab ${mmss(b.von)} · ${dauer} min</p></div>
  ${saetze}
</div>`;
}

/* 3. Bausteine */
function folieHtml(f) {
  const zeilen = [];
  for (const a of f.absaetze) {
    if (a.text.startsWith('Sprecherwechsel')) continue;   /* steht im Übergabe-Kasten vor der Folie */
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
  const block = bloecke.find((b) => b.na === f.n);
  /* Lange Folien (mehr als etwa eine halbe Seite Text) dürfen umbrechen, sonst bliebe ein Teilkopf allein stehen */
  const zeichen = f.absaetze.reduce((n, a) => n + a.text.length, 0);
  const lang = zeichen > 1800 ? ' folie--lang' : '';
  return `${block ? uebergabeHtml(block) : ''}<article class="folie sp-${f.sprecher.toLowerCase()}${lang}">
  <div class="links">
    <p class="wer-band"><span class="mono">${f.sprecher[0]}</span>${f.sprecher}</p>
    <img src="${f.bild}" alt="Folie ${f.nummer}">
    <p class="meta"><b class="nr">${f.nummer}</b><span class="zeit">ab ${mmss(f.start)} · ${f.zeit} s</span></p>
  </div>
  <div class="rechts">
    <h3>${esc(f.titel)}</h3>
    ${zeilen.join('\n    ')}
  </div>
</article>`;
}

function zeitleiste() {
  const bl = bloecke;
  const B = 640, x = (s) => (s / gesamt) * B;
  const balken = bl.map((b) => `<g><rect x="${x(b.von).toFixed(1)}" y="18" width="${(x(b.bis) - x(b.von)).toFixed(1)}" height="26" rx="4" class="${b.wer.toLowerCase()}"/>
    <text x="${((x(b.von) + x(b.bis)) / 2).toFixed(1)}" y="35" text-anchor="middle" class="balken-text">${String(b.na).padStart(2, '0')} bis ${String(b.nb).padStart(2, '0')}</text>
    <text x="${x(b.von).toFixed(1)}" y="60" class="tick">${mmss(b.von)}</text></g>`).join('');
  return `<svg class="zeitleiste" viewBox="0 0 ${B + 40} 70" role="img" aria-label="Wer spricht wann">
  ${balken}<text x="${B}" y="60" class="tick" text-anchor="end">${mmss(gesamt)}</text></svg>`;
}

const teilTabelle = TEILE.map((t) => {
  const fs_ = folien.filter((f) => f.n >= t.von && f.n <= t.bis);
  const wer = [...new Set(fs_.map((f) => f.sprecher))].map(pille).join(' ');
  const dauer = fs_.reduce((s, f) => s + f.zeit, 0);
  return `<tr><td>${t.name}</td><td>${String(t.von).padStart(2, '0')} bis ${String(t.bis).padStart(2, '0')}</td><td>${wer}</td><td>${mmss(fs_[0].start)}</td><td>${mmss(dauer)}</td></tr>`;
}).join('\n');

const koerper = TEILE.map((t) => {
  const fs_ = folien.filter((f) => f.n >= t.von && f.n <= t.bis);
  const dauer = fs_.reduce((s, f) => s + f.zeit, 0);
  const wer = [...new Set(fs_.map((f) => f.sprecher))].map(pille).join(' ');
  return `<section class="teil">
<header class="teil-kopf"><p class="teil-nr">Teil ${TEILE.indexOf(t) + 1}</p><h2>${t.name}</h2><p>${wer} Folien ${String(t.von).padStart(2, '0')} bis ${String(t.bis).padStart(2, '0')} · ab ${mmss(fs_[0].start)} · ${mmss(dauer)} min</p></header>
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
:root { --navy: #122E55; --blau: #2563EB; --teal: #0E9790; --grau: #4B5468; --linie: #D5D9E0; --flaeche: #F3F4F6; --papier: #FFFFFF;
  /* Sprecherfarben: weit auseinander, damit man auf einen Blick sieht, wer dran ist */
  --y: #2563EB; --y-hell: #EDF2FE; --e: #C2410C; --e-hell: #FDF0E6; }
.sp-yannick { --sp: var(--y); --sp-hell: var(--y-hell); }
.sp-elias { --sp: var(--e); --sp-hell: var(--e-hell); }
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
.zeitleiste .yannick { fill: var(--y); } .zeitleiste .elias { fill: var(--e); }
.balken-text { fill: #fff; font: 600 8.5px "Inter Deck", Arial, sans-serif; }
.tick { fill: var(--grau); font: 8px "Inter Deck", Arial, sans-serif; }
.legende { display: flex; gap: 6mm; font-size: 9pt; color: var(--grau); margin: 1mm 0 0; }
.legende i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.titelfuss { display: flex; justify-content: space-between; font-size: 9pt; color: var(--grau); border-top: 1px solid var(--linie); padding-top: 3mm; }
/* Überblick */
.ueberblick { break-after: page; }
h2 { font-size: 18pt; margin: 0 0 4mm; }
.ueberblick h3 { font-size: 11.5pt; margin: 5.5mm 0 2mm; }
.ueberblick td { padding: 1.3mm 2mm 1.3mm 0; } .ueberblick th { padding: 1.2mm 2mm 1.2mm 0; }
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
/* Jede Folie trägt die Farbe ihres Sprechers: Balken links, getönte Fläche, Namensband */
.folie { display: grid; grid-template-columns: 58mm 1fr; gap: 6mm; margin: 0 0 3.5mm; padding: 4mm 4mm 4.5mm 4.5mm;
  border-left: 3.2mm solid var(--sp); border-radius: 0 2mm 2mm 0; background: var(--sp-hell);
  break-inside: avoid; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.folie--lang { break-inside: auto; }
.folie--lang .schritt, .folie--lang .links { break-inside: auto; }
.teil-kopf { break-after: avoid; }
.links { break-inside: avoid; } .rechts h3 { break-after: avoid; } .schritt, .wechsel { break-inside: avoid; }
p { orphans: 3; widows: 3; }
.folie img { width: 58mm; aspect-ratio: 16 / 9; border-radius: 0 0 2mm 2mm; border: 1.5px solid var(--sp); border-top: 0; display: block; background: #fff; }
.wer-band { display: flex; align-items: center; gap: 2.2mm; margin: 0; padding: 1.4mm 2.6mm; border-radius: 2mm 2mm 0 0;
  background: var(--sp); color: #fff; font: 700 11pt "Inter Tight Deck", Arial, sans-serif; letter-spacing: .09em; text-transform: uppercase; }
.mono { display: inline-grid; place-items: center; width: 5.4mm; height: 5.4mm; border-radius: 50%; background: #fff; color: var(--sp); font-size: 9pt; letter-spacing: 0; }
.meta { display: flex; align-items: baseline; gap: 2.5mm; margin: 2.2mm 0 0; }
.nr { font: 700 16pt "Inter Tight Deck", Arial, sans-serif; letter-spacing: -0.02em; }
.wer { font-size: 8.5pt; font-weight: 600; color: #fff; border-radius: 99px; padding: .4mm 2.4mm; }
.sp-yannick .wer { background: var(--blau); } .sp-elias .wer { background: var(--teal); }
.zeit { color: var(--grau); font-size: 8.5pt; font-variant-numeric: tabular-nums; }
/* Übergabe-Kasten vor dem ersten Satz eines neuen Sprechers */
.uebergabe { break-inside: avoid; break-after: avoid; margin: 6mm 0 3mm; padding: 4mm 5mm; border-radius: 2.5mm; background: var(--sp); color: #fff; }
.teil-kopf + .uebergabe { margin-top: 0; }
.ue-kopf { display: grid; grid-template-columns: 13mm 1fr auto; gap: 4mm; align-items: center; }
.ue-mono { display: grid; place-items: center; width: 13mm; height: 13mm; border-radius: 50%; background: #fff; color: var(--sp); font: 700 20pt "Inter Tight Deck", Arial, sans-serif; }
.ue-klein { margin: 0; font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; opacity: .9; }
.ue-name { margin: .5mm 0 0; font: 700 21pt/1.05 "Inter Tight Deck", Arial, sans-serif; letter-spacing: -0.015em; }
.ue-bereich { margin: 0; text-align: right; font-size: 9.5pt; font-weight: 600; line-height: 1.4; font-variant-numeric: tabular-nums; }
.ue-saetze { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 3.5mm; }
.ue-saetze p { margin: 0; padding: 2.2mm 3mm; border-radius: 1.5mm; background: rgb(255 255 255 / .16); font-size: 10pt; line-height: 1.4; }
.ue-saetze span { display: block; margin-bottom: .8mm; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; opacity: .85; }
/* Sprecher als Pille (Überblick, Teilköpfe) */
.pille { display: inline-flex; align-items: center; gap: 1.4mm; padding: .35mm 2.6mm .35mm .7mm; border-radius: 99px;
  background: var(--sp); color: #fff; font-size: 8.5pt; font-weight: 700; white-space: nowrap; vertical-align: middle; }
.pille i { display: inline-grid; place-items: center; width: 4.2mm; height: 4.2mm; border-radius: 50%; background: #fff; color: var(--sp); font-style: normal; font-size: 7pt; }
.teil-kopf p:last-child .pille { margin-right: 1.5mm; }
/* Überblick: Wer spricht wann */
.ww-titel { font-size: 11.5pt; margin: 9mm 0 2.5mm; }
.wer-wann { display: grid; gap: 2.5mm; }
td.wechsel-zelle { white-space: nowrap; }
.ww-zeile { display: grid; grid-template-columns: 38mm 1fr 20mm; gap: 3mm; align-items: center; padding: 2.5mm 3mm; border-left: 2.5mm solid var(--sp); background: var(--sp-hell); border-radius: 0 1.5mm 1.5mm 0; }
.ww-zeile b { font: 700 11pt "Inter Tight Deck", Arial, sans-serif; color: var(--sp); }
.ww-zeile .ww-bloecke { display: flex; flex-wrap: wrap; gap: 1.5mm; }
.ww-zeile .ww-bloecke span { padding: .4mm 2.2mm; border-radius: 99px; background: #fff; border: 1.2px solid var(--sp); font-size: 8.8pt; font-weight: 600; font-variant-numeric: tabular-nums; }
.ww-zeile .ww-summe { text-align: right; font-size: 9pt; font-weight: 700; font-variant-numeric: tabular-nums; }
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
    <p class="legende"><span><i style="background:#2563EB"></i>Yannick Heisler</span><span><i style="background:#C2410C"></i>Elias Knauber</span><span>Startzeiten in Minuten ab Vortragsbeginn</span></p>
  <h3 class="ww-titel">Wer spricht wann</h3>
  <div class="wer-wann">${['Yannick', 'Elias'].map((w) => {
    const bl = bloecke.filter((x) => x.wer === w);
    const summe = bl.reduce((s, x) => s + x.bis - x.von, 0);
    return `<div class="ww-zeile sp-${w.toLowerCase()}"><b>${VOLL[w]}</b><span class="ww-bloecke">${bl.map((x) => `<span>Folien ${nn(x.na)} bis ${nn(x.nb)} · ab ${mmss(x.von)}</span>`).join('')}</span><span class="ww-summe">${mmss(summe)} min</span></div>`;
  }).join('')}</div>
  </div>
  <p class="titelfuss"><span>Vortrag Mo, 9.11.2026 · Hochschule Kaiserslautern · Management im KMU</span><span>Rechtsstand 31.10.2026 · Stand Skript ${esc(zusatz.stand)}</span></p>
</section>

<section class="ueberblick">
  <h2>Überblick</h2>
  <table><thead><tr><th>Teil</th><th>Folien</th><th>Sprecher</th><th>Start (min)</th><th>Dauer (min)</th></tr></thead>
  <tbody>${teilTabelle}</tbody></table>
  <h3>So liest du das Skript</h3>
  <div class="lesehilfe">
    <span class="pille sp-yannick"><i>Y</i>Yannick</span><span>blauer Balken und blaues Band an der Folie: Yannick spricht.</span>
    <span class="pille sp-elias"><i>E</i>Elias</span><span>oranger Balken und oranges Band: Elias spricht. Vor jedem Wechsel steht ein großer Kasten in der Farbe des neuen Sprechers, mit dem letzten und dem ersten Satz.</span>
    <span class="klick klick--start">Start</span><span>Text, sobald die Folie erscheint.</span>
    <span class="klick">Klick 2</span><span>Text nach dem zweiten Klick auf dieser Folie.</span>
    <span class="regie">kursiv</span><span>tun, nicht sagen. Alles andere wird gesprochen.</span>
  </div>
  <h3>Übergaben (wörtlich)</h3>
  <table><thead><tr><th>Wann</th><th>Wechsel</th><th>Letzter Satz</th><th>Erster Satz danach</th></tr></thead>
  <tbody>${zusatz.uebergaben.map((u) => `<tr><td>${esc(u[0])}</td><td class="wechsel-zelle">${pille(u[1])} → ${pille(u[1] === 'Yannick' ? 'Elias' : 'Yannick')}</td><td>${esc(u[2])}</td><td>${esc(u[3])}</td></tr>`).join('')}</tbody></table>
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
