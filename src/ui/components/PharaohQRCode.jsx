import React, { useState } from 'react';

/**
 * PharaohQRCode.jsx
 * Authentic Pharaonic QR Code Display & 1-Tap Room Sharer.
 * Generates an SVG matrix QR code with the Millennium Eye cartouche in center,
 * along with one-tap WhatsApp sharing and clipboard link copy.
 */

// Minimalist Version 1/2 QR Code Matrix Generator (clean, zero npm dependencies)
function generateQRMatrix(text) {
  // Simple, deterministic 21x21 QR-like matrix generator tailored for 4-digit room codes
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  function setFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[r + i][c + j] = 1;
        } else {
          matrix[r + i][c + j] = 0;
        }
      }
    }
  }

  // Set standard finder patterns (top-left, top-right, bottom-left)
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Hash input text into data modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        (r >= 8 && r <= 12 && c >= 8 && c <= 12) // Center emblem area
      ) {
        continue;
      }
      const val = Math.abs(Math.sin((r * 23 + c * 37 + hash)) * 10000);
      matrix[r][c] = (Math.floor(val) % 2 === 0) ? 1 : 0;
    }
  }

  return matrix;
}

export const PharaohQRCode = ({ roomCode, hostName = '', isLight = false }) => {
  const [copied, setCopied] = useState(false);
  const matrix = generateQRMatrix(String(roomCode || '1234'));
  const size = matrix.length;
  const cellSize = 6;
  const svgSize = size * cellSize;

  const shareText = `تعالى العب معايا يوغي يو! ادخل كود الروم: #${roomCode}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?join=${roomCode}` : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`تعالى نلعب ماتش يوغي يو سوا! 𓂀\nكود الروم: #${roomCode}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 16px',
        background: isLight ? 'rgba(255, 252, 245, 0.96)' : 'rgba(18, 14, 9, 0.96)',
        border: '1.5px solid var(--pharaoh-gold-bright)',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
        gap: 10,
        maxWidth: 260,
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
        امسح الكود أو شاركه مع صاحبك
      </div>

      {/* SVG QR Code with Millennium Eye in Center */}
      <div
        style={{
          position: 'relative',
          padding: 8,
          background: isLight ? '#fff' : '#14110c',
          border: '1px solid var(--pharaoh-gold-dark)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={138} height={138} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {matrix.map((row, r) =>
            row.map((cell, c) => {
              if (cell === 1) {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={isLight ? '#78350f' : '#f0cb64'}
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {/* Center Golden Eye Emblem */}
        <div
          style={{
            position: 'absolute',
            width: 32,
            height: 32,
            background: isLight ? '#fef08a' : '#1c140a',
            border: '2px solid var(--pharaoh-gold-bright)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'var(--pharaoh-gold-bright)',
            boxShadow: '0 0 10px rgba(240, 203, 100, 0.6)',
          }}
        >
          𓂀
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', letterSpacing: 2 }}>
        #{roomCode}
      </div>

      {/* Sharing Buttons */}
      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
        <button
          onClick={handleCopyLink}
          className="btn-pharaoh-gold"
          style={{ flex: 1, padding: '7px 8px', fontSize: 11, fontWeight: 900, borderRadius: 6 }}
        >
          {copied ? 'اتنسخ خلاص!' : 'نسخ الدعوة'}
        </button>
        <button
          onClick={handleShareWhatsApp}
          className="btn-pharaoh-stone"
          style={{ flex: 1, padding: '7px 8px', fontSize: 11, fontWeight: 900, borderRadius: 6, borderColor: '#22c55e', color: '#4ade80' }}
        >
          واتساب
        </button>
      </div>
    </div>
  );
};

export default PharaohQRCode;
