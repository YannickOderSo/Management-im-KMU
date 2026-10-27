/* =============================================================================
   fuehrung.js – Verhalten der Folien „Führung im KMU“
   Die Bewegungen von Folie 05 (Kreise) und 07 (Organigramm) macht CSS über
   den unsichtbaren Schritt-Auslöser (data-animation="zustand" → .schritt-an).
   Hier nur: Druck/PDF zeigt den Endzustand dieser beiden Folien.
   ============================================================================= */
(function () {
  'use strict';
  ['f05', 'f07'].forEach(function (id) {
    Deck.registriere(id, {
      druck: function (ctx) {
        Deck.util.alle('[data-animation="zustand"]', ctx.folie).forEach(function (el) {
          el.classList.add('schritt-an');
        });
      }
    });
  });
})();
