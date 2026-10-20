import { LEVELS, getLevel, MAX_STORY_LEVEL } from '../../data/levels.js';
import { beginTransaction, fail, succeed } from '../state/transactions.js';
import { clampReputation } from '../state/createState.js';
import { netProfit } from '../economy/economy.js';
import { isQuestDone } from '../quests/questEngine.js';
import { ensureEndlessQuests } from '../quests/endless.js';

export function getMetricValue(state, metric) {
  if (metric.startsWith('questDone:')) return isQuestDone(state, metric.slice('questDone:'.length)) ? 1 : 0;
  switch (metric) {
    case 'customersServed': return state.stats.customersServed;
    case 'totalPurchasedUnits': return state.stats.totalPurchasedUnits;
    case 'reputation': return state.reputation;
    case 'netProfit': return Math.max(0, Math.floor(netProfit(state)));
    case 'upgradesOwned': return state.upgrades.length;
    default: return 0;
  }
}

export function levelProgress(state, levelNum = state.storyLevel) {
  const level = getLevel(levelNum);
  if (!level) return null;
  return {
    level,
    objectives: level.objectives.map((o) => {
      const current = getMetricValue(state, o.metric);
      return { ...o, current: Math.min(current, o.target), rawCurrent: current, done: current >= o.target };
    }),
  };
}

export function canCompleteLevel(state) {
  if (state.endlessUnlocked || state.storyLevel > MAX_STORY_LEVEL) return false;
  const prog = levelProgress(state);
  return !!prog && prog.objectives.every((o) => o.done);
}

export function overallStoryProgress(state) {
  if (state.endlessUnlocked) return { percent: 100, label: 'وضع اللعب الحر — معلّم الحارة' };
  const fractionWithin = (() => {
    const prog = levelProgress(state);
    if (!prog) return 0;
    return prog.objectives.reduce((a, o) => a + o.current / o.target, 0) / prog.objectives.length;
  })();
  const percent = Math.round(((state.storyLevel - 1 + fractionWithin) / MAX_STORY_LEVEL) * 100);
  return { percent, label: `المرحلة ${state.storyLevel} من ${MAX_STORY_LEVEL} — ${getLevel(state.storyLevel)?.titleAr ?? ''}` };
}

/** Complete the current story level exactly once, only if every objective is met. */
export function completeLevel(state, actionId) {
  const tx = beginTransaction(state, actionId);
  if (!tx.ok) return fail(state, tx.error, { duplicate: tx.duplicate });
  const next = tx.next;
  if (next.endlessUnlocked) return fail(state, 'خلّصت القصة الأساسية يا معلّم، ودلوقتي اللعب الحر مفتوح!');
  const level = getLevel(next.storyLevel);
  if (!level) return fail(state, 'مفيش مرحلة حالية.');
  if (!canCompleteLevel(next)) {
    const prog = levelProgress(next);
    const missing = prog.objectives.filter((o) => !o.done).map((o) => o.textAr).join('؛ ');
    return fail(state, `لسه ما أكملتش أهداف المرحلة: ${missing}. ما ينفعش نعدّي أهداف مطلوبة!`);
  }
  if (next.claimedLevelRewards.includes(level.level)) {
    return fail(state, 'مكافأة المرحلة دي اتقبضت قبل كده.');
  }
  next.cash += level.rewardCash;
  next.stats.questIncome += level.rewardCash;
  next.reputation = clampReputation(next.reputation + level.rewardRep);
  next.claimedLevelRewards.push(level.level);

  if (level.level >= MAX_STORY_LEVEL) {
    next.storyLevel = MAX_STORY_LEVEL + 1;
    next.endlessUnlocked = true;
    next.titleEarned = true;
    ensureEndlessQuests(next, 3);
    return succeed(next, `مبروك يا «معلّم الحارة»! قبضت ${level.rewardCash} جنيه، واتفتح لك اللعب الحر بمهام متجددة. الحارة كلها فخورة بيك!`, { finishedStory: true, level });
  }
  next.storyLevel += 1;
  return succeed(next, `كملت مرحلة «${level.titleAr}» وقبضت ${level.rewardCash} جنيه! المرحلة اللي جاية: ${getLevel(next.storyLevel)?.titleAr}.`, { level, nextLevel: getLevel(next.storyLevel) });
}

export { LEVELS };
