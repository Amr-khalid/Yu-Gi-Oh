import React, { useState } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';

const SarcophagusIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h10l3 5-2 13H6L4 8l3-5z" />
    <line x1="12" y1="7" x2="12" y2="17" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);

const CloseIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const GraveyardModal = ({ isOpen, onClose, cards = [], ownerName = 'المقبرة', isOpponent = false, onInspectCard }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'monster' | 'spell' | 'trap'

  if (!isOpen) return null;

  const monsters = cards.filter((c) => c.type === 'monster');
  const spells = cards.filter((c) => c.type === 'spell');
  const traps = cards.filter((c) => c.type === 'trap');

  const filteredCards =
    filter === 'monster'
      ? monsters
      : filter === 'spell'
      ? spells
      : filter === 'trap'
      ? traps
      : cards;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--pharaoh-modal-backdrop)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2200,
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
          maxWidth: 540,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          border: isOpponent ? '1.5px solid #dc2626' : '1.5px solid var(--pharaoh-gold-bright)',
          boxShadow: isOpponent
            ? '0 12px 32px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(248, 113, 113, 0.2)'
            : '0 12px 32px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(240, 203, 100, 0.25)',
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
            background: isOpponent
              ? 'linear-gradient(90deg, rgba(127, 29, 29, 0.35), var(--pharaoh-stone-slab))'
              : 'linear-gradient(90deg, rgba(110, 82, 20, 0.35), var(--pharaoh-stone-slab))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 4,
                background: isOpponent ? 'rgba(220, 38, 38, 0.2)' : 'rgba(240, 203, 100, 0.15)',
                border: isOpponent ? '1px solid #ef4444' : '1px solid var(--pharaoh-gold-royal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOpponent ? '#f87171' : 'var(--pharaoh-gold-bright)',
              }}
            >
              <SarcophagusIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                {ownerName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 1 }}>
                كل الكروت اللي في المقبرة: {cards.length} كارت
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
            title="قفل"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '8px 14px',
            borderBottom: '1px solid var(--pharaoh-stone-border)',
            background: 'rgba(10, 8, 6, 0.5)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'all', label: `الكل (${cards.length})` },
            { id: 'monster', label: `وحوش (${monsters.length})` },
            { id: 'spell', label: `سحر (${spells.length})` },
            { id: 'trap', label: `فخاخ (${traps.length})` },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  soundManager.playClick();
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: active ? 900 : 700,
                  background: active
                    ? 'linear-gradient(180deg, #d8ac3b, #a77c1d)'
                    : 'var(--pharaoh-stone-card)',
                  color: active ? '#ffffff' : 'var(--pharaoh-text-muted)',
                  border: active ? '1px solid #f6d87d' : '1px solid var(--pharaoh-stone-border)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cards Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredCards.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 16px',
                textAlign: 'center',
                gap: 12,
              }}
            >
              <SarcophagusIcon size={38} color="var(--pharaoh-text-muted)" />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--pharaoh-text-light)' }}>
                مافيش كروت في القسم ده
              </div>
              <div style={{ fontSize: 12, color: 'var(--pharaoh-text-muted)' }}>
                مافيش كروت راحت المقبرة من النوع ده لحد دلوقتي.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
                gap: 10,
              }}
            >
              {filteredCards.map((card, idx) => {
                const artSrc = getCardImageUrl(card, 'art');
                const fullSrc = getCardImageUrl(card, 'full');

                const typeBadge =
                  card.type === 'monster'
                    ? { bg: '#854d0e', text: 'وحش' }
                    : card.type === 'spell'
                    ? { bg: '#065f46', text: 'سحر' }
                    : { bg: '#831843', text: 'فخ' };

                return (
                  <div
                    key={`gy-${card.id || card.code || idx}-${idx}`}
                    onClick={() => {
                      soundManager.playClick();
                      if (onInspectCard) onInspectCard(card);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: 'var(--pharaoh-stone-card)',
                      border: '1px solid var(--pharaoh-stone-border)',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = 'var(--pharaoh-gold-bright)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--pharaoh-stone-border)';
                    }}
                    title="دوس هنا علشان تشوف تفاصيل الكارت وقوته"
                  >
                    {/* Card Image */}
                    <div style={{ width: '100%', height: 100, position: 'relative', background: '#0a0805' }}>
                      <img
                        src={artSrc}
                        alt={card.name}
                        loading="lazy"
                        className="card-art-enhanced"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          if (e.target.src !== fullSrc) {
                            e.target.src = fullSrc;
                          }
                        }}
                      />

                      {/* Card Type Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          background: typeBadge.bg,
                          color: '#fff',
                          fontSize: 8,
                          fontWeight: 900,
                          padding: '1px 4px',
                          borderRadius: 2,
                        }}
                      >
                        {typeBadge.text}
                      </div>

                      {/* Level if monster */}
                      {card.level && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 3,
                            left: 3,
                            background: 'rgba(0,0,0,0.7)',
                            color: 'var(--pharaoh-gold-bright)',
                            fontSize: 8,
                            fontWeight: 900,
                            padding: '1px 4px',
                            borderRadius: 2,
                          }}
                        >
                          مستوى {card.level}
                        </div>
                      )}
                    </div>

                    {/* Card Name */}
                    <div
                      className="mini-card-name-box"
                      style={{
                        padding: '4px 5px',
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'var(--pharaoh-text-gold)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        background: 'var(--pharaoh-stone-slab)',
                      }}
                    >
                      {card.name}
                    </div>

                    {/* ATK / DEF for Monsters */}
                    {card.type === 'monster' && (
                      <div
                        className="mini-card-stats-box"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '2px 5px',
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

        {/* Footer */}
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
          <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
            دوس على أي كارت علشان تشوف كل تفاصيله وقوته.
          </div>
          <button
            onClick={() => {
              hapticManager.triggerCombatVibration('click');
              onClose();
            }}
            className="btn-pharaoh-stone"
            style={{ padding: '6px 16px', fontSize: 12 }}
          >
            قفل
          </button>
        </div>
      </div>
    </div>
  );
};
