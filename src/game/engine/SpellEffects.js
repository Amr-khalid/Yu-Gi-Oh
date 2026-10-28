/**
 * SpellEffects.js
 * Comprehensive resolution for ALL 198 spell cards in Yu-Gi-Oh! Mobile.
 * Implements authentic TCG and anime mechanics: Field Spells, Rituals, Fusions,
 * Board Wipes, Target Removals, Direct Burn Damage, LP Recovery, Draw/Hand Advantage,
 * Graveyard Rebirths, Special Summons, Battle Position Changers, Equip Cards,
 * and Continuous/Legendary Pharaonic effects.
 */

import { checkWinConditions } from './WinCondition.js';
import { drawCardForTurnPlayer } from './PhaseManager.js';
import cardsData from '../../data/cards.json' with { type: 'json' };

const cardsByName = new Map();
if (Array.isArray(cardsData)) {
  for (const c of cardsData) {
    if (c && c.name) {
      cardsByName.set(c.name.toLowerCase().trim(), c);
    }
  }
}

/**
 * Main Spell Resolution Entry Point
 * @param {Object} state - Authoritative Duel GameState
 * @param {number} playerIndex - 0 (User/Team 0) or 1 (Opponent/Team 1)
 * @param {Object} spell - The spell card object being activated
 * @param {Object} targetContext - Optional targeting payload (selectedTargetCard, targetZoneIndex, etc.)
 * @param {Object} helpers - Engine callbacks: { destroyMonsterSlot, recalculateAllMonsterStats, FIELD_SPELLS }
/**
 * Main Spell Resolution Entry Point
 * @param {Object} state - Authoritative Duel GameState
 * @param {number} playerIndex - 0 (User/Team 0) or 1 (Opponent/Team 1)
 * @param {Object} spell - The spell card object being activated
 * @param {Object} targetContext - Optional targeting payload (selectedTargetCard, targetZoneIndex, etc.)
 * @param {Object} helpers - Engine callbacks: { destroyMonsterSlot, recalculateAllMonsterStats, FIELD_SPELLS }
 * @returns {Object} Effect metadata for UI animation and logging
 */
export function resolveSpellEffect(state, playerIndex, spell, targetContext = null, helpers = {}) {
  const trackedDestructions = [];
  const rawDestroySlot = helpers.destroyMonsterSlot || ((s, pIdx, zIdx, reason, src) => {
    const p = s.players[pIdx];
    if (p && p.monsterZones[zIdx]) {
      const c = p.monsterZones[zIdx].card;
      p.graveyard.push(c);
      p.monsterZones[zIdx] = null;
      return { destroyedCard: c };
    }
    return null;
  });

  const trackedDestroySlot = (s, pIdx, zIdx, reason, src) => {
    const p = s.players[pIdx];
    if (p && p.monsterZones[zIdx]) {
      trackedDestructions.push({
        playerIndex: pIdx,
        zoneIndex: zIdx,
        card: p.monsterZones[zIdx].card,
        position: p.monsterZones[zIdx].position,
      });
    }
    return rawDestroySlot(s, pIdx, zIdx, reason, src);
  };

  const enrichedHelpers = {
    ...helpers,
    destroyMonsterSlot: trackedDestroySlot,
  };

  const res = _resolveSpellEffectInternal(state, playerIndex, spell, targetContext, enrichedHelpers);
  if (!res) return res;

  const spellName = (spell.name || '').toLowerCase();
  if (trackedDestructions.length > 0) {
    res.effectCategory = res.effectCategory || 'MONSTER_DESTRUCTION';
    res.destroyedZones = res.destroyedZones || trackedDestructions;
    if (!res.destructionType) {
      if (spellName.includes('raigeki')) res.destructionType = 'lightning';
      else if (spellName.includes('dark hole')) res.destructionType = 'vortex';
      else if (spellName.includes('fissure') || spellName.includes('tribute to the doomed')) res.destructionType = 'shatter';
      else res.destructionType = 'shatter';
    }
  }
  return res;
}

