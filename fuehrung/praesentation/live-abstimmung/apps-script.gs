/**
 * @OnlyCurrentDoc  Das Skript darf nur auf die Tabelle zugreifen, in der es steckt.
 */
/* =============================================================================
   apps-script.gs – Server der Live-Abstimmung (Folie 08, „Wenn HOLY ein Tier
   wäre – welches?“)
   -----------------------------------------------------------------------------
   Google-Apps-Script (Laufzeit V8) als Web-App, gebunden an eine Google-Tabelle
   (in der Tabelle: Erweiterungen → Apps Script). Einrichtung Schritt für
   Schritt: ANLEITUNG.md im selben Ordner. Keine Bibliotheken.

   Was die Web-App kann – und nur das:
   • aktion=stimme  eine Stimme als neue Zeile ins Blatt „Stimmen“ schreiben
   • aktion=stand   die Stimmen einer Runde zählen und NUR die Zahlen herausgeben
                    (auf Wunsch nur die der letzten minuten Minuten, ZEITFENSTER)
   Sie gibt keine Zeilen, keine Geräte-IDs und keine Zeiten heraus und löscht
   nichts. Dank @OnlyCurrentDoc (oben) erreicht sie nur diese eine Tabelle.

   SCHNITTSTELLE (verbindlich, gleich in abstimmen.html und js/komponenten.js)
   Nur GET. Ist der Parameter callback gesetzt, kommt die Antwort als JSONP
   („f({…});“), sonst als JSON. JSONP per <script> funktioniert unabhängig von
   CORS und von den Weiterleitungen, über die Google Web-Apps ausliefert.
     ?aktion=stimme&umfrage=tier&runde=probe&option=2&anzahl=5&geraet=<ID>&callback=f
        → f({"ok":true});
     ?aktion=stand&umfrage=tier&runde=probe&anzahl=5&callback=f
        → f({"ok":true,"werte":[3,1,7,0,2],"n":13,"zeit":"2026-10-26T14:05:09.123Z"});
     ?aktion=stand&umfrage=tier&runde=probe&anzahl=5&minuten=30&callback=f
        → f({"ok":true,"werte":[2,0,5,0,1],"n":8,"zeit":"…","minuten":30});
          (seit Fassung 20.10.2026: nur Stimmen der letzten 30 Minuten, ZEITFENSTER
          unten; „minuten“ in der Antwort = das Fenster wurde angewandt. Ältere
          Fassungen ignorieren minuten und antworten ohne dieses Feld.)
     Fehler
        → f({"ok":false,"fehler":"kurzer deutscher Text"});
   Weitere Parameter (z. B. _=Zeitstempel gegen den Browser-Zwischenspeicher,
   minuten bei aktion=stimme) werden ignoriert. {"ok":true} kommt erst, wenn
   die Zeile geschrieben ist.
   Bei Andrang: „Gerade kommen sehr viele Stimmen auf einmal – …“ (ANDRANG,
   unten). Mit diesem Text oder „Serverfehler: …“ sendet das Handy die Stimme
   von selbst noch einmal (js/abstimmen.js).

   Prüfung der Eingaben
     umfrage, runde  nur A–Z a–z 0–9 _ -, 1 bis 40 Zeichen
     geraet          nur A–Z a–z 0–9 _ -, 8 bis 64 Zeichen (zufällige ID aus dem Browser)
     anzahl          ganze Zahl 1 bis 9 (Zahl der Antwortmöglichkeiten)
     option          ganze Zahl, 0 ≤ option < anzahl (Nummer der Antwort ab 0,
                     Reihenfolge wie in marke.js → umfragen.tier.optionen)
     minuten         nur aktion=stand, freiwillig: ganze Zahl 1 bis 1440 (höchstens
                     ein Tag). Fehlt er, zählt der Stand ohne Zeitgrenze wie bisher;
                     leer, 0 oder ungültig → Fehler wie bei den anderen Angaben.
     callback        muss /^[A-Za-z_$][\w$.]{0,63}$/ erfüllen – sonst kommt der
                     Fehler als reines JSON (ein fremder Name wird nie ausgegeben)

   Zählregel
   Je Runde, Umfrage und Gerät zählt nur die LETZTE Stimme (Spalte Zeit =
   Eingang der Anfrage): Umentscheiden ersetzt die alte Stimme, ein zweiter
   Klick zählt nicht doppelt.
   „runde“ trennt Probe und Vortrag (marke.js → umfragen.tier.runde, z. B.
   'probe' und 'vortrag-2026-10-27'). So beginnt der Vortrag ohne Probestimmen –
   ohne geheimen Schlüssel im öffentlichen Repository.

   ZEITFENSTER (Fassung vom 20.10.2026)
   Auftrag Yannick (20.10.2026): Nach einer gewissen Zeit sollen alte Stimmen
   nicht mehr auf Folie 08 stehen. Die Folie fragt deshalb mit minuten=30 ab
   (marke.js → umfragen.tier.gueltigMinuten). Regel: Je Runde, Umfrage und
   Gerät wird ZUERST die letzte Stimme bestimmt (wie oben), DANN zählt sie nur,
   wenn ihre Zeit höchstens minuten Minuten vor der Anfrage liegt (genau
   minuten Minuten alt zählt noch, eine Millisekunde älter nicht). Wer sich
   kurz vor Ablauf umentscheidet, zählt mit der neuen Wahl weiter; ist auch
   die letzte Stimme zu alt, zählt das Gerät gar nicht – eine ältere Stimme
   desselben Geräts rückt nie nach. Die umgekehrte Reihenfolge (erst alte
   Zeilen aussortieren, dann die letzte Stimme) ergäbe dasselbe, weil das
   Fenster alle späteren Zeiten enthält und die letzte Stimme die späteste
   Zeit hat; die gewählte Reihenfolge sagt die Regel direkt („die aktuelle
   Stimme eines Geräts zählt, solange sie frisch ist“). Zeilen ohne gültige
   Zeit (von Hand) zählen mit minuten nicht – ihr Alter ist unbekannt.
   Verglichen wird die Spalte Zeit (beim Schreiben new Date(), als Datum aus
   der Tabelle gelesen) mit new Date() bei der Anfrage, beides Zeitpunkte des
   Servers – die Uhr der Handys spielt keine Rolle. Dass ein Datum beim
   Schreiben und Lesen dieselbe Zeitzone der Tabelle nutzt und unverändert
   zurückkommt, ist Modellwissen. Geprüft wird es in der echten Tabelle in
   BEIDEN Richtungen: Steht die Zeit zu früh, fällt eine frische Teststimme
   bei &minuten=30 heraus; steht sie zu spät, zählt sie nach 2 Minuten bei
   &minuten=1 noch (dann zählten Stimmen länger als gewollt). Beides macht die
   Kurzprüfung in ANLEITUNG.md („Skript aktualisieren“, Punkt 5) und der
   Lasttest (werkzeuge/live-abstimmung-test.mjs, Gegenprobe).
   Die Zeitzone der Tabelle während einer Abstimmung nicht ändern.
   Die Zeilen bleiben im Blatt (nichts wird gelöscht), ohne minuten zählen sie
   weiter. Ältere Fassungen ignorieren minuten: Dann gibt es kein Zeitfenster
   – es wirkt erst nach „Skript aktualisieren“ (ANLEITUNG.md).

   Tabelle, Blatt „Stimmen“ (legt das Skript selbst an):
     Zeit | Runde | Umfrage | Option | Geraet
   Keine personenbezogenen Daten: kein Name, keine IP-Adresse, nur eine zufällige
   Geräte-ID. Zeilen löschen (z. B. Teststimmen) und Sortieren sind erlaubt –
   aber nur, wenn gerade niemand abstimmt (Grund unten, SPEICHERN BEI ANDRANG).
   Blattname und Reihenfolge der Spalten bitte nicht ändern. Dazu kommt eine
   Skript-Eigenschaft „naechsteZeile“ (Apps Script → Projekteinstellungen): nur
   die Nummer der nächsten freien Zeile.

   SPEICHERN BEI ANDRANG (Fassung vom 19.10.2026)
   Bisher schrieb jede Stimme unter einer Sperre (LockService): Blatt suchen,
   letzte Zeile ermitteln, Format und Werte schreiben, flush – rund 0,5 s je
   Stimme, alle nacheinander. Lasttest mit der echten Web-App am 19.10.2026:
   19 von 40 gleichzeitigen Stimmen angenommen, 21 nach 10 s Warten abgelehnt.
   Jetzt in zwei Schritten:
   1. Zeile reservieren. Unter der Sperre steht NUR ein Zähler in den
      Skript-Eigenschaften: lesen, um 1 erhöhen, Sperre frei. Kein Zugriff auf
      die Tabelle. Das ist das Muster aus der Google-Referenz zu Lock (Beispiel:
      fortlaufende Ticketnummer unter LockService.getScriptLock(), geschrieben
      wird danach ohne Sperre):
      https://developers.google.com/apps-script/reference/lock/lock
   2. Ohne Sperre: Ist die reservierte Zeile leer, kommen Format und Werte
      hinein, dann flush. Jede Stimme hat ihre eigene Zeile – gleichzeitige
      Stimmen schreiben nebeneinander statt nacheinander.
   Warum nicht Sheet.appendRow ohne Sperre? Die Referenz sagt nur „Appends a
   row to the bottom of the current data region in the sheet“, aber nicht, dass
   gleichzeitige Aufrufe nie dieselbe Zeile treffen
   (https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendRow(Object),
   abgerufen 19.10.2026). Dass ältere Fassungen der Referenz appendRow
   „atomic“ nannten, ist Modellwissen, nicht geprüft. Eine überschriebene
   Stimme fiele niemandem auf; eine abgelehnte Stimme sendet das Handy von
   selbst noch einmal.
   Folge des neuen Wegs: Eine Stimme schreibt OHNE Sperre in ihre reservierte
   Zeile, und darunter können schon spätere Stimmen stehen. Wer während einer
   Abstimmung Zeilen löscht, sortiert oder einfügt, kann eine fremde Stimme in
   eine reservierte, noch leere Zeile schieben – sie würde still überschrieben.
   Deshalb nur, wenn gerade niemand abstimmt: Zeilen löschen, sortieren,
   einfügen, einrichten() ausführen, eine neue Version bereitstellen (die alte
   Fassung schrieb hinter die letzte Zeile, also in reservierte Zeilen).
   einrichten() setzt den Zähler nie zurück: Eine Lücke im Blatt ist harmlos,
   eine doppelt vergebene Zeile nicht.
   Kontingente (https://developers.google.com/apps-script/guides/services/quotas,
   abgerufen 19.10.2026): Google nennt „Simultaneous executions per user: 30“
   und ein nicht beziffertes Limit für zu viele Starts pro Sekunde („Script
   invoked too many times per second for this Google user account.“). Wie
   beide bei einer Web-App mit „Ausführen als: Ich“ greifen, ist nicht
   dokumentiert. Beim Lasttest am 19.10.2026 (40 Stimmen) trat keine
   Kontingent-Meldung auf. Würde Google eine Anfrage abbrechen, käme beim Handy
   keine Antwort des Skripts an, sondern vermutlich eine Fehlerseite
   (Modellwissen, nicht geprüft) – auch dann wiederholt das Handy. Kurze
   Ausführungen halten die Zahl der gleichzeitigen klein.

   Nach JEDER Änderung an diesem Skript: ANLEITUNG.md, Abschnitt „Skript
   aktualisieren“ (Code einfügen, einrichten ausführen, Neue Version
   bereitstellen) und FASSUNG (unten) auf das Datum der Änderung setzen. Welche
   Fassung läuft, zeigt …/exec?aktion=fassung (Antwort „Unbekannte Aktion …
   (Skript-Fassung …)“ – eine Fehlermeldung, die nur die Fassung nennt).
   Prüfen ohne Google-Konto: node werkzeuge/live-abstimmung-test.mjs
   ============================================================================= */

