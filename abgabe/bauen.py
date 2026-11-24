#!/usr/bin/env python3
"""Baut die beiden Portfolio-PDFs für die Abgabe (Strategisches Marketing, Management im KMU).

Jedes PDF bekommt ein Deckblatt im Auftritt der Hochschule Kaiserslautern, ein Inhaltsverzeichnis,
je Leistung ein Zwischenblatt und danach die Unterlagen: Folien eine je Seite im Querformat,
Handouts und andere Dokumente im Hochformat. Alle Seiten sind A4, mit Kopfzeile und durchlaufender
Seitenzahl; das PDF hat Lesezeichen, und das Inhaltsverzeichnis ist anklickbar.

Aufruf (im Ordner des Repos):
    NODE_PATH=/opt/node-tools/node_modules python3 abgabe/bauen.py

Die Reihenfolge folgt der Folie „Zeitinvest und Portfolio Prüfung“ der Dozentin je Modul.
Was nicht im Repo liegt (Präsentationen von Elias Knauber, Recap Dunkin’), gehört nach abgabe/extern/.
"""
from __future__ import annotations

import argparse
import datetime
import html
import json
import math
import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

HIER = Path(__file__).resolve().parent
WURZEL = HIER.parent
sys.path.insert(0, str(HIER / "werkzeuge"))
import schriften as schriften_modul  # noqa: E402

# ---------------------------------------------------------------------------
# Maße (Punkt) und Farben
# ---------------------------------------------------------------------------
A4_HOCH = (595.276, 841.890)
A4_QUER = (841.890, 595.276)
RAND_X = 31.0          # linker und rechter Rand des Inhalts
RAND_OBEN = 42.0       # Platz für die Kopfzeile
RAND_UNTEN = 40.0      # Platz für die Fußzeile
KOPF_Y = 26.5          # Grundlinie Kopfzeile
FUSS_Y = 21.0          # Grundlinie Fußzeile, von unten
KLEIN = 7.5            # Schriftgröße Kopf- und Fußzeile

PETROL = (0x08 / 255, 0x62 / 255, 0x6C / 255)
LEISE = (0x6E / 255, 0x6E / 255, 0x73 / 255)
LINIE = (0xD2 / 255, 0xD2 / 255, 0xD7 / 255)

LINK_MARKE = "https://seite.invalid/"


# ---------------------------------------------------------------------------
# Datenmodell
# ---------------------------------------------------------------------------
@dataclass
class Blatt:
    """Eine Seite im fertigen PDF: eine Quellseite oder ein Ausschnitt daraus."""
    quelle: Path
    seite: int = 0                                   # 0-basiert
    ausschnitt: tuple | None = None                  # (x0, y0, x1, y1) in Punkten der Quellseite
    etikett: str = ""                                # Zusatz in der Kopfzeile rechts
    oben: bool = False                               # oben statt mittig ausrichten (Website-Aufnahmen)
    hoch: bool = False                               # immer Hochformat, auch wenn der Ausschnitt breiter als hoch ist


@dataclass
class Teil:
    name: str
    blaetter: list
    einheit: tuple = ("Seite", "Seiten")
    erste_seite: int = 0

    @property
    def umfang(self) -> str:
        n = len(self.blaetter)
        return f"{n} {self.einheit[0] if n == 1 else self.einheit[1]}"


@dataclass
class Abschnitt:
    art: str                 # Leistung laut Folie der Dozentin: Fallstudie, Review, Thema, Individuelle Leistung
    titel: str
    kurz: str                # Kurztitel für die Kopfzeile
    unter: str
    teile: list
    von: str | None = None
    termin: str | None = None
    online: list = field(default_factory=list)       # [(Beschriftung, URL)]
    seite: int = 0
    nr: int = 0


# ---------------------------------------------------------------------------
# Quellen in Blätter übersetzen
# ---------------------------------------------------------------------------
def aus_pdf(pfad: Path) -> list:
    with pymupdf.open(pfad) as d:
        return [Blatt(pfad, i) for i in range(d.page_count)]


