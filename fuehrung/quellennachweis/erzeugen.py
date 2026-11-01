#!/usr/bin/env python3
"""Erzeugt den Quellennachweis (index.html) zum Referat „Führung im KMU“.

Welche Quelle wofür und warum genutzt wurde, steht unten in TEILE. Die vollständigen
Angaben und Links kommen aus recherche/dossier-fakten.md (Anhang A), damit Nummern
und URLs mit Folien und Dossier übereinstimmen.
Aufruf aus dem Repo-Stammordner:
  python3 fuehrung/quellennachweis/erzeugen.py && node fuehrung/quellennachweis/pdf.mjs
"""
import html, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
ZIEL = pathlib.Path(__file__).resolve().parent / 'index.html'

# (Nr, Kurzname, Folien, wofür genutzt, warum diese Quelle, Einschränkung)
TEILE = [
 ('Begriff: Was ist Führung?', 'Folien 03 bis 05, 09, Backup B2', [
  (1, 'Gabler Wirtschaftslexikon: „Führung“', '03, 04, 20, B2',
   'Erste der drei Definitionen. Liefert die Bausteine Ziel, Interaktion und Über- und Unterordnung.',
   'Das Standardlexikon der Betriebswirtschaftslehre, online frei lesbar, von Fachautoren verfasst. Im Studium die übliche erste Referenz.',
   'Lexikondefinition, kein empirischer Beleg.'),
  (2, 'Gabler: „Personalführung“', '03, 04, B2',
   'Zweite Definition: zielgerichtetes Einflusshandeln mit einer Führungskraft und mindestens einem unterstellten Mitarbeiter.',
   'Ergänzt die allgemeine Definition um die Ebene der Personalführung, um die es im Vortrag vor allem geht.',
   '–'),
  (3, 'Gabler: „Leadership“', '03 (Sprechtext)',
   'Beleg, dass der Begriff „nicht einheitlich definiert“ ist.',
   'Zeigt die Vielfalt der Definitionen mit einer zitierfähigen Aussage aus demselben Lexikon.',
   'Die Aussage gilt wörtlich für „Leadership“; so wird sie im Vortrag auch zugeordnet.'),
  (4, 'Gabler: „Management“', '05',
   'Management als Tätigkeit der Unternehmensführung, die neun Managementaufgaben und die Trennung von Eigentum und Geschäftsführung als Merkmal des Managements.',
   'Liefert die Abgrenzung von Führung und Management und den Gegensatz zum Mittelstand, in dem Eigentum und Leitung zusammenfallen.',
   '–'),
  (5, 'von Rosenstiel (2000), Lexikon der Psychologie: „Führung“', '03, 04, 05, 20, B2',
   'Dritte Definition (unmittelbare, absichtliche, zielbezogene Einflussnahme) und die zwei Ebenen Unternehmens- und Mitarbeiterführung.',
   'Psychologische Sicht neben der betriebswirtschaftlichen. Lutz von Rosenstiel ist ein bekannter Organisationspsychologe; das Lexikon ist bei Spektrum frei zugänglich.',
   'Stand 2000; Grunddefinitionen ändern sich aber kaum.'),
  (6, 'Gabler: „Führungsstil“', '08, 09',
   'Führungsstil-Kontinuum nach Tannenbaum und Schmidt (1958) und die Kritik an frühen Stilmodellen („zu idealtypisch und schlicht“).',
   'Freier Zugang zum Kontinuum, weil der Originalaufsatz hinter einer Bezahlschranke liegt.',
   'Nennt keine sieben Stufen; die Stufennamen im Vortrag sind eigene Bezeichnungen in Anlehnung an das Modell.'),
  (17, 'Gabler: „Patriarchalischer Führungsstil“', '09',
   'Bedeutung von „patriarchalisch“: streng hierarchisch, keine Beteiligung, Loyalität gegen Fürsorge.',
   'Der Begriff ist zentral für Wimmers Einschätzung zum Inhaberstil; das Publikum soll wissen, was genau gemeint ist.',
   '–'),
  (32, 'Wikipedia: „Führungskontinuum“', '09, B1',
   'Siebenstufige Darstellung des Kontinuums.',
   'Die einzige frei zugängliche Darstellung mit sieben Stufen.',
   'Sekundärquelle, nur als Hilfsbeleg genutzt; das Original [31] liegt hinter einer Bezahlschranke.'),
 ]),
 ('KMU und Mittelstand', 'Folien 05, 06, Backup B3', [
  (8, 'Europäische Kommission: KMU-Definition', '06, B3',
   'Größengrenzen: unter 250 Beschäftigte und höchstens 50 Mio. € Umsatz oder 43 Mio. € Bilanzsumme.',
   'Die maßgebliche amtliche Definition; auf ihr beruhen die Statistiken von Destatis und IfM.',
   'Rein quantitativ; sagt nichts über Eigentum und Leitung.'),
  (79, 'EU-Empfehlung 2003/361/EG', '06, B3',
   'Amtlicher Wortlaut der Definition, Klein- und Kleinstunternehmen, Zählweise der Beschäftigten.',
   'Primärtext statt Zusammenfassung, für Rückfragen nach den genauen Grenzen.',
   '–'),
  (9, 'IfM Bonn: KMU-Definition', '06',
   'Deutsche Grenze von 500 Beschäftigten.',
   'Zeigt, dass Deutschland den Mittelstand weiter fasst als die EU.',
   'Weicht von der EU-Definition ab; im Vortrag deshalb immer mit genannt.'),
  (10, 'IfM Bonn: Mittelstandsdefinition', '05, 06, 20, B2',
   'Mittelstand als „Einheit von Eigentum und Leitung“: bis zu zwei Personen oder ihre Familien halten mindestens 50 % und führen selbst.',
   'Die qualitative Definition, auf die es für Führung ankommt. Sie ist der rote Faden des Vortrags.',
   'In amtlichen Statistiken nicht messbar.'),
  (11, 'IfM Bonn: Volkswirtschaftliche Bedeutung der KMU', '06, B3',
   '68,4 % der Auszubildenden in Betrieben unter 250 Beschäftigten; 54,4 % der abhängig Beschäftigten.',
   'Aktuelle Kennzahlen aus dem Unternehmensregister, vom führenden Mittelstandsinstitut aufbereitet.',
   'Nutzt für diese Zahlen die EU-Definition.'),
  (12, 'Destatis: Anteile der KMU 2024', '06, B3',
   '99,3 % der Unternehmen, 53,7 % der tätigen Personen, 41,3 % der Bruttowertschöpfung.',
   'Amtliche Statistik, neuester Stand (August 2026).',
   'Erfasst die Wirtschaftsabschnitte B bis S.'),
  (13, 'KfW-Mittelstandspanel 2025', 'B3',
   '71,6 % der Erwerbstätigen im Mittelstand nach KfW-Definition (2024).',
   'Zeigt, wie stark die gewählte Definition die Zahl verändert (Backup „Definitionseffekt“).',
   'Andere Definition (bis 500 Mio. € Umsatz), deshalb nur im Backup.'),
  (78, 'KfW-Mittelstandspanel 2026', 'B3, B5',
   'Aktualisierte Strukturzahlen für 2025.',
   'Prüfung, ob es neuere Zahlen gibt.',
   'Neue Zählweise, mit 2024 nicht direkt vergleichbar.'),
 ]),
 ('Besonderheiten der Führung im Mittelstand', 'Folien 07, 09, 20', [
  (14, 'Wimmer (2021): Leadership in and of Family Companies', '07, 09, 20, 21',
   'Eine zentrale Führungsbeziehung zum Inhaber, flache Hierarchien, informelle Aufgabenverteilung; Schätzung „mehr als zwei Drittel“ patriarchal; Vorteile (kurze Entscheidungswege) und Risiken (Existenzgefährdung bei Wachstum).',
   'Wissenschaftlicher Fachartikel, frei zugänglich (Open Access), deutschsprachig und genau zum Thema Führung in Familienunternehmen. Solche Quellen sind selten.',
   'Theoretischer Überblick; die zwei Drittel sind eine Schätzung, keine Erhebung. Bezieht sich auf Familienunternehmen.'),
  (15, 'Bijedić u. a. (2018), IfM-Materialien 272', '07, 09',
   'Unternehmerpersönlichkeit im Zentrum, geringere Spezialisierung der Führungsaufgaben, persönliche Haftung und Risikoaversion, ein kooperativer Führungstyp.',
   'Empirische Studie des IfM Bonn über die Führungsebene im Mittelstand, frei bei EconStor.',
   'Qualitative Studie mit 11 Interviews; „kooperativ“ gilt nur für einen Führungstyp.'),
 ]),
 ('Führungsinstrumente im KMU', 'Folien 10 bis 14, Backup B5', [
  (42, 'Gabler: „Mitarbeitergespräch“', '10', 'Definition des Mitarbeitergesprächs.',
   'Alle fünf Werkzeuge werden aus demselben Lexikon definiert; das macht sie vergleichbar.', '–'),
  (43, 'Gabler: „Management by Objectives“', '10', 'Zielvereinbarung, Ursprung bei Peter Drucker (1954).', 'wie [42]', '–'),
  (44, 'Gabler: „Delegation“', '10, 13', 'Definition und Voraussetzung (Kompetenz und Motivation).', 'wie [42]', '–'),
  (46, 'Gabler: „Führungsgrundsätze“', '10', 'Führungsgrundsätze als Verhaltensempfehlungen für die Zusammenarbeit.', 'wie [42]', '–'),
  (48, 'Gabler: „Objectives and Key Results (OKR)“', '10', 'OKR als moderne Form der Zielvereinbarung mit Quartalszielen.', 'wie [42]', '–'),
  (49, 'Lexikon der Psychologie: „Rückmeldung“', '10, 14',
   'Feedback als Wirkfaktor für Ziele; Wirkung hängt von Glaubwürdigkeit und „psychologischer Nähe“ ab.',
   'Erklärt, warum Nähe im KMU beim Feedback ein Vorteil sein könnte.',
   'Theoretisch; der „Heimvorteil“ der KMU ist meine eigene Deutung.'),
  (57, 'FIR an der RWTH Aachen (2021)', '10 (Notiz)',
   'OKR wird in KMU kaum genutzt.', 'Die einzige frei zugängliche Aussage dazu.',
   'Pressemitteilung, Einschätzung ohne Zahlen.'),
  (54, 'KOFA-Studie 4/2021 (IW Köln)', '11, 12',
   '91 % der Unternehmen unter 50 Beschäftigten: Personalarbeit bei der Geschäftsführung; Zeit und Know-how fehlen; 74 % führen regelmäßig Mitarbeitergespräche.',
   'Die einzige freie Quelle mit Unternehmen unter 50 Beschäftigten, große Stichprobe (N = 1.431).',
   'Daten von 2020.'),
  (70, 'Randstad-ifo-Personalleiterbefragung Q1/2025', '11',
   'Führungsschulungen: 15 % der Unternehmen bis 49 Beschäftigte, 64 % ab 500.',
   'Weist Größenklassen aus; ifo ist ein führendes Wirtschaftsforschungsinstitut.',
   'Angaben von Personalverantwortlichen; abgefragt als Maßnahme für den Zusammenhalt.'),
  (72, 'Destatis: Weiterbildungserhebung CVTS6 (2020)', '11 (Notiz)',
   'Führungskompetenzen in Weiterbildungskursen nach Größe.',
   'Amtliche Hintergrundzahl, um [70] einzuordnen.',
   'Misst die Rangfolge der Kursstunden, nicht das Angebot; nur Hintergrund.'),
  (56, 'IAB-Betriebspanel Sachsen-Anhalt 2022', '11',
   'Nur 13 % der Kleinstbetriebe haben eine zweite Führungsebene.',
   'Die einzige gefundene Zahl zur zweiten Führungsebene nach Betriebsgröße.',
   'Nur ein Bundesland; im Vortrag ausdrücklich so gesagt.'),
  (55, 'KOFA-Studie 4/2025 (IW Köln)', '12, 14',
   '82 % der Unternehmen führen 2024 Mitarbeitergespräche; Einbindung bei Veränderungen ist in kleinen Unternehmen häufiger „besonders erfolgreich“ (47,8 % gegenüber 28,9 %).',
   'Die aktuellste Fortschreibung von [54].',
   'Frage gegenüber 2020 leicht geändert; Anteil unter den Unternehmen, die die Strategie nutzen.'),
  (50, 'BMAS-Forschungsbericht 469 (2016)', '12',
   'Zielvereinbarungen nach Betriebsgröße (57 % der Betriebe mit 50 bis 99 Beschäftigten, neun von zehn Großbetrieben).',
   'Die einzige frei zugängliche Aufschlüsselung nach Größe.',
   'Nur Betriebe ab 50 Beschäftigten; Daten von 2014.'),
  (53, 'IAB-Kurzbericht 11/2025', '12',
   'Schriftliche Zielvereinbarungen sinken von 60 auf 50 %; Gespräche wirken auch ohne Zielvereinbarung.',
   'Aktuelle wissenschaftliche Auswertung des Instituts für Arbeitsmarkt- und Berufsforschung.',
   'Nur Betriebe ab 50 Beschäftigten; Zusammenhang, nicht streng kausal.'),
  (60, 'INQA: veloCenter Kiel', '13, B6',
   'Delegationsfall: Geschäftsführer überlastet, Lösung durch Werkstatt- und Teamleitung.',
   'Anschaulicher Fall mit wörtlichen Zitaten. INQA (Initiative Neue Qualität der Arbeit) ist eine öffentliche Initiative des Bundesarbeitsministeriums.',
   'Erfolgsbericht eines Förderprogramms (gilt für alle INQA-Fälle).'),
  (59, 'INQA: ELBS', '13, B6',
   'Zitat „loslassen lernen“; die Beschäftigten wollten mehr Verantwortung.',
   'Zeigt die Sicht des Inhabers in einem Handwerksbetrieb.',
   'Erfolgszahlen widersprüchlich, deshalb nicht verwendet.'),
  (71, 'Randstad-ifo-HR-Befragung Q3/2026', '14',
   'Verhältnis zu Führungskräften „offen und vertrauensvoll“ (53 % gegenüber 20 %); Fehler werden offen angesprochen (62 % gegenüber 28 %), mit Gegenbefund.',
   'Die aktuellsten Zahlen zur Führungskultur nach Unternehmensgröße.',
   'Angaben von Personalverantwortlichen, also Selbstauskunft der Unternehmen.'),
  (74, 'KOFA-Studie 1/2024 (IW Köln)', '14',
   'Gegenseitiges Feedback: 90,8 % der KMU gegenüber 55,2 % der großen Unternehmen.',
   'Direkter Vergleich von KMU und großen Unternehmen.',
   'Nur weiterbildungsaktive Unternehmen.'),
  (66, 'DGB-Index Gute Arbeit 2025', '14',
   'Wenig oder keine Wertschätzung durch Vorgesetzte, nach Betriebsgröße (32 % bei 20 bis 49 Beschäftigten).',
   'Gegenperspektive: Beschäftigte statt Personalverantwortliche. Die einzige freie Quelle dazu nach Betriebsgröße.',
   'Gewerkschaftsnaher Herausgeber; Mittelwert 2022 bis 2025.'),
  (37, 'INQA: Malerbetrieb Eck', '14, B6', 'Feedback-System per Fragebogen; Zitat zum Zeitmangel.', 'Fall zu Feedback im Handwerk.', 'Erfolgsbericht.'),
  (39, 'INQA: Wöhlke Möbelmanufaktur', '14, B6', 'Beteiligung bei der KI-Einführung, „Scheitern muss erlaubt sein“.', 'Fall zu Beteiligung und Fehlerkultur.', 'Erfolgsbericht, ohne Datum.'),
  (61, 'INQA: Steuerhaus Kiel', '14, B6', 'Gemeinsam erarbeitetes Leitbild nach einer Fusion.', 'Fall zu Führungsgrundsätzen.', 'Erfolgsbericht.'),
 ]),
 ('Praxis und Herausforderungen', 'Folien 18 bis 21', [
  (21, 'Gallup Engagement Index 2025 (Pressemitteilung)', '18, 20, 21',
   '77 % geringe Bindung, „Führungsproblem“, 21 % volle Unterstützung beim KI-Einsatz.',
   'Die bekannteste regelmäßige Studie zur Mitarbeiterbindung in Deutschland.',
   'Keine Werte nach Unternehmensgröße; kommerzieller Anbieter.'),
  (22, 'Gallup Engagement Index 2025 (Bericht)', '18',
   'Wortlaut des Zitats von Marco Nink, Bezugsgröße der KI-Zahl, 40 % der Führungskräfte mit Coaching.',
   'Volltext, um die Pressemitteilung zu prüfen.', 'wie [21]'),
  (19, 'DIHK-Fachkräftereport 2025/2026', '18, 20',
   '92 % der Mittelständler mit 20 bis 999 Beschäftigten erwarten negative Folgen des Fachkräftemangels.',
   'Große Unternehmensbefragung der Industrie- und Handelskammern, Größenklassen ausgewiesen.',
   'Die Größenklasse 20 bis 999 deckt sich nicht mit der KMU-Definition.'),
  (18, 'KfW-ifo-Fachkräftebarometer Juni 2026', '18 (Sprechtext)',
   '22 % der KMU sehen sich durch Fachkräftemangel behindert, 19 % der Großunternehmen.',
   'Aktuellster Wert mit direktem Vergleich KMU und groß.',
   'Eigene KMU-Definition des Barometers.'),
  (24, 'KfW Research: Nachfolge-Monitoring Mittelstand 2025', '18, 20, 21',
   '569.000 Inhaber ohne Fortführungsabsicht bis 2029; Gründe; Alter der Inhaber.',
   'Die Standardquelle zur Nachfolge im Mittelstand.',
   'Hochrechnung; schließt ernsthaft erwogene Stilllegungen ein.'),
  (26, 'Destatis: KI-Nutzung nach Größe 2025', '18 (Sprechtext)',
   'KI-Nutzung: 23 % der Unternehmen mit 10 bis 49 Beschäftigten, 57 % ab 250.',
   'Amtliche Zahl nach Größenklassen.',
   'Erst ab 10 Beschäftigten; Reihenbruch durch neue Abgrenzung.'),
  (25, 'KfW Research: KI im Mittelstand (2026)', '18 (Sprechtext)',
   'Nicht die Größe, sondern Digitalisierungsgrad und Know-how entscheiden über KI-Nutzung.',
   'Ordnet die Zahl aus [26] ein, damit kein falscher Schluss entsteht.',
   'Ergebnis einer Regressionsanalyse.'),
  (36, 'INQA: Pflegedienst Jahnke', '19, B6',
   'Fallbeispiel: Wachstum von 18 auf 43 Beschäftigte, Leitfaden für Feedbackgespräche, Notfallkette, Nachfolge.',
   'Der ausführlichste Fall, mit Zitaten der Inhaberin.',
   'Erfolgsbericht; einen Zusammenhang zwischen Leitfaden und Nachfolge stellt die Quelle nicht her.'),
 ]),
]

