/**
 * DuelEngine.js
 * Master duel controller in pure JavaScript
 */

import { createInitialGameState, cloneGameState } from './GameState.js';
import { advancePhase, endTurn, drawCardForTurnPlayer } from './PhaseManager.js';
import { executeMonsterAttack, executeDirectAttack } from './DamageCalculator.js';
import { normalSummon, changeMonsterPosition, setSpellTrap, activateSpell, activateSetCard } from './CardResolver.js';

export class DuelEngine {
  constructor(
    p0Deck,
    p1Deck,
    p0Name = 'يوجي',
    p1Name = 'سيتو كايبا',
    seed,
    startingPlayer = 0,
    isTagMode = false,
    tagConfig = null
  ) {
    this.state = createInitialGameState(p0Deck, p1Deck, p0Name, p1Name, seed, startingPlayer, isTagMode, tagConfig);
    this.state.onMonsterEffectTriggered = (data) => this.notifyMonsterEffect(data);
    drawCardForTurnPlayer(this.state);
    this.state.phase = 'MAIN1';
    this.listeners = [];
    this.attackListeners = [];
    this.spellListeners = [];
    this.tributeListeners = [];
    this.summonListeners = [];
    this.turnEndListeners = [];
    this.monsterEffectListeners = [];
  }

  switchActiveHand(playerIndex = 0) {
    const player = this.state.players[playerIndex];
    if (!player) return;
    const temp = player.hand || [];
    player.hand = player.teammateHand || [];
    player.teammateHand = temp;
    player.activeHandType = player.activeHandType === 'teammate' ? 'mine' : 'teammate';
    this.state.lastLog.push(
      `قام ${player.name} بتبديل اليد النشطة إلى [${player.activeHandType === 'teammate' ? 'يد الزميل' : 'يد القائد'}].`
    );
    this.notify();
    return player.activeHandType;
  }

  normalSummonFromTeammate(handIndex, zoneIndex, position = 'face_up_attack', tributes = []) {
    const playerIndex = this.state.currentTurnPlayer;
    const player = this.state.players[playerIndex];
    if (!player) return;
    const originalHand = player.hand;
    player.hand = player.teammateHand || [];
    let res;
    try {
      res = this.normalSummon(handIndex, zoneIndex, position, tributes);
    } finally {
      player.teammateHand = player.hand;
      player.hand = originalHand;
      this.notify();
    }
    return res;
  }

  setSpellTrapFromTeammate(handIndex, zoneIndex) {
    const playerIndex = this.state.currentTurnPlayer;
    const player = this.state.players[playerIndex];
    if (!player) return;
    const originalHand = player.hand;
    player.hand = player.teammateHand || [];
    try {
      this.setSpellTrap(handIndex, zoneIndex);
    } finally {
      player.teammateHand = player.hand;
      player.hand = originalHand;
      this.notify();
    }
  }

  activateSpellFromTeammate(handIndex, targetContext = null) {
    const playerIndex = this.state.currentTurnPlayer;
    const player = this.state.players[playerIndex];
    if (!player) return;
    const originalHand = player.hand;
    player.hand = player.teammateHand || [];
    let res;
    try {
      res = this.activateSpell(handIndex, targetContext);
    } finally {
      player.teammateHand = player.hand;
      player.hand = originalHand;
      this.notify();
    }
    return res;
  }

