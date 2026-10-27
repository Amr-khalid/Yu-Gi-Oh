/**
 * AIPlayer.js
 * Advanced Tactical AI Duelist with multi-tier difficulty and strategic planning
 * 100% offline, pure JavaScript, zero external dependencies.
 */

export const AI_DIFFICULTIES = {
  easy: {
    id: 'easy',
    name: 'مبتدئ (جوي ويلر)',
    shortName: 'مبتدئ',
    character: 'جوي ويلر',
    deckIndex: 1, // Joey Deck
    stars: 1,
    badgeColor: '#10b981',
    description: 'مبارز مبتدئ يعتمد على الهجمات المباشرة، ممتاز للتدريب واستكشاف البطاقات.',
    strategy: 'هجمات مباشرة دون تخطيط مركب',
  },
  normal: {
    id: 'normal',
    name: 'متمرس (بيغاسوس)',
    shortName: 'متمرس',
    character: 'بيغاسوس',
    deckIndex: 5, // Pegazus Deck
    stars: 2,
    badgeColor: '#3b82f6',
    description: 'مبارز متزن يجيد توقيت البطاقات العادية واستدعاء الوحوش القوية وتثبيت الأفخاخ.',
    strategy: 'توازن تكتيكي بين السحر والأفخاخ واستدعاء الوحوش',
  },
  hard: {
    id: 'hard',
    name: 'خبير استراتيجي (سيتو كايبا)',
    shortName: 'خبير',
    character: 'سيتو كايبا',
    deckIndex: 2, // Kaiba Deck
    stars: 3,
    badgeColor: '#f59e0b',
    description: 'هجوم شرس وتكتيكات متقدمة! يدمج السحر لإبادة الساحة واستدعاء التنانين الأسطورية.',
    strategy: 'إبادة الساحة، استدعاء التضحية للوحوش العملاقة، وحساب ضربات الفوز الساحقة',
  },
  legendary: {
    id: 'legendary',
    name: 'الفرعون الأسطوري (يامي يوجي)',
    shortName: 'الفرعون',
    character: 'يامي يوجي',
    deckIndex: 6, // Yugi Deck
    stars: 4,
    badgeColor: '#ec4899',
    description: 'ذكاء تكتيكي استثنائي! يحسب خطط الفوز القاضية، ويسرق أقوى وحوش المقبرة، ويسيطر على الساحة بالكامل.',
    strategy: 'خطط مركبة: إحياء المقابر، السيطرة والتضحية، وتغيير الوضعيات الدفاعية وحسابات الضربة القاضية (OTK)',
  },
};

export class AIPlayer {
  constructor(playerIndex = 1, difficulty = 'hard') {
    this.playerIndex = playerIndex;
    this.difficulty = AI_DIFFICULTIES[difficulty] ? difficulty : 'hard';
  }

  async takeTurn(engine, delayMs = 700, onPlan = () => {}) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let state = engine.getState();
    if (state.currentTurnPlayer !== this.playerIndex || state.winner !== null) return;

