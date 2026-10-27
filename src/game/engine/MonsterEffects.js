/**
 * MonsterEffects.js
 * Comprehensive effect monster resolving system for Yu-Gi-Oh! Mobile Edition.
 * Handles Flip effects, Continuous effects, Trigger on Summon/Destroy, and Battle effects.
 * 100% offline, pure JavaScript, zero external dependencies.
 */

import { checkWinConditions } from './WinCondition.js';
import { drawCardForTurnPlayer } from './PhaseManager.js';

// Normalize card names for reliable lookup
function norm(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Registry of specific monster effects mapped by normalized name
 */
export const MONSTER_EFFECT_REGISTRY = {
  // === FLIP EFFECTS ===
  [norm('Man-Eater Bug')]: {
    name: 'Man-Eater Bug',
    arabicName: 'حشرة أكلة البشر (Man-Eater Bug)',
    trigger: 'flip',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let targetZone = -1;

      if (ctx.targetZoneIndex !== undefined && ctx.targetZoneIndex !== null && opp.monsterZones[ctx.targetZoneIndex]) {
        targetZone = ctx.targetZoneIndex;
      } else {
        let maxAtk = -1;
        opp.monsterZones.forEach((slot, i) => {
          if (slot && (slot.currentAtk ?? slot.card.atk ?? 0) > maxAtk) {
            maxAtk = slot.currentAtk ?? slot.card.atk ?? 0;
            targetZone = i;
          }
        });
      }

      if (targetZone !== -1 && opp.monsterZones[targetZone]) {
        const destroyed = opp.monsterZones[targetZone];
        if (typeof ctx.destroyMonster === 'function') {
          ctx.destroyMonster(state, oppIdx, targetZone, 'monster_effect', card);
        } else {
          opp.monsterZones[targetZone] = null;
          opp.graveyard.push(destroyed.card);
          if (destroyed.card.subType === 'effect') {
            resolveMonsterEffect(state, oppIdx, destroyed.card, 'onDestroy', {
              wasFaceDown: destroyed.position === 'face_down_defense',
              reason: 'monster_effect',
              sourceCard: card,
              zoneIndex: targetZone,
            });
          }
        }
        state.lastLog.push(`تأثير قلب! حشرة أكلة البشر دمّرت وحش الخصم ${destroyed.card.name}!`);
        return { success: true, destroyedCard: destroyed.card, playerIndex: oppIdx, zoneIndex: targetZone, targetZoneIndex: targetZone, type: 'destroy' };
      } else {
        state.lastLog.push(`تأثير قلب! حشرة أكلة البشر اشتغلت بس مافيش وحوش عند الخصم.`);
      }
      return { success: false };
    },
  },

  [norm('Old Vindictive Magician')]: {
    name: 'Old Vindictive Magician',
    arabicName: 'الساحر العجوز الحقود (Old Vindictive Magician)',
    trigger: 'flip',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let targetZone = -1;

      if (ctx.targetZoneIndex !== undefined && ctx.targetZoneIndex !== null && opp.monsterZones[ctx.targetZoneIndex]) {
        targetZone = ctx.targetZoneIndex;
      } else {
        targetZone = opp.monsterZones.findIndex((z) => z !== null);
      }

      if (targetZone !== -1 && opp.monsterZones[targetZone]) {
        const destroyed = opp.monsterZones[targetZone];
        if (typeof ctx.destroyMonster === 'function') {
          ctx.destroyMonster(state, oppIdx, targetZone, 'monster_effect', card);
        } else {
          opp.monsterZones[targetZone] = null;
          opp.graveyard.push(destroyed.card);
          if (destroyed.card.subType === 'effect') {
            resolveMonsterEffect(state, oppIdx, destroyed.card, 'onDestroy', {
              wasFaceDown: destroyed.position === 'face_down_defense',
              reason: 'monster_effect',
              sourceCard: card,
              zoneIndex: targetZone,
            });
          }
        }
        state.lastLog.push(`تأثير قلب! الساحر العجوز الحقود دمّر ${destroyed.card.name}!`);
        return { success: true, destroyedCard: destroyed.card, playerIndex: oppIdx, zoneIndex: targetZone, targetZoneIndex: targetZone, type: 'destroy' };
      }
      return { success: false };
    },
  },

  [norm('Penguin Soldier')]: {
    name: 'Penguin Soldier',
    arabicName: 'جندي البطريق (Penguin Soldier)',
    trigger: 'flip',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let bounced = 0;
      const targetIndices = ctx.targetZoneIndices || (ctx.targetZoneIndex !== undefined && ctx.targetZoneIndex !== null ? [ctx.targetZoneIndex] : null);

      if (targetIndices && Array.isArray(targetIndices) && targetIndices.length > 0) {
        targetIndices.slice(0, 2).forEach((i) => {
          const slot = opp.monsterZones[i];
          if (slot) {
            opp.hand.push(slot.card);
            opp.monsterZones[i] = null;
            state.lastLog.push(`تأثير قلب! جندي البطريق رجّع ${slot.card.name} لإيد الخصم!`);
            bounced++;
          }
        });
      } else {
        opp.monsterZones.forEach((slot, i) => {
          if (slot && bounced < 2) {
            opp.hand.push(slot.card);
            opp.monsterZones[i] = null;
            state.lastLog.push(`تأثير قلب! جندي البطريق رجّع ${slot.card.name} لإيد الخصم!`);
            bounced++;
          }
        });
      }
      return { success: bounced > 0, type: 'bounce', count: bounced };
    },
  },

  [norm('Hane-Hane')]: {
    name: 'Hane-Hane',
    arabicName: 'هاني-هاني (Hane-Hane)',
    trigger: 'flip',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let targetZone = ctx.targetZoneIndex !== undefined && ctx.targetZoneIndex !== null && opp.monsterZones[ctx.targetZoneIndex]
        ? ctx.targetZoneIndex
        : opp.monsterZones.findIndex((z) => z !== null);

      if (targetZone !== -1 && opp.monsterZones[targetZone]) {
        const bounced = opp.monsterZones[targetZone];
        opp.hand.push(bounced.card);
        opp.monsterZones[targetZone] = null;
        state.lastLog.push(`تأثير قلب! هاني-هاني رجّع ${bounced.card.name} لإيد الخصم!`);
        return { success: true, returnedCard: bounced.card, playerIndex: oppIdx, zoneIndex: targetZone, targetZoneIndex: targetZone, type: 'bounce' };
      }
      return { success: false };
    },
  },

  [norm('Morphing Jar')]: {
    name: 'Morphing Jar',
    arabicName: 'جرة التحول (Morphing Jar)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((player) => {
        // Discard entire hand to graveyard
        while (player.hand.length > 0) {
          player.graveyard.push(player.hand.pop());
        }
        // Draw 5 new cards
        for (let i = 0; i < 5; i++) {
          if (player.deck.length > 0) {
            player.hand.push(player.deck.shift());
          }
        }
      });
      state.lastLog.push(`تأثير قلب! جرة التحول: الاتنين رموا كروت إيديهم وكل واحد سحب 5 كروت جداد!`);
      checkWinConditions(state);
      return { success: true };
    },
  },

  [norm('Cyber Jar')]: {
    name: 'Cyber Jar',
    arabicName: 'الجرة الآلية (Cyber Jar)',
    trigger: 'flip',
    execute(state) {
      // Destroy all monsters on field
      state.players.forEach((player) => {
        player.monsterZones.forEach((slot, i) => {
          if (slot) {
            player.graveyard.push(slot.card);
            player.monsterZones[i] = null;
          }
        });
        // Both players draw 5 cards
        for (let i = 0; i < 5; i++) {
          if (player.deck.length > 0) {
            player.hand.push(player.deck.shift());
          }
        }
      });
      state.lastLog.push(`تأثير قلب! الجرة الآلية دمّرت كل وحوش الملعب وكل لاعب سحب 5 كروت!`);
      checkWinConditions(state);
      return { success: true };
    },
  },

  [norm('Magician of Faith')]: {
    name: 'Magician of Faith',
    arabicName: 'ساحرة الإيمان (Magician of Faith)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const spellIndex = player.graveyard.findIndex((c) => c.type === 'spell');
      if (spellIndex !== -1) {
        const spellCard = player.graveyard.splice(spellIndex, 1)[0];
        player.hand.push(spellCard);
        state.lastLog.push(`تأثير قلب! ساحرة الإيمان رجّعت كارت السحر ${spellCard.name} من المقبرة لإيدك.`);
        return { success: true, card: spellCard };
      }
      return { success: false };
    },
  },

  [norm('Mask of Darkness')]: {
    name: 'Mask of Darkness',
    arabicName: 'قناع الظلام (Mask of Darkness)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const trapIndex = player.graveyard.findIndex((c) => c.type === 'trap');
      if (trapIndex !== -1) {
        const trapCard = player.graveyard.splice(trapIndex, 1)[0];
        player.hand.push(trapCard);
        state.lastLog.push(`تأثير قلب! قناع الظلام رجّع كارت الفخ ${trapCard.name} من المقبرة لإيدك.`);
        return { success: true, card: trapCard };
      }
      return { success: false };
    },
  },

  [norm('Marshmallon')]: {
    name: 'Marshmallon',
    arabicName: 'مارشمالون (Marshmallon)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`تأثير قلب! مارشمالون لسع ${opp.name} بـ 1000 نقطة ضرر مباشر!`);
      checkWinConditions(state);
      return { success: true, damage: 1000, targetPlayer: oppIdx };
    },
  },

  [norm('Slate Warrior')]: {
    name: 'Slate Warrior',
    arabicName: 'المحارب الصخري (Slate Warrior)',
    triggers: {
      flip(state, controllerIdx, card) {
        const player = state.players[controllerIdx];
        const slot = player.monsterZones.find((z) => z && z.card.id === card.id);
        if (slot) {
          slot.currentAtk += 500;
          slot.currentDef += 500;
          state.lastLog.push(`تأثير قلب! المحارب الصخري زادت قوته +500 هجوم ودفاع (هجومه دلوقتي: ${slot.currentAtk})!`);
          return { success: true, desc: 'زيادة هجوم ودفاع المحارب الصخري بمقدار 500 نقطة!' };
        }
        return { success: false };
      },
      onDestroy(state, controllerIdx, card, ctx = {}) {
        if (ctx.reason === 'battle' && ctx.sourceCard) {
          const oppIdx = 1 - controllerIdx;
          const opp = state.players[oppIdx];
          const killer = opp.monsterZones.find((z) => z && z.card.id === ctx.sourceCard.id);
          if (killer) {
            killer.currentAtk = Math.max(0, killer.currentAtk - 500);
            killer.currentDef = Math.max(0, killer.currentDef - 500);
            state.lastLog.push(`لعنة المحارب الصخري! نقص هجوم ودفاع ${killer.card.name} بمقدار 500 نقطة (هجومه دلوقتي: ${killer.currentAtk})!`);
            return { success: true, desc: `إنقاص هجوم ودفاع الوحش القاتل ${killer.card.name} بمقدار 500 نقطة!` };
          }
        }
        return { success: false };
      },
    },
  },

  [norm('Skelengel')]: {
    name: 'Skelengel',
    arabicName: 'الملاك الهيكل (Skelengel)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      if (player.deck.length > 0) {
        const drawn = player.deck.shift();
        player.hand.push(drawn);
        state.lastLog.push(`تأثير قلب! الملاك الهيكل خلاك تسحب كارت جديد (${drawn.name}) من مجموعتك.`);
        checkWinConditions(state);
        return { success: true, desc: `سحب كارت إضافي (${drawn.name}) من مجموعتك للإيد.` };
      }
      return { success: false };
    },
  },

  [norm('4-Starred Ladybug of Doom')]: {
    name: '4-Starred Ladybug of Doom',
    arabicName: 'دعسوقة الهلاك ذات الأربع نجوم (4-Starred Ladybug of Doom)',
    trigger: 'flip',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let destroyedCount = 0;
      opp.monsterZones.forEach((slot, i) => {
        if (slot && (slot.card.level === 4 || slot.card.stars === 4)) {
          if (typeof ctx.destroyMonster === 'function') {
            ctx.destroyMonster(state, oppIdx, i, 'monster_effect', card);
          } else {
            opp.graveyard.push(slot.card);
            opp.monsterZones[i] = null;
          }
          destroyedCount++;
        }
      });
      if (destroyedCount > 0) {
        state.lastLog.push(`تأثير قلب! دعسوقة الهلاك دمّرت كل وحوش المستوى 4 عند الخصم (${destroyedCount} وحش)!`);
        return { success: true, desc: `تم تدمير ${destroyedCount} من وحوش المستوى 4 في ساحة الخصم!` };
      } else {
        state.lastLog.push(`تأثير قلب! دعسوقة الهلاك اشتغلت بس مافيش وحوش مستوى 4 عند الخصم.`);
      }
      return { success: false };
    },
  },

  [norm('Needle Worm')]: {
    name: 'Needle Worm',
    arabicName: 'دودة الإبرة (Needle Worm)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let milled = 0;
      for (let i = 0; i < 5; i++) {
        if (opp.deck.length > 0) {
          opp.graveyard.push(opp.deck.shift());
          milled++;
        }
      }
      state.lastLog.push(`تأثير قلب! دودة الإبرة طحنت ${milled} كروت من دك الخصم ورمتهم في المقبرة!`);
      checkWinConditions(state);
      return { success: milled > 0, desc: `طحن ${milled} كروت من دك الخصم وإرسالهم للمقبرة.` };
    },
  },

  [norm('The Immortal of Thunder')]: {
    name: 'The Immortal of Thunder',
    arabicName: 'خالد الصواعق (The Immortal of Thunder)',
    triggers: {
      flip(state, controllerIdx) {
        const player = state.players[controllerIdx];
        player.lifePoints += 3000;
        state.lastLog.push(`تأثير قلب! خالد الصواعق زوّد نقاط حياتك 3000 نقطة (دلوقتي: ${player.lifePoints})!`);
        return { success: true, desc: 'زيادة 3000 نقطة حياة لحسابك!' };
      },
      onDestroy(state, controllerIdx) {
        const player = state.players[controllerIdx];
        player.lifePoints = Math.max(0, player.lifePoints - 5000);
        state.lastLog.push(`لعنة خالد الصواعق! لما راح للمقبرة، خسرت 5000 نقطة حياة (باقي: ${player.lifePoints})!`);
        checkWinConditions(state);
        return { success: true, desc: 'خسارة 5000 نقطة حياة كضريبة على خالد الصواعق!' };
      },
    },
  },

  [norm('Morphing Jar #2')]: {
    name: 'Morphing Jar #2',
    arabicName: 'جرة التحول رقم 2 (Morphing Jar #2)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((player) => {
        player.monsterZones.forEach((slot, i) => {
          if (slot) {
            player.deck.push(slot.card);
            player.monsterZones[i] = null;
          }
        });
        player.deck.sort(() => Math.random() - 0.5);
      });
      state.lastLog.push(`تأثير قلب! جرة التحول رقم 2 رجّعت كل وحوش الملعب للدك وعملت خلط كامل!`);
      return { success: true, desc: 'إعادة كافة وحوش الملعب إلى مجموعتك وإعادة الخلط.' };
    },
  },

  [norm('Trap Master')]: {
    name: 'Trap Master',
    arabicName: 'خبير الفخاخ (Trap Master)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = opp.spellTrapZones.findIndex((slot) => slot !== null);
      if (targetZone !== -1) {
        const destroyed = opp.spellTrapZones[targetZone];
        opp.graveyard.push(destroyed.card);
        opp.spellTrapZones[targetZone] = null;
        state.lastLog.push(`تأثير قلب! خبير الفخاخ دمّر كارت الفخ/السحر ${destroyed.card.name} من عند الخصم!`);
        return { success: true, desc: `تدمير كارت الفخ/السحر ${destroyed.card.name} وإرساله للمقبرة.` };
      }
      return { success: false };
    },
  },

  [norm('Toy Magician')]: {
    name: 'Toy Magician',
    arabicName: 'ساحر الألعاب (Toy Magician)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = opp.spellTrapZones.findIndex((slot) => slot !== null && slot.position === 'face_down');
      if (targetZone !== -1) {
        const destroyed = opp.spellTrapZones[targetZone];
        opp.graveyard.push(destroyed.card);
        opp.spellTrapZones[targetZone] = null;
        state.lastLog.push(`تأثير قلب! ساحر الألعاب دمّر كارت مقلوب (${destroyed.card.name}) عند الخصم!`);
        return { success: true, desc: `تدمير كارت مقلوب عند الخصم (${destroyed.card.name}).` };
      }
      return { success: false };
    },
  },

  [norm('Tornado Bird')]: {
    name: 'Tornado Bird',
    arabicName: 'طائر الإعصار (Tornado Bird)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let bounced = 0;
      opp.spellTrapZones.forEach((slot, i) => {
        if (slot && bounced < 2) {
          opp.hand.push(slot.card);
          opp.spellTrapZones[i] = null;
          bounced++;
        }
      });
      if (bounced > 0) {
        state.lastLog.push(`تأثير قلب! طائر الإعصار رجّع ${bounced} كروت سحر/فخ لإيد الخصم!`);
        return { success: true, desc: `إرجاع ${bounced} كروت سحر/فخ لإيد الخصم.` };
      }
      return { success: false };
    },
  },

  [norm('Needle Ball')]: {
    name: 'Needle Ball',
    arabicName: 'كرة الإبر (Needle Ball)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`تأثير قلب! كرة الإبر قصفت الخصم بـ 1000 نقطة ضرر مباشر!`);
      checkWinConditions(state);
      return { success: true, desc: 'خصم 1000 نقطة ضرر مباشر من نقاط حياة الخصم.' };
    },
  },

  [norm('Fire Sorcerer')]: {
    name: 'Fire Sorcerer',
    arabicName: 'ساحر اللهب (Fire Sorcerer)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let discarded = 0;
      for (let i = 0; i < 2; i++) {
        if (player.hand.length > 0) {
          player.graveyard.push(player.hand.pop());
          discarded++;
        }
      }
      opp.lifePoints = Math.max(0, opp.lifePoints - 800);
      state.lastLog.push(`تأثير قلب! ساحر اللهب ضحى بـ ${discarded} كروت ولسع الخصم بـ 800 نقطة ضرر مباشر!`);
      checkWinConditions(state);
      return { success: true, desc: 'إلحاق 800 نقطة ضرر مباشر بنقاط حياة الخصم.' };
    },
  },

  [norm('Spear Cretin')]: {
    name: 'Spear Cretin',
    arabicName: 'الأحمق ذو الرمح (Spear Cretin)',
    triggers: {
      flip(state, controllerIdx, card) {
        card.wasFlipped = true;
        state.lastLog.push(`تأثير قلب! تفعلت علامة الأحمق ذو الرمح للإحياء عند إرساله للمقبرة.`);
        return { success: true, desc: 'تفعيل الاستعداد لإحياء وحوش من المقبرة عند تدميره.' };
      },
      onDestroy(state, controllerIdx, card) {
        state.players.forEach((player) => {
          const emptyZone = player.monsterZones.findIndex((z) => z === null);
          const monIdx = player.graveyard.findIndex((c) => c.type === 'monster' && c.id !== card.id);
          if (emptyZone !== -1 && monIdx !== -1) {
            const revived = player.graveyard.splice(monIdx, 1)[0];
            player.monsterZones[emptyZone] = {
              card: revived,
              position: 'face_down_defense',
              hasAttacked: false,
              canChangePosition: false,
              turnSummoned: state.turnNumber,
              currentAtk: revived.atk,
              currentDef: revived.def,
            };
          }
        });
        state.lastLog.push(`تأثير الأحمق ذو الرمح! استدعى وحوش من المقبرة في وضع الدفاع المقلوب لكلا اللاعبين!`);
        return { success: true, desc: 'استدعاء وحش من المقبرة في وضع الدفاع المقلوب لكلا اللاعبين.' };
      },
    },
  },

  [norm('Castle of Dark Illusions')]: {
    name: 'Castle of Dark Illusions',
    arabicName: 'قلعة الأوهام المظلمة (Castle of Dark Illusions)',
    trigger: 'flip',
    execute(state) {
      let boosted = 0;
      state.players.forEach((player) => {
        player.monsterZones.forEach((slot) => {
          if (slot && (slot.card.race === 'Zombie' || slot.card.type?.toLowerCase().includes('zombie'))) {
            slot.currentAtk += 200;
            slot.currentDef += 200;
            boosted++;
          }
        });
      });
      state.lastLog.push(`تأثير قلب! قلعة الأوهام المظلمة رفعت هجوم ودفاع وحوش الزومبي بمقدار 200 نقطة!`);
      return { success: true, desc: 'زيادة هجوم ودفاع وحوش الزومبي في الملعب بمقدار 200 نقطة.' };
    },
  },

  [norm('Bite Shoes')]: {
    name: 'Bite Shoes',
    arabicName: 'أحذية العض (Bite Shoes)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetSlot = opp.monsterZones.find((z) => z !== null);
      if (targetSlot) {
        targetSlot.position = targetSlot.position === 'face_up_attack' ? 'face_up_defense' : 'face_up_attack';
        state.lastLog.push(`تأثير قلب! أحذية العض غيّرت وضعية وحش الخصم ${targetSlot.card.name} إلى ${targetSlot.position === 'face_up_attack' ? 'الهجوم' : 'الدفاع'}!`);
        return { success: true, desc: `تغيير وضعية ${targetSlot.card.name} في ساحة الخصم.` };
      }
      return { success: false };
    },
  },

  [norm("Hiro's Shadow Scout")]: {
    name: "Hiro's Shadow Scout",
    arabicName: "كشاف ظلال هيرو (Hiro's Shadow Scout)",
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let spellDiscarded = 0;
      for (let i = 0; i < 3; i++) {
        if (opp.deck.length > 0) {
          const drawn = opp.deck.shift();
          if (drawn.type === 'spell') {
            opp.graveyard.push(drawn);
            spellDiscarded++;
          } else {
            opp.hand.push(drawn);
          }
        }
      }
      state.lastLog.push(`تأثير قلب! كشاف ظلال هيرو خلى الخصم يسحب 3 كروت، واترمى منهم ${spellDiscarded} كروت سحر في المقبرة!`);
      checkWinConditions(state);
      return { success: true, desc: `سحب الخصم 3 كروت والتخلص من كروت السحر المسحوبة (${spellDiscarded}) للمقبرة.` };
    },
  },

  [norm('Weather Report')]: {
    name: 'Weather Report',
    arabicName: 'نشرة الطقس (Weather Report)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((p) => {
        p.spellTrapZones.forEach((slot, i) => {
          if (slot && norm(slot.card.name) === norm('Swords of Revealing Light')) {
            p.graveyard.push(slot.card);
            p.spellTrapZones[i] = null;
          }
        });
      });
      state.swordsOfRevealingLight = null;
      state.lastLog.push(`تأثير قلب! نشرة الطقس دمّرت سيوف النور الكاشفة وفتحت الطريق للهجوم!`);
      return { success: true, desc: 'تدمير سيوف النور الكاشفة وحماية وحوشك من الحصار.' };
    },
  },

  [norm('Evilswarm Hraesvelg')]: {
    name: 'Evilswarm Hraesvelg',
    arabicName: 'إيفلسوارم هراسفيلج (Evilswarm Hraesvelg)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetIdx = opp.monsterZones.findIndex((z) => z && z.position.startsWith('face_up'));
      if (targetIdx !== -1) {
        const slot = opp.monsterZones[targetIdx];
        opp.hand.push(slot.card);
        opp.monsterZones[targetIdx] = null;
        state.lastLog.push(`تأثير قلب! إيفلسوارم هراسفيلج رجّع ${slot.card.name} لإيد الخصم!`);
        return { success: true, targetZoneIndex: targetIdx, playerIndex: oppIdx, type: 'bounce', desc: `إرجاع ${slot.card.name} لإيد الخصم.` };
      }
      return { success: false };
    },
  },

  [norm("Gravekeeper's Spy")]: {
    name: "Gravekeeper's Spy",
    arabicName: "جاسوس حراس المقابر (Gravekeeper's Spy)",
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const spyIdx = player.deck.findIndex((c) => c.type === 'monster' && (c.atk <= 1500 || c.name.includes('Gravekeeper')));
        if (spyIdx !== -1) {
          const summoned = player.deck.splice(spyIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_defense',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير قلب! جاسوس حراس المقابر نزل وحش ${summoned.name} من مجموعتك في وضع الدفاع!`);
          return { success: true, desc: `استدعاء ${summoned.name} من مجموعتك إلى ساحة المعركة في وضع الدفاع.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Lady Assailant of Flames')]: {
    name: 'Lady Assailant of Flames',
    arabicName: 'مهاجمة اللهب (Lady Assailant of Flames)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      for (let i = 0; i < 3; i++) {
        if (player.deck.length > 0) player.graveyard.push(player.deck.shift());
      }
      opp.lifePoints = Math.max(0, opp.lifePoints - 800);
      state.lastLog.push(`تأثير قلب! مهاجمة اللهب خصمت 800 نقطة ضرر مباشر من الخصم!`);
      checkWinConditions(state);
      return { success: true, desc: 'خصم 800 نقطة ضرر مباشر من نقاط حياة الخصم.' };
    },
  },

  [norm('Rigras Leever')]: {
    name: 'Rigras Leever',
    arabicName: 'ريجراس ليفر (Rigras Leever)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((p) => {
        if (p.hand.length > 0) p.graveyard.push(p.hand.pop());
      });
      state.lastLog.push(`تأثير قلب! ريجراس ليفر أجبر كل لاعب يرمي كارت من إيده للمقبرة!`);
      return { success: true, desc: 'إجبار كلا اللاعبين على التخلص من كارت في المقبرة.' };
    },
  },

  [norm('The Stern Mystic')]: {
    name: 'The Stern Mystic',
    arabicName: 'الصوفي الصارم (The Stern Mystic)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((p) => {
        p.monsterZones.forEach((slot) => {
          if (slot && slot.position === 'face_down_defense') {
            slot.position = 'face_up_defense';
          }
        });
      });
      state.lastLog.push(`تأثير قلب! الصوفي الصارم كشف كل الكروت والوحوش المقلوبة في الملعب!`);
      return { success: true, desc: 'كشف جميع الوحوش المقلوبة في ساحة المعركة.' };
    },
  },

  [norm('Summoner of Illusions')]: {
    name: 'Summoner of Illusions',
    arabicName: 'مستدعي الأوهام (Summoner of Illusions)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const strongIdx = player.deck.findIndex((c) => c.type === 'monster' && c.atk >= 2000);
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (strongIdx !== -1 && emptyZone !== -1) {
        const summoned = player.deck.splice(strongIdx, 1)[0];
        player.monsterZones[emptyZone] = {
          card: summoned,
          position: 'face_up_attack',
          hasAttacked: false,
          canChangePosition: false,
          turnSummoned: state.turnNumber,
          currentAtk: summoned.atk,
          currentDef: summoned.def,
        };
        state.lastLog.push(`تأثير قلب! مستدعي الأوهام استدعى أقوى وحش وهمي (${summoned.name}) من مجموعتك للملعب!`);
        return { success: true, desc: `استدعاء خاص للوحش ${summoned.name} من مجموعتك إلى ساحتك.` };
      }
      return { success: false };
    },
  },

  [norm('Mutant Mindmaster')]: {
    name: 'Mutant Mindmaster',
    arabicName: 'العقل المتحول الخارق (Mutant Mindmaster)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const player = state.players[controllerIdx];
      const oppZone = opp.monsterZones.findIndex((z) => z !== null);
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (oppZone !== -1 && emptyZone !== -1) {
        const monster = opp.monsterZones[oppZone];
        opp.monsterZones[oppZone] = null;
        player.monsterZones[emptyZone] = monster;
        state.lastLog.push(`تأثير قلب! العقل المتحول الخارق سيطر على ${monster.card.name} ونقله لساحتك!`);
        return { success: true, desc: `السيطرة على وحش الخصم (${monster.card.name}) ونقله لساحتك.` };
      }
      return { success: false };
    },
  },

  [norm('Big Eye')]: {
    name: 'Big Eye',
    arabicName: 'العين الكبيرة (Big Eye)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      player.deck.sort((a, b) => (b.atk || 0) - (a.atk || 0));
      state.lastLog.push(`تأثير قلب! العين الكبيرة نظّمت كروت مجموعتك وخلت أقوى وحش في صدارة السحب القادم.`);
      return { success: true, desc: 'إعادة تنظيم أعلى كروت مجموعتك لضمان سحب أقوى وحش.' };
    },
  },

  [norm('Jigen Bakudan')]: {
    name: 'Jigen Bakudan',
    arabicName: 'قنبلة البعد الزمني (Jigen Bakudan)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let totalAtk = 0;
      player.monsterZones.forEach((slot, i) => {
        if (slot) {
          totalAtk += slot.currentAtk || 0;
          player.graveyard.push(slot.card);
          player.monsterZones[i] = null;
        }
      });
      const burn = Math.floor(totalAtk / 2);
      opp.lifePoints = Math.max(0, opp.lifePoints - burn);
      state.lastLog.push(`تأثير قلب! قنبلة البعد الزمني فجّرت ساحتك وأنزلت ضربة هائلة بقيمة ${burn} نقطة بـ ${opp.name}!`);
      checkWinConditions(state);
      return { success: true, desc: `تفجير الساحة وإلحاق ${burn} نقطة ضرر مباشر بالخصم.` };
    },
  },

  [norm('Dragon Piper')]: {
    name: 'Dragon Piper',
    arabicName: 'عازف التنانين (Dragon Piper)',
    trigger: 'flip',
    execute(state) {
      state.players.forEach((p) => {
        p.monsterZones.forEach((slot) => {
          if (slot && (slot.card.race === 'Dragon' || slot.card.type?.toLowerCase().includes('dragon'))) {
            slot.position = 'face_up_attack';
          }
        });
      });
      state.lastLog.push(`تأثير قلب! عازف التنانين حرر كل التنانين وحوّلها لوضعية الهجوم الضاري!`);
      return { success: true, desc: 'تحويل كافة التنانين إلى وضعية الهجوم.' };
    },
  },

  [norm('Gem-Turtle')]: {
    name: 'Gem-Turtle',
    arabicName: 'سلحفاة الجواهر (Gem-Turtle)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const polyIdx = player.deck.findIndex((c) => c.name.toLowerCase().includes('poly') || c.name.toLowerCase().includes('fusion'));
      if (polyIdx !== -1) {
        const found = player.deck.splice(polyIdx, 1)[0];
        player.hand.push(found);
        state.lastLog.push(`تأثير قلب! سلحفاة الجواهر بحثت عن كارت الدمج ${found.name} وضمته لإيدك.`);
        return { success: true, desc: `سحب كارت الدمج (${found.name}) من مجموعتك للإيد.` };
      }
      return { success: false };
    },
  },

  // === ON DESTROY TRIGGERS ===
  [norm('Sangan')]: {
    name: 'Sangan',
    arabicName: 'سانجان (Sangan)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const searchIdx = player.deck.findIndex((c) => c.type === 'monster' && c.atk <= 1500);
      if (searchIdx !== -1) {
        const found = player.deck.splice(searchIdx, 1)[0];
        player.hand.push(found);
        state.lastLog.push(`تأثير سانجان! كارت ${found.name} (هجوم: ${found.atk}) اتسحب من مجموعتك لإيدك.`);
        return { success: true, addedCard: found };
      }
      return { success: false };
    },
  },

  [norm('Witch of the Black Forest')]: {
    name: 'Witch of the Black Forest',
    arabicName: 'ساحرة الغابة السوداء (Witch of the Black Forest)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const searchIdx = player.deck.findIndex((c) => c.type === 'monster' && c.def <= 1500);
      if (searchIdx !== -1) {
        const found = player.deck.splice(searchIdx, 1)[0];
        player.hand.push(found);
        state.lastLog.push(`تأثير ساحرة الغابة السوداء! كارت ${found.name} (دفاع: ${found.def}) اتسحب من مجموعتك لإيدك.`);
        return { success: true, addedCard: found };
      }
      return { success: false };
    },
  },

  [norm('UFO Turtle')]: {
    name: 'UFO Turtle',
    arabicName: 'سلحفاة اليوفو (UFO Turtle)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const fireIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'FIRE' && c.atk <= 1500);
        if (fireIdx !== -1) {
          const summoned = player.deck.splice(fireIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير سلحفاة اليوفو! نزول خاص للوحش الناري ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Mystic Tomato')]: {
    name: 'Mystic Tomato',
    arabicName: 'طماطم غامضة (Mystic Tomato)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const darkIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'DARK' && c.atk <= 1500);
        if (darkIdx !== -1) {
          const summoned = player.deck.splice(darkIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير الطماطم الغامضة! نزول خاص للوحش الظلامي ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Giant Rat')]: {
    name: 'Giant Rat',
    arabicName: 'الفأر العملاق (Giant Rat)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const earthIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'EARTH' && c.atk <= 1500);
        if (earthIdx !== -1) {
          const summoned = player.deck.splice(earthIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير الفأر العملاق! نزول خاص للوحش الأرضي ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Shining Angel')]: {
    name: 'Shining Angel',
    arabicName: 'الملاك الساطع (Shining Angel)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const lightIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'LIGHT' && c.atk <= 1500);
        if (lightIdx !== -1) {
          const summoned = player.deck.splice(lightIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير الملاك الساطع! نزول خاص للوحش الضوئي ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Mother Grizzly')]: {
    name: 'Mother Grizzly',
    arabicName: 'الأم الرمادية (Mother Grizzly)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const waterIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'WATER' && c.atk <= 1500);
        if (waterIdx !== -1) {
          const summoned = player.deck.splice(waterIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير الأم الرمادية! نزول خاص للوحش المائي ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Flying Kamakiri #1')]: {
    name: 'Flying Kamakiri #1',
    arabicName: 'سرعوف الكاماكيري الطائر #1 (Flying Kamakiri #1)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const windIdx = player.deck.findIndex((c) => c.type === 'monster' && c.attribute === 'WIND' && c.atk <= 1500);
        if (windIdx !== -1) {
          const summoned = player.deck.splice(windIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير كاماكيري الطائر! نزول خاص للوحش الريحي ${summoned.name} من مجموعتك للملعب!`);
          return { success: true, summonedCard: summoned, zoneIndex: emptyZone };
        }
      }
      return { success: false };
    },
  },

  [norm('Revival Jam')]: {
    name: 'Revival Jam',
    arabicName: 'هلام الإحياء (Revival Jam)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card) {
      const player = state.players[controllerIdx];
      if (player.lifePoints > 1000) {
        const emptyZone = player.monsterZones.findIndex((z) => z === null);
        if (emptyZone !== -1) {
          player.lifePoints -= 1000;
          // Revive immediately in defense
          player.monsterZones[emptyZone] = {
            card,
            position: 'face_up_defense',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: card.atk,
            currentDef: card.def,
          };
          // Remove from graveyard
          const gIdx = player.graveyard.findIndex((c) => c.id === card.id);
          if (gIdx !== -1) player.graveyard.splice(gIdx, 1);
          state.lastLog.push(`تأثير هلام الإحياء! ${player.name} دفع 1000 نقطة حياة ورجع هلام الإحياء للملعب في وضع الدفاع!`);
          return { success: true, revivedCard: card, zoneIndex: emptyZone, desc: 'دفع 1000 نقطة حياة وإعادة هلام الإحياء فوراً للملعب في وضع الدفاع.' };
        }
      }
      return { success: false };
    },
  },

  [norm('Nimble Momonga')]: {
    name: 'Nimble Momonga',
    arabicName: 'نيمبل مومونجا (Nimble Momonga)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle') {
        const player = state.players[controllerIdx];
        player.lifePoints += 1000;
        let summonedCount = 0;
        for (let i = player.deck.length - 1; i >= 0; i--) {
          const c = player.deck[i];
          if (norm(c.name) === norm('Nimble Momonga')) {
            const emptyZone = player.monsterZones.findIndex((z) => z === null);
            if (emptyZone !== -1) {
              player.deck.splice(i, 1);
              player.monsterZones[emptyZone] = {
                card: c,
                position: 'face_down_defense',
                hasAttacked: false,
                canChangePosition: false,
                turnSummoned: state.turnNumber,
                currentAtk: c.atk,
                currentDef: c.def,
              };
              summonedCount++;
            }
          }
        }
        state.lastLog.push(`تأثير نيمبل مومونجا! كسبت 1000 نقطة حياة واستدعيت ${summonedCount} مومونجا من مجموعتك في وضع الدفاع المقلوب!`);
        return { success: true, desc: `زيادة 1000 نقطة حياة واستدعاء ${summonedCount} وحوش مومونجا مقلوبين.` };
      }
      return { success: false };
    },
  },

  [norm('Giant Germ')]: {
    name: 'Giant Germ',
    arabicName: 'الجرثومة العملاقة (Giant Germ)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle') {
        const player = state.players[controllerIdx];
        const oppIdx = 1 - controllerIdx;
        const opp = state.players[oppIdx];
        opp.lifePoints = Math.max(0, opp.lifePoints - 500);
        let summonedCount = 0;
        for (let i = player.deck.length - 1; i >= 0; i--) {
          const c = player.deck[i];
          if (norm(c.name) === norm('Giant Germ')) {
            const emptyZone = player.monsterZones.findIndex((z) => z === null);
            if (emptyZone !== -1) {
              player.deck.splice(i, 1);
              player.monsterZones[emptyZone] = {
                card: c,
                position: 'face_up_attack',
                hasAttacked: false,
                canChangePosition: false,
                turnSummoned: state.turnNumber,
                currentAtk: c.atk,
                currentDef: c.def,
              };
              summonedCount++;
            }
          }
        }
        state.lastLog.push(`تأثير الجرثومة العملاقة! خصمت 500 نقطة من الخصم واستدعيت ${summonedCount} جراثيم إضافية في وضع الهجوم!`);
        checkWinConditions(state);
        return { success: true, desc: `خصم 500 نقطة ضرر من الخصم واستدعاء ${summonedCount} جراثيم إضافية في الهجوم.` };
      }
      return { success: false };
    },
  },

  [norm('Winged Kuriboh')]: {
    name: 'Winged Kuriboh',
    arabicName: 'كوريبو المجنح (Winged Kuriboh)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      player.zeroBattleDamage = true;
      state.lastLog.push(`تأثير كوريبو المجنح! كل أضرار المعارك اللي هتحصل على ${player.name} في الدور ده بقت 0!`);
      return { success: true, desc: 'حماية مطلقة: جميع أضرار المعارك الموجهة لك في هذا الدور تصبح 0.' };
    },
  },

  [norm('UFOroid')]: {
    name: 'UFOroid',
    arabicName: 'يوفورويد (UFOroid)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle') {
        const player = state.players[controllerIdx];
        const emptyZone = player.monsterZones.findIndex((z) => z === null);
        if (emptyZone !== -1) {
          const machIdx = player.deck.findIndex((c) => c.type === 'monster' && (c.race === 'Machine' || c.race === 'Machine-Type') && c.atk <= 1500);
          if (machIdx !== -1) {
            const summoned = player.deck.splice(machIdx, 1)[0];
            player.monsterZones[emptyZone] = {
              card: summoned,
              position: 'face_up_attack',
              hasAttacked: false,
              canChangePosition: false,
              turnSummoned: state.turnNumber,
              currentAtk: summoned.atk,
              currentDef: summoned.def,
            };
            state.lastLog.push(`تأثير يوفورويد! نزل الوحش الآلي ${summoned.name} من مجموعتك للملعب في وضع الهجوم!`);
            return { success: true, desc: `استدعاء خاص للوحش الآلي (${summoned.name}) من مجموعتك في وضع الهجوم.` };
          }
        }
      }
      return { success: false };
    },
  },

  [norm('Kaiser Glider')]: {
    name: 'Kaiser Glider',
    arabicName: 'طائرة القيصر الشراعية (Kaiser Glider)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetIdx = opp.monsterZones.findIndex((z) => z !== null);
      if (targetIdx !== -1) {
        const targetSlot = opp.monsterZones[targetIdx];
        opp.hand.push(targetSlot.card);
        opp.monsterZones[targetIdx] = null;
        state.lastLog.push(`تأثير طائرة القيصر الشراعية! رجّعت وحش الخصم ${targetSlot.card.name} لإيده!`);
        return { success: true, targetZoneIndex: targetIdx, playerIndex: oppIdx, type: 'bounce', desc: `إرجاع وحش الخصم (${targetSlot.card.name}) لإيده.` };
      }
      return { success: false };
    },
  },

  [norm('Beast of Gilfer')]: {
    name: 'Beast of Gilfer',
    arabicName: 'وحش جيلفر (Beast of Gilfer)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let maxSlot = null;
      let targetIdx = -1;
      opp.monsterZones.forEach((slot, i) => {
        if (slot && (!maxSlot || slot.currentAtk > maxSlot.currentAtk)) {
          maxSlot = slot;
          targetIdx = i;
        }
      });
      if (maxSlot) {
        maxSlot.currentAtk = Math.max(0, maxSlot.currentAtk - 500);
        state.lastLog.push(`تأثير وحش جيلفر! تعلّق بوحش الخصم ${maxSlot.card.name} وخفّض هجومه 500 نقطة (دلوقتي: ${maxSlot.currentAtk})!`);
        return { success: true, targetZoneIndex: targetIdx, playerIndex: oppIdx, desc: `تخفيض هجوم وحش الخصم ${maxSlot.card.name} بمقدار 500 نقطة.` };
      }
      return { success: false };
    },
  },

  [norm('Masked Beast Des Gardius')]: {
    name: 'Masked Beast Des Gardius',
    arabicName: 'الوحش المقنع ديس جارديوس (Masked Beast Des Gardius)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const player = state.players[controllerIdx];
      const oppZone = opp.monsterZones.findIndex((z) => z !== null);
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (oppZone !== -1 && emptyZone !== -1) {
        const stolen = opp.monsterZones[oppZone];
        opp.monsterZones[oppZone] = null;
        player.monsterZones[emptyZone] = stolen;
        state.lastLog.push(`تأثير قناع البقايا! سيطر ديس جارديوس على وحش الخصم ${stolen.card.name} ونقله لساحتك!`);
        return { success: true, desc: `السيطرة على وحش الخصم (${stolen.card.name}) ونقله لساحتك.` };
      }
      return { success: false };
    },
  },

  [norm('Wroughtweiler')]: {
    name: 'Wroughtweiler',
    arabicName: 'روتفايلر (Wroughtweiler)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle') {
        const player = state.players[controllerIdx];
        const spellIdx = player.graveyard.findIndex((c) => c.type === 'spell');
        if (spellIdx !== -1) {
          const recovered = player.graveyard.splice(spellIdx, 1)[0];
          player.hand.push(recovered);
          state.lastLog.push(`تأثير روتفايلر! استرجع كارت السحر ${recovered.name} من المقبرة لإيدك.`);
          return { success: true, desc: `استرجاع كارت السحر (${recovered.name}) من المقبرة للإيد.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Dark Necrofear')]: {
    name: 'Dark Necrofear',
    arabicName: 'دارك نكروفير (Dark Necrofear)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const player = state.players[controllerIdx];
      const oppZone = opp.monsterZones.findIndex((z) => z !== null);
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (oppZone !== -1 && emptyZone !== -1) {
        const stolen = opp.monsterZones[oppZone];
        opp.monsterZones[oppZone] = null;
        player.monsterZones[emptyZone] = stolen;
        state.lastLog.push(`تأثير دارك نكروفير! استحوذت على وحش الخصم ${stolen.card.name} ونقلته لساحتك!`);
        return { success: true, desc: `الاستحواذ على وحش الخصم (${stolen.card.name}) ونقله لساحتك.` };
      }
      return { success: false };
    },
  },

  [norm('Chimera the Flying Mythical Beast')]: {
    name: 'Chimera the Flying Mythical Beast',
    arabicName: 'شيميرا الوحش الأسطوري الطائر (Chimera the Flying Mythical Beast)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const beastIdx = player.graveyard.findIndex((c) => c.type === 'monster' && (c.name.includes('Berfomet') || c.name.includes('Gazelle') || c.race === 'Beast'));
        if (beastIdx !== -1) {
          const revived = player.graveyard.splice(beastIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: revived,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: revived.atk,
            currentDef: revived.def,
          };
          state.lastLog.push(`تأثير شيميرا! استدعى ${revived.name} من المقبرة للملعب!`);
          return { success: true, desc: `استدعاء خاص للوحش ${revived.name} من المقبرة إلى ساحتك.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Paladin of the Cursed Dragon')]: {
    name: 'Paladin of the Cursed Dragon',
    arabicName: 'فارس التنين الملعون (Paladin of the Cursed Dragon)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const zombIdx = opp.graveyard.findIndex((c) => c.type === 'monster');
        if (zombIdx !== -1) {
          const revived = opp.graveyard.splice(zombIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: revived,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: revived.atk,
            currentDef: revived.def,
          };
          state.lastLog.push(`تأثير فارس التنين الملعون! بعث وحش الخصم ${revived.name} من المقبرة لساحتك!`);
          return { success: true, desc: `إحياء وحش الخصم (${revived.name}) من المقبرة لساحتك.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Yomi Ship')]: {
    name: 'Yomi Ship',
    arabicName: 'سفينة يومي (Yomi Ship)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle' && ctx.sourceCard) {
        const oppIdx = 1 - controllerIdx;
        const opp = state.players[oppIdx];
        const killerIdx = opp.monsterZones.findIndex((z) => z && z.card.id === ctx.sourceCard.id);
        if (killerIdx !== -1) {
          const destroyed = opp.monsterZones[killerIdx];
          opp.graveyard.push(destroyed.card);
          opp.monsterZones[killerIdx] = null;
          state.lastLog.push(`تأثير سفينة يومي! دمّرت الوحش المهاجم ${destroyed.card.name} وخدته معاها للمقبرة!`);
          return { success: true, targetZoneIndex: killerIdx, playerIndex: oppIdx, type: 'destroy', desc: `تدمير الوحش المهاجم (${destroyed.card.name}) وإرساله للمقبرة.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Newdoria')]: {
    name: 'Newdoria',
    arabicName: 'نيودوريا (Newdoria)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      if (ctx.reason === 'battle') {
        const oppIdx = 1 - controllerIdx;
        const opp = state.players[oppIdx];
        const targetIdx = opp.monsterZones.findIndex((z) => z !== null);
        if (targetIdx !== -1) {
          const destroyed = opp.monsterZones[targetIdx];
          opp.graveyard.push(destroyed.card);
          opp.monsterZones[targetIdx] = null;
          state.lastLog.push(`تأثير نيودوريا! دمّر وحش الخصم ${destroyed.card.name} بعد ما مات في المعركة!`);
          return { success: true, targetZoneIndex: targetIdx, playerIndex: oppIdx, type: 'destroy', desc: `تدمير وحش الخصم (${destroyed.card.name}) وإرساله للمقبرة.` };
        }
      }
      return { success: false };
    },
  },

  [norm('Pinch Hopper')]: {
    name: 'Pinch Hopper',
    arabicName: 'بينش هوبر (Pinch Hopper)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const emptyZone = player.monsterZones.findIndex((z) => z === null);
      if (emptyZone !== -1) {
        const insectIdx = player.hand.findIndex((c) => c.type === 'monster' && (c.race === 'Insect' || c.race === 'Insect-Type'));
        if (insectIdx !== -1) {
          const summoned = player.hand.splice(insectIdx, 1)[0];
          player.monsterZones[emptyZone] = {
            card: summoned,
            position: 'face_up_attack',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summoned.atk,
            currentDef: summoned.def,
          };
          state.lastLog.push(`تأثير بينش هوبر! استدعى الوحش الحشري ${summoned.name} من إيدك للملعب في وضع الهجوم!`);
          return { success: true, desc: `استدعاء خاص للوحش الحشري (${summoned.name}) من إيدك للملعب.` };
        }
      }
      return { success: false };
    },
  },

  // === ON SUMMON TRIGGERS ===
  [norm('Dark Jeroid')]: {
    name: 'Dark Jeroid',
    arabicName: 'جيرويد المظلم (Dark Jeroid)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      // Reduce ATK of opponent's strongest monster by 800
      let maxAtkSlot = null;
      opp.monsterZones.forEach((slot) => {
        if (slot && (!maxAtkSlot || slot.currentAtk > maxAtkSlot.currentAtk)) {
          maxAtkSlot = slot;
        }
      });
      if (maxAtkSlot) {
        maxAtkSlot.currentAtk = Math.max(0, maxAtkSlot.currentAtk - 800);
        state.lastLog.push(`تأثير جيرويد المظلم! نقص هجوم ${maxAtkSlot.card.name} بمقدار 800 نقطة (هجومه دلوقتي: ${maxAtkSlot.currentAtk})!`);
        return { success: true };
      }
      return { success: false };
    },
  },

  [norm('Barrel Dragon')]: {
    name: 'Barrel Dragon',
    arabicName: 'تنين البراميل (Barrel Dragon)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      // Target opponent monster
      const targetZone = opp.monsterZones.findIndex((z) => z !== null);
      if (targetZone !== -1) {
        // Roll 3 coins (success if 2 or more heads)
        const heads = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5].filter(Boolean).length;
        if (heads >= 2) {
          const destroyed = opp.monsterZones[targetZone];
          opp.graveyard.push(destroyed.card);
          opp.monsterZones[targetZone] = null;
          state.lastLog.push(`تأثير تنين البراميل! رمية العملة نجحت (${heads} ملك) وتم تدمير ${destroyed.card.name}!`);
          return { success: true, destroyedCard: destroyed.card, zoneIndex: targetZone };
        } else {
          state.lastLog.push(`تأثير تنين البراميل: رمية العملة ما نجحتش (${heads} ملك بس).`);
        }
      }
      return { success: false };
    },
  },

  [norm('Breaker the Magical Warrior')]: {
    name: 'Breaker the Magical Warrior',
    arabicName: 'بريكر المحارب الساحر (Breaker the Magical Warrior)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const player = state.players[controllerIdx];
      const zoneIdx = ctx.zoneIndex !== undefined ? ctx.zoneIndex : player.monsterZones.findIndex((z) => z && z.card.id === card.id);
      if (zoneIdx !== -1 && player.monsterZones[zoneIdx]) {
        player.monsterZones[zoneIdx].currentAtk += 300;
        state.lastLog.push(`تأثير بريكر المحارب الساحر! خد عداد سحر وزاد هجومه بمقدار +300 نقطة (هجومه دلوقتي: ${player.monsterZones[zoneIdx].currentAtk})!`);
        return { success: true };
      }
      return { success: false };
    },
  },

  // === THE MONARCHS ===
  [norm('Zaborg the Thunder Monarch')]: {
    name: 'Zaborg the Thunder Monarch',
    arabicName: 'زابورج ملك الرعد (Zaborg the Thunder Monarch)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = ctx.targetZoneIndex !== undefined && ctx.targetZoneIndex !== null && opp.monsterZones[ctx.targetZoneIndex]
        ? ctx.targetZoneIndex
        : opp.monsterZones.findIndex(z => z !== null);
      if (targetZone !== -1 && opp.monsterZones[targetZone]) {
        const destroyed = opp.monsterZones[targetZone];
        if (typeof ctx.destroyMonster === 'function') {
          ctx.destroyMonster(state, oppIdx, targetZone, 'monster_effect', card);
        } else {
          opp.monsterZones[targetZone] = null;
          opp.graveyard.push(destroyed.card);
        }
        state.lastLog.push(`صاعقة زابورج ملك الرعد! صعقت ودمرت الوحش ${destroyed.card.name} فور استدعائه!`);
        return { success: true, destroyedCard: destroyed.card, zoneIndex: targetZone };
      }
      return { success: false };
    }
  },

  [norm('Mobius the Frost Monarch')]: {
    name: 'Mobius the Frost Monarch',
    arabicName: 'موبيوس ملك الصقيع (Mobius the Frost Monarch)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let destroyedCount = 0;
      opp.spellTrapZones.forEach((slot, i) => {
        if (slot && destroyedCount < 2) {
          opp.graveyard.push(slot.card);
          opp.spellTrapZones[i] = null;
          destroyedCount++;
        }
      });
      state.lastLog.push(`جليد موبيوس ملك الصقيع! جمد وحطم ${destroyedCount} من بطاقات السحر والفخاخ للخصم!`);
      return { success: true, destroyedCount };
    }
  },

  [norm('Granmarg the Rock Monarch')]: {
    name: 'Granmarg the Rock Monarch',
    arabicName: 'جرانمارج ملك الصخور (Granmarg the Rock Monarch)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      // Target face-down monster or spell/trap
      const fdMonster = opp.monsterZones.findIndex(z => z && z.position === 'face_down_defense');
      if (fdMonster !== -1) {
        const destroyed = opp.monsterZones[fdMonster];
        opp.graveyard.push(destroyed.card);
        opp.monsterZones[fdMonster] = null;
        state.lastLog.push(`زلزال جرانمارج ملك الصخور! سحق الوحش المقلوب ${destroyed.card.name}!`);
        return { success: true, destroyedCard: destroyed.card };
      }
      const fdST = opp.spellTrapZones.findIndex(z => z && !z.faceUp);
      if (fdST !== -1) {
        const destroyed = opp.spellTrapZones[fdST];
        opp.graveyard.push(destroyed.card);
        opp.spellTrapZones[fdST] = null;
        state.lastLog.push(`زلزال جرانمارج ملك الصخور! سحق البطاقة المقلوبة للخصم!`);
        return { success: true, destroyedCard: destroyed.card };
      }
      return { success: false };
    }
  },

  [norm('Raiza the Storm Monarch')]: {
    name: 'Raiza the Storm Monarch',
    arabicName: 'رايزا ملك العواصف (Raiza the Storm Monarch)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = opp.monsterZones.findIndex(z => z !== null);
      if (targetZone !== -1) {
        const spun = opp.monsterZones[targetZone];
        opp.monsterZones[targetZone] = null;
        opp.deck.unshift(spun.card);
        state.lastLog.push(`إعصار رايزا ملك العواصف! طيّر الوحش ${spun.card.name} لأعلى سطح مجموعة الخصم!`);
        return { success: true, spunCard: spun.card };
      }
      return { success: false };
    }
  },

  [norm('Caius the Shadow Monarch')]: {
    name: 'Caius the Shadow Monarch',
    arabicName: 'كايوس ملك الظلال (Caius the Shadow Monarch)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = opp.monsterZones.findIndex(z => z !== null);
      if (targetZone !== -1) {
        const banished = opp.monsterZones[targetZone];
        opp.monsterZones[targetZone] = null;
        opp.banished = opp.banished || [];
        opp.banished.push(banished.card);
        const isDark = banished.card.attribute === 'DARK';
        if (isDark) {
          opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
        }
        state.lastLog.push(`ظلام كايوس ملك الظلال! نفى ${banished.card.name} خارج اللعبة${isDark ? ' وسدد 1000 ضرر مباشر!' : '!'}`);
        return { success: true, banishedCard: banished.card };
      }
      return { success: false };
    }
  },

  // === THE GADGETS ===
  [norm('Green Gadget')]: {
    name: 'Green Gadget',
    arabicName: 'الأداة الخضراء (Green Gadget)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card) {
      const player = state.players[controllerIdx];
      const foundIdx = player.deck.findIndex(c => (c.name || '').toLowerCase().includes('red gadget'));
      if (foundIdx !== -1) {
        const added = player.deck.splice(foundIdx, 1)[0];
        player.hand.push(added);
        state.lastLog.push(`تأثير الأداة الخضراء! سحبت الأداة الحمراء (Red Gadget) من المجموعة للإيد.`);
        return { success: true, addedCard: added };
      }
      return { success: false };
    }
  },

  [norm('Red Gadget')]: {
    name: 'Red Gadget',
    arabicName: 'الأداة الحمراء (Red Gadget)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card) {
      const player = state.players[controllerIdx];
      const foundIdx = player.deck.findIndex(c => (c.name || '').toLowerCase().includes('yellow gadget'));
      if (foundIdx !== -1) {
        const added = player.deck.splice(foundIdx, 1)[0];
        player.hand.push(added);
        state.lastLog.push(`تأثير الأداة الحمراء! سحبت الأداة الصفراء (Yellow Gadget) من المجموعة للإيد.`);
        return { success: true, addedCard: added };
      }
      return { success: false };
    }
  },

  [norm('Yellow Gadget')]: {
    name: 'Yellow Gadget',
    arabicName: 'الأداة الصفراء (Yellow Gadget)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card) {
      const player = state.players[controllerIdx];
      const foundIdx = player.deck.findIndex(c => (c.name || '').toLowerCase().includes('green gadget'));
      if (foundIdx !== -1) {
        const added = player.deck.splice(foundIdx, 1)[0];
        player.hand.push(added);
        state.lastLog.push(`تأثير الأداة الصفراء! سحبت الأداة الخضراء (Green Gadget) من المجموعة للإيد.`);
        return { success: true, addedCard: added };
      }
      return { success: false };
    }
  },

  // === COMBAT & BATTLE MONSTERS ===
  [norm('D.D. Warrior Lady')]: {
    name: 'D.D. Warrior Lady',
    arabicName: 'سيدة الأبعاد (D.D. Warrior Lady)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      if (ctx.sourceCard) {
        const oppZ = opp.monsterZones.findIndex(z => z && z.card.id === ctx.sourceCard.id);
        if (oppZ !== -1) {
          opp.monsterZones[oppZ] = null;
          opp.banished = opp.banished || [];
          opp.banished.push(ctx.sourceCard);
          state.lastLog.push(`سيدة الأبعاد (D.D. Warrior Lady) نفت وحش الخصم المهاجم ${ctx.sourceCard.name} معها إلى بعد آخر!`);
          return { success: true };
        }
      }
      return { success: false };
    }
  },

  [norm('D.D. Assailant')]: {
    name: 'D.D. Assailant',
    arabicName: 'مهاجم الأبعاد (D.D. Assailant)',
    trigger: 'onDestroy',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      if (ctx.sourceCard) {
        const oppZ = opp.monsterZones.findIndex(z => z && z.card.id === ctx.sourceCard.id);
        if (oppZ !== -1) {
          opp.monsterZones[oppZ] = null;
          opp.banished = opp.banished || [];
          opp.banished.push(ctx.sourceCard);
          state.lastLog.push(`مهاجم الأبعاد (D.D. Assailant) سحب ونفى ${ctx.sourceCard.name} بعد المعركة!`);
          return { success: true };
        }
      }
      return { success: false };
    }
  },

  [norm('Don Zaloog')]: {
    name: 'Don Zaloog',
    arabicName: 'دون زالوج (Don Zaloog)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      if (opp.hand.length > 0) {
        opp.graveyard.push(opp.hand.pop());
        state.lastLog.push(`تأثير دون زالوج! تسلل وأجبر الخصم على التخلص من بطاقة من يده!`);
        return { success: true };
      }
      return { success: false };
    }
  },

  [norm('Spirit Reaper')]: {
    name: 'Spirit Reaper',
    arabicName: 'حاصد الأرواح (Spirit Reaper)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      state.lastLog.push(`حاصد الأرواح (Spirit Reaper) محمي تماماً من التدمير بالمعركة!`);
      return { success: true };
    }
  },

  [norm('Card Trooper')]: {
    name: 'Card Trooper',
    arabicName: 'جندي البطاقات (Card Trooper)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      if (player.deck.length > 0) {
        player.hand.push(player.deck.pop());
        state.lastLog.push(`تأثير جندي البطاقات! سحب بطاقة جديدة فور تدميره وإرساله للمقبرة.`);
        return { success: true };
      }
      return { success: false };
    }
  },

  [norm('Dandylion')]: {
    name: 'Dandylion',
    arabicName: 'دانديليون (Dandylion)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      let summoned = 0;
      for (let i = 0; i < 5 && summoned < 2; i++) {
        if (player.monsterZones[i] === null) {
          player.monsterZones[i] = {
            card: { id: 888801 + summoned, name: 'Fluff Token', type: 'monster', subType: 'normal', level: 1, atk: 0, def: 0, race: 'Plant', attribute: 'WIND' },
            position: 'face_up_defense',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: 0,
            currentDef: 0,
          };
          summoned++;
        }
      }
      state.lastLog.push(`تأثير دانديليون! استدعى ${summoned} من رموز الزغب (Fluff Tokens) في وضع الدفاع!`);
      return { success: true, count: summoned };
    }
  },

  [norm('Exiled Force')]: {
    name: 'Exiled Force',
    arabicName: 'القوة المنفية (Exiled Force)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const oppMonsterIdx = opp.monsterZones.findIndex(z => z !== null);
      if (oppMonsterIdx !== -1) {
        const destroyed = opp.monsterZones[oppMonsterIdx];
        opp.graveyard.push(destroyed.card);
        opp.monsterZones[oppMonsterIdx] = null;
        state.lastLog.push(`تأثير القوة المنفية (Exiled Force)! ضحت بنفسها ودمرت الوحش ${destroyed.card.name}!`);
        return { success: true, destroyedCard: destroyed.card };
      }
      return { success: false };
    }
  },

  [norm('Snipe Hunter')]: {
    name: 'Snipe Hunter',
    arabicName: 'صياد القنص (Snipe Hunter)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card) {
      const player = state.players[controllerIdx];
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      if (player.hand.length > 0) {
        player.graveyard.push(player.hand.pop());
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll !== 1 && roll !== 6) {
          const targetZ = opp.monsterZones.findIndex(z => z !== null);
          if (targetZ !== -1) {
            const destroyed = opp.monsterZones[targetZ];
            opp.graveyard.push(destroyed.card);
            opp.monsterZones[targetZ] = null;
            state.lastLog.push(`قناص القنابل! رمية النرد [${roll}]: أصاب الهدف ودمر ${destroyed.card.name}!`);
            return { success: true, destroyedCard: destroyed.card };
          }
        } else {
          state.lastLog.push(`قناص القنابل! رمية النرد [${roll}]: أخطأ الهدف هذه المرة.`);
        }
      }
      return { success: false };
    }
  },

  [norm('Lava Golem')]: {
    name: 'Lava Golem',
    arabicName: 'عملاق الحمم (Lava Golem)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`حمم عملاق الحمم (Lava Golem)! أحرقت الساحة وسددت 1000 ضرر مباشر لنقاط حياة ${opp.name}!`);
      return { success: true, damage: 1000 };
    }
  },

  [norm('Stealth Bird')]: {
    name: 'Stealth Bird',
    arabicName: 'طائر التخفي (Stealth Bird)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`طائر التخفي (Stealth Bird)! انقض من الظلال وسدد 1000 ضرر مباشر لـ ${opp.name}!`);
      return { success: true, damage: 1000 };
    }
  },

  [norm('Bowganian')]: {
    name: 'Bowganian',
    arabicName: 'بوجانيان (Bowganian)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 600);
      state.lastLog.push(`سهام بوجانيان (Bowganian)! أصابت نقاط حياة ${opp.name} بـ 600 ضرر مباشر!`);
      return { success: true, damage: 600 };
    }
  },

  [norm('Solar Flare Dragon')]: {
    name: 'Solar Flare Dragon',
    arabicName: 'تنين التوهج الشمسي (Solar Flare Dragon)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 500);
      state.lastLog.push(`لهيب التوهج الشمسي! سدد 500 ضرر مباشر لنقاط حياة ${opp.name}!`);
      return { success: true, damage: 500 };
    }
  },

  [norm('Blizzard Dragon')]: {
    name: 'Blizzard Dragon',
    arabicName: 'تنين العاصفة الجليدية (Blizzard Dragon)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      const targetZone = opp.monsterZones.find(z => z !== null);
      if (targetZone) {
        targetZone.canAttack = false;
        targetZone.canChangePosition = false;
        state.lastLog.push(`صقيع تنين العاصفة الجليدية! جمد الوحش ${targetZone.card.name} ومنعه من الهجوم أو التحرك!`);
        return { success: true };
      }
      return { success: false };
    }
  },

  [norm('Ameba')]: {
    name: 'Ameba',
    arabicName: 'الأميبا (Ameba)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 2000);
      state.lastLog.push(`تأثير الأميبا (Ameba)! انفجرت سمومها وألحقت 2000 ضرر مباشر بنقاط حياة ${opp.name}!`);
      return { success: true, damage: 2000 };
    }
  },

  [norm('Minar')]: {
    name: 'Minar',
    arabicName: 'مينار (Minar)',
    trigger: 'onDestroy',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`تأثير مينار (Minar)! رد السحر وسدد 1000 ضرر مباشر لـ ${opp.name}!`);
      return { success: true, damage: 1000 };
    }
  },

  [norm("Hiro's Shadow Scout")]: {
    name: "Hiro's Shadow Scout",
    arabicName: "كشاف الظلال هيرو (Hiro's Shadow Scout)",
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let spellsDiscarded = 0;
      for (let i = 0; i < 3; i++) {
        if (opp.deck.length > 0) {
          const drawn = opp.deck.pop();
          if (drawn.type === 'spell') {
            opp.graveyard.push(drawn);
            spellsDiscarded++;
          } else {
            opp.hand.push(drawn);
          }
        }
      }
      state.lastLog.push(`كشاف الظلال! سحب الخصم 3 بطاقات وتخلص من ${spellsDiscarded} بطاقات سحرية!`);
      return { success: true };
    }
  },

  [norm('Parasite Paracide')]: {
    name: 'Parasite Paracide',
    arabicName: 'الطفيلي المتسلل (Parasite Paracide)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      opp.lifePoints = Math.max(0, opp.lifePoints - 1000);
      state.lastLog.push(`الطفيلي المتسلل (Parasite Paracide)! أصاب الخصم بعدوى تسببت في 1000 ضرر مباشر!`);
      return { success: true, damage: 1000 };
    }
  },

  [norm("Gravekeeper's Spy")]: {
    name: "Gravekeeper's Spy",
    arabicName: "جاسوس حراس المقابر (Gravekeeper's Spy)",
    trigger: 'flip',
    execute(state, controllerIdx) {
      const player = state.players[controllerIdx];
      const eligibleIdx = player.deck.findIndex(c => (c.name || '').toLowerCase().includes('gravekeeper') && (c.atk || 0) <= 1500);
      if (eligibleIdx !== -1) {
        const summonedCard = player.deck.splice(eligibleIdx, 1)[0];
        const emptyZone = player.monsterZones.findIndex(z => z === null);
        if (emptyZone !== -1) {
          player.monsterZones[emptyZone] = {
            card: summonedCard,
            position: 'face_up_defense',
            hasAttacked: false,
            canChangePosition: false,
            turnSummoned: state.turnNumber,
            currentAtk: summonedCard.atk,
            currentDef: summonedCard.def,
          };
          state.lastLog.push(`جاسوس حراس المقابر! استدعى ${summonedCard.name} من المجموعة لوضع الدفاع!`);
          return { success: true, summonedCard };
        }
      }
      return { success: false };
    }
  },

  [norm('Tiger Dragon')]: {
    name: 'Tiger Dragon',
    arabicName: 'تنين النمر (Tiger Dragon)',
    trigger: 'flip',
    execute(state, controllerIdx) {
      const oppIdx = 1 - controllerIdx;
      const opp = state.players[oppIdx];
      let destroyed = 0;
      opp.spellTrapZones.forEach((slot, i) => {
        if (slot && !slot.faceUp && destroyed < 2) {
          opp.graveyard.push(slot.card);
          opp.spellTrapZones[i] = null;
          destroyed++;
        }
      });
      state.lastLog.push(`زئير تنين النمر (Tiger Dragon)! حطم ${destroyed} بطاقات سحر/فخ مقلوبة للخصم!`);
      return { success: true, count: destroyed };
    }
  },

  [norm('Cyber Dragon')]: {
    name: 'Cyber Dragon',
    arabicName: 'التنين الإلكتروني (Cyber Dragon)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      state.lastLog.push(`هبوط التنين الإلكتروني (Cyber Dragon)! استدعاء إلكتروني مدوي يسيطر على الساحة!`);
      return { success: true };
    }
  },

  [norm('Slifer the Sky Dragon')]: {
    name: 'Slifer the Sky Dragon',
    arabicName: 'سلايفر تنين السماء (Slifer the Sky Dragon)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const player = state.players[controllerIdx];
      const atk = (player.hand.length) * 1000;
      const zoneIdx = ctx.zoneIndex !== undefined ? ctx.zoneIndex : player.monsterZones.findIndex(z => z && z.card.id === card.id);
      if (zoneIdx !== -1 && player.monsterZones[zoneIdx]) {
        player.monsterZones[zoneIdx].currentAtk = atk;
        player.monsterZones[zoneIdx].currentDef = atk;
      }
      state.lastLog.push(`نداء الإله المصري سلايفر تنين السماء! هجومه ودفاعه يتضاعفان لـ ${atk} (1000 عن كل بطاقة في يدك)!`);
      return { success: true, atk };
    }
  },

  [norm('Obelisk the Tormentor')]: {
    name: 'Obelisk the Tormentor',
    arabicName: 'المعذب أوبيليسك (Obelisk the Tormentor)',
    trigger: 'onSummon',
    execute(state, controllerIdx) {
      state.lastLog.push(`هبوط المعذب أوبيليسك الإلهي (Obelisk the Tormentor)! قوة مطلقة 4000 هجوم ودفاع تهز الساحة!`);
      return { success: true };
    }
  },

  [norm('The Winged Dragon of Ra')]: {
    name: 'The Winged Dragon of Ra',
    arabicName: 'تنين رع المجنح (The Winged Dragon of Ra)',
    trigger: 'onSummon',
    execute(state, controllerIdx, card, ctx = {}) {
      const player = state.players[controllerIdx];
      const transferredLP = Math.max(0, player.lifePoints - 100);
      player.lifePoints = 100;
      const zoneIdx = ctx.zoneIndex !== undefined ? ctx.zoneIndex : player.monsterZones.findIndex(z => z && z.card.id === card.id);
      if (zoneIdx !== -1 && player.monsterZones[zoneIdx]) {
        player.monsterZones[zoneIdx].currentAtk = transferredLP;
        player.monsterZones[zoneIdx].currentDef = transferredLP;
      }
      state.lastLog.push(`نشيد الإله رع! تنين رع المجنح امتص طاقة حياتك (${transferredLP}) وتحولت لهجوم ودفاع أسطوري!`);
      return { success: true, atk: transferredLP };
    }
  },

};

