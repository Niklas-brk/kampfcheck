/* Integration layer for @smogon/calc 0.12.0 (MIT), Champions / generation 0. */
(function(root){
 'use strict';
 const C=root.calc,G=C.Generations.get(0),STATS=['hp','atk','def','spa','spd','spe'];
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
 function makePokemon(set){return new C.Pokemon(G,set.species,{nature:set.nature,evs:set.points,boosts:set.boosts,item:set.item||undefined,ability:set.ability,abilityOn:!!set.abilityOn,status:set.status||'',curHP:set.hp||undefined});}
 function makeField(field,reverse=false){
   const singles=field.gameType==='Singles';
   const prepareSide=side=>singles?{...side,isHelpingHand:false,isFriendGuard:false}:side;
   const own=prepareSide(field.own||{}),foe=prepareSide(field.foe||{});
   return new C.Field({gameType:singles?'Singles':'Doubles',weather:field.weather||undefined,terrain:field.terrain||undefined,isGravity:!!field.gravity,attackerSide:reverse?foe:own,defenderSide:reverse?own:foe});
 }
 function distribution(damage,isRoll=false){
   if(typeof damage==='number')return new Map([[damage,1]]);
   if(!Array.isArray(damage)||!damage.length)return new Map([[0,1]]);
   if(typeof damage[0]==='number'){if(!isRoll&&damage.length<16)return new Map([[damage.reduce((a,b)=>a+b,0),1]]);const m=new Map();for(const d of damage)m.set(d,(m.get(d)||0)+1/damage.length);return m;}
   let m=new Map([[0,1]]);for(const part of damage){const next=new Map();for(const [a,p]of m)for(const[b,q]of distribution(part,true))next.set(a+b,(next.get(a+b)||0)+p*q);m=next;}return m;
 }
 function hitOptions(set,moveName){const m=G.moves.get(C.toID(moveName));if(!m?.multihit)return [1];if(Array.isArray(m.multihit)){const [lo,hi]=m.multihit;if(set.ability==='Skill Link')return [hi];const min=set.item==='Loaded Dice'?Math.max(lo,4):lo;return Array.from({length:hi-min+1},(_,i)=>min+i);}return m.multiaccuracy?Array.from({length:m.multihit},(_,i)=>i+1):[m.multihit];}
 function analyze(attacker,defender,moveName,field,options={}){
   const a=makePokemon(attacker),d=makePokemon(defender),f=makeField(field,!!options.reverse);
   const moveData=G.moves.get(C.toID(moveName));
   const allowedHits=hitOptions(attacker,moveName),requestedHits=allowedHits.includes(options.hits)?options.hits:allowedHits.length===1?allowedHits[0]:a.item==='Loaded Dice'?allowedHits[0]:undefined;
   const move=new C.Move(G,moveName,{ability:a.ability,item:a.item,isCrit:!!options.crit,hits:requestedHits,overrides:f.gameType==='Doubles'&&field.spread===false&&['allAdjacent','allAdjacentFoes'].includes(moveData?.target)?{target:'normal'}:undefined});
   // Use a neutral status move to read the engine's final speed even for immune matchups.
   const speeds=C.calculate(G,a,d,new C.Move(G,'(No Move)'),f);
   const result=C.calculate(G,a,d,move,f),[min,max]=result.range(),hp=d.curHP(),maxHP=d.maxHP();
   let ko=0;for(const[damage,p]of distribution(result.damage))if(damage>=hp)ko+=p;
   const damage=result.damage,actualHits=Array.isArray(damage)&&(typeof damage[0]!=='number'||damage.length<16)?damage.length:1;
   const single=move.hits===1&&actualHits===1;
   const sash=result.defender.hasItem('Focus Sash');
   const sturdy=result.defender.hasAbility('Sturdy');
   const survivalGuard=hp===maxHP&&single&&max>=hp&&(sash||sturdy);
   ko=survivalGuard?0:clamp(Math.round(ko*1e12)/1e12,0,1);
   const conditional=['Sucker Punch','Fake Out','First Impression','Last Resort','Dream Eater','Belch'].includes(moveName);
   const uncertain=['Fissure','Guillotine','Horn Drill','Sheer Cold'].includes(moveName)||d.hasAbility('Disguise')||d.hasItem('Focus Band')||(move.category!=='Status'&&move.bp===0&&max===0);
   return {result,min,max,hp,maxHP,ko:clamp(ko,0,1),survive:clamp(1-ko,0,1),remainingMin:survivalGuard?Math.max(1,hp-max):Math.max(0,hp-max),remainingMax:survivalGuard?Math.max(1,hp-min):Math.max(0,hp-min),survivalGuard,guardName:sash?'Fokusgurt':'Robustheit',single,conditional,uncertain,category:move.category,type:move.type,hits:move.hits,priority:move.priority,attackerSpeed:speeds.attacker.stats.spe,defenderSpeed:speeds.defender.stats.spe};
 }
 function effectivePriority(set,moveName,field){const move=new C.Move(G,moveName),pokemon=makePokemon(set);const grounded=field.gravity||pokemon.hasItem('Iron Ball')||(!pokemon.hasType('Flying')&&!pokemon.hasAbility('Levitate','Eelevate')&&!pokemon.hasItem('Air Balloon'));let p=move.priority;if(set.ability==='Prankster'&&move.category==='Status')p++;if(set.ability==='Gale Wings'&&move.type==='Flying'&&(!set.hp||set.hp===pokemon.maxHP()))p++;if(set.ability==='Triage'&&move.flags?.heal)p+=3;if(moveName==='Grassy Glide'&&field.terrain==='Grassy'&&grounded)p++;return p;}
 function order(own,foe,field,ownMove,foeMove,ignorePriority=false){const r=analyze(own,foe,'(No Move)',field),ap=ignorePriority?0:effectivePriority(own,ownMove,field),bp=ignorePriority?0:effectivePriority(foe,foeMove,field);let winner,reason;
   if(ap!==bp){winner=ap>bp?'own':'foe';reason='Attackenpriorität';}
   else if(r.attackerSpeed===r.defenderSpeed){winner='tie';reason='Gleiche Initiative';}
   else {winner=(r.attackerSpeed>r.defenderSpeed)!==!!field.trickRoom?'own':'foe';reason=field.trickRoom?'Bizarroraum':'Initiative';}
   return {...r,winner,reason,ownPriority:ap,foePriority:bp};
 }
 function validate(set){if(!G.species.get(C.toID(set.species)))return 'Unbekanntes Pokémon';let sum=0;for(const stat of STATS){const p=set.points?.[stat];if(!Number.isInteger(p)||p<0||p>32)return 'Je Statuswert sind 0–32 Punkte möglich.';sum+=p;}if(sum>66)return 'Insgesamt sind höchstens 66 Statuspunkte möglich.';if(!G.natures.get(C.toID(set.nature)))return 'Unbekanntes Wesen';return '';}
 root.KampfCore={G,STATS,makePokemon,makeField,distribution,hitOptions,analyze,effectivePriority,order,validate,clamp};
})(typeof window!=='undefined'?window:globalThis);
