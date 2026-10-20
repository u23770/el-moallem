import { unlockedProducts, PRODUCT_MAP } from '../../data/products.js';
import { CHARACTERS } from '../../data/characters.js';

// Bounded, template-driven endless quests. Deterministic per (seed, counter)
// so generation is reproducible and testable. Rewards are capped and delivery
// rewards always equal goods cost + a modest 20-40 EGP bonus (no money exploits).

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DELIVER_TITLES = ['طلبية جيران', 'عزومة صغيرة', 'سهرة القهوة', 'طلبات البيت', 'ضيوف على الغفلة'];
const SHOPPERS = CHARACTERS.filter((c) => c.id !== 'ragab');

export function createEndlessQuest(state, counterValue) {
  const rng = mulberry32((state.endless?.seed ?? 1) + counterValue * 9973);
  const products = unlockedProducts(state.upgrades);
  const giver = SHOPPERS[Math.floor(rng() * SHOPPERS.length) % SHOPPERS.length];
  const roll = rng();
  const base = {
    id: `endless_${counterValue}`,
    endless: true,
    giverId: giver.id,
    progress: 0,
    status: 'active',
    rewardRep: 1 + Math.floor(rng() * 3),
    dialogue: [{ speaker: giver.id, text: 'عندي ليك شغلانة صغيرة يا معلّم… الحارة بقى عنوانها محلك!' }],
  };

  if (roll < 0.4) {
    // Delivery quest: 1-2 products, 1-3 units each.
    const pool = [...products];
    const items = {};
    let costTotal = 0;
    const n = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < n && pool.length; i++) {
      const [p] = pool.splice(Math.floor(rng() * pool.length) % pool.length, 1);
      const qty = 1 + Math.floor(rng() * 3);
      items[p.id] = qty;
      costTotal += PRODUCT_MAP[p.id].cost * qty;
    }
    const bonus = 20 + Math.floor(rng() * 21); // 20..40
    const names = Object.entries(items).map(([id, q]) => `${q} × ${PRODUCT_MAP[id].nameAr}`).join(' و ');
    return {
      ...base, type: 'deliver', items, rewardCash: costTotal + bonus,
      titleAr: DELIVER_TITLES[counterValue % DELIVER_TITLES.length],
      descAr: `${giver.nameAr} طالب: ${names}. سلّم الطلبية وخد ${costTotal + bonus} جنيه (شامل ثمن البضاعة ومكافأة ${bonus} جنيه).`,
    };
  }
  if (roll < 0.65) {
    const target = 3 + Math.floor(rng() * 3); // 3..5
    const rewardCash = 30 + Math.floor(rng() * 21);
    return {
      ...base, type: 'serveCount', target, rewardCash, titleAr: 'زحمة المحل',
      descAr: `اخدم ${target} زباين في محلك، و${giver.nameAr} هيشجعك بـ${rewardCash} جنيه… الحارة نشيطة الأيام دي!`,
    };
  }
  if (roll < 0.85) {
    const target = 10 + Math.floor(rng() * 11); // 10..20
    const rewardCash = 25 + Math.floor(rng() * 16);
    return {
      ...base, type: 'buyUnits', productId: null, target, rewardCash,
      giverId: 'ragab', titleAr: 'ملو الرفوف',
      descAr: `عم رجب بيقول: اشتري ${target} وحدة بضاعة واملى رفوفك ولك منه ${rewardCash} جنيه عربون محبة.`,
    };
  }
  const target = 2 + Math.floor(rng() * 2); // 2..3
  const rewardCash = 30 + Math.floor(rng() * 16);
  return {
    ...base, type: 'fairServes', target, rewardCash, titleAr: 'السعر العادل بركة',
    descAr: `اخدم ${target} زباين بأسعار عادلة (قريبة من الطبيعي)، وهيوصلك ${rewardCash} جنيه شكر من أهل الحارة.`,
  };
}

/** Fill endless quest slots up to `count` active quests (mutates a draft state). */
export function ensureEndlessQuests(draft, count = 3) {
  if (!draft.endlessUnlocked) return draft;
  draft.endless.quests = draft.endless.quests.filter((q) => q.status !== 'claimed');
  while (draft.endless.quests.filter((q) => q.status === 'active' || q.status === 'completed').length < count) {
    draft.endless.counter += 1;
    draft.endless.quests.push(createEndlessQuest(draft, draft.endless.counter));
  }
  return draft;
}
