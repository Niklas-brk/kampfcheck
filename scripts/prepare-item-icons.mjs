import fs from 'node:fs/promises';
import vm from 'node:vm';
const res=await fetch('https://play.pokemonshowdown.com/data/items.js');if(!res.ok)throw new Error('Item data unavailable');
const sandbox={exports:{}};vm.runInNewContext(await res.text(),sandbox,{timeout:1000});
const icons=Object.fromEntries(Object.entries(sandbox.exports.BattleItems).filter(([,v])=>Number.isInteger(v.spritenum)).map(([k,v])=>[k,v.spritenum]));
await fs.writeFile('dist/item-icons.js','window.KampfItemIcons = '+JSON.stringify(icons)+';\n');
const image=await fetch('https://play.pokemonshowdown.com/sprites/itemicons-sheet.png?v1');if(!image.ok)throw new Error('Item sprites unavailable');
await fs.writeFile('dist/vendor/itemicons.png',Buffer.from(await image.arrayBuffer()));
console.log('Item icon data prepared:',Object.keys(icons).length);
