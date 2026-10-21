import { PRODUCTS, getProduct, isProductUnlocked } from './data/products.js';
import { CHARACTERS, getCharacter, pickLine } from './data/characters.js';
import { UPGRADES, getUpgrade } from './data/upgrades.js';
import { getLevel, MAX_STORY_LEVEL } from './data/levels.js';
import { createInitialState, totalUnits } from './game/state/createState.js';
import { newActionId } from './game/state/transactions.js';
import {
  buyStock, setPrice, serveOrder, skipOrder, buyUpgrade, cafeHelp,
  effectiveCost, grossMarginPerUnit, netProfit, storageCapacity,
  satisfactionFor, lowStockWarnings, potentialOrderRevenue,
  CAFE_HELP_REWARD, CAFE_HELP_CASH_LIMIT,
} from './game/economy/economy.js';
import {
  availableStoryQuests, activeQuestList, completedUnclaimed,
  startQuest, claimQuestReward, deliverQuest, findQuestDef, isQuestDone,
} from './game/quests/questEngine.js';
import { levelProgress, canCompleteLevel, completeLevel, overallStoryProgress } from './game/story/story.js';
import { orderShortages } from './game/neighborhood/customers.js';
import { createBrowserSaveManager, SCHEMA_VERSION } from './game/save/saveAdapter.js';
import { manualSaveResultMessage } from './game/save/saveFeedback.js';
import { LANDMARKS, PLAYER_START, movePlayer, nearestLandmark } from './game/neighborhood/exploration.js';
import { productSprite, shopSceneSvg, alleySceneSvg } from './ui/sprites.js';
import { characterSprite } from './ui/illustrated-sprites.js';

const fmt = (n) => {
  const v = Number(n);
  if (v < 0) return `<span class="bidi-num" dir="ltr">-${Math.abs(v).toLocaleString('ar-EG')}</span>`;
  return `<span class="bidi-num">${v.toLocaleString('ar-EG')}</span>`;
};
/** Convert any western digit runs in plain Arabic strings to Arabic-Indic digits for consistency. */
const arDigits = (s) => String(s ?? '').replace(/\d+/g, (m) => Number(m).toLocaleString('ar-EG'));
const egp = (n) => `${fmt(n)} جنيه`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let state;
let saveManager;
let view = 'shop';
let dialogue = null; // {lines, idx, choices?, onDone?}
let modal = null;    // 'settings' | 'reset' | 'help' | 'corrupt'
let selectedLocation = null;
let playerPosition = { ...PLAYER_START };
let toasts = [];
let toastTimer = null;
let busy = false; // rapid-tap guard in the UI layer (logic layer also guards by actionId)
let audioCtx = null;

const NAV = [
  { id: 'shop', labelAr: 'المحل', icon: '🧺' },
  { id: 'inventory', labelAr: 'البضاعة', icon: '📦' },
  { id: 'map', labelAr: 'الحارة', icon: '🏘️' },
  { id: 'quests', labelAr: 'المهام', icon: '📜' },
  { id: 'upgrades', labelAr: 'التطوير', icon: '🔨' },
  { id: 'stats', labelAr: 'الحسابات', icon: '📊' },
];

function beep(freq = 660, dur = 0.09) {
  if (!state?.settings?.sound) return;
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.05, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch { /* audio is optional decoration */ }
}

function toast(message, type = 'ok') {
  toasts.push({ id: Date.now() + Math.random(), message, type });
  if (toasts.length > 3) toasts = toasts.slice(-3);
  renderToasts();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toasts = []; renderToasts(); }, 4200);
}

function renderToasts() {
  const el = document.querySelector('.toast-stack');
  if (el) el.innerHTML = toasts.map((t) => `<div class="toast ${t.type === 'error' ? 'error' : 'coin'}" role="status">${esc(arDigits(t.message))}</div>`).join('');
}

function persist() {
  const res = saveManager.save(state);
  if (!res.ok) toast('خد بالك: الحفظ التلقائي فشل (تخزين المتصفح ممتلئ أو مقفول).', 'error');
  return res;
}

/** Apply a game-logic result: swap state, autosave, re-render, feedback. */
function commit(result, { silent = false } = {}) {
  if (!result.ok) { toast(result.error, 'error'); beep(180, 0.12); return false; }
  state = result.state;
  persist();
  render();
  if (!silent && result.message) { toast(result.message); beep(720); }
  for (const title of result.questsCompleted ?? []) {
    setTimeout(() => toast(`🎉 كملت هدف مهمة «${title}»! روح شاشة المهام واقبض المكافأة.`), 350);
  }
  return true;
}

function guarded(fn) {
  if (busy) return;
  busy = true;
  try { fn(); } finally { setTimeout(() => { busy = false; }, 250); }
}

/* ---------------- Dialogue ---------------- */

function speakerInfo(id) {
  if (id === 'player') return { nameAr: 'انت (المعلّم)', sprite: 'player' };
  const c = getCharacter(id);
  return { nameAr: c.nameAr, sprite: c.sprite };
}

function openDialogue(lines, { choices = null, onDone = null } = {}) {
  dialogue = { lines, idx: 0, choices, onDone };
  render();
}

function closeDialogue() {
  const done = dialogue?.onDone;
  dialogue = null;
  render();
  if (done) done();
}

function maybeShowLevelIntro() {
  if (state.endlessUnlocked) return;
  const lvl = state.storyLevel;
  const def = getLevel(lvl);
  if (!def || state.seenLevelIntros.includes(lvl)) return;
  openDialogue(
    [{ speaker: 'player', text: `المرحلة ${lvl} — «${def.titleAr}»: ${def.descAr}` }, ...def.introDialogue],
    {
      onDone: () => {
        const next = structuredClone(state);
        if (!next.seenLevelIntros.includes(lvl)) next.seenLevelIntros.push(lvl);
        state = next; persist(); render();
      },
    },
  );
}

function reactionDialogue(characterId, moodOrKey, servedRevenue = null) {
  const c = getCharacter(characterId);
  let text;
  if (moodOrKey === 'happy') text = pickLine(c.happy);
  else if (moodOrKey === 'unhappy') text = pickLine(c.priceComplaint);
  else if (moodOrKey === 'noStock') text = pickLine(c.noStock);
  else text = pickLine(c.neutral);
  if (servedRevenue != null) text += ` (دفع ${Number(servedRevenue).toLocaleString('ar-EG')} جنيه)`;
  openDialogue([{ speaker: characterId, text }]);
}

/* ---------------- Rendering pieces ---------------- */

function stockBadge(qty) {
  const cls = qty === 0 ? 'zero' : qty <= 2 ? 'low' : '';
  return `<span class="qty-badge ${cls}" aria-label="المخزون ${qty}">المخزون: ${fmt(qty)}</span>`;
}

