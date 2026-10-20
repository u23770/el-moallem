import { describe, it, expect } from 'vitest';
import { createInitialState, STARTING_CASH } from '../src/game/state/createState.js';
import {
  buyStock, serveOrder, setPrice, buyUpgrade, grossMarginPerUnit,
  netProfit, effectiveCost, satisfactionFor, cafeHelp,
} from '../src/game/economy/economy.js';
import { getProduct } from '../src/data/products.js';

let n = 0;
const id = () => `test-${++n}`;
const seqRng = (vals) => { let i = 0; return () => vals[i++ % vals.length]; };

describe('1. starting state', () => {
  it('starts with 500 EGP, reputation 50, level 1, starter stock', () => {
    const s = createInitialState();
    expect(s.cash).toBe(500);
    expect(STARTING_CASH).toBe(500);
    expect(s.reputation).toBe(50);
    expect(s.storyLevel).toBe(1);
    expect(s.endlessUnlocked).toBe(false);
    expect(s.inventory.chips).toBe(5);
    expect(s.prices.chips).toBe(7);
    expect(getProduct('chips').cost).toBe(5);
  });
});

describe('2. buying inventory', () => {
  it('buys with sufficient funds: cash down, stock up, atomically', () => {
    const s = createInitialState();
    const res = buyStock(s, 'chips', 10, id());
    expect(res.ok).toBe(true);
    // chips has the starting deal (-1) so unit = 4
    expect(res.state.cash).toBe(500 - 10 * 4);
    expect(res.state.inventory.chips).toBe(15);
    expect(res.state.stats.totalPurchasedUnits).toBe(10);
    // original object untouched (no partial mutation)
    expect(s.cash).toBe(500);
    expect(s.inventory.chips).toBe(5);
  });

  it('rejects purchase beyond cash and changes nothing', () => {
    const s = createInitialState();
    s.cash = 20;
    const res = buyStock(s, 'oil', 1, id()); // oil costs 35
    expect(res.ok).toBe(false);
    expect(res.state.cash).toBe(20);
    expect(res.state.inventory.oil).toBe(0);
  });

  it('rejects purchase beyond storage capacity', () => {
    const s = createInitialState();
    const res = buyStock(s, 'biscuit', 100, id()); // capacity 60, already 10 units
    expect(res.ok).toBe(false);
    expect(res.state.cash).toBe(500);
  });

  it('rejects cold products before the fridge upgrade', () => {
    const s = createInitialState();
    const res = buyStock(s, 'cola', 5, id());
    expect(res.ok).toBe(false);
    expect(res.state.inventory.cola).toBe(0);
  });

  it('allows cold products after the fridge upgrade', () => {
    let s = createInitialState();
    s = buyUpgrade(s, 'fridge', id()).state;
    const res = buyStock(s, 'cola', 3, id());
    expect(res.ok).toBe(true);
    expect(res.state.inventory.cola).toBe(3);
  });
});

describe('3-4. serving customers / oversell protection', () => {
  it('serves first order: inventory down, cash up by revenue minus 1 packaging', () => {
    const s = createInitialState(); // order: 2 chips + 1 biscuit = 14 + 6 = 20
    const res = serveOrder(s, id(), seqRng([0.1, 0.2, 0.3]));
    expect(res.ok).toBe(true);
    expect(res.revenue).toBe(20);
    expect(res.state.cash).toBe(500 + 20 - 1);
    expect(res.state.inventory.chips).toBe(3);
    expect(res.state.inventory.biscuit).toBe(4);
    expect(res.state.stats.customersServed).toBe(1);
    expect(res.state.currentOrder).toBeTruthy();
  });

  it('rejects serving unavailable quantities without touching state', () => {
    const s = createInitialState();
    s.inventory.chips = 1; // order needs 2
    const before = JSON.stringify(s);
    const res = serveOrder(s, id(), seqRng([0.1]));
    expect(res.ok).toBe(false);
    expect(JSON.stringify(res.state)).toBe(before);
  });
});

