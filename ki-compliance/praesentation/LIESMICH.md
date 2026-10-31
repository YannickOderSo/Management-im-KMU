# Präsentation „Welches Risiko hat Ihre KI? Der EU AI Act und was er für KMU bedeutet“

Web-Präsentation (HTML) für das Modul Management im KMU. Öffnen: `index.html` in Chrome oder Edge (läuft offline per
Doppelklick; Live-Umfragen und QR-Codes brauchen Internet und GitHub Pages). Engine und Bedienung wie im
Führungs-Referat (`fuehrung/praesentation/`), eigene Gestaltung „Prüfpfad“.

Rechtsstand: 31.10.2026 (VO (EU) 2024/1689 in der Fassung der VO (EU) 2026/1744, KI-MIG vom 22.7.2026).
Allgemeine Information, keine Rechtsberatung.

## Bedienung

| Taste | Wirkung |
|---|---|
| → / Leertaste / Clicker | weiter (auch Schritte innerhalb einer Folie) |
| ← | zurück |
| P | Referentenansicht mit Sprechtext, Uhr und nächster Folie |
| O | Übersicht aller Folien |
| Ziffern + Enter | Sprung, z. B. `16 Enter` |
| T / D | Thema / hell–dunkel |
| B | Schwarzbild |

**Klassifizierer (Folien 16 und 18):** Ein Klick auf „weiter“ spielt den vorbereiteten Fall ab, der Pfad läuft
animiert durch den Baum. Auf Folie 18 startet der Knopf „Eigener Fall“ den freien Modus: Ja/Nein für einen Fall aus
dem Publikum klicken, ↶ nimmt die letzte Antwort zurück, „Neu“ beginnt von vorn. Die Klicks wechseln die Folie nicht.

**Notfall-PDF:** `export/ki-compliance-notfall.pdf` (eine Seite je Folie, Endzustand).
**Redeskript:** `export/redeskript.pdf` (Sprechtext je Folie, Klicks, Sollzeiten).

## Aufbau (25 Folien + 6 Backup, Sollzeit 30:20)

| Teil | Folien |
|---|---|
| Einstieg | 01 Titel (Sortiermaschine) · 02 Der Betrieb (Wimmelbild, sechs KI-Stellen) · 03 Prüfpfad |
| 1 Grundlagen | 04 Zeitstrahl mit Omnibus-Verschiebung · 05 Ist das überhaupt KI? · 06 Rollen |
| 2 Risikoklassen | 07 Pyramide · 08 Verbote · 09 Zwei Türen ins Hochrisiko · 10 Der Filter · 11 Pflichten · 12 Transparenz · 13 Minimal und Art. 4 · 14 GPAI |
| 3 Selbst prüfen | 15 Umfrage Fall 1 · 16 Klassifizierer Fall 1 · 17 Umfrage Fall 2 · 18 Klassifizierer: gleiche Technik, andere Klasse · 19 KI-Inventar des Betriebs |
| 4 KMU-Praxis | 20 KMU in Zahlen · 21 Sechs Irrtümer · 22 Bußgeld und Erleichterungen · 23 Fünf Schritte und Praxisblick |
| Schluss | 24 Eine Kamera, drei Klassen · 25 Diskussion mit QR-Code zum Klassifizierer |
| Backup | B1 Quellen · B2 Zehn Verbote · B3 Anhang III · B4 Digital-Omnibus · B5 AI Act, DSGVO, BetrVG · B6 Methode |

## Was steht wo

| Datei | Inhalt |
|---|---|
| `index.html` | alle Folien mit Sprechtext (`aside.notizen`) |
| `marke.js` | Angaben, Farben, Live-Umfragen (`ki-bewerbung`, `ki-anrufe`) |
| `js/klassifizierer-daten.js` | **die Prüflogik** (16 Fragen, 13 Ergebnisse, 8 Beispielfälle), einzige Quelle für Folien und Handy-Seite |
| `js/klassifizierer.js` | Logik (`Klassifizierer.Pruefung`) und Baustein `.klassifizierer` für die Folien |
| `klassifizierer.html` | Klassifizierer zum Mitnehmen (Handy, QR-Code auf Folie 25); speichert und sendet nichts |
| `abstimmen.html`, `js/abstimmen.js` | Abstimmseite der Live-Umfragen (wie im Führungs-Referat, Formen der Risikoklassen ergänzt) |
| `css/folien/ki.css` | Fundament „Prüfpfad“: Farben, Klassen (Farbe + Form + Wort), Laufleiste, Bausteine |
| `css/folien/ki-folien.css`, `css/folien/klassifizierer.css` | Gestaltung der Folien und des Baums |
| `js/folien/ki.js` | Laufleiste, Punkte im Wimmelbild, Formen in den Umfragen |
| `js/deck.js`, `js/komponenten.js`, `css/tokens.css`, `deck.css`, `komponenten.css`, `schriften/` | Engine (unverändert) |
| `werkzeuge/pruefen.mjs`, `werkzeuge/redeskript.mjs` | Prüfung mit Screenshots und Notfall-PDF; Redeskript |

Belege: `../recherche/rechtspruefung.md` (alle Rechtsangaben am Amtsblatt, BGBl. und an Kommissionsdokumenten geprüft,
31.10.2026) und `../recherche/kmu-zahlen.md` (51 Zahlen mit Quelle). Die Prüflogik beruht auf den Antworten der
internen SimpleAct-KI (Fragebogen `../befragung/fragebogen-interne-ki.md`, Auswertung `../befragung/auswertung.md`).

## Vor dem Vortrag

1. `marke.js`: `datum` eintragen; bei beiden Umfragen `runde` von `'probe'` auf eine eigene Vortragsrunde setzen.
2. GitHub Pages zeigt den Branch `claude/exciting-meitner-w27zwy`. Erst wenn dieser Ordner dort liegt, funktionieren
   die QR-Codes (Abstimmseite, Klassifizierer). Plan B ohne Netz: Handzeichen, Klick auf die Balken zählt.
3. Freigabe von Kamill für die SimpleAct-Inhalte (Prüflogik, „29 Fragen“, Regelwerk 3.0, Beobachtungen aus dem Support).
4. Prüfen:

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte --druck export/ki-compliance-notfall.pdf
```

Stand 31.10.2026: 0 Fehler über alle Folien und Schritte. 20 Warnungen, alle zum Wortbudget (über 40 Wörter auf
inhaltlich dichten Folien wie Definition, Pflichten, Irrtümer).
