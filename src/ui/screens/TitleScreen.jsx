import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { SettingsModal } from '../components/SettingsModal.jsx';
import { AIDifficultyModal } from '../components/AIDifficultyModal.jsx';
import { AI_DIFFICULTIES } from '../../game/ai/AIPlayer.js';

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

/* Royal Golden Millennium Puzzle Logo with Glowing Pharaonic Aura & Rotating Sacred Glyphs */
const MillenniumPuzzleLogo = ({ isLight }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: 10, position: 'relative' }}>
      {/* Divine Sunburst Aura & Celestial Glyph Ring */}
      <div
        style={{
          position: 'relative',
          width: 136,
          height: 126,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* Soft Radial Divine Sunbeams */}
        <div className="divine-temple-rays" />

        {/* Rotating Sacred Hieroglyphic Astronomical Ring */}
        <div className="sacred-glyph-ring">
          <svg viewBox="0 0 240 240" width="100%" height="100%">
            <circle cx="120" cy="120" r="108" stroke={isLight ? 'rgba(180, 130, 20, 0.35)' : 'rgba(250, 204, 21, 0.3)'} strokeWidth="1.5" strokeDasharray="3 5" fill="none" />
            <circle cx="120" cy="120" r="98" stroke={isLight ? 'rgba(180, 130, 20, 0.2)' : 'rgba(250, 204, 21, 0.18)'} strokeWidth="1" fill="none" />
            {['𓋹', '𓊽', '𓃭', '𓅓', '𓏤', '𓎼', '𓇋', '𓈖'].map((glyph, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const x = 120 + 103 * Math.cos(angle);
              const y = 120 + 103 * Math.sin(angle);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--pharaoh-gold-bright, #facc15)"
                  fontSize="13"
                  opacity={isLight ? 0.75 : 0.85}
                  style={{ textShadow: '0 0 8px rgba(250, 204, 21, 0.6)' }}
                >
                  {glyph}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Millennium Puzzle Base Visual */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            filter: isLight
              ? 'drop-shadow(0 4px 14px rgba(180, 130, 20, 0.45))'
              : 'drop-shadow(0 0 24px rgba(250, 204, 21, 0.75)) drop-shadow(0 4px 14px rgba(0,0,0,0.8))',
          }}
        >
          <svg width="102" height="98" viewBox="0 0 120 115" fill="none">
            <defs>
              <linearGradient id="puzzleGoldFace" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff8db" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
              <linearGradient id="puzzleGoldSideLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="puzzleGoldSideRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="puzzleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <radialGradient id="puzzleEyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(254, 240, 138, 0.95)" />
                <stop offset="55%" stopColor="rgba(234, 179, 8, 0.5)" />
                <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
              </radialGradient>
            </defs>

            {/* Top Hanging Ring */}
            <circle cx="60" cy="14" r="10" stroke="url(#puzzleRingGrad)" strokeWidth="4.5" fill="none" />
            <circle cx="60" cy="14" r="5" stroke="rgba(0,0,0,0.35)" strokeWidth="1" fill="none" />

            {/* Millennium Puzzle Base Shadow */}
            <polygon points="60,110 8,30 112,30" fill="rgba(0,0,0,0.35)" />

            {/* Inverted Pyramid Facets */}
            <polygon points="60,108 12,32 60,32" fill="url(#puzzleGoldSideLeft)" stroke="#fef08a" strokeWidth="1" />
            <polygon points="60,108 108,32 60,32" fill="url(#puzzleGoldSideRight)" stroke="#fef08a" strokeWidth="1" />

            {/* Interlocking Puzzle Seams */}
            <path d="M 30,58 L 60,74 L 90,58" stroke="#3d2703" strokeWidth="2.5" fill="none" />
            <path d="M 44,44 L 60,52 L 76,44" stroke="#3d2703" strokeWidth="2" fill="none" />
            <path d="M 50,86 L 60,92 L 70,86" stroke="#3d2703" strokeWidth="2" fill="none" />

            {/* Golden Highlights */}
            <path d="M 30,57 L 60,73 L 90,57" stroke="#fffbeb" strokeWidth="1" fill="none" />
            <path d="M 44,43 L 60,51 L 76,43" stroke="#fffbeb" strokeWidth="1" fill="none" />

            {/* Pulsing Eye Aura */}
            <g style={{ animation: 'horusEyeGlow 2.5s ease-in-out infinite' }}>
              <circle cx="60" cy="56" r="22" fill="url(#puzzleEyeGlow)" />
              <path d="M 46,45 Q 60,39 74,45" stroke="#2a1801" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 46,44.5 Q 60,38.5 74,44.5" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M 44,55 Q 60,45 76,55 Q 60,65 44,55 Z" fill="#2a1801" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="60" cy="55" r="4.5" fill="#fef08a" />
              <circle cx="60" cy="55" r="2.2" fill="#1c1203" />
              <path d="M 58,64 L 58,74 L 62,74 L 62,64 Z" fill="#2a1801" />
              <path d="M 68,61 Q 74,68 70,74 Q 66,74 67,69" stroke="#2a1801" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Game Title: YU-GI-OH! */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(28px, 6.8vw, 40px)',
          fontWeight: 900,
          letterSpacing: 3,
          background: isLight
            ? 'linear-gradient(180deg, #92400e 0%, #b45309 30%, #d97706 70%, #78350f 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #fef08a 25%, #eab308 60%, #ca8a04 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: isLight
            ? '0 2px 8px rgba(180, 83, 9, 0.25)'
            : '0 0 20px rgba(234, 179, 8, 0.65), 0 4px 12px rgba(0, 0, 0, 0.9)',
          lineHeight: 1.1,
          marginTop: 2,
          textTransform: 'uppercase',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      >
        YU-GI-OH!
      </div>

      {/* Arabic Subtitle: مبارزة الألفية */}
      <div
        style={{
          fontSize: 'clamp(14px, 3.4vw, 17px)',
          fontWeight: 800,
          color: 'var(--pharaoh-gold-bright)',
          marginTop: 4,
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textShadow: '0 0 12px rgba(250, 204, 21, 0.5), 0 2px 6px rgba(0,0,0,0.7)',
        }}
      >
        <span>مبارزة الألفية الفرعونية</span>
      </div>
    </div>
  );
};

