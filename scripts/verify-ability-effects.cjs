/** Regressionen für ausgelöste Fähigkeiten und ihre sichtbaren Statusstufen. */
const assert = require("node:assert/strict");

global.window = global;
require("../dist/vendor/calc-data.min.js");
require("../dist/vendor/calc.min.js");
require("../dist/core.js");

const Core = KampfCore;
const field = { gameType: "Doubles", own: {}, foe: {} };

function pokemon(species, ability, overrides = {}) {
  return {
    species,
    ability,
    abilityOn: false,
    nature: "Serious",
    item: "",
    status: "",
    points: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ...overrides,
  };
}

function withStage(set, stat, stage) {
  return { ...set, boosts: { ...set.boosts, [stat]: stage } };
}

function range(attacker, defender, move, options = {}) {
  const result = Core.analyze(attacker, defender, move, field, options);
  return [result.min, result.max];
}

const milotic = pokemon("Milotic", "Competitive");
const incineroar = pokemon("Incineroar", "Intimidate");
const intimidator = { ...incineroar, abilityOn: true };
const annihilape = pokemon("Annihilape", "Defiant");

// Der alte allgemeine Haken änderte Milotics Schaden nicht. Die neue Aktion
// muss die Statusstufe sichtbar ändern und dadurch die tatsächliche Rechnung.
assert.deepEqual(range(milotic, incineroar, "Scald"), [102, 120]);
assert.deepEqual(range({ ...milotic, abilityOn: true }, incineroar, "Scald"), [102, 120]);
assert.deepEqual(Core.abilityActivation(milotic, incineroar, field), {
  stat: "spa",
  amount: 2,
  stages: 0,
  effectiveStages: 0,
  automatic: false,
  atLimit: false,
});
const activatedMilotic = Core.applyAbilityActivation(milotic, incineroar, field);
assert.equal(activatedMilotic.boosts.spa, 2);
assert.deepEqual(range(activatedMilotic, incineroar, "Scald"), [198, 234]);
assert.deepEqual(range(annihilape, incineroar, "Close Combat"), [168, 198]);
const activatedAnnihilape = Core.applyAbilityActivation(annihilape, incineroar, field);
assert.equal(activatedAnnihilape.boosts.atk, 2);
assert.deepEqual(range(activatedAnnihilape, incineroar, "Close Combat"), [332, 392]);

// Bedroher löst beide Fähigkeiten bereits in der Engine aus. Der manuelle
// Knopf darf denselben Effekt weder links noch rechts ein zweites Mal addieren.
for (const reverse of [false, true]) {
  const competitive = Core.abilityActivation(milotic, intimidator, field, reverse);
  assert.equal(competitive.automatic, true);
  assert.equal(competitive.effectiveStages, 2);
  assert.strictEqual(Core.applyAbilityActivation(milotic, intimidator, field, reverse), milotic);
  assert.deepEqual(range(milotic, intimidator, "Scald", { reverse }), [198, 234]);
  const defiant = Core.abilityActivation(annihilape, intimidator, field, reverse);
  assert.equal(defiant.automatic, true);
  assert.equal(defiant.effectiveStages, 1); // Angriff −1, danach Siegeswille +2.
  assert.strictEqual(
    Core.applyAbilityActivation(annihilape, intimidator, field, reverse),
    annihilape,
  );
  assert.deepEqual(range(annihilape, intimidator, "Close Combat", { reverse }), [248, 294]);
  const defendingMilotic = Core.analyze(intimidator, milotic, "(No Move)", field, {
    reverse,
  });
  assert.equal(defendingMilotic.result.defender.boosts.spa, 2);
}

// Manuelle Stufen können frühere Auslösungen darstellen und bleiben erhalten:
// +2 aus der Vergangenheit und ein neuer Bedroher ergeben zusammen +4.
const repeated = Core.analyze(activatedMilotic, intimidator, "Scald", field);
assert.equal(repeated.result.attacker.boosts.spa, 4);
assert.equal(activatedMilotic.boosts.spa, 2);

// Neutralschmuck blockiert Bedroher. Ein früherer, manuell eingetragener Bonus
// bleibt trotzdem möglich; das Item darf nicht jede Eingabe pauschal sperren.
for (const set of [milotic, annihilape]) {
  const protectedSet = { ...set, item: "Clear Amulet" };
  const activation = Core.abilityActivation(protectedSet, intimidator, field);
  assert.equal(activation.automatic, false);
  assert.equal(activation.effectiveStages, 0);
  const applied = Core.applyAbilityActivation(protectedSet, intimidator, field);
  assert.equal(applied.boosts[activation.stat], 2);
}
assert.deepEqual(range({ ...milotic, item: "Clear Amulet" }, intimidator, "Scald"), [102, 120]);

