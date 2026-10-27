// Erzeugt die schriftlichen Fragebögen (Word) für die zwei Praxisbefragungen.
// Aufruf aus dem Repo-Stammordner: NODE_PATH=$(npm root -g) node fuehrung/befragung/erzeugen.js
// Fragen ändern: unten im Abschnitt FRAGEN · Personen/Vertiefung: im Abschnitt PERSONEN.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, HeightRule, CheckBox, LevelFormat, Footer, PageNumber, VerticalAlign
} = require('docx');

const ORDNER = __dirname;
const RUECKGABE = 'Donnerstag, 29.10.2026, 12:00 Uhr';

/* ─────────────────────────── PERSONEN ─────────────────────────── */
const PERSONEN = [
  {
    datei: 'fragebogen-simpleact.docx',
    fuer: 'Kamill · SimpleAct',
    anonym: 'Geschäftsführer, Software-Unternehmen',
    vertiefungTitel: 'Führung in einem jungen, wachsenden Software-Unternehmen',
    vertiefung: [
      ['Wie verändert sich Führung, wenn ein Unternehmen schnell wächst? Ab wann braucht es feste Strukturen und Regeln?', 4],
      ['Wie führst du ein Team, das (teilweise) remote arbeitet? Was ist dabei anders?', 4],
      ['Gründer und Führungskraft zugleich: Wo ist das ein Spagat?', 4]
    ]
  },
  {
    datei: 'fragebogen-tlt.docx',
    fuer: 'Jörg Heisler · TLT',
    anonym: 'Führungskraft, Industrieunternehmen',
    vertiefungTitel: 'Führung in einem etablierten Industrieunternehmen',
    vertiefung: [
      ['Wie prägen Tradition und gewachsene Strukturen die Führung in deinem Unternehmen?', 4],
      ['Wie hat sich Führung dort über die Jahre verändert? Was ist heute anders als vor 10 oder 20 Jahren?', 4],
      ['Führt man Fachkräfte in Produktion und Technik anders als Mitarbeitende im Büro? Wenn ja, wie?', 4]
    ]
  }
];

/* ─────────────────────────── FRAGEN ─────────────────────────── */
// [Frage, Hinweis (grau, optional), Zeilen im Antwortfeld]
const BLOECKE = [
  { titel: 'A · Zu dir und deinem Unternehmen', fragen: [
    ['Welche Funktion hast du, und was gehört zu deinen Aufgaben?', null, 3],
    ['Kurz zum Unternehmen: Branche, Zahl der Mitarbeitenden, Standorte, Eigentümer (inhabergeführt, familiengeführt, Teil einer Gruppe, Investoren …)?', null, 3],
    ['Wie viele Menschen führst du direkt und wie viele indirekt? Seit wann hast du Führungsverantwortung, und wie bist du in die Rolle gekommen?', null, 3]
  ]},
  { titel: 'B · Was ist Führung?', fragen: [
    ['Welche drei Begriffe fallen dir spontan zum Wort „Führung“ ein?', 'Ganz spontan, ohne lange nachzudenken.', 1],
    ['Wie würdest du in eigenen Worten erklären, was Führung ist? Bitte ergänze den Satz: „Führung ist …“', 'Ein bis drei Sätze reichen.', 4],
    ['Gibt es für dich einen Unterschied zwischen „Führen“ und „Managen“? Welcher Teil deiner Arbeit ist eher Unternehmensführung (Strategie, Organisation), welcher eher Mitarbeiterführung?', null, 4],
    ['Was macht für dich eine gute Führungskraft aus, und was eine schlechte?', 'Gern mit einem Beispiel einer Person, die dich selbst gut oder schlecht geführt hat.', 4]
  ]},
  { titel: 'C · Führung im Alltag', fragen: [
    ['Wie sieht Führung bei dir im Alltag konkret aus?', 'z. B. Ziele vorgeben oder vereinbaren, Feedback, Mitarbeitergespräche, Meetings. Eher formell (feste Regeln, Prozesse) oder informell (auf Zuruf, im Gespräch)?', 4],
    ['Wie werden bei euch Entscheidungen getroffen? Wer wird beteiligt, und was entscheiden Mitarbeitende selbst?', null, 4],
    ['Beschreib eine Situation, in der Führung für dich besonders schwierig war. Wie hast du gehandelt, und was würdest du heute anders machen?', null, 5]
  ]},
  { titel: 'D · Führung im Mittelstand', fragen: [
    ['Was ist an Führung in einem mittelständischen Unternehmen anders als in einem Großkonzern? Wo ist die Größe ein Vorteil, wo ein Nachteil?', 'z. B. Nähe zu den Mitarbeitenden, kurze Wege, Rolle der Inhaberin bzw. des Inhabers, Ressourcen.', 5],
    ['Wie stark hängt die Führung bei euch an einzelnen Personen? Was würde passieren, wenn die Geschäftsführung drei Monate ausfällt? Gibt es Führungsleitlinien oder ein Leitbild?', null, 4]
  ]},
  { titel: 'E · Wandel', fragen: [
    ['Was verändert Führung derzeit am stärksten?', 'z. B. Fachkräftemangel, Homeoffice und hybrides Arbeiten, Digitalisierung und KI, Erwartungen jüngerer Generationen, Nachfolge.', 4]
  ]}
];

