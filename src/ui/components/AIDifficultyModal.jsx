import React from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { AI_DIFFICULTIES } from '../../game/ai/AIPlayer.js';

export const AIDifficultyModal = ({
  isOpen,
  onClose,
  selectedDifficulty = 'hard',
  onSelectDifficulty,
  onConfirmStart,
}) => {
  if (!isOpen) return null;

  const difficulties = Object.values(AI_DIFFICULTIES);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5500,
        padding: 14,
      }}
      onClick={onClose}
    >
      <div
        className="stone-panel"
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 20px rgba(240, 203, 100, 0.25)',
          border: '2px solid var(--pharaoh-gold-bright)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--pharaoh-stone-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', margin: 0 }}>
                اختار صعوبة الخصم اللي هتلعبه
              </h2>
              <div style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)', marginTop: 2 }}>
                ظبّط مستوى وقوة تكتيكات الكمبيوتر في الماتش
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-pharaoh-stone"
            style={{ padding: '4px 10px', fontSize: 12 }}
          >
            رجوع
          </button>
        </div>

        {/* Difficulty Cards List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            return (
              <div
                key={diff.id}
                onClick={() => {
                  soundManager.playClick();
                  hapticManager.triggerCombatVibration('click');
                  onSelectDifficulty(diff.id);
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(240, 203, 100, 0.25) 0%, var(--pharaoh-stone-card) 100%)'
                    : 'var(--pharaoh-slot-bg)',
                  border: isSelected
                    ? '2px solid var(--pharaoh-gold-bright)'
                    : '1px solid var(--pharaoh-stone-border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 16px rgba(240, 203, 100, 0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: isSelected ? 'var(--pharaoh-gold-bright)' : 'rgba(240, 203, 100, 0.15)',
                        color: isSelected ? '#ffffff' : 'var(--pharaoh-gold-bright)',
                        border: '1px solid var(--pharaoh-gold-royal)',
                      }}
                    >
                      مستوى {diff.stars}
                    </span>
                    <span style={{ fontSize: 14.5, fontWeight: 900, color: isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)' }}>
                      {diff.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 900,
                          background: 'var(--pharaoh-gold-bright)',
                          color: '#ffffff',
                          padding: '2px 6px',
                          borderRadius: 3,
                          marginRight: 4,
                        }}
                      >
                         ده اللي متختار
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--pharaoh-text-light)', lineHeight: 1.5, marginBottom: 4 }}>
                  {diff.description}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--pharaoh-gold-dark)' }}>
                  <span style={{ fontWeight: 800 }}>طريقة لعبه:</span>
                  <span style={{ color: isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)' }}>
                    {diff.strategy}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Confirm Button */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--pharaoh-stone-card)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)' }}>
            هتلعب ضد:{' '}
            <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>
              {AI_DIFFICULTIES[selectedDifficulty]?.character || 'سيتو كايبا'}
            </strong>
          </div>

          <button
            onClick={() => {
              soundManager.playDecide();
              hapticManager.triggerCombatVibration('click');
              onConfirmStart();
            }}
            className="btn-pharaoh-gold"
            style={{ padding: '8px 22px', fontSize: 13, fontWeight: 900 }}
          >
            يلا بينا ع الماتش!
          </button>
        </div>
      </div>
    </div>
  );
};
