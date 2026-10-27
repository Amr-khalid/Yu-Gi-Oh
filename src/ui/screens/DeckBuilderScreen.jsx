import React, { useState, useMemo, useEffect } from 'react';
import decksData from '../../data/decks.json';
import allCardsData from '../../data/cards.json';
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

const DeckCardsIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="13" height="15" rx="2" />
    <path d="M6 3h12a2 2 0 0 1 2 2v13" />
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

const TrashIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
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

const PlusIcon = ({ size = 11, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const FilterIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const DeckBuilderScreen = ({
  onBack,
  selectedDeckIndex,
  onSelectDeck,
  onSaveCustomDeck,
  theme,
  onToggleTheme,
}) => {
  const [currentDeckCards, setCurrentDeckCards] = useState(() => {
    const saved = localStorage.getItem('yugioh_active_deck');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return (decksData[selectedDeckIndex] || decksData[0]).mainDeck;
  });

  const [deckName, setDeckName] = useState(() => {
    return localStorage.getItem('yugioh_active_deck_name') || decksData[selectedDeckIndex]?.name || 'المجموعة المخصصة';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('atk');
  const [inspectCard, setInspectCard] = useState(null);

  // Responsive state for mobile viewports
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });
  const [mobileTab, setMobileTab] = useState('deck'); // 'deck' | 'library'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalCount = currentDeckCards.length;
  const monstersCount = currentDeckCards.filter((c) => c.type === 'monster').length;
  const spellsCount = currentDeckCards.filter((c) => c.type === 'spell').length;
  const trapsCount = currentDeckCards.filter((c) => c.type === 'trap').length;

  const saveDeck = (updatedCards, name) => {
    setCurrentDeckCards(updatedCards);
    const n = name !== undefined ? name : deckName;
    localStorage.setItem('yugioh_active_deck', JSON.stringify(updatedCards));
    localStorage.setItem('yugioh_active_deck_name', n);
    if (onSaveCustomDeck) {
      onSaveCustomDeck(updatedCards);
    }
  };

  const handleAddCard = (card) => {
    if (!hasValidCardImage(card)) {
      return;
    }
    if (currentDeckCards.length >= 60) {
      alert('المجموعة ماتزيدش عن 60 كارت يا بطل علشان تلعب بتركيز!');
      return;
    }
    const copies = currentDeckCards.filter((c) => c.id === card.id || c.cardCode === card.cardCode).length;
    if (copies >= 3) {
      alert('ماينفعش تحط أكتر من 3 نسخ من نفس الكارت يا صاحبي، ده القانون الرسمي!');
      return;
    }
    soundManager.playCardMove();
    hapticManager.triggerCombatVibration('click');
    const updated = [...currentDeckCards, card];
    saveDeck(updated);
  };

  const handleRemoveCard = (index) => {
    soundManager.playCardMove();
    hapticManager.triggerCombatVibration('click');
    const updated = [...currentDeckCards];
    updated.splice(index, 1);
    saveDeck(updated);
  };

  const handleLoadPreset = (e) => {
    const val = e.target.value;
    if (!val) return;
    const idx = parseInt(val, 10);
    const preset = decksData[idx];
    if (preset) {
      setDeckName(preset.name);
      onSelectDeck(idx);
      saveDeck(preset.mainDeck, preset.name);
    }
  };

  const filteredLibrary = useMemo(() => {
    let result = allCardsData.filter((c) => {
      // Exclude cards without verified images
      if (!hasValidCardImage(c)) return false;

      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchAttr = attributeFilter === 'all' || c.attribute === attributeFilter;
      const matchLevel = levelFilter === 'all' || c.level === parseInt(levelFilter, 10);

      return matchSearch && matchType && matchAttr && matchLevel;
    });

    result.sort((a, b) => {
      if (sortBy === 'atk') return (b.atk || 0) - (a.atk || 0);
      if (sortBy === 'def') return (b.def || 0) - (a.def || 0);
      if (sortBy === 'level') return (b.level || 0) - (a.level || 0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [searchTerm, typeFilter, attributeFilter, levelFilter, sortBy]);

  const isLight = theme === 'light';

  // Elements attribute map with thematic Pharaonic gem colors
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
        {/* Left Action Buttons */}
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

        {/* Center: Title & Expressive Stat Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? 13 : 15,
              fontWeight: 900,
              color: 'var(--pharaoh-gold-bright)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 160 : 320,
            }}
            title={deckName}
          >
            {deckName}
          </div>

          {/* Expressive Pharaonic Stat Chips (Replaces Bloated Sentences) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span
              title={`إجمالي البطاقات: ${totalCount} من 60 (الحد الأدنى 40)`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 3,
                background: 'var(--pharaoh-slot-bg)',
                border: `1px solid ${totalCount < 40 ? '#ef4444' : '#10b981'}`,
                color: totalCount < 40 ? '#ef4444' : '#10b981',
              }}
            >
              <DeckCardsIcon size={11} color="currentColor" />
              {totalCount}/60
            </span>

            <span
              title={`وحوش: ${monstersCount}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 3,
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                color: '#f59e0b',
              }}
            >
              <MonsterIcon size={11} color="#f59e0b" />
              {monstersCount}
            </span>

            <span
              title={`تعاويذ سحرية: ${spellsCount}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 3,
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                color: '#0d9488',
              }}
            >
              <SpellIcon size={11} color="#0d9488" />
              {spellsCount}
            </span>

            <span
              title={`أفخاخ دفاعية: ${trapsCount}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 3,
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                color: '#e11d48',
              }}
            >
              <TrapIcon size={11} color="#e11d48" />
              {trapsCount}
            </span>
          </div>
        </div>

        {/* Right: Compact Preset Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <select
            onChange={handleLoadPreset}
            defaultValue=""
            style={{
              background: 'var(--pharaoh-input-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: 'var(--pharaoh-text-gold)',
              padding: '5px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'inherit',
              maxWidth: isMobile ? 110 : 190,
            }}
            title="تحميل مجموعة فرعونية جاهزة"
          >
            <option value="" disabled>نقّي مجموعة جاهزة (42)...</option>
            {decksData.map((d, idx) => (
              <option key={`preset-${idx}`} value={idx}>
                {d.name} ({d.mainDeckCount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Segmented Tab Switcher (Only visible on screens <= 768px) */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            background: 'var(--pharaoh-stone-slab)',
            borderBottom: '1px solid var(--pharaoh-stone-border)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMobileTab('deck')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: mobileTab === 'deck' ? 'var(--pharaoh-panel-bg)' : 'transparent',
              color: mobileTab === 'deck' ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)',
              borderBottom: mobileTab === 'deck' ? '2px solid var(--pharaoh-gold-bright)' : '2px solid transparent',
            }}
          >
            <DeckCardsIcon size={14} color="currentColor" />
            <span>كروت مجموعتك الحالية ({totalCount}/60)</span>
          </button>

          <button
            onClick={() => setMobileTab('library')}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: mobileTab === 'library' ? 'var(--pharaoh-panel-bg)' : 'transparent',
              color: mobileTab === 'library' ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)',
              borderBottom: mobileTab === 'library' ? '2px solid var(--pharaoh-gold-bright)' : '2px solid transparent',
            }}
          >
            <FilterIcon size={13} color="currentColor" />
            <span>كتالوج كل الكروت ({filteredLibrary.length})</span>
          </button>
        </div>
      )}

      {/* Main Workspace Area (Split Side-by-Side on Desktop, Full-Width Tabs on Mobile) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Section 1: Active Deck Cards */}
        {(!isMobile || mobileTab === 'deck') && (
          <div
            style={{
              width: isMobile ? '100%' : '38%',
              maxWidth: isMobile ? 'none' : 420,
              borderLeft: isMobile ? 'none' : '1px solid var(--pharaoh-stone-border)',
              background: 'var(--pharaoh-panel-bg)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Deck Header & Fast Actions */}
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--pharaoh-stone-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--pharaoh-stone-slab)',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: totalCount < 40 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${totalCount < 40 ? '#ef4444' : '#10b981'}`,
                    color: totalCount < 40 ? '#ef4444' : '#10b981',
                  }}
                >
                  {totalCount < 40 ? (
                    <>
                      <AlertIcon size={11} color="#ef4444" />
                      <span>ناقصك {40 - totalCount} كرت عشان تبدأ</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon size={11} color="#10b981" />
                      <span>المجموعة مظبوطة وجاهزة للمعركة</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons: Restore Pharaoh Deck & Empty Deck */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const starter = (decksData[0] || {}).mainDeck || [];
                    saveDeck(starter, 'مجموعة الفرعون الأسطورية');
                    setDeckName('مجموعة الفرعون الأسطورية');
                  }}
                  className="btn-pharaoh-gold"
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="استرجاع مجموعة الفرعون المتوازنة الافتراضية (40 كرت)"
                >
                  <DeckCardsIcon size={12} color="#000" />
                  <span>مجموعة الفرعون</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('عايز تفضي المجموعة دي خالص وتبدأ من جديد؟')) {
                      saveDeck([]);
                    }
                  }}
                  className="btn-pharaoh-danger"
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="تفريغ المجموعة بالكامل"
                >
                  <TrashIcon size={12} color="#fff" />
                  <span>فضّي</span>
                </button>
              </div>
            </div>

            {/* Active Deck Cards Grid */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 8,
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(auto-fill, minmax(74px, 1fr))'
                  : 'repeat(auto-fill, minmax(76px, 1fr))',
                gap: 6,
                alignContent: 'start',
              }}
            >
              {currentDeckCards.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: 'var(--pharaoh-text-muted)',
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--pharaoh-gold-bright)' }}>المجموعة فارغة حالياً</div>
                  <div style={{ marginBottom: 16, fontSize: 11 }}>
                    {isMobile
                      ? 'انقر على تبويب "كتالوج كل الكروت" أو حمّل مجموعة الفرعون المتوازنة بنقرة واحدة.'
                      : 'اختر بطاقات من الكتالوج على اليمين أو حمّل مجموعة الفرعون المتوازنة بنقرة واحدة.'}
                  </div>
                  <button
                    onClick={() => {
                      const starter = (decksData[0] || {}).mainDeck || [];
                      saveDeck(starter, 'مجموعة الفرعون الأسطورية');
                      setDeckName('مجموعة الفرعون الأسطورية');
                    }}
                    className="btn-pharaoh-gold"
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      margin: '0 auto',
                    }}
                  >
                    <DeckCardsIcon size={14} color="#000" />
                    <span>تحميل مجموعة الفرعون المتوازنة (40 كرت)</span>
                  </button>
                </div>
              ) : (
                currentDeckCards.map((card, idx) => (
                  <div
                    key={`deck-card-${idx}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'var(--pharaoh-stone-card)',
                      borderRadius: 4,
                      border: '1px solid var(--pharaoh-stone-border)',
                      padding: 3,
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => setInspectCard(card)}
                  >
                    <img
                      src={getCardImageUrl(card, 'full')}
                      alt={card.name}
                      loading="lazy"
                      decoding="async"
                      className="card-art-enhanced"
                      style={{
                        width: isMobile ? 68 : 72,
                        height: isMobile ? 98 : 104,
                        aspectRatio: '200 / 290',
                        objectFit: 'contain',
                        borderRadius: 2,
                      }}
                      onError={(e) => {
                        const fallbackMini = getCardImageUrl(card, 'mini');
                        if (e.target.src !== fallbackMini) {
                          e.target.src = fallbackMini;
                        } else {
                          const parent = e.target.closest('[id^="deck-slot-"]') || e.target.parentElement;
                          if (parent) parent.style.display = 'none';
                        }
                      }}
                    />

                    {/* Quick Delete Card Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard(idx);
                      }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(168, 41, 31, 0.95)',
                        color: '#fff',
                        border: '1px solid #d4493e',
                        borderRadius: 3,
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="حذف من المجموعة"
                    >
                      <CloseIcon size={10} color="#fff" />
                    </button>

                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--pharaoh-text-gold)',
                        marginTop: 2,
                        maxWidth: isMobile ? 66 : 70,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                      }}
                      title={card.name}
                    >
                      {card.name}
                    </span>

                    {/* Accurate Stat or Type Badge */}
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
                ))
              )}
            </div>
          </div>
        )}

        {/* Section 2: All Cards Library Browser */}
        {(!isMobile || mobileTab === 'library') && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--pharaoh-bg-deep)',
              minWidth: 0,
            }}
          >
            {/* Filter & Search Bar — Compact Layout with Icons */}
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
                    placeholder="ابحث باسم البطاقة أو الوصف..."
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

                {/* Sort Dropdown */}
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

              {/* Row 2: Type Filters, Level & Matches Count */}
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Type Filter Buttons with Expressive Icons */}
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

                {/* Level Filter Dropdown with Star Icon */}
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

                {/* Match Counter Badge */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--pharaoh-text-gold)',
                    marginRight: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="عدد الكروت المطابقة للتصفية"
                >
                  <FilterIcon size={11} color="var(--pharaoh-gold-bright)" />
                  {filteredLibrary.length} كرت
                </span>
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

            {/* Cards Library Grid — Roomy, Responsive & Touch-Optimized */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 8,
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(auto-fill, minmax(80px, 1fr))'
                  : 'repeat(auto-fill, minmax(86px, 1fr))',
                gap: 8,
                alignContent: 'start',
              }}
            >
              {filteredLibrary.slice(0, 250).map((card, idx) => (
                <div
                  key={`lib-${card.id}-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'var(--pharaoh-stone-card)',
                    borderRadius: 4,
                    border: '1px solid var(--pharaoh-stone-border)',
                    padding: 4,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => setInspectCard(card)}
                >
                  <img
                    src={getCardImageUrl(card, 'full')}
                    alt={card.name}
                    loading="lazy"
                    decoding="async"
                    className="card-art-enhanced"
                    style={{
                      width: isMobile ? 72 : 78,
                      height: isMobile ? 104 : 112,
                      aspectRatio: '200 / 290',
                      objectFit: 'contain',
                      borderRadius: 3,
                    }}
                    onError={(e) => {
                      const fallbackMini = getCardImageUrl(card, 'mini');
                      if (e.target.src !== fallbackMini) {
                        e.target.src = fallbackMini;
                      } else {
                        const parent = e.target.parentElement;
                        if (parent) parent.style.display = 'none';
                      }
                    }}
                  />

                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--pharaoh-text-gold)',
                      marginTop: 2,
                      maxWidth: isMobile ? 72 : 78,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                    }}
                    title={card.name}
                  >
                    {card.name}
                  </span>

                  {/* Accurate Stats or Spell/Trap Badge */}
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

                  {/* Expressive Add Button with Plus Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCard(card);
                    }}
                    className="btn-pharaoh-gold"
                    style={{
                      marginTop: 3,
                      width: '100%',
                      padding: '3px 0',
                      fontSize: 10,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                    }}
                    title="ضيفه لمجموعتك"
                  >
                    <PlusIcon size={10} color="#ffffff" />
                    <span>ضيفه لمجموعتك</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Inspector Modal with Clear Arabic Description */}
      <CardDetailModal
        card={inspectCard}
        onClose={() => setInspectCard(null)}
        actionButton={
          <button
            onClick={() => {
              handleAddCard(inspectCard);
              setInspectCard(null);
            }}
            className="btn-pharaoh-gold"
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <PlusIcon size={14} color="#ffffff" />
            <span>ضيفه لمجموعتك دلوقتي</span>
          </button>
        }
      />
    </div>
  );
};