function hudHtml() {
  const warnings = lowStockWarnings(state);
  const urgent = warnings.filter((w) => w.urgent && w.qty < (state.currentOrder.items[w.product.id] ?? 0));
  const prog = overallStoryProgress(state);
  const claimable = completedUnclaimed(state).length;
  return `
  <header class="hud">
    <div class="hud-top">
      <span class="game-title">المعلّم</span>
      ${state.titleEarned ? '<span class="title-badge">🏆 معلّم الحارة</span>' : `<span class="title-badge">المرحلة ${fmt(state.storyLevel)}: ${esc(getLevel(state.storyLevel)?.titleAr ?? '')}</span>`}
      <span style="flex:1"></span>
      <button class="btn small-btn ghost" data-action="open-help" aria-label="ازاي تلعب؟ شرح اللعبة">؟ مساعدة</button>
      <button class="btn small-btn ghost" data-action="open-settings" aria-label="الإعدادات والحفظ">⚙️ إعدادات</button>
    </div>
    <div class="hud-stats" role="status" aria-label="حالة المحل">
      <span class="hud-chip">💰 الكاش: ${egp(state.cash)}</span>
      <span class="hud-chip">⭐ السمعة: <span class="rep-bar"><i style="width:${state.reputation}%"></i></span> ${fmt(state.reputation)}/١٠٠</span>
      <span class="hud-chip">📦 المخزون: ${fmt(totalUnits(state))}/${fmt(storageCapacity(state))}</span>
      ${claimable ? `<span class="hud-chip"><button data-action="goto" data-view="quests">🎁 عندك ${fmt(claimable)} مكافأة مستنية!</button></span>` : ''}
      ${urgent.length ? `<span class="hud-chip warn"><button data-action="goto" data-view="inventory">⚠️ ناقصك: ${urgent.map((u) => esc(u.product.nameAr)).join('، ')}</button></span>`
        : warnings.length ? `<span class="hud-chip warn"><button data-action="goto" data-view="inventory">⚠️ مخزون قليل: ${warnings.slice(0, 2).map((u) => esc(u.product.nameAr)).join('، ')}</button></span>` : ''}
    </div>
    <div class="level-progress">
      <span>${esc(arDigits(prog.label))}</span><span class="bidi-num">${fmt(prog.percent)}٪</span>
    </div>
    <div class="level-progress"><span class="track"><i style="width:${prog.percent}%"></i></span></div>
  </header>`;
}

function storyCardHtml() {
  if (state.endlessUnlocked) {
    return `<section class="card" aria-label="وضع اللعب الحر">
      <h2>🏆 معلّم الحارة — اللعب الحر</h2>
      <p>خلّصت القصة يا بطل! الحارة لسه عايزاك: مهام متجددة، زباين، عروض جملة، وتطويرات تكملها على مهلك. محلك وفلوسك وسمعتك محفوظين.</p>
      <div class="btn-row"><button class="btn primary" data-action="goto" data-view="quests">📜 شوف المهام المتجددة</button></div>
    </section>`;
  }
  const prog = levelProgress(state);
  const ready = canCompleteLevel(state);
  return `<section class="card" aria-label="تقدم المرحلة">
    <h2>🎯 المرحلة ${fmt(prog.level.level)} — ${esc(prog.level.titleAr)}</h2>
    <p class="small">${esc(prog.level.descAr)}</p>
    <ul class="obj-list">
      ${prog.objectives.map((o) => `
        <li><span class="${o.done ? 'obj-done' : 'obj-todo'}" aria-hidden="true">${o.done ? '✔' : '○'}</span>
        <span class="grow" style="flex:1">${esc(o.textAr)}</span>
        <span class="bidi-num">${fmt(o.current)}/${fmt(o.target)}</span></li>`).join('')}
    </ul>
    <p class="small muted">مكافأة إكمال المرحلة: <b>${egp(prog.level.rewardCash)}</b> و+${fmt(prog.level.rewardRep)} سمعة. الأهداف المطلوبة ما بتتخطاش.</p>
    ${ready
      ? `<button class="btn terra" data-action="complete-level" style="width:100%">🎉 أنا جاهز… أكمّل المرحلة وأخد المكافأة!</button>`
      : `<button class="btn" data-action="complete-level" style="width:100%" aria-describedby="lvl-hint">أكمل المرحلة</button>
         <p id="lvl-hint" class="small muted">زرار الإكمال شغال، وهيقول لك ناقصك إيه بالظبط لو لسه ما خلّصتش.</p>`}
  </section>`;
}

function shopViewHtml() {
  const order = state.currentOrder;
  const customer = getCharacter(order.characterId);
  const shortages = orderShortages(state, order);
  const total = potentialOrderRevenue(state, order);
  const sat = satisfactionFor(state, order);
  const unlocked = PRODUCTS.filter((p) => isProductUnlocked(p, state.upgrades));

  const moodHint = sat.mood === 'unhappy'
    ? `<p class="bad small">⚠️ إجمالي أسعارك أعلى من السعر العادل بكتير (×${fmt(Math.round(sat.ratio * 10) / 10)}). الزبون هيدفع بس هيتزمر وسمعتك هتنقص ${fmt(Math.abs(sat.repDelta))}! خفّض من شاشة البضاعة لو تحب.</p>`
    : sat.fair
      ? `<p class="good small">✔ أسعارك عادلة للطلب ده. الزبون هيخرج مبسوط وسمعتك هتزيد +${fmt(sat.repDelta)}.</p>`
      : `<p class="small muted">سعرك أعلى من العادل بحبة صغيرة. الزبون هيشتري عادي، من غير مكسب سمعة.</p>`;

  return `
  <div class="scene-wrap" role="img" aria-label="محل البقالة بتاعك في الحارة: رفوف، كاونتر، ${state.upgrades.includes('fridge') ? 'ثلاجة عرض' : 'كراتين بضاعة'}.">
    ${shopSceneSvg(state, unlocked)}
    <div class="scene-status" aria-label="حالة المحل">
      <span class="scene-status__live"><i aria-hidden="true"></i> فاتح دلوقتي</span>
      <span>📦 المخزون: ${fmt(totalUnits(state))} قطعة</span>
      ${state.upgrades.includes('fridge') ? '<span>❄️ ثلاجة العرض شغالة</span>' : ''}
    </div>
  </div>

  <section class="card" aria-label="الزبون الحالي">
    <div style="display:flex;gap:10px;align-items:flex-start">
      ${characterSprite(customer.sprite, 'sprite')}
      <div style="flex:1;min-width:0">
        <h2 style="margin:0">${esc(customer.nameAr)} <span class="small muted">— ${esc(customer.roleAr)}</span></h2>
        <div class="speech" style="margin-top:6px">${esc(order.greeting)}</div>
      </div>
    </div>
    <h3 style="margin-top:12px">🧾 الطلب</h3>
    <div class="order-items">
      ${Object.entries(order.items).map(([id, qty]) => {
        const p = getProduct(id); const have = state.inventory[id] ?? 0; const ok = have >= qty;
        return `<div class="order-line">${productSprite(p)}
          <span class="grow"><b>${esc(p.nameAr)}</b> × ${fmt(qty)} <span class="small muted">(سعر البيع عندك: ${egp(state.prices[id])})</span></span>
          <span class="${ok ? 'good' : 'bad'} small">${ok ? `عندك ${fmt(have)} ✔` : `عندك ${fmt(have)} بس! ✘`}</span>
        </div>`;
      }).join('')}
    </div>
    <p><b>إجمالي الحساب:</b> <span class="money">${egp(total)}</span> <span class="small muted">(يخصم ١ جنيه مصاريف أكياس)</span></p>
    ${moodHint}
    ${shortages.length ? `<p class="bad small">ناقصك: ${shortages.map((s) => esc(getProduct(s.productId).nameAr)).join('، ')}. الزبون هيستنى من غير أي ضغط… اشتري من عم رجب من شاشة «البضاعة».</p>` : ''}
    <div class="btn-row">
      <button class="btn primary" data-action="serve">🧺 بِع / اخدم الزبون (${egp(total)})</button>
    </div>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn" data-action="goto" data-view="inventory">📦 اشتري الناقص من الجملة</button>
      <button class="btn ghost" data-action="skip-order">اعتذّر للزبون (سمعة −١)</button>
    </div>
  </section>

  ${storyCardHtml()}

  <p class="footer-note">من غير أي استعجال يا معلّم — اللعبة بتتوقف وأنت بتقرأ وبتحسب. اللعب يُحفظ تلقائياً في متصفحك.</p>`;
}

