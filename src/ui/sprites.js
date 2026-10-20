// Original pixel-art sprites defined as pixel maps -> crisp SVG rects.
// Same maps are exported to standalone .svg asset files by scripts/generate-sprites.mjs.

export const PALETTE = {
  S: '#d99b6b', D: '#a96742', H: '#302018', W: '#fff4df', K: '#24252b',
  G: '#4e7842', g: '#31572f', Y: '#e6b63c', R: '#b9462e', B: '#347ca1',
  b: '#7bb8d0', T: '#e3d0aa', t: '#b39a6b', M: '#762d31', P: '#77518c',
  O: '#e77c2d', A: '#96979a', C: '#f4e6cb', N: '#503322',
  L: '#e9c59a', Q: '#ffffff', X: '#4b3022', U: '#6e9b58', V: '#c6a0a0',
};

// Original hand-drawn pixel maps, 20 x 24. '.' stays transparent.
export const SPRITE_MAPS = {
  // عم سيد: white taqiya, grey moustache, beige galabeya and sandals.
  sayed: [
    '....................',
    '.......CCCCCC.......',
    '......CQQQQQQC......',
    '......CCCCCCCC......',
    '......SSSSSSSS......',
    '.....SSSSSSSSSS.....',
    '.....SKSSSSKSSS.....',
    '.....SSSSSSSSSS.....',
    '......SSSAAAS.......',
    '......SSSSSSS.......',
    '.....TTTTTTTTTT.....',
    '....TTTTTTTTTTTT....',
    '....TTtTTTTTTtTT....',
    '...STTTTTTTTTTTS....',
    '...STTTTTTTTTTTS....',
    '...STTTTTTTTTTTS....',
    '....TTTTTTTTTTTT....',
    '....TTTTTTTTTTTT....',
    '....TtTTTTTTtTTT....',
    '....TTTTTTTTTTTT....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....................',
  ],
  // عم رجب: bald wholesaler, green galabeya, white apron and sturdy shoes.
  ragab: [
    '....................',
    '......SSSSSSSS......',
    '.....SSSSSSSSSS.....',
    '....HSSSSSSSSSSH....',
    '....SKSSSSSSKSSS....',
    '.....SSSSSSSSSS.....',
    '......HHHHHHHH......',
    '......SSSSSSSS......',
    '....GGGGGGGGGGGG....',
    '...GGGGGGGGGGGGGG...',
    '...GGGGWWWWWWGGGG...',
    '..SGGGGWWWWWWGGGGS..',
    '..SGGGGWWWWWWGGGGS..',
    '...GGGGWWWWWWGGGG...',
    '....GGGGWWWWGGGG....',
    '....GGGGWWWWGGGG....',
    '....GGGGGGGGGGGG....',
    '....GGGGgGGgGGGG....',
    '....GGGGGGGGGGGG....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....................',
    '....................',
  ],
  // حسن المنافس: dark swept hair, blue shirt and visible collar.
  Hassan: [
    '....................',
    '.....HHHHHHHHHH.....',
    '....HHHHHHHHHHHH....',
    '....HHHHHHHHHHHH....',
    '....HSSSSSSSSSSH....',
    '.....SSSSSSSSSS.....',
    '.....SKSSSSKSSS.....',
    '.....SSSSSSSSSS.....',
    '......SSSHHSSS......',
    '......SSSSSSSS......',
    '....BBBBBBBBBBBB....',
    '...BBBBBBBBBBBBBB...',
    '...BBBbBBBBbBBBBB...',
    '..SB.BBBBBBBBBB.BS..',
    '..SB.BBBBBBBBBB.BS..',
    '...BBBBBBBBBBBBBB...',
    '....BBBBBBbBBBBB....',
    '....BBBBBBBBBBBB....',
    '....BBBBBB.BBBBB....',
    '....KKKKKK.KKKKK....',
    '....KKKKKK.KKKKK....',
    '...NNNNN....NNNNN...',
    '...NNNNN....NNNNN...',
    '....................',
  ],
  // الحاجة أم أحمد: black melaya, warm face and plum dress.
  umm_ahmed: [
    '....................',
    '.......KKKKKK.......',
    '......KKKKKKKK......',
    '.....KKKKKKKKKK.....',
    '....KKSSSSSSSSKK....',
    '....KKSSSSSSSSKK....',
    '....KKSKSSKSSSKK....',
    '....KKSSSSSSSSKK....',
    '....KKSSHHSSSSKK....',
    '.....KKKKKKKKKK.....',
    '....KKKKKKKKKKKK....',
    '...KKKKKKKKKKKKKK...',
    '...KKKKKKKKKKKKKK...',
    '..SKKKKKKKKKKKKKS...',
    '..SKKKKKKKKKKKKKS...',
    '...KKKKKKKKKKKKKK...',
    '....KKKKKKKKKKKK....',
    '....PPPPPPPPPPPP....',
    '...PPPPPPPPPPPPPP...',
    '...PPPPPPPPPPPPPP...',
    '...PPP.PPPP.PPPPP...',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....................',
  ],
  // أستاذ محمود: glasses, mustard sweater, collared shirt and dark trousers.
  Mahmoud: [
    '....................',
    '.....HHHHHHHHHH.....',
    '....HHHHHHHHHHHH....',
    '....HHSSSSSSSSHH....',
    '.....SSSSSSSSSS.....',
    '....KKKKSSKKKKSS....',
    '....SKSSSSSSSSKS....',
    '.....SSSSSSSSSS.....',
    '....YYYYYYYYYYYY....',
    '...YYYYYYYYYYYYYY...',
    '...YYYQYYYYYYQYYY...',
    '..SY.YYYYYYYYYY.YS..',
    '..SY.YYYYYYYYYY.YS..',
    '...YYYYYYYYYYYYYY...',
    '....YYYYYBBYYYYY....',
    '....YYYYBBBBYYYY....',
    '....YYYYYYYYYYYY....',
    '....YYYYgYYgYYYY....',
    '....NNNNNNNNNNNN....',
    '....NNNNNNNNNNNN....',
    '....NNNNN..NNNNN....',
    '....NNNNN..NNNNN....',
    '...NNNNNN..NNNNNN...',
    '....................',
  ],
  // كريم الصغير: shorter proportions, unruly hair, red tee and blue shorts.
  Karim: [
    '....................',
    '....................',
    '......HHHHHHHH......',
    '.....HHHHHHHHHH.....',
    '.....HSSSSSSSSSH....',
    '......SSSSSSSSSS....',
    '......SKSSSSKSSS....',
    '......SSSSSSSSSS....',
    '.......SSSHHSSS.....',
    '......SSSSSSSSSS....',
    '.....RRRRRRRRRRRR...',
    '....RRRRRRRRRRRRRR..',
    '....RRRRRYYRRRRRRR..',
    '...SRRRRRRRRRRRRRS..',
    '...SRRRRRRRRRRRRRS..',
    '....RRRRRRRRRRRRRR..',
    '.....BBBBBBBBBBBB...',
    '.....BBBBBBBBBBBB...',
    '.....BBB....BBBB....',
    '.....SSS....SSSS....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....................',
    '....................',
  ],
  // The player: green galabeya, gold cap and a small shop apron detail.
  player: [
    '....................',
    '.......YYYYYY.......',
    '......YYYYYYYY......',
    '......YYYYYYYY......',
    '......SSSSSSSS......',
    '.....SSSSSSSSSS.....',
    '.....SKSSSSKSSS.....',
    '.....SSSSSSSSSS.....',
    '......SSSHHSSS......',
    '......SSSSSSSS......',
    '....GGGGGGGGGGGG....',
    '...GGGGGGGGGGGGGG...',
    '...GGGgGGGGGgGGGG...',
    '..SG.GGGGGGGGGG.GS..',
    '..SG.GGGGWWGGGG.GS..',
    '...GGGGGGWWGGGGGG...',
    '....GGGGGGGGGGGG....',
    '....GGGGGGGGGGGG....',
    '....GGGGgGGgGGGG....',
    '....GGGGGGGGGGGG....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....NNNN....NNNN....',
    '....................',
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
const C = (x, y, w, h, fill, stroke = '#4a3020') =>
  R(x, y, w, h, fill) + R(x, y, w, 1, stroke) + R(x, y + h - 1, w, 1, stroke);

/** Egyptian corner-shop scene. Stock, fridge and renovations react to the actual game state. */
/** High-detail illustrated storefront scene with state-aware upgrade treatment. */
export function shopSceneSvg(state, productList) {
  const owned = new Set(state.upgrades);
  let s = `<image href="/assets/el-moallem-shop-scene.webp" x="0" y="0" width="320" height="316" preserveAspectRatio="xMidYMid slice"/>`;

  // The commissioned-style storefront artwork contains a display fridge. Until
  // the player buys that upgrade, replace its area with wooden shop crates.
  if (!owned.has('fridge')) {
    s += R(280, 171, 40, 118, '#d8bd92');
    s += R(280, 171, 40, 4, '#583921') + R(280, 171, 3, 118, '#583921');
    s += R(281, 218, 39, 3, '#583921');
    s += R(282, 221, 36, 29, '#b9783c') + R(284, 224, 32, 3, '#e0a15b');
    s += R(281, 250, 39, 3, '#583921');
    s += R(282, 253, 36, 30, '#99602f') + R(284, 256, 32, 3, '#c58b4d');
    s += R(298, 222, 2, 27, '#754822') + R(298, 254, 2, 28, '#754822');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 316" preserveAspectRatio="none" role="img" aria-label="واجهة محل بقالة مصرية مرسومة بتفاصيل، ${owned.has('fridge') ? 'وثلاجة العرض مضافة' : 'وصناديق البضاعة أمام المحل'}">${s}</svg>`;
}

export function alleySceneSvg() {
  let s = '';
  s += R(0, 0, 320, 200, '#f4dcae') + R(0, 0, 320, 45, '#f3c77f');
  // hazy sun and distant roofline.
  s += R(278, 8, 25, 25, '#ffe8a0') + R(284, 2, 13, 37, '#ffe8a0');
  s += R(0, 40, 320, 8, '#a97849');
  // Three close-set buildings, plaster trim and roof parapets.
  s += R(5, 42, 88, 116, '#d4ad78') + R(5, 42, 88, 5, '#8e6742');
  s += R(99, 27, 100, 131, '#c8a16b') + R(99, 27, 100, 6, '#8a6040');
  s += R(204, 45, 111, 113, '#e1bf89') + R(204, 45, 111, 5, '#a77b4d');
  // Wall scuffs and simple painted floor levels.
  for (const [x,y,w] of [[12,86,10],[75,120,8],[109,72,12],[179,113,9],[287,86,12],[221,111,8]]) s += R(x,y,w,2,'#b8915d');
  const win = (x, y, glass = '#568ba5') => {
    s += R(x - 3, y, 20, 22, '#7c4f2e') + R(x, y + 2, 14, 16, '#4c3527') + R(x + 2, y + 4, 10, 12, glass);
    s += R(x + 6, y + 4, 2, 12, '#4c3527') + R(x + 2, y + 9, 10, 2, '#4c3527');
    s += R(x - 5, y + 21, 24, 3, '#4b3020') + R(x - 5, y + 14, 24, 2, '#4b3020');
    for (const dx of [-4, 3, 10, 17]) s += R(x + dx, y + 14, 2, 8, '#4b3020');
    s += R(x - 3, y - 2, 20, 2, '#f1d8ac');
  };
  [[18,58,'#477f99'],[56,58,'#8ab6c8'],[18,100,'#8ab6c8'],[56,100,'#477f99'],
   [112,45,'#8ab6c8'],[154,45,'#477f99'],[112,88,'#477f99'],[154,88,'#8ab6c8'],
   [219,61,'#8ab6c8'],[263,61,'#477f99'],[219,102,'#477f99'],[263,102,'#8ab6c8']]
    .forEach(([x,y,c]) => win(x,y,c));
  // Satellite dishes, water tanks and laundry make the skyline unmistakably local.
  s += R(28, 34, 22, 4, '#5b4936') + R(33, 26, 13, 8, '#77736b') + R(38, 21, 2, 8, '#5b4936');
  s += R(137, 15, 26, 12, '#6f7775') + R(141, 11, 18, 4, '#848a85') + R(146, 8, 8, 3, '#5b4936');
  s += R(233, 34, 20, 11, '#7d827c') + R(238, 30, 11, 4, '#93978d');
  // Laundry line with varied fabric and visible pegs.
  s += R(84, 69, 130, 2, '#4b3020');
  for (const [x,w,h,c] of [[94,13,15,'#b94f32'],[119,15,12,'#fff0d6'],[147,13,17,'#347ca1'],[173,16,13,'#e6b63c'],[198,10,15,'#77518c']]) {
    s += R(x + 4, 67, 2, 3, '#4b3020') + R(x, 71, w, h, c) + R(x + 2, 73, 2, h - 4, '#ffffff', '.25');
  }
  // Ground-floor doors and a tiny corner kiosk with striped awning.
  s += R(28, 132, 20, 26, '#674122') + R(43, 145, 3, 3, '#e6b63c') + R(31, 137, 13, 2, '#8d6138');
  s += R(130, 131, 20, 27, '#31572f') + R(145, 145, 3, 3, '#e6b63c') + R(133, 136, 13, 2, '#54824a');
  for (let x = 213; x < 293; x += 16) s += R(x, 126, 8, 8, '#b94f32') + R(x + 8, 126, 8, 8, '#fff0d6');
  s += R(218, 134, 70, 24, '#9b693b') + R(223, 139, 60, 15, '#5b3823');
  // Street tiles, curb, drain, café table, metal chairs and tea glass.
  s += R(0, 158, 320, 42, '#b28d5a') + R(0, 158, 320, 4, '#d8b77d');
  for (let x = 0; x < 320; x += 26) s += R(x, 177, 20, 2, '#96754a');
  s += R(20, 184, 18, 3, '#795d3d') + R(27, 181, 3, 9, '#795d3d');
  s += R(24, 151, 4, 25, '#4b3020') + R(18, 141, 16, 6, '#4b3020') + R(21, 146, 10, 8, '#ffe6a0');
  s += R(263, 168, 35, 4, '#fff0d6') + R(276, 172, 4, 12, '#5d4632') + R(267, 173, 4, 9, '#5d4632') + R(290, 173, 4, 9, '#5d4632');
  s += R(246, 166, 10, 14, '#347ca1') + R(302, 166, 10, 14, '#347ca1') + R(272, 162, 6, 6, '#e6b63c') + R(273, 163, 4, 3, '#fff0d6');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" shape-rendering="crispEdges" class="scene-svg" aria-hidden="true">${s}</svg>`;
}
