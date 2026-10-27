// Erzeugt diskussionspapier.pdf aus index.html (A4) und prüft die Vorgabe „höchstens zwei Seiten“.
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
await seite.pdf({ path: ziel, format: 'A4', preferCSSPageSize: true, printBackground: true });
await browser.close();

const seiten = (fs.readFileSync(ziel, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`diskussionspapier.pdf erzeugt: ${seiten} Seite(n)`);
if (seiten > 2) { console.error('ZU LANG: höchstens 2 Seiten erlaubt'); process.exit(1); }
