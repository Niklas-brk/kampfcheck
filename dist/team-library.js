/**
 * Benannte Team-Snapshots, getrennt vom aktuellen Arbeitsstand des Rechners.
 * create(storage, key) bindet eine Bibliothek an eine Storage-kompatible Quelle.
 * KEY und FOE_KEY trennen eigene und gegnerische Teams im selben Browser-Speicher.
 * Tests können dafür einen reinen In-Memory-Speicher übergeben.
 */
(function (root) {
  "use strict";
  const K = root.KampfCore,
    C = root.calc,
    G = K.G,
    KEY = "kampfcheck-library-v1",
    FOE_KEY = "kampfcheck-foe-library-v1";
  /**
   * Validiert sechs Sets und kopiert nur dauerhaft relevante Planungsdaten.
   * KP, Status, Boosts und manuelle Fähigkeitsaktivierung werden zurückgesetzt.
   * Diese Engine-/Strukturprüfung lässt alte, inzwischen unzulässige Sets lesbar;
   * aktuelle Champions-Legalität wird erst vor einem neuen Speichern verlangt.
   */
  function cleanTeam(team) {
    if (!Array.isArray(team) || team.length !== 6)
      throw new Error("Ein Team muss sechs Pokémon enthalten.");
    return team.map((s) => {
      if (!s || K.validate(s)) throw new Error("Prüfe die Pokémon und Statuspunkte deines Teams.");
      if (
        !Array.isArray(s.moves) ||
        s.moves.length !== 4 ||
        s.moves.some((m) => !G.moves.get(C.toID(m)))
      )
        throw new Error("Eine Attacke ist unbekannt.");
      if (s.item && !G.items.get(C.toID(s.item))) throw new Error("Ein Item ist unbekannt.");
      if (!G.abilities.get(C.toID(s.ability))) throw new Error("Eine Fähigkeit ist unbekannt.");
      return {
        species: s.species,
        nature: s.nature,
        points: Object.fromEntries(K.STATS.map((k) => [k, s.points[k]])),
        ability: s.ability,
        item: s.item || "",
        moves: [...s.moves],
        boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        hp: 0,
        status: "",
        abilityOn: false,
        ...(s.normalAbility && G.abilities.get(C.toID(s.normalAbility))
          ? { normalAbility: s.normalAbility }
          : {}),
        ...(typeof s.assumptionNote === "string"
          ? { assumptionNote: s.assumptionNote.slice(0, 300) }
          : {}),
      };
    });
  }
  /** Vergleichswert für ungespeicherte Änderungen, ohne temporäre Kampfzustände. */
  function signature(team, mode) {
    return JSON.stringify({
      team: cleanTeam(team),
      mode: mode === "Singles" ? "Singles" : "Doubles",
    });
  }
  /** Erstellt eine unabhängige Bibliotheks-API: load, upsert, rename und migrate. */
  function create(storage, key = KEY) {
    /**
     * Liest und prüft Version 1. Normalisierung betrifft nur das gelesene Objekt;
     * unbekannte Versionen oder beschädigte Inhalte werden niemals überschrieben.
     */
    function load() {
      let raw;
      try {
        raw = storage.getItem(key);
      } catch {
        throw new Error("Der Browser erlaubt gerade keinen Zugriff auf deine gespeicherten Teams.");
      }
      if (raw === null) return { version: 1, teams: [] };
      try {
        const data = JSON.parse(raw);
        if (data.version !== 1 || !Array.isArray(data.teams)) throw new Error();
        const ids = new Set();
        for (const record of data.teams) {
          if (
            !record ||
            typeof record.id !== "string" ||
            ids.has(record.id) ||
            typeof record.name !== "string" ||
            !record.name.trim() ||
            record.name.length > 60 ||
            !["Singles", "Doubles"].includes(record.mode)
          )
            throw new Error();
          ids.add(record.id);
          record.team = cleanTeam(record.team);
        }
        return data;
      } catch {
        throw new Error(
          "Deine Teamliste konnte nicht gelesen werden. Die gespeicherten Daten bleiben unverändert.",
        );
      }
    }
    // Ein fehlgeschlagener Storage-Schreibvorgang wird an die Oberfläche gemeldet.
    // Sie kann dadurch den noch nicht gespeicherten Entwurf weiter anzeigen.
    function write(data) {
      try {
        storage.setItem(key, JSON.stringify(data));
      } catch {
        throw new Error(
          "Das Team konnte nicht gespeichert werden. Der Browser-Speicher ist voll oder blockiert. Dein Entwurf bleibt erhalten.",
        );
      }
    }
    /**
     * Speichert neu oder ersetzt genau die angegebene ID. Namen sind innerhalb
     * dieser Bibliothek unabhängig von Groß-/Kleinschreibung eindeutig.
     * Gibt eine Kopie zurück, damit UI-Änderungen den Snapshot nicht verändern.
     */
    function upsert({ id, name, team, mode }) {
      const label = String(name || "").trim();
      if (!label || label.length > 60)
        throw new Error("Gib einen Teamnamen mit 1 bis 60 Zeichen ein.");
      const clean = cleanTeam(team);
      const illegal = clean.map((s) => root.KampfLegality?.validate(s)).find(Boolean);
      if (illegal) throw new Error(illegal);
      const data = load();
      if (id && !data.teams.some((t) => t.id === id))
        throw new Error(
          "Dieses gespeicherte Team ist nicht mehr vorhanden. Speichere es als neues Team.",
        );
      if (
        data.teams.some(
          (t) => t.id !== id && t.name.toLocaleLowerCase("de") === label.toLocaleLowerCase("de"),
        )
      )
        throw new Error("Dieser Teamname ist schon vergeben. Wähle einen anderen Namen.");
      const now = new Date().toISOString();
      const existing = data.teams.find((t) => t.id === id);
      const record = {
        id:
          id ||
          root.crypto?.randomUUID?.() ||
          "team-" + Date.now() + "-" + Math.random().toString(36).slice(2),
        name: label,
        mode: mode === "Singles" ? "Singles" : "Doubles",
        team: clean,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      data.teams = existing
        ? data.teams.map((t) => (t.id === id ? record : t))
        : [...data.teams, record];
      write(data);
      return structuredClone(record);
    }
    function rename(id, name) {
      const record = load().teams.find((t) => t.id === id);
      if (!record) throw new Error("Dieses Team wurde nicht gefunden.");
      return upsert({ ...record, name });
    }
    /**
     * Übernimmt den früheren Arbeitsstand einmalig, nur wenn der Schlüssel fehlt.
     * Auch eine leere oder beschädigte bestehende Bibliothek gilt als vorhanden.
     * Bei fehlendem Speicherzugriff bleibt die Migration ohne Schreibversuch aus.
     */
    function migrate(team, mode) {
      let exists;
      try {
        exists = storage.getItem(key) !== null;
      } catch {
        return null;
      }
      if (exists) return null;
      return upsert({ name: "Mein bisheriges Team", team, mode });
    }
    return { load, upsert, rename, migrate };
  }
  root.KampfLibrary = { create, cleanTeam, signature, KEY, FOE_KEY };
})(typeof window !== "undefined" ? window : globalThis);