def aus_vier_auf_eins(pfad: Path) -> list:
    """Keynote-Handzettel (vier Folien je Seite) in einzelne Folien zerlegen.

    Jede Folie hat einen dünnen schwarzen Rahmen; die Folie selbst ist die gefüllte Fläche darin.
    """
    blaetter = []
    with pymupdf.open(pfad) as d:
        for i, seite in enumerate(d):
            zeichnungen = seite.get_drawings()
            rahmen = [z["rect"] for z in zeichnungen
                      if z["type"] == "s" and z.get("color") == (0.0, 0.0, 0.0) and (z.get("width") or 0) < 0.6
                      and z["rect"].width > seite.rect.width * 0.3 and 1.6 < z["rect"].width / max(z["rect"].height, 1) < 1.95]
            flaechen = [z["rect"] for z in zeichnungen if z["type"] == "f"]
            folien = []
            for r in rahmen:
                innen = next((f for f in flaechen if abs(f.x0 - r.x0) < 0.6 and abs(f.y0 - r.y0) < 0.6
                              and abs(f.width - r.width) < 1.2 and abs(f.height - r.height) < 1.2), r)
                # knapp innerhalb des Rahmens bleiben, sonst steht dessen schwarze Haarlinie am Folienrand
                innen = pymupdf.Rect(max(innen.x0, r.x0 + 0.3), max(innen.y0, r.y0 + 0.3),
                                     min(innen.x1, r.x1 - 0.3), min(innen.y1, r.y1 - 0.3))
                schluessel = (round(innen.x0), round(innen.y0))
                if schluessel not in [k for k, _ in folien]:
                    folien.append((schluessel, innen))
            if not folien:
                raise SystemExit(f"{pfad.name}, Seite {i + 1}: keine Folienrahmen gefunden")
            for _, r in sorted(folien, key=lambda kr: (kr[0][1], kr[0][0])):
                blaetter.append(Blatt(pfad, i, (r.x0, r.y0, r.x1, r.y1)))
    return blaetter


def aus_website(ordner: Path, ansicht: dict) -> list:
    """Eine lange Website-Aufnahme auf A4-Hochformat verteilen, geteilt nur zwischen Blöcken."""
    pfad = ordner / f"{ansicht['name']}.pdf"
    px = 0.75                                               # 1 CSS-Pixel = 0,75 pt im Chromium-PDF
    breite = ansicht["breitePx"] * px
    hoehe = ansicht["hoehePx"]
    kasten_b = A4_HOCH[0] - 2 * RAND_X
    kasten_h = A4_HOCH[1] - RAND_OBEN - RAND_UNTEN
    kapazitaet = kasten_h / (kasten_b / breite) / px        # so viele Pixel passen in voller Breite auf eine Seite
    stellen = sorted(ansicht.get("teilstellen") or [])
    stuecke, y0 = [], 0.0
    while hoehe - y0 > kapazitaet * 1.15:
        rest = math.ceil((hoehe - y0) / kapazitaet)
        ziel = y0 + (hoehe - y0) / rest
        moeglich = [c for c in stellen if y0 + 250 < c <= y0 + kapazitaet and hoehe - c > 120]
        if moeglich:
            c = min(moeglich, key=lambda s: abs(s - ziel))
        else:
            spaeter = [c for c in stellen if c > y0 + 250 and hoehe - c > 120]
            if not spaeter:
                break
            c = min(spaeter)
        danach = [s for s in stellen if c < s <= c + 80]
        davor = [s for s in stellen if c - 80 <= s < c]
        if danach:
            luecke = (c, min(danach))
        elif davor:
            luecke = (max(davor), c)
        else:
            luecke = (c, c)
        mitte = (luecke[0] + luecke[1]) / 2
        stuecke.append((y0, mitte))
        y0 = mitte
    stuecke.append((y0, float(hoehe)))
    n = len(stuecke)
    return [Blatt(pfad, 0, (0, a * px, breite, b * px), oben=True, hoch=True,
                  etikett=ansicht["titel"] + (f" ({i + 1}/{n})" if n > 1 else ""))
            for i, (a, b) in enumerate(stuecke)]


# ---------------------------------------------------------------------------
# Inhalt der beiden Mappen
# ---------------------------------------------------------------------------
PAGES_KMU = "https://yannickoderso.github.io/Management-im-KMU/"
FOLIEN = ("Folie", "Folien")


