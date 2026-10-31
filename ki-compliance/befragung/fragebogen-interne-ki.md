# Fragebogen an die interne SimpleAct-KI

Stand: 31.10.2026 · für den Vortrag „KI-Compliance im KMU: der EU AI Act“ (Plan: `../PLAN.md`)

## So benutzt du diesen Fragebogen (für Yannick)

1. Alles ab der Linie „KOPIEREN AB HIER“ in die interne KI mit Zugriff auf Codebase und Rechtslogik einfügen.
2. Ist die Antwort zu lang, in drei Runden fragen: erst Teil A bis C, dann Teil D, dann Teil E bis H
   (jeweils mit dem Kontext- und Regelblock davor).
3. Die Antworten **nicht ins Repo legen** (Repo und GitHub Pages sind öffentlich), sondern mir im Chat geben.
   Ins Repo kommt nur, was Kamill freigibt.
4. Teil B2 (Entscheidungsbaum als JSON) ist das wichtigste Stück: daraus baue ich den Klassifizierer.

---

KOPIEREN AB HIER

## Kontext

Ich bin Yannick, Werkstudent bei SimpleAct, und halte an der Hochschule Kaiserslautern (Studiengang
Mittelstandsökonomie, Modul „Management im KMU“) einen Vortrag über den EU AI Act und die Herausforderungen für KMU.
Herzstück ist ein vereinfachter, klickbarer Entscheidungsbaum, der zeigt, wie ein KI-Einsatz klassifiziert wird.
Er soll auf unserer Prüflogik beruhen. Publikum: Studierende ohne juristisches Vorwissen, viele mit Nebenjob in KMU.
Der Vortrag wird **öffentlich im Web** gehostet.

## Regeln für deine Antworten

1. **Quellen kennzeichnen.** Setze hinter jede Aussage eine Marke:
   `[CODE]` = so in unserer Codebase oder Rechtslogik abgebildet ·
   `[RECHT]` = direkt aus dem Rechtstext (mit Artikel, Absatz, Buchstabe) ·
   `[EINSCHÄTZUNG]` = deine Auslegung, nicht im Code abgebildet.
2. **Nichts Geheimes.** Keine Quellcode-Auszüge, keine Datei- oder Repo-Namen, keine internen URLs, keine Schlüssel,
   keine Kunden- oder Personendaten, keine Preise. Beschreibe die Logik in Worten.
3. **Vertraulichkeit je Antwort.** Markiere jede Antwort mit `[ÖFFENTLICH OK]`, `[NUR INTERN]` oder `[UNSICHER]`.
4. **Nicht raten.** Steht etwas nicht in der Codebase, schreibe „nicht abgebildet“ und gib, falls sinnvoll, eine
   `[EINSCHÄTZUNG]`.
5. **Rechtsstand nennen.** Gib an, auf welchem Stand (Datum, Fassung) die Logik ist.
6. **Format.** Markdown, Frage-IDs (A1, B2 …) beibehalten, Teil B2 als JSON-Block. Kurz und präzise, Tabellen erwünscht.

## Teil A: Rechtsstand

- **A1** Welche Fassung des AI Act (VO (EU) 2024/1689) bildet die Logik ab? Ist der Digital-Omnibus eingearbeitet?
  Wenn ja: Nummer der Änderungsverordnung, Datum des Inkrafttretens, was genau übernommen wurde.
- **A2** Welche Geltungstermine verwendet die Logik? Tabelle: Pflichtenblock | Artikel | gilt ab | ursprünglicher
  Termin (falls durch den Omnibus verschoben).
- **A3** Welche Leitlinien, delegierten Rechtsakte, Normen oder Verhaltenskodizes sind berücksichtigt (z. B. Leitlinien
  der Kommission zur Definition des KI-Systems, zu verbotenen Praktiken, zu GPAI, zur Hochrisiko-Einstufung nach Art. 6;
  GPAI-Code of Practice; harmonisierte Normen)? Mit Datum.
