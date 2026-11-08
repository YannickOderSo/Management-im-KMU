#!/usr/bin/env node
/* =============================================================================
   praesentationsskript.mjs · Präsentationsskript „SEO-Fallstudie unter der Lupe“ als gestaltetes PDF
   (übernommen aus fuehrung/praesentation; einzige Änderung: Quellenköpfe der Backup-Folie
    auch aus <b> statt nur .r-quellen-wer)
   (übernommen aus der Recap, recap/…/werkzeuge/praesentationsskript.mjs, und angepasst:
   Sprechtext = p[data-schritt] oder p.gesprochen, Blöcke ohne Trennfolien, ein Sprecher,
   Belegnotizen bleiben draußen, Titel/Akzent/Kennzahl aus skript-zusatz.json)
   -----------------------------------------------------------------------------
   Liest index.html in Chromium (Deck-API: istBereit, testmodus, folien(), gehe()),
   fotografiert den Endzustand jeder Folie und nimmt je Folie Titel, Sollzeit
   (data-zeit) und die Absätze aus <aside class="notizen">:
     p.gesprochen[data-schritt]  Sprechtext je Klick. Er steht ganz in „…“, innere
                                 Zitate in ‚…‘. Text außerhalb der äußeren „…“ ist
                                 Regie und wird kursiv gesetzt.
     p ohne Klasse               Hintergrund für Rückfragen (nicht vortragen);
                                 „Sprecherwechsel: …“ wird als Wechsel-Hinweis
                                 gesetzt, „Trennfolie: …“ als Regie.
   Sprecheraufteilung, Übergaben, Rückfragen, Kürzungsplan und Plan B stehen NUR
   in werkzeuge/skript-zusatz.json. Gestaltung „Der rote Faden“ (Fraunces,
   Libre Franklin aus schriften/, Karmin nur für den Faden), druckfest in
   Schwarz-Weiß: Sprecher immer mit Namen, Marke gefüllt bzw. umrandet.
   Satz: Sprechtext und Regie ohne Silbentrennung, Übergabesätze ohne Umbruch;
   das „g“ der Titelseite gewebt wie im Deck (recap.js), Blocknamen ungewebt;
   Randnotizen wandern unter den Sprechtext, wenn die Folie dadurch mindestens
   10 mm niedriger wird; die Quellenfolie steht im Anhang auch als Text; die
   Zwischenzeiten nennen, was der Kürzungsplan ab dort noch bringt.

   Ausgabe   export/praesentationsskript.pdf (A4, Seitenzahlen, Lesezeichen)
             _test/skript/praesentationsskript.html, skript-bilder/*.jpg und
             pruefung.json (Vollständigkeit, Klicks, Zeiten, Übergaben, Kürzungen)
   Mit SKRIPT_ZIEL=<ordner> landet alles in diesem Ordner (eigene Prüfkopie).

   AUFRUF (im Ordner praesentation/):
     CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
     PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
     node werkzeuge/praesentationsskript.mjs
   Neu erzeugen nach jeder Änderung an Sprechtext, Notizen, data-zeit, Folien
   oder skript-zusatz.json. Exit-Code 1 bei Fehlern (z. B. Folie ohne Sprecher).
   ============================================================================= */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

/* ---------------------------------------------------------------------------
   0. Pfade und Zusatzdaten
   --------------------------------------------------------------------------- */
const ordner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eigenesZiel = process.env.SKRIPT_ZIEL ? path.resolve(process.env.SKRIPT_ZIEL) : '';
const zielPdf = eigenesZiel || path.join(ordner, 'export');
const zielArbeit = eigenesZiel || path.join(ordner, '_test', 'skript');
const bilderOrdner = path.join(zielArbeit, 'skript-bilder');
fs.mkdirSync(zielPdf, { recursive: true });
fs.mkdirSync(bilderOrdner, { recursive: true });
const zusatz = JSON.parse(fs.readFileSync(path.join(ordner, 'werkzeuge', 'skript-zusatz.json'), 'utf8'));
/* Zweite Fassung (z. B. locker formuliert): SKRIPT_TEXTE=werkzeuge/skript-locker.json ersetzt den
   Sprechtext je Absatz („f03/0“ = data-schritt 0, „f04/g“ = p.gesprochen ohne Schritt), dazu
   optional „kicker“, „datei“ (Name des PDF ohne Endung) und „kuerzung“. Folien, Zeiten und
   Randnotizen bleiben wie in index.html. */
const fassung = process.env.SKRIPT_TEXTE ? JSON.parse(fs.readFileSync(path.resolve(ordner, process.env.SKRIPT_TEXTE), 'utf8')) : null;
if (fassung && fassung.kuerzung) zusatz.kuerzung = fassung.kuerzung;
const dateiName = (fassung && fassung.datei) || 'praesentationsskript';
const schrift = (datei) => pathToFileURL(path.join(ordner, 'schriften', datei)).href;

const fehler = [];
const warnungen = [];

/* ---------------------------------------------------------------------------
   1. Folien lesen und den Endzustand jeder Folie fotografieren
   --------------------------------------------------------------------------- */
const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROME_PFAD || undefined,
  args: ['--no-sandbox', '--allow-file-access-from-files']
});
const deck = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5, reducedMotion: 'reduce' });
await deck.goto(pathToFileURL(path.join(ordner, 'index.html')).href + '?aufnahme', { waitUntil: 'load' });
await deck.waitForFunction(() => window.Deck && window.Deck.istBereit, null, { timeout: 20000 });
await deck.evaluate(() => document.fonts && document.fonts.ready);
await deck.evaluate(() => window.Deck.testmodus(true));
const liste = await deck.evaluate(() => window.Deck.folien()
  .map((f) => ({ id: f.id, nummer: String(f.nummer), schritte: f.schritteGesamt, backup: !!f.backup })));

const folien = [];
for (const f of liste) {
  await deck.evaluate(({ id, n }) => window.Deck.gehe(id, n, { sofort: true, still: true }), { id: f.id, n: f.schritte });
  await deck.waitForTimeout(350);
  const datei = `${f.id}.jpg`;
  await deck.screenshot({ path: path.join(bilderOrdner, datei), type: 'jpeg', quality: 84 });
  const daten = await deck.evaluate((id) => {
    const el = document.getElementById(id);
    const text = (knoten) => {
      if (!knoten) return '';
      const k = knoten.cloneNode(true);
      k.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
      k.querySelectorAll('[aria-hidden="true"]').forEach((x) => { if (!x.textContent.trim()) x.remove(); });
      return k.textContent.replace(/\s+/g, ' ').trim();
    };
    const absaetze = [...el.querySelectorAll(':scope > aside.notizen > p')].map((p) => ({
      schritt: p.hasAttribute('data-schritt') ? Number(p.getAttribute('data-schritt')) : null,
      gesprochen: p.classList.contains('gesprochen') || p.hasAttribute('data-schritt'),
      text: text(p)
    }));
    /* Backup-Folien: Listeneinträge (B1: Quellen) als Text, das Vorschaubild ist im Druck zu klein */
    const liste = el.hasAttribute('data-backup')
      ? [...el.querySelectorAll('.folie-inhalt li')].map((li) => {
        const ganz = text(li);
        const kopf = text(li.querySelector('.r-quellen-wer, b'));
        return { kopf, rest: kopf && ganz.startsWith(kopf) ? ganz.slice(kopf.length).trim() : ganz };
      })
      : [];
    return {
      liste,
      titel: text(el.querySelector('.titel')),
      kurz: el.getAttribute('data-titel') || '',
      zeit: Number(el.getAttribute('data-zeit')) || 0,
      block: el.getAttribute('data-block') ? Number(el.getAttribute('data-block')) : null,
      titelZeilen: [text(el.querySelector('.r-titel-satz .r-webe')), text(el.querySelector('.r-titel-satz .r-titel-zeile'))],
      lead: text(el.querySelector('.lead')),
      wer: text(el.querySelector('.ist-aktuell .r-fahrplan-wer')),
      absaetze
    };
  }, f.id);
  if (fassung) for (const a of daten.absaetze) {
    const neu = a.gesprochen !== false && fassung.texte[`${f.id}/${a.schritt ?? 'g'}`];
    if (neu) { a.text = neu; a.ersetzt = `${f.id}/${a.schritt ?? 'g'}`; }
  }
  folien.push({ ...f, ...daten, bild: 'skript-bilder/' + datei });
}

/* ---------------------------------------------------------------------------
   2. Hilfen
   --------------------------------------------------------------------------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mmss = (s) => { const r = Math.round(s); return Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0'); };
const woerter = (s) => (s.match(/\S+/g) || []).length;
const ersterGross = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const MONATE = 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember';
/* Feinsatz für alles Sichtbare (nach esc): schmale Leerzeichen in Abkürzungen, feste in Zahl + Einheit */
function typo(s) {
  return s
    .replace(/\b(z|d|u|o|v)\. (B|h|a|Ä|g)\./g, '$1.\u202F$2.')
    .replace(/\b(Art|Abs|Nr|Rn|S)\. (\d)/g, '$1.\u00A0$2')
    .replace(new RegExp(`(\\d{1,2})\\. (${MONATE})`, 'g'), '$1.\u00A0$2')
    .replace(/(\d) (Prozent|%|Uhr|Min\.|Minuten|Sekunden|Seiten|Punkte|Beschäftigten|s\b|min\b)/g, '$1\u00A0$2')
    .replace(/\b(Folien?|Block|Klick|Seite|Stufe|Modul|Teil) (\d|T\d|B\d)/g, '$1\u00A0$2')
    .replace(/ – /g, '\u00A0– ');
}
const t = (s) => typo(esc(s));

/* Folien-IDs in Hinweisen lesbar machen: t2 → T2, f17 → 17 */
const idsLesbar = (s) => s.replace(/\b([ft])(\d{1,2})\b/g, (_, a, n) => (a === 't' ? 'T' + Number(n) : n.padStart(2, '0')));

