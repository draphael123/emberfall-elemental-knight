export function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  let state = hashSeed(seed) || 1;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function scaledEnemyHp(baseHp: number, elite: boolean, difficulty: number) {
  return Math.ceil((elite ? baseHp * 1.28 : baseHp) * (1 + difficulty * 0.12));
}

export function incomingAttack(base: number, difficulty: number, modifiers: number, weakened: boolean, vulnerable: boolean) {
  return Math.max(0, Math.ceil((base + difficulty + modifiers - (weakened ? 4 : 0)) * (vulnerable ? 1.5 : 1)));
}

export function cityRank(score: number) {
  if (score >= 11) return "Fortified City";
  if (score >= 8) return "Rising Stronghold";
  if (score >= 5) return "Reclaimed Ward";
  return "Last Refuge";
}

export function removeAt<T>(items: T[], index: number): T[] {
  if (index < 0 || index >= items.length) return [...items];
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function rewardBand(value: number, average: number) {
  if (value > average) return "Above deck average";
  if (value === average) return "Matches deck average";
  return "Utility or setup pick";
}

export function expeditionGrade(reactions: number, elites: number, damageTaken: number) {
  const score = reactions * 3 + elites * 5 - damageTaken / 8;
  if (score >= 25) return "S";
  if (score >= 16) return "A";
  if (score >= 8) return "B";
  return "C";
}

export type CampaignSave = Record<string, unknown>;

export function parseCampaignSave(raw: string | null): CampaignSave | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as CampaignSave;
  } catch {
    return null;
  }
}

export function repairCampaignSave(save: CampaignSave) {
  const number = (key: string, fallback: number, min: number, max: number) => {
    const value = save[key];
    return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  };
  return {
    ...save,
    gold: number("gold", 45, 0, 9999),
    supplies: number("supplies", 0, 0, 99),
    forgeLevel: number("forgeLevel", 0, 0, 3),
    sanctumLevel: number("sanctumLevel", 1, 1, 3),
    hallLevel: number("hallLevel", 1, 1, 3),
    difficulty: number("difficulty", 0, 0, 3),
    campaignWins: number("campaignWins", 0, 0, 999),
    townDay: number("townDay", 1, 1, 9999),
  };
}

export function reactionResult(first: string, second: string, emberLens = false) {
  const pair = [first, second].sort().join("+");
  if (pair === "fire+water") return { name: "STEAM", damage: 0, weaken: 4, chain: 0 };
  if (pair === "fire+lightning") return { name: "OVERLOAD", damage: emberLens ? 12 : 9, weaken: 0, chain: 0 };
  if (pair === "lightning+water") return { name: "CONDUCT", damage: 6, weaken: 0, chain: 6 };
  return null;
}

export function restorationObjectives(state: { rescued: boolean; blueprint: boolean; wandererRescued: boolean; forgeLevel: number; sanctumLevel: number; hallLevel: number }) {
  return [
    { done: state.rescued, label: "Rescue Mara" },
    { done: state.blueprint, label: "Recover the Forge Foundation" },
    { done: state.wandererRescued, label: "Find Ilyra" },
    { done: state.forgeLevel >= 3, label: "Complete the Blacksmith" },
    { done: state.sanctumLevel >= 3, label: "Restore the Sanctum" },
    { done: state.hallLevel >= 3, label: "Complete the Expedition Hall" },
  ];
}

export function relicChoices<T extends { name: string }>(relics: T[], owned: string[], seed: string) {
  return seededShuffle(relics.filter(relic => !owned.includes(relic.name)), seed).slice(0, 2);
}

export function eligibleRewards<T extends { element?: string }>(cards: T[], selected: string[], seed: string) {
  return seededShuffle(cards.filter(card => !card.element || selected.includes(card.element)), seed).slice(0, 3);
}

export function canAfford(balance: number, price: number) {
  return balance >= price && price >= 0;
}

export function spend(balance: number, price: number) {
  return canAfford(balance, price) ? balance - price : balance;
}