def mappe_marketing(k: "Kontext") -> dict:
    repo, ext, rr = WURZEL, k.extern, k.rebranding
    ansichten = {a["name"]: a for a in json.loads((rr / "ansichten.json").read_text())}

    def web(*namen):
        return [b for n in namen for b in aus_website(rr, ansichten[n])]

    felder = [n for n in ansichten if n.startswith("feld-")]
    return {
        "datei": "Portfolio_Strategisches-Marketing_Heisler_Knauber.pdf",
        "modul": "Strategisches Marketing",
        "abschnitte": [
            Abschnitt(
                art="Fallstudie", titel="SEO-Fallstudie: 150.732 Besuche – was steckt dahinter?", kurz="SEO-Fallstudie",
                unter="Vorstellung und kritische Bewertung der SEO-Fallstudie „6-Step Process That Generated "
                      "150,732 Visits“ von Robbie Richards über UAV Coach",
                von="Yannick Heisler und Elias Knauber",
                online=[("Präsentation online", PAGES_KMU + "seo-fallstudie/praesentation/index.html")],
                teile=[
                    Teil("Handout", aus_pdf(repo / "seo-fallstudie/handout/handout.pdf")),
                    Teil("Präsentation", aus_pdf(repo / "seo-fallstudie/praesentation/export/seo-fallstudie-notfall.pdf"), FOLIEN),
                ]),
            Abschnitt(
                art="Fallstudie", titel="NIVEA Men DEEP", kurz="NIVEA Men DEEP",
                unter="Fallstudie 14, E-Sport-Marketing: Wie und warum geworben wurde – und wo die Kampagne "
                      "und ihr Erfolgsnachweis Schwächen zeigen",
                von="Elias Knauber", termin="9. November 2026",
                teile=[Teil("Präsentation", aus_vier_auf_eins(ext / "NIVEA_Men_DEEP_Fallstudie.pdf"), FOLIEN)]),
            Abschnitt(
                art="Review", titel="Recap: Dunkin’ & Podcast-Marketing", kurz="Recap Dunkin’ & Podcast-Marketing",
                unter="Review der Sitzung vom 19. Oktober 2026: Fallstudie „Dunkin’ Global: Strategie & Wandel“ "
                      "und Gastvortrag „Vom Podcast zur strategischen Marketingmaßnahme“",
                von=k.autor_dunkin, termin="Sitzung vom 19. Oktober 2026",
                teile=[Teil("Präsentation", aus_pdf(ext / "Recap_Dunkin.pdf"), FOLIEN)]),
            Abschnitt(
                art="Individuelle Leistung", titel="Workshop Rebranding-Roulette", kurz="Workshop Rebranding-Roulette",
                unter="Interaktive Website für eine Unterrichtseinheit: Jede Gruppe bekommt zufällig eine bekannte "
                      "Marke und eine neue Zielgruppe, arbeitet das Rebranding in acht Feldern aus und "
                      "präsentiert es als Pitch. Gezeigt am Musterbeispiel „Haribo für die Fitness-Bubble“.",
                von="Yannick Heisler und Elias Knauber",
                online=[("Website", "https://yannickoderso.github.io/Marketing/")],
                teile=[
                    Teil("Website: Startseite und Auslosung", web("start", "auslosung")),
                    Teil("Arbeitsbereich: die acht Felder am Musterbeispiel", web(*felder)),
                    Teil("Pitch-Board des Musterbeispiels", web("pitch-board")),
                    Teil("Pitch-Folien des Musterbeispiels",
                         [Blatt(rr / d) for d in ansichten["pitch-folien"]["dateien"]], FOLIEN),
                ]),
        ],
    }


def mappe_kmu(k: "Kontext") -> dict:
    repo, ext = WURZEL, k.extern
    recap = repo / "recap/2026-10-26-prozessmanagement-und-ki/praesentation"
    return {
        "datei": "Portfolio_Management-im-KMU_Heisler_Knauber.pdf",
        "modul": "Management im KMU",
        "abschnitte": [
            Abschnitt(
                art="Review", titel="Recap: Die Sitzung vom 26. Oktober", kurz="Recap der Sitzung vom 26.10.2026",
                unter="Review der Kerninhalte: Prozesse, KI im KMU, KI-Begriffe und Führung bei der Bundeswehr",
                von="Yannick Heisler und Elias Knauber", termin="Sitzung vom 26. Oktober 2026",
                online=[("Präsentation online", PAGES_KMU + "recap/2026-10-26-prozessmanagement-und-ki/praesentation/index.html")],
                teile=[Teil("Präsentation", aus_pdf(recap / "export/recap-notfall.pdf"), FOLIEN)]),
            Abschnitt(
                art="Thema", titel="Führung im KMU", kurz="Führung im KMU",
                unter="Begriff, Besonderheiten und Praxis, wenn Eigentum und Leitung in einer Hand liegen",
                von="Yannick Heisler", termin="16. November 2026",
                online=[("Präsentation online", PAGES_KMU + "fuehrung/praesentation/index.html")],
                teile=[
                    Teil("Handout (Diskussionspapier)", aus_pdf(repo / "fuehrung/diskussionspapier/diskussionspapier.pdf")),
                    Teil("Präsentation", aus_pdf(repo / f"fuehrung/praesentation/export/{k.fuehrung_pdf}"), FOLIEN),
                    Teil("Quellennachweis", aus_pdf(repo / "fuehrung/quellennachweis/quellennachweis.pdf")),
                ]),
            Abschnitt(
                art="Thema", titel="Selbstorganisation im Beruf", kurz="Selbstorganisation im Beruf",
                unter="Was dahintersteckt, was in kleinen und mittleren Unternehmen anders ist und wo es kippt",
                von="Elias Knauber", termin="2. November 2026",
                teile=[Teil("Präsentation", aus_vier_auf_eins(ext / "Selbstorganisation.pdf"), FOLIEN)]),
            Abschnitt(
                art="Individuelle Leistung", titel="KI-Compliance im KMU: Welches Risiko hat Ihre KI?", kurz="KI-Compliance im KMU",
                unter="Der EU AI Act und was er für kleine und mittlere Unternehmen bedeutet. "
                      "Vortrag mit Live-Umfragen, Klassifizierer und Partnerarbeit.",
                von="Yannick Heisler und Elias Knauber", termin="9. November 2026",
                online=[("Präsentation online", PAGES_KMU + "ki-compliance/praesentation/index.html"),
                        ("Klassifizierer", PAGES_KMU + "ki-compliance/praesentation/klassifizierer.html")],
                teile=[Teil("Präsentation", aus_pdf(repo / "ki-compliance/praesentation/export/ki-compliance-notfall.pdf"), FOLIEN)]),
        ],
    }