// Bei Angriff −6 kann Bedroher keinen Wert mehr senken. Dann dürfen auch
// Unbeugsamkeit und Siegeswille keinen automatischen Folgebonus erhalten.
for (const set of [milotic, annihilape]) {
  const bottomedOut = withStage(set, "atk", -6);
  assert.equal(Core.abilityActivation(bottomedOut, intimidator, field).automatic, false);
  for (const reverse of [false, true]) {
    const attacking = Core.analyze(bottomedOut, intimidator, "(No Move)", field, {
      reverse,
    });
    const defending = Core.analyze(intimidator, bottomedOut, "(No Move)", field, {
      reverse,
    });
    for (const resultSet of [attacking.result.attacker, defending.result.defender]) {
      assert.equal(resultSet.boosts.atk, -6);
      assert.equal(resultSet.boosts.spa, 0);
    }
  }
}

// Wiederholte Aktionen sind bewusst möglich, überschreiten aber nie +6.
for (const [set, stat] of [
  [milotic, "spa"],
  [annihilape, "atk"],
]) {
  let current = withStage(set, stat, -6);
  for (const expected of [-4, -2, 0, 2, 4, 6]) {
    current = Core.applyAbilityActivation(current, incineroar, field);
    assert.equal(current.boosts[stat], expected);
  }
  assert.equal(Core.abilityActivation(current, incineroar, field).atLimit, true);
  assert.strictEqual(Core.applyAbilityActivation(current, incineroar, field), current);
  assert.equal(
    Core.applyAbilityActivation(withStage(set, stat, 5), incineroar, field).boosts[stat],
    6,
  );
}

// Die API liefert neue Daten zurück und verändert weder den Entwurf noch
// verschachtelte Statusstufen. Veraltete Hakenwerte werden dabei zurückgesetzt.
const frozen = Object.freeze({
  ...milotic,
  abilityOn: true,
  points: Object.freeze({ ...milotic.points }),
  boosts: Object.freeze({ ...milotic.boosts }),
});
const appliedFrozen = Core.applyAbilityActivation(frozen, incineroar, field);
assert.notStrictEqual(appliedFrozen, frozen);
assert.notStrictEqual(appliedFrozen.boosts, frozen.boosts);
assert.equal(appliedFrozen.abilityOn, false);
assert.equal(frozen.abilityOn, true);
assert.equal(frozen.boosts.spa, 0);
assert.deepEqual(appliedFrozen.points, frozen.points);
assert.equal(intimidator.abilityOn, true);

// Notschutz hängt am Statusfeld, nicht an einer freien Aktivierung. Andere
// unterstützte Engine-Schalter wie Entlastung müssen unverändert funktionieren.
const marvelScale = pokemon("Milotic", "Marvel Scale");
const garchomp = pokemon("Garchomp", "Rough Skin");
assert.equal(Core.abilityActivation(marvelScale, garchomp, field), null);
assert.strictEqual(Core.applyAbilityActivation(marvelScale, garchomp, field), marvelScale);
assert.deepEqual(range(garchomp, marvelScale, "Dragon Claw"), [69, 82]);
assert.deepEqual(range(garchomp, { ...marvelScale, abilityOn: true }, "Dragon Claw"), [69, 82]);
assert.deepEqual(range(garchomp, { ...marvelScale, status: "par" }, "Dragon Claw"), [46, 55]);
const hawlucha = pokemon("Hawlucha", "Unburden");
assert.equal(Core.abilityActivation(hawlucha, incineroar, field), null);
assert.equal(Core.order(hawlucha, incineroar, field, "Tackle", "Tackle").attackerSpeed, 138);
assert.equal(
  Core.order({ ...hawlucha, abilityOn: true }, incineroar, field, "Tackle", "Tackle").attackerSpeed,
  276,
);

console.log(
  "Ability checks passed: manual Competitive/Defiant, actual damage, automatic Intimidate in both directions, Clear Amulet, −6/+6 limits, repeated activations, immutable sets, Marvel Scale status and Unburden speed.",
);
