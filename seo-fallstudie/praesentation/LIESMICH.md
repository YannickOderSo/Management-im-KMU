# Präsentation „SEO-Fallstudie unter der Lupe“

Web-Präsentation (HTML) für das Modul Management im KMU (Hochschule Kaiserslautern, Campus
Zweibrücken): Vorstellung und kritische Bewertung der Fallstudie
[„SEO Case Study: 6-Step Process That Generated 150,732 Visits“](https://www.robbierichards.com/seo/case-study/)
von Robbie Richards (Gastbeitrag Michael Karp, Kunde UAV Coach). Vortrag: Elias Knauber und Yannick Heisler.
28 Folien, 3 Trennfolien und 2 Backup-Folien, Sollzeit 23:00 (Summe `data-zeit`).

**Öffnen:** `index.html` in Chrome oder Edge. Läuft offline per Doppelklick und auf GitHub Pages,
ohne Anfragen ins Internet. Immer den ganzen Ordner `praesentation/` mitnehmen.

## Bedienung

| Taste | Wirkung |
|---|---|
| → / ↓ / Leertaste / Enter / Clicker | weiter, auch Schritte innerhalb einer Folie |
| ← / ↑ / Rücktaste | zurück |
| Ziffern + Enter | Sprung zur Folie, z. B. `17 Enter` |
| P | Referentenansicht im zweiten Fenster: Sprechtext, Uhr, Plan „von 23:00“, nächste Folie |
| O | Übersicht aller Folien |
| F | Vollbild |
| B oder . | Schwarzbild |
| D | hell / dunkel |
| H oder ? | Hilfe |

## Gestaltung „Unter der Lupe“

Zwei Stimmen ziehen sich durch die ganze Präsentation: **Blau** ist, was die Fallstudie
behauptet, **Orange**, was die Prüfung findet. Teil 1 (Vorstellung) ist blau, Teil 2 (Bewertung)
orange, Teil 3 (KMU) bringt beide zusammen; der farbige Punkt vor der Rubrik oben rechts zeigt
den Teil. Screenshots aus der Fallstudie stehen als „Belege“ in einem schlichten Browserrahmen,
eigene Markierungen sind orange (Befund) oder blau (Behauptung). Alle Diagramme (Suchergebnis,
Eisberg, Trichter, Netz, Zeitstrahl, Waage, Punktraster) sind eigene Zeichnungen in SVG/CSS.
Schriften: Bricolage Grotesque (Titel, Zahlen) und Inter (Text), beide lokal in `schriften/`.

## Aufbau

| Nr. | Folie | Soll |
|---|---|---|
| 01 | Titel: 150.732 Besuche – was steckt dahinter? | 0:25 |
| 02 | Fahrplan und Leitfrage | 0:40 |
| 03 | SEO in einer Minute (Skizze Suchergebnisseite, vier Begriffe) | 0:50 |
| 04 | Der Fall: UAV Coach, Karp, Richards | 0:50 |
| 05 | Das Versprechen: sechs Kennzahlen | 0:50 |
| T1 | Teil 1: Die Methode | 0:05 |
| 06 | Sechs Schritte im Überblick | 0:40 |
| 07 | Schritt 1: Keywords (Eisberg, 1.331 Keywords) | 0:55 |
| 08 | Schritt 1: Konkurrenz prüfen (Inhaltstyp, 366 vs. 9.565) | 0:50 |
| 09 | Schritt 2: Inhalt (303 vs. 4.774 Wörter) | 0:50 |
| 10 | Schritt 3: On-Page (Seitenskizze) | 0:50 |
| 11 | Schritt 4: Leads (Trichter, 2.335 E-Mails) | 0:55 |
| 12 | Schritt 5: Promotion | 0:45 |
| 13 | Schritt 6: Backlinks | 0:50 |
| 14 | Verlauf: Monat 0 bis 18 | 0:55 |
| T2 | Teil 2: Kritische Bewertung | 0:05 |
| 15 | Prüfraster: sechs Fragen | 0:40 |
| 16 | Widersprüchliche Zahlen | 0:55 |
| 17 | Basiseffekt: 1.232 → 150.732 organische Sitzungen | 1:00 |
| 18 | Kausalität: Einzelfall, Survivorship Bias | 0:55 |
| 19 | „Vor Mashable“ – welcher Treffer, bleibt offen | 0:45 |
| 20 | Interessenkonflikte: 15 Partnerlinks, Kurs, Beratung | 0:55 |
| 21 | Aktualität: erschienen 2015, KI-Übersichten (Pew 2025) | 1:05 |
| 22 | Wirtschaftlichkeit: Waage | 0:50 |
| 23 | Was trägt | 0:45 |
| 24 | Gesamturteil (Ampel) | 0:45 |
| T3 | Teil 3: Was heißt das für KMU? | 0:05 |
| 25 | Behalten, anpassen, streichen | 1:00 |
| 26 | Beispiel Heizungsbauer (fiktiv) | 0:50 |
| 27 | Fazit | 0:45 |
| 28 | Diskussion | 0:30 |
| B1 | Quellen (Backup) | – |
| B2 | Belege zu den Widersprüchen (Backup) | – |

Sprechtext steht je Folie in `aside.notizen` (`p.gesprochen` je Schritt, Absätze ohne Klasse sind
Hintergrund für Rückfragen) und erscheint in der Referentenansicht (Taste P). Zum Kürzen auf
ca. 21 Minuten eignen sich die Folien 08, 12 und 19 (zusammen 2:20).

## Präsentationsskript

`export/praesentationsskript.pdf` (A4, 24 Seiten, druckfest in Schwarz-Weiß) ist das Skript zum
Vortragen, Aufbau wie in `fuehrung/` und `recap/`: Titelseite mit Ablauf, Überblick mit
Zwischenzeiten, je Teil jede Folie mit Vorschaubild, Startzeit, Sprechtext je Klick und
Randnotizen „Bei Rückfragen“; Anhang mit 15 Rückfragen samt Antworten, Quellen als Text,
Kürzungsplan in zwei Stufen (−45 s, zusammen −80 s; Sätze stehen wortgleich im Sprechtext) und
Plan B. Sprechtext, Notizen und Zeiten kommen immer frisch aus `index.html`, alles Übrige aus
`werkzeuge/skript-zusatz.json`. Erzeugen im Ordner `praesentation/`:

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/praesentationsskript.mjs
```

Neu erzeugen nach jeder Änderung an Sprechtext, Notizen, `data-zeit` oder `skript-zusatz.json`.

**Locker formulierte Fassung:** `export/praesentationsskript-locker.pdf`, gleicher Aufbau, Sprechtext
in Alltagssprache aus `werkzeuge/skript-locker.json` (Schlüssel „f07/0“ = Folie f07, Schritt 0;
„f04/g“ = Absatz ohne Schritt). Zahlen nur gerundet, wo die genaue Zahl nicht der Punkt ist; auf
den Folien 16 und 17 bleiben sie exakt. Eigener Kürzungsplan mit Sätzen aus dieser Fassung.
Erzeugen wie oben, mit `SKRIPT_TEXTE=werkzeuge/skript-locker.json` vor dem Aufruf. Bei
Änderungen am Sprechtext in `index.html` die lockere Fassung inhaltlich mitziehen.
Die Trennfolien tragen dafür `data-block="1…3"`.

## Geprüfte Befunde (Stand 05.11.2026, von vier Prüfungen gegengeprüft)

- Titel 150.732, Einleitung 152.732 Besuche; Text „6 Monate“ (+11.065 %) und „18 Monate“
  (152.732), Screenshot 12.02.–11.11.2015 (9 Monate) gegen 15.05.2014–11.02.2015: +12.134,74 %,
  150.732 vs. 1.232 organische Sitzungen der ganzen Website (Bericht nach Keyword; nicht nur der
  Ratgeber, der selbst 20.314 Seitenaufrufe über Google in 6 Monaten brachte). 1.232 ÷ 9 ≈ 137.
- 4.400 Wörter (Einleitung) vs. 4.774 (Schritt 2, späterer Stand). Suchvolumen 720 (Auswahl 2015)
  vs. 260 (SEMrush, Nov. 2018) – verschiedene Jahre, kein echter Widerspruch. Schwach: 1.331 vs.
  1.314 Keywords (zwei SEMrush-Berichte), 17 vs. 18 Kapitel (Vorlage einer Outreach-Mail).
- „Without spending any money on … link building“ meint: keine gekauften Links; trotzdem 90 Tage
  Linkaufbau durch einen bezahlten Berater.
- Im `<article>`: 15 eindeutige Links mit Partner-/Affiliate-Kennung (23 Vorkommen; ein weiterer
  SEMrush-Link in der Seitenleiste), 15 „Editor’s notes“, 5 Links auf den Kurs „The SEO Playbook“,
  2 Beratungsangebote.
- Erschienen Nov. 2015 (Kommentare ab Nov. 2015), neu datiert 02.08.2020, geändert 22.11.2022;
  142 von 143 Inhaltsbildern aus 2018/12. Der UAV-Coach-Artikel hieß schon 2018 „How to Fly a
  Drone …“, 2024 neu datiert.
- Mashable: Die Studie belegt nur eine Kategorie-Seite (mashable.com/category/drones/), ohne Bezug
  zu einem Keyword; welcher Treffer überholt wurde, bleibt offen.
- Pew Research Center (22.07.2025): Klick auf ein normales Ergebnis bei 8 % der Aufrufe einer
  Suchseite mit KI-Übersicht gegenüber 15 % ohne. KI-Übersichten USA 14.05.2024, Deutschland
  26.03.2025. 53 % = abgebrochene mobile Besuche (Google/DoubleClick 2016).

## Bilder

`bilder/fallstudie/` enthält Screenshots aus der Fallstudie (als JPEG neu gespeichert). Sie werden
als Beleg für die kritische Auseinandersetzung zitiert (§ 51 UrhG), jeweils mit Quellenangabe auf
der Folie. Eigene Markierungen liegen als HTML über den Bildern, die Originale bleiben unverändert.

## Prüfen und Notfall-PDF

Im Ordner `praesentation/`:

```
CHROME_PFAD=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_CORE=/opt/node-tools/node_modules/playwright-core \
node werkzeuge/pruefen.mjs index.html --ausgabe _test/pruefung --schritte --druck export/seo-fallstudie-notfall.pdf
```

Stand 05.11.2026: 0 Fehler, hell und dunkel; 7 Warnungen zum Wortbudget (Folien 02, 08, 12, 20,
21, 24, 25 mit 42–58 sichtbaren Wörtern). Notfall-PDF mit 33 Seiten (alle Folien im Endzustand).
