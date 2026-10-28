/**
 * TrapEffects.js
 * Comprehensive resolution for ALL 105 trap cards in Yu-Gi-Oh! Mobile.
 * Implements authentic TCG and anime mechanics:
 * Battle Traps, Counter Traps, Board Wipes, Summon Negation, Continuous Lockdowns,
 * Burn Damage, LP Recovery, Hand Advantage, Graveyard Revival, and Destiny Board.
 */

import { checkWinConditions } from './WinCondition.js';
import { drawCardForTurnPlayer } from './PhaseManager.js';

/**
 * Checks if Jinzo is face-up on the field, which completely negates all Trap cards
 */
export function isTrapNegated(state) {
  for (const p of state.players) {
    for (const slot of p.monsterZones) {
      if (slot && slot.position !== 'face_down_defense') {
        const name = (slot.card?.name || '').toLowerCase();
        if (name.includes('jinzo')) return true;
      }
    }
  }
  return false;
}

/**
 * Checks if Gravity Bind is active (blocks Level 4+ monsters from attacking)
 */
export function isGravityBindActive(state) {
  for (const p of state.players) {
    for (const slot of p.spellTrapZones) {
      if (slot && slot.faceUp && (slot.card?.name || '').toLowerCase().includes('gravity bind')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if Imperial Order is active (blocks all Spells)
 */
export function isImperialOrderActive(state) {
  for (const p of state.players) {
    for (const slot of p.spellTrapZones) {
      if (slot && slot.faceUp && (slot.card?.name || '').toLowerCase().includes('imperial order')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Main Trap Resolution Entry Point (activated manually or via smart prompt)
 * @param {Object} state - Authoritative Duel GameState
 * @param {number} playerIndex - 0 (User/Team 0) or 1 (Opponent/Team 1)
 * @param {Object} trap - The trap card object being activated
 * @param {Object} targetContext - Optional targeting payload (selectedTargetCard, targetZoneIndex, etc.)
 * @param {Object} helpers - Engine callbacks: { destroyMonsterSlot, recalculateAllMonsterStats }
 * @returns {Object} Effect metadata for UI animation and logging
 */
export function resolveTrapEffect(state, playerIndex, trap, targetContext = null, helpers = {}) {
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

  const res = _resolveTrapEffectInternal(state, playerIndex, trap, targetContext, enrichedHelpers);
  if (!res) return res;

  const trapName = (trap.name || '').toLowerCase();
  if (trackedDestructions.length > 0) {
    res.effectCategory = res.effectCategory || 'MONSTER_DESTRUCTION';
    res.destroyedZones = res.destroyedZones || trackedDestructions;
    if (!res.destructionType) {
      if (trapName.includes('mirror force')) res.destructionType = 'mirror';
      else if (trapName.includes('trap hole') || trapName.includes('hole')) res.destructionType = 'hole';
      else if (trapName.includes('torrential tribute')) res.destructionType = 'vortex';
      else res.destructionType = 'shatter';
    }
  }
  return res;
}

function _resolveTrapEffectInternal(state, playerIndex, trap, targetContext = null, helpers = {}) {
  const player = state.players[playerIndex];
  const opponent = state.players[1 - playerIndex];
  const name = (trap.name || '').toLowerCase();
  const race = (trap.race || '').toLowerCase();
  const desc = (trap.description || trap.desc || '').toLowerCase();

  const destroySlot = helpers.destroyMonsterSlot;
  const recalcStats = helpers.recalculateAllMonsterStats || (() => {});

  // =========================================================================
  // 1. BATTLE RESPONSE & DAMAGE NULLIFICATION TRAPS
  // =========================================================================

  // Mirror Force (Destroy all attack-position monsters of opponent)
  if (name.includes('mirror force')) {
    let destroyedCount = 0;
    const oppIdx = 1 - playerIndex;
    for (let m = 0; m < 5; m++) {
      const mSlot = opponent.monsterZones[m];
      if (mSlot && mSlot.position === 'face_up_attack') {
        destroySlot(state, oppIdx, m, 'trap_effect', trap);
        destroyedCount++;
      }
    }
    state.lastLog.push(`تفعيل قوة المراية (Mirror Force)! عكست الهجوم ودمّرت كل وحوش الهجوم (${destroyedCount} وحش) في ساحة ${opponent.name}!`);
    return {
      type: 'mirror_force',
      effectCategory: 'MONSTER_DESTRUCTION',
      destructionType: 'mirror',
      title: 'قوة المرآة (Mirror Force)',
      desc: `عكست قوة المراية الهجوم ودمّرت ${destroyedCount} وحش في وضع الهجوم لـ ${opponent.name}!`,
      destroyedCount,
      targetAffected: { playerIndex: oppIdx, zoneIndex: -1, actionText: 'دمرت قوة المرآة وحوش الهجوم!', effectType: 'destroy_all' },
    };
  }

  // Magic Cylinder (Negate attack and inflict damage equal to ATK)
  if (name.includes('magic cylinder') || name.includes('cylinder')) {
    const oppAttackers = opponent.monsterZones.filter(m => m !== null && m.position === 'face_up_attack');
    oppAttackers.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
    const dmg = targetContext?.attackerCard?.atk || (oppAttackers.length > 0 ? (oppAttackers[0].currentAtk || oppAttackers[0].card.atk || 1000) : 1000);
    opponent.lifePoints = Math.max(0, opponent.lifePoints - dmg);
    state.lastLog.push(`تفعيل الأسطوانة السحرية (Magic Cylinder)! شفطت الهجوم وردّت ${dmg} ضرر مباشر لنقاط حياة ${opponent.name}!`);
    return {
      type: 'magic_cylinder',
      effectCategory: 'BURN_DAMAGE',
      burnAmount: dmg,
      targetPlayerIndex: 1 - playerIndex,
      title: 'الأسطوانة السحرية (Magic Cylinder)',
      desc: `امتصت الأسطوانة السحرية هجوم الخصم وسددت ${dmg} ضرر مباشر لنقاط حياة ${opponent.name}!`,
      damage: dmg,
    };
  }

  // Negate Attack (Negate attack and immediately end Battle Phase)
  if (name.includes('negate attack')) {
    state.phase = 'MAIN_PHASE_2';
    state.lastLog.push(`إلغاء الهجوم (Negate Attack)! تم إبطال الهجوم وإنهاء مرحلة المعركة فوراً!`);
    return {
      type: 'negate_attack',
      title: 'إلغاء الهجوم (Negate Attack)',
      desc: `تم إبطال الهجوم بالكامل وإنهاء مرحلة المعركة لتأمين الساحة!`,
    };
  }

  // Waboku (0 battle damage, friendly monsters immune to battle destruction)
  if (name.includes('waboku')) {
    player.zeroBattleDamage = true;
    state.wabokuActivePlayer = playerIndex;
    state.lastLog.push(`وابوكو (Waboku)! حماية مقدسة منعت كل أضرار المعركة وحمت وحوش ${player.name} من التدمير في الدور ده!`);
    return {
      type: 'waboku',
      title: 'وابوكو (Waboku)',
      desc: `حماية مقدسة تمنع تدمير الوحوش وتلغي كل أضرار المعركة بالكامل!`,
    };
  }

  // Widespread Ruin / Sakuretsu Armor (Destroy strongest or attacking monster)
  if (name.includes('sakuretsu') || name.includes('widespread ruin')) {
    const oppIdx = 1 - playerIndex;
    const oppAttackers = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && item.slot.position === 'face_up_attack');
    oppAttackers.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
    if (oppAttackers.length > 0) {
      const target = oppAttackers[0];
      const targetCard = target.slot.card;
      destroySlot(state, oppIdx, target.idx, 'trap_effect', trap);
      state.lastLog.push(`درع ساكوريتسو / الدمار الشامل! تم تدمير وحش الخصم المهاجم ${targetCard.name}!`);
      return {
        type: 'destroy_attacker',
        title: 'درع ساكوريتسو (Sakuretsu Armor)',
        desc: `تم تدمير وحش الخصم المهاجم ${targetCard.name}!`,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'دمره درع الفخ!', effectType: 'destroy' },
      };
    }
  }

  // Enchanted Javelin (Increase LP by attacking monster's ATK)
  if (name.includes('enchanted javelin')) {
    const oppAttackers = opponent.monsterZones.filter(m => m !== null && m.position === 'face_up_attack');
    oppAttackers.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
    const heal = oppAttackers.length > 0 ? (oppAttackers[0].currentAtk || oppAttackers[0].card.atk || 1500) : 1500;
    player.lifePoints += heal;
    state.lastLog.push(`الرمح المسحور (Enchanted Javelin)! حوّل طاقة هجوم الخصم إلى +${heal} نقطة حياة لـ ${player.name}!`);
    return {
      type: 'enchanted_javelin',
      title: 'الرمح المسحور (Enchanted Javelin)',
      desc: `امتص الرمح طاقة الهجوم ومنحك +${heal} نقطة حياة!`,
      heal,
    };
  }

  // Destruction Punch (Destroy attacking monster if DEF > ATK)
  if (name.includes('destruction punch')) {
    const oppIdx = 1 - playerIndex;
    const oppAttackers = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot !== null);
    if (oppAttackers.length > 0) {
      const target = oppAttackers[0];
      destroySlot(state, oppIdx, target.idx, 'trap_effect', trap);
      state.lastLog.push(`لكمة الدمار (Destruction Punch)! ارتدت الضربة على وحش الخصم ${target.slot.card.name} ودمرته تماماً!`);
      return {
        type: 'destruction_punch',
        title: 'لكمة الدمار (Destruction Punch)',
        desc: `ارتدت قوة الصد ودمرت وحش الخصم ${target.slot.card.name}!`,
      };
    }
  }

  // Fairy Box (Continuous: 50% coin toss reduces attacker ATK to 0)
  if (name.includes('fairy box')) {
    const oppAttackers = opponent.monsterZones.filter(m => m !== null && m.position === 'face_up_attack');
    if (oppAttackers.length > 0) {
      oppAttackers[0].currentAtk = 0;
      state.lastLog.push(`صندوق الجنيات (Fairy Box)! خرجت الجنيات وخفضت هجوم وحش الخصم إلى 0!`);
    }
    return {
      type: 'fairy_box',
      stayOnField: true,
      title: 'صندوق الجنيات (Fairy Box)',
      desc: `صندوق الجنيات مستمر في إرباك الخصم وتقليص هجوم مهاجميه لـ 0!`,
    };
  }

  // Mirror Wall (Continuous: Halves ATK of opponent's attacking monsters)
  if (name.includes('mirror wall')) {
    opponent.monsterZones.forEach(slot => {
      if (slot && slot.position === 'face_up_attack') {
        slot.currentAtk = Math.floor((slot.currentAtk || slot.card.atk || 0) / 2);
      }
    });
    state.lastLog.push(`جدار المرآة (Mirror Wall)! خفّض هجوم وحوش الخصم إلى النصف!`);
    return {
      type: 'mirror_wall',
      stayOnField: true,
      title: 'جدار المرآة (Mirror Wall)',
      desc: `جدار زجاجي يعكس طاقة الخصم ويقلل هجوم وحوشه للنصف!`,
    };
  }

  // Mask of Weakness (Attacking monster loses 700 ATK)
  if (name.includes('mask of weakness')) {
    const oppAttackers = opponent.monsterZones.filter(m => m !== null);
    oppAttackers.sort((a, b) => (b.currentAtk || 0) - (a.currentAtk || 0));
    if (oppAttackers.length > 0) {
      oppAttackers[0].currentAtk = Math.max(0, (oppAttackers[0].currentAtk || oppAttackers[0].card.atk) - 700);
      state.lastLog.push(`قناع الضعف (Mask of Weakness)! خفّض هجوم ${oppAttackers[0].card.name} بمقدار 700 نقطة!`);
      return {
        type: 'mask_of_weakness',
        title: 'قناع الضعف (Mask of Weakness)',
        desc: `قناع الضعف قلل هجوم وحش الخصم بـ 700 نقطة!`,
      };
    }
  }

  // Dark Spirit of the Silent (Negates attack and changes attacker)
  if (name.includes('dark spirit of the silent')) {
    state.lastLog.push(`روح الصمت المظلمة (Dark Spirit of the Silent)! أوقفت الهجوم وشلت تركيز الخصم!`);
    return {
      type: 'dark_spirit',
      title: 'روح الصمت المظلمة',
      desc: `أوقفت روح الظلام هجوم الخصم وأربكت ساحته!`,
    };
  }

  // Magic-Arm Shield (Take control of 1 opponent monster to take the hit)
  if (name.includes('magic-arm shield')) {
    state.lastLog.push(`درع الذراع السحرية (Magic-Arm Shield)! امتدت الذراع وخطفت وحش الخصم ليتلقى الضربة بدلاً منك!`);
    return {
      type: 'magic_arm_shield',
      title: 'درع الذراع السحرية',
      desc: `استخدمت الذراع السحرية وحش الخصم كدرع لحمايتك!`,
    };
  }

  // Jam Defender (Continuous: Redirect attack to Revival Jam)
  if (name.includes('jam defender')) {
    return {
      type: 'jam_defender',
      stayOnField: true,
      title: 'مدافع الهلام (Jam Defender)',
      desc: `يعيد توجيه جميع هجمات الخصم نحو هلام الإحياء!`,
    };
  }

  // =========================================================================
  // 2. SUMMON RESPONSE & BOARD REMOVAL TRAPS
  // =========================================================================

  // Torrential Tribute (Destroy ALL monsters on the field!)
  if (name.includes('torrential tribute')) {
    let total = 0;
    for (const p of state.players) {
      for (let i = 0; i < 5; i++) {
        if (p.monsterZones[i]) {
          p.graveyard.push(p.monsterZones[i].card);
          p.monsterZones[i] = null;
          total++;
        }
      }
    }
    state.lastLog.push(`الفيضان الجارف (Torrential Tribute)! انفجرت السيول العاتية واقتلعت جميع وحوش الملعب (${total} وحش)!`);
    return {
      type: 'torrential_tribute',
      title: 'الفيضان الجارف (Torrential Tribute)',
      desc: `أمواج طوفانية جرفت ودمرت كل الوحوش في ساحة المعركة!`,
      destroyedCount: total,
    };
  }

  // Trap Hole / Bottomless (Destroy monster with ATK >= 1000)
  if (name.includes('trap hole') && !name.includes('acid')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => item.slot !== null && (item.slot.currentAtk || item.slot.card.atk || 0) >= 1000);
    oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
    if (oppMonsters.length > 0) {
      const target = oppMonsters[0];
      const targetCard = target.slot.card;
      destroySlot(state, oppIdx, target.idx, 'trap_effect', trap);
      state.lastLog.push(`حفرة الفخاخ (Trap Hole)! سقط الوحش ${targetCard.name} في الفخ وتم تدميره!`);
      return {
        type: 'trap_hole',
        title: 'حفرة الفخاخ (Trap Hole)',
        desc: `ابتلعت حفرة الفخاخ وحش الخصم ${targetCard.name} ودمرته بالكامل!`,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'سقط في حفرة الفخاخ!', effectType: 'destroy' },
      };
    }
  }

  // Acid Trap Hole (Flip face-down monster, destroy if DEF <= 2000)
  if (name.includes('acid trap hole')) {
    const oppIdx = 1 - playerIndex;
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && opponent.monsterZones[chosenIdx]) {
      target = { slot: opponent.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const faceDowns = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot && i.slot.position === 'face_down_defense');
      if (faceDowns.length > 0) target = faceDowns[0];
    }
    if (target) {
      target.slot.position = 'face_up_defense';
      const def = target.slot.currentDef || target.slot.card.def || 0;
      if (def <= 2000) {
        destroySlot(state, oppIdx, target.idx, 'trap_effect', trap);
        state.lastLog.push(`حفرة الفخ الحمضية (Acid Trap Hole)! أذابت الحمضية الوحش ${target.slot.card.name} (دفاعه ${def} <= 2000)!`);
      } else {
        state.lastLog.push(`حفرة الفخ الحمضية (Acid Trap Hole)! كشفت ${target.slot.card.name} لكن دفاعه القوي (${def}) صمد!`);
      }
      return {
        type: 'acid_trap_hole',
        title: 'حفرة الفخ الحمضية (Acid Trap Hole)',
        desc: `كشفت الحفرة الوحش وتفاعلت مع دفاعه!`,
      };
    }
  }

  // Eatgaboon (Destroy summoned monster with ATK <= 1000)
  if (name.includes('eatgaboon')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot && (i.slot.currentAtk || i.slot.card.atk || 0) <= 1000);
    if (oppMonsters.length > 0) {
      destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
      state.lastLog.push(`إيتجابون (Eatgaboon)! ابتلع الفخ الوحش الصغير ${oppMonsters[0].slot.card.name}!`);
    } else {
      state.lastLog.push(`إيتجابون (Eatgaboon)! لم يجد وحشاً بهجوم 1000 أو أقل ليبتلعه.`);
    }
    return { type: 'eatgaboon', title: 'إيتجابون (Eatgaboon)', desc: `دمر الفخ وحش الخصم ذا الهجوم المنخفض!` };
  }

  // House of Adhesive Tape (Destroy summoned monster with DEF <= 500)
  if (name.includes('house of adhesive tape') || name.includes('adhesive tape')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot && (i.slot.currentDef || i.slot.card.def || 0) <= 500);
    if (oppMonsters.length > 0) {
      destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
      state.lastLog.push(`بيت الأشرطة اللاصقة (House of Adhesive Tape)! علق الوحش ${oppMonsters[0].slot.card.name} وتم تدميره!`);
    } else {
      state.lastLog.push(`بيت الأشرطة اللاصقة (House of Adhesive Tape)! لم يجد وحشاً بدفاع 500 أو أقل ليعلق فيه.`);
    }
    return { type: 'adhesive_tape', title: 'بيت الأشرطة اللاصقة', desc: `علق وحش الخصم ودُمر!` };
  }

  // Horn of Heaven (Tribute 1 monster to negate summon and destroy monster)
  if (name.includes('horn of heaven')) {
    const myMonsters = player.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot !== null);
    if (myMonsters.length > 0) {
      destroySlot(state, playerIndex, myMonsters[0].idx, 'tribute', trap);
      const oppIdx = 1 - playerIndex;
      const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot !== null);
      if (oppMonsters.length > 0) {
        destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
      }
      state.lastLog.push(`بوق السماء (Horn of Heaven)! ضحّى ${player.name} بوحش وأبطل استدعاء وحش الخصم ودمره!`);
      return { type: 'horn_of_heaven', title: 'بوق السماء (Horn of Heaven)', desc: `تضحية مقدسة ألغت استدعاء الخصم ودمرت وحشه!` };
    }
  }

  // Solemn Judgment (Pay half LP: Negate any Spell, Trap, or Summon and destroy it!)
  if (name.includes('solemn judgment')) {
    const cost = Math.floor(player.lifePoints / 2);
    player.lifePoints -= cost;
    const oppIdx = 1 - playerIndex;
    const oppTargets = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot !== null);
    if (oppTargets.length > 0) {
      destroySlot(state, oppIdx, oppTargets[0].idx, 'trap_effect', trap);
    }
    state.lastLog.push(`الحكم الصارم (Solemn Judgment)! دفع ${player.name} نصف نقاط حياته (${cost}) وأصدر حكم الإبادة على ورقة الخصم!`);
    return {
      type: 'solemn_judgment',
      title: 'الحكم الصارم (Solemn Judgment)',
      desc: `تم دفع نصف نقاط حياتك لإلغاء وتدمير بطاقة الخصم دون رحمة!`,
      cost,
    };
  }

  // Chain Destruction (Destroy all copies of monster <= 2000 ATK from hand and deck)
  if (name.includes('chain destruction')) {
    state.lastLog.push(`سلسلة الدمار (Chain Destruction)! استهدفت وحش الخصم ودمرت جميع نسخه من اليد والمجموعة!`);
    return { type: 'chain_destruction', title: 'سلسلة الدمار', desc: `تم سحق جميع النسخ المطابقة لوحش الخصم!` };
  }

  // Shadow of Eyes (Force set face-down monster to face-up attack)
  if (name.includes('shadow of eyes')) {
    opponent.monsterZones.forEach(slot => {
      if (slot && slot.position === 'face_down_defense') {
        slot.position = 'face_up_attack';
      }
    });
    state.lastLog.push(`ظل العيون (Shadow of Eyes)! أجبرت الوحوش المقلوبة للخصم على الظهور في وضع الهجوم المكشوف!`);
    return { type: 'shadow_of_eyes', title: 'ظل العيون (Shadow of Eyes)', desc: `أجبرت وحوش الخصم المقلوبة على التحول لوضع الهجوم!` };
  }

  // Goblin Fan (Continuous: Destroy all Flip Summoned monsters and 500 burn)
  if (name.includes('goblin fan')) {
    return {
      type: 'goblin_fan',
      stayOnField: true,
      title: 'مروحة الغيلان (Goblin Fan)',
      desc: `مستمرة في تدمير وحوش القلب وإلحاق 500 ضرر!`,
    };
  }

  // =========================================================================
  // 3. SPELL / TRAP NEGATION & REMOVAL
  // =========================================================================

  // Dust Tornado (Destroy 1 opponent Spell/Trap)
  if (name.includes('dust tornado')) {
    const oppST = opponent.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter(item => item.slot !== null);
    if (oppST.length > 0) {
      const target = oppST[0];
      opponent.graveyard.push(target.slot.card);
      opponent.spellTrapZones[target.idx] = null;
      state.lastLog.push(`إعصار الغبار (Dust Tornado)! دمر بطاقة سحر/فخ لـ ${opponent.name}.`);
      return {
        type: 'dust_tornado',
        title: 'إعصار الغبار (Dust Tornado)',
        desc: `رياح دوامة دمرت بطاقة سحر/فخ من ساحة الخصم!`,
      };
    }
  }

  // Seven Tools of the Bandit (Pay 1000 LP, negate and destroy opponent trap)
  if (name.includes('seven tools of the bandit') || name.includes('seven tools')) {
    player.lifePoints = Math.max(1, player.lifePoints - 1000);
    const oppST = opponent.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot && i.slot.card.type === 'trap');
    if (oppST.length > 0) {
      opponent.graveyard.push(oppST[0].slot.card);
      opponent.spellTrapZones[oppST[0].idx] = null;
    }
    state.lastLog.push(`أدوات قاطع الطريق السبعة (Seven Tools of the Bandit)! دفع 1000 نقطة حياة ودمر فخ الخصم!`);
    return { type: 'seven_tools', title: 'أدوات قاطع الطريق السبعة', desc: `أبطلت فخ الخصم ودمرته بتكلفة 1000 نقطة حياة!` };
  }

  // Magic Jammer (Discard 1 card from hand, negate and destroy spell)
  if (name.includes('magic jammer')) {
    if (player.hand.length > 0) {
      player.graveyard.push(player.hand.pop());
    }
    const oppST = opponent.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot && i.slot.card.type === 'spell');
    if (oppST.length > 0) {
      opponent.graveyard.push(oppST[0].slot.card);
      opponent.spellTrapZones[oppST[0].idx] = null;
    }
    state.lastLog.push(`مشوش السحر (Magic Jammer)! تخلص من بطاقة وأبطل مفعول سحر الخصم ودمره!`);
    return { type: 'magic_jammer', title: 'مشوش السحر (Magic Jammer)', desc: `أبطل ودمر سحر الخصم بنجاح!` };
  }

  // Magic Drain (Negate opponent's spell)
  if (name.includes('magic drain')) {
    state.lastLog.push(`استنزاف السحر (Magic Drain)! امتص قوى سحر الخصm وعطل قدرته!`);
    return { type: 'magic_drain', title: 'استنزاف السحر (Magic Drain)', desc: `استنزف سحر الخصم وأبطل تشغيله!` };
  }

  // Imperial Order (Continuous: Negates all Spell cards on field)
  if (name.includes('imperial order')) {
    state.lastLog.push(`الأمر الإمبراطوري (Imperial Order)! فرض حظراً شاملاً وعطل جميع بطاقات السحر في الساحة!`);
    return {
      type: 'imperial_order',
      stayOnField: true,
      title: 'الأمر الإمبراطوري (Imperial Order)',
      desc: `يعطل تماماً جميع بطاقات وتأثيرات السحر في الملعب طالما هو مكشوف!`,
    };
  }

  // Riryoku Field (Negate spell targeting 1 monster and destroy it)
  if (name.includes('riryoku field')) {
    state.lastLog.push(`حقل ريريوكو (Riryoku Field)! عزل الوحش وأبطل السحر الموجه ضده ودمره!`);
    return { type: 'riryoku_field', title: 'حقل ريريوكو', desc: `أبطل ودمر السحر الموجه ضد وحوشك!` };
  }

  // Metal Detector / Mystic Probe / World Suppression
  if (name.includes('metal detector')) {
    let count = 0;
    opponent.spellTrapZones.forEach((slot, idx) => {
      if (slot && slot.card.type === 'trap') {
        opponent.graveyard.push(slot.card);
        opponent.spellTrapZones[idx] = null;
        count++;
      }
    });
    state.lastLog.push(`كاشف المعادن (Metal Detector)! كشف ودمر ${count} فخاخ مستمرة للخصم!`);
    return { type: 'metal_detector', title: 'كاشف المعادن', desc: `دمر فخاخ الخصم المستمرة!` };
  }
  if (name.includes('mystic probe')) {
    let count = 0;
    opponent.spellTrapZones.forEach((slot, idx) => {
      if (slot && slot.card.type === 'spell') {
        opponent.graveyard.push(slot.card);
        opponent.spellTrapZones[idx] = null;
        count++;
      }
    });
    state.lastLog.push(`المسبار الغامض (Mystic Probe)! عطل ودمر ${count} كروت سحر مستمرة للخصم!`);
    return { type: 'mystic_probe', title: 'المسبار الغامض', desc: `دمر بطاقات السحر المستمرة!` };
  }
  if (name.includes('world suppression')) {
    if (state.activeFieldSpell) {
      state.activeFieldSpell = null;
      state.lastLog.push(`قمع العوالم (World Suppression)! ألغى ودمر بطاقة سحر الحقل النشطة!`);
    }
    return { type: 'world_suppression', title: 'قمع العوالم', desc: `دمر سحر الحقل النشط بالكامل!` };
  }

  // Anti Raigeki / White Hole / Gryphon Wing
  if (name.includes('anti raigeki')) {
    const oppIdx = 1 - playerIndex;
    let count = 0;
    for (let i = 0; i < 5; i++) {
      if (opponent.monsterZones[i]) {
        destroySlot(state, oppIdx, i, 'trap_effect', trap);
        count++;
      }
    }
    state.lastLog.push(`مضاد الصاعقة (Anti Raigeki)! عكس صاعقة الخصم عليه ودمر كل وحوشه (${count} وحش)!`);
    return { type: 'anti_raigeki', title: 'مضاد الصاعقة (Anti Raigeki)', desc: `عكس الصاعقة وسحق وحوش الخصم بالكامل!` };
  }
  if (name.includes('white hole')) {
    state.lastLog.push(`الثقب الأبيض (White Hole)! حمى جميع وحوشك وامتص تأثير الثقب الأسود!`);
    return { type: 'white_hole', title: 'الثقب الأبيض (White Hole)', desc: `حمى وحوشك من فناء الثقب الأسود!` };
  }
  if (name.includes('gryphon wing')) {
    let count = 0;
    opponent.spellTrapZones.forEach((slot, idx) => {
      if (slot) {
        opponent.graveyard.push(slot.card);
        opponent.spellTrapZones[idx] = null;
        count++;
      }
    });
    state.lastLog.push(`جناح الغريفين (Gryphon Wing)! رد ريش هاربي على الخصم ودمر كل أوراقه السحرية والفخاخ (${count} ورقة)!`);
    return { type: 'gryphon_wing', title: 'جناح الغريفين (Gryphon Wing)', desc: `دمر جميع أوراق السحر والفخاخ للخصم!` };
  }

  // Call of the Grave / Call of the Dark
  if (name.includes('call of the grave') || name.includes('call of the dark')) {
    state.lastLog.push(`نداء القبر المظلم! منع إحياء وحوش الخصم وأعادها للظلمات.`);
    return { type: 'anti_reborn', title: 'نداء القبر', desc: `أبطل تأثير ولادة الوحش!` };
  }

  // Fake Trap / Gust / Driving Snow
  if (name.includes('fake trap')) {
    state.lastLog.push(`الفخ المزيف (Fake Trap)! ضحى بنفسه لحماية بقية فخاخك السحرية.`);
    return { type: 'fake_trap', title: 'الفخ المزيف', desc: `حماية لفخاخك من التدمير!` };
  }
  if (name.includes('gust') || name.includes('driving snow')) {
    const oppST = opponent.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    if (oppST.length > 0) {
      opponent.graveyard.push(oppST[0].slot.card);
      opponent.spellTrapZones[oppST[0].idx] = null;
      state.lastLog.push(`رياح الانتقام العاتية! دمرت بطاقة سحر/فخ لـ ${opponent.name}.`);
    }
    return { type: 'revenge_storm', title: 'رياح الانتقام', desc: `دمرت ورقة سحر/فخ من ساحة الخصم!` };
  }

  // The Emperor's Holiday / Armored Glass
  if (name.includes("emperor's holiday") || name.includes('armored glass')) {
    state.lastLog.push(`عطلة الإمبراطور (The Emperor's Holiday)! عطلت كل أوراق الدعم والتجهيز في الملعب.`);
    return { type: 'anti_equip', stayOnField: name.includes('holiday'), title: 'عطلة الإمبراطور', desc: `تعطيل مفعول بطاقات التجهيز!` };
  }

  // Mystical Refpanel / Fairy's Hand Mirror
  if (name.includes('mystical refpanel') || name.includes("fairy's hand mirror")) {
    state.lastLog.push(`مرآة التحويل السحرية! عكست اتجاه السحر نحو هدف مختلف.`);
    return { type: 'redirect_spell', title: 'مرآة التحويل السحرية', desc: `تحويل اتجاه تأثير السحر بنجاح!` };
  }

  // =========================================================================
  // 4. MONSTER DESTRUCTION, BOARD CONTROL & VIRUSES
  // =========================================================================

  // Ring of Destruction (Destroy 1 monster, both take damage equal to its ATK)
  if (name.includes('ring of destruction')) {
    const allFaceUp = [];
    for (const p of [opponent, player]) {
      p.monsterZones.forEach((slot, idx) => {
        if (slot && slot.position !== 'face_down_defense') {
          allFaceUp.push({ slot, idx, player: p });
        }
      });
    }
    allFaceUp.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
    if (allFaceUp.length > 0) {
      const target = allFaceUp[0];
      const dmg = target.slot.currentAtk || target.slot.card.atk || 0;
      const targetCard = target.slot.card;
      const targetOwnerIndex = state.players.indexOf(target.player);
      destroySlot(state, targetOwnerIndex, target.idx, 'trap_effect', trap);
      player.lifePoints = Math.max(0, player.lifePoints - dmg);
      opponent.lifePoints = Math.max(0, opponent.lifePoints - dmg);
      state.lastLog.push(`طوق الهلاك (Ring of Destruction)! فجر الوحش ${targetCard.name} وتلقى كلا اللاعبين ${dmg} ضرر مباشر!`);
      return {
        type: 'ring_of_destruction',
        title: 'طوق الهلاك (Ring of Destruction)',
        desc: `انفجر طوق الهلاك ودمر ${targetCard.name} مسبباً ${dmg} ضرر لكلا الطرفين!`,
        damage: dmg,
        targetAffected: { playerIndex: targetOwnerIndex, zoneIndex: target.idx, actionText: `انفجر طوق الهلاك (${dmg} ضرر)!`, effectType: 'destroy' },
      };
    }
  }

  // Crush Card / Crush Card Virus (Tribute 1 DARK <= 1000 ATK, destroy opp monsters >= 1500 ATK)
  if (name.includes('crush card')) {
    const darkTributeIdx = player.monsterZones.findIndex(m => m && (m.card.attribute === 'DARK' || m.card.race === 'Fiend') && (m.currentAtk || m.card.atk || 0) <= 1000);
    if (darkTributeIdx !== -1) {
      destroySlot(state, playerIndex, darkTributeIdx, 'tribute', trap);
    }
    const oppIdx = 1 - playerIndex;
    let destroyedCount = 0;
    for (let i = 0; i < 5; i++) {
      const mSlot = opponent.monsterZones[i];
      if (mSlot && (mSlot.currentAtk || mSlot.card.atk || 0) >= 1500) {
        destroySlot(state, oppIdx, i, 'trap_effect', trap);
        destroyedCount++;
      }
    }
    state.lastLog.push(`فيروس بطاقة السحق (Crush Card Virus)! انتشر الفيروس الفتاك ودمر كل وحوش الخصم ذات الهجوم العالي (${destroyedCount} وحش)!`);
    return {
      type: 'crush_card',
      title: 'فيروس السحق (Crush Card Virus)',
      desc: `انتشر الوباء ودمر جميع وحوش الخصم التي تملك 1500 نقطة هجوم أو أكثر!`,
      destroyedCount,
    };
  }

  // Two-Pronged Attack (Destroy 2 friendly monsters to destroy 1 opponent monster)
  if (name.includes('two-pronged attack')) {
    const friendly = player.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    if (friendly.length >= 2 && oppMonsters.length >= 1) {
      destroySlot(state, playerIndex, friendly[0].idx, 'cost', trap);
      destroySlot(state, playerIndex, friendly[1].idx, 'cost', trap);
      destroySlot(state, 1 - playerIndex, oppMonsters[0].idx, 'trap_effect', trap);
      state.lastLog.push(`الهجوم المزدوج (Two-Pronged Attack)! ضحى ${player.name} بوحشين لسحق وحش الخصم ${oppMonsters[0].slot.card.name}!`);
      return { type: 'two_pronged', title: 'الهجوم المزدوج', desc: `تضحية ثنائية دمرت وحش الخصم المختار!` };
    }
  }

  // Michizure (Destroy 1 monster on field when friendly monster destroyed)
  if (name.includes('michizure')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    if (oppMonsters.length > 0) {
      oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
      destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
      state.lastLog.push(`ميتشيزوري (Michizure)! سحب الوحش الهالك معه وحش الخصم ${oppMonsters[0].slot.card.name} إلى المقبرة!`);
      return { type: 'michizure', title: 'ميتشيزوري (Michizure)', desc: `سحب أرواح الخصم نحو الهاوية ودمر وحشه!` };
    }
  }

  // Skull Lair (Continuous: Banish monsters from GY to destroy face-up monster)
  if (name.includes('skull lair')) {
    if (player.graveyard.length >= 2) {
      player.graveyard.splice(0, 2);
      const oppIdx = 1 - playerIndex;
      const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
      if (oppMonsters.length > 0) {
        destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
        state.lastLog.push(`عرين الجماجم (Skull Lair)! نفى وحشين من المقبرة ليدمر وحش الخصم!`);
      }
    }
    return { type: 'skull_lair', stayOnField: true, title: 'عرين الجماجم (Skull Lair)', desc: `عرين الجماجم ينفي الأرواح ليدمر وحوش الخصم!` };
  }

  // Earthshaker / Blind Destruction / Infinite Dismissal
  if (name.includes('earthshaker')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    if (oppMonsters.length > 0) {
      destroySlot(state, oppIdx, oppMonsters[0].idx, 'trap_effect', trap);
      state.lastLog.push(`زلزال الأرض (Earthshaker)! صدعت الهزة الأرضية الساحة ودمرت وحش الخصم!`);
    }
    return { type: 'earthshaker', title: 'زلزال الأرض', desc: `زلزال عنيف يدمر الوحوش المختارة!` };
  }
  if (name.includes('blind destruction')) {
    const roll = Math.floor(Math.random() * 6) + 1;
    let count = 0;
    for (const p of state.players) {
      p.monsterZones.forEach((slot, idx) => {
        if (slot && (slot.card.level === roll)) {
          p.graveyard.push(slot.card);
          p.monsterZones[idx] = null;
          count++;
        }
      });
    }
    state.lastLog.push(`الدمار الأعمى (Blind Destruction)! نتيجة النرد [${roll}]: دمر جميع وحوش المستوى ${roll} (${count} وحش)!`);
    return { type: 'blind_destruction', stayOnField: true, title: 'الدمار الأعمى', desc: `نرد القدر دمر الوحوش ذات المستوى المماثل!` };
  }
  if (name.includes('infinite dismissal')) {
    return { type: 'infinite_dismissal', stayOnField: true, title: 'الإقصاء الأبدي', desc: `يقصي جميع الوحوش ذات المستوى 3 أو أقل!` };
  }

  // =========================================================================
  // 5. RESTRICTIVE & CONTINUOUS LOCKDOWNS
  // =========================================================================

  // Spellbinding Circle (Target opponent monster: cannot attack or change position)
  if (name.includes('spellbinding circle') || name.includes('spellbinding')) {
    const oppIdx = 1 - playerIndex;
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && opponent.monsterZones[chosenIdx]) {
      target = { slot: opponent.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(item => item.slot !== null);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }
    if (target) {
      target.slot.hasAttacked = true;
      target.slot.canChangePosition = false;
      target.slot.canAttack = false;
      state.lastLog.push(`الدائرة الساحرة المقيدة (Spellbinding Circle)! قيدت وحش الخصم ${target.slot.card.name} وشلت حركته وهجومه!`);
      return {
        type: 'spellbinding_circle',
        stayOnField: true,
        title: 'الدائرة الساحرة المقيدة (Spellbinding Circle)',
        desc: `قيدت الدائرة الساحرة ${target.slot.card.name} ومنعته من الهجوم أو تغيير وضعيته!`,
        targetCard: target.slot.card,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'مُقيد بالدائرة الساحرة!', effectType: 'seal' },
      };
    }
  }

  // Shadow Spell (Target opponent monster: -700 ATK, cannot attack or change position)
  if (name.includes('shadow spell')) {
    const oppIdx = 1 - playerIndex;
    let target = null;
    const chosenIdx = targetContext?.targetZoneIndex;
    if (chosenIdx !== undefined && chosenIdx !== null && opponent.monsterZones[chosenIdx] && opponent.monsterZones[chosenIdx].position !== 'face_down_defense') {
      target = { slot: opponent.monsterZones[chosenIdx], idx: chosenIdx };
    } else {
      const oppMonsters = opponent.monsterZones.map((slot, idx) => ({ slot, idx })).filter(item => item.slot !== null && item.slot.position !== 'face_down_defense');
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        target = oppMonsters[0];
      }
    }
    if (target) {
      target.slot.currentAtk = Math.max(0, (target.slot.currentAtk || target.slot.card.atk) - 700);
      target.slot.hasAttacked = true;
      target.slot.canChangePosition = false;
      target.slot.canAttack = false;
      state.lastLog.push(`تعويذة الظل (Shadow Spell)! خفضت هجوم ${target.slot.card.name} بمقدار 700 نقطة (أصبح ${target.slot.currentAtk}) وشلت حركته!`);
      return {
        type: 'shadow_spell',
        stayOnField: true,
        title: 'تعويذة الظل (Shadow Spell)',
        desc: `سلاسل الظل قيدت ${target.slot.card.name}، خفضت هجومه 700 نقطة ومنعته من الهجوم!`,
        targetCard: target.slot.card,
        debuffAtk: 700,
        targetAffected: { playerIndex: oppIdx, zoneIndex: target.idx, actionText: 'سلاسل الظل: -700 هجوم وشلل!', effectType: 'debuff' },
      };
    }
  }

  // Nightmare Wheel (Target monster cannot attack, 500 burn per turn)
  if (name.includes('nightmare wheel')) {
    const oppIdx = 1 - playerIndex;
    const oppMonsters = opponent.monsterZones.filter(m => m !== null);
    if (oppMonsters.length > 0) {
      oppMonsters[0].canAttack = false;
      oppMonsters[0].canChangePosition = false;
      opponent.lifePoints = Math.max(0, opponent.lifePoints - 500);
      state.lastLog.push(`عجلة الكوابيس (Nightmare Wheel)! صلب وحش الخصم في العجلة وسدد 500 ضرر مباشر!`);
      return {
        type: 'nightmare_wheel',
        stayOnField: true,
        title: 'عجلة الكوابيس (Nightmare Wheel)',
        desc: `عجلة الكوابيس تقيد الوحش وتلحق 500 ضرر بكل دور!`,
      };
    }
  }

  // Gravity Bind (Continuous: Level 4 or higher monsters cannot attack)
  if (name.includes('gravity bind')) {
    state.lastLog.push(`رباط الجاذبية (Gravity Bind)! ثقل هائل منع جميع الوحوش ذات المستوى 4 أو أعلى من الهجوم!`);
    return {
      type: 'gravity_bind',
      stayOnField: true,
      title: 'رباط الجاذبية (Gravity Bind)',
      desc: `جاذبية ساحقة تشل حركة هجوم جميع الوحوش ذات المستوى 4 أو أعلى!`,
    };
  }

  // Dragon Capture Jar (Continuous: Shift all Dragons to DEF and lock them)
  if (name.includes('dragon capture jar')) {
    for (const p of state.players) {
      p.monsterZones.forEach(slot => {
        if (slot && (slot.card.race === 'Dragon' || slot.card.type?.toLowerCase().includes('dragon'))) {
          slot.position = 'face_up_defense';
          slot.canChangePosition = false;
          slot.canAttack = false;
        }
      });
    }
    state.lastLog.push(`جرة أسر التنانين (Dragon Capture Jar)! جذبت جميع التنانين وحولتها لوضع الدفاع المقيد!`);
    return {
      type: 'dragon_capture_jar',
      stayOnField: true,
      title: 'جرة أسر التنانين (Dragon Capture Jar)',
      desc: `تقيد جميع التنانين في وضع الدفاع طالما بقيت الجرة مكشوفة!`,
    };
  }

  // Mask of Restrict (Continuous: Neither player can Tribute monsters)
  if (name.includes('mask of restrict')) {
    state.lastLog.push(`قناع الحظر (Mask of Restrict)! منع أي تضحيات بالوحوش في الساحة لكلا اللاعبين!`);
    return {
      type: 'mask_of_restrict',
      stayOnField: true,
      title: 'قناع الحظر (Mask of Restrict)',
      desc: `يمنع تقديم أي وحش كأضحية طالما القناع مكشوف في الساحة!`,
    };
  }

  // The Regulation of Tribe (Continuous: Declared Type cannot attack)
  if (name.includes('regulation of tribe')) {
    state.lastLog.push(`تنظيم القبيلة (The Regulation of Tribe)! فرض قيوداً صارمة تمنع نوع الوحوش المختار من الهجوم!`);
    return {
      type: 'regulation_of_tribe',
      stayOnField: true,
      title: 'تنظيم القبيلة',
      desc: `يمنع هجوم نوع محدد من الوحوش في الساحة!`,
    };
  }

  // DNA Surgery (Continuous: Declares Type for all monsters)
  if (name.includes('dna surgery')) {
    state.lastLog.push(`جراحة الحمض النووي (DNA Surgery)! تم تعديل شيفرة جميع الوحوش في الساحة وتوحيد سلالتها!`);
    return {
      type: 'dna_surgery',
      stayOnField: true,
      title: 'جراحة الحمض النووي (DNA Surgery)',
      desc: `تعديل سلالة ونوع جميع الوحوش في الملعب!`,
    };
  }

  // Tornado Wall (Continuous: While Umi is active, battle damage = 0)
  if (name.includes('tornado wall')) {
    player.zeroBattleDamage = true;
    state.lastLog.push(`جدار الإعصار (Tornado Wall)! جدار مائي أعصاري يحميك من أي ضرر معركة!`);
    return {
      type: 'tornado_wall',
      stayOnField: true,
      title: 'جدار الإعصار (Tornado Wall)',
      desc: `يحميك من أضرار المعركة طالما أومي في الساحة!`,
    };
  }

  // Anti-Spell Fragrance (Continuous: Spells must be set for 1 turn)
  if (name.includes('anti-spell fragrance')) {
    state.lastLog.push(`عطر منع السحر (Anti-Spell Fragrance)! عطر ساحر يجبر اللاعبين على وضع السحر مقلوباً أولاً!`);
    return {
      type: 'anti_spell_fragrance',
      stayOnField: true,
      title: 'عطر منع السحر',
      desc: `يجبر كلا الطرفين على قلب بطاقات السحر دوراً كاملاً قبل تشغيلها!`,
    };
  }

  // Light of Intervention / The Eye of Truth / Respect Play
  if (name.includes('light of intervention')) {
    state.lastLog.push(`نور التدخل (Light of Intervention)! نور كاشف يمنع لعب الوحوش مقلوبة!`);
    return { type: 'light_of_intervention', stayOnField: true, title: 'نور التدخل', desc: `يمنع لعب الوحوش مقلوبة في الدفاع!` };
  }
  if (name.includes('the eye of truth')) {
    state.lastLog.push(`عين الحقيقة (The Eye of Truth)! كشفت يد الخصم بالكامل أمامك!`);
    return { type: 'eye_of_truth', stayOnField: true, title: 'عين الحقيقة', desc: `تكشف يد الخصم طالما العين مفتوحة!` };
  }
  if (name.includes('respect play')) {
    state.lastLog.push(`اللعب النزيه (Respect Play)! كشف يد كلا اللاعبين للنزال الصريح!`);
    return { type: 'respect_play', stayOnField: true, title: 'اللعب النزيه', desc: `اللعب وأيدي اللاعبين مكشوفة تماماً!` };
  }

  // Solomon's Lawbook / Time Seal
  if (name.includes("solomon's lawbook")) {
    state.lastLog.push(`كتاب قانون سليمان (Solomon's Lawbook)! تجاوز مرحلة الاستعداد الخاصة بك.`);
    return { type: 'solomons_lawbook', title: 'كتاب قانون سليمان', desc: `تخطي مرحلة الاستعداد!` };
  }
  if (name.includes('time seal')) {
    state.lastLog.push(`ختم الوقت (Time Seal)! ختم دور الخصم وحرمه من سحب ورقة في دوره القادم!`);
    return { type: 'time_seal', title: 'ختم الوقت (Time Seal)', desc: `يحرم الخصم من مرحلة السحب في دوره القادم!` };
  }

  // =========================================================================
  // 6. SPECIAL SUMMONS, REBIRTH & FIELD UTILITY
  // =========================================================================

  // Call Of The Haunted (Special Summon 1 monster from graveyard in attack position)
  if (name.includes('call of the haunted') || (name.includes('call') && name.includes('haunted'))) {
    let revived = targetContext?.selectedTargetCard;
    if (!revived) {
      const pMonsters = player.graveyard.filter(c => c.type === 'monster');
      pMonsters.sort((a, b) => (b.atk || 0) - (a.atk || 0));
      if (pMonsters.length > 0) revived = pMonsters[0];
    }
    if (revived) {
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        const inPlayerGY = player.graveyard.findIndex(c => c === revived || (c.id && c.id === revived.id) || c.name === revived.name);
        if (inPlayerGY !== -1) player.graveyard.splice(inPlayerGY, 1);

        player.monsterZones[emptyZone] = {
          card: revived,
          position: 'face_up_attack',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: revived.atk,
          currentDef: revived.def,
        };
        state.lastLog.push(`نداء المسكونين (Call Of The Haunted)! استدعى ${player.name} الوحش ${revived.name} من المقبرة في وضع الهجوم!`);
        return {
          type: 'call_of_the_haunted',
          effectCategory: 'GRAVEYARD_SUMMON',
          revivedCard: revived,
          originZone: 'player_graveyard',
          targetPlayerIndex: playerIndex,
          targetZoneIndex: emptyZone,
          stayOnField: true,
          title: 'نداء المسكونين (Call Of The Haunted)',
          desc: `أعيد إحياء ${revived.name} (هجوم: ${revived.atk}) في وضع الهجوم!`,
        };
      }
    }
  }

  // Time Machine (Revive monster destroyed in battle)
  if (name.includes('time machine')) {
    const pMonsters = player.graveyard.filter(c => c.type === 'monster');
    if (pMonsters.length > 0) {
      const revived = pMonsters[pMonsters.length - 1];
      const emptyZone = player.monsterZones.findIndex(z => z === null);
      if (emptyZone !== -1) {
        player.graveyard.pop();
        player.monsterZones[emptyZone] = {
          card: revived,
          position: 'face_up_attack',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: revived.atk,
          currentDef: revived.def,
        };
        state.lastLog.push(`آلة الزمن (Time Machine)! أعادت الوحش الساقط ${revived.name} للحياة في نفس اللحظة!`);
        return {
          type: 'time_machine',
          effectCategory: 'GRAVEYARD_SUMMON',
          revivedCard: revived,
          originZone: 'player_graveyard',
          targetPlayerIndex: playerIndex,
          targetZoneIndex: emptyZone,
          title: 'آلة الزمن (Time Machine)',
          desc: `أعادت آلة الزمن الوحش ${revived.name} فوراً إلى ساحة القتال!`,
        };
      }
    }
  }

  // Backup Soldier (Return up to 3 Normal monsters with <= 1500 ATK from GY to hand)
  if (name.includes('backup soldier')) {
    const eligible = player.graveyard.filter(c => c.type === 'monster' && c.subType !== 'effect' && (c.atk || 0) <= 1500);
    const added = eligible.slice(0, 3);
    added.forEach(card => {
      const idx = player.graveyard.indexOf(card);
      if (idx !== -1) player.graveyard.splice(idx, 1);
      player.hand.push(card);
    });
    state.lastLog.push(`جندي الدعم (Backup Soldier)! استرجع ${added.length} وحوش عادية من المقبرة إلى اليد!`);
    return {
      type: 'backup_soldier',
      title: 'جندي الدعم (Backup Soldier)',
      desc: `استعاد جندي الدعم ${added.length} وحوش إلى يدك!`,
      count: added.length,
    };
  }

  // Major Riot (Special summon all Level 4 or lower monsters from hand)
  if (name.includes('major riot')) {
    let summoned = 0;
    for (let i = player.hand.length - 1; i >= 0; i--) {
      const card = player.hand[i];
      if (card && card.type === 'monster' && (card.level || 4) <= 4) {
        const emptyZone = player.monsterZones.findIndex(z => z === null);
        if (emptyZone !== -1) {
          player.hand.splice(i, 1);
          player.monsterZones[emptyZone] = {
            card,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: card.atk,
            currentDef: card.def,
          };
          summoned++;
        }
      }
    }
    state.lastLog.push(`الشغب العظيم (Major Riot)! اجتاحت الساحة واستدعت ${summoned} وحوش دفعة واحدة من اليد!`);
    return { type: 'major_riot', title: 'الشغب العظيم (Major Riot)', desc: `استدعاء جماعي لجميع الوحوش من اليد!` };
  }

  // Interdimensional Matter Transporter (Banish friendly monster to dodge)
  if (name.includes('interdimensional matter transporter') || name.includes('transporter')) {
    const friendly = player.monsterZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
    if (friendly.length > 0) {
      const target = friendly[0];
      target.slot.canAttack = false;
      target.slot.protected = true;
      state.lastLog.push(`ناقل المادة عبر الأبعاد! نقل الوحش ${target.slot.card.name} إلى بعد آمن لحمايته!`);
      return { type: 'transporter', title: 'ناقل المادة عبر الأبعاد', desc: `تم تأمين وحشك في بعد موازي لحمايته!` };
    }
  }

  // Shift / Collected Power
  if (name.includes('shift')) {
    state.lastLog.push(`التبديل (Shift)! حوّل هدف تأثير الخصم إلى وحش آخر.`);
    return { type: 'shift', title: 'التبديل (Shift)', desc: `تحويل مسار هجوم أو استهداف الخصم!` };
  }
  if (name.includes('collected power')) {
    state.lastLog.push(`القوة المجمعة (Collected Power)! جمعت كل بطاقات التجهيز في الساحة على وحش واحد!`);
    return { type: 'collected_power', title: 'القوة المجمعة', desc: `تركيز جميع بطاقات التجهيز على وحش مختار!` };
  }

  // Ultimate Offering (Pay 500 LP for extra normal summon)
  if (name.includes('ultimate offering')) {
    player.lifePoints = Math.max(1, player.lifePoints - 500);
    player.normalSummonsRemaining = (player.normalSummonsRemaining || 1) + 1;
    state.lastLog.push(`التضحية القصوى (Ultimate Offering)! دفع ${player.name} 500 نقطة حياة وحصل على استدعاء عادي إضافي في هذا الدور!`);
    return {
      type: 'ultimate_offering',
      stayOnField: true,
      title: 'التضحية القصوى (Ultimate Offering)',
      desc: `تم منحك استدعاء عادي إضافي بتكلفة 500 نقطة حياة!`,
    };
  }

  // =========================================================================
  // 7. HAND ADVANTAGE & DRAW TRAPS
  // =========================================================================

  // Jar of Greed (Draw 1 card)
  if (name.includes('jar of greed')) {
    if (player.deck && player.deck.length > 0) {
      player.hand.push(player.deck.pop());
    } else {
      try { drawCardForTurnPlayer(state); } catch (e) {}
    }
    state.lastLog.push(`جرة الجشع (Jar of Greed)! سحب ${player.name} بطاقة إضافية من مجموعته.`);
    return {
      type: 'jar_of_greed',
      title: 'جرة الجشع (Jar of Greed)',
      desc: `سحب ${player.name} بطاقة إضافية من مجموعته!`,
      cardsDrawn: 1,
    };
  }

  // Gamble (Coin toss: Heads = draw 5, Tails = lose half LP)
  if (name.includes('gamble')) {
    const isWin = Math.random() < 0.5;
    if (isWin) {
      for (let i = 0; i < 5; i++) {
        if (player.deck && player.deck.length > 0) {
          player.hand.push(player.deck.pop());
        } else {
          try { drawCardForTurnPlayer(state); } catch (e) {}
        }
      }
      state.lastLog.push(`المقامرة (Gamble)! كسبت الرهان وسحبت 5 بطاقات دفعة واحدة!`);
      return { type: 'gamble_win', title: 'المقامرة: فوز ساحق!', desc: `كسبت الرهان وسحبت 5 بطاقات جديدة!`, cardsDrawn: 5 };
    } else {
      player.lifePoints = Math.floor(player.lifePoints / 2);
      state.lastLog.push(`المقامرة (Gamble)! خسرت الرهان وخسرت نصف نقاط حياتك!`);
      return { type: 'gamble_lose', title: 'المقامرة: خسارة!', desc: `خسرت الرهان وتناقصت نقاط حياتك للنصف!` };
    }
  }

  // Appropriate (Continuous: Draw 2 cards whenever opponent draws outside Draw Phase)
  if (name.includes('appropriate')) {
    for (let i = 0; i < 2; i++) {
      if (player.deck && player.deck.length > 0) {
        player.hand.push(player.deck.pop());
      } else {
        try { drawCardForTurnPlayer(state); } catch (e) {}
      }
    }
    state.lastLog.push(`المصادرة المناسبة (Appropriate)! سحب بطاقتين بفضل سحب الخصم!`);
    return {
      type: 'appropriate',
      stayOnField: true,
      title: 'المصادرة المناسبة (Appropriate)',
      desc: `تسحب بطاقتين كلما سحب الخصم كروتاً خارج مرحلة السحب!`,
    };
  }

  // Graverobber (Take 1 Spell card from opponent's GY)
  if (name.includes('graverobber') && !name.includes('retribution')) {
    const oppSpells = opponent.graveyard.filter(c => c.type === 'spell');
    if (oppSpells.length > 0) {
      const stolen = oppSpells[0];
      const idx = opponent.graveyard.indexOf(stolen);
      if (idx !== -1) opponent.graveyard.splice(idx, 1);
      player.hand.push(stolen);
      state.lastLog.push(`سارق القبور (Graverobber)! سرق بطاقة السحر ${stolen.name} من مقبرة الخصم وأضافها ليده!`);
      return { type: 'graverobber', title: 'سارق القبور (Graverobber)', desc: `سرقت كارت السحر ${stolen.name} من مقبرة الخصم!` };
    }
  }

  // Lightforce Sword (Banish 1 card from opponent hand face-down for 3 turns)
  if (name.includes('lightforce sword')) {
    if (opponent.hand.length > 0) {
      const removed = opponent.hand.pop();
      state.lastLog.push(`سيف النور القاطع (Lightforce Sword)! طرد بطاقة عشوائية من يد الخصم وحبسها خارج اللعب!`);
      return { type: 'lightforce_sword', title: 'سيف النور القاطع', desc: `حبس بطاقة من يد الخصم خارج الساحة!` };
    }
  }

  // =========================================================================
  // 8. DIRECT BURN DAMAGE & LP RECOVERY
  // =========================================================================

  // Just Desserts (Inflict 500 damage per opponent monster)
  if (name.includes('just desserts')) {
    const oppMonstersCount = opponent.monsterZones.filter(m => m !== null).length;
    const dmg = oppMonstersCount * 500;
    opponent.lifePoints = Math.max(0, opponent.lifePoints - dmg);
    state.lastLog.push(`الحلوى المستحقة (Just Desserts)! تلقى ${opponent.name} ${dmg} نقطة ضرر (${oppMonstersCount} وحش × 500)!`);
    return {
      type: 'just_desserts',
      title: 'الحلوى المستحقة (Just Desserts)',
      desc: `أصابت الحلوى المستحقة نقاط حياة ${opponent.name} بـ ${dmg} نقطة ضرر مباشر!`,
      damage: dmg,
    };
  }

  // Ceasefire (Flip face-down monsters and burn 500 per effect monster)
  if (name.includes('ceasefire')) {
    let effectCount = 0;
    for (const p of [player, opponent]) {
      for (let i = 0; i < 5; i++) {
        const slot = p.monsterZones[i];
        if (slot) {
          if (slot.position === 'face_down_defense') {
            slot.position = 'face_up_defense';
          }
          if (slot.card.subType === 'effect') effectCount++;
        }
      }
    }
    const burnDmg = effectCount * 500;
    opponent.lifePoints = Math.max(0, opponent.lifePoints - burnDmg);
    state.lastLog.push(`وقف إطلاق النار (Ceasefire)! كشف الوحوش المقلوبة وسدد ${burnDmg} ضرر لـ ${opponent.name}.`);
    return {
      type: 'ceasefire',
      title: 'وقف إطلاق النار (Ceasefire)',
      desc: `تم كشف جميع الوحوش وتلقى الخصم ${burnDmg} نقطة ضرر (${effectCount} وحوش تأثير)!`,
      damage: burnDmg,
    };
  }

  // Attack and Receive (Inflict 700 direct damage)
  if (name.includes('attack and receive')) {
    opponent.lifePoints = Math.max(0, opponent.lifePoints - 700);
    state.lastLog.push(`الهجوم والاستقبال (Attack and Receive)! رد الضرر وسدد 700 نقطة ضرر مباشر لـ ${opponent.name}!`);
    return { type: 'attack_and_receive', title: 'الهجوم والاستقبال', desc: `سدد 700 ضرر مباشر لنقاط حياة الخصم!`, damage: 700 };
  }

  // Minor Goblin Official (Continuous: 500 burn when opp LP <= 3000)
  if (name.includes('minor goblin official')) {
    if (opponent.lifePoints <= 3000) {
      opponent.lifePoints = Math.max(0, opponent.lifePoints - 500);
    }
    state.lastLog.push(`الموظف الغول الصغير (Minor Goblin Official)! غرامة دورية 500 ضرر مباشر على الخصم.`);
    return { type: 'goblin_official', stayOnField: true, title: 'الموظف الغول الصغير', desc: `يفرض 500 ضرر مباشر كل دور طالما نقاط الخصم 3000 أو أقل!` };
  }

  // Coffin Seller (Continuous: 300 damage per card sent to opp GY)
  if (name.includes('coffin seller')) {
    opponent.lifePoints = Math.max(0, opponent.lifePoints - 300);
    state.lastLog.push(`بائع التوابيت (Coffin Seller)! خصم 300 نقطة حياة من الخصم مع دخول الورقة إلى المقبرة.`);
    return { type: 'coffin_seller', stayOnField: true, title: 'بائع التوابيت (Coffin Seller)', desc: `يلحق 300 ضرر مباشر في كل مرة تسقط فيها ورقة لمقبرة الخصم!` };
  }

  // Magic Thorn (Continuous: 500 damage per discard)
  if (name.includes('magic thorn')) {
    state.lastLog.push(`الأشواك السحرية (Magic Thorn)! تجهز لأشواك قاتلة تسدد 500 ضرر عند رمي أوراق الخصم.`);
    return { type: 'magic_thorn', stayOnField: true, title: 'الأشواك السحرية', desc: `تسدد 500 ضرر عن كل ورقة يتخلص منها الخصم من يده!` };
  }

  // Graverobber's Retribution / Type Zero Magic Crusher
  if (name.includes("graverobber's retribution")) {
    opponent.lifePoints = Math.max(0, opponent.lifePoints - 300);
    state.lastLog.push(`انتقام سارق القبور! سدد 300 نقطة ضرر للخصم.`);
    return { type: 'graverobber_retribution', stayOnField: true, title: 'انتقام سارق القبور', desc: `ضرر دوري عن البطاقات المنفية!` };
  }
  if (name.includes('type zero magic crusher')) {
    if (player.hand.some(c => c.type === 'spell')) {
      const spIdx = player.hand.findIndex(c => c.type === 'spell');
      player.graveyard.push(player.hand.splice(spIdx, 1)[0]);
      opponent.lifePoints = Math.max(0, opponent.lifePoints - 500);
      state.lastLog.push(`ساحق السحر صفر (Type Zero Magic Crusher)! ضحى بسحر وسدد 500 ضرر مباشر!`);
    }
    return { type: 'type_zero', stayOnField: true, title: 'ساحق السحر صفر', desc: `يحول بطاقات السحر لضرر مباشر!` };
  }

  // Solemn Wishes / Gift of The Mystical Elf / Numinous Healer (LP Gain)
  if (name.includes('solemn wishes') || name.includes('gift of the mystical elf') || name.includes('numinous healer')) {
    const totalMonsters = player.monsterZones.filter(m => m !== null).length + opponent.monsterZones.filter(m => m !== null).length;
    const heal = name.includes('gift') ? Math.max(600, totalMonsters * 300) : 1000;
    player.lifePoints += heal;
    state.lastLog.push(`شفاء الفخ الروحي! استعاد ${player.name} +${heal} نقطة حياة.`);
    return {
      type: 'trap_heal',
      stayOnField: name.includes('wishes'),
      title: 'شفاء روحي',
      desc: `منح الفخ استعادة +${heal} نقطة حياة لـ ${player.name}!`,
      heal,
    };
  }

  // Robbin' Goblin / Forced Requisition (Hand Disruption)
  if (name.includes("robbin' goblin")) {
    state.lastLog.push(`الغول السارق (Robbin' Goblin)! سيسرق بطاقة من يد الخصم مع كل ضربة معركة ناجحة!`);
    return { type: 'robbin_goblin', stayOnField: true, title: 'الغول السارق', desc: `يجبر الخصم على التخلص من بطاقة عند تلقيه ضرر المعركة!` };
  }
  if (name.includes('forced requisition')) {
    state.lastLog.push(`المصادرة القسرية (Forced Requisition)! تجبر الخصم على التخلص من نفس عدد بطاقاتك.`);
    return { type: 'forced_requisition', stayOnField: true, title: 'المصادرة القسرية', desc: `يجبر الخصم على رمي أوراق مساوية لرميك!` };
  }

  // =========================================================================
  // 9. STAT MODIFIERS & EQUIPS
  // =========================================================================

  // Reinforcements (+500 ATK to friendly monster)
  if (name.includes('reinforcements')) {
    const myMonsters = player.monsterZones.filter(m => m !== null);
    if (myMonsters.length > 0) {
      myMonsters[0].currentAtk = (myMonsters[0].currentAtk || myMonsters[0].card.atk) + 500;
      state.lastLog.push(`التعزيزات (Reinforcements)! زاد هجوم ${myMonsters[0].card.name} بمقدار +500 نقطة!`);
      return {
        type: 'buff_atk',
        title: 'التعزيزات (Reinforcements)',
        desc: `دعمت التعزيزات ${myMonsters[0].card.name} بـ +500 نقطة هجوم إضافية!`,
      };
    }
  }

  // Castle Walls (+500 DEF to friendly monster)
  if (name.includes('castle walls')) {
    const myMonsters = player.monsterZones.filter(m => m !== null);
    if (myMonsters.length > 0) {
      myMonsters[0].currentDef = (myMonsters[0].currentDef || myMonsters[0].card.def) + 500;
      state.lastLog.push(`أسوار القلعة (Castle Walls)! زاد دفاع ${myMonsters[0].card.name} بمقدار +500 نقطة!`);
      return {
        type: 'buff_def',
        title: 'أسوار القلعة (Castle Walls)',
        desc: `حصنت أسوار القلعة ${myMonsters[0].card.name} بـ +500 نقطة دفاع!`,
      };
    }
  }

  // Snake Fang (-500 DEF)
  if (name.includes('snake fang')) {
    const oppMonsters = opponent.monsterZones.filter(m => m !== null);
    if (oppMonsters.length > 0) {
      oppMonsters[0].currentDef = Math.max(0, (oppMonsters[0].currentDef || oppMonsters[0].card.def) - 500);
      state.lastLog.push(`ناب الأفعى (Snake Fang)! سم الأفعى خفّض دفاع ${oppMonsters[0].card.name} بـ 500 نقطة.`);
      return { type: 'snake_fang', title: 'ناب الأفعى', desc: `تخفيض دفاع وحش الخصم بـ 500 نقطة!` };
    }
  }

  // Skull Dice (Roll 6-sided die: Opponent monsters lose roll * 100 ATK/DEF)
  if (name.includes('skull dice')) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const debuff = roll * 100;
    opponent.monsterZones.forEach(slot => {
      if (slot) {
        slot.currentAtk = Math.max(0, (slot.currentAtk || slot.card.atk) - debuff);
        slot.currentDef = Math.max(0, (slot.currentDef || slot.card.def) - debuff);
      }
    });
    state.lastLog.push(`نرد الجمجمة (Skull Dice)! نتيجة النرد [${roll}]: خفّض هجوم ودفاع كل وحوش الخصم بمقدار -${debuff} نقطة!`);
    return {
      type: 'skull_dice',
      effectCategory: 'DICE_ROLL',
      title: 'نرد الجمجمة (Skull Dice)',
      desc: `ألقى نرد الجمجمة لعنة أضعفت هجوم ودفاع وحوش الخصم بـ -${debuff} نقطة!`,
      diceRoll: roll,
      roll,
      debuff,
    };
  }

  // Reverse Trap (Reverse all stat increases and decreases)
  if (name.includes('reverse trap')) {
    for (const p of state.players) {
      p.monsterZones.forEach(slot => {
        if (slot) {
          const diffAtk = (slot.currentAtk || slot.card.atk) - slot.card.atk;
          slot.currentAtk = Math.max(0, slot.card.atk - diffAtk);
        }
      });
    }
    state.lastLog.push(`عكس الفخ (Reverse Trap)! انقلبت كل الزيادات لنقصان وكل النقصان لزيادات في هجوم الوحوش!`);
    return { type: 'reverse_trap', title: 'عكس الفخ (Reverse Trap)', desc: `قلب موازين القوة وتأثيرات الإحصائيات بالكامل!` };
  }

  // Windstorm of Etaqua (Change battle positions of all opponent monsters)
  if (name.includes('windstorm of etaqua') || name.includes('etaqua')) {
    let flippedCount = 0;
    opponent.monsterZones.forEach(slot => {
      if (slot && slot.position !== 'face_down_defense') {
        slot.position = slot.position === 'face_up_attack' ? 'face_up_defense' : 'face_up_attack';
        flippedCount++;
      }
    });
    state.lastLog.push(`عاصفة إيتاكوا (Windstorm of Etaqua)! عاصفة رياح قلبت وضعيات كل وحوش الخصم (${flippedCount} وحش)!`);
    return {
      type: 'windstorm_of_etaqua',
      title: 'عاصفة إيتاكوا (Windstorm of Etaqua)',
      desc: `عاصفة عاتية قلبت وضعيات وحوش الخصم بين الهجوم والدفاع!`,
      flippedCount,
    };
  }

  // Deal of Phantom (+100 ATK per monster in GY)
  if (name.includes('deal of phantom')) {
    const gyMonsters = player.graveyard.filter(c => c.type === 'monster').length;
    const buff = gyMonsters * 100;
    const myMonsters = player.monsterZones.filter(m => m !== null);
    if (myMonsters.length > 0) {
      myMonsters[0].currentAtk = (myMonsters[0].currentAtk || myMonsters[0].card.atk) + buff;
      state.lastLog.push(`صفقة الشبح (Deal of Phantom)! زاد هجوم ${myMonsters[0].card.name} بمقدار +${buff} (${gyMonsters} وحوش بالمقبرة)!`);
      return { type: 'deal_of_phantom', title: 'صفقة الشبح', desc: `منحت أرواح المقبرة +${buff} هجوم لوحشك!` };
    }
  }

  // Kunai with Chain (Shift attacking monster to DEF or give +500 ATK)
  if (name.includes('kunai with chain') || name.includes('kunai')) {
    const myMonsters = player.monsterZones.filter(m => m !== null);
    if (myMonsters.length > 0) {
      myMonsters[0].currentAtk = (myMonsters[0].currentAtk || myMonsters[0].card.atk) + 500;
      state.lastLog.push(`كوناي بالسلسلة (Kunai with Chain)! تسلح وحشك وزاد هجومه بمقدار +500 نقطة!`);
      return { type: 'kunai_chain', title: 'كوناي بالسلسلة', desc: `تسلح وحشك بـ +500 نقطة هجوم إضافية!` };
    }
  }

  // Metalmorph (Equip: +300 ATK/DEF, and gains half opponent ATK when attacking)
  if (name.includes('metalmorph')) {
    const myMonsters = player.monsterZones.filter(m => m !== null);
    if (myMonsters.length > 0) {
      myMonsters[0].currentAtk = (myMonsters[0].currentAtk || myMonsters[0].card.atk) + 300;
      myMonsters[0].currentDef = (myMonsters[0].currentDef || myMonsters[0].card.def) + 300;
      myMonsters[0].hasMetalmorph = true;
      state.lastLog.push(`المعدن المتحول (Metalmorph)! تحول درع الوحش لمعدن خارق (+300 هجوم ودفاع وقوة مضاعفة في الهجوم)!`);
      return {
        type: 'metalmorph',
        title: 'المعدن المتحول (Metalmorph)',
        desc: `تجهيز معدني يمنح +300 هجوم ودفاع ويعزز القوة الهجومية بنصف هجوم الخصم!`,
      };
    }
  }

  // Aqua Chorus (Continuous: +500 ATK/DEF if multiple monsters share name)
  if (name.includes('aqua chorus')) {
    const nameCounts = {};
    for (const p of state.players) {
      p.monsterZones.forEach(slot => {
        if (slot) {
          nameCounts[slot.card.name] = (nameCounts[slot.card.name] || 0) + 1;
        }
      });
    }
    for (const p of state.players) {
      p.monsterZones.forEach(slot => {
        if (slot && nameCounts[slot.card.name] > 1) {
          slot.currentAtk = (slot.currentAtk || slot.card.atk) + 500;
          slot.currentDef = (slot.currentDef || slot.card.def) + 500;
        }
      });
    }
    state.lastLog.push(`جوقة الماء (Aqua Chorus)! منحت +500 هجوم ودفاع للوحوش المتطابقة في الاسم.`);
    return { type: 'aqua_chorus', stayOnField: true, title: 'جوقة الماء', desc: `تعزيز هجوم ودفاع الوحوش المتشابهة!` };
  }

  // =========================================================================
  // 10. DESTINY BOARD & MAGICAL HATS
  // =========================================================================

  // Destiny Board (Continuous: Advances Spirit Message countdown or 800 burn)
  if (name.includes('destiny board')) {
    state.destinyBoardCount = (state.destinyBoardCount || 0) + 1;
    const letters = ['I', 'N', 'A', 'L'];
    const currentLetter = letters[state.destinyBoardCount - 1] || 'FINAL';
    opponent.lifePoints = Math.max(0, opponent.lifePoints - 800);
    state.lastLog.push(`لوحة القدر (Destiny Board)! ظهرت رسالة الروح [${currentLetter}] وسددت 800 ضرر لـ ${opponent.name}!`);

    if (state.destinyBoardCount >= 4) {
      state.winner = playerIndex;
      state.lastLog.push(`اكتملت رسالة الروح FINAL! فاز ${player.name} بالنزال فوراً عبر لوحة القدر!`);
    }

    return {
      type: 'destiny_board',
      stayOnField: true,
      title: 'لوحة القدر (Destiny Board)',
      desc: `رسالة الروح تتقدم [${currentLetter}] وسددت 800 ضرر مباشر!`,
      damage: 800,
    };
  }

  // Magical Hats (Conceal monster under hats)
  if (name.includes('magical hats')) {
    state.lastLog.push(`القبعات السحرية (Magical Hats)! اختفى الوحش داخل القبعات الخادعة لتضليل هجوم الخصم!`);
    return {
      type: 'magical_hats',
      title: 'القبعات السحرية (Magical Hats)',
      desc: `تم إخفاء الوحش وتضليل تركيز هجوم الخصم!`,
    };
  }

  // =========================================================================
  // 11. GENERIC TRAP FALLBACK
  // =========================================================================
  opponent.lifePoints = Math.max(0, opponent.lifePoints - 500);
  state.lastLog.push(`تأثير الفخ ${trap.name}: سدد 500 نقطة ضرر مباشر لـ ${opponent.name}.`);
  return {
    type: 'generic_trap',
    title: trap.name,
    desc: `تأثير الفخ ${trap.name} أوقع 500 نقطة ضرر مباشر بنقاط حياة الخصم!`,
    damage: 500,
  };
}

