import assert from "node:assert/strict";
import test from "node:test";
import { cityRank, expeditionGrade, hashSeed, incomingAttack, parseCampaignSave, reactionResult, removeAt, repairCampaignSave, rewardBand, scaledEnemyHp, seededShuffle } from "../app/game-logic.ts";

test("seeded shuffles are reproducible and seed-sensitive",()=>{
  const cards=["a","b","c","d","e","f"];
  assert.deepEqual(seededShuffle(cards,"EMBER1"),seededShuffle(cards,"EMBER1"));
  assert.notDeepEqual(seededShuffle(cards,"EMBER1"),seededShuffle(cards,"EMBER2"));
  assert.deepEqual(cards,["a","b","c","d","e","f"]);
  assert.equal(hashSeed("EMBER1"),hashSeed("EMBER1"));
});

test("enemy scaling is monotonic and bounded",()=>{
  assert.equal(scaledEnemyHp(50,false,0),50);
  assert.equal(scaledEnemyHp(50,true,0),64);
  assert.equal(scaledEnemyHp(50,false,3),68);
  assert.ok(scaledEnemyHp(50,true,3)<90);
});

test("intent preview math matches weakness and vulnerability rules",()=>{
  assert.equal(incomingAttack(10,0,0,false,false),10);
  assert.equal(incomingAttack(10,0,0,true,false),6);
  assert.equal(incomingAttack(10,0,0,false,true),15);
  assert.equal(incomingAttack(10,2,3,true,true),17);
});

test("town ranks culminate in a fortified city",()=>{
  assert.equal(cityRank(2),"Last Refuge");
  assert.equal(cityRank(5),"Reclaimed Ward");
  assert.equal(cityRank(8),"Rising Stronghold");
  assert.equal(cityRank(11),"Fortified City");
});

test("deck removal removes only the chosen copy",()=>{
  assert.deepEqual(removeAt(["Cut","Guard","Cut"],2),["Cut","Guard"]);
  assert.deepEqual(removeAt(["Cut"],4),["Cut"]);
});

test("reward comparisons use stable value bands",()=>{
  assert.equal(rewardBand(10,7),"Above deck average");
  assert.equal(rewardBand(7,7),"Matches deck average");
  assert.equal(rewardBand(0,7),"Utility or setup pick");
});

test("expedition grades reward reactions and elite risk",()=>{
  assert.equal(expeditionGrade(10,1,20),"S");
  assert.equal(expeditionGrade(5,1,30),"A");
  assert.equal(expeditionGrade(3,0,8),"B");
  assert.equal(expeditionGrade(0,0,40),"C");
});

test("campaign save parsing rejects corrupt and non-object data",()=>{
  assert.equal(parseCampaignSave(null),null);
  assert.equal(parseCampaignSave("not-json"),null);
  assert.equal(parseCampaignSave("[]"),null);
  assert.deepEqual(parseCampaignSave('{"gold":45,"rescued":true}'),{gold:45,rescued:true});
});

test("campaign save repair clamps progression and economy values",()=>{
  const repaired=repairCampaignSave({gold:-10,supplies:500,forgeLevel:12,sanctumLevel:0,hallLevel:"bad",difficulty:99,townDay:-4});
  assert.equal(repaired.gold,0);assert.equal(repaired.supplies,99);assert.equal(repaired.forgeLevel,3);assert.equal(repaired.sanctumLevel,1);assert.equal(repaired.hallLevel,1);assert.equal(repaired.difficulty,3);assert.equal(repaired.townDay,1);
});

test("reaction table is symmetric and supports Ember Lens",()=>{
  assert.deepEqual(reactionResult("fire","water"),reactionResult("water","fire"));
  assert.deepEqual(reactionResult("water","lightning"),{name:"CONDUCT",damage:6,weaken:0,chain:6});
  assert.equal(reactionResult("fire","lightning")?.damage,9);
  assert.equal(reactionResult("fire","lightning",true)?.damage,12);
  assert.equal(reactionResult("fire","fire"),null);
});
