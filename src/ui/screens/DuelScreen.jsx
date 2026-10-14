import React, { useState, useEffect, useRef } from 'react';
import { DuelEngine } from '../../game/engine/DuelEngine.js';
import { AIPlayer } from '../../game/ai/AIPlayer.js';
import { getPhaseArabicName } from '../../game/engine/PhaseManager.js';
import { CardDetailModal } from '../components/CardDetailModal.jsx';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { SettingsModal } from '../components/SettingsModal.jsx';
import { GraveyardModal } from '../components/GraveyardModal.jsx';
import { CardSelectModal } from '../components/CardSelectModal.jsx';
import { connectionManager } from '../../multiplayer/ConnectionManager.js';

const GraveyardIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h10l3 5-2 13H6L4 8l3-5z" />
    <line x1="12" y1="7" x2="12" y2="17" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);

const SettingsIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SoundOnIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SoundOffIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const ThemeSunIcon = ({ size = 16, color = 'currentColor' }) => (
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

const ThemeMoonIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SurrenderIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const PharaohHieroglyphOverlay = ({ fieldKey, theme }) => {
  const isLight = theme === 'light';
  let strokeColor = isLight ? '#785208' : '#f0cb64';
  let auraGlow = isLight ? 'rgba(201, 158, 50, 0.16)' : 'rgba(240, 203, 100, 0.22)';
  let emblemGlow = isLight ? 'rgba(120, 82, 8, 0.25)' : 'rgba(240, 203, 100, 0.35)';

  if (fieldKey === 'yami') {
    strokeColor = isLight ? '#7e22ce' : '#c084fc';
    auraGlow = 'rgba(168, 85, 247, 0.25)';
    emblemGlow = 'rgba(168, 85, 247, 0.4)';
  } else if (fieldKey === 'umi') {
    strokeColor = isLight ? '#0284c7' : '#38bdf8';
    auraGlow = 'rgba(14, 165, 233, 0.25)';
    emblemGlow = 'rgba(14, 165, 233, 0.4)';
  } else if (fieldKey === 'sogen' || fieldKey === 'forest') {
    strokeColor = isLight ? '#15803d' : '#4ade80';
    auraGlow = 'rgba(34, 197, 94, 0.25)';
    emblemGlow = 'rgba(34, 197, 94, 0.4)';
  } else if (fieldKey === 'mountain') {
    strokeColor = isLight ? '#b45309' : '#fbbf24';
    auraGlow = 'rgba(245, 158, 11, 0.25)';
    emblemGlow = 'rgba(245, 158, 11, 0.4)';
  } else if (fieldKey === 'wasteland') {
    strokeColor = isLight ? '#78350f' : '#d97706';
    auraGlow = 'rgba(217, 119, 6, 0.25)';
    emblemGlow = 'rgba(217, 119, 6, 0.4)';
  } else if (fieldKey === 'gaia') {
    strokeColor = isLight ? '#c2410c' : '#fb923c';
    auraGlow = 'rgba(249, 115, 22, 0.25)';
    emblemGlow = 'rgba(249, 115, 22, 0.4)';
  } else if (fieldKey === 'burn') {
    strokeColor = isLight ? '#b91c1c' : '#f87171';
    auraGlow = 'rgba(239, 68, 68, 0.28)';
    emblemGlow = 'rgba(239, 68, 68, 0.45)';
  } else if (fieldKey === 'shine' || fieldKey === 'sanctuary') {
    strokeColor = isLight ? '#a16207' : '#fde047';
    auraGlow = 'rgba(250, 204, 21, 0.28)';
    emblemGlow = 'rgba(250, 204, 21, 0.45)';
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
        transition: 'color 0.6s ease, filter 0.6s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 140px ${auraGlow}`,
          transition: 'box-shadow 0.6s ease',
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isLight ? 0.42 : 0.26,
          color: strokeColor,
          filter: `drop-shadow(0 0 6px ${emblemGlow})`,
          transition: 'color 0.6s ease, filter 0.6s ease, opacity 0.4s ease',
        }}
      >
        <defs>
          <pattern id="pharaoh-wall-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 5,20 Q 15,14 25,20 T 45,20 T 65,20 T 85,20 T 105,20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <path d="M 5,26 Q 15,20 25,26 T 45,26 T 65,26 T 85,26 T 105,26" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <g transform="translate(15, 45) scale(0.35)">
              <ellipse cx="25" cy="18" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <line x1="8" y1="36" x2="42" y2="36" stroke="currentColor" strokeWidth="2.5" />
              <line x1="25" y1="36" x2="25" y2="60" stroke="currentColor" strokeWidth="2.5" />
            </g>
            <path d="M 50,50 L 50,75 M 50,55 Q 56,48 50,42" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <g transform="translate(75, 48) scale(0.28)">
              <path d="M 10,25 Q 35,10 60,25 Q 35,40 10,25 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="35" cy="24" r="5" fill="currentColor" />
              <path d="M 8,15 Q 35,5 62,15" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 35,32 L 35,46" stroke="currentColor" strokeWidth="2" />
            </g>
            <g transform="translate(20, 85) scale(0.35)">
              <line x1="20" y1="5" x2="20" y2="35" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="10" x2="28" y2="10" stroke="currentColor" strokeWidth="1.8" />
              <line x1="10" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.8" />
              <line x1="8" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="1.8" />
            </g>
            <g transform="translate(75, 82) scale(0.32)">
              <ellipse cx="20" cy="18" rx="6" ry="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <line x1="20" y1="15" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="20" cy="8" rx="3.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#pharaoh-wall-pattern)" opacity="0.32" />

        {/* Left Hieroglyphic Column */}
        <g transform="translate(25, 60)">
          <rect x="0" y="0" width="70" height="760" rx="35" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.75" />
          <line x1="0" y1="765" x2="70" y2="765" stroke="currentColor" strokeWidth="3" opacity="0.8" />

          {/* Eye of Horus */}
          <g transform="translate(7, 30) scale(0.55)">
            <path d="M 10,35 Q 50,12 90,35 Q 50,56 10,35 Z" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="34" r="8" fill="currentColor" />
            <path d="M 5,20 Q 50,3 95,20" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 50,47 L 50,75" stroke="currentColor" strokeWidth="3" />
            <path d="M 68,45 C 74,60 84,65 90,58 C 95,50 87,42 80,45" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </g>

          {/* Ankh */}
          <g transform="translate(18, 120) scale(0.68)">
            <ellipse cx="25" cy="18" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="6" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="25" y1="36" x2="25" y2="65" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* Sacred Scarab */}
          <g transform="translate(12, 215) scale(0.75)">
            <circle cx="30" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="30" cy="16" rx="5.5" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="30" cy="30" rx="9" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="26" x2="30" y2="42" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 21,26 Q 30,24 39,26" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 22,22 C 14,19 12,14 10,12" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 38,22 C 46,19 48,14 50,12" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 21,30 C 13,30 11,35 9,39" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 39,30 C 47,30 49,35 51,39" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 22,38 C 14,43 12,50 12,54" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 38,38 C 46,43 48,50 48,54" stroke="currentColor" strokeWidth="1.8" fill="none" />
          </g>

          {/* Djed Pillar */}
          <g transform="translate(15, 305) scale(0.9)">
            <line x1="20" y1="5" x2="20" y2="48" stroke="currentColor" strokeWidth="2.8" />
            <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="8" y1="15" x2="32" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4" y1="25" x2="36" y2="25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="10" y1="48" x2="30" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Winged Falcon */}
          <g transform="translate(8, 400) scale(0.65)">
            <path d="M 40,15 C 25,25 10,40 5,60 C 25,50 35,40 40,30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 40,15 C 55,25 70,40 75,60 C 55,50 45,40 40,30" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="40" cy="12" r="5" fill="currentColor" />
          </g>

          {/* Was Scepter */}
          <g transform="translate(20, 485) scale(0.85)">
            <path d="M 12,8 Q 18,3 20,8 L 16,50 L 12,56 M 16,50 L 20,56" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </g>

          {/* Shen Ring */}
          <g transform="translate(18, 575) scale(0.8)">
            <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="4" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Papyrus */}
          <g transform="translate(12, 650) scale(0.8)">
            <path d="M 22,10 L 22,45 M 22,18 C 12,12 8,20 16,28 M 22,18 C 32,12 36,20 28,28" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 4,55 Q 12,48 20,55 T 36,55" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </g>
        </g>

        {/* Right Hieroglyphic Column */}
        <g transform="translate(1105, 60)">
          <rect x="0" y="0" width="70" height="760" rx="35" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.75" />
          <line x1="0" y1="765" x2="70" y2="765" stroke="currentColor" strokeWidth="3" opacity="0.8" />

          {/* Eye of Horus (Mirrored) */}
          <g transform="translate(7, 30) scale(0.55)">
            <path d="M 90,35 Q 50,12 10,35 Q 50,56 90,35 Z" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="34" r="8" fill="currentColor" />
            <path d="M 95,20 Q 50,3 5,20" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 50,47 L 50,75" stroke="currentColor" strokeWidth="3" />
            <path d="M 32,45 C 26,60 16,65 10,58 C 5,50 13,42 20,45" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </g>

          {/* Ankh */}
          <g transform="translate(18, 120) scale(0.68)">
            <ellipse cx="25" cy="18" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="6" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="25" y1="36" x2="25" y2="65" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* Sacred Scarab */}
          <g transform="translate(12, 215) scale(0.75)">
            <circle cx="30" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="30" cy="16" rx="5.5" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <ellipse cx="30" cy="30" rx="9" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="26" x2="30" y2="42" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 21,26 Q 30,24 39,26" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 22,22 C 14,19 12,14 10,12" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 38,22 C 46,19 48,14 50,12" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 21,30 C 13,30 11,35 9,39" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 39,30 C 47,30 49,35 51,39" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 22,38 C 14,43 12,50 12,54" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="M 38,38 C 46,43 48,50 48,54" stroke="currentColor" strokeWidth="1.8" fill="none" />
          </g>

          {/* Djed Pillar */}
          <g transform="translate(15, 305) scale(0.9)">
            <line x1="20" y1="5" x2="20" y2="48" stroke="currentColor" strokeWidth="2.8" />
            <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="8" y1="15" x2="32" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4" y1="25" x2="36" y2="25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="10" y1="48" x2="30" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Winged Falcon */}
          <g transform="translate(8, 400) scale(0.65)">
            <path d="M 40,15 C 25,25 10,40 5,60 C 25,50 35,40 40,30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 40,15 C 55,25 70,40 75,60 C 55,50 45,40 40,30" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="40" cy="12" r="5" fill="currentColor" />
          </g>

          {/* Was Scepter */}
          <g transform="translate(20, 485) scale(0.85)">
            <path d="M 12,8 Q 18,3 20,8 L 16,50 L 12,56 M 16,50 L 20,56" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </g>

          {/* Shen Ring */}
          <g transform="translate(18, 575) scale(0.8)">
            <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="4" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Papyrus */}
          <g transform="translate(12, 650) scale(0.8)">
            <path d="M 22,10 L 22,45 M 22,18 C 12,12 8,20 16,28 M 22,18 C 32,12 36,20 28,28" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 4,55 Q 12,48 20,55 T 36,55" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </g>
        </g>

        {/* Central Winged Sun of Ra & Horus Eye */}
        <g transform="translate(600, 445)">
          <g transform="translate(-80, -45) scale(1.6)" opacity="0.6">
            <path d="M 10,35 Q 50,12 90,35 Q 50,56 10,35 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="34" r="7.5" fill="currentColor" opacity="0.65" />
            <path d="M 5,20 Q 50,3 95,20" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M 50,47 L 50,75" stroke="currentColor" strokeWidth="2" />
            <path d="M 68,45 C 74,60 84,65 90,58 C 95,50 87,42 80,45" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </g>

          <circle cx="0" cy="0" r="32" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.75" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />

          <path d="M -30,-8 C -110,-40 -260,-35 -380,5 C -250,22 -120,15 -30,10 Z" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.65" />
          <path d="M -30,0 C -120,-20 -240,-15 -340,25 C -230,35 -110,25 -30,14 Z" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
          <path d="M -30,8 C -100,-5 -200,5 -300,45 C -200,50 -90,35 -30,18 Z" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />

          <path d="M 30,-8 C 110,-40 260,-35 380,5 C 250,22 120,15 30,10 Z" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.65" />
          <path d="M 30,0 C 120,-20 240,-15 340,25 C 230,35 110,25 30,14 Z" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
          <path d="M 30,8 C 100,-5 200,5 300,45 C 200,50 90,35 30,18 Z" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />

          <path d="M -12,-32 C -20,-48 -6,-52 -10,-60 M 12,-32 C 20,-48 6,-52 10,-60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
};

