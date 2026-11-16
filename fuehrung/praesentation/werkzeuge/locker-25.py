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
 'f03/0': '„Führung, das Wort benutzt jeder. Aber wenn man fragt, was genau das ist, wird’s schwierig. Eine Definition, auf die sich alle einigen, gibt es nicht. Ich hab Ihnen drei mitgebracht. Die erste sagt: Führung heißt, das Handeln von Leuten auf vorgegebene Ziele auszurichten, und zwar über Interaktion. Die anderen beiden reden von gezieltem Einfluss in Organisationen und von unmittelbarer, absichtlicher Einflussnahme durch Vorgesetzte. Und wenn man die drei nebeneinanderlegt, sieht man: Die haben vier Bausteine gemeinsam.“',
 'f05/0': '„Wichtig: Führung ist nicht dasselbe wie Management. Man kann zwei Ebenen unterscheiden: die Unternehmensführung, also Ziele, Planung, Organisation und Kontrolle, und die Mitarbeiterführung, also der Umgang mit den einzelnen Leuten. Im KMU kommt noch eine dritte Rolle dazu: das Eigentum. Im Konzern ist das sauber getrennt. Den Aktionären gehört der Laden, der Vorstand leitet ihn, und die Teamleitungen führen die Leute.“',
 'f05/1': '„Im Mittelstand rutscht das alles übereinander. Genau daran erkennt man den Mittelstand: Eigentum und Leitung liegen in einer Hand. Heißt konkret: Höchstens zwei Personen oder ihre Familien besitzen mindestens die Hälfte und sitzen selbst in der Geschäftsführung. Und das ist der Schlüssel für alles, was jetzt kommt.“',
 'f07/0': '„So sieht Führung im Lehrbuch oft aus: ein Organigramm mit ganz vielen Ebenen.“',
 'f07/5': '„Und viertens: Viele Mittelständler haften persönlich für ihre Kredite. Kein Wunder, dass sie bei Risiken vorsichtiger sind als Firmen, die nicht in Familienhand sind.“',
 'f09/0': '„Führungsstile kann man auf so einer Linie sortieren, je nachdem, wer entscheidet: ganz links der Chef allein, ganz rechts das Team. Für den Mittelstand besonders spannend ist die Stufe patriarchalisch: Der Chef entscheidet allein, kümmert sich aber um seine Leute und erwartet dafür Loyalität.“',
 'f09/2': '„Es gibt aber auch das Gegenteil: Wo das Team das nötige Know-how hat, führen manche Inhaber eher kooperativ. Gerade weil der Betrieb so überschaubar ist.“',
 'f10/0': '„Wie führt man denn jetzt konkret? Dafür gibt’s Werkzeuge, ich hab fünf rausgepickt. Erstens das Mitarbeitergespräch, regelmäßig oder wenn’s gerade nötig ist. Zweitens die Zielvereinbarung, bekannt als Management by Objectives. Die moderne Variante heißt OKR, mit Zielen für jedes Quartal; im KMU ist das aber noch selten. Drittens Delegation: Aufgaben abgeben, und zwar mitsamt der Verantwortung. Das fällt gerade Inhabern schwer, die alles selbst aufgebaut haben. Viertens Feedback, einer der stärksten Hebel überhaupt. Und fünftens Führungsgrundsätze, oft als Leitbild: gemeinsame Regeln, wie man miteinander arbeitet.“',
 'f11/0': '„Wer kümmert sich um Personal? In 91 Prozent der Firmen mit unter 50 Beschäftigten macht das die Geschäftsführung. Eine eigene Personalabteilung haben nur gut 7 Prozent. Ab 250 Beschäftigten dreht sich das komplett: Drei Viertel haben eine Personalabteilung. Im kleinen Betrieb ist Personal also Chefsache.“',
 'f11/2': '„Das sieht man auch bei der Entwicklung von Führungskräften: Nur 15 Prozent der Firmen mit bis zu 49 Leuten setzen auf Führungsschulungen, um den Zusammenhalt zu stärken. Bei den Großen ab 500 sind es 64 Prozent.“',
 'f15/0': '„Genug Zahlen, jetzt wird’s persönlich. Ich habe zwei Führungskräfte mit demselben Fragebogen befragt. Kamill Jarzebowski hat im Mai 2026 SimpleAct gegründet, eine Softwarefirma mit vier Leuten, inhabergeführt. Jörg Heisler leitet bei TLT-Turbo in Zweibrücken das Vertrags- und Lizenzmanagement. TLT baut Industrieventilatoren, hat rund 300 Beschäftigte und gehört zu einem chinesischen Konzern. Streng genommen also gar kein KMU. Aber genau das macht den Vergleich spannend.“',
 'f15/3': '„Was beide gemeinsam haben: ihr Rat an neue Führungskräfte, fast wortgleich. Sag klar, was du erwartest, und frag nach. Und beide führen über Ergebnisse statt über Anwesenheit. Kamill Jarzebowski: ‚Ich vertraue auf Ergebnisse statt auf Anwesenheit‘. Jörg Heisler spricht von einem Weg ‚weg von der klassischen Präsenzkontrolle hin zu ergebnisorientiertem Vertrauen‘. Und beide bauen um, nur genau andersrum: Die junge Firma baut Struktur auf, bevor sie sie braucht. Die alte bricht starre Wege auf, damit Teams schnell Probleme lösen können. Wie Führung im Alltag aussieht, zeigen zwei Geschichten aus den Fragebögen.“',
 'f18/1': '„Erstens Bindung: 77 Prozent der Beschäftigten in Deutschland, also mehr als drei Viertel, fühlen sich ihrem Arbeitgeber kaum verbunden. Der Leiter der Studie sagt dazu: ‚Das ist weniger ein Einstellungs- als vielmehr ein Führungsproblem.‘“',
 'f18/2': '„Zweitens Fachkräfte: 92 Prozent der Mittelständler mit 20 bis 999 Beschäftigten rechnen mit negativen Folgen durch den Fachkräftemangel. Wer seine Leute halten will, muss also gut führen.“',
 'f18/3': '„Drittens Nachfolge: Rund 570.000 Inhaberinnen und Inhaber planen nach ihrem Rückzug bis Ende 2029 keine Fortführung ihrer Firma. Wenn die Führung an einer Person hängt, hängt eben auch die ganze Firma an ihr.“',
 'f18/4': '„Und viertens KI: Von den Leuten in Firmen, die KI nutzen, sagen nur 21 Prozent, also gerade mal jeder Fünfte, dass ihr Chef den Einsatz voll und aktiv unterstützt. Neue Technik braucht halt jemanden, der sie vorlebt.“',
})
T['f20/1'] = T['f20/1'].replace(
    'Und die Beispiele zeigen, dass das klappt: eine Teamleitung beim veloCenter, ein Leitfaden beim Pflegedienst, eine Checkliste bei SimpleAct.',
    'Und meine Befragung zeigt, dass das klappt: eine Checkliste bei SimpleAct, eine schriftliche Vereinbarung bei TLT.')
