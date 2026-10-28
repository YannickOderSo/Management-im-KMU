"""Erzeugt transkript.pdf aus transkript.md (HTML-Zwischenschritt, gedruckt mit Chromium über Playwright für Node).

Aufruf aus dem Repo-Wurzelordner:
    python3 recap/2026-10-26-prozessmanagement-und-ki/pdf-erzeugen.py

Schriften kommen lokal aus fuehrung/praesentation/schriften/ (Fraunces, Inter).
"""
import html
import json
import os
import re
import subprocess
from pathlib import Path

ORDNER = Path(__file__).resolve().parent
SCHRIFTEN = (ORDNER.parent.parent / "fuehrung" / "praesentation" / "schriften").as_uri()

SPRECHER = {
    "R1": ("R1", "r1", "Maximilian Büchele – Prozessmanagement"),
    "R2": ("R2", "r2", "Elbrus Tschekuev – KI im KMU"),
    "Doz.": ("Doz.", "doz", "Dozentin"),
    "Stud.": ("Stud.", "stud", "Wortmeldung aus dem Publikum"),
    "Stud./R1": ("Stud./R1", "stud", None),
    "Referent:in": ("Ref.", "r2", None),
}

# Kurzüberblick fürs Deckblatt – bewusst als eigene Zusammenfassung gekennzeichnet
UEBERBLICK = [
    ("Teil 1 · Prozesse im Unternehmen", "01:50 – 29:30", "nach ca. 28 Min. abgebrochen", [
        "Prozess nach Becker / Fleischmann, Modell vs. Instanz, Aufbau- vs. Ablauforganisation",
        "Relevanz: Wettbewerb (Stalk/Evans/Shulman), Prozessgüte, Komplexitätsfalle",
        "Zeitstrahl Smith → Taylor → Ford → Nordsieck → Porter, Scheer, Davenport, Hammer",
        "Prozessarten nach Porter, Phasenmodell nach Becker, DMAIC, Flowchart / EPK / BPMN 2.0",
    ]),
    ("Teil 2 · KI im KMU", "30:48 – 54:14", "Aufnahme endet vor dem Fallbeispiel", [
        "Zahlen: KfW 20 % (2022–24), Bitkom 57 % (ab 20 MA), Destatis groß 57 / mittel 36 / klein 23 %",
        "Größe ist Treiber, nicht Ursache – entscheidend ist das Know-how",
        "TOE-Modell (Tanzcafé-Beispiel) und TAM nach Davis: erst Nutzen zeigen, dann schulen",
        "KI übernimmt Schritte, keine ganzen Prozesse; Art. 4 KI-VO (KI-Kompetenz), Digital Omnibus",
    ]),
]
MERKSAETZE = [
    "Digitalisierung heißt: eindeutiger Lieferant und eindeutiger Kunde je Prozess – nicht mehr top-down.",
    "Prozesse laufen quer durch die Value Chain, nicht quer durch die Hierarchie.",
    "Ein Manager muss heute die Prozesse verstanden haben.",
    "Softwareprodukte setzen dort an, wo die Standards am größten sind (eher Support- als Kernprozesse).",
    "Nur auf die Folien, was man auch beantworten kann.",
]


def inline(text: str) -> str:
    t = html.escape(text, quote=False).replace(" %", "\u00a0%")
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)

    def klammer(m):
        inhalt = m.group(1)
        if inhalt.startswith("Anm."):
            return f'<span class="anm">{inhalt}</span>'
        return f'<span class="unsicher">[{inhalt}]</span>'

    return re.sub(r"\[([^\[\]]+)\]", klammer, t)


def absaetze(zeilen):
    """Fasst umbrochene Markdown-Zeilen zu Blöcken zusammen (Absatz, Liste, Trenner, Überschrift)."""
    block, art = [], None
    for z in zeilen + [""]:
        if not z.strip():
            if block:
                yield art, block
            block, art = [], None
            continue
        if z.startswith("#") or z.strip() == "---":
            if block:
                yield art, block
            yield ("kopf" if z.startswith("#") else "trenner"), [z]
            block, art = [], None
            continue
        if z.startswith("- "):
            if art != "liste" and block:
                yield art, block
                block = []
            art = "liste"
            block.append(z[2:])
        elif art == "liste" and z.startswith("  "):
            block[-1] += " " + z.strip()
        else:
            if art == "liste":
                yield art, block
                block = []
            art = "absatz"
            if block:
                block[-1] += " " + z.strip()
            else:
                block.append(z.strip())


def anker(zeit):
    return "t" + zeit.replace(":", "")


