"use client";
/* eslint-disable react-hooks/set-state-in-effect, jsx-a11y/media-has-caption, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";

type Element = "fire" | "water" | "lightning";
type MarkState = Record<Element, number>;
type Card = {
  id: string;
  name: string;
  cost: number;
  element?: Element;
  text: string;
  damage?: number;
  block?: number;
  draw?: number;
  burn?: number;
  hits?: number;
  retain?: boolean;
  exhaust?: boolean;
  rarity?: "common"|"uncommon"|"rare";
  heal?: number;
  armorBreak?: number;
};

const ELEMENTS: { id: Element; name: string; sigil: string; line: string }[] = [
  { id: "fire", name: "Fire", sigil: "", line: "Burn and relentless pressure" },
  { id: "water", name: "Water", sigil: "", line: "Guard, flow, and preparation" },
  { id: "lightning", name: "Lightning", sigil: "", line: "Burst and charged finishers" },
];

const BASE_CARDS: Card[] = [
  { id: "iron-cut-1", name: "Iron Cut", cost: 1, text: "Deal 7 damage.", damage: 7 },
  { id: "iron-cut-2", name: "Iron Cut", cost: 1, text: "Deal 7 damage.", damage: 7 },
  { id: "shield-set-1", name: "Shield Set", cost: 1, text: "Gain 7 Guard.", block: 7 },
  { id: "shield-set-2", name: "Shield Set", cost: 1, text: "Gain 7 Guard.", block: 7 },
  { id: "riposte", name: "Measured Riposte", cost: 1, text: "Gain 4 Guard. Deal 4 damage.", block: 4, damage: 4 },
  { id: "battle-focus", name: "Battle Focus", cost: 0, text: "Draw 1 card.", draw: 1 },
];

const ELEMENT_CARDS: Record<Element, Card[]> = {
  fire: [
    { id: "ember-edge-1", name: "Ember Edge", cost: 1, element: "fire", text: "Deal 6 damage. Apply 1 Fire.", damage: 6 },
    { id: "ember-edge-2", name: "Ember Edge", cost: 1, element: "fire", text: "Deal 6 damage. Apply 1 Fire.", damage: 6 },
    { id: "cinder-lunge", name: "Cinder Lunge", cost: 2, element: "fire", text: "Deal 11 damage. Apply 1 Fire.", damage: 11 },
  ],
  water: [
    { id: "tide-guard-1", name: "Tide Guard", cost: 1, element: "water", text: "Gain 6 Guard. Apply 1 Water.", block: 6 },
    { id: "tide-guard-2", name: "Tide Guard", cost: 1, element: "water", text: "Gain 6 Guard. Apply 1 Water.", block: 6 },
    { id: "undertow", name: "Undertow", cost: 1, element: "water", text: "Deal 4 damage. Apply 1 Water. Draw 1.", damage: 4, draw: 1 },
  ],
  lightning: [
    { id: "arc-jolt-1", name: "Arc Jolt", cost: 1, element: "lightning", text: "Deal 5 damage. Apply 1 Lightning.", damage: 5 },
    { id: "arc-jolt-2", name: "Arc Jolt", cost: 1, element: "lightning", text: "Deal 5 damage. Apply 1 Lightning.", damage: 5 },
    { id: "sky-breaker", name: "Sky Breaker", cost: 2, element: "lightning", text: "Deal 10 damage. Apply 1 Lightning.", damage: 10 },
  ],
};

const ENEMY_INTENTS = [
  { name: "Ruinous Cleave", damage: 9, detail: "Attacks for 9" },
  { name: "Demonic Bulwark", damage: 0, detail: "Gains 7 armor" },
  { name: "Horned Rush", damage: 13, detail: "Attacks for 13" },
];
const FOE_INTENTS: Record<string, typeof ENEMY_INTENTS> = {
  "Ash Hound":[{name:"Pounce",damage:11,detail:"Attacks for 11"},{name:"Circle",damage:0,detail:"Gains 7 armor"}],
  "Cinder Cultist":[{name:"Kindle",damage:0,detail:"Gains 7 armor"},{name:"Cinder Bolt",damage:14,detail:"Attacks for 14"}],
  "Gate Reaver":[{name:"Hack",damage:9,detail:"Attacks for 9"},{name:"Hack Again",damage:9,detail:"Attacks for 9"},{name:"Execution",damage:16,detail:"Attacks for 16"}],
  "Drowned Penitent":[{name:"Tidewall",damage:0,detail:"Gains 7 armor"},{name:"Anchor Thrust",damage:12,detail:"Attacks for 12"}],
  "Storm Imp":[{name:"Static Claw",damage:7,detail:"Attacks for 7"},{name:"Forked Spark",damage:13,detail:"Attacks for 13"}],
  "Ironbound Brute":[{name:"Brace",damage:0,detail:"Gains 7 armor"},{name:"Hammerfall",damage:18,detail:"Attacks for 18"}],
};
const intentionIcon=(intent:{damage:number,name:string})=>intent.damage>=15?"!!":intent.damage?"ATK":"DEF";

const FOES = [
  { name: "Ash Hound", art: "ash-hound", hp: 34, passive:"Frenzy: Pounce grows by 2 each cycle." }, { name: "Cinder Cultist", art: "cinder-cultist", hp: 40, passive:"Kindled: gains armor before every heavy bolt." },
  { name: "Gate Reaver", art: "gate-reaver", hp: 48, passive:"Relentless: attacks three turns in succession." }, { name: "Drowned Penitent", art: "drowned-penitent", hp: 52, passive:"Tidewall: alternates armor and crushing blows." },
  { name: "Storm Imp", art: "storm-imp", hp: 38, passive:"Volatile: short, high-pressure attack cycle." }, { name: "Ironbound Brute", art: "ironbound-brute", hp: 64, passive:"Ironbound: braces before an 18-damage Hammerfall." },
];
const REGION_PROFILE=[
  {name:"Ashen March",mix:"Fire-heavy  mixed Legion",threat:"Burn and relentless attacks"},
  {name:"Drowned Causeway",mix:"Water-heavy  mixed drowned",threat:"Armor, healing, and attrition"},
  {name:"Glasswood",mix:"Fire/Water mixed",threat:"Steam and shifting defenses"},
  {name:"Thunder Crown",mix:"Lightning-heavy  mixed flyers",threat:"Burst damage and escorts"},
  {name:"Hollow Deep",mix:"Water/Lightning mixed",threat:"Conduct chains and curses"},
  {name:"Black Citadel",mix:"All elements",threat:"Adaptive demon commanders"},
];
const BOSSES = [
  { name: "Furnace Bishop", art: "furnace-bishop" }, { name: "Tempest Wyvern", art: "tempest-wyvern" },
  { name: "Abyssal Tidemother", art: "abyssal-tidemother" }, { name: "Ashen Colossus", art: "ashen-colossus" },
];
const TOWN_LINES = [
  "Quartermaster: We count arrows by the dozen and survivors one by one.",
  "Watchman: The western fires moved closer last night.",
  "Refugee: I remember when the Sanctum bells marked weddings, not raids.",
];
const RELICS = [
  {name:"Stormglass",text:"Your first attack each battle deals 4 extra damage."},
  {name:"Pilgrim Bell",text:"Heal 5 health at the start of each battle."},
  {name:"Bastion Sigil",text:"Begin each battle with 5 Guard."},
  {name:"Ember Lens",text:"Overload deals 3 additional damage."},
];
const ACHIEVEMENTS=[
  {id:"first-win",name:"Gatebreaker",test:(stats:{wins:number;reactions:number;elites:number})=>stats.wins>=1},
  {id:"reaction-master",name:"Conduit",test:(stats:{wins:number;reactions:number;elites:number})=>stats.reactions>=10},
  {id:"elite-hunter",name:"Demon Hunter",test:(stats:{wins:number;reactions:number;elites:number})=>stats.elites>=2},
];
const REWARD_CARDS: Card[] = [
  { id:"steam-lance",name:"Steam Lance",cost:1,element:"water",text:"Deal 8 damage. Apply 1 Water.",damage:8 },
  { id:"brand-conductor",name:"Brand Conductor",cost:1,element:"lightning",text:"Deal 7 damage. Apply 1 Lightning.",damage:7 },
  { id:"fortress-flame",name:"Fortress Flame",cost:2,element:"fire",text:"Deal 14 damage. Apply 1 Fire.",damage:14 },
  { id:"boiling-point",name:"Boiling Point",cost:1,element:"fire",text:"Deal 4 damage. Apply 3 Burn.",damage:4,burn:3 },
  { id:"flash-flood",name:"Flash Flood",cost:1,element:"water",text:"Gain 9 Guard. Draw 1.",block:9,draw:1 },
  { id:"stormstep",name:"Stormstep",cost:0,element:"lightning",text:"Deal 3 damage. Draw 1.",damage:3,draw:1 },
  { id:"tempered-blow",name:"Tempered Blow",cost:2,text:"Deal 16 damage.",damage:16 },
  { id:"bastion",name:"Living Bastion",cost:2,text:"Gain 15 Guard.",block:15 },
  { id:"elemental-cycle",name:"Elemental Cycle",cost:1,text:"Draw 2 cards.",draw:2 },
  { id:"rain-of-cinders",name:"Rain of Cinders",cost:2,element:"fire",rarity:"rare",text:"Deal 4 damage 3 times. Apply 2 Burn.",damage:4,hits:3,burn:2 },
  { id:"mirror-tide",name:"Mirror Tide",cost:1,element:"water",rarity:"uncommon",text:"Gain 8 Guard. Retain this card.",block:8,retain:true },
  { id:"forked-sky",name:"Forked Sky",cost:2,element:"lightning",rarity:"rare",text:"Deal 7 damage twice.",damage:7,hits:2 },
  { id:"last-rampart",name:"Last Rampart",cost:2,rarity:"rare",text:"Gain 18 Guard. Exhaust.",block:18,exhaust:true },
  { id:"vowseek",name:"Vowseek",cost:0,rarity:"uncommon",text:"Draw 2 cards. Exhaust.",draw:2,exhaust:true },
  { id:"phoenix-oath",name:"Phoenix Oath",cost:2,element:"fire",rarity:"rare",text:"Deal 9 damage. Heal 5. Exhaust.",damage:9,heal:5,exhaust:true },
  { id:"deep-current",name:"Deep Current",cost:2,element:"water",rarity:"rare",text:"Gain 12 Guard. Draw 2.",block:12,draw:2 },
  { id:"thunderhead",name:"Thunderhead",cost:2,element:"lightning",rarity:"uncommon",text:"Deal 12 damage. Apply Lightning.",damage:12 },
  { id:"sunder",name:"Sunder",cost:1,rarity:"uncommon",text:"Deal 5 damage. Break 8 Armor.",damage:5,armorBreak:8 },
];

const emptyMarks = (): MarkState => ({ fire: 0, water: 0, lightning: 0 });
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const rewardsFor = (elements:Element[],step:number) => {
  const eligible=REWARD_CARDS.filter(card=>!card.element||elements.includes(card.element));
  return [0,1,2].map(offset=>eligible[(step*2+offset)%eligible.length]);
};

export default function Home() {
  const [screen, setScreen] = useState<"intro" | "town" | "attune" | "map" | "combat" | "reward" | "victory" | "defeat">("intro");
  const [selected, setSelected] = useState<Element[]>(["fire", "water"]);
  const [playerHp, setPlayerHp] = useState(58);
  const [guard, setGuard] = useState(0);
  const [enemyHp, setEnemyHp] = useState(72);
  const [enemyArmor, setEnemyArmor] = useState(0);
  const [enemyThorns, setEnemyThorns] = useState(0);
  const [enemyPhaseLabel, setEnemyPhaseLabel] = useState("");
  const [energy, setEnergy] = useState(3);
  const [turn, setTurn] = useState(1);
  const [intentIndex, setIntentIndex] = useState(0);
  const [marks, setMarks] = useState<MarkState>(emptyMarks());
  const [weakened, setWeakened] = useState(false);
  const [enemyCharged, setEnemyCharged] = useState(false);
  const [hand, setHand] = useState<Card[]>([]);
  const [handLimit] = useState(8);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [pileView, setPileView] = useState<"draw"|"discard"|"exhausted"|null>(null);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [log, setLog] = useState("The gate groans. The Legion Warden advances.");
  const [combatHistory, setCombatHistory] = useState<string[]>([]);
  const [rescued, setRescued] = useState(false);
  const [blueprint, setBlueprint] = useState(false);
  const [townPos, setTownPos] = useState({ x: 48, y: 58 });
  const [townMessage, setTownMessage] = useState("Click anywhere in the courtyard to walk.");
  const [showRoster, setShowRoster] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Campaign saved locally");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRetreat, setConfirmRetreat] = useState(false);
  const [impact, setImpact] = useState("");
  const [knightMotion, setKnightMotion] = useState("");
  const [reactionBurst, setReactionBurst] = useState("");
  const [foeIndex, setFoeIndex] = useState(0);
  const [mapStep, setMapStep] = useState(0);
  const [routeHistory, setRouteHistory] = useState<string[]>([]);
  const [encountersCleared, setEncountersCleared] = useState(0);
  const [runDeck, setRunDeck] = useState<Card[]>([]);
  const [forgeLevel, setForgeLevel] = useState(0);
  const [gold, setGold] = useState(45);
  const [runGoldStart, setRunGoldStart] = useState(45);
  const [supplies, setSupplies] = useState(0);
  const [nodeType, setNodeType] = useState<"camp"|"merchant"|"event"|null>(null);
  const [merchantStock, setMerchantStock] = useState<Card[]>([]);
  const [enemyBurn, setEnemyBurn] = useState(0);
  const [enemyRage, setEnemyRage] = useState(0);
  const [enemyRegeneration, setEnemyRegeneration] = useState(0);
  const [playerBurn, setPlayerBurn] = useState(0);
  const [vulnerable, setVulnerable] = useState(0);
  const [exhausted, setExhausted] = useState<Card[]>([]);
  const [secondFoe, setSecondFoe] = useState<{name:string;art:string;hp:number}|null>(null);
  const [secondHp, setSecondHp] = useState(0);
  const [targetSlot, setTargetSlot] = useState<0|1>(0);
  const [targetHint, setTargetHint] = useState("");
  const [elite, setElite] = useState(false);
  const [relics, setRelics] = useState<string[]>([]);
  const [relicChoice, setRelicChoice] = useState<typeof RELICS[number][]|null>(null);
  const [showDeck, setShowDeck] = useState(false);
  const [upgraded, setUpgraded] = useState<string[]>([]);
  const [upgradePaths, setUpgradePaths] = useState<Record<string,"power"|"mastery">>({});
  const [forgeOpen, setForgeOpen] = useState(false);
  const [forgeTarget, setForgeTarget] = useState<Card|null>(null);
  const [damageNumber, setDamageNumber] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [musicStatus, setMusicStatus] = useState("Music is off");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [musicVolume, setMusicVolume] = useState(35);
  const [effectsVolume, setEffectsVolume] = useState(70);
  const [ambienceVolume, setAmbienceVolume] = useState(25);
  const [screenShake, setScreenShake] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [maraGift, setMaraGift] = useState(false);
  const [sanctumLevel, setSanctumLevel] = useState(1);
  const [sanctumBlessing, setSanctumBlessing] = useState<Element>("fire");
  const [hallLevel, setHallLevel] = useState(1);
  const [showCampaign, setShowCampaign] = useState(false);
  const [townEdit, setTownEdit] = useState(false);
  const [buildToast, setBuildToast] = useState("");
  const [townDay, setTownDay] = useState(1);
  const [storySeen, setStorySeen] = useState(false);
  const [bossIntro, setBossIntro] = useState(false);
  const [movingBuilding, setMovingBuilding] = useState<"forge"|"sanctum"|"hall"|null>(null);
  const [difficulty, setDifficulty] = useState(0);
  const [runSeed, setRunSeed] = useState("");
  const [showDefeatHelp, setShowDefeatHelp] = useState(false);
  const [campaignWins, setCampaignWins] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [wandererRescued, setWandererRescued] = useState(false);
  const [runStats, setRunStats] = useState({cardsPlayed:0,reactions:0,damageTaken:0,elites:0});
  const [bossPhase, setBossPhase] = useState(1);
  const [firstAttack, setFirstAttack] = useState(true);
  const [buildingPos, setBuildingPos] = useState({forge:{x:11,y:15},sanctum:{x:47,y:9},hall:{x:35,y:58}});
  const audioRef = useRef<HTMLAudioElement>(null);
  const maxHp = 58 + forgeLevel * 3;
  const activeFoe = mapStep >= 3 ? { name: "Legion Warden", art: "legion-warden", hp: 72, passive:"Siegeborn: cycles armor, cleaves, and a devastating rush." } : FOES[foeIndex];
  const foeMaxHp = elite ? Math.ceil(activeFoe.hp * 1.28) : activeFoe.hp;

  const deck = useMemo(
    () => [...BASE_CARDS, ...ELEMENT_CARDS[selected[0]], ...ELEMENT_CARDS[selected[1]]],
    [selected],
  );
  useEffect(()=>{const saved=localStorage.getItem("emberfall-save");if(saved){try{const data=JSON.parse(saved);setRescued(!!data.rescued);setBlueprint(!!data.blueprint);setForgeLevel(data.forgeLevel||0);setGold(data.gold??45);setSupplies(data.supplies||0);setUpgraded(data.upgraded||[]);setUpgradePaths(data.upgradePaths||{});setMaraGift(!!data.maraGift);setSanctumLevel(data.sanctumLevel||1);setSanctumBlessing(data.sanctumBlessing||"fire");setHallLevel(data.hallLevel||1);setDifficulty(data.difficulty||0);setCampaignWins(data.campaignWins||0);setAchievements(data.achievements||[]);setTownDay(data.townDay||1);setWandererRescued(!!data.wandererRescued);if(data.buildingPos)setBuildingPos(data.buildingPos)}catch{setTownMessage("The old campaign record was damaged; a fresh ledger has been opened.")}}},[]);
  useEffect(()=>{try{localStorage.setItem("emberfall-save",JSON.stringify({rescued,blueprint,forgeLevel,gold,supplies,upgraded,upgradePaths,maraGift,sanctumLevel,sanctumBlessing,hallLevel,buildingPos,difficulty,campaignWins,wandererRescued,townDay,achievements}));setSaveStatus("Campaign saved locally")}catch{setSaveStatus("Local save unavailable")}},[rescued,blueprint,forgeLevel,gold,supplies,upgraded,upgradePaths,maraGift,sanctumLevel,sanctumBlessing,hallLevel,buildingPos,difficulty,campaignWins,wandererRescued,townDay,achievements]);
  useEffect(()=>{const prefs=localStorage.getItem("emberfall-settings");if(prefs){try{const p=JSON.parse(prefs);setMusicVolume(p.musicVolume??35);setEffectsVolume(p.effectsVolume??70);setAmbienceVolume(p.ambienceVolume??25);setScreenShake(p.screenShake??true);setReducedMotion(!!p.reducedMotion);setLargeText(!!p.largeText);setHighContrast(!!p.highContrast)}catch{localStorage.removeItem("emberfall-settings")}}},[]);
  useEffect(()=>{localStorage.setItem("emberfall-settings",JSON.stringify({musicVolume,effectsVolume,ambienceVolume,screenShake,reducedMotion,largeText,highContrast}));if(audioRef.current)audioRef.current.volume=(musicVolume/100)*(ambienceVolume/100+.5);document.body.classList.toggle("large-text",largeText);document.body.classList.toggle("high-contrast",highContrast);document.body.classList.toggle("reduce-motion",reducedMotion)},[musicVolume,effectsVolume,ambienceVolume,screenShake,reducedMotion,largeText,highContrast]);
  useEffect(()=>{function keys(event:KeyboardEvent){if(screen==="combat"&&!showTutorial){if(event.key==="Escape")setPaused(v=>!v);if(event.key.toLowerCase()==="e"&&!paused)endTurn();const number=Number(event.key);if(number>=1&&number<=hand.length&&!paused)playCard(hand[number-1])}}window.addEventListener("keydown",keys);return()=>window.removeEventListener("keydown",keys)});

  function sound(kind:"card"|"hit"|"block"|"reaction"){
    if(!effectsVolume)return;const AudioCtx=window.AudioContext||(window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!AudioCtx)return;const ctx=new AudioCtx();const osc=ctx.createOscillator();const gain=ctx.createGain();const tones={card:220,hit:92,block:145,reaction:440};osc.frequency.value=tones[kind];osc.type=kind==="reaction"?"sine":"triangle";gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime((effectsVolume/100)*.12,ctx.currentTime+.01);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.18);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.2);
  }
  function toggleMusic(){if(!audioRef.current)return;if(musicOn){audioRef.current.pause();setMusicOn(false);setMusicStatus("Music paused")}else{audioRef.current.volume=musicVolume/100;audioRef.current.play().then(()=>{setMusicOn(true);setMusicStatus("Music playing")}).catch(()=>setMusicStatus("Select play again to enable audio"))}}
  function unlockAudio(){if(audioUnlocked)return;setAudioUnlocked(true);if(audioRef.current){audioRef.current.volume=(musicVolume/100)*(ambienceVolume/100+.5);audioRef.current.play().then(()=>{setMusicOn(true);setMusicStatus("Music playing")}).catch(()=>{})}}

  function toggleElement(element: Element) {
    setSelected((current) => {
      if (current.includes(element)) return current.length === 1 ? current : current.filter((item) => item !== element);
      return current.length < 2 ? [...current, element] : [current[1], element];
    });
  }
  function preview(card:Card){
    const suffix=[card.heal?`heal ${card.heal}`:"",card.armorBreak?`break ${card.armorBreak} Armor`:"",card.retain?"retain":"",card.exhaust?"exhaust":""].filter(Boolean).join("  ");
    if(!card.element){const main=card.damage?`${((card.damage+cardBoost(card))*(card.hits??1))} damage`:card.block?`${card.block+cardBoost(card)} Guard`:"Utility";return `${main}${suffix?`  ${suffix}`:""}`}
    const partner=(Object.keys(marks) as Element[]).find(e=>e!==card.element&&marks[e]>0);if(!partner)return `Applies ${card.element} mark`;
    const pair=[card.element,partner].sort().join("+");if(pair==="fire+water")return `STEAM - weaken next attack${suffix?`  ${suffix}`:""}`;if(pair==="fire+lightning")return `OVERLOAD - +${9+(relics.includes("Ember Lens")?3:0)} damage${suffix?`  ${suffix}`:""}`;return `CONDUCT - +6 and chain${suffix?`  ${suffix}`:""}`;
  }
  function cardCost(card:Card){return Math.max(0,card.cost-(upgradePaths[card.id]==="mastery"?1:0))}
  function cardBoost(card:Card){return upgradePaths[card.id]==="power"?3:0}

  function startCombat(index = 0, dangerous = false) {
    const target = mapStep >= 3 ? { name: "Legion Warden", hp: 72 } : FOES[index];
    setFoeIndex(index);
    setRouteHistory(v=>[...v,`${dangerous?"Elite":"Combat"}: ${target.name}`]);
    const expeditionDeck = runDeck.length ? runDeck : deck;
    if(!runDeck.length)setRunDeck(deck);
    const pile = shuffle(expeditionDeck);
    setHand(pile.slice(0, 5));
    setDrawPile(pile.slice(5));
    setDiscard([]);
    setExhausted([]);
    const escort=dangerous&&mapStep<3?FOES[(index+1)%FOES.length]:null;setSecondFoe(escort);setSecondHp(escort?Math.ceil(escort.hp*.65):0);setTargetSlot(0);setTargetHint(escort?"Select a target before attacking. Conduct chains to the other enemy.":"");
    if(mapStep===0 && !runDeck.length)setPlayerHp(58+forgeLevel*3);
    setElite(dangerous);
    setEnemyHp(Math.ceil((dangerous ? target.hp * 1.28 : target.hp)*(1+difficulty*.12)));
    setEnemyArmor(0);
    setEnemyThorns(activeFoe.name==="Cinder Cultist"?2:0);
    setEnemyPhaseLabel("");
    setGuard(relics.includes("Bastion Sigil")?5:0);
    setEnergy(3+(sanctumLevel>=2?1:0));
    setTurn(1);
    setIntentIndex(0);
    setMarks(emptyMarks());
    if(sanctumLevel>=3)setMarks({...emptyMarks(),[sanctumBlessing]:1});
    setWeakened(false);
    setEnemyCharged(false);
    setEnemyBurn(0);
    setEnemyRage(0);
    setEnemyRegeneration(0);
    setPlayerBurn(0);
    setVulnerable(0);
    setBossPhase(1);setFirstAttack(true);
    if(relics.includes("Pilgrim Bell"))setPlayerHp(v=>Math.min(maxHp,v+5));
    if(mapStep===0)setRunStats({cardsPlayed:0,reactions:0,damageTaken:0,elites:0});if(dangerous)setRunStats(v=>({...v,elites:v.elites+1}));
    setLog(`${target.name} bars the road.`);
    setBossIntro(mapStep>=3);
    setCombatHistory([`${target.name} bars the road.`]);
    if(!localStorage.getItem("emberfall-tutorial-seen")){setShowTutorial(true);localStorage.setItem("emberfall-tutorial-seen","yes")}
    setScreen("combat");
  }
  function beginExpedition(){setRunGoldStart(gold);setTownDay(v=>v+1);setMapStep(0);setEncountersCleared(0);setRouteHistory([]);setRunDeck([]);setRunSeed(Math.random().toString(36).slice(2,8).toUpperCase());setScreen("attune")}
  function spendSupply(){if(supplies<=0||playerHp>=maxHp)return;setSupplies(v=>v-1);setPlayerHp(v=>Math.min(maxHp,v+8));setTownMessage("A field ration restores 8 health before departure.")}
  function retreat(){setGold(0);setSupplies(0);setRunDeck([]);setRelics([]);setRouteHistory([]);setTownMessage("The Knight returns without ordinary spoils. Blueprints and rescued people remain.");setScreen("town")}
  function openNode(type:"camp"|"merchant"|"event") {setNodeType(type);if(type==="merchant")setMerchantStock(shuffle(REWARD_CARDS.filter(card=>!card.element||selected.includes(card.element))).slice(0,3));}
  function finishNode(){if(nodeType)setRouteHistory(v=>[...v,nodeType[0].toUpperCase()+nodeType.slice(1)]);setMapStep(v=>v+1);setNodeType(null)}
  function removeCard(card?:Card){const current=runDeck.length?runDeck:deck;if(current.length<=8||gold<25)return;const chosen=card||current[current.length-1];const index=current.findIndex(item=>item.id===chosen.id);if(index<0)return;setRunDeck(current.filter((_,i)=>i!==index));setGold(v=>v-25);setTownMessage(`The peddler burns ${chosen.name} from the expedition deck.`)}
  function claimReward(card?:Card){if(card)setRunDeck(v=>[...(v.length?v:deck),card]);setGold(v=>v+(elite?20:10));setSupplies(v=>v+(elite?2:1));setEncountersCleared(v=>v+1);if(elite){setRelicChoice(shuffle(RELICS.filter(r=>!relics.includes(r.name))).slice(0,2));return}setMapStep(v=>v+1);setScreen("map")}
  function rewardComparison(card:Card){const current=runDeck.length?runDeck:deck;const same=current.filter(c=>c.element===card.element);const average=same.length?Math.round(same.reduce((sum,c)=>sum+(c.damage||c.block||0),0)/same.length):0;const value=card.damage||card.block||0;return value>average?"Above deck average":value===average?"Matches deck average":"Utility or setup pick"}
  function chooseRelic(name:string){setRelics(v=>[...v,name]);setRelicChoice(null);setMapStep(v=>v+1);setScreen("map")}
  function reforge(card:Card,path:"power"|"mastery"){if(gold<25||upgraded.includes(card.id))return;setGold(v=>v-25);setUpgraded(v=>[...v,card.id]);setUpgradePaths(v=>({...v,[card.id]:path}));setForgeLevel(v=>Math.min(3,v+1));setForgeTarget(null);setTownMessage(`${card.name} follows the ${path==="power"?"Power path: +3 damage or Guard":"Mastery path: costs 1 less energy"}.`)}

  function drawCards(count: number, currentHand = hand, currentDraw = drawPile, currentDiscard = discard) {
    let pile = [...currentDraw];
    let spent = [...currentDiscard];
    const nextHand = [...currentHand];
    for (let i = 0; i < count; i += 1) {
      if (!pile.length && spent.length) {
        pile = shuffle(spent);
        spent = [];
      }
      const card = pile.shift();
      if (card && nextHand.length<handLimit) nextHand.push(card); else if(card)spent.push(card);
    }
    setHand(nextHand);
    setDrawPile(pile);
    setDiscard(spent);
  }

  function playCard(card: Card) {
    if (cardCost(card) > energy || screen !== "combat") return;
    setEnergy((value) => value - cardCost(card));
    setRunStats(v=>({...v,cardsPlayed:v.cardsPlayed+1}));
    setHand((cards) => cards.filter((item) => item.id !== card.id));
    if(card.exhaust)setExhausted(cards=>[...cards,card]);else setDiscard((cards) => [...cards, card]);
    setKnightMotion(card.damage?"lunge":"brace");window.setTimeout(()=>setKnightMotion(""),320);
    sound(card.block&&!card.damage?"block":"card");
    const boost = cardBoost(card);
    if (card.block) setGuard((value) => value + card.block! + boost);

    let dealt = ((card.damage ?? 0) + (card.damage ? boost : 0)) * (card.hits??1);
    if(firstAttack&&dealt&&relics.includes("Stormglass")){dealt+=4;setFirstAttack(false)}else if(dealt)setFirstAttack(false);
    let reaction = "";
    const nextMarks = { ...marks };

    if (card.element) {
      const partner = (Object.keys(nextMarks) as Element[]).find(
        (element) => element !== card.element && nextMarks[element] > 0,
      );
      if (partner) {
        const pairName=[card.element,partner].sort().join("+");setReactionBurst(pairName);window.setTimeout(()=>setReactionBurst(""),600);
        setRunStats(v=>({...v,reactions:v.reactions+1}));
        sound("reaction");
        const pair = [card.element, partner].sort().join("+");
        nextMarks[partner] -= 1;
        if (pair === "fire+water") {
          reaction = "STEAM  the Warden's next attack is weakened.";
          setWeakened(true);
        } else if (pair === "fire+lightning") {
          const overload=9+(relics.includes("Ember Lens")?3:0);dealt += overload;
          reaction = `OVERLOAD - ${overload} bonus damage tears through its armor.`;
        } else if (pair === "lightning+water") {
          dealt += 6;
          reaction = "CONDUCT  6 chain damage arcs through the gate.";
        }
      } else {
        nextMarks[card.element] += 1;
      }
      setMarks(nextMarks);
    }

    if (dealt) {
      sound("hit");
      setDamageNumber(`-${dealt}`); window.setTimeout(()=>setDamageNumber(""),650);
      setImpact(card.element ?? "steel");
      window.setTimeout(() => setImpact(""), 360);
      const absorbed = targetSlot===0?Math.min(enemyArmor, dealt):0;
      const hpDamage = dealt - absorbed;
      const nextHp = (targetSlot===0?enemyHp:secondHp) - hpDamage;
      if(enemyThorns>0&&targetSlot===0){setPlayerHp(v=>Math.max(0,v-enemyThorns));setRunStats(v=>({...v,damageTaken:v.damageTaken+enemyThorns}))}
      if(targetSlot===0){setEnemyArmor((value) => Math.max(0, value - dealt));setEnemyHp(Math.max(0, nextHp));if(mapStep>=3&&bossPhase===1&&nextHp>0&&nextHp<=Math.floor(foeMaxHp/2)){setBossPhase(2);setEnemyArmor(v=>v+12);setEnemyPhaseLabel("PHASE II  SIEGE WARD");window.setTimeout(()=>setEnemyPhaseLabel(""),1400);setLog("The Warden tears free of its chains and raises a 12-Armor siege ward.")}}else{setSecondHp(Math.max(0,nextHp));if(nextHp<=0)setTargetSlot(0)}
      if(reaction.includes("CONDUCT")&&secondFoe&&secondHp>0){if(targetSlot===0)setSecondHp(v=>Math.max(0,v-6));else setEnemyHp(v=>Math.max(0,v-6))}
      if (nextHp <= 0) {
        if(targetSlot===1){setLog(`${secondFoe?.name} is destroyed.`);return;}
        setImpact("death");
        if(secondFoe&&secondHp>0){setFoeIndex((foeIndex+1)%FOES.length);setEnemyHp(secondHp);setSecondFoe(null);setSecondHp(0);setEnemyArmor(0);setMarks(emptyMarks());setLog(`${activeFoe.name} falls. Its escort takes the line.`);return}
        if (mapStep >= 3) { setRescued(true); setBlueprint(true); setCampaignWins(v=>v+1);setAchievements(v=>[...new Set([...v,...ACHIEVEMENTS.filter(a=>a.test({wins:campaignWins+1,reactions:runStats.reactions,elites:runStats.elites})).map(a=>a.id)])]); window.setTimeout(()=>setScreen("victory"),650); }
        else window.setTimeout(()=>setScreen("reward"),650);
      }
    }
    if(card.burn)setEnemyBurn(value=>value+card.burn!);
    if(card.heal)setPlayerHp(v=>Math.min(maxHp,v+card.heal!));
    if(card.armorBreak)setEnemyArmor(v=>Math.max(0,v-card.armorBreak!));
    const cardLog=reaction || `${card.name} strikes ${targetSlot===0?activeFoe.name:secondFoe?.name}.`;setLog(cardLog);setCombatHistory(v=>[cardLog,...v].slice(0,5));
    if (card.draw) drawCards(card.draw, hand.filter((item) => item.id !== card.id), drawPile, card.exhaust?discard:[...discard, card]);
  }
  function canPlay(card:Card){return cardCost(card)<=energy&&screen==="combat"&&!paused&&!showTutorial}

  function endTurn() {
    const pattern = FOE_INTENTS[activeFoe.name] || ENEMY_INTENTS;
    const intent = pattern[intentIndex % pattern.length];
    let message = "";
    if(enemyBurn>0){
      const afterBurn=enemyHp-enemyBurn; setEnemyHp(Math.max(0,afterBurn)); setEnemyBurn(v=>Math.max(0,v-1));
      if(afterBurn<=0){if(mapStep>=3){setRescued(true);setBlueprint(true);setCampaignWins(v=>v+1);setScreen("victory")}else setScreen("reward");return;}
    }
    if(enemyRegeneration>0){setEnemyHp(v=>Math.min(foeMaxHp,v+enemyRegeneration));setEnemyRegeneration(v=>Math.max(0,v-1))}
    if (intent.damage) {
      const scaled=intent.damage+difficulty+(activeFoe.name==="Ash Hound"?Math.floor((turn-1)/2)*2:0)+(mapStep>=3&&bossPhase===2?3:0)+enemyRage+(enemyCharged?4:0);
      const attack = Math.max(0, Math.ceil((scaled - (weakened ? 4 : 0))*(vulnerable>0?1.5:1)));
      const damage = Math.max(0, attack - guard);
      const nextHp = playerHp - damage;
      setPlayerHp(Math.max(0, nextHp));
      setRunStats(v=>({...v,damageTaken:v.damageTaken+damage}));
      message = `${activeFoe.name} strikes for ${damage}${guard ? ` after ${guard} Guard` : ""}.${enemyBurn?` Burn deals ${enemyBurn}.`:""}`;
      setWeakened(false);
      setVulnerable(v=>Math.max(0,v-1));
      if(activeFoe.name==="Cinder Cultist")setPlayerBurn(v=>v+2);
      if(activeFoe.name==="Gate Reaver"&&intent.name==="Execution")setVulnerable(1);
      if(activeFoe.name==="Storm Imp")setEnemyCharged(intent.name==="Static Claw");
      if(secondFoe&&secondHp>0){const escortDamage=Math.max(0,6-Math.max(0,guard-attack));setPlayerHp(v=>Math.max(0,v-escortDamage));message+=` ${secondFoe.name} follows for ${escortDamage}.`}
      if (nextHp <= 0) {
        setScreen("defeat");
        return;
      }
    } else {
      setEnemyArmor((value) => value + 7);
      if(activeFoe.name==="Ironbound Brute")setEnemyRage(v=>v+2);
      if(activeFoe.name==="Drowned Penitent")setEnemyRegeneration(v=>v+3);
      message = `${activeFoe.name} gains 7 demonic armor.${enemyBurn?` Burn deals ${enemyBurn}.`:""}`;
    }
    if(playerBurn>0){const burnedHp=Math.max(0,playerHp-playerBurn);setPlayerHp(burnedHp);setPlayerBurn(v=>Math.max(0,v-1));if(burnedHp<=0){setScreen("defeat");return;}}
    const retained=hand.filter(card=>card.retain);const spent = [...discard, ...hand.filter(card=>!card.retain)];
    let pile = [...drawPile];
    if (pile.length < 5) {
      pile = [...pile, ...shuffle(spent)];
      setDiscard([]);
    } else {
      setDiscard(spent);
    }
    const drawCount=Math.max(0,Math.min(5-retained.length,handLimit-retained.length));setHand([...retained,...pile.slice(0,drawCount)]);
    setDrawPile(pile.slice(drawCount));
    setGuard(0);
    setEnergy(3+(sanctumLevel>=2?1:0));
    setTurn((value) => value + 1);
    setIntentIndex((value) => (value + 1) % pattern.length);
    setLog(message);
    setCombatHistory(v=>[message,...v].slice(0,5));
  }
  function effectiveIntent(){
    if(!intent?.damage)return intent?.detail||"";const scaled=intent.damage+difficulty+(activeFoe.name==="Ash Hound"?Math.floor((turn-1)/2)*2:0)+(mapStep>=3&&bossPhase===2?3:0)+enemyRage+(enemyCharged?4:0);const attack=Math.max(0,Math.ceil((scaled-(weakened?4:0))*(vulnerable>0?1.5:1)));return `Attacks for ${attack}  ${Math.max(0,attack-guard)} after current Guard`;
  }

  const deckOverlay = showDeck && <div className="modal-backdrop" onClick={()=>setShowDeck(false)}><section className="deck-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowDeck(false)}>Close</button><p className="eyebrow">KNIGHT&apos;S DECK</p><h2>{(runDeck.length?runDeck:deck).length} cards</h2><div className="deck-list">{(runDeck.length?runDeck:deck).map((card,index)=><article key={`${card.id}-${index}`} className={card.element||"steel"}><b>{card.name}{upgraded.includes(card.id)?" +":""}</b><small>{cardCost(card)} energy  {card.element||"knight"}{upgradePaths[card.id]?`  ${upgradePaths[card.id]} path`:""}</small><p>{card.text}</p></article>)}</div><div className="relic-strip">{relics.length?relics.map(r=><span key={r}> {r}</span>):<span>No relics recovered</span>}</div></section></div>;
  const pileOverlay = pileView && <div className="modal-backdrop" onClick={()=>setPileView(null)}><section className="pile-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setPileView(null)}>Close</button><p className="eyebrow">{pileView} pile</p><h2>{(pileView==="draw"?drawPile:pileView==="discard"?discard:exhausted).length} cards</h2><div className="pile-list">{(pileView==="draw"?drawPile:pileView==="discard"?discard:exhausted).map((card,index)=><span key={`${card.id}-${index}`}><b>{card.name}</b><small>{cardCost(card)} energy  {card.element||"knight"}</small></span>)}</div></section></div>;

  if(screen==="intro") return <main className="intro-screen"><audio ref={audioRef} src="/audio/dark-place.ogg" loop preload="metadata"/><div className="intro-copy"><span className="crest intro-crest">EK</span><p className="eyebrow">AN ELEMENTAL KNIGHT CHRONICLE</p><h1>EMBERFALL</h1>{storySeen?<div className="intro-story"><p>The Legion came beneath a red moon. By dawn, the city was empty and six ancient vows had gone silent.</p><p>Now one Knight returns to rebuild its walls, rescue its people, and carry two elements beyond the gate.</p></div>:<p>Six vows. One fallen city. The road begins at the last unbroken gate.</p>}<button className="primary" onClick={()=>{if(!storySeen){setStorySeen(true);unlockAudio()}else setScreen("town")}}>{storySeen?"Enter Emberfall":"Hear the chronicle"}</button>{storySeen&&<button className="skip-intro" onClick={()=>setScreen("town")}>Continue</button>}<small>Keyboard and touch supported  Browser vertical slice</small></div></main>;

  if (screen === "town") {
    return (
      <main className={`town-screen ${blueprint?"reclaimed":"ruined"}`}><audio ref={audioRef} src="/audio/dark-place.ogg" loop preload="metadata"/>
        <header className="topbar">
          <div className="brand"><span className="crest">EK</span><div><b>EMBERFALL</b><small>An Elemental Knight Chronicle</small></div></div>
          <div className="resources"><button onClick={()=>setShowCampaign(true)}>Campaign</button><button onClick={()=>setShowDeck(true)}>Deck</button><button onClick={()=>setShowRoster(true)}>Bestiary</button><button onClick={()=>setShowRules(true)}>Rules</button><button onClick={()=>setShowSettings(true)}>Settings</button><span>Blueprints <b>{blueprint ? 1 : 0}</b></span><span>Survivors <b>{rescued ? 1 : 0}</b></span></div>
        </header>
        <section className="town-intro">
          <p className="eyebrow">THE LAST QUIET GROUND  DAY {townDay}</p>
          <h1>Reclaim what the demons left behind.</h1>
          <p>Raise a fortress from ash. Every rescued soul changes what the Knight can carry beyond the gate.</p>
        </section>
        {buildToast&&<div className="build-toast" role="status">{buildToast}</div>}<section className={`town-grid ${townEdit?"edit-mode":""}`} aria-label="Walkable overhead town" onClick={(event)=>{const rect=event.currentTarget.getBoundingClientRect();const pos={x:Math.max(2,Math.min(78,((event.clientX-rect.left)/rect.width)*100)),y:Math.max(3,Math.min(72,((event.clientY-rect.top)/rect.height)*100))};if(townEdit&&movingBuilding){setBuildingPos(v=>({...v,[movingBuilding]:pos}));setMovingBuilding(null);setTownMessage("Building placed. The new street plan is saved.");setBuildToast("City plan saved");window.setTimeout(()=>setBuildToast(""),1600)}else{setTownPos(pos);setTownMessage("Boots ring across the wet stones.")}}}>
          <div className="grid-lines" />
          <div className="town-knight" style={{left:`${townPos.x}%`,top:`${townPos.y}%`}}><img src="/art/elemental-knight.webp" alt="Elemental Knight walking through town"/></div>
          <button className="ambient-npc npc-one" onClick={e=>{e.stopPropagation();setTownMessage(TOWN_LINES[0])}}><i/>Quartermaster</button>{wandererRescued&&<button className="town-npc scout-npc" onClick={e=>{e.stopPropagation();setTownMessage("Ilyra: The western reeds hide roads the Legion does not watch.")}}>Ilyra  Scout</button>}<button className="ambient-npc npc-two" onClick={e=>{e.stopPropagation();setTownMessage(TOWN_LINES[2])}}><i/>Refugee</button><button className="ambient-npc npc-three" onClick={e=>{e.stopPropagation();setTownMessage(TOWN_LINES[1])}}><i/>Watchman</button>
          {rescued && <button className="town-npc" onClick={(event)=>{event.stopPropagation();if(!maraGift){setMaraGift(true);setGold(v=>v+20);setTownMessage("Mara: You came back for us. Take these 20 crowns; the dead have no use for them.")}else setTownMessage("Mara: Every tempered edge is another stone in Emberfall&apos;s wall.")}}>Mara {!maraGift&&<i className="gift-mark">!</i>}</button>}
          <button style={{left:`${buildingPos.forge.x}%`,top:`${buildingPos.forge.y}%`}} className={`building forge tier-${forgeLevel} ${movingBuilding==="forge"?"moving":""}`} onClick={(e)=>{e.stopPropagation();if(townEdit){setMovingBuilding("forge");return}setTownPos({x:22,y:30});if(rescued)setForgeOpen(true);else setTownMessage("The forge is cold. Its keeper is missing.")}}><span className="roof"></span><b>Blacksmith  {forgeLevel}</b><small>{townEdit?"Select, then place":rescued ? "Reforge a card  25 gold" : "Ruined  survivor missing"}</small></button>
          <button style={{left:`${buildingPos.sanctum.x}%`,top:`${buildingPos.sanctum.y}%`}} className={`building sanctum tier-${sanctumLevel} ${movingBuilding==="sanctum"?"moving":""}`} onClick={(e)=>{e.stopPropagation();if(townEdit){setMovingBuilding("sanctum");return}setTownPos({x:55,y:28});if(blueprint&&sanctumLevel<3&&gold>=35){setGold(v=>v-35);setSanctumLevel(v=>v+1);setBuildToast("Sanctum upgraded");window.setTimeout(()=>setBuildToast(""),1600);setTownMessage("The Sanctum rises. Expeditions begin with stronger elemental reserves.")}else{setTownMessage("The Sanctum opens the elemental attunement chamber.");window.setTimeout(()=>setScreen("attune"),450)}}}><span className="roof"></span><b>Elemental Sanctum  {sanctumLevel}</b><small>{townEdit?"Select, then place":blueprint&&sanctumLevel<3?"Upgrade  35 gold":"Choose starting vows"}</small></button>
          <button style={{left:`${buildingPos.hall.x}%`,top:`${buildingPos.hall.y}%`}} className={`building hall tier-${hallLevel} ${movingBuilding==="hall"?"moving":""}`} onClick={(e)=>{e.stopPropagation();if(townEdit){setMovingBuilding("hall");return}setTownPos({x:44,y:70});if(blueprint&&hallLevel<3&&gold>=30){setGold(v=>v-30);setHallLevel(v=>v+1);setBuildToast("Expedition Hall upgraded");window.setTimeout(()=>setBuildToast(""),1600);setTownMessage("Scouts map deeper roads. Route intelligence has improved.")}else setTownMessage("The Hall displays regional threats and branching roads.")}}><span className="roof"></span><b>Expedition Hall  {hallLevel}</b><small>{townEdit?"Select, then place":blueprint&&hallLevel<3?"Upgrade  30 gold":"Route intelligence"}</small></button>
          <div className={`empty-plot ${blueprint?"claimed":""}`}><span>{blueprint?"":"+"}</span><small>{blueprint?"Forge foundations secured":"Empty plot"}</small></div>
          <div className="road road-a" /><div className="road road-b" />
        </section>
        <aside className="town-panel">
          <p className="eyebrow">EXPEDITION I</p>
          <h2>The Ashen March</h2>
          <p>Demons have nested inside the old western fortress. Break their warden and recover the first city plans.</p>
          <div className="route"><span className="node done">Town</span><i /><span className="node">Wilds</span><i /><span className="node boss">Fortress</span></div>
          <div className="town-dialogue">{townMessage}</div><small className="save-status" aria-live="polite">{saveStatus}</small><div className="gold-readout">Gold <b>{gold}</b>  Supplies <b>{supplies}</b>  Forge <b>{forgeLevel}/3</b>  Sanctum <b>{sanctumLevel}/3</b>  Hall <b>{hallLevel}/3</b></div>{campaignWins>0&&<label className="difficulty-select">Oath level <select value={difficulty} onChange={e=>setDifficulty(+e.target.value)}>{[0,1,2,3].slice(0,Math.min(4,campaignWins+1)).map(level=><option key={level} value={level}>{level} {level?` enemies +${level*12}% health`:" standard"}</option>)}</select></label>}<button className="town-edit" disabled={supplies<=0||playerHp>=maxHp} onClick={spendSupply}>Use supply  heal 8</button><button className="town-edit" onClick={()=>{setTownEdit(v=>!v);setMovingBuilding(null)}}>{townEdit?"Finish city plan":"Arrange buildings"}</button><button className="primary" onClick={beginExpedition}>Prepare expedition <span></span></button>
        </aside>
        {forgeOpen&&<div className="modal-backdrop" onClick={()=>{setForgeOpen(false);setForgeTarget(null)}}><section className="forge-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>{setForgeOpen(false);setForgeTarget(null)}}>Close</button><p className="eyebrow">MARA&apos;S FORGE</p><h2>{forgeTarget?`Choose a path for ${forgeTarget.name}.`:"Choose a card to reforge."}</h2><p>{forgeTarget?"The choice is permanent for this campaign.":"Each reforging costs 25 gold. Every card has two useful paths."}</p>{forgeTarget?<div className="upgrade-paths"><button onClick={()=>reforge(forgeTarget,"power")}><b>Power</b><small>Gain +3 damage or Guard.</small></button><button onClick={()=>reforge(forgeTarget,"mastery")}><b>Mastery</b><small>Cost 1 less energy, minimum 0.</small></button><button className="quiet-button" onClick={()=>setForgeTarget(null)}>Choose another card</button></div>:<div className="forge-list">{(runDeck.length?runDeck:deck).filter((card,index,array)=>array.findIndex(c=>c.id===card.id)===index).map(card=><button key={card.id} disabled={gold<25||upgraded.includes(card.id)} onClick={()=>setForgeTarget(card)}><b>{card.name}{upgraded.includes(card.id)?" +":""}</b><small>{upgraded.includes(card.id)?`${upgradePaths[card.id]||"power"} path`:card.text}</small></button>)}</div>}</section></div>}\n        {deckOverlay}
        {showCampaign&&<div className="modal-backdrop" onClick={()=>setShowCampaign(false)}><section className="campaign-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowCampaign(false)}>Close</button><p className="eyebrow">RECLAMATION LEDGER</p><h2>Emberfall rises by degrees.</h2><div className="campaign-track"><article className="complete"><b>I</b><strong>The Ashen March</strong><small>Playable now  Forge Foundation</small></article>{["II  The Drowned Causeway","III  The Glasswood","IV  The Thunder Crown","V  The Hollow Deep","VI  The Black Citadel"].map((region,index)=><article key={region} className={campaignWins>index?"unlocked":"locked"}><b>{index+2}</b><strong>{region.split("  ")[1]}</strong><small>{campaignWins>index?"Unlocked for future development":"Locked  reclaim the prior region"}</small></article>)}</div><div className="region-profile">{REGION_PROFILE.map((region,index)=><span key={region.name}><b>{index+1}. {region.name}</b><small>{region.mix}</small><em>{region.threat}</em></span>)}</div><div className="achievement-list"><b>Deeds</b>{ACHIEVEMENTS.map(deed=><span key={deed.id} className={achievements.includes(deed.id)?"earned":""}>{achievements.includes(deed.id)?"Earned":"Locked"}  {deed.name}</span>)}</div><p className="campaign-note">This vertical slice contains the complete first expedition. Future regions retain mixed enemy elements while shifting their dominant populations.</p></section></div>}{showRules&&<div className="modal-backdrop" onClick={()=>setShowRules(false)}><section className="rules-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowRules(false)}>Close</button><p className="eyebrow">FIELD MANUAL</p><h2>Elemental reactions</h2><div className="reaction-rules"><article className="steam"><b>Fire + Water</b><h3>Steam</h3><p>Weakens the next enemy attack by 4 damage.</p></article><article className="conduct"><b>Water + Lightning</b><h3>Conduct</h3><p>Deals 6 bonus damage and chains to an escort.</p></article><article className="overload"><b>Fire + Lightning</b><h3>Overload</h3><p>Deals 9 bonus damage through enemy pressure.</p></article></div><h3>Combat glossary</h3><dl><dt>Retain</dt><dd>Stays in hand at end of turn.</dd><dt>Exhaust</dt><dd>Removed until the battle ends.</dd><dt>Burn</dt><dd>Deals damage at turn end, then decreases by one.</dd><dt>Vulnerable</dt><dd>Increases incoming damage by 50%.</dd></dl><small>Keyboard: 1-5 play cards  E ends turn  Escape pauses</small></section></div>}{showRoster&&<div className="modal-backdrop" onClick={()=>setShowRoster(false)}><section className="codex-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowRoster(false)}>Close</button><p className="eyebrow">LEGION BESTIARY</p><h2>Enemies of the Ashen March</h2><div className="roster-grid">{[...FOES,...BOSSES].map((foe,index)=><article key={foe.name} className={index>=FOES.length?"elite-entry":""}><img src={`/art/${foe.art}.webp`} alt={foe.name}/><b>{foe.name}</b><small>{index>=FOES.length?"BOSS":"ENEMY"}</small>{"passive" in foe&&<p>{foe.passive}</p>}</article>)}</div></section></div>}
        {showSettings&&<div className="modal-backdrop" onClick={()=>setShowSettings(false)}><section className="settings-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowSettings(false)}>Close</button><p className="eyebrow">SETTINGS</p><h2>Field provisions</h2><button className="audio-toggle" onClick={toggleMusic}>{musicOn?"Pause music":"Play music"}</button><span className="audio-status" aria-live="polite">{musicStatus}</span><label>Music <input aria-label="Music volume" type="range" value={musicVolume} onChange={e=>setMusicVolume(+e.target.value)}/></label><label>Effects <input aria-label="Effects volume" type="range" value={effectsVolume} onChange={e=>setEffectsVolume(+e.target.value)}/></label><label>Ambience mix <input aria-label="Ambience volume" type="range" value={ambienceVolume} onChange={e=>setAmbienceVolume(+e.target.value)}/></label><label><input type="checkbox" checked={screenShake} onChange={e=>setScreenShake(e.target.checked)}/> Screen shake</label><label><input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)}/> Reduce motion</label><label><input type="checkbox" checked={largeText} onChange={e=>setLargeText(e.target.checked)}/> Large combat text</label><label><input type="checkbox" checked={highContrast} onChange={e=>setHighContrast(e.target.checked)}/> High contrast</label><small>Dark Place by SkyleTheFrench  CC0</small>{confirmReset?<div className="reset-confirm"><b>Erase all local campaign progress?</b><button onClick={()=>{localStorage.removeItem("emberfall-save");localStorage.removeItem("emberfall-tutorial-seen");location.reload()}}>Erase progress</button><button onClick={()=>setConfirmReset(false)}>Cancel</button></div>:<button className="reset-save" onClick={()=>setConfirmReset(true)}>Reset campaign data</button>}</section></div>}
      </main>
    );
  }

  if (screen === "attune") {
    return (
      <main className="attune-screen">
        <button className="back" onClick={() => setScreen("town")}> Return to town</button>
        <section className="attune-copy"><p className="eyebrow">ELEMENTAL SANCTUM</p><h1>Choose two vows.</h1><p>The Knight may bind two primal forces before crossing the gate. Reactions occur when unlike marks meet.</p></section>
        <section className="element-choices">
          {ELEMENTS.map((element) => <button key={element.id} className={`element-choice ${element.id} ${selected.includes(element.id) ? "selected" : ""}`} onClick={() => toggleElement(element.id)}><span className="element-sigil">{element.sigil}</span><small>{selected.includes(element.id) ? `VOW ${selected.indexOf(element.id) + 1}` : "UNBOUND"}</small><h2>{element.name}</h2><p>{element.line}</p></button>)}
        </section>
        {sanctumLevel>=3&&<section className="blessing-choice"><span>Sanctum blessing</span>{ELEMENTS.map(element=><button key={element.id} className={sanctumBlessing===element.id?"active":""} onClick={()=>setSanctumBlessing(element.id)}>{element.name}<small>Begin battles with 1 {element.name} mark</small></button>)}</section>}<div className="attune-footer"><div><b>{selected.length}/2 vows bound</b><small>Starting deck  12 cards{sanctumLevel>=2?"  4 opening energy":""}</small></div><button className="primary" disabled={selected.length !== 2} onClick={()=>setScreen("map")}>Cross the gate</button></div>
      </main>
    );
  }

  if(screen==="map") return <main className="expedition-screen"><header className="combat-top"><button onClick={()=>setConfirmRetreat(true)}>Retreat</button><div><span>THE ASHEN MARCH</span><b>Choose a road  Deck {runDeck.length||12}  Seed {runSeed||"UNSET"}</b></div><div className="turn">CLEARED <b>{encountersCleared}</b>  HP <b>{playerHp}</b></div></header><section className="expedition-copy"><p className="eyebrow">BRANCHING EXPEDITION</p><h1>{mapStep>=3?"The fortress gate":"The road divides in the rain."}</h1><p>{mapStep>=3?"A colossal shadow moves behind the portcullis.":"Enemy concentrations shift with every route. Choose what your deck can answer."}</p></section><section className="route-choices">{mapStep>=3?<button className="encounter boss-encounter" onClick={()=>startCombat(0)}><img src="/art/legion-warden.webp" alt="Legion Warden"/><span>Boss</span><b>Legion Warden</b><small>Blueprint  rescued survivor</small></button>:<>{[mapStep%6,(mapStep+2)%6].map((index,branch)=><button key={index} className={`encounter ${branch?"elite-route":""}`} onClick={()=>startCombat(index,!!branch)}><img src={`/art/${FOES[index].art}.webp`} alt={FOES[index].name}/><span>{branch?"Dangerous route":"Combat"}</span><b>{FOES[index].name}</b><small>{branch?(hallLevel>=2?`Elite pair  ${FOES[(index+1)%FOES.length].name}  20 gold + relic`:"Elite pair  more gold"):(hallLevel>=2?`${FOES[index].passive}  10 gold`:"Card reward")}</small></button>)}<button className="encounter utility-route" onClick={()=>openNode(mapStep%3===0?"camp":mapStep%3===1?"merchant":"event")}><span>Utility</span><b>{mapStep%3===0?"Camp":mapStep%3===1?"Merchant":"Lost Survivor"}</b><small>Recover  trade  choose</small></button></>}</section><div className="route-progress">{[0,1,2,3].map(i=><i key={i} className={i<=mapStep?"reached":i===3?"boss-point":""}/>)}</div>{routeHistory.length>0&&<div className="route-history">{routeHistory.map((entry,index)=><span key={`${entry}-${index}`}>{entry}</span>)}</div>}{nodeType&&<div className="modal-backdrop"><section className="node-modal"><button className="modal-close" onClick={()=>setNodeType(null)}>Leave</button><p className="eyebrow">{nodeType}</p><h2>{nodeType==="camp"?"A fire beneath broken stone":nodeType==="merchant"?"The Lantern Peddler":"Someone calls from the reeds"}</h2>{nodeType==="camp"&&<div className="node-actions"><button onClick={()=>{setPlayerHp(v=>Math.min(maxHp,v+18));finishNode()}}><b>Rest</b><small>Recover 18 health</small></button><button onClick={()=>{const target=(runDeck.length?runDeck:deck).find(c=>!upgraded.includes(c.id));if(target)setUpgraded(v=>[...v,target.id]);finishNode()}}><b>Train</b><small>Upgrade one card</small></button></div>}{nodeType==="merchant"&&<><p>Buy a technique, remove a card, or leave without spending.</p><div className="merchant-stock">{merchantStock.map(card=><button key={card.id} disabled={gold<20} onClick={()=>{setGold(v=>v-20);setRunDeck(v=>[...(v.length?v:deck),card]);finishNode()}}><b>{card.name}</b><small>{card.text}</small><em>20 gold</em></button>)}</div><button className="quiet-button" disabled={gold<25||(runDeck.length?runDeck:deck).length<=8} onClick={()=>{removeCard();finishNode()}}>Remove last card  25 gold</button></>}{nodeType==="event"&&<div className="node-actions"><button onClick={()=>{setGold(v=>v+20);setWandererRescued(true);finishNode()}}><b>Rescue the wanderer</b><small>Gain 20 gold and a future ally</small></button><button onClick={()=>{setPlayerHp(v=>Math.min(maxHp,v+10));setRelics(v=>v.includes("Pilgrim Bell")?v:[...v,"Pilgrim Bell"]);finishNode()}}><b>Follow their warning</b><small>Heal 10 and gain Pilgrim Bell</small></button></div>}</section></div>}{confirmRetreat&&<div className="modal-backdrop"><section className="pause-modal"><p className="eyebrow">RETREAT</p><h2>Leave ordinary spoils behind?</h2><p>Gold, supplies, run cards, and relics will be lost. Survivors, blueprints, buildings, and reforges remain.</p><button className="primary" onClick={retreat}>Confirm retreat</button><button className="quiet-button" onClick={()=>setConfirmRetreat(false)}>Continue expedition</button></section></div>}</main>;

  if(screen==="reward") return <main className="reward-screen"><p className="eyebrow">{elite?"ELITE VANQUISHED":"ROAD CLEARED"}</p><h1>{relicChoice?"Choose a relic.":"Add one card to your deck."}</h1>{relicChoice?<div className="relic-choices">{relicChoice.map(relic=><button key={relic.name} onClick={()=>chooseRelic(relic.name)}><b>{relic.name}</b><span>{relic.text}</span></button>)}</div>:<><p>Current deck: {runDeck.length||12} cards  Health persists: {playerHp}</p><div className="reward-cards">{rewardsFor(selected,mapStep).map(card=><button key={card.id} onClick={()=>claimReward(card)}><b>{card.name}</b><span>{card.text}</span><small>{card.rarity||"common"}  {rewardComparison(card)}  +{elite?20:10} gold</small></button>)}</div><button className="reward-skip" onClick={()=>claimReward()}>Skip card  keep deck lean</button></>}</main>;
  if (screen === "victory" || screen === "defeat") {
    const won = screen === "victory";
    return <main className={`result-screen ${won ? "won" : "lost"}`}><div className="result-sigil">{won ? "VICTORY" : "DEFEAT"}</div><p className="eyebrow">{won ? "FORTRESS RECLAIMED" : "EXPEDITION ENDED"}</p><h1>{won ? "The gate belongs to the living." : "The ash keeps its secrets."}</h1><p>{won ? "Mara the Smith steps from the cells carrying the Forge Foundation blueprint. Both are permanently secured." : "Ordinary spoils are lost, but rescued townspeople and blueprints remain."}</p><div className="run-summary"><span><b>{runStats.cardsPlayed}</b>Cards played</span><span><b>{runStats.reactions}</b>Reactions</span><span><b>{runStats.damageTaken}</b>Damage taken</span><span><b>{runStats.elites}</b>Elite roads</span><span><b>{Math.max(0,gold-runGoldStart)}</b>Gold gained</span></div><div className="rewards">{won ? <><span>Mara rescued</span><span>Forge blueprint</span><span>Oath {Math.min(3,campaignWins+1)} unlocked</span></> : <span>Try a different pairing</span>}</div>{!won&&<><button className="quiet-button" onClick={()=>setShowDefeatHelp(v=>!v)}>Why did this run fail?</button>{showDefeatHelp&&<div className="defeat-help"><b>Field assessment</b><p>{runStats.damageTaken>35?"You took heavy damage. Prioritize Guard, Steam, and camp recovery.":runStats.reactions<4?"Your deck triggered few reactions. Alternate elemental cards to convert marks.":runStats.elites>1?"Multiple elite roads exhausted the Knight. Mix safer fights into the route.":"A leaner deck or a different vow pairing may improve draw consistency."}</p></div>}</>}<button className="primary" onClick={() => setScreen("town")}>Return to Emberfall</button></main>;
  }

  const combatPattern = FOE_INTENTS[activeFoe.name] || ENEMY_INTENTS;
  const intent = combatPattern[intentIndex % combatPattern.length];
  return (
    <main className={`combat-screen ${screenShake&&impact?"shake":""}`}>
      <header className="combat-top"><button onClick={()=>setPaused(true)}>Pause</button><button className="deck-button" onClick={()=>setShowDeck(true)}>Deck {runDeck.length}</button><div><span>{elite?"ELITE ROAD":"THE ASHEN MARCH"}</span><b>Ruined Western Gate</b></div><div className="turn">TURN <b>{turn}</b></div></header>
      <section className="battlefield">{enemyPhaseLabel&&<div className="phase-banner">{enemyPhaseLabel}</div>}
        <div className="combatant knight">
          <div className="status"><b>Elemental Knight</b><span>{playerHp}/{maxHp}</span><div className="health"><i style={{ width: `${(playerHp / maxHp) * 100}%` }} /></div>{guard > 0 && <small> {guard} Guard</small>}{playerBurn>0&&<small className="burn-status">Burn {playerBurn}</small>}{vulnerable>0&&<small className="vulnerable-status">Vulnerable  +50% damage</small>}</div>
          <div className={`character-art knight-art ${knightMotion}`}><img src="/art/elemental-knight.webp" alt="The Elemental Knight in blackened plate with sword and shield" /></div>
        </div>
        <div className="combat-center"><p>{log}</p><details className="combat-log"><summary>Battle log</summary>{combatHistory.map((entry,index)=><span key={`${entry}-${index}`}>{entry}</span>)}</details>{reactionBurst&&<strong className={`reaction-burst ${reactionBurst.replace("+","-")}`}>{reactionBurst==="fire+water"?"STEAM":reactionBurst==="fire+lightning"?"OVERLOAD":"CONDUCT"}</strong>}<div className="chain-line" /></div>
        {targetHint&&<div className="target-hint">{targetHint}<button onClick={()=>setTargetHint("")}>Dismiss</button></div>}{secondFoe&&secondHp>0&&<button className={`escort-target ${targetSlot===1?"selected-target":""}`} onClick={()=>setTargetSlot(1)} aria-label={`Target ${secondFoe.name}`}><small>ESCORT INTENT  Attack 6</small><img src={`/art/${secondFoe.art}.webp`} alt={secondFoe.name}/><b>{secondFoe.name}</b><span>{secondHp}/{Math.ceil(secondFoe.hp*.65)}</span></button>}
        <div className="combatant demon">
          <div className="intent-card"><i>{intentionIcon(intent)}</i><small>{mapStep>=3?`BOSS PHASE ${bossPhase}`:"NEXT INTENT"}</small><b>{intent.name}</b><span>{effectiveIntent()}</span></div>
          <button className={`target-button ${targetSlot===0?"selected-target":""}`} onClick={()=>setTargetSlot(0)} aria-label={`Target ${activeFoe.name}`}><div className={`character-art demon-art entering ${impact?`hit ${impact}`:""}`}><img src={`/art/${activeFoe.art}.webp`} alt={activeFoe.name} /></div></button>
          {damageNumber&&<strong className="damage-number">{damageNumber}</strong>}<div className="status"><b>{elite?`Elite ${activeFoe.name}`:activeFoe.name}</b><span>{enemyHp}/{foeMaxHp}</span><div className="health enemy"><i style={{ width: `${(enemyHp / foeMaxHp) * 100}%` }} /></div>{enemyArmor > 0 && <small>{enemyArmor} Armor</small>}{enemyThorns>0&&<small className="thorns-status">Cinder Ward  retaliates {enemyThorns}</small>}{enemyRage>0&&<small className="rage-status">Rage +{enemyRage}</small>}{enemyRegeneration>0&&<small className="regen-status">Regeneration {enemyRegeneration}</small>}{enemyCharged&&<small className="charged-status">Charged +4 next attack</small>}</div>
          <div className="marks">{ELEMENTS.map((element) => marks[element.id] > 0 && <span key={element.id} className={element.id}>{element.sigil} {marks[element.id]}</span>)}</div><p className="enemy-passive">{activeFoe.passive}</p>
        </div>
      </section>
      <section className="hand-zone">
        <div className="energy-orb"><b>{energy}</b><span>ENERGY</span></div>
        <div className="hand">{hand.map((card,index) => <button key={card.id} disabled={!canPlay(card)} className={`card ${card.element ?? "steel"} ${card.rarity||"common"}`} onClick={() => playCard(card)}><span className="cost">{cardCost(card)}</span><kbd>{index+1}</kbd><small>{card.element ?? "KNIGHT"}{upgraded.includes(card.id)?`  ${upgradePaths[card.id]?.toUpperCase()} UPGRADE`:""}</small><h3>{card.name}{upgraded.includes(card.id)?" +":""}</h3><div className={`card-art ${card.element ?? "steel"}`}><span>{card.element ? "" : ""}</span></div><p>{card.text}</p><em className="card-preview">{preview(card)}</em></button>)}</div>
        <button className="end-turn" onClick={endTurn}>End turn <span>E</span></button>
      </section>
      <footer className="combat-footer"><button onClick={()=>setPileView("draw")}>Draw pile <b>{drawPile.length}</b></button><button onClick={()=>setPileView("discard")}>Discard <b>{discard.length}</b></button><button onClick={()=>setPileView("exhausted")}>Exhausted <b>{exhausted.length}</b></button><span>Reactions: <b>Steam  Conduct  Overload</b></span></footer>{deckOverlay}{pileOverlay}
      {bossIntro&&<div className="modal-backdrop boss-intro"><section><p className="eyebrow">COLOSSAL DEMON</p><h2>Legion Warden</h2><img src="/art/legion-warden.webp" alt="Legion Warden"/><p>Its chains are forged from the city gate. Break the siege ward before the Horned Rush.</p><button className="primary" onClick={()=>setBossIntro(false)}>Face the Warden</button></section></div>}{showTutorial&&<div className="modal-backdrop"><section className="tutorial-modal"><p className="eyebrow">FIRST ENGAGEMENT  {tutorialPage+1}/2</p>{tutorialPage===0?<><h2>Read before you strike.</h2><div className="tutorial-grid"><span><b>1</b><strong>Read intent</strong><small>The enemy shows exactly what it will do next.</small></span><span><b>2</b><strong>Spend energy</strong><small>Cards cost energy; unused energy does not carry over.</small></span><span><b>3</b><strong>Preserve health</strong><small>Health persists throughout the expedition.</small></span></div><button className="primary" onClick={()=>setTutorialPage(1)}>Next: reactions</button></>:<><h2>Mark. Cross. React.</h2><div className="tutorial-grid"><span><b>F+W</b><strong>Steam</strong><small>Weakens the next enemy attack by 4.</small></span><span><b>W+L</b><strong>Conduct</strong><small>Deals 6 bonus and chains to escorts.</small></span><span><b>F+L</b><strong>Overload</strong><small>Deals 9 immediate bonus damage.</small></span></div><button className="primary" onClick={()=>{setShowTutorial(false);setTutorialPage(0)}}>Raise shield</button></>}</section></div>}
      {paused&&<div className="modal-backdrop"><section className="pause-modal"><p className="eyebrow">EXPEDITION PAUSED</p><h2>The road will wait.</h2><button className="primary" onClick={()=>setPaused(false)}>Resume battle</button><button className="quiet-button" onClick={retreat}>Abandon  lose gold and supplies</button></section></div>}
    </main>
  );
}
