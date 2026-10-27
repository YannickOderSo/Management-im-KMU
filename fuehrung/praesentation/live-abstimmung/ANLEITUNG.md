# Live-Abstimmung einrichten – Schritt für Schritt

Für: Yannick · Dauer: ca. 10 Minuten · Stand: 23.10.2026 (Zeitfenster: Stimmen zählen 30 Minuten, seit 20.10.;
Kurzprüfung der Uhrzeit in beiden Richtungen, 21.10.; Chamäleon statt Waschbär in den Beispielen; Papagei statt Fuchs,
23.10.)
Gebraucht wird: ein **privates Google-Konto** (Gmail), ein Laptop mit Chrome, ein Handy.

> **Erledigt am So, 25.10.2026 (ca. 22 Uhr):** Yannick hat die **Fassung vom 20.10.2026** bei Google eingespielt
> („Skript aktualisieren“, unten). Geprüft von Claude: `<URL>?aktion=fassung` → „(Skript-Fassung 20.10.2026)“; Stand
> mit `minuten=30` → `"minuten":30` (zwei ältere Probestimmen zählen damit nicht mehr); zweimal Lasttest mit 20 Handys (Runden „lasttest-20261025-210108“ und „…-210251“): je 20 von 20 im ersten Versuch, „Danke“ nach höchstens 5,5 bzw. 5,0 s (Median 3,2 bzw. 2,9 s), Folie nie „offline“, Gegenprobe Zeitfenster richtig – BESTANDEN.
> Damit gilt: **Stimmen zählen auf Folie 08 nur 30 Minuten**, und viele gleichzeitige Stimmen werden schnell
> angenommen. Offen bleibt nur die Runde (Abschnitt „Vor dem Vortrag“). Den Abschnitt „Skript aktualisieren“ braucht
> man erst wieder, wenn `apps-script.gs` auf GitHub neuer ist als bei Google.

## Worum es geht

Auf Folie 08 fragen wir: „Wenn HOLY ein Tier wäre – welches?“ (Adler, Löwe, Chamäleon, Papagei, Schwan).
Seit 20.10.2026 steht das Chamäleon an der Stelle des Waschbärs (Nummer 2), seit 23.10.2026 der Papagei an der
Stelle des Fuchses (Nummer 3; Entscheidung Yannick: Papagei und Chamäleon gleichwertig als unsere Analyse, nach
Elias Knauber). Skript und Tabelle speichern nur die Nummer des Tiers – an der Web-App ändert sich dafür nichts,
sie muss auch nicht neu bereitgestellt werden (die Namen kommen aus `marke.js` auf GitHub). Probestimmen mit
Nummer 2 bzw. 3 aus der Zeit davor zählen jetzt als Chamäleon bzw. Papagei; im Vortrag zählen sie ohnehin nicht
(eigene Runde, Abschnitt „Vor dem Vortrag“). Damit die Handys den Papagei sehen, muss die neue `marke.js` (und
`js/abstimmen.js` mit der Papagei-Zeichnung) auf GitHub stehen.

1. Das Publikum scannt den **QR-Code** auf Folie 08 und landet auf unserer Abstimmseite (`abstimmen.html`).
2. Ein Tipp auf ein Tier schickt die Stimme an eine kleine **Web-App** im eigenen Google-Konto (dieses
   Skript: `apps-script.gs`). Sie schreibt die Stimme als Zeile in eine Google-Tabelle.
3. **Folie 08** fragt alle 2 Sekunden den Stand ab und zeichnet die Balken live. Dabei zählen nur Stimmen der
   **letzten 30 Minuten** (Zeitfenster, `../marke.js → umfragen.tier.gueltigMinuten: 30`; Abschnitt „Wichtig zu
   wissen“). Die Zeilen bleiben in der Tabelle.

Fällt etwas aus (kein Internet, Web-App nicht erreichbar), bleibt alles wie bisher: Werte eintippen oder
Zählmodus per Handzeichen (`../LIESMICH.md`, Abschnitt 6).

**Was gespeichert wird** (Blatt „Stimmen“): Zeit · Runde · Umfrage · Option (Nummer des Tiers) · Geraet.
„Geraet“ ist eine **zufällige ID**, die der Browser des Handys erzeugt – je Umfrage und Runde eine eigene,
damit beim Umentscheiden nur die letzte Stimme zählt (Probe und Vortrag sind so nicht verknüpfbar). Keine
Namen, keine E-Mail-Adressen, keine IP-Adressen. Das steht für das Publikum auch im Fuß der Abstimmseite.
Außerdem merkt sich das Skript in seinen Einstellungen (Skript-Eigenschaft „naechsteZeile“) eine einzige Zahl:
die Nummer der nächsten freien Zeile.

---

## Schritt 1 – Tabelle anlegen (1 Min.)

1. In Chrome mit dem **privaten** Google-Konto anmelden und <https://sheets.google.com> öffnen.
2. **Leere Tabelle** anlegen.
3. Oben links auf „Unbenannte Tabelle“ klicken und sie **„HOLY Live-Abstimmung“** nennen.

> Hochschul-Konten erlauben die Einstellung „Jeder“ in Schritt 5 oft nicht. Deshalb ein privates Konto.

## Schritt 2 – Apps Script öffnen (1 Min.)

1. In der Tabelle im Menü **Erweiterungen → Apps Script**.
2. Es öffnet sich ein neuer Tab mit dem Editor. Links steht die Datei **Code.gs**, rechts etwas Code
   (`function myFunction() …`).
3. Oben links auf „Unbenanntes Projekt“ klicken, Namen **„HOLY Live-Abstimmung“** eingeben, „Umbenennen“.

Wichtig: Das Skript **aus der Tabelle heraus** öffnen (wie hier), nicht über script.google.com –
sonst weiß es nicht, in welche Tabelle es schreiben soll.

## Schritt 3 – Code einfügen und speichern (2 Min.)

1. Den Inhalt von `apps-script.gs` kopieren. Am einfachsten auf GitHub:
   <https://github.com/YannickOderSo/Unternehmens-Kommunikation/blob/master/fallstudie-1-brand-persona/praesentation/live-abstimmung/apps-script.gs>
   → rechts oben über dem Code das Symbol **„Copy raw file“** (zwei Rechtecke). Oder Claude bitten, den
   Code in den Chat zu schreiben.
2. Im Editor in **Code.gs** klicken, **Strg+A** (alles markieren), **Entf**, dann **Strg+V** (einfügen).
3. **Strg+S** oder das Disketten-Symbol „Projekt speichern“.

Die erste Zeile muss `/**` sein, darunter `@OnlyCurrentDoc` – das beschränkt das Skript auf diese eine
Tabelle.

## Schritt 4 – Einmal ausführen: Blatt anlegen, Berechtigung erteilen (2 Min.)

1. In der Leiste über dem Code auf das **Auswahlfeld rechts neben „Debuggen“** klicken – dort steht anfangs
   **„doGet“**. In der Liste **„einrichten“** anklicken. Im Feld steht jetzt „einrichten“.
