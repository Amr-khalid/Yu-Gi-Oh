import React, { useState, useEffect, useRef } from 'react';
import { connectionManager } from '../../multiplayer/ConnectionManager.js';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/* Pure SVG Icons (Zero Emojis, Executive Authentic Egyptian Vector Art) */
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

export const MultiplayerScreen = ({ onBack, onStartDuel, theme, onToggleTheme }) => {
  const [status, setStatus] = useState(connectionManager.getStatus());
  const [mode, setMode] = useState('select'); // 'select' | 'wifi' | 'bluetooth'
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

  const prevConnectedRef = useRef(false);
  const isLight = theme === 'light';

  useEffect(() => {
    connectionManager.setMyName(playerName);
  }, [playerName]);

  // Synchronized countdown trigger
  const runSynchronizedCountdown = (seed, hostName, clientName) => {
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
      const myActualName = isHost ? hostName : clientName;
      const peerActualName = isHost ? clientName : hostName;

      onStartDuel({
        isHost,
        seed,
        myName: myActualName || playerName,
        peerName: peerActualName || (isHost ? 'المنافس' : 'المستضيف'),
        startingPlayer: isHost ? 0 : 1,
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
      } else if (!s.connected) {
        prevConnectedRef.current = false;
        setShowConnectAnimation(false);
      }
    });

    const unsubMsg = connectionManager.onMessage((msg) => {
      // Countdown trigger from peer or host
      if (msg.type === 'DUEL_COUNTDOWN_START') {
        connectionManager.matchSeed = msg.seed;
        runSynchronizedCountdown(msg.seed, msg.hostName, msg.clientName);
      } else if (msg.type === 'START_DUEL') {
        connectionManager.matchSeed = msg.seed;
        const isHost = connectionManager.role === 'host';
        const myActualName = isHost ? msg.hostName : msg.clientName;
        const peerActualName = isHost ? msg.clientName : msg.hostName;

        onStartDuel({
          isHost,
          seed: msg.seed,
          myName: myActualName || playerName,
          peerName: peerActualName || (isHost ? 'المنافس' : 'المستضيف'),
          startingPlayer: isHost ? 0 : 1,
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

  const handleHostWifi = () => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    setActionState('hosting');
    connectionManager.host('wifi', playerName);
  };

  const handleJoinWifi = () => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    setActionState('joining');
    connectionManager.join('wifi', playerName);
  };

  const handleHostBluetooth = () => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    setActionState('hosting');
    connectionManager.host('bluetooth', playerName);
  };

  const handleJoinBluetooth = () => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    setActionState('joining');
    connectionManager.join('bluetooth', playerName);
  };

  const handleCancelAction = () => {
    soundManager.playClick();
    connectionManager.cancel();
    setActionState('idle');
  };

  const handleJoinByCodeClick = () => {
    const cleanCode = connectionManager.normalizeRoomCode(inputRoomCode);
    if (!cleanCode || cleanCode.length !== 4) {
      alert('يرجى إدخال رمز الغرفة المكون من 4 أرقام بدقة.');
      return;
    }
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    const ok = connectionManager.joinByCode(cleanCode);
    if (!ok) {
      alert('رمز الغرفة يجب أن يتكون من 4 أرقام.');
    }
  };

  const handleStartDuelClick = () => {
    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');

    const matchSeed = Math.floor(Math.random() * 1000000) + 1;
    connectionManager.matchSeed = matchSeed;

    const isHost = status.role === 'host';
    const hostName = isHost ? playerName : (status.peerName || 'المستضيف');
    const clientName = isHost ? (status.peerName || 'المنافس') : playerName;

    // Send synchronized countdown signal to peer
    connectionManager.send({
      type: 'DUEL_COUNTDOWN_START',
      seed: matchSeed,
      hostName,
      clientName,
    });

    // Run local countdown
    runSynchronizedCountdown(matchSeed, hostName, clientName);
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
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--pharaoh-bg-deep)',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
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
                background: 'linear-gradient(145deg, rgba(38, 30, 18, 0.96), rgba(20, 16, 10, 0.98))',
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
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 3, textShadow: '0 0 8px rgba(240, 203, 100, 0.5)' }}>
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
                background: 'linear-gradient(145deg, rgba(38, 20, 20, 0.96), rgba(20, 10, 10, 0.98))',
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
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 3, textShadow: '0 0 8px rgba(248, 113, 113, 0.5)' }}>
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
              <span>⚡ زمن الاستجابة: <strong style={{ color: '#4ade80' }}>{status.latencyMs || 1}ms</strong></span>
              <span>•</span>
              <span>🛡️ القناة: <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>مباشرة ومستقرة 100%</strong></span>
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
              جاهز للنزال — الدخول لساحة الاستعداد
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

      {/* Top Header */}
      <div
        className="stone-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              connectionManager.cancel();
              onBack();
            }}
            className="btn-pharaoh-stone"
            style={{ padding: '7px 16px', fontSize: 13 }}
          >
            رجوع للقائمة
          </button>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="btn-pharaoh-stone"
              style={{ padding: '7px 12px', fontSize: 12 }}
              title="تبديل المظهر"
            >
              {isLight ? 'مظهر السبج (داكن)' : 'مظهر البردي (فاتح)'}
            </button>
          )}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', margin: 0 }}>
          نزال جماعي محلي (بدون إنترنت)
        </h2>

        <div style={{ width: 40 }} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Player Name Input Field */}
        <div style={{ width: '100%', marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)', display: 'block', marginBottom: 6, fontWeight: 800 }}>
            اسمك في ساحة المعركة الملكية:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={status.connected || actionState !== 'idle'}
            placeholder="اكتب اسمك هنا..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              border: '1.5px solid var(--pharaoh-stone-border)',
              background: 'var(--pharaoh-stone-card)',
              color: 'var(--pharaoh-gold-bright)',
            }}
          />
        </div>

        {/* 1. Mode Selector Screen */}
        {mode === 'select' && !status.connected && actionState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {/* Wi-Fi Hotspot Option */}
            <div
              onClick={() => {
                soundManager.playClick();
                setMode('wifi');
              }}
              className="stone-panel temple-stele-button temple-stele-primary"
              style={{
                padding: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                className="temple-stele-icon-box"
                style={{
                  width: 46,
                  height: 46,
                  background: 'rgba(240, 203, 100, 0.25)',
                  borderColor: 'var(--pharaoh-gold-bright)',
                  flexShrink: 0,
                }}
              >
                <WifiIcon size={24} color="var(--pharaoh-gold-bright)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  نقطة الاتصال والشبكة المحلية (Wi-Fi Hotspot)
                </span>
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                  الخيار الموصى به: اتصال فوري وسريع 100% بدون إنترنت. أحد اللاعبين يستضيف والآخر ينضم.
                </span>
              </div>
            </div>

            {/* Bluetooth Option */}
            <div
              onClick={() => {
                soundManager.playClick();
                setMode('bluetooth');
              }}
              className="stone-panel temple-stele-button"
              style={{
                padding: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div className="temple-stele-icon-box" style={{ width: 46, height: 46, flexShrink: 0 }}>
                <BluetoothIcon size={24} color="var(--pharaoh-text-gold)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                  الاتصال المباشر عبر البلوتوث (Bluetooth LE)
                </span>
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                  اتصال لاسلكي مباشر بين الأجهزة المتجاورة عبر البلوتوث المنخفض الطاقة.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Wi-Fi Hotspot Room Controls */}
        {mode === 'wifi' && !status.connected && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {actionState === 'idle' && (
              <>
                <div className="stone-panel" style={{ padding: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
                    إرشادات الاتصال عبر نقطة الاتصال (Hotspot):
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--pharaoh-text-light)', lineHeight: 1.7, margin: 0 }}>
                    1. في الهاتف الأول: اضغط على زر "استضافة غرفة (Host)".<br />
                    2. في الهاتف الثاني (أو نافذة ثانية): اضغط على "انضمام للغرفة (Join)".<br />
                    3. سيتم الربط والمصافحة تلقائياً وبسرعة فائقة مع إطلاق أنيميشن الاتصال الملكي!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleHostWifi}
                    className="btn-pharaoh-gold"
                    style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 900 }}
                  >
                    استضافة غرفة (Host)
                  </button>
                  <button
                    onClick={handleJoinWifi}
                    className="btn-pharaoh-stone"
                    style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 900 }}
                  >
                    انضمام للغرفة (Join)
                  </button>
                </div>

                <button
                  onClick={() => setMode('select')}
                  className="btn-pharaoh-stone"
                  style={{ marginTop: 4, padding: '9px 0', fontSize: 12.5 }}
                >
                  الرجوع لاختيار طريقة الاتصال
                </button>
              </>
            )}

            {/* Active Hosting Room Panel */}
            {actionState === 'hosting' && (
              <div
                className="stone-panel broadcast-pulsing-badge"
                style={{
                  padding: 22,
                  border: '2px solid var(--pharaoh-gold-bright)',
                  textAlign: 'center',
                  background: isLight ? 'rgba(255, 250, 235, 0.95)' : 'rgba(28, 22, 14, 0.95)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--pharaoh-gold-bright)' }}>
                  <RadioTowerIcon size={36} color="var(--pharaoh-gold-bright)" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 4 }}>
                  تم إنشاء الغرفة الملكية بنجاح — البث نشط الآن!
                </div>
                <div style={{ fontSize: 13, color: 'var(--pharaoh-text-gold)', fontWeight: 800, marginBottom: 8 }}>
                  المستضيف: {playerName}
                </div>

                {/* Big Pharaoh Room Code Card */}
                <div
                  style={{
                    background: 'rgba(201, 158, 50, 0.18)',
                    border: '2px dashed var(--pharaoh-gold-bright)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    margin: '12px auto',
                    maxWidth: 340,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--pharaoh-text-muted)', marginBottom: 4, fontWeight: 700 }}>
                    رمز الدخول المباشر للغرفة (Room Code):
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      letterSpacing: 10,
                      color: 'var(--pharaoh-gold-bright)',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                      textShadow: '0 0 16px rgba(240, 203, 100, 0.6)',
                    }}
                  >
                    #{status.roomCode || '....'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <button
                      onClick={handleCopyRoomCode}
                      className="btn-pharaoh-stone"
                      style={{ padding: '4px 14px', fontSize: 11.5 }}
                    >
                      {codeCopied ? 'تم نسخ الرمز!' : 'نسخ الرمز'}
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--pharaoh-text-light)', marginTop: 6, lineHeight: 1.5 }}>
                    أعطِ هذا الرمز للمنافس ليكتبه في خانة الانضمام أو سيكتشف الغرفة تلقائياً!
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(201, 158, 50, 0.12)',
                    padding: '12px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--pharaoh-gold-dark)',
                    fontSize: 12,
                    color: 'var(--pharaoh-text-light)',
                    lineHeight: 1.7,
                    marginBottom: 16,
                  }}
                >
                  {typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? (
                    <div style={{ marginBottom: 6 }}>
                      للعب من هاتف أو جهاز آخر على نفس الشبكة، افتح الرابط:
                      <br />
                      <strong style={{ color: 'var(--pharaoh-gold-bright)', direction: 'ltr', display: 'inline-block' }}>
                        http://{window.location.host}
                      </strong>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 6, color: 'var(--pharaoh-text-muted)' }}>
                      للعب من هاتف متصل بنفس الشبكة، افتح عنوان الشبكة المحلية للعبة.
                    </div>
                  )}
                  في النافذة أو الهاتف الآخر: اضغط <strong>"انضمام للغرفة"</strong> واكتب الرمز:
                  <br />
                  <strong style={{ color: 'var(--pharaoh-gold-bright)', fontSize: 17, letterSpacing: 2 }}>
                    #{status.roomCode}
                  </strong>
                </div>
                <button
                  onClick={handleCancelAction}
                  className="btn-pharaoh-stone"
                  style={{ width: '100%', padding: '10px 0', fontSize: 13, borderColor: '#ef4444', color: '#f87171' }}
                >
                  إلغاء استضافة الغرفة والرجوع
                </button>
              </div>
            )}

            {/* Active Searching/Joining Room Panel */}
            {actionState === 'joining' && (
              <div
                className="stone-panel broadcast-pulsing-badge"
                style={{
                  padding: 22,
                  border: '2px solid var(--pharaoh-gold-royal)',
                  textAlign: 'center',
                  background: isLight ? 'rgba(255, 250, 235, 0.95)' : 'rgba(28, 22, 14, 0.95)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--pharaoh-gold-royal)' }}>
                  <RadioTowerIcon size={36} color="var(--pharaoh-gold-royal)" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 4 }}>
                  الانضمام لغرفة المبارزة
                </div>

                {/* Direct Room Code Input Box */}
                <div
                  style={{
                    background: 'rgba(201, 158, 50, 0.15)',
                    border: '1.5px solid var(--pharaoh-gold-bright)',
                    borderRadius: 8,
                    padding: '14px 16px',
                    margin: '12px 0 14px',
                    textAlign: 'right',
                  }}
                >
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
                    أدخل رمز الغرفة المكون من 4 أرقام:
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="مثال: 5482"
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(connectionManager.normalizeRoomCode(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJoinByCodeClick();
                      }}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 22,
                        fontWeight: 900,
                        letterSpacing: 6,
                        padding: '9px 12px',
                        borderRadius: 6,
                        background: 'var(--pharaoh-stone-card)',
                        border: '1.5px solid var(--pharaoh-gold-dark)',
                        color: 'var(--pharaoh-gold-bright)',
                        direction: 'ltr',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      onClick={handleJoinByCodeClick}
                      className="btn-pharaoh-gold"
                      style={{ padding: '0 20px', height: 46, fontSize: 13.5, fontWeight: 900, whiteSpace: 'nowrap' }}
                    >
                      دخول بالرمز
                    </button>
                  </div>
                </div>

                {/* Discovered Rooms List or Listening Indicator */}
                {status.discoveredRooms && status.discoveredRooms.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0 14px' }}>
                    <div style={{ fontSize: 12, color: 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
                      تم اكتشاف الغرف المتاحة تلقائياً على الشبكة:
                    </div>
                    {status.discoveredRooms.map((room) => (
                      <div
                        key={room.roomId || room.roomCode}
                        style={{
                          background: 'rgba(201, 158, 50, 0.16)',
                          border: '1.5px solid var(--pharaoh-gold-dark)',
                          borderRadius: 8,
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CrownIcon size={16} color="var(--pharaoh-gold-bright)" />
                            غرفة: {room.hostName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                            الرمز: #{room.roomCode}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            soundManager.playDecide();
                            hapticManager.triggerCombatVibration('click');
                            connectionManager.joinByCode(room.roomCode);
                          }}
                          className="btn-pharaoh-gold duel-btn-shine-wrap"
                          style={{ padding: '8px 18px', fontSize: 13, fontWeight: 900 }}
                        >
                          <span className="duel-btn-shine-sheen" />
                          دخول وتحدي
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: 'var(--pharaoh-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0cb64', display: 'inline-block', animation: 'beaconPulse 1.4s infinite' }} />
                    جاري الاستماع واكتشاف الغرف النشطة على الشبكة فورياً...
                  </div>
                )}
                <button
                  onClick={handleCancelAction}
                  className="btn-pharaoh-stone"
                  style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                >
                  إلغاء البحث والرجوع
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Bluetooth Room Controls */}
        {mode === 'bluetooth' && !status.connected && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {actionState === 'idle' && (
              <>
                <div className="stone-panel" style={{ padding: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
                    إرشادات الربط عبر البلوتوث (Bluetooth):
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--pharaoh-text-light)', lineHeight: 1.7, margin: 0 }}>
                    1. تأكد من تفعيل البلوتوث في كلا الهاتفين.<br />
                    2. في الهاتف الأول: اضغط "بث كغرفة مبارزة".<br />
                    3. في الهاتف الثاني: اضغط "بحث واتصال".
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleHostBluetooth}
                    className="btn-pharaoh-gold"
                    style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 900 }}
                  >
                    بث كغرفة مبارزة
                  </button>
                  <button
                    onClick={handleJoinBluetooth}
                    className="btn-pharaoh-stone"
                    style={{ flex: 1, padding: '13px 0', fontSize: 14, fontWeight: 900 }}
                  >
                    بحث واتصال
                  </button>
                </div>

                <button
                  onClick={() => setMode('select')}
                  className="btn-pharaoh-stone"
                  style={{ marginTop: 4, padding: '9px 0', fontSize: 12.5 }}
                >
                  الرجوع لاختيار طريقة الاتصال
                </button>
              </>
            )}

            {actionState === 'hosting' && (
              <div
                className="stone-panel broadcast-pulsing-badge"
                style={{
                  padding: 22,
                  border: '2px solid var(--pharaoh-gold-bright)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 6 }}>
                  جاري بث إشارة الغرفة عبر البلوتوث...
                </div>
                <div style={{ fontSize: 12, color: 'var(--pharaoh-text-muted)', marginBottom: 14 }}>
                  بانتظار المنافس للبحث والاتصال...
                </div>
                <button
                  onClick={handleCancelAction}
                  className="btn-pharaoh-stone"
                  style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                >
                  إلغاء البث والرجوع
                </button>
              </div>
            )}

            {actionState === 'joining' && (
              <div
                className="stone-panel broadcast-pulsing-badge"
                style={{
                  padding: 22,
                  border: '2px solid var(--pharaoh-gold-royal)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 6 }}>
                  جاري البحث عن أجهزة البلوتوث المجاورة...
                </div>
                <button
                  onClick={handleCancelAction}
                  className="btn-pharaoh-stone"
                  style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                >
                  إلغاء البحث والرجوع
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Connected State - Live Royal Duel Match Arena Panel */}
        {status.connected && (
          <div
            className="stone-panel"
            style={{
              padding: 24,
              border: '2.5px solid var(--pharaoh-gold-bright)',
              textAlign: 'center',
              width: '100%',
              background: isLight ? 'rgba(255, 252, 240, 0.98)' : 'rgba(32, 24, 15, 0.98)',
              boxShadow: '0 0 30px rgba(240, 203, 100, 0.4)',
            }}
          >
            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#22c55e', marginBottom: 14 }}>
              <CheckCircleIcon size={24} color="#22c55e" />
              <span style={{ fontSize: 16.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                تم الاتصال وتأكيد الرابط الملكي!
              </span>
            </div>

            {/* Duelists Clashing Cards Graphic with Laser Link */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: 10,
                background: 'rgba(201, 158, 50, 0.12)',
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
                  {status.role === 'host' ? 'المستضيف الملكي' : 'أنت (الضيف)'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                  {playerName}
                </div>
                <div style={{ fontSize: 10, color: '#4ade80', marginTop: 3 }}>
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
                  {status.role === 'host' ? 'المنافس المتحدي' : 'المستضيف الملكي'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#f87171', marginTop: 2 }}>
                  {status.peerName || 'المنافس'}
                </div>
                <div style={{ fontSize: 10, color: '#4ade80', marginTop: 3 }}>
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
                fontSize: 11.5,
                color: 'var(--pharaoh-text-muted)',
                marginBottom: 16,
              }}
            >
              <span>⚡ الاستجابة: <strong style={{ color: '#4ade80' }}>{status.latencyMs || 1}ms</strong></span>
              <span>•</span>
              <span>🔒 التشفير: <strong style={{ color: 'var(--pharaoh-gold-bright)' }}>مباشر محلي</strong></span>
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
                marginBottom: 10,
              }}
            >
              <span className="duel-btn-shine-sheen" />
              بدء المبارزة المباشرة الآن
            </button>

            {/* Disconnect Option */}
            <button
              onClick={() => {
                connectionManager.cancel();
              }}
              className="btn-pharaoh-stone"
              style={{
                width: '100%',
                padding: '8px 0',
                fontSize: 12,
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.4)',
              }}
            >
              إنهاء الاتصال والرجوع
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerScreen;
