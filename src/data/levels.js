// Exactly five story levels. Objectives use metric keys resolved in story.js.
export const LEVELS = [
  {
    level: 1, titleAr: 'أول خطوة', rewardCash: 30, rewardRep: 2,
    descAr: 'فتحت محلك الصغير في قلب الحارة. اتعلم تشتري من عم رجب وتبيع لأول زبون.',
    objectives: [
      { id: 'buy10', textAr: 'اشتري ١٠ وحدات بضاعة من تاجر الجملة', metric: 'totalPurchasedUnits', target: 10 },
      { id: 'serve1', textAr: 'اخدم أول زبون في المحل', metric: 'customersServed', target: 1 },
    ],
    introDialogue: [
      { speaker: 'ragab', text: 'أهلاً بيك في السوق يا ابن الحارة! معاك ٥٠٠ جنيه رأس مال… دي أمانة، كبرها بحكمة.' },
      { speaker: 'ragab', text: 'هات مني بضاعة بسعر الجملة، بسعّرها عندك بهامش معقول، وبع للزباين. الربح الحلال قريّب… بس الغلا بيطفش الناس!' },
      { speaker: 'player', text: 'توكلت على الله. المحل الصغير ده هيبقى علَم في الحارة، وحدة وحدة.' },
    ],
  },
  {
    level: 2, titleAr: 'زباين الحارة', rewardCash: 40, rewardRep: 2,
    descAr: 'عم سيد وأهل الحارة بقوا يعرفوك. السعر العادل والوش البشوش يبنوا سمعة ما تتشرىش بفلوس.',
    objectives: [
      { id: 'serve5', textAr: 'اخدم ٥ زباين (الإجمالي)', metric: 'customersServed', target: 5 },
      { id: 'rep55', textAr: 'اوصل بسمعتك إلى ٥٥ على الأقل', metric: 'reputation', target: 55 },
      { id: 'sayed_quest', textAr: 'أتم مهمة «طلبية عم سيد» من شاشة المهام', metric: 'questDone:q_sayed_favor', target: 1 },
    ],
    introDialogue: [
      { speaker: 'sayed', text: 'صباح الفل يا معلّم! أنا عم سيد… زبونك الدائم من النهاردة، لو الأسعار حنينة والبضاعة موجودة.' },
      { speaker: 'sayed', text: 'خلي بالك: كلمة زبون مبسوط بتتمشى في الحارة أسرع من التوك توك!' },
    ],
  },
  {
    level: 3, titleAr: 'السوق', rewardCash: 40, rewardRep: 2,
    descAr: 'علاقتك بعم رجب بتكبر، والرفوف لازم تبقى مليانة دايماً. الشراكة الصح نصف الشطارة.',
    objectives: [
      { id: 'buy40', textAr: 'اشتري ٤٠ وحدة بضاعة (الإجمالي)', metric: 'totalPurchasedUnits', target: 40 },
      { id: 'ragab_quest', textAr: 'أتم مهمة «اتفاق عم رجب» (١٥ شيبس من عنده)', metric: 'questDone:q_ragab_supply', target: 1 },
    ],
    introDialogue: [
      { speaker: 'ragab', text: 'كبرت يا معلّم! تعلّم دايماً: الرف الفاضي زبون ضايع. اشتري قبل ما تخلص، وعيني على عروضي الخاصة.' },
      { speaker: 'ragab', text: 'كل فترة بأنزّل سعر منتج جنيه… اللي يلقط العرض يكسب أكتر.' },
    ],
  },
  {
    level: 4, titleAr: 'المنافس', rewardCash: 50, rewardRep: 3,
    descAr: 'حسن صاحب المحل اللي في أول الشارع ملاحظ نجاحك… والتحدي بدأ. المنافسة النضيفة بالسعر العادل والسمعة.',
    objectives: [
      { id: 'serve12', textAr: 'اخدم ١٢ زبون (الإجمالي)', metric: 'customersServed', target: 12 },
      { id: 'rep60', textAr: 'اوصل بسمعتك إلى ٦٠ على الأقل', metric: 'reputation', target: 60 },
      { id: 'profit100', textAr: 'حقّق ١٠٠ جنيه صافي ربح تشغيل (راجع الحسابات)', metric: 'netProfit', target: 100 },
      { id: 'Hassan_quest', textAr: 'اكسب «تحدي المنافس» من Hassan', metric: 'questDone:q_hassan_challenge', target: 1 },
    ],
    introDialogue: [
      { speaker: 'Hassan', text: 'أهلاً أهلاً بالمنافس! أنا حسن… محلي في أول الشارع من زمان. سمعت كلام كتير عنك، وجاي أشوف الكلام ده صح ولا لا.' },
      { speaker: 'Mahmoud', text: 'المنافسة الشريفة يا ولاد: سعر عادل، بضاعة موجودة، وكلمة حلوة. اللي يخدم الناس أحسن هو اللي يكسب.' },
    ],
  },
  {
    level: 5, titleAr: 'معلّم الحارة', rewardCash: 80, rewardRep: 5,
    descAr: 'الحارة كلها بقى تعتمد عليك. طوّر محلك، وجهز عزومة الحارة الكبيرة، وخد اللقب اللي تستاهله.',
    objectives: [
      { id: 'serve20', textAr: 'اخدم ٢٠ زبون (الإجمالي)', metric: 'customersServed', target: 20 },
      { id: 'rep70', textAr: 'اوصل بسمعتك إلى ٧٠ على الأقل', metric: 'reputation', target: 70 },
      { id: 'upgrades2', textAr: 'اشتري تطويرين على الأقل للمحل', metric: 'upgradesOwned', target: 2 },
      { id: 'final_quest', textAr: 'أتم مهمة «عزومة الحارة الكبيرة»', metric: 'questDone:q_final_hara', target: 1 },
    ],
    introDialogue: [
      { speaker: 'umm_ahmed', text: 'الحارة بتجهز قعدة كبيرة الليلة يا ابني… وكلهم بيقولوا: «المعلّم هو اللي هيجهزلنا العزومة».' },
      { speaker: 'sayed', text: 'أثبت نفسك للآخر يا بطل… لقب معلّم الحارة ما بيتدّاش، بيتمشال ليك على الأكتاف!' },
    ],
  },
];

export const MAX_STORY_LEVEL = 5;
export function getLevel(n) { return LEVELS.find((l) => l.level === n) ?? null; }