function inventoryViewHtml() {
  const dealP = getProduct(state.deal?.productId);
  const warnings = lowStockWarnings(state);
  return `
  <section class="card">
    <div style="display:flex;gap:10px;align-items:center">
      ${characterSprite('ragab', 'sprite')}
      <div style="flex:1">
        <h2 style="margin:0">تاجر الجملة — عم رجب</h2>
        <p class="small" style="margin:2px 0">اشتري منه بسعر الجملة، وظبّط سعر البيع عندك. الهامش = سعر بيعك − ثمن الجملة.</p>
        <button class="btn small-btn mustard" data-action="talk-ragab">💬 كلّم عم رجب</button>
      </div>
    </div>
  </section>

  ${dealP ? `<div class="deal-banner" role="status">🔥 عرض عم رجب النهاردة: «${esc(dealP.nameAr)}» نازل جنيه! بقى بـ${egp(effectiveCost(state, dealP.id))} بدل ${egp(dealP.cost)}. العرض بيتنقل كل شوية مع زباينك.</div>` : ''}

  <section class="card">
    <h3>سعة التخزين</h3>
    <div class="pbar" role="progressbar" aria-valuenow="${totalUnits(state)}" aria-valuemax="${storageCapacity(state)}" aria-label="سعة التخزين">
      <i style="width:${Math.min(100, (totalUnits(state) / storageCapacity(state)) * 100)}%"></i>
    </div>
    <p class="small">بتستعمل ${fmt(totalUnits(state))} من ${fmt(storageCapacity(state))} مكان. ${warnings.length ? `⚠️ مخزون قليل/خالص: ${warnings.map((w) => esc(w.product.nameAr)).join('، ')}.` : '✔ مفيش نواقص خطيرة.'}</p>
  </section>

  ${PRODUCTS.map((p) => {
    const unlockedP = isProductUnlocked(p, state.upgrades);
    const cost = effectiveCost(state, p.id);
    const margin = grossMarginPerUnit(state, p.id);
    const price = state.prices[p.id];
    const isDeal = state.deal?.productId === p.id;
    return `<section class="card" aria-label="${esc(p.nameAr)}">
      <div style="display:flex;gap:10px;align-items:center">
        ${productSprite(p)}
        <div style="flex:1;min-width:0">
          <b>${esc(p.nameAr)}</b> ${isDeal ? '<span class="tag deal">عرض −١ جنيه</span>' : ''} ${p.cold ? '<span class="tag">ساقع ❄</span>' : ''}
          <div class="small muted">${esc(p.descAr)}</div>
        </div>
        ${stockBadge(state.inventory[p.id] ?? 0)}
      </div>
      ${unlockedP ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px" class="small">
        <span>سعر الجملة: <b>${egp(cost)}</b>${isDeal ? ` <s>${egp(p.cost)}</s>` : ''}</span>
        <span>السعر العادل المتعارف عليه: <b>${egp(p.defaultPrice)}</b></span>
        <span>هامش ربحك في الحبة: <b class="${margin > 0 ? 'good' : 'bad'}">${fmt(margin)} جنيه</b></span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px">
        <label class="small" for="price-${p.id}"><b>سعر بيعك:</b></label>
        <span class="price-editor">
          <button class="stepper" data-action="price-down" data-id="${p.id}" aria-label="قلّل سعر ${esc(p.nameAr)} جنيه">−</button>
          <output id="price-${p.id}">${fmt(price)} جنيه</output>
          <button class="stepper" data-action="price-up" data-id="${p.id}" aria-label="زوّد سعر ${esc(p.nameAr)} جنيه">+</button>
        </span>
        <span class="small muted">${price > p.defaultPrice * 1.3 ? '⚠️ غالي جداً! السمعة هتتأثر' : price <= p.cost ? '⚠️ ده بثمن الجملة أو أرخص!' : 'سعر معقول ✓'}</span>
      </div>
      <div class="btn-row" style="margin-top:8px" role="group" aria-label="اشتري ${esc(p.nameAr)}">
        <button class="btn small-btn" data-action="buy" data-id="${p.id}" data-qty="1">اشتري ١ (${egp(cost)})</button>
        <button class="btn small-btn" data-action="buy" data-id="${p.id}" data-qty="5">اشتري ٥ (${egp(cost * 5)})</button>
        <button class="btn small-btn mustard" data-action="buy" data-id="${p.id}" data-qty="10">اشتري ١٠ (${egp(cost * 10)})</button>
      </div>` : `
      <p class="small bad">🔒 المنتج ده ساقع ومحتاج ثلاجة في المحل الأول — عم رجب مش هيبيعهولك قبل كده عشان ما يبوظش عندك.</p>
      <button class="btn small-btn terra" data-action="goto" data-view="upgrades">شوف تطوير «ثلاجة عرض» (${egp(getUpgrade('fridge').price)})</button>`}
    </section>`;
  }).join('')}`;
}

function questRowHtml(def, progress, mode) {
  const giver = getCharacter(def.giverId);
  const itemsText = def.type === 'deliver'
    ? Object.entries(def.items).map(([id, q]) => `${q} × ${getProduct(id).nameAr} (عندك ${state.inventory[id] ?? 0})`).join('، ')
    : def.type === 'buyUnits' ? `اشتري ${def.target} ${def.productId ? `× ${getProduct(def.productId).nameAr}` : 'وحدة أي بضاعة'}`
    : def.type === 'fairServes' ? `اخدم ${def.target} زباين بسعر عادل`
    : `اخدم ${def.target} زباين`;
  const progressHtml = (mode === 'active' && def.type !== 'deliver')
    ? `<div class="pbar" style="margin-top:6px"><i style="width:${Math.min(100, (progress / def.target) * 100)}%"></i></div>
       <span class="small">التقدم: ${fmt(progress)}/${fmt(def.target)}</span>` : '';
  return `<div class="quest-row">
    ${characterSprite(giver.sprite, 'sprite')}
    <div class="grow">
      <b>${esc(def.titleAr)}</b> ${def.endless ? '<span class="tag">لعب حر ♾</span>' : ''} <span class="small muted">— ${esc(giver.nameAr)}</span>
      <div class="small">${esc(def.descAr)}</div>
      <div class="small">🎯 الهدف: ${esc(itemsText)}</div>
      <div class="small">🎁 المكافأة: <b>${egp(def.rewardCash)}</b> و+${fmt(def.rewardRep ?? 0)} سمعة (مرة واحدة فقط)</div>
      ${progressHtml}
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${mode === 'available' ? `<button class="btn small-btn primary" data-action="quest-intro" data-id="${def.id}">اسمع الحكاية وابدأ</button>` : ''}
      ${mode === 'active' && def.type === 'deliver' ? `<button class="btn small-btn terra" data-action="quest-deliver" data-id="${def.id}">🛵 توصيل الطلبية</button>` : ''}
      ${mode === 'claim' ? `<button class="btn small-btn mustard" data-action="quest-claim" data-id="${def.id}">🎁 اقبض المكافأة</button>` : ''}
    </div>
  </div>`;
}

function questsViewHtml() {
  const available = availableStoryQuests(state);
  const active = activeQuestList(state);
  const claim = completedUnclaimed(state);
  const doneIds = [...new Set([...state.quests.completed, ...state.quests.claimed])];
  return `
  ${storyCardHtml()}
  <section class="card">
    <h2>🎁 مكافآت مستنية القبض (${fmt(claim.length)})</h2>
    ${claim.length ? claim.map((d) => questRowHtml(d, d.target ?? 0, 'claim')).join('') : '<p class="small muted">لسه مفيش مهام اكتملت ومستنية. لما تكمل هدف، المكافأة هتظهر هنا فوراً.</p>'}
  </section>
  <section class="card">
    <h2>⏳ مهام شغالة عليك دلوقتي (${fmt(active.length)})</h2>
    ${active.length ? active.map((x) => questRowHtml(x.def, x.progress, 'active')).join('') : '<p class="small muted">مش واخد مهام دلوقتي. اختار حكاية من تحت وابدأ!</p>'}
  </section>
  <section class="card">
    <h2>📜 حكايات ومهام جديدة (${fmt(available.length)})</h2>
    ${available.length ? available.map((d) => questRowHtml(d, 0, 'available')).join('') : '<p class="small muted">كل حكايات المرحلة دي اتعرفت. كمل أهداف المرحلة و هتفتح حكايات جديدة.</p>'}
  </section>
  <section class="card">
    <h3>✔️ خلّصتها خلاص (${fmt(doneIds.length)})</h3>
    <p class="small">${doneIds.length ? doneIds.map((id) => esc(findQuestDef(state, id)?.titleAr ?? id)).join(' • ') : 'لسه ولا مهمة. أول حكاية على بعد زرار!'}</p>
  </section>`;
}

function mapViewHtml() {
  const HassanUnlocked = state.endlessUnlocked || state.storyLevel >= 4;
  const visibleLandmarks = LANDMARKS.filter((item) => item.id !== 'rival' || HassanUnlocked);
  const nearbyLandmark = nearestLandmark(playerPosition, visibleLandmarks);
  let detail = '';
  if (selectedLocation === 'cafe') {
    detail = `<section class="card" aria-label="قهوة الحارة">
      <div style="display:flex;gap:10px;align-items:center">${characterSprite('Mahmoud', 'sprite')}
        <div><h2 style="margin:0">☕ قهوة الحارة</h2><p class="small" style="margin:2px 0">كراسي بلاستيك، شاي تقيل، وأخبار الحارة قبل ما تحصل.</p></div>
      </div>
      <div class="speech" style="margin:10px 0">أستاذ Mahmoud: «الزبون الراضي بيجيب عشرة.. والزبون المتضرر من السعر بيبعدهم. حافظ على سمعتك فوق الخمسين دايماً».</div>
      <h3>شغلانة القهوة الصغيرة (شبكة أمان)</h3>
      <p class="small">لو الكاش وقع تحت ${fmt(CAFE_HELP_CASH_LIMIT)} جنيه، صاحب القهوة هيشغلك ساعة الزحمة مقابل ${fmt(CAFE_HELP_REWARD)} جنيه عشان ما تتعطلش أبداً. بين كل شغلانة و التانية لازم تخدم زبونين في محلك — دي مساعدة للطوارئ، مش مصدر ربح.</p>
      <div class="btn-row">
        <button class="btn mustard" data-action="cafe-help">☕ ساعد في القهوة (+${fmt(CAFE_HELP_REWARD)} جنيه عند الحاجة)</button>
        <button class="btn" data-action="talk-cafe">💬 اسمع أخبار الحارة</button>
      </div>
    </section>`;
  } else if (selectedLocation === 'rival' && HassanUnlocked) {
    const challenge = findQuestDef(state, 'q_hassan_challenge');
    const done = isQuestDone(state, 'q_hassan_challenge');
    detail = `<section class="card" aria-label="محل المنافس">
      <div style="display:flex;gap:10px;align-items:center">${characterSprite('Hassan', 'sprite')}
        <div><h2 style="margin:0">🏪 محل حسن المنافس</h2><p class="small" style="margin:2px 0">${done ? 'كسبت اعترافه بجدارة. المنافس الشريف نعمة!' : 'لسه التحدي قائم: ٣ زباين سعداء بأسعار عادلة.'}</p></div>
      </div>
      ${challenge && !done ? `<div style="margin-top:10px">${questRowHtml(challenge, state.quests.active.q_hassan_challenge?.progress ?? 0, state.quests.active.q_hassan_challenge ? 'active' : (state.quests.completed.includes('q_hassan_challenge') && !state.quests.claimed.includes('q_hassan_challenge') ? 'claim' : 'available'))}</div>` : ''}
      <div class="btn-row" style="margin-top:8px">
        <button class="btn" data-action="talk-Hassan">💬 كلّم حسن</button>
        <button class="btn primary" data-action="goto" data-view="shop">ارجع محلك واخدم زباينك</button>
      </div>
    </section>`;
  } else if (selectedLocation === 'wholesale') {
    const dealP = getProduct(state.deal.productId);
    detail = `<section class="card" aria-label="محل الجملة">
      <div style="display:flex;gap:10px;align-items:center">${characterSprite('ragab', 'sprite')}
        <div><h2 style="margin:0">🚚 محل عم رجب (الجملة)</h2><p class="small" style="margin:2px 0">عرض دلوقتي على «${esc(dealP.nameAr)}» بـ${egp(effectiveCost(state, dealP.id))}!</p></div>
      </div>
      <div class="btn-row" style="margin-top:8px">
        <button class="btn primary" data-action="goto" data-view="inventory">📦 افتح كشف البضاعة واشتري</button>
        <button class="btn" data-action="talk-ragab">💬 دردش مع عم رجب</button>
      </div>
    </section>`;
  }
  return `
  <section class="card explore-card" aria-label="استكشاف الحارة">
    <div class="explore-heading">
      <div><h2>🏘️ امشِ في الحارة</h2><p class="small muted">حرّك شخصيتك لحد ما تقرب من مكان، وبعدها دوس «ادخل».</p></div>
      <span class="explore-hint">⌨️ الأسهم أو WASD</span>
    </div>
    <div class="explore-scene" role="img" aria-label="حارة مصرية شعبية؛ اللاعب يتحرك في الشارع بين البقالة وتاجر الجملة والقهوة">
      ${alleySceneSvg()}
      ${LANDMARKS.map((item) => {
        const locked = item.id === 'rival' && !HassanUnlocked;
        return `<div class="explore-marker ${locked ? 'locked' : ''} ${nearbyLandmark?.id === item.id ? 'nearby' : ''}" style="left:${item.x}%;top:${item.y}%">
          <span aria-hidden="true">${locked ? '🔒' : item.icon}</span><small>${locked ? 'محل لاحقاً' : esc(item.labelAr)}</small>
        </div>`;
      }).join('')}
      <div class="explore-player" style="left:${playerPosition.x}%;top:${playerPosition.y}%" aria-hidden="true">
        ${characterSprite('player', 'explore-avatar')}
      </div>
    </div>
    <div class="explore-control-row">
      <div class="explore-pad" role="group" aria-label="أزرار حركة الشخصية">
        <span></span><button data-action="move-player" data-dx="0" data-dy="-3" aria-label="تحرك لأعلى">▲</button><span></span>
        <button data-action="move-player" data-dx="-4" data-dy="0" aria-label="تحرك لليسار">◀</button>
        <button class="explore-center" data-action="interact-nearby" aria-label="${nearbyLandmark ? `ادخل ${esc(nearbyLandmark.labelAr)}` : 'لا يوجد مكان قريب للتفاعل'}" ${nearbyLandmark ? '' : 'disabled'}>↵</button>
        <button data-action="move-player" data-dx="4" data-dy="0" aria-label="تحرك لليمين">▶</button>
        <span></span><button data-action="move-player" data-dx="0" data-dy="3" aria-label="تحرك لأسفل">▼</button><span></span>
      </div>
      <div class="explore-interaction" aria-live="polite">
        <b>${nearbyLandmark ? `📍 ${esc(nearbyLandmark.labelAr)} قريب منك` : '🚶 اتحرك ناحية مكان في الحارة'}</b>
        <p class="small muted">${nearbyLandmark ? 'تقدر تدخل المكان دلوقتي.' : 'استخدم أزرار الحركة أو الأسهم من الكيبورد.'}</p>
        <button class="btn primary" data-action="interact-nearby" ${nearbyLandmark ? '' : 'disabled'}>${nearbyLandmark ? `ادخل ${esc(nearbyLandmark.labelAr)}` : 'قرّب من مكان الأول'}</button>
      </div>
    </div>
  </section>
  <section class="card">
    <h2>📍 اختصارات الأماكن</h2>
    <p class="small muted">تقدر تمشي وتدخل بنفسك، أو تستخدم اختصار سريع لأي مكان متاح.</p>
    <div class="location-grid">
      <button class="location-btn shop" data-action="loc-shop"><span aria-hidden="true">🧺</span><span class="loc-title">محلك (البقالة)</span><span class="small">بِع واستقبل الزباين عند الكاونتر.</span></button>
      <button class="location-btn wholesale" data-action="loc-wholesale"><span aria-hidden="true">🚚</span><span class="loc-title">تاجر الجملة</span><span class="small">عم رجب والعروض على «${esc(getProduct(state.deal.productId).nameAr)}» بـ${egp(effectiveCost(state, state.deal.productId))}.</span></button>
      <button class="location-btn cafe" data-action="loc-cafe"><span aria-hidden="true">☕</span><span class="loc-title">قهوة الحارة</span><span class="small">أخبار، نصايح، وشغلانة الطوارئ الصغيرة (+${fmt(CAFE_HELP_REWARD)}) لو فلوسك قللت قوي.</span></button>
      ${HassanUnlocked
        ? `<button class="location-btn rival" data-action="loc-rival"><span aria-hidden="true">🏪</span><span class="loc-title">محل حسن المنافس</span><span class="small">${isQuestDone(state, 'q_hassan_challenge') ? 'التحدي انت كسبته ✔ — تعالى سلّم عليه.' : 'تحدي المنافس شغال! دوستك هنا توريك التفاصيل.'}</span></button>`
        : `<button class="location-btn rival" disabled aria-disabled="true"><span aria-hidden="true">🔒</span><span class="loc-title">محل في أول الشارع</span><span class="small">هتتعرف على صاحبه في «المرحلة ٤ — المنافس».</span></button>`}
    </div>
  </section>
  ${detail}
  <section class="card">
    <h3>👥 أهل الحارة</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${CHARACTERS.map((c) => `<div class="order-line">${characterSprite(c.sprite, 'sprite')}<span class="grow"><b>${esc(c.nameAr)}</b> <span class="muted small">${esc(c.roleAr)}</span><br><span class="small">${esc(c.personalityAr)}</span></span></div>`).join('')}
    </div>
  </section>`;
}

function upgradesViewHtml() {
  const unlocked = PRODUCTS.filter((p) => isProductUnlocked(p, state.upgrades));
  return `
  <div class="scene-wrap" role="img" aria-label="شكل محلك بالتطويرات المركّبة حالياً">
    ${shopSceneSvg(state, unlocked)}
    <div class="shop-sign">${state.upgrades.includes('sign') || state.upgrades.includes('storefront') ? 'بقالة المعلّم' : 'محل بقالة صغير'}</div>
    <div class="scene-player">${characterSprite('player')}</div>
  </div>
  <section class="card">
    <h2>🔨 تطوير المحل</h2>
    <p class="small">فلوسك: <b>${egp(state.cash)}</b> • مركّب ${fmt(state.upgrades.length)} من ${fmt(UPGRADES.length)} تطويرات. التطوير بيبان فى صورة المحل فوق على طول، وبيتخزن في الحفظ.</p>
    <div style="display:flex;flex-direction:column;gap:8px">
    ${UPGRADES.map((u) => {
      const owned = state.upgrades.includes(u.id);
      const afford = state.cash >= u.price;
      const emoji = { sign: '🪧', shelves: '🗄️', fridge: '🧊', storage: '📦', storefront: '🎨' }[u.id] ?? '🔨';
      return `<div class="upgrade-row">
        <span style="font-size:30px" aria-hidden="true">${emoji}</span>
        <div class="grow">
          <b>${esc(u.nameAr)}</b> ${owned ? '<span class="tag done">مركّبة عندك ✔</span>' : `<span class="tag">السعر: ${fmt(u.price)} جنيه</span>`}
          <div class="small">${esc(u.descAr)}</div>
          <div class="small good">الأثر: ${esc(u.effectAr)}</div>
          ${!owned && !afford ? `<div class="small bad">ناقصك ${egp(u.price - state.cash)} على ثمنها.</div>` : ''}
        </div>
        ${owned ? '<span class="tag done">✔ عندك</span>' : `<button class="btn small-btn ${afford ? 'primary' : ''}" data-action="buy-upgrade" data-id="${u.id}">اشتري بـ${fmt(u.price)} ج</button>`}
      </div>`;
    }).join('')}
    </div>
    <p class="small muted">ملحوظة حسابية: شراء التطوير «استثمار» بيظهر لوحده في شاشة الحسابات، ومش بيخصم من صافي ربح التشغيل اليومي.</p>
  </section>`;
}

function statsViewHtml() {
  const s = state.stats;
  const net = netProfit(state);
  const best = Object.entries(s.soldByProduct).sort((a, b) => b[1] - a[1]);
  const stockValue = PRODUCTS.reduce((sum, p) => sum + (state.inventory[p.id] ?? 0) * p.cost, 0);
  const rows = [
    ['① إيرادات بيع الزباين', s.revenue],
    ['② دخل المهام والمكافآت', s.questIncome],
    ['③ دخل شغلانة القهوة (شبكة الأمان)', s.cafeHelpEarned ?? 0],
    ['④ تكلفة البضاعة المباعة (COGS)', -s.cogs],
    ['⑤ مصاريف تشغيل (أكياس: ١ جنيه × كل طلب)', -s.operatingExpenses],
  ];
  return `
  <section class="card">
    <h2>📊 حسابات المحل (الدفتر)</h2>
    <div class="formula"><b>صافي ربح التشغيل</b> = إيرادات البيع + دخل المهام + شغل القهوة − تكلفة البضاعة المباعة − مصاريف التشغيل.<br>
    الشراء من الجملة <b>مش</b> مصروف وقت الشراء؛ البضاعة بتتحسب تكلفتها لما بتتباع بس.</div>
    <table class="stat-table" aria-label="جدول الحسابات">
      <tr><th>البند</th><th class="num">المبلغ</th></tr>
      ${rows.map(([label, v]) => `<tr><td>${label}</td><td class="num">${fmt(v)} ج</td></tr>`).join('')}
      <tr><th>صافي ربح التشغيل ${net < 0 ? '(خسارة مؤقتة — كمّل بيع!)' : ''}</th><th class="num">${fmt(net)} ج</th></tr>
      <tr><td>استثمارات تطوير المحل (منفصلة)</td><td class="num">${fmt(s.upgradeSpend)} ج</td></tr>
      <tr><td>إجمالي مشتريات الجملة حتى الآن</td><td class="num">${fmt(s.totalPurchaseCost)} ج (${fmt(s.totalPurchasedUnits)} قطعة)</td></tr>
    </table>
    <p class="small">الكاش الحالي: <b>${egp(state.cash)}</b> • قيمة مخزونك بثمن الجملة: <b>${egp(stockValue)}</b> • الأصول التقريبية (كاش+مخزون): <b>${egp(state.cash + stockValue)}</b></p>
  </section>
  <section class="card">
    <h3>👥 خدمة وأهل الحارة</h3>
    <p class="small">زباين اتخدموا: <b>${fmt(s.customersServed)}</b> • منهم خدمة بسعر عادل: <b>${fmt(s.fairServes)}</b> • مهام مكملة: <b>${fmt(new Set([...state.quests.completed, ...state.quests.claimed]).size)}</b> • السمعة: <b>${fmt(state.reputation)}/١٠٠</b> • المرحلة: <b>${state.endlessUnlocked ? 'اللعب الحر بعد لقب معلّم الحارة 🏆' : `${state.storyLevel} من ${MAX_STORY_LEVEL}`}</b></p>
  </section>
  <section class="card">
    <h3>🏅 أكتر منتجات بتتباع</h3>
    ${best.length ? `<table class="stat-table"><tr><th>المنتج</th><th class="num">اتباع كام</th><th class="num">هامش الحبة الآن</th></tr>
      ${best.map(([id, qty]) => `<tr><td>${esc(getProduct(id).nameAr)}</td><td class="num">${fmt(qty)}</td><td class="num">${fmt(grossMarginPerUnit(state, id))} ج</td></tr>`).join('')}</table>`
      : '<p class="small muted">لسه ولا بيعة. اخدم أول زبون في المحل!</p>'}
  </section>`;
}

function dialogueHtml() {
  if (!dialogue) return '';
  const line = dialogue.lines[dialogue.idx];
  const sp = speakerInfo(line.speaker);
  const isLast = dialogue.idx >= dialogue.lines.length - 1;
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="حوار مع ${esc(sp.nameAr)}">
    <div class="dialogue-box">
      <div class="dialogue-head">${characterSprite(sp.sprite, 'sprite')}
        <div><div class="dialogue-name">${esc(sp.nameAr)}</div><div class="small muted">${fmt(dialogue.idx + 1)} من ${fmt(dialogue.lines.length)} — الحوار موقف اللعب، اقرأ براحتك</div></div>
      </div>
      <p class="dialogue-text">${esc(arDigits(line.text))}</p>
      ${isLast && dialogue.choices ? `
        <div class="btn-row">
          ${dialogue.choices.map((c, i) => `<button class="btn ${i === 0 ? 'primary' : 'ghost'}" data-action="dialogue-choice" data-idx="${i}">${esc(c.labelAr)}</button>`).join('')}
        </div>` : `
        <button class="btn primary" data-action="dialogue-next" style="width:100%" autofocus>${isLast ? 'تمام ✔' : 'كمل ▸'}</button>`}
    </div>
  </div>`;
}