- **A4** Nationale Umsetzung in Deutschland: Welche Behörden und welches Durchführungsgesetz (Stand) sind abgebildet?
- **A5** Was hat sich durch den Omnibus speziell für KMU geändert (auch „kleine Midcaps“)? Tabelle: vorher | nachher |
  Artikel.

## Teil B: Prüflogik

- **B1** Beschreibe die Prüfreihenfolge in Worten, vom ersten Schritt („Ist es ein KI-System?“) bis zum Ergebnis.
  Welche Schritte gibt es, in welcher Reihenfolge, und warum diese Reihenfolge?
- **B2** Liefere eine **vereinfachte Fassung als JSON** nach dem Schema unten. Ziel: rechtlich korrekt, aber für Laien
  verständlich, **höchstens 25 Fragen-Knoten**, Ja/Nein-Fragen bevorzugt. Jeder Knoten mit Rechtsgrundlage und einem
  erklärenden Satz in Alltagssprache. Mehrfachtreffer (z. B. Hochrisiko und zusätzlich Transparenz) bitte abbilden.

  ```json
  {
    "stand": "JJJJ-MM-TT",
    "rechtsstand": "VO (EU) 2024/1689 in der Fassung …",
    "start": "K1",
    "knoten": [
      {
        "id": "K1",
        "frage": "Leitet das System aus Eingaben ab, wie es Ausgaben wie Vorhersagen, Inhalte, Empfehlungen oder Entscheidungen erzeugt?",
        "erklaerung": "Ein Satz in Alltagssprache, z. B. Abgrenzung zu festen Wenn-Dann-Regeln.",
        "rechtsgrundlage": ["Art. 3 Nr. 1"],
        "antworten": [
          { "text": "Ja", "weiter": "K2" },
          { "text": "Nein", "ergebnis": "E-KEIN-KI" }
        ]
      }
    ],
    "ergebnisse": [
      {
        "id": "E-KEIN-KI",
        "klasse": "kein KI-System | außerhalb des Anwendungsbereichs | verboten | hochriskant | Transparenz | minimal | GPAI",
        "titel": "Kurzer Titel",
        "satz": "Ein Satz für das Publikum.",
        "pflichten": [ { "text": "Pflicht in Alltagssprache", "artikel": "Art. …", "ab": "JJJJ-MM-TT" } ],
        "weitere_pruefung": ["K…"]
      }
    ]
  }
  ```

- **B3** „Logik in Zahlen“: Wie viele Fragen, Ergebnisse, abgebildete Artikel und Anhang-Nummern hat die
  **vollständige** Logik? Was hast du für B2 weggelassen oder zusammengefasst?
- **B4** Prüfung „KI-System“ (Art. 3 Nr. 1): Welche Merkmale werden abgefragt? Wie werden regelbasierte Systeme,
  Excel-Formeln und klassische Statistik abgegrenzt?
- **B5** Anwendungsbereich (Art. 2): Welche Ausnahmen werden geprüft (z. B. rein persönliche Nutzung, Forschung,
  Militär, Open Source)?
- **B6** Rollen: Wie werden Anbieter, Betreiber, Einführer, Händler und Produkthersteller bestimmt? Wie ist der
  Rollenwechsel nach Art. 25 abgebildet? Was gilt für ein KMU, das ein eigenes Produkt auf einer GPAI-API (z. B. ein
  großes Sprachmodell) aufbaut und verkauft?
- **B7** Verbote (Art. 5): Welche Fragen stellt die Logik, welche Ausnahmen sind abgebildet (z. B. Emotionserkennung aus
  medizinischen oder Sicherheitsgründen)?
- **B8** Hochrisiko: Welche Rechtsakte aus Anhang I sind abgebildet? Sind alle Nummern aus Anhang III abgebildet? Wie
  sind der Filter nach Art. 6 Abs. 3, die Profiling-Sperre und die Dokumentations- bzw. Registrierungspflicht für
  ausgenommene Systeme (Art. 6 Abs. 4, Art. 49 Abs. 2, Stand nach Omnibus) umgesetzt?