const STILE = [
  ['1', 'autoritär', 'Führungskraft entscheidet und ordnet an'],
  ['2', 'patriarchalisch', 'entscheidet, will aber überzeugen'],
  ['3', 'informierend', 'entscheidet, lässt Fragen zu'],
  ['4', 'beratend', 'informiert vorab, holt Meinungen ein, entscheidet dann'],
  ['5', 'kooperativ', 'Team macht Vorschläge, Führungskraft wählt aus'],
  ['6', 'delegativ', 'Team entscheidet im vorgegebenen Rahmen'],
  ['7', 'autonom', 'Team entscheidet, Führungskraft koordiniert']
];

/* ─────────────────────────── GESTALTUNG ─────────────────────────── */
const AKZENT = '0B4F6C', LEISE = '5B5B57', LINIE = 'C9C6BD', FLAECHE = 'F4F2EC', AKZENT_HELL = 'E3EEF3';
const BREITE = 9638; // A4 (11906) minus 2 × 1134 Rand
const SCHRIFT = 'Calibri';

// Ankreuzfeld (in Word anklickbar); Symbolschrift, die auch LibreOffice/Pages richtig zeigt
const kreuz = () => new CheckBox({ checked: false, checkedState: { value: '2612', font: 'Segoe UI Symbol' }, uncheckedState: { value: '2610', font: 'Segoe UI Symbol' } });
const rand = (farbe = LINIE) => ({ style: BorderStyle.SINGLE, size: 4, color: farbe });
const alleRaender = farbe => ({ top: rand(farbe), bottom: rand(farbe), left: rand(farbe), right: rand(farbe) });

const text = (t, o = {}) => new TextRun({ text: t, font: SCHRIFT, ...o });
const absatz = (kinder, o = {}) => new Paragraph({ children: [].concat(kinder), spacing: { after: 80 }, ...o });

function ueberschrift(t) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AKZENT, space: 2 } },
    children: [text(t, { bold: true, size: 26, color: AKZENT, font: 'Georgia' })]
  });
}

function antwortfeld(zeilen) {
  return new Table({
    width: { size: BREITE, type: WidthType.DXA },
    columnWidths: [BREITE],
    rows: [new TableRow({
      height: { value: 340 * zeilen + 120, rule: HeightRule.ATLEAST },
      children: [new TableCell({
        width: { size: BREITE, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: FLAECHE },
        borders: alleRaender(),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [text('', { size: 22 })] })]
      })]
    })]
  });
}

let nummer = 0;
function frage([f, hinweis, zeilen]) {
  nummer += 1;
  const teile = [new Paragraph({
    keepNext: true, keepLines: true,
    spacing: { before: 200, after: hinweis ? 20 : 80 },
    children: [text(`${nummer}.  `, { bold: true, color: AKZENT, size: 22 }), text(f, { bold: true, size: 22 })]
  })];
  if (hinweis) teile.push(new Paragraph({
    keepNext: true, spacing: { after: 80 }, indent: { left: 340 },
    children: [text(hinweis, { italics: true, color: LEISE, size: 19 })]
  }));
  teile.push(antwortfeld(zeilen));
  return teile;
}

function kaestchen(beschriftung, fett) {
  return new Paragraph({
    spacing: { after: 60 }, indent: { left: 340, hanging: 340 },
    children: [kreuz(), text('  '), text(fett, { bold: true, size: 21 }), text(beschriftung, { size: 21 })]
  });
}

