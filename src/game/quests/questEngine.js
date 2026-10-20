import { QUESTS, getQuest } from '../../data/quests.js';
import { PRODUCT_MAP } from '../../data/products.js';
import { beginTransaction, fail, succeed } from '../state/transactions.js';
import { clampReputation } from '../state/createState.js';
import { ensureEndlessQuests } from './endless.js';

export function findQuestDef(state, questId) {
  return getQuest(questId) ?? state.endless?.quests?.find((q) => q.id === questId) ?? null;
}

export function isQuestDone(state, questId) {
  if (state.quests.completed.includes(questId) || state.quests.claimed.includes(questId)) return true;
  const eq = state.endless?.quests?.find((q) => q.id === questId);
  return eq ? eq.status === 'completed' || eq.status === 'claimed' : false;
}

export function availableStoryQuests(state) {
  const level = state.endlessUnlocked ? 99 : state.storyLevel;
  return QUESTS.filter((q) =>
    q.minLevel <= level &&
    !state.quests.completed.includes(q.id) &&
    !state.quests.claimed.includes(q.id) &&
    !(q.id in state.quests.active));
}

export function activeQuestList(state) {
  const story = Object.entries(state.quests.active).map(([id, prog]) => ({
    def: getQuest(id), progress: prog.progress ?? 0,
  })).filter((x) => x.def);
  const endless = (state.endless?.quests ?? [])
    .filter((q) => q.status === 'active')
    .map((q) => ({ def: q, progress: q.progress ?? 0 }));
  return [...story, ...endless];
}

export function completedUnclaimed(state) {
  const story = state.quests.completed
    .filter((id) => !state.quests.claimed.includes(id))
    .map((id) => getQuest(id)).filter(Boolean);
  const endless = (state.endless?.quests ?? []).filter((q) => q.status === 'completed');
  return [...story, ...endless];
}

export function startQuest(state, questId, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const def = getQuest(questId);
  if (!def) return fail(state, 'المهمة دي مش موجودة.');
  const level = next.endlessUnlocked ? 99 : next.storyLevel;
  if (def.minLevel > level) return fail(state, `المهمة دي هتتفتح في المرحلة ${def.minLevel}. استنى شوية يا معلّم!`);
  if (questId in next.quests.active) return fail(state, 'المهمة دي بدأتها بالفعل، كمّلها يا بطل!');
  if (next.quests.completed.includes(questId) || next.quests.claimed.includes(questId)) {
    return fail(state, 'المهمة دي خلصتها قبل كده، ومكافأتها بتتقبض مرة واحدة بس.');
  }
  next.quests.active[questId] = { progress: 0 };
  return succeed(next, `بدأت مهمة: ${def.titleAr}. بالتوفيق يا معلّم!`, { quest: def });
}

function matchesEvent(def, event) {
  if (def.type === 'buyUnits' && event.type === 'buy') {
    return !def.productId || def.productId === event.productId ? event.qty : 0;
  }
  if (def.type === 'serveCount' && event.type === 'serve') return 1;
  if (def.type === 'fairServes' && event.type === 'serve' && event.fair) return 1;
  return 0;
}

/** Apply a gameplay event to quest progress. Mutates an already-cloned draft.
 *  Returns list of quest titles completed by this event. */
export function applyQuestEvent(draft, event) {
  const newlyCompleted = [];
  for (const [id, prog] of Object.entries(draft.quests.active)) {
    const def = getQuest(id);
    if (!def || def.type === 'deliver') continue;
    const add = matchesEvent(def, event);
    if (!add) continue;
    prog.progress = Math.min(def.target, (prog.progress ?? 0) + add);
    if (prog.progress >= def.target) {
      delete draft.quests.active[id];
      if (!draft.quests.completed.includes(id)) draft.quests.completed.push(id);
      newlyCompleted.push(def.titleAr);
    }
  }
  for (const q of draft.endless?.quests ?? []) {
    if (q.status !== 'active' || q.type === 'deliver') continue;
    const add = matchesEvent(q, event);
    if (!add) continue;
    q.progress = Math.min(q.target, (q.progress ?? 0) + add);
    if (q.progress >= q.target) { q.status = 'completed'; newlyCompleted.push(q.titleAr); }
  }
  return newlyCompleted;
}

