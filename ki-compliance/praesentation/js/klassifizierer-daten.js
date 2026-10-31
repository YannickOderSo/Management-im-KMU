/* =============================================================================
   klassifizierer-daten.js – DIE PRÜFLOGIK (einzige Quelle für Folien und
   Handy-Seite klassifizierer.html)
   -----------------------------------------------------------------------------
   Vereinfachter Entscheidungsbaum nach der Prüflogik von SimpleAct
   (Regelwerk 3.0 vom 14.10.2026: 29 Fragen zur Risikoprüfung, 4 zur Rolle),
   für den Vortrag zusammengefasst auf 16 Fragen und 13 Ergebnisse.
   K1 (KI-Definition), K2 (Ausnahmen), K5 (medizinische Ausnahme) und K11
   (Anhang I Abschnitt A/B) sind für den Vortrag ergänzt; die Prüflogik fragt
   sie so nicht ab. Rechtsstand: VO (EU) 2024/1689 in der Fassung der
   VO (EU) 2026/1744 (Digital-Omnibus KI), Stand 31.10.2026.
   KEINE RECHTSBERATUNG.

   Lesehilfe
   • knoten: Ja/Nein-Fragen. „weiter“ = nächste Frage, „ergebnis“ = Treffer.
   • Ergebnisse mit „weitere_pruefung“ beenden die Prüfung nicht: Transparenz
     gilt zusätzlich zu Hochrisiko (Rangfolge verboten > hochriskant >
     Transparenz > minimal). „Minimal“ gilt nur, wenn vorher kein anderes
     Ergebnis erreicht wurde.
   • kurz: Beschriftung im Baum auf der Folie (höchstens zwei Zeilen).
   • spalte: Prüfstufe auf der Folie (1 Anwendbar · 2 Verbote · 3 Hochrisiko ·
     4 Transparenz · 5 GPAI).
   • klasse (Ergebnis): Farbe und Form – verboten, hoch, ausnahme,
     transparenz, minimal, gpai, kein.
   • pflichten: text/artikel = vollständig (Handy-Seite), kurz/art = Feld auf
     der Folie; optional = nur unter Umständen (auf der Folie ausgeblendet),
     nebensache = Art. 4 (steht auf der Folie zuletzt).
   • faelle: vorbereitete Fälle für die Vorführung (Antwort je Frage).
   ============================================================================= */
