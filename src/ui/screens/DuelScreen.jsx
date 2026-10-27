import React, { useState, useEffect, useRef } from 'react';
import { DuelEngine } from '../../game/engine/DuelEngine.js';
import { AIPlayer, AI_DIFFICULTIES } from '../../game/ai/AIPlayer.js';
import { getPhaseArabicName } from '../../game/engine/PhaseManager.js';
import { CardDetailModal } from '../components/CardDetailModal.jsx';
import { DuelOutcomeModal } from '../components/DuelOutcomeModal.jsx';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { SettingsModal } from '../components/SettingsModal.jsx';
import { GraveyardModal } from '../components/GraveyardModal.jsx';
import { CardSelectModal } from '../components/CardSelectModal.jsx';
import { ShuffleAnimation } from '../components/ShuffleAnimation.jsx';
import { connectionManager } from '../../multiplayer/ConnectionManager.js';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';
import {
  resolveAttackArchetype,
  resolveDefenseArchetype,
  resolveDestructionByKiller,
} from '../../game/utils/combatVisuals.js';
import {
  ARENA_THEMES,
  SELECTABLE_ARENAS,
  getArenaTheme,
  getRandomArenaTheme,
  getNextClimaxArena,
  resolveArenaBgImage,
  getArenaPalette,
} from '../../game/utils/arenaThemes.js';
import ArenaTransitionOverlay from '../components/ArenaTransitionOverlay.jsx';
import { TeammateHandDrawer } from '../components/TeammateHandDrawer.jsx';

const TeammateEyeIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" fill={color} />
  </svg>
);

const ArenaPillarIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8a3 3 0 0 1 6 0v8" />
  </svg>
);

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

