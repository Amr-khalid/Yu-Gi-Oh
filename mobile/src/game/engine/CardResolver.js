/**
 * CardResolver.js
 * Pure JavaScript summons, tribute mechanics, spell/trap activations
 */

import { checkWinConditions } from './WinCondition.js';
import { drawCardForTurnPlayer } from './PhaseManager.js';

export const FIELD_SPELLS = {
  yami: {
    key: 'yami',
    name: 'Yami',
    arabicName: 'ساحة الظلام (Yami)',
    bgImage: '/assets/fie_yami.png',
    themeClass: 'field-theme-yami',
    arabicSummary: '+200 هجوم ودفاع للوحوش الساحرة والشياطين / -200 للجنيات',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (card.race === 'Spellcaster' || card.race === 'Fiend') {
        atk += 200;
        def += 200;
      } else if (card.race === 'Fairy') {
        atk -= 200;
        def -= 200;
      }
      return { atk, def };
    },
  },
  umi: {
    key: 'umi',
    name: 'Umi',
    arabicName: 'ساحة المحيط (Umi)',
    bgImage: '/assets/fie_umi.png',
    themeClass: 'field-theme-umi',
    arabicSummary: '+200 هجوم ودفاع للوحوش المائية والرعدية والأسماك / -200 للآلات والنارية',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Fish', 'Sea Serpent', 'Thunder', 'Aqua'].includes(card.race) || card.attribute === 'WATER') {
        atk += 200;
        def += 200;
      } else if (['Machine', 'Pyro'].includes(card.race)) {
        atk -= 200;
        def -= 200;
      }
      return { atk, def };
    },
  },
  sogen: {
    key: 'sogen',
    name: 'Sogen',
    arabicName: 'ساحة المروج (Sogen)',
    bgImage: '/assets/fie_sougen.png',
    themeClass: 'field-theme-sogen',
    arabicSummary: '+200 هجوم ودفاع للمحاربين والمحاربين الوحوش',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (card.race === 'Warrior' || card.race === 'Beast-Warrior') {
        atk += 200;
        def += 200;
      }
      return { atk, def };
    },
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    arabicName: 'ساحة الغابة (Forest)',
    bgImage: '/assets/fie_mori.png',
    themeClass: 'field-theme-forest',
    arabicSummary: '+200 هجوم ودفاع للحشرات والوحوش الكاسرة والنباتية',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Insect', 'Beast', 'Plant', 'Beast-Warrior'].includes(card.race)) {
        atk += 200;
        def += 200;
      }
      return { atk, def };
    },
  },
  mountain: {
    key: 'mountain',
    name: 'Mountain',
    arabicName: 'ساحة الجبل (Mountain)',
    bgImage: '/assets/fie_yama.png',
    themeClass: 'field-theme-mountain',
    arabicSummary: '+200 هجوم ودفاع للتنانين والوحوش المجنحة والرعدية',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Dragon', 'Winged Beast', 'Thunder'].includes(card.race)) {
        atk += 200;
        def += 200;
      }
      return { atk, def };
    },
  },
  wasteland: {
    key: 'wasteland',
    name: 'Wasteland',
    arabicName: 'ساحة الأراضي القاحلة (Wasteland)',
    bgImage: '/assets/fie_kouya.png',
    themeClass: 'field-theme-wasteland',
    arabicSummary: '+200 هجوم ودفاع للديناصورات والزومبي والصخور',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Dinosaur', 'Zombie', 'Rock'].includes(card.race)) {
        atk += 200;
        def += 200;
      }
      return { atk, def };
    },
  },
  gaia: {
    key: 'gaia',
    name: 'Gaia Power',
    arabicName: 'ساحة قوة الأرض (Gaia Power)',
    bgImage: '/assets/fie_gaia.png',
    themeClass: 'field-theme-gaia',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر الأرض',
    getModifier(card) {
      if (card.attribute === 'EARTH') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  burn: {
    key: 'burn',
    name: 'Molten Destruction',
    arabicName: 'ساحة الدمار المنصهر (Molten Destruction)',
    bgImage: '/assets/fie_burn.png',
    themeClass: 'field-theme-burn',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر النار',
    getModifier(card) {
      if (card.attribute === 'FIRE') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  shine: {
    key: 'shine',
    name: 'Luminous Spark',
    arabicName: 'ساحة الشرارة المضيئة (Luminous Spark)',
    bgImage: '/assets/fie_shine.png',
    themeClass: 'field-theme-shine',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر النور',
    getModifier(card) {
      if (card.attribute === 'LIGHT') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  sanctuary: {
    key: 'sanctuary',
    name: 'Chorus of Sanctuary',
    arabicName: 'ساحة كورال الملاذ (Sanctuary)',
    bgImage: '/assets/fie_sanctu.png',
    themeClass: 'field-theme-sanctuary',
    arabicSummary: '+500 دفاع لجميع الوحوش في وضع الدفاع',
    getModifier(card, slot) {
      if (slot && (slot.position === 'face_up_defense' || slot.position === 'face_down_defense')) {
        return { atk: 0, def: 500 };
      }
      return { atk: 0, def: 0 };
    },
  },
};

export function applyFieldSpellModifierToSlot(activeFieldSpell, slot) {
  if (!activeFieldSpell || !slot || !slot.card) return;
  const config = FIELD_SPELLS[activeFieldSpell.key];
  if (config && config.getModifier) {
    const mod = config.getModifier(slot.card, slot);
    slot.currentAtk = Math.max(0, (slot.currentAtk !== undefined ? slot.currentAtk : slot.card.atk) + mod.atk);
    slot.currentDef = Math.max(0, (slot.currentDef !== undefined ? slot.currentDef : slot.card.def) + mod.def);
  }
}

export function recalculateAllMonsterStats(state) {
  const activeField = state.activeFieldSpell;
  const config = activeField ? FIELD_SPELLS[activeField.key] : null;

  for (const player of state.players) {
    for (const slot of player.monsterZones) {
      if (slot && slot.card) {
        let atk = slot.card.atk;
        let def = slot.card.def;
        if (config && config.getModifier) {
          const mod = config.getModifier(slot.card, slot);
          atk += mod.atk;
          def += mod.def;
        }
        slot.currentAtk = Math.max(0, atk);
        slot.currentDef = Math.max(0, def);
      }
    }
  }
}

export function normalSummon(
  state,
  playerIndex,
  handIndex,
  zoneIndex,
  position = 'face_up_attack',
  tributeZoneIndices = []
) {
  const player = state.players[playerIndex];

  if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') {
    throw new Error('لا يمكن الاستدعاء إلا في المرحلة الرئيسية الأولى أو الثانية');
  }
  if (state.currentTurnPlayer !== playerIndex) {
    throw new Error('ليس دورك حالياً');
  }
  if (player.normalSummonsRemaining <= 0) {
    throw new Error('استنفدت الاستدعاء العادي لهذا الدور');
  }

  const card = player.hand[handIndex];
  if (!card) {
    throw new Error('لم يتم العثور على البطاقة المحددة في اليد');
  }
  if (card.type !== 'monster') {
    throw new Error('البطاقة المحددة ليست وحشاً');
  }

  let requiredTributes = 0;
  if (card.level >= 7) requiredTributes = 2;
  else if (card.level >= 5) requiredTributes = 1;

  if (tributeZoneIndices.length < requiredTributes) {
    throw new Error(`يتطلب الوحش ذو المستوى ${card.level} التضحية بـ ${requiredTributes} وحش من ساحتك.`);
  }

  // Validate that all specified tribute zones actually have a monster
  for (const tZone of tributeZoneIndices) {
    if (!player.monsterZones[tZone]) {
      throw new Error(`الخانة ${tZone + 1} لا تحتوي على وحش لتقديمه كتضحية.`);
    }
  }

  // Send tributed monsters to graveyard and free their zones
  const tributedNames = [];
  for (const tZone of tributeZoneIndices) {
    const tSlot = player.monsterZones[tZone];
    if (tSlot) {
      player.graveyard.push(tSlot.card);
      player.monsterZones[tZone] = null;
      tributedNames.push(tSlot.card.name);
      state.lastLog.push(`تمت التضحية بالوحش ${tSlot.card.name}!`);
    }
  }

  // Find destination zone: prefer user's chosen zoneIndex if now free, else first open zone
  let targetZone = zoneIndex;
  if (targetZone === null || targetZone === undefined || player.monsterZones[targetZone] !== null) {
    targetZone = player.monsterZones.findIndex(z => z === null);
  }

  if (targetZone === -1 || targetZone === null) {
    throw new Error('جميع خانات الوحوش ممتلئة');
  }

  player.hand.splice(handIndex, 1);
  player.normalSummonsRemaining -= 1;

  const slot = {
    card,
    position,
    hasAttacked: false,
    canChangePosition: false,
    turnSummoned: state.turnNumber,
    currentAtk: card.atk,
    currentDef: card.def,
  };

  applyFieldSpellModifierToSlot(state.activeFieldSpell, slot);

  player.monsterZones[targetZone] = slot;

  const isSet = position === 'face_down_defense';
  const desc = isSet ? 'وحشاً مقلوباً في وضع الدفاع' : `${card.name} (هجوم: ${card.atk} / دفاع: ${card.def})`;
  if (requiredTributes > 0) {
    state.lastLog.push(`استدعاء تضحية: قدم ${player.name} (${tributedNames.join(' و ')}) واستدعى ${desc} في الخانة ${targetZone + 1}.`);
  } else {
    state.lastLog.push(`استدعى ${player.name} ${desc} في الخانة ${targetZone + 1}.`);
  }

  // Check reactive traps like Trap Hole
  checkSummonTraps(state, playerIndex, card, slot);

  return { state, targetZone, requiredTributes, tributedNames };
}

export function changeMonsterPosition(state, playerIndex, zoneIndex) {
  const player = state.players[playerIndex];
  const slot = player.monsterZones[zoneIndex];

  if (!slot) throw new Error('لا يوجد وحش في هذه الخانة');
  if (state.currentTurnPlayer !== playerIndex) throw new Error('ليس دورك');
  if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') throw new Error('تغيير الوضع متاح فقط في المرحلة الرئيسية');
  if (!slot.canChangePosition) throw new Error('تم تغيير وضع الوحش أو استدعاؤه في نفس هذا الدور');

  if (slot.position === 'face_up_attack') {
    slot.position = 'face_up_defense';
    state.lastLog.push(`تم تحويل ${slot.card.name} إلى وضع الدفاع.`);
  } else {
    slot.position = 'face_up_attack';
    state.lastLog.push(`تم تحويل ${slot.card.name} إلى وضع الهجوم.`);
  }

  slot.canChangePosition = false;
  return state;
}

export function setSpellTrap(state, playerIndex, handIndex, zoneIndex) {
  const player = state.players[playerIndex];
  if (player.spellTrapZones[zoneIndex] !== null) throw new Error('خانة السحر والفخاخ مشغولة');

  const card = player.hand[handIndex];
  if (card.type !== 'spell' && card.type !== 'trap') throw new Error('البطاقة ليست سحراً أو فخاً');

  player.hand.splice(handIndex, 1);

  const slot = {
    card,
    faceUp: false,
    turnSet: state.turnNumber,
  };

  player.spellTrapZones[zoneIndex] = slot;
  state.lastLog.push(`وضع ${player.name} بطاقة مقلوبة في خانة السحر/الفخاخ ${zoneIndex + 1}.`);

  return state;
}

export function activateSpell(state, playerIndex, handIndex, targetContext = null) {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== 'spell') throw new Error('البطاقة ليست بطاقة سحر');

  player.hand.splice(handIndex, 1);
  state.lastLog.push(`تفعيل بطاقة السحر: ${card.name}!`);

  const effectMeta = resolveSpellEffect(state, playerIndex, card, targetContext);

  if (effectMeta?.type !== 'field_spell' && card.subType !== 'field') {
    player.graveyard.push(card);
  }
  checkWinConditions(state);
  return { state, effectMeta, spellCard: card };
}

function resolveSpellEffect(state, playerIndex, spell, targetContext = null) {
  const player = state.players[playerIndex];
  const opponent = state.players[1 - playerIndex];
  const name = (spell.name || '').toLowerCase();

  // 0. Field Spell Cards (Yami, Umi, Sogen, Forest, Mountain, Wasteland, Gaia, Burn, Shine, Sanctuary)
  const isField = spell.subType === 'field' ||
    name.includes('yami') ||
    name.includes('umi') ||
    name.includes('sogen') ||
    name.includes('forest') ||
    name.includes('mountain') ||
    name.includes('wasteland') ||
    name.includes('gaia power') ||
    name.includes('molten destruction') ||
    name.includes('luminous spark') ||
    name.includes('sanctuary');

  if (isField) {
    let fieldKey = 'yami';
    if (name.includes('umi')) fieldKey = 'umi';
    else if (name.includes('sogen')) fieldKey = 'sogen';
    else if (name.includes('forest')) fieldKey = 'forest';
    else if (name.includes('mountain')) fieldKey = 'mountain';
    else if (name.includes('wasteland')) fieldKey = 'wasteland';
    else if (name.includes('gaia')) fieldKey = 'gaia';
    else if (name.includes('molten') || name.includes('burning')) fieldKey = 'burn';
    else if (name.includes('luminous') || name.includes('shine')) fieldKey = 'shine';
    else if (name.includes('sanctuary')) fieldKey = 'sanctuary';

    const fieldConfig = FIELD_SPELLS[fieldKey] || FIELD_SPELLS.yami;

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
      arabicName: fieldConfig.arabicName,
      bgImage: fieldConfig.bgImage,
      arabicSummary: fieldConfig.arabicSummary,
      themeClass: fieldConfig.themeClass,
    };

    recalculateAllMonsterStats(state);

    state.lastLog.push(`تغيرت أرض المعركة! تفعيل سحر الملعب: ${fieldConfig.arabicName} (${fieldConfig.arabicSummary}).`);

    return {
      type: 'field_spell',
      title: fieldConfig.arabicName,
      desc: `تحولت أرض المعركة ورموزها إلى ${fieldConfig.arabicName}! ${fieldConfig.arabicSummary}`,
      fieldKey,
      bgImage: fieldConfig.bgImage,
    };
  }

  // 1. Pot of Greed (Draw 2 cards)
  if (name.includes('pot of greed')) {
    drawCardForTurnPlayer(state);
    drawCardForTurnPlayer(state);
    state.lastLog.push(`تأثير جرة الطمع: سحب ${player.name} بطاقتين إضافيتين!`);
    return {
      type: 'pot_of_greed',
      title: 'جرة الطمع (Pot of Greed)',
      desc: `سحب ${player.name} بطاقتين إضافيتين من سطح المجموعة!`,
      cardsDrawn: 2,
    };
  }

  // 2. Raigeki (Destroy all opponent monsters)
  if (name.includes('raigeki')) {
    let destroyed = 0;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot) {
        opponent.graveyard.push(slot.card);
        opponent.monsterZones[i] = null;
        destroyed++;
      }
    }
    state.lastLog.push(`ضربة الصاعقة (Raigeki)! دمرت جميع وحوش الخصم (${destroyed} وحش).`);
    return {
      type: 'raigeki',
      title: 'ضربة الصاعقة (Raigeki)',
      desc: `صاعقة هائلة دمرت جميع وحوش ${opponent.name} (${destroyed} وحش)!`,
      destroyedCount: destroyed,
    };
  }

  // 3. Dark Hole (Destroy all monsters on field)
  if (name.includes('dark hole')) {
    let destroyed = 0;
    for (const p of [player, opponent]) {
      for (let i = 0; i < 5; i++) {
        const slot = p.monsterZones[i];
        if (slot) {
          p.graveyard.push(slot.card);
          p.monsterZones[i] = null;
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
    };
  }

  // 4. Monster Reborn (Revive chosen or strongest monster from either graveyard)
  if (name.includes('monster reborn')) {
    let revived = targetContext?.selectedTargetCard;
    if (!revived) {
      const allGY = [...player.graveyard, ...opponent.graveyard].filter(c => c.type === 'monster');
      allGY.sort((a, b) => (b.atk || 0) - (a.atk || 0));
      if (allGY.length > 0) revived = allGY[0];
    }

    if (revived) {
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        // Remove from the respective graveyard
        const inPlayerGY = player.graveyard.findIndex(c => c === revived || (c.id && c.id === revived.id) || (c.name === revived.name && c.atk === revived.atk));
        if (inPlayerGY !== -1) {
          player.graveyard.splice(inPlayerGY, 1);
        } else {
          const inOppGY = opponent.graveyard.findIndex(c => c === revived || (c.id && c.id === revived.id) || (c.name === revived.name && c.atk === revived.atk));
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
          title: 'ولادة الوحش (Monster Reborn)',
          desc: `أعيد إحياء ${revived.name} (هجوم: ${revived.atk} / دفاع: ${revived.def}) إلى ساحة ${player.name}!`,
          revivedCard: revived,
        };
      }
    }
    return {
      type: 'monster_reborn',
      title: 'ولادة الوحش (Monster Reborn)',
      desc: 'لم يتم العثور على وحوش في المقبرة أو خانات الساحة ممتلئة.',
    };
  }

  // 4b. Premature Burial (Pay 800 LP, special summon 1 monster from your graveyard)
  if (name.includes('premature burial')) {
    if (player.lifePoints <= 800) {
      throw new Error('نقاط حياتك غير كافية لدفع تكلفة الدفن المبكر (800 نقطة حياة)');
    }
    player.lifePoints -= 800;
    let target = targetContext?.selectedTargetCard;
    if (!target) {
      const pMonsters = player.graveyard.filter(c => c.type === 'monster');
      pMonsters.sort((a, b) => (b.atk || 0) - (a.atk || 0));
      if (pMonsters.length > 0) target = pMonsters[0];
    }
    if (target) {
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        const inPlayerIdx = player.graveyard.findIndex(c => c === target || (c.id && c.id === target.id) || c.name === target.name);
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
        state.lastLog.push(`الدفن المبكر: دفع ${player.name} 800 نقطة واستدعى ${target.name}.`);
        return {
          type: 'premature_burial',
          title: 'الدفن المبكر (Premature Burial)',
          desc: `دفع ${player.name} 800 نقطة واستدعى ${target.name} (هجوم: ${target.atk})!`,
          revivedCard: target,
        };
      }
    }
  }

  // 4c. The Shallow Grave (Special summon 1 monster in face-down defense)
  if (name.includes('shallow grave')) {
    let target = targetContext?.selectedTargetCard;
    if (!target) {
      const pMonsters = player.graveyard.filter(c => c.type === 'monster');
      pMonsters.sort((a, b) => (b.def || 0) - (a.def || 0));
      if (pMonsters.length > 0) target = pMonsters[0];
    }
    if (target) {
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        const inPlayerIdx = player.graveyard.findIndex(c => c === target || (c.id && c.id === target.id) || c.name === target.name);
        if (inPlayerIdx !== -1) player.graveyard.splice(inPlayerIdx, 1);
        player.monsterZones[emptyZone] = {
          card: target,
          position: 'face_down_defense',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: target.atk,
          currentDef: target.def,
        };
        state.lastLog.push(`القبر السطحي: استدعى ${player.name} وحشاً مقلوباً في وضع الدفاع من المقبرة.`);
        return {
          type: 'shallow_grave',
          title: 'القبر السطحي (The Shallow Grave)',
          desc: `استدعي ${target.name} من المقبرة مقلوباً في وضع الدفاع!`,
          revivedCard: target,
        };
      }
    }
  }

  // 4d. Monster Recovery / Monster Reincarnation / Salvage (Return monster from graveyard to hand)
  if (name.includes('reincarnation') || name.includes('recovery') || name.includes('salvage')) {
    let target = targetContext?.selectedTargetCard;
    if (!target) {
      const pMonsters = player.graveyard.filter(c => c.type === 'monster');
      if (pMonsters.length > 0) target = pMonsters[pMonsters.length - 1];
    }
    if (target) {
      const inPlayerIdx = player.graveyard.findIndex(c => c === target || (c.id && c.id === target.id) || c.name === target.name);
      if (inPlayerIdx !== -1) player.graveyard.splice(inPlayerIdx, 1);
      player.hand.push(target);
      state.lastLog.push(`استعادة الوحش! استعاد ${player.name} الوحش ${target.name} من المقبرة إلى يده.`);
      return {
        type: 'monster_recover',
        title: 'استعادة الوحش إلى اليد',
        desc: `تمت استعادة ${target.name} بنجاح من المقبرة إلى يد ${player.name}!`,
        targetCard: target,
      };
    }
  }

  // 4e. Magician of Faith / Spell Recovery (Return spell card from graveyard to hand)
  if (name.includes('magician of faith') || name.includes('spell reproduction') || name.includes('feather of the phoenix')) {
    let target = targetContext?.selectedTargetCard;
    if (!target) {
      const pSpells = player.graveyard.filter(c => c.type === 'spell');
      if (pSpells.length > 0) target = pSpells[pSpells.length - 1];
    }
    if (target) {
      const inPlayerIdx = player.graveyard.findIndex(c => c === target || (c.id && c.id === target.id) || c.name === target.name);
      if (inPlayerIdx !== -1) player.graveyard.splice(inPlayerIdx, 1);
      player.hand.push(target);
      state.lastLog.push(`استعادة السحر! استعاد ${player.name} بطاقة السحر ${target.name} من المقبرة إلى يده.`);
      return {
        type: 'spell_recovery',
        title: 'استعادة بطاقة سحر إلى اليد',
        desc: `عادت بطاقة السحر ${target.name} من المقبرة إلى يد ${player.name}!`,
        targetCard: target,
      };
    }
  }

  // 4f. Pot of Avarice (Shuffle 5 monsters from GY into deck, draw 2 cards)
  if (name.includes('pot of avarice') || name.includes('avarice')) {
    const monsters = player.graveyard.filter(c => c.type === 'monster');
    if (monsters.length >= 5) {
      const chosen = monsters.slice(0, 5);
      for (const m of chosen) {
        const idx = player.graveyard.indexOf(m);
        if (idx !== -1) player.graveyard.splice(idx, 1);
        player.deck.push(m);
      }
      player.deck = shuffleDeck(player.deck);
      drawCardForTurnPlayer(state);
      drawCardForTurnPlayer(state);
      state.lastLog.push(`جرة الشره (Pot of Avarice)! أعاد ${player.name} 5 وحوش لمجموعته وسحب بطاقتين.`);
      return {
        type: 'pot_of_avarice',
        title: 'جرة الشره (Pot of Avarice)',
        desc: `أعاد ${player.name} 5 وحوش من مقبرته إلى مجموعته وسحب بطاقتين!`,
        cardsDrawn: 2,
      };
    }
  }

  // 5. Change of Heart (Take control of opponent's strongest monster)
  if (name.includes('change of heart')) {
    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null);

    if (oppMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = oppMonsters[0];
      const emptyZone = player.monsterZones.findIndex(z => z === null);

      if (emptyZone !== -1) {
        player.monsterZones[emptyZone] = target.slot;
        opponent.monsterZones[target.idx] = null;
        state.lastLog.push(`تغيير القلب (Change of Heart)! سيطر ${player.name} على ${target.slot.card.name}.`);
        return {
          type: 'change_of_heart',
          title: 'تغيير القلب (Change of Heart)',
          desc: `تمت السيطرة على وحش الخصم ${target.slot.card.name} ونقله إلى صفوفك!`,
          targetCard: target.slot.card,
        };
      }
    }
  }

  // 6. Swords of Revealing Light (Flip all opponent face-down monsters face-up & seal attacks)
  if (name.includes('swords') || name.includes('revealing light')) {
    let revealed = 0;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot && slot.position === 'face_down_defense') {
        slot.position = 'face_up_defense';
        revealed++;
      }
    }
    state.lastLog.push(`سيوف النور الكاشف! كشفت وحوش الخصم وشلت قدرتهم على الهجوم.`);
    return {
      type: 'swords',
      title: 'سيوف النور الكاشف (Swords of Revealing Light)',
      desc: `أضاءت سيوف النور الساحة وكشفت ${revealed} وحوش مقلوبة وشلت هجوم الخصم!`,
      revealedCount: revealed,
    };
  }

  // 7. Heavy Storm & Harpie's Feather Duster (Destroy spell/traps)
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
    state.lastLog.push(`عاصفة مدمرة أطاحت بـ ${destroyed} من بطاقات السحر والفخاخ!`);
    return {
      type: 'heavy_storm',
      title: name.includes('harpie') ? 'مكنسة هاربي (Harpie\'s Duster)' : 'العاصفة الهوجاء (Heavy Storm)',
      desc: `رياح عاتية دمرت جميع بطاقات السحر والفخاخ (${destroyed} بطاقة)!`,
      destroyedCount: destroyed,
    };
  }

  // 8. Fissure (Destroy opponent monster with lowest ATK)
  if (name.includes('fissure')) {
    const oppFaceUp = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');

    if (oppFaceUp.length > 0) {
      oppFaceUp.sort((a, b) => (a.slot.currentAtk || 0) - (b.slot.currentAtk || 0));
      const target = oppFaceUp[0];
      opponent.graveyard.push(target.slot.card);
      opponent.monsterZones[target.idx] = null;
      state.lastLog.push(`الشق (Fissure)! دمر وحش الخصم ${target.slot.card.name}.`);
      return {
        type: 'fissure',
        title: 'الشق الأرضي (Fissure)',
        desc: `انشقت الأرض وابتلعت أضعف وحوش الخصم: ${target.slot.card.name}!`,
        targetCard: target.slot.card,
      };
    }
  }

  // 9. Tribute to The Doomed (Destroy 1 target opponent monster)
  if (name.includes('tribute to the doomed')) {
    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null);

    if (oppMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = oppMonsters[0];
      opponent.graveyard.push(target.slot.card);
      opponent.monsterZones[target.idx] = null;
      state.lastLog.push(`قربان للهلاك! دمر وحش الخصم ${target.slot.card.name}.`);
      return {
        type: 'tribute_doomed',
        title: 'قربان للهلاك (Tribute to The Doomed)',
        desc: `تم القضاء على أقوى وحوش الخصم: ${target.slot.card.name}!`,
        targetCard: target.slot.card,
      };
    }
  }

  // 10. Dian Keto the Cure Master (Gain 1000 LP)
  if (name.includes('dian keto') || name.includes('cure master') || name.includes('heal')) {
    player.lifePoints += 1000;
    state.lastLog.push(`شفاء ديان كيتو! استعاد ${player.name} 1000 نقطة حياة.`);
    return {
      type: 'dian_keto',
      title: 'شفاء ديان كيتو (Dian Keto)',
      desc: `نور الشفاء المقدس أعاد لـ ${player.name} 1000 نقطة حياة!`,
      heal: 1000,
    };
  }

  // 11. Direct Damage Spells: Ookazi (800 LP), Hinotama (500 LP), Sparks (200 LP)
  if (name.includes('ookazi') || name.includes('hinotama') || name.includes('sparks')) {
    const burnDmg = name.includes('ookazi') ? 800 : name.includes('hinotama') ? 500 : 200;
    opponent.lifePoints = Math.max(0, opponent.lifePoints - burnDmg);
    state.lastLog.push(`سحر ناري! سدد ${burnDmg} نقطة ضرر مباشر لـ ${opponent.name}.`);
    return {
      type: 'burn_damage',
      title: name.includes('ookazi') ? 'أوكازي (Ookazi)' : name.includes('hinotama') ? 'كرة النار (Hinotama)' : 'الشرر (Sparks)',
      desc: `قذيفة سحرية حارقة أصابت نقاط حياة ${opponent.name} بـ ${burnDmg} نقطة ضرر!`,
      damage: burnDmg,
    };
  }

  // 12. De-Spell (Destroy 1 opponent Spell/Trap)
  if (name.includes('de-spell')) {
    const oppST = opponent.spellTrapZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null);

    if (oppST.length > 0) {
      const target = oppST[0];
      opponent.graveyard.push(target.slot.card);
      opponent.spellTrapZones[target.idx] = null;
      state.lastLog.push(`إلغاء السحر (De-Spell)! دمر بطاقة سحر/فخ لـ ${opponent.name}.`);
      return {
        type: 'de_spell',
        title: 'إلغاء السحر (De-Spell)',
        desc: `تم إبطال وتدمير بطاقة سحر/فخ من ساحة الخصم!`,
      };
    }
  }

  // 13. Equip / Field / Buff Spells
  const isBuffSpell =
    name.includes('nuzzler') ||
    name.includes('unicorn') ||
    name.includes('blade') ||
    name.includes('axe') ||
    name.includes('sword') ||
    name.includes('light') ||
    name.includes('gaia') ||
    name.includes('umi') ||
    name.includes('yami') ||
    name.includes('sogen') ||
    name.includes('forest') ||
    name.includes('mountain') ||
    name.includes('power');

  if (isBuffSpell) {
    const myMonsters = player.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null);

    if (myMonsters.length > 0) {
      myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      const target = myMonsters[0];
      target.slot.currentAtk = (target.slot.currentAtk || target.slot.card.atk) + 500;
      state.lastLog.push(`سحر التعزيز: زاد هجوم ${target.slot.card.name} بمقدار +500 نقطة (أصبح ${target.slot.currentAtk})!`);
      return {
        type: 'buff_atk',
        title: `سحر التعزيز: ${spell.name}`,
        desc: `قوة سحرية رفعت نقاط هجوم ${target.slot.card.name} بمقدار +500 نقطة!`,
        boostAtk: 500,
        targetCard: target.slot.card,
      };
    }
  }

  // Fallback: General Spell effect (draw 1 card or +300 ATK boost)
  const myMonstersFallback = player.monsterZones.filter(z => z !== null);
  if (myMonstersFallback.length > 0) {
    myMonstersFallback[0].currentAtk = (myMonstersFallback[0].currentAtk || myMonstersFallback[0].card.atk) + 300;
    state.lastLog.push(`تأثير ${spell.name}: زاد هجوم ${myMonstersFallback[0].card.name} بمقدار +300 نقطة.`);
    return {
      type: 'buff_atk',
      title: spell.name,
      desc: `منح السحر دفعة هجومية للوحش ${myMonstersFallback[0].card.name} بمقدار +300 نقطة!`,
      boostAtk: 300,
      targetCard: myMonstersFallback[0].card,
    };
  } else {
    drawCardForTurnPlayer(state);
    state.lastLog.push(`تأثير ${spell.name}: سحب بطاقة إضافية.`);
    return {
      type: 'pot_of_greed',
      title: spell.name,
      desc: `منح السحر سحب بطاقة إضافية من المجموعة!`,
      cardsDrawn: 1,
    };
  }
}

function checkSummonTraps(state, summoningPlayerIndex, summonedMonster, summonedSlot) {
  const opponentIndex = 1 - summoningPlayerIndex;
  const opponent = state.players[opponentIndex];

  for (let i = 0; i < 5; i++) {
    const slot = opponent.spellTrapZones[i];
    if (slot && !slot.faceUp && slot.card.type === 'trap') {
      const trapName = slot.card.name.toLowerCase();

      if (trapName.includes('trap hole') && summonedMonster.atk >= 1000) {
        slot.faceUp = true;
        opponent.spellTrapZones[i] = null;
        opponent.graveyard.push(slot.card);

        const zoneIdx = state.players[summoningPlayerIndex].monsterZones.indexOf(summonedSlot);
        if (zoneIdx !== -1) {
          state.players[summoningPlayerIndex].monsterZones[zoneIdx] = null;
          state.players[summoningPlayerIndex].graveyard.push(summonedMonster);
          state.lastLog.push(`تفعيل فخ الحفرة (Trap Hole)! سقط ${summonedMonster.name} ودُمر.`);
        }
        break;
      }
    }
  }
}