/* Datum dieser Fassung – zeigt die Antwort auf eine unbekannte Aktion
   (z. B. …/exec?aktion=fassung). So lässt sich prüfen, ob nach „Neue Version“
   wirklich diese Fassung läuft. */
const FASSUNG = '20.10.2026';
const BLATT = 'Stimmen';
const KOPF = ['Zeit', 'Runde', 'Umfrage', 'Option', 'Geraet'];
/* Zahlenformate je Spalte. '@' = Text: Sonst macht Google Tabellen aus einer
   Runde „2026-10-26“ ein Datum, aus „true“ einen Wahrheitswert und aus einer
   Geräte-ID wie „12345678“ eine Zahl – dann fände die Zählung sie nicht wieder.
   (Dass '@' die Umwandlung verhindert, ist Modellwissen; einrichten() prüft es
   in der echten Tabelle mit der Textschutz-Probe.) Gesetzt wird das Format
   zweimal: für die ganzen Spalten (einrichten) und für jede neue Zeile. */
const FORMATE = ['dd.mm.yyyy hh:mm:ss', '@', '@', '0', '@'];
/* Skript-Eigenschaft mit der Nummer der nächsten freien Zeile */
const ZAEHLER = 'naechsteZeile';
/* So viele leere, vorformatierte Zeilen hält einrichten() bereit. Ist die
   Reserve doch aufgebraucht, fügt eine Stimme NACHSCHUB Zeilen an. */
