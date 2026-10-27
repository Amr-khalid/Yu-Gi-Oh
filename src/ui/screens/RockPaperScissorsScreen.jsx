import React, { useState, useEffect, useRef } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { connectionManager } from '../../multiplayer/ConnectionManager.js';

/* =========================================================================
   PURE SVG PHARAONIC VECTOR ICONS (Zero Emojis, Executive Art Direction)
   ========================================================================= */

// 1. Rock - The Sacred Pyramidion of Ra (صخرة الهرم الأكبر)
const SacredRockIcon = ({ size = 48, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Outer Pyramidion Silhouette */}
    <polygon points="50,12 88,86 12,86" stroke={color} strokeWidth="4" fill="rgba(201, 158, 50, 0.16)" strokeLinejoin="round" />
    {/* Inner Sacred Light Facet */}
    <polygon points="50,12 50,86 88,86" fill="rgba(240, 203, 100, 0.22)" />
    {/* Eye of Ra in Pyramidion */}
    <circle cx="50" cy="54" r="11" stroke={color} strokeWidth="2.5" fill="rgba(20, 16, 10, 0.85)" />
    <circle cx="50" cy="54" r="5" fill={color} />
    {/* Base Hieroglyphic Stone Tiers */}
    <line x1="22" y1="74" x2="78" y2="74" stroke={color} strokeWidth="2.5" strokeDasharray="4 4" />
    <line x1="30" y1="62" x2="70" y2="62" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
  </svg>
);

// 2. Paper - The Papyrus Scroll of Thoth (لفافة البردي الفرعونية)
const RoyalPapyrusIcon = ({ size = 48, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Top Scroll Roll */}
    <ellipse cx="50" cy="20" rx="28" ry="7" stroke={color} strokeWidth="3.5" fill="rgba(240, 203, 100, 0.25)" />
    {/* Scroll Body */}
    <path d="M 22,20 L 22,78 C 22,84 35,88 50,88 C 65,88 78,84 78,78 L 78,20" stroke={color} strokeWidth="3.5" fill="rgba(201, 158, 50, 0.14)" />
    {/* Bottom Scroll Roll */}
    <ellipse cx="50" cy="78" rx="28" ry="7" stroke={color} strokeWidth="3.5" fill="rgba(240, 203, 100, 0.25)" />
    {/* Hieroglyphic Wisdom Inscriptions */}
    <line x1="34" y1="38" x2="66" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="34" y1="48" x2="58" y2="48" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="34" y1="58" x2="66" y2="58" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="48" r="3" fill={color} />
  </svg>
);

// 3. Scissors - Twin Khopesh Bronze Blades of Horus (شفرات الخوبيش البرونزية)
const KhopeshBladesIcon = ({ size = 48, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Left Curved Khopesh Blade */}
    <path d="M 25,82 L 44,52 C 48,44 56,36 68,26 C 74,20 78,16 82,14 C 78,24 72,34 68,42 C 64,50 60,54 54,60 L 32,86 Z" stroke={color} strokeWidth="3" fill="rgba(201, 158, 50, 0.2)" strokeLinejoin="round" />
    {/* Right Curved Khopesh Blade (Crossing) */}
    <path d="M 75,82 L 56,52 C 52,44 44,36 32,26 C 26,20 22,16 18,14 C 22,24 28,34 32,42 C 36,50 40,54 46,60 L 68,86 Z" stroke={color} strokeWidth="3" fill="rgba(201, 158, 50, 0.16)" strokeLinejoin="round" />
    {/* Central Golden Pivot Jewel */}
    <circle cx="50" cy="54" r="6" stroke={color} strokeWidth="2.5" fill="rgba(20, 16, 10, 0.9)" />
    <circle cx="50" cy="54" r="2.5" fill={color} />
  </svg>
);

const CrownIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const ShieldIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SwordIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </svg>
);

