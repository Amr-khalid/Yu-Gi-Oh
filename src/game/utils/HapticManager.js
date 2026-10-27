/**
 * HapticManager.js
 * Comprehensive mobile vibration and haptic feedback manager for Yu-Gi-Oh! Mobile Edition.
 * Uses the Web Vibration API (navigator.vibrate) with customizable combat triggers.
 * 100% offline, zero external dependencies.
 */

class HapticController {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    this.enabled = hasStorage ? localStorage.getItem('yugioh_vibration_enabled') !== 'false' : true;
    this.vibrateOnDamage = hasStorage ? localStorage.getItem('yugioh_vib_damage') !== 'false' : true;
    this.vibrateOnDestroy = hasStorage ? localStorage.getItem('yugioh_vib_destroy') !== 'false' : true;
    this.vibrateOnDirectAttack = hasStorage ? localStorage.getItem('yugioh_vib_direct') !== 'false' : true;
    this.vibrateOnTrap = hasStorage ? localStorage.getItem('yugioh_vib_trap') !== 'false' : true;
    this.vibrateOnGameOver = hasStorage ? localStorage.getItem('yugioh_vib_gameover') !== 'false' : true;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yugioh_vibration_enabled', this.enabled ? 'true' : 'false');
    }
  }

  setOption(key, val) {
    const storageKeys = {
      damage: 'yugioh_vib_damage',
      destroy: 'yugioh_vib_destroy',
      direct: 'yugioh_vib_direct',
      trap: 'yugioh_vib_trap',
      gameover: 'yugioh_vib_gameover',
    };
    if (key === 'damage') this.vibrateOnDamage = !!val;
    if (key === 'destroy') this.vibrateOnDestroy = !!val;
    if (key === 'direct') this.vibrateOnDirectAttack = !!val;
    if (key === 'trap') this.vibrateOnTrap = !!val;
    if (key === 'gameover') this.vibrateOnGameOver = !!val;

    if (typeof localStorage !== 'undefined' && storageKeys[key]) {
      localStorage.setItem(storageKeys[key], val ? 'true' : 'false');
    }
  }

  vibrate(pattern) {
    if (!this.enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      return false;
    }
  }

  /**
   * Triggers haptic vibration based on combat situation
   */
  triggerCombatVibration(type, metadata = {}) {
    if (!this.enabled) return;

    switch (type) {
      case 'damage':
        if (!this.vibrateOnDamage) return;
        const dmg = metadata.damage || 0;
        if (dmg >= 2000) {
          // Heavy seismic damage rumble
          this.vibrate([120, 50, 200]);
        } else if (dmg >= 1000) {
          // Medium damage pulse
          this.vibrate([90, 40, 110]);
        } else {
          // Light damage shock
          this.vibrate([70]);
        }
        break;

      case 'destroy':
        if (!this.vibrateOnDestroy) return;
        // Monster destroyed in battle
        this.vibrate([110]);
        break;

      case 'direct':
        if (!this.vibrateOnDirectAttack) return;
        // Direct attack hit on LP
        this.vibrate([150, 50, 180]);
        break;

      case 'trap':
        if (!this.vibrateOnTrap) return;
        // Trap card sprung
        this.vibrate([60, 40, 70]);
        break;

      case 'gameover':
        if (!this.vibrateOnGameOver) return;
        // Duel climax win/lose
        this.vibrate([120, 60, 120, 60, 300]);
        break;

      case 'click':
        // Subtle tactile button tap
        this.vibrate([25]);
        break;

      case 'powerSummon':
        if (!this.vibrateOnDamage) return;
        const monsterAtk = metadata.atk || 0;
        if (monsterAtk >= 3000) {
          // Legendary divine monster (Blue-Eyes, Dark Magician of Chaos, Exodia, God cards)
          this.vibrate([220, 80, 320, 80, 220]);
        } else if (monsterAtk >= 2500) {
          // Powerful heroic summon (Dark Magician, Red-Eyes, Summoned Skull)
          this.vibrate([160, 60, 220]);
        } else {
          // High level summon
          this.vibrate([110, 50, 130]);
        }
        break;

      case 'shuffle':
        // Riffle shuffle vibration flurry
        this.vibrate([30, 40, 30, 40, 35, 35, 45]);
        break;

      case 'turnChange':
        // Crisp dual-pulse haptic signal for turn initiative switch
        this.vibrate([45, 35, 65]);
        break;

      default:
        this.vibrate([50]);
        break;
    }
  }

  testVibrate() {
    return this.vibrate([100, 60, 150]);
  }
}

export const hapticManager = new HapticController();
export default hapticManager;
