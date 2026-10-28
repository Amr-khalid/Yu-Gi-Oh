import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * GraveyardRebirthVFX
 * Comprehensive simulation for all 5 variations of Graveyard rebirth:
 * 1. own_gy: Ethereal green/gold pillar from own graveyard.
 * 2. either_gy / theft: Sacred Egyptian Ankh (☥) pulling card across field.
 * 3. blood_cost: Screen blood-pulse vignette + procedural heartbeat + LP deduction badge (-800 / -1500 LP).
 * 4. recycle: Arc flight into hand drawer with +1 / +2 recycle badge.
 * 5. phoenix: Blazing firebird phoenix / dark mist eruption into monster slot.
 */
export function GraveyardRebirthVFX({ rebirth, onComplete }) {
  if (!rebirth || !rebirth.card) return null;

  const {
    mode = 'own_gy', // 'own_gy' | 'either_gy' | 'theft' | 'blood_cost' | 'recycle' | 'phoenix'
    card,
    lpCost = 800,
    label = '',
    title = '',
    targetZone = 2,
    isOpponentTarget = false,
  } = rebirth;

  const [stage, setStage] = useState('init'); // 'init' | 'rising' | 'landing' | 'resolved'

  useEffect(() => {
    // 1. Initial trigger SFX based on mode
    if (mode === 'blood_cost') {
      soundManager.playHeartbeat();
      hapticManager.triggerCombatVibration('attack');
      setTimeout(() => {
        soundManager.playDamage();
      }, 350);
      setTimeout(() => {
        soundManager.playMagic();
      }, 700);
    } else if (mode === 'phoenix') {
      soundManager.playDragonRoar();
      hapticManager.triggerCombatVibration('attack');
      setTimeout(() => {
        soundManager.playMagic();
      }, 450);
    } else if (mode === 'recycle') {
      soundManager.play('cardOpen');
      hapticManager.triggerCombatVibration('click');
    } else {
      soundManager.playMagic();
      hapticManager.triggerCombatVibration('summon');
    }

    const t1 = setTimeout(() => setStage('rising'), 150);
    const t2 = setTimeout(() => {
      setStage('landing');
      if (mode !== 'recycle') {
        soundManager.playSummon();
        hapticManager.triggerCombatVibration('summon');
      }
    }, 1100);

    const t3 = setTimeout(() => {
      setStage('resolved');
      if (typeof onComplete === 'function') onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [rebirth, mode, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3780,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Mode C: Blood Cost Red Vignette Flash */}
      {mode === 'blood_cost' && (
        <div className="rebirth-blood-vignette" />
      )}

      {/* Mode B: Sacred Ankh Egyptian Symbol of Life */}
      {(mode === 'either_gy' || mode === 'theft') && (
        <div className="rebirth-ankh-symbol">
          <span>☥</span>
        </div>
      )}

      {/* Mode E: Phoenix Fire Wings Eruption */}
      {mode === 'phoenix' && (
        <div className="rebirth-phoenix-aura">
          <div className="phoenix-wing wing-left" />
          <div className="phoenix-wing wing-right" />
        </div>
      )}

      {/* Center Rising Card Hologram */}
      <div className={`rebirth-card-pod ${stage}`}>
        {/* Luminous Rebirth Pillar of Light */}
        <div className={`rebirth-light-pillar ${mode}`} />

        <div className="rebirth-card-frame">
          <img
            src={getCardImageUrl(card, 'full')}
            alt={card.name}
            onError={(e) => {
              const fallback = getCardImageUrl(card, 'mini');
              if (e.target.src !== fallback) e.target.src = fallback;
            }}
          />
        </div>

        {/* Mode C: Blood / LP Cost Floating Badge */}
        {mode === 'blood_cost' && lpCost > 0 && (
          <div className="rebirth-lp-cost-badge">
            <span className="badge-drop-icon">🩸</span>
            <span>-{lpCost} LP ثمن القربان</span>
          </div>
        )}

        {/* Mode E: Phoenix Badge */}
        {mode === 'phoenix' && (
          <div className="rebirth-phoenix-badge">
            <span>🔥 بعث الفينيق المقدس من الرماد!</span>
          </div>
        )}

        {/* Mode D: Recycle to Hand Badge */}
        {mode === 'recycle' && (
          <div className="rebirth-recycle-badge">
            <span>🎴 استعادة لليد: {card.arabicName || card.name}</span>
          </div>
        )}
      </div>

      {/* Upper Cartouche Announcement */}
      <div className="rebirth-announcement-cartouche">
        <div className="rebirth-cartouche-title">
          {mode === 'blood_cost' ? '🩸 إحياء بتضحية نقاط الحياة (Blood Rebirth)' :
           mode === 'either_gy' ? '☥ ولادة مقدسة من المقبرة (Monster Reborn)' :
           mode === 'theft' ? '𓋹 استيلاء على وحش من مقبرة الخصم!' :
           mode === 'recycle' ? '♻️ استرجاع بطاقة من المقبرة لليد' :
           mode === 'phoenix' ? '🔥 انبعاث أسطوري تلقائي من المقبرة!' :
           '✨ ولادة الوحش: استدعاء خاص من المقبرة'}
        </div>
        <div className="rebirth-cartouche-desc">
          {label || title || `${card.arabicName || card.name} ينهض مجدداً إلى ساحة المعركة!`}
        </div>
      </div>
    </div>
  );
}

export default GraveyardRebirthVFX;

