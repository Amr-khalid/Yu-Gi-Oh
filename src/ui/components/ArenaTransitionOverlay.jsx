import React from 'react';

/**
 * ArenaTransitionOverlay
 * Executive, cinematic arena transformation sequence without any intrusive center popup.
 * Renders smooth dimensional light sweep, atmospheric chromatic wave,
 * and an executive slim top-status badge below navbar.
 */
export const ArenaTransitionOverlay = ({ transition, theme = 'dark' }) => {
  if (!transition) return null;

  const { arena } = transition;
  const isLight = theme === 'light';
  const borderGlow = arena?.borderGlow || '#facc15';
  const auraGlow = arena?.auraGlow || 'rgba(245, 158, 11, 0.45)';

  return (
    <div
      className="arena-transition-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 'clamp(50px, 7.5vh, 64px)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Cinematic Full-Screen Dimensional Energy Wave */}
      <div
        className="arena-cinematic-sweep"
        style={{
          position: 'absolute',
          inset: 0,
          background: isLight
            ? `radial-gradient(circle at 50% 45%, ${auraGlow} 0%, rgba(254, 243, 199, 0.28) 50%, transparent 85%)`
            : `radial-gradient(circle at 50% 45%, ${auraGlow} 0%, rgba(10, 8, 5, 0.5) 55%, transparent 85%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Concentric Ethereal Shockwave Horizon Ring */}
      <div
        className="arena-cinematic-ring"
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          width: 'clamp(280px, 46vw, 540px)',
          height: 'clamp(280px, 46vw, 540px)',
          borderRadius: '50%',
          border: `1.5px solid ${borderGlow}`,
          boxShadow: `0 0 40px ${borderGlow}, inset 0 0 25px ${borderGlow}`,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Screen Edge Vignette Pulse */}
      <div
        className="arena-cinematic-vignette"
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 80px ${auraGlow}`,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Executive Slim Top Status Pill (Non-intrusive, zero center obstruction) */}
      <div
        className="arena-top-status-pill"
        style={{
          position: 'relative',
          zIndex: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '3px 14px',
          borderRadius: 20,
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 253, 245, 0.96), rgba(254, 243, 199, 0.98))'
            : 'linear-gradient(135deg, rgba(14, 11, 8, 0.95), rgba(26, 19, 12, 0.98))',
          border: `1.2px solid ${borderGlow}`,
          boxShadow: `0 4px 18px rgba(0, 0, 0, 0.5), 0 0 16px ${auraGlow}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: borderGlow,
            boxShadow: `0 0 8px ${borderGlow}`,
            flexShrink: 0,
          }}
        />
        {transition?.badge && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 900,
              padding: '1px 7px',
              borderRadius: 10,
              background: isLight ? 'rgba(180, 83, 9, 0.15)' : 'rgba(250, 204, 21, 0.2)',
              color: isLight ? '#92400e' : '#fef08a',
              border: `1px solid ${borderGlow}`,
              whiteSpace: 'nowrap',
            }}
          >
            {transition.badge}
          </span>
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: isLight ? '#78350f' : '#ffffff',
            letterSpacing: 0.3,
            whiteSpace: 'nowrap',
          }}
        >
          {arena?.name || 'ساحة المعركة'}
        </span>
        {arena?.tagline && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: isLight ? '#b45309' : borderGlow,
              opacity: 0.9,
              whiteSpace: 'nowrap',
            }}
          >
            • {arena.tagline}
          </span>
        )}
      </div>
    </div>
  );
};

export default ArenaTransitionOverlay;
