/* =============================================================================
   marke.js – ALLE ANGABEN, DIE SICH JE VORTRAG ÄNDERN, STEHEN HIER
   -----------------------------------------------------------------------------
   Recap der Sitzung vom Mo, 26.10.2026 (Management im KMU).
   Engine wie in fuehrung/praesentation (aus dem Modul Unternehmenskommunikation).
   name = „Recap“ (erscheint in der Kopfzeile).

   Regeln
   • Texte stehen in Anführungszeichen '…'. Ein Apostroph im Text: \' schreiben.
   • Nach jedem Eintrag ein Komma.
   • Nach dem Ändern: Seite neu laden (F5), Konsole (F12) muss leer sein.
   ============================================================================= */
window.MARKE = {

  /* 1. THEMA (Kopfzeile: „Management im KMU · Recap · Rubrik · Nummer“) */
  name: 'Recap',
  kurz: 'Recap',

  /* 2. FARBEN – alle übrigen Farben berechnet die Engine daraus (Kontrast
     automatisch). Bewusst anders als das Führungs-Referat (Petrol/Bernstein),
     damit die Recap auf den ersten Blick als eigener Vortrag erkennbar ist. */
  farben: {
    primaer: '#7A2E4D',           // Brombeer (Akzent)
    sekundaer: '#2F5D50'          // Tannengrün (Gegenpol, Flächentöne)
  },

  /* 3. BILDER – keine Logos, keine fremden Bilder (alles eigene SVG im HTML) */
  logo: '',
  logoTitel: '',
  raetselBild: '',

  /* 4. ANGABEN ZUR PRÄSENTATION */
  titel: 'Management im KMU',
  fallstudie: 'Recap',
  veranstaltung: 'Management im KMU',
  dozent: 'Prof. Dr. Christine Arend-Fuchs',
  hochschule: 'Hochschule Kaiserslautern',
  unternehmen: '',
  gruppe: ['Elias Knauber', 'Yannick Heisler'],
  datum: '',                      // Vortragstermin der Recap eintragen (JJJJ-MM-TT), dann steht er auf der Titelfolie
  dauerMinuten: 15,               // ca. 15 Minuten (Yannick, 28.10.2026)
  anrede: 'Sie',

  /* 5./6. LIVE-UMFRAGE, WORTWOLKEN – nicht genutzt */
  umfragen: {},
  wortwolken: {},

  /* 7. OPTIONALE FOLIEN – true = zeigen */
  optionaleFolien: {},

  /* 8. DARSTELLUNG – Taste T wechselt das Thema, D hell/dunkel */
  beispieldatenHinweis: false,
  standardThema: 'editorial',
  standardModus: 'hell'
};
