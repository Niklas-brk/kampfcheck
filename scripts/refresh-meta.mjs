// Public monthly usage snapshots; no user teams are sent to either source.
import fs from 'node:fs/promises';
const sources={Singles:'https://poke.itlibra.com/opendata/usage-championssingles.json',Doubles:'https://poke.itlibra.com/opendata/usage-champions.json'};
const data={checkedAt:new Date().toISOString(),formats:{}};
for(const [mode,url] of Object.entries(sources)){
 const res=await fetch(url);if(!res.ok)throw new Error(`${mode}: HTTP ${res.status}`);
 const value=await res.json();if(!Array.isArray(value.pokemon)||!/^\d{4}-\d{2}$/.test(value.month)||!value.format?.includes('champions'))throw new Error('Unexpected usage data');
 data.formats[mode]=value;console.log(mode,value.month,value.format,value.pokemon.length);
}
await fs.writeFile('dist/meta-snapshot.js','window.KampfMetaSnapshot = '+JSON.stringify(data)+';\n');
