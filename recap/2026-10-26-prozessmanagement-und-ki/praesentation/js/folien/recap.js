/* =============================================================================
   recap.js – Verhalten des Fundaments „Der rote Faden“ (css/folien/recap.css)
   -----------------------------------------------------------------------------
   1. LAUFLEISTE
      Jede Folie mit data-station="1…4" bekommt beim LADEN dieses Skripts (also
      vor dem Start der Engine) eine eigene Kopfzeile <div class="laufkopf
      r-laufkopf">: vier Blocknamen über ihren Fadenabschnitten, Breite nach
      Redezeit des Blocks (Summe data-zeit aller Folien mit data-station bzw.
      data-block = n), rechts die Foliennummer. Weil die Engine eine vorhandene
      .laufkopf übernimmt statt eine eigene einzufügen, steht die Leiste damit
      fest im DOM – in Druck/PDF, Übersicht (Klone) und Referentenansicht, und
      unabhängig davon, ob ein Folien-Skript Deck.registriere(…) nutzt.
      Der Fadenabschnitt trägt data-morph="faden", der Name des aktuellen Blocks
      data-morph="station-n": von der Trennfolie gleiten Faden und Kurzname
      beim Weiterschalten in die Leiste.
      data-station="alle" (Fazit): Leiste zu einer durchgehenden Karminlinie
      geschlossen, ohne aktuellen Block.
   2. FADEN AUSRICHTEN UND WEBEN
      Jede .r-faden-linie hängt per CSS an einem Anker auf der Grundlinie
      (Rückfall ohne Skript: gerade Linie). Das Skript setzt linke Kante und
      Breite exakt auf den Folienrand (randabfallend) und webt in jedem
      .r-webe: An jeder Stelle, an der eine Glyphe (Unterlänge) den Faden
      kreuzt – ermittelt mit einer Canvas-Probe der echten Glyphe –, liegt
      abwechselnd ein Stück „vorne“ (.r-webe-vorne, Papierhof oben/unten
      schneidet den Strich) bzw. eine Papierlücke im Faden („hinten“,
      .r-webe-luecke, 11 px Hof neben dem Strich). Erste Kreuzung einer Glyphe
      = vorne; data-webe-start="hinten" am .r-webe kehrt das um.
      Neu gemessen wird bei deck:bereit, nach document.fonts.ready, bei
      deck:thema und deck:groesse (Taste T lädt andere Schriften).
   3. SCHLEIFE
      Der Bogen einer .r-schleife (Kette mit Bogen zurück, f14) beginnt unter
      der Mitte des letzten und endet unter der Mitte des ersten Worts: das
      Skript setzt --bogen-von/--bogen-bis nach den echten Wortbreiten (sonst
      verrutschten die Enden unter Taste T mit breiteren Schriften). Gemessen
      wird zusammen mit dem Faden.
   Schnittstelle: window.Recap.weben() misst alles neu (z. B. nach einer
   Layoutänderung durch ein Folien-Skript).
   ============================================================================= */
