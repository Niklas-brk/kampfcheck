/**
 * Gemeinsame Hilfen für den Teambau: Wesen, Mega-Formen, Typentabelle und Hinweise.
 * KampfTeam nutzt dieselbe Champions-Engine wie der Rechner, speichert aber
 * selbst keine Teams. Die Hinweise sind Planungshilfen, keine Turniervalidierung.
 */
(function (root) {
  "use strict";
  const C = root.calc,
    G = root.KampfCore.G;
  const statNames = {
    hp: "KP",
    atk: "Angriff",
    def: "Verteidigung",
    spa: "Spezial-Angriff",
    spd: "Spezial-Verteidigung",
    spe: "Initiative",
  };
  const natures = {
    Adamant: "Hart",
    Bashful: "Zaghaft",
    Bold: "Kühn",
    Brave: "Mutig",
    Calm: "Still",
    Careful: "Sacht",
    Docile: "Sanft",
    Gentle: "Zart",
    Hardy: "Robust",
    Hasty: "Hastig",
    Impish: "Pfiffig",
    Jolly: "Froh",
    Lax: "Lasch",
    Lonely: "Solo",
    Mild: "Mild",
    Modest: "Mäßig",
    Naive: "Naiv",
    Naughty: "Frech",
    Quiet: "Ruhig",
    Quirky: "Kauzig",
    Rash: "Hitzig",
    Relaxed: "Locker",
    Sassy: "Forsch",
    Serious: "Ernst",
    Timid: "Scheu",
  };
  const species = [...G.species],
    items = [...G.items];
  /** Liefert erhöhte/gesenkte Werte; bei neutralen oder unbekannten Wesen jeweils null. */
  function natureEffect(name) {
    const nature = G.natures.get(C.toID(name));
    return !nature || nature.plus === nature.minus
      ? { plus: null, minus: null }
      : { plus: nature.plus, minus: nature.minus };
  }
  // Mega-Steine beschreiben die tatsächlichen Ausgangsformen. Ein bloßes
  // Entfernen von „-Mega“ wäre z. B. bei Floette-Eternal und Meowstic-F falsch.
  const megaLinks = items.flatMap((i) =>
    Object.entries(i.megaStone || {}).map(([base, mega]) => ({ base, mega, item: i.name })),
  );
  /** Verfügbare Ausgangs- und Mega-Formen, mit der Ausgangsform an erster Stelle. */
  function forms(name) {
    const base = megaLinks.find((link) => link.mega === name)?.base || name;
    return [base, ...megaLinks.filter((link) => link.base === base).map((link) => link.mega)]
      .map((formName) => G.species.get(C.toID(formName)))
      .filter((form) => form && (!root.KampfLegality || root.KampfLegality.available(form.name)));
  }
  function megaItem(name) {
    return items.find((i) => i.megaStone && Object.values(i.megaStone).includes(name))?.name || "";
  }
  /**
   * Erstellt einen Entwurf für eine verwandte Form. SP bleiben erhalten;
   * KP und der manuelle Fähigkeits-Schalter werden zurückgesetzt.
   * normalAbility merkt sich die gewählte Fähigkeit für den Rückwechsel.
   * KampfLegality bereinigt danach Attacken, Fähigkeit und Mega-Stein.
   */
  function switchForm(set, name) {
    if (!forms(set.species).some((s) => s.name === name))
      throw new Error("Diese Form gehört nicht zu diesem Pokémon.");
    if (name === set.species) return { ...set };
    const mega = name.includes("-Mega"),
      wasMega = set.species.includes("-Mega");
    const next = { ...set, species: name, hp: 0, abilityOn: false };
    if (!wasMega) next.normalAbility = set.ability;
    next.ability = mega
      ? G.species.get(C.toID(name)).abilities[0]
      : set.normalAbility || G.species.get(C.toID(name)).abilities[0];
    if (mega && megaItem(name)) next.item = megaItem(name);
    return root.KampfLegality ? root.KampfLegality.prepare(next) : next;
  }
  function itemCategory(item) {
    if (item.megaStone) return "mega";
    if (item.isBerry || item.name.endsWith(" Berry")) return "berries";
    return "other";
  }
  /**
   * Reiner Typenfaktor ohne Fähigkeiten, Items, Wetter oder sonstige Kampfeffekte.
   * Solche Effekte gehören in die eigentliche Schadensberechnung mit KampfCore.
   */
  function typeFactor(attackType, set) {
    const defending = G.species.get(C.toID(set.species));
    return defending.types.reduce(
      (factor, defendingType) =>
        factor * (G.types.get(C.toID(attackType))?.effectiveness[defendingType] ?? 1),
      1,
    );
  }
  /** Eine Zeile je Angriffstyp mit Faktoren und zusammengefassten Häufigkeiten. */
  function typeRows(team) {
    return [...G.types]
      .filter((t) => t.name !== "???")
      .map((t) => {
        const factors = team.map((s) => typeFactor(t.name, s));
        return {
          type: t.name,
          factors,
          weak: factors.filter((x) => x >= 2).length,
          quad: factors.filter((x) => x >= 4).length,
          resist: factors.filter((x) => x > 0 && x < 1).length,
          immune: factors.filter((x) => x === 0).length,
        };
      });
  }
  /** Heuristische Hinweise zu Dopplungen, Mega-Nutzung, Tempo und Schadenskategorien. */
  function teamNotes(team, mode) {
    const notes = [];
    const moveNames = team.flatMap((s) => s.moves);
    const duplicates = (key) => [
      ...new Set(
        team
          .map((s) =>
            key === "species" ? G.species.get(C.toID(s.species)).baseSpecies || s.species : s[key],
          )
          .filter((v, i, a) => v && a.indexOf(v) !== i),
      ),
    ];
    if (duplicates("species").length)
      notes.push(
        "Ein Pokémon ist mehrfach enthalten. Prüfe die Artenklausel des gewählten Reglements.",
      );
    if (duplicates("item").length)
      notes.push(
        "Ein Item ist mehrfach vergeben. In offiziellen Champions-Kämpfen gilt die Item-Klausel.",
      );
    const megas = team.filter((s) => s.species.includes("-Mega"));
    if (megas.length > 1)
      notes.push(
        "Mehrere Mega-Formen geplant: Pro Kampf ist nur eine Mega-Entwicklung möglich. Vergleiche die übrigen Pokémon auch in ihrer Normalform.",
      );
    if (megas.some((s) => megaItem(s.species) && s.item !== megaItem(s.species)))
      notes.push("Mindestens einer Mega-Form fehlt der passende Mega-Stein.");
    if (
      mode === "Doubles" &&
      !moveNames.some((m) =>
        ["Tailwind", "Trick Room", "Icy Wind", "Electroweb", "Thunder Wave"].includes(m),
      )
    )
      notes.push(
        "Keine der typischen Tempo-Attacken eingeplant. Gegen Rückenwind- oder Bizarroraum-Teams solltest du deinen Tempo-Plan im Rechner prüfen.",
      );
    if (
      mode === "Doubles" &&
      moveNames.filter((m) =>
        [
          "Protect",
          "Detect",
          "Spiky Shield",
          "Baneful Bunker",
          "Silk Trap",
          "Burning Bulwark",
        ].includes(m),
      ).length < 2
    )
      notes.push(
        "Wenig Schutzschild: Prüfe, wie du im Doppel gezielte Doppelangriffe und gegnerische Feld-Effekte abfängst.",
      );
    const attacks = team
      .flatMap((s) => s.moves.map((m) => G.moves.get(C.toID(m))))
      .filter((m) => m && m.category !== "Status");
    if (attacks.length && !attacks.some((m) => m.category === "Special"))
      notes.push(
        "Nur physische Schadensattacken: hohe Verteidigung und Bedroher können das gesamte Team bremsen.",
      );
    if (attacks.length && !attacks.some((m) => m.category === "Physical"))
      notes.push(
        "Nur spezielle Schadensattacken: hohe Spezial-Verteidigung und Lichtschild können das gesamte Team bremsen.",
      );
    return notes;
  }
  // Gemeinsame API für Teambauer, Bibliothek und aus Nutzungsdaten erzeugte Entwürfe.
  root.KampfTeam = {
    statNames,
    natures,
    natureEffect,
    forms,
    megaItem,
    switchForm,
    itemCategory,
    typeFactor,
    typeRows,
    teamNotes,
  };
})(typeof window !== "undefined" ? window : globalThis);