/* Text in „…“ (äußerste Ebene) ist gesprochen, der Rest Regie */
function zerlegen(text) {
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
/* Gesprochener Teil eines Absatzes (ohne äußere „…“); Absatz ohne „…“ gilt ganz als Rede */
const redeText = (text) => (text.includes('„') ? zerlegen(text).filter((x) => x.art === 'rede').map((x) => x.text).join(' ') : '');

/* Hintergrundnotizen einordnen: Wechsel-Hinweis, Regie oder Rückfrage-Wissen */
function notizArt(text) {
  if (/^Sprecherwechsel\s*:/.test(text)) return { art: 'wechsel', text: idsLesbar(text) };
  if (/^Trennfolie\s*:/.test(text)) return { art: 'regie', text: ersterGross(text.replace(/^Trennfolie\s*:\s*/, '')) };
  return { art: 'hintergrund', text: ersterGross(text.replace(/^(Hintergrund|Bei Rückfragen)\s*:\s*/, '')) };
}

/* Zahlenliste kompakt: [T1, 03, 04, 05, 06, 07] → „T1, 03 bis 07“ */
function bereich(nummern) {
  const teile = [];
  let lauf = [];
  const schliessen = () => {
    if (lauf.length >= 3) teile.push(`${lauf[0]} bis ${lauf.at(-1)}`);
    else teile.push(...lauf);
    lauf = [];
  };
  for (const n of nummern) {
    const zahl = /^\d+$/.test(n) ? Number(n) : null;
    const vorher = lauf.length ? Number(lauf.at(-1)) : null;
    if (zahl !== null && (vorher === null || zahl === vorher + 1)) lauf.push(n);
    else { schliessen(); if (zahl !== null) lauf.push(n); else teile.push(n); }
  }
  schliessen();
  return teile.join(', ');
}

/* Marken (fett, gekürzt) in einen Redetext setzen, ohne Überschneidung */
function markiere(text, marken) {
  const treffer = [];
  for (const m of marken) {
    const i = text.indexOf(m.text);
    if (i < 0) continue;
    if (treffer.some((x) => i < x.i + x.text.length && x.i < i + m.text.length)) continue;
    treffer.push({ ...m, i });
    m.gefunden = true;
  }
  treffer.sort((a, b) => a.i - b.i);
  let out = '', pos = 0;
  for (const m of treffer) {
    out += t(text.slice(pos, m.i)) + m.vor + t(m.text) + m.nach;
    pos = m.i + m.text.length;
  }
  return out + t(text.slice(pos));
}

/* Kleine Zeichen als SVG (die Schriften haben keine Pfeile und Kreise) */
const SVG_MARKE = {
  gefuellt: '<svg viewBox="0 0 10 10" width="9" height="9" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4.3" fill="#161B27"/></svg>',
  umrandet: '<svg viewBox="0 0 10 10" width="9" height="9" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="3.75" fill="#fff" stroke="#161B27" stroke-width="1.3"/></svg>'
};
const marke = (art) => `<span class="marke marke--${art}" aria-hidden="true">${SVG_MARKE[art] || ''}</span>`;
const markeUrl = (art) => `url("data:image/svg+xml;utf8,${encodeURIComponent(SVG_MARKE[art] || '')}")`;
const PFEIL = '<svg class="pfeil" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.6 1.2 9.2 5 1.6 8.8Z"/></svg>';
const WECHSEL = '<svg class="wechsel-zeichen" viewBox="0 0 18 14" aria-hidden="true"><path d="M1.5 4.5h13M11.5 1.5l3 3-3 3M16.5 9.5h-13M6.5 6.5l-3 3 3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------------------------------------------------------------------------
   3. Modell: Teile, Sprecher, Zeiten – und Prüfungen
   --------------------------------------------------------------------------- */
const sprecher = zusatz.sprecher || {};
const haupt = folien.filter((f) => !f.backup);
const backups = folien.filter((f) => f.backup);
const nachId = new Map(folien.map((f) => [f.id, f]));

let uhr = 0;
for (const f of haupt) { f.start = uhr; uhr += f.zeit; }
const gesamt = uhr;
if (zusatz.sollzeit && gesamt !== zusatz.sollzeit) warnungen.push(`Summe data-zeit ${gesamt} s (${mmss(gesamt)}) statt ${zusatz.sollzeit} s (${mmss(zusatz.sollzeit)}).`);
for (const f of backups) if (f.zeit) warnungen.push(`Backup-Folie ${f.nummer} hat data-zeit ${f.zeit}.`);

const teile = (zusatz.teile || []).map((teil, i) => ({ ...teil, abschnitt: 'teil' + (i + 1) }));
const zuordnung = new Map();
for (const teil of teile) {
  if (!sprecher[teil.sprecher]) fehler.push(`Teil ${teil.name || 'Block ' + teil.block}: Sprecher „${teil.sprecher}“ fehlt unter „sprecher“.`);
  teil.folienListe = [];
  for (const id of teil.folien) {
    if (zuordnung.has(id)) fehler.push(`Folie ${id} steht in zwei Teilen.`);
    zuordnung.set(id, teil);
    const f = nachId.get(id);
    if (!f) fehler.push(`skript-zusatz.json nennt ${id}, die Folie gibt es in index.html nicht.`);
    else if (f.backup) fehler.push(`${id} ist eine Backup-Folie und gehört nicht in „teile“.`);
    else teil.folienListe.push(f);
  }
}
for (const f of haupt) if (!zuordnung.has(f.id)) fehler.push(`Folie ${f.nummer} (${f.id}) hat keinen Sprecher: in skript-zusatz.json unter „teile“ ergänzen.`);
const reiheZusatz = teile.flatMap((teil) => teil.folien).filter((id) => nachId.has(id) && !nachId.get(id).backup);
const reiheDeck = haupt.map((f) => f.id).filter((id) => zuordnung.has(id));
if (reiheZusatz.join() !== reiheDeck.join()) fehler.push(`Reihenfolge in „teile“ weicht von index.html ab (${reiheZusatz.join(' ')} gegen ${reiheDeck.join(' ')}).`);

for (const teil of teile) {
  const fs_ = teil.folienListe;
  teil.start = fs_.length ? fs_[0].start : 0;
  teil.dauer = fs_.reduce((s, f) => s + f.zeit, 0);
  teil.ende = teil.start + teil.dauer;
  teil.sp = sprecher[teil.sprecher] || { name: teil.sprecher, rufname: teil.sprecher, marke: 'gefuellt' };
  teil.nummern = fs_.map((f) => f.nummer);
  if (teil.block) {
    const trenner = fs_.find((f) => f.block === teil.block);
    if (!trenner && !teil.name) warnungen.push(`Block ${teil.block}: keine Trennfolie mit data-block="${teil.block}" in diesem Teil.`);
    teil.name = teil.name || (trenner ? trenner.kurz.replace(/^Block\s*\d+\s*:\s*/, '') : 'Block ' + teil.block);
    teil.zusatz = teil.zusatz || (trenner ? trenner.wer : '');
    teil.lauf = `Block ${teil.block}: ${teil.name}`;
  } else {
    teil.lauf = teil.name;
  }
  for (const f of fs_) { f.teil = teil; f.sp = teil.sp; }
}
/* Ein Teil mit „neueSeite“: false läuft auf der Seite des vorigen weiter (nur bei gleichem
   Sprecher, sonst stimmte der Seitenkopf nicht); beide teilen sich Seitenname und Kopf. */
teile.forEach((teil, i) => {
  const vorher = teile[i - 1];
  teil.fliesst = teil.neueSeite === false && !!vorher && vorher.sprecher === teil.sprecher;
  if (teil.neueSeite === false && !teil.fliesst) warnungen.push(`${teil.lauf}: „neueSeite: false“ geht nur bei gleichem Sprecher wie im Teil davor, beginnt daher auf neuer Seite.`);
  teil.seitenname = teil.fliesst ? vorher.seitenname : teil.abschnitt;
  teil.kopf = teil.lauf;
  if (teil.fliesst) { const erster = teile.find((x) => x.seitenname === teil.seitenname); erster.kopf += `, ${teil.lauf}`; }
});

/* Sprechtext je Folie: Klicks passend zu data-schritt, jeder Absatz genau einmal */
for (const f of folien) {
  f.gesprochen = f.absaetze.filter((a) => a.gesprochen);
  f.gesprochen.forEach((a, i) => { if (a.schritt === null && f.schritte) a.schritt = i ? f.gesprochen[i - 1].schritt : 0; });
  f.notizen = f.absaetze.filter((a) => !a.gesprochen && !/^(Belege?\b|Eigene Synthese)/.test(a.text))
    .map((a) => notizArt(a.text.replace(/\s*\((?:Dossier[^)]*|[A-Z]-\d\d[^)]*)\)/g, '').replace(/\s*\[(\d+(?:\]\[\d+)*)\]/g, '')));
  f.woerter = f.gesprochen.reduce((s, a) => s + woerter(redeText(a.text)), 0);
  if (f.backup) continue;
  const soll = f.schritte ? Array.from({ length: f.schritte + 1 }, (_, i) => i) : [null];
  const ist = [...new Set(f.gesprochen.map((a) => (a.schritt === null && !f.schritte ? null : a.schritt)))];
  const passt = f.schritte ? ist.join() === soll.join() : ist.every((x) => x === null || x === 0);
  if (!passt) warnungen.push(`Folie ${f.nummer}: Sprechtext-Schritte [${ist.join(', ')}] passen nicht zu ${f.schritte} Klick(s) der Folie.`);
  const sekunden = (f.woerter / (zusatz.woerterProMinute || 130)) * 60;
  if (sekunden > f.zeit + 1) warnungen.push(`Folie ${f.nummer}: ${f.woerter} Wörter brauchen ${Math.round(sekunden)} s, Sollzeit ${f.zeit} s.`);
}

/* Übergaben: Sätze wortgleich im Sprechtext, passend zur Aufteilung */
const redeVon = (a) => redeText(a.text);
const uebergaben = (zusatz.uebergaben || []).map((u) => {
  const i = haupt.findIndex((f) => f.id === u.nach);
  const vorher = haupt[i], danach = haupt[i + 1];
  const bericht = { ...u, letzterSatzGefunden: false, ersterSatzGefunden: false, wechselNotiz: false };
  if (!vorher || !danach) { fehler.push(`Übergabe nach ${u.nach}: Folie nicht gefunden oder letzte Folie.`); return bericht; }
  bericht.vorher = vorher; bericht.danach = danach; bericht.zeit = danach.start;
  if (vorher.teil?.sprecher !== u.von || danach.teil?.sprecher !== u.an) fehler.push(`Übergabe nach ${vorher.nummer}: laut „teile“ spricht ${vorher.teil?.sprecher} vor und ${danach.teil?.sprecher} nach der Übergabe, nicht ${u.von} → ${u.an}.`);
  const letzter = vorher.gesprochen.at(-1), erster = danach.gesprochen[0];
  bericht.letzterSatzGefunden = !!letzter && redeVon(letzter).trim().endsWith(u.letzterSatz);
  bericht.ersterSatzGefunden = !!erster && redeVon(erster).trim().startsWith(u.ersterSatz);
  bericht.wechselNotiz = danach.notizen.some((n) => n.art === 'wechsel');
  if (!bericht.letzterSatzGefunden) warnungen.push(`Übergabe nach ${vorher.nummer}: Sprechtext endet nicht wortgleich mit „${u.letzterSatz}“.`);
  if (!bericht.ersterSatzGefunden) warnungen.push(`Übergabe nach ${vorher.nummer}: Sprechtext von ${danach.nummer} beginnt nicht wortgleich mit „${u.ersterSatz}“.`);
  if (!bericht.wechselNotiz) warnungen.push(`Übergabe nach ${vorher.nummer}: Folie ${danach.nummer} hat keine Notiz „Sprecherwechsel: …“.`);
  vorher.uebergabeAus = u; danach.uebergabeEin = u;
  return bericht;
});
for (let i = 1; i < haupt.length; i++) {
  if (haupt[i].teil && haupt[i - 1].teil && haupt[i].teil.sprecher !== haupt[i - 1].teil.sprecher && !haupt[i].uebergabeEin) {
    warnungen.push(`Sprecherwechsel vor Folie ${haupt[i].nummer} ohne Eintrag unter „uebergaben“.`);
  }
}

/* Kürzungsplan: Sätze im Sprechtext suchen, Sekunden wie die Sollzeiten (Wörter pro Minute) */
const wpm = zusatz.woerterProMinute || 130;
const stufen = ((zusatz.kuerzung || {}).stufen || []).map((st, si) => {
  const saetze = (st.saetze || []).map((s) => {
    const f = nachId.get(s.folie);
    const eintrag = { ...s, stufe: si + 1, folienNr: f ? f.nummer : s.folie, gefunden: false, woerter: woerter(s.text) };
    eintrag.sekunden = Math.round((eintrag.woerter / wpm) * 60);
    if (!f) { warnungen.push(`Kürzung: Folie ${s.folie} gibt es nicht.`); return eintrag; }
    const absatz = f.gesprochen.find((a) => redeVon(a).includes(s.text));
    if (!absatz) { warnungen.push(`Kürzung ${st.name}, Folie ${f.nummer}: Satz nicht im Sprechtext gefunden („${s.text.slice(0, 50)}…“), im Skript weggelassen.`); return eintrag; }
    eintrag.gefunden = true;
    eintrag.schritt = absatz.schritt;
    eintrag.sp = f.sp;
    (f.kuerzungen = f.kuerzungen || []).push(eintrag);
    return eintrag;
  });
  const gueltig = saetze.filter((s) => s.gefunden);
  return { ...st, nr: si + 1, saetze: gueltig, alle: saetze, summe: gueltig.reduce((x, s) => x + s.sekunden, 0) };
});
stufen.reduce((kum, st) => (st.kumuliert = kum + st.summe), 0);

