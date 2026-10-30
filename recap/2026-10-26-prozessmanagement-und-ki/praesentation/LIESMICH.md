# Recap-Präsentation „Sitzung vom 26.10.2026“

Web-Präsentation (HTML) für die Recap im Modul Management im KMU, vorgetragen von Elias Knauber und Yannick Heisler.
Öffnen: `index.html` in Chrome oder Edge (läuft offline per Doppelklick). Engine und Bedienung wie im Führungs-Referat
(`fuehrung/praesentation/`), aber mit eigener Gestaltung „Der rote Faden“ (Karmin auf Kreide, Tinte als Schrift).

## Bedienung

| Taste | Wirkung |
|---|---|
| → / Leertaste / Clicker | weiter (auch Schritte innerhalb einer Folie) |
| ← | zurück |
| P | Referentenansicht mit Sprechtext, Uhr und nächster Folie (zweites Fenster) |
| O | Übersicht aller Folien |
| Ziffern + Enter | Sprung, z. B. `7 Enter` |
| T / D | Thema / hell–dunkel |
| B | Schwarzbild |

**Notfall-PDF** (Plan B): `export/recap-notfall.pdf` (eine Seite je Folie, Endzustand).

## Aufbau (ca. 17 Min., Sollzeiten zusammen 16:50)

| Block | Folien | Grundlage |
|---|---|---|
| Einstieg | 01 Titel · 02 Vier Blöcke + These | – |
| 1 Prozesse (Maximilian Büchele) | 03 Begriff · 04 Übergaben · 05 Zeitstrahl · 06 Sichten und Prozessarten · 07 Lebenszyklus | Folien 6–11 der Referenten, Transkript |
| 2 KI im KMU (Elbrus Tschekuev) | 08 Verbreitung · 09 Größe vs. Know-how · 10 TOE · 11 TAM · 12 Einsatz und Kosten · 13 Recht | Folien 31–41 der Referenten, Transkript |
| 3 KI-Begriffe (Klaus Knopper) | 14 Wie ein LLM antwortet · 15 Chatbot, Prompt, Modellfamilien · 16 Agenten · 17 KI-Führerschein | `../quellen/knopper-ki-begriffe.md`, OLAT-Kurs „KI-Kompetenz“ (in der Sitzung gemeinsam bearbeitet), Mitschrift |
| 4 Gastvortrag Bundeswehr | 18 Führen beim Bund · 19 Bindung und Technik | `../quellen/mitschrift-yannick.txt` (keine Folien) |
| Schluss | 20 Fazit · B1 Quellen (Backup) | – |

Nur vorgetragene Inhalte: Bei Max endete Teil 1 nach der Folie Modellierung, bei Elbrus vor dem Fallbeispiel energis.
Beides steht auf den Folien 02, 07 und 13.

Die Folien zeigen keine Namen der Vortragenden (Aufteilung offen). Der Sprechtext steht je Folie in `aside.notizen`
und ist in der Referentenansicht (Taste P) zu sehen.

## Was steht wo

| Datei | Inhalt |
|---|---|
| `index.html` | alle Folien mit Sprechtext |
| `marke.js` | Namen, Farben, Dauer; **`datum`** für den Vortragstermin (noch leer) |
| `css/folien/recap.css`, `js/folien/recap.js` (Fundament), `recap-b1/b2/b34.*` (Blöcke) | eigene Gestaltung, Fahrplan-Leiste in der Kopfzeile |
| `js/deck.js`, `js/komponenten.js`, `css/tokens.css`, `deck.css`, `komponenten.css`, `schriften/` | Engine (unverändert aus `fuehrung/praesentation/`) |
| `werkzeuge/pruefen.mjs` | automatische Prüfung (Überlauf, Schriftgrößen, Kontrast, Screenshots) |

## Prüfen

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte --druck export/recap-notfall.pdf
```

Stand 30.10.2026 (nach Redesign und Gestaltungs-/Inhaltsprüfung): 0 Fehler, 0 Warnungen.
