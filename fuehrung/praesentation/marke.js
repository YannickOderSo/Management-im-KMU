/* =============================================================================
   marke.js – ALLE ANGABEN, DIE SICH JE VORTRAG ÄNDERN, STEHEN HIER
   -----------------------------------------------------------------------------
   Referat „Führung – Begriff und Bedeutung im KMU“ (Management im KMU).
   Engine übernommen aus dem Modul Unternehmenskommunikation (Fallstudie 1),
   dort heißt diese Datei „marke.js“, weil sie die Marke beschreibt. Hier steht
   statt der Marke das Thema: name = „Führung“ (erscheint in der Kopfzeile).

   Regeln
   • Texte stehen in Anführungszeichen '…'. Ein Apostroph im Text: \' schreiben.
   • Nach jedem Eintrag ein Komma.
   • Nach dem Ändern: Seite neu laden (F5), Konsole (F12) muss leer sein.
   ============================================================================= */
window.MARKE = {

  /* 1. THEMA (Kopfzeile: „Management im KMU · Führung · Rubrik · Nummer“) */
  name: 'Führung',
  kurz: 'Führung',

  /* 2. FARBEN – alle übrigen Farben berechnet die Engine daraus (Kontrast
     automatisch). Gleiches Blau wie die Fragebögen (fuehrung/befragung). */
  farben: {
    primaer: '#0B4F6C',           // Petrolblau (Akzent)
    sekundaer: '#B45309'          // Bernstein (Gegenpol, z. B. „Unternehmensführung“)
  },

  /* 3. BILDER – keine Logos, keine fremden Bilder (alles eigene SVG im HTML) */
  logo: '',
  logoTitel: '',
  raetselBild: '',

  /* 4. ANGABEN ZUR PRÄSENTATION */
  titel: 'Management im KMU',
  fallstudie: 'Referat',
  veranstaltung: 'Management im KMU',
  dozent: 'Prof. Dr. Christine Arend-Fuchs',
  hochschule: 'Hochschule Kaiserslautern',
  unternehmen: '',
  gruppe: ['Yannick Heisler'],
  datum: '2026-10-30',            // TODO: Vortragstermin eintragen (Jahr-Monat-Tag)
  dauerMinuten: 15,               // TODO: Vortragsdauer bestätigen (Referentenuhr)
  anrede: 'Sie',

  /* 5. LIVE-UMFRAGE (Baustein <div class="umfrage" data-umfrage="fuehrung">, Folie 08)
     Ablauf wie im Modul Unternehmenskommunikation (live-abstimmung/ANLEITUNG.md):
     Publikum scannt den QR-Code → abstimmen.html (GitHub Pages) → Google Apps
     Script → Folie holt den Stand alle 2 s. Die Web-App ist dieselbe wie dort
     (Yannick, 19.10.2026); sie zählt je Umfrage-Name getrennt („fuehrung“).
     VORAUSSETZUNG: GitHub Pages für dieses Repository ist eingeschaltet und
     der Ordner liegt auf dem veröffentlichten Branch – sonst öffnet der QR-Code
     eine 404-Seite (dann Plan B: Handzeichen, Klick auf die Balken zählt).
     runde: 'probe' für Tests, am Vortragstag z. B. 'vortrag-2026-10-30'.
     Antwort 1 = Chef entscheidet allein … Antwort 5 = Team entscheidet
     (Führungsstil-Kontinuum nach Tannenbaum/Schmidt, vereinfacht auf 5 Stufen). */
  umfragen: {
    fuehrung: {
      frage: 'Wie werden Sie in Ihrem (Neben-)Job geführt?',
      optionen: [
        'Chef entscheidet allein',
        'Chef entscheidet und erklärt',
        'Chef fragt vorher nach',
        'Team schlägt vor, Chef wählt',
        'Team entscheidet selbst'
      ],
      link: 'https://yannickoderso.github.io/Management-im-KMU/fuehrung/praesentation/abstimmen.html?u=fuehrung',
      kurzLink: '',
      ergebnisLink: '',
      liveQuelle: 'https://script.google.com/macros/s/AKfycbwnr4wXtKVNg9rlUtVv1u0xBAIf98oJdLkMvbmb7elTK7KR3fz1TnU5rqzYSQdISpuxxw/exec',
      runde: 'probe',
      gueltigMinuten: 30,
      // „Beteiligt“ = Stufen 3–5 (Chef fragt vorher, Team schlägt vor, Team entscheidet)
      unsereAntwort: ['Chef fragt vorher nach', 'Team schlägt vor, Chef wählt', 'Team entscheidet selbst'],
      aussage: '{prozent} von Ihnen werden an Entscheidungen beteiligt',
      aussageLeer: 'Noch keine Stimmen',
      beispielwerte: [4, 7, 6, 3, 1]   // BEISPIELDATEN (21 Stimmen) – verschwinden mit der ersten echten Stimme
    }
  },

  /* 6. LIVE-WORTWOLKEN – nicht genutzt */
  wortwolken: {},

  /* 7. OPTIONALE FOLIEN – true = zeigen */
  optionaleFolien: {},

  /* 8. DARSTELLUNG – Taste T wechselt das Thema, D hell/dunkel */
  beispieldatenHinweis: true,
  standardThema: 'editorial',
  standardModus: 'hell'
};
