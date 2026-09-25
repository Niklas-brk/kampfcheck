/**
 * Adapter zwischen Kampfcheck und @smogon/calc 0.12.0 (MIT).
 * Generation 0 bezeichnet in dieser Bibliothek Pokémon Champions. Die Engine
 * rechnet mit Level 50; das historisch „evs“ genannte Feld enthält Statuspunkte,
 * keine klassischen EVs. Die öffentliche Browser-API heißt KampfCore.
 */
(function (root) {
  "use strict";
  const C = root.calc,
    G = C.Generations.get(0),
    STATS = ["hp", "atk", "def", "spa", "spd", "spe"];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
  /** Wandelt ein UI-Set in ein neues Engine-Pokémon um. hp: 0 bedeutet volle KP. */
  function makePokemon(set) {
    return new C.Pokemon(G, set.species, {
      nature: set.nature,
      evs: set.points,
      boosts: set.boosts,
      item: set.item || undefined,
      ability: set.ability,
      abilityOn: !!set.abilityOn,
      status: set.status || "",
      curHP: set.hp || undefined,
    });
  }
  /**
   * Ordnet eigene/gegnerische Feldhälfte Angreifer und Verteidiger zu.
   * „reverse“ kehrt die Angriffsrichtung um. Einzelkämpfe ignorieren Partnerboni;
   * die Engine benötigt den Spielmodus auch für die Stärke der Schutzschirme.
   */
  function makeField(field, reverse = false) {
    const singles = field.gameType === "Singles";
    const prepareSide = (side) =>
      singles ? { ...side, isHelpingHand: false, isFriendGuard: false } : side;
    const own = prepareSide(field.own || {}),
      foe = prepareSide(field.foe || {});
    return new C.Field({
      gameType: singles ? "Singles" : "Doubles",
      weather: field.weather || undefined,
      terrain: field.terrain || undefined,
      isGravity: !!field.gravity,
      attackerSide: reverse ? foe : own,
      defenderSide: reverse ? own : foe,
    });
  }
  /**
   * Liefert eine Map aus Gesamtschaden und Wahrscheinlichkeit.
   * Die Engine liefert entweder festen Schaden, 16 gleich wahrscheinliche
   * Schadenswürfe oder mehrere Treffer. Kurze Zahlenlisten auf oberster Ebene
   * sind feste Trefferfolgen; verschachtelte Würfe werden miteinander gefaltet.
   * Die Verteilung setzt voraus, dass die berechneten Treffer tatsächlich treffen.
   */
  function distribution(damage, isRoll = false) {
    if (typeof damage === "number") return new Map([[damage, 1]]);
    if (!Array.isArray(damage) || !damage.length) return new Map([[0, 1]]);
    if (typeof damage[0] === "number") {
      if (!isRoll && damage.length < 16)
        return new Map([[damage.reduce((total, hitDamage) => total + hitDamage, 0), 1]]);
      const probabilities = new Map();
      for (const roll of damage)
        probabilities.set(roll, (probabilities.get(roll) || 0) + 1 / damage.length);
      return probabilities;
    }
    let combined = new Map([[0, 1]]);
    for (const part of damage) {
      const next = new Map();
      for (const [previousDamage, previousProbability] of combined)
        for (const [hitDamage, hitProbability] of distribution(part, true))
          next.set(
            previousDamage + hitDamage,
            (next.get(previousDamage + hitDamage) || 0) + previousProbability * hitProbability,
          );
      combined = next;
    }
    return combined;
  }
  /** Erlaubte Trefferzahlen laut Engine; keine Gewichtung ihrer Eintrittschance. */
  function hitOptions(set, moveName) {
    const move = G.moves.get(C.toID(moveName));
    if (!move?.multihit) return [1];
    if (Array.isArray(move.multihit)) {
      const [minimum, maximum] = move.multihit;
      if (set.ability === "Skill Link") return [maximum];
      const firstHitCount = set.item === "Loaded Dice" ? Math.max(minimum, 4) : minimum;
      return Array.from(
        { length: maximum - firstHitCount + 1 },
        (_, index) => firstHitCount + index,
      );
    }
    return move.multiaccuracy
      ? Array.from({ length: move.multihit }, (_, index) => index + 1)
      : [move.multihit];
  }
  /**
   * Berechnet einen Angriff mit Schaden, direkten Rest-KP und KO-Wahrscheinlichkeit.
   * Optionen: reverse (Richtung), crit (Volltreffer), hits (Trefferzahl).
   * Genauigkeit und spätere Rundeneffekte sind nicht Teil der KO-Wahrscheinlichkeit.
   * conditional/uncertain liefern der Oberfläche Hinweise auf Sonderfälle.
   */
  function analyze(attacker, defender, moveName, field, options = {}) {
    const attackerPokemon = makePokemon(attacker),
      defenderPokemon = makePokemon(defender),
      battleField = makeField(field, !!options.reverse);
    // Bei bereits -6 Angriff kann Bedroher nichts mehr senken. Die Engine 0.12.0
    // löst Unbeugsamkeit/Siegeswille sonst trotzdem aus; eine echte Senkung ist nötig.
    for (const [source, target] of [
      [attackerPokemon, defenderPokemon],
      [defenderPokemon, attackerPokemon],
    ]) {
      if (
        source.hasAbility("Intimidate") &&
        target.hasAbility("Competitive", "Defiant") &&
        target.boosts.atk === -6
      )
        source.abilityOn = false;
    }
    const moveData = G.moves.get(C.toID(moveName));
    const allowedHits = hitOptions(attacker, moveName),
      requestedHits = allowedHits.includes(options.hits)
        ? options.hits
        : allowedHits.length === 1
          ? allowedHits[0]
          : attackerPokemon.item === "Loaded Dice"
            ? allowedHits[0]
            : undefined;
    const move = new C.Move(G, moveName, {
      ability: attackerPokemon.ability,
      item: attackerPokemon.item,
      isCrit: !!options.crit,
      hits: requestedHits,
      overrides:
        battleField.gameType === "Doubles" &&
        field.spread === false &&
        ["allAdjacent", "allAdjacentFoes"].includes(moveData?.target)
          ? { target: "normal" }
          : undefined,
    });
    // Eine neutrale Statusattacke liefert die finalen Initiativen auch dann,
    // wenn die eigentliche Attacke wegen einer Immunität vorzeitig abgebrochen wird.
    const speeds = C.calculate(
      G,
      attackerPokemon,
      defenderPokemon,
      new C.Move(G, "(No Move)"),
      battleField,
    );
    const result = C.calculate(G, attackerPokemon, defenderPokemon, move, battleField),
      [min, max] = result.range(),
      hp = defenderPokemon.curHP(),
      maxHP = defenderPokemon.maxHP();
    let ko = 0;
    for (const [damage, probability] of distribution(result.damage))
      if (damage >= hp) ko += probability;
    // Familienbande kann mehrere Schadensanteile liefern, obwohl move.hits 1 ist.
    const damage = result.damage,
      actualHits =
        Array.isArray(damage) && (typeof damage[0] !== "number" || damage.length < 16)
          ? damage.length
          : 1;
    const single = move.hits === 1 && actualHits === 1;
    // Die vom Ergebnis zurückgegebene Verteidigerkopie berücksichtigt bereits
    // durch die Engine unterdrückte Fähigkeiten. Schutz gilt nur bei vollen KP
    // und einem einzelnen Treffer, nicht für eine komplette Mehrfachtrefferfolge.
    const sash = result.defender.hasItem("Focus Sash");
    const sturdy = result.defender.hasAbility("Sturdy");
    const survivalGuard = hp === maxHP && single && max >= hp && (sash || sturdy);
    ko = survivalGuard ? 0 : clamp(Math.round(ko * 1e12) / 1e12, 0, 1);
    const conditional = [
      "Sucker Punch",
      "Fake Out",
      "First Impression",
      "Last Resort",
      "Dream Eater",
      "Belch",
    ].includes(moveName);
    const uncertain =
      ["Fissure", "Guillotine", "Horn Drill", "Sheer Cold"].includes(moveName) ||
      defenderPokemon.hasAbility("Disguise") ||
      defenderPokemon.hasItem("Focus Band") ||
      (move.category !== "Status" && move.bp === 0 && max === 0);
    return {
      result,
      min,
      max,
      hp,
      maxHP,
      ko: clamp(ko, 0, 1),
      survive: clamp(1 - ko, 0, 1),
      remainingMin: survivalGuard ? Math.max(1, hp - max) : Math.max(0, hp - max),
      remainingMax: survivalGuard ? Math.max(1, hp - min) : Math.max(0, hp - min),
      survivalGuard,
      guardName: sash ? "Fokusgurt" : "Robustheit",
      single,
      conditional,
      uncertain,
      category: move.category,
      type: move.type,
      hits: move.hits,
      priority: move.priority,
      attackerSpeed: speeds.attacker.stats.spe,
      defenderSpeed: speeds.defender.stats.spe,
    };
  }
  /**
   * Manche ausgelösten Fähigkeiten werden als Statusstufe erfasst, nicht als
   * abilityOn-Schalter. Die Engine-Auswertung erkennt eine bereits automatisch
   * berechnete Bedroher-Reaktion und verhindert einen zusätzlichen Klick-Bonus.
   */
  function abilityActivation(set, opponent, field, reverse = false) {
    const stat = { Competitive: "spa", Defiant: "atk" }[set.ability];
    if (!stat) return null;
    const stages = set.boosts?.[stat] || 0;
    const effectiveStages = analyze(set, opponent, "(No Move)", field, { reverse }).result.attacker
      .boosts[stat];
    return {
      stat,
      amount: 2,
      stages,
      effectiveStages,
      automatic: effectiveStages > stages,
      atLimit: stages >= 6,
    };
  }
  /** Trägt eine bestätigte frühere Auslösung ein; verändert das ursprüngliche Set nie. */
  function applyAbilityActivation(set, opponent, field, reverse = false) {
    const activation = abilityActivation(set, opponent, field, reverse);
    if (!activation || activation.automatic || activation.atLimit) return set;
    return {
      ...set,
      abilityOn: false,
      boosts: {
        ...set.boosts,
        [activation.stat]: Math.min(6, activation.stages + activation.amount),
      },
    };
  }
  /** Attackenpriorität einschließlich der hier unterstützten Fähigkeiten/Feldeffekte. */
  function effectivePriority(set, moveName, field) {
    const move = new C.Move(G, moveName),
      pokemon = makePokemon(set);
    const grounded =
      field.gravity ||
      pokemon.hasItem("Iron Ball") ||
      (!pokemon.hasType("Flying") &&
        !pokemon.hasAbility("Levitate", "Eelevate") &&
        !pokemon.hasItem("Air Balloon"));
    let priority = move.priority;
    if (set.ability === "Prankster" && move.category === "Status") priority++;
    if (
      set.ability === "Gale Wings" &&
      move.type === "Flying" &&
      (!set.hp || set.hp === pokemon.maxHP())
    )
      priority++;
    if (set.ability === "Triage" && move.flags?.heal) priority += 3;
    if (moveName === "Grassy Glide" && field.terrain === "Grassy" && grounded) priority++;
    return priority;
  }
  /**
   * Bestimmt die Zugreihenfolge: zuerst Priorität, dann Initiative/Bizarroraum.
   * ignorePriority dient reinen Initiativevergleichen. Ein Gleichstand bleibt
   * „tie“; die Oberfläche darf daraus keinen sicheren Erstangriff ableiten.
   */
  function order(own, foe, field, ownMove, foeMove, ignorePriority = false) {
    const result = analyze(own, foe, "(No Move)", field),
      ownPriority = ignorePriority ? 0 : effectivePriority(own, ownMove, field),
      foePriority = ignorePriority ? 0 : effectivePriority(foe, foeMove, field);
    let winner, reason;
    if (ownPriority !== foePriority) {
      winner = ownPriority > foePriority ? "own" : "foe";
      reason = "Attackenpriorität";
    } else if (result.attackerSpeed === result.defenderSpeed) {
      winner = "tie";
      reason = "Gleiche Initiative";
    } else {
      winner = result.attackerSpeed > result.defenderSpeed !== !!field.trickRoom ? "own" : "foe";
      reason = field.trickRoom ? "Bizarroraum" : "Initiative";
    }
    return { ...result, winner, reason, ownPriority, foePriority };
  }
  /**
   * Prüft Engine-Artnamen, Wesen und SP-Grenzen (0–32 je Wert, insgesamt 66).
   * Liefert den ersten Fehler oder ''. Aktuelle Verfügbarkeit und erlernbare
   * Attacken prüft zusätzlich KampfLegality; diese Funktion ersetzt das nicht.
   */
  function validate(set) {
    if (!G.species.get(C.toID(set.species))) return "Unbekanntes Pokémon";
    let totalPoints = 0;
    for (const stat of STATS) {
      const points = set.points?.[stat];
      if (!Number.isInteger(points) || points < 0 || points > 32)
        return "Je Statuswert sind 0–32 Punkte möglich.";
      totalPoints += points;
    }
    if (totalPoints > 66) return "Insgesamt sind höchstens 66 Statuspunkte möglich.";
    if (!G.natures.get(C.toID(set.nature))) return "Unbekanntes Wesen";
    return "";
  }
  // Globale Namen und Rückgabeformen werden von UI und Node-Prüfskripten verwendet.
  root.KampfCore = {
    G,
    STATS,
    makePokemon,
    makeField,
    distribution,
    hitOptions,
    analyze,
    abilityActivation,
    applyAbilityActivation,
    effectivePriority,
    order,
    validate,
    clamp,
  };
})(typeof window !== "undefined" ? window : globalThis);
