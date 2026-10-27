/**
 * SoundManager.js
 * Comprehensive audio management system for Yu-Gi-Oh! Mobile Edition.
 * Uses original Yu-Gi-Oh! game sound effects with synthesized Web Audio API fallbacks.
 * 100% offline, zero external dependencies.
 */

export const BGM_TRACKS = [
  {
    id: 'hazim_al_raad',
    name: 'هزيم الرعد',
    title: 'هزيم الرعد',
    subtitle: 'أبطالاً وعدوكِ أنبل وعد',
    artist: 'شارة سبيستون الأسطورية',
    path: '/songs/hazim_al_raad.mp3',
    url: '/songs/hazim_al_raad.mp3',
    theme: 'epic',
    intensity: 'climax', // Epic intense battle theme for critical / danger LP
  },
  {
    id: 'gundam_wing',
    name: 'أجنحة كاندام',
    title: 'أجنحة كاندام',
    subtitle: 'صوت الحق يظل الأقوى',
    artist: 'شارة سبيستون الخالدة',
    path: '/songs/gundam_wing.mp3',
    url: '/songs/gundam_wing.mp3',
    theme: 'action',
    intensity: 'climax', // Epic action theme for critical / danger LP
  },
  {
    id: 'palestine_victory',
    name: 'حبيبتي فلسطين',
    title: 'حبيبتي فلسطين',
    subtitle: 'أغنيات الانتصار',
    artist: 'أغنيات الصمود والعزة',
    path: '/songs/palestine_victory.mp3',
    url: '/songs/palestine_victory.mp3',
    theme: 'heroic',
    intensity: 'heroic', // Mid duel
  },
  {
    id: 'dawhat_al_aman',
    name: 'دوحة الأمان',
    title: 'دوحة الأمان',
    subtitle: 'قل إن الظلم لن يدوم',
    artist: 'روائع سبيستون الشجية',
    path: '/songs/dawhat_al_aman.mp3',
    url: '/songs/dawhat_al_aman.mp3',
    theme: 'mystic',
    intensity: 'mystic', // Early duel / balanced
  },
];

export const EQ_PRESETS = {
  epic: {
    id: 'epic',
    name: 'حماسي ملحمي (Epic Duel)',
    arabicDesc: 'طبول بيز قوية ونقاء غنائي مخصص للنزالات',
    bass: 7.0,
    mid: 3.5,
    treble: 4.0,
  },
  bass: {
    id: 'bass',
    name: 'تضخيم البيز (Bass Boost)',
    arabicDesc: 'ضربات بيز عميقة ومضخمة للشارات الحماسية',
    bass: 9.5,
    mid: 1.5,
    treble: 2.0,
  },
  vocal: {
    id: 'vocal',
    name: 'نقاء الصوت (Vocal Focus)',
    arabicDesc: 'تركيز فائق على كلمات وصوت الأغاني',
    bass: 2.0,
    mid: 6.5,
    treble: 4.0,
  },
  studio: {
    id: 'studio',
    name: 'استوديو نقي (Studio Flat)',
    arabicDesc: 'الصوت الأصلي المتوازن دون تعديل ترددات',
    bass: 0.0,
    mid: 0.0,
    treble: 0.0,
  },
};

export const PREAMP_BOOST_LEVELS = [
  { id: 'boosted', level: 2.5, label: 'مضخم (2.5x)', desc: 'صوت مضاعف عالي وقوي' },
  { id: 'super', level: 4.0, label: 'تضخيم فائق (4.0x)', desc: 'صوت أعلى بكتير من الطبيعي (الافتراضي)' },
  { id: 'max', level: 6.0, label: 'تضخيم خارق جبار (6.0x)', desc: 'أقصى قوة صوتية مع مانع التشويش' },
];

export const OST_TRACKS = [
  {
    id: 'duel_action',
    title: 'موسيقى النزال الحماسية (Duel OST)',
    path: '/assets/audio/duel_bgm.wav',
  },
  {
    id: 'duel_classic',
    title: 'موسيقى النزال الكلاسيكية (Classic OST)',
    path: '/assets/audio/duel_classic_ost.wav',
  },
];

export const CLIMAX_TRIGGER_OPTIONS = [
  { value: 4800, label: 'عند 4800 نقطة حياة أو أقل (الافتراضي)' },
  { value: 3500, label: 'عند 3500 نقطة حياة (حرج)' },
  { value: 2500, label: 'عند 2500 نقطة حياة (شديد الخطورة)' },
  { value: 8000, label: 'من بداية النزال مباشرة' },
];

