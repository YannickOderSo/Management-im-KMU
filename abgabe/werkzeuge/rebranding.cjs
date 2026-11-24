// Erfasst die Website „Rebranding-Roulette“ (Repo Marketing) als Vektor-PDF:
// Startseite, Auslosung, die acht Felder des Musterbeispiels, das Pitch-Board
// und die acht Pitch-Folien. Schreibt zu jeder Ansicht eine PDF-Datei und eine ansichten.json
// mit den Stellen, an denen eine lange Seite sauber geteilt werden darf.
//
// Aufruf: node rebranding.cjs <Marketing-Ordner> <Ausgabe-Ordner> <Schriften-Ordner> <Schriften-CSS>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const [, , wurzelArg, ausgabeArg, schriftenArg, schriftenCssArg] = process.argv;
if (!wurzelArg || !ausgabeArg) {
  console.error('Aufruf: node rebranding.cjs <Marketing-Ordner> <Ausgabe-Ordner> <Schriften-Ordner> <Schriften-CSS>');
  process.exit(2);
}
const wurzel = path.resolve(wurzelArg);
const ausgabe = path.resolve(ausgabeArg);
const schriften = schriftenArg ? path.resolve(schriftenArg) : null;
const schriftenCss = schriftenCssArg ? fs.readFileSync(schriftenCssArg, 'utf8') : '';
fs.mkdirSync(ausgabe, { recursive: true });

const BREITE = 1280;
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };

function server() {
  return new Promise((fertig) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      let datei;
      if (schriften && p.startsWith('/__schriften/')) datei = path.join(schriften, path.basename(p));
      else datei = path.join(wurzel, p);
      if (!(datei.startsWith(wurzel) || (schriften && datei.startsWith(schriften))) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'content-type': TYPEN[path.extname(datei)] || 'application/octet-stream' });
      fs.createReadStream(datei).pipe(res);
    }).listen(0, '127.0.0.1', () => fertig(s));
  });
}

// Feste Zufallsfolge, damit die Auslosung bei jedem Bau dieselbe ist.
const ZUFALL = `(() => { let s = 20261124; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;

// Schrift: statische TrueType-Schnitte statt der variablen Web-Schrift (sonst Type-3-Schrift im PDF).
const SCHRIFT_CSS = schriftenCss ? `${schriftenCss}
:root { --font-display: "InterDisplay", "Inter", Arial, sans-serif !important; --font-body: "InterText", "Inter", Arial, sans-serif !important; }` : '';
const RUHE_CSS = `.reveal { opacity: 1 !important; transform: none !important; } * { animation: none !important; transition: none !important; }`;

// Text mit Farbverlauf (background-clip: text) hinterlässt im PDF einen feinen Rahmen um das Wort.
// Für die Aufnahme bekommt deshalb jeder Buchstabe die Verlaufsfarbe an seiner Stelle als feste Farbe.
function verlaufstextImBrowser() {
  const stopps = [[0, [0x0A, 0x86, 0xB0]], [0.45, [0x08, 0x62, 0x6C]], [0.75, [0x00, 0x8F, 0x57]], [1, [0x6E, 0x9A, 0x12]]];
  const farbe = (t) => {
    for (let i = 1; i < stopps.length; i++) {
      if (t <= stopps[i][0]) {
        const [t0, a] = stopps[i - 1], [t1, b] = stopps[i];
        const u = (t - t0) / (t1 - t0);
        return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * u)).join(',')})`;
      }
    }
    return `rgb(${stopps[stopps.length - 1][1].join(',')})`;
  };
  for (const el of document.querySelectorAll('.grad')) {
    const text = el.textContent;
    el.textContent = '';
    const zeichen = [...text].map((z) => { const sp = document.createElement('span'); sp.textContent = z; el.appendChild(sp); return sp; });
    el.style.background = 'none';
    el.style.webkitBackgroundClip = 'border-box';
    el.style.backgroundClip = 'border-box';
    const r = el.getBoundingClientRect();
    for (const sp of zeichen) {
      const b = sp.getBoundingClientRect();
      const t = r.width ? Math.min(1, Math.max(0, (b.left + b.width / 2 - r.left) / r.width)) : 0;
      sp.style.color = farbe(t);
      sp.style.webkitTextFillColor = farbe(t);
    }
  }
}

// Teilstellen: Ober- und Unterkanten von Blöcken, die kein anderer Block kreuzt.
function teilstellenImBrowser(maxHoehe) {
  const kandidaten = new Set();
  const atome = [];
  const gehe = (el, tiefe) => {
    for (const kind of el.children) {
      const stil = getComputedStyle(kind);
      if (stil.display === 'none' || stil.position === 'fixed') continue;
      const r = kind.getBoundingClientRect();
      if (r.height < 1 || r.width < 1) continue;
      const oben = r.top + scrollY, unten = r.bottom + scrollY;
      kandidaten.add(Math.round(oben)); kandidaten.add(Math.round(unten));
      if (r.height > maxHoehe && tiefe < 7 && kind.children.length) gehe(kind, tiefe + 1);
      else atome.push([oben, unten]);
    }
  };
  gehe(document.body, 0);
  const hoehe = document.documentElement.scrollHeight;
  const gueltig = [...kandidaten].filter((y) => y > 0 && y < hoehe && !atome.some(([o, u]) => o < y - 1 && u > y + 1)).sort((a, b) => a - b);
  return { hoehe, teilstellen: gueltig };
}