2. **Ausführen** klicken. (Stehen danach im Protokoll nur „Ausführung gestartet“, „Hinweis: Das war doGet …“
   und „Ausführung abgeschlossen“, lief noch doGet: Auswahl wie in Punkt 1 ändern, noch einmal ausführen.)
3. Es erscheint „Autorisierung erforderlich“ → **Berechtigungen prüfen** → das private Konto wählen.
4. Falls die Warnung **„Google hat diese App nicht überprüft“** kommt: unten links **„Erweitert“** →
   **„Zu HOLY Live-Abstimmung wechseln (unsicher)“**.
5. Im nächsten Fenster **„Zulassen“** (stehen dort Kästchen: alle anhaken, dann „Weiter“).
6. Unten im **Ausführungsprotokoll** stehen drei Zeilen: „Blatt „Stimmen“ ist bereit …“, die Formate der Spalten
   und „Textschutz-Probe bestanden …“ (genauer Wortlaut: Abschnitt „Skript aktualisieren“, Punkt 3). Zurück im
   **Browser-Tab der Tabelle** (nicht im Editor) gibt es jetzt unten links den Reiter **„Stimmen“**: das Blatt
   mit der Kopfzeile und 5000 leeren Zeilen.

**Warum die Warnung?** Google zeigt sie bei jedem selbst geschriebenen Skript, das Google nicht geprüft
hat. Diese Prüfung braucht nur, wer eine App an viele fremde Menschen verteilt. Hier sind Autor und
einziger Nutzer dieselbe Person, der Code liegt offen im Repository, und er darf nur auf diese eine Tabelle
zugreifen (`@OnlyCurrentDoc`) – nicht auf Mails, Drive oder andere Dateien. „Unsicher“ heißt hier nur:
„nicht von Google geprüft“.

## Schritt 5 – Als Web-App bereitstellen (2 Min.)

1. Oben rechts **Bereitstellen → Neue Bereitstellung**.
2. Links neben „Typ auswählen“ das **Zahnrad** → **Web-App**.
3. Ausfüllen:
   - **Beschreibung:** `Live-Abstimmung v1`
   - **Ausführen als:** **Ich** (die eigene Gmail-Adresse)
   - **Wer hat Zugriff:** **Jeder**
4. **Bereitstellen**. (Fragt Google noch einmal nach der Berechtigung: wie in Schritt 4.)
5. Im Fenster steht die **Web-App-URL** – sie beginnt mit `https://script.google.com/macros/s/` und endet
   auf **`/exec`**. **Kopieren** klicken, dann „Fertig“.

Englische Oberfläche: Deploy → New deployment → Web app → Execute as: **Me** → Who has access: **Anyone**.

**Warum „Ausführen als: Ich“?** Das Skript schreibt mit den Rechten des eigenen Kontos in die eigene
Tabelle. Das Publikum bekommt dadurch **keinen** Zugriff auf die Tabelle – die bleibt privat und wird
nicht freigegeben.

**Warum „Zugriff: Jeder“?** Das Publikum soll ohne Google-Konto und ohne Anmeldung abstimmen. Mit
„Nur ich“ oder „Jeder mit Google-Konto“ sähen die Handys eine Google-Anmeldung statt der Abstimmung.
„Jeder“ bedeutet nur: Jeder darf die Web-App **aufrufen**. Sie nimmt eine Stimme an oder gibt die
**Stimmenzahlen** heraus (z. B. `[3, 1, 7, 0, 2]`) – keine Zeilen, keine Geräte-IDs, nichts aus dem
Konto. Löschen kann über die Web-App niemand etwas.

## Schritt 6 – Adresse eintragen (1 Min.)

Die kopierte URL in `../marke.js` bei `umfragen.tier.liveQuelle` eintragen (in einfachen Anführungszeichen,
Komma am Ende):

```js
liveQuelle: 'https://script.google.com/macros/s/AKfy…/exec',
```

Oder die URL **an Claude schicken** – Claude trägt sie ein, prüft die Web-App und lädt die Änderung auf
GitHub hoch. Die Abstimmseite liegt auf GitHub Pages und liest dieselbe `marke.js`: Die URL muss also
**auf GitHub** und **auf dem Präsentationsrechner** stehen.

**Selbst auf GitHub ändern (ohne Git):**
1. <https://github.com/YannickOderSo/Unternehmens-Kommunikation/blob/master/fallstudie-1-brand-persona/praesentation/marke.js>
   öffnen (angemeldet).
2. Rechts oben über dem Code das **Stift-Symbol** („Edit this file“).
3. Mit Strg+F `liveQuelle:` suchen, die URL zwischen die Anführungszeichen setzen. Nichts anderes ändern.
4. Rechts oben **„Commit changes…“** → im Fenster noch einmal **„Commit changes“**.
5. Dieselbe Zeile in der `marke.js` auf dem Präsentationsrechner ändern (oder den Ordner neu herunterladen).

**Kontrolle auf dem Handy** (nach 2–10 Minuten – so lange braucht GitHub Pages):
<https://yannickoderso.github.io/Unternehmens-Kommunikation/fallstudie-1-brand-persona/praesentation/abstimmen.html?u=tier>
öffnen. Es müssen die **fünf Tiere** erscheinen. Steht dort „Die Abstimmung ist gerade nicht geöffnet“:
noch etwas warten und neu laden; bleibt es so, steht die URL noch nicht auf GitHub (oder endet nicht auf
`/exec`).

Die URL steht damit öffentlich im Repository. Das ist nötig (die Abstimmseite braucht sie) und vertretbar:
Wer sie kennt, kann nur abstimmen oder Zahlen lesen.

## Schritt 7 – Testen (5 Min.)

**Im Browser, in einem privaten Fenster** (Chrome: **Strg+Umschalt+N**) – so sieht es das Publikum.
Wichtig: Im normalen Fenster ist man bei Google angemeldet; dann funktioniert die Web-App auch mit einer
falschen Einstellung bei „Wer hat Zugriff“, und der Fehler fiele erst im Hörsaal auf. `<URL>` jeweils durch
die Web-App-URL ersetzen:

| Test | Adresse | Erwartet |
|---|---|---|
| Stand lesen | `<URL>?aktion=stand&umfrage=tier&runde=probe&anzahl=5` | `{"ok":true,"werte":[0,0,0,0,0],"n":0,"zeit":"…"}` |
| Teststimme (Chamäleon) | `<URL>?aktion=stimme&umfrage=tier&runde=probe&option=2&anzahl=5&geraet=test-laptop-1` | `{"ok":true}` und eine neue Zeile im Blatt „Stimmen“ |
| Umentscheiden (Adler) | dieselbe Adresse mit `option=0` | `{"ok":true}`; danach die Stand-Adresse (1. Zeile) neu laden: `"werte":[1,0,0,0,0]`, `"n":1` – nicht 2 |
| Stand wie Folie 08 (Zeitfenster) | `<URL>?aktion=stand&umfrage=tier&runde=probe&anzahl=5&minuten=30` | `{"ok":true,"werte":[1,0,0,0,0],"n":1,"zeit":"…","minuten":30}` – fehlt `"minuten":30`, läuft eine alte Fassung („Skript aktualisieren“) |