function grantReward(next, def) {
  next.cash += def.rewardCash;
  next.stats.questIncome += def.rewardCash;
  next.reputation = clampReputation(next.reputation + (def.rewardRep ?? 0));
}

/** Claim the reward of a completed progress quest — exactly once. */
export function claimQuestReward(state, questId, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const def = findQuestDef(next, questId);
  if (!def) return fail(state, 'المهمة دي مش موجودة.');
  if (def.type === 'deliver') return fail(state, 'دي مهمة تسليم… سلّم الطلبية الأول من زرار «توصيل».');

  if (def.endless) {
    const q = next.endless.quests.find((x) => x.id === questId);
    if (!q || q.status === 'claimed') return fail(state, 'المكافأة دي اتقبضت قبل كده. مرة واحدة بس يا معلّم!');
    if (q.status !== 'completed') return fail(state, 'المهمة لسه مخلصتش… كمّل الهدف الأول.');
    grantReward(next, q);
    q.status = 'claimed';
    ensureEndlessQuests(next);
    return succeed(next, `قبضت مكافأة «${q.titleAr}»: ${q.rewardCash} جنيه (والسمعة زادت). برافو عليك!`);
  }

  if (next.quests.claimed.includes(questId)) return fail(state, 'المكافأة دي اتقبضت قبل كده. مرة واحدة بس يا معلّم!');
  if (!next.quests.completed.includes(questId)) return fail(state, 'المهمة لسه مخلصتش… كمّل الهدف الأول.');
  grantReward(next, def);
  next.quests.claimed.push(questId);
  return succeed(next, `قبضت مكافأة «${def.titleAr}»: ${def.rewardCash} جنيه (والسمعة زادت). برافو عليك!`);
}

/** Deliver items for a delivery quest: atomic stock deduction + one-time payment. */
export function deliverQuest(state, questId, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  const def = findQuestDef(next, questId);
  if (!def) return fail(state, 'المهمة دي مش موجودة.');
  if (def.type !== 'deliver') return fail(state, 'المهمة دي مش مهمة توصيل.');

  if (def.endless) {
    const q = next.endless.quests.find((x) => x.id === questId);
    if (!q || q.status === 'claimed') return fail(state, 'الطلبية دي اتسلمت واتقبضت قبل كده.');
    if (q.status !== 'active') return fail(state, 'الطلبية دي مش متاحة للتسليم دلوقتي.');
  } else {
    if (next.quests.claimed.includes(questId) || next.quests.completed.includes(questId)) {
      return fail(state, 'الطلبية دي اتسلمت قبل كده، والمكافأة مرة واحدة بس.');
    }
    if (!(questId in next.quests.active)) return fail(state, 'لازم تبدأ المهمة الأول قبل التسليم.');
  }

  // Validate ALL stock before touching anything (atomicity).
  for (const [pid, qty] of Object.entries(def.items ?? {})) {
    if ((next.inventory[pid] ?? 0) < qty) {
      return fail(state, `ناقصك ${PRODUCT_MAP[pid]?.nameAr ?? pid}! محتاج ${qty} وعندك ${next.inventory[pid] ?? 0}. اشتريه من عم رجب الأول.`);
    }
  }
  let cogs = 0;
  for (const [pid, qty] of Object.entries(def.items ?? {})) {
    next.inventory[pid] -= qty;
    cogs += (PRODUCT_MAP[pid]?.cost ?? 0) * qty;
    next.stats.soldByProduct[pid] = (next.stats.soldByProduct[pid] ?? 0) + qty;
  }
  next.stats.cogs += cogs;
  grantReward(next, def);

  if (def.endless) {
    const q = next.endless.quests.find((x) => x.id === questId);
    q.status = 'claimed';
    ensureEndlessQuests(next);
  } else {
    delete next.quests.active[questId];
    next.quests.completed.push(questId);
    next.quests.claimed.push(questId);
  }
  return succeed(next, `سلّمت «${def.titleAr}» وقبضت ${def.rewardCash} جنيه. تمام يا معلّم!`);
}
