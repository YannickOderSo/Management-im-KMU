#!/usr/bin/env python3
"""Erzeugt werkzeuge/skript-locker-25.json: die locker formulierte Fassung des Sprechtexts für index-25.html.

Absätze, die in der 25-Minuten-Fassung gleich geblieben sind, kommen aus skript-locker.json (35 Minuten);
die in fassung-25.py gekürzten Absätze stehen unten neu. Zahlen gerundet, Zitate wörtlich, keine Gedankenstriche.
Aufruf im Ordner praesentation/:  python3 werkzeuge/locker-25.py
PDF:  SKRIPT_DECK=index-25.html SKRIPT_ZUSATZ=werkzeuge/skript-zusatz-25.json SKRIPT_TEXTE=werkzeuge/skript-locker-25.json node werkzeuge/praesentationsskript.mjs
"""
import json
import pathlib
import re

ORDNER = pathlib.Path(__file__).resolve().parents[1]
basis = json.loads((ORDNER / 'werkzeuge' / 'skript-locker.json').read_text(encoding='utf-8'))
T = dict(basis['texte'])

# Folie 14 hat in der Kurzfassung nur Start und „Aber“ (früher Klick 4)
T['f14/1'] = T['f14/4']
for k in ('f14/2', 'f14/3', 'f14/4'):
    del T[k]