Kommt im privaten Fenster eine **Google-Anmeldung** statt `{"ok":…}`: Schritt 5, „Wer hat Zugriff“ auf
**Jeder** stellen (Bereitstellungen verwalten → Bearbeiten → Neue Version → Bereitstellen).

Option = Nummer des Tiers ab 0: 0 Adler · 1 Löwe · 2 Chamäleon · 3 Papagei · 4 Schwan (bis 22.10.2026: 3 Fuchs).

**Mit dem Handy** (am besten über **mobile Daten**, nicht WLAN – so wie das Publikum):

1. Auf dem Laptop die Präsentation öffnen (GitHub Pages oder lokal) und zu **Folie 08** gehen.
2. QR-Code mit dem Handy scannen, ein Tier antippen → Bestätigung auf dem Handy.
3. Nach wenigen Sekunden bewegt sich der Balken auf der Folie.
4. Auf dem Handy umentscheiden → der Balken wandert, die Zahl der Stimmen bleibt gleich.
5. Mindestens ein Handy nehmen, das **nicht bei Google angemeldet** ist (iPhone mit Safari oder ein
   Inkognito-Tab), möglichst iPhone und Android, aus der **letzten Reihe**.

Alle Teststimmen landen in der Runde **„probe“** und zählen im Vortrag nicht mit.

**Lasttest** (nach jedem Aktualisieren des Skripts und bei der Generalprobe, je 1 Min.): Ob Google alle
Stimmen annimmt, die fast in derselben Sekunde kommen, lässt sich ohne echten Test nicht sagen. Im Raum sind
**höchstens ca. 20 Personen** (Yannick, 20.10.2026) – also `--anzahl 20`; der Standard (40) gibt Reserve. Auf einem
Rechner mit Node.js im Ordner `praesentation/`:

```bash
node werkzeuge/live-abstimmung-test.mjs --lasttest <URL>
node werkzeuge/live-abstimmung-test.mjs --lasttest <URL> --anzahl 20      # unsere Gruppe (höchstens ca. 20)
node werkzeuge/live-abstimmung-test.mjs --lasttest <URL> --verteilt 10    # 40 Stimmen über 10 s verteilt
```

Eine Messung ist nur eine Stichprobe: mindestens **zweimal** laufen lassen (`--anzahl 20`).
Messung 20.10.2026 mit der **alten** Fassung und 20 Handys: alle 20 gezählt, aber 6 warteten über 15 s (längste
20,8 s) – deshalb lohnt das Aktualisieren.

Das spielt 40 (bzw. mit `--anzahl` so viele) Handys nach, die gleichzeitig in eine eigene Runde „lasttest-…“ abstimmen (zählt weder
in „probe“ noch im Vortrag). Jedes verhält sich wie die Abstimmseite: Wird eine Stimme abgelehnt oder bleibt die
Antwort 15 s aus, versucht es das Handy nach 1,5–4 s von selbst noch einmal – **insgesamt höchstens drei
Versuche** (zwei automatische Wiederholungen). Dazu fragt eine „Folie“ alle 2 s den Stand ab wie Folie 08 (nur
lesend). Vorher fragt der Test, welche Fassung des Skripts läuft. Die Ausgabe sieht so aus (… = gemessene Werte):

```
Skript-Fassung der Web-App: 20.10.2026
angenommen im 1. Versuch: … · nach Wiederholung: … · endgültig gescheitert: … (von 40)
Zeit bis „Danke“: Median … · 90 % … · längste … · über 15,0 s: …
Fehlversuche (wiederholt oder endgültig): … (Gründe, z. B. „Gerade kommen sehr viele Stimmen …“)
Anfragen insgesamt: … · alle Handys fertig nach …
Folie (Stand alle 2 s wie Folie 08, minuten=30): … Abfragen, Antwortzeit Median … · längste … · „offline“: …
Stand der Runde: n = …
Stand wie Folie 08 (minuten=30): n = …
Gegenprobe Zeitfenster: warte … (keine neue Stimme), dann Stand mit minuten=1 …
Gegenprobe (minuten=1, mindestens 90,0 s nach der letzten Stimme): n = 0 – richtig
BESTANDEN …  oder  GEZÄHLT, ABER ZU LANGSAM …  oder  NICHT BESTANDEN …
```

Die **Gegenprobe** (seit 21.10.2026) wartet gegen die echte Web-App bis zu 90 Sekunden ohne neue Stimme – der
Lasttest dauert dadurch etwas länger. So prüft er die Uhrzeit in der Tabelle in **beiden** Richtungen: Mit
`minuten=30` müssen alle eben abgegebenen Stimmen zählen (sonst steht die Zeit zu früh), mit `minuten=1` nach
90 Sekunden keine mehr (sonst steht sie zu spät, und Stimmen zählten länger als 30 Minuten).

- **BESTANDEN:** alle Stimmen gezählt, kein Handy musste selbst noch einmal tippen, und jedes sah „Danke“ nach
  höchstens 15 s. „Nach Wiederholung“ ist dabei in Ordnung – das Publikum sieht dann nur kurz den Hinweis
  „Gerade stimmen viele ab – Ihre Stimme wird gesendet …“.
- **Zeit bis „Danke“:** So lange wartet ein Handy vom Tippen bis zur Bestätigung. Ziel: die meisten nach wenigen
  Sekunden, keines nach mehr als 15 s.
- **GEZÄHLT, ABER ZU LANGSAM:** alle Stimmen kamen an, aber einige Handys warteten länger als 15 s.
- **NICHT BESTANDEN:** Handys sind endgültig gescheitert (sie sähen „Das hat nicht geklappt“ mit „Nochmal
  versuchen“) oder es fehlen Stimmen.
- In beiden Fällen: Ausgabe kopieren und an Claude schicken. Im Vortrag dann zur Ruhe aufrufen („bitte
  nacheinander“) oder Plan C.
- Steht oben „Skript-Fassung … keine Angabe“ oder „ACHTUNG“ bzw. am Ende „FASSUNG VERALTET“: Es läuft noch eine
  alte Fassung (erwartet: 20.10.2026) – erst „Skript aktualisieren“ (unten), dann den Lasttest wiederholen.
- „ZEITFENSTER FEHLT“: Die Web-App kennt das Zeitfenster nicht (alte Fassung). „ZEITFENSTER FALSCH (Zeit zu
  früh)“: Mit `minuten=30` zählt sie weniger als die eben abgegebenen Stimmen. „ZEITFENSTER FALSCH (Zeit zu
  spät)“: Mit `minuten=1` zählen nach 90 Sekunden noch alle. In beiden Fällen stimmt die Uhrzeit in der Tabelle
  nicht (Ausgabe an Claude schicken; bis zur Klärung `gueltigMinuten: 0` in `marke.js`, dann ohne Zeitgrenze).
  „ZEITFENSTER UNKLAR“ oder „UNGEPRÜFT“: Lasttest wiederholen.