function zelle(kinder, breite, o = {}) {
  return new TableCell({
    width: { size: breite, type: WidthType.DXA }, borders: alleRaender(),
    margins: { top: 60, bottom: 60, left: 60, right: 60 }, verticalAlign: VerticalAlign.CENTER,
    children: [].concat(kinder), ...o
  });
}

function stilSkala() {
  const sp = Math.floor(BREITE / 7), breite = sp * 7;
  const mitte = (k, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, children: [].concat(k), ...o });
  return new Table({
    width: { size: breite, type: WidthType.DXA },
    columnWidths: Array(7).fill(sp),
    rows: [
      new TableRow({ tableHeader: true, children: STILE.map(([n, name]) => zelle(mitte([text(`${n}\n`, { bold: true, size: 18, color: AKZENT }), text(name, { bold: true, size: 17 })]), sp, { shading: { type: ShadingType.CLEAR, color: 'auto', fill: AKZENT_HELL } })) }),
      new TableRow({ children: STILE.map(([, , b]) => zelle(mitte(text(b, { size: 15, color: LEISE })), sp)) }),
      new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: STILE.map(() => zelle(mitte(kreuz()), sp)) })
    ]
  });
}

function kurzfeld(beschriftung) {
  const links = 6200, rechts = BREITE - links;
  return new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: [links, rechts],
    rows: [new TableRow({ children: [
      zelle(absatz(text(beschriftung, { size: 21 }), { spacing: { after: 0 } }), links, { borders: { top: rand('FFFFFF'), bottom: rand('FFFFFF'), left: rand('FFFFFF'), right: rand('FFFFFF') } }),
      zelle(absatz(text(''), { spacing: { after: 0 } }), rechts, { shading: { type: ShadingType.CLEAR, color: 'auto', fill: FLAECHE } })
    ] })]
  });
}

function stammdaten() {
  const l = 2600, r = BREITE - l;
  const zeile = (b, wert = '') => new TableRow({ children: [
    zelle(absatz(text(b, { bold: true, size: 20 }), { spacing: { after: 0 } }), l, { borders: alleRaender('FFFFFF') }),
    zelle(absatz(text(wert, { size: 21 }), { spacing: { after: 0 } }), r, { shading: { type: ShadingType.CLEAR, color: 'auto', fill: FLAECHE } })
  ] });
  return new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: [l, r],
    rows: [zeile('Name'), zeile('Funktion / Position'), zeile('Unternehmen'), zeile('Datum')]
  });
}

