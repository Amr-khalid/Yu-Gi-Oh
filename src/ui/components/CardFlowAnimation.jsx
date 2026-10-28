import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/**
 * CardFlowAnimation
 * Multi-card rapid stream flight animation from Deck to Hand (or Hand to GY)
 * for Pot of Greed, Graceful Charity, Sangan, etc.
 */
export function CardFlowAnimation({ flow, onComplete }) {
  if (!flow) return null;

  const {
    count = 2,
    label = '+2 بطاقات من المجموعة',
    origin = 'deck', // 'deck' | 'hand'
    destination = 'hand', // 'hand' | 'graveyard'
    sourceRect = null,
    targetRect = null,
  } = flow;

  const [cardsDrawn, setCardsDrawn] = useState([]);

  useEffect(() => {
    soundManager.play('cardOpen');
    hapticManager.triggerCombatVibration('click');

    const timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          setCardsDrawn((prev) => [...prev, i]);
          soundManager.playCardMove();
          hapticManager.triggerCombatVibration('click');
        }, i * 220)
      );
    }

    const completeTimer = setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, count * 220 + 800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [flow, count, onComplete]);

  const defaultStartX = window.innerWidth - 60;
  const defaultStartY = window.innerHeight - 140;
  const defaultEndX = window.innerWidth / 2;
  const defaultEndY = window.innerHeight - 50;

  const startX = sourceRect ? sourceRect.left + sourceRect.width / 2 : defaultStartX;
  const startY = sourceRect ? sourceRect.top + sourceRect.height / 2 : defaultStartY;
  const endX = targetRect ? targetRect.left + targetRect.width / 2 : defaultEndX;
  const endY = targetRect ? targetRect.top + targetRect.height / 2 : defaultEndY;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3850,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Floating Badge */}
      <div
        className="stone-panel"
        style={{
          position: 'absolute',
          left: '50%',
          top: '32%',
          transform: 'translateX(-50%)',
          padding: '6px 16px',
          borderRadius: 20,
          background: 'rgba(12, 10, 7, 0.94)',
          border: '1.5px solid #10b981',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
          color: '#6ee7b7',
          fontWeight: 900,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          animation: 'panelSlideDown 0.3s ease-out',
        }}
      >
        <span>🎴</span>
        <span>{label}</span>
      </div>

      {/* Rapid Sequential Card Flights */}
      {cardsDrawn.map((idx) => {
        const offsetAngle = (idx - count / 2) * 8;
        return (
          <div
            key={`flight-card-${idx}`}
            className="card-flow-stream-item"
            style={{
              '--start-x': `${startX}px`,
              '--start-y': `${startY}px`,
              '--end-x': `${endX + (idx - 1) * 35}px`,
              '--end-y': `${endY}px`,
              '--rot': `${offsetAngle}deg`,
            }}
          >
            <div className="card-flow-back-visual">
              <div className="card-flow-back-swirl" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CardFlowAnimation;

