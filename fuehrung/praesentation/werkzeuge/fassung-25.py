#!/usr/bin/env python3
"""Erzeugt index-25.html: die 25-Minuten-Fassung der Präsentation aus index.html (35 Minuten).

- Folien 13 (Delegation), 17 (Gründergeist und Tradition) und 19 (Pflegedienst) wandern als B7 bis B9 in den Backup.
- Folie 14 ohne die drei Betriebe; Sprechtexte auf 03, 05, 07, 09, 10, 11, 14, 15, 18, 20 gekürzt.
- Foliennummern fortlaufend über data-nummer (die IDs bleiben, weil js/folien/fuehrung.js daran hängt).
- Sollzeiten aus der Wortzahl neu verteilt, zusammen 25:00; marke.js-Dauer auf 25 Minuten.
Aufruf im Ordner praesentation/:  python3 werkzeuge/fassung-25.py
Danach prüfen:  node werkzeuge/pruefen.mjs index-25.html --ausgabe _test/pruefung-25 --schritte --druck export/praesentation-25-notfall.pdf
"""
import html as htmlmod
import pathlib
import re

ORDNER = pathlib.Path(__file__).resolve().parents[1]
s = (ORDNER / 'index.html').read_text(encoding='utf-8')
fehler = []


def ersetze(alt, neu, n=1):
    global s
    if s.count(alt) != n:
        fehler.append(('ersetze', s.count(alt), alt[:70]))
        return
    s = s.replace(alt, neu)


def abschnitt(sid):
    m = re.search(r'\n<!-- [^\n]*-->\n(?=<section class="folie[^"]*" id="%s")|(?=<section class="folie[^"]*" id="%s")' % (sid, sid), s)
    start = m.start() if m else -1
    ende = s.find('</section>', start) + len('</section>')
    return start, ende


def notiz(sid, schritt, text):
    """Ersetzt den Sprechtext-Absatz p[data-schritt] einer Folie (None = Absatz entfernen)."""
    global s
    m = re.search(r'(<section class="folie[^"]*" id="%s".*?<aside class="notizen">)(.*?)(</aside>)' % sid, s, re.S)
    aside = m.group(2)
    pat = r'\n?\s*<p data-schritt="%d">.*?</p>' % schritt
    if len(re.findall(pat, aside, re.S)) != 1:
        fehler.append(('notiz', sid, schritt))
        return
    neu = '' if text is None else '\n    <p data-schritt="%d">%s</p>' % (schritt, text)
    aside = re.sub(pat, lambda _: neu, aside, count=1, flags=re.S)
    s = s[:m.start(2)] + aside + s[m.end(2):]


