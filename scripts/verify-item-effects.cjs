const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// The static catalogue must load independently of the calculation engine and UI.
const catalogueFile = path.join(__dirname, '../dist/item-effects.js');
const browser = { window: {} };
vm.runInNewContext(fs.readFileSync(catalogueFile, 'utf8'), browser);
const catalogue = JSON.parse(JSON.stringify(browser.window.KampfItemEffects));
assert(catalogue, 'Publishes window.KampfItemEffects without other scripts');
const { categories, entries } = catalogue;
assert.deepEqual(categories, [
  { id: 'healing', label: 'Heilung' },
  { id: 'power', label: 'Stärke' },
  { id: 'defense', label: 'Schutz' },
  { id: 'speed', label: 'Initiative' },
  { id: 'status', label: 'Status' },
  { id: 'utility', label: 'Taktik' },
  { id: 'mega', label: 'Mega-Steine' },
  { id: 'berries', label: 'Beeren' },
]);
const validCategories = new Set(categories.map(category => category.id));
for (const [name, entry] of Object.entries(entries)) {
  assert(entry.description.length >= 12, `${name}: explanatory German description`);
  assert(entry.categories.length > 0, `${name}: at least one effect category`);
  assert.equal(new Set(entry.categories).size, entry.categories.length, `${name}: no duplicate tags`);
  for (const tag of entry.categories) assert(validCategories.has(tag), `${name}: known tag ${tag}`);
}

global.window = global;
require('../dist/vendor/calc-data.min.js');
require('../dist/vendor/calc.min.js');
const availableItems = [...calc.Generations.get(0).items];
for (const item of availableItems) {
  assert(entries[item.name], `Missing bundled item: ${item.name}`);
  if (item.megaStone) assert(entries[item.name].categories.includes('mega'), `${item.name}: Mega stone`);
  if (item.name.endsWith(' Berry')) assert(entries[item.name].categories.includes('berries'), `${item.name}: Berry`);
}

const has = (name, tag) => entries[name].categories.includes(tag);
for (const name of ['Sitrus Berry', 'Oran Berry', 'Leftovers', 'Shell Bell', 'Big Root']) {
  assert(has(name, 'healing'), `${name}: HP recovery filter`);
}
assert(has('Sitrus Berry', 'berries'));
assert(has('Lum Berry', 'status') && has('Lum Berry', 'berries'));
assert(!has('Lum Berry', 'healing'), 'Status recovery must not promise restored HP');
assert(has('Leppa Berry', 'utility') && !has('Leppa Berry', 'healing'), 'PP recovery is not HP recovery');
for (const name of ['Life Orb', 'Expert Belt', 'Weakness Policy']) assert(has(name, 'power'));
for (const name of ['Choice Scarf', 'Iron Ball', 'Quick Claw']) assert(has(name, 'speed'));
assert(!has('Choice Scarf', 'power'), 'Choice Scarf does not increase attack damage');
for (const name of ['Focus Sash', 'Focus Band', 'Shuca Berry', 'Electric Seed']) assert(has(name, 'defense'));
assert(!has('Shuca Berry', 'power'), 'Resistance berries protect their holder');
assert.match(entries['Chilan Berry'].description, /auch ohne Typenschwäche/);
assert.match(entries['Focus Band'].description, /zufällig/);
assert.match(entries['Focus Sash'].description, /vollen KP/);
assert.match(entries['Quick Claw'].description, /keine Initiative/);
assert.match(entries['Garchompite Z'].description, /Mega-Knakrack Z/);
assert.match(entries.Meowsticite.description, /Mega-Psiaugon/);
assert(!/Meowstic|mega-z|\(mega\)/.test(entries.Meowsticite.description + entries['Garchompite Z'].description));

console.log(`Item effect checks passed: ${availableItems.length} bundled items covered, ${Object.keys(entries).length} descriptions, ${categories.length} filter categories.`);
