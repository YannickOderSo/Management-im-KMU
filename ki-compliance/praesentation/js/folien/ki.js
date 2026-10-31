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

    var kopf = util.element('div', { class: 'laufkopf k-laufkopf' });
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
    1: [172, 240], 2: [346, 54], 3: [326, 242], 4: [250, 418], 5: [612, 360], 6: [779, 282]
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
