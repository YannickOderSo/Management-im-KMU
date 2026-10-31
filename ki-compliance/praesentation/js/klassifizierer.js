/* =============================================================================
   klassifizierer.js – Prüflogik und Baustein „Der Klassifizierer“
   -----------------------------------------------------------------------------
   1. LOGIK (window.Klassifizierer.Pruefung) – ohne Engine, auch für die
      Handy-Seite klassifizierer.html. Daten: js/klassifizierer-daten.js.
        var p = new Klassifizierer.Pruefung(window.KLASSIFIZIERER);
        p.aktuell        → ID der offenen Frage (oder null = fertig)
        p.antworte('Ja') → beantwortet die offene Frage
        p.zurueck()      → letzte Antwort zurücknehmen
        p.treffer()      → Ergebnisse (ohne „minimal“, wenn es andere gibt)
   2. BAUSTEIN <div class="klassifizierer" data-faelle="bewerbung" data-frei>
      Baum mit fünf Prüfstufen (Spalten) und einem Feld darunter.
      • data-faelle="a b": Schritt 1 prüft Fall a, Schritt 2 Fall b
        (Fälle aus KLASSIFIZIERER.faelle). Der Pfad läuft animiert durch die
        Fragen; das Feld zeigt die Erklärung der aktuellen Frage mit Artikel,
        am Ende das Ergebnis mit Pflichten und Merksatz.
      • data-frei: Knopf „Eigener Fall“ – der Referent klickt Ja/Nein für einen
        Fall aus dem Publikum (Klick fängt der Baustein ab, kein Folienwechsel).
      • Druck: Endzustand des letzten Falls, ohne Animation.
   ============================================================================= */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var FORM = { verboten: 's-verboten', hoch: 's-hoch', ausnahme: 's-hoch', transparenz: 's-transparenz', minimal: 's-minimal', gpai: 's-gpai', kein: 's-kein' };
  var RANG = { verboten: 6, hoch: 5, ausnahme: 3, transparenz: 4, gpai: 2, minimal: 1, kein: 0 };
  var KLASSEN_NAME = { verboten: 'verboten', hoch: 'hochriskant', ausnahme: 'nicht hochriskant (Ausnahme)', transparenz: 'Transparenz', minimal: 'minimal', gpai: 'GPAI-Modell', kein: 'nicht erfasst' };

  function el(tag, attr, text, eltern) {
    var e = document.createElement(tag);
    Object.keys(attr || {}).forEach(function (k) { if (attr[k] !== null && attr[k] !== undefined) e.setAttribute(k, attr[k]); });
    if (text !== undefined && text !== null) e.textContent = text;
    if (eltern) eltern.appendChild(e);
    return e;
  }
  function sv(tag, attr, eltern) {
    var e = document.createElementNS(SVG_NS, tag);
    Object.keys(attr || {}).forEach(function (k) { if (attr[k] !== null && attr[k] !== undefined) e.setAttribute(k, attr[k]); });
    if (eltern) eltern.appendChild(e);
    return e;
  }
  function form(klasse, eltern, zusatz) {
    var s = sv('svg', { class: 'k-form' + (zusatz ? ' ' + zusatz : ''), viewBox: '0 0 24 24', 'aria-hidden': 'true', 'data-klasse': klasse }, eltern);
    sv('use', { href: '#' + (FORM[klasse] || 's-kein') }, s);
    return s;
  }
  function datum(iso) {
    var m = /^(?:spätestens )?(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso || '';
    return (/^spätestens/.test(iso) ? 'spätestens ' : '') + Number(m[3]) + '.' + Number(m[2]) + '.' + m[1];
  }


  /* ===========================================================================
     1. LOGIK
     =========================================================================== */
  function Pruefung(daten) {
    this.daten = daten;
    this.knoten = {};
    this.ergebnisse = {};
    var self = this;
    daten.knoten.forEach(function (k) { self.knoten[k.id] = k; });
    daten.ergebnisse.forEach(function (e) { self.ergebnisse[e.id] = e; });
    this.neu();
  }
  Pruefung.prototype.neu = function () {
    this.aktuell = this.daten.start;
    this.pfad = [];            /* [{ id, antwort, ergebnis, vorher }] */
    this.liste = [];           /* Ergebnis-IDs in Reihenfolge */
  };
  Pruefung.prototype.antworte = function (text) {
    var k = this.knoten[this.aktuell];
    if (!k) return null;
    var a = null;
    k.antworten.forEach(function (x) { if (x.text === text || x.text.indexOf(text) === 0) a = x; });
    if (!a) return null;
    var schritt = { id: k.id, antwort: text, ergebnis: a.ergebnis || null, vorher: this.aktuell };
    this.pfad.push(schritt);
    var weiter = null;
    if (a.ergebnis) {
      this.liste.push(a.ergebnis);
      var e = this.ergebnisse[a.ergebnis] || {};
      weiter = (a.weitere_pruefung && a.weitere_pruefung[0]) || (e.weitere_pruefung && e.weitere_pruefung[0]) || null;
    } else {
      weiter = a.weiter || null;
    }
    this.aktuell = weiter;
    return schritt;
  };
  Pruefung.prototype.zurueck = function () {
    var s = this.pfad.pop();
    if (!s) return;
    if (s.ergebnis) this.liste.pop();
    this.aktuell = s.id;
  };
  Pruefung.prototype.fertig = function () { return !this.aktuell; };
  Pruefung.prototype.treffer = function () {
    var self = this;
    var ids = this.liste.slice();
    var andere = ids.filter(function (id) { return !(self.ergebnisse[id] || {}).nurWennNichtsAnderes; });
    if (andere.length) ids = andere;
    return ids.map(function (id) { return self.ergebnisse[id]; }).filter(Boolean);
  };
  Pruefung.prototype.hauptklasse = function () {
    var beste = null;
    this.treffer().forEach(function (e) {
      if (!beste || (RANG[e.klasse] || 0) > (RANG[beste.klasse] || 0)) beste = e;
    });
    return beste;
  };
  /* Einen vorbereiteten Fall durchspielen → Liste der Schritte */
  Pruefung.prototype.spiele = function (antworten) {
    this.neu();
    var sicherung = 0;
    while (this.aktuell && sicherung++ < 60) {
      var a = antworten[this.aktuell];
      if (!a) { console.warn('Klassifizierer: Antwort für ' + this.aktuell + ' fehlt im Fall.'); break; }
      this.antworte(a);
    }
    return this.pfad.slice();
  };

  window.Klassifizierer = {
    Pruefung: Pruefung,
    FORM: FORM,
    KLASSEN_NAME: KLASSEN_NAME,
    form: form,
    datum: datum
  };


  /* ===========================================================================
     2. BAUSTEIN FÜR DIE FOLIE
     Maße in Bühnen-Pixeln: Breite 1680, Baum 0–500, Feld 508–720.
     =========================================================================== */
  var Deck = window.Deck;
  if (!Deck || !Deck.baustein || !window.KLASSIFIZIERER) return;

  var SPALTE_B = 336, KNOTEN_B = 312, ZEILE_Y0 = 60, ZEILE_H = 76, ZEILE_ABST = 12;
  var REIHEN = { 1: ['K1', 'K2'], 2: ['K3', 'K4', 'K5', 'K6'], 3: ['K7', 'K11', 'K8', 'K9', 'K10'], 4: ['K12', 'K13', 'K14', 'K15'], 5: ['K16', 'ENDE'] };
  var TEMPO = 520;          /* ms je Frage */
  var HALT = 900;           /* zusätzlich bei einem Treffer */

  function lage(id) {
    for (var s = 1; s <= 5; s++) {
      var i = REIHEN[s].indexOf(id);
      if (i >= 0) {
        var x = (s - 1) * SPALTE_B + (SPALTE_B - KNOTEN_B) / 2;
        var y = ZEILE_Y0 + i * (ZEILE_H + ZEILE_ABST);
        return { spalte: s, reihe: i, x: x, y: y, b: KNOTEN_B, h: ZEILE_H };
      }
    }
    return null;
  }

  /* Weg von Knoten a nach Knoten b (Punkte) */
  function weg(a, b) {
    var A = lage(a), B = lage(b);
    if (!A || !B) return [];
    var am = A.y + A.h / 2, bm = B.y + B.h / 2;
    if (A.spalte === B.spalte) {
      if (B.reihe === A.reihe + 1) {
        return [[A.x + A.b / 2, A.y + A.h], [B.x + B.b / 2, B.y]];
      }
      var lx = A.x - 9;          /* Umweg links an der Spalte */
      return [[A.x, am], [lx, am], [lx, bm], [B.x, bm]];
    }
    var gx = A.x + A.b + (SPALTE_B - KNOTEN_B) / 2;   /* Rinne zwischen den Spalten */
    return [[A.x + A.b, am], [gx, am], [gx, bm], [B.x, bm]];
  }
  function d(punkte) {
    return punkte.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
  }

  function aufbauen(huelle) {
    var daten = window.KLASSIFIZIERER;
    var z = huelle._kl = {
      pruefung: new Pruefung(daten),
      faelle: (huelle.getAttribute('data-faelle') || '').split(/\s+/).filter(Boolean),
      knoten: {},
      laufend: null,
      erledigt: [],      /* frühere Fälle dieser Folie: [{ name, hauptklasse }] */
      frei: false
    };
    huelle.setAttribute('role', 'group');
    huelle.setAttribute('aria-label', 'Klassifizierer: vereinfachter Entscheidungsbaum zum EU AI Act');

    var baum = el('div', { class: 'kl-baum' }, null, huelle);
    var linien = sv('svg', { class: 'kl-linien', viewBox: '0 0 1680 500', 'aria-hidden': 'true' }, baum);
    z.netz = sv('g', { class: 'kl-netz' }, linien);
    z.spur = sv('g', { class: 'kl-spur' }, linien);
    z.marke = sv('circle', { class: 'kl-marke', r: 11, cx: -40, cy: -40 }, linien);

    /* Spaltenköpfe */
    daten.spalten.forEach(function (sp) {
      var kopf = el('div', { class: 'kl-kopf', 'data-klasse': sp.klasse, style: 'left:' + ((sp.nr - 1) * SPALTE_B + (SPALTE_B - KNOTEN_B) / 2) + 'px' }, null, baum);
      form(sp.klasse, kopf);
      el('span', null, sp.name, kopf);
      if (sp.nr < 5) el('span', { class: 'kl-kopf-pfeil', 'aria-hidden': 'true' }, '→', kopf);
    });

    /* Ruhendes Netz: alle möglichen Verbindungen dünn */
    var verbunden = {};
    daten.knoten.forEach(function (k) {
      k.antworten.forEach(function (a) {
        var ziele = [];
        if (a.weiter) ziele.push(a.weiter);
        if (a.weitere_pruefung) ziele = ziele.concat(a.weitere_pruefung);
        if (a.ergebnis) {
          var e = daten.ergebnisse.filter(function (x) { return x.id === a.ergebnis; })[0];
          if (e && e.weitere_pruefung) ziele = ziele.concat(e.weitere_pruefung);
          if (a.ergebnis === 'E-MINIMAL') ziele.push('ENDE');
        }
        ziele.forEach(function (ziel) {
          var schl = k.id + '>' + ziel;
          if (verbunden[schl]) return;
          verbunden[schl] = true;
          sv('path', { d: d(weg(k.id, ziel)) }, z.netz);
        });
      });
    });

    /* Knoten */
    daten.knoten.forEach(function (k) {
      var l = lage(k.id);
      var n = el('div', { class: 'kl-knoten', 'data-id': k.id, style: 'left:' + l.x + 'px;top:' + l.y + 'px' }, null, baum);
      el('span', { class: 'kl-k-text', 'data-meta': '' }, k.kurz, n);   /* Beschriftung im Diagramm */
      el('span', { class: 'kl-k-antwort', 'aria-hidden': 'true', 'data-ueberlauf-ok': '' }, null, n);
      el('span', { class: 'kl-k-treffer', 'aria-hidden': 'true', 'data-ueberlauf-ok': '' }, null, n);
      z.knoten[k.id] = n;
    });
    /* Endpunkt „sonst minimal“ */
    var le = lage('ENDE');
    var ende = el('div', { class: 'kl-knoten kl-ende', 'data-id': 'ENDE', 'data-klasse': 'minimal', style: 'left:' + le.x + 'px;top:' + le.y + 'px' }, null, baum);
    form('minimal', ende);
    el('span', { class: 'kl-k-text' }, 'Sonst: minimales Risiko', ende);
    z.knoten.ENDE = ende;

    /* Feld unter dem Baum */
    var feld = z.feld = el('div', { class: 'kl-feld', 'aria-live': 'polite' }, null, huelle);
    z.feldInhalt = el('div', { class: 'kl-feld-inhalt' }, null, feld);
    var steuer = el('div', { class: 'kl-steuer' }, null, feld);
    if (huelle.hasAttribute('data-frei')) {
      z.knopfFrei = el('button', { type: 'button', class: 'kl-knopf kl-knopf--frei' }, 'Eigener Fall', steuer);
      z.knopfJa = el('button', { type: 'button', class: 'kl-knopf kl-knopf--ja', hidden: '' }, 'Ja', steuer);
      z.knopfNein = el('button', { type: 'button', class: 'kl-knopf kl-knopf--nein', hidden: '' }, 'Nein', steuer);
      z.knopfZurueck = el('button', { type: 'button', class: 'kl-knopf kl-knopf--zurueck', hidden: '', title: 'Letzte Antwort zurücknehmen' }, '↶', steuer);
      [z.knopfFrei, z.knopfJa, z.knopfNein, z.knopfZurueck].forEach(function (b) {
        ['pointerdown', 'mousedown', 'touchstart', 'keydown'].forEach(function (typ) {
          b.addEventListener(typ, function (ev) { ev.stopPropagation(); }, { passive: true });
        });
      });
      z.knopfFrei.addEventListener('click', function (ev) { ev.stopPropagation(); freiStarten(huelle); });
      z.knopfJa.addEventListener('click', function (ev) { ev.stopPropagation(); freiAntworten(huelle, 'Ja'); });
      z.knopfNein.addEventListener('click', function (ev) { ev.stopPropagation(); freiAntworten(huelle, 'Nein'); });
      z.knopfZurueck.addEventListener('click', function (ev) { ev.stopPropagation(); freiZurueck(huelle); });
    }

    var f = Deck.util.folieFuerElement(huelle);
    if (f && z.faelle.length) Deck.util.mindestSchritte(huelle.closest('section.folie'), z.faelle.length);
    leeren(huelle);
    feldStart(huelle, 0);
  }

  /* ---------- Zustände zeichnen ---------- */
  function leeren(huelle) {
    var z = huelle._kl;
    if (z.laufend) { z.laufend.abbrechen = true; z.laufend = null; }
    while (z.spur.firstChild) z.spur.removeChild(z.spur.firstChild);
    z.marke.setAttribute('cx', -40); z.marke.setAttribute('cy', -40);
    huelle.classList.remove('ist-gelaufen', 'ist-laeuft');
    Object.keys(z.knoten).forEach(function (id) {
      var n = z.knoten[id];
      n.classList.remove('ist-besucht', 'ist-aktiv', 'ist-ja', 'ist-nein', 'ist-treffer', 'ist-ziel');
      n.removeAttribute('data-klasse-treffer');
      var a = n.querySelector('.kl-k-antwort'); if (a) a.textContent = '';
      var t = n.querySelector('.kl-k-treffer'); if (t) t.textContent = '';
    });
  }

  function knotenMarkieren(huelle, schritt) {
    var z = huelle._kl;
    var n = z.knoten[schritt.id];
    if (!n) return;
    n.classList.add('ist-besucht', schritt.antwort === 'Ja' ? 'ist-ja' : 'ist-nein');
    n.querySelector('.kl-k-antwort').textContent = schritt.antwort;
    if (schritt.ergebnis) {
      var e = z.pruefung.ergebnisse[schritt.ergebnis];
      if (e && !e.nurWennNichtsAnderes) {
        n.classList.add('ist-treffer');
        var t = n.querySelector('.kl-k-treffer');
        t.textContent = '';
        form(e.klasse, t);
      }
    }
  }

  function aktivSetzen(huelle, id) {
    var z = huelle._kl;
    Object.keys(z.knoten).forEach(function (k) { z.knoten[k].classList.toggle('ist-aktiv', k === id); });
  }

  /* Weg als Pfad in die Spur; liefert das Element */
  function spurSegment(huelle, von, nach) {
    var z = huelle._kl;
    return sv('path', { d: d(weg(von, nach)) }, z.spur);
  }

  function feldStart(huelle, n) {
    var z = huelle._kl;
    var inhalt = z.feldInhalt;
    inhalt.textContent = '';
    huelle.classList.remove('ist-ergebnis');
    var name = z.faelle[n] && window.KLASSIFIZIERER.faelle[z.faelle[n]];
    var zeile = el('p', { class: 'kl-feld-fall' }, null, inhalt);
    if (name) {
      el('span', { class: 'kl-feld-marke', 'data-meta': '' }, 'Fall', zeile);
      el('b', null, name.name, zeile);
    } else {
      el('span', { class: 'kl-feld-marke', 'data-meta': '' }, 'Prüfpfad', zeile);
      el('b', null, '16 Ja/Nein-Fragen in fünf Prüfstufen', zeile);
    }
    var leg = el('span', { class: 'kl-legende', 'data-meta': '' }, null, zeile);
    el('i', { class: 'ja', 'aria-hidden': 'true' }, null, leg);
    leg.appendChild(document.createTextNode('Ja'));
    el('i', { class: 'nein', 'aria-hidden': 'true' }, null, leg);
    leg.appendChild(document.createTextNode('Nein'));
    erledigteZeigen(huelle);
  }

  function erledigteZeigen(huelle) {
    var z = huelle._kl;
    if (!z.erledigt.length) return;
    var p = el('p', { class: 'kl-feld-vorher', 'data-meta': '' }, null, z.feldInhalt);
    z.erledigt.forEach(function (x, i) {
      if (i) el('span', { class: 'kl-trenner', 'aria-hidden': 'true' }, '·', p);
      el('span', null, x.name + ': ', p);
      var et = el('span', { class: 'k-etikett', 'data-klasse': x.klasse }, null, p);
      form(x.klasse, et);
      et.appendChild(document.createTextNode(KLASSEN_NAME[x.klasse] || x.klasse));
    });
  }

  function feldFrage(huelle, id) {
    var z = huelle._kl;
    var k = z.pruefung.knoten[id];
    if (!k) return;
    var inhalt = z.feldInhalt;
    inhalt.textContent = '';
    huelle.classList.remove('ist-ergebnis');
    var kopf = el('p', { class: 'kl-feld-frage' }, null, inhalt);
    el('b', null, k.kurz, kopf);
    k.rechtsgrundlage.forEach(function (r) { el('span', { class: 'k-stempel k-stempel--klein', 'data-meta': '' }, r, kopf); });
    el('p', { class: 'kl-feld-text' }, z.frei ? k.frage : k.erklaerung, inhalt);
  }

  /* Antwort der laufenden Frage im Feld zeigen */
  function feldAntwort(huelle, text) {
    var kopf = huelle._kl.feldInhalt.querySelector('.kl-feld-frage');
    if (!kopf) return;
    el('span', { class: 'k-antwort ' + (text === 'Ja' ? 'k-antwort--ja' : 'k-antwort--nein') }, text, kopf);
  }

  function feldErgebnis(huelle, fallId) {
    var z = huelle._kl;
    var fall = fallId ? window.KLASSIFIZIERER.faelle[fallId] : null;
    var treffer = z.pruefung.treffer();
    var inhalt = z.feldInhalt;
    inhalt.textContent = '';
    huelle.classList.add('ist-ergebnis');
    erledigteZeigen(huelle);

    var links = el('div', { class: 'kl-erg-links' }, null, inhalt);
    var reihe = el('p', { class: 'kl-erg-klassen' }, null, links);
    treffer.forEach(function (e) {
      var et = el('span', { class: 'k-etikett k-etikett--voll', 'data-klasse': e.klasse }, null, reihe);
      form(e.klasse, et);
      et.appendChild(document.createTextNode(e.kurz || KLASSEN_NAME[e.klasse]));
    });
    if (fall && fall.rolle && fall.rolle !== '–') el('span', { class: 'kl-erg-rolle' }, 'Rolle: ' + fall.rolle, reihe);
    if (fall && fall.merksatz) el('p', { class: 'kl-erg-merksatz' }, fall.merksatz, links);
    else if (treffer[0]) el('p', { class: 'kl-erg-merksatz' }, treffer[0].satz, links);

    /* Pflichten: nur feste (ohne „optional“), Art. 4 zuletzt, je Artikel einmal;
       wer nur Betreiber ist, sieht keine Anbieterpflichten; höchstens drei */
    var pflichten = [];
    treffer.forEach(function (e) { (e.pflichten || []).forEach(function (p) { if (!p.optional) pflichten.push(p); }); });
    pflichten.sort(function (x, y) { return (x.nebensache ? 1 : 0) - (y.nebensache ? 1 : 0); });
    var gesehen = {};
    pflichten = pflichten.filter(function (p) { var k = p.kurz || p.text; if (gesehen[k]) return false; gesehen[k] = true; return true; });
    if (fall && fall.rolle && /Betreiber/.test(fall.rolle) && !/Anbieter/.test(fall.rolle)) {
      pflichten = pflichten.filter(function (p) { return !/^Anbieter/.test(p.text); });
    }
    var liste = el('ul', { class: 'kl-erg-pflichten' }, null, inhalt);
    pflichten.slice(0, 3).forEach(function (p) {
      var li = el('li', null, null, liste);
      el('span', { class: 'kl-erg-pflicht' }, p.kurz || p.text, li);
      el('span', { class: 'k-stempel k-stempel--klein', 'data-meta': '' }, p.art || p.artikel, li);
      el('span', { class: 'kl-erg-ab', 'data-meta': '' }, p.ab ? 'ab ' + datum(p.ab) : '', li);
    });
    if (!pflichten.length) el('li', { class: 'kl-erg-keine' }, 'Keine Pflichten aus dem AI Act', liste);
  }

  /* ---------- Fall abspielen ---------- */
  function fallSpielen(huelle, n, sofort) {
    var z = huelle._kl;
    var fallId = z.faelle[n - 1];
    var fall = window.KLASSIFIZIERER.faelle[fallId];
    if (!fall) return;
    leeren(huelle);
    z.frei = false;
    freiKnoepfe(huelle, false);
    var schritte = z.pruefung.spiele(fall.antworten);
    var mitMinimal = z.pruefung.liste.indexOf('E-MINIMAL') >= 0 && z.pruefung.treffer().length === 1 && z.pruefung.treffer()[0].id === 'E-MINIMAL';
    var ziele = schritte.map(function (s, i) { return schritte[i + 1] ? schritte[i + 1].id : (mitMinimal ? 'ENDE' : null); });

    var reduziert = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wurzel = document.documentElement.classList;
    if (sofort || reduziert || wurzel.contains('druckmodus') || wurzel.contains('aufnahme')) {
      schritte.forEach(function (s, i) {
        knotenMarkieren(huelle, s);
        if (ziele[i]) spurSegment(huelle, s.id, ziele[i]);
      });
      if (mitMinimal) z.knoten.ENDE.classList.add('ist-besucht', 'ist-ziel');
      var letzter = mitMinimal ? 'ENDE' : schritte[schritte.length - 1].id;
      markeAuf(huelle, letzter);
      huelle.classList.add('ist-gelaufen');
      feldErgebnis(huelle, fallId);
      return;
    }

    var lauf = z.laufend = { abbrechen: false };
    huelle.classList.add('ist-laeuft');
    var i = 0;
    function naechster() {
      if (lauf.abbrechen) return;
      if (i >= schritte.length) {
        if (mitMinimal) { z.knoten.ENDE.classList.add('ist-besucht', 'ist-ziel'); }
        aktivSetzen(huelle, null);
        huelle.classList.remove('ist-laeuft');
        huelle.classList.add('ist-gelaufen');
        feldErgebnis(huelle, fallId);
        z.laufend = null;
        return;
      }
      var s = schritte[i];
      aktivSetzen(huelle, s.id);
      feldFrage(huelle, s.id);
      markeAuf(huelle, s.id);
      setTimeout(function () {
        if (lauf.abbrechen) return;
        knotenMarkieren(huelle, s);
        feldAntwort(huelle, s.antwort);
        var ziel = ziele[i];
        var halt = s.ergebnis && !z.pruefung.ergebnisse[s.ergebnis].nurWennNichtsAnderes ? HALT : 0;
        setTimeout(function () {
          if (lauf.abbrechen) return;
          if (ziel) {
            var pfad = spurSegment(huelle, s.id, ziel);
            zeichnen(huelle, pfad, TEMPO * 0.55, function () { i++; naechster(); });
          } else { i++; naechster(); }
        }, halt);
      }, TEMPO * 0.45);
    }
    naechster();
  }

  /* Pfad zeichnen und die Marke mitführen */
  function zeichnen(huelle, pfad, dauer, fertig) {
    var z = huelle._kl;
    var L = 0;
    try { L = pfad.getTotalLength(); } catch (e) { L = 0; }
    if (!L) { fertig(); return; }
    pfad.style.strokeDasharray = L + ' ' + L;
    pfad.style.strokeDashoffset = L;
    var start = null;
    var lauf = z.laufend;
    function bild(t) {
      if (lauf && lauf.abbrechen) return;
      if (start === null) start = t;
      var q = Math.min(1, (t - start) / dauer);
      var e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
      pfad.style.strokeDashoffset = L * (1 - e);
      var p = pfad.getPointAtLength(L * e);
      z.marke.setAttribute('cx', p.x); z.marke.setAttribute('cy', p.y);
      if (q < 1) requestAnimationFrame(bild);
      else { pfad.style.strokeDasharray = ''; pfad.style.strokeDashoffset = ''; fertig(); }
    }
    requestAnimationFrame(bild);
  }

  function markeAuf(huelle, id) {
    var z = huelle._kl;
    var l = lage(id);
    if (!l) return;
    z.marke.setAttribute('cx', l.x + 4);
    z.marke.setAttribute('cy', l.y + l.h / 2);
  }

  /* ---------- Freier Modus ---------- */
  function freiKnoepfe(huelle, an) {
    var z = huelle._kl;
    if (!z.knopfJa) return;
    z.knopfJa.hidden = !an; z.knopfNein.hidden = !an; z.knopfZurueck.hidden = !an;
    z.knopfFrei.textContent = an ? 'Neu' : 'Eigener Fall';
  }
  function freiStarten(huelle) {
    var z = huelle._kl;
    leeren(huelle);
    z.frei = true;
    z.pruefung.neu();
    freiKnoepfe(huelle, true);
    aktivSetzen(huelle, z.pruefung.aktuell);
    markeAuf(huelle, z.pruefung.aktuell);
    feldFrage(huelle, z.pruefung.aktuell);
  }
  function freiAntworten(huelle, text) {
    var z = huelle._kl;
    if (!z.frei || !z.pruefung.aktuell) return;
    var s = z.pruefung.antworte(text);
    if (!s) return;
    knotenMarkieren(huelle, s);
    var ziel = z.pruefung.aktuell;
    var nurMinimal = !ziel && s.ergebnis === 'E-MINIMAL' && z.pruefung.treffer().length === 1;
    if (ziel || nurMinimal) {
      var p = spurSegment(huelle, s.id, ziel || 'ENDE');
      zeichnen(huelle, p, 300, function () {});
    }
    if (ziel) {
      aktivSetzen(huelle, ziel);
      feldFrage(huelle, ziel);
    } else {
      if (nurMinimal) z.knoten.ENDE.classList.add('ist-besucht', 'ist-ziel');
      aktivSetzen(huelle, null);
      huelle.classList.add('ist-gelaufen');
      feldErgebnis(huelle, null);
      z.knopfJa.hidden = true; z.knopfNein.hidden = true;
    }
  }
  function freiZurueck(huelle) {
    var z = huelle._kl;
    if (!z.frei || !z.pruefung.pfad.length) return;
    var pfad = z.pruefung.pfad.slice(0, -1).map(function (s) { return s.antwort; });
    freiStarten(huelle);
    pfad.forEach(function (a) {
      var s = z.pruefung.antworte(a);
      knotenMarkieren(huelle, s);
      if (z.pruefung.aktuell) spurSegment(huelle, s.id, z.pruefung.aktuell);
    });
    aktivSetzen(huelle, z.pruefung.aktuell);
    markeAuf(huelle, z.pruefung.aktuell);
    feldFrage(huelle, z.pruefung.aktuell);
  }

  /* ---------- Schritte der Folie ---------- */
  function zuSchritt(huelle, n, sofort) {
    var z = huelle._kl;
    var anzahl = z.faelle.length;
    n = Math.max(0, Math.min(n, anzahl));
    z.erledigt = [];
    for (var i = 1; i < n; i++) {
      var p = new Pruefung(window.KLASSIFIZIERER);
      var fall = window.KLASSIFIZIERER.faelle[z.faelle[i - 1]];
      p.spiele(fall.antworten);
      var h = p.hauptklasse();
      z.erledigt.push({ name: fall.name, klasse: h ? h.klasse : 'kein' });
    }
    if (n === 0) {
      leeren(huelle);
      z.frei = false;
      freiKnoepfe(huelle, false);
      feldStart(huelle, 0);
      return;
    }
    fallSpielen(huelle, n, sofort);
  }

  Deck.baustein('klassifizierer', {
    selektor: '.klassifizierer',
    aufbauen: function (huelle) { aufbauen(huelle); },
    betreten: function (huelle, ctx, n) { zuSchritt(huelle, n, true); },
    schritt: function (huelle, ctx, n, richtung) {
      if (richtung === 'start') return;
      zuSchritt(huelle, n, richtung !== 'vor');
    },
    verlassen: function (huelle) {
      var z = huelle._kl;
      if (z && z.laufend) { z.laufend.abbrechen = true; z.laufend = null; }
    },
    druck: function (huelle) {
      var z = huelle._kl;
      if (z && z.faelle.length) zuSchritt(huelle, z.faelle.length, true);
    }
  });
})();
