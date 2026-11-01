> Umsetzung: 1.11.2026, Punkte 1 bis 6 und 8 bis 15 sowie „Außerdem“ (ohne die doppelte Quelle auf 26) umgesetzt, Punkt 7 teilweise (Rahmen, Klassenkanten, Radien; das Typo-Raster nicht). Signature-Ideen A bis C offen. Siehe `praesentation/LIESMICH.md`, Abschnitt „Gestaltungsregeln“.

# Art-Direction-Kritik: „Welches Risiko hat Ihre KI?“ (37 Hauptfolien)

Stand 1.11.2026. Grundlage: alle 37 Endzustandsbilder, eigene Aufnahmen in 1920 × 1080 (Playwright, `?aufnahme`) und der Code in `ki-compliance/praesentation/` (index.html, css/folien/ki.css, ki-folien.css, klassifizierer.css, css/komponenten.css, css/deck.css, js/folien/ki.js, ki-animation.js). Im Repository wurde nichts geändert. Die Messskripte liegen in `scratchpad/design/live/` (mess2.mjs, u.mjs, breit.mjs), damit die Werte nach der Umsetzung erneut geprüft werden können.

Alle Vorschläge ändern nur Gestaltung. Wörter, Rechtstexte und Quellen bleiben gleich. Wo ein Vorschlag Markup berührt, steht es dabei (z. B. ein `<b>` um einen vorhandenen Betrag oder ein anderes Icon).

---

## 1. Gesamturteil

**Was schon hochwertig wirkt (bitte nicht anfassen)**

- **Das Klassensystem.** Farbe, Form und Wort sind fest gekoppelt (Achteck, Dreieck, Kreis, Quadrat, Raute). Das funktioniert auch im Schwarz-Weiß-Druck und bei Farbschwäche, und es wird fast überall eingehalten. So diszipliniert arbeiten nur wenige Agentur-Decks.
- **Titeltypografie.** Inter Tight 700 mit −0,025 em, linksbündig, mit grauer zweiter Titelhälfte (`.k-leise`, auf 06, 08, 11, 20, 22, 26, 31, 34, 35). Das wirkt redaktionell und selbstbewusst.
- **Eigene Bildwelt.** Das isometrische Wimmelbild der Muster Metallbau (03, 25) und der Klassifizierer-Baum (20, 22) sind keine Stockbilder. Sie tragen die Erzählung, besonders die Rückkehr des Betriebs eingefärbt auf 25.
- **Laufleiste als Prüfpfad.** Das Konzept stimmt: Die Navigation ist zugleich die Methode. Dazu kommt der blaue Merksatz-Strich (03, 15, 25, 33) als wiederkehrendes Signal.
- **Ehrliche Daten.** Beispieldaten sind gekennzeichnet, jede Folie hat eine Quellzeile, der Zeitstrahl hat eine Heute-Marke (06), und der Bußgeld-Rechner (28) ist interaktiv statt Behauptung.

**Was noch nach Studentenprojekt oder Template aussieht**

