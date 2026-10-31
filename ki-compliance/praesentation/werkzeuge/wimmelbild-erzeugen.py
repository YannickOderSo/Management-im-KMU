#!/usr/bin/env python3
"""wimmelbild-erzeugen.py – der Betrieb (Muster Metallbau GmbH) als isometrische Illustration

Beschreibt die Szene als Quader in Weltkoordinaten (x nach rechts vorn, y nach links
vorn, z nach oben), projiziert sie isometrisch (30°) und schreibt
  • das Symbol <symbol id="wimmel-bau" viewBox="0 0 900 600"> zwischen <!--WIMMEL-->
    und <!--/WIMMEL--> in index.html,
  • die Bildpunkte der sechs Stellen in js/folien/ki.js (var PUNKTE = {...}).
Flächen: oben hell (.wi-oben), links mittel (.wi-links), rechts dunkler (.wi-rechts);
Farben kommen aus den Tokens (hell/dunkel), Strich = Tinte.

Aufruf (aus dem Ordner praesentation/):  python3 werkzeuge/wimmelbild-erzeugen.py
"""
import math
import re
from pathlib import Path

C, S = math.cos(math.radians(30)), 0.5


def proj(x, y, z):
    return ((x - y) * C, (x + y) * S - z)


elemente = []          # (art, daten)
punkte_welt = {}       # Stelle -> (x, y, z)


def quader(x0, x1, y0, y1, z0, z1, art='', oben=None):
    """sichtbare Flächen: oben (z1), links (y = y1), rechts (x = x1)"""
    elemente.append(('quader', (x0, x1, y0, y1, z0, z1, art, oben)))


def flaeche(punkte, klasse):
    elemente.append(('poly', (punkte, klasse)))


def linie(a, b, klasse='wi-gestrichelt'):
    elemente.append(('linie', (a, b, klasse)))


def person(x, y, z, headset=False):
    elemente.append(('person', (x, y, z, headset)))


def kreis(x, y, z, r, klasse):
    elemente.append(('kreis', (x, y, z, r, klasse)))


# ---------------------------------------------------------------- Szene
# Reihenfolge = Zeichenreihenfolge (hinten vor vorn). Zwei Dioramen: Büro und Werkhalle.

def stiel(x, y, z0, z1):
    linie((x, y, z0), (x, y, z1), 'wi-stiel')

# ---------- Büro (x 0–330, y 0–260)
quader(-10, 330, -10, 260, -14, 0, 'wi-platte')
quader(-10, 0, -10, 260, 0, 150)                     # Wand hinten links
quader(0, 330, -10, 0, 0, 150)                       # Wand hinten rechts
# Website (2): Browserfenster an der linken Wand (Ebene x = 0; großes y = links im Bild)
def fenster(yl, yr, z0, z1):
    P = lambda y, z: (0.5, y, z)
    def rechteck(ya, yb, za, zb, klasse):
        flaeche([P(ya, zb), P(yb, zb), P(yb, za), P(ya, za)], klasse)
    rechteck(yl, yr, z0, z1, 'wi-papier')
    rechteck(yl, yr, z1 - 14, z1, 'wi-leiste')
    for i in range(3):
        kreis(0.5, yl - 12 - i * 11, z1 - 7, 2.6, 'wi-punkt')
    rechteck(yl - 14, yl - 110, z1 - 38, z1 - 24, 'wi-blase')
    rechteck(yr + 120, yr + 14, z1 - 60, z1 - 46, 'wi-blase wi-blase--ich')
    rechteck(yl - 14, yl - 80, z1 - 78, z1 - 68, 'wi-blase')
fenster(232, 44, 50, 134)
punkte_welt[2] = (0, 30, 150)
# Aktenschrank an der hinteren Wand
quader(132, 176, 0, 26, 0, 92)
for z in (30, 60):
    linie((136, 26, z), (172, 26, z), 'wi-fuge')
