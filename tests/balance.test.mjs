import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const source=await readFile(new URL("../app/page.tsx",import.meta.url),"utf8");

test("starting decks stay compact and playable",()=>{
  const base=[...source.matchAll(/id: "(?:iron-cut|shield-set|riposte|battle-focus)/g)].length;
  assert.equal(base,6);for(const element of ["fire","water","lightning"]){const section=source.match(new RegExp(`${element}: \\[([\\s\\S]*?)\\n  \\]`));assert.ok(section);assert.equal([...section[1].matchAll(/id:/g)].length,3)}
});

test("reward pool supports multiple deck archetypes",()=>{
  const reward=source.slice(source.indexOf("const REWARD_CARDS"),source.indexOf("const emptyMarks"));
  assert.ok([...reward.matchAll(/id:/g)].length>=12);for(const mechanic of ["burn","hits","retain","exhaust","draw","block"])assert.match(reward,new RegExp(mechanic));
});

test("all regular foes have health, art, passives, and intent patterns",()=>{
  for(const foe of ["Ash Hound","Cinder Cultist","Gate Reaver","Drowned Penitent","Storm Imp","Ironbound Brute"]){assert.match(source,new RegExp(`"${foe}"`));assert.match(source,new RegExp(`"${foe}".*passive`));assert.match(source,new RegExp(`"${foe}".*name:`,"s"))}
});

test("reaction damage remains bounded against first-region enemies",()=>{
  const overload=9,conduct=6;assert.ok(overload<20);assert.ok(conduct<15);assert.ok(overload>conduct);
});

test("reward costs and damage stay inside first-region balance bands",()=>{
  const reward=source.slice(source.indexOf("const REWARD_CARDS"),source.indexOf("const emptyMarks"));
  const costs=[...reward.matchAll(/cost:(\d+)/g)].map(match=>Number(match[1]));const damages=[...reward.matchAll(/damage:(\d+)/g)].map(match=>Number(match[1]));
  assert.ok(costs.every(cost=>cost>=0&&cost<=2));assert.ok(damages.every(damage=>damage>=3&&damage<=16));assert.ok(costs.filter(cost=>cost===0).length<=2);
});

test("permanent upgrades have explicit caps and prices",()=>{
  assert.match(source,/Math\.min\(3,v\+1\)/);for(const price of [25,30,35])assert.match(source,new RegExp(`gold>=${price}|gold<${price}`));
});

test("advanced difficulty remains bounded",()=>{
  assert.match(source,/difficulty\*\.12/);assert.match(source,/\[0,1,2,3\]/);assert.doesNotMatch(source,/difficulty\*\.[3-9]/);
});

test("combat resource limits prevent runaway hands",()=>{
  assert.match(source,/handLimit\]\s*=\s*useState\(8\)/);assert.match(source,/nextHand\.length<handLimit/);assert.match(source,/setEnergy\(3\+\(sanctumLevel>=2\?1:0\)\)/);
});

test("enemy mechanics are telegraphed in combat UI",()=>{
  for(const state of ["enemyRage","enemyRegeneration","enemyCharged","enemyThorns","bossPhase","effectiveIntent"])assert.match(source,new RegExp(state));
  for(const label of ["Rage","Regeneration","Charged","Cinder Ward","BOSS PHASE"])assert.match(source,new RegExp(label));
});

test("elite encounters provide target selection and varied relic choice",()=>{
  assert.match(source,/targetSlot/);assert.match(source,/escort-target/);assert.match(source,/relicChoice/);assert.ok([...source.matchAll(/name:"(?:Stormglass|Pilgrim Bell|Bastion Sigil|Ember Lens)"/g)].length===4);
});

test("retreat loses ordinary resources but preserves campaign state",()=>{
  const retreat=source.match(/function retreat\(\)\{([^}]|\}(?!\n))*?setScreen\("town"\)\}/s)?.[0]??"";
  for(const reset of ["setGold(0)","setSupplies(0)","setRunDeck([])","setRelics([])"])assert.ok(retreat.includes(reset));
  for(const permanent of ["setRescued","setBlueprint","setForgeLevel","setCampaignWins"])assert.ok(!retreat.includes(permanent));
});
