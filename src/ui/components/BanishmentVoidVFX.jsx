import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * BanishmentVoidVFX
 * Simulates cosmic dimensional rift tearing open and sucking the card
 * into the banished void (Removed from Play).
 */
export function BanishmentVoidVFX({ banish, onComplete }) {
  if (!banish || !banish.card) return null;

  const {
    card,
    label = 'تم النفي إلى البعد الآخر (Banished from the Duel)',
    title = '',
  } = banish;

  const [phase, setPhase] = useState('opening'); // 'opening' | 'swallowing' | 'sealed'

  useEffect(() => {
    soundManager.playDarkConsume();
    hapticManager.triggerCombatVibration('attack');

    const t1 = setTimeout(() => {
      setPhase('swallowing');
    }, 450);

    const t2 = setTimeout(() => {
      setPhase('sealed');
      soundManager.playDestroy();
    }, 1250);

    const t3 = setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [banish, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3760,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Cosmic Dimensional Rift (Swirling cyan / purple black hole) */}
      <div className={`cosmic-rift-portal ${phase}`}>
        <div className="rift-event-horizon" />
        <div className="rift-lightning-ring" />
      </div>

      {/* The Banished Card collapsing into the wormhole */}
      <div className={`banished-card-element ${phase}`}>
        <img
          src={getCardImageUrl(card, 'full')}
          alt={card.name}
          onError={(e) => {
            const fallback = getCardImageUrl(card, 'mini');
            if (e.target.src !== fallback) e.target.src = fallback;
          }}
        />
        <div className="banish-spark-disintegration" />
      </div>

      {/* Dimensional Banner */}
      <div className="banish-announcement-banner">
        <div className="banish-banner-tag">
          🌌 النفي البعدي (Dimensional Banishment)
        </div>
        <div className="banish-banner-desc">
          {label || `طُرد [ ${card.arabicName || card.name} ] خارج أبعاد اللعبة!`}
        </div>
      </div>
    </div>
  );
}

export default BanishmentVoidVFX;

