(function(root){
 'use strict';
 const K=root.KampfCore,G=K.G,C=root.calc;
 const urls={Singles:'https://poke.itlibra.com/opendata/usage-championssingles.json',Doubles:'https://poke.itlibra.com/opendata/usage-champions.json'};
 const feeds={...root.KampfMetaSnapshot.formats},status={Singles:'snapshot',Doubles:'snapshot'},checked={};
 function valid(d,mode){return d&&d.gameType===mode.toLowerCase()&&typeof d.label==='string'&&d.label.length<100&&/^\d{4}-\d{2}$/.test(d.month)&&Array.isArray(d.pokemon)&&d.pokemon.length>5&&d.pokemon.length<=1000&&d.pokemon.every(p=>typeof p.name==='string'&&Number.isFinite(p.usage)&&p.usage>=0&&p.usage<=100&&Array.isArray(p.items)&&Array.isArray(p.moves)&&Array.isArray(p.teammates));}
 for(const mode of Object.keys(urls)){try{const cached=JSON.parse(localStorage.getItem('kampfcheck-meta-'+mode)||'null');if(cached&&valid(cached.data,mode)&&cached.data.month>=feeds[mode].month){feeds[mode]=cached.data;checked[mode]=cached.checkedAt;status[mode]='cached';}}catch{}}
 const pending={};
 async function refresh(mode,notify,force=false){if(pending[mode])return pending[mode];if(!force&&checked[mode]&&Date.now()-Date.parse(checked[mode])<86400000){notify?.();return;}status[mode]='loading';pending[mode]=(async()=>{try{const res=await fetch(urls[mode],{signal:AbortSignal.timeout(12000),credentials:'omit'});if(!res.ok)throw new Error('HTTP');const d=await res.json();if(!valid(d,mode)||d.month<feeds[mode].month)throw new Error('Data');feeds[mode]=d;status[mode]='live';checked[mode]=new Date().toISOString();try{localStorage.setItem('kampfcheck-meta-'+mode,JSON.stringify({data:d,checkedAt:checked[mode]}));}catch{}}catch{status[mode]='offline';}finally{delete pending[mode];notify?.();}})();return pending[mode];}
 function usageSet(p,makeSet,usedItems=new Set()){
  const s=makeSet(p.name),spread=p.spreads?.find(x=>G.natures.get(C.toID(x.nature))&&Array.isArray(x.evs)&&x.evs.length===6&&x.evs.every(v=>Number.isInteger(v)&&v>=0&&v<=32)&&x.evs.reduce((a,b)=>a+b,0)<=66);
  if(spread){s.nature=spread.nature;s.points=Object.fromEntries(K.STATS.map((k,i)=>[k,spread.evs[i]]));}
  const ability=p.abilities?.map(a=>G.abilities.get(C.toID(a.id))).find(Boolean);if(ability)s.ability=ability.name;
  const megaItem=root.KampfTeam.megaItem(p.name);const item=p.items.map(i=>G.items.get(C.toID(i.id))).find(i=>i&&!usedItems.has(i.name));s.item=megaItem||item?.name||'';if(s.item)usedItems.add(s.item);
  const moves=p.moves.map(m=>G.moves.get(C.toID(m.id))).filter(Boolean).slice(0,4).map(m=>m.name);if(moves.length===4)s.moves=moves;
  return s;
 }
 function suggestions(mode){const data=feeds[mode],known=data.pokemon.filter(p=>G.species.get(C.toID(p.name)));return known.slice(0,3).map(seed=>{const chosen=[seed],base=n=>root.KampfTeam.forms(n)[0]?.name||n;for(const p of [...seed.teammates.map(t=>known.find(p=>p.id===t.id)).filter(Boolean),...known]){if(chosen.length===6)break;if(chosen.some(c=>base(c.name)===base(p.name)))continue;if(p.name.includes('-Mega')&&chosen.some(c=>c.name.includes('-Mega')))continue;chosen.push(p);}return{seed:seed.name,pokemon:chosen};}).filter(x=>x.pokemon.length===6);}
 root.KampfMeta={feeds,status,checked,refresh,usageSet,suggestions,urls};
})(window);