function modalHtml() {
  if (!modal) return '';
  if (modal === 'settings') {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="الإعدادات">
    <div class="modal-box">
      <h2>⚙️ الإعدادات والحفظ</h2>
      <label class="switch-row"><span>🔊 أصوات صغيرة (بيب) على البيع والمكافآت</span>
        <input type="checkbox" data-setting="sound" ${state.settings.sound ? 'checked' : ''} aria-label="تشغيل الصوت"></label>
      <label class="switch-row"><span>🎞️ تقليل الحركة (يوقف حركة الزباين الخفيفة)</span>
        <input type="checkbox" data-setting="reduceMotion" ${state.settings.reduceMotion ? 'checked' : ''} aria-label="تقليل الحركة"></label>
      <h3>💾 الحفظ</h3>
      <p class="small">تقدمك بيتحفظ تلقائياً بعد كل إجراء ناجح في <b>تخزين متصفحك</b> على الجهاز ده (شكل البيانات: النسخة ${fmt(SCHEMA_VERSION)}). مفيش حسابات ولا سحابة في النسخة دي، فلو مسحت بيانات الموقع من المتصفح تقدمك هيتمسح. تحديث الصفحة آمن: هتلاقي لعبك زي ما سبته.</p>
      <div class="btn-row">
        <button class="btn primary" data-action="manual-save">💾 احفظ دلوقتي يدوياً</button>
        <button class="btn" data-action="open-help">؟ شرح اللعب</button>
      </div>
      <h3 style="color:var(--danger)">منطقة الخطر</h3>
      <button class="btn terra" data-action="ask-reset" style="width:100%">🗑️ امسح تقدّمي وأبدأ من أول (بـ٥٠٠ جنيه جديدة)</button>
      <button class="btn ghost" data-action="close-modal" style="width:100%;margin-top:8px">سكر الإعدادات</button>
    </div></div>`;
  }
  if (modal === 'reset') {
    return `<div class="overlay" role="alertdialog" aria-modal="true" aria-label="تأكيد مسح التقدم">
    <div class="modal-box">
      <h2>⚠️ متأكد يا معلّم؟</h2>
      <p>هيمسح كاش ${egp(state.cash)} و${fmt(totalUnits(state))} قطعة مخزون وكل تقدمك فى المراحل والمهام والتطويرات نهائياً، وهنبدأ محل جديد بـ٥٠٠ جنيه. مفيش تراجع!</p>
      <div class="btn-row">
        <button class="btn terra" data-action="confirm-reset">أيوا، امسح كل حاجة وابدأ من الأول</button>
        <button class="btn primary" data-action="close-modal">لأ لأ، ارجع للعبتي</button>
      </div>
    </div></div>`;
  }
  if (modal === 'help') {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="ازاي تلعب المعلّم">
    <div class="modal-box">
      <h2>🎮 ازاي تلعب «المعلّم»؟</h2>
      <ol style="padding-inline-start:20px;margin:6px 0" class="small">
        <li><b>راجع المخزون والفلوس</b> من فوق (الكاش والسمعة)</li>
        <li><b>اشتري من عم رجب</b> في شاشة «البضاعة» سعر الجملة أرخص من سعر البيع.</li>
        <li><b>سعّر بذكاء:</b> الهامش = سعر البيع − الجملة. سعر قريب من «العادل» يكسب سمعة؛ الغالي قوي يزعل الزباين.</li>
        <li><b>اخدم الزبون</b> في المحل بزر «بِع/اخدم الزبون».</li>
        <li><b>اعمل مهام أهل الحارة</b> في شاشة «المهام». المكافأة مرة واحدة بس لكل مهمة.</li>
        <li><b>راجع الدفتر</b> في «الحسابات» عشان تفهم الفرق بين الإيراد الربح.</li>
        <li><b>استثمر الأرباح</b> بضاعة وتطويرات (يافطة، رفوف، ثلاجة بتفتح الكولا والعصير ياسلام!).</li>
        <li>كمّل ال٥ مراحل وابقى <b>معلّم الحارة</b> وافتح اللعب الحر ♾</li>
      </ol>
      <p class="small">اتحشرت وفلوسك خلصت؟ روح «الحارة ← القهوة» وساعد ساعة زحمة مقابل ٣٠ جنيه. مفيش زنقات ملهاش حل عندنا!</p>
      <p class="small">التحكم كله الوشوشة ولمسات كبيرة مناسبة للموبايل. وكل زرار تقدر توصله بزراير الكيبورد (Tab + Enter).</p>
      <button class="btn primary" data-action="close-modal" style="width:100%">فهمتك.. يلا بيع!</button>
    </div></div>`;
  }
  if (modal === 'corrupt') {
    return `<div class="overlay" role="alertdialog" aria-modal="true" aria-label="حفظ قديم غير قابل للقراءة">
    <div class="modal-box">
      <h2>🧰 لقينا حفظ قديم مش بيتقري</h2>
      <p>الحفظ اللي على الجهاز كان تالف أو من نسخة أقدم بكتير، فعملنا له نسخه احتياطية جنب ومامسحناهوش من وراك.. هنبدأ لك محل جديد من الصفر (٥٠٠ جنيه). لو تختار تبدأ، حفك الجديد بيتكتب مكان القديم.</p>
      <button class="btn primary" data-action="confirm-fresh-after-corrupt" style="width:100%">تمام، ابدأ محل جديد</button>
    </div></div>`;
  }
  return '';
}

