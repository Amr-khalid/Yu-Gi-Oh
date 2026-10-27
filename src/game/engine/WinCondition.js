/**
 * WinCondition.js
 * Pure JavaScript win conditions checker
 */

const EXODIA_CARD_CODES = [4023, 4024, 4025, 4026, 4027];
const EXODIA_NAMES = [
  'exodia the forbidden one',
  'right arm of the forbidden one',
  'left arm of the forbidden one',
  'right leg of the forbidden one',
  'left leg of the forbidden one',
];

export function checkWinConditions(state) {
  if (state.winner !== null) return state;

  const [p0, p1] = state.players;

  // Life points zero check
  if (p0.lifePoints <= 0 && p1.lifePoints <= 0) {
    state.winner = -1;
    state.winReason = 'LP_ZERO';
    state.lastLog.push('تعادل! نقاط حياة الاتنين وصلت لصفر.');
    return state;
  }
  if (p0.lifePoints <= 0) {
    state.winner = 1;
    state.winReason = 'LP_ZERO';
    state.lastLog.push(`فاز ${p1.name} بعد ما صفّر نقاط حياة ${p0.name}.`);
    return state;
  }
  if (p1.lifePoints <= 0) {
    state.winner = 0;
    state.winReason = 'LP_ZERO';
    state.lastLog.push(`فاز ${p0.name} بعد ما صفّر نقاط حياة ${p1.name}.`);
    return state;
  }

  // Exodia instantaneous win
  for (let pIdx = 0; pIdx < 2; pIdx++) {
    const player = state.players[pIdx];
    const handCardCodes = player.hand.map(c => c.cardCode);
    const handCardNames = player.hand.map(c => (c.name || '').toLowerCase().trim());
    const hasByCode = EXODIA_CARD_CODES.every(code => handCardCodes.includes(code));
    const hasByName = EXODIA_NAMES.every(piece => handCardNames.some(hn => hn.includes(piece)));

    if (hasByCode || hasByName) {
      state.winner = pIdx;
      state.winReason = 'EXODIA';
      state.lastLog.push(`كل قطع إكسوديا الخمسة اتجمعت في الإيد! فاز ${player.name} بالماتش فوراً!`);
      return state;
    }
  }

  return state;
}