VERWORFEN = [
 ('Wunderer, Definition von Führung', 'In Lehrbüchern verbreitet, der Wortlaut ist aber nicht frei zugänglich und damit für das Publikum nicht nachprüfbar.'),
 ('Tannenbaum/Schmidt, Originalaufsatz (Harvard Business Review) [31]', 'Hinter einer Bezahlschranke. Das Modell wird über Gabler [6] und Wikipedia [32] belegt.'),
 ('KPMG/FIF-Studie 2016 zu Führungsstilen in Familienunternehmen', 'Nur über Presseberichte zugänglich, nicht im Original prüfbar; misst zudem etwas anderes als Wimmer.'),
 ('Umsatzzahlen im INQA-Fall ELBS', 'Selbstauskunft, in sich widersprüchlich (100 % gegenüber „bis zu 50 Prozent“) und durch eine Vier-Tage-Woche überlagert.'),
 ('„Lernkultur ist kein Luxus …“ (INQA)', 'Redaktionstext ohne Sprecher, darf nicht als Zitat einer Person erscheinen.'),
 ('INQA-Fall up to data (OKR)', 'OKR war dort nur geplant, nicht eingeführt; als Beleg für OKR im KMU ungeeignet.'),
 ('Agilitätsstudie „Mittelstand“ (Schulke/Jütte 2019)', 'Die Stichprobe besteht überwiegend aus Unternehmen ab 500 Beschäftigten, also kein KMU-Befund.'),
 ('König (2003) zu Führungsgrundsätzen nach Größe [82]', 'Die einzige gefundene Zahl dazu, aber von 1999 und aus Sicht von Betriebsräten; zu alt.'),
 ('Hays, McKinsey, ifaa, MB24 u. a.', 'Nur Landingpages ohne freien Volltext, nicht auffindbar oder mit Interessenkonflikt des Herausgebers.'),
]