- **Bei „FASSUNG VERALTET“ und jedem „ZEITFENSTER …“ gilt der Test als nicht bestanden** (Exit-Code 1): Die
  Urteilszeile beginnt dann mit „NICHT BESTANDEN wegen Fassung“ bzw. „… wegen Zeitfenster“; dahinter steht nur
  noch das Urteil der Belastbarkeit allein (z. B. „Belastbarkeit allein: BESTANDEN …“).
- Zeigt die Zeile „Folie“ „offline“, hätte die Leinwand im Andrang kurz „offline“ gezeigt (die Werte bleiben
  dabei stehen).

Ohne Node.js: die URL an Claude schicken und um den Lasttest bitten. Danach dürfen die Zeilen der Runde
„lasttest-…“ im Blatt gelöscht werden – **wenn gerade niemand abstimmt** (siehe „Wichtig zu wissen“).

---

## Skript aktualisieren (neue Fassung)

Für: Yannick, wenn `apps-script.gs` auf GitHub neuer ist als das Skript im Apps-Script-Editor. Dauer: ca. 5 Minuten.
Die **Web-App-URL bleibt gleich** – an `marke.js` ändert sich nichts, auch nicht auf GitHub.

**Was ist neu (Fassung 20.10.2026)?** Bei Google läuft (Stand 20.10.2026) noch die Fassung von vor dem 19.10.2026.
Die neue bringt zwei Dinge:

- **Zeitfenster (neu am 20.10.2026, Auftrag Yannick):** Folie 08 fragt mit `minuten=30` und zählt je Handy nur die
  letzte Stimme, wenn sie höchstens 30 Minuten alt ist (`../marke.js → umfragen.tier.gueltigMinuten`). So stehen im
  Vortrag keine alten Stimmen da. Die alte Fassung kennt das nicht und zählt ohne Zeitgrenze – **das Zeitfenster
  wirkt erst nach diesem Abschnitt.** Die Zeilen bleiben in der Tabelle, gelöscht wird nichts.
- **Lastfest (seit 19.10.2026):** Bisher wartete jede Stimme, bis die vorige fertig geschrieben war (rund 0,5 s je
  Stimme). Beim Lasttest am 19.10.2026 kamen so nur 19 von 40 gleichzeitigen Stimmen durch, am 20.10. warteten 6
  von 20 Handys über 15 s. Jetzt holt sich jede Stimme nur kurz eine eigene Zeilennummer und schreibt dann
  gleichzeitig mit den anderen. Warum nicht einfach `appendRow` ohne Wartesperre: Die Google-Dokumentation sichert
  nicht zu, dass gleichzeitige `appendRow` nie dieselbe Zeile treffen – Einzelheiten im Kopf von `apps-script.gs`.

Vorher müssen die Änderungen auf GitHub sein (Commit und Push) – sonst zeigt der Link in Punkt 1 die alte Fassung.

1. **Neuen Code kopieren:** Diese Adresse öffnen – es erscheint nur der Code als Text:
   <https://raw.githubusercontent.com/YannickOderSo/Unternehmens-Kommunikation/master/fallstudie-1-brand-persona/praesentation/live-abstimmung/apps-script.gs>
   Kontrolle: Mit **Strg+F** nach `ZEITFENSTER (Fassung vom 20.10.2026)` suchen. Kein Treffer = noch eine alte
   Fassung: 5 Minuten warten, dann **Strg+F5** (neu laden). Mit Treffer: in den Text klicken, **Strg+A** (alles
   markieren), **Strg+C** (kopieren).
2. **Code ersetzen:** Die Tabelle „HOLY Live-Abstimmung“ öffnen → **Erweiterungen → Apps Script**. Links auf
   **Code.gs** klicken, dann in den Code klicken: **Strg+A**, **Entf**, **Strg+V**, **Strg+S** (speichern).
   Kontrolle: Die erste Zeile ist `/**`, darunter steht `@OnlyCurrentDoc`.
3. **„einrichten“ ausführen:** In der Leiste über dem Code auf das **Auswahlfeld rechts neben „Debuggen“**
   klicken – dort steht **„doGet“**. In der Liste **„einrichten“** anklicken; im Feld steht jetzt „einrichten“.
   Dann **Ausführen**. Fragt Google nach einer Berechtigung: wie in Schritt 4 zulassen. Unten im
   **Ausführungsprotokoll** müssen drei Zeilen stehen (statt „(Zahl)“ stehen dort Zahlen):
   - `Blatt „Stimmen“ ist bereit. Gespeicherte Stimmen: (Zahl). Nächste Stimme in Zeile (Zahl), (Zahl) leere Zeilen vorbereitet.`
   - `Formate (Zeit | Runde | Umfrage | Option | Geraet): dd.mm.yyyy hh:mm:ss | @ | @ | 0 | @`
   - `Textschutz-Probe bestanden: „2026-10-26“, „true“ und „12345678“ bleiben Text.`

   Was das heißt: Das Skript hat 5000 leere Zeilen vorbereitet und die Spalten „Runde“, „Umfrage“ und
   „Geraet“ als Text formatiert (@ = Text). Dann hat es in die letzte Zeile probeweise Werte geschrieben, die
   Google sonst in ein Datum, einen Wahrheitswert oder eine Zahl umwandeln würde, nachgesehen und wieder
   gelöscht. Die Zahl hinter „Nächste Stimme in Zeile“ **merken** (für Punkt 5).
   Steht dort **„WARNUNG“** oder eine rote Fehlermeldung: Text kopieren und an Claude schicken.
   Stehen dort nur „Ausführung gestartet“, „Hinweis: Das war doGet …“ und „Ausführung abgeschlossen“, lief noch
   doGet: Auswahl auf „einrichten“ ändern, noch einmal **Ausführen**.
4. **Neue Version bereitstellen:** Oben rechts **Bereitstellen → Bereitstellungen verwalten** → links ist die
   vorhandene Bereitstellung ausgewählt → oben das **Stift-Symbol (Bearbeiten)** → bei „Version“ **Neue Version**
   wählen → **Bereitstellen** → „Fertig“. Die URL bleibt gleich. **Nicht** „Neue Bereitstellung“ – das gäbe eine
   neue URL. Ohne diesen Schritt läuft im Hörsaal weiter die alte Fassung – ohne Zeitfenster.
