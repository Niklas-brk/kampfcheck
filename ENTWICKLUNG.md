# Kampfcheck entwickeln

Die Weboberfläche verwendet HTML, CSS und JavaScript ohne Framework. **`dist/` ist hier der editierbare Quellordner.** Erst die Skripte für die Desktop-Ausgabe minimieren eine Kopie dieser Dateien. Die lesbaren Quellen bleiben dabei erhalten.

## Einstieg

Voraussetzungen: Node.js 24+ und pnpm. Für die Windows-Ausgabe werden zusätzlich Windows 10/11 x64 und Windows PowerShell 5.1 benötigt.

```sh
pnpm install
pnpm start
```

Die lokale Vorschau läuft unter `http://127.0.0.1:4173`. Sie hat einen eigenen Browser-Datenspeicher. Gespeicherte Teams aus der Desktop-App erscheinen dort nicht automatisch.

```sh
pnpm test
pnpm format
```

`pnpm test` prüft die Berechnungen, Wesen und Formen, Team-Bibliotheken, Gegnerteams, Item-Effekte und Champions-Verfügbarkeit. `pnpm format` formatiert die bearbeiteten Anwendungsmodule mit Prettier. Generierte Daten und fremde Bibliotheken werden nicht pauschal umgeschrieben.

## Wo gehört eine Änderung hin?

| Datei                   | Aufgabe                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `dist/index.html`       | Einstiegspunkt, Metadaten und Reihenfolge der Skripte.                                                  |
| `dist/style.css`        | Pokémon-Farben, helles und dunkles Design sowie responsive Ansichten.                                   |
| `dist/app.js`           | Zustand der Oberfläche, Eingaben, Navigation und Zusammensetzen der Ansichten.                          |
| `dist/core.js`          | Übergabe an die Rechenbibliothek, Statuswerte, Initiative, Schaden und Ergebnisaufbereitung.            |
| `dist/legality.js`      | Verfügbare Champions-Pokémon, Attacken, Fähigkeiten und Items prüfen; gültige Ausgangssets vorbereiten. |
| `dist/team-tools.js`    | Wesen, Formenwechsel und Typenvergleich für den Teambau.                                                |
| `dist/team-library.js`  | Eigene und gegnerische Teams benennen, speichern, laden und ältere Speicherstände lesen.                |
| `dist/meta.js`          | Meta-Daten abrufen, zwischenspeichern und Datenstand berücksichtigen.                                   |
| `dist/builder-ui.js`    | Team-Baukasten, Item-Suche, Teamhinweise und Vorlagen darstellen.                                       |
| `dist/library-ui.js`    | Bibliothek und Dialoge für eigene Teams und Gegnerteams darstellen.                                     |
| `dist/beginner-tips.js` | Optionale Hilfetexte passend zur aktuellen Ansicht und zum Kampfmodus.                                  |
| `dist/view-helpers.js`  | Gemeinsame Hilfe für lesbar formatierte HTML-Vorlagen.                                                  |
| `desktop/main.cjs`      | Electron-Fenster, interne lokale Adresse, Dateizugriff und Browser-Sicherheitsgrenzen.                  |

Die Module werden über `window` verbunden; `index.html` legt ihre Lade-Reihenfolge fest. Der Controller in `app.js` verarbeitet eine Eingabe, aktualisiert den Zustand und rendert die betroffene Ansicht. Rechenregeln gehören in `core.js`, Verfügbarkeitsregeln in `legality.js` und Speicherregeln in `team-library.js`. Die UI-Module sollen diese Regeln verwenden, statt sie erneut umzusetzen.

Der `html`-Tag aus `view-helpers.js` erleichtert die Formatierung von Vorlagen. Er maskiert keine Eingaben. Benutzereingaben müssen vor dem Einsetzen weiterhin mit der jeweiligen `escapeHtml`-/`esc`-Hilfe maskiert werden.

Kommentare erklären die fachlichen Gründe und die Grenzen einer Funktion, etwa warum gespeicherte ältere Teams lesbar bleiben oder welche Annahmen für eine Schadensberechnung gelten. Änderungen sollten diese Trennung erhalten und sprechende Namen verwenden.

## Daten aktualisieren

`dist/champions-data.js` ist ein erzeugter Snapshot. Seine Quelle ist die offizielle M-C-Pokémonliste zusammen mit Learnsets und Fähigkeiten aus einem festgelegten Pokémon-Showdown-Commit. Die überprüfte offizielle Formzuordnung steht in `scripts/data/official-regulation-mc.json`.

```sh
node scripts/refresh-champions-data.mjs <showdown-commit-sha>
pnpm test
```

Ändert sich die offizielle Liste, stoppt das Skript, bis die Zuordnung geprüft wurde. Ein neues Reglement wird bewusst eingepflegt. Automatisch geladene Meta-Statistiken ändern die Zulässigkeitsregeln nicht. Deutsche Bezeichnungen, Item-Effekte, Icons, Meta-Snapshots und Turnier-Vorlagen liegen in eigenen Datenmodulen unter `dist/`; Quellen und Rechte stehen in `THIRD_PARTY.md`.

## Windows-App bauen

```sh
pnpm run build:windows
pnpm run test:package
pnpm run install:windows
```

