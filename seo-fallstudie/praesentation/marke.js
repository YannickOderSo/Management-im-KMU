/* =============================================================================
   marke.js – ALLE ANGABEN, DIE SICH JE VORTRAG ÄNDERN, STEHEN HIER
   -----------------------------------------------------------------------------
   Fallstudie „SEO Case Study: 6-Step Process That Generated 150,732 Visits“
   (Robbie Richards, Gastbeitrag Michael Karp, Kunde UAV Coach) – vorgestellt
   und kritisch bewertet. Engine wie in fuehrung/praesentation und recap/.

   Regeln
   • Texte stehen in Anführungszeichen '…'. Ein Apostroph im Text: \' schreiben.
   • Nach jedem Eintrag ein Komma.
   • Nach dem Ändern: Seite neu laden (F5), Konsole (F12) muss leer sein.
   ============================================================================= */
window.MARKE = {

  /* 1. THEMA (Kopfzeile: „SEO-Fallstudie · UAV Coach · Rubrik · Nummer“) */
  name: 'UAV Coach',
  kurz: 'UAV Coach',

  /* 2. FARBEN – Gestaltung „Unter der Lupe“: zwei Stimmen.
     Blau = was die Fallstudie behauptet, Orange = was unsere Prüfung findet.
     Die genauen Töne (hell und dunkel) stehen in css/folien/seo.css. */
  farben: {
    primaer: '#1F4FD8',           // Blau: Behauptung der Fallstudie
    sekundaer: '#C2410C'          // Orange: Befund der Prüfung
  },

  /* 3. BILDER – Belege aus der Fallstudie liegen in bilder/fallstudie/ */
  logo: '',
  logoTitel: '',
  raetselBild: '',

  /* 4. ANGABEN ZUR PRÄSENTATION */
  titel: 'SEO-Fallstudie',
  fallstudie: 'Fallstudie',
  veranstaltung: 'Management im KMU',
  dozent: 'Prof. Dr. Christine Arend-Fuchs',
  hochschule: 'Hochschule Kaiserslautern',
  unternehmen: 'UAV Coach',
  gruppe: ['Elias Knauber', 'Yannick Heisler'],
  datum: '',
  dauerMinuten: 23,               // Summe data-zeit 1380 s = 23:00
  anrede: 'Sie',

  /* 5./6. LIVE-UMFRAGE, WORTWOLKEN – nicht genutzt */
  umfragen: {},
  wortwolken: {},

  /* 7. OPTIONALE FOLIEN – true = zeigen */
  optionaleFolien: {},

  /* 8. DARSTELLUNG – Taste T wechselt das Thema (nur Schriften), D hell/dunkel */
  beispieldatenHinweis: false,
  standardThema: 'editorial',
  standardModus: 'hell'
};
