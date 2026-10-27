import React, { useEffect, useState } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

export const ShuffleAnimation = ({ onComplete, playerName = 'المبارز', opponentName = 'سيتو كايبا' }) => {
  const [stage, setStage] = useState('shuffling'); // 'shuffling' | 'cutting' | 'complete'

  useEffect(() => {
    // Initial sound & haptic
    soundManager.playCardMove();
    hapticManager.triggerCombatVibration('shuffle');

    const s1 = setTimeout(() => {
      soundManager.playCardMove();
      setStage('cutting');
    }, 1100);

    const s2 = setTimeout(() => {
      soundManager.playCardOpen();
      setStage('complete');
    }, 2000);

    const s3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(30, 20, 10, 0.94) 0%, rgba(8, 6, 4, 0.98) 85%)',
        backdropFilter: 'blur(10px)',
        direction: 'rtl',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {/* Pharaonic Millennium Eye & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 32,
          animation: 'fadeDown 0.5s ease-out',
        }}
      >
        <svg width="48" height="38" viewBox="0 0 100 80" fill="none">
          <path d="M 10,35 Q 50,12 90,35 Q 50,56 10,35 Z" stroke="var(--pharaoh-gold-bright)" strokeWidth="4" />
          <circle cx="50" cy="34" r="8" fill="var(--pharaoh-gold-bright)" />
          <path d="M 50,47 L 50,70" stroke="var(--pharaoh-gold-bright)" strokeWidth="4" />
        </svg>

        <h2
          style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 900,
            color: 'var(--pharaoh-gold-bright)',
            marginTop: 8,
            letterSpacing: 1.5,
            textShadow: '0 0 20px rgba(240, 203, 100, 0.6)',
          }}
        >
          {stage === 'cutting' ? 'تظبيط وقص المجموعة' : 'تفنيط الكروت'}
        </h2>

        <p style={{ fontSize: 13, color: 'var(--pharaoh-text-muted)', marginTop: 4 }}>
          {playerName} ضد {opponentName}
        </p>
      </div>

      {/* 3D Animated Shuffling Decks */}
      <div
        style={{
          position: 'relative',
          width: 260,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: 1000,
        }}
      >
        {/* Left Fan of Shuffling Cards */}
        {[-3, -2, -1, 0].map((offset, i) => (
          <div
            key={`shuffle-l-${i}`}
            className="shuffle-card-left"
            style={{
              position: 'absolute',
              width: 90,
              height: 132,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 175, 55, 0.3)',
              border: '1.5px solid var(--pharaoh-gold-royal)',
              animationDelay: `${i * 0.12}s`,
              transform: `translate(${offset * 12}px, ${offset * 3}px) rotate(${offset * 6}deg)`,
              zIndex: 10 + i,
            }}
          >
            <img
              src="/assets/card_back.png"
              alt="Deck card"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}

        {/* Right Fan of Shuffling Cards */}
        {[0, 1, 2, 3].map((offset, i) => (
          <div
            key={`shuffle-r-${i}`}
            className="shuffle-card-right"
            style={{
              position: 'absolute',
              width: 90,
              height: 132,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 175, 55, 0.3)',
              border: '1.5px solid var(--pharaoh-gold-royal)',
              animationDelay: `${i * 0.12 + 0.06}s`,
              transform: `translate(${offset * 12}px, ${offset * -3}px) rotate(${offset * -6}deg)`,
              zIndex: 20 + i,
            }}
          >
            <img
              src="/assets/card_back.png"
              alt="Deck card"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}

        {/* Center Golden Deck Stack Base */}
        <div
          className="shuffle-deck-tap"
          style={{
            position: 'absolute',
            width: 94,
            height: 136,
            borderRadius: 6,
            overflow: 'hidden',
            border: '2px solid var(--pharaoh-gold-bright)',
            boxShadow: '0 0 30px rgba(240, 203, 100, 0.5), 0 12px 30px rgba(0, 0, 0, 0.95)',
            zIndex: 35,
          }}
        >
          <img
            src="/assets/card_back.png"
            alt="Main deck"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      {/* Progress / Status Hint */}
      <div
        style={{
          marginTop: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 140,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #ca8a04, #facc15)',
              width: stage === 'complete' ? '100%' : stage === 'cutting' ? '65%' : '35%',
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={() => {
            soundManager.playDecide();
            if (onComplete) onComplete();
          }}
          className="btn-pharaoh-stone"
          style={{
            padding: '6px 20px',
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 20,
            color: 'var(--pharaoh-text-gold)',
            border: '1px solid var(--pharaoh-gold-bright)',
            background: 'rgba(20, 16, 10, 0.8)',
            cursor: 'pointer',
          }}
        >
          تخطي ⏩
        </button>
      </div>
    </div>
  );
};

export default ShuffleAnimation;
