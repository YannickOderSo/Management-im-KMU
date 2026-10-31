# Recherche: Grafiken und Animationen auf Kunden-Niveau

Stand: 31.10.2026 · Anlass: Die Präsentation soll nach dem Vortrag am 9.11.2026 auch für Kunden genutzt werden
(ggf. angepasst). Frage: Lassen sich Grafiken und Animationen hochwertiger umsetzen, und braucht es dafür Verbindungen
(Konnektoren)?

## Ergebnis in drei Sätzen

1. **Für Animationen und Grafiken braucht es keine neue Verbindung.** Die besten Werkzeuge lassen sich als Dateien
   lokal einbinden und laufen offline (Doppelklick, Notfall-PDF, Beamer ohne Netz).
2. **Der Qualitätssprung kommt aus drei Dingen:** einer professionellen Animations-Bibliothek (GSAP), einer
   einheitlichen Icon-Familie (Phosphor Duotone) und neu gezeichneten Schlüsselgrafiken (Wimmelbild, Pyramide, Trichter).
3. **Für die Kundenfassung fehlen keine Werkzeuge, sondern Inhalte:** SimpleAct-CI (Logo, Farben, Schrift), ein
   eigenes Abstimm-Backend statt des privaten Google-Kontos und eine Hosting-Adresse von SimpleAct.

## Geprüfte Werkzeuge

| Werkzeug | Stand | Lizenz | Offline | Nutzen für uns |
|---|---|---|---|---|
| **GSAP 3.15.0** mit SplitText, DrawSVG, MorphSVG, Flip, MotionPath | npm, `dist/*.min.js` vorhanden (geprüft 31.10.2026) | Standard „no charge“ License: kommerzielle Nutzung frei, alle früheren Club-Plugins eingeschlossen; verboten nur Nutzung in No-Code-Animations-Baukästen, die mit Webflow konkurrieren, und Entfernen von Hinweisen | ja (UMD-Dateien in `js/vendor/`) | Choreografie, Morphing, Pfad-Animationen, Text-Auftritte; pausier- und rückspulbar je Folienschritt |
| **Phosphor Icons Core 2.1.1** | npm, 1.512 Duotone-SVGs (geprüft) | MIT | ja (SVG-Symbole inline) | eine Icon-Familie in sechs Strichstärken; Duotone: Zweitfarbe = Klassenfarbe |
| Lucide (static 1.66.0) | npm | ISC | ja | Alternative, nur Strich; kein Duotone |
| View Transitions API | im Browser, in `deck.js` schon genutzt | – | ja | Morph gleicher Elemente zwischen Folien (Prüfpfad, Klassenformen, Wimmelbild) |
| Lottie / dotLottie, Rive | – | je nach Datei | teils (WASM-Player per `file://` heikel) | nur mit fertigen Animationsdateien aus After Effects bzw. Rive-Editor; Stilbruch-Gefahr, kein Mehrwert gegenüber GSAP |
| KI-Bildgenerierung | kein Konnektor vorhanden | Rechte und Stil uneinheitlich | – | **nicht empfohlen** für eine Kundenpräsentation (Stilbruch zu Vektorgrafik, Rechtefragen, kein Druck in Endzustand) |

**Verbindungen (Konnektoren), Stand dieser Sitzung:**

| Verbindung | Status | Brauchen wir sie? |
|---|---|---|
| Google Drive | verbunden | nur, falls dort SimpleAct-CI (Logo, Farben, Vorlagen) liegt; dann übernehme ich sie direkt |
| Figma | nicht verbunden | nur sinnvoll, wenn SimpleAct Designs oder ein Designsystem in Figma pflegt |
| Canva | nicht verbunden | nur sinnvoll, wenn das Brand-Kit in Canva liegt |
| Google Slides | nicht verbunden | nein (würde Animationen und Interaktion verlieren) |

## Ehrliche Bestandsaufnahme der jetzigen Fassung

Gut und kundentauglich: Farbsystem mit Form und Wort je Klasse, Klassifizierer, Live-Umfragen, Rechner, Prüfung
(0 Fehler), Belege, Notfall-PDF.

Noch nicht auf Kunden-Niveau:

