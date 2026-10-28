/**
 * CardResolver.js
 * Pure JavaScript summons, tribute mechanics, spell/trap activations
 */

import { checkWinConditions } from './WinCondition.js';
import { drawCardForTurnPlayer } from './PhaseManager.js';
import { resolveMonsterEffect, isTrapNegated, isIndestructibleByBattle, hasMonsterEffect } from './MonsterEffects.js';
import { shuffleDeck } from './GameState.js';
import { resolveSpellEffect as dispatchSpellEffect } from './SpellEffects.js';
import { resolveTrapEffect as dispatchTrapEffect } from './TrapEffects.js';

export const FIELD_SPELLS = {
  yami: {
    key: 'yami',
    name: 'Yami',
    arabicName: 'ساحة الظلام (Yami)',
    bgImage: '/assets/fie_dark.png',
    bgLight: '/assets/fie_dark_light.png',
    themeClass: 'field-theme-yami',
    arabicSummary: '+200 هجوم ودفاع للوحوش الساحرة والشياطين / -200 للجنيات والأنوار',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (card.race === 'Spellcaster' || card.race === 'Fiend' || card.attribute === 'DARK') {
        atk += 200;
        def += 200;
      } else if (card.race === 'Fairy' || card.attribute === 'LIGHT') {
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
    bgLight: '/assets/fie_umi_light.png',
    themeClass: 'field-theme-umi',
    arabicSummary: '+200 هجوم ودفاع للوحوش المائية والرعدية والأسماك / -200 للآلات والنارية',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Fish', 'Sea Serpent', 'Thunder', 'Aqua'].includes(card.race) || card.attribute === 'WATER') {
        atk += 200;
        def += 200;
      } else if (['Machine', 'Pyro'].includes(card.race) || card.attribute === 'FIRE') {
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
    bgImage: '/assets/fie_desert.png',
    bgLight: '/assets/fie_desert_light.png',
    themeClass: 'field-theme-sogen',
    arabicSummary: '+200 هجوم ودفاع للمحاربين ومحاربي الوحوش',
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
    bgImage: '/assets/fie_emerald_oasis.jpg',
    bgLight: '/assets/fie_emerald_oasis.jpg',
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
    bgImage: '/assets/fie_crimson_thunder.jpg',
    bgLight: '/assets/fie_crimson_thunder.jpg',
    themeClass: 'field-theme-mountain',
    arabicSummary: '+200 هجوم ودفاع للتنانين والوحوش المجنحة والرعدية / -200 لعنصر الأرض',
    getModifier(card) {
      let atk = 0;
      let def = 0;
      if (['Dragon', 'Winged Beast', 'Thunder'].includes(card.race) || card.attribute === 'WIND') {
        atk += 200;
        def += 200;
      } else if (card.attribute === 'EARTH') {
        atk -= 200;
        def -= 200;
      }
      return { atk, def };
    },
  },
  wasteland: {
    key: 'wasteland',
    name: 'Wasteland',
    arabicName: 'ساحة الأراضي القاحلة (Wasteland)',
    bgImage: '/assets/fie_desert.png',
    bgLight: '/assets/fie_desert_light.png',
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
    bgImage: '/assets/fie_desert.png',
    bgLight: '/assets/fie_desert_light.png',
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
    bgLight: '/assets/fie_burn_light.png',
    themeClass: 'field-theme-burn',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر النار',
    getModifier(card) {
      if (card.attribute === 'FIRE' || card.race === 'Pyro') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  shine: {
    key: 'shine',
    name: 'Luminous Spark',
    arabicName: 'ساحة الشرارة المضيئة (Luminous Spark)',
    bgImage: '/assets/fie_light.png',
    bgLight: '/assets/fie_light.png',
    themeClass: 'field-theme-shine',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر النور',
    getModifier(card) {
      if (card.attribute === 'LIGHT' || card.race === 'Fairy') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  plasma: {
    key: 'plasma',
    name: 'Mystic Plasma Zone',
    arabicName: 'منطقة البلازما الغامضة (Mystic Plasma Zone)',
    bgImage: '/assets/fie_black_hole.jpg',
    bgLight: '/assets/fie_black_hole.jpg',
    themeClass: 'field-theme-dark',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر الظلام',
    getModifier(card) {
      if (card.attribute === 'DARK' || card.race === 'Fiend') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  wind: {
    key: 'wind',
    name: 'Rising Air Current',
    arabicName: 'تيار الهواء الصاعد (Rising Air Current)',
    bgImage: '/assets/fie_winged_ra.jpg',
    bgLight: '/assets/fie_winged_ra.jpg',
    themeClass: 'field-theme-light',
    arabicSummary: '+500 هجوم و -400 دفاع لوحوش عنصر الرياح',
    getModifier(card) {
      if (card.attribute === 'WIND' || card.race === 'Winged Beast') return { atk: 500, def: -400 };
      return { atk: 0, def: 0 };
    },
  },
  sanctuary: {
    key: 'sanctuary',
    name: 'Chorus of Sanctuary',
    arabicName: 'ساحة كورال الملاذ (Sanctuary)',
    bgImage: '/assets/fie_silver_sanctuary.jpg',
    bgLight: '/assets/fie_silver_sanctuary.jpg',
    themeClass: 'field-theme-sanctuary',
    arabicSummary: '+500 دفاع لجميع الوحوش في وضع الدفاع',
    getModifier(card, slot) {
      if (slot && (slot.position === 'face_up_defense' || slot.position === 'face_down_defense')) {
        return { atk: 0, def: 500 };
      }
      return { atk: 0, def: 0 };
    },
  },
  necrovalley: {
    key: 'necrovalley',
    name: 'Necrovalley',
    arabicName: 'وادي الموتى (Necrovalley)',
    bgImage: '/assets/fie_anubis_scales.jpg',
    bgLight: '/assets/fie_anubis_scales.jpg',
    themeClass: 'field-theme-necrovalley',
    arabicSummary: '+500 هجوم ودفاع لجميع وحوش حراس القبور (Gravekeeper)',
    getModifier(card) {
      if ((card.name || '').toLowerCase().includes('gravekeeper')) {
        return { atk: 500, def: 500 };
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
  if (!state || !Array.isArray(state.players)) return;
  const activeField = state.activeFieldSpell;
  const config = activeField ? FIELD_SPELLS[activeField.key] : null;

  let totalMachines = 0;
  for (const p of state.players) {
    for (const s of p.monsterZones) {
      if (s && s.card && (s.card.race === 'Machine' || s.card.type?.toLowerCase().includes('machine'))) {
        totalMachines++;
      }
    }
  }

  for (let pIdx = 0; pIdx < state.players.length; pIdx++) {
    const player = state.players[pIdx];
    const hasCommandKnight = player.monsterZones.some(s => s && (s.card.name || '').toLowerCase().includes('command knight'));
    const hasGadget = player.monsterZones.some(s => s && (s.card.name || '').toLowerCase().includes('gadget'));

    for (const slot of player.monsterZones) {
      if (slot && slot.card) {
        let atk = slot.card.atk;
        let def = slot.card.def;
        const name = (slot.card.name || '').toLowerCase();

        // 1. Field Spell modifier
        if (config && config.getModifier) {
          const mod = config.getModifier(slot.card, slot);
          atk += mod.atk;
          def += mod.def;
        }

        // 2. Slifer the Sky Dragon (1000 ATK/DEF per hand card)
        if (name.includes('slifer the sky dragon')) {
          atk = (player.hand.length) * 1000;
          def = (player.hand.length) * 1000;
        }

        // 3. Machine King (+100 ATK per Machine on field)
        if (name.includes('machine king')) {
          atk += totalMachines * 100;
        }

        // 4. Command Knight (+400 ATK to all friendly Warriors)
        if (hasCommandKnight && (slot.card.race === 'Warrior' || slot.card.type?.toLowerCase().includes('warrior'))) {
          atk += 400;
        }

        // 5. Shadow Ghoul (+100 ATK per monster in GY)
        if (name.includes('shadow ghoul')) {
          const gyCount = player.graveyard.filter(c => c.type === 'monster').length;
          atk += gyCount * 100;
        }

        // 6. Gren Maju Da Eiza (+400 ATK/DEF per banished card)
        if (name.includes('gren maju')) {
          const banCount = (player.banished?.length || 0);
          atk = banCount * 400;
          def = banCount * 400;
        }

        // 7. King of the Skull Servants (+1000 ATK per Skull Servant / King in GY)
        if (name.includes('king of the skull servants')) {
          const skullCount = player.graveyard.filter(c => (c.name || '').toLowerCase().includes('skull servant') || (c.name || '').toLowerCase().includes('king of the skull')).length;
          atk = skullCount * 1000;
        }

        // 8. Boot-Up Soldier (+2000 ATK if Gadget on field)
        if (name.includes('boot-up soldier') && hasGadget) {
          atk += 2000;
        }

        // Preserve temporary buffs (e.g. Rush Recklessly, Metalmorph, etc.)
        if (slot.buffAtk) atk += slot.buffAtk;
        if (slot.buffDef) def += slot.buffDef;

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
    throw new Error('ماتقدرش تنزل وحوش إلا في المرحلة الأولى أو التانية بس');
  }
  if (state.currentTurnPlayer !== playerIndex) {
    throw new Error('مش دورك دلوقتي');
  }
  if (player.normalSummonsRemaining <= 0) {
    throw new Error(
      state.isTagMode
        ? 'فريقكم استنفد كل استدعاءات الوحوش العادية للدور ده (الوحشين نزلوا خلاص)'
        : 'نزلت وحش خلاص في الدور ده (استنفدت استدعاءك)'
    );
  }

  const card = player.hand[handIndex];
  if (!card) {
    throw new Error('الكارت ده مش موجود في إيدك');
  }
  if (card.type !== 'monster') {
    throw new Error('الكارت ده مش وحش');
  }

  let requiredTributes = 0;
  if (card.level >= 7) requiredTributes = 2;
  else if (card.level >= 5) requiredTributes = 1;

  if (tributeZoneIndices.length < requiredTributes) {
    throw new Error(`الوحش ده مستواه ${card.level} ومحتاج تضحي بـ ${requiredTributes} وحش من ملعبك علشان تنزله.`);
  }

  // Validate that all specified tribute zones actually have a monster and are not tokens
  for (const tZone of tributeZoneIndices) {
    const tSlot = player.monsterZones[tZone];
    if (!tSlot) {
      throw new Error(`الخانة ${tZone + 1} مافيهاش وحش علشان تضحي بيه.`);
    }
    if (tSlot.isToken || (tSlot.card && tSlot.card.subType === 'token')) {
      throw new Error(`ماتقدرش تضحي بتوكن خروف كبش الفداء علشان تنزل وحش تضحية.`);
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
      state.lastLog.push(`ضحى بالوحش ${tSlot.card.name}!`);
    }
  }

  // Find destination zone: prefer user's chosen zoneIndex if now free, else first open zone
  let targetZone = zoneIndex;
  if (targetZone === null || targetZone === undefined || player.monsterZones[targetZone] !== null) {
    targetZone = player.monsterZones.findIndex(z => z === null);
  }

  if (targetZone === -1 || targetZone === null) {
    throw new Error('كل خانات الوحوش عندك مليانة');
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
  recalculateAllMonsterStats(state);

  const isSet = position === 'face_down_defense';
  const desc = isSet ? 'وحش مقلوب في وضع الدفاع' : `${card.name} (هجوم: ${card.atk} / دفاع: ${card.def})`;
  if (requiredTributes > 0) {
    state.lastLog.push(`استدعاء تضحية: ${player.name} ضحى بـ (${tributedNames.join(' و ')}) ونزّل ${desc} في الخانة ${targetZone + 1}.`);
  } else {
    state.lastLog.push(`${player.name} نزّل ${desc} في الخانة ${targetZone + 1}.`);
  }

  // Trigger onSummon monster effect if applicable
  if (card.subType === 'effect' && position !== 'face_down_defense') {
    resolveMonsterEffect(state, playerIndex, card, 'onSummon', { zoneIndex: targetZone });
  }

  // Check reactive traps like Trap Hole (negated if Jinzo is active)
  if (!isTrapNegated(state)) {
    checkSummonTraps(state, playerIndex, card, slot);
  } else {
    state.lastLog.push('تأثير جينزو (Jinzo) موقف ومعطل كل الفخاخ في الملعب!');
  }

  return { state, targetZone, requiredTributes, tributedNames };
}

/**
 * Central monster destruction dispatcher.
 * Handles removing monster from zone, pushing to graveyard, and triggering onDestroy effects.
 * Triggers properly even if monster was face-down when destroyed by spell, trap, battle, or effect!
 */
export function destroyMonsterSlot(state, playerIndex, zoneIndex, reason = 'card_effect', sourceCard = null) {
  const player = state.players[playerIndex];
  if (!player) return null;
  const slot = player.monsterZones[zoneIndex];
  if (!slot) return null;

  const card = slot.card;
  const wasFaceDown = slot.position === 'face_down_defense';
  const previousAtk = slot.currentAtk;
  const previousDef = slot.currentDef;

  // Battle destruction immunity check
  if (reason === 'battle' && (isIndestructibleByBattle(card, sourceCard ? { currentAtk: sourceCard.atk, card: sourceCard } : null) || state.wabokuActivePlayer === playerIndex || player.zeroBattleDamage)) {
    state.lastLog.push(`ميزة خاصة: صمد ${card.name} وما ماتش في المعركة دي!`);
    return null;
  }

  // Remove monster from field zone and push to player's graveyard
  player.monsterZones[zoneIndex] = null;
  player.graveyard.push(card);

  // Trigger onDestroy monster effect (triggers even if destroyed while face-down!)
  let effectResult = null;
  if (card && card.subType === 'effect') {
    try {
      effectResult = resolveMonsterEffect(state, playerIndex, card, 'onDestroy', {
        wasFaceDown,
        reason,
        sourceCard,
        zoneIndex,
      });
    } catch (e) {
      console.warn(`Failed to resolve onDestroy for ${card.name}:`, e);
    }
  }

  return {
    destroyedCard: card,
    playerIndex,
    zoneIndex,
    wasFaceDown,
    previousAtk,
    previousDef,
    effectResult,
  };
}

export function changeMonsterPosition(state, playerIndex, zoneIndex, context = {}) {
  const player = state.players[playerIndex];
  const slot = player.monsterZones[zoneIndex];

  if (!slot) throw new Error('مافيش وحش في الخانة دي');
  if (state.currentTurnPlayer !== playerIndex) throw new Error('مش دورك دلوقتي');
  if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') throw new Error('ماتقدرش تغير وضع الوحش إلا في المرحلة الأولى أو التانية');
  if (!slot.canChangePosition) throw new Error('الوحش ده نزّلته أو غيرت وضعه خلاص في نفس الدور ده');

  const wasFaceDown = slot.position === 'face_down_defense';
  let flipResult = null;
  if (slot.position === 'face_up_attack') {
    slot.position = 'face_up_defense';
    state.lastLog.push(`اتحوّل ${slot.card.name} لوضع الدفاع.`);
  } else {
    slot.position = 'face_up_attack';
    state.lastLog.push(`اتحوّل ${slot.card.name} لوضع الهجوم.`);
    if (wasFaceDown && slot.card.subType === 'effect' && !slot.hasFlipped) {
      slot.hasFlipped = true;
      flipResult = resolveMonsterEffect(state, playerIndex, slot.card, 'flip', {
        zoneIndex,
        destroyMonster: destroyMonsterSlot,
        targetZoneIndex: context.targetZoneIndex,
        targetZoneIndices: context.targetZoneIndices,
      });
    }
  }

  slot.canChangePosition = false;
  return { state, flipResult, wasFaceDown };
}

export function activateMonsterEffect(state, playerIndex, zoneIndex, targetContext = {}) {
  const player = state.players[playerIndex];
  if (!player) throw new Error('اللاعب غير موجود');
  if (state.currentTurnPlayer !== playerIndex) {
    throw new Error('ماينفعش تشغل قدرات وحوشك إلا في دورك يا بطل!');
  }
  if (state.phase !== 'MAIN1' && state.phase !== 'MAIN2') {
    throw new Error('تقدر تشغل قدرات الوحوش في المرحلة الرئيسية (Main Phase 1 أو 2) بس!');
  }
  const slot = player.monsterZones[zoneIndex];
  if (!slot || !slot.card) {
    throw new Error('مفيش وحش في الخانة دي');
  }
  if (slot.position === 'face_down_defense') {
    throw new Error('الوحش مقلوب في وضع الدفاع، لازم تقلبه مكشوف الأول!');
  }
  if (slot.hasUsedEffectThisTurn) {
    throw new Error('لقد استخدمت قدرة هذا الوحش في هذا الدور بالفعل! القدرة تعمل مرة واحدة فقط كل دور.');
  }

  const card = slot.card;
  const res = resolveMonsterEffect(state, playerIndex, card, 'ignition', {
    zoneIndex,
    slot,
    ...targetContext,
    destroyMonster: destroyMonsterSlot,
  });

  if (!res || res.success === false) {
    throw new Error(res?.reason || 'القدرة لم تنجح أو ليس لها شروط ملائمة حالياً');
  }

  // Mark once-per-turn as used
  slot.hasUsedEffectThisTurn = true;
  checkWinConditions(state);
  return { state, result: res, card };
}

export function setSpellTrap(state, playerIndex, handIndex, zoneIndex) {
  const player = state.players[playerIndex];
  if (player.spellTrapZones[zoneIndex] !== null) throw new Error('الخانة دي مليانة كارت سحر أو فخ');

  const card = player.hand[handIndex];
  if (card.type !== 'spell' && card.type !== 'trap') throw new Error('الكارت ده مش سحر ولا فخ');

  player.hand.splice(handIndex, 1);

  const slot = {
    card,
    faceUp: false,
    turnSet: state.turnNumber,
  };

  player.spellTrapZones[zoneIndex] = slot;
  state.lastLog.push(`${player.name} حط كارت مقلوب في خانة السحر/الفخاخ ${zoneIndex + 1}.`);

  return state;
}

export function activateSpell(state, playerIndex, handIndex, targetContext = null) {
  const player = state.players[playerIndex];
  const card = player.hand[handIndex];

  if (!card || card.type !== 'spell') throw new Error('الكارت ده مش كارت سحر');

  player.hand.splice(handIndex, 1);
  state.lastLog.push(`تشغيل كارت السحر: ${card.name}!`);

  const effectMeta = resolveSpellEffect(state, playerIndex, card, targetContext);

  if (effectMeta?.type !== 'field_spell' && card.subType !== 'field') {
    player.graveyard.push(card);
  }
  checkWinConditions(state);
  return { state, effectMeta, spellCard: card };
}

export function resolveSpellEffect(state, playerIndex, spell, targetContext = null) {
  return dispatchSpellEffect(state, playerIndex, spell, targetContext, {
    destroyMonsterSlot,
    recalculateAllMonsterStats,
    FIELD_SPELLS,
  });
}

function _legacyResolveSpellEffect(state, playerIndex, spell, targetContext = null) {
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
    const oppIdx = 1 - playerIndex;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot) {
        destroyMonsterSlot(state, oppIdx, i, 'card_effect', card);
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

  // 3. Dark Hole (Destroy all monsters on field)
  if (name.includes('dark hole')) {
    let destroyed = 0;
    const oppIdx = 1 - playerIndex;
    for (const pIdx of [0, 1]) {
      for (let i = 0; i < 5; i++) {
        const slot = state.players[pIdx].monsterZones[i];
        if (slot) {
          destroyMonsterSlot(state, pIdx, i, 'card_effect', card);
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
      targetAffected: { playerIndex: oppIdx, zoneIndex: -1, actionText: 'الثقب الأسود ابتلع الوحوش!', effectType: 'destroy_all' },
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
      throw new Error('نقاط حياتك ما تكفيش تدفع 800 علشان تشغل الدفن المبكر');
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

  // 5. Change of Heart (Take control of opponent's monster)
  if (name.includes('change of heart')) {
    const oppIdx = 1 - playerIndex;
    let targetIdx = targetContext?.targetZoneIndex;
    let target = null;
    if (targetIdx !== undefined && targetIdx !== null && opponent.monsterZones[targetIdx]) {
      target = { slot: opponent.monsterZones[targetIdx], idx: targetIdx };
    } else {
      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }

    if (target) {
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
          targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'تمت السيطرة على الوحش!', effectType: 'control' },
        };
      }
    }
  }

  // 6. Swords of Revealing Light (Flip all opponent face-down monsters face-up & seal attacks)
  if (name.includes('swords') || name.includes('revealing light')) {
    let revealed = 0;
    const oppIdx = 1 - playerIndex;
    for (let i = 0; i < 5; i++) {
      const slot = opponent.monsterZones[i];
      if (slot && slot.position === 'face_down_defense') {
        slot.position = 'face_up_defense';
        revealed++;
        // Trigger flip effect according to official Yu-Gi-Oh! rules
        if (slot.card?.subType === 'effect') {
          resolveMonsterEffect(state, oppIdx, slot.card, 'flip', { sourceCard: card, destroyMonster: destroyMonsterSlot });
        }
      }
    }
    state.lastLog.push(`سيوف النور الكاشف! كشفت وحوش الخصم وشلت قدرتهم على الهجوم.`);
    return {
      type: 'swords',
      title: 'سيوف النور الكاشف (Swords of Revealing Light)',
      desc: `أضاءت سيوف النور الساحة وكشفت ${revealed} وحوش مقلوبة وشلت هجوم الخصم!`,
      revealedCount: revealed,
      targetAffected: { playerIndex: oppIdx, zoneIndex: -1, actionText: 'انكشفت الوحوش وانشلت حركتها!', effectType: 'seal' },
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
    const oppIdx = 1 - playerIndex;
    const oppFaceUp = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');

    if (oppFaceUp.length > 0) {
      oppFaceUp.sort((a, b) => (a.slot.currentAtk || 0) - (b.slot.currentAtk || 0));
      const target = oppFaceUp[0];
      const targetCard = target.slot.card;
      destroyMonsterSlot(state, oppIdx, target.idx, 'card_effect', card);
      state.lastLog.push(`الشق (Fissure)! دمر وحش الخصم ${targetCard.name}.`);
      return {
        type: 'fissure',
        title: 'الشق الأرضي (Fissure)',
        desc: `انشقت الأرض وابتلعت أضعف وحوش الخصم: ${targetCard.name}!`,
        targetCard: targetCard,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'انشقت الأرض وابتلعته!', effectType: 'destroy' },
      };
    }
  }

  // 9. Tribute to The Doomed (Destroy 1 target opponent monster)
  if (name.includes('tribute to the doomed')) {
    const oppIdx = 1 - playerIndex;
    let targetIdx = targetContext?.targetZoneIndex;
    let target = null;
    if (targetIdx !== undefined && targetIdx !== null && opponent.monsterZones[targetIdx]) {
      target = { slot: opponent.monsterZones[targetIdx], idx: targetIdx };
    } else {
      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }

    if (target) {
      const targetCard = target.slot.card;
      destroyMonsterSlot(state, oppIdx, target.idx, 'card_effect', card);
      state.lastLog.push(`قربان للهلاك! دمر وحش الخصم ${targetCard.name}.`);
      return {
        type: 'tribute_doomed',
        title: 'قربان للهلاك (Tribute to The Doomed)',
        desc: `تم القضاء على وحش الخصم: ${targetCard.name}!`,
        targetCard: targetCard,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'تم القضاء عليه بالقربان!', effectType: 'destroy' },
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

  // 12. Mystical Space Typhoon / De-Spell (Destroy 1 opponent Spell/Trap)
  if (name.includes('mystical space typhoon') || name.includes('space typhoon') || name.includes('de-spell')) {
    const oppST = opponent.spellTrapZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null);

    if (oppST.length > 0) {
      const target = oppST[0];
      opponent.graveyard.push(target.slot.card);
      opponent.spellTrapZones[target.idx] = null;
      state.lastLog.push(`إعصار الفضاء الغامض! دمر بطاقة سحر/فخ لـ ${opponent.name}.`);
      return {
        type: 'mst',
        title: 'إعصار الفضاء الغامض (MST)',
        desc: `رياح فضائية عاتية دمرت بطاقة سحر/فخ من ساحة الخصم!`,
      };
    } else if (state.activeFieldSpell && state.activeFieldSpell.playerIndex !== playerIndex) {
      const destroyedField = state.activeFieldSpell.card;
      state.players[state.activeFieldSpell.playerIndex].graveyard.push(destroyedField);
      state.activeFieldSpell = null;
      recalculateAllMonsterStats(state);
      state.lastLog.push(`إعصار الفضاء الغامض! دمر سحر الساحة النشط.`);
      return {
        type: 'mst',
        title: 'إعصار الفضاء الغامض (MST)',
        desc: `دمر إعصار الفضاء سحر الساحة النشط!`,
      };
    }
  }

  // 12b. Graceful Charity (Draw 3 cards, discard 2 cards)
  if (name.includes('graceful charity') || name.includes('charity')) {
    for (let i = 0; i < 3; i++) {
      if (player.deck.length > 0) {
        player.hand.push(player.deck.shift());
      }
    }
    let discardedCount = 0;
    while (player.hand.length > 0 && discardedCount < 2) {
      player.graveyard.push(player.hand.pop());
      discardedCount++;
    }
    state.lastLog.push(`إحسان كريم (Graceful Charity)! سحب ${player.name} 3 بطاقات وتخلص من بطاقتين إلى المقبرة.`);
    checkWinConditions(state);
    return {
      type: 'graceful_charity',
      title: 'إحسان كريم (Graceful Charity)',
      desc: `سحب ${player.name} 3 بطاقات من مجموعته ثم ألقى بطاقتين في المقبرة!`,
      cardsDrawn: 3,
      cardsDiscarded: discardedCount,
    };
  }

  // 12c. Card Destruction (Both players discard hand and draw equal count)
  if (name.includes('card destruction')) {
    const p0Count = player.hand.length;
    const p1Count = opponent.hand.length;

    while (player.hand.length > 0) player.graveyard.push(player.hand.pop());
    while (opponent.hand.length > 0) opponent.graveyard.push(opponent.hand.pop());

    for (let i = 0; i < p0Count; i++) {
      if (player.deck.length > 0) player.hand.push(player.deck.shift());
    }
    for (let i = 0; i < p1Count; i++) {
      if (opponent.deck.length > 0) opponent.hand.push(opponent.deck.shift());
    }

    state.lastLog.push(`تدمير البطاقات (Card Destruction)! تخلص كلا اللاعبين من أوراق يدهما وسحبا أوراقاً بديلة بنفس العدد.`);
    checkWinConditions(state);
    return {
      type: 'card_destruction',
      title: 'تدمير البطاقات (Card Destruction)',
      desc: `رمى كلا اللاعبين أوراق أيديهم في المقبرة وسحب كل منهما نفس عدد البطاقات المفقودة!`,
    };
  }

  // 12d. Snatch Steal (Take control of 1 opponent face-up monster)
  if (name.includes('snatch steal')) {
    const oppIdx = 1 - playerIndex;
    let targetIdx = targetContext?.targetZoneIndex;
    let target = null;
    if (targetIdx !== undefined && targetIdx !== null && opponent.monsterZones[targetIdx] && opponent.monsterZones[targetIdx].position !== 'face_down_defense') {
      target = { slot: opponent.monsterZones[targetIdx], idx: targetIdx };
    } else {
      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }

    if (target) {
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        player.monsterZones[emptyZone] = target.slot;
        opponent.monsterZones[target.idx] = null;
        state.lastLog.push(`سرقة خاطفة (Snatch Steal)! تمت السيطرة على ${target.slot.card.name}.`);
        return {
          type: 'snatch_steal',
          title: 'سرقة خاطفة (Snatch Steal)',
          desc: `تمت السيطرة على وحش الخصم ${target.slot.card.name} ونقله إلى ساحتك!`,
          targetCard: target.slot.card,
          targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'تمت السيطرة بالسرقة الخاطفة!', effectType: 'control' },
        };
      }
    }
  }

  // 12e. Scapegoat (Special summon up to 4 Sheep Tokens in defense)
  if (name.includes('scapegoat')) {
    let tokensSummoned = 0;
    for (let z = 0; z < 5; z++) {
      if (player.monsterZones[z] === null && tokensSummoned < 4) {
        player.monsterZones[z] = {
          card: {
            id: 999901 + z,
            cardCode: 9999,
            name: 'Sheep Token',
            arabicName: 'رمز الخروف (Sheep Token)',
            type: 'monster',
            subType: 'token',
            race: 'Beast',
            attribute: 'EARTH',
            level: 1,
            atk: 0,
            def: 0,
            image: '4818_1.webp',
            miniImage: '4818_1.webp',
            description: 'Sheep Token created by Scapegoat. Cannot be tributed for a Tribute Summon.',
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
    state.lastLog.push(`كبش الفداء (Scapegoat)! استدعى ${player.name} ${tokensSummoned} من رموز الخراف في وضع الدفاع لحماية الساحة!`);
    return {
      type: 'scapegoat',
      title: 'كبش الفداء (Scapegoat)',
      desc: `ظهرت ${tokensSummoned} رموز خراف لحماية دفاعات ${player.name}!`,
      tokensCount: tokensSummoned,
    };
  }

  // 12f. Riryoku (Reduce 1 monster's ATK by half, add to another monster)
  if (name.includes('riryoku')) {
    const oppIdx = 1 - playerIndex;
    let victimIdx = targetContext?.opponentTargetIndex;
    let beneficiaryIdx = targetContext?.allyTargetIndex;

    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');

    const myMonsters = player.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');

    if (oppMonsters.length > 0 && myMonsters.length > 0) {
      let victim = null;
      let beneficiary = null;

      if (victimIdx !== undefined && victimIdx !== null && opponent.monsterZones[victimIdx]) {
        victim = { slot: opponent.monsterZones[victimIdx], idx: victimIdx };
      } else {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        victim = oppMonsters[0];
      }

      if (beneficiaryIdx !== undefined && beneficiaryIdx !== null && player.monsterZones[beneficiaryIdx]) {
        beneficiary = { slot: player.monsterZones[beneficiaryIdx], idx: beneficiaryIdx };
      } else {
        myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        beneficiary = myMonsters[0];
      }

      const halfAtk = Math.floor((victim.slot.currentAtk || victim.slot.card.atk || 0) / 2);
      victim.slot.currentAtk = Math.max(0, victim.slot.currentAtk - halfAtk);
      beneficiary.slot.currentAtk = (beneficiary.slot.currentAtk || beneficiary.slot.card.atk) + halfAtk;

      state.lastLog.push(`ريوريوكو (Riryoku)! سلب ${halfAtk} هجوم من ${victim.slot.card.name} وأضافه إلى ${beneficiary.slot.card.name} (هجومه الآن: ${beneficiary.slot.currentAtk})!`);
      return {
        type: 'riryoku',
        title: 'ريوريوكو (Riryoku)',
        desc: `انتقلت ${halfAtk} نقطة هجوم من ${victim.slot.card.name} إلى ${beneficiary.slot.card.name}!`,
        drainedAtk: halfAtk,
        victimCard: victim.slot.card,
        boostedCard: beneficiary.slot.card,
        targetAffected: { playerIndex: oppIdx, zoneIndex: victim.idx, actionText: `سُلب منه -${halfAtk} هجوم!`, effectType: 'debuff' },
      };
    }
  }

  // 12g. Axe of Despair (+1000 ATK)
  if (name.includes('axe of despair') || (name.includes('axe') && name.includes('despair'))) {
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && player.monsterZones[chosenIdx]) {
      target = { slot: player.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const myMonsters = player.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (myMonsters.length > 0) {
        myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = myMonsters[0];
      }
    }

    if (target) {
      target.slot.currentAtk = (target.slot.currentAtk || target.slot.card.atk) + 1000;
      state.lastLog.push(`فأس اليأس (Axe of Despair)! زاد هجوم ${target.slot.card.name} بمقدار +1000 نقطة (أصبح ${target.slot.currentAtk})!`);
      return {
        type: 'buff_atk',
        title: 'فأس اليأس (Axe of Despair)',
        desc: `سلاح فأس اليأس الأسطوري منح ${target.slot.card.name} زيادة هائلة +1000 نقطة هجوم!`,
        boostAtk: 1000,
        targetCard: target.slot.card,
      };
    }
  }

  // 12h. Mage Power (+500 ATK/DEF per Spell/Trap on controller's field)
  if (name.includes('mage power')) {
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && player.monsterZones[chosenIdx]) {
      target = { slot: player.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const myMonsters = player.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (myMonsters.length > 0) {
        myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = myMonsters[0];
      }
    }

    if (target) {
      const stCount = player.spellTrapZones.filter(z => z !== null).length + (state.activeFieldSpell && state.activeFieldSpell.playerIndex === playerIndex ? 1 : 0);
      const boost = Math.max(500, stCount * 500);
      target.slot.currentAtk = (target.slot.currentAtk || target.slot.card.atk) + boost;
      target.slot.currentDef = (target.slot.currentDef || target.slot.card.def) + boost;
      state.lastLog.push(`قوة الساحر (Mage Power)! زادت قوى ${target.slot.card.name} بمقدار +${boost} هجوم ودفاع (${stCount} بطاقة سحر/فخ × 500)!`);
      return {
        type: 'mage_power',
        title: 'قوة الساحر (Mage Power)',
        desc: `طاقة السحر والفخاخ زادت هجوم ودفاع ${target.slot.card.name} بـ +${boost} نقطة!`,
        boost,
        targetCard: target.slot.card,
      };
    }
  }

  // 12i. United We Stand (+800 ATK/DEF per face-up monster controlled)
  if (name.includes('united we stand')) {
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && player.monsterZones[chosenIdx]) {
      target = { slot: player.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const myMonsters = player.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (myMonsters.length > 0) {
        myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = myMonsters[0];
      }
    }

    if (target) {
      const faceUpCount = player.monsterZones.filter(z => z !== null && z.position !== 'face_down_defense').length;
      const boost = Math.max(800, faceUpCount * 800);
      target.slot.currentAtk = (target.slot.currentAtk || target.slot.card.atk) + boost;
      target.slot.currentDef = (target.slot.currentDef || target.slot.card.def) + boost;
      state.lastLog.push(`في الاتحاد قوة (United We Stand)! زادت قوى ${target.slot.card.name} بمقدار +${boost} هجوم ودفاع (${faceUpCount} وحش × 800)!`);
      return {
        type: 'united_we_stand',
        title: 'في الاتحاد قوة (United We Stand)',
        desc: `روح الوحدة عززت هجوم ودفاع ${target.slot.card.name} بـ +${boost} نقطة!`,
        boost,
        targetCard: target.slot.card,
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
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && player.monsterZones[chosenIdx]) {
      target = { slot: player.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const myMonsters = player.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);
      if (myMonsters.length > 0) {
        myMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = myMonsters[0];
      }
    }

    if (target) {
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

  if (isTrapNegated(state)) return;

  for (let i = 0; i < 5; i++) {
    const slot = opponent.spellTrapZones[i];
    if (slot && !slot.faceUp && slot.card.type === 'trap') {
      const trapName = slot.card.name.toLowerCase();

      // 1. Bottomless Trap Hole: Destroy and banish summoned monster with ATK >= 1500
      if (trapName.includes('bottomless') && summonedMonster.atk >= 1500) {
        slot.faceUp = true;
        opponent.spellTrapZones[i] = null;
        opponent.graveyard.push(slot.card);

        const zoneIdx = state.players[summoningPlayerIndex].monsterZones.indexOf(summonedSlot);
        if (zoneIdx !== -1) {
          state.players[summoningPlayerIndex].monsterZones[zoneIdx] = null;
          if (!state.players[summoningPlayerIndex].banished) state.players[summoningPlayerIndex].banished = [];
          state.players[summoningPlayerIndex].banished.push(summonedMonster);
          state.lastLog.push(`تفعيل فخ حفرة الهاوية (Bottomless Trap Hole)! سقط ${summonedMonster.name} وتم تدميره ونفيه خارج اللعبة!`);
        }
        if (typeof state.onSpellTriggered === 'function') {
          state.onSpellTriggered({
            playerIndex: 1 - summoningPlayerIndex,
            spellCard: slot.card,
            effectMeta: {
              type: 'bottomless',
              effectCategory: 'TRAP_AMBUSH',
              title: slot.card.name,
              desc: `سقط ${summonedMonster.name} في حفرة الهاوية وتم نفيه خارج أبعاد المعركة!`,
              targetCard: summonedMonster,
            },
          });
        }
        break;
      }

      // 2. Trap Hole: Destroy summoned monster with ATK >= 1000
      if (trapName.includes('trap hole') && summonedMonster.atk >= 1000) {
        slot.faceUp = true;
        opponent.spellTrapZones[i] = null;
        opponent.graveyard.push(slot.card);

        const zoneIdx = state.players[summoningPlayerIndex].monsterZones.indexOf(summonedSlot);
        if (zoneIdx !== -1) {
          destroyMonsterSlot(state, summoningPlayerIndex, zoneIdx, 'trap_effect', slot.card);
          state.lastLog.push(`تفعيل فخ الحفرة (Trap Hole)! سقط ${summonedMonster.name} في الهاوية ودُمر.`);
        }
        if (typeof state.onSpellTriggered === 'function') {
          state.onSpellTriggered({
            playerIndex: 1 - summoningPlayerIndex,
            spellCard: slot.card,
            effectMeta: {
              type: 'trap_hole',
              effectCategory: 'TRAP_AMBUSH',
              title: slot.card.name,
              desc: `سقط ${summonedMonster.name} في حفرة الفخ ودُمر بالكامل!`,
              targetCard: summonedMonster,
            },
          });
        }
        break;
      }

      // 3. Torrential Tribute: When monster is summoned, destroy ALL monsters on field!
      if (trapName.includes('torrential tribute')) {
        slot.faceUp = true;
        opponent.spellTrapZones[i] = null;
        opponent.graveyard.push(slot.card);

        let destroyedCount = 0;
        for (const pIdx of [0, 1]) {
          for (let m = 0; m < 5; m++) {
            if (state.players[pIdx].monsterZones[m]) {
              destroyMonsterSlot(state, pIdx, m, 'trap_effect', slot.card);
              destroyedCount++;
            }
          }
        }
        state.lastLog.push(`تفعيل فخ الجزية الجارفة (Torrential Tribute)! طوفان هائل دمر جميع وحوش الساحة (${destroyedCount} وحش)!`);
        if (typeof state.onSpellTriggered === 'function') {
          state.onSpellTriggered({
            playerIndex: 1 - summoningPlayerIndex,
            spellCard: slot.card,
            effectMeta: {
              type: 'torrential_tribute',
              effectCategory: 'TRAP_AMBUSH',
              title: slot.card.name,
              desc: `طوفان هائل دمر جميع الوحوش في الساحة (${destroyedCount} وحش)!`,
            },
          });
        }
        break;
      }
    }
  }
}

export function activateSetCard(state, playerIndex, zoneIndex, targetContext = null) {
  const player = state.players[playerIndex];
  const slot = player.spellTrapZones[zoneIndex];
  if (!slot) throw new Error('مافيش كارت في الخانة دي');

  if (slot.card.type === 'trap') {
    if (slot.turnSet === state.turnNumber) {
      throw new Error('ماتقدرش تشغل كارت الفخ في نفس الدور اللي حطيته مقلوب فيه');
    }
    if (isTrapNegated(state)) {
      throw new Error('تأثير جينزو (Jinzo) موقف ومعطل كل الفخاخ في الملعب!');
    }
  }

  const card = slot.card;
  player.spellTrapZones[zoneIndex] = null;
  state.lastLog.push(`تشغيل الكارت المقلوب: ${card.name}!`);

  let effectMeta = null;
  if (card.type === 'spell') {
    effectMeta = resolveSpellEffect(state, playerIndex, card, targetContext);
    if (effectMeta?.type !== 'field_spell' && card.subType !== 'field') {
      player.graveyard.push(card);
    }
  } else if (card.type === 'trap') {
    effectMeta = resolveTrapEffect(state, playerIndex, card, targetContext);
    if (!effectMeta?.stayOnField && card.race !== 'continuous') {
      player.graveyard.push(card);
    } else {
      player.spellTrapZones[zoneIndex] = { card, faceUp: true, turnSet: slot.turnSet };
    }
  }

  checkWinConditions(state);
  return { state, effectMeta, activatedCard: card };
}

export function resolveTrapEffect(state, playerIndex, trap, targetContext = null) {
  return dispatchTrapEffect(state, playerIndex, trap, targetContext, {
    destroyMonsterSlot,
    recalculateAllMonsterStats,
  });
}