5. **Kurz prüfen** (im privaten Fenster, `<URL>` = Web-App-URL wie in Schritt 7). Teststimme und Stand laufen in
   einer **eigenen Runde `kurzpruefung-2010`** – dann stören weder Probestimmen noch andere Tests, und die Zahlen
   sind genau (wer die Kurzprüfung wiederholt: neue Runde, z. B. `kurzpruefung-2010b`):
   - **Läuft die neue Fassung?** `<URL>?aktion=fassung` → `{"ok":false,"fehler":"Unbekannte Aktion – … (Skript-Fassung 20.10.2026)"}`.
     Das „ok“:false ist hier richtig: Es gibt keine solche Aktion, die Antwort nennt nur die Fassung. Steht dort
     eine ältere Fassung (z. B. 19.10.2026) oder fehlt „(Skript-Fassung …)“, läuft noch die alte → Punkt 4
     wiederholen (einige Sekunden warten, neu laden).
   - **Zeitfenster da?** `<URL>?aktion=stand&umfrage=tier&runde=kurzpruefung-2010&anzahl=5&minuten=30` →
     `{"ok":true,"werte":[0,0,0,0,0],"n":0,"zeit":"…","minuten":30}` – `"minuten":30` am Ende heißt: Das
     Zeitfenster wirkt.
   - Teststimme mit einer **neuen** Geräte-ID aus Datum und Uhrzeit, z. B. am 21.10. um 14:15:
     `<URL>?aktion=stimme&umfrage=tier&runde=kurzpruefung-2010&option=2&anzahl=5&geraet=test-2110-1415` → `{"ok":true}`.
   - Zurück in den **Browser-Tab der Tabelle** „HOLY Live-Abstimmung“ (nicht der Editor) → unten links der Reiter
     **„Stimmen“**. In der Zeile, die das Protokoll in Punkt 3 nannte („Nächste Stimme in Zeile …“), steht
     jetzt `kurzpruefung-2010`, `tier`, `2`, `test-2110-1415`, in Spalte A die **Uhrzeit von eben**. Hinkommen: in
     Spalte A klicken und **Strg+↓** (springt zur nächsten gefüllten Zelle; bei einer Lücke noch einmal).
   - **Zeit zu früh?** Die Stand-Adresse mit `&minuten=30` noch einmal laden: `"n":1`. Bleibt es bei `"n":0`
     (ohne `&minuten=30` aber `"n":1`), steht die Zeit in der Tabelle zu früh – frische Stimmen fielen heraus.
   - **Zeit zu spät?** Mindestens **2 Minuten** warten, dann dieselbe Adresse mit `&minuten=1` statt
     `&minuten=30` laden: `"n":0` – die Teststimme ist älter als 1 Minute. Steht dort `"n":1`, steht die Zeit in
     der Tabelle zu spät – Stimmen zählten dann länger als 30 Minuten.
   - Geht eine der beiden Proben schief: Antwort an Claude schicken und bis zur Klärung in `../marke.js`
     `gueltigMinuten: 0` setzen – auf GitHub und auf dem Präsentationsrechner (ohne Zeitgrenze, wie bisher).
   Die Zeile der Runde `kurzpruefung-2010` stört nicht (sie zählt weder in „probe“ noch im Vortrag); löschen ist
   erlaubt, wenn gerade niemand abstimmt.
6. **Lasttest** laufen lassen (Schritt 7, Ende) – oder Claude darum bitten. Er erwartet die Fassung 20.10.2026 und
   prüft das Zeitfenster in beiden Richtungen mit (Gegenprobe, dauert dafür bis zu 90 Sekunden länger).

Wichtig: Skript aktualisieren („einrichten“, „Neue Version“) **nicht während einer laufenden Abstimmung** –
„einrichten“ fügt Zeilen an und schreibt eine Probezeile, und die alte Fassung schrieb anders als die neue.

---

## Vor dem Vortrag: Runde umstellen

Die Generalprobe läuft mit `runde: 'probe'`. Danach – **spätestens am Vortag** (Mo, 26.10.; Generalprobe So, 25.10.; Vortrag Di, 27.10.) – in
`../marke.js` umstellen:

```js
runde: 'vortrag-2026-10-27',
```

Damit startet Folie 08 im Vortrag bei null; die Probestimmen bleiben in der Tabelle, zählen aber nicht.
Auch die Zahlen im Browser-Speicher des Präsentationsrechners gehören zur Runde: Werte aus der
Generalprobe (Stimmen oder von Hand gezählt) zeigt Folie 08 in der neuen Runde nicht mehr.
Die Änderung muss **auf GitHub** (für die Abstimmseite; wie in Schritt 6, Zeile `runde:`) **und** auf dem
Präsentationsrechner stehen. Früh umstellen, weil Browser alte Dateien eine Weile zwischenspeichern.

**Kontrolle – beide Stellen:**
1. **GitHub:** <https://yannickoderso.github.io/Unternehmens-Kommunikation/fallstudie-1-brand-persona/praesentation/marke.js?v=1>
   öffnen (die Zahl hinter `?v=` bei jedem Versuch ändern, sonst kommt eine alte Fassung), Strg+F `runde`:
   Dort muss `'vortrag-2026-10-27'` stehen. Sonst zählen die Handys weiter in „probe“ – und Folie 08 zeigt
   „Live“ mit `n = 0`, ohne dass sich im Vortrag etwas bewegt. Dann Strg+F `gueltigMinuten`: Dort muss `30`
   stehen, wie auf dem Präsentationsrechner. Sonst rechnen Handys und Folie mit verschiedenen Zeitfenstern – ein
   Handy zeigt dann „Danke“, obwohl Folie 08 seine Stimme nicht mehr zählt (oder umgekehrt).
2. **Präsentationsrechner:** Folie 08 zeigt „Live“ und `n = 0`; die Maus auf der Pille zeigt
   „Runde „vortrag-2026-10-27““ und „zählt Stimmen der letzten 30 Min.“ (steht dort „OHNE Zeitfenster“: „Skript
   aktualisieren“ fehlt noch). Diese Werte gelten 30 Minuten; betritt man Folie 08 im Vortrag später, stehen bis
   zur ersten Antwort der Web-App Nullen da – keine Beispieldaten.
3. Ohne Stimme: `<URL>?aktion=stand&umfrage=tier&runde=vortrag-2026-10-27&anzahl=5` zeigt `"n":0`.

Wer nach dem Umstellen doch mit dem Handy testet: die Testzeile danach im Blatt „Stimmen“ löschen (mit
der rechten Maustaste auf die Zeilennummer **links** klicken → „Zeile löschen“). Löschen und Sortieren
sind erlaubt – aber nur, **wenn gerade niemand abstimmt**. Das Zeitfenster hilft hier nur teilweise: Eine
Teststimme in der neuen Runde zählt auf Folie 08 noch 30 Minuten lang – also auch im Vortrag, wenn sie kurz
vorher abgegeben wurde.

Bedienung der Folie im Vortrag (Pille „Live“, Werte eintippen, Zählmodus): `../LIESMICH.md`, Abschnitt 6.

## Im Vortrag

- Die Web-App läuft von allein, nichts muss gestartet werden. Der Präsentationsrechner braucht Internet.
- Kommen viele Stimmen auf einmal, zeigen manche Handys kurz „Gerade stimmen viele ab – Ihre Stimme wird
  gesendet …“ und senden selbst noch einmal. Nichts tun.
- Zeigt ein Handy danach eine Fehlermeldung: **einfach noch einmal tippen**. Doppelt zählt nichts – je Handy
  gilt die letzte Stimme.
