import React, { useState } from 'react';
import {
  getArabicCardDescription,
  getArabicCardClassification,
  getArabicRace,
  getArabicAttribute,
  getArabicSubtype,
} from '../../data/arabicCardTranslator.js';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/* Sleek Pure-SVG Icons (Zero Emojis) */
const CloseIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SwordIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </svg>
);

const ShieldIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StarIcon = ({ size = 12, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ReturnIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);

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

export const CardDetailModal = ({ card, onClose, inDuel = false, actionButton = null }) => {
  if (!card) return null;

  // Defaults to high-resolution card artwork ('art') per user requirement
  const [viewMode, setViewMode] = useState('art');
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

  const handleClose = () => {
    try {
      soundManager.playClick();
      hapticManager.triggerCombatVibration('click');
    } catch (e) {}
    onClose();
  };

  const handleToggleViewMode = (mode) => {
    try {
      soundManager.playClick();
      hapticManager.triggerCombatVibration('click');
    } catch (e) {}
    setViewMode(mode);
  };

  const handleOpenLightbox = () => {
    try {
      soundManager.playDecide();
      hapticManager.triggerCombatVibration('click');
    } catch (e) {}
    setIsLightboxOpen(true);
  };

  return (
    <>
      {/* Ultra-Zoom Lightbox Modal */}
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
              <span>{card.arabicName || card.name} — تكبير فائق الدقة</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--pharaoh-gold-bright)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="قفل التكبير"
              >
                <CloseIcon size={20} color="var(--pharaoh-gold-bright)" />
              </button>
            </div>

            {/* High-Resolution Uncropped Card or Artwork in Lightbox */}
            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                border: '3px solid var(--pharaoh-gold-royal)',
                boxShadow: '0 0 45px rgba(212, 175, 55, 0.5), 0 14px 35px rgba(0, 0, 0, 0.95)',
                background: '#0d0b08',
              }}
            >
              <img
                src={currentSrc}
                alt={card.name}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                className="card-art-enhanced"
                style={{
                  maxHeight: viewMode === 'full' ? 'min(640px, 78vh)' : 'min(480px, 66vh)',
                  maxWidth: 'min(460px, 92vw)',
                  width: 'auto',
                  height: 'auto',
                  aspectRatio: viewMode === 'full' ? '200 / 290' : '200 / 215',
                  objectFit: 'contain',
                  display: 'block',
                  imageRendering: 'high-quality',
                }}
                onError={(e) => {
                  if (e.target.src.includes('/assets/cards-art/')) {
                    e.target.src = fullCardSrc;
                  } else if (e.target.src.includes('/assets/cards/')) {
                    e.target.src = `/assets/cards-mini/${rawFilename}`;
                  } else {
                    e.target.src = '/assets/card_back.png';
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
                borderRadius: 20,
                padding: 3,
                gap: 4,
              }}
            >
              <button
                onClick={() => handleToggleViewMode('art')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 14,
                  background: viewMode === 'art' ? 'var(--pharaoh-gold-royal)' : 'transparent',
                  color: viewMode === 'art' ? '#ffffff' : 'var(--pharaoh-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                الرسمة بس
              </button>
              <button
                onClick={() => handleToggleViewMode('full')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 14,
                  background: viewMode === 'full' ? 'var(--pharaoh-gold-royal)' : 'transparent',
                  color: viewMode === 'full' ? '#ffffff' : 'var(--pharaoh-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                الكارت كامل
              </button>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="btn-pharaoh-stone"
              style={{
                padding: '6px 20px',
                fontSize: 12,
                fontWeight: 800,
                borderRadius: 6,
              }}
            >
              رجوع للتفاصيل
            </button>
          </div>
        </div>
      )}

      {/* Main Card Detail Modal Backdrop (Tap outside to dismiss) */}
      <div
        className="card-detail-backdrop"
        onClick={handleClose}
      >
        <div
          className="card-detail-modal-box"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar: Category Badge + Mode Switcher + Close Button */}
          <div className="card-detail-header-bar">
            <div className="card-detail-pill">
              <span className="pill-dot" />
              <span>{classification}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Toggle Pill: Artwork Only vs Full Card */}
              <div className="card-detail-toggle-pill">
                <button
                  type="button"
                  onClick={() => handleToggleViewMode('art')}
                  className={`toggle-btn ${viewMode === 'art' ? 'active' : ''}`}
                >
                  الرسمة بس
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleViewMode('full')}
                  className={`toggle-btn ${viewMode === 'full' ? 'active' : ''}`}
                >
                  الكارت كامل
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="card-detail-close-btn"
                title="قفل وخروج"
              >
                <CloseIcon size={18} color="var(--pharaoh-gold-bright)" />
              </button>
            </div>
          </div>

          {/* Main Body Container (Adapts to 2 columns in landscape on mobile) */}
          <div className="card-detail-body-container">
            {/* Hero Artwork / Card Showcase Frame */}
            <div className="card-detail-art-wrapper">
              <div
                className="card-detail-art-frame"
                onClick={handleOpenLightbox}
                title="دوس هنا علشان تكبر الرسمة ملء الشاشة"
              >
                {/* Ambient Aura Background */}
                <div
                  className="card-detail-art-aura"
                  style={{ backgroundImage: `url(${fullCardSrc})` }}
                />

                {/* Main Card / Art Illustration Image */}
                <img
                  src={currentSrc}
                  alt={card.name}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="card-art-img card-art-enhanced"
                  onError={(e) => {
                    if (e.target.src.includes('/assets/cards-art/')) {
                      e.target.src = fullCardSrc;
                    } else if (e.target.src.includes('/assets/cards/')) {
                      e.target.src = `/assets/cards-mini/${rawFilename}`;
                    } else {
                      e.target.src = '/assets/card_back.png';
                    }
                  }}
                />

                {/* Subtle Glass Sheen Overlay */}
                <div className="card-detail-art-sheen" />

                {/* Zoom Badge */}
                <div className="card-detail-art-zoom-tag">
                  <ExpandIcon size={11} color="var(--pharaoh-gold-bright)" />
                  <span>تكبير</span>
                </div>
              </div>
            </div>

            {/* Information & Description Panel */}
            <div className="card-detail-info-panel">
              {/* Card Title */}
              <div className="card-detail-title-row">
                <h3 className="card-detail-arabic-name">
                  {card.arabicName || card.name}
                </h3>
                {card.arabicName && (
                  <div className="card-detail-english-name">{card.name}</div>
                )}
              </div>

              {/* Monster Combat Stats Chips */}
              {isMonster && (
                <div className="card-detail-stats-grid">
                  <div className="stat-chip atk">
                    <SwordIcon size={12} color="#fca5a5" />
                    <span>هجوم</span>
                    <span className="stat-num">{card.atk !== undefined ? card.atk : 0}</span>
                  </div>

                  <div className="stat-chip def">
                    <ShieldIcon size={12} color="#93c5fd" />
                    <span>دفاع</span>
                    <span className="stat-num">{card.def !== undefined ? card.def : 0}</span>
                  </div>

                  <div className="stat-chip stars">
                    <StarIcon size={11} color="#facc15" />
                    <span>{card.level || 1} نجوم</span>
                  </div>

                  <div className="stat-chip attr">
                    <span>{getArabicRace(card.race)}</span>
                    <span>•</span>
                    <span>{getArabicAttribute(card.attribute)}</span>
                  </div>
                </div>
              )}

              {/* Spell / Trap Tactical Banner */}
              {!isMonster && (
                <div className={`card-detail-st-banner ${card.type}`}>
                  <span>كارت {card.type === 'spell' ? 'سحر وتعاويذ' : 'فخ دفاعي'} ({getArabicSubtype(card.subType, card.type)})</span>
                  <span className="st-tactical-tag">كارت تكتيكي مالوش هجوم ودفاع</span>
                </div>
              )}

              {/* Description Header */}
              <div className="card-detail-desc-header">
                <span>تفاصيل وتأثير الكارت:</span>
                <span className="desc-badge">
                  <CheckShieldIcon size={11} color="var(--pharaoh-gold-bright)" />
                  <span>شرح مصري دقيق</span>
                </span>
              </div>

              {/* Arabic Description Box (Scrollable with crisp high contrast typography) */}
              <div className="card-detail-desc-box">
                {descriptionArabic}
              </div>

              {/* Action Buttons: Dedicated Return Flow Button */}
              <div className="card-detail-footer-actions">
                {actionButton}

                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-pharaoh-gold card-detail-return-btn"
                  title="رجوع للماتش"
                >
                  <ReturnIcon size={16} />
                  <span>{inDuel ? 'رجوع للماتش دلوقتي' : 'رجوع'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardDetailModal;