- **Icons und Piktogramme** sind selbst gezeichnet, in Strichstärke und Detailgrad uneinheitlich (Verbote,
  Transparenz-Szenen, Rollen, Aufsicht, Schritte).
- **Schlüsselgrafiken** sind flach: Wimmelbild als Strichzeichnung, Pyramide und Trichter als Flächen, Venn-Diagramm
  mit Beschriftungen, die an den Kreisrändern knapp sitzen.
- **Animationen** sind überwiegend Einblenden und Hochschieben; es fehlen Übergänge, die Zusammenhänge zeigen
  (z. B. Punkte des Wimmelbilds wandern in die Inventartabelle, Termine rutschen sichtbar auf dem Zeitstrahl).
- **Textmenge:** 28 Folien über dem Wortbudget von 40 Wörtern.
- **Kundenfähigkeit:** Hochschulbezüge (Modul, Studierende, Nebenjob), Abstimmung über ein privates Google-Konto,
  Hosting auf einem öffentlichen Studenten-Repository, keine SimpleAct-CI.

## Empfohlenes Upgrade-Paket

### A Animations-Choreografie mit GSAP (lokal eingebunden)

| Folie | Heute | Mit GSAP |
|---|---|---|
| 01 Titel | Karten gleiten linear | Titel baut sich wortweise auf (SplitText); Karten folgen einer Bahn durch den Trichter und federn ins Fach (MotionPath) |
| 06 Zeitstrahl | Datum wird umgeschaltet | Achse zeichnet sich (DrawSVG); beim Omnibus-Klick gleiten die Hochrisiko-Marken sichtbar nach rechts (Flip) |
| 11 Pyramide | Stufen schieben hoch | Stufen wachsen aus der Grundlinie; auf Klick lösen sich die Stufen in die Klassenformen auf (MorphSVG) |
| 21, 23 Klassifizierer | eigener Pfad-Code | Pfad und Marke über eine GSAP-Zeitleiste: glatter, pausierbar, rückwärts abspielbar |
| 03 → 26 Wimmelbild | zwei getrennte Folien | Punkte färben sich nacheinander und fliegen in die Inventartabelle (Flip über View Transition) |
| 27 Zahlen, 29 Rechner | Balken wachsen linear | Zähler und Balken mit weicher Federung, Werte rollen mit |
| Übergänge | Engine-Standard | gemeinsame Elemente morphen: Prüfpfad-Leiste, Klassenformen, Stellen-Nummern |

Pflicht: `prefers-reduced-motion`, Druck und Notfall-PDF zeigen weiter den Endzustand; jede Animation zeigt einen
Gedanken (Herleitung, Vergleich, Veränderung), keine Effekte um ihrer selbst willen.

### B Grafiksprache

- **Eine Icon-Familie:** Phosphor Duotone für alle Symbole; die Zweitfarbe trägt die Klassenfarbe. Ersetzt die
  selbst gezeichneten Piktogramme (zehn Verbote, Transparenz, Rollen, Aufsicht, Schritte, Kosten).
- **Wimmelbild neu:** isometrische Illustration des Betriebs mit Tiefe (drei Tinte-Töne), Stellen als Pins; gleiche
  sechs Stellen und Klassen.
- **Pyramide, Trichter, Venn:** dezente Tiefe (Verlauf, Schatten), Beschriftungen außerhalb der Formen mit
  Führungslinien statt in engen Schnittmengen.
- **Diagramme:** direkte Beschriftung, ruhige Achsen, eine Hervorhebungsfarbe je Diagramm.

### C Text-Diät

Alle Hauptfolien auf höchstens 40 Wörter; Details wandern in Sprechtext und Backup. Ziel: 0 Warnungen in der Prüfung.

### D Kundenfassung (nach dem 9.11.2026)

- **White-Label über `marke.js`:** SimpleAct-Logo, Farben, ggf. Schrift; Klassenfarben bleiben (sie tragen Bedeutung).
- **Hochschulbezüge austauschbar:** Titel, Fragen (statt „Nebenjob“ z. B. „in Ihrem Unternehmen“), Diskussionsfolie.
- **Abstimmung:** eigenes Abstimm-Backend unter SimpleAct-Konto (oder SimpleAct-Server), mit Datenschutzhinweis;
  nicht über ein privates Google-Konto.
