"""Erzeugt praesentation/export/redeskript.pdf aus den Sprechtexten in praesentation/index.html.

Je Folie: Nummer, Titel, Sollzeit, Startzeit, der Sprechtext mit Klick-Markierungen zwischen den
Schritten und die Hintergrundnotizen (nicht vortragen). Nach jeder Änderung am Sprechtext neu erzeugen.

Aufruf aus dem Repo-Wurzelordner:
    python3 recap/2026-10-26-prozessmanagement-und-ki/redeskript-erzeugen.py

Schriften kommen lokal aus praesentation/schriften/ (Fraunces, Libre Franklin).
"""
import html
import json
import os
import re
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup

ORDNER = Path(__file__).resolve().parent
FOLIEN = ORDNER / "praesentation" / "index.html"
ZIEL = ORDNER / "praesentation" / "export" / "redeskript.pdf"
SCHRIFTEN = (ORDNER / "praesentation" / "schriften").as_uri()
WOERTER_PRO_MINUTE = 130

BLOCK_NAMEN = {
    "1": "Prozesse im Unternehmen · Maximilian Büchele",
    "2": "KI im KMU · Elbrus Tschekuev",
    "3": "KI-Begriffe · Klaus Knopper (Video und KI-Führerschein)",
    "4": "Führung bei der Bundeswehr · Gastvortrag",
}


def mmss(sekunden: int) -> str:
    return f"{sekunden // 60}:{sekunden % 60:02d}"


def ohne_aussenzeichen(text: str) -> str:
    """Sprechtext steht in „…“ – für das Ablesen ohne die äußeren Anführungszeichen."""
    text = " ".join(text.split())
    if text.startswith("„") and text.endswith("“"):
        text = text[1:-1]
    return text


def nummer_von(folie) -> str:
    if folie.has_attr("data-nummer"):
        return folie["data-nummer"]
    m = re.fullmatch(r"[a-z](\d+)", folie["id"])
    return m.group(1).zfill(2) if folie["id"].startswith("f") else folie["id"].upper()


def folien_lesen():
    soup = BeautifulSoup(FOLIEN.read_text(encoding="utf-8"), "html.parser")
    folien = []
    for f in soup.select("section.folie"):
        titel_el = f.select_one(".titel")
        titel = " ".join(titel_el.get_text(" ").split()) if titel_el else f.get("data-titel", "")
        notizen = f.select_one("aside.notizen")
        gesprochen, hinweise = [], []
        if notizen:
            for p in notizen.find_all("p", recursive=False):
                text = " ".join(p.get_text(" ").split())
                if "gesprochen" in (p.get("class") or []):
                    gesprochen.append((int(p.get("data-schritt", 0)), ohne_aussenzeichen(text)))
                else:
                    hinweise.append(text)
        folien.append({
            "id": f["id"],
            "nummer": nummer_von(f),
            "kurz": f.get("data-titel", ""),
            "titel": titel,
            "zeit": int(f.get("data-zeit", 0)),
            "block": f.get("data-block"),
            "backup": f["id"].startswith("b"),
            "gesprochen": gesprochen,
            "hinweise": hinweise,
        })
    return folien