const RESERVE = 5000;
const NACHSCHUB = 500;

const MUSTER_NAME = /^[A-Za-z0-9_-]{1,40}$/;
const MUSTER_GERAET = /^[A-Za-z0-9_-]{8,64}$/;
const MUSTER_CALLBACK = /^[A-Za-z_$][\w$.]{0,63}$/;
const MUSTER_ZAHL = /^[0-9]{1,2}$/;
const HOECHSTENS_OPTIONEN = 9;
/* Zeitfenster der Stand-Abfrage (minuten): 1 Minute bis 1 Tag */
const MUSTER_MINUTEN = /^[0-9]{1,4}$/;
const HOECHSTENS_MINUTEN = 1440;
/* So lange wartet eine Stimme höchstens auf den Zähler. Unter der Sperre wird
   nur eine Zahl gelesen und geschrieben; wie lange das bei Google dauert, ist
   nicht gemessen. Kürzer als das Zeitlimit je Versuch auf dem Handy
   (js/abstimmen.js: ZEITLIMIT 15 s) minus 5 s für Weiterleitung, Start und
   Schreiben: Bei Andrang gibt der Server zuerst auf, seine Antwort kommt an,
   und das Handy versucht es nach einer kurzen Pause von selbst noch einmal. */
const SPERRE_WARTEN_MS = 8000;
const ANDRANG = 'Gerade kommen sehr viele Stimmen auf einmal – bitte gleich noch einmal tippen.';


