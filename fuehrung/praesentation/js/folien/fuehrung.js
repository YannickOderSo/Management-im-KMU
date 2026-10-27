/* =============================================================================
   fuehrung.js – Verhalten der Folien „Führung im KMU“
   • Fahrplan-Leiste in der Kopfzeile (Folien mit data-station="1…4")
   • Folie 05/07: Bewegung per CSS über den Schritt-Auslöser (data-animation="zustand")
   • Folie 06: Waffeldiagramm (100 Felder) · Folie 12: 18 → 43 Personen
   • Folie 09: Marker „Sie“ aus der Live-Umfrage (Folie 08) und die zwei Befragten
   Druck/PDF zeigt jeweils den Endzustand.
   ============================================================================= */
(function () {
  'use strict';
  var util = Deck.util;

  /* ---------- Fahrplan-Leiste ---------- */
  var STATIONEN = ['Begriff', 'KMU', 'Besonderheiten', 'Praxis'];
  function leisteEinfuegen() {
    util.alle('section.folie[data-station]').forEach(function (folie) {
      var rechts = folie.querySelector(':scope > .laufkopf .laufkopf-rechts');
      if (!rechts || rechts.querySelector('.f-leiste')) return;
      var aktuell = Number(folie.getAttribute('data-station'));
      var leiste = util.element('span', { class: 'f-leiste', 'aria-label': 'Fahrplan: Teil ' + aktuell + ' von 4 – ' + STATIONEN[aktuell - 1] });
      STATIONEN.forEach(function (name, i) {
        var n = i + 1;
        util.element('span', {
          class: 'f-leiste-station' + (n < aktuell ? ' ist-erledigt' : '') + (n === aktuell ? ' ist-aktuell' : ''),
          'aria-hidden': 'true'
        }, name, leiste);
      });
      rechts.insertBefore(leiste, rechts.firstChild);
    });
  }
  if (Deck.bereit && Deck.bereit.then) Deck.bereit.then(leisteEinfuegen);
  document.addEventListener('deck:bereit', leisteEinfuegen);

  /* ---------- Folie 05 und 07: Endzustand im Druck ---------- */
  function zustandAn(ctx) {
    util.alle('[data-animation="zustand"]', ctx.folie).forEach(function (el) { el.classList.add('schritt-an'); });
  }
  ['f05', 'f07'].forEach(function (id) { Deck.registriere(id, { druck: zustandAn }); });

  /* ---------- Folie 06: Waffeldiagramm ---------- */
  Deck.registriere('f06', {
    einrichten: function (ctx) {
      util.alle('[data-waffel]', ctx.folie).forEach(function (box) {
        var wert = Number(box.getAttribute('data-waffel')) || 0;
        for (var i = 0; i < 100; i++) {
          var feld = util.element('span', null, null, box);
          feld.style.setProperty('--i', i);
          if (i + 1 <= Math.floor(wert)) feld.classList.add('ist-voll');
          else if (i < wert) { feld.classList.add('ist-teil'); feld.style.setProperty('--anteil', (wert - i).toFixed(2)); }
        }
      });
    }
  });

  /* ---------- Folie 12: 18 → 43 Personen ---------- */
  function personenBauen(box) {
    var teile = (box.getAttribute('data-personen') || '0/0').split('/');
    var alt = Number(teile[0]) || 0, neu = Number(teile[1]) || 0;
    for (var i = 0; i < neu; i++) {
      var s = util.svg('svg', { class: 'icon' + (i >= alt ? ' ist-neu' : ''), 'aria-hidden': 'true' }, box);
      util.svg('use', { href: '#i-person' }, s);
      if (i >= alt) s.style.setProperty('--i', i - alt);
    }
  }
  Deck.registriere('f12', {
    einrichten: function (ctx) { util.alle('[data-personen]', ctx.folie).forEach(personenBauen); },
    betreten: function (ctx) {
      var box = ctx.folie.querySelector('[data-personen]');
      if (!box) return;
      if (ctx.sofort || ctx.bewegungReduziert || ctx.richtung === 'zurueck') { box.classList.add('ist-gewachsen'); return; }
      box.classList.remove('ist-gewachsen');
      util.warte(450).then(function () { box.classList.add('ist-gewachsen'); });
    },
    verlassen: function (ctx) {
      var box = ctx.folie.querySelector('[data-personen]');
      if (box) box.classList.remove('ist-gewachsen');
    },
    druck: function (ctx) {
      var box = ctx.folie.querySelector('[data-personen]');
      if (box) box.classList.add('ist-gewachsen');
    },
    vorschau: function (ctx, klon) {
      var box = klon.querySelector('[data-personen]');
      if (box) box.classList.add('ist-gewachsen');
    }
  });

  /* ---------- Folie 09: Kontinuum mit Publikum und Befragten ---------- */
  var STUFEN = ['autoritär', 'patriarchalisch', 'informierend', 'beratend', 'kooperativ', 'delegativ', 'autonom'];

  function markerSetzen(marker, pos) {
    marker.style.setProperty('--pos', pos);
    marker.classList.toggle('ist-links', pos > 4.5);
  }

  /* Durchschnitt der Live-Umfrage auf der 7er-Skala. Gespeichert vom Baustein
     .umfrage (js/komponenten.js) unter „umfrage:fuehrung“ = { werte, beispiel, runde }.
     Probewerte einer anderen Runde zählen nicht; dann gelten die Beispielwerte. */
  function publikum(daten) {
    var konfig = (Deck.marke.umfragen || {}).fuehrung || {};
    var g = util.laden('umfrage:fuehrung', null);
    var werte = konfig.beispielwerte || [], beispiel = true;
    if (g && Array.isArray(g.werte) && g.runde === konfig.runde) { werte = g.werte; beispiel = !!g.beispiel; }
    var stufen = daten.publikumStufen || [1, 2.5, 4, 5, 6.5];
    var n = 0, summe = 0;
    werte.forEach(function (w, i) { w = Number(w) || 0; n += w; summe += w * (stufen[i] || 0); });
    return n ? { pos: summe / n, n: n, beispiel: beispiel } : null;
  }

  function publikumZeigen(ctx) {
    var marker = ctx.folie.querySelector('[data-publikum]');
    if (!marker) return;
    var p = publikum(ctx.daten || {});
    var text = marker.querySelector('[data-publikum-text]');
    marker.classList.toggle('ist-offen', !p);
    if (!p) { markerSetzen(marker, 1); text.textContent = 'noch keine Stimmen'; return; }
    markerSetzen(marker, p.pos);
    text.textContent = 'Ø ' + util.zahlFormat(p.pos, 1) + ' – eher ' + STUFEN[Math.min(6, Math.max(0, Math.round(p.pos) - 1))] +
      ' (n = ' + p.n + (p.beispiel ? ', Beispieldaten' : '') + ')';
  }

  Deck.registriere('f09', {
    einrichten: function (ctx) {
      var befragte = (ctx.daten && ctx.daten.befragte) || [];
      util.alle('[data-befragter]', ctx.folie).forEach(function (spur) {
        var b = befragte[Number(spur.getAttribute('data-befragter'))] || {};
        var marker = spur.querySelector('.f-stil-marker');
        var stufe = Number(b.stufe);
        spur.querySelector('[data-befragter-name]').textContent = b.anzeige || '';
        var text = spur.querySelector('[data-befragter-text]');
        if (b.stufe === null || b.stufe === undefined || !(stufe >= 1 && stufe <= 7)) {
          marker.classList.add('ist-offen');
          markerSetzen(marker, 1);
          text.textContent = '– Selbsteinschätzung folgt';
        } else {
          markerSetzen(marker, stufe);
          text.textContent = '– Stufe ' + util.zahlFormat(stufe, stufe % 1 ? 1 : 0) + ' (Selbsteinschätzung)';
        }
      });
      publikumZeigen(ctx);
    },
    betreten: publikumZeigen,
    druck: publikumZeigen,
    vorschau: function (ctx) { publikumZeigen(ctx); }
  });
})();
