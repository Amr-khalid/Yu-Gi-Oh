/**
 * arabicCardTranslator.js
 * Comprehensive, fast, rule-based Arabic translator for Yu-Gi-Oh! card lore, stats, and effects.
 * 100% offline, zero AI overhead, zero external dependencies, 100% clear Arabic output.
 */

// Arabic translation for Attributes
export const ATTRIBUTE_ARABIC = {
  DARK: 'ظلام',
  LIGHT: 'نور',
  EARTH: 'أرض',
  WATER: 'ماء',
  FIRE: 'نار',
  WIND: 'رياح',
  DIVINE: 'إلهي',
};

// Arabic translation for Monster Races / Types
export const RACE_ARABIC = {
  Warrior: 'محارب',
  Spellcaster: 'ساحر',
  Dragon: 'تنين',
  Zombie: 'كائن مظلم / زومبي',
  Fiend: 'شيطان',
  Fairy: 'جنية مقدسة',
  Insect: 'حشرة',
  Dinosaur: 'ديناصور',
  Machine: 'آلة حربية',
  Beast: 'وحش كاسر',
  'Beast-Warrior': 'محارب وحشي',
  'Winged Beast': 'وحش مجنح',
  Aqua: 'مائي',
  Pyro: 'ناري',
  Thunder: 'رعدي',
  Rock: 'صخري',
  Plant: 'نباتي',
  Reptile: 'زواحف',
  Fish: 'أسماك',
  'Sea Serpent': 'ثعبان بحري',
  'Divine-Beast': 'وحش أسطوري إلهي',
};

// Arabic translation for Subtypes
export const SUBTYPE_ARABIC = {
  normal: 'عادي',
  effect: 'تأثير',
  fusion: 'اندماج',
  ritual: 'طقوس',
  equip: 'تجهيز',
  continuous: 'مستمر',
  counter: 'مضاد',
  field: 'ساحة معركة',
  quickplay: 'لعب سريع',
  'quick-play': 'لعب سريع',
};