/* -----------------------------------------------------------------------------
   Einstieg: jede Anfrage an die Web-App-Adresse (…/exec?…) landet hier.
   ----------------------------------------------------------------------------- */
function doGet(e) {
  if (!e) {
    /* im Editor ausgeführt (dort gibt es keine Anfrage) – häufiger Fehler beim
       Einrichten: Im Auswahlfeld stand noch doGet statt einrichten */
    Logger.log('Hinweis: Das war doGet – die Funktion für Aufrufe über die Web-App-Adresse. ' +
      'Zum Einrichten im Auswahlfeld neben „Debuggen“ „einrichten“ wählen und noch einmal „Ausführen“ klicken.');
  }
  const p = (e && e.parameter) || {};
  const callback = p.callback;

  /* Ungültiger callback-Name: nicht verarbeiten, nicht zurückgeben (sonst
     könnte jemand eigenen Code in die Antwort schleusen). */
  if (callback !== undefined && !(typeof callback === 'string' && MUSTER_CALLBACK.test(callback))) {
    return ausgeben_({ ok: false, fehler: 'Ungültiger callback-Name.' }, null);
  }

  let antwort;
  try {
    if (p.aktion === 'stimme') antwort = stimmeSpeichern_(p);
    else if (p.aktion === 'stand') antwort = standZaehlen_(p);
    else antwort = { ok: false, fehler: 'Unbekannte Aktion – erlaubt sind aktion=stimme und aktion=stand. (Skript-Fassung ' + FASSUNG + ')' };
  } catch (fehler) {
    antwort = { ok: false, fehler: 'Serverfehler: ' + kurz_(fehler) };
  }
  return ausgeben_(antwort, callback);
}


/* -----------------------------------------------------------------------------
   Im Editor ausführen (oben Funktion „einrichten“ wählen → Ausführen) – beim
   ersten Mal und nach jeder neuen Fassung des Skripts. Legt das Blatt
   „Stimmen“ an oder richtet ein vorhandenes nach: Kopfzeile, RESERVE leere
   Zeilen, Formate der ganzen Spalten, Zähler hinter die letzte Zeile – aber
   nie zurück (nach gelöschten Zeilen bleibt eine Lücke; die stört nicht).
   Prüft den Textschutz und meldet alles im Ausführungsprotokoll. Löscht keine
   Stimmen; mehrfaches Ausführen schadet nicht. Nicht während einer laufenden
   Abstimmung ausführen (es fügt Zeilen an und schreibt die Probe).
   ----------------------------------------------------------------------------- */