function dokument(person) {
  nummer = 0;
  const inhalt = [];

  inhalt.push(
    new Paragraph({ spacing: { after: 0 }, children: [text('Hochschule Kaiserslautern · Campus Zweibrücken · Mittelstandsökonomie', { size: 17, color: LEISE })] }),
    new Paragraph({ spacing: { after: 160 }, children: [text('Modul Management im KMU · Prof. Dr. Christine Arend-Fuchs · WiSe 2026/27', { size: 17, color: LEISE })] }),
    new Paragraph({ spacing: { after: 60 }, children: [text('Fragebogen: Führung im Mittelstand', { bold: true, size: 40, color: AKZENT, font: 'Georgia' })] }),
    new Paragraph({ spacing: { after: 200 }, children: [text(`Schriftliche Befragung von Yannick Heisler · für ${person.fuer}`, { size: 22, color: LEISE })] })
  );

  inhalt.push(
    absatz(text('Vielen Dank, dass du dir Zeit nimmst! Ich halte im Modul „Management im KMU“ ein Referat darüber, was Führung ist und was Führung im Mittelstand ausmacht. Neben der Literatur möchte ich zeigen, wie Führungskräfte aus der Praxis das sehen. Deine Antworten vergleiche ich mit einer zweiten Befragung aus einem ganz anderen Unternehmen.', { size: 21 }), { spacing: { after: 120 } }),
    absatz([text('So geht’s: ', { bold: true, size: 21 }), text('Schreib deine Antworten einfach in die grauen Felder. Die Felder wachsen mit. Stichpunkte reichen völlig, es gibt keine richtigen oder falschen Antworten, und du kannst jede Frage überspringen. Dauer: etwa 20–30 Minuten.', { size: 21 })], { spacing: { after: 120 } }),
    absatz([text('Rückgabe: ', { bold: true, size: 21 }), text(`bitte bis ${RUECKGABE} als Word-Datei per E-Mail an mich zurück.`, { size: 21 })], { spacing: { after: 160 } })
  );

  inhalt.push(stammdaten());

  inhalt.push(ueberschrift('Einverständnis'));
  inhalt.push(absatz(text('Präsentation und Diskussionspapier werden in der Lehrveranstaltung gezeigt und auf einer öffentlich erreichbaren Webseite (GitHub Pages) veröffentlicht. Bitte ankreuzen:', { size: 21 })));
  inhalt.push(
    kaestchen(' in Präsentation und Diskussionspapier verwendet werden.', 'Meine Antworten dürfen'),
    kaestchen(' genannt werden.', 'Ich darf mit Name, Funktion und Unternehmen'),
    kaestchen(` erscheinen (z. B. „${person.anonym}“).`, 'Ich möchte nur anonymisiert'),
    kaestchen(' vor der Veröffentlichung sehen und freigeben.', 'Ich möchte wörtliche Zitate')
  );

  for (const block of BLOECKE) {
    inhalt.push(ueberschrift(block.titel));
    block.fragen.forEach(f => inhalt.push(...frage(f)));
  }

  inhalt.push(ueberschrift(`F · ${person.vertiefungTitel}`));
  person.vertiefung.forEach(([f, z]) => inhalt.push(...frage([f, null, z])));

  inhalt.push(ueberschrift('G · Selbsteinschätzung'));
  nummer += 1;
  inhalt.push(new Paragraph({
    keepNext: true, spacing: { before: 120, after: 120 },
    children: [text(`${nummer}.  `, { bold: true, color: AKZENT, size: 22 }), text('Wo würdest du deinen eigenen Führungsstil einordnen? Bitte ein Kästchen ankreuzen.', { bold: true, size: 22 })]
  }));
  inhalt.push(new Paragraph({
    keepNext: true, spacing: { after: 60 }, tabStops: [{ type: 'right', position: BREITE }],
    children: [text('← Entscheidungsspielraum der Führungskraft', { size: 17, color: LEISE }), text('\tEntscheidungsspielraum des Teams →', { size: 17, color: LEISE })]
  }));
  inhalt.push(stilSkala());
  inhalt.push(new Paragraph({ spacing: { before: 60, after: 160 }, children: [text('In Anlehnung an Tannenbaum, R./Schmidt, W. H. (1958): How to Choose a Leadership Pattern. Harvard Business Review 36(2), S. 95–101.', { size: 15, color: LEISE })] }));

  nummer += 1;
  inhalt.push(new Paragraph({
    keepNext: true, spacing: { before: 120, after: 80 },
    children: [text(`${nummer}.  `, { bold: true, color: AKZENT, size: 22 }), text('Ein paar Zahlen, grob geschätzt:', { bold: true, size: 22 })]
  }));
  inhalt.push(
    kurzfeld('Wie viel Prozent deiner Arbeitszeit ist Mitarbeiterführung?'),
    kurzfeld('Wie viel Prozent ist Unternehmensführung (Strategie, Organisation)?'),
    kurzfeld('Wo würden deine Mitarbeitenden deinen Stil auf der Skala einordnen (1–7)?')
  );

  inhalt.push(ueberschrift('Zum Schluss'));
  inhalt.push(...frage(['Welchen Rat würdest du jemandem geben, der zum ersten Mal Führungsverantwortung übernimmt?', null, 3]));
  inhalt.push(...frage(['Möchtest du noch etwas ergänzen?', null, 3]));

  inhalt.push(new Paragraph({
    spacing: { before: 280 },
    children: [text('Vielen Dank für deine Zeit und deine Antworten! Die fertige Präsentation schicke ich dir gern zu.', { bold: true, size: 22, color: AKZENT })]
  }));

  return new Document({
    creator: 'Yannick Heisler',
    title: 'Fragebogen: Führung im Mittelstand',
    styles: { default: { document: { run: { font: SCHRIFT, size: 21 } } } },
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [text('Fragebogen Führung im Mittelstand · Seite ', { size: 16, color: LEISE }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: LEISE, font: SCHRIFT })]
      })] }) },
      children: inhalt
    }]
  });
}

(async () => {
  for (const person of PERSONEN) {
    fs.writeFileSync(path.join(ORDNER, person.datei), await Packer.toBuffer(dokument(person)));
    console.log(`${person.datei} erzeugt`);
  }
})();
