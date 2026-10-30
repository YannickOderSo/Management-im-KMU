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

  /* 2. FARBEN – Gestaltung „Der rote Faden“.
     Karmin ist der rote Faden der Präsentation (Laufleiste, Titel, Trennfolien)
     und markiert je Folie genau EINE Schlüsselzahl. Tinte ist die Schrift- und
     Datenfarbe. Die genauen Töne stehen in css/folien/recap.css (Abschnitt 2,
     für alle drei Themen, hell und dunkel: Kreide #F2F3EF, Schiefer #586070,
     Mittel #737B8B, Nebel #A9B0BB) – die Werte hier dienen der Engine nur als
     Ausgangspunkt. Bewusst anders als das Führungs-Referat (Petrol/Bernstein). */
  farben: {
    primaer: '#C0132D',           // Karmin: der rote Faden, Schlüsselzahl
    sekundaer: '#161B27'          // Tinte: Schrift, Daten, Linien
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
  dauerMinuten: 16,               // ca. 16 Minuten (Knopper-Block um eine Folie erweitert, 30.10.2026)
  anrede: 'Sie',

  /* 5./6. LIVE-UMFRAGE, WORTWOLKEN – nicht genutzt */
  umfragen: {},
  wortwolken: {},

  /* 7. OPTIONALE FOLIEN – true = zeigen */
  optionaleFolien: {},

  /* 8. DARSTELLUNG – Taste T wechselt das Thema, D hell/dunkel.
     Standard: „editorial“ + „hell“ (Beamer im hellen Seminarraum). Unter
     Taste T wechseln nur die Schriften; Faden, Skalen, Pfeile und Farben
     bleiben (recap.css). Dunkel nur per Taste D. */
  beispieldatenHinweis: false,
  standardThema: 'editorial',
  standardModus: 'hell'
};
