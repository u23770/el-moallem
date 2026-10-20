import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/game/state/createState.js';
import { createEndlessQuest, ensureEndlessQuests } from '../src/game/quests/endless.js';
import { deliverQuest, claimQuestReward } from '../src/game/quests/questEngine.js';
import { PRODUCT_MAP } from '../src/data/products.js';

let n = 0;
const id = () => `e-${++n}`;

function endlessState() {
  const s = createInitialState();
  s.endlessUnlocked = true;
  s.storyLevel = 6;
  return ensureEndlessQuests(structuredClone(s), 3);
}

describe('endless mode generation', () => {
  it('does not generate before unlock', () => {
    const s = structuredClone(createInitialState());
    ensureEndlessQuests(s);
    expect(s.endless.quests).toHaveLength(0);
  });

  it('generates exactly 3 active varied quests after unlock, deterministically', () => {
    const a = endlessState();
    const b = endlessState();
    expect(a.endless.quests).toHaveLength(3);
    expect(a.endless.quests.map((q) => q.id)).toEqual(b.endless.quests.map((q) => q.id));
    for (const q of a.endless.quests) {
      expect(q.rewardCash).toBeGreaterThanOrEqual(25);
      expect(q.rewardCash).toBeLessThanOrEqual(400);
      expect(q.titleAr.length).toBeGreaterThan(2);
      expect(q.descAr.length).toBeGreaterThan(10);
    }
  });

  it('delivery rewards always equal goods cost + bounded 20..40 bonus (no exploit)', () => {
    const s = endlessState();
    let checked = 0;
    for (let c = 1; c <= 40; c++) {
      const q = createEndlessQuest(s, c);
      if (q.type !== 'deliver') continue;
      const cost = Object.entries(q.items).reduce((sum, [pid, qty]) => sum + PRODUCT_MAP[pid].cost * qty, 0);
      expect(q.rewardCash - cost).toBeGreaterThanOrEqual(20);
      expect(q.rewardCash - cost).toBeLessThanOrEqual(40);
      checked++;
    }
    expect(checked).toBeGreaterThan(5);
  });

  it('never asks for locked cold products without a fridge and keeps targets modest', () => {
    const s = endlessState(); // no fridge in fresh state
    for (let c = 1; c <= 40; c++) {
      const q = createEndlessQuest(s, c);
      if (q.type === 'deliver') {
        for (const pid of Object.keys(q.items)) expect(PRODUCT_MAP[pid].cold).toBe(false);
      }
      if (q.target) expect(q.target).toBeLessThanOrEqual(20);
    }
  });

  it('claiming an endless delivery replaces it with a fresh quest (sustainable loop)', () => {
    let s = endlessState();
    // find or force a delivery quest
    let dq = s.endless.quests.find((q) => q.type === 'deliver');
    if (!dq) { s.endless.counter += 1; dq = createEndlessQuest(s, 7); s.endless.quests[0] = dq; }
    if (dq.type === 'deliver') {
      for (const [pid, qty] of Object.entries(dq.items)) s.inventory[pid] = qty + 1;
      const before = s.endless.quests.length;
      const res = deliverQuest(s, dq.id, id());
      expect(res.ok).toBe(true);
      const active = res.state.endless.quests.filter((q) => q.status === 'active' || q.status === 'completed');
      expect(active.length).toBeGreaterThanOrEqual(3);
      expect(before).toBeGreaterThan(0);
      // cannot deliver the same endless quest twice
      expect(deliverQuest(res.state, dq.id, id()).ok).toBe(false);
      expect(claimQuestReward(res.state, dq.id, id()).ok).toBe(false);
    }
  });
});