const AttackSwordIcon = ({ size = 16, isSelected = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={isSelected ? 'sword-active-pulse' : 'sword-ready-float'}
    style={{
      filter: isSelected
        ? 'drop-shadow(0 0 6px #ef4444) drop-shadow(0 0 2px #facc15)'
        : 'drop-shadow(0 0 4px #eab308)',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
  >
    <path
      d="M14.5 17.5L3 6V3h3l11.5 11.5"
      stroke={isSelected ? '#f87171' : '#facc15'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m13 19 6-6"
      stroke={isSelected ? '#fee2e2' : '#fef08a'}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="m16 16 4 4"
      stroke={isSelected ? '#ef4444' : '#ca8a04'}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="m19 21 2-2"
      stroke={isSelected ? '#fca5a5' : '#eab308'}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="19.5" cy="4.5" r="1.5" fill={isSelected ? '#ef4444' : '#facc15'} />
  </svg>
);

const ShieldDefenseIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeInspectIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MagicWandIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const CardFaceDownIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const HourglassEndTurnIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 22h14M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

const PharaohHieroglyphOverlay = ({ fieldKey, theme, palette }) => {
  const isLight = theme === 'light';
  let strokeColor = palette?.primary || (isLight ? '#92400e' : '#f0cb64');
  let auraGlow = palette?.arenaMatGlow || (isLight ? 'rgba(217, 119, 6, 0.22)' : 'rgba(240, 203, 100, 0.22)');
  let emblemGlow = palette?.slotGlow || (isLight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(240, 203, 100, 0.35)');

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
  } else if (fieldKey === 'cyber_kaiba') {
    strokeColor = isLight ? '#0891b2' : '#06b6d4';
    auraGlow = 'rgba(6, 182, 212, 0.35)';
    emblemGlow = 'rgba(6, 182, 212, 0.55)';
  } else if (fieldKey === 'cyber_virtual') {
    strokeColor = isLight ? '#059669' : '#10b981';
    auraGlow = 'rgba(16, 185, 129, 0.35)';
    emblemGlow = 'rgba(16, 185, 129, 0.55)';
  } else if (fieldKey === 'orichalcos_atlantis') {
    strokeColor = isLight ? '#0d9488' : '#14b8a6';
    auraGlow = 'rgba(20, 184, 166, 0.35)';
    emblemGlow = 'rgba(20, 184, 166, 0.55)';
  } else if (fieldKey === 'machine_foundry') {
    strokeColor = isLight ? '#ea580c' : '#f97316';
    auraGlow = 'rgba(249, 115, 22, 0.35)';
    emblemGlow = 'rgba(249, 115, 22, 0.55)';
  } else if (fieldKey === 'dragon_roost') {
    strokeColor = isLight ? '#dc2626' : '#ef4444';
    auraGlow = 'rgba(239, 68, 68, 0.38)';
    emblemGlow = 'rgba(239, 68, 68, 0.55)';
  } else if (fieldKey === 'millennium_temple') {
    strokeColor = isLight ? '#92400e' : '#f0cb64';
    auraGlow = 'rgba(240, 203, 100, 0.3)';
    emblemGlow = 'rgba(240, 203, 100, 0.5)';
  } else if (fieldKey === 'winged_ra') {
    strokeColor = isLight ? '#a16207' : '#facc15';
    auraGlow = 'rgba(250, 204, 21, 0.3)';
    emblemGlow = 'rgba(250, 204, 21, 0.5)';
  } else if (fieldKey === 'anubis_scales') {
    strokeColor = isLight ? '#0891b2' : '#06b6d4';
    auraGlow = 'rgba(6, 182, 212, 0.3)';
    emblemGlow = 'rgba(6, 182, 212, 0.5)';
  } else if (fieldKey === 'black_hole') {
    strokeColor = isLight ? '#0284c7' : '#38bdf8';
    auraGlow = 'rgba(14, 165, 233, 0.35)';
    emblemGlow = 'rgba(56, 189, 248, 0.55)';
  } else if (fieldKey === 'crimson_thunder') {
    strokeColor = isLight ? '#b91c1c' : '#ef4444';
    auraGlow = 'rgba(239, 68, 68, 0.35)';
    emblemGlow = 'rgba(239, 68, 68, 0.55)';
  } else if (fieldKey === 'silver_sanctuary') {
    strokeColor = isLight ? '#64748b' : '#e2e8f0';
    auraGlow = 'rgba(226, 232, 240, 0.35)';
    emblemGlow = 'rgba(226, 232, 240, 0.55)';
  } else if (fieldKey === 'emerald_oasis') {
    strokeColor = isLight ? '#059669' : '#10b981';
    auraGlow = 'rgba(16, 185, 129, 0.35)';
    emblemGlow = 'rgba(16, 185, 129, 0.55)';
  }

  const isNonPharaoh = ['cyber_kaiba', 'cyber_virtual', 'orichalcos_atlantis', 'machine_foundry', 'dragon_roost'].includes(fieldKey);

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
          boxShadow: `inset 0 0 45px ${auraGlow}`,
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
          opacity: isLight ? 0.32 : 0.28,
          color: strokeColor,
          filter: isLight
            ? `drop-shadow(0 1px 1px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 6px ${emblemGlow})`
            : `drop-shadow(0 0 7px ${emblemGlow})`,
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

        {!isNonPharaoh ? (
          <>
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

            {/* Central Winged Sun of Ra & Horus Eye (Subtle Watermark) */}
            <g transform="translate(600, 445)" opacity="0.22">
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
          </>
        ) : (
          <g opacity="0.5" stroke="currentColor" strokeWidth="2.5" fill="none">
            {/* Top-Left Futuristic Corner Bracket */}
            <path d="M 30,70 L 30,30 L 70,30" />
            <circle cx="70" cy="30" r="3.5" fill="currentColor" />
            {/* Top-Right Futuristic Corner Bracket */}
            <path d="M 1170,70 L 1170,30 L 1130,30" />
            <circle cx="1130" cy="30" r="3.5" fill="currentColor" />
            {/* Bottom-Left Futuristic Corner Bracket */}
            <path d="M 30,830 L 30,870 L 70,870" />
            <circle cx="70" cy="870" r="3.5" fill="currentColor" />
            {/* Bottom-Right Futuristic Corner Bracket */}
            <path d="M 1170,830 L 1170,870 L 1130,870" />
            <circle cx="1130" cy="870" r="3.5" fill="currentColor" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const DuelScreen = ({
  engine,
  onExit,
  onRestartDuel,
  isAiDuel = true,
  aiDifficulty = 'hard',
  onSelectAiDifficulty,
  isMultiplayer = false,
  multiplayerData = null,
  theme,
  onToggleTheme,
}) => {
  const [state, setState] = useState(engine.getState());
  const p0 = state.players[0];
  const p1 = state.players[1];
  const [soundMuted, setSoundMuted] = useState(() => soundManager.isMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Multiplayer background synchronization mode ('synced' vs 'independent')
  const [arenaSyncMode, setArenaSyncMode] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_sync_mode') : null) || 'synced';
  });

  // Dynamic Combat Arena reaction mode ('manual_only' vs 'climax_only' vs 'full_dynamic')
  const [dynamicArenaMode, setDynamicArenaMode] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_dynamic_arena_mode') : null) || 'manual_only';
  });

  // Battle Arena Theme & Static Duel Field State
  const [chosenArena, setChosenArena] = useState(() => {
    const isSync = (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_sync_mode') : null) !== 'independent';
    if (isMultiplayer && isSync && multiplayerData?.arenaId) {
      return getArenaTheme(multiplayerData.arenaId, theme);
    }
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_theme') : null;
    if (!saved || saved === 'random') {
      return getRandomArenaTheme();
    }
    return getArenaTheme(saved, theme);
  });

  const baseArenaBg = resolveArenaBgImage(chosenArena, theme);
  const currentBgImage = (theme === 'light' ? (state.activeFieldSpell?.bgLight || state.activeFieldSpell?.bgImage) : state.activeFieldSpell?.bgImage) || baseArenaBg;

  const prevBgRef = useRef(currentBgImage);
  const [crossfadeState, setCrossfadeState] = useState({
    currBg: currentBgImage,
    prevBg: null,
    isFading: false,
  });

  useEffect(() => {
    if (currentBgImage && currentBgImage !== prevBgRef.current) {
      const oldBg = prevBgRef.current;
      prevBgRef.current = currentBgImage;
      setCrossfadeState({
        currBg: currentBgImage,
        prevBg: oldBg,
        isFading: true,
      });

      const timer = setTimeout(() => {
        setCrossfadeState({
          currBg: currentBgImage,
          prevBg: null,
          isFading: false,
        });
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentBgImage]);

  const [arenaTransition, setArenaTransition] = useState(null);
  const arenaTransitionTimerRef = useRef(null);
  const hasClimaxWarpTriggeredRef = useRef(false);
  const lastBossWarpTimeRef = useRef(0);
  const prevTurnWarpRef = useRef(1);

  // Reset climax & boss triggers on new duel / turn 1
  useEffect(() => {
    if (state.turnNumber <= 1) {
      hasClimaxWarpTriggeredRef.current = false;
      lastBossWarpTimeRef.current = 0;
    }
  }, [state.turnNumber]);

  const triggerArenaTransition = (nextArena, reason = '', badge = 'انتقال بعدي لساحة المعركة') => {
    if (!nextArena) return;
    if (arenaTransitionTimerRef.current) {
      clearTimeout(arenaTransitionTimerRef.current);
    }
    soundManager.playArenaWarp();
    hapticManager.triggerCombatVibration('powerSummon');

    setArenaTransition({
      arena: nextArena,
      reason,
      badge,
      timestamp: Date.now(),
    });

    // Seamless background change with crossfade
    setChosenArena(nextArena);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_arena_theme', nextArena.id);
    }

    // End transition sequence smoothly
    arenaTransitionTimerRef.current = setTimeout(() => {
      setArenaTransition(null);
      arenaTransitionTimerRef.current = null;
    }, 1600);
  };

  const handleCycleArena = () => {
    const selectable = SELECTABLE_ARENAS;
    const currIdx = selectable.findIndex((a) => a.id === chosenArena?.id);
    const nextIdx = (currIdx + 1) % selectable.length;
    const nextArena = selectable[nextIdx];
    triggerArenaTransition(nextArena, 'تم تبديل ساحة المعركة بنجاح', 'انتقال بعدي يدوي');
    if (isMultiplayer && arenaSyncMode === 'synced') {
      connectionManager.send({
        type: 'DUEL_ARENA_SYNC',
        arenaId: nextArena.id,
      });
    }
  };

  // Start battle background music automatically on duel start and stop on exit
  useEffect(() => {
    soundManager.startDuelAudio();

    return () => {
      soundManager.stopDuelAudio();
    };
  }, []);

  // In-Game Toast notification
  const [gameToast, setGameToast] = useState(null);
  const gameToastTimerRef = useRef(null);
  const showGameToast = (msg, duration = 2500) => {
    if (gameToastTimerRef.current) {
      clearTimeout(gameToastTimerRef.current);
    }
    setGameToast(msg);
    gameToastTimerRef.current = setTimeout(() => {
      setGameToast(null);
      gameToastTimerRef.current = null;
    }, duration);
  };

  // Broadcast lightweight authoritative snapshot of battlefield so ALL devices match 100% in real time
  // Broadcast lightweight authoritative snapshot of battlefield so ALL devices match 100% in real time
  const broadcastTagFieldSnapshot = (senderSlot = 0, senderTeam = 0) => {
    if (!isMultiplayer) return;
    const currentState = engine.getState();
    const curP0 = currentState.players[0];
    const curP1 = currentState.players[1];
    if (!curP0 || !curP1) return;

    const isHost = connectionManager.role === 'host';
    // CRITICAL: Determine this physical device's team.
    // On this device, players[0] is always this device's team, and players[1] is always the opponent team.
    const deviceTeam = (typeof multiplayerData?.myTeam === 'number')
      ? multiplayerData.myTeam
      : (isHost ? 0 : 1);

    // Absolute team0 (Team 0 in match) and team1 (Team 1 in match):
    const team0 = deviceTeam === 0 ? curP0 : curP1;
    const team1 = deviceTeam === 0 ? curP1 : curP0;

    // Absolute global turn team (0 or 1):
    const globalTurnTeam = deviceTeam === 0
      ? currentState.currentTurnPlayer
      : (1 - currentState.currentTurnPlayer);

    const mySlot = multiplayerData?.mySlot ?? (isHost ? 0 : 1);

    connectionManager.send({
      type: 'TAG_SYNC_FIELD',
      senderSlot: typeof senderSlot === 'number' ? senderSlot : mySlot,
      senderTeam: deviceTeam,
      isHostSnapshot: isHost,
      snapshot: {
        turnNumber: currentState.turnNumber,
        phase: currentState.phase,
        globalTurnTeam,
        arenaId: chosenArena?.id,
        team0: {
          lifePoints: team0.lifePoints,
          monsterZones: team0.monsterZones,
          spellTrapZones: team0.spellTrapZones,
          graveyard: team0.graveyard,
          normalSummonsRemaining: team0.normalSummonsRemaining,
        },
        team1: {
          lifePoints: team1.lifePoints,
          monsterZones: team1.monsterZones,
          spellTrapZones: team1.spellTrapZones,
          graveyard: team1.graveyard,
          normalSummonsRemaining: team1.normalSummonsRemaining,
        },
      },
    });
  };

  // Broadcast initial field snapshot and arena sync on mount so all peers start in 100% lockstep
  useEffect(() => {
    if (isMultiplayer && connectionManager.role === 'host') {
      const initTimer = setTimeout(() => {
        broadcastTagFieldSnapshot(0, 0);
        if (chosenArena?.id && arenaSyncMode === 'synced') {
          connectionManager.send({
            type: 'DUEL_ARENA_SYNC',
            arenaId: chosenArena.id,
          });
        }
      }, 400);
      return () => clearTimeout(initTimer);
    }
  }, [arenaSyncMode, chosenArena?.id]);

  // Helper to execute locally and broadcast to opponent / teammate in multiplayer
  const executeAndBroadcast = (action, ...args) => {
    let cardData = null;
    let mySlot = 0;
    let myTeam = 0;
    let actionTeam = 0;
    let actionSlot = 0;

    if (isMultiplayer) {
      mySlot = multiplayerData?.mySlot ?? (connectionManager.role === 'host' ? 0 : 1);
      myTeam = multiplayerData?.myTeam ?? (mySlot < 2 ? 0 : 1);

      const activeHand = engine.state.currentTurnPlayer === 0 ? p0?.hand : p1?.hand;
      if (action === 'normalSummon' || action === 'setMonster') {
        cardData = activeHand?.[args[0]] || null;
      } else if (action === 'setSpellTrap' || action === 'activateSpell') {
        cardData = activeHand?.[args[0]] || null;
      }

      const isBotAction = engine.state?.isTagMode && connectionManager.role === 'host' && engine.state.currentTurnPlayer === 1;
      actionTeam = isBotAction ? 1 : myTeam;
      actionSlot = isBotAction ? 2 : mySlot;
    }

    const res = engine[action](...args);

    if (isMultiplayer) {
      connectionManager.send({
        type: 'DUEL_ACTION',
        action,
        args,
        card: cardData,
        senderSlot: actionSlot,
        senderTeam: actionTeam,
      });

      if (engine.state?.isTagMode) {
        connectionManager.syncTeammateHand(engine.state.players[0]?.hand || []);
      }
      broadcastTagFieldSnapshot(actionSlot, actionTeam);
    }

    return res;
  };

  // Remote multiplayer action listener
  useEffect(() => {
    if (!isMultiplayer) return;

    const unsubMsg = connectionManager.onMessage((msg) => {
      if (msg.type === 'DUEL_ACTION') {
        try {
          if (engine.state?.isTagMode) {
            const mySlot = multiplayerData?.mySlot ?? (connectionManager.role === 'host' ? 0 : 1);
            const myTeam = multiplayerData?.myTeam ?? (mySlot < 2 ? 0 : 1);
            const isFromMyTeam = (msg.senderTeam === myTeam);
            const isFromTeammate = (isFromMyTeam && msg.senderSlot !== mySlot);
            const targetTeamIndex = isFromMyTeam ? 0 : 1;
            const senderName = msg.senderName || (isFromTeammate ? (p0?.teammateName || 'زميلك') : (p1?.name || 'الخصم'));

            if ((msg.action === 'normalSummon' || msg.action === 'setMonster') && msg.card) {
              const position = msg.action === 'setMonster' ? 'face_down_defense' : (msg.args[2] || 'face_up_attack');
              const zoneIndex = msg.args[1];
              const tributes = msg.args[3] || [];

              engine.applyTagFieldAction({
                targetTeam: targetTeamIndex,
                action: position === 'face_down_defense' ? 'SET_MONSTER' : 'SUMMON',
                card: msg.card,
                zoneIndex,
                position,
                tributes,
              });

              if (isFromTeammate) {
                showGameToast(`أخوك ${senderName} نزّل ${msg.card.name || 'وحش'} في ساحتنا!`, 2500);
              } else {
                showGameToast(`الخصم ${senderName} نزّل ${msg.card.name || 'وحش'} في الساحة!`, 2500);
              }
            } else if (msg.action === 'setSpellTrap' && msg.card) {
              const zoneIndex = msg.args[1];
              engine.applyTagFieldAction({
                targetTeam: targetTeamIndex,
                action: 'SET_SPELL_TRAP',
                card: msg.card,
                zoneIndex,
              });
              if (isFromTeammate) {
                showGameToast(`أخوك ${senderName} ثبّت كارت مقلوب في ساحتنا!`, 2500);
              }
            } else if (msg.action === 'activateSpell' && msg.card) {
              engine.applyTagFieldAction({
                targetTeam: targetTeamIndex,
                action: 'ACTIVATE_SPELL',
                card: msg.card,
                zoneIndex: msg.args[1],
              });
              if (isFromTeammate) {
                showGameToast(`أخوك ${senderName} شغّل سحر: ${msg.card.name || ''}!`, 2500);
              }
            } else if (msg.action === 'changePosition') {
              const targetPlayerIndex = isFromMyTeam ? 0 : 1;
              engine.changePosition(msg.args[0], msg.args[1], targetPlayerIndex);
            } else if (msg.action === 'activateSetSpellTrap') {
              const targetPlayerIndex = isFromMyTeam ? 0 : 1;
              engine.activateSetSpellTrap(msg.args[0], msg.args[1], targetPlayerIndex);
            } else if (msg.action === 'declareAttack') {
              const attackerPlayerIndex = isFromMyTeam ? 0 : 1;
              engine.declareAttack(msg.args[0], msg.args[1], attackerPlayerIndex);
            } else if (msg.action === 'directAttack') {
              const attackerPlayerIndex = isFromMyTeam ? 0 : 1;
              engine.directAttack(msg.args[0], attackerPlayerIndex);
            } else if (msg.action === 'advancePhase') {
              engine.advancePhase(...msg.args);
            } else if (msg.action === 'endTurn') {
              engine.endTurn();
            } else if (isFromTeammate) {
              if (msg.action === 'normalSummon') {
                engine.normalSummonFromTeammate(...msg.args);
                showGameToast(`أخوك ${senderName} نزّل وحش في الساحة دلوقتي!`, 2500);
              } else if (msg.action === 'setSpellTrap') {
                engine.setSpellTrapFromTeammate(...msg.args);
                showGameToast(`أخوك ${senderName} ثبّت كارت مقلوب في الساحة!`, 2500);
              } else if (msg.action === 'activateSpell') {
                engine.activateSpellFromTeammate(...msg.args);
                showGameToast(`أخوك ${senderName} فعّل كارت سحر وفاجئهم!`, 2500);
              } else if (typeof engine[msg.action] === 'function') {
                engine[msg.action](...msg.args);
              }
            } else {
              if (typeof engine[msg.action] === 'function') {
                engine[msg.action](...msg.args);
              }
            }

            if (connectionManager.role === 'host') {
              broadcastTagFieldSnapshot(0, 0);
            }
          } else {
            // 1v1 Remote Duel Action Mirroring
            const oppName = p1?.name || 'المنافس';
            if ((msg.action === 'normalSummon' || msg.action === 'setMonster') && msg.card) {
              const position = msg.action === 'setMonster' ? 'face_down_defense' : (msg.args[2] || 'face_up_attack');
              const zoneIndex = msg.args[1];
              const tributes = msg.args[3] || [];
              engine.applyTagFieldAction({
                targetTeam: 1, // Opponent zone (p1)
                action: position === 'face_down_defense' ? 'SET_MONSTER' : 'SUMMON',
                card: msg.card,
                zoneIndex,
                position,
                tributes,
              });
              showGameToast(`المنافس ${oppName} استدعى ${msg.card.name || 'وحش'} في الساحة!`, 2500);
            } else if (msg.action === 'setSpellTrap' && msg.card) {
              const zoneIndex = msg.args[1];
              engine.applyTagFieldAction({
                targetTeam: 1,
                action: 'SET_SPELL_TRAP',
                card: msg.card,
                zoneIndex,
              });
              showGameToast(`المنافس ${oppName} وضع ورقة مقلوبة!`, 2500);
            } else if (msg.action === 'activateSpell' && msg.card) {
              engine.applyTagFieldAction({
                targetTeam: 1,
                action: 'ACTIVATE_SPELL',
                card: msg.card,
                zoneIndex: msg.args[1],
              });
              showGameToast(`المنافس ${oppName} فعّل سحر: ${msg.card.name || ''}!`, 2500);
            } else if (msg.action === 'changePosition') {
              engine.changePosition(msg.args[0], msg.args[1], 1);
            } else if (msg.action === 'activateSetSpellTrap') {
              engine.activateSetSpellTrap(msg.args[0], msg.args[1], 1);
            } else if (msg.action === 'declareAttack') {
              engine.declareAttack(msg.args[0], msg.args[1], 1);
            } else if (msg.action === 'directAttack') {
              engine.directAttack(msg.args[0], 1);
            } else if (msg.action === 'advancePhase') {
              engine.advancePhase(...msg.args);
            } else if (msg.action === 'endTurn') {
              engine.endTurn();
            } else if (typeof engine[msg.action] === 'function') {
              engine[msg.action](...msg.args);
            }

            if (connectionManager.role === 'host') {
              broadcastTagFieldSnapshot(0, 0);
            }
          }
        } catch (e) {
          console.error('Failed to execute remote duel action:', e);
        }
      } else if (msg.type === 'TAG_SYNC_FIELD') {
        // If Host: The host runs the authoritative simulation and server room.
        // Ignore snapshots from guests to prevent desync/reversion.
        if (connectionManager.role === 'host' && !msg.isHostSnapshot) {
          return;
        }

        if (msg.snapshot) {
          if (arenaSyncMode === 'synced' && msg.snapshot.arenaId && chosenArena?.id !== msg.snapshot.arenaId) {
            const synced = getArenaTheme(msg.snapshot.arenaId, theme);
            if (synced) setChosenArena(synced);
          }
          const mySlot = multiplayerData?.mySlot ?? (connectionManager.role === 'host' ? 0 : 1);
          const myTeam = multiplayerData?.myTeam ?? (mySlot < 2 ? 0 : 1);
          const { turnNumber, phase, globalTurnTeam, team0, team1 } = msg.snapshot;

          // Reject stale snapshots from older turns
          if (typeof turnNumber === 'number' && turnNumber < engine.state.turnNumber) {
            return;
          }

          const myTeamData = myTeam === 0 ? team0 : team1;
          const oppTeamData = myTeam === 0 ? team1 : team0;

          const p0Local = engine.state.players[0];
          const p1Local = engine.state.players[1];

          const reconcileZoneList = (localZones, incomingZones, localGrave, incomingGrave) => {
            if (!Array.isArray(incomingZones)) return localZones;
            return incomingZones.map((inc, i) => {
              const loc = localZones?.[i];
              if (inc && inc.card) {
                return {
                  ...inc,
                  currentAtk: inc.currentAtk ?? inc.card.atk ?? 0,
                  currentDef: inc.currentDef ?? inc.card.def ?? 0,
                };
              }
              // If incoming says empty, check if local monster was freshly summoned in current turn
              if (loc && loc.card) {
                const wasFresh = (loc.turnSummoned === engine.state.turnNumber);
                const inGrave = (
                  (Array.isArray(incomingGrave) && incomingGrave.some(c => c && (c.id === loc.card.id || c.name === loc.card.name))) ||
                  (Array.isArray(localGrave) && localGrave.some(c => c && (c.id === loc.card.id || c.name === loc.card.name)))
                );
                if (wasFresh && !inGrave) {
                  return loc;
                }
              }
              return null;
            });
          };

          if (p0Local && myTeamData) {
            p0Local.lifePoints = myTeamData.lifePoints;
            p0Local.monsterZones = reconcileZoneList(p0Local.monsterZones, myTeamData.monsterZones, p0Local.graveyard, myTeamData.graveyard);
            p0Local.spellTrapZones = Array.isArray(myTeamData.spellTrapZones) ? myTeamData.spellTrapZones : p0Local.spellTrapZones;
            if (Array.isArray(myTeamData.graveyard)) {
              p0Local.graveyard = myTeamData.graveyard;
            }
            if (typeof myTeamData.normalSummonsRemaining === 'number') {
              p0Local.normalSummonsRemaining = myTeamData.normalSummonsRemaining;
            }
          }

          if (p1Local && oppTeamData) {
            p1Local.lifePoints = oppTeamData.lifePoints;
            p1Local.monsterZones = reconcileZoneList(p1Local.monsterZones, oppTeamData.monsterZones, p1Local.graveyard, oppTeamData.graveyard);
            p1Local.spellTrapZones = Array.isArray(oppTeamData.spellTrapZones) ? oppTeamData.spellTrapZones : p1Local.spellTrapZones;
            if (Array.isArray(oppTeamData.graveyard)) {
              p1Local.graveyard = oppTeamData.graveyard;
            }
            if (typeof oppTeamData.normalSummonsRemaining === 'number') {
              p1Local.normalSummonsRemaining = oppTeamData.normalSummonsRemaining;
            }
          }

          engine.state.turnNumber = turnNumber;
          engine.state.phase = phase;
          engine.state.currentTurnPlayer = globalTurnTeam === myTeam ? 0 : 1;

          engine.notify();
        }
      } else if (msg.type === 'TEAM_PING') {
        setActiveTeamPing(msg);
        soundManager.play('decide');
        hapticManager.triggerCombatVibration('powerSummon');
        setTimeout(() => setActiveTeamPing(null), 3600);
      } else if (msg.type === 'TAG_SYNC_HAND') {
        if (engine.state?.isTagMode && engine.state.players?.[0]) {
          engine.state.players[0].teammateHand = msg.handCards || [];
          engine.notify();
        }
      } else if (msg.type === 'DUEL_ARENA_SYNC') {
        if (arenaSyncMode === 'synced' && msg.arenaId) {
          const synced = getArenaTheme(msg.arenaId, theme);
          if (synced && synced.id !== chosenArena?.id) {
            triggerArenaTransition(synced, 'تمت مزامنة ساحة المعركة مع الخصم', 'مزامنة الساحة الموحدة');
          }
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

  const [isTeammateDrawerOpen, setIsTeammateDrawerOpen] = useState(false);
  const [activeTeamPing, setActiveTeamPing] = useState(null);
  const maxLP = state.isTagMode ? (Number(state.tagSettings?.lifePoints) || 16000) : 8000;

  const getTurnBannerInfo = () => {
    if (!state.isTagMode) {
      if (state.currentTurnPlayer === 0) {
        return {
          text: 'دورك دلوقتي يا بطل!',
          color: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.15)',
          border: '#22c55e',
        };
      }
      return {
        text: `دور المنافس (${p1?.name || 'الخصم'})... مستني حركته`,
        color: 'var(--pharaoh-gold-bright)',
        bg: 'rgba(201, 158, 50, 0.15)',
        border: 'var(--pharaoh-gold-dark)',
      };
    }

    const mySlot = multiplayerData?.mySlot ?? 0;
    const isTagSequential = state.turnFlow === 'tag_sequential';

    if (isTagSequential) {
      const isMySlotActive = isMultiplayer ? (state.tagActiveSlot === mySlot) : (state.tagActiveSlot === 0);
      const isTmSlotActive = isMultiplayer
        ? (mySlot === 0 ? state.tagActiveSlot === 1 : mySlot === 1 ? state.tagActiveSlot === 0 : mySlot === 2 ? state.tagActiveSlot === 3 : state.tagActiveSlot === 2)
        : (state.tagActiveSlot === 1);

      if (isMySlotActive) {
        return {
          text: 'دورك أنت تلعب دلوقتي يا بطل! (تناوب الأدوار)',
          color: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.18)',
          border: '#22c55e',
        };
      }
      if (isTmSlotActive) {
        return {
          text: `دور زميلك (${p0?.teammateName || 'صاحبك'})... بيخطط لحركته!`,
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.15)',
          border: '#38bdf8',
        };
      }
      return {
        text: `دور الخصوم (${p1?.name || 'الخصم'})... خليك صاحي للدفاع!`,
        color: 'var(--pharaoh-gold-bright)',
        bg: 'rgba(201, 158, 50, 0.15)',
        border: 'var(--pharaoh-gold-dark)',
      };
    }

    // coop_simultaneous (default)
    if (state.currentTurnPlayer === 0) {
      return {
        text: `دور فرقتكم سوا دلوقتي (أنت وصاحبك) — العبوا سوا في نفس الدور!`,
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.18)',
        border: '#22c55e',
      };
    }
    return {
      text: `دور تحالف الخصوم (${p1?.name || 'الخصم'} & ${p1?.teammateName || 'زميله'})...`,
      color: 'var(--pharaoh-gold-bright)',
      bg: 'rgba(201, 158, 50, 0.15)',
      border: 'var(--pharaoh-gold-dark)',
    };
  };

  const canControlTurnPhase = !state.isTagMode || state.turnFlow !== 'tag_sequential' || (isMultiplayer ? (state.tagActiveSlot === (multiplayerData?.mySlot ?? 0)) : (state.tagActiveSlot === 0));

  const [selectedHandIndex, setSelectedHandIndex] = useState(null);
  const [selectedFieldMonsterZone, setSelectedFieldMonsterZone] = useState(null);
  const [selectedSetSTZone, setSelectedSetSTZone] = useState(null);
  const [inspectCard, setInspectCard] = useState(null);
  const [selectedCardRect, setSelectedCardRect] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiTacticalPlan, setAiTacticalPlan] = useState(null);

  // Mobile Hand Card UX & Double-Tap Controls
  const [quickSummonEnabled, setQuickSummonEnabled] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_quick_summon_enabled') !== 'false' : true;
  });
  const [quickSummonPos, setQuickSummonPos] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_quick_summon_pos') : null) || 'face_up_attack';
  });
  const [cardMenuStyle, setCardMenuStyle] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_card_menu_style') : null) || 'compact';
  });
  const [doubleTapFeedbackIndex, setDoubleTapFeedbackIndex] = useState(null);
  const lastHandTapRef = useRef({ index: null, timestamp: 0 });

  // 2v2 Tag Team: Track individual player's summon this turn so both teammates can summon 1 monster
  const [myTurnSummonCount, setMyTurnSummonCount] = useState(0);
  useEffect(() => {
    setMyTurnSummonCount(0);
  }, [state.turnNumber, state.currentTurnPlayer]);



  // Sync UX settings when settings modal closes
  useEffect(() => {
    if (!isSettingsOpen && typeof localStorage !== 'undefined') {
      setQuickSummonEnabled(localStorage.getItem('yugioh_quick_summon_enabled') !== 'false');
      setQuickSummonPos(localStorage.getItem('yugioh_quick_summon_pos') || 'face_up_attack');
      setCardMenuStyle(localStorage.getItem('yugioh_card_menu_style') || 'compact');
      setArenaSyncMode(localStorage.getItem('yugioh_arena_sync_mode') || 'synced');
      setDynamicArenaMode(localStorage.getItem('yugioh_dynamic_arena_mode') || 'manual_only');
      const savedArena = localStorage.getItem('yugioh_arena_theme') || 'random';
      if (savedArena !== 'random') {
        setChosenArena(getArenaTheme(savedArena, theme));
      }
    }
  }, [isSettingsOpen, theme]);

  // Track position of selected card in hand for floating action pills
  const updateSelectedCardRect = () => {
    if (selectedHandIndex !== null) {
      const el = document.getElementById(`hand-card-${selectedHandIndex}`);
      if (el) {
        const r = el.getBoundingClientRect();
        setSelectedCardRect({
          left: r.left + r.width / 2,
          top: r.top,
        });
      }
    } else {
      setSelectedCardRect(null);
    }
  };

  useEffect(() => {
    updateSelectedCardRect();
    window.addEventListener('resize', updateSelectedCardRect);
    return () => window.removeEventListener('resize', updateSelectedCardRect);
  }, [selectedHandIndex, state.players[0].hand]);

  // Smart Spell/Trap Prompt
  const [spellTrapPrompt, setSpellTrapPrompt] = useState(null);
  const [battleStepPromptDismissedTurn, setBattleStepPromptDismissedTurn] = useState(-1);

  // Graveyard Viewer State ({ isOpen: boolean, playerIndex: 0 | 1 })
  const [graveyardViewer, setGraveyardViewer] = useState(null);

  // Interactive Card Selection Modal (Graveyard recovery / Monster Reborn)
  const [cardSelectModal, setCardSelectModal] = useState(null);

  // Tribute Summoning State
  const [tributeSelection, setTributeSelection] = useState(null);
  // { handIndex: number, card: Object, position: string, requiredTributes: number, selectedZones: number[] }
  const [tributeAscensionAnimation, setTributeAscensionAnimation] = useState(null);
  // { summoningCard: Object, sacrificedCards: Object[], stage: 'sacrificing' | 'ascending', playerName: string, isOpponent: boolean }

  // Spell Activation Animation State
  const [spellAnimation, setSpellAnimation] = useState(null);
  // { playerIndex: number, spellCard: Object, effectMeta: Object }

  // Monster Effect Radiating Activation State
  const [monsterEffectAnimation, setMonsterEffectAnimation] = useState(null);
  // { playerIndex: number, card: Object, trigger: string, title: string, arabicName: string, desc: string, result: Object }

  // Animation States
  const [combatAnimation, setCombatAnimation] = useState(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [destroyAnimation, setDestroyAnimation] = useState(null);
  const [showShuffle, setShowShuffle] = useState(true);
  const [opponentCardDescent, setOpponentCardDescent] = useState(null);
  const [opponentSummonShockwave, setOpponentSummonShockwave] = useState(null);
  const [opponentAttackAlert, setOpponentAttackAlert] = useState(null);
  const [combatClashVerdict, setCombatClashVerdict] = useState(null); // Post-attack battle clash outcome and LP deduction breakdown
  const [activeAttackMotion, setActiveAttackMotion] = useState(null); // Direct in-field card lunge & impact recoil motion
  const [powerStrikeAlert, setPowerStrikeAlert] = useState(null); // Epic Heavy Monster Attack Power Cut-in
  const [opponentEffectNotice, setOpponentEffectNotice] = useState(null);
  // { zoneIndex: number | -1, actionText: string, effectType: string, timestamp: number }

  const triggerOpponentEffectNotice = (zoneIndex, actionText, effectType = 'impact') => {
    setOpponentEffectNotice({
      zoneIndex,
      actionText,
      effectType,
      timestamp: Date.now(),
    });
    setTimeout(() => {
      setOpponentEffectNotice((curr) => (curr && Date.now() - curr.timestamp >= 2400 ? null : curr));
    }, 2500);
  };

  // Animated LP Display, Ghost Bars & Combat Damage Popups
  const [displayedP0LP, setDisplayedP0LP] = useState(state.players[0].lifePoints);
  const [displayedP1LP, setDisplayedP1LP] = useState(state.players[1].lifePoints);
  const [ghostP0LP, setGhostP0LP] = useState(state.players[0].lifePoints);
  const [ghostP1LP, setGhostP1LP] = useState(state.players[1].lifePoints);
  const [lpPulseP0, setLpPulseP0] = useState(null); // 'loss' | 'heal' | null
  const [lpPulseP1, setLpPulseP1] = useState(null); // 'loss' | 'heal' | null
  const [damageFlash, setDamageFlash] = useState(null); // { playerIndex: number, damage: number, timestamp: number }
  const [damagePopups, setDamagePopups] = useState([]); // Array of { id, playerIndex, amount, isHeal }
  const [spectralPhantom, setSpectralPhantom] = useState(null); // Direct Attack Spectral Monster Projection
  const [directAttackVignette, setDirectAttackVignette] = useState(false);
  const prevLpTrackerRef = useRef({ p0: state.players[0].lifePoints, p1: state.players[1].lifePoints });
  const ghostTimerP0Ref = useRef(null);
  const ghostTimerP1Ref = useRef(null);

  const p0MonsterRefs = useRef([]);
  const p0SpellTrapRefs = useRef([]);
  const p1MonsterRefs = useRef([]);
  const p1SpellTrapRefs = useRef([]);
  const prevP1MonstersRef = useRef([]);
  const p0LpRef = useRef(null);
  const p1LpRef = useRef(null);
  const arenaRef = useRef(null);
  const prevTurnPlayerRef = useRef(state.currentTurnPlayer);
  const prevTurnNumberRef = useRef(state.turnNumber);
  const [turnTransitionBanner, setTurnTransitionBanner] = useState(null);

  const triggerTurnBanner = (turnNum, opponentName) => {
    soundManager.playTurnChange();
    hapticManager.triggerCombatVibration('turnChange');
    setTimeout(() => soundManager.playCardMove(), 320);

    setTurnTransitionBanner({
      title: 'دورك الآن يا فرعون!',
      subtitle: `أنهى ${opponentName || 'الخصم'} دوره — اسحب بطاقتك وتسلّم زمام المعركة`,
      turnNumber: turnNum,
      opponentName: opponentName || 'الخصم',
    });

    setTimeout(() => {
      setTurnTransitionBanner((curr) => (curr?.turnNumber === turnNum ? null : curr));
    }, 1400);
  };

  // Subscribe to engine state
  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });
    soundManager.playStart();
    return unsubscribe;
  }, [engine]);

  // Subscribe to engine turn-end events
  useEffect(() => {
    if (!engine.onTurnEnd) return;
    const unsubTurnEnd = engine.onTurnEnd((data) => {
      if (data.endedPlayer === 1 && data.nextPlayer === 0 && !engine.state.winner) {
        triggerTurnBanner(data.turnNumber, state.players[1]?.name);
      }
    });
    return unsubTurnEnd;
  }, [engine, state.players]);

  // Fallback watcher for turn changes (handles multiplayer / direct state sync)
  useEffect(() => {
    const prevPlayer = prevTurnPlayerRef.current;
    const currPlayer = state.currentTurnPlayer;
    const prevTurn = prevTurnNumberRef.current;
    const currTurn = state.turnNumber;

    if (prevPlayer === 1 && currPlayer === 0 && state.winner === null && currTurn > prevTurn) {
      if (!turnTransitionBanner || turnTransitionBanner.turnNumber !== currTurn) {
        triggerTurnBanner(currTurn, state.players[1]?.name);
      }
    }

    prevTurnPlayerRef.current = currPlayer;
    prevTurnNumberRef.current = currTurn;
  }, [state.currentTurnPlayer, state.turnNumber, state.winner]);

  // Register Battle Trap Prompter with engine
  useEffect(() => {
    if (!engine.setBattleTrapPrompter) return;

    engine.setBattleTrapPrompter(async ({ opponentIndex, attackerCard, isDirect }) => {
      const p0State = engine.state.players[0];
      const eligible = [];
      for (let i = 0; i < 5; i++) {
        const slot = p0State.spellTrapZones[i];
        if (slot && slot.card) {
          if (slot.card.type === 'trap') {
            if (slot.turnSet === engine.state.turnNumber) continue;
            eligible.push({ zoneIndex: i, card: slot.card });
          } else if (slot.card.type === 'spell') {
            eligible.push({ zoneIndex: i, card: slot.card });
          }
        }
      }

      if (eligible.length === 0) return { activated: false };

      return new Promise((resolve) => {
        soundManager.playMagic();
        hapticManager.triggerCombatVibration('magic');
        const chosen = eligible[0];
        setSpellTrapPrompt({
          zoneIndex: chosen.zoneIndex,
          card: chosen.card,
          attackerCard,
          isDirect,
          title: 'فرصة تفعيل في المعركة',
          message: `ده الوقت المناسب تفعّل فيه ${chosen.card.name}! عايز تفعّلها دلوقتي؟`,
          subMessage: isDirect
            ? `الخصم داخل يهجم هجوم مباشر بـ ${attackerCard?.name || 'وحشه'}!`
            : `الخصم بيهجم عليك بـ ${attackerCard?.name || 'وحشه'}!`,
          resolver: resolve,
        });
      });
    });

    return () => {
      if (engine.setBattleTrapPrompter) {
        engine.setBattleTrapPrompter(null);
      }
    };
  }, [engine]);

  // Smart prompt when player enters Battle Step on their own turn
  useEffect(() => {
    if (
      state.phase === 'BATTLE_STEP' &&
      state.currentTurnPlayer === 0 &&
      state.winner === null &&
      battleStepPromptDismissedTurn !== state.turnNumber &&
      !spellTrapPrompt
    ) {
      const p0State = state.players[0];
      const eligible = [];
      for (let i = 0; i < 5; i++) {
        const slot = p0State.spellTrapZones[i];
        if (slot && slot.card) {
          if (slot.card.type === 'trap') {
            if (slot.turnSet === state.turnNumber) continue;
            eligible.push({ zoneIndex: i, card: slot.card });
          } else if (slot.card.type === 'spell') {
            eligible.push({ zoneIndex: i, card: slot.card });
          }
        }
      }

      if (eligible.length > 0) {
        const chosen = eligible[0];
        soundManager.playMagic();
        hapticManager.triggerCombatVibration('click');
        setSpellTrapPrompt({
          zoneIndex: chosen.zoneIndex,
          card: chosen.card,
          title: 'فرصة تفعيل في دورك',
          message: `أنت في مرحلة الهجوم دلوقتي! ده الوقت المناسب تفعّل ${chosen.card.name}، عايز تفعّلها دلوقتي؟`,
          subMessage: 'فرصة تزوّد بيها هجومك أو تبوّظ خطة الخصم قبل ما تضرب!',
          resolver: null,
        });
        setBattleStepPromptDismissedTurn(state.turnNumber);
      }
    }
  }, [state.phase, state.currentTurnPlayer, state.turnNumber, state.winner, battleStepPromptDismissedTurn, spellTrapPrompt, state.players]);

  const handleActivatePromptCard = () => {
    if (!spellTrapPrompt) return;
    const { zoneIndex, card, resolver } = spellTrapPrompt;
    setSpellTrapPrompt(null);
    try {
      soundManager.playMagic();
      hapticManager.triggerCombatVibration('magic');
      executeAndBroadcast('activateSetSpellTrap', zoneIndex, null, 0);
      showGameToast(`اتفعّلت ${card.name} بنجاح!`);
      if (typeof resolver === 'function') {
        resolver({ activated: true, card });
      }
    } catch (e) {
      alert(e.message);
      if (typeof resolver === 'function') {
        resolver({ activated: false });
      }
    }
  };

  const handleSkipPromptCard = () => {
    if (!spellTrapPrompt) return;
    const { resolver } = spellTrapPrompt;
    setSpellTrapPrompt(null);
    soundManager.playClick();
    if (typeof resolver === 'function') {
      resolver({ activated: false });
    }
  };

  // Auto-dismiss prompt after 6 seconds so combat is not held hostage
  useEffect(() => {
    if (!spellTrapPrompt) return;
    const timer = setTimeout(() => {
      handleSkipPromptCard();
    }, 6000);
    return () => clearTimeout(timer);
  }, [spellTrapPrompt]);

  // Subscribe to engine spell events
  useEffect(() => {
    const unsubSpell = engine.onSpell((data) => {
      triggerSpellAnimation(data);
    });
    return unsubSpell;
  }, [engine]);

  // Subscribe to monster effect events (for radiating card animation and opponent notifications)
  useEffect(() => {
    const unsubMonsterEffect = engine.onMonsterEffect((data) => {
      if (!data || !data.card) return;

      // 1. Trigger the radiating card activation overlay
      triggerMonsterEffectAnimation(data);

      // 2. If the effect destroyed or bounced an opponent monster, trigger the opponent slot badge
      if (data?.result?.targetZoneIndex !== undefined && data?.result?.playerIndex === 1) {
        const actionText = data.result.type === 'bounce' ? 'رجع لإيد الخصم!' : 'تم التدمير بقدرة الوحش!';
        triggerOpponentEffectNotice(data.result.targetZoneIndex, actionText, data.result.type || 'destroy');
      }
    });
    return unsubMonsterEffect;
  }, [engine]);

  // Subscribe to engine tribute events
  useEffect(() => {
    const unsubTribute = engine.onTribute((data) => {
      soundManager.playDestroy();
      hapticManager.triggerCombatVibration('destroy');
      if (data && data.playerIndex === 1 && data.card) {
        const dummySacrifices = (data.tributedNames || []).map((name) => ({ name }));
        setTributeAscensionAnimation({
          summoningCard: data.card,
          sacrificedCards: dummySacrifices,
          stage: 'ascending',
          playerName: p1?.name || 'المنافس',
          isOpponent: true,
        });
        soundManager.playSummon();
        setTimeout(() => setTributeAscensionAnimation(null), 2400);
      }
    });
    return unsubTribute;
  }, [engine, p1?.name]);

  // Subscribe to engine summon events (for opponent card descent animation)
  useEffect(() => {
    const unsubSummon = engine.onSummon((data) => {
      if (!data || !data.card) return;
      const isPlayer = data.playerIndex === 0;
      const isMonster = data.isMonster;
      const zoneIdx = data.zoneIndex;
      const targetRefs = isPlayer
        ? (isMonster ? p0MonsterRefs : p0SpellTrapRefs)
        : (isMonster ? p1MonsterRefs : p1SpellTrapRefs);
      const targetEl = targetRefs.current[zoneIdx];
      const arenaRect = arenaRef.current?.getBoundingClientRect();

      let targetX = 160;
      let targetY = isPlayer ? (isMonster ? 300 : 360) : (isMonster ? 90 : 35);
      let width = 64;
      let height = 90;

      if (targetEl && arenaRect) {
        const r = targetEl.getBoundingClientRect();
        targetX = r.left - arenaRect.left;
        targetY = r.top - arenaRect.top;
        width = r.width;
        height = r.height;
      }

      const startX = arenaRect ? arenaRect.width / 2 - width / 2 : targetX;
      const startY = isPlayer ? (arenaRect ? arenaRect.height + 60 : 550) : -120;

      // Set card descent animation
      setOpponentCardDescent({
        playerIndex: data.playerIndex,
        card: data.card,
        position: data.position,
        isMonster: data.isMonster,
        isSet: data.isSet,
        startX,
        startY,
        targetX,
        targetY,
        width,
        height,
        zoneIndex: zoneIdx,
        actionType: data.actionType,
      });

      if (data.isMonster && !data.isSet) {
        soundManager.playSummon();
        hapticManager.triggerCombatVibration('powerSummon', { atk: data.card?.atk || 0 });

        // Dynamic Combat Arena: Epic Boss Summon Transition
        if (dynamicArenaMode === 'full_dynamic' && data.card) {
          const atk = data.card.atk || 0;
          const level = data.card.level || 0;
          const name = (data.card.name || '').toLowerCase();
          const isEgyptianGod = name.includes('slifer') || name.includes('obelisk') || name.includes('ra') ||
            name.includes('سلايفر') || name.includes('أوبليسك') || name.includes('رع') || name.includes('exodia') || name.includes('إكسوديا');
          const isEpicBoss = isEgyptianGod || atk >= 2800 || level >= 8;

          if (isEpicBoss && Date.now() - lastBossWarpTimeRef.current > 25000) {
            lastBossWarpTimeRef.current = Date.now();
            let bossArena = null;
            if (isEgyptianGod) {
              bossArena = getArenaTheme('pharaoh_winged_ra', theme) || getArenaTheme('pharaoh_millennium_temple', theme);
            } else if (data.card.race === 'Dragon' || name.includes('blue-eyes') || name.includes('dragon') || name.includes('تنين')) {
              bossArena = getArenaTheme('dragon_crag', theme) || getArenaTheme('kaibacorp_stadium', theme);
            } else if (data.card.race === 'Spellcaster' || data.card.race === 'Fiend' || name.includes('dark magician') || name.includes('ساحر الظلام')) {
              bossArena = getArenaTheme('shadow_realm', theme) || getArenaTheme('black_hole_void', theme);
            } else if (data.card.race === 'Machine' || name.includes('machine')) {
              bossArena = getArenaTheme('machine_fortress', theme);
            } else {
              bossArena = getNextClimaxArena(chosenArena?.id);
            }

            if (bossArena && bossArena.id !== chosenArena?.id) {
              triggerArenaTransition(bossArena, `صعود أسطوري: ${data.card.name}`, 'استدعاء وحش حاسم');
              if (isMultiplayer && arenaSyncMode === 'synced') {
                connectionManager.send({
                  type: 'DUEL_ARENA_SYNC',
                  arenaId: bossArena.id,
                });
              }
            }
          }
        }
      } else {
        soundManager.playCardMove();
        hapticManager.vibrate([50, 30, 70]);
      }

      // On touchdown (after 600ms), show shockwave & badge
      setTimeout(() => {
        setOpponentSummonShockwave({
          x: targetX + width / 2,
          y: targetY + height / 2,
          card: data.card,
          isSet: data.isSet,
          isMonster: data.isMonster,
          isPlayer,
          badgeText: data.isMonster
            ? (data.isSet ? 'وضع وحش بالدفاع المقلوب' : `استدعاء: ${data.card?.name || ''}`)
            : 'وضع بطاقة سحر/فخ مقلوبة',
        });

        setTimeout(() => {
          setOpponentSummonShockwave(null);
        }, 850);
      }, 550);

      // Smart prompt on opponent summon if player has Trap Hole, Torrential Tribute, or response card
      if (data.playerIndex === 1 && data.isMonster && !data.isSet) {
        const p0State = engine.state.players[0];
        const trapIndex = p0State.spellTrapZones.findIndex(
          (z) => z && z.card && z.card.type === 'trap' && z.turnSet !== engine.state.turnNumber &&
          (z.card.name.toLowerCase().includes('trap hole') ||
           z.card.name.toLowerCase().includes('torrential tribute') ||
           z.card.name.toLowerCase().includes('eatgaboon') ||
           z.card.name.toLowerCase().includes('adhesive tape') ||
           z.card.name.toLowerCase().includes('chain destruction') ||
           z.card.name.toLowerCase().includes('solemn') ||
           z.card.name.toLowerCase().includes('horn of heaven') ||
           z.card.name.toLowerCase().includes('ring of destruction') ||
           z.card.name.toLowerCase().includes('spellbinding') ||
           z.card.name.toLowerCase().includes('shadow spell'))
        );
        if (trapIndex !== -1) {
          const trapCard = p0State.spellTrapZones[trapIndex].card;
          setTimeout(() => {
            soundManager.playMagic();
            hapticManager.triggerCombatVibration('magic');
            setSpellTrapPrompt({
              zoneIndex: trapIndex,
              card: trapCard,
              title: 'فرصة تفعيل فخ ضد الاستدعاء',
              message: `الخصم نزّل ${data.card.name}! ده الوقت المناسب تفعّل ${trapCard.name}، عايز تفعّلها دلوقتي؟`,
              subMessage: `تقدر توقع وحش الخصم اللي لسه نازل في الفخ دلوقتي!`,
              resolver: null,
            });
          }, 800);
        }
      }

      setTimeout(() => {
        setOpponentCardDescent(null);
      }, 720);
    });
    return unsubSummon;
  }, [engine]);

  // Watch for AI powerful monster summons (ATK >= 2500 or level >= 7) to trigger screen shake & haptics
  useEffect(() => {
    const currentP1 = state.players[1].monsterZones;
    currentP1.forEach((slot, idx) => {
      const prev = prevP1MonstersRef.current[idx];
      if (slot && (!prev || prev.card.id !== slot.card.id)) {
        if (slot.position !== 'face_down_defense' && (slot.card.atk >= 2500 || slot.card.level >= 7)) {
          setIsScreenShaking(true);
          hapticManager.triggerCombatVibration('powerSummon', { atk: slot.card.atk });
          setTimeout(() => setIsScreenShaking(false), 550);
        }
      }
    });
    prevP1MonstersRef.current = currentP1;
  }, [state.players[1].monsterZones]);

  // Subscribe to engine combat attack events (both Player and AI attacks)
  useEffect(() => {
    const unsubAttack = engine.onAttack((evt) => {
      const isOpponentAttacking = evt.attackerPlayer === 1;

      const runCombatExecution = () => {
        // Trigger Spectral Monster Phantom Direct Attack Projection ONLY if damage >= 1800
        if (evt.isDirect && evt.damage >= 1800) {
          const arenaRect = arenaRef.current?.getBoundingClientRect();
          const attRefs = evt.attackerPlayer === 0 ? p0MonsterRefs : p1MonsterRefs;
          const targetLpEl = evt.attackerPlayer === 0 ? p1LpRef.current : p0LpRef.current;
          const attEl = attRefs.current[evt.attackerZone];

          if (attEl && targetLpEl && arenaRect) {
            const attRect = attEl.getBoundingClientRect();
            const targetRect = targetLpEl.getBoundingClientRect();

            const startX = attRect.left + attRect.width / 2 - arenaRect.left;
            const startY = attRect.top + attRect.height / 2 - arenaRect.top;
            const targetX = targetRect.left + targetRect.width / 2 - arenaRect.left;
            const targetY = targetRect.top + targetRect.height / 2 - arenaRect.top;

            const dx = targetX - startX;
            const dy = targetY - startY;

            const card = evt.attackerCard || state.players[evt.attackerPlayer]?.monsterZones[evt.attackerZone]?.card;

            setSpectralPhantom({
              startX,
              startY,
              dx,
              dy,
              card,
              attackerPlayer: evt.attackerPlayer,
            });

            soundManager.playMagic();
            setTimeout(() => {
              setSpectralPhantom(null);
            }, 1200);
          }
        }

        triggerAttackAnimation(
          evt.attackerPlayer,
          evt.attackerZone,
          !evt.isDirect,
          evt.targetZone,
          evt.damage,
          evt.isDefenseBlocked,
          evt.isDefenseShatter,
          evt.damagePlayerIdx,
          evt.attackerAttribute,
          evt.defenderAttribute,
          evt.attackerCard,
          evt.defenderCard
        );

        // Trigger Graveyard Dissolution Animation on monster destruction with killer-based FX
        if (evt.defenderDestroyed && evt.defenderCard) {
          setTimeout(() => {
            const defRefs = evt.attackerPlayer === 0 ? p1MonsterRefs : p0MonsterRefs;
            const defEl = defRefs.current[evt.targetZone];
            const arenaRect = arenaRef.current?.getBoundingClientRect();
            let x = 0;
            let y = 0;
            if (defEl && arenaRect) {
              const r = defEl.getBoundingClientRect();
              x = r.left - arenaRect.left;
              y = r.top - arenaRect.top;
            }
            const fx = resolveDestructionByKiller(evt.defenderCard, evt.attackerCard);
            setDestroyAnimation({
              playerIndex: 1 - evt.attackerPlayer,
              zoneIndex: evt.targetZone,
              card: evt.defenderCard,
              killerCard: evt.attackerCard,
              fx,
              x,
              y,
            });
            if (fx.soundAction && typeof soundManager[fx.soundAction] === 'function') {
              soundManager[fx.soundAction]();
            } else {
              soundManager.playDestroy();
            }
            setTimeout(() => setDestroyAnimation(null), 1250);
          }, 350);
        } else if (evt.attackerDestroyed && evt.attackerCard) {
          setTimeout(() => {
            const attRefs = evt.attackerPlayer === 0 ? p0MonsterRefs : p1MonsterRefs;
            const attEl = attRefs.current[evt.attackerZone];
            const arenaRect = arenaRef.current?.getBoundingClientRect();
            let x = 0;
            let y = 0;
            if (attEl && arenaRect) {
              const r = attEl.getBoundingClientRect();
              x = r.left - arenaRect.left;
              y = r.top - arenaRect.top;
            }
            const fx = resolveDestructionByKiller(evt.attackerCard, evt.defenderCard);
            setDestroyAnimation({
              playerIndex: evt.attackerPlayer,
              zoneIndex: evt.attackerZone,
              card: evt.attackerCard,
              killerCard: evt.defenderCard,
              fx,
              x,
              y,
            });
            if (fx.soundAction && typeof soundManager[fx.soundAction] === 'function') {
              soundManager[fx.soundAction]();
            } else {
              soundManager.playDestroy();
            }
            setTimeout(() => setDestroyAnimation(null), 1250);
          }, 350);
        }
      };

      if (evt.trapTriggered) {
        // Magical Trap / Spell Effect Triggered in Battle:
        // Show the spell/trap effect window to explain the magical effect
        triggerSpellAnimation({
          playerIndex: 1 - evt.attackerPlayer,
          spellCard: evt.trapTriggered,
          effectMeta: {
            title: evt.trapTriggered.arabicName || evt.trapTriggered.name,
            desc: evt.trapTriggered.arabicDescription || evt.trapTriggered.description || 'تأثير الفخ السحري اشتغل وتصدى للهجوم!',
            type: 'trap_activation',
          },
        });
      }

      if (isOpponentAttacking) {
        // Direct In-Field Motion: Opponent Monster Lunges at Player
        soundManager.playBattleTurn();
        hapticManager.triggerCombatVibration('attack');

        setActiveAttackMotion({
          attackerPlayer: 1,
          attackerZone: evt.attackerZone,
          targetPlayer: 0,
          targetZone: evt.targetZone,
          isDirect: evt.isDirect,
          step: 'lunge',
        });

        // Fast, punchy transition to impact & projectile beam execution (180ms)
        setTimeout(() => {
          setActiveAttackMotion((curr) => (curr ? { ...curr, step: 'impact' } : null));
          runCombatExecution();
        }, 180);

        // Smoothly end card motion
        setTimeout(() => {
          setActiveAttackMotion(null);
        }, 1050);
      } else {
        // Player 0 is attacking:
        setActiveAttackMotion({
          attackerPlayer: 0,
          attackerZone: evt.attackerZone,
          targetPlayer: 1,
          targetZone: evt.targetZone,
          isDirect: evt.isDirect,
          step: 'lunge',
        });

        setTimeout(() => {
          setActiveAttackMotion((curr) => (curr ? { ...curr, step: 'impact' } : null));
          runCombatExecution();
        }, 180);

        setTimeout(() => {
          setActiveAttackMotion(null);
        }, 1050);
      }
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

  // Detect Life Points Changes for Blood Flash, Floating Damage Popups & Ghost Bars
  useEffect(() => {
    const target0 = state.players[0].lifePoints;
    const target1 = state.players[1].lifePoints;

    // Dynamically update music mood based on players' Life Points (switches to climax battle theme when in danger)
    soundManager.updateDuelMood(target0, target1);

    // Dynamic Combat Arena: Climax LP Trigger
    const minLp = Math.min(target0, target1);
    const climaxThreshold = soundManager.getClimaxTriggerLp() || 3500;
    if (
      (dynamicArenaMode === 'climax_only' || dynamicArenaMode === 'full_dynamic') &&
      minLp <= climaxThreshold &&
      minLp > 0 &&
      !hasClimaxWarpTriggeredRef.current
    ) {
      hasClimaxWarpTriggeredRef.current = true;
      const nextClimax = getNextClimaxArena(chosenArena?.id);
      if (nextClimax && nextClimax.id !== chosenArena?.id) {
        triggerArenaTransition(nextClimax, 'اشتعال المواجهة! تحول الساحة إلى ساحة الحسم', 'نقطة الحسم الحرجة');
        if (isMultiplayer && arenaSyncMode === 'synced') {
          connectionManager.send({
            type: 'DUEL_ARENA_SYNC',
            arenaId: nextClimax.id,
          });
        }
      }
    }

    // Player 0 LP Change
    if (target0 !== prevLpTrackerRef.current.p0) {
      const diff = target0 - prevLpTrackerRef.current.p0;
      prevLpTrackerRef.current.p0 = target0;
      const popupId = `pop-0-${Date.now()}-${Math.random()}`;

      setDamagePopups((prev) => [
        ...prev.slice(-3),
        { id: popupId, playerIndex: 0, amount: Math.abs(diff), isHeal: diff > 0 },
      ]);
      setTimeout(() => {
        setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 1300);

      if (diff < 0) {
        // Player 0 took damage!
        setLpPulseP0('loss');
        setDamageFlash({ playerIndex: 0, damage: Math.abs(diff), timestamp: Date.now() });
        setIsScreenShaking(true);
        soundManager.playDamage();
        hapticManager.triggerCombatVibration('damage', { damage: Math.abs(diff) });
        setTimeout(() => setIsScreenShaking(false), 450);
        setTimeout(() => setDamageFlash(null), 750);

        // Retain ghost bar at old level so the red blood chunk remains visible, then drains smoothly
        if (ghostTimerP0Ref.current) clearTimeout(ghostTimerP0Ref.current);
        ghostTimerP0Ref.current = setTimeout(() => {
          setGhostP0LP(target0);
        }, 850);
      } else {
        // Player 0 healed
        setLpPulseP0('heal');
        soundManager.playLifeUp();
        if (ghostTimerP0Ref.current) clearTimeout(ghostTimerP0Ref.current);
        setGhostP0LP(target0);
      }
      setTimeout(() => setLpPulseP0(null), 850);
    }

    // Player 1 (Opponent) LP Change
    if (target1 !== prevLpTrackerRef.current.p1) {
      const diff = target1 - prevLpTrackerRef.current.p1;
      prevLpTrackerRef.current.p1 = target1;
      const popupId = `pop-1-${Date.now()}-${Math.random()}`;

      setDamagePopups((prev) => [
        ...prev.slice(-3),
        { id: popupId, playerIndex: 1, amount: Math.abs(diff), isHeal: diff > 0 },
      ]);
      setTimeout(() => {
        setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 1300);

      if (diff < 0) {
        setLpPulseP1('loss');
        soundManager.playDamage();

        // Retain ghost bar at old level so the red blood chunk remains visible, then drains smoothly
        if (ghostTimerP1Ref.current) clearTimeout(ghostTimerP1Ref.current);
        ghostTimerP1Ref.current = setTimeout(() => {
          setGhostP1LP(target1);
        }, 850);
      } else {
        setLpPulseP1('heal');
        soundManager.playLifeUp();
        if (ghostTimerP1Ref.current) clearTimeout(ghostTimerP1Ref.current);
        setGhostP1LP(target1);
      }
      setTimeout(() => setLpPulseP1(null), 850);
    }

    // Battle background remains stable and fixed throughout the duel as requested (no automatic transitions)
  }, [state.players[0].lifePoints, state.players[1].lifePoints, state.activeFieldSpell, state.winner, chosenArena]);

  // Smooth animated Life Points counter with audio ticking
  useEffect(() => {
    const target0 = state.players[0].lifePoints;
    const target1 = state.players[1].lifePoints;

    const interval = setInterval(() => {
      let ticking = false;

      setDisplayedP0LP((prev) => {
        if (prev === target0) return prev;
        ticking = true;
        const diff = target0 - prev;
        const step = Math.sign(diff) * Math.max(30, Math.floor(Math.abs(diff) / 4));
        return Math.abs(diff) <= 30 ? target0 : prev + step;
      });

      setDisplayedP1LP((prev) => {
        if (prev === target1) return prev;
        ticking = true;
        const diff = target1 - prev;
        const step = Math.sign(diff) * Math.max(30, Math.floor(Math.abs(diff) / 4));
        return Math.abs(diff) <= 30 ? target1 : prev + step;
      });

      if (ticking) {
        soundManager.playLpTick();
      }
    }, 28);

    return () => clearInterval(interval);
  }, [state.players[0].lifePoints, state.players[1].lifePoints]);

  // Handle AI Turns
  useEffect(() => {
    const isBotTurn = isAiDuel || (
      isMultiplayer &&
      state.isTagMode &&
      connectionManager.role === 'host' &&
      state.currentTurnPlayer === 1 &&
      (multiplayerData?.slots?.[2]?.isBot || multiplayerData?.slots?.[3]?.isBot)
    );

    if (isBotTurn && state.currentTurnPlayer === 1 && state.winner === null && !isAiThinking) {
      setIsAiThinking(true);
      const diff = multiplayerData?.slots?.[2]?.botDifficulty || aiDifficulty || 'hard';
      const ai = new AIPlayer(1, diff);

      const aiEngineAdapter = isMultiplayer
        ? new Proxy(engine, {
            get(target, prop) {
              if (typeof target[prop] === 'function') {
                return (...args) => {
                  if (['normalSummon', 'setMonster', 'setSpellTrap', 'activateSpell', 'declareAttack', 'directAttack', 'advancePhase', 'endTurn'].includes(prop)) {
                    return executeAndBroadcast(prop, ...args);
                  }
                  return target[prop](...args);
                };
              }
              return target[prop];
            },
          })
        : engine;

      ai.takeTurn(aiEngineAdapter, 750, (plan) => {
        setAiTacticalPlan(plan);
      }).finally(() => {
        setIsAiThinking(false);
        setAiTacticalPlan(null);
      });
    }
  }, [state.currentTurnPlayer, state.winner, isAiDuel, isAiThinking, engine, aiDifficulty, isMultiplayer, state.isTagMode, multiplayerData]);

  const triggerAttackAnimation = (
    attackerPlayer,
    attackerZoneIdx,
    isDefenderMonster,
    defenderZoneIdx,
    damage,
    isShield,
    isDefenseShatter = false,
    damagePlayerIdx,
    attackerAttribute = 'PHARAOH',
    defenderAttribute = 'PHARAOH',
    attackerCard = null,
    defenderCard = null
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

        const attackFX = resolveAttackArchetype(attackerCard);
        const defenseFX = (isShield || isDefenseShatter)
          ? resolveDefenseArchetype(defenderCard, isShield, isDefenseShatter)
          : null;

        // Play distinctive attack sound based on card archetype
        if (attackFX.soundAction && typeof soundManager[attackFX.soundAction] === 'function') {
          soundManager[attackFX.soundAction]();
        } else {
          soundManager.playAttack();
        }

        setCombatAnimation({
          x1,
          y1,
          distance,
          angle,
          targetX: x2,
          targetY: y2,
          damage,
          isShield,
          isDefenseShatter,
          damagePlayerIdx,
          element: (attackerAttribute || 'pharaoh').toLowerCase(),
          defenderElement: (defenderAttribute || 'pharaoh').toLowerCase(),
          attackFX,
          defenseFX,
          attackerCard,
          defenderCard,
          isDirect: !isDefenderMonster,
          attackerPlayer,
        });

        if (!isDefenderMonster) {
          // Direct attack striking life points directly!
          setTimeout(() => {
            setDirectAttackVignette(true);
            soundManager.playDirectHit();
            hapticManager.triggerCombatVibration('damage', { damage });
            setIsScreenShaking(true);
            setTimeout(() => {
              setDirectAttackVignette(false);
              setIsScreenShaking(false);
            }, 650);
          }, 320);
        } else if (damage > 0) {
          setIsScreenShaking(true);
          setTimeout(() => {
            soundManager.playDamage();
            hapticManager.triggerCombatVibration('damage', { damage });
            setIsScreenShaking(false);
          }, 350);
        } else if (isDefenseShatter) {
          setTimeout(() => {
            soundManager.playShieldShatter();
            hapticManager.triggerCombatVibration('destroy');
          }, 350);
        } else if (isShield) {
          setTimeout(() => {
            soundManager.playShieldDeflect();
            hapticManager.triggerCombatVibration('magic');
          }, 350);
        }

        setTimeout(() => {
          setCombatAnimation(null);
        }, 1250);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSpellAnimation = (data) => {
    setSpellAnimation(data);
    soundManager.playMagic();
    hapticManager.triggerCombatVibration('magic');

    // Trigger visual impact effect over affected opponent zone(s)
    if (data.effectMeta?.targetAffected) {
      const { playerIndex, zoneIndex, actionText, effectType } = data.effectMeta.targetAffected;
      if (playerIndex === 1) {
        triggerOpponentEffectNotice(zoneIndex, actionText, effectType);
      }
    }

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

  const triggerMonsterEffectAnimation = (data) => {
    setMonsterEffectAnimation(data);
    soundManager.playMagic();
    hapticManager.triggerCombatVibration('magic');

    const cardName = (data.card?.name || '').toLowerCase();
    if (cardName.includes('cyber jar') || cardName.includes('ladybug') || cardName.includes('jigen') || cardName.includes('morphing jar #2')) {
      setIsScreenShaking(true);
      setTimeout(() => {
        soundManager.playDestroy();
        setIsScreenShaking(false);
      }, 500);
    } else if (cardName.includes('immortal') && data.trigger === 'flip') {
      soundManager.playLifeUp();
    } else if (cardName.includes('immortal') && data.trigger === 'onDestroy') {
      soundManager.playDamage();
    } else if (cardName.includes('needle ball') || cardName.includes('fire sorcerer') || cardName.includes('marshmallon') || cardName.includes('giant germ')) {
      setTimeout(() => {
        soundManager.playDamage();
      }, 350);
    } else if (cardName.includes('nimble momonga')) {
      soundManager.playLifeUp();
    }

    setTimeout(() => {
      setMonsterEffectAnimation(null);
    }, 2400);
  };

  const getCardActionState = (card) => {
    if (!card) return { canSummon: false, canSet: false, canActivate: false, reason: '', reqTributes: 0 };

    const mySlot = multiplayerData?.mySlot ?? 0;
    const isTagSequential = state.isTagMode && state.turnFlow === 'tag_sequential';
    const isMySlotActive = !isTagSequential || (isMultiplayer ? (state.tagActiveSlot === mySlot) : (state.tagActiveSlot === 0));

    if (isTagSequential && !isMySlotActive) {
      return { canSummon: false, canSet: false, canActivate: false, reason: 'مش دورك في التناوب دلوقتي يا بطل، ده دور زميلك', reqTributes: 0 };
    }

    const isMyTurn = state.currentTurnPlayer === 0;
    const isMainPhase = state.phase === 'MAIN1' || state.phase === 'MAIN2';
    const hasNormalSummonLeft = state.isTagMode
      ? (isMultiplayer ? (myTurnSummonCount === 0 && p0.normalSummonsRemaining > 0) : (p0.normalSummonsRemaining > 0))
      : (p0.normalSummonsRemaining > 0);
    const myMonstersCount = p0.monsterZones.filter((z) => z !== null).length;
    const emptyMonsterZoneExists = p0.monsterZones.some((z) => z === null);
    const emptySTZoneExists = p0.spellTrapZones.some((z) => z === null);

    if (card.type === 'monster') {
      const reqTributes = card.level >= 7 ? 2 : card.level >= 5 ? 1 : 0;

      if (!isMyTurn) {
        return { canSummon: false, reqTributes, reason: 'ليس دورك الآن' };
      }
      if (!isMainPhase) {
        return { canSummon: false, reqTributes, reason: 'الاستدعاء متاح في المرحلة الأولى أو الثانية فقط' };
      }
      if (!hasNormalSummonLeft) {
        return {
          canSummon: false,
          reqTributes,
          reason: state.isTagMode
            ? (myTurnSummonCount > 0
              ? 'نزّلت وحشك للدور ده خلاص يا بطل، ده دور صاحبك ينزل وحشه في الساحة!'
              : 'فريقكم نزّل الوحشين المسموح بيهم في الدور ده!')
            : 'استنفدت استدعاء الوحوش لهذا الدور (وحش واحد فقط في كل دور)',
        };
      }
      if (reqTributes > 0 && myMonstersCount < reqTributes) {
        return {
          canSummon: false,
          reqTributes,
          reason: `يتطلب تضحية بـ ${reqTributes} وحوش (لديك ${myMonstersCount} فقط في الساحة)`,
        };
      }
      if (reqTributes === 0 && !emptyMonsterZoneExists) {
        return { canSummon: false, reqTributes, reason: 'جميع خانات الوحوش ممتلئة (5/5)' };
      }
      return { canSummon: true, reqTributes, reason: '' };
    }

    if (card.type === 'spell') {
      const isFieldSpell =
        card.subType === 'field' ||
        ['yami', 'umi', 'sogen', 'forest', 'mountain', 'wasteland', 'gaia', 'molten', 'luminous', 'sanctuary'].some((k) =>
          (card.name || '').toLowerCase().includes(k)
        );
      if (!isMyTurn) {
        return { canActivate: false, canSet: false, reason: 'ليس دورك الآن' };
      }
      if (!isMainPhase) {
        return { canActivate: false, canSet: false, reason: 'تفعيل السحر متاح في المرحلة الأولى أو الثانية فقط' };
      }
      const canActivate = isFieldSpell || emptySTZoneExists;
      const canSet = emptySTZoneExists;
      return {
        canActivate,
        canSet,
        reason: !emptySTZoneExists && !isFieldSpell ? 'جميع خانات السحر والفخاخ ممتلئة (5/5)' : '',
      };
    }

    if (card.type === 'trap') {
      if (!isMyTurn) {
        return { canSet: false, reason: 'ليس دورك الآن' };
      }
      if (!isMainPhase) {
        return { canSet: false, reason: 'تثبيت الفخاخ متاح في المرحلة الأولى أو الثانية فقط' };
      }
      if (!emptySTZoneExists) {
        return { canSet: false, reason: 'جميع خانات السحر والفخاخ ممتلئة (5/5)' };
      }
      return { canSet: true, reason: '' };
    }

    return { canSummon: false, canSet: false, canActivate: false, reason: '' };
  };

  const handleHandCardClick = (index) => {
    if (state.currentTurnPlayer !== 0) return;

    const mySlot = multiplayerData?.mySlot ?? 0;
    const isTagSequential = state.isTagMode && state.turnFlow === 'tag_sequential';
    const isMySlotActive = !isTagSequential || (isMultiplayer ? (state.tagActiveSlot === mySlot) : (state.tagActiveSlot === 0));

    if (isTagSequential && !isMySlotActive) {
      showGameToast('مش دورك في التناوب دلوقتي يا بطل، استنى دورك!', 2200);
      return;
    }

    if (tributeSelection) setTributeSelection(null);

    const now = Date.now();
    const lastTap = lastHandTapRef.current;
    const isDoubleTap = quickSummonEnabled && lastTap.index === index && now - lastTap.timestamp < 480;
    lastHandTapRef.current = { index, timestamp: now };

    const card = p0.hand[index];
    if (!card) return;

    if (isDoubleTap) {
      setDoubleTapFeedbackIndex(index);
      setTimeout(() => setDoubleTapFeedbackIndex(null), 450);
      hapticManager.triggerCombatVibration('click');

      if (card.type === 'monster') {
        const actionState = getCardActionState(card);
        if (!actionState.canSummon) {
          showGameToast(actionState.reason, 2200);
          return;
        }
        if (actionState.reqTributes === 0) {
          handleSummon(quickSummonPos, null, index);
          showGameToast(
            quickSummonPos === 'face_up_attack'
              ? `استدعاء سريع في وضع الهجوم: ${card.name}!`
              : `وضع سريع في الدفاع المقلوب: ${card.name}!`,
            1800
          );
          return;
        } else {
          // Tribute monster: Enter tribute mode directly
          handleSummon(quickSummonPos, null, index);
          return;
        }
      } else if (card.type === 'spell') {
        const actionState = getCardActionState(card);
        if (!actionState.canActivate && !actionState.canSet) {
          showGameToast(actionState.reason || 'لا يمكن استخدام هذه الورقة الآن', 2200);
          return;
        }
        handleActivateSpell(index);
        return;
      } else if (card.type === 'trap') {
        const actionState = getCardActionState(card);
        if (!actionState.canSet) {
          showGameToast(actionState.reason || 'لا يمكن تثبيت الفخ الآن', 2200);
          return;
        }
        handleSetSpellTrap(null, index);
        showGameToast(`وضع فخ سريع: ${card.name}!`, 1800);
        return;
      }
    }

    // Single Tap: Select and lift card
    soundManager.playCardMove();
    hapticManager.vibrate([15]);
    setSelectedHandIndex(index === selectedHandIndex ? null : index);
    setSelectedFieldMonsterZone(null);
    setSelectedSetSTZone(null);
  };

  const handleCardTouchStart = (card) => {
    if (handLongPressTimerRef.current) clearTimeout(handLongPressTimerRef.current);
    handLongPressTimerRef.current = setTimeout(() => {
      hapticManager.triggerCombatVibration('click');
      soundManager.playClick();
      setInspectCard(card);
    }, 480);
  };

  const handleCardTouchEnd = () => {
    if (handLongPressTimerRef.current) {
      clearTimeout(handLongPressTimerRef.current);
      handLongPressTimerRef.current = null;
    }
  };

  const handlePlayerMonsterClick = (zoneIdx) => {
    if (state.currentTurnPlayer !== 0) return;

    // If currently in Tribute Selection Mode, clicking monster toggles selection
    if (tributeSelection) {
      handleTributeZoneClick(zoneIdx);
      return;
    }

    const slot = p0.monsterZones[zoneIdx];
    if (!slot) {
      if (
        selectedHandIndex !== null &&
        p0.hand[selectedHandIndex]?.type === 'monster'
      ) {
        const card = p0.hand[selectedHandIndex];
        const actionState = getCardActionState(card);
        if (!actionState.canSummon) {
          hapticManager.triggerCombatVibration('click');
          showGameToast(actionState.reason, 2200);
          return;
        }
        if (actionState.reqTributes > 0) {
          handleSummon('face_up_attack', null, selectedHandIndex);
          return;
        }
        handleSummon('face_up_attack', zoneIdx, selectedHandIndex);
      }
      return;
    }

    if (state.phase === 'BATTLE_STEP') {
      if (slot.hasAttacked) {
        hapticManager.triggerCombatVibration('click');
        alert('الوحش ده ضرب خلاص في الدور ده يا بطل، ارتاح واستنى الدور الجاي!');
        return;
      }
      if (slot.position !== 'face_up_attack') {
        hapticManager.triggerCombatVibration('click');
        alert('الوحش ده متداري في وضع الدفاع يا صاحبي، ماينفعش يضرب وهو كده!');
        return;
      }
    }

    soundManager.playClick();
    setSelectedFieldMonsterZone(zoneIdx === selectedFieldMonsterZone ? null : zoneIdx);
    setSelectedHandIndex(null);
    setSelectedSetSTZone(null);
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
      showGameToast(`لازم تحدد ${tributeSelection.requiredTributes} وحوش من ساحتك عشان تضحي بيهم يا بطل!`, 2200);
      return;
    }

    const hasTributeSummonLeft = state.isTagMode
      ? (isMultiplayer ? (myTurnSummonCount === 0 && p0.normalSummonsRemaining > 0) : (p0.normalSummonsRemaining > 0))
      : (p0.normalSummonsRemaining > 0);

    if (!hasTributeSummonLeft) {
      showGameToast(
        state.isTagMode
          ? 'نزّلت وحشك للدور ده خلاص يا بطل!'
          : 'لقد استنفدت استدعاء الوحوش لهذا الدور (وحش واحد فقط في كل دور)',
        2400
      );
      setTributeSelection(null);
      return;
    }

    try {
      const { handIndex, position, selectedZones, card } = tributeSelection;
      const targetZone = selectedZones[0];
      const sacrificedCards = selectedZones
        .map((z) => p0.monsterZones[z]?.card)
        .filter(Boolean);

      // 1. Trigger Full-screen Legendary Sacrificial Cut-in (Stage 1: Sacrificing)
      setTributeAscensionAnimation({
        summoningCard: card,
        sacrificedCards,
        stage: 'sacrificing',
        playerName: p0.name,
        isOpponent: false,
      });

      // Sound & Haptic FX for Sacrificial Dissolution
      soundManager.playDestroy();
      soundManager.play('magic');
      hapticManager.triggerCombatVibration('destroy');
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 450);

      // 2. Clear tribute selection state so UI returns to normal underneath
      setTributeSelection(null);

      // 3. Stage 2 after 950ms: Souls have erupted, Portal opens, Ascended Hero Emerges!
      setTimeout(() => {
        try {
          executeAndBroadcast(
            'normalSummon',
            handIndex,
            targetZone,
            position,
            selectedZones
          );
          setMyTurnSummonCount((prev) => prev + 1);
        } catch (err) {
          console.error('Tribute summon execution error:', err);
        }

        setTributeAscensionAnimation((prev) =>
          prev ? { ...prev, stage: 'ascending' } : null
        );

        soundManager.playSummon();
        if (card && (card.atk >= 2500 || card.level >= 7)) {
          setIsScreenShaking(true);
          hapticManager.triggerCombatVibration('powerSummon', { atk: card.atk });
          setTimeout(() => setIsScreenShaking(false), 650);
        } else {
          hapticManager.triggerCombatVibration('powerSummon', { atk: 2000 });
        }

        // 4. Conclude Cut-in after heroic showcase has completed
        setTimeout(() => {
          setTributeAscensionAnimation(null);
        }, 1800);
      }, 950);
    } catch (e) {
      showGameToast(e.message, 2400);
      setTributeSelection(null);
      setTributeAscensionAnimation(null);
    }
  };

  const handleCancelTribute = () => {
    setTributeSelection(null);
    soundManager.playClick();
  };

  const handleSummon = (position = 'face_up_attack', explicitZone = null, explicitHandIndex = null) => {
    const handIdx = explicitHandIndex !== null && explicitHandIndex !== undefined ? explicitHandIndex : selectedHandIndex;
    if (handIdx === null || handIdx === undefined) return;
    const card = p0.hand[handIdx];
    if (!card) return;

    if (card.type !== 'monster') {
      showGameToast('هذه ورقة سحر أو فخ وليست وحشاً!', 2000);
      return;
    }

    const actionState = getCardActionState(card);
    if (!actionState.canSummon) {
      hapticManager.triggerCombatVibration('click');
      showGameToast(actionState.reason, 2400);
      return;
    }

    const requiredTributes = actionState.reqTributes;
    if (requiredTributes > 0) {
      // Enter Tribute Selection Mode
      setTributeSelection({
        handIndex: handIdx,
        card,
        position,
        requiredTributes,
        selectedZones: [],
      });
      setSelectedHandIndex(null);
      soundManager.playClick();
      return;
    }

    const emptyZone = explicitZone !== null && p0.monsterZones[explicitZone] === null
      ? explicitZone
      : p0.monsterZones.findIndex((z) => z === null);
    if (emptyZone === -1) {
      showGameToast('الساحة ممتلئة بالوحوش! لا يوجد مكان شاغر.', 2200);
      return;
    }

    try {
      executeAndBroadcast('normalSummon', handIdx, emptyZone, position, []);
      setMyTurnSummonCount((prev) => prev + 1);
      soundManager.playSummon();
      if (card.atk >= 2500 || card.level >= 7) {
        setIsScreenShaking(true);
        hapticManager.triggerCombatVibration('powerSummon', { atk: card.atk });
        setTimeout(() => setIsScreenShaking(false), 550);
      }
      setSelectedHandIndex(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSetSpellTrap = (explicitZone = null, explicitHandIndex = null) => {
    const handIdx = explicitHandIndex !== null && explicitHandIndex !== undefined ? explicitHandIndex : selectedHandIndex;
    if (handIdx === null || handIdx === undefined) return;
    const card = p0.hand[handIdx];
    if (!card) return;

    if (card.type !== 'spell' && card.type !== 'trap') {
      alert('حاسب يا صاحبي! كروت الوحوش بتنزل في خانات الوحوش بس مش في السحر والفخاخ.');
      return;
    }

    const emptyST = explicitZone !== null && p0.spellTrapZones[explicitZone] === null
      ? explicitZone
      : p0.spellTrapZones.findIndex((z) => z === null);
    if (emptyST === -1) {
      alert('خانات السحر والفخاخ عندك مليانة على الآخر يا بطل!');
      return;
    }
    try {
      executeAndBroadcast('setSpellTrap', handIdx, emptyST);
      soundManager.playCardMove();
      setSelectedHandIndex(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleActivateSpell = (explicitHandIndex = null) => {
    const handIdx = explicitHandIndex !== null && explicitHandIndex !== undefined ? explicitHandIndex : selectedHandIndex;
    if (handIdx === null || handIdx === undefined) return;
    const card = p0.hand[handIdx];
    if (!card) return;

    const name = (card.name || '').toLowerCase();

    // 1. Monster Reborn: Revive monster from either graveyard
    if (name.includes('monster reborn')) {
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      const p1Monsters = p1.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'opponent' }));
      const allRevivable = [...p0Monsters, ...p1Monsters];

      if (allRevivable.length === 0) {
        alert('المقابر فاضية يا صاحبي ومافيهاش ولا وحش تقدر تصحيه دلوقتي!');
        return;
      }

      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('الساحة عندك مفولة بالوحوش يا كابتن! مافيش مكان فاضي تستقبل فيه الوحش المستدعى.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'ولادة الوحش (Monster Reborn)',
        subtitle: 'نقيلك وحش من المقبرة علشان ينزل ساحتك فوراً',
        actionLabel: 'صحّي الوحش ده',
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
        alert('دمك مش مكفّي يا غالي تدفع 800 نقطة حياة للدفن المبكر!');
        return;
      }
      const p0Monsters = p0.graveyard.filter((c) => c.type === 'monster').map((c) => ({ ...c, source: 'player' }));
      if (p0Monsters.length === 0) {
        alert('مقبرتك فاضية يا بطل ومافيهاش وحوش تقدر ترجعها.');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('الساحة عندك مفولة بالوحوش يا كابتن! مافيش مكان فاضي تستقبل فيه الوحش.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'الدفن المبكر (Premature Burial)',
        subtitle: 'ادفع 800 نقطة حياة واختار وحش من مقبرتك تنزله الملعب',
        actionLabel: 'ادفع 800 وصحّيه',
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
        alert('مقبرتك فاضية يا بطل ومافيهاش وحوش تقدر ترجعها بالقبر السطحي.');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('الساحة عندك مفولة بالوحوش يا كابتن! مافيش مكان فاضي للوحش.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'القبر السطحي (The Shallow Grave)',
        subtitle: 'نقيلك وحش من مقبرتك ونزله مقلوب في وضع الدفاع',
        actionLabel: 'نزّله مقلوب',
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
        alert('مقبرتك فاضية يا صاحبي ومافيهاش وحوش تقدر تسترجعها لإيدك.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'استعادة الوحش من المقبرة',
        subtitle: 'اختار وحش من مقبرتك ترجعه لإيدك تاني',
        actionLabel: 'رجّعه لإيدك',
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
        alert('مافيش كروت سحر في مقبرتك علشان ترجعها لإيدك يا كابتن.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'استعادة كارت سحر من المقبرة',
        subtitle: 'اختار كارت سحر من مقبرتك ترجعه لإيدك',
        actionLabel: 'رجّع السحر لإيدك',
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

    // 6. Change of Heart: Take control of 1 opponent monster
    if (name.includes('change of heart')) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null);

      if (oppMonsters.length === 0) {
        alert('الخصم ماعندوش ولا وحش في الساحة تسيطر عليه يا صاحبي!');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('خانات الوحوش في ساحتك مفولة ومافيش مكان تستقبل فيه وحش الخصم.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'تغيير القلب (Change of Heart)',
        subtitle: 'اختار وحش من عند الخصم تسيطر عليه وتجيبه عندك',
        actionLabel: 'هات الوحش ده',
        options: oppMonsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { targetZoneIndex: chosenCard.zoneIndex });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 7. Snatch Steal: Take control of 1 opponent face-up monster
    if (name.includes('snatch steal')) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null && m.slot.position !== 'face_down_defense');

      if (oppMonsters.length === 0) {
        alert('مافيش وحوش مكشوفة في ساحة الخصم تقدر تسرقها يا بطل.');
        return;
      }
      const emptyZone = p0.monsterZones.findIndex((z) => z === null);
      if (emptyZone === -1) {
        alert('خانات الوحوش في ساحتك مفولة ومافيش مكان تستقبل فيه وحش الخصم.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'سرقة خاطفة (Snatch Steal)',
        subtitle: 'اختار وحش مكشوف عند الخصم تضمه لساحتك',
        actionLabel: 'اسرق الوحش ده',
        options: oppMonsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { targetZoneIndex: chosenCard.zoneIndex });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 8. Tribute to The Doomed: Destroy 1 target opponent monster
    if (name.includes('tribute to the doomed')) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null);

      if (oppMonsters.length === 0) {
        alert('مافيش وحوش عند الخصم في الساحة علشان تدمرها يا غالي.');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'قربان للهلاك (Tribute to The Doomed)',
        subtitle: 'اختار الوحش اللي عاوز تفرتكه وتدمره عند الخصم',
        actionLabel: 'دمّر الوحش ده',
        options: oppMonsters,
        handIndex: currentHandIdx,
        onConfirm: (chosenCard) => {
          setCardSelectModal(null);
          setSelectedHandIndex(null);
          try {
            executeAndBroadcast('activateSpell', currentHandIdx, { targetZoneIndex: chosenCard.zoneIndex });
          } catch (e) {
            alert(e.message);
          }
        },
      });
      return;
    }

    // 9. Riryoku: Reduce 1 opponent monster ATK by half, add to 1 ally monster
    if (name.includes('riryoku')) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null && m.slot.position !== 'face_down_defense');

      const myMonsters = p0.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null && m.slot.position !== 'face_down_defense');

      if (oppMonsters.length === 0) {
        alert('مافيش وحوش مكشوفة عند الخصم علشان تسحب نص هجومها يا بطل.');
        return;
      }
      if (myMonsters.length === 0) {
        alert('لازم يكون عندك وحش مكشوف في الساحة علشان ياخد نقاط الهجوم يا كابتن!');
        return;
      }

      const currentHandIdx = handIdx;
      setCardSelectModal({
        isOpen: true,
        title: 'ريوريوكو - الخطوة الأولى',
        subtitle: 'اختار وحش من عند الخصم تسحب نص هجومه',
        actionLabel: 'اسحب نص هجومه',
        options: oppMonsters,
        handIndex: currentHandIdx,
        onConfirm: (victimCard) => {
          setCardSelectModal({
            isOpen: true,
            title: 'ريوريوكو - الخطوة الثانية',
            subtitle: `اختار وحشك اللي هياخد نص هجوم ${victimCard.name}`,
            actionLabel: 'زوّد وحشك دلوقتي',
            options: myMonsters,
            handIndex: currentHandIdx,
            onConfirm: (allyCard) => {
              setCardSelectModal(null);
              setSelectedHandIndex(null);
              try {
                executeAndBroadcast('activateSpell', currentHandIdx, {
                  opponentTargetIndex: victimCard.zoneIndex,
                  allyTargetIndex: allyCard.zoneIndex,
                });
              } catch (e) {
                alert(e.message);
              }
            },
          });
        },
      });
      return;
    }

    // 10. Equip / Buff Spells: Axe of Despair, Mage Power, United We Stand, etc.
    const isBuffSpell =
      name.includes('axe of despair') ||
      name.includes('mage power') ||
      name.includes('united we stand') ||
      name.includes('nuzzler') ||
      name.includes('unicorn') ||
      name.includes('blade') ||
      name.includes('sword') ||
      name.includes('gaia') ||
      name.includes('power');

    if (isBuffSpell) {
      const myMonsters = p0.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m, currentAtk: m?.currentAtk }))
        .filter((m) => m.slot !== null);

      if (myMonsters.length === 0) {
        alert('مافيش وحوش في ساحتك تزودها بالسحر ده يا كابتن، نزّل وحش الأول!');
        return;
      }

      if (myMonsters.length > 1) {
        const currentHandIdx = handIdx;
        setCardSelectModal({
          isOpen: true,
          title: `تزويد بالسحر: ${card.arabicName || card.name}`,
          subtitle: 'اختار الوحش اللي في ساحتك علشان تزوّده بالسحر ده',
          actionLabel: 'زوّد الوحش ده',
          options: myMonsters,
          handIndex: currentHandIdx,
          onConfirm: (chosenCard) => {
            setCardSelectModal(null);
            setSelectedHandIndex(null);
            try {
              executeAndBroadcast('activateSpell', currentHandIdx, { targetZoneIndex: chosenCard.zoneIndex });
            } catch (e) {
              alert(e.message);
            }
          },
        });
        return;
      }
    }

    // Standard immediate execution
    try {
      executeAndBroadcast('activateSpell', handIdx);
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
        alert('حاسب يا بطل! لازم تخلص على وحوش الخصم اللي قدامك في الساحة الأول قبل أي حاجة!');
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
      alert('ماينفعش تضرب مباشر يا صاحبي طول ما الخصم واقف له وحوش تحميه، خلّص على وحوشه الأول!');
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
    const slot = p0.monsterZones[selectedFieldMonsterZone];
    if (!slot) return;

    const isFaceDown = slot.position === 'face_down_defense';
    const card = slot.card;
    const name = (card?.name || '').toLowerCase();

    // Check if monster has a targeted flip effect
    const isTargetedFlip =
      isFaceDown &&
      card?.subType === 'effect' &&
      (name.includes('man-eater bug') ||
        name.includes('old vindictive magician') ||
        name.includes('hane-hane') ||
        name.includes('penguin soldier'));

    if (isTargetedFlip) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null);

      if (oppMonsters.length > 0) {
        const currentZone = selectedFieldMonsterZone;
        const actionWord = name.includes('hane') || name.includes('penguin') ? 'إرجاعه ليد الخصم' : 'تدميره';
        setCardSelectModal({
          isOpen: true,
          title: `تأثير قلب: ${card.arabicName || card.name}`,
          subtitle: `اختار وحش الخصم اللي عاوز ${actionWord}`,
          actionLabel: `أكّد ${actionWord}`,
          options: oppMonsters,
          onConfirm: (chosenCard) => {
            setCardSelectModal(null);
            setSelectedFieldMonsterZone(null);
            try {
              executeAndBroadcast('changePosition', currentZone, { targetZoneIndex: chosenCard.zoneIndex });
              soundManager.playCardMove();
            } catch (e) {
              alert(e.message);
            }
          },
        });
        return;
      }
    }

    try {
      executeAndBroadcast('changePosition', selectedFieldMonsterZone);
      soundManager.playCardMove();
      setSelectedFieldMonsterZone(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleActivateSetST = (zoneIndex) => {
    const slot = p0.spellTrapZones[zoneIndex];
    if (!slot) return;
    const card = slot.card;
    const name = (card?.name || '').toLowerCase();

    // Check if card targets an opponent monster
    const isTargetedOpponent =
      name.includes('spellbinding') ||
      name.includes('shadow spell') ||
      name.includes('tribute to the doomed');

    if (isTargetedOpponent) {
      const oppMonsters = p1.monsterZones
        .map((m, idx) => ({ ...m?.card, zoneIndex: idx, slot: m }))
        .filter((m) => m.slot !== null && (name.includes('shadow spell') ? m.slot.position !== 'face_down_defense' : true));

      if (oppMonsters.length > 0) {
        setSelectedSetSTZone(null);
        setInspectCard(null);
        setCardSelectModal({
          isOpen: true,
          title: `تفعيل: ${card.arabicName || card.name}`,
          subtitle: 'اختار وحش الخصم اللي هتنزل عليه التأثير',
          actionLabel: 'نفّذ التأثير عليه',
          options: oppMonsters,
          onConfirm: (chosenCard) => {
            setCardSelectModal(null);
            try {
              executeAndBroadcast('activateSetSpellTrap', zoneIndex, { targetZoneIndex: chosenCard.zoneIndex }, 0);
            } catch (e) {
              alert(e.message);
            }
          },
        });
        return;
      }
    }

    setSelectedSetSTZone(null);
    setInspectCard(null);
    try {
      executeAndBroadcast('activateSetSpellTrap', zoneIndex, null, 0);
    } catch (e) {
      alert(e.message);
    }
  };

  const selectedCard = selectedHandIndex !== null ? p0.hand[selectedHandIndex] : null;
  const selectedMonsterSlot = selectedFieldMonsterZone !== null ? p0.monsterZones[selectedFieldMonsterZone] : null;

  const isLight = theme === 'light';
  const arenaPalette = getArenaPalette(chosenArena, theme);
  const activeFieldKey = state.activeFieldSpell?.key || chosenArena?.fieldKey || 'default';

  return (
    <div
      className={`duel-screen-root ${isScreenShaking ? 'screen-shake' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Dual-Layer Cinematic Background Crossfade Viewport */}
      <div
        className="duel-bg-viewport"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {crossfadeState.prevBg && (
          <div
            className="duel-bg-layer duel-bg-prev"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${crossfadeState.prevBg}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 38%',
              backgroundRepeat: 'no-repeat',
              filter: isLight
                ? 'contrast(1.03) brightness(1.02)'
                : 'contrast(1.06) brightness(1.04) saturate(1.08)',
              opacity: crossfadeState.isFading ? 0 : 1,
              transition: 'opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          />
        )}
        <div
          className={`duel-bg-layer duel-bg-current ${crossfadeState.isFading ? 'duel-bg-entering' : ''}`}
          key={crossfadeState.currBg}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${crossfadeState.currBg}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 38%',
            backgroundRepeat: 'no-repeat',
            filter: isLight
              ? 'contrast(1.03) brightness(1.02)'
              : 'contrast(1.06) brightness(1.04) saturate(1.08)',
            opacity: 1,
            transition: 'opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />
      </div>

      {/* Pharaonic Hieroglyphic Temple Overlay with Dynamic Field Aura */}
      <PharaohHieroglyphOverlay fieldKey={activeFieldKey} theme={theme} palette={arenaPalette} />
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
          background: isLight ? 'rgba(245, 238, 219, 0.88)' : 'rgba(12, 10, 7, 0.82)',
          zIndex: 50,
          flexShrink: 0,
          gap: 8,
          boxShadow: isLight ? '0 2px 10px rgba(100, 75, 25, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.45)',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Left: Opponent Avatar, Name & Life Points */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-text-gold)', whiteSpace: 'nowrap' }}>
                {state.isTagMode ? `${p1.name} & ${p1.teammateName || 'المنافس 2'}` : p1.name}
              </span>
              {state.isTagMode && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    whiteSpace: 'nowrap',
                  }}
                >
                  تحالف الخصوم
                </span>
              )}
              {isAiDuel && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: 'rgba(240, 203, 100, 0.15)',
                    border: '1px solid var(--pharaoh-gold-bright)',
                    color: 'var(--pharaoh-gold-bright)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {AI_DIFFICULTIES[aiDifficulty]?.shortName || 'صعوبة عالية'}
                </span>
              )}
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
                title="شوف مقبرة الخصم"
              >
                <GraveyardIcon size={11} color="#f87171" />
                <span>المقبرة ({p1.graveyard.length})</span>
              </button>
            </div>
            <div
              ref={p1LpRef}
              className={`lp-gauge-card ${displayedP1LP <= 2000 ? 'lp-danger-active' : ''} ${
                lpPulseP1 === 'loss' ? 'lp-loss-flash' : ''
              } ${
                selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP' && p1.monsterZones.every((m) => m === null)
                  ? 'p1-direct-attack-beacon'
                  : ''
              } ${activeAttackMotion?.isDirect && activeAttackMotion?.targetPlayer === 1 && activeAttackMotion?.step === 'impact' ? 'lp-impact-shake' : ''}`}
              onClick={() => {
                if (selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP') {
                  handleDirectAttack();
                }
              }}
              title={
                selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP' && p1.monsterZones.every((m) => m === null)
                  ? 'دوس هنا عشان تضرب ضربة مباشرة'
                  : undefined
              }
            >
              {/* Direct attack prompt badge when open */}
              {selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP' && p1.monsterZones.every((m) => m === null) && (
                <div className="direct-attack-prompt-badge">
                  ضربة مباشرة!
                </div>
              )}

              {/* Floating Combat Damage Numbers beside P1 LP */}
              {damagePopups
                .filter((p) => p.playerIndex === 1)
                .map((popup) => (
                  <div
                    key={popup.id}
                    className={`floating-damage-popup ${popup.isHeal ? 'floating-damage-heal' : 'floating-damage-loss'}`}
                    style={{ left: '50%', top: '50%' }}
                  >
                    {popup.isHeal ? `+${popup.amount}` : `-${popup.amount}`}
                  </div>
                ))}

              <span
                className={`lp-value-text ${lpPulseP1 === 'loss' ? 'pulse-loss' : lpPulseP1 === 'heal' ? 'pulse-heal' : ''}`}
                style={{
                  fontSize: 'clamp(12px, 3.2vw, 15px)',
                  color: displayedP1LP <= 2000 ? '#ef4444' : '#f87171',
                }}
              >
                LP {displayedP1LP}
              </span>

              {/* Sculpted Track with Ghost & Fill Bars */}
              <div className="lp-gauge-track lp-gauge-track-p1">
                {/* Ghost Trailing Bar (Red Blood Depletion Chunk) */}
                <div
                  className="lp-bar-ghost"
                  style={{
                    width: `${Math.max(0, Math.min(100, (ghostP1LP / maxLP) * 100))}%`,
                  }}
                />
                {/* Active Dynamic Fill Bar */}
                <div
                  className={`lp-bar-fill ${
                    displayedP1LP > (maxLP * 0.5) ? 'lp-bar-high' : displayedP1LP > (maxLP * 0.25) ? 'lp-bar-mid' : 'lp-bar-low'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (displayedP1LP / maxLP) * 100))}%`,
                  }}
                >
                  <div className="lp-bar-shimmer" />
                </div>
                {/* Bleeding Cut / Sparks at severed health border */}
                {displayedP1LP < ghostP1LP && (
                  <div
                    className="lp-bleed-spark"
                    style={{
                      right: `${Math.max(0, Math.min(100, (displayedP1LP / maxLP) * 100))}%`,
                    }}
                  />
                )}
                {/* Visual Segments */}
                <div className="lp-segment-ticks">
                  <div className="lp-tick" />
                  <div className="lp-tick" />
                </div>
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
            onClick={handleCycleArena}
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
            title={`حلبة القتال: ${chosenArena?.name || 'ساحة المبارزة'} - دوس للتبديل السريع`}
          >
            <ArenaPillarIcon size={16} />
          </button>

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
            ? 'linear-gradient(180deg, rgba(245, 238, 219, 0.6) 0%, rgba(245, 238, 219, 0.16) 75%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(14, 11, 7, 0.65) 0%, rgba(14, 11, 7, 0.18) 75%, transparent 100%)',
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
        className="duel-arena-field-mat"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '6px 14px',
          position: 'relative',
          margin: '2px 8px',
          '--arena-primary': arenaPalette.primary,
          '--arena-secondary': arenaPalette.secondary,
          '--arena-highlight': arenaPalette.highlight,
          '--arena-slot-border': arenaPalette.slotBorder,
          '--arena-slot-bg': arenaPalette.slotBg,
          '--arena-slot-glow': arenaPalette.slotGlow,
          '--arena-border': arenaPalette.arenaBorder,
          '--arena-mat-glow': arenaPalette.arenaMatGlow,
          '--arena-divider-bg': arenaPalette.dividerBg,
          '--arena-mote-color': arenaPalette.moteColor,
        }}
      >
        {/* Ornate Illuminated Arena Corner Accents */}
        <div className="arena-corner-bracket arena-corner-tl" />
        <div className="arena-corner-bracket arena-corner-tr" />
        <div className="arena-corner-bracket arena-corner-bl" />
        <div className="arena-corner-bracket arena-corner-br" />

        {/* Dynamic Suspense & Excitement Atmosphere in the Background */}
        <div className="arena-ambient-motes" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={`mote-${i}`}
              className="mystic-floating-particle"
              style={{
                left: `${(i * 7.1 + 3.5) % 96}%`,
                animationDelay: `${(i * 0.42) % 4}s`,
                animationDuration: `${3.8 + (i % 5) * 0.8}s`,
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                backgroundColor: arenaPalette.moteColor,
                boxShadow: `0 0 8px ${arenaPalette.moteColor}`,
              }}
            />
          ))}
        </div>

        <div
          className={`arena-dynamic-tension ${
            displayedP0LP <= 2000 || displayedP1LP <= 2000
              ? 'tension-danger'
              : state.phase === 'BATTLE_STEP'
              ? 'tension-battle'
              : ''
          }`}
          aria-hidden="true"
        />
        {/* Opponent Card Descent Animation Layer */}
        {opponentCardDescent && (
          <div
            className="opponent-card-descending"
            style={{
              '--start-x': `${opponentCardDescent.startX}px`,
              '--start-y': `${opponentCardDescent.startY}px`,
              '--target-x': `${opponentCardDescent.targetX}px`,
              '--target-y': `${opponentCardDescent.targetY}px`,
              width: opponentCardDescent.width,
              height: opponentCardDescent.height,
              borderRadius: 5,
              overflow: 'hidden',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.95), 0 8px 24px rgba(0, 0, 0, 0.8)',
              border: '2px solid var(--pharaoh-gold-bright, #facc15)',
              background: '#150f09',
            }}
          >
            <img
              src={
                opponentCardDescent.isSet
                  ? '/assets/card_back.png'
                  : getCardImageUrl(opponentCardDescent.card, 'full')
              }
              alt="Descending Card"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                const fallback = getCardImageUrl(opponentCardDescent.card, 'art');
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                } else {
                  e.target.src = '/assets/card_back.png';
                }
              }}
            />
          </div>
        )}

        {/* Opponent Summon Shockwave & Floating Badge Layer */}
        {opponentSummonShockwave && (
          <>
            <div
              className="opponent-summon-shockwave"
              style={{
                left: opponentSummonShockwave.x,
                top: opponentSummonShockwave.y,
              }}
            />
            <div
              className="opponent-summon-badge"
              style={{
                left: opponentSummonShockwave.x,
                top: Math.max(10, opponentSummonShockwave.y - 56),
              }}
            >
              {opponentSummonShockwave.badgeText}
            </div>
          </>
        )}

        {/* Reticle for Opponent Attack Target (Locked inside Arena) */}
        {opponentAttackAlert && opponentAttackAlert.targetScreenX > 0 && (
          <div
            className="opponent-lockon-reticle"
            style={{
              left: opponentAttackAlert.targetScreenX,
              top: opponentAttackAlert.targetScreenY,
              width: Math.max(76, opponentAttackAlert.targetWidth + 16),
              height: Math.max(76, opponentAttackAlert.targetHeight + 16),
            }}
          />
        )}

        {/* Spectral Monster Phantom Direct Attack Hologram Projection */}
        {spectralPhantom && (
          <div className="spectral-phantom-wrapper">
            <div
              className="spectral-phantom-clone"
              style={{
                '--startX': `${spectralPhantom.startX}px`,
                '--startY': `${spectralPhantom.startY}px`,
                '--dx': `${spectralPhantom.dx}px`,
                '--dy': `${spectralPhantom.dy}px`,
              }}
            >
              <div className="phantom-trail-2" />
              <div className="phantom-trail-1" />
              <div className="phantom-energy-aura" />
              <div className="phantom-img-container">
                <img
                  src={getCardImageUrl(spectralPhantom.card, 'art')}
                  alt={spectralPhantom.card?.name || 'Phantom Attack'}
                  className="phantom-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getCardImageUrl(spectralPhantom.card, 'full');
                  }}
                />
              </div>
            </div>
            <div
              className="phantom-impact-burst"
              style={{
                '--startX': `${spectralPhantom.startX}px`,
                '--startY': `${spectralPhantom.startY}px`,
                '--dx': `${spectralPhantom.dx}px`,
                '--dy': `${spectralPhantom.dy}px`,
              }}
            />
          </div>
        )}

        {/* Full-Screen Direct Attack Danger Vignette Pulse */}
        {directAttackVignette && <div className="direct-attack-vignette" />}

        {/* Active Combat Beam & Shield Animations Layer */}
        {combatAnimation && (
          <>
            {/* Dedicated Trajectory Container preserving (x1, y1) origin and angle solidly */}
            <div
              className="combat-trajectory"
              style={{
                left: combatAnimation.x1,
                top: combatAnimation.y1,
                width: combatAnimation.distance,
                transform: `rotate(${combatAnimation.angle}deg)`,
                transformOrigin: '0 50%',
              }}
            >
              {/* 1. Muzzle Energy Aperture bursting right out of the Attacker Card face */}
              <div className={`combat-card-launch-muzzle muzzle-${combatAnimation.attackFX?.archetype || combatAnimation.element || 'pharaoh'}`}>
                <div className="launch-core-flash" />
                <div className="launch-shockwave-ring" />
                <div className="launch-energy-burst" />
              </div>

              {/* 2. Attack Ray Stream extending from 0% to 100% */}
              <div className={`attack-ray-stream ${combatAnimation.attackFX?.beamClass || (combatAnimation.element || 'pharaoh')}`} />

              {/* 3. Traveling Projectiles moving from 0% to 100% at full, unsquashed dimensions */}
              {/* EARTH / ROCK: Rising Mountain Spires & Rolling Boulder Erupting toward target */}
              {combatAnimation.attackFX?.archetype === 'rock' && (
                <div className="traveling-projectile projectile-earth">
                  <div className="mountain-spire spire-1" />
                  <div className="mountain-spire spire-2" />
                  <div className="mountain-spire spire-3" />
                  <div className="mountain-spire spire-4" />
                  <div className="rolling-boulder-meteor" />
                </div>
              )}

              {/* LIGHT: Blinding Solar Spear & Expanding Photon Halos */}
              {combatAnimation.attackFX?.archetype === 'light' && (
                <div className="traveling-projectile projectile-light">
                  <div className="light-spear-head" />
                  <div className="photon-halo halo-1" />
                  <div className="photon-halo halo-2" />
                  <div className="photon-halo halo-3" />
                </div>
              )}

              {/* FIRE / DRAGON: Roaring Flame Dragon Head */}
              {combatAnimation.attackFX?.archetype === 'dragon' && (
                <div className="traveling-projectile projectile-fire">
                  <div className="dragon-fire-head" />
                </div>
              )}

              {/* WATER / AQUA: Surging Tidal Wave & Foaming Whirlpool */}
              {combatAnimation.attackFX?.archetype === 'aqua' && (
                <div className="traveling-projectile projectile-water">
                  <div className="tidal-serpent-crest" />
                  <div className="water-vortex-ring ring-1" />
                  <div className="water-vortex-ring ring-2" />
                </div>
              )}

              {/* DARK / FIEND: Crawling Shadow Tendrils & Demon Void Maw */}
              {combatAnimation.attackFX?.archetype === 'fiend' && (
                <div className="traveling-projectile projectile-dark">
                  <div className="dark-void-maw" />
                </div>
              )}

              {/* WIND: Screaming Emerald Tornado Cyclone */}
              {combatAnimation.attackFX?.archetype === 'wind' && (
                <div className="traveling-projectile projectile-wind">
                  <div className="tornado-cyclone-head" />
                </div>
              )}

              {/* THUNDER: High-Voltage Plasma Spark Dart */}
              {combatAnimation.attackFX?.archetype === 'thunder' && (
                <div className="traveling-projectile projectile-thunder">
                  <div className="lightning-plasma-bolt" />
                </div>
              )}

              {/* WARRIOR: Flying Crystalline Phantom Katana / Blade Thrust */}
              {combatAnimation.attackFX?.archetype === 'warrior' && (
                <div className="traveling-projectile projectile-warrior">
                  <div className="warrior-blade-blade" />
                </div>
              )}

              {/* MACHINE: Pulsed Railgun Laser Dart & Cyber Rings */}
              {combatAnimation.attackFX?.archetype === 'machine' && (
                <div className="traveling-projectile projectile-machine">
                  <div className="railgun-plasma-dart" />
                  <div className="cyber-capacitor-ring c-ring-1" />
                  <div className="cyber-capacitor-ring c-ring-2" />
                  <div className="cyber-capacitor-ring c-ring-3" />
                </div>
              )}

              {/* PHARAOH / DIVINE: Golden Falcon Head & Hieroglyph Stream */}
              {(combatAnimation.attackFX?.archetype === 'pharaoh' || combatAnimation.attackFX?.archetype === 'divine') && (
                <div className="traveling-projectile projectile-pharaoh">
                  <div className="pharaoh-golden-falcon-head">
                    <span className="pharaoh-eye-glyph">𓂀</span>
                  </div>
                  <div className="hieroglyph-particle-stream">
                    <span className="glyph-stream g1">𓋹</span>
                    <span className="glyph-stream g2">𓊽</span>
                    <span className="glyph-stream g3">𓃭</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Attack to Life Points Impact Detonation */}
            {combatAnimation.isDirect && (
              <div
                className="direct-attack-impact"
                style={{
                  left: combatAnimation.targetX,
                  top: combatAnimation.targetY,
                }}
              >
                <div className="direct-lp-nova" />
                <div className="direct-lp-shockwave-ring ring-1" />
                <div className="direct-lp-shockwave-ring ring-2" />
                <div className="direct-lp-shockwave-ring ring-3" />
                <div className="direct-lp-lightning-burst" />
                <div className="direct-attack-floating-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">هجوم مباشر على نقاط الحياة!</span>
                  <span className="badge-icon">💥</span>
                </div>
              </div>
            )}

            {/* Razor Blade Slash Cut if Warrior or Wind */}
            {combatAnimation.attackFX?.hasSlashCut && (
              <div
                className="target-slash-cut"
                style={{
                  left: combatAnimation.targetX,
                  top: combatAnimation.targetY,
                }}
              />
            )}

            {/* Archetypal / Elemental Impact Burst at Target */}
            <div
              className={`impact-burst ${combatAnimation.attackFX?.burstClass || (combatAnimation.element || 'pharaoh')}`}
              style={{
                left: combatAnimation.targetX,
                top: combatAnimation.targetY,
              }}
            />

            {/* Pharaonic Eye of Horus & Pyramid Seal for Unclear/Pharaoh Cards */}
            {combatAnimation.attackFX?.hasPharaohSeal && (
              <div
                className="target-pharaoh-seal"
                style={{
                  left: combatAnimation.targetX,
                  top: combatAnimation.targetY,
                }}
              >
                <svg width="84" height="84" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--pharaoh-gold-bright, #facc15)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
                  <polygon points="50,14 84,78 16,78" fill="rgba(245, 158, 11, 0.22)" stroke="var(--pharaoh-gold-bright, #fde047)" strokeWidth="2" />
                  <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="900" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                    𓂀
                  </text>
                </svg>
              </div>
            )}

            {/* Elemental & Archetypal Defense Shield (Block or Shatter) */}
            {(combatAnimation.isShield || combatAnimation.isDefenseShatter) && (
              <div
                className={`defense-shield shield-${combatAnimation.defenseFX?.shieldType || 'iron_aegis'} ${combatAnimation.isDefenseShatter ? 'state-shattered' : 'state-blocked'} ${combatAnimation.defenderElement || 'pharaoh'}`}
                style={{
                  left: combatAnimation.targetX - 42,
                  top: combatAnimation.targetY - 58,
                  width: 84,
                  height: 116,
                }}
              >
                <div className={`combat-feedback-badge ${combatAnimation.isDefenseShatter ? 'badge-shattered' : 'badge-deflected'}`}>
                  {combatAnimation.isDefenseShatter ? 'اختراق الدفاع!' : 'تم الصد الحصين!'}
                </div>
                <svg width="44" height="44" viewBox="0 0 100 100">
                  <polygon points="50,10 90,85 10,85" stroke="currentColor" strokeWidth="4" fill="rgba(255, 255, 255, 0.25)" />
                  <circle cx="50" cy="55" r="10" fill="currentColor" />
                </svg>
              </div>
            )}

            {/* Direct In-Field Floating Battle Damage & Verdict Badge */}
            {combatAnimation && (
              <div
                className="combat-floating-impact-wrapper"
                style={{
                  left: combatAnimation.targetX,
                  top: combatAnimation.targetY - 32,
                }}
              >
                {combatAnimation.damage > 0 ? (
                  <div className={`combat-field-damage-badge ${combatAnimation.damagePlayerIdx === 1 ? 'damage-recoil' : 'damage-player'}`}>
                    <span className="field-damage-amount">
                      -{combatAnimation.damage} LP
                    </span>
                    {combatAnimation.damagePlayerIdx === 1 ? (
                      <span className="field-damage-sub">ارتداد لصالحك</span>
                    ) : combatAnimation.isDirect ? (
                      <span className="field-damage-sub">ضربة مباشرة</span>
                    ) : null}
                  </div>
                ) : (
                  <div className="combat-field-damage-badge damage-zero">
                    <span className="field-damage-amount">0 LP</span>
                    <span className="field-damage-sub">تم الصد بالكامل</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Monster Destroy → Killer-Based Dissolution Animation */}
        {destroyAnimation && (
          <div
            className={`card-destroying ${destroyAnimation.fx?.containerClass || 'destroy-generic'}`}
            style={{
              position: 'absolute',
              left: destroyAnimation.x,
              top: destroyAnimation.y,
              width: 'var(--slot-w, 64px)',
              height: 'var(--slot-h, 92px)',
              borderRadius: 4,
              zIndex: 250,
            }}
          >
            {/* Killer Notification Badge */}
            {destroyAnimation.fx?.badgeAr && (
              <div className="destroy-killer-badge">
                {destroyAnimation.fx.badgeAr}
              </div>
            )}

            {/* Sever Slash: Card sliced diagonally in two halves */}
            {destroyAnimation.fx?.type === 'sever_slash' ? (
              <div className="sever-slash-container">
                <div className="sever-half top-half">
                  <img
                    src={getCardImageUrl(destroyAnimation.card, 'art')}
                    alt={destroyAnimation.card.name}
                    onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                  />
                </div>
                <div className="sever-slash-line" />
                <div className="sever-half bottom-half">
                  <img
                    src={getCardImageUrl(destroyAnimation.card, 'art')}
                    alt={destroyAnimation.card.name}
                    onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Specific Overlays for other archetypes */}
                {destroyAnimation.fx?.type === 'incinerate' && <div className="flame-scorch-overlay" />}
                {destroyAnimation.fx?.type === 'arcane_dissolve' && <div className="arcane-rune-ring" />}
                <div className="destroy-particles-burst" />
                <img
                  src={getCardImageUrl(destroyAnimation.card, 'art')}
                  alt={destroyAnimation.card.name}
                  className="card-art-enhanced"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  onError={(e) => {
                    e.target.src = '/assets/card_back.png';
                  }}
                />
              </>
            )}
          </div>
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
              borderColor: arenaPalette.primary,
              boxShadow: `0 0 10px ${arenaPalette.slotGlow}`,
              background: arenaPalette.slotBg,
              position: 'relative',
              overflow: 'hidden',
            }}
            title="مقبرة الخصم - انقر للاستعراض"
          >
            {p1.graveyard.length > 0 ? (
              <img
                src={getCardImageUrl(p1.graveyard[p1.graveyard.length - 1], 'art')}
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
            <div
              key={`p1-st-${idx}`}
              ref={(el) => (p1SpellTrapRefs.current[idx] = el)}
              className={`pharaoh-slot pharaoh-slot-st ${slot ? 'occupied' : ''}`}
            >
              {slot ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    border: '1px solid var(--pharaoh-stone-border)',
                    background: '#120e08',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src="/assets/card_back.png"
                    alt="مقلوب"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.85,
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.42)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 800,
                        color: 'var(--pharaoh-text-gold)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                      }}
                    >
                      مقلوب
                    </span>
                  </div>
                </div>
              ) : (
                <div className="zone-slot-floor-rune">
                  <span className="rune-glyph">𓋹</span>
                  <span className="rune-label">S{idx + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Opponent Monster Zones (High-Clarity Artwork) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {p1.monsterZones.map((slot, idx) => {
            const isAttackerSelected = selectedFieldMonsterZone !== null && state.phase === 'BATTLE_STEP';
            const isOpponentTarget = isAttackerSelected && slot !== null;
            const isDefense = slot && (slot.position === 'face_up_defense' || slot.position === 'face_down_defense');
            const attrClass = slot?.card?.attribute ? `attr-${slot.card.attribute.toLowerCase()}` : '';
            const isLunging = activeAttackMotion?.attackerPlayer === 1 && activeAttackMotion?.attackerZone === idx;
            const isImpacted = activeAttackMotion?.targetPlayer === 1 && activeAttackMotion?.targetZone === idx && activeAttackMotion?.step === 'impact';

            return (
              <div
                key={`p1-m-${idx}`}
                ref={(el) => (p1MonsterRefs.current[idx] = el)}
                className={`pharaoh-slot ${slot ? 'occupied ' + attrClass : ''} ${isOpponentTarget ? 'selected' : ''} ${
                  isDefense ? 'defense' : ''
                } ${isLunging ? 'card-lunge-down' : ''} ${isImpacted ? 'card-impact-recoil' : ''}`}
                onClick={() => {
                  if (isAttackerSelected) {
                    handleAttackTarget(idx);
                  } else if (slot) {
                    if (slot.position === 'face_down_defense') {
                      soundManager.playCardPlace();
                      showGameToast('بطاقة مقلوبة - أسرارها محجوبة حتى يتم تفعيلها أو مهاجمتها');
                      return;
                    }
                    setInspectCard(slot.card);
                  }
                }}
                style={{
                  cursor: isAttackerSelected
                    ? 'crosshair'
                    : slot && slot.position !== 'face_down_defense'
                    ? 'pointer'
                    : 'default',
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
                      transform: isDefense ? 'translateX(-50%) rotate(-90deg)' : 'translateX(-50%)',
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
                {opponentEffectNotice && (opponentEffectNotice.zoneIndex === idx || opponentEffectNotice.zoneIndex === -1) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: 6,
                      border: '2px solid #f59e0b',
                      boxShadow: '0 0 24px rgba(245, 158, 11, 0.95), inset 0 0 14px rgba(239, 68, 68, 0.75)',
                      animation: 'pulse 0.7s infinite alternate',
                      zIndex: 35,
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(20, 10, 5, 0.88)',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 900,
                        textAlign: 'center',
                        padding: '4px 6px',
                        textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(245, 158, 11, 0.8)',
                        background: 'linear-gradient(180deg, rgba(180, 83, 9, 0.95), rgba(120, 53, 15, 0.98))',
                        borderRadius: 4,
                        border: '1px solid #fde047',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                        lineHeight: 1.2,
                        maxWidth: '96%',
                      }}
                    >
                      {opponentEffectNotice.actionText}
                    </div>
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
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 3,
                          border: '1px solid var(--pharaoh-stone-border)',
                          background: '#120e0a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src="/assets/card_back.png"
                          alt="مقلوب"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden', background: '#080604' }}>
                          <img
                            src={getCardImageUrl(slot.card, 'art')}
                            alt={slot.card.name}
                            className="card-art-enhanced"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => {
                              const fallback = getCardImageUrl(slot.card, 'full');
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
                  <div className="zone-slot-floor-rune">
                    <span className="rune-glyph">𓂀</span>
                    <span className="rune-label">M{idx + 1}</span>
                  </div>
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
                    state.activeFieldSpell.card
                      ? getCardImageUrl(state.activeFieldSpell.card, 'art')
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
        {/* Center Stone Panel: Turn, Phase & Control */}
        <div
          className="duel-center-divider-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 10px',
            gap: 6,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            background: arenaPalette.dividerBg,
            borderTop: `1.5px solid ${arenaPalette.dividerBorder}`,
            borderBottom: `1.5px solid ${arenaPalette.dividerBorder}`,
            boxShadow: `0 0 16px ${arenaPalette.slotGlow}`,
            borderRadius: 4,
            transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', minWidth: 0, flexShrink: 1 }}>
            <span
              className="duel-turn-phase-pill"
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: arenaPalette.highlight,
                background: arenaPalette.slotBg,
                padding: '2px 8px',
                borderRadius: 4,
                border: `1px solid ${arenaPalette.primary}`,
                boxShadow: `0 0 8px ${arenaPalette.slotGlow}`,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              الدور {state.turnNumber} • {getPhaseArabicName(state.phase, true)}
            </span>

            {(isMultiplayer || state.isTagMode) && (
              <span
                className="duel-turn-banner-pill"
                style={{
                  fontSize: 10.5,
                  fontWeight: 900,
                  color: getTurnBannerInfo().color,
                  background: getTurnBannerInfo().bg,
                  padding: '2px 7px',
                  borderRadius: 3,
                  border: `1px solid ${getTurnBannerInfo().border}`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {getTurnBannerInfo().text}
              </span>
            )}

            {isAiThinking && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'rgba(234, 179, 8, 0.18)',
                  border: '1px solid var(--pharaoh-gold-bright)',
                  color: 'var(--pharaoh-gold-bright)',
                  fontSize: 10,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <span>{aiTacticalPlan || `تفكير الخصم (${AI_DIFFICULTIES[aiDifficulty]?.shortName || 'AI'})...`}</span>
              </div>
            )}

            {/* Turn Attack Restriction Notice */}
            {state.turnNumber === 1 && state.phase === 'MAIN1' && (
              <div className="first-turn-lock-badge" title="الهجوم غير متاح في الدور الأول، جهزوا دفاعكم">
                <ShieldDefenseIcon size={11} color="currentColor" />
                <span className="first-turn-lock-full">أول دور: الهجوم مقفول، جهزوا دفاعكم</span>
                <span className="first-turn-lock-mobile">أول دور: الهجوم مقفول</span>
              </div>
            )}
          </div>

          {state.currentTurnPlayer === 0 && !canControlTurnPhase && (
            <span style={{ fontSize: 10.5, color: '#38bdf8', fontWeight: 800, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              مستني زميلك
            </span>
          )}

          {state.currentTurnPlayer === 0 && canControlTurnPhase && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
              {state.phase === 'MAIN1' && (
                <>
                  {state.turnNumber > 1 && (
                    <button
                      onClick={() => {
                        soundManager.playBattleTurn();
                        executeAndBroadcast('advancePhase', 'BATTLE_STEP');
                      }}
                      className="btn-pharaoh-gold btn-phase-compact"
                      style={{
                        padding: '2px 8px',
                        fontSize: 10,
                        minHeight: 24,
                        background: arenaPalette.slotBg,
                        border: `1.2px solid ${arenaPalette.primary}`,
                        color: arenaPalette.highlight,
                        boxShadow: `0 0 6px ${arenaPalette.slotGlow}`,
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ادخل على الهجوم
                    </button>
                  )}
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      executeAndBroadcast('endTurn');
                    }}
                    className="btn-end-turn-pharaoh"
                    title={state.isTagMode ? 'إنهاء دور فرقتنا وتمريره للخصوم' : 'إنهاء الدور والانتقال للخصم'}
                  >
                    <HourglassEndTurnIcon size={11} />
                    <span>{state.isTagMode ? 'إنهاء دورنا' : 'إنهاء الدور'}</span>
                  </button>
                </>
              )}

              {state.phase === 'BATTLE_STEP' && (
                <>
                  {p1.monsterZones.every((m) => m === null) && selectedFieldMonsterZone !== null && (
                    <button
                      onClick={handleDirectAttack}
                      className="btn-pharaoh-gold btn-phase-compact"
                      style={{
                        padding: '2px 8px',
                        fontSize: 10,
                        minHeight: 24,
                        background: 'linear-gradient(180deg, #dc2626, #991b1b)',
                        color: '#fff',
                        boxShadow: '0 0 10px rgba(220, 38, 38, 0.7)',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      اضرب مباشر
                    </button>
                  )}
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      setSelectedFieldMonsterZone(null);
                      executeAndBroadcast('advancePhase', 'MAIN2');
                    }}
                    className="btn-pharaoh-stone btn-phase-compact"
                    style={{
                      padding: '2px 8px',
                      fontSize: 10,
                      minHeight: 24,
                      background: arenaPalette.slotBg,
                      border: `1.2px solid ${arenaPalette.secondary}`,
                      color: arenaPalette.highlight,
                      boxShadow: `0 0 6px ${arenaPalette.slotGlow}`,
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    المرحلة 2
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTurnChange();
                      setSelectedFieldMonsterZone(null);
                      executeAndBroadcast('endTurn');
                    }}
                    className="btn-end-turn-pharaoh"
                    title={state.isTagMode ? 'إنهاء دور فرقتنا وتمريره للخصوم' : 'إنهاء الدور والانتقال للخصم'}
                  >
                    <HourglassEndTurnIcon size={11} />
                    <span>{state.isTagMode ? 'إنهاء دورنا' : 'إنهاء الدور'}</span>
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
                  className="btn-end-turn-pharaoh pulse-ready"
                  title={state.isTagMode ? 'إنهاء دور فرقتنا وتمريره للخصوم' : 'إنهاء الدور والانتقال للخصم'}
                >
                  <HourglassEndTurnIcon size={11} />
                  <span>{state.isTagMode ? 'إنهاء دورنا' : 'إنهاء الدور'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Player Monster Zones (High-Clarity Artwork) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--slot-gap, 8px)' }}>
          {p0.monsterZones.map((slot, idx) => {
            const isSelected = selectedFieldMonsterZone === idx;
            const isDefense = slot && (slot.position === 'face_up_defense' || slot.position === 'face_down_defense');
            const canAttack =
              state.phase === 'BATTLE_STEP' &&
              slot &&
              slot.position === 'face_up_attack' &&
              !slot.hasAttacked;
            const hasAttackedThisTurn = state.phase === 'BATTLE_STEP' && slot && slot.hasAttacked;
            const isTributeEligible = tributeSelection && slot !== null;
            const isTributeSelected = tributeSelection && tributeSelection.selectedZones.includes(idx);
            const selectedCardAction = selectedCard ? getCardActionState(selectedCard) : null;
            const isBeaconActive = !slot && selectedHandIndex !== null && selectedCard?.type === 'monster' && selectedCardAction?.canSummon && selectedCardAction?.reqTributes === 0;
            const attrClass = slot?.card?.attribute ? `attr-${slot.card.attribute.toLowerCase()}` : '';
            const isLunging = activeAttackMotion?.attackerPlayer === 0 && activeAttackMotion?.attackerZone === idx;
            const isImpacted = activeAttackMotion?.targetPlayer === 0 && activeAttackMotion?.targetZone === idx && activeAttackMotion?.step === 'impact';

            return (
              <div
                key={`p0-m-${idx}`}
                ref={(el) => (p0MonsterRefs.current[idx] = el)}
                className={`pharaoh-slot ${slot ? 'occupied ' + attrClass : ''} ${isBeaconActive ? 'zone-beacon-active' : ''} ${isSelected ? 'selected' : ''} ${
                  isDefense ? 'defense' : ''
                } ${isTributeSelected ? 'tribute-selected' : isTributeEligible ? 'tribute-eligible' : ''} ${
                  canAttack && !isSelected ? 'attack-ready' : ''
                } ${isLunging ? 'card-lunge-up' : ''} ${isImpacted ? 'card-impact-recoil' : ''}`}
                onClick={() => handlePlayerMonsterClick(idx)}
                style={{
                  cursor: isTributeEligible || isBeaconActive ? 'pointer' : slot ? 'pointer' : 'default',
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
                {isBeaconActive && <div className="zone-beacon-column" />}
                {isTributeSelected && (
                  <div className="tribute-altar-overlay">
                    <div className="tribute-spinning-seal" />
                    <span className="tribute-glyph-icon">𓊽</span>
                    <span className="tribute-altar-tag">قربان التضحية</span>
                  </div>
                )}
                {isTributeEligible && !isTributeSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: '50%',
                      transform: isDefense ? 'translateX(-50%) rotate(-90deg)' : 'translateX(-50%)',
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
                {canAttack && !tributeSelection && (
                  <div
                    className={`attack-sword-badge ${isSelected ? 'selected' : 'ready'}`}
                    style={{
                      position: 'absolute',
                      top: -11,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.96), rgba(127, 29, 29, 0.98))'
                        : 'linear-gradient(135deg, rgba(133, 77, 14, 0.96), rgba(69, 26, 3, 0.98))',
                      border: isSelected ? '1.5px solid #f87171' : '1.5px solid #facc15',
                      borderRadius: 10,
                      padding: '2px 6px',
                      zIndex: 12,
                      boxShadow: isSelected
                        ? '0 0 14px rgba(239, 68, 68, 0.95)'
                        : '0 0 10px rgba(250, 204, 21, 0.85)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <AttackSwordIcon size={13} isSelected={isSelected} />
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        color: isSelected ? '#fee2e2' : '#fef08a',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {isSelected ? 'يهاجم' : 'هجوم'}
                    </span>
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
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 3,
                          border: '1px solid var(--pharaoh-stone-border)',
                          background: '#120e0a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src="/assets/card_back.png"
                          alt="مقلوب"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.32)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden', background: '#080604' }}>
                          <img
                            src={getCardImageUrl(slot.card, 'art')}
                            alt={slot.card.name}
                            className="card-art-enhanced"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => {
                              const fallback = getCardImageUrl(slot.card, 'full');
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
                  <div className="zone-slot-floor-rune">
                    <span className="rune-glyph">𓂀</span>
                    <span className="rune-label">M{idx + 1}</span>
                  </div>
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
              borderColor: arenaPalette.primary,
              boxShadow: `0 0 10px ${arenaPalette.slotGlow}`,
              background: arenaPalette.slotBg,
              position: 'relative',
              overflow: 'hidden',
            }}
            title="مقبرتك - انقر للاستعراض"
          >
            {p0.graveyard.length > 0 ? (
              <img
                src={getCardImageUrl(p0.graveyard[p0.graveyard.length - 1], 'art')}
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

          {p0.spellTrapZones.map((slot, idx) => {
            const isSelected = selectedSetSTZone === idx;
            const selectedCardAction = selectedCard ? getCardActionState(selectedCard) : null;
            const isBeaconActive = !slot && selectedHandIndex !== null && (selectedCard?.type === 'spell' || selectedCard?.type === 'trap') && selectedCardAction?.canSet;

            return (
              <div
                key={`p0-st-${idx}`}
                ref={(el) => (p0SpellTrapRefs.current[idx] = el)}
                className={`pharaoh-slot pharaoh-slot-st ${slot ? 'occupied' : ''} ${isBeaconActive ? 'zone-beacon-active' : ''} ${isSelected ? 'selected' : ''}`}
                style={{
                  border: isSelected ? '2px solid var(--pharaoh-gold-bright)' : undefined,
                  boxShadow: isSelected ? '0 0 16px rgba(240, 203, 100, 0.9)' : undefined,
                  cursor: isBeaconActive ? 'pointer' : slot ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (isBeaconActive) {
                    handleSetSpellTrap(idx);
                  }
                }}
              >
                {isBeaconActive && <div className="zone-beacon-column" />}
                {slot ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      border: isSelected ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid var(--pharaoh-stone-border)',
                      background: '#120e08',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playClick();
                      hapticManager.triggerCombatVibration('click');
                      setSelectedSetSTZone(isSelected ? null : idx);
                      setSelectedHandIndex(null);
                      setSelectedFieldMonsterZone(null);
                    }}
                  >
                    <img
                      src="/assets/card_back.png"
                      alt="مقلوب"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.85,
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isSelected ? 'rgba(240, 203, 100, 0.2)' : 'rgba(0, 0, 0, 0.38)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          color: isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                        }}
                      >
                        مقلوب
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="zone-slot-floor-rune">
                    <span className="rune-glyph">𓋹</span>
                    <span className="rune-label">S{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Set Spell/Trap Action Toolbar */}
      {selectedSetSTZone !== null && p0.spellTrapZones[selectedSetSTZone] && (
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
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
            {p0.spellTrapZones[selectedSetSTZone].card.name} (خانة السحر/الفخ {selectedSetSTZone + 1})
          </div>
          {(() => {
            const slot = p0.spellTrapZones[selectedSetSTZone];
            const isTrapSetThisTurn = slot.card.type === 'trap' && slot.turnSet === state.turnNumber;
            const canAct =
              !isTrapSetThisTurn &&
              (state.phase === 'MAIN1' || state.phase === 'MAIN2' || state.phase === 'BATTLE_STEP');

            return (
              <>
                <button
                  onClick={() => handleActivateSetST(selectedSetSTZone)}
                  className={canAct ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  disabled={!canAct}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12,
                    opacity: canAct ? 1 : 0.6,
                    background: canAct ? 'linear-gradient(180deg, #10b981, #047857)' : undefined,
                    color: canAct ? '#fff' : undefined,
                    cursor: canAct ? 'pointer' : 'not-allowed',
                  }}
                  title={isTrapSetThisTurn ? 'ماتقدرش تشغّل الفخ في نفس الدور اللي حطيته فيه' : undefined}
                >
                  {isTrapSetThisTurn ? 'الفخ مقفول الدور ده' : 'شغّل الكارت دلوقتي'}
                </button>
                <button
                  onClick={() => setInspectCard(slot.card)}
                  className="btn-pharaoh-stone"
                  style={{ padding: '8px 12px', fontSize: 12 }}
                >
                  شوف الكارت
                </button>
                <button
                  onClick={() => setSelectedSetSTZone(null)}
                  className="btn-pharaoh-stone"
                  style={{ padding: '8px 10px', fontSize: 12, color: '#ef4444' }}
                >
                  إلغاء
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Selected Card Action Toolbar / Floating Actions */}
      {selectedCard && (
        cardMenuStyle !== 'classic' ? (
          <div
            className={`hand-card-floating-actions ${cardMenuStyle === 'icons_only' ? 'icons-only' : ''}`}
            style={{
              left: selectedCardRect
                ? Math.max(130, Math.min((typeof window !== 'undefined' ? window.innerWidth : 400) - 130, selectedCardRect.left))
                : '50%',
              bottom: selectedCardRect
                ? Math.max(135, (typeof window !== 'undefined' ? window.innerHeight : 700) - selectedCardRect.top + 14)
                : 150,
            }}
          >
            {selectedCard.type === 'monster' && (() => {
              const { canSummon, reqTributes, reason } = getCardActionState(selectedCard);

              return (
                <>
                  <button
                    onClick={() => {
                      if (canSummon) {
                        handleSummon('face_up_attack');
                      } else {
                        hapticManager.triggerCombatVibration('click');
                        showGameToast(reason || 'لا يمكنك استدعاء هذا الوحش الآن', 2600);
                      }
                    }}
                    className={`card-action-pill attack ${!canSummon ? 'disabled-pill' : ''}`}
                    aria-disabled={!canSummon}
                    title={
                      !canSummon
                        ? reason
                        : reqTributes > 0
                        ? `استدعاء بالتضحية (${reqTributes})`
                        : 'استدعاء في وضع الهجوم'
                    }
                  >
                    <AttackSwordIcon size={14} isSelected={false} />
                    <span className="action-label-text">
                      {reqTributes > 0 ? `تضحية (${reqTributes})` : 'هجوم'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (canSummon) {
                        handleSummon('face_down_defense');
                      } else {
                        hapticManager.triggerCombatVibration('click');
                        showGameToast(reason || 'لا يمكنك استدعاء هذا الوحش الآن', 2600);
                      }
                    }}
                    className={`card-action-pill defense ${!canSummon ? 'disabled-pill' : ''}`}
                    aria-disabled={!canSummon}
                    title={
                      !canSummon
                        ? reason
                        : reqTributes > 0
                        ? 'تضحية ودفاع مقلوب'
                        : 'وضع في الدفاع المقلوب'
                    }
                  >
                    <ShieldDefenseIcon size={14} color="#ffffff" />
                    <span className="action-label-text">
                      {reqTributes > 0 ? 'تضحية ودفاع' : 'دفاع مقلوب'}
                    </span>
                  </button>
                </>
              );
            })()}

            {selectedCard.type === 'spell' && (() => {
              const { canActivate, canSet, reason } = getCardActionState(selectedCard);
              const isFieldSpell =
                selectedCard.subType === 'field' ||
                ['yami', 'umi', 'sogen', 'forest', 'mountain', 'wasteland', 'gaia', 'molten', 'luminous', 'sanctuary'].some((k) =>
                  (selectedCard.name || '').toLowerCase().includes(k)
                );

              return (
                <>
                  <button
                    onClick={() => {
                      if (canActivate) {
                        handleActivateSpell();
                      } else {
                        hapticManager.triggerCombatVibration('click');
                        showGameToast(reason || 'لا يمكنك تفعيل هذه البطاقة الآن', 2600);
                      }
                    }}
                    className={`card-action-pill spell ${!canActivate ? 'disabled-pill' : ''}`}
                    aria-disabled={!canActivate}
                    title={!canActivate ? reason : 'تفعيل بطاقة السحر فوراً'}
                  >
                    <MagicWandIcon size={14} color="#ffffff" />
                    <span className="action-label-text">
                      {isFieldSpell ? 'أرض الملعب' : 'تفعيل السحر'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (canSet) {
                        handleSetSpellTrap();
                      } else {
                        hapticManager.triggerCombatVibration('click');
                        showGameToast(reason || 'لا يمكنك وضع هذه البطاقة الآن', 2600);
                      }
                    }}
                    className={`card-action-pill set ${!canSet ? 'disabled-pill' : ''}`}
                    aria-disabled={!canSet}
                    title={!canSet ? reason : 'وضع السحر مقلوباً في ساحتك'}
                  >
                    <CardFaceDownIcon size={14} color="#fef08a" />
                    <span className="action-label-text">وضع مقلوب</span>
                  </button>
                </>
              );
            })()}

            {selectedCard.type === 'trap' && (() => {
              const { canSet, reason } = getCardActionState(selectedCard);

              return (
                <button
                  onClick={() => {
                    if (canSet) {
                      handleSetSpellTrap();
                    } else {
                      hapticManager.triggerCombatVibration('click');
                      showGameToast(reason || 'لا يمكنك تثبيت هذا الفخ الآن', 2600);
                    }
                  }}
                  className={`card-action-pill trap ${!canSet ? 'disabled-pill' : ''}`}
                  aria-disabled={!canSet}
                  title={!canSet ? reason : 'تثبيت الفخ مقلوباً في ساحتك'}
                >
                  <CardFaceDownIcon size={14} color="#ffffff" />
                  <span className="action-label-text">تثبيت الفخ</span>
                </button>
              );
            })()}

            <button
              onClick={() => setInspectCard(selectedCard)}
              className="card-action-pill inspect"
              title="معاينة تفاصيل البطاقة الكاملة"
            >
              <EyeInspectIcon size={14} color="#e2e8f0" />
              <span className="action-label-text">معاينة</span>
            </button>

            <button
              onClick={() => setSelectedHandIndex(null)}
              className="card-action-pill inspect"
              style={{ padding: '6px 8px', minWidth: 'auto', opacity: 0.8 }}
              title="إلغاء التحديد"
            >
              ✕
            </button>
          </div>
        ) : (
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
            {(() => {
              const actionState = getCardActionState(selectedCard);
              if (selectedCard.type === 'monster') {
                const { canSummon, reqTributes, reason } = actionState;
                return (
                  <>
                    <button
                      onClick={() => {
                        if (canSummon) {
                          handleSummon('face_up_attack');
                        } else {
                          hapticManager.triggerCombatVibration('click');
                          showGameToast(reason || 'لا يمكنك استدعاء هذا الوحش الآن', 2600);
                        }
                      }}
                      className={canSummon ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        opacity: canSummon ? 1 : 0.45,
                        filter: canSummon ? 'none' : 'grayscale(0.8)',
                        cursor: 'pointer',
                      }}
                      title={!canSummon ? reason : undefined}
                    >
                      {reqTributes > 0 ? `نزّله بتضحية (${reqTributes})` : 'نزّل الوحش هجوم'}
                    </button>
                    <button
                      onClick={() => {
                        if (canSummon) {
                          handleSummon('face_down_defense');
                        } else {
                          hapticManager.triggerCombatVibration('click');
                          showGameToast(reason || 'لا يمكنك استدعاء هذا الوحش الآن', 2600);
                        }
                      }}
                      className="btn-pharaoh-stone"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        opacity: canSummon ? 1 : 0.45,
                        filter: canSummon ? 'none' : 'grayscale(0.8)',
                        cursor: 'pointer',
                      }}
                      title={!canSummon ? reason : undefined}
                    >
                      {reqTributes > 0 ? 'تضحية ودفاع مقلوب' : 'نزّله مقلوب دفاع'}
                    </button>
                  </>
                );
              }
              if (selectedCard.type === 'spell') {
                const { canActivate, canSet, reason } = actionState;
                return (
                  <>
                    <button
                      onClick={() => {
                        if (canActivate) {
                          handleActivateSpell();
                        } else {
                          hapticManager.triggerCombatVibration('click');
                          showGameToast(reason || 'لا يمكنك تفعيل هذه البطاقة الآن', 2600);
                        }
                      }}
                      className="btn-pharaoh-gold"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        opacity: canActivate ? 1 : 0.45,
                        filter: canActivate ? 'none' : 'grayscale(0.8)',
                        cursor: 'pointer',
                      }}
                      title={!canActivate ? reason : undefined}
                    >
                      {selectedCard.subType === 'field' || ['yami', 'umi', 'sogen', 'forest', 'mountain', 'wasteland', 'gaia', 'molten', 'luminous', 'sanctuary'].some((k) => (selectedCard.name || '').toLowerCase().includes(k))
                        ? 'شغّل وغيّر أرض الملعب'
                        : 'شغّل السحر'}
                    </button>
                    <button
                      onClick={() => {
                        if (canSet) {
                          handleSetSpellTrap();
                        } else {
                          hapticManager.triggerCombatVibration('click');
                          showGameToast(reason || 'لا يمكنك وضع هذه البطاقة الآن', 2600);
                        }
                      }}
                      className="btn-pharaoh-stone"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        opacity: canSet ? 1 : 0.45,
                        filter: canSet ? 'none' : 'grayscale(0.8)',
                        cursor: 'pointer',
                      }}
                      title={!canSet ? reason : undefined}
                    >
                      حطه مقلوب
                    </button>
                  </>
                );
              }
              if (selectedCard.type === 'trap') {
                const { canSet, reason } = actionState;
                return (
                  <button
                    onClick={() => {
                      if (canSet) {
                        handleSetSpellTrap();
                      } else {
                        hapticManager.triggerCombatVibration('click');
                        showGameToast(reason || 'لا يمكنك وضع هذا الفخ الآن', 2600);
                      }
                    }}
                    className="btn-pharaoh-gold"
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      opacity: canSet ? 1 : 0.45,
                      filter: canSet ? 'none' : 'grayscale(0.8)',
                      cursor: 'pointer',
                    }}
                    title={!canSet ? reason : undefined}
                  >
                    حط الفخ مقلوب
                  </button>
                );
              }
              return null;
            })()}
            <button onClick={() => setInspectCard(selectedCard)} className="btn-pharaoh-stone" style={{ padding: '8px 12px', fontSize: 12 }}>
              شوف الكارت
            </button>
          </div>
        )
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
            <div style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span>𓊽</span>
              <span>طقوس التضحية لاستدعاء: {tributeSelection.card.arabicName || tributeSelection.card.name} ({tributeSelection.card.level} نجوم)</span>
              <span>𓊽</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--pharaoh-text-light)', marginTop: 2 }}>
              دوس على وحوشك في الملعب علشان تضحي بـ {tributeSelection.requiredTributes} وحش (اخترت {tributeSelection.selectedZones.length} من {tributeSelection.requiredTributes})
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {tributeSelection.selectedZones.length === tributeSelection.requiredTributes && (
              <button
                onClick={handleConfirmTributeSummon}
                className="btn-pharaoh-gold"
                style={{
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 900,
                  background: 'linear-gradient(180deg, #f59e0b, #b45309)',
                  color: '#fff',
                  boxShadow: '0 0 18px rgba(245, 158, 11, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>أكّد التضحية والطقوس الأسطورية</span>
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
                    اضرب ضربة مباشرة
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: '#f87171', fontWeight: 800 }}>
                    دوس على وحش الخصم علشان تضربه
                  </span>
                )
              ) : selectedMonsterSlot.hasAttacked ? (
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  الوحش ده ضرب خلاص في الدور ده
                </span>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  الوحش في وضع الدفاع (مايقدرش يهاجم)
                </span>
              )}
            </>
          )}

          {(state.phase === 'MAIN1' || state.phase === 'MAIN2') && selectedMonsterSlot.canChangePosition && (
            <button onClick={handleChangePosition} className="btn-pharaoh-stone" style={{ padding: '6px 12px', fontSize: 11 }}>
              غيّر وضعيته
            </button>
          )}

          <button onClick={() => setInspectCard(selectedMonsterSlot.card)} className="btn-pharaoh-stone" style={{ padding: '6px 10px', fontSize: 11 }}>
            شوف الكارت
          </button>

          <button
            onClick={() => setSelectedFieldMonsterZone(null)}
            className="btn-pharaoh-stone"
            style={{ padding: '6px 10px', fontSize: 11, color: '#ef4444' }}
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Bottom Tray: Player Status & Hand Shelf (Larger Cards: 76px x 108px) */}
      <div
        className="duel-bottom-tray"
        style={{
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
                {state.isTagMode ? `${p0.name} & ${p0.teammateName || 'صاحبك'}` : `${p0.name} (أنت)`}
              </div>
              {state.isTagMode && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid #22c55e',
                    color: '#86efac',
                    whiteSpace: 'nowrap',
                  }}
                >
                  تحالفكم (فريقك)
                </span>
              )}
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

              {/* Tag Team Mode: Teammate Cards Button ("زرار بطاقات صاحبي") */}
              {state.isTagMode && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    hapticManager.triggerCombatVibration('click');
                    setIsTeammateDrawerOpen(true);
                  }}
                  className="btn-icon-pharaoh"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 9px',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(240, 203, 100, 0.35), rgba(180, 83, 9, 0.45))',
                    border: '1.5px solid var(--pharaoh-gold-bright)',
                    color: '#fef08a',
                    fontSize: 10.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(240, 203, 100, 0.45)',
                  }}
                  title="استعراض بطاقات زميلك في الفريق وإرسال إشارات تكتيكية"
                >
                  <TeammateEyeIcon size={13} color="var(--pharaoh-gold-bright)" />
                  <span>كروت صاحبي ({p0.teammateHand?.length || 0})</span>
                </button>
              )}

              {/* Active Hand Indicator Badge in Tag Mode */}
              {state.isTagMode && (
                <button
                  onClick={() => {
                    executeAndBroadcast('switchActiveHand', 0);
                  }}
                  className="btn-icon-pharaoh"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: p0.activeHandType === 'teammate' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.1)',
                    border: p0.activeHandType === 'teammate' ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: p0.activeHandType === 'teammate' ? '#93c5fd' : 'var(--pharaoh-text-gold)',
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  title="التبديل بين يد القائد ويد الزميل"
                >
                  <span>{p0.activeHandType === 'teammate' ? 'يد الزميل' : 'يدي'}</span>
                </button>
              )}
            </div>
          </div>

          <div
            ref={p0LpRef}
            className={`lp-gauge-card ${displayedP0LP <= 2000 ? 'lp-danger-active' : ''} ${
              lpPulseP0 === 'loss' ? 'lp-loss-flash' : ''
            } ${activeAttackMotion?.isDirect && activeAttackMotion?.targetPlayer === 0 && activeAttackMotion?.step === 'impact' ? 'lp-impact-shake' : ''}`}
          >
            {/* Floating Combat Damage Numbers beside P0 LP */}
            {damagePopups
              .filter((p) => p.playerIndex === 0)
              .map((popup) => (
                <div
                  key={popup.id}
                  className={`floating-damage-popup ${popup.isHeal ? 'floating-damage-heal' : 'floating-damage-loss'}`}
                  style={{ left: '50%', top: '50%' }}
                >
                  {popup.isHeal ? `+${popup.amount}` : `-${popup.amount}`}
                </div>
              ))}

            {/* Sculpted Track with Ghost & Fill Bars */}
            <div className="lp-gauge-track lp-gauge-track-p0">
              {/* Ghost Trailing Bar (Red Blood Depletion Chunk) */}
              <div
                className="lp-bar-ghost"
                style={{
                  width: `${Math.max(0, Math.min(100, (ghostP0LP / maxLP) * 100))}%`,
                }}
              />
              {/* Active Dynamic Fill Bar */}
              <div
                className={`lp-bar-fill ${
                  displayedP0LP > (maxLP * 0.5) ? 'lp-bar-high' : displayedP0LP > (maxLP * 0.25) ? 'lp-bar-mid' : 'lp-bar-low'
                }`}
                style={{
                  width: `${Math.max(0, Math.min(100, (displayedP0LP / maxLP) * 100))}%`,
                }}
              >
                <div className="lp-bar-shimmer" />
              </div>
              {/* Bleeding Cut / Sparks at severed health border */}
              {displayedP0LP < ghostP0LP && (
                <div
                  className="lp-bleed-spark"
                  style={{
                    right: `${Math.max(0, Math.min(100, (displayedP0LP / maxLP) * 100))}%`,
                  }}
                />
              )}
              {/* Visual Segments */}
              <div className="lp-segment-ticks">
                <div className="lp-tick" />
                <div className="lp-tick" />
              </div>
            </div>

            <div
              className={`lp-value-text ${lpPulseP0 === 'loss' ? 'pulse-loss' : lpPulseP0 === 'heal' ? 'pulse-heal' : ''}`}
              style={{
                fontSize: 'clamp(15px, 3.8vw, 20px)',
                color: displayedP0LP <= 2000 ? '#ef4444' : 'var(--pharaoh-gold-bright)',
              }}
            >
              LP {displayedP0LP}
            </div>
          </div>
        </div>

        {/* Hand Cards Horizontal Scroll (Large & High Definition for Mobile: clamp(72px, 18.5vw, 92px)) */}
        <div
          onScroll={updateSelectedCardRect}
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
            if (!card) return null;
            const isSelected = selectedHandIndex === idx;
            return (
              <div
                key={`hand-${card.id || card.cardCode || idx}-${idx}`}
                id={`hand-card-${idx}`}
                onClick={() => handleHandCardClick(idx)}
                onTouchStart={() => handleCardTouchStart(card)}
                onTouchEnd={handleCardTouchEnd}
                onMouseDown={() => handleCardTouchStart(card)}
                onMouseUp={handleCardTouchEnd}
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
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {doubleTapFeedbackIndex === idx && (
                  <div className="card-double-tap-ripple" />
                )}
                {isSelected && quickSummonEnabled && (() => {
                  const action = getCardActionState(card);
                  const isPlayable = card.type === 'monster' ? action.canSummon : card.type === 'spell' ? (action.canActivate || action.canSet) : action.canSet;
                  return isPlayable ? (
                    <div className="quick-summon-hint-badge">
                      نقرتين للتنزيل
                    </div>
                  ) : null;
                })()}
                <img
                  src={getCardImageUrl(card, 'full')}
                  alt={card.name}
                  loading="lazy"
                  decoding="async"
                  className="card-art-enhanced"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  onError={(e) => {
                    const fallback = getCardImageUrl(card, 'mini');
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

      {/* Game Action Toast Notification */}
      {gameToast && (
        <div className="game-action-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--pharaoh-gold-bright)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{gameToast}</span>
        </div>
      )}

      {/* Smart Spell / Trap Activation Prompt Window */}
      {spellTrapPrompt && (
        <div className="smart-trap-prompt-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(180, 83, 9, 0.45))',
                  border: '1px solid var(--pharaoh-gold-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AttackSwordIcon size={16} isSelected={false} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                {spellTrapPrompt.title || 'فرصة تفعيل في المعركة'}
              </span>
            </div>
            <button
              onClick={handleSkipPromptCard}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--pharaoh-text-muted)',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="عدّيها"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div
              style={{
                width: 52,
                height: 74,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1.5px solid var(--pharaoh-gold-bright)',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                flexShrink: 0,
                background: '#0a0805',
              }}
            >
              <img
                src={getCardImageUrl(spellTrapPrompt.card, 'art')}
                alt={spellTrapPrompt.card.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = getCardImageUrl(spellTrapPrompt.card, 'full');
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 4 }}>
                {spellTrapPrompt.message}
              </div>
              {spellTrapPrompt.subMessage && (
                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-light)', opacity: 0.9 }}>
                  {spellTrapPrompt.subMessage}
                </div>
              )}
            </div>
          </div>

          {/* Countdown timer bar */}
          <div style={{ marginBottom: 12 }}>
            <div className="smart-prompt-timer-bar" />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={handleSkipPromptCard}
              className="btn-pharaoh-stone"
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--pharaoh-text-muted)',
              }}
            >
              عدّيها
            </button>
            <button
              onClick={handleActivatePromptCard}
              className="btn-pharaoh-gold"
              style={{
                padding: '7px 18px',
                fontSize: 12,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #10b981, #047857)',
                border: '1.5px solid #34d399',
                color: '#fff',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.65)',
              }}
            >
              شغّلها دلوقتي
            </button>
          </div>
        </div>
      )}

      {/* Card Inspector Modal with Clear Arabic Description */}
      <CardDetailModal
        card={inspectCard}
        onClose={() => setInspectCard(null)}
        inDuel={true}
        actionButton={
          selectedSetSTZone !== null &&
          p0.spellTrapZones[selectedSetSTZone]?.card === inspectCard &&
          (() => {
            const slot = p0.spellTrapZones[selectedSetSTZone];
            const isTrapSetThisTurn = slot?.card?.type === 'trap' && slot?.turnSet === state.turnNumber;
            const canAct =
              !isTrapSetThisTurn &&
              (state.phase === 'MAIN1' || state.phase === 'MAIN2' || state.phase === 'BATTLE_STEP');

            if (!canAct) return null;

            return (
              <button
                onClick={() => handleActivateSetST(selectedSetSTZone)}
                className="btn-pharaoh-gold"
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  fontSize: 12,
                  fontWeight: 900,
                  background: 'linear-gradient(180deg, #10b981, #047857)',
                  color: '#fff',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                }}
              >
                شغّل الكارت ده في الملعب دلوقتي
              </button>
            );
          })()
        }
      />

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


      {/* Epic Pharaonic Game Over Outcome (Victory & Defeat Animation Ceremony) */}
      {state.winner !== null && (
        <DuelOutcomeModal
          winner={state.winner}
          winReason={state.winReason}
          p0Lp={displayedP0LP}
          p1Lp={displayedP1LP}
          turnNumber={state.turnNumber}
          p0Name={state.isTagMode ? `${p0.name} و ${p0.teammateName || 'صاحبك'}` : p0.name}
          p1Name={state.isTagMode ? `${p1.name} و ${p1.teammateName || 'المنافس 2'}` : p1.name}
          graveyardCount={p0.graveyard.length}
          onExit={onExit}
          onRestart={onRestartDuel}
        />
      )}

      {/* Dynamic Battle Arena Dimensional Transition Overlay Ceremony */}
      <ArenaTransitionOverlay transition={arenaTransition} theme={theme} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
        aiDifficulty={aiDifficulty}
        onSelectAiDifficulty={onSelectAiDifficulty}
        arenaSyncMode={arenaSyncMode}
        onSelectArenaSyncMode={(mode) => setArenaSyncMode(mode)}
        dynamicArenaMode={dynamicArenaMode}
        onSelectDynamicArenaMode={(mode) => setDynamicArenaMode(mode)}
        onSelectArena={(arenaId) => {
          let chosen = null;
          if (arenaId === 'random') {
            chosen = getRandomArenaTheme();
          } else {
            chosen = getArenaTheme(arenaId, theme);
          }
          triggerArenaTransition(chosen, 'تم تغيير الساحة من الإعدادات', 'تبديل الساحة');
          if (isMultiplayer && arenaSyncMode === 'synced') {
            connectionManager.send({
              type: 'DUEL_ARENA_SYNC',
              arenaId: chosen.id,
            });
          }
        }}
      />

      {/* Spell Activation Visual Effects Overlay */}
      {spellAnimation && (
        <div className="spell-activation-overlay">
          {/* Rotating Magic Circle */}
          <div className="spell-magic-circle" />

          {/* Floating Spell Card */}
          <div className="spell-card-floating">
            <img
              src={getCardImageUrl(spellAnimation.spellCard, 'full')}
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
                const fallbackMini = getCardImageUrl(spellAnimation.spellCard, 'mini');
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
              سحر اشتغل بواسطة {state.players[spellAnimation.playerIndex].name}
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginTop: 2 }}>
              {spellAnimation.effectMeta?.title || spellAnimation.spellCard.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--pharaoh-text-light)', marginTop: 4, fontWeight: 700 }}>
              {spellAnimation.effectMeta?.desc || 'تأثير السحر اتطبّق على الساحة!'}
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

      {/* Monster Effect Radiating Activation Overlay */}
      {monsterEffectAnimation && (
        <div className="monster-effect-overlay">
          {/* Rotating Radiant Sunburst Beams */}
          <div className="monster-radiate-rays" />

          {/* Pulsing Energy Shockwaves */}
          <div className="monster-radiate-pulse" />
          <div className="monster-radiate-pulse pulse-delay-1" />

          {/* Radiating Monster Card with Intense Aura */}
          <div className="monster-card-radiating">
            <img
              src={getCardImageUrl(monsterEffectAnimation.card, 'full')}
              alt={monsterEffectAnimation.card.name}
              className="card-art-enhanced"
              style={{
                width: 145,
                height: 210,
                aspectRatio: '200 / 290',
                objectFit: 'contain',
                display: 'block',
                borderRadius: 6,
              }}
              onError={(e) => {
                const fallbackMini = getCardImageUrl(monsterEffectAnimation.card, 'mini');
                if (e.target.src !== fallbackMini) {
                  e.target.src = fallbackMini;
                }
              }}
            />
            {/* Golden Glint Sheen over card */}
            <div className="monster-card-sheen" />
          </div>

          {/* Monster Announcement Cartouche Banner */}
          <div
            className="stone-panel"
            style={{
              marginTop: 18,
              padding: '12px 24px',
              textAlign: 'center',
              border: '2px solid #f59e0b',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.75), inset 0 0 20px rgba(245, 158, 11, 0.2)',
              background: 'rgba(15, 11, 6, 0.96)',
              zIndex: 30,
              maxWidth: '92vw',
              borderRadius: 8,
              animation: 'panelSlideUp 0.35s ease-out',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: monsterEffectAnimation.trigger === 'flip' ? '#38bdf8' : '#f87171',
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              {monsterEffectAnimation.trigger === 'flip'
                ? `تأثير قلب اشتغل! (${state.players[monsterEffectAnimation.playerIndex]?.name})`
                : monsterEffectAnimation.trigger === 'onDestroy'
                ? `تأثير عند التدمير! (${state.players[monsterEffectAnimation.playerIndex]?.name})`
                : `قدرة وحش اشتغلت! (${state.players[monsterEffectAnimation.playerIndex]?.name})`}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#facc15',
                marginTop: 3,
                textShadow: '0 0 14px rgba(250, 204, 21, 0.8)',
              }}
            >
              {monsterEffectAnimation.arabicName || monsterEffectAnimation.card.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#fef08a',
                marginTop: 5,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {monsterEffectAnimation.desc || 'تم تفعيل قدرة الوحش وتطبيق تأثيره بالكامل!'}
            </div>
          </div>
        </div>
      )}

      {/* Epic Heavy Monster Attack Power Cut-in Overlay */}
      {powerStrikeAlert && (
        <div className="power-strike-overlay">
          {/* Dynamic Radial Anime Speed Lines */}
          <div className="power-strike-speedlines" />

          {/* Background Sacred Hieroglyphic Seal */}
          <div className="power-strike-glyph-ring">
            <svg width="320" height="320" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--pharaoh-gold-bright)" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.65" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="var(--pharaoh-gold-royal)" strokeWidth="1" opacity="0.45" />
              <text x="100" y="24" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓃭</text>
              <text x="180" y="104" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓋹</text>
              <text x="100" y="184" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓊽</text>
              <text x="20" y="104" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓂀</text>
            </svg>
          </div>

          {/* 3D Power Strike Card Wrapper */}
          <div className={`power-strike-card-wrap ${powerStrikeAlert.dashing ? 'dashing' : ''}`}>
            {/* Top Strike Header Banner */}
            <div className="power-strike-banner">
              <span className="power-strike-glyph">𓊽</span>
              <span>
                {powerStrikeAlert.isFinishingBlow
                  ? 'ضربة حسم المعركة القاضية!'
                  : powerStrikeAlert.isDirect
                  ? 'هجوم مباشر ساحق وكاسح!'
                  : powerStrikeAlert.isOverpower
                  ? 'سحق كاسح لوحش الخصم!'
                  : 'هجوم بالقوة الفرعونية الأسطورية!'}
              </span>
              <span className="power-strike-glyph">𓊽</span>
            </div>

            {/* Heroic Monster Card Showcase Frame */}
            <div className="power-strike-card-frame">
              <img
                src={getCardImageUrl(powerStrikeAlert.attackerCard, 'full')}
                alt={powerStrikeAlert.attackerCard?.name}
                className="power-strike-card-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCardImageUrl(powerStrikeAlert.attackerCard, 'art');
                }}
              />
              <div className="power-strike-sheen" />
            </div>

            {/* Monster Info & ATK Stat Box */}
            <div className="power-strike-info-box">
              <div className="power-strike-monster-name">
                {powerStrikeAlert.attackerCard?.arabicName || powerStrikeAlert.attackerCard?.name}
              </div>

              {/* Massive ATK Number Display */}
              <div className="power-strike-atk-badge">
                <span className="atk-label">قوة الهجوم</span>
                <span className="atk-value">{powerStrikeAlert.atk}</span>
                <span className="atk-unit">ATK</span>
              </div>

              {/* Target Details */}
              <div className="power-strike-target-desc">
                {powerStrikeAlert.isDirect ? (
                  <span style={{ color: '#f87171' }}>
                    مستهدف: نقاط حياة الخصم مباشرة (-{powerStrikeAlert.damage} LP)
                  </span>
                ) : powerStrikeAlert.defenderCard ? (
                  <span style={{ color: '#fde047' }}>
                    مستهدف: [{powerStrikeAlert.defenderCard.arabicName || powerStrikeAlert.defenderCard.name}]
                    {powerStrikeAlert.damage > 0 && ` (-${powerStrikeAlert.damage} LP للخصم)`}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Page Opponent Attack Alert Animation Overlay */}
      {opponentAttackAlert && (
        <div className="opponent-fullscreen-attack-alert">
          {/* Pulsing Full-Screen Crimson/Blood-Red Vignette */}
          <div className="opponent-alert-vignette" />

          {/* Top Hazard Warning Stripe */}
          <div className="opponent-hazard-stripe">
            <span>تحذير: وحش الخصم يشن هجوماً!</span>
            <span style={{ opacity: 0.85, fontSize: 10 }}>WARNING: INCOMING BATTLE ASSAULT</span>
            <span>تحذير: وحش الخصم يشن هجوماً!</span>
          </div>

          {/* Center Cinematic Attack Announcement Banner */}
          <div className="opponent-attack-hero-banner">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '3px 14px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 900,
                letterSpacing: 0.5,
              }}
            >
              <span>الخصم يعلن الهجوم الآن!</span>
            </div>

            {/* Side-by-Side Clash Arena Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: 12,
                width: '100%',
                marginTop: 6,
              }}
            >
              {/* Attacker Card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#f87171' }}>مهاجم الخصم</div>
                <div
                  style={{
                    width: 'clamp(54px, 16vw, 72px)',
                    height: 'clamp(78px, 23vw, 104px)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.85)',
                    background: '#000',
                  }}
                >
                  <img
                    src={getCardImageUrl(opponentAttackAlert.attackerCard, 'full')}
                    alt={opponentAttackAlert.attackerCard?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'var(--pharaoh-gold-bright)',
                    maxWidth: 110,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {opponentAttackAlert.attackerCard?.arabicName || opponentAttackAlert.attackerCard?.name || 'وحش الخصم'}
                </div>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid #f87171',
                  }}
                >
                  {opponentAttackAlert.attackerAtk || opponentAttackAlert.attackerCard?.atk || 0} ATK
                </span>
              </div>

              {/* VS Clash Emblem */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
                  color: '#fef08a',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  fontWeight: 900,
                  fontSize: 12,
                  border: '2px solid #facc15',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
                  flexShrink: 0,
                }}
              >
                VS
              </div>

              {/* Target / Defender */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#60a5fa' }}>الهدف المستهدف</div>
                <div
                  style={{
                    width: 'clamp(54px, 16vw, 72px)',
                    height: 'clamp(78px, 23vw, 104px)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: opponentAttackAlert.isDirect ? '2px dashed #ef4444' : '2px solid #3b82f6',
                    boxShadow: opponentAttackAlert.isDirect
                      ? '0 0 20px rgba(239, 68, 68, 0.85)'
                      : '0 0 18px rgba(59, 130, 246, 0.85)',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opponentAttackAlert.isDirect ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', padding: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>LP</div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#fef08a' }}>{state.players[0].lifePoints}</div>
                    </div>
                  ) : (
                    <img
                      src={
                        opponentAttackAlert.defenderPosition === 'face_down_defense'
                          ? '/assets/card_back.png'
                          : getCardImageUrl(opponentAttackAlert.defenderCard, 'full')
                      }
                      alt={opponentAttackAlert.defenderCard?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'var(--pharaoh-gold-bright)',
                    maxWidth: 110,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {opponentAttackAlert.isDirect
                    ? 'نقاط حياتك'
                    : opponentAttackAlert.defenderPosition === 'face_down_defense'
                    ? 'دفاع مقلوب (سري)'
                    : opponentAttackAlert.defenderCard?.arabicName || opponentAttackAlert.defenderCard?.name}
                </div>
                <span
                  style={{
                    background: opponentAttackAlert.isDirect
                      ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
                      : opponentAttackAlert.defenderPosition === 'face_up_defense'
                      ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
                      : opponentAttackAlert.defenderPosition === 'face_down_defense'
                      ? 'rgba(0,0,0,0.6)'
                      : 'linear-gradient(135deg, #78350f, #d97706)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {opponentAttackAlert.isDirect
                    ? 'ضربة مباشرة'
                    : opponentAttackAlert.defenderPosition === 'face_up_defense'
                    ? `${opponentAttackAlert.defenderDef || opponentAttackAlert.defenderCard?.def || 0} DEF`
                    : opponentAttackAlert.defenderPosition === 'face_down_defense'
                    ? 'دفاع مقلوب'
                    : `${opponentAttackAlert.defenderAtk || opponentAttackAlert.defenderCard?.atk || 0} ATK`}
                </span>
              </div>
            </div>

            {/* Expected LP impact warning badge */}
            <div
              style={{
                width: '100%',
                marginTop: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background:
                  opponentAttackAlert.damagePlayerIdx === 1 && opponentAttackAlert.damage > 0
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.5))'
                    : opponentAttackAlert.damagePlayerIdx === 0 && opponentAttackAlert.damage > 0
                    ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.35), rgba(127, 29, 29, 0.5))'
                    : 'rgba(0, 0, 0, 0.5)',
                border:
                  opponentAttackAlert.damagePlayerIdx === 1 && opponentAttackAlert.damage > 0
                    ? '1.5px solid #34d399'
                    : opponentAttackAlert.damagePlayerIdx === 0 && opponentAttackAlert.damage > 0
                    ? '1.5px solid #ef4444'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {opponentAttackAlert.damagePlayerIdx === 1 && opponentAttackAlert.damage > 0 ? (
                <span style={{ color: '#6ee7b7' }}>
                  تنبيه: فرق القوة لصالحك! الخصم سيفقد -{opponentAttackAlert.damage} LP ارتداد!
                </span>
              ) : opponentAttackAlert.damagePlayerIdx === 0 && opponentAttackAlert.damage > 0 ? (
                <span style={{ color: '#fca5a5' }}>
                  تحذير: فرق القوة لخصمك! ستفقد -{opponentAttackAlert.damage} LP من نقاط حياتك!
                </span>
              ) : (
                <span style={{ color: '#fde047' }}>
                  {opponentAttackAlert.isDirect ? 'ضربة مباشرة محجوبة' : 'لن يتأثر دم أي مبارز في هذا الهجوم (0 LP)'}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Hazard Warning Stripe */}
          <div className="opponent-hazard-stripe bottom">
            <span>جهّز نفسك للدفاع والرد!</span>
            <span style={{ opacity: 0.85, fontSize: 10 }}>IMPACT IMMINENT</span>
            <span>جهّز نفسك للدفاع والرد!</span>
          </div>
        </div>
      )}

      {/* Post-Attack Combat Clash Verdict (Clear LP Deduction & Outcome Breakdown) */}
      {combatClashVerdict && (
        <div
          className="combat-clash-verdict-overlay"
          onClick={() => setCombatClashVerdict(null)}
        >
          <div
            className="combat-clash-verdict-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="verdict-header">
              <div className="verdict-tag">نتيجة الاشتباك والمعركة</div>
              <button
                onClick={() => setCombatClashVerdict(null)}
                className="verdict-close-btn"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Verdict Headline */}
            <div
              className={`verdict-headline ${
                combatClashVerdict.damagePlayerIdx === 1 && combatClashVerdict.damage > 0
                  ? 'verdict-win'
                  : combatClashVerdict.defenderDestroyed || (combatClashVerdict.damagePlayerIdx === 0 && combatClashVerdict.damage > 0)
                  ? 'verdict-loss'
                  : 'verdict-neutral'
              }`}
            >
              {(() => {
                const v = combatClashVerdict;
                if (v.trapTriggered) {
                  return 'تم صد وإبطال الهجوم بنجاح بتأثير فخ محكم!';
                }
                if (v.isDirect) {
                  return `ضربة مباشرة من الخصم! خسرت ${v.damage} نقطة حياة!`;
                }
                if (v.attackerDestroyed && v.defenderDestroyed) {
                  return 'تدمير متبادل! تساوت قوى الهجوم فدُمّر الوحشان معاً!';
                }
                if (v.damagePlayerIdx === 1 && v.damage > 0) {
                  return `صمود دفاعي خارق! وحشك صمد والخصم خسر ${v.damage} نقطة حياة ارتداد!`;
                }
                if (v.defenderDestroyed && v.damage > 0) {
                  return `تم تدمير وحشك [${v.defenderCard?.arabicName || v.defenderCard?.name || 'وحشك'}] وخسرت ${v.damage} نقطة حياة!`;
                }
                if (v.defenderDestroyed && v.damage === 0) {
                  return `تم كسر دفاع وحشك [${v.defenderCard?.arabicName || v.defenderCard?.name || 'وحشك'}] وتدميره (بدون خسارة دم)!`;
                }
                if (v.isDefenseBlocked && v.damage === 0) {
                  return 'صمود دفاعي! هجوم الخصم فشل في اختراق دفاع وحشك.';
                }
                if (v.attackerDestroyed) {
                  return `هجوم مضاد ساحق! تم تدمير وحش الخصم وتلقى ${v.damage} ضرر!`;
                }
                return v.log || 'اكتمل الاشتباك بين الوحشين في ساحة المعركة.';
              })()}
            </div>

            {/* EXACT LP DEDUCTION HIGHLIGHT BOX (المطلوب من المستخدم بدقة) */}
            {combatClashVerdict.damagePlayerIdx === 0 && combatClashVerdict.damage > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.35), rgba(153, 27, 27, 0.55))',
                  border: '1.5px solid #ef4444',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.5)',
                  borderRadius: 6,
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#fee2e2',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 900 }}>الدم المنقوص من نقاط حياتك:</span>
                  <span style={{ fontSize: 10.5, color: '#fca5a5' }}>
                    {combatClashVerdict.isDirect
                      ? 'بسبب هجوم مباشر غير محجوب'
                      : `فارق القوة: (${combatClashVerdict.attackerAtk}) ضد (${combatClashVerdict.defenderPosition === 'face_up_defense' ? combatClashVerdict.defenderDef : combatClashVerdict.defenderAtk})`}
                  </span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#f87171', letterSpacing: 0.5 }}>
                  -{combatClashVerdict.damage} LP
                </span>
              </div>
            )}

            {combatClashVerdict.damagePlayerIdx === 1 && combatClashVerdict.damage > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.55))',
                  border: '1.5px solid #34d399',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
                  borderRadius: 6,
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#d1fae5',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: '#6ee7b7' }}>
                    الدم المنقوص من الخصم (لصالحك!):
                  </span>
                  <span style={{ fontSize: 10.5, color: '#a7f3d0' }}>
                    فرق النقاط لصالح وحشك: صمود وحشك سبب ضرر ارتدادي
                  </span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#34d399', letterSpacing: 0.5 }}>
                  -{combatClashVerdict.damage} LP
                </span>
              </div>
            )}

            {combatClashVerdict.damage === 0 && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 6,
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--pharaoh-text-gold)',
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 800 }}>تأثير نقاط الحياة:</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  لم ينقص دم أي لاعب (0 LP)
                </span>
              </div>
            )}

            {/* Side-by-Side Clash Details */}
            <div className="verdict-clash-row">
              {/* Opponent Attacker */}
              <div className="verdict-fighter opponent">
                <div className="fighter-role">وحش الخصم المهاجم</div>
                <div className="fighter-card-box">
                  <img
                    src={getCardImageUrl(combatClashVerdict.attackerCard, 'full')}
                    alt={combatClashVerdict.attackerCard?.name}
                    onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                  />
                </div>
                <div className="fighter-name">
                  {combatClashVerdict.attackerCard?.arabicName || combatClashVerdict.attackerCard?.name}
                </div>
                <div className="fighter-stat-badge attack">
                  {combatClashVerdict.attackerAtk || combatClashVerdict.attackerCard?.atk || 0} ATK
                </div>
                <div className={`fighter-status-pill ${combatClashVerdict.attackerDestroyed ? 'destroyed' : 'survived'}`}>
                  {combatClashVerdict.attackerDestroyed ? 'تم تدميره' : 'صامد في الساحة'}
                </div>
              </div>

              {/* VS Badge */}
              <div className="verdict-vs-badge">
                <span>VS</span>
              </div>

              {/* Player Defender / Target */}
              <div className="verdict-fighter player">
                <div className="fighter-role">هدفك (المدافع)</div>
                <div className="fighter-card-box">
                  {combatClashVerdict.isDirect ? (
                    <div className="direct-target-box">
                      <div className="direct-icon">LP</div>
                      <div className="direct-val">{state.players[0].lifePoints}</div>
                    </div>
                  ) : (
                    <img
                      src={
                        combatClashVerdict.wasFlipped || combatClashVerdict.defenderPosition !== 'face_down_defense'
                          ? getCardImageUrl(combatClashVerdict.defenderCard, 'full')
                          : '/assets/card_back.png'
                      }
                      alt={combatClashVerdict.defenderCard?.name}
                      onError={(e) => { e.target.src = '/assets/card_back.png'; }}
                    />
                  )}
                </div>
                <div className="fighter-name">
                  {combatClashVerdict.isDirect
                    ? 'نقاط حياتك'
                    : combatClashVerdict.defenderCard?.arabicName || combatClashVerdict.defenderCard?.name}
                </div>
                <div
                  className={`fighter-stat-badge ${
                    combatClashVerdict.isDirect
                      ? 'lp'
                      : combatClashVerdict.defenderPosition === 'face_up_attack'
                      ? 'attack'
                      : 'defense'
                  }`}
                >
                  {combatClashVerdict.isDirect
                    ? `ضرر: -${combatClashVerdict.damage} LP`
                    : combatClashVerdict.defenderPosition === 'face_up_attack'
                    ? `${combatClashVerdict.defenderAtk || combatClashVerdict.defenderCard?.atk || 0} ATK`
                    : `${combatClashVerdict.defenderDef || combatClashVerdict.defenderCard?.def || 0} DEF`}
                </div>
                <div
                  className={`fighter-status-pill ${
                    combatClashVerdict.isDirect
                      ? 'lp-hit'
                      : combatClashVerdict.defenderDestroyed
                      ? 'destroyed'
                      : 'survived'
                  }`}
                >
                  {combatClashVerdict.isDirect
                    ? combatClashVerdict.damage > 0
                      ? `نقص ${combatClashVerdict.damage} LP`
                      : 'لم يتأثر'
                    : combatClashVerdict.defenderDestroyed
                    ? 'تم تدميره وإرساله للمقبرة'
                    : 'صامد في الساحة'}
                </div>
              </div>
            </div>

            {/* Explanation sentence */}
            <div className="verdict-explanation">
              {combatClashVerdict.log || (
                combatClashVerdict.isDirect
                  ? `ضربة مباشرة من وحش الخصم بقوة ${combatClashVerdict.attackerAtk} نقطة أدت لنقصان دمك.`
                  : combatClashVerdict.damagePlayerIdx === 1 && combatClashVerdict.damage > 0
                  ? `دفاع وحشك (${combatClashVerdict.defenderDef}) تفوق على هجوم الخصم (${combatClashVerdict.attackerAtk})، فالفرق (${combatClashVerdict.damage} نقاط) ارتد وخصم من دم الخصم!`
                  : combatClashVerdict.defenderDestroyed
                  ? `تفوقت قوة هجوم الخصم (${combatClashVerdict.attackerAtk}) على قوة وحشك (${combatClashVerdict.defenderPosition === 'face_up_attack' ? combatClashVerdict.defenderAtk : combatClashVerdict.defenderDef}) فتم القضاء عليه.`
                  : 'نجح دفاع وحشك في امتصاص الهجوم وحماية ساحتك بنجاح.'
              )}
            </div>

            {/* Dismiss Action */}
            <button
              onClick={() => setCombatClashVerdict(null)}
              className="btn-pharaoh-gold verdict-confirm-btn"
            >
              متابعة المعركة
            </button>
          </div>
        </div>
      )}

      {/* Opponent Turn Ended & Player Turn Announcement Herald */}
      {turnTransitionBanner && (
        <div
          className="turn-herald-container"
          onClick={() => setTurnTransitionBanner(null)}
          title="اضغط لتخطي الإشعار فوراً"
        >
          <div className="turn-herald-overlay" />
          <div className="turn-herald-ribbon">
            <div className="turn-herald-sheen" />

            {/* Top Bar: Opponent Completed Turn + Turn Number */}
            <div className="turn-herald-header">
              <span className="turn-herald-badge-opponent">
                أنهى {turnTransitionBanner.opponentName} دوره
              </span>
              <span className="turn-herald-badge-turn">
                الدور {turnTransitionBanner.turnNumber}
              </span>
            </div>

            {/* Main Herald Announcement with Pharaonic Wings */}
            <div className="turn-herald-body">
              <svg className="turn-herald-wing wing-left" width="28" height="16" viewBox="0 0 40 20" fill="none">
                <defs>
                  <linearGradient id="turnHeraldGoldLeft" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <path d="M40 10 C25 2, 10 8, 0 2 C5 12, 20 16, 40 10 Z" fill="url(#turnHeraldGoldLeft)" opacity="0.9" />
                <path d="M35 12 C22 6, 12 11, 4 6" stroke="rgba(255, 235, 170, 0.7)" strokeWidth="1.2" />
              </svg>

              <div className="turn-herald-headline">
                {turnTransitionBanner.title}
              </div>

              <svg className="turn-herald-wing wing-right" width="28" height="16" viewBox="0 0 40 20" fill="none">
                <defs>
                  <linearGradient id="turnHeraldGoldRight" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <path d="M0 10 C15 2, 30 8, 40 2 C35 12, 20 16, 0 10 Z" fill="url(#turnHeraldGoldRight)" opacity="0.9" />
                <path d="M5 12 C18 6, 28 11, 36 6" stroke="rgba(255, 235, 170, 0.7)" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Subtitle / Call to action */}
            <div className="turn-herald-sub">
              {turnTransitionBanner.subtitle}
            </div>

            {/* Quick Tap Dismiss Hint */}
            <div className="turn-herald-dismiss-hint">
              اضغط في أي مكان للمتابعة فوراً
            </div>
          </div>
        </div>
      )}

      {/* Deck Shuffle Opening Animation on Duel Start */}
      {showShuffle && (
        <ShuffleAnimation
          playerName={p0.name}
          opponentName={p1.name}
          onComplete={() => setShowShuffle(false)}
        />
      )}

      {/* Dynamic Blood-Red Damage Screen Vignette & Flash when player takes hit */}
      {damageFlash && damageFlash.playerIndex === 0 && (
        <div className="damage-hit-overlay">
          <div className="damage-blood-vignette" />
          <div className="damage-center-flash" />
          <div className="damage-shatter-lines" />
        </div>
      )}

      {/* Epic Legendary Monster Tribute Ascension Ritual Cut-in */}
      {tributeAscensionAnimation && (
        <div className="tribute-ritual-overlay">
          {/* Sacrificial Conic Speedlines */}
          <div className="ritual-bg-speedlines" />

          {/* Millennium Eye Emblem */}
          <div className="ritual-sacred-emblem">
            <svg width="280" height="280" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="10 6" opacity="0.7" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
              <path d="M 40 100 Q 100 40 160 100 Q 100 160 40 100 Z" fill="rgba(245, 158, 11, 0.15)" stroke="#facc15" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="22" fill="#ef4444" stroke="#facc15" strokeWidth="2" />
              <circle cx="100" cy="100" r="9" fill="#000" />
              <text x="100" y="22" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="900">𓃭</text>
              <text x="180" y="105" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="900">𓋹</text>
              <text x="100" y="188" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="900">𓊽</text>
              <text x="20" y="105" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="900">𓂀</text>
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Banner: Sacrificial Ceremony */}
            <div className="tribute-ascension-banner">
              <span style={{ fontSize: 18 }}>𓊽</span>
              <span>
                {tributeAscensionAnimation.stage === 'sacrificing'
                  ? `طقوس التضحية الكبرى بالوحوش!`
                  : `استدعاء بالتضحية: صعود ${tributeAscensionAnimation.summoningCard?.arabicName || tributeAscensionAnimation.summoningCard?.name}!`}
              </span>
              <span style={{ fontSize: 18 }}>𓊽</span>
            </div>

            {/* Stage 1: Sacrificed Monsters Dissolving with Rising Soul Flames */}
            {tributeAscensionAnimation.stage === 'sacrificing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 800, marginBottom: 12, textShadow: '0 0 10px #ef4444' }}>
                  تقديم أرواح الوحوش قرباناً للبوابة الفرعونية...
                </div>
                <div className="tribute-sacrificed-souls-row">
                  {(tributeAscensionAnimation.sacrificedCards || []).map((sCard, sIdx) => (
                    <div key={`soul-${sIdx}`} className="tribute-soul-card-wrap">
                      <div className="tribute-soul-pillar-flame" />
                      {sCard?.image ? (
                        <img
                          src={getCardImageUrl(sCard, 'art')}
                          alt={sCard.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#450a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fef08a', fontSize: 10, fontWeight: 900, textAlign: 'center', padding: 4 }}>
                          {sCard?.arabicName || sCard?.name || 'وحش مضحى'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2: Ascended Boss Monster Epic Cut-in */}
            {tributeAscensionAnimation.stage === 'ascending' && (
              <div className="tribute-ascended-showcase">
                <div className="tribute-ascended-card-frame">
                  <img
                    src={getCardImageUrl(tributeAscensionAnimation.summoningCard, 'full')}
                    alt={tributeAscensionAnimation.summoningCard?.name}
                    className="tribute-ascended-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getCardImageUrl(tributeAscensionAnimation.summoningCard, 'art');
                    }}
                  />
                  <div className="tribute-ascended-sheen" />
                </div>

                <div className="tribute-ascended-stats-box">
                  <div className="tribute-ascended-name">
                    {tributeAscensionAnimation.summoningCard?.arabicName || tributeAscensionAnimation.summoningCard?.name}
                  </div>
                  <div className="tribute-ascended-stars">
                    {Array.from({ length: Math.min(12, tributeAscensionAnimation.summoningCard?.level || 7) }).map((_, i) => (
                      <span key={`star-${i}`}>★</span>
                    ))}
                  </div>
                  <div className="tribute-ascended-atk-pill">
                    <span className="tribute-ascended-atk-label">هجوم أسطوري:</span>
                    <span className="tribute-ascended-atk-val">{tributeAscensionAnimation.summoningCard?.atk || 0} ATK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 2v2 Tag Team - Teammate Hand Drawer */}
      {state.isTagMode && (
        <TeammateHandDrawer
          isOpen={isTeammateDrawerOpen}
          onClose={() => setIsTeammateDrawerOpen(false)}
          teammateName={p0.teammateName || 'الزميل'}
          teammateHand={p0.teammateHand || []}
          isMyTeamTurn={state.currentTurnPlayer === 0}
          canPlayActions={state.phase === 'MAIN1' || state.phase === 'MAIN2'}
          handVisibility={state.tagSettings?.teammateHandVisibility || 'visible'}
          onSummonFromTeammate={(handIdx, position) => {
            const emptyZone = p0.monsterZones.findIndex((z) => z === null);
            if (emptyZone === -1) {
              showGameToast('الساحة ممتلئة بالوحوش! مافيش مكان شاغر يا بطل.', 2200);
              return;
            }
            try {
              executeAndBroadcast('normalSummonFromTeammate', handIdx, emptyZone, position, []);
              soundManager.playSummon();
            } catch (e) {
              showGameToast(e.message, 2400);
            }
          }}
          onSetFromTeammate={(handIdx) => {
            const card = p0.teammateHand?.[handIdx];
            if (!card) return;
            if (card.type === 'monster') {
              const emptyZone = p0.monsterZones.findIndex((z) => z === null);
              if (emptyZone === -1) {
                showGameToast('الساحة ممتلئة بالوحوش! مافيش مكان شاغر يا بطل.', 2200);
                return;
              }
              try {
                executeAndBroadcast('normalSummonFromTeammate', handIdx, emptyZone, 'face_down_defense', []);
                soundManager.playSummon();
              } catch (e) {
                showGameToast(e.message, 2400);
              }
            } else {
              const emptyST = p0.spellTrapZones.findIndex((z) => z === null);
              if (emptyST === -1) {
                showGameToast('خانات السحر والفخاخ مليانة على الآخر!', 2200);
                return;
              }
              try {
                executeAndBroadcast('setSpellTrapFromTeammate', handIdx, emptyST);
                soundManager.playCardMove();
              } catch (e) {
                showGameToast(e.message, 2400);
              }
            }
          }}
          onActivateSpellFromTeammate={(handIdx) => {
            try {
              executeAndBroadcast('activateSpellFromTeammate', handIdx, null);
              soundManager.play('magic');
            } catch (e) {
              showGameToast(e.message, 2400);
            }
          }}
          onSwapHands={() => {
            executeAndBroadcast('switchActiveHand', 0);
          }}
          onSendPing={(pingType, text) => {
            if (isMultiplayer) {
              connectionManager.sendTeamPing(pingType, text);
            }
          }}
          onInspectCard={(card) => {
            setInspectCard(card);
          }}
        />
      )}

      {/* 2v2 Incoming Tactical Ping Banner */}
      {activeTeamPing && (
        <div
          style={{
            position: 'fixed',
            top: 55,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9990,
            background: 'linear-gradient(135deg, rgba(30, 22, 12, 0.96), rgba(15, 12, 8, 0.98))',
            border: '2px solid var(--pharaoh-gold-bright)',
            borderRadius: 30,
            padding: '8px 24px',
            boxShadow: '0 0 25px rgba(240, 203, 100, 0.65), 0 8px 24px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <span style={{ fontSize: 18, color: 'var(--pharaoh-gold-bright)' }}>𓁹</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
              إشارة تكتيكية من أخوك [{activeTeamPing.senderName || 'الزميل'}]:
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 1 }}>
              {activeTeamPing.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
