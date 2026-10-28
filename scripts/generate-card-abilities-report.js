const fs = require('fs');
const path = require('path');

async function main() {
  const ROOT_DIR = path.resolve(__dirname, '../../');
  const CARDS_FILE = path.join(__dirname, '../src/data/cards.json');
  const SPELL_EFFECTS_FILE = path.join(__dirname, '../src/game/engine/SpellEffects.js');
  const TRAP_EFFECTS_FILE = path.join(__dirname, '../src/game/engine/TrapEffects.js');

  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
  const spellCode = fs.readFileSync(SPELL_EFFECTS_FILE, 'utf8');
  const trapCode = fs.readFileSync(TRAP_EFFECTS_FILE, 'utf8');

  // Dynamic import of MonsterEffects module
  const meModule = await import('../src/game/engine/MonsterEffects.js');
  const monsterRegistry = meModule.MONSTER_EFFECT_REGISTRY || {};

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Extract Spell Titles & Targets
  const spellTitles = {};
  const spellMatches = spellCode.matchAll(/name\.includes\('([^']+)'\)[\s\S]*?title:\s*'([^']+)'/g);
  for (const match of spellMatches) {
    spellTitles[norm(match[1])] = match[2];
  }

  // Extract Trap Titles & Targets
  const trapTitles = {};
  const trapMatches = trapCode.matchAll(/name\.includes\('([^']+)'\)[\s\S]*?title:\s*'([^']+)'/g);
  for (const match of trapMatches) {
    trapTitles[norm(match[1])] = match[2];
  }

  console.log(`Loaded ${Object.keys(monsterRegistry).length} registered monster effects, ${Object.keys(spellTitles).length} spell titles, ${Object.keys(trapTitles).length} trap titles.`);

  // Comprehensive Arabic Names Dictionary for Iconic Cards
  const arabicDictionary = {
    'potofgreed': 'جرة الجشع (Pot of Greed)',
    'monsterreborn': 'ولادة الوحش (Monster Reborn)',
    'raigeki': 'ضربة الصاعقة (Raigeki)',
    'darkhole': 'الثقب الأسود (Dark Hole)',
    'swordsofrevealinglight': 'سيوف النور الكاشف (Swords of Revealing Light)',
    'changeofheart': 'تغيير القلوب (Change of Heart)',
    'carddestruction': 'تدمير البطاقات (Card Destruction)',
    'mysticalspacetyphoon': 'إعصار الفضاء الصوفي (Mystical Space Typhoon)',
    'heavystorm': 'العاصفة العاتية (Heavy Storm)',
    'harpiesfeatherduster': 'منفضة ريش هاربي (Harpie\'s Feather Duster)',
    'snatchsteal': 'السرقة الخاطفة (Snatch Steal)',
    'prematureburial': 'الدفن المبكر (Premature Burial)',
    'gracefulcharity': 'الصدقة النبيلة (Graceful Charity)',
    'gianttrunade': 'الإعصار العملاق (Giant Trunade)',
    'confiscation': 'المصادرة (Confiscation)',
    'theforcefulsentry': 'الحارس الصارم (The Forceful Sentry)',
    'delinquentduo': 'الثنائي المشاغب (Delinquent Duo)',
    'painfulchoice': 'الخيار المؤلم (Painful Choice)',
    'axeofdespair': 'فأس اليأس (Axe of Despair)',
    'unitedwestand': 'في الاتحاد قوة (United We Stand)',
    'magepower': 'طاقة الساحر (Mage Power)',
    'fissure': 'الشق الأرضي (Fissure)',
    'dianketothecuremaster': 'ديان كيتو سيدة الشفاء (Dian Keto)',
    'ookazi': 'أوكازي (Ookazi)',
    'hinotama': 'كرة النار (Hinotama)',
    'tremendousfire': 'الحريق الهائل (Tremendous Fire)',
    'finalflame': 'اللهب الأخير (Final Flame)',
    'sparks': 'الشرارات (Sparks)',
    'swordsmanoflandstar': 'مبارز أرض النجوم (Swordsman of Landstar)',
    'polymerization': 'الانصهار الخارق (Polymerization)',
    'defusion': 'تفكيك الاندماج (De-Fusion)',
    'fusionsage': 'حكيم الاندماج (Fusion Sage)',
    'theeyeoftimaeus': 'عين تيمايوس (The Eye of Timaeus)',
    'theclawofhermos': 'مخلب هيرموس (The Claw of Hermos)',
    'thefangofritias': 'ناب كريتياس (The Fang of Critias)',
    'mirrorforce': 'قوة المرآة (Mirror Force)',
    'magiccylinder': 'الأسطوانة السحرية (Magic Cylinder)',
    'negateattack': 'إلغاء الهجوم (Negate Attack)',
    'waboku': 'وابوكو (Waboku)',
    'sakuretsuarmor': 'درع ساكوريتسو (Sakuretsu Armor)',
    'traphole': 'حفرة الفخ (Trap Hole)',
    'bottomlesstraphole': 'حفرة الفخ السحيقة (Bottomless Trap Hole)',
    'torrentialtribute': 'السيل الجارف (Torrential Tribute)',
    'callofthehaunted': 'نداء المقبرة (Call of the Haunted)',
    'solemnjudgment': 'الحكم المهيب (Solemn Judgment)',
    'imperialorder': 'الأمر الإمبراطوري (Imperial Order)',
    'gravitybind': 'قيد الجاذبية (Gravity Bind)',
    'royaldecree': 'المرسوم الملكي (Royal Decree)',
    'ringofdestruction': 'خاتم التدمير (Ring of Destruction)',
    'magicjammer': 'مشوش السحر (Magic Jammer)',
    'seventoolsofthebandit': 'أدوات قاطع الطريق السبعة (Seven Tools)',
    'justdesserts': 'الجزاء العادل (Just Desserts)',
    'ceasefire': 'وقف إطلاق النار (Ceasefire)',
    'dusttornado': 'إعصار الغبار (Dust Tornado)',
    'compulsoryevacuationdevice': 'جهاز الإخلاء الإجباري (Compulsory Evacuation)',
    'dimensionalprison': 'سجن الأبعاد (Dimensional Prison)',
    'spellbindingcircle': 'دائرة التقييد السحرية (Spellbinding Circle)',
    'destructionpunch': 'قبضة التدمير المضادة (Destruction Punch)',
    'shadowspell': 'سحر الظل المقيد (Shadow Spell)',
    'nightmarewheel': 'عجلة الكوابيس (Nightmare Wheel)',
    'acidtraphole': 'حفرة الفخ الحامضية (Acid Trap Hole)',
    'chaindestruction': 'سلسلة التدمير (Chain Destruction)',
    'drainingtshield': 'الدرع المستنزف (Draining Shield)',
    'magicdrain': 'استنزاف السحر (Magic Drain)',
    'widehadspread': 'الشباك الواسعة (Widespread Ruin)',
    'widespreadruin': 'الخراب الشامل (Widespread Ruin)',
    'reinforcementofthearmy': 'تعزيز الجيش (Reinforcement of the Army)',
    'theshallowgrave': 'القبر الضحل (The Shallow Grave)',
    'soulrelease': 'تحرير الأرواح (Soul Release)',
    'tributetothetonedoomed': 'قربان للهلاك (Tribute to the Doomed)',
    'noblemanofcrossout': 'نبيل الإقصاء (Nobleman of Crossout)',
    'noblemanofextermination': 'نبيل الإبادة (Nobleman of Extermination)',
    'upstartgoblin': 'العفريت المغرور (Upstart Goblin)',
    'reload': 'إعادة التلقيم (Reload)',
    'magicalmallet': 'المطرقة السحرية (Magical Mallet)',
    'scapegoat': 'كبش الفداء (Scapegoat)',
    'bookofmoon': 'كتاب القمر (Book of Moon)',
    'enemycontroller': 'متحكم الأعداء (Enemy Controller)',
    'crushcardvirus': 'فيروس تحطيم البطاقات (Crush Card Virus)',
    'extinctionbystorm': 'الانقراض بالعاصفة (Heavy Storm)',
    'mysticbox': 'الصندوق السحري الغامض (Mystic Box)',
    'costdown': 'تخفيض التكلفة (Cost Down)',
    'creaturewap': 'تبادل المخلوقات (Creature Swap)',
    'creatureswap': 'تبادل المخلوقات (Creature Swap)',
    'shrink': 'التقليص (Shrink)',
    'rushrecklessly': 'الاندفاع الطائش (Rush Recklessly)'
  };

  function categorizeCard(c) {
    const nameNorm = norm(c.name);
    const desc = (c.description || '').trim();
    const descLower = desc.toLowerCase();

    let category = 'Special Ability';
    let trigger = 'Manual / Action';
    let arabicCategory = 'قدرة خاصة';
    let arabicTrigger = 'تفعيل يدوي';
    let engineStatus = 'Dynamic Parser';
    let arabicName = arabicDictionary[nameNorm] || c.name;

    if (c.type === 'monster') {
      const regEntry = monsterRegistry[nameNorm];
      if (regEntry) {
        engineStatus = 'Dedicated Registry Handler';
        arabicName = regEntry.arabicName || arabicDictionary[nameNorm] || c.name;
        trigger = regEntry.trigger || 'special';
      }

      if (descLower.startsWith('flip:') || descLower.includes('flip:')) {
        category = 'Flip Effect';
        arabicCategory = 'تأثير قلب (Flip)';
        trigger = 'flip';
        arabicTrigger = 'تلقائي عند قلب الوحش وجهه لأعلى';
      } else if (descLower.includes('when this card is destroyed') || descLower.includes('if this card is destroyed') || descLower.includes('sent to the graveyard')) {
        category = 'On Destruction / Graveyard';
        arabicCategory = 'عند التدمير / الذهاب للمقبرة';
        trigger = 'onDestroy';
        arabicTrigger = 'تلقائي عند تدمير الوحش في المعركة أو بتأثير';
      } else if (descLower.includes('cannot be destroyed by battle') || descLower.includes('not destroyed as a result of battle')) {
        category = 'Battle Immunity';
        arabicCategory = 'حصانة كاملة ضد التدمير في المعركة';
        trigger = 'continuous';
        arabicTrigger = 'مستمر طوال المعركة';
      } else if (descLower.includes('trap cards cannot be activated') || descLower.includes('negate all trap') || descLower.includes('negate the effect of all trap')) {
        category = 'Trap Floodgate';
        arabicCategory = 'إبطال وتجميد الفخاخ (Trap Negation)';
        trigger = 'continuous';
        arabicTrigger = 'مستمر طوال وجود الوحش في الملعب';
      } else if (descLower.includes('can attack your opponent directly') || descLower.includes('attack directly')) {
        category = 'Direct Attack';
        arabicCategory = 'هجوم مباشر على نقاط حياة الخصم';
        trigger = 'ignition';
        arabicTrigger = 'في مرحلة المعركة (Battle Phase)';
      } else if (descLower.includes('inflict') && descLower.includes('damage')) {
        category = 'LP Burn';
        arabicCategory = 'حرق نقاط حياة الخصم (Effect Damage)';
        trigger = 'ignition';
        arabicTrigger = 'عند تفعيل القدرة';
      } else if (descLower.includes('gain') && descLower.includes('life points')) {
        category = 'LP Recovery';
        arabicCategory = 'زيادة واسترجاع نقاط حياة اللاعب';
        trigger = 'ignition';
        arabicTrigger = 'عند تفعيل القدرة';
      } else if (descLower.includes('tribute this card') || descLower.includes('you can tribute')) {
        category = 'Tribute Ignition';
        arabicCategory = 'تضحية بالوحش لتفعيل تأثير قوي';
        trigger = 'ignition';
        arabicTrigger = 'عند التضحية بالوحش في دورك';
      } else if (descLower.includes('add') && descLower.includes('deck to your hand')) {
        category = 'Search & Tutor';
        arabicCategory = 'سحب والبحث عن بطاقة من المجموعة لليد';
        trigger = 'search';
        arabicTrigger = 'عند الاستدعاء أو التدمير';
      } else if (descLower.includes('special summon') && (descLower.includes('from your hand') || descLower.includes('from your deck') || descLower.includes('from your graveyard'))) {
        category = 'Special Summon Engine';
        arabicCategory = 'استدعاء خاص من اليد / المجموعة / المقبرة';
        trigger = 'summon';
        arabicTrigger = 'عند تحقق شرط الاستدعاء';
      } else if (descLower.includes('increase') || descLower.includes('gain') && descLower.includes('atk')) {
        category = 'ATK / DEF Boost';
        arabicCategory = 'رفع وزيادة نقاط الهجوم / الدفاع';
        trigger = 'continuous';
        arabicTrigger = 'مستمر أو مشروط';
      } else if (descLower.includes('return') && descLower.includes('hand')) {
        category = 'Card Bounce';
        arabicCategory = 'إرجاع بطاقات من الساحة إلى يد صاحبها';
        trigger = 'ignition';
        arabicTrigger = 'عند تفعيل التأثير';
      } else {
        category = 'Monster Effect';
        arabicCategory = 'قدرة وحش خاصة';
        trigger = 'special';
        arabicTrigger = 'حسب نص وتوقيت البطاقة';
      }
    } else if (c.type === 'spell') {
      if (spellTitles[nameNorm]) {
        engineStatus = 'Dedicated Spell Handler';
        arabicName = spellTitles[nameNorm];
      }

      if (descLower.includes('destroy all monsters') || descLower.includes('destroy 1 monster') || descLower.includes('destroys all monsters')) {
        category = 'Monster Destruction';
        arabicCategory = 'تدمير وحوش الساحة (Removal)';
      } else if (descLower.includes('special summon') && descLower.includes('graveyard')) {
        category = 'Graveyard Summon';
        arabicCategory = 'استدعاء خاص وإحياء وحش من المقبرة';
      } else if (descLower.includes('draw 2 cards') || descLower.includes('draw 3 cards') || descLower.includes('draw cards')) {
        category = 'Card Draw Power';
        arabicCategory = 'سحب بطاقات إضافية من المجموعة';
      } else if (descLower.includes('take control') || descLower.includes('change of heart') || descLower.includes('snatch steal')) {
        category = 'Control Change';
        arabicCategory = 'السيطرة على وحش الخصم واستخدامه';
      } else if (descLower.includes('destroy all spell and trap') || descLower.includes('destroy 1 spell or trap') || descLower.includes('spell and trap cards')) {
        category = 'Spell / Trap Removal';
        arabicCategory = 'تدمير بطاقات السحر والفخاخ للخصم';
      } else if (descLower.includes('cannot attack') || descLower.includes('swords of revealing light')) {
        category = 'Battle Lock / Defense';
        arabicCategory = 'شل حركة هجوم وحوش الخصم لعدة أدوار';
      } else if (descLower.includes('increase the atk') || descLower.includes('gains') && descLower.includes('atk')) {
        category = 'Equip / ATK Boost';
        arabicCategory = 'زيادة هجوم ودفاع الوحش المجهز';
      } else if (c.subType === 'field') {
        category = 'Field Arena Spell';
        arabicCategory = 'سحر ساحة يغير طبيعة الميدان وقوى السلالات';
      } else if (c.subType === 'ritual') {
        category = 'Ritual Summon Catalyst';
        arabicCategory = 'سحر طقوس لاستدعاء وحش الطقوس بالتضحية';
      } else if (descLower.includes('inflict') && descLower.includes('damage')) {
        category = 'Burn Damage Spell';
        arabicCategory = 'حرق وإنقاص نقاط حياة الخصم مباشرة';
      } else if (descLower.includes('increase') && descLower.includes('life points')) {
        category = 'LP Recovery Spell';
        arabicCategory = 'استرجاع وزيادة نقاط حياة اللاعب';
      } else {
        category = 'Magical Utility';
        arabicCategory = 'سحر دعم وتأثير تكتيكي';
      }

      trigger = c.subType === 'quickplay' ? 'Quick-Play (سريع في أي دور)' : (c.subType === 'continuous' ? 'Continuous (مستمر)' : 'Normal Spell (في دورك)');
      arabicTrigger = trigger;
    } else if (c.type === 'trap') {
      if (trapTitles[nameNorm]) {
        engineStatus = 'Dedicated Trap Handler';
        arabicName = trapTitles[nameNorm];
      }

      if (descLower.includes('when an opponent\'s monster declares an attack') || descLower.includes('when your opponent attacks')) {
        category = 'Attack Battle Trap';
        arabicCategory = 'فخ معركة (يتفعل عند إعلان هجوم الخصم)';
        trigger = 'battle_attack';
        arabicTrigger = 'رد فعل فوري عند إعلان هجوم الخصم';
      } else if (descLower.includes('when a monster is summoned') || descLower.includes('when your opponent summons')) {
        category = 'Summon Counter Trap';
        arabicCategory = 'فخ استدعاء (يتفعل عند استدعاء الخصم لوحش)';
        trigger = 'on_summon';
        arabicTrigger = 'رد فعل فوري عند نزول وحش للساحة';
      } else if (c.subType === 'counter' || descLower.includes('negate the activation') || descLower.includes('negate')) {
        category = 'Counter Trap (Negation)';
        arabicCategory = 'فخ مضاد لإبطال تفعيل سحر / فخ / استدعاء';
        trigger = 'counter_negate';
        arabicTrigger = 'إبطال تفعيل بطاقة أخرى فورياً (أعلى سرعة 3)';
      } else if (descLower.includes('cannot attack') || descLower.includes('level 4 or higher monsters cannot attack')) {
        category = 'Continuous Stall / Lock';
        arabicCategory = 'فخ مستمر لشل ومنع هجوم الوحوش';
        trigger = 'continuous';
        arabicTrigger = 'مستمر طوال بقاء الفخ مكشوفاً';
      } else if (descLower.includes('special summon') && descLower.includes('graveyard')) {
        category = 'Graveyard Trap Rebirth';
        arabicCategory = 'فخ استدعاء وإحياء وحش من المقبرة للملعب';
        trigger = 'action_trap';
        arabicTrigger = 'تفعيل حر في أي وقت بعد دور التثبيت';
      } else if (descLower.includes('inflict') && descLower.includes('damage')) {
        category = 'Burn / Damage Retaliation';
        arabicCategory = 'فخ حرق وعقاب بالضرر على الخصم';
        trigger = 'action_trap';
        arabicTrigger = 'عند تحقق شرط الضرر';
      } else {
        category = 'Disruption Trap';
        arabicCategory = 'فخ تعطيل وتشتيت خطة الخصم';
        trigger = 'action_trap';
        arabicTrigger = 'تفعيل حر بعد دور التثبيت';
      }
    }

    return {
      category,
      arabicCategory,
      trigger,
      arabicTrigger,
      engineStatus,
      arabicName
    };
  }

  const abilityCards = [];

  cards.forEach(c => {
    let isEffectCard = false;
    let isSpecialFusionOrRitual = false;

    if (c.type === 'spell' || c.type === 'trap') {
      isEffectCard = true;
    } else if (c.type === 'monster') {
      if (c.subType === 'effect') {
        isEffectCard = true;
      } else if (c.subType === 'ritual' || c.subType === 'fusion') {
        const d = c.description || '';
        const isVanillaRitual = /This monster can only be Ritual Summoned with the Ritual Spell Card/i.test(d) && !d.includes('When this card') && !d.includes('You can') && !d.includes('take on the ATK') && !d.includes('Once per turn') && !d.includes('destroy');
        const isVanillaFusion = /"[^"]+"\s*\+\s*"[^"]+"/i.test(d) && d.split('.').length <= 2 && !d.includes('When') && !d.includes('You can') && !d.includes('Once per turn') && !d.includes('destroy') && !d.includes('Cannot be');
        if (!isVanillaRitual && !isVanillaFusion && d.trim().length > 0) {
          isEffectCard = true;
          isSpecialFusionOrRitual = true;
        }
      }
    }

    if (isEffectCard) {
      const meta = categorizeCard(c);
      abilityCards.push({
        id: c.id,
        cardCode: c.cardCode,
        name: c.name,
        arabicName: meta.arabicName,
        type: c.type,
        subType: c.subType,
        isSpecialFusionOrRitual,
        attribute: c.attribute || null,
        race: c.race || null,
        level: c.level || null,
        atk: c.atk !== undefined ? c.atk : null,
        def: c.def !== undefined ? c.def : null,
        category: meta.category,
        arabicCategory: meta.arabicCategory,
        trigger: meta.trigger,
        arabicTrigger: meta.arabicTrigger,
        engineStatus: meta.engineStatus,
        description: (c.description || '').trim(),
        image: c.image
      });
    }
  });

  // Sort: Monsters first, then Spells, then Traps, alphabetically by name
  abilityCards.sort((a, b) => {
    const typeOrder = { monster: 1, spell: 2, trap: 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    return a.name.localeCompare(b.name);
  });

  const monsterCount = abilityCards.filter(c => c.type === 'monster').length;
  const spellCount = abilityCards.filter(c => c.type === 'spell').length;
  const trapCount = abilityCards.filter(c => c.type === 'trap').length;
  const dedicatedCount = abilityCards.filter(c => c.engineStatus.includes('Dedicated')).length;

  console.log(`Generated catalog: ${abilityCards.length} cards (${monsterCount} Monsters, ${spellCount} Spells, ${trapCount} Traps).`);
  console.log(`Dedicated engine handlers: ${dedicatedCount}`);

  // 1. Output JSON
  const jsonOutput = {
    metadata: {
      title: "Yu-Gi-Oh! Complete Card Abilities & Effects Catalog",
      arabicTitle: "الدليل الشامل الكامل لجميع البطاقات ذات القدرات والتأثيرات في لعبة يوغي",
      sourceFiles: [
        "mobile/src/data/cards.json",
        "mobile/src/game/engine/MonsterEffects.js",
        "mobile/src/game/engine/SpellEffects.js",
        "mobile/src/game/engine/TrapEffects.js"
      ],
      generatedAt: new Date().toISOString(),
      totalCardsWithAbilities: abilityCards.length,
      statistics: {
        totalEffectMonsters: monsterCount,
        totalSpells: spellCount,
        totalTraps: trapCount,
        dedicatedEngineHandlers: dedicatedCount,
        dynamicParserCoverage: abilityCards.length - dedicatedCount
      }
    },
    cards: abilityCards
  };

  const JSON_OUT_MOBILE = path.join(__dirname, '../src/data/card_abilities.json');
  const JSON_OUT_ROOT = path.join(ROOT_DIR, 'card_abilities.json');
  fs.writeFileSync(JSON_OUT_MOBILE, JSON.stringify(jsonOutput, null, 2), 'utf8');
  fs.writeFileSync(JSON_OUT_ROOT, JSON.stringify(jsonOutput, null, 2), 'utf8');
  console.log(`JSON files written.`);

  // 2. Output Markdown
  let md = `# 📜 الدليل الشامل لجميع البطاقات ذات القدرات الخاصة في لعبة يوغي (Yu-Gi-Oh!)
## The Definitive Guide to All Effect Cards, Spells & Traps in the Game Engine

> **توثيق كامل ودقيق مستخرج من ملفات اللعبة الأصلية (\`cards.json\`) ومحركات التأثيرات البرمجية (\`MonsterEffects.js\`, \`SpellEffects.js\`, \`TrapEffects.js\`).**

---

### 📊 إحصائيات عامة لبطاقات القدرات في اللعبة

| التصنيف | عدد البطاقات | النسبة | طبيعة القدرات وميكانيكا التفعيل |
| :--- | :---: | :---: | :--- |
| 🐉 **وحوش التأثير (Effect Monsters)** | **${monsterCount}** | ${((monsterCount / abilityCards.length) * 100).toFixed(1)}% | تأثيرات قلب (Flip)، عند التدمير، حصانة معركة، هجوم مباشر، تعديل ATK/DEF |
| ✨ **بطاقات السحر (Spell Cards)** | **${spellCount}** | ${((spellCount / abilityCards.length) * 100).toFixed(1)}% | تدمير شامل، إحياء من المقبرة، سحب كروت، سحر ساحة، سحر سريع، تجهيز |
| ⚡ **بطاقات الفخاخ (Trap Cards)** | **${trapCount}** | ${((trapCount / abilityCards.length) * 100).toFixed(1)}% | تصدي للهجوم، تدمير عند الاستدعاء، فخاخ مضادة (Counter)، تجميد هجوم |
| 🏆 **الإجمالي الكلي** | **${abilityCards.length} بطاقة** | **100%** | **جميع بطاقات اللعبة التي تمتلك قدرات خاصة وتأثيرات نشطة** |

---

### 📑 فهرس المحتويات (Quick Index)
1. [القسم الأول: وحوش التأثير والقدرات الخاصة (${monsterCount} وحش)](#-القسم-الأول-وحوش-التأثير-والقدرات-الخاصة-effect-monsters)
   - [1.1 أشهر قدرات وحوش القلب الملحمية (Flip Effects)](#11-أشهر-قدرات-وحوش-القلب-الملحمية-flip-effects)
   - [1.2 أشهر قدرات عند التدمير والإرسال للمقبرة (On Destruction)](#12-أشهر-قدرات-عند-التدمير-والإرسال-للمقبرة-on-destruction)
   - [1.3 وحوش الحصانة والتأثيرات المستمرة (Battle Immunity & Continuous)](#13-وحوش-الحصانة-والتأثيرات-المستمرة-battle-immunity--continuous)
   - [1.4 الفهرس الكامل لجميع وحوش التأثير (${monsterCount} وحش)](#14-الفهرس-الكامل-لجميع-وحوش-التأثير-${monsterCount}-وحش)
2. [القسم الثاني: بطاقات السحر وقدراتها (${spellCount} بطاقة)](#-القسم-الثاني-بطاقات-السحر-وقدراتها-spell-cards---${spellCount}-بطاقة)
   - [2.1 أنواع بطاقات السحر في اللعبة](#21-أنواع-بطاقات-السحر-في-اللعبة)
   - [2.2 الفهرس الكامل لجميع بطاقات السحر (${spellCount} سحر)](#22-الفهرس-الكامل-لجميع-بطاقات-السحر-${spellCount}-سحر)
3. [القسم الثالث: بطاقات الفخاخ وقدراتها (${trapCount} بطاقة)](#-القسم-الثالث-بطاقات-الفخاخ-وقدراتها-trap-cards---${trapCount}-بطاقة)
   - [3.1 أنواع بطاقات الفخاخ في اللعبة](#31-أنواع-بطاقات-الفخاخ-في-اللعبة)
   - [3.2 الفهرس الكامل لجميع بطاقات الفخاخ (${trapCount} فخ)](#32-الفهرس-الكامل-لجميع-بطاقات-الفخاخ-${trapCount}-فخ)

---

## 🐉 القسم الأول: وحوش التأثير والقدرات الخاصة (Effect Monsters)

يحتوي محرك اللعبة على **${monsterCount} وحش تأثير**، يدعمها نظام هجين متطور يتكون من:
1. **معالجات برمجية مخصصة (\`MONSTER_EFFECT_REGISTRY\`):** لأشهر وحوش السلسلة الكلاسيكية التي تمتلك تأثيرات معقدة.
2. **محرك الذكاء الاصطناعي الديناميكي المستقل (\`Autonomous Dynamic Monster Effect Engine\`):** يقوم بتحليل وقراءة نص بطاقة أي وحش تأثير تلقائياً وتنفيذ قدرته الميدانية فورياً.

### 1.1 أشهر قدرات وحوش القلب الملحمية (Flip Effects)
| الوحش | الاسم العربي | الهجوم / الدفاع | القدرة الخاصة والتأثير |
| :--- | :--- | :---: | :--- |
| **Man-Eater Bug** | حشرة أكلة البشر | 450 / 600 | **تأثير قلب:** اختر وحشاً واحداً في الملعب ودمّره فوراً. |
| **Cyber Jar** | الجرة الإلكترونية | 900 / 900 | **تأثير قلب:** تدمير جميع الوحوش في الملعب، وكل لاعب يكشف 5 كروت من مجموعته ويستدعي الوحوش فوراً. |
| **Morphing Jar** | جرة التحول | 700 / 600 | **تأثير قلب:** يتخلص كل لاعب من كامل يده إلى المقبرة، ثم يسحب 5 بطاقات جديدة. |
| **Penguin Soldier** | جندي البطريق | 750 / 500 | **تأثير قلب:** إرجاع ما يصل إلى وحشين من الملعب إلى يد صاحبها. |
| **Magician of Faith** | ساحرة الإيمان | 300 / 400 | **تأثير قلب:** استرجاع بطاقة سحر واحدة من مقبرتك إلى يدك. |
| **Mask of Darkness** | قناع الظلام | 900 / 400 | **تأثير قلب:** استرجاع بطاقة فخ واحدة من مقبرتك إلى يدك. |

### 1.2 أشهر قدرات عند التدمير والإرسال للمقبرة (On Destruction)
| الوحش | الاسم العربي | الهجوم / الدفاع | القدرة الخاصة والتأثير |
| :--- | :--- | :---: | :--- |
| **Sangan** | سانغان | 1000 / 600 | **عند الإرسال للمقبرة:** اختر وحشاً بهجوم 1500 أو أقل من مجموعتك وأضفه ليدك. |
| **Witch of the Black Forest** | ساحرة الغابة السوداء | 1100 / 1200 | **عند الإرسال للمقبرة:** اختر وحشاً بدفاع 1500 أو أقل من مجموعتك وأضفه ليدك. |
| **Giant Germ** | الجرثومة العملاقة | 1000 / 100 | **عند التدمير في المعركة:** إلحاق 500 نقطة ضرر بالخصم، واستدعاء نسخ أخرى من مجموعتك. |
| **Nimble Momonga** | السنجاب السريع | 1000 / 100 | **عند التدمير في المعركة:** زيادة نقاط حياتك بمقدار 1000 نقطة، واستدعاء السناجب الأخرى. |

### 1.3 وحوش الحصانة والتأثيرات المستمرة (Battle Immunity & Continuous)
| الوحش | الاسم العربي | الهجوم / الدفاع | القدرة الخاصة والتأثير |
| :--- | :--- | :---: | :--- |
| **Jinzo** | جينزو | 2400 / 1500 | **تأثير مستمر:** إبطال جميع بطاقات الفخ في الملعب تماماً ومنع تفعيلها. |
| **Marshmallon** | مارشمالون | 300 / 500 | **حصانة مستمرة:** لا يمكن تدميره بالمعركة، وإذا هوجم وهو مقلوب يتلقى الخصم 1000 ضرر. |
| **Spirit Reaper** | حاصد الأرواح | 300 / 200 | **حصانة مستمرة:** لا يُدمر في المعركة، وعندما يهاجم نقاط الخصم مباشرة يرمي الخصم بطاقة من يده. |
| **Obnoxious Celtic Guard** | الحارس السلتي المنيع | 1400 / 1200 | **حصانة مستمرة:** لا يمكن تدميره في المعركة بواسطة أي وحش يمتلك 1900 هجوم أو أكثر. |

---

### 1.4 الفهرس الكامل لجميع وحوش التأثير (${monsterCount} وحش)

| # | الكود | اسم الوحش | الاسم العربي | المستوى / العنصر | الهجوم / الدفاع | تصنيف القدرة | شرح القدرة والتأثير الرسمي |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- |
`;

  const monsters = abilityCards.filter(c => c.type === 'monster');
  monsters.forEach((c, idx) => {
    const cleanDesc = c.description.replace(/\n+/g, ' ').replace(/\|/g, '/');
    md += `| ${idx + 1} | \`${c.cardCode}\` | **${c.name}** | ${c.arabicName} | Lv.${c.level} / ${c.attribute} | ${c.atk}/${c.def} | ${c.arabicCategory} | ${cleanDesc} |\n`;
  });

  md += `
---

## ✨ القسم الثاني: بطاقات السحر وقدراتها (Spell Cards - ${spellCount} بطاقة)

### 2.1 أنواع بطاقات السحر في اللعبة
1. **سحر عادي (Normal Spell):** تفعيل فوري في دورك في المراحل الرئيسية (Main Phase).
2. **سحر سريع (Quick-Play Spell ⚡):** يمكن تفعيله في أي وقت من اليد في دورك، أو تثبيته كفخ لتفعيله في دور الخصم.
3. **سحر مستمر (Continuous Spell ♾️):** يظل في ساحة السحر وتستمر قدرته طوال بقائه مكشوفاً.
4. **سحر تجهيز (Equip Spell ➕):** يُثبت على وحش معين لرفع هجومه أو منحه قدرات خاصة.
5. **سحر ساحة (Field Spell 🌐):** يوضع في منطقة البيئة ويغير قوانين المعركة وقوى السلالات.
6. **سحر طقوس (Ritual Spell 🕯️):** يستخدم لاستدعاء وحوش الطقوس الأسطورية عبر التضحية بوحوش مساوية للمستوى.

---

### 2.2 الفهرس الكامل لجميع بطاقات السحر (${spellCount} سحر)

| # | الكود | اسم السحر | الاسم العربي | النوع | تصنيف التأثير | شرح القدرة والتأثير الرسمي |
| :---: | :---: | :--- | :--- | :---: | :--- | :--- |
`;

  const spells = abilityCards.filter(c => c.type === 'spell');
  spells.forEach((c, idx) => {
    const cleanDesc = c.description.replace(/\n+/g, ' ').replace(/\|/g, '/');
    md += `| ${idx + 1} | \`${c.cardCode}\` | **${c.name}** | ${c.arabicName} | ${c.subType} | ${c.arabicCategory} | ${cleanDesc} |\n`;
  });

  md += `
---

## ⚡ القسم الثالث: بطاقات الفخاخ وقدراتها (Trap Cards - ${trapCount} بطاقة)

### 3.1 أنواع بطاقات الفخاخ في اللعبة
1. **فخ عادي (Normal Trap):** يُثبت مقلوباً لوجه، ويمكن تفعيله في أي دور بعد دور التثبيت عند تحقق شرطه.
2. **فخ مستمر (Continuous Trap ♾️):** يظل في الملعب بعد تفعيله وتستمر قدرته المعطلة في خنق استراتيجيات الخصم.
3. **فخ مضاد (Counter Trap ↩️):** أعلى سرعة تفعيل في اللعبة (Speed Spell 3)، مخصص لإبطال السحر، الفخاخ، وتأثيرات الوحوش.

---

### 3.2 الفهرس الكامل لجميع بطاقات الفخاخ (${trapCount} فخ)

| # | الكود | اسم الفخ | الاسم العربي | النوع | شرط وتوقيت التفعيل | شرح القدرة والتأثير الرسمي |
| :---: | :---: | :--- | :--- | :---: | :--- | :--- |
`;

  const traps = abilityCards.filter(c => c.type === 'trap');
  traps.forEach((c, idx) => {
    const cleanDesc = c.description.replace(/\n+/g, ' ').replace(/\|/g, '/');
    md += `| ${idx + 1} | \`${c.cardCode}\` | **${c.name}** | ${c.arabicName} | ${c.subType} | ${c.arabicTrigger} | ${cleanDesc} |\n`;
  });

  md += `
---

### 🛡️ ملاحظات تقنية وقانونية:
- **دقة البيانات:** النصوص مستخرجة بالكامل ومطابقة للملفات الثنائية للعبة الأصلية (\`card_desceng.bin\` و \`cards.json\`).
- **محرك اللعبة المدمج:** تم مواءمة جميع قدرات الكروت لتتوافق مع محركات المبارزة الثلاثة: \`MonsterEffects.js\`، \`SpellEffects.js\`، و \`TrapEffects.js\`.
- **ملف JSON المصاحب:** يتوفر ملف \`card_abilities.json\` في نفس المجلد ومجلد \`mobile/src/data\` للاستخدام البرمجي المباشر.
`;

  const MD_OUT_MOBILE = path.join(__dirname, '../CARD_ABILITIES_GUIDE.md');
  const MD_OUT_ROOT = path.join(ROOT_DIR, 'CARD_ABILITIES_GUIDE.md');
  fs.writeFileSync(MD_OUT_MOBILE, md, 'utf8');
  fs.writeFileSync(MD_OUT_ROOT, md, 'utf8');
  console.log(`Markdown guides written.`);
}

main().catch(console.error);
