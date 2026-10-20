import { createInitialState } from '../state/createState.js';

// Storage interface (replaceable later with a cloud adapter):
//   get(key) -> string|null ; set(key, string) ; remove(key)
// Game logic never touches localStorage directly — only SaveManager + adapter.

export const SAVE_KEY = 'el-moallem-save-v1';
export const BACKUP_KEY = 'el-moallem-save-backup';
export const SCHEMA_VERSION = 1;

export class MemoryAdapter {
  constructor() { this.store = new Map(); }
  get(key) { return this.store.has(key) ? this.store.get(key) : null; }
  set(key, value) { this.store.set(key, String(value)); }
  remove(key) { this.store.delete(key); }
}

export class LocalStorageAdapter {
  constructor(storage = globalThis.localStorage) { this.storage = storage; }
  get(key) { try { return this.storage.getItem(key); } catch { return null; } }
  set(key, value) { try { this.storage.setItem(key, String(value)); return true; } catch { return false; } }
  remove(key) { try { this.storage.removeItem(key); } catch { /* ignore */ } }
}

function isValidStateShape(s) {
  return !!s && typeof s === 'object'
    && Number.isFinite(s.cash) && s.cash >= 0
    && typeof s.inventory === 'object' && s.inventory !== null
    && typeof s.prices === 'object' && s.prices !== null
    && Array.isArray(s.upgrades)
    && typeof s.stats === 'object' && s.stats !== null
    && Number.isInteger(s.storyLevel) && s.storyLevel >= 1;
}

/** Fill any missing/new fields from a fresh state (forward-compatible defaults). */
export function mergeWithDefaults(saved) {
  const fresh = createInitialState();
  const merged = { ...fresh, ...saved };
  merged.stats = { ...fresh.stats, ...(saved.stats ?? {}) };
  merged.stats.soldByProduct = { ...(saved.stats?.soldByProduct ?? {}) };
  merged.stats.purchasedByProduct = { ...(saved.stats?.purchasedByProduct ?? {}) };
  merged.quests = {
    active: { ...(saved.quests?.active ?? {}) },
    completed: [...(saved.quests?.completed ?? [])],
    claimed: [...(saved.quests?.claimed ?? [])],
  };
  merged.endless = { ...fresh.endless, ...(saved.endless ?? {}), quests: [...(saved.endless?.quests ?? [])] };
  merged.cafeHelp = { ...fresh.cafeHelp, ...(saved.cafeHelp ?? {}) };
  merged.settings = { ...fresh.settings, ...(saved.settings ?? {}) };
  merged.inventory = { ...fresh.inventory, ...(saved.inventory ?? {}) };
  merged.prices = { ...fresh.prices, ...(saved.prices ?? {}) };
  merged.processedActions = [...(saved.processedActions ?? [])];
  merged.claimedLevelRewards = [...(saved.claimedLevelRewards ?? [])];
  merged.seenLevelIntros = [...(saved.seenLevelIntros ?? [])];
  return merged;
}

/** Migration strategy: bump SCHEMA_VERSION and add a step here when shape changes. */
export function migrateSave(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  // v0 (hypothetical legacy): the state itself was stored without a wrapper.
  if (parsed.version === undefined && isValidStateShape(parsed)) {
    return { version: SCHEMA_VERSION, state: mergeWithDefaults(parsed), migratedFrom: 0 };
  }
  if (parsed.version === 1 && isValidStateShape(parsed.state)) {
    return { version: 1, state: mergeWithDefaults(parsed.state), migratedFrom: null };
  }
  // Unknown future versions: try to salvage if the inner state still validates.
  if (typeof parsed.version === 'number' && parsed.version > SCHEMA_VERSION && isValidStateShape(parsed.state)) {
    return { version: SCHEMA_VERSION, state: mergeWithDefaults(parsed.state), migratedFrom: parsed.version, downgraded: true };
  }
  return null;
}

export class SaveManager {
  constructor(adapter, key = SAVE_KEY) {
    this.adapter = adapter;
    this.key = key;
  }

  hasSave() { return this.adapter.get(this.key) != null; }

  save(state) {
    if (!isValidStateShape(state)) return { ok: false, error: 'حالة اللعبة غير صالحة للحفظ.' };
    const payload = JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), state });
    const ok = this.adapter.set(this.key, payload);
    return ok === false ? { ok: false, error: 'تعذّر الحفظ في مساحة تخزين المتصفح.' } : { ok: true };
  }

  /** Never throws. Corrupted data is reported, backed up, and NOT overwritten. */
  load() {
    let raw;
    try { raw = this.adapter.get(this.key); } catch { return { ok: false, reason: 'missing', state: null }; }
    if (raw == null || raw === '') return { ok: false, reason: 'missing', state: null };
    let parsed;
    try { parsed = JSON.parse(raw); } catch {
      try { this.adapter.set(BACKUP_KEY, raw); } catch { /* best effort backup */ }
      return { ok: false, reason: 'corrupted', state: null, backedUp: true };
    }
    const migrated = migrateSave(parsed);
    if (!migrated) {
      try { this.adapter.set(BACKUP_KEY, raw); } catch { /* best effort backup */ }
      return { ok: false, reason: 'corrupted', state: null, backedUp: true };
    }
    return { ok: true, state: migrated.state, migratedFrom: migrated.migratedFrom, downgraded: !!migrated.downgraded };
  }

  clear() { this.adapter.remove(this.key); this.adapter.remove(BACKUP_KEY); }
}

export function createBrowserSaveManager() {
  return new SaveManager(new LocalStorageAdapter());
}