def inhalt_bauen(md: str):
    kopf, _, rumpf = md.partition("\n---\n")
    entstehung = [b[0] for art, b in absaetze(kopf.splitlines()[4:]) if art == "absatz"]
    entstehung = entstehung[: next(i for i, s in enumerate(entstehung) if s.startswith("**Kennzeichnung"))]

    teile, raus, sprecher_offen = [], [], False
    aktuell = {"titel": "Einstieg", "abschnitte": []}
    teile.append(aktuell)

    def zug_schliessen():
        nonlocal sprecher_offen
        if sprecher_offen:
            raus.append("</div></div>")
            sprecher_offen = False

    for art, block in absaetze(rumpf.splitlines()):
        if art == "trenner":
            zug_schliessen()
            continue
        if art == "kopf":
            zug_schliessen()
            z = block[0]
            if z.startswith("## Teil"):
                titel = z[3:].strip()
                aktuell = {"titel": titel, "abschnitte": []}
                teile.append(aktuell)
                nr, _, name = titel.partition(" – ")
                raus.append(f'<h2 class="teil"><span class="teil-nr">{inline(nr)}</span>{inline(name)}</h2>')
            else:
                text = z.lstrip("#").strip()
                m = re.match(r"(\d\d:\d\d) – (.+)", text)
                zeit, titel = (m.group(1), m.group(2)) if m else ("", text)
                aktuell["abschnitte"].append((zeit, titel))
                raus.append(
                    f'<h3 id="{anker(zeit)}"><span class="zeit">{zeit}</span>{inline(titel)}</h3>'
                )
            continue
        if art == "liste":
            items = "".join(f"<li>{inline(i)}</li>" for i in block)
            if sprecher_offen:
                raus.append(f"<ul>{items}</ul>")
            else:
                raus.append(f'<ul class="frei">{items}</ul>')
            continue
        text = block[0]
        m = re.match(r"^\*\*([^*]+?):?\*\*\s*(\*\([^)]*\)\*)?:?\s*(.*)$", text)
        if m and m.group(1) in SPRECHER:
            zug_schliessen()
            kurz, klasse, _ = SPRECHER[m.group(1)]
            zusatz = f'<span class="regie">{inline(m.group(2))}</span> ' if m.group(2) else ""
            raus.append(
                f'<div class="zug {klasse}"><div class="wer">{kurz}</div><div class="was">'
                f"<p>{zusatz}{inline(m.group(3))}</p>"
            )
            sprecher_offen = True
        elif re.match(r"^\*\[.*\]\*$", text):
            zug_schliessen()
            raus.append(f'<p class="notiz">{inline(text[2:-2])}</p>')
        elif sprecher_offen:
            raus.append(f"<p>{inline(text)}</p>")
        else:
            raus.append(f'<p class="frei">{inline(text)}</p>')
    zug_schliessen()
    return entstehung, teile, "\n".join(raus)


def deckblatt(entstehung, teile):
    karten = ""
    for titel, zeit, status, punkte in UEBERBLICK:
        li = "".join(f"<li>{inline(p)}</li>" for p in punkte)
        karten += (
            f'<div class="karte"><div class="karte-kopf"><strong>{titel}</strong>'
            f'<span>{zeit}</span></div><div class="status">{status}</div><ul>{li}</ul></div>'
        )
    merk = "".join(f"<li>{inline(s)}</li>" for s in MERKSAETZE)
    toc = ""
    for teil in teile:
        if not teil["abschnitte"]:
            continue
        zeilen = "".join(
            f'<a href="#{anker(z)}"><span class="zeit">{z}</span>{inline(t)}</a>'
            for z, t in teil["abschnitte"]
        )
        toc += f'<div class="toc-teil"><h4>{inline(teil["titel"])}</h4>{zeilen}</div>'
    legende = "".join(
        f'<span class="leg"><span class="wer-chip {k}">{kurz}</span>{name}</span>'
        for kurz, k, name in SPRECHER.values() if name
    )
    return f"""
<section class="deck">
  <div class="kicker">Management im KMU · Recap · Prof. Dr. Christine Arend-Fuchs</div>
  <h1>Prozesse im Unternehmen<br><span>&amp; KI im KMU</span></h1>
  <div class="meta">
    <div><b>Sitzung</b>Mo, 26.10.2026</div>
    <div><b>Aufnahme</b>54:14 Min.</div>
    <div><b>Art</b>Transkript, geglättet</div>
  </div>

  <h2 class="blick">Auf einen Blick <small>eigene Zusammenfassung, nicht Teil des Transkripts</small></h2>
  <div class="karten">{karten}</div>
  <div class="merk"><h4>Merksätze der Dozentin</h4><ul>{merk}</ul></div>
</section>

<section class="deck2">
  <h2 class="blick">Inhalt</h2>
  <div class="toc">{toc}</div>

  <h2 class="blick">Lesehilfe</h2>
  <div class="legende">{legende}</div>
  <div class="marker">
    <span><span class="unsicher">[?]</span> Wort unsicher</span>
    <span><span class="unsicher">[unverständlich]</span> nicht zu verstehen</span>
    <span><span class="anm">Anm.: …</span> Hinweis zur Bearbeitung</span>
  </div>
  <div class="entstehung">{"".join(f"<p>{inline(p)}</p>" for p in entstehung)}
  <p>Die Sprecherzuordnung ergibt sich aus dem Gesprächsverlauf und ist an einzelnen Stellen nicht sicher.</p></div>
</section>
"""


