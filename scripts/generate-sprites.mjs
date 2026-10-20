// Exports the in-code pixel maps to standalone crisp SVG asset files.
import { mkdir, writeFile } from 'node:fs/promises';
import { SPRITE_MAPS, pixelMapToSvg, shopSceneSvg, alleySceneSvg } from '../src/ui/sprites.js';
import { PRODUCTS } from '../src/data/products.js';
import { createInitialState } from '../src/game/state/createState.js';

const root = new URL('..', import.meta.url).pathname;
await mkdir(`${root}assets/sprites`, { recursive: true });
await mkdir(`${root}assets/backgrounds`, { recursive: true });
await mkdir(`${root}assets/icons`, { recursive: true });

for (const [name, map] of Object.entries(SPRITE_MAPS)) {
  await writeFile(`${root}assets/sprites/${name}.svg`, pixelMapToSvg(map, { title: name }) + '\n');
  console.log(`sprite assets/sprites/${name}.svg`);
}

// Background plates using a mid-game demo state (stocked shelves + fridge visible).
const demo = createInitialState();
for (const p of PRODUCTS) demo.inventory[p.id] = 10;
demo.upgrades = ['shelves', 'fridge', 'sign', 'storefront'];
await writeFile(`${root}assets/backgrounds/shop-scene.svg`, shopSceneSvg(demo, PRODUCTS) + '\n');
const demoFresh = createInitialState();
await writeFile(`${root}assets/backgrounds/shop-scene-starter.svg`, shopSceneSvg(demoFresh, PRODUCTS.filter((p) => !p.cold)) + '\n');
await writeFile(`${root}assets/backgrounds/alley-scene.svg`, alleySceneSvg() + '\n');
console.log('backgrounds written to assets/backgrounds/');

// Product icons as standalone SVG files
const { productSprite } = await import('../src/ui/sprites.js');
for (const p of PRODUCTS) {
  const svg = productSprite(p).replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');
  await writeFile(`${root}assets/icons/${p.id}.svg`, svg + '\n');
}
console.log(`icons written to assets/icons/ (${PRODUCTS.length} products)`);