assert 'Checkliste bei SimpleAct, eine schriftliche' in T['f20/1']
# kleine Kürzungen, damit jede Folie in ihre Sollzeit passt
for k, alt, neu in [
    ('f03/0', 'Aber wenn man fragt, was genau das ist, wird’s schwierig. ', ''),
    ('f11/1', ', und manchmal auch das Know-how', ' und das Know-how'),
    ('f11/1', 'und programmiert auch noch selbst mit', 'und programmiert selbst mit'),
    ('f12/2', 'Ein gutes Gespräch kann also schon eine Menge bringen. ', ''),
    ('f18/0', ', und bei jeder lohnt es sich, kurz an den eigenen Betrieb zu denken', ''),
    ('f20/1', ', sagt der Gründer selbst,', ''),
]:
    assert T[k].count(alt) == 1, (k, alt)
    T[k] = T[k].replace(alt, neu)

K = {
 'regel': basis['kuerzung']['regel'],
 'stufen': [
  {'name': 'Stufe 1', 'ziel': 'ca. −1 min', 'saetze': [
   {'folie': 'f06', 'text': 'Darunter gibt’s noch die kleinen Unternehmen mit unter 50 und die Kleinstunternehmen mit unter 10 Leuten.'},
   {'folie': 'f10', 'text': 'Die moderne Variante heißt OKR, mit Zielen für jedes Quartal; im KMU ist das aber noch selten.'},
   {'folie': 'f12', 'text': 'Und der Trend geht weg vom Formular: Schriftliche Zielvereinbarungen sind von 2012 bis 2023 von 60 auf 50 Prozent gefallen.'},
   {'folie': 'f14', 'text': 'Fehler werden in den Kleinen zu 62 Prozent offen angesprochen, in den Großen zu 28 Prozent.'},
   {'folie': 'f15', 'text': 'Und beide bauen um, nur genau andersrum: Die junge Firma baut Struktur auf, bevor sie sie braucht. Die alte bricht starre Wege auf, damit Teams schnell Probleme lösen können.'}]},
  {'name': 'Stufe 2', 'ziel': 'zusätzlich, zusammen ca. −2 min', 'saetze': [
   {'folie': 'f07', 'text': 'Kein Wunder, dass sie bei Risiken vorsichtiger sind als Firmen, die nicht in Familienhand sind.'},
   {'folie': 'f09', 'text': 'Bei zwei Leuten ist das natürlich kein Beweis, aber es passt ins Bild: Wo Eigentum und Leitung in einer Hand liegen, laufen die Entscheidungen beim Inhaber zusammen.'},
   {'folie': 'f14', 'text': 'Als Chance zum Lernen sehen die Großen Fehler häufiger als die Kleinen, 19 zu 5 Prozent.'},
   {'folie': 'f15', 'text': 'Ein schriftliches Leitbild gibt’s noch nicht.'},
   {'folie': 'f16', 'text': 'Bei einem Compliance-Produkt ist genau das heikel, ein kleiner Fehler kann das Vertrauen ins ganze Produkt kosten.'}]}]}

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