1. **Springende Titel.** Der Titel steht je nach Folie bei y = 132, 140, 174 oder 181 px. Beim Blättern von 11→12, 19→20, 22→23 oder 27→28 springt er um 42 px, weil der Kicker keinen festen Platz hat. Gemessen auf allen 37 Folien.
2. **Kopflastige Folien mit leerem unterem Drittel.** Auf 07, 10, 17, 18, 29 und 31 klebt der Inhalt oben, und über der Quellzeile bleiben 174–290 px leer (18: 290 px). Das wirkt unfertig, nicht großzügig.
3. **Kachel-Inflation.** Fast jede Folie ist ein Raster beiger Kästen. Dabei gibt es 7 Radien (8/10/12/14/16/18/22 px), 6 Rahmenstärken (1,5–6 px, dazu 8, 10 und 12 px Sonderfälle) und 4 Behälterarten (beige Fläche, Navy-Fläche, Navy-Rahmen, Klassen-Rahmen), die ohne Regel wechseln. Die farbigen Oberkanten (12, 17, 35) entstehen aus `inset`-Schatten auf runden Karten und biegen sich an den Ecken zu einer „Lippe“. Das ist ein typisches Template-Signal.
4. **Umfrage-Folien wirken wie ein eingebettetes Web-Widget** (6 von 37 Folien, also 16 %). Die Antworten sind 48 px gegen die Balken eingerückt, darüber stehen Pillen in Versalien mit Sperrung (die einzigen Versalien im Deck), die LIVE-Pille ist grün (= „minimal“), und der Auflösungsrahmen ragt 20 px in den Rand. Links schwebt der Platzhalter „Beispielwerte – keine Aussage“.
5. **Vier Illustrationsstile nebeneinander.** Isometrische Strichzeichnung (03, 25), 3D-Pyramide mit Seitenflächen (11), Trichter mit Verlauf und grauer Ellipse (01, 15) und SmartArt-Chevrons (33). Dazu ein nativer Browser-Schieberegler (28).
6. **Kein Rhythmus.** Es gibt keine Kapiteltrenner, 36 helle Folien und eine dunkle (35), deren fast schwarzes Blau (#0F1626) nicht das Marken-Navy ist. Der Fahrplan (05) zeigt vier Kreise im oberen Mitteldrittel. Die Schlussfolie (37) ist ein Gebrauchslayout ohne Echo zum Anfang.
7. **Zu viele Nummernsysteme.** 9 Varianten von Zahlen-Plaketten (`.w-nr`, `.vb-stelle`, `.dr-nr`, `.pa-schritte::before`, `.di-fragen::before`, `.ge-nr`, `.sa-nr`, `.st-nr`, `.p-punkt`). Stellen-Nummern (1–6) und Aufzählungen sehen gleich aus. Auf 12 und 14 steht die Stellen-Nummer zudem in der Klassenfarbe, aber im Kreis, also in der Form von „Transparenz“.

**Kurz:** Das Gestaltungssystem ist durchdacht und fast fertig. Die Template-Wirkung kommt nicht aus dem Konzept, sondern aus fehlenden Regeln in der Ausführung (Raster, Behälter, Nummern) und aus Engine-Bausteinen, die nicht an die Marke angepasst wurden.

---

## 2. Die 15 wirksamsten Verbesserungen

Aufwand: XS < 30 Min. · S ≤ 2 Std. · M ½–1 Tag. Erst die systemischen Punkte (1–8), dann die Einzelfolien (9–15), jeweils nach Wirkung pro Aufwand sortiert.

### 1 · Titel auf eine feste Grundlinie (systemisch, XS)

- **Folien:** alle mit Titel (02–37).
- **Befund:** Gemessene Titel-Oberkanten: 132 px (Laufleiste, ohne Kicker: 06–08, 10, 11, 20, 22, 25–27, 29–31, 33–35), 174 px (Laufleiste mit Kicker: 09, 12–19, 21, 23, 24, 28, 32), 140 px (ohne Laufleiste, ohne Kicker: 05, 37) und 181 px (ohne Laufleiste, mit Kicker: 02, 03, 04, 36). Der Kicker schiebt den Titel um 42 px nach unten. Beim Blättern hüpft der wichtigste Text der Folie.
- **Umsetzung:** `css/folien/ki.css`, Abschnitt 2, die drei Regeln in Zeile 152–154 ersetzen. Der Kicker bekommt einen eigenen Platz über der Titellinie, sodass jeder Titel bei y = 152 steht:
  ```css
  :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .folie > .k-laufkopf ~ .folie-kopf { margin-top: 64px; }
  :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .folie > .k-laufkopf ~ .folie-kopf:has(> .kicker) { margin-top: 22px; }
  :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .folie[data-laufkopf="aus"]:not([data-layout="titel"]) > .folie-kopf { margin-top: 104px; }
  :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .folie[data-laufkopf="aus"]:not([data-layout="titel"]) > .folie-kopf:has(> .kicker) { margin-top: 62px; }
  /* Baum hat feste 720 px: Abstand Titel → Inhalt dort etwas knapper */
  :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .kl-folie > .folie-kopf ~ .folie-inhalt { margin-top: 20px; }
  ```
  Rechnung: Laufleiste endet bei 48 + 40 = 88 px. Ohne Kicker ergibt 88 + 64 = 152. Mit Kicker liegt der Kicker bei 110, der Titel bei 110 + 42 = 152. Ohne Laufleiste: 48 + 104 bzw. 48 + 62 + 42, also ebenfalls 152.
- **Effekt:** Der Titel steht beim Blättern fest. Das ist das stärkste „Profi“-Signal pro Minute Arbeit.
- **Risiko:** Folien ohne Kicker verlieren 20 px Inhaltshöhe. Knapp wird es nur auf 20/22 (bisher 33 px Luft; dafür die `.kl-folie`-Regel) und auf 25 (siehe Punkt 9). Umfrage-Folien gewinnen 21 px. Danach `node werkzeuge/pruefen.mjs index.html --schritte` und `scratchpad/design/live/mess2.mjs` laufen lassen.

### 2 · Luft verteilen statt unten Loch (systemisch, XS)

- **Folien:** 07, 10, 17, 18, 29, 31 (gemessene Lücke über der Quelle: 245, 246, 190, 290, 203, 174 px).
- **Befund:** Inhalt hängt direkt unter dem Titel, das untere Drittel ist leer, die Quellzeile steht allein am Boden. Auf 18 endet der Inhalt bei y = 716 von 1080.
- **Umsetzung:** `css/folien/ki-folien.css`, am Ende. Den Inhalt als Block optisch mittig setzen (56 px über der geometrischen Mitte):
  ```css
  .d-inhalt, .mi-inhalt, .ko-inhalt { align-content: center; padding-bottom: 56px; }
  .au-inhalt { grid-template-rows: auto auto auto; align-content: center; padding-bottom: 56px; }
  .wm-inhalt { grid-template-rows: auto auto; align-content: center; padding-bottom: 56px; }
  .tr-inhalt { justify-content: center; padding-bottom: 56px; }
  ```
  `.au-inhalt` und `.wm-inhalt` brauchen die geänderten Zeilen, weil ihre letzte Zeile heute `minmax(0, 1fr)` ist und den Rest schluckt.
- **Effekt:** Sechs Folien wirken komponiert statt abgebrochen. Merkregel fürs Team: Ein Inhaltsblock füllt die Fläche entweder zu mindestens 85 % oder steht als Ganzes optisch mittig.
- **Risiko:** Gering. Die Spalten bleiben oben bündig zueinander (`align-items: start` bleibt).

### 3 · Umfrage-Folien als ruhiges eigenes Layout (systemisch, S)

- **Folien:** 04, 09, 21, 24, 32, 36, dazu der Platzhalter auf 25.
- **Befund (gemessen auf 09):** Antworttext beginnt bei x = 708, Balken, Linie und Pillen bei x = 660. Das unsichtbare `.umfrage-taste` (30 px + 18 px Abstand) belegt Platz. Der Auflösungsrahmen reicht von 640 bis 1820 px, also 20 px in den rechten Rand. Er kommt aus `deck.css` `.folie .ist-hervor[data-hervor-stil="rahmen"]`, gesetzt in `komponenten.js` Z. 1436 f. Drei Signale für dieselbe Sache: Rahmen, Navy-Balken und die Marke „AUFLÖSUNG“. „LIVE“, „BEISPIELDATEN“ und „AUFLÖSUNG“ stehen in Versalien mit 0,1 em Sperrung, sonst nirgends im Deck. Im Druck und in der Probe schwebt links „Beispielwerte – keine Aussage“ in 40 px Grau unter einer 3-px-Linie.
- **Umsetzung:** `css/folien/ki-folien.css`, Abschnitt „15, 17 UMFRAGE“:
  ```css
  .u-folie .umfrage-option { position: relative; }
  .u-folie .umfrage-taste { position: absolute; right: calc(100% + 12px); top: 50%; transform: translateY(-50%); }
  .u-folie .umfrage-zeile.ist-hervor[data-hervor-stil="rahmen"] { box-shadow: none; }
  .folie :is(.live, .beispiel, .umfrage-marke) { text-transform: none; letter-spacing: 0.01em; }
  .u-folie .umfrage-marke { border-radius: 999px; padding: 6px 16px; }
  .umfrage-aussage.ist-leer { border-top: 2px dashed var(--k-linie); }
  .umfrage-aussage.ist-leer .ua-leer { font: 500 28px/1.3 var(--schrift-text); color: var(--k-tinte-2); }
  /* optional, ruhigere Balken: Spur statt Haarlinie */
  .u-folie .umfrage-spur { height: 12px; border-radius: 6px; background: var(--k-flaeche); }
  .u-folie .umfrage-balken { border-radius: 6px; }
  ```
  Die Farben der Pillen regelt Punkt 4.
- **Effekt:** Ein Sechstel des Decks verliert den Widget-Look. Die Auflösung ist klar (Navy-Balken und Marke) und bleibt im Satzspiegel.
- **Risiko:** Gering. Die Tastenhilfe erscheint beim Hovern weiter, nur links außerhalb. Die Kennzeichnung „Beispieldaten“ bleibt Pflicht und sichtbar, nur nicht in Versalien. Der Balken `--k-mittel` auf `--k-flaeche` hat 3,1 : 1 (≥ 3 : 1 für Grafik).

### 4 · Farbdisziplin vollenden: Ampel nur für Klassen, Bedienung in Blau (systemisch, S)

- **Folien und Befund:**
  - 04/09/21/24/32/36: Die LIVE-Pille ist grün (`--f-erfolg` #2B6B45, also das Grün von „minimal“). Die Beispieldaten-Pille ist braun-orange (`--f-warnung` #7A4B00).
  - 06: Verschobene Termine sind **rot** durchgestrichen (`.z-alt.schritt-an`, `var(--k-rot)`). Rot heißt im Deck „verboten“.
  - 08: Das Betreiber-Icon in der Navy-Karte hat orange Duotone (`.ro-rolle--kmu .ro-symbol { --duo: var(--k-orange) }`).
  - 23: Der Countdown-Ring wird beim Laufen orange und am Ende rot (`.k-uhr.ist-laeuft`, `.k-uhr.ist-ende`).
  - 29: Die Icons der Hilfen haben grüne Duotone (`.bu-symbol { --duo: var(--k-gruen) }`).
  - 33: Schritt 3 „Klassifizieren“ zeigt als Icon das orange **Hochrisiko-Dreieck** (`.st-schritte li:nth-child(3) .st-symbol`, `<use href="#s-hoch">`). Gelesen wird: „Schritt 3 ist hochriskant“.
  - 12/14: Die Stellen-Nummer steht in Klassenfarbe, aber als **Kreis** (`.vb-stelle`, `.vb-stelle--hoch`). Kreis ist die Form von „Transparenz“, also widersprechen sich Farbe und Form.
  - Neutral-Fassung: Der Fokus ist orange (`--f-fokus: var(--k-orange)`, `.br-knopf:focus-visible`).
- **Umsetzung:** `css/folien/ki.css`, Abschnitt 4 bzw. 7:
  ```css
  .folie .live { color: var(--sa-blau, var(--k-tinte)); }
  .folie .beispiel { color: var(--k-tinte-2); background: transparent; border-style: dashed; }
  .z-alt.schritt-an { text-decoration-color: var(--k-tinte); }
  .ro-rolle--kmu .ro-symbol { --duo: var(--k-papier); --duo-o: .3; }
  .k-uhr.ist-laeuft { box-shadow: inset 0 0 0 10px var(--sa-blau, var(--k-tinte)); }
  .k-uhr.ist-ende { box-shadow: inset 0 0 0 10px var(--k-tinte); }
  .k-uhr.ist-ende .k-uhr-zeit { color: var(--k-tinte); }
  .bu-symbol { --duo: var(--k-tinte); --duo-o: .16; }
  .br-knopf:focus-visible, .br-regler:focus-visible { outline-color: var(--f-fokus); }
  /* Stellen-Nummer in Klassenform */
  .vb-stelle:not([class*="--"]) { border-radius: 0; clip-path: polygon(29% 0,71% 0,100% 29%,100% 71%,71% 100%,29% 100%,0 71%,0 29%); }
  .vb-stelle--hoch { width: 66px; height: 60px; border-radius: 0; clip-path: polygon(50% 0,100% 100%,0 100%); padding-top: 18px; }
  ```
  Für die Neutral-Fassung in `ki.css` Z. 104 (Zuordnung zur Engine) `--f-fokus: var(--k-orange)` durch `var(--k-tinte)` ersetzen. Die SimpleAct-Regel (Z. 480–483) setzt weiter Blau.
  33 in `index.html`: Für „Klassifizieren“ ein neutrales Icon verwenden (z. B. `#ph-clipboard-text`) oder die vier Klassenformen als 2 × 2-Mini-Raster. Die vier Formen zusammen bedeuten „einsortieren“, nicht „hochriskant“. Dazu Zeile 893 `fill: var(--k-orange)` löschen.
- **Effekt:** Die Kernregel des Decks ist lückenlos. Ein kritischer Zuschauer findet keinen Gegenbeweis, und Blau wird erkennbar zur Farbe für „hier passiert etwas / hier bedienen“.
- **Risiko:** Gering. Blau #2563EB hat 4,8 : 1 auf Papier. Neutral fällt per Fallback auf Navy zurück. Am Countdown-Ende fehlt künftig die Warnfarbe, das Pulsieren bleibt (es ist bei „Bewegung reduzieren“ schon aus).

### 5 · Laufleiste vollenden (systemisch, XS)

- **Folien:** 06–35.
- **Befund:** Die Pfadlinie läuft nach „KMU-Praxis“ noch ca. 130 px ins Leere (x ≈ 1550–1680), der Pfad hat kein Ende. Auf 35 („alle erledigt“) läuft auch die blaue Linie bis dorthin.
- **Umsetzung:** `css/folien/ki.css`, Abschnitt 2:
  ```css
  .k-lauf-pfad::before { right: calc(25% - 11px); }   /* Linie endet in der Mitte von Station 4 */
  .k-lauf-pfad::after  { max-width: 75%; }             /* Fortschritt nie über Station 4 hinaus */
  ```
- **Effekt:** Der Prüfpfad hat Anfang und Ende. Das ist auf 30 Folien sichtbar und schärft die Metapher, zwei Zeilen Aufwand.
- **Risiko:** Keins. `--k-fortschritt` (0/25/50/75/100 %) passt weiter, weil die vier Spalten gleich breit bleiben.

### 6 · Artikel-Stempel leiser (systemisch, XS)

- **Folien:** ca. 95 Stempel auf 06, 07, 08, 10, 11, 12, 14–17, 19, 28–30, dazu im Baum 20/22. Allein 10 auf 12, 6 auf 11 und 5 auf 30.
- **Befund:** Jeder Stempel ist ein Kasten mit 2 px Rahmen. In Summe entsteht ein Rauschen aus Mini-Rahmen, das mit den Karten-Rahmen konkurriert (besonders 12, 16, 30).
- **Umsetzung:** `css/folien/ki.css`, `.k-stempel`:
  ```css
  .k-stempel { border: 0; padding: 4px 11px 5px; background: color-mix(in srgb, currentColor 9%, transparent); }
  .k-stempel--klein { padding: 2px 9px 3px; }
  .k-stempel[data-klasse] { border: 1.5px solid currentColor; background: transparent; }  /* Klassentexte behalten AA */
  ```
- **Effekt:** Die Belege bleiben, treten aber hinter den Inhalt zurück. Folien mit vielen Belegen wirken sofort ruhiger.
- **Risiko:** Kontrast gerechnet: `--k-tinte-2` auf getöntem Papier 6,1 : 1, auf getönter Fläche 5,5 : 1. Auf Navy-Karten (08, 11, 19) wird die Tönung über `currentColor` hell und bleibt sichtbar. Stempel in Klassenfarbe bleiben umrandet, weil Orange-Text auf Tönung unter 4,5 : 1 fiele.

### 7 · Ein Kartensystem: 2 Radien, 1 Rahmen, gerade Klassenkanten (systemisch, M)

- **Folien:** ca. 25, besonders 10, 12, 13, 16, 17, 27, 29, 31, 33–35.
- **Befund:** 7 Radien und 6 Rahmenstärken, siehe Gesamturteil. Die Klassenkanten oben (12 rot, 17 gelb, 35 je Klasse) sind `box-shadow: inset 0 Npx 0` auf runden Karten und werden an den Ecken dicker. Auf 10, 26 und 31 gibt es mehrere Navy-Hervorhebungen gleichzeitig.
- **Umsetzung:**
  - Tokens in `ki.css` Abschnitt 1, Block `html[data-thema]`: `--k-radius: 12px; --k-radius-s: 8px; --k-rahmen: 3px;`
  - Karten (Ebene 1), `ki-folien.css`: `.au-bnetza, .br-regel, .kl-feld, .wm-regeln, .ke-kameras li, .pa-qr, .di-qr, .sa-karte, .mi-feld, .hr-tuer { border-radius: var(--k-radius); }`
  - Zeilen und Felder in Karten (Ebene 2): `.au-eu, .au-sonder li, .wm-rollen li, .bu-liste li, .mi-tipp, .hr-felder li, .fi-liste li, .pf-betrvg, .pf-stapel li, .tr-bild { border-radius: var(--k-radius-s); }`
  - Ein Rahmen: alle `inset 0 0 0 4px …` auf `var(--k-rahmen)` setzen. Betroffen sind `.pf-spalte--betreiber`, `.st-praxis`, `.wm-regeln`, `.ko-faelle li:last-child`, `.ir-karten li:has(.ir-fakt.schritt-an)`, `.dr-karten li:has(.dr-urteil.schritt-an)`, `.vb-betrieb`, `.tr-betrieb`, `.gp-regel--schwelle`, `.sa-karte`. Bei `.hr-tuer` Rahmen 3 px und Schwelle 8 px.
  - Gerade Klassenkante statt „Lippe“:
    ```css
    .vb-raster li, .tr-szenen li, .ke-kameras li { position: relative; overflow: hidden; box-shadow: none; }
    .vb-raster li::before, .tr-szenen li::before, .ke-kameras li::before {
      content: ""; position: absolute; inset: 0 0 auto 0; height: 6px; background: var(--k-kante); }
    .vb-raster li { --k-kante: var(--k-rot); }  .tr-szenen li { --k-kante: var(--k-gelb); }  .ke-kameras li { --k-kante: var(--k); }
    .vb-neu { box-shadow: inset 0 0 0 var(--k-rahmen) var(--k-rot) !important; }
    ```
  - **Regel fürs Team:** pro Folie höchstens eine Navy-Fläche. Beige ist neutral. Ein Rahmen steht nur für „unser Fall / im Betrieb“. Auf 10 wird die EU-Marke (`.au-marke`) dann umrandet statt Navy-gefüllt.
  - Typo-Raster im selben Zug: Heute sind rund 20 Schriftgrade im Einsatz (26, 27, 29, 31, 32, 38, 46 … px). Auf 7 Stufen gehen: 22 (Meta) · 28 (Text) · 34 (Kartentitel) · 44 (Zahl klein / Lead) · 60 (Frage) · 76 (Titel) · 118 (Titelfolie). Beispiele: `.gp-regel` 29 → 28, `.st-schritte b` 31 → 34, `.hr-schild` 38 → 34, `.pf-kopf b` 40 → 44. Inter Tight ab 34 px mit `letter-spacing: -0.01em`.
- **Effekt:** Größter Einzelschritt weg vom Template-Look. Das Deck liest sich wie aus einem Guss, und die Hervorhebung bekommt wieder Gewicht.
- **Risiko:** Mittel, weil viele Selektoren betroffen sind. Danach alle Folien gegen die Bilder vergleichen. `overflow: hidden` an `.vb-raster li` vorher prüfen, falls ein Stempel über den Rand ragen soll (tut er heute nicht).

### 8 · Ein Nummernsystem (systemisch, S–M)

- **Folien:** 03, 12, 13, 14, 17, 18, 23, 25, 30, 33, 34, 37.
- **Befund:** 9 Plaketten-Varianten. Die Daumen-Fälle 1–5 (13, gefüllte Navy-Kreise), die Partnerarbeitsschritte (23), die Diskussionsfragen (37) und die Stellen 1–6 sehen gleich wichtig aus. Auf 30 sind „1 Bonitäts-Score“ und „2 Videoüberwachung“ keine Stellen des Betriebs, „3“ und „4“ aber schon (laut Kommentar in ki-folien.css Z. 1223 gewollt). Das verwirrt.
- **Umsetzung:**
  - **Stellen 1–6** immer als `.w-nr` (Navy-Ring). Ist die Klasse bekannt, in Klassenform wie auf dem Wimmelbild (siehe Punkt 4).
  - **Abfolgen und Aufzählungen** als freie Ziffern ohne Kreis:
    ```css
    .dr-nr, .pa-schritte li::before, .di-fragen li::before {
      width: auto; height: auto; background: none; color: var(--k-tinte-2);
      font: 700 40px/1 var(--schrift-display); place-items: start; }
    .sa-nr { box-shadow: none; background: none; padding: 0; font-size: 34px; color: var(--k-tinte-2); }
    ```
  - **30:** Die Fälle 1 und 2 als „A“ und „B“ (nur Beschriftung in `.ge-nr`, die Notizen nennen keine Nummern). 3 und 4 als Stellen-Ringe.
  - **05:** `.p-punkt` bleibt (siehe Signature-Idee A).
- **Effekt:** Eine Zahl im Kreis heißt nur noch „Stelle im Betrieb“. Damit trägt die Muster Metallbau als roter Faden besser.
- **Risiko:** Gering. A/B auf 30 ist eine Beschriftungsänderung, kurz mit dem Rechts-Review abstimmen.

### 9 · Folie 25: Tabelle ragt 117 px aus dem Satzspiegel (XS)

- **Befund (gemessen):** Die Tabelle läuft von x = 944 bis 1917, der Rand liegt bei 1800, die Folienkante bei 1920. Die Spalte „Pflicht“ steht fast am Bildrand. Im Bild 25.jpg sichtbar an der rechten Linie und an „Maschinenverordnung…“.
- **Umsetzung:** `ki-folien.css`, nach Z. 1268:
  ```css
  .inv-folie .inv-inhalt { grid-template-columns: 640px minmax(0, 1fr) !important; column-gap: 40px; }
  .inv-bild { width: 640px; height: 427px; }
  ```
  Die Spalte wird 1000 px breit, die Tabelle braucht 973 px. Den Platzhalter unten rechts erledigt Punkt 3.
- **Effekt:** Ein echter Layoutfehler verschwindet, ausgerechnet auf der Auflösungsfolie.
- **Risiko:** Gering. Die Flugbahn der Klassenformen (ki-animation.js, `choreo('f25')`) liest die Positionen aus dem DOM und passt sich an.

### 10 · Folie 35 Kernbotschaft: Marken-Navy, klare Icons (S)

- **Befund:** Der Hintergrund ist #0F1626 (fast schwarz), nicht das Logo-Navy #122E55. Die Folie wirkt wie „Dunkelmodus an“, nicht wie ein Markenmoment. Die Kamera-Icons sind schlammig (Duotone mit 0,55 Deckkraft auf Dunkel: Orange wird braun, Rot weinrot). Es greift `[data-klasse] svg.ph { --duo-o: .55 }` aus ki.css Z. 456, nicht das schwächere `.ke-kamera { --duo-o: .7 }`. Dazu die Lippen-Kanten aus Punkt 7.
- **Umsetzung:** `ki.css` Abschnitt 7, nach Z. 479:
  ```css
  html[data-auftritt="simpleact"] :is(.buehne,.ue-bild,.r-vorschau,.druck-seite) > .folie[data-modus="dunkel"] {
    --k-papier: #122E55; --k-flaeche: #1B3A66; --k-flaeche-2: #234679; --k-linie: #2F5085; --k-tinte-2: #BAC6DA; }
  ```
  In `ki-folien.css`, Abschnitt 24: `.ke-kameras li[data-klasse] svg.ke-kamera { --duo-o: 1; }` (die Spezifität muss die Regel aus ki.css Z. 456 schlagen) und `.ke-botschaft { font-size: 84px; letter-spacing: -0.025em; }`, damit die Botschaft die Folie führt und nicht die Karten.
- **Effekt:** Der Höhepunkt des Vortrags sieht nach SimpleAct aus, nicht nach Systemeinstellung.
- **Risiko:** Kontraste gerechnet: Tinte 11,9 : 1 auf Navy und 10,0 : 1 auf der Karte, `--k-tinte-2` neu 7,9 / 6,6 : 1, Klassenfarben als Grafik 3,8–6,5 : 1, Etikett-Texte unverändert ≥ 6 : 1. Die Regel greift nur auf Folien mit eigenem `data-modus="dunkel"` (heute nur 35), nicht auf den Dunkelmodus per Taste D. Neutral bleibt beim alten Dunkel.

### 11 · Folie 01 Titelfolie: Absender in die Kopfzeile, Trichter flach (S–M)

- **Befund:** Sechs Textebenen übereinander (Logo-Lockup 96 px mit 44-px-Wortmarke, Reihe, Titel 118, Untertitel, Meta, Vorbehalt). Das Logo-Lockup ist das zweitgrößte Element, man liest „SimpleAct“ vor der Frage, obwohl die Notizen ausdrücklich sagen: kein Produktvortrag. Der Trichter hat den einzigen Farbverlauf des Decks und eine graue Innenellipse und wirkt wie 3D-Clipart neben dem flachen Strichstil des Wimmelbilds.
- **Umsetzung:** `ki-folien.css`, Abschnitt „SimpleAct-Auftritt“:
  ```css
  .t-marke { position: absolute; top: var(--rand-oben); left: var(--rand-x); margin: 0; gap: 12px; height: 40px; }
  .t-logo { width: 40px; }
  .t-marke-text { display: flex; align-items: baseline; gap: 10px; }
  .t-marke-text b { font-size: 26px; letter-spacing: -0.01em; }
  .t-marke-text span { font-size: 22px; }          /* wie .k-lauf-thema in der Laufleiste */
  .t-vorbehalt { position: absolute; left: var(--rand-x); bottom: var(--rand-unten); margin: 0; }
  .t-reihe { margin-bottom: 28px; }  .t-meta { margin-top: 48px; }
  /* Trichter flach wie das Wimmelbild (gilt auch für Folie 15) */
  .t-trichter, .fi-form { fill: var(--k-iso-oben); }
  .t-rand, .fi-rand { fill: var(--k-flaeche-2); }
  .t-schacht, .fi-schacht { fill: var(--k-iso-rechts); }
  ```
- **Effekt:** Die Frage ist allein der Held. Die Marke steht genau dort, wo sie auf jeder anderen Folie steht (Kopfzeile), also System statt Werbung. Der Trichter passt zur übrigen Bildwelt.
- **Risiko:** Die Zeile „KI-Compliance mit System.“ läuft dann mit 22 px als Kopfzeilen-Meta wie die Laufleiste. Falls das Review sie als Inhalt mit 28-px-Pflicht wertet, 28 px lassen. Der Verlauf `#k-verlauf-koerper` wird nicht mehr gebraucht, die defs können bleiben.

### 12 · Folie 27 Irrtümer: redaktionell statt sechs Kästen (S)

- **Befund:** Sechs gleich große umrandete Kästen (ca. 520 × 350 px). Der Inhalt füllt jeweils nur das obere Drittel. Nach der Auflösung tragen alle sechs 4-px-Navy-Rahmen, ein Gitter aus Rahmen.
- **Umsetzung:** `ki-folien.css`, Abschnitt 21 (nach Z. 1369):
  ```css
  .ir-inhalt { justify-content: center; padding-bottom: 40px; }
  .ir-karten { grid-auto-rows: auto; gap: 56px 56px; height: auto; }
  .ir-karten li { background: transparent; border-radius: 0; padding: 24px 0 0; box-shadow: inset 0 3px 0 var(--k-linie); }
  .ir-karten li:has(.ir-fakt.schritt-an) { background: transparent; box-shadow: inset 0 3px 0 var(--k-tinte); }
  .ir-fakt { font-size: 36px; }
  ```
- **Effekt:** Sechs Spalten wie in einer Zeitung. Die Richtigstellung schaltet die Linie von Grau auf Navy, und die Folie atmet.
- **Risiko:** Gering. Die GSAP-Stempelung (`choreo('f27')`) zielt auf `.ir-fakt` und bleibt gültig.

### 13 · Folie 29 Kosten: Beträge als Zahlen setzen (XS–S)

- **Befund:** Die drei Kernaussagen („vor allem Zeit“, „5.000–8.000 €“, „193.000–330.000 €“) stehen in 30 px Fließtext. Die Folie hat Zahlen, zeigt sie aber nicht. Unten bleiben 203 px leer (siehe Punkt 2).
- **Umsetzung:** In `index.html` nur Auszeichnung, Wortlaut gleich: `vor allem <b class="ko-betrag">Zeit</b>` · `<b class="ko-betrag">ca. 5.000–8.000 €</b> je System und Jahr` · `Qualitätssystem samt Prüfung: einmalig <b class="ko-betrag">193.000–330.000 €</b>`. Dazu in `ki-folien.css`:
  ```css
  .ko-betrag { display: block; margin-top: 2px; font: 700 48px/1.1 var(--schrift-zahl); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--k-tinte); }
  ```
- **Effekt:** Man sieht die Steigerung Zeit → Tausender pro Jahr → sechsstellig einmalig auf einen Blick.
- **Risiko:** Gering. Die Lesereihenfolge bleibt, also mit dem Rechts-Review nur gegenlesen, nicht neu prüfen.

### 14 · Folie 37 Schluss: ein Ende, das wie ein Ende aussieht (M)

- **Befund:** Drei Fragen links (36 px, Navy-Kreise), QR-Karte rechts, viel Leere oben und unten. Kein Echo zum Anfang, die Marke zum dritten Mal in gleicher Form. Das Deck endet als Formular.
- **Umsetzung:**
  - Gleiche Bühne wie die Kapiteltrenner (Signature A): `data-modus="dunkel"` (mit Punkt 10 Marken-Navy). Oben der vollständige Prüfpfad (alle vier Stationen erledigt, groß). Die Fragen in 40 px Weiß mit freien Ziffern (Punkt 8). Die QR-Karte bleibt hell (`.di-qr { background: #fff; }`), weil QR-Codes Hell auf Dunkel brauchen.
  - Alternative ohne Dunkel: rechts statt der leeren Fläche die **eingefärbte Muster Metallbau** als Schlussbild. Sie ist schon als `<symbol id="wimmel-bau">` da: `<svg class="k-wimmel" viewBox="0 0 900 600" data-punkte="1 2 3 4 5 6" data-klassen="1:minimal 5:minimal 2:transparenz 3:hoch 6:hoch 4:verboten"><use href="#wimmel-bau"/></svg>`, mit der QR-Karte überlappend unten rechts.
- **Effekt:** Klammer zum Anfang (03 grau, 25 eingefärbt, 37 als Bild im Kopf). Der letzte Eindruck ist gestaltet.
- **Risiko:** QR mindestens 300 px groß lassen (Hörsaal-Hinterreihen). Dunkle Folie im PDF-Druck: Toner. Wer Ausdrucke verteilt, nimmt die helle Alternative.

### 15 · Folie 33 Fünf Schritte: Prüfpfad statt SmartArt-Pfeile (S–M)

- **Befund:** Fünf Chevrons per `clip-path` sind das bekannteste PowerPoint-SmartArt-Muster. Dazu das orange Dreieck als Icon (siehe Punkt 4). Der eigene Prüfpfad, also die Linie mit Stationen, wäre hier die stimmige Form.
- **Umsetzung:** `ki-folien.css`, Abschnitt 23:
  ```css
  .st-schritte { gap: 28px; position: relative; padding-top: 64px; }
  /* Linie von Mitte Punkt 1 bis Mitte Punkt 5: Spalte = 20 % − 22,4 px, also rechts 20 % − 44 px */
  .st-schritte::before { content: ""; position: absolute; top: 19px; left: 22px; right: calc(20% - 44px); height: 6px; border-radius: 3px; background: var(--k-mittel); }
  .st-schritte li, .st-schritte li:first-child { clip-path: none; margin-right: 0; border-radius: 0; background: transparent; color: inherit; padding: 0; }
  .st-schritte li::before { content: ""; position: absolute; top: -64px; left: 0; width: 44px; height: 44px; border-radius: 50%; background: var(--k-papier); box-shadow: inset 0 0 0 6px var(--k-tinte); }
  .st-schritte li:first-child::before { background: var(--sa-blau, var(--k-tinte)); box-shadow: none; }
  .st-schritte :is(.st-nr, .st-symbol, b, span:last-child) { padding-left: 0; margin-left: 0; }
  .st-schritte li:first-child :is(.st-nr, b, span:last-child) { color: inherit; opacity: 1; }
  .st-schritte li:first-child .st-symbol { color: var(--k-tinte); fill: var(--k-tinte); --duo: var(--k-tinte); --duo-o: .16; }
  ```
  Schritt 1 bleibt betont (gefüllter Punkt), wie die Notizen es wollen („Der wichtigste ist der erste“).
- **Effekt:** Die letzte Handlungsfolie spricht dieselbe Bildsprache wie Laufleiste und Fahrplan. Folie 34 (`.sa-weg`) kann dieselbe Linie bekommen.
- **Risiko:** Gering bis mittel, `data-staffel` animiert weiter die `li`. Die Linie im Druck prüfen.

### Außerdem (unterhalb der Top 15)

- **11 Pyramide:** Die hellen Deckflächen (`.py-oben`) erzeugen blasse Streifen zwischen den Stufen, das wirkt wie eine Stockgrafik. Flacher: `.py-stufe .py-oben { fill: color-mix(in srgb, var(--k) 82%, var(--k-papier)); } .py-stufe polygon { stroke: none; }`.
- **28 Rechner:** Der native Schieberegler wirkt wie ein Webformular. Gestalten mit `.br-regler { appearance: none; height: 6px; border-radius: 3px; background: var(--k-linie); }` und `::-webkit-slider-thumb { appearance: none; width: 30px; height: 30px; border-radius: 50%; background: var(--sa-blau, var(--k-tinte)); border: 5px solid var(--k-papier); box-shadow: 0 0 0 2px var(--sa-blau, var(--k-tinte)); }`. Die Knöpfe `.br-knopf.ist-aktiv` in Blau (Bedienakzent).
- **26 Zahlen:** Die Achse `.za-balken ol { border-bottom: 4px }` auf 2 px. Die Quelle „Destatis, IKT-Erhebung 2025“ steht doppelt (unter dem Diagramm und in der Fußzeile). Nur nach Rücksprache mit dem Review kürzen.
- **10 Aufsicht:** „Kammer in der BNetzA“ bricht als einziger Kacheltitel um, die Kachelzeilen stehen schief. Mit `.au-sonder b { font-size: 28px; }` passt alles einzeilig.

---

## 3. Drei Signature-Ideen (machbar bis 9.11.)

### A · Der Prüfpfad als Bühne: Kapitelvorhänge, die in die Kopfzeile schrumpfen

- **Idee:** Vier Kapiteltrenner vor 06, 11, 20 und 26, dazu der Fahrplan 05 im selben Stil. Navy-Vollfläche (Marken-Navy aus Punkt 10). Der Prüfpfad läuft groß über die Folie (Ringe 72 px, Linie 10 px, Stationsnamen 44 px Inter Tight). Die aktuelle Station hat eine riesige Ziffer (Inter Tight 700, ca. 420 px, `color: color-mix(in srgb, var(--sa-blau) 55%, var(--k-papier))`), darunter **die vorhandene Zeile vom Fahrplan** („Seit wann gilt was? Ist das überhaupt KI? Wer bin ich?“ usw.), also keine neuen Wörter. Beim Weiterblättern **schrumpft der große Pfad in die Laufleiste** der nächsten Folie.
- **Umsetzung:**
  - Vier `<section class="folie kap-folie" id="kap1…kap4" data-trenner data-modus="dunkel" data-laufkopf="aus" data-zeit="5">`.
  - In `js/folien/ki.js` beim Durchnummerieren `&& !f.hasAttribute('data-trenner')` in den Filter (Z. 41), damit alle Foliennummern und die Verweise („Folie 12“, „Folie 33“) gleich bleiben. Die IDs sind dreibuchstabig, damit `nummerVon()` keine Zahl ableitet.
  - Der große Pfad bekommt `data-morph="laufleiste"`. deck.js setzt daraus `view-transition-name` (`morphNamen`, Z. 1131), und die Laufleiste der Folgefolie trägt denselben Namen, also morpht der Browser die Leiste von groß nach klein ohne eigenes JS.
  - CSS ca. 60 Zeilen in `ki-folien.css` (Präfix `kap-`), die Pfadoptik von `.k-lauf-*` hochskaliert.
- **Warum unverwechselbar:** Die Navigation wird zur Erzählung. Das Publikum sieht viermal, wie es auf dem Pfad vorankommt, und das Deck bekommt Rhythmus und Farbtiefe (Navy alle 8–9 Folien statt einmal).
- **Risiken:** Bewegung reduzieren: deck.js schaltet die View Transitions ab, es bleibt ein harter Schnitt (gut). Druck: Die Trenner erscheinen als Kapitelseiten im PDF (gewollt). Neutral: Es gibt kein Logo darauf, also funktioniert es. `werkzeuge/pruefen.mjs` und die Zeitsumme (+20 s) prüfen. In der Referentenansicht zählt die Engine die Trenner mit, die sichtbaren Nummern nicht.

### B · Die Sortiermaschine als Leitmotiv

- **Idee:** Der Trichter mit den vier Klassenfächern von der Titelfolie ist die Bildmetapher des Vortrags („Welches Risiko?“ = einsortieren). Heute taucht er zweimal auf (01, 15). Er soll an den drei Wendepunkten zurückkehren:
  - **01:** Die Maschine sortiert die Tools (wie heute, flach nach Punkt 11).
  - **35 Kernbotschaft:** **Eine** Kamera-Karte fällt in den Trichter und landet dreifach in „minimal“, „hochriskant“ und „verboten“, beschriftet mit den vorhandenen Texten („erkennt Kratzer“, „stoppt die Maschine“, „liest Gefühle“). Dann folgt der Satz. Das ist genau die Kamera, die der Sprecher auf 01 ankündigt („Erinnern Sie sich an die Kamera vom Anfang?“), die Klammer wird sichtbar.
  - **Optional 37:** Die Fächer zeigen als Stapel die Ergebnisse der Partnerarbeit aus Frage 4 (`ki-eigener-fall`). Die Werte liefert die Umfrage-Engine schon.
- **Umsetzung:** Die Maschine aus `#f01 .t-maschine` als `<symbol id="sortiermaschine">` in die defs, auf 35 per `<use>` plus drei `.t-karte`-Gruppen. Choreografie in `ki-animation.js` als `choreo('f35', …)` aus dem vorhandenen MotionPath-Code von `choreo('f01')` ableiten. Der Endzustand ist reines CSS (Grundsatz der Datei).
- **Warum unverwechselbar:** Ein einziges, eigenes Bild trägt Anfang, Mitte und Ende, und das Publikum nimmt die Maschine als Modell im Kopf mit.
- **Risiken:** Aufwand ca. 1 Tag. Bewegung reduzieren, Druck, Aufnahme: statischer Endzustand. Live-Zahlen auf 37 nur, wenn die Umfrage stabil läuft, sonst statische Fächer ohne Zahlen.

### C · Das Prüfsiegel: ein Stempel für jedes Urteil

- **Idee:** Das Fundament nennt das Deck „sachlich wie ein Prüfprotokoll“. Daraus wird ein sichtbares Objekt: Jedes Urteil wird als **Prüfsiegel** gesetzt, ein Rechteck mit Doppellinie, Klassenform und Klassenwort, darunter der vorhandene Artikel, um −3° gedreht wie ein echter Stempel.
- **Einsatzorte:** 13 (Daumen-Runde, statt der Pillen), 20/22 (Ergebnisfeld), 25 (Tabellenzeile oder neben dem Wimmelbild-Punkt) und 35.
- **Umsetzung:** Neue Komponente in `ki.css` Abschnitt 4:
  ```css
  .k-siegel { display: inline-grid; justify-items: start; gap: 2px; padding: 10px 16px 12px;
    color: var(--k-t); border-radius: 6px; rotate: -3deg;
    box-shadow: inset 0 0 0 3px currentColor, inset 0 0 0 7px var(--k-papier), inset 0 0 0 8.5px currentColor;
    font: 700 30px/1.1 var(--schrift-display); }
  .k-siegel .k-stempel { border: 0; padding: 0; background: none; color: currentColor; }
  ```
  Die Animation gibt es schon: `stempeln()` in `ki-animation.js` (Z. 92, auf 13 und 27 im Einsatz) für das Aufsetzen mit kurzer Skalierung 1,3 → 1.
- **Warum unverwechselbar:** Das Urteil wird zu einem Ding, das man „bekommt“. Das passt zu Compliance, zum Markenversprechen „mit System“ und zu den Stempeln, die das Deck ohnehin führt.
- **Risiken:** Lesbarkeit bei Drehung: höchstens −3°, Text ≥ 28 px, Farben wie `.k-etikett` (AA erfüllt). Bewegung reduzieren und Druck: Siegel statisch. Keine neuen Wörter, nur Klassenwort und vorhandener Artikel.

---

## 4. Reihenfolge bis zum 9.11.

| Tag | Arbeit |
|---|---|
| 2.11. | 1, 2, 5, 6, 9 (zusammen ca. 2 Std.), danach Messskript und `pruefen.mjs` |
| 3.11. | 3, 4, 10, 13 |
| 4.–5.11. | 7 und 8 (Kartensystem, Nummern), 12, 15 |
| 6.11. | 11 (Titel), 14 (Schluss) |
| 7.–8.11. | Signature A, bei Luft B (nur 35) |
| 8.11. | Gesamtprobe: Beamer, PDF-Druck (`?druck`), `?bewegung=reduziert`, `?marke=neutral`, Kontrastprüfung, Referentenansicht |

**Prüfwerte nach der Umsetzung (mit `scratchpad/design/live/mess2.mjs`):** alle Titel-Oberkanten bei 152 px, keine Inhaltskante rechts über 1800 px, Lücke über der Quelle auf keiner Folie über 160 px (ausgenommen bewusst mittige Folien).
