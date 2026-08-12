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
