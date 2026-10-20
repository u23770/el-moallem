// Handcrafted story/side quests. Types:
// - deliver: hand over items from stock, paid rewardCash (covers cost + profit)
// - buyUnits: buy N units (of productId if set, otherwise any) after starting
// - serveCount: serve N customers after starting
// - fairServes: serve N customers at a fair price (ratio <= 1.1) after starting
export const QUESTS = [
  {
    id: 'q_kid_snack', giverId: 'Karim', minLevel: 1, type: 'deliver',
    titleAr: 'سناكس كريم الصغير', items: { chips: 2, choco: 1 }, rewardCash: 30, rewardRep: 2,
    descAr: 'كريم عايز يعزم صحابه بعد المدرسة: ٢ شيبس وشوكولاتة. سلّمهم له وخد ٣٠ جنيه.',
    dialogue: [
      { speaker: 'Karim', text: 'عمو المعلّم! صحابي جايين عندي بعد المدرسة وعايز أعزمهم… هاتلي ٢ شيبس وشوكولاتة، وماما هتدفع ٣٠ جنيه!' },
      { speaker: 'player', text: 'من عيني يا كريم. العزومة الأولى في الحارة بتبقى علينا إحنا أهلها.' },
    ],
  },
  {
    id: 'q_sayed_favor', giverId: 'sayed', minLevel: 2, type: 'deliver',
    titleAr: 'طلبية عم سيد', items: { tea: 1, biscuit: 2 }, rewardCash: 40, rewardRep: 3,
    descAr: 'عم سيد جايله ضيوف على العصرية: علبة شاي و٢ بسكويت. جاهزهم له مقابل ٤٠ جنيه.',
    dialogue: [
      { speaker: 'sayed', text: 'يا معلّم، ولاد أخويا جايين لي على العصرية. عايز شاي وبسكويت نشرب ونقعد قعدة حلوة… وهدفع فوق تمنهم كمان، الود واجبه أحسن.' },
      { speaker: 'player', text: 'البيت بيتك يا عم سيد. الطلبية هتبقى جاهزة على طول.' },
    ],
  },
  {
    id: 'q_cafe_run', giverId: 'umm_ahmed', minLevel: 2, type: 'deliver',
    titleAr: 'شكراً الحاجة أم أحمد', items: { sugar: 1, tea: 1 }, rewardCash: 55, rewardRep: 3,
    descAr: 'الحاجة أم أحمد عندها عقيقه صغيرة للجيران: كيس سكر وعلبة شاي. المقابل ٥٥ جنيه ودعوة حلوة.',
    dialogue: [
      { speaker: 'umm_ahmed', text: 'يا ابني، عندنا لمة جيران صغيرة وعايزين شاي بسكر يظبط الدماغ. هات لي سكر وشاي وربنا يزيدك من فضله.' },
      { speaker: 'player', text: 'حاضر يا حاجة. ودي عقيقه وأهل الحارة لبعضهم.' },
    ],
  },
  {
    id: 'q_ragab_supply', giverId: 'ragab', minLevel: 3, type: 'buyUnits', productId: 'chips', target: 15,
    titleAr: 'اتفاق عم رجب', rewardCash: 35, rewardRep: 2,
    descAr: 'عم رجب عايز يثبت إنك زبون جملة يعتمد عليه: اشتري منه ١٥ كيس شيبس وهيكافئك بـ٣٥ جنيه «عربون شراكة».',
    dialogue: [
      { speaker: 'ragab', text: 'اسمع يا معلّم… الشيبس عندي طازة والسوق طالب. اشتري مني ١٥ كيس، وهديك ٣٥ جنيه عربون ما بينا. الشغل شراكة مش مرة وخلاص.' },
      { speaker: 'player', text: 'اتفقنا يا عم رجب. الصاحب في السوق كنز.' },
    ],
  },
  {
    id: 'q_ragab_restock_big', giverId: 'ragab', minLevel: 3, type: 'buyUnits', productId: null, target: 30,
    titleAr: 'مخزون الزحمة', rewardCash: 40, rewardRep: 2,
    descAr: 'اشتري ٣٠ وحدة بضاعة من عم رجب بأي تشكيلة، وهيرجع لك ٤٠ جنيه تشجيعاً على إنك ما تخلّصش بضاعة من زبون.',
    dialogue: [
      { speaker: 'ragab', text: 'الزبون اللي ييجي وما يلاقيش طلبه بيزعل ومبيرجعش بسرعة. املى الرفوف يا معلّم: ٣٠ حاجة من عندي وأنا عليّا ٤٠ جنيه فوق البيعة.' },
      { speaker: 'player', text: 'تمام يا شيخ التجار. الرف المليان سر المحل الشاطر.' },
    ],
  },
  {
    id: 'q_hassan_challenge', giverId: 'Hassan', minLevel: 4, type: 'fairServes', target: 3,
    titleAr: 'تحدي المنافس', rewardCash: 40, rewardRep: 3,
    descAr: 'حسن بيتحداك تكسب قلوب ٣ زباين بأسعار عادلة (قريبة من السعر الطبيعي). الفايز بياخد ٤٠ جنيه… واحترام الحارة.',
    dialogue: [
      { speaker: 'Hassan', text: 'بتقول إنك معلّم؟ أثبت لي! اخدم ٣ زباين بأسعار عادلة وخليهم يخرجوا مبسوطين… لو قدرت، الأربعين جنيه دول بتوعك، وباعترف بيك قدام الحارة.' },
      { speaker: 'player', text: 'قبلت التحدي يا حسن. المنافسة الحلوة بتكبرنا احنا الاتنين.' },
    ],
  },
  {
    id: 'q_final_hara', giverId: 'umm_ahmed', minLevel: 5, type: 'deliver',
    titleAr: 'عزومة الحارة الكبيرة', items: { tea: 2, sugar: 1, oil: 1, biscuit: 3 }, rewardCash: 160, rewardRep: 8,
    descAr: 'أهل الحارة بيجهزوا قعدة كبيرة قدام القهوة: ٢ شاي، سكر، زيت، و٣ بسكويت من عندك. المقابل ١٦٠ جنيه… ولقب ما بيتنسي.',
    dialogue: [
      { speaker: 'umm_ahmed', text: 'يا ابني، الحارة كلها هتقعد الليلة قدام القهوة. العزومة ناقصها حاجات من عندك… جهزهم وخلي الليلة ليلة على حق.' },
      { speaker: 'sayed', text: 'ده مش طلب عادي يا معلّم… ده إثبات إن الحارة بقت تعتمد عليك.' },
      { speaker: 'player', text: 'أهل حارتي فوق راسي. الطلبية هتبقى جاهزة… دي ليلة العمر!' },
    ],
  },
];

export const QUEST_MAP = Object.fromEntries(QUESTS.map((q) => [q.id, q]));
export function getQuest(id) { return QUEST_MAP[id] ?? null; }
