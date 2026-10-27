/**
 * DamageCalculator.js
 * Pure JavaScript battle damage and attack resolving with official combat rules
 */

import { checkWinConditions } from './WinCondition.js';
import { resolveMonsterEffect, isIndestructibleByBattle, isTrapNegated } from './MonsterEffects.js';
import { destroyMonsterSlot } from './CardResolver.js';
import { checkBattleTrap, isGravityBindActive } from './TrapEffects.js';

export function checkAttackTraps(state, attackerPlayerIndex, attackerSlot, defenderZoneIndex = null) {
  return checkBattleTrap(state, attackerPlayerIndex, attackerSlot, defenderZoneIndex, { destroyMonsterSlot });
}

export function isPiercingMonster(slot) {
  if (!slot || !slot.card) return false;
  const name = (slot.card.name || '').toLowerCase();
  const desc = (slot.card.description || slot.card.desc || '').toLowerCase();
  if (
    name.includes('dark driceratops') ||
    name.includes('spear dragon') ||
    name.includes('cyber end dragon') ||
    name.includes('ancient gear golem') ||
    name.includes('airknight parshath') ||
    name.includes('chimeratech') ||
    slot.hasFairyMeteorCrush ||
    (desc.includes('defense position') && (desc.includes('inflict') || desc.includes('difference')) && desc.includes('battle damage'))
  ) {
    return true;
  }
  return false;
}

export function canAttackDirectly(card) {
  if (!card) return false;
  const name = (card.name || '').toLowerCase();
  const desc = (card.description || card.desc || '').toLowerCase();
  if (
    name.includes('jinzo #7') ||
    name.includes('submarineroid') ||
    name.includes('sonic shooter') ||
    name.includes('inaba white rabbit') ||
    name.includes('raging flame sprite') ||
    name.includes('goblin black ops') ||
    name.includes('gear golem the moving fortress') ||
    desc.includes('can attack your opponent directly') ||
    desc.includes('attacks your opponent directly') ||
    desc.includes('may attack your opponent directly') ||
    desc.includes('can attack directly')
  ) {
    return true;
  }
  return false;
}

export function executeDirectAttack(state, attackerPlayerIndex, attackerZoneIndex) {
  const isAttackBlocked = state.turnNumber === 1;
  if (isAttackBlocked) {
    throw new Error('ماتقدرش تهجم في أول دور في الماتش');
  }
  if (state.phase !== 'BATTLE_STEP') {
    throw new Error('الهجوم في مرحلة المعركة بس');
  }

  const attackerPlayer = state.players[attackerPlayerIndex];
  const defenderPlayerIndex = 1 - attackerPlayerIndex;
  const defenderPlayer = state.players[defenderPlayerIndex];

  const attackerSlot = attackerPlayer.monsterZones[attackerZoneIndex];
  if (!attackerSlot) throw new Error('مافيش وحش في الخانة دي');

  if (attackerSlot.position !== 'face_up_attack') {
    throw new Error('الوحش في وضع الدفاع ومايقدرش يهجم');
  }
  if (attackerSlot.canAttack === false) {
    throw new Error('الوحش ده متكتف ومايقدرش يهجم');
  }
  if (attackerSlot.hasAttacked) {
    throw new Error('الوحش ده ضرب خلاص في الدور ده');
  }
  if (attackerSlot.card.level >= 4 && isGravityBindActive(state)) {
    throw new Error('رباط الجاذبية (Gravity Bind) مانع أي وحش ليفل 4 أو أعلى من الهجوم');
  }

  const hasOpponentMonsters = defenderPlayer.monsterZones.some(m => m !== null);
  if (hasOpponentMonsters && !canAttackDirectly(attackerSlot.card)) {
    throw new Error('ماتقدرش تضرب مباشر طول ما عند الخصم وحوش في الملعب');
  }

  attackerSlot.hasAttacked = true;
  attackerSlot.canChangePosition = false;

  const trap = checkAttackTraps(state, attackerPlayerIndex, attackerSlot, null);
  if (trap && trap.negated) {
    checkWinConditions(state);
    return {
      state,
      result: {
        type: 'direct',
        attackerPlayerIndex,
        attackerZoneIndex,
        attackerDestroyed: trap.attackerDestroyed || false,
        defenderDestroyed: false,
        damage: trap.damage || 0,
        damageToPlayerIndex: trap.damage ? attackerPlayerIndex : null,
        trapTriggered: trap,
        log: trap.log,
      },
    };
  }

  let damage = (attackerSlot.currentAtk !== undefined ? attackerSlot.currentAtk : attackerSlot.card?.atk) || 0;
  if ((trap && trap.preventDamage) || defenderPlayer.zeroBattleDamage) {
    damage = 0;
  }

  defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - damage);

  const log = damage > 0
    ? `ضربة مباشرة قوية من ${attackerSlot.card.name}! ${defenderPlayer.name} اتخصم منه ${damage} نقطة حياة.`
    : `${attackerSlot.card.name} ضرب ضربة مباشرة بس الضرر اتمنع وما أثّرش!`;
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
      damageToPlayerIndex: damage > 0 ? defenderPlayerIndex : null,
      trapTriggered: trap || null,
      log,
    },
  };
}

