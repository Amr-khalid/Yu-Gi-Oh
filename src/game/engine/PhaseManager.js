/**
 * PhaseManager.js
 * Pure JavaScript phase progression and turn cycle management
 */

import { checkWinConditions } from './WinCondition.js';

export const PHASE_ORDER = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE_STEP', 'MAIN2', 'END'];

export function getPhaseArabicName(phase, concise = false) {
  if (concise) {
    switch (phase) {
      case 'DRAW': return 'سحب';
      case 'STANDBY': return 'تجهيز';
      case 'MAIN1': return 'المرحلة 1';
      case 'BATTLE_STEP': return 'الهجوم';
      case 'MAIN2': return 'المرحلة 2';
      case 'END': return 'إنهاء الدور';
      default: return phase;
    }
  }
  switch (phase) {
    case 'DRAW':
      return 'سحب كارت (Draw Phase)';
    case 'STANDBY':
      return 'تجهيز واستعداد (Standby Phase)';
    case 'MAIN1':
      return 'المرحلة الأولى (Main Phase 1)';
    case 'BATTLE_STEP':
      return 'وقت الهجوم والمعركة (Battle Phase)';
    case 'MAIN2':
      return 'المرحلة التانية (Main Phase 2)';
    case 'END':
      return 'إنهاء الدور (End Phase)';
    default:
      return phase;
  }
}

export function canChangeToPhase(currentPhase, targetPhase, turnNumber = 2, isTagMode = false) {
  // In official rules, only opening Turn 1 cannot attack. Starting from Turn 2 (opponent's first turn), attack is allowed!
  const isAttackBlocked = turnNumber === 1;
  if (isAttackBlocked && targetPhase === 'BATTLE_STEP') {
    return false;
  }

  if (currentPhase === 'MAIN1') {
    return targetPhase === 'BATTLE_STEP' || targetPhase === 'END' || targetPhase === 'MAIN2';
  }
  if (currentPhase === 'BATTLE_STEP') {
    return targetPhase === 'MAIN2' || targetPhase === 'END';
  }
  if (currentPhase === 'MAIN2') {
    return targetPhase === 'END';
  }
  return false;
}

export function drawCardForTurnPlayer(state) {
  const isTagSequential = state.isTagMode && (state.tagSettings?.turnFlow === 'tag_sequential' || state.turnFlow === 'tag_sequential');

  if (isTagSequential) {
    const activeSlot = typeof state.tagActiveSlot === 'number' ? state.tagActiveSlot : 0;
    const deviceTeam = typeof state.deviceTeam === 'number' ? state.deviceTeam : 0;
    const activeTeam = activeSlot < 2 ? 0 : 1;
    const isLocalTeamActive = activeTeam === deviceTeam;
    const targetPlayer = isLocalTeamActive ? state.players[0] : state.players[1];

    if (!targetPlayer) return state;

    // Leader draws (Slot 0 for Team 0, Slot 2 for Team 1)
    if (activeSlot === 0 || activeSlot === 2) {
      if (targetPlayer.deck && targetPlayer.deck.length > 0) {
        const drawnCard = targetPlayer.deck.shift();
        if (!targetPlayer.hand) targetPlayer.hand = [];
        targetPlayer.hand.push(drawnCard);
        state.lastLog.push(`${targetPlayer.name} سحب كارت: ${drawnCard.name}.`);
      }
    }
    // Teammate draws (Slot 1 for Team 0, Slot 3 for Team 1)
    else if (activeSlot === 1 || activeSlot === 3) {
      if (targetPlayer.teammateDeck && targetPlayer.teammateDeck.length > 0) {
        const tmCard = targetPlayer.teammateDeck.shift();
        if (!targetPlayer.teammateHand) targetPlayer.teammateHand = [];
        targetPlayer.teammateHand.push(tmCard);
        state.lastLog.push(`وسحب الزميل (${targetPlayer.teammateName || 'الزميل'}) كارت: ${tmCard.name}.`);
      }
    }
  } else {
    const player = state.players[state.currentTurnPlayer];
    if (!player) return state;

    if (player.deck.length === 0) {
      state.winner = 1 - state.currentTurnPlayer;
      state.winReason = 'DECK_OUT';
      state.lastLog.push(`كروت المجموعة خلصت! ${player.name} ما عرفش يسحب كارت، فخسر الماتش.`);
      return state;
    }

    const drawnCard = player.deck.shift();
    player.hand.push(drawnCard);
    state.lastLog.push(`${player.name} سحب كارت: ${drawnCard.name}.`);

    // In Simultaneous Tag Mode, teammate also draws a card for their hand
    if (state.isTagMode && player.teammateDeck && player.teammateDeck.length > 0) {
      const tmCard = player.teammateDeck.shift();
      if (!player.teammateHand) player.teammateHand = [];
      player.teammateHand.push(tmCard);
      state.lastLog.push(`وسحب الزميل (${player.teammateName || 'الزميل'}) كارت: ${tmCard.name}.`);
    }
  }

  checkWinConditions(state);
  return state;
}