- **Zeitfenster:** Folie 08 zählt nur Stimmen der letzten **30 Minuten** (nach „Skript aktualisieren“). Für die
  Abstimmung im Vortrag (rund eine Minute) ändert das nichts; es hält nur ältere Stimmen (Generalprobe in derselben
  Runde, Tests) von der Leinwand fern. Wer vor mehr als 30 Minuten abgestimmt hat, sieht auf dem Handy wieder die
  Tiere und kann neu abstimmen (zählt einmal).
- Wer in der Fragerunde zu Folie 08 zurückspringt: Die Stimmen stehen noch da, solange sie jünger als 30 Minuten
  sind.
- Im Blatt „Stimmen“ während der Abstimmung **nichts löschen, sortieren oder einfügen** (siehe unten).
- Klappt es gar nicht: **Plan C** – Hände zählen und eintippen bzw. per Klick zählen (LIESMICH, Abschnitt 6).
  Zahlen aus der Generalprobe (Runde „probe“) zeigt Folie 08 dabei nie; stehen noch die gekennzeichneten
  Beispielwerte da, setzt die erste Handstimme alles auf 0.

## Nach dem Vortrag

1. **Ergebnis sichern – gleich nach dem Vortrag:** Folie 08 fotografieren oder die Zahlen notieren, dazu
   (innerhalb von 30 Minuten) `<URL>?aktion=stand&umfrage=tier&runde=vortrag-2026-10-27&anzahl=5&minuten=30`
   speichern (Strg+S oder Bildschirmfoto). **Maßgeblich ist dieser Stand** – er zählt genau das, was Folie 08
   gezeigt hat. Nach 30 Minuten zeigt Folie 08 die Stimmen nicht mehr (Zeitfenster); sie bleiben aber in der
   Tabelle. Die Stand-Adresse **ohne** `minuten` zählt später alle Stimmen der Runde – auch Teststimmen, die vor
   dem Vortrag in `vortrag-2026-10-27` abgegeben wurden und auf Folie 08 schon nicht mehr zählten; ihr `n` kann
   also größer sein. Genauer: die Tabelle herunterladen (Datei → Herunterladen) und nur die Zeilen der Runde
   `vortrag-2026-10-27` aus dem Vortragszeitraum (Spalte „Zeit“) zählen – je Geräte-ID die letzte. Quelle z. B.
   „eigene Live-Umfrage im Hörsaal, 27.10.2026, n = …“.
2. **Web-App abschalten:** Apps Script → **Bereitstellen → Bereitstellungen verwalten** → die Bereitstellung
   auswählen → **Archivieren**. Danach nimmt die URL nichts mehr an.
3. In `../marke.js` `liveQuelle: ''` setzen (dann zeigt Folie 08 wieder nur den Zählmodus).
4. **Tabelle:** löschen (Google Drive → Papierkorb → endgültig löschen) **oder** behalten, bis die
   Bewertung feststeht. Sie enthält keine personenbezogenen Daten. Sparsamer ist trotzdem: nach dem
   Sichern der Ergebnisse die Spalte „Geraet“ löschen oder die ganze Tabelle.

---

## Wichtig zu wissen

- **Skript geändert? Abschnitt „Skript aktualisieren“:** Code einfügen, „einrichten“ ausführen, dann
  Bereitstellen → **Bereitstellungen verwalten** → Stift (**Bearbeiten**) → bei „Version“ **Neue Version** →
  **Bereitstellen**. Sonst bleibt die alte Fassung aktiv. Die URL bleibt dabei gleich. **Nicht** „Neue
  Bereitstellung“ wählen – das erzeugt eine neue URL.
- **Nicht ändern:** den Blattnamen „Stimmen“, die Reihenfolge der Spalten und die Skript-Eigenschaft
  „naechsteZeile“ (Apps Script → Projekteinstellungen); während einer Abstimmung auch nicht die Zeitzone der
  Tabelle (Datei → Einstellungen) – das Zeitfenster rechnet mit der Uhrzeit in Spalte „Zeit“.
- **Zeitfenster (seit Fassung 20.10.2026):** Folie 08 fragt mit `minuten=30` (`../marke.js →
  umfragen.tier.gueltigMinuten`). Gezählt wird je Handy die **letzte** Stimme – aber nur, wenn sie höchstens 30
  Minuten alt ist. Wer sich kurz vor Ablauf umentscheidet, zählt mit der neuen Wahl weiter; eine ältere Stimme
  rückt nie nach. Gelöscht wird nichts; ohne `minuten` (z. B. die Stand-Adresse aus Schritt 7) zählt alles wie
  bisher. Auch die auf dem Präsentationsrechner gespeicherten Zahlen von Folie 08 gelten nur 30 Minuten (danach
  beim Neuladen oder Betreten der Folie: Nullen, bis die Web-App antwortet – keine Beispielwerte), und ein Handy
  zeigt nach 30 Minuten wieder die Tiere. Länger oder
  kürzer: `gueltigMinuten` in `marke.js` ändern (1 bis 1440, **auf GitHub und auf dem Präsentationsrechner**);
  `0` = ohne Zeitgrenze. Die Runde bleibt trotzdem nötig: Sie trennt Probe und Vortrag ganz. Die alte Fassung
  ohne Zeitfenster erkennt man an der Pille von Folie 08 (Maus darauf: „OHNE Zeitfenster“).
- **Zeilen löschen, sortieren oder einfügen nur, wenn gerade niemand abstimmt** – ebenso „einrichten“ und
  „Neue Version“. Grund: Jede Stimme reserviert zuerst ihre Zeile und schreibt erst danach. Rutscht in dieser
  Zeit eine andere Stimme in die reservierte Zeile (Löschen oder Sortieren verschiebt Zeilen), würde sie still
  überschrieben. Filtern verschiebt nichts und geht immer.
- **Lücke im Blatt:** Nach dem Löschen vieler Zeilen (z. B. Lasttest) landen neue Stimmen hinter einer leeren
  Lücke – das stört nicht. „einrichten“ schließt sie absichtlich nicht: Es setzt die Zeilennummer nie zurück,
  denn eine doppelt vergebene Zeile wäre schlimmer als eine Lücke. Eingefügte Zeilen überschreibt das Skript
  nicht: Es prüft, ob die Zeile leer ist, bevor es schreibt.
