import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/**
 * TrapReactionVFX
 * Dynamic in-field ambush visual reactions:
 * 1. Trap Hole / Bottomless: An abyss chasm opens under the monster slot, swallowing it into the void.
 * 2. Mirror Force: A crystalline hexagonal energy barrier deflects the attack in an explosive blast.
 * 3. Magic Cylinder: Twin cylinders redirecting the attack blast straight into opponent LP.
 */
export function TrapReactionVFX({ reaction, onComplete }) {
  if (!reaction) return null;

  const {
    type = 'trap_hole', // 'trap_hole' | 'bottomless' | 'mirror_force' | 'magic_cylinder'
    card = null,
    targetSlotRect = null,
    title = '',
    desc = '',
  } = reaction;

  const [stage, setStage] = useState('active'); // 'active' | 'exploding' | 'closing'

  useEffect(() => {
    if (type === 'trap_hole' || type === 'bottomless') {
      soundManager.playDestroy();
      hapticManager.triggerCombatVibration('attack');
    } else if (type === 'mirror_force') {
      soundManager.playShieldDeflect();
      hapticManager.triggerCombatVibration('attack');
      setTimeout(() => {
        soundManager.playDestroy();
      }, 500);
    } else if (type === 'magic_cylinder') {
      soundManager.playMagic();
      setTimeout(() => {
        soundManager.playDamage();
      }, 600);
    }

    const t1 = setTimeout(() => setStage('exploding'), 600);
    const t2 = setTimeout(() => setStage('closing'), 1800);
    const t3 = setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reaction, type, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3750,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 1. TRAP HOLE / BOTTOMLESS CHASM */}
      {(type === 'trap_hole' || type === 'bottomless') && (
        <div className="trap-hole-abyss-container">
          <div
            className="trap-hole-chasm"
            style={
              targetSlotRect
                ? {
                    left: targetSlotRect.left + targetSlotRect.width / 2,
                    top: targetSlotRect.top + targetSlotRect.height / 2,
                    transform: 'translate(-50%, -50%)',
                  }
                : {
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                  }
            }
          >
            {/* Cracked ground fissure border */}
            <div className="chasm-cracks" />
            {/* Void swirl portal */}
            <div className={`chasm-void ${type === 'bottomless' ? 'is-bottomless' : ''}`} />
            {/* Falling card phantom sinking into the void */}
            {card && (
              <div className="chasm-falling-card">
                <img
                  src={`/card/${card.cardCode}_1.webp`}
                  alt={card.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            {/* Dust shockwave eruption */}
            <div className="chasm-dust-ring" />
          </div>
        </div>
      )}

      {/* 2. MIRROR FORCE BARRIER */}
      {type === 'mirror_force' && (
        <div className="mirror-force-vfx-container">
          {/* Hexagonal Crystal Energy Mirror Shield */}
          <div className="mirror-force-crystal-shield">
            <div className="mirror-hex-grid" />
            <div className="mirror-reflect-glare" />
          </div>
          {/* Sweeping Reflected Laser Shockwave destroying opponent line */}
          <div className="mirror-force-blast-wave" />
        </div>
      )}

      {/* 3. MAGIC CYLINDERS */}
      {type === 'magic_cylinder' && (
        <div className="magic-cylinder-vfx-container">
          {/* Cylinder 1: Absorbing attacker */}
          <div className="magic-cylinder cylinder-intake">
            <div className="cylinder-portal" />
            <div className="cylinder-vortex" />
            <div className="cylinder-body">
              <span>𓉐</span>
            </div>
          </div>

          {/* Energy Beam between cylinders */}
          <div className="cylinder-energy-beam" />

          {/* Cylinder 2: Shooting straight at Opponent */}
          <div className="magic-cylinder cylinder-exhaust">
            <div className="cylinder-portal" />
            <div className="cylinder-blast" />
            <div className="cylinder-body">
              <span>𓊽</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrapReactionVFX;

