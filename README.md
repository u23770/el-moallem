# المعلّم (El Moallem) 🧺

لعبة متصفح عربية كاملة (Mobile-first, RTL): تدير محل بقالة صغير في حارة مصرية
شعبية — اشتري من عم رجب تاجر الجملة، سعّر، اخدم زباين مثل عم سيد، نفّذ مهام
أهل الحارة، نافس حسن بشرف، طوّر محلك، وخلال **٥ مراحل قصة** ابقى **«معلّم
الحارة»**، وبعدها بيفتح **اللعب الحر** بمهام متجددة من قوالب بيانات.

Plain HTML/CSS/JS + Vite. No backend, no accounts, no ads/IAP, no external
assets or fonts. All pixel art is original, generated from in-code pixel maps
rendered as crisp SVG (`shape-rendering="crispEdges"` + `image-rendering:
pixelated`) and also exported to `assets/` as real `.svg` files.

---

## تشغيل اللعبة (Development)

```bash
npm install
npm run dev        # http://localhost:5173  (Vite, host 0.0.0.0)
```

## الاختبارات (Tests)

```bash
npm test           # Vitest — 40 tests, node environment
```

آخر تشغيل فعلي (٢٠٢٦-١٠-٢٠): **3 test files, 40/40 passed** وتغطي:

1. رصيد البداية (٥٠٠ جنيه) والحالة الأولية
2. الشراء مع/من غير رصيد كافٍ، السعة، وقفل المنتجات الساقعة قبل الثلاجة
3. البيع وتحديث الكاش والمخزون ذرّياً (atomic)
4. رفض بيع كميات غير متاحة
5. هامش الربح وصافي الربح (Revenue − COGS − Operating expenses)
6. منع الإجراءات المكررة (actionId) ومكافآت المهام المكررة
7. القدرة على دفع ثمن التطويرات وبقاؤها
8. السمعة (حدود ٠–١٠٠) وتقدم القصة بدون تخطي أهداف
9. فتح اللعب الحر بعد المرحلة الخامسة فقط — يشمل **محاكاة لعب كاملة** من
   المرحلة ١ حتى لقب «معلّم الحارة» باستراتيجية سعر عادل
10. حفظ/تحميل الحالة كاملة عبر `SaveManager`
11. التعامل الآمن مع الحفظ الناقص/التالف/القديم (v0→v1 migration + نسخة احتياطية)
12. تدقيق تدفقات المتصفح والتخطيط بمقاس موبايل (390×844) وسطح مكتب عبر
    Playwright يدوياً — لقطات حقيقية في `screenshots/` وتحقق من بقاء الحفظ
    بعد تحديث الصفحة.

## البناء والنشر (Build & Deploy)

```bash
npm run build      # -> dist/  (~104 KB total, JS gzip ≈ 28 KB)
npm run preview    # serve the production build locally
```

الناتج ملفات ثابتة فقط (`dist/`)؛ يمكن نشرها على أي استضافة ويب ثابتة.
لم يتم أي نشر عام مع هذه النسخة.

## توليد الأصول (Assets)

```bash
npm run sprites    # يعيد توليد assets/sprites/*.svg و backgrounds و icons
```

مصدر الحقيقة للرسوم هو خرائط بكسل في `src/ui/sprites.js` (شبكة موحّدة
16×20 للشخصيات ولوحة ألوان واحدة) — عدّل هناك وشغّل الأمر.

## ازاي تلعب (Controls)

- تحكم كامل باللمس/النقر، أهداف لمس ≥ ٤٨px، وتنقل سفلي من ٦ شاشات:
  **المحل** (بِع/اخدم الزبون) • **البضاعة** (الجملة والأسعار) • **الحارة**
  (المحل/عم رجب/القهوة/المنافس) • **المهام** • **التطوير** • **الحسابات**.
- الحوارات توقّف اللعب؛ مفيش أي ضغط زمني.
- دعم كيبورد: كل العناصر أزرار HTML حقيقية (`Tab` + `Enter`)، وتقديم الحوار
  بزر التأكيد. دعم «تقليل الحركة» و«الصوت» من الإعدادات.
- فلوسك وقعت؟ «الحارة ← القهوة»: شغلانة طوارئ بـ٣٠ جنيه (لرصيد أقل من ١٢٠،
  بفاصل خدمة زبونين) — مفيش Soft-lock.

