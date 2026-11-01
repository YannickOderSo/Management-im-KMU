/* =============================================================================
   ki-animation.js – Choreografie mit GSAP 3.15 (js/vendor/gsap/, Standard-
   Lizenz von GreenSock/Webflow, kostenlos auch für kommerzielle Nutzung)
   -----------------------------------------------------------------------------
   Ergänzt die Schritt-Animationen der Engine an den Schlüsselstellen:
     01 Titel        Titel Wort für Wort, Trichter baut sich auf, Karten laufen
                     auf Bewegungspfaden durch den Trichter in ihre Fächer
     06 Zeitstrahl   Achse zeichnet sich; Omnibus-Schritt: Hochrisiko-Termine
                     springen nach hinten
     11 Pyramide     Stufen setzen von oben auf
     13 Daumen-Runde Urteil setzt auf, Karte leuchtet kurz
     25 Inventar     Klassenform fliegt vom Betrieb in die Tabellenzeile
     27 Irrtümer     Richtigstellung setzt auf
     35 Kernbotschaft Satz Wort für Wort
   Grundsätze
   • Endzustand = CSS. Alles startet mit from/fromTo und räumt danach seine
     Inline-Stile weg; gsap.context(…).revert() stellt beim Verlassen den
     Ausgangszustand her (auch SplitText). Druck, Übersicht und Prüfwerkzeug
     sehen dasselbe wie ohne dieses Skript.
   • Aus bei „Bewegung reduzieren“, im Druck, im Prüf- und Aufnahmemodus, in
     der Referentenansicht und beim Zurückblättern.
   • Elemente, die hier animiert werden, haben data-animation="keine", damit
     die Engine sie nicht zusätzlich bewegt (ohne GSAP erscheinen sie sofort).
   ============================================================================= */