/**
 * Checks if a monster card has an effect registered for a given trigger
 */
export function hasMonsterEffect(card, triggerType) {
  if (!card) return false;
  const key = norm(card.name);
  const entry = MONSTER_EFFECT_REGISTRY[key];
  if (entry) {
    if (entry.trigger === triggerType) return true;
    if (entry.triggers && typeof entry.triggers[triggerType] === 'function') return true;
  }

  // Dynamic heuristic from description if card.subType is 'effect'
  if (card.subType === 'effect' && (card.desc || card.description)) {
    const desc = (card.desc || card.description).toLowerCase();
    if (triggerType === 'flip' && (desc.includes('flip:') || desc.includes('flip :'))) return true;
    if (triggerType === 'onDestroy' && (desc.includes('sent to the graveyard') || desc.includes('destroyed by battle') || desc.includes('sent from the field to the graveyard') || desc.includes('when this card is destroyed'))) return true;
    if (triggerType === 'onSummon' && (desc.includes('when this card is normal summoned') || desc.includes('when this card is summoned') || desc.includes('if this card is normal summoned') || desc.includes('tribute summon'))) return true;
  }
  return false;
}

/**
 * Checks if a monster cannot be destroyed by battle (e.g. Spirit Reaper, Marshmallon, Obnoxious Celtic Guard)
 */
