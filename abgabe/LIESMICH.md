# Abgabe: Portfolio-PDFs

`bauen.py` setzt die beiden PDFs für die Portfolio-Prüfung bei Prof. Dr. Christine Arend-Fuchs zusammen
(Yannick Heisler und Elias Knauber, WiSe 2026/27):

| Datei | Modul |
|---|---|
| `ausgabe/Portfolio_Strategisches-Marketing_Heisler_Knauber.pdf` | Strategisches Marketing |
| `ausgabe/Portfolio_Management-im-KMU_Heisler_Knauber.pdf` | Management im KMU |

Jedes PDF hat ein Deckblatt im Auftritt der Hochschule Kaiserslautern, ein anklickbares Inhaltsverzeichnis,
je Leistung ein Zwischenblatt, Lesezeichen und durchlaufende Seitenzahlen. Alle Seiten sind A4:
Folien einzeln im Querformat, Handouts und Website-Aufnahmen im Hochformat.

## Reihenfolge

Die Reihenfolge folgt je Modul der Folie „Zeitinvest und Portfolio Prüfung“ der Dozentin.

**Strategisches Marketing**

1. Fallstudie: SEO-Fallstudie (Handout, Präsentation), Yannick Heisler und Elias Knauber
2. Fallstudie: NIVEA Men DEEP (Präsentation), Elias Knauber
3. Review: Recap Dunkin’ & Podcast-Marketing (Präsentation)
4. Individuelle Leistung: Workshop Rebranding-Roulette (Website, acht Felder am Musterbeispiel, Pitch-Board, Pitch-Folien)

**Management im KMU**

1. Review: Recap der Sitzung vom 26.10.2026 (Präsentation)
2. Thema: Führung im KMU (Handout, Präsentation, Quellennachweis), Yannick Heisler
3. Thema: Selbstorganisation im Beruf (Präsentation), Elias Knauber
4. Individuelle Leistung: KI-Compliance im KMU (Präsentation)

Nicht enthalten sind Präsentations- und Redeskripte, Recherche-Dossiers, das Transkript der Sitzung
und die Fragebögen mit Auswertung. Das Protokoll zum Gastvortrag entfällt.

## Was nicht im Repo liegt

Drei Unterlagen kommen von außen und gehören in den Ordner `extern/` (wird nicht eingecheckt,
das Repo ist öffentlich):

| Datei in `extern/` | Inhalt |
|---|---|
| `NIVEA_Men_DEEP_Fallstudie.pdf` | Präsentation von Elias Knauber, Keynote-Export mit vier Folien je Seite |
| `Selbstorganisation.pdf` | Präsentation von Elias Knauber, Keynote-Export mit vier Folien je Seite |
| `Recap_Dunkin.pdf` | Recap Dunkin’, aus der PowerPoint-Datei als PDF exportiert (eine Folie je Seite) |

Die Keynote-Exporte zerlegt das Skript in einzelne Folien. Die Aufnahmen der Rebranding-Website
entstehen aus einer Arbeitskopie des Repos `Marketing` (Vorgabe: Nachbarordner `../Marketing`).

## Bauen

    pip install pymupdf fonttools brotli
    NODE_PATH=/opt/node-tools/node_modules python3 abgabe/bauen.py

Dafür braucht es Node mit Playwright und Chromium (wie die anderen Werkzeuge im Repo).

| Schalter | Wirkung |
|---|---|
| `--nur marketing` / `--nur kmu` | nur eine der beiden Dateien |
| `--datum "30. November 2026"` | Abgabedatum auf dem Deckblatt (Vorgabe: heute) |
| `--matrikel "Yannick Heisler=…" --matrikel "Elias Knauber=…"` | Matrikelnummern aufs Deckblatt |
| `--autor-dunkin "…"` | wer das Recap Dunkin’ gehalten hat (Zwischenblatt und Inhaltsverzeichnis) |
| `--fuehrung-25` | 25-Minuten-Fassung der Führungs-Präsentation statt der langen Fassung |
| `--website-neu` | Aufnahmen der Rebranding-Website neu erzeugen |

Inhalt und Reihenfolge stehen in `mappe_marketing()` und `mappe_kmu()` in `bauen.py`.

## Dateien

| Datei | Aufgabe |
|---|---|
| `bauen.py` | Deckblatt, Inhaltsverzeichnis und Zwischenblätter (HTML, mit Chromium gedruckt), Zusammenbau mit PyMuPDF |
| `werkzeuge/rebranding.cjs` | nimmt die Rebranding-Website als Vektor-PDF auf und merkt sich, wo lange Seiten geteilt werden dürfen |
| `werkzeuge/html2pdf.cjs` | druckt eine HTML-Datei als PDF |
| `werkzeuge/schriften.py` | erzeugt statische Schnitte der Inter aus den Schriften des Repos (echte eingebettete Schrift statt Type 3) |