GRENZEN = [
 'Für Kleinstbetriebe (unter 10 Beschäftigte) gibt es kaum frei zugängliche Führungsdaten; viele Erhebungen beginnen erst bei 10 oder 50 Beschäftigten.',
 'Viele Zahlen zur Führungskultur sind Angaben von Personalverantwortlichen. Deshalb steht im Vortrag bewusst die Beschäftigtensicht (DGB-Index, Gallup) daneben.',
 'Die Praxisfälle stammen aus einem Förderprogramm und sind Erfolgsberichte; gescheiterte Projekte sind dort nicht zu finden.',
 'Zum typischen Führungsstil im Mittelstand gibt es keine repräsentative freie Erhebung, nur Wimmers Schätzung und qualitative Interviews.',
 'Gallup weist keine Werte nach Unternehmensgröße aus; das wird auf der Folie gesagt.',
]


def quellenverzeichnis():
    text = (ROOT / 'recherche' / 'dossier-fakten.md').read_text(encoding='utf-8')
    anhang = text[text.find('## Anhang A'):]
    eintraege = {}
    for m in re.finditer(r'^(\d+)\. (.*)$', anhang, re.M):
        zeile = m.group(2)
        url = re.search(r'https?://\S+', zeile)
        angabe = re.split(r'\s*https?://', zeile)[0].strip()
        eintraege[int(m.group(1))] = (angabe, url.group(0).rstrip('.,') if url else '')
    return eintraege


