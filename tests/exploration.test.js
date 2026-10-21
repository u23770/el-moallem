import { describe, it, expect } from 'vitest';
import { LANDMARKS, movePlayer, nearestLandmark } from '../src/game/neighborhood/exploration.js';

describe('neighborhood exploration', () => {
  it('moves in the requested direction by a predictable step', () => {
    expect(movePlayer({ x: 50, y: 88 }, 4, -2)).toEqual({ x: 54, y: 86 });
  });

  it('keeps the player inside the walkable street area', () => {
    expect(movePlayer({ x: 94, y: 94 }, 10, 10)).toEqual({ x: 96, y: 95 });
    expect(movePlayer({ x: 6, y: 79 }, -10, -10)).toEqual({ x: 4, y: 78 });
  });

  it('returns the nearest landmark only while inside interaction range', () => {
    const shop = LANDMARKS.find((item) => item.id === 'shop');
    expect(nearestLandmark({ x: shop.x, y: shop.y })?.id).toBe('shop');
    expect(nearestLandmark({ x: 96, y: 78 })).toBeNull();
  });

  it('does not return a locked or missing landmark unless it is supplied', () => {
    const publicLandmarks = LANDMARKS.filter((item) => item.id !== 'rival');
    expect(nearestLandmark({ x: 69, y: 82 }, publicLandmarks)).toBeNull();
  });
});
