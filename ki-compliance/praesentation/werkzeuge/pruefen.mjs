#!/usr/bin/env node
/* =============================================================================
   pruefen.mjs – Folien automatisch prüfen und Screenshots machen
   -----------------------------------------------------------------------------
   Öffnet die Präsentation (index.html) per file:// in Chromium (Playwright),
   läuft alle Folien über die Deck-Schnittstelle ab, speichert Screenshots und
   prüft:
     • Konsolenfehler, Seitenfehler, fehlende lokale Dateien
     • externe Netzwerkanfragen (verboten – die Präsentation läuft offline)
     • geladene Schriften
     • Überlauf: sichtbare Elemente außerhalb der Bühne, abgeschnittener Text
     • Schriftgröße (Inhalt ≥ 28 px, Metaangaben ≥ 22 px)
     • Kontrast Text/Hintergrund (WCAG AA: 4,5 : 1, Großtext 3 : 1), seit 21.10.2026
       mit der Deckkraft der Vorfahren (abgeblendet: Zwischenschritt Warnung, Endzustand Fehler)
     • Wortbudget (Hauptfolie ≤ 40 sichtbare Wörter; am Zeilenende getrennte
       Wörter wie „Marken-<br>nutzen“ zählen als ein Wort). Ausnahme nur
       ausdrücklich: data-wortbudget="60" an der Folie (z. B. Tabelle, Rechner,
       schrittweise aufgedeckte Karten); der Bericht nennt jede Ausnahme.
     • mit --schritte: Überlauf, abgeschnittener Text, Schriftgröße und Kontrast
       in JEDEM Schritt (Befunde, die nur in einem Zwischenschritt auftreten,
       tragen den Zusatz „nur in Schritt n“)
     • überlappender Text (Zeilen zweier Elemente liegen übereinander)
     • fehlende Notizen, fehlendes data-zeit / data-titel
     • Live-Abstimmung (Folie 08): Zustand der Pille und n (siehe unten)
   Elemente mit dem Attribut data-ueberlauf-ok (z. B. ein absichtlich über den
   Rand laufendes Bild) und ihr Inhalt sind von der Überlaufprüfung ausgenommen,
   Elemente mit data-ueberlappung-ok von der Überlappungsprüfung.
   Ergebnis: JSON-Bericht auf stdout und in <ausgabe>/bericht.json.
   Rückgabewert (Exit-Code): 0 = keine Fehler, 1 = Fehler gefunden, 2 = Abbruch.

   VORAUSSETZUNG: Node.js und das Paket playwright-core mit einem Chromium
   (einmalig z. B.: npm install playwright-core && npx playwright install chromium).
   Für die Präsentation selbst wird das NICHT gebraucht – nur für diese Prüfung.

   AUFRUF (im Ordner praesentation/):
     PLAYWRIGHT_CORE=/pfad/zu/node_modules/playwright-core \
     node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte
   Der Ordner _test/ ist in .gitignore eingetragen (Testausgaben nicht einchecken).

   Optionen
     --ausgabe ORDNER       Screenshots + bericht.json (Standard: <datei>-pruefung/)
     --schritte             jeden Schritt fotografieren und prüfen (sonst nur den Endzustand)
     --nur f03,f04          nur diese Folien (IDs oder Nummern)
     --thema NAME           editorial | bento | keynote
     --modus hell|dunkel
     --druck PDF-PFAD       zusätzlich PDF erzeugen (wie Strg+P) und Seiten zählen
     --skala 0.5            Screenshots verkleinert (schneller); Prüfungen bleiben exakt
     --optional             auch optionale Folien (data-optional) prüfen
     --primaer HEX --sekundaer HEX   Markenfarben testen (z. B. FFD400 1D1D1B)
     --bewegung-reduziert   wie „Bewegung reduzieren“ im Betriebssystem
     --ohne-bilder          keine Screenshots, nur Prüfungen
     --live-offline         Live-Abstimmung: Anfragen scheitern wie ohne Internet (Pille „offline“)
     --live-werte 3,1,7,0,2 Live-Abstimmung: fester Stand (z. B. für Screenshots)
     --live-aus             liveQuelle aus marke.js für diesen Lauf ausblenden
                            (Folie wie ohne Live-Abstimmung: kein QR-Code, Zählmodus)

   LIVE-ABSTIMMUNG (marke.js → umfragen.<id>.liveQuelle, Folie 08)
   Die Prüfung schickt nie eine Anfrage an die echte Web-App. Anfragen an die
   in marke.js eingetragene liveQuelle (nur diese Adresse, nur aktion=stand und
   aktion=stimme) beantwortet eine eingebaute Attrappe – JSONP wie
   live-abstimmung/apps-script.gs, gleiche Eingabeprüfung und Zählregel (das
   Zeitfenster minuten=… wird geprüft und in der Antwort genannt, ändert aber
   nichts am Ergebnis – die Stimmen eines Prüflaufs sind nie so alt). Sie
   zählen nicht als Fehler, stehen aber getrennt im Bericht („liveAnfragen“).
   Zeitfenster (seit 21.10.2026): Jede Stand-Abfrage muss minuten = marke.js
   → umfragen.<id>.gueltigMinuten tragen (wie js/komponenten.js: ganze Zahl
   1–1440, sonst ohne minuten) – fehlt es oder weicht es ab, ist das ein
   Fehler (sonst zählte Folie 08 im Vortrag ohne Zeitgrenze).
   Ausnahme: aktion=stimme aus der Präsentation ist ein Fehler (Folie 08 liest
   nur), wird aber beantwortet. Jede andere externe Anfrage bleibt ein Fehler,
   auch WebSockets (routeWebSocket). Zusätzlich sperrt der Browser selbst das
   Netz (--no-proxy-server, --host-resolver-rules): Auch Chrome baut keine
   eigenen Verbindungen zu Google-Diensten auf (geprüft 19.10.2026 mit NetLog).
   Mit ?aufnahme fragt die Folie nie ab (js/komponenten.js, 3a) – sie zeigte
   dann Beispieldaten, die es im Vortrag nicht gibt. Deshalb lädt die Prüfseite
   bei gesetzter liveQuelle OHNE ?aufnahme und setzt die Klasse „aufnahme“
   selbst (ohne Bedienleiste, wie bisher). So wird Folie 08 geprüft, wie sie
   im Vortrag aussieht. Standard: Stand mit lauter Nullen (Beginn des Vortrags:
   QR-Code, Pille „Live“, n = 0). Vor jedem Bild wartet die Prüfung, bis die
   Pille nicht mehr „verbinde“ zeigt; stimmt der Zustand nicht (Standard und
   --live-werte: „Live“, --live-offline: „offline“), ist das ein Fehler.
   Exporte: Das PDF (--druck, ?druck) fragt nie ab. PDF und Folienbilder (ohne
   --schritte) zeigen jede Folie im Endzustand – Folie 08 mit den Analogien,
   die Umfrage ist dort nicht zu sehen. Der Standard (n = 0) gilt für die
   Bilder der Schritte 0 und 1 (--schritte).
   Umgebung
     PLAYWRIGHT_CORE  Pfad zum Paket playwright-core (sonst normaler Import)
     CHROME_PFAD      Chromium/Chrome (Standard /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
   ============================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

/* ---------- Argumente ---------- */
const argv = process.argv.slice(2);
const opt = { datei: null, ausgabe: null, schritte: false, nur: null, thema: null, modus: null, druck: null,
  skala: 1, optional: false, primaer: null, sekundaer: null, reduziert: false, ohneBilder: false,
  liveOffline: false, liveWerte: null, liveAus: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const wert = () => { const w = argv[++i]; if (w === undefined) abbruch('Wert fehlt für ' + a); return w; };
  if (a === '--ausgabe') opt.ausgabe = wert();
  else if (a === '--schritte') opt.schritte = true;
  else if (a === '--nur') opt.nur = wert().split(',').map((x) => x.trim()).filter(Boolean);
  else if (a === '--thema') opt.thema = wert();
  else if (a === '--modus') opt.modus = wert();
  else if (a === '--druck') opt.druck = wert();
  else if (a === '--skala') opt.skala = parseFloat(wert()) || 1;
  else if (a === '--optional') opt.optional = true;
  else if (a === '--primaer') opt.primaer = wert().replace(/^#/, '');
  else if (a === '--sekundaer') opt.sekundaer = wert().replace(/^#/, '');
  else if (a === '--bewegung-reduziert') opt.reduziert = true;
  else if (a === '--ohne-bilder') opt.ohneBilder = true;
  else if (a === '--live-offline') opt.liveOffline = true;
  else if (a === '--live-werte') {
    const w = wert();
    opt.liveWerte = w.split(',').map((x) => x.trim());
    if (!opt.liveWerte.every((x) => /^[0-9]{1,6}$/.test(x))) abbruch('--live-werte: ganze Zahlen ab 0, mit Komma getrennt (z. B. 3,1,7,0,2) – nicht „' + w + '“');
    opt.liveWerte = opt.liveWerte.map(Number);
  }
  else if (a === '--live-aus') opt.liveAus = true;
  else if (a === '--hilfe' || a === '-h') { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('*/')[0]); process.exit(0); }
  else if (a.startsWith('--')) abbruch('Unbekannte Option ' + a);
  else opt.datei = a;
}
function abbruch(text) { console.error('FEHLER: ' + text); process.exit(2); }
if (!opt.datei) abbruch('HTML-Datei fehlt. Beispiel: node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte');
const datei = path.resolve(opt.datei);
if (!fs.existsSync(datei)) abbruch('Datei nicht gefunden: ' + datei);
const ausgabe = path.resolve(opt.ausgabe || datei.replace(/\.html?$/i, '') + '-pruefung');
if ([opt.liveOffline, !!opt.liveWerte, opt.liveAus].filter(Boolean).length > 1) {
  abbruch('--live-offline, --live-werte und --live-aus schließen sich aus – nur eine davon angeben.');
}

/* ---------- Live-Abstimmung: liveQuelle aus marke.js lesen ----------
   marke.js setzt nur window.MARKE = { … } – hier in einer leeren Umgebung
   ausführen (ohne Browser, ohne Netz). */
function liveQuellenLesen() {
  const markePfad = path.join(path.dirname(datei), 'marke.js');
  if (!fs.existsSync(markePfad)) return { quellen: [], hinweis: 'marke.js nicht gefunden' };
  const umgebung = { window: {} };
  try {
    vm.runInNewContext(fs.readFileSync(markePfad, 'utf8'), umgebung, { filename: markePfad, timeout: 1000 });
  } catch (e) {
    return { quellen: [], hinweis: 'marke.js nicht lesbar (' + e.message + ')' };
  }
  const umfragen = (umgebung.window.MARKE && umgebung.window.MARKE.umfragen) || {};
  const quellen = [];
  for (const [id, u] of Object.entries(umfragen)) {
    const adresse = String((u && u.liveQuelle) || '').trim();
    if (!adresse) continue;
    let url;
    try { url = new URL(adresse); } catch (e) { continue; }   /* unbrauchbar: die Folie fragt dann nicht (Warnung in der Konsole) */
    if (!/^https?:$/.test(url.protocol)) continue;
    /* Zeitfenster wie js/komponenten.js (umfrageGueltigMinuten): ganze Zahl 1–1440, sonst 0 = ohne minuten */
    const roh = u.gueltigMinuten;
    const zahl = typeof roh === 'number' || typeof roh === 'string' ? Number(roh) : NaN;
    const minuten = roh !== '' && Math.floor(zahl) === zahl && zahl >= 1 && zahl <= 1440 ? zahl : 0;
    quellen.push({ id, adresse, schluessel: url.origin + url.pathname, anzahl: Array.isArray(u.optionen) ? u.optionen.length : 0, minuten });
  }
  return { quellen, hinweis: '' };
}
const liveMarke = liveQuellenLesen();
const LIVE = {
  quellen: liveMarke.quellen,
  /* Prüfseite ohne ?aufnahme laden, damit Folie 08 wirklich abfragt (siehe Kopf) */
  simulieren: liveMarke.quellen.length > 0 && !opt.liveAus,
  modus: !liveMarke.quellen.length ? 'ohne liveQuelle' : opt.liveAus ? 'aus' : opt.liveOffline ? 'offline' : opt.liveWerte ? 'werte' : 'null',
  stimmen: new Map(),      /* Runde|Umfrage → Map(Gerät → Option); je Gerät zählt die letzte Stimme */
  zaehler: { stand: 0, stimme: 0, offline: 0, abgelehnt: 0, druck: 0, konsoleOffline: 0, ausPraesentation: 0, websockets: 0, falscheMinuten: 0 },
  anzeige: {}              /* Folie → { pille, n } nach der ersten Antwort */
};
if (opt.liveWerte) {
  LIVE.quellen.forEach((q) => {
    if (q.anzahl && q.anzahl !== opt.liveWerte.length) {
      abbruch('--live-werte: ' + opt.liveWerte.length + ' Werte, die Umfrage „' + q.id + '“ hat ' + q.anzahl + ' Optionen (marke.js).');
    }
  });
}
fs.mkdirSync(ausgabe, { recursive: true });

/* ---------- Playwright laden ---------- */
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
} catch (e) {
  abbruch('playwright-core nicht gefunden. PLAYWRIGHT_CORE=/pfad/zu/node_modules/playwright-core setzen. (' + e.message + ')');
}
const chromePfad = process.env.CHROME_PFAD || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* ---------- Bericht ---------- */
const bericht = {
  datei: path.relative(process.cwd(), datei),
  zeitpunkt: new Date().toISOString(),
  einstellungen: { thema: opt.thema, modus: opt.modus, schritte: opt.schritte, skala: opt.skala, optional: opt.optional,
    primaer: opt.primaer, sekundaer: opt.sekundaer, bewegungReduziert: opt.reduziert, live: LIVE.modus },
  zusammenfassung: {},
  fehler: [],          // muss behoben werden
  warnungen: [],       // sollte geprüft werden
  folien: [],
  schriften: [],
  screenshots: [],
  externeAnfragen: [],  // blockiert, jede ist ein Fehler
  liveAnfragen: null,   // an die liveQuelle – beantwortet von der eingebauten Attrappe (ende())
  druck: null
};
const fehler = (ort, text) => bericht.fehler.push({ ort, text });
const warnung = (ort, text) => bericht.warnungen.push({ ort, text });
if ((opt.liveOffline || opt.liveWerte || opt.liveAus) && !LIVE.quellen.length) {
  warnung('Live-Abstimmung', 'Option --live-… ohne Wirkung: keine liveQuelle in marke.js' + (liveMarke.hinweis ? ' (' + liveMarke.hinweis + ')' : ''));
}

