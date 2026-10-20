import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/game/state/createState.js';
import { buyStock, serveOrder, buyUpgrade } from '../src/game/economy/economy.js';
import {
  startQuest, deliverQuest, claimQuestReward, availableStoryQuests,
} from '../src/game/quests/questEngine.js';
import { levelProgress, canCompleteLevel, completeLevel, getMetricValue } from '../src/game/story/story.js';
import { SaveManager, MemoryAdapter, SAVE_KEY } from '../src/game/save/saveAdapter.js';

let n = 0;
const id = () => `t-${++n}`;
const rng = (() => { const v = [0.12, 0.34, 0.56, 0.78, 0.9, 0.21]; let i = 0; return () => v[i++ % v.length]; })();

function serveCurrent(s) {
  // top up whatever the current order needs, then serve (mirrors real play)
  for (const [pid, qty] of Object.entries(s.currentOrder.items)) {
    const missing = qty - s.inventory[pid];
    if (missing > 0) {
      const r = buyStock(s, pid, missing + 2, id());
      expect(r.ok).toBe(true);
      s = r.state;
    }
  }
  const r = serveOrder(s, id(), rng);
  expect(r.ok).toBe(true);
  return r.state;
}

describe('quests: delivery + one-time rewards', () => {
  it('deliver quest deducts stock once and pays once', () => {
    let s = createInitialState();
    // q_kid_snack needs 2 chips + 1 choco, pays 30
    s = buyStock(s, 'choco', 2, id()).state;
    const started = startQuest(s, 'q_kid_snack', id());
    expect(started.ok).toBe(true);
    const cashBefore = started.state.cash;
    const delivered = deliverQuest(started.state, 'q_kid_snack', id());
    expect(delivered.ok).toBe(true);
    expect(delivered.state.cash).toBe(cashBefore + 30);
    expect(delivered.state.inventory.chips).toBe(3);
    expect(delivered.state.inventory.choco).toBe(1);
    // second delivery attempt rejected (no duplicate reward)
    const again = deliverQuest(delivered.state, 'q_kid_snack', id());
    expect(again.ok).toBe(false);
    expect(again.state.cash).toBe(cashBefore + 30);
    // and claimQuestReward cannot pay again
    expect(claimQuestReward(delivered.state, 'q_kid_snack', id()).ok).toBe(false);
  });

  it('progress quests track buying and claim exactly once', () => {
    let s = createInitialState();
    s.storyLevel = 3;
    s = startQuest(s, 'q_ragab_supply', id()).state; // buy 15 chips
    s = buyStock(s, 'chips', 15, id()).state;
    expect(s.quests.completed).toContain('q_ragab_supply');
    const cash = s.cash;
    const claimed = claimQuestReward(s, 'q_ragab_supply', id());
    expect(claimed.ok).toBe(true);
    expect(claimed.state.cash).toBe(cash + 35);
    expect(claimQuestReward(claimed.state, 'q_ragab_supply', id()).ok).toBe(false);
  });

  it('quests are level-gated (cannot start future quests)', () => {
    const s = createInitialState(); // level 1
    expect(startQuest(s, 'q_final_hara', id()).ok).toBe(false);
    const avail = availableStoryQuests(s).map((q) => q.id);
    expect(avail).toContain('q_kid_snack');
    expect(avail).not.toContain('q_final_hara');
  });

  it('delivery with missing stock fails atomically', () => {
    let s = createInitialState();
    s = startQuest(s, 'q_kid_snack', id()).state; // has chips, no choco
    const before = JSON.stringify(s);
    const res = deliverQuest(s, 'q_kid_snack', id());
    expect(res.ok).toBe(false);
    // only difference vs input may be none at all (original object returned)
    expect(JSON.stringify(res.state)).toBe(before);
  });
});