describe('5. margins and net profit', () => {
  it('gross margin = selling price - purchase cost', () => {
    const s = createInitialState();
    expect(grossMarginPerUnit(s, 'chips')).toBe(7 - 5);
    const raised = setPrice(s, 'chips', 9).state;
    expect(grossMarginPerUnit(raised, 'chips')).toBe(4);
  });

  it('net profit = revenue + quest income - COGS - operating expenses', () => {
    let s = createInitialState();
    const res = serveOrder(s, id(), seqRng([0.1, 0.2, 0.3]));
    s = res.state;
    // revenue 20, COGS = 2*5 + 1*4 = 14, packaging 1
    expect(netProfit(s)).toBe(20 - 14 - 1);
    s.stats.questIncome += 40;
    expect(netProfit(s)).toBe(45);
  });

  it('price setting is clamped to sane bounds (min 1, max 3x cost)', () => {
    const s = createInitialState();
    expect(setPrice(s, 'chips', 0).ok).toBe(false);
    expect(setPrice(s, 'chips', 999).state.prices.chips).toBe(15); // 3 * 5
  });

  it('overpricing hurts satisfaction, fair pricing helps reputation', () => {
    let s = createInitialState();
    // fair: default prices -> happy, +2
    expect(satisfactionFor(s, s.currentOrder).mood).toBe('happy');
    s = setPrice(s, 'chips', 15).state;
    s = setPrice(s, 'biscuit', 12).state;
    const sat = satisfactionFor(s, s.currentOrder);
    expect(sat.mood).toBe('unhappy');
    expect(sat.repDelta).toBeLessThan(0);
  });

  it('supplier deal shaves 1 EGP off one product only', () => {
    const s = createInitialState();
    expect(s.deal.productId).toBe('chips');
    expect(effectiveCost(s, 'chips')).toBe(4);
    expect(effectiveCost(s, 'biscuit')).toBe(4);
    expect(effectiveCost(s, 'tea')).toBe(15);
  });
});

describe('6. duplicate action protection', () => {
  it('same actionId cannot execute twice', () => {
    const s = createInitialState();
    const first = buyStock(s, 'chips', 5, 'fixed-id');
    expect(first.ok).toBe(true);
    const second = buyStock(first.state, 'chips', 5, 'fixed-id');
    expect(second.ok).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.state.inventory.chips).toBe(first.state.inventory.chips);
  });

  it('serve cannot double-process with the same id', () => {
    const s = createInitialState();
    const first = serveOrder(s, 'serve-id', seqRng([0.1, 0.2, 0.3]));
    const cashAfter = first.state.cash;
    const second = serveOrder(first.state, 'serve-id', seqRng([0.1]));
    expect(second.ok).toBe(false);
    expect(second.state.cash).toBe(cashAfter);
  });
});

describe('7. upgrades affordability & effects', () => {
  it('first upgrade example costs 300 (shelves) and adds capacity', () => {
    let s = createInitialState();
    const res = buyUpgrade(s, 'shelves', id());
    expect(res.ok).toBe(true);
    expect(res.state.cash).toBe(200);
    expect(res.state.upgrades).toContain('shelves');
  });

  it('cannot buy an unaffordable upgrade or buy twice', () => {
    let s = createInitialState();
    s.cash = 100;
    expect(buyUpgrade(s, 'storefront', id()).ok).toBe(false);
    s.cash = 900;
    const once = buyUpgrade(s, 'sign', id());
    expect(once.ok).toBe(true);
    expect(once.state.reputation).toBe(55); // +5 sign bonus
    expect(buyUpgrade(once.state, 'sign', id()).ok).toBe(false);
  });

  it('cash and inventory never go negative', () => {
    let s = createInitialState();
    s = buyStock(s, 'oil', 10, id()).state; // 350
    s = buyUpgrade(s, 'sign', id()).state ?? s; // may fail (150 left < 200) -> state returned unchanged
    expect(s.cash).toBeGreaterThanOrEqual(0);
    for (const qty of Object.values(s.inventory)) expect(qty).toBeGreaterThanOrEqual(0);
  });
});

describe('cafe help (soft-lock prevention)', () => {
  it('pays 30 only when cash is low and is rate-limited', () => {
    let s = createInitialState();
    expect(cafeHelp(s, id()).ok).toBe(false); // cash 500 not low
    s.cash = 10;
    const r = cafeHelp(s, id());
    expect(r.ok).toBe(true);
    expect(r.state.cash).toBe(40);
    // immediately again -> blocked until serving 2 customers (cash now 40, still low but rate-limited)
    expect(cafeHelp(r.state, id()).ok).toBe(false);
  });
});
