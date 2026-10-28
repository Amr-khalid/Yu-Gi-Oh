import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/**
 * DiceCoinSimulator
 * Simulates 3D Egyptian tumbling dice and spinning Millennium coins with realistic physics,
 * sound choreography, and dramatic outcome reveals.
 */
export function DiceCoinSimulator({ simulation, onComplete }) {
  if (!simulation) return null;

  const {
    type = 'dice', // 'dice' | 'coin'
    outcome = 1,   // 1-6 for dice, 'heads' | 'tails' for coin
    cardName = '',
    arabicName = '',
    title = '',
    description = '',
  } = simulation;

  const isDice = type === 'dice';
  const [phase, setPhase] = useState('tumbling'); // 'tumbling' | 'landed' | 'resolved'
  const [displayOutcome, setDisplayOutcome] = useState(outcome);

  useEffect(() => {
    // 1. Play tumble sound & vibration
    if (isDice) {
      soundManager.play('cardMove');
      if (typeof soundManager.playDiceRoll === 'function') {
        soundManager.playDiceRoll();
      }
      hapticManager.triggerCombatVibration('click');
    } else {
      soundManager.playCoin();
      hapticManager.triggerCombatVibration('click');
    }

    // 2. Landing moment after 1200ms
    const landTimer = setTimeout(() => {
      setPhase('landed');
      setDisplayOutcome(outcome);
      soundManager.play('decide');
      hapticManager.triggerCombatVibration('attack');
    }, 1250);

    // 3. Complete and dismiss after 2800ms
    const doneTimer = setTimeout(() => {
      setPhase('resolved');
      if (typeof onComplete === 'function') {
        onComplete(outcome);
      }
    }, 2800);

    return () => {
      clearTimeout(landTimer);
      clearTimeout(doneTimer);
    };
  }, [simulation, isDice, outcome, onComplete]);

  // Dice face rotation mapping:
  // Face 1: rotateY(0deg)
  // Face 2: rotateY(-90deg)
  // Face 3: rotateX(-90deg)
  // Face 4: rotateX(90deg)
  // Face 5: rotateY(90deg)
  // Face 6: rotateY(180deg)
  const getDiceRotation = () => {
    if (phase === 'tumbling') {
      return 'rotateX(720deg) rotateY(1080deg) rotateZ(360deg)';
    }
    switch (displayOutcome) {
      case 1: return 'rotateX(0deg) rotateY(0deg)';
      case 2: return 'rotateX(0deg) rotateY(-90deg)';
      case 3: return 'rotateX(-90deg) rotateY(0deg)';
      case 4: return 'rotateX(90deg) rotateY(0deg)';
      case 5: return 'rotateX(0deg) rotateY(90deg)';
      case 6: return 'rotateX(0deg) rotateY(180deg)';
      default: return 'rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3900,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(15, 11, 7, 0.6) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)',
        animation: 'simFadeIn 0.3s ease-out forwards',
        direction: 'rtl',
      }}
    >
      {/* Upper Cartouche Announcement */}
      <div
        className="stone-panel"
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          border: '1.5px solid var(--pharaoh-gold-bright, #f59e0b)',
          background: 'rgba(12, 9, 6, 0.95)',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
          textAlign: 'center',
          marginBottom: 24,
          animation: 'panelSlideDown 0.35s ease-out',
        }}
      >
        <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 900, letterSpacing: 0.5 }}>
          {isDice ? '🎲 تدحرج حجر النرد السحري' : '🪙 رمية عملة الألفية المقدسة'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginTop: 2 }}>
          {title || arabicName || cardName}
        </div>
      </div>

      {/* 3D Dice / Coin Arena */}
      <div
        style={{
          width: 140,
          height: 140,
          perspective: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isDice ? (
          /* 3D CSS Cube Die */
          <div
            className={`egyptian-3d-die ${phase === 'tumbling' ? 'is-tumbling' : 'has-landed'}`}
            style={{
              width: 76,
              height: 76,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: getDiceRotation(),
              transition: phase === 'landed' ? 'transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'none',
            }}
          >
            {/* 6 Die Faces with Gold Hieroglyphic Pips */}
            <div className="die-face face-1"><span className="pip pip-center" /></div>
            <div className="die-face face-2"><span className="pip pip-tl" /><span className="pip pip-br" /></div>
            <div className="die-face face-3"><span className="pip pip-tl" /><span className="pip pip-center" /><span className="pip pip-br" /></div>
            <div className="die-face face-4"><span className="pip pip-tl" /><span className="pip pip-tr" /><span className="pip pip-bl" /><span className="pip pip-br" /></div>
            <div className="die-face face-5"><span className="pip pip-tl" /><span className="pip pip-tr" /><span className="pip pip-center" /><span className="pip pip-bl" /><span className="pip pip-br" /></div>
            <div className="die-face face-6">
              <span className="pip pip-tl" /><span className="pip pip-tr" />
              <span className="pip pip-ml" /><span className="pip pip-mr" />
              <span className="pip pip-bl" /><span className="pip pip-br" />
            </div>
          </div>
        ) : (
          /* 3D Millennium Coin */
          <div
            className={`millennium-3d-coin ${phase === 'tumbling' ? 'is-flipping' : 'has-landed'}`}
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: phase === 'tumbling'
                ? 'rotateX(1440deg) rotateY(720deg)'
                : outcome === 'heads'
                ? 'rotateX(0deg)'
                : 'rotateX(180deg)',
              transition: phase === 'landed' ? 'transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28)' : 'none',
            }}
          >
            {/* Heads: Eye of Horus */}
            <div className="coin-face coin-heads">
              <svg width="42" height="42" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" stroke="#facc15" strokeWidth="4" />
                <path d="M 20 48 Q 50 18 80 48 Q 50 78 20 48 Z" stroke="#facc15" strokeWidth="4" fill="none" />
                <circle cx="50" cy="48" r="12" fill="#facc15" />
                <path d="M 50 60 L 50 82 M 40 70 L 60 70" stroke="#facc15" strokeWidth="3" />
              </svg>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#fef08a', marginTop: 2 }}>وجه (Heads)</span>
            </div>

            {/* Tails: Millennium Puzzle */}
            <div className="coin-face coin-tails">
              <svg width="42" height="42" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" stroke="#facc15" strokeWidth="4" />
                <polygon points="50,18 20,78 80,78" stroke="#facc15" strokeWidth="4" fill="none" />
                <circle cx="50" cy="54" r="8" fill="#facc15" />
              </svg>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#fef08a', marginTop: 2 }}>ظهر (Tails)</span>
            </div>
          </div>
        )}

        {/* Landing Ground Shadow & Shockwave */}
        <div
          className={`die-ground-shadow ${phase === 'landed' ? 'shockwave-active' : ''}`}
          style={{
            position: 'absolute',
            bottom: -15,
            width: 80,
            height: 24,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.8) 0%, transparent 75%)',
          }}
        />
      </div>

      {/* Outcome Banner (Appears on landing) */}
      {phase !== 'tumbling' && (
        <div
          className="stone-panel"
          style={{
            marginTop: 22,
            padding: '8px 22px',
            borderRadius: 8,
            border: '2px solid #facc15',
            background: 'rgba(16, 11, 6, 0.96)',
            boxShadow: '0 0 30px rgba(250, 204, 21, 0.75), inset 0 0 15px rgba(245, 158, 11, 0.25)',
            textAlign: 'center',
            animation: 'simOutcomePop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: '#facc15', textShadow: '0 0 12px rgba(250, 204, 21, 0.8)' }}>
            {isDice ? `⚄ نتيجة النرد: [ ${displayOutcome} ]` : `🪙 نتيجة العملة: [ ${displayOutcome === 'heads' ? 'وجه' : 'ظهر'} ]`}
          </div>
          {description && (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fef08a', marginTop: 3 }}>
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default DiceCoinSimulator;