export const PLAYBACK_MODES = [
  { id: 'shuffle', label: 'عشوائي', desc: 'تبديل عشوائي بين الأغاني' },
  { id: 'loop_all', label: 'بالترتيب', desc: 'تشغيل القائمة بالتسلسل' },
  { id: 'loop_one', label: 'تكرار الأغنية', desc: 'تكرار نفس الأغنية الحالية' },
];

class SoundController {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    this.muted = hasStorage ? localStorage.getItem('yugioh_sound_muted') === 'true' : false;
    this.volume = parseFloat((hasStorage ? localStorage.getItem('yugioh_volume') : null) || '0.8');
    this.sfxEnabled = hasStorage ? localStorage.getItem('yugioh_sfx_enabled') !== 'false' : true;

    // Background Duel Music (الموسيقى الخلفية)
    this.musicEnabled = hasStorage ? localStorage.getItem('yugioh_music_enabled') !== 'false' : true;
    this.musicVolume = parseFloat((hasStorage ? localStorage.getItem('yugioh_music_volume') : null) || '0.75');
    this.currentOstIndex = parseInt((hasStorage ? localStorage.getItem('yugioh_ost_track_idx') : null) || '0', 10);
    if (isNaN(this.currentOstIndex) || this.currentOstIndex < 0 || this.currentOstIndex >= OST_TRACKS.length) {
      this.currentOstIndex = 0;
    }
    this.musicAudio = null;
    this.isDucked = false;

    // Climax Theme Songs (الأغاني وشارات الحماس)
    this.songsEnabled = hasStorage ? localStorage.getItem('yugioh_songs_enabled') !== 'false' : true;
    this.bgmVolume = parseFloat((hasStorage ? localStorage.getItem('yugioh_bgm_volume') : null) || '1.0');
    this.bgmEnabled = this.songsEnabled;
    const savedBoost = hasStorage ? localStorage.getItem('yugioh_preamp_boost') : null;
    this.preampBoost = savedBoost ? parseFloat(savedBoost) : 4.0;
    if (!savedBoost || this.preampBoost < 2.5) {
      this.preampBoost = 4.0; // Elevate default to 4.0x
      if (hasStorage) localStorage.setItem('yugioh_preamp_boost', '4.0');
    }
    this.eqPreset = (hasStorage ? localStorage.getItem('yugioh_eq_preset') : null) || 'epic';
    this.playbackMode = (hasStorage ? localStorage.getItem('yugioh_playback_mode') : null) || 'shuffle';
    const savedTrigger = hasStorage ? localStorage.getItem('yugioh_climax_trigger_lp') : null;
    this.climaxTriggerLp = savedTrigger ? parseInt(savedTrigger, 10) : 4800;
    if (!savedTrigger || this.climaxTriggerLp === 3500 || this.climaxTriggerLp === 2500) {
      this.climaxTriggerLp = 4800; // Elevate default to 4800 LP
      if (hasStorage) localStorage.setItem('yugioh_climax_trigger_lp', '4800');
    }
    this.songsStarted = false;

    this.audioPool = {};
    this.bgmAudio = null;
    this.audioCtx = null;
    this.bgmGraphConnected = false;
    this.bgmSourceNode = null;
    this.bgmGainNode = null;
    this.bgmPostGain = null;
    this.bgmBassFilter = null;
    this.bgmMidFilter = null;
    this.bgmTrebleFilter = null;
    this.bgmCompressor = null;
    this.lastMoodTrigger = null;
    this.userLockedUntil = 0;

    this.currentBgmIndex = parseInt((hasStorage ? localStorage.getItem('yugioh_bgm_track_idx') : null) || '0', 10);
    if (isNaN(this.currentBgmIndex) || this.currentBgmIndex < 0 || this.currentBgmIndex >= BGM_TRACKS.length) {
      this.currentBgmIndex = 0;
    }
    this.bgmListeners = new Set();