window.KLASSIFIZIERER = {
  stand: '2026-10-31',
  rechtsstand: 'VO (EU) 2024/1689 in der Fassung der VO (EU) 2026/1744 (Digital-Omnibus KI, in Kraft seit 27.07.2026)',
  start: 'K1',

  spalten: [
    { nr: 1, name: 'Anwendbar?', klasse: 'kein' },
    { nr: 2, name: 'Verboten?', klasse: 'verboten' },
    { nr: 3, name: 'Hochriskant?', klasse: 'hoch' },
    { nr: 4, name: 'Transparenz?', klasse: 'transparenz' },
    { nr: 5, name: 'Eigenes Modell?', klasse: 'gpai' }
  ],

  knoten: [
    {
      id: 'K1', spalte: 1,
      kurz: 'Ist es ein KI-System?',
      frage: 'Leitet das System aus Eingaben ab, wie es Ausgaben wie Vorhersagen, Inhalte, Empfehlungen oder Entscheidungen erzeugt, und arbeitet es dabei mit einem gewissen Grad an Autonomie?',
      erklaerung: 'Feste Wenn-Dann-Regeln und Excel-Formeln, die ein Mensch vollständig vorgibt, sind in der Regel keine KI. Lernende Systeme, Sprachmodelle und Bilderkennung sind es.',
      rechtsgrundlage: ['Art. 3 Nr. 1'],
      antworten: [{ text: 'Ja', weiter: 'K2' }, { text: 'Nein', ergebnis: 'E-KEIN-KI' }]
    },
    {
      id: 'K2', spalte: 1,
      kurz: 'Nur Militär, Forschung, privat?',
      frage: 'Wird das System ausschließlich für Militär oder nationale Sicherheit, ausschließlich für wissenschaftliche Forschung oder von einer Privatperson rein privat (nicht beruflich) genutzt?',
      erklaerung: 'Wer KI im Betrieb einsetzt, fällt nicht unter diese Ausnahmen. Die Privat-Ausnahme gilt nur für Menschen, die KI für sich selbst nutzen, nicht für Anbieter.',
      rechtsgrundlage: ['Art. 2 Abs. 3, 6, 10'],
      antworten: [{ text: 'Ja', ergebnis: 'E-AUSSERHALB' }, { text: 'Nein', weiter: 'K3' }]
    },
    {
      id: 'K3', spalte: 2,
      kurz: 'Manipulation, Social Scoring?',
      frage: 'Soll das System Menschen unterschwellig, manipulativ oder täuschend beeinflussen oder Schwächen (Alter, Behinderung, soziale oder wirtschaftliche Lage) ausnutzen, sodass ihnen erheblicher Schaden droht, oder Menschen nach ihrem Sozialverhalten oder ihren Persönlichkeitsmerkmalen bewerten und sie dadurch in sachfremden Zusammenhängen oder unverhältnismäßig benachteiligen?',
      erklaerung: 'Manipulation, Ausnutzen von Schwächen und Social Scoring sind verboten.',
      rechtsgrundlage: ['Art. 5 Abs. 1 lit. a–c'],
      antworten: [{ text: 'Ja', ergebnis: 'E-VERBOTEN' }, { text: 'Nein', weiter: 'K4' }]
    },
    {
      id: 'K4', spalte: 2,
      kurz: 'Emotionen am Arbeitsplatz?',
      frage: 'Erkennt das System anhand biometrischer Daten (z. B. Stimme, Gesicht) die Emotionen von Menschen am Arbeitsplatz oder in einer Bildungseinrichtung?',
      erklaerung: 'Stimmungsanalyse bei Beschäftigten oder Lernenden ist grundsätzlich verboten. Reine Textauswertung ist nach den Leitlinien der Kommission keine Emotionserkennung im Sinne des Gesetzes; Mimik, Stimme und Tippverhalten zählen dagegen als biometrisch.',
      rechtsgrundlage: ['Art. 5 Abs. 1 lit. f', 'Art. 3 Nr. 39'],
      antworten: [{ text: 'Ja', weiter: 'K5' }, { text: 'Nein', weiter: 'K6' }]
    },
    {
      id: 'K5', spalte: 2,
      kurz: 'Nur Medizin oder Sicherheit?',
      frage: 'Dient diese Emotionserkennung ausschließlich medizinischen Zwecken oder der Sicherheit?',
      erklaerung: 'Nur dann greift die eng auszulegende Ausnahme vom Verbot. Das System wird danach weiter geprüft. Wohlbefinden, Stress oder Motivation zählen nicht als medizinisch.',
      rechtsgrundlage: ['Art. 5 Abs. 1 lit. f'],
      antworten: [{ text: 'Ja', weiter: 'K6' }, { text: 'Nein', ergebnis: 'E-VERBOTEN' }]
    },
    {
      id: 'K6', spalte: 2,
      kurz: 'Anderes Verbot, z. B. Biometrie?',
      frage: 'Sortiert das System Menschen per Biometrie nach Herkunft, politischer Meinung, Gewerkschaftszugehörigkeit, Religion oder Weltanschauung, Sexualleben oder sexueller Ausrichtung, baut es Gesichtsdatenbanken durch massenhaftes Auslesen auf, sagt es Straftaten allein aus Persönlichkeitsmerkmalen voraus, identifiziert es Menschen live per Biometrie im öffentlichen Raum für die Strafverfolgung oder erzeugt es realistische intime Darstellungen bestimmbarer Personen ohne deren Zustimmung bzw. Darstellungen sexuellen Kindesmissbrauchs?',
      erklaerung: 'Alles verboten. Die beiden letzten Fälle sind neue Verbote ab 2.12.2026; sie greifen, wenn solche Inhalte Zweck des Systems sind oder ohne zumutbare Schutzvorkehrungen absehbar entstehen.',
      rechtsgrundlage: ['Art. 5 Abs. 1 lit. ba, bb, d, e, g, h'],
      antworten: [{ text: 'Ja', ergebnis: 'E-VERBOTEN' }, { text: 'Nein', weiter: 'K7' }]
    },
    {
      id: 'K7', spalte: 3,
      kurz: 'Sicherheitsbauteil eines Produkts?',
      frage: 'Ist das System ein Sicherheitsbauteil eines Produkts aus der EU-Produktgesetzgebung (z. B. Maschine, Spielzeug, Aufzug, Medizinprodukt) oder selbst ein solches Produkt, und muss das Produkt von einer unabhängigen Stelle geprüft werden?',
      erklaerung: 'Beides muss zutreffen. Reine Qualitätskontrolle ist kein Sicherheitsbauteil, außer ihr Ausfall würde Gesundheit oder Sicherheit gefährden. Eine Drittprüfung nur wegen Funk- oder EMV-Risiken zählt nicht.',
      rechtsgrundlage: ['Art. 6 Abs. 1, 1a–1c', 'Anhang I'],
      antworten: [{ text: 'Ja', weiter: 'K11' }, { text: 'Nein', weiter: 'K8' }]
    },
    {
      id: 'K11', spalte: 3,
      kurz: 'Maschine oder Fahrzeug?',
      frage: 'Ist das Produkt eine Maschine, ein Fahrzeug (Kfz, Zwei-/Dreirad, Land-/Forstwirtschaft), ein Luftfahrzeug oder Luftsicherheitsgerät, Schiffsausrüstung oder Eisenbahntechnik (Anhang I Abschnitt B)?',
      erklaerung: 'Für diese Produkte gelten die Hochrisiko-Anforderungen nicht direkt aus dem AI Act, sondern über das jeweilige Produktrecht. Maschinen stehen seit dem Digital-Omnibus hier; ihre KI-Anforderungen kommen über delegierte Rechtsakte zur Maschinenverordnung ab 2.8.2028.',
      rechtsgrundlage: ['Art. 2 Abs. 2', 'Anhang I Abschn. B'],
      antworten: [{ text: 'Ja', ergebnis: 'E-HOCH-I-B' }, { text: 'Nein', ergebnis: 'E-HOCH-I-A' }]
    },
    {
      id: 'K8', spalte: 3,
      kurz: 'Hochrisiko-Zweck, z. B. Personal?',
      frage: 'Wird das System für einen der Zwecke aus Anhang III eingesetzt (Biometrie einschließlich Emotionserkennung, kritische Infrastruktur, Bildung, Beschäftigung und Personal, Zugang zu wesentlichen Diensten wie Kredit oder Lebens- und Krankenversicherung, Strafverfolgung, Migration, Justiz und Wahlen)?',
      erklaerung: 'Beispiele: Bewerbungen filtern oder bewerten, Aufgaben nach Leistungsdaten zuweisen, Bonität von Privatpersonen bewerten.',
      rechtsgrundlage: ['Art. 6 Abs. 2', 'Anhang III'],
      antworten: [{ text: 'Ja', weiter: 'K9' }, { text: 'Nein', weiter: 'K12' }]
    },
    {
      id: 'K9', spalte: 3,
      kurz: 'Profiling von Menschen?',
      frage: 'Bewertet das System automatisch persönliche Aspekte natürlicher Personen (Profiling, z. B. Arbeitsleistung, wirtschaftliche Lage, Verhalten)?',
      erklaerung: 'Wer Menschen automatisch bewertet, kann die Ausnahme der nächsten Frage nicht nutzen.',
      rechtsgrundlage: ['Art. 6 Abs. 3 UAbs. 3'],
      antworten: [{ text: 'Ja', ergebnis: 'E-HOCH-III' }, { text: 'Nein', weiter: 'K10' }]
    },
    {
      id: 'K10', spalte: 3,
      kurz: 'Nur Hilfsaufgabe ohne Risiko?',
      frage: 'Erledigt das System nur eine eng begrenzte Verfahrensaufgabe, verbessert es nur das Ergebnis einer abgeschlossenen menschlichen Tätigkeit, erkennt es nur Abweichungen, ohne die menschliche Bewertung zu ersetzen, oder bereitet es nur eine Bewertung vor, und besteht dadurch kein erhebliches Risiko?',
      erklaerung: 'Nur bei einem klaren Ja. Im Zweifel gilt: hochriskant.',
      rechtsgrundlage: ['Art. 6 Abs. 3, 4'],
      antworten: [{ text: 'Ja', ergebnis: 'E-HOCH-III-AUSNAHME' }, { text: 'Nein', ergebnis: 'E-HOCH-III' }]
    },
    {
      id: 'K12', spalte: 4,
      kurz: 'Spricht es mit Menschen?',
      frage: 'Ist das System dafür gemacht, direkt mit Menschen zu kommunizieren (z. B. Chatbot, Sprachassistent)?',
      erklaerung: 'Der Anbieter muss es so gestalten, dass Menschen erfahren, dass sie mit einer KI sprechen, außer es ist offensichtlich.',
      rechtsgrundlage: ['Art. 50 Abs. 1'],
      antworten: [{ text: 'Ja', ergebnis: 'E-TRANSP-INTERAKTION', weitere_pruefung: ['K13'] }, { text: 'Nein', weiter: 'K13' }]
    },
    {
      id: 'K13', spalte: 4,
      kurz: 'Eigener Generator für Inhalte?',
      frage: 'Bieten Sie selbst ein System an, das Text, Bilder, Audio oder Video erzeugt?',
      erklaerung: 'Anbieter müssen solche Ausgaben maschinenlesbar als KI-erzeugt kennzeichnen. Wer ein fremdes Tool nur nutzt, hat diese Pflicht nicht.',
      rechtsgrundlage: ['Art. 50 Abs. 2'],
      antworten: [{ text: 'Ja', ergebnis: 'E-TRANSP-INHALT', weitere_pruefung: ['K14'] }, { text: 'Nein', weiter: 'K14' }]
    },
    {
      id: 'K14', spalte: 4,
      kurz: 'Emotionen per Biometrie?',
      frage: 'Erkennt das System anhand biometrischer Daten Emotionen von Menschen oder ordnet es Menschen per Biometrie Kategorien zu?',
      erklaerung: 'Wer so ein System einsetzt, muss die betroffenen Personen informieren. Emotionserkennung ist zusätzlich ein Hochrisiko-Zweck.',
      rechtsgrundlage: ['Art. 50 Abs. 3', 'Art. 3 Nr. 39'],
      antworten: [{ text: 'Ja', ergebnis: 'E-TRANSP-EMOTION', weitere_pruefung: ['K15'] }, { text: 'Nein', weiter: 'K15' }]
    },
    {
      id: 'K15', spalte: 4,
      kurz: 'Deepfake oder KI-Nachricht?',
      frage: 'Erzeugen Sie mit dem System Bilder, Ton oder Videos, die echten Personen, Gegenständen, Orten, Einrichtungen oder Ereignissen ähneln und fälschlich echt wirken (Deepfake), oder veröffentlichen Sie damit Texte, die über Themen von öffentlichem Interesse informieren, ohne dass ein Mensch sie redaktionell verantwortet?',
      erklaerung: 'Dann muss offengelegt werden, dass der Inhalt künstlich erzeugt ist. Eine frei erfundene Figur ist für sich noch kein Deepfake.',
      rechtsgrundlage: ['Art. 50 Abs. 4', 'Art. 3 Nr. 60'],
      antworten: [{ text: 'Ja', ergebnis: 'E-TRANSP-DEEPFAKE', weitere_pruefung: ['K16'] }, { text: 'Nein', weiter: 'K16' }]
    },
    {
      id: 'K16', spalte: 5,
      kurz: 'Eigenes KI-Modell (GPAI)?',
      frage: 'Bringen Sie selbst ein KI-Modell mit allgemeinem Verwendungszweck (z. B. ein Sprachmodell) in Verkehr, das Sie entwickelt oder erheblich verändert haben?',
      erklaerung: 'Wer ein Modell nur über eine Schnittstelle nutzt oder leicht anpasst, ist kein Modell-Anbieter. Wer es mit erheblichem eigenem Rechenaufwand verändert, kann es werden.',
      rechtsgrundlage: ['Art. 3 Nr. 63', 'Art. 51–53'],
      antworten: [{ text: 'Ja', ergebnis: 'E-GPAI' }, { text: 'Nein', ergebnis: 'E-MINIMAL' }]
    }
  ],

  ergebnisse: [
    { id: 'E-KEIN-KI', klasse: 'kein', titel: 'Kein KI-System', kurz: 'keine KI',
      satz: 'Feste Regeln und Formeln sind keine KI im Sinne des AI Act; er greift hier nicht.',
      pflichten: [], weitere_pruefung: [] },
    { id: 'E-AUSSERHALB', klasse: 'kein', titel: 'Außerhalb des Anwendungsbereichs', kurz: 'außerhalb',
      satz: 'Rein militärische, rein wissenschaftliche oder rein private Nutzung ist ausgenommen.',
      pflichten: [], weitere_pruefung: [] },
    { id: 'E-VERBOTEN', klasse: 'verboten', titel: 'Verbotene Praxis', kurz: 'verboten',
      satz: 'So darf das System weder angeboten noch eingesetzt werden.',
      pflichten: [
        { text: 'Nicht anbieten, nicht einsetzen', kurz: 'nicht anbieten, nicht einsetzen', art: 'Art. 5', artikel: 'Art. 5', ab: '2025-02-02' },
        { text: 'Neue Verbote: intime Darstellungen ohne Zustimmung, Missbrauchsdarstellungen von Kindern', kurz: 'zwei neue Verbote', art: 'Art. 5', artikel: 'Art. 5 Abs. 1 lit. ba, bb', ab: '2026-12-02', optional: true }
      ], weitere_pruefung: [] },
    { id: 'E-HOCH-I-A', klasse: 'hoch', titel: 'Hochriskant über Produktrecht (Anhang I Abschnitt A)', kurz: 'hochriskant',
      satz: 'Als Sicherheitsbauteil eines prüfpflichtigen Produkts ist das System hochriskant.',
      pflichten: [
        { text: 'Anbieter: Risikomanagement, Datenqualität, technische Dokumentation, Protokollierung, menschliche Aufsicht, Qualitätsmanagement, Konformitätsbewertung', kurz: 'Anbieter: QM, Doku, Prüfung', art: 'Art. 8–17', artikel: 'Art. 8–17, 43', ab: '2028-08-02' },
        { text: 'Betreiber: Einsatz nach Anleitung, menschliche Aufsicht, Protokolle aufbewahren', kurz: 'Aufsicht, Protokolle', art: 'Art. 26', artikel: 'Art. 26', ab: '2028-08-02' },
        { text: 'Alle: KI-Kompetenz unterstützen', kurz: 'KI-Kompetenz unterstützen', art: 'Art. 4', artikel: 'Art. 4', ab: '2025-02-02', nebensache: true }
      ], weitere_pruefung: ['K8'] },
    { id: 'E-HOCH-I-B', klasse: 'hoch', titel: 'Hochriskant über Produktrecht (Anhang I Abschnitt B, z. B. Maschinen)', kurz: 'hochriskant',
      satz: 'Das System ist hochriskant. Die Anforderungen kommen über das jeweilige Produktrecht (bei Maschinen die Maschinenverordnung), nicht direkt aus dem AI Act.',
      pflichten: [
        { text: 'Hersteller: KI-Anforderungen über delegierte Rechtsakte zum Produktrecht (bei Maschinen: Maschinenverordnung)', kurz: 'KI-Anforderungen über Produktrecht', art: 'Art. 2 Abs. 2', artikel: 'Art. 2 Abs. 2, Art. 6 Abs. 1', ab: '2028-08-02' },
        { text: 'Hersteller: Maschinenverordnung einhalten', kurz: 'Maschinenverordnung einhalten', art: 'MVO', artikel: 'VO (EU) 2023/1230', ab: '2027-01-20' }
      ], weitere_pruefung: [],
      hinweis: 'Aus dem AI Act gelten für dieses System nur wenige Vorschriften (Art. 2 Abs. 2).' },
    { id: 'E-HOCH-III', klasse: 'hoch', titel: 'Hochriskant über den Einsatzzweck (Anhang III)', kurz: 'hochriskant',
      satz: 'Das System dient einem Hochrisiko-Zweck und die Ausnahme greift nicht.',
      pflichten: [
        { text: 'Anbieter: Risikomanagement, Datenqualität, technische Dokumentation, Protokollierung, menschliche Aufsicht, Qualitätsmanagement, Konformitätsbewertung, Registrierung', kurz: 'Anbieter: QM, Doku, Prüfung', art: 'Art. 8–17', artikel: 'Art. 8–17, 43, 49 Abs. 1', ab: '2027-12-02' },
        { text: 'Betreiber: Einsatz nach Anleitung, menschliche Aufsicht, Protokolle mindestens 6 Monate, Betroffene informieren; am Arbeitsplatz vorher Beschäftigte und Vertretung informieren', kurz: 'Aufsicht, Protokolle, Info', art: 'Art. 26', artikel: 'Art. 26', ab: '2027-12-02' },
        { text: 'Bestimmte Betreiber (u. a. öffentliche Stellen, Bonität, Lebens- und Krankenversicherung): Grundrechte-Folgenabschätzung vor der ersten Verwendung', kurz: 'ggf. Grundrechte-Folgenabschätzung', art: 'Art. 27', artikel: 'Art. 27 Abs. 1', ab: '2027-12-02', optional: true },
        { text: 'Alle: KI-Kompetenz unterstützen', kurz: 'KI-Kompetenz unterstützen', art: 'Art. 4', artikel: 'Art. 4', ab: '2025-02-02', nebensache: true }
      ], weitere_pruefung: ['K12'] },
    { id: 'E-HOCH-III-AUSNAHME', klasse: 'ausnahme', titel: 'Anhang-III-Zweck, aber Ausnahme', kurz: 'Ausnahme',
      satz: 'Das System gilt nicht als hochriskant. Der Anbieter muss das dokumentieren und registrieren; wer es nur einsetzt, sollte sich diese Einschätzung zeigen lassen.',
      pflichten: [
        { text: 'Anbieter: Einschätzung vor dem Inverkehrbringen dokumentieren', kurz: 'Anbieter dokumentiert die Ausnahme', art: 'Art. 6', artikel: 'Art. 6 Abs. 4', ab: '2027-12-02' },
        { text: 'Anbieter: System in der EU-Datenbank registrieren', kurz: 'Anbieter registriert das System', art: 'Art. 49', artikel: 'Art. 49 Abs. 2', ab: '2027-12-02' },
        { text: 'Alle: KI-Kompetenz unterstützen', kurz: 'KI-Kompetenz unterstützen', art: 'Art. 4', artikel: 'Art. 4', ab: '2025-02-02', nebensache: true }
      ], weitere_pruefung: ['K12'] },
    { id: 'E-TRANSP-INTERAKTION', klasse: 'transparenz', titel: 'Transparenz: Kommunikation mit Menschen', kurz: 'Transparenz',
      satz: 'Menschen müssen erfahren, dass sie mit einer KI sprechen.',
      pflichten: [{ text: 'Anbieter: so gestalten, dass der KI-Charakter erkennbar ist (außer offensichtlich)', kurz: 'als KI erkennbar machen', art: 'Art. 50', artikel: 'Art. 50 Abs. 1', ab: '2026-08-02' }],
      weitere_pruefung: ['K13'] },
    { id: 'E-TRANSP-INHALT', klasse: 'transparenz', titel: 'Transparenz: KI-erzeugte Inhalte', kurz: 'Transparenz',
      satz: 'Wer ein Inhalte erzeugendes System anbietet, kennzeichnet die Ausgaben maschinenlesbar.',
      pflichten: [{ text: 'Anbieter: maschinenlesbare Kennzeichnung (Systeme, die vor dem 2.8.2026 auf dem Markt waren: bis 2.12.2026)', kurz: 'Ausgaben maschinenlesbar markieren', art: 'Art. 50', artikel: 'Art. 50 Abs. 2, Art. 111 Abs. 4', ab: '2026-08-02' }],
      weitere_pruefung: ['K14'] },
    { id: 'E-TRANSP-EMOTION', klasse: 'transparenz', titel: 'Transparenz: Emotionserkennung und biometrische Kategorisierung', kurz: 'Transparenz',
      satz: 'Wer so ein System einsetzt, informiert die betroffenen Personen.',
      pflichten: [{ text: 'Betreiber: Betroffene informieren', kurz: 'Betroffene informieren', art: 'Art. 50', artikel: 'Art. 50 Abs. 3', ab: '2026-08-02' }],
      weitere_pruefung: ['K15'] },
    { id: 'E-TRANSP-DEEPFAKE', klasse: 'transparenz', titel: 'Transparenz: Deepfakes und KI-Texte zu öffentlichen Themen', kurz: 'Transparenz',
      satz: 'Wer so etwas veröffentlicht, legt offen, dass es künstlich erzeugt ist; bei erkennbar künstlerischen oder fiktionalen Werken in eingeschränkter Form.',
      pflichten: [{ text: 'Betreiber: künstliche Erzeugung offenlegen', kurz: 'künstliche Erzeugung offenlegen', art: 'Art. 50', artikel: 'Art. 50 Abs. 4', ab: '2026-08-02' }],
      weitere_pruefung: ['K16'] },
    { id: 'E-GPAI', klasse: 'gpai', titel: 'Anbieter eines KI-Modells mit allgemeinem Verwendungszweck', kurz: 'GPAI',
      satz: 'Eigene oder erheblich veränderte Modelle haben eigene Pflichten, zusätzlich zu allem anderen.',
      pflichten: [
        { text: 'Technische Dokumentation, Informationen für nachgelagerte Anbieter, Urheberrechts-Strategie, Zusammenfassung der Trainingsdaten', kurz: 'Modell-Doku, Urheberrecht, Trainingsdaten', art: 'Art. 53', artikel: 'Art. 53', ab: '2025-08-02' },
        { text: 'Bei systemischem Risiko (vermutet ab mehr als 10^25 FLOP): Meldung an die Kommission und zusätzliche Pflichten', kurz: 'bei systemischem Risiko: mehr Pflichten', art: 'Art. 55', artikel: 'Art. 51, 52, 55', ab: '2025-08-02', optional: true }
      ], weitere_pruefung: [] },
    { id: 'E-MINIMAL', klasse: 'minimal', titel: 'Minimales Risiko', kurz: 'minimal',
      satz: 'Keine besonderen Pflichten außer KI-Kompetenz; freiwillige Verhaltenskodizes sind möglich.',
      pflichten: [{ text: 'Alle: KI-Kompetenz unterstützen', kurz: 'KI-Kompetenz unterstützen', art: 'Art. 4', artikel: 'Art. 4', ab: '2025-02-02', nebensache: true }],
      weitere_pruefung: [], nurWennNichtsAnderes: true }
  ],

  /* Vorbereitete Fälle (Muster Metallbau GmbH, fiktiv, 60 Beschäftigte).
     antworten: Frage → 'Ja' | 'Nein'. Nicht genannte Fragen werden nicht
     erreicht. merksatz: steht im Ergebnisfeld der Folie. */
  faelle: {
    'chatgpt': {
      name: 'ChatGPT für Angebotstexte',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Nein', K8: 'Nein', K12: 'Nein', K13: 'Nein', K14: 'Nein', K15: 'Nein', K16: 'Nein' },
      rolle: 'Betreiber',
      merksatz: 'Wer KI nur benutzt, muss vor allem wissen, was er tut.'
    },
    'chatbot': {
      name: 'Eigener Chatbot auf der Website',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Nein', K8: 'Nein', K12: 'Ja', K13: 'Ja', K14: 'Nein', K15: 'Nein', K16: 'Nein' },
      rolle: 'Anbieter und Betreiber',
      merksatz: 'Wer einen Bot baut, sagt, dass es ein Bot ist.'
    },
    'bewerbung': {
      name: 'Tool bewertet und rankt Bewerbungen',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Nein', K8: 'Ja', K9: 'Ja', K12: 'Nein', K13: 'Nein', K14: 'Nein', K15: 'Nein', K16: 'Nein' },
      rolle: 'Betreiber',
      merksatz: 'Wer Menschen für Jobs sortiert, spielt in der höchsten Liga.'
    },
    'stimmung-team': {
      name: 'Stimmungsanalyse der Beschäftigten',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Ja', K5: 'Nein' },
      rolle: 'Betreiber',
      merksatz: 'Gefühle der Belegschaft sind kein Messwert.'
    },
    'stimmung-anrufe': {
      name: 'Stimmungsanalyse nur bei Anrufenden',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Nein', K8: 'Ja', K9: 'Ja', K12: 'Nein', K13: 'Nein', K14: 'Ja', K15: 'Nein', K16: 'Nein' },
      rolle: 'Betreiber',
      merksatz: 'Verboten im Büro, am Telefon erlaubt, aber nie unsichtbar.'
    },
    'kamera-kratzer': {
      name: 'KI-Kamera erkennt Kratzer',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Nein', K8: 'Nein', K12: 'Nein', K13: 'Nein', K14: 'Nein', K15: 'Nein', K16: 'Nein' },
      rolle: 'Betreiber',
      merksatz: 'Prüft die KI Werkstücke statt Menschen, bleibt es meist ruhig.'
    },
    'kamera-notstopp': {
      name: 'KI-Not-Stopp in der eigenen Maschine',
      antworten: { K1: 'Ja', K2: 'Nein', K3: 'Nein', K4: 'Nein', K6: 'Nein', K7: 'Ja', K11: 'Ja' },
      rolle: 'Hersteller',
      merksatz: 'Sitzt die KI in der Sicherheit, sitzt sie in der Hochrisiko-Klasse.'
    },
    'excel': {
      name: 'Excel mit festen Formeln',
      antworten: { K1: 'Nein' },
      rolle: '–',
      merksatz: 'Rechnet es nur, was du aufgeschrieben hast, ist es keine KI.'
    }
  }
};
