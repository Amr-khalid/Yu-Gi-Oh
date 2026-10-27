import React, { useState, useEffect, useRef } from 'react';
import { connectionManager } from '../../multiplayer/ConnectionManager.js';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { TagTeamLobbyView } from '../components/TagTeamLobbyView.jsx';
import { getRandomArenaTheme } from '../../game/utils/arenaThemes.js';

/* Pure SVG Icons (Zero Emojis, Executive Authentic Egyptian Vector Art) */
const ArrowBackIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SunIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);

const MoonIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const UserIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CopyIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const WifiIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
  </svg>
);

const BluetoothIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
  </svg>
);

const RadioTowerIcon = ({ size = 26, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

const SwordsCombatIcon = ({ size = 26, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="M9.5 6.5l8 8" />
  </svg>
);

const CheckCircleIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CrownIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const ZapIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const MillenniumEyeIcon = ({ size = 42, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Eyebrow / Pyramid Cap */}
    <path d="M 12,38 Q 50,14 88,38" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Main Almond Eye Outline */}
    <path d="M 10,48 Q 50,22 90,48 Q 50,74 10,48 Z" fill="none" stroke={color} strokeWidth="4.5" />
    {/* Central Iris & Pupil with Radiant Iris Ring */}
    <circle cx="50" cy="48" r="14" fill="none" stroke={color} strokeWidth="3" />
    <circle cx="50" cy="48" r="7.5" fill={color} />
    {/* Tear / Falcon Markings below eye */}
    <path d="M 50,62 L 50,86" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <path d="M 68,60 C 74,74 84,78 88,72 C 92,64 85,58 78,60" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

/* =========================================================================
   AUTHENTIC PHARAONIC ENGRAVINGS & ROYAL MOTIFS (Zero Emojis, Pure SVG)
   ========================================================================= */

const PharaohWingedSunFrieze = ({ color = 'var(--pharaoh-gold-bright)', height = 44, width = '100%' }) => (
  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '2px 0 8px', overflow: 'hidden' }}>
    <svg width={width} height={height} viewBox="0 0 520 48" preserveAspectRatio="xMidYMid meet" fill="none">
      {/* Central Solar Disk & Radiant Aura */}
      <circle cx="260" cy="24" r="16" fill="var(--pharaoh-gold-bright)" />
      <circle cx="260" cy="24" r="19" stroke="var(--pharaoh-gold-bright)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="260" cy="24" r="8" fill="#1c140a" opacity="0.3" />

      {/* Sacred Uraeus Serpents (Cobras of Lower and Upper Egypt) */}
      <path d="M 244 26 C 238 18 243 12 239 8 C 237 5 233 7 234 11 C 236 15 244 23 244 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M 276 26 C 282 18 277 12 281 8 C 283 5 287 7 286 11 C 284 15 276 23 276 26" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Left Royal Wings (Curved Horus Feathers) */}
      <path d="M 240 20 C 185 10 115 12 18 28 C 95 23 170 23 240 28 Z" fill="none" stroke={color} strokeWidth="2.2" opacity="0.9" />
      <path d="M 238 25 C 175 19 120 21 44 35 C 110 30 175 30 238 33 Z" fill="none" stroke={color} strokeWidth="1.7" opacity="0.75" />
      <path d="M 236 30 C 180 27 130 30 72 42 C 130 36 180 36 236 38 Z" fill="none" stroke={color} strokeWidth="1.3" opacity="0.55" />

      {/* Right Royal Wings (Curved Horus Feathers) */}
      <path d="M 280 20 C 335 10 405 12 502 28 C 425 23 350 23 280 28 Z" fill="none" stroke={color} strokeWidth="2.2" opacity="0.9" />
      <path d="M 282 25 C 345 19 400 21 476 35 C 410 30 345 30 282 33 Z" fill="none" stroke={color} strokeWidth="1.7" opacity="0.75" />
      <path d="M 284 30 C 340 27 390 30 448 42 C 390 36 340 36 284 38 Z" fill="none" stroke={color} strokeWidth="1.3" opacity="0.55" />
    </svg>
  </div>
);

const PharaohHieroglyphRibbon = ({ style = {}, opacity = 0.85 }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      fontFamily: '"Segoe UI Historic", "Noto Sans Egyptian Hieroglyphs", "Segoe UI Symbol", sans-serif',
      fontSize: 16,
      letterSpacing: 6,
      color: 'var(--pharaoh-gold-bright)',
      opacity,
      userSelect: 'none',
      direction: 'ltr',
      ...style,
    }}
  >
    <span>𓋹</span>
    <span>𓂀</span>
    <span>𓆣</span>
    <span>𓊽</span>
    <span>𓅃</span>
    <span>𓇳</span>
    <span>𓆸</span>
    <span>𓎛</span>
    <span>𓃭</span>
  </div>
);

const PharaohCornerEngraving = ({ position = 'top-left', size = 26, color = 'var(--pharaoh-gold-bright)' }) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={{
        position: 'absolute',
        top: isTop ? 4 : 'auto',
        bottom: !isTop ? 4 : 'auto',
        left: isLeft ? 4 : 'auto',
        right: !isLeft ? 4 : 'auto',
        transform: `scale(${isLeft ? 1 : -1}, ${isTop ? 1 : -1})`,
        pointerEvents: 'none',
        opacity: 0.8,
        zIndex: 5,
      }}
    >
      <path d="M 2 30 V 7 C 2 4.2 4.2 2 7 2 H 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 7 30 V 11 C 7 8.8 8.8 7 11 7 H 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="11" cy="11" r="2.5" fill={color} />
      <path d="M 16 7 C 20 7 24 11 24 16" stroke={color} strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
};

const PharaohMuralWatermark = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1,
      overflow: 'hidden',
      opacity: 0.05,
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" fill="none">
      <g stroke="var(--pharaoh-gold-bright)" strokeWidth="1.5">
        {/* Left Hieroglyphic Pillar */}
        <text x="60" y="140" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓋹</text>
        <text x="60" y="210" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓂀</text>
        <text x="60" y="280" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓆣</text>
        <text x="60" y="350" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓊽</text>
        <text x="60" y="420" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓅃</text>
        <text x="60" y="490" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓇳</text>
        <text x="60" y="560" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓆸</text>
        <text x="60" y="630" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓎛</text>
        <text x="60" y="700" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓃭</text>
        <line x1="35" y1="80" x2="35" y2="840" strokeWidth="2.5" strokeDasharray="10 6" />
        <line x1="115" y1="80" x2="115" y2="840" strokeWidth="2.5" strokeDasharray="10 6" />

        {/* Right Hieroglyphic Pillar */}
        <text x="1105" y="140" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓃭</text>
        <text x="1105" y="210" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓎛</text>
        <text x="1105" y="280" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓆸</text>
        <text x="1105" y="350" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓇳</text>
        <text x="1105" y="420" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓅃</text>
        <text x="1105" y="490" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓊽</text>
        <text x="1105" y="560" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓆣</text>
        <text x="1105" y="630" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓂀</text>
        <text x="1105" y="700" fontSize="38" fontFamily="Segoe UI Historic" fill="var(--pharaoh-gold-bright)">𓋹</text>
        <line x1="1085" y1="80" x2="1085" y2="840" strokeWidth="2.5" strokeDasharray="10 6" />
        <line x1="1165" y1="80" x2="1165" y2="840" strokeWidth="2.5" strokeDasharray="10 6" />

        {/* Great Pyramid Apex & Lotus Barque */}
        <polygon points="600,260 380,640 820,640" strokeWidth="2" opacity="0.6" />
        <polygon points="600,260 600,640 820,640" strokeWidth="1.2" opacity="0.35" fill="rgba(240, 203, 100, 0.04)" />
        <circle cx="600" cy="450" r="56" strokeWidth="2" strokeDasharray="8 5" />
        <circle cx="600" cy="450" r="32" strokeWidth="1.5" />
      </g>
    </svg>
  </div>
);

