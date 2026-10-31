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
  gruppe: ['Yannick Heisler'],
  datum: '',                      // Vortragstermin (JJJJ-MM-TT) – noch offen
  rechtsstand: '31.10.2026',      // erscheint auf Titel- und Methodenfolie
  dauerMinuten: 32,               // Annahme ca. 30 Min. + Diskussion (PLAN.md, offene Entscheidung 1)
  anrede: 'Sie',

  /* 5. LIVE-UMFRAGEN (Baustein <div class="umfrage" data-umfrage="…">)
     Gleiche Web-App wie im Führungs-Referat (fuehrung/praesentation/
     live-abstimmung/ANLEITUNG.md); sie zählt je Umfrage-Name getrennt.
     VORAUSSETZUNG für den QR-Code: Dieser Ordner liegt auf dem Branch, den
     GitHub Pages zeigt (claude/exciting-meitner-w27zwy). Sonst Plan B:
     Handzeichen, Klick auf die Balken zählt.
     runde: 'probe' für Tests, am Vortragstag eine eigene Runde eintragen. */
  umfragen: {
    'ki-bewerbung': {
      frage: 'Ein Tool bewertet Bewerbungen und erstellt ein Ranking. Welche Klasse?',
      optionen: ['verboten', 'hochriskant', 'Transparenz', 'minimal'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-bewerbung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'probe',
      gueltigMinuten: 30,
      unsereAntwort: ['hochriskant'],
      aussage: '{prozent} von Ihnen liegen richtig',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [2, 9, 4, 3]     // BEISPIELDATEN – verschwinden mit der ersten echten Stimme
    },
    'ki-anrufe': {
      frage: 'Stimmungsanalyse nur bei Anrufenden, nicht bei Beschäftigten. Welche Klasse?',
      optionen: ['verboten', 'hochriskant', 'Transparenz', 'minimal'],
      link: 'https://yannickoderso.github.io/Management-im-KMU/ki-compliance/praesentation/abstimmen.html?u=ki-anrufe',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'probe',
      gueltigMinuten: 30,
      unsereAntwort: ['hochriskant'],
      aussage: '{prozent} von Ihnen liegen richtig',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [8, 5, 6, 1]     // BEISPIELDATEN
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