export function executeMonsterAttack(state, attackerPlayerIndex, attackerZoneIndex, defenderZoneIndex) {
  const isAttackBlocked = state.turnNumber === 1;
  if (isAttackBlocked) {
    throw new Error('ماتقدرش تهجم في أول دور في الماتش');
  }
  if (state.phase !== 'BATTLE_STEP') {
    throw new Error('الهجوم في مرحلة المعركة بس');
  }

  const attackerPlayer = state.players[attackerPlayerIndex];
  const defenderPlayerIndex = 1 - attackerPlayerIndex;
  const defenderPlayer = state.players[defenderPlayerIndex];

  const attackerSlot = attackerPlayer.monsterZones[attackerZoneIndex];
  const defenderSlot = defenderPlayer.monsterZones[defenderZoneIndex];

  if (!attackerSlot) throw new Error('مافيش وحش يضرب');
  if (!defenderSlot) throw new Error('مافيش وحش مدافع في الخانة دي');

  if (attackerSlot.position !== 'face_up_attack') {
    throw new Error('الوحش في وضع الدفاع ومايقدرش يهجم');
  }
  if (attackerSlot.canAttack === false) {
    throw new Error('الوحش ده متكتف ومايقدرش يهجم');
  }
  if (attackerSlot.hasAttacked) {
    throw new Error('الوحش ده ضرب خلاص في الدور ده');
  }

  attackerSlot.hasAttacked = true;
  attackerSlot.canChangePosition = false;

  const trap = checkAttackTraps(state, attackerPlayerIndex, attackerSlot, defenderZoneIndex);
  if (trap && trap.negated) {
    checkWinConditions(state);
    return {
      state,
      result: {
        type: 'monster',
        attackerPlayerIndex,
        attackerZoneIndex,
        defenderZoneIndex,
        attackerDestroyed: trap.attackerDestroyed || false,
        defenderDestroyed: false,
        isDefenseBlocked: false,
        wasFlipped: false,
        damage: trap.damage || 0,
        damageToPlayerIndex: trap.damage ? attackerPlayerIndex : null,
        trapTriggered: trap,
        log: trap.log,
      },
    };
  }

  // Flip face-up if attacked in face-down defense
  let wasFlipped = false;
  if (defenderSlot.position === 'face_down_defense') {
    defenderSlot.position = 'face_up_defense';
    wasFlipped = true;
    state.lastLog.push(`اتكشف وحش الخصم المقلوب: ${defenderSlot.card.name} (دفاعه: ${defenderSlot.currentDef}).`);
    if (defenderSlot.card.subType === 'effect') {
      resolveMonsterEffect(state, defenderPlayerIndex, defenderSlot.card, 'flip', {
        wasAttacked: true,
        attackerSlot,
        attackerPlayerIndex,
        defenderZoneIndex,
        destroyMonster: destroyMonsterSlot,
      });
    }
  }

  let attackerDestroyed = false;
  let defenderDestroyed = false;
  let damage = 0;
  let damageToPlayerIndex = null;
  let isDefenseBlocked = false;
  let isDefenseShatter = false;
  let log = '';

  if (defenderSlot.position === 'face_up_attack') {
    // Attack vs Attack
    const diff = attackerSlot.currentAtk - defenderSlot.currentAtk;

    if (diff > 0) {
      damage = (trap?.preventDamage || defenderPlayer.zeroBattleDamage) ? 0 : diff;
      damageToPlayerIndex = damage > 0 ? defenderPlayerIndex : null;
      if (damage > 0) defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - damage);
      const res = destroyMonsterSlot(state, defenderPlayerIndex, defenderZoneIndex, 'battle', attackerSlot.card);
      defenderDestroyed = res !== null;
      log = `وحش ${attackerSlot.card.name} (${attackerSlot.currentAtk}) دمّر ${defenderSlot.card.name} (${defenderSlot.currentAtk})! ${damage > 0 ? `وخصم ${damage} من نقاط حياة ${defenderPlayer.name}.` : ''}`;
    } else if (diff < 0) {
      damage = (trap?.preventDamage || attackerPlayer.zeroBattleDamage) ? 0 : Math.abs(diff);
      damageToPlayerIndex = damage > 0 ? attackerPlayerIndex : null;
      if (damage > 0) attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - damage);
      const res = destroyMonsterSlot(state, attackerPlayerIndex, attackerZoneIndex, 'battle', defenderSlot.card);
      attackerDestroyed = res !== null;
      log = `الهجوم اترد! ${defenderSlot.card.name} (${defenderSlot.currentAtk}) دمّر المهاجم ${attackerSlot.card.name}! ${damage > 0 ? `وخصم ${damage} من نقاط حياة ${attackerPlayer.name}.` : ''}`;
    } else {
      const resA = destroyMonsterSlot(state, attackerPlayerIndex, attackerZoneIndex, 'battle', defenderSlot.card);
      const resD = destroyMonsterSlot(state, defenderPlayerIndex, defenderZoneIndex, 'battle', attackerSlot.card);
      attackerDestroyed = resA !== null;
      defenderDestroyed = resD !== null;
      log = `الاتنين دمّروا بعض! علشان قوة الهجوم متساوية، مات ${attackerSlot.card.name} و ${defenderSlot.card.name}.`;
    }
  } else {
    // Attack vs Defense
    const diff = attackerSlot.currentAtk - defenderSlot.currentDef;

    if (diff > 0) {
      isDefenseShatter = true;
      const res = destroyMonsterSlot(state, defenderPlayerIndex, defenderZoneIndex, 'battle', attackerSlot.card);
      defenderDestroyed = res !== null;
      const isPiercing = isPiercingMonster(attackerSlot);
      if (isPiercing) {
        damage = (trap?.preventDamage || defenderPlayer.zeroBattleDamage) ? 0 : diff;
        damageToPlayerIndex = damage > 0 ? defenderPlayerIndex : null;
        if (damage > 0) defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - damage);
        log = `اخترق ${attackerSlot.card.name} (${attackerSlot.currentAtk}) دفاع ${defenderSlot.card.name} (${defenderSlot.currentDef}) بضرر خارق وخصم ${damage} نقطة من حياة ${defenderPlayer.name}!`;
      } else {
        log = `اخترق ${attackerSlot.card.name} (${attackerSlot.currentAtk}) دفاع ${defenderSlot.card.name} (${defenderSlot.currentDef}) ودمّره من غير خصم نقاط حياة.`;
      }
    } else if (diff < 0) {
      isDefenseBlocked = true;
      damage = (trap?.preventDamage || attackerPlayer.zeroBattleDamage) ? 0 : Math.abs(diff);
      damageToPlayerIndex = damage > 0 ? attackerPlayerIndex : null;
      if (damage > 0) attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - damage);
      log = `صدة دفاع قوية! صد ${defenderSlot.card.name} (${defenderSlot.currentDef} دفاع) ضربة ${attackerSlot.card.name}! ${damage > 0 ? `والمهاجم اتخصم منه ${damage} نقطة حياة ارتداد.` : ''}`;
    } else {
      isDefenseBlocked = true;
      log = `صدة دفاع متساوية! صمد الوحش المدافع (${defenderSlot.card.name}) ومافيش حد اتدمّر.`;
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
      isDefenseShatter,
      wasFlipped,
      damage,
      damageToPlayerIndex,
      log,
    },
  };
}
