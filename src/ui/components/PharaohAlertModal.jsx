import React, { useState, useEffect, useCallback } from 'react';
import { subscribeAlert } from '../../game/utils/AlertManager.js';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

export const PharaohAlertModal = () => {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    const unsub = subscribeAlert((data) => {
      setAlertData(data);
    });
    return unsub;
  }, []);

  const handleClose = useCallback(() => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    setAlertData(null);
  }, []);

  // Keyboard navigation: Enter, Space, Escape to dismiss
  useEffect(() => {
    if (!alertData) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertData, handleClose]);

  if (!alertData) return null;

  return (
    <div
      className="pharaoh-alert-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 5000,
        animation: 'pharaohFadeIn 0.2s ease-out',
      }}
    >
      <div
        className="pharaoh-alert-card stone-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'linear-gradient(145deg, rgba(26, 20, 13, 0.98) 0%, rgba(14, 11, 7, 0.99) 100%)',
          border: '2px solid var(--pharaoh-gold-bright, #facc15)',
          borderRadius: 14,
          padding: '20px 22px 18px',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.5), 0 20px 40px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          textAlign: 'center',
          direction: 'rtl',
          animation: 'pharaohSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Pharaonic Cartouche Emblem */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '4px 16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.25) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.6)',
            borderRadius: 20,
            marginBottom: 12,
          }}
        >
          {/* Sacred Eye of Horus Icon */}
          <svg
            width="22"
            height="16"
            viewBox="0 0 100 70"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 4px #facc15)' }}
          >
            <path
              d="M50 15 C25 15 10 35 10 35 C10 35 25 55 50 55 C75 55 90 35 90 35 C90 35 75 15 50 15 Z"
              stroke="#facc15"
              strokeWidth="4"
              fill="none"
            />
            <circle cx="50" cy="35" r="12" fill="#facc15" />
            <path
              d="M50 55 L50 68 M40 68 L60 68"
              stroke="#facc15"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: 'var(--pharaoh-gold-bright, #facc15)',
              letterSpacing: 0.5,
            }}
          >
            {alertData.title || 'حاسب يا بطل'}
          </span>
        </div>

        {/* Message Content in Egyptian Youth Colloquial */}
        <div
          style={{
            fontSize: 'clamp(14px, 3.8vw, 16px)',
            fontWeight: 700,
            color: '#fef08a',
            lineHeight: 1.6,
            marginBottom: 20,
            padding: '0 8px',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
          }}
        >
          {alertData.message}
        </div>

        {/* Pharaonic Action Button */}
        <button
          onClick={handleClose}
          className="btn-pharaoh-gold"
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 900,
            borderRadius: 8,
            cursor: 'pointer',
            border: '1px solid #fef08a',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
          }}
          autoFocus
        >
          {alertData.actionLabel || 'تمام يا صاحبي'}
        </button>
      </div>
    </div>
  );
};

export default PharaohAlertModal;