`scripts/package-app.mjs` übernimmt nur die benötigten Dateien aus einer festgelegten Auswahl. Es minimiert JavaScript und CSS, erzeugt keine Source Maps und erstellt `release/payload-<version>/app.asar` mit einem Versions- und Prüfsummenmanifest. Das Entwicklungsprojekt, Tests, Git-Daten, Profile und persönliche Teams werden nicht eingepackt.

`pnpm run test:package` prüft nach einem Build oder `pnpm run package:app` die benötigten ASAR-Ressourcen und die Paketstruktur. Außerdem sucht es nach privaten Pfaden, unerwünschten Projektdateien und Source Maps im Paket.

`desktop/build-windows.ps1` erstellt daraus `release/Kampfcheck-<version>-win32-x64`. Die dafür benötigte Electron-Laufzeit 44.4.3 stammt aus dem offiziellen GitHub-Release und wird anhand einer festgelegten SHA-256-Prüfsumme geprüft. Ein bereits vorhandenes gültiges Laufzeitarchiv kann wiederverwendet werden.

`desktop/install-windows.ps1` installiert das vorbereitete App-Paket für den aktuellen Benutzer unter `%LOCALAPPDATA%/Programs/Kampfcheck/<version>` und legt Verknüpfungen auf dem Desktop und im Startmenü an. Gemeinsame Installationslogik steht in `desktop/install-payload.ps1`.

Der Teamspeicher bleibt unter `%APPDATA%/Kampfcheck`. App-Name und interne Adresse `kampfcheck://app` dürfen bei einem normalen Update nicht verändert werden, weil sie zum bestehenden Datenspeicher gehören. Vor dem Start einer neuen Version die bisherige App schließen.

## Kleines Test-Setup für Discord

Der Setup-Build benötigt **NSIS 3.12**. Das offizielle ZIP ist über [NSIS Download](https://nsis.sourceforge.io/Download) erhältlich. Die erwartete SHA-256-Prüfsumme für `nsis-3.12.zip` lautet:

```text
56581f90db321581c5381193d796fffcf2d24b2f8fed2160a6c6a3baa67f2c4f
```

Die heruntergeladene Datei vor dem Entpacken prüfen:

```powershell
Get-FileHash -LiteralPath ./nsis-3.12.zip -Algorithm SHA256
```

Die Ausgabe muss der oben genannten Prüfsumme entsprechen. Erst danach entpacken:

```powershell
Expand-Archive -LiteralPath ./nsis-3.12.zip -DestinationPath ./.cache
```

Das Build-Skript erwartet den Compiler unter `.cache/nsis-3.12/makensis.exe`.

```sh
pnpm run build:test
```

Ein Compiler an einem anderen Ort lässt sich ausdrücklich angeben:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File desktop/build-test-installer.ps1 -NsisCompiler "C:\Werkzeuge\nsis-3.12\makensis.exe"
```

Für Version 1.2.1 entstehen `release/Testversion/Kampfcheck-1.2.1-Test-Setup.exe` und die kurze Anleitung `TESTVERSION-LESEN.txt`. Die ungefähr 0,42 MB große EXE enthält das App-Paket und die Installationslogik. Bei der ersten Installation lädt sie die etwa 151 MB große Electron-Laufzeit, prüft sie und installiert ohne Administratorrechte. Tester benötigen weder Node.js noch pnpm noch Zugriff auf das private GitHub-Repository. Nach der Installation funktionieren Berechnungen und gebündelte Daten offline; externe Bilder, Schriften und aktuelle Meta-Daten benötigen Internet.

ASAR ist ein Archivformat, keine Verschlüsselung. Minimierung entfernt die lesbare Entwicklungsfassung und JavaScript-Kommentare aus der verteilten Ausgabe, verhindert aber nicht das technische Auslesen des ausführbaren Codes. Deshalb dürfen Geheimnisse grundsätzlich nicht im Frontend oder Desktop-Paket stehen.

## Neue Version veröffentlichen

1. Änderungen in der lokalen Vorschau prüfen und `pnpm test` ausführen.
2. Für einen neuen verteilten Build die Versionsnummer in `package.json` erhöhen.
3. Die Windows-Ausgabe und das Test-Setup bauen, anschließend `pnpm run test:package` ausführen. Die gebaute App öffnen und die betroffenen Funktionen prüfen; bei UI-Änderungen auch helles und dunkles Design ansehen.
4. Nur die Setup-Datei und optional die Testanleitung weitergeben. Den Projektordner und lokale Daten nicht anhängen.

Vorhandene Versionsordner werden bei einem abweichenden App-Hash nicht überschrieben. Ein identisches, vollständig installiertes Paket kann erneut erkannt werden. Alte Versionsordner werden nicht automatisch gelöscht; der gemeinsame Teamspeicher bleibt erhalten. Die Desktop-Laufzeit wird durch einen neuen Build aktualisiert, nicht durch das Laden neuer Meta-Daten.

`node_modules/`, `.cache/` und `release/` bleiben lokale Arbeits- und Build-Ordner und sind von Git ausgeschlossen. Das Repository muss privat bleiben, wenn der lesbare Quellcode privat sein soll. Weitere Datenschutz- und Datengrenzen stehen in [README.md](README.md).