    this.soundPaths = {
      click: '/assets/audio/cursor.wav',
      decide: '/assets/audio/decide.wav',
      cardMove: '/assets/audio/card_move.wav',
      cardOpen: '/assets/audio/card_open.wav',
      summon: '/assets/audio/m_sum.wav',
      reborn: '/assets/audio/reborn.wav',
      attack: '/assets/audio/attack.wav',
      damage: '/assets/audio/damage.wav',
      destroy: '/assets/audio/card_attacked_brake.wav',
      magic: '/assets/audio/magic_active.wav',
      lifeUp: '/assets/audio/life_up.wav',
      turnChange: '/assets/audio/turn_change.wav',
      battleTurn: '/assets/audio/battle_turn.wav',
      coin: '/assets/audio/coin.wav',
      start: '/assets/audio/start.wav',
      win: '/assets/audio/m_win.wav',
      lose: '/assets/audio/m_lose.wav',
      janken: '/assets/audio/m_jyank.wav',
    };
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(val) {
    this.muted = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_sound_muted', this.muted ? 'true' : 'false');
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), this.audioCtx.currentTime);
      } catch (e) {}
    }
    if (this.muted && this.bgmAudio) {
      this.bgmAudio.pause();
    } else if (!this.muted && this.bgmAudio && this.bgmEnabled) {
      this.bgmAudio.play().catch(() => {});
    }
    this.notifyBgmListeners();
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  getVolume() {
    return this.volume;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_volume', this.volume.toString());
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), this.audioCtx.currentTime);
      } catch (e) {}
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = 1.0;
    }
    this.notifyBgmListeners();
  }

  isSfxEnabled() {
    return this.sfxEnabled;
  }

  setSfxEnabled(val) {
    this.sfxEnabled = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_sfx_enabled', this.sfxEnabled ? 'true' : 'false');
    }
  }

  isBgmEnabled() {
    return this.bgmEnabled;
  }

  setBgmEnabled(val) {
    this.bgmEnabled = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_bgm_enabled', this.bgmEnabled ? 'true' : 'false');
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), this.audioCtx.currentTime);
      } catch (e) {}
    }
    if (!this.bgmEnabled && this.bgmAudio) {
      this.bgmAudio.pause();
    } else if (this.bgmEnabled && !this.muted) {
      this.playDuelBgm();
    }
    this.notifyBgmListeners();
  }

  getCurrentBgmTrack() {
    return BGM_TRACKS[this.currentBgmIndex];
  }

  getCurrentBgmIndex() {
    return this.currentBgmIndex;
  }

  isBgmPlaying() {
    return !!(this.bgmAudio && !this.bgmAudio.paused && !this.bgmAudio.ended);
  }

  // ==========================================
  // 1. Background Duel Music (الموسيقى الخلفية)
  // ==========================================

  initMusicAudio() {
    if (this.musicAudio) return this.musicAudio;
    this.musicAudio = new Audio();
    this.musicAudio.preload = 'auto';
    this.musicAudio.loop = true;
    const ost = OST_TRACKS[this.currentOstIndex] || OST_TRACKS[0];
    this.musicAudio.src = ost.path;
    this.musicAudio.volume = this.getEffectiveMusicVolume();
    return this.musicAudio;
  }

  getEffectiveMusicVolume() {
    if (this.muted || !this.musicEnabled) return 0;
    const base = this.volume * this.musicVolume;
    // When songs start playing, duck background music volume down by 88% so songs roar over it!
    return Math.max(0, Math.min(1, this.isDucked ? base * 0.12 : base));
  }

  startDuelMusic() {
    this.initMusicAudio();
    const ost = OST_TRACKS[this.currentOstIndex] || OST_TRACKS[0];
    this.musicAudio.src = ost.path;
    this.musicAudio.volume = this.getEffectiveMusicVolume();
    if (this.musicEnabled && !this.muted) {
      this.musicAudio.play().catch(() => {});
    }
    this.notifyBgmListeners();
  }

  stopDuelMusic() {
    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
      } catch (e) {}
    }
    this.notifyBgmListeners();
  }

  setMusicEnabled(val) {
    this.musicEnabled = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_music_enabled', this.musicEnabled ? 'true' : 'false');
    }
    if (this.musicAudio) {
      if (this.musicEnabled && !this.muted) {
        this.musicAudio.volume = this.getEffectiveMusicVolume();
        this.musicAudio.play().catch(() => {});
      } else {
        this.musicAudio.pause();
      }
    }
    this.notifyBgmListeners();
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_music_volume', this.musicVolume.toString());
    }
    if (this.musicAudio) {
      this.musicAudio.volume = this.getEffectiveMusicVolume();
    }
    this.notifyBgmListeners();
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  setOstTrack(index) {
    if (index < 0 || index >= OST_TRACKS.length) return;
    this.currentOstIndex = index;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_ost_track_idx', this.currentOstIndex.toString());
    }
    this.initMusicAudio();
    const wasPlaying = !this.musicAudio.paused;
    this.musicAudio.src = OST_TRACKS[this.currentOstIndex].path;
    this.musicAudio.volume = this.getEffectiveMusicVolume();
    if (wasPlaying && this.musicEnabled && !this.muted) {
      this.musicAudio.play().catch(() => {});
    }
    this.notifyBgmListeners();
  }

  duckMusic(shouldDuck) {
    this.isDucked = !!shouldDuck;
    if (this.musicAudio) {
      this.musicAudio.volume = this.getEffectiveMusicVolume();
    }
    this.notifyBgmListeners();
  }

  // ==========================================
  // 2. Climax Theme Songs (الأغاني وشارات الحماس)
  // ==========================================

  isBgmPlaying() {
    return !!(this.bgmAudio && !this.bgmAudio.paused && !this.bgmAudio.ended);
  }

  getBgmState() {
    return {
      // Background Music (الموسيقى)
      musicEnabled: this.musicEnabled,
      musicVolume: this.musicVolume,
      currentOstIndex: this.currentOstIndex,
      currentOst: OST_TRACKS[this.currentOstIndex] || OST_TRACKS[0],
      ostTracks: OST_TRACKS,
      isMusicPlaying: !!(this.musicAudio && !this.musicAudio.paused),
      isDucked: this.isDucked,

      // Songs (الأغاني)
      songsEnabled: this.songsEnabled,
      songsVolume: this.bgmVolume,
      track: BGM_TRACKS[this.currentBgmIndex] || null,
      index: this.currentBgmIndex,
      isPlaying: this.isBgmPlaying(),
      preampBoost: this.preampBoost,
      eqPreset: this.eqPreset,
      playbackMode: this.playbackMode,
      climaxTriggerLp: this.climaxTriggerLp,
      climaxOptions: CLIMAX_TRIGGER_OPTIONS,
      tracks: BGM_TRACKS,

      // Master & SFX
      muted: this.muted,
      volume: this.volume,
      sfxEnabled: this.sfxEnabled,
    };
  }

  subscribeBgm(callback) {
    this.bgmListeners.add(callback);
    return () => this.bgmListeners.delete(callback);
  }

  notifyBgmListeners() {
    const state = this.getBgmState();
    this.bgmListeners.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {}
    });
  }

  initBgmAudio() {
    if (this.bgmAudio) return this.bgmAudio;
    this.bgmAudio = new Audio();
    this.bgmAudio.preload = 'auto';
    this.bgmAudio.loop = false; // When song ends, switch smoothly according to playbackMode
    this.bgmAudio.volume = 1.0; // Input to Web Audio booster
    this.bgmAudio.addEventListener('ended', () => {
      this.onTrackEnded();
    });
    this.bgmAudio.addEventListener('play', () => {
      this.duckMusic(true);
      this.notifyBgmListeners();
    });
    this.bgmAudio.addEventListener('pause', () => {
      this.duckMusic(false);
      this.notifyBgmListeners();
    });
    return this.bgmAudio;
  }

  getBoostedBgmGain() {
    if (this.muted || !this.songsEnabled) return 0;
    // Heavily boosted volume for songs (configured preamp multiplier: 2.2x over standard volume)
    return Math.max(0, this.volume * this.bgmVolume * this.preampBoost);
  }

  setSongsEnabled(val) {
    this.songsEnabled = !!val;
    this.bgmEnabled = this.songsEnabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_songs_enabled', this.songsEnabled ? 'true' : 'false');
    }
    if (!this.songsEnabled && this.bgmAudio) {
      this.bgmAudio.pause();
      this.duckMusic(false);
    }
    this.notifyBgmListeners();
  }

  isSongsEnabled() {
    return this.songsEnabled;
  }

  setBgmVolume(vol) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_bgm_volume', this.bgmVolume.toString());
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), this.audioCtx.currentTime);
      } catch (e) {}
    }
    this.notifyBgmListeners();
  }

  getBgmVolume() {
    return this.bgmVolume;
  }

  setPreampBoost(level) {
    this.preampBoost = typeof level === 'number' ? level : 2.2;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_preamp_boost', this.preampBoost.toString());
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), this.audioCtx.currentTime);
      } catch (e) {}
    }
    this.notifyBgmListeners();
  }

  getPreampBoost() {
    return this.preampBoost;
  }

  setClimaxTriggerLp(val) {
    this.climaxTriggerLp = parseInt(val, 10);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_climax_trigger_lp', this.climaxTriggerLp.toString());
    }
    this.notifyBgmListeners();
  }

  getClimaxTriggerLp() {
    return this.climaxTriggerLp;
  }

  applyEqPreset(presetId) {
    this.eqPreset = presetId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_eq_preset', presetId);
    }
    const preset = EQ_PRESETS[presetId] || EQ_PRESETS.epic;
    if (this.bgmBassFilter && this.bgmMidFilter && this.bgmTrebleFilter && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.bgmBassFilter.gain.setTargetAtTime(preset.bass, now, 0.05);
        this.bgmMidFilter.gain.setTargetAtTime(preset.mid, now, 0.05);
        this.bgmTrebleFilter.gain.setTargetAtTime(preset.treble, now, 0.05);
      } catch (e) {}
    }
    this.notifyBgmListeners();
  }

  getEqPreset() {
    return this.eqPreset;
  }

  setPlaybackMode(mode) {
    this.playbackMode = mode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_playback_mode', mode);
    }
    this.notifyBgmListeners();
  }

  getPlaybackMode() {
    return this.playbackMode;
  }

  setupBgmAudioGraph() {
    if (this.bgmGraphConnected || !this.bgmAudio) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.bgmSourceNode = ctx.createMediaElementSource(this.bgmAudio);

      const preset = EQ_PRESETS[this.eqPreset] || EQ_PRESETS.epic;

      // Lowshelf Bass Booster (+6dB to +9dB for punchy anime battle drums)
      this.bgmBassFilter = ctx.createBiquadFilter();
      this.bgmBassFilter.type = 'lowshelf';
      this.bgmBassFilter.frequency.value = 110;
      this.bgmBassFilter.gain.value = preset.bass;

      // Peaking Mid/Vocal Presence
      this.bgmMidFilter = ctx.createBiquadFilter();
      this.bgmMidFilter.type = 'peaking';
      this.bgmMidFilter.frequency.value = 2600;
      this.bgmMidFilter.Q.value = 1.0;
      this.bgmMidFilter.gain.value = preset.mid;

      // Highshelf Treble Presence
      this.bgmTrebleFilter = ctx.createBiquadFilter();
      this.bgmTrebleFilter.type = 'highshelf';
      this.bgmTrebleFilter.frequency.value = 7500;
      this.bgmTrebleFilter.gain.value = preset.treble;

      // Primary Volume Booster GainNode (amplified heavily by preampBoost multiplier)
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.value = this.getBoostedBgmGain();

      // Studio Mastering Brickwall Dynamics Limiter (prevents clipping/distortion at high amplification)
      this.bgmCompressor = ctx.createDynamicsCompressor();
      this.bgmCompressor.threshold.value = -3.0;
      this.bgmCompressor.knee.value = 6;
      this.bgmCompressor.ratio.value = 14.0;
      this.bgmCompressor.attack.value = 0.002;
      this.bgmCompressor.release.value = 0.15;

      // Post-Limiter Acoustic Loudness Booster (adds extra acoustic punch so quiet tracks roar)
      this.bgmPostGain = ctx.createGain();
      this.bgmPostGain.gain.value = 1.75;

      // Chain: Source -> Bass -> Mid -> Treble -> Gain -> Compressor -> PostGain -> Destination
      this.bgmSourceNode.connect(this.bgmBassFilter);
      this.bgmBassFilter.connect(this.bgmMidFilter);
      this.bgmMidFilter.connect(this.bgmTrebleFilter);
      this.bgmTrebleFilter.connect(this.bgmGainNode);
      this.bgmGainNode.connect(this.bgmCompressor);
      this.bgmCompressor.connect(this.bgmPostGain);
      this.bgmPostGain.connect(ctx.destination);

      this.bgmGraphConnected = true;
    } catch (e) {
      console.warn('Web Audio BGM booster routing note:', e);
    }
  }

  /**
   * Switches song cleanly and ducks background music
   */
  switchTrackCleanly(targetIndex) {
    if (targetIndex < 0 || targetIndex >= BGM_TRACKS.length) return;

    this.initBgmAudio();

    // 1. Immediately pause and reset the single audio instance so songs NEVER overlap
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;

    this.currentBgmIndex = targetIndex;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_bgm_track_idx', this.currentBgmIndex.toString());
    }

    const track = BGM_TRACKS[this.currentBgmIndex];
    this.bgmAudio.src = track.path;
    this.bgmAudio.currentTime = 0;

    if (this.songsEnabled && !this.muted) {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.setupBgmAudioGraph();
      if (this.bgmGainNode && ctx) {
        this.bgmGainNode.gain.setValueAtTime(this.getBoostedBgmGain(), ctx.currentTime);
      }

      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.duckMusic(true);
            this.notifyBgmListeners();
          })
          .catch(() => {});
      }
    } else {
      this.duckMusic(false);
      this.notifyBgmListeners();
    }
  }

  getNextDifferentTrackIndex() {
    let bag = [];
    try {
      const stored = localStorage.getItem('yugioh_song_rotation_bag');
      if (stored) bag = JSON.parse(stored);
    } catch (e) {}

    if (!Array.isArray(bag) || bag.length === 0) {
      // Re-fill bag with all available songs
      const allIndices = BGM_TRACKS.map((_, i) => i);
      // Fisher-Yates shuffle
      for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
      }
      // Ensure the first song of the new rotation is not the same as current song
      if (allIndices.length > 1 && allIndices[0] === this.currentBgmIndex) {
        const swapTarget = Math.floor(Math.random() * (allIndices.length - 1)) + 1;
        [allIndices[0], allIndices[swapTarget]] = [allIndices[swapTarget], allIndices[0]];
      }
      bag = allIndices;
    }

    const nextIdx = bag.shift();
    try {
      localStorage.setItem('yugioh_song_rotation_bag', JSON.stringify(bag));
    } catch (e) {}

    return (typeof nextIdx === 'number' && nextIdx >= 0 && nextIdx < BGM_TRACKS.length)
      ? nextIdx
      : ((this.currentBgmIndex + 1) % BGM_TRACKS.length);
  }

  playDuelBgm(trackIndex = null, options = {}) {
    if (this.muted || !this.songsEnabled) return;

    if (typeof trackIndex === 'number' && trackIndex >= 0 && trackIndex < BGM_TRACKS.length) {
      this.switchTrackCleanly(trackIndex);
      return;
    }

    if (options.random || !this.bgmAudio || !this.bgmAudio.src) {
      const rndIdx = this.getNextDifferentTrackIndex();
      this.switchTrackCleanly(rndIdx);
      return;
    }

    if (this.bgmAudio && this.bgmAudio.paused) {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.setupBgmAudioGraph();
      this.bgmAudio.play().then(() => {
        this.duckMusic(true);
      }).catch(() => {});
      this.notifyBgmListeners();
    }
  }

  pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.duckMusic(false);
      this.notifyBgmListeners();
    }
  }

  resumeBgm() {
    if (this.bgmAudio && this.bgmAudio.src) {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.setupBgmAudioGraph();
      this.bgmAudio.play().then(() => {
        this.duckMusic(true);
      }).catch(() => {});
      this.notifyBgmListeners();
    } else {
      this.playDuelBgm(null, { random: true });
    }
  }

  seekBgm(percent) {
    if (this.bgmAudio && this.bgmAudio.duration) {
      this.bgmAudio.currentTime = Math.max(0, Math.min(this.bgmAudio.duration, (percent / 100) * this.bgmAudio.duration));
      this.notifyBgmListeners();
    }
  }

  onTrackEnded() {
    if (this.playbackMode === 'loop_one') {
      // Repeat the exact same song
      this.switchTrackCleanly(this.currentBgmIndex);
    } else if (this.playbackMode === 'loop_all') {
      // Sequential play
      const nextIdx = (this.currentBgmIndex + 1) % BGM_TRACKS.length;
      this.switchTrackCleanly(nextIdx);
    } else {
      // Default: Shuffle rotation without repeating the same song
      const nextIdx = this.getNextDifferentTrackIndex();
      this.switchTrackCleanly(nextIdx);
    }
  }

  stopBgm() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.duckMusic(false);
        this.notifyBgmListeners();
      } catch (e) {}
    }
  }

  toggleBgm() {
    if (this.isBgmPlaying()) {
      this.pauseBgm();
    } else {
      this.resumeBgm();
    }
  }

  nextBgmTrack() {
    this.userLockedUntil = Date.now() + 45000;
    const nextIdx = (this.currentBgmIndex + 1) % BGM_TRACKS.length;
    this.switchTrackCleanly(nextIdx);
  }

  prevBgmTrack() {
    this.userLockedUntil = Date.now() + 45000;
    const prevIdx = (this.currentBgmIndex - 1 + BGM_TRACKS.length) % BGM_TRACKS.length;
    this.switchTrackCleanly(prevIdx);
  }

  setBgmTrack(index) {
    this.userLockedUntil = Date.now() + 45000;
    this.switchTrackCleanly(index);
  }

  // ==========================================
  // 3. Duel Master Orchestrator (المعركة والتحكم التلقائي)
  // ==========================================

  startDuelAudio() {
    this.songsStarted = false;
    this.duckMusic(false);

    // 1. Start background music automatically!
    this.startDuelMusic();

    // 2. If trigger is set to 8000 (from the start of battle), also start songs immediately
    if (this.climaxTriggerLp >= 8000 && this.songsEnabled && !this.muted) {
      this.songsStarted = true;
      this.playDuelBgm(null, { random: true });
    }
  }

  stopDuelAudio() {
    this.stopDuelMusic();
    this.stopBgm();
    this.songsStarted = false;
    this.duckMusic(false);
  }

  /**
   * Adapts battle background music to players' Life Points dynamically:
   * At the climax threshold (e.g. LP <= 3500), songs start playing with heavy volume boost
   * and the background music volume ducks down!
   */
  updateDuelMood(p0Lp, p1Lp) {
    if (this.muted) return;
    if (Date.now() < this.userLockedUntil) return;

    const minLp = Math.min(p0Lp, p1Lp);

    if (minLp <= this.climaxTriggerLp && minLp > 0) {
      if (!this.songsStarted && this.songsEnabled) {
        this.songsStarted = true;
        // Start songs automatically with huge boosted volume, guaranteed different song each time!
        const nextSongIdx = this.getNextDifferentTrackIndex();
        this.switchTrackCleanly(nextSongIdx);
        this.duckMusic(true); // Lower background music!
      }
    }
  }

  /**
   * Plays a named sound effect
   * @param {string} soundName 
   * @param {number} baseVolume 
   */
  play(soundName, baseVolume = 0.8) {
    if (this.muted || !this.sfxEnabled) return;

    const finalVol = Math.max(0, Math.min(1, baseVolume * this.volume));
    const path = this.soundPaths[soundName];
    if (path) {
      try {
        const audio = new Audio(path);
        audio.volume = finalVol;
        audio.play().catch(() => {
          // Autoplay policy or load error: fall back to synthesized audio
          this.playSynthesizedFallback(soundName, finalVol);
        });
      } catch (err) {
        this.playSynthesizedFallback(soundName, finalVol);
      }
    } else {
      this.playSynthesizedFallback(soundName, finalVol);
    }
  }

  /**
   * Procedural Web Audio API sound synthesis (guaranteed zero failure fallback)
   */
  playSynthesizedFallback(type, vol = 0.3) {
    if (this.muted || !this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'click':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
          gain.gain.setValueAtTime(0.2 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'decide':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.setValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(0.3 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'damage':
          osc.type = 'square';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.linearRampToValueAtTime(40, now + 0.25);
          gain.gain.setValueAtTime(0.45 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'summon':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25);
          gain.gain.setValueAtTime(0.35 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'magic':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(1100, now + 0.3);
          gain.gain.setValueAtTime(0.3 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'turnChange':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
          gain.gain.setValueAtTime(0.35 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
          break;

        case 'battleTurn':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(587.33, now + 0.1);
          gain.gain.setValueAtTime(0.3 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'swordSlash':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
          break;

        case 'laserShoot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(960, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
          gain.gain.setValueAtTime(0.3 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
          osc.start(now);
          osc.stop(now + 0.17);
          break;

        case 'dragonRoar':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
          gain.gain.setValueAtTime(0.45 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
          osc.start(now);
          osc.stop(now + 0.48);
          break;

        case 'magicBlast':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
          gain.gain.setValueAtTime(0.35 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.start(now);
          osc.stop(now + 0.32);
          break;

        case 'shieldDeflect':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1560, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.22);
          gain.gain.setValueAtTime(0.45 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'shieldShatter':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);
          gain.gain.setValueAtTime(0.5 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.start(now);
          osc.stop(now + 0.32);
          break;

        case 'darkConsume':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.4);
          gain.gain.setValueAtTime(0.4 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.start(now);
          osc.stop(now + 0.42);
          break;

        case 'electrocute':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(110, now + 0.05);
          osc.frequency.setValueAtTime(330, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
          gain.gain.setValueAtTime(0.38 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
          break;

        case 'stoneCrush':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(95, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
          gain.gain.setValueAtTime(0.45 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          osc.start(now);
          osc.stop(now + 0.38);
          break;

        case 'directHit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(170, now);
          osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
          gain.gain.setValueAtTime(0.6 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;

        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.15 * vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
      }
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }

  // Convenience methods
  playClick() { this.play('click', 0.6); }
  playDecide() { this.play('decide', 0.8); }
  playCardMove() { this.play('cardMove', 0.7); }
  playCardOpen() { this.play('cardOpen', 0.8); }
  playSummon() { this.play('summon', 0.85); }
  playAttack() { this.play('attack', 0.9); }
  playDamage() { this.play('damage', 0.9); }
  playDestroy() { this.play('destroy', 0.85); }
  playMagic() { this.play('magic', 0.85); }
  playLifeUp() { this.play('lifeUp', 0.8); }
  playTurnChange() { this.play('turnChange', 0.75); }
  playBattleTurn() { this.play('battleTurn', 0.8); }
  playCoin() { this.play('coin', 0.8); }
  playStart() { this.play('start', 0.9); }
  playWin() { this.play('win', 0.9); }
  playLose() { this.play('lose', 0.9); }

  // Unique Combat & Destruction SFX
  playSwordSlash() { this.playSynthesized('swordSlash', 0.95); }
  playLaserShoot() { this.playSynthesized('laserShoot', 0.9); }
  playDragonRoar() { this.playSynthesized('dragonRoar', 0.95); }
  playMagicBlast() { this.playSynthesized('magicBlast', 0.9); }
  playShieldDeflect() { this.playSynthesized('shieldDeflect', 0.95); }
  playShieldShatter() { this.playSynthesized('shieldShatter', 1.0); }
  playDarkConsume() { this.playSynthesized('darkConsume', 0.9); }
  playElectrocute() { this.playSynthesized('electrocute', 0.9); }
  playStoneCrush() { this.playSynthesized('stoneCrush', 0.95); }
  playDirectHit() {
    this.play('damage', 1.0);
    this.playSynthesized('directHit', 1.0);
  }

  playArenaWarp() {
    if (this.muted || !this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Sub-bass dimensional impact boom
      const oscBass = ctx.createOscillator();
      const gainBass = ctx.createGain();
      oscBass.type = 'sine';
      oscBass.frequency.setValueAtTime(120, now);
      oscBass.frequency.exponentialRampToValueAtTime(32, now + 0.65);
      gainBass.gain.setValueAtTime(0.55 * this.volume, now);
      gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      oscBass.connect(gainBass);
      gainBass.connect(ctx.destination);
      oscBass.start(now);
      oscBass.stop(now + 0.65);

      // 2. Cosmic hyperspace riser sweep
      const oscWarp = ctx.createOscillator();
      const gainWarp = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      oscWarp.type = 'sawtooth';
      oscWarp.frequency.setValueAtTime(140, now);
      oscWarp.frequency.exponentialRampToValueAtTime(980, now + 0.45);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.linearRampToValueAtTime(1800, now + 0.42);
      filter.Q.value = 2.8;

      gainWarp.gain.setValueAtTime(0.02, now);
      gainWarp.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.3);
      gainWarp.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

      oscWarp.connect(filter);
      filter.connect(gainWarp);
      gainWarp.connect(ctx.destination);
      oscWarp.start(now);
      oscWarp.stop(now + 0.58);

      // 3. Dimensional crystalline chime
      const oscChime = ctx.createOscillator();
      const gainChime = ctx.createGain();
      oscChime.type = 'sine';
      oscChime.frequency.setValueAtTime(1244.5, now + 0.22);
      oscChime.frequency.setValueAtTime(1661.2, now + 0.36);
      gainChime.gain.setValueAtTime(0.0, now);
      gainChime.gain.setValueAtTime(0.3 * this.volume, now + 0.22);
      gainChime.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      oscChime.connect(gainChime);
      gainChime.connect(ctx.destination);
      oscChime.start(now + 0.22);
      oscChime.stop(now + 0.85);
    } catch (e) {}
  }

  playLpTick() {
    if (this.muted || !this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
      gain.gain.setValueAtTime(0.1 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  playHeartbeat() {
    if (this.muted || !this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  playJankenBgm() {
    if (this.muted || !this.bgmEnabled) return;
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(this.soundPaths.janken);
        this.bgmAudio.loop = true;
      }
      this.bgmAudio.volume = 0.6 * this.volume;
      this.bgmAudio.currentTime = 0;
      this.bgmAudio.play().catch(() => {});
    } catch (e) {}
  }

  stopJankenBgm() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch (e) {}
    }
  }
}

export const soundManager = new SoundController();
export default soundManager;