export const DuelScreen = ({
  engine,
  onExit,
  isAiDuel = true,
  isMultiplayer = false,
  multiplayerData = null,
  theme,
  onToggleTheme,
}) => {
  const [state, setState] = useState(engine.getState());
  const [soundMuted, setSoundMuted] = useState(() => soundManager.isMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper to execute locally and broadcast to opponent in multiplayer
  const executeAndBroadcast = (action, ...args) => {
    if (isMultiplayer) {
      connectionManager.send({
        type: 'DUEL_ACTION',
        action,
        args,
      });
    }
    return engine[action](...args);
  };

  // Remote multiplayer action listener
  useEffect(() => {
    if (!isMultiplayer) return;

    const unsubMsg = connectionManager.onMessage((msg) => {
      if (msg.type === 'DUEL_ACTION') {
        try {
          if (typeof engine[msg.action] === 'function') {
            engine[msg.action](...msg.args);
          }
        } catch (e) {
          console.error('Failed to execute remote duel action:', e);
        }
      } else if (msg.type === 'SURRENDER') {
        engine.state.winner = 0;
        engine.state.winReason = 'SURRENDER';
        engine.state.lastLog.push(`انسحب المنافس ${engine.state.players[1]?.name || 'المنافس'}.`);
        engine.notify();
      }
    });

    return unsubMsg;
  }, [isMultiplayer, engine]);
  const [selectedHandIndex, setSelectedHandIndex] = useState(null);
  const [selectedFieldMonsterZone, setSelectedFieldMonsterZone] = useState(null);
  const [inspectCard, setInspectCard] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Graveyard Viewer State ({ isOpen: boolean, playerIndex: 0 | 1 })
  const [graveyardViewer, setGraveyardViewer] = useState(null);

  // Interactive Card Selection Modal (Graveyard recovery / Monster Reborn)
  const [cardSelectModal, setCardSelectModal] = useState(null);

  // Tribute Summoning State
  const [tributeSelection, setTributeSelection] = useState(null);
  // { handIndex: number, card: Object, position: string, requiredTributes: number, selectedZones: number[] }

  // Spell Activation Animation State
  const [spellAnimation, setSpellAnimation] = useState(null);
  // { playerIndex: number, spellCard: Object, effectMeta: Object }

  // Animation States
  const [combatAnimation, setCombatAnimation] = useState(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Animated LP Display
  const [displayedP0LP, setDisplayedP0LP] = useState(state.players[0].lifePoints);
  const [displayedP1LP, setDisplayedP1LP] = useState(state.players[1].lifePoints);

  const p0MonsterRefs = useRef([]);
  const p1MonsterRefs = useRef([]);
  const p0LpRef = useRef(null);
  const p1LpRef = useRef(null);
  const arenaRef = useRef(null);

  // Subscribe to engine state
  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });
    soundManager.playStart();
    return unsubscribe;
  }, [engine]);

  // Subscribe to engine spell events
  useEffect(() => {
    const unsubSpell = engine.onSpell((data) => {
      triggerSpellAnimation(data);
    });
    return unsubSpell;
  }, [engine]);

  // Subscribe to engine tribute events
  useEffect(() => {
    const unsubTribute = engine.onTribute((data) => {
      soundManager.playDestroy();
      hapticManager.triggerCombatVibration('destroy');
    });
    return unsubTribute;
  }, [engine]);

  // Subscribe to engine combat attack events (both Player and AI attacks)
  useEffect(() => {
    const unsubAttack = engine.onAttack((evt) => {
      triggerAttackAnimation(
        evt.attackerPlayer,
        evt.attackerZone,
        !evt.isDirect,
        evt.targetZone,
        evt.damage,
        evt.isDefenseBlocked,
        evt.damagePlayerIdx,
        evt.attackerAttribute,
        evt.defenderAttribute
      );
    });
    return unsubAttack;
  }, [engine]);

  // Audio & Haptic for victory / defeat
  useEffect(() => {
    if (state.winner !== null) {
      hapticManager.triggerCombatVibration('gameover');
      if (state.winner === 0) {
        soundManager.playWin();
      } else {
        soundManager.playLose();
      }
    }
  }, [state.winner]);

  // Smooth Life Points counter
  useEffect(() => {
    const target0 = state.players[0].lifePoints;
    const target1 = state.players[1].lifePoints;

    const interval = setInterval(() => {
      setDisplayedP0LP((prev) => {
        if (prev === target0) return prev;
        const diff = target0 - prev;
        const step = Math.sign(diff) * Math.max(10, Math.floor(Math.abs(diff) / 6));
        return Math.abs(diff) <= 20 ? target0 : prev + step;
      });

      setDisplayedP1LP((prev) => {
        if (prev === target1) return prev;
        const diff = target1 - prev;
        const step = Math.sign(diff) * Math.max(10, Math.floor(Math.abs(diff) / 6));
        return Math.abs(diff) <= 20 ? target1 : prev + step;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [state.players[0].lifePoints, state.players[1].lifePoints]);

  // Handle AI Turns
  useEffect(() => {
    if (isAiDuel && state.currentTurnPlayer === 1 && state.winner === null && !isAiThinking) {
      setIsAiThinking(true);
      const ai = new AIPlayer(1, 'normal');
      ai.takeTurn(engine, 750).finally(() => {
        setIsAiThinking(false);
      });
    }
  }, [state.currentTurnPlayer, state.winner, isAiDuel, isAiThinking, engine]);

  const p0 = state.players[0];
  const p1 = state.players[1];

  const triggerAttackAnimation = (
    attackerPlayer,
    attackerZoneIdx,
    isDefenderMonster,
    defenderZoneIdx,
    damage,
    isShield,
    damagePlayerIdx,
    attackerAttribute = 'PHARAOH',
    defenderAttribute = 'PHARAOH'
  ) => {
    try {
      const arenaRect = arenaRef.current?.getBoundingClientRect();
      if (!arenaRect) return;

      const attackerRefs = attackerPlayer === 0 ? p0MonsterRefs : p1MonsterRefs;
      const defenderRefs = attackerPlayer === 0 ? p1MonsterRefs : p0MonsterRefs;
      const targetLpRef = attackerPlayer === 0 ? p1LpRef : p0LpRef;

      const attackerEl = attackerRefs.current[attackerZoneIdx];
      const defenderEl = isDefenderMonster ? defenderRefs.current[defenderZoneIdx] : targetLpRef.current;

      if (attackerEl && defenderEl) {
        const attRect = attackerEl.getBoundingClientRect();
        const defRect = defenderEl.getBoundingClientRect();

        const x1 = attRect.left + attRect.width / 2 - arenaRect.left;
        const y1 = attRect.top + attRect.height / 2 - arenaRect.top;
        const x2 = defRect.left + defRect.width / 2 - arenaRect.left;
        const y2 = defRect.top + defRect.height / 2 - arenaRect.top;

        const distance = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        soundManager.playAttack();

        setCombatAnimation({
          x1,
          y1,
          distance,
          angle,
          targetX: x2,
          targetY: y2,
          damage,
          isShield,
          damagePlayerIdx,
          element: (attackerAttribute || 'pharaoh').toLowerCase(),
          defenderElement: (defenderAttribute || 'pharaoh').toLowerCase(),
        });

        if (damage > 0) {
          setIsScreenShaking(true);
          setTimeout(() => {
            soundManager.playDamage();
            hapticManager.triggerCombatVibration('damage', { damage });
            setIsScreenShaking(false);
          }, 350);
        } else if (isShield) {
          setTimeout(() => {
            soundManager.playDestroy();
            hapticManager.triggerCombatVibration('destroy');
          }, 350);
        }

        setTimeout(() => {
          setCombatAnimation(null);
        }, 1150);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSpellAnimation = (data) => {
    setSpellAnimation(data);
    soundManager.playMagic();
    hapticManager.triggerCombatVibration('magic');

    const type = data.effectMeta?.type;
    if (type === 'raigeki' || type === 'dark_hole' || type === 'heavy_storm') {
      setIsScreenShaking(true);
      setTimeout(() => {
        soundManager.playDestroy();
        setIsScreenShaking(false);
      }, 500);
    } else if (type === 'dian_keto') {
      soundManager.playLifeUp();
    } else if (type === 'burn_damage') {
      setTimeout(() => {
        soundManager.playDamage();
      }, 400);
    }

    setTimeout(() => {
      setSpellAnimation(null);
    }, 2200);
  };

  const handleHandCardClick = (index) => {
    if (state.currentTurnPlayer !== 0) return;
    if (tributeSelection) setTributeSelection(null);
    soundManager.playCardMove();
    setSelectedHandIndex(index === selectedHandIndex ? null : index);
    setSelectedFieldMonsterZone(null);
  };

  const handlePlayerMonsterClick = (zoneIdx) => {
    if (state.currentTurnPlayer !== 0) return;

    // If currently in Tribute Selection Mode, clicking monster toggles selection
    if (tributeSelection) {
      handleTributeZoneClick(zoneIdx);
      return;
    }

    const slot = p0.monsterZones[zoneIdx];
    if (!slot) return;

    if (state.phase === 'BATTLE_STEP') {
      if (slot.hasAttacked) {
        hapticManager.triggerCombatVibration('click');
        alert('لقد نفذ هذا الوحش هجومه بالفعل في هذا الدور.');
        return;
      }
      if (slot.position !== 'face_up_attack') {
        hapticManager.triggerCombatVibration('click');
        alert('الوحش في وضع الدفاع لا يمكنه شن هجوم.');
        return;
      }
    }

    soundManager.playClick();
    setSelectedFieldMonsterZone(zoneIdx === selectedFieldMonsterZone ? null : zoneIdx);
    setSelectedHandIndex(null);
  };

  const handleTributeZoneClick = (zoneIdx) => {
    if (!tributeSelection) return;
    if (!p0.monsterZones[zoneIdx]) return;

    soundManager.playClick();
    const current = tributeSelection.selectedZones;
    const exists = current.includes(zoneIdx);
    let updated;

    if (exists) {
      updated = current.filter((z) => z !== zoneIdx);
    } else {
      if (current.length >= tributeSelection.requiredTributes) {
        updated = [...current.slice(1), zoneIdx];
      } else {
        updated = [...current, zoneIdx];
      }
    }

    setTributeSelection((prev) => ({
      ...prev,
      selectedZones: updated,
    }));
  };

  const handleConfirmTributeSummon = () => {
    if (!tributeSelection) return;
    if (tributeSelection.selectedZones.length < tributeSelection.requiredTributes) {
      alert(`يتطلب هذا الاستدعاء تحديد ${tributeSelection.requiredTributes} وحش من ساحتك.`);
      return;
    }

    try {
      const targetZone = tributeSelection.selectedZones[0];
      executeAndBroadcast(
        'normalSummon',
        tributeSelection.handIndex,
        targetZone,
        tributeSelection.position,
        tributeSelection.selectedZones
      );
      soundManager.playSummon();
      hapticManager.triggerCombatVibration('destroy');
      setTributeSelection(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancelTribute = () => {
    setTributeSelection(null);
    soundManager.playClick();
  };

  const handleSummon = (position = 'face_up_attack') => {
    if (selectedHandIndex === null) return;
    const card = p0.hand[selectedHandIndex];
    if (!card) return;

    let requiredTributes = 0;
    if (card.level >= 7) requiredTributes = 2;
    else if (card.level >= 5) requiredTributes = 1;

    const availableMonsters = p0.monsterZones
      .map((slot, idx) => ({ slot, idx }))
      .filter((item) => item.slot !== null);

    if (requiredTributes > 0) {
      if (availableMonsters.length < requiredTributes) {
        hapticManager.triggerCombatVibration('click');
        alert(
          `لا يمكن استدعاء ${card.name} (المستوى ${card.level}). يتطلب التضحية بـ ${requiredTributes} وحش، ولديك ${availableMonsters.length} وحش فقط في الساحة.`
        );
        return;
      }

      // Enter Tribute Selection Mode
      setTributeSelection({
        handIndex: selectedHandIndex,
        card,
        position,
        requiredTributes,
        selectedZones: [],
      });
      setSelectedHandIndex(null);
      soundManager.playClick();
      return;
    }

    const emptyZone = p0.monsterZones.findIndex((z) => z === null);
    if (emptyZone === -1) {
      alert('جميع مناطق الوحوش ممتلئة.');
      return;
    }

    try {
      executeAndBroadcast('normalSummon', selectedHandIndex, emptyZone, position, []);
      soundManager.playSummon();
      setSelectedHandIndex(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSetSpellTrap = () => {
    if (selectedHandIndex === null) return;
    const emptyST = p0.spellTrapZones.findIndex((z) => z === null);
    if (emptyST === -1) {
      alert('جميع مناطق السحر والفخاخ ممتلئة.');
      return;
    }
    try {
      executeAndBroadcast('setSpellTrap', selectedHandIndex, emptyST);
      soundManager.playCardMove();
      setSelectedHandIndex(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleActivateSpell = () => {
    if (selectedHandIndex === null) return;
    const card = p0.hand[selectedHandIndex];
    if (!card) return;

    const name = (card.name || '').toLowerCase();

    // 1. Monster Reborn: Revive monster from either graveyard
    if (name.includes('monster reborn')) {
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      const p1Monsters = p1.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'opponent' }));
      const allRevivable = [...p0Monsters, ...p1Monsters];

      if (allRevivable.length === 0) {
        alert('لا توجد وحوش في مقبرة أي من المبارزين لإحيائها.');
        return;
      }

      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('جميع خانات الوحوش في ساحتك ممتلئة.');
        return;
      }

      const currentHandIdx = selectedHandIndex;
      setCardSelectModal({
        isOpen: true,
        title: 'ولادة الوحش (Monster Reborn)',
        subtitle: 'اختر وحشاً من المقبرة لاستدعائه استدعاءً خاصاً إلى ساحتك',
        actionLabel: 'تأكيد الاستدعاء الخاص',
        options: allRevivable,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { selectedTargetCard: chosenCard });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 2. Premature Burial: Pay 800 LP, revive monster from own graveyard
    if (name.includes('premature burial')) {
      if (p0.lifePoints <= 800) {
        alert('نقاط حياتك غير كافية لدفع تكلفة الدفن المبكر (800 نقطة حياة).');
        return;
      }
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      if (p0Monsters.length === 0) {
        alert('لا توجد وحوش في مقبرتك لإحيائها.');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('جميع خانات الوحوش في ساحتك ممتلئة.');
        return;
      }

      const currentHandIdx = selectedHandIndex;
      setCardSelectModal({
        isOpen: true,
        title: 'الدفن المبكر (Premature Burial)',
        subtitle: 'ادفع 800 نقطة حياة واختر وحشاً من مقبرتك لاستدعائه',
        actionLabel: 'استدعاء ودفع 800 LP',
        options: p0Monsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { selectedTargetCard: chosenCard });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 3. The Shallow Grave: Revive monster in face-down defense
    if (name.includes('shallow grave')) {
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      if (p0Monsters.length === 0) {
        alert('لا توجد وحوش في مقبرتك لإحيائها.');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('جميع خانات الوحوش في ساحتك ممتلئة.');
        return;
      }

      const currentHandIdx = selectedHandIndex;
      setCardSelectModal({
        isOpen: true,
        title: 'القبر السطحي (The Shallow Grave)',
        subtitle: 'اختر وحشاً من مقبرتك لاستدعائه في وضع الدفاع المقلوب',
        actionLabel: 'استدعاء مقلوب',
        options: p0Monsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { selectedTargetCard: chosenCard });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 4. Monster Reincarnation / Recovery / Salvage: Return monster to hand
    if (name.includes('reincarnation') || name.includes('recovery') || name.includes('salvage')) {
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      if (p0Monsters.length === 0) {
        alert('لا توجد وحوش في مقبرتك لاستعادتها إلى يدك.');
        return;
      }

      const currentHandIdx = selectedHandIndex;
      setCardSelectModal({
        isOpen: true,
        title: 'استعادة الوحش من المقبرة',
        subtitle: 'اختر وحشاً من مقبرتك لاستعادته إلى يدك',
        actionLabel: 'استعادة إلى اليد',
        options: p0Monsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { selectedTargetCard: chosenCard });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 5. Magician of Faith / Spell Recovery: Return spell to hand
    if (name.includes('magician of faith') || name.includes('spell reproduction') || name.includes('feather of the phoenix')) {
      const p0Spells = p0.graveyard.filter((c) => c.type === 'spell').map((c) => ({ ...c, source: 'player' }));
      if (p0Spells.length === 0) {
        alert('لا توجد بطاقات سحر في مقبرتك لاستعادتها إلى يدك.');
        return;
      }

      const currentHandIdx = selectedHandIndex;
      setCardSelectModal({
        isOpen: true,
        title: 'استعادة بطاقة سحر من المقبرة',
        subtitle: 'اختر بطاقة سحر من مقبرتك لاستعادتها إلى يدك',
        actionLabel: 'استعادة إلى اليد',
        options: p0Spells,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { selectedTargetCard: chosenCard });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // Standard immediate execution
    try {
      executeAndBroadcast('activateSpell', selectedHandIndex);
      setSelectedHandIndex(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAttackTarget = (targetZone) => {
    if (selectedFieldMonsterZone === null) return;
    const oppSlot = p1.monsterZones[targetZone];

    if (!oppSlot) {
      // Zone is empty
      const hasOppMonsters = p1.monsterZones.some((m) => m !== null);
      if (!hasOppMonsters) {
        handleDirectAttack();
        return;
      } else {
        alert('يجب مهاجمة وحوش الخصم الموجودة في الساحة أولاً.');
        return;
      }
    }

    try {
      executeAndBroadcast('declareAttack', selectedFieldMonsterZone, targetZone);
      setSelectedFieldMonsterZone(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDirectAttack = () => {
    if (selectedFieldMonsterZone === null) return;
    const hasOppMonsters = p1.monsterZones.some((m) => m !== null);
    if (hasOppMonsters) {
      alert('لا يمكن الهجوم المباشر طالما توجد وحوش في ساحة الخصم.');
      return;
    }
    try {
      executeAndBroadcast('directAttack', selectedFieldMonsterZone);
      setSelectedFieldMonsterZone(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleChangePosition = () => {
    if (selectedFieldMonsterZone === null) return;
    try {
      executeAndBroadcast('changePosition', selectedFieldMonsterZone);
      soundManager.playCardMove();
      setSelectedFieldMonsterZone(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const selectedCard = selectedHandIndex !== null ? p0.hand[selectedHandIndex] : null;
  const selectedMonsterSlot = selectedFieldMonsterZone !== null ? p0.monsterZones[selectedFieldMonsterZone] : null;

  const isLight = theme === 'light';
  const defaultFieldBg = isLight ? '/assets/fie_light.png' : '/assets/fie_desert.png';
  const currentBgImage = state.activeFieldSpell?.bgImage || defaultFieldBg;

  return (
    <div
      className={isScreenShaking ? 'screen-shake' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        backgroundImage: isLight
          ? `radial-gradient(circle at center, rgba(255, 252, 240, 0.42) 0%, rgba(235, 220, 185, 0.8) 85%), url(${currentBgImage})`
          : `radial-gradient(circle at center, rgba(16, 13, 9, 0.65) 0%, rgba(8, 6, 4, 0.95) 80%), url(${currentBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Pharaonic Hieroglyphic Temple Overlay with Dynamic Field Aura */}
      <PharaohHieroglyphOverlay fieldKey={state.activeFieldSpell?.key} theme={theme} />
      {/* Top Header: Simple, Clean Executive Pharaonic Navbar for Mobile & Desktop */}
      <div
        className="stone-panel duel-top-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: '1px solid var(--pharaoh-stone-border)',
          background: isLight ? 'rgba(245, 238, 219, 0.94)' : 'rgba(15, 12, 8, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
          flexShrink: 0,
          gap: 8,
          boxShadow: isLight ? '0 2px 10px rgba(100, 75, 25, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.6)',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Left: Opponent Avatar, Name & Life Points */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-text-gold)', whiteSpace: 'nowrap' }}>
                {p1.name}
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  hapticManager.triggerCombatVibration('click');
                  setGraveyardViewer({ isOpen: true, playerIndex: 1 });
                }}
                className="btn-icon-pharaoh"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '1px 6px',
                  borderRadius: 3,
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.45)',
                  color: '#f87171',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="عرض بطاقات مقبرة الخصم"
              >
                <GraveyardIcon size={11} color="#f87171" />
                <span>المقبرة ({p1.graveyard.length})</span>
              </button>
            </div>
            <div
              ref={p1LpRef}
              onClick={() => {
                if (selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP') {
                  handleDirectAttack();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP' && p1.monsterZones.every(m => m === null) ? 'crosshair' : 'default',
              }}
              title={selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP' && p1.monsterZones.every(m => m === null) ? 'انقر لتوجيه ضربة مباشرة' : undefined}
            >
              <span style={{ fontSize: 14, fontWeight: 900, color: '#f87171', letterSpacing: 0.5 }}>
                LP {displayedP1LP}
              </span>
              <div
                style={{
                  width: 'clamp(50px, 14vw, 85px)',
                  height: 5,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, (displayedP1LP / 8000) * 100))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setSoundMuted(muted);
              hapticManager.triggerCombatVibration('click');
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
              color: soundMuted ? '#9ca3af' : 'var(--pharaoh-gold-bright)',
              cursor: 'pointer',
              padding: 0,
            }}
            title={soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {soundMuted ? <SoundOffIcon size={16} /> : <SoundOnIcon size={16} />}
          </button>

          {onToggleTheme && (
            <button
              onClick={() => {
                onToggleTheme();
                hapticManager.triggerCombatVibration('click');
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
                color: 'var(--pharaoh-gold-bright)',
                cursor: 'pointer',
                padding: 0,
              }}
              title="تبديل المظهر"
            >
              {theme === 'light' ? <ThemeMoonIcon size={16} /> : <ThemeSunIcon size={16} />}
            </button>
          )}

          <button
            onClick={() => {
              hapticManager.triggerCombatVibration('click');
              setIsSettingsOpen(true);
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
              color: 'var(--pharaoh-gold-bright)',
              cursor: 'pointer',
              padding: 0,
            }}
            title="الإعدادات"
          >
            <SettingsIcon size={16} />
          </button>

          <button
            onClick={() => {
              if (isMultiplayer) {
                connectionManager.send({ type: 'SURRENDER' });
              }
              onExit();
            }}
            className="btn-icon-pharaoh"
            style={{
              height: 32,
              padding: '0 8px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.45)',
              color: '#f87171',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="انسحاب من المبارزة"
          >
            <SurrenderIcon size={14} color="#f87171" />
            <span className="hide-on-xs">انسحاب</span>
          </button>
        </div>
      </div>

      {/* Opponent Face-Down Hand Cards Tray Hanging from Top */}
      <div
        className="opponent-hand-tray"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(245, 238, 219, 0.95) 0%, rgba(245, 238, 219, 0.4) 80%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(14, 11, 7, 0.94) 0%, rgba(14, 11, 7, 0.4) 80%, transparent 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p1.hand.map((_, idx) => (
            <div
              key={`opp-hand-${idx}`}
              className="opponent-hand-card"
              style={{
                width: 'clamp(28px, 7.5vw, 42px)',
                height: 'clamp(40px, 10.8vw, 60px)',
                borderRadius: 3,
                overflow: 'hidden',
                border: isLight ? '1px solid #b89f70' : '1px solid #785a28',
                boxShadow: isLight ? '0 4px 8px rgba(100, 75, 25, 0.35)' : '0 4px 10px rgba(0, 0, 0, 0.75)',
                transform: 'translateY(-2px)',
                marginLeft: idx > 0 ? 'clamp(-12px, -3vw, -6px)' : 0,
                background: isLight ? '#e2d2ae' : '#150f09',
                flexShrink: 0,
                position: 'relative',
              }}
              title={`بطاقة مقلوبة في يد الخصم (${idx + 1})`}
            >
              <img
                src="/assets/card_back.png"
                alt="Opponent Face-down Hand Card"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: 'var(--pharaoh-gold-bright)',
            background: isLight ? 'rgba(235, 224, 197, 0.92)' : 'rgba(20, 16, 11, 0.85)',
            padding: '2px 8px',
            borderRadius: 10,
            border: '1px solid var(--pharaoh-stone-border)',
            whiteSpace: 'nowrap',
            marginRight: 6,
          }}
        >
          يد الخصم ({p1.hand.length})
        </div>
      </div>

      {/* Duel Arena Field Container */}
      <div
        ref={arenaRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '6px 14px',
          position: 'relative',
        }}
      >
        {/* Active Combat Beam & Shield Animations Layer */}
        {combatAnimation && (
          <>
            {/* Elemental Attack Beam */}
            <div
              className={`attack-ray ${combatAnimation.element || 'pharaoh'}`}
              style={{
                left: combatAnimation.x1,
                top: combatAnimation.y1,
                width: combatAnimation.distance,
                transform: `rotate(${combatAnimation.angle}deg)`,
              }}
            />

            {/* Elemental Impact Burst at Target */}
            <div
              className={`impact-burst ${combatAnimation.element || 'pharaoh'}`}
              style={{
                left: combatAnimation.targetX,
                top: combatAnimation.targetY,
              }}
            />

            {/* Elemental Defense Shield on Block / Defense */}
            {combatAnimation.isShield && (
              <div
                className={`defense-shield ${combatAnimation.defenderElement || 'pharaoh'}`}
                style={{
                  left: combatAnimation.targetX - 42,
                  top: combatAnimation.targetY - 58,
                  width: 84,
                  height: 116,
                }}
              >
                <svg width="44" height="44" viewBox="0 0 100 100">
                  <polygon points="50,10 90,85 10,85" stroke="currentColor" strokeWidth="4" fill="rgba(255, 255, 255, 0.25)" />
                  <circle cx="50" cy="55" r="10" fill="currentColor" />
                </svg>
              </div>
            )}

            {combatAnimation.damage > 0 && (
              <div
                className="damage-floating-text damage"
                style={{
                  left: combatAnimation.targetX - 25,
                  top: combatAnimation.targetY - 40,
                }}
              >
                -{combatAnimation.damage}
              </div>
            )}
          </>
        )}

        {/* Opponent Spell/Trap Zones with Graveyard Slot */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {/* Opponent Graveyard Field Slot */}
          <div
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              setGraveyardViewer({ isOpen: true, playerIndex: 1 });
            }}
            className="pharaoh-slot pharaoh-slot-st"
            style={{
              cursor: 'pointer',
              borderColor: 'rgba(220, 38, 38, 0.55)',
              background: 'rgba(127, 29, 29, 0.18)',
              position: 'relative',
              overflow: 'hidden',
            }}
            title="مقبرة الخصم - انقر للاستعراض"
          >
            {p1.graveyard.length > 0 ? (
              <img
                src={`/assets/cards-art/${p1.graveyard[p1.graveyard.length - 1].rawFile ? p1.graveyard[p1.graveyard.length - 1].rawFile.replace('.bmp', '.png') : p1.graveyard[p1.graveyard.length - 1].image.replace('.webp', '.png')}`}
                alt="Graveyard Top"
                className="card-art-enhanced"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: p1.graveyard.length > 0 ? 'rgba(0,0,0,0.55)' : 'transparent',
                color: '#f87171',
                fontSize: 9,
                fontWeight: 900,
              }}
            >
              <GraveyardIcon size={11} color="#f87171" />
              <span>{p1.graveyard.length}</span>
            </div>
          </div>

          {p1.spellTrapZones.map((slot, idx) => (
            <div key={`p1-st-${idx}`} className={`pharaoh-slot pharaoh-slot-st ${slot ? 'occupied' : ''}`}>
              {slot ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e1810, #120e08)',
                    borderRadius: 3,
                    border: '1px solid var(--pharaoh-stone-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 800,
                    color: 'var(--pharaoh-text-muted)',
                  }}
                >
                  مقلوب
                </div>
              ) : (
                <span style={{ fontSize: 9, color: 'var(--pharaoh-text-muted)', opacity: 0.5 }}>S{idx + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Opponent Monster Zones (High-Clarity Artwork) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {p1.monsterZones.map((slot, idx) => {
            const isAttackerSelected = selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP';
            const isOpponentTarget = isAttackerSelected && slot !== null;
            const rawFilename = slot?.card ? (slot.card.rawFile ? slot.card.rawFile.replace('.bmp', '.png') : slot.card.image.replace('.webp', '.png')) : null;

            return (
              <div
                key={`p1-m-${idx}`}
                ref={(el) => (p1MonsterRefs.current[idx] = el)}
                className={`pharaoh-slot ${slot ? 'occupied' : ''} ${isOpponentTarget ? 'selected' : ''} ${
                  slot?.position === 'face_up_defense' ? 'defense' : ''
                }`}
                onClick={() => {
                  if (isAttackerSelected) {
                    handleAttackTarget(idx);
                  } else if (slot) {
                    setInspectCard(slot.card);
                  }
                }}
                style={{
                  cursor: isAttackerSelected ? 'crosshair' : slot ? 'pointer' : 'default',
                  borderColor: isOpponentTarget ? '#ef4444' : undefined,
                  boxShadow: isOpponentTarget
                    ? '0 0 16px rgba(239, 68, 68, 0.95), inset 0 0 8px rgba(239, 68, 68, 0.45)'
                    : undefined,
                  position: 'relative',
                }}
              >
                {isOpponentTarget && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#dc2626',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 900,
                      padding: '1px 5px',
                      borderRadius: 2,
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    هدف
                  </div>
                )}
                {slot ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0a0805',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {slot.position === 'face_down_defense' ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #2b1f13, #150f09)',
                          border: '1px solid #785a28',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#93c5fd' }}>دفاع مقلوب</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden', background: '#080604' }}>
                          <img
                            src={`/assets/cards-art/${rawFilename}`}
                            alt={slot.card.name}
                            className="card-art-enhanced"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => {
                              const fallback = `/assets/cards/${rawFilename}`;
                              if (e.target.src !== fallback) {
                                e.target.src = fallback;
                              }
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: '100%',
                            padding: '1px 2px',
                            background: slot.position === 'face_up_defense'
                              ? 'linear-gradient(180deg, #1e3a8a, #0f172a)'
                              : 'linear-gradient(180deg, rgba(28, 22, 14, 0.95), rgba(12, 9, 6, 0.98))',
                            borderTop: '1px solid var(--pharaoh-stone-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              color: slot.position === 'face_up_defense'
                                ? (slot.currentDef > slot.card.def ? '#4ade80' : slot.currentDef < slot.card.def ? '#f87171' : '#93c5fd')
                                : (slot.currentAtk > slot.card.atk ? '#4ade80' : slot.currentAtk < slot.card.atk ? '#f87171' : '#fef08a'),
                            }}
                          >
                            {slot.position === 'face_up_defense' ? `${slot.currentDef} دفاع` : `${slot.currentAtk}`}
                            {slot.position !== 'face_up_defense' && slot.currentAtk > slot.card.atk && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#4ade80' }}>+{slot.currentAtk - slot.card.atk}</span>
                            )}
                            {slot.position !== 'face_up_defense' && slot.currentAtk < slot.card.atk && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#f87171' }}>-{slot.card.atk - slot.currentAtk}</span>
                            )}
                            {slot.position === 'face_up_defense' && slot.currentDef > slot.card.def && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#4ade80' }}>+{slot.currentDef - slot.card.def}</span>
                            )}
                            {slot.position === 'face_up_defense' && slot.currentDef < slot.card.def && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#f87171' }}>-{slot.card.def - slot.currentDef}</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)', opacity: 0.5 }}>M{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Field Spell Pharaonic Cartouche Banner */}
        {state.activeFieldSpell && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-2px 0',
              zIndex: 35,
            }}
          >
            <div
              className={`active-field-cartouche ${state.activeFieldSpell.themeClass || ''}`}
              onClick={() => {
                if (state.activeFieldSpell.card) {
                  soundManager.playClick();
                  setInspectCard(state.activeFieldSpell.card);
                }
              }}
              title="انقر لمعاينة بطاقة سحر الملعب النشطة وتأثيراتها"
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid var(--pharaoh-gold-bright)',
                  flexShrink: 0,
                  background: '#000',
                  boxShadow: '0 0 6px rgba(240, 203, 100, 0.6)',
                }}
              >
                <img
                  src={
                    state.activeFieldSpell.card?.rawFile
                      ? `/assets/cards-art/${state.activeFieldSpell.card.rawFile.replace('.bmp', '.png')}`
                      : state.activeFieldSpell.bgImage || '/assets/fie_desert.png'
                  }
                  alt={state.activeFieldSpell.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = state.activeFieldSpell.bgImage || '/assets/fie_desert.png';
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    {state.activeFieldSpell.arabicName}
                  </span>
                  <span
                    style={{
                      fontSize: 8.5,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: 'rgba(240, 203, 100, 0.22)',
                      color: '#fef08a',
                      fontWeight: 800,
                      border: '1px solid rgba(240, 203, 100, 0.35)',
                    }}
                  >
                    أرض المعركة نشطة
                  </span>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--pharaoh-text-gold)', opacity: 0.95 }}>
                  {state.activeFieldSpell.arabicSummary}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Center Stone Panel: Turn, Phase & Control */}
        <div
          className="stone-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            borderRadius: 4,
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: 'var(--pharaoh-gold-bright)',
                background: 'rgba(201, 158, 50, 0.15)',
                padding: '3px 10px',
                borderRadius: 3,
                border: '1px solid var(--pharaoh-gold-dark)',
                whiteSpace: 'nowrap',
              }}
            >
              الدور {state.turnNumber} • {getPhaseArabicName(state.phase, true)}
            </span>

            {isMultiplayer && (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 900,
                  color: state.currentTurnPlayer === 0 ? '#22c55e' : 'var(--pharaoh-gold-bright)',
                  background: state.currentTurnPlayer === 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(201, 158, 50, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 3,
                  border: `1px solid ${state.currentTurnPlayer === 0 ? '#22c55e' : 'var(--pharaoh-gold-dark)'}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {state.currentTurnPlayer === 0 ? 'دورك الآن!' : `دور المنافس (${p1.name})... بانتظار حركته`}
              </span>
            )}

            {isAiThinking && (
              <span style={{ fontSize: 11, color: 'var(--pharaoh-gold-bright)', fontWeight: 700 }}>
                تفكير الخصم جارٍ...
              </span>
            )}

            {/* Turn 1 Attack Restriction Notice */}
            {state.turnNumber === 1 && state.phase === 'MAIN1' && (
              <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>
                الدور الأول: الهجوم غير متاح
              </span>
            )}
          </div>

          {state.currentTurnPlayer === 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {state.phase === 'MAIN1' && (
                <>
                  {state.turnNumber > 1 && (
                    <button
                      onClick={() => {
                        soundManager.playBattleTurn();
                        executeAndBroadcast('advancePhase', 'BATTLE_STEP');
                      }}
                      className="btn-pharaoh-gold"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      مرحلة المعركة
                    </button>
                  )}
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      executeAndBroadcast('endTurn');
                    }}
                    className="btn-pharaoh-stone"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    إنهاء الدور
                  </button>
                </>
              )}

              {state.phase === 'BATTLE_STEP' && (
                <>
                  {p1.monsterZones.every((m) => m === null) && selectedFieldMonsterZone !== null && (
                    <button
                      onClick={handleDirectAttack}
                      className="btn-pharaoh-gold"
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        background: 'linear-gradient(180deg, #dc2626, #991b1b)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(220, 38, 38, 0.7)',
                      }}
                    >
                      هجوم مباشر على الخصم
                    </button>
                  )}
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      setSelectedFieldMonsterZone(null);
                      executeAndBroadcast('advancePhase', 'MAIN2');
                    }}
                    className="btn-pharaoh-stone"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    المرحلة 2
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      setSelectedFieldMonsterZone(null);
                      executeAndBroadcast('endTurn');
                    }}
                    className="btn-pharaoh-stone"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    إنهاء الدور
                  </button>
                </>
              )}

              {state.phase === 'MAIN2' && (
                <button
                  onClick={() => {
                    soundManager.playTurnChange();
                    setSelectedFieldMonsterZone(null);
                    executeAndBroadcast('endTurn');
                  }}
                  className="btn-pharaoh-stone"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                >
                  إنهاء الدور
                </button>
              )}
            </div>
          )}
        </div>

        {/* Player Monster Zones (High-Clarity Artwork) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {p0.monsterZones.map((slot, idx) => {
            const isSelected = selectedFieldMonsterZone === idx;
            const canAttack =
              state.phase === 'BATTLE_STEP' &&
              slot &&
              slot.position === 'face_up_attack' &&
              !slot.hasAttacked;
            const hasAttackedThisTurn = state.phase === 'BATTLE_STEP' && slot && slot.hasAttacked;
            const isTributeEligible = tributeSelection && slot !== null;
            const isTributeSelected = tributeSelection && tributeSelection.selectedZones.includes(idx);
            const rawFilename = slot?.card ? (slot.card.rawFile ? slot.card.rawFile.replace('.bmp', '.png') : slot.card.image.replace('.webp', '.png')) : null;

            return (
              <div
                key={`p0-m-${idx}`}
                ref={(el) => (p0MonsterRefs.current[idx] = el)}
                className={`pharaoh-slot ${slot ? 'occupied' : ''} ${isSelected ? 'selected' : ''} ${
                  slot?.position === 'face_up_defense' ? 'defense' : ''
                } ${isTributeSelected ? 'tribute-selected' : isTributeEligible ? 'tribute-eligible' : ''} ${
                  canAttack && !isSelected ? 'attack-ready' : ''
                }`}
                onClick={() => handlePlayerMonsterClick(idx)}
                style={{
                  cursor: isTributeEligible ? 'pointer' : slot ? 'pointer' : 'default',
                  border: isTributeSelected
                    ? '2px solid #ef4444'
                    : isTributeEligible
                    ? '2px solid #f59e0b'
                    : isSelected
                    ? '2px solid var(--pharaoh-gold-bright)'
                    : canAttack
                    ? '1.5px solid #f59e0b'
                    : undefined,
                  boxShadow: isTributeSelected
                    ? '0 0 20px rgba(239, 68, 68, 0.95)'
                    : isTributeEligible
                    ? '0 0 16px rgba(245, 158, 11, 0.8)'
                    : isSelected
                    ? '0 0 16px rgba(240, 203, 100, 0.9)'
                    : canAttack
                    ? '0 0 12px rgba(245, 158, 11, 0.65)'
                    : undefined,
                  opacity: hasAttackedThisTurn ? 0.72 : 1,
                  position: 'relative',
                }}
              >
                {isTributeSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: 2,
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 8px #ef4444',
                    }}
                  >
                    تضحية
                  </div>
                )}
                {isTributeEligible && !isTributeSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(217, 119, 6, 0.95)',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: 2,
                      zIndex: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    اختر للتضحية
                  </div>
                )}
                {canAttack && !isSelected && !tributeSelection && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(216, 172, 59, 0.95)',
                      color: '#120e06',
                      fontSize: 8,
                      fontWeight: 900,
                      padding: '1px 4px',
                      borderRadius: 2,
                      zIndex: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    جاهز
                  </div>
                )}
                {hasAttackedThisTurn && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(50, 40, 30, 0.85)',
                      color: '#9ca3af',
                      fontSize: 8,
                      fontWeight: 700,
                      padding: '1px 4px',
                      borderRadius: 2,
                      zIndex: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    تم الهجوم
                  </div>
                )}
                {slot ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0a0805',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {slot.position === 'face_down_defense' ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #2b1f13, #150f09)',
                          border: '1px solid #785a28',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#93c5fd' }}>دفاع مقلوب</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden', background: '#080604' }}>
                          <img
                            src={`/assets/cards-art/${rawFilename}`}
                            alt={slot.card.name}
                            className="card-art-enhanced"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => {
                              const fallback = `/assets/cards/${rawFilename}`;
                              if (e.target.src !== fallback) {
                                e.target.src = fallback;
                              }
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: '100%',
                            padding: '1px 2px',
                            background: slot.position === 'face_up_defense'
                              ? 'linear-gradient(180deg, #1e3a8a, #0f172a)'
                              : 'linear-gradient(180deg, rgba(28, 22, 14, 0.95), rgba(12, 9, 6, 0.98))',
                            borderTop: '1px solid var(--pharaoh-stone-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              color: slot.position === 'face_up_defense'
                                ? (slot.currentDef > slot.card.def ? '#4ade80' : slot.currentDef < slot.card.def ? '#f87171' : '#93c5fd')
                                : ((slot.currentAtk || slot.card.atk) > slot.card.atk ? '#4ade80' : (slot.currentAtk || slot.card.atk) < slot.card.atk ? '#f87171' : 'var(--pharaoh-gold-bright)'),
                              letterSpacing: 0.5,
                            }}
                          >
                            {slot.position === 'face_up_defense'
                              ? `${slot.currentDef} دفاع`
                              : `${slot.currentAtk || slot.card.atk}`}
                            {slot.position !== 'face_up_defense' && (slot.currentAtk || slot.card.atk) > slot.card.atk && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#4ade80' }}>+{(slot.currentAtk || slot.card.atk) - slot.card.atk}</span>
                            )}
                            {slot.position !== 'face_up_defense' && (slot.currentAtk || slot.card.atk) < slot.card.atk && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#f87171' }}>-{slot.card.atk - (slot.currentAtk || slot.card.atk)}</span>
                            )}
                            {slot.position === 'face_up_defense' && slot.currentDef > slot.card.def && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#4ade80' }}>+{slot.currentDef - slot.card.def}</span>
                            )}
                            {slot.position === 'face_up_defense' && slot.currentDef < slot.card.def && (
                              <span style={{ fontSize: 8, marginLeft: 2, color: '#f87171' }}>-{slot.card.def - slot.currentDef}</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)', opacity: 0.5 }}>M{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Player Spell/Trap Zones with Graveyard Slot */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {/* Player Graveyard Field Slot */}
          <div
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              setGraveyardViewer({ isOpen: true, playerIndex: 0 });
            }}
            className="pharaoh-slot pharaoh-slot-st"
            style={{
              cursor: 'pointer',
              borderColor: 'rgba(240, 203, 100, 0.7)',
              background: 'rgba(201, 158, 50, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
            title="مقبرتك - انقر للاستعراض"
          >
            {p0.graveyard.length > 0 ? (
              <img
                src={`/assets/cards-art/${p0.graveyard[p0.graveyard.length - 1].rawFile ? p0.graveyard[p0.graveyard.length - 1].rawFile.replace('.bmp', '.png') : p0.graveyard[p0.graveyard.length - 1].image.replace('.webp', '.png')}`}
                alt="Graveyard Top"
                className="card-art-enhanced"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: p0.graveyard.length > 0 ? 'rgba(0,0,0,0.55)' : 'transparent',
                color: 'var(--pharaoh-gold-bright)',
                fontSize: 9,
                fontWeight: 900,
              }}
            >
              <GraveyardIcon size={11} color="var(--pharaoh-gold-bright)" />
              <span>{p0.graveyard.length}</span>
            </div>
          </div>

          {p0.spellTrapZones.map((slot, idx) => (
            <div key={`p0-st-${idx}`} className={`pharaoh-slot pharaoh-slot-st ${slot ? 'occupied' : ''}`}>
              {slot ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e1810, #120e08)',
                    borderRadius: 3,
                    border: '1px solid var(--pharaoh-stone-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--pharaoh-text-gold)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInspectCard(slot.card)}
                >
                  مقلوب
                </div>
              ) : (
                <span style={{ fontSize: 9, color: 'var(--pharaoh-text-muted)', opacity: 0.5 }}>S{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Card Action Toolbar */}
      {selectedCard && (
        <div
          className="stone-panel"
          style={{
            position: 'absolute',
            bottom: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 100,
            border: '2px solid var(--pharaoh-gold-bright)',
            maxWidth: '92vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--pharaoh-text-gold)' }}>{selectedCard.name}</div>
          {selectedCard.type === 'monster' && (() => {
            const reqTributes = selectedCard.level >= 7 ? 2 : selectedCard.level >= 5 ? 1 : 0;
            const myMonstersCount = p0.monsterZones.filter((z) => z !== null).length;
            const canAfford = reqTributes === 0 || myMonstersCount >= reqTributes;

            return (
              <>
                <button
                  onClick={() => handleSummon('face_up_attack')}
                  className={canAfford ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    opacity: canAfford ? 1 : 0.6,
                  }}
                  title={!canAfford ? `يتطلب التضحية بـ ${reqTributes} وحش (لديك ${myMonstersCount})` : undefined}
                >
                  {reqTributes > 0 ? `استدعاء تضحية (${reqTributes})` : 'استدعاء هجوم'}
                </button>
                <button
                  onClick={() => handleSummon('face_down_defense')}
                  className="btn-pharaoh-stone"
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    opacity: canAfford ? 1 : 0.6,
                  }}
                  title={!canAfford ? `يتطلب التضحية بـ ${reqTributes} وحش (لديك ${myMonstersCount})` : undefined}
                >
                  {reqTributes > 0 ? 'تضحية ودفاع مقلوب' : 'وضع دفاعي مقلوب'}
                </button>
              </>
            );
          })()}
          {selectedCard.type === 'spell' && (
            <>
              <button onClick={handleActivateSpell} className="btn-pharaoh-gold" style={{ padding: '8px 14px', fontSize: 12 }}>
                {selectedCard.subType === 'field' || ['yami', 'umi', 'sogen', 'forest', 'mountain', 'wasteland', 'gaia', 'molten', 'luminous', 'sanctuary'].some((k) => (selectedCard.name || '').toLowerCase().includes(k))
                  ? 'تفعيل وتغيير أرض المعركة'
                  : 'تفعيل السحر'}
              </button>
              <button onClick={handleSetSpellTrap} className="btn-pharaoh-stone" style={{ padding: '8px 14px', fontSize: 12 }}>
                وضع مقلوب
              </button>
            </>
          )}
          {selectedCard.type === 'trap' && (
            <button onClick={handleSetSpellTrap} className="btn-pharaoh-gold" style={{ padding: '8px 14px', fontSize: 12 }}>
              وضع الفخ مقلوب
            </button>
          )}
          <button onClick={() => setInspectCard(selectedCard)} className="btn-pharaoh-stone" style={{ padding: '8px 12px', fontSize: 12 }}>
            فحص
          </button>
        </div>
      )}

      {/* Tribute Selection Mode Interactive Control Banner */}
      {tributeSelection && (
        <div
          className="stone-panel"
          style={{
            position: 'absolute',
            bottom: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 150,
            border: '2px solid #f59e0b',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.7)',
            background: 'rgba(15, 11, 7, 0.95)',
            maxWidth: '94vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b' }}>
              طقس التضحية: استدعاء {tributeSelection.card.name} (المستوى {tributeSelection.card.level})
            </div>
            <div style={{ fontSize: 11, color: 'var(--pharaoh-text-light)', marginTop: 2 }}>
              انقر على وحوش ساحتك لاختيار {tributeSelection.requiredTributes} وحش (تم اختيار {tributeSelection.selectedZones.length} من {tributeSelection.requiredTributes})
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {tributeSelection.selectedZones.length === tributeSelection.requiredTributes && (
              <button
                onClick={handleConfirmTributeSummon}
                className="btn-pharaoh-gold"
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  background: 'linear-gradient(180deg, #f59e0b, #b45309)',
                  color: '#fff',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.8)',
                }}
              >
                تأكيد التضحية والاستدعاء
              </button>
            )}

            <button
              onClick={handleCancelTribute}
              className="btn-pharaoh-stone"
              style={{ padding: '8px 12px', fontSize: 12, color: '#ef4444' }}
            >
              إلغاء التضحية
            </button>
          </div>
        </div>
      )}

      {/* Selected Monster on Field Action Toolbar */}
      {selectedMonsterSlot && (
        <div
          className="stone-panel"
          style={{
            position: 'absolute',
            bottom: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 100,
            border: '2px solid var(--pharaoh-gold-royal)',
            maxWidth: '92vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
            {selectedMonsterSlot.card.name}
          </div>

          {state.phase === 'BATTLE_STEP' && (
            <>
              {!selectedMonsterSlot.hasAttacked && selectedMonsterSlot.position === 'face_up_attack' ? (
                p1.monsterZones.every((m) => m === null) ? (
                  <button
                    onClick={handleDirectAttack}
                    className="btn-pharaoh-gold"
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      background: 'linear-gradient(180deg, #dc2626, #991b1b)',
                      color: '#fff',
                    }}
                  >
                    تنفيذ هجوم مباشر
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: '#f87171', fontWeight: 800 }}>
                    انقر على وحش الخصم لمهاجمته
                  </span>
                )
              ) : selectedMonsterSlot.hasAttacked ? (
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  نفذ هذا الوحش هجومه في هذا الدور
                </span>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  الوحش في وضع الدفاع (لا يمكنه الهجوم)
                </span>
              )}
            </>
          )}

          {(state.phase === 'MAIN1' || state.phase === 'MAIN2') && selectedMonsterSlot.canChangePosition && (
            <button onClick={handleChangePosition} className="btn-pharaoh-stone" style={{ padding: '6px 12px', fontSize: 11 }}>
              تغيير وضع المعركة
            </button>
          )}

          <button onClick={() => setInspectCard(selectedMonsterSlot.card)} className="btn-pharaoh-stone" style={{ padding: '6px 10px', fontSize: 11 }}>
            فحص الكرت
          </button>

          <button
            onClick={() => setSelectedFieldMonsterZone(null)}
            className="btn-pharaoh-stone"
            style={{ padding: '6px 10px', fontSize: 11, color: '#ef4444' }}
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      {/* Bottom Tray: Player Status & Hand Shelf (Larger Cards: 76px x 108px) */}
      <div
        className="stone-panel"
        style={{
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          padding: '6px 16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                {p0.name} (أنت)
              </div>
              <span style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)' }}>
                ({p0.deck.length})
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  hapticManager.triggerCombatVibration('click');
                  setGraveyardViewer({ isOpen: true, playerIndex: 0 });
                }}
                className="btn-icon-pharaoh"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '2px 8px',
                  borderRadius: 3,
                  background: 'rgba(240, 203, 100, 0.12)',
                  border: '1px solid var(--pharaoh-gold-royal)',
                  color: 'var(--pharaoh-gold-bright)',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                title="عرض بطاقات مقبرتك"
              >
                <GraveyardIcon size={12} color="var(--pharaoh-gold-bright)" />
                <span>المقبرة ({p0.graveyard.length})</span>
              </button>
            </div>
          </div>

          <div ref={p0LpRef} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 150,
                height: 6,
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid var(--pharaoh-stone-border)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, (displayedP0LP / 8000) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #d8ac3b, #f6d87d)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
              LP {displayedP0LP}
            </div>
          </div>
        </div>

        {/* Hand Cards Horizontal Scroll (Large & High Definition for Mobile: clamp(72px, 18.5vw, 92px)) */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            paddingTop: 6,
            minHeight: 'clamp(108px, 27vw, 136px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {p0.hand.map((card, idx) => {
            const isSelected = selectedHandIndex === idx;
            return (
              <div
                key={`hand-${idx}`}
                onClick={() => handleHandCardClick(idx)}
                style={{
                  width: 'clamp(72px, 18.5vw, 92px)',
                  height: 'clamp(104px, 26.8vw, 132px)',
                  flexShrink: 0,
                  borderRadius: 4,
                  border: isSelected ? '2px solid var(--pharaoh-gold-bright)' : '1px solid var(--pharaoh-stone-border)',
                  boxShadow: isSelected ? '0 0 18px rgba(240, 203, 100, 0.95), 0 8px 16px rgba(0,0,0,0.6)' : '0 3px 8px rgba(0,0,0,0.4)',
                  transform: isSelected ? 'translateY(-10px) scale(1.05)' : 'none',
                  transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--pharaoh-stone-card)',
                  zIndex: isSelected ? 15 : 1,
                }}
              >
                <img
                  src={`/assets/cards/${card.rawFile ? card.rawFile.replace('.bmp', '.png') : card.image.replace('.webp', '.png')}`}
                  alt={card.name}
                  loading="lazy"
                  decoding="async"
                  className="card-art-enhanced"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    const fallback = `/assets/cards-mini/${card.rawFile ? card.rawFile.replace('.bmp', '.png') : card.image.replace('.webp', '.png')}`;
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Inspector Modal with Clear Arabic Description */}
      <CardDetailModal card={inspectCard} onClose={() => setInspectCard(null)} />

      {/* Graveyard Viewer Modal */}
      {graveyardViewer && (
        <GraveyardModal
          isOpen={graveyardViewer.isOpen}
          onClose={() => setGraveyardViewer(null)}
          cards={state.players[graveyardViewer.playerIndex].graveyard}
          ownerName={graveyardViewer.playerIndex === 0 ? `${p0.name} (أنت)` : p1.name}
          isOpponent={graveyardViewer.playerIndex === 1}
          onInspectCard={(card) => setInspectCard(card)}
        />
      )}

      {/* Interactive Card Selection Modal (Graveyard recovery / Monster Reborn) */}
      {cardSelectModal && (
        <CardSelectModal
          isOpen={cardSelectModal.isOpen}
          onClose={() => setCardSelectModal(null)}
          title={cardSelectModal.title}
          subtitle={cardSelectModal.subtitle}
          actionLabel={cardSelectModal.actionLabel}
          options={cardSelectModal.options}
          onConfirm={cardSelectModal.onConfirm}
          onInspectCard={(card) => setInspectCard(card)}
        />
      )}


      {/* Game Over Modal */}
      {state.winner !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            className="stone-panel"
            style={{
              padding: 28,
              textAlign: 'center',
              maxWidth: 340,
              width: '90%',
              border: `2px solid ${state.winner === 0 ? 'var(--pharaoh-gold-bright)' : '#ef4444'}`,
            }}
          >
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: state.winner === 0 ? 'var(--pharaoh-gold-bright)' : '#ef4444',
                marginBottom: 8,
              }}
            >
              {state.winner === 0 ? 'نصر أسطوري' : 'هزيمة في ساحة المعركة'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--pharaoh-text-light)', marginBottom: 22, lineHeight: 1.5 }}>
              {state.winReason === 'EXODIA'
                ? 'تم استدعاء إكسوديا المنبوذ واكتملت جميع أطرافه الخمسة!'
                : state.winReason === 'DECK_OUT'
                ? 'نفاد جميع بطاقات الدك وعدم إمكانية السحب!'
                : 'تصفير نقاط حياة الخصم إلى الصفر.'}
            </p>
            <button onClick={onExit} className="btn-pharaoh-gold" style={{ width: '100%', padding: '12px 0', fontSize: 14 }}>
              العودة إلى القائمة الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Spell Activation Visual Effects Overlay */}
      {spellAnimation && (
        <div className="spell-activation-overlay">
          {/* Rotating Magic Circle */}
          <div className="spell-magic-circle" />

          {/* Floating Spell Card */}
          <div className="spell-card-floating">
            <img
              src={`/assets/cards/${
                spellAnimation.spellCard.rawFile
                  ? spellAnimation.spellCard.rawFile.replace('.bmp', '.png')
                  : spellAnimation.spellCard.image.replace('.webp', '.png')
              }`}
              alt={spellAnimation.spellCard.name}
              className="card-art-enhanced"
              style={{
                width: 130,
                height: 188,
                aspectRatio: '200 / 290',
                objectFit: 'contain',
                display: 'block',
                borderRadius: 5,
              }}
              onError={(e) => {
                const fallbackMini = `/assets/cards-mini/${
                  spellAnimation.spellCard.rawFile
                    ? spellAnimation.spellCard.rawFile.replace('.bmp', '.png')
                    : spellAnimation.spellCard.image.replace('.webp', '.png')
                }`;
                if (e.target.src !== fallbackMini) {
                  e.target.src = fallbackMini;
                }
              }}
            />
          </div>

          {/* Spell Announcement Cartouche Banner */}
          <div
            className="stone-panel"
            style={{
              marginTop: 18,
              padding: '10px 22px',
              textAlign: 'center',
              border: '2px solid var(--pharaoh-gold-bright)',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.7)',
              background: 'rgba(12, 10, 7, 0.95)',
              zIndex: 20,
              maxWidth: '90vw',
            }}
          >
            <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 900, letterSpacing: 1 }}>
              بطاقة سحر تفعّلت بواسطة {state.players[spellAnimation.playerIndex].name}
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginTop: 2 }}>
              {spellAnimation.effectMeta?.title || spellAnimation.spellCard.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--pharaoh-text-light)', marginTop: 4, fontWeight: 700 }}>
              {spellAnimation.effectMeta?.desc || 'تم تطبيق التأثير السحري على الساحة!'}
            </div>
          </div>

          {/* Elemental Specific Visual Overlays */}
          {spellAnimation.effectMeta?.type === 'raigeki' && <div className="spell-fx-lightning" />}
          {spellAnimation.effectMeta?.type === 'dark_hole' && <div className="spell-fx-vortex" />}
          {spellAnimation.effectMeta?.type === 'dian_keto' && <div className="spell-fx-heal" />}
          {spellAnimation.effectMeta?.type === 'burn_damage' && <div className="spell-fx-burn" />}
          {spellAnimation.effectMeta?.type === 'swords' && <div className="spell-fx-swords" />}
          {spellAnimation.effectMeta?.type === 'heavy_storm' && <div className="spell-fx-vortex" />}
          {spellAnimation.effectMeta?.type === 'field_spell' && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle, rgba(240, 203, 100, 0.4) 0%, rgba(0, 0, 0, 0.6) 80%)',
                pointerEvents: 'none',
                zIndex: 2600,
                animation: 'healSparkleAnim 1.4s ease-out forwards',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