export function advancePhase(state, requestedPhase) {
  if (state.winner !== null) return state;

  const current = state.phase;

  if (requestedPhase) {
    if (requestedPhase === 'END') {
      state.phase = 'END';
      state.lastLog.push('تسليم وإنهاء الدور');
      return endTurn(state);
    }

    if (canChangeToPhase(current, requestedPhase, state.turnNumber, state.isTagMode)) {
      state.phase = requestedPhase;
      state.lastLog.push(getPhaseArabicName(requestedPhase));
      return state;
    }
  }

  // Sequential progression
  if (current === 'DRAW') {
    state.phase = 'MAIN1';
    state.lastLog.push('المرحلة الأولى (Main Phase 1)');
  } else if (current === 'MAIN1') {
    // If opening Turn 1 of match, battle phase is illegal -> advance to end turn
    const isFirstTurnAttackBlocked = state.turnNumber === 1;
    if (isFirstTurnAttackBlocked) {
      state.lastLog.push('ماتقدرش تهجم في أول دور في الماتش، الدور هيتنقل لإنهاء الدور.');
      return endTurn(state);
    }
    state.phase = 'BATTLE_STEP';
    state.lastLog.push('مرحلة الهجوم والمعركة (Battle Phase)');
  } else if (current === 'BATTLE_STEP') {
    state.phase = 'MAIN2';
    state.lastLog.push('المرحلة التانية (Main Phase 2)');
  } else if (current === 'MAIN2' || current === 'END') {
    return endTurn(state);
  }

  return state;
}

