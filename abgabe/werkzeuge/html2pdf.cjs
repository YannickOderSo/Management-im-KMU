// Druckt eine HTML-Datei mit Chromium als PDF (Seitengröße aus dem CSS der Datei).
// Aufruf: node html2pdf.cjs <eingabe.html> <ausgabe.pdf>
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const [, , ein, aus] = process.argv;
  if (!ein || !aus) { console.error('Aufruf: node html2pdf.cjs <eingabe.html> <ausgabe.pdf>'); process.exit(2); }
  const browser = await chromium.launch();
  const seite = await browser.newPage();
  seite.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
  await seite.goto(pathToFileURL(path.resolve(ein)).href);
  await seite.evaluate(() => document.fonts.ready);
  await seite.waitForTimeout(200);
  await seite.pdf({ path: path.resolve(aus), printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
