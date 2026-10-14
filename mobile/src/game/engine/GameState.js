/**
 * GameState.js
 * Pure JavaScript game state initialization and clone management
 */

export function shuffleDeck(array, seed) {
  const result = [...array];
  let m = result.length;
  let t;
  let i;

  let random = Math.random;
  if (seed !== undefined) {
    let s = seed;
    random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  while (m) {
    i = Math.floor(random() * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }

  return result;
}

export function createPlayerState(id, name, rawDeck, seed) {
  const shuffled = shuffleDeck(rawDeck, seed);
  const startingHand = shuffled.slice(0, 5);
  const remainingDeck = shuffled.slice(5);

  return {
    id,
    name,
    lifePoints: 8000,
    deck: remainingDeck,
    hand: startingHand,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
    normalSummonsRemaining: 1,
  };
}

export function createInitialGameState(p0Deck, p1Deck, p0Name = 'يوجي', p1Name = 'سيتو كايبا', seed, startingPlayer = 0) {
  const p0 = createPlayerState(0, p0Name, p0Deck, seed ? seed : undefined);
  const p1 = createPlayerState(1, p1Name, p1Deck, seed ? seed + 1 : undefined);

  return {
    turnNumber: 1,
    currentTurnPlayer: startingPlayer,
    phase: 'DRAW',
    players: [p0, p1],
    activeFieldSpell: null,
    chainStack: [],
    winner: null,
    lastLog: [`بدأت المعركة الأسطورية بين ${p0Name} و ${p1Name}`],
  };
}

export function cloneGameState(state) {
  return {
    turnNumber: state.turnNumber,
    currentTurnPlayer: state.currentTurnPlayer,
    phase: state.phase,
    activeFieldSpell: state.activeFieldSpell ? { ...state.activeFieldSpell } : null,
    winner: state.winner,
    winReason: state.winReason,
    chainStack: state.chainStack.map(link => ({ ...link })),
    lastLog: [...state.lastLog],
    players: [
      {
        ...state.players[0],
        deck: [...state.players[0].deck],
        hand: [...state.players[0].hand],
        monsterZones: state.players[0].monsterZones.map(m => (m ? { ...m } : null)),
        spellTrapZones: state.players[0].spellTrapZones.map(s => (s ? { ...s } : null)),
        graveyard: [...state.players[0].graveyard],
        banished: [...state.players[0].banished],
        extraDeck: [...state.players[0].extraDeck],
      },
      {
        ...state.players[1],
        deck: [...state.players[1].deck],
        hand: [...state.players[1].hand],
        monsterZones: state.players[1].monsterZones.map(m => (m ? { ...m } : null)),
        spellTrapZones: state.players[1].spellTrapZones.map(s => (s ? { ...s } : null)),
        graveyard: [...state.players[1].graveyard],
        banished: [...state.players[1].banished],
        extraDeck: [...state.players[1].extraDeck],
      },
    ],
  };
}
