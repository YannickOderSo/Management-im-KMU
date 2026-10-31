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

**Mitmachen (acht Live-Fragen):** Folien 02, 04, 09, 20, 22, 25, 33 und 36 haben je einen QR-Code zur Abstimmseite.
Ohne Netz: Handzeichen, Klick auf eine Antwort zählt +1. Die Schätzfrage (Folie 04) wird erst auf Folie 26 aufgelöst
(„x % haben richtig geschätzt“).

**Klassifizierer (Folien 21 und 23):** Ein Klick auf „weiter“ spielt den vorbereiteten Fall ab, der Pfad läuft
animiert durch den Baum. Auf Folie 23 startet der Knopf „Eigener Fall“ den freien Modus: Ja/Nein für einen Fall aus
dem Publikum klicken, ↶ nimmt die letzte Antwort zurück, „Neu“ beginnt von vorn. Die Klicks wechseln die Folie nicht.

**Partnerarbeit (Folie 24):** Klick startet den Countdown (3:00); Klick auf die Uhr hält an oder setzt fort.
**Bußgeld-Rechner (Folie 29):** Knöpfe 2 / 10 / 50 Mio. € oder Regler; Tasten im Regler wechseln die Folie nicht.

**Notfall-PDF:** `export/ki-compliance-notfall.pdf` (eine Seite je Folie, Endzustand).
**Redeskript:** `export/redeskript.pdf` (Sprechtext je Folie, Klicks, Sollzeiten).

## Aufbau (37 Folien + 6 Backup, Sollzeit 50:45 + Diskussion, insgesamt ca. eine Stunde)

| Teil | Folien |
|---|---|
| Einstieg | 01 Titel · 02 Umfrage: KI-Nutzung · 03 Der Betrieb (Wimmelbild) · 04 Umfrage: Schätzung · 05 Prüfpfad |
| 1 Grundlagen | 06 Zeitstrahl · 07 Ist das KI? (Handzeichen) · 08 Rollen · 09 Umfrage: Welche Rolle? · 10 Wer kontrolliert? |
| 2 Risikoklassen | 11 Pyramide · 12 Verbote · 13 Daumen-Runde · 14 Zwei Türen · 15 Filter · 16 Pflichten · 17 Transparenz · 18 Minimal und Art. 4 · 19 GPAI |
| 3 Selbst prüfen | 20 Umfrage Fall 1 · 21 Klassifizierer · 22 Umfrage Fall 2 · 23 Gleiche Technik, andere Klasse (freier Modus) · 24 Partnerarbeit mit Handy-Klassifizierer · 25 Umfrage: Ihre Ergebnisse · 26 KI-Inventar und Auflösung der Schätzung |
| 4 KMU-Praxis | 27 KMU in Zahlen · 28 Sechs Irrtümer (Handzeichen) · 29 Bußgeld-Rechner · 30 Kosten und Entlastung · 31 Drei Gesetze · 32 Wer macht was im Betrieb? · 33 Umfrage: Was zuerst? · 34 Fünf Schritte |
| Schluss | 35 Eine Kamera, drei Klassen · 36 Umfrage: Bremse oder Vertrauen? · 37 Diskussion mit QR-Code |
| Backup | B1 Quellen · B2 Zehn Verbote · B3 Anhang III · B4 Digital-Omnibus · B5 AI Act, DSGVO, BetrVG · B6 Methode |

## Was steht wo

| Datei | Inhalt |
|---|---|
| `index.html` | alle Folien mit Sprechtext (`aside.notizen`) |
| `marke.js` | Angaben, Farben, acht Live-Umfragen (`ki-nutzung` … `ki-meinung`) |
| `js/klassifizierer-daten.js` | **die Prüflogik** (16 Fragen, 13 Ergebnisse, 8 Beispielfälle), einzige Quelle für Folien und Handy-Seite |
| `js/klassifizierer.js` | Logik (`Klassifizierer.Pruefung`) und Baustein `.klassifizierer` für die Folien |
| `klassifizierer.html` | Klassifizierer fürs Handy (QR-Codes auf Folie 24 und 37); speichert und sendet nichts |
| `abstimmen.html`, `js/abstimmen.js` | Abstimmseite der Live-Umfragen (wie im Führungs-Referat, Formen der Risikoklassen ergänzt) |
| `css/folien/ki.css` | Fundament „Prüfpfad“: Farben, Klassen (Farbe + Form + Wort), Laufleiste, Bausteine |
| `css/folien/ki-folien.css`, `css/folien/klassifizierer.css` | Gestaltung der Folien und des Baums |
| `js/folien/ki.js` | Laufleiste, Punkte im Wimmelbild, Formen in den Umfragen, Bußgeld-Rechner, Countdown |
| `js/deck.js`, `js/komponenten.js`, `css/tokens.css`, `deck.css`, `komponenten.css`, `schriften/` | Engine (unverändert) |
| `werkzeuge/pruefen.mjs`, `werkzeuge/redeskript.mjs` | Prüfung mit Screenshots und Notfall-PDF; Redeskript |

Belege: `../recherche/rechtspruefung.md` (alle Rechtsangaben am Amtsblatt, BGBl. und an Kommissionsdokumenten geprüft,
31.10.2026) und `../recherche/kmu-zahlen.md` (51 Zahlen mit Quelle). Die Prüflogik beruht auf den Antworten der
internen SimpleAct-KI (Fragebogen `../befragung/fragebogen-interne-ki.md`, Auswertung `../befragung/auswertung.md`).

## Vor dem Vortrag

1. `marke.js`: `datum` eintragen; bei allen acht Umfragen `runde` von `'probe'` auf eine eigene Vortragsrunde setzen.
2. GitHub Pages zeigt den Branch `claude/exciting-meitner-w27zwy`. Erst wenn dieser Ordner dort liegt, funktionieren
   die QR-Codes (Abstimmseite, Klassifizierer). Plan B ohne Netz: Handzeichen, Klick auf die Balken zählt.
3. ✅ Freigabe der SimpleAct-Inhalte erteilt (laut Yannick, 31.10.2026).
4. Prüfen:

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte --druck export/ki-compliance-notfall.pdf
```

Stand 31.10.2026 (Stunden-Fassung): 0 Fehler über alle Folien und Schritte, Notfall-PDF 43 Seiten. 28 Warnungen,
alle zum Wortbudget (über 40 Wörter auf inhaltlich dichten Folien).
