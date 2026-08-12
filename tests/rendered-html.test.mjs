import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", {headers:{accept:"text/html"}}), {ASSETS:{fetch:async()=>new Response("Not found",{status:404})}}, {waitUntil(){},passThroughOnException(){}});
}

test("server renders Emberfall production shell", async () => {
  const response=await render();assert.equal(response.status,200);assert.match(response.headers.get("content-type")??"",/^text\/html/i);
  const html=await response.text();assert.match(html,/Emberfall/i);assert.doesNotMatch(html,/Your site is taking shape|codex-preview/i);
});

test("game source contains the complete vertical-slice systems", async () => {
  const [page,css,layout,license]=await Promise.all([readFile(new URL("app/page.tsx",root),"utf8"),readFile(new URL("app/globals.css",root),"utf8"),readFile(new URL("app/layout.tsx",root),"utf8"),readFile(new URL("public/audio/LICENSE.md",root),"utf8")]);
  for(const feature of ["STEAM","OVERLOAD","CONDUCT","escort-target","merchantStock","townEdit","difficulty","showTutorial","dark-place.ogg"])assert.match(page,new RegExp(feature,"i"));
  assert.match(css,/prefers-reduced-motion/);assert.match(layout,/Emberfall/i);assert.match(license,/CC0/);await access(new URL("public/audio/dark-place.ogg",root));
});

test("production metadata and public assets are game-specific", async()=>{
  const layout=await readFile(new URL("app/layout.tsx",root),"utf8");assert.match(layout,/title:\s*"Emberfall/i);assert.match(layout,/deck-building roguelike/i);assert.doesNotMatch(layout,/Starter Project|codex-preview/i);
  for(const asset of ["elemental-knight.webp","legion-warden.webp","emberfall-town.webp","western-gate-battlefield.webp"])await access(new URL(`public/art/${asset}`,root));
});

test("campaign persistence covers player-facing permanent progression",async()=>{
  const page=await readFile(new URL("app/page.tsx",root),"utf8");for(const field of ["forgeLevel","sanctumLevel","hallLevel","buildingPos","campaignWins","difficulty","wandererRescued","upgraded"])assert.match(page,new RegExp(field));assert.match(page,/Reset campaign data/);
});

test("accessibility controls and keyboard paths are present",async()=>{
  const [page,css]=await Promise.all([readFile(new URL("app/page.tsx",root),"utf8"),readFile(new URL("app/globals.css",root),"utf8")]);
  for(const control of ["largeText","highContrast","reducedMotion","screenShake","aria-live","KeyboardEvent"])assert.match(page,new RegExp(control));
  assert.match(css,/\.reduce-motion \*/);assert.match(css,/prefers-reduced-motion/);assert.match(page,/event\.key\.toLowerCase\(\)==="e"/);
});

test("audio source is licensed and player controlled",async()=>{
  const [page,license]=await Promise.all([readFile(new URL("app/page.tsx",root),"utf8"),readFile(new URL("public/audio/LICENSE.md",root),"utf8")]);
  assert.match(page,/dark-place\.ogg/);assert.match(page,/musicVolume/);assert.match(page,/effectsVolume/);assert.match(page,/ambienceVolume/);assert.match(license,/CC0 1\.0 Universal/);
});
