import { PRODUCTS, getProduct, isProductUnlocked, priceBounds } from '../../data/products.js';
import { getUpgrade, capacityFor } from '../../data/upgrades.js';
import { beginTransaction, fail, succeed } from '../state/transactions.js';
import { totalUnits, clampReputation } from '../state/createState.js';
import { applyQuestEvent } from '../quests/questEngine.js';
import { generateOrder, orderShortages } from '../neighborhood/customers.js';

export const PACKAGING_COST_PER_ORDER = 1; // recorded operating expense

export function storageCapacity(state) { return capacityFor(state.upgrades); }
export function freeCapacity(state) { return storageCapacity(state) - totalUnits(state); }

/** Wholesale cost right now (supplier deal can shave 1 EGP off one product). */
export function effectiveCost(state, productId) {
  const p = getProduct(productId);
  if (!p) return null;
  const dealOff = state.deal?.productId === productId ? (state.deal.discount ?? 0) : 0;
  return Math.max(1, p.cost - dealOff);
}

export function grossMarginPerUnit(state, productId) {
  const p = getProduct(productId);
  if (!p) return 0;
  return (state.prices[productId] ?? p.defaultPrice) - p.cost;
}

/** Net operating profit = revenue + quest income − COGS − operating expenses.
 *  Upgrade spending is capital investment and is reported separately. */
export function netProfit(state) {
  const s = state.stats;
  return s.revenue + s.questIncome + (s.cafeHelpEarned ?? 0) - s.cogs - s.operatingExpenses;
}

export function potentialOrderRevenue(state, order) {
  return Object.entries(order.items).reduce((sum, [id, qty]) => sum + (state.prices[id] ?? 0) * qty, 0);
}

function fairValue(order) {
  return Object.entries(order.items).reduce((sum, [id, qty]) => sum + (getProduct(id)?.defaultPrice ?? 0) * qty, 0);
}

/** Satisfaction from price ratio vs fair price. Storefront softens penalties. */
export function satisfactionFor(state, order) {
  const fair = fairValue(order) || 1;
  const ratio = potentialOrderRevenue(state, order) / fair;
  const cushioned = state.upgrades.includes('storefront');
  const signBonus = state.upgrades.includes('sign') ? 1 : 0;
  if (ratio <= 1.0) return { ratio, mood: 'happy', repDelta: 2 + signBonus, fair: true };
  if (ratio <= 1.1) return { ratio, mood: 'happy', repDelta: 1 + signBonus, fair: true };
  if (ratio <= 1.25) return { ratio, mood: 'neutral', repDelta: 0, fair: false };
  if (ratio <= 1.5) return { ratio, mood: 'unhappy', repDelta: cushioned ? -1 : -2, fair: false };
  return { ratio, mood: 'unhappy', repDelta: cushioned ? -2 : -5, fair: false };
}

export function lowStockWarnings(state) {
  const wanted = new Set(Object.keys(state.currentOrder?.items ?? {}));
  return PRODUCTS.filter((p) => isProductUnlocked(p, state.upgrades))
    .map((p) => ({ product: p, qty: state.inventory[p.id] ?? 0, urgent: wanted.has(p.id) }))
    .filter((x) => x.qty <= 2)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.qty - b.qty);
}

/** Buy wholesale stock. Fully validated before any mutation (on a clone). */
export function buyStock(state, productId, qty, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const product = getProduct(productId);
  if (!product) return fail(state, 'المنتج ده مش موجود عند الجملة.');
  if (!Number.isInteger(qty) || qty <= 0) return fail(state, 'اختار كمية صحيحة أكبر من صفر.');
  if (!isProductUnlocked(product, next.upgrades)) {
    return fail(state, `«${product.nameAr}» محتاج ثلاجة في المحل! اشتري الثلاجة من شاشة التطوير الأول.`);
  }
  if (qty > freeCapacity(next)) {
    return fail(state, `المخزن مش هيكفي! عندك ${freeCapacity(next)} مكان فاضي بس. طوّر الرفوف أو المخزن.`);
  }
  const unit = effectiveCost(next, productId);
  const total = unit * qty;
  if (total > next.cash) {
    return fail(state, `فلوسك مش مكفية! محتاج ${total} جنيه وعندك ${next.cash} بس. خفّف الكمية أو بِع حاجة الأول.`);
  }
  next.cash -= total;
  next.inventory[productId] = (next.inventory[productId] ?? 0) + qty;
  next.stats.totalPurchasedUnits += qty;
  next.stats.totalPurchaseCost += total;
  next.stats.purchasedByProduct[productId] = (next.stats.purchasedByProduct[productId] ?? 0) + qty;
  const completed = applyQuestEvent(next, { type: 'buy', productId, qty });
  return succeed(next, `اشتريت ${qty} × ${product.nameAr} بـ${total} جنيه من عم رجب.`, { questsCompleted: completed });
}

/** Set a retail price within sane bounds. Not an idempotent transaction:
 *  it changes no assets, so double-applying is harmless. */
export function setPrice(state, productId, price) {
  const product = getProduct(productId);
  if (!product) return fail(state, 'المنتج ده مش موجود.');
  if (!Number.isFinite(price) || price <= 0) return fail(state, 'السعر لازم يكون رقم أكبر من صفر.');
  const { min, max } = priceBounds(product);
  const clamped = Math.max(min, Math.min(max, Math.round(price)));
  const next = structuredClone(state);
  next.prices[productId] = clamped;
  const hint = clamped > product.defaultPrice * 1.3
    ? ' خلي بالك: ده أعلى من السعر العادل بكتير، الزباين هتتزمر والسمعة هتقل!'
    : clamped <= product.cost ? ' تنبيه: السعر ده أقل أو يساوي تمن الجملة… هتخسر في كل بيعة!' : '';
  return succeed(next, `سعر «${product.nameAr}» بقى ${clamped} جنيه.${hint}`);
}

