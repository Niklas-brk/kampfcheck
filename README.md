# Kampfcheck

Deutscher Pokémon-Champions-Rechner für Einzel- und Doppelkampf, mit eigener Windows-App.

- Initiative, Schaden und Überlebenschancen vergleichen; Ergebnisse einzeln einklappen.
- Eigene Teams und Gegnerteams benennen, speichern und wieder auswählen.
- VGC-Logo und App-Symbol im Pokémon-Stil.
- Wesen mit farbigen Statusänderungen, Normal-/Mega-Formen und durchsuchbare Items mit Icons.
- Item-Filter nach Heilung, Stärke, Schutz, Initiative, Status, Taktik, Beeren und Mega-Steinen; Suche nach Namen oder Wirkung.
- Pokémon-Auswahl nach Reglement M-C, mit artbezogenen Champions-Attacken und Fähigkeiten. Unzulässige ältere Sets werden markiert; ihre gespeicherten Daten bleiben lesbar.
- Darkmode, Typencheck, Meta-Daten und Turnier-Vorlagen mit Quellen.

## Windows-App

Die App wird ohne Administratorrechte installiert. Benötigt werden Windows 10/11 (64 Bit), PowerShell und für den ersten Build eine Internetverbindung. Die festgelegte Electron-Version wird aus den offiziellen GitHub-Releases geladen und anhand der dort veröffentlichten SHA-256-Prüfsumme geprüft.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File desktop/build-windows.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File desktop/install-windows.ps1
```

Danach startet **Kampfcheck** über das Symbol auf dem Desktop oder im Startmenü. Node.js und ein laufender Entwicklungsserver sind für die installierte App nicht erforderlich. Die Berechnungen und gebündelten Daten funktionieren auch ohne Internet; Pokémon-Bilder, Web-Schriften und aktuelle Meta-Daten benötigen eine Verbindung.

Die App verwendet einen eigenen lokalen Datenspeicher unter `%APPDATA%/Kampfcheck`. Teams aus einem Browser werden nicht automatisch übernommen. Einzelne eigene Teams lassen sich mit der vorhandenen Export-/Importfunktion übertragen. Teamdaten werden nicht mit dem Quellcode oder GitHub synchronisiert.

## Im Browser entwickeln

Mit einer aktuellen Node.js-Version:

```sh
node scripts/serve.mjs
```

Dann `http://127.0.0.1:4173` öffnen. Es gibt keinen zusätzlichen Build-Schritt für die Weboberfläche; die editierbaren HTML-, CSS- und JavaScript-Dateien liegen in `dist/`.

```sh
node scripts/verify.cjs
node scripts/verify-team.cjs
node scripts/verify-library.cjs
node scripts/verify-opponents.cjs
node scripts/verify-item-effects.cjs
node scripts/verify-legality.cjs
```

## Privatsphäre

Dieses Projekt enthält keine persönlichen Teamdateien, Browserprofile, Zugangsdaten, privaten Deployment-Konfigurationen oder ursprüngliche Entwicklungshistorie. Die `.gitignore` schließt solche Dateien sowie Build-Ausgaben aus. Ein privates GitHub-Repository ist weiterhin erforderlich, wenn der Quellcode nicht öffentlich sein soll; `private: true` in `package.json` verhindert nur versehentliche npm-Veröffentlichungen.

Die Desktop-App hat keinen Zugriff auf Node.js aus der Oberfläche, verwendet einen isolierten Renderer mit Sandbox und lädt das Programm von einer internen lokalen Adresse. Externe HTTPS-Quellen öffnen im Standardbrowser. Es gibt keine Telemetrie und keinen Cloud-Upload von Teams. Beim Abrufen externer Bilder, Schriftarten und Meta-Daten erhalten deren Anbieter technisch bedingt die üblichen Verbindungsdaten.

## Daten und Grenzen

Rechenbasis: Smogon Damage Calc 0.12.0, Champions-Modus, Level 50. Gegnerische Werte sind Annahmen; Ergebnisse hängen von den Einstellungen ab. Meta- und Turnierdaten nennen in der App ihren jeweiligen Datenstand und ihre Quellen. Die Desktop-Laufzeit wird nur bei einem neuen Build aktualisiert; Meta-Daten aktualisieren sich innerhalb der App.

Der geprüfte Verfügbarkeitssnapshot steht in `dist/champions-data.js`. Er kombiniert die offizielle M-C-Pokémonliste mit Champions-Learnsets und Fähigkeiten aus einem festgelegten Pokémon-Showdown-Commit. Mega- und Kampfformen erben von ihrer Ausgangsform; Attacken von Vorentwicklungen oder anderen Spielen werden nicht ergänzt. Reine Rechenhilfen wie „Aegislash-Both“ sind nicht auswählbar. Ein leerer Attackenplatz wird intern als `(No Move)` geführt. Teamklauseln und situationsabhängige Verwandlungen sind keine vollständige Turnier-Teamvalidierung.

Mit Node.js 24+ lässt sich der Snapshot über `node scripts/refresh-champions-data.mjs <showdown-commit-sha>` erneuern. Die offizielle Formzuordnung liegt unter `scripts/data/official-regulation-mc.json`; ändert sich die offizielle Liste, stoppt das Skript, bis die Zuordnung geprüft wurde. Ein neues Reglement erfordert eine bewusste Datenaktualisierung. Aktuelle Meta-Statistiken überschreiben diese Regeln nicht.

App-Updates werden in einem neuen Versionsordner installiert; der Datenspeicher bleibt unter demselben App-Namen erhalten. Vor dem Start der aktualisierten Version die bisherige App schließen. Vorhandene Versionsordner werden nicht automatisch gelöscht.

Siehe [THIRD_PARTY.md](THIRD_PARTY.md) für Quellen und Rechte. Inoffizielles Fanprojekt, ohne Verbindung zu Nintendo, Creatures, GAME FREAK oder The Pokémon Company.