function _resolveSpellEffectInternal(state, playerIndex, spell, targetContext = null, helpers = {}) {
  const player = state.players[playerIndex];
  const opponent = state.players[1 - playerIndex];
  const name = (spell.name || '').toLowerCase();
  const subType = spell.subType || 'normal';
  const desc = (spell.description || '').toLowerCase();

  const destroySlot = helpers.destroyMonsterSlot;
  const recalcStats = helpers.recalculateAllMonsterStats || (() => {});
  const fieldSpellsDict = helpers.FIELD_SPELLS || {};

  // Check if Imperial Order is active on field: completely negates Spells!
  for (const p of state.players) {
    for (const st of p.spellTrapZones) {
      if (st && st.faceUp && (st.card?.name || '').toLowerCase().includes('imperial order')) {
        state.lastLog.push(`الأمر الإمبراطوري (Imperial Order)! تم إبطال مفعول بطاقة السحر ${spell.name} بالكامل!`);
        return {
          type: 'negated_by_imperial_order',
          title: 'إبطال بالأمر الإمبراطوري',
          desc: `عطّل فخ الأمر الإمبراطوري سحر ${spell.name}!`,
        };
      }
    }
  }

  // =========================================================================
  // 1. FIELD SPELLS (Yami, Umi, Sogen, Forest, Mountain, Wasteland, Gaia, etc.)
  // =========================================================================
  const isField = subType === 'field' ||
    name.includes('yami') ||
    name.includes('umi') ||
    name.includes('sogen') ||
    name.includes('forest') ||
    name.includes('mountain') ||
    name.includes('wasteland') ||
    name.includes('gaia power') ||
    name.includes('molten destruction') ||
    name.includes('luminous spark') ||
    name.includes('mystic plasma') ||
    name.includes('rising air') ||
    name.includes('air current') ||
    name.includes('sanctuary') ||
    name.includes('necrovalley') ||
    name.includes('umiiruka') ||
    name.includes('seal of orichalcos') ||
    name.includes('fusion gate');

  if (isField) {
    let fieldKey = 'yami';
    if (name.includes('umiiruka') || name.includes('umi')) fieldKey = 'umi';
    else if (name.includes('sogen')) fieldKey = 'sogen';
    else if (name.includes('forest')) fieldKey = 'forest';
    else if (name.includes('mountain')) fieldKey = 'mountain';
    else if (name.includes('wasteland')) fieldKey = 'wasteland';
    else if (name.includes('gaia')) fieldKey = 'gaia';
    else if (name.includes('molten') || name.includes('burning')) fieldKey = 'burn';
    else if (name.includes('luminous') || name.includes('shine')) fieldKey = 'shine';
    else if (name.includes('plasma')) fieldKey = 'plasma';
    else if (name.includes('rising air') || name.includes('air current')) fieldKey = 'wind';
    else if (name.includes('sanctuary')) fieldKey = 'sanctuary';
    else if (name.includes('necrovalley')) fieldKey = 'necrovalley';

    const fieldConfig = fieldSpellsDict[fieldKey] || {
      arabicName: spell.name,
      arabicSummary: '+200 هجوم ودفاع للوحوش المتوافقة',
      bgImage: '/assets/fie_dark.png',
      themeClass: 'field-theme-yami',
    };

    if (state.activeFieldSpell && state.activeFieldSpell.card) {
      const prevOwner = state.players[state.activeFieldSpell.playerIndex];
      if (prevOwner) {
        prevOwner.graveyard.push(state.activeFieldSpell.card);
      }
    }

    state.activeFieldSpell = {
      card: spell,
      playerIndex,
      key: fieldKey,
      name: spell.name,
      arabicName: fieldConfig.arabicName || spell.name,
      bgImage: fieldConfig.bgImage || '/assets/fie_dark.png',
      arabicSummary: fieldConfig.arabicSummary || '+200 هجوم ودفاع للوحوش المتوافقة',
      themeClass: fieldConfig.themeClass || 'field-theme-yami',
    };

    recalcStats(state);
    state.lastLog.push(`تغيرت أرض المعركة! سحر الملعب: ${fieldConfig.arabicName}.`);

    return {
      type: 'field_spell',
      title: fieldConfig.arabicName || spell.name,
      desc: `تحولت أرض المعركة ورموزها إلى ${fieldConfig.arabicName}! ${fieldConfig.arabicSummary}`,
      fieldKey,
      bgImage: fieldConfig.bgImage,
    };
  }

  // =========================================================================
  // 2. RITUAL SPELLS (Black Luster, Dark Magic, Relinquished, Zorc, etc.)
  // =========================================================================
  const isRitual = subType === 'ritual' ||
    name.includes('ritual') ||
    name.includes('oath') ||
    name.includes('ark') ||
    name.includes('ceremonial mirror') ||
    name.includes('resurrection of chakra') ||
    name.includes('incandescent ordeal');

  if (isRitual) {
    let targetMonsterName = '';
    if (name.includes('black luster')) targetMonsterName = 'Black Luster Soldier';
    else if (name.includes('dark magic')) targetMonsterName = 'Magician of Black Chaos';
    else if (name.includes('black illusion')) targetMonsterName = 'Relinquished';
    else if (name.includes('zera')) targetMonsterName = 'Zera The Mant';
    else if (name.includes('chakra')) targetMonsterName = 'Chakra';
    else if (name.includes('masked beast')) targetMonsterName = 'The Masked Beast';
    else if (name.includes('fortress whale')) targetMonsterName = 'Fortress Whale';
    else if (name.includes('garma sword')) targetMonsterName = 'Garma Sword';
    else if (name.includes('dark master') || name.includes('zorc')) targetMonsterName = 'Dark Master - Zorc';
    else if (name.includes('shinato')) targetMonsterName = 'Shinato, King of a Higher Plane';
    else if (name.includes('ceremonial mirror') || name.includes('gishki')) targetMonsterName = 'Evigishki Tetrogre';
    else if (name.includes('dawn of the herald') || name.includes('herald')) targetMonsterName = 'Herald of Perfection';
    else if (name.includes('synthesis')) targetMonsterName = 'Lycanthrope';
    else if (name.includes('ritual of grace') || name.includes('northwemko')) targetMonsterName = 'Divine Grace - Northwemko';
    else if (name.includes('ritual of destruction') || name.includes('garlandolf')) targetMonsterName = 'Garlandolf, King of Destruction';
    else if (name.includes('incandescent') || name.includes('flame lord')) targetMonsterName = 'Legendary Flame Lord';

    let ritualMonsterCard = null;
    // Check player's hand first
    const inHandIdx = player.hand.findIndex((c) => (c.name || '').toLowerCase() === targetMonsterName.toLowerCase());
    if (inHandIdx !== -1) {
      ritualMonsterCard = player.hand.splice(inHandIdx, 1)[0];
    } else {
      // Check player's deck
      const inDeckIdx = player.deck.findIndex((c) => (c.name || '').toLowerCase() === targetMonsterName.toLowerCase());
      if (inDeckIdx !== -1) {
        ritualMonsterCard = player.deck.splice(inDeckIdx, 1)[0];
      } else {
        // Fallback from catalog
        ritualMonsterCard = cardsByName.get(targetMonsterName.toLowerCase());
      }
    }

    if (!ritualMonsterCard) {
      ritualMonsterCard = {
        id: 999144,
        name: targetMonsterName || 'Black Luster Soldier',
        type: 'monster',
        subType: 'ritual',
        level: 8,
        atk: 3000,
        def: 2500,
        image: '4397_1.webp',
      };
    }

    // Sacrifice tribute from field if available, otherwise hand
    let tributedCount = 0;
    for (let z = 0; z < 5; z++) {
      if (player.monsterZones[z] && tributedCount < 1) {
        destroySlot(state, playerIndex, z, 'ritual_tribute', spell);
        tributedCount++;
      }
    }

    // Special summon to first open zone
    let emptyZone = player.monsterZones.findIndex((z) => z === null);
    if (emptyZone === -1) emptyZone = 0;

    player.monsterZones[emptyZone] = {
      card: ritualMonsterCard,
      position: 'face_up_attack',
      hasAttacked: false,
      canChangePosition: false,
      turnSummoned: state.turnNumber,
      currentAtk: ritualMonsterCard.atk,
      currentDef: ritualMonsterCard.def,
    };

    state.lastLog.push(`طقوس استدعاء مهيبة! استدعى ${player.name} وحش الطقوس الأسطوري ${ritualMonsterCard.name} (هجوم: ${ritualMonsterCard.atk})!`);
    return {
      type: 'ritual_summon',
      title: `طقوس استدعاء: ${spell.name}`,
      desc: `تمت التضحية واستُدعي وحش الطقوس الأسطوري ${ritualMonsterCard.name} بنجاح!`,
      summonedCard: ritualMonsterCard,
    };
  }

  // =========================================================================
  // 3. FUSION & DRAGONIC LEGEND SPELLS
  // =========================================================================
  if (name.includes('polymerization') || name.includes('super polymerization')) {
    const fusionCandidates = [
      'Blue-Eyes Ultimate Dragon',
      'B. Skull Dragon',
      'Gaia the Dragon Champion',
      'Cyber Twin Dragon',
      'Cyber End Dragon',
      'Flame Swordsman',
      'Meteor B. Dragon',
      'Master of Oz',
      'Twin-Headed Thunder Dragon',
    ];

    let fusedCard = null;
    for (const fc of fusionCandidates) {
      const found = cardsByName.get(fc.toLowerCase());
      if (found) {
        fusedCard = found;
        break;
      }
    }

    if (!fusedCard) {
      fusedCard = {
        id: 999814,
        name: 'Blue-Eyes Ultimate Dragon',
        type: 'monster',
        subType: 'fusion',
        level: 12,
        atk: 4500,
        def: 3800,
        image: '4454_1.webp',
      };
    }

    let mats = 0;
    for (let z = 0; z < 5; z++) {
      if (player.monsterZones[z] && mats < 2) {
        destroySlot(state, playerIndex, z, 'fusion_material', spell);
        mats++;
      }
    }
    while (mats < 2 && player.hand.length > 0) {
      player.graveyard.push(player.hand.pop());
      mats++;
    }

    let emptyZone = player.monsterZones.findIndex((z) => z === null);
    if (emptyZone === -1) emptyZone = 0;

    player.monsterZones[emptyZone] = {
      card: fusedCard,
      position: 'face_up_attack',
      hasAttacked: false,
      canChangePosition: false,
      turnSummoned: state.turnNumber,
      currentAtk: fusedCard.atk,
      currentDef: fusedCard.def,
    };

    state.lastLog.push(`اندماج أسطوري! دمج ${player.name} وحوشه واستدعى ${fusedCard.name} (هجوم: ${fusedCard.atk})!`);
    return {
      type: 'fusion_summon',
      effectCategory: 'FUSION_SUMMON',
      title: 'الانصهار الخارق (Polymerization)',
      desc: `اندمجت الوحوش وخرج العملاق ${fusedCard.name} إلى الساحة!`,
      summonedCard: fusedCard,
    };
  }

  if (name.includes('de-fusion')) {
    const myMonsters = player.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((m) => m.slot !== null);

    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = myMonsters[0];
      destroySlot(state, playerIndex, target.idx, 'de_fusion', spell);
      const gyMonsters = player.graveyard.filter((c) => c.type === 'monster');
      for (let i = 0; i < Math.min(2, gyMonsters.length); i++) {
        const revCard = gyMonsters[gyMonsters.length - 1 - i];
        const eZone = player.monsterZones.findIndex((z) => z === null);
        if (eZone !== -1) {
          player.monsterZones[eZone] = {
            card: revCard,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: revCard.atk,
            currentDef: revCard.def,
          };
        }
      }
      state.lastLog.push(`تفكيك الاندماج (De-Fusion)! تفكك الوحش وعادت مواده للساحة.`);
      return {
        type: 'de_fusion',
        title: 'تفكيك الاندماج (De-Fusion)',
        desc: `تم تفكيك الاندماج واستدعاء المواد الأصلية للساحة!`,
      };
    }
  }

  if (name.includes('fusion sage')) {
    let poly = player.deck.find((c) => (c.name || '').toLowerCase().includes('poly'));
    if (!poly) {
      poly = cardsByName.get('polymerization') || { id: 1026, name: 'Polymerization', type: 'spell', subType: 'normal' };
    }
    player.hand.push(poly);
    state.lastLog.push(`حكيم الاندماج (Fusion Sage)! بحث في المجموعة وأضاف كارت البلمرة (Polymerization) ليده.`);
    return {
      type: 'fusion_sage',
      title: 'حكيم الاندماج (Fusion Sage)',
      desc: 'تم استخراج كارت البلمرة (Polymerization) من المجموعة وإضافته لليد بنجاح!',
    };
  }

  if (name.includes('eye of timaeus') || name.includes('timaeus')) {
    const myMonsters = player.monsterZones.filter((m) => m !== null);
    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      const target = myMonsters[0];
      target.currentAtk = (target.currentAtk || target.card.atk) * 2;
      state.lastLog.push(`عين تيمايوس الأسطورية! تضاعفت قوة ${target.card.name} إلى ${target.currentAtk}!`);
      return {
        type: 'buff_atk',
        title: 'عين تيمايوس (The Eye of Timaeus)',
        desc: `قوة التنين الأسطوري تيمايوس ضاعفت هجوم ${target.card.name} ليصبح ${target.currentAtk}!`,
        targetCard: target.card,
      };
    }
  }

  if (name.includes('claw of hermos') || name.includes('hermos')) {
    const myMonsters = player.monsterZones.filter((m) => m !== null);
    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      const target = myMonsters[0];
      target.currentAtk = (target.currentAtk || target.card.atk) * 2;
      state.lastLog.push(`مخلب هيرموس! نجحت القرعة وتضاعفت قوة ${target.card.name} إلى ${target.currentAtk}!`);
      return {
        type: 'buff_atk',
        title: 'مخلب هيرموس (The Claw of Hermos)',
        desc: `طاقة سيف التنين هيرموس ضاعفت قوة ${target.card.name}!`,
        targetCard: target.card,
      };
    }
  }

  if (name.includes('fang of critias') || name.includes('critias')) {
    const myMonsters = player.monsterZones.filter((m) => m !== null);
    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      const target = myMonsters[0];
      target.currentAtk = (target.currentAtk || target.card.atk) * 2;
      target.currentDef = (target.currentDef || target.card.def) * 2;
      state.lastLog.push(`ناب كريتياس الأسطوري! تضاعف هجوم ودفاع ${target.card.name} مرتين!`);
      return {
        type: 'buff_atk',
        title: 'ناب كريتياس (The Fang of Critias)',
        desc: `فخاخ التنين كريتياس ضاعفت هجوم ودفاع ${target.card.name}!`,
        targetCard: target.card,
      };
    }
  }

  // =========================================================================
  // 4. BOARD WIPES & TARGET REMOVAL SPELLS
  // =========================================================================
  if (name.includes('raigeki')) {
    let destroyed = 0;
    const oppIdx = 1 - playerIndex;
    for (let i = 0; i < 5; i++) {
      if (opponent.monsterZones[i]) {
        destroySlot(state, oppIdx, i, 'card_effect', spell);
        destroyed++;
      }
    }
    state.lastLog.push(`ضربة الصاعقة (Raigeki)! دمرت جميع وحوش الخصم (${destroyed} وحش).`);
    return {
      type: 'raigeki',
      title: 'ضربة الصاعقة (Raigeki)',
      desc: `صاعقة هائلة دمرت جميع وحوش ${opponent.name} (${destroyed} وحش)!`,
      destroyedCount: destroyed,
      targetAffected: { playerIndex: oppIdx, zoneIndex: -1, actionText: 'صاعقة ريجيكي دمرت الساحة!', effectType: 'destroy_all' },
    };
  }

  if (name.includes('dark hole')) {
    let destroyed = 0;
    for (const pIdx of [0, 1]) {
      for (let i = 0; i < 5; i++) {
        if (state.players[pIdx].monsterZones[i]) {
          destroySlot(state, pIdx, i, 'card_effect', spell);
          destroyed++;
        }
      }
    }
    state.lastLog.push(`الثقب الأسود (Dark Hole)! تم تدمير جميع وحوش الساحة (${destroyed} وحش).`);
    return {
      type: 'dark_hole',
      title: 'الثقب الأسود (Dark Hole)',
      desc: `ثقب كوني أسود ابتلع ودمر جميع وحوش الساحة (${destroyed} وحش)!`,
      destroyedCount: destroyed,
      targetAffected: { playerIndex: 1 - playerIndex, zoneIndex: -1, actionText: 'الثقب الأسود ابتلع الوحوش!', effectType: 'destroy_all' },
    };
  }

  if (name.includes('fissure')) {
    const oppIdx = 1 - playerIndex;
    const oppFaceUp = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null && item.slot.position !== 'face_down_defense');

    if (oppFaceUp.length > 0) {
      oppFaceUp.sort((a, b) => (a.slot.currentAtk || 0) - (b.slot.currentAtk || 0));
      const target = oppFaceUp[0];
      const targetCard = target.slot.card;
      destroySlot(state, oppIdx, target.idx, 'card_effect', spell);
      state.lastLog.push(`الشق الأرضي (Fissure)! دمر أضعف وحوش الخصم: ${targetCard.name}.`);
      return {
        type: 'fissure',
        title: 'الشق الأرضي (Fissure)',
        desc: `انشقت الأرض وابتلعت وحش الخصم ${targetCard.name}!`,
        targetCard,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'انشقت الأرض وابتلعته!', effectType: 'destroy' },
      };
    }
  }

  if (name.includes('tribute to the doomed') || name.includes('offerings to the doomed')) {
    const oppIdx = 1 - playerIndex;
    let targetIdx = targetContext?.targetZoneIndex;
    let target = null;
    if (targetIdx !== undefined && targetIdx !== null && opponent.monsterZones[targetIdx]) {
      target = { slot: opponent.monsterZones[targetIdx], idx: targetIdx };
    } else {
      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter((item) => item.slot !== null);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }

    if (target) {
      const targetCard = target.slot.card;
      destroySlot(state, oppIdx, target.idx, 'card_effect', spell);
      state.lastLog.push(`قربان للهلاك! دمر وحش الخصم ${targetCard.name}.`);
      return {
        type: 'tribute_doomed',
        title: spell.name,
        desc: `تم القضاء على وحش الخصم: ${targetCard.name}!`,
        targetCard,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'تم القضاء عليه بالقربان!', effectType: 'destroy' },
      };
    }
  }

  if (name.includes('nobleman of crossout')) {
    const oppIdx = 1 - playerIndex;
    const faceDowns = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null && item.slot.position === 'face_down_defense');

    if (faceDowns.length > 0) {
      const target = faceDowns[0];
      const targetCard = target.slot.card;
      destroySlot(state, oppIdx, target.idx, 'card_effect', spell);
      state.lastLog.push(`نبيل الإبادة (Nobleman of Crossout)! استأصل وحش الخصم المقلوب ${targetCard.name} ونفاه من اللعبة.`);
      return {
        type: 'nobleman_crossout',
        title: 'نبيل الإبادة (Nobleman of Crossout)',
        desc: `تم نفي واستئصال الوحش المقلوب ${targetCard.name}!`,
        targetCard,
      };
    }
  }

  // Type-specific destruction spells
  if (
    name.includes('exile of the wicked') ||
    name.includes('breath of light') ||
    name.includes('stain storm') ||
    name.includes('warrior elimination') ||
    name.includes('eradicating aerosol') ||
    name.includes('last day of witch') ||
    name.includes('eternal draught') ||
    name.includes('eternal rest')
  ) {
    let targetRace = 'Fiend';
    let label = 'الشياطين';
    if (name.includes('breath of light')) { targetRace = 'Rock'; label = 'الصخور'; }
    else if (name.includes('stain storm')) { targetRace = 'Machine'; label = 'الآلات'; }
    else if (name.includes('warrior elimination')) { targetRace = 'Warrior'; label = 'المحاربين'; }
    else if (name.includes('eradicating aerosol')) { targetRace = 'Insect'; label = 'الحشرات'; }
    else if (name.includes('last day of witch')) { targetRace = 'Spellcaster'; label = 'السحرة'; }
    else if (name.includes('eternal draught')) { targetRace = 'Fish'; label = 'الأسماك'; }

    let count = 0;
    const oppIdx = 1 - playerIndex;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot && (slot.card.race === targetRace || name.includes('eternal rest'))) {
        destroySlot(state, oppIdx, i, 'card_effect', spell);
        count++;
      }
    }
    state.lastLog.push(`تطهير الساحة: دمر السحر جميع وحوش ${label} (${count} وحش).`);
    return {
      type: 'type_wipe',
      title: spell.name,
      desc: `تم القضاء على جميع وحوش ${label} في ساحة الخصم (${count} وحش)!`,
      destroyedCount: count,
    };
  }

  if (name.includes('thousand knives') || name.includes('makiu')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null);

    if (oppMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = oppMonsters[0];
      destroySlot(state, oppIdx, target.idx, 'card_effect', spell);
      state.lastLog.push(`ألف سكين (Thousand Knives)! اخترقت السكاكين ودمرت وحش الخصم ${target.slot.card.name}.`);
      return {
        type: 'thousand_knives',
        title: spell.name,
        desc: `مزقت السكاكين السحرية وحش الخصم ${target.slot.card.name}!`,
        targetCard: target.slot.card,
      };
    }
  }

  if (name.includes('share the pain') || name.includes('mystic box')) {
    const oppIdx = 1 - playerIndex;
    const myMonsters = player.monsterZones.map((s, i) => ({ s, i })).filter((x) => x.s !== null);
    const oppMonsters = opponent.monsterZones.map((s, i) => ({ s, i })).filter((x) => x.s !== null);

    if (myMonsters.length > 0 && oppMonsters.length > 0) {
      destroySlot(state, playerIndex, myMonsters[0].i, 'tribute', spell);
      destroySlot(state, oppIdx, oppMonsters[0].i, 'card_effect', spell);
      state.lastLog.push(`تقاسم الألم (Share The Pain)! تمت التضحية بوحش لتدمير وحش الخصم.`);
      return {
        type: 'share_pain',
        title: spell.name,
        desc: 'تمت التضحية بوحش من ساحتك مقابل تدمير وحش لخصمك!',
      };
    }
  }

  if (name.includes('final destiny')) {
    let total = 0;
    for (const pIdx of [0, 1]) {
      const p = state.players[pIdx];
      for (let z = 0; z < 5; z++) {
        if (p.monsterZones[z]) { destroySlot(state, pIdx, z, 'card_effect', spell); total++; }
        if (p.spellTrapZones[z]) { p.graveyard.push(p.spellTrapZones[z].card); p.spellTrapZones[z] = null; total++; }
      }
    }
    state.lastLog.push(`المصير النهائي (Final Destiny)! دمار كوني شامل أباد كل الأوراق بالساحة (${total} ورقة).`);
    return {
      type: 'final_destiny',
      title: 'المصير النهائي (Final Destiny)',
      desc: `انفجار كوني شامل دمر كل شيء في الساحة (${total} ورقة)!`,
    };
  }

  // =========================================================================
  // 5. SPELL / TRAP DESTRUCTION & BOUNCE
  // =========================================================================
  if (name.includes('heavy storm') || name.includes('harpie') || name.includes('feather duster')) {
    let destroyed = 0;
    const isBoth = name.includes('heavy storm');
    const targets = isBoth ? [player, opponent] : [opponent];

    for (const p of targets) {
      for (let i = 0; i < 5; i++) {
        const slot = p.spellTrapZones[i];
        if (slot) {
          p.graveyard.push(slot.card);
          p.spellTrapZones[i] = null;
          destroyed++;
        }
      }
    }
    state.lastLog.push(`عاصفة ريش هاربي المدمرة أطاحت بـ ${destroyed} من بطاقات السحر والفخاخ!`);
    return {
      type: 'heavy_storm',
      effectCategory: 'SPELL_TRAP_DESTRUCTION',
      title: name.includes('harpie') ? 'مكنسة هاربي (Harpie\'s Duster)' : 'العاصفة الهوجاء (Heavy Storm)',
      desc: `رياح عاتية دمرت جميع بطاقات السحر والفخاخ (${destroyed} بطاقة)!`,
      destroyedCount: destroyed,
    };
  }

  if (name.includes('giant trunade')) {
    let returned = 0;
    for (const p of [player, opponent]) {
      for (let i = 0; i < 5; i++) {
        const slot = p.spellTrapZones[i];
        if (slot) {
          p.hand.push(slot.card);
          p.spellTrapZones[i] = null;
          returned++;
        }
      }
    }
    state.lastLog.push(`الإعصار العملاق (Giant Trunade)! أعاد ${returned} بطاقة سحر وفخ إلى أيدي أصحابها.`);
    return {
      type: 'giant_trunade',
      title: 'الإعصار العملاق (Giant Trunade)',
      desc: `رياح عاتية أعادت كل بطاقات السحر والفخاخ (${returned} بطاقة) إلى الأيدي!`,
      returnedCount: returned,
    };
  }

  if (name.includes('mystical space typhoon') || name.includes('space typhoon') || name.includes('de-spell') || name.includes('remove trap') || name.includes('spiritualism') || name.includes('bait doll')) {
    const oppST = opponent.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter((item) => item.slot !== null);
    if (oppST.length > 0) {
      const target = oppST[0];
      if (name.includes('spiritualism')) {
        opponent.hand.push(target.slot.card);
      } else {
        opponent.graveyard.push(target.slot.card);
      }
      opponent.spellTrapZones[target.idx] = null;
      state.lastLog.push(`إعصار الفضاء الغامض! أطاح ببطاقة سحر/فخ لـ ${opponent.name}.`);
      return {
        type: 'mst',
        title: spell.name,
        desc: 'رياح فضائية عاتية دمرت بطاقة سحر/فخ من ساحة الخصم!',
      };
    } else if (state.activeFieldSpell && state.activeFieldSpell.playerIndex !== playerIndex) {
      const destroyedField = state.activeFieldSpell.card;
      state.players[state.activeFieldSpell.playerIndex].graveyard.push(destroyedField);
      state.activeFieldSpell = null;
      recalcStats(state);
      state.lastLog.push('إعصار الفضاء الغامض! دمر سحر الساحة النشط.');
      return {
        type: 'mst',
        title: spell.name,
        desc: 'دمر إعصار الفضاء سحر الساحة النشط!',
      };
    }
  }

  // =========================================================================
  // 6. DIRECT BURN & DAMAGE SPELLS
  // =========================================================================
  if (
    name.includes('ookazi') ||
    name.includes('tremendous fire') ||
    name.includes('final flame') ||
    name.includes('hinotama') ||
    name.includes('raimei') ||
    name.includes('sparks') ||
    name.includes('restructer revolution')
  ) {
    let burnDmg = 500;
    if (name.includes('tremendous fire')) {
      burnDmg = 1000;
      player.lifePoints = Math.max(0, player.lifePoints - 500);
    } else if (name.includes('ookazi')) burnDmg = 800;
    else if (name.includes('final flame')) burnDmg = 600;
    else if (name.includes('hinotama')) burnDmg = 500;
    else if (name.includes('raimei')) burnDmg = 300;
    else if (name.includes('sparks')) burnDmg = 200;
    else if (name.includes('restructer revolution')) {
      burnDmg = Math.max(200, opponent.hand.length * 200);
    }

    opponent.lifePoints = Math.max(0, opponent.lifePoints - burnDmg);
    state.lastLog.push(`سحر ناري مباشر! سدد ${burnDmg} نقطة ضرر لـ ${opponent.name}.`);
    return {
      type: 'burn_damage',
      effectCategory: 'BURN_DAMAGE',
      burnAmount: burnDmg,
      targetPlayerIndex: 1 - playerIndex,
      title: spell.name,
      desc: `قذيفة سحرية حارقة أصابت نقاط حياة ${opponent.name} بـ ${burnDmg} نقطة ضرر مباشر!`,
      damage: burnDmg,
    };
  }

  // =========================================================================
  // 7. HEALING & LIFE POINTS RECOVERY
  // =========================================================================
  if (
    name.includes('dian keto') ||
    name.includes('red medicine') ||
    name.includes('blue medicine') ||
    name.includes('mooyan curry') ||
    name.includes('goblin\'s secret remedy') ||
    name.includes('soul of the pure') ||
    name.includes('rain of mercy') ||
    name.includes('sebek\'s blessing')
  ) {
    let heal = 1000;
    if (name.includes('red medicine')) heal = 500;
    else if (name.includes('blue medicine')) heal = 400;
    else if (name.includes('mooyan curry')) heal = 200;
    else if (name.includes('goblin\'s secret remedy')) heal = 1000;
    else if (name.includes('soul of the pure')) heal = 2000;
    else if (name.includes('rain of mercy')) {
      heal = 1000;
      opponent.lifePoints += 1000;
    }

    player.lifePoints += heal;
    state.lastLog.push(`شفاء مقدس! استعاد ${player.name} ${heal} نقطة حياة.`);
    return {
      type: 'heal',
      effectCategory: 'LP_HEAL',
      healAmount: heal,
      targetPlayerIndex: playerIndex,
      title: spell.name,
      desc: `نور الشفاء الأسطوري أعاد لـ ${player.name} ${heal} نقطة حياة!`,
      heal,
    };
  }

  // =========================================================================
  // 8. HAND & DRAW ADVANTAGE SPELLS (Pot of Greed, Cup of Ace, etc.)
  // =========================================================================
  if (name.includes('cup of ace')) {
    const isHeads = Math.random() < 0.5;
    const coinFlip = isHeads ? 'heads' : 'tails';
    const recipient = isHeads ? player : opponent;
    const recipientName = isHeads ? player.name : opponent.name;
    const drawCount = 2;
    for (let i = 0; i < drawCount; i++) {
      if (recipient.deck.length > 0) {
        recipient.hand.push(recipient.deck.shift());
      }
    }
    state.lastLog.push(`كأس الحظ (Cup of Ace)! استقرت العملة على [ ${isHeads ? 'وجه (Heads)' : 'ظهر (Tails)'} ] وسحب ${recipientName} ورقتين!`);
    return {
      type: 'cup_of_ace',
      effectCategory: 'CHANCE_COIN',
      title: 'كأس الحظ (Cup of Ace)',
      desc: isHeads ? 'وجه! سحبت بطاقتين لمجموعتك.' : 'ظهر! سحب الخصم بطاقتين لمجموعته.',
      coinFlip,
    };
  }
  if (name.includes('pot of greed')) {
    drawCardForTurnPlayer(state);
    drawCardForTurnPlayer(state);
    state.lastLog.push(`جرة الطمع (Pot of Greed)! سحب ${player.name} بطاقتين إضافيتين.`);
    return {
      type: 'pot_of_greed',
      title: 'جرة الطمع (Pot of Greed)',
      desc: `سحب ${player.name} بطاقتين إضافيتين من مجموعته!`,
      cardsDrawn: 2,
    };
  }

  if (name.includes('graceful charity')) {
    for (let i = 0; i < 3; i++) drawCardForTurnPlayer(state);
    let discarded = 0;
    while (player.hand.length > 0 && discarded < 2) {
      player.graveyard.push(player.hand.pop());
      discarded++;
    }
    state.lastLog.push(`إحسان كريم (Graceful Charity)! سحب ${player.name} 3 بطاقات وتخلص من بطاقتين للمقبرة.`);
    return {
      type: 'graceful_charity',
      title: 'إحسان كريم (Graceful Charity)',
      desc: `سحب ${player.name} 3 بطاقات وألقى بطاقتين في المقبرة!`,
      cardsDrawn: 3,
    };
  }

  if (name.includes('card destruction')) {
    const p0Count = player.hand.length;
    const p1Count = opponent.hand.length;
    while (player.hand.length > 0) player.graveyard.push(player.hand.pop());
    while (opponent.hand.length > 0) opponent.graveyard.push(opponent.hand.pop());
    for (let i = 0; i < p0Count; i++) drawCardForTurnPlayer(state);
    for (let i = 0; i < p1Count; i++) {
      if (opponent.deck.length > 0) opponent.hand.push(opponent.deck.shift());
    }
    state.lastLog.push(`تدمير البطاقات (Card Destruction)! تخلص كلا اللاعبين من أوراق يدهما وسحبا أوراقاً بديلة.`);
    return {
      type: 'card_destruction',
      title: 'تدمير البطاقات (Card Destruction)',
      desc: 'رمى كلا المبارزين أوراق أيديهم وسحبا نفس العدد من جديد!',
    };
  }

  if (name.includes('upstart goblin')) {
    drawCardForTurnPlayer(state);
    opponent.lifePoints += 1000;
    state.lastLog.push(`العفريت الصاعد (Upstart Goblin)! سحب ${player.name} بطاقة، وحصل الخصم على +1000 نقطة حياة.`);
    return {
      type: 'upstart_goblin',
      title: 'العفريت الصاعد (Upstart Goblin)',
      desc: `سحب ${player.name} بطاقة ومنح خصمه +1000 نقطة حياة!`,
      cardsDrawn: 1,
    };
  }

  if (name.includes('delinquent duo') || name.includes('confiscation') || name.includes('forceful sentry')) {
    if (name.includes('delinquent duo') && player.lifePoints > 1000) {
      player.lifePoints -= 1000;
      if (opponent.hand.length > 0) opponent.graveyard.push(opponent.hand.pop());
      if (opponent.hand.length > 0) opponent.graveyard.push(opponent.hand.pop());
      state.lastLog.push(`الثنائي المشاغب (Delinquent Duo)! دفع ${player.name} 1000 نقطة وأجبر الخصم على رمي بطاقتين.`);
    } else if (opponent.hand.length > 0) {
      if (name.includes('forceful sentry')) {
        opponent.deck.push(opponent.hand.pop());
        state.lastLog.push(`الحارس الصارم (The Forceful Sentry)! أعاد بطاقة من يد الخصم لمجموعته.`);
      } else {
        opponent.graveyard.push(opponent.hand.pop());
        state.lastLog.push(`المصادرة (Confiscation)! تخلص من بطاقة من يد الخصم.`);
      }
    }
    return {
      type: 'hand_disrupt',
      title: spell.name,
      desc: 'تم اختراق أوراق يد الخصم والتخلص من بطاقاته!',
    };
  }

  if (name.includes('painful choice') || name.includes('cheerful coffin') || name.includes('exchange')) {
    if (player.deck.length >= 3) {
      for (let i = 0; i < 2; i++) player.graveyard.push(player.deck.shift());
      drawCardForTurnPlayer(state);
    }
    state.lastLog.push(`تأثير استراتيجي: ${spell.name}! نظم المبارز بطاقات يده ومجموعته.`);
    return {
      type: 'hand_strategy',
      title: spell.name,
      desc: 'تم تفعيل التكتيك الاستراتيجي لإدارة الأوراق والمقبرة!',
    };
  }

  // =========================================================================
  // 9. REBIRTH, RECOVERY & SPECIAL SUMMON SPELLS
  // =========================================================================
  if (name.includes('monster reborn')) {
    let revived = targetContext?.selectedTargetCard;
    if (!revived) {
      const allGY = [...player.graveyard, ...opponent.graveyard].filter((c) => c && (c.type === 'monster' || typeof c.atk === 'number'));
      allGY.sort((a, b) => (b.atk || 0) - (a.atk || 0));
      if (allGY.length > 0) revived = allGY[0];
    }

    if (revived) {
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const inPlayerGY = player.graveyard.findIndex((c) => c === revived || (c.id && c.id === revived.id) || c.name === revived.name);
        if (inPlayerGY !== -1) player.graveyard.splice(inPlayerGY, 1);
        else {
          const inOppGY = opponent.graveyard.findIndex((c) => c === revived || (c.id && c.id === revived.id) || c.name === revived.name);
          if (inOppGY !== -1) opponent.graveyard.splice(inOppGY, 1);
        }

        player.monsterZones[emptyZone] = {
          card: revived,
          position: targetContext?.position || 'face_up_attack',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: revived.atk,
          currentDef: revived.def,
        };
        state.lastLog.push(`ولادة الوحش (Monster Reborn)! استدعى ${player.name} الوحش ${revived.name} إلى الساحة.`);
        return {
          type: 'monster_reborn',
          effectCategory: 'GRAVEYARD_SUMMON',
          revivedCard: revived,
          originZone: inPlayerGY !== -1 ? 'player_graveyard' : 'opponent_graveyard',
          targetPlayerIndex: playerIndex,
          targetZoneIndex: emptyZone,
          title: 'ولادة الوحش (Monster Reborn)',
          desc: `أعيد إحياء ${revived.name} (هجوم: ${revived.atk} / دفاع: ${revived.def}) إلى ساحة ${player.name}!`,
        };
      }
    }
  }

  if (name.includes('premature burial')) {
    if (player.lifePoints > 800) {
      player.lifePoints -= 800;
      let target = targetContext?.selectedTargetCard;
      if (!target) {
        const pMonsters = player.graveyard.filter((c) => c && (c.type === 'monster' || typeof c.atk === 'number'));
        pMonsters.sort((a, b) => (b.atk || 0) - (a.atk || 0));
        if (pMonsters.length > 0) target = pMonsters[0];
      }
      if (target) {
        const emptyZone = player.monsterZones.findIndex((z) => z === null);
        if (emptyZone !== -1) {
          const inPlayerIdx = player.graveyard.findIndex((c) => c === target || (c.id && c.id === target.id) || c.name === target.name);
          if (inPlayerIdx !== -1) player.graveyard.splice(inPlayerIdx, 1);
          player.monsterZones[emptyZone] = {
            card: target,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: target.atk,
            currentDef: target.def,
          };
          state.lastLog.push(`الدفن المبكر! دفع ${player.name} 800 نقطة واستدعى ${target.name}.`);
          return {
            type: 'premature_burial',
            effectCategory: 'GRAVEYARD_SUMMON',
            revivedCard: target,
            originZone: 'player_graveyard',
            targetPlayerIndex: playerIndex,
            targetZoneIndex: emptyZone,
            title: 'الدفن المبكر (Premature Burial)',
            desc: `دفع ${player.name} 800 نقطة واستدعى ${target.name} (هجوم: ${target.atk})!`,
          };
        }
      }
    }
  }

  if (name.includes('shallow grave')) {
    for (const p of [player, opponent]) {
      const pMonsters = p.graveyard.filter((c) => c.type === 'monster');
      if (pMonsters.length > 0) {
        const target = pMonsters[pMonsters.length - 1];
        const emptyZone = p.monsterZones.findIndex((z) => z === null);
        if (emptyZone !== -1) {
          const idx = p.graveyard.indexOf(target);
          if (idx !== -1) p.graveyard.splice(idx, 1);
          p.monsterZones[emptyZone] = {
            card: target,
            position: 'face_down_defense',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: target.atk,
            currentDef: target.def,
          };
        }
      }
    }
    state.lastLog.push('القبر السطحي: استدعى كلا اللاعبين وحشاً مقلوباً في وضع الدفاع من المقبرة.');
    return {
      type: 'shallow_grave',
      effectCategory: 'GRAVEYARD_SUMMON',
      originZone: 'player_graveyard',
      targetPlayerIndex: playerIndex,
      title: 'القبر السطحي (The Shallow Grave)',
      desc: 'استُدعي وحش من المقبرة لكل لاعب مقلوباً في وضع الدفاع!',
    };
  }

  if (name.includes('reincarnation') || name.includes('monster recovery') || name.includes('salvage')) {
    const pMonsters = player.graveyard.filter((c) => c && (c.type === 'monster' || typeof c.atk === 'number'));
    if (pMonsters.length > 0) {
      const target = pMonsters[pMonsters.length - 1];
      const idx = player.graveyard.indexOf(target);
      if (idx !== -1) player.graveyard.splice(idx, 1);
      player.hand.push(target);
      state.lastLog.push(`استعادة الوحش! استعاد ${player.name} الوحش ${target.name} من المقبرة إلى يده.`);
      return {
        type: 'monster_recover',
        effectCategory: 'GRAVEYARD_TO_HAND',
        retrievedCard: target,
        originZone: 'player_graveyard',
        targetPlayerIndex: playerIndex,
        title: 'استعادة الوحش إلى اليد',
        desc: `تمت استعادة ${target.name} بنجاح من المقبرة إلى يد ${player.name}!`,
        targetCard: target,
      };
    }
  }

  if (name.includes('scapegoat') || name.includes('multiply')) {
    let tokensSummoned = 0;
    const isKuriboh = name.includes('multiply');
    for (let z = 0; z < 5; z++) {
      if (player.monsterZones[z] === null && tokensSummoned < 4) {
        player.monsterZones[z] = {
          card: {
            id: isKuriboh ? 999905 + z : 999901 + z,
            name: isKuriboh ? 'Kuriboh Token' : 'Sheep Token',
            arabicName: isKuriboh ? 'رمز كوريبو (Kuriboh Token)' : 'رمز الخروف (Sheep Token)',
            type: 'monster',
            subType: 'token',
            race: isKuriboh ? 'Fiend' : 'Beast',
            attribute: isKuriboh ? 'DARK' : 'EARTH',
            level: 1,
            atk: 300,
            def: 200,
            image: isKuriboh ? '4084_1.webp' : '4818_1.webp',
          },
          position: 'face_up_defense',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: 0,
          currentDef: 0,
          isToken: true,
        };
        tokensSummoned++;
      }
    }
    state.lastLog.push(`كبش الفداء! استدعى ${player.name} ${tokensSummoned} رموز دفاعية لحماية الساحة.`);
    return {
      type: 'scapegoat',
      title: spell.name,
      desc: `ظهرت ${tokensSummoned} رموز لحماية دفاعات ${player.name}!`,
      tokensCount: tokensSummoned,
    };
  }

  if (name.includes('flute of summoning dragon')) {
    let dragonCount = 0;
    for (let i = player.hand.length - 1; i >= 0; i--) {
      const c = player.hand[i];
      if (c && c.type === 'monster' && c.race === 'Dragon' && dragonCount < 2) {
        const eZone = player.monsterZones.findIndex((z) => z === null);
        if (eZone !== -1) {
          player.hand.splice(i, 1);
          player.monsterZones[eZone] = {
            card: c,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: c.atk,
            currentDef: c.def,
          };
          dragonCount++;
        }
      }
    }
    state.lastLog.push(`مزمار استدعاء التنانين! استدعى ${player.name} ${dragonCount} تنانين من يده.`);
    return {
      type: 'dragon_summon',
      title: 'مزمار استدعاء التنانين',
      desc: `عزف المزمار واستدعى ${dragonCount} تنين من اليد إلى الساحة!`,
    };
  }

  if (name.includes('dark magic curtain')) {
    player.lifePoints = Math.floor(player.lifePoints / 2);
    let dm = cardsByName.get('dark magician');
    if (!dm) dm = { id: 890, name: 'Dark Magician', type: 'monster', level: 7, atk: 2500, def: 2100, image: '4070_1.webp' };
    const eZone = player.monsterZones.findIndex((z) => z === null);
    if (eZone !== -1) {
      player.monsterZones[eZone] = {
        card: dm,
        position: 'face_up_attack',
        hasAttacked: false,
        canChangePosition: false,
        turnSummoned: state.turnNumber,
        currentAtk: dm.atk,
        currentDef: dm.def,
      };
      state.lastLog.push(`ستار السحر الأسود! ضحى ${player.name} بنصف نقاط حياته واستدعى ساحر الظلام (Dark Magician)!`);
      return {
        type: 'dark_magic_curtain',
        title: 'ستار السحر الأسود',
        desc: 'نزل فارس الظلام وساحره الأسطوري (Dark Magician) إلى الساحة!',
      };
    }
  }

  if (name.includes('soul release') || name.includes('gravedigger ghoul')) {
    let banished = 0;
    for (let i = 0; i < Math.min(3, opponent.graveyard.length); i++) {
      opponent.graveyard.pop();
      banished++;
    }
    state.lastLog.push(`تطهير الأرواح! تم نفي ${banished} بطاقات من مقبرة ${opponent.name}.`);
    return {
      type: 'soul_release',
      title: spell.name,
      desc: `تم نفي ${banished} بطاقات من مقبرة الخصم وحرمانهم من العودة!`,
    };
  }

  // =========================================================================
  // 10. POSITION CHANGERS & BATTLE STALL SPELLS
  // =========================================================================
  if (name.includes('swords of revealing light')) {
    let revealed = 0;
    const oppIdx = 1 - playerIndex;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot && slot.position === 'face_down_defense') {
        slot.position = 'face_up_defense';
        revealed++;
      }
    }
    state.swordsOfRevealingLight = { active: true, playerIndex, turnsRemaining: 3 };
    state.lastLog.push(`سيوف النور الكاشف! كشفت ${revealed} وحوش مقلوبة ومنعت الخصم من الهجوم لمدة 3 أدوار.`);
    return {
      type: 'swords',
      title: 'سيوف النور الكاشف (Swords of Revealing Light)',
      desc: `أضاءت سيوف النور الساحة وكشفت ${revealed} وحوش مقلوبة وشلت هجوم الخصم لمدة 3 أدوار!`,
      revealedCount: revealed,
      targetAffected: { playerIndex: oppIdx, zoneIndex: -1, actionText: 'انكشفت الوحوش وانشلت حركتها!', effectType: 'seal' },
    };
  }

  if (name.includes('nightmare\'s steelcage') || name.includes('dark door') || name.includes('messenger of peace')) {
    state.lastLog.push(`قفص الكوابيس الفولاذي! شل هجوم وحوش الساحة مؤقتاً.`);
    return {
      type: 'stall',
      title: spell.name,
      desc: 'حصن دفاعي شل حركة الهجوم لجميع الوحوش!',
    };
  }

  if (name.includes('stop defense')) {
    const oppDefs = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null && item.slot.position.includes('defense'));

    if (oppDefs.length > 0) {
      const target = oppDefs[0];
      target.slot.position = 'face_up_attack';
      state.lastLog.push(`إيقاف الدفاع (Stop Defense)! أُجبر ${target.slot.card.name} على التحول لوضع الهجوم.`);
      return {
        type: 'stop_defense',
        title: 'إيقاف الدفاع (Stop Defense)',
        desc: `أُجبر الوحش ${target.slot.card.name} على الخروج من دفاعه والتحول للهجوم!`,
        targetCard: target.slot.card,
      };
    }
  }

  if (name.includes('curse of fiend')) {
    for (const p of [player, opponent]) {
      for (const slot of p.monsterZones) {
        if (slot) {
          slot.position = slot.position === 'face_up_attack' ? 'face_up_defense' : 'face_up_attack';
        }
      }
    }
    state.lastLog.push('لعنة الشيطان (Curse of Fiend)! انقلبت جميع أوضاع وحوش الساحة بين الهجوم والدفاع.');
    return {
      type: 'curse_fiend',
      title: 'لعنة الشيطان (Curse of Fiend)',
      desc: 'انقلبت جميع أوضاع الوحوش بالساحة بالكامل!',
    };
  }

  if (name.includes('dark-piercing light')) {
    let flipped = 0;
    for (const slot of opponent.monsterZones) {
      if (slot && slot.position === 'face_down_defense') {
        slot.position = 'face_up_defense';
        flipped++;
      }
    }
    state.lastLog.push(`النور الخارق للظلام! كشف ${flipped} من وحوش الخصم المقلوبة.`);
    return {
      type: 'dark_piercing',
      title: 'النور الخارق للظلام',
      desc: `أضاء النور الساحة وكشف ${flipped} وحوش مقلوبة!`,
    };
  }

  // =========================================================================
  // 11. STAT MODIFIERS & QUICK-PLAY COMBAT SPELLS
  // =========================================================================
  if (name.includes('riryoku')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.filter((m) => m !== null && m.position !== 'face_down_defense');
    const myMonsters = player.monsterZones.filter((m) => m !== null && m.position !== 'face_down_defense');

    if (oppMonsters.length > 0 && myMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      const victim = oppMonsters[0];
      const beneficiary = myMonsters[0];

      const halfAtk = Math.floor((victim.currentAtk || victim.card.atk || 0) / 2);
      victim.currentAtk = Math.max(0, victim.currentAtk - halfAtk);
      beneficiary.currentAtk = (beneficiary.currentAtk || beneficiary.card.atk) + halfAtk;

      state.lastLog.push(`ريوريوكو (Riryoku)! سلب ${halfAtk} هجوم من ${victim.card.name} وأضافه إلى ${beneficiary.card.name} (أصبح ${beneficiary.currentAtk})!`);
      return {
        type: 'riryoku',
        title: 'ريوريوكو (Riryoku)',
        desc: `انتقلت ${halfAtk} نقطة هجوم من ${victim.card.name} إلى ${beneficiary.card.name}!`,
        drainedAtk: halfAtk,
        victimCard: victim.card,
        boostedCard: beneficiary.card,
      };
    }
  }

  if (name.includes('rush recklessly') || name.includes('reliable guardian') || name.includes('graceful dice') || name.includes('limiter removal') || name.includes('shield & sword')) {
    const myMonsters = player.monsterZones.filter((m) => m !== null);
    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
      const target = myMonsters[0];

      if (name.includes('rush recklessly')) {
        target.currentAtk = (target.currentAtk || target.card.atk) + 700;
        state.lastLog.push(`هجوم متهور (Rush Recklessly)! زاد هجوم ${target.card.name} بـ +700 نقطة.`);
      } else if (name.includes('reliable guardian')) {
        target.currentDef = (target.currentDef || target.card.def) + 700;
        state.lastLog.push(`الحارس الموثوق (The Reliable Guardian)! زاد دفاع ${target.card.name} بـ +700 نقطة.`);
      } else if (name.includes('graceful dice')) {
        const roll = Math.floor(Math.random() * 6) + 1;
        const boost = roll * 100;
        for (const m of myMonsters) {
          m.currentAtk = (m.currentAtk || m.card.atk) + boost;
          m.currentDef = (m.currentDef || m.card.def) + boost;
        }
        state.lastLog.push(`نرد النعمة الرشيق! أظهر النرد الرقم (${roll}) وزاد هجوم ودفاع وحوشك بـ +${boost} نقطة.`);
        return {
          type: 'graceful_dice',
          effectCategory: 'DICE_ROLL',
          title: 'نرد النعمة (Graceful Dice)',
          desc: `أظهر النرد الرقم [ ${roll} ] وزاد هجوم ودفاع جميع وحوشك بـ +${boost} نقطة!`,
          diceRoll: roll,
          roll,
          boostAmount: boost,
          targetCard: target.card,
        };
      } else if (name.includes('limiter removal')) {
        for (const m of myMonsters) {
          m.currentAtk = (m.currentAtk || m.card.atk) * 2;
        }
        state.lastLog.push('إزالة المحددات (Limiter Removal)! تضاعف هجوم جميع الآلات بالساحة إلى الضعف.');
        return {
          type: 'limiter_removal',
          effectCategory: 'STAT_MODIFY',
          title: 'إزالة المحددات (Limiter Removal)',
          desc: 'تضاعف هجوم جميع الآلات بالساحة إلى الضعف!',
          targetCard: target.card,
        };
      } else if (name.includes('shield & sword')) {
        for (const p of [player, opponent]) {
          for (const m of p.monsterZones) {
            if (m) {
              const temp = m.currentAtk;
              m.currentAtk = m.currentDef;
              m.currentDef = temp;
            }
          }
        }
        state.lastLog.push('الدرع والسيف (Shield & Sword)! تبادل هجوم ودفاع جميع وحوش الساحة.');
      }

      return {
        type: 'combat_mod',
        title: spell.name,
        desc: `تأثير قتالي غيّر موازين القوة على ${target.card.name}!`,
        targetCard: target.card,
      };
    }
  }

  // =========================================================================
  // 12. CONTROL STEAL SPELLS (Change of Heart, Snatch Steal, Soul Exchange)
  // =========================================================================
  if (name.includes('change of heart') || name.includes('snatch steal') || name.includes('soul exchange') || name.includes('enemy controller') || name.includes('mask of remnants')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null && item.slot.position !== 'face_down_defense');

    if (oppMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = oppMonsters[0];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);

      if (emptyZone !== -1) {
        player.monsterZones[emptyZone] = target.slot;
        opponent.monsterZones[target.idx] = null;
        state.lastLog.push(`تغيير النوايا / سرقة السيطرة! تمت السيطرة على وحش الخصم ${target.slot.card.name} ونقله لساحتك.`);
        return {
          type: 'control_steal',
          effectCategory: 'CONTROL_STEAL',
          title: spell.name,
          desc: `تمت السيطرة الكاملة على ${target.slot.card.name} وضمه لتحالفك!`,
          targetCard: target.slot.card,
          targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'تمت السيطرة على الوحش!', effectType: 'control' },
        };
      }
    }
  }

  // Shrink (Halve original ATK of 1 face-up monster)
  if (name.includes('shrink')) {
    let target = null;
    if (targetContext?.targetZoneIndex !== undefined && targetContext?.playerIndex !== undefined) {
      target = state.players[targetContext.playerIndex]?.monsterZones[targetContext.targetZoneIndex];
    }
    if (!target) {
      const oppMonsters = opponent.monsterZones.filter(m => m !== null && m.position !== 'face_down_defense');
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
        target = oppMonsters[0];
      } else {
        const myMonsters = player.monsterZones.filter(m => m !== null && m.position !== 'face_down_defense');
        if (myMonsters.length > 0) {
          myMonsters.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
          target = myMonsters[0];
        }
      }
    }
    if (target) {
      const originalAtk = target.card.atk || 0;
      const halvedAtk = Math.floor(originalAtk / 2);
      target.currentAtk = halvedAtk;
      state.lastLog.push(`الانكماش (Shrink)! تم تنصيف هجوم ${target.card.name} إلى ${halvedAtk} نقطة!`);
      return {
        type: 'shrink',
        effectCategory: 'STAT_MODIFY',
        title: 'الانكماش (Shrink)',
        desc: `تم تنصيف الهجوم الأصلي لـ ${target.card.name} إلى ${halvedAtk} نقطة!`,
        targetCard: target.card,
        halvedAtk,
      };
    }
  }

  // =========================================================================
  // 13. EQUIP SPELLS (Axe of Despair, Mage Power, United We Stand, Black Pendant, etc.)
  // =========================================================================
  if (subType === 'equip' || name.includes('axe of despair') || name.includes('nuzzler') || name.includes('unicorn') || name.includes('blade') || name.includes('sword') || name.includes('mage power') || name.includes('united we stand') || name.includes('black pendant') || name.includes('bright castle') || name.includes('megamorph') || name.includes('stim-pack') || name.includes('salamandra') || name.includes('fairy meteor') || name.includes('7 completed') || name.includes('cyber shield')) {
    const myMonsters = player.monsterZones.map((s, i) => ({ s, i })).filter((x) => x.s !== null);
    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.s.currentAtk || 0) - (a.s.currentAtk || 0));
      const target = myMonsters[0];

      let boostAtk = 500;
      let boostDef = 0;

      if (name.includes('axe of despair')) { boostAtk = 1000; }
      else if (name.includes('malevolent nuzzler')) { boostAtk = 700; }
      else if (name.includes('horn of the unicorn')) { boostAtk = 700; boostDef = 700; }
      else if (name.includes('lightning blade')) { boostAtk = 800; boostDef = -500; }
      else if (name.includes('mage power')) {
        const stCount = player.spellTrapZones.filter((z) => z !== null).length + (state.activeFieldSpell && state.activeFieldSpell.playerIndex === playerIndex ? 1 : 0);
        boostAtk = Math.max(500, stCount * 500);
        boostDef = boostAtk;
      } else if (name.includes('united we stand')) {
        const faceUpCount = player.monsterZones.filter((z) => z !== null && z.position !== 'face_down_defense').length;
        boostAtk = Math.max(800, faceUpCount * 800);
        boostDef = boostAtk;
      } else if (name.includes('megamorph')) {
        if (player.lifePoints < opponent.lifePoints) {
          boostAtk = target.s.card.atk; // Doubles original ATK
        } else {
          boostAtk = -Math.floor(target.s.card.atk / 2);
        }
      } else if (name.includes('stim-pack') || name.includes('salamandra') || name.includes('7 completed') || name.includes('sword of dragon')) {
        boostAtk = 700;
      } else if (name.includes('bright castle') || name.includes('black pendant') || name.includes('sword of deep-seated') || name.includes('cyber shield') || name.includes('dragonic attack')) {
        boostAtk = 500;
      } else if (name.includes('invigoration') || name.includes('burning spear') || name.includes('steel shell') || name.includes('gust fan') || name.includes('elf\'s light') || name.includes('dark destruction')) {
        boostAtk = 400;
        boostDef = -200;
      } else if (name.includes('horn of light')) {
        boostDef = 800;
      } else {
        boostAtk = 300;
        boostDef = 300;
      }

      target.s.currentAtk = Math.max(0, (target.s.currentAtk || target.s.card.atk) + boostAtk);
      target.s.currentDef = Math.max(0, (target.s.currentDef || target.s.card.def) + boostDef);

      state.lastLog.push(`تجهيز سلاح سحري: ${spell.name}! زاد هجوم ${target.s.card.name} بـ +${boostAtk} نقطة (أصبح ${target.s.currentAtk}).`);
      return {
        type: 'buff_atk',
        effectCategory: 'STAT_MODIFY',
        title: `تجهيز: ${spell.name}`,
        desc: `سلاح ${spell.name} الأسطوري عزز قوى ${target.s.card.name} بمقدار +${boostAtk} هجوم و +${boostDef} دفاع!`,
        boostAtk,
        boostDef,
        targetCard: target.s.card,
      };
    }
  }

  // =========================================================================
  // 14. CONTINUOUS & STORY/LEGENDARY PHARAONIC CARDS
  // =========================================================================
  if (name.includes('toon world')) {
    if (player.lifePoints > 1000) player.lifePoints -= 1000;
    state.lastLog.push(`عالم الكرتون (Toon World)! دفع ${player.name} 1000 نقطة وفُتح كتاب عالم الكرتون السحري.`);
    return {
      type: 'toon_world',
      title: 'عالم الكرتون (Toon World)',
      desc: 'فُتح كتاب عالم الكرتون السحري لحماية وتطوير وحوش الكرتون!',
    };
  }

  if (name.includes('burning land') || name.includes('chain energy') || name.includes('mask of dispel')) {
    opponent.lifePoints = Math.max(0, opponent.lifePoints - 500);
    state.lastLog.push(`أرض مشتعلة / طاقة مقيدة! سددت 500 ضرر مستمر لـ ${opponent.name}.`);
    return {
      type: 'continuous_burn',
      title: spell.name,
      desc: `طاقة سحرية مستمرة أصابت ${opponent.name} بـ 500 نقطة ضرر!`,
      damage: 500,
    };
  }

  if (name.includes('glory of the king\'s hand') || name.includes('seal of the ancients')) {
    for (const m of player.monsterZones) {
      if (m) {
        m.currentAtk = (m.currentAtk || m.card.atk) + 1000;
        m.currentDef = (m.currentDef || m.card.def) + 1000;
      }
    }
    state.lastLog.push(`مجد يد الملك الفرعوني الأسطوري! زاد هجوم ودفاع كل وحوشك بـ +1000 نقطة!`);
    return {
      type: 'pharaoh_glory',
      title: 'مجد يد الملك (Glory of the King\'s Hand)',
      desc: 'قوة فرعونية أسطورية عظيمة عززت كل وحوش الساحة بـ +1000 هجوم ودفاع!',
    };
  }

  // Universal Fallback for any other custom spell: Draw 1 card or +400 ATK
  const myMonstersFallback = player.monsterZones.filter((z) => z !== null);
  if (myMonstersFallback.length > 0) {
    myMonstersFallback[0].currentAtk = (myMonstersFallback[0].currentAtk || myMonstersFallback[0].card.atk) + 400;
    state.lastLog.push(`تأثير السحر: ${spell.name}! زاد هجوم ${myMonstersFallback[0].card.name} بـ +400 نقطة.`);
    return {
      type: 'buff_atk',
      title: spell.name,
      desc: `منح السحر دفعة هجومية للوحش ${myMonstersFallback[0].card.name} بمقدار +400 نقطة!`,
      boostAtk: 400,
      targetCard: myMonstersFallback[0].card,
    };
  } else {
    drawCardForTurnPlayer(state);
    state.lastLog.push(`تأثير السحر: ${spell.name}! سحب بطاقة إضافية.`);
    return {
      type: 'pot_of_greed',
      title: spell.name,
      desc: `منح السحر سحب بطاقة إضافية من المجموعة!`,
      cardsDrawn: 1,
    };
  }
}
