# Präsentation „Welches Risiko hat Ihre KI? Der EU AI Act und was er für KMU bedeutet“

Web-Präsentation (HTML) für das Modul Management im KMU. Öffnen: `index.html` in Chrome oder Edge (läuft offline per
Doppelklick; Live-Umfragen und QR-Codes brauchen Internet und GitHub Pages). Engine und Bedienung wie im
Führungs-Referat (`fuehrung/praesentation/`), eigene Gestaltung „Prüfpfad“.

**Vortrag: Montag, 9. November 2026 · Elias Knauber und Yannick Heisler.** Aufteilung (Vorschlag, Regiehinweise in den
Notizen): Yannick 01–05, 20–28, 32–37 (alle SimpleAct-Teile) · Elias 06–19, 29–31.

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
| `js/klassifizierer-daten.js` | **die Prüflogik** (17 Fragen, 13 Ergebnisse, 8 Beispielfälle; Emotionserkennung zieht Anhang III und Art. 50 Abs. 3 automatisch nach), einzige Quelle für Folien und Handy-Seite |
| `js/klassifizierer.js` | Logik (`Klassifizierer.Pruefung`) und Baustein `.klassifizierer` für die Folien |
| `klassifizierer.html` | Klassifizierer fürs Handy (QR-Codes auf Folie 24 und 37); speichert und sendet nichts |
| `abstimmen.html`, `js/abstimmen.js` | Abstimmseite der Live-Umfragen (wie im Führungs-Referat, Formen der Risikoklassen ergänzt) |
| `css/folien/ki.css` | Fundament „Prüfpfad“: Farben, Klassen (Farbe + Form + Wort), Laufleiste, Bausteine |
| `css/folien/ki-folien.css`, `css/folien/klassifizierer.css` | Gestaltung der Folien und des Baums |
| `js/folien/ki.js` | Laufleiste, Punkte im Wimmelbild, Formen in den Umfragen, Bußgeld-Rechner, Countdown |
| `js/folien/ki-animation.js` | Choreografie mit GSAP (Titel, Zeitstrahl, Pyramide, Stempel, Inventar-Flug, Kernbotschaft); aus bei reduzierter Bewegung, Druck und Prüfung |
| `js/vendor/gsap/` | GSAP 3.15.0 mit SplitText und MotionPath (Standard-Lizenz, kostenlos auch kommerziell; `LIZENZ-GSAP.txt`) |
| `werkzeuge/icons-erzeugen.py` | schreibt die Phosphor-Duotone-Icons (MIT, `bilder/LIZENZ-phosphor-icons-MIT.txt`) als Symbole in `index.html` |
| `werkzeuge/wimmelbild-erzeugen.py` | erzeugt das isometrische Wimmelbild und die Lage der sechs Punkte |
| `js/deck.js`, `js/komponenten.js`, `css/tokens.css`, `deck.css`, `komponenten.css`, `schriften/` | Engine (unverändert) |
| `werkzeuge/pruefen.mjs`, `werkzeuge/redeskript.mjs` | Prüfung mit Screenshots und Notfall-PDF; Redeskript |

Upgrade auf Kunden-Niveau (Grafik, Animation, Text-Diät) umgesetzt am 31.10.2026; Kundenfassung (White-Label) folgt nach
dem Vortrag: `../recherche/gestaltung-upgrade.md`.

Belege: `../recherche/rechtspruefung.md` (alle Rechtsangaben am Amtsblatt, BGBl. und an Kommissionsdokumenten geprüft,
31.10.2026; zweite, fünffache Prüfung von Prüflogik, Folien und Notizen am selben Tag, Abschnitt „Zweite Prüfung“) und `../recherche/kmu-zahlen.md` (51 Zahlen mit Quelle). Die Prüflogik beruht auf den Antworten der
internen SimpleAct-KI (Fragebogen `../befragung/fragebogen-interne-ki.md`, Auswertung `../befragung/auswertung.md`).

## Vor dem Vortrag

**Go-Live-Checkliste mit Terminen, Generalprobe, Raum-Check, Spickzettel und Kürzungsplan: `../GO-LIVE.md`.**

1. ✅ `marke.js`: `datum` 2026-11-09, alle acht Umfragen auf Runde `'vortrag-2026-11-09'`. Stimmen zählen 30 Minuten,
   die Schätzfrage (Folie 04) 90 Minuten, weil sie erst auf Folie 26 aufgelöst wird. Teststimme am Vortragstag nur bei
   Folie 02 und spätestens 30 Minuten vor Beginn; die Schätzfrage am Vortragstag nicht testen.
2. ✅ Auf GitHub Pages veröffentlicht (Branch `claude/exciting-meitner-w27zwy`), QR-Codes geprüft. Plan B ohne Netz:
   Handzeichen, Klick auf die Balken zählt.
3. ✅ Freigabe der SimpleAct-Inhalte erteilt (laut Yannick, 31.10.2026).
4. Prüfen:

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte --druck export/ki-compliance-notfall.pdf
```

Stand 31.10.2026 (nach dem Upgrade): 0 Fehler und 0 Warnungen über alle Folien und Schritte, Notfall-PDF 43 Seiten,
Redeskript Sollzeit 50:45. Wortbudget 40 je Hauptfolie; drei ausdrückliche Ausnahmen per `data-wortbudget` (26 Inventar-
Tabelle, 28 Irrtümer, 29 Rechner).

5. Probelauf am Präsentationslaptop: Animationen flüssig? Sonst `?bewegung=reduziert` an die Adresse hängen (zeigt
   alles ohne Bewegung, gleicher Inhalt).
