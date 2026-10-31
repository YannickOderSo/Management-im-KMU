#!/usr/bin/env python3
"""icons-erzeugen.py – Phosphor-Duotone-Icons als <symbol> in index.html schreiben

Die Icons stammen aus dem npm-Paket @phosphor-icons/core 2.1.1 (MIT-Lizenz,
bilder/LIZENZ-phosphor-icons-MIT.txt). Das Skript liest die gewählten SVGs und
schreibt sie zwischen <!--PHOSPHOR--> und <!--/PHOSPHOR--> in index.html, damit
die Präsentation offline läuft und keine Datei nachladen muss.

Aufbau eines Symbols: <symbol id="ph-name" viewBox="0 0 256 256">
  <path class="ph-d" …/>   Zweitebene (im Original opacity 0.2) → CSS färbt sie
                            mit --duo / --duo-o (z. B. Klassenfarbe)
  <path …/>                 Hauptform, Füllung currentColor

Aufruf (aus dem Ordner praesentation/):
  npm pack @phosphor-icons/core@2.1.1 && tar -xzf phosphor-icons-core-2.1.1.tgz -C /tmp/phosphor
  python3 werkzeuge/icons-erzeugen.py /tmp/phosphor/package/assets/duotone
"""
import re
import sys
from pathlib import Path

ICONS = [
    # Verbote (Folie 12)
    'magnet', 'hand-grabbing', 'ranking', 'detective', 'user-focus', 'smiley-sad', 'fingerprint',
    'security-camera', 'image-broken', 'shield-warning',
    # Quiz, Rollen, Aufsicht, Pflichten (Folien 07, 08, 10, 16)
    'table', 'chat-teardrop-dots', 'envelope-simple', 'sparkle', 'code', 'truck', 'users-three', 'user',
    'shield-check', 'bank', 'factory', 'buildings', 'gavel', 'check-circle',
    # Türen, Transparenz, GPAI, Daumen-Runde (Folien 13, 14, 17, 19)
    'door-open', 'image-square', 'smiley-wink', 'user-square', 'chat-centered-text', 'briefcase', 'app-window',
    'brain', 'student', 'video-camera',
    # Schritte, Hilfe, Rollen im Betrieb, Kernbotschaft (Folien 30, 32, 34, 35)
    'list-magnifying-glass', 'user-switch', 'list-checks', 'arrows-clockwise', 'file-text', 'flask', 'lifebuoy',
    'clipboard-text', 'lock-key', 'users', 'camera',
]


def symbol(name, quelle):
    svg = (quelle / f'{name}-duotone.svg').read_text(encoding='utf-8')
    pfade = re.findall(r'<path ([^>]*?)/>', svg)
    if not pfade:
        raise SystemExit(f'keine Pfade in {name}')
    teile = []
    for attr in pfade:
        d = re.search(r'd="([^"]+)"', attr).group(1)
        if 'opacity="0.2"' in attr:
            teile.append(f'<path class="ph-d" d="{d}"/>')
        else:
            teile.append(f'<path d="{d}"/>')
    return f'    <symbol id="ph-{name}" viewBox="0 0 256 256">{"".join(teile)}</symbol>'


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    quelle = Path(sys.argv[1])
    ziel = Path(__file__).resolve().parent.parent / 'index.html'
    html = ziel.read_text(encoding='utf-8')
    block = ('<!--PHOSPHOR-->\n    <!-- Phosphor Icons Duotone 2.1.1 (MIT), erzeugt mit werkzeuge/icons-erzeugen.py -->\n'
             + '\n'.join(symbol(n, quelle) for n in ICONS) + '\n    <!--/PHOSPHOR-->')
    if '<!--PHOSPHOR-->' in html:
        html = re.sub(r'<!--PHOSPHOR-->.*?<!--/PHOSPHOR-->', lambda m: block, html, flags=re.S)
    else:
        html = html.replace('    <!-- Klassenformen', '    ' + block + '\n    <!-- Klassenformen', 1)
    ziel.write_text(html, encoding='utf-8')
    print(f'{len(ICONS)} Icons in {ziel.name} geschrieben')


if __name__ == '__main__':
    main()