# ---------------------------------------------------------------------------
# Deckblatt, Inhaltsverzeichnis, Zwischenblätter (HTML → PDF mit Chromium)
# ---------------------------------------------------------------------------
def e(text: str) -> str:
    return html.escape(text, quote=True)


def ringe_svg() -> str:
    """Viertelkreis aus Ringsegmenten in den Farben des Hochschul-Logos, Mittelpunkt in der Ecke unten rechts."""
    farben = ["#90BC20", "#5CA83A", "#008F57", "#047A62", "#08626C", "#24859A", "#3DA8BE", "#1BBDED"]
    # je Ring: (Startwinkel, Endwinkel) in Grad, gemessen von der Unterkante (0°) zur rechten Kante (90°)
    segmente = [[(0, 90)], [(0, 34), (48, 90)], [(0, 62), (74, 90)], [(0, 18), (30, 90)],
                [(0, 50), (61, 90)], [(0, 76)], [(0, 26), (36, 90)], [(8, 58), (67, 90)]]
    teile = []
    for i, (farbe, bogen) in enumerate(zip(farben, segmente)):
        r = 11 + i * 9.4
        for a0, a1 in bogen:
            x0, y0 = -r * math.cos(math.radians(a0)), -r * math.sin(math.radians(a0))
            x1, y1 = -r * math.cos(math.radians(a1)), -r * math.sin(math.radians(a1))
            teile.append(f'<path d="M{x0:.2f} {y0:.2f} A{r:.2f} {r:.2f} 0 0 1 {x1:.2f} {y1:.2f}" stroke="{farbe}"/>')
    return ('<svg class="ringe" viewBox="-86 -86 86 86" xmlns="http://www.w3.org/2000/svg" fill="none" '
            'stroke-width="3.1" stroke-linecap="round">' + "".join(teile) + "</svg>")


