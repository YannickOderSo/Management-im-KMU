> Umsetzung: 1.11.2026, siehe `praesentation/LIESMICH.md`, Abschnitt „Gestaltungsregeln“. Nicht umgesetzt: M2 (größere Grundschrift, verlangt neues Layout aller Folien) und M10 (Flip-Übergänge zwischen Folien).

# Was Folien hochwertig wirken lässt: Recherche und Regeln für das Deck „Welches Risiko hat Ihre KI?“

Stand: 1. 11. 2026. Ziel: konkrete, umsetzbare Regeln für das HTML-Deck (1920 × 1080, eigene Engine, GSAP, Inter / Inter Tight, Navy #122E55, SimpleAct-Blau #2563EB, Papier #F7F6F2, Ampelfarben fest an Risikoklassen). Vortrag am 9. 11. 2026 im Hörsaal mit Beamer, später vor Firmenkunden.

Am Repository wurde nichts geändert. Zur Einordnung wurden nur die vorhandenen Tokens gelesen (`ki-compliance/praesentation/css/tokens.css`, `css/folien/ki.css`). Wo eine Maßnahme dort schon umgesetzt ist, steht das dabei.

---

## 1. Was die Quellen übereinstimmend sagen

### 1.1 Prinzipien hochwertiger Vortragsfolien
- **Drei-Sekunden-Regel.** Duartes *Glance Test*: Das Publikum soll die Kernaussage einer Folie in höchstens drei Sekunden erfassen. Folien sind „Billboards“, also *glance media*. Zum Test gehören ein klarer Fokus, ein Layout, das genau diesen Punkt trägt, und Kontrast und Weißraum für das Wichtigste. Kurzformel aus Duartes Workshop: „Turn it up, or turn it off.“ [Duarte][duarte-glance], [HBR-Nachdruck][duarte-hbr], [slide:ology-Workshop][swd-slideology]
- **Zurückhaltung und Weißraum.** Reynolds’ *Presentation Zen* nennt drei Grundsätze: Zurückhaltung in der Vorbereitung, Einfachheit im Design, Natürlichkeit im Vortrag. Weißraum ist ein aktives Gestaltungsmittel („subtract, not add“). Dazu kommen die Grundregeln Kontrast, Wiederholung, Ausrichtung und Nähe. [O’Reilly][zen-oreilly], [Zusammenfassung][zen-buteau]
- **Aktionstitel und eine Botschaft je Folie (Beratungspraxis).** Der Titel ist ein ganzer Satz mit der Schlussfolgerung, kein Themenlabel. Liest man nur die Titel nacheinander, ergibt sich das Argument („Ghost Deck“). Lässt sich die Aussage nicht in einem Satz sagen, hat die Folie mehr als eine Botschaft. [Deckary][deckary-standards], [Deckary McKinsey][deckary-mck]
- **Tufte zu PowerPoint.** Ganze Sätze mit Subjekt und Verb sind besser als Stichpunkt-Fragmente. Sein bekanntestes Beispiel ist die Columbia-Folie der NASA: Die entscheidende Warnung stand klein unter einer beruhigenden Überschrift. Für einen Vortrag über Risiko heißt das: Der Titel muss die *ehrliche* Schlussfolgerung tragen. [Zusammenfassung „Cognitive Style“][tufte-cog]
- **Typografie für Folien (Butterick).** Keine automatische Größenanpassung. Eine Grundgröße für alle Folien. Den Text an die Größe anpassen, nicht die Größe an den Text. Nicht zentrieren, Titel nicht übergroß, großzügiger Zeilenabstand, Farbe zurückhaltend. In hellen Räumen weder reines Schwarz auf reinem Weiß noch das Umgekehrte. [Practical Typography][butterick]
- **Apple-Keynote-Stil.** Wenig Text und große Bilder oder Zahlen. Ein einheitliches System über das ganze Deck, dazu eigens gestaltete Aussagefolien für die Kernmomente. Diese Quellen sind eher schwach (Blogs). [ethos3][ethos3-apple], [Piktochart][pikto-keynote]
- **Swiss Style und Raster.** Müller-Brockmann leitet das Raster aus der Schrift ab (Grundgröße und Zeilenabstand zuerst, dann Spalten und Felder). Ein 12-Spalten-Raster erlaubt die meisten Teilungen. [IxDF][ixdf-grid], [Hobday][hobday]
- **Beamer.** Umgebungslicht senkt den Kontrast, und dunkle Töne „saufen ab“. In beleuchteten Hörsälen empfehlen die meisten Praktiker dunkle Schrift auf hellem, aber nicht reinweißem Grund. Hell auf dunkel eignet sich für abgedunkelte Räume und lichtstarke Projektoren. Konsens im Tufte-Forum: vor Ort mit dem echten Projektor testen. [Tufte-Forum][tufte-bg], [Logos][logos-contrast], [Butterick][butterick]
- **Schriftgewicht am Beamer.** Light und Ultralight sind schlechter lesbar als Regular und Bold, besonders bei niedrigem Kontrast (Eye-Tracking-Studie Burmistrov). Penn State rät aus demselben Grund von dünnen Schnitten ab. [Burmistrov][burmistrov], [PSU][psu-light]
- **Schriftgröße aus dem Raum.** Die AV-Norm ANSI/AVIXA V202.01 (DISCAS) setzt für einfache Lesbarkeit einen Sehschärfefaktor von 200 an: maximale Betrachtungsdistanz = Bildhöhe × 2 × %EH. %EH ist die Höhe des kleinsten wichtigen Elements (z. B. eines Kleinbuchstabens) in Prozent der Bildhöhe. Übliche Presets: 3 % für Vorlesungsfolien, 2 % für Finanzzahlen. Draper empfiehlt 2 bis 2,5 %. [AVIXA][avixa], [DISCAS-Rechner][discas-calc], [Draper][draper]
- **Kawasaki 10/20/30.** Mindestens 30 pt. Auf einer 16:9-PowerPoint-Folie (960 pt breit) sind das umgerechnet 60 px bei 1920 px. Die 28 px des Decks entsprechen dort nur 14 pt. [Presentation Magazine][kawasaki]

### 1.2 Was B2B-SaaS-Marken (Linear, Stripe, Vercel, Notion) visuell auszeichnet
- **Linear.** Farbthemen werden in LCH statt HSL erzeugt, aus drei Variablen: Grundfarbe, Akzent und Kontrast. Ebenen (Hintergrund, Panel, Dialog) unterscheiden sich über systematisch abgestufte Helligkeit. Titel sind in *Inter Display* gesetzt. Beim jüngsten Refresh gab es weniger Trennlinien, abgerundete und weicher kontrastierte Kanten, wärmere Grautöne, kleinere und weniger Icons und keine dekorativen Icon-Hintergründe. [Linear Redesign][linear-redesign], [Linear Refresh][linear-refresh]
- **„Linear-Stil“ im Marketing.** Dunkle Flächen, weich geblurrte Verläufe hinter Produktbildern, sparsam leuchtende Kanten, 1-px-Haarlinien mit niedrigem Kontrast. Kritik daran: Inzwischen sehen viele Tools gleich aus („Squint test“). Ein eigener Charakter ist wichtiger als der Trend. [The Linear Effect][linear-effect], [LogRocket][logrocket-linear]
- **Stripe.** Die Farbskalen wurden im Lab-Raum so gebaut, dass jede Stufe über alle Farbtöne die gleiche wahrgenommene Helligkeit und damit den gleichen Kontrast hat. Die Welle bzw. der Verlauf ist das Markenzeichen, soll aber „ausdrucksstark sein, ohne überall auftauchen zu müssen“. Das System regelt, wann sie führt, wann sie unterstützt und wann sie zurücktritt. [Stripe][stripe-color], [Field.io][field-stripe]
- **Vercel.** Ein monochromes Grundsystem mit sichtbaren Rasterlinien und eigener Schrift (Geist Sans und Mono) als technischem Label. Für die Konferenzauftritte nennt die Agentur Schweizer Plakate und Brutalismus als Einflüsse. Raster, Winkel und Buchstabenformen wurden auf Konsistenz und Lesbarkeit verfeinert. [basement.studio][basement-vercel], [Geist-Case][basement-geist], [rauno.me][rauno-vercel]
- **Notion.** Eine eigene, handgezeichnete Illustrationssprache (Roman Muradov) statt Stock-Bildern. Die Kampagne 2024 setzt auf wenige Primärfarben und bewusst *keine* wörtlichen UI-Darstellungen. [Notion][notion-brand], [BUCK][buck-notion]
- **Produkt-Screenshots.** Nur einen ausgewählten Produktmoment zeigen statt einer „komprimierten Tour“. Eng beschneiden, vergrößern, bis das Detail lesbar ist. Rahmen mit kleinem Radius, weichem Schatten und ruhigem Verlaufshintergrund. Markierungen im Markenstil statt roter Standardkästen. [SaaSFrame][saasframe], [DocsHound][docshound], [Marc Lou][marclou]
- **Schatten und Tiefe.** Eine einheitliche Lichtquelle, mehrere geschichtete Schatten, Schattenfarbe im Farbton des Hintergrunds statt Schwarz (Comeau). Unschärfe ≈ 2 × vertikaler Versatz. Auf dunklen Flächen keine Schatten, dort entsteht Tiefe über hellere Flächen und Konturen. Nur *eine* Tiefentechnik je Oberfläche (Hobday). [Comeau][comeau], [Hobday][hobday]
- **Verläufe am Projektor.** Großflächige Verläufe zeigen Stufen (Banding). Feines Rauschen bzw. Korn behebt das. [Frontend Masters][grain]

### 1.3 Datenvisualisierung auf Folien
- **Grau ist die wichtigste Farbe.** Erst alles grau setzen, dann nur das Wichtige farbig. Den Rest als hellere Stufe derselben Farbe zeigen, keinen neuen Farbton einführen. „If everything is important and emphasized, nothing is.“ [Datawrapper][dw-emph], [Farbleitfaden][dw-colorguide]
- **Direkt beschriften statt Legende.** Höchstens 5 bis 7 Linien, ein bis zwei hervorgehoben, Rahmen und unnötige Achsen weglassen. [Aisch, vis4][aisch], [EU-Datenleitfaden][eu-direct], [NN/g][nng-clutter]
- **Stephen Few.** Kräftige, dunkle Farben nur für Hervorhebung, gedämpfte Töne für den Rest, keine Rot-Grün-Kombination als einziges Unterscheidungsmerkmal. [Few, Perceptual Edge][few]
- **FT Visual Vocabulary.** Den Diagrammtyp nach der *Botschaft* wählen (Abweichung, Rangfolge, Zeitverlauf, Größe, Teil-Ganzes …). Säulen beginnen bei null. Torten und gestapelte Diagramme einfach halten. [FT chart-doctor][ft-vv]
- **Farbe nie als einziges Merkmal.** WCAG 1.4.1 und MDN: Statusfarben immer mit Form oder Wort koppeln. Statt reinem Rot und Grün besser ein rötliches Orange und ein bläuliches Grün. *Im Deck schon umgesetzt: Klasse = Farbe + Form + Wort.* [W3C][wcag141], [MDN][mdn-color]

### 1.4 Bewegung
- **Productive vs. expressive (IBM Carbon).** Produktive Bewegung ist schnell und der Normalfall. Expressive Bewegung bleibt seltenen, wichtigen Momenten vorbehalten. Die Dauer wächst mit Strecke und Skalierung. Große Übergänge brauchen durchgehende Elemente, die das Auge führen. Carbon-Werte:
  - Kurven: Standard `cubic-bezier(0.2, 0, 0.38, 0.9)` / `(0.4, 0.14, 0.3, 1)`, Eintritt `(0, 0, 0.38, 0.9)` / `(0, 0, 0.3, 1)`, Austritt `(0.2, 0, 1, 0.9)` / `(0.4, 0.14, 1, 1)` (jeweils productive / expressive)
  - Dauern: 70, 110, 150, 240, 400 und 700 ms
  
  [Carbon][carbon]
- **Material 3** (laut Token-Spiegeln): *emphasized decelerate* `cubic-bezier(0.05, 0.7, 0.1, 1)` mit etwa 400 ms für Eintritte, *emphasized accelerate* `(0.3, 0, 0.8, 0.15)` mit etwa 200 ms für Austritte. Austritte sind also ungefähr halb so lang wie Eintritte. [M3][m3], [Token-Spiegel][m3-mirror]
- **Dauern.** Für UI gelten etwa 200 bis 500 ms. Unter 100 ms bemerkt man die Bewegung kaum, ab etwa 1 s reißt der Gedankenfluss. [Val Head][valhead], [SAP Fiori][sap-motion]
- **Stagger.** 20 bis 50 ms (bis 80 ms) je Element, gesamt unter 400 bis 500 ms, höchstens 6 bis 8 Elemente versetzt. [Design Hubs][stagger], [Tessera][tessera]
- **Kontinuität.** Keynotes *Magic Move* lässt Objekte von ihrer Position auf der einen Folie zur neuen auf der nächsten wandern und erzeugt so Kontinuität. Im Web gelingt das mit GSAP *Flip*. [Apple Magic Move][apple-magicmove], [Macworld][macworld]
- **Zweckgebunden und abschaltbar.** Apple HIG: Bewegung zielgerichtet einsetzen, nicht als Selbstzweck, und optional machen. MDN: Skalieren und Schwenken großer Objekte kann vestibuläre Beschwerden auslösen. Ersatz ist eine Überblendung. GSAP bietet dafür `gsap.matchMedia()` mit `(prefers-reduced-motion: reduce)`. [Apple HIG][apple-hig], [MDN][mdn-prm], [GSAP][gsap-mm]
- **Kurven-Äquivalente** [easings.net][easings], [GSAP-Doku][gsap-ease]:
  - easeOutCubic `(0.33, 1, 0.68, 1)` = GSAP `power2.out`
  - easeOutQuart `(0.25, 1, 0.5, 1)` = `power3.out`
  - easeOutQuint `(0.22, 1, 0.36, 1)` = `power4.out`
  - easeOutExpo `(0.16, 1, 0.3, 1)` = `expo.out`
  - easeInOutCubic `(0.65, 0, 0.35, 1)` = `power2.inOut`

### 1.5 Was Folien „billig“ wirken lässt
Diese Liste stützt sich auf Praktiker-Blogs, ist also eher schwache Evidenz, deckt sich aber mit den Grundsätzen oben [PresentationGO][pgo], [ethos3][ethos3-mistakes], [SlideGenius][slidegenius], [Linear Effect][linear-effect]:
- zu viel Text und Stichpunkt-Kaskaden
- zu viele Farben, keine klare Hierarchie, uneinheitliche Abstände
- mehrere Schriften, falsche Größen, Gewichtsmischmasch
- Clipart, Stock-Klischees, verpixelte oder verzerrte Logos
- Standardelemente ohne Gestaltung (Excel-Diagramm mit Gitter und Legende)
- Effekte als Selbstzweck: Dreh-, Flug- und Hüpfanimationen, Schatten und Glow überall, Glas auf unruhigem Grund
- Trend-Kopie ohne eigenen Charakter

---

## 2. Priorisierte Maßnahmen für das HTML-Deck (18)

Die Reihenfolge entspricht der erwarteten Wirkung pro Aufwand. Werte beziehen sich auf die Bühne 1920 × 1080.

### M1 · Eine Botschaft je Folie, Titel als Satz
- **Prinzip:** Jede Folie beantwortet genau eine Frage. Der Titel ist die Antwort als ganzer Satz (höchstens 2 Zeilen, höchstens 12 Wörter). Alle Titel hintereinander erzählen den Vortrag.
- **Warum:** Duartes Glance Test (3 s) [duarte-glance], die Ghost-Deck-Regel der Beratungen [deckary-standards] und Tufte/Columbia: Ein beschönigender Titel verbirgt das Risiko [tufte-cog].
- **Umsetzung:**
  ```css
  .titel { max-inline-size: 26ch; text-wrap: balance; hyphens: manual; }
  ```
  Wortbudget je Folie: Titel höchstens 12 Wörter, Rest höchstens 28 Wörter. Ghost-Deck-Prüfung: alle `.titel` per Skript auslesen und als Liste lesen. Der Titel steht auf allen Inhaltsfolien an derselben Stelle (fester Anker, siehe M4). *Im Deck angelegt: `--groesse-titel` = „Kernaussage“.*
- **Risiko:** Lange Sätze laufen bei 72 px auf drei Zeilen. Dann den Satz kürzen, nicht die Schrift verkleinern (Butterick). Für den Druck unkritisch.

### M2 · Schriftgröße aus dem Hörsaal ableiten, nicht aus dem Gefühl
- **Prinzip:** Der Inhaltstext muss in der letzten Reihe lesbar sein. 28 px sind dafür in großen Sälen zu klein.
- **Warum:** DISCAS-Formel (siehe 1.1) [avixa], [discas-calc]. Kawasaki: 30 pt ≙ 60 px [kawasaki]. Rechnung mit der x-Höhe von Inter (≈ 0,546 em):

  | Schriftgröße | x-Höhe | %EH | max. Distanz | bei 2,5 m Bildhöhe |
  |---|---|---|---|---|
  | 22 px | 12 px | 1,1 % | 2,2 × H | 5,5 m |
  | 28 px | 15 px | 1,4 % | 2,8 × H | 7 m |
  | 36 px | 20 px | 1,8 % | 3,6 × H | 9 m |
  | 40 px | 22 px | 2,0 % | 4,0 × H | 10 m |
  | 48 px | 26 px | 2,4 % | 4,9 × H | 12 m |
  | 56 px | 31 px | 2,8 % | 5,7 × H | 14 m |
  | 72 px | 39 px | 3,6 % | 7,3 × H | 18 m |

- **Umsetzung:** Vor dem 9. 11. die Bildhöhe H und den Abstand D zur letzten Reihe messen. Dann gilt: Mindest-Inhaltsgröße in px ≈ (D ÷ (2 · H)) ÷ 100 × 1080 ÷ 0,546. Vorschlag ohne Messung:
  ```css
  :root {
    --groesse-text: 38px;        /* statt 30 */
    --groesse-gross: 46px;
    --groesse-text-min: 32px;    /* statt 28 */
    --groesse-meta: 22px;        /* nur Quelle und Seitenzahl, die niemand lesen MUSS */
  }
  ```
  Das Wortbudget von 40 passt bei 38 px problemlos.
- **Risiko:** Mehr Größe bedeutet weniger Platz, aber das ist gewollt. Tabellen im Backup bleiben bei 24 px und werden nur gezeigt, nicht gelesen.

### M3 · Klare Typo-Skala, zwei Gewichte, Riesenzahlen für Aussagefolien
- **Prinzip:** Wenige Stufen in festem Verhältnis. Je Folie höchstens drei Größen und zwei Gewichte. Kernzahlen dürfen „Apple-groß“ sein.
- **Warum:** Hierarchie entsteht über Kontrast in Größe und Gewicht, nicht über Menge [zen-buteau], [hobday]. Light-Schnitte verlieren am Beamer [burmistrov], [psu-light].
- **Umsetzung (Verhältnis ≈ 1,25):** 22 · 32 · 38 · 46 · 56 · 72 · 96 · 200 px.
  ```css
  :root {
    --groesse-kennzahl: 200px;            /* Aussagefolie: „35 Mio. €“ */
    --zeilenhoehe-titel: 1.08;
    --zeilenhoehe-text: 1.35;
  }
  /* Gewichte: Titel 700 (Inter Tight), Text 400, Betonung 600. Nie unter 400. */
  p { max-inline-size: 48ch; }            /* auf Folien kürzer als im Web */
  ```
  Auf dunklen Folien den Text eher 400 statt 500 setzen, weil helle Schrift auf Dunkel fetter wirkt [tufte-bg].
- **Risiko:** Riesige Zahlen brauchen `font-variant-numeric: lining-nums tabular-nums`, sonst springen sie beim Hochzählen.

### M4 · Festes 12-Spalten-Raster und feste Anker
- **Prinzip:** Alles sitzt auf einem Raster. Titel, Inhaltsbeginn und Quelle stehen auf jeder Folie an derselben Stelle. Grundsätzlich linksbündig, zentriert nur bei Ein-Satz-Aussagefolien.
- **Warum:** Swiss Style [ixdf-grid]. Hobday: Jedes Element fluchtet mit mindestens einem anderen, Abstände folgen einer Skala [hobday]. Konsistenz ist das Kennzeichen des Apple-Stils [pikto-keynote].
- **Umsetzung (passt auf den vorhandenen Rand von 128 px):**
  ```css
  .folie-inhalt {
    display: grid;
    grid-template-columns: repeat(12, 102px);  /* 12×102 + 11×40 = 1664 = 1920 − 2×128 */
    column-gap: 40px;
    padding-inline: 128px;
  }
  /* Vertikal: 8-px-Grundeinheit; Titel-Oberkante fest (z. B. 120 px),
     Inhaltsbeginn fest (z. B. 312 px), Quelle an der Unterkante */
  .raster-an .folie-inhalt {                    /* Prüfansicht per Taste */
    background: repeating-linear-gradient(90deg,
      rgb(37 99 235 / .08) 0 102px, transparent 102px 142px) content-box;
  }
  ```
  Typische Teilungen: 7 + 5 (Aussage + Bild), 6 + 6 (Vergleich), 4 + 4 + 4 (drei Klassen).
- **Risiko:** keins. Druck und PDF übernehmen das Raster 1:1.

### M5 · Weißraum als aktive Fläche, Nähe als Gruppierung
- **Prinzip:** Mindestens etwa 40 % der Folie bleiben leer. Abstände kodieren die Zusammengehörigkeit.
- **Warum:** Reynolds: Weißraum ist aktiv [zen-oreilly]. Duarte: Kontrast und Weißraum für das Wichtigste [duarte-glance]. Hobday: Außenabstand ≥ Innenabstand [hobday].
- **Umsetzung (vorhandene Tokens):**
  - innerhalb einer Gruppe `--abstand-3` / `--abstand-4` (16 / 24 px)
  - zwischen Gruppen `--abstand-6` / `--abstand-7` (48 / 64 px)
  - Titel → Inhalt mindestens `--abstand-7` bis `--abstand-8` (64 bis 96 px)
  - Kartenpadding 40 px, Abstand zwischen Karten ≥ 40 px
  - verschachtelte Radien: innen = außen − Abstand
- **Risiko:** keins. Leere Folien wirken nur dann „unfertig“, wenn das Raster fehlt.

### M6 · Farbdisziplin: Papier, Navy, ein Blau, reservierte Ampel
- **Prinzip:**
  - Flächenanteile etwa 70 % Papier, 25 % Navy (Text, Linien, Kapitelfolien), ≤ 5 % Blau.
  - Blau markiert *das eine* Wichtige je Folie oder die Bedienung (Prüfpfad, Fokus), nie eine Risikoklasse.
  - Ampelfarben erscheinen ausschließlich bei einer Klasse. Kontext ist grau.
- **Warum:** Datawrapper und Few: Grau für Kontext, eine kräftige Farbe für die Hervorhebung [dw-emph], [few]. Stripe: Farbstufen nach wahrgenommener Helligkeit bauen [stripe-color]. Hobday: Neutrale Töne aus einer Temperaturfamilie [hobday].
- **Umsetzung (gemessene Kontraste nach WCAG):**

  | Paar | Kontrast | Regel |
  |---|---|---|
  | Navy #122E55 auf Papier | 12,6 : 1 | Text, ok |
  | Blau #2563EB auf Papier | 4,8 : 1 | nur ≥ 32 px oder Flächen und Linien; kleine Schrift in #1D4ED8 (6,2 : 1) |
  | **Blau #2563EB auf Navy** | **2,6 : 1** | **verboten**; auf Navy #60A5FA (5,3 : 1, im Deck schon so) oder #93C5FD (7,5 : 1) |
  | Weiß auf Blau | 5,2 : 1 | ok für Pillen und Buttons |
  | Gelb #F4B400 auf Papier | 1,7 : 1 | nur Fläche mit Navy-Schrift oder Kontur, nie Text oder Linie |
  | Orange #E8650F auf Papier | 3,1 : 1 | nur Grafik ≥ 3 : 1 (WCAG 1.4.11); Text in #B4470A |
  | #7C8496 auf Papier | 3,5 : 1 | nur Grafik, nie Text (im Deck so vermerkt) |

  Neutrale Töne aus den Markenfarben mischen, damit eine Temperatur herrscht:
  ```css
  --k-linie: color-mix(in oklab, #122E55 22%, #F7F6F2);
  ```
- **Risiko:**
  - Am Beamer rücken Gelb, Orange und Rot zusammen. Deshalb bleibt die Kopplung Farbe + Form + Wort Pflicht (schon umgesetzt).
  - Graustufendruck: Die Formen tragen die Unterscheidung.

### M7 · Beamer-Festigkeit: hell für Inhalt, Navy für Kapitel, keine Haarlinien unter 2 px
- **Prinzip:** Im beleuchteten Hörsaal tragen helle Inhaltsfolien (Navy auf Papier). Navy-Vollflächen sind für Kapitel-, Aussage- und Demo-Folien gedacht. Flächenunterschiede und Linien müssen den Kontrastverlust des Projektors überleben.
- **Warum:**
  - Tufte-Forum und Praxis: dunkel auf hell in hellen Räumen, nicht reinweiß, vor Ort testen [tufte-bg]
  - Projektoren verlieren im Umgebungslicht stark an Kontrast [logos-contrast]
  - Ein 1-px-Strich der 1920er-Bühne wird auf einem WXGA-Beamer (1280 px) zu 0,67 px und flimmert oder verschwindet (eigene Rechnung)
- **Umsetzung:**
  - Text ≥ 7 : 1, Nebentext ≥ 4,5 : 1.
  - Linien: Haarlinien und Achsen ≥ 2 px, Datenlinien 3 bis 4 px, Icons mit Strichstärke ≥ 2 px auf der Bühne.
  - Flächen: Karten auf Papier brauchen ≥ 1,25 : 1 zum Grund oder eine Kontur. `--k-flaeche` #ECEAE3 hat nur 1,11 : 1 und verschwindet am Projektor; #E2DFD6 (1,23) oder #DAD7CF (1,33) halten, alternativ `box-shadow: 0 0 0 2px var(--k-linie)`. Auf Navy entsprechend #24426F (1,35 : 1) oder #2C4A78 (1,52 : 1) statt Tönen um 1,2 : 1.
  - Technikprobe: Folien mit Taste D in beiden Modi im Saal ansehen. Mit Licht an und mit Licht aus prüfen und dann festlegen.
- **Risiko:** Dunkle Folien kosten im Druck Tinte, darum im Druck-CSS auf den hellen Modus umschalten. Zu dunkle Navy-Abstufungen saufen am Beamer ab.

### M8 · Diagramme: Aussage-Titel, grau plus ein Highlight, direkt beschriftet
- **Prinzip:**
  - Den Diagrammtyp nach der Botschaft wählen.
  - Alles grau, nur die Aussage farbig (Blau oder die betroffene Risikoklasse).
  - Beschriftung direkt am Element, keine Legende, kein Rahmen, höchstens drei dezente Hilfslinien.
- **Warum:** [dw-emph], [aisch], [few], [ft-vv], [nng-clutter], [eu-direct]
- **Umsetzung:**
  ```css
  .diagramm .kontext { stroke: #9AA1AF; fill: #C9CDD5; }  /* Marken ≥ 3:1 zum Grund */
  .diagramm .fokus   { stroke: var(--sa-blau); stroke-width: 4px; }
  .diagramm .achse   { stroke: var(--k-linie); stroke-width: 2px; }
  .diagramm text     { font-size: 32px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .diagramm path     { vector-effect: non-scaling-stroke; }
  ```
  - Werte stehen am Balkenende, Labels am Linienende. Säulen beginnen bei 0.
  - Höchstens 5 Reihen.
  - Fristen des AI Act als Zeitstrahl (Zeitverlauf), Bußgeldobergrenzen als Balken (Größe). Teil-Ganzes mit Isotype nur bei ganzen Zahlen.
  - Eine Anmerkung mit 2-px-Führungslinie erklärt das Highlight.
- **Risiko:** Zu helles Grau verschwindet am Beamer, deshalb Marken ≥ 3 : 1 halten. Im Druck unkritisch.

### M9 · Bewegung mit Bedeutung: wenige Kurven, kurze Wege, feste Dauern
- **Prinzip:**
  - Animiert wird nur, was Reihenfolge, Ursache und Wirkung oder einen Zustandswechsel erklärt.
  - Eintritte nutzen Deckkraft plus kurzen Weg. Kein Drehen, kein Hüpfen, kein Blur auf Text, kein Skalieren über 1,03.
- **Warum:** Carbon (productive als Regel, Dauer ∝ Strecke) [carbon]. Apple HIG (zweckgebunden) [apple-hig]. Material (Austritt etwa halb so lang wie Eintritt) [m3-mirror].
- **Umsetzung (eine Kurvenfamilie für das ganze Deck):**
  ```css
  :root {
    --kurve-ein:     cubic-bezier(0.16, 1, 0.3, 1);    /* GSAP expo.out – Eintritte */
    --kurve-ruhig:   cubic-bezier(0.25, 1, 0.5, 1);    /* power3.out – Text, Flächen */
    --kurve-aus:     cubic-bezier(0.55, 0, 1, 0.45);   /* power2.in – Austritte */
    --kurve-wandel:  cubic-bezier(0.65, 0, 0.35, 1);   /* power2.inOut – bleibt sichtbar, ändert sich */
    --dauer-ein: 520ms;  --dauer-aus: 240ms;  --dauer-wandel: 450ms;
    --dauer-daten: 900ms;                              /* Balken wachsen, Linie zeichnet */
    --weg-ein: 20px;                                   /* translateY, nie > 32px */
  }
  ```
  ```js
  gsap.from(el, { autoAlpha: 0, y: 20, duration: .52, ease: "expo.out" });
  ```
  - Zähler höchstens 1,2 s.
  - Folienwechsel als Überblendung mit 400 bis 500 ms; die vorhandene `--dauer-folie: 520ms` passt.
  - Die vorhandene `--kurve-feder` (Überschwingen) bleibt nur für Marker und Punkte.
- **Risiko:** Manche Hörsaal-Adapter liefern nur 30 Hz. Lange, langsame Wege ruckeln dort, deshalb Wege kurz halten. Für reduzierte Bewegung siehe M12.

### M10 · Kontinuität: wiederkehrende Objekte wandern, statt neu zu erscheinen
- **Prinzip:** Was über mehrere Folien bleibt, gleitet in seine neue Rolle, statt aus- und wieder einzublenden. Das betrifft die Risikopyramide, die fünf Klassensymbole, den Prüfpfad und eine Kennzahl („Magic Move“).
- **Warum:** Magic Move erzeugt Kontinuität [apple-magicmove], [macworld]. Carbon: Große Übergänge brauchen durchgehende Elemente [carbon].
- **Umsetzung (GSAP Flip):**
  ```js
  const state = Flip.getState("[data-flip-id]");
  // Folie wechseln / Layout umstellen
  Flip.from(state, { duration: .6, ease: "power2.inOut", absolute: true, nested: true });
  ```
  - Gleiche `data-flip-id` auf beiden Folien vergeben.
  - Pro Übergang höchstens ein bis zwei wandernde Objekte.
  - Alternative ist die View Transitions API (`view-transition-name`). Vorher im Vortragsbrowser testen.
- **Risiko:**
  - Rückwärts-Navigation muss den Übergang spiegeln oder hart schneiden. Keynote selbst spielt Magic Move laut Apple-Community rückwärts nicht ab ([Thread](https://discussions-jp-prz.apple.com/thread/255433228)).
  - Bei reduzierter Bewegung wird überblendet. Im PDF steht jede Folie im Endzustand.

### M11 · Choreografie: eine Bewegung je Klick, kurzer Versatz
- **Prinzip:**
  - Je Klick ein Auftritt.
  - Gruppen erscheinen mit kurzem Versatz in Lese- und Wichtigkeitsreihenfolge.
  - Der Titel steht auf Inhaltsfolien sofort.
  - Das eine Highlight kommt zuletzt und bekommt als Einziges eine expressive Bewegung.
- **Warum:** Stagger 20 bis 80 ms, Gesamtdauer unter 400 bis 500 ms, höchstens 6 bis 8 Elemente [stagger], [tessera]. Expressive Bewegung sparsam einsetzen [carbon].
- **Umsetzung:**
  ```js
  gsap.from(items, { autoAlpha: 0, y: 20, duration: .5, ease: "expo.out", stagger: .06 });
  ```
  Höchstens 5 Elemente versetzen, ab dem sechsten alle zusammen. Höchstens 3 Aufbau-Schritte je Folie (die Kundenfassung eher 2).
- **Risiko:** Zu viele Klicks bremsen den Vortrag. Für das PDF siehe M12.

### M12 · Reduzierte Bewegung und Druck als eigene, gestaltete Zustände
- **Prinzip:** Mit „Bewegung reduzieren“ entfallen Wege, Skalierung und Versatz, und es bleiben kurze Überblendungen. Im Druck und PDF steht jede Folie im Endzustand, ohne Effekte, die PDF-Renderer zerstören.
- **Warum:** MDN: Skalieren und Schwenken lösen vestibuläre Beschwerden aus, also überblenden [mdn-prm]. Apple HIG [apple-hig]. GSAP matchMedia [gsap-mm]. Chrome-PDF zeichnet unscharfe Schatten als Masken, die in Preview als schwarze Kästen erscheinen können [peitho]. `backdrop-filter` fällt im PDF weg [chrome-pdf-blur].
- **Umsetzung:**
  ```js
  const mm = gsap.matchMedia();
  mm.add({ reduce: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { reduce } = ctx.conditions;
    const ein = reduce
      ? { autoAlpha: 0, duration: .18, ease: "none" }                       // nur Überblenden
      : { autoAlpha: 0, y: 20, duration: .52, ease: "expo.out", stagger: .06 };
    // Aufbauten der Engine mit `ein` erzeugen; bei reduce: Zähler springen ans Ende, Flip → Crossfade
  });
  ```
  ```css
  @media print {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    [data-aufbau] { opacity: 1 !important; transform: none !important; }
    .glas { backdrop-filter: none; background: var(--k-flaeche-2); }
    .karte { box-shadow: 0 0 0 1.5px var(--k-linie); }   /* statt Unschärfe */
    html { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
  ```
  *Im Deck teils angelegt: Die Dauern werden bei „reduzieren“ auf 1 ms gesetzt. Eine Überblendung von 150 bis 200 ms wirkt ruhiger als ein hartes Aufspringen.* Zusätzlich lohnt ein Schalter in der Engine (URL-Parameter oder Taste), falls der Vortragsrechner die Systemeinstellung nicht hat.
- **Risiko:** gering. Vor dem Export ein Test-PDF in Chrome *und* Preview bzw. Acrobat öffnen.

### M13 · Tiefe und Licht: eine Lichtquelle, ein Lichthof, getönte Schatten nur auf hell
- **Prinzip:**
  - Navy-Folien wirken durch einen ruhigen, leicht beleuchteten Verlauf hochwertig statt flach. Je Folie höchstens ein Lichthof in Markenblau hinter dem Schlüsselobjekt.
  - Auf Papier entsteht Tiefe über geschichtete, Navy-getönte Schatten. Auf Navy entsteht sie über hellere Flächen und Konturen, nicht über Schatten.
  - Glas nur ausnahmsweise.
- **Warum:**
  - Linear arbeitet mit Ebenen über Helligkeitsstufen, weicheren Kanten und weniger Trennlinien [linear-redesign], [linear-refresh]
  - Stripe: Das Markenzeichen muss nicht überall auftauchen [field-stripe]
  - Comeau: getönte, geschichtete Schatten mit einheitlichem Licht [comeau]
  - Hobday: keine Schatten auf Dunkel, Unschärfe ≈ 2 × Versatz, eine Tiefentechnik [hobday]
  - Korn gegen Banding [grain]
  - Kritik am „Linear-Einheitslook“ [linear-effect]
- **Umsetzung:**
  ```css
  .folie[data-modus="dunkel"] {
    background:
      radial-gradient(60% 50% at 18% 0%, #1E3A66 0%, transparent 70%),
      linear-gradient(180deg, #122E55 0%, #0E2547 100%);
  }
  .folie[data-modus="dunkel"]::after {          /* Korn gegen Banding */
    content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .05;
    background-image: url("korn.svg");          /* einmal erzeugtes feTurbulence-Bild,
                                                   baseFrequency ≈ .9; nicht animieren */
    mix-blend-mode: overlay;
  }
  .lichthof {                                   /* max. 1 je Folie */
    background: radial-gradient(closest-side, rgb(37 99 235 / .28), transparent);
    inline-size: 900px; block-size: 900px;
  }
  /* hell: geschichtet, Navy-getönt, Licht von oben */
  :root {
    --schatten-1: 0 1px 1px hsl(215 65% 20% / .06), 0 2px 4px hsl(215 65% 20% / .05),
                  0 8px 16px -4px hsl(215 65% 20% / .08);
    --schatten-2: 0 1px 2px hsl(215 65% 20% / .06), 0 8px 16px -4px hsl(215 65% 20% / .08),
                  0 24px 48px -12px hsl(215 65% 20% / .16);
  }
  /* dunkel: Fläche + Kontur + Lichtkante statt Schatten */
  .folie[data-modus="dunkel"] .karte {
    background: #24426F;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .08), 0 0 0 2px rgb(255 255 255 / .10);
  }
  /* Radien: eine Skala 8 / 16 / 24 / Pille */
  ```
- **Risiko:**
  - Glow und Glas vervielfacht wirken billig und kosten am Beamer Kontrast.
  - Verläufe zeigen ohne Korn Stufen.
  - Im PDF fällt `backdrop-filter` weg, und Unschärfe-Schatten werden teils falsch gezeichnet (Fallback siehe M12).

### M14 · Produkt- und UI-Ausschnitte: ein Moment, groß, gerahmt, markengerecht annotiert
- **Prinzip:** Gilt für den Klassifizierer und das SimpleAct-Tool.
  - Nie einen ganzen Bildschirm verkleinern, sondern den einen Moment zeigen.
  - Der Ausschnitt erscheint mindestens 1:1, die UI-Schrift auf der Bühne mit ≥ 24 px.
  - Besser als ein PNG ist ein in HTML nachgebauter, vereinfachter Ausschnitt: gestochen scharf und animierbar.
- **Warum:** „Ausgewählter Produktmoment statt komprimierter Tour“ [saasframe], „zoom until you can’t“ [marclou], Rahmen mit Radius, weichem Schatten und Verlaufsgrund [docshound], markengerechte Markierungen statt roter Kästen [docshound].
- **Umsetzung:**
  ```css
  .ui-rahmen {
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 0 0 1px rgb(18 46 85 / .12), var(--schatten-2);
    background: #fff;
  }
  .ui-rahmen img { image-rendering: auto; }   /* PNG in 2× (3840 px) einbinden */
  .callout { border-left: 3px solid var(--sa-blau); font-size: 32px; }
  ```
  Markierungen in Blau, **nie in Rot**, denn Rot gehört der Klasse „verboten“. Hintergrund hinter dem Rahmen: Papier oder der Navy-Verlauf aus M13.
- **Risiko:** Feine UI-Details gehen am Beamer verloren, daher vergrößern. Im PDF werden 2×-Bilder scharf, machen die Datei aber größer.

### M15 · Mikrotypografie auf Deutsch
- **Prinzip:** Echte Zeichen und geschützte Abstände. Zahlen in Tabellen und Zählern stehen auf fester Breite. Titelzeilen werden ausgeglichen, Komposita gezielt getrennt.
- **Warum:**
  - Inkonsistente Typografie gilt als Kennzeichen von Amateur-Decks [pgo]
  - `text-wrap: balance` ist breit unterstützt, `pretty` als Verbesserung [chrome-balance], [logrocket-wrap]
  - Inter bietet `tnum`, `case` und `cv08` (großes I mit Serifen) [inter-features]
- **Umsetzung:**
  - Zeichen: „…“ statt "…"; Gedankenstrich „ – “; Bis-Strich ohne Leerzeichen „2024–2027“.
  - Geschützte Leerzeichen: `Art.&nbsp;6`, `Abs.&nbsp;2`, `35&nbsp;Mio.&nbsp;€`, `7&nbsp;%`, `z.&#8239;B.`
  - Typografie-Einstellungen:
    ```css
    .titel { text-wrap: balance; hyphens: manual; }   /* &shy; in langen Komposita, z. B. Konformitäts&shy;bewertung */
    p      { text-wrap: pretty; }
    .zahl, table { font-variant-numeric: tabular-nums lining-nums; }
    .kicker { text-transform: uppercase; letter-spacing: .07em; font-weight: 600;
              font-size: 22px; font-feature-settings: "case"; }
    /* „KI“ ist das Kernwort; in Inter sind I und l fast gleich → „Kl“.
       Prüfen: font-feature-settings: "cv08" (großes I mit Serifen) für Fließtext. */
    ```
- **Risiko:** Die Teilmengen-Schriften des Decks („Inter Deck“) könnten OpenType-Features verloren haben, daher `tnum`, `case` und `cv08` im Browser prüfen. `hyphens: auto` erzeugt in Titeln unschöne Trennungen und bleibt deshalb aus.

### M16 · Laufweite: Inter Tight nicht doppelt sperren
- **Prinzip:** Inter Tight hat die enge Laufweite bereits eingebaut. Sie wurde für Programme gebaut, die keine Laufweite einstellen können. Ein zusätzlicher Wert von −0,025 em verengt also doppelt.
- **Warum:**
  - Wikipedia und Fontsource zu Inter Tight [inter-wiki], [fontsource-tight]
  - Inter-Formel für dynamische Laufweite: tracking = −0,0223 + 0,185 · e^(−0,1745 · px). Ab etwa 28 px gilt also ≈ −0,022 em, aber für *Inter*, nicht für Tight [inter-dyn].
  - Die Jury des Decks fand −0,03 em schon kollidierend (Kommentar in `tokens.css`).
  - Linear setzt für Titel Inter Display (opsz-Achse ab Inter 4) [linear-redesign], [inter-releases].
- **Umsetzung:**
  ```css
  /* Inter Tight 700, 56–96 px */
  .titel { letter-spacing: -0.005em; }   /* 0 bis −0,01em; aktuell −0,025em → testen */
  /* Alternative: Inter 4 variabel mit font-optical-sizing: auto, dann zunächst 0 testen,
     ohne opsz −0,02em */
  /* Fließtext Inter 32–40 px: 0 bis −0,01em */
  /* Versalien-Kicker: +0,06 bis +0,08em */
  ```
- **Risiko:** Zu enge Titel verschmelzen am unscharfen Beamer zuerst („rn“ → „m“).

### M17 · Ein System statt Einzelfolien: 8 Folientypen, eine Icon-Familie, keine Klischees
- **Prinzip:**
  - Höchstens 8 Layouts: Titel, Kapitel, Aussage + Bild, Vergleich, Kennzahl, Diagramm, Zitat oder Fall, Demo. Jede Folie nutzt genau eines.
  - Eine Icon-Familie mit einer Strichstärke. Icons sind leiser als Text, Farbe tragen sie nur, wenn das Icon eine Klasse *ist*.
  - Keine Stock-Klischees (Roboterhand, blaues Gehirn, Handschlag), keine Emojis.
- **Warum:**
  - Konsistenz [pikto-keynote]
  - Linear reduziert Icons und dekorative Icon-Hintergründe [linear-refresh]
  - Hobday: Icon-Kontrast senken [hobday]
  - Duarte: Klischeebilder schwächen die Botschaft [swd-slideology]
  - Notion: eigene Bildsprache statt Stock [notion-brand]
- **Umsetzung:**
  - Phosphor bleibt (im Deck vorhanden). Icons ≥ 48 px groß mit gleichem Gewicht auf allen Folien, Farbe `var(--k-tinte-2)`.
  - Klassen-Icons tragen die Klassenfarbe mit Duoton `--duo-o: .55`, wie vorhanden.
  - Eigene Bildsprache: die isometrischen Flächen des Decks (`--k-iso-*`) konsequent statt Fotos.
- **Risiko:** Dünne Icons verschwinden am Beamer. Den Strich auf der Bühne ≥ 2 px halten oder das Gewicht „bold“ wählen.

### M18 · Abnahme vor dem 9. 11.: Squint-Test, Beamer-Test, Billig-Checkliste
- **Prinzip:** Qualität entsteht beim Prüfen.
- **Warum:** Glance Test [duarte-glance], Squint-Test [linear-effect], vor Ort testen [tufte-bg].
- **Umsetzung:**
  1. **3-Sekunden-Test:** Jede Folie 3 s zeigen; eine fremde Person nennt die Aussage.
  2. **Squint-Test:** Augen zusammenkneifen; das Wichtigste muss als Erstes sichtbar bleiben.
  3. **Ghost Deck:** Die Titel allein erzählen die Geschichte.
  4. **Beamer:** in beiden Modi, Licht an und aus, von der letzten Reihe aus.
  5. **PDF:** in Chrome und Preview bzw. Acrobat öffnen.
  6. **Billig-Checkliste,** jeder Punkt muss „nein“ sein:

     | Prüffrage | Grenze |
     |---|---|
     | Text unter Mindestgröße? | Inhalt unter 32 px |
     | Mehr als 3 Größen oder 2 Gewichte auf einer Folie? | |
     | Zentrierter Mehrzeiler? | |
     | Mehr als 1 Akzentfarbe? Ampelfarbe ohne Klasse? Blau als Risikoklasse? | |
     | Rote Markierungskästen? | |
     | Schatten auf Dunkel? Mehr als 1 Lichthof? Glas auf unruhigem Grund? | |
     | Legende statt Direktbeschriftung? Gitternetz? 3D? | |
     | Animation ohne Bedeutung? Dreh-, Hüpf- oder Zoom-Effekt? | Bewegung über 32 px oder über 700 ms (außer Daten) |
     | Pixeliges Bild oder Logo? Stock-Klischee? Emoji? | |
     | Element ohne Rasterbezug? Ungleiche Abstände bei Gleichem? | |
     | Gerade Anführungszeichen? Fehlende geschützte Leerzeichen bei „Art. 6“? | |
- **Risiko:** keins. Kostet etwa eine Stunde.

---

## 3. Belastbarkeit der Quellen
- **Primär und belastbar:** Duarte (Glance Test), Butterick, Linear-Blog, Stripe-Blog, IBM Carbon, Apple Support, MDN, W3C, GSAP-Doku, easings.net (Kurvenwerte aus dem Seitenquelltext ausgelesen), Datawrapper, FT chart-doctor, Few (PDF), Inter-Doku bzw. -Releases, AVIXA (Definitionen).
- **Sekundär oder Praktiker:** Beratungs-Slidecraft (Deckary u. a., keine offiziellen McKinsey-Quellen), Apple-Keynote-Analysen, „Linear-Stil“-Artikel, Stagger-Werte, Material-Token-Werte (Spiegelseiten, offizielle Seite nicht maschinenlesbar), DISCAS-Formel und -Presets (Community-Rechner, Norm selbst nicht frei), Billig-Merkmale.
- **Eigene Ableitungen** (als solche kenntlich): Umrechnungen px ↔ pt, Kontrastwerte (WCAG-Formel, selbst gerechnet), DISCAS-Tabelle mit Inter-x-Höhe ≈ 0,546 em, Haarlinien-Rechnung für WXGA-Beamer, Rasterwerte 128/102/40.

---

## 4. Quellen

**Prinzipien**
- `duarte-glance` – <https://www.duarte.com/resources/guides-tools/the-glance-test/>
- `duarte-hbr` – <https://smallwarsjournal.com/2012/10/22/do-your-slides-pass-the-glance-test/>
- `swd-slideology` – <https://www.storytellingwithdata.com/blog/2011/02/slideology-workshop>
- `zen-oreilly` – <https://oreilly.com/library/view/presentation-zen-simple/9780135897751>
- `zen-buteau` – <https://www.antoinebuteau.com/lessons-from-garr-reynolds/>
- `deckary-standards` – <https://deckary.com/blog/consulting-slide-standards>
- `deckary-mck` – <https://deckary.com/blog/mckinsey-style-slides>
- `tufte-cog` – <https://www.davidmays.org/BookNotes05/TufCogn.html>
- `tufte-bg` – <https://www.edwardtufte.com/?p=515>
- `butterick` – <https://practicaltypography.com/presentations.html>
- `ethos3-apple` – <https://ethos3.com/presentation-design-analysis-david-crandall/>
- `pikto-keynote` – <https://piktochart.com/blog/tips-keynote-presentation/>
- `ixdf-grid` – <https://ixdf.org/literature/article/how-to-use-grid-systems>
- `hobday` – <https://anthonyhobday.com/sideprojects/saferules/>
- `logos-contrast` – <https://www.logos.com/grow/stop-squinting-at-screens-create-contrast/>
- `burmistrov` – <https://fr.slideshare.net/IvanBurmistrov/perceived-legibility-and-aesthetic-pleasingness-of-light-and-ultralight-fonts>
- `psu-light` – <https://accessibility.psu.edu/2021/10/beware-light-weight-fonts>
- `avixa` – <https://api.avixa.org/standards/discas-calculators/discas/learn-more-about-display-size>
- `discas-calc` – <https://thewestwas.one/discas>
- `draper` – <https://www.draperinc.com/projectionscreens/projectionplanner.aspx>
- `kawasaki` – <https://www.presentationmagazine.com/the-10-20-30-rule-of-powerpoint-11710.htm>

**SaaS-Marken, Tiefe, Screenshots**
- `linear-redesign` – <https://linear.app/now/how-we-redesigned-the-linear-ui>
- `linear-refresh` – <https://linear.app/now/behind-the-latest-design-refresh>
- `linear-effect` – <https://rectangle.substack.com/p/the-linear-effect>
- `logrocket-linear` – <https://blog.logrocket.com/ux-design/linear-design>
- `stripe-color` – <https://stripe.com/it-ca/blog/accessible-color-systems>
- `field-stripe` – <https://field.io/work/stripe-wave-brand-system>
- `basement-vercel` – <https://basement.studio/post/scaling-vercel-years-of-building-refining-and-elevating>
- `basement-geist` – <https://basement.studio/showcase/geist-strengthening-vercels-visual-identity>
- `rauno-vercel` – <https://rauno.me/craft/vercel>
- `notion-brand` – <https://www.notion.com/blog/the-thinking-behind-our-latest-brand-campaign>
- `buck-notion` – <https://buck.co/work/notion-faces>
- `saasframe` – <https://www.saasframe.io/patterns/product-screenshot>
- `docshound` – <https://docshound-site.pages.dev/blog/capturing-premium-product-screenshots>
- `marclou` – <https://marclou.beehiiv.com/p/how-to-make-catchy-screenshots>
- `comeau` – <https://www.joshwcomeau.com/css/designing-shadows>
- `grain` – <https://frontendmasters.com/blog/grainy-gradients/>

**Typografie**
- `inter-dyn` – <https://d.rsms.me/inter-website/v3/dynmetrics/>
- `inter-releases` – <https://github.com/rsms/inter/releases>
- `inter-wiki` – <https://en.wikipedia.org/wiki/Inter_(typeface)>
- `fontsource-tight` – <https://fontsource.org/fonts/inter-tight/about>
- `inter-features` – <https://sources.debian.org/src/fonts-inter/4.1%2Bds-1/docs/_data/feature_samples.yml>
- `chrome-balance` – <https://developer.chrome.com/blog/css-text-wrap-balance?hl=de>
- `logrocket-wrap` – <https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/>

**Datenvisualisierung und Barrierefreiheit**
- `dw-emph` – <https://www.datawrapper.de/blog/emphasize-with-color-in-data-visualizations>
- `dw-colorguide` – <https://www.datawrapper.de/blog/colorguide>
- `aisch` – <https://www.vis4.net/blog/doing-the-line-charts-right/>
- `eu-direct` – <https://data.europa.eu/apps/data-visualisation-guide/direct-labelling>
- `nng-clutter` – <https://www.nngroup.com/articles/clutter-charts/>
- `few` – <https://www.perceptualedge.com/articles/visual_business_intelligence/rules_for_using_color.pdf>
- `ft-vv` – <https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md>
- `wcag141` – <https://www.w3.org/WAI/WCAG20/Understanding/use-of-color>
- `mdn-color` – <https://developer.mozilla.org/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Use_of_color>

**Bewegung, Druck**
- `carbon` – <https://carbondesignsystem.com/elements/motion/overview/>
- `m3` – <https://m3.material.io/styles/motion/easing-and-duration/tokens-specs>
- `m3-mirror` – <https://docs.rs/frust-material/0.6.2/src/frust_material/tokens/motion.rs.html>
- `valhead` – <https://valhead.com/?p=2978>
- `sap-motion` – <https://www.sap.com/design-system/fiori-design-web/v1-120/foundations/visual/motion-design>
- `stagger` – <https://designhubs.pages.dev/motion/mo06-delay-and-stagger>
- `tessera` – <https://jkguidaven.github.io/tessera-ui/design-language/motion/>
- `apple-magicmove` – <https://help.apple.com/keynote/mac/6.6/en.lproj/tan2bdb4d136.html>
- `macworld` – <https://www.macworld.com/article/223863/improve-your-presentation-skills-how-to-make-smoother-slide-transitions-in-keynote.html>
- `apple-hig` – <https://developer.apple.com/design/human-interface-guidelines/motion>
- `mdn-prm` – <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- `gsap-mm` – <https://gsap.com/docs/v3/GSAP/gsap.matchMedia()>
- `gsap-ease` – <https://greensock.com/asdocs/com/greensock/easing/package-detail.html>
- `easings` – <https://easings.net/>
- `peitho` – <https://github.com/mizzy/peitho/pull/153>
- `chrome-pdf-blur` – <https://www.claudepluginhub.com/skills/acedatacloud-acedatacloud-ai-media/onepage-pdf>

**„Billig“-Merkmale**
- `pgo` – <https://www.presentationgo.com/?p=183642>
- `ethos3-mistakes` – <https://ethos3.com/7-common-presentation-design-mistakes-and-how-to-fix-them/>
- `slidegenius` – <https://www.slidegenius.com/blog/five-powerpoint-design-mistakes-avoid>

[duarte-glance]: https://www.duarte.com/resources/guides-tools/the-glance-test/
[duarte-hbr]: https://smallwarsjournal.com/2012/10/22/do-your-slides-pass-the-glance-test/
[swd-slideology]: https://www.storytellingwithdata.com/blog/2011/02/slideology-workshop
[zen-oreilly]: https://oreilly.com/library/view/presentation-zen-simple/9780135897751
[zen-buteau]: https://www.antoinebuteau.com/lessons-from-garr-reynolds/
[deckary-standards]: https://deckary.com/blog/consulting-slide-standards
[deckary-mck]: https://deckary.com/blog/mckinsey-style-slides
[tufte-cog]: https://www.davidmays.org/BookNotes05/TufCogn.html
[tufte-bg]: https://www.edwardtufte.com/?p=515
[butterick]: https://practicaltypography.com/presentations.html
[ethos3-apple]: https://ethos3.com/presentation-design-analysis-david-crandall/
[pikto-keynote]: https://piktochart.com/blog/tips-keynote-presentation/
[ixdf-grid]: https://ixdf.org/literature/article/how-to-use-grid-systems
[hobday]: https://anthonyhobday.com/sideprojects/saferules/
[logos-contrast]: https://www.logos.com/grow/stop-squinting-at-screens-create-contrast/
[burmistrov]: https://fr.slideshare.net/IvanBurmistrov/perceived-legibility-and-aesthetic-pleasingness-of-light-and-ultralight-fonts
[psu-light]: https://accessibility.psu.edu/2021/10/beware-light-weight-fonts
[avixa]: https://api.avixa.org/standards/discas-calculators/discas/learn-more-about-display-size
[discas-calc]: https://thewestwas.one/discas
[draper]: https://www.draperinc.com/projectionscreens/projectionplanner.aspx
[kawasaki]: https://www.presentationmagazine.com/the-10-20-30-rule-of-powerpoint-11710.htm
[linear-redesign]: https://linear.app/now/how-we-redesigned-the-linear-ui
[linear-refresh]: https://linear.app/now/behind-the-latest-design-refresh
[linear-effect]: https://rectangle.substack.com/p/the-linear-effect
[logrocket-linear]: https://blog.logrocket.com/ux-design/linear-design
[stripe-color]: https://stripe.com/it-ca/blog/accessible-color-systems
[field-stripe]: https://field.io/work/stripe-wave-brand-system
[basement-vercel]: https://basement.studio/post/scaling-vercel-years-of-building-refining-and-elevating
[basement-geist]: https://basement.studio/showcase/geist-strengthening-vercels-visual-identity
[rauno-vercel]: https://rauno.me/craft/vercel
[notion-brand]: https://www.notion.com/blog/the-thinking-behind-our-latest-brand-campaign
[buck-notion]: https://buck.co/work/notion-faces
[saasframe]: https://www.saasframe.io/patterns/product-screenshot
[docshound]: https://docshound-site.pages.dev/blog/capturing-premium-product-screenshots
[marclou]: https://marclou.beehiiv.com/p/how-to-make-catchy-screenshots
[comeau]: https://www.joshwcomeau.com/css/designing-shadows
[grain]: https://frontendmasters.com/blog/grainy-gradients/
[inter-dyn]: https://d.rsms.me/inter-website/v3/dynmetrics/
[inter-releases]: https://github.com/rsms/inter/releases
[inter-wiki]: https://en.wikipedia.org/wiki/Inter_(typeface)
[fontsource-tight]: https://fontsource.org/fonts/inter-tight/about
[inter-features]: https://sources.debian.org/src/fonts-inter/4.1%2Bds-1/docs/_data/feature_samples.yml
[chrome-balance]: https://developer.chrome.com/blog/css-text-wrap-balance?hl=de
[logrocket-wrap]: https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/
[dw-emph]: https://www.datawrapper.de/blog/emphasize-with-color-in-data-visualizations
[dw-colorguide]: https://www.datawrapper.de/blog/colorguide
[aisch]: https://www.vis4.net/blog/doing-the-line-charts-right/
[eu-direct]: https://data.europa.eu/apps/data-visualisation-guide/direct-labelling
[nng-clutter]: https://www.nngroup.com/articles/clutter-charts/
[few]: https://www.perceptualedge.com/articles/visual_business_intelligence/rules_for_using_color.pdf
[ft-vv]: https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md
[wcag141]: https://www.w3.org/WAI/WCAG20/Understanding/use-of-color
[mdn-color]: https://developer.mozilla.org/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Use_of_color
[carbon]: https://carbondesignsystem.com/elements/motion/overview/
[m3]: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
[m3-mirror]: https://docs.rs/frust-material/0.6.2/src/frust_material/tokens/motion.rs.html
[valhead]: https://valhead.com/?p=2978
[sap-motion]: https://www.sap.com/design-system/fiori-design-web/v1-120/foundations/visual/motion-design
[stagger]: https://designhubs.pages.dev/motion/mo06-delay-and-stagger
[tessera]: https://jkguidaven.github.io/tessera-ui/design-language/motion/
[apple-magicmove]: https://help.apple.com/keynote/mac/6.6/en.lproj/tan2bdb4d136.html
[macworld]: https://www.macworld.com/article/223863/improve-your-presentation-skills-how-to-make-smoother-slide-transitions-in-keynote.html
[apple-hig]: https://developer.apple.com/design/human-interface-guidelines/motion
[mdn-prm]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
[gsap-mm]: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
[gsap-ease]: https://greensock.com/asdocs/com/greensock/easing/package-detail.html
[easings]: https://easings.net/
[peitho]: https://github.com/mizzy/peitho/pull/153
[chrome-pdf-blur]: https://www.claudepluginhub.com/skills/acedatacloud-acedatacloud-ai-media/onepage-pdf
[pgo]: https://www.presentationgo.com/?p=183642
[ethos3-mistakes]: https://ethos3.com/7-common-presentation-design-mistakes-and-how-to-fix-them/
[slidegenius]: https://www.slidegenius.com/blog/five-powerpoint-design-mistakes-avoid
