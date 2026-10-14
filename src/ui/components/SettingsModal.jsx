import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

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

export const SettingsModal = ({ isOpen, onClose, theme, onToggleTheme }) => {
  const [muted, setMuted] = useState(() => soundManager.isMuted());
  const [volume, setVolume] = useState(() => soundManager.getVolume());
  const [sfxEnabled, setSfxEnabled] = useState(() => soundManager.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(() => soundManager.isBgmEnabled());

  const [isFullscreen, setIsFullscreen] = useState(() => isFullscreenActive());

  const [vibrationEnabled, setVibrationEnabled] = useState(() => hapticManager.isEnabled());
  const [vibDamage, setVibDamage] = useState(() => hapticManager.vibrateOnDamage);
  const [vibDestroy, setVibDestroy] = useState(() => hapticManager.vibrateOnDestroy);
  const [vibDirect, setVibDirect] = useState(() => hapticManager.vibrateOnDirectAttack);
  const [vibTrap, setVibTrap] = useState(() => hapticManager.vibrateOnTrap);
  const [vibGameOver, setVibGameOver] = useState(() => hapticManager.vibrateOnGameOver);

  const [vibrateTested, setVibrateTested] = useState(false);

  // Synchronize fullscreen state with browser events (e.g. Esc or F11 or address bar actions)
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

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundManager.setSfxEnabled(next);
    if (next) soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
  };

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    soundManager.setBgmEnabled(next);
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
    const ok = hapticManager.testVibrate();
    setVibrateTested(true);
    setTimeout(() => setVibrateTested(false), 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
          maxWidth: 500,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9)',
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
              إعدادات اللعبة — لوح التحكم الملكي
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-pharaoh-stone"
            style={{ padding: '5px 12px', fontSize: 12 }}
          >
            إغلاق
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section 1: Theme */}
          <div
            style={{
              background: 'var(--pharaoh-slot-bg)',
              border: '1px solid var(--pharaoh-stone-border)',
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)', marginBottom: 8 }}>
              المظهر والسمة البصرية
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--pharaoh-text-gold)' }}>
                السمة الحالية: {theme === 'light' ? 'ورق بردي ملكي (فاتح)' : 'سبج فرعوني داكن (ليلي)'}
              </div>
              <button
                onClick={() => {
                  onToggleTheme();
                  hapticManager.triggerCombatVibration('click');
                }}
                className="btn-pharaoh-gold"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع الفاتح'}
              </button>
            </div>
          </div>

          {/* Section 2: Fullscreen Display */}
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
                <span>وضع ملء الشاشة الكامل (Full Screen Display)</span>
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
                {isFullscreen ? 'ملء الشاشة نشط' : 'الوضع العادي'}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--pharaoh-text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              يملأ شاشة الهاتف أو الكمبيوتر بالكامل دون أشرطة المتصفح لتجربة لعب سينمائية غامرة وحقيقية.
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
                  <span>الخروج من وضع ملء الشاشة</span>
                </>
              ) : (
                <>
                  <MaximizeIcon size={16} />
                  <span>تفعيل وضع ملء الشاشة الكامل الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Section 3: Sound & Volume */}
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
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
              الصوت والمؤثرات السمعية
            </div>

            {/* Master Mute Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pharaoh-text-gold)' }}>
                  كتم الصوت بالكامل
                </div>
                <div style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)' }}>
                  تعطيل أو تشغيل كافة المؤثرات والأصوات
                </div>
              </div>
              <button
                onClick={handleToggleMute}
                className={muted ? 'btn-pharaoh-danger' : 'btn-pharaoh-stone'}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {muted ? 'الصوت مكتوم' : 'الصوت يعمل'}
              </button>
            </div>

            {/* Volume Slider */}
            {!muted && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--pharaoh-text-gold)', marginBottom: 4 }}>
                  <span>مستوى الصوت العام</span>
                  <span>{Math.round(volume * 100)}%</span>
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
            )}

            {/* SFX and BGM Sub-toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 4, borderTop: '1px solid var(--pharaoh-stone-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>المؤثرات (SFX)</span>
                <button
                  onClick={handleToggleSfx}
                  className="btn-pharaoh-stone"
                  style={{ padding: '4px 10px', fontSize: 11, opacity: sfxEnabled ? 1 : 0.6 }}
                >
                  {sfxEnabled ? 'مفعلة' : 'معطلة'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)' }}>الموسيقى (BGM)</span>
                <button
                  onClick={handleToggleBgm}
                  className="btn-pharaoh-stone"
                  style={{ padding: '4px 10px', fontSize: 11, opacity: bgmEnabled ? 1 : 0.6 }}
                >
                  {bgmEnabled ? 'مفعلة' : 'معطلة'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Vibration & Haptic Feedback */}
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
                  اهتزاز الهاتف أثناء القتال (Haptic Feedback)
                </div>
                <div style={{ fontSize: 10, color: 'var(--pharaoh-text-muted)' }}>
                  نبضات اهتزاز لمسية تحاكي ضربات المعركة على شاشات الهواتف
                </div>
              </div>

              <button
                onClick={handleToggleVibration}
                className={vibrationEnabled ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {vibrationEnabled ? 'الاهتزاز مفعل' : 'الاهتزاز معطل'}
              </button>
            </div>

            {/* Combat Trigger Cases */}
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
                  تخصيص حالات الاهتزاز أثناء المعركة:
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
                    الاهتزاز عند تلقي ضرر في نقاط الحياة (يتناسب مع حجم الضرر)
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
                    الاهتزاز عند تحطم الوحش في المعركة
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
                    الاهتزاز الصاعق عند الهجوم المباشر على الخصم
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
                    الاهتزاز التنبيهي عند تفعيل بطاقة فخ مفاجئ
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
                    الاهتزاز النبضي عند حسم المعركة (النصر أو الهزيمة)
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
                  {vibrateTested ? 'تم إرسال نبضة الاهتزاز!' : 'تجربة نبضة الاهتزاز الآن'}
                </button>
              </div>
            )}
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
            style={{ padding: '8px 24px', fontSize: 13 }}
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