# hintere Reihe: Vertrieb (1) und Personal (3)
quader(30, 120, 46, 92, 0, 34)                       # Tisch Vertrieb
quader(52, 98, 54, 58, 34, 66, 'wi-schirm')          # Laptop-Deckel
quader(52, 98, 58, 82, 34, 37, '', 'wi-papier')      # Laptop-Tastatur
stiel(75, 66, 70, 82)
punkte_welt[1] = (75, 66, 98)
quader(186, 296, 46, 92, 0, 34)                      # Tisch Personal
quader(200, 232, 54, 80, 34, 54, '', 'wi-papier')    # Bewerbungen
quader(204, 236, 58, 84, 54, 58, '', 'wi-papier')
quader(246, 278, 56, 82, 34, 44, '', 'wi-papier')
stiel(241, 69, 60, 82)
punkte_welt[3] = (241, 69, 98)
person(92, 118, 0)
person(241, 118, 0)
# vordere Reihe: Kundenservice (4)
for x in (36, 176):
    quader(x, x + 90, 168, 210, 0, 34)               # Tisch
    quader(x + 40, x + 50, 178, 184, 34, 40)         # Fuß
    quader(x + 24, x + 66, 174, 178, 40, 66, 'wi-schirm')
stiel(81, 176, 66, 86)
punkte_welt[4] = (81, 176, 102)
for x in (81, 221):
    person(x, 236, 0, headset=True)
# ---------- Werkhalle (x 380–740, y 0–260)
quader(370, 740, -10, 260, -14, 0, 'wi-platte wi-halle')
zacken = [(370, -10, 168)]
for i in range(5):
    x = 370 + i * 74
    zacken += [(x + 74, -10, 204), (x + 74, -10, 168)]
flaeche(zacken, 'wi-dach')
quader(370, 740, -10, 0, 0, 168)                     # Wand hinten rechts
for x in (430, 530, 630):
    flaeche([(x, 0.5, 146), (x + 64, 0.5, 146), (x + 64, 0.5, 100), (x, 0.5, 100)], 'wi-fenster')
    linie((x + 32, 0.5, 146), (x + 32, 0.5, 100), 'wi-fuge')
# Maschine (6) mit Lichtvorhang
quader(420, 524, 36, 112, 0, 118)
flaeche([(436, 112, 98), (508, 112, 98), (508, 112, 42), (436, 112, 42)], 'wi-fenster')
kreis(472, 112, 70, 15, 'wi-zahnrad')
flaeche([(524, 50, 100), (524, 76, 100), (524, 76, 80), (524, 50, 80)], 'wi-anzeige')
for x in (416, 524):
    quader(x, x + 6, 126, 132, 0, 96, 'wi-schirm')
for z in (24, 48, 72):
    linie((422, 129, z), (524, 129, z), 'wi-strahl')
stiel(472, 74, 118, 152)
punkte_welt[6] = (472, 74, 168)
person(472, 176, 0)
# Förderband mit Kamera-Portal (5)
quader(636, 644, 82, 90, 0, 124)                     # Pfosten hinten
quader(560, 730, 96, 146, 0, 30)
quader(556, 734, 94, 148, 30, 36, 'wi-band')
for x in (578, 678, 706):
    quader(x, x + 20, 110, 130, 36, 50, '', 'wi-papier')
quader(636, 644, 82, 160, 124, 132)                  # Querträger
quader(630, 650, 112, 130, 100, 124, 'wi-schirm')    # Kamera
linie((634, 130, 100), (618, 132, 36), 'wi-strahl')
linie((646, 130, 100), (664, 132, 36), 'wi-strahl')
quader(636, 644, 152, 160, 0, 124)                   # Pfosten vorn
stiel(640, 121, 132, 160)
punkte_welt[5] = (640, 121, 176)
# Palette mit Kisten
quader(640, 720, 196, 246, 0, 8)
quader(648, 680, 204, 236, 8, 36)
quader(684, 714, 206, 238, 8, 30)
quader(652, 678, 208, 232, 36, 56)


