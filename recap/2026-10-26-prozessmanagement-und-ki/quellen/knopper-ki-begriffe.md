# Quelle: Video „KI-Begriffe, die man heute kennen sollte – ein Überblick für Einsteiger“

Gastvortrag Klaus Knopper (Hochschule Kaiserslautern) in der Sitzung vom 26.10.2026.
Video: https://play.hs-kl.de/ki/KI-Begriffe.mp4 (8:50 Min., Creative-Commons-Lizenz laut Abspann;
Sprecher-Avatar im Video als „AI“ gekennzeichnet, „Foto und Samples (C) Klaus Knopper 2026“).

Automatisch transkribiert (Whisper large-v3-turbo), Fachbegriffe korrigiert
(z. B. „JetGPT“ → ChatGPT, „RAC“ → RAG). In der Sitzung verwies Herr Knopper außerdem auf den
OLAT-Kurs „KI-Kompetenz“, der nach bestandenem Test ein Badge/Zertifikat ausstellt (laut Mitschrift).

## Folien im Video (Reihenfolge)

LLM · künstliches neuronales Netz · Training vs. Inferenz · Ablauf der Inferenz · Chatbot ·
Halluzination · Arten von KI-Modellen · Prompt & Prompt Engineering · Token · KI-Agent ·
Tool Calling · Web Search / Deep Search · RAG · Orchestrierer · Harness

## Transkript

`00:00:02` Künstliche Intelligenz hat ihren eigenen Dialekt, LLM, Token, RAG, Agent, Halluzination.

`00:00:09` Wer heute mit KI arbeitet, kommt an diesen Begriffen nicht mehr vorbei.

`00:00:14` In den nächsten Minuten gehe ich sie der Reihe nach durch, kurz erklärt und mit Beispielen aus der Praxis.

`00:00:20` Der Anfang ist natürlich das LLM, Large Language Model, im Wortsinne ein großes Sprachmodell.

`00:00:30` Es wurde mit riesigen Textmengen trainiert und kann dadurch natürliche Sprache verstehen und erzeugen.

`00:00:36` ChatGPT, Claude, Gemini, Kimi oder DeepSeek, das sind alles LLMs.

`00:00:41` Und GPT steht für Generative Pre-Trained Transformer und ist eine bestimmte textbasierte Bauart von LLM.

`00:00:50` Jedes GPT ist ein LLM, aber längst nicht jedes LLM ist ein GPT.

`00:00:56` Unter der Haube ist jedes LLM ein künstliches neuronales Netz, ein Rechenmodell, das sich lose an biologische Nervenzellen anlehnt.

`00:01:07` Es besteht aus Neuronen, also Knoten, aus Schichten, aus Gewichten, den Verbindungsstärken zwischen den Neuronen und aus Aktivierungsfunktionen.

`00:01:16` Beim Training passt das Netz seine Gewichte so lange an, bis es Muster in den Daten zuverlässig erkennt.

`00:01:23` Auch hier gilt, alle LLMs sind neuronale Netze, aber bei weitem nicht alle neuronalen Netze sind LLMs.

`00:01:30` Jetzt der entscheidende Unterschied, Training vs. Inferenz.

`00:01:34` Beim Training lernt das Modell aus Daten und verändert dabei seine Gewichte.

`00:01:38` Bei der Inferenz, dem eigentlichen Betrieb, wird nichts mehr gelernt.

`00:01:42` Die Eingabe fließt durch das fertige Netz, eine Antwort kommt heraus.

`00:01:46` Zeigt man dem Modell im Prompt eine Lösung mit, wird es dadurch nicht dauerhaft schlauer.

`00:01:52` Und wer sich so eine fertige Modellgewichtsdatei anschaut, sieht nur Zahlen und Textschnipsel.

`00:01:59` Wo ist da noch Wissen? Nirgends.

`00:02:01` Gespeichert sind Wahrscheinlichkeitswerte, kein menschliches Weltwissen.

`00:02:06` Wie läuft so eine Inferenz konkret ab?

`00:02:10` 1. Tokenisierung. Der Eingabetext wird in Token zerlegt.

