import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * StatModifierVFX
 * ATK/DEF manipulation & Equip Spell enhancement simulation:
 * Renders glowing power aura, floating equip icons, and animated numeric delta pill (+1000 ATK / -50% ATK).
 */
export function StatModifierVFX({ stat, onComplete }) {
  if (!stat || !stat.monsterCard) return null;

  const {
    monsterCard,
    equipCard = null,
    atkDelta = 1000,
    defDelta = 0,
    isBoost = true, // true: power increase (green/gold), false: shrink/drain (red/purple)
    label = '',
  } = stat;

  const [phase, setPhase] = useState('flare'); // 'flare' | 'floating' | 'done'

  useEffect(() => {
    if (isBoost) {
      soundManager.playMagic();
      hapticManager.triggerCombatVibration('attack');
    } else {
      soundManager.playSynthesized('darkConsume', 0.85);
      hapticManager.triggerCombatVibration('attack');
    }

    const t1 = setTimeout(() => setPhase('floating'), 500);
    const t2 = setTimeout(() => {
      setPhase('done');
      if (typeof onComplete === 'function') onComplete();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stat, isBoost, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3770,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Power Aura Surge */}
      <div className={`stat-aura-surge ${isBoost ? 'boost-aura' : 'drain-aura'} ${phase}`} />

      {/* Monster Frame */}
      <div className={`stat-monster-frame ${phase}`}>
        <img
          src={getCardImageUrl(monsterCard, 'full')}
          alt={monsterCard.name}
          onError={(e) => {
            const fallback = getCardImageUrl(monsterCard, 'mini');
            if (e.target.src !== fallback) e.target.src = fallback;
          }}
        />

        {/* Floating Numeric Delta Pill */}
        <div className={`stat-delta-pill ${isBoost ? 'is-boost' : 'is-drain'}`}>
          <span className="pill-icon">{isBoost ? '⚔️' : '🔻'}</span>
          <span className="pill-text">
            {isBoost ? `+${atkDelta} ATK` : `${atkDelta} ATK`}
          </span>
          {defDelta !== 0 && (
            <span className="pill-def">
              {defDelta > 0 ? `+${defDelta} DEF` : `${defDelta} DEF`}
            </span>
          )}
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="stat-announcement-banner">
        <div className="stat-banner-tag">
          {equipCard ? `🗡️ بطاقة تجهيز: ${equipCard.arabicName || equipCard.name}` :
           isBoost ? '⚡ تضخيم الهجوم والقوة' : '🌀 تنصيف هجوم الوحش (Shrink)'}
        </div>
        <div className="stat-banner-desc">
          {label || `تغيرت قوة [ ${monsterCard.arabicName || monsterCard.name} ] بمقدار ${atkDelta > 0 ? '+' + atkDelta : atkDelta} نقطة هجوم!`}
        </div>
      </div>
    </div>
  );
}

export default StatModifierVFX;