- **B9** Transparenz (Art. 50): Welche Fälle, und wer ist jeweils verpflichtet (Anbieter oder Betreiber)? Gibt es
  Übergangsfristen?
- **B10** GPAI: Wann wird ein KMU selbst zum Anbieter eines GPAI-Modells (z. B. durch Fine-Tuning)? Welche Schwelle
  verwendet die Logik?
- **B11** Kombinationen: Kann ein System mehrere Klassen gleichzeitig haben? Wie gibt die Logik das aus?
- **B12** Unsicherheit: Wie geht die Logik mit unklaren Fällen um (eigenes Ergebnis „prüfbedürftig“, Empfehlung zur
  Rechtsberatung, Warnhinweise)?

## Teil C: Pflichten

- **C1** Welche Pflichten gibt die Logik je Ergebnis und Rolle aus? Tabelle mit Artikel und Geltungstermin, mindestens
  für: Hochrisiko-Anbieter, Hochrisiko-Betreiber, Transparenz-Anbieter, Transparenz-Betreiber, minimales Risiko,
  GPAI-Anbieter, Pflichten für alle (Art. 4).
- **C2** Ein KMU mit 50 Beschäftigten kauft ein Hochrisiko-HR-Tool ein und setzt es nur ein. Was muss es praktisch tun?
  Checkliste mit höchstens zehn Punkten, je mit Artikel.
- **C3** Art. 4 (KI-Kompetenz) nach aktuellem Stand: Was genau wird verlangt, wer ist verpflichtet, wie wird es
  dokumentiert?
- **C4** Welche Erleichterungen für KMU sind abgebildet (z. B. Art. 11 Abs. 1, Art. 17 Abs. 2, Art. 58, Art. 62,
  Art. 63, Art. 99 Abs. 6, Omnibus)?
- **C5** Bußgelder: Welche Stufen bildet die Logik ab, und wie wird die KMU-Regel angewendet?

## Teil D: Fallbeispiele

Prüfe jeden Fall mit unserer Logik. Rahmen: ein fiktiver Metallbau-Betrieb mit 60 Beschäftigten in Deutschland
(Fall D12 ist ein eigener kleiner Finanzierungsvermittler).

| Fall | Beschreibung |
|---|---|
| D1 | Der Vertrieb nutzt ChatGPT (Team-Lizenz) für Angebotstexte und E-Mails. |
| D2 | Der Betrieb baut selbst einen Chatbot für die Website über eine LLM-API; er beantwortet Kundenfragen und vereinbart Termine. |
| D3 | Wie D2, aber der Chatbot ist als fertige SaaS eines Anbieters eingekauft und nur auf der Website eingebettet. |
| D4 | Eine eingekaufte Bewerbermanagement-Software bewertet Bewerbungen, erstellt ein Ranking und sortiert unpassende automatisch aus. |
| D5 | Dieselbe Software, aber nur mit der Funktion „Vollständigkeit der Unterlagen prüfen“ (keine Bewertung, kein Ranking). |
| D6 | Eine Software analysiert per Mikrofon und Webcam die Stimmung der Beschäftigten im Kundenservice und fließt in die Leistungsbewertung ein. |
| D7 | Dieselbe Emotionsanalyse, aber nur auf die Anrufenden (Kunden) gerichtet, um eskalierende Gespräche zu erkennen. |
| D8 | Eine KI-Kamera erkennt in der Endkontrolle Kratzer an Bauteilen. |
| D9 | Der Betrieb baut in die Maschinen, die er verkauft, eine KI-Personenerkennung als Sicherheitsfunktion ein (Not-Stopp, wenn ein Mensch den Gefahrenbereich betritt). |
| D10 | Das Marketing erstellt mit KI ein Werbevideo mit einem realistisch wirkenden Sprecher, den es nicht gibt. |
| D11 | Eine KI-Schichtplanung weist Beschäftigten Aufgaben anhand ihrer individuellen Leistungsdaten zu. |
| D12 | Ein kleiner Leasing- und Finanzierungsvermittler bewertet mit KI die Bonität von Privatkunden. |
| D13 | Eine Excel-Tabelle mit festen Formeln und Wenn-Dann-Regeln kalkuliert Angebote. |
| D14 | Der Betrieb feintunt ein Open-Source-Sprachmodell mit eigenen Daten und bietet es Kunden als Produkt an. |