CSS = """
@page { size: 210mm 297mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: "InterText", Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1D1D1F;
       -webkit-print-color-adjust: exact; print-color-adjust: exact; font-feature-settings: "ss03", "cv11"; }
.seite { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page; padding: 24mm 24mm 22mm 26mm; }
.seite:last-child { break-after: auto; }
.band { position: absolute; left: 0; top: 0; right: 0; height: 2.6mm;
        background: linear-gradient(90deg, #1BBDED, #3DA8BE 25%, #08626C 50%, #008F57 75%, #90BC20); }
.petrol { color: #08626C; }
.leise { color: #6E6E73; }
a { color: inherit; text-decoration: none; }

/* Deckblatt */
.deck .kopf { display: flex; justify-content: space-between; align-items: flex-start; }
.deck .logo { height: 27mm; margin: -2mm 0 0 -3mm; }
.deck .einheit { text-align: right; font-size: 9pt; line-height: 1.5; color: #6E6E73; padding-top: 3mm; }
.deck .einheit strong { display: block; color: #1D1D1F; font-weight: 600; }
.deck .mitte { position: absolute; left: 26mm; right: 24mm; top: 96mm; }
.deck .kicker { font-size: 9.5pt; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #08626C; margin: 0 0 5mm; }
.deck h1 { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-weight: 700; font-size: 39pt; line-height: 1.06;
           letter-spacing: -.028em; margin: 0 0 4.5mm; }
.deck .unter { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-size: 16pt; font-weight: 500; color: #6E6E73;
               letter-spacing: -.01em; margin: 0; }
.deck .strich { width: 22mm; height: .9mm; background: #08626C; margin: 11mm 0 10mm; border-radius: 1mm; }
.angaben { display: grid; grid-template-columns: 34mm 1fr; row-gap: 3.6mm; margin: 0; max-width: 118mm; }
.angaben dt { font-size: 8pt; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6E6E73; padding-top: .7mm; }
.angaben dd { margin: 0; font-size: 11pt; }
.angaben dd span { display: block; }
.angaben dd small { color: #6E6E73; font-size: 9pt; }
.deck .fuss { position: absolute; left: 26mm; bottom: 20mm; font-size: 10pt; }
.deck .fuss small { display: block; font-size: 8pt; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6E6E73; margin-bottom: 1.2mm; }
.ringe { position: absolute; right: 0; bottom: 0; width: 78mm; height: 78mm; }

/* Inhaltsverzeichnis */
.kolumne { font-size: 8pt; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6E6E73; margin: 0 0 16mm; }
.inhalt h2 { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-size: 27pt; font-weight: 700; letter-spacing: -.025em; margin: 0 0 9mm; }
.eintrag { border-top: .35mm solid #D2D2D7; padding: 4.6mm 0 3.6mm; break-inside: avoid; }
.eintrag:last-of-type { border-bottom: .35mm solid #D2D2D7; }
.eintrag .haupt { display: grid; grid-template-columns: 11mm 1fr 14mm; align-items: baseline; }
.eintrag .nr { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-size: 17pt; font-weight: 700; color: #08626C; letter-spacing: -.02em; }
.eintrag .art { font-size: 7.6pt; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #08626C; }
.eintrag .titel { font-size: 12.5pt; font-weight: 600; letter-spacing: -.012em; line-height: 1.25; margin-top: .6mm; text-wrap: balance; }
.eintrag .von { font-size: 9pt; color: #6E6E73; margin-top: .7mm; }
.eintrag .s { text-align: right; font-size: 11pt; font-weight: 600; font-variant-numeric: tabular-nums; }
.teile { margin: 2.2mm 0 0 11mm; }
.teil { display: flex; align-items: baseline; gap: 2mm; font-size: 9.4pt; padding: .75mm 0; }
.teil .punkte { flex: 1; border-bottom: .25mm dotted #B9B9BF; transform: translateY(-.9mm); }
.teil .umfang { color: #6E6E73; font-size: 8.6pt; }
.teil .s { width: 9mm; text-align: right; font-variant-numeric: tabular-nums; color: #1D1D1F; }
.hinweis { margin-top: 8mm; font-size: 8.6pt; color: #6E6E73; max-width: 150mm; }

/* Zwischenblatt */
.zwischen .gross { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-size: 96pt; font-weight: 700; line-height: .9;
                   letter-spacing: -.05em; color: #08626C; margin: 34mm 0 9mm -1.2mm; }
.zwischen .art { font-size: 9.5pt; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #08626C; margin: 0 0 4mm; }
.zwischen h2 { font-family: "InterDisplay", "InterText", Arial, sans-serif; font-size: 30pt; font-weight: 700; line-height: 1.1;
               letter-spacing: -.026em; margin: 0 0 5mm; max-width: 150mm; text-wrap: balance; }
.zwischen .unter { font-size: 12pt; line-height: 1.45; color: #6E6E73; margin: 0; max-width: 140mm; text-wrap: pretty; }
.zwischen .strich { width: 22mm; height: .9mm; background: #08626C; margin: 11mm 0 9mm; border-radius: 1mm; }
.zwischen .angaben { max-width: 150mm; }
.zwischen .angaben dd { font-size: 10.5pt; }
.zwischen .angaben a { color: #08626C; }
.zwischen .bestand { margin-top: 12mm; max-width: 150mm; }
.zwischen .bestand h3 { font-size: 8pt; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #6E6E73; margin: 0 0 2mm; }
.zwischen .teil { font-size: 10.5pt; padding: 1.5mm 0; border-top: .25mm solid #E8E8ED; }
.zwischen .teil:last-child { border-bottom: .25mm solid #E8E8ED; }
.zwischen .teil .punkte { border: 0; }
.zwischen .teil .s { width: 22mm; color: #6E6E73; font-size: 9.4pt; }
"""


