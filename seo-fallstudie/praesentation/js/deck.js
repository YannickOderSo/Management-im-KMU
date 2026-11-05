/* =============================================================================
   deck.js – die „Engine“ der Web-Präsentation
   -----------------------------------------------------------------------------
   Läuft ohne Server und ohne Internet (Doppelklick auf index.html).
   Funktionen: Bühne skalieren, Navigation (Tastatur, Clicker, Wischen,
   Bedienleiste), Schritte und Animationen, Folienübergänge mit View
   Transitions, Adresse #f06.2, Übersicht, Hilfe, Schwarzbild, Themen,
   Sprungmenü, Referentenansicht (zweites Fenster), Druck/PDF.

   Schnittstelle für Folien-Skripte (ausführlich in AUTOREN.md):
     Deck.registriere('f06', { einrichten, betreten, verlassen, schritt, druck, vorschau })
     Deck.zustand()   Deck.gehe(folie, schritt)   Deck.weiter()   Deck.zurueck()
     Deck.springe(folie, schritt) – Sprung per Klick auf der Folie; wirkt auch
       aus dem Referentenfenster auf den Beamer (seit 21.10.2026), dort aber
       erst in der Fragerunde (ab Folie 12 bzw. Backup)
     Deck.marke       Deck.util   Deck.folien()   Deck.feldZiel(feld)
     Ereignisse auf document: 'deck:bereit', 'deck:folie', 'deck:schritt',
       'deck:wechsel-ende' (Folienwechsel fertig; währenddessen html.wechsel-laeuft)
     Kontext ctx der Hooks: … ctx.sofort = Folie ohne Übergang erreicht

   Aufbau dieser Datei
     1.  Konfiguration (marke.js) und Adress-Parameter
     2.  Hilfsfunktionen (Deck.util)
     3.  Thema und Modus
     4.  Platzhalter ([Marke], Gruppe, Datum …)
     5.  Folien sammeln, Laufkopf, Mini-Steuerrad
     6.  Bausteine und Folien-Skripte (Registrierung)
     7.  Schritte und Animationen
     8.  Navigation und Übergänge
     9.  Bedienung: Tastatur, Wischen, Bedienleiste
     10. Ebenen: Übersicht, Hilfe, Sprungmenü, Hinweise, Schwarzbild
     11. Kanal: Abgleich zwischen Vortrags- und Referentenfenster
     12. Referentenansicht
     13. Druck und PDF
     14. Start
   ============================================================================= */