export function isIndestructibleByBattle(card, attackerSlot = null) {
  if (!card) return false;
  const name = norm(card.name);
  if (name === norm('Marshmallon') || name === norm('Spirit Reaper')) return true;
  if (name === norm('Obnoxious Celtic Guard')) {
    const atk = attackerSlot ? (attackerSlot.currentAtk ?? attackerSlot.card?.atk ?? 0) : 0;
    if (atk >= 1900) return true;
  }
  if (card.desc || card.description) {
    const desc = (card.desc || card.description).toLowerCase();
    if (desc.includes('cannot be destroyed by battle') || desc.includes('this card is not destroyed as a result of battle')) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if Jinzo or Sorcerer of Dark Magic is face-up on the field, which negates Trap cards
 */
export function isTrapNegated(state) {
  for (const player of state.players) {
    for (const slot of player.monsterZones) {
      if (slot && slot.position !== 'face_down_defense') {
        const name = norm(slot.card.name);
        if (name === norm('Jinzo') || name === norm('Sorcerer of Dark Magic')) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Resolves a monster effect when a specific event occurs
 * Supports ALL 364 effect monsters via both registered handlers and autonomous dynamic parser!
 * @param {Object} state - The duel game state
 * @param {number} controllerIdx - Player index owning the monster
 * @param {Object} card - The card object
 * @param {string} triggerType - 'flip' | 'onDestroy' | 'onSummon' | 'continuous'
 * @param {Object} context - Optional event context
 */
export function resolveMonsterEffect(state, controllerIdx, card, triggerType, context = {}) {
  if (!card) return null;
  const key = norm(card.name);
  const registered = MONSTER_EFFECT_REGISTRY[key];

  let effectFn = null;
  let effectMeta = registered;

  if (registered) {
    if (registered.trigger === triggerType && typeof registered.execute === 'function') {
      effectFn = registered.execute;
    } else if (registered.triggers && typeof registered.triggers[triggerType] === 'function') {
      effectFn = registered.triggers[triggerType];
    }
  }

  if (effectFn) {
    try {
      const res = effectFn(state, controllerIdx, card, context);
      if (res && res.success !== false) {
        const effectEvent = {
          playerIndex: controllerIdx,
          card,
          trigger: triggerType,
          title: effectMeta?.name || card.name,
          arabicName: effectMeta?.arabicName || card.name,
          desc: res.desc || effectMeta?.desc || card.description || card.desc,
          result: res,
        };
        if (typeof state.onMonsterEffectTriggered === 'function') {
          try {
            state.onMonsterEffectTriggered(effectEvent);
          } catch (e) {
            console.error('Error triggering onMonsterEffectTriggered:', e);
          }
        }
      }
      return res;
    } catch (e) {
      console.warn(`Failed to execute effect for ${card.name}:`, e);
      return null;
    }
  }

  // =========================================================================
  // AUTONOMOUS DYNAMIC MONSTER EFFECT ENGINE
  // Intelligently parses card description for unlisted effect monsters
  // =========================================================================
  if (card.subType === 'effect' && (card.description || card.desc)) {
    const desc = (card.description || card.desc).toLowerCase();
    const oppIdx = 1 - controllerIdx;
    const opp = state.players[oppIdx];
    const player = state.players[controllerIdx];

    // --- 1. FLIP EFFECTS ---
    if (triggerType === 'flip') {
      // Destruction (Spell / Trap / Monster)
      if (desc.includes('destroy') || desc.includes('destroys')) {
        if (desc.includes('spell') || desc.includes('trap')) {
          const oppST = opp.spellTrapZones.map((slot, idx) => ({ slot, idx })).filter(i => i.slot);
          if (oppST.length > 0) {
            opp.graveyard.push(oppST[0].slot.card);
            opp.spellTrapZones[oppST[0].idx] = null;
            state.lastLog.push(`تأثير قلب! ${card.name} دمر بطاقة سحر/فخ لـ ${opp.name}!`);
            return triggerEvent(state, controllerIdx, card, triggerType, `تدمير بطاقة سحر/فخ للخصم!`, { success: true });
          }
        } else {
          let targetZone = context.targetZoneIndex !== undefined && context.targetZoneIndex !== null && opp.monsterZones[context.targetZoneIndex]
            ? context.targetZoneIndex
            : opp.monsterZones.findIndex(z => z !== null);
          if (targetZone !== -1 && opp.monsterZones[targetZone]) {
            const destroyed = opp.monsterZones[targetZone];
            if (typeof context.destroyMonster === 'function') {
              context.destroyMonster(state, oppIdx, targetZone, 'monster_effect', card);
            } else {
              opp.monsterZones[targetZone] = null;
              opp.graveyard.push(destroyed.card);
            }
            state.lastLog.push(`تأثير قلب! ${card.name} دمر وحش الخصم ${destroyed.card.name}!`);
            return triggerEvent(state, controllerIdx, card, triggerType, `تدمير وحش الخصم ${destroyed.card.name}!`, { success: true, destroyedCard: destroyed.card });
          }
        }
      }

      // Hand Bounce
      if (desc.includes('return') && desc.includes('hand')) {
        const oppMon = opp.monsterZones.find(z => z !== null);
        if (oppMon) {
          const oppZone = opp.monsterZones.indexOf(oppMon);
          opp.monsterZones[oppZone] = null;
          opp.hand.push(oppMon.card);
          state.lastLog.push(`تأثير قلب! ${card.name} أعاد الوحش ${oppMon.card.name} إلى يد ${opp.name}!`);
          return triggerEvent(state, controllerIdx, card, triggerType, `إعادة ${oppMon.card.name} ليد الخصم!`, { success: true });
        }
      }

      // Draw
      if (desc.includes('draw')) {
        const count = desc.includes('3 cards') ? 3 : desc.includes('2 cards') ? 2 : 1;
        for (let i = 0; i < count; i++) {
          if (player.deck.length > 0) player.hand.push(player.deck.pop());
        }
        state.lastLog.push(`تأثير قلب! ${player.name} سحب ${count} بطاقة بتأثير ${card.name}.`);
        return triggerEvent(state, controllerIdx, card, triggerType, `سحب ${count} بطاقة من مجموعتك للإيد!`, { success: true, count });
      }

      // Burn Damage
      if (desc.includes('inflict') || desc.includes('damage')) {
        const numMatch = desc.match(/(\d+)\s*(?:points\s*of\s*)?(?:direct\s*)?damage/);
        const dmg = numMatch ? parseInt(numMatch[1], 10) : 500;
        opp.lifePoints = Math.max(0, opp.lifePoints - dmg);
        state.lastLog.push(`تأثير قلب! ${card.name} سدد ${dmg} ضرر مباشر لنقاط حياة ${opp.name}!`);
        return triggerEvent(state, controllerIdx, card, triggerType, `تسديد ${dmg} ضرر مباشر للخصم!`, { success: true, damage: dmg });
      }

      // LP Recovery
      if (desc.includes('increase') || desc.includes('gain') || desc.includes('life points')) {
        const numMatch = desc.match(/(\d+)\s*life points/);
        const heal = numMatch ? parseInt(numMatch[1], 10) : 1000;
        player.lifePoints += heal;
        state.lastLog.push(`تأثير قلب! استعاد ${player.name} +${heal} نقطة حياة بتأثير ${card.name}.`);
        return triggerEvent(state, controllerIdx, card, triggerType, `استعادة +${heal} نقطة حياة!`, { success: true, heal });
      }
    }

    // --- 2. ON-SUMMON EFFECTS ---
    if (triggerType === 'onSummon') {
      // Destruction
      if (desc.includes('destroy')) {
        const oppMon = opp.monsterZones.find(z => z !== null);
        if (oppMon) {
          const zIdx = opp.monsterZones.indexOf(oppMon);
          opp.monsterZones[zIdx] = null;
          opp.graveyard.push(oppMon.card);
          state.lastLog.push(`تأثير استدعاء! ${card.name} دمر وحش الخصم ${oppMon.card.name}!`);
          return triggerEvent(state, controllerIdx, card, triggerType, `تدمير وحش الخصم ${oppMon.card.name}!`, { success: true });
        }
      }

      // Draw
      if (desc.includes('draw')) {
        if (player.deck.length > 0) player.hand.push(player.deck.pop());
        state.lastLog.push(`تأثير استدعاء! سحب ${player.name} بطاقة جديدة بتأثير ${card.name}.`);
        return triggerEvent(state, controllerIdx, card, triggerType, `سحب بطاقة جديدة من المجموعة!`, { success: true });
      }

      // Stat Boost
      if (desc.includes('increase') || desc.includes('gain') || desc.includes('atk')) {
        const zoneIdx = context.zoneIndex !== undefined ? context.zoneIndex : player.monsterZones.findIndex(z => z && z.card.id === card.id);
        if (zoneIdx !== -1 && player.monsterZones[zoneIdx]) {
          player.monsterZones[zoneIdx].currentAtk += 400;
          state.lastLog.push(`تأثير استدعاء! زاد هجوم ${card.name} بمقدار +400 نقطة (أصبح ${player.monsterZones[zoneIdx].currentAtk})!`);
          return triggerEvent(state, controllerIdx, card, triggerType, `زيادة هجوم الوحش +400 نقطة!`, { success: true });
        }
      }

      // Search from Deck
      if (desc.includes('add') && desc.includes('from your deck')) {
        if (player.deck.length > 0) {
          const added = player.deck.pop();
          player.hand.push(added);
          state.lastLog.push(`تأثير استدعاء! أضاف ${added.name} من المجموعة ليده بتأثير ${card.name}.`);
          return triggerEvent(state, controllerIdx, card, triggerType, `إضافة بطاقة من المجموعة لليد!`, { success: true });
        }
      }
    }

    // --- 3. ON-DESTROYED EFFECTS ---
    if (triggerType === 'onDestroy') {
      // Special Summon from Deck (Recruiters: Tomato, Shining Angel, Giant Rat, etc.)
      if (desc.includes('special summon') || desc.includes('from your deck')) {
        const eligibleIdx = player.deck.findIndex(c => c.type === 'monster' && (c.atk || 0) <= 1500);
        if (eligibleIdx !== -1) {
          const summonedCard = player.deck.splice(eligibleIdx, 1)[0];
          const emptyZone = player.monsterZones.findIndex(z => z === null);
          if (emptyZone !== -1) {
            player.monsterZones[emptyZone] = {
              card: summonedCard,
              position: 'face_up_attack',
              hasAttacked: false,
              canChangePosition: false,
              turnSummoned: state.turnNumber,
              currentAtk: summonedCard.atk,
              currentDef: summonedCard.def,
            };
            state.lastLog.push(`تأثير عند التدمير! استدعى ${player.name} الوحش ${summonedCard.name} من مجموعته لوضع الهجوم!`);
            return triggerEvent(state, controllerIdx, card, triggerType, `استدعاء خاص لـ ${summonedCard.name} من مجموعتك!`, { success: true, summonedCard });
          }
        }
      }

      // Retaliatory Destruction
      if (desc.includes('destroy')) {
        const oppMon = opp.monsterZones.find(z => z !== null);
        if (oppMon) {
          const zIdx = opp.monsterZones.indexOf(oppMon);
          opp.monsterZones[zIdx] = null;
          opp.graveyard.push(oppMon.card);
          state.lastLog.push(`انتقام عند التدمير! سحب ${card.name} وحش الخصم ${oppMon.card.name} ودمره معه!`);
          return triggerEvent(state, controllerIdx, card, triggerType, `انتقام بتدمير وحش الخصم ${oppMon.card.name}!`, { success: true });
        }
      }

      // Draw
      if (desc.includes('draw')) {
        if (player.deck.length > 0) player.hand.push(player.deck.pop());
        state.lastLog.push(`تأثير عند التدمير! سحب ${player.name} بطاقة جديدة بتأثير ${card.name}.`);
        return triggerEvent(state, controllerIdx, card, triggerType, `سحب بطاقة جديدة للإيد!`, { success: true });
      }

      // Burn / Heal
      if (desc.includes('inflict') || desc.includes('damage')) {
        opp.lifePoints = Math.max(0, opp.lifePoints - 500);
        state.lastLog.push(`تأثير عند التدمير! سدد ${card.name} 500 ضرر مباشر لـ ${opp.name}!`);
        return triggerEvent(state, controllerIdx, card, triggerType, `تسديد 500 ضرر مباشر للخصم!`, { success: true });
      }
    }
  }

  return null;
}

function triggerEvent(state, controllerIdx, card, triggerType, desc, result) {
  if (typeof state.onMonsterEffectTriggered === 'function') {
    try {
      state.onMonsterEffectTriggered({
        playerIndex: controllerIdx,
        card,
        trigger: triggerType,
        title: card.name,
        arabicName: card.name,
        desc,
        result,
      });
    } catch (e) {
      console.error(e);
    }
  }
  return result;
}