function einrichten() {
  const tabelle = tabelleHolen_();
  const sperre = LockService.getScriptLock();
  sperre.waitLock(30000);
  let bericht;
  try {
    const vorhanden = tabelle.getSheetByName(BLATT);
    const blatt = vorhanden || tabelle.insertSheet(BLATT);
    const speicher = PropertiesService.getScriptProperties();
    /* Zähler lesen und schreiben in DERSELBEN Sperre; ein neues Blatt beginnt
       in Zeile 2, ein vorhandenes nie vor dem gespeicherten Zähler */
    const bisher = vorhanden ? zaehlerWert_(speicher.getProperty(ZAEHLER)) : 0;
    const naechste = blattVorbereiten_(blatt, bisher);
    speicher.setProperty(ZAEHLER, String(naechste));
    const letzte = blatt.getLastRow();
    bericht = {
      stimmen: Math.max(0, letzte - 1),
      naechste: naechste,
      frei: blatt.getMaxRows() - naechste + 1,
      formate: blatt.getRange(naechste, 1, 1, KOPF.length).getNumberFormats()[0],
      probe: textProbe_(blatt)
    };
    SpreadsheetApp.flush();             /* vor der Freigabe schreiben (Referenz: Lock.releaseLock) */
  } finally {
    sperre.releaseLock();
  }
  Logger.log('Blatt „%s“ ist bereit. Gespeicherte Stimmen: %s. Nächste Stimme in Zeile %s, %s leere Zeilen vorbereitet.',
    BLATT, bericht.stimmen, bericht.naechste, bericht.frei);
  Logger.log('Formate (Zeit | Runde | Umfrage | Option | Geraet): %s', bericht.formate.join(' | '));
  Logger.log(bericht.probe === null
    ? 'Textschutz-Probe übersprungen: Die letzte Zeile des Blatts ist nicht leer.'
    : bericht.probe
      ? 'Textschutz-Probe bestanden: „2026-10-26“, „true“ und „12345678“ bleiben Text.'
      : 'WARNUNG: Textschutz-Probe nicht bestanden – Protokoll kopieren und melden (ANLEITUNG.md). (Stimmen kommen trotzdem an.)');
}


/* ---------- aktion=stimme ---------- */
function stimmeSpeichern_(p) {
  const fehler = eingabenPruefen_(p, true);
  if (fehler) return { ok: false, fehler: fehler };

  /* Zeit beim Eingang, nicht beim Schreiben: Wartet eine ältere Anfrage
     desselben Handys länger, gewinnt trotzdem die neuere Wahl. */
  const werte = [[new Date(), p.runde, p.umfrage, ganzeZahl_(p.option), p.geraet]];
  const blatt = blattHolen_(true);
  if (!blatt) return { ok: false, fehler: ANDRANG };

  /* Höchstens drei Zeilen: Ist eine reservierte Zeile schon belegt (Zeilen von
     Hand eingefügt oder Löschen rückgängig gemacht), setzt der nächste Versuch
     den Zähler hinter die letzte Zeile. */
  for (let versuch = 1; versuch <= 3; versuch++) {
    const zeile = zeileReservieren_(blatt, versuch > 1);
    if (!zeile) return { ok: false, fehler: ANDRANG };
    const ziel = zielLesen_(blatt, zeile);
    if (!istLeer_(ziel.werte)) continue;
    ziel.bereich.setNumberFormats([FORMATE]).setValues(werte);
    /* Erst schreiben, dann antworten: {"ok":true} heißt „steht in der Tabelle“.
       Ein Fehler beim Schreiben wird so zu „Serverfehler: …“, und das Handy
       sendet noch einmal (Referenz: SpreadsheetApp.flush). */
    SpreadsheetApp.flush();
    return { ok: true };
  }
  throw new Error('Keine freie Zeile gefunden – bitte einrichten() ausführen.');
}

/* Nächste freie Zeile holen und den Zähler weiterzählen – unter der Sperre,
   aber ohne Zugriff auf die Tabelle (außer im seltenen Abgleich).
   Rückgabe: Zeilennummer oder 0, wenn die Sperre nicht frei wurde. */