`00:02:14` 2. Der Forward Pass. Die Token durchlaufen das Netz Schicht für Schicht.

`00:02:19` 3. Berechnet das Modell eine Wahrscheinlichkeitsverteilung. Welches Token passt als nächstes am ehesten?

`00:02:26` 4. Das Sampling. Eines dieser Token wird ausgewählt.

`00:02:29` 5. Beginnt alles von vorn.

`00:02:32` Das neue Token wird an den Kontext angehängt und der nächste Durchlauf startet.

`00:02:36` Antworten entstehen also wirklich eins nach dem anderen.

`00:02:40` Und wo spricht man mit dem Ganzen? Im Chatbot.

`00:02:46` Das ist die Benutzeroberfläche, der Browser, die App oder das Terminal.

`00:02:50` Der Chatbot ist nicht das Modell selbst, sondern nur das Fenster davor.

`00:02:54` Jetzt zum berüchtigten Problem, der Halluzination.

`00:02:57` Die KI gibt falsche Informationen aus, scheinbar völlig selbstbewusst.

`00:03:02` Der Grund ist strukturell. Ein LLM besitzt kein echtes Wissen.

`00:03:06` Es kombiniert Tokens nach Wahrscheinlichkeiten und hat keinen eingebauten Reality-Check.

`00:03:11` Besonders anfällig ist es deshalb bei Zahlen, Namen und Quellenangaben.

`00:03:16` Der wichtigste Merksatz dieses Videos: Bei wichtigen Fakten immer nachprüfen.

`00:03:21` Sprachmodelle sind übrigens nur eine Familie unter vielen.

`00:03:27` Bildmodelle wie Stable Diffusion oder Flux arbeiten meist mit Diffusion.

`00:03:32` Sie lernen, Bildrauschen Schritt für Schritt zu entfernen, bis das gewünschte Bild übrig bleibt.

`00:03:38` Videomodelle sind ebenfalls oft diffusionsbasiert, verarbeiten aber zusätzlich Raum-Zeit-Patches,

`00:03:45` Bildausschnitte über mehrere Frames hinweg.

`00:03:48` Musik- und Audio-Modelle nutzen autoregressive Transformer oder Diffusion.

`00:03:53` Und multimodale Modelle beherrschen gleich mehrere Eingabeformate, etwa Text und Bild, manchmal auch Audio und Video.

`00:04:01` Beispiel ein Foto hochladen und fragen, was ist hier kaputt?

`00:04:08` Der Prompt ist die Eingabe an die KI, mehr nicht.

`00:04:11` Prompt Engineering bedeutet, diese Eingabe geschickt zu planen und präzise zu formulieren.

`00:04:17` Mit Kontext, mit Formatvorgaben, mit Beispielen.

`00:04:21` Schreibe eine höfliche Absage in drei Sätzen, ist ein guter Prompt.

`00:04:25` Kleine Randbemerkung, das Berufsbild des Prompt Engineers ist heute selbst schon weitgehend automatisierbar.

`00:04:32` Kurz zu den Tokens, denn sie bestimmen Zeit und Geld.

`00:04:37` Ein Token ist die kleinste Einheit, die ein Modell verarbeitet.

`00:04:41` Oft ein Wortteil, eine Silbe oder auch nur ein Zeichen.

`00:04:45` Der Satz, ich gehe heute ins Kino, besteht aus etwa 6 bis 8 Tokens.

`00:04:50` Die Tokenanzahl begrenzt die maximale Länge von Anfrage und Antwort.

`00:04:54` Sie bestimmt den Rechenaufwand und damit die Kosten.

`00:04:57` Jetzt wird's aktiv.

`00:05:01` Ein KI-Agent ist ein Programm, das eigenständig handelt.

`00:05:05` Es nimmt Informationen auf, plant, entscheidet und führt aus.

`00:05:09` Häufig mit kleinen ad hoc geschriebenen Skripten, aber auch mit komplexen Workflows.

`00:05:14` Dabei arbeitet es iterativ, so lange bis das gewünschte Ergebnis steht.

`00:05:18` Zwei Beispiele.

