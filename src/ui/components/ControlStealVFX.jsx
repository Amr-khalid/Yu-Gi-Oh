import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * ControlStealVFX
 * Simulates mind control and physical field crossing for:
 * 1. Change of Heart (angelic pink wings & tender halo).
 * 2. Snatch Steal / Brain Control (golden hypnotic puppet chains).
 * 3. Creature Swap (dual diagonal card crossing).
 * 4. Relinquished (demonic gravitational absorption tendrils).
 */
export function ControlStealVFX({ steal, onComplete }) {
  if (!steal || !steal.card) return null;

  const {
    type = 'change_of_heart', // 'change_of_heart' | 'snatch_steal' | 'brain_control' | 'creature_swap' | 'relinquished'
    card,
    targetMonsterName = '',
    label = '',
  } = steal;

  const [phase, setPhase] = useState('tethering'); // 'tethering' | 'crossing' | 'captured'

  useEffect(() => {
    soundManager.playMagic();
    hapticManager.triggerCombatVibration('magic');

    const t1 = setTimeout(() => {
      setPhase('crossing');
      if (typeof soundManager.playCardMove === 'function') {
        soundManager.playCardMove();
      }
    }, 600);

    const t2 = setTimeout(() => {
      setPhase('captured');
      soundManager.play('decide');
      hapticManager.triggerCombatVibration('attack');
    }, 1400);

    const t3 = setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [steal, onComplete]);

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
      {/* 1. Angelic Wings for Change of Heart */}
      {type === 'change_of_heart' && (
        <div className="steal-angel-wings">
          <div className="angel-wing left-wing">🪽</div>
          <div className="angel-halo">♡</div>
          <div className="angel-wing right-wing">🪽</div>
        </div>
      )}

      {/* 2. Hypnotic Chains for Snatch Steal & Brain Control */}
      {(type === 'snatch_steal' || type === 'brain_control') && (
        <div className="steal-hypnotic-chains">
          <div className="chain-link chain-1" />
          <div className="chain-link chain-2" />
          <div className="chain-eye">👁️</div>
        </div>
      )}

      {/* 3. Absorption Tendrils for Relinquished */}
      {type === 'relinquished' && (
        <div className="steal-relinquished-vortex">
          <div className="vortex-black-hole" />
        </div>
      )}

      {/* The Monster Card physically gliding across the field */}
      <div className={`steal-card-glider ${phase} type-${type}`}>
        <img
          src={getCardImageUrl(card, 'full')}
          alt={card.name}
          className="steal-card-image"
          onError={(e) => {
            const fallback = getCardImageUrl(card, 'mini');
            if (e.target.src !== fallback) e.target.src = fallback;
          }}
        />
        <div className="steal-card-aura" />
      </div>

      {/* Control Steal Banner */}
      <div className="steal-announcement-banner">
        <div className="steal-banner-tag">
          {type === 'change_of_heart' ? '💖 تغيير القلوب (Change of Heart)' :
           type === 'snatch_steal' ? '⛓️ السرقة الخاطفة (Snatch Steal)' :
           type === 'brain_control' ? '🧠 التحكم العقلي (Brain Control)' :
           type === 'creature_swap' ? '🔄 تبادل المخلوقات (Creature Swap)' :
           '👁️ امتصاص المتخلي (Relinquished Equip)'}
        </div>
        <div className="steal-banner-desc">
          {label || `تمت السيطرة على [ ${card.arabicName || card.name} ] ونقله إلى صفوفك!`}
        </div>
      </div>
    </div>
  );
}

export default ControlStealVFX;

