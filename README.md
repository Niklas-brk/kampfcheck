# Kampfcheck

Deutscher Pokémon-Champions-Rechner für Einzel- und Doppelkampf, mit eigener Windows-App. Aktuelle Version: **1.2.2**.

- Initiative, Schaden und Überlebenschancen vergleichen; Ergebnisse einzeln einklappen.
- Eigene Teams und Gegnerteams benennen, speichern und wieder auswählen.
- Pokémon-Look mit Rot, Blau und Gelb, hellen Karten und dunkelblauem Darkmode; passendes VGC-Logo und App-Symbol.
- Wesen mit farbigen Statusänderungen, Normal-/Mega-Formen und durchsuchbare Items mit Icons.
- Item-Filter nach Heilung, Stärke, Schutz, Initiative, Status, Taktik, Beeren und Mega-Steinen; Suche nach Namen oder Wirkung.
- Pokémon-Auswahl nach Reglement M-C, mit artbezogenen Champions-Attacken und Fähigkeiten. Unzulässige ältere Sets werden markiert; ihre gespeicherten Daten bleiben lesbar.
- Darkmode, Typencheck, Meta-Daten und Turnier-Vorlagen mit Quellen.
- Optional einschaltbare Anfängertipps zu Initiative, Schaden, Teambau und gespeicherten Teams.
- Fähigkeiten passend bedienen: Unbeugsamkeit/Siegeswille als sichtbare +2-Statusstufe eintragen, Bedroher-Reaktionen automatisch berücksichtigen, Notschutz über den Status aktivieren.

## Testversion weitergeben

Zum Weitergeben über Discord ist nur die kleine Datei `release/Testversion/Kampfcheck-1.2.2-Test-Setup.exe` nötig, bei Bedarf zusammen mit `TESTVERSION-LESEN.txt` aus demselben Ordner. Das Setup ist ungefähr 0,42 MB groß. Es installiert die App für den aktuellen Benutzer unter Windows 10/11 (x64), ohne Administratorrechte. Bei der ersten Installation lädt es die festgelegte Electron-Laufzeit 44.4.3 aus dem offiziellen GitHub-Release herunter (etwa 151 MB) und prüft deren SHA-256-Prüfsumme. Dafür wird eine Internetverbindung benötigt.

Das Setup enthält die minimierten Programmdateien in einem ASAR-Archiv. Das lesbare Entwicklungsprojekt, JavaScript-Quellkommentare, Source Maps, Git-Historie, persönliche Teams und Benutzerprofile werden nicht mitgegeben. **ASAR und Minimierung sind keine Verschlüsselung:** Der lokal ausführbare App-Code bleibt technisch auslesbar. Das private GitHub-Repository muss zum Testen weder geteilt noch zugänglich gemacht werden.

Danach startet **Kampfcheck** über das Symbol auf dem Desktop oder im Startmenü. Node.js und ein laufender Entwicklungsserver sind für die installierte App nicht erforderlich. Die Berechnungen und gebündelten Daten funktionieren auch ohne Internet; Pokémon-Bilder, Web-Schriften und aktuelle Meta-Daten benötigen eine Verbindung.

Die App verwendet einen eigenen lokalen Datenspeicher unter `%APPDATA%/Kampfcheck`. Teams aus einem Browser werden nicht automatisch übernommen. Einzelne eigene Teams lassen sich mit der vorhandenen Export-/Importfunktion übertragen. Teamdaten werden nicht mit dem Quellcode oder GitHub synchronisiert.

## Entwickeln und bauen

Benötigt werden Node.js 24+ und pnpm. Im Projektordner:

```sh
pnpm install
pnpm start
```

Dann `http://127.0.0.1:4173` öffnen. Die editierbaren HTML-, CSS- und JavaScript-Quellen liegen in `dist/`. Für diese lokale Browseransicht ist kein zusätzlicher Build nötig. Der Code ist nach Aufgaben gegliedert und an den wichtigen Schnittstellen auf Deutsch kommentiert.