/** Serve the waiting customer. Atomic: stock & cash & stats move together. */
export function serveOrder(state, actionId, rng = Math.random) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const order = next.currentOrder;
  if (!order) return fail(state, 'مفيش زبون مستني دلوقتي.');

  const shortages = orderShortages(next, order);
  if (shortages.length) {
    const names = shortages.map((s) => getProduct(s.productId)?.nameAr).join('، ');
    return fail(state, `معندكش كفاية من: ${names}. روح اشتري من عم رجب ورجع اخدمه — الزبون مستني، من غير استعجال!`);
  }

  const revenue = potentialOrderRevenue(next, order);
  const sat = satisfactionFor(next, order);
  let cogs = 0;
  for (const [pid, qty] of Object.entries(order.items)) {
    next.inventory[pid] -= qty;
    cogs += (getProduct(pid)?.cost ?? 0) * qty;
    next.stats.soldByProduct[pid] = (next.stats.soldByProduct[pid] ?? 0) + qty;
  }
  next.cash += revenue - PACKAGING_COST_PER_ORDER;
  next.stats.revenue += revenue;
  next.stats.cogs += cogs;
  next.stats.operatingExpenses += PACKAGING_COST_PER_ORDER;
  next.stats.customersServed += 1;
  if (sat.fair) next.stats.fairServes += 1;
  next.reputation = clampReputation(next.reputation + sat.repDelta);

  const completed = applyQuestEvent(next, { type: 'serve', fair: sat.fair });

  // Rotate the supplier deal every couple of orders and bring the next customer.
  next.orderCounter += 1;
  if (next.orderCounter % 2 === 0) {
    const idx = Math.floor(next.orderCounter / 2) % PRODUCTS.length;
    next.deal = { productId: PRODUCTS[idx].id, discount: 1 };
  }
  const servedOrder = order;
  next.currentOrder = generateOrder(next, rng);

  return succeed(next, `خدمت الزبون وقبضت ${revenue} جنيه (منها ١ جنيه مصاريف أكياس).`, {
    servedOrder, revenue, cogs, satisfaction: sat, questsCompleted: completed,
  });
}

/** Politely turn away the waiting customer (small, bounded reputation cost). */
export function skipOrder(state, actionId, rng = Math.random) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const skipped = next.currentOrder;
  next.reputation = clampReputation(next.reputation - 1);
  next.orderCounter += 1;
  next.currentOrder = generateOrder(next, rng);
  return succeed(next, 'اعتذرت للزبون بذوق وإجه اللي بعده. (السمعة −١)', { skippedOrder: skipped });
}

/** Buy a shop upgrade. One-time, persisted, never allowed beyond available cash. */
export function buyUpgrade(state, upgradeId, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const up = getUpgrade(upgradeId);
  if (!up) return fail(state, 'التطوير ده مش موجود.');
  if (next.upgrades.includes(upgradeId)) return fail(state, `«${up.nameAr}» مركّبة عندك أصلاً! مش محتاج تشتريها مرتين.`);
  if (up.price > next.cash) return fail(state, `محتاج ${up.price} جنيه وعندك ${next.cash}. كمّل بيع ومهام وارجع لها.`);
  next.cash -= up.price;
  next.upgrades.push(upgradeId);
  next.stats.upgradeSpend += up.price;
  if (up.reputationBonus) next.reputation = clampReputation(next.reputation + up.reputationBonus);
  return succeed(next, `ركّبت «${up.nameAr}»! ${up.effectAr}`, { upgrade: up });
}

export const CAFE_HELP_REWARD = 30;
export const CAFE_HELP_CASH_LIMIT = 120;
export const CAFE_HELP_SERVES_GAP = 2;

/** Soft-lock safety: help at the café for 30 EGP when cash is truly low.
 *  Rate-limited so it can never become an infinite-money exploit. */
export function cafeHelp(state, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  if (next.cash >= CAFE_HELP_CASH_LIMIT) {
    return fail(state, `محفظتك عامرة يا معلّم! شغلانة القهوة دي للي فلوسه تحت ${CAFE_HELP_CASH_LIMIT} جنيه بس، عشان محدش يعتمد عليها بدل ما يبيع.`);
  }
  const since = next.stats.customersServed - (next.cafeHelp.lastServedCount ?? -100);
  if (since < CAFE_HELP_SERVES_GAP) {
    return fail(state, `اشتغلت في القهوة من قريّب! اخدم ${CAFE_HELP_SERVES_GAP - since} زبون في محلك الأول وبعدين ارجع لصاحب القهوة.`);
  }
  next.cash += CAFE_HELP_REWARD;
  next.stats.cafeHelpEarned = (next.stats.cafeHelpEarned ?? 0) + CAFE_HELP_REWARD;
  next.cafeHelp = { lastServedCount: next.stats.customersServed, times: (next.cafeHelp.times ?? 0) + 1 };
  return succeed(next, `ساعدت صاحب القهوة ساعة زحمة وخدت ${CAFE_HELP_REWARD} جنيه. كفاية واحدة ترجعك للسكة!`);
}