CSS = """
@font-face { font-family: Fraunces; src: url("{S}/fraunces-latin-opsz-normal.woff2"); font-weight: 100 900; }
@font-face { font-family: Fraunces; src: url("{S}/fraunces-latin-full-italic.woff2"); font-weight: 100 900; font-style: italic; }
@font-face { font-family: Inter; src: url("{S}/inter-latin-opsz-normal.woff2"); font-weight: 100 900; }
@font-face { font-family: Inter; src: url("{S}/inter-latin-opsz-italic.woff2"); font-weight: 100 900; font-style: italic; }
@page { size: A4; margin: 18mm 18mm 20mm 18mm; }
:root {
  --text: #1d1d1b; --leise: #5d5a54; --linie: #ddd6c8; --papier: #fbf6ea;
  --r1: #2f5d8a; --r1-f: #e6eef6; --r2: #2e7a5a; --r2-f: #e3f1ea;
  --doz: #8a5a00; --doz-f: #fff3c4; --stud: #5d5a54; --stud-f: #eeebe4;
}
* { box-sizing: border-box; }
body { margin: 0; font: 9.6pt/1.5 Inter, sans-serif; color: var(--text); font-variation-settings: "opsz" 14; }
h1, h2, h3, h4 { font-family: Fraunces, serif; font-variation-settings: "WONK" 0; margin: 0; }
strong { font-weight: 640; }
code { font: inherit; }

/* Deckblatt */
.deck { break-after: page; }
.deck2 { break-after: page; }
.kicker { font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; color: var(--leise); }
h1 { font-size: 30pt; line-height: 1.08; font-weight: 600; margin: 6mm 0 5mm; }
h1 span { font-style: italic; font-weight: 400; color: var(--r1); }
.meta { display: flex; gap: 0; border-top: 2px solid var(--text); border-bottom: 1px solid var(--linie); margin-bottom: 9mm; }
.meta div { flex: 1; padding: 2.5mm 0; font-size: 10pt; }
.meta b { display: block; font-size: 7.5pt; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--leise); }
h2.blick { font-size: 15pt; font-weight: 600; margin: 0 0 4mm; }
h2.blick small { font: italic 8.5pt Inter, sans-serif; color: var(--leise); margin-left: 2mm; }
.karten { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-bottom: 5mm; }
.karte { border: 1px solid var(--linie); border-radius: 3mm; padding: 4mm; background: #fff; }
.karte:first-child { border-top: 3px solid var(--r1); }
.karte:last-child { border-top: 3px solid var(--r2); }
.karte-kopf { display: flex; justify-content: space-between; gap: 2mm; font-size: 10pt; }
.karte-kopf span { font-variant-numeric: tabular-nums; color: var(--leise); white-space: nowrap; }
.status { font-size: 8.5pt; font-style: italic; color: var(--leise); margin: 1mm 0 2mm; }
.karte ul, .merk ul { margin: 0; padding-left: 4mm; }
.karte li, .merk li { margin: 1mm 0; font-size: 9pt; }
.merk { background: var(--doz-f); border-radius: 3mm; padding: 4mm 5mm; }
.merk h4 { font-size: 11pt; font-weight: 600; margin-bottom: 1mm; color: var(--doz); }

.toc { columns: 2; column-gap: 8mm; margin-bottom: 8mm; }
.toc-teil { break-inside: avoid; margin-bottom: 4mm; }
.toc h4 { font-size: 10.5pt; font-weight: 600; border-bottom: 1px solid var(--linie); padding-bottom: 1mm; margin-bottom: 1.5mm; }
.toc a { display: flex; gap: 3mm; color: inherit; text-decoration: none; font-size: 9pt; padding: .6mm 0; }
.zeit { font-variant-numeric: tabular-nums; color: var(--leise); font-weight: 500; min-width: 10mm; }
.legende { display: flex; flex-wrap: wrap; gap: 3mm 7mm; margin-bottom: 3mm; }
.leg { display: inline-flex; align-items: center; gap: 2mm; font-size: 9pt; }
.marker { display: flex; flex-wrap: wrap; gap: 2mm 7mm; font-size: 9pt; margin-bottom: 6mm; }
.entstehung { font-size: 8.8pt; color: var(--leise); border-top: 1px solid var(--linie); padding-top: 3mm; }
.entstehung p { margin: 0 0 2mm; }

/* Transkript */
h2.teil { break-before: page; font-size: 18pt; font-weight: 600; padding: 0 0 3mm; border-bottom: 2px solid var(--text); margin-bottom: 4mm; display: flex; align-items: baseline; gap: 3mm; }
h2.teil .teil-nr { font-size: 9pt; font-family: Inter, sans-serif; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--text); padding: .8mm 2.2mm; border-radius: 1mm; }
main h2.teil:first-of-type { break-before: auto; margin-top: 9mm; }
h3 { font-size: 12pt; font-weight: 600; margin: 6mm 0 2.5mm; display: flex; align-items: baseline; gap: 3mm; break-after: avoid; }
h3 .zeit { font: 600 8.5pt Inter, sans-serif; color: var(--leise); background: var(--papier); border: 1px solid var(--linie); border-radius: 1mm; padding: .4mm 1.6mm; min-width: 0; }
.zug { display: grid; grid-template-columns: 15mm 1fr; gap: 3mm; margin: 0 0 2.2mm; }
.zug p { margin: 0 0 1.6mm; }
.zug p:last-child { margin-bottom: 0; }
.wer, .wer-chip { font: 650 7.8pt Inter, sans-serif; text-align: center; border-radius: 1.2mm; padding: .6mm 0; height: fit-content; margin-top: .4mm; }
.wer-chip { display: inline-block; width: 13mm; }
.r1 > .wer, .wer-chip.r1 { background: var(--r1-f); color: var(--r1); }
.r2 > .wer, .wer-chip.r2 { background: var(--r2-f); color: var(--r2); }
.doz > .wer, .wer-chip.doz { background: var(--doz-f); color: var(--doz); }
.stud > .wer, .wer-chip.stud { background: var(--stud-f); color: var(--stud); }
.doz > .was { border-left: 2px solid #f2d36b; padding-left: 3mm; margin-left: -3mm; }
.zug ul { margin: 1mm 0 1.6mm; padding-left: 4.5mm; }
.zug li { margin: .8mm 0; }
.regie { font-style: italic; color: var(--leise); }
.notiz { font-size: 8.8pt; font-style: italic; color: var(--leise); background: var(--papier); border-left: 2px solid var(--linie); padding: 1.8mm 3mm; margin: 3mm 0 3mm 18mm; }
p.frei { margin: 0 0 2mm 18mm; }
.unsicher { background: #eeebe4; color: var(--leise); border-radius: .8mm; padding: 0 .6mm; font-size: .92em; }
.anm { font-size: .9em; font-style: italic; color: var(--leise); }
.anm::before { content: "["; } .anm::after { content: "]"; }
"""


