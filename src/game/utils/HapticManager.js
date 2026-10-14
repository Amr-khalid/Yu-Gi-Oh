/**
 * HapticManager.js
 * Comprehensive mobile vibration and haptic feedback manager for Yu-Gi-Oh! Mobile Edition.
 * Uses the Web Vibration API (navigator.vibrate) with customizable combat triggers.
 * 100% offline, zero external dependencies.
 */

class HapticController {
  constructor() {
    this.enabled = localStorage.getItem('yugioh_vibration_enabled') !== 'false';
    this.vibrateOnDamage = localStorage.getItem('yugioh_vib_damage') !== 'false';
    this.vibrateOnDestroy = localStorage.getItem('yugioh_vib_destroy') !== 'false';
    this.vibrateOnDirectAttack = localStorage.getItem('yugioh_vib_direct') !== 'false';
    this.vibrateOnTrap = localStorage.getItem('yugioh_vib_trap') !== 'false';
    this.vibrateOnGameOver = localStorage.getItem('yugioh_vib_gameover') !== 'false';
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(val) {
    this.enabled = !!val;
    localStorage.setItem('yugioh_vibration_enabled', this.enabled ? 'true' : 'false');
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

    if (storageKeys[key]) {
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