const CHOICES = [
  {
    id: 'rock',
    name: 'طوبة',
    subname: 'طوبة',
    beats: 'scissors',
    ruleText: 'الطوبة بتكسر المقص',
    icon: (color, size) => <SacredRockIcon size={size} color={color} />,
  },
  {
    id: 'paper',
    name: 'ورقة',
    subname: 'ورقة',
    beats: 'rock',
    ruleText: 'الورقة بتلف الطوبة',
    icon: (color, size) => <RoyalPapyrusIcon size={size} color={color} />,
  },
  {
    id: 'scissors',
    name: 'مقص',
    subname: 'مقص',
    beats: 'paper',
    ruleText: 'المقص بيقص الورقة',
    icon: (color, size) => <KhopeshBladesIcon size={size} color={color} />,
  },
];

export const RockPaperScissorsScreen = ({
  playerDeckName = 'يوجي',
  opponentName = 'سيتو كايبا',
  isMultiplayer = false,
  multiplayerData = null,
  onComplete,
  onCancel,
  theme,
  onToggleTheme,
}) => {
  const [gameState, setGameState] = useState('CHOOSING'); // 'CHOOSING' | 'WAITING_OPPONENT' | 'REVEALING' | 'RESULT'
  const [revealCount, setRevealCount] = useState(1);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [opponentChoiceId, setOpponentChoiceId] = useState(null);
  const [winner, setWinner] = useState(null); // 'player' | 'opponent' | 'tie'
  const [opponentTurnDecision, setOpponentTurnDecision] = useState(null);
  const [opponentLocked, setOpponentLocked] = useState(false);

  const isHost = isMultiplayer ? (multiplayerData?.isHost ?? false) : true;
  const isLight = theme === 'light';

  // In Tag Team mode or when no remote peer is connected, treat opponent as an AI bot
  const isTag = multiplayerData?.gameMode === 'tag_2v2';
  const oppSlotIndex = (multiplayerData?.myTeam === 1) ? 0 : 2;
  const oppSlot = multiplayerData?.slots?.[oppSlotIndex];
  const isOpponentBot = !isMultiplayer || !connectionManager.connected || (isTag ? (!oppSlot || Boolean(oppSlot.isBot)) : false);

  // Play Janken theme audio on mount
  useEffect(() => {
    soundManager.playJankenBgm();
    return () => {
      soundManager.stopJankenBgm();
    };
  }, []);

  // Watchdog fallback: if waiting in WAITING_OPPONENT for more than 4 seconds, auto-roll opponent choice
  useEffect(() => {
    if (gameState === 'WAITING_OPPONENT' && playerChoice && !opponentChoiceId) {
      const watchdog = setTimeout(() => {
        const oppRandom = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        setOpponentChoiceId(oppRandom.id);
        startRevealSequence(playerChoice, oppRandom.id);
      }, 3500);
      return () => clearTimeout(watchdog);
    }
  }, [gameState, playerChoice, opponentChoiceId]);

  // Multiplayer Listener for choices and turn decisions
  useEffect(() => {
    if (!isMultiplayer) return;

    const unsubMsg = connectionManager.onMessage((msg) => {
      // 1. Opponent locked their choice
      if (msg.type === 'JANKEN_CHOICE') {
        setOpponentChoiceId(msg.choiceId);
        setOpponentLocked(true);
        soundManager.playClick();
      }

      // 2. Opponent decided who goes first
      else if (msg.type === 'JANKEN_DECIDE_TURN') {
        const decidedStartingRole = msg.startingPlayerRole; // 'host' | 'client'
        const amIHost = isHost;
        // If host was chosen to start:
        // On Host: startingPlayer = 0
        // On Client: startingPlayer = 1
        const localStartingPlayer = (decidedStartingRole === 'host')
          ? (amIHost ? 0 : 1)
          : (amIHost ? 1 : 0);

        soundManager.playStart();
        soundManager.stopJankenBgm();
        if (onComplete) {
          onComplete({ startingPlayer: localStartingPlayer });
        }
      }

      // 3. Reset for tie rematch
      else if (msg.type === 'JANKEN_RESET') {
        handleLocalReset();
      }
    });

    return unsubMsg;
  }, [isMultiplayer, isHost, onComplete]);

  // Synchronized clash trigger when both choices are locked in multiplayer
  useEffect(() => {
    if (isMultiplayer && playerChoice && opponentChoiceId && gameState === 'WAITING_OPPONENT') {
      startRevealSequence(playerChoice, opponentChoiceId);
    }
  }, [isMultiplayer, playerChoice, opponentChoiceId, gameState]);

  const startRevealSequence = (myChoice, oppChoiceId) => {
    setGameState('REVEALING');
    setRevealCount(1);
    soundManager.play('janken');
    hapticManager.triggerCombatVibration('click');

    // Rhythmic Chant Step 2: "ورقة..."
    setTimeout(() => {
      setRevealCount(2);
      soundManager.playClick();
      hapticManager.triggerCombatVibration('click');
    }, 450);

    // Rhythmic Chant Step 3: "مقص!"
    setTimeout(() => {
      setRevealCount(3);
      soundManager.playClick();
      hapticManager.triggerCombatVibration('click');
    }, 900);

    // The Epic Collision Moment
    setTimeout(() => {
      const oppObj = CHOICES.find((c) => c.id === oppChoiceId) || CHOICES[0];
      setOpponentChoice(oppObj);

      let roundWinner = 'tie';
      if (myChoice.id === oppObj.id) {
        roundWinner = 'tie';
        soundManager.playCardOpen();
      } else if (myChoice.beats === oppObj.id) {
        roundWinner = 'player';
        soundManager.playWin();
      } else {
        roundWinner = 'opponent';
        soundManager.playDamage();
        if (isOpponentBot) {
          const oppDecidesFirst = Math.random() < 0.7;
          setOpponentTurnDecision(oppDecidesFirst ? 1 : 0);
        }
      }

      soundManager.playAttack();
      hapticManager.triggerCombatVibration('destroy');
      setWinner(roundWinner);
      setGameState('RESULT');
    }, 1350);
  };

  const handleSelectChoice = (choice) => {
    if (gameState !== 'CHOOSING' || playerChoice) return;

    soundManager.playDecide();
    hapticManager.triggerCombatVibration('click');
    setPlayerChoice(choice);

    if (isMultiplayer) {
      // Send choice to peer over WebSocket / local channel
      connectionManager.send({
        type: 'JANKEN_CHOICE',
        choiceId: choice.id,
      });

      if (isOpponentBot) {
        // Opponent is an AI bot: auto-generate bot choice after short delay
        setGameState('WAITING_OPPONENT');
        setTimeout(() => {
          const oppRandom = CHOICES[Math.floor(Math.random() * CHOICES.length)];
          setOpponentChoiceId(oppRandom.id);
          startRevealSequence(choice, oppRandom.id);
        }, 500);
        return;
      }

      if (opponentChoiceId) {
        // Both choices ready! Start reveal sequence
        setGameState('WAITING_OPPONENT');
        startRevealSequence(choice, opponentChoiceId);
      } else {
        // Wait for peer to lock their choice
        setGameState('WAITING_OPPONENT');
      }
    } else {
      // Solo AI Duel: Pick random AI choice
      setGameState('REVEALING');
      setRevealCount(1);
      soundManager.play('janken');

      setTimeout(() => {
        setRevealCount(2);
        soundManager.playClick();
      }, 450);

      setTimeout(() => {
        setRevealCount(3);
        soundManager.playClick();
      }, 900);

      setTimeout(() => {
        const oppRandom = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        setOpponentChoice(oppRandom);

        let roundWinner = 'tie';
        if (choice.id === oppRandom.id) {
          roundWinner = 'tie';
          soundManager.playCardOpen();
        } else if (choice.beats === oppRandom.id) {
          roundWinner = 'player';
          soundManager.playWin();
        } else {
          roundWinner = 'opponent';
          soundManager.playDamage();
          const oppDecidesFirst = Math.random() < 0.7;
          setOpponentTurnDecision(oppDecidesFirst ? 1 : 0);
        }

        soundManager.playAttack();
        hapticManager.triggerCombatVibration('destroy');
        setWinner(roundWinner);
        setGameState('RESULT');
      }, 1350);
    }
  };

  const handleLocalReset = () => {
    setGameState('CHOOSING');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setOpponentChoiceId(null);
    setWinner(null);
    setOpponentTurnDecision(null);
    setOpponentLocked(false);
  };

  const handleResetTie = () => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');

    if (isMultiplayer) {
      connectionManager.send({ type: 'JANKEN_RESET' });
    }
    handleLocalReset();
  };

  const handleConfirmTurnOrder = (startingPlayerIdx) => {
    soundManager.playStart();
    soundManager.stopJankenBgm();

    if (isMultiplayer) {
      // Determine role that goes first
      // startingPlayerIdx === 0: "I go first"
      // startingPlayerIdx === 1: "Opponent goes first"
      const startingPlayerRole = (startingPlayerIdx === 0)
        ? (isHost ? 'host' : 'client')
        : (isHost ? 'client' : 'host');

      connectionManager.send({
        type: 'JANKEN_DECIDE_TURN',
        startingPlayerRole,
      });
    }

    if (onComplete) {
      onComplete({ startingPlayer: startingPlayerIdx });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundImage: isLight
          ? 'radial-gradient(circle at center, rgba(255, 252, 240, 0.45) 0%, rgba(235, 220, 185, 0.85) 85%), url(/assets/fie_light.png)'
          : 'radial-gradient(circle at center, rgba(14, 18, 28, 0.38) 0%, rgba(8, 10, 18, 0.86) 85%), url(/assets/fie_night.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 16,
      }}
    >
      {/* Top Header Actions */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        <button onClick={onCancel} className="btn-pharaoh-stone" style={{ padding: '7px 16px', fontSize: 13 }}>
          {isMultiplayer ? 'إلغاء والرجوع' : 'رجوع'}
        </button>

        {onToggleTheme && (
          <button onClick={onToggleTheme} className="btn-pharaoh-stone" style={{ padding: '7px 12px', fontSize: 12 }}>
            {theme === 'dark' ? 'مظهر البردي (فاتح)' : 'مظهر السبج (داكن)'}
          </button>
        )}
      </div>

      {/* Main Container */}
      <div
        className="stone-panel"
        style={{
          maxWidth: 600,
          width: '94%',
          padding: '28px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.75)',
          position: 'relative',
        }}
      >
        {/* Ancient Millennium Eye Emblem */}
        <div style={{ marginBottom: 10, filter: 'drop-shadow(0 0 10px rgba(240, 203, 100, 0.5))' }}>
          <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
            <polygon points="50,10 90,85 10,85" stroke="var(--pharaoh-gold-bright)" strokeWidth="3.5" fill="rgba(201, 158, 50, 0.15)" />
            <circle cx="50" cy="54" r="14" stroke="var(--pharaoh-gold-bright)" strokeWidth="2.5" fill="var(--pharaoh-input-bg)" />
            <circle cx="50" cy="54" r="6" fill="var(--pharaoh-gold-bright)" />
          </svg>
        </div>

        <h1 style={{ fontSize: 21, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 4, letterSpacing: 0.5 }}>
          طوبة ورقة مقص — قرعة البداية
        </h1>

        <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)', marginBottom: 18, fontWeight: 700 }}>
          {playerDeckName} <span style={{ color: 'var(--pharaoh-text-muted)' }}>ضد</span> {opponentName}
          {isMultiplayer && (
            <span style={{ marginRight: 8, color: '#4ade80', fontSize: 11 }}>
              • ماتش أونلاين مباشر
            </span>
          )}
        </div>

        {/* State 1: CHOOSING / WAITING */}
        {(gameState === 'CHOOSING' || gameState === 'WAITING_OPPONENT') && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Guidance Banner */}
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--pharaoh-text-gold)', marginBottom: 14 }}>
              {gameState === 'WAITING_OPPONENT'
                ? 'اخترت خلاص! مستنيين الخصم يختار...'
                : 'دوس على اختيارك علشان نحدد مين اللي هيبدأ الأول في الماتش:'}
            </div>

            {/* Multiplayer Peer Status Badge */}
            {isMultiplayer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(201, 158, 50, 0.12)',
                  border: '1px solid var(--pharaoh-gold-dark)',
                  borderRadius: 20,
                  padding: '5px 16px',
                  marginBottom: 16,
                  fontSize: 11.5,
                  color: 'var(--pharaoh-text-light)',
                }}
              >
                {opponentLocked ? (
                  <>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    <span style={{ color: '#4ade80', fontWeight: 800 }}>الخصم اختار خلاص!</span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'beaconPulse 1.4s infinite' }} />
                    <span style={{ color: 'var(--pharaoh-text-muted)' }}>الخصم لسه بيختار...</span>
                  </>
                )}
              </div>
            )}

            {/* 3 Sacred Stele Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                width: '100%',
                marginBottom: 14,
              }}
            >
              {CHOICES.map((choice) => {
                const isSelected = playerChoice?.id === choice.id;
                return (
                  <div
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    className="temple-stele-button"
                    style={{
                      background: isSelected
                        ? 'rgba(201, 158, 50, 0.25)'
                        : 'var(--pharaoh-stone-card)',
                      border: isSelected
                        ? '2px solid var(--pharaoh-gold-bright)'
                        : '1.5px solid var(--pharaoh-stone-border)',
                      borderRadius: 8,
                      padding: '16px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: gameState === 'CHOOSING' ? 'pointer' : 'default',
                      transform: isSelected ? 'scale(1.03)' : 'none',
                      boxShadow: isSelected ? '0 0 20px rgba(240, 203, 100, 0.45)' : 'none',
                      transition: 'all 0.15s ease',
                      opacity: playerChoice && !isSelected ? 0.45 : 1,
                    }}
                  >
                    <div style={{ marginBottom: 10, filter: isSelected ? 'drop-shadow(0 0 10px rgba(240, 203, 100, 0.6))' : 'none' }}>
                      {choice.icon(isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-gold)', 48)}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 3 }}>
                      {choice.subname}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pharaoh-text-gold)', marginBottom: 5 }}>
                      {choice.name}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--pharaoh-text-muted)', lineHeight: 1.35, textAlign: 'center' }}>
                      {choice.ruleText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* State 2: REVEALING Rhythmic Chant & Moving Slabs */}
        {gameState === 'REVEALING' && (
          <div style={{ padding: '22px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Rhythmic Egyptian Chant */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: 'var(--pharaoh-gold-bright)',
                marginBottom: 20,
                letterSpacing: 2,
                textShadow: '0 0 20px rgba(240, 203, 100, 0.85)',
                transition: 'all 0.15s ease',
              }}
            >
              {revealCount === 1 ? 'طوبة...' : revealCount === 2 ? 'ورقة...' : 'مقص!'}
            </div>

            {/* Slabs Bobbing in Synchronization */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, width: '100%' }}>
              {/* Player Slabs */}
              <div
                className="rps-shaking"
                style={{
                  background: 'var(--pharaoh-stone-card)',
                  border: '2px solid var(--pharaoh-gold-bright)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 114,
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.6)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--pharaoh-gold-bright)', marginBottom: 8, fontWeight: 800 }}>
                  لوحك الحجري
                </div>
                <SacredRockIcon size={46} color="var(--pharaoh-gold-bright)" />
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginTop: 8 }}>
                  بيستعد للصدام
                </div>
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>ضد</div>

              {/* Opponent Slabs */}
              <div
                className="rps-shaking"
                style={{
                  background: 'var(--pharaoh-stone-card)',
                  border: '2px solid var(--pharaoh-stone-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 114,
                  animationDelay: '-0.2s',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.6)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginBottom: 8, fontWeight: 800 }}>
                  لوح {opponentName}
                </div>
                <SacredRockIcon size={46} color="var(--pharaoh-gold-royal)" />
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-text-gold)', marginTop: 8 }}>
                  بيستعد للصدام
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: RESULT & High-Energy Collision */}
        {gameState === 'RESULT' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Expanding Collision Shockwave */}
            <div className="rps-shockwave" style={{ top: 38 }} />

            {/* Clashing Slabs in High-Speed Collision */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 22,
                marginBottom: 20,
                width: '100%',
                position: 'relative',
                zIndex: 10,
              }}
            >
              {/* Player choice slab with clash animation and aura */}
              <div
                className={`rps-clash-left ${winner === 'player' ? 'rps-winner-aura' : winner === 'opponent' ? 'rps-defeated-tilt' : ''}`}
                style={{
                  background: 'var(--pharaoh-stone-card)',
                  border: `2px solid ${winner === 'player' ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-stone-border)'}`,
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 114,
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)', marginBottom: 6, fontWeight: 800 }}>
                  اختيارك
                </div>
                <div style={{ marginBottom: 6 }}>
                  {playerChoice?.icon('var(--pharaoh-gold-bright)', 44)}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  {playerChoice?.subname}
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--pharaoh-stone-border)' }}>ضد</div>

              {/* Opponent choice slab */}
              <div
                className={`rps-clash-right ${winner === 'opponent' ? 'rps-winner-aura' : winner === 'player' ? 'rps-defeated-tilt' : ''}`}
                style={{
                  background: 'var(--pharaoh-stone-card)',
                  border: `2px solid ${winner === 'opponent' ? '#ef4444' : 'var(--pharaoh-stone-border)'}`,
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 114,
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', marginBottom: 6, fontWeight: 800 }}>
                  {opponentName}
                </div>
                <div style={{ marginBottom: 6 }}>
                  {opponentChoice?.icon(winner === 'opponent' ? '#ef4444' : 'var(--pharaoh-gold-royal)', 44)}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--pharaoh-text-gold)' }}>
                  {opponentChoice?.subname}
                </div>
              </div>
            </div>

            {/* Tie Rematch Branch */}
            {winner === 'tie' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 6 }}>
                  تعادل!
                </div>
                <div style={{ fontSize: 12, color: 'var(--pharaoh-text-muted)', marginBottom: 16 }}>
                  انتوا الاتنين اخترتوا نفس الحاجة، العبوا تاني!
                </div>
                <button
                  onClick={handleResetTie}
                  className="btn-pharaoh-gold duel-btn-shine-wrap"
                  style={{ padding: '11px 28px', fontSize: 14, fontWeight: 900 }}
                >
                  <span className="duel-btn-shine-sheen" />
                  العب تاني دلوقتي
                </button>
              </div>
            )}

            {/* Player Won Branch */}
            {winner === 'player' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CrownIcon size={22} color="var(--pharaoh-gold-bright)" />
                  كسبت القرعة!
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--pharaoh-text-gold)', marginBottom: 18, fontWeight: 700 }}>
                  عايز تبدأ الأول ولا تلعب التاني؟
                </div>

                <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 460 }}>
                  <button
                    onClick={() => handleConfirmTurnOrder(0)}
                    className="btn-pharaoh-gold duel-btn-shine-wrap"
                    style={{ flex: 1, padding: '13px 10px', fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <span className="duel-btn-shine-sheen" />
                    <SwordIcon size={18} color="#ffffff" />
                    ابدأ الأول
                  </button>

                  <button
                    onClick={() => handleConfirmTurnOrder(1)}
                    className="btn-pharaoh-stone"
                    style={{ flex: 1, padding: '13px 10px', fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <ShieldIcon size={18} color="var(--pharaoh-gold-bright)" />
                    العب التاني
                  </button>
                </div>
              </div>
            )}

            {/* Opponent Won Branch */}
            {winner === 'opponent' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#f87171', marginBottom: 4 }}>
                  {opponentName} كسب القرعة!
                </div>

                {isMultiplayer && !isOpponentBot ? (
                  <div style={{ fontSize: 13, color: 'var(--pharaoh-text-gold)', margin: '12px 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'beaconPulse 1.4s infinite' }} />
                    مستنيين {opponentName} يقرر مين هيبدأ الأول...
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--pharaoh-text-gold)', marginBottom: 18 }}>
                      {opponentTurnDecision === 1
                        ? `${opponentName} اختار إنه يبدأ الأول!`
                        : `${opponentName} اختار إنك تبدأ الأول!`}
                    </div>

                    <button
                      onClick={() => handleConfirmTurnOrder(opponentTurnDecision)}
                      className="btn-pharaoh-gold duel-btn-shine-wrap"
                      style={{ padding: '13px 36px', fontSize: 14.5, fontWeight: 900 }}
                    >
                      <span className="duel-btn-shine-sheen" />
                      ادخل على الماتش
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissorsScreen;
