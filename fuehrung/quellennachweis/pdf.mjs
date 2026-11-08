// Erzeugt quellennachweis.pdf aus index.html (A4 quer) und meldet die Seitenzahl.
// Aufruf aus dem Repo-Stammordner: node fuehrung/quellennachweis/pdf.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ordner = path.dirname(fileURLToPath(import.meta.url));
const ziel = path.join(ordner, 'quellennachweis.pdf');
const browser = await chromium.launch();
const seite = await browser.newPage();
await seite.emulateMedia({ media: 'print', colorScheme: 'light' });
await seite.goto(pathToFileURL(path.join(ordner, 'index.html')).href);
await seite.evaluate(() => document.fonts.ready);
// Kopf- und Fußzeile wie im Handout-Schema (Titel oben links, Seitenzahl unten rechts)
const klein = 'font: 7px Arial, sans-serif; color: #6b6b66; width: 100%; padding: 0 15mm;';
await seite.pdf({
  path: ziel, format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="${klein}">Führung im KMU · Quellennachweis · Yannick Heisler</div>`,
  footerTemplate: `<div style="${klein} text-align: right;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>`
});
await browser.close();

const seiten = (fs.readFileSync(ziel, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`quellennachweis.pdf erzeugt: ${seiten} Seite(n)`);
