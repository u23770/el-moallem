import { describe, it, expect } from 'vitest';
import { manualSaveResultMessage } from '../src/game/save/saveFeedback.js';

describe('manual save feedback', () => {
  it('shows success only after the save adapter confirms success', () => {
    expect(manualSaveResultMessage({ ok: true })).toBe('💾 اتحفظت! تقدمك بأمان في المتصفح ده.');
  });

  it('does not show a success message when persistence fails', () => {
    expect(manualSaveResultMessage({ ok: false, error: 'storage unavailable' })).toBeNull();
  });

  it('does not show a success message when no result is returned', () => {
    expect(manualSaveResultMessage(undefined)).toBeNull();
  });
});