export function endTurn(state) {
  // Handle Swords of Revealing Light countdown on opponent turn end
  if (state.swordsOfRevealingLight && state.swordsOfRevealingLight.active) {
    if (state.swordsOfRevealingLight.playerIndex !== state.currentTurnPlayer) {
      state.swordsOfRevealingLight.turnsRemaining -= 1;
      if (state.swordsOfRevealingLight.turnsRemaining <= 0) {
        state.swordsOfRevealingLight.active = false;
        state.swordsOfRevealingLight = null;
        state.lastLog.push('انتهى مفعول سيوف النور الكاشف وتلاشت من الساحة!');
      } else {
        state.lastLog.push(`سيوف النور الكاشف: باقي ${state.swordsOfRevealingLight.turnsRemaining} أدوار لمنع هجوم الخصم.`);
      }
    }
  }
  const isTagSequential = state.isTagMode && (state.tagSettings?.turnFlow === 'tag_sequential' || state.turnFlow === 'tag_sequential');

  if (isTagSequential) {
    const ROTATION = [0, 2, 1, 3];
    const currentSlot = typeof state.tagActiveSlot === 'number' ? state.tagActiveSlot : 0;
    const currIdx = ROTATION.indexOf(currentSlot);
    const nextIdx = (currIdx + 1) % ROTATION.length;
    const nextSlot = ROTATION[nextIdx];
    state.tagActiveSlot = nextSlot;

    const activeTeam = nextSlot < 2 ? 0 : 1;
    const deviceTeam = typeof state.deviceTeam === 'number' ? state.deviceTeam : 0;
    state.currentTurnPlayer = (activeTeam === deviceTeam) ? 0 : 1;
    state.turnNumber += 1;
    state.phase = 'DRAW';

    const newPlayer = state.players[state.currentTurnPlayer];
    if (newPlayer) {
      newPlayer.normalSummonsRemaining = 1;
    }

    const slotNames = [
      state.players[0]?.name || 'المستضيف',
      state.players[0]?.teammateName || 'الزميل',
      state.players[1]?.name || 'المنافس',
      state.players[1]?.teammateName || 'المنافس الثاني'
    ];
    state.lastLog.push(`بدأ الدور ${state.turnNumber}: دور [${slotNames[nextSlot] || newPlayer?.name || 'اللاعب التالي'}].`);
  } else {
    state.currentTurnPlayer = 1 - state.currentTurnPlayer;
    state.turnNumber += 1;
    state.phase = 'DRAW';

    const newPlayer = state.players[state.currentTurnPlayer];
    if (newPlayer) {
      newPlayer.normalSummonsRemaining = state.isTagMode ? 2 : 1;
    }

    state.lastLog.push(`بدأ الدور ${state.turnNumber}: دلوقتي دور ${newPlayer?.name || 'اللاعب التالي'}.`);
  }

  // Reset per-turn damage shields (such as Winged Kuriboh)
  if (Array.isArray(state.players)) {
    state.players.forEach((p) => {
      if (p) p.zeroBattleDamage = false;
    });
  }

  // Reset hasAttacked for all monsters across all players
  if (Array.isArray(state.players)) {
    for (const p of state.players) {
      if (p && Array.isArray(p.monsterZones)) {
        for (const slot of p.monsterZones) {
          if (slot) {
            slot.hasAttacked = false;
            slot.hasUsedEffectThisTurn = false;
          }
        }
      }
    }
  }

  // Allow position changes for active player's monsters
  const activePlayer = state.players?.[state.currentTurnPlayer];
  if (activePlayer && Array.isArray(activePlayer.monsterZones)) {
    for (const slot of activePlayer.monsterZones) {
      if (slot && slot.canAttack !== false) {
        slot.canChangePosition = true;
      }
    }
  }


  // Continuous turn-based effects that trigger every turn
  // 1. Nightmare Wheel: 500 damage to trapped opponent every turn
  if (Array.isArray(state.players)) {
    state.players.forEach((p, pIdx) => {
      if (p && Array.isArray(p.spellTrapZones)) {
        p.spellTrapZones.forEach((st) => {
          if (st && st.faceUp && (st.card?.name || '').toLowerCase().includes('nightmare wheel')) {
            const opp = state.players[1 - pIdx];
            if (opp) {
              opp.lifePoints = Math.max(0, opp.lifePoints - 500);
              state.lastLog.push(`فخ عجلة الكابوس (Nightmare Wheel): سبّب 500 ضرر مباشر لـ ${opp.name} في هذا الدور!`);
            }
          }
        });
      }
    });
  }

  // 2. Burning Land: 500 burn to both players every turn
  if (Array.isArray(state.players)) {
    let hasBurningLand = false;
    state.players.forEach((p) => {
      if (p && Array.isArray(p.spellTrapZones)) {
        if (p.spellTrapZones.some((st) => st && st.faceUp && (st.card?.name || '').toLowerCase().includes('burning land'))) {
          hasBurningLand = true;
        }
      }
    });
    if (hasBurningLand) {
      state.players.forEach((p) => {
        if (p) p.lifePoints = Math.max(0, p.lifePoints - 500);
      });
      state.lastLog.push('الأرض المحترقة (Burning Land): سبّبت 500 ضرر لكلا اللاعبين في هذا الدور!');
    }
  }

  // 3. Lava Golem: Controller takes 1000 burn at turn start
  const currentActiveTurnPlayer = state.players?.[state.currentTurnPlayer];
  if (currentActiveTurnPlayer && Array.isArray(currentActiveTurnPlayer.monsterZones)) {
    for (const m of currentActiveTurnPlayer.monsterZones) {
      if (m && (m.card?.name || '').toLowerCase().includes('lava golem')) {
        currentActiveTurnPlayer.lifePoints = Math.max(0, currentActiveTurnPlayer.lifePoints - 1000);
        state.lastLog.push(`غول الحمم البركانية (Lava Golem): أحرق نقاط حياة ${currentActiveTurnPlayer.name} بـ 1000 ضرر في هذا الدور!`);
      }
    }
  }

  // 4. Wave-Motion Cannon: accumulates +1000 damage each turn
  if (Array.isArray(state.players)) {
    state.players.forEach((p) => {
      if (p && Array.isArray(p.spellTrapZones)) {
        p.spellTrapZones.forEach((st) => {
          if (st && st.faceUp && (st.card?.name || '').toLowerCase().includes('wave-motion cannon')) {
            st.turnsCharged = (st.turnsCharged || 0) + 1;
            state.lastLog.push(`مدفع الحركة الموجية: شحن دور إضافي (الضرر المجمّع: ${st.turnsCharged * 1000})!`);
          }
        });
      }
    });
  }

  drawCardForTurnPlayer(state);
  state.phase = 'MAIN1';

  return state;
}
