/* German effect filters for held items. Descriptions describe the primary battle effect.
 * Sources: Pokemon Showdown item data and mechanics (retrieved 2026-09-21):
 * https://play.pokemonshowdown.com/data/items.js
 * https://github.com/smogon/pokemon-showdown/blob/master/data/items.ts
 * Mega associations: the bundled @smogon/calc Champions data; species labels: german.json.
 * Covers every item in the current 166-item Champions engine, plus Weakness Policy.
 * This catalogue does not decide format legality or change battle calculations.
 */
(function (root) {
  'use strict';
  root.KampfItemEffects = {
  "categories": [
    {
      "id": "healing",
      "label": "Heilung"
    },
    {
      "id": "power",
      "label": "Stärke"
    },
    {
      "id": "defense",
      "label": "Schutz"
    },
    {
      "id": "speed",
      "label": "Initiative"
    },
    {
      "id": "status",
      "label": "Status"
    },
    {
      "id": "utility",
      "label": "Taktik"
    },
    {
      "id": "mega",
      "label": "Mega-Steine"
    },
    {
      "id": "berries",
      "label": "Beeren"
    }
  ],
  "entries": {
    "Abomasite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Rexblisar."
    },
    "Absolite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Absol."
    },
    "Absolite Z": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Absol Z."
    },
    "Aerodactylite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Aerodactyl."
    },
    "Aggronite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Stolloss."
    },
    "Air Balloon": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Lässt den Träger schweben und schützt dadurch vor Boden-Attacken. Zerplatzt bei einem Treffer."
    },
    "Alakazite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Simsala."
    },
    "Altarianite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Altaria."
    },
    "Ampharosite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Ampharos."
    },
    "Aspear Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Gefrieren."
    },
    "Audinite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Ohrdoch."
    },
    "Babiri Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Stahl-Treffer gegen den Träger ab."
    },
    "Banettite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Banette."
    },
    "Barbaracite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Thanathora."
    },
    "Baxcalibrite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Espinodon."
    },
    "Beedrillite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Bibor."
    },
    "Big Root": {
      "categories": [
        "healing"
      ],
      "description": "Erhöht die KP-Rückgewinnung durch Entzugseffekte wie Gigasauger, Egelsamen oder Verwurzler."
    },
    "Binding Band": {
      "categories": [
        "power",
        "utility"
      ],
      "description": "Erhöht den wiederkehrenden Fesselschaden von Attacken wie Wickel oder Feuerwirbel."
    },
    "Black Belt": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Kampf-Attacken des Trägers."
    },
    "Black Glasses": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Unlicht-Attacken des Trägers."
    },
    "Blastoisinite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Turtok."
    },
    "Blazikenite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Lohgock."
    },
    "Bright Powder": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Senkt die Genauigkeit gegnerischer Attacken gegen den Träger."
    },
    "Cameruptite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Camerupt."
    },
    "Chandelurite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Skelabra."
    },
    "Charcoal": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Feuer-Attacken des Trägers."
    },
    "Charizardite X": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Glurak X."
    },
    "Charizardite Y": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Glurak Y."
    },
    "Charti Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Gestein-Treffer gegen den Träger ab."
    },
    "Cheri Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Paralyse."
    },
    "Chesnaughtite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Brigaron."
    },
    "Chesto Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Schlaf."
    },
    "Chilan Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen Normal-Treffer gegen den Träger ab; auch ohne Typenschwäche."
    },
    "Chimechite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Palimpalim."
    },
    "Choice Scarf": {
      "categories": [
        "speed"
      ],
      "description": "Erhöht die Initiative, legt den Träger aber bis zum Auswechseln auf eine Attacke fest."
    },
    "Chople Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Kampf-Treffer gegen den Träger ab."
    },
    "Clefablite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Pixi."
    },
    "Coba Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Flug-Treffer gegen den Träger ab."
    },
    "Colbur Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Unlicht-Treffer gegen den Träger ab."
    },
    "Crabominite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Krawell."
    },
    "Damp Rock": {
      "categories": [
        "utility"
      ],
      "description": "Verlängert Regen, wenn der Träger dieses Wetter erzeugt."
    },
    "Delphoxite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Fennexis."
    },
    "Dragalgite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Tandrak."
    },
    "Dragon Fang": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Drache-Attacken des Trägers."
    },
    "Dragoninite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Dragoran."
    },
    "Drampanite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Sen-Long."
    },
    "Eelektrossite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Zapplarang."
    },
    "Eject Button": {
      "categories": [
        "utility"
      ],
      "description": "Wechselt den Träger nach einem überlebten Treffer einmalig gegen einen gewählten Mitstreiter aus."
    },
    "Electric Seed": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Erhöht bei aktivem Elektrofeld einmalig die Verteidigung des Trägers."
    },
    "Emboarite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Flambirex."
    },
    "Excadrite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Stalobor."
    },
    "Expert Belt": {
      "categories": [
        "power"
      ],
      "description": "Erhöht den Schaden der eigenen sehr effektiven Attacken."
    },
    "Fairy Feather": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Fee-Attacken des Trägers."
    },
    "Falinksite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Legios."
    },
    "Feraligite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Impergator."
    },
    "Floettite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Floette."
    },
    "Focus Band": {
      "categories": [
        "defense"
      ],
      "description": "Kann einen sonst besiegenden Treffer mit 1 KP überleben lassen; der Effekt ist zufällig."
    },
    "Focus Sash": {
      "categories": [
        "defense"
      ],
      "description": "Lässt den Träger bei vollen KP einen sonst besiegenden Treffer einmalig mit 1 KP überleben."
    },
    "Froslassite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Frosdedje."
    },
    "Galladite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Galagladi."
    },
    "Garchompite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Knakrack."
    },
    "Garchompite Z": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Knakrack Z."
    },
    "Gardevoirite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Guardevoir."
    },
    "Gengarite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Gengar."
    },
    "Glalitite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Firnontor."
    },
    "Glimmoranite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Lumiflora."
    },
    "Golisopite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Tectass."
    },
    "Golurkite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Golgantes."
    },
    "Grassy Seed": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Erhöht bei aktivem Grasfeld einmalig die Verteidigung des Trägers."
    },
    "Greninjite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Quajutsu."
    },
    "Gyaradosite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Garados."
    },
    "Haban Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Drache-Treffer gegen den Träger ab."
    },
    "Hard Stone": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Gestein-Attacken des Trägers."
    },
    "Hawluchanite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Resladero."
    },
    "Heat Rock": {
      "categories": [
        "utility"
      ],
      "description": "Verlängert Sonnenschein, wenn der Träger dieses Wetter erzeugt."
    },
    "Heracronite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Skaraborn."
    },
    "Houndoominite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Hundemon."
    },
    "Icy Rock": {
      "categories": [
        "utility"
      ],
      "description": "Verlängert Schnee, wenn der Träger dieses Wetter erzeugt."
    },
    "Iron Ball": {
      "categories": [
        "speed",
        "utility"
      ],
      "description": "Senkt die Initiative und holt den Träger auf den Boden; er wird dadurch für Boden-Attacken erreichbar."
    },
    "Kangaskhanite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Kangama."
    },
    "Kasib Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Geist-Treffer gegen den Träger ab."
    },
    "Kebia Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Gift-Treffer gegen den Träger ab."
    },
    "King's Rock": {
      "categories": [
        "status",
        "utility"
      ],
      "description": "Gibt Attacken ohne eigenen Zurückschreck-Effekt eine Chance, das Ziel zurückschrecken zu lassen."
    },
    "Leek": {
      "categories": [
        "power"
      ],
      "description": "Erhöht bei Porenta und Lauchzelot die Volltrefferchance."
    },
    "Leftovers": {
      "categories": [
        "healing"
      ],
      "description": "Stellt am Ende jeder Runde einen Teil der maximalen KP wieder her."
    },
    "Leppa Berry": {
      "categories": [
        "utility",
        "berries"
      ],
      "description": "Füllt einmalig die AP einer Attacke auf, sobald deren AP aufgebraucht sind."
    },
    "Life Orb": {
      "categories": [
        "power"
      ],
      "description": "Erhöht den Attackenschaden, kostet den Träger nach dem Angriff aber KP."
    },
    "Light Ball": {
      "categories": [
        "power"
      ],
      "description": "Erhöht bei Pikachu Angriff und Spezial-Angriff."
    },
    "Light Clay": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Verlängert die vom Träger eingesetzten Effekte von Reflektor, Lichtschild und Auroraschleier."
    },
    "Lopunnite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Schlapor."
    },
    "Lucarionite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Lucario."
    },
    "Lucarionite Z": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Lucario Z."
    },
    "Lum Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von einer Statusveränderung oder Verwirrung."
    },
    "Magnet": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Elektro-Attacken des Trägers."
    },
    "Malamarite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Calamanero."
    },
    "Manectite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Voltenso."
    },
    "Mawilite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Flunkifer."
    },
    "Medichamite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Meditalis."
    },
    "Meganiumite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Meganie."
    },
    "Mental Herb": {
      "categories": [
        "status",
        "utility"
      ],
      "description": "Befreit einmalig von Anziehung, Aussetzer, Zugabe, Heilblockade, Verhöhner und Folterknecht."
    },
    "Meowsticite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Psiaugon."
    },
    "Metagrossite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Metagross."
    },
    "Metal Coat": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Stahl-Attacken des Trägers."
    },
    "Metronome": {
      "categories": [
        "power"
      ],
      "description": "Erhöht den Schaden, wenn der Träger dieselbe Attacke wiederholt hintereinander einsetzt."
    },
    "Miracle Seed": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Pflanze-Attacken des Trägers."
    },
    "Misty Seed": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Erhöht bei aktivem Nebelfeld einmalig die Spezial-Verteidigung des Trägers."
    },
    "Muscle Band": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die physischen Attacken des Trägers."
    },
    "Mystic Water": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Wasser-Attacken des Trägers."
    },
    "Never-Melt Ice": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Eis-Attacken des Trägers."
    },
    "Normal Gem": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt einmalig die nächste erfolgreiche Normal-Attacke des Trägers."
    },
    "Occa Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Feuer-Treffer gegen den Träger ab."
    },
    "Oran Berry": {
      "categories": [
        "healing",
        "berries"
      ],
      "description": "Stellt einmalig KP wieder her, sobald höchstens die Hälfte der maximalen KP verbleibt."
    },
    "Passho Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Wasser-Treffer gegen den Träger ab."
    },
    "Payapa Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Psycho-Treffer gegen den Träger ab."
    },
    "Pecha Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Vergiftung."
    },
    "Persim Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Verwirrung."
    },
    "Pidgeotite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Tauboss."
    },
    "Pinsirite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Pinsir."
    },
    "Poison Barb": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Gift-Attacken des Trägers."
    },
    "Psychic Seed": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Erhöht bei aktivem Psychofeld einmalig die Spezial-Verteidigung des Trägers."
    },
    "Pyroarite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Pyroleo."
    },
    "Quick Claw": {
      "categories": [
        "speed",
        "utility"
      ],
      "description": "Lässt den Träger manchmal innerhalb derselben Attackenpriorität zuerst handeln; erhöht keine Initiative."
    },
    "Raichunite X": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Raichu X."
    },
    "Raichunite Y": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Raichu Y."
    },
    "Rawst Berry": {
      "categories": [
        "status",
        "berries"
      ],
      "description": "Befreit den Träger einmalig von Verbrennung."
    },
    "Red Card": {
      "categories": [
        "utility"
      ],
      "description": "Zwingt nach einem überlebten Treffer den Angreifer einmalig zum Wechsel auf einen zufälligen Mitstreiter."
    },
    "Rindo Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Pflanze-Treffer gegen den Träger ab."
    },
    "Rocky Helmet": {
      "categories": [
        "defense",
        "utility"
      ],
      "description": "Fügt Angreifern KP-Schaden zu, wenn sie den Träger mit einer Kontaktattacke treffen."
    },
    "Roseli Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Fee-Treffer gegen den Träger ab."
    },
    "Sablenite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Zobiris."
    },
    "Salamencite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Brutalanda."
    },
    "Sceptilite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Gewaldro."
    },
    "Scizorite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Scherox."
    },
    "Scolipite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Cerapendra."
    },
    "Scope Lens": {
      "categories": [
        "power"
      ],
      "description": "Erhöht die Volltrefferchance des Trägers."
    },
    "Scovillainite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Halupenjo."
    },
    "Scraftinite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Irokex."
    },
    "Sharp Beak": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Flug-Attacken des Trägers."
    },
    "Sharpedonite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Tohaido."
    },
    "Shed Shell": {
      "categories": [
        "utility"
      ],
      "description": "Erlaubt dem Träger das Auswechseln auch dann, wenn ein Effekt ihn festhalten würde."
    },
    "Shell Bell": {
      "categories": [
        "healing"
      ],
      "description": "Stellt nach einem Angriff KP wieder her; die Heilung richtet sich nach dem zugefügten Schaden."
    },
    "Shuca Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Boden-Treffer gegen den Träger ab."
    },
    "Silk Scarf": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Normal-Attacken des Trägers."
    },
    "Silver Powder": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Käfer-Attacken des Trägers."
    },
    "Sitrus Berry": {
      "categories": [
        "healing",
        "berries"
      ],
      "description": "Heilt einmalig einen Teil der maximalen KP, sobald höchstens die Hälfte der KP verbleibt."
    },
    "Skarmorite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Panzaeron."
    },
    "Slowbronite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Lahmus."
    },
    "Smooth Rock": {
      "categories": [
        "utility"
      ],
      "description": "Verlängert Sandsturm, wenn der Träger dieses Wetter erzeugt."
    },
    "Soft Sand": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Boden-Attacken des Trägers."
    },
    "Spell Tag": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Geist-Attacken des Trägers."
    },
    "Staraptite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Staraptor."
    },
    "Starminite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Starmie."
    },
    "Steelixite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Stahlos."
    },
    "Swampertite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Sumpex."
    },
    "Tanga Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Käfer-Treffer gegen den Träger ab."
    },
    "Terrain Extender": {
      "categories": [
        "utility"
      ],
      "description": "Verlängert vom Träger erzeugtes Elektrofeld, Grasfeld, Nebelfeld und Psychofeld."
    },
    "Twisted Spoon": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die Psycho-Attacken des Trägers."
    },
    "Tyranitarite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Despotar."
    },
    "Venusaurite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Bisaflor."
    },
    "Victreebelite": {
      "categories": [
        "mega"
      ],
      "description": "Ermöglicht die Entwicklung zu Mega-Sarzenia."
    },
    "Wacan Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Elektro-Treffer gegen den Träger ab."
    },
    "Weakness Policy": {
      "categories": [
        "power"
      ],
      "description": "Erhöht einmalig Angriff und Spezial-Angriff, wenn der Träger sehr effektiv getroffen wird."
    },
    "White Herb": {
      "categories": [
        "status",
        "utility"
      ],
      "description": "Hebt gesenkte Statuswertstufen des Trägers einmalig auf."
    },
    "Wide Lens": {
      "categories": [
        "utility"
      ],
      "description": "Erhöht die Genauigkeit der eigenen Attacken."
    },
    "Wise Glasses": {
      "categories": [
        "power"
      ],
      "description": "Verstärkt die speziellen Attacken des Trägers."
    },
    "Yache Berry": {
      "categories": [
        "defense",
        "berries"
      ],
      "description": "Schwächt einmalig einen sehr effektiven Eis-Treffer gegen den Träger ab."
    },
    "Zoom Lens": {
      "categories": [
        "utility"
      ],
      "description": "Erhöht die Genauigkeit, wenn der Träger nach seinem Ziel handelt."
    }
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