def main():
    md = (ORDNER / "transkript.md").read_text(encoding="utf-8")
    entstehung, teile, rumpf = inhalt_bauen(md)
    seite = f"""<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Transkript 26.10.2026 – Prozesse im Unternehmen &amp; KI im KMU</title>
<style>{CSS.replace("{S}", SCHRIFTEN)}</style></head><body>
{deckblatt(entstehung, teile)}
<main>{rumpf}</main></body></html>"""
    (ORDNER / "transkript.html").write_text(seite, encoding="utf-8")
    fuss = (
        '<div style="width:100%;font:7pt Helvetica,Arial,sans-serif;color:#8a867e;'
        'padding:0 18mm;display:flex;justify-content:space-between">'
        "<span>Transkript · Management im KMU · Sitzung 26.10.2026</span>"
        '<span>Seite <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
    )
    drucken = """
const { chromium } = require("playwright");
const [quelle, ziel, fuss] = JSON.parse(process.argv[1]);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(quelle);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: ziel, format: "A4", printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: fuss,
    outline: true, tagged: true });
  await browser.close();
})();
"""
    knoten = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    argumente = [(ORDNER / "transkript.html").as_uri(), str(ORDNER / "transkript.pdf"), fuss]
    subprocess.run(
        ["node", "-e", drucken, json.dumps(argumente)],
        check=True,
        env={**os.environ, "NODE_PATH": knoten},
    )
    (ORDNER / "transkript.html").unlink()
    print("geschrieben:", ORDNER / "transkript.pdf")


if __name__ == "__main__":
    main()