T.update({
 'f03/0': '„Führung, das Wort benutzt jeder. Eine Definition, auf die sich alle einigen, gibt es aber nicht. Ich hab Ihnen drei mitgebracht. Die erste sagt: Führung heißt, das Handeln von Leuten auf vorgegebene Ziele auszurichten, und zwar über Interaktion. Die anderen beiden reden von gezieltem Einfluss in Organisationen und von unmittelbarer, absichtlicher und zielbezogener Einflussnahme durch Vorgesetzte. Und wenn man die drei nebeneinanderlegt, sieht man: Die haben vier Bausteine gemeinsam.“',
 'f05/0': '„Wichtig: Führung ist nicht dasselbe wie Management. Man kann zwei Ebenen unterscheiden: die Unternehmensführung, also Ziele, Planung, Organisation und Kontrolle, und die Mitarbeiterführung, also den Umgang mit den einzelnen Leuten. Im KMU kommt noch eine dritte Rolle dazu: das Eigentum. Im Konzern ist das sauber getrennt. Den Aktionären gehört die Firma, der Vorstand leitet sie, und die Teamleitungen führen die Leute.“',
 'f05/1': '„Im Mittelstand rutscht das alles übereinander. Genau daran erkennt man den Mittelstand: Eigentum und Leitung liegen in einer Hand. Heißt konkret: Höchstens zwei Personen oder ihre Familien besitzen mindestens die Hälfte und sitzen selbst in der Geschäftsführung.“',
 'f07/0': '„So sieht Führung im Lehrbuch oft aus: ein Organigramm mit ganz vielen Ebenen.“',
 'f09/0': '„Führungsstile kann man auf so einer Linie sortieren, je nachdem, wer entscheidet: ganz links der Chef allein, ganz rechts das Team. Für den Mittelstand besonders spannend ist die Stufe patriarchalisch: Der Chef entscheidet allein, kümmert sich aber um seine Leute und erwartet dafür Loyalität. Klar, das Modell ist vereinfacht, eher eine Landkarte als die Wahrheit.“',
 'f09/2': '„Es gibt aber auch das Gegenteil: Wo das Team das nötige Know-how hat, führen manche Inhaber eher kooperativ. Gerade weil der Betrieb so überschaubar ist.“',
 'f10/0': '„Wie führt man denn jetzt konkret? Dafür gibt’s Werkzeuge, ich hab fünf rausgepickt. Erstens das Mitarbeitergespräch, regelmäßig oder wenn’s gerade nötig ist. Zweitens die Zielvereinbarung, bekannt als Management by Objectives. Die moderne Variante heißt OKR, mit Zielen für jedes Quartal; im KMU ist das nach Einschätzung von Fachleuten aber noch selten. Drittens Delegation: Aufgaben abgeben, und zwar mitsamt der Verantwortung. Viertens Feedback, einer der stärksten Hebel überhaupt, um Ziele zu erreichen. Und fünftens Führungsgrundsätze, oft als Leitbild: gemeinsame Regeln, wie man miteinander arbeitet.“',
 'f10/1': '„In großen Unternehmen ist für die Personalarbeit meistens eine Personalabteilung zuständig. Im KMU ist die spannende Frage: Wer macht das eigentlich, und hat der dafür überhaupt Zeit? Das schauen wir uns jetzt an.“',
 'f11/0': '„Wer kümmert sich um Personal? 2020 hat das in 91 Prozent der Firmen mit unter 50 Beschäftigten die Geschäftsführung gemacht, nur in gut 7 Prozent eine eigene Personalabteilung. Ab 250 Beschäftigten dreht sich das um: In drei Vierteln kümmert sich die Personalabteilung. Im kleinen Betrieb ist Personal also Chefsache.“',
 'f11/2': '„Das sieht man auch bei der Entwicklung von Führungskräften: Nur 15 Prozent der Firmen mit bis zu 49 Leuten setzen auf Führungsschulungen, um den Zusammenhalt zu stärken. Bei den Großen ab 500 sind es 64 Prozent.“',
 'f15/0': '„Genug Zahlen, jetzt wird’s persönlich. Ich habe zwei Führungskräfte schriftlich befragt, mit demselben Fragebogen. Kamill Jarzebowski hat im Mai 2026 SimpleAct gegründet, eine Softwarefirma für Compliance nach dem EU AI Act und beim Datenschutz, vier Leute, inhabergeführt. Jörg Heisler leitet bei TLT-Turbo in Zweibrücken das Vertrags- und Lizenzmanagement. TLT baut Industrieventilatoren, hat rund 300 Beschäftigte weltweit und gehört zu einem chinesischen Konzern. Streng genommen also gar kein KMU. Aber genau das macht den Vergleich spannend.“',
 'f18/1': '„Erstens Bindung: 77 Prozent der Beschäftigten in Deutschland fühlen sich ihrem Arbeitgeber kaum verbunden. Der Leiter der Studie sagt dazu: ‚Das ist weniger ein Einstellungs- als vielmehr ein Führungsproblem.‘“',
 'f18/2': '„Zweitens Fachkräfte: 92 Prozent der Mittelständler mit 20 bis 999 Beschäftigten rechnen mit negativen Folgen durch den Fachkräftemangel. Wer seine Leute halten will, muss also gut führen.“',
 'f18/3': '„Drittens Nachfolge: Rund 570.000 Inhaberinnen und Inhaber wollen ihre Firma nach ihrem Rückzug bis Ende 2029 nicht weiterführen lassen, manche fest, andere als ernsthafte Option, oft wegen der Rente oder weil in der Familie keiner Interesse hat. Wenn die Führung an einer Person hängt, hängt eben auch die ganze Firma an ihr.“',
 'f18/4': '„Und viertens KI: Von den Leuten in Firmen, die KI nutzen, sagen nur 21 Prozent ohne Wenn und Aber, dass ihr Chef den Einsatz aktiv unterstützt. Neue Technik braucht halt jemanden, der sie vorlebt.“',
})
# Ersetzungen in übernommenen Absätzen (wie fassung-25.py)
for k, alt, neu in [
    ('f20/1', 'Und die Beispiele zeigen, dass das klappt: eine Teamleitung beim veloCenter, ein Leitfaden beim Pflegedienst, und bei SimpleAct die Lehre, Qualität über eine gemeinsame Checkliste zu sichern.',
              'Erste Ansätze zeigt auch meine Befragung: Bei SimpleAct soll künftig eine gemeinsame Checkliste die Qualität sichern, statt dass der Gründer sie hinterher einfordern muss.'),
    ('f07/2', 'Kamill Jarzebowski von SimpleAct sagt:', 'Kamill Jarzebowski, einer meiner zwei Befragten, sagt:'),
    ('f07/3', 'Jörg Heisler bringt’s auf den Punkt:', 'Mein zweiter Befragter, Jörg Heisler von TLT, bringt’s auf den Punkt:'),
    ('f02/g', 'und ein paar Zahlen und Geschichten aus echten Betrieben mitgebracht.', 'und ein paar Zahlen zu den großen Herausforderungen mitgebracht.'),
    ('f19/0', '„Wie das in einem wachsenden Betrieb konkret aussieht, zeigt der ambulante Pflegedienst Jahnke', '„Ein Beispiel für einen wachsenden Betrieb ist der ambulante Pflegedienst Jahnke'),
    # Kürzungen für 25 Minuten
    ('f06/1', ' Darunter gibt’s noch die kleinen Unternehmen mit unter 50 und die Kleinstunternehmen mit unter 10 Leuten.', ''),
    ('f12/1', ' Und der Trend geht weg vom Formular: Schriftliche Zielvereinbarungen sind in diesen Betrieben von 2012 bis 2023 von 60 auf 50 Prozent gefallen.', ''),
    ('f17/2', ' Und selbst im Engineering gilt: Probleme kann man nicht einfach von oben herab diktieren, da braucht’s den schnellen, unkomplizierten Austausch im Team.', ''),
    ('f17/1', ' Seine Begründung: Wenn eine Firma schnell wächst, fehlt später die Zeit, Strukturen nachträglich einzuziehen.', ''),
    ('f09/4', ' Das Team entscheidet in einem vorgegebenen Rahmen.', ''),
    ('f09/4', ' Strategie, Preise und alles Rechtliche macht er selbst, in ihren eigenen Bereichen entscheiden die Teammitglieder.', ''),
    ('f15/1', ' Ein schriftliches Leitbild gibt’s noch nicht.', ''),
    ('f16/2', ' Danach haben sie sortiert: Was kann man beeinflussen, und was ist von außen vorgegeben, zum Beispiel die Unternehmensziele?', ''),
    ('f15/0', ' Aber genau das macht den Vergleich spannend.', ''),
    ('f14/0', ' Ein paar Zahlen dazu.', ''),
    ('f16/3', ' Nur eben aus echten Situationen.', ''),
    ('f17/1', '„Bei SimpleAct prägt der Gründer die Führung selbst. ', '„'),
    ('f10/1', ' Das schauen wir uns jetzt an.', ''),
    ('f17/1', ' Er ist gleichzeitig Verkäufer, Entwickler und Chef. Trotzdem', ' Trotzdem'),
    ('f17/1', 'Und KI verändert seine Führung schon heute. Ein kleines Team schafft, wofür man früher deutlich mehr Leute gebraucht hätte. Führen heißt für ihn deshalb:', 'Und mit KI heißt Führen für ihn:'),
    ('f17/2', ' Außerdem unterscheidet er: In Produktion und Technik wird vor Ort geführt, mit Schichtübergaben und Runden direkt in der Halle; im Büro über Ergebnisse, Gleitzeit und Homeoffice.', ''),
    ('f06/2', ', und die erwirtschaften gut 40 Prozent der Wertschöpfung', ''),
    ('f14/0', ' In 62 Prozent der kleinen Firmen werden Fehler offen angesprochen, in 28 Prozent der großen.', ''),
    ('f16/1', ' Bei einem Compliance-Produkt ist genau das heikel, ein kleiner Fehler kann das Vertrauen ins ganze Produkt kosten.', ''),
    ('f12/2', ' Wie Gespräch und Vereinbarung zusammenkommen, zeige ich Ihnen später an einem Beispiel aus meiner Befragung.', ''),
    ('f11/1', 'und programmiert auch noch selbst mit', 'und programmiert selbst mit'),
    ('f18/0', ', und bei jeder lohnt es sich, kurz an den eigenen Betrieb zu denken', ''),
]:
    assert T[k].count(alt) == 1, (k, alt)
    T[k] = T[k].replace(alt, neu)

