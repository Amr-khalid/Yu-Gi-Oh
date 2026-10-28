import React from 'react';

/**
 * TurnStallOverlay
 * Simulates continuous battle stall effects:
 * 1. Swords of Revealing Light: 3 divine swords impaling the field with a live turn countdown badge.
 * 2. Gravity Bind & Spellbinding Circle: Radiant chains & geometric binding rings.
 */
export function TurnStallOverlay({ swordsState, gravityBindActive }) {
  const isSwordsActive = swordsState && swordsState.active && swordsState.turnsRemaining > 0;
  const turns = swordsState?.turnsRemaining ?? 0;

  if (!isSwordsActive && !gravityBindActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1400,
        overflow: 'hidden',
      }}
    >
      {/* 1. Swords of Revealing Light (Three Divine Light Swords) */}
      {isSwordsActive && (
        <>
          {/* Luminous Light Rays from Heaven */}
          <div className="swords-divine-skylight" />

          {/* Three Sacred Radiant Swords of Light impaling the field */}
          <div className="swords-container">
            {/* Left Sword */}
            <div className="sacred-light-sword sword-left">
              <div className="sword-blade" />
              <div className="sword-hilt" />
              <div className="sword-aura" />
              <div className="sword-ground-impact" />
            </div>

            {/* Center Sword */}
            <div className="sacred-light-sword sword-center">
              <div className="sword-blade" />
              <div className="sword-hilt" />
              <div className="sword-aura" />
              <div className="sword-ground-impact" />
            </div>

            {/* Right Sword */}
            <div className="sacred-light-sword sword-right">
              <div className="sword-blade" />
              <div className="sword-hilt" />
              <div className="sword-aura" />
              <div className="sword-ground-impact" />
            </div>
          </div>

          {/* Persistent Pharaonic Turn Countdown Cartouche Pill */}
          <div className="swords-countdown-badge">
            <div className="swords-badge-icon">⏳</div>
            <div className="swords-badge-content">
              <div className="swords-badge-title">سيوف النور الكاشف</div>
              <div className="swords-badge-turns">
                متبقي {turns} {turns === 1 ? 'دور أخير' : (turns === 2 ? 'دوران' : 'أدوار')} لشل هجوم الخصم
              </div>
            </div>
            <div className="swords-badge-counter-circle">
              {turns}
            </div>
          </div>
        </>
      )}

      {/* 2. Gravity Bind (Runic Violet Chains across Level 4+ Monsters) */}
      {gravityBindActive && (
        <div className="gravity-bind-chain-line">
          <div className="gravity-bind-banner">
            <span>⛓️ قيد الجاذبية (Gravity Bind): هجوم الوحوش 4+ نجوم مشلول تماماً ⛓️</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TurnStallOverlay;

