# Emberfall: Elemental Knight

A playable vertical slice for a dark-fantasy deck-building roguelike about rebuilding an abandoned town and mastering elemental reactions.

## Current slice

- Walkable overhead town with placeable Blacksmith, Elemental Sanctum, and Expedition Hall
- Fire, Water, and Lightning attunement; choose two before combat
- Twelve-card Elemental Knight deck with sword, shield, and elemental techniques
- Branching seeded expeditions with fights, elite pairs, camps, merchants, events, and a multi-phase boss
- Visible enemy intentions, target selection, Guard, armor, Burn, status effects, persistent marks, and three reactions
- Steam weakens, Conduct chains damage, and Overload delivers burst damage
- Permanent townspeople, blueprints, branching card reforges, building tiers, gifts, deeds, and Oath difficulty levels
- Licensed CC0 music, synthesized combat effects, accessibility controls, tutorial, rulebook, bestiary, and local saves
- Responsive browser presentation with touch-sized controls, compact mobile intents, loading/error recovery, and install metadata
- Restoration ledger identifies the next permanent city objective; save values are validated and repaired on load

## Quality baseline

- `npm test` builds the production application and runs gameplay, balance, persistence, accessibility, asset, and presentation checks
- `npm run lint` validates authored source while excluding generated deployment output
- Desktop and 390 x 844 mobile flows are verified against the production URL

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production prototype is available at [emberfall-elemental-knight.vercel.app](https://emberfall-elemental-knight.vercel.app).
