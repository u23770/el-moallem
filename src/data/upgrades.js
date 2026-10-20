// Shop upgrades: price, capacity/reputation effects. All tuning lives here.
export const UPGRADES = [
  {
    id: 'sign', nameAr: 'يافطة جديدة', price: 200, icon: 'sign',
    descAr: 'يافطة «بقالة المعلّم» بخط عريض وألوان تفرّح. الزباين هتشوفك من أول الشارع.',
    effectAr: '+٥ سمعة فوراً، ورضا الزباين بيزيد (+١ مع كل طلب مبهج).',
    capacityBonus: 0, reputationBonus: 5,
  },
  {
    id: 'shelves', nameAr: 'رفوف إضافية', price: 300, icon: 'shelves',
    descAr: 'رفوف خشب جديدة على الحيطة، البضاعة هتترتب والزبون هيلاقي طلبه بسرعة.',
    effectAr: '+٤٠ وحدة سعة تخزين.',
    capacityBonus: 40, reputationBonus: 0,
  },
  {
    id: 'fridge', nameAr: 'ثلاجة عرض', price: 450, icon: 'fridge',
    descAr: 'ثلاجة إزاز بتلمع. الكولا والعصير الساقع هيبقوا نجوم المحل في الحر.',
    effectAr: 'بتفتح منتجات ساقعة (كولا وعصير) و +٢٠ سعة تخزين.',
    capacityBonus: 20, reputationBonus: 0,
  },
  {
    id: 'storage', nameAr: 'مخزن أكبر', price: 600, icon: 'storage',
    descAr: 'أوضة صغيرة ورا المحل هنرتّب فيها الكراتين. وداعاً لكسرة «خلصت البضاعة».',
    effectAr: '+٨٠ وحدة سعة تخزين.',
    capacityBonus: 80, reputationBonus: 0,
  },
  {
    id: 'storefront', nameAr: 'واجهة مجدّدة', price: 800, icon: 'storefront',
    descAr: 'دهان جديد وتنده ملونة ولمبة حلوة. المحل هيبقى علَم من أعلام الحارة.',
    effectAr: '+١٠ سمعة فوراً، والزباين بتستحمل الأسعار العالية بنسبة أقل ضرراً لسمعتك.',
    capacityBonus: 0, reputationBonus: 10,
  },
];

export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
export function getUpgrade(id) { return UPGRADE_MAP[id] ?? null; }
export const BASE_CAPACITY = 60;
export function capacityFor(ownedIds = []) {
  return BASE_CAPACITY + ownedIds.reduce((sum, id) => sum + (UPGRADE_MAP[id]?.capacityBonus ?? 0), 0);
}