(function () {
  'use strict';
  var Deck = window.Deck, gsap = window.gsap;
  if (!Deck || !Deck.util || !gsap) return;
  gsap.registerPlugin(window.SplitText, window.MotionPathPlugin);
  var html = document.documentElement;

  function aus(ctx) {
    return !!(ctx.bewegungReduziert || ctx.druckmodus || ctx.referent ||
      html.classList.contains('testmodus') || html.classList.contains('aufnahme') ||
      html.classList.contains('druckmodus'));
  }

  /* Je Folie ein gsap.context: Verlassen, Druck und Testmodus räumen ihn ab */
  var kontexte = {};
  function abraeumen(id) {
    if (kontexte[id]) { kontexte[id].revert(); delete kontexte[id]; }
    Array.prototype.forEach.call(document.querySelectorAll('.k-flieger'), function (el) { el.remove(); });
  }
  function alleAbraeumen() { Object.keys(kontexte).forEach(abraeumen); }
  var testmodusAlt = Deck.testmodus;
  if (typeof testmodusAlt === 'function') {
    Deck.testmodus = function (an) {
      if (an) alleAbraeumen();
      return testmodusAlt.apply(this, arguments);
    };
  }
  window.addEventListener('beforeprint', alleAbraeumen);

  /* choreo('f11', { betreten(folie, ctx), schritt(folie, n, ctx) })
     betreten läuft beim Erreichen der Folie (auch rückwärts – die Funktion
     entscheidet selbst, ob sie dann etwas tut), schritt nur beim Vorwärts-
     blättern innerhalb der Folie. */
  function choreo(id, def) {
    Deck.registriere(id, {
      betreten: function (ctx, n) {
        abraeumen(id);
        if (aus(ctx)) return;
        kontexte[id] = gsap.context(function () {
          if (def.betreten) return def.betreten(ctx.folie, ctx, n);
        }, ctx.folie);
      },
      schritt: function (ctx, n, richtung) {
        /* Zurück mitten in einer Animation: sofort Endzustand von CSS (z. B. kein
           Flug in eine schon ausgeblendete Zeile auf Folie 25) */
        if (richtung === 'zurueck') { if (!def.betreten) abraeumen(id); return; }
        if (richtung === 'start' || aus(ctx) || !def.schritt) return;
        if (!kontexte[id]) kontexte[id] = gsap.context(function () {}, ctx.folie);
        kontexte[id].add(function () { def.schritt(ctx.folie, n, ctx); });
      },
      verlassen: function () { abraeumen(id); },
      druck: function () { abraeumen(id); }
    });
  }
  function vorwaerts(ctx) { return !ctx.sofort && ctx.richtung !== 'zurueck'; }

  /* Eine Kurvenfamilie für das ganze Deck: Eintritte expo.out (≙ CSS
     cubic-bezier(0.16, 1, 0.3, 1)), Wandel power2.inOut, Wege ≤ 32 px */
  var KURVE = 'expo.out', WANDEL = 'power2.inOut', EIN = 0.52, STAFFEL = 0.06;

  /* Wörter steigen aus einer Maske auf; danach wieder normaler Text */
  function woerter(el, optionen) {
    if (!el || !window.SplitText) return null;
    var teil = window.SplitText.create(el, { type: 'words', mask: 'words' });
    return gsap.from(teil.words, Object.assign({
      yPercent: 110, duration: 0.8, ease: KURVE, stagger: STAFFEL,
      onComplete: function () { teil.revert(); }
    }, optionen || {}));
  }

  /* Urteil: Etikett setzt ruhig auf (kurzer Weg, leichte Verkleinerung),
     die Karte hebt sich einen Moment mit einer Kontur in Akzentfarbe ab.
     Kein Drehen, kein Zucken (Bewegung nur mit Bedeutung). */
  function stempeln(etikett, karte, verzoegerung) {
    if (!etikett) return;
    var tl = gsap.timeline({ delay: verzoegerung || 0 });
    tl.fromTo(etikett, { scale: 1.12, y: 8, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: EIN, ease: KURVE, clearProps: 'transform,opacity' });
    if (karte) {
      var stil = getComputedStyle(karte);
      var farbe = (stil.getPropertyValue('--sa-blau') || stil.getPropertyValue('--k-tinte') || '').trim() || '#122E55';
      tl.fromTo(karte, { boxShadow: '0 0 0 4px ' + farbe },
        { boxShadow: '0 0 0 0px ' + farbe, duration: 0.9, ease: 'power2.out', clearProps: 'boxShadow' }, 0.1);
    }
    return tl;
  }


  /* ---------------------------------------------------------------------------
     01 TITEL
     --------------------------------------------------------------------------- */
  choreo('f01', {
    betreten: function (folie, ctx) {
      var maschine = folie.querySelector('.t-maschine');
      if (!maschine) return;
      var karten = Array.prototype.slice.call(maschine.querySelectorAll('.t-karte'));
      var faecher = Array.prototype.slice.call(maschine.querySelectorAll('.t-fach'));
      var intro = gsap.timeline();
      if (ctx.richtung !== 'zurueck') {
        var titel = woerter(folie.querySelector('.t-satz'));
        if (titel) intro.add(titel, 0.1);
        intro.from(folie.querySelectorAll('.t-reihe, .t-unter, .t-meta, .t-vorbehalt'),
          { y: 20, opacity: 0, duration: EIN, ease: KURVE, stagger: STAFFEL, clearProps: 'transform,opacity' }, 0.45);
        intro.from(maschine.querySelectorAll('.t-trichter, .t-rand, .t-schacht'),
          { y: -24, opacity: 0, duration: 0.7, ease: KURVE, clearProps: 'transform,opacity' }, 0.2);
        intro.from(maschine.querySelector('.t-weiche'), { opacity: 0, duration: 0.5, clearProps: 'opacity' }, 0.8);
        intro.from(faecher, { y: 24, opacity: 0, duration: EIN, ease: KURVE, stagger: STAFFEL, clearProps: 'transform,opacity' }, 0.7);
      }

      /* Karten-Schleife statt der CSS-Animation (.mit-gsap schaltet sie ab) */
      maschine.classList.add('mit-gsap');
      gsap.set(karten, { opacity: 0 });
      var fachFormen = {};
      faecher.forEach(function (f) { fachFormen[f.getAttribute('data-klasse')] = f.querySelector('use'); });
      var ziele = ['verboten', 'hoch', 'transparenz', 'minimal', 'minimal'];
      var schleife = gsap.timeline({ repeat: -1, repeatDelay: 0.4, delay: ctx.richtung === 'zurueck' ? 0 : 1.2 });
      karten.forEach(function (karte, i) {
        var stil = getComputedStyle(karte);
        var sx = parseFloat(stil.getPropertyValue('--sx')) || 300;
        var zx = parseFloat(stil.getPropertyValue('--zx')) || 0;
        var zy = parseFloat(stil.getPropertyValue('--zy')) || 588;
        var form = fachFormen[ziele[i]];
        var k = gsap.timeline();
        k.set(karte, { x: sx, y: -80, scale: 1, opacity: 0, transformOrigin: '50% 50%' })
          .to(karte, { y: 18, opacity: 1, duration: 0.55, ease: 'power2.out' })
          .to(karte, { x: 300, y: 150, scale: 0.62, opacity: 0, duration: 0.6, ease: 'power2.in' })
          .set(karte, { x: 300, y: 372, scale: 0.55 })
          .to(karte, { y: 404, scale: 0.75, opacity: 1, duration: 0.35, ease: 'power1.out' }, '+=0.25')
          .to(karte, {
            motionPath: { path: [{ x: 300, y: 404 }, { x: (300 + zx) / 2, y: Math.min(zy, 470) + 8 }, { x: zx, y: zy }], curviness: 1.3 },
            scale: 1, duration: 0.95, ease: 'power2.inOut'
          });
        if (form) {
          k.fromTo(form, { scale: 1 }, { scale: 1.25, duration: 0.18, ease: 'power2.out', transformOrigin: '50% 50%', yoyo: true, repeat: 1 });
        }
        /* alle Karten bleiben liegen, bis die letzte sortiert ist */
        k.to(karte, { opacity: 0, duration: 0.45 }, '+=' + (1.8 + (karten.length - 1 - i) * 1.9));
        schleife.add(k, i * 1.9);
      });
      return function () { maschine.classList.remove('mit-gsap'); };
    }
  });


  /* ---------------------------------------------------------------------------
     06 ZEITSTRAHL
     --------------------------------------------------------------------------- */
  choreo('f06', {
    betreten: function (folie, ctx) {
      if (!vorwaerts(ctx)) return;
      gsap.from(folie.querySelector('.z-achse'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: WANDEL, clearProps: 'transform' });
      gsap.from(folie.querySelector('.z-heute'), { y: -16, opacity: 0, duration: EIN, delay: 0.8, ease: KURVE, clearProps: 'transform,opacity' });
    },
    schritt: function (folie, n) {
      if (n !== 1) return;
      var punkte = folie.querySelectorAll('.z-verschoben .z-punkt');
      /* die verschobenen Termine heben kurz ab und setzen wieder auf */
      gsap.timeline()
        .to(punkte, { y: -20, duration: 0.24, ease: 'power2.out', stagger: STAFFEL })
        .to(punkte, { y: 0, duration: EIN, ease: KURVE, stagger: STAFFEL, clearProps: 'transform' }, '>-0.05');
    }
  });


  /* ---------------------------------------------------------------------------
     11 PYRAMIDE: Stufen setzen von oben auf (data-animation="keine")
     --------------------------------------------------------------------------- */
  choreo('f11', {
    schritt: function (folie, n) {
      var stufe = folie.querySelector('.py-stufe[data-schritt="' + n + '"]');
      if (!stufe) return;
      gsap.from(stufe, { y: -32, duration: 0.7, ease: KURVE, clearProps: 'transform' });
      gsap.from(stufe, { opacity: 0, duration: 0.3, ease: 'none', clearProps: 'opacity' });
    }
  });


  /* ---------------------------------------------------------------------------
     13 DAUMEN-RUNDE und 28 IRRTÜMER: Urteil wird gestempelt
     --------------------------------------------------------------------------- */
  choreo('f13', {
    schritt: function (folie, n) {
      var urteil = folie.querySelector('.dr-urteil[data-schritt="' + n + '"]');
      if (urteil) stempeln(urteil.querySelector('.k-etikett'), urteil.closest('li'), 0.05);
    }
  });
  choreo('f27', {
    schritt: function (folie, n) {
      var fakt = folie.querySelector('.ir-fakt[data-schritt="' + n + '"]');
      if (fakt) stempeln(fakt.querySelector('b'), fakt.closest('li'), 0.1);
    }
  });


  /* ---------------------------------------------------------------------------
     25 INVENTAR: Klassenform fliegt vom Punkt im Betrieb in die Zeile
     --------------------------------------------------------------------------- */
  var FORM = { verboten: 's-verboten', hoch: 's-hoch', transparenz: 's-transparenz', minimal: 's-minimal', gpai: 's-gpai' };
  function mitte(el, folie, massstab, ursprung) {
    var r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - ursprung.left) / massstab, y: (r.top + r.height / 2 - ursprung.top) / massstab, b: r.width / massstab };
  }
  choreo('f25', {
    schritt: function (folie, n) {
      var ursprung = folie.getBoundingClientRect();
      var massstab = ursprung.width / (folie.offsetWidth || ursprung.width) || 1;
      var zeilen = folie.querySelectorAll('.inv-tabelle tr[data-schritt="' + n + '"]');
      Array.prototype.forEach.call(zeilen, function (zeile, i) {
        var nr = (zeile.querySelector('.w-nr') || {}).textContent;
        var etikett = zeile.querySelector('.k-etikett');
        var ziel = etikett && etikett.querySelector('.k-form');
        var klasse = etikett && etikett.getAttribute('data-klasse');
        var punkt = Array.prototype.filter.call(folie.querySelectorAll('.inv-bild .w-punkt'), function (g) {
          return (g.querySelector('.w-zahl') || {}).textContent === nr;
        })[0];
        if (!ziel || !punkt || !FORM[klasse]) return;
        var a = mitte(punkt, folie, massstab, ursprung);
        var b = mitte(ziel, folie, massstab, ursprung);
        var flieger = document.createElement('div');
        flieger.className = 'k-flieger';
        flieger.setAttribute('data-klasse', klasse);
        flieger.setAttribute('aria-hidden', 'true');
        flieger.innerHTML = '<svg class="k-form"><use href="#' + FORM[klasse] + '"/></svg>';
        folie.appendChild(flieger);
        var g = b.b;
        var start = Math.max(1.6, a.b / g * 0.8);
        var tl = gsap.timeline({ delay: 0.15 + i * 0.22, onComplete: function () { flieger.remove(); } });
        tl.set(flieger, { width: g, height: g, x: a.x - g / 2, y: a.y - g / 2, scale: start, opacity: 1 })
          .set(ziel, { opacity: 0 }, 0)
          .from(punkt.querySelector('.w-form'), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.45, ease: KURVE, clearProps: 'transform,opacity' }, 0)
          .to(flieger, {
            motionPath: { path: [{ x: a.x - g / 2, y: a.y - g / 2 }, { x: (a.x + b.x) / 2 - g / 2, y: Math.min(a.y, b.y) - 90 }, { x: b.x - g / 2, y: b.y - g / 2 }], curviness: 1.2 },
            scale: 1, duration: 0.8, ease: WANDEL
          }, 0.25)
          .set(ziel, { opacity: 1, clearProps: 'opacity' })
          .fromTo(etikett, { scale: 1.08 }, { scale: 1, duration: 0.45, ease: KURVE, clearProps: 'transform' });
      });
    }
  });


  /* ---------------------------------------------------------------------------
     35 KERNBOTSCHAFT: Satz Wort für Wort (data-animation="keine")
     --------------------------------------------------------------------------- */
  choreo('f35', {
    schritt: function (folie, n) {
      if (n === 1) woerter(folie.querySelector('.ke-botschaft'), { stagger: 0.08, duration: 0.9 });
    }
  });
})();