(async () => {
  const srv = await server();
  const basis = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const ansichten = [];

  async function neueSeite(hoehe = 900) {
    const ctx = await browser.newContext({ viewport: { width: BREITE, height: hoehe }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce', locale: 'de-DE' });
    await ctx.addInitScript(ZUFALL);
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const seite = await ctx.newPage();
    seite.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
    return { ctx, seite };
  }
  async function bereit(seite, zusatzCss = '') {
    await seite.addStyleTag({ content: `${SCHRIFT_CSS}\n${RUHE_CSS}\n${zusatzCss}` });
    await seite.evaluate(() => document.fonts.ready);
    await seite.waitForTimeout(500);
    await seite.evaluate(() => document.fonts.ready);
    await seite.evaluate(verlaufstextImBrowser);
  }

  // 1) Bildschirmansichten als eine lange PDF-Seite
  const FELD_CSS = '.site-header, .site-footer, .step-foot { display: none !important; } body { padding-top: 0 !important; } .wrap { padding-top: 20px !important; padding-bottom: 20px !important; }';
  const bildschirm = [
    { name: 'start', hash: '', titel: 'Startseite', css: '' },
    { name: 'auslosung', hash: '#auslosung', titel: 'Auslosung am Beamer', css: '' },
    { name: 'feld-1-analyse', hash: '#muster/analyse', titel: 'Feld 1: Ist-Analyse', css: FELD_CSS },
    { name: 'feld-2-persona', hash: '#muster/persona', titel: 'Feld 2: Persona', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-3-strategie', hash: '#muster/strategie', titel: 'Feld 3: Markenstrategie', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-4-markenkern', hash: '#muster/markenkern', titel: 'Feld 4: Markenkern neu', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-5-positionierung', hash: '#muster/positionierung', titel: 'Feld 5: Positionierung', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-6-mix', hash: '#muster/mix', titel: 'Feld 6: Marketing-Mix (4P)', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-7-pitch', hash: '#muster/pitch', titel: 'Feld 7: Pitch', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'feld-8-logo', hash: '#muster/logo', titel: 'Feld 8: Logo-Studio', css: FELD_CSS + ' .muster-banner { display: none !important; }' },
    { name: 'pitch-board', hash: '#muster/board', titel: 'Pitch-Board', css: FELD_CSS + ' .muster-banner, .board-actions, .pitch-timer, .board-timer { display: none !important; }' },
  ];
  {
    const { ctx, seite } = await neueSeite();
    await seite.emulateMedia({ media: 'screen', colorScheme: 'light', reducedMotion: 'reduce' });
    for (const a of bildschirm) {
      await seite.goto(`${basis}index.html${a.hash}`);
      await seite.reload();
      await bereit(seite, a.css);
      const { hoehe, teilstellen } = await seite.evaluate(teilstellenImBrowser, 1500);
      await seite.pdf({ path: path.join(ausgabe, `${a.name}.pdf`), width: `${BREITE}px`, height: `${hoehe}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
      ansichten.push({ name: a.name, titel: a.titel, art: 'bildschirm', breitePx: BREITE, hoehePx: hoehe, teilstellen });
      console.log(a.name, hoehe);
    }
    await ctx.close();
  }

  // 2) Pitch-Folien: jede Folie einzeln im Format 16:9 (Bildschirmansicht ohne Bedienleiste)
  {
    const { ctx, seite } = await neueSeite(720);
    await seite.emulateMedia({ media: 'screen', colorScheme: 'light', reducedMotion: 'reduce' });
    await seite.goto(`${basis}index.html#muster/board`);
    await bereit(seite, `.deck-bar, .deck-hit, .deck-rotate { display: none !important; }
      .deck { grid-template-rows: minmax(0, 1fr) !important; }
      .deck-stage { padding: 0 !important; }
      .slide { border-radius: 0 !important; }
      body.deck-open > :not(.deck) { display: none !important; }`);
    await seite.click('[data-action="slides"]');
    await seite.waitForSelector('.deck .slide');
    const anzahl = await seite.locator('.deck .slide').count();
    const dateien = [];
    for (let i = 0; i < anzahl; i++) {
      await seite.evaluate((n) => document.querySelector(`.deck-dot[data-deck-go="${n}"]`).click(), i);
      await seite.waitForTimeout(250);
      const datei = `pitch-folie-${String(i + 1).padStart(2, '0')}.pdf`;
      await seite.pdf({ path: path.join(ausgabe, datei), width: `${BREITE}px`, height: '720px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
      dateien.push(datei);
    }
    ansichten.push({ name: 'pitch-folien', titel: 'Pitch-Folien', art: 'folien', dateien });
    console.log('pitch-folien', anzahl);
    await ctx.close();
  }

  fs.writeFileSync(path.join(ausgabe, 'ansichten.json'), JSON.stringify(ansichten, null, 2));
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
