/**
 * SoundManager.js
 * Comprehensive audio management system for Yu-Gi-Oh! Mobile Edition.
 * Uses original Yu-Gi-Oh! game sound effects with synthesized Web Audio API fallbacks.
 * 100% offline, zero external dependencies.
 */

class SoundController {
  constructor() {
    this.muted = localStorage.getItem('yugioh_sound_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('yugioh_volume') || '0.8');
    this.sfxEnabled = localStorage.getItem('yugioh_sfx_enabled') !== 'false';
    this.bgmEnabled = localStorage.getItem('yugioh_bgm_enabled') !== 'false';

    this.audioPool = {};
    this.bgmAudio = null;
    this.audioCtx = null;

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
    localStorage.setItem('yugioh_sound_muted', this.muted ? 'true' : 'false');
    if (this.muted && this.bgmAudio) {
      this.bgmAudio.pause();
    }
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
    localStorage.setItem('yugioh_volume', this.volume.toString());
    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.6 * this.volume;
    }
  }

  isSfxEnabled() {
    return this.sfxEnabled;
  }

  setSfxEnabled(val) {
    this.sfxEnabled = !!val;
    localStorage.setItem('yugioh_sfx_enabled', this.sfxEnabled ? 'true' : 'false');
  }

  isBgmEnabled() {
    return this.bgmEnabled;
  }

  setBgmEnabled(val) {
    this.bgmEnabled = !!val;
    localStorage.setItem('yugioh_bgm_enabled', this.bgmEnabled ? 'true' : 'false');
    if (!this.bgmEnabled && this.bgmAudio) {
      this.bgmAudio.pause();
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