/* Was die Kürzungen ab einer Folie (einschließlich) noch bringen: [Stufe 1, alle Stufen] in s.
   Steht bei den Zwischenzeiten; {rest:<id>} in der Regel setzt den Wert für alle Stufen ein. */
const posVon = new Map(haupt.map((f, i) => [f.id, i]));
const restAb = (f) => {
  const i0 = posVon.get(f.id) ?? Infinity;
  const proStufe = stufen.map((st) => st.saetze.filter((s) => (posVon.get(s.folie) ?? -1) >= i0).reduce((x, s) => x + s.sekunden, 0));
  return [proStufe[0] || 0, proStufe.reduce((x, y) => x + y, 0)];
};

/* Redezeit je Sprecher */
const redezeit = {};
for (const f of haupt) if (f.teil) {
  const k = f.teil.sprecher;
  redezeit[k] = redezeit[k] || { zeit: 0, nummern: [] };
  redezeit[k].zeit += f.zeit;
  redezeit[k].nummern.push(f.nummer);
}

/* ---------------------------------------------------------------------------
   4. Bausteine
   --------------------------------------------------------------------------- */
const klickLabel = (schritt) => (schritt === null || schritt === 0 ? 'Start' : 'Klick ' + schritt);

function absatzHtml(f, a, index) {
  const marken = [];
  if (f.uebergabeAus && index === f.gesprochen.length - 1) marken.push({ text: f.uebergabeAus.letzterSatz, vor: '<strong class="uebergabe-satz">', nach: '</strong>' });
  if (f.uebergabeEin && index === 0) marken.push({ text: f.uebergabeEin.ersterSatz, vor: '<strong class="uebergabe-satz">', nach: '</strong>' });
  for (const k of f.kuerzungen || []) {
    marken.push({ text: k.text, vor: `<span class="kurz" title="Kürzungsstufe ${k.stufe}"><span class="kurz-klammer">[</span><span class="kurz-stufe">${k.stufe}</span>`, nach: '<span class="kurz-klammer">]</span></span>' });
  }
  const stuecke = zerlegen(a.text);
  const ohneZitat = !a.text.includes('„');
  const inhalt = stuecke.map((s) => (s.art === 'rede' && !ohneZitat)
    ? `<span class="rede">${markiere(s.text, marken)}</span>`
    : `<span class="regie">${t(s.text)}</span>`).join(' ');
  const label = klickLabel(a.schritt);
  if (index > 0 && f.gesprochen[index - 1].schritt === a.schritt) return `<div class="schritt"><p class="klick"></p><p class="text">${inhalt}</p></div>`;
  return `<div class="schritt"><p class="klick${label === 'Start' ? ' klick--start' : ''}">${label === 'Start' ? '' : PFEIL}${label}</p><p class="text">${inhalt}</p></div>`;
}

function folieHtml(f) {
  const teil = f.teil;
  const zeilen = [];
  for (const n of f.notizen.filter((x) => x.art === 'wechsel')) {
    zeilen.push(`<div class="wechsel"><p class="wechsel-marke">${WECHSEL}</p><p>${t(n.text)}</p></div>`);
  }
  f.gesprochen.forEach((a, i) => zeilen.push(absatzHtml(f, a, i)));
  for (const n of f.notizen.filter((x) => x.art === 'regie')) {
    zeilen.push(`<div class="schritt schritt--regie"><p class="klick"></p><p class="text"><span class="regie">${t(n.text)}</span></p></div>`);
  }
  const hg = f.notizen.filter((x) => x.art === 'hintergrund');
  /* Backup-Folie mit Liste (B1: Quellen): die Notiz rechts neben dem Bild, darunter alle Einträge
     als Text, zweispaltig über die volle Breite (das Vorschaubild ist im Druck nicht lesbar) */
  const liste = f.liste && f.liste.length
    ? `<ul class="quellen-liste">${f.liste.map((q) => `<li>${q.kopf ? `<b>${t(q.kopf)}</b> ` : ''}${t(q.rest)}</li>`).join('')}</ul>`
    : '';
  const notizHaupt = f.backup;
  const hintergrund = hg.length
    ? `<div class="hintergrund${notizHaupt ? ' hintergrund--haupt' : ''}"><p class="hg-titel">Bei Rückfragen <span>(nicht vortragen)</span></p>${hg.map((n) => `<p>${t(n.text)}</p>`).join('')}</div>`
    : '';
  const titel = f.titel || f.kurz;
  const wer = f.backup
    ? '<p class="f-wer f-wer--leer">Backup für Rückfragen</p>'
    : `<p class="f-wer">${marke(teil.sp.marke)}<span>${esc(teil.sp.name)}</span></p>`;
  const zeit = f.backup ? '<p class="f-zeit">nicht vortragen</p>' : `<p class="f-zeit">ab ${mmss(f.start)} · ${f.zeit} s</p>`;
  return `<article class="folie${f.block ? ' folie--trenner' : ''}${liste ? ' folie--liste' : ''}" id="s-${f.id}" data-folie="${f.id}">
  <div class="f-links">
    <img src="${f.bild}" alt="Folie ${esc(f.nummer)} im Endzustand">
    <p class="f-nr">${esc(f.nummer)}</p>
    ${wer}
    ${zeit}
    ${notizHaupt ? '' : hintergrund}
  </div>
  <div class="f-rechts">
    <h3>${t(titel)}</h3>
    ${zeilen.join('\n    ')}
    ${notizHaupt ? hintergrund : ''}
  </div>
  ${liste}
</article>`;
}

/* Faden-Überschrift: Wörter stehen auf der Karminlinie. Gewebt wird wie im Deck nur große
   Schrift (Titelseite, gewebt = true): weben() tastet die Glyphen im Fadenband ab und legt je
   Strich abwechselnd ein Fadenstück vorn (Papierhof) und eine Lücke im Faden (Strich vorn).
   Die 30-pt-Blocknamen werden nicht gewebt, der Faden liegt dort ohne Hof hinter der Schrift
   (wie im Deck unter ca. 120 px, f02 und f20). */
const webe = (s, gewebt = false) => `<span class="webe${gewebt ? ' webe--gewebt' : ''}"><i class="grund" aria-hidden="true"></i>${esc(s)}</span>`;
const fadenZeile = (inhalt, klasse = '') => `<span class="faden-zeile ${klasse}">${inhalt} </span>`;

function teilKopf(teil) {
  const meta = `<dl class="tk-meta">
      <div><dt>Sprecher</dt><dd>${marke(teil.sp.marke)}${esc(teil.sp.name)}</dd></div>
      <div><dt>Folien</dt><dd>${esc(bereich(teil.nummern))}</dd></div>
      <div><dt>Start</dt><dd>${mmss(teil.start)}</dd></div>
      <div><dt>Dauer</dt><dd>${mmss(teil.dauer)} min</dd></div>
      <div><dt>Ende</dt><dd>${mmss(teil.ende)}</dd></div>
    </dl>`;
  if (teil.block) {
    return `<header class="teil-kopf teil-kopf--block">
    <h2 class="tk-zeile faden-zeile"><span class="knoten" aria-label="Block ${teil.block}">${teil.block} </span>${webe(teil.name)}</h2>
    <p class="tk-wer">${t(teil.zusatz || '')}</p>
    ${meta}
  </header>`;
  }
  return `<header class="teil-kopf teil-kopf--rahmen${teil.fliesst ? ' teil-kopf--fliessend' : ''}">
    <h2 class="tk-zeile tk-zeile--rahmen">${esc(teil.name)}</h2>
    <div class="tk-reihe">${teil.fliesst ? '' : `<p class="tk-wer">${t(teil.zusatz || '')}</p>`}${meta}</div>
  </header>`;
}

function teilEnde(teil, i) {
  const naechster = teile[i + 1];
  const name = teil.block ? `Block ${teil.block}` : teil.name;
  let text = `${name} endet bei ${mmss(teil.ende)}.`;
  if (!naechster) {
    text += ` Ende des Vortrags. Rückfragen ab Seite <span data-seite-von="anhang">0</span>, Kürzungsplan und Plan B auf Seite <span data-seite-von="notfall">0</span>.`;
    return `<p class="teil-ende">${text}</p>`;
  }
  const weiter = naechster.block ? `Block ${naechster.block}` : naechster.name;
  if (naechster.sprecher !== teil.sprecher) {
    return `<div class="teil-ende teil-ende--wechsel"><p class="wechsel-marke">${WECHSEL}</p><p>${text} <b>Übergabe an ${esc(naechster.sp.name)}</b>: ${esc(weiter)} ab Seite <span data-seite-von="${naechster.abschnitt}">0</span>.</p></div>`;
  }
  if (naechster.fliesst) return `<p class="teil-ende">${text} Weiter mit dem ${esc(weiter)}.</p>`;
  return `<p class="teil-ende">${text} Weiter mit ${esc(weiter)} auf Seite <span data-seite-von="${naechster.abschnitt}">0</span>.</p>`;
}

/* Sprecher-Zeitleiste der Titelseite (Maße in mm) */
function zeitleiste() {
  const B = 174, x = (s) => (s / gesamt) * B;
  const laeufe = [];
  for (const teil of teile) {
    const l = laeufe.at(-1);
    if (l && l.sprecher === teil.sprecher) { l.bis = teil.ende; l.teile.push(teil); }
    else laeufe.push({ sprecher: teil.sprecher, sp: teil.sp, von: teil.start, bis: teil.ende, teile: [teil] });
  }
  const yBalken = 9.5, h = 6.2;
  let svg = '';
  /* Teilnamen über der Leiste: Blöcke mit Nummer und fett, Rahmen-Teile (Einstieg, Fazit) klein */
  for (const teil of teile) {
    const x0 = x(teil.start);
    const name = teil.block ? `${teil.block}\u2002${teil.name}` : teil.name;
    svg += `<text x="${(x0 + 0.2).toFixed(2)}" y="6.6" class="zl-teil${teil.block ? ' zl-teil--block' : ''}">${esc(name)}</text>`;
  }
  for (const l of laeufe) {
    const x0 = x(l.von), x1 = x(l.bis);
    const gefuellt = l.sp.marke !== 'umrandet';
    svg += `<rect x="${(x0 + 0.25).toFixed(2)}" y="${yBalken}" width="${(x1 - x0 - 0.5).toFixed(2)}" height="${h}" class="${gefuellt ? 'zl-voll' : 'zl-leer'}"/>`;
    /* Blockgrenzen innerhalb eines Sprecher-Laufs */
    for (const teil of l.teile.slice(1)) {
      const xt = x(teil.start);
      svg += gefuellt
        ? `<rect x="${(xt - 0.35).toFixed(2)}" y="${yBalken - 0.2}" width="0.7" height="${h + 0.4}" fill="#fff"/>`
        : `<line x1="${xt.toFixed(2)}" y1="${yBalken}" x2="${xt.toFixed(2)}" y2="${yBalken + h}" class="zl-trenn"/>`;
    }
    /* jedes Blockfeld mit seinem eigenen Folienbereich, mittig im Feld (Abstand zum Rand wird
       nach dem Laden geprüft, siehe „zeitleiste“ im Prüfbericht) */
    for (const teil of l.teile) {
      const t0 = x(teil.start), t1 = x(teil.ende), n = teil.nummern;
      const nr = t1 - t0 < 11 ? `ab ${n[0]}`.slice(t1 - t0 < 8 ? 3 : 0) : n.length <= 2 ? n.join(', ') : `${n[0]} bis ${n.at(-1)}`;
      svg += `<text x="${((t0 + t1) / 2).toFixed(2)}" y="${(yBalken + h / 2 + 1.05).toFixed(2)}" text-anchor="middle" class="zl-nr ${gefuellt ? 'zl-nr-voll' : 'zl-nr-leer'}" data-von="${t0.toFixed(2)}" data-bis="${t1.toFixed(2)}">${esc(nr)}</text>`;
    }
    svg += `<line x1="${x0.toFixed(2)}" y1="${yBalken + h + 0.8}" x2="${x0.toFixed(2)}" y2="${yBalken + h + 2.6}" class="zl-tick"/>`;
    svg += `<text x="${x0.toFixed(2)}" y="${yBalken + h + 6.4}" class="zl-zeit"${x0 > 0 ? ' text-anchor="middle"' : ''}>${mmss(l.von)}</text>`;
  }
  svg += `<line x1="${B}" y1="${yBalken + h + 0.8}" x2="${B}" y2="${yBalken + h + 2.6}" class="zl-tick"/>`;
  svg += `<text x="${B}" y="${yBalken + h + 6.4}" class="zl-zeit" text-anchor="end">${mmss(gesamt)}</text>`;
  return `<svg class="zeitleiste" viewBox="0 0 ${B} 24" role="img" aria-label="Wer spricht wann: Sprecher-Zeitleiste">${svg}</svg>`;
}

