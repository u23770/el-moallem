// Atomic, idempotent state transitions.
// Every mutating game action: clone -> guard duplicate actionId -> validate ALL -> apply.
// On failure the ORIGINAL state object is returned untouched (no partial writes).

const MAX_PROCESSED = 300;

export function beginTransaction(state, actionId) {
  if (!actionId || typeof actionId !== 'string') {
    return { ok: false, error: 'لازم كل إجراء يكون له معرّف فريد (حماية من التكرار).' };
  }
  if (state.processedActions?.includes(actionId)) {
    return { ok: false, error: 'الإجراء ده اتنفّذ قبل كده! (منع للتنفيذ المكرر)', duplicate: true };
  }
  const next = structuredClone(state);
  next.processedActions = [...(next.processedActions ?? []), actionId].slice(-MAX_PROCESSED);
  return { ok: true, next };
}

export function fail(state, error, extra = {}) {
  return { ok: false, state, error, ...extra };
}

export function succeed(next, message, extra = {}) {
  return { ok: true, state: next, message, ...extra };
}

let counter = 0;
/** Unique action id for UI-originated actions. */
export function newActionId(prefix = 'act') {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
