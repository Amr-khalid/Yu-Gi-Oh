/**
 * DamageCalculator.js
 * Pure JavaScript battle damage and attack resolving with official combat rules
 */

import { checkWinConditions } from './WinCondition.js';

export function executeDirectAttack(state, attackerPlayerIndex, attackerZoneIndex) {
  if (state.turnNumber === 1) {
    throw new Error('لا يمكن الهجوم في الدور الأول من المبارزة');
  }
  if (state.phase !== 'BATTLE_STEP') {
    throw new Error('لا يمكن الهجوم إلا في مرحلة المعركة (Battle Phase)');
  }

  const attackerPlayer = state.players[attackerPlayerIndex];
  const defenderPlayerIndex = 1 - attackerPlayerIndex;
  const defenderPlayer = state.players[defenderPlayerIndex];

  const attackerSlot = attackerPlayer.monsterZones[attackerZoneIndex];
  if (!attackerSlot) throw new Error('لا يوجد وحش في خانة الهجوم');

  if (attackerSlot.position !== 'face_up_attack') {
    throw new Error('الوحش في وضع الدفاع لا يمكنه شن هجوم');
  }
  if (attackerSlot.hasAttacked) {
    throw new Error('لقد شن هذا الوحش هجوماً بالفعل في هذا الدور');
  }

  const hasOpponentMonsters = defenderPlayer.monsterZones.some(m => m !== null);
  if (hasOpponentMonsters) {
    throw new Error('لا يمكن الهجوم المباشر على الخصم طالما توجد وحوش في ساحته');
  }

  const damage = attackerSlot.currentAtk;
  defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - damage);
  attackerSlot.hasAttacked = true;
  attackerSlot.canChangePosition = false;

  const log = `هجوم مباشر كاسر من ${attackerSlot.card.name}! تلقى ${defenderPlayer.name} ضرراً مباشراً قدره ${damage} نقطة.`;
  state.lastLog.push(log);

  checkWinConditions(state);

  return {
    state,
    result: {
      type: 'direct',
      attackerPlayerIndex,
      attackerZoneIndex,
      attackerDestroyed: false,
      defenderDestroyed: false,
      damage,
      damageToPlayerIndex: defenderPlayerIndex,
      log,
    },
  };
}

export function executeMonsterAttack(state, attackerPlayerIndex, attackerZoneIndex, defenderZoneIndex) {
  if (state.turnNumber === 1) {
    throw new Error('لا يمكن الهجوم في الدور الأول من المبارزة');
  }
  if (state.phase !== 'BATTLE_STEP') {
    throw new Error('لا يمكن الهجوم إلا في مرحلة المعركة (Battle Phase)');
  }

  const attackerPlayer = state.players[attackerPlayerIndex];
  const defenderPlayerIndex = 1 - attackerPlayerIndex;
  const defenderPlayer = state.players[defenderPlayerIndex];

  const attackerSlot = attackerPlayer.monsterZones[attackerZoneIndex];
  const defenderSlot = defenderPlayer.monsterZones[defenderZoneIndex];

  if (!attackerSlot) throw new Error('لا يوجد وحش مهاجم');
  if (!defenderSlot) throw new Error('لا يوجد وحش مدافع في هذه الخانة');

  if (attackerSlot.position !== 'face_up_attack') {
    throw new Error('الوحش في وضع الدفاع لا يمكنه شن هجوم');
  }
  if (attackerSlot.hasAttacked) {
    throw new Error('لقد شن هذا الوحش هجوماً بالفعل في هذا الدور');
  }

  attackerSlot.hasAttacked = true;
  attackerSlot.canChangePosition = false;

  // Flip face-up if attacked in face-down defense
  let wasFlipped = false;
  if (defenderSlot.position === 'face_down_defense') {
    defenderSlot.position = 'face_up_defense';
    wasFlipped = true;
    state.lastLog.push(`تم كشف وحش الخصم المقلوب: ${defenderSlot.card.name} (دفاع: ${defenderSlot.currentDef}).`);
  }

  let attackerDestroyed = false;
  let defenderDestroyed = false;
  let damage = 0;
  let damageToPlayerIndex = null;
  let isDefenseBlocked = false;
  let log = '';

  if (defenderSlot.position === 'face_up_attack') {
    // Attack vs Attack
    const diff = attackerSlot.currentAtk - defenderSlot.currentAtk;

    if (diff > 0) {
      defenderDestroyed = true;
      damage = diff;
      damageToPlayerIndex = defenderPlayerIndex;
      defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - damage);
      defenderPlayer.graveyard.push(defenderSlot.card);
      defenderPlayer.monsterZones[defenderZoneIndex] = null;
      log = `دمر ${attackerSlot.card.name} (${attackerSlot.currentAtk}) وحش الخصم ${defenderSlot.card.name} (${defenderSlot.currentAtk})! وتلقى ${defenderPlayer.name} ضرراً قدره ${damage}.`;
    } else if (diff < 0) {
      attackerDestroyed = true;
      damage = Math.abs(diff);
      damageToPlayerIndex = attackerPlayerIndex;
      attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - damage);
      attackerPlayer.graveyard.push(attackerSlot.card);
      attackerPlayer.monsterZones[attackerZoneIndex] = null;
      log = `رد الهجوم! دمر ${defenderSlot.card.name} (${defenderSlot.currentAtk}) المهاجم ${attackerSlot.card.name}! وتلقى ${attackerPlayer.name} ضرراً قدره ${damage}.`;
    } else {
      attackerDestroyed = true;
      defenderDestroyed = true;
      attackerPlayer.graveyard.push(attackerSlot.card);
      attackerPlayer.monsterZones[attackerZoneIndex] = null;
      defenderPlayer.graveyard.push(defenderSlot.card);
      defenderPlayer.monsterZones[defenderZoneIndex] = null;
      log = `تدمير متبادل! لتساوي قوة الهجوم، دمر كل من ${attackerSlot.card.name} و ${defenderSlot.card.name}.`;
    }
  } else {
    // Attack vs Defense
    const diff = attackerSlot.currentAtk - defenderSlot.currentDef;

    if (diff > 0) {
      defenderDestroyed = true;
      defenderPlayer.graveyard.push(defenderSlot.card);
      defenderPlayer.monsterZones[defenderZoneIndex] = null;
      log = `اخترق ${attackerSlot.card.name} (${attackerSlot.currentAtk}) دفاع ${defenderSlot.card.name} (${defenderSlot.currentDef}) وتم تدميره دون ضرر على نقاط الحياة.`;
    } else if (diff < 0) {
      isDefenseBlocked = true;
      damage = Math.abs(diff);
      damageToPlayerIndex = attackerPlayerIndex;
      attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - damage);
      log = `صد دفاعي! صد ${defenderSlot.card.name} (${defenderSlot.currentDef} دفاع) هجوم ${attackerSlot.card.name}! وتلقى المهاجم ارتداد ضرر قدره ${damage}.`;
    } else {
      isDefenseBlocked = true;
      log = `صد دفاعي متعادل! صمد الوحش المدافع (${defenderSlot.card.name}) دون تدمير أي بطاقة.`;
    }
  }

  state.lastLog.push(log);
  checkWinConditions(state);

  return {
    state,
    result: {
      type: 'monster',
      attackerPlayerIndex,
      attackerZoneIndex,
      defenderZoneIndex,
      attackerDestroyed,
      defenderDestroyed,
      isDefenseBlocked,
      wasFlipped,
      damage,
      damageToPlayerIndex,
      log,
    },
  };
}
