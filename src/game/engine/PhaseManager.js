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
      case 'STANDBY': return 'استعداد';
      case 'MAIN1': return 'المرحلة 1';
      case 'BATTLE_STEP': return 'المعركة';
      case 'MAIN2': return 'المرحلة 2';
      case 'END': return 'إنهاء';
      default: return phase;
    }
  }
  switch (phase) {
    case 'DRAW':
      return 'مرحلة السحب (Draw Phase)';
    case 'STANDBY':
      return 'مرحلة الاستعداد (Standby Phase)';
    case 'MAIN1':
      return 'المرحلة الرئيسية الأولى (Main Phase 1)';
    case 'BATTLE_STEP':
      return 'مرحلة المعركة والقتال (Battle Phase)';
    case 'MAIN2':
      return 'المرحلة الرئيسية الثانية (Main Phase 2)';
    case 'END':
      return 'مرحلة الإنهاء (End Phase)';
    default:
      return phase;
  }
}

export function canChangeToPhase(currentPhase, targetPhase, turnNumber = 2) {
  // In official Yu-Gi-Oh! rules, turn 1 player cannot enter the Battle Phase
  if (turnNumber === 1 && targetPhase === 'BATTLE_STEP') {
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
  const player = state.players[state.currentTurnPlayer];

  if (player.deck.length === 0) {
    state.winner = 1 - state.currentTurnPlayer;
    state.winReason = 'DECK_OUT';
    state.lastLog.push(`فراغ الدك! عجز ${player.name} عن سحب بطاقة، فانتصر الخصم.`);
    return state;
  }

  const drawnCard = player.deck.shift();
  player.hand.push(drawnCard);
  state.lastLog.push(`سحب ${player.name} بطاقة: ${drawnCard.name}.`);

  checkWinConditions(state);
  return state;
}

export function advancePhase(state, requestedPhase) {
  if (state.winner !== null) return state;

  const current = state.phase;

  if (requestedPhase) {
    if (requestedPhase === 'END') {
      state.phase = 'END';
      state.lastLog.push('مرحلة الإنهاء (End Phase)');
      return endTurn(state);
    }

    if (canChangeToPhase(current, requestedPhase, state.turnNumber)) {
      state.phase = requestedPhase;
      state.lastLog.push(getPhaseArabicName(requestedPhase));
      return state;
    }
  }

  // Sequential progression
  if (current === 'DRAW') {
    state.phase = 'MAIN1';
    state.lastLog.push('المرحلة الرئيسية الأولى (Main Phase 1)');
  } else if (current === 'MAIN1') {
    // If turn 1, battle phase is illegal -> advance to end turn
    if (state.turnNumber === 1) {
      state.lastLog.push('لا يمكن الدخول في مرحلة المعركة في الدور الأول، الانتقال إلى مرحلة الإنهاء.');
      return endTurn(state);
    }
    state.phase = 'BATTLE_STEP';
    state.lastLog.push('مرحلة المعركة والقتال (Battle Phase)');
  } else if (current === 'BATTLE_STEP') {
    state.phase = 'MAIN2';
    state.lastLog.push('المرحلة الرئيسية الثانية (Main Phase 2)');
  } else if (current === 'MAIN2' || current === 'END') {
    return endTurn(state);
  }

  return state;
}

export function endTurn(state) {
  state.currentTurnPlayer = 1 - state.currentTurnPlayer;
  state.turnNumber += 1;
  state.phase = 'DRAW';

  const newPlayer = state.players[state.currentTurnPlayer];
  newPlayer.normalSummonsRemaining = 1;

  for (const slot of newPlayer.monsterZones) {
    if (slot) {
      slot.hasAttacked = false;
      slot.canChangePosition = true;
    }
  }

  state.lastLog.push(`بدأ الدور ${state.turnNumber}: دور ${newPlayer.name}.`);

  drawCardForTurnPlayer(state);
  state.phase = 'MAIN1';

  return state;
}