`00:05:20` Ein Buchhaltungsagent, der Rechnungen und Compliance prüft.

`00:05:24` Und ein Gutachtenagent, der auch umfangreiche Abschlussarbeiten auf Korrektheit der Quellenangaben, Widersprüche und Logikfehler untersucht.

`00:05:34` Wie aber greift ein Agent nach außen?

`00:05:40` Über Tool Calling.

`00:05:41` Der Eingabe werden automatisch die Aufgabenstellung, der Kontext, also Historie und Randbedingungen und ein Set verfügbarer Werkzeuge mit Beschreibung mitgegeben.

`00:05:51` Erkennt das LLM, dass die Aufgabe externe Hilfe braucht, ruft es ein oder mehrere passende Tools oder APIs auf.

`00:05:58` Für jeden Schritt eine Iteration.

`00:06:00` Das können mitunter über 100 Durchläufe sein, besonders wenn ein Tool einen Fehler meldet, den der Agent selbst zu beheben versucht.

`00:06:08` So lassen sich komplexe Aufgaben fehlertolerant abarbeiten.

`00:06:11` Aber Vorsicht, je nachdem welche Tools erlaubt sind, kann ein Agent gefährlich selbstständig werden.

`00:06:18` Tool Calling ist also auch immer ein Sicherheitsthema.

`00:06:21` Ein besonders wichtiges Werkzeug ist Web Search, in der gründlicheren Variante Deep Search.

`00:06:30` Die KI recherchiert eigenständig im Internet über eine API, ein Werkzeug oder sogar einen ferngesteuerten Browser.

`00:06:38` Deep Search arbeitet mehrstufig.

`00:06:40` Es findet Links, verfolgt sie bis zum verfügbaren Dokument, liest und analysiert es, inklusive der darin angegebenen weiteren Quellen.

`00:06:49` Alles iterativ.

`00:06:50` Damit überwindet die KI ihr veraltetes Trainingswissen.

`00:06:53` Beispiel

`00:06:54` Aktuelle Förderregeln für Stipendien recherchieren

`00:06:57` RAG

`00:06:59` Retrieval Augmented Generation

`00:07:02` ist das Gegenstück zur Internetsuche.

`00:07:04` Hier greift die KI auf Dokumente zu, die man ihr bereitstellt.

`00:07:07` Einzelne Dateien oder ganze Sammlungen.

`00:07:10` Sie zieht die passenden Inhalte heraus und beantwortet die Frage damit.

`00:07:14` Kein Internetzugriff, kein Neutraining des Modells.

`00:07:17` Beispiel Fragen zur IT-Sicherheit beantworten auf Basis der rund 800 Seiten umfassenden BSI Grundschutz Dokumente.

`00:07:24` Wenn mehrere Modelle und Tools zusammenspielen sollen, übernimmt der Orchestrierer die Regie.

`00:07:33` Er verbindet und koordiniert sie, selbstständig oder nach Vorgabe, und legt fest, was wann passiert.

`00:07:40` Bekannte Werkzeuge, n8n, ComfyUI für Multimedia-Inhalte, OpenClaw oder Hermes als universelle Agenten.

`00:07:49` Praxisszenario

`00:07:51` Bild, Infosammlung und Zuschauerfrage gehen rein.

`00:07:54` Die KI generiert ein persönliches Antwortvideo und der virtuelle KI-Dozent streamt es direkt in die Videokonferenz.

`00:08:01` Um das Modell herum liegt das Harness, die Infrastruktur, die dem Modell Werkzeuge, Speicher und Berechtigung bereitstellt.

`00:08:11` Merkbild, das Modell ist das Gehirn, das Harness ist die Ausführungsumgebung.

`00:08:16` Ein Coding Agent zum Beispiel arbeitet in einer Sandbox und fasst ausschließlich die vorgegebenen Projektdateien an.

`00:08:23` Das war der Rundgang durch die KI-Begriffe, die man heute kennen sollte.

`00:08:30` Dieses Video steht unter einer Creative Commons Lizenz, die Details hier am Ende der Folien.

`00:08:36` Danke fürs Zuschauen und bis zum nächsten Mal.
