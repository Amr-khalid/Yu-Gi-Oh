import React, { useState } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getArabicCardDescription } from '../../data/arabicCardTranslator.js';

const SparkleIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const CheckIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const CardSelectModal = ({
  isOpen,
  onClose,
  title = 'اختار كارت',
  subtitle = 'اختار كارت علشان تطبق عليه تأثير السحر',
  actionLabel = 'أكّد اختيارك',
  options = [],
  onConfirm,
  onInspectCard,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'player' | 'opponent'

  if (!isOpen) return null;

  const hasPlayerCards = options.some((c) => c.source === 'player');
  const hasOppCards = options.some((c) => c.source === 'opponent');
  const hasDualSources = hasPlayerCards && hasOppCards;

  const filteredOptions = options.filter((c) => {
    if (!hasDualSources || sourceFilter === 'all') return true;
    return c.source === sourceFilter;
  });

  const selectedCard = selectedIdx !== null ? options[selectedIdx] : null;
  const arabicDesc = selectedCard ? getArabicCardDescription(selectedCard) : '';

  const handleSelect = (idxInOptions) => {
    setSelectedIdx(idxInOptions);
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleConfirm = () => {
    if (!selectedCard) return;
    soundManager.playSummon();
    hapticManager.triggerCombatVibration('heavy');
    onConfirm(selectedCard);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--pharaoh-modal-backdrop)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        direction: 'rtl',
      }}
      onClick={onClose}
    >
      <div
        className="stone-panel"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          border: '2px solid var(--pharaoh-gold-bright)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(240, 203, 100, 0.35)',
          background: 'var(--pharaoh-panel-bg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.25), rgba(22, 19, 14, 0.95))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: 'rgba(240, 203, 100, 0.15)',
                border: '1px solid var(--pharaoh-gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pharaoh-gold-bright)',
              }}
            >
              <SparkleIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                {title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--pharaoh-text-light)', marginTop: 2 }}>
                {subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              hapticManager.triggerCombatVibration('click');
              onClose();
            }}
            className="btn-icon-pharaoh"
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pharaoh-stone-card)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: 'var(--pharaoh-text-muted)',
              cursor: 'pointer',
              padding: 0,
            }}
            title="إلغاء"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Source Tabs if multiple sources (e.g. Monster Reborn checks both graveyards) */}
        {hasDualSources && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 14px',
              borderBottom: '1px solid var(--pharaoh-stone-border)',
              background: 'rgba(10, 8, 6, 0.6)',
            }}
          >
            {[
              { id: 'all', label: `الكل (${options.length})` },
              { id: 'player', label: `مقبرتك (${options.filter((c) => c.source === 'player').length})` },
              { id: 'opponent', label: `مقبرة الخصم (${options.filter((c) => c.source === 'opponent').length})` },
            ].map((tab) => {
              const active = sourceFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSourceFilter(tab.id);
                    soundManager.playClick();
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: active ? 900 : 700,
                    background: active
                      ? 'linear-gradient(180deg, #d8ac3b, #a77c1d)'
                      : 'var(--pharaoh-stone-card)',
                    color: active ? '#ffffff' : 'var(--pharaoh-text-muted)',
                    border: active ? '1px solid #f6d87d' : '1px solid var(--pharaoh-stone-border)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Selectable Cards Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            WebkitOverflowScrolling: 'touch',
            maxHeight: '45vh',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--pharaoh-text-muted)', fontSize: 13 }}>
              مافيش كروت متاحة في القسم ده
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                gap: 10,
              }}
            >
              {filteredOptions.map((card) => {
                const globalIndex = options.indexOf(card);
                const isSelected = selectedIdx === globalIndex;
                const rawFilename = card.rawFile
                  ? card.rawFile.replace('.bmp', '.png')
                  : card.image
                  ? card.image.replace('.webp', '.png')
                  : `${card.id}.png`;

                return (
                  <div
                    key={`select-card-${card.id || card.code || globalIndex}-${globalIndex}`}
                    onClick={() => handleSelect(globalIndex)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: 'var(--pharaoh-stone-card)',
                      border: isSelected
                        ? '2px solid var(--pharaoh-gold-bright)'
                        : '1px solid var(--pharaoh-stone-border)',
                      boxShadow: isSelected
                        ? '0 0 16px rgba(240, 203, 100, 0.9), inset 0 0 8px rgba(240, 203, 100, 0.3)'
                        : '0 3px 8px rgba(0,0,0,0.5)',
                      transform: isSelected ? 'translateY(-4px) scale(1.03)' : 'none',
                      transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease, border-color 0.18s ease',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {/* Selected Check Badge */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'linear-gradient(135deg, #d8ac3b, #b45309)',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          boxShadow: '0 0 8px #f59e0b',
                        }}
                      >
                        <CheckIcon size={12} color="#ffffff" />
                      </div>
                    )}

                    {/* Source Indicator (Player or Opponent) */}
                    {hasDualSources && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          background: card.source === 'opponent' ? '#dc2626' : '#2563eb',
                          color: '#fff',
                          fontSize: 8,
                          fontWeight: 900,
                          padding: '1px 5px',
                          borderRadius: 2,
                          zIndex: 8,
                        }}
                      >
                        {card.source === 'opponent' ? 'الخصم' : 'مقبرتك'}
                      </div>
                    )}

                    {/* Image */}
                    <div style={{ width: '100%', height: 105, background: '#0a0805', position: 'relative' }}>
                      <img
                        src={`/assets/cards-art/${rawFilename}`}
                        alt={card.name}
                        loading="lazy"
                        className="card-art-enhanced"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          const fallback = `/assets/cards/${rawFilename}`;
                          if (e.target.src !== fallback) {
                            e.target.src = fallback;
                          }
                        }}
                      />
                    </div>

                    {/* Name */}
                    <div
                      className="mini-card-name-box"
                      style={{
                        padding: '4px 6px',
                        fontSize: 10,
                        fontWeight: 800,
                        color: isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        background: 'var(--pharaoh-stone-slab)',
                      }}
                    >
                      {card.name}
                    </div>

                    {/* ATK / DEF */}
                    {card.type === 'monster' && (
                      <div
                        className="mini-card-stats-box"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '2px 6px',
                          fontSize: 9,
                          fontWeight: 900,
                          borderTop: '1px solid rgba(240, 203, 100, 0.15)',
                          background: 'var(--pharaoh-slot-bg)',
                        }}
                      >
                        <span className="atk-text" style={{ color: '#f87171' }}>{card.atk}</span>
                        <span className="def-text" style={{ color: '#60a5fa' }}>{card.def}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Card Preview Pane */}
        {selectedCard && (
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--pharaoh-stone-border)',
              background: 'var(--pharaoh-stone-slab)',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  {selectedCard.name}
                </span>
                {selectedCard.type === 'monster' && (
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                    (مستوى {selectedCard.level} • هجوم {selectedCard.atk} / دفاع {selectedCard.def})
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--pharaoh-text-light)',
                  marginTop: 3,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {arabicDesc || selectedCard.description || selectedCard.desc || 'وحش كاسر قادر على ترجيح كفة المعركة.'}
              </div>
            </div>

            {onInspectCard && (
              <button
                onClick={() => onInspectCard(selectedCard)}
                className="btn-pharaoh-stone"
                style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap' }}
              >
                شوف الكارت
              </button>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--pharaoh-slot-bg)',
          }}
        >
          <button
            onClick={() => {
              hapticManager.triggerCombatVibration('click');
              onClose();
            }}
            className="btn-pharaoh-stone"
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            إلغاء
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedCard}
            className="btn-pharaoh-gold"
            style={{
              padding: '8px 22px',
              fontSize: 12,
              opacity: selectedCard ? 1 : 0.45,
              cursor: selectedCard ? 'pointer' : 'not-allowed',
              background: selectedCard
                ? 'linear-gradient(180deg, #d8ac3b, #a77c1d)'
                : 'var(--pharaoh-stone-card)',
              boxShadow: selectedCard ? '0 0 16px rgba(240, 203, 100, 0.6)' : 'none',
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
