import React, { useState } from 'react';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/* Clean Executive Minimal SVG Icons (Zero Emojis, Pure SVG) */
const CrownIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const UserPlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const BotIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
  </svg>
);

const SettingsIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CopyIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SwordsCombatIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="M9.5 6.5l8 8" />
  </svg>
);

const SwapArrowsIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 16-4-4 4-4" />
    <path d="M3 12h18" />
    <path d="m17 8 4 4-4 4" />
  </svg>
);

const ShieldIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BOT_PRESETS = [
  { name: 'جوي ويلر (بوت)', difficulty: 'normal' },
  { name: 'سيتو كايبا (بوت)', difficulty: 'hard' },
  { name: 'يامي ماريك (بوت)', difficulty: 'hard' },
  { name: 'بيغاسوس (بوت)', difficulty: 'normal' },
];

export const TagTeamLobbyView = ({
  status,
  playerName,
  isHost,
  onStartDuel,
  onCancel,
  onUpdateSlot,
  onUpdateSettings,
  onSwapSlots,
  isMobile,
  isLight = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const rawSlots = status.tagSlots || [];
  const slots = [0, 1, 2, 3].map((idx) => {
    return (
      rawSlots[idx] || {
        slotIndex: idx,
        team: idx < 2 ? 0 : 1,
        isOccupied: idx === 0,
        isHost: idx === 0,
        isBot: false,
        name: idx === 0 ? playerName : 'شاغر (ادعي صاحبك أو ضيف بوت)',
        botDifficulty: 'normal',
      }
    );
  });

  const mySlot = typeof status.mySlot === 'number' ? status.mySlot : 0;
  const myTeam = typeof status.myTeam === 'number' ? status.myTeam : (mySlot < 2 ? 0 : 1);

  const settings = status.tagSettings || {
    lifePoints: 16000,
    turnFlow: 'coop_simultaneous',
    summonRule: 'per_player',
    graveyardShare: true,
    turnTimer: 90,
    teammateHandVisibility: 'visible',
  };

  const handleCopyCode = () => {
    if (status.roomCode && navigator.clipboard) {
      navigator.clipboard.writeText(status.roomCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleMoveToSeat = (targetSlotIdx) => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    if (onSwapSlots && targetSlotIdx !== mySlot) {
      onSwapSlots(mySlot, targetSlotIdx);
    }
  };

  const handleAddBot = (slotIdx) => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    const preset = BOT_PRESETS[slotIdx % BOT_PRESETS.length];
    onUpdateSlot(slotIdx, true, preset.difficulty, preset.name);
  };

  const handleRemoveBot = (slotIdx) => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    onUpdateSlot(slotIdx, false);
  };

  const handleFillAllEmptyWithBots = () => {
    soundManager.playClick();
    hapticManager.triggerCombatVibration('click');
    slots.forEach((s) => {
      if (!s.isOccupied && s.slotIndex !== mySlot) {
        const preset = BOT_PRESETS[s.slotIndex % BOT_PRESETS.length];
        onUpdateSlot(s.slotIndex, true, preset.difficulty, preset.name);
      }
    });
  };

  const team0 = [slots[0], slots[1]];
  const team1 = [slots[2], slots[3]];

  // Render a player card seat
  const renderSeat = (slot) => {
    const isMe = slot.slotIndex === mySlot;
    const isTeammate = slot.team === myTeam && !isMe;
    const isOpponent = slot.team !== myTeam;

    const seatBg = isLight
      ? isMe
        ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(253, 230, 138, 0.7))'
        : isTeammate && slot.isOccupied
        ? 'linear-gradient(135deg, rgba(220, 252, 231, 0.95), rgba(187, 247, 208, 0.7))'
        : slot.isOccupied
        ? 'linear-gradient(135deg, rgba(254, 226, 226, 0.95), rgba(254, 202, 202, 0.7))'
        : 'rgba(245, 238, 220, 0.65)'
      : isMe
      ? 'linear-gradient(135deg, rgba(240, 203, 100, 0.22), rgba(20, 16, 10, 0.95))'
      : isTeammate && slot.isOccupied
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 12, 8, 0.95))'
      : slot.isOccupied
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(16, 12, 8, 0.95))'
      : 'rgba(0, 0, 0, 0.45)';

    const seatBorder = isLight
      ? isMe
        ? '2px solid #d97706'
        : isTeammate && slot.isOccupied
        ? '1.5px solid #16a34a'
        : slot.isOccupied
        ? '1.5px solid #dc2626'
        : '1.5px dashed #b45309'
      : isMe
      ? '2px solid var(--pharaoh-gold-bright)'
      : isTeammate && slot.isOccupied
      ? '1.5px solid #22c55e'
      : slot.isOccupied
      ? '1.5px solid rgba(239, 68, 68, 0.7)'
      : '1px dashed rgba(240, 203, 100, 0.35)';

    return (
      <div
        key={slot.slotIndex}
        style={{
          background: seatBg,
          border: seatBorder,
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          boxShadow: isMe
            ? isLight
              ? '0 3px 14px rgba(217, 119, 6, 0.25)'
              : '0 0 16px rgba(240, 203, 100, 0.35)'
            : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: slot.isHost
                ? isLight
                  ? 'rgba(217, 119, 6, 0.18)'
                  : 'rgba(240, 203, 100, 0.3)'
                : slot.isBot
                ? isLight
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'rgba(139, 92, 246, 0.25)'
                : slot.isOccupied
                ? isLight
                  ? 'rgba(22, 163, 74, 0.15)'
                  : 'rgba(34, 197, 94, 0.2)'
                : isLight
                ? 'rgba(0, 0, 0, 0.05)'
                : 'rgba(255, 255, 255, 0.05)',
              border: isLight ? '1.5px solid #d97706' : '1.5px solid var(--pharaoh-gold-royal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {slot.isHost ? (
              <CrownIcon size={18} color={isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'} />
            ) : slot.isBot ? (
              <BotIcon size={18} color={isLight ? '#6d28d9' : '#c4b5fd'} />
            ) : (
              <UserPlusIcon
                size={16}
                color={
                  slot.isOccupied
                    ? isLight
                      ? '#16a34a'
                      : '#4ade80'
                    : isLight
                    ? '#785f37'
                    : 'var(--pharaoh-text-muted)'
                }
              />
            )}
          </div>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 900,
                  color: slot.isOccupied
                    ? isLight
                      ? '#1c150c'
                      : '#fff'
                    : isLight
                    ? '#785f37'
                    : 'var(--pharaoh-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {slot.name}
              </span>
              {isMe && (
                <span
                  style={{
                    background: isLight ? '#fef3c7' : 'rgba(240, 203, 100, 0.3)',
                    border: isLight ? '1px solid #d97706' : '1px solid var(--pharaoh-gold-bright)',
                    color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)',
                    padding: '1px 7px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  أنت
                </span>
              )}
              {isTeammate && slot.isOccupied && (
                <span
                  style={{
                    background: isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.25)',
                    border: isLight ? '1px solid #16a34a' : '1px solid #22c55e',
                    color: isLight ? '#15803d' : '#4ade80',
                    padding: '1px 7px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  صاحبك في الفريق
                </span>
              )}
              {isOpponent && slot.isOccupied && (
                <span
                  style={{
                    background: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.25)',
                    border: isLight ? '1px solid #dc2626' : '1px solid #ef4444',
                    color: isLight ? '#b91c1c' : '#f87171',
                    padding: '1px 7px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  خصم
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color: isLight ? '#92400e' : 'var(--pharaoh-text-gold)',
                marginTop: 2,
                fontWeight: 700,
              }}
            >
              {slot.isOccupied ? (
                slot.isBot ? `ذكاء اصطناعي (${slot.botDifficulty || 'عادي'})` : isMe ? 'جاهز على الساحة' : 'متصل بالروم'
              ) : (
                'مقعد شاغر — مستني لاعب'
              )}
            </div>
          </div>
        </div>

        {/* Seat Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!isMe && (
            <button
              onClick={() => handleMoveToSeat(slot.slotIndex)}
              className="btn-pharaoh-stone"
              style={{
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                borderRadius: 6,
              }}
              title="انتقل واجلس في هذا المقعد"
            >
              <SwapArrowsIcon size={12} color="var(--pharaoh-gold-bright)" />
              <span>{slot.isOccupied ? 'تبديل مكانك' : 'اقعد هنا'}</span>
            </button>
          )}

          {isHost && (
            <>
              {!slot.isOccupied ? (
                <button
                  onClick={() => handleAddBot(slot.slotIndex)}
                  className="btn-pharaoh-gold"
                  style={{ padding: '6px 10px', fontSize: 11, fontWeight: 900, borderRadius: 6 }}
                  title="إضافة بوت ذكي في هذا المقعد"
                >
                  + بوت
                </button>
              ) : slot.isBot ? (
                <button
                  onClick={() => handleRemoveBot(slot.slotIndex)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    borderRadius: 6,
                    padding: '6px 9px',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="إزالة البوت"
                >
                  <TrashIcon size={12} color="#f87171" />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Sleek Top Bar: Room Code + Settings */}
      <div
        className="stone-panel"
        style={{
          padding: '14px 18px',
          border: isLight ? '1.5px solid var(--pharaoh-stone-border)' : '1.5px solid var(--pharaoh-gold-bright)',
          borderRadius: 12,
          background: isLight
            ? 'linear-gradient(180deg, rgba(255, 252, 245, 0.98), rgba(245, 238, 220, 0.98))'
            : 'linear-gradient(180deg, rgba(28, 22, 14, 0.98), rgba(15, 12, 8, 0.98))',
          boxShadow: isLight ? '0 4px 18px rgba(180, 83, 9, 0.12)' : '0 6px 24px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(240, 203, 100, 0.15)',
              border: isLight ? '1.5px solid #d97706' : '1.5px solid var(--pharaoh-gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SwordsCombatIcon size={20} color={isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)' }}>
              ساحة تحدي الفرق 2 ضد 2
            </div>
            <div style={{ fontSize: 11, color: isLight ? '#6b573a' : 'var(--pharaoh-text-gold)' }}>
              {settings.turnFlow === 'tag_sequential' ? 'نظام تعاقب الأدوار (دور ورا دور)' : 'نظام اللعب المشترك سوا لايف في نفس الدور'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Room Code Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.7)',
              border: isLight ? '1.5px solid #d97706' : '1.5px solid var(--pharaoh-gold-bright)',
              borderRadius: 20,
              padding: '6px 14px',
              boxShadow: isLight ? '0 2px 8px rgba(180, 83, 9, 0.1)' : 'none',
            }}
          >
            <span style={{ fontSize: 11, color: isLight ? '#785f37' : 'var(--pharaoh-text-gold)', fontWeight: 800 }}>كود الساحة:</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)', letterSpacing: 2, fontFamily: 'monospace' }}>
              #{status.roomCode || '....'}
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                background: 'none',
                border: 'none',
                color: copied ? (isLight ? '#16a34a' : '#4ade80') : (isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'),
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
              }}
              title="نسخ الكود لصاحبك"
            >
              {copied ? <CheckIcon size={14} color={isLight ? '#16a34a' : '#4ade80'} /> : <CopyIcon size={14} color={isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'} />}
            </button>
          </div>

          {/* Match Settings Button */}
          <button
            onClick={() => setShowSettingsModal((prev) => !prev)}
            className="btn-pharaoh-stone"
            style={{
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 20,
            }}
            title="تعديل شروط ونظام المعركة"
          >
            <SettingsIcon size={14} color={isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'} />
            <span>إعدادات الماتش</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Collapsible and clean) */}
      {showSettingsModal && (
        <div
          className="stone-panel"
          style={{
            padding: '14px 18px',
            border: isLight ? '1.5px solid var(--pharaoh-stone-border)' : '1px solid var(--pharaoh-gold-dark)',
            borderRadius: 10,
            background: isLight ? 'rgba(255, 252, 245, 0.98)' : 'rgba(12, 9, 6, 0.98)',
            boxShadow: isLight ? '0 4px 16px rgba(180, 83, 9, 0.12)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)' }}>
            قوانين ونظام المعركة:
          </div>

          {/* Tag Team Official Fair Laws */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: isLight ? 'rgba(254, 243, 199, 0.65)' : 'rgba(240, 203, 100, 0.08)',
              border: isLight ? '1px solid #d97706' : '1px solid rgba(240, 203, 100, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldIcon size={14} color={isLight ? '#b45309' : 'var(--pharaoh-gold-bright)'} />
              <span>قوانين المعركة الرسمية (2 ضد 2):</span>
            </div>
            <div style={{ fontSize: 11, color: isLight ? '#451a03' : 'var(--pharaoh-text-gold)', lineHeight: 1.5 }}>
              • <strong>دور موحد للفريق:</strong> دور واحد مشترك لفرقتكم، بتلعبوا سوا في نفس الدور لايف بدون إنهاء الدور بينكم، كل لاعب بينزل وحش وتنهوا الدور سوا للخصوم.
            </div>
            <div style={{ fontSize: 11, color: isLight ? '#451a03' : 'var(--pharaoh-text-gold)', lineHeight: 1.5 }}>
              • <strong>قانون الهجوم:</strong> ممنوع الهجوم في أول دور في الجيم بس (الدور 1 مقفول فيه الهجوم)، وبدايةً من الدور 2 (أول دور للخصم أو ليك) تقدروا تهاجموا عادي جداً!
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            {/* Mode selection */}
            <div style={{ background: isLight ? 'rgba(245, 238, 220, 0.7)' : 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: isLight ? '1px solid var(--pharaoh-stone-border)' : '1px solid rgba(240, 203, 100, 0.25)', gridColumn: isMobile ? '1' : '1 / -1' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)', marginBottom: 6 }}>
                نظام اللعب:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'coop_simultaneous', title: 'لعب مشترك لايف (مع صاحبك في نفس الدور)' },
                  { id: 'tag_sequential', title: 'تعاقب الأدوار (دور ورا دور بالتناوب)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ turnFlow: m.id })}
                    className={(settings.turnFlow || 'coop_simultaneous') === m.id ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ flex: 1, padding: '8px 10px', fontSize: 11, fontWeight: 900, borderRadius: 6 }}
                  >
                    {m.title}
                  </button>
                ))}
              </div>
            </div>

            {/* LP selection */}
            <div style={{ background: isLight ? 'rgba(245, 238, 220, 0.7)' : 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: isLight ? '1px solid var(--pharaoh-stone-border)' : '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: isLight ? '#92400e' : 'var(--pharaoh-text-gold)', marginBottom: 6 }}>
                نقاط الحياة (Life Points):
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[16000, 8000].map((lp) => (
                  <button
                    key={lp}
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ lifePoints: lp })}
                    className={Number(settings.lifePoints) === lp ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 900, borderRadius: 6 }}
                  >
                    {lp.toLocaleString()} LP {lp === 16000 ? '(مشترك)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Hand Visibility */}
            <div style={{ background: isLight ? 'rgba(245, 238, 220, 0.7)' : 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: isLight ? '1px solid var(--pharaoh-stone-border)' : '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: isLight ? '#92400e' : 'var(--pharaoh-text-gold)', marginBottom: 6 }}>
                رؤية كروت صاحبك:
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'visible', label: 'مكشوفة (تعاون كامل)' },
                  { id: 'hidden', label: 'سرية (مخفية)' },
                ].map((v) => (
                  <button
                    key={v.id}
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ teammateHandVisibility: v.id })}
                    className={(settings.teammateHandVisibility || 'visible') === v.id ? 'btn-pharaoh-gold' : 'btn-pharaoh-stone'}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 900, borderRadius: 6 }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Direct 2v2 Battle Arena Matchup (تحالفكم ضد تحالف الخصوم) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
          gap: 12,
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        {/* TEAM 0: تحالفكم (أنت وزميلك) */}
        <div
          className="stone-panel"
          style={{
            padding: '16px 14px',
            border: isLight ? '2px solid #16a34a' : '2px solid #22c55e',
            borderRadius: 12,
            background: isLight
              ? 'linear-gradient(180deg, rgba(220, 252, 231, 0.75), rgba(255, 252, 245, 0.98))'
              : 'linear-gradient(180deg, rgba(34, 197, 94, 0.12), var(--pharaoh-panel-bg))',
            boxShadow: isLight ? '0 4px 16px rgba(22, 163, 74, 0.15)' : '0 4px 20px rgba(34, 197, 94, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldIcon size={16} color={isLight ? '#16a34a' : '#4ade80'} />
              <span style={{ fontSize: 14, fontWeight: 900, color: isLight ? '#15803d' : '#4ade80' }}>
                تحالفكم (فريقك أنت وصاحبك)
              </span>
            </div>
            <span style={{ fontSize: 11, color: isLight ? '#15803d' : 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
              {settings.lifePoints} LP
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {team0.map((slot) => renderSeat(slot))}
          </div>
        </div>

        {/* VS Divider in Center */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: isMobile ? '4px 0' : '0 4px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isLight
                ? 'linear-gradient(135deg, #fef3c7, #fffcf5)'
                : 'linear-gradient(135deg, rgba(240, 203, 100, 0.3), var(--pharaoh-bg-deep))',
              border: isLight ? '2px solid #d97706' : '2px solid var(--pharaoh-gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)',
              fontSize: 13,
              fontWeight: 900,
              boxShadow: isLight ? '0 2px 10px rgba(180, 83, 9, 0.15)' : '0 0 15px rgba(240, 203, 100, 0.4)',
            }}
          >
            ضد
          </div>
        </div>

        {/* TEAM 1: تحالف الخصوم */}
        <div
          className="stone-panel"
          style={{
            padding: '16px 14px',
            border: isLight ? '2px solid #dc2626' : '2px solid #ef4444',
            borderRadius: 12,
            background: isLight
              ? 'linear-gradient(180deg, rgba(254, 226, 226, 0.75), rgba(255, 252, 245, 0.98))'
              : 'linear-gradient(180deg, rgba(239, 68, 68, 0.12), var(--pharaoh-panel-bg))',
            boxShadow: isLight ? '0 4px 16px rgba(220, 38, 38, 0.15)' : '0 4px 20px rgba(239, 68, 68, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SwordsCombatIcon size={16} color={isLight ? '#dc2626' : '#f87171'} />
              <span style={{ fontSize: 14, fontWeight: 900, color: isLight ? '#b91c1c' : '#f87171' }}>
                تحالف الخصوم (المنافسين)
              </span>
            </div>
            <span style={{ fontSize: 11, color: isLight ? '#b91c1c' : 'var(--pharaoh-gold-bright)', fontWeight: 800 }}>
              {settings.lifePoints} LP
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {team1.map((slot) => renderSeat(slot))}
          </div>
        </div>
      </div>

      {/* 3. Host Quick Action to Fill Bots if empty */}
      {isHost && slots.some((s) => !s.isOccupied) && (
        <button
          onClick={handleFillAllEmptyWithBots}
          className="btn-pharaoh-stone"
          style={{
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <BotIcon size={14} color="var(--pharaoh-gold-bright)" />
          <span>املأ الأماكن الفاضية ببوتات ذكاء اصطناعي لبدء الماتش فوراً</span>
        </button>
      )}

      {/* 4. Action Buttons Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {isHost ? (
          <button
            onClick={onStartDuel}
            className="btn-pharaoh-gold duel-btn-shine-wrap"
            style={{
              width: '100%',
              padding: '14px 0',
              fontSize: 16,
              fontWeight: 900,
              boxShadow: '0 4px 24px rgba(201, 158, 50, 0.55)',
              borderRadius: 8,
            }}
          >
            <span className="duel-btn-shine-sheen" />
            ادخل المعركة مع صحابك (2 ضد 2)
          </button>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '12px 14px',
              background: isLight ? 'rgba(255, 252, 245, 0.95)' : 'rgba(0, 0, 0, 0.45)',
              border: isLight ? '1.5px solid var(--pharaoh-stone-border)' : '1px solid rgba(240, 203, 100, 0.35)',
              borderRadius: 8,
              fontSize: 13,
              color: isLight ? '#92400e' : 'var(--pharaoh-gold-bright)',
              fontWeight: 800,
              boxShadow: isLight ? '0 2px 8px rgba(180, 83, 9, 0.08)' : 'none',
            }}
          >
            في انتظار صاحب الروم يبدأ الماتش...
          </div>
        )}

        <button
          onClick={onCancel}
          className="btn-pharaoh-stone"
          style={{ width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 800, borderRadius: 8 }}
        >
          خروج من الساحة
        </button>
      </div>
    </div>
  );
};

export default TagTeamLobbyView;