- **Hosting:** eigene SimpleAct-Adresse statt öffentlichem Studenten-Repository; QR-Codes zeigen dorthin.
- **Rechtsstand:** vor jedem Kundentermin prüfen und Datum aktualisieren (Omnibus-Nachläufer, Hochrisiko-Leitlinien
  „bis Ende 2026“, Normen).
- **Lizenzen:** Schriften OFL, GSAP Standard License, Phosphor MIT, QR-Generator MIT: alle kommerziell nutzbar.

### E Qualitätssicherung

Probelauf am Beamer des Hörsaals (Kontrast, Lesbarkeit aus der letzten Reihe), Test der Abstimmseite auf mehreren
Handys, Bildrate auf dem Präsentationslaptop (60 fps bei Animationen), Prüfwerkzeug ohne Fehler und Warnungen.

## Umsetzungsstand (31.10.2026)

| Paket | Stand | Umsetzung |
|---|---|---|
| A Choreografie | ✅ | `js/folien/ki-animation.js` mit GSAP 3.15 (gsap, SplitText, MotionPath in `js/vendor/gsap/`): Titel wortweise, Karten auf Bewegungspfaden durch den Trichter ins Fach (Fach-Form federt), Zeitstrahl-Achse zeichnet sich, Omnibus-Marken springen, Pyramidenstufen fallen ein, Urteile auf Folie 13 und 28 werden gestempelt, Klassenform fliegt vom Betrieb in die Inventarzeile, Kernbotschaft wortweise, Beträge im Bußgeld-Rechner rollen. Prüfpfad-Leiste bleibt beim Folienwechsel stehen (View Transition). Aus bei reduzierter Bewegung, im Druck, im Prüf- und Aufnahmemodus und in der Referentenansicht; beim Verlassen wird alles zurückgesetzt. |
| B Grafiksprache | ✅ | 45 Phosphor-Duotone-Icons als Inline-Symbole (`werkzeuge/icons-erzeugen.py`), Zweitfarbe = Klassenfarbe; Wimmelbild isometrisch als zwei Dioramen, Büro und Werkhalle (`werkzeuge/wimmelbild-erzeugen.py`, rechnet die Punkte mit); Pyramide mit zwei Seitenflächen und Schnittflächen; Trichter mit Rand, Öffnung und Verlauf; Venn mit Nummern statt Beschriftungen in den Schnittmengen. Hell und dunkel geprüft. |
| C Text-Diät | ✅ | Alle Hauptfolien höchstens 40 sichtbare Wörter; Details in den Sprechnotizen. Ausnahmen ausdrücklich per `data-wortbudget`: Inventar-Tabelle (26: 60), sechs Irrtümer schrittweise (28: 62), Bußgeld-Rechner (29: 55). |
| D Kundenfassung | offen | nach dem 9.11.2026; braucht SimpleAct-CI (Logo, Farben, Schrift) und eine Entscheidung zu Abstimm-Backend und Hosting |
| E Qualitätssicherung | teilweise | Prüfwerkzeug 0 Fehler, 0 Warnungen über alle Folien und Schritte; Animationen im Browser geprüft. Offen: Probelauf am Hörsaal-Beamer und auf dem Präsentationslaptop. |

Abweichungen vom Vorschlag: MorphSVG, Flip und DrawSVG werden nicht gebraucht (Stempel, Flug und Achse kommen mit
Kern-GSAP und MotionPath aus) und sind deshalb nicht eingebunden. Der Klassifizierer behält seinen eigenen, bereits
geprüften Pfad-Code.

## Quellen

- GSAP Standard License, Stand 30.5.2025: https://gsap.com/community/standard-license/
- npm: `gsap@3.15.0` (Dateien `dist/gsap.min.js`, `SplitText.min.js`, `DrawSVGPlugin.min.js`, `MorphSVGPlugin.min.js`,
  `Flip.min.js`, `MotionPathPlugin.min.js`), `@phosphor-icons/core@2.1.1` (MIT, 1.512 Duotone-SVGs),
  `lucide-static@1.66.0` (ISC); geprüft per `npm view` und `npm pack` am 31.10.2026
- Frühere Werkzeug-Recherche: `../../recherche/praesentations-tools.md` (27.10.2026)