# ---------------------------------------------------------------- Ausgabe
def zeichnen():
    teile, alle = [], []

    def pts(liste):
        q = [proj(*p) for p in liste]
        alle.extend(q)
        return ' '.join(f'{x:.1f},{y:.1f}' for x, y in q)

    for art, d in elemente:
        if art == 'quader':
            x0, x1, y0, y1, z0, z1, extra, oben = d
            cls = (' ' + extra) if extra else ''
            teile.append(f'<polygon class="wi-oben{cls}{(" " + oben) if oben else ""}" points="{pts([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])}"/>')
            teile.append(f'<polygon class="wi-links{cls}" points="{pts([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)])}"/>')
            teile.append(f'<polygon class="wi-rechts{cls}" points="{pts([(x1, y0, z1), (x1, y1, z1), (x1, y1, z0), (x1, y0, z0)])}"/>')
        elif art == 'poly':
            punkte, klasse = d
            teile.append(f'<polygon class="{klasse}" points="{pts(punkte)}"/>')
        elif art == 'linie':
            a, b, klasse = d
            pa, pb = proj(*a), proj(*b)
            alle.extend([pa, pb])
            teile.append(f'<path class="{klasse}" d="M{pa[0]:.1f} {pa[1]:.1f}L{pb[0]:.1f} {pb[1]:.1f}"/>')
        elif art == 'kreis':
            x, y, z, r, klasse = d
            px, py = proj(x, y, z)
            alle.append((px, py))
            teile.append(f'<ellipse class="{klasse}" cx="{px:.1f}" cy="{py:.1f}" rx="{r:.1f}" ry="{r * 0.82:.1f}"/>')
        elif art == 'person':
            x, y, z, headset = d
            bx, by = proj(x, y, z)
            alle.extend([(bx - 14, by), (bx + 14, by - 58)])
            teile.append(f'<path class="wi-person" d="M{bx - 13:.1f} {by:.1f}V{by - 22:.1f}a13 13 0 0 1 26 0V{by:.1f}z"/>')
            teile.append(f'<circle class="wi-person" cx="{bx:.1f}" cy="{by - 44:.1f}" r="9.5"/>')
            if headset:
                teile.append(f'<path class="wi-headset" d="M{bx - 11:.1f} {by - 44:.1f}a11 11 0 0 1 22 0M{bx + 11:.1f} {by - 42:.1f}c0 6-4 8-9 8"/>')
    return teile, alle


teile, alle = zeichnen()
minx, maxx = min(p[0] for p in alle), max(p[0] for p in alle)
miny, maxy = min(p[1] for p in alle), max(p[1] for p in alle)
B, H, RAND = 900, 600, 16
massstab = min((B - 2 * RAND) / (maxx - minx), (H - 2 * RAND) / (maxy - miny))
dx = (B - (maxx - minx) * massstab) / 2 - minx * massstab
dy = (H - (maxy - miny) * massstab) / 2 - miny * massstab
inhalt = '\n        '.join(teile)
symbol = (f'<!--WIMMEL-->\n    <!-- Der Betrieb, isometrisch (erzeugt mit werkzeuge/wimmelbild-erzeugen.py) -->\n'
          f'    <symbol id="wimmel-bau" viewBox="0 0 900 600">\n'
          f'      <g transform="matrix({massstab:.4f} 0 0 {massstab:.4f} {dx:.2f} {dy:.2f})">\n        {inhalt}\n      </g>\n'
          f'    </symbol>\n    <!--/WIMMEL-->')

punkte = {}
for nr, (x, y, z) in sorted(punkte_welt.items()):
    px, py = proj(x, y, z)
    punkte[nr] = (round(px * massstab + dx), round(py * massstab + dy))

ordner = Path(__file__).resolve().parent.parent
html_pfad = ordner / 'index.html'
html = html_pfad.read_text(encoding='utf-8')
if '<!--WIMMEL-->' in html:
    html = re.sub(r'<!--WIMMEL-->.*?<!--/WIMMEL-->', lambda m: symbol, html, flags=re.S)
else:
    html = re.sub(r'    <!-- Der Betrieb \(Wimmelbild.*?</symbol>', lambda m: '    ' + symbol, html, count=1, flags=re.S)
html_pfad.write_text(html, encoding='utf-8')

js_pfad = ordner / 'js' / 'folien' / 'ki.js'
js = js_pfad.read_text(encoding='utf-8')
neu = 'var PUNKTE = {\n    ' + ', '.join(f'{k}: [{v[0]}, {v[1]}]' for k, v in punkte.items()) + '\n  };'
js, n = re.subn(r'var PUNKTE = \{.*?\};', neu, js, count=1, flags=re.S)
if n != 1:
    raise SystemExit('PUNKTE in ki.js nicht gefunden')
js_pfad.write_text(js, encoding='utf-8')
print(f'Wimmelbild: {len(teile)} Formen, Maßstab {massstab:.3f}; Stellen: {punkte}')
