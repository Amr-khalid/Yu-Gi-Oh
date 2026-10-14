/**
 * WinCondition.js
 * Pure JavaScript win conditions checker
 */

const EXODIA_CARD_CODES = [4027, 4028, 4029, 4030, 4031];

export function checkWinConditions(state) {
  if (state.winner !== null) return state;

  const [p0, p1] = state.players;

  // Life points zero check
  if (p0.lifePoints <= 0 && p1.lifePoints <= 0) {
    state.winner = -1;
    state.winReason = 'LP_ZERO';
    state.lastLog.push('تعادل! وصل كلا المبارزين إلى صفر نقطة حياة.');
    return state;
  }
  if (p0.lifePoints <= 0) {
    state.winner = 1;
    state.winReason = 'LP_ZERO';
    state.lastLog.push(`انتصار ${p1.name} بعد تصفير نقاط حياة ${p0.name}.`);
    return state;
  }
  if (p1.lifePoints <= 0) {
    state.winner = 0;
    state.winReason = 'LP_ZERO';
    state.lastLog.push(`انتصار ${p0.name} بعد تصفير نقاط حياة ${p1.name}.`);
    return state;
  }

  // Exodia instantaneous win
  for (let pIdx = 0; pIdx < 2; pIdx++) {
    const player = state.players[pIdx];
    const handCardCodes = player.hand.map(c => c.cardCode);
    const hasAllExodia = EXODIA_CARD_CODES.every(code => handCardCodes.includes(code));

    if (hasAllExodia) {
      state.winner = pIdx;
      state.winReason = 'EXODIA';
      state.lastLog.push(`اكتمل استدعاء إكسوديا المنبوذ! فاز ${player.name} بالمعركة فوراً!`);
      return state;
    }
  }

  return state;
}
