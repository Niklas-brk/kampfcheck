// Build a reviewable snapshot from Pokémon Showdown's Champions-specific data.
import fs from "node:fs/promises";
import vm from "node:vm";
import { stripTypeScriptTypes, createRequire } from "node:module";
const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require("../dist/vendor/calc-data.min.js");
require("../dist/vendor/calc.min.js");
const G = calc.Generations.get(0),
  id = calc.toID;
const revision = process.argv[2] || "f10d6798f2ba5af92e55892c8c7063ca7b53c18a";
if (!/^[a-f0-9]{40}$/.test(revision))
  throw new Error("Pass an immutable Pokémon Showdown commit SHA.");
const base = `https://raw.githubusercontent.com/smogon/pokemon-showdown/${revision}/data/`;
async function table(file) {
  const response = await fetch(base + file);
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  const source = stripTypeScriptTypes(await response.text()).replace(
    /export const \w+\s*=/,
    "globalThis.table =",
  );
  const context = {};
  vm.runInNewContext(source, context, { timeout: 5000 });
  return context.table;
}
const [
  pokedex,
  formats,
  learnsets,
  baseMoves,
  modMoves,
  baseItems,
  modItems,
  baseAbilities,
  modAbilities,
] = await Promise.all([
  table("pokedex.ts"),
  table("mods/champions/formats-data.ts"),
  table("mods/champions/learnsets.ts"),
  table("moves.ts"),
  table("mods/champions/moves.ts"),
  table("items.ts"),
  table("mods/champions/items.ts"),
  table("abilities.ts"),
  table("mods/champions/abilities.ts"),
]);
const merged = (base, mod, key) =>
  mod[key]?.inherit ? { ...base[key], ...mod[key] } : mod[key] || base[key];
const official = JSON.parse(
  await fs.readFile(
    new URL("data/official-regulation-mc.json", import.meta.url),
    "utf8",
  ),
);
const officialIds = new Set(official.pokemon.map((p) => p.showdownId));
const officialPage = await fetch(official.source);
if (!officialPage.ok)
  throw new Error("Official regulation source is unavailable.");
const officialHtml = await officialPage.text();
const liveRows = JSON.parse(
  officialHtml.match(/const pokemons\s*=\s*(\[[\s\S]*?\]);/)?.[1] || "null",
);
if (!Array.isArray(liveRows))
  throw new Error("Official Pokémon list could not be read.");
const liveAllowed = new Set(
  liveRows.filter((r) => r[1] === 1).map((r) => r[0]),
);
if (
  liveAllowed.size !== official.pokemon.length ||
  official.pokemon.some((p) => !liveAllowed.has(p.officialId))
)
  throw new Error(
    "Official list changed. Review the form mapping before updating the snapshot.",
  );
function allowedForm(key, seen = new Set()) {
  if (officialIds.has(key)) return true;
  if (seen.has(key)) return false;
  seen.add(key);
  const p = pokedex[key];
  if (!p) return false;
  const from = p.changesFrom || p.battleOnly;
  if (from) return allowedForm(id(Array.isArray(from) ? from[0] : from), seen);
  if (p.forme?.includes("Mega") && p.baseSpecies)
    return allowedForm(id(p.baseSpecies), seen);
  // Cosmetic forms sharing all battle properties use their official representative.
  return [...officialIds].some((key) => {
    const parent = pokedex[key];
    return (
      parent?.num === p.num &&
      ["baseStats", "types", "abilities"].every(
        (k) => JSON.stringify(p[k]) === JSON.stringify(parent[k]),
      )
    );
  });
}
function learnable(key, seen = new Set()) {
  if (seen.has(key)) return [];
  seen.add(key);
  const entry = learnsets[key],
    pokemon = pokedex[key];
  if (!pokemon) return [];
  const own = Object.keys(entry?.learnset || {});
  // Champions never inherits a pre-evolution's learnset, or a main-series learnset.
  const change = pokemon.changesFrom || pokemon.battleOnly;
  const parent =
    (Array.isArray(change) ? change[0] : change) ||
    (!entry?.learnset ? pokemon.baseSpecies : null);
  return [...new Set([...own, ...(parent ? learnable(id(parent), seen) : [])])];
}
const pokemon = {};
for (const s of G.species) {
  const key = s.id === "aegislashshield" ? "aegislash" : s.id;
  const data = pokedex[key],
    format =
      formats[key] ||
      (data?.baseSpecies ? formats[id(data.baseSpecies)] : null);
  if (
    !data ||
    !format ||
    format.isNonstandard ||
    format.tier === "Illegal" ||
    data.isNonstandard ||
    !allowedForm(key)
  )
    continue;
  const moves = learnable(key)
    .filter((m) => {
      const move = merged(baseMoves, modMoves, m);
      return move && !move.isNonstandard && G.moves.get(m) && m !== "struggle";
    })
    .map((m) => G.moves.get(m).name);
  // The species' own slots are authoritative. New Champions-only abilities can
  // still have a Future marker in Showdown's inherited main-series ability table.
  const abilities = [
    ...new Set(
      Object.entries(data.abilities)
        .filter(
          ([slot]) =>
            ["0", "1", "H"].includes(slot) &&
            (slot !== "H" || !format.unreleasedHidden),
        )
        .map(([, name]) => name),
    ),
  ].filter((name) => G.abilities.get(id(name)));
  if (!moves.length || !abilities.length)
    throw new Error(`Missing Champions learnset or ability for ${s.name}`);
  pokemon[s.name] = {
    moves: moves.sort(),
    abilities,
    baseSpecies: data.baseSpecies || data.name,
    ...(data.requiredItem ? { requiredItem: data.requiredItem } : {}),
    ...(data.battleOnly ? { battleOnly: data.battleOnly } : {}),
  };
}
const items = [...G.items]
  .filter((i) => {
    const item = merged(baseItems, modItems, i.id);
    return item && !item.isNonstandard;
  })
  .map((i) => i.name)
  .sort();
if (Object.keys(pokemon).length < 250 || items.length < 70)
  throw new Error("Incomplete snapshot; existing file was not overwritten.");
const snapshot = {
  version: 1,
  checkedAt: new Date().toISOString().slice(0, 10),
  regulation: official.regulation,
  regulationSource: official.regulationSource,
  eligibleSource: official.source,
  validUntil: official.endsAt,
  source: "https://github.com/smogon/pokemon-showdown",
  revision,
  pokemon,
  items,
};
await fs.writeFile(
  "dist/champions-data.js",
  "/* Pokémon Showdown Champions snapshot; see THIRD_PARTY.md. */\nwindow.KampfChampionsData = " +
    JSON.stringify(snapshot) +
    ";\n",
);
console.log(
  `${Object.keys(pokemon).length} Pokémon/forms, ${items.length} items; source ${revision}`,
);