function render() {
  const claimable = completedUnclaimed(state).length;
  const views = {
    shop: shopViewHtml,
    inventory: inventoryViewHtml,
    map: mapViewHtml,
    quests: questsViewHtml,
    upgrades: upgradesViewHtml,
    stats: statsViewHtml,
  };
  const app = document.querySelector('#app');
  app.innerHTML = `
  <div class="game-shell ${state.settings.reduceMotion ? 'reduce-motion' : ''}">
    <a class="sr-only" href="#main-view">تخطي لشاشة اللعب</a>
    ${hudHtml()}
    <main class="view" id="main-view">${(views[view] ?? shopViewHtml)()}</main>
    <nav class="bottom-nav" aria-label="شاشات اللعبة">
      ${NAV.map((n) => `<button data-action="goto" data-view="${n.id}" class="${view === n.id ? 'active' : ''}" aria-current="${view === n.id ? 'page' : 'false'}" aria-label="${n.labelAr}">
        ${n.id === 'quests' && claimable ? `<span class="nav-badge">${claimable}</span>` : ''}
        <span class="nav-ico" aria-hidden="true">${n.icon}</span><span>${n.labelAr}</span></button>`).join('')}
    </nav>
    ${dialogueHtml()}
    ${modalHtml()}
    <div class="toast-stack" aria-live="polite"></div>
  </div>`;
  renderToasts();
}