    try {
      // 1. Main Phase 1 (Tactical combos, position changes, summons, spells, traps)
      await sleep(delayMs);
      await this.executeMainPhase(engine, sleep, onPlan);

      state = engine.getState();
      if (state.winner !== null) return;

      // 2. Battle Phase (Restricted only on opening Turn 1; attack allowed from Turn 2)
      const canAttack = state.turnNumber > 1;
      if (canAttack) {
        engine.advancePhase('BATTLE_STEP');
        await sleep(delayMs);
        await this.executeBattlePhase(engine, sleep, onPlan);
      }
    } catch (err) {
      console.warn('[AIPlayer] Exception during AI turn execution:', err);
    } finally {
      // ALWAYS GUARANTEE END TURN EVEN IF ANY MOVE THREW AN ERROR!
      state = engine.getState();
      if (state.winner === null && state.currentTurnPlayer === this.playerIndex) {
        try {
          await sleep(delayMs);
          onPlan('إنهاء الدور...');
          await sleep(350);
          onPlan(null);
          engine.endTurn();
        } catch (endErr) {
          console.warn('[AIPlayer] Exception while calling endTurn:', endErr);
        }
      }
    }
  }

  async executeMainPhase(engine, sleep, onPlan = () => {}) {
    const state = engine.getState();
    const me = state.players[this.playerIndex];
    const opponent = state.players[1 - this.playerIndex];
    const isHard = this.difficulty === 'hard' || this.difficulty === 'legendary';
    const isLegendary = this.difficulty === 'legendary';

    // ==========================================
    // PLAN 1: Tactical Monster Position Shifting
    // ==========================================
    if (isHard) {
      for (let i = 0; i < 5; i++) {
        const slot = me.monsterZones[i];
        if (slot && slot.canChangePosition) {
          // If in face-down defense with high ATK (e.g. set earlier or flipped), flip to Attack!
          if (slot.position === 'face_down_defense' && (slot.card?.atk || 0) >= 1300) {
            onPlan('تحويل الوحش من وضع الدفاع لوضع الهجوم علشان يضرب في المعركة!');
            try {
              engine.changePosition(i);
              await sleep(650);
            } catch (e) {
              // Ignore if engine rejects
            }
          }
          // In Legendary: protect low ATK monster if facing threats
          else if (isLegendary && slot.position === 'face_up_attack' && (slot.currentAtk || 0) < 1000) {
            const oppThreat = opponent.monsterZones.some((m) => m && (m.currentAtk || 0) > slot.currentAtk);
            if (oppThreat) {
              onPlan('تغيير وضعية الوحش الضعيف للدفاع لحماية نقاط الحياة');
              try {
                engine.changePosition(i);
                await sleep(650);
              } catch (e) {
                // Ignore
              }
            }
          }
        }
      }
    }

    // ==========================================
    // PLAN 2: Board Wipe & Clearing Combos
    // ==========================================
    // Execute board wipes FIRST before normal summoning to gain full control of the field!
    if (isHard) {
      const oppMonstersCount = opponent.monsterZones.filter((m) => m !== null).length;
      const myMonstersCount = me.monsterZones.filter((m) => m !== null).length;
      const oppSTCount = opponent.spellTrapZones.filter((s) => s !== null).length;

      // Check Backrow Clearance Spells (Heavy Storm, Harpie's Feather Duster, MST)
      for (let i = me.hand.length - 1; i >= 0; i--) {
        const card = me.hand[i];
        if (card && card.type === 'spell') {
          const name = (card.name || '').toLowerCase();
          if ((name.includes('heavy storm') || name.includes('harpie') || name.includes('typhoon') || name.includes('cyclone')) && oppSTCount > 0) {
            onPlan('تدمير سحر وفخاخ الخصم لتمهيد هجوم أمان في الملعب!');
            engine.activateSpell(i);
            await sleep(900);
            return this.executeMainPhase(engine, sleep, onPlan);
          }
        }
      }

      // Check Raigeki / Dark Hole
      for (let i = me.hand.length - 1; i >= 0; i--) {
        const card = me.hand[i];
        if (card && card.type === 'spell') {
          const name = (card.name || '').toLowerCase();
          if (name.includes('raigeki') && oppMonstersCount > 0) {
            onPlan('تشغيل صاعقة رايجيكي وتدمير كل وحوش الخصم في الملعب!');
            engine.activateSpell(i);
            await sleep(1000);
            return this.executeMainPhase(engine, sleep, onPlan);
          } else if (name.includes('dark hole') && oppMonstersCount > myMonstersCount) {
            onPlan('تشغيل الثقب المظلم ومسح وحوش الملعب كله!');
            engine.activateSpell(i);
            await sleep(1000);
            return this.executeMainPhase(engine, sleep, onPlan);
          }
        }
      }
    }

    // ==========================================
    // PLAN 3: Legendary Mind Control & Steal Combos
    // ==========================================
    if (isLegendary) {
      const oppMonstersCount = opponent.monsterZones.filter((m) => m !== null).length;
      const myMonstersCount = me.monsterZones.filter((m) => m !== null).length;

      if (oppMonstersCount > 0 && myMonstersCount < 5) {
        for (let i = me.hand.length - 1; i >= 0; i--) {
          const card = me.hand[i];
          if (card && card.type === 'spell') {
            const name = (card.name || '').toLowerCase();
            if (name.includes('change of heart') || name.includes('brain control') || name.includes('snatch steal')) {
              onPlan('تشغيل تغيير القلب والسيطرة على أقوى وحش عند الخصم!');
              engine.activateSpell(i);
              await sleep(1000);
              return this.executeMainPhase(engine, sleep, onPlan);
            }
          }
        }
      }
    }

    // ==========================================
    // PLAN 4: Graveyard Resurrection (Monster Reborn)
    // ==========================================
    if (isHard) {
      const myMonstersCount = me.monsterZones.filter((m) => m !== null).length;
      if (myMonstersCount < 5) {
        for (let i = me.hand.length - 1; i >= 0; i--) {
          const card = me.hand[i];
          if (card && card.type === 'spell') {
            const name = (card.name || '').toLowerCase();
            if (name.includes('monster reborn') || name.includes('premature burial')) {
              const allGY = [...me.graveyard, ...opponent.graveyard].filter((c) => c.type === 'monster');
              const hasStrongTarget = allGY.some((c) => (c.atk || 0) >= 1400);
              if (hasStrongTarget) {
                onPlan('إحياء وحش أسطوري من المقبرة لقلب الماتش لصالحنا!');
                engine.activateSpell(i);
                await sleep(1000);
                return this.executeMainPhase(engine, sleep, onPlan);
              }
            }
          }
        }
      }
    }

    // ==========================================
    // PLAN 5: Card Advantage & Buff Spells
    // ==========================================
    for (let i = me.hand.length - 1; i >= 0; i--) {
      const card = me.hand[i];
      if (card && card.type === 'spell') {
        const name = (card.name || '').toLowerCase();
        const oppMonstersCount = opponent.monsterZones.filter((m) => m !== null).length;
        const myMonstersCount = me.monsterZones.filter((m) => m !== null).length;

        let shouldCast = false;
        let planDesc = '';

        if (name.includes('pot of greed') || name.includes('charity')) {
          onPlan('تشغيل جرة الجشع وسحب كرتين جداد للإيد!');
          engine.activateSpell(i);
          await sleep(900);
          return this.executeMainPhase(engine, sleep, onPlan);
        } else if (name.includes('swords') && oppMonstersCount > 0) {
          shouldCast = true;
          planDesc = 'سيوف النور الكاشف لتجميد ووقف هجمات الخصم!';
        } else if (name.includes('fissure') && oppMonstersCount > 0) {
          shouldCast = true;
          planDesc = 'تشغيل الشق الصخري وتدمير وحش الخصم!';
        } else if (name.includes('dian keto') && me.lifePoints <= 7000) {
          shouldCast = true;
          planDesc = 'تشغيل جرعة العلاج وزيادة نقاط الحياة!';
        } else if (name.includes('ookazi') || name.includes('hinotama') || name.includes('sparks') || name.includes('final flame')) {
          shouldCast = true;
          planDesc = 'تشغيل ضربة سحر مباشرة لنقاط حياة الخصم!';
        } else if (
          name.includes('nuzzler') ||
          name.includes('axe') ||
          name.includes('sword') ||
          name.includes('blade') ||
          name.includes('black pendant')
        ) {
          if (myMonstersCount > 0) {
            shouldCast = true;
            planDesc = 'تزويد الوحش بمعدات سحرية لزيادة هجومه!';
          }
        } else if (card.subType === 'field' || /yami|umi|sogen|forest|mountain|wasteland|gaia|molten|luminous|sanctuary/i.test(name)) {
          if (!state.activeFieldSpell || state.activeFieldSpell.playerIndex !== this.playerIndex) {
            shouldCast = true;
            planDesc = `تفعيل أرضية الملعب السحرية الخاصة (${card.name})!`;
          }
        }

        if (shouldCast) {
          if (planDesc) onPlan(planDesc);
          engine.activateSpell(i);
          await sleep(900);
        }
      }
    }

    // ==========================================
    // PLAN 6: Tactical Monster Summoning & Tributes
    // ==========================================
    const currentMainState = engine.getState();
    const currentMe = currentMainState.players[this.playerIndex];

    if (currentMe.normalSummonsRemaining > 0) {
      const monstersInHand = currentMe.hand
        .map((card, index) => ({ card, index }))
        .filter((item) => item.card.type === 'monster');

      if (monstersInHand.length > 0) {
        const existingMonsters = currentMe.monsterZones
          .map((slot, idx) => ({ slot, idx }))
          .filter((item) => item.slot !== null);

        const highLevel = monstersInHand.filter((m) => m.card.level >= 5);
        highLevel.sort((a, b) => (b.card.atk || 0) - (a.card.atk || 0));

        const lowLevel = monstersInHand.filter((m) => m.card.level <= 4);
        lowLevel.sort((a, b) => (b.card.atk || 0) - (a.card.atk || 0));

        let summoned = false;

        // 1. Tribute Summon for Level 7+ (needs 2 tributes) - Kaiba / Yugi Boss
        const ultraHigh = highLevel.filter((m) => m.card.level >= 7);
        if (!summoned && ultraHigh.length > 0 && existingMonsters.length >= 2) {
          // Sort existing to sacrifice lowest ATK monsters
          existingMonsters.sort((a, b) => (a.slot?.currentAtk || 0) - (b.slot?.currentAtk || 0));
          const t1 = existingMonsters[0].idx;
          const t2 = existingMonsters[1].idx;
          const bossCard = ultraHigh[0].card;
          onPlan(`نزول بالتضحية للوحش الأسطوري: ${bossCard.name} (${bossCard.atk} هجوم)!`);
          engine.normalSummon(ultraHigh[0].index, t1, 'face_up_attack', [t1, t2]);
          summoned = true;
          await sleep(1100);
        }

        // 2. Tribute Summon for Level 5-6 (needs 1 tribute)
        const midHigh = highLevel.filter((m) => m.card.level >= 5 && m.card.level <= 6);
        if (!summoned && midHigh.length > 0 && existingMonsters.length >= 1) {
          existingMonsters.sort((a, b) => (a.slot?.currentAtk || 0) - (b.slot?.currentAtk || 0));
          const t1 = existingMonsters[0].idx;
          const midCard = midHigh[0].card;
          onPlan(`نزول بالتضحية للوحش: ${midCard.name} (${midCard.atk} هجوم)!`);
          engine.normalSummon(midHigh[0].index, t1, 'face_up_attack', [t1]);
          summoned = true;
          await sleep(1100);
        }

        // 3. Normal summon Level 1-4 without tributes
        if (!summoned && lowLevel.length > 0) {
          const emptyZone = currentMe.monsterZones.findIndex((z) => z === null);
          if (emptyZone !== -1) {
            let best = lowLevel[0];
            let pos = 'face_up_attack';

            if (this.difficulty === 'easy') {
              // Easy mode might summon weaker monster or random position
              best = lowLevel[Math.floor(Math.random() * lowLevel.length)];
              pos = (best.card.atk || 0) >= 1000 ? 'face_up_attack' : 'face_down_defense';
            } else {
              // Smart position:
              // If high ATK -> attack mode.
              // If flip effect monster (like Man-Eater Bug) or high DEF (> ATK) -> face-down defense!
              const isFlipEffect = /man-eater|vindictive|morphing|penguin|magician of faith|cyber jar/i.test(best.card.name || '');
              if (isFlipEffect || ((best.card.def || 0) > (best.card.atk || 0) && (best.card.atk || 0) < 1400)) {
                pos = 'face_down_defense';
                onPlan(`تنزيل الوحش مقلوب في وضع الدفاع تكتيكياً!`);
              } else {
                pos = 'face_up_attack';
                onPlan(`تنزيل الوحش: ${best.card.name} (${best.card.atk} هجوم)!`);
              }
            }

            engine.normalSummon(best.index, emptyZone, pos, []);
            summoned = true;
            await sleep(1100);
          }
        }
      }
    }

    // ==========================================
    // PLAN 7: Smart Trap Deployment
    // ==========================================
    const trapState = engine.getState();
    const trapMe = trapState.players[this.playerIndex];
    for (let i = trapMe.hand.length - 1; i >= 0; i--) {
      const card = trapMe.hand[i];
      if (card && card.type === 'trap') {
        const emptyST = trapMe.spellTrapZones.findIndex((z) => z === null);
        if (emptyST !== -1) {
          onPlan(`وضع كارت فخ مقلوب في الساحة لردع هجوم الخصم!`);
          engine.setSpellTrap(i, emptyST);
          await sleep(850);
        }
      }
    }
  }

  async executeBattlePhase(engine, sleep, onPlan = () => {}) {
    for (let step = 0; step < 5; step++) {
      const state = engine.getState();
      if (state.winner !== null) return;

      const me = state.players[this.playerIndex];
      const opponent = state.players[1 - this.playerIndex];

      // Find ready attackers
      const attackers = me.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter((item) => item.slot && item.slot.position === 'face_up_attack' && !item.slot.hasAttacked);

      if (attackers.length === 0) break;

      const oppMonsters = opponent.monsterZones
        .map((slot, idx) => ({ slot, idx }))
        .filter((item) => item.slot !== null);

      // ====================================================
      // LETHAL CALCULATION (حساب الضربة القاضية الحاسمة - OTK)
      // ====================================================
      if (oppMonsters.length === 0) {
        // Direct attack with all available monsters!
        attackers.sort((a, b) => (b.slot.currentAtk || 0) - (a.slot.currentAtk || 0));
        const totalAtk = attackers.reduce((sum, a) => sum + (a.slot.currentAtk || 0), 0);

        if (totalAtk >= opponent.lifePoints) {
          onPlan(`الضربة القاضية! هجوم مباشر شامل لإنهاء الماتش فوراً!`);
        } else {
          onPlan(`الملعب فاضي! هجوم مباشر على نقاط حياة الخصم!`);
        }

        const leadAttacker = attackers[0];
        if (typeof engine.checkBattleTrapPrompt === 'function') {
          const promptRes = await engine.checkBattleTrapPrompt(this.playerIndex, leadAttacker.slot.card, true);
          if (promptRes && promptRes.activated) {
            await sleep(1000);
            const freshSt = engine.getState();
            if (freshSt.winner !== null) return;
            const currentAttacker = freshSt.players[this.playerIndex]?.monsterZones[leadAttacker.idx];
            if (!currentAttacker || currentAttacker.position !== 'face_up_attack' || currentAttacker.hasAttacked) {
              continue;
            }
          }
        }
        engine.directAttack(leadAttacker.idx);
        await sleep(1800);
        continue;
      }

      // ====================================================
      // TACTICAL COMBAT TARGETING (توزيع الهجمات التكتيكي)
      // ====================================================
      let bestAttackAction = null;

      if (this.difficulty === 'easy') {
        // Easy AI: picks first attacker and first target it thinks it can beat
        const attacker = attackers[0];
        const target = oppMonsters[0];
        bestAttackAction = {
          attackerIdx: attacker.idx,
          targetIdx: target.idx,
          reason: 'هجوم عادي',
        };
      } else {
        // Hard / Legendary:
        // Match strongest attackers against targets to maximize board control and eliminate threats!
        // 1. Can we destroy an opponent face-up attack monster and deal damage?
        for (const atkItem of attackers) {
          const aAtk = atkItem.slot.currentAtk || 0;

          for (const oppItem of oppMonsters) {
            const oppSlot = oppItem.slot;
            if (oppSlot.position === 'face_up_attack') {
              if (aAtk > (oppSlot.currentAtk || 0)) {
                const diff = aAtk - (oppSlot.currentAtk || 0);
                if (!bestAttackAction || diff > (bestAttackAction.diff || 0)) {
                  bestAttackAction = {
                    attackerIdx: atkItem.idx,
                    targetIdx: oppItem.idx,
                    diff,
                    reason: `تدمير ${oppSlot.card.name} وإلحاق ${diff} ضرر بنقاط حياة الخصم!`,
                  };
                }
              }
            } else if (oppSlot.position === 'face_up_defense') {
              if (aAtk > (oppSlot.currentDef || 0)) {
                if (!bestAttackAction) {
                  bestAttackAction = {
                    attackerIdx: atkItem.idx,
                    targetIdx: oppItem.idx,
                    diff: 0,
                    reason: `تدمير خط دفاع ${oppSlot.card.name} ومسحه من الملعب!`,
                  };
                }
              }
            } else if (oppSlot.position === 'face_down_defense') {
              // Unknown defense: only attack if our attacker has >= 1500 ATK to avoid heavy recoil
              if (aAtk >= 1500) {
                if (!bestAttackAction) {
                  bestAttackAction = {
                    attackerIdx: atkItem.idx,
                    targetIdx: oppItem.idx,
                    diff: 0,
                    reason: `ضرب وتدمير الوحش المقلوب للخصم!`,
                  };
                }
              }
            }
          }
        }
      }

      if (bestAttackAction) {
        if (bestAttackAction.reason) {
          onPlan(bestAttackAction.reason);
        }
        const atkSlot = me.monsterZones[bestAttackAction.attackerIdx];
        if (typeof engine.checkBattleTrapPrompt === 'function' && atkSlot) {
          const promptRes = await engine.checkBattleTrapPrompt(this.playerIndex, atkSlot.card, false);
          if (promptRes && promptRes.activated) {
            await sleep(1000);
            const freshSt = engine.getState();
            if (freshSt.winner !== null) return;
            const currentAttacker = freshSt.players[this.playerIndex]?.monsterZones[bestAttackAction.attackerIdx];
            if (!currentAttacker || currentAttacker.position !== 'face_up_attack' || currentAttacker.hasAttacked) {
              continue;
            }
          }
        }
        engine.declareAttack(bestAttackAction.attackerIdx, bestAttackAction.targetIdx);
        await sleep(1800);
      } else {
        // No safe attack found (opponent has stronger monsters); preserve monsters in defense
        onPlan('توقف تكتيكي: وحوش الخصم دفاعها وهجومها أقوى، الأفضل التوقف عن الهجوم علشان ما نخسرش وحوش.');
        break;
      }
    }
  }
}
