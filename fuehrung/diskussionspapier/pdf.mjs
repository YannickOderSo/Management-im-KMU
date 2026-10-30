// Erzeugt diskussionspapier.pdf (Handout) aus index.html (A4) und prüft die Vorgabe „höchstens zwei Seiten“.
// Aufruf aus dem Repo-Stammordner: node fuehrung/diskussionspapier/pdf.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ordner = path.dirname(fileURLToPath(import.meta.url));
const ziel = path.join(ordner, 'diskussionspapier.pdf');
const browser = await chromium.launch();
const seite = await browser.newPage();
await seite.emulateMedia({ media: 'print', colorScheme: 'light' });
await seite.goto(pathToFileURL(path.join(ordner, 'index.html')).href);
await seite.evaluate(() => document.fonts.ready);
// Kopf- und Fußzeile wie im Handout-Schema (Titel oben links, Seitenzahl unten rechts)
const klein = 'font: 7px Arial, sans-serif; color: #6b6b66; width: 100%; padding: 0 18mm;';
await seite.pdf({
  path: ziel, format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="${klein}">Führung im KMU · Handout · Yannick Heisler</div>`,
  footerTemplate: `<div style="${klein} text-align: right;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>`
});
await browser.close();

const seiten = (fs.readFileSync(ziel, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`diskussionspapier.pdf erzeugt: ${seiten} Seite(n)`);
if (seiten > 2) { console.error('ZU LANG: höchstens 2 Seiten erlaubt'); process.exit(1); }
