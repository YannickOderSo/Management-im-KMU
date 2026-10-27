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

Belege: Die Nummern `[n]` in den Fußzeilen entsprechen dem Quellenverzeichnis in `../../recherche/literaturbasis.md`.

## Vor dem Vortrag

1. `marke.js`: `datum` und `dauerMinuten` prüfen, `runde` von `'probe'` auf `'vortrag-2026-11-02'` (Vortrag Mo, 2.11.2026) stellen.
2. Folie 10: Antworten der beiden Fragebögen eintragen (Kasten „FOLIE 10“ in `index.html`).
3. GitHub Pages einschalten (Repository → Settings → Pages), damit der QR-Code auf Folie 08 funktioniert;
   Abstimmseite einmal mit dem Handy testen.
4. Prüfen: `PLAYWRIGHT_CORE=… node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte`
