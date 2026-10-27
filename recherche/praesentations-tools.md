# Recherche: Werkzeuge für animierte Web-Präsentationen

Stand: 27.10.2026. Sterne, Lizenzen und Aktivität aus der GitHub-Suche, Versionen aus der npm-Registry (jeweils am 27.10.2026 abgerufen).
„(ungeprüft)“ = nicht verifiziert.

## Ergebnis in einem Satz

**Eigene Engine (deck.js) behalten** und gezielt einzelne Animationstechniken einbauen. Kein Framework bietet Schritte, Referentenansicht, Themes, Live-Umfrage per QR-Code und PDF-Druck ohne Build-Schritt besser. Der einzige echte Vorsprung von reveal.js (Auto-Animate) und Slidev (Magic Move) lässt sich mit den View Transitions nachbauen, die deck.js schon nutzt.

## Werkzeuge nach Eignung

Eignung gemessen an unserem Fall: Vanilla-JS, offline per Doppelklick, Hosting auf GitHub Pages.

| # | Werkzeug | Sterne | Letzte Version | Lizenz | Kern für Animation | Build nötig? | Eignung |
|---|---|---|---|---|---|---|---|
| 1 | **View Transitions API** (im Browser eingebaut) | – | in Chrome, Edge, Safari; Firefox nur innerhalb einer Seite | – | gleiche Elemente morphen über Folien hinweg (`view-transition-name`) | nein | sehr hoch (in deck.js schon drin) |
| 2 | **[GSAP](https://github.com/greensock/GSAP)** | 29.814 | 3.15.0 (04/2026) | gratis, auch kommerziell; nicht OSI-Open-Source | Timeline, SplitText, DrawSVG, MorphSVG, Flip; alle Plugins gratis | nein | sehr hoch |
| 3 | **[anime.js v4](https://github.com/juliangarnier/anime)** | 73.942 | 4.5.0 (06/2026) | MIT | splitText, morphTo, createDrawable, Timeline, Spring | nein | hoch (MIT-Alternative zu GSAP) |
| 4 | **[Rough Notation](https://github.com/rough-stuff/rough-notation)** | 9.724 | 0.5.1 | MIT | handgezeichnete Kreise, Unterstreichungen, Marker, animiert | nein | hoch |
| 5 | **[Motion](https://github.com/motiondivision/motion)** | 34.588 | 14.7.1 (10/2026) | MIT (splitText nur im Bezahl-Paket) | animate, scroll, inView, stagger | nein | mittel bis hoch |
| 6 | **[number-flow](https://github.com/barvian/number-flow)** | 7.762 | 0.6.2 (07/2026) | MIT | Zähler im Tachometer-Stil | nein | mittel |
| 7 | **Chart.js** / **ECharts** | 67.763 / 67.610 | 4.6.1 / 6.1.0 | MIT / Apache-2.0 | Diagramme bauen sich animiert auf | nein | mittel |
| 8 | **[reveal.js](https://github.com/hakimel/reveal.js)** | 72.484 | 6.0.2 (09/2026) | MIT | Auto-Animate, Fragments | nein | Vorbild, kein Wechsel |
| 9 | **lottie-web** | 32.285 | 5.13.0 (2025) | MIT | After-Effects-Animationen als SVG | nein | niedrig bis mittel |
| 10 | **[Slidev](https://github.com/slidevjs/slidev)** | 49.242 | 53.0.0 (09/2026) | MIT | Magic Move, v-click, v-motion | ja (Vue/Vite) | niedrig (wäre ein Neubau) |
| 11 | impress.js · Spectacle · Animotion · Motion Canvas | 38k · 10k · 1,8k · 19,5k | – | MIT | 3D-Kamerafahrten / React / Svelte / Video | teils | niedrig |
| 12 | Marp · presenterm · WebSlides | 12,7k · 8,9k · 6,3k | – | MIT / BSD-2 | Markdown- bzw. Terminal-Folien, kaum Animation | teils | keine |

### Viral seit 2025: KI- und Agent-Generatoren

| Projekt | Sterne | Erstellt | Lizenz | Kern | Nutzen für uns |
|---|---|---|---|---|---|
| hugohe3/ppt-master | 69.547 | 12/2025 | (ungeprüft) | KI erzeugt .pptx | keiner |
| [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) | 31.419 | 01/2026 | MIT | Agent-Skill: eine HTML-Datei, `animation-patterns.md` | Ideenquelle |
| [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | 28.775 | 04/2026 | AGPL-3.0 | Magazin-/Swiss-Layouts, WebGL-Hintergrund mit Stromspar-Taste | Ideenquelle (nichts kopieren, AGPL) |
| presenton/presenton | 11.415 | 05/2025 | Apache-2.0 | KI-Generator (Gamma-Alternative), Docker + LLM | keiner |
| nicobailon/visual-explainer | 10.652 | 02/2026 | (ungeprüft) | HTML-Erklärseiten und Decks | Ideenquelle |
| zarazhangrui/beautiful-html-templates | 4.874 | 05/2026 | (ungeprüft) | HTML-Folienvorlagen | Gestaltung |

Trend 2026: **Agent-Skills, die HTML-Decks erzeugen**, keine neuen Frameworks. „Awesome“-Listen zum Thema sind klein und kaum gepflegt.

## Was wir in deck.js einbauen

1. **Auto-Animate mit View Transitions.** Elemente mit gleichem `data-id` auf zwei Folien bekommen vor dem Übergang denselben `view-transition-name`. So entsteht ein Morph zwischen Folien, ohne Bibliothek und mit Fallback ohne Übergang.
2. **GSAP** (Core, SplitText, DrawSVG, MorphSVG, Flip) lokal in `js/vendor/` ablegen. Jeder Folien-Schritt wird ein Label in einer Timeline, damit auch das Zurückblättern sauber funktioniert. Wenn reine Open-Source-Lizenz gewünscht ist, stattdessen anime.js v4.
3. **Rough Notation** für handgezeichnete Hervorhebungen von Schlüsselbegriffen, jeweils pro Schritt.
4. **Animierte Zähler** für Kennzahlen: GSAP-Tween plus `Intl.NumberFormat('de-DE')`.
5. **SVG-Diagramme, die sich aufbauen**, für den Vergleich der Befragten. Offline-sicher und druckbar.
6. **Pflicht-Hygiene:** `prefers-reduced-motion` beachten, beim Drucken immer den Endzustand zeigen.

Hinweis zum Offline-Betrieb per Doppelklick (`file://`): ES-Module und WASM-Player (dotLottie, Rive) können an CORS scheitern. Deshalb klassische UMD-Builds verwenden und Lottie-JSON inline einbinden.

## Animations-Ideen für „Führung im KMU“

1. **Definitionen verschmelzen:** Drei oder vier Definitionen als Karten. Die gemeinsamen Kernbegriffe (Einfluss, Ziel, Interaktion, Situation) werden markiert und fliegen per Morph in die Arbeitsdefinition.
2. **Führungsstil-Kontinuum als Regler** (Tannenbaum/Schmidt): Die Fläche „Spielraum der Führungskraft vs. des Teams“ verschiebt sich mit dem Regler. Später landen dort die Selbsteinschätzungen der Befragten.
3. **Organigramm-Kollaps:** Ein mehrstufiges Konzern-Organigramm schrumpft per Flip zur flachen KMU-Struktur mit der Inhaberin bzw. dem Inhaber im Zentrum.
4. **Kennzahlen-Zähler:** zum Beispiel der Anteil der KMU an allen Unternehmen und an den Beschäftigten, mit Quelle und Jahr.
5. **Wirkungskette mit DrawSVG:** Führung → Motivation → Bindung → Fachkräftesicherung → Erfolg. Pro Schritt wird der Pfeil weitergezeichnet.
6. **Vergleich der zwei Befragten:** geteilter Bildschirm, Zitate erscheinen Wort für Wort. Gemeinsamkeiten wandern in die Mitte, Unterschiede bleiben außen.
7. **Live-Umfrage auf dem Kontinuum:** „Wie wirst du geführt?“ Die Antworten aus dem Publikum erscheinen als Punkte auf dem Regler.
8. **Rollen-Überlappung:** Die Kreise Eigentümer, Geschäftsführer und Führungskraft schieben sich im KMU zu einer Schnittmenge zusammen.
9. **Callback am Schluss:** Die Arbeitsdefinition kommt zurück und wird um den KMU-Zusatz ergänzt. Das schließt den roten Faden.

Leitlinie: Jede Animation muss einen Gedanken zeigen (Herleitung, Vergleich, Veränderung), sonst weglassen.

## Offene Punkte

- Lizenzen einiger Agent-Projekte, UMD-Bundle von anime.js v4 und number-flow per `file://` sind ungeprüft.
- Firefox kann View Transitions zwischen zwei Seiten noch nicht. Für unsere Ein-Seiten-Engine spielt das keine Rolle.
