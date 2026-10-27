import React, { useState, useMemo, useEffect } from 'react';
import cardsData from '../../data/cards.json';
import { CardDetailModal } from '../components/CardDetailModal.jsx';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { hasValidCardImage, getCardImageUrl } from '../../game/utils/cardImageHelper.js';

/* Sleek Pure-SVG Pharaonic & Gaming Icons (Zero Emojis) */
const ArrowBackIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const SunIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const MonsterIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="m9.5 6.5 8 8" />
  </svg>
);

const SpellIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <line x1="12" y1="11" x2="12" y2="21" />
    <line x1="7" y1="15" x2="17" y2="15" />
  </svg>
);

const TrapIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SearchIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16" y2="16" />
  </svg>
);

const StarIcon = ({ size = 11, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CloseIcon = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FilterIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const CardListScreen = ({ onBack, theme, onToggleTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('atk');
  const [selectedCard, setSelectedCard] = useState(null);

  // Responsive state for mobile viewports
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCards = useMemo(() => {
    let list = cardsData.filter((card) => {
      // Do not display cards without verified images
      if (!hasValidCardImage(card)) return false;

      const matchesSearch =
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || card.type === typeFilter;
      const matchesAttr = attributeFilter === 'all' || card.attribute === attributeFilter;
      const matchesLevel = levelFilter === 'all' || card.level === parseInt(levelFilter, 10);

      return matchesSearch && matchesType && matchesAttr && matchesLevel;
    });

    list.sort((a, b) => {
      if (sortBy === 'atk') return (b.atk || 0) - (a.atk || 0);
      if (sortBy === 'def') return (b.def || 0) - (a.def || 0);
      if (sortBy === 'level') return (b.level || 0) - (a.level || 0);
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [searchTerm, typeFilter, attributeFilter, levelFilter, sortBy]);

  const isLight = theme === 'light';

  const attributeColors = {
    all: { label: 'الكل', color: 'var(--pharaoh-text-gold)', dot: '#d4af37' },
    LIGHT: { label: 'ضوء', color: isLight ? '#854d0e' : '#fef08a', dot: '#eab308' },
    DARK: { label: 'ظلام', color: isLight ? '#7e22ce' : '#c084fc', dot: '#9333ea' },
    WATER: { label: 'ماء', color: isLight ? '#0369a1' : '#38bdf8', dot: '#0284c7' },
    FIRE: { label: 'نار', color: isLight ? '#b91c1c' : '#f87171', dot: '#dc2626' },
    EARTH: { label: 'أرض', color: isLight ? '#92400e' : '#fbbf24', dot: '#d97706' },
    WIND: { label: 'رياح', color: isLight ? '#15803d' : '#4ade80', dot: '#16a34a' },
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--pharaoh-bg-deep)',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* Top Header — Compact, Responsive, Expressive Icons */}
      <div
        className="stone-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          gap: 8,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={onBack}
            className="btn-pharaoh-stone"
            style={{
              padding: '6px 10px',
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="رجوع للقائمة الرئيسية"
          >
            <ArrowBackIcon size={14} color="var(--pharaoh-gold-bright)" />
            {!isMobile && <span>الرئيسية</span>}
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="btn-pharaoh-stone"
              style={{
                padding: '6px 9px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={theme === 'dark' ? 'التحويل لمظهر البردي (فاتح)' : 'التحويل لمظهر السبج (داكن)'}
            >
              {theme === 'dark' ? (
                <SunIcon size={15} color="var(--pharaoh-gold-bright)" />
              ) : (
                <MoonIcon size={15} color="var(--pharaoh-text-gold)" />
              )}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <h2 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', margin: 0 }}>
            كتالوج كل الكروت الفرعونية
          </h2>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 3,
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: 'var(--pharaoh-text-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <FilterIcon size={11} color="var(--pharaoh-gold-bright)" />
            {filteredCards.length} / {cardsData.length}
          </span>
        </div>

        <div style={{ width: 36 }} />
      </div>

      {/* Filter and Search Bar */}
      <div
        className="stone-panel"
        style={{
          padding: '8px 10px',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Row 1: Search Input & Sort Options */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="دوّر باسم الكارت أو تأثيره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 26px 6px 8px',
                borderRadius: 4,
                fontSize: 12,
                background: 'var(--pharaoh-input-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                color: 'var(--pharaoh-text-light)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 8,
                pointerEvents: 'none',
                color: 'var(--pharaoh-text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SearchIcon size={12} color="currentColor" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  left: 6,
                  background: 'none',
                  border: 'none',
                  color: 'var(--pharaoh-text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="إلغاء البحث"
              >
                <CloseIcon size={10} color="currentColor" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--pharaoh-input-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: 'var(--pharaoh-text-light)',
              padding: '5px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'inherit',
            }}
            title="طريقة الترتيب"
          >
            <option value="atk">أعلى هجوم</option>
            <option value="def">أعلى دفاع</option>
            <option value="level">النجوم (المستوى)</option>
            <option value="name">بالحروف الأبجدية</option>
          </select>
        </div>

        {/* Row 2: Type Filter Buttons & Level Star Dropdown */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', gap: 4 }}>
            <button
              onClick={() => setTypeFilter('all')}
              className={typeFilter === 'all' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{ padding: '3px 7px', fontSize: 10, fontWeight: 800 }}
            >
              الكل
            </button>

            <button
              onClick={() => setTypeFilter('monster')}
              className={typeFilter === 'monster' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{
                padding: '3px 7px',
                fontSize: 10,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
              title="كروت الوحوش"
            >
              <MonsterIcon size={11} color={typeFilter === 'monster' ? '#ffffff' : '#f59e0b'} />
              <span>وحوش</span>
            </button>

            <button
              onClick={() => setTypeFilter('spell')}
              className={typeFilter === 'spell' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{
                padding: '3px 7px',
                fontSize: 10,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
              title="كروت السحر"
            >
              <SpellIcon size={11} color={typeFilter === 'spell' ? '#ffffff' : '#0d9488'} />
              <span>سحر</span>
            </button>

            <button
              onClick={() => setTypeFilter('trap')}
              className={typeFilter === 'trap' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{
                padding: '3px 7px',
                fontSize: 10,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
              title="كروت الفخ"
            >
              <TrapIcon size={11} color={typeFilter === 'trap' ? '#ffffff' : '#e11d48'} />
              <span>فخاخ</span>
            </button>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <StarIcon size={11} color="#f59e0b" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                background: 'var(--pharaoh-input-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                color: 'var(--pharaoh-text-light)',
                padding: '3px 6px',
                borderRadius: 4,
                fontSize: 10,
              }}
              title="تصفية حسب عدد النجوم"
            >
              <option value="all">كل النجوم</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                <option key={`lvl-${lvl}`} value={lvl}>
                  {lvl} نجوم
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Horizontal Elemental Attributes Scroll Chips */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            paddingBottom: 2,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {['all', 'LIGHT', 'DARK', 'WATER', 'FIRE', 'EARTH', 'WIND'].map((attr) => {
            const meta = attributeColors[attr];
            const isActive = attributeFilter === attr;
            return (
              <button
                key={`attr-${attr}`}
                onClick={() => setAttributeFilter(attr)}
                style={{
                  padding: '2px 7px',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 3,
                  border: `1px solid ${isActive ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-stone-border)'}`,
                  background: isActive ? 'var(--pharaoh-slot-bg)' : 'transparent',
                  color: meta.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {attr !== 'all' && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: meta.dot,
                      display: 'inline-block',
                    }}
                  />
                )}
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill, minmax(80px, 1fr))'
            : 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: 8,
          alignContent: 'start',
        }}
      >
        {filteredCards.slice(0, 300).map((card, idx) => (
          <div
            key={`lib-card-${idx}`}
            id={`lib-card-item-${idx}`}
            onClick={() => {
              soundManager.playCardOpen();
              hapticManager.triggerCombatVibration('click');
              setSelectedCard(card);
            }}
            style={{
              background: 'var(--pharaoh-stone-card)',
              borderRadius: 4,
              padding: 4,
              border: '1px solid var(--pharaoh-stone-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <img
              src={getCardImageUrl(card, 'full')}
              alt={card.name}
              loading="lazy"
              decoding="async"
              className="card-art-enhanced"
              style={{
                width: isMobile ? 74 : 82,
                height: isMobile ? 107 : 119,
                aspectRatio: '200 / 290',
                objectFit: 'contain',
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                display: 'block',
                imageRendering: 'high-quality',
              }}
              onError={(e) => {
                const fallbackMini = getCardImageUrl(card, 'mini');
                if (e.target.src !== fallbackMini) {
                  e.target.src = fallbackMini;
                } else {
                  const item = document.getElementById(`lib-card-item-${idx}`);
                  if (item) item.style.display = 'none';
                }
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--pharaoh-text-gold)',
                marginTop: 3,
                textAlign: 'center',
                maxWidth: isMobile ? 72 : 80,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={card.name}
            >
              {card.name}
            </span>
            {card.type === 'monster' && card.atk !== undefined && (
              <span style={{ fontSize: 8, color: '#f59e0b', fontWeight: 700 }}>
                {card.atk} / {card.def}
              </span>
            )}
            {card.type !== 'monster' && (
              <span
                style={{
                  fontSize: 8,
                  color: card.type === 'spell' ? '#0d9488' : '#e11d48',
                  fontWeight: 700,
                }}
              >
                {card.type === 'spell' ? 'سحر' : 'فخ'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Full Resolution Card Inspector Modal with Clear Arabic Description */}
      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
};
