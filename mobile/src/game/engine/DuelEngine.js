/**
 * DuelEngine.js
 * Master duel controller in pure JavaScript
 */

import { createInitialGameState, cloneGameState } from './GameState.js';
import { advancePhase, endTurn, drawCardForTurnPlayer } from './PhaseManager.js';
import { executeMonsterAttack, executeDirectAttack } from './DamageCalculator.js';
import { normalSummon, changeMonsterPosition, setSpellTrap, activateSpell } from './CardResolver.js';

export class DuelEngine {
  constructor(p0Deck, p1Deck, p0Name = 'يوجي', p1Name = 'سيتو كايبا', seed, startingPlayer = 0) {
    this.state = createInitialGameState(p0Deck, p1Deck, p0Name, p1Name, seed, startingPlayer);
    drawCardForTurnPlayer(this.state);
    this.state.phase = 'MAIN1';
    this.listeners = [];
    this.attackListeners = [];
    this.spellListeners = [];
    this.tributeListeners = [];
  }

  getState() {
    return cloneGameState(this.state);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  onAttack(listener) {
    this.attackListeners.push(listener);
    return () => {
      this.attackListeners = this.attackListeners.filter(l => l !== listener);
    };
  }

  notifyAttack(data) {
    for (const listener of this.attackListeners) {
      try {
        listener(data);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onSpell(listener) {
    this.spellListeners.push(listener);
    return () => {
      this.spellListeners = this.spellListeners.filter(l => l !== listener);
    };
  }

  notifySpell(data) {
    for (const listener of this.spellListeners) {
      try {
        listener(data);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onTribute(listener) {
    this.tributeListeners.push(listener);
    return () => {
      this.tributeListeners = this.tributeListeners.filter(l => l !== listener);
    };
  }

  notifyTribute(data) {
    for (const listener of this.tributeListeners) {
      try {
        listener(data);
      } catch (e) {
        console.error(e);
      }
    }
  }

  notify() {
    const copy = this.getState();
    for (const listener of this.listeners) {
      listener(copy);
    }
  }

  normalSummon(handIndex, zoneIndex, position = 'face_up_attack', tributes = []) {
    const card = this.state.players[this.state.currentTurnPlayer]?.hand[handIndex];
    const res = normalSummon(this.state, this.state.currentTurnPlayer, handIndex, zoneIndex, position, tributes);
    if (res && res.requiredTributes > 0) {
      this.notifyTribute({
        playerIndex: this.state.currentTurnPlayer,
        targetZone: res.targetZone,
        requiredTributes: res.requiredTributes,
        tributedNames: res.tributedNames,
        card,
      });
    }
    this.notify();
    return res;
  }

  setMonster(handIndex, zoneIndex) {
    return this.normalSummon(handIndex, zoneIndex, 'face_down_defense', []);
  }

  changePosition(zoneIndex) {
    changeMonsterPosition(this.state, this.state.currentTurnPlayer, zoneIndex);
    this.notify();
  }

  setSpellTrap(handIndex, zoneIndex) {
    setSpellTrap(this.state, this.state.currentTurnPlayer, handIndex, zoneIndex);
    this.notify();
  }

  activateSpell(handIndex, targetContext = null) {
    const currentPlayer = this.state.currentTurnPlayer;
    const res = activateSpell(this.state, currentPlayer, handIndex, targetContext);
    if (res && res.effectMeta) {
      this.notifySpell({
        playerIndex: currentPlayer,
        spellCard: res.spellCard,
        effectMeta: res.effectMeta,
      });
    }
    this.notify();
    return res;
  }

  declareAttack(attackerZone, targetZone) {
    const attackerCard = this.state.players[this.state.currentTurnPlayer].monsterZones[attackerZone]?.card;
    const defenderCard = this.state.players[1 - this.state.currentTurnPlayer].monsterZones[targetZone]?.card;
    const { result } = executeMonsterAttack(
      this.state,
      this.state.currentTurnPlayer,
      attackerZone,
      targetZone
    );
    this.notifyAttack({
      attackerPlayer: this.state.currentTurnPlayer,
      attackerZone,
      targetZone,
      isDirect: false,
      damage: result.damage,
      isDefenseBlocked: result.isDefenseBlocked,
      damagePlayerIdx: result.damageToPlayerIndex,
      attackerAttribute: attackerCard?.attribute || 'PHARAOH',
      defenderAttribute: defenderCard?.attribute || 'PHARAOH',
    });
    this.notify();
    return result;
  }

  directAttack(attackerZone) {
    const attackerCard = this.state.players[this.state.currentTurnPlayer].monsterZones[attackerZone]?.card;
    const { result } = executeDirectAttack(
      this.state,
      this.state.currentTurnPlayer,
      attackerZone
    );
    this.notifyAttack({
      attackerPlayer: this.state.currentTurnPlayer,
      attackerZone,
      targetZone: 0,
      isDirect: true,
      damage: result.damage,
      isDefenseBlocked: false,
      damagePlayerIdx: 1 - this.state.currentTurnPlayer,
      attackerAttribute: attackerCard?.attribute || 'PHARAOH',
      defenderAttribute: 'PHARAOH',
    });
    this.notify();
    return result;
  }

  advancePhase(targetPhase) {
    advancePhase(this.state, targetPhase);
    this.notify();
  }

  endTurn() {
    endTurn(this.state);
    this.notify();
  }

  surrender(playerIndex) {
    this.state.winner = 1 - playerIndex;
    this.state.winReason = 'SURRENDER';
    this.state.lastLog.push(`استسلم المبارز ${this.state.players[playerIndex].name}.`);
    this.notify();
  }
}