  applyTagFieldAction({ targetTeam = 0, action, card, zoneIndex, position = 'face_up_attack', tributes = [] }) {
    const player = this.state.players[targetTeam];
    if (!player || !card) return;

    if (action === 'SUMMON' || action === 'SET_MONSTER') {
      if (Array.isArray(tributes)) {
        for (const tZone of tributes) {
          const tSlot = player.monsterZones[tZone];
          if (tSlot) {
            player.graveyard.push(tSlot.card);
            player.monsterZones[tZone] = null;
          }
        }
      }

      if (targetTeam === 0 && Array.isArray(player.teammateHand)) {
        const foundIdx = player.teammateHand.findIndex(c => c && (c.id === card.id || c.name === card.name));
        if (foundIdx !== -1) {
          player.teammateHand.splice(foundIdx, 1);
        }
      } else if (targetTeam === 1 && Array.isArray(player.hand)) {
        player.hand.splice(0, 1);
      }

      const actualZone = (zoneIndex !== null && zoneIndex !== undefined && player.monsterZones[zoneIndex] === null)
        ? zoneIndex
        : player.monsterZones.findIndex(z => z === null);

      if (actualZone !== -1) {
        player.monsterZones[actualZone] = {
          card,
          position: position || (action === 'SET_MONSTER' ? 'face_down_defense' : 'face_up_attack'),
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: this.state.turnNumber,
          currentAtk: card.atk ?? 0,
          currentDef: card.def ?? 0,
        };
        player.normalSummonsRemaining = Math.max(0, (player.normalSummonsRemaining ?? 2) - 1);

        this.notifySummon({
          playerIndex: targetTeam,
          zoneIndex: actualZone,
          card,
          position: position || 'face_up_attack',
          isMonster: true,
          isSet: position === 'face_down_defense' || action === 'SET_MONSTER',
          actionType: (position === 'face_down_defense' || action === 'SET_MONSTER') ? 'set_monster' : (tributes.length > 0 ? 'tribute_summon' : 'summon'),
        });
      }
    } else if (action === 'SET_SPELL_TRAP') {
      const actualZone = (zoneIndex !== null && zoneIndex !== undefined && player.spellTrapZones[zoneIndex] === null)
        ? zoneIndex
        : player.spellTrapZones.findIndex(z => z === null);

      if (actualZone !== -1) {
        if (targetTeam === 0 && Array.isArray(player.teammateHand)) {
          const foundIdx = player.teammateHand.findIndex(c => c && (c.id === card.id || c.name === card.name));
          if (foundIdx !== -1) player.teammateHand.splice(foundIdx, 1);
        } else if (targetTeam === 1 && Array.isArray(player.hand)) {
          player.hand.splice(0, 1);
        }

        player.spellTrapZones[actualZone] = {
          card,
          isSet: true,
          position: 'face_down',
          turnSet: this.state.turnNumber,
        };
      }
    } else if (action === 'ACTIVATE_SPELL') {
      player.graveyard.push(card);
      if (targetTeam === 0 && Array.isArray(player.teammateHand)) {
        const foundIdx = player.teammateHand.findIndex(c => c && (c.id === card.id || c.name === card.name));
        if (foundIdx !== -1) player.teammateHand.splice(foundIdx, 1);
      }
      this.state.lastLog.push(`فعّل ${player.name} بطاقة السحر: ${card.name}!`);
    }

    this.notify();
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

  onSummon(listener) {
    this.summonListeners.push(listener);
    return () => {
      this.summonListeners = this.summonListeners.filter(l => l !== listener);
    };
  }

  notifySummon(data) {
    for (const listener of this.summonListeners) {
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

  onTurnEnd(listener) {
    this.turnEndListeners.push(listener);
    return () => {
      this.turnEndListeners = this.turnEndListeners.filter(l => l !== listener);
    };
  }

  notifyTurnEnd(data) {
    for (const listener of this.turnEndListeners) {
      try {
        listener(data);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onMonsterEffect(listener) {
    this.monsterEffectListeners.push(listener);
    return () => {
      this.monsterEffectListeners = this.monsterEffectListeners.filter(l => l !== listener);
    };
  }

  notifyMonsterEffect(data) {
    for (const listener of this.monsterEffectListeners) {
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
    const playerIndex = this.state.currentTurnPlayer;
    const card = this.state.players[playerIndex]?.hand[handIndex];
    const res = normalSummon(this.state, playerIndex, handIndex, zoneIndex, position, tributes);
    if (res && res.requiredTributes > 0) {
      this.notifyTribute({
        playerIndex,
        targetZone: res.targetZone,
        requiredTributes: res.requiredTributes,
        tributedNames: res.tributedNames,
        card,
      });
    }
    if (res) {
      const actualZone = res.targetZone !== undefined ? res.targetZone : zoneIndex;
      this.notifySummon({
        playerIndex,
        zoneIndex: actualZone,
        card,
        position,
        isMonster: true,
        isSet: position === 'face_down_defense',
        actionType: position === 'face_down_defense' ? 'set_monster' : (tributes.length > 0 ? 'tribute_summon' : 'summon'),
      });
    }
    this.notify();
    return res;
  }

  setMonster(handIndex, zoneIndex) {
    return this.normalSummon(handIndex, zoneIndex, 'face_down_defense', []);
  }

  changePosition(zoneIndex, context = {}, playerIndex = null) {
    const pIdx = playerIndex !== null ? playerIndex : this.state.currentTurnPlayer;
    const res = changeMonsterPosition(this.state, pIdx, zoneIndex, context);
    this.notify();
    return res;
  }

  setSpellTrap(handIndex, zoneIndex) {
    const playerIndex = this.state.currentTurnPlayer;
    const card = this.state.players[playerIndex]?.hand[handIndex];
    setSpellTrap(this.state, playerIndex, handIndex, zoneIndex);
    this.notifySummon({
      playerIndex,
      zoneIndex,
      card,
      position: 'face_down',
      isMonster: false,
      isSet: true,
      actionType: 'set_spelltrap',
    });
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

  setBattleTrapPrompter(prompter) {
    this.battleTrapPrompter = prompter;
  }

  async checkBattleTrapPrompt(opponentIndex, attackerCard, isDirect) {
    if (typeof this.battleTrapPrompter === 'function') {
      return await this.battleTrapPrompter({ opponentIndex, attackerCard, isDirect });
    }
    return null;
  }

  activateSetSpellTrap(zoneIndex, targetContext = null, playerIndex = null) {
    const pIdx = playerIndex !== null ? playerIndex : this.state.currentTurnPlayer;
    const res = activateSetCard(this.state, pIdx, zoneIndex, targetContext);
    if (res && res.effectMeta) {
      this.notifySpell({
        playerIndex: pIdx,
        spellCard: res.activatedCard,
        effectMeta: res.effectMeta,
      });
    }
    this.notify();
    return res;
  }

  declareAttack(attackerZone, targetZone) {
    const attackerSlot = this.state.players[this.state.currentTurnPlayer].monsterZones[attackerZone];
    const defenderSlot = this.state.players[1 - this.state.currentTurnPlayer].monsterZones[targetZone];
    const attackerCard = attackerSlot?.card;
    const defenderCard = defenderSlot?.card;
    const defenderPosition = defenderSlot?.position;
    const attackerAtk = (attackerSlot?.currentAtk !== undefined ? attackerSlot.currentAtk : attackerCard?.atk) || 0;
    const defenderAtk = (defenderSlot?.currentAtk !== undefined ? defenderSlot.currentAtk : defenderCard?.atk) || 0;
    const defenderDef = (defenderSlot?.currentDef !== undefined ? defenderSlot.currentDef : defenderCard?.def) || 0;

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
      isDefenseShatter: result.isDefenseShatter || false,
      damagePlayerIdx: result.damageToPlayerIndex,
      attackerAttribute: attackerCard?.attribute || 'PHARAOH',
      defenderAttribute: defenderCard?.attribute || 'PHARAOH',
      attackerDestroyed: result.attackerDestroyed,
      defenderDestroyed: result.defenderDestroyed,
      attackerCard,
      defenderCard,
      defenderPosition,
      attackerAtk,
      defenderAtk,
      defenderDef,
      wasFlipped: result.wasFlipped,
      trapTriggered: result.trapTriggered,
      log: result.log,
    });
    this.notify();
    return result;
  }

  directAttack(attackerZone) {
    const attackerSlot = this.state.players[this.state.currentTurnPlayer].monsterZones[attackerZone];
    const attackerCard = attackerSlot?.card;
    const attackerAtk = (attackerSlot?.currentAtk !== undefined ? attackerSlot.currentAtk : attackerCard?.atk) || 0;
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
      attackerCard,
      attackerAtk,
      log: result.log,
      trapTriggered: result.trapTriggered,
    });
    this.notify();
    return result;
  }

  advancePhase(targetPhase) {
    advancePhase(this.state, targetPhase);
    this.notify();
  }

  endTurn() {
    const prevTurnPlayer = this.state.currentTurnPlayer;
    endTurn(this.state);
    this.notifyTurnEnd({
      endedPlayer: prevTurnPlayer,
      nextPlayer: this.state.currentTurnPlayer,
      turnNumber: this.state.turnNumber,
    });
    this.notify();
  }

  surrender(playerIndex) {
    this.state.winner = 1 - playerIndex;
    this.state.winReason = 'SURRENDER';
    this.state.lastLog.push(`استسلم ${this.state.players[playerIndex].name} وانسحب من الماتش.`);
    this.notify();
  }
}