function zeileReservieren_(blatt, abgleichen) {
  const sperre = LockService.getScriptLock();
  if (!sperre.tryLock(SPERRE_WARTEN_MS)) return 0;
  try {
    /* Lesen und Erhöhen in derselben Sperre – sonst könnten zwei Stimmen
       dieselbe Nummer bekommen (Beispiel der Lock-Referenz, oben) */
    const speicher = PropertiesService.getScriptProperties();
    let zeile = zaehlerWert_(speicher.getProperty(ZAEHLER));
    if (abgleichen || zeile === 0) {
      /* selten: Zähler fehlt (neue Fassung, einrichten() noch nicht
         ausgeführt) oder passt nicht zum Blatt → hinter die letzte Zeile.
         Nie zurück: Reservierte, noch leere Zeilen anderer Stimmen bleiben frei. */
      const letzte = blatt.getLastRow();
      if (letzte === 0) {
        kopfSchreiben_(blatt);
        SpreadsheetApp.flush();         /* vor der Freigabe schreiben */
      }
      zeile = Math.max(zeile, letzte + 1, 2);
    }
    speicher.setProperty(ZAEHLER, String(zeile + 1));
    return zeile;
  } finally {
    sperre.releaseLock();
  }
}

/* Reservierte Zeile lesen. Liegt sie hinter dem Blattende (Reserve
   aufgebraucht), werden zuerst Zeilen angefügt. */
function zielLesen_(blatt, zeile) {
  let bereich;
  try {
    bereich = blatt.getRange(zeile, 1, 1, KOPF.length);
    return { bereich: bereich, werte: bereich.getValues()[0] };
  } catch (fehler) {
    if (zeile <= blatt.getMaxRows()) throw fehler;         /* ein anderer Fehler */
    reserveAuffuellen_(blatt, zeile);
    bereich = blatt.getRange(zeile, 1, 1, KOPF.length);
    return { bereich: bereich, werte: bereich.getValues()[0] };
  }
}

/* Zeilen am Blattende anfügen und formatieren (unter der Sperre, damit nicht
   mehrere Stimmen gleichzeitig anfügen). Bestehende Zeilen verschieben sich
   dabei nicht. */
function reserveAuffuellen_(blatt, zeile) {
  const sperre = LockService.getScriptLock();
  sperre.waitLock(SPERRE_WARTEN_MS);
  try {
    const bisher = blatt.getMaxRows();
    if (zeile <= bisher) return;                           /* schon angefügt */
    const neu = Math.max(NACHSCHUB, zeile - bisher);
    blatt.insertRowsAfter(bisher, neu);
    FORMATE.forEach(function (format, i) {
      blatt.getRange(bisher + 1, i + 1, neu, 1).setNumberFormat(format);
    });
    SpreadsheetApp.flush();             /* vor der Freigabe schreiben */
  } finally {
    sperre.releaseLock();
  }
}