/* ---------- Browser ---------- */
/* Netz auf Ebene des Browsers sperren. Chrome baut sonst von sich aus
   Verbindungen zu Google-Diensten auf – an der Seite vorbei, die Sperre unten
   (kontext.route) sieht sie nicht. --disable-background-networking allein
   reicht nicht: Ein Mitschnitt vom 19.10.2026 zeigte trotzdem Verbindungen zu
   clients2.google.com, accounts.google.com, www.google.com u. a. (nie
   script.google.com, keine Inhalte der Präsentation). Erst --no-proxy-server
   (die Proxy-Variablen der Umgebung nicht benutzen) und
   --host-resolver-rules (jeder Name außer localhost gilt als unbekannt) ergaben
   laut NetLog 0 Verbindungen. Die Anfragen an die liveQuelle beantwortet die
   Attrappe trotzdem: kontext.route greift vor der Namensauflösung. */
const NETZ_AUS = ['--disable-background-networking', '--no-proxy-server',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1'];
const browser = await playwright.chromium.launch({ executablePath: chromePfad, args: ['--no-sandbox', '--allow-file-access-from-files', ...NETZ_AUS] });
const breite = Math.round(1920 * opt.skala);
const hoehe = Math.round(1080 * opt.skala);
const kontext = await browser.newContext({
  viewport: { width: breite, height: hoehe },
  reducedMotion: opt.reduziert ? 'reduce' : 'no-preference'
});
/* ---------- Eingebaute Attrappe der Web-App ----------
   Gleiche Schnittstelle, Eingabeprüfung und Zählregel wie
   live-abstimmung/apps-script.gs (Kopfkommentar „SCHNITTSTELLE“), aber ohne
   Tabelle: Stand = Grundwerte (lauter Nullen oder --live-werte) + Stimmen,
   die in diesem Lauf über aktion=stimme kamen (je Gerät die letzte).
   Zeitfenster (minuten, Fassung 20.10.2026): wird geprüft wie beim Server
   (ganze Zahl 1–1440, sonst Fehler) und wie dort in der Antwort genannt; am
   Ergebnis ändert es nichts – ein Prüflauf dauert Minuten, die Stimmen eines
   Laufs sind nie älter als das Fenster. */
const LIVE_MUSTER = {
  name: /^[A-Za-z0-9_-]{1,40}$/,
  geraet: /^[A-Za-z0-9_-]{8,64}$/,
  callback: /^[A-Za-z_$][\w$.]{0,63}$/,
  zahl: /^[0-9]{1,2}$/,
  minuten: /^[0-9]{1,4}$/
};
function liveAnfrageErkennen(url) {
  if (!LIVE.quellen.length) return null;
  let u;
  try { u = new URL(url); } catch (e) { return null; }
  const quelle = LIVE.quellen.find((q) => q.schluessel === u.origin + u.pathname);
  const aktion = u.searchParams.get('aktion');
  if (!quelle || (aktion !== 'stand' && aktion !== 'stimme')) return null;
  const p = {};
  u.searchParams.forEach((wert, name) => { if (!(name in p)) p[name] = wert; });
  return { quelle, aktion, p };
}
function liveBeantworten(p) {
  const passt = (muster, wert) => typeof wert === 'string' && muster.test(wert);
  const ganz = (wert) => (passt(LIVE_MUSTER.zahl, wert) ? Number(wert) : NaN);
  const json = (antwort, callback) => (callback
    ? { typ: 'application/javascript; charset=utf-8', text: callback + '(' + JSON.stringify(antwort) + ');', antwort }
    : { typ: 'application/json; charset=utf-8', text: JSON.stringify(antwort), antwort });
  if (p.callback !== undefined && !passt(LIVE_MUSTER.callback, p.callback)) return json({ ok: false, fehler: 'Ungültiger callback-Name.' }, null);
  const anzahl = ganz(p.anzahl);
  const minuten = passt(LIVE_MUSTER.minuten, p.minuten) && Number(p.minuten) >= 1 && Number(p.minuten) <= 1440 ? Number(p.minuten) : NaN;
  let fehlerText = null;
  if (!passt(LIVE_MUSTER.name, p.umfrage)) fehlerText = 'Ungültige Umfrage: nur Buchstaben, Ziffern, _ und -, höchstens 40 Zeichen.';
  else if (!passt(LIVE_MUSTER.name, p.runde)) fehlerText = 'Ungültige Runde: nur Buchstaben, Ziffern, _ und -, höchstens 40 Zeichen.';
  else if (!(anzahl >= 1 && anzahl <= 9)) fehlerText = 'Ungültige Anzahl: ganze Zahl von 1 bis 9.';
  else if (p.aktion === 'stand' && p.minuten !== undefined && !(minuten >= 1)) {
    fehlerText = 'Ungültige Minuten (Zeitfenster): ganze Zahl von 1 bis 1440 oder weglassen.';
  } else if (p.aktion === 'stimme') {
    const option = ganz(p.option);
    if (!(option >= 0 && option < anzahl)) fehlerText = 'Ungültige Option: ganze Zahl von 0 bis ' + (anzahl - 1) + '.';
    else if (!passt(LIVE_MUSTER.geraet, p.geraet)) fehlerText = 'Ungültige Geräte-ID: 8 bis 64 Zeichen, nur Buchstaben, Ziffern, _ und -.';
  }
  if (fehlerText) return json({ ok: false, fehler: fehlerText }, p.callback);
  const topf = p.runde + '|' + p.umfrage;
  if (p.aktion === 'stimme') {
    if (!LIVE.stimmen.has(topf)) LIVE.stimmen.set(topf, new Map());
    LIVE.stimmen.get(topf).set(p.geraet, ganz(p.option));
    return json({ ok: true }, p.callback);
  }
  if (opt.liveWerte && opt.liveWerte.length !== anzahl) {
    return json({ ok: false, fehler: 'Attrappe (pruefen.mjs): --live-werte hat ' + opt.liveWerte.length + ' Werte, angefragt sind ' + anzahl + '.' }, p.callback);
  }
  const werte = opt.liveWerte ? opt.liveWerte.slice() : new Array(anzahl).fill(0);
  (LIVE.stimmen.get(topf) || new Map()).forEach((o) => { if (o < anzahl) werte[o] += 1; });
  const antwort = { ok: true, werte, n: werte.reduce((s, w) => s + w, 0), zeit: new Date().toISOString() };
  if (p.minuten !== undefined) antwort.minuten = minuten;          /* wie die Fassung ab 20.10.2026 */
  return json(antwort, p.callback);
}
let druckSeite = null;      /* Anfragen von dort sind verdächtig: ?druck fragt nie ab */
function liveRoute(route, l) {
  let ausDruck = false;
  try { ausDruck = !!druckSeite && route.request().frame().page() === druckSeite; } catch (e) { /* z. B. Worker */ }
  LIVE.zaehler[l.aktion]++;
  if (ausDruck) {
    LIVE.zaehler.druck++;
    if (LIVE.zaehler.druck === 1) warnung('Live-Abstimmung', 'Die Druckansicht (?druck) hat die liveQuelle abgefragt (aktion=' + l.aktion + ') – das sollte nie passieren (js/komponenten.js, 3a). Beantwortet von der Attrappe.');
  }
  /* Zeitfenster: Die Stand-Abfrage muss minuten = gueltigMinuten tragen (ohne
     gueltigMinuten: kein minuten) – je Lauf einmal als Fehler melden */
  if (l.aktion === 'stand') {
    const soll = l.quelle.minuten ? String(l.quelle.minuten) : undefined;
    if (l.p.minuten !== soll) {
      LIVE.zaehler.falscheMinuten++;
      if (LIVE.zaehler.falscheMinuten === 1) {
        fehler('Live-Abstimmung', 'Stand-Abfrage ' + (l.p.minuten === undefined ? 'ohne minuten' : 'mit minuten=' + l.p.minuten) + ', erwartet ' +
          (soll ? 'minuten=' + soll + ' (marke.js → umfragen.' + l.quelle.id + '.gueltigMinuten)' : 'ohne minuten (gueltigMinuten 0 oder leer)') +
          ' – Folie 08 zählte sonst ' + (soll ? 'ohne Zeitgrenze' : 'mit einer Zeitgrenze, die marke.js nicht vorsieht') + ' (js/komponenten.js, 3a).');
      }
    }
  }
  /* --live-offline: wie ohne Internet – das Skript-Tag meldet einen Ladefehler */
  if (LIVE.modus === 'offline') {
    LIVE.zaehler.offline++;
    return route.abort('internetdisconnected');
  }
  /* Folie 08 liest nur (aktion=stand). Eine Stimme aus der Präsentation
     schriebe im Vortrag in Yannicks Tabelle → Fehler, trotzdem beantworten,
     damit die Seite nicht hängt. */
  if (l.aktion === 'stimme') {
    LIVE.zaehler.ausPraesentation++;
    fehler('Live-Abstimmung', 'Die Präsentation' + (ausDruck ? ' (Druckansicht)' : '') + ' hat aktion=stimme an die liveQuelle geschickt – Folie 08 darf nur aktion=stand abfragen.');
  }
  const a = liveBeantworten(l.p);
  if (!a.antwort.ok) {
    LIVE.zaehler.abgelehnt++;
    fehler('Live-Abstimmung', 'Attrappe lehnt die Anfrage ab (aktion=' + l.aktion + '): ' + a.antwort.fehler);
  }
  return route.fulfill({ status: 200, contentType: a.typ, body: a.text, headers: { 'cache-control': 'no-store' } });
}

/* Externe Anfragen blockieren und protokollieren – außer Anfragen an die
   liveQuelle (Attrappe, siehe Kopf) */
await kontext.route('**/*', (route) => {
  const url = route.request().url();
  if (/^(file|data|blob|about):/i.test(url)) return route.continue();
  const live = liveAnfrageErkennen(url);
  if (live) return liveRoute(route, live);
  bericht.externeAnfragen.push(url);
  return route.abort();
});
/* WebSockets laufen an kontext.route vorbei – eigens abfangen, schließen und
   als externe Anfrage (Fehler) melden. Die Präsentation nutzt keine. */
await kontext.routeWebSocket(/.*/, (ws) => {
  LIVE.zaehler.websockets++;
  bericht.externeAnfragen.push(ws.url() + ' (WebSocket)');
  return ws.close({ code: 1008, reason: 'pruefen.mjs: kein Netz' });
});

/* Vor jedem Skript der Seite: --live-aus blendet liveQuelle aus (Setter auf
   window.MARKE, marke.js bleibt unverändert); ohne ?aufnahme (Live-Simulation)
   die Klasse „aufnahme“ selbst setzen – sonst setzt sie deck.js aus der Adresse. */
await kontext.addInitScript(({ liveAus, klasse }) => {
  if (klasse) {
    const setzen = () => { if (!document.documentElement) return false; document.documentElement.classList.add('aufnahme'); return true; };
    if (!setzen()) new MutationObserver((m, beobachter) => { if (setzen()) beobachter.disconnect(); }).observe(document, { childList: true });
  }
  if (liveAus) {
    let marke;
    Object.defineProperty(window, 'MARKE', {
      configurable: true,
      enumerable: true,
      get: () => marke,
      set: (wert) => {
        if (wert && wert.umfragen) Object.values(wert.umfragen).forEach((u) => { if (u && typeof u === 'object') u.liveQuelle = ''; });
        marke = wert;
      }
    });
  }
}, { liveAus: opt.liveAus, klasse: LIVE.simulieren });

function adresse(extra, mitAufnahme = true) {
  const p = new URLSearchParams();
  if (mitAufnahme) p.set('aufnahme', '');
  if (opt.thema) p.set('thema', opt.thema);
  if (opt.modus) p.set('modus', opt.modus);
  if (opt.optional) p.set('optional', 'alle');
  if (opt.primaer) p.set('primaer', opt.primaer);
  if (opt.sekundaer) p.set('sekundaer', opt.sekundaer);
  Object.entries(extra || {}).forEach(([k, v]) => p.set(k, v));
  const suche = p.toString().replace(/=(&|$)/g, '$1');
  return pathToFileURL(datei).href + (suche ? '?' + suche : '');
}

function seiteBeobachten(seite, ort) {
  seite.on('console', (m) => {
    /* --live-offline: Der Ladefehler der liveQuelle ist gewollt (so meldet ihn
       der Browser auch ohne Internet) – zählen, nicht als Fehler werten */
    if (m.type() === 'error' && LIVE.modus === 'offline' && /^Failed to load resource: net::ERR_INTERNET_DISCONNECTED/.test(m.text()) &&
        liveAnfrageErkennen((m.location() || {}).url || '')) {
      LIVE.zaehler.konsoleOffline++;
      return;
    }
    if (m.type() === 'error') fehler(ort, 'Konsole: ' + m.text());
    else if (m.type() === 'warning') warnung(ort, 'Konsole (Warnung): ' + m.text());
  });
  seite.on('pageerror', (e) => fehler(ort, 'Seitenfehler: ' + e.message));
  seite.on('requestfailed', (r) => {
    const url = r.url();
    if (/^file:/i.test(url)) fehler(ort, 'Datei fehlt oder nicht lesbar: ' + decodeURIComponent(url.replace(/^file:\/\//, '')) + ' (' + (r.failure() || {}).errorText + ')');
  });
}

const seite = await kontext.newPage();
seiteBeobachten(seite, 'Seite');
/* Mit liveQuelle (ohne --live-aus) ohne ?aufnahme – siehe Kopf „LIVE-ABSTIMMUNG“ */
await seite.goto(adresse({}, !LIVE.simulieren), { waitUntil: 'load' });
try {
  await seite.waitForFunction(() => window.Deck && window.Deck.istBereit, null, { timeout: 15000 });
} catch (e) {
  fehler('Seite', 'Deck wurde nicht bereit (deck.js nicht geladen oder Fehler beim Start).');
  await ende();
}
await seite.evaluate(() => document.fonts && document.fonts.ready);
await seite.evaluate(() => window.Deck.testmodus(true));

/* ---------- Schriften ---------- */
bericht.schriften = await seite.evaluate(() => {
  const liste = [];
  document.fonts.forEach((f) => { if (f.status === 'loaded') liste.push(f.family.replace(/"/g, '') + ' ' + f.style + ' ' + f.weight); });
  return [...new Set(liste)];
});
const schriftCheck = await seite.evaluate(() => {
  const s = getComputedStyle(document.documentElement);
  return ['--schrift-display', '--schrift-text'].map((t) => {
    const fam = s.getPropertyValue(t).trim().split(',')[0];
    return { token: t, familie: fam, geladen: document.fonts.check('40px ' + fam) && [...document.fonts].some((f) => f.status === 'loaded' && fam.replace(/"/g, '') === f.family.replace(/"/g, '')) };
  });
});
schriftCheck.forEach((s) => { if (!s.geladen) fehler('Schriften', s.token + ': ' + s.familie + ' wurde nicht geladen (Pfad in tokens.css?)'); });

/* ---------- Farbpaare aus den Tokens (auch Text auf SVG-Flächen des Steuerrads) ----------
   [Schrift, Fläche, Mindestkontrast, Bedeutung]. Großtext (≥ 24 px) braucht 3 : 1,
   normaler Text 4,5 : 1 (WCAG 2.1 AA). Geprüft im aktuellen Thema und Modus. */
const PAARE = [
  ['--f-text', '--f-hintergrund', 4.5, 'Text auf Hintergrund'],
  ['--f-text-2', '--f-hintergrund', 4.5, 'Nebentext auf Hintergrund'],
  ['--f-text-2', '--f-flaeche', 4.5, 'Nebentext auf Fläche'],
  ['--f-text', '--f-karte', 4.5, 'Text auf Karte'],
  ['--f-akzent', '--f-hintergrund', 4.5, 'Akzenttext (Kicker) auf Hintergrund'],
  ['--f-akzent', '--f-akzent-flaeche', 4.5, 'Akzenttext auf Akzentfläche'],
  ['--f-auf-akzent', '--f-akzent', 4.5, 'Schrift auf Akzent (Etikett „Unsere Analyse“)'],
  ['--f-hart', '--f-hart-flaeche', 3, 'Feldname auf Hard-Facts-Feld (Großtext)'],
  ['--f-weich', '--f-weich-flaeche', 3, 'Feldname auf Soft-Facts-Feld (Großtext)'],
  ['--f-text-2', '--f-hart-flaeche', 4.5, 'Leitfrage auf Hard-Facts-Feld'],
  ['--f-text-2', '--f-weich-flaeche', 4.5, 'Leitfrage auf Soft-Facts-Feld'],
  ['--f-auf-kern', '--f-kern', 3, 'Schrift im Kern (Großtext)'],
  ['--f-erfolg', '--f-hintergrund', 4.5, 'Live-Pille'],
  ['--f-warnung', '--f-hintergrund', 4.5, 'Beispieldaten-Pille']
];
bericht.farbpaare = await seite.evaluate((paare) => {
  const leinwand = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = (farbe) => { leinwand.clearRect(0, 0, 1, 1); leinwand.fillStyle = '#000'; leinwand.fillStyle = farbe; leinwand.fillRect(0, 0, 1, 1); return [...leinwand.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const lum = ([r, g, b]) => { const k = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b); };
  const sonde = document.createElement('div');
  document.querySelector('.buehne').appendChild(sonde);
  const aufloesen = (token) => { sonde.style.color = 'var(' + token + ')'; return getComputedStyle(sonde).color; };
  const liste = paare.map(([vorne, hinten, soll, was]) => {
    const a = rgb(aufloesen(vorne)), b = rgb(aufloesen(hinten));
    const la = lum(a), lb = lum(b);
    const k = Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 100) / 100;
    return { was, vorne, hinten, kontrast: k, soll };
  });
  sonde.remove();
  return liste;
}, PAARE);
bericht.farbpaare.forEach((p) => {
  if (p.kontrast < p.soll) fehler('Farben', p.was + ': ' + p.kontrast + ' : 1 (Soll ' + p.soll + ' : 1; ' + p.vorne + ' auf ' + p.hinten + ')');
  else if (p.kontrast < 4.5) warnung('Farben', p.was + ': ' + p.kontrast + ' : 1 – reicht nur für Großtext (≥ 24 px)');
});

/* ---------- Folien ---------- */
let folien = await seite.evaluate(() => window.Deck.folien().map((f) => ({ id: f.id, nummer: f.nummer, titel: f.titel, schritte: f.schritteGesamt, backup: f.backup, optional: f.optional, zeit: f.zeit, feld: f.feld })));
if (opt.nur) {
  folien = folien.filter((f) => opt.nur.includes(f.id) || opt.nur.includes(f.nummer) || opt.nur.includes(String(Number(f.nummer))));
  if (!folien.length) fehler('Auswahl', '--nur ' + opt.nur.join(',') + ': keine passende Folie gefunden');
}

/* Prüfungen im Browser für die aktuell sichtbare Folie */
async function folieUntersuchen(id) {
  return seite.evaluate((folienId) => {
    const ergebnis = { ueberlauf: [], abgeschnitten: [], ueberlappung: [], klein: [], kontrast: [], woerter: 0, notizen: true, attribute: {} };
    const textFlaechen = [];   /* für die Überlappungsprüfung (Punkt 2b) */
    const folie = document.getElementById(folienId);
    const buehne = document.querySelector('.buehne');
    const bRect = buehne.getBoundingClientRect();
    const skala = bRect.width / 1920;
    const inBuehne = (r) => ({ l: (r.left - bRect.left) / skala, t: (r.top - bRect.top) / skala, r: (r.right - bRect.left) / skala, b: (r.bottom - bRect.top) / skala });
    const pfad = (el) => {
      const teile = [];
      let e = el;
      while (e && e !== folie && teile.length < 4) {
        let t = e.tagName.toLowerCase();
        if (e.id) t += '#' + e.id;
        else if (e.classList && e.classList.length) t += '.' + [...e.classList].slice(0, 2).join('.');
        teile.unshift(t);
        e = e.parentElement;
      }
      return teile.join(' > ');
    };
    const textVon = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    const sichtbar = (el) => {
      if (el.closest('.notizen, script, template, [hidden], .nur-screenreader, .ww-messer')) return false;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility !== 'visible') return false;
      let e = el;
      while (e && e !== folie.parentElement) {
        if (parseFloat(getComputedStyle(e).opacity) < 0.05) return false;
        e = e.parentElement;
      }
      const r = el.getBoundingClientRect();
      return r.width > 0.5 && r.height > 0.5;
    };
    const eigenerText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

    /* Farben in sRGB umrechnen (Canvas versteht oklch(), color() …) */
    const leinwand = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = (farbe) => {
      leinwand.clearRect(0, 0, 1, 1);
      leinwand.fillStyle = 'rgba(0,0,0,0)';
      leinwand.fillStyle = farbe;
      leinwand.fillRect(0, 0, 1, 1);
      const d = leinwand.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const lum = ([r, g, b]) => {
      const k = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
    };
    const mischen = (oben, unten) => {
      const a = oben[3];
      return [oben[0] * a + unten[0] * (1 - a), oben[1] * a + unten[1] * (1 - a), oben[2] * a + unten[2] * (1 - a), 1];
    };
    const hintergrund = (el) => {
      const schichten = [];
      let e = el;
      while (e) {
        const s = getComputedStyle(e);
        const f = rgba(s.backgroundColor);
        if (f[3] > 0) schichten.push(f);
        if (f[3] >= 0.999) break;
        e = e.parentElement;
      }
      let farbe = [255, 255, 255, 1];
      for (let i = schichten.length - 1; i >= 0; i--) farbe = mischen(schichten[i], farbe);
      return farbe;
    };
    const kontrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
    /* Deckkraft des Elements und aller Vorfahren bis zur Bühne, multipliziert
       (VORTRAGSREIFE A30, 21.10.2026): Vorher prüfte der Kontrast nur die Farbe –
       abgeblendete Zeilen (opacity 0,6) galten als voll deckend, z. B. 2,76 : 1
       auf 08b als „0 Fehler“. Näherung: Die Schrift wird mit dieser Deckkraft
       über den Hintergrund gemischt. */
    const deckkraft = (el) => {
      let d = 1;
      for (let e = el; e && e !== folie.parentElement; e = e.parentElement) d *= parseFloat(getComputedStyle(e).opacity);
      return d;
    };

    /* Metaangaben (dürfen 22–27 px haben) */
    const META = '.quelle, .meta, [data-meta], .kicker, .beispiel, .live, .chip:not(.chip--gross), .laufkopf, .karte-kicker, .angaben-titel, ' +
      '.sr-seite, .sr-ringtext, .sr-karte-folie, .sr-label-folie, .sr-karte-feld, .sr-quelle, .sr-label-klein, .umfrage-knopf, .umfrage-taste, .umfrage-marke, ' +
      '.legende, .zitat-quelle, .raetsel-fortschritt, .tabelle, .ww-eingabe, kbd, .taste, .qr-kurz, figcaption, .bild-platzhalter, [class*="legende"], [class*="skala"], [class*="-nr"]';

    const vollbild = folie.getAttribute('data-layout') === 'vollbild';
    const alleEl = [...folie.querySelectorAll('*')];
    for (const el of alleEl) {
      if (!sichtbar(el)) continue;
      if (el.closest('.raetsel-motiv, [data-ueberlauf-ok]')) continue;
      const r = inBuehne(el.getBoundingClientRect());
      /* 1. außerhalb der Bühne */
      if (r.l < -1 || r.t < -1 || r.r > 1921 || r.b > 1081) {
        if (!(vollbild && el.closest('.folie-inhalt') && el.closest('.raetsel'))) {
          ergebnis.ueberlauf.push({ el: pfad(el), text: textVon(el), rect: [Math.round(r.l), Math.round(r.t), Math.round(r.r), Math.round(r.b)] });
        }
      }
      const istSvgText = el instanceof SVGElement && /^(text|tspan|textPath)$/i.test(el.tagName);
      if (!(eigenerText(el) || istSvgText)) continue;
      if (el instanceof SVGElement && !istSvgText) continue;
      /* Textflächen sammeln: genaue Zeilenkästen der eigenen Textknoten */
      if (!istSvgText && !el.closest('[data-ueberlappung-ok]')) {
        const kaesten = [];
        for (const n of el.childNodes) {
          if (n.nodeType !== 3 || !n.textContent.trim()) continue;
          const bereich = document.createRange();
          bereich.selectNodeContents(n);
          /* Zeilenkasten = Schriftkegel (Ober- bis Unterlänge); bei engem
             Zeilenabstand überlappen sich Kegel benachbarter Zeilen, ohne dass
             sich Buchstaben berühren. Deshalb nur den Kern (mittlere 56 %) prüfen. */
          for (const q of bereich.getClientRects()) {
            if (q.width <= 1 || q.height <= 1) continue;
            const k = inBuehne(q), rand = (k.b - k.t) * 0.22;
            kaesten.push({ l: k.l, r: k.r, t: k.t + rand, b: k.b - rand });
          }
        }
        if (kaesten.length) textFlaechen.push({ el, kaesten });
      }
      const s = getComputedStyle(el);
      /* 2. abgeschnittener Text: im eigenen Kasten oder durch einen Vorfahren mit overflow */
      if (!istSvgText) {
        const ueber = (s.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) || (s.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 1);
        if (ueber || (s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1)) {
          ergebnis.abgeschnitten.push({ el: pfad(el), text: textVon(el), grund: 'Text passt nicht in sein Element' });
        } else {
          /* ragt der Text aus einem sichtbaren Kasten (Rand oder Hintergrund)? */
          let k = el.parentElement;
          while (k && k !== folie) {
            const ks = getComputedStyle(k);
            const hatKasten = parseFloat(ks.borderLeftWidth) > 0 || parseFloat(ks.borderTopWidth) > 0 || rgba(ks.backgroundColor)[3] > 0.05;
            if (hatKasten) {
              const kr = inBuehne(k.getBoundingClientRect());
              /* Absichtlich außen platzierte Beschriftung (absolut positioniert,
                 ganz außerhalb des Kastens, z. B. Methodenbeschreibung unter der
                 Karte im Steuerrad) ist kein Überlauf */
              let aussen = false;
              for (let a = el; a && a !== k; a = a.parentElement) {
                if (/^(absolute|fixed)$/.test(getComputedStyle(a).position)) {
                  const ar = inBuehne(a.getBoundingClientRect());
                  if (ar.r <= kr.l + 2 || ar.l >= kr.r - 2 || ar.b <= kr.t + 2 || ar.t >= kr.b - 2) aussen = true;
                  break;
                }
              }
              if (!aussen && (r.l < kr.l - 2 || r.r > kr.r + 2 || r.t < kr.t - 2 || r.b > kr.b + 2)) {
                ergebnis.abgeschnitten.push({ el: pfad(el), text: textVon(el), grund: 'ragt aus dem Kasten ' + pfad(k) });
              }
              break;
            }
            k = k.parentElement;
          }
          let v = el.parentElement;
          while (v && v !== folie) {
            const vs = getComputedStyle(v);
            if (vs.overflowX !== 'visible' || vs.overflowY !== 'visible') {
              const vr = inBuehne(v.getBoundingClientRect());
              if (r.l < vr.l - 2 || r.r > vr.r + 2 || r.t < vr.t - 2 || r.b > vr.b + 2) {
                ergebnis.abgeschnitten.push({ el: pfad(el), text: textVon(el), grund: 'ragt aus ' + pfad(v) + ' heraus' });
              }
              break;
            }
            v = v.parentElement;
          }
        }
      }
      /* 3. Schriftgröße in Bühnen-Pixeln */
      let groesse = parseFloat(s.fontSize);
      if (el instanceof SVGElement && el.ownerSVGElement) {
        const ctm = el.getScreenCTM();
        if (ctm) groesse = groesse * Math.hypot(ctm.a, ctm.b) / skala;
      } else {
        /* zusätzliche CSS-Skalierung (z. B. Vorschau) berücksichtigen */
        const echt = el.getBoundingClientRect().height / skala;
        if (echt > 0 && el.offsetHeight > 0) groesse = groesse * Math.min(1, echt / el.offsetHeight);
      }
      groesse = Math.round(groesse * 10) / 10;
      const istMeta = !!el.closest(META);
      if (groesse < 21.5) ergebnis.klein.push({ el: pfad(el), text: textVon(el), px: groesse, art: 'fehler' });
      else if (groesse < 27.5 && !istMeta) ergebnis.klein.push({ el: pfad(el), text: textVon(el), px: groesse, art: 'warnung' });
      /* 4. Kontrast (Text auf Bild, SVG-Flächen und Beispiel-Platzhalter werden anders geprüft) */
      if (!istSvgText && !el.closest('.sr-label, .raetsel, .bild-platzhalter, .qr') && !(vollbild && el.closest('.folie-kopf, .folie-fuss, .laufkopf'))) {
        const vorne = rgba(s.color);
        const d = deckkraft(el);
        if (vorne[3] > 0.05) {
          const hinten = hintergrund(el);
          const k = kontrast(mischen([vorne[0], vorne[1], vorne[2], vorne[3] * d], hinten), hinten);
          const fett = parseInt(s.fontWeight, 10) >= 700;
          const gross = groesse >= 24 || (fett && groesse >= 18.66);
          const soll = gross ? 3 : 4.5;
          if (k < soll) ergebnis.kontrast.push({ el: pfad(el), text: textVon(el), kontrast: Math.round(k * 100) / 100, soll, px: groesse,
            deckkraft: d < 0.999 ? Math.round(d * 100) / 100 : null });
        }
      }
    }

    /* 2b. Überlappender Text: Zeilen zweier verschiedener Elemente liegen
       übereinander (z. B. eine Beschreibung rutscht in die Quellenzeile).
       Ausnahme: Elemente mit data-ueberlappung-ok (und ihr Inhalt). */
    const schnitt = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 4 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 4;
    for (let i = 0; i < textFlaechen.length; i++) {
      for (let j = i + 1; j < textFlaechen.length; j++) {
        const A = textFlaechen[i], B = textFlaechen[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        if (A.kaesten.some((a) => B.kaesten.some((b) => schnitt(a, b)))) {
          ergebnis.ueberlappung.push({ a: pfad(A.el), ta: textVon(A.el), b: pfad(B.el), tb: textVon(B.el) });
        }
      }
    }

    /* 5. Wortbudget: sichtbarer Text ohne Kopfzeile, Quelle, Kennzeichnungen, Bedienelemente */
    let text = '';
    const zaehlen = (el) => {
      if (el.nodeType !== 1) return;
      /* Kennzeichnungen, Bedien- und Sprunghinweise zählen nicht als Folientext */
      if (el.matches('.beispiel, .live, .umfrage-werkzeuge, .ww-eingabe, .umfrage-taste, .raetsel-fortschritt, .sr-karte-folie, .sr-label-folie, .sr-quelle, [data-meta], script, [aria-hidden="true"], .nur-screenreader')) return;
      const s = getComputedStyle(el);
      if (s.display === 'none' || parseFloat(s.opacity) < 0.05) return;
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && s.visibility === 'visible') text += ' ' + n.textContent;
        else if (n.nodeType === 1 && n.tagName === 'BR') text += '\u0001';   /* Zeilenumbruch merken */
        else if (n.nodeType === 1) zaehlen(n);
      }
    };
    [...folie.children].filter((c) => !c.matches('.laufkopf, .folie-fuss, .notizen, script')).forEach(zaehlen);
    /* „Marken-<br>nutzen“ = ein Wort (Trennstrich am Zeilenende), sonst Umbruch = Leerraum */
    text = text.replace(/([\p{L}])-\s*\u0001\s*(?=\p{Ll})/gu, '$1').replace(/\u0001/g, ' ');
    ergebnis.woerter = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,–-]*/gu) || []).length;

    /* 6. Notizen und Attribute */
    const notiz = folie.querySelector(':scope > .notizen');
    ergebnis.notizen = !!(notiz && notiz.textContent.trim());
    ergebnis.attribute = {
      zeit: folie.getAttribute('data-zeit'), titel: folie.getAttribute('data-titel'),
      feld: folie.getAttribute('data-feld'), buendel: folie.getAttribute('data-buendel'),
      wortbudget: folie.getAttribute('data-wortbudget')
    };
    return ergebnis;
  }, id);
}

async function warteRahmen() {
  await seite.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/* Live-Abstimmung: Nach dem Betreten fragt die Folie sofort ab. Vor Bild und
   Prüfung warten, bis die Pille nicht mehr „verbinde“ zeigt (Antwort der
   Attrappe oder Ladefehler), dann den Zustand mit dem Modus vergleichen. */
const LIVE_SOLL = { null: 'live', werte: 'live', offline: 'offline' };
async function liveAbwarten(f, ort) {
  if (!LIVE.simulieren) return;
  const lesen = () => seite.evaluate((id) => [...document.querySelectorAll('#' + id + ' .umfrage')].filter((u) => u.querySelector('.umfrage-live')).map((u) => {
    const pille = u.querySelector('.umfrage-live');
    const zustand = ['verbinde', 'live', 'offline', 'pausiert'].find((z) => pille.classList.contains('ist-' + z)) || '';
    const n = u.querySelector('.umfrage-n');
    return { umfrage: u.getAttribute('data-umfrage'), pille: zustand, text: pille.textContent.trim(), titel: pille.title, n: n ? n.textContent.trim() : '' };
  }), f.id);
  if (!(await lesen()).length) return;
  try {
    await seite.waitForFunction((id) => ![...document.querySelectorAll('#' + id + ' .umfrage-live')].some((p) => p.classList.contains('ist-verbinde')), f.id, { timeout: 6000 });
  } catch (e) { /* Zustand unten melden */ }
  for (const z of await lesen()) {
    const schluessel = f.id + ' ' + z.umfrage;
    if (LIVE.anzeige[schluessel]) continue;            /* je Folie einmal melden */
    LIVE.anzeige[schluessel] = { pille: z.pille, text: z.text, n: z.n };
    const soll = LIVE_SOLL[LIVE.modus];
    if (soll && z.pille !== soll) {
      fehler(ort, 'Live-Abstimmung „' + z.umfrage + '“: Pille zeigt „' + (z.pille || '?') + '“, erwartet „' + soll + '“ (Modus ' + LIVE.modus + '; ' + z.titel + ')');
    }
  }
}

for (const f of folien) {
  const eintrag = { id: f.id, nummer: f.nummer, titel: f.titel, schritte: f.schritte, backup: f.backup, bilder: [] };
  const ort = 'Folie ' + f.nummer + ' (' + f.id + ')';
  const stufen = opt.schritte ? [...Array(f.schritte + 1).keys()] : [f.schritte];
  const zwischen = [];      /* Befunde der Zwischenschritte (nur mit --schritte) */
  for (const n of stufen) {
    await seite.evaluate(({ id, n }) => window.Deck.gehe(id, n, { sofort: true, still: true }), { id: f.id, n });
    await liveAbwarten(f, ort);
    await warteRahmen();
    if (!opt.ohneBilder) {
      const name = f.id + (opt.schritte ? '_s' + n : '') + '.png';
      await seite.screenshot({ path: path.join(ausgabe, name) });
      eintrag.bilder.push(name);
      bericht.screenshots.push(name);
    }
    if (opt.schritte && n !== f.schritte) zwischen.push({ n, u: await folieUntersuchen(f.id) });
  }
  /* Prüfungen im Endzustand (alle Schritte sichtbar) */
  if (stufen[stufen.length - 1] !== f.schritte) {
    await seite.evaluate(({ id, n }) => window.Deck.gehe(id, n, { sofort: true, still: true }), { id: f.id, n: f.schritte });
    await liveAbwarten(f, ort);
    await warteRahmen();
  }
  const u = await folieUntersuchen(f.id);
  eintrag.woerter = u.woerter;
  /* Befunde melden; jeder Befund nur einmal je Folie (Endzustand zuerst,
     danach Zwischenschritte mit Zusatz „nur in Schritt n“) */
  const gemeldet = new Set();
  const melden = (erg, zusatz) => {
    const einmal = (art, text, fn, extra) => { if (gemeldet.has(text)) return; gemeldet.add(text); fn(ort, text + (extra || '') + zusatz); };
    erg.ueberlauf.forEach((x) => einmal('u', 'außerhalb der Bühne: ' + x.el + ' „' + x.text + '“', fehler, ' [' + x.rect.join(', ') + ']'));
    erg.abgeschnitten.forEach((x) => einmal('a', 'abgeschnittener Text: ' + x.el + ' „' + x.text + '“ – ' + x.grund, fehler));
    erg.ueberlappung.forEach((x) => einmal('l', 'Text überlappt: ' + x.a + ' „' + x.ta + '“ ↔ ' + x.b + ' „' + x.tb + '“', fehler));
    erg.klein.forEach((x) => einmal('k', 'Schrift ' + x.px + ' px (' + (x.art === 'fehler' ? 'unter 22 px' : 'Inhaltstext unter 28 px') + '): ' + x.el + ' „' + x.text + '“', x.art === 'fehler' ? fehler : warnung));
    /* Abgeblendet (Deckkraft < 1): in Zwischenschritten gewollte Fokusführung →
       Warnung; im Endzustand bleibt das Bild stehen → Fehler (A30) */
    erg.kontrast.forEach((x) => einmal('c', 'Kontrast ' + x.kontrast + ' : 1 (Soll ' + x.soll + ' : 1, ' + x.px + ' px' +
      (x.deckkraft !== null && x.deckkraft !== undefined ? ', abgeblendet auf Deckkraft ' + x.deckkraft : '') + '): ' + x.el + ' „' + x.text + '“',
      x.deckkraft !== null && x.deckkraft !== undefined && zusatz ? warnung : fehler));
  };
  melden(u, '');
  zwischen.forEach((z) => melden(z.u, ' (nur in Schritt ' + z.n + ')'));
  const budget = Number(u.attribute.wortbudget) || 40;
  if (budget !== 40) { eintrag.wortbudget = budget; (bericht.wortbudgetAusnahmen = bericht.wortbudgetAusnahmen || []).push(f.id + ': ' + u.woerter + ' von ' + budget); }
  if (!f.backup && u.woerter > budget) warnung(ort, 'Wortbudget: ' + u.woerter + ' sichtbare Wörter (Hauptfolie höchstens ca. ' + budget + (budget !== 40 ? ', Ausnahme per data-wortbudget' : '') + ')');
  if (!u.notizen) warnung(ort, 'Sprechtext fehlt (<aside class="notizen">)');
  if (u.attribute.zeit === null) fehler(ort, 'data-zeit fehlt');
  if (!u.attribute.titel) warnung(ort, 'data-titel fehlt');
  bericht.folien.push(eintrag);
}

/* ---------- Druck / PDF ---------- */
if (opt.druck) {
  const pdfPfad = path.resolve(opt.druck);
  fs.mkdirSync(path.dirname(pdfPfad), { recursive: true });
  druckSeite = await kontext.newPage();
  seiteBeobachten(druckSeite, 'Druck');
  await druckSeite.goto(adresse({ druck: '' }), { waitUntil: 'load' });
  await druckSeite.waitForFunction(() => window.Deck && window.Deck.istBereit, null, { timeout: 15000 });
  await druckSeite.evaluate(() => document.fonts.ready);
  await druckSeite.emulateMedia({ media: 'print' });
  await druckSeite.pdf({ path: pdfPfad, preferCSSPageSize: true, printBackground: true });
  const roh = fs.readFileSync(pdfPfad).toString('latin1');
  const seiten = (roh.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const erwartet = await druckSeite.evaluate(() => window.Deck.folien().length);
  bericht.druck = { pdf: path.relative(process.cwd(), pdfPfad), seiten, erwartet };
  if (seiten !== erwartet) fehler('Druck', 'PDF hat ' + seiten + ' Seiten, erwartet ' + erwartet + ' (eine Seite je Folie)');
  await druckSeite.close();
}

await ende();

async function ende() {
  bericht.externeAnfragen = [...new Set(bericht.externeAnfragen)];
  bericht.externeAnfragen.forEach((u) => fehler('Netzwerk', 'externe Anfrage blockiert: ' + u));
  const liveAnzahl = LIVE.zaehler.stand + LIVE.zaehler.stimme;
  bericht.liveAnfragen = {
    anzahl: liveAnzahl,
    stand: LIVE.zaehler.stand,
    stimme: LIVE.zaehler.stimme,
    beantwortetVon: !LIVE.quellen.length ? '– (keine liveQuelle in marke.js)'
      : LIVE.modus === 'aus' ? '– (--live-aus: liveQuelle für diesen Lauf ausgeblendet)'
        : LIVE.modus === 'offline' ? 'niemandem: --live-offline lässt jede Anfrage scheitern (wie ohne Internet)'
          : 'eingebaute Attrappe in pruefen.mjs (nicht ins Netz)',
    modus: LIVE.modus,
    werte: LIVE.modus === 'werte' ? opt.liveWerte : LIVE.modus === 'null' ? 'lauter Nullen' : null,
    abgelehnt: LIVE.zaehler.abgelehnt,
    konsoleOffline: LIVE.zaehler.konsoleOffline,   /* gewollte Ladefehler bei --live-offline, kein Fehler */
    ausDruckansicht: LIVE.zaehler.druck,
    stimmeAusPraesentation: LIVE.zaehler.ausPraesentation,   /* > 0 ist ein Fehler (Folie liest nur) */
    zeitfenster: LIVE.quellen.map((q) => q.id + ': ' + (q.minuten ? 'minuten=' + q.minuten : 'ohne')),
    standOhnePassendeMinuten: LIVE.zaehler.falscheMinuten,   /* > 0 ist ein Fehler */
    quelle: LIVE.quellen.map((q) => q.id + ': ' + q.adresse),
    pruefseiteMitAufnahme: !LIVE.simulieren,
    anzeige: LIVE.anzeige
  };
  /* Abgeblendete Zwischenschritte (A30) sind gewollte Fokusführung und kommen
     in jedem Lauf mit --schritte vor – getrennt zählen, damit eine neue echte
     Warnung (Wortbudget, Schriftgröße) nicht darin untergeht (Nacharbeit D23,
     21.10.2026). */
  const abgeblendet = bericht.warnungen.filter((w) => /abgeblendet auf Deckkraft/.test(w.text)).length;
  const echteWarnungen = bericht.warnungen.length - abgeblendet;
  bericht.zusammenfassung = {
    folien: bericht.folien.length,
    screenshots: bericht.screenshots.length,
    fehler: bericht.fehler.length,
    warnungen: bericht.warnungen.length,
    warnungenOhneAbgeblendet: echteWarnungen,
    warnungenAbgeblendet: abgeblendet,
    warnungenKurz: echteWarnungen + (abgeblendet ? ' + ' + abgeblendet + ' gewollt abgeblendet (Zwischenschritte)' : ''),
    externeAnfragen: bericht.externeAnfragen.length,
    liveAnfragen: liveAnzahl,
    ausgabe: path.relative(process.cwd(), ausgabe) || '.',
    ergebnis: bericht.fehler.length ? 'FEHLER – bitte beheben'
      : (echteWarnungen ? 'ok mit Warnungen' : (abgeblendet ? 'ok (nur gewollt abgeblendete Zwischenschritte)' : 'ok'))
  };
  const json = JSON.stringify(bericht, null, 2);
  fs.writeFileSync(path.join(ausgabe, 'bericht.json'), json);
  console.log(json);
  await browser.close();
  process.exit(bericht.fehler.length ? 1 : 0);
}