/* ---------------------------------------------------------------------------
   5. Seiten: Titelseite, Überblick, Teile, Anhang
   --------------------------------------------------------------------------- */
const f01 = haupt[0] || {};
const titelZeilen = (zusatz.titelZeilen || f01.titelZeilen || []).filter(Boolean);
const titel = titelZeilen.length ? titelZeilen.join(' ') : (f01.titel || 'Recap');
const untertitel = zusatz.untertitel ?? (f01.lead || '');
const anzahlBloecke = teile.filter((x) => x.block).length;
const anzahlSprecher = new Set(teile.map((x) => x.sprecher)).size;

const titelseite = `<section class="titelseite" data-abschnitt="titel">
  <div class="ts-kopf"><span class="ts-art">${esc(zusatz.art || 'Recap')}</span><span>Management im KMU</span></div>
  <div class="ts-mitte">
    <p class="ts-kicker">${esc((fassung && fassung.kicker) || 'Präsentationsskript')}</p>
    <h1 class="ts-titel">${titelZeilen.length ? `${fadenZeile(webe(titelZeilen[0], true))}<span class="ts-zeile2">${esc(titelZeilen.slice(1).join(' '))}</span>` : fadenZeile(webe(titel, true))}</h1>
    <p class="ts-unter">${t(untertitel)}</p>
  </div>
  <div class="ts-zahlen">
    <p><b>${folien.length}</b><span>Folien</span></p>
    <p><b>${mmss(gesamt)}</b><span>Sollzeit in Minuten</span></p>
    <p><b>${anzahlBloecke}</b><span>Blöcke</span></p>
    ${anzahlSprecher === 1 && zusatz.titelZahl ? `<p><b>${esc(zusatz.titelZahl.wert)}</b><span>${esc(zusatz.titelZahl.text)}</span></p>` : `<p><b>${anzahlSprecher}</b><span>Sprecher</span></p>`}
  </div>
  <div class="ts-leiste">
    <p class="ts-leiste-titel">${esc(zusatz.leisteTitel || 'Wer spricht wann')}</p>
    ${zeitleiste()}
    <p class="legende">${Object.entries(sprecher).filter(([k]) => redezeit[k]).map(([k, s]) => `<span>${marke(s.marke)}<b>${esc(s.name)}</b> ${mmss(redezeit[k].zeit)} min</span>`).join('')}<span class="legende-hinweis">Startzeiten in Minuten ab Vortragsbeginn</span></p>
  </div>
  <p class="ts-fuss"><span>${t((zusatz.fusszeile || [])[0] || '')}</span><span>${t((zusatz.fusszeile || [])[1] || '')}</span><span>Stand ${esc(zusatz.stand || '')}</span></p>
</section>`;

const ablaufZeilen = teile.map((teil) => `<tr>
      <td class="a-nr">${teil.block ? `<span class="a-knoten">${teil.block}</span>` : ''}</td>
      <td class="a-teil"><b>${esc(teil.name)}</b><span>${t(teil.zusatz || '')}</span></td>
      <td>${esc(bereich(teil.nummern))}</td>
      <td class="a-wer">${marke(teil.sp.marke)}${esc(teil.sp.name)}</td>
      <td class="z">${mmss(teil.start)}</td><td class="z">${mmss(teil.dauer)}</td>
      <td class="z"><span data-seite-von="${teil.abschnitt}">0</span></td></tr>`).join('');

/* Zwischenzeiten: wenn die erste Folie des nächsten Teils erscheint; dazu, was der Kürzungsplan
   ab dort noch bringt (Stufe 1 / beide Stufen) */
const zwischen = teile.map((teil, i) => {
  const naechster = teile[i + 1];
  const erste = naechster?.folienListe[0];
  const wann = naechster ? esc(erste?.nummer || '') : 'Ende';
  const was = `${teil.block ? 'Block ' + teil.block : teil.name}${naechster && naechster.sprecher !== teil.sprecher ? ', Übergabe' : ''}`;
  const rest = erste ? restAb(erste) : [0, 0];
  const restText = rest[1] ? `${rest[0]} / ${rest[1]} s` : '–';
  return `<tr><td class="zw-wann">${wann}</td><td class="zw-was">${t(was)}</td><td class="z zw-zeit">${mmss(teil.ende)}</td><td class="z zw-rest">${restText}</td></tr>`;
}).join('');

const uebergabeZeilen = uebergaben.filter((u) => u.vorher).map((u) => `<tr>
      <td>nach ${esc(u.vorher.nummer)}<span class="zeile2">bei ${mmss(u.zeit)}</span></td>
      <td>${marke(sprecher[u.von]?.marke)}${esc(sprecher[u.von]?.name || u.von)}<span class="zeile2">an ${esc(sprecher[u.an]?.name || u.an)}</span></td>
      <td class="satz">„${t(u.letzterSatz)}“</td>
      <td class="satz">„${t(u.ersterSatz)}“</td></tr>`).join('');

const lesehilfe = `<dl class="lesehilfe">
      <div><dt><span class="klick klick--start">Start</span></dt><dd>sprechen, sobald die Folie erscheint</dd></div>
      <div><dt><span class="klick">${PFEIL}Klick 2</span></dt><dd>erst klicken, dann sprechen</dd></div>
      <div><dt><span class="regie">kursiv</span></dt><dd>Regie: tun, nicht sagen</dd></div>
      ${uebergaben.length ? '<div><dt><strong class="uebergabe-satz">fett</strong></dt><dd>Übergabesatz, wörtlich wie unten</dd></div>' : ''}
      <div><dt><span class="kurz"><span class="kurz-klammer">[</span><span class="kurz-stufe">1</span>grau<span class="kurz-klammer">]</span></span></dt><dd>entfällt bei Zeitnot, Stufe 1 oder 2 (Seite <span data-seite-von="notfall">0</span>)</dd></div>
      <div><dt><span class="hg-muster">Bei Rückfragen</span></dt><dd>Randnotiz, nicht vortragen</dd></div>
      <div><dt><span class="f-zeit">ab 3:03 · 45 s</span></dt><dd>Start ab Vortragsbeginn, Sollzeit der Folie</dd></div>
      <div><dt class="lesehilfe-sprecher">${Object.values(sprecher).map((s) => `<span>${marke(s.marke)}${esc(s.rufname || s.name)}</span>`).join('')}</dt><dd>${Object.keys(sprecher).length > 1 ? 'Sprecher: Marke gefüllt oder umrandet, Name immer dabei' : 'Sprecher'}</dd></div>
    </dl>`;

/* {redezeit} in den Aufteilungs-Sätzen: Redezeit je Sprecher, aus data-zeit gerechnet */
const redezeitText = Object.entries(sprecher).filter(([k]) => redezeit[k])
  .map(([k, s]) => `${esc(s.rufname || s.name)} ${mmss(redezeit[k].zeit)}\u00A0min`).join(', ');
const ueberblick = `<section class="ueberblick" data-abschnitt="ueberblick">
  <h2 class="seitentitel">Überblick</h2>
  <table class="ablauf">
    <colgroup><col style="width:7mm"><col><col style="width:31mm"><col style="width:35mm"><col style="width:13mm"><col style="width:13mm"><col style="width:12mm"></colgroup>
    <thead><tr><th></th><th>Teil</th><th>Folien</th><th>Sprecher</th><th class="z">Start</th><th class="z">Dauer</th><th class="z">Seite</th></tr></thead>
    <tbody>${ablaufZeilen}</tbody>
    <tfoot>
      <tr class="a-anhang"><td></td><td class="a-teil"><b>Anhang</b><span>Rückfragen, Quellen, Kürzungsplan, Plan B</span></td><td>${esc(backups.map((b) => b.nummer).join(', ')) || '–'}</td><td class="a-wer">${Object.keys(sprecher).length > 1 ? 'beide' : esc(Object.values(sprecher)[0]?.name || '')}</td><td class="z">–</td><td class="z">–</td><td class="z"><span data-seite-von="anhang">0</span></td></tr>
      <tr class="a-summe"><td></td><td><b>Zusammen</b></td><td>${folien.length} Folien</td><td></td><td></td><td class="z"><b>${mmss(gesamt)}</b></td><td></td></tr>
    </tfoot>
  </table>
  <div class="ue-raster">
    <div>
      <h3>So liest du das Skript</h3>
      ${lesehilfe}
    </div>
    <div>
      <h3>Zwischenzeiten</h3>
      <p class="ue-hinweis">Auf die Uhr sehen, wenn die Folie erscheint:</p>
      <table class="zwischen">
        <thead><tr><th>Folie</th><th>Ende von</th><th class="z">Soll</th><th class="z">noch kürzbar<span class="th2">Stufe&nbsp;1 / beide</span></th></tr></thead>
        <tbody>${zwischen}</tbody>
      </table>
    </div>
  </div>
  ${uebergabeZeilen ? `<h3>Übergaben, wörtlich</h3>
  <table class="uebergaben">
    <thead><tr><th>Wann</th><th>Wer übergibt</th><th>Letzter Satz</th><th>Erster Satz danach</th></tr></thead>
    <tbody>${uebergabeZeilen}</tbody>
  </table>` : ''}
  ${(zusatz.aufteilung || []).length ? `<h3>${esc(zusatz.aufteilungTitel || 'Aufteilung')}</h3>
  <div class="aufteilung">
    ${(zusatz.aufteilung || []).map((p) => `<p>${t(p).replace('{redezeit}', redezeitText)}</p>`).join('\n    ')}
  </div>` : ''}
</section>`;

const koerper = teile.map((teil, i) => `<section class="teil" data-abschnitt="${teil.abschnitt}">
  ${teilKopf(teil)}
  ${teil.folienListe.map(folieHtml).join('\n')}
  ${teilEnde(teil, i)}
</section>`).join('\n');

