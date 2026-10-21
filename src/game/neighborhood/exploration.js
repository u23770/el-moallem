export const LANDMARKS = Object.freeze([
  { id: 'wholesale', labelAr: 'عم رجب', icon: '🚚', x: 12, y: 84 },
  { id: 'shop', labelAr: 'محلك', icon: '🧺', x: 43, y: 82 },
  { id: 'rival', labelAr: 'حسن', icon: '🏪', x: 68, y: 82 },
  { id: 'cafe', labelAr: 'القهوة', icon: '☕', x: 88, y: 88 },
]);

export const PLAYER_START = Object.freeze({ x: 56, y: 90 });
export const INTERACTION_RADIUS = 12;

const WALK_BOUNDS = Object.freeze({ minX: 4, maxX: 96, minY: 78, maxY: 95 });

/** Move in percentage-space, clamped to the street so the player cannot leave the scene. */
export function movePlayer(position, dx, dy) {
  const currentX = Number.isFinite(position?.x) ? position.x : PLAYER_START.x;
  const currentY = Number.isFinite(position?.y) ? position.y : PLAYER_START.y;
  const stepX = Number.isFinite(dx) ? dx : 0;
  const stepY = Number.isFinite(dy) ? dy : 0;

  return {
    x: Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, currentX + stepX)),
    y: Math.max(WALK_BOUNDS.minY, Math.min(WALK_BOUNDS.maxY, currentY + stepY)),
  };
}

/** Return the closest accessible landmark when the player is within interaction radius. */
export function nearestLandmark(position, landmarks = LANDMARKS, radius = INTERACTION_RADIUS) {
  if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) return null;

  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;
  for (const landmark of landmarks) {
    if (!Number.isFinite(landmark?.x) || !Number.isFinite(landmark?.y)) continue;
    const distance = Math.hypot(position.x - landmark.x, position.y - landmark.y);
    if (distance < closestDistance) {
      closest = landmark;
      closestDistance = distance;
    }
  }

  if (!closest || closestDistance > radius) return null;
  return { ...closest, distance: closestDistance };
}