/* ---------- aktion=stand ---------- */
function standZaehlen_(p) {
  const fehler = eingabenPruefen_(p, false);
  if (fehler) return { ok: false, fehler: fehler };

  const anzahl = ganzeZahl_(p.anzahl);
  const werte = new Array(anzahl).fill(0);
  /* ZEITFENSTER (Kopf): ohne minuten keine Grenze. Eine Uhrzeit für Grenze
     und Antwort. */
  const minuten = p.minuten === undefined ? 0 : minutenWert_(p.minuten);
  const jetzt = new Date();
  const grenze = minuten ? jetzt.getTime() - minuten * 60000 : -Infinity;
  const blatt = blattHolen_(false);     /* nur lesen: kein Blatt = noch keine Stimmen */
  const letzteZeile = blatt ? blatt.getLastRow() : 0;

  if (letzteZeile >= 1) {
    /* ab Zeile 1 lesen: Die Kopfzeile zählt nie (Option „Option“ ist keine
       Zahl), und eine von Hand gelöschte Kopfzeile kostet keine Stimme.
       Leere Zeilen (reserviert, noch nicht geschrieben) werden übersprungen. */
    const zeilen = blatt.getRange(1, 1, letzteZeile, KOPF.length).getValues();
    /* Gerät → letzte Stimme. Map statt Objekt: Geräte-IDs wie „__proto__“
       bleiben gewöhnliche Schlüssel. */
    const letzte = new Map();
    zeilen.forEach(function (z) {
      if (String(z[1]) !== p.runde || String(z[2]) !== p.umfrage) return;
      const geraet = String(z[4]);
      if (!geraet || z[3] === '' || z[3] === null) return;      /* unvollständige Zeile (von Hand) */
      const zeit = istDatum_(z[0]) ? z[0].getTime() : -Infinity;
      const bisher = letzte.get(geraet);
      /* spätere Zeit gewinnt; bei gleicher Zeit die weiter unten stehende Zeile */
      if (!bisher || zeit >= bisher.zeit) letzte.set(geraet, { zeit: zeit, option: Number(z[3]) });
    });
    letzte.forEach(function (stimme) {
      /* erst jetzt das Zeitfenster: Ist die LETZTE Stimme zu alt, zählt das
         Gerät nicht (ohne minuten ist grenze -Infinity: alles zählt wie bisher) */
      if (stimme.zeit < grenze) return;
      const o = stimme.option;
      if (Number.isInteger(o) && o >= 0 && o < anzahl) werte[o] += 1;
    });
  }

  const n = werte.reduce(function (summe, wert) { return summe + wert; }, 0);
  const antwort = { ok: true, werte: werte, n: n, zeit: jetzt.toISOString() };
  /* nur mit Fenster: zeigt der Folie, dass diese Fassung es angewandt hat */
  if (minuten) antwort.minuten = minuten;
  return antwort;
}


/* ---------- Eingaben prüfen: Fehlertext oder null ---------- */
function eingabenPruefen_(p, mitStimme) {
  if (!passt_(MUSTER_NAME, p.umfrage)) {
    return 'Ungültige Umfrage: nur Buchstaben, Ziffern, _ und -, höchstens 40 Zeichen.';
  }
  if (!passt_(MUSTER_NAME, p.runde)) {
    return 'Ungültige Runde: nur Buchstaben, Ziffern, _ und -, höchstens 40 Zeichen.';
  }
  const anzahl = ganzeZahl_(p.anzahl);
  if (!(anzahl >= 1 && anzahl <= HOECHSTENS_OPTIONEN)) {
    return 'Ungültige Anzahl: ganze Zahl von 1 bis ' + HOECHSTENS_OPTIONEN + '.';
  }
  if (!mitStimme) {
    /* minuten ist freiwillig – wenn angegeben, muss er stimmen */
    if (p.minuten !== undefined && !(minutenWert_(p.minuten) >= 1)) {
      return 'Ungültige Minuten (Zeitfenster): ganze Zahl von 1 bis ' + HOECHSTENS_MINUTEN + ' oder weglassen.';
    }
    return null;
  }

  const option = ganzeZahl_(p.option);
  if (!(option >= 0 && option < anzahl)) {
    return 'Ungültige Option: ganze Zahl von 0 bis ' + (anzahl - 1) + '.';
  }
  if (!passt_(MUSTER_GERAET, p.geraet)) {
    return 'Ungültige Geräte-ID: 8 bis 64 Zeichen, nur Buchstaben, Ziffern, _ und -.';
  }
  return null;
}


/* ---------- Hilfsfunktionen (Endung _ = privat, im Editor nicht auswählbar) ---------- */

function tabelleHolen_() {
  const tabelle = SpreadsheetApp.getActiveSpreadsheet();
  if (!tabelle) {
    throw new Error('Skript ist an keine Tabelle gebunden – in der Tabelle über Erweiterungen → Apps Script anlegen.');
  }
  return tabelle;
}

/* Blatt „Stimmen“ holen (schneller Weg: nur suchen). Fehlt es und ist
   anlegen = true, wird es angelegt. null = fehlt (nur lesen) bzw. Sperre
   besetzt (anlegen). */
function blattHolen_(anlegen) {
  const tabelle = tabelleHolen_();
  const blatt = tabelle.getSheetByName(BLATT);
  if (blatt || !anlegen) return blatt;
  return blattAnlegen_(tabelle);
}

/* selten: erste Stimme ohne einrichten() oder Blatt gelöscht. Unter der
   Sperre, damit zwei erste Stimmen nicht zwei Blätter anlegen wollen. */
