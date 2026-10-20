// Original pixel-art sprites defined as pixel maps -> crisp SVG rects.
// Same maps are exported to standalone .svg asset files by scripts/generate-sprites.mjs.

export const PALETTE = {
  S: '#e0a878', D: '#b87f4e', H: '#33241c', W: '#f4ead8', K: '#2b2b33',
  G: '#5a7d4a', g: '#3e5c33', Y: '#d9a821', R: '#b3552f', B: '#3e6d96',
  b: '#7fa8c9', T: '#d8c8a3', t: '#b3a077', M: '#7a2f2f', P: '#6b4a7a',
  O: '#e07a2e', A: '#9a9aa2', C: '#efe6d0', N: '#4a3423',
};

// Each map: 16 wide x 20 tall (Karim deliberately shorter). '.' = transparent.
export const SPRITE_MAPS = {
  // Sayed: elder, white taqiya cap, grey moustache, beige galabeya
  sayed: [
    '................',
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....SSSSSSSS....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....AAAAAA.....',
    '......SSSS......',
    '....TTTTTTTT....',
    '...TTTTTTTTTT...',
    '...TTtTTTTtTT...',
    '..STTTTTTTTS....',
    '..STTTTTTTT.....',
    '...TTTTTTTT.....',
    '...TTTTTTTT.....',
    '...tTTTTTTt.....',
    '...TTTTTTTT.....',
    '...TTT..TTT.....',
    '..NNN....NNN....',
    '................',
  ],
  // Ragab: bald wholesaler, green shirt, white apron, big smile energy
  ragab: [
    '................',
    '.....SSSSSS.....',
    '....SSSSSSSS....',
    '...HSSSSSSSH....',
    '...SKSSSSKS.....',
    '....SSSSSSSS....',
    '.....HHHHHH.....',
    '.....SSSSSS.....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGWWWWWWWWGG..',
    '.SG.WWWWWWWW.GS.',
    '.S..WWWWWWWW..S.',
    '....WWWWWWWW....',
    '....WWWWWWWW....',
    '...KKKKKKKKK....',
    '...KKK..KKKK....',
    '...KK....KKK....',
    '..NNN.....NNN...',
    '................',
  ],
  // Hassan: young rival, dark hair, blue shirt
  Hassan: [
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HSSSSSSSSH...',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '....SSSHHSSS....',
    '......SSSS......',
    '...BBBBBBBBBB...',
    '..BBBBBBBBBBBB..',
    '..BBBbBBBBbBBB..',
    '.SB.BBBBBBBB.BS.',
    '.S..BBBBBBBB..S.',
    '....BBBBBBBB....',
    '...KKKKKKKKK....',
    '...KKKKKKKKK....',
    '...KKK..KKKK....',
    '...KK....KKK....',
    '..WWW.....WWW...',
    '................',
  ],
  // Umm Ahmed: black melaya/hijab, kind face, purple dress hem
  umm_ahmed: [
    '................',
    '.....KKKKKK.....',
    '....KKKKKKKK....',
    '...KKSSSSSSKK...',
    '...KKSKSSKSKK...',
    '...KKSSSSSSKK...',
    '...KKSSHHSSKK...',
    '....KKKKKKKK....',
    '...KKKKKKKKK....',
    '..KKKKKKKKKKK...',
    '..KKKKKKKKKKK...',
    '.SKKKKKKKKKKKS..',
    '.S.KKKKKKKKKK.S.',
    '...KKKKKKKKK....',
    '...PPPPPPPPP....',
    '...PPPPPPPPP....',
    '..PPPPPPPPPPP...',
    '..PPP.PPP.PPP...',
    '..NNN.....NNN...',
    '................',
  ],
  // Mahmoud: teacher with glasses, mustard sweater
  Mahmoud: [
    '................',
    '....HHHHHHHH....',
    '...HHSSSSSSHH...',
    '....SSSSSSSS....',
    '....KKKKKKKK....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....SSSSSS.....',
    '...YYYYYYYYYY...',
    '..YYYYYYYYYYYY..',
    '..YYYWYYYYWYYY..',
    '.SY.YYYYYYYY.YS.',
    '.S..YYYYYYYY..S.',
    '....YYYYYYYY....',
    '...NNNNNNNNN....',
    '...NNNNNNNNN....',
    '...NNN..NNNN....',
    '...NN....NNN....',
    '..KKK.....KKK...',
    '................',
  ],
  // Karim: small kid, red shirt, blue shorts (shorter sprite)
  Karim: [
    '................',
    '................',
    '................',
    '................',
    '....HHHHHHH.....',
    '...HHHHHHHHH....',
    '...SSSSSSSSS....',
    '...SKSSSSKS.....',
    '....SSSSSSS.....',
    '...SSSHHHSSS....',
    '...RRRRRRRRR....',
    '..RRRRRRRRRRR...',
    '.SRRRRRRRRRR.S..',
    '.S.RRRRRRRR..S..',
    '...BBBBBBBB.....',
    '...BBB..BBB.....',
    '...SS....SS.....',
    '...SS....SS.....',
    '..RRR....RRR....',
    '................',
  ],
  // The player: El Moallem behind his counter, green galabeya, mustard cap
  player: [
    '................',
    '.....YYYYYY.....',
    '....YYYYYYYY....',
    '....SSSSSSSS....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....HHHHHH.....',
    '......SSSS......',
    '...GGGGGGGGG....',
    '..GGGGGGGGGGG...',
    '..GgGGGGGGgGG...',
    '.SG.GGGGGGGG.GS.',
    '.S..GGGGGGGG..S.',
    '....GGGGGGGG....',
    '....GGGGGGGG....',
    '....gGGGGGGg....',
    '....GGGGGG......',
    '....GGG.GGG.....',
    '..NNN....NNN....',
    '................',
  ],
};