def e(s):
    return html.escape(s, quote=False)


def baue():
    vz = quellenverzeichnis()
    genutzt = sorted({q[0] for _, _, qs in TEILE for q in qs})
    fehlt = [n for n in genutzt + [31] if n not in vz]
    assert not fehlt, f'nicht im Dossier: {fehlt}'

    teile_html = []
    for titel, folien, quellen in TEILE:
        zeilen = []
        for nr, name, fol, wofuer, warum, grenze in quellen:
            zeilen.append(
                f'<tr><td class="nr">[{nr}]</td><td><b>{e(name)}</b><span class="fol">Folie {e(fol)}</span></td>'
                f'<td>{e(wofuer)}</td><td>{e(warum)}</td><td class="grenze">{e(grenze)}</td></tr>')
        teile_html.append(
            f'<h3>{e(titel)} <span class="leise">· {e(folien)}</span></h3>'
            '<table><thead><tr><th>Nr.</th><th>Quelle</th><th>Wofür genutzt</th><th>Warum diese Quelle</th><th>Einschränkung</th></tr></thead>'
            f'<tbody>{"".join(zeilen)}</tbody></table>')

    verzeichnis = ''.join(
        f'<li><span class="nr">[{n}]</span> {e(vz[n][0].replace("**", ""))} <span class="url">{e(vz[n][1])}</span></li>'
        for n in genutzt + [31])
    verworfen = ''.join(f'<li><b>{e(a)}:</b> {e(b)}</li>' for a, b in VERWORFEN)
    grenzen = ''.join(f'<li>{e(g)}</li>' for g in GRENZEN)

    typen = [
        ('Fachlexika', 'Gabler Wirtschaftslexikon, Lexikon der Psychologie', 13, 'Begriffe und Definitionen'),
        ('Amtliche Quellen', 'EU-Kommission, Destatis', 5, 'Definitionen und Strukturzahlen'),
        ('Forschungsinstitute und Studien', 'IfM Bonn, IAB, IW Köln (KOFA), KfW Research, ifo, DIHK, BMAS, Gallup, DGB-Index, FIR', 22, 'Zahlen nach Unternehmensgröße'),
        ('Wissenschaftlicher Fachartikel', 'Wimmer (2021), Open Access', 1, 'Führung in Familienunternehmen'),
        ('Praxisfälle', 'INQA-Coaching (Bundesarbeitsministerium)', 6, 'Beispiele aus echten Betrieben'),
        ('Hilfsbeleg', 'Wikipedia', 1, 'Stufen des Kontinuums'),
        ('Eigene Erhebung', 'schriftliche Befragung, n = 2', 1, 'Praxisstimmen'),
    ]
    typen_html = ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td class="zahl">{c}</td><td>{d}</td></tr>' for a, b, c, d in typen)
    assert sum(t[2] for t in typen) - 1 == len(genutzt), (sum(t[2] for t in typen), len(genutzt))

    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quellennachweis · Führung im KMU</title>