## الحفظ (Save system)

- واجهة تخزين بديلة المستقبل عبر محول (`LocalStorageAdapter` /
  `MemoryAdapter`) و`SaveManager` برقم نسخة مخطط `SCHEMA_VERSION = 1`.
- حفظ تلقائي بعد كل إجراء ناجح: الكاش، المخزون، الأسعار، التطويرات،
  السمعة، حالة المهام، المرحلة، اللعب الحر، الإحصائيات، الإعدادات.
- حفظ تالف ⇒ لا ينهار ولا يُستبدل بصمت: يُنسخ احتياطياً
  (`el-moallem-save-backup`) ويُطلب من اللاعب تأكيد بداية جديدة.
- **حدود مهمة:** الحفظ محلي بالمتصفح على هذا الجهاز فقط. مسح «بيانات
  المواقع» يمسح التقدم. لا توجد مزامنة سحابية في الإصدار الأول (مقصود)،
  لكن واجهة التخزين جاهزة لاستبدالها بمحول سحابي لاحقاً.
- إعادة ضبط التقدم من الإعدادات، بخطوة تأكيد صريحة.

## الاقتصاد والموازنة (Data-driven balance)

أرقام قابلة للضبط في `src/data/*` فقط (بدون تشتيت في الواجهة):

| العنصر | القيمة |
|---|---|
| كاش البداية | 500 EGP |
| شيبس | جملة 5 → بيع ابتدائي 7 |
| مكافآت المهام اليدوية | 30–160 (تشمل تسليمات بقيمتها + مكافأة)؛ قوالب اللعب الحر: ثمن البضاعة + 20–40 |
| أول تطوير (رفوف) | 300 |
| مصروف تشغيل | 1 جنيه أكياس لكل طلب |
| سمعة | 0–100، السعر العادل +1..+3، الغالي جداً −2..−5 |

قواعد محمية بالكود والاختبارات: معاملات ذرّية على نسخة مُستنسخة، لا كاش/
مخزون سالب، مكافأة كل مهمة مرة واحدة، حماية من النقر المتكرر بـ`actionId`
وكذلك قفل قصير في الواجهة.

## هيكل المشروع

```
index.html · package.json · vite.config.js
src/main.js · src/app.js              # bootstrap + UI rendering/events (RTL)
src/styles/main.css                   # warm Hara pixel UI
src/ui/sprites.js                     # pixel maps -> crisp SVG (characters/scenes/icons)
src/data/                             # products, characters, levels, quests, upgrades
src/game/state/                       # initial state + atomic transactions
src/game/economy/economy.js           # buy/sell/pricing/upgrades/cafe safety-net
src/game/quests/                      # quest engine + endless generator (seeded)
src/game/story/story.js               # 5-level progression, metrics
src/game/neighborhood/customers.js    # order generation
src/game/save/saveAdapter.js          # storage interface, migrations, corruption safety
assets/sprites|backgrounds|icons      # generated .svg asset files
assets/audio/README.txt               # WebAudio blips instead of audio files (by design)
scripts/generate-sprites.mjs · pw-click.py (QA helper for Playwright clicks)
tests/                                # economy, quests/story/save, endless
screenshots/                          # real Playwright captures (mobile + desktop)
```

فصل صارم: قواعد اللعبة (`src/game`) لا تعرف شيئاً عن DOM؛ الواجهة تستدعيها
وتستبدل الحالة عند النجاح وتحفظ تلقائياً.

## ملاحظات وقيود معروفة

- الصوت عبارة عن «بيب» WebAudio اختياري (مغلق افتراضياً) — لا توجد ملفات صوت.
- أرقام التوازن صالحة للعب والمحاكاة، لكن ينصح بجولة Playtesting بشرية
  لضبط إحساس الإيقاع بعد المرحلة ٣.
- اختبار المتصفح (Playwright) يدوي ومُوثّق بلقطات؛ ليس جزءاً من `npm test`.
- النسخة E2E التالية المقترحة: تحويل جولة Playwright اليدوية إلى سكربت
  `@playwright/test`، مقاييس رضا مزاجية لكل شخصية، أحداث موسمية للعب الحر.
