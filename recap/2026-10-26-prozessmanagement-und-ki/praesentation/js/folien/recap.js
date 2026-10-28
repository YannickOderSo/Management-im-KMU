/* =============================================================================
   recap.js – Verhalten der Folien „Recap 26.10.2026“
   • Fahrplan-Leiste in der Kopfzeile (Folien mit data-station="1…4"),
     gleiches Muster wie js/folien/fuehrung.js im Führungs-Referat
   Alles Weitere (Schritte, Zählen, Zeichnen) erledigt die Engine.
   ============================================================================= */
(function () {
  'use strict';
  var util = Deck.util;

  /* ---------- Fahrplan-Leiste ---------- */
  var STATIONEN = ['Prozesse', 'KI im KMU', 'KI-Begriffe', 'Bundeswehr'];
  function leisteEinfuegen() {
    util.alle('section.folie[data-station]').forEach(function (folie) {
      var rechts = folie.querySelector(':scope > .laufkopf .laufkopf-rechts');
      if (!rechts || rechts.querySelector('.r-leiste')) return;
      var aktuell = Number(folie.getAttribute('data-station'));
      var leiste = util.element('span', { class: 'r-leiste', 'aria-label': 'Block ' + aktuell + ' von ' + STATIONEN.length + ' – ' + STATIONEN[aktuell - 1] });
      STATIONEN.forEach(function (name, i) {
        var n = i + 1;
        util.element('span', {
          class: 'r-leiste-station' + (n < aktuell ? ' ist-erledigt' : '') + (n === aktuell ? ' ist-aktuell' : ''),
          'aria-hidden': 'true'
        }, name, leiste);
      });
      rechts.insertBefore(leiste, rechts.firstChild);
    });
  }
  if (Deck.bereit && Deck.bereit.then) Deck.bereit.then(leisteEinfuegen);
  document.addEventListener('deck:bereit', leisteEinfuegen);
})();