<!-- Erzeugt von fuehrung/quellennachweis/erzeugen.py; nicht von Hand ändern. -->
<style>
  @font-face {{ font-family: "Fraunces Q"; src: url("../praesentation/schriften/fraunces-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }}
  @font-face {{ font-family: "Fraunces Q"; src: url("../praesentation/schriften/fraunces-latin-ext-opsz-normal.woff2") format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+1E00-1EFF; }}
  @font-face {{ font-family: "Inter Q"; src: url("../praesentation/schriften/inter-latin-opsz-normal.woff2") format("woff2"); font-weight: 100 900; }}
  @font-face {{ font-family: "Inter Q"; src: url("../praesentation/schriften/inter-latin-ext-opsz-normal.woff2") format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+1E00-1EFF; }}
  @font-face {{ font-family: "Inter Q"; src: url("../praesentation/schriften/inter-latin-opsz-italic.woff2") format("woff2"); font-weight: 100 900; font-style: italic; }}
  :root {{ --text: #1d1d1b; --leise: #6b6b66; --akzent: #0b4f6c; --linie: #d8d4cb; --flaeche: #f4f1ea; --papier: #fff; }}
  @media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --text: #ecebe6; --leise: #a5a49e; --akzent: #7cc3e0; --linie: #3d3d3a; --flaeche: #222220; --papier: #161618; }} }}
  :root[data-theme="dark"] {{ --text: #ecebe6; --leise: #a5a49e; --akzent: #7cc3e0; --linie: #3d3d3a; --flaeche: #222220; --papier: #161618; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; background: var(--papier); color: var(--text); font: 9.6pt/1.45 "Inter Q", system-ui, sans-serif; hyphens: auto; }}
  main {{ max-width: 260mm; margin: 0 auto; padding: 24px 16px; }}
  h1, h2, h3 {{ font-family: "Fraunces Q", Georgia, serif; font-weight: 380; margin: 0; line-height: 1.15; }}
  h1 {{ font-size: 24pt; }}
  h2 {{ font-size: 15pt; margin: 18px 0 6px; padding-top: 8px; border-top: 1px solid var(--linie); break-after: avoid; }}
  h3 {{ font-size: 12pt; margin: 14px 0 5px; break-after: avoid; }}
  h2 .nr {{ color: var(--akzent); }}
  .unter {{ color: var(--leise); margin: 5px 0 12px; }}
  .leise {{ color: var(--leise); font-family: "Inter Q", sans-serif; font-size: 9pt; }}
  p {{ margin: 0 0 6px; }}
  ul, ol {{ margin: 4px 0 6px; padding-left: 18px; }}
  li {{ margin: 0 0 3px; }}
  .kasten {{ background: var(--flaeche); padding: 9px 12px; border-left: 3px solid var(--akzent); margin: 8px 0; }}
  .zahlen {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 4px; }}
  .zahlen div {{ background: var(--flaeche); padding: 8px 10px; }}
  .zahlen b {{ display: block; font: 380 20pt/1 "Fraunces Q", Georgia, serif; color: var(--akzent); margin-bottom: 3px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 4px 0 8px; font-size: 8.6pt; }}
  th {{ text-align: left; font-size: 7.6pt; letter-spacing: .06em; text-transform: uppercase; color: var(--leise); border-bottom: 1.5px solid var(--text); padding: 3px 5px; }}
  td {{ vertical-align: top; padding: 4px 5px; border-bottom: 1px solid var(--linie); }}
  tr {{ break-inside: avoid; }}
  thead {{ display: table-header-group; }}
  td.nr, .verzeichnis .nr {{ color: var(--akzent); font-variant-numeric: tabular-nums; white-space: nowrap; }}
  td:nth-child(2) {{ width: 19%; }} td:nth-child(3) {{ width: 29%; }} td:nth-child(4) {{ width: 27%; }}
  td.grenze {{ color: var(--leise); }}
  td.zahl {{ text-align: right; font-variant-numeric: tabular-nums; }}
  .fol {{ display: block; color: var(--leise); font-size: 7.8pt; margin-top: 2px; }}
  .verzeichnis {{ list-style: none; padding: 0; columns: 2; column-gap: 8mm; font-size: 7.8pt; }}
  .verzeichnis li {{ break-inside: avoid; margin-bottom: 4px; }}
  .url {{ color: var(--leise); word-break: break-all; }}
  @page {{ size: A4 landscape; margin: 13mm 15mm 12mm 15mm; }}
  @media print {{ :root {{ --text: #1d1d1b; --leise: #6b6b66; --akzent: #0b4f6c; --linie: #d8d4cb; --flaeche: #f4f1ea; --papier: #fff; }} main {{ max-width: none; padding: 0; }} }}
  @media (max-width: 700px) {{ .zahlen {{ grid-template-columns: 1fr 1fr; }} table {{ display: block; overflow-x: auto; }} .verzeichnis {{ columns: 1; }} }}
</style></head><body><main>
<h1>Quellennachweis: welche Quellen ich wofür genutzt habe und warum</h1>
<p class="unter">Referat „Führung im KMU“ · Modul Management im KMU · Prof. Dr. Christine Arend-Fuchs · Hochschule Kaiserslautern, Campus Zweibrücken · Yannick Heisler · Vortrag am 2. November 2026</p>

<h2><span class="nr">1</span> Auf einen Blick</h2>
<div class="zahlen">
  <div><b>{len(genutzt)}</b>Quellen in Folien, Sprechtext und Handout</div>
  <div><b>{len(genutzt) - 1}</b>davon Primärquellen, frei im Original zugänglich; dazu Wikipedia als Hilfsbeleg</div>
  <div><b>1</b>eigene Erhebung: schriftliche Befragung zweier Führungskräfte</div>
  <div><b>5</b>unabhängige Prüfdurchgänge aller Fakten am Original</div>
</div>
<table><thead><tr><th>Art</th><th>Herausgeber</th><th>Anzahl</th><th>Rolle im Vortrag</th></tr></thead><tbody>{typen_html}</tbody></table>
<p>Die Nummern [n] sind dieselben wie in den Fußzeilen der Folien und im Recherche-Dossier (<i>recherche/dossier-fakten.md</i>). Das Handout nennt keine Quellen; alle Zahlen darin stammen aus den hier aufgeführten Quellen.</p>

<h2><span class="nr">2</span> Nach welchen Kriterien ich Quellen ausgewählt habe</h2>
<ol>
  <li><b>Frei zugänglich.</b> Vorgabe der Aufgabe und mein Anspruch: Jede Zahl und jedes Zitat soll das Publikum selbst nachprüfen können. Quellen hinter Bezahlschranken habe ich nur als Verweis genannt, nie als einzigen Beleg.</li>
  <li><b>Praxisnah statt theorielastig.</b> Theorie nur so viel wie nötig: Lexika für die Begriffe, ein Fachartikel für die Besonderheiten im Mittelstand. Der Schwerpunkt liegt auf Zahlen aus Befragungen von Betrieben und Beschäftigten und auf Fällen aus echten Unternehmen.</li>
  <li><b>Seriöser Herausgeber.</b> Fachlexika (Gabler, Spektrum), amtliche Statistik (Destatis, EU), öffentliche und wissenschaftliche Institute (IfM Bonn, IAB, IW Köln, KfW Research, ifo) und ein begutachteter Fachartikel (Wimmer). Interessengeleitete Quellen wie DGB-Index und Gallup nutze ich nur mit Kennzeichnung des Herausgebers.</li>
  <li><b>Bezug zur Unternehmensgröße.</b> Ich habe gezielt Quellen gesucht, die nach Größenklassen auswerten. Wo es das nicht gibt (Gallup), sage ich es auf der Folie.</li>
  <li><b>Aktualität.</b> Jeweils die neueste Ausgabe; am 28.10.2026 habe ich geprüft, ob es neuere gibt (es gab keine mit anderen Werten).</li>
  <li><b>Mehrere Perspektiven.</b> Unternehmenssicht (Angaben von Personalverantwortlichen) und Beschäftigtensicht (DGB-Index, Gallup) stehen nebeneinander, damit kein geschöntes Bild entsteht.</li>
</ol>

<h2><span class="nr">3</span> Wie ich die Quellen geprüft habe</h2>
<div class="kasten">
<p>Alle verwendeten Zahlen, Zitate und Aussagen stehen im Recherche-Dossier, jeweils mit eigener Kennung, wörtlichem Beleg und Fundstelle. Fünf unabhängige Prüfdurchgänge haben jeden Eintrag am Original nachgeschlagen; ein weiterer Durchgang hat Folien und Handout gegen das Dossier abgeglichen. Ergebnis: <b>80 Einträge geprüft, 66 bestätigt, 13 korrigiert</b> (meist fehlende Bezugsgröße oder Seitenzahl), 1 nicht prüfbar (eine Negativaussage). Alle Korrekturen sind in Folien, Sprechtext und Handout eingearbeitet.</p>
<p>Regeln dabei: Wörtliche Zitate stehen unverändert, Auslassungen mit „…“. Jede Zahl wird mit Jahr, Bezugsgröße und Größenklasse genannt. Eigene Schlüsse sind als solche gekennzeichnet (zum Beispiel die Arbeitsdefinition und der „Heimvorteil“ beim Feedback).</p>
</div>

<h2><span class="nr">4</span> Quellen nach Teilen des Vortrags</h2>
{"".join(teile_html)}

<h2><span class="nr">5</span> Eigene Erhebung: schriftliche Befragung</h2>
<table><thead><tr><th>Quelle</th><th>Wofür genutzt</th><th>Warum so</th><th>Einschränkung</th></tr></thead><tbody>
<tr><td><b>Fragebogen mit 20 Fragen</b><span class="fol">Folien 09, 15 bis 17, 20, Backup B4; Sprechtexte 05, 07, 11, 12, 18</span></td>
<td>Selbstverständnis von Führung, Führungsalltag, Ausfalltest, schwierige Situationen, Selbsteinschätzung auf dem Kontinuum, Wandel durch KI und jüngere Beschäftigte.</td>
<td>Die Aufgabe verlangte Interviews. Schriftlich statt live, damit beide in Ruhe antworten konnten und die Zitate wörtlich vorliegen. Kamill Jarzebowski (Gründer von SimpleAct, 4 Personen, inhabergeführt) und Jörg Heisler (Abteilungsleiter bei TLT-Turbo, ca. 300 Beschäftigte, Konzern) bilden bewusst einen Kontrast: Mittelstand nach IfM gegenüber Konzernstruktur.</td>
<td class="grenze">n = 2, nicht repräsentativ; Selbstauskunft; beide stehen mir persönlich nahe (Arbeitgeber, Vater). TLT ist nach EU- und IfM-Definition formal kein KMU. Beide sind mit Name, Funktion und Unternehmen einverstanden.</td></tr>
</tbody></table>

<h2><span class="nr">6</span> Bewusst nicht verwendet</h2>
<ul>{verworfen}</ul>

<h2><span class="nr">7</span> Grenzen der Quellenlage</h2>
<ul>{grenzen}</ul>

<h2><span class="nr">8</span> Vollständiges Verzeichnis</h2>
<p class="leise">Alle Quellen abgerufen und geprüft am 27. und 28. Oktober 2026. Nummern wie auf den Folien.</p>
<ul class="verzeichnis">{verzeichnis}</ul>
</main></body></html>
'''


if __name__ == '__main__':
    ZIEL.write_text(baue(), encoding='utf-8')
    print('geschrieben:', ZIEL)
