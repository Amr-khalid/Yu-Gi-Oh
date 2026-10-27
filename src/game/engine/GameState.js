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

export function createInitialGameState(
  p0Deck,
  p1Deck,
  p0Name = 'يوجي',
  p1Name = 'سيتو كايبا',
  seed,
  startingPlayer = 0,
  isTagMode = false,
  tagConfig = null
) {
  const p0 = createPlayerState(0, p0Name, p0Deck, seed ? seed : undefined);
  const p1 = createPlayerState(1, p1Name, p1Deck, seed ? seed + 1 : undefined);

  if (isTagMode && tagConfig) {
    const tmSeed0 = seed ? seed + 2 : undefined;
    const tmSeed1 = seed ? seed + 3 : undefined;
    const p0TmDeck = tagConfig.p0TeammateDeck || p0Deck;
    const p1TmDeck = tagConfig.p1TeammateDeck || p1Deck;
    const p0TmName = tagConfig.p0TeammateName || 'الزميل (الفريق الذهبي)';
    const p1TmName = tagConfig.p1TeammateName || 'المنافس الثاني (الفريق الفضي)';

    const p0Tm = createPlayerState(0, p0TmName, p0TmDeck, tmSeed0);
    const p1Tm = createPlayerState(1, p1TmName, p1TmDeck, tmSeed1);

    const initialLP = Number(tagConfig.settings?.lifePoints) || 16000;
    p0.lifePoints = initialLP;
    p1.lifePoints = initialLP;

    p0.normalSummonsRemaining = 2;
    p1.normalSummonsRemaining = 2;

    p0.teammateDeck = p0Tm.deck;
    p0.teammateHand = p0Tm.hand;
    p0.teammateName = p0TmName;
    p0.activeHandType = 'mine';

    p1.teammateDeck = p1Tm.deck;
    p1.teammateHand = p1Tm.hand;
    p1.teammateName = p1TmName;
    p1.activeHandType = 'mine';
  }

  return {
    turnNumber: 1,
    currentTurnPlayer: startingPlayer,
    phase: 'DRAW',
    isTagMode: !!isTagMode,
    tagSettings: tagConfig?.settings || null,
    players: [p0, p1],
    activeFieldSpell: null,
    chainStack: [],
    winner: null,
    turnFlow: tagConfig?.settings?.turnFlow || 'coop_simultaneous',
    tagActiveSlot: 0,
    lastLog: [
      isTagMode
        ? `بدأت معركة الفرق الملكية الكبرى 2v2 بين تحالف [${p0Name} و ${p0.teammateName || 'الزميل'}] ضد تحالف [${p1Name} و ${p1.teammateName || 'الخصم'}]!`
        : `بدأت المعركة الأسطورية بين ${p0Name} و ${p1Name}`
    ],
  };
}

export function cloneGameState(state) {
  return {
    turnNumber: state.turnNumber,
    currentTurnPlayer: state.currentTurnPlayer,
    phase: state.phase,
    isTagMode: !!state.isTagMode,
    tagSettings: state.tagSettings ? { ...state.tagSettings } : null,
    turnFlow: state.turnFlow || 'coop_simultaneous',
    tagActiveSlot: typeof state.tagActiveSlot === 'number' ? state.tagActiveSlot : 0,
    activeFieldSpell: state.activeFieldSpell ? { ...state.activeFieldSpell } : null,
    winner: state.winner,
    winReason: state.winReason,
    chainStack: state.chainStack.map((link) => ({ ...link })),
    lastLog: [...state.lastLog],
    players: [
      {
        ...state.players[0],
        deck: [...state.players[0].deck],
        hand: [...state.players[0].hand],
        teammateDeck: state.players[0].teammateDeck ? [...state.players[0].teammateDeck] : [],
        teammateHand: state.players[0].teammateHand ? [...state.players[0].teammateHand] : [],
        teammateName: state.players[0].teammateName || '',
        activeHandType: state.players[0].activeHandType || 'mine',
        monsterZones: state.players[0].monsterZones.map((m) => (m ? { ...m } : null)),
        spellTrapZones: state.players[0].spellTrapZones.map((s) => (s ? { ...s } : null)),
        graveyard: [...state.players[0].graveyard],
        banished: [...state.players[0].banished],
        extraDeck: [...state.players[0].extraDeck],
      },
      {
        ...state.players[1],
        deck: [...state.players[1].deck],
        hand: [...state.players[1].hand],
        teammateDeck: state.players[1].teammateDeck ? [...state.players[1].teammateDeck] : [],
        teammateHand: state.players[1].teammateHand ? [...state.players[1].teammateHand] : [],
        teammateName: state.players[1].teammateName || '',
        activeHandType: state.players[1].activeHandType || 'mine',
        monsterZones: state.players[1].monsterZones.map((m) => (m ? { ...m } : null)),
        spellTrapZones: state.players[1].spellTrapZones.map((s) => (s ? { ...s } : null)),
        graveyard: [...state.players[1].graveyard],
        banished: [...state.players[1].banished],
        extraDeck: [...state.players[1].extraDeck],
      },
    ],
  };
}