export function pixelMapToSvg(map, { title = '' } = {}) {
  const h = map.length;
  const w = Math.max(...map.map((r) => r.length));
  let rects = '';
  for (let y = 0; y < h; y++) {
    const row = map[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || !PALETTE[ch]) { x++; continue; }
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${PALETTE[ch]}"/>`;
      x += run;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img" aria-label="${title}">${rects}</svg>`;
}

export function characterSprite(spriteId, className = 'sprite') {
  const map = SPRITE_MAPS[spriteId] ?? SPRITE_MAPS.sayed;
  return `<span class="${className}" aria-hidden="true">${pixelMapToSvg(map)}</span>`;
}

/** Small pixel product icon on a 12x12 grid, by packaging type. */
export function productSprite(product, className = 'product-icon') {
  const c = product.color;
  const dark = '#2b2118';
  let body = '';
  if (product.icon === 'bottle') {
    body = `<rect x="5" y="0" width="2" height="2" fill="${dark}"/><rect x="4" y="2" width="4" height="2" fill="${c}"/><rect x="3" y="4" width="6" height="8" fill="${c}"/><rect x="3" y="7" width="6" height="2" fill="#f4ead8"/><rect x="4" y="5" width="1" height="6" fill="#ffffff" opacity=".55"/>`;
  } else if (product.icon === 'bag') {
    body = `<rect x="3" y="1" width="6" height="1" fill="${dark}"/><rect x="2" y="2" width="8" height="9" fill="${c}"/><rect x="2" y="5" width="8" height="2" fill="#f4ead8"/><rect x="4" y="8" width="4" height="2" fill="${dark}" opacity=".35"/><rect x="3" y="3" width="1" height="7" fill="#ffffff" opacity=".5"/>`;
  } else if (product.icon === 'bar') {
    body = `<rect x="1" y="4" width="10" height="5" fill="${c}"/><rect x="1" y="4" width="2" height="5" fill="#d9a821"/><rect x="9" y="4" width="2" height="5" fill="#d9a821"/><rect x="4" y="6" width="4" height="1" fill="#f4ead8"/>`;
  } else { // box
    body = `<rect x="2" y="2" width="8" height="9" fill="${c}"/><rect x="2" y="2" width="8" height="2" fill="${dark}" opacity=".3"/><rect x="4" y="6" width="4" height="3" fill="#f4ead8"/><rect x="5" y="7" width="2" height="1" fill="${c}"/>`;
  }
  return `<span class="${className}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${body}</svg></span>`;
}

const R = (x, y, w, h, fill, op = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;

/** Shop interior scene (320x190). Shelves visually fill with real stock levels. */
export function shopSceneSvg(state, productList) {
  const owned = new Set(state.upgrades);
  let s = '';
  // wall + worn plaster patches + brick strip
  s += R(0, 0, 320, 190, '#e6cf9f');
  s += R(0, 0, 320, 26, '#caa26a');
  s += R(14, 34, 34, 20, '#dcc08d') + R(268, 40, 30, 16, '#dcc08d') + R(150, 30, 22, 12, '#dcc08d');
  for (let x = 0; x < 320; x += 16) s += R(x, 158, 14, 6, '#b3552f') + R(x + 8, 166, 14, 6, '#a04a28');
  s += R(0, 172, 320, 18, '#8a6a44'); // floor
  for (let x = 0; x < 320; x += 20) s += R(x, 172, 2, 18, '#75572f');
  // awning stripes (green/cream) — nicer after storefront renovation
  const awnA = owned.has('storefront') ? '#b3552f' : '#5a7d4a';
  for (let x = 0; x < 320; x += 20) s += R(x, 24, 10, 8, awnA) + R(x + 10, 24, 10, 8, '#f4ead8');
  // sign board (Arabic text is an HTML overlay in the app)
  s += R(96, 2, 128, 20, owned.has('sign') || owned.has('storefront') ? '#3e5c33' : '#8a6a44');
  s += R(100, 5, 120, 14, owned.has('sign') || owned.has('storefront') ? '#f4ead8' : '#e6cf9f');
  // hanging lamps
  for (const lx of [52, 160, 268]) {
    s += R(lx, 26, 2, 12, '#2b2118') + R(lx - 4, 38, 10, 4, '#d9a821') + R(lx - 2, 42, 6, 5, '#ffe9a8');
  }
  // shelves (2 rows; third row appears with extra-shelves upgrade)
  const shelfRows = owned.has('shelves') ? [58, 88, 118] : [66, 102];
  const shelfX = 16, shelfW = 196;
  for (const y of shelfRows) {
    s += R(shelfX, y + 16, shelfW, 4, '#7c4a26') + R(shelfX, y + 20, shelfW, 2, '#5d371b');
  }
  // products on shelves: up to N pixel blocks per product based on real qty
  let slot = 0;
  const perRow = 12;
  for (const p of productList) {
    const qty = state.inventory[p.id] ?? 0;
    const blocks = Math.max(0, Math.min(4, Math.ceil(qty / 4)));
    for (let i = 0; i < blocks; i++) {
      const row = Math.min(shelfRows.length - 1, Math.floor(slot / perRow));
      const x = shelfX + 6 + (slot % perRow) * 16;
      const y = shelfRows[row] + 4;
      s += R(x, y, 9, 12, p.color) + R(x, y + 5, 9, 3, '#f4ead8') + R(x + 1, y + 1, 2, 10, '#ffffff', '.45');
      slot++;
    }
  }
  if (slot === 0) s += R(shelfX + 8, shelfRows[0] + 8, 40, 8, '#c9ae77'); // bare shelf hint
  // right side: fridge (upgrade) or crates
  if (owned.has('fridge')) {
    s += R(228, 52, 62, 104, '#7fa8c9') + R(232, 56, 54, 96, '#cfe3f2') + R(232, 56, 54, 8, '#3e6d96');
    const coldCount = Math.min(9, (state.inventory.cola ?? 0) + (state.inventory.juice ?? 0));
    for (let i = 0; i < coldCount; i++) {
      const x = 236 + (i % 3) * 16, y = 74 + Math.floor(i / 3) * 26;
      s += R(x, y, 7, 16, i % 2 ? '#e07020' : '#8c2820') + R(x, y + 6, 7, 3, '#f4ead8');
    }
    s += R(234, 88, 50, 2, '#7fa8c9') + R(234, 114, 50, 2, '#7fa8c9') + R(282, 92, 3, 26, '#2b2118');
  } else {
    for (const [x, y] of [[236, 128], [256, 128], [246, 106]]) {
      s += R(x, y, 24, 20, '#a06a35') + R(x, y, 24, 4, '#7c4a26') + R(x + 3, y + 8, 18, 3, '#7c4a26');
    }
    s += R(226, 66, 70, 30, '#dcc08d') + R(232, 72, 58, 18, '#c9ae77'); // empty wall space waiting for a fridge
  }
  // plastic chair + scale + counter
  s += R(22, 140, 4, 18, '#3e6d96') + R(38, 140, 4, 18, '#3e6d96') + R(20, 138, 24, 5, '#7fa8c9') + R(20, 124, 24, 5, '#7fa8c9') + R(20, 124, 4, 14, '#3e6d96') + R(40, 124, 4, 14, '#3e6d96');
  s += R(120, 128, 150, 10, '#7c4a26') + R(120, 138, 150, 26, '#8a5a30') + R(124, 142, 142, 3, '#6e4521') + R(124, 150, 142, 3, '#6e4521');
  s += R(238, 114, 22, 14, '#9a9aa2') + R(246, 106, 6, 8, '#6f6f78') + R(238, 102, 22, 4, '#d9a821'); // weighing scale
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" shape-rendering="crispEdges" class="scene-svg" aria-hidden="true">${s}</svg>`;
}

/** Alley / neighborhood backdrop (320x200). Buildings, balconies, cafe corner. */
export function alleySceneSvg() {
  let s = '';
  s += R(0, 0, 320, 200, '#f0d9a8'); // warm afternoon sky
  s += R(0, 0, 320, 46, '#eec27e') + R(282, 10, 20, 20, '#ffdf7e') + R(286, 6, 12, 28, '#ffdf7e');
  // back buildings
  s += R(6, 40, 86, 118, '#d9b57e') + R(100, 26, 96, 132, '#cfa96d') + R(204, 44, 110, 114, '#e0bd85');
  // windows with shutters + railed balconies + doors at street level
  const win = (x, y, c = '#3e6d96') =>
    R(x - 3, y, 3, 18, '#7a4a26') + R(x + 14, y, 3, 18, '#7a4a26')           // shutters
    + R(x, y, 14, 18, '#5d4632') + R(x + 2, y + 2, 10, 14, c)
    + R(x + 6, y + 2, 2, 14, '#5d4632')                                       // window mullion
    + R(x - 4, y + 19, 22, 3, '#4a3320')                                      // balcony slab
    + R(x - 4, y + 12, 22, 2, '#4a3320')                                      // railing top
    + R(x - 4, y + 12, 2, 8, '#4a3320') + R(x + 4, y + 12, 2, 8, '#4a3320')
    + R(x + 12, y + 12, 2, 8, '#4a3320') + R(x + 16, y + 12, 2, 8, '#4a3320');
  s += win(20, 56) + win(56, 56, '#7fa8c9') + win(20, 98, '#7fa8c9') + win(56, 98);
  s += win(116, 44) + win(152, 44, '#7fa8c9') + win(116, 86, '#7fa8c9') + win(152, 86);
  s += win(222, 60, '#7fa8c9') + win(262, 60) + win(222, 100) + win(262, 100, '#7fa8c9');
  // laundry line
  s += R(90, 66, 120, 2, '#5d4632') + R(102, 68, 12, 14, '#b3552f') + R(126, 68, 12, 12, '#f4ead8') + R(150, 68, 12, 15, '#3e6d96') + R(174, 68, 12, 12, '#d9a821');
  // doors + a small shop awning at street level
  s += R(30, 132, 18, 26, '#6e4521') + R(44, 144, 3, 3, '#d9a821');
  s += R(132, 132, 18, 26, '#3e5c33') + R(146, 144, 3, 3, '#d9a821');
  for (let x = 214; x < 294; x += 16) s += R(x, 126, 8, 7, '#b3552f') + R(x + 8, 126, 8, 7, '#f4ead8');
  s += R(222, 134, 64, 24, '#8a5a30') + R(226, 138, 56, 16, '#5d371b');
  // street + cafe chairs/table + street lamp
  s += R(0, 158, 320, 42, '#b08d5a');
  for (let x = 0; x < 320; x += 26) s += R(x, 176, 20, 3, '#96754a');
  s += R(24, 150, 4, 26, '#2b2118') + R(18, 140, 16, 6, '#2b2118') + R(21, 146, 10, 8, '#ffe9a8');
  s += R(262, 168, 34, 4, '#f4ead8') + R(276, 172, 4, 12, '#5d4632'); // cafe table
  s += R(246, 166, 10, 14, '#3e6d96') + R(302, 166, 10, 14, '#3e6d96');
  s += R(272, 162, 6, 6, '#d9a821'); // tea glass catching light
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" shape-rendering="crispEdges" class="scene-svg" aria-hidden="true">${s}</svg>`;
}
