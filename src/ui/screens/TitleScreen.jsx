import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { SettingsModal } from '../components/SettingsModal.jsx';

/* Sleek Pure-SVG Pharaonic & Gaming Icons (Zero Emojis) */
const KhopeshSwordsIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="M9.5 6.5l8 8" />
  </svg>
);

const ObeliskNetworkIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6,22 8,6 10,2 12,6 14,22" />
    <path d="M17 11a5 5 0 0 1 0 7" />
    <path d="M20 8a9 9 0 0 1 0 13" />
    <path d="M3 11a5 5 0 0 0 0 7" />
  </svg>
);

const DeckStackIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="14" height="15" rx="2" />
    <path d="M6 3h12a2 2 0 0 1 2 2v13" />
    <circle cx="9" cy="14.5" r="2.5" />
  </svg>
);

const PapyrusCatalogIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

const TempleGearsIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SunIcon = ({ size = 16, color = 'currentColor' }) => (
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

const MoonIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const VolumeOnIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const VolumeOffIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const MaximizeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const MinimizeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14h6v6" />
    <path d="M20 10h-6V4" />
    <path d="M14 10l7-7" />
    <path d="M3 21l7-7" />
  </svg>
);

export const TitleScreen = ({
  onStartDuel,
  onOpenMultiplayer,
  onOpenDeckBuilder,
  onOpenCardCatalog,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const [soundMuted, setSoundMuted] = useState(() => soundManager.isMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof document === 'undefined') return false;
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  });

  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFs);
    document.addEventListener('webkitfullscreenchange', handleFs);
    return () => {
      document.removeEventListener('fullscreenchange', handleFs);
      document.removeEventListener('webkitfullscreenchange', handleFs);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    hapticManager.triggerCombatVibration('click');
    soundManager.playClick();
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        setIsFullscreen(false);
      } else {
        const root = document.documentElement;
        if (root.requestFullscreen) await root.requestFullscreen();
        else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const stoneColor = isLight ? '#785208' : '#f0cb64';
  const stoneBorderColor = isLight ? '#b89f70' : '#3d3222';

  return (
    <div
      className="temple-wall-container"
      style={{
        backgroundImage: isLight
          ? 'radial-gradient(circle at center, rgba(255, 252, 240, 0.42) 0%, rgba(235, 220, 185, 0.82) 85%), url(/assets/fie_light.png)'
          : 'radial-gradient(circle at center, rgba(30, 24, 16, 0.72) 0%, rgba(10, 8, 6, 0.95) 85%), url(/assets/fie_desert.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {/* Ancient Temple Ashlar Masonry Wall Lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: isLight ? 0.22 : 0.15,
          color: stoneColor,
        }}
      >
        <defs>
          <pattern id="temple-ashlar-blocks" width="320" height="160" patternUnits="userSpaceOnUse">
            <line x1="0" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="1.6" />
            <line x1="160" y1="0" x2="160" y2="80" stroke="currentColor" strokeWidth="1.2" />
            <line x1="0" y1="160" x2="320" y2="160" stroke="currentColor" strokeWidth="1.6" />
            <line x1="80" y1="80" x2="80" y2="160" stroke="currentColor" strokeWidth="1.2" />
            <line x1="240" y1="80" x2="240" y2="160" stroke="currentColor" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#temple-ashlar-blocks)" />
      </svg>

      {/* Left Temple Carved Hieroglyphic Column */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: 'clamp(20px, 5vw, 42px)',
          borderLeft: `1.5px solid ${stoneBorderColor}`,
          background: isLight ? 'rgba(235, 224, 197, 0.5)' : 'rgba(15, 12, 8, 0.5)',
          pointerEvents: 'none',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px 0',
          opacity: isLight ? 0.65 : 0.45,
          color: stoneColor,
        }}
      >
        {/* Eye of Horus */}
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
          <path d="M 10,35 Q 50,12 90,35 Q 50,56 10,35 Z" stroke="currentColor" strokeWidth="4" />
          <circle cx="50" cy="34" r="8" fill="currentColor" />
          <path d="M 5,20 Q 50,3 95,20" stroke="currentColor" strokeWidth="3" />
          <path d="M 50,47 L 50,75" stroke="currentColor" strokeWidth="4" />
        </svg>
        {/* Ankh */}
        <svg width="22" height="26" viewBox="0 0 50 70" fill="none">
          <ellipse cx="25" cy="18" rx="10" ry="14" stroke="currentColor" strokeWidth="3.5" />
          <line x1="6" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="36" x2="25" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        {/* Scarab */}
        <svg width="22" height="26" viewBox="0 0 60 70" fill="none">
          <circle cx="30" cy="8" r="5" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="30" cy="32" rx="10" ry="14" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="20" x2="30" y2="46" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        {/* Djed Pillar */}
        <svg width="20" height="28" viewBox="0 0 40 60" fill="none">
          <line x1="20" y1="5" x2="20" y2="55" stroke="currentColor" strokeWidth="3.5" />
          <line x1="10" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right Temple Carved Hieroglyphic Column */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'clamp(20px, 5vw, 42px)',
          borderRight: `1.5px solid ${stoneBorderColor}`,
          background: isLight ? 'rgba(235, 224, 197, 0.5)' : 'rgba(15, 12, 8, 0.5)',
          pointerEvents: 'none',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px 0',
          opacity: isLight ? 0.65 : 0.45,
          color: stoneColor,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
          <path d="M 90,35 Q 50,12 10,35 Q 50,56 90,35 Z" stroke="currentColor" strokeWidth="4" />
          <circle cx="50" cy="34" r="8" fill="currentColor" />
          <path d="M 95,20 Q 50,3 5,20" stroke="currentColor" strokeWidth="3" />
          <path d="M 50,47 L 50,75" stroke="currentColor" strokeWidth="4" />
        </svg>
        <svg width="22" height="26" viewBox="0 0 50 70" fill="none">
          <ellipse cx="25" cy="18" rx="10" ry="14" stroke="currentColor" strokeWidth="3.5" />
          <line x1="6" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="36" x2="25" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <svg width="22" height="26" viewBox="0 0 60 70" fill="none">
          <circle cx="30" cy="8" r="5" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="30" cy="32" rx="10" ry="14" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="20" x2="30" y2="46" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        <svg width="20" height="28" viewBox="0 0 40 60" fill="none">
          <line x1="20" y1="5" x2="20" y2="55" stroke="currentColor" strokeWidth="3.5" />
          <line x1="10" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Top Header Quick Utility Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 40,
          padding: '4px 6px',
        }}
      >
        <button
          onClick={() => {
            hapticManager.triggerCombatVibration('click');
            setIsSettingsOpen(true);
          }}
          className="btn-pharaoh-stone"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 20,
          }}
          title="إعدادات اللعبة"
        >
          <TempleGearsIcon size={16} />
          <span>الإعدادات</span>
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => {
              onToggleTheme();
              hapticManager.triggerCombatVibration('click');
            }}
            className="btn-icon-pharaoh"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pharaoh-stone-card)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: 'var(--pharaoh-gold-bright)',
              cursor: 'pointer',
              padding: 0,
            }}
            title={isLight ? 'التحويل للوضع الداكن' : 'التحويل للوضع الفاتح'}
          >
            {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>

          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setSoundMuted(muted);
              hapticManager.triggerCombatVibration('click');
            }}
            className="btn-icon-pharaoh"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pharaoh-stone-card)',
              border: '1px solid var(--pharaoh-stone-border)',
              color: soundMuted ? '#9ca3af' : 'var(--pharaoh-gold-bright)',
              cursor: 'pointer',
              padding: 0,
            }}
            title={soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {soundMuted ? <VolumeOffIcon size={16} /> : <VolumeOnIcon size={16} />}
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="btn-icon-pharaoh"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pharaoh-stone-card)',
              border: `1px solid ${isFullscreen ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-stone-border)'}`,
              color: isFullscreen ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)',
              cursor: 'pointer',
              padding: 0,
            }}
            title={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'تفعيل وضع ملء الشاشة الكامل'}
          >
            {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Main Pharaonic Temple Wall Facade (Full Width on Mobile) */}
      <div className="temple-wall-facade">
        {/* Architectural Cavetto Cornice with Winged Sun of Ra */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
          <svg width="220" height="42" viewBox="0 0 280 50" fill="none" style={{ color: stoneColor }}>
            {/* Winged Sun Disc of Ra */}
            <circle cx="140" cy="24" r="12" stroke="currentColor" strokeWidth="2.5" fill="rgba(201, 158, 50, 0.2)" />
            <circle cx="140" cy="24" r="6" fill="currentColor" />
            {/* Left Wing */}
            <path d="M 126,20 C 85,6 35,10 5,26 C 45,28 90,26 126,25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 126,24 C 85,14 40,20 15,34 C 50,33 90,29 126,27 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
            {/* Right Wing */}
            <path d="M 154,20 C 195,6 245,10 275,26 C 235,28 190,26 154,25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 154,24 C 195,14 240,20 265,34 C 230,33 190,29 154,27 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          </svg>

          {/* Sacred Eye of Horus (Wedjat) Medallion */}
          <div
            style={{
              margin: '4px 0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: isLight
                ? 'radial-gradient(circle, rgba(255, 248, 225, 0.95) 0%, rgba(230, 205, 150, 0.6) 80%)'
                : 'radial-gradient(circle, rgba(45, 36, 20, 0.95) 0%, rgba(18, 14, 9, 0.95) 85%)',
              border: '2px solid var(--pharaoh-gold-bright)',
              boxShadow: isLight
                ? '0 4px 14px rgba(120, 82, 8, 0.3), inset 0 0 14px rgba(201, 158, 50, 0.25)'
                : '0 0 24px rgba(240, 203, 100, 0.4), inset 0 0 16px rgba(201, 158, 50, 0.3)',
              position: 'relative',
            }}
            title="عين حورس المقدسة (Eye of Horus)"
          >
            <svg width="56" height="48" viewBox="0 0 120 100" fill="none">
              {/* Upper Eyebrow Arch */}
              <path
                d="M 12,24 Q 58,6 108,22"
                stroke="var(--pharaoh-gold-bright)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Upper Eyelid Arch with outer eyeliner extension */}
              <path
                d="M 10,44 Q 58,16 100,42 L 114,44"
                stroke="var(--pharaoh-gold-bright)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lower Eyelid Arch */}
              <path
                d="M 10,44 Q 58,70 100,42"
                stroke="var(--pharaoh-gold-bright)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Sacred Pupil & Iris */}
              <circle cx="58" cy="43" r="13" stroke="var(--pharaoh-gold-bright)" strokeWidth="3" fill="rgba(201, 158, 50, 0.3)" />
              <circle cx="58" cy="43" r="6" fill="var(--pharaoh-gold-bright)" />
              {/* Vertical Falcon Tear Line Drop */}
              <path
                d="M 54,57 L 54,88 L 60,88 L 60,57 Z"
                fill="var(--pharaoh-gold-bright)"
              />
              {/* Falcon Spiral Tail / Plumage Curl */}
              <path
                d="M 76,52 Q 92,68 88,82 Q 85,92 72,90 Q 64,88 66,78 Q 68,70 78,72"
                stroke="var(--pharaoh-gold-bright)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Royal Pharaonic Cartouche containing Ancient Egyptian Title */}
          <div className="royal-cartouche-container">
            <div className="royal-cartouche-border">
              {/* Ancient Egyptian Hieroglyphic Title */}
              <div
                className="royal-cartouche-hieroglyphs"
                title="𓇋𓏲𓎼𓇋𓏲 𓂝𓎛𓄿 𓈖 𓈙𓄿𓇋 (Yu-Gi-Oh — Clash of Destinies)"
              >
                𓇋𓏲𓎼𓇋𓏲 𓂝𓎛𓄿
              </div>

              {/* Arabic Title & Phonetic Transliteration */}

              {/* Cartouche Tied Shen Knot Base */}
              <div className="royal-cartouche-knot" />
            </div>
          </div>

          {/* Subtitle Cartouche Pill */}
        </div>

        {/* Monumental Carved Stele Action Tablets (Full Width on Mobile) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          {/* 1. Solo Duel vs AI */}
          <button
            onClick={() => {
              soundManager.playDecide();
              hapticManager.triggerCombatVibration('click');
              onStartDuel();
            }}
            className="temple-stele-button temple-stele-primary"
          >
            <div className="temple-stele-icon-box" style={{ background: 'rgba(240, 203, 100, 0.25)', borderColor: 'var(--pharaoh-gold-bright)' }}>
              <KhopeshSwordsIcon size={24} color="var(--pharaoh-gold-bright)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                مبارزة فردية كلاسيكية
              </span>
              <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                خض معركة فورية ضد سيتو كايبا وذكاء الذكاء الاصطناعي التكتيكي
              </span>
            </div>
          </button>

          {/* 2. Local Multiplayer */}
          <button
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              onOpenMultiplayer();
            }}
            className="temple-stele-button"
          >
            <div className="temple-stele-icon-box">
              <ObeliskNetworkIcon size={22} color="var(--pharaoh-text-gold)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                نزال جماعي محلي (Multiplayer)
              </span>
              <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                اتصال مباشر وجهاً لوجه عبر نقطة الاتصال أو البلوتوث
              </span>
            </div>
          </button>

          {/* 3. Deck Builder */}
          <button
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              onOpenDeckBuilder();
            }}
            className="temple-stele-button"
          >
            <div className="temple-stele-icon-box">
              <DeckStackIcon size={22} color="var(--pharaoh-text-gold)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                بناء وتعديل المجموعة (Decks)
              </span>
              <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                استعراض 42 مجموعة مبارزة جاهزة وتخصيص استراتيجيتك
              </span>
            </div>
          </button>

          {/* 4. Card Catalog */}
          <button
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              onOpenCardCatalog();
            }}
            className="temple-stele-button"
          >
            <div className="temple-stele-icon-box">
              <PapyrusCatalogIcon size={22} color="var(--pharaoh-text-gold)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                مكتبة وأرشيف البطاقات (Card Index)
              </span>
              <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                تصفح وفحص 1,114 بطاقة رسمية مع تفاصيل الهجوم والدفاع
              </span>
            </div>
          </button>

          {/* 5. Settings */}
          <button
            onClick={() => {
              hapticManager.triggerCombatVibration('click');
              setIsSettingsOpen(true);
            }}
            className="temple-stele-button"
          >
            <div className="temple-stele-icon-box">
              <TempleGearsIcon size={20} color="var(--pharaoh-text-gold)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                إعدادات المبارزة والمظهر
              </span>
              <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                التحكم في المؤثرات الصوتية، الاهتزاز، والوضع الفاتح والداكن
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Temple Wall Foundation Footer */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 10.5,
          color: 'var(--pharaoh-text-muted)',
          letterSpacing: 1,
          padding: '8px 0 4px',
          zIndex: 30,
        }}
      >
        صرح الفرعون الأبدي • نظام مستقل 100% بدون إنترنت
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </div>
  );
};
