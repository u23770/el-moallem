// Central product catalogue. All prices/costs live here (single source of truth).
// cost = wholesale purchase cost (EGP), defaultPrice = fair/initial retail price (EGP).
export const PRODUCTS = [
  { id: 'chips',   nameAr: 'شيبس',        cost: 5,  defaultPrice: 7,  icon: 'bag',    color: '#e8a020', cold: false, descAr: 'كيس شيبس مقرمش، صاحب العيال الأول.' },
  { id: 'biscuit', nameAr: 'بسكويت',      cost: 4,  defaultPrice: 6,  icon: 'box',    color: '#c96f2e', cold: false, descAr: 'بسكويت الشاي بتاع كل يوم.' },
  { id: 'choco',   nameAr: 'شوكولاتة',    cost: 6,  defaultPrice: 10, icon: 'bar',    color: '#6b3a22', cold: false, descAr: 'قطعة شوكولاتة تفرّح القلب.' },
  { id: 'noodles', nameAr: 'مكرونة',      cost: 10, defaultPrice: 15, icon: 'box',    color: '#d8b84a', cold: false, descAr: 'كيس مكرونة نص كيلو للغدا.' },
  { id: 'tea',     nameAr: 'شاي',         cost: 15, defaultPrice: 22, icon: 'box',    color: '#7a4a21', cold: false, descAr: 'شاي العصاري على القهوة وفي البيوت.' },
  { id: 'sugar',   nameAr: 'سكر',         cost: 18, defaultPrice: 25, icon: 'bag',    color: '#e8e0cc', cold: false, descAr: 'كيلو سكر أبيض، أساسي في أي بيت.' },
  { id: 'oil',     nameAr: 'زيت',         cost: 35, defaultPrice: 48, icon: 'bottle', color: '#d8a018', cold: false, descAr: 'إزازة زيت طعام لتر.' },
  { id: 'cola',    nameAr: 'كولا ساقعة',  cost: 8,  defaultPrice: 12, icon: 'bottle', color: '#8c2820', cold: true,  descAr: 'كولا مثلجة من التلاجة. محتاجة ثلاجة!' },
  { id: 'juice',   nameAr: 'عصير',        cost: 7,  defaultPrice: 11, icon: 'box',    color: '#e07020', cold: true,  descAr: 'علبة عصير برتقال ساقعة. محتاجة ثلاجة!' },
];

export const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id) {
  return PRODUCT_MAP[id] ?? null;
}

/** Cold products require the refrigerator upgrade. */
export function isProductUnlocked(product, ownedUpgradeIds = []) {
  if (!product) return false;
  if (product.cold && !ownedUpgradeIds.includes('fridge')) return false;
  return true;
}

export function unlockedProducts(ownedUpgradeIds = []) {
  return PRODUCTS.filter((p) => isProductUnlocked(p, ownedUpgradeIds));
}

/** Price bounds: never free, never absurd. */
export function priceBounds(product) {
  return { min: 1, max: product.cost * 3 };
}