**Antwortformat je Fall:**

- Klasse(n): kein KI-System · außerhalb des Anwendungsbereichs · verboten · hochriskant · Transparenz · minimal · GPAI
- Rolle des Betriebs
- Prüfpfad: Knoten-IDs aus B2 (z. B. K1 → K2 → K7 → E-HR)
- Rechtsgrundlagen
- Wichtigste Pflichten (höchstens fünf, mit Artikel und Geltungstermin)
- Eindeutigkeit: eindeutig oder auslegungsbedürftig (mit Begründung)
- Merksatz für das Publikum (ein Satz)

## Teil E: Grenzfälle und Auslegung

- **E1** Welches sind die fünf schwierigsten Auslegungsfragen in unserer Logik? Wie haben wir entschieden, und warum?
- **E2** Welche Fehleinschätzungen machen Nutzer am häufigsten (soweit aus Logik, Hilfetexten oder Warnhinweisen
  erkennbar)?
- **E3** Drei Beispiele „gleiche Technik, andere Klasse“, bei denen ein einziges Detail entscheidet (z. B.
  Arbeitsplatz oder nicht, Profiling oder nicht, realistisch oder nicht).

## Teil F: Praxis und KMU-Sicht

- **F1** Welche Einsatzfälle sind als Vorlagen oder Beispiele im Produkt hinterlegt (Liste, ohne Kundenbezug)?
- **F2** Gibt es **aggregierte, anonyme** Auswertungen (z. B. Verteilung der Risikoklassen über alle Klassifizierungen)?
  Nur nennen, wenn sie ohne Personen- oder Kundenbezug sind; sonst „nicht verfügbar“.
- **F3** Wo brauchen KMU laut Produktlogik (Onboarding, Hilfetexte, häufig genutzte Erklärungen) die meiste Hilfe?
- **F4** Mit wie viel Zeit rechnet das Produkt für Inventar und Klassifizierung eines typischen KMU? Falls nicht
  hinterlegt: `[EINSCHÄTZUNG]`.
- **F5** Wie unterstützt die Software den Ablauf Inventar → Klassifizierung → Pflichten → Dokumentation → Überwachung?
  Sachlich in Worten, ohne Werbesprache.

## Teil G: Schnittstelle zur DSGVO

- **G1** Wo greifen AI Act und DSGVO beim selben Einsatz ineinander (z. B. Datenschutz-Folgenabschätzung und
  Grundrechte-Folgenabschätzung nach Art. 27, Art. 22 DSGVO, Art. 26 Abs. 9 AI Act)? Tabelle.
- **G2** Ein typischer KMU-Fall, in dem die DSGVO strenger ist als der AI Act, und einer, in dem es umgekehrt ist.

## Teil H: Gegencheck meiner Kernaussagen

Bewerte jede Aussage mit **richtig**, **ungenau** oder **falsch**, nenne bei „ungenau“ oder „falsch“ die korrekte
Fassung mit Artikel. Diese Aussagen sollen so auf die Folien.

