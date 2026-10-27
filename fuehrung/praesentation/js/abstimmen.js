/* =============================================================================
   js/abstimmen.js – Verhalten der Abstimmseite (abstimmen.html)
   -----------------------------------------------------------------------------
   • liest marke.js (window.MARKE): Markenname, Farben, Firma und Hochschule
     (Einordnung), Anrede und die Umfrage umfragen[u] (u aus der Adresse, z. B.
     ?u=tier): frage, optionen, liveQuelle (Web-App-Adresse …/exec), runde.
     Kein Logo – die Seite ist öffentlich (QUELLEN.md, Abschnitt 4).
   • baut die Tiere als große Knöpfe (Zeichnungen wie auf Folie 08)
   • Tippen → Stimme an die Web-App senden, Bestätigung „Danke! Ihre Stimme: …“,
     „Doch anders entscheiden“ (die Web-App zählt je Handy nur die letzte Stimme)
   • Andrang, Zeitüberschreitung, Netz- oder Ladefehler → bis zu 3 Versuche
     automatisch, mit zufälliger Pause (1,5–4 s) und ruhigem Hinweis „Gerade
     stimmen viele ab – Ihre Stimme wird gesendet …“; Umentscheiden ist dabei
     möglich, gesendet wird nur die neueste Wahl (Abschnitt STIMME SENDEN)
   • erst danach, bei Eingabefehlern sofort und ohne Netz (offline) →
     verständliche Meldung und „Nochmal versuchen“
   • liveQuelle leer, nicht auf …/exec oder runde unbrauchbar → Hinweis „Die
     Abstimmung ist gerade nicht geöffnet“ (gilt vor und nach dem Vortrag)
   • ZEITFENSTER (seit 20.10.2026, marke.js → umfragen[u].gueltigMinuten, z. B.
     30): Folie 08 zählt je Handy nur die letzte Stimme der letzten 30 Minuten.
     Die Seite merkt sich deshalb mit der Wahl die Zeit, zu der der erfolgreiche
     Versuch losgeschickt wurde (immer etwas VOR dem Eingang beim Server – das
     Handy hält seine Stimme also nie länger für gültig als der Server). Ist
     sie älter als gueltigMinuten, gilt sie als abgelaufen: Beim Öffnen kommt
     gleich die Auswahl statt „Danke“, ohne „bisherige Wahl“; steht „Danke“
     schon da, wechselt die Seite beim Ablauf (Uhr, und beim Zurückkehren in
     den Tab) zur Auswahl. Gemessen wird mit der Uhr des Handys als Abstand
     zwischen Senden und jetzt – eine falsch gestellte Uhr stört nicht. Ohne
     gueltigMinuten (0 oder leer) wie bisher. Läuft bei Google noch eine ältere
     Skript-Fassung (ohne Zeitfenster), zählt die Stimme dort weiter; eine
     erneute Stimme ersetzt sie nur (dieselbe Geräte-ID) – harmlos.

   SCHNITTSTELLE (wie live-abstimmung/ und Folie 08; nur GET, Antwort als JSONP)
     ?aktion=stimme&umfrage=tier&runde=<runde>&option=<0..anzahl-1>&anzahl=<n>
      &geraet=<zufällige ID>&callback=f            → f({"ok":true})
     Fehler                                        → f({"ok":false,"fehler":"…"})
     Fehler, bei dem ein neuer Versuch lohnt       → "nochmal":true in der Antwort,
       (automatisch wiederholen)                     oder "fehler" beginnt mit „Gerade
                                                     kommen sehr viele Stimmen“ oder „Serverfehler:“
   JSONP per <script> funktioniert unabhängig von CORS und den Weiterleitungen
   von Google Apps Script.

   Geräte-ID: zufällig, 22 Zeichen [A-Za-z0-9_-], im Browser-Speicher
   (localStorage, Zugriff immer in try/catch – im privaten Modus gilt sie nur
   bis zum Schließen), je Umfrage und Runde eine eigene: Stimmen aus Probe und
   Vortrag oder aus verschiedenen Umfragen sind in der Tabelle nicht
   verknüpfbar. Keine Cookies, kein Name, keine IP.
   Test ohne Google: ?quelle=… gilt NUR auf localhost oder file:// (siehe
   Kommentar in abstimmen.html).
   ============================================================================= */