const rueckfragen = (zusatz.rueckfragen || []).map((r) => {
  const f = nachId.get(r.folie);
  if (!f) warnungen.push(`Rückfrage „${r.frage}“: Folie ${r.folie} gibt es nicht.`);
  return `<div class="rf"><p class="rf-nr">${esc(f ? f.nummer : r.folie)}</p><div><p class="rf-frage">${t(r.frage)}</p><p class="rf-antwort">${t(r.antwort)}</p></div></div>`;
}).join('\n  ');

/* Satzanfang für die Liste; der ganze Satz steht grau in [ ] im Sprechtext */
const satzanfang = (text, max = 62) => {
  if (text.length <= max) return text;
  const schnitt = text.slice(0, max);
  return schnitt.slice(0, schnitt.lastIndexOf(' ')).replace(/[\s,;:–]+$/, '') + ' …';
};
const stufeSumme = (st) => `${st.saetze.length} Sätze, ${st.summe} s` +
  (st.nr > 1 ? ` (mit Stufe ${st.nr === 2 ? '1' : '1 bis ' + (st.nr - 1)}: ${mmss(st.kumuliert)} min)` : '');
const kuerzungHtml = stufen.map((st) => `<div class="stufe">
    <p class="stufe-kopf"><span class="stufe-name">${esc(st.name)}</span><span class="stufe-ziel">${esc(st.ziel || '')}</span><span class="stufe-summe">${stufeSumme(st)}</span></p>
    <ol class="kuerzungen">${st.saetze.map((s) => `<li>
      <span class="k-wo"><b>${esc(s.folienNr)}</b> ${esc(klickLabel(s.schritt ?? null))}</span>
      <span class="k-wer">${marke(s.sp?.marke)}${esc(s.sp?.rufname || '')}</span>
      <span class="k-satz">„${t(satzanfang(s.text))}“</span>
      <span class="k-sek">${s.sekunden} s</span></li>`).join('')}</ol>
  </div>`).join('\n  ');

/* Regel mit Platzhaltern: {rest:<id>} = was alle Stufen ab dieser Folie noch bringen,
   {seite:<abschnitt>} = gemessene Seitenzahl */
const regelText = t((zusatz.kuerzung || {}).regel || '')
  .replace(/\{rest:([a-z]\d+)\}/g, (_, id) => {
    const f = nachId.get(id);
    if (!f || f.backup) { warnungen.push(`Kürzungsregel: Folie ${id} für {rest:${id}} gibt es nicht.`); return '?'; }
    return `${restAb(f)[1]} s`;
  })
  .replace(/\{seite:([a-z0-9]+)\}/g, (_, ab) => `<span data-seite-von="${ab}">0</span>`);

/* Anhang: zuerst die Rückfragen (das Wichtigste beim Nachschlagen), dann die Quellenfolie mit
   allen Einträgen als Text, Kürzungsplan und Plan B auf eigener Seite */
const anhang = `<section class="anhang" data-abschnitt="anhang">
  <header class="teil-kopf teil-kopf--rahmen">
    <h2 class="tk-zeile tk-zeile--rahmen">Anhang</h2>
    <p class="tk-wer">Rückfragen, Quellen, Kürzungsplan und Plan B. Nur nutzen, wenn gefragt wird oder etwas hängt.</p>
  </header>
  <h3 class="anhang-titel anhang-titel--erst">Rückfragen</h3>
  <p class="anhang-hinweis">Erwartbare Fragen mit Kurzantwort, belegt durch Sprechtext, Hintergrundnotizen und Quellen. Die Nummer nennt die Folie.</p>
  <div class="rf-spalten">
  ${rueckfragen}
  </div>
  ${backups.map(folieHtml).join('\n')}
  <div class="notfall">
  <h3 class="notfall-titel">Kürzungsplan und Plan B</h3>
  <h3 class="anhang-titel">Kürzungsplan</h3>
  <p class="anhang-hinweis">${regelText} Sekunden gerechnet wie die Sollzeiten, ${wpm} Wörter pro Minute.</p>
  ${kuerzungHtml}
  <h3 class="anhang-titel">Plan B</h3>
  <dl class="planb-liste">${(zusatz.planb || []).map((p) => `<div><dt>${t(p.fall)}</dt><dd>${t(p.tun)}</dd></div>`).join('')}</dl>
  </div>
</section>`;

/* ---------------------------------------------------------------------------
   6. Satz (CSS): A4, Seitenkopf je Teil, Faden nur in Karmin
   --------------------------------------------------------------------------- */
const fusstext = `Präsentationsskript: ${titel}`;
const kopfRegeln = [
  `@page ueberblick { @top-left { content: "Überblick"; } }`,
  `@page anhang { @top-left { content: "Anhang"; } @top-right { content: "Rückfragen, Quellen, Kürzungsplan, Plan B"; } }`,
  ...teile.filter((teil) => !teil.fliesst).map((teil) => `@page ${teil.seitenname} { @top-left { content: "${teil.kopf.replace(/"/g, '\\"')}"; } @top-right { content: ${markeUrl(teil.sp.marke)} "\\2002 ${teil.sp.name.replace(/"/g, '\\"')}"; } }`)
].join('\n');