/* ---------------- Actions ---------------- */

const ACTIONS = {
  'goto': (el) => { view = el.dataset.view; if (view !== 'map') selectedLocation = null; render(); window.scrollTo(0, 0); },
  'serve': () => guarded(() => {
    const res = serveOrder(state, newActionId('serve'));
    if (commit(res, { silent: true })) {
      beep(880);
      const mood = res.satisfaction?.mood ?? 'neutral';
      toast(`💰 قبضت ${Number(res.revenue).toLocaleString('ar-EG')} جنيه${res.satisfaction.repDelta ? ` • السمعة ${res.satisfaction.repDelta > 0 ? '+' : ''}${res.satisfaction.repDelta}` : ''}`);
      reactionDialogue(res.servedOrder.characterId, mood === 'happy' ? 'happy' : mood === 'unhappy' ? 'unhappy' : 'neutral', res.revenue);
      if (canCompleteLevel(state)) setTimeout(() => toast('🎯 أهداف المرحلة كلها اكتملت! من كارت المرحلة دوس «أكمّل المرحلة» واقبض المكافأة.'), 500);
    }
  }),
  'skip-order': () => guarded(() => {
    const prevChar = state.currentOrder.characterId;
    if (commit(skipOrder(state, newActionId('skip')))) reactionDialogue(prevChar, 'noStock');
  }),
  'buy': (el) => guarded(() => {
    commit(buyStock(state, el.dataset.id, Number(el.dataset.qty), newActionId('buy')));
  }),
  'price-up': (el) => guarded(() => commit(setPrice(state, el.dataset.id, (state.prices[el.dataset.id] ?? 0) + 1))),
  'price-down': (el) => guarded(() => commit(setPrice(state, el.dataset.id, (state.prices[el.dataset.id] ?? 1) - 1))),
  'buy-upgrade': (el) => guarded(() => {
    if (commit(buyUpgrade(state, el.dataset.id, newActionId('upgrade')))) beep(520, 0.14);
  }),
  'complete-level': () => guarded(() => {
    const res = completeLevel(state, newActionId('level'));
    if (commit(res)) {
      beep(990, 0.16);
      if (res.finishedStory) {
        openDialogue([
          { speaker: 'umm_ahmed', text: 'يا ما شاء الله! الحارة كلها فرحانة بيك يا ابني… إنت دلوقتي رسميًا: معلّم الحارة!' },
          { speaker: 'Hassan', text: 'باعترف — كسبتني بشطارتك وسعرك العادل. المنافسة معاك خلتني أحسن، وده أحلى ما فيها.' },
          { speaker: 'ragab', text: 'من محل صغير بـ٥٠٠ جنيه.. لمعلّم الحارة! يلا بقى، السوق لسه مليان رزق في اللعب الحر.' },
          { speaker: 'player', text: 'اللقب ده بتاعنا كلنا.. المحل مفتوح لأهل الحارة زي ماهو دايمًا مفتوح — ولسه الحكاية مكملة!' },
        ]);
      } else {
        maybeShowLevelIntro();
      }
    }
  }),
  'quest-intro': (el) => {
    const def = findQuestDef(state, el.dataset.id);
    if (!def) return;
    openDialogue(def.dialogue ?? [], {
      choices: [
        { labelAr: '🤝 اتفقنا! ابدأ المهمة', act: 'accept', questId: def.id },
        { labelAr: 'استنى شوية وأظبط أموري', act: 'close' },
      ],
    });
  },
  'quest-deliver': (el) => guarded(() => commit(deliverQuest(state, el.dataset.id, newActionId('deliver')))),
  'quest-claim': (el) => guarded(() => commit(claimQuestReward(state, el.dataset.id, newActionId('claim')))),
  'dialogue-next': () => {
    if (!dialogue) return;
    if (dialogue.idx < dialogue.lines.length - 1) { dialogue.idx += 1; render(); }
    else closeDialogue();
  },
  'dialogue-choice': (el) => {
    const choice = dialogue?.choices?.[Number(el.dataset.idx)];
    if (!choice) { closeDialogue(); return; }
    if (choice.act === 'accept') {
      dialogue = null;
      guarded(() => commit(startQuest(state, choice.questId, newActionId('quest'))));
    } else closeDialogue();
  },
  'talk-ragab': () => {
    const dealP = getProduct(state.deal.productId);
    openDialogue([
      { speaker: 'ragab', text: pickLine(getCharacter('ragab').greetings) },
      { speaker: 'ragab', text: `على فكرة؛ حاطط خصم جنيه على «${dealP.nameAr}» دلوقتي (${Number(effectiveCost(state, dealP.id)).toLocaleString('ar-EG')} جنيه بس). العروض بتتنقل مع حركة محلك.` },
      { speaker: 'ragab', text: 'نصيحة من شيخ التجار: اشتري قبل ما الرف يفضى.. الزبون اللي بيمشي خالي الوفاض ممكن ينساك!' },
    ]);
  },
  'talk-cafe': () => {
    const who = ['umm_ahmed', 'Mahmoud', 'sayed'][state.orderCounter % 3];
    const tips = {
      umm_ahmed: 'سمعت إن حسن بيغلي أسعاره شوية شوية.. فرصتّك تبقى انت الوش البشوش والسعر الحنين في الحارة!',
      Mahmoud: 'راجع دفترك كل شوية: الفرق بين إجمالي بيعك وصافي ربحك هو تكلفة البضاعة والمصاريف. اللي يفهم الفرق ده ما يتفاجئش آخر الشهر.',
      sayed: 'أنا بحب الشاي مع البسكويت على العصرية.. وأهل الحارة في الصيف بيموتوا في الكولا الساقعة. حوش للثلاجة يا معلّم!',
    };
    openDialogue([{ speaker: who, text: tips[who] }]);
  },
  'talk-Hassan': () => openDialogue([
    { speaker: 'Hassan', text: pickLine(getCharacter('Hassan').greetings) },
    { speaker: 'Hassan', text: 'أنا مبزعلش من المنافسة النضيفة.. بس مابستسلمش! زباين الحارة بيختاروا بأعينهم: بضاعة موجودة، سعر عادل، ووش مبسوط.' },
  ]),
  'cafe-help': () => guarded(() => commit(cafeHelp(state, newActionId('cafe')))),
  'move-player': (el) => {
    const next = movePlayer(playerPosition, Number(el.dataset.dx), Number(el.dataset.dy));
    if (next.x === playerPosition.x && next.y === playerPosition.y) {
      toast('وصلت لحافة الطريق — اتحرك في اتجاه تاني.', 'error');
      return;
    }
    playerPosition = next;
    render();
  },
  'interact-nearby': () => {
    const accessible = LANDMARKS.filter((item) => item.id !== 'rival' || state.endlessUnlocked || state.storyLevel >= 4);
    const nearby = nearestLandmark(playerPosition, accessible);
    if (!nearby) {
      toast('قرّب من مكان الأول عشان تقدر تدخل.', 'error');
      return;
    }
    if (nearby.id === 'shop') {
      view = 'shop';
      selectedLocation = null;
      render();
      window.scrollTo(0, 0);
      return;
    }
    selectedLocation = nearby.id;
    render();
    toast(nearby.id === 'wholesale' ? 'وصلت عند عم رجب 🚚' : nearby.id === 'cafe' ? 'أهلًا بيك في قهوة الحارة ☕' : 'وصلت لمحل حسن المنافس');
  },
  'loc-shop': () => { view = 'shop'; selectedLocation = null; render(); window.scrollTo(0, 0); },
  'loc-wholesale': () => { selectedLocation = 'wholesale'; render(); toast('وصلت عند عم رجب 🚚'); },
  'loc-cafe': () => { selectedLocation = 'cafe'; render(); toast('أهلًا بيك في قهوة الحارة ☕'); },
  'loc-rival': () => { selectedLocation = 'rival'; render(); toast('وصلت لمحل حسن المنافس'); },
  'open-settings': () => { modal = 'settings'; render(); },
  'open-help': () => { modal = 'help'; render(); },
  'close-modal': () => { modal = null; render(); },
  'manual-save': () => {
    const message = manualSaveResultMessage(persist());
    if (message) toast(message);
  },
  'ask-reset': () => { modal = 'reset'; render(); },
  'confirm-reset': () => {
    saveManager.clear();
    state = createInitialState();
    view = 'shop'; modal = null; dialogue = null; selectedLocation = null;
    persist(); render(); maybeShowLevelIntro();
    toast('من الأول يا معلّم! محل جديد و٥٠٠ جنيه في الجيب.');
  },
  'confirm-fresh-after-corrupt': () => {
    modal = null; persist(); render(); maybeShowLevelIntro();
  },
};