```sh
pnpm test
pnpm format
pnpm run build:windows
pnpm run test:package
pnpm run install:windows
pnpm run build:test
```

Die Windows-Befehle benötigen Windows PowerShell. `build:windows` erstellt eine vollständige Windows-Ausgabe, `install:windows` installiert das vorbereitete App-Paket mit Verknüpfungen. `build:test` erzeugt das kleine Setup zum Weitergeben und benötigt zusätzlich NSIS 3.12. Die Modulübersicht, die NSIS-Einrichtung und der Ablauf für neue Versionen stehen in [ENTWICKLUNG.md](ENTWICKLUNG.md).

## Privatsphäre

Dieses Projekt enthält keine persönlichen Teamdateien, Browserprofile, Zugangsdaten, privaten Deployment-Konfigurationen oder ursprüngliche Entwicklungshistorie. Die `.gitignore` schließt solche Dateien sowie Build-Ausgaben aus. Ein privates GitHub-Repository ist weiterhin erforderlich, wenn der Quellcode nicht öffentlich sein soll; `private: true` in `package.json` verhindert nur versehentliche npm-Veröffentlichungen.

Die Desktop-App hat keinen Zugriff auf Node.js aus der Oberfläche, verwendet einen isolierten Renderer mit Sandbox und lädt das Programm von einer internen lokalen Adresse. Externe HTTPS-Quellen öffnen im Standardbrowser. Es gibt keine Telemetrie und keinen Cloud-Upload von Teams. Beim Abrufen externer Bilder, Schriftarten und Meta-Daten erhalten deren Anbieter technisch bedingt die üblichen Verbindungsdaten.

## Daten und Grenzen

Rechenbasis: Smogon Damage Calc 0.12.0, Champions-Modus, Level 50. Gegnerische Werte sind Annahmen; Ergebnisse hängen von den Einstellungen ab. Meta- und Turnierdaten nennen in der App ihren jeweiligen Datenstand und ihre Quellen. Die Desktop-Laufzeit wird nur bei einem neuen Build aktualisiert; Meta-Daten aktualisieren sich innerhalb der App.

Der geprüfte Verfügbarkeitssnapshot steht in `dist/champions-data.js`. Er kombiniert die offizielle M-C-Pokémonliste mit Champions-Learnsets und Fähigkeiten aus einem festgelegten Pokémon-Showdown-Commit. Mega- und Kampfformen erben von ihrer Ausgangsform; Attacken von Vorentwicklungen oder anderen Spielen werden nicht ergänzt. Reine Rechenhilfen wie „Aegislash-Both“ sind nicht auswählbar. Ein leerer Attackenplatz wird intern als `(No Move)` geführt. Teamklauseln und situationsabhängige Verwandlungen sind keine vollständige Turnier-Teamvalidierung.

Mit Node.js 24+ lässt sich der Snapshot über `node scripts/refresh-champions-data.mjs <showdown-commit-sha>` erneuern. Die offizielle Formzuordnung liegt unter `scripts/data/official-regulation-mc.json`; ändert sich die offizielle Liste, stoppt das Skript, bis die Zuordnung geprüft wurde. Ein neues Reglement erfordert eine bewusste Datenaktualisierung. Aktuelle Meta-Statistiken überschreiben diese Regeln nicht.

App-Updates werden in einem neuen Versionsordner installiert; der Datenspeicher bleibt unter demselben App-Namen erhalten. Vor dem Start der aktualisierten Version die bisherige App schließen. Vorhandene Versionsordner werden nicht automatisch gelöscht. Ein anderer Build überschreibt keine bereits installierte Ausgabe mit derselben Versionsnummer; für neue verteilte Builds muss die Version erhöht werden.

Siehe [THIRD_PARTY.md](THIRD_PARTY.md) für Quellen und Rechte. Inoffizielles Fanprojekt, ohne Verbindung zu Nintendo, Creatures, GAME FREAK oder The Pokémon Company.
