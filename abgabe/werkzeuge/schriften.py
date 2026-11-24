"""Erzeugt statische TrueType-Schnitte der Inter aus den variablen woff2-Dateien des Repos.

Chromium bettet variable Schriften nur als Type-3-Schrift in PDFs ein; mit statischen
TrueType-Schnitten bleibt der Text in Deckblatt, Inhaltsverzeichnis und Zwischenblättern
eine echte, eingebettete Schrift. PyMuPDF braucht für Kopf- und Fußzeile ebenfalls TTF.
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# (Familienname, opsz, Gewichte)
SCHNITTE = [("InterText", 14, (400, 500, 600, 700)), ("InterDisplay", 32, (500, 600, 700))]
TEILE = ("latin", "latin-ext")


def erzeugen(quelle: Path, ziel: Path) -> dict:
    """Schreibt die Schnitte nach `ziel` und gibt {(familie, gewicht, teil): pfad} zurück."""
    ziel.mkdir(parents=True, exist_ok=True)
    ergebnis = {}
    for teil in TEILE:
        datei = quelle / f"inter-{teil}-opsz-normal.woff2"
        for familie, opsz, gewichte in SCHNITTE:
            for gewicht in gewichte:
                aus = ziel / f"{familie}-{gewicht}-{teil}.ttf"
                if not aus.exists():
                    schrift = TTFont(datei)
                    instancer.instantiateVariableFont(schrift, {"wght": gewicht, "opsz": opsz}, inplace=True)
                    schrift.flavor = None
                    schrift.save(aus)
                ergebnis[(familie, gewicht, teil)] = aus
    return ergebnis


def css(schnitte: dict, basis_url: str) -> str:
    """@font-face-Regeln für die erzeugten Schnitte; `basis_url` endet mit '/'."""
    bereiche = {
        "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, "
                 "U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
        "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, "
                     "U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, "
                     "U+2C60-2C7F, U+A720-A7FF",
    }
    regeln = []
    for (familie, gewicht, teil), pfad in sorted(schnitte.items()):
        regeln.append(
            f'@font-face{{font-family:"{familie}";font-style:normal;font-weight:{gewicht};'
            f'src:url("{basis_url}{pfad.name}") format("truetype");unicode-range:{bereiche[teil]};}}'
        )
    return "\n".join(regeln)


if __name__ == "__main__":
    import sys
    wurzel = Path(__file__).resolve().parents[2]
    s = erzeugen(wurzel / "fuehrung/praesentation/schriften", Path(sys.argv[1]) if len(sys.argv) > 1 else wurzel / "abgabe/_cache/schriften")
    for k, v in sorted(s.items()):
        print(k, v.name, v.stat().st_size)