def vorspann_html(k: "Kontext", mappe: dict, gesamt: int) -> str:
    schnitte = k.schnitte
    schrift_css = schriften_modul.css(schnitte, (k.cache / "schriften").as_uri() + "/")
    logo = k.logo.as_uri()
    modul = mappe["modul"]
    abschnitte = mappe["abschnitte"]

    def link(seite: int) -> str:
        return f"{LINK_MARKE}{seite}"

    personen = "".join(
        f"<span>{e(name)}" + (f" <small>· Matrikelnummer {e(k.matrikel[name])}</small>" if k.matrikel.get(name) else "") + "</span>"
        for name in k.autoren)
    deckblatt = f"""
<section class="seite deck">
  <div class="band"></div>
  <div class="kopf">
    <img class="logo" src="{logo}" alt="Hochschule Kaiserslautern, University of Applied Sciences">
    <div class="einheit"><strong>Fachbereich Betriebswirtschaft</strong>Campus Zweibrücken<br>Studiengang {e(k.studiengang)}</div>
  </div>
  <div class="mitte">
    <p class="kicker">Portfolio · {e(k.semester)}</p>
    <h1>{e(modul)}</h1>
    <p class="unter">Präsentationen und Abgaben</p>
    <div class="strich"></div>
    <dl class="angaben">
      <dt>Vorgelegt von</dt><dd>{personen}</dd>
      <dt>Dozentin</dt><dd>{e(k.dozentin)}</dd>
      <dt>Umfang</dt><dd>{len(abschnitte)} Leistungen · {gesamt} Seiten</dd>
    </dl>
  </div>
  <div class="fuss"><small>Abgabe</small>{e(k.ort)}, {e(k.datum)}</div>
  {ringe_svg()}
</section>"""

    eintraege = []
    for a in abschnitte:
        teile = "".join(
            f'<a class="teil" href="{link(t.erste_seite)}"><span>{e(t.name)}</span><span class="punkte"></span>'
            f'<span class="umfang">{e(t.umfang)}</span><span class="s">{t.erste_seite}</span></a>'
            for t in a.teile)
        von = " · ".join(x for x in (a.von, a.termin) if x)
        eintraege.append(f"""
  <div class="eintrag">
    <a class="haupt" href="{link(a.seite)}">
      <span class="nr">{a.nr}</span>
      <span><span class="art">{e(a.art)}</span><div class="titel">{e(a.titel)}</div>{f'<div class="von">{e(von)}</div>' if von else ''}</span>
      <span class="s">{a.seite}</span>
    </a>
    <div class="teile">{teile}</div>
  </div>""")
    inhalt = f"""
<section class="seite inhalt">
  <div class="band"></div>
  <p class="kolumne">{e(modul)} · Portfolio · {e(k.semester)}</p>
  <h2>Inhalt</h2>
  {''.join(eintraege)}
  <p class="hinweis">Die Seitenzahlen entsprechen den Seiten dieser PDF-Datei. Die Einträge sind anklickbar,
  und die Datei enthält Lesezeichen. Folien stehen einzeln im Querformat, Dokumente im Hochformat.</p>
</section>"""

    zwischen = []
    for a in abschnitte:
        zeilen = []
        if a.von:
            zeilen.append(f"<dt>Von</dt><dd>{e(a.von)}</dd>")
        if a.termin:
            zeilen.append(f"<dt>Termin</dt><dd>{e(a.termin)}</dd>")
        for beschriftung, url in a.online:
            zeilen.append(f'<dt>{e(beschriftung)}</dt><dd><a href="{e(url)}">{e(url.replace("https://", ""))}</a></dd>')
        teile = "".join(
            f'<a class="teil" href="{link(t.erste_seite)}"><span>{e(t.name)}</span><span class="punkte"></span>'
            f'<span class="umfang">{e(t.umfang)}</span><span class="s">ab Seite {t.erste_seite}</span></a>'
            for t in a.teile)
        zwischen.append(f"""
<section class="seite zwischen">
  <div class="band"></div>
  <p class="kolumne">{e(modul)} · Portfolio · {e(k.semester)}</p>
  <p class="gross">{a.nr}</p>
  <p class="art">{e(a.art)}</p>
  <h2>{e(a.titel)}</h2>
  <p class="unter">{e(a.unter)}</p>
  <div class="strich"></div>
  <dl class="angaben">{''.join(zeilen)}</dl>
  <div class="bestand"><h3>In diesem Teil</h3>{teile}</div>
</section>""")

    return (f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>{e(modul)}</title>'
            f"<style>{schrift_css}\n{CSS}</style></head><body>{deckblatt}{inhalt}{''.join(zwischen)}</body></html>")


# ---------------------------------------------------------------------------
# Zusammenbau
# ---------------------------------------------------------------------------
@dataclass
class Kontext:
    extern: Path
    marketing: Path
    ausgabe: Path
    cache: Path
    rebranding: Path
    logo: Path
    schnitte: dict
    autoren: list
    matrikel: dict
    dozentin: str
    studiengang: str
    semester: str
    semester_kurz: str
    ort: str
    datum: str
    autor_dunkin: str | None
    fuehrung_pdf: str


def node(skript: str, *argumente: str) -> None:
    umgebung = dict(os.environ)
    umgebung.setdefault("NODE_PATH", "/opt/node-tools/node_modules")
    subprocess.run(["node", str(HIER / "werkzeuge" / skript), *map(str, argumente)], check=True, env=umgebung)


def einpassen(format_: tuple, b: float, h: float, oben: bool) -> pymupdf.Rect:
    breite, hoehe = format_
    kb, kh = breite - 2 * RAND_X, hoehe - RAND_OBEN - RAND_UNTEN
    s = min(kb / b, kh / h)
    w, hh = b * s, h * s
    x0 = RAND_X + (kb - w) / 2
    y0 = RAND_OBEN + (0 if oben else (kh - hh) / 2)
    return pymupdf.Rect(x0, y0, x0 + w, y0 + hh)


