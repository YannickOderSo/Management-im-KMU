// Erzeugt interviewbogen.pdf aus interviewbogen.html (A4, Druckansicht).
// Aufruf aus dem Repo-Stammordner: node fuehrung/interviews/pdf.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ordner = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const seite = await browser.newPage();
await seite.emulateMedia({ media: 'print', colorScheme: 'light' });
await seite.goto(pathToFileURL(path.join(ordner, 'interviewbogen.html')).href);
await seite.pdf({ path: path.join(ordner, 'interviewbogen.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('interviewbogen.pdf erzeugt');
