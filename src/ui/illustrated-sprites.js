const PEOPLE = {
  player: { skin: '#bd8057', hair: '#2b201b', shirt: '#477b42', accent: '#e3b542', cap: '#d7a52c', apron: true },
  sayed: { skin: '#b77a53', hair: '#77736b', shirt: '#d7c5a0', accent: '#9b8868', beard: true, cap: '#f4e8d1' },
  ragab: { skin: '#a96c49', hair: '#4a3022', shirt: '#397046', accent: '#f4e8d1', beard: true, apron: true },
  Hassan: { skin: '#d49a6c', hair: '#2b211c', shirt: '#347ca1', accent: '#d8edf1' },
  umm_ahmed: { skin: '#bd8057', hair: '#292321', shirt: '#80518a', accent: '#d7b2d5', veil: true },
  Mahmoud: { skin: '#c88d60', hair: '#3c2b22', shirt: '#d6a52f', accent: '#f1e4c6', glasses: true, beard: true },
  Karim: { skin: '#d59b70', hair: '#38261e', shirt: '#bd4634', accent: '#347ca1', child: true },
};

const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function personSvg(id) {
  const p = PEOPLE[id] ?? PEOPLE.sayed;
  const headTop = p.child ? 20 : 15;
  const hair = p.veil ? '' : `<path d="M29 34 Q24 16 43 14 Q62 10 72 28 L70 39 L63 29 L57 25 L50 29 L40 25 L31 38Z" fill="${p.hair}" stroke="#38261e" stroke-width="2.4" stroke-linejoin="round"/>`;
  const veil = p.veil ? `<path d="M27 32 Q28 13 50 13 Q73 13 74 34 L79 76 Q68 87 50 88 Q32 87 21 76Z" fill="#282523" stroke="#171514" stroke-width="2.5"/>` : '';
  const cap = p.cap ? `<path d="M29 22 Q50 7 71 22 L70 27 L30 27Z" fill="${p.cap}" stroke="#593b28" stroke-width="2"/><path d="M25 25 Q50 20 75 25 L71 30 L29 30Z" fill="#f0d58c" stroke="#593b28" stroke-width="2"/>` : '';
  const face = `<path d="M32 ${headTop+9} Q31 ${headTop-1} 42 ${headTop} L58 ${headTop} Q69 ${headTop+2} 68 ${headTop+12} L65 45 Q60 58 50 59 Q40 58 35 45Z" fill="${p.skin}" stroke="#6e4933" stroke-width="2.2"/>`;
  const beard = p.beard ? `<path d="M39 47 Q44 43 49 47 Q52 43 61 47 Q58 54 51 51 L49 50 Q44 54 39 47Z" fill="${p.hair}"/><path d="M42 53 Q50 58 58 53" fill="none" stroke="${p.hair}" stroke-width="3.5" stroke-linecap="round"/>` : '';
  const glasses = p.glasses ? `<g fill="none" stroke="#3a3028" stroke-width="2"><rect x="34" y="33" width="14" height="10" rx="3"/><rect x="52" y="33" width="14" height="10" rx="3"/><path d="M48 36 L52 36"/></g>` : '';
  const apron = p.apron ? `<path d="M36 76 L64 76 L68 111 Q50 116 32 111Z" fill="#f0e2c6" stroke="#72583f" stroke-width="2"/><path d="M39 82 L61 82 M39 87 L61 87" stroke="#c3ad8c" stroke-width="1.5"/>` : '';
  const legs = `<path d="M35 109 L33 121 L45 121 L48 111 M52 111 L55 121 L67 121 L65 109" fill="#4a3024" stroke="#3b281e" stroke-width="2"/><path d="M30 119 Q38 116 47 120 L47 124 L28 124Z M53 120 Q62 116 70 119 L72 124 L53 124Z" fill="#30241e"/>`;
  const torso = `<path d="M31 61 Q50 55 69 61 L81 78 L74 111 Q50 119 26 111 L19 78Z" fill="${p.shirt}" stroke="#4b3528" stroke-width="2.6" stroke-linejoin="round"/><path d="M31 64 L22 80 L28 84 L38 71 M69 64 L78 80 L72 84 L62 71" fill="${p.shirt}" stroke="#4b3528" stroke-width="2.2" stroke-linejoin="round"/><path d="M42 62 L50 73 L58 62" fill="${p.accent}" stroke="#4b3528" stroke-width="1.7"/><path d="M50 73 L50 109" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 128" role="img" aria-label="${esc(id)}" class="character-art"><ellipse cx="50" cy="123" rx="27" ry="4" fill="#30251c" opacity=".14"/>${legs}${torso}${apron}${veil}${hair}${face}<path d="M35 31 Q50 24 65 31" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/><ellipse cx="42" cy="38" rx="2.6" ry="3.2" fill="#29211d"/><ellipse cx="58" cy="38" rx="2.6" ry="3.2" fill="#29211d"/><circle cx="43" cy="37" r=".9" fill="#fff8e8"/><circle cx="59" cy="37" r=".9" fill="#fff8e8"/><path d="M46 46 Q50 48 54 46" fill="none" stroke="#7e4d36" stroke-width="1.8" stroke-linecap="round"/>${glasses}${beard}${cap}<path d="M33 43 Q35 53 43 57" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/></svg>`;
}
export function characterSprite(spriteId, className = 'sprite') {
  return `<span class="${esc(className)}" aria-hidden="true">${personSvg(spriteId)}</span>`;
}
