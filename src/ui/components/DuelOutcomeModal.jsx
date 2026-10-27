import React, { useState, useEffect } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/**
 * Millennium Eye of Horus - Ancient Egyptian Royal Victory Crest
 */
const MillenniumVictoryEmblem = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.9))' }}>
    {/* Radiating Sun Disk */}
    <circle cx="60" cy="60" r="54" stroke="url(#goldGradientOuter)" strokeWidth="3" opacity="0.9" />
    <circle cx="60" cy="60" r="48" stroke="url(#goldGradientInner)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75" />
    
    {/* Central Pyramid Triangle */}
    <polygon points="60,18 96,82 24,82" stroke="url(#goldGradientOuter)" strokeWidth="4" fill="rgba(24, 18, 10, 0.9)" />
    
    {/* Eye of Horus Inner Outline */}
    <path
      d="M38 52 Q60 38 82 52 Q60 66 38 52 Z"
      stroke="url(#goldGradientOuter)"
      strokeWidth="3.5"
      fill="rgba(245, 158, 11, 0.2)"
      strokeLinecap="round"
    />
    
    {/* Pupil / Iris */}
    <circle cx="60" cy="52" r="7.5" fill="url(#goldGradientOuter)" />
    <circle cx="60" cy="52" r="3" fill="#ffffff" />
    
    {/* Horus Eyebrow */}
    <path d="M35 43 Q60 30 85 43" stroke="url(#goldGradientOuter)" strokeWidth="3" strokeLinecap="round" />
    
    {/* Horus Lower Tear & Falcon Tail */}
    <line x1="60" y1="64" x2="60" y2="76" stroke="url(#goldGradientOuter)" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M68 62 Q74 68 70 78 Q66 84 56 81" fill="none" stroke="url(#goldGradientOuter)" strokeWidth="3" strokeLinecap="round" />

    {/* Gradients */}
    <defs>
      <linearGradient id="goldGradientOuter" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="30%" stopColor="#facc15" />
        <stop offset="70%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
      <linearGradient id="goldGradientInner" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Fractured Shadow Obelisk - Shadow Realm Defeat Emblem
 */
const ShadowDefeatEmblem = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0 0 24px rgba(220, 38, 38, 0.85))' }}>
    {/* Dark Shadow Portal Outer Ring */}
    <circle cx="60" cy="60" r="54" stroke="url(#crimsonGradient)" strokeWidth="3" opacity="0.85" />
    <circle cx="60" cy="60" r="48" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1.5" strokeDasharray="4 4" />

    {/* Fractured Cartouche Stone */}
    <polygon points="60,20 94,82 26,82" stroke="url(#crimsonGradient)" strokeWidth="3.5" fill="rgba(18, 10, 14, 0.95)" />

    {/* Cracking Fissure Lines cutting through the core */}
    <path d="M60 20 L58 45 L66 58 L54 70 L60 82" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M58 45 L42 50" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M66 58 L78 64" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />

    {/* Fractured Shadow Eye */}
    <path
      d="M38 52 Q49 44 57 47"
      stroke="#a855f7"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M65 54 Q75 48 82 52"
      stroke="#a855f7"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="48" cy="52" r="4" fill="#ef4444" />
    <circle cx="72" cy="54" r="4" fill="#a855f7" />

    <defs>
      <linearGradient id="crimsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="40%" stopColor="#ef4444" />
        <stop offset="80%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
    </defs>
  </svg>
);

