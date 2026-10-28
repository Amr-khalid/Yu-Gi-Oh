import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * CounterNegationVFX
 * Spell Speed 3 Counter Trap Negation simulation:
 * Ancient Egyptian Seal of Negation slamming down on the target card
 * with glass shatter effects and immediate cancellation.
 */
export function CounterNegationVFX({ negation, onComplete }) {
  if (!negation || !negation.card) return null;

  const {
    card,
    trapCard = null,
    lpCost = 0,
    title = 'الحكم الصارم (Solemn Judgment)',
    label = 'تم الإبطال المطلق للتأثير وتدمير البطاقة!',
  } = negation;

  const [phase, setPhase] = useState('slam'); // 'slam' | 'shattering' | 'fading'

  useEffect(() => {
    soundManager.playShieldShatter();
    hapticManager.triggerCombatVibration('attack');

    const t1 = setTimeout(() => {
      setPhase('shattering');
      soundManager.playDestroy();
    }, 450);

    const t2 = setTimeout(() => {
      setPhase('fading');
    }, 1300);

    const t3 = setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [negation, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3790,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Red screen shake shockwave */}
      <div className={`negation-screen-flash ${phase}`} />

      {/* The Negated Card being stamped */}
      <div className={`negated-card-holder ${phase}`}>
        <img
          src={getCardImageUrl(card, 'full')}
          alt={card.name}
          onError={(e) => {
            const fallback = getCardImageUrl(card, 'mini');
            if (e.target.src !== fallback) e.target.src = fallback;
          }}
        />

        {/* Ancient Egyptian Seal of Negation Stamp ("مُلغى / NEGATED") */}
        <div className={`seal-of-negation ${phase}`}>
          <div className="seal-circle">
            <span className="seal-eye">𓁹</span>
            <span className="seal-text">مُلغى</span>
            <span className="seal-subtext">NEGATED</span>
          </div>
        </div>

        {/* Glass Shards Burst */}
        {phase === 'shattering' && <div className="negation-glass-burst" />}
      </div>

      {/* Announcement Banner */}
      <div className="negation-announcement-banner">
        <div className="negation-banner-tag">
          ⚡ فخ مضاد قاطع: {title || trapCard?.arabicName || trapCard?.name || 'إبطال قاطع'}
        </div>
        <div className="negation-banner-desc">
          {label || `أبطل مفعول [ ${card.arabicName || card.name} ] وحطمه فوراً!`}
        </div>
        {lpCost > 0 && (
          <div className="negation-lp-cost">
            <span>🩸 دفع نصف نقاط الحياة (Half LP Cost)</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CounterNegationVFX;