const css = `
@font-face { font-family: "Fraunces Skript"; src: url("${schrift('fraunces-latin-opsz-normal.woff2')}") format("woff2"); font-weight: 100 900; font-style: normal;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Fraunces Skript"; src: url("${schrift('fraunces-latin-ext-opsz-normal.woff2')}") format("woff2"); font-weight: 100 900; font-style: normal;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "Fraunces Skript"; src: url("${schrift('fraunces-latin-full-italic.woff2')}") format("woff2"); font-weight: 100 900; font-style: italic;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Fraunces Skript"; src: url("${schrift('fraunces-latin-ext-full-italic.woff2')}") format("woff2"); font-weight: 100 900; font-style: italic;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
/* Umbrechende Überschriften (Titel, Folientitel, Knoten): dieselbe Fraunces, aber das Leerzeichen kommt
   aus einer Systemschrift. Chrome setzt die PDF-Lesezeichen aus den Überschriften und verliert bei
   Variable Fonts das Leerzeichen am Zeilenumbruch („zerschneidetden“); mit white-space: pre-wrap und
   diesem Leerzeichen bleibt es. Einzeilige Überschriften behalten die volle Fraunces (sonst doppelt
   Chrome dort den Lesezeichen-Text). */
@font-face { font-family: "Fraunces Titel"; src: url("${schrift('fraunces-latin-opsz-normal.woff2')}") format("woff2"); font-weight: 100 900; font-style: normal;
  unicode-range: U+0021-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Fraunces Titel"; src: url("${schrift('fraunces-latin-ext-opsz-normal.woff2')}") format("woff2"); font-weight: 100 900; font-style: normal;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "Franklin Skript"; src: url("${schrift('libre-franklin-latin-wght-normal.woff2')}") format("woff2"); font-weight: 100 900;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Franklin Skript"; src: url("${schrift('libre-franklin-latin-ext-wght-normal.woff2')}") format("woff2"); font-weight: 100 900;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }

/* Seiten: Kopf links der Teil, rechts der Sprecher; Fuß mit Seitenzahl */
@page {
  size: A4; margin: 22mm 18mm 19mm 18mm;
  @top-left { font: 600 8pt/1 "Franklin Skript", sans-serif; color: #161B27; vertical-align: bottom; padding-bottom: 6.5mm; }
  @top-right { font: 400 8pt/1 "Franklin Skript", sans-serif; color: #161B27; vertical-align: bottom; padding-bottom: 6.5mm; }
  @bottom-left { content: "${fusstext.replace(/"/g, '\\"')}"; font: 400 7.5pt/1 "Franklin Skript", sans-serif; color: #586070; vertical-align: top; padding-top: 7mm; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 500 7.5pt/1 "Franklin Skript", sans-serif; color: #586070; vertical-align: top; padding-top: 7mm; font-variant-numeric: tabular-nums; }
}
@page titel { margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }
${kopfRegeln}

:root {
  --papier: #FFFFFF; --tinte: #161B27; --schiefer: #586070; --mittel: #737B8B; --nebel: #A9B0BB; --karmin: ${zusatz.akzent || '#C0132D'};
  --links: 46mm; --rinne: 6mm; --marke-spalte: 15mm; --marke-rinne: 3mm;
}
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: var(--papier); }
body { margin: 0; font: 400 9.5pt/1.45 "Franklin Skript", Arial, sans-serif; color: var(--tinte); font-variant-numeric: lining-nums; font-kerning: normal; hyphens: auto; -webkit-hyphens: auto; hyphenate-limit-chars: 8 4 3; }
h1, h2, h3, h4 { margin: 0; font-family: "Fraunces Skript", Georgia, serif; font-weight: 450; font-variation-settings: "WONK" 0; font-optical-sizing: auto; hyphens: manual; white-space: pre-wrap; }
p { margin: 0; orphans: 2; widows: 2; }
b, strong { font-weight: 650; }
.z { text-align: right; font-variant-numeric: tabular-nums lining-nums; white-space: nowrap; }
.marke { display: inline-block; width: 2.5mm; height: 2.5mm; margin-right: 1.5mm; vertical-align: -0.2mm; flex: none; }
.marke svg { display: block; width: 100%; height: 100%; }

/* ---------- Faden: Karminlinie knapp unter der Grundlinie (+0,12 em), Unterlängen gewebt.
   Die Linie bleibt im Satzspiegel (Chrome schneidet im Druck am Seitenrand ab, und
   Überstand würde das ganze PDF verkleinern); nur die Titelseite ist randabfallend. ---------- */
.faden-zeile { position: relative; z-index: 0; display: block; --faden-y: 1.1em; --faden-dicke: 0.034em; --hof: 0.045em; }
.faden-zeile::before { content: ""; position: absolute; z-index: -1; left: var(--faden-links, 0); right: var(--faden-rechts, 0);
  top: var(--faden-y); height: var(--faden-dicke); margin-top: calc(var(--faden-dicke) / -2); background: var(--karmin); }
.webe { display: inline-block; }
.webe .grund { display: inline-block; width: 0; height: 0; vertical-align: baseline; }
.faden-zeile .vorne { position: absolute; z-index: 3; top: var(--faden-y); height: var(--faden-dicke); margin-top: calc(var(--faden-dicke) / -2); }
.faden-zeile .vorne::before { content: ""; position: absolute; left: 0; right: 0; top: calc(-1 * var(--hof)); bottom: calc(-1 * var(--hof)); background: var(--papier); }
.faden-zeile .vorne::after { content: ""; position: absolute; inset: 0; background: var(--karmin); }
/* Lücke „hinten“: Papier über dem Faden, unter der Schrift (gleicher Stapel wie der Faden, später im DOM) */
.faden-zeile .luecke { position: absolute; z-index: -1; top: var(--faden-y); height: calc(var(--faden-dicke) + 0.01em);
  margin-top: calc((var(--faden-dicke) + 0.01em) / -2); background: var(--papier); }

/* ---------- Titelseite ---------- */
.titelseite { page: titel; position: relative; height: 296.5mm; overflow: hidden; padding: 15mm 18mm 13mm; display: flex; flex-direction: column; break-after: page; }
.ts-kopf { display: flex; justify-content: space-between; font-size: 9pt; color: var(--schiefer); }
.ts-art { font-weight: 650; color: var(--tinte); }
.ts-mitte { margin-top: 44mm; }
.ts-kicker { font-size: 12pt; font-weight: 600; margin-bottom: 7mm; }
.ts-titel, .f-rechts h3 { font-family: "Fraunces Titel", "Liberation Serif", Georgia, serif; }
/* wie der Titel auf f01 (recap.css .folie.r-titel): 410, −0,025 em, optische Größe 144 */
.ts-titel { font-size: 58pt; line-height: 1.04; letter-spacing: -0.025em; font-weight: 410; font-variation-settings: "opsz" 144, "WONK" 0; }
.ts-titel .faden-zeile { --faden-links: -18mm; --faden-rechts: -18mm; --faden-dicke: 0.036em; }
.ts-zeile2 { display: block; }
.ts-unter { margin-top: 9mm; font-size: 13pt; line-height: 1.35; max-width: none; text-wrap-style: balance; }
.ts-zahlen { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 6mm; margin-top: auto; }
.ts-zahlen p { display: flex; flex-direction: column; gap: 1mm; }
.ts-zahlen b { font: 450 25pt/1 "Fraunces Skript", Georgia, serif; font-variant-numeric: lining-nums tabular-nums; letter-spacing: -0.01em; }
.ts-zahlen span { font-size: 8.5pt; color: var(--schiefer); }
.ts-leiste { margin-top: 13mm; }
.ts-leiste-titel { font-weight: 650; font-size: 9pt; margin-bottom: 1mm; }
.zeitleiste { display: block; width: 174mm; height: auto; overflow: visible; }
.zl-voll { fill: var(--tinte); }
.zl-leer { fill: var(--papier); stroke: var(--tinte); stroke-width: 0.32; }
.zl-trenn { stroke: var(--tinte); stroke-width: 0.25; }
.zl-tick { stroke: var(--mittel); stroke-width: 0.25; }
.zl-teil { font: 400 2.35px "Franklin Skript", sans-serif; fill: var(--schiefer); }
.zl-teil--block { fill: var(--tinte); font-weight: 600; font-size: 2.55px; }
.zl-nr-voll { font: 600 2.6px "Franklin Skript", sans-serif; fill: #fff; }
.zl-nr-leer { font: 600 2.6px "Franklin Skript", sans-serif; fill: var(--tinte); }
.zl-zeit { font: 400 2.6px "Franklin Skript", sans-serif; fill: var(--schiefer); font-variant-numeric: tabular-nums; }
.legende { display: flex; flex-wrap: wrap; gap: 2mm 7mm; margin-top: 3mm; font-size: 9pt; align-items: center; }
.legende span { display: inline-flex; align-items: center; }
.legende b { margin-right: 1.2mm; }
.legende-hinweis { color: var(--schiefer); margin-left: auto; font-size: 8pt; }
.ts-fuss { display: flex; justify-content: space-between; gap: 6mm; margin-top: 14mm; padding-top: 3mm; border-top: 0.6pt solid var(--nebel); font-size: 8pt; color: var(--schiefer); }

/* ---------- Überblick ---------- */
.ueberblick { page: ueberblick; }
.seitentitel { font-size: 24pt; line-height: 1.1; margin: 0 0 3mm; }
.ueberblick h3, .anhang-titel { font: 600 10.5pt/1.3 "Franklin Skript", sans-serif; margin: 5.2mm 0 1.8mm; }
.ueberblick h3 { margin: 4.4mm 0 1.6mm; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-weight: 600; font-size: 8pt; color: var(--schiefer); padding: 0 2.5mm 1.6mm 0; border-bottom: 0.9pt solid var(--tinte); }
td { padding: 1.6mm 2.5mm 1.6mm 0; border-bottom: 0.5pt solid var(--nebel); vertical-align: baseline; }
th.z, td.z { padding-right: 0; padding-left: 2mm; }
.ablauf { font-size: 9.3pt; }
.ablauf td { padding-top: 0.95mm; padding-bottom: 0.95mm; }
.ablauf .a-nr { width: 7mm; }
.a-knoten { font: 500 13pt/1 "Fraunces Skript", Georgia, serif; }
.a-teil b { font-weight: 650; display: block; }
.a-teil span { font-size: 8pt; line-height: 1.3; color: var(--schiefer); display: block; }
.a-wer { white-space: nowrap; }
.ablauf { table-layout: fixed; }
.ablauf .a-anhang td { border-top: 0.9pt solid var(--tinte); }
.ablauf .a-summe td { border-bottom: 0; }
.ue-raster { display: grid; grid-template-columns: 1.25fr 1fr; column-gap: 9mm; }
.lesehilfe { margin: 0; display: grid; row-gap: 1.1mm; font-size: 8.5pt; line-height: 1.3; }
.lesehilfe div { display: grid; grid-template-columns: 25mm 1fr; column-gap: 3mm; align-items: baseline; }
.lesehilfe dd { margin: 0; color: var(--schiefer); }
.lesehilfe dt .regie { font-size: 10pt; }
.lesehilfe-sprecher { display: flex; flex-direction: column; gap: 0.8mm; font-size: 8.8pt; }
.lesehilfe-sprecher span { display: inline-flex; align-items: center; }
.hg-muster { display: inline-block; font-size: 7.6pt; font-weight: 650; padding-top: 0.8mm; border-top: 0.6pt solid var(--nebel); color: var(--tinte); }
.ue-hinweis { font-size: 8.8pt; color: var(--schiefer); margin-bottom: 1.5mm; }
.zwischen { font-size: 9pt; }
.zwischen th { font-size: 7.5pt; padding-bottom: 1.2mm; }
.zwischen td { padding: 0.95mm 2mm 0.95mm 0; }
.zwischen .th2 { display: block; font-weight: 400; }
.zw-wann { font-weight: 650; white-space: nowrap; }
.zw-was { color: var(--schiefer); font-size: 8.5pt; }
.zw-zeit { font: 500 12pt/1 "Fraunces Skript", Georgia, serif; }
.zwischen td.zw-rest { font-size: 8.5pt; color: var(--schiefer); font-variant-numeric: tabular-nums lining-nums; }
.uebergaben { font-size: 9pt; }
.uebergaben td { padding-top: 1.3mm; padding-bottom: 1.3mm; }
.uebergaben .zeile2 { display: block; font-size: 8pt; color: var(--schiefer); }
.uebergaben .satz { font-size: 9.5pt; }
.aufteilung { font-size: 8.8pt; line-height: 1.4; color: var(--tinte); display: grid; row-gap: 1.4mm; max-width: 120mm; }

/* ---------- Teile ---------- */
.teil { break-before: page; }
${teile.map((x) => `.teil[data-abschnitt="${x.abschnitt}"] { page: ${x.seitenname};${x.fliesst ? ' break-before: auto; break-inside: avoid; margin-top: 1mm;' : ''} }`).join('\n')}
.anhang { page: anhang; break-before: page; }
.teil-kopf { padding-bottom: 4mm; margin-bottom: 1mm; break-after: avoid; }
.tk-zeile { font-size: 30pt; line-height: 1.1; letter-spacing: -0.01em; display: flex; align-items: baseline; gap: 3.5mm; }
.tk-zeile.faden-zeile { padding-left: 10mm; --faden-dicke: 0.05em; --hof: 0.055em; }
.knoten { position: relative; z-index: 2; font: 500 30pt/1 "Fraunces Titel", "Liberation Serif", Georgia, serif; font-variant-numeric: lining-nums; background: var(--papier); padding: 0.4mm 1.8mm; transform: translateY(0.34em); }
.tk-zeile--rahmen { font-size: 24pt; padding-bottom: 1.8mm; border-bottom: 1.2pt solid var(--tinte); display: block; }
.tk-reihe { display: flex; align-items: flex-end; justify-content: space-between; gap: 8mm; margin-top: 2.6mm; }
.tk-reihe .tk-wer { margin: 0; }
.tk-reihe .tk-meta { margin: 0; }
.teil-kopf--rahmen { padding-bottom: 2.5mm; }
/* Teil, der auf der Seite des vorigen weiterläuft: schlanker Kopf, Linie oben */
.teil-kopf--fliessend { display: flex; align-items: baseline; gap: 6mm; padding: 2.2mm 0 0.6mm; border-top: 1.2pt solid var(--tinte); }
.teil-kopf--fliessend .tk-zeile--rahmen { font-size: 18pt; border: 0; padding: 0; }
.teil-kopf--fliessend .tk-reihe { flex: 1; margin: 0; align-items: baseline; }
.teil-kopf--fliessend .tk-meta { gap: 1mm 5mm; }
.teil-kopf--fliessend .tk-meta div { flex-direction: row; align-items: baseline; gap: 1.2mm; }
.tk-wer { margin-top: 3.5mm; font-size: 10.5pt; color: var(--schiefer); }
.tk-meta { display: flex; flex-wrap: wrap; gap: 1.5mm 9mm; margin: 4mm 0 0; font-size: 9pt; }
.tk-meta div { display: flex; flex-direction: column; gap: 0.4mm; }
.tk-meta dt { font-size: 7.5pt; color: var(--schiefer); }
.tk-meta dd { margin: 0; font-weight: 600; display: inline-flex; align-items: center; font-variant-numeric: tabular-nums lining-nums; }

/* ---------- Folie ---------- */
.folie { display: grid; grid-template-columns: var(--links) 1fr; column-gap: var(--rinne); padding: 4.2mm 0 4.6mm; border-top: 0.6pt solid var(--nebel); break-inside: avoid; }
.teil-kopf + .folie, .anhang > .teil-kopf + .folie { border-top-color: transparent; }
.f-links img { display: block; width: var(--links); height: auto; aspect-ratio: 16 / 9; border: 0.5pt solid var(--nebel); }
.f-nr { margin-top: 2.6mm; font: 500 20pt/1 "Fraunces Skript", Georgia, serif; font-variant-numeric: lining-nums tabular-nums; letter-spacing: -0.01em; }
.f-wer { display: flex; align-items: center; margin-top: 2.2mm; font-size: 8.8pt; font-weight: 600; }
.f-wer--leer { font-weight: 400; color: var(--schiefer); }
.f-zeit { margin-top: 1mm; font-size: 8.8pt; color: var(--schiefer); font-variant-numeric: tabular-nums lining-nums; }
/* zweizeilige Titel ausgeglichen (kein einzelnes Wort in Zeile 2); Langform, damit white-space: pre-wrap bleibt */
.f-rechts h3 { font-size: 13.5pt; line-height: 1.2; font-weight: 500; letter-spacing: -0.003em; margin: -0.6mm 0 3mm; break-after: avoid; text-wrap-style: balance; }
.schritt { display: grid; grid-template-columns: var(--marke-spalte) 1fr; column-gap: var(--marke-rinne); align-items: first baseline; margin: 0 0 2.2mm; break-inside: avoid; }
.klick { font: 750 10pt/1.2 "Franklin Skript", sans-serif; color: var(--tinte); white-space: nowrap; display: inline-flex; align-items: baseline; gap: 1.2mm; }
.klick--start { font-weight: 600; font-size: 9.5pt; color: var(--schiefer); }
.pfeil { width: 2.9mm; height: 2.9mm; fill: var(--tinte); flex: none; align-self: center; }
/* Sprechtext und Regie ohne Silbentrennung: Flattersatz mit rund 53 Zeichen braucht sie nicht, und
   getrennte Wörter stören beim Vorlesen. Automatisch getrennt wird nur in den schmalen Randnotizen. */
.text { font-size: 11pt; line-height: 1.42; hyphens: manual; -webkit-hyphens: manual; }
.rede { color: var(--tinte); }
.regie { font: italic 400 10.2pt/1.38 "Fraunces Skript", Georgia, serif; color: var(--schiefer); font-variation-settings: "WONK" 0; hyphens: manual; -webkit-hyphens: manual; }
.schritt--regie .text { line-height: 1.3; }
.uebergabe-satz { font-weight: 700; white-space: nowrap; }
.kurz { color: var(--schiefer); }
.kurz-klammer { font-weight: 700; color: var(--tinte); }
.kurz-stufe { font-size: 0.62em; font-weight: 700; vertical-align: 0.42em; margin: 0 0.12em 0 0.05em; color: var(--tinte); }
.wechsel, .teil-ende--wechsel { display: grid; grid-template-columns: var(--marke-spalte) 1fr; column-gap: var(--marke-rinne); align-items: center; margin: 0 0 3.4mm; padding: 2mm 0; border-top: 1.4pt solid var(--tinte); border-bottom: 0.6pt solid var(--tinte); font-weight: 650; font-size: 10pt; line-height: 1.35; break-inside: avoid; }
.wechsel-zeichen { width: 6mm; height: 4.6mm; color: var(--tinte); display: block; }
.hintergrund { margin-top: 4mm; padding-top: 1.8mm; border-top: 0.6pt solid var(--nebel); font-size: 7.5pt; line-height: 1.33; color: var(--schiefer); hyphens: auto; }
.hintergrund p + p { margin-top: 1mm; }
.hg-titel { font-weight: 650; font-size: 7.4pt; color: var(--tinte); margin-bottom: 0.8mm; }
.hg-titel span { font-weight: 400; color: var(--schiefer); }
.hintergrund--haupt { margin-top: 0; font-size: 8.8pt; line-height: 1.45; }
.hintergrund--haupt .hg-titel { font-size: 8.4pt; }
/* Randnotiz rechts unter Sprechtext und Regie, wenn die Folie dadurch deutlich niedriger wird
   (Trennfolien, kurze Sprechtexte; notizenSetzen() misst das nach dem Laden) */
.f-rechts > .hintergrund--rechts { margin: 3.2mm 0 0 calc(var(--marke-spalte) + var(--marke-rinne)); max-width: 100mm; }
/* Quellenfolie: alle Einträge als Text (Autor und Jahr Tinte, Rest Schiefer, hängender Einzug) */
.quellen-liste { grid-column: 1 / -1; columns: 2; column-gap: 8mm; list-style: none; margin: 4mm 0 0; padding: 3mm 0 0; border-top: 0.6pt solid var(--nebel); font-size: 8pt; line-height: 1.32; color: var(--schiefer); }
.quellen-liste li { padding-left: 3.5mm; text-indent: -3.5mm; margin-bottom: 1.05mm; break-inside: avoid; }
.quellen-liste b { font-weight: 600; color: var(--tinte); }
.folie--liste .hintergrund--haupt { max-width: 112mm; }
.teil-ende { margin-top: 1mm; padding-top: 3mm; border-top: 0.6pt solid var(--nebel); font-size: 9pt; color: var(--schiefer); break-before: avoid; break-inside: avoid; }
.teil-ende--wechsel { color: var(--tinte); font-weight: 400; font-size: 9.5pt; padding-top: 2.2mm; }
.teil-ende--wechsel b { font-weight: 700; }

/* ---------- Anhang ---------- */
.anhang-hinweis { font-size: 8.8pt; color: var(--schiefer); max-width: 120mm; margin-bottom: 2mm; }
.anhang-titel--erst { margin-top: 3mm; }
/* Antworten auf rund 78 Zeichen je Zeile begrenzt: mit einem Blick zu finden */
.rf { display: grid; grid-template-columns: 11mm minmax(0, 125mm); column-gap: 3mm; padding: 2.4mm 0; border-bottom: 0.5pt solid var(--nebel); break-inside: avoid; }
.rf-nr { font: 500 12pt/1.15 "Fraunces Skript", Georgia, serif; font-variant-numeric: lining-nums; }
.rf-frage { font-weight: 650; font-size: 9.6pt; line-height: 1.33; }
.rf-antwort { font-size: 9.2pt; line-height: 1.42; margin-top: 0.6mm; }
/* zwei Spalten: kurze Zeilen (rund 45 Zeichen), mit einem Blick zu finden; jede Frage bleibt ganz */
.rf-spalten { columns: 2; column-gap: 8mm; }
.rf-spalten .rf { grid-template-columns: 9mm minmax(0, 1fr); column-gap: 2.5mm; padding: 2.2mm 0 2.4mm; }
.anhang-titel, .anhang-hinweis { break-after: avoid; }
.notfall { break-before: page; }
.notfall-titel { font-size: 24pt; line-height: 1.1; padding-bottom: 1.8mm; border-bottom: 1.2pt solid var(--tinte); margin-bottom: 1mm; break-after: avoid; }
.notfall .anhang-titel { margin-top: 4.5mm; }
.notfall .anhang-hinweis { font-size: 8.5pt; line-height: 1.38; }
.stufe { margin-top: 3mm; }
.stufe-kopf { break-after: avoid; }
.stufe-kopf { font: 600 10pt/1.3 "Franklin Skript", sans-serif; display: flex; align-items: baseline; gap: 3mm; padding-bottom: 1.4mm; border-bottom: 0.9pt solid var(--tinte); }
.stufe-ziel { font: 500 13pt/1 "Fraunces Skript", Georgia, serif; }
.stufe-summe { margin-left: auto; font-weight: 400; font-size: 8.5pt; color: var(--schiefer); }
.kuerzungen { list-style: none; margin: 0; padding: 0; }
.kuerzungen li { display: grid; grid-template-columns: 19mm 21mm 1fr 10mm; column-gap: 3mm; padding: 0.7mm 0; border-bottom: 0.5pt solid var(--nebel); font-size: 8.8pt; line-height: 1.32; align-items: baseline; break-inside: avoid; }
.k-wo b { font: 500 11pt/1 "Fraunces Skript", Georgia, serif; margin-right: 1mm; }
.k-wo { white-space: nowrap; font-size: 8.5pt; color: var(--schiefer); }
.k-wer { display: inline-flex; align-items: center; font-size: 8.5pt; }
.k-sek { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.planb-liste { margin: 0; }
.planb-liste div { display: grid; grid-template-columns: 46mm 1fr; column-gap: 5mm; padding: 1.6mm 0; border-bottom: 0.5pt solid var(--nebel); break-inside: avoid; }
.planb-liste dt { font-weight: 650; font-size: 9.8pt; }
.planb-liste dd { margin: 0; font-size: 9.1pt; line-height: 1.4; }

`;