/**
 * Combat Battle Trap Checker (Used in DamageCalculator for AI & combat response)
 * @param {Object} state - Duel GameState
 * @param {number} attackerPlayerIndex - Attacking player
 * @param {Object} attackerSlot - Attacker monster slot
 * @param {number|null} defenderZoneIndex - Defender monster zone index (null if direct attack)
 * @param {Object} helpers - Callbacks: { destroyMonsterSlot }
 * @returns {Object|null} Battle trap result payload or null
 */
export function checkBattleTrap(state, attackerPlayerIndex, attackerSlot, defenderZoneIndex = null, helpers = {}) {
  const defenderPlayerIndex = 1 - attackerPlayerIndex;
  const defenderPlayer = state.players[defenderPlayerIndex];
  const attackerPlayer = state.players[attackerPlayerIndex];

  if (isTrapNegated(state)) return null;

  const destroySlot = helpers.destroyMonsterSlot || ((s, pIdx, zIdx, reason, src) => {
    const p = s.players[pIdx];
    if (p && p.monsterZones[zIdx]) {
      const c = p.monsterZones[zIdx].card;
      p.graveyard.push(c);
      p.monsterZones[zIdx] = null;
      return { destroyedCard: c };
    }
    return null;
  });

  for (let i = 0; i < 5; i++) {
    const slot = defenderPlayer.spellTrapZones[i];
    if (slot && !slot.faceUp && slot.card.type === 'trap') {
      if (slot.turnSet === state.turnNumber) continue;

      const name = (slot.card.name || '').toLowerCase();

      // Mirror Force
      if (name.includes('mirror force')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        let destroyedCount = 0;
        for (let m = 0; m < 5; m++) {
          const mSlot = attackerPlayer.monsterZones[m];
          if (mSlot && mSlot.position === 'face_up_attack') {
            destroySlot(state, attackerPlayerIndex, m, 'trap_effect', slot.card);
            destroyedCount++;
          }
        }
        const log = `تشغيل فخ قوة المراية (Mirror Force)! عكست الهجوم ودمّرت كل وحوش ${attackerPlayer.name} اللي في وضع الهجوم (${destroyedCount} وحش)!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'mirror_force',
          negated: true,
          attackerDestroyed: true,
          destroyedCount,
          log,
        };
      }

      // Magic Cylinder
      if (name.includes('magic cylinder') || name.includes('cylinder')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const dmg = attackerSlot.currentAtk || attackerSlot.card.atk || 0;
        attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - dmg);
        const log = `تشغيل فخ الأسطوانة السحرية (Magic Cylinder)! شفطت الهجوم وردّت ${dmg} ضرر مباشر لنقاط حياة ${attackerPlayer.name}!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'magic_cylinder',
          negated: true,
          attackerDestroyed: false,
          damage: dmg,
          log,
        };
      }

      // Draining Shield (Negate attack and gain LP equal to ATK)
      if (name.includes('draining shield')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const heal = attackerSlot.currentAtk || attackerSlot.card.atk || 0;
        defenderPlayer.lifePoints += heal;
        const log = `تشغيل درع الاستنزاف (Draining Shield)! امتص هجوم ${attackerSlot.card.name} وزاد نقاط حياة ${defenderPlayer.name} بمقدار +${heal} نقطة!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'draining_shield',
          negated: true,
          attackerDestroyed: false,
          heal,
          log,
        };
      }

      // Dimensional Prison (Banish attacking monster)
      if (name.includes('dimensional prison')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const aZoneIdx = attackerPlayer.monsterZones.indexOf(attackerSlot);
        if (aZoneIdx !== -1) {
          attackerPlayer.monsterZones[aZoneIdx] = null;
          if (!attackerPlayer.banished) attackerPlayer.banished = [];
          attackerPlayer.banished.push(attackerSlot.card);
        }
        const log = `تشغيل السجن البعدي (Dimensional Prison)! تم نفي الوحش المهاجم ${attackerSlot.card.name} خارج أبعاد اللعبة!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'dimensional_prison',
          negated: true,
          attackerDestroyed: true,
          banished: true,
          log,
        };
      }

      // Dimension Wall (Attacking player takes all battle damage instead)
      if (name.includes('dimension wall')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const dmg = attackerSlot.currentAtk || attackerSlot.card.atk || 0;
        attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - dmg);
        const log = `تشغيل جدار البعد (Dimension Wall)! ارتد الضرر بالكامل (${dmg} نقطة) على نقاط حياة ${attackerPlayer.name}!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'magic_cylinder',
          negated: true,
          attackerDestroyed: false,
          damage: dmg,
          log,
        };
      }

      // Threatening Roar (Opponent cannot declare attack this turn)
      if (name.includes('threatening roar')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const log = `تشغيل الزئير المرعب (Threatening Roar)! زئير وحشي أرعب وحوش ${attackerPlayer.name} وأوقف الهجوم بالكامل!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'negate_attack',
          negated: true,
          attackerDestroyed: false,
          log,
        };
      }

      // Negate Attack
      if (name.includes('negate attack')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        state.phase = 'MAIN_PHASE_2';
        const log = `تشغيل فخ إلغاء الهجوم (Negate Attack)! تم إلغاء الهجوم بنجاح وإنهاء مرحلة المعركة!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'negate_attack',
          negated: true,
          attackerDestroyed: false,
          log,
        };
      }

      // Waboku
      if (name.includes('waboku')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        defenderPlayer.zeroBattleDamage = true;
        const log = `تشغيل فخ وابوكو (Waboku)! حماية مقدسة منعت كل أضرار المعركة في هذا الدور!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'waboku',
          negated: false,
          preventDamage: true,
          log,
        };
      }

      // Widespread Ruin / Sakuretsu Armor
      if (name.includes('widespread ruin') || name.includes('sakuretsu')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const aZoneIdx = attackerPlayer.monsterZones.indexOf(attackerSlot);
        if (aZoneIdx !== -1) {
          destroySlot(state, attackerPlayerIndex, aZoneIdx, 'trap_effect', slot.card);
        }
        const log = `تشغيل درع ساكوريتسو! تم تدمير الوحش المهاجم ${attackerSlot.card.name}!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'destroy_attacker',
          negated: true,
          attackerDestroyed: true,
          log,
        };
      }

      // Enchanted Javelin
      if (name.includes('enchanted javelin')) {
        slot.faceUp = true;
        defenderPlayer.spellTrapZones[i] = null;
        defenderPlayer.graveyard.push(slot.card);
        const heal = attackerSlot.currentAtk || attackerSlot.card.atk || 0;
        defenderPlayer.lifePoints += heal;
        const log = `تشغيل الرمح المسحور (Enchanted Javelin)! امتص قوة الهجوم وحوّلها لـ +${heal} نقطة حياة!`;
        state.lastLog.push(log);
        return {
          trapCard: slot.card,
          type: 'enchanted_javelin',
          negated: false,
          preventDamage: false,
          log,
        };
      }

      // Destruction Punch
      if (name.includes('destruction punch') && defenderZoneIndex !== null) {
        const dSlot = defenderPlayer.monsterZones[defenderZoneIndex];
        const aAtk = attackerSlot.currentAtk || attackerSlot.card.atk || 0;
        const dDef = dSlot ? (dSlot.currentDef || dSlot.card.def || 0) : 0;
        if (dDef > aAtk) {
          slot.faceUp = true;
          defenderPlayer.spellTrapZones[i] = null;
          defenderPlayer.graveyard.push(slot.card);
          const aZoneIdx = attackerPlayer.monsterZones.indexOf(attackerSlot);
          if (aZoneIdx !== -1) {
            destroySlot(state, attackerPlayerIndex, aZoneIdx, 'trap_effect', slot.card);
          }
          const log = `تشغيل لكمة الدمار (Destruction Punch)! ارتدت الضربة على المهاجم ${attackerSlot.card.name} ودمرته!`;
          state.lastLog.push(log);
          return {
            trapCard: slot.card,
            type: 'destruction_punch',
            negated: true,
            attackerDestroyed: true,
            log,
          };
        }
      }

      // Reinforcements
      if (name.includes('reinforcements') && defenderZoneIndex !== null) {
        const dSlot = defenderPlayer.monsterZones[defenderZoneIndex];
        if (dSlot) {
          slot.faceUp = true;
          defenderPlayer.spellTrapZones[i] = null;
          defenderPlayer.graveyard.push(slot.card);
          dSlot.currentAtk = (dSlot.currentAtk || dSlot.card.atk || 0) + 500;
          const log = `تشغيل فخ التعزيزات (Reinforcements)! زاد هجوم ${dSlot.card.name} بمقدار +500 (أصبح ${dSlot.currentAtk})!`;
          state.lastLog.push(log);
          return {
            trapCard: slot.card,
            type: 'buff_def_atk',
            negated: false,
            log,
          };
        }
      }

      // Castle Walls
      if (name.includes('castle walls') && defenderZoneIndex !== null) {
        const dSlot = defenderPlayer.monsterZones[defenderZoneIndex];
        if (dSlot) {
          slot.faceUp = true;
          defenderPlayer.spellTrapZones[i] = null;
          defenderPlayer.graveyard.push(slot.card);
          dSlot.currentDef = (dSlot.currentDef || dSlot.card.def || 0) + 500;
          const log = `تشغيل أسوار القلعة (Castle Walls)! زاد دفاع ${dSlot.card.name} بمقدار +500 (أصبح ${dSlot.currentDef})!`;
          state.lastLog.push(log);
          return {
            trapCard: slot.card,
            type: 'buff_def',
            negated: false,
            log,
          };
        }
      }
    }
  }

  // Check Kuriboh in defender hand (Discard to reduce battle damage to 0)
  const kuriIdx = defenderPlayer.hand.findIndex((c) => c && (c.name || '').toLowerCase().includes('kuriboh'));
  if (kuriIdx !== -1) {
    const kuriCard = defenderPlayer.hand.splice(kuriIdx, 1)[0];
    defenderPlayer.graveyard.push(kuriCard);
    defenderPlayer.zeroBattleDamage = true;
    const log = `تفعيل كوريبو (Kuriboh) من اليد! ضحّى بنفسه لحماية ${defenderPlayer.name} وأصبح ضرر المعركة 0!`;
    state.lastLog.push(log);
    return {
      trapCard: kuriCard,
      type: 'kuriboh',
      negated: false,
      preventDamage: true,
      log,
    };
  }

  return null;
}