function blattAnlegen_(tabelle) {
  const sperre = LockService.getScriptLock();
  if (!sperre.tryLock(SPERRE_WARTEN_MS)) return null;
  try {
    let blatt = tabelle.getSheetByName(BLATT);             /* inzwischen angelegt? */
    if (!blatt) {
      blatt = tabelle.insertSheet(BLATT);
      const naechste = blattVorbereiten_(blatt, 0);        /* neues Blatt: Zeile 2 */
      PropertiesService.getScriptProperties().setProperty(ZAEHLER, String(naechste));
      SpreadsheetApp.flush();           /* vor der Freigabe schreiben */
    }
    return blatt;
  } finally {
    sperre.releaseLock();
  }
}

/* Kopfzeile (falls das Blatt leer ist), RESERVE leere Zeilen ab der nächsten
   freien und die Formate der ganzen Spalten ab Zeile 2. Rückgabe: nächste
   freie Zeile – hinter der letzten Zeile, aber nie vor „mindestens“ (dem
   gespeicherten Zähler). Nur unter der Sperre aufrufen. */
function blattVorbereiten_(blatt, mindestens) {
  if (blatt.getLastRow() === 0) kopfSchreiben_(blatt);
  const naechste = Math.max(2, blatt.getLastRow() + 1, mindestens || 0);
  const frei = blatt.getMaxRows() - naechste + 1;
  if (frei < RESERVE) blatt.insertRowsAfter(blatt.getMaxRows(), RESERVE - frei);
  const zeilen = blatt.getMaxRows() - 1;
  FORMATE.forEach(function (format, i) {
    blatt.getRange(2, i + 1, zeilen, 1).setNumberFormat(format);
  });
  return naechste;
}

function kopfSchreiben_(blatt) {
  blatt.getRange(1, 1, 1, KOPF.length).setValues([KOPF]).setFontWeight('bold');
  blatt.setFrozenRows(1);
}

/* Textschutz in der echten Tabelle prüfen: Werte, die Google Tabellen sonst
   umwandeln würde, in die letzte (leere) Zeile schreiben, zurücklesen und
   wieder leeren – mit clearContent (Referenz Range.clearContent: „Clears the
   content of the range, leaving the formatting intact.“), damit getLastRow
   die Zeile danach sicher als leer ansieht. true = alles blieb Text,
   null = Zeile nicht leer (übersprungen). */
function textProbe_(blatt) {
  const bereich = blatt.getRange(blatt.getMaxRows(), 1, 1, KOPF.length);
  if (!istLeer_(bereich.getValues()[0])) return null;
  const probe = ['', '2026-10-26', 'true', '', '12345678'];
  bereich.setValues([probe]);
  SpreadsheetApp.flush();
  const zurueck = bereich.getValues()[0];
  bereich.clearContent();
  return [1, 2, 4].every(function (i) { return zurueck[i] === probe[i]; });
}

/* Antwort als JSONP (mit geprüftem callback) oder als JSON */
function ausgeben_(antwort, callback) {
  const json = JSON.stringify(antwort);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function passt_(muster, wert) {
  return typeof wert === 'string' && muster.test(wert);
}

function istLeer_(reihe) {
  return reihe.every(function (wert) { return wert === '' || wert === null; });
}

/* gespeicherter Zähler → Zeilennummer ab 2, sonst 0 (fehlt oder unbrauchbar) */
function zaehlerWert_(text) {
  const zeile = Number(text);
  return Number.isInteger(zeile) && zeile >= 2 ? zeile : 0;
}

/* „0“ … „99“ → Zahl; alles andere (leer, „-1“, „1.5“, „1e0“, „ 1“) → NaN */
function ganzeZahl_(wert) {
  return passt_(MUSTER_ZAHL, wert) ? Number(wert) : NaN;
}

/* minuten: „1“ … „1440“ → Zahl; alles andere („0“, „1441“, „30.5“, „ 30“, leer) → NaN */
function minutenWert_(wert) {
  const zahl = passt_(MUSTER_MINUTEN, wert) ? Number(wert) : NaN;
  return zahl >= 1 && zahl <= HOECHSTENS_MINUTEN ? zahl : NaN;
}

function istDatum_(wert) {
  return Object.prototype.toString.call(wert) === '[object Date]' && !isNaN(wert.getTime());
}

function kurz_(fehler) {
  return String((fehler && fehler.message) || fehler).slice(0, 200);
}