def seite_bauen(folien):
    start = 0
    for f in folien:
        f["start"] = start
        start += f["zeit"]
        f["woerter"] = sum(len(t.split()) for _, t in f["gesprochen"])
    gesamt = start

    zeilen = []
    for f in folien:
        if f["backup"]:
            continue
        zeilen.append(
            f'<tr{" class=trenner" if f["block"] else ""}><td>{f["nummer"]}</td><td>{html.escape(f["kurz"])}</td>'
            f'<td>{f["zeit"]} s</td><td>{mmss(f["start"])}</td></tr>'
        )

    teile = []
    for f in folien:
        if f["backup"]:
            continue
        if f["block"]:
            teile.append(
                f'<div class="block"><span>Block {f["block"]}</span>{html.escape(BLOCK_NAMEN[f["block"]])}'
                f'<em>Sprecher: ______________</em></div>'
            )
        absaetze = []
        letzter = 0
        for schritt, text in f["gesprochen"]:
            if schritt > letzter:
                absaetze.append(f'<p class="klick">▸ Klick{" (Schritt " + str(schritt) + ")" if schritt > 1 else ""}</p>')
                letzter = schritt
            absaetze.append(f"<p class=rede>{html.escape(text)}</p>")
        hinweise = "".join(f"<p>{html.escape(h)}</p>" for h in f["hinweise"])
        geschaetzt = round(f["woerter"] / WOERTER_PRO_MINUTE * 60)
        teile.append(f"""
<section class="folie{' folie--trenner' if f['block'] else ''}">
  <header>
    <span class="nr">{f['nummer']}</span>
    <h2>{html.escape(f['titel'] if not f['block'] else f['kurz'])}</h2>
    <span class="zeit">ab {mmss(f['start'])} · Soll {f['zeit']} s · {f['woerter']} Wörter ≈ {geschaetzt} s</span>
  </header>
  <div class="text">{''.join(absaetze)}</div>
  {f'<div class="hinweis"><b>Hintergrund, nicht vortragen</b>{hinweise}</div>' if hinweise else ''}
</section>""")

    return f"""<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Redeskript – Recap der Sitzung vom 26.10.2026</title>
<style>{CSS.replace("{S}", SCHRIFTEN)}</style></head><body>
<section class="deckblatt">
  <p class="kicker">Redeskript · Management im KMU</p>
  <h1>Recap der Sitzung<br>vom 26. Oktober</h1>
  <p class="unter">Prozesse, KI im KMU, KI-Begriffe und Führung bei der Bundeswehr</p>
  <dl class="meta">
    <div><dt>Vortragende</dt><dd>Elias Knauber<br>Yannick Heisler</dd></div>
    <div><dt>Dozentin</dt><dd>Prof. Dr. Christine Arend-Fuchs</dd></div>
    <div><dt>Dauer (Soll)</dt><dd>{mmss(gesamt)} Min.</dd></div>
  </dl>
  <div class="spalten">
    <div>
      <h3>Ablauf</h3>
      <table><thead><tr><th>Folie</th><th>Thema</th><th>Soll</th><th>ab</th></tr></thead><tbody>{''.join(zeilen)}</tbody></table>
    </div>
    <div>
      <h3>Bedienung</h3>
      <dl class="tasten">
        <div><dt>→ / Leertaste</dt><dd>weiter, auch Schritte in einer Folie</dd></div>
        <div><dt>←</dt><dd>zurück</dd></div>
        <div><dt>P</dt><dd>Referentenansicht mit Sprechtext und Uhr</dd></div>
        <div><dt>O</dt><dd>Übersicht aller Folien</dd></div>
        <div><dt>Ziffern + Enter</dt><dd>Sprung, z.&nbsp;B. 17 Enter</dd></div>
        <div><dt>B</dt><dd>Schwarzbild</dd></div>
      </dl>
      <h3>Lesehilfe</h3>
      <p class="lese"><span class="klick-muster">▸ Klick</span> heißt: an dieser Stelle weiterschalten, der nächste Schritt der Folie erscheint.
      Grau gesetzte Kästen sind Hintergrund für Rückfragen und werden nicht vorgetragen.
      Die Zeitschätzung rechnet mit {WOERTER_PRO_MINUTE} Wörtern pro Minute.</p>
      <p class="lese">Plan B: <b>export/recap-notfall.pdf</b> (eine Seite je Folie).</p>
    </div>
  </div>
</section>
<main>{''.join(teile)}</main>
</body></html>"""