export const TitleScreen = ({
  onStartDuel,
  onOpenMultiplayer,
  onOpenDeckBuilder,
  onOpenCardCatalog,
  theme,
  onToggleTheme,
  aiDifficulty = 'hard',
  onSelectAiDifficulty,
}) => {
  const isLight = theme === 'light';
  const [soundMuted, setSoundMuted] = useState(() => soundManager.isMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
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
          ? 'radial-gradient(circle at 50% 30%, rgba(255, 252, 240, 0.65) 0%, rgba(235, 220, 185, 0.9) 85%), url(/assets/title_bg.png), url(/assets/fie_light.png)'
          : 'radial-gradient(circle at 50% 30%, rgba(45, 32, 16, 0.6) 0%, rgba(12, 10, 7, 0.95) 85%), url(/assets/title_bg.png), url(/assets/fie_night.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {/* Floating Pharaonic Chamber Light Motes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={`mote-${i}`}
            style={{
              position: 'absolute',
              bottom: `${10 + (i * 15)}%`,
              left: `${12 + ((i * 29) % 76)}%`,
              width: i % 2 === 0 ? 4 : 5,
              height: i % 2 === 0 ? 4 : 5,
              borderRadius: '50%',
              background: 'var(--pharaoh-gold-bright, #facc15)',
              boxShadow: '0 0 10px rgba(250, 204, 21, 0.9), 0 0 20px rgba(234, 179, 8, 0.6)',
              animation: `templeMoteRise ${5 + (i * 0.9)}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
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
        {/* Architectural Cavetto Cornice with Winged Sun of Ra & Millennium Puzzle Logo */}
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

          {/* Millennium Puzzle Royal Logo */}
          <MillenniumPuzzleLogo isLight={isLight} />
        </div>

        {/* Monumental Carved Stele Action Tablets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
          {/* 1. Solo Duel vs AI */}
          <button
            onClick={() => {
              soundManager.playDecide();
              hapticManager.triggerCombatVibration('click');
              setIsDifficultyModalOpen(true);
            }}
            className="temple-stele-button temple-stele-primary"
          >
            <div className="temple-stele-sheen" />
            <div className="temple-stele-icon-box" style={{ background: 'rgba(240, 203, 100, 0.25)', borderColor: 'var(--pharaoh-gold-bright)' }}>
              <KhopeshSwordsIcon size={24} color="var(--pharaoh-gold-bright)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  ادخل ماتش ضد الكمبيوتر
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--pharaoh-text-gold)', opacity: 0.9 }}>
                  {AI_DIFFICULTIES[aiDifficulty]?.name || 'خبير (سيتو كايبا)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>
                  المستوى {AI_DIFFICULTIES[aiDifficulty]?.stars || 3}
                </span>
                <span className="temple-stele-badge">VS AI</span>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                تحدّى صاحبك 
              </span>
              <span className="temple-stele-badge">PVP</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                جهّز وظبّط مجموعتك
              </span>
              <span className="temple-stele-badge">42 DECKS</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                كتالوج كل الكروت الفرعونية
              </span>
              <span className="temple-stele-badge">1,114</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                تظبيط اللعبة والماتش
              </span>
              <span className="temple-stele-badge">CONFIG</span>
            </div>
          </button>
        </div>
      </div>

      {/* Temple Wall Foundation Footer */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 10.5,
          color: 'var(--pharaoh-text-muted)',
          padding: '8px 0 6px',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ letterSpacing: 1.5, opacity: 0.65 }}>YU-GI-OH! • DUEL MONSTERS</span>
          <a
            href="/YuGiOh-Mobile.apk"
            download="YuGiOh-Mobile.apk"
            onClick={() => soundManager.playDecide()}
            style={{
              textDecoration: 'none',
              color: 'var(--pharaoh-gold-bright)',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              padding: '3px 10px',
              borderRadius: 4,
              fontWeight: 800,
              fontSize: 10.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            نزّل نسخة الموبايل (APK أندرويد)
          </a>
        </div>

        {/* Small Decorative Developer Signature */}
        <div className="pharaoh-dev-credit" style={{ marginTop: 2 }}>
          <span className="pharaoh-dev-credit-line" />
          <span className="pharaoh-dev-credit-glyph">𓋹</span>
          <span>develope by Amr Khalid</span>
          <span className="pharaoh-dev-credit-glyph">𓋹</span>
          <span className="pharaoh-dev-credit-line" />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
        aiDifficulty={aiDifficulty}
        onSelectAiDifficulty={onSelectAiDifficulty}
      />

      {/* AI Difficulty Selector Modal */}
      <AIDifficultyModal
        isOpen={isDifficultyModalOpen}
        onClose={() => setIsDifficultyModalOpen(false)}
        selectedDifficulty={aiDifficulty}
        onSelectDifficulty={(diff) => {
          if (onSelectAiDifficulty) onSelectAiDifficulty(diff);
        }}
        onConfirmStart={() => {
          setIsDifficultyModalOpen(false);
          onStartDuel(aiDifficulty);
        }}
      />
    </div>
  );
};
