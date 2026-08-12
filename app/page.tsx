"use client";

import { useMemo, useState } from "react";

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
};

const ELEMENTS: { id: Element; name: string; sigil: string; line: string }[] = [
  { id: "fire", name: "Fire", sigil: "✦", line: "Burn and relentless pressure" },
  { id: "water", name: "Water", sigil: "◒", line: "Guard, flow, and preparation" },
  { id: "lightning", name: "Lightning", sigil: "ϟ", line: "Burst and charged finishers" },
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

const FOES = [
  { name: "Ash Hound", art: "ash-hound" }, { name: "Cinder Cultist", art: "cinder-cultist" },
  { name: "Gate Reaver", art: "gate-reaver" }, { name: "Drowned Penitent", art: "drowned-penitent" },
  { name: "Storm Imp", art: "storm-imp" }, { name: "Ironbound Brute", art: "ironbound-brute" },
];
const BOSSES = [
  { name: "Furnace Bishop", art: "furnace-bishop" }, { name: "Tempest Wyvern", art: "tempest-wyvern" },
  { name: "Abyssal Tidemother", art: "abyssal-tidemother" }, { name: "Ashen Colossus", art: "ashen-colossus" },
];

const emptyMarks = (): MarkState => ({ fire: 0, water: 0, lightning: 0 });
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Home() {
  const [screen, setScreen] = useState<"town" | "attune" | "combat" | "victory" | "defeat">("town");
  const [selected, setSelected] = useState<Element[]>(["fire", "water"]);
  const [playerHp, setPlayerHp] = useState(58);
  const [guard, setGuard] = useState(0);
  const [enemyHp, setEnemyHp] = useState(72);
  const [enemyArmor, setEnemyArmor] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [turn, setTurn] = useState(1);
  const [intentIndex, setIntentIndex] = useState(0);
  const [marks, setMarks] = useState<MarkState>(emptyMarks());
  const [weakened, setWeakened] = useState(false);
  const [hand, setHand] = useState<Card[]>([]);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [log, setLog] = useState("The gate groans. The Legion Warden advances.");
  const [rescued, setRescued] = useState(false);
  const [blueprint, setBlueprint] = useState(false);
  const [townPos, setTownPos] = useState({ x: 48, y: 58 });
  const [townMessage, setTownMessage] = useState("Click anywhere in the courtyard to walk.");
  const [showRoster, setShowRoster] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [impact, setImpact] = useState("");

  const deck = useMemo(
    () => [...BASE_CARDS, ...ELEMENT_CARDS[selected[0]], ...ELEMENT_CARDS[selected[1]]],
    [selected],
  );

  function toggleElement(element: Element) {
    setSelected((current) => {
      if (current.includes(element)) return current.length === 1 ? current : current.filter((item) => item !== element);
      return current.length < 2 ? [...current, element] : [current[1], element];
    });
  }

  function startCombat() {
    const pile = shuffle(deck);
    setHand(pile.slice(0, 5));
    setDrawPile(pile.slice(5));
    setDiscard([]);
    setPlayerHp(58);
    setEnemyHp(72);
    setEnemyArmor(0);
    setGuard(0);
    setEnergy(3);
    setTurn(1);
    setIntentIndex(0);
    setMarks(emptyMarks());
    setWeakened(false);
    setLog("The gate groans. The Legion Warden advances.");
    setScreen("combat");
  }

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
      if (card) nextHand.push(card);
    }
    setHand(nextHand);
    setDrawPile(pile);
    setDiscard(spent);
  }

  function playCard(card: Card) {
    if (card.cost > energy || screen !== "combat") return;
    setEnergy((value) => value - card.cost);
    setHand((cards) => cards.filter((item) => item.id !== card.id));
    setDiscard((cards) => [...cards, card]);
    if (card.block) setGuard((value) => value + card.block!);

    let dealt = card.damage ?? 0;
    let reaction = "";
    const nextMarks = { ...marks };

    if (card.element) {
      const partner = (Object.keys(nextMarks) as Element[]).find(
        (element) => element !== card.element && nextMarks[element] > 0,
      );
      if (partner) {
        const pair = [card.element, partner].sort().join("+");
        nextMarks[partner] -= 1;
        if (pair === "fire+water") {
          reaction = "STEAM — the Warden's next attack is weakened.";
          setWeakened(true);
        } else if (pair === "fire+lightning") {
          dealt += 9;
          reaction = "OVERLOAD — 9 bonus damage tears through its armor.";
        } else if (pair === "lightning+water") {
          dealt += 6;
          reaction = "CONDUCT — 6 chain damage arcs through the gate.";
        }
      } else {
        nextMarks[card.element] += 1;
      }
      setMarks(nextMarks);
    }

    if (dealt) {
      setImpact(card.element ?? "steel");
      window.setTimeout(() => setImpact(""), 360);
      const absorbed = Math.min(enemyArmor, dealt);
      const hpDamage = dealt - absorbed;
      const nextHp = enemyHp - hpDamage;
      setEnemyArmor((value) => Math.max(0, value - dealt));
      setEnemyHp(Math.max(0, nextHp));
      if (nextHp <= 0) {
        setRescued(true);
        setBlueprint(true);
        setScreen("victory");
      }
    }
    setLog(reaction || `${card.name} answers the Warden.`);
    if (card.draw) drawCards(card.draw, hand.filter((item) => item.id !== card.id), drawPile, [...discard, card]);
  }

  function endTurn() {
    const intent = ENEMY_INTENTS[intentIndex];
    let message = "";
    if (intent.damage) {
      const attack = Math.max(0, intent.damage - (weakened ? 4 : 0));
      const damage = Math.max(0, attack - guard);
      const nextHp = playerHp - damage;
      setPlayerHp(Math.max(0, nextHp));
      message = `The Warden strikes for ${damage}${guard ? ` after ${guard} Guard` : ""}.`;
      setWeakened(false);
      if (nextHp <= 0) {
        setScreen("defeat");
        return;
      }
    } else {
      setEnemyArmor((value) => value + 7);
      message = "The Warden plates itself in 7 demonic armor.";
    }
    const spent = [...discard, ...hand];
    let pile = [...drawPile];
    if (pile.length < 5) {
      pile = [...pile, ...shuffle(spent)];
      setDiscard([]);
    } else {
      setDiscard(spent);
    }
    setHand(pile.slice(0, 5));
    setDrawPile(pile.slice(5));
    setGuard(0);
    setEnergy(3);
    setTurn((value) => value + 1);
    setIntentIndex((value) => (value + 1) % ENEMY_INTENTS.length);
    setLog(message);
  }

  if (screen === "town") {
    return (
      <main className="town-screen">
        <header className="topbar">
          <div className="brand"><span className="crest">EK</span><div><b>EMBERFALL</b><small>An Elemental Knight Chronicle</small></div></div>
          <div className="resources"><button onClick={()=>setShowRoster(true)}>Bestiary</button><button onClick={()=>setShowSettings(true)}>Settings</button><span>Blueprints <b>{blueprint ? 1 : 0}</b></span><span>Survivors <b>{rescued ? 1 : 0}</b></span></div>
        </header>
        <section className="town-intro">
          <p className="eyebrow">THE LAST QUIET GROUND</p>
          <h1>Reclaim what the demons left behind.</h1>
          <p>Raise a fortress from ash. Every rescued soul changes what the Knight can carry beyond the gate.</p>
        </section>
        <section className="town-grid" aria-label="Walkable overhead town" onClick={(event)=>{const rect=event.currentTarget.getBoundingClientRect();setTownPos({x:((event.clientX-rect.left)/rect.width)*100,y:((event.clientY-rect.top)/rect.height)*100});setTownMessage("Boots ring across the wet stones.")}}>
          <div className="grid-lines" />
          <div className="town-knight" style={{left:`${townPos.x}%`,top:`${townPos.y}%`}}><img src="/art/elemental-knight.webp" alt="Elemental Knight walking through town"/></div>
          {rescued && <button className="town-npc" onClick={(event)=>{event.stopPropagation();setTownMessage("Mara: Bring me a blueprint and I will make it sing.")}}>Mara</button>}
          <button className="building forge"><span className="roof">⚒</span><b>Blacksmith</b><small>{rescued ? "Mara has returned" : "Ruined · survivor missing"}</small></button>
          <button className="building sanctum"><span className="roof">✦</span><b>Elemental Sanctum</b><small>Attunement available</small></button>
          <button className="building hall"><span className="roof">⌂</span><b>Expedition Hall</b><small>Gate route prepared</small></button>
          <div className="empty-plot"><span>+</span><small>Empty plot</small></div>
          <div className="road road-a" /><div className="road road-b" />
        </section>
        <aside className="town-panel">
          <p className="eyebrow">EXPEDITION I</p>
          <h2>The Ashen March</h2>
          <p>Demons have nested inside the old western fortress. Break their warden and recover the first city plans.</p>
          <div className="route"><span className="node done">Town</span><i /><span className="node">Wilds</span><i /><span className="node boss">Fortress</span></div>
          <div className="town-dialogue">{townMessage}</div><button className="primary" onClick={() => setScreen("attune")}>Prepare expedition <span>→</span></button>
        </aside>
        {showRoster&&<div className="modal-backdrop" onClick={()=>setShowRoster(false)}><section className="codex-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowRoster(false)}>Close</button><p className="eyebrow">LEGION BESTIARY</p><h2>Enemies of the Ashen March</h2><div className="roster-grid">{[...FOES,...BOSSES].map((foe,index)=><article key={foe.name} className={index>=FOES.length?"elite-entry":""}><img src={`/art/${foe.art}.webp`} alt={foe.name}/><b>{foe.name}</b><small>{index>=FOES.length?"BOSS":"ENEMY"}</small></article>)}</div></section></div>}
        {showSettings&&<div className="modal-backdrop" onClick={()=>setShowSettings(false)}><section className="settings-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowSettings(false)}>Close</button><p className="eyebrow">SETTINGS</p><h2>Field provisions</h2><label>Music <input type="range" defaultValue="70"/></label><label>Effects <input type="range" defaultValue="85"/></label><label><input type="checkbox" defaultChecked/> Screen shake</label><label><input type="checkbox" defaultChecked/> Reduced flashes</label></section></div>}
      </main>
    );
  }

  if (screen === "attune") {
    return (
      <main className="attune-screen">
        <button className="back" onClick={() => setScreen("town")}>← Return to town</button>
        <section className="attune-copy"><p className="eyebrow">ELEMENTAL SANCTUM</p><h1>Choose two vows.</h1><p>The Knight may bind two primal forces before crossing the gate. Reactions occur when unlike marks meet.</p></section>
        <section className="element-choices">
          {ELEMENTS.map((element) => <button key={element.id} className={`element-choice ${element.id} ${selected.includes(element.id) ? "selected" : ""}`} onClick={() => toggleElement(element.id)}><span className="element-sigil">{element.sigil}</span><small>{selected.includes(element.id) ? `VOW ${selected.indexOf(element.id) + 1}` : "UNBOUND"}</small><h2>{element.name}</h2><p>{element.line}</p></button>)}
        </section>
        <div className="attune-footer"><div><b>{selected.length}/2 vows bound</b><small>Starting deck · 12 cards</small></div><button className="primary" disabled={selected.length !== 2} onClick={startCombat}>Cross the gate <span>→</span></button></div>
      </main>
    );
  }

  if (screen === "victory" || screen === "defeat") {
    const won = screen === "victory";
    return <main className={`result-screen ${won ? "won" : "lost"}`}><div className="result-sigil">{won ? "✦" : "†"}</div><p className="eyebrow">{won ? "FORTRESS RECLAIMED" : "EXPEDITION ENDED"}</p><h1>{won ? "The gate belongs to the living." : "The ash keeps its secrets."}</h1><p>{won ? "Mara the Smith steps from the cells carrying the Forge Foundation blueprint. Both are permanently secured." : "Ordinary spoils are lost, but rescued townspeople and blueprints would remain."}</p><div className="rewards">{won ? <><span><b>⚒</b>Mara rescued</span><span><b>⌘</b>Forge blueprint</span></> : <span><b>↻</b>Try a different pairing</span>}</div><button className="primary" onClick={() => setScreen("town")}>Return to Emberfall <span>→</span></button></main>;
  }

  const intent = ENEMY_INTENTS[intentIndex];
  return (
    <main className="combat-screen">
      <header className="combat-top"><button onClick={() => setScreen("town")}>Abandon</button><div><span>THE ASHEN MARCH</span><b>Ruined Western Gate</b></div><div className="turn">TURN <b>{turn}</b></div></header>
      <section className="battlefield">
        <div className="combatant knight">
          <div className="status"><b>Elemental Knight</b><span>{playerHp}/58</span><div className="health"><i style={{ width: `${(playerHp / 58) * 100}%` }} /></div>{guard > 0 && <small>◆ {guard} Guard</small>}</div>
          <div className="character-art knight-art"><img src="/art/elemental-knight.webp" alt="The Elemental Knight in blackened plate with sword and shield" /></div>
        </div>
        <div className="combat-center"><p>{log}</p><div className="chain-line" /></div>
        <div className="combatant demon">
          <div className="intent-card"><small>NEXT INTENT</small><b>{intent.name}</b><span>{intent.detail}{weakened && intent.damage ? " · weakened" : ""}</span></div>
          <div className={`character-art demon-art ${impact?`hit ${impact}`:""}`}><img src="/art/legion-warden.webp" alt="The horned Legion Warden in furnace-lit fortress armor" /></div>
          <div className="status"><b>Legion Warden</b><span>{enemyHp}/72</span><div className="health enemy"><i style={{ width: `${(enemyHp / 72) * 100}%` }} /></div>{enemyArmor > 0 && <small>⬟ {enemyArmor} Armor</small>}</div>
          <div className="marks">{ELEMENTS.map((element) => marks[element.id] > 0 && <span key={element.id} className={element.id}>{element.sigil} {marks[element.id]}</span>)}</div>
        </div>
      </section>
      <section className="hand-zone">
        <div className="energy-orb"><b>{energy}</b><span>ENERGY</span></div>
        <div className="hand">{hand.map((card) => <button key={card.id} disabled={card.cost > energy} className={`card ${card.element ?? "steel"}`} onClick={() => playCard(card)}><span className="cost">{card.cost}</span><small>{card.element ?? "KNIGHT"}</small><h3>{card.name}</h3><div className={`card-art ${card.element ?? "steel"}`}><span>{card.element ? "" : "⚔"}</span></div><p>{card.text}</p></button>)}</div>
        <button className="end-turn" onClick={endTurn}>End turn <span>→</span></button>
      </section>
      <footer className="combat-footer"><span>Draw pile <b>{drawPile.length}</b></span><span>Discard <b>{discard.length}</b></span><span>Reactions: <b>Steam · Conduct · Overload</b></span></footer>
    </main>
  );
}