CSS = """
@font-face { font-family: Fraunces; src: url("{S}/fraunces-latin-opsz-normal.woff2"); font-weight: 100 900; }
@font-face { font-family: Fraunces; src: url("{S}/fraunces-latin-ext-opsz-normal.woff2"); font-weight: 100 900; unicode-range: U+0100-024F; }
@font-face { font-family: Franklin; src: url("{S}/libre-franklin-latin-wght-normal.woff2"); font-weight: 100 900; }
@font-face { font-family: Franklin; src: url("{S}/libre-franklin-latin-ext-wght-normal.woff2"); font-weight: 100 900; unicode-range: U+0100-024F; }
@page { size: A4; margin: 16mm 18mm 18mm; }
:root { --tinte: #161B27; --schiefer: #586070; --nebel: #C9CDD3; --karmin: #C0132D; --kreide: #F2F3EF; }
* { box-sizing: border-box; }
body { margin: 0; font: 10pt/1.45 Franklin, sans-serif; color: var(--tinte); }
h1, h2, h3 { font-family: Fraunces, serif; font-weight: 450; margin: 0; }
.deckblatt { break-after: page; }
.kicker { margin: 0; font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; color: var(--schiefer); }
h1 { font-size: 34pt; line-height: 1.04; margin: 5mm 0 0; padding-bottom: 3mm; border-bottom: 1.6pt solid var(--karmin); }
.unter { margin: 3mm 0 6mm; font-size: 11pt; color: var(--schiefer); }
.meta { display: flex; gap: 8mm; margin: 0 0 8mm; }
.meta div { flex: 1; }
.meta dt { font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; color: var(--schiefer); }
.meta dd { margin: 1mm 0 0; font-size: 10.5pt; }
.spalten { display: grid; grid-template-columns: 1.25fr 1fr; gap: 9mm; }
h3 { font-size: 13pt; margin: 0 0 2.5mm; }
table { width: 100%; border-collapse: collapse; font-size: 8.6pt; }
th { text-align: left; font-weight: 600; color: var(--schiefer); border-bottom: .8pt solid var(--tinte); padding: 1mm 1.5mm 1mm 0; }
td { padding: 1mm 1.5mm 1mm 0; border-bottom: .5pt solid var(--nebel); font-variant-numeric: tabular-nums; }
td:nth-child(3), td:nth-child(4), th:nth-child(3), th:nth-child(4) { text-align: right; white-space: nowrap; }
tr.trenner td { color: var(--karmin); font-weight: 600; }
.tasten { margin: 0 0 6mm; font-size: 9pt; }
.tasten div { display: grid; grid-template-columns: 30mm 1fr; padding: 1mm 0; border-bottom: .5pt solid var(--nebel); }
.tasten dt { font-weight: 600; }
.tasten dd { margin: 0; color: var(--schiefer); }
.lese { margin: 0 0 2.5mm; font-size: 9pt; color: var(--schiefer); }
.klick-muster { color: var(--karmin); font-weight: 600; }

.block { break-before: page; display: flex; align-items: baseline; gap: 3mm; flex-wrap: wrap;
  margin: 0 0 4mm; padding-bottom: 2mm; border-bottom: 1.6pt solid var(--karmin);
  font-family: Fraunces, serif; font-size: 15pt; }
.block span { color: var(--karmin); }
.block em { margin-left: auto; font: 9pt Franklin, sans-serif; color: var(--schiefer); }
.folie { break-inside: avoid; margin: 0 0 6mm; padding-top: 3mm; border-top: .8pt solid var(--nebel); }
.folie header { display: grid; grid-template-columns: 13mm 1fr; column-gap: 3mm; align-items: baseline; }
.nr { grid-row: span 2; font-family: Fraunces, serif; font-size: 22pt; line-height: 1; color: var(--karmin); font-variant-numeric: lining-nums; }
.folie h2 { font-size: 13.5pt; line-height: 1.2; }
.zeit { font-size: 8pt; color: var(--schiefer); font-variant-numeric: tabular-nums; margin-top: .8mm; }
.text { margin: 2.5mm 0 0 16mm; }
.rede { margin: 0 0 2mm; font-size: 11.5pt; line-height: 1.55; hyphens: auto; }
.klick { margin: 1mm 0 1.5mm; font-size: 8.5pt; font-weight: 600; letter-spacing: .03em; color: var(--karmin); }
.hinweis { margin: 2mm 0 0 16mm; padding: 2mm 3mm; background: var(--kreide); font-size: 8.4pt; line-height: 1.4; color: var(--schiefer); }
.hinweis b { display: block; margin-bottom: .8mm; font-size: 7pt; letter-spacing: .06em; text-transform: uppercase; }
.hinweis p { margin: 0 0 1mm; }
.folie--trenner .rede { font-style: normal; }
"""


def main():
    seite = seite_bauen(folien_lesen())
    hilf = ZIEL.with_suffix(".html")
    hilf.write_text(seite, encoding="utf-8")
    fuss = (
        '<div style="width:100%;font:7pt Helvetica,Arial,sans-serif;color:#586070;'
        'padding:0 18mm;display:flex;justify-content:space-between">'
        "<span>Redeskript · Recap 26.10.2026 · Elias Knauber, Yannick Heisler</span>"
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
    subprocess.run(
        ["node", "-e", drucken, json.dumps([hilf.as_uri(), str(ZIEL), fuss])],
        check=True,
        env={**os.environ, "NODE_PATH": knoten},
    )
    hilf.unlink()
    print("geschrieben:", ZIEL)


if __name__ == "__main__":
    main()
