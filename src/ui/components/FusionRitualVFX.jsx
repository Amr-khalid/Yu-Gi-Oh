import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * FusionRitualVFX
 * Fusion Vortex and Ritual Altar summoning simulation:
 * Dual swirling elemental galaxy vortex converging into boss monster explosion.
 */
export function FusionRitualVFX({ summon, onComplete }) {
  if (!summon || !summon.bossCard) return null;

  const {
    type = 'fusion', // 'fusion' | 'ritual'
    bossCard,
    materials = [],
    label = '',
    title = '',
  } = summon;

  const [phase, setPhase] = useState('vortex'); // 'vortex' | 'burst' | 'emerging' | 'resolved'

  useEffect(() => {
    soundManager.playMagic();
    hapticManager.triggerCombatVibration('magic');

    const t1 = setTimeout(() => {
      setPhase('burst');
      soundManager.playDragonRoar();
      hapticManager.triggerCombatVibration('attack');
    }, 900);

    const t2 = setTimeout(() => {
      setPhase('emerging');
      soundManager.playSummon();
    }, 1400);

    const t3 = setTimeout(() => {
      setPhase('resolved');
      if (typeof onComplete === 'function') onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [summon, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3820,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 1. Fusion / Ritual Vortex Cosmic Spiral */}
      <div className={`fusion-cosmic-vortex ${type} ${phase}`}>
        <div className="vortex-spiral spiral-1" />
        <div className="vortex-spiral spiral-2" />
        {type === 'ritual' && <div className="ritual-flame-circle" />}
      </div>

      {/* 2. Emerging Boss Monster */}
      <div className={`fusion-boss-holder ${phase}`}>
        <div className="boss-godly-aura" />
        <img
          src={getCardImageUrl(bossCard, 'full')}
          alt={bossCard.name}
          className="fusion-boss-image"
          onError={(e) => {
            const fallback = getCardImageUrl(bossCard, 'mini');
            if (e.target.src !== fallback) e.target.src = fallback;
          }}
        />
      </div>

      {/* Announcement Banner */}
      <div className="fusion-announcement-banner">
        <div className="fusion-banner-tag">
          {type === 'fusion' ? '🌀 استدعاء بالدمج الخارق (Fusion Summon)' :
           '🕯️ استدعاء طقوسي أسطوري (Ritual Summon)'}
        </div>
        <div className="fusion-banner-title">
          {bossCard.arabicName || bossCard.name}
        </div>
        <div className="fusion-banner-desc">
          {label || (type === 'fusion'
            ? 'انصهرت وحوش الدمج لتلد القوة الأسطورية!'
            : 'قُدمت الأضاحي واستُجيبت دعوة الطقوس!')}
        </div>
      </div>
    </div>
  );
}

export default FusionRitualVFX;