(function () {
  'use strict';

  var Deck = window.Deck = window.Deck || {};
  var html = document.documentElement;


  /* ===========================================================================
     1. KONFIGURATION UND ADRESS-PARAMETER
     =========================================================================== */

  /* Standardwerte – werden von window.MARKE (marke.js) überschrieben */
  var STANDARD = {
    name: '',
    kurz: '',
    farben: { primaer: '', sekundaer: '' },
    logo: 'bilder/platzhalter-logo.svg',
    raetselBild: 'bilder/platzhalter-raetsel.svg',
    gruppe: [],
    datum: '',
    veranstaltung: '',
    dozent: '',
    hochschule: '',
    titel: 'Brand Persona & Markenidentität',
    fallstudie: '',
    dauerMinuten: 15,
    anrede: 'Sie',
    umfragen: {},
    wortwolken: {},
    optionaleFolien: {},
    beispieldatenHinweis: true,
    standardThema: 'editorial',
    standardModus: 'hell'
  };

  function mische(basis, extra) {
    var ergebnis = {};
    Object.keys(basis).forEach(function (k) { ergebnis[k] = basis[k]; });
    Object.keys(extra || {}).forEach(function (k) {
      var wert = extra[k];
      if (wert && typeof wert === 'object' && !Array.isArray(wert) && basis[k] && typeof basis[k] === 'object' && !Array.isArray(basis[k])) {
        ergebnis[k] = mische(basis[k], wert);
      } else if (wert !== undefined && wert !== null) {
        ergebnis[k] = wert;
      }
    });
    return ergebnis;
  }

  var marke = mische(STANDARD, window.MARKE || {});
  /* ältere Schreibweise (primaer/sekundaer direkt im Objekt) ebenfalls erlauben */
  if (window.MARKE && window.MARKE.primaer && !marke.farben.primaer) marke.farben.primaer = window.MARKE.primaer;
  if (window.MARKE && window.MARKE.sekundaer && !marke.farben.sekundaer) marke.farben.sekundaer = window.MARKE.sekundaer;
  Deck.marke = marke;

  var parameter = new URLSearchParams(location.search);
  var IST_REFERENT = parameter.has('referent');
  var IST_DRUCK_URL = parameter.has('druck');
  var MIT_NOTIZEN = parameter.has('notizen');
  if (parameter.has('aufnahme')) html.classList.add('aufnahme');

  var THEMEN = ['editorial', 'bento', 'keynote'];
  var THEMEN_NAMEN = { editorial: 'Editorial', bento: 'Bento', keynote: 'Keynote' };
  var MODI = ['hell', 'dunkel'];

  /* Felder des Markensteuerrads (nach Esch, Namen wie in der Vorlesung –
     Stenger, S. 60, 90–91; seit Mi, 21.10.2026, Abgleich Vorlesung #27/#29:
     „Markenkern“ statt „Markenkompetenz“, „Markeneigenschaften“ statt
     „Markenattribute“). Gleiche Namen wie FELDER in js/komponenten.js. */
  var FELD_NAMEN = {
    kompetenz: 'Markenkern',
    attribute: 'Markeneigenschaften',
    nutzen: 'Markennutzen',
    tonalitaet: 'Markentonalität',
    bild: 'Markenbild',
    persona: 'Brand Persona',
    hub: 'Markensteuerrad',
    leer: ''
  };
  Deck.FELD_NAMEN = FELD_NAMEN;


  /* ===========================================================================
     2. HILFSFUNKTIONEN  (für Folien-Skripte als Deck.util verfügbar)
     =========================================================================== */
  var util = Deck.util = {};

  function alle(selektor, wurzel) {
    return Array.prototype.slice.call((wurzel || document).querySelectorAll(selektor));
  }
  util.alle = alle;

  /* Bewegung reduziert? (Betriebssystem-Einstellung oder ?bewegung=reduziert) */
  var mqReduziert = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function bewegungReduziert() {
    return html.classList.contains('bewegung-reduziert') || !!(mqReduziert && mqReduziert.matches);
  }
  if (parameter.get('bewegung') === 'reduziert') html.classList.add('bewegung-reduziert');
  util.bewegungReduziert = bewegungReduziert;

  /* Zahl im deutschen Format: zahlFormat(2.8, 1, { vorzeichen: true }) → „+2,8“ */
  util.zahlFormat = function (wert, dezimalen, optionen) {
    dezimalen = dezimalen || 0;
    optionen = optionen || {};
    var n = Number(wert) || 0;
    var text = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: dezimalen,
      maximumFractionDigits: dezimalen
    }).format(Math.abs(n));
    var gerundet = Number(n.toFixed(dezimalen));
    if (gerundet < 0) text = '−' + text;                  // echtes Minuszeichen
    else if (optionen.vorzeichen && gerundet > 0) text = '+' + text;
    return text;
  };

  /* Prozent: prozentFormat(0.342) → „34 %“ (mit schmalem geschütztem Leerzeichen) */
  util.prozentFormat = function (anteil, dezimalen) {
    return util.zahlFormat(anteil * 100, dezimalen || 0) + ' %';
  };

  /* Zeit: zeitFormat(95) → „1:35“ */
  util.zeitFormat = function (sekunden) {
    var negativ = sekunden < 0;
    sekunden = Math.floor(Math.abs(sekunden));
    var m = Math.floor(sekunden / 60);
    var s = sekunden % 60;
    return (negativ ? '−' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  /* Warten: await Deck.util.warte(300) */
  util.warte = function (ms) {
    return new Promise(function (fertig) { setTimeout(fertig, ms); });
  };

  /* Dauer- und Größen-Tokens aus tokens.css lesen (in ms bzw. px) */
  var tokenCache = {};
  function token(name) {
    if (tokenCache[name] !== undefined) return tokenCache[name];
    var roh = getComputedStyle(html).getPropertyValue(name).trim();
    var wert = parseFloat(roh);
    if (!/ms$/.test(roh) && /s$/.test(roh)) wert = wert * 1000;   // Sekunden → ms
    if (isNaN(wert)) wert = 0;
    tokenCache[name] = wert;
    return wert;
  }
  function tokenRoh(name) {
    return getComputedStyle(html).getPropertyValue(name).trim();
  }
  util.token = token;
  util.dauer = function (name) { return token('--dauer-' + name); };

  /* Bewegungskurve aus tokens.css für Web-Animationen:
     util.kurve() → --kurve, util.kurve('feder') → --kurve-feder (echte Feder per
     linear(), sonst cubic-bezier-Ersatz), util.kurve('wechsel') → --kurve-wechsel */
  util.kurve = function (name) {
    var wert = tokenRoh(name ? '--kurve-' + name : '--kurve').replace(/\s+/g, ' ');
    var geht = false;
    try { geht = !!wert && (!window.CSS || !CSS.supports || CSS.supports('animation-timing-function', wert)); } catch (e) { geht = false; }
    if (geht) return wert;
    return name === 'feder' ? 'cubic-bezier(0.34, 1.36, 0.64, 1)' : 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  };

  /* Animation mit Beachtung von „Bewegung reduzieren“.
     animiere(element, keyframes, { duration, delay, easing, fill })
     Bei reduzierter Bewegung wird nur die Deckkraft weich überblendet
     (oder sofort der Endzustand gezeigt). Gibt immer ein Objekt mit
     .finished (Promise) und .cancel() zurück. */
  var laufendeAnimationen = new Set();
  util.animiere = function (element, keyframes, optionen) {
    optionen = Object.assign({ duration: token('--dauer-mittel'), easing: util.kurve(), fill: 'backwards' }, optionen || {});
    if (!element || !element.animate) {
      return { finished: Promise.resolve(), cancel: function () {}, finish: function () {} };
    }
    if (bewegungReduziert() || testSofort) {
      var nurDeckkraft = keyframes.map(function (k) {
        return k.opacity !== undefined ? { opacity: k.opacity } : {};
      });
      var hatDeckkraft = nurDeckkraft.some(function (k) { return k.opacity !== undefined; });
      if (!hatDeckkraft || testSofort) {
        return { finished: Promise.resolve(), cancel: function () {}, finish: function () {} };
      }
      optionen = Object.assign({}, optionen, { duration: Math.min(200, optionen.duration || 200), delay: 0, easing: 'linear' });
      keyframes = nurDeckkraft;
    }
    var animation = element.animate(keyframes, optionen);
    laufendeAnimationen.add(animation);
    var weg = function () { laufendeAnimationen.delete(animation); };
    animation.finished.then(weg, weg);
    return animation;
  };

  /* SVG-Element erzeugen: svg('circle', { cx: 10, cy: 10, r: 4 }, elternElement) */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  util.svg = function (tag, attribute, eltern) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attribute || {}).forEach(function (k) {
      if (attribute[k] !== undefined && attribute[k] !== null) el.setAttribute(k, attribute[k]);
    });
    if (eltern) eltern.appendChild(el);
    return el;
  };
  /* HTML-Element erzeugen: element('div', { class: 'karte' }, 'Text', eltern) */
  util.element = function (tag, attribute, text, eltern) {
    var el = document.createElement(tag);
    Object.keys(attribute || {}).forEach(function (k) {
      if (attribute[k] !== undefined && attribute[k] !== null && attribute[k] !== false) el.setAttribute(k, attribute[k]);
    });
    if (text !== undefined && text !== null) el.textContent = text;
    if (eltern) eltern.appendChild(el);
    return el;
  };
  /* Punkt auf einem Kreis (Winkel in Grad, 0° = rechts, 90° = unten) */
  util.polar = function (cx, cy, r, winkel) {
    var w = winkel * Math.PI / 180;
    return { x: cx + r * Math.cos(w), y: cy + r * Math.sin(w) };
  };
  /* Kreisbogen als SVG-Pfad (im Uhrzeigersinn von start nach ende) */
  util.bogen = function (cx, cy, r, start, ende) {
    var a = util.polar(cx, cy, r, start);
    var b = util.polar(cx, cy, r, ende);
    var gross = ((ende - start) % 360 + 360) % 360 > 180 ? 1 : 0;
    return 'M' + rund(a.x) + ' ' + rund(a.y) + ' A' + r + ' ' + r + ' 0 ' + gross + ' 1 ' + rund(b.x) + ' ' + rund(b.y);
  };
  function rund(x) { return Math.round(x * 100) / 100; }
  util.rund = rund;

  /* Text sicher in HTML einsetzen */
  util.escape = function (text) {
    return String(text === undefined || text === null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* „[Marke]“ und „[Marke kurz]“ in Texten aus marke.js ersetzen */
  util.markeText = function (text) {
    return String(text || '')
      .replace(/\[Marke kurz\]/g, marke.kurz || marke.name || '[Marke]')
      .replace(/\[Marke\]/g, marke.name || '[Marke]');
  };

  /* Pfad relativ zum Präsentationsordner (funktioniert auch für Kopien in Unterordnern) */
  util.pfad = function (relativ) {
    if (!relativ) return relativ;
    if (/^([a-z]+:|\/|#|data:)/i.test(relativ)) return relativ;
    return (window.DECK_BASIS || '') + relativ;
  };

  /* Speichern im Browser (localStorage) – immer mit try/catch, weil der
     Speicher gesperrt sein kann (privates Fenster, Richtlinien). */
  var SPEICHER_PRAEFIX = 'deck:' + location.pathname + ':';
  util.laden = function (schluessel, standard) {
    try {
      var roh = window.localStorage.getItem(SPEICHER_PRAEFIX + schluessel);
      return roh === null ? standard : JSON.parse(roh);
    } catch (e) {
      return standard;
    }
  };
  util.speichern = function (schluessel, wert) {
    try {
      if (wert === undefined || wert === null) window.localStorage.removeItem(SPEICHER_PRAEFIX + schluessel);
      else window.localStorage.setItem(SPEICHER_PRAEFIX + schluessel, JSON.stringify(wert));
      return true;
    } catch (e) {
      return false;
    }
  };
  util.speicherSchluessel = function (schluessel) { return SPEICHER_PRAEFIX + schluessel; };
  function sitzungLaden(schluessel) {
    try { return window.sessionStorage.getItem(SPEICHER_PRAEFIX + schluessel); } catch (e) { return null; }
  }
  function sitzungSpeichern(schluessel, wert) {
    try { window.sessionStorage.setItem(SPEICHER_PRAEFIX + schluessel, wert); } catch (e) { /* egal */ }
  }

  /* Zahl hochzählen lassen: zaehle(element, 0, 2.8, { dezimalen: 1, einheit: ' Pkt.', vorzeichen: true }) */
  util.zaehle = function (element, von, bis, optionen) {
    optionen = optionen || {};
    var dezimalen = optionen.dezimalen || 0;
    var einheit = optionen.einheit || '';
    var dauer = optionen.dauer || token('--dauer-lang');
    var verzoegerung = optionen.verzoegerung || 0;
    var format = function (wert) {
      return util.zahlFormat(wert, dezimalen, { vorzeichen: optionen.vorzeichen }) + einheit;
    };
    var kennung = (element._zaehlKennung || 0) + 1;
    element._zaehlKennung = kennung;
    if (bewegungReduziert() || testSofort || dauer <= 1) {
      element.textContent = format(bis);
      return Promise.resolve();
    }
    element.textContent = format(von);
    return new Promise(function (fertig) {
      var start = null;
      function rahmen(zeit) {
        if (element._zaehlKennung !== kennung) { fertig(); return; }
        if (start === null) start = zeit + verzoegerung;
        var t = Math.min(1, Math.max(0, (zeit - start) / dauer));
        var e = 1 - Math.pow(1 - t, 3);                            // weiches Abbremsen
        element.textContent = format(von + (bis - von) * e);
        if (t < 1) requestAnimationFrame(rahmen);
        else fertig();
      }
      requestAnimationFrame(rahmen);
    });
  };

  /* Anrede aus marke.js: Deck.util.anrede('Rufen Sie …', 'Ruft …') */
  util.anrede = function (sieForm, ihrForm) {
    return (String(marke.anrede).toLowerCase() === 'ihr' || String(marke.anrede).toLowerCase() === 'du') ? ihrForm : sieForm;
  };


  /* ===========================================================================
     3. THEMA UND MODUS
     =========================================================================== */
  function anfangsThema() {
    var t = parameter.get('thema') || sitzungLaden('thema') || marke.standardThema;
    return THEMEN.indexOf(t) >= 0 ? t : 'editorial';
  }
  function anfangsModus() {
    var m = parameter.get('modus') || sitzungLaden('modus') || marke.standardModus;
    return MODI.indexOf(m) >= 0 ? m : 'hell';
  }

  /* Markenfarben: marke.js → farben. Zum Ausprobieren überschreiben (nur in
     diesem Tab, ohne marke.js zu ändern): Farbwähler in der Bedienleiste oder
     Adresse ?primaer=E30613&sekundaer=1D1D1B. „Zurück“ stellt marke.js her. */
  var farbTest = { primaer: '', sekundaer: '' };
  function hexNormal(wert) {
    var w = String(wert || '').trim();
    if (!w) return '';
    if (/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(w)) w = '#' + w;
    return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(w) ? w : '';
  }
  ['primaer', 'sekundaer'].forEach(function (n) {
    farbTest[n] = hexNormal(parameter.get(n)) || hexNormal(sitzungLaden('farbe-' + n));
  });
  function markenfarbenSetzen() {
    var f = marke.farben || {};
    ['primaer', 'sekundaer'].forEach(function (n) {
      var wert = farbTest[n] || hexNormal(f[n]);
      if (wert) html.style.setProperty('--marke-' + n, wert);
      else html.style.removeProperty('--marke-' + n);
    });
    tokenCache = {};
  }
  /* Farbe testen: Deck.farbe('primaer', '#E30613') · Deck.farbe() = zurück zu marke.js */
  Deck.farbe = function (name, wert, optionen) {
    optionen = optionen || {};
    if (!name) { farbTest.primaer = ''; farbTest.sekundaer = ''; }
    else if (farbTest.hasOwnProperty(name)) farbTest[name] = hexNormal(wert);
    ['primaer', 'sekundaer'].forEach(function (n) { sitzungSpeichern('farbe-' + n, farbTest[n]); });
    markenfarbenSetzen();
    farbWaehlerAktualisieren();
    if (!optionen.still) kanalZustandSenden();
    document.dispatchEvent(new CustomEvent('deck:thema', { detail: { thema: html.getAttribute('data-thema'), modus: html.getAttribute('data-modus'), farben: Object.assign({}, farbTest) } }));
  };
  /* Aktuell wirksame Markenfarbe als #rrggbb (für den Farbwähler) */
  function farbeAlsHex(name) {
    var roh = getComputedStyle(html).getPropertyValue('--marke-' + name).trim();
    if (/^#[0-9a-f]{6}$/i.test(roh)) return roh.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(roh)) return ('#' + roh[1] + roh[1] + roh[2] + roh[2] + roh[3] + roh[3]).toLowerCase();
    try {
      var c = document.createElement('canvas').getContext('2d');
      c.fillStyle = roh;
      return /^#[0-9a-f]{6}$/i.test(c.fillStyle) ? c.fillStyle : '#808080';
    } catch (e) { return '#808080'; }
  }
  function farbWaehlerAktualisieren() {
    if (!leiste) return;
    alle('input[data-farbe]', leiste).forEach(function (eingabe) {
      eingabe.value = farbeAlsHex(eingabe.getAttribute('data-farbe'));
    });
    var zurueckKnopf = leiste.querySelector('[data-aktion="farben-zurueck"]');
    if (zurueckKnopf) zurueckKnopf.hidden = !farbTest.primaer && !farbTest.sekundaer;
  }

  function themaSetzen(thema, modus, optionen) {
    optionen = optionen || {};
    if (THEMEN.indexOf(thema) < 0) thema = 'editorial';
    if (MODI.indexOf(modus) < 0) modus = 'hell';
    var geaendert = html.getAttribute('data-thema') !== thema || html.getAttribute('data-modus') !== modus;
    html.setAttribute('data-thema', thema);
    html.setAttribute('data-modus', modus);
    tokenCache = {};
    if (optionen.merken) {
      sitzungSpeichern('thema', thema);
      sitzungSpeichern('modus', modus);
    }
    if (geaendert && optionen.melden) {
      bedienHinweis('Thema: ' + THEMEN_NAMEN[thema] + ' · ' + (modus === 'hell' ? 'hell' : 'dunkel'));
    }
    if (geaendert && !optionen.still) kanalZustandSenden();
    if (geaendert) {
      farbWaehlerAktualisieren();
      document.dispatchEvent(new CustomEvent('deck:thema', { detail: { thema: thema, modus: modus } }));
      /* Schriften des neuen Themas laden, dann Bausteine nachmessen lassen */
      schriftenLaden().then(function () {
        tokenCache = {};
        document.dispatchEvent(new CustomEvent('deck:groesse', { detail: { thema: thema, modus: modus } }));
      });
    }
  }

  /* Schriften des aktuellen Themas laden (lokale Dateien, dauert Millisekunden).
     Wichtig, damit Bausteine erst messen, wenn die echte Schrift da ist. */
  function schriftenLaden() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var stil = getComputedStyle(html);
    var familien = ['--schrift-display', '--schrift-text', '--schrift-zahl', '--schrift-kicker'].map(function (t) {
      return stil.getPropertyValue(t).trim();
    }).filter(Boolean);
    var laden = [];
    familien.forEach(function (fam) {
      laden.push(document.fonts.load('400 40px ' + fam, 'Aäß'));
      laden.push(document.fonts.load('italic 400 40px ' + fam, 'Aäß'));
    });
    var zeitlimit = new Promise(function (fertig) { setTimeout(fertig, 2500); });
    return Promise.race([Promise.all(laden).catch(function () { /* egal */ }), zeitlimit]);
  }
  util.schriftenLaden = schriftenLaden;
  Deck.thema = function (thema, modus) {
    themaSetzen(thema || html.getAttribute('data-thema'), modus || html.getAttribute('data-modus'), { merken: true, melden: true });
  };
  function naechstesThema(schritt) {
    var i = THEMEN.indexOf(html.getAttribute('data-thema'));
    var neu = THEMEN[(i + (schritt || 1) + THEMEN.length) % THEMEN.length];
    themaSetzen(neu, html.getAttribute('data-modus'), { merken: true, melden: true });
  }
  function modusWechseln() {
    var neu = html.getAttribute('data-modus') === 'dunkel' ? 'hell' : 'dunkel';
    themaSetzen(html.getAttribute('data-thema'), neu, { merken: true, melden: true });
  }


  /* ===========================================================================
     4. PLATZHALTER
     <span data-marke></span>            → Markenname (lang)
     <span data-marke="kurz"></span>     → Kurzname
     data-gruppe, data-datum ("lang"), data-veranstaltung, data-dozent,
     data-hochschule, data-praesentation (Titel), data-fallstudie
     <img data-marke-logo>               → Logo aus marke.js (logo, Wortmarke)
     <img data-marke-logo="titel">       → Logo der Titelfolie aus marke.js (logoTitel,
                                           z. B. Folie 12); ohne Eintrag wird das Bild ausgeblendet
     data-anrede-sie="…" data-anrede-ihr="…" → Text je nach Anrede
     data-umfrage-frage="tier"           → Frage der Umfrage aus marke.js
     =========================================================================== */
  function datumText(art) {
    if (!marke.datum) return '';
    var teile = String(marke.datum).split('-');
    if (teile.length !== 3) return String(marke.datum);
    var d = new Date(Number(teile[0]), Number(teile[1]) - 1, Number(teile[2]));
    if (art === 'lang') {
      return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  }

  function platzhalterFuellen(wurzel) {
    wurzel = wurzel || document;
    alle('[data-marke]', wurzel).forEach(function (el) {
      var kurz = el.getAttribute('data-marke') === 'kurz';
      var text = kurz ? (marke.kurz || marke.name) : marke.name;
      if (text) el.textContent = text;
      else if (!el.textContent.trim()) el.textContent = '[Marke]';
      el.classList.toggle('ist-platzhalter', !text);
    });
    alle('[data-gruppe]', wurzel).forEach(function (el) {
      var namen = Array.isArray(marke.gruppe) ? marke.gruppe : [marke.gruppe];
      if (el.getAttribute('data-gruppe') === 'zeilen') {
        el.innerHTML = namen.map(util.escape).join('<br>');
      } else {
        el.textContent = namen.join(' · ');
      }
    });
    alle('[data-datum]', wurzel).forEach(function (el) {
      var t = datumText(el.getAttribute('data-datum'));
      if (t) el.textContent = t;
    });
    [['data-veranstaltung', 'veranstaltung'], ['data-dozent', 'dozent'], ['data-hochschule', 'hochschule'],
      ['data-praesentation', 'titel'], ['data-fallstudie', 'fallstudie'], ['data-unternehmen', 'unternehmen']].forEach(function (paar) {
      alle('[' + paar[0] + ']', wurzel).forEach(function (el) {
        if (marke[paar[1]]) el.textContent = marke[paar[1]];
      });
    });
    alle('img[data-marke-logo]', wurzel).forEach(function (el) {
      /* data-marke-logo="titel" → zweite Logo-Variante (logoTitel, Folie 01/12);
         fehlt sie, bleibt das Bild ausgeblendet (17.10.2026) */
      var titel = el.getAttribute('data-marke-logo') === 'titel';
      var pfad = titel ? (marke.logoTitel || '') : marke.logo;
      if (pfad) el.setAttribute('src', util.pfad(pfad));
      else if (titel) el.hidden = true;
      if (!el.getAttribute('alt')) el.setAttribute('alt', 'Logo ' + (marke.name || '[Marke]'));
    });
    /* Frage einer Umfrage aus marke.js, z. B. als Folientitel:
       <h2 class="titel" data-umfrage-frage="tier"></h2> */
    alle('[data-umfrage-frage]', wurzel).forEach(function (el) {
      var u = (marke.umfragen || {})[el.getAttribute('data-umfrage-frage')];
      if (u && u.frage) el.textContent = util.markeText(u.frage);
    });
    alle('[data-anrede-sie]', wurzel).forEach(function (el) {
      el.textContent = util.anrede(el.getAttribute('data-anrede-sie'), el.getAttribute('data-anrede-ihr') || el.getAttribute('data-anrede-sie'));
    });
    html.classList.toggle('ohne-beispielhinweis', marke.beispieldatenHinweis === false);
  }
  Deck.platzhalterFuellen = platzhalterFuellen;


  /* ===========================================================================
     5. FOLIEN SAMMELN, LAUFKOPF, MINI-STEUERRAD
     =========================================================================== */
  var buehne = null;          // <main class="buehne">
  var deckEl = null;          // <div class="deck">
  var folien = [];            // Navigationsreihenfolge: Hauptfolien, dann Backup
  var folienNachId = {};
  var anzahlHaupt = 0;
  var aktuell = { index: -1, schritt: 0 };

  function zweistellig(n) { return (n < 10 ? '0' : '') + n; }

  /* Angezeigte Foliennummer: data-nummer, sonst aus der ID (f06 → „06“,
     f01b → „01b“, b3 → „B3“; Demo: d04 → „04“, db2 → „B2“), sonst laufend. */
  function nummerFuer(el, laufendeNummer) {
    if (el.hasAttribute('data-nummer')) return el.getAttribute('data-nummer');
    var id = el.id || '';
    var m = /^[a-z]?b(\d+)$/i.exec(id);
    if (m && el.hasAttribute('data-backup')) return 'B' + Number(m[1]);
    m = /^[a-z]{1,2}(\d+)([a-z]*)$/i.exec(id);
    if (m && !el.hasAttribute('data-backup')) return zweistellig(Number(m[1])) + m[2];
    return el.hasAttribute('data-backup') ? 'B' + laufendeNummer : zweistellig(laufendeNummer);
  }

  function datenLesen(el) {
    var skript = el.querySelector(':scope > script.daten, :scope > script[type="application/json"]');
    if (!skript) return null;
    try {
      return JSON.parse(skript.textContent);
    } catch (e) {
      console.error('Folie „' + el.id + '“: JSON in <script class="daten"> ist fehlerhaft – ' + e.message);
      return null;
    }
  }

  /* Optionale Folien zeigen? marke.js → optionaleFolien, oder zum Proben/Testen
     per Adresse: ?optional=alle bzw. ?optional=f01b,f05 */
  var OPTIONAL_PARAM = (parameter.get('optional') || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  function optionalAn(id) {
    if (OPTIONAL_PARAM.indexOf('alle') >= 0 || OPTIONAL_PARAM.indexOf(id) >= 0) return true;
    return !!(marke.optionaleFolien && marke.optionaleFolien[id]);
  }

  function folienSammeln() {
    var roh = alle(':scope > section.folie', buehne);
    var haupt = [];
    var backup = [];
    var gesehen = {};
    roh.forEach(function (el, i) {
      if (!el.id) el.id = 'folie-' + (i + 1);
      if (gesehen[el.id]) console.error('Folien-ID „' + el.id + '“ ist doppelt vergeben.');
      gesehen[el.id] = true;
      var optional = el.hasAttribute('data-optional');
      if (optional && !optionalAn(el.id)) {
        el.classList.add('ist-ausgeblendet');
        el.setAttribute('aria-hidden', 'true');
        return;
      }
      (el.hasAttribute('data-backup') ? backup : haupt).push(el);
    });
    anzahlHaupt = haupt.length;
    folien = haupt.concat(backup).map(function (el, i) {
      var f = {
        el: el,
        id: el.id,
        index: i,
        backup: el.hasAttribute('data-backup'),
        optional: el.hasAttribute('data-optional'),
        titel: el.getAttribute('data-titel') || textVon(el.querySelector('.titel')) || el.id,
        feld: el.getAttribute('data-feld') || '',
        zeit: Number(el.getAttribute('data-zeit') || 0),
        buendel: el.getAttribute('data-buendel') || '',
        nummer: nummerFuer(el, i + 1),
        daten: datenLesen(el),
        schritteGesamt: 0,
        schrittElemente: [],
        auftritt: [],
        bausteinElemente: [],
        mindestSchritte: 0
      };
      el.setAttribute('aria-roledescription', 'Folie');
      el.setAttribute('aria-label', 'Folie ' + f.nummer + ': ' + f.titel);
      folienNachId[f.id] = f;
      return f;
    });
  }

  function textVon(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  /* Ziel-Folie für ein Feld des Steuerrads (erste Hauptfolie mit diesem data-feld) */
  function feldZiel(feld) {
    if (feld === 'rahmen') feld = 'persona';
    for (var i = 0; i < folien.length; i++) {
      if (!folien[i].backup && folien[i].feld === feld) return folien[i];
    }
    return null;
  }
  Deck.feldZiel = function (feld) {
    var f = feldZiel(feld);
    if (!f) return null;
    var alleZiele = Deck.feldZiele(feld);
    var bereich = alleZiele.length > 1 && alleZiele[alleZiele.length - 1].index - alleZiele[0].index === alleZiele.length - 1
      ? alleZiele[0].nummer + '–' + alleZiele[alleZiele.length - 1].nummer : f.nummer;
    return { id: f.id, nummer: f.nummer, titel: f.titel, index: f.index, bereich: bereich };
  };
  /* Alle Hauptfolien mit diesem data-feld (z. B. Persona + Limbic Map) */
  Deck.feldZiele = function (feld) {
    if (feld === 'rahmen') feld = 'persona';
    return folien.filter(function (f) { return !f.backup && f.feld === feld; })
      .map(function (f) { return { id: f.id, nummer: f.nummer, titel: f.titel, index: f.index }; });
  };

  function laufkopfEinfuegen(f) {
    var el = f.el;
    var layout = el.getAttribute('data-layout') || 'standard';
    if (el.getAttribute('data-laufkopf') === 'aus' || layout === 'leer') return;
    if (el.querySelector(':scope > .laufkopf')) return;          // selbst geschrieben
    var kopf = document.createElement('div');
    kopf.className = 'laufkopf';
    var links = util.element('div', { class: 'laufkopf-links' }, null, kopf);
    var rechts = util.element('div', { class: 'laufkopf-rechts' }, null, kopf);

    if (layout === 'titel') {
      kopf.classList.add('laufkopf--titel');
      util.element('span', { class: 'laufkopf-titel', 'data-veranstaltung': '' }, marke.veranstaltung || 'Unternehmenskommunikation', links);
      if (marke.dozent || marke.hochschule) {
        util.element('span', { class: 'laufkopf-trenner', 'aria-hidden': 'true' }, null, links);
        util.element('span', { class: 'laufkopf-titel' }, [marke.dozent, marke.hochschule].filter(Boolean).join(' · '), links);
      }
      if (marke.fallstudie) util.element('span', { class: 'laufkopf-rubrik', 'data-fallstudie': '' }, marke.fallstudie, rechts);
    } else {
      util.element('span', { class: 'laufkopf-titel', 'data-praesentation': '' }, marke.titel, links);
      util.element('span', { class: 'laufkopf-trenner', 'aria-hidden': 'true' }, null, links);
      util.element('span', { class: 'laufkopf-marke', 'data-marke': el.getAttribute('data-laufkopf-marke') === 'kurz' ? 'kurz' : '' }, '[Marke]', links);
      var rubrik = el.getAttribute('data-rubrik');
      if (rubrik === null) rubrik = f.backup ? 'Backup' : (FELD_NAMEN[f.feld] || '');
      if (rubrik) util.element('span', { class: 'laufkopf-rubrik' }, rubrik, rechts);
      util.element('span', { class: 'laufkopf-nummer' }, f.nummer, rechts);
      var hatRad = f.feld && f.feld !== 'hub' && f.feld !== 'leer' && FELD_NAMEN[f.feld] !== undefined && !f.backup;
      if (hatRad && el.getAttribute('data-mini-rad') !== 'aus') {
        var knopf = util.element('button', {
          type: 'button',
          class: 'steuerrad mini-rad',
          'data-modus': 'mini',
          'data-aktiv': f.feld,
          'data-morph': 'steuerrad',
          title: 'Markensteuerrad – Sprungmenü öffnen',
          'aria-label': 'Markensteuerrad, aktuelles Feld: ' + FELD_NAMEN[f.feld] + '. Sprungmenü öffnen'
        }, null, rechts);
        knopf.addEventListener('click', function (e) {
          e.stopPropagation();
          sprungmenueOeffnen();
        });
      }
    }
    el.insertBefore(kopf, el.firstChild);
  }


  /* ===========================================================================
     6. BAUSTEINE UND FOLIEN-SKRIPTE
     Bausteine (komponenten.js):  Deck.baustein('name', { selektor, aufbauen,
       betreten, verlassen, schritt, druck, klon })
     Folien-Skripte (js/folien/…): Deck.registriere('f06', { einrichten,
       betreten, verlassen, schritt, druck, vorschau })
     =========================================================================== */
  var bausteine = [];
  var folienHooks = {};
  var istGestartet = false;

  Deck.baustein = function (name, definition) {
    definition.name = name;
    bausteine.push(definition);
    if (istGestartet) {
      folien.forEach(function (f) { bausteineAufbauen(f.el, f); });
    }
  };

  Deck.registriere = function (folienId, hooks) {
    folienHooks[folienId] = hooks || {};
    if (istGestartet && folienNachId[folienId]) {
      var f = folienNachId[folienId];
      hookAufrufen(f, 'einrichten');
      schritteErmitteln(f);
      if (aktuell.index === f.index) {
        hookAufrufen(f, 'betreten', [aktuell.schritt]);
        hookAufrufen(f, 'schritt', [aktuell.schritt, 'start']);
      }
    }
  };

  function kontext(f) {
    return {
      folie: f.el,
      id: f.id,
      daten: f.daten,
      schritt: aktuell.index === f.index ? aktuell.schritt : 0,
      schritteGesamt: f.schritteGesamt,
      richtung: letzteRichtung,
      /* true = Folie wurde ohne Übergang erreicht (Start, Sprung per Adresse,
         Übersicht/Prüfwerkzeug mit { sofort: true }, Druck). Auftritts-
         Animationen können dann entfallen. */
      sofort: letzterWechselSofort,
      bewegungReduziert: bewegungReduziert(),
      druckmodus: istDruckmodus,
      referent: IST_REFERENT,
      marke: marke,
      util: util,
      deck: Deck
    };
  }

  function hookAufrufen(f, name, argumente) {
    var hooks = folienHooks[f.id];
    if (!hooks || typeof hooks[name] !== 'function') return undefined;
    try {
      return hooks[name].apply(hooks, [kontext(f)].concat(argumente || []));
    } catch (e) {
      console.error('Fehler im Folien-Skript „' + f.id + '“ (' + name + '):', e);
      return undefined;
    }
  }

  function bausteineAufbauen(wurzel, f) {
    bausteine.forEach(function (b) {
      alle(b.selektor, wurzel).forEach(function (el) {
        if (el._baustein) return;
        if (el.closest('.ist-klon')) return;
        el._baustein = b;
        try {
          if (b.aufbauen) b.aufbauen(el, f ? kontext(f) : null);
        } catch (e) {
          console.error('Fehler beim Aufbau des Bausteins „' + b.name + '“:', e);
        }
        if (f) f.bausteinElemente.push(el);
      });
    });
  }

  function bausteinHooks(f, name, argumente) {
    f.bausteinElemente.forEach(function (el) {
      var b = el._baustein;
      if (!b || typeof b[name] !== 'function') return;
      try {
        b[name].apply(b, [el, kontext(f)].concat(argumente || []));
      } catch (e) {
        console.error('Fehler im Baustein „' + b.name + '“ (' + name + '):', e);
      }
    });
  }

  /* Bausteine können verlangen, dass ihre Folie mindestens n Schritte hat */
  util.mindestSchritte = function (folieEl, n) {
    var f = folieFuerElement(folieEl);
    if (!f) return;
    f.mindestSchritte = Math.max(f.mindestSchritte, n);
    if (istGestartet) schritteErmitteln(f);
  };
  function folieFuerElement(el) {
    var sec = el && el.closest ? el.closest('section.folie') : null;
    return sec ? folienNachId[sec.id] : null;
  }
  util.folieFuerElement = function (el) {
    var f = folieFuerElement(el);
    return f ? { id: f.id, index: f.index } : null;
  };
  util.istAktiv = function (el) {
    var f = folieFuerElement(el);
    return !!f && f.index === aktuell.index && !el.closest('.ist-klon');
  };

  /* Größen messen, auch wenn die Folie gerade nicht sichtbar ist:
     util.messen(element, function () { return element.clientHeight; })
     Die Folie wird dafür kurz unsichtbar eingeblendet. */
  util.messen = function (element, fn) {
    var sec = element && element.closest ? element.closest('section.folie') : null;
    var sichtbar = !sec || getComputedStyle(sec).display !== 'none';
    if (sichtbar) return fn();
    sec.classList.add('ist-messung');
    try { return fn(); } finally { sec.classList.remove('ist-messung'); }
  };

  /* Nachdem ein Baustein seine Elemente neu gebaut hat: Schritte der Folie
     neu einsammeln und den aktuellen Stand wieder anwenden. */
  Deck.schritteNeu = function (folieEl) {
    var f = folieFuerElement(folieEl);
    if (!f) return;
    schritteErmitteln(f);
    var n = istDruckmodus ? f.schritteGesamt : (f.index === aktuell.index ? aktuell.schritt : 0);
    schrittKlassen(f, n);
    if (f.index === aktuell.index) morphNamen(f, true);
  };


  /* ===========================================================================
     7. SCHRITTE UND ANIMATIONEN
     =========================================================================== */
  function schritteErmitteln(f) {
    var elemente = alle('[data-schritt]', f.el).filter(function (el) {
      return !el.closest('.notizen') && !el.closest('.ist-klon');
    });
    var max = 0;
    f.schrittElemente = elemente.map(function (el) {
      var n = parseInt(el.getAttribute('data-schritt'), 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > max) max = n;
      return { el: el, n: n };
    });
    var angegeben = parseInt(f.el.getAttribute('data-schritte') || '0', 10) || 0;
    f.schritteGesamt = Math.max(max, angegeben, f.mindestSchritte);
    /* Auftritt: animierte Elemente ohne eigenen Schritt (beim Betreten) */
    f.auftritt = eigeneAnimierte(f.el);
  }

  /* Animierte Nachfahren, die direkt zu „wurzel“ gehören: Elemente mit
     data-animation oder data-staffel, die weder selbst ein Schritt sind noch
     in einem anderen Schritt oder einer Staffel stecken (die animieren ihre
     Inhalte selbst). Gilt für die Folie (Auftritt beim Betreten) und für
     jeden Schritt-Container (z. B. Zähler in einer Karte mit data-schritt). */
  function eigeneAnimierte(wurzel) {
    return alle('[data-animation], [data-staffel]', wurzel).filter(function (el) {
      if (el.closest('.notizen') || el.closest('.ist-klon') || el.closest('.laufkopf')) return false;
      if (el.hasAttribute('data-schritt')) return false;
      var p = el.parentElement;
      while (p && p !== wurzel) {
        if (p.hasAttribute('data-schritt') || p.hasAttribute('data-staffel') || p.hasAttribute('data-animation')) return false;
        p = p.parentElement;
      }
      return p === wurzel;
    });
  }

  function istHervorhebung(el) {
    return /(^|\s)hervorheben(\s|$)/.test(el.getAttribute('data-animation') || '');
  }

  /* Klassen für Schritt n setzen (ohne Animation) */
  function schrittKlassen(f, n, wurzel) {
    var liste = wurzel ? alle('[data-schritt]', wurzel).filter(function (el) { return !el.closest('.notizen'); })
      .map(function (el) { return { el: el, n: Math.max(1, parseInt(el.getAttribute('data-schritt'), 10) || 1) }; })
      : f.schrittElemente;
    liste.forEach(function (eintrag) {
      var an = eintrag.n <= n;
      eintrag.el.classList.toggle('schritt-an', an);
      eintrag.el.classList.toggle('schritt-aktuell', eintrag.n === n);
      if (istHervorhebung(eintrag.el)) {
        var nurAktuell = eintrag.el.getAttribute('data-hervor') === 'aktuell';
        eintrag.el.classList.toggle('ist-hervor', nurAktuell ? eintrag.n === n : an);
      }
    });
  }

  /* Zähler auf Endwert setzen (ohne Animation) */
  function zaehlerEndwert(el) {
    var ziel = parseFloat(el.getAttribute('data-ziel'));
    if (isNaN(ziel)) return;
    el._zaehlKennung = (el._zaehlKennung || 0) + 1;
    el.textContent = util.zahlFormat(ziel, parseInt(el.getAttribute('data-dezimalen') || '0', 10),
      { vorzeichen: el.hasAttribute('data-vorzeichen') }) + einheitVon(el);
  }
  function einheitVon(el) {
    var e = el.getAttribute('data-einheit') || '';
    return e.replace(/^ /, ' ');                 // führendes Leerzeichen → schmales, geschütztes
  }

  var GEOMETRIE = 'path, line, polyline, polygon, circle, ellipse, rect';

  /* Keyframes für eine Animationsart */
  function keyframesFuer(art) {
    var weg = token('--weg') || 18;
    switch (art) {
      case 'hoch':    return [{ opacity: 0, translate: '0 ' + weg + 'px' }, { opacity: 1, translate: '0 0' }];
      case 'runter':  return [{ opacity: 0, translate: '0 ' + (-weg) + 'px' }, { opacity: 1, translate: '0 0' }];
      case 'links':   return [{ opacity: 0, translate: weg + 'px 0' }, { opacity: 1, translate: '0 0' }];
      case 'rechts':  return [{ opacity: 0, translate: (-weg) + 'px 0' }, { opacity: 1, translate: '0 0' }];
      case 'zoom':    return [{ opacity: 0, scale: '0.94' }, { opacity: 1, scale: '1' }];
      case 'feder':   return [{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1' }];   /* mit Federkurve */
      case 'unschaerfe': return [{ opacity: 0, filter: 'blur(16px)' }, { opacity: 1, filter: 'blur(0px)' }];
      default:        return [{ opacity: 0 }, { opacity: 1 }];
    }
  }

  /* Ein Element erscheinen lassen (gemäß data-animation) */
  function elementAnimieren(el, grundVerzoegerung) {
    var art = (el.getAttribute('data-animation') || 'einblenden').split(/\s+/)[0];
    var verzoegerung = (grundVerzoegerung || 0) + (parseFloat(el.getAttribute('data-verzoegerung')) || 0);
    var dauerAttr = parseFloat(el.getAttribute('data-dauer'));
    var kurve = util.kurve(art === 'feder' ? 'feder' : '');

    if (art === 'hervorheben' || art === 'zustand' || art === 'keine') return;

    if (art === 'zaehlen') {
      var ziel = parseFloat(el.getAttribute('data-ziel'));
      var start = parseFloat(el.getAttribute('data-start') || '0');
      util.animiere(el, [{ opacity: 0 }, { opacity: 1 }], { duration: token('--dauer-kurz'), delay: verzoegerung });
      if (!isNaN(ziel)) {
        util.zaehle(el, start, ziel, {
          dezimalen: parseInt(el.getAttribute('data-dezimalen') || '0', 10),
          einheit: einheitVon(el),
          vorzeichen: el.hasAttribute('data-vorzeichen'),
          dauer: dauerAttr || token('--dauer-lang'),
          verzoegerung: verzoegerung
        });
      }
      return;
    }

    if (art === 'zeichnen') {
      /* Formen mit eigener data-animation (z. B. Punkte mit „feder“) animieren sich selbst */
      var formen = el.matches(GEOMETRIE) ? [el] : alle(GEOMETRIE, el).filter(function (form) {
        return !form.closest('defs, marker') && !form.hasAttribute('data-animation');
      });
      if (!(el instanceof SVGElement)) {
        /* HTML-Element (z. B. Linie, Balken): wächst von links */
        util.animiere(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
          { duration: dauerAttr || token('--dauer-lang'), delay: verzoegerung, easing: kurve });
        return;
      }
      formen.forEach(function (form, i) {
        var stil = getComputedStyle(form);
        var hatStrich = stil.stroke && stil.stroke !== 'none';
        var gestrichelt = stil.strokeDasharray && stil.strokeDasharray !== 'none';
        var laenge = 0;
        try { laenge = form.getTotalLength ? form.getTotalLength() : 0; } catch (e) { laenge = 0; }
        var d = { duration: dauerAttr || token('--dauer-lang'), delay: verzoegerung + i * token('--staffel'), easing: kurve };
        if (!hatStrich || gestrichelt || !laenge) {
          util.animiere(form, [{ opacity: 0 }, { opacity: 1 }], d);
          return;
        }
        var L = Math.ceil(laenge) + 2;
        util.animiere(form, [
          { strokeDasharray: L + ' ' + L, strokeDashoffset: L },
          { strokeDasharray: L + ' ' + L, strokeDashoffset: 0 }
        ], d);
      });
      return;
    }

    var keyframes = keyframesFuer(art);
    var dauer = dauerAttr || (art === 'unschaerfe' ? token('--dauer-lang') : token('--dauer-mittel'));
    util.animiere(el, keyframes, { duration: dauer, delay: verzoegerung, easing: kurve });
  }

  /* Element (oder Staffel-Container) erscheinen lassen – samt der animierten
     Elemente, die darin stecken (Zähler, Linien …) */
  function auftrittAnimieren(el, grundVerzoegerung) {
    grundVerzoegerung = grundVerzoegerung || 0;
    if (el.hasAttribute('data-staffel')) {
      var abstand = parseFloat(el.getAttribute('data-staffel'));
      if (isNaN(abstand) || abstand <= 0) abstand = token('--staffel') || 70;
      var eigeneVerz = parseFloat(el.getAttribute('data-verzoegerung')) || 0;
      var kinder = Array.prototype.slice.call(el.children).filter(function (k) {
        return !k.hasAttribute('data-schritt') && !k.matches('script, template, .notizen');
      });
      var artContainer = el.getAttribute('data-animation');
      kinder.forEach(function (kind, i) {
        if (!kind.hasAttribute('data-animation') && artContainer) kind.setAttribute('data-animation', artContainer);
        var v = grundVerzoegerung + eigeneVerz + i * abstand;
        elementAnimieren(kind, v);
        eigeneAnimierte(kind).forEach(function (innen) { auftrittAnimieren(innen, v); });
      });
      return;
    }
    elementAnimieren(el, grundVerzoegerung);
    var v2 = grundVerzoegerung + (parseFloat(el.getAttribute('data-verzoegerung')) || 0);
    eigeneAnimierte(el).forEach(function (innen) { auftrittAnimieren(innen, v2); });
  }

  /* Element beim Zurückgehen ruhig ausblenden */
  function elementAusblenden(el) {
    stoppeAnimationen(el);
    if (istHervorhebung(el)) return;
    if (bewegungReduziert()) return;
    util.animiere(el, [{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }],
      { duration: Math.min(220, token('--dauer-kurz')), fill: 'none', easing: 'ease-in' });
  }

  function stoppeAnimationen(wurzel) {
    laufendeAnimationen.forEach(function (a) {
      var ziel = a.effect && a.effect.target;
      if (ziel && (ziel === wurzel || (wurzel.contains && wurzel.contains(ziel)))) {
        try { a.cancel(); } catch (e) { /* egal */ }
        laufendeAnimationen.delete(a);
      }
    });
  }

  /* Alle Zähler einer Folie auf den Stand von Schritt n setzen (ohne Animation) */
  function zaehlerFuerSchritt(f, n) {
    alle('[data-animation~="zaehlen"]', f.el).forEach(function (el) {
      var sichtbarAb = 0;
      var schrittEl = el.closest('[data-schritt]');
      if (schrittEl) sichtbarAb = parseInt(schrittEl.getAttribute('data-schritt'), 10) || 1;
      if (n >= sichtbarAb) zaehlerEndwert(el);
    });
  }

  /* Wechsel zu Schritt n auf der aktuellen Folie */
  function schrittWechsel(n, optionen) {
    optionen = optionen || {};
    var f = folien[aktuell.index];
    if (!f) return;
    n = Math.max(0, Math.min(f.schritteGesamt, n));
    var alt = aktuell.schritt;
    if (n === alt) return;
    var richtung = n > alt ? 'vor' : 'zurueck';
    letzteRichtung = richtung;
    aktuell.schritt = n;
    schrittKlassen(f, n);
    var animieren = !optionen.sofort && !testSofort;
    if (richtung === 'vor') {
      f.schrittElemente.forEach(function (e) {
        if (e.n > alt && e.n <= n) {
          if (animieren && e.n === n) auftrittAnimieren(e.el);
          else stoppeAnimationen(e.el);
        }
      });
      if (!animieren) zaehlerFuerSchritt(f, n);
    } else {
      f.schrittElemente.forEach(function (e) {
        if (e.n > n && e.n <= alt) {
          if (animieren && e.n === alt && alt - n === 1) elementAusblenden(e.el);
          else stoppeAnimationen(e.el);
        }
      });
    }
    bausteinHooks(f, 'schritt', [n, richtung]);
    hookAufrufen(f, 'schritt', [n, richtung]);
    nachZustandswechsel('schritt', richtung);
  }


  /* ===========================================================================
     8. NAVIGATION UND ÜBERGÄNGE
     =========================================================================== */
  var letzteRichtung = 'start';
  var letzterWechselSofort = true;      /* ctx.sofort (siehe kontext) */

  /* Während ein animierter Folienwechsel läuft, trägt <html> die Klasse
     „wechsel-laeuft“; an seinem Ende kommt das Ereignis „deck:wechsel-ende“
     (detail: { folie }). Folien-Skripte brauchen so keinen eigenen Timer. */
  function wechselEnde(f, nr) {
    if (nr !== wechselNr) return;           /* inzwischen neuer Wechsel */
    html.classList.remove('wechsel-laeuft', 'wechsel-modus', 'wechsel-rad-gross');
    document.dispatchEvent(new CustomEvent('deck:wechsel-ende', { detail: { folie: f.id } }));
  }
  var laufenderUebergang = null;
  var gehendeFolie = null;
  var testSofort = false;
  var unterstuetztVT = typeof document.startViewTransition === 'function';

  /* Hell/dunkel einer Folie (eigenes data-modus, sonst der des Dokuments) */
  function folienModus(f) {
    return (f && f.el.getAttribute('data-modus')) || html.getAttribute('data-modus') || 'hell';
  }
  /* Hat die Folie ein großes Steuerrad bzw. das Mini-Rad, das beim Wechsel
     ineinander gleitet (data-morph="steuerrad")? */
  function radArt(f) {
    if (!f) return '';
    var rad = f.el.querySelector('[data-morph="steuerrad"]');
    if (!rad) return '';
    return rad.classList.contains('mini-rad') ? 'mini' : 'gross';
  }

  function folieAufloesen(ziel) {
    if (typeof ziel === 'number') return ziel >= 0 && ziel < folien.length ? ziel : -1;
    if (typeof ziel === 'string') {
      var f = folienNachId[ziel];
      if (f) return f.index;
      /* Nummer als Text („6“, „06“, „B2“) */
      var such = ziel.trim().toLowerCase();
      for (var i = 0; i < folien.length; i++) {
        var nr = String(folien[i].nummer).toLowerCase();
        if (nr === such || nr.replace(/^0+/, '') === such.replace(/^0+/, '')) return i;
      }
      return -1;
    }
    if (ziel && ziel.nodeType === 1) {
      var g = folieFuerElement(ziel);
      return g ? g.index : -1;
    }
    return -1;
  }

  function morphNamen(f, an) {
    alle('[data-morph]', f.el).forEach(function (el) {
      if (el.closest('.ist-klon')) return;
      var name = (el.getAttribute('data-morph') || '').trim();
      if (an && /^[a-zA-Z][\w-]*$/.test(name)) el.style.viewTransitionName = name;
      else el.style.removeProperty('view-transition-name');
    });
  }

  /* Folie aktiv setzen (ohne Animation der Folie selbst) */
  function folieAktivieren(f, schritt) {
    folien.forEach(function (g) {
      if (g !== f && g.el.classList.contains('ist-aktiv')) {
        g.el.classList.remove('ist-aktiv');
        morphNamen(g, false);
      }
    });
    f.el.classList.add('ist-aktiv');
    morphNamen(f, true);
    aktuell.index = f.index;
    aktuell.schritt = schritt;
    schrittKlassen(f, schritt);
  }

  function auftrittStarten(f, schritt, richtung, animieren) {
    if (animieren && richtung !== 'zurueck') {
      f.auftritt.forEach(function (el) { auftrittAnimieren(el, 0); });
      /* Schritte, die beim Sprung schon sichtbar sind, ohne Animation */
    }
    zaehlerAufFolie(f, schritt, animieren && richtung !== 'zurueck');
  }

  function zaehlerAufFolie(f, schritt, animieren) {
    alle('[data-animation~="zaehlen"]', f.el).forEach(function (el) {
      var schrittEl = el.closest('[data-schritt]');
      var ab = schrittEl ? (parseInt(schrittEl.getAttribute('data-schritt'), 10) || 1) : 0;
      if (ab > schritt) return;
      if (!animieren || ab > 0) zaehlerEndwert(el);
    });
  }

  /* Hauptfunktion: zu Folie (Index, ID oder Nummer) und Schritt wechseln.
     optionen: { richtung: 'vor'|'zurueck', sofort: true (ohne Übergang),
                 still: true (nicht an das andere Fenster senden),
                 vorher: function () {} (läuft im selben Übergang) } */
  var wechselNr = 0;          /* zählt Folienwechsel; überholte Wechsel werden verworfen */
  function gehe(ziel, schritt, optionen) {
    optionen = optionen || {};
    var index = folieAufloesen(ziel);
    if (index < 0) {
      console.warn('Deck.gehe: Folie „' + ziel + '“ nicht gefunden.');
      return false;
    }
    var f = folien[index];
    if (schritt === 'ende' || schritt === Infinity) {
      /* Folien, deren Schrittzahl von gespeicherten Daten abhängt (Folie 10:
         Abgleich mit der Wortwolke), zählen vorher neu – sonst landet
         Deck.gehe('f10', 'ende') nach einer Änderung auf einem alten Schritt. */
      hookAufrufen(f, 'schritteAktualisieren');
      schritt = f.schritteGesamt;
    }
    schritt = Math.max(0, Math.min(f.schritteGesamt, parseInt(schritt, 10) || 0));

    if (index === aktuell.index) {
      if (typeof optionen.vorher === 'function') optionen.vorher();
      if (schritt !== aktuell.schritt) schrittWechsel(schritt, optionen);
      return true;
    }

    var alt = folien[aktuell.index];
    var richtung = optionen.richtung || (alt && index < alt.index ? 'zurueck' : 'vor');
    letzteRichtung = alt ? richtung : 'start';
    /* Läuft noch ein Folienübergang (z. B. Clicker-Doppeldruck über den Morph
       des Steuerrads), wechselt die Folie sofort – Übergänge stapeln sich
       sonst, und die Folie steht sekundenlang auf einem Zwischenbild. */
    var stau = !!laufenderUebergang || !!gehendeFolie;
    var animieren = !!alt && !optionen.sofort && !testSofort && !istDruckmodus && !stau;
    var nr = ++wechselNr;
    letzterWechselSofort = !animieren;

    if (alt) {
      bausteinHooks(alt, 'verlassen');
      hookAufrufen(alt, 'verlassen');
      stoppeAnimationen(alt.el);
    }
    if (laufenderUebergang) {
      try { laufenderUebergang.skipTransition(); } catch (e) { /* egal */ }
      laufenderUebergang = null;
    }
    if (gehendeFolie) {
      gehendeFolie.el.classList.remove('ist-geht');
      stoppeAnimationen(gehendeFolie.el);
      gehendeFolie = null;
    }

    /* Der logische Stand gilt sofort (Tasten, Deck.zustand(), Abgleich) –
       die sichtbare Änderung folgt im Übergang. Bei View Transitions läuft
       „aendern“ erst, wenn das alte Bild aufgenommen ist (einige Frames später). */
    aktuell.index = f.index;
    aktuell.schritt = schritt;
    adresseSetzen();
    leisteAktualisieren();
    if (!optionen.still) kanalZustandSenden();

    var aendern = function () {
      if (nr !== wechselNr) return;           /* inzwischen wurde weitergeblättert */
      if (typeof optionen.vorher === 'function') optionen.vorher();
      var n = aktuell.schritt;                /* kann sich während des Übergangs geändert haben */
      folieAktivieren(f, n);
      bausteinHooks(f, 'betreten', [n, richtung]);
      hookAufrufen(f, 'betreten', [n]);
      bausteinHooks(f, 'schritt', [n, 'start']);
      hookAufrufen(f, 'schritt', [n, 'start']);
      auftrittStarten(f, n, richtung, animieren);
      morphNamen(f, true);          /* falls ein Baustein beim Betreten neu gebaut hat */
      if (!optionen.still && document.activeElement && alt && alt.el.contains(document.activeElement)) {
        document.activeElement.blur();      /* Fokus nicht in der ausgeblendeten Folie lassen */
      }
      nachZustandswechsel('folie', richtung, optionen);
    };

    html.classList.toggle('richtung-zurueck', richtung === 'zurueck');
    html.classList.toggle('richtung-vor', richtung !== 'zurueck');

    html.classList.toggle('wechsel-laeuft', animieren);
    /* Feinheiten des Übergangs (Abschlussprüfung 16.10.2026, Aussehen in
       css/deck.css, Abschnitt 7):
       • wechsel-modus: dunkle ↔ helle Folie (z. B. 01 → 02) nacheinander statt
         gleichzeitig überblenden – sonst entsteht ein graues Doppelbild.
       • wechsel-rad-gross: großes Steuerrad ↔ Mini-Rad (z. B. 02 → 03) – das
         gleitende Rad wird unterwegs ausgeblendet, statt als graue Scheibe
         über den neuen Titel zu fliegen. */
    html.classList.toggle('wechsel-modus', animieren && !!alt && folienModus(alt) !== folienModus(f));
    var radAlt = radArt(alt), radNeu = radArt(f);
    html.classList.toggle('wechsel-rad-gross', animieren && !!radAlt && !!radNeu && radAlt !== radNeu);
    if (!animieren) {
      aendern();
      wechselEnde(f, nr);
    } else if (unterstuetztVT && !bewegungReduziert()) {
      try {
        var uebergang = document.startViewTransition(aendern);
        laufenderUebergang = uebergang;
        var fertig = function () {
          if (laufenderUebergang === uebergang) laufenderUebergang = null;
          wechselEnde(f, nr);
        };
        uebergang.finished.then(fertig, fertig);
        uebergang.ready.catch(function () { /* übersprungen – kein Fehler */ });
        uebergang.updateCallbackDone.catch(function (e) { console.error(e); });
      } catch (e) {
        aendern();
        wechselEnde(f, nr);
      }
    } else {
      /* Rückfall: einfaches Überblenden (bei „Bewegung reduzieren“ ohne Weg) */
      var dauer = Math.max(180, Math.min(token('--dauer-folie') || 400, 520));
      alt.el.classList.add('ist-geht');
      gehendeFolie = alt;
      aendern();
      var weg = bewegungReduziert() ? 0 : 24;
      var vz = richtung === 'zurueck' ? 1 : -1;
      var raus = util.animiere(alt.el, [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: (vz * weg) + 'px 0' }],
        { duration: dauer, easing: 'ease-in-out', fill: 'forwards' });
      var aufraeumen = function () {
        try { raus.cancel(); } catch (e) { /* egal */ }   /* „forwards“ nicht an der Folie hängen lassen */
        alt.el.classList.remove('ist-geht');
        stoppeAnimationen(alt.el);
        if (gehendeFolie === alt) gehendeFolie = null;
        wechselEnde(f, nr);
      };
      raus.finished.then(aufraeumen, aufraeumen);
      util.animiere(f.el, [{ opacity: 0, translate: (-vz * weg) + 'px 0' }, { opacity: 1, translate: '0 0' }],
        { duration: dauer, easing: 'ease-out' });
    }
    return true;
  }

  /* Klickstau verhindern (Abschlussprüfung 17.10.2026): Kommt ein Klick,
     während ein Folienübergang oder Schritt-Animationen noch laufen, wird das
     Laufende sofort beendet (wie im Testmodus, siehe Deck.testmodus) – jeder
     Klick zeigt dann sofort den fertigen Stand des vorigen. */
  function laufendesBeenden() {
    if (laufenderUebergang) { try { laufenderUebergang.skipTransition(); } catch (e) { /* egal */ } }
    if (!laufendeAnimationen.size) return;
    laufendeAnimationen.forEach(function (a) {
      try { a.finish(); } catch (e) { try { a.cancel(); } catch (e2) { /* egal */ } }
    });
    var f = folien[aktuell.index];
    if (f) zaehlerFuerSchritt(f, aktuell.schritt);      /* hochzählende Zahlen auf Endwert */
  }

  function weiter() {
    var f = folien[aktuell.index];
    if (!f) return;
    laufendesBeenden();
    if (aktuell.schritt < f.schritteGesamt) { schrittWechsel(aktuell.schritt + 1); return; }
    /* Auf der letzten Hauptfolie anhalten – Backup nur gezielt (Übersicht) */
    if (aktuell.index === anzahlHaupt - 1) {
      bedienHinweis('Ende der Präsentation · Backup-Folien: Taste O');
      return;
    }
    if (aktuell.index < folien.length - 1) gehe(aktuell.index + 1, 0, { richtung: 'vor' });
  }
  function zurueck() {
    var f = folien[aktuell.index];
    if (!f) return;
    laufendesBeenden();
    if (aktuell.schritt > 0) { schrittWechsel(aktuell.schritt - 1); return; }
    if (aktuell.index > 0) gehe(aktuell.index - 1, 'ende', { richtung: 'zurueck' });
  }

  /* Nach jedem Wechsel: Adresse, Ereignisse, Fortschritt, Ansage, Abgleich */
  function nachZustandswechsel(art, richtung, optionen) {
    optionen = optionen || {};
    var f = folien[aktuell.index];
    if (!f) return;
    adresseSetzen();
    leisteAktualisieren();
    if (art === 'folie') {
      ansage('Folie ' + f.nummer + ' von ' + folien[anzahlHaupt - 1 >= 0 ? anzahlHaupt - 1 : 0].nummer + ': ' + f.titel);
    }
    var detail = {
      folie: f.id,
      folienIndex: f.index,
      schritt: aktuell.schritt,
      schritteGesamt: f.schritteGesamt,
      richtung: richtung
    };
    document.dispatchEvent(new CustomEvent(art === 'folie' ? 'deck:folie' : 'deck:schritt', { detail: detail }));
    if (art === 'folie') document.dispatchEvent(new CustomEvent('deck:schritt', { detail: detail }));
    if (!optionen.still) kanalZustandSenden();
    if (IST_REFERENT) { fragerundeMerken(f); referentAktualisieren(); }
  }

  function adresseSetzen() {
    var f = folien[aktuell.index];
    if (!f || istDruckmodus) return;
    var hash = '#' + f.id + (aktuell.schritt ? '.' + aktuell.schritt : '');
    if (location.hash !== hash) {
      try { history.replaceState(null, '', hash); } catch (e) { /* file:// in alten Browsern */ }
    }
  }
  function adresseLesen() {
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!h) return null;
    var m = /^(.+?)(?:\.(\d+))?$/.exec(h);
    if (!m) return null;
    return { folie: m[1], schritt: m[2] ? parseInt(m[2], 10) : 0 };
  }

  Deck.gehe = function (ziel, schritt, optionen) { return gehe(ziel, schritt, optionen); };
  /* Sprung, den eine Person auf der Folie auslöst (Sprungliste auf 12,
     Steuerrad-Felder auf 02/10/12, Verweise auf 11): läuft wie Ziffern + Enter
     über befehl() – im Referentenfenster springt so auch der Beamer mit
     (VORTRAGSREIFE A7, 21.10.2026; Deck.gehe wirkt nur im eigenen Fenster). */
  /* Im Referentenfenster läuft im Feld „Aktuell“ das echte Deck: Ein Klick auf
     ein Rad-Feld oder einen Verweis – etwa beim Fokussieren des Fensters –
     sprang mitten im Vortrag den Beamer um. Deshalb wirken Klick-Sprünge dort
     erst in der Fragerunde: sobald Folie 12 oder eine Backup-Folie erreicht
     war (danach auch auf anderen Folien, z. B. 10 → 06), bis wieder Folie 01
     kommt. Ziffern + Enter, O und das Sprungmenü wirken immer (Nacharbeit
     VORTRAGSREIFE A7, 21.10.2026). Im Folienfenster gilt keine Sperre. */
  var klickSprungFrei = false;
  function fragerundeMerken(f) {
    if (f.backup || f.index >= anzahlHaupt - 1) klickSprungFrei = true;
    else if (f.index === 0) klickSprungFrei = false;
  }
  Deck.springe = function (ziel, schritt) {
    var index = folieAufloesen(ziel);
    if (index < 0) {
      console.warn('Deck.springe: Folie „' + ziel + '“ nicht gefunden.');
      return false;
    }
    if (IST_REFERENT && folien[aktuell.index]) fragerundeMerken(folien[aktuell.index]);
    if (IST_REFERENT && !klickSprungFrei) {
      hinweisZeigen('Klick-Sprünge hier erst ab Folie 12 – sonst Ziffern + Enter oder O');
      return false;
    }
    befehl('gehe', { folie: folien[index].id, schritt: schritt === undefined ? 0 : schritt });
    return true;
  };
  Deck.weiter = function () { befehl('weiter'); };
  Deck.zurueck = function () { befehl('zurueck'); };
  Deck.zustand = function () {
    var f = folien[aktuell.index];
    return {
      folie: f ? f.id : null,
      folienIndex: aktuell.index,
      schritt: aktuell.schritt,
      schritteGesamt: f ? f.schritteGesamt : 0,
      anzahlFolien: folien.length,
      anzahlHauptfolien: anzahlHaupt,
      titel: f ? f.titel : '',
      feld: f ? f.feld : '',
      nummer: f ? f.nummer : '',
      backup: f ? f.backup : false,
      thema: html.getAttribute('data-thema'),
      modus: html.getAttribute('data-modus')
    };
  };
  Deck.folien = function () {
    return folien.map(function (f) {
      return { id: f.id, index: f.index, nummer: f.nummer, titel: f.titel, feld: f.feld, zeit: f.zeit,
        buendel: f.buendel, backup: f.backup, optional: f.optional, schritteGesamt: f.schritteGesamt, element: f.el };
    });
  };
  /* Für Tests (pruefen.mjs): Animationen und Übergänge sofort beenden */
  Deck.testmodus = function (an) {
    testSofort = !!an;
    html.classList.toggle('testmodus', testSofort);
    if (testSofort) {
      laufendeAnimationen.forEach(function (a) { try { a.finish(); } catch (e) { a.cancel(); } });
      if (laufenderUebergang) { try { laufenderUebergang.skipTransition(); } catch (e) { /* egal */ } }
    }
  };


  /* ===========================================================================
     9. BEDIENUNG: TASTATUR, WISCHEN, BEDIENLEISTE
     =========================================================================== */
  var tastenHandler = [];
  /* Bausteine können Tasten auf ihrer Folie übernehmen (z. B. Ziffern bei der Umfrage).
     fn(ereignis, kontext) gibt true zurück, wenn die Taste verbraucht wurde – oder
     { rueckgaengig: function () {…} }, wenn sie verbraucht wurde, sich aber noch
     zurücknehmen lässt (siehe „vorläufig gezählte Ziffer“ in tasteGedrueckt). */
  Deck.taste = function (fn) { tastenHandler.push(fn); };

  var ziffernPuffer = '';
  var ziffernTimer = null;
  var letzteZaehlZiffer = null;   /* { ziffer, zeit, rueckgaengig } – zuletzt als Stimme gezählte Ziffer */

  /* Befehle laufen im Referentenfenster über das Vortragsfenster (Abgleich) */
  function befehl(aktion, daten) {
    if (IST_REFERENT && kanal.verbunden) {
      kanalSenden('befehl', Object.assign({ aktion: aktion }, daten || {}));
      return;
    }
    befehlAusfuehren(aktion, daten || {});
  }
  /* Ist der Saal schwarz, blenden „weiter“ und „zurück“ nur wieder ein – auch
     wenn sie aus dem Referentenfenster oder von der Bedienleiste kommen
     (VORTRAGSREIFE A8, 21.10.2026: sonst schaltete die Folie unsichtbar weiter). */
  function befehlAusfuehren(aktion, daten) {
    if ((aktion === 'weiter' || aktion === 'zurueck') && html.classList.contains('schwarz')) {
      schwarzbild(false);
      return;
    }
    switch (aktion) {
      case 'weiter': weiter(); break;
      case 'zurueck': zurueck(); break;
      case 'gehe': gehe(daten.folie, daten.schritt || 0); break;
      case 'anfang': gehe(0, 0); break;
      case 'ende': gehe(Math.max(0, anzahlHaupt - 1), 'ende'); break;
      case 'schwarz': schwarzbild(daten.an); break;
      case 'thema': themaSetzen(daten.thema, daten.modus, { merken: true, melden: true }); break;
      default: break;
    }
  }

  function istEingabe(el) {
    if (!el || el === document.body) return false;
    if (el.isContentEditable) return true;
    var tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
      var typ = (el.getAttribute('type') || 'text').toLowerCase();
      return ['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file', 'image'].indexOf(typ) < 0;
    }
    return false;
  }
  function istBedienelement(el) {
    if (!el || el === document.body) return false;
    return !!el.closest('button, a[href], [role="button"], [role="link"], summary');
  }

  function tasteGedrueckt(e) {
    if (e.defaultPrevented || !istGestartet) return;
    var ziel = e.target;
    var taste = e.key;

    /* 1. Eingabefeld fokussiert: Tasten gehören dem Feld.
          Ausnahme: Bild↑/Bild↓ (Präsentations-Clicker) verlassen das Feld und blättern. */
    if (istEingabe(ziel)) {
      if (taste === 'Escape') { ziel.blur(); e.preventDefault(); return; }
      if (taste === 'PageDown' || taste === 'PageUp') { ziel.blur(); }
      else return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;          // Browser-Kürzel (Strg+P …) nicht stören
    /* Reine Umschalt-/Modifikatortasten (seit 24.10.2026, Prüfung D28): Sie liefen
       sonst durch die ganze Logik und verwarfen eine angefangene Foliennummer –
       „5 B Enter“ mit Umschalt+B sprang nicht, B schaltete das Schwarzbild ein. */
    if (['Shift', 'CapsLock', 'Control', 'Alt', 'AltGraph', 'Meta'].indexOf(taste) >= 0) return;

    /* 2. Schwarzbild: jede Bedientaste blendet es nur wieder ein – im
          Referentenfenster auch, solange der Saal schwarz ist (A8: dort
          schalteten → und Bild↓ sonst die Folie unsichtbar weiter, Esc tat nichts) */
    var saalSchwarz = html.classList.contains('schwarz') ||
      (IST_REFERENT && kanal.verbunden && html.classList.contains('schwarz-im-saal'));
    if (saalSchwarz) {
      if (['b', 'B', '.', 'Escape', 'PageDown', 'PageUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', ' ', 'Enter'].indexOf(taste) >= 0) {
        e.preventDefault();
        befehl('schwarz', { an: false });
      }
      return;
    }

    /* 3. Offene Ebenen */
    if (offeneEbene) {
      if (ebeneTaste(e)) return;
    }

    /* 4. Bausteine der aktuellen Folie (z. B. Umfrage: Ziffern zählen).
          Läuft schon eine Foliennummer (Ziffernpuffer, z. B. nach „8“), gehören
          weitere Ziffern zu ihr und zählen keine Stimme. */
    var f = folien[aktuell.index];
    var istZiffer = /^[0-9]$/.test(taste);
    if (!(istZiffer && ziffernPuffer)) {
      for (var i = 0; i < tastenHandler.length; i++) {
        var ergebnis = false;
        try {
          ergebnis = f ? tastenHandler[i](e, kontext(f)) : false;
        } catch (fehler) { console.error(fehler); }
        if (ergebnis === true || (ergebnis && typeof ergebnis.rueckgaengig === 'function')) {
          e.preventDefault();
          letzteZaehlZiffer = ergebnis.rueckgaengig ? { ziffer: taste, zeit: Date.now(), rueckgaengig: ergebnis.rueckgaengig } : null;
          return;
        }
      }
    }
    var vorlaeufig = letzteZaehlZiffer;
    letzteZaehlZiffer = null;

    /* 5. Ziffern + Enter = Folie anspringen. Nach einer Ziffer gehört „b“ zur Nummer
          (8 b Enter → Folie 08b); ohne Ziffer davor bleibt B das Schwarzbild.
          Vorläufig gezählte Ziffer: Auf Folie 08 zählt „1“ eine Stimme. Folgt sofort
          eine Ziffer, die keine Stimme sein kann (z. B. die 0 von „10“), war die „1“
          der Anfang einer Foliennummer → die Stimme wird zurückgenommen. */
    if (istZiffer) {
      if (vorlaeufig && !ziffernPuffer && Date.now() - vorlaeufig.zeit < 1500) {
        try { vorlaeufig.rueckgaengig(); } catch (fehler) { console.error(fehler); }
        ziffernPuffer = vorlaeufig.ziffer;
      }
      ziffernPuffer = (/b$/.test(ziffernPuffer) ? taste : (ziffernPuffer + taste).slice(-3));
      ziffernAnzeigen();
      e.preventDefault();
      return;
    }
    /* Dasselbe für „b“ (seit 24.10.2026, Folie 05b): Auf Folie 08 zählt „5“ eine
       Stimme; folgt sofort „b“ und gibt es die Folie „5b“, war die „5“ der Anfang
       der Nummer → Stimme zurücknehmen, „5b“ in den Puffer (sonst schaltete „b“
       das Schwarzbild ein). Ohne passende Folie bleibt es bei Stimme + Schwarzbild. */
    if ((taste === 'b' || taste === 'B') && !ziffernPuffer && vorlaeufig &&
        Date.now() - vorlaeufig.zeit < 1500 && folieAufloesen(vorlaeufig.ziffer + 'b') >= 0) {
      try { vorlaeufig.rueckgaengig(); } catch (fehler) { console.error(fehler); }
      ziffernPuffer = vorlaeufig.ziffer + 'b';
      ziffernAnzeigen();
      e.preventDefault();
      return;
    }
    if (ziffernPuffer && (taste === 'b' || taste === 'B') && /^[0-9]+$/.test(ziffernPuffer)) {
      ziffernPuffer += 'b';
      ziffernAnzeigen();
      e.preventDefault();
      return;
    }
    if (ziffernPuffer) {
      if (taste === 'Enter') {
        e.preventDefault();
        var nr = ziffernPuffer;
        ziffernZuruecksetzen();
        /* nur echte Foliennummern – der frühere Rückfall auf den Listenplatz
           („1 3“ → Folie 11, „2 2“ → B8) ist entfernt (VORTRAGSREIFE A24) */
        var index = folieAufloesen(nr);
        if (index >= 0) befehl('gehe', { folie: folien[index].id, schritt: 0 });
        else hinweisZeigen('Folie ' + nr + ' gibt es nicht');
        return;
      }
      if (taste === 'Backspace') { e.preventDefault(); ziffernPuffer = ziffernPuffer.slice(0, -1); ziffernAnzeigen(); return; }
      if (taste === 'Escape') { e.preventDefault(); ziffernZuruecksetzen(); return; }
      /* jede andere Taste (Pfeil, Leertaste, Schwarzbild …) verwirft die angefangene Nummer,
         damit sie nicht mit der nächsten Eingabe zu „910“ zusammenläuft */
      ziffernZuruecksetzen();
    }

    /* Enter/Leertaste auf einem Knopf: Knopf auslösen statt blättern */
    var aufKnopf = istBedienelement(ziel);

    switch (taste) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown':
        e.preventDefault(); befehl('weiter'); break;
      case ' ': case 'Enter':
        if (aufKnopf) return;
        e.preventDefault(); befehl('weiter'); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); befehl('zurueck'); break;
      case 'Home':
        e.preventDefault(); befehl('anfang'); break;
      case 'End':
        e.preventDefault(); befehl('ende'); break;
      case 'o': case 'O':
        e.preventDefault(); uebersichtUmschalten(); break;
      case 'p': case 'P':
        e.preventDefault(); referentOeffnen(); break;
      case 'f': case 'F':
        e.preventDefault(); vollbildUmschalten(); break;
      case 'b': case 'B': case '.':
        e.preventDefault();
        befehl('schwarz', { an: IST_REFERENT && kanal.verbunden ? !html.classList.contains('schwarz-im-saal') : true });
        break;
      case 't': case 'T':
        e.preventDefault();
        if (IST_REFERENT && kanal.verbunden) {
          var j = THEMEN.indexOf(html.getAttribute('data-thema'));
          befehl('thema', { thema: THEMEN[(j + (e.shiftKey ? -1 : 1) + THEMEN.length) % THEMEN.length], modus: html.getAttribute('data-modus') });
        } else naechstesThema(e.shiftKey ? -1 : 1);
        break;
      case 'd': case 'D':
        e.preventDefault();
        if (IST_REFERENT && kanal.verbunden) {
          befehl('thema', { thema: html.getAttribute('data-thema'), modus: html.getAttribute('data-modus') === 'dunkel' ? 'hell' : 'dunkel' });
        } else modusWechseln();
        break;
      case 'h': case 'H': case '?':
        e.preventDefault(); ebeneOeffnen('hilfe'); break;
      case 'Escape':
        if (document.fullscreenElement) return;
        break;
      default:
        break;
    }
  }

  function ziffernAnzeigen() {
    var anzeige = ebenen.ziffern;
    if (!anzeige) return;
    anzeige.textContent = ziffernPuffer ? 'Gehe zu Folie ' + ziffernPuffer + ' … Enter' : '';
    anzeige.classList.toggle('ist-offen', !!ziffernPuffer);
    clearTimeout(ziffernTimer);
    if (ziffernPuffer) ziffernTimer = setTimeout(ziffernZuruecksetzen, 3000);
  }
  function ziffernZuruecksetzen() {
    ziffernPuffer = '';
    ziffernAnzeigen();
  }

  function vollbildUmschalten() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (html.requestFullscreen) html.requestFullscreen().catch(function () { /* nicht erlaubt */ });
    } catch (e) { /* nicht unterstützt */ }
  }

  /* Wischen auf Touch-Geräten */
  function wischenEinrichten() {
    var startX = null, startY = null, startZeit = 0;
    deckEl.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { startX = null; return; }
      if (istEingabe(e.target)) { startX = null; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startZeit = Date.now();
    }, { passive: true });
    deckEl.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Date.now() - startZeit > 800) return;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) befehl('weiter'); else befehl('zurueck');
    }, { passive: true });
  }

  /* Bedienleiste (unten rechts) und Fortschrittsbalken */
  var leiste = null;
  var leisteNummer = null;
  var fortschrittBalken = null;
  var ruheTimer = null;

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }
  util.icon = icon;

  function leisteBauen() {
    leiste = util.element('nav', { class: 'bedienleiste', 'aria-label': 'Foliensteuerung' }, null, document.body);
    leiste.innerHTML =
      '<button type="button" data-aktion="zurueck" title="Zurück (←)" aria-label="Zurück">' + icon('pfeil-links') + '</button>' +
      '<span class="bl-nummer" aria-hidden="true"></span>' +
      '<button type="button" data-aktion="weiter" title="Weiter (→)" aria-label="Weiter">' + icon('pfeil-rechts') + '</button>' +
      '<span class="bl-trenner" aria-hidden="true"></span>' +
      '<button type="button" data-aktion="uebersicht" title="Übersicht (O)" aria-label="Übersicht">' + icon('raster') + '</button>' +
      '<button type="button" data-aktion="referent" title="Referentenansicht (P)" aria-label="Referentenansicht öffnen">' + icon('referent') + '</button>' +
      '<button type="button" data-aktion="thema" title="Thema wechseln (T)" aria-label="Thema wechseln">' + icon('palette') + '</button>' +
      '<button type="button" data-aktion="modus" title="Hell/Dunkel (D)" aria-label="Hell oder dunkel">' + icon('mond') + '</button>' +
      '<span class="bl-trenner" aria-hidden="true"></span>' +
      /* Farbwähler: Markenfarben live ausprobieren (gilt nur in diesem Tab) */
      '<label class="bl-farbe" title="Primärfarbe ausprobieren (nur in diesem Tab – dauerhaft: marke.js)">' +
      '<input type="color" data-farbe="primaer" aria-label="Primärfarbe ausprobieren"></label>' +
      '<label class="bl-farbe" title="Sekundärfarbe ausprobieren (nur in diesem Tab – dauerhaft: marke.js)">' +
      '<input type="color" data-farbe="sekundaer" aria-label="Sekundärfarbe ausprobieren"></label>' +
      '<button type="button" data-aktion="farben-zurueck" title="Farben wieder aus marke.js" aria-label="Testfarben zurücksetzen" hidden>' + icon('zuruecksetzen') + '</button>' +
      '<span class="bl-trenner" aria-hidden="true"></span>' +
      '<button type="button" data-aktion="vollbild" title="Vollbild (F)" aria-label="Vollbild">' + icon('vollbild') + '</button>' +
      '<button type="button" data-aktion="hilfe" title="Hilfe (H)" aria-label="Hilfe">' + icon('hilfe') + '</button>';
    leisteNummer = leiste.querySelector('.bl-nummer');
    leiste.addEventListener('click', function (e) {
      var knopf = e.target.closest('button[data-aktion]');
      if (!knopf) return;
      var a = knopf.getAttribute('data-aktion');
      if (a === 'weiter' || a === 'zurueck') befehl(a);
      else if (a === 'uebersicht') uebersichtUmschalten();
      else if (a === 'referent') referentOeffnen();
      else if (a === 'thema') naechstesThema(1);
      else if (a === 'modus') modusWechseln();
      else if (a === 'vollbild') vollbildUmschalten();
      else if (a === 'hilfe') ebeneOeffnen('hilfe');
      else if (a === 'farben-zurueck') Deck.farbe();
      knopf.blur();
    });
    alle('input[data-farbe]', leiste).forEach(function (eingabe) {
      eingabe.addEventListener('input', function () { Deck.farbe(eingabe.getAttribute('data-farbe'), eingabe.value); });
      eingabe.addEventListener('change', function () { eingabe.blur(); });
    });
    farbWaehlerAktualisieren();
    var fortschritt = util.element('div', { class: 'fortschritt', 'aria-hidden': 'true' }, null, document.body);
    fortschrittBalken = util.element('div', { class: 'fortschritt-balken' }, null, fortschritt);

    /* Zwei Zeitgeber: Der Mauszeiger erscheint bei jeder Bewegung (und
       verschwindet nach 2,5 s Ruhe). Die Leiste erscheint nur, wenn die Maus
       im unteren Bereich des Fensters bewegt wird oder der Bildschirm berührt
       wird – sonst verdeckte sie bei jedem Klick 2,5 s lang das Ende der
       Quellenzeile. Ein Mausklick weckt sie nicht. Mausklick und Mausrad
       blättern NICHT (VORTRAGSREIFE A21) – weiter geht es mit Clicker,
       Pfeil-/Bildtasten, Leertaste, Wischen oder den Pfeilen der Leiste; ein
       Klick auf ein Steuerrad springt zur Folie des Felds. */
    var mausTimer = null;
    var mausWecken = function () {
      html.classList.remove('maus-ruht');
      clearTimeout(mausTimer);
      mausTimer = setTimeout(function () { html.classList.add('maus-ruht'); }, 2500);
    };
    var leisteWecken = function () {
      html.classList.remove('leiste-aus');
      clearTimeout(ruheTimer);
      ruheTimer = setTimeout(function () { html.classList.add('leiste-aus'); }, 2500);
    };
    var LEISTE_ZONE = 160;   /* px vom unteren Fensterrand, in denen die Maus die Leiste weckt */
    document.addEventListener('mousemove', function (e) {
      mausWecken();
      if (e.clientY >= window.innerHeight - LEISTE_ZONE) leisteWecken();
    }, { passive: true });
    document.addEventListener('mousedown', mausWecken, { passive: true });
    /* Finger oder Stift: Antippen zeigt die Leiste (es gibt keine Mausbewegung) */
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') leisteWecken();
    }, { passive: true });
    leiste.addEventListener('mouseenter', function () { clearTimeout(ruheTimer); clearTimeout(mausTimer); });
    leiste.addEventListener('mouseleave', leisteWecken);
    /* Tastaturfokus in der Leiste (Tab): sichtbar bleiben */
    leiste.addEventListener('focusin', leisteWecken);
    mausWecken();
    leisteWecken();
  }

  function leisteAktualisieren() {
    var f = folien[aktuell.index];
    if (!f || !leisteNummer) return;
    /* Foliennummer wie in Kopfzeile, Übersicht und Referentenansicht (z. B. „08b / 12“),
       nicht die Position in der Liste */
    var letzte = folien[anzahlHaupt - 1];
    leisteNummer.textContent = f.backup ? f.nummer : f.nummer + ' / ' + (letzte ? letzte.nummer : anzahlHaupt);
    var anteil = f.backup ? 1 : (anzahlHaupt > 1 ? f.index / (anzahlHaupt - 1) : 1);
    if (f.schritteGesamt && !f.backup && anzahlHaupt > 1) {
      anteil += (aktuell.schritt / f.schritteGesamt) / (anzahlHaupt - 1) * (f.index < anzahlHaupt - 1 ? 1 : 0);
    }
    fortschrittBalken.style.setProperty('--anteil', Math.min(1, anteil).toFixed(4));
  }

  /* Bühne in den verfügbaren Platz einpassen (Letterbox, ganzzahlige Position) */
  function einpassen() {
    if (!deckEl || istDruckmodus) return;
    var r = deckEl.getBoundingClientRect();
    var s = Math.min(r.width / 1920, r.height / 1080);
    if (!(s > 0)) return;
    var x = Math.round((r.width - 1920 * s) / 2);
    var y = Math.round((r.height - 1080 * s) / 2);
    buehne.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + s + ')';
    buehne.setAttribute('data-skala', s.toFixed(4));
    /* Ebenen: im Vortrag deckungsgleich mit der Bühne, im Referentenfenster fensterfüllend */
    var e = IST_REFERENT ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } : r;
    var se = Math.min(e.width / 1920, e.height / 1080);
    var ex = Math.round(e.left + (e.width - 1920 * se) / 2);
    var ey = Math.round(e.top + (e.height - 1080 * se) / 2);
    if (ebenenWurzel) ebenenWurzel.style.transform = 'translate(' + ex + 'px, ' + ey + 'px) scale(' + se + ')';
    if (IST_REFERENT) vorschauEinpassen();
  }
  Deck.einpassen = einpassen;


  /* ===========================================================================
     10. EBENEN: ÜBERSICHT, HILFE, SPRUNGMENÜ, HINWEISE, SCHWARZBILD
     =========================================================================== */
  var ebenenWurzel = null;
  var ebenen = {};
  var offeneEbene = null;
  var liveRegion = null;
  var hinweisTimer = null;

  function ebenenBauen() {
    ebenenWurzel = util.element('div', { class: 'ebene' }, null, document.body);
    ebenen.uebersicht = util.element('div', { class: 'ebene-fenster uebersicht', role: 'dialog', 'aria-label': 'Übersicht aller Folien', 'aria-modal': 'true' }, null, ebenenWurzel);
    ebenen.hilfe = util.element('div', { class: 'ebene-fenster hilfe', role: 'dialog', 'aria-label': 'Tastenkürzel', 'aria-modal': 'true' }, null, ebenenWurzel);
    ebenen.sprungmenue = util.element('div', { class: 'ebene-fenster sprungmenue', role: 'dialog', 'aria-label': 'Sprungmenü Markensteuerrad', 'aria-modal': 'true' }, null, ebenenWurzel);
    ebenen.ziffern = util.element('div', { class: 'ziffern-anzeige', 'aria-hidden': 'true' }, null, ebenenWurzel);
    ebenen.hinweis = util.element('div', { class: 'hinweis-toast', role: 'status' }, null, ebenenWurzel);
    util.element('div', { class: 'schwarzbild', 'aria-hidden': 'true' }, null, document.body)
      .addEventListener('click', function () { befehl('schwarz', { an: false }); });
    liveRegion = util.element('div', { class: 'nur-screenreader', 'aria-live': 'polite', 'aria-atomic': 'true' }, null, document.body);

    hilfeBauen();
    sprungmenueBauen();

    /* Klick auf den Hintergrund einer Ebene schließt sie */
    [ebenen.uebersicht, ebenen.hilfe, ebenen.sprungmenue].forEach(function (eb) {
      eb.addEventListener('click', function (e) {
        if (e.target === eb) ebeneSchliessen();
      });
    });
  }

  function ansage(text) {
    if (liveRegion) liveRegion.textContent = text;
  }

  function hinweisZeigen(text) {
    if (!ebenen.hinweis) return;
    ebenen.hinweis.textContent = text;
    ebenen.hinweis.classList.add('ist-offen');
    clearTimeout(hinweisTimer);
    hinweisTimer = setTimeout(function () { ebenen.hinweis.classList.remove('ist-offen'); }, 2200);
  }
  /* Bedienhinweise („Ende der Präsentation …“, „Zurück zu B4: Taste Z“,
     Themenwechsel) gehören nicht auf den Beamer, solange eine Referentenansicht
     verbunden ist: Das Folienfenster schickt sie dann dorthin (VORTRAGSREIFE
     A25, 21.10.2026). Ohne Referentenansicht erscheinen sie wie bisher hier. */
  function referentVerbunden() {
    return !IST_REFERENT && Date.now() - kanal.referentZuletzt < 7000;
  }
  function bedienHinweis(text) {
    if (referentVerbunden()) { kanalSenden('hinweis', { text: text }); return; }
    hinweisZeigen(text);
  }
  Deck.hinweis = bedienHinweis;

  function schwarzbild(an) {
    var neu = an === undefined ? !html.classList.contains('schwarz') : !!an;
    if (neu) ziffernZuruecksetzen();       // angefangene Foliennummer verwerfen
    html.classList.toggle('schwarz', neu);
    kanalZustandSenden();
  }

  var fokusVorEbene = null;
  function ebeneOeffnen(name) {
    if (offeneEbene === name) { ebeneSchliessen(); return; }
    if (offeneEbene) ebeneSchliessen(true);
    fokusVorEbene = document.activeElement;
    offeneEbene = name;
    if (name === 'uebersicht') uebersichtFuellen();
    ebenen[name].classList.add('ist-offen');
    html.classList.add('ebene-offen');
    var fokus = name === 'uebersicht' ? ebenen.uebersicht.querySelector('.ue-karte.ist-aktuell') || ebenen.uebersicht.querySelector('.ue-karte')
      : ebenen[name].querySelector('button, [tabindex="0"]');
    if (fokus) fokus.focus({ preventScroll: true });
    /* Übersicht: von oben beginnen (Überschrift „Übersicht“ sichtbar), solange
       die aktuelle Folie dabei ganz zu sehen ist – sonst die Kachel mittig
       zeigen (Abschlussprüfung 16.10.2026: Überschrift war abgeschnitten) */
    if (name === 'uebersicht' && fokus) {
      var fenster = ebenen.uebersicht;
      fenster.scrollTop = 0;
      if (fokus.getBoundingClientRect().bottom > fenster.getBoundingClientRect().bottom - 24) {
        fokus.scrollIntoView({ block: 'center' });
      }
    }
  }
  function ebeneSchliessen(still) {
    if (!offeneEbene) return;
    var name = offeneEbene;
    if (name === 'sprungmenue' && !still) { sprungmenueSchliessen(); return; }
    ebenen[name].classList.remove('ist-offen');
    if (name === 'sprungmenue') {
      html.classList.remove('menue-offen');
    }
    offeneEbene = null;
    html.classList.remove('ebene-offen');
    if (name === 'uebersicht') ebenen.uebersicht.innerHTML = '';
    /* Fokus zurückgeben – aber NICHT an Knöpfe der Bedienleiste: Sonst würde die nächste
       Leertaste/Enter die Ebene (Übersicht, Hilfe) wieder öffnen, statt weiterzuschalten. */
    var zurueckAnLeiste = fokusVorEbene && fokusVorEbene.closest && fokusVorEbene.closest('.bedienleiste');
    if (fokusVorEbene && !zurueckAnLeiste && fokusVorEbene.focus && document.contains(fokusVorEbene)) {
      try { fokusVorEbene.focus({ preventScroll: true }); } catch (e) { /* egal */ }
    } else if (document.activeElement) document.activeElement.blur();
  }
  Deck.ebeneSchliessen = function () { ebeneSchliessen(); };

  function ebeneTaste(e) {
    var taste = e.key;
    if (taste === 'Escape') { e.preventDefault(); ebeneSchliessen(); return true; }
    if (offeneEbene === 'hilfe') {
      if (taste === 'h' || taste === 'H' || taste === '?') { e.preventDefault(); ebeneSchliessen(); }
      else e.preventDefault();
      return true;
    }
    if (offeneEbene === 'uebersicht') {
      if (taste === 'o' || taste === 'O') { e.preventDefault(); ebeneSchliessen(); return true; }
      var karten = alle('.ue-karte', ebenen.uebersicht);
      var i = karten.indexOf(document.activeElement);
      var spalten = 5;
      var neu = -1;
      if (taste === 'ArrowRight') neu = i + 1;
      else if (taste === 'ArrowLeft') neu = i - 1;
      else if (taste === 'ArrowDown') neu = i + spalten;
      else if (taste === 'ArrowUp') neu = i - spalten;
      else if (taste === 'Home') neu = 0;
      else if (taste === 'End') neu = karten.length - 1;
      if (neu !== -1 || ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(taste) >= 0) {
        e.preventDefault();
        if (i < 0) neu = 0;
        neu = Math.max(0, Math.min(karten.length - 1, neu));
        if (karten[neu]) { karten[neu].focus({ preventScroll: true }); karten[neu].scrollIntoView({ block: 'nearest' }); }
        return true;
      }
      if (taste === 'Enter' || taste === ' ') {
        if (document.activeElement && document.activeElement.classList.contains('ue-karte')) {
          e.preventDefault();
          document.activeElement.click();
        }
        return true;
      }
      if (taste === 'PageDown' || taste === 'PageUp') { e.preventDefault(); return true; }
      return true;
    }
    if (offeneEbene === 'sprungmenue') {
      if (taste === 'Tab') return false;
      if (taste === 'Enter' || taste === ' ') return false;
      e.preventDefault();
      return true;
    }
    return false;
  }

  /* ----- Klon einer Folie für Übersicht und Vorschau ----- */
  var klonZaehler = 0;
  function klonen(f, schritt) {
    var k = f.el.cloneNode(true);
    klonZaehler++;
    k.classList.remove('ist-aktiv', 'ist-geht');
    k.classList.add('ist-klon');
    k.setAttribute('aria-hidden', 'true');
    k.setAttribute('inert', '');
    k.removeAttribute('aria-label');
    k.style.removeProperty('view-transition-name');
    alle('.notizen, script', k).forEach(function (n) { n.remove(); });
    alle('[style*="view-transition-name"]', k).forEach(function (n) { n.style.removeProperty('view-transition-name'); });
    /* Innere IDs umbenennen, damit SVG-Verweise (Verläufe, Textpfade) im Klon funktionieren */
    var ersetzung = {};
    alle('[id]', k).forEach(function (n) {
      var neu = n.id + '--k' + klonZaehler;
      ersetzung[n.id] = neu;
      n.id = neu;
    });
    if (Object.keys(ersetzung).length) {
      alle('*', k).forEach(function (n) {
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          if (!/(href|url\(|#)/.test(a.value) && !/^aria-(labelledby|describedby)$|^for$/.test(a.name)) return;
          var wert = a.value.replace(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g, function (m, id) {
            return ersetzung[id] ? 'url(#' + ersetzung[id] + ')' : m;
          });
          if ((a.name === 'href' || a.name === 'xlink:href') && /^#/.test(wert) && ersetzung[wert.slice(1)]) wert = '#' + ersetzung[wert.slice(1)];
          if (/^aria-(labelledby|describedby)$|^for$/.test(a.name)) {
            wert = wert.split(/\s+/).map(function (id) { return ersetzung[id] || id; }).join(' ');
          }
          if (wert !== a.value) n.setAttribute(a.name, wert);
        });
      });
    }
    schrittKlassen(null, schritt, k);
    /* Zähler im Klon auf Endwert */
    alle('[data-animation~="zaehlen"]', k).forEach(function (el) {
      var schrittEl = el.closest('[data-schritt]');
      var ab = schrittEl ? (parseInt(schrittEl.getAttribute('data-schritt'), 10) || 1) : 0;
      if (ab <= schritt) zaehlerEndwert(el);
    });
    /* Bausteine und Folien-Skripte dürfen den Klon anpassen */
    var originale = f.bausteinElemente;
    bausteine.forEach(function (b) {
      if (typeof b.klon !== 'function') return;
      var kopien = alle(b.selektor, k);
      var quellen = originale.filter(function (el) { return el._baustein === b; });
      kopien.forEach(function (kopie, i) {
        try { b.klon(kopie, schritt, quellen[i] || null); } catch (e) { console.error(e); }
      });
    });
    hookAufrufen(f, 'vorschau', [k, schritt]);
    return k;
  }
  Deck.klonen = function (folie, schritt) {
    var i = folieAufloesen(folie);
    return i >= 0 ? klonen(folien[i], schritt === undefined ? folien[i].schritteGesamt : schritt) : null;
  };

  /* ----- Übersicht (O) ----- */
  function uebersichtUmschalten() {
    if (offeneEbene === 'uebersicht') ebeneSchliessen();
    else ebeneOeffnen('uebersicht');
  }
  function sollzeitSumme() {
    return folien.filter(function (f) { return !f.backup; }).reduce(function (s, f) { return s + f.zeit; }, 0);
  }
  function uebersichtFuellen() {
    var eb = ebenen.uebersicht;
    eb.innerHTML = '';
    var ausgeblendet = alle(':scope > section.folie.ist-ausgeblendet', buehne).length;
    var kopf = util.element('div', { class: 'ue-kopf' }, null, eb);
    util.element('h2', { class: 'ue-titel' }, 'Übersicht', kopf);
    var info = util.element('div', { class: 'ue-info' }, null, kopf);
    info.innerHTML = anzahlHaupt + ' Hauptfolien · Sollzeit ' + util.zeitFormat(sollzeitSumme()) +
      ' von ' + util.zeitFormat((marke.dauerMinuten || 15) * 60) + ' min' +
      (ausgeblendet ? '<br>' + ausgeblendet + ' optionale Folie' + (ausgeblendet > 1 ? 'n' : '') + ' ausgeblendet (marke.js)' : '') +
      '<br>Pfeiltasten + Enter oder Klick · Esc schließt';
    var gruppen = [
      { name: 'Präsentation', liste: folien.filter(function (f) { return !f.backup; }) },
      { name: 'Backup', liste: folien.filter(function (f) { return f.backup; }) }
    ];
    gruppen.forEach(function (g) {
      if (!g.liste.length) return;
      util.element('h3', { class: 'ue-rubrik' }, g.name, eb);
      var raster = util.element('div', { class: 'ue-raster' }, null, eb);
      g.liste.forEach(function (f) {
        var karte = util.element('button', {
          type: 'button',
          class: 'ue-karte' + (f.index === aktuell.index ? ' ist-aktuell' : ''),
          'aria-label': 'Folie ' + f.nummer + ': ' + f.titel
        }, null, raster);
        var bild = util.element('div', { class: 'ue-bild' }, null, karte);
        bild.appendChild(klonen(f, f.schritteGesamt));
        var text = util.element('div', { class: 'ue-text' }, null, karte);
        util.element('span', { class: 'ue-nr' }, f.nummer, text);
        util.element('span', { class: 'ue-name' }, f.titel, text);
        var meta = [];
        if (f.buendel) meta.push('Bündel ' + f.buendel);
        if (f.zeit) meta.push(util.zeitFormat(f.zeit) + ' min');
        if (f.schritteGesamt) meta.push(f.schritteGesamt + ' Schritt' + (f.schritteGesamt > 1 ? 'e' : ''));
        if (f.optional) meta.push('optional');
        util.element('span', { class: 'ue-meta' }, meta.join(' · ') || ' ', karte);
        karte.addEventListener('click', function () {
          ebeneSchliessen(true);
          befehl('gehe', { folie: f.id, schritt: 0 });
        });
      });
    });
    /* Vorschaubilder einpassen */
    requestAnimationFrame(function () {
      alle('.ue-bild', eb).forEach(function (bild) {
        var s = bild.offsetWidth / 1920;
        var k = bild.firstElementChild;
        if (k) k.style.transform = 'scale(' + s + ')';
      });
    });
  }
  Deck.uebersicht = uebersichtUmschalten;

  /* ----- Hilfe (H, ?) ----- */
  function hilfeBauen() {
    var k = function (t) { return '<kbd>' + t + '</kbd>'; };
    ebenen.hilfe.innerHTML =
      '<h2>Tastenkürzel</h2>' +
      '<div class="hilfe-spalten"><dl>' +
      '<dt>' + k('→') + k('↓') + k('Leertaste') + k('Bild↓') + k('Enter') + '</dt><dd>weiter (nächster Schritt / nächste Folie)</dd>' +
      '<dt>' + k('←') + k('↑') + k('Bild↑') + k('⌫') + '</dt><dd>zurück</dd>' +
      '<dt>' + k('Pos1') + k('Ende') + '</dt><dd>erste / letzte Folie</dd>' +
      '<dt>' + k('6') + k('Enter') + '</dt><dd>Folie 06 anspringen</dd>' +
      '<dt>' + k('8') + k('B') + k('Enter') + '</dt><dd>Folie 08b anspringen</dd>' +
      '<dt>' + k('O') + '</dt><dd>Übersicht aller Folien (mit Backup)</dd>' +
      '<dt>' + k('P') + '</dt><dd>Referentenansicht im zweiten Fenster</dd>' +
      '</dl><dl>' +
      '<dt>' + k('F') + '</dt><dd>Vollbild an/aus</dd>' +
      '<dt>' + k('B') + k('.') + '</dt><dd>Schwarzbild an/aus</dd>' +
      '<dt>' + k('T') + '</dt><dd>Thema wechseln (Editorial, Bento, Keynote)</dd>' +
      '<dt>' + k('D') + '</dt><dd>hell / dunkel</dd>' +
      '<dt>' + k('H') + k('?') + '</dt><dd>diese Hilfe</dd>' +
      '<dt>' + k('Esc') + '</dt><dd>Fenster schließen, Eingabefeld verlassen</dd>' +
      '</dl></div>' +
      '<p class="hilfe-fuss">Präsentations-Clicker (Bild↑/Bild↓) funktionieren immer, auch wenn ein Eingabefeld aktiv ist. ' +
      'In Eingabefeldern (Wortwolke, Umfragewerte) gelten alle anderen Tasten als Texteingabe. ' +
      'Solange eine Umfrage zu sehen ist (Folie 08), zählen die Ziffern 1–5 Stimmen (Umschalt = minus) – zum Springen von dort ' +
      'erst weiterklicken oder O nutzen (nur „1“ „0“ Enter und „5“ „b“ Enter erkennt die Präsentation als Foliennummer). Mini-Steuerrad oben rechts = Sprungmenü. ' +
      'Nach einem Sprung aus dem Backup führt Z zurück zur Backup-Folie. ' +
      'Touch: nach links wischen = weiter, nach rechts = zurück; Antippen zeigt die Bedienleiste. ' +
      'Bedienleiste unten rechts (Maus im unteren Bildrand bewegen): Farbwähler testen Markenfarben nur in diesem Tab – dauerhaft in marke.js.</p>';
  }

  /* ----- Sprungmenü (Klick auf Mini-Steuerrad) ----- */
  var menueRad = null;
  function sprungmenueBauen() {
    var eb = ebenen.sprungmenue;
    eb.innerHTML =
      '<div class="sprungmenue-text"><p class="kicker">Sprungmenü</p><h2>Wohin<br>springen?</h2>' +
      '<p>Feld anklicken oder mit Tab wählen und Enter drücken. Esc schließt.</p></div>' +
      '<div class="steuerrad sprungmenue-rad" data-modus="menue" data-groesse="800"></div>' +
      '<div class="sprungmenue-knoepfe"></div>';
    menueRad = eb.querySelector('.sprungmenue-rad');
    var knoepfe = eb.querySelector('.sprungmenue-knoepfe');
    var hub = folien.filter(function (f) { return f.feld === 'hub' && !f.backup; });
    hub.forEach(function (f) {
      var b = util.element('button', { type: 'button', class: 'deck-knopf' }, null, knoepfe);
      b.innerHTML = icon('steuerrad') + '<span>' + util.escape(f.titel) + ' (' + util.escape(f.nummer) + ')</span>';
      b.addEventListener('click', function () { menueZiel(f.id); });
    });
    var ue = util.element('button', { type: 'button', class: 'deck-knopf' }, null, knoepfe);
    ue.innerHTML = icon('raster') + '<span>Übersicht (O)</span>';
    ue.addEventListener('click', function () { ebeneSchliessen(true); ebeneOeffnen('uebersicht'); });
    var zu = util.element('button', { type: 'button', class: 'deck-knopf' }, null, knoepfe);
    zu.innerHTML = icon('schliessen') + '<span>Schließen (Esc)</span>';
    zu.addEventListener('click', function () { sprungmenueSchliessen(); });
  }

  /* Das Sprungmenü-Rad ruft diese Funktion beim Klick auf ein Feld auf */
  function menueZiel(folienId) {
    var f = folienNachId[folienId];
    if (!f) return;
    if (IST_REFERENT && kanal.verbunden) {
      ebeneSchliessen(true);
      befehl('gehe', { folie: folienId, schritt: 0 });
      return;
    }
    var schliessen = function () {
      ebenen.sprungmenue.classList.remove('ist-offen');
      html.classList.remove('menue-offen', 'ebene-offen');
      if (menueRad) menueRad.style.removeProperty('view-transition-name');
      offeneEbene = null;
    };
    if (f.index === aktuell.index) {
      sprungmenueSchliessen();
      return;
    }
    gehe(f.index, 0, { vorher: schliessen });
  }
  Deck._menueZiel = menueZiel;

  function sprungmenueOeffnen() {
    if (offeneEbene === 'sprungmenue') { sprungmenueSchliessen(); return; }
    if (offeneEbene) ebeneSchliessen(true);
    var aktiv = folien[aktuell.index];
    if (menueRad) menueRad.setAttribute('data-aktiv', aktiv ? aktiv.feld : '');
    if (menueRad && menueRad._baustein && menueRad._baustein.aktualisieren) menueRad._baustein.aktualisieren(menueRad);
    var oeffnen = function () {
      fokusVorEbene = document.activeElement;
      html.classList.add('menue-offen', 'ebene-offen');
      ebenen.sprungmenue.classList.add('ist-offen');
      if (menueRad) menueRad.style.viewTransitionName = 'steuerrad';
      offeneEbene = 'sprungmenue';
    };
    morphUebergang(oeffnen, function () {
      /* Fokus auf das Menü selbst: Tab führt zum ersten Feld, ohne dass schon
         beim Öffnen ein Feld hervorgehoben ist */
      ebenen.sprungmenue.setAttribute('tabindex', '-1');
      ebenen.sprungmenue.focus({ preventScroll: true });
    });
  }
  function sprungmenueSchliessen() {
    var schliessen = function () {
      ebenen.sprungmenue.classList.remove('ist-offen');
      html.classList.remove('menue-offen', 'ebene-offen');
      if (menueRad) menueRad.style.removeProperty('view-transition-name');
      offeneEbene = null;
    };
    morphUebergang(schliessen, function () {
      if (document.activeElement) document.activeElement.blur();
    });
  }
  Deck.sprungmenue = sprungmenueOeffnen;

  function morphUebergang(aendern, danach) {
    if (unterstuetztVT && !bewegungReduziert() && !testSofort) {
      html.classList.add('vt-menue');
      try {
        var t = document.startViewTransition(aendern);
        var ende = function () { html.classList.remove('vt-menue'); };
        t.finished.then(ende, ende);
        t.ready.catch(function () { /* übersprungen */ });
        t.updateCallbackDone.then(function () { if (danach) danach(); }, function () { /* egal */ });
        return;
      } catch (e) {
        html.classList.remove('vt-menue');
      }
    }
    aendern();
    if (danach) danach();
  }


  /* ===========================================================================
     11. KANAL: Abgleich zwischen Vortragsfenster und Referentenfenster
     window.postMessage (funktioniert auch bei file://) + BroadcastChannel
     =========================================================================== */
  var KANAL_NAME = 'deck:' + location.pathname;
  /* Kennung dieses Fensters im Kanal. Das Folienfenster behält sie über ein
     Neuladen (F5) hinweg (sessionStorage gilt nur für diesen Tab) – so erkennt
     das Referentenfenster sein Folienfenster sofort wieder (VORTRAGSREIFE A12,
     21.10.2026). Das Referentenfenster nimmt immer eine neue Kennung: Ein mit
     window.open geöffnetes Fenster erbt den sessionStorage seines Öffners. */
  function kanalKennung() {
    var neu = Math.random().toString(36).slice(2);
    if (IST_REFERENT) return neu;
    var alt = sitzungLaden('kanal-id');
    if (alt && /^[a-z0-9]{4,}$/.test(alt)) return alt;
    sitzungSpeichern('kanal-id', neu);
    return neu;
  }
  var kanal = {
    id: kanalKennung(),
    lauf: Math.random().toString(36).slice(2),   /* je Laden neu: Nachrichtennummern beginnen nach F5 wieder bei 1 */
    zaehler: 0,
    gesehen: [],
    partner: null,
    partnerId: null,       /* Referentenfenster: Kennung „seines“ Folienfensters (A12) */
    referentZuletzt: 0,    /* Folienfenster: letztes „hallo“ eines Referentenfensters (A25) */
    bc: null,
    verbunden: false,
    zuletzt: 0,
    empfaenger: {}
  };
  Deck.kanal = {
    /* Bausteine: Deck.kanal.senden('umfrage', { … }) und Deck.kanal.bei('umfrage', fn) */
    senden: function (typ, daten) { kanalSenden('x:' + typ, daten); },
    bei: function (typ, fn) { (kanal.empfaenger['x:' + typ] = kanal.empfaenger['x:' + typ] || []).push(fn); }
  };

  function kanalEinrichten() {
    try {
      if ('BroadcastChannel' in window) {
        kanal.bc = new BroadcastChannel(KANAL_NAME);
        kanal.bc.onmessage = function (e) { kanalEmpfangen(e.data, null); };
      }
    } catch (e) { kanal.bc = null; }
    window.addEventListener('message', function (e) { kanalEmpfangen(e.data, e.source); });
    if (IST_REFERENT && window.opener) kanal.partner = window.opener;
  }

  function kanalSenden(typ, daten) {
    var nachricht = { deck: KANAL_NAME, von: kanal.id, lauf: kanal.lauf, nr: ++kanal.zaehler, typ: typ, daten: daten || {} };
    /* Referentenfenster: Befehle nur an das eigene Folienfenster (A12). „hallo“
       geht an alle – so meldet sich auch ein neu geöffnetes Folienfenster. */
    if (IST_REFERENT && kanal.partnerId && typ !== 'hallo') nachricht.an = kanal.partnerId;
    try {
      if (kanal.partner && !kanal.partner.closed) kanal.partner.postMessage(nachricht, '*');
    } catch (e) { /* Fenster weg */ }
    try {
      if (kanal.bc) kanal.bc.postMessage(nachricht);
    } catch (e) { /* egal */ }
  }

  /* Referentenfenster: Welches Folienfenster ist „meins“? (VORTRAGSREIFE A12,
     21.10.2026) Ist ein zweites Fenster mit der Präsentation offen (vergessener
     Probe-Tab), schalteten sonst beide, und die Ansicht sprang zwischen ihren
     Ständen hin und her. Regeln: Das Fenster, aus dem die Referentenansicht
     geöffnet wurde (window.opener), gewinnt immer; sonst das erste, das seinen
     Zustand schickt. Ein anderes wird erst übernommen, wenn das bisherige 7 s
     lang schweigt (geschlossen oder abgestürzt, siehe referentBauen).
     Gibt false zurück, wenn die Nachricht von einem fremden Fenster kommt. */
  function partnerPruefen(n, quelle) {
    if (n.typ === 'hallo') return false;          /* „hallo“ schicken nur Referentenfenster */
    var vomOeffner = !!quelle && quelle !== window && quelle === window.opener;
    if (vomOeffner || (n.typ === 'zustand' && (!kanal.partnerId || !kanal.verbunden))) kanal.partnerId = n.von;
    return !kanal.partnerId || n.von === kanal.partnerId;
  }

  function kanalEmpfangen(n, quelle) {
    if (!n || typeof n !== 'object' || n.deck !== KANAL_NAME || n.von === kanal.id) return;
    /* an ein anderes Folienfenster gerichtet (A12) */
    if (n.an && n.an !== kanal.id) return;
    /* vor dem Merken prüfen: Dieselbe Nachricht kommt doppelt an (postMessage
       und BroadcastChannel); erst die Kopie vom Öffner legt den Partner fest */
    if (IST_REFERENT && !partnerPruefen(n, quelle)) return;
    var schluessel = n.von + ':' + (n.lauf || '') + ':' + n.nr;
    if (kanal.gesehen.indexOf(schluessel) >= 0) return;
    kanal.gesehen.push(schluessel);
    if (kanal.gesehen.length > 200) kanal.gesehen.splice(0, 100);
    if (quelle && quelle !== window && !kanal.partner) kanal.partner = quelle;

    if (n.typ === 'zustand' && IST_REFERENT) {
      kanal.verbunden = true;
      kanal.zuletzt = Date.now();
      zustandUebernehmen(n.daten);
    } else if (n.typ === 'hallo' && !IST_REFERENT) {
      if (quelle && quelle !== window) kanal.partner = quelle;
      kanal.referentZuletzt = Date.now();
      kanalZustandSenden(true);
    } else if (n.typ === 'befehl' && !IST_REFERENT) {
      befehlAusfuehren(n.daten.aktion, n.daten);
    } else if (n.typ === 'hinweis' && IST_REFERENT) {
      hinweisZeigen(String((n.daten && n.daten.text) || ''));
    } else if (kanal.empfaenger[n.typ]) {
      kanal.empfaenger[n.typ].forEach(function (fn) {
        try { fn(n.daten); } catch (e) { console.error(e); }
      });
    }
  }

  function kanalZustandSenden(erzwingen) {
    if (IST_REFERENT || !istGestartet) return;
    if (!erzwingen && !kanal.partner && !kanal.bc) return;
    var f = folien[aktuell.index];
    kanalSenden('zustand', {
      folie: f ? f.id : null,
      schritt: aktuell.schritt,
      thema: html.getAttribute('data-thema'),
      modus: html.getAttribute('data-modus'),
      farben: { primaer: farbTest.primaer, sekundaer: farbTest.sekundaer },
      schwarz: html.classList.contains('schwarz')
    });
  }

  function zustandUebernehmen(z) {
    if (!z) return;
    if (z.thema && (z.thema !== html.getAttribute('data-thema') || z.modus !== html.getAttribute('data-modus'))) {
      themaSetzen(z.thema, z.modus, { still: true });
    }
    if (z.farben && (z.farben.primaer !== farbTest.primaer || z.farben.sekundaer !== farbTest.sekundaer)) {
      farbTest.primaer = z.farben.primaer || '';
      farbTest.sekundaer = z.farben.sekundaer || '';
      markenfarbenSetzen();
    }
    html.classList.toggle('schwarz-im-saal', !!z.schwarz);
    if (z.folie) {
      var i = folieAufloesen(z.folie);
      /* sofort: ohne Überblendung – sonst blendete bei jedem Folienwechsel das
         ganze Referentenfenster ≈ 0,6 s über, Sprechtext doppelt (A26) */
      if (i >= 0 && (i !== aktuell.index || z.schritt !== aktuell.schritt)) gehe(i, z.schritt, { still: true, sofort: true });
    }
    referentAktualisieren();
  }


  /* ===========================================================================
     12. REFERENTENANSICHT
     =========================================================================== */
  var referentFenster = null;
  var r = {};                 // Elemente der Referentenansicht
  var uhr = { laeuft: false, gestartet: false, start: 0, gesammelt: 0, folieStart: 0, folieId: null };

  function referentOeffnen() {
    if (IST_REFERENT) return;
    /* Adressparameter mitgeben, die die Folienliste oder das Aussehen ändern
       (z. B. ?optional=alle) – sonst hätten beide Fenster verschiedene Folien */
    var mit = ['optional', 'thema', 'modus', 'primaer', 'sekundaer', 'bewegung'].filter(function (k) {
      return parameter.has(k);
    }).map(function (k) {
      return encodeURIComponent(k) + (parameter.get(k) ? '=' + encodeURIComponent(parameter.get(k)) : '');
    });
    var url = location.href.split('#')[0].split('?')[0] + '?referent' + (mit.length ? '&' + mit.join('&') : '') + location.hash;
    try {
      referentFenster = window.open(url, 'deck-referent', 'popup=yes,width=1440,height=900');
    } catch (e) { referentFenster = null; }
    if (!referentFenster) {
      hinweisZeigen('Popup blockiert – bitte Popups für diese Datei erlauben');
      return;
    }
    kanal.partner = referentFenster;
    setTimeout(function () { kanalZustandSenden(true); }, 400);
  }
  Deck.referent = referentOeffnen;

  function gesamtMs() {
    return uhr.gesammelt + (uhr.laeuft ? Date.now() - uhr.start : 0);
  }

  /* Uhrzustand sichern (VORTRAGSREIFE A9, 21.10.2026): Ein Neuladen des
     Referentenfensters (F5, Strg+R, eine Clicker-Taste, die F5 sendet) oder
     Schließen und erneutes P setzte Gesamt- und Folienuhr auf 0:00. Der Stand
     liegt jetzt im Browser-Speicher (localStorage, mit try/catch – bei
     gesperrtem Speicher bleibt alles wie vorher) und wird beim Öffnen der
     Referentenansicht übernommen; die Uhr läuft dabei ohne Lücke weiter.
     Ein Stand, der länger als UHR_VERGESSEN_MS nicht geändert wurde, gilt als
     vergessen (z. B. von der Probe am Vortag). „Zeit zurücksetzen“ löscht ihn –
     vor dem Vortrag bleibt das Pflicht (LIESMICH §4). */
  var UHR_SCHLUESSEL = 'referent-uhr';
  var UHR_VERGESSEN_MS = 3 * 60 * 60 * 1000;
  function uhrSichern() {
    if (!IST_REFERENT) return;
    if (!uhr.gestartet) { util.speichern(UHR_SCHLUESSEL, null); return; }
    util.speichern(UHR_SCHLUESSEL, {
      laeuft: uhr.laeuft, start: uhr.start, gesammelt: uhr.gesammelt,
      folieStart: uhr.folieStart, folieId: uhr.folieId, gesichert: Date.now()
    });
  }
  function uhrWiederherstellen() {
    var s = util.laden(UHR_SCHLUESSEL, null);
    if (!s || typeof s !== 'object' || typeof s.gesammelt !== 'number') return;
    if (!(Date.now() - (s.gesichert || 0) < UHR_VERGESSEN_MS)) { util.speichern(UHR_SCHLUESSEL, null); return; }
    uhr.gestartet = true;
    uhr.laeuft = !!s.laeuft;
    uhr.start = Number(s.start) || Date.now();
    uhr.gesammelt = Math.max(0, s.gesammelt);
    uhr.folieStart = Math.max(0, Number(s.folieStart) || 0);
    uhr.folieId = s.folieId || null;
  }

  function uhrStarten() {
    if (uhr.laeuft) return;
    uhr.laeuft = true;
    uhr.gestartet = true;
    uhr.start = Date.now();
    uhrSichern();
    referentAktualisieren();
  }
  function uhrPausieren() {
    if (!uhr.laeuft) return;
    uhr.gesammelt += Date.now() - uhr.start;
    uhr.laeuft = false;
    uhrSichern();
    referentAktualisieren();
  }
  function uhrZuruecksetzen() {
    uhr.laeuft = false;
    uhr.gestartet = false;
    uhr.gesammelt = 0;
    uhr.folieStart = 0;
    uhrSichern();
    referentAktualisieren();
  }

  function referentBauen() {
    html.classList.add('referent');
    document.title = 'Referentenansicht – ' + (marke.titel || 'Präsentation');
    var raster = util.element('div', { class: 'referent-raster' }, null, document.body);
    raster.innerHTML =
      '<section class="r-feld r-aktuell" aria-label="Aktuelle Folie">' +
      '  <div class="r-etikett"><span class="r-titel-aktuell">Aktuell</span><span class="r-verbindung" data-stand="getrennt">nicht verbunden</span></div>' +
      '  <div class="r-buehnenplatz r-platz-aktuell"></div>' +
      '</section>' +
      '<section class="r-feld r-naechste" aria-label="Nächster Schritt">' +
      '  <div class="r-etikett"><span class="r-titel-naechste">Als Nächstes</span></div>' +
      '  <div class="r-buehnenplatz r-platz-naechste"><div class="r-vorschau"></div></div>' +
      '  <div class="r-info" style="padding:12px 14px 14px"></div>' +
      '</section>' +
      '<section class="r-feld r-notizen" aria-label="Sprechtext">' +
      '  <div class="r-etikett"><span>Sprechtext</span><span>' +
      '    <button type="button" class="r-knopf r-knopf--rueckfragen" data-r="rueckfragen" hidden>Rückfragen ↓</button> ' +
      '    <button type="button" class="r-knopf" data-r="kleiner" aria-label="Schrift kleiner">A−</button> ' +
      '    <button type="button" class="r-knopf" data-r="groesser" aria-label="Schrift größer">A+</button></span></div>' +
      '  <div class="r-notizen-text"></div>' +
      '</section>' +
      '<section class="r-feld r-uhren" aria-label="Zeit">' +
      '  <div class="r-uhr-zeile r-uhr-gesamt"><span class="r-uhr-name">Gesamtzeit</span><span class="r-uhr-soll r-uhrzeit">Uhrzeit --:--</span>' +
      '    <span class="r-uhr-wert">0:00</span><span class="r-uhr-soll r-uhr-soll-wert"></span><div class="r-uhr-balken"><span></span></div></div>' +
      '  <div class="r-uhr-zeile r-uhr-folie"><span class="r-uhr-name">Diese Folie</span><span class="r-uhr-soll"></span>' +
      '    <span class="r-uhr-wert">0:00</span><span class="r-uhr-soll r-uhr-soll-wert"></span><div class="r-uhr-balken"><span></span></div></div>' +
      '  <div class="r-plan"></div>' +
      '  <div class="r-knoepfe">' +
      '    <button type="button" class="r-knopf r-knopf--gross" data-r="zurueck" aria-label="Zurück">' + icon('pfeil-links') + '</button>' +
      '    <button type="button" class="r-knopf r-knopf--gross" data-r="weiter" aria-label="Weiter">' + icon('pfeil-rechts') + '</button>' +
      '    <button type="button" class="r-knopf" data-r="startpause">' + icon('start') + '<span>Start</span></button>' +
      '    <button type="button" class="r-knopf" data-r="zuruecksetzen">' + icon('zuruecksetzen') + '<span>Zeit zurücksetzen</span></button>' +
      '    <button type="button" class="r-knopf" data-r="schwarz">' + icon('schwarz') + '<span>Schwarzbild</span></button>' +
      '  </div>' +
      '</section>';
    r.raster = raster;
    r.platzAktuell = raster.querySelector('.r-platz-aktuell');
    r.platzNaechste = raster.querySelector('.r-platz-naechste');
    r.vorschau = raster.querySelector('.r-vorschau');
    r.titelAktuell = raster.querySelector('.r-titel-aktuell');
    r.titelNaechste = raster.querySelector('.r-titel-naechste');
    r.verbindung = raster.querySelector('.r-verbindung');
    r.info = raster.querySelector('.r-info');
    r.notizen = raster.querySelector('.r-notizen-text');
    r.gesamt = raster.querySelector('.r-uhr-gesamt');
    r.folie = raster.querySelector('.r-uhr-folie');
    r.plan = raster.querySelector('.r-plan');
    r.uhrzeit = raster.querySelector('.r-uhrzeit');
    r.startpause = raster.querySelector('[data-r="startpause"]');
    /* Die echte Bühne in den Platz „Aktuell“ verschieben */
    /* (beide Plätze füllen ihr Feld; die Bühne wird darin mit Rand eingepasst) */
    r.platzAktuell.appendChild(deckEl);

    var schrift = util.laden('referent-schrift', 28);
    r.notizen.style.setProperty('--r-schrift', schrift + 'px');
    r.schwarz = raster.querySelector('[data-r="schwarz"]');
    r.rueckfragen = raster.querySelector('[data-r="rueckfragen"]');
    uhrWiederherstellen();

    raster.addEventListener('click', function (e) {
      var k = e.target.closest('[data-r]');
      if (!k) return;
      var a = k.getAttribute('data-r');
      if (a === 'weiter' || a === 'zurueck') befehl(a);
      else if (a === 'startpause') { if (uhr.laeuft) uhrPausieren(); else uhrStarten(); }
      else if (a === 'zuruecksetzen') uhrZuruecksetzen();
      else if (a === 'schwarz') befehl('schwarz', { an: !html.classList.contains('schwarz-im-saal') });
      else if (a === 'rueckfragen') rueckfragenUmschalten();
      else if (a === 'kleiner' || a === 'groesser') {
        var jetzt = parseFloat(getComputedStyle(r.notizen).getPropertyValue('--r-schrift')) || 28;
        var neu = Math.max(18, Math.min(48, jetzt + (a === 'groesser' ? 2 : -2)));
        r.notizen.style.setProperty('--r-schrift', neu + 'px');
        util.speichern('referent-schrift', neu);
        sprechtextZumSchritt(false);     // Absätze haben sich verschoben
      }
      k.blur();
    });

    /* Verbindung zum Vortragsfenster aufbauen und halten */
    kanalSenden('hallo', {});
    setInterval(function () {
      kanalSenden('hallo', {});
      if (kanal.verbunden && Date.now() - kanal.zuletzt > 7000) {
        kanal.verbunden = false;
        referentAktualisieren();
      }
    }, 3000);
    setInterval(uhrAnzeigen, 500);
    r.notizen.addEventListener('scroll', function () {
      clearTimeout(r.rueckfragenTimer);
      r.rueckfragenTimer = setTimeout(rueckfragenBeschriften, 120);
    });
    window.addEventListener('resize', einpassen);
    if ('ResizeObserver' in window) new ResizeObserver(einpassen).observe(r.platzAktuell);
  }

  var letzteReferentFolie = null;
  var letzterReferentSchritt = -1;
  function referentAktualisieren() {
    if (!IST_REFERENT || !r.raster) return;
    var f = folien[aktuell.index];
    if (!f) return;
    r.verbindung.setAttribute('data-stand', kanal.verbunden ? 'verbunden' : 'getrennt');
    r.verbindung.textContent = kanal.verbunden ? 'mit Vortragsfenster verbunden' : 'nicht verbunden (steuert sich selbst)';

    /* automatisch starten, sobald zum ersten Mal weitergeschaltet wird (besser:
       mit dem ersten Satz auf „Start“ klicken – der Knopf leuchtet, A14) */
    if (letzteReferentFolie && (letzteReferentFolie !== f.id || letzterReferentSchritt !== aktuell.schritt) && !uhr.gestartet) uhrStarten();
    /* Folienuhr: Beginn der Folie merken (uhr.folieId übersteht das Neuladen, A9) */
    if (uhr.folieId !== f.id) {
      uhr.folieStart = gesamtMs();
      uhr.folieId = f.id;
      uhrSichern();
    }
    var folieGewechselt = letzteReferentFolie !== f.id;
    /* Nur bei echtem Folien- oder Schrittwechsel zum Absatz scrollen: Der
       Abgleich alle 3 s („hallo“ → „zustand“) ruft diese Funktion ebenfalls
       auf – sonst spränge von Hand gescrollter Sprechtext ständig zurück
       (Abschlussprüfung 17.10.2026). Alten Schritt VOR dem Überschreiben merken. */
    var schrittGewechselt = folieGewechselt || letzterReferentSchritt !== aktuell.schritt;
    letzteReferentFolie = f.id;
    letzterReferentSchritt = aktuell.schritt;

    r.titelAktuell.textContent = 'Aktuell · ' + f.nummer + ' ' + f.titel +
      (f.schritteGesamt ? ' · Schritt ' + aktuell.schritt + '/' + f.schritteGesamt : '');

    /* Nächster Schritt bzw. nächste Folie */
    referentVorschauBauen(f);

    /* Infos */
    var info = [];
    info.push('<span class="r-pille"><b>Folie</b>' + util.escape(f.nummer) + (f.backup ? '' : ' von ' + util.escape(folien[anzahlHaupt - 1].nummer)) + '</span>');
    if (f.buendel) info.push('<span class="r-pille"><b>Bündel</b>' + util.escape(f.buendel) + '</span>');
    if (f.feld && FELD_NAMEN[f.feld]) info.push('<span class="r-pille"><b>Feld</b>' + util.escape(FELD_NAMEN[f.feld]) + '</span>');
    if (f.zeit) info.push('<span class="r-pille"><b>Soll</b>' + util.zeitFormat(f.zeit) + ' min</span>');
    info.push('<span class="r-pille"><b>Thema</b>' + THEMEN_NAMEN[html.getAttribute('data-thema')] + ' · ' + html.getAttribute('data-modus') + '</span>');
    var saalSchwarz = html.classList.contains('schwarz-im-saal');
    if (saalSchwarz) info.push('<span class="r-pille" style="background:#5a1d1d"><b>Saal</b>Schwarzbild</span>');
    r.info.innerHTML = info.join('');
    /* Knopf zeigt, ob der Saal schwarz ist (A8) */
    if (r.schwarz) {
      r.schwarz.classList.toggle('ist-an', saalSchwarz);
      r.schwarz.setAttribute('aria-pressed', saalSchwarz ? 'true' : 'false');
      r.schwarz.querySelector('span').textContent = saalSchwarz ? 'Saal einblenden' : 'Schwarzbild';
    }

    /* Sprechtext */
    if (folieGewechselt) {
      var notiz = f.el.querySelector(':scope > .notizen');
      r.notizen.innerHTML = notiz && notiz.innerHTML.trim() ? notiz.innerHTML : '<p class="r-notizen-leer">Kein Sprechtext hinterlegt.</p>';
      r.notizen.scrollTop = 0;
      rueckfragenVorbereiten();
    }
    alle('[data-schritt]', r.notizen).forEach(function (el) {
      var n = parseInt(el.getAttribute('data-schritt'), 10) || 0;
      el.classList.toggle('ist-erreicht', n <= aktuell.schritt);
      el.classList.toggle('ist-jetzt', n === aktuell.schritt);
    });
    /* Absatz zum aktuellen Schritt in den Blick holen (beim Folienwechsel ohne
       Gleiten, innerhalb der Folie sanft) – nur nach einem Wechsel, siehe oben */
    if (schrittGewechselt) sprechtextZumSchritt(!folieGewechselt);
    uhrAnzeigen();
  }

  /* Rückfragen im Sprechtext finden (VORTRAGSREIFE A11, 21.10.2026): Sie
     standen erst nach 550–1.000 Wörtern und sahen aus wie Sprechtext. Jetzt:
     Absätze ohne data-schritt sind kleiner und grau (css/deck.css, nur wenn
     die Folie Sprechabsätze hat; Ausnahme class="gesprochen"), und der Knopf
     „Rückfragen ↓“ rollt zum ersten Absatz, der mit „Rückfragen“, „Mögliche
     Rückfragen“ oder „Wahrscheinliche Rückfragen“ beginnt – ein zweiter Klick
     zurück zum aktuellen Schritt. */
  var RUECKFRAGEN_ANFANG = /^\s*(?:Mögliche\s+|Wahrscheinliche\s+)?Rückfragen/i;
  function rueckfragenAbsatz() {
    return r.notizen ? r.notizen.querySelector('.r-rueckfragen-start') : null;
  }
  function rueckfragenVorbereiten() {
    var kinder = Array.prototype.slice.call(r.notizen.children);
    r.notizen.classList.toggle('r-mit-schritten', kinder.some(function (k) { return k.hasAttribute('data-schritt'); }));
    var treffer = kinder.filter(function (k) { return !k.hasAttribute('data-schritt') && RUECKFRAGEN_ANFANG.test(k.textContent || ''); })[0];
    if (treffer) treffer.classList.add('r-rueckfragen-start');
    if (r.rueckfragen) r.rueckfragen.hidden = !treffer;
    rueckfragenBeschriften();
  }
  function rueckfragenSichtbar() {
    var ziel = rueckfragenAbsatz();
    if (!ziel) return false;
    var oben = ziel.getBoundingClientRect().top - r.notizen.getBoundingClientRect().top;
    return oben < r.notizen.clientHeight * 0.5;
  }
  function rueckfragenBeschriften() {
    if (!r.rueckfragen || r.rueckfragen.hidden) return;
    var dort = rueckfragenSichtbar();
    r.rueckfragen.textContent = dort ? 'Zum Schritt ↑' : 'Rückfragen ↓';
    r.rueckfragen.setAttribute('aria-label', dort ? 'Zurück zum Sprechtext des aktuellen Schritts' : 'Zu den möglichen Rückfragen dieser Folie rollen');
  }
  function rueckfragenUmschalten() {
    var ziel = rueckfragenAbsatz();
    if (!ziel) return;
    if (rueckfragenSichtbar()) { sprechtextZumSchritt(true); return; }
    var oben = r.notizen.scrollTop + ziel.getBoundingClientRect().top - r.notizen.getBoundingClientRect().top - 16;
    try {
      r.notizen.scrollTo({ top: Math.max(0, Math.round(oben)), behavior: bewegungReduziert() ? 'auto' : 'smooth' });
    } catch (e) { r.notizen.scrollTop = Math.max(0, Math.round(oben)); }
  }

  /* „Als Nächstes“: Klon des nächsten Schritts bzw. der nächsten Folie */
  function referentVorschauBauen(f) {
    r.vorschau.innerHTML = '';
    var naechste = null, naechsterSchritt = 0, text = '';
    if (aktuell.schritt < f.schritteGesamt) {
      naechste = f; naechsterSchritt = aktuell.schritt + 1;
      text = 'Als Nächstes · Schritt ' + naechsterSchritt + '/' + f.schritteGesamt + ' auf dieser Folie';
    } else if (aktuell.index < folien.length - 1 && aktuell.index !== anzahlHaupt - 1) {
      naechste = folien[aktuell.index + 1];
      text = 'Als Nächstes · ' + naechste.nummer + ' ' + naechste.titel;
    } else {
      text = 'Als Nächstes · Ende';
    }
    r.titelNaechste.textContent = text;
    if (naechste) {
      var k = klonen(naechste, naechsterSchritt);
      r.vorschau.appendChild(k);
    } else {
      util.element('div', { class: 'r-vorschau-ende' }, 'Ende der Präsentation – Backup über Taste O', r.vorschau);
    }
    vorschauEinpassen();
  }

  /* Vorschau neu bauen, wenn sich Live-Daten ändern (Umfrage, Wortwolke):
     Der Klon zeigte sonst bis zum nächsten Abgleich (bis 3 s) alte Werte,
     z. B. die Beispielzahl „27 %“ statt der Live-Stimmen. Aufruf aus
     komponenten.js (umfrageNeuLaden, wolkeNeuLaden); kurz gebündelt. */
  var vorschauTimer = null;
  Deck.vorschauAuffrischen = function () {
    if (!IST_REFERENT || !r.raster) return;
    clearTimeout(vorschauTimer);
    vorschauTimer = setTimeout(function () {
      var f = folien[aktuell.index];
      if (f) referentVorschauBauen(f);
    }, 60);
  };

  /* Sprechtext so scrollen, dass der Absatz zum aktuellen Schritt oben im Feld
     steht (mit etwas Luft). Gibt es für den Schritt keinen eigenen Absatz, gilt
     der zuletzt erreichte. Steht der Absatz ganz vorn (Schritt 0), beginnt der
     Text oben – so bleiben einleitende Absätze ohne Schritt sichtbar.
     Auch nach A− / A+ aufgerufen, weil sich dann alle Absätze verschieben. */
  function sprechtextZumSchritt(sanft) {
    if (!r.notizen) return;
    var absaetze = alle('[data-schritt]', r.notizen);
    var ziel = absaetze.filter(function (el) { return el.classList.contains('ist-jetzt'); })[0];
    if (!ziel) {
      var erreicht = absaetze.filter(function (el) { return el.classList.contains('ist-erreicht'); });
      ziel = erreicht[erreicht.length - 1];
    }
    var oben = 0;
    if (ziel && absaetze.indexOf(ziel) > 0) {
      oben = r.notizen.scrollTop + ziel.getBoundingClientRect().top - r.notizen.getBoundingClientRect().top - 16;
    }
    oben = Math.max(0, Math.round(oben));
    if (Math.abs(r.notizen.scrollTop - oben) < 2) return;
    try {
      r.notizen.scrollTo({ top: oben, behavior: sanft && !bewegungReduziert() ? 'smooth' : 'auto' });
    } catch (e) { r.notizen.scrollTop = oben; }
  }

  function vorschauEinpassen() {
    if (!r.vorschau) return;
    var k = r.vorschau.firstElementChild;
    if (!k || !k.classList.contains('folie')) return;
    var b = r.vorschau.clientWidth, h = r.vorschau.clientHeight;
    var s = Math.min(b / 1920, h / 1080);
    k.style.transform = 'translate(' + Math.round((b - 1920 * s) / 2) + 'px, ' + Math.round((h - 1080 * s) / 2) + 'px) scale(' + s + ')';
  }

  function uhrAnzeigen() {
    if (!r.gesamt) return;
    var f = folien[aktuell.index];
    var gesamt = gesamtMs() / 1000;
    var soll = (marke.dauerMinuten || 15) * 60;
    zeileSetzen(r.gesamt, gesamt, soll);
    var folieSek = (gesamtMs() - uhr.folieStart) / 1000;
    zeileSetzen(r.folie, folieSek, f ? f.zeit : 0);
    /* Abgleich mit dem Plan: Soll-Start dieser Folie gegen Ist-Start */
    if (f && !f.backup) {
      var sollStart = folien.slice(0, f.index).filter(function (g) { return !g.backup; })
        .reduce(function (s, g) { return s + g.zeit; }, 0);
      var istStart = uhr.folieStart / 1000;
      var diff = Math.round(istStart - sollStart);
      var text = !uhr.gestartet ? 'Zeit steht – mit dem ersten Satz auf <strong>„Start“</strong> klicken (sonst startet sie erst beim ersten Weiterschalten).'
        : (Math.abs(diff) < 10 ? '<strong>im Plan</strong>' : diff > 0 ? '<strong>' + util.zeitFormat(diff) + ' hinter Plan</strong>'
          : '<strong>' + util.zeitFormat(-diff) + ' vor Plan</strong>');
      r.plan.innerHTML = 'Plan: Folie startet bei ' + util.zeitFormat(sollStart) + ' · ' + text;
    } else {
      r.plan.textContent = f && f.backup ? 'Backup-Folie' : '';
    }
    var jetzt = new Date();
    r.uhrzeit.textContent = 'Uhrzeit ' + (jetzt.getHours() < 10 ? '0' : '') + jetzt.getHours() + ':' + (jetzt.getMinutes() < 10 ? '0' : '') + jetzt.getMinutes();
    r.startpause.innerHTML = uhr.laeuft ? icon('pause') + '<span>Pause</span>' : icon('start') + '<span>' + (uhr.gestartet ? 'Weiter' : 'Start') + '</span>';
    /* Start-Knopf hervorheben, solange die Uhr noch nie lief (A14): Die
       Rätselfrage auf Folie 01 fehlte sonst in Gesamt- und Folienuhr */
    r.startpause.classList.toggle('r-knopf--start', !uhr.gestartet);
  }
  function zeileSetzen(zeile, ist, soll) {
    zeile.querySelector('.r-uhr-wert').textContent = util.zeitFormat(ist);
    zeile.querySelector('.r-uhr-soll-wert').textContent = soll ? 'von ' + util.zeitFormat(soll) : '';
    var anteil = soll ? ist / soll : 0;
    zeile.querySelector('.r-uhr-balken > span').style.width = Math.min(100, anteil * 100) + '%';
    zeile.setAttribute('data-stand', !soll ? 'ok' : anteil > 1 ? 'ueber' : anteil >= 0.85 ? 'warn' : 'ok');
  }


  /* ===========================================================================
     13. DRUCK UND PDF
     =========================================================================== */
  var istDruckmodus = false;

  function endzustandFolie(f) {
    schrittKlassen(f, f.schritteGesamt);
    alle('[data-animation~="zaehlen"]', f.el).forEach(zaehlerEndwert);
    bausteinHooks(f, 'druck');
    hookAufrufen(f, 'druck');
  }

  function druckmodusAn() {
    if (istDruckmodus) return;
    istDruckmodus = true;
    html.classList.add('druckmodus');
    if (ebenenWurzel && offeneEbene) ebeneSchliessen(true);
    laufendeAnimationen.forEach(function (a) { try { a.finish(); } catch (e) { a.cancel(); } });
    folien.forEach(endzustandFolie);
    /* nach der letzten Seite kein Seitenumbruch (sonst leere Seite am Ende) */
    alle('.letzte-seite').forEach(function (x) { x.classList.remove('letzte-seite'); });
    var seiten = html.classList.contains('druck-notizen') ? alle(':scope > .druck-seite', buehne)
      : alle(':scope > section.folie:not(.ist-ausgeblendet)', buehne);
    if (seiten.length) seiten[seiten.length - 1].classList.add('letzte-seite');
  }
  function druckmodusAus() {
    if (!istDruckmodus || IST_DRUCK_URL) return;
    istDruckmodus = false;
    html.classList.remove('druckmodus');
    var f = folien[aktuell.index];
    folien.forEach(function (g) { if (g !== f) schrittKlassen(g, 0); });
    if (f) {
      schrittKlassen(f, aktuell.schritt);
      bausteinHooks(f, 'schritt', [aktuell.schritt, 'start']);
      hookAufrufen(f, 'schritt', [aktuell.schritt, 'start']);
    }
    einpassen();
  }

  /* ?druck&notizen=sprechtext (VORTRAGSREIFE A18, 21.10.2026): nur die
     Sprechabsätze (data-schritt, dazu class="gesprochen") – als Sprechzettel
     für Plan B ohne Referentenansicht. Das volle Handout ?druck&notizen hat
     mit allen Belegen und Rückfragen weit über 40 Seiten. Dazu kommen Absätze
     mit class="sprechzettel": nicht gesprochen, aber auf dem Zettel nötig
     (z. B. die Sprung-Bedienung für die Fragerunde auf Folie 12). */
  var NUR_SPRECHTEXT = parameter.get('notizen') === 'sprechtext';
  function druckSeitenMitNotizen() {
    html.classList.add('druck-notizen');
    var stil = document.createElement('style');
    stil.textContent = '@page { size: 1920px 1620px; margin: 0; }';
    document.head.appendChild(stil);
    folien.forEach(function (f) {
      var seite = document.createElement('div');
      seite.className = 'druck-seite';
      f.el.parentNode.insertBefore(seite, f.el);
      seite.appendChild(f.el);
      var notiz = util.element('div', { class: 'druck-notiz' }, null, seite);
      var quelle = f.el.querySelector(':scope > .notizen');
      var inhalt = quelle ? quelle.innerHTML.trim() : '';
      if (NUR_SPRECHTEXT && quelle) {
        inhalt = alle(':scope > [data-schritt], :scope > .gesprochen, :scope > .sprechzettel', quelle)
          .map(function (absatz) { return absatz.outerHTML; }).join('');
      }
      notiz.innerHTML = '<h3>Sprechtext · Folie ' + util.escape(f.nummer) + ' · ' + util.escape(f.titel) + '</h3>' +
        (inhalt || '<p><em>Kein Sprechtext hinterlegt.</em></p>');
    });
  }


  /* ===========================================================================
     14. START
     =========================================================================== */
  var bereitAufloesen;
  Deck.bereit = new Promise(function (fertig) { bereitAufloesen = fertig; });
  Deck.istBereit = false;

  function start() {
    buehne = document.querySelector('.buehne');
    deckEl = document.querySelector('.deck');
    if (!buehne || !deckEl) {
      console.error('deck.js: <div class="deck"><main class="buehne"> fehlt in der Seite.');
      return;
    }
    markenfarbenSetzen();
    themaSetzen(anfangsThema(), anfangsModus(), { still: true });
    if (marke.titel && !IST_REFERENT) document.title = marke.titel + (marke.name ? ' – ' + marke.name : '');
    /* erst die Schriften laden (lokal, wenige Millisekunden), dann aufbauen –
       so messen Bausteine wie das Steuerrad mit der richtigen Schrift */
    schriftenLaden().then(aufbauenUndStarten, aufbauenUndStarten);
  }

  function aufbauenUndStarten() {
    folienSammeln();
    if (!folien.length) {
      console.error('deck.js: keine Folien gefunden (<section class="folie"> in <main class="buehne">).');
      return;
    }
    folien.forEach(laufkopfEinfuegen);
    platzhalterFuellen(document);
    folien.forEach(function (f) { bausteineAufbauen(f.el, f); });
    folien.forEach(function (f) { hookAufrufen(f, 'einrichten'); });
    folien.forEach(schritteErmitteln);
    platzhalterFuellen(document);

    kanalEinrichten();
    ebenenBauen();
    bausteineAufbauen(ebenenWurzel, null);
    platzhalterFuellen(ebenenWurzel);

    if (IST_DRUCK_URL) {
      istGestartet = true;
      if (MIT_NOTIZEN) druckSeitenMitNotizen();
      druckmodusAn();
      aktuell.index = 0;
      folien[0].el.classList.add('ist-aktiv');
    } else {
      if (IST_REFERENT) referentBauen();
      else { leisteBauen(); wischenEinrichten(); }
      istGestartet = true;

      var ziel = adresseLesen();
      var index = ziel ? folieAufloesen(ziel.folie) : 0;
      if (index < 0) index = 0;
      gehe(index, ziel ? ziel.schritt : 0, { sofort: true, still: true });

      document.addEventListener('keydown', tasteGedrueckt);
      window.addEventListener('resize', einpassen);
      window.addEventListener('hashchange', function () {
        var z = adresseLesen();
        if (!z) return;
        var i = folieAufloesen(z.folie);
        if (i >= 0 && (i !== aktuell.index || z.schritt !== aktuell.schritt)) gehe(i, z.schritt);
      });
      window.addEventListener('beforeprint', druckmodusAn);
      window.addEventListener('afterprint', druckmodusAus);
      einpassen();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(einpassen);
      if (!IST_REFERENT) kanalZustandSenden();
    }

    Deck.istBereit = true;
    bereitAufloesen(Deck);
    document.dispatchEvent(new CustomEvent('deck:bereit', { detail: Deck.zustand() }));
  }

  /* Folien-Skripte werden nach deck.js geladen – Start daher erst, wenn das
     Dokument vollständig eingelesen ist. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
