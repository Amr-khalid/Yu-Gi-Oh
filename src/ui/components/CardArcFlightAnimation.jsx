import React, { useState, useEffect, useRef } from 'react';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/**
 * CardArcFlightAnimation
 * 3D Curved Quadratic Bézier Trajectory Animation for Graveyard Rebirths and Card Returns.
 * Renders the card emerging from its source (e.g. Graveyard), gliding across the screen
 * in a high-elevation luminous arc, and landing into the destination slot.
 */
export function CardArcFlightAnimation({ flight }) {
  if (!flight || !flight.card || !flight.startRect || !flight.endRect) return null;

  const { card, startRect, endRect, label, onComplete, originType = 'graveyard' } = flight;
  const [t, setT] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height / 2;

  // Arc apex: elevate upward towards screen/ceiling
  const midX = (startX + endX) / 2;
  const apexLift = Math.max(120, Math.abs(endX - startX) * 0.25);
  const midY = Math.min(startY, endY) - apexLift;

  useEffect(() => {
    let animId;
    const duration = 850; // ms
    const startTime = performance.now();

    const frame = (now) => {
      const elapsed = now - startTime;
      const linearT = Math.min(elapsed / duration, 1);
      // Smooth cubic ease-out / ease-in-out
      const easedT = linearT < 0.5
        ? 2 * linearT * linearT
        : 1 - Math.pow(-2 * linearT + 2, 2) / 2;

      setT(easedT);

      if (linearT < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [flight]);

  // Quadratic Bézier formula: B(t) = (1-t)^2*P0 + 2(1-t)*t*P1 + t^2*P2
  const oneMinusT = 1 - t;
  const curX = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * endX;
  const curY = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * endY;

  // 3D Dynamics: swells large in mid-flight then snaps down
  const arcHeightFactor = Math.sin(t * Math.PI);
  const scale = 0.85 + arcHeightFactor * 0.55;
  const rotateDeg = (t - 0.5) * 16;
  const glowIntensity = 15 + arcHeightFactor * 35;

  const cardWidth = Math.max(76, Math.min(100, (startRect.width || 80) * scale));
  const cardHeight = cardWidth * 1.45;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3800,
        overflow: 'hidden',
      }}
    >
      {/* Golden Eruption Portal at origin */}
      {t < 0.45 && (
        <div
          style={{
            position: 'absolute',
            left: startX - 50,
            top: startY - 50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.4) 50%, transparent 75%)',
            boxShadow: '0 0 35px #f59e0b',
            opacity: 1 - (t / 0.45),
            transform: `scale(${1 + t * 2})`,
            transition: 'opacity 0.1s linear',
          }}
        />
      )}

      {/* Destination Target Shockwave Beacon */}
      {t > 0.65 && (
        <div
          style={{
            position: 'absolute',
            left: endX - 45,
            top: endY - 45,
            width: 90,
            height: 90,
            borderRadius: '50%',
            border: '2px solid rgba(245, 158, 11, 0.85)',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%)',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)',
            transform: `scale(${(t - 0.65) / 0.35 * 1.3})`,
            opacity: (t - 0.65) / 0.35,
          }}
        />
      )}

      {/* Trailing Luminous Golden Particle Stream */}
      <div
        style={{
          position: 'absolute',
          left: curX - 35,
          top: curY - 35,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.8) 0%, rgba(245, 158, 11, 0.4) 40%, transparent 70%)',
          filter: 'blur(6px)',
          opacity: arcHeightFactor * 0.95,
          transform: 'scale(1.6)',
        }}
      />

      {/* 3D Flying Card Container */}
      <div
        style={{
          position: 'absolute',
          left: curX - cardWidth / 2,
          top: curY - cardHeight / 2,
          width: cardWidth,
          height: cardHeight,
          transform: `scale(${scale}) rotate(${rotateDeg}deg)`,
          transformOrigin: 'center center',
          filter: `drop-shadow(0 0 ${glowIntensity}px rgba(245, 158, 11, 0.95)) drop-shadow(0 15px 25px rgba(0,0,0,0.85))`,
          borderRadius: 8,
          border: '2px solid #fbbf24',
          background: '#090a0f',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={getCardImageUrl(card, 'full')}
          alt={card.name}
          onError={(e) => {
            e.target.src = getCardImageUrl(card, 'art');
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Shimmer Light Bar across card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 80%)',
            transform: `translateX(${(t - 0.5) * 200}%)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Floating Action Banner */}
      <div
        style={{
          position: 'absolute',
          left: curX,
          top: curY + cardHeight / 2 + 12,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
          border: '1.5px solid #f59e0b',
          borderRadius: 999,
          padding: '4px 14px',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.6), 0 4px 12px rgba(0,0,0,0.8)',
          color: '#fbbf24',
          fontSize: 12,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: Math.min(1, arcHeightFactor * 1.5),
        }}
      >
        <span>𓋹</span>
        <span>{label || (originType === 'graveyard' ? 'استدعاء خاص من المقبرة' : 'استعادة إلى اليد')}</span>
        {card.atk !== undefined && (
          <span style={{ color: '#34d399', fontSize: 11 }}>[{card.atk} ATK]</span>
        )}
      </div>
    </div>
  );
}
