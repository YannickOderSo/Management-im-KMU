#!/usr/bin/env node
/* =============================================================================
   referent-test.mjs – Referentenansicht mit zwei Fenstern prüfen
   -----------------------------------------------------------------------------
   Seit 21.10.2026 (Nacharbeit D23; vorher ein Hilfsskript außerhalb des
   Repositorys). Öffnet index.html in Chromium (file://, ohne Netz), drückt P
   und prüft das Zusammenspiel von Folienfenster („Beamer“) und
   Referentenfenster – die Punkte aus VORTRAGSREIFE.md, Nachtrag N2:
     A7   Sprünge aus dem Referentenfenster (Sprungliste f12, Rad-Feld,
          Tab + Enter, Verweis f11) bewegen den Beamer – ab Folie 12
     A7*  vor Folie 12 bewegt ein Klick in die Folie den Beamer NICHT (Schutz
          gegen versehentliche Klicks im Vortrag, Nacharbeit 21.10.2026), dafür
          ein Hinweis im Referentenfenster; nach Folie 01 gilt der Schutz wieder
     A8   Schwarzbild: Blättern blendet nur ein, Esc auch im Referentenfenster,
          Knopf „Saal einblenden“
     A9   Uhr übersteht Neuladen        A10  Knöpfe bei 1366 × 660 … 1280 × 606
     A11  Rückfragen-Knopf, graue Absätze   A12  nur das eigene Folienfenster
     A14  Start-Knopf leuchtet          A24  „1 3 Enter“ springt nicht
     A25  „Ende der Präsentation“ nur im Referentenfenster
     A26  keine Überblendung im Referentenfenster
   Nach jeder Änderung an js/deck.js, js/komponenten.js, js/folien/11-fazit.js,
   js/folien/12-fragen.js oder css/deck.css laufen lassen; vor der Generalprobe
   einmal (dauert ca. 1 Minute).

   Aufruf (im Ordner praesentation/):
     PLAYWRIGHT_CORE=/pfad/zu/node_modules/playwright-core \
       node werkzeuge/referent-test.mjs index.html --ausgabe _test/referent
   Umgebung: PLAYWRIGHT_CORE (sonst normaler Import), CHROME_PFAD (Standard
   /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
   Ergebnis: Zeilen „OK“/„FEHLER“, Summe, ergebnis.json und Bildschirmfotos im
   Ausgabeordner; Exit-Code 0 = alles bestanden, 1 = mindestens ein Fehler,
   2 = Abbruch.
   ============================================================================= */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const argumente = process.argv.slice(2);
if (argumente.includes('--hilfe') || argumente.includes('-h')) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
  process.exit(0);
}
const datei = path.resolve(argumente.find((a) => !a.startsWith('--')) || 'index.html');
const ai = argumente.indexOf('--ausgabe');
const aus = path.resolve(ai >= 0 && argumente[ai + 1] ? argumente[ai + 1] : '_test/referent');
fs.mkdirSync(aus, { recursive: true });

