import React, { useState } from 'react';
import {
  getArabicCardDescription,
  getArabicCardClassification,
  getArabicRace,
  getArabicAttribute,
  getArabicSubtype,
} from '../../data/arabicCardTranslator.js';

/* Sleek Pure-SVG Icons (Zero Emojis) */
const ExpandIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const CheckShieldIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CloseIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const CardDetailModal = ({ card, onClose, actionButton = null }) => {
  if (!card) return null;

  const [viewMode, setViewMode] = useState('full'); // 'full' = complete uncropped rectangular card (200x290), 'art' = zoomed artwork
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const rawFilename = card.rawFile
    ? card.rawFile.replace('.bmp', '.png')
    : card.image
    ? card.image.replace('.webp', '.png')
    : '';

  const fullCardSrc = `/assets/cards/${rawFilename}`;
  const artSrc = `/assets/cards-art/${rawFilename}`;
  const currentSrc = viewMode === 'art' ? artSrc : fullCardSrc;

  const isMonster = card.type === 'monster';
  const classification = getArabicCardClassification(card);
  const descriptionArabic = getArabicCardDescription(card);

  return (
    <>
      {/* Full-Screen Ultra-Zoom Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="card-lightbox-backdrop"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="card-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header Bar */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--pharaoh-gold-bright)',
                fontSize: 14,
                fontWeight: 900,
                borderBottom: '1px solid var(--pharaoh-stone-border)',
                paddingBottom: 8,
              }}
            >
              <span>{card.name} — تكبير فائق الوضوح</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--pharaoh-text-light)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="إغلاق"
              >
                <CloseIcon size={20} color="var(--pharaoh-gold-bright)" />
              </button>
            </div>

            {/* High-Resolution Uncropped Rectangular Card in Lightbox */}
            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                border: '3px solid var(--pharaoh-gold-royal)',
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.45), 0 12px 30px rgba(0, 0, 0, 0.9)',
                background: '#0d0b08',
              }}
            >
              <img
                src={currentSrc}
                alt={card.name}
                className="card-art-enhanced"
                style={{
                  maxHeight: viewMode === 'full' ? 'min(640px, 80vh)' : 'min(480px, 68vh)',
                  maxWidth: 'min(440px, 92vw)',
                  width: 'auto',
                  height: 'auto',
                  aspectRatio: viewMode === 'full' ? '200 / 290' : '200 / 215',
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={(e) => {
                  if (e.target.src !== fullCardSrc) {
                    e.target.src = fullCardSrc;
                  }
                }}
              />
            </div>

            {/* Lightbox Mode Controls */}
            <div
              style={{
                display: 'flex',
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                borderRadius: 6,
                padding: 3,
                gap: 4,
              }}
            >
              <button
                onClick={() => setViewMode('full')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 4,
                  background: viewMode === 'full' ? 'var(--pharaoh-panel-bg)' : 'transparent',
                  color: viewMode === 'full' ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)',
                  border: viewMode === 'full' ? '1px solid var(--pharaoh-gold-dark)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                البطاقة بالكامل (مستطيلة دون أي قص)
              </button>
              <button
                onClick={() => setViewMode('art')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 4,
                  background: viewMode === 'art' ? 'var(--pharaoh-panel-bg)' : 'transparent',
                  color: viewMode === 'art' ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)',
                  border: viewMode === 'art' ? '1px solid var(--pharaoh-gold-dark)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                تكبير رسم الوحش فقط
              </button>
            </div>

            {/* Rectangular Completeness Notice */}
            <div
              style={{
                fontSize: 11,
                color: 'var(--pharaoh-text-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'center',
                background: 'rgba(212, 175, 55, 0.08)',
                padding: '4px 12px',
                borderRadius: 4,
                border: '1px solid var(--pharaoh-stone-border)',
              }}
            >
              <CheckShieldIcon size={13} color="var(--pharaoh-gold-bright)" />
              <span>البطاقة مستطيلة بنسبة 200×290 وتظهر كاملة بنسبة 100% دون أي اقتطاع</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Detail Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--pharaoh-modal-backdrop, rgba(0, 0, 0, 0.85))',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: 12,
          direction: 'rtl',
        }}
        onClick={onClose}
      >
        <div
          className="stone-panel"
          style={{
            maxWidth: 440,
            width: '95%',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 10,
            border: '2px solid var(--pharaoh-gold-royal)',
            boxShadow: '0 14px 45px var(--pharaoh-modal-shadow, rgba(0, 0, 0, 0.85))',
            padding: 0,
            background: 'var(--pharaoh-panel-bg)',
            color: 'var(--pharaoh-text-light)',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero Rectangular Card Section (Full Width, Edge-to-Edge with Zero Gaps) */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: viewMode === 'full' ? '200 / 290' : '200 / 215',
              maxHeight: viewMode === 'full' ? 'min(520px, 62vh)' : 'min(360px, 46vh)',
              background: '#090806',
              cursor: 'zoom-in',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '2px solid var(--pharaoh-gold-royal)',
            }}
            title="انقر لتكبير البطاقة ملء الشاشة"
          >
            {/* Ambient Background Behind Card to eliminate any empty side space */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${fullCardSrc})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                filter: 'blur(20px) brightness(0.35)',
                transform: 'scale(1.2)',
                pointerEvents: 'none',
              }}
            />

            {/* Main Uncropped Rectangular Card Image */}
            <img
              src={currentSrc}
              alt={card.name}
              className="card-art-enhanced"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                position: 'relative',
                zIndex: 1,
              }}
              onError={(e) => {
                if (e.target.src !== fullCardSrc) {
                  e.target.src = fullCardSrc;
                }
              }}
            />

            {/* Subtle Gradient Shadow Fusing Image into Card Body */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.2) 75%, rgba(13,11,8,0.92) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />

            {/* Floating Top Bar: Classification Badge & Mode Switcher */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 3,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 4,
                  background: 'rgba(10, 8, 5, 0.85)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid var(--pharaoh-gold-dark)',
                  color: 'var(--pharaoh-gold-bright)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                }}
              >
                {classification}
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(10, 8, 5, 0.85)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--pharaoh-gold-dark)',
                    borderRadius: 4,
                    padding: 2,
                    gap: 2,
                  }}
                >
                  <button
                    onClick={() => setViewMode('full')}
                    style={{
                      padding: '2px 9px',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 3,
                      background: viewMode === 'full' ? 'var(--pharaoh-gold-royal)' : 'transparent',
                      color: viewMode === 'full' ? '#120e06' : 'var(--pharaoh-text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    البطاقة كاملة (مستطيلة)
                  </button>
                  <button
                    onClick={() => setViewMode('art')}
                    style={{
                      padding: '2px 9px',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 3,
                      background: viewMode === 'art' ? 'var(--pharaoh-gold-royal)' : 'transparent',
                      color: viewMode === 'art' ? '#120e06' : 'var(--pharaoh-text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    الرسم فقط
                  </button>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(10, 8, 5, 0.85)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid var(--pharaoh-gold-dark)',
                    borderRadius: 4,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--pharaoh-gold-bright)',
                  }}
                  title="إغلاق"
                >
                  <CloseIcon size={14} color="var(--pharaoh-gold-bright)" />
                </button>
              </div>
            </div>

            {/* Floating Bottom Bar on Image: Card Name & Zoom Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 12,
                right: 12,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: 'var(--pharaoh-gold-bright)',
                  textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 10px rgba(212,175,55,0.4)',
                  letterSpacing: 0.3,
                  lineHeight: 1.2,
                }}
              >
                {card.name}
              </div>

              <div
                style={{
                  background: 'rgba(10, 8, 5, 0.8)',
                  backdropFilter: 'blur(3px)',
                  border: '1px solid var(--pharaoh-gold-dark)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--pharaoh-gold-bright)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <ExpandIcon size={11} color="var(--pharaoh-gold-bright)" />
                <span>تكبير كامل</span>
              </div>
            </div>
          </div>

          {/* Seamless Content Body (Integrated Smoothly with Hero Image) */}
          <div
            style={{
              padding: '12px 14px 14px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Stats Bar for Monsters */}
            {isMonster && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '7px 10px',
                  background: 'var(--pharaoh-slot-bg)',
                  borderRadius: 5,
                  border: '1px solid var(--pharaoh-stone-border)',
                  color: 'var(--pharaoh-text-light)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: 'var(--pharaoh-gold-bright)' }}>
                  المستوى: {card.level || 1}
                </span>
                <span style={{ color: '#ef4444' }}>
                  الهجوم: {card.atk !== undefined ? card.atk : 0}
                </span>
                <span style={{ color: '#0284c7' }}>
                  الدفاع: {card.def !== undefined ? card.def : 0}
                </span>
                <span style={{ color: 'var(--pharaoh-text-muted)', fontSize: 11, marginRight: 'auto' }}>
                  {getArabicRace(card.race)} / {getArabicAttribute(card.attribute)}
                </span>
              </div>
            )}

            {/* Spell / Trap Banner */}
            {!isMonster && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: card.type === 'spell' ? '#0d9488' : '#e11d48',
                  padding: '7px 12px',
                  background: 'var(--pharaoh-slot-bg)',
                  borderRadius: 5,
                  border: '1px solid var(--pharaoh-stone-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <span>بطاقة {card.type === 'spell' ? 'تعويذة سحرية' : 'فخ دفاعي'} ({getArabicSubtype(card.subType, card.type)})</span>
                <span style={{ color: 'var(--pharaoh-text-muted)', fontSize: 11, fontWeight: 700 }}>
                  بطاقة تكتيكية (لا تملك هجوم أو دفاع)
                </span>
              </div>
            )}

            {/* Section Header */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: 'var(--pharaoh-gold-royal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>وصف وقدرات البطاقة بالعربية:</span>
              <span style={{ fontSize: 10, color: 'var(--pharaoh-text-gold)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckShieldIcon size={11} color="var(--pharaoh-gold-bright)" />
                <span>بطاقة مستطيلة كاملة 100%</span>
              </span>
            </div>

            {/* Arabic Description Box — High Contrast & Integrated Theme */}
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.75,
                fontWeight: 600,
                color: 'var(--pharaoh-text-light)',
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                borderRadius: 6,
                padding: '10px 12px',
                maxHeight: 'min(150px, 22vh)',
                overflowY: 'auto',
                whiteSpace: 'pre-line',
                textAlign: 'right',
              }}
            >
              {descriptionArabic}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {actionButton}

              <button
                onClick={onClose}
                className="btn-pharaoh-gold"
                style={{
                  flex: actionButton ? '0 0 100px' : '1',
                  padding: '9px 0',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
    </div>
  </>
);
};