def bauen(k: Kontext, mappe: dict) -> Path:
    abschnitte = mappe["abschnitte"]
    modul = mappe["modul"]

    # 1) Seitenzahlen festlegen: Deckblatt 1, Inhalt 2, dann je Abschnitt Zwischenblatt und Blätter
    seite = 3
    for nr, a in enumerate(abschnitte, 1):
        a.nr, a.seite = nr, seite
        seite += 1
        for t in a.teile:
            if not t.blaetter:
                raise SystemExit(f"{a.titel} / {t.name}: keine Seiten")
            t.erste_seite = seite
            seite += len(t.blaetter)
    gesamt = seite - 1

    # 2) Vorspann drucken
    stamm = mappe["datei"].rsplit(".", 1)[0]
    html_pfad = k.cache / f"{stamm}-vorspann.html"
    vorspann_pfad = k.cache / f"{stamm}-vorspann.pdf"
    html_pfad.write_text(vorspann_html(k, mappe, gesamt), encoding="utf-8")
    node("html2pdf.cjs", html_pfad, vorspann_pfad)
    vorspann = pymupdf.open(vorspann_pfad)
    if vorspann.page_count != 2 + len(abschnitte):
        raise SystemExit(f"Vorspann hat {vorspann.page_count} Seiten, erwartet {2 + len(abschnitte)} "
                         "(Inhaltsverzeichnis oder ein Zwischenblatt läuft über)")

    # 3) Zusammensetzen
    aus = pymupdf.open()
    offen: dict = {}
    schrift = pymupdf.Font(fontfile=str(k.schnitte[("InterText", 400, "latin")]))
    schrift_fett = pymupdf.Font(fontfile=str(k.schnitte[("InterText", 600, "latin")]))
    fuss_links = f"{modul} · Portfolio · {' und '.join(k.autoren)} · {k.semester_kurz}"
    lesezeichen = [[1, "Deckblatt", 1], [1, "Inhalt", 2]]

    def vorspann_seite(index: int) -> None:
        aus.insert_pdf(vorspann, from_page=index, to_page=index, final=0)

    def blatt_setzen(a: Abschnitt, t: Teil, b: Blatt, nummer: int) -> None:
        quelle = offen.setdefault(b.quelle, pymupdf.open(b.quelle))
        qseite = quelle[b.seite]
        ausschnitt = pymupdf.Rect(b.ausschnitt) if b.ausschnitt else qseite.rect
        format_ = A4_QUER if ausschnitt.width > ausschnitt.height * 1.05 and not b.hoch else A4_HOCH
        ziel = einpassen(format_, ausschnitt.width, ausschnitt.height, b.oben)
        neu = aus.new_page(width=format_[0], height=format_[1])
        neu.show_pdf_page(ziel, quelle, b.seite, clip=ausschnitt)
        neu.draw_rect(ziel, color=LINIE, width=0.5)

        # Verweise der Quellseite übernehmen (nur Internet-Adressen)
        s = ziel.width / ausschnitt.width
        for l in qseite.get_links():
            uri = l.get("uri") or ""
            if l.get("kind") != pymupdf.LINK_URI or not uri.startswith("http") or "127.0.0.1" in uri or "localhost" in uri:
                continue
            r = l["from"] & ausschnitt
            if r.is_empty:
                continue
            neu.insert_link({"kind": pymupdf.LINK_URI, "uri": uri, "from": pymupdf.Rect(
                ziel.x0 + (r.x0 - ausschnitt.x0) * s, ziel.y0 + (r.y0 - ausschnitt.y0) * s,
                ziel.x0 + (r.x1 - ausschnitt.x0) * s, ziel.y0 + (r.y1 - ausschnitt.y0) * s)})

        # Kopf- und Fußzeile
        breite, hoehe = format_
        tw_petrol = pymupdf.TextWriter(neu.rect)
        tw_leise = pymupdf.TextWriter(neu.rect)
        kopf_nr = f"{a.nr}"
        tw_petrol.append((RAND_X, KOPF_Y), kopf_nr, font=schrift_fett, fontsize=KLEIN)
        x = RAND_X + schrift_fett.text_length(kopf_nr, KLEIN) + 5
        tw_leise.append((x, KOPF_Y), f"{a.art} · {a.kurz}", font=schrift, fontsize=KLEIN)
        rechts = t.name + (f" · {b.etikett}" if b.etikett else "")
        tw_leise.append((breite - RAND_X - schrift.text_length(rechts, KLEIN), KOPF_Y), rechts, font=schrift, fontsize=KLEIN)
        tw_leise.append((RAND_X, hoehe - FUSS_Y), fuss_links, font=schrift, fontsize=KLEIN)
        zahl = f"Seite {nummer} von {gesamt}"
        tw_leise.append((breite - RAND_X - schrift.text_length(zahl, KLEIN), hoehe - FUSS_Y), zahl, font=schrift, fontsize=KLEIN)
        tw_petrol.write_text(neu, color=PETROL)
        tw_leise.write_text(neu, color=LEISE)

    vorspann_seite(0)
    vorspann_seite(1)
    for i, a in enumerate(abschnitte):
        vorspann_seite(2 + i)
        lesezeichen.append([1, f"{a.nr} {a.art}: {a.titel}", a.seite])
        nummer = a.seite
        for t in a.teile:
            lesezeichen.append([2, f"{t.name} ({t.umfang})", t.erste_seite])
            for b in t.blaetter:
                nummer += 1
                blatt_setzen(a, t, b, nummer)
    if aus.page_count != gesamt:
        raise SystemExit(f"Seitenzahl stimmt nicht: {aus.page_count} statt {gesamt}")

    # 4) Platzhalter-Verweise des Vorspanns in Sprünge innerhalb des PDFs umwandeln
    for seite_ in aus:
        for l in seite_.get_links():
            uri = l.get("uri") or ""
            if l.get("kind") == pymupdf.LINK_URI and uri.startswith(LINK_MARKE):
                ziel_nr = int(uri[len(LINK_MARKE):])
                seite_.delete_link(l)
                seite_.insert_link({"kind": pymupdf.LINK_GOTO, "from": l["from"], "page": ziel_nr - 1, "to": pymupdf.Point(0, 0)})

    aus.set_toc(lesezeichen)
    aus.set_metadata({
        "title": f"{modul} – Portfolio: Präsentationen und Abgaben",
        "author": " und ".join(k.autoren),
        "subject": f"Portfolio im Modul {modul}, {k.dozentin}, Hochschule Kaiserslautern, {k.semester}",
        "keywords": f"{modul}, Portfolio, Hochschule Kaiserslautern",
        "creator": "abgabe/bauen.py",
        "producer": "PyMuPDF",
    })
    aus.set_language("de-DE")
    aus.subset_fonts()
    k.ausgabe.mkdir(parents=True, exist_ok=True)
    ziel_pfad = k.ausgabe / mappe["datei"]
    aus.save(ziel_pfad, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True, use_objstms=1)
    aus.close()
    for d in offen.values():
        d.close()
    vorspann.close()

    print(f"\n{ziel_pfad}  ({gesamt} Seiten, {ziel_pfad.stat().st_size / 1e6:.1f} MB)")
    for a in abschnitte:
        print(f"  {a.nr}  S. {a.seite:>3}  {a.art}: {a.titel}")
        for t in a.teile:
            print(f"         S. {t.erste_seite:>3}  {t.name} ({t.umfang})")
    return ziel_pfad


