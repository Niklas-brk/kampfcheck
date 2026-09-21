/* Named snapshots are stored separately from the calculator's working team. */
(function(root){
 'use strict';
 const K=root.KampfCore,C=root.calc,G=K.G,KEY='kampfcheck-library-v1',FOE_KEY='kampfcheck-foe-library-v1';
 function cleanTeam(team){
  if(!Array.isArray(team)||team.length!==6)throw new Error('Ein Team muss sechs Pokémon enthalten.');
  return team.map(s=>{if(!s||K.validate(s))throw new Error('Prüfe die Pokémon und Statuspunkte deines Teams.');if(!Array.isArray(s.moves)||s.moves.length!==4||s.moves.some(m=>!G.moves.get(C.toID(m))))throw new Error('Eine Attacke ist unbekannt.');if(s.item&&!G.items.get(C.toID(s.item)))throw new Error('Ein Item ist unbekannt.');if(!G.abilities.get(C.toID(s.ability)))throw new Error('Eine Fähigkeit ist unbekannt.');return{species:s.species,nature:s.nature,points:Object.fromEntries(K.STATS.map(k=>[k,s.points[k]])),ability:s.ability,item:s.item||'',moves:[...s.moves],boosts:{atk:0,def:0,spa:0,spd:0,spe:0},hp:0,status:'',abilityOn:false,...(s.normalAbility&&G.abilities.get(C.toID(s.normalAbility))?{normalAbility:s.normalAbility}:{}),...(typeof s.assumptionNote==='string'?{assumptionNote:s.assumptionNote.slice(0,300)}:{})};});
 }
 function signature(team,mode){return JSON.stringify({team:cleanTeam(team),mode:mode==='Singles'?'Singles':'Doubles'});}
 function create(storage,key=KEY){
  function load(){let raw;try{raw=storage.getItem(key);}catch{throw new Error('Der Browser erlaubt gerade keinen Zugriff auf deine gespeicherten Teams.');}if(raw===null)return{version:1,teams:[]};try{const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.teams))throw new Error();const ids=new Set();for(const r of data.teams){if(!r||typeof r.id!=='string'||ids.has(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>60||!['Singles','Doubles'].includes(r.mode))throw new Error();ids.add(r.id);r.team=cleanTeam(r.team);}return data;}catch{throw new Error('Deine Teamliste konnte nicht gelesen werden. Die gespeicherten Daten bleiben unverändert.');}}
  function write(data){try{storage.setItem(key,JSON.stringify(data));}catch{throw new Error('Das Team konnte nicht gespeichert werden. Der Browser-Speicher ist voll oder blockiert. Dein Entwurf bleibt erhalten.');}}
  function upsert({id,name,team,mode}){const label=String(name||'').trim();if(!label||label.length>60)throw new Error('Gib einen Teamnamen mit 1 bis 60 Zeichen ein.');const clean=cleanTeam(team),data=load();if(id&&!data.teams.some(t=>t.id===id))throw new Error('Dieses gespeicherte Team ist nicht mehr vorhanden. Speichere es als neues Team.');if(data.teams.some(t=>t.id!==id&&t.name.toLocaleLowerCase('de')===label.toLocaleLowerCase('de')))throw new Error('Dieser Teamname ist schon vergeben. Wähle einen anderen Namen.');const now=new Date().toISOString();const existing=data.teams.find(t=>t.id===id);const record={id:id||(root.crypto?.randomUUID?.()||'team-'+Date.now()+'-'+Math.random().toString(36).slice(2)),name:label,mode:mode==='Singles'?'Singles':'Doubles',team:clean,createdAt:existing?.createdAt||now,updatedAt:now};data.teams=existing?data.teams.map(t=>t.id===id?record:t):[...data.teams,record];write(data);return structuredClone(record);}
  function rename(id,name){const record=load().teams.find(t=>t.id===id);if(!record)throw new Error('Dieses Team wurde nicht gefunden.');return upsert({...record,name});}
  function migrate(team,mode){let exists;try{exists=storage.getItem(key)!==null;}catch{return null;}if(exists)return null;return upsert({name:'Mein bisheriges Team',team,mode});}
  return{load,upsert,rename,migrate};
 }
 root.KampfLibrary={create,cleanTeam,signature,KEY,FOE_KEY};
})(typeof window!=='undefined'?window:globalThis);