# ---- 1. Sprechtexte kürzen -------------------------------------------------
notiz('f03', 0, '„Führung ist ein Alltagswort. Jeder hat eine Vorstellung davon, aber eine einheitliche Definition gibt es nicht. Ich habe Ihnen drei mitgebracht. Die erste sagt: Führung ist die durch Interaktion vermittelte Ausrichtung des Handelns auf vorgegebene Ziele. Die beiden anderen sprechen von zielgerichtetem Einflusshandeln in Organisationen und von unmittelbarer, absichtlicher und zielbezogener Einflussnahme durch Vorgesetzte. Legt man die drei nebeneinander, fällt auf: Sie teilen vier Bausteine.“')
notiz('f05', 0, '„Führung ist aber nicht dasselbe wie Management. Man kann zwei Ebenen unterscheiden: die Unternehmensführung, also das Management mit Zielen, Planung, Organisation und Kontrolle, und die Mitarbeiterführung, also den Umgang mit den einzelnen Menschen. Für das KMU kommt eine dritte Rolle hinzu: das Eigentum. Im Konzern sind die drei Rollen getrennt. Den Aktionären gehört das Unternehmen, der Vorstand leitet es, und die Teamleitungen führen die Menschen.“')
notiz('f05', 1, '„Im Mittelstand schieben sich die Rollen übereinander. Genau daran erkennt man den Mittelstand: Eigentum und Leitung liegen in einer Hand. Höchstens zwei Personen oder ihre Familien halten mindestens die Hälfte der Anteile und sitzen selbst in der Geschäftsführung. Das ist der Schlüssel für alles, was jetzt kommt.“')
notiz('f07', 0, '„So sieht Führung im Lehrbuch oft aus: ein Organigramm mit vielen Ebenen.“')
notiz('f09', 0, '„Führungsstile kann man auf einer Linie ordnen, je nachdem, wer entscheidet: links die Führungskraft allein, rechts das Team. Für den Mittelstand besonders spannend ist die Stufe patriarchalisch: Der Chef entscheidet allein, sorgt aber für seine Leute und erwartet dafür Loyalität. Das Modell ist vereinfacht, eine Landkarte, keine Wahrheit.“')
notiz('f09', 2, '„Es gibt aber auch das Gegenbild: Wo das Team die nötigen Kompetenzen hat, führen manche Inhaber eher kooperativ. Gerade die überschaubare Größe macht das möglich.“')
notiz('f10', 0, '„Wie führt man konkret? Dafür gibt es Werkzeuge. Ich greife fünf heraus. Erstens das Mitarbeitergespräch, regelmäßig oder bei Bedarf. Zweitens die Zielvereinbarung, bekannt als Management by Objectives. Die moderne Variante heißt OKR, mit Zielen für jedes Quartal; im KMU ist das nach Einschätzung von Fachleuten noch selten. Drittens die Delegation: Aufgaben samt Verantwortung abgeben. Der Gründer von SimpleAct schreibt selbst, er würde ‚am liebsten alles selbst machen‘. Viertens Feedback, einer der stärksten Hebel, um Ziele zu erreichen. Und fünftens Führungsgrundsätze, oft als Leitbild: gemeinsame Regeln dafür, wie man zusammenarbeitet.“')
notiz('f10', 1, '„In Großunternehmen ist für die Personalarbeit meist eine Personalabteilung zuständig. Im KMU ist die spannende Frage: Wer setzt diese Werkzeuge ein, und hat er oder sie dafür überhaupt Zeit? Das schauen wir uns jetzt an.“')
notiz('f11', 0, '„Wer kümmert sich um Personal? 2020 lag in 91 Prozent der Unternehmen mit weniger als 50 Beschäftigten die Personalarbeit bei der Geschäftsführung, nur in 7,2 Prozent bei einer eigenen Personalabteilung. Ab 250 Beschäftigten ist es umgekehrt: In drei Vierteln kümmert sich die Personalabteilung. Im kleinen Betrieb ist Personal also Chefsache.“')
notiz('f11', 2, '„Das zeigt sich auch bei der Entwicklung von Führungskräften: Nur 15 Prozent der Unternehmen mit bis zu 49 Beschäftigten setzen auf Führungsschulungen, um den Zusammenhalt zu stärken. Bei Großunternehmen ab 500 Beschäftigten sind es 64 Prozent.“')
for schritt in (1, 2, 3):
    notiz('f14', schritt, None)