const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'); } catch (e) {
  console.error('playwright-core nicht gefunden. PLAYWRIGHT_CORE=/pfad/zu/node_modules/playwright-core setzen. (' + e.message + ')');
  process.exit(2);
}
const chromePfad = process.env.CHROME_PFAD || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url = 'file://' + datei;
const erg = [];
const ok = (name, bed, info) => { erg.push({ name, ok: !!bed, info }); console.log((bed ? 'OK      ' : 'FEHLER  ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const browser = await pw.chromium.launch({ executablePath: chromePfad,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  /* nur lokale Dateien – die Live-Abstimmung fragt hier nichts ab */
  await ctx.route('**/*', (r) => /^(file|data|blob|about):/.test(r.request().url()) ? r.continue() : r.abort());
  const fehlerLog = [];
  ctx.on('page', (p) => p.on('pageerror', (e) => fehlerLog.push(p.url().slice(-40) + ': ' + e.message)));
  const haupt = await ctx.newPage();
  haupt.on('pageerror', (e) => fehlerLog.push('haupt: ' + e.message));
  await haupt.goto(url + '#f01');
  await haupt.waitForFunction(() => window.Deck && Deck.istBereit);
  const zustand = (p) => p.evaluate(() => ({ folie: Deck.zustand().folie, schritt: Deck.zustand().schritt, schwarz: document.documentElement.classList.contains('schwarz') }));
  const tasten = async (p, folge) => { await p.click('.r-notizen-text'); for (const k of folge) await p.keyboard.press(k); await warte(900); };
  const hinweis = (p) => p.$eval('.hinweis-toast', (h) => h.classList.contains('ist-offen') ? h.textContent : '');
  /* ruhende Maus hebt nichts hervor und klickt nichts an (Mausregel) – erst bewegen */
  const mausBewegen = async (p) => { await p.mouse.move(300, 300); await p.mouse.move(340, 330); await warte(300); };

  const [ref] = await Promise.all([ctx.waitForEvent('page'), haupt.keyboard.press('p')]);
  await ref.setViewportSize({ width: 1440, height: 900 });
  await ref.waitForFunction(() => window.Deck && Deck.istBereit);
  await ref.waitForSelector('.r-verbindung[data-stand="verbunden"]', { timeout: 8000 });
  ok('Referentenfenster verbunden', true);
  await ref.evaluate(() => { localStorage.clear(); });

  /* A14 Start-Knopf leuchtet */
  ok('A14 Start-Knopf hervorgehoben', await ref.$eval('[data-r="startpause"]', (k) => k.classList.contains('r-knopf--start')));
  await ref.screenshot({ path: path.join(aus, 'ref-1440-f01-start.png') });

  /* A7* Schutz: vor Folie 12 bewegt ein Klick in die Folie den Beamer nicht */
  await tasten(ref, ['1', '0', 'Enter']);
  await mausBewegen(ref);
  const karte10 = await ref.$('.r-platz-aktuell #f10 .sr-feld[data-feld="tonalitaet"]');
  ok('Rad-Feld f10 im Referentenfenster vorhanden und klickbar', !!karte10 && (await karte10.evaluate((k) => getComputedStyle(k).pointerEvents)) !== 'none');
  if (karte10) { await karte10.click({ force: true }); await warte(700); }
  ok('A7* Klick auf f10 vor der Fragerunde → Beamer bleibt auf f10', (await zustand(haupt)).folie === 'f10', await zustand(haupt));
  ok('A7* Hinweis „erst ab Folie 12“ im Referentenfenster', (await hinweis(ref)).includes('erst ab Folie 12'), await hinweis(ref));
  ok('A7* kein Hinweis auf dem Beamer', (await hinweis(haupt)) === '');

  /* A7 Sprungliste f12 im Referentenfenster */
  await tasten(ref, ['1', '2', 'Enter']);
  ok('Ziffern 12 → Beamer f12', (await zustand(haupt)).folie === 'f12', await zustand(haupt));
  const sprung = await ref.$('.r-platz-aktuell .g6d-sprung[data-ziel="b3"]');
  ok('Sprungknopf B3 vorhanden', !!sprung);
  if (sprung) { await sprung.click(); await warte(900); }
  ok('A7 Klick Sprungliste im Referentenfenster → Beamer B3', (await zustand(haupt)).folie === 'b3', await zustand(haupt));
  ok('A7 Referentenfenster folgt B3', (await zustand(ref)).folie === 'b3', await zustand(ref));
  /* zurück zu f12 und Rad-Feld anklicken */
  await tasten(ref, ['1', '2', 'Enter']);
  const feld = await ref.$('.r-platz-aktuell #f12 .sr-feld[data-feld="tonalitaet"]');
  ok('Rad-Feld f12 vorhanden', !!feld);
  if (feld) { await feld.click({ force: true }); await warte(900); }
  ok('A7 Klick Rad-Feld (Tonalität) im Referentenfenster → Beamer f08', (await zustand(haupt)).folie === 'f08', await zustand(haupt));
  /* Tab + Enter auf einen Sprungknopf (Ende = Folie 12; auf f08 zählen Ziffern als Stimmen) */
  await ref.click('.r-notizen-text');
  await ref.keyboard.press('End');
  await warte(900);
  await ref.focus('.r-platz-aktuell .g6d-sprung[data-ziel="b5"]');
  await ref.keyboard.press('Enter');
  await warte(900);
  ok('A7 Tab + Enter Sprungknopf B5 → Beamer B5', (await zustand(haupt)).folie === 'b5', await zustand(haupt));
  /* f11-Verweis (Fragerunde schon erreicht → Klick wirkt auch auf f11) */
  await tasten(ref, ['1', '1', 'Enter']);
  for (let i = 0; i < 6; i++) { await ref.keyboard.press('ArrowRight'); await warte(150); }
  await ref.keyboard.press('ArrowLeft'); await warte(400);
  const verweis = await ref.$('.r-platz-aktuell #f11 .g6f-verweis:not([aria-disabled="true"])');
  if (verweis) {
    const ziel = await verweis.getAttribute('data-ziel');
    await verweis.click({ force: true }); await warte(900);
    ok('A7 f11-Verweis im Referentenfenster (nach Folie 12) → Beamer ' + ziel, (await zustand(haupt)).folie === ziel, await zustand(haupt));
  } else ok('A7 f11-Verweis vorhanden', false);

  /* A24 Listenplatz-Rückfall */
  await tasten(ref, ['0', '3', 'Enter']);
  await ref.keyboard.press('1'); await ref.keyboard.press('3'); await ref.keyboard.press('Enter'); await warte(500);
  ok('A24 „1 3“ springt nicht', (await zustand(haupt)).folie === 'f03', await zustand(haupt));
  ok('A24 Hinweis im Referentenfenster', (await ref.$eval('.hinweis-toast', (h) => h.textContent)).includes('13 gibt es nicht'));

  /* A8 Schwarzbild */
  await ref.keyboard.press('b'); await warte(500);
  ok('A8 Saal schwarz', (await zustand(haupt)).schwarz);
  ok('A8 Knopf „Saal einblenden“', (await ref.$eval('[data-r="schwarz"]', (k) => k.textContent.trim() + '|' + k.classList.contains('ist-an'))) === 'Saal einblenden|true');
  await ref.screenshot({ path: path.join(aus, 'ref-1440-saal-schwarz.png') });
  const vor = await zustand(haupt);
  await ref.keyboard.press('ArrowRight'); await warte(500);
  const nach = await zustand(haupt);
  ok('A8 → blendet nur ein (keine Folie weiter)', !nach.schwarz && nach.folie === vor.folie && nach.schritt === vor.schritt, { vor, nach });
  await ref.keyboard.press('b'); await warte(400);
  await ref.keyboard.press('Escape'); await warte(400);
  ok('A8 Esc im Referentenfenster blendet ein', !(await zustand(haupt)).schwarz);
  await ref.keyboard.press('b'); await warte(400);
  await ref.click('[data-r="weiter"]'); await warte(400);
  const nach2 = await zustand(haupt);
  ok('A8 Knopf „Weiter“ blendet nur ein', !nach2.schwarz && nach2.folie === vor.folie && nach2.schritt === vor.schritt, nach2);

  /* A26 keine Überblendung im Referentenfenster */
  await ref.evaluate(() => {
    let gesehen = false;
    const beob = new MutationObserver(() => { if (document.documentElement.classList.contains('wechsel-laeuft')) gesehen = true; });
    beob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.__beob = () => { beob.disconnect(); return gesehen; };
  });
  await tasten(ref, ['0', '5', 'Enter']);
  ok('A26 Referentenfenster ohne Überblendung beim Folienwechsel', !(await ref.evaluate(() => window.__beob())));
  ok('Beamer f05', (await zustand(haupt)).folie === 'f05');

  /* A11 Rückfragen-Knopf */
  const rk = await ref.$eval('[data-r="rueckfragen"]', (k) => ({ hidden: k.hidden, text: k.textContent }));
  ok('A11 Rückfragen-Knopf sichtbar auf f05', !rk.hidden, rk);
  await ref.click('[data-r="rueckfragen"]'); await warte(800);
  const lage = await ref.evaluate(() => { const z = document.querySelector('.r-rueckfragen-start'); const n = document.querySelector('.r-notizen-text');
    return { oben: Math.round(z.getBoundingClientRect().top - n.getBoundingClientRect().top), text: z.textContent.slice(0, 40), knopf: document.querySelector('[data-r="rueckfragen"]').textContent }; });
  ok('A11 rollt zu den Rückfragen', lage.oben >= 0 && lage.oben < 60, lage);
  await ref.screenshot({ path: path.join(aus, 'ref-1440-f05-rueckfragen.png') });
  await ref.click('[data-r="rueckfragen"]'); await warte(800);
  ok('A11 zweiter Klick zurück', (await ref.$eval('.r-notizen-text', (n) => n.scrollTop)) < 5);
  const grau = await ref.evaluate(() => { const p = [...document.querySelectorAll('.r-notizen-text > p:not([data-schritt])')][0]; const s = [...document.querySelectorAll('.r-notizen-text > p[data-schritt]')][0];
    return { klein: getComputedStyle(p).fontSize, normal: getComputedStyle(s).fontSize, farbe: getComputedStyle(p).color }; });
  ok('A11 Nicht-Sprechabsätze kleiner', parseFloat(grau.klein) < parseFloat(grau.normal), grau);
  await tasten(ref, ['1', '2', 'Enter']);
  ok('A11 f12 ohne Grauregel (keine Sprechabsätze)', !(await ref.$eval('.r-notizen-text', (n) => n.classList.contains('r-mit-schritten'))));

  /* A25 Hinweis „Ende der Präsentation“ nicht auf dem Beamer */
  await ref.keyboard.press('ArrowRight'); await warte(500);
  const hauptHinweis = await hinweis(haupt);
  const refHinweis = await hinweis(ref);
  ok('A25 Ende-Hinweis nicht auf dem Beamer', hauptHinweis === '', hauptHinweis);
  ok('A25 Ende-Hinweis im Referentenfenster', refHinweis.includes('Ende der Präsentation'), refHinweis);

  /* A9 Uhr übersteht Neuladen (Folie 01 setzt den Schutz A7* wieder) */
  await tasten(ref, ['0', '1', 'Enter']);
  await ref.click('[data-r="zuruecksetzen"]');
  await warte(300);
  ok('A14 nach „Zeit zurücksetzen“ wieder hervorgehoben', await ref.$eval('[data-r="startpause"]', (k) => k.classList.contains('r-knopf--start') && k.textContent.trim() === 'Start'));
  await ref.click('[data-r="startpause"]');
  ok('A14 nach Start nicht mehr hervorgehoben', !(await ref.$eval('[data-r="startpause"]', (k) => k.classList.contains('r-knopf--start'))));
  await warte(2500);
  await ref.reload();
  await ref.waitForFunction(() => window.Deck && Deck.istBereit);
  await ref.waitForSelector('.r-verbindung[data-stand="verbunden"]', { timeout: 8000 });
  await warte(700);
  const uhr = await ref.evaluate(() => ({ gesamt: document.querySelector('.r-uhr-gesamt .r-uhr-wert').textContent, knopf: document.querySelector('[data-r="startpause"]').textContent.trim(), plan: document.querySelector('.r-plan').textContent }));
  ok('A9 Uhr läuft nach Neuladen weiter', uhr.gesamt !== '0:00' && uhr.knopf === 'Pause', uhr);

  /* A12 zweites Folienfenster */
  const zweit = await ctx.newPage();
  await zweit.goto(url + '#f02');
  await zweit.waitForFunction(() => window.Deck && Deck.istBereit);
  await warte(500);
  const h0 = await zustand(haupt), z0 = await zustand(zweit);
  await ref.click('.r-notizen-text');
  await ref.keyboard.press('ArrowRight'); await warte(600);
  const h1 = await zustand(haupt), z1 = await zustand(zweit);
  ok('A12 nur das eigene Folienfenster schaltet', (h1.schritt !== h0.schritt || h1.folie !== h0.folie) && z1.folie === z0.folie && z1.schritt === z0.schritt, { h0, h1, z0, z1 });
  let springt = false;
  for (let i = 0; i < 8; i++) { await warte(1000); const r = await zustand(ref); if (r.folie !== h1.folie || r.schritt !== h1.schritt) springt = true; }
  ok('A12 Referentenfenster bleibt 8 s beim eigenen Fenster', !springt);
  await zweit.close();

  /* Neuladen des Folienfensters: Verbindung kommt zurück, Befehle wirken */
  await haupt.reload();
  await haupt.waitForFunction(() => window.Deck && Deck.istBereit);
  await warte(1500);
  const hv = await zustand(haupt);
  await ref.click('.r-notizen-text');
  await ref.keyboard.press('ArrowRight'); await warte(700);
  const hn = await zustand(haupt);
  ok('Neuladen Folienfenster: Befehl wirkt nach 1,5 s', hn.folie !== hv.folie || hn.schritt !== hv.schritt, { hv, hn });

  /* A10 niedrige Fenster */
  for (const [b, h] of [[1366, 660], [1280, 720], [1280, 606], [1440, 900]]) {
    await ref.setViewportSize({ width: b, height: h });
    await warte(400);
    await tasten(ref, ['1', '0', 'Enter']);
    const m = await ref.evaluate(() => { const u = document.querySelector('.r-uhren'); const ur = u.getBoundingClientRect();
      const knoepfe = [...u.querySelectorAll('.r-knopf')].map((k) => { const r = k.getBoundingClientRect(); return r.bottom <= ur.bottom + 0.5 && r.top >= ur.top; });
      const n = document.querySelector('.r-notizen-text'); const fs = parseFloat(getComputedStyle(n).fontSize);
      return { alleKnoepfe: knoepfe.every(Boolean), sichtbar: knoepfe.filter(Boolean).length, uhrenScroll: u.scrollHeight > u.clientHeight + 1, notizHoehe: n.clientHeight, zeilen: Math.floor(n.clientHeight / (fs * 1.45)) }; });
    ok('A10 ' + b + ' × ' + h + ' alle Knöpfe sichtbar', m.alleKnoepfe, m);
    await ref.screenshot({ path: path.join(aus, 'ref-' + b + 'x' + h + '-f10.png') });
  }

  /* A7* nach Folie 01 (oben) gilt der Schutz wieder */
  await mausBewegen(ref);
  const karte10b = await ref.$('.r-platz-aktuell #f10 .sr-feld[data-feld="tonalitaet"]');
  if (karte10b) { await karte10b.click({ force: true }); await warte(700); }
  ok('A7* nach Folie 01 wieder gesperrt: Klick auf f10 → Beamer bleibt auf f10', !!karte10b && (await zustand(haupt)).folie === 'f10', await zustand(haupt));
  ok('A7* Hinweis wieder im Referentenfenster', (await hinweis(ref)).includes('erst ab Folie 12'), await hinweis(ref));

  ok('keine Seitenfehler', fehlerLog.length === 0, fehlerLog);
  fs.writeFileSync(path.join(aus, 'ergebnis.json'), JSON.stringify(erg, null, 2));
  const bestanden = erg.filter((e) => e.ok).length;
  console.log('Summe: ' + bestanden + ' von ' + erg.length + ' bestanden · Ausgabe ' + path.relative(process.cwd(), aus));
  await browser.close();
  process.exit(bestanden === erg.length ? 0 : 1);
} catch (e) {
  console.error('Abbruch: ' + (e && e.stack || e));
  process.exit(2);
}
