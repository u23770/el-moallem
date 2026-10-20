import { unlockedProducts } from '../../data/products.js';
import { CHARACTERS, pickLine } from '../../data/characters.js';

// Customers who can appear at the counter (ragab sells to you, he does not queue).
const SHOPPERS = CHARACTERS.filter((c) => c.id !== 'ragab');

/** Generate a deterministic-when-seeded next customer order. */
export function generateOrder(state, rng = Math.random) {
  const available = unlockedProducts(state.upgrades);
  const character = SHOPPERS[Math.floor(rng() * SHOPPERS.length) % SHOPPERS.length];
  const itemCount = 1 + Math.floor(rng() * 3); // 1..3 distinct products
  const pool = [...available];
  const items = {};
  for (let i = 0; i < itemCount && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length) % pool.length;
    const [product] = pool.splice(idx, 1);
    items[product.id] = 1 + Math.floor(rng() * 3); // 1..3 units
  }
  return {
    id: state.orderCounter + 1,
    characterId: character.id,
    items,
    greeting: pickLine(character.greetings, rng),
  };
}

/** Pretty Arabic summary of order items using a product lookup fn. */
export function orderTotal(state, order) {
  return Object.entries(order.items).reduce((sum, [id, qty]) => sum + (state.prices[id] ?? 0) * qty, 0);
}

export function orderShortages(state, order) {
  return Object.entries(order.items)
    .filter(([id, qty]) => (state.inventory[id] ?? 0) < qty)
    .map(([id, qty]) => ({ productId: id, needed: qty, have: state.inventory[id] ?? 0 }));
}

export function canFulfill(state, order) {
  return orderShortages(state, order).length === 0;
}