(function () {
  'use strict';

  var MUSTER_NAME = /^[A-Za-z0-9_-]{1,40}$/;     /* umfrage, runde */
  var MUSTER_GERAET = /^[A-Za-z0-9_-]{8,64}$/;
  var MAX_OPTIONEN = 9;
  var HOECHSTENS_MINUTEN = 1440;  /* gueltigMinuten: 1 bis 1440 (wie apps-script.gs und Folie 08) */
  /* ms ohne Antwort → dieser Versuch gilt als gescheitert. Zeitlimit JE
     VERSUCH; bis 19.10.2026 waren es 30 s für den einzigen Versuch, weil der
     Server bis zu 10 s auf seine Sperre wartete. Gemessen am 19.10.2026 über
     GitHub Pages und Google: Stimme bis „Danke“ 2,9 s, Stand-Abfrage 1,4–3,0 s.
     15 s lassen einem langsamen Start der Web-App oder einem vollen Mobilnetz
     reichlich Luft und gleichen dem harten Zeitlimit der Folie
     (js/komponenten.js, LIVE_ZEITLIMIT_HART). Kürzer wäre riskant: Eine
     aufgegebene Anfrage läuft beim Server weiter, die Wiederholung käme als
     zusätzliche Ausführung mitten in den Andrang. Länger hieße: Ein Handy,
     dessen Anfrage verloren ging, wartet länger, bevor es neu sendet.
     Voraussetzung: Der Server antwortet bei Andrang schnell – er darf nicht
     annähernd 15 s auf eine Sperre warten (live-abstimmung/apps-script.gs).
     Eine spät gezählte Stimme schadet nicht – die Wiederholung sendet dieselbe
     Wahl mit derselben Geräte-ID, und je Gerät zählt nur die letzte Stimme.
     Format „var ZEITLIMIT = <ms>;“ beibehalten: werkzeuge/live-abstimmung-test.mjs
     liest den Wert hier aus. */
  var ZEITLIMIT = 15000;
  var VERSUCHE = 3;               /* Versuche je Stimme insgesamt (1 + 2 Wiederholungen) */
  var PAUSE_MIN = 1500;           /* ms Wartezeit vor einer Wiederholung: zufällig */
  var PAUSE_MAX = 4000;           /*    zwischen MIN und MAX – verteilt den Andrang */
  /* Server ausgelastet → automatisch wiederholen. Erkennung (apps-script.gs):
     Feld nochmal: true in der Fehlerantwort ODER Fehlertext beginnt mit diesem
     Textanfang (Fassung bis 19.10.2026: „Gerade kommen sehr viele Stimmen auf
     einmal – bitte gleich noch einmal tippen.“). Ebenso „Serverfehler: …“
     (Ausnahme im Skript, z. B. ein Google-Dienst kurz überlastet). Andere
     Fehler (ungültige Runde, Option …) sind Eingabefehler – keine Wiederholung. */
  var AUSGELASTET = 'Gerade kommen sehr viele Stimmen';
  var SERVERFEHLER = 'Serverfehler:';
  var SPAET_HOECHSTENS = 120000;  /* ms: so lange wird auf eine verspätete Antwort gehört */
  var LANGSAM = 5000;             /* ms → „Dauert etwas länger …“ */
  var SPEICHER = 'abstimmen:';    /* Präfix im Browser-Speicher */

  /* ---------------------------------------------------------------------------
     STRICHZEICHNUNGEN – Kopie aus js/folien/08-analogien.js (BILDER), damit
     Folie und Abstimmseite dieselben Tiere zeigen. Zeichenfläche 120 × 120,
     Klasse „voll“ = gefüllte Fläche. Schlüssel = Tiername klein, ä/ö/ü/ß als
     ae/oe/ue/ss. Ändert sich dort eine Zeichnung, hier mitändern.
     Tiere ohne eigene Zeichnung bekommen den Pfotenabdruck.
     --------------------------------------------------------------------------- */
  var BILDER = {
    /* Chamäleon (seit 20.10.2026): Helm, großes Auge, eingerollter Schwanz, Ast */
    chamaeleon:
      '<path d="M29.5 70 C29 57 38 45 49.5 40.5 C55.5 38.5 60.5 36.5 64.5 36.5 C62.5 27 61.5 18.5 63 10.5 C72.5 15.5 82.5 22 91.5 28.5 C98.5 31.5 104 35 103.5 40 C101.5 47 93 53.5 82.5 55 C81 63.5 72.5 70 60.5 74 C49 78.5 37.5 78 31 75 Z"/>' +
      '<path d="M66 37 C72 42.5 77.5 48 82.5 55"/>' +
      '<circle cx="82.5" cy="37.5" r="9"/><circle class="voll" cx="84" cy="37" r="3.5"/>' +
      '<path d="M102.5 40 Q95 47.5 85.5 48.5"/>' +
      '<path d="M31 71.5 C17.5 74.5 6 85 10.5 98 C15 109.5 30 108.5 34.5 99.5 C38 91.5 32 83.5 25 86 C19 88 21 96.5 26.5 96.5"/>' +
      '<path d="M75 65.5 L87 71 L87.5 87.5 M46.5 78 L42 90 L52.5 100.5"/>' +
      '<path d="M30 108.5 L114 78"/>',
    /* Papagei (seit Fr, 23.10.2026 Option der Abstimmung an der Stelle des
       Fuchses – Elias Knaubers Tier 1, gleichwertig mit dem Chamäleon):
       Hakenschnabel, Augenring, langer Schwanz, Ast. Wortgleich mit
       js/folien/08-analogien.js (dort seit 22.10.2026). */
    papagei:
      '<path d="M54 46 C51 29 61 16 76 16 C86 16 92 21 94 28 C104 27 109 40 101 52 C99 45 95 42 91 43 C92 59 88 72 79 82 L72 115 C67 117 62 116 59 112 L63 84 C51 77 50 60 54 46 Z"/>' +
      '<circle cx="80" cy="29" r="6.5"/><circle class="voll" cx="80.5" cy="29" r="2.8"/>' +
      '<path d="M94 28 C93 34 92 39 91 43"/>' +
      '<path d="M62 50 C57 64 60 77 70 86"/>' +
      '<path d="M26 96 L112 87"/><path d="M72 83 L71 92 M80 81 L80 90"/>',
    waschbaer:
      '<path d="M60 104 C50 104 42 98 36 92 L14 78 L24 70 C21 58 22 46 27 37 L24 15 L44 26 Q60 21 76 26 L96 15 L93 37 C98 46 99 58 96 70 L106 78 L84 92 C78 98 70 104 60 104 Z"/>' +
      '<path d="M31 24 L34 33 M89 24 L86 33"/>' +
      /* Maske mit zwei Augenlöchern (evenodd), darin die Pupillen */
      '<path class="voll" fill-rule="evenodd" d="M22 60 C30 48 46 46 55 56 Q60 61 65 56 C74 46 90 48 98 60 C94 71 80 75 70 69 Q60 63 50 69 C40 75 26 71 22 60 Z M44 54 a6 6 0 1 0 0.01 0 Z M76 54 a6 6 0 1 0 0.01 0 Z"/>' +
      '<circle class="voll" cx="44" cy="60" r="2.6"/><circle class="voll" cx="76" cy="60" r="2.6"/>' +
      '<path d="M60 30 V44"/>' +
      '<ellipse class="voll" cx="60" cy="86" rx="6.5" ry="4.5"/><path d="M60 90 V95 M60 95 Q55 99 51 96 M60 95 Q65 99 69 96"/>',
    adler:
      '<path d="M18 112 C18 88 24 64 38 50 C48 40 62 35 78 35 C86 35 92 37 97 41 C106 41 114 45 117 53 C118 58 116 64 111 68 C111 63 108 60 103 60 L86 60 C84 68 81 76 76 82 C71 90 69 100 69 112 Z"/>' +
      '<path d="M97 41 C94 47 92 53 91 60"/>' +
      '<circle class="voll" cx="80" cy="49" r="3.6"/><path d="M64 47 L80 42 L93 46"/>',
    affe:
      '<path d="M27 48 A12 12 0 1 0 27 70 M93 48 A12 12 0 1 1 93 70"/>' +
      '<circle cx="60" cy="59" r="34"/>' +
      '<path d="M60 47 C54 38 39 38 39 53 C39 60 42 64 45 68 C41 76 45 89 60 91 C75 89 79 76 75 68 C78 64 81 60 81 53 C81 38 66 38 60 47 Z"/>' +
      '<circle class="voll" cx="51" cy="56" r="3.6"/><circle class="voll" cx="69" cy="56" r="3.6"/>' +
      '<circle class="voll" cx="56" cy="72" r="1.9"/><circle class="voll" cx="64" cy="72" r="1.9"/>' +
      '<path d="M51 80 Q60 86 69 80"/><path d="M53 26 Q57 18 61 25 Q65 18 69 26"/>',
    pfote:
      '<path d="M60 62 C48 62 36 74 36 86 C36 96 46 100 54 97 C57 96 58 95 60 95 C62 95 63 96 66 97 C74 100 84 96 84 86 C84 74 72 62 60 62 Z"/>' +
      '<ellipse cx="31" cy="55" rx="8" ry="10.5" transform="rotate(-25 31 55)"/><ellipse cx="48" cy="36" rx="8" ry="11" transform="rotate(-8 48 36)"/>' +
      '<ellipse cx="72" cy="36" rx="8" ry="11" transform="rotate(8 72 36)"/><ellipse cx="89" cy="55" rx="8" ry="10.5" transform="rotate(25 89 55)"/>',
    schwan:
      '<path d="M38 86 C24 72 30 60 38 50 C45 41 45 31 38 26"/>' +
      '<path d="M48 82 C38 70 42 60 48 52 C56 41 54 25 44 19 C38 16 31 18 29 23 L17 30 L30 31 C33 31 36 29 38 26"/>' +
      '<circle class="voll" cx="38" cy="22.5" r="2.6"/>' +
      '<path d="M38 86 C46 98 66 102 84 98 C98 95 106 86 108 74 C108 68 106 62 102 58 C98 68 90 74 78 76 C66 78 56 80 48 82"/>' +
      '<path d="M60 88 C74 90 88 86 98 76"/>' +
      '<path d="M14 110 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0"/>',
    eule:
      '<path d="M30 14 L45 29 Q60 24 75 29 L90 14 C97 42 99 72 88 91 C80 104 70 110 60 110 C50 110 40 104 32 91 C21 72 23 42 30 14 Z"/>' +
      '<circle cx="46" cy="52" r="13"/><circle cx="74" cy="52" r="13"/>' +
      '<circle class="voll" cx="47.5" cy="53" r="4.5"/><circle class="voll" cx="72.5" cy="53" r="4.5"/>' +
      '<path d="M55 66 L60 74 L65 66 Z"/>' +
      '<path d="M46 86 q4.5 5 9 0 M55 86 q4.5 5 9 0 M64 86 q4.5 5 9 0 M50.5 95 q4.5 5 9 0 M59.5 95 q4.5 5 9 0"/>' +
      '<path d="M22 114 H98 M50 108 v6 M70 108 v6"/>',
    fuchs:
      '<path d="M18 16 L44 40 Q60 35 76 40 L102 16 L96 58 Q92 72 80 80 L60 102 L40 80 Q28 72 24 58 Z"/>' +
      '<path d="M28 28 L40 46 M92 28 L80 46"/>' +
      '<path d="M24 58 Q40 62 48 74 L60 102 L72 74 Q80 62 96 58"/>' +
      '<circle class="voll" cx="46" cy="60" r="4"/><circle class="voll" cx="74" cy="60" r="4"/>' +
      '<circle class="voll" cx="60" cy="98" r="5"/>',
    loewe:
      '<path d="M60 12 L70 20 L83 16 L87 29 L100 33 L97 46 L107 56 L98 66 L103 79 L90 84 L88 98 L75 96 L66 106 L60 104 L54 106 L45 96 L32 98 L30 84 L17 79 L22 66 L13 56 L23 46 L20 33 L33 29 L37 16 L50 20 Z"/>' +
      '<circle cx="60" cy="60" r="27"/>' +
      '<circle class="voll" cx="50" cy="55" r="3.6"/><circle class="voll" cx="70" cy="55" r="3.6"/>' +
      '<path d="M54 67 L66 67 L60 74 Z"/><path d="M60 74 V79 M60 79 Q55 84 50 81 M60 79 Q65 84 70 81"/>',
    hund:
      '<path d="M42 28 Q60 20 78 28 Q86 34 86 50 L86 74 Q86 98 60 100 Q34 98 34 74 L34 50 Q34 34 42 28 Z"/>' +
      '<path d="M42 28 C26 30 18 50 22 74 C32 74 38 64 38 52 M78 28 C94 30 102 50 98 74 C88 74 82 64 82 52"/>' +
      '<circle class="voll" cx="49" cy="58" r="4"/><circle class="voll" cx="71" cy="58" r="4"/>' +
      '<ellipse class="voll" cx="60" cy="76" rx="8" ry="5.5"/>' +
      '<path d="M60 81 V87 M60 87 Q54 92 49 89 M60 87 Q66 92 71 89"/>',
    delfin:
      '<path d="M24 90 C30 56 62 34 92 40 C100 42 106 46 110 52 L99 56 C80 54 56 66 38 96"/>' +
      '<path d="M24 90 L8 86 Q20 96 22 108 L30 98 L38 96"/>' +
      '<path d="M60 38 Q60 22 74 16 Q70 26 76 39"/>' +
      '<circle class="voll" cx="93" cy="47" r="3.4"/>'
  };

  /* kleine Linien-Icons (24 × 24, wie das Sprite der Präsentation) */
  var ICON = {
    haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    nochmal: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
    zurueck: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>'
  };

  /* ---------------------------------------------------------------------------
     TEXTE – Sie-Form (marke.js → anrede: 'Sie') oder Du-Form ('ihr' bzw.
     umfragen.<u>.anrede: 'du')
     --------------------------------------------------------------------------- */
  var TEXTE = {
    sie: {
      anleitung: 'Tippen Sie auf eine Antwort. Das Ergebnis erscheint live auf der Leinwand.',
      deine: 'Ihre Stimme',
      leinwand: 'Das Ergebnis sehen Sie gleich auf der Leinwand.',
      umentscheiden: 'Sie können sich umentscheiden – es zählt nur Ihre letzte Stimme.',
      netz: 'Die Abstimmung ist gerade nicht erreichbar. Bitte in ein paar Sekunden nochmal versuchen.',
      offline: 'Ihr Handy ist gerade offline. Bitte mobiles Internet oder WLAN einschalten und nochmal versuchen.',
      wiederholung: 'Gerade stimmen viele ab – Ihre Stimme wird gesendet …',
      geschlossen: 'Sie läuft nur während der Präsentation im Hörsaal.',
      handzeichen: 'Sie können auch per Handzeichen im Hörsaal mitmachen.'
    },
    du: {
      anleitung: 'Tipp auf eine Antwort. Das Ergebnis erscheint live auf der Leinwand.',
      deine: 'Deine Stimme',
      leinwand: 'Das Ergebnis siehst du gleich auf der Leinwand.',
      umentscheiden: 'Du kannst dich umentscheiden – es zählt nur deine letzte Stimme.',
      netz: 'Die Abstimmung ist gerade nicht erreichbar. Bitte in ein paar Sekunden nochmal versuchen.',
      offline: 'Dein Handy ist gerade offline. Bitte mobiles Internet oder WLAN einschalten und nochmal versuchen.',
      wiederholung: 'Gerade stimmen viele ab – deine Stimme wird gesendet …',
      geschlossen: 'Sie läuft nur während der Präsentation im Hörsaal.',
      handzeichen: 'Du kannst auch per Handzeichen im Hörsaal mitmachen.'
    }
  };

  var m = null;                   /* window.MARKE, sobald marke.js geladen ist */
  var T = TEXTE.sie;
  var zustand = {
    id: '',             /* Name der Umfrage (u) */
    konfig: null,       /* marke.js → umfragen[u] */
    optionen: [],
    quelle: '',         /* Web-App-Adresse */
    runde: '',
    fenster: 0,         /* Zeitfenster in ms (gueltigMinuten), 0 = ohne */
    bisher: -1,         /* bestätigte Stimme (nach „Doch anders entscheiden“) */
    stimmeZeit: 0,      /* Date.now() beim Losschicken der bestätigten Stimme (Zeitfenster) */
    sendung: null,      /* neueste Wahl, die gerade gesendet wird (STIMME SENDEN) */
    laufend: null,      /* Anfrage, die gerade unterwegs ist – höchstens eine */
    knoepfe: []
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------------------------
     HILFEN
     --------------------------------------------------------------------------- */
  function element(tag, attribute, text, eltern) {
    var e = document.createElement(tag);
    if (attribute) Object.keys(attribute).forEach(function (k) { e.setAttribute(k, attribute[k]); });
    if (text !== undefined && text !== null) e.textContent = text;
    if (eltern) eltern.appendChild(e);
    return e;
  }
  function svg(viewBox, inhalt, klasse) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (klasse) s.setAttribute('class', klasse);
    s.innerHTML = inhalt;          /* nur feste Zeichnungen aus dieser Datei */
    return s;
  }
  function icon(name) { return svg('0 0 24 24', ICON[name] || ''); }

  /* Tiername → Schlüssel der Zeichnung („Waschbär“ → „waschbaer“) */
  function bildSchluessel(name) {
    return String(name || '').trim().toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '');
  }
  /* Ohne eigene Zeichnung (Management im KMU, 27.10.2026): Skala mit einem
     markierten Punkt je Antwort – passend zum Führungsstil-Kontinuum
     (Antwort 1 = links „Chef entscheidet“, letzte = rechts „Team entscheidet“). */
  function skalaBild(i) {
    var n = Math.max(2, (zustand.optionen || []).length), inhalt = '<path d="M14 60 H106"/>';
    for (var j = 0; j < n; j++) {
      var x = 14 + j * 92 / (n - 1);
      inhalt += '<circle ' + (j === i ? 'class="voll" r="13"' : 'r="6"') + ' cx="' + x.toFixed(1) + '" cy="60"/>';
    }
    return inhalt;
  }
  function tierBild(name) {
    var k = bildSchluessel(name);
    if (BILDER[k]) return svg('0 0 120 120', BILDER[k]);
    return svg('0 0 120 120', skalaBild((zustand.optionen || []).indexOf(name)));
  }

  function markeText(text) {
    return String(text || '')
      .replace(/\[Marke kurz\]/g, m.kurz || m.name || '[Marke]')
      .replace(/\[Marke\]/g, m.name || '[Marke]');
  }

  /* Browser-Speicher: kann fehlen oder gesperrt sein → nie abstürzen */
  function laden(schluessel) {
    try {
      var roh = window.localStorage.getItem(SPEICHER + schluessel);
      return roh ? JSON.parse(roh) : null;
    } catch (e) { return null; }
  }
  function speichern(schluessel, wert) {
    try { window.localStorage.setItem(SPEICHER + schluessel, JSON.stringify(wert)); } catch (e) { /* egal */ }
  }
  function entfernen(schluessel) {
    try { window.localStorage.removeItem(SPEICHER + schluessel); } catch (e) { /* egal */ }
  }

  /* zufällige Geräte-ID (nur Zeichen A–Z a–z 0–9 _ -), je Browser, Umfrage
     und Runde eine eigene – Umentscheiden innerhalb einer Runde funktioniert,
     Probe und Vortrag sind in der Tabelle nicht verknüpfbar (Datensparsamkeit).
     Der Zwischenspeicher hilft, wenn der Browser-Speicher gesperrt ist. */
  var geraetImSpeicher = {};
  function geraetId() {
    var schluessel = 'geraet:' + zustand.id + ':' + zustand.runde;
    if (geraetImSpeicher[schluessel]) return geraetImSpeicher[schluessel];
    var gespeichert = laden(schluessel);
    if (typeof gespeichert === 'string' && MUSTER_GERAET.test(gespeichert)) {
      geraetImSpeicher[schluessel] = gespeichert;
      return gespeichert;
    }
    var zeichen = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    var zufall = new Uint8Array(22);
    try { window.crypto.getRandomValues(zufall); }
    catch (e) { for (var j = 0; j < zufall.length; j++) zufall[j] = Math.floor(Math.random() * 256); }
    var id = '';
    for (var i = 0; i < zufall.length; i++) id += zeichen.charAt(zufall[i] & 63);
    geraetImSpeicher[schluessel] = id;
    speichern(schluessel, id);
    return id;
  }
  /* frühere Fassung: eine Geräte-ID für alle Runden – nicht mehr nötig */
  function alteGeraetIdEntfernen() {
    try { window.localStorage.removeItem(SPEICHER + 'geraet'); } catch (e) { /* egal */ }
  }

  /* Farben (WCAG): relative Leuchtdichte und Kontrast zweier Hex-Farben */
  function hexZuRgb(hex) {
    var t = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!t) return null;
    var n = parseInt(t[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function leuchtdichte(rgb) {
    var k = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  }
  function kontrast(a, b) {
    var la = leuchtdichte(hexZuRgb(a)), lb = leuchtdichte(hexZuRgb(b));
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* Markenfarben aus marke.js übernehmen; Schrift auf Gelb nach Kontrast */
  function farbenSetzen() {
    var f = m.farben || {};
    var root = document.documentElement.style;
    var gelb = hexZuRgb(f.primaer) ? String(f.primaer).trim() : '#FFD007';
    var schwarz = hexZuRgb(f.sekundaer) ? String(f.sekundaer).trim() : '#1D1D1B';
    /* Kopfzeile, Konturen und Schatten brauchen ein dunkles Schwarz */
    if (leuchtdichte(hexZuRgb(schwarz)) > 0.08) schwarz = '#1D1D1B';
    var aufGelb = [schwarz, '#000000', '#FFFFFF'].filter(function (c) { return kontrast(c, gelb) >= 4.5; })[0] ||
      (kontrast('#000000', gelb) >= kontrast('#FFFFFF', gelb) ? '#000000' : '#FFFFFF');
    root.setProperty('--gelb', gelb);
    root.setProperty('--schwarz', schwarz);
    root.setProperty('--auf-gelb', aufGelb);
  }

  /* Platzhalter wie in der Präsentation: data-marke, data-unternehmen … */
  function platzhalterSetzen() {
    var felder = { 'data-marke': m.name, 'data-unternehmen': m.unternehmen, 'data-hochschule': m.hochschule, 'data-veranstaltung': m.veranstaltung };
    Object.keys(felder).forEach(function (attr) {
      if (!felder[attr]) return;
      Array.prototype.forEach.call(document.querySelectorAll('[' + attr + ']'), function (e) {
        e.textContent = felder[attr];
      });
    });
  }

  /* Frage mit hervorgehobenem Markennamen setzen */
  function frageSetzen(text) {
    var ziel = $('frage');
    ziel.textContent = '';
    var roh = String(text || '').replace(/\[Marke kurz\]/g, '[Marke]');
    roh.split('[Marke]').forEach(function (teil, i) {
      if (i > 0) element('span', { class: 'frage-marke' }, m.name || 'Marke', ziel);
      if (teil) ziel.appendChild(document.createTextNode(teil));
    });
    document.title = (m.name ? m.name + ' – ' : '') + 'Live-Abstimmung';
  }

  /* Adresse der Web-App: marke.js → liveQuelle; Test-Überschreibung ?quelle=
     nur auf localhost bzw. file:// */
  function istLokal() {
    return location.protocol === 'file:' ||
      /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/.test(location.hostname);
  }
  function quelleBestimmen(konfig, parameter) {
    var test = parameter.get('quelle');
    if (test && istLokal() && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|script\.google\.com)(:\d+)?\//.test(test)) {
      return test.trim();
    }
    var q = String(konfig.liveQuelle || '').trim();
    if (!q) return '';
    /* dieselbe Prüfung wie auf Folie 08 (js/komponenten.js): …/dev ist die
       Test-Adresse des Editors und funktioniert nur für den Autor */
    if (!/^https:\/\/script\.google\.com\/\S+\/exec$/.test(q)) {
      console.warn('abstimmen.html: marke.js → umfragen.' + zustand.id + '.liveQuelle ist keine Web-App-Adresse von Google Apps Script, die auf /exec endet (https://script.google.com/macros/s/…/exec) – Abstimmung bleibt aus.');
      return '';
    }
    return q;
  }

  /* ---------------------------------------------------------------------------
     ANFRAGE AN DIE WEB-APP (JSONP)
     fertig(fehler, daten): fehler = { art: 'netz' | 'zeit' | 'antwort' }
     spaet(daten): Antwort, die erst NACH dem Zeitlimit kam (fertig hatte dann
     schon { art: 'zeit' }). Eine Anfrage lässt sich nicht zurückholen – der
     Server kann sie noch verarbeiten. Deshalb bleibt der Rückruf nach dem
     Zeitlimit bestehen (höchstens SPAET_HOECHSTENS), statt ins Leere zu laufen.
     --------------------------------------------------------------------------- */
  var zaehler = 0;
  function leer() {}
  function anfrage(parameter, fertig, spaet) {
    var name = 'abstimmenAntwort' + (++zaehler) + '_' + Math.random().toString(36).slice(2, 8);
    var skript = document.createElement('script');
    var stand = 'offen';           /* 'offen' → 'zu-spaet' (Zeitlimit) → 'zu' */
    var uhr = null;
    var spaetUhr = null;
    function aufraeumen() {
      stand = 'zu';
      clearTimeout(uhr);
      clearTimeout(spaetUhr);
      /* ein doppelter Aufruf läuft ins Leere statt in einen Fehler */
      window[name] = leer;
      if (skript.parentNode) skript.parentNode.removeChild(skript);
    }
    function ende(fehler, daten) {
      if (stand === 'offen') { aufraeumen(); fertig(fehler, daten); }
      else if (stand === 'zu-spaet') { aufraeumen(); if (!fehler && spaet) spaet(daten); }
    }
    window[name] = function (daten) { ende(null, daten); };
    parameter.callback = name;
    var abfrage = Object.keys(parameter).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(parameter[k]);
    }).join('&');
    skript.src = zustand.quelle + (zustand.quelle.indexOf('?') >= 0 ? '&' : '?') + abfrage;
    skript.async = true;
    skript.referrerPolicy = 'no-referrer';
    skript.onerror = function () { ende({ art: 'netz' }); };
    /* Skript geladen, aber kein Rückruf (z. B. Google-Anmeldeseite statt
       Web-App, weil die Bereitstellung nicht für „Jeder“ freigegeben ist) */
    skript.onload = function () { ende({ art: 'antwort' }); };
    uhr = setTimeout(function () {
      if (stand !== 'offen') return;
      stand = 'zu-spaet';
      spaetUhr = setTimeout(aufraeumen, SPAET_HOECHSTENS);
      fertig({ art: 'zeit' });
    }, ZEITLIMIT);
    document.head.appendChild(skript);
  }

  /* ---------------------------------------------------------------------------
     ANZEIGE
     --------------------------------------------------------------------------- */
  function ansagen(text) {
    var a = $('ansage');
    a.textContent = '';
    /* kurz leeren, damit Screenreader auch denselben Text erneut ansagen */
    setTimeout(function () { a.textContent = text; }, 60);
  }
  function meldungLeeren() { $('meldung').textContent = ''; }
  /* Zeile unter der Frage: Anleitung, während einer Wiederholung der ruhige
     Hinweis T.wiederholung (oben sichtbar). Der Hinweis behält die Höhe der
     Anleitung (min-height), damit die Tiere nicht springen – z. B. auf dem
     Tablet: Anleitung zwei Zeilen, Hinweis eine. */
  function anleitungSetzen(text) {
    var a = $('anleitung');
    var hinweis = text === T.wiederholung;
    if (hinweis && !a.classList.contains('ist-wiederholung')) a.style.minHeight = a.getBoundingClientRect().height + 'px';  /* genau, offsetHeight rundet */
    if (!hinweis) a.style.minHeight = '';
    if (a.textContent !== text) a.textContent = text;
    a.classList.toggle('ist-wiederholung', hinweis);
  }

  function auswahlBauen() {
    var liste = $('auswahl');
    liste.textContent = '';
    zustand.knoepfe = zustand.optionen.map(function (name, i) {
      var li = element('li', null, null, liste);
      var knopf = element('button', { type: 'button', class: 'tier', 'data-option': String(i) }, null, li);
      var bild = element('span', { class: 'tier-bild' }, null, knopf);
      bild.appendChild(tierBild(name));
      var text = element('span', { class: 'tier-text' }, null, knopf);
      element('span', { class: 'tier-name' }, name, text);
      var zusatz = element('span', { class: 'tier-zusatz' }, null, text);
      zusatz.hidden = true;
      element('span', { class: 'tier-zeichen', 'aria-hidden': 'true' }, null, knopf);
      knopf.addEventListener('click', function () { stimmeSenden(i); });
      return { knopf: knopf, zusatz: zusatz };
    });
  }

  function auswahlZeigen(fokusAuf) {
    meldungLeeren();
    anleitungSetzen(T.anleitung);
    $('anleitung').hidden = false;
    var liste = $('auswahl');
    liste.hidden = false;
    liste.classList.remove('ist-unterwegs');
    zustand.knoepfe.forEach(function (k, i) {
      k.knopf.classList.remove('ist-gewaehlt', 'ist-sendet');
      k.knopf.removeAttribute('aria-disabled');
      var bisher = i === zustand.bisher;
      k.knopf.classList.toggle('ist-bisher', bisher);
      k.zusatz.hidden = !bisher;
      k.zusatz.textContent = bisher ? 'bisherige Wahl' : '';
    });
    if (typeof fokusAuf === 'number' && zustand.knoepfe[fokusAuf]) zustand.knoepfe[fokusAuf].knopf.focus();
  }

  /* Während eine Stimme unterwegs ist (auch während der Wiederholungen),
     bleiben die ANDEREN Tiere antippbar: Umentscheiden ersetzt die Wahl, die
     gerade gesendet wird. Nur das gewählte Tier ist gesperrt (zweites Tippen
     sendet nicht doppelt). */
  function sendetZeigen(i) {
    var liste = $('auswahl');
    liste.hidden = false;
    liste.classList.add('ist-unterwegs');
    zustand.knoepfe.forEach(function (k, j) {
      if (j === i) k.knopf.setAttribute('aria-disabled', 'true');
      else k.knopf.removeAttribute('aria-disabled');
      k.knopf.classList.toggle('ist-gewaehlt', j === i);
      k.knopf.classList.toggle('ist-sendet', j === i);
      k.knopf.classList.remove('ist-bisher');
      if (j === i) {
        k.zusatz.hidden = false;
        k.zusatz.textContent = 'wird gesendet …';
      } else {
        k.zusatz.hidden = true;
      }
    });
    ansagen('Stimme für ' + zustand.optionen[i] + ' wird gesendet.');
  }

  function dankZeigen(i, neu) {
    $('auswahl').hidden = true;
    $('anleitung').hidden = true;
    var ziel = $('meldung');
    ziel.textContent = '';
    var name = zustand.optionen[i];
    var karte = element('div', { class: 'karte karte--danke' + (neu ? ' ist-neu' : '') }, null, ziel);
    var kopf = element('div', { class: 'danke-kopf' }, null, karte);
    var bild = element('div', { class: 'danke-bild' }, null, kopf);
    bild.appendChild(tierBild(name));
    var haken = element('span', { class: 'danke-haken' }, null, bild);
    haken.appendChild(icon('haken'));
    var texte = element('div', null, null, kopf);
    element('p', { class: 'karte-titel' }, 'Danke!', texte);
    var wahl = element('p', { class: 'danke-wahl' }, T.deine + ': ', texte);
    element('strong', null, name, wahl);
    element('p', { class: 'karte-text' }, T.leinwand, karte);
    var knoepfe = element('div', { class: 'karte-knoepfe' }, null, karte);
    var anders = element('button', { type: 'button', class: 'knopf' }, null, knoepfe);
    anders.appendChild(icon('zurueck'));
    element('span', null, 'Doch anders entscheiden', anders);
    anders.addEventListener('click', function () { auswahlZeigen(zustand.bisher); });
    element('p', { class: 'karte-klein' }, T.umentscheiden, karte);
    if (neu) {
      ansagen('Danke! ' + T.deine + ': ' + name + '.');
      anders.focus();
    }
  }

  function fehlerZeigen(i, text) {
    $('auswahl').hidden = true;
    anleitungSetzen(T.anleitung);
    var ziel = $('meldung');
    ziel.textContent = '';
    var karte = element('div', { class: 'karte karte--fehler' }, null, ziel);
    element('p', { class: 'karte-titel' }, 'Das hat nicht geklappt', karte);
    element('p', { class: 'karte-text' }, text, karte);
    var knoepfe = element('div', { class: 'karte-knoepfe' }, null, karte);
    var nochmal = element('button', { type: 'button', class: 'knopf knopf--haupt' }, null, knoepfe);
    nochmal.appendChild(icon('nochmal'));
    element('span', null, 'Nochmal versuchen', nochmal);
    nochmal.addEventListener('click', function () { stimmeSenden(i); });
    var anders = element('button', { type: 'button', class: 'knopf' }, null, knoepfe);
    anders.appendChild(icon('zurueck'));
    element('span', null, 'Andere Antwort wählen', anders);
    anders.addEventListener('click', function () { auswahlZeigen(i); });
    element('p', { class: 'karte-klein' }, T.handzeichen, karte);
    ansagen('Das hat nicht geklappt. ' + text);
    nochmal.focus();
  }

  /* ruhiger Hinweis statt Knöpfen (Abstimmung aus oder falsch eingerichtet) */
  function hinweisZeigen(titel, text) {
    $('auswahl').hidden = true;
    $('anleitung').hidden = true;
    document.documentElement.classList.remove('ist-offen');
    var ziel = $('meldung');
    ziel.textContent = '';
    var karte = element('div', { class: 'karte karte--hinweis' }, null, ziel);
    element('p', { class: 'karte-titel' }, titel, karte);
    if (text) element('p', { class: 'karte-text' }, text, karte);
    var knoepfe = element('div', { class: 'karte-knoepfe' }, null, karte);
    var neu = element('button', { type: 'button', class: 'knopf knopf--haupt' }, null, knoepfe);
    neu.appendChild(icon('nochmal'));
    element('span', null, 'Seite neu laden', neu);
    neu.addEventListener('click', function () { location.reload(); });
    element('p', { class: 'karte-klein' }, T.handzeichen, karte);
  }

  /* ---------------------------------------------------------------------------
     STIMME SENDEN – mit automatischer Wiederholung
     • Bis zu VERSUCHE (3) Versuche je Wahl. Wiederholt wird bei „Server
       ausgelastet“ (nochmal: true oder Textanfang AUSGELASTET), „Serverfehler:
       …“, Zeitüberschreitung und Netz- bzw. Ladefehlern – nicht, wenn das Handy
       offline ist (navigator.onLine === false), und nie bei Eingabefehlern.
       Vor jeder Wiederholung eine zufällige Pause (PAUSE_MIN–PAUSE_MAX): Die
       Handys, die im selben Moment abgelehnt wurden, kommen verteilt wieder.
       Dieselbe Geräte-ID – je Gerät zählt nur die letzte Stimme, eine
       Wiederholung zählt also nie doppelt.
       Netz- und Ladefehler zählen mit, weil auch eine Ablehnung durch Google
       selbst so ankommen könnte (keine JSONP-Antwort): Google nennt 30
       gleichzeitige Ausführungen je Nutzer und ein nicht beziffertes Limit
       für zu viele Starts pro Sekunde; bei Überschreitung bricht das Skript
       ab (developers.google.com/apps-script/guides/services/quotas, abgerufen
       19.10.2026). Wie beides bei einer Web-App mit „Ausführen als: Ich“
       greift und wie die Ablehnung beim Handy ankommt, ist nicht dokumentiert
       bzw. nicht geprüft; beim Lasttest am 19.10.2026 trat keine auf.
     • Während der Wiederholung ruhige Zeile unter der Frage (T.wiederholung)
       statt Fehler; erst nach dem letzten Fehlversuch die Fehlerkarte mit
       „Nochmal versuchen“ (startet wieder mit 3 Versuchen).
     • REIHENFOLGE: Es ist höchstens eine Anfrage gleichzeitig unterwegs
       (zustand.laufend). Wer sich umentscheidet, beendet die alte Sendung
       (Pause und weitere Versuche entfallen); die neue Wahl geht erst los, wenn
       die laufende Anfrage beantwortet oder aufgegeben ist. Der Server
       vergibt die Zeit einer Stimme bei ihrem Eingang und antwortet erst nach
       dem Schreiben (apps-script.gs) – die neuere Wahl kommt also später an
       und gewinnt.
     • NACHZÜGLER: Eine nach dem Zeitlimit aufgegebene Anfrage kann der Server
       trotzdem noch schreiben. Kam sie erst nach der neueren Wahl beim Skript
       an (z. B. weil Google sie aufgehalten hat), zählte sie als die neuere.
       Meldet sie sich spät mit ok (anfrage → spaet) und war es ein anderes
       Tier als die neueste Wahl, wird die neueste Wahl still noch einmal
       gesendet. Kommt auch die späte Antwort nie an, bleibt das unbemerkt
       (Restrisiko, nur wer sich genau in diesen Sekunden umentscheidet).
       Meldet sich spät ein Versuch der laufenden Sendung (dieselbe Wahl), gilt
       die Stimme als angekommen: „Danke“ statt weiterer Versuche.
     --------------------------------------------------------------------------- */
  function stimmeSenden(i) {
    if (!(i >= 0 && i < zustand.optionen.length)) return;
    var s = zustand.sendung;
    if (s && !s.still && s.option === i) return;          /* schon unterwegs */
    sendungBeenden();
    if (navigator.onLine === false) { fehlerZeigen(i, T.offline); return; }
    /* „Nochmal versuchen“ verschwindet mit der Karte – Fokus aufs Tier */
    var fokusWeg = $('meldung').contains(document.activeElement);
    meldungLeeren();
    anleitungSetzen(T.anleitung);
    sendetZeigen(i);
    if (fokusWeg) zustand.knoepfe[i].knopf.focus();
    s = zustand.sendung = { option: i, versuch: 0, still: false, pause: null, langsam: null, wiederholt: false, nachsenden: false, schonGezaehlt: null };
    s.langsam = setTimeout(function () {
      var k = zustand.knoepfe[i];
      if (zustand.sendung === s && k) k.zusatz.textContent = 'Dauert etwas länger …';
    }, LANGSAM);
    weiterSenden();
  }

  /* laufende Sendung beenden (Umentscheiden, Erfolg, endgültiger Fehler).
     Eine Anfrage, die schon unterwegs ist, bleibt unterwegs; ihr Ergebnis
     gilt dann nicht mehr, wird aber abgewartet (Reihenfolge). */
  function sendungBeenden() {
    var s = zustand.sendung;
    if (!s) return;
    clearTimeout(s.pause);
    clearTimeout(s.langsam);
    s.pause = null;
    zustand.sendung = null;
  }

  /* neueste Wahl still noch einmal senden (Nachzügler, siehe oben) */
  function stillNachsenden(i) {
    zustand.sendung = { option: i, versuch: 0, still: true, pause: null, langsam: null, wiederholt: false, nachsenden: false, schonGezaehlt: null };
    weiterSenden();
  }

  /* lohnt ein neuer Versuch? (Eingabefehler: nein) */
  function nochmalSinnvoll(fehler, daten) {
    if (fehler) return !(fehler.art === 'netz' && navigator.onLine === false);
    if (!daten || daten.ok !== false) return true;           /* unlesbare Antwort */
    if (daten.nochmal === true) return true;
    var text = String(daten.fehler || '');
    return text.indexOf(AUSGELASTET) === 0 || text.indexOf(SERVERFEHLER) === 0;
  }

  /* nächsten Versuch der aktuellen Sendung starten – sobald keine Anfrage
     mehr unterwegs ist und keine Pause läuft */
  function weiterSenden() {
    var s = zustand.sendung;
    if (!s || s.pause || zustand.laufend) return;
    if (navigator.onLine === false) { sendungEnde(s, { art: 'netz' }); return; }
    s.versuch++;
    /* start: Zeit des Losschickens – liegt vor dem Eingang beim Server (Zeitfenster) */
    var a = zustand.laufend = { option: s.option, sendung: s, start: Date.now() };
    anfrage({
      aktion: 'stimme',
      umfrage: zustand.id,
      runde: zustand.runde,
      option: s.option,
      anzahl: zustand.optionen.length,
      geraet: geraetId()
    }, function (fehler, daten) {
      zustand.laufend = null;
      if (zustand.sendung !== s) { weiterSenden(); return; }     /* überholt: neue Wahl senden */
      if (!fehler && daten && daten.ok === true) {
        s.zeit = Math.max(s.zeit || 0, a.start);
        sendungEnde(s, null, daten);
        return;
      }
      /* ein früherer Versuch dieser Sendung hat inzwischen doch gezählt (spaeteStimme) */
      if (s.schonGezaehlt) { sendungEnde(s, null, s.schonGezaehlt); return; }
      if (s.versuch < VERSUCHE && nochmalSinnvoll(fehler, daten)) {
        if (!s.still) wiederholungZeigen(s);
        s.pause = setTimeout(function () {
          s.pause = null;
          weiterSenden();
        }, PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN));
        return;
      }
      sendungEnde(s, fehler, daten);
    }, function (daten) {
      if (daten && daten.ok === true) spaeteStimme(a, daten);
    });
  }

  function wiederholungZeigen(s) {
    anleitungSetzen(T.wiederholung);
    if (!s.wiederholt) {
      s.wiederholt = true;
      ansagen(T.wiederholung.replace(/ …$/, '.'));
    }
  }

  /* Ende einer Sendung: Dank oder Fehlerkarte */
  function sendungEnde(s, fehler, daten) {
    sendungBeenden();
    var i = s.option;
    if (!fehler && daten && daten.ok === true) {
      if (!s.still) {                                        /* still: Dank steht schon */
        zustand.bisher = i;
        /* zeit: Losschicken des Versuchs, der gezählt hat (Zeitfenster, Kopf) */
        zustand.stimmeZeit = s.zeit || Date.now();
        speichern(stimmeSchluessel(), { option: i, name: zustand.optionen[i], zeit: zustand.stimmeZeit });
        dankZeigen(i, true);
        ablaufPlanen();
      } else if (zustand.bisher === i && s.zeit > zustand.stimmeZeit) {
        /* still nachgesendet (dieselbe Wahl): beim Server jetzt mit späterer Zeit */
        zustand.stimmeZeit = s.zeit;
        speichern(stimmeSchluessel(), { option: i, name: zustand.optionen[i], zeit: s.zeit });
        ablaufPlanen();
      }
      if (s.nachsenden) stillNachsenden(i);
      return;
    }
    var text;
    if (!fehler && daten && daten.ok === false) {
      text = 'Der Server meldet: ' + String(daten.fehler || 'unbekannter Fehler').slice(0, 200);
    } else if (fehler && fehler.art === 'zeit') {
      text = 'Der Server antwortet gerade nicht. Bitte nochmal versuchen.';
    } else if (fehler && fehler.art === 'netz' && navigator.onLine === false) {
      text = T.offline;
    } else {
      /* 'netz' bei bestehender Verbindung oder 'antwort': Häufigste Ursache ist
         eine Web-App, die nicht für „Jeder“ bereitgestellt ist – Google liefert
         dann eine Anmeldeseite, die der Browser als Skript ablehnt (onerror)
         oder ohne Rückruf lädt (onload). Für das Publikum neutral bleiben. */
      text = T.netz;
      console.warn('abstimmen.html: Die Web-App hat nicht mit JSONP geantwortet (' + (fehler ? fehler.art : '–') + ', ' + s.versuch + ' Versuche) – ist sie für „Jeder“ bereitgestellt, nicht archiviert, und endet liveQuelle auf /exec? Sonst Internet prüfen.');
    }
    if (s.still) {
      console.warn('abstimmen.html: Nachsenden der neuesten Stimme fehlgeschlagen – eine ältere Stimme dieses Handys könnte zählen. (' + text + ')');
      return;
    }
    fehlerZeigen(i, text);
  }

  /* Eine aufgegebene Anfrage (Zeitlimit) hat doch noch gezählt.
     • Aus der laufenden Sendung (dieselbe Wahl): Die Stimme steht. In der
       Pause gleich „Danke“; ist schon der nächste Versuch unterwegs, „Danke“
       nach dessen Antwort – auch wenn er am Andrang scheitert (s.schonGezaehlt).
       Für die Reihenfolge unschädlich: dieselbe Wahl, dieselbe Geräte-ID.
     • War es ein anderes Tier als die neueste Wahl, könnte sie diese überholt
       haben (siehe NACHZÜGLER oben). */
  function spaeteStimme(a, daten) {
    var s = zustand.sendung;
    if (s && a.sendung === s) {
      s.zeit = Math.max(s.zeit || 0, a.start);              /* Zeitfenster: dieser Versuch hat gezählt */
      if (zustand.laufend && zustand.laufend.sendung === s) s.schonGezaehlt = daten;
      else sendungEnde(s, null, daten);
      return;
    }
    var neueste = s ? s.option : zustand.bisher;
    if (neueste < 0 || neueste === a.option) return;
    if (s) {
      /* Ist die neueste Wahl gerade unterwegs, kam sie womöglich vor dem
         Nachzügler an → nach ihrer Bestätigung noch einmal senden. Sonst geht
         ihr nächster Versuch ohnehin erst jetzt los. */
      if (zustand.laufend && zustand.laufend.sendung === s) s.nachsenden = true;
      return;
    }
    stillNachsenden(neueste);
  }

  /* ---------------------------------------------------------------------------
     ZEITFENSTER (Kopf): abgelaufene Stimme → wieder die Auswahl
     --------------------------------------------------------------------------- */
  function stimmeSchluessel() { return 'stimme:' + zustand.id + ':' + zustand.runde; }

  /* marke.js → gueltigMinuten: ganze Zahl 1–1440 → ms; 0, leer, fehlend → 0
     (ohne Zeitgrenze); sonst Warnung und 0 – dieselbe Regel wie auf Folie 08 */
  function fensterVon(konfig) {
    var roh = konfig.gueltigMinuten;
    if (roh === undefined || roh === null || roh === '' || roh === 0 || roh === '0') return 0;
    var zahl = (typeof roh === 'number' || typeof roh === 'string') ? Number(roh) : NaN;
    if (Math.floor(zahl) === zahl && zahl >= 1 && zahl <= HOECHSTENS_MINUTEN) return zahl * 60000;
    console.warn('abstimmen.html: marke.js → umfragen.' + zustand.id + '.gueltigMinuten muss eine ganze Zahl von 1 bis ' +
      HOECHSTENS_MINUTEN + ' sein (oder 0/leer) – die Seite rechnet ohne Zeitgrenze.');
    return 0;
  }

  /* Zählt die gespeicherte bzw. bestätigte Stimme (Zeit des Losschickens)
     nicht mehr? Ohne Zeitstempel (Speicher von vor dem 20.10.2026): abgelaufen. */
  function istAbgelaufen(zeit) {
    if (!zustand.fenster) return false;
    return !(typeof zeit === 'number' && zeit > 0 && Date.now() - zeit <= zustand.fenster);
  }

  var ablaufUhr = null;
  function ablaufPlanen() {
    clearTimeout(ablaufUhr);
    ablaufUhr = null;
    if (!zustand.fenster || zustand.bisher < 0) return;
    /* eine Sekunde nach dem Ablauf; Uhren im Hintergrund-Tab können später
       laufen – dafür prüfen visibilitychange und pageshow (unten) noch einmal */
    var rest = zustand.stimmeZeit + zustand.fenster - Date.now();
    ablaufUhr = setTimeout(ablaufPruefen, Math.max(0, rest) + 1000);
  }

  /* Abgelaufen: Wahl vergessen und – wenn „Danke“ oder die Auswahl zu sehen
     ist – die Auswahl ohne „bisherige Wahl“ zeigen. Eine laufende Sendung
     (neue Wahl) oder eine Fehlerkarte bleibt stehen; ein stilles Nachsenden
     (NACHZÜGLER) hält die Auswahl nicht auf – sonst bliebe „Danke“ stehen. */
  function ablaufPruefen() {
    if (!zustand.fenster || zustand.bisher < 0) return;
    if (!istAbgelaufen(zustand.stimmeZeit)) { ablaufPlanen(); return; }
    clearTimeout(ablaufUhr);
    ablaufUhr = null;
    zustand.bisher = -1;
    zustand.stimmeZeit = 0;
    entfernen(stimmeSchluessel());
    if (zustand.sendung && !zustand.sendung.still) return;
    var danke = !!$('meldung').querySelector('.karte--danke');
    if (danke || !$('auswahl').hidden) auswahlZeigen();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') ablaufPruefen();
  });
  window.addEventListener('pageshow', function () { ablaufPruefen(); });

  /* ---------------------------------------------------------------------------
     START
     --------------------------------------------------------------------------- */
  function start() {
    if (!m) {
      T = TEXTE.sie;
      hinweisZeigen('Seite nicht vollständig geladen', 'Bitte laden Sie die Seite neu.');
      return;
    }
    farbenSetzen();
    platzhalterSetzen();
    alteGeraetIdEntfernen();

    var parameter = new URLSearchParams(location.search);
    var umfragen = m.umfragen || {};
    var id = parameter.get('u') || Object.keys(umfragen)[0] || '';
    var konfig = MUSTER_NAME.test(id) && Object.prototype.hasOwnProperty.call(umfragen, id) ? umfragen[id] : null;
    var anrede = String((konfig && konfig.anrede) || m.anrede || 'Sie').toLowerCase();
    T = (anrede === 'du' || anrede === 'ihr') ? TEXTE.du : TEXTE.sie;

    if (!konfig || !Array.isArray(konfig.optionen) || !konfig.optionen.length) {
      frageSetzen('Live-Abstimmung');
      hinweisZeigen('Diese Abstimmung gibt es nicht', 'Bitte den QR-Code auf der Folie nochmal scannen.');
      console.warn('abstimmen.html: Umfrage „' + id + '“ fehlt in marke.js → umfragen.');
      return;
    }
    zustand.id = id;
    zustand.konfig = konfig;
    if (konfig.optionen.length > MAX_OPTIONEN) {
      console.warn('abstimmen.html: Höchstens ' + MAX_OPTIONEN + ' Optionen – die übrigen werden nicht gezeigt.');
    }
    zustand.optionen = konfig.optionen.slice(0, MAX_OPTIONEN).map(function (o) { return markeText(o); });
    zustand.runde = String(konfig.runde || '').trim();
    zustand.fenster = fensterVon(konfig);
    zustand.quelle = quelleBestimmen(konfig, parameter);
    frageSetzen(konfig.frage || 'Live-Abstimmung');
    $('anleitung').textContent = T.anleitung;

    /* Neutraler Hinweis – stimmt vor und nach dem Vortrag (dann ist liveQuelle
       wieder leer), z. B. für Fotos der Folie oder Prüfbilder mit QR-Code.
       PDF und Exportbilder zeigen Folie 08 im Endzustand, ohne QR-Code. */
    if (!zustand.quelle) {
      hinweisZeigen('Die Abstimmung ist gerade nicht geöffnet', T.geschlossen);
      return;
    }
    if (!MUSTER_NAME.test(zustand.runde)) {
      console.warn('abstimmen.html: marke.js → umfragen.' + id + '.runde fehlt oder enthält andere Zeichen als A–Z a–z 0–9 _ - (höchstens 40).');
      hinweisZeigen('Die Abstimmung ist gerade nicht geöffnet', T.geschlossen);
      return;
    }

    document.documentElement.classList.add('ist-offen');
    auswahlBauen();
    /* schon abgestimmt (z. B. QR-Code nochmal gescannt)? Dann gleich den Dank –
       außer die Stimme ist nach dem Zeitfenster abgelaufen (zählt nicht mehr) */
    var frueher = laden(stimmeSchluessel());
    var bekannt = frueher && typeof frueher.option === 'number' && zustand.optionen[frueher.option] === frueher.name;
    if (bekannt && !istAbgelaufen(frueher.zeit)) {
      zustand.bisher = frueher.option;
      zustand.stimmeZeit = typeof frueher.zeit === 'number' ? frueher.zeit : 0;
      dankZeigen(frueher.option, false);
      ablaufPlanen();
    } else {
      if (bekannt) entfernen(stimmeSchluessel());
      auswahlZeigen();
    }
  }

  /* marke.js laden: über http(s) mit ?v=<Zeit>, damit Handys nicht eine ältere
     Fassung aus dem Zwischenspeicher nehmen (GitHub Pages: bis zu 10 Minuten).
     Als Datei (file://) ohne Zusatz. */
  function markeLaden(fertig) {
    if (window.MARKE) { fertig(); return; }
    var skript = document.createElement('script');
    var frisch = /^https?:$/.test(location.protocol) ? '?v=' + Date.now().toString(36) : '';
    skript.src = 'marke.js' + frisch;
    skript.onload = fertig;
    skript.onerror = fertig;
    document.head.appendChild(skript);
  }

  markeLaden(function () {
    m = window.MARKE || null;
    start();
  });
})();
