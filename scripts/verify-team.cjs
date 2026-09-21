const assert=require('node:assert/strict');
global.window=global;global.localStorage={getItem:()=>null,setItem:()=>{}};
require('../dist/vendor/calc-data.min.js');require('../dist/vendor/calc.min.js');require('../dist/core.js');require('../dist/team-tools.js');require('../dist/item-icons.js');require('../dist/meta-snapshot.js');require('../dist/meta.js');require('../dist/templates.js');
const T=KampfTeam,K=KampfCore,G=K.G;
const set={species:'Charizard',ability:'Solar Power',nature:'Timid',points:{hp:2,atk:0,def:0,spa:32,spd:0,spe:32},boosts:{},moves:['Heat Wave','Air Slash','Protect','Solar Beam'],item:'Life Orb',hp:5};
assert.deepEqual(T.natureEffect('Adamant'),{plus:'atk',minus:'spa'});assert.deepEqual(T.natureEffect('Serious'),{plus:null,minus:null});
assert.equal([...G.natures].filter(n=>T.natureEffect(n.name).plus===null).length,5);
const mega=T.switchForm(set,'Charizard-Mega-Y');assert.equal(mega.ability,'Drought');assert.equal(mega.item,'Charizardite Y');assert.deepEqual(mega.points,set.points);assert.deepEqual(mega.moves,set.moves);assert.equal(T.switchForm(mega,'Charizard').ability,'Solar Power');assert.equal(set.item,'Life Orb');
assert.deepEqual(T.switchForm(set,set.species),set);
assert(T.teamNotes([set,mega],'Doubles').some(n=>n.includes('Artenklausel')));
assert.deepEqual(T.forms('Floette-Mega').map(s=>s.name),['Floette-Eternal','Floette-Mega']);assert.deepEqual(T.forms('Meowstic-F-Mega').map(s=>s.name),['Meowstic-F','Meowstic-F-Mega']);
assert.equal(T.typeFactor('Rock',set),4);assert.equal(T.typeFactor('Ground',set),0);assert.equal(T.typeFactor('Ground',T.switchForm(set,'Charizard-Mega-X')),2);
for(const i of G.items)assert(Number.isInteger(KampfItemIcons[i.id]),i.name);
for(const t of KampfTemplates.teams){assert.equal(t.sets.length,6);for(const s of t.sets){assert(G.species.get(calc.toID(s.species)));assert(G.natures.get(calc.toID(s.nature)));assert(G.items.get(calc.toID(s.item)));assert(G.abilities.get(calc.toID(s.ability)));assert.equal(s.moves.length,4);s.moves.forEach(m=>assert(G.moves.get(calc.toID(m))));}}
for(const mode of ['Singles','Doubles'])for(const draft of KampfMeta.suggestions(mode)){assert.equal(draft.pokemon.length,6);const used=new Set();for(const p of draft.pokemon){const s=KampfMeta.usageSet(p,name=>({...set,species:name}),used);assert.equal(K.validate(s),'');assert.equal(s.moves.length,4);}}
console.log('Team checks passed: all 166 icons, all 25 natures, Mega form roundtrip and special bases, typing, all Worlds sets and generated drafts.');
(async()=>{let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>KampfMetaSnapshot.formats.Singles};};await KampfMeta.refresh('Singles');assert.equal(calls,1);await KampfMeta.refresh('Singles');assert.equal(calls,1);await KampfMeta.refresh('Singles',null,true);assert.equal(calls,2);const original=KampfMeta.feeds.Singles;global.fetch=async()=>{throw new Error('offline');};await KampfMeta.refresh('Singles',null,true);assert.equal(KampfMeta.status.Singles,'offline');assert.equal(KampfMeta.feeds.Singles,original);console.log('Meta checks passed: daily cache, manual refresh and offline fallback.');})().catch(e=>{console.error(e);process.exitCode=1;});
