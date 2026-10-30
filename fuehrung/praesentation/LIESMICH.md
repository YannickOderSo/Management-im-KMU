# Präsentation „Führung im KMU“

Web-Präsentation (HTML) für das Referat im Modul Management im KMU. Öffnen: `index.html` in Chrome oder Edge
(läuft offline per Doppelklick; die Live-Umfrage braucht Internet und GitHub Pages).

## Bedienung

| Taste | Wirkung |
|---|---|
| → / Leertaste / Clicker | weiter (auch Schritte innerhalb einer Folie) |
| ← | zurück |
| R | Referentenansicht mit Sprechtext, Uhr und nächster Folie (zweites Fenster) |
| O | Übersicht aller Folien |
| Ziffern + Enter | Sprung, z. B. `7 Enter` |
| T / D | Thema / hell–dunkel |
| B | Schwarzbild |
| ? | Hilfe |

PDF: `index.html?druck` öffnen und drucken (eine Seite je Folie, Endzustand).
**Notfall-PDF** (Plan B, falls Browser oder Beamer streiken): `export/praesentation-notfall.pdf` – neu erzeugen mit
`node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --druck export/praesentation-notfall.pdf`.

## Aufbau (Vortrag 35 Min. + 10 Min. Diskussion, Sollzeiten zusammen ca. 32:30)

| Teil | Folien |
|---|---|
| Einstieg | 01 Titel · 02 Fahrplan |
| 1 Begriff | 03 Definitionen · 04 Arbeitsdefinition · 05 Drei Rollen |
| 2 KMU | 06 KMU und Mittelstand |
| 3 Besonderheiten | 07 Führung ist persönlich · 08 Live-Umfrage · 09 Kontinuum |
| 4 Instrumente | 10 Fünf Werkzeuge · 11 Personalarbeit · 12 Gespräche/Ziele · 13 Delegation · 14 Feedback/Beteiligung |
| 5 Praxis | 15 Befragung · 16 Herausforderungen · 17 Pflegedienst · 18 Sechs Betriebe |
| Schluss | 19 Kernbotschaft · 20 Diskussion |
| Backup | B1 Quellen · B2 Definitionen · B3 Definitionseffekt · B4 Methode · B5 Quellen Instrumente |

## Was steht wo

| Datei | Inhalt |
|---|---|
| `index.html` | alle Folien mit Sprechtext (`aside.notizen`), Kasten „FOLIE xx“ je Folie |
| `marke.js` | Datum, Dauer, Farben, Live-Umfrage (`umfragen.fuehrung`, `runde`) |
| `css/folien/fuehrung.css`, `js/folien/fuehrung.js` | eigene Gestaltung und Animationen |
| `js/deck.js`, `js/komponenten.js`, `css/tokens.css`, `deck.css`, `komponenten.css` | Engine aus dem Modul Unternehmenskommunikation (unverändert) |
| `abstimmen.html`, `js/abstimmen.js` | Abstimmseite für die Handys (QR-Code auf Folie 08) |
| `live-abstimmung/` | Google-Apps-Script der Live-Abstimmung und Anleitung |
| `werkzeuge/pruefen.mjs` | automatische Prüfung (Überlauf, Schriftgrößen, Kontrast, Screenshots) |

Belege: Die Nummern `[n]` in den Fußzeilen entsprechen den Quellenverzeichnissen in `../../recherche/literaturbasis.md` ([1]–[40]) und `../../recherche/literaturbasis-instrumente.md` ([41]–[62]).

## Vor dem Vortrag

1. ✅ `marke.js`: `datum` 2026-11-02, `dauerMinuten` 35, `runde` steht auf `'vortrag-2026-11-02'`. Eine Teststimme vom Handy
   zählt nur, wenn sie jünger als 30 Minuten ist (`gueltigMinuten`) – also spätestens eine halbe Stunde vor dem Vortrag testen.
2. ✅ Befragung eingetragen (Folie 09: Stufen im JSON „befragte“, Folie 15, B4; Beleg: `../befragung/auswertung.md`).
3. ✅ GitHub Pages ist eingeschaltet (Branch `claude/exciting-meitner-w27zwy`), QR-Codes auf Folie 08 und 20 führen dorthin.
   Abstimmseite einmal mit dem Handy testen.
4. Prüfen: `PLAYWRIGHT_CORE=… node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte`