K = {
 'regel': basis['kuerzung']['regel'],
 'stufen': [
  {'name': 'Stufe 1', 'ziel': 'ca. −1 min', 'saetze': [
   {'folie': 'f05', 'text': 'Den Aktionären gehört die Firma, der Vorstand leitet sie, und die Teamleitungen führen die Leute.'},
   {'folie': 'f10', 'text': 'Die moderne Variante heißt OKR, mit Zielen für jedes Quartal; im KMU ist das nach Einschätzung von Fachleuten aber noch selten.'},
   {'folie': 'f17', 'text': 'Und beide nennen dieselben Treiber: KI und Jüngere, die Sinn und Freiraum erwarten.'}]},
  {'name': 'Stufe 2', 'ziel': 'zusätzlich, zusammen ca. −2 min', 'saetze': [
   {'folie': 'f07', 'text': 'Meine Deutung: Wer mit dem eigenen Geld drinhängt, entscheidet anders.'},
   {'folie': 'f09', 'text': 'Aber es passt ins Bild: Wo Eigentum und Leitung in einer Hand liegen, laufen die Entscheidungen beim Inhaber zusammen.'},
   {'folie': 'f14', 'text': 'Als Chance zum Lernen sehen die Großen Fehler häufiger als die Kleinen, 19 zu 5 Prozent.'},
   {'folie': 'f16', 'text': 'Heute würde er die Erwartungen früher klarmachen, mit einer gemeinsamen Checkliste vor jeder Veröffentlichung.'},
   {'folie': 'f17', 'text': 'Viele sind seit 25 Jahren oder länger im Betrieb, Jörg Heisler nennt das ein ‚familiäres Wir-Gefühl‘.'}]}]}

fehler = []
for k, v in T.items():
    if re.search(r'[–—]', ''.join(re.findall(r'„(.*?)“', v, re.S))):
        fehler.append(('Gedankenstrich', k))
alt = (ORDNER / 'index.html').read_text(encoding='utf-8')
for k, v in T.items():
    for z in re.findall(r'‚(.*?)‘', v):
        if len(z.split()) > 3 and z not in alt:
            fehler.append(('Zitat nicht wörtlich', k, z[:50]))
for st in K['stufen']:
    for satz in st['saetze']:
        if not any(satz['text'] in v for kk, v in T.items() if kk.startswith(satz['folie'] + '/')):
            fehler.append(('Kürzungssatz fehlt', satz['folie'], satz['text'][:40]))
if fehler:
    raise SystemExit('Fehler: %s' % fehler)

ziel = ORDNER / 'werkzeuge' / 'skript-locker-25.json'
ziel.write_text(json.dumps({
    '_hinweis': 'Erzeugt von werkzeuge/locker-25.py (nicht von Hand ändern): lockere Fassung des Sprechtexts für index-25.html.',
    'datei': 'praesentationsskript-25-locker', 'kicker': 'Präsentationsskript, 25 Minuten, locker formuliert',
    'texte': T, 'kuerzung': K}, ensure_ascii=False, indent=1), encoding='utf-8')
print('skript-locker-25.json:', len(T), 'Absätze, Wörter',
      sum(len(' '.join(re.findall(r'„(.*?)“', v, re.S)).split()) for v in T.values()))