/* Webung wie recap.js weben() im Deck: misst nach dem Laden der Schriften, Lage relativ zur
   Überschrift (gleich im Druck). Je Glyphe ermittelt eine Canvas-Probe die Tintenläufe im
   Fadenband; je Lauf abwechselnd ein Stück „vorne“ (Faden über dem Strich, Papierhof oben und
   unten schneidet ihn) und eine Lücke „hinten“ (Papier im Faden, der Strich liegt vorn). Erste
   Kreuzung einer Glyphe vorn, data-webe-start="hinten" kehrt das um. Die festen Maße des Decks
   (px bei 248 px Schrift) sind auf die Schriftgröße umgerechnet. Gewebt wird nur .webe--gewebt;
   sonst setzt weben() nur die Höhe des Fadens (Faden ohne Hof hinter der Schrift). */
const webeSkript = `
window.weben = function () {
  var leinwand = document.createElement('canvas');
  var FAKTOR = 4;   /* Probe in vierfacher Größe: genauer, und die optische Größe erreicht 144 wie im Titel */
  function tinte(zeichen, st, breite, y0, y1) {
    var f = FAKTOR, rand = Math.ceil(breite * 0.6 * f) + 8;
    var w = Math.ceil(breite * f + 2 * rand), h = Math.max(1, Math.ceil((y1 - y0) * f));
    leinwand.width = w; leinwand.height = h;
    var c = leinwand.getContext('2d', { willReadFrequently: true });
    c.clearRect(0, 0, w, h);
    c.font = [st.fontStyle, st.fontWeight, (parseFloat(st.fontSize) * f) + 'px', st.fontFamily].join(' ');
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#000';
    c.fillText(zeichen, rand, -y0 * f);
    var d = c.getImageData(0, 0, w, h).data, laeufe = [], von = -1;
    for (var x = 0; x < w; x++) {
      var voll = false;
      for (var y = 0; y < h && !voll; y++) voll = d[(y * w + x) * 4 + 3] > 96;
      if (voll && von < 0) von = x;
      if (!voll && von >= 0) { laeufe.push([(von - rand) / f, (x - rand) / f]); von = -1; }
    }
    if (von >= 0) laeufe.push([(von - rand) / f, (w - rand) / f]);
    return laeufe;
  }
  var stuecke = 0;
  document.querySelectorAll('.faden-zeile').forEach(function (zeile) {
    zeile.querySelectorAll('.vorne, .luecke').forEach(function (v) { v.remove(); });
    var webe = zeile.querySelector('.webe');
    if (!webe) return;
    var fs = parseFloat(getComputedStyle(webe).fontSize);
    var r0 = zeile.getBoundingClientRect();
    var grund = webe.querySelector('.grund').getBoundingClientRect().bottom;
    var mitte = 0.12 * fs;
    zeile.style.setProperty('--faden-y', (grund - r0.top + mitte).toFixed(2) + 'px');
    if (!webe.classList.contains('webe--gewebt')) return;
    var cs = getComputedStyle(zeile);
    var laenge = function (name) { var v = cs.getPropertyValue(name).trim(); return /px$/.test(v) ? parseFloat(v) : parseFloat(v) * fs; };
    var dicke = laenge('--faden-dicke'), hof = laenge('--hof'), px = fs / 248;
    var oben = mitte - dicke / 2, unten = mitte + dicke / 2;
    var glyphen = [], bereich = document.createRange();
    var gang = document.createTreeWalker(webe, NodeFilter.SHOW_TEXT, null);
    for (var k = gang.nextNode(); k; k = gang.nextNode()) {
      var st = getComputedStyle(k.parentElement);
      for (var i = 0; i < k.length; i++) {
        var z = k.data.charAt(i);
        if (!/\\S/.test(z)) continue;
        bereich.setStart(k, i); bereich.setEnd(k, i + 1);
        var r = bereich.getBoundingClientRect();
        if (!r.width) continue;
        var kern = tinte(z, st, r.width, oben, unten);
        if (!kern.length) continue;
        glyphen.push({ x: r.left - r0.left, kern: kern, weit: tinte(z, st, r.width, oben - hof, unten + hof) });
      }
    }
    var alleKern = [];
    glyphen.forEach(function (g) { g.kern.forEach(function (l) { alleKern.push([g.x + l[0], g.x + l[1]]); }); });
    var start = webe.getAttribute('data-webe-start') === 'hinten' ? 1 : 0;
    glyphen.forEach(function (g) {
      g.kern.forEach(function (l, j) {
        var a = g.x + l[0], e = g.x + l[1];
        var el = document.createElement('i');
        el.setAttribute('aria-hidden', 'true');
        if ((j + start) % 2) {
          el.className = 'luecke';
          el.style.left = (a - hof).toFixed(2) + 'px';
          el.style.width = (e - a + 2 * hof).toFixed(2) + 'px';
          zeile.appendChild(el); stuecke++;
          return;
        }
        /* Ausdehnung desselben Strichs im Hofbereich, höchstens zwei Höfe weit */
        var ea = a, ee = e;
        g.weit.forEach(function (v) {
          var wa = g.x + v[0], we = g.x + v[1];
          if (we >= a && wa <= e) { ea = Math.min(ea, Math.max(wa, a - 2 * hof)); ee = Math.max(ee, Math.min(we, e + 2 * hof)); }
        });
        var links = Math.min(ea - 4 * px, a - hof - 6 * px), rechts = Math.max(ee + 4 * px, e + hof + 6 * px);
        /* nie über einen anderen Strich im Fadenband reichen */
        alleKern.forEach(function (v) {
          if (v[1] <= a && v[1] + 2 * px > links) links = v[1] + 2 * px;
          if (v[0] >= e && v[0] - 2 * px < rechts) rechts = v[0] - 2 * px;
        });
        if (rechts - links < 4 * px) return;
        el.className = 'vorne';
        el.style.left = links.toFixed(2) + 'px';
        el.style.width = (rechts - links).toFixed(2) + 'px';
        zeile.appendChild(el); stuecke++;
      });
    });
  });
  return stuecke;
};

/* Randnotiz unter Sprechtext und Regie setzen, wenn die Folie dadurch mindestens 10 mm niedriger
   wird (Trennfolien und kurze Sprechtexte); sonst bleibt sie unter dem Bild. */
window.notizenSetzen = function () {
  var mm = 96 / 25.4, bewegt = [];
  document.querySelectorAll('article.folie').forEach(function (a) {
    var links = a.querySelector(':scope > .f-links'), rechts = a.querySelector(':scope > .f-rechts');
    var hg = links && links.querySelector(':scope > .hintergrund');
    if (!hg || !rechts) return;
    var vorher = a.getBoundingClientRect().height;
    hg.classList.add('hintergrund--rechts');
    rechts.appendChild(hg);
    var nachher = a.getBoundingClientRect().height;
    if (nachher > vorher - 10 * mm) { hg.classList.remove('hintergrund--rechts'); links.appendChild(hg); }
    else bewegt.push(a.getAttribute('data-folie') + ' (' + Math.round((vorher - nachher) / mm) + ' mm)');
  });
  return bewegt;
};

/* Zeitleiste: Folienbereich jedes Blockfelds mit mindestens 1,5 mm Abstand zu Trenner und Rand */
window.zeitleistePruefen = function () {
  return Array.prototype.slice.call(document.querySelectorAll('.zeitleiste .zl-nr')).map(function (t) {
    var b = t.getBBox(), von = Number(t.getAttribute('data-von')), bis = Number(t.getAttribute('data-bis'));
    var luft = Math.min(b.x - von, bis - (b.x + b.width));
    return { text: t.textContent, luftMm: Math.round(luft * 10) / 10 };
  });
};`;

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>Präsentationsskript: ${esc(titel)}</title>
<style>${css}</style>
<script>${webeSkript}</script>
</head>
<body>
${titelseite}
${ueberblick}
${koerper}
${anhang}
</body></html>`;

const htmlPfad = path.join(zielArbeit, dateiName + '.html');
fs.writeFileSync(htmlPfad, html);

/* ---------------------------------------------------------------------------
   7. PDF: erst jeden Abschnitt einzeln setzen und Seiten zählen (für die
      Seitenzahlen im Überblick), dann das ganze Skript drucken
   --------------------------------------------------------------------------- */
const seitenIn = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
const druck = await browser.newPage({ viewport: { width: 658, height: 1123 } });   /* 174 mm Satzspiegel */
await druck.goto(pathToFileURL(htmlPfad).href, { waitUntil: 'load' });
await druck.evaluate(() => document.fonts && document.fonts.ready);
/* vor dem Zählen: Randnotizen setzen (bleibt im DOM und damit in der Endfassung), dann weben */
const notizenRechts = await druck.evaluate(() => window.notizenSetzen());
const gewebt = await druck.evaluate(() => window.weben());
const zeitleisteLuft = await druck.evaluate(() => window.zeitleistePruefen());
for (const z of zeitleisteLuft) if (z.luftMm < 1.5) warnungen.push(`Zeitleiste: „${z.text}“ hat nur ${z.luftMm} mm Abstand zu Trenner oder Feldrand.`);
const ueberstand = await druck.evaluate(() => {
  const breite = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')].filter((el) => !el.closest('.titelseite'))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width && (r.right > breite + 1 || r.left < -1))
    .slice(0, 5).map(({ el, r }) => `${el.tagName.toLowerCase()}.${el.className} (${Math.round(r.left)}–${Math.round(r.right)} px)`);
});
if (ueberstand.length) warnungen.push(`Horizontaler Überstand, Chrome verkleinert dann das ganze PDF: ${ueberstand.join('; ')}`);
const pdfOptionen = { format: 'A4', printBackground: true, preferCSSPageSize: true };
const zeige = (liste) => druck.evaluate((sichtbar) => document.querySelectorAll('[data-abschnitt]').forEach((el) => {
  el.style.display = !sichtbar || sichtbar.includes(el.getAttribute('data-abschnitt')) ? '' : 'none';
}), liste);
const zaehle = async (liste) => { await zeige(liste); return seitenIn(await druck.pdf(pdfOptionen)); };
/* Gruppen, die je auf neuer Seite beginnen: Titel, Überblick, Teile (fließende hängen am vorigen), Anhang */
const gruppen = [['titel'], ['ueberblick']];
for (const teil of teile) { if (teil.fliesst) gruppen.at(-1).push(teil.abschnitt); else gruppen.push([teil.abschnitt]); }
gruppen.push(['anhang']);
const seiten = {};
let seite = 1;
for (const g of gruppen) {
  let bisher = 0;
  for (let k = 0; k < g.length; k++) {
    const n = await zaehle(g.slice(0, k + 1));
    /* fließender Teil: bleibt die Seitenzahl gleich, beginnt er auf der letzten Seite des vorigen */
    const von = k === 0 ? seite : seite + bisher - (n === bisher ? 1 : 0);
    seiten[g[k]] = { von, anzahl: n - bisher + (k > 0 && n === bisher ? 1 : 0) };
    bisher = n;
  }
  seite += bisher;
}
await zeige(['anhang']);
const notfallZeigen = (an) => druck.evaluate((x) => { const n = document.querySelector('.notfall'); if (n) n.style.display = x ? '' : 'none'; }, an);
await notfallZeigen(false);
const vorNotfall = seitenIn(await druck.pdf(pdfOptionen));
await notfallZeigen(true);
seiten.notfall = { von: seiten.anhang.von + vorNotfall, anzahl: seiten.anhang.anzahl - vorNotfall };
await zeige(null);
await druck.evaluate((s) => {
  document.querySelectorAll('[data-seite-von]').forEach((el) => {
    const x = s[el.getAttribute('data-seite-von')];
    if (x) el.textContent = String(x.von);
  });
}, seiten);
/* Endfassung aus einem frischen Tab drucken: Nach den Zähl-Durchläufen im selben Tab
   doppelte Chrome sonst einzelne Lesezeichen-Titel. */
fs.writeFileSync(htmlPfad, await druck.content());
const ende = await browser.newPage({ viewport: { width: 658, height: 1123 } });
await ende.goto(pathToFileURL(htmlPfad).href, { waitUntil: 'load' });
await ende.evaluate(() => document.fonts && document.fonts.ready);
await ende.evaluate(() => window.weben());
const pdfPfad = path.join(zielPdf, dateiName + '.pdf');
const pdf = await ende.pdf({ ...pdfOptionen, path: pdfPfad, outline: true, tagged: true });
const seitenGesamt = seitenIn(pdf);
if (seitenGesamt !== seite - 1) warnungen.push(`Seitenzahl ${seitenGesamt} statt ${seite - 1}: Seitenangaben im Überblick prüfen.`);
await browser.close();

/* ---------------------------------------------------------------------------
   8. Prüfbericht
   --------------------------------------------------------------------------- */
const bericht = {
  erzeugt: new Date().toISOString(),
  pdf: pdfPfad,
  seiten: seitenGesamt,
  abschnitte: seiten,
  sollzeit: mmss(gesamt),
  summeDataZeit: gesamt,
  folien: folien.map((f) => ({
    id: f.id, nummer: f.nummer, sprecher: f.teil ? f.teil.sprecher : null, start: f.backup ? null : mmss(f.start),
    zeit: f.zeit, klicks: f.schritte, gesprochen: f.gesprochen.length,
    marken: f.gesprochen.map((a) => klickLabel(a.schritt)), woerter: f.woerter, notizen: f.notizen.map((n) => n.art)
  })),
  absaetzeGesprochen: folien.reduce((s, f) => s + f.gesprochen.length, 0),
  redezeit: Object.fromEntries(Object.entries(redezeit).map(([k, v]) => [k, mmss(v.zeit)])),
  uebergaben: uebergaben.map((u) => ({ nach: u.nach, von: u.von, an: u.an, bei: u.zeit !== undefined ? mmss(u.zeit) : null, letzterSatz: u.letzterSatz, letzterSatzGefunden: u.letzterSatzGefunden, ersterSatz: u.ersterSatz, ersterSatzGefunden: u.ersterSatzGefunden, wechselNotiz: u.wechselNotiz })),
  kuerzung: stufen.map((st) => ({ stufe: st.name, ziel: st.ziel, sekunden: st.summe, kumuliert: st.kumuliert, saetze: st.alle.map((s) => ({ folie: s.folie, schritt: s.schritt ?? null, gefunden: s.gefunden, woerter: s.woerter, sekunden: s.sekunden })) })),
  zwischenzeiten: teile.map((teil, i) => {
    const erste = teile[i + 1]?.folienListe[0];
    const rest = erste ? restAb(erste) : [0, 0];
    return { folie: erste ? erste.nummer : 'Ende', soll: mmss(teil.ende), nochKuerzbarStufe1: rest[0], nochKuerzbarAlle: rest[1] };
  }),
  rueckfragen: (zusatz.rueckfragen || []).length,
  quellenAlsText: backups.reduce((s, f) => s + (f.liste || []).length, 0),
  notizenRechts,
  zeitleiste: zeitleisteLuft,
  webung: gewebt,
  fehler,
  warnungen
};
if (fassung) {
  const benutzt = new Set(folien.flatMap((f) => f.absaetze.filter((a) => a.ersetzt).map((a) => a.ersetzt)));
  for (const k of Object.keys(fassung.texte)) if (!benutzt.has(k)) warnungen.push(`Fassung: Schlüssel ${k} passt zu keinem Sprechtext-Absatz.`);
  bericht.fassungErsetzt = benutzt.size;
}
fs.writeFileSync(path.join(zielArbeit, dateiName === 'praesentationsskript' ? 'pruefung.json' : `pruefung-${dateiName}.json`), JSON.stringify(bericht, null, 2));

console.log(`${dateiName}.pdf erzeugt: ${pdfPfad}`);
console.log(`  ${folien.length} Folien (${haupt.length} im Vortrag, ${backups.length} Backup), ${bericht.absaetzeGesprochen} Sprechtext-Absätze, Sollzeit ${mmss(gesamt)}, ${seitenGesamt} Seiten`);
console.log(`  Redezeit: ${Object.entries(redezeit).map(([k, v]) => `${sprecher[k]?.name || k} ${mmss(v.zeit)}`).join(', ')}`);
console.log(`  Übergaben: ${uebergaben.map((u) => `nach ${u.vorher?.nummer || u.nach} ${u.letzterSatzGefunden && u.ersterSatzGefunden && u.wechselNotiz ? 'wortgleich' : 'UNVOLLSTÄNDIG'}`).join(', ')}`);
console.log(`  Kürzungsplan: ${stufen.map((st) => `${st.name} ${st.summe} s`).join(', ')}; ${(zusatz.rueckfragen || []).length} Rückfragen`);
console.log(`  Randnotiz rechts: ${notizenRechts.join(', ') || 'keine'}; Webung: ${gewebt} Stücke`);
for (const w of warnungen) console.log('  Warnung: ' + w);
for (const f of fehler) console.log('  FEHLER: ' + f);
console.log(`  Prüfbericht: ${path.join(zielArbeit, 'pruefung.json')}`);
if (fehler.length) process.exitCode = 1;