ersetze('<p data-schritt="4">„Aber Vorsicht vor Romantik.', '<p data-schritt="1">„Aber Vorsicht vor Romantik.')
notiz('f15', 0, '„Genug Zahlen, jetzt wird es persönlich. Ich habe zwei Führungskräfte mit demselben Fragebogen schriftlich befragt. Kamill Jarzebowski hat im Mai 2026 SimpleAct gegründet, ein Software-Unternehmen für Compliance nach dem EU AI Act und der DSGVO, vier Personen, inhabergeführt. Jörg Heisler leitet bei TLT-Turbo in Zweibrücken das Vertrags- und Lizenzmanagement. TLT baut Industrieventilatoren, hat rund 300 Beschäftigte weltweit und gehört zu einem chinesischen Konzern. Streng genommen also kein KMU, und genau das macht den Vergleich interessant.“')
notiz('f15', 3, '„Gemeinsam ist beiden der Rat an neue Führungskräfte, fast wortgleich: Sag klar, was du erwartest, und frag nach. Und beide setzen auf Ergebnisse statt auf Anwesenheit. Kamill Jarzebowski: ‚Ich vertraue auf Ergebnisse statt auf Anwesenheit‘; Jörg Heisler beschreibt den Weg ‚weg von der klassischen Präsenzkontrolle hin zu ergebnisorientiertem Vertrauen‘, in der Produktion bleibt bei ihm aber die Führung vor Ort wichtig. Und beide bauen um, nur in entgegengesetzter Richtung: SimpleAct führt schon jetzt feste Regeln ein, etwa CRM und Code-Review, bevor das Wachstum sie erzwingt. TLT mit seiner fast 150-jährigen Ingenieurstradition bricht dagegen starre Wege auf, damit Teams schnell Probleme lösen können. Zwei Geschichten zeigen, wie das im Alltag aussieht.“')
notiz('f18', 1, '„Erstens Bindung: 77 Prozent der Beschäftigten in Deutschland haben nur eine geringe emotionale Bindung an ihren Arbeitgeber. Der Leiter der Studie bringt es auf den Punkt: ‚Das ist weniger ein Einstellungs- als vielmehr ein Führungsproblem.‘“')
notiz('f18', 2, '„Zweitens Fachkräfte: 92 Prozent der Mittelständler mit 20 bis 999 Beschäftigten erwarten negative Folgen des Fachkräftemangels. Wer Leute halten will, muss gut führen.“')
notiz('f18', 3, '„Drittens Nachfolge: 569.000 Inhaberinnen und Inhaber streben bis Ende 2029 nach ihrem Rückzug keine Fortführung ihres Unternehmens an, oft wegen des Rentenalters oder weil in der Familie das Interesse fehlt. Wenn Führung an einer Person hängt, hängt auch das Unternehmen an ihr.“')
notiz('f18', 4, '„Und viertens KI: Von den Beschäftigten in Unternehmen, die KI nutzen, stimmen nur 21 Prozent voll zu, dass ihre Führungskraft den Einsatz aktiv unterstützt. Neue Technik braucht jemanden, der sie vorlebt.“')
ersetze('Die Fälle zeigen, dass das geht: eine Teamleitung beim veloCenter, ein Leitfaden beim Pflegedienst, und bei SimpleAct die Lehre, Qualität über eine gemeinsame Checkliste zu sichern.',
        'Erste Ansätze zeigt auch meine Befragung: Bei SimpleAct soll künftig eine gemeinsame Checkliste die Qualität sichern, statt dass der Gründer sie im Nachhinein einfordern muss.')