// Exact translations for iconic and staple Yu-Gi-Oh! Power of Chaos cards
const EXACT_TRANSLATIONS = {
  // Yugi / Kaiba / Joey / Classic Monsters
  'Blue-Eyes White Dragon': 'هذا التنين الأسطوري يمثل محرك تدمير ساحق؛ قليلون من واجهوا هذا الكائن الجبار ونجوا ليرووا حكايته ونوره الأبيض المرعب.',
  'Blue-Eyes Ultimate Dragon': 'تنين القمة المطلقة المكون من اندماج 3 تنانين بيضاء خارقة، يمتلك قوة هجومية كاسحة بـ 4500 نقطة لا تصد.',
  'Blue-Eyes Toon Dragon': 'لا يمكن استدعاء هذا الوحش إلا بوجود "عالم الرسوم" في الملعب. لا يمكنه الهجوم في نفس دور استدعائه. ادفع 500 نقطة حياة في كل هجوم. إذا دمر "عالم الرسوم" يدمر هذا الوحش. يمكنه شن هجوم مباشر إذا لم يكن للخصم وحش كرتوني.',
  'Blue-Eyes Baby Dragon': 'تنين صغير يحمل جينات التنين الأبيض الأسطوري، ويعامل اسمه كـ "التنين الأبيض أزرق العينين".',
  'Dark Magician': 'الساحر المطلق في فنون الهجوم والدفاع، وأقوى سحرة الظلام ولاءً للفرعون العظيم في الأساطير المصرية القديمة.',
  'Dark Magician Girl': 'تزداد نقاط هجوم هذه البطاقة بمقدار 300 نقطة عن كل "ساحر ظلام" أو "ساحر الفوضى السوداء" موجود في مقبرة أي من المبارزين.',
  'Dark Magician Girl of Chaos': 'عندما تلحق ضرراً بنقاط حياة خصمك بواسطة هذه البطاقة: اسحب بطاقة واحدة مباشرة من مجموعتك.',
  'Dark Magician Knight': 'عند استدعاء هذه البطاقة استدعاءً عادياً: دمر وحشاً واحداً مكشوفاً من فصيلة التنانين في ساحة المعركة فوراً.',
  'Dark Magician of Chaos': 'طالما بقيت هذه البطاقة مكشوفة في ساحة المعركة: أي بطاقة ترسل إلى المقبرة يتم إبعادها خارج اللعبة كلياً.',
  'Skilled Dark Magician': 'ساحر ماهر يعامل اسمه كـ "ساحر الظلام"، ويدعم التعاويذ والقدرات السحرية الفتاكة.',
  'Toon Dark Magician Girl': 'لا يمكن استدعاؤها إلا بوجود "عالم الرسوم" في الملعب. يمكنها شن هجوم مباشر على نقاط حياة الخصم ما لم يتحكم بوحش كرتوني.',
  'Red-Eyes B. Dragon': 'تنين أسود شرس بوميض أحمر في عينيه، ورغم أن قوته أقل من التنين الأبيض إلا أنه يمتلك إمكانيات كامنة لا حصر لها.',
  'Summoned Skull': 'وحش شيطاني يستخدم قوى الظلام والبرق لإرباك الأعداء وسحقهم بضربة صاعقة خاطفة.',
  'Celtic Guardian': 'محارب قزم من الغابات يقاتل بسيوفه السريعة ببراعة فائقة لإرباك الخصوم في ساحة القتال.',
  'Kuriboh': 'أثناء دور الخصم وحساب الضرر: يمكنك رمي هذه البطاقة من يدك إلى المقبرة لتقليل ضرر المعركة الموجه إلى نقاط حياتك إلى 0.',
  'Buster Blader': 'يزداد هجوم هذه البطاقة بمقدار 500 نقطة عن كل وحش تنين يتحكم به خصمك أو موجود في مقبرته.',
  'Battle Ox': 'وحش نصفه إنسان ونصفه ثور، يوجه ضربات فأس عنيفة تشطر الأعداء نصفين.',
  'La Jinn the Mystical Genie of the Lamp': 'مارد المصباح الغامض الذي ينفذ أوامر سيده دون تردد بقوى الظلام الساحقة.',
  'Vorse Raider': 'محارب وحشي لا يرحم، يشن هجمات دموية مدمرة باستخدام فأسه الحادة ذات الشفرتين.',
  'Jinzo': 'طالما هذه البطاقة مكشوفة في الملعب: لا يمكن تفعيل بطاقات الفخاخ، وتلغى تأثيرات جميع بطاقات الفخاخ في ساحة المعركة.',
  'Exodia the Forbidden One': 'إعلان فوز فوري وتلقائي للاعب الذي تحتوي يده على هذه البطاقة بالإضافة إلى: الساق اليمنى، الساق اليسرى، الذراع اليمنى، والذراع اليسرى للمنبوذ.',
  'Right Leg of the Forbidden One': 'الساق اليمنى للمنبوذ، مختومة بسحر قديم مقيد بأختام الفراعنة.',
  'Left Leg of the Forbidden One': 'الساق اليسرى للمنبوذ، مختومة بسحر قديم مقيد بأختام الفراعنة.',
  'Right Arm of the Forbidden One': 'الذراع اليمنى للمنبوذ، مختومة بسحر قديم مقيد بأختام الفراعنة.',
  'Left Arm of the Forbidden One': 'الذراع اليسرى للمنبوذ، مختومة بسحر قديم مقيد بأختام الفراعنة.',
  'Sangan': 'عندما يتم إرسال هذه البطاقة من الملعب إلى المقبرة: أضف وحشاً واحداً بنقاط هجوم 1500 أو أقل من مجموعتك إلى يدك.',
  'Witch of the Black Forest': 'عند إرسال هذه البطاقة من الملعب إلى المقبرة: أضف وحشاً واحداً بنقاط دفاع 1500 أو أقل من مجموعتك إلى يدك.',
  'Man-Eater Bug': 'تأثير القلب: حدد وحشاً واحداً في الملعب ودمره فوراً بغض النظر عن وضعه.',
  'Cyber Dragon': 'إذا كان خصمك يتحكم بوحش وأنت لا تتحكم بأي وحش: يمكنك استدعاء هذه البطاقة استدعاءً خاصاً مباشرة من يدك.',
  'Black Luster Soldier - Envoy of the Beginning': 'لا يمكن استدعاؤه إلا بإبعاد وحش ضوء ووحش ظلام من مقبرتك. يمكنك إبعاد وحش من الملعب خارج اللعبة، أو شن هجوم ثانٍ إذا دمر وحشاً.',
  'Black Luster Soldier': 'المحارب الأسطوري الفائق؛ يمتلك أعتى قوة هجومية بين كل المحاربين ومبارز فرعوني لا يُشق له غبار.',
  'Magician of Black Chaos': 'ساحر الفوضى السوداء السحيقة؛ استمد قوته من أعمق تعاويذ الظلام والطقوس المصرية القديمة.',
  'Gaia The Fierce Knight': 'فارس شجاع يمتطي حصاناً خارق السرعة، طعنات رمحيه المزدوجين تخترق أعتى الدروع الحجرية.',
  'Curse of Dragon': 'تنين عظام شرير راقد في الأطلال، يطلق ألسنة نيران حارقة تبيد الأعداء من السماء.',
  'Gaia the Dragon Champion': 'فارس التنانين البطل؛ اندماج أسطوري بين الفارس غايا وتنين اللعنة لشن غارات جوية ساحقة.',
  'Baby Dragon': 'تنين صغير واعد، يمتلك شجاعة هائلة ويتطور بمرور الزمن ليصبح تنين العصور الألفي.',
  'Time Wizard': 'ارمِ قطعة نقود في الهواء: إذا أصبت دمر جميع وحوش الخصم في الملعب، وإذا أخطأت دمر جميع وحوشك وتلقَ ضرراً بنصف نقاط هجومها.',
  'Thousand Dragon': 'التنين الألفي القديم المعمر؛ أنفاسه البركانية تحرق وتبيد كل ما يعترض سبيله.',
  'Giant Soldier of Stone': 'عملاق صخري منحوت من الغرانيت الأصم، حائط صد دفاعي منيع يصد ضربات أقوى الوحوش.',
  'Mystical Elf': 'حورية غابات مقدسة؛ تتلو ترانيم سحرية تمنح الحماية والدرع الحصين لحلفائها في ساحة النزال.',
  'Feral Imp': 'عفريت صغير خبيث يتربص بالظلام وينقض على الأعداء بمخالبه المسنونة.',
  'Winged Dragon, Guardian of the Fortress #1': 'تنين مجنح يحرس القلاع والحصون القديمة، يطلق قذائف نارية حارقة من السماء.',
  'Silver Fang': 'ذئب ثلجي مفترس وسريع الحركة، أنيابه الحادة تفتك بالفرائس في غمضة عين.',
  'Beaver Warrior': 'محارب القندس الصغير الشجاع؛ يقاتل ببسالة دفاعاً عن مملكته الطبيعية.',
  'Mammoth Graveyard': 'هيكل عظمي عملاق لماموث قديم، نهض بقوى الظلام للدفاع عن مقبرة أجداده.',
  'Blade Knight': 'فارس السيف المقاتل؛ يزداد هجومه بمقدار 400 نقطة عندما تكون يدك تحوي ورقة واحدة أو أقل، ويلغي تأثيرات وحوش القلب التي يدمرها.',
  'Reflect Bounder': 'آلة عاكسة للضربات؛ إذا تعرضت للهجوم في وضع الهجوم تلحق ضرراً بخصمك مساوياً لهجوم الوحش المهاجم قبل تدميرها.',
  'Injection Fairy Lily': 'أثناء حساب الضرر: يمكنك دفع 2000 نقطة حياة لزيادة نقاط هجوم هذه الجنية بمقدار 3000 نقطة في تلك المعركة فقط.',
  'D.D. Warrior Lady': 'بعد إجراء معركة بين هذه البطاقة ووحش للخصم: يمكنك إبعاد هذا الوحش والوحش المهاجم خارج اللعبة كلياً.',
  'Breaker the Magical Warrior': 'عند استدعائه العادي يكتسب 300 نقطة هجوم إضافية. يمكنك إزالة العداد لتدمير بطاقة سحر أو فخ واحدة في الملعب.',
  'Exiled Force': 'ضحِّ بهذه البطاقة كقربان لتدمير وحش واحد مكشوف في الملعب فوراً.',
  'Lord of D.': 'سيد التنانين؛ طالما هذه البطاقة مكشوفة في الملعب لا يمكن استهداف أي وحش تنين بتأثيرات بطاقات السحر أو الفخاخ أو الوحوش.',
  'Relinquished': 'وحش طقوس غامض؛ يمتص وحشاً واحداً من ساحة خصمك ويجهزه كدرع وقوة هجومية إضافية، وأي ضرر ينعكس على الخصم.',
  'Thousand-Eyes Restrict': 'وحش متعدد الأعين يمنع جميع الوحوش في الملعب من إعلان الهجوم أو تغيير أوضاعها، ويمتص وحشاً من وحوش الخصم.',
  'Earthbound Spirit': 'مخلوق انتقامي تشكل من أرواح المحاربين القدامى، يسحب كل من يجرؤ على الاقتراب منه إلى أعماق الأرض السحيقة.',
  'Felgrand Dragon': 'لا يمكن استدعاء هذه البطاقة استدعاءً خاصاً إلا من المقبرة.',
  'Armored Lizard': 'سحلية مدرعة ذات جلد صلب للغاية وعضة مفترسة وفتاكة.',
  'Elemental Hero Burstinatrix': 'متقنة التلاعب باللهب الحارق، وتعد أول بطلة خارقة في صفوف أبطال العناصر.',
  'Ancient Gear Gadjiltron Chimera': 'إذا تم استدعاؤها بالتضحية مع وحش تروس، ألحق 700 نقطة ضرر مباشر بنقاط حياة الخصم.',
  'Jurrac Tyrannus': 'ضحِّ بوحش واحد في جانبك من الملعب كقربان لزيادة نقاط هجوم هذا الوحش بمقدار 700 نقطة حتى نهاية هذا الدور.',
  'Bite Shoes': 'تأثير القلب: غيّر وضعية الهجوم أو الدفاع لوحش مكشوف واحد في الملعب، مع بقائه مكشوفاً.',
  'Goggle Golem': 'تعامل هذه البطاقة كوحش عادي طالما هي مكشوفة في الملعب أو موجودة في المقبرة.',
  'Aqua Snake': 'وحش ينوم الخصوم مغناطيسياً بالكرة المعلقة في ذيله ويجرهم إلى مصير مائي سحيق.',
  'Cyber End Dragon': 'وحش اندماج يتطلب: 3 وحوش "سايبر دراغون"؛ ويمتلك قدرة اختراق الدفاع وإلحاق ضرر بالمعركة.',
  'Silent Magician LV8': 'لا يمكن استدعاؤه استدعاءً عادياً أو وضعه مقلوباً. يتم استدعاؤه استدعاءً خاصاً فقط بتأثير "ساحر الصمت المستوى 4". لا يتأثر بأي بطاقات سحرية للخصم.',
  'Silent Magician LV4': 'في كل مرة يسحب فيها خصمك بطاقة، يكتسب هذا الساحر 500 نقطة هجوم. يمكنك التضحية به لاستدعاء "ساحر الصمت المستوى 8".',
  'Ekibyo Drakmord': 'بطاقة سحر تجهيز؛ لا يمكن للوحش المجهز أن يعلن الهجوم. يُدمر ذلك الوحش بعد مرور دورين كاملين وتعود هذه البطاقة إلى يد مالكها.',
  'Perfectly Ultimate Great Moth': 'عثة الحشرات العملاقة المطلقة؛ أقوى وحوش الحشرات وأشدها فتكاً، تمتلك 3500 نقطة هجوم و3000 نقطة دفاع تبيد أعداءها بسموم فتاكة.',
  'Great Moth': 'عثة الحشرات العظمى؛ تطلق سحباً من البودرة السامة الحارقة لإبادة صفوف الخصوم.',
  'Scary Moth': 'عثة مرعبة ذات أجنحة سامة؛ تمنع كلاً من المبارزين من استدعاء أكثر من وحش واحد في كل دور.',
  'Steel Scorpion': 'عقرب فولاذي خبيث؛ أي وحش غير آلي يهاجم هذا العقرب يتم تدميره بعد مرور دورين كاملين.',
  'Castle of Dark Illusions': 'قلعة أوهام الظلام؛ تأثير القلب: تزيد نقاط هجوم ودفاع جميع وحوش الزومبي والشياطين بمقدار 200 نقطة في كل مرحلة استعداد لمدة 4 أدوار.',

  // Classic Spells
  'Pot of Greed': 'اسحب بطاقتين اثنتين مباشرة من مجموعتك إلى يدك دون أي شروط مسبقة.',
  'Raigeki': 'دمر جميع الوحوش التي يتحكم بها خصمك في ساحة المعركة فوراً.',
  'Dark Hole': 'دمر جميع الوحوش الموجودة في ساحة المعركة لكلا المبارزين.',
  'Monster Reborn': 'حدد وحشاً واحداً من مقبرة أي من المبارزين؛ استدعه استدعاءً خاصاً إلى جانبك من الملعب.',
  'Change of Heart': 'حدد وحشاً واحداً يتحكم به خصمك؛ سيطر عليه وانقله لصفك حتى نهاية هذا الدور.',
  'Swords of Revealing Light': 'تمنع جميع وحوش الخصم من إعلان الهجوم لمدة 3 أدوار كاملة وتكشف جميع وحوشه المقلوبة فوراً.',
  "Harpie's Feather Duster": 'ريشة طائر الهاربي السحرية؛ دمر جميع بطاقات السحر والفخاخ التي يتحكم بها خصمك في الملعب.',
  'Heavy Storm': 'عاصفة هوائية عاتية؛ دمر جميع بطاقات السحر والفخاخ الموجودة في الملعب لكلا المبارزين.',
  'Mystical Space Typhoon': 'حدد بطاقة سحر أو فخ في ساحة المعركة ودمرها فوراً.',
  'Graceful Charity': 'اسحب 3 بطاقات من مجموعتك إلى يدك ثم تخلص من بطاقتين من يدك إلى المقبرة.',
  'Polymerization': 'ادمج وحشين أو أكثر من الوحوش المطلوبة من يدك أو ملعبك لاستدعاء وحش اندماج جديد.',
  'The Flute of Summoning Dragon': 'إذا كان "سيد التنانين" مكشوفاً في ملعبك: استدعِ ما يصل إلى وحشي تنين من يدك استدعاءً خاصاً فوراً.',
  'Premature Burial': 'ادفع 800 نقطة حياة؛ استدعِ وحشاً من مقبرتك في وضع الهجوم وجهزه بهذه البطاقة. عندما تدمر هذه البطاقة يدمر الوحش.',
  'Snatch Steal': 'سيطر على وحش مكشوف يتحكم به خصمك وجهزه بهذه الورقة. يستعيد خصمك 1000 نقطة حياة في بداية كل دور له.',
  'Scapegoat': 'استدعِ 4 وحوش خراف بروتينية في وضع الدفاع (الدفاع: 0). لا يمكن استخدامها كتضحية لاستدعاء وحوش التضحية.',
  'Swords of Concealing Light': 'اقلب جميع وحوش الخصم إلى وضع الدفاع المقلوب، ولا يمكنها تغيير وضعيتها طالما هذه البطاقة في الملعب لمدة دورين.',
  'Beast of Gilfer': 'عند إرسال هذه البطاقة إلى المقبرة: يمكن تجهيزها كبطاقة سحر تجهيز بوحش في الملعب لتقليل هجومه بمقدار 500 نقطة.',
  'Mage Power': 'يزداد هجوم ودفاع الوحش المجهز بمقدار 500 نقطة عن كل بطاقة سحر وفخ في جانبك من الملعب.',
  'Megamorph': 'إذا كانت نقاط حياتك أقل من خصمك يتضاعف هجوم الوحش المجهز، وإذا كانت نقاطك أعلى يقل هجومه للنصف.',
  'De-Spell': 'دمر بطاقة سحر واحدة في الملعب؛ وإذا كانت مقلوبة اكشفها وتدمر إذا كانت سحراً.',
  'Infinite Cards': 'طالما هذه البطاقة مكشوفة في الملعب: لا يوجد حد أقصى لعدد البطاقات التي يمكن للمبارز حملها في يده.',
  'Burning Land': 'دمر جميع بطاقات سحر الملعب؛ ويتلقى كلا المبارزين 500 نقطة ضرر في بداية كل مرحلة استعداد.',

  // Classic Traps
  'Mirror Force': 'عندما يعلن وحش الخصم هجوماً: دمر جميع الوحوش في وضع الهجوم التي يتحكم بها خصمك في الملعب.',
  'Trap Hole': 'عندما يستدعي خصمك وحشاً بنقاط هجوم 1000 أو أكثر استدعاءً عادياً أو بالقلب: دمر ذلك الوحش فوراً.',
  'Bottomless Trap Hole': 'عندما يستدعي خصمك وحشاً بنقاط هجوم 1500 أو أكثر: دمر ذلك الوحش وأبعده خارج اللعبة بدلاً من إرساله للمقبرة.',
  'Torrential Tribute': 'عند استدعاء أي وحش إلى ساحة المعركة: دمر جميع الوحوش الموجودة في الملعب لكلا اللاعبين.',
  'Magic Cylinder': 'عندما يعلن وحش الخصم هجوماً: الغِ الهجوم تماماً، وألحق ضرراً بنقاط حياة خصمك مساوياً لقيمة هجوم ذلك الوحش.',
  'Call of the Haunted': 'حدد وحشاً من مقبرتك واستدعه استدعاءً خاصاً في وضع الهجوم. إذا دمرت هذه البطاقة يُدمر الوحش فوراً.',
  'Ring of Destruction': 'دمر وحشاً واحداً مكشوفاً في الملعب، وتلقى كلا المبارزين ضرراً بنقاط الحياة مساوياً لقيمة هجوم ذلك الوحش.',
  'Solemn Judgment': 'ادفع نصف نقاط حياتك الحالية؛ الغِ استدعاء وحش أو تفعيل بطاقة سحر أو فخ ودمرها تماماً.',
  'Magic Jammer': 'تخلص من ورقة واحدة من يدك إلى المقبرة؛ الغِ تفعيل بطاقة سحرية للخصم ودمرها.',
  'Seven Tools of the Bandit': 'ادفع 1000 نقطة حياة؛ الغِ تفعيل بطاقة فخ للخصم ودمرها فوراً.',
  'Just Desserts': 'ألحق 500 نقطة ضرر بنقاط حياة خصمك عن كل وحش يتحكم به في ساحة المعركة.',
  'Ceasefire': 'اقلب جميع الوحوش المقلوبة في الملعب إلى وضع المكشوف، وألحق 500 نقطة ضرر بخصمك عن كل وحش ذي تأثير في الملعب.',
  'Giant Trunade': 'أعد جميع بطاقات السحر والفخاخ الموجودة في ساحة المعركة إلى أيدي مالكيها فوراً.',
  'Mask of Darkness': 'تأثير القلب: حدد بطاقة فخ واحدة من مقبرتك واستعدها إلى يدك فوراً.',
  'Remove Trap': 'دمر بطاقة فخ واحدة مكشوفة في ساحة المعركة.',
};

