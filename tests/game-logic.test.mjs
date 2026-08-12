import assert from "node:assert/strict";
import test from "node:test";
import { cityRank, expeditionGrade, hashSeed, incomingAttack, removeAt, rewardBand, scaledEnemyHp, seededShuffle } from "../app/game-logic.ts";

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