describe('8-9. reputation and story progression', () => {
  it('level 1 completes only after both objectives, pays 30, advances exactly one level', () => {
    let s = createInitialState();
    expect(canCompleteLevel(s)).toBe(false);
    expect(completeLevel(s, id()).ok).toBe(false);
    s = buyStock(s, 'biscuit', 10, id()).state; // buy objective
    expect(canCompleteLevel(s)).toBe(false); // still needs 1 serve
    s = serveCurrent(s);
    expect(canCompleteLevel(s)).toBe(true);
    const cash = s.cash;
    const done = completeLevel(s, id());
    expect(done.ok).toBe(true);
    expect(done.state.storyLevel).toBe(2);
    expect(done.state.cash).toBe(cash + 30);
    // cannot claim level reward again / skip next level objectives
    expect(completeLevel(done.state, id()).ok).toBe(false);
  });

  it('level objectives report readable progress numbers', () => {
    const s = createInitialState();
    const prog = levelProgress(s);
    expect(prog.level.titleAr).toBe('أول خطوة');
    expect(prog.objectives[0]).toMatchObject({ current: 0, target: 10, done: false });
    expect(getMetricValue(s, 'reputation')).toBe(50);
  });

  it('reputation stays bounded 0..100', () => {
    let s = createInitialState();
    s.reputation = 99;
    s = serveCurrent(s); // fair price -> +2
    expect(s.reputation).toBeLessThanOrEqual(100);
  });

  it('endless unlocks ONLY by completing level 5', () => {
    let s = createInitialState();
    // simulate arriving at level 5 with objectives satisfied
    s.storyLevel = 5;
    s.reputation = 80;
    s.stats.customersServed = 25;
    s.upgrades = ['sign', 'shelves'];
    s.quests.claimed = ['q_final_hara'];
    s.quests.completed = ['q_final_hara'];
    expect(s.endlessUnlocked).toBe(false);
    const done = completeLevel(s, id());
    expect(done.ok).toBe(true);
    expect(done.state.endlessUnlocked).toBe(true);
    expect(done.state.titleEarned).toBe(true);
    expect(done.state.endless.quests.length).toBe(3);
    // cannot complete again
    expect(completeLevel(done.state, id()).ok).toBe(false);
  });

  it('cannot jump from level 3 to endless by spoofing later objectives', () => {
    let s = createInitialState();
    s.storyLevel = 3;
    s.quests.claimed = ['q_final_hara'];
    s.quests.completed = ['q_final_hara'];
    const res = completeLevel(s, id());
    // level 3 has its own unmet objectives, so this must fail entirely
    expect(res.ok).toBe(false);
    expect(res.state.endlessUnlocked).toBe(false);
  });
});

describe('9b. full playthrough simulation (levels 1 -> 5 -> endless)', () => {
  it('a fair-price strategy can finish the story without softlocks', () => {
    let s = createInitialState();
    // helper: run an action expected to succeed
    const ok = (r) => { expect(r.ok, r.error).toBe(true); return r.state; };

    // LEVEL 1
    s = ok(buyStock(s, 'biscuit', 10, id()));
    s = serveCurrent(s);
    s = ok(completeLevel(s, id()));
    expect(s.storyLevel).toBe(2);

    // LEVEL 2: sayed quest + serve to 5 + rep 55 (fair prices +2 each)
    s = ok(buyStock(s, 'tea', 2, id()));
    s = ok(startQuest(s, 'q_sayed_favor', id()));
    s = ok(deliverQuest(s, 'q_sayed_favor', id()));
    while (s.stats.customersServed < 5) s = serveCurrent(s);
    expect(s.reputation).toBeGreaterThanOrEqual(55);
    s = ok(completeLevel(s, id()));
    expect(s.storyLevel).toBe(3);

    // LEVEL 3: ragab quest (buy 15 chips) + 40 purchased total
    s = ok(startQuest(s, 'q_ragab_supply', id()));
    s = ok(buyStock(s, 'chips', 15, id()));
    if (s.stats.totalPurchasedUnits < 40) s = ok(buyStock(s, 'biscuit', 40 - s.stats.totalPurchasedUnits, id()));
    // quest might need claiming? objective counts completion, not claim
    s = ok(claimQuestReward(s, 'q_ragab_supply', id()));
    s = ok(completeLevel(s, id()));
    expect(s.storyLevel).toBe(4);

    // LEVEL 4: Hassan quest (3 fair serves), 12 serves, rep 60, profit 100
    s = ok(startQuest(s, 'q_hassan_challenge', id()));
    let guard = 0;
    while ((s.stats.customersServed < 12 || !canCompleteLevel(s)) && guard++ < 60) {
      if (canCompleteLevel(s)) break;
      s = serveCurrent(s);
      if (s.quests.completed.includes('q_hassan_challenge') && !s.quests.claimed.includes('q_hassan_challenge')) {
        s = ok(claimQuestReward(s, 'q_hassan_challenge', id()));
      }
    }
    expect(canCompleteLevel(s)).toBe(true);
    s = ok(completeLevel(s, id()));
    expect(s.storyLevel).toBe(5);

    // LEVEL 5: 2 upgrades, 20 serves, rep 70, final quest
    if (!s.upgrades.includes('sign') && s.cash >= 200) s = ok(buyUpgrade(s, 'sign', id()));
    // stock up for final feast + serving
    s = ok(startQuest(s, 'q_final_hara', id()));
    s = ok(buyStock(s, 'tea', 2, id()));
    s = ok(buyStock(s, 'sugar', 1, id()));
    s = ok(buyStock(s, 'oil', 1, id()));
    while ((s.inventory.biscuit ?? 0) < 3) s = ok(buyStock(s, 'biscuit', 3, id()));
    s = ok(deliverQuest(s, 'q_final_hara', id()));
    guard = 0;
    while (!canCompleteLevel(s) && guard++ < 80) {
      if (s.upgrades.length < 2 && s.cash >= 200) {
        const next = ['sign', 'shelves', 'fridge'].find((u) => !s.upgrades.includes(u));
        const r = buyUpgrade(s, next, id());
        if (r.ok) { s = r.state; continue; }
      }
      s = serveCurrent(s);
    }
    expect(canCompleteLevel(s)).toBe(true);
    s = ok(completeLevel(s, id()));
    expect(s.endlessUnlocked).toBe(true);
    expect(s.titleEarned).toBe(true);
    expect(s.cash).toBeGreaterThanOrEqual(0);
  }, 20000);
});

