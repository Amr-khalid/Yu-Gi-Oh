/**
 * AIPlayer.js
 * Tactical autonomous AI duelist in pure JavaScript
 */

export class AIPlayer {
  constructor(playerIndex = 1, difficulty = 'normal') {
    this.playerIndex = playerIndex;
    this.difficulty = difficulty;
  }

  async takeTurn(engine, delayMs = 800) {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    let state = engine.getState();
    if (state.currentTurnPlayer !== this.playerIndex || state.winner !== null) return;

    // 1. Main Phase 1
    await sleep(delayMs);
    this.executeMainPhase(engine);

    state = engine.getState();
    if (state.winner !== null) return;

    // 2. Battle Phase (Restricted on Turn 1 in official Yu-Gi-Oh! rules)
    if (state.turnNumber > 1) {
      engine.advancePhase('BATTLE_STEP');
      await sleep(delayMs);
      this.executeBattlePhase(engine);
    }

    state = engine.getState();
    if (state.winner !== null) return;

    // 3. End Turn
    await sleep(delayMs);
    engine.endTurn();
  }

  executeMainPhase(engine) {
    const state = engine.getState();
    const me = state.players[this.playerIndex];
    const opponent = state.players[1 - this.playerIndex];

    // Spells activation
    for (let i = me.hand.length - 1; i >= 0; i--) {
      const card = me.hand[i];
      if (card && card.type === 'spell') {
        const name = (card.name || '').toLowerCase();
        const oppMonstersCount = opponent.monsterZones.filter(m => m !== null).length;
        const myMonstersCount = me.monsterZones.filter(m => m !== null).length;
        const oppSTCount = opponent.spellTrapZones.filter(s => s !== null).length;

        if (name.includes('pot of greed')) {
          engine.activateSpell(i);
          return this.executeMainPhase(engine);
        } else if (name.includes('raigeki') && oppMonstersCount > 0) {
          engine.activateSpell(i);
        } else if (name.includes('dark hole') && oppMonstersCount > myMonstersCount) {
          engine.activateSpell(i);
        } else if (name.includes('swords') && oppMonstersCount > 0) {
          engine.activateSpell(i);
        } else if (name.includes('change of heart') && oppMonstersCount > 0 && myMonstersCount < 5) {
          engine.activateSpell(i);
        } else if ((name.includes('heavy storm') || name.includes('harpie')) && oppSTCount > 0) {
          engine.activateSpell(i);
        } else if (name.includes('fissure') && oppMonstersCount > 0) {
          engine.activateSpell(i);
        } else if (name.includes('dian keto') && me.lifePoints <= 7000) {
          engine.activateSpell(i);
        } else if (name.includes('ookazi') || name.includes('hinotama') || name.includes('sparks')) {
          engine.activateSpell(i);
        } else if (name.includes('monster reborn')) {
          const hasRevivable = [...me.graveyard, ...opponent.graveyard].some(c => c.type === 'monster');
          if (hasRevivable && myMonstersCount < 5) {
            engine.activateSpell(i);
          }
        } else if (card.subType === 'field' || /yami|umi|sogen|forest|mountain|wasteland|gaia|molten|luminous|sanctuary/i.test(name)) {
          if (!state.activeFieldSpell || state.activeFieldSpell.playerIndex !== this.playerIndex) {
            engine.activateSpell(i);
          }
        }
      }
    }

    // Summoning
    if (me.normalSummonsRemaining > 0) {
      const monstersInHand = me.hand
        .map((card, index) => ({ card, index }))
        .filter(item => item.card.type === 'monster');

      if (monstersInHand.length > 0) {
        const existingMonsters = me.monsterZones
          .map((slot, idx) => ({ slot, idx }))
          .filter(item => item.slot !== null);

        const highLevel = monstersInHand.filter(m => m.card.level >= 5);
        highLevel.sort((a, b) => b.card.atk - a.card.atk);

        const lowLevel = monstersInHand.filter(m => m.card.level <= 4);
        lowLevel.sort((a, b) => b.card.atk - a.card.atk);

        let summoned = false;

        // Try Tribute Summon for Level 7+ (needs 2 tributes)
        const ultraHigh = highLevel.filter(m => m.card.level >= 7);
        if (!summoned && ultraHigh.length > 0 && existingMonsters.length >= 2) {
          existingMonsters.sort((a, b) => (a.slot?.currentAtk || 0) - (b.slot?.currentAtk || 0));
          const t1 = existingMonsters[0].idx;
          const t2 = existingMonsters[1].idx;
          engine.normalSummon(ultraHigh[0].index, t1, 'face_up_attack', [t1, t2]);
          summoned = true;
        }

        // Try Tribute Summon for Level 5-6 (needs 1 tribute)
        const midHigh = highLevel.filter(m => m.card.level >= 5 && m.card.level <= 6);
        if (!summoned && midHigh.length > 0 && existingMonsters.length >= 1) {
          existingMonsters.sort((a, b) => (a.slot?.currentAtk || 0) - (b.slot?.currentAtk || 0));
          const t1 = existingMonsters[0].idx;
          engine.normalSummon(midHigh[0].index, t1, 'face_up_attack', [t1]);
          summoned = true;
        }

        // Normal summon Level 1-4 without tributes
        if (!summoned && lowLevel.length > 0) {
          const emptyZone = me.monsterZones.findIndex(z => z === null);
          if (emptyZone !== -1) {
            const best = lowLevel[0];
            const pos = best.card.atk >= 1200 ? 'face_up_attack' : 'face_down_defense';
            engine.normalSummon(best.index, emptyZone, pos, []);
            summoned = true;
          }
        }
      }
    }

    // Set traps
    const currentState = engine.getState();
    const currentMe = currentState.players[this.playerIndex];
    for (let i = currentMe.hand.length - 1; i >= 0; i--) {
      const card = currentMe.hand[i];
      if (card.type === 'trap') {
        const emptyST = currentMe.spellTrapZones.findIndex(z => z === null);
        if (emptyST !== -1) {
          engine.setSpellTrap(i, emptyST);
        }
      }
    }
  }

  executeBattlePhase(engine) {
    for (let i = 0; i < 5; i++) {
      // Dynamic refresh at each attack step to ensure accurate field state
      const state = engine.getState();
      if (state.winner !== null) return;

      const me = state.players[this.playerIndex];
      const opponent = state.players[1 - this.playerIndex];

      const attacker = me.monsterZones[i];
      if (!attacker || attacker.position !== 'face_up_attack' || attacker.hasAttacked) continue;

      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter(item => item.slot !== null);

      if (oppMonsters.length === 0) {
        engine.directAttack(i);
        if (engine.getState().winner !== null) return;
      } else {
        let bestTargetIdx = null;
        let maxAdvantage = -9999;

        for (const target of oppMonsters) {
          const tSlot = target.slot;
          const targetValue = tSlot.position === 'face_up_attack' ? tSlot.currentAtk : tSlot.currentDef;

          if (attacker.currentAtk > targetValue) {
            const advantage = attacker.currentAtk - targetValue;
            if (advantage > maxAdvantage) {
              maxAdvantage = advantage;
              bestTargetIdx = target.idx;
            }
          }
        }

        if (bestTargetIdx !== null) {
          engine.declareAttack(i, bestTargetIdx);
          if (engine.getState().winner !== null) return;
        }
      }
    }
  }
}
