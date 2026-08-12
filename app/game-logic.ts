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