(function () {
  'use strict';
  var Deck = window.Deck;
  if (!Deck || !Deck.util) return;
  var util = Deck.util;

  /* ---------- 1. Laufleiste ---------- */
  var BLOECKE = ['Prozesse', 'KI im KMU', 'KI-Begriffe', 'Bundeswehr'];

  function zweistellig(n) { return (n < 10 ? '0' : '') + n; }

  /* Foliennummer wie die Engine: data-nummer, sonst aus der ID (f08 → „08“) */
  function nummerVon(folie) {
    if (folie.hasAttribute('data-nummer')) return folie.getAttribute('data-nummer');
    var m = /^[a-z]{1,2}(\d+)([a-z]*)$/i.exec(folie.id || '');
    return m ? zweistellig(Number(m[1])) + m[2] : '';
  }

  /* Redezeit je Block in Sekunden (Inhaltsfolien data-station, Trennfolien data-block) */
  function redezeiten() {
    var summe = BLOECKE.map(function () { return 0; });
    util.alle('.buehne > section.folie').forEach(function (folie) {
      var n = Number(folie.getAttribute('data-station') || folie.getAttribute('data-block')) - 1;
      if (n >= 0 && n < summe.length) summe[n] += Number(folie.getAttribute('data-zeit')) || 0;
    });
    return summe.map(function (s) { return s || 1; });
  }

  function laufleisteBauen(folie, anteile) {
    if (folie.querySelector(':scope > .laufkopf')) return;
    var station = (folie.getAttribute('data-station') || '').trim();
    var geschlossen = station === 'alle';
    var aktuell = geschlossen ? 0 : Number(station);
    if (!geschlossen && !(aktuell >= 1 && aktuell <= BLOECKE.length)) return;

    var kopf = util.element('div', { class: 'laufkopf r-laufkopf' });
    var lauf = util.element('div', {
      class: 'r-lauf' + (geschlossen ? ' r-lauf--geschlossen' : ''),
      role: 'img',
      'aria-label': geschlossen ? 'Alle vier Blöcke: ' + BLOECKE.join(', ')
        : 'Block ' + aktuell + ' von ' + BLOECKE.length + ': ' + BLOECKE[aktuell - 1]
    }, null, kopf);
    var namen = util.element('div', { class: 'r-lauf-namen', 'aria-hidden': 'true' }, null, lauf);
    var faden = util.element('div', { class: 'r-lauf-faden', 'aria-hidden': 'true', 'data-morph': 'faden' }, null, lauf);
    BLOECKE.forEach(function (name, i) {
      var n = i + 1;
      var zustand = geschlossen || n < aktuell ? ' ist-erledigt' : (n === aktuell ? ' ist-aktuell' : ' ist-kommend');
      var stil = '--anteil:' + anteile[i];
      util.element('span', {
        class: 'r-lauf-name' + zustand,
        style: stil,
        'data-morph': n === aktuell ? 'station-' + n : null
      }, name, namen);
      util.element('span', { class: 'r-lauf-teil' + zustand, style: stil }, null, faden);
    });
    var nummer = nummerVon(folie);
    if (nummer) util.element('span', { class: 'r-lauf-nummer' }, nummer, kopf);
    folie.insertBefore(kopf, folie.firstChild);
  }

  function laufleistenBauen() {
    var anteile = redezeiten();
    util.alle('.buehne > section.folie[data-station]').forEach(function (folie) {
      if (folie.getAttribute('data-laufkopf') === 'aus') return;
      laufleisteBauen(folie, anteile);
    });
  }
  /* sofort: das Skript steht am Ende von <body>, alle Folien sind gelesen,
     die Engine startet erst bei DOMContentLoaded */
  laufleistenBauen();


  /* ---------- 2. Faden ausrichten und weben ---------- */
  /* Bildschirm-Pixel je Bühnen-Pixel (die Bühne ist per transform skaliert) */
  function stufe(folie) {
    var breite = folie.offsetWidth || 1920;
    return folie.getBoundingClientRect().width / breite || 1;
  }

  /* Linie randabfallend: linke Kante auf den Folienrand, Breite = Folie */
  function linieAusrichten(linie, folie, s) {
    var anker = linie.parentElement;
    if (!anker) return;
    var fr = folie.getBoundingClientRect();
    var ar = anker.getBoundingClientRect();
    linie.style.left = (-(ar.left - fr.left) / s).toFixed(2) + 'px';
    linie.style.width = (fr.width / s).toFixed(2) + 'px';
  }

  function textKnoten(wurzel) {
    var liste = [];
    var gang = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, null);
    for (var n = gang.nextNode(); n; n = gang.nextNode()) {
      if (n.data.trim() && !n.parentElement.closest('.r-faden, .r-webe-vorne')) liste.push(n);
    }
    return liste;
  }

  /* Canvas-Probe: Spalten mit Tinte einer Glyphe zwischen y0 und y1 (in
     Bühnen-px unter der Grundlinie, positiv = tiefer). Ergebnis: Läufe
     [von, bis] relativ zum Ursprung der Glyphe. */
  var leinwand = null;
  function tinte(zeichen, font, breite, y0, y1) {
    if (!leinwand) leinwand = document.createElement('canvas');
    var rand = Math.ceil(breite * 0.6) + 8;
    var w = Math.ceil(breite + 2 * rand);
    var h = Math.max(1, Math.ceil(y1 - y0));
    leinwand.width = w;
    leinwand.height = h;
    var c = leinwand.getContext('2d', { willReadFrequently: true });
    c.clearRect(0, 0, w, h);
    c.font = font;
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#000';
    c.fillText(zeichen, rand, -y0);
    var d = c.getImageData(0, 0, w, h).data;
    var laeufe = [];
    var von = -1;
    for (var x = 0; x < w; x++) {
      var voll = false;
      for (var y = 0; y < h && !voll; y++) voll = d[(y * w + x) * 4 + 3] > 96;
      if (voll && von < 0) von = x;
      if (!voll && von >= 0) { laeufe.push([von - rand, x - rand]); von = -1; }
    }
    if (von >= 0) laeufe.push([von - rand, w - rand]);
    return laeufe;
  }

  function weben(webe) {
    var folie = webe.closest('section.folie');
    if (!folie || webe.closest('.ist-klon')) return;
    util.messen(webe, function () {
      util.alle(':scope > .r-webe-vorne, :scope > .r-webe-luecke', webe).forEach(function (alt) { alt.remove(); });
      var linie = webe.querySelector('.r-faden > .r-faden-linie');
      if (!linie) return;
      var s = stufe(folie);
      linieAusrichten(linie, folie, s);

      var wr = webe.getBoundingClientRect();
      var grund = linie.parentElement.getBoundingClientRect().top;     /* Grundlinie (Bildschirm) */
      var lr = linie.getBoundingClientRect();
      var oben = (lr.top - grund) / s;
      var unten = (lr.bottom - grund) / s;
      var dicke = unten - oben;
      var hof = parseFloat(getComputedStyle(webe).getPropertyValue('--r-hof')) || 11;

      /* Kreuzungen je Glyphe: kern = Tinte im Fadenband, weit = Band ± Hof */
      var glyphen = [];
      var bereich = document.createRange();
      textKnoten(webe).forEach(function (knoten) {
        var st = getComputedStyle(knoten.parentElement);
        var font = [st.fontStyle, st.fontWeight, st.fontSize, st.fontFamily].join(' ');
        for (var i = 0; i < knoten.length; i++) {
          var z = knoten.data.charAt(i);
          if (!/\S/.test(z)) continue;
          bereich.setStart(knoten, i);
          bereich.setEnd(knoten, i + 1);
          var r = bereich.getBoundingClientRect();
          if (!r.width) continue;
          var b = r.width / s;
          var kern = tinte(z, font, b, oben, unten);
          if (!kern.length) continue;
          glyphen.push({ x: (r.left - wr.left) / s, kern: kern, weit: tinte(z, font, b, oben - hof, unten + hof) });
        }
      });
      if (!glyphen.length) return;

      /* alle Tintenläufe im Fadenband (absolut, Bühnen-px relativ zu .r-webe) */
      var alleKern = [];
      glyphen.forEach(function (g) {
        g.kern.forEach(function (l) { alleKern.push([g.x + l[0], g.x + l[1]]); });
      });

      var start = webe.getAttribute('data-webe-start') === 'hinten' ? 1 : 0;
      var top = (lr.top - wr.top) / s;
      glyphen.forEach(function (g) {
        g.kern.forEach(function (l, k) {
          var a = g.x + l[0];
          var e = g.x + l[1];
          if ((k + start) % 2) {
            /* hinten: Papierlücke im Faden, 11 px Hof links und rechts des Strichs */
            util.element('span', {
              class: 'r-webe-luecke',
              'aria-hidden': 'true',
              style: 'left:' + (a - hof).toFixed(1) + 'px;width:' + (e - a + 2 * hof).toFixed(1) +
                'px;top:' + (top - 1).toFixed(1) + 'px;height:' + (dicke + 2).toFixed(1) + 'px'
            }, null, webe);
            return;
          }
          /* Ausdehnung desselben Strichs im Hofbereich (schräge/runde Striche),
             höchstens zwei Höfe weit */
          var ea = a, ee = e;
          g.weit.forEach(function (w) {
            var wa = g.x + w[0], we = g.x + w[1];
            if (we >= a && wa <= e) { ea = Math.min(ea, Math.max(wa, a - 2 * hof)); ee = Math.max(ee, Math.min(we, e + 2 * hof)); }
          });
          var links = Math.min(ea - 4, a - hof - 6);
          var rechts = Math.max(ee + 4, e + hof + 6);
          /* nie über einen anderen Strich im Fadenband reichen */
          alleKern.forEach(function (w) {
            if (w[1] <= a && w[1] + 2 > links) links = w[1] + 2;
            if (w[0] >= e && w[0] - 2 < rechts) rechts = w[0] - 2;
          });
          if (rechts - links < 4) return;
          util.element('span', {
            class: 'r-webe-vorne',
            'aria-hidden': 'true',
            style: 'left:' + links.toFixed(1) + 'px;width:' + (rechts - links).toFixed(1) +
              'px;top:' + (top - hof).toFixed(1) + 'px;height:' + (dicke + 2 * hof).toFixed(1) + 'px'
          }, null, webe);
        });
      });
    });
  }

  /* ---------- 3. Schleife: Bogenenden an die Wortmitten ---------- */
  function schleifeMessen(schleife) {
    var folie = schleife.closest('section.folie');
    if (!folie || schleife.closest('.ist-klon')) return;
    util.messen(schleife, function () {
      var woerter = util.alle(':scope > .r-kette > li', schleife);
      if (woerter.length < 2) return;
      var s = stufe(folie);
      var sr = schleife.getBoundingClientRect();
      var a = woerter[0].getBoundingClientRect();
      var e = woerter[woerter.length - 1].getBoundingClientRect();
      if (!sr.width || !a.width || !e.width) return;
      schleife.style.setProperty('--bogen-von', ((a.left + a.width / 2 - sr.left) / s).toFixed(1) + 'px');
      schleife.style.setProperty('--bogen-bis', ((sr.right - e.left - e.width / 2) / s).toFixed(1) + 'px');
    });
  }

  function allesWeben() {
    util.alle('.buehne .r-faden-linie').forEach(function (linie) {
      if (linie.closest('.ist-klon') || linie.closest('.r-webe')) return;
      var folie = linie.closest('section.folie');
      if (!folie) return;
      util.messen(linie, function () { linieAusrichten(linie, folie, stufe(folie)); });
    });
    util.alle('.buehne .r-webe').forEach(weben);
    util.alle('.buehne .r-schleife').forEach(schleifeMessen);
  }

  var geplant = 0;
  function planen() {
    cancelAnimationFrame(geplant);
    geplant = requestAnimationFrame(allesWeben);
  }

  function start() {
    allesWeben();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(planen);
  }
  if (Deck.istBereit) start();
  else document.addEventListener('deck:bereit', start, { once: true });
  document.addEventListener('deck:thema', planen);
  document.addEventListener('deck:groesse', planen);

  window.Recap = {
    bloecke: BLOECKE.slice(),
    weben: allesWeben
  };
})();
