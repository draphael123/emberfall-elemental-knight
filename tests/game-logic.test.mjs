import assert from "node:assert/strict";
import test from "node:test";
import { cityRank, hashSeed, incomingAttack, scaledEnemyHp, seededShuffle } from "../app/game-logic.ts";

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