export const DuelOutcomeModal = ({
  winner,
  winReason,
  p0Lp,
  p1Lp,
  turnNumber = 1,
  p0Name = 'يوجي',
  p1Name = 'الخصم',
  graveyardCount = 0,
  onExit,
  onRestart,
}) => {
  const isVictory = winner === 0;
  const [stage, setStage] = useState('impact'); // 'impact' -> 'ceremony'

  useEffect(() => {
    // Initial sound & haptic
    if (isVictory) {
      soundManager.playWin();
      hapticManager.triggerCombatVibration('powerSummon', { atk: 4500 });
    } else {
      soundManager.playLose();
      hapticManager.triggerCombatVibration('directAttack');
    }

    // Transition from explosion impact to sculpted banner ceremony
    const timer = setTimeout(() => {
      setStage('ceremony');
    }, 850);

    return () => clearTimeout(timer);
  }, [isVictory]);

  // Hieroglyphic motes for ascending victory particles
  const hieroglyphs = ['𓂀', '𓋹', '𓃭', '𓆣', '𓎛', '𓇳', '𓊃', '𓏏'];

  // Resolve localized win/loss reasons
  const getOutcomeReasonText = () => {
    if (winReason === 'EXODIA') {
      return isVictory
        ? 'استدعاء إكسوديا المحرَر المطلق (انتصار إعجازي فوري)'
        : 'استدعى الخصم أجزاء إكسوديا الخمسة كاملة';
    }
    if (winReason === 'DECK_OUT') {
      return isVictory
        ? 'نفاد جميع بطاقات مجموعة الخصم ولم يعد بإمكانه السحب'
        : 'نفدت أوراق مجموعتك بالكامل ولم تتمكن من سحب بطاقة';
    }
    if (winReason === 'SURRENDER') {
      return isVictory
        ? 'انسحب الخصم واعترف بسيادتك على ميدان المعركة'
        : 'انسحبت من ميدان المعركة';
    }
    return isVictory
      ? 'إسقاط كافة نقاط حياة الخصم إلى الصفر بضربة ساحقة'
      : 'استنفاد كافة نقاط حياتك في مواجهة الخصم الشرسة';
  };

  return (
    <div
      className={`duel-outcome-overlay ${isVictory ? 'outcome-victory' : 'outcome-defeat'} stage-${stage}`}
      role="dialog"
      aria-modal="true"
    >
      {/* Background Energy Vortex */}
      {isVictory ? (
        <div className="victory-sunburst-backdrop" aria-hidden="true" />
      ) : (
        <div className="defeat-shadow-mist" aria-hidden="true" />
      )}

      {/* Ascending Glyphs for Victory */}
      {isVictory && (
        <div className="outcome-particles-container" aria-hidden="true">
          {hieroglyphs.map((glyph, idx) => (
            <span
              key={`glyph-${idx}`}
              className="ascending-pharaoh-glyph"
              style={{
                left: `${(idx * 12.5 + 6) % 94}%`,
                animationDelay: `${idx * 0.35}s`,
                animationDuration: `${3.6 + (idx % 3) * 0.8}s`,
              }}
            >
              {glyph}
            </span>
          ))}
        </div>
      )}

      {/* Main Outcome Modal Container */}
      <div className={`outcome-content-card ${isVictory ? 'victory-card' : 'defeat-card'}`}>
        {/* Stage 1 Shockwave Blast Rings */}
        <div className="outcome-shockwave-ring" />
        <div className="outcome-shockwave-ring ring-secondary" />

        {/* Central Pharaonic Emblem */}
        <div className="outcome-emblem-wrapper">
          {isVictory ? <MillenniumVictoryEmblem size={105} /> : <ShadowDefeatEmblem size={105} />}
        </div>

        {/* Heroic Title & Subtitle */}
        <div className="outcome-header-block">
          <div className="outcome-badge-pill">
            {isVictory ? 'تتويج بطل المبارزة' : 'سقوط في عالم الظلال'}
          </div>

          <h1 className="outcome-main-title">
            {isVictory ? 'انتصار أسطوري ساحق' : 'هزيمة في عالم الظلال'}
          </h1>

          <p className="outcome-subtitle">
            {isVictory
              ? `أثبتّ جدارتك يا ${p0Name} كملك للألعاب وحاكم حلبة النزال الأوحد`
              : `خسرت المبارزة أمام ${p1Name}، لكن عزيمة المبارز لا تنكسر أبداً`}
          </p>
        </div>

        {/* Reason Badge */}
        <div className="outcome-reason-box">
          <div className="reason-label-text">
            سبب حسم المعركة
          </div>
          <div className="reason-detail-text">
            {getOutcomeReasonText()}
          </div>
        </div>

        {/* Battle Statistics Card */}
        <div className="outcome-stats-panel">
          <div className="stat-pill-item">
            <span className="stat-label">نقاط حياتك</span>
            <span className={`stat-value ${isVictory ? 'stat-value-win' : 'stat-value-loss'}`}>
              {Math.max(0, p0Lp)}
            </span>
          </div>

          <div className="stat-pill-item">
            <span className="stat-label">نقاط الخصم</span>
            <span className={`stat-value ${!isVictory ? 'stat-value-win' : 'stat-value-loss'}`}>
              {Math.max(0, p1Lp)}
            </span>
          </div>

          <div className="stat-pill-item">
            <span className="stat-label">أدوار النزال</span>
            <span className="stat-value">
              {turnNumber}
            </span>
          </div>

          <div className="stat-pill-item">
            <span className="stat-label">المقبرة</span>
            <span className="stat-value">
              {graveyardCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="outcome-actions-row">
          {onRestart && (
            <button
              onClick={() => {
                soundManager.playDecide();
                hapticManager.triggerCombatVibration('click');
                onRestart();
              }}
              className={isVictory ? 'btn-pharaoh-gold outcome-primary-btn' : 'btn-defeat-rematch outcome-primary-btn'}
            >
              <span className="duel-btn-shine-sheen" />
              <span>{isVictory ? 'مبارزة جديدة فوراً' : 'إعادة التحدي والانتقام'}</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              hapticManager.triggerCombatVibration('click');
              onExit();
            }}
            className="btn-pharaoh-stone outcome-secondary-btn"
          >
            <span>العودة للقائمة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuelOutcomeModal;