- **Viele Stimmen auf einmal (Lasttest in Schritt 7):** Google nennt **30 gleichzeitige Ausführungen** je
  Nutzer und ein nicht beziffertes Limit für zu viele Starts pro Sekunde
  (<https://developers.google.com/apps-script/guides/services/quotas>, abgerufen 19.10.2026). Wie beides bei
  einer Web-App mit „Ausführen als: Ich“ greift, ist nicht dokumentiert. Beim Lasttest am 19.10.2026 (40
  Stimmen) trat keine Kontingent-Meldung auf. Würde Google eine Anfrage abbrechen, bekäme das Handy vermutlich
  eine Fehlerseite statt einer Antwort (nicht geprüft). Jede Stimme wartet nur kurz auf ihre Zeilennummer
  (höchstens 8 s, sonst „Gerade kommen sehr viele Stimmen …“) und schreibt dann gleichzeitig mit den anderen.
  In allen Fällen versucht es die Abstimmseite nach einer kurzen Pause von selbst noch einmal (insgesamt
  höchstens drei Versuche). Folie 08 fragt nur alle 2 s (eine Ausführung, ohne Warten).
- **Missbrauch:** Wer die URL kennt, kann auch von außerhalb des Hörsaals abstimmen – URL und Runde
  stehen öffentlich in `marke.js`. Eine neue Runde (z. B. `vortrag-2026-10-27-b`, überall gleich) hilft
  gegen Probestimmen und alte offene Tabs, **nicht** gegen gezielte Manipulation: Die Abstimmseite lädt
  die neue Runde ja selbst. Dagegen hilft im Vortrag nur Plan C (Handzeichen, LIESMICH Abschnitt 6) oder
  das Archivieren der Bereitstellung. Danach Spam-Zeilen im Blatt löschen – jede Zeile verlangsamt jede
  Stand-Abfrage, auch in anderen Runden.
- **Datenschutz:** Das Skript speichert keine IP-Adressen. Google und GitHub sehen beim Aufruf technisch
  die Verbindung, wie bei jeder Webseite – das sagt der Fuß der Abstimmseite dem Publikum. Die Tabelle
  bleibt privat im eigenen Konto.

## Wenn etwas nicht klappt

| Was man sieht | Ursache | Lösung |
|---|---|---|
| Google-Anmeldung oder „Zugriff verweigert“ beim Aufruf der URL | Zugriff steht nicht auf „Jeder“ | Bereitstellungen verwalten → Bearbeiten → Wer hat Zugriff: **Jeder** → Neue Version → Bereitstellen |
| Laptop zeigt „Live“, Handys melden „Das hat nicht geklappt – Die Abstimmung ist gerade nicht erreichbar“ | Zugriff steht nicht auf „Jeder“ (der angemeldete Laptop merkt es nicht) oder Web-App archiviert | Test-Adressen im **privaten Fenster** öffnen (Schritt 7); Zugriff **Jeder**, Neue Version |
| Handy: „Die Abstimmung ist gerade nicht geöffnet“ | `liveQuelle` (oder `runde`) steht noch nicht auf GitHub, GitHub Pages ist noch nicht aktuell, oder die URL endet nicht auf `/exec` | einige Minuten warten, neu laden; `marke.js` auf GitHub prüfen (Schritt 6, Kontrolle) |
| „Jeder“ gibt es nicht zur Auswahl | Konto einer Organisation (z. B. Hochschule) | mit privatem Gmail-Konto von vorn |
| „Skriptfunktion nicht gefunden: doGet“ | Code nicht eingefügt oder nicht gespeichert | Schritt 3, dann neue Version bereitstellen |
| `{"ok":false,"fehler":"Unbekannte Aktion …"}` | Adresse ohne oder mit falschem `?aktion=` (bei `?aktion=fassung` richtig) | Test-Adressen genau übernehmen |
| `<URL>?aktion=fassung` zeigt keine „(Skript-Fassung …)“ oder eine ältere als 20.10.2026 | alte Fassung läuft noch (ohne Zeitfenster) | „Skript aktualisieren“, Punkt 4 (Neue Version) |
| Protokoll nur „Ausführung gestartet“, „Hinweis: Das war doGet …“, „Ausführung abgeschlossen“ | doGet statt einrichten ausgeführt | Auswahlfeld neben „Debuggen“ auf **einrichten**, Ausführen |
| `{"ok":false,"fehler":"Serverfehler: …"}` | z. B. Skript nicht aus der Tabelle heraus angelegt | Schritte 1–2 wiederholen (Erweiterungen → Apps Script) |
| Fehler mit „Berechtigung“ oder „permission“, obwohl „Zulassen“ geklickt wurde | Einschränkung `@OnlyCurrentDoc` | Funktion „einrichten“ noch einmal ausführen; hilft das nicht: Claude fragen |
| URL endet auf `/dev` | Test-URL, funktioniert nur für den Autor | die Web-App-URL mit **`/exec`** nehmen |
| Änderungen am Skript wirken nicht | alte Version noch aktiv | „Neue Version“ (Abschnitt „Skript aktualisieren“, Punkt 4) |
| Protokoll von „einrichten“: „WARNUNG: Textschutz-Probe nicht bestanden“ | Google wandelt trotz Textformat um (nicht erwartet) | Protokoll an Claude schicken; Stimmen kommen trotzdem an |
| Protokoll von „einrichten“: „Textschutz-Probe übersprungen“ | in der letzten Zeile des Blatts steht etwas | diese Zeile leeren, „einrichten“ noch einmal ausführen |
| Lasttest: „NICHT BESTANDEN“ | zu viele Stimmen auf einmal oder Google langsam | Ausgabe an Claude schicken; im Vortrag „bitte nacheinander“ oder Plan C |
| Lasttest: „GEZÄHLT, ABER ZU LANGSAM“ | alle Stimmen kamen an, einige Handys warteten über 15 s | Ausgabe an Claude schicken; Lasttest wiederholen (Stichprobe) |
| Lasttest: „Skript-Fassung … keine Angabe“, „ACHTUNG“, „FASSUNG VERALTET“ oder „ZEITFENSTER FEHLT“ | alte Fassung läuft noch | „Skript aktualisieren“, dann Lasttest wiederholen |
| Handy zeigt „Gerade stimmen viele ab – Ihre Stimme wird gesendet …“ | Andrang; die Seite sendet selbst noch einmal | nichts tun; erst nach drei Fehlversuchen kommt „Das hat nicht geklappt“ mit „Nochmal versuchen“ |
| Folie 08 zeigt „offline“ | kein Internet am Präsentationsrechner, `liveQuelle` falsch, Web-App archiviert oder sehr langsam (Maus auf der Pille zeigt den Grund) | Klick auf die Pille = sofort neu versuchen; bleibt es: Plan C (LIESMICH, Abschnitt 6); danach URL und Internet prüfen |
| Probestimmen erscheinen im Vortrag | `runde` nicht umgestellt oder alte `marke.js` auf einem Gerät | `runde` auf GitHub und auf dem Präsentationsrechner prüfen („Vor dem Vortrag“, Kontrolle); notfalls Probezeilen löschen |
| Folie 08 zeigt „Live“ und `n = 0`, Handys stimmen ab, nichts bewegt sich | Runde auf GitHub und auf dem Präsentationsrechner verschieden | beide auf `'vortrag-2026-10-27'` (Kontrolle oben) |
| Folie 08 zeigt weniger Stimmen als früher bzw. `n = 0`, obwohl abgestimmt wurde | Die Stimmen sind älter als 30 Minuten (Zeitfenster) – gewollt | nichts; neu abstimmen lassen. Alle Stimmen der Runde: Stand-Adresse ohne `minuten` |
| Maus auf der Pille von Folie 08: „OHNE Zeitfenster“ | bei Google läuft noch eine Fassung vor dem 20.10.2026 | „Skript aktualisieren“; Kontrolle `<URL>?aktion=fassung` → 20.10.2026 |
| Handy zeigt wieder die Tiere statt „Danke“ | die eigene Stimme ist älter als 30 Minuten und zählt nicht mehr | einfach neu tippen (zählt einmal) |
| Lasttest: „ZEITFENSTER FALSCH (Zeit zu früh)“ oder Kurzprüfung: `"n"` steigt nur ohne `&minuten=30` | Uhrzeit in der Tabelle steht früher als die Uhr des Skripts (z. B. Zeitzone) – frische Stimmen fallen heraus | Ausgabe an Claude schicken; bis dahin `gueltigMinuten: 0` in `marke.js` (GitHub und Präsentationsrechner; ohne Zeitgrenze, wie bisher) |
| Lasttest: „ZEITFENSTER FALSCH (Zeit zu spät)“ oder Kurzprüfung: nach 2 Minuten mit `&minuten=1` noch `"n":1` | Uhrzeit in der Tabelle steht später als die Uhr des Skripts – Stimmen zählten länger als 30 Minuten | wie in der Zeile darüber |
| Lasttest: „ZEITFENSTER UNKLAR“ oder „UNGEPRÜFT“ | einzelne Stimmen kamen sehr spät an, oder die Gegenprobe war nicht lesbar | Lasttest wiederholen; bleibt es: Ausgabe an Claude schicken |

**Fehler nachsehen:** Im Apps-Script-Editor links auf **„Ausführungen“** (Liste mit Uhr-Symbol) – dort
steht jeder Aufruf mit Zeit und gegebenenfalls Fehlermeldung.

## Für die Technik: prüfen ohne Google-Konto

Im Ordner `praesentation/` (braucht nur Node.js):

```bash
node werkzeuge/live-abstimmung-test.mjs                  # Prüfungen des Skripts (Exit-Code 0 = bestanden)
node werkzeuge/live-abstimmung-test.mjs --mutationen     # absichtlich kaputte Kopien – jede muss auffallen
node werkzeuge/live-abstimmung-test.mjs --server 8787    # lokale Web-App mit dem echten Skript (Strg+C beendet sie)
node werkzeuge/live-abstimmung-test.mjs --server 8787 --verzoegerung 1500 --stoerung 0.2 --abbruch 0.1 --gleichzeitig 30
                                                         # dasselbe mit Störungen (Wiederholung auf dem Handy testen)
node werkzeuge/live-abstimmung-test.mjs --server 8787 --verzoegerung 800 --sperre 200
                                                         # Belastbarkeit: jede Stimme hält die Sperre 200 ms
node werkzeuge/live-abstimmung-test.mjs --lasttest http://localhost:8787/exec   # Lasttest gegen die lokale Web-App
```

**Zeitfenster lokal testen, ohne 30 Minuten zu warten:** Die lokale Web-App hat eine virtuelle Uhr.
`http://localhost:8787/uhr?vor=31` stellt sie 31 Minuten vor – Folie 08 zeigt die alten Stimmen dann nach 1–2
Sekunden nicht mehr. Die Abstimmseite rechnet mit der Uhr des Browsers: Dort hilft im Test nur Warten (oder ein
Testwerkzeug, das die Uhr vorstellt). Die Prüfungen (`node werkzeuge/live-abstimmung-test.mjs`) stellen die Uhr
selbst vor: Grenze, Umentscheiden kurz vor und nach Ablauf, ungültige `minuten`, ohne `minuten` wie bisher.
Handy und Folie im Browser prüft `node werkzeuge/zeitfenster-e2e.mjs` (braucht playwright-core; mit
`--mutationen` auch absichtlich kaputte Kopien von `js/komponenten.js` und `js/abstimmen.js`; Einzelheiten im
Kopf der Datei und in `../LIESMICH.md`, Abschnitt 6).

Störungen der lokalen Web-App (nur für Stimmen): `--stoerung 0.2` lehnt 20 % mit „Gerade kommen sehr viele
Stimmen …“ ab, `--abbruch 0.1` liefert 10 % eine Fehlerseite (HTTP 200 oder 500) oder schließt die Verbindung
ohne Antwort, `--gleichzeitig 30` gibt ab der 31. gleichzeitigen Anfrage eine Fehlerseite (wirkt nur mit
`--verzoegerung` oder `--sperre`). `--stoerung` und `--abbruch` prüfen die **Wiederholung**, nicht die
Belastbarkeit: Ein Handy scheitert dann rein zufällig mit A hoch 3 (drei Versuche) – bei 0,2 etwa 1 von 125,
bei 0,5 jedes achte. Einzelne „NICHT BESTANDEN“ sind dabei zu erwarten. Die **Belastbarkeit** zeigt nur
`--sperre MS`: Jede Stimme hält die Sperre so lange (bei Google: Sperre holen, Zähler lesen und schreiben,
freigeben – nicht gemessen); wer länger als 8 s warten müsste, bekommt den Andrang-Text. Ohne `--sperre` ist
die Sperre der lokalen Web-App nie besetzt. Die Prüfungen spielen auch gleichzeitige Stimmen nach: Eine zweite
und dritte Stimme startet an jeder Stelle einer laufenden Stimme; zusätzlich prüft die Attrappe die Regeln der
Google-Referenz zu Lock (z. B. Zähler in derselben Sperre lesen und schreiben).

Folie 08 mit festem Stand, ganz ohne lokale Web-App: `node werkzeuge/pruefen.mjs index.html --nur f08 --schritte
--live-werte 3,1,7,0,2` (Prüfwerkzeug, `../AUTOREN.md` Abschnitt 9). Prüfwerkzeug und Exporte fragen die echte
Web-App nie ab.

Dann `marke.js` **nicht** ändern, sondern die Adresse mit `?quelle=` übergeben und die Dateien im Browser öffnen
(als Datei oder über localhost – auf GitHub Pages wird `?quelle=` ignoriert):

| Was | Adresse |
|---|---|
| Folie 08 | `index.html?quelle=http://localhost:8787/exec#f08` |
| Referentenfenster | `index.html?referent&quelle=http://localhost:8787/exec#f08` (Taste P gibt `?quelle` nicht weiter) |
| Abstimmseite | `abstimmen.html?u=tier&quelle=http://localhost:8787/exec` – jeder weitere Browser bzw. jedes private Fenster zählt als eigenes Handy |

Eine `liveQuelle` auf `localhost` in `marke.js` nimmt die Abstimmseite absichtlich nicht an („noch nicht
freigeschaltet“). Der QR-Code auf der Folie zeigt auch in diesem Test auf GitHub Pages; echte Handys erreichen
den Laptop so nicht. Für die Generalprobe mit Handys braucht es die echte Web-App (Schritt 7).

Die Schnittstelle (Parameter, Antworten, Prüfung der Eingaben) steht im Kopf von `apps-script.gs`.
