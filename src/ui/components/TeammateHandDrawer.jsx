import React, { useState } from 'react';
import { getCardImageUrl } from '../../game/utils/cardImageHelper.js';
import soundManager from '../../game/audio/SoundManager.js';
import hapticManager from '../../game/utils/HapticManager.js';

/* Executive Minimal SVG Icons (Zero Emojis) */
const CloseIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeEyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SwapHandsIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const PingBellIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SwordIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
  </svg>
);

const ShieldIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const QUICK_PINGS = [
  { id: 'attack', text: 'اضرب بالوحش ده يا كبير!', icon: SwordIcon, color: '#f59e0b' },
  { id: 'protect', text: 'احميني بكارت دفاعي سريع!', icon: ShieldIcon, color: '#3b82f6' },
  { id: 'spell', text: 'شغّل سحرك وفاجئهم دلوقتي!', icon: ZapIcon, color: '#10b981' },
  { id: 'tribute', text: 'سيب الوحش ده معايا علشان أضحي بيه', icon: SwordIcon, color: '#ec4899' },
  { id: 'hold', text: 'شيل فخك وماترميهوش، محتاجينه الدور الجاي', icon: ShieldIcon, color: '#8b5cf6' },
];

export const TeammateHandDrawer = ({
  isOpen,
  onClose,
  teammateName = 'الزميل',
  teammateHand = [],
  isMyTeamTurn = false,
  canPlayActions = true,
  handVisibility = 'visible',
  onSummonFromTeammate,
  onSetFromTeammate,
  onActivateSpellFromTeammate,
  onSwapHands,
  onSendPing,
  onInspectCard,
}) => {
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const [pingSentText, setPingSentText] = useState(null);

  if (!isOpen) return null;

  const isHidden = handVisibility === 'hidden';
  const selectedCard = selectedCardIdx !== null ? teammateHand[selectedCardIdx] : null;

  const handlePingClick = (pingText) => {
    soundManager.play('click');
    hapticManager.triggerCombatVibration('click');
    if (onSendPing) {
      onSendPing('TACTICAL_CALL', pingText);
    }
    setPingSentText(pingText);
    setTimeout(() => setPingSentText(null), 2200);
  };

  const handleCardClick = (idx, card) => {
    soundManager.play('cardFlip');
    hapticManager.triggerCombatVibration('click');
    setSelectedCardIdx(idx);
    if (!isHidden && onInspectCard) {
      onInspectCard(card);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(5, 4, 3, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="stone-panel"
        style={{
          width: '100%',
          maxHeight: '82vh',
          background: 'linear-gradient(180deg, var(--pharaoh-panel-bg) 0%, var(--pharaoh-stone-card) 100%)',
          borderTop: '2px solid var(--pharaoh-gold-bright)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(240, 203, 100, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid rgba(240, 203, 100, 0.25)',
            background: 'var(--pharaoh-slot-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(240, 203, 100, 0.15)',
                border: '1.5px solid var(--pharaoh-gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EyeEyeIcon size={18} color="var(--pharaoh-gold-bright)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                  يد زميلك: {teammateName}
                </span>
                <span
                  style={{
                    background: 'rgba(240, 203, 100, 0.18)',
                    color: 'var(--pharaoh-gold-bright)',
                    border: '1px solid var(--pharaoh-gold-dark)',
                    borderRadius: 10,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {teammateHand.length} كروت
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)', marginTop: 2 }}>
                {isMyTeamTurn ? 'دور فرقتكم دلوقتي — نسق والعب بكروت زميلك يا بطل' : 'دور فرقة الخصم — خلي عينك صاحية ومستعد للدفاع'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onSwapHands && isMyTeamTurn && (
              <button
                onClick={() => {
                  soundManager.play('click');
                  hapticManager.triggerCombatVibration('click');
                  onSwapHands();
                  onClose();
                }}
                className="btn-pharaoh-gold"
                style={{
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title="نقل يد الزميل إلى الشريط الرئيسي أسفل الشاشة للعب بها مباشرة"
              >
                <SwapHandsIcon size={14} color="#1c140a" />
                هات كروته في إيدي
              </button>
            )}

            <button
              onClick={() => {
                soundManager.play('click');
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* Quick Tactical Pings Bar */}
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(10, 8, 5, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--pharaoh-text-gold)', whiteSpace: 'nowrap' }}>
            إشارات سريعة:
          </span>
          {QUICK_PINGS.map((ping) => {
            const Icon = ping.icon;
            return (
              <button
                key={ping.id}
                onClick={() => handlePingClick(ping.text)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${ping.color}55`,
                  borderRadius: 14,
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                <Icon size={12} color={ping.color} />
                {ping.text}
              </button>
            );
          })}
        </div>

        {/* Ping Sent Alert Banner */}
        {pingSentText && (
          <div
            style={{
              padding: '6px 14px',
              background: 'rgba(16, 185, 129, 0.2)',
              borderBottom: '1px solid #10b981',
              color: '#6ee7b7',
              fontSize: 12,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            تم إرسال الإشارة للزميل: "{pingSentText}"
          </div>
        )}

        {/* Secret Hand Notice Banner when hidden */}
        {isHidden && (
          <div
            style={{
              padding: '7px 14px',
              background: 'rgba(239, 68, 68, 0.14)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: 11.5,
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <ShieldIcon size={14} color="#fca5a5" />
            <span>قوانين الروم: كروت زميلك سرية ومحجوبة — نسقوا الخطط بالإشارات السريعة!</span>
          </div>
        )}

        {/* Cards Carousel Area */}
        <div
          style={{
            padding: '16px 14px 10px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            gap: 12,
            minHeight: 180,
          }}
        >
          {teammateHand.length === 0 ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pharaoh-text-muted)',
                fontSize: 13,
                fontStyle: 'italic',
                padding: '30px 0',
              }}
            >
              يد زميلك مفيهاش كروت دلوقتي يا بطل.
            </div>
          ) : (
            teammateHand.map((card, idx) => {
              const isSelected = selectedCardIdx === idx;
              const isMonster = !isHidden && card.type === 'monster';
              return (
                <div
                  key={card.id ? `${card.id}_${idx}` : idx}
                  onClick={() => handleCardClick(idx, card)}
                  style={{
                    flexShrink: 0,
                    width: 105,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    transform: isSelected ? 'translateY(-6px) scale(1.04)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 95,
                      height: 138,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: isSelected ? '2px solid var(--pharaoh-gold-bright)' : '1px solid rgba(240, 203, 100, 0.3)',
                      boxShadow: isSelected ? '0 0 16px rgba(240, 203, 100, 0.6)' : '0 4px 10px rgba(0,0,0,0.5)',
                      position: 'relative',
                      background: '#15100a',
                    }}
                  >
                    <img
                      src={isHidden ? '/assets/card_back.png' : getCardImageUrl(card)}
                      alt={isHidden ? `بطاقة سرية #${idx + 1}` : card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/assets/card_back.png';
                      }}
                    />
                    {isMonster && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          insetInline: 0,
                          background: 'rgba(0,0,0,0.85)',
                          padding: '2px 4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 9,
                          fontWeight: 900,
                          color: '#fff',
                        }}
                      >
                        <span style={{ color: '#fbbf24' }}>{card.atk ?? 0}</span>
                        <span style={{ color: '#60a5fa' }}>{card.def ?? 0}</span>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isSelected ? 'var(--pharaoh-gold-bright)' : 'var(--pharaoh-text-light)',
                      textAlign: 'center',
                      marginTop: 6,
                      lineHeight: 1.25,
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isHidden ? `بطاقة سرية #${idx + 1}` : card.name}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Card Action Controls Drawer Footer */}
        {selectedCard && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(240, 203, 100, 0.25)',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {isHidden ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                    بطاقة سرية #{selectedCardIdx + 1}
                  </span>
                  <span style={{ fontSize: 11, color: '#fca5a5', fontWeight: 800 }}>
                    [مخفية بناءً على قوانين الروم]
                  </span>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--pharaoh-text-muted)', margin: 0 }}>
                  هذه البطاقة محجوبة عنك. يمكنك توجيه إشارة تكتيكية سريعة لزميلك لاستخدامها في الوقت المناسب.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--pharaoh-gold-bright)' }}>
                      {selectedCard.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--pharaoh-text-gold)', marginInlineStart: 8 }}>
                      [{selectedCard.type === 'monster' ? `وحش • مستوى ${selectedCard.level || 4}` : selectedCard.type === 'spell' ? 'سحر' : 'فخ'}]
                    </span>
                  </div>
                  <button
                    onClick={() => onInspectCard && onInspectCard(selectedCard)}
                    className="btn-pharaoh-stone"
                    style={{ padding: '4px 10px', fontSize: 11, fontWeight: 800 }}
                  >
                    تفاصيل الكارت
                  </button>
                </div>

                {selectedCard.description && (
                  <p
                    style={{
                      fontSize: 11.5,
                      color: 'var(--pharaoh-text-light)',
                      margin: 0,
                      lineHeight: 1.4,
                      maxHeight: 38,
                      overflowY: 'auto',
                    }}
                  >
                    {selectedCard.description}
                  </p>
                )}
              </>
            )}

            {!isHidden && isMyTeamTurn && canPlayActions && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {selectedCard.type === 'monster' ? (
                  <>
                    <button
                      onClick={() => {
                        if (onSummonFromTeammate) {
                          onSummonFromTeammate(selectedCardIdx, 'face_up_attack');
                          onClose();
                        }
                      }}
                      className="btn-pharaoh-gold"
                      style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900 }}
                    >
                      انزل هجوم (ATK)
                    </button>
                    <button
                      onClick={() => {
                        if (onSetFromTeammate) {
                          onSetFromTeammate(selectedCardIdx);
                          onClose();
                        }
                      }}
                      className="btn-pharaoh-stone"
                      style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900 }}
                    >
                      انزل دفاع مقلوب (DEF)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (onActivateSpellFromTeammate) {
                          onActivateSpellFromTeammate(selectedCardIdx);
                          onClose();
                        }
                      }}
                      className="btn-pharaoh-gold"
                      style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900 }}
                    >
                      شغل السحر دلوقتي!
                    </button>
                    <button
                      onClick={() => {
                        if (onSetFromTeammate) {
                          onSetFromTeammate(selectedCardIdx);
                          onClose();
                        }
                      }}
                      className="btn-pharaoh-stone"
                      style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 900 }}
                    >
                      ثبّت الكارت مقلوب
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

export default TeammateHandDrawer;
