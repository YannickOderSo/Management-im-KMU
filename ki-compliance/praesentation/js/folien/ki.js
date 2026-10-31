/* =============================================================================
   ki.js – Verhalten des Fundaments „Prüfpfad“ (css/folien/ki.css)
   -----------------------------------------------------------------------------
   1. LAUFLEISTE „PRÜFPFAD“
      Jede Folie mit data-station="1…4" (oder "alle") bekommt beim Laden eine
      Kopfzeile <div class="laufkopf k-laufkopf">: Titel links, vier Stationen
      des Prüfpfads in der Mitte (erledigt = gefüllt, aktuell = Ring mit Kern),
      Foliennummer rechts. Die Engine übernimmt eine vorhandene .laufkopf, die
      Leiste steht damit fest im DOM (Druck, Übersicht, Referentenansicht).
   2. UMFRAGE: Die Engine schreibt an die richtige Antwort „Unsere Analyse“.
      Hier heißt sie „Auflösung“ (nach dem Aufbau umbenannt).
   ============================================================================= */
(function () {
  'use strict';
  var Deck = window.Deck;
  if (!Deck || !Deck.util) return;
  var util = Deck.util;

  var STATIONEN = ['Grundlagen', 'Risikoklassen', 'Selbst prüfen', 'KMU-Praxis'];

  function zweistellig(n) { return (n < 10 ? '0' : '') + n; }
  function nummerVon(folie) {
    if (folie.hasAttribute('data-nummer')) return folie.getAttribute('data-nummer');
    var m = /^[a-z]{1,2}(\d+)([a-z]*)$/i.exec(folie.id || '');
    return m ? zweistellig(Number(m[1])) + m[2] : '';
  }

  function laufleisteBauen(folie) {
    if (folie.querySelector(':scope > .laufkopf')) return;
    var station = (folie.getAttribute('data-station') || '').trim();
    var alle = station === 'alle';
    var aktuell = alle ? STATIONEN.length + 1 : Number(station);
    if (!alle && !(aktuell >= 1 && aktuell <= STATIONEN.length)) return;

    /* data-morph: die Leiste bleibt beim Folienwechsel stehen (View Transition) */
    var kopf = util.element('div', { class: 'laufkopf k-laufkopf', 'data-morph': 'laufleiste' });
    util.element('span', { class: 'k-lauf-titel' }, 'KI-Compliance im KMU', kopf);
    var pfad = util.element('div', {
      class: 'k-lauf-pfad',
      role: 'img',
      style: '--k-fortschritt:' + (alle ? 100 : (aktuell - 1) * 25) + '%',
      'aria-label': alle ? 'Prüfpfad abgeschlossen' : 'Station ' + aktuell + ' von 4: ' + STATIONEN[aktuell - 1]
    }, null, kopf);
    STATIONEN.forEach(function (name, i) {
      var n = i + 1;
      var zustand = n < aktuell ? ' ist-erledigt' : (n === aktuell ? ' ist-aktuell' : ' ist-kommend');
      var st = util.element('span', { class: 'k-lauf-station' + zustand, 'aria-hidden': 'true' }, null, pfad);
      util.element('span', { class: 'k-lauf-punkt' }, null, st);
      util.element('span', { class: 'k-lauf-name' }, name, st);
    });
    var nummer = nummerVon(folie);
    util.element('span', { class: 'k-lauf-nummer' }, nummer, kopf);
    folie.insertBefore(kopf, folie.firstChild);
  }

  util.alle('.buehne > section.folie[data-station]').forEach(function (folie) {
    if (folie.getAttribute('data-laufkopf') === 'aus') return;
    laufleisteBauen(folie);
  });

  /* ---------------------------------------------------------------------------
     3. WIMMELBILD: Punkte 1–6 in jedes <svg class="k-wimmel">
        data-punkte="1 2 3"             welche Punkte
        data-klassen="1:minimal@1 4:verboten"  Klasse je Punkt, optional ab
                                         Schritt n (data-animation="zustand")
        data-puls                         graue Punkte pulsieren nacheinander
     --------------------------------------------------------------------------- */
  var PUNKTE = {
    1: [281, 128], 2: [253, 37], 3: [400, 199], 4: [206, 173], 5: [654, 323], 6: [565, 239]
  };
  var FORM = { verboten: 's-verboten', hoch: 's-hoch', transparenz: 's-transparenz', minimal: 's-minimal', gpai: 's-gpai' };
  util.alle('svg.k-wimmel').forEach(function (bild) {
    var klassen = {};
    (bild.getAttribute('data-klassen') || '').split(/\s+/).filter(Boolean).forEach(function (eintrag) {
      var m = /^(\d):([a-z]+)(?:@(\d+))?$/.exec(eintrag);
      if (m) klassen[m[1]] = { klasse: m[2], schritt: m[3] || null };
    });
    var puls = bild.hasAttribute('data-puls');
    (bild.getAttribute('data-punkte') || '').split(/\s+/).filter(Boolean).forEach(function (nr, i) {
      var p = PUNKTE[nr];
      if (!p) return;
      var k = klassen[nr];
      var g = util.svg('g', {
        class: 'w-punkt' + (puls ? ' w-punkt--puls k-endlos' : ''),
        'aria-hidden': 'true',                      /* das Bild hat ein eigenes aria-label */
        transform: 'translate(' + p[0] + ' ' + p[1] + ')',
        style: puls ? 'animation-delay:' + (i * 0.35) + 's' : null,
        'data-klasse': k ? k.klasse : null,
        'data-schritt': k && k.schritt ? k.schritt : null,
        'data-animation': k && k.schritt ? 'zustand' : null
      }, bild);
      util.svg('circle', { class: 'w-ring', r: 30 }, g);
      if (k) {
        var gr = k.klasse === 'hoch' ? 84 : 66;
        util.svg('use', { class: 'w-form', href: '#' + FORM[k.klasse], x: -gr / 2, y: k.klasse === 'hoch' ? -gr / 2 - 8 : -gr / 2, width: gr, height: gr }, g);
      }
      var t = util.svg('text', { class: 'w-zahl', y: k && k.klasse === 'hoch' ? 12 : 1 }, g);
      t.textContent = nr;
    });
  });

  /* ---------------------------------------------------------------------------
     5. BAUSTEIN .bussgeldrechner (Folie 29)
        Umsatz per Knopf (2/10/50 Mio. €) oder Regler (1–50 Mio. €). Je
        Stufe zwei Balken: KMU (niedrigerer Betrag, Art. 99 Abs. 6) und ohne
        KMU-Regel (höherer Betrag). Skala: 35 Mio. € = volle Breite.
        Klicks und Tasten im Rechner wechseln die Folie nicht.
     --------------------------------------------------------------------------- */
  var STUFEN = [
    { name: 'Verbote', fest: 35, anteil: 0.07, klasse: 'verboten', zeile: '35 Mio. € oder 7 %' },
    { name: 'Hochrisiko-, Transparenzpflichten', fest: 15, anteil: 0.03, klasse: 'hoch', zeile: '15 Mio. € oder 3 %' },
    { name: 'falsche Auskünfte', fest: 7.5, anteil: 0.01, klasse: 'kein', zeile: '7,5 Mio. € oder 1 %' }
  ];
  function euro(mio) {
    var f = new Intl.NumberFormat('de-DE', { maximumFractionDigits: mio < 1 ? 0 : 2 });
    return mio < 1 ? f.format(Math.round(mio * 1e6)) + ' €' : f.format(mio) + ' Mio. €';
  }
  function abschirmen(knoten) {
    ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'keyup', 'wheel', 'click'].forEach(function (typ) {
      knoten.addEventListener(typ, function (ev) { ev.stopPropagation(); }, { passive: true });
    });
  }
  Deck.baustein('bussgeldrechner', {
    selektor: '.bussgeldrechner',
    aufbauen: function (h) {
      var u0 = Number(h.getAttribute('data-umsatz')) || 10;
      var steuer = util.element('div', { class: 'br-steuer' }, null, h);
      var anzeige = util.element('p', { class: 'br-umsatz' }, null, steuer);
      util.element('span', { class: 'br-label' }, 'Jahresumsatz', anzeige);
      var wert = util.element('span', { class: 'br-wert k-zahl' }, null, anzeige);
      var knoepfe = util.element('div', { class: 'br-knoepfe' }, null, steuer);
      var regler = util.element('input', { type: 'range', min: '1', max: '50', step: '1', value: String(u0), class: 'br-regler', 'aria-label': 'Jahresumsatz in Millionen Euro' }, null, steuer);
      var tab = util.element('div', { class: 'br-tabelle' }, null, h);
      var kopf = util.element('p', { class: 'br-legende' }, null, tab);
      var l1 = util.element('span', { class: 'br-leg br-leg--kmu' }, null, kopf); util.element('i', null, null, l1); l1.appendChild(document.createTextNode('KMU: niedrigerer Betrag'));
      var l2 = util.element('span', { class: 'br-leg br-leg--gross' }, null, kopf); util.element('i', null, null, l2); l2.appendChild(document.createTextNode('ohne KMU-Regel: höherer Betrag'));
      var zeilen = STUFEN.map(function (st) {
        var z = util.element('div', { class: 'br-zeile', 'data-klasse': st.klasse }, null, tab);
        var n = util.element('p', { class: 'br-name' }, null, z);
        util.element('b', null, st.name, n);
        util.element('span', { class: 'br-formel', 'data-meta': '' }, st.zeile, n);
        var b1 = util.element('div', { class: 'br-balken br-balken--kmu' }, null, z);
        var f1 = util.element('span', { class: 'br-fuellung' }, null, b1);
        var w1 = util.element('span', { class: 'br-betrag' }, null, b1);
        var b2 = util.element('div', { class: 'br-balken br-balken--gross' }, null, z);
        var f2 = util.element('span', { class: 'br-fuellung' }, null, b2);
        var w2 = util.element('span', { class: 'br-betrag' }, null, b2);
        return { st: st, f1: f1, w1: w1, f2: f2, w2: w2 };
      });
      /* Beträge rollen mit GSAP zum neuen Wert (ohne GSAP, bei reduzierter
         Bewegung, im Druck und im Prüfmodus sofort) */
      function rollen(el, mio) {
        var alt = el._mio;
        el._mio = mio;
        if (el._rolle) { el._rolle.kill(); el._rolle = null; }
        var html = document.documentElement;
        if (alt === undefined || alt === mio || !window.gsap || util.bewegungReduziert() ||
            html.classList.contains('testmodus') || html.classList.contains('druckmodus') || html.classList.contains('aufnahme')) {
          el.textContent = euro(mio);
          return;
        }
        var zahl = { v: alt };
        el._rolle = window.gsap.to(zahl, {
          v: mio, duration: 0.7, ease: 'power2.out',
          onUpdate: function () { el.textContent = euro(zahl.v); },
          onComplete: function () { el.textContent = euro(mio); }
        });
      }
      function setzen(u) {
        u = Math.max(1, Math.min(50, Math.round(u)));
        regler.value = String(u);
        rollen(wert, u);
        util.alle('button', knoepfe).forEach(function (b) { b.classList.toggle('ist-aktiv', Number(b.getAttribute('data-u')) === u); });
        zeilen.forEach(function (z) {
          var anteil = z.st.anteil * u;
          var kmu = Math.min(z.st.fest, anteil), gross = Math.max(z.st.fest, anteil);
          z.f1.style.width = Math.max(0.6, kmu / 35 * 100) + '%';
          z.f2.style.width = Math.max(0.6, gross / 35 * 100) + '%';
          rollen(z.w1, kmu);
          rollen(z.w2, gross);
        });
      }
      [2, 10, 50].forEach(function (u) {
        var b = util.element('button', { type: 'button', class: 'br-knopf', 'data-u': String(u) }, euro(u), knoepfe);
        b.addEventListener('click', function () { setzen(u); });
      });
      regler.addEventListener('input', function () { setzen(Number(regler.value)); });
      abschirmen(steuer);
      setzen(u0);
      h._setzen = setzen;
      h._start = u0;
    },
    verlassen: function (h) { if (h._setzen) h._setzen(h._start); },
    druck: function (h) { if (h._setzen) h._setzen(h._start); }
  });

  /* ---------------------------------------------------------------------------
     6. BAUSTEIN .k-uhr (Countdown, Folie 24)
        data-sekunden="180" data-start="1": Schritt 1 startet die Uhr; Klick
        auf die Uhr hält an bzw. setzt fort. Beim Verlassen zurückgesetzt.
     --------------------------------------------------------------------------- */
  function mmss(sek) { sek = Math.max(0, Math.ceil(sek)); return Math.floor(sek / 60) + ':' + (sek % 60 < 10 ? '0' : '') + (sek % 60); }
  Deck.baustein('k-uhr', {
    selektor: '.k-uhr',
    aufbauen: function (h) {
      h._dauer = Number(h.getAttribute('data-sekunden')) || 180;
      h._ab = Number(h.getAttribute('data-start')) || 1;
      h._rest = h._dauer;
      h._zeit = h.querySelector('.k-uhr-zeit');
      h._text = h.querySelector('.k-uhr-text');
      var folie = h.closest('section.folie');
      if (folie) util.mindestSchritte(folie, h._ab);
      h.setAttribute('role', 'timer');
      h.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (h._lauf) anhalten(h, 'angehalten, Klick setzt fort'); else if (h._rest > 0) starten(h);
      });
      abschirmen(h);
      zuruecksetzen(h);
    },
    schritt: function (h, ctx, n, richtung) {
      var wurzel = document.documentElement.classList;
      if (wurzel.contains('aufnahme') || wurzel.contains('druckmodus')) return;
      if (n >= h._ab && richtung === 'vor' && !h._lauf && h._rest === h._dauer) starten(h);
      if (n < h._ab) zuruecksetzen(h);
    },
    verlassen: function (h) { zuruecksetzen(h); },
    druck: function (h) { zuruecksetzen(h); }
  });
  function zeigen(h) { h._zeit.textContent = mmss(h._rest); }
  function zuruecksetzen(h) {
    if (h._lauf) { clearInterval(h._lauf); h._lauf = null; }
    h._rest = h._dauer;
    h.classList.remove('ist-laeuft', 'ist-ende');
    h._text.textContent = 'Klick startet die Uhr';
    zeigen(h);
  }
  function anhalten(h, text) {
    if (h._lauf) { clearInterval(h._lauf); h._lauf = null; }
    h.classList.remove('ist-laeuft');
    h._text.textContent = text;
  }
  function starten(h) {
    var ende = Date.now() + h._rest * 1000;
    h.classList.add('ist-laeuft');
    h._text.textContent = 'läuft';
    h._lauf = setInterval(function () {
      h._rest = (ende - Date.now()) / 1000;
      if (h._rest <= 0) { h._rest = 0; anhalten(h, 'Zeit ist um'); h.classList.add('ist-ende'); }
      zeigen(h);
    }, 250);
  }

  /* 4. Artikel-Stempel sind Belege (Metaangaben wie die Quelle) */
  util.alle('.k-stempel').forEach(function (st) { st.setAttribute('data-meta', ''); });

  /* 2. „Unsere Analyse“ → „Auflösung“; Antworten der Umfragen bekommen
     die Form ihrer Klasse */
  var KLASSE_VON = { verboten: 'verboten', hochriskant: 'hoch', transparenz: 'transparenz', minimal: 'minimal' };
  document.addEventListener('deck:bereit', function () {
    util.alle('.umfrage-marke').forEach(function (m) { m.textContent = 'Auflösung'; });
    util.alle('.umfrage .umfrage-name').forEach(function (name) {
      var k = KLASSE_VON[(name.textContent || '').trim().toLowerCase()];
      if (!k || name.querySelector('.k-form')) return;
      var s = util.svg('svg', { class: 'k-form umfrage-form', viewBox: '0 0 24 24', 'aria-hidden': 'true', 'data-klasse': k });
      util.svg('use', { href: '#' + FORM[k] }, s);
      name.insertBefore(s, name.firstChild);
    });
  });
})();