export function startApp() {
  saveManager = createBrowserSaveManager();
  const loaded = saveManager.load();
  if (loaded.ok) {
    state = loaded.state;
  } else if (loaded.reason === 'corrupted') {
    // Do NOT silently overwrite: old data is backed up; player confirms a fresh start.
    state = createInitialState();
    modal = 'corrupt';
  } else {
    state = createInitialState();
    persist(); // first-run save establishes the documented starting state
  }

  const app = document.querySelector('#app');
  app.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { ev.preventDefault(); fn(el, ev); }
  });
  app.addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-setting]');
    if (!el) return;
    const next = structuredClone(state);
    next.settings[el.dataset.setting] = !!el.checked;
    state = next; persist(); render();
    toast('اتحفظت الإعدادات ✔');
  });
  document.addEventListener('keydown', (ev) => {
    if (view === 'map' && !dialogue && !modal) {
      const directions = {
        ArrowUp: [0, -3], w: [0, -3], W: [0, -3],
        ArrowDown: [0, 3], s: [0, 3], S: [0, 3],
        ArrowLeft: [-4, 0], a: [-4, 0], A: [-4, 0],
        ArrowRight: [4, 0], d: [4, 0], D: [4, 0],
      };
      const delta = directions[ev.key];
      const target = ev.target;
      const typing = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (delta && !typing) {
        ev.preventDefault();
        playerPosition = movePlayer(playerPosition, delta[0], delta[1]);
        render();
        return;
      }
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && dialogue && ev.target === document.body) {
      // keyboard players can advance dialogue without hunting for the button
      ACTIONS['dialogue-next']();
    }
  });

  render();
  if (!loaded.ok && loaded.reason === 'missing') maybeShowLevelIntro();
  else if (loaded.ok) maybeShowLevelIntro();
}
