import React, { useState, useEffect, useRef } from 'react';
import soundManager, {
  BGM_TRACKS,
  OST_TRACKS,
  CLIMAX_TRIGGER_OPTIONS,
  EQ_PRESETS,
  PREAMP_BOOST_LEVELS,
  PLAYBACK_MODES,
} from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';
import { AI_DIFFICULTIES } from '../../game/ai/AIPlayer.js';
import { ARENA_THEMES, resolveArenaBgImage } from '../../game/utils/arenaThemes.js';

// Clean SVG Icons without any emojis
const ArenaPillarIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-8a3 3 0 0 1 6 0v8" />
  </svg>
);

const EyeInspectIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const NetworkSyncIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19" />
  </svg>
);

const ExpandIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const SpeakerIcon = ({ muted, size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    {!muted ? (
      <>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    ) : (
      <>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    )}
  </svg>
);

const MusicNoteIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const LightningIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const PlayIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const PrevIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" stroke={color} strokeWidth="2" />
  </svg>
);

const NextIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" stroke={color} strokeWidth="2" />
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

const isFullscreenActive = () => {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

export const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  aiDifficulty = 'hard',
  onSelectAiDifficulty,
  onSelectArena,
  arenaSyncMode: externalArenaSyncMode,
  onSelectArenaSyncMode,
  dynamicArenaMode: externalDynamicArenaMode,
  onSelectDynamicArenaMode,
}) => {
  // Master & SFX
  const [muted, setMuted] = useState(() => soundManager.isMuted());
  const [volume, setVolume] = useState(() => soundManager.getVolume());
  const [sfxEnabled, setSfxEnabled] = useState(() => soundManager.isSfxEnabled());

  // Background Music (الموسيقى الخلفية للنزال)
  const [musicEnabled, setMusicEnabled] = useState(() => soundManager.isMusicEnabled());
  const [musicVolume, setMusicVolume] = useState(() => soundManager.getMusicVolume());
  const [ostTrackIndex, setOstTrackIndex] = useState(() => soundManager.getBgmState().currentOstIndex);
  const [isDucked, setIsDucked] = useState(() => soundManager.getBgmState().isDucked);

  // Climax Theme Songs (الأغاني وشارات الحماس)
  const [songsEnabled, setSongsEnabled] = useState(() => soundManager.isSongsEnabled());
  const [bgmTrackIndex, setBgmTrackIndex] = useState(() => soundManager.getBgmState().index);
  const [bgmState, setBgmState] = useState(() => soundManager.getBgmState());
  const [bgmVolume, setBgmVolume] = useState(() => soundManager.getBgmVolume());
  const [preampBoost, setPreampBoost] = useState(() => soundManager.getPreampBoost());
  const [eqPreset, setEqPreset] = useState(() => soundManager.getEqPreset());
  const [playbackMode, setPlaybackMode] = useState(() => soundManager.getPlaybackMode());
  const [climaxTriggerLp, setClimaxTriggerLp] = useState(() => soundManager.getClimaxTriggerLp());

  // Display & Haptics
  const [isFullscreen, setIsFullscreen] = useState(() => isFullscreenActive());
  const [vibrationEnabled, setVibrationEnabled] = useState(() => hapticManager.isEnabled());
  const [vibDamage, setVibDamage] = useState(() => hapticManager.vibrateOnDamage);
  const [vibDestroy, setVibDestroy] = useState(() => hapticManager.vibrateOnDestroy);
  const [vibDirect, setVibDirect] = useState(() => hapticManager.vibrateOnDirectAttack);
  const [vibTrap, setVibTrap] = useState(() => hapticManager.vibrateOnTrap);
  const [vibGameOver, setVibGameOver] = useState(() => hapticManager.vibrateOnGameOver);
  const [vibrateTested, setVibrateTested] = useState(false);

  // Card Interaction & Mobile UX Controls
  const [quickSummonEnabled, setQuickSummonEnabled] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_quick_summon_enabled') !== 'false' : true;
  });
  const [quickSummonPos, setQuickSummonPos] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_quick_summon_pos') : null) || 'face_up_attack';
  });
  const [cardMenuStyle, setCardMenuStyle] = useState(() => {
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_card_menu_style') : null) || 'compact';
  });

  // Arena Battlefield Theme
  const [arenaTheme, setArenaTheme] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_theme') || 'random' : 'random';
  });
  // Multiplayer Arena Sync Mode: 'synced' (موحدة ومتزامنة عند الاثنين) vs 'independent' (مستقلة لكل لاعب)
  const [arenaSyncMode, setArenaSyncMode] = useState(() => {
    if (externalArenaSyncMode) return externalArenaSyncMode;
    return typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_arena_sync_mode') || 'synced' : 'synced';
  });
  // Dynamic Combat Arena Mode: 'manual_only' (ثابتة) vs 'climax_only' (عند نقاط الحسم) vs 'full_dynamic' (تفاعلية كاملة)
  const [dynamicArenaMode, setDynamicArenaMode] = useState(() => {
    if (externalDynamicArenaMode) return externalDynamicArenaMode;
    return (typeof localStorage !== 'undefined' ? localStorage.getItem('yugioh_dynamic_arena_mode') : null) || 'manual_only';
  });
  const [fullscreenPreviewArena, setFullscreenPreviewArena] = useState(null);
  const arenaScrollRef = useRef(null);

  const scrollArenaHorizontal = (direction) => {
    if (arenaScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      arenaScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      soundManager.playClick();
    }
  };

  const handleSelectArenaSyncMode = (mode) => {
    setArenaSyncMode(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_arena_sync_mode', mode);
    }
    if (onSelectArenaSyncMode) {
      onSelectArenaSyncMode(mode);
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleSelectDynamicArenaMode = (mode) => {
    setDynamicArenaMode(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_dynamic_arena_mode', mode);
    }
    if (onSelectDynamicArenaMode) {
      onSelectDynamicArenaMode(mode);
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };


  // Sync fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive());
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  // Re-sync all sound, haptic and display states when modal opens
  useEffect(() => {
    if (isOpen) {
      setMuted(soundManager.isMuted());
      setVolume(soundManager.getVolume());
      setSfxEnabled(soundManager.isSfxEnabled());

      setMusicEnabled(soundManager.isMusicEnabled());
      setMusicVolume(soundManager.getMusicVolume());

      const st = soundManager.getBgmState();
      setBgmState(st);
      setOstTrackIndex(st.currentOstIndex);
      setIsDucked(st.isDucked);

      setSongsEnabled(soundManager.isSongsEnabled());
      setBgmTrackIndex(st.index);
      setBgmVolume(soundManager.getBgmVolume());
      setPreampBoost(soundManager.getPreampBoost());
      setEqPreset(soundManager.getEqPreset());
      setPlaybackMode(soundManager.getPlaybackMode());
      setClimaxTriggerLp(soundManager.getClimaxTriggerLp());

      setIsFullscreen(isFullscreenActive());
      setVibrationEnabled(hapticManager.isEnabled());
      setVibDamage(hapticManager.vibrateOnDamage);
      setVibDestroy(hapticManager.vibrateOnDestroy);
      setVibDirect(hapticManager.vibrateOnDirectAttack);
      setVibTrap(hapticManager.vibrateOnTrap);
      setVibGameOver(hapticManager.vibrateOnGameOver);

      if (typeof localStorage !== 'undefined') {
        setQuickSummonEnabled(localStorage.getItem('yugioh_quick_summon_enabled') !== 'false');
        setQuickSummonPos(localStorage.getItem('yugioh_quick_summon_pos') || 'face_up_attack');
        setCardMenuStyle(localStorage.getItem('yugioh_card_menu_style') || 'compact');
        setArenaTheme(localStorage.getItem('yugioh_arena_theme') || 'random');
        setArenaSyncMode(localStorage.getItem('yugioh_arena_sync_mode') || 'synced');
        setDynamicArenaMode(localStorage.getItem('yugioh_dynamic_arena_mode') || 'manual_only');
      }
    }
  }, [isOpen]);

  // Keep state synchronized if external props change
  useEffect(() => {
    if (externalArenaSyncMode) setArenaSyncMode(externalArenaSyncMode);
  }, [externalArenaSyncMode]);

  useEffect(() => {
    if (externalDynamicArenaMode) setDynamicArenaMode(externalDynamicArenaMode);
  }, [externalDynamicArenaMode]);

  // Subscribe to real-time audio state updates from SoundManager
  useEffect(() => {
    const unsub = soundManager.subscribeBgm((st) => {
      setBgmState(st);
      setMusicEnabled(st.musicEnabled);
      setMusicVolume(st.musicVolume);
      setOstTrackIndex(st.currentOstIndex);
      setIsDucked(st.isDucked);

      setSongsEnabled(st.songsEnabled);
      setBgmTrackIndex(st.index);
      setBgmVolume(st.songsVolume ?? st.bgmVolume);
      setPreampBoost(st.preampBoost);
      setEqPreset(st.eqPreset);
      setPlaybackMode(st.playbackMode);
      setClimaxTriggerLp(st.climaxTriggerLp);

      setMuted(st.muted);
      setVolume(st.volume);
      setSfxEnabled(st.sfxEnabled);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleToggleFullscreen = async () => {
    hapticManager.triggerCombatVibration('click');
    soundManager.playClick();
    try {
      if (isFullscreenActive()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          await root.webkitRequestFullscreen();
        } else if (root.mozRequestFullScreen) {
          await root.mozRequestFullScreen();
        } else if (root.msRequestFullscreen) {
          await root.msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not allowed:', err);
      setIsFullscreen(isFullscreenActive());
    }
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setMuted(nextMuted);
    hapticManager.triggerCombatVibration('click');
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundManager.setMusicEnabled(next);
    hapticManager.triggerCombatVibration('click');
  };

  const handleMusicVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    soundManager.setMusicVolume(val);
  };

  const handleSelectOst = (idx) => {
    setOstTrackIndex(idx);
    soundManager.setOstTrack(idx);
    hapticManager.triggerCombatVibration('click');
  };

  const handleToggleSongs = () => {
    const next = !songsEnabled;
    setSongsEnabled(next);
    soundManager.setSongsEnabled(next);
    hapticManager.triggerCombatVibration('click');
  };

  const handleSongsVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setBgmVolume(val);
    soundManager.setBgmVolume(val);
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundManager.setSfxEnabled(next);
    if (next) soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleToggleVibration = () => {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    hapticManager.setEnabled(next);
    if (next) hapticManager.testVibrate();
  };

  const handleToggleVibOption = (key, currentVal, setter) => {
    const next = !currentVal;
    setter(next);
    hapticManager.setOption(key, next);
    if (next && vibrationEnabled) {
      hapticManager.testVibrate();
    }
  };

  const handleTestVibrate = () => {
    hapticManager.testVibrate();
    setVibrateTested(true);
    setTimeout(() => setVibrateTested(false), 1200);
  };

  const handleToggleQuickSummon = () => {
    const next = !quickSummonEnabled;
    setQuickSummonEnabled(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_quick_summon_enabled', next ? 'true' : 'false');
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleSelectQuickSummonPos = (pos) => {
    setQuickSummonPos(pos);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_quick_summon_pos', pos);
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleSelectCardMenuStyle = (style) => {
    setCardMenuStyle(style);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_card_menu_style', style);
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleSelectArena = (arenaId) => {
    setArenaTheme(arenaId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_arena_theme', arenaId);
    }
    if (onSelectArena) {
      onSelectArena(arenaId);
    }
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handlePrevArenaPreview = () => {
    if (!fullscreenPreviewArena) return;
    const idx = ARENA_THEMES.findIndex((a) => a.id === fullscreenPreviewArena.id);
    const prevIdx = (idx - 1 + ARENA_THEMES.length) % ARENA_THEMES.length;
    setFullscreenPreviewArena(ARENA_THEMES[prevIdx]);
    soundManager.playClick();
  };

  const handleNextArenaPreview = () => {
    if (!fullscreenPreviewArena) return;
    const idx = ARENA_THEMES.findIndex((a) => a.id === fullscreenPreviewArena.id);
    const nextIdx = (idx + 1) % ARENA_THEMES.length;
    setFullscreenPreviewArena(ARENA_THEMES[nextIdx]);
    soundManager.playClick();
  };

  const activeSelectedArenaObj = ARENA_THEMES.find((a) => a.id === arenaTheme) || ARENA_THEMES[0];
  const activeSelectedBg = resolveArenaBgImage(activeSelectedArenaObj, theme);

  return (
    <>
      <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="stone-panel"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.95)',
          border: '2px solid var(--pharaoh-gold-bright)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--pharaoh-stone-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="var(--pharaoh-gold-bright)" strokeWidth="6" />
              <circle cx="50" cy="50" r="16" fill="var(--pharaoh-gold-bright)" />
              <line x1="50" y1="2" x2="50" y2="20" stroke="var(--pharaoh-gold-bright)" strokeWidth="8" />
              <line x1="50" y1="80" x2="50" y2="98" stroke="var(--pharaoh-gold-bright)" strokeWidth="8" />
              <line x1="2" y1="50" x2="20" y2="50" stroke="var(--pharaoh-gold-bright)" strokeWidth="8" />
              <line x1="80" y1="50" x2="98" y2="50" stroke="var(--pharaoh-gold-bright)" strokeWidth="8" />
            </svg>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', margin: 0 }}>
              إعدادات الصوت والمعركة
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-pharaoh-stone"
            style={{ padding: '5px 14px', fontSize: 12, fontWeight: 800 }}
          >
            إغلاق
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* SECTION 1: DUEL BACKGROUND MUSIC (الموسيقى الخلفية للنزال) */}
          <div
            className="settings-section-card"
            style={{
              background: 'linear-gradient(135deg, rgba(22, 16, 10, 0.95), rgba(34, 24, 12, 0.95))',
              border: '1.5px solid rgba(212, 175, 55, 0.55)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MusicNoteIcon size={18} color="var(--pharaoh-gold-bright)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    الموسيقى الخلفية للنزال
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                    موسيقى يوغي أوه الأصلية تعمل تلقائياً طوال النزال
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleMusic}
                className={musicEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{ padding: '5px 12px', fontSize: 11.5, fontWeight: 900, borderRadius: 5 }}
              >
                {musicEnabled ? 'مفعلة' : 'معطلة'}
              </button>
            </div>

            {/* Music Volume Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--pharaoh-text-gold)', marginBottom: 4 }}>
                <span style={{ fontWeight: 800 }}>مستوى صوت الموسيقى:</span>
                <span style={{ fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                style={{ width: '100%', accentColor: 'var(--pharaoh-gold-bright)', cursor: 'pointer' }}
              />
            </div>

            {/* Music Track Selection */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--pharaoh-text-gold)', marginBottom: 6 }}>
                المقطوعة الموسيقية المختارة:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {OST_TRACKS.map((ost, idx) => {
                  const isCur = ostTrackIndex === idx;
                  return (
                    <button
                      key={ost.id}
                      onClick={() => handleSelectOst(idx)}
                      className={`settings-chip-btn ${isCur ? 'active' : ''}`}
                      style={{ padding: '8px 10px', alignItems: 'flex-start' }}
                    >
                      <span style={{ fontWeight: 900, fontSize: 11 }}>{ost.title}</span>
                      <span style={{ fontSize: 9.5, opacity: 0.75 }}>
                        {isCur ? (bgmState.isMusicPlaying ? 'تعمل الآن' : 'مختارة') : 'اضغط للتشغيل'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Music Ducking Notice */}
            {isDucked && (
              <div
                style={{
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: 5,
                  padding: '6px 10px',
                  fontSize: 10.5,
                  color: 'var(--pharaoh-text-gold)',
                  lineHeight: 1.4,
                }}
              >
                صوت الموسيقى موطّى تلقائياً لتبرز شارة الأغنية بصوت قوي وواضح في ساحة المعركة.
              </div>
            )}
          </div>

          {/* SECTION 2: CLIMAX THEME SONGS (الأغاني وشارات الحماس السبيستونية) */}
          <div
            className="settings-section-card"
            style={{
              background: 'linear-gradient(135deg, rgba(28, 14, 12, 0.95), rgba(42, 20, 14, 0.95))',
              border: '1.5px solid rgba(239, 68, 68, 0.55)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LightningIcon size={18} color="#f87171" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fca5a5' }}>
                    شارات وأغاني الحماس الملحمية
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                    تنطلق تلقائياً بصوت مضخم عند نقطة المعركة الحاسمة
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleSongs}
                className={songsEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{ padding: '5px 12px', fontSize: 11.5, fontWeight: 900, borderRadius: 5 }}
              >
                {songsEnabled ? 'مفعلة' : 'معطلة'}
              </button>
            </div>

            {/* Climax Trigger LP Selector */}
            <div
              style={{
                background: 'var(--pharaoh-slot-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 6,
                padding: 10,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--pharaoh-carnelian-border)', marginBottom: 6 }}>
                نقطة بدء الأغاني الحماسية في المعركة:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {CLIMAX_TRIGGER_OPTIONS.map((opt) => {
                  const isAct = climaxTriggerLp === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setClimaxTriggerLp(opt.value);
                        soundManager.setClimaxTriggerLp(opt.value);
                        hapticManager.triggerCombatVibration('click');
                      }}
                      className={isAct ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                      style={{
                        padding: '6px 8px',
                        fontSize: 10.5,
                        fontWeight: isAct ? 900 : 700,
                        textAlign: 'right',
                        border: isAct ? '1.5px solid var(--pharaoh-gold-bright)' : undefined,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Song Volume Slider & Preamp Booster */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 6,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--pharaoh-text-gold)', marginBottom: 4 }}>
                  <span style={{ fontWeight: 800 }}>مستوى صوت الأغاني:</span>
                  <span style={{ fontWeight: 900, color: '#facc15' }}>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVolume}
                  onChange={handleSongsVolumeChange}
                  style={{ width: '100%', accentColor: 'var(--pharaoh-gold-bright)', cursor: 'pointer' }}
                />
              </div>

              {/* Preamp Boost Multipliers */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--pharaoh-gold-bright)', marginBottom: 5 }}>
                  مضاعفة وتضخيم الصوت الخارق (Preamp Booster):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                  {PREAMP_BOOST_LEVELS.map((bl) => {
                    const isCur = Math.abs(preampBoost - bl.level) < 0.15;
                    return (
                      <button
                        key={bl.id}
                        onClick={() => {
                          setPreampBoost(bl.level);
                          soundManager.setPreampBoost(bl.level);
                          hapticManager.triggerCombatVibration('click');
                        }}
                        className={`settings-chip-btn ${isCur ? 'active' : ''}`}
                        style={{ padding: '6px 6px', alignItems: 'center', textAlign: 'center' }}
                      >
                        <span style={{ fontWeight: 900, fontSize: 10.5 }}>{bl.label}</span>
                        <span style={{ fontSize: 8.5, opacity: 0.75 }}>{bl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Mini-Player Controls */}
            <div
              style={{
                background: 'var(--pharaoh-stone-slab)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 7,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bgmState.track?.title || 'أغنية الحماس'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bgmState.track?.subtitle} • {bgmState.track?.artist}
                  </div>
                </div>

                {/* Transport Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => {
                      soundManager.prevBgmTrack();
                      hapticManager.triggerCombatVibration('click');
                    }}
                    className="btn-pharaoh-stone"
                    style={{ padding: '6px 10px', fontSize: 11, borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    title="السابق"
                  >
                    <PrevIcon size={11} />
                    <span>السابق</span>
                  </button>

                  <button
                    onClick={() => {
                      if (bgmState.isPlaying) {
                        soundManager.pauseBgm();
                      } else {
                        soundManager.resumeBgm();
                      }
                      hapticManager.triggerCombatVibration('click');
                    }}
                    className="btn-pharaoh-gold"
                    style={{ padding: '6px 14px', fontSize: 11.5, borderRadius: 5, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    {bgmState.isPlaying ? (
                      <>
                        <PauseIcon size={12} />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon size={12} />
                        <span>تشغيل</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.nextBgmTrack();
                      hapticManager.triggerCombatVibration('click');
                    }}
                    className="btn-pharaoh-stone"
                    style={{ padding: '6px 10px', fontSize: 11, borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    title="التالي"
                  >
                    <span>التالي</span>
                    <NextIcon size={11} />
                  </button>
                </div>
              </div>

              {/* Playback Mode (Shuffle / Sequence / Repeat) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 6 }}>
                <span style={{ fontSize: 10.5, color: 'var(--pharaoh-text-gold)', fontWeight: 700 }}>وضع التبديل:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {PLAYBACK_MODES.map((pm) => {
                    const isAct = playbackMode === pm.id;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => {
                          setPlaybackMode(pm.id);
                          soundManager.setPlaybackMode(pm.id);
                          hapticManager.triggerCombatVibration('click');
                        }}
                        className={isAct ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                        style={{ padding: '3px 8px', fontSize: 10, borderRadius: 4, fontWeight: isAct ? 900 : 600 }}
                      >
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tracklist Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--pharaoh-gold-bright)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>قائمة الأغاني المتاحة (اضغط لاختيار الأغنية):</span>
                <span style={{ fontSize: 9.5, opacity: 0.75 }}>4 شارات متاحة</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BGM_TRACKS.map((t, idx) => {
                  const isCur = bgmTrackIndex === idx;
                  const isPlayingThis = isCur && bgmState.isPlaying;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setBgmTrackIndex(idx);
                        soundManager.setBgmTrack(idx);
                        hapticManager.triggerCombatVibration('click');
                      }}
                      className={`settings-track-card ${isCur ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: isCur ? 'linear-gradient(135deg, #f59e0b, #b45309)' : 'rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            color: isCur ? '#fff' : 'var(--pharaoh-text-gold)',
                            fontWeight: 900,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: isCur ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-light)' }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: 9.5, color: 'var(--pharaoh-text-muted)' }}>
                            {t.subtitle} • {t.artist}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: t.intensity === 'climax' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                            color: t.intensity === 'climax' ? '#f87171' : '#fde047',
                            border: `1px solid ${t.intensity === 'climax' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}
                        >
                          {isPlayingThis ? 'تعمل الآن' : isCur ? 'مختارة' : 'جاهزة'}
                        </span>
                        {isPlayingThis && (
                          <div className="music-eq-bars" style={{ height: 14 }}>
                            <div className="music-eq-bar" />
                            <div className="music-eq-bar" />
                            <div className="music-eq-bar" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equalizer Audio Filters */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--pharaoh-stone-border)',
                borderRadius: 6,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--pharaoh-gold-bright)' }}>
                فلاتر تحسين الصوت (Audio Equalizer Filters):
              </div>
              <div className="settings-chip-grid">
                {Object.values(EQ_PRESETS).map((p) => {
                  const isAct = eqPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setEqPreset(p.id);
                        soundManager.applyEqPreset(p.id);
                        hapticManager.triggerCombatVibration('click');
                      }}
                      className={`settings-chip-btn ${isAct ? 'active' : ''}`}
                    >
                      <span style={{ fontWeight: 900 }}>{p.name}</span>
                      <span style={{ fontSize: 9, opacity: 0.75 }}>{p.arabicDesc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: SFX BATTLE SOUNDS */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                مؤثرات وأصوات المعركة (SFX)
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                أصوات الاستدعاء، التدمير، الهجوم، السحر، وسحب البطاقات
              </div>
            </div>

            <button
              onClick={handleToggleSfx}
              className={sfxEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 900 }}
            >
              {sfxEnabled ? 'شغالة' : 'مقفولة'}
            </button>
          </div>

          {/* SECTION 4: MASTER SOUND & GENERAL VOLUME */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SpeakerIcon muted={muted} size={18} color="var(--pharaoh-gold-bright)" />
                <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  التحكم في الصوت العام
                </span>
              </div>

              <button
                onClick={handleToggleMute}
                className={muted ? 'btn-pharaoh-danger' : 'btn-pharaoh-stone'}
                style={{ padding: '5px 12px', fontSize: 11.5, fontWeight: 900 }}
              >
                {muted ? 'الصوت مكتوم' : 'الصوت شغال'}
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--pharaoh-text-gold)', marginBottom: 4 }}>
                <span style={{ fontWeight: 800 }}>مستوى الصوت العام:</span>
                <span style={{ fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                style={{ width: '100%', accentColor: 'var(--pharaoh-gold-bright)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* SECTION 5: VIBRATION & HAPTIC FEEDBACK */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  هزة الموبايل والتفاعل الحركي
                </div>
                <div style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)' }}>
                  اهتزاز واقعي متزامن مع أحداث وضربات المعركة
                </div>
              </div>

              <button
                onClick={handleToggleVibration}
                className={vibrationEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{ padding: '6px 14px', fontSize: 12, fontWeight: 900 }}
              >
                {vibrationEnabled ? 'مفعل' : 'معطل'}
              </button>
            </div>

            {vibrationEnabled && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--pharaoh-stone-border)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pharaoh-text-gold)' }}>
                  تحديد حالات اهتزاز الموبايل:
                </div>

                {/* Case 1: Damage */}
                <div
                  onClick={() => handleToggleVibOption('damage', vibDamage, setVibDamage)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'var(--pharaoh-stone-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>
                    اهتزاز عند نقص نقاط الحياة من ضربة قوية
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: vibDamage ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)' }}>
                    {vibDamage ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                {/* Case 2: Monster Destroyed */}
                <div
                  onClick={() => handleToggleVibOption('destroy', vibDestroy, setVibDestroy)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'var(--pharaoh-stone-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>
                    اهتزاز عند تدمير الوحوش في ساحة المعركة
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: vibDestroy ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)' }}>
                    {vibDestroy ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                {/* Case 3: Direct Attack */}
                <div
                  onClick={() => handleToggleVibOption('direct', vibDirect, setVibDirect)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'var(--pharaoh-stone-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>
                    اهتزاز شديد عند الهجوم المباشر على نقاط الحياة
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: vibDirect ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)' }}>
                    {vibDirect ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                {/* Case 4: Trap Activated */}
                <div
                  onClick={() => handleToggleVibOption('trap', vibTrap, setVibTrap)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'var(--pharaoh-stone-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>
                    اهتزاز مفاجئ عند تفعيل أوراق الفخاخ
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: vibTrap ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)' }}>
                    {vibTrap ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                {/* Case 5: Game Over */}
                <div
                  onClick={() => handleToggleVibOption('gameover', vibGameOver, setVibGameOver)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'var(--pharaoh-stone-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>
                    اهتزاز حاسم عند نهاية النزال بالفوز أو الخسارة
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: vibGameOver ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-muted)' }}>
                    {vibGameOver ? 'مفعل' : 'معطل'}
                  </span>
                </div>

                {/* Test Vibration Button */}
                <button
                  onClick={handleTestVibrate}
                  className="btn-pharaoh-stone"
                  style={{ marginTop: 4, padding: '7px 0', fontSize: 11 }}
                >
                  {vibrateTested ? 'تم تشغيل الاهتزاز بنجاح' : 'تجربة الاهتزاز الآن'}
                </button>
              </div>
            )}
          </div>

          {/* SECTION: CARD INTERACTION & MOBILE UX (تجربة تحكم وأوامر البطاقات) */}
          <div
            className="settings-section-card"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 16, 12, 0.95), rgba(30, 22, 14, 0.95))',
              border: '1.5px solid rgba(212, 175, 55, 0.55)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', paddingBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  تفاعل وأوامر البطاقات (تحكم الموبايل السريع)
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)', marginTop: 2 }}>
                  تخصيص شكل أزرار الأوامر والاستدعاء السريع بلمسة واحدة
                </div>
              </div>
            </div>

            {/* Menu Display Style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pharaoh-text-gold)' }}>
                نمط أزرار تحكم البطاقة المحددة
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button
                  onClick={() => handleSelectCardMenuStyle('compact')}
                  className={cardMenuStyle === 'compact' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{ padding: '8px 6px', fontSize: 11, fontWeight: 800 }}
                  title="كبسولات عائمة مدمجة تظهر فوق البطاقة مع أيقونة ونص"
                >
                  كبسولات مدمجة
                </button>
                <button
                  onClick={() => handleSelectCardMenuStyle('icons_only')}
                  className={cardMenuStyle === 'icons_only' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{ padding: '8px 6px', fontSize: 11, fontWeight: 800 }}
                  title="أيقونات فقط مصغرة وأنيقة جداً للمبارزة السريعة"
                >
                  أيقونات فقط
                </button>
                <button
                  onClick={() => handleSelectCardMenuStyle('classic')}
                  className={cardMenuStyle === 'classic' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{ padding: '8px 6px', fontSize: 11, fontWeight: 800 }}
                  title="الشريط الكلاسيكي المستطيل أسفل الشاشة"
                >
                  شريط كلاسيكي
                </button>
              </div>
            </div>

            {/* Quick Summon by Double-Tap */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 4 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pharaoh-text-gold)' }}>
                  الاستدعاء السريع بالضغط المزدوج
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                  النقر مرتين على البطاقة يستدعي الوحش أو يفعل السحر فوراً
                </div>
              </div>
              <button
                onClick={handleToggleQuickSummon}
                className={quickSummonEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{ padding: '6px 14px', fontSize: 11.5, fontWeight: 800 }}
              >
                {quickSummonEnabled ? 'مفعل' : 'معطل'}
              </button>
            </div>

            {/* Quick Summon Default Position */}
            {quickSummonEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--pharaoh-text-gold)' }}>
                  الوضعية الافتراضية للاستدعاء السريع للوحوش
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <button
                    onClick={() => handleSelectQuickSummonPos('face_up_attack')}
                    className={quickSummonPos === 'face_up_attack' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ padding: '7px 8px', fontSize: 11, fontWeight: 800 }}
                  >
                    وضع الهجوم المكشوف
                  </button>
                  <button
                    onClick={() => handleSelectQuickSummonPos('face_down_defense')}
                    className={quickSummonPos === 'face_down_defense' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ padding: '7px 8px', fontSize: 11, fontWeight: 800 }}
                  >
                    وضع الدفاع المقلوب
                  </button>
                </div>
              </div>
            )}

            {/* Long-Press Inspect Hint */}
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--pharaoh-text-muted)',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px dashed rgba(212, 175, 55, 0.3)',
                lineHeight: 1.4,
              }}
            >
              معلومة سريعة: يمكنك الضغط باستمرار (لمس مطول) على أي بطاقة في يدك لمعاينتها وقراءة تفاصيلها فوراً.
            </div>
          </div>

          {/* SECTION 6: DISPLAY & THEME & AI */}
          {/* Theme */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
              مظهر وشكل اللعبة
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)' }}>
                النمط الحالي: {theme === 'light' ? 'فاتح نهاري بردي' : 'غامق ليلي فخم'}
              </div>
              <button
                onClick={() => {
                  onToggleTheme();
                  hapticManager.triggerCombatVibration('click');
                }}
                className="btn-pharaoh-gold"
                style={{ padding: '6px 14px', fontSize: 12, fontWeight: 800 }}
              >
                {theme === 'light' ? 'تحويل إلى غامق ليلي' : 'تحويل إلى فاتح نهاري'}
              </button>
            </div>
          </div>

          {/* SECTION: DUEL BATTLE ARENAS (حلبات وساحات القتال المتنوعة) */}
          <div
            className="settings-section-card"
            style={{
              background: 'linear-gradient(135deg, rgba(22, 16, 10, 0.96), rgba(34, 24, 12, 0.96))',
              border: '1.5px solid rgba(212, 175, 55, 0.55)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArenaPillarIcon size={18} color="var(--pharaoh-gold-bright)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    حلبة القتال وساحة المعركة
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                    اختر ساحة النزال المفضلة أو اجعلها عشوائية متنوعة في كل مواجهة
                  </div>
                </div>
              </div>
            </div>

            {/* Live Selected Arena Showcase Card (معاينة حية فورية للساحة المختارة) */}
            <div
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                border: `2px solid ${activeSelectedArenaObj.borderGlow || 'var(--pharaoh-gold-bright)'}`,
                boxShadow: `0 0 20px ${activeSelectedArenaObj.auraGlow || 'rgba(245, 158, 11, 0.4)'}, inset 0 0 30px rgba(0,0,0,0.85)`,
                background: '#0c0906',
                minHeight: 145,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Background Art */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("${activeSelectedBg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.92) contrast(1.05)',
                  transition: 'background-image 0.28s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(8, 6, 4, 0.78) 0%, rgba(8, 6, 4, 0.2) 45%, rgba(8, 6, 4, 0.95) 100%)',
                }}
              />

              {/* Top Banner Row */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: `1px solid ${activeSelectedArenaObj.borderGlow || 'var(--pharaoh-gold-bright)'}`,
                    color: activeSelectedArenaObj.borderGlow || 'var(--pharaoh-gold-bright)',
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: activeSelectedArenaObj.borderGlow || '#facc15',
                      boxShadow: `0 0 8px ${activeSelectedArenaObj.borderGlow || '#facc15'}`,
                    }}
                  />
                  <span>المعاينة الحية: الساحة المختارة</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFullscreenPreviewArena(activeSelectedArenaObj);
                    soundManager.playClick();
                  }}
                  className="btn-pharaoh-stone"
                  style={{
                    padding: '4px 10px',
                    fontSize: 10.5,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(12, 9, 6, 0.85)',
                    border: `1px solid ${activeSelectedArenaObj.borderGlow || 'var(--pharaoh-gold-bright)'}`,
                    color: 'var(--pharaoh-gold-bright)',
                  }}
                  title="عرض الخلفية بكامل أبعاد الشاشة للمعاينة الدقيقة"
                >
                  <EyeInspectIcon size={13} color="var(--pharaoh-gold-bright)" />
                  <span>معاينة مكبرة كاملة</span>
                </button>
              </div>

              {/* Bottom Info Row */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: `0 0 10px ${activeSelectedArenaObj.borderGlow || '#facc15'}, 0 2px 4px rgba(0,0,0,0.9)`,
                    }}
                  >
                    {activeSelectedArenaObj.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: activeSelectedArenaObj.borderGlow || '#facc15',
                    }}
                  >
                    {activeSelectedArenaObj.tagline}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 10.5,
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.35,
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  }}
                >
                  {activeSelectedArenaObj.description}
                </div>
              </div>
            </div>

            {/* 1. Multiplayer Background Synchronization Control (التحكم في توحيد الخلفية عند الاثنين أو استقلالها) */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <NetworkSyncIcon size={16} color="var(--pharaoh-gold-bright)" />
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    مزامنة الخلفية بين الطرفين (أونلاين)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: arenaSyncMode === 'synced' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(56, 189, 248, 0.18)',
                    color: arenaSyncMode === 'synced' ? '#4ade80' : '#7dd3fc',
                    border: `1px solid ${arenaSyncMode === 'synced' ? 'rgba(34, 197, 94, 0.45)' : 'rgba(56, 189, 248, 0.45)'}`,
                  }}
                >
                  {arenaSyncMode === 'synced' ? 'موحدة عند الاثنين' : 'مستقلة لكل لاعب'}
                </span>
              </div>

              <div style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.45 }}>
                هل يلزم أن تكون خلفية ساحة القتال متطابقة وموحدة عند كلا اللاعبين أثناء المواجهة أونلاين، أم يحتفظ كل لاعب بخلفيته المفضلة الخاصة دون التأثر بالخصم؟
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {/* Option 1: Synced */}
                <button
                  type="button"
                  onClick={() => handleSelectArenaSyncMode('synced')}
                  className={arenaSyncMode === 'synced' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '9px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    textAlign: 'center',
                    borderRadius: 6,
                    border: arenaSyncMode === 'synced' ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                  title="تطابق الخلفية 100% بين الطرفين في النزال عبر الشبكة"
                >
                  <span style={{ fontSize: 11, fontWeight: 900 }}>
                    موحدة ومتزامنة عند الاثنين
                  </span>
                  <span style={{ fontSize: 9.5, opacity: 0.85, fontWeight: 700, lineHeight: 1.3 }}>
                    (موصى به) تطابق 100% بين الشاشتين
                  </span>
                </button>

                {/* Option 2: Independent */}
                <button
                  type="button"
                  onClick={() => handleSelectArenaSyncMode('independent')}
                  className={arenaSyncMode === 'independent' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '9px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    textAlign: 'center',
                    borderRadius: 6,
                    border: arenaSyncMode === 'independent' ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                  title="كل لاعب يرى ساحته المفضلة دون فرضها على شاشة الخصم"
                >
                  <span style={{ fontSize: 11, fontWeight: 900 }}>
                    مستقلة لكل لاعب
                  </span>
                  <span style={{ fontSize: 9.5, opacity: 0.85, fontWeight: 700, lineHeight: 1.3 }}>
                    حرية الاختيار دون التأثر بساحة الخصم
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Dynamic Combat Arena Transition Control (التحكم في التغيير التلقائي حسب ظروف القتال) */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <LightningIcon size={16} color="var(--pharaoh-gold-bright)" />
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    التغيير التلقائي للخلفية حسب ظروف القتال
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background:
                      dynamicArenaMode === 'full_dynamic'
                        ? 'rgba(239, 68, 68, 0.18)'
                        : dynamicArenaMode === 'climax_only'
                        ? 'rgba(234, 179, 8, 0.18)'
                        : 'rgba(148, 163, 184, 0.18)',
                    color:
                      dynamicArenaMode === 'full_dynamic'
                        ? '#fca5a5'
                        : dynamicArenaMode === 'climax_only'
                        ? '#fde047'
                        : '#cbd5e1',
                    border: `1px solid ${
                      dynamicArenaMode === 'full_dynamic'
                        ? 'rgba(239, 68, 68, 0.45)'
                        : dynamicArenaMode === 'climax_only'
                        ? 'rgba(234, 179, 8, 0.45)'
                        : 'rgba(148, 163, 184, 0.45)'
                    }`,
                  }}
                >
                  {dynamicArenaMode === 'full_dynamic'
                    ? 'تفاعلية كاملة مع الأحداث'
                    : dynamicArenaMode === 'climax_only'
                    ? 'عند نقاط الحسم فقط'
                    : 'ثابتة بدون تغيير'}
                </span>
              </div>

              <div style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.45 }}>
                التحكم فيما إذا كانت الساحة تتحول سينمائياً وتلقائياً أثناء مجريات النزال، أو تظل ثابتة ومستقرة:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                {/* Mode 1: manual_only */}
                <button
                  type="button"
                  onClick={() => handleSelectDynamicArenaMode('manual_only')}
                  className={dynamicArenaMode === 'manual_only' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '9px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    textAlign: 'center',
                    borderRadius: 6,
                    border: dynamicArenaMode === 'manual_only' ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                  title="الخلفية مستقرة تماماً ولا تتغير تلقائياً طوال النزال (التبديل يدوي فقط)"
                >
                  <span style={{ fontSize: 10.5, fontWeight: 900 }}>
                    ثابتة طوال القتال
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.82, fontWeight: 700, lineHeight: 1.25 }}>
                    بدون تغيير تلقائي
                  </span>
                </button>

                {/* Mode 2: climax_only */}
                <button
                  type="button"
                  onClick={() => handleSelectDynamicArenaMode('climax_only')}
                  className={dynamicArenaMode === 'climax_only' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '9px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    textAlign: 'center',
                    borderRadius: 6,
                    border: dynamicArenaMode === 'climax_only' ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                  title="تتحول الساحة إلى ساحة حسم ملحمية فور انخفاض نقاط الحياة لمرحلة الخطر"
                >
                  <span style={{ fontSize: 10.5, fontWeight: 900 }}>
                    عند نقاط الحسم فقط
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.82, fontWeight: 700, lineHeight: 1.25 }}>
                    عند انخفاض نقاط LP
                  </span>
                </button>

                {/* Mode 3: full_dynamic */}
                <button
                  type="button"
                  onClick={() => handleSelectDynamicArenaMode('full_dynamic')}
                  className={dynamicArenaMode === 'full_dynamic' ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                  style={{
                    padding: '9px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    textAlign: 'center',
                    borderRadius: 6,
                    border: dynamicArenaMode === 'full_dynamic' ? '1.5px solid var(--pharaoh-gold-bright)' : '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                  title="تتحول الساحة مع استدعاء الوحوش الأسطورية (Gods/Bosses) ومراحل الحسم الحرجة"
                >
                  <span style={{ fontSize: 10.5, fontWeight: 900 }}>
                    تفاعلية مع أحداث القتال
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.82, fontWeight: 700, lineHeight: 1.25 }}>
                    وحوش أسطورية + حسم
                  </span>
                </button>
              </div>

              {/* Quick Dimension Warp Test Ceremony */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playArenaWarp();
                    hapticManager.triggerCombatVibration('powerSummon');
                    const otherArenas = ARENA_THEMES.filter((a) => a.id !== arenaTheme && a.id !== 'random');
                    if (otherArenas.length > 0) {
                      const rand = otherArenas[Math.floor(Math.random() * otherArenas.length)];
                      handleSelectArena(rand.id);
                    }
                  }}
                  className="btn-pharaoh-stone"
                  style={{
                    padding: '4px 10px',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--pharaoh-gold-bright)',
                    background: 'rgba(20, 16, 10, 0.85)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: 5,
                    cursor: 'pointer',
                  }}
                  title="تجربة تأثير التحول البعدي للساحة"
                >
                  <LightningIcon size={12} color="var(--pharaoh-gold-bright)" />
                  <span>تجربة تبديل الساحة الآن (مؤثر بعدي)</span>
                </button>
              </div>
            </div>

            {/* Horizontal Side-Scroll Visual Gallery of Arenas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    اختر مظهر الساحة بالصورة مباشرة:
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.65)' }}>
                    ({ARENA_THEMES.length} ساحات فريدة بدون تكرار)
                  </span>
                </div>

                {/* Left / Right Quick Scroll Arrows */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => scrollArenaHorizontal('right')}
                    className="btn-icon-pharaoh"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(18, 14, 9, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: 'var(--pharaoh-gold-bright)',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                    title="تمرير لليمين"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollArenaHorizontal('left')}
                    className="btn-icon-pharaoh"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(18, 14, 9, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: 'var(--pharaoh-gold-bright)',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                    title="تمرير لليسار"
                  >
                    ◀
                  </button>
                </div>
              </div>

              {/* Side-Scrollable Track */}
              <div
                ref={arenaScrollRef}
                className="arena-horizontal-scroll"
              >
                {ARENA_THEMES.map((arena) => {
                  const isSelected = arenaTheme === arena.id;
                  const bgSrc = resolveArenaBgImage(arena, theme);
                  return (
                    <button
                      key={arena.id}
                      type="button"
                      onClick={() => handleSelectArena(arena.id)}
                      className={`arena-horizontal-card ${isSelected ? 'selected' : ''}`}
                      title={`انقر لاختيار: ${arena.name}`}
                    >
                      {/* Full-bleed visual preview image */}
                      <img
                        src={bgSrc}
                        alt={arena.name}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: isSelected
                            ? 'brightness(1.08) contrast(1.04)'
                            : (theme === 'light' ? 'brightness(0.92)' : 'brightness(0.78) contrast(0.95)'),
                          transition: 'filter 0.2s ease',
                        }}
                      />

                      {/* Gradient overlay for readability */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 35%, rgba(8,6,4,0.95) 100%)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Active State Badge */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            background: 'var(--pharaoh-gold-bright)',
                            color: '#1a1105',
                            fontSize: 9,
                            fontWeight: 900,
                            padding: '1px 6px',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.9)',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <span>✓</span>
                          <span>مفعلة</span>
                        </div>
                      )}

                      {/* Fullscreen Inspection Button */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenPreviewArena(arena);
                          soundManager.playClick();
                        }}
                        style={{
                          position: 'absolute',
                          top: 5,
                          left: 5,
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: 'rgba(0, 0, 0, 0.78)',
                          border: '1px solid rgba(212, 175, 55, 0.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--pharaoh-gold-bright)',
                          cursor: 'pointer',
                          zIndex: 3,
                        }}
                        title="معاينة هذه الساحة بكامل الشاشة"
                      >
                        <EyeInspectIcon size={12} color="var(--pharaoh-gold-bright)" />
                      </span>

                      {/* Random Badge if applicable */}
                      {arena.id === 'random' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '35%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(10, 7, 4, 0.88)',
                            border: '1px solid var(--pharaoh-gold-bright)',
                            borderRadius: 12,
                            padding: '2px 8px',
                            color: 'var(--pharaoh-gold-bright)',
                            fontSize: 10,
                            fontWeight: 900,
                            zIndex: 2,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          اختيار مفاجئ
                        </div>
                      )}

                      {/* Title & Tagline Label at Bottom */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '5px 7px',
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          textAlign: 'right',
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 900,
                            color: isSelected ? 'var(--pharaoh-gold-bright)' : '#ffffff',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textShadow: '0 1px 3px rgba(0,0,0,0.95)',
                          }}
                        >
                          {arena.name}
                        </div>
                        <div
                          style={{
                            fontSize: 8.5,
                            color: isSelected ? '#fde047' : 'rgba(255, 255, 255, 0.75)',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {arena.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                fontSize: 10,
                color: 'var(--pharaoh-text-muted)',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px dashed rgba(212, 175, 55, 0.25)',
                lineHeight: 1.4,
              }}
            >
              ملاحظة: عند تفعيل بطاقة سحر ساحة (مثل يامي، أومي، الغابة، الجبال)، تتحول الحلبة فوراً لطاقة تلك البطاقة لتعيش أجواء مبارزات يوغي أوه الأصلية!
            </div>
          </div>

          {/* AI Difficulty */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 6 }}>
              مستوى ذكاء وخطط الكمبيوتر
            </div>
            <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              يتحكم في قوة خطط الخصم، التضحية بالوحوش، وهجمات القضاء السريع.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {Object.values(AI_DIFFICULTIES).map((d) => {
                const isActive = aiDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      if (onSelectAiDifficulty) onSelectAiDifficulty(d.id);
                      hapticManager.triggerCombatVibration('click');
                      soundManager.playClick();
                    }}
                    className={isActive ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{
                      padding: '8px 10px',
                      fontSize: 11.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      cursor: 'pointer',
                      border: isActive ? '2px solid var(--pharaoh-gold-bright)' : undefined,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{d.shortName}</div>
                    <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 800 }}>مستوى {d.stars}</div>
                    <div style={{ fontSize: 9.5, opacity: 0.75 }}>{d.character}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fullscreen Display */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', display: 'flex', alignItems: 'center', gap: 7 }}>
                {isFullscreen ? <MinimizeIcon size={16} color="var(--pharaoh-gold-bright)" /> : <MaximizeIcon size={16} color="var(--pharaoh-gold-bright)" />}
                <span>وضع ملء الشاشة الكامل</span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10.5,
                  color: isFullscreen ? '#4ade80' : 'var(--pharaoh-text-muted)',
                  fontWeight: 800,
                  background: isFullscreen ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 9px',
                  borderRadius: 12,
                  border: `1px solid ${isFullscreen ? 'rgba(34, 197, 94, 0.4)' : 'transparent'}`,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isFullscreen ? '#22c55e' : '#9ca3af' }} />
                {isFullscreen ? 'ملء الشاشة مفعل' : 'الوضع العادي'}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              عرض ساحة المعركة على كامل الشاشة لتجربة لعب غامرة.
            </div>

            <button
              onClick={handleToggleFullscreen}
              className={isFullscreen ? 'btn-pharaoh-stone' : 'btn-pharaoh-gold duel-btn-shine-wrap'}
              style={{
                width: '100%',
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {!isFullscreen && <span className="duel-btn-shine-sheen" />}
              {isFullscreen ? (
                <>
                  <MinimizeIcon size={16} />
                  <span>العودة للوضع العادي</span>
                </>
              ) : (
                <>
                  <MaximizeIcon size={16} />
                  <span>تفعيل ملء الشاشة</span>
                </>
              )}
            </button>
          </div>

          {/* SECTION 7: APK DOWNLOAD */}
          <div
            className="settings-section-card"
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(20, 16, 10, 0.95), rgba(35, 26, 12, 0.95))',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                نسخة الموبايل (APK أندرويد)
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--pharaoh-text-muted)' }}>
                نسخة كاملة تعمل دون إنترنت مع كافة المؤثرات والأصوات
              </span>
            </div>

            <a
              href="/YuGiOh-Mobile.apk"
              download="YuGiOh-Mobile.apk"
              onClick={() => soundManager.playDecide()}
              className="btn-pharaoh-gold"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 900,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              تحميل ملف APK
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--pharaoh-stone-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--pharaoh-stone-card)',
          }}
        >
          <button
            onClick={onClose}
            className="btn-pharaoh-gold"
            style={{ padding: '8px 24px', fontSize: 13, fontWeight: 900 }}
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>

      {/* Fullscreen Battle Arena Preview Inspector */}
      {fullscreenPreviewArena && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#050302',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.78) 100%), url("${resolveArenaBgImage(fullscreenPreviewArena, theme)}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            animation: 'arenaOverlayFade 0.22s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: 'linear-gradient(180deg, rgba(6, 4, 2, 0.94) 0%, rgba(6, 4, 2, 0) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: fullscreenPreviewArena.borderGlow || '#facc15',
                  boxShadow: `0 0 12px ${fullscreenPreviewArena.borderGlow || '#facc15'}`,
                }}
              />
              <div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                  {fullscreenPreviewArena.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: fullscreenPreviewArena.borderGlow || '#facc15' }}>
                  {fullscreenPreviewArena.tagline}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFullscreenPreviewArena(null);
                soundManager.playClick();
              }}
              className="btn-pharaoh-stone"
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 900,
                background: 'rgba(0,0,0,0.8)',
                border: '1.5px solid var(--pharaoh-gold-bright)',
                color: 'var(--pharaoh-gold-bright)',
                cursor: 'pointer',
              }}
            >
              إغلاق المعاينة
            </button>
          </div>


          {/* Bottom Bar Controls */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(0deg, rgba(6, 4, 2, 0.96) 0%, rgba(6, 4, 2, 0.85) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                color: 'var(--pharaoh-text-light)',
                fontSize: 12.5,
                textAlign: 'center',
                maxWidth: 620,
                lineHeight: 1.5,
                textShadow: '0 1px 4px rgba(0,0,0,0.95)',
              }}
            >
              {fullscreenPreviewArena.description}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%', maxWidth: 540 }}>
              <button
                onClick={handlePrevArenaPreview}
                className="btn-pharaoh-stone"
                style={{ padding: '9px 18px', fontSize: 12, fontWeight: 900, minWidth: 95 }}
              >
                الساحة السابقة
              </button>

              <button
                onClick={() => {
                  handleSelectArena(fullscreenPreviewArena.id);
                }}
                className={arenaTheme === fullscreenPreviewArena.id ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{
                  padding: '10px 24px',
                  fontSize: 13,
                  fontWeight: 900,
                  flex: 1,
                  boxShadow: arenaTheme === fullscreenPreviewArena.id ? '0 0 18px rgba(245, 158, 11, 0.65)' : 'none',
                }}
              >
                {arenaTheme === fullscreenPreviewArena.id ? 'الساحة مفعلة حالياً للقتال' : 'اختيار وتفعيل هذه الساحة'}
              </button>

              <button
                onClick={handleNextArenaPreview}
                className="btn-pharaoh-stone"
                style={{ padding: '9px 18px', fontSize: 12, fontWeight: 900, minWidth: 95 }}
              >
                الساحة التالية
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
