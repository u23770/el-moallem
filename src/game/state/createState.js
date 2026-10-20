import { PRODUCTS } from '../../data/products.js';

export const STARTING_CASH = 500;
export const STARTING_REPUTATION = 50;

export function createInitialState() {
  const inventory = {};
  const prices = {};
  for (const p of PRODUCTS) {
    inventory[p.id] = 0;
    prices[p.id] = p.defaultPrice;
  }
  // A little starter stock so the very first customer can be served immediately.
  inventory.chips = 5;
  inventory.biscuit = 5;

  return {
    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    storyLevel: 1,
    endlessUnlocked: false,
    titleEarned: false,
    inventory,
    prices,
    upgrades: [],
    stats: {
      revenue: 0,          // money from serving customers
      questIncome: 0,      // money from quest rewards / deliveries
      cogs: 0,             // cost of goods sold (on serve/deliver)
      operatingExpenses: 0,// packaging 1 EGP per served order
      upgradeSpend: 0,     // capital investment, tracked separately from operating profit
      totalPurchasedUnits: 0,
      totalPurchaseCost: 0,
      customersServed: 0,
      fairServes: 0,
      cafeHelpEarned: 0,
      soldByProduct: {},
      purchasedByProduct: {},
    },
    quests: { active: {}, completed: [], claimed: [] },
    currentOrder: {
      id: 1, characterId: 'sayed', items: { chips: 2, biscuit: 1 },
      greeting: 'صباح الفل يا معلّم! أنا عم سيد جارك… عايز ٢ شيبس وواحد بسكويت للعيال، وقولّي الحساب كام؟',
    },
    orderCounter: 1,
    // Supplier deal rotates as orders are served; discount is 1 EGP off one product.
    deal: { productId: 'chips', discount: 1 },
    claimedLevelRewards: [],
    seenLevelIntros: [],
    cafeHelp: { lastServedCount: -100, times: 0 },
    endless: { seed: 20261020, counter: 0, quests: [] },
    processedActions: [],
    settings: { sound: false, reduceMotion: false },
    createdAt: '2026-10-20T00:00:00.000Z',
  };
}

export function totalUnits(state) {
  return Object.values(state.inventory).reduce((a, b) => a + b, 0);
}

export function clampReputation(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}
