(function(root){
 'use strict';
 const D=root.KampfChampionsData,C=root.calc,G=root.KampfCore.G;
 const EMPTY='(No Move)',itemSet=new Set(D.items);
 const entry=name=>D.pokemon[name];
 const available=name=>!!entry(name);
 const moves=name=>(entry(name)?.moves||[]).map(n=>G.moves.get(C.toID(n))).filter(Boolean);
 const abilities=name=>(entry(name)?.abilities||[]).map(n=>G.abilities.get(C.toID(n))).filter(Boolean);
 const canMove=(name,move)=>move===EMPTY||!!entry(name)?.moves.includes(move);
 const canAbility=(name,ability)=>!!entry(name)?.abilities.includes(ability);
 const canItem=item=>!item||itemSet.has(item);
 const label=(kind,name)=>root.KampfGerman?.[kind]?.[name]||name;
 function issues(set){
  if(!available(set.species))return ['Dieses Pokémon bzw. diese Form ist im geprüften Champions-Datenstand nicht verfügbar.'];
  const errors=[];
  if(!canAbility(set.species,set.ability))errors.push(`Fähigkeit „${label('abilities',set.ability)}“ ist für dieses Pokémon nicht verfügbar.`);
  if(!canItem(set.item))errors.push(`Item „${label('items',set.item)}“ ist in Champions nicht verfügbar.`);
  if(!Array.isArray(set.moves)||set.moves.length!==4)errors.push('Es sind vier Attackenplätze erforderlich.');
  else {const seen=new Set();for(const move of set.moves){if(!canMove(set.species,move))errors.push(`„${label('moves',move)}“ kann dieses Pokémon in Champions nicht lernen.`);else if(move!==EMPTY){if(seen.has(move))errors.push(`„${label('moves',move)}“ ist doppelt eingetragen.`);seen.add(move);}}}
  const required=entry(set.species).requiredItem;
  if(set.species.includes('-Mega')&&required&&set.item!==required)errors.push(`Diese Mega-Form benötigt ${label('items',required)}.`);
  return errors;
 }
 function validate(set){return issues(set)[0]||'';}
 function prepare(set){
  if(!available(set.species))throw new Error('Dieses Pokémon ist in Champions nicht verfügbar.');
  const next={...set,moves:[]},seen=new Set();
  next.ability=canAbility(set.species,set.ability)?set.ability:entry(set.species).abilities[0];
  next.item=canItem(set.item)?set.item:'';
  if(set.species.includes('-Mega')&&entry(set.species).requiredItem)next.item=entry(set.species).requiredItem;
  for(const move of set.moves||[]){if(canMove(set.species,move)&&move!==EMPTY&&!seen.has(move)){next.moves.push(move);seen.add(move);}}
  while(next.moves.length<4)next.moves.push(EMPTY);next.moves=next.moves.slice(0,4);
  return next;
 }
 root.KampfLegality={data:D,EMPTY,entry,available,moves,abilities,canMove,canAbility,canItem,issues,validate,prepare};
})(typeof window!=='undefined'?window:globalThis);