export const MultiplayerScreen = ({ onBack, onStartDuel, theme, onToggleTheme }) => {
  const [status, setStatus] = useState(connectionManager.getStatus());
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'hosting' | 'joining'
  const [playerName, setPlayerName] = useState(() => {
    try {
      const sessionSaved = sessionStorage.getItem('yugioh_player_name');
      if (sessionSaved) return sessionSaved;
    } catch (e) {}
    return 'المبارز ' + (Math.floor(Math.random() * 90) + 10);
  });
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [showConnectAnimation, setShowConnectAnimation] = useState(false);
  const [countdownValue, setCountdownValue] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [customHostIp, setCustomHostIp] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_last_host_ip') : null) || '192.168.43.1';
  });
  const [ipMode, setIpMode] = useState('hotspot'); // 'hotspot' | 'custom'
  const [isConnectingByCode, setIsConnectingByCode] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 640 : true;
  });

  const [selectedMode, setSelectedMode] = useState('1v1'); // '1v1' | 'tag_2v2'
  const [customTagSettings, setCustomTagSettings] = useState({
    lifePoints: 16000,
    summonRule: 'per_player',
    graveyardShare: true,
    turnTimer: 90,
  });

  const prevConnectedRef = useRef(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    connectionManager.setMyName(playerName);
  }, [playerName]);

  // Synchronized countdown trigger
  const runSynchronizedCountdown = (seed, hostName, clientName, extra = null) => {
    setCountdownValue('3');
    soundManager.play('click');
    hapticManager.triggerCombatVibration('click');

    setTimeout(() => {
      setCountdownValue('2');
      soundManager.play('click');
    }, 600);

    setTimeout(() => {
      setCountdownValue('1');
      soundManager.play('click');
    }, 1200);

    setTimeout(() => {
      setCountdownValue('DUEL');
      soundManager.play('start');
      hapticManager.vibrate([150, 80, 300]);
    }, 1800);

    setTimeout(() => {
      setCountdownValue(null);
      const isHost = connectionManager.role === 'host';
      const isTag = (extra?.gameMode || status.gameMode || connectionManager.gameMode || selectedMode) === 'tag_2v2';
      
      let myActualName = isHost ? hostName : clientName;
      let peerActualName = isHost ? clientName : hostName;
      let teammateActualName = null;
      let myActualSlot = typeof status.mySlot === 'number' ? status.mySlot : (typeof connectionManager.mySlot === 'number' ? connectionManager.mySlot : (isHost ? 0 : 1));
      let myActualTeam = typeof status.myTeam === 'number' ? status.myTeam : (typeof connectionManager.myTeam === 'number' ? connectionManager.myTeam : (myActualSlot < 2 ? 0 : 1));

      if (isTag) {
        const allSlots = extra?.slots || status.tagSlots || connectionManager.tagSlots || [];
        myActualName = allSlots[myActualSlot]?.name || playerName;
        const isTeam0 = myActualTeam === 0;
        const tmSlot = isTeam0 ? (myActualSlot === 0 ? 1 : 0) : (myActualSlot === 2 ? 3 : 2);
        const oppLeaderSlot = isTeam0 ? 2 : 0;
        teammateActualName = allSlots[tmSlot]?.name || (isHost ? 'الزميل' : 'المستضيف');
        peerActualName = allSlots[oppLeaderSlot]?.name || 'فريق الخصم';
      }

      onStartDuel({
        isHost,
        seed,
        gameMode: isTag ? 'tag_2v2' : '1v1',
        slots: extra?.slots || status.tagSlots || connectionManager.tagSlots || [],
        settings: extra?.settings || status.tagSettings || connectionManager.tagSettings || customTagSettings,
        mySlot: myActualSlot,
        myTeam: myActualTeam,
        myName: myActualName,
        teammateName: teammateActualName,
        peerName: peerActualName,
        startingPlayer: 0,
        arenaId: extra?.arenaId || connectionManager.syncedArenaId || null,
      });
    }, 2600);
  };

  useEffect(() => {
    const unsubStatus = connectionManager.onStatusChange((s) => {
      setStatus(s);
      // Trigger majestic connection animation when connection is newly established
      if (s.connected && !prevConnectedRef.current) {
        prevConnectedRef.current = true;
        soundManager.play('start');
        setTimeout(() => soundManager.play('decide'), 320);
        hapticManager.vibrate([100, 50, 150, 80, 250]);
        setShowConnectAnimation(true);
        setActionState('idle');
        setIsConnectingByCode(false);
      } else if (!s.connected) {
        prevConnectedRef.current = false;
        setShowConnectAnimation(false);
        setIsConnectingByCode(false);
      }
    });

    const unsubMsg = connectionManager.onMessage((msg) => {
      // Countdown trigger from peer or host
      if (msg.type === 'DUEL_COUNTDOWN_START') {
        connectionManager.matchSeed = msg.seed;
        if (msg.arenaId) connectionManager.syncedArenaId = msg.arenaId;
        runSynchronizedCountdown(msg.seed, msg.hostName, msg.clientName, msg);
      } else if (msg.type === 'START_DUEL') {
        connectionManager.matchSeed = msg.seed;
        if (msg.arenaId) connectionManager.syncedArenaId = msg.arenaId;
        const isHost = connectionManager.role === 'host';
        const isTag = (msg.gameMode || status.gameMode || connectionManager.gameMode) === 'tag_2v2';
        
        let myActualName = isHost ? msg.hostName : msg.clientName;
        let peerActualName = isHost ? msg.clientName : msg.hostName;
        let teammateActualName = null;
        let myActualSlot = typeof status.mySlot === 'number' ? status.mySlot : (typeof connectionManager.mySlot === 'number' ? connectionManager.mySlot : (isHost ? 0 : 1));
        let myActualTeam = typeof status.myTeam === 'number' ? status.myTeam : (typeof connectionManager.myTeam === 'number' ? connectionManager.myTeam : (myActualSlot < 2 ? 0 : 1));

        if (isTag) {
          const allSlots = msg.slots || status.tagSlots || connectionManager.tagSlots || [];
          myActualName = allSlots[myActualSlot]?.name || playerName;
          const isTeam0 = myActualTeam === 0;
          const tmSlot = isTeam0 ? (myActualSlot === 0 ? 1 : 0) : (myActualSlot === 2 ? 3 : 2);
          const oppLeaderSlot = isTeam0 ? 2 : 0;
          teammateActualName = allSlots[tmSlot]?.name || (isHost ? 'الزميل' : 'المستضيف');
          peerActualName = allSlots[oppLeaderSlot]?.name || 'فريق الخصم';
        }

        onStartDuel({
          isHost,
          seed: msg.seed,
          gameMode: isTag ? 'tag_2v2' : '1v1',
          slots: msg.slots || status.tagSlots || connectionManager.tagSlots || [],
          settings: msg.settings || status.tagSettings || connectionManager.tagSettings || customTagSettings,
          mySlot: myActualSlot,
          myTeam: myActualTeam,
          myName: myActualName,
          teammateName: teammateActualName,
          peerName: peerActualName,
          startingPlayer: 0,
          arenaId: msg.arenaId || connectionManager.syncedArenaId || null,
        });
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
      if (typeof connectionManager.stopHeartbeat === 'function') {
        connectionManager.stopHeartbeat();
      }
      if (typeof connectionManager.stopRoomPolling === 'function') {
        connectionManager.stopRoomPolling();
      }
    };
  }, [onStartDuel, playerName]);

  // Auto-dismiss the connection intro banner after 3.2s
  useEffect(() => {
    if (showConnectAnimation) {
      const timer = setTimeout(() => {
        setShowConnectAnimation(false);
      }, 3400);
      return () => clearTimeout(timer);
    }
  }, [showConnectAnimation]);

  const handleNameChange = (newName) => {
    setPlayerName(newName);
    try {
      sessionStorage.setItem('yugioh_player_name', newName);
    } catch (e) {}
    connectionManager.setMyName(newName);
  };

  const handleHost = (mode = selectedMode) => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    setActionState('hosting');
    connectionManager.host('wifi', playerName, mode, customTagSettings);
  };

  const handleJoin = () => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    setActionState('joining');
    const target = ipMode === 'hotspot' ? '192.168.43.1' : customHostIp;
    connectionManager.join('wifi', playerName, target);
  };

  const handleCancelAction = () => {
    soundManager.playClick();
    connectionManager.cancel();
    setActionState('idle');
    setIsConnectingByCode(false);
  };

  const handleJoinByCodeClick = async () => {
    const cleanCode = connectionManager.normalizeRoomCode(inputRoomCode);
    if (!cleanCode || cleanCode.length !== 4) {
      alert('اكتب رمز الغرفة المكون من 4 أرقام يا غالي عشان تدخل!');
      return;
    }
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    const target = ipMode === 'hotspot' ? '192.168.43.1' : customHostIp;
    setActionState('joining');
    setIsConnectingByCode(true);
    const ok = await connectionManager.joinByCode(cleanCode, target);
    if (!ok) {
      setIsConnectingByCode(false);
      alert('رمز الغرفة لازم يكون 4 أرقام بالظبط يا بطل!');
    }
  };

  const handleStartBotTagLobby = () => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    const slots = [
      { slotIndex: 0, team: 0, isOccupied: true, isHost: true, isBot: false, name: playerName || 'أنت' },
      { slotIndex: 1, team: 0, isOccupied: true, isHost: false, isBot: true, name: 'جوي ويلر (بوت)', botDifficulty: 'normal' },
      { slotIndex: 2, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'سيتو كايبا (بوت)', botDifficulty: 'hard' },
      { slotIndex: 3, team: 1, isOccupied: true, isHost: false, isBot: true, name: 'يامي ماريك (بوت)', botDifficulty: 'hard' },
    ];
    connectionManager.tagSlots = slots;
    connectionManager.gameMode = 'tag_2v2';
    connectionManager.mySlot = 0;
    connectionManager.myTeam = 0;
    connectionManager.roomCode = 'BOTS';
    connectionManager.role = 'host';
    setActionState('hosting');
    setStatus((prev) => ({
      ...prev,
      gameMode: 'tag_2v2',
      role: 'host',
      roomCode: 'BOTS',
      tagSlots: slots,
      mySlot: 0,
      myTeam: 0,
    }));
  };

  const handleStartDuelClick = () => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');

    const matchSeed = Math.floor(Math.random() * 1000000) + 1;
    connectionManager.matchSeed = matchSeed;

    const isHost = status.role === 'host';
    const isTag = (status.gameMode || connectionManager.gameMode || selectedMode) === 'tag_2v2';

    if (isTag) {
      let currentSlots = [...(status.tagSlots || connectionManager.tagSlots || [])];
      const botNames = ['جوي ويلر (بوت)', 'سيتو كايبا (بوت)', 'يامي ماريك (بوت)', 'بيغاسوس (بوت)'];

      for (let i = 0; i < 4; i++) {
        if (!currentSlots[i]) {
          currentSlots[i] = {
            slotIndex: i,
            team: i < 2 ? 0 : 1,
            isOccupied: false,
            isHost: i === 0,
            isBot: false,
            name: 'شاغر',
            botDifficulty: 'normal',
          };
        }
      }

      currentSlots = currentSlots.map((s, idx) => {
        if (!s.isOccupied) {
          return {
            ...s,
            isOccupied: true,
            isBot: true,
            name: botNames[idx % botNames.length],
            botDifficulty: 'normal',
          };
        }
        return s;
      });

      const finalSettings = status.tagSettings || connectionManager.tagSettings || customTagSettings;
      connectionManager.tagSlots = currentSlots;
      connectionManager.tagSettings = finalSettings;

      const savedArena = typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_theme') : null;
      const hostArenaId = (savedArena && savedArena !== 'random') ? savedArena : getRandomArenaTheme().id;

      connectionManager.send({
        type: 'DUEL_COUNTDOWN_START',
        seed: matchSeed,
        gameMode: 'tag_2v2',
        slots: currentSlots,
        settings: finalSettings,
        hostName: playerName,
        clientName: currentSlots[2]?.name || 'فريق الخصم',
        arenaId: hostArenaId,
      });

      runSynchronizedCountdown(matchSeed, playerName, currentSlots[2]?.name || 'فريق الخصم', {
        gameMode: 'tag_2v2',
        slots: currentSlots,
        settings: finalSettings,
        arenaId: hostArenaId,
      });
      return;
    }

    const hostName = isHost ? playerName : (status.peerName || 'المستضيف');
    const clientName = isHost ? (status.peerName || 'المنافس') : playerName;
    const savedArena1v1 = typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_theme') : null;
    const hostArenaId1v1 = (savedArena1v1 && savedArena1v1 !== 'random') ? savedArena1v1 : getRandomArenaTheme().id;

    // Send synchronized countdown signal to peer
    connectionManager.send({
      type: 'DUEL_COUNTDOWN_START',
      seed: matchSeed,
      hostName,
      clientName,
      arenaId: hostArenaId1v1,
    });

    // Run local countdown
    runSynchronizedCountdown(matchSeed, hostName, clientName, { arenaId: hostArenaId1v1 });
  };

  const handleCopyRoomCode = () => {
    if (status.roomCode && navigator.clipboard) {
      navigator.clipboard.writeText(status.roomCode).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        background: isLight
          ? 'radial-gradient(circle at 50% 20%, rgba(255, 252, 242, 0.86) 0%, rgba(228, 210, 175, 0.95) 85%), url(/assets/fie_desert.png) center/cover no-repeat fixed, var(--pharaoh-bg-deep)'
          : 'radial-gradient(circle at 50% 20%, rgba(28, 20, 12, 0.82) 0%, rgba(10, 8, 5, 0.95) 85%), url(/assets/fie_night.png) center/cover no-repeat fixed, url(/assets/title_bg.png) center/cover no-repeat fixed, var(--pharaoh-bg-deep)',
        backgroundColor: 'var(--pharaoh-bg-deep)',
        overflowY: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Ancient Egyptian Temple Tomb Wall Hieroglyphic Watermark */}
      <PharaohMuralWatermark />

      {/* 1. Distinctive Connection Celebration Animation Overlay */}
      {showConnectAnimation && (
        <div className="multiplayer-connect-overlay">
          {/* Pulsing Shockwave Rings */}
          <div className="multiplayer-link-shockwave" />
          <div className="multiplayer-link-shockwave multiplayer-link-shockwave-delay" />

          {/* Celestial Ancient Rings & Glowing Millennium Eye */}
          <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'glyphRingSpin 16s linear infinite',
                opacity: 0.75,
              }}
            >
              <circle cx="110" cy="110" r="102" fill="none" stroke="var(--pharaoh-gold-bright)" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="110" cy="110" r="92" fill="none" stroke="var(--pharaoh-gold-royal)" strokeWidth="1" opacity="0.4" />
              <text x="110" y="24" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓃭</text>
              <text x="196" y="114" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓋹</text>
              <text x="110" y="204" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓊽</text>
              <text x="24" y="114" textAnchor="middle" fill="var(--pharaoh-gold-bright)" fontSize="13" fontWeight="900">𓂀</text>
            </svg>

            <svg
              width="154"
              height="154"
              viewBox="0 0 154 154"
              style={{
                position: 'absolute',
                animation: 'glyphRingCounter 11s linear infinite',
                opacity: 0.85,
              }}
            >
              <circle cx="77" cy="77" r="70" fill="none" stroke="var(--pharaoh-gold-bright)" strokeWidth="2" strokeDasharray="12 8" />
              <circle cx="77" cy="77" r="58" fill="rgba(240, 203, 100, 0.08)" stroke="var(--pharaoh-gold-dark)" strokeWidth="1" />
            </svg>

            {/* Core Radiant Millennium Eye */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 82,
                height: 82,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(201, 158, 50, 0.75) 60%, rgba(20, 16, 10, 0.95) 100%)',
                boxShadow: '0 0 40px 12px rgba(240, 203, 100, 0.9)',
                animation: 'laserBeamPulse 2s ease-in-out infinite',
              }}
            >
              <MillenniumEyeIcon size={48} color="#1c140a" />
            </div>
          </div>

          {/* Duelists Clashing Cards Graphic */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              width: '92%',
              maxWidth: 520,
              margin: '20px 0 16px',
              position: 'relative',
              zIndex: 20,
            }}
          >
            {/* Host / You */}
            <div
              style={{
                flex: 1,
                background: 'linear-gradient(145deg, rgba(240, 203, 100, 0.15), var(--pharaoh-panel-bg))',
                border: '2px solid var(--pharaoh-gold-bright)',
                borderRadius: 12,
                padding: '16px 12px',
                textAlign: 'center',
                boxShadow: '0 0 24px rgba(240, 203, 100, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                animation: 'cardSlideInRight 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards',
              }}
            >
              <div style={{ display: 'inline-flex', padding: 6, borderRadius: '50%', background: 'rgba(240, 203, 100, 0.2)', marginBottom: 6, border: '1px solid var(--pharaoh-gold-bright)' }}>
                <CrownIcon size={20} color="var(--pharaoh-gold-bright)" />
              </div>
              <div style={{ fontSize: 11, color: 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
                {status.role === 'host' ? 'المستضيف الملكي' : 'أنت (المتحدي)'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-text-light)', marginTop: 3 }}>
                {playerName}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 10, color: '#4ade80', fontWeight: 800 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'beaconPulse 1.6s infinite' }} />
                متصل ومستعد
              </div>
            </div>

            {/* Central VS Emblem */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: 44 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  border: '2px solid #fef08a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 16,
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.85)',
                  animation: 'vsClashPop 0.8s cubic-bezier(0.2, 1.3, 0.4, 1) forwards',
                  zIndex: 5,
                }}
              >
                VS
              </div>
            </div>

            {/* Challenger / Opponent */}
            <div
              style={{
                flex: 1,
                background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.12), var(--pharaoh-panel-bg))',
                border: '2px solid #ef4444',
                borderRadius: 12,
                padding: '16px 12px',
                textAlign: 'center',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                animation: 'cardSlideInLeft 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards',
              }}
            >
              <div style={{ display: 'inline-flex', padding: 6, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', marginBottom: 6, border: '1px solid #ef4444' }}>
                <SwordsCombatIcon size={20} color="#f87171" />
              </div>
              <div style={{ fontSize: 11, color: '#f87171', fontWeight: 800 }}>
                {status.role === 'host' ? 'المنافس المتحدي' : 'المستضيف الملكي'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-text-light)', marginTop: 3 }}>
                {status.peerName || 'المنافس'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 10, color: '#4ade80', fontWeight: 800 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'beaconPulse 1.6s infinite' }} />
                متصل ومستعد
              </div>
            </div>
          </div>

          {/* Connection Status Details */}
          <div style={{ textAlign: 'center', zIndex: 20, padding: '0 16px' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', textShadow: '0 0 16px rgba(240, 203, 100, 0.7)' }}>
              تم ربط الأجهزة الملكية بنجاح!
            </div>
            <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)', marginTop: 4, fontWeight: 700 }}>
              ROYAL DUEL LINK ESTABLISHED • اتصال محلي فوري فائق السرعة
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(201, 158, 50, 0.15)',
                border: '1px solid var(--pharaoh-gold-dark)',
                borderRadius: 20,
                padding: '7px 18px',
                marginTop: 12,
                fontSize: 11.5,
                color: 'var(--pharaoh-text-light)',
              }}
            >
              <span>زمن الاستجابة: <strong style={{ color: '#4ade80' }}>{status.latencyMs || 1}ms</strong></span>
              <span>•</span>
              <span>القناة: <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>مباشرة ومستقرة 100%</strong></span>
            </div>
          </div>

          {/* Instant Dismiss Button */}
          <div style={{ marginTop: 22, zIndex: 20, width: '90%', maxWidth: 320 }}>
            <button
              onClick={() => setShowConnectAnimation(false)}
              className="btn-pharaoh-gold duel-btn-shine-wrap"
              style={{
                width: '100%',
                padding: '13px 0',
                fontSize: 15,
                fontWeight: 900,
                boxShadow: '0 0 20px rgba(240, 203, 100, 0.5)',
              }}
            >
              <span className="duel-btn-shine-sheen" />
              جاهز للماتش — ادخل دلوقتي
            </button>
          </div>
        </div>
      )}

      {/* 2. Synchronized Countdown Clash Overlay */}
      {countdownValue !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 8, 5, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            key={countdownValue}
            style={{
              fontSize: countdownValue === 'DUEL' ? 44 : 76,
              fontWeight: 900,
              color: countdownValue === 'DUEL' ? 'var(--pharaoh-gold-bright)' : '#fff',
              textShadow: '0 0 35px rgba(240, 203, 100, 0.95)',
              animation: countdownValue === 'DUEL' ? 'duelTextExplosion 0.8s ease-out forwards' : 'countdownScale 0.75s ease-out forwards',
              textAlign: 'center',
            }}
          >
            {countdownValue === 'DUEL' ? 'حان وقت المبارزة!' : countdownValue}
          </div>
          <div style={{ fontSize: 14, color: 'var(--pharaoh-gold-royal)', fontWeight: 800, marginTop: 12 }}>
            IT'S TIME TO DUEL!
          </div>
        </div>
      )}

      {/* Sleek Mobile-Optimized Executive Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '8px 12px' : '10px 20px',
          paddingTop: isMobile ? 'max(8px, env(safe-area-inset-top, 8px))' : '12px',
          background: isLight ? 'rgba(255, 252, 245, 0.92)' : 'rgba(20, 15, 10, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--pharaoh-gold-dark)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
          gap: 10,
        }}
      >
        {/* Left: Back Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => {
              connectionManager.cancel();
              onBack();
            }}
            className="btn-pharaoh-stone"
            style={{
              padding: isMobile ? '7px 11px' : '7px 14px',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              minHeight: 38,
            }}
            title="رجوع للقائمة الرئيسية"
          >
            <ArrowBackIcon size={16} color="var(--pharaoh-gold-bright)" />
            <span>الرئيسية</span>
          </button>
        </div>

        {/* Center: Title & Live Connection Badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 900,
              color: 'var(--pharaoh-gold-bright)',
              lineHeight: 1.2,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            تحدّى صاحبك 
          </div>

          {/* Dynamic Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 3,
              padding: '2px 8px',
              borderRadius: 12,
              background: status.connected
                ? 'rgba(34, 197, 94, 0.15)'
                : actionState === 'hosting'
                ? 'rgba(240, 203, 100, 0.15)'
                : actionState === 'joining'
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${
                status.connected
                  ? '#22c55e'
                  : actionState === 'hosting'
                  ? 'var(--pharaoh-gold-bright)'
                  : actionState === 'joining'
                  ? '#3b82f6'
                  : 'rgba(255, 255, 255, 0.12)'
              }`,
              fontSize: 10,
              fontWeight: 800,
              color: status.connected
                ? '#4ade80'
                : actionState === 'hosting'
                ? 'var(--pharaoh-gold-bright)'
                : actionState === 'joining'
                ? '#60a5fa'
                : 'var(--pharaoh-text-muted)',
              lineHeight: 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: status.connected
                  ? '#22c55e'
                  : actionState === 'hosting'
                  ? '#f0cb64'
                  : actionState === 'joining'
                  ? '#3b82f6'
                  : '#888',
                display: 'inline-block',
                animation: status.connected || actionState !== 'idle' ? 'beaconPulse 1.6s infinite' : 'none',
              }}
            />
            <span>
              {status.connected
                ? 'متصل بصاحبك'
                : actionState === 'hosting'
                ? `روم #${status.roomCode || '....'}`
                : actionState === 'joining'
                ? 'بيدوّر على الروم...'
                : 'شبكة هوت سبوت (Hotspot)'}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {status.connected && (
            <div
              style={{
                display: isMobile ? 'none' : 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#4ade80',
                fontSize: 11,
                fontWeight: 800,
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              {status.latencyMs || 1}ms
            </div>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="btn-pharaoh-stone"
              style={{
                width: 38,
                height: 38,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
              title={isLight ? 'التحويل لمظهر السبج (داكن)' : 'التحويل لمظهر البردي (فاتح)'}
              aria-label="تبديل المظهر"
            >
              {isLight ? (
                <MoonIcon size={16} color="var(--pharaoh-gold-bright)" />
              ) : (
                <SunIcon size={16} color="var(--pharaoh-gold-bright)" />
              )}
            </button>
          )}
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: status.connected ? 'center' : 'flex-start',
          padding: isMobile ? '16px 14px 44px' : '26px 22px 60px',
          maxWidth: isMobile ? '100%' : 680,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Pharaonic Winged Sun Frieze & Hieroglyphic Ribbon at top of main temple arena */}
        <PharaohWingedSunFrieze color="var(--pharaoh-gold-bright)" height={isMobile ? 38 : 46} />
        <PharaohHieroglyphRibbon opacity={0.65} style={{ marginBottom: 14 }} />

        {/* Player Name Input Field (Royal Cartouche Stele) */}
        <div
          className="stone-panel"
          style={{
            width: '100%',
            marginBottom: 16,
            padding: isMobile ? '14px 14px' : '18px 22px',
            background: isLight ? 'rgba(255, 252, 245, 0.94)' : 'rgba(26, 20, 14, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid var(--pharaoh-gold-bright)',
            borderRadius: 10,
            boxSizing: 'border-box',
            position: 'relative',
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.35)',
          }}
        >
          <PharaohCornerEngraving position="top-left" size={20} />
          <PharaohCornerEngraving position="top-right" size={20} />
          <PharaohCornerEngraving position="bottom-left" size={20} />
          <PharaohCornerEngraving position="bottom-right" size={20} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <UserIcon size={16} color="var(--pharaoh-gold-bright)" />
              <label style={{ fontSize: 13, color: 'var(--pharaoh-gold-bright)', fontWeight: 900, margin: 0 }}>
                اسمك في ساحة المعركة الفرعونية:
              </label>
            </div>
            <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', fontWeight: 700 }}>
              هيظهر لصاحبك في الماتش
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--pharaoh-stone-card)',
              border: '1.5px solid var(--pharaoh-stone-border)',
              borderRadius: 8,
              padding: '2px 10px',
              transition: 'border-color 0.2s ease',
            }}
          >
            <span style={{ fontSize: 16, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
              𓂀
            </span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={status.connected || actionState !== 'idle'}
              placeholder="اكتب اسمك هنا..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                fontWeight: 900,
                border: 'none',
                background: 'transparent',
                color: 'var(--pharaoh-gold-bright)',
                outline: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
                letterSpacing: 0.5,
              }}
            />
            <span style={{ fontSize: 16, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
              𓋹
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs (1v1 vs 2v2 Tag Team) */}
        {actionState === 'idle' && !status.connected && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1.5px solid var(--pharaoh-gold-dark)',
              borderRadius: 30,
              padding: 4,
              gap: 6,
              width: '100%',
              maxWidth: 420,
              margin: '0 auto 12px',
            }}
          >
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedMode('1v1');
              }}
              className={selectedMode === '1v1' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <SwordsCombatIcon size={16} />
              <span>فردي 1 ضد 1</span>
            </button>
            <button
              onClick={() => {
                soundManager.playDecide();
                hapticManager.triggerCombatVibration('click');
                setSelectedMode('tag_2v2');
              }}
              className={selectedMode === 'tag_2v2' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
              }}
            >
              <CrownIcon size={16} />
              <span>فرق 2 ضد 2</span>
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  left: 10,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: 8,
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                }}
              >
                جديد
              </span>
            </button>
          </div>
        )}

        {/* Tag Team 2v2 Lobby / Room Stele (When Hosting or Joined in Tag Mode) */}
        {(status.gameMode === 'tag_2v2' || (actionState === 'hosting' && selectedMode === 'tag_2v2')) && (
          <TagTeamLobbyView
            status={status}
            playerName={playerName}
            isHost={status.role === 'host' || actionState === 'hosting'}
            onStartDuel={handleStartDuelClick}
            onCancel={handleCancelAction}
            onUpdateSlot={(slotIdx, isBot, diff, botName) => {
              connectionManager.updateTagSlot(slotIdx, isBot, diff, botName);
            }}
            onUpdateSettings={(newSettings) => {
              setCustomTagSettings((prev) => ({ ...prev, ...newSettings }));
              connectionManager.updateTagSettings(newSettings);
            }}
            onSwapSlots={(fromSlot, toSlot) => {
              connectionManager.swapTagSlots(fromSlot, toSlot);
            }}
            isMobile={isMobile}
          />
        )}

        {/* 1. Direct Selection: Host or Join (Mobile First, Spacious & Authentically Engraved) */}
        {actionState === 'idle' && !status.connected && selectedMode === '1v1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            {/* Dual Action Cards: Responsive Grid on Desktop / Clean Stacking on Mobile */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
                width: '100%',
              }}
            >
              {/* Card 1: Host Room (المستضيف الملكي) */}
              <div
                className="stone-panel"
                style={{
                  position: 'relative',
                  padding: isMobile ? '18px 16px' : '22px 20px',
                  border: '1.5px solid var(--pharaoh-gold-bright)',
                  borderRadius: 10,
                  background: isLight ? 'rgba(255, 252, 245, 0.94)' : 'rgba(28, 22, 14, 0.94)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <PharaohCornerEngraving position="top-left" size={20} />
                <PharaohCornerEngraving position="top-right" size={20} />
                <PharaohCornerEngraving position="bottom-left" size={20} />
                <PharaohCornerEngraving position="bottom-right" size={20} />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(240, 203, 100, 0.2)',
                        border: '1px solid var(--pharaoh-gold-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CrownIcon size={22} color="var(--pharaoh-gold-bright)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                        المستضيف الملكي
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                        افتح الروم وخلي صاحبك ينضم
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--pharaoh-text-light)', lineHeight: 1.6, margin: '10px 0 16px' }}>
                    شغّل نقطة اتصال (هوت سبوت) من جهازك واعمل كود الروم عشان صاحبك يدخل يلعب معاك فوراً.
                  </p>
                </div>

                <button
                  onClick={handleHost}
                  className="btn-pharaoh-gold duel-btn-shine-wrap"
                  style={{
                    width: '100%',
                    minHeight: 46,
                    padding: '12px 14px',
                    fontSize: 14,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 8,
                  }}
                >
                  <span className="duel-btn-shine-sheen" />
                  <CrownIcon size={18} color="#ffffff" />
                  <span>اعمل روم جديدة</span>
                </button>
              </div>

              {/* Card 2: Join Room (المتحدي) */}
              <div
                className="stone-panel"
                style={{
                  position: 'relative',
                  padding: isMobile ? '18px 16px' : '22px 20px',
                  border: '1.5px solid var(--pharaoh-stone-border)',
                  borderRadius: 10,
                  background: isLight ? 'rgba(255, 252, 245, 0.94)' : 'rgba(26, 20, 14, 0.94)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <PharaohCornerEngraving position="top-left" size={20} color="var(--pharaoh-stone-border)" />
                <PharaohCornerEngraving position="top-right" size={20} color="var(--pharaoh-stone-border)" />
                <PharaohCornerEngraving position="bottom-left" size={20} color="var(--pharaoh-stone-border)" />
                <PharaohCornerEngraving position="bottom-right" size={20} color="var(--pharaoh-stone-border)" />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(240, 203, 100, 0.12)',
                        border: '1px solid var(--pharaoh-stone-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SwordsCombatIcon size={22} color="var(--pharaoh-gold-bright)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                        المنافس المتحدي
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                        ادخل روم معموله جاهزة
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--pharaoh-text-light)', lineHeight: 1.6, margin: '10px 0 16px' }}>
                    اتصل بشبكة الواي فاي بتاعة صاحبك واكتب كود الروم الـ 4 أرقام عشان تبدأوا الماتش.
                  </p>
                </div>

                <button
                  onClick={handleJoin}
                  className="btn-pharaoh-stone"
                  style={{
                    width: '100%',
                    minHeight: 46,
                    padding: '12px 14px',
                    fontSize: 14,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 8,
                  }}
                >
                  <SwordsCombatIcon size={18} color="var(--pharaoh-gold-bright)" />
                  <span>ادخل روم صاحبك</span>
                </button>
              </div>
            </div>

            {/* Pharaonic Inscription Guide Tablet */}
            <div
              className="stone-panel"
              style={{
                position: 'relative',
                padding: '16px 20px',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1.5px solid var(--pharaoh-gold-dark)',
                fontSize: 12,
                color: 'var(--pharaoh-text-light)',
                lineHeight: 1.8,
                textAlign: 'right',
                boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.4)',
              }}
            >
              <PharaohCornerEngraving position="top-left" size={16} color="var(--pharaoh-gold-dark)" />
              <PharaohCornerEngraving position="top-right" size={16} color="var(--pharaoh-gold-dark)" />
              <PharaohCornerEngraving position="bottom-left" size={16} color="var(--pharaoh-gold-dark)" />
              <PharaohCornerEngraving position="bottom-right" size={16} color="var(--pharaoh-gold-dark)" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid rgba(240, 203, 100, 0.2)', paddingBottom: 6 }}>
                <div style={{ color: 'var(--pharaoh-gold-bright)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WifiIcon size={16} color="var(--pharaoh-gold-bright)" />
                  <span>نقوش وتعليمات الاتصال السريع:</span>
                </div>
                <div style={{ fontFamily: 'Segoe UI Historic', fontSize: 14, color: 'var(--pharaoh-gold-bright)', letterSpacing: 4 }}>
                  𓋹 𓂀 𓊽 𓅃
                </div>
              </div>

              <div>1. واحد فيكم يفتح <strong>هوت سبوت (Hotspot)</strong> من موبايله ويدوس "اعمل روم جديدة".</div>
              <div>2. التاني يتصل بشبكة الواي فاي بتاعة الموبايل الأولاني ويدوس "ادخل روم صاحبك".</div>
              <div>3. اكتبوا كود الروم الـ 4 أرقام وهتلاقوا الماتش بدأ فوراً!</div>
              <div style={{ color: '#4ade80', marginTop: 4, fontWeight: 800 }}>
                ● اتصال مباشر وسريع 100% وشغال تمام بدون نت ولا باقة!
              </div>
            </div>
          </div>
        )}

        {/* Dedicated 2v2 Tag Arena Setup (When in Tag Mode & Idle) */}
        {actionState === 'idle' && !status.connected && selectedMode === 'tag_2v2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {/* Arena Header */}
            <div
              className="stone-panel"
              style={{
                padding: '16px 20px',
                border: '1.5px solid var(--pharaoh-gold-bright)',
                borderRadius: 12,
                background: 'linear-gradient(180deg, rgba(30, 22, 14, 0.98) 0%, rgba(16, 12, 8, 0.98) 100%)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
                textAlign: 'right',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <CrownIcon size={22} color="var(--pharaoh-gold-bright)" />
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  ساحة معارك الفرق 2 ضد 2 (Tag Arena)
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--pharaoh-text-light)', lineHeight: 1.6 }}>
                معارك جماعية 2 ضد 2 مع صاحبك! اختاروا نظام اللعب في المعركة (لعب مشترك سوا في نفس الدور، أو تعاقب أدوار دور ورا دور)، وبدّلوا المقاعد والفرق براحتكم.
              </div>
            </div>

            {/* Main Action Cards for 2v2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12,
                width: '100%',
              }}
            >
              {/* Card 1: Host 2v2 Arena */}
              <div
                className="stone-panel"
                style={{
                  padding: isMobile ? '18px 16px' : '22px 20px',
                  border: '1.5px solid var(--pharaoh-gold-bright)',
                  borderRadius: 10,
                  background: isLight ? 'rgba(255, 252, 245, 0.95)' : 'rgba(28, 22, 14, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'rgba(240, 203, 100, 0.18)',
                        border: '1px solid var(--pharaoh-gold-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CrownIcon size={22} color="var(--pharaoh-gold-bright)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                        إنشاء ساحة 2 ضد 2 (استضافة)
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                        افتح الروم ووزّع المقاعد والفرق
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--pharaoh-text-light)', lineHeight: 1.6, margin: '6px 0 12px' }}>
                    افتح الساحة وشارك الكود مع صاحبك، وتقدر تملأ أي خانة فاضية ببوتات ذكاء اصطناعي.
                  </p>
                </div>

                <button
                  onClick={() => handleHost('tag_2v2')}
                  className="btn-pharaoh-gold duel-btn-shine-wrap"
                  style={{
                    width: '100%',
                    minHeight: 46,
                    padding: '12px 14px',
                    fontSize: 14,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 8,
                  }}
                >
                  <span className="duel-btn-shine-sheen" />
                  <CrownIcon size={18} color="#ffffff" />
                  <span>افتح ساحة 2 ضد 2</span>
                </button>
              </div>

              {/* Card 2: Join 2v2 Arena by Code */}
              <div
                className="stone-panel"
                style={{
                  padding: isMobile ? '18px 16px' : '22px 20px',
                  border: '1.5px solid var(--pharaoh-stone-border)',
                  borderRadius: 10,
                  background: isLight ? 'rgba(255, 252, 245, 0.95)' : 'rgba(24, 18, 12, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'rgba(240, 203, 100, 0.12)',
                        border: '1px solid var(--pharaoh-stone-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SwordsCombatIcon size={20} color="var(--pharaoh-gold-bright)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                        انضمام لساحة فريقك
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                        اكتب كود الروم الـ 4 أرقام
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(e.target.value)}
                      placeholder="الكود (4 أرقام)"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.45)',
                        border: '1.5px solid var(--pharaoh-gold-dark)',
                        borderRadius: 6,
                        color: 'var(--pharaoh-gold-bright)',
                        fontSize: 16,
                        fontWeight: 900,
                        letterSpacing: 3,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleJoinByCodeClick}
                      className="btn-pharaoh-gold"
                      style={{
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 900,
                        borderRadius: 6,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      انضمام
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  اتصل بنفس شبكة الواي فاي أو الهوت سبوت بتاعة صاحبك.
                </div>
              </div>
            </div>

            {/* Card 3: Quick Bot 2v2 Arena Test */}
            <div
              className="stone-panel"
              style={{
                padding: '14px 18px',
                border: '1px solid rgba(240, 203, 100, 0.35)',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  تجربة سريعة وتدريب مع البوتات
                </div>
                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)' }}>
                  افتح الساحة فوراً مع 3 بوتات ذكاء اصطناعي لتجربة تبديل المقاعد والمودين.
                </div>
              </div>
              <button
                onClick={handleStartBotTagLobby}
                className="btn-pharaoh-stone"
                style={{
                  padding: '9px 18px',
                  fontSize: 12.5,
                  fontWeight: 900,
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--pharaoh-gold-bright)',
                  border: '1px solid var(--pharaoh-gold-bright)',
                }}
              >
                <span>ابدأ تجربة مع البوتات</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Host Room Panel (Royal Pharaonic Cartouche Seal for 1v1) */}
        {actionState === 'hosting' && !status.connected && status.gameMode !== 'tag_2v2' && selectedMode !== 'tag_2v2' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              className="stone-panel"
              style={{
                position: 'relative',
                padding: isMobile ? '20px 16px' : '28px 24px',
                border: '2px solid var(--pharaoh-gold-bright)',
                borderRadius: 12,
                textAlign: 'center',
                background: isLight ? 'rgba(255, 250, 235, 0.96)' : 'rgba(26, 20, 14, 0.96)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
              }}
            >
              <PharaohCornerEngraving position="top-left" size={24} />
              <PharaohCornerEngraving position="top-right" size={24} />
              <PharaohCornerEngraving position="bottom-left" size={24} />
              <PharaohCornerEngraving position="bottom-right" size={24} />

              {/* Host Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <CrownIcon size={24} color="var(--pharaoh-gold-bright)" />
                <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  الروم الفرعونية بتاعتك جاهزة
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--pharaoh-text-gold)', fontWeight: 800, marginBottom: 8 }}>
                صاحب الروم: {playerName}
              </div>
              <PharaohHieroglyphRibbon opacity={0.6} style={{ marginBottom: 14 }} />

              {/* Big Room Code Box (Royal Egyptian Cartouche) */}
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(34, 26, 16, 0.88) 0%, rgba(18, 14, 9, 0.94) 100%)',
                  border: '2.5px solid var(--pharaoh-gold-bright)',
                  borderRadius: 40,
                  padding: isMobile ? '14px 18px' : '18px 26px',
                  margin: '0 auto 14px',
                  maxWidth: 380,
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(201, 158, 50, 0.25)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)', marginBottom: 4, fontWeight: 800 }}>
                  كود الروم الملكي (4 أرقام):
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 24, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
                    𓂀
                  </span>
                  <div
                    style={{
                      fontSize: isMobile ? 36 : 42,
                      fontWeight: 900,
                      letterSpacing: isMobile ? 6 : 8,
                      color: 'var(--pharaoh-gold-bright)',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                      textShadow: '0 0 16px rgba(240, 203, 100, 0.65)',
                    }}
                  >
                    #{status.roomCode || '....'}
                  </div>
                  <span style={{ fontSize: 24, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
                    𓋹
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  <button
                    onClick={handleCopyRoomCode}
                    className="btn-pharaoh-gold"
                    style={{
                      padding: '7px 18px',
                      fontSize: 12,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 6,
                    }}
                  >
                    <CopyIcon size={14} color="#ffffff" />
                    <span>{codeCopied ? 'اتنسخ خلاص!' : 'انسخ الكود'}</span>
                  </button>
                </div>
              </div>

              {/* Network Status & Instructions */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.28)',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--pharaoh-stone-border)',
                  fontSize: 12,
                  color: 'var(--pharaoh-text-light)',
                  lineHeight: 1.7,
                  marginBottom: 16,
                  textAlign: 'right',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: 'var(--pharaoh-text-muted)', fontWeight: 700 }}>عنوان الـ IP:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, direction: 'ltr' }}>
                    <span style={{ color: 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
                      {status.ipOrDevice || '192.168.43.1'}
                    </span>
                    <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 8, fontWeight: 900 }}>
                      9001
                    </span>
                  </div>
                </div>
                <div>
                  خلّي صاحبك يكتب الكود ده عنده علشان يدخل معاك في الماتش فوراً.
                </div>
              </div>

              {/* Waiting Indicator */}
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--pharaoh-text-muted)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontWeight: 700,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'beaconPulse 1.6s infinite' }} />
                <span>الروم شغالة — مستنيين صاحبك يدخل...</span>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancelAction}
                className="btn-pharaoh-stone"
                style={{
                  width: '100%',
                  minHeight: 46,
                  padding: '10px 0',
                  fontSize: 13.5,
                  borderColor: '#ef4444',
                  color: '#f87171',
                  fontWeight: 900,
                  borderRadius: 8,
                }}
              >
                اقفل الروم وارجع
              </button>
            </div>
          </div>
        )}

        {/* 3. Join Room Panel (Royal Pharaonic Cartouche Seal) */}
        {actionState === 'joining' && !status.connected && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              className="stone-panel"
              style={{
                position: 'relative',
                padding: isMobile ? '20px 16px' : '28px 24px',
                border: '2px solid var(--pharaoh-gold-bright)',
                borderRadius: 12,
                textAlign: 'center',
                background: isLight ? 'rgba(255, 250, 235, 0.96)' : 'rgba(26, 20, 14, 0.96)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
              }}
            >
              <PharaohCornerEngraving position="top-left" size={24} />
              <PharaohCornerEngraving position="top-right" size={24} />
              <PharaohCornerEngraving position="bottom-left" size={24} />
              <PharaohCornerEngraving position="bottom-right" size={24} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <SwordsCombatIcon size={24} color="var(--pharaoh-gold-bright)" />
                <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  ادخل روم صاحبك الملكية
                </span>
              </div>
              <PharaohHieroglyphRibbon opacity={0.6} style={{ marginBottom: 14 }} />

              {/* Connection Mode Toggle (Hotspot vs Custom Wi-Fi) */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--pharaoh-stone-border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 14,
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
                  طريقة الاتصال بموبايل صاحبك:
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <button
                    onClick={() => {
                      setIpMode('hotspot');
                      setCustomHostIp('192.168.43.1');
                      connectionManager.join('wifi', playerName, '192.168.43.1');
                    }}
                    className={ipMode === 'hotspot' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900, borderRadius: 6 }}
                  >
                    هوت سبوت (Hotspot)
                  </button>
                  <button
                    onClick={() => setIpMode('custom')}
                    className={ipMode === 'custom' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900, borderRadius: 6 }}
                  >
                    واي فاي عادي (IP)
                  </button>
                </div>
                {ipMode === 'custom' ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="مثال: 192.168.1.15"
                      value={customHostIp}
                      onChange={(e) => setCustomHostIp(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        fontSize: 13,
                        direction: 'ltr',
                        textAlign: 'center',
                        borderRadius: 6,
                        background: 'var(--pharaoh-stone-card)',
                        border: '1px solid var(--pharaoh-gold-dark)',
                        color: 'var(--pharaoh-gold-bright)',
                      }}
                    />
                    <button
                      onClick={() => connectionManager.join('wifi', playerName, customHostIp)}
                      className="btn-pharaoh-stone"
                      style={{ padding: '8px 14px', fontSize: 12, fontWeight: 800 }}
                    >
                      تحديث
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: 'var(--pharaoh-text-muted)', marginTop: 4 }}>
                    ● متصل بنقطة اتصال المستضيف (IP: 192.168.43.1)
                  </div>
                )}
              </div>

              {/* Direct Room Code Input Box (Royal Cartouche) */}
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(34, 26, 16, 0.88) 0%, rgba(18, 14, 9, 0.94) 100%)',
                  border: '2px solid var(--pharaoh-gold-bright)',
                  borderRadius: 10,
                  padding: isMobile ? '14px 14px' : '16px 18px',
                  marginBottom: 14,
                  textAlign: 'right',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                }}
              >
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
                  اكتب كود الروم (4 أرقام):
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--pharaoh-stone-card)',
                      border: '1.5px solid var(--pharaoh-gold-dark)',
                      borderRadius: 8,
                      padding: '2px 10px',
                    }}
                  >
                    <span style={{ fontSize: 18, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
                      𓂀
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="5482"
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(connectionManager.normalizeRoomCode(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJoinByCodeClick();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: 22,
                        fontWeight: 900,
                        letterSpacing: 6,
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--pharaoh-gold-bright)',
                        direction: 'ltr',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 18, color: 'var(--pharaoh-gold-bright)', fontFamily: 'Segoe UI Historic', userSelect: 'none' }}>
                      𓋹
                    </span>
                  </div>
                  <button
                    onClick={handleJoinByCodeClick}
                    disabled={isConnectingByCode}
                    className="btn-pharaoh-gold"
                    style={{
                      padding: '0 20px',
                      height: 46,
                      fontSize: 13.5,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      borderRadius: 8,
                      opacity: isConnectingByCode ? 0.75 : 1,
                    }}
                  >
                    {isConnectingByCode ? 'جاري الدخول...' : 'ادخل الروم'}
                  </button>
                </div>
              </div>

              {/* Discovered Rooms List or Status */}
              {status.discoveredRooms && status.discoveredRooms.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--pharaoh-gold-bright)', fontWeight: 900, textAlign: 'right' }}>
                    الرومات اللي لاقيناها جنبك:
                  </div>
                  {status.discoveredRooms.map((room) => (
                    <div
                      key={room.roomId || room.roomCode}
                      style={{
                        background: 'rgba(201, 158, 50, 0.16)',
                        border: '1.5px solid var(--pharaoh-gold-dark)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CrownIcon size={16} color="var(--pharaoh-gold-bright)" />
                          روم: {room.hostName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                          الكود: #{room.roomCode}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          soundManager.playDecide();
                          hapticManager.triggerCombatVibration('click');
                          const target = ipMode === 'hotspot' ? '192.168.43.1' : customHostIp;
                          connectionManager.joinByCode(room.roomCode, target);
                        }}
                        className="btn-pharaoh-gold"
                        style={{ padding: '8px 18px', fontSize: 13, fontWeight: 900, borderRadius: 6 }}
                      >
                        ادخل والعب
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--pharaoh-text-muted)',
                    margin: '8px 0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f0cb64', display: 'inline-block' }} />
                  بندوّر على أي روم مفتوحة جنبك...
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={handleCancelAction}
                className="btn-pharaoh-stone"
                style={{ width: '100%', minHeight: 44, padding: '10px 0', fontSize: 13, fontWeight: 800, borderRadius: 8 }}
              >
                ارجع للقائمة
              </button>
            </div>
          </div>
        )}

        {/* 4. Connected State - Live Royal Duel Match Arena Panel (1v1) */}
        {status.connected && status.gameMode !== 'tag_2v2' && (
          <div
            className="stone-panel"
            style={{
              position: 'relative',
              padding: isMobile ? '22px 18px' : '32px 28px',
              border: '2.5px solid var(--pharaoh-gold-bright)',
              borderRadius: 12,
              textAlign: 'center',
              width: '100%',
              background: isLight ? 'rgba(255, 252, 240, 0.98)' : 'rgba(32, 24, 15, 0.98)',
              boxShadow: '0 0 35px rgba(240, 203, 100, 0.45)',
            }}
          >
            <PharaohCornerEngraving position="top-left" size={24} />
            <PharaohCornerEngraving position="top-right" size={24} />
            <PharaohCornerEngraving position="bottom-left" size={24} />
            <PharaohCornerEngraving position="bottom-right" size={24} />

            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#22c55e', marginBottom: 12 }}>
              <CheckCircleIcon size={24} color="#22c55e" />
              <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                تم الاتصال بصاحبك بنجاح!
              </span>
            </div>
            <PharaohHieroglyphRibbon opacity={0.75} style={{ marginBottom: 16 }} />

            {/* Duelists Clashing Cards Graphic with Laser Link */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderRadius: 10,
                background: 'rgba(201, 158, 50, 0.14)',
                border: '1.5px solid var(--pharaoh-gold-royal)',
                margin: '12px 0 16px',
                overflow: 'hidden',
              }}
            >
              {/* Traveling Light Beam Behind */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(240, 203, 100, 0.1), rgba(240, 203, 100, 0.9), rgba(240, 203, 100, 0.1))',
                  animation: 'laserBeamPulse 2s infinite',
                  pointerEvents: 'none',
                }}
              />

              {/* Player 1 (You) */}
              <div style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
                  {status.role === 'host' ? 'أنت (المستضيف)' : 'أنت (الضيف)'}
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                  {playerName}
                </div>
                <div style={{ fontSize: 10.5, color: '#4ade80', marginTop: 3, fontWeight: 800 }}>
                  ● جاهز
                </div>
              </div>

              {/* Central Swords Emblem */}
              <div
                style={{
                  padding: '8px 12px',
                  color: 'var(--pharaoh-gold-bright)',
                  zIndex: 2,
                  background: 'rgba(20, 16, 10, 0.85)',
                  borderRadius: '50%',
                  border: '1px solid var(--pharaoh-gold-bright)',
                  boxShadow: '0 0 14px rgba(240, 203, 100, 0.5)',
                }}
              >
                <SwordsCombatIcon size={26} color="var(--pharaoh-gold-bright)" />
              </div>

              {/* Player 2 (Opponent) */}
              <div style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                <div style={{ fontSize: 11, color: '#f87171', fontWeight: 800 }}>
                  {status.role === 'host' ? 'صاحبك المنافس' : 'صاحبك المستضيف'}
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 900, color: '#f87171', marginTop: 2 }}>
                  {status.peerName || 'المنافس'}
                </div>
                <div style={{ fontSize: 10.5, color: '#4ade80', marginTop: 3, fontWeight: 800 }}>
                  ● متصل
                </div>
              </div>
            </div>

            {/* Network Telemetry */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                fontSize: 12,
                color: 'var(--pharaoh-text-muted)',
                marginBottom: 16,
              }}
            >
              <span>النمط: <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>شبكة نقطة الاتصال (Hotspot)</strong></span>
              <span>•</span>
              <span>الاستجابة: <strong style={{ color: '#4ade80' }}>{status.latencyMs || 1}ms</strong></span>
              <span>•</span>
              <span>الغرفة: <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>#{status.roomCode}</strong></span>
            </div>

            {/* Start Duel Primary Action Button */}
            <button
              onClick={handleStartDuelClick}
              className="btn-pharaoh-gold duel-btn-shine-wrap"
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 1,
                boxShadow: '0 4px 20px rgba(201, 158, 50, 0.5)',
                marginBottom: 12,
                borderRadius: 8,
              }}
            >
              <span className="duel-btn-shine-sheen" />
              يلا بينا ع الماتش دلوقتي!
            </button>

            {/* Disconnect Option */}
            <button
              onClick={() => {
                connectionManager.cancel();
              }}
              className="btn-pharaoh-stone"
              style={{
                width: '100%',
                padding: '9px 0',
                fontSize: 12.5,
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
              }}
            >
              افصل الاتصال وارجع
            </button>
          </div>
        )}

        {/* Small Decorative Developer Signature */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 28,
            paddingBottom: 22,
          }}
        >
          <div className="pharaoh-dev-credit">
            <span className="pharaoh-dev-credit-line" />
            <span className="pharaoh-dev-credit-glyph">𓋹</span>
            <span>develope by Amr Khalid</span>
            <span className="pharaoh-dev-credit-glyph">𓋹</span>
            <span className="pharaoh-dev-credit-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerScreen;
