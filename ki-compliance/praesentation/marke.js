/* =============================================================================
   marke.js – ALLE ANGABEN, DIE SICH JE VORTRAG ÄNDERN, STEHEN HIER
   -----------------------------------------------------------------------------
   Vortrag „Welches Risiko hat Ihre KI? Der EU AI Act und was er für KMU
   bedeutet“ (Management im KMU). Engine wie in fuehrung/praesentation und
   recap/…/praesentation (unverändert). name = „KI-Compliance“ (Kopfzeile).

   Regeln
   • Texte stehen in Anführungszeichen '…'. Ein Apostroph im Text: \' schreiben.
   • Nach jedem Eintrag ein Komma.
   • Nach dem Ändern: Seite neu laden (F5), Konsole (F12) muss leer sein.
   ============================================================================= */
window.MARKE = {

  /* 1. THEMA */
  name: 'KI-Compliance',
  kurz: 'KI-Compliance',

  /* 2. FARBEN – Gestaltung „Prüfpfad“: Tinte auf Papier, die Signalfarben
     gehören allein den Risikoklassen (css/folien/ki.css, Abschnitt 2). Die
     Werte hier sind nur der Ausgangspunkt der Engine. */
  farben: {
    primaer: '#14213D',           // Tinte: Schrift, Prüfpfad, Daten
    sekundaer: '#D9570B'          // Orange (hochriskant), nur als Ausgangswert
  },

  /* 3. BILDER – keine Logos, keine fremden Bilder (alles eigene SVG im HTML) */
  logo: '',
  logoTitel: '',
  raetselBild: '',

  /* 4. ANGABEN ZUR PRÄSENTATION */
  titel: 'Management im KMU',
  fallstudie: 'Vortrag',
  veranstaltung: 'Management im KMU',
  dozent: 'Prof. Dr. Christine Arend-Fuchs',
  hochschule: 'Hochschule Kaiserslautern',
  unternehmen: '',
  gruppe: ['Elias Knauber', 'Yannick Heisler'],   // seit 31.10.2026 zu zweit (Aufteilung: LIESMICH.md)
  datum: '2026-11-09',            // Vortrag Mo, 9. November 2026 (Yannick, 31.10.2026)
  rechtsstand: '31.10.2026',      // erscheint auf Titel- und Methodenfolie
  dauerMinuten: 51,               // bis zu einer Stunde, interaktiv (Yannick, 31.10.2026): Sollzeiten 50:45 + Diskussion
  anrede: 'Sie',

  /* 5. LIVE-UMFRAGEN, acht Fragen (Baustein <div class="umfrage" data-umfrage="…">)
     Gleiche Web-App wie im Führungs-Referat (fuehrung/praesentation/
     live-abstimmung/ANLEITUNG.md); sie zählt je Umfrage-Name getrennt.
     VORAUSSETZUNG für den QR-Code: Dieser Ordner liegt auf dem Branch, den
     GitHub Pages zeigt (claude/exciting-meitner-w27zwy). Sonst Plan B:
     Handzeichen, Klick auf die Balken zählt.
     runde: 'probe' für Tests; Vortragsrunde 'vortrag-2026-11-09' (Stimmen zählen
     30 Minuten, Teststimme also spätestens eine halbe Stunde vor Beginn). */
  umfragen: {
    'ki-nutzung': {                       // Folie 02, Frage 1
      frage: 'Wie oft nutzen Sie KI für Studium, Job oder Nebenjob?',
      optionen: ['täglich', 'mehrmals pro Woche', 'selten', 'nie'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-nutzung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['täglich', 'mehrmals pro Woche'],
      aussage: '{prozent} nutzen KI mindestens mehrmals pro Woche',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [7, 8, 5, 1]     // BEISPIELDATEN
    },
    'ki-schaetzung': {                       // Folie 04, Frage 2; aufgelöst auf Folie 26
      frage: 'Bei wie vielen der sechs Stellen reicht eine Schulung allein nicht aus?',
      optionen: ['0 oder 1', '2', '3', '4', '5 oder 6'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-schaetzung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['4'],
      aussage: '{prozent} von Ihnen haben richtig geschätzt',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [3, 4, 6, 4, 3]     // BEISPIELDATEN
    },
    'ki-rolle': {                       // Folie 09, Frage 3
      frage: 'Der Betrieb baut auf einer Sprachmodell-Schnittstelle einen eigenen Website-Chatbot. Welche Rolle hat er?',
      optionen: ['Anbieter', 'Betreiber', 'Anbieter und Betreiber', 'keine Rolle'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-rolle',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['Anbieter und Betreiber'],
      aussage: '{prozent} liegen richtig',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [5, 9, 6, 1]     // BEISPIELDATEN
    },
    'ki-bewerbung': {                       // Folie 20, Frage 4
      frage: 'Ein Tool bewertet Bewerbungen und erstellt ein Ranking. Welche Klasse?',
      optionen: ['verboten', 'hochriskant', 'Transparenz', 'minimal'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-bewerbung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['hochriskant'],
      aussage: '{prozent} von Ihnen liegen richtig',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [2, 9, 4, 3]     // BEISPIELDATEN – verschwinden mit der ersten echten Stimme
    },
    'ki-anrufe': {                          // Folie 22, Frage 5
      frage: 'Stimmungsanalyse nur bei Anrufenden, nicht bei Beschäftigten. Welche Klasse?',
      optionen: ['verboten', 'hochriskant', 'Transparenz', 'minimal'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-anrufe',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['hochriskant'],
      aussage: '{prozent} von Ihnen liegen richtig',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [8, 5, 6, 1]     // BEISPIELDATEN
    },
    'ki-eigener-fall': {                       // Folie 25, Frage 6 (Partnerarbeit)
      frage: 'Welche Klasse hat Ihr KI-Tool ergeben?',
      optionen: ['verboten', 'hochriskant', 'Transparenz', 'minimal', 'keine KI'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-eigener-fall',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['minimal'],
      aussage: '{prozent} landen bei „minimal“',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [0, 3, 4, 10, 2]     // BEISPIELDATEN
    },
    'ki-gf-prio': {                       // Folie 33, Frage 7
      frage: 'Sie sind Geschäftsführung der Muster Metallbau. Was gehen Sie am Montag als Erstes an?',
      optionen: ['Stimmungsanalyse abschalten', 'KI-Inventar anlegen', 'Team schulen', 'Bewerber-Tool prüfen', 'Chatbot kennzeichnen'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-gf-prio',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['Stimmungsanalyse abschalten'],
      aussage: '{prozent} schalten zuerst das Verbotene ab',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [7, 6, 3, 2, 2]     // BEISPIELDATEN
    },
    'ki-meinung': {                       // Folie 36, Frage 8 (Meinung)
      frage: 'Bremst der AI Act kleine Unternehmen aus?',
      optionen: ['eher ja, zu viel Aufwand', 'eher nein, schafft Vertrauen', 'beides', 'kann ich nicht sagen'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-meinung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'vortrag-2026-11-09',
      gueltigMinuten: 30,
      unsereAntwort: ['eher ja, zu viel Aufwand'],
      aussage: '{prozent} sehen eher eine Bremse',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [7, 6, 6, 2]     // BEISPIELDATEN
    }
  },

  /* 6. LIVE-WORTWOLKEN – nicht genutzt */
  wortwolken: {},

  /* 7. OPTIONALE FOLIEN – true = zeigen */
  optionaleFolien: {},

  /* 8. DARSTELLUNG – Taste T wechselt nur die Schriften, D hell/dunkel */
  beispieldatenHinweis: true,
  standardThema: 'editorial',
  standardModus: 'hell'
};