def heute() -> str:
    monate = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    d = datetime.date.today()
    return f"{d.day}. {monate[d.month - 1]} {d.year}"


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--nur", choices=["marketing", "kmu"], help="nur eine der beiden Mappen bauen")
    p.add_argument("--extern", type=Path, default=HIER / "extern", help="Ordner mit den Unterlagen, die nicht im Repo liegen")
    p.add_argument("--marketing", type=Path, default=WURZEL.parent / "Marketing", help="Arbeitskopie des Repos Marketing")
    p.add_argument("--ausgabe", type=Path, default=HIER / "ausgabe")
    p.add_argument("--datum", default=heute(), help="Abgabedatum auf dem Deckblatt (Vorgabe: heute)")
    p.add_argument("--ort", default="Zweibrücken")
    p.add_argument("--matrikel", action="append", default=[], metavar="NAME=NUMMER",
                   help="Matrikelnummer aufs Deckblatt, z. B. --matrikel 'Yannick Heisler=123456' (mehrfach möglich)")
    p.add_argument("--autor-dunkin", default=None, help="Wer das Recap Dunkin’ gehalten hat (erscheint auf dem Zwischenblatt)")
    p.add_argument("--fuehrung-25", action="store_true", help="25-Minuten-Fassung der Führungs-Präsentation statt der langen Fassung")
    p.add_argument("--website-neu", action="store_true", help="Aufnahmen der Rebranding-Website neu erzeugen")
    arg = p.parse_args()

    cache = HIER / "_cache"
    cache.mkdir(exist_ok=True)
    schnitte = schriften_modul.erzeugen(WURZEL / "fuehrung/praesentation/schriften", cache / "schriften")
    autoren = ["Yannick Heisler", "Elias Knauber"]
    matrikel = dict(m.split("=", 1) for m in arg.matrikel)
    unbekannt = set(matrikel) - set(autoren)
    if unbekannt:
        raise SystemExit(f"--matrikel: unbekannter Name {sorted(unbekannt)}; erlaubt sind {autoren}")

    k = Kontext(
        extern=arg.extern, marketing=arg.marketing, ausgabe=arg.ausgabe, cache=cache, rebranding=cache / "rebranding",
        logo=arg.marketing / "assets/hskl-logo.png", schnitte=schnitte, autoren=autoren, matrikel=matrikel,
        dozentin="Prof. Dr. Christine Arend-Fuchs", studiengang="Mittelstandsökonomie",
        semester="Wintersemester 2026/27", semester_kurz="WiSe 2026/27", ort=arg.ort, datum=arg.datum,
        autor_dunkin=arg.autor_dunkin,
        fuehrung_pdf="praesentation-25-notfall.pdf" if arg.fuehrung_25 else "praesentation-notfall.pdf",
    )

    if arg.nur != "kmu":
        if arg.website_neu or not (k.rebranding / "ansichten.json").exists():
            web_css = cache / "schriften-web.css"
            web_css.write_text(schriften_modul.css(schnitte, "/__schriften/"), encoding="utf-8")
            node("rebranding.cjs", k.marketing, k.rebranding, cache / "schriften", web_css)
        bauen(k, mappe_marketing(k))
    if arg.nur != "marketing":
        bauen(k, mappe_kmu(k))


if __name__ == "__main__":
    main()