describe('10-11. save / load', () => {
  it('round-trips the complete state through an adapter', () => {
    const adapter = new MemoryAdapter();
    const sm = new SaveManager(adapter);
    let s = createInitialState();
    s = buyStock(s, 'tea', 3, id()).state;
    s = serveCurrent(s);
    expect(sm.save(s).ok).toBe(true);
    const loaded = sm.load();
    expect(loaded.ok).toBe(true);
    expect(loaded.state.cash).toBe(s.cash);
    expect(loaded.state.inventory).toEqual(s.inventory);
    expect(loaded.state.prices).toEqual(s.prices);
    expect(loaded.state.stats.customersServed).toBe(s.stats.customersServed);
    expect(loaded.state.currentOrder.id).toBe(s.currentOrder.id);
  });

  it('missing save reports missing (no crash, no fake state)', () => {
    const sm = new SaveManager(new MemoryAdapter());
    const res = sm.load();
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('missing');
  });

  it('corrupted JSON is reported, backed up, and NOT overwritten silently', () => {
    const adapter = new MemoryAdapter();
    adapter.set(SAVE_KEY, '{this is not json!!!');
    const sm = new SaveManager(adapter);
    const res = sm.load();
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('corrupted');
    expect(adapter.get(SAVE_KEY)).toBe('{this is not json!!!'); // untouched
    expect(adapter.get('el-moallem-save-backup')).toBe('{this is not json!!!');
  });

  it('structurally invalid save is treated as corrupted', () => {
    const adapter = new MemoryAdapter();
    adapter.set(SAVE_KEY, JSON.stringify({ version: 1, state: { cash: -50, inventory: 'oops' } }));
    const res = new SaveManager(adapter).load();
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('corrupted');
  });

  it('legacy v0 unwrapped state migrates to schema v1 with defaults', () => {
    const adapter = new MemoryAdapter();
    const legacy = createInitialState();
    delete legacy.endless;
    delete legacy.seenLevelIntros;
    legacy.cash = 777;
    adapter.set(SAVE_KEY, JSON.stringify(legacy));
    const res = new SaveManager(adapter).load();
    expect(res.ok).toBe(true);
    expect(res.state.cash).toBe(777);
    expect(res.state.endless).toBeTruthy();
    expect(res.migratedFrom).toBe(0);
  });

  it('clear() enables a confirmed fresh start', () => {
    const adapter = new MemoryAdapter();
    const sm = new SaveManager(adapter);
    sm.save(createInitialState());
    expect(sm.hasSave()).toBe(true);
    sm.clear();
    expect(sm.hasSave()).toBe(false);
    expect(sm.load().reason).toBe('missing');
  });
});