ersetze('Belege Erweiterung: Befragung Frage 12 (Ausfalltest), P-06, P-01, Befragung Frage 10 (Checkliste).', 'Belege Erweiterung: Befragung Frage 12 (Ausfalltest), Frage 10 (Checkliste als Lehre).')
# Namen beim ersten Auftreten einordnen (die Ankündigung aus Folie 05 ist gekürzt)
ersetze('Kamill Jarzebowski von SimpleAct beschreibt es so:', 'Kamill Jarzebowski, Gründer von SimpleAct und einer meiner zwei Befragten, sagt:')
ersetze('Jörg Heisler bringt den Unterschied auf den Punkt:', 'Mein zweiter Befragter, Jörg Heisler von TLT, bringt es auf den Punkt:')
# Kürzungen für 25 Minuten
ersetze('und erwirtschafteten 41,3 Prozent der Wertschöpfung. Und Ende 2024', 'und Ende 2024')
ersetze(' In 62 Prozent der kleinen Firmen werden Fehler offen angesprochen, in 28 Prozent der großen.', '')
ersetze(' Bei einem Compliance-Produkt ist genau das heikel, denn ein kleiner Fehler kann das Vertrauen ins ganze Produkt kosten.', '')
ersetze(' Wie Gespräch und Vereinbarung zusammenkommen, zeige ich Ihnen später an einem Beispiel aus meiner Befragung.', '')
# Fahrplan ohne Fälle
ersetze('<span class="f-weg-text">Befragung, Zahlen, Fälle</span>', '<span class="f-weg-text">Befragung und Zahlen</span>')
ersetze('und ich habe Zahlen und Geschichten aus echten Betrieben mitgebracht.', 'und ich habe Zahlen zu den großen Herausforderungen mitgebracht.')
# Brücke zu den Herausforderungen (stand auf Folie 17); Backup-Texte für den Sprung aus der Fragerunde
ersetze('Und beide nennen dieselben Treiber: KI und Jüngere, die Sinn und Freiraum erwarten. Das zeigt sich auch in den Zahlen.“', 'Und beide nennen dieselben Treiber: KI und Jüngere, die Sinn und Freiraum erwarten.“')
ersetze('Nur kommen sie hier aus echten Situationen.“', 'Nur kommen sie hier aus echten Situationen. Und beide nennen dieselben Treiber des Wandels: KI und Jüngere, die Sinn und Freiraum erwarten. Das zeigt sich auch in den Zahlen.“')
ersetze('„Wie das im wachsenden Betrieb konkret aussieht, zeigt der ambulante Pflegedienst Jahnke in Niedersachsen, ein Familienunternehmen.', '„Ein Beispiel für einen wachsenden Betrieb ist der ambulante Pflegedienst Jahnke in Niedersachsen, ein Familienunternehmen.')
# Notizen, die auf Gestrichenes verweisen
ersetze('Belege Erweiterung: B-07, B-12; Befragung Frage 6 (Managen/Führen) und Fragen 1–3 (Aufgaben des Gründers), auswertung.md.', 'Belege Erweiterung: B-07, B-12.')
ersetze('Belege: I-06, C-01–C-05, P-02–P-04 (Dossier).', 'Belege: I-06, C-01–C-05 (Dossier).')
ersetze('; Befragung Frage 13/14 (Heisler: „Wissensverteiler“ → Coach; Bindung der Jüngeren).', '.')
s = re.sub(r'\n\s*<p>Begriff: (Scrum|Kick-off):[^<]*</p>', '', s)

# ---- 2. Folie 14 ohne die drei Betriebe -------------------------------------
m = re.search(r'\n\s*<div class="f-beteil-faelle">.*?\n    </div>', s, re.S)
if m and 'Malerbetrieb Eck' in m.group(0) and m.group(0).count('<article') == 3:
    s = s[:m.start()] + s[m.end():]
else:
    fehler.append('f14 Fälle nicht gefunden')
ersetze('<p class="f-beteil-aber" data-schritt="4"', '<p class="f-beteil-aber" data-schritt="1"')
ersetze(' · [37][39][61] INQA</p>', '</p>')
# ohne die Fallkarten: Vergleiche und „Aber“ senkrecht verteilen, Zahlen etwas größer
ersetze('</head>', '<style>/* 25-Minuten-Fassung: Folie 14 ohne Fallkarten */\n#f14 .folie-inhalt { display: flex; flex-direction: column; justify-content: center; gap: 72px; }\n#f14 .f-vergleich-zahlen b { font-size: 1.25em; }\n#f14 .f-beteil-aber { font-size: 1.15em; padding-block: 28px; }\n</style>\n</head>')

# ---- 3. Folien 13, 17, 19 als Backup B7 bis B9 ans Ende ---------------------
ans_ende = []
for sid, nr in (('f13', 'B7'), ('f17', 'B8'), ('f19', 'B9')):
    a, e = abschnitt(sid)
    teil = s[a:e]
    s = s[:a] + s[e:]
    teil = re.sub(r'(<section class="folie[^"]*" id="%s")' % sid, r'\1 data-backup data-nummer="%s"' % nr, teil, count=1)
    teil = re.sub(r'data-zeit="\d+"', 'data-zeit="0"', teil, count=1)
    teil = re.sub(r'data-titel="([^"]*)"', r'data-titel="Backup: \1"', teil, count=1)
    ans_ende.append('\n\n<!-- In der 25-Minuten-Fassung im Backup (%s) -->\n' % nr + teil.strip())