| Nr. | Aussage |
|---|---|
| H1 | Der AI Act ist am 1.8.2024 in Kraft getreten. |
| H2 | Die Verbote (Art. 5) und die Pflicht zur KI-Kompetenz (Art. 4) gelten seit dem 2.2.2025. |
| H3 | Die Pflichten für Anbieter von GPAI-Modellen und die Sanktionsvorschriften gelten seit dem 2.8.2025. |
| H4 | Durch den Digital-Omnibus gelten die Hochrisiko-Pflichten nach Anhang III spätestens ab dem 2.12.2027, nach Anhang I spätestens ab dem 2.8.2028. |
| H5 | Art. 4 verlangt seit dem Omnibus Maßnahmen zur Förderung der KI-Kompetenz, aber kein bestimmtes Kompetenzniveau (VO (EU) 2026/1744, in Kraft seit 27.07.2026). |
| H6 | Emotionserkennung am Arbeitsplatz und in Bildungseinrichtungen ist verboten, außer aus medizinischen oder Sicherheitsgründen (Art. 5 Abs. 1 lit. f). |
| H7 | Ein Tool, das Bewerbungen filtert, bewertet oder rankt, ist hochriskant (Anhang III Nr. 4 lit. a). |
| H8 | Ein System aus Anhang III ist nicht hochriskant, wenn eine Ausnahme nach Art. 6 Abs. 3 greift, außer es führt ein Profiling natürlicher Personen durch. |
| H9 | Ein KMU, das ein Hochrisiko-System nur einsetzt, ist Betreiber und muss u. a. menschliche Aufsicht sicherstellen, Protokolle mindestens sechs Monate aufbewahren und Beschäftigte vor dem Einsatz am Arbeitsplatz informieren (Art. 26). |
| H10 | Ein Betreiber wird zum Anbieter, wenn er ein Hochrisiko-System unter eigenem Namen vertreibt, wesentlich ändert oder die Zweckbestimmung so ändert, dass es hochriskant wird (Art. 25 Abs. 1). |
| H11 | Wer einen Chatbot anbietet, muss ihn so gestalten, dass Menschen erfahren, dass sie mit einer KI sprechen (Art. 50 Abs. 1). |
| H12 | Wer Deepfakes einsetzt, muss offenlegen, dass sie künstlich erzeugt sind (Art. 50 Abs. 4). |
| H13 | Höchstbußgelder: 35 Mio. € oder 7 %, 15 Mio. € oder 3 %, 7,5 Mio. € oder 1 % des weltweiten Jahresumsatzes; für KMU gilt jeweils der niedrigere Betrag (Art. 99 Abs. 6). |
| H14 | KMU mit Sitz in der EU erhalten vorrangigen und kostenlosen Zugang zu KI-Reallaboren (Art. 62 Abs. 1 lit. a, Art. 58). |
| H15 | KMU einschließlich Start-ups dürfen die technische Dokumentation in vereinfachter Form bereitstellen (Art. 11 Abs. 1). |
| H16 | Ein GPAI-Modell hat vermutlich systemisches Risiko ab einem Trainingsrechenaufwand von mehr als 10^25 FLOP (Art. 51 Abs. 2). |
| H17 | Wer ein GPAI-Modell nur per API nutzt, ist kein GPAI-Anbieter; wer es mit mehr als einem Drittel des ursprünglichen Trainingsrechenaufwands verändert, gilt als Anbieter des veränderten Modells (Leitlinien der Kommission). |
| H18 | In Deutschland ist die Bundesnetzagentur die zentrale Marktüberwachungsbehörde für den AI Act. |
| H19 | Eine KI-Kamera zur Qualitätskontrolle ist minimales Risiko; als Sicherheitsbauteil einer Maschine kann sie über Anhang I hochriskant sein. |
| H20 | Die Bewertung der Kreditwürdigkeit natürlicher Personen ist hochriskant (Anhang III Nr. 5 lit. b), die Erkennung von Finanzbetrug ist davon ausgenommen. |

## Abschluss

- **X1** Was sollte in einem Hochschulvortrag über AI Act und KMU unbedingt vorkommen, das ich nicht gefragt habe?
- **X2** Welche Begriffe verwenden wir im Produkt anders als der Gesetzestext (z. B. „Betreiber“ statt „Nutzer“)?
  Damit Folien und Prüflogik dieselbe Sprache sprechen.