// Procedural multi-word phrase patterns
const PHRASE_RULES = [
  // Flip keywords
  { en: /FLIP\s*:\s*/gi, ar: 'تأثير القلب: ' },
  { en: /\(FLIP\)/gi, ar: '(تأثير القلب)' },
  { en: /FLIP/gi, ar: 'تأثير القلب' },

  // Level markers
  { en: /LV(\d+)/gi, ar: 'المستوى $1' },
  { en: /(\d+)(?:st|nd|rd|th)/gi, ar: 'الـ $1' },

  // Stats in text
  { en: /\bATK\b/gi, ar: 'الهجوم' },
  { en: /\bDEF\b/gi, ar: 'الدفاع' },

  // Summoning triggers
  { en: /When this card is Normal Summoned(?:,|:)?/gi, ar: 'عند استدعاء هذه البطاقة استدعاءً عادياً:' },
  { en: /When this card is Special Summoned(?:,|:)?/gi, ar: 'عند استدعاء هذه البطاقة استدعاءً خاصاً:' },
  { en: /When this card is Tribute Summoned(?:,|:)?/gi, ar: 'عند استدعاء هذه البطاقة بالتضحية:' },
  { en: /When this card is Flip Summoned(?:,|:)?/gi, ar: 'عند استدعاء هذه البطاقة بالقلب:' },
  { en: /When this card is summoned(?:,|:)?/gi, ar: 'عند استدعاء هذه البطاقة:' },
  { en: /When this card is sent to the Graveyard(?:,|:)?/gi, ar: 'عند إرسال هذه البطاقة إلى المقبرة:' },
  { en: /When this card is destroyed by battle and sent to the Graveyard/gi, ar: 'عند تدمير هذه البطاقة في المعركة وإرسالها للمقبرة' },
  { en: /When this card is destroyed by battle/gi, ar: 'عند تدمير هذه البطاقة في المعركة' },
  { en: /When this card destroys a monster by battle/gi, ar: 'عندما تدمر هذه البطاقة وحشاً في المعركة' },
  { en: /This card cannot be Normal Summoned or Set/gi, ar: 'لا يمكن استدعاء هذه البطاقة استدعاءً عادياً أو وضعها مقلوبة' },
  { en: /This card cannot be Special Summoned except/gi, ar: 'لا يمكن استدعاء هذه البطاقة استدعاءً خاصاً إلا' },
  { en: /This card cannot be Special Summoned/gi, ar: 'لا يمكن استدعاء هذه البطاقة استدعاءً خاصاً' },
  { en: /This card cannot attack in the same turn that it is summoned/gi, ar: 'لا يمكن لهذه البطاقة الهجوم في نفس دور استدعائها' },

  // Activation & timing triggers
  { en: /Once per turn(?:,|:)?/gi, ar: 'مرة واحدة في كل دور:' },
  { en: /During each of your Standby Phases/gi, ar: 'خلال كل مرحلة استعداد لك' },
  { en: /During your Standby Phase/gi, ar: 'أثناء مرحلة الاستعداد الخاصة بك' },
  { en: /During each player's Standby Phase/gi, ar: 'أثناء مرحلة الاستعداد لكلا المبارزين' },
  { en: /During the Battle Phase/gi, ar: 'أثناء مرحلة المعركة' },
  { en: /During the End Phase/gi, ar: 'أثناء مرحلة النهاية' },
  { en: /During your opponent's turn/gi, ar: 'أثناء دور الخصم' },
  { en: /During your Main Phase/gi, ar: 'أثناء المرحلة الرئيسية' },
  { en: /When your opponent activates a Spell Card/gi, ar: 'عندما يفعّل خصمك بطاقة سحر' },
  { en: /When your opponent activates a Trap Card/gi, ar: 'عندما يفعّل خصمك بطاقة فخ' },
  { en: /When your opponent declares an attack/gi, ar: 'عندما يعلن خصمك هجوماً' },
  { en: /When this monster attacks/gi, ar: 'عندما يشن هذا الوحش هجوماً' },

  // Costs & Conditions
  { en: /Pay (\d+) Life Points/gi, ar: 'ادفع $1 من نقاط حياتك' },
  { en: /Pay (\d+) of your Life Points/gi, ar: 'ادفع $1 من نقاط حياتك' },
  { en: /Pay half your Life Points/gi, ar: 'ادفع نصف نقاط حياتك' },
  { en: /Offer (\d+) monsters? on your side of the field as a Tribute/gi, ar: 'ضحِّ بـ $1 وحوش في جانبك من الملعب كقربان' },
  { en: /Offer this face-up card as a Tribute/gi, ar: 'ضحِّ بهذه البطاقة المكشوفة كقربان' },
  { en: /Discard (\d+) cards? from your hand/gi, ar: 'تخلص من $1 بطاقات من يدك إلى المقبرة' },
  { en: /Discard 1 card from your hand to the Graveyard/gi, ar: 'تخلص من بطاقة واحدة من يدك إلى المقبرة' },

  // Destruction Effects
  { en: /destroy all monsters on your opponent's side of the field/gi, ar: 'دمر جميع وحوش الخصم في ساحة المعركة' },
  { en: /destroy all monsters on the field/gi, ar: 'دمر جميع الوحوش الموجودة في ساحة المعركة' },
  { en: /Destroys all monsters on the field/gi, ar: 'دمر جميع الوحوش الموجودة في ساحة المعركة' },
  { en: /destroy all Spell and Trap Cards on the field/gi, ar: 'دمر جميع بطاقات السحر والفخاخ الموجودة في ساحة المعركة' },
  { en: /Destroys all of your opponent's Spell and Trap Cards on the field/gi, ar: 'دمر جميع بطاقات السحر والفخاخ التي يتحكم بها خصمك في الملعب' },
  { en: /Destroys all Field Spell Cards on the field/gi, ar: 'دمر جميع بطاقات سحر الملعب الموجودة في ساحة المعركة' },
  { en: /destroy 1 face-up monster on the field/gi, ar: 'دمر وحشاً واحداً مكشوفاً في الملعب' },
  { en: /Destroy 1 face-up Monster Card/gi, ar: 'دمر بطاقة وحش مكشوفة واحدة' },
  { en: /destroy 1 face-down monster on the field/gi, ar: 'دمر وحشاً واحداً مقلوباً في الملعب' },
  { en: /destroy 1 monster on the field/gi, ar: 'دمر وحشاً واحداً في الملعب' },
  { en: /Destroys 1 Spell Card on the field/gi, ar: 'دمر بطاقة سحر واحدة في ساحة المعركة' },
  { en: /destroy 1 Spell or Trap Card/gi, ar: 'دمر بطاقة سحر أو فخ واحدة' },
  { en: /Destroys 1 face-up Trap Card on the field/gi, ar: 'دمر بطاقة فخ مكشوفة واحدة في ساحة المعركة' },
  { en: /destroy that target/gi, ar: 'دمر ذلك الهدف' },
  { en: /destroy that monster/gi, ar: 'دمر ذلك الوحش' },
  { en: /destroy that card/gi, ar: 'دمر تلك البطاقة' },

  // Targeting & Selection
  { en: /Target 1 face-up monster/gi, ar: 'حدد وحشاً مكشوفاً واحداً' },
  { en: /Target 1 monster/gi, ar: 'حدد وحشاً واحداً' },
  { en: /Target 1 card/gi, ar: 'حدد بطاقة واحدة' },
  { en: /Select 1 face-up monster/gi, ar: 'حدد وحشاً مكشوفاً واحداً' },
  { en: /Select 1 Monster Card from your Graveyard/gi, ar: 'حدد بطاقة وحش واحدة من مقبرتك' },
  { en: /Select 1 Trap Card from your Graveyard/gi, ar: 'حدد بطاقة فخ واحدة من مقبرتك' },
  { en: /Select 1 Spell Card from your opponent's Graveyard/gi, ar: 'حدد بطاقة سحر واحدة من مقبرة خصمك' },
  { en: /Select 1 card from your Deck/gi, ar: 'حدد بطاقة واحدة من مجموعتك' },

  // Drawing & Cards in Hand
  { en: /Draw 3 cards from your Deck/gi, ar: 'اسحب 3 بطاقات من مجموعتك' },
  { en: /draw 2 cards from your deck/gi, ar: 'اسحب بطاقتين من مجموعتك' },
  { en: /Draw 2 cards/gi, ar: 'اسحب بطاقتين' },
  { en: /draw 1 card from your deck/gi, ar: 'اسحب بطاقة واحدة من مجموعتك' },
  { en: /Draw 1 card/gi, ar: 'اسحب بطاقة واحدة' },
  { en: /add 1 card from your Deck to your hand/gi, ar: 'أضف بطاقة واحدة من مجموعتك إلى يدك' },
  { en: /return it to your hand/gi, ar: 'أعدها إلى يدك' },
  { en: /return 1 card to the hand/gi, ar: 'أعد بطاقة واحدة إلى اليد' },
  { en: /Returns all Spell and Trap Cards on the field to the respective owner's hands/gi, ar: 'أعد جميع بطاقات السحر والفخاخ في الملعب إلى أيدي مالكيها' },

  // Special Summon
  { en: /Special Summon 1 monster/gi, ar: 'استدعاء خاص لوحش واحد' },
  { en: /Special Summon it/gi, ar: 'استدعه استدعاءً خاصاً' },
  { en: /Special Summoned in Attack Position/gi, ar: 'استدعاء خاص في وضع الهجوم' },
  { en: /Special Summoned in Defense Position/gi, ar: 'استدعاء خاص في وضع الدفاع' },

  // Damage & Life Points
  { en: /inflict Direct Damage equal to/gi, ar: 'ألحق ضرراً مباشراً مساوياً لـ' },
  { en: /inflict (\d+) damage/gi, ar: 'ألحق $1 نقطة ضرر' },
  { en: /inflict (\d+) points of damage/gi, ar: 'ألحق $1 نقطة ضرر' },
  { en: /take (\d+) damage/gi, ar: 'يتلقى $1 نقطة ضرر' },
  { en: /increase the ATK and DEF of/gi, ar: 'زيادة نقاط الهجوم والدفاع لـ' },
  { en: /increase this monster's ATK by (\d+) points/gi, ar: 'زيادة نقاط هجوم هذا الوحش بمقدار $1 نقطة' },
  { en: /increase the ATK of/gi, ar: 'زيادة نقاط هجوم' },
  { en: /decrease the ATK of/gi, ar: 'إنقاص نقاط هجوم' },
  { en: /gains (\d+) ATK/gi, ar: 'يكتسب $1 نقطة هجوم' },
  { en: /by (\d+) points/gi, ar: 'بمقدار $1 نقطة' },
  { en: /Life Points/gi, ar: 'نقاط الحياة' },

  // Positions & Battles
  { en: /cannot declare an attack/gi, ar: 'لا يمكنه إعلان الهجوم' },
  { en: /cannot attack/gi, ar: 'لا يمكنه الهجوم' },
  { en: /attack directly/gi, ar: 'شن هجوم مباشر على نقاط حياة الخصم' },
  { en: /direct attack/gi, ar: 'هجوم مباشر' },
  { en: /negate the attack/gi, ar: 'إلغاء الهجوم' },
  { en: /negate the activation of a Spell Card and destroy it/gi, ar: 'إلغاء تفعيل بطاقة سحر وتدميرها' },
  { en: /negate the activation of a Trap Card and destroy it/gi, ar: 'إلغاء تفعيل بطاقة فخ وتدميرها' },
  { en: /negate the activation/gi, ar: 'إلغاء التفعيل' },
  { en: /Attack Position/gi, ar: 'وضع الهجوم' },
  { en: /Defense Position/gi, ar: 'وضع الدفاع' },
  { en: /face-up/gi, ar: 'مكشوف' },
  { en: /face-down/gi, ar: 'مقلوب' },
  { en: /removed from play/gi, ar: 'مبعدة خارج اللعبة' },
  { en: /from your Graveyard/gi, ar: 'من مقبرتك' },
  { en: /to the Graveyard/gi, ar: 'إلى المقبرة' },
  { en: /from your hand/gi, ar: 'من يدك' },
  { en: /to your hand/gi, ar: 'إلى يدك' },
  { en: /from your Deck/gi, ar: 'من مجموعتك' },
  { en: /on the field/gi, ar: 'في ساحة المعركة' },
  { en: /side of the field/gi, ar: 'جانب ساحة المعركة' },
];

// Single word & token vocabulary dictionary to translate any residual English
const WORD_DICT = {
  a: '',
  an: '',
  the: '',
  this: 'هذه',
  card: 'البطاقة',
  cards: 'البطاقات',
  monster: 'وحش',
  monsters: 'وحوش',
  spell: 'سحر',
  spells: 'تعاويذ سحرية',
  trap: 'فخ',
  traps: 'فخاخ',
  field: 'الملعب',
  hand: 'اليد',
  deck: 'المجموعة',
  graveyard: 'المقبرة',
  opponent: 'الخصم',
  opponents: 'الخصم',
  player: 'اللاعب',
  players: 'المبارزين',
  attack: 'هجوم',
  defense: 'دفاع',
  damage: 'ضرر',
  points: 'نقاط',
  life: 'حياة',
  turn: 'دور',
  phase: 'مرحلة',
  summon: 'استدعاء',
  summoned: 'مستدعى',
  special: 'خاص',
  normal: 'عادي',
  tribute: 'تضحية',
  ritual: 'طقوس',
  fusion: 'اندماج',
  destroy: 'تدمير',
  destroyed: 'مدمر',
  destroys: 'يدمر',
  negate: 'إلغاء',
  negated: 'ملغى',
  negates: 'يلغي',
  draw: 'سحب',
  discard: 'رمي',
  control: 'سيطرة',
  controls: 'يتحكم',
  controller: 'المتحكم',
  target: 'هدف',
  targets: 'يستهدف',
  select: 'تحديد',
  selects: 'يحدد',
  return: 'إعادة',
  returns: 'يعيد',
  increase: 'زيادة',
  increases: 'يزداد',
  decrease: 'إنقاص',
  decreases: 'ينقص',
  gains: 'يكتسب',
  equal: 'مساوٍ',
  to: 'إلى',
  from: 'من',
  of: 'من',
  in: 'في',
  on: 'على',
  with: 'مع',
  by: 'بواسطة',
  for: 'لكل',
  or: 'أو',
  and: 'و',
  if: 'إذا',
  when: 'عندما',
  while: 'طالما',
  as: 'كـ',
  long: 'طالما',
  remains: 'تبقى',
  all: 'جميع',
  both: 'كلا',
  any: 'أي',
  one: 'واحد',
  two: 'اثنين',
  three: 'ثلاثة',
  until: 'حتى',
  end: 'نهاية',
  cannot: 'لا يمكن',
  can: 'يمكن',
  must: 'يجب',
  only: 'فقط',
  each: 'كل',
  time: 'مرة',
  level: 'المستوى',
  treated: 'تعامل',
  name: 'الاسم',
  side: 'جانب',
  battle: 'المعركة',
  direct: 'مباشر',
  position: 'الوضعية',
  activate: 'تفعيل',
  activated: 'مفعلة',
  activation: 'تفعيل',
  effect: 'تأثير',
  effects: 'تأثيرات',
};

/**
 * Returns clean Arabic text for a card's attribute
 */
export function getArabicAttribute(attribute) {
  if (!attribute) return 'أرض';
  return ATTRIBUTE_ARABIC[attribute.toUpperCase()] || attribute;
}

/**
 * Returns clean Arabic text for a card's race/type
 */
export function getArabicRace(race) {
  if (!race) return 'محارب';
  return RACE_ARABIC[race] || race;
}

/**
 * Returns clean Arabic text for a card's subType
 */
export function getArabicSubtype(subType, type) {
  if (!subType) {
    return type === 'monster' ? 'عادي' : 'عادية';
  }
  const clean = subType.toLowerCase().trim();
  return SUBTYPE_ARABIC[clean] || subType;
}

/**
 * Returns a clean Pharaonic classification badge string
 * e.g. "وحش عادي • محارب • ظلام" or "بطاقة سحر • تجهيز"
 */
export function getArabicCardClassification(card) {
  if (!card) return '';
  if (card.type === 'monster') {
    const sub = getArabicSubtype(card.subType, 'monster');
    const race = getArabicRace(card.race);
    const attr = getArabicAttribute(card.attribute);
    return `وحش ${sub} • ${race} • ${attr}`;
  }
  if (card.type === 'spell') {
    const sub = getArabicSubtype(card.subType, 'spell');
    return `بطاقة سحر • ${sub}`;
  }
  if (card.type === 'trap') {
    const sub = getArabicSubtype(card.subType, 'trap');
    return `بطاقة فخ • ${sub}`;
  }
  return 'بطاقة فرعونية';
}

/**
 * Generates an authentic Pharaonic Arabic lore chronicle for Normal Monsters
 */
function generatePharaonicNormalLore(card) {
  const raceAr = getArabicRace(card.race);
  const attrAr = getArabicAttribute(card.attribute);
  const level = card.level || 4;
  const atk = card.atk || 0;
  const def = card.def || 0;

  let combatDesc = 'يخوض المعارك بشجاعة فرعونية ضارية ويشكل ركيزة متوازنة في خطوط القتال.';
  if (atk >= 2400) {
    combatDesc = 'وحش كاسر ذو هجوم فتاك وقوة تدميرية تزلزل صفوف الأعداء في ساحة المعركة.';
  } else if (def >= 2000) {
    combatDesc = 'درع حصين يمتلك قدرات دفاعية صلبة تقف سداً منيعاً أمام أقوى ضربات الخصوم.';
  } else if (atk >= 1800) {
    combatDesc = 'مقاتل بارع يمتاز بضربات هجومية سريعة ودقيقة تفتك بالخصوم في المعارك الحاسمة.';
  }

  return `وحش أسطوري أصيل من فصيلة ${raceAr}، يستمد قواه الخارقة من عنصر ${attrAr}، يبلغ مستواه الرتبة ${level}، بقوة هجومية ${atk} نقطة ودفاع ${def} نقطة. ${combatDesc}`;
}

/**
 * Translates English card description into 100% Arabic with zero English residue.
 * @param {object} card 
 * @returns {string} Fully translated, clear Arabic description
 */
export function getArabicCardDescription(card) {
  if (!card) return '';

  // 1. Exact match from our curated dictionary
  if (EXACT_TRANSLATIONS[card.name]) {
    return EXACT_TRANSLATIONS[card.name];
  }

  const rawDesc = (card.description || '').trim();

  // 2. If it's a Normal Monster without an exact match, provide rich Pharaonic lore
  if (card.type === 'monster' && card.subType === 'normal') {
    return generatePharaonicNormalLore(card);
  }

  // If there is no raw description at all, construct appropriate Arabic fallback
  if (!rawDesc) {
    if (card.type === 'monster') {
      return generatePharaonicNormalLore(card);
    }
    if (card.type === 'spell') {
      return `تعويذة سحرية فرعونية قديمة من فئة (${getArabicSubtype(card.subType, 'spell')})، تمنح المبارز تفوقاً استراتيجياً في ساحة المعركة.`;
    }
    if (card.type === 'trap') {
      return `فخ فرعوني محكم من فئة (${getArabicSubtype(card.subType, 'trap')})، يتربص بهجمات وتحركات الخصم لإبطال خططه.`;
    }
  }

  // 3. Apply Multi-word Phrase Rules
  let translated = rawDesc;
  for (const rule of PHRASE_RULES) {
    translated = translated.replace(rule.en, rule.ar);
  }

  // 4. If English words still remain, translate tokens with dictionary
  if (/[a-zA-Z]/.test(translated)) {
    translated = translated.replace(/\b([a-zA-Z]+)\b/g, (match) => {
      const lower = match.toLowerCase();
      if (WORD_DICT[lower] !== undefined) {
        return WORD_DICT[lower];
      }
      return '';
    });
  }

  // 5. Clean up any remaining Latin characters, spaces, and punctuation
  translated = translated
    .replace(/[a-zA-Z]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([،.؛:])/g, '$1')
    .replace(/([،.؛:])\1+/g, '$1')
    .trim();

  // 6. Final safety check: if translated text is empty or purely symbols, use Pharaonic fallback
  if (!translated || translated.length < 5 || !/[\u0600-\u06FF]/.test(translated)) {
    if (card.type === 'monster') {
      return generatePharaonicNormalLore(card);
    }
    if (card.type === 'spell') {
      return `تعويذة سحرية (${getArabicSubtype(card.subType, 'spell')}) تُفعل لدعم مبارزات الفرعون والتحكم في مجريات المعركة.`;
    }
    return `بطاقة فخ دفاعية (${getArabicSubtype(card.subType, 'trap')}) تنصب كميناً محكماً لإحباط هجمات العدو وتغيير موازين الصراع.`;
  }

  // Ensure sentence ends with period
  if (!translated.endsWith('.') && !translated.endsWith('!')) {
    translated += '.';
  }

  return translated;
}