a, e = abschnitt('b6')
s = s[:e] + ''.join(ans_ende) + s[e:]

# ---- 4. Fortlaufende Nummern, Hinweise, Dauer ---------------------------------
haupt = [m.group(1) for m in re.finditer(r'<section class="folie[^"]*" id="(f\d+)"(?![^>]*data-backup)', s)]
for i, sid in enumerate(haupt, 1):
    s = re.sub(r'(<section class="folie[^"]*" id="%s")' % sid, r'\1 data-nummer="%02d"' % i, s, count=1)
nummer = {sid: '%02d' % i for i, sid in enumerate(haupt, 1)}
ersetze('Gallup weist keine Werte nach Größe aus (Folie 18, Fußzeile).', 'Gallup weist keine Werte nach Größe aus (Folie %s, Fußzeile).' % nummer['f18'])
ersetze('(inhabergeführt, 4 Personen, Folie 15).', '(inhabergeführt, 4 Personen, Folie %s).' % nummer['f15'])
ersetze('Rückfrage „Woher stammt Zahl X?“ zu den Folien 10–14 und 18.', 'Rückfrage „Woher stammt Zahl X?“ zu den Folien %s–%s, %s und B7; INQA-Fälle [37][39][59][60][61] nur im Backup B6 bis B9.' % (nummer['f10'], nummer['f14'], nummer['f18']))
ersetze('B6 Sechs Betriebe (INQA).', 'B6 Sechs Betriebe (INQA), B7 Delegation, B8 Gründergeist und Tradition, B9 Pflegedienst Jahnke.')
ersetze('<title>Führung im KMU</title>', '<title>Führung im KMU (25 Minuten)</title>')
ersetze('<script src="marke.js"></script>', '<script src="marke.js"></script>\n<script>window.MARKE.dauerMinuten = 25;   /* 25-Minuten-Fassung, erzeugt von werkzeuge/fassung-25.py */</script>')
s = s.replace('<!doctype html>', '<!doctype html>\n<!-- 25-Minuten-Fassung: NICHT von Hand ändern, sondern index.html ändern und werkzeuge/fassung-25.py ausführen. -->', 1)

# ---- 5. Sollzeiten aus der Wortzahl, zusammen 25:00 ---------------------------
ZUSATZ = {'f01': 15, 'f08': 45, 'f09': 15, 'f15': 5, 'f21': 10}
sek = {}
for m in re.finditer(r'<section class="folie[^"]*" id="(f\d+)"(?![^>]*data-backup)(.*?)</section>', s, re.S):
    sid, body = m.groups()
    notizen = re.search(r'<aside class="notizen">(.*?)</aside>', body, re.S).group(1)
    w = 0
    for attr, t in re.findall(r'<p([^>]*)>(.*?)</p>', notizen, re.S):
        if 'data-schritt' in attr or 'gesprochen' in attr:
            txt = htmlmod.unescape(re.sub('<[^>]+>', '', t))
            w += len(' '.join(re.findall(r'„(.*?)“(?=\s|$|[A-ZÄÖÜ(])', txt, re.S)).split())
    sek[sid] = w / 2 + ZUSATZ.get(sid, 0)
faktor = 1500 / sum(sek.values())
zeit = {k: int(round(v * faktor / 5) * 5) for k, v in sek.items()}
zeit['f09'] += 1500 - sum(zeit.values())
for k, v in zeit.items():
    s = re.sub(r'(<section class="folie[^"]*" id="%s"[^>]*data-zeit=")\d+(")' % k, r'\g<1>%d\g<2>' % v, s, count=1)

(ORDNER / 'index-25.html').write_text(s, encoding='utf-8')
print('index-25.html:', len(haupt), 'Folien,', sum(zeit.values()), 's, Faktor', round(faktor, 3))
print('Zeiten:', zeit)
print('Fehler:', fehler or 'keine')
if fehler:
    raise SystemExit(1)
