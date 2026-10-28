import React, { useState, useMemo, useEffect } from 'react';
import { TitleScreen } from './ui/screens/TitleScreen.jsx';
import { DuelScreen } from './ui/screens/DuelScreen.jsx';
import { RockPaperScissorsScreen } from './ui/screens/RockPaperScissorsScreen.jsx';
import { DeckBuilderScreen } from './ui/screens/DeckBuilderScreen.jsx';
import { CardListScreen } from './ui/screens/CardListScreen.jsx';
import { MultiplayerScreen } from './ui/screens/MultiplayerScreen.jsx';
import { DuelEngine } from './game/engine/DuelEngine.js';
import { createPlayerState } from './game/engine/GameState.js';
import { drawCardForTurnPlayer } from './game/engine/PhaseManager.js';
import decksData from './data/decks.json';
import { getPharaohStarterDeck } from './data/defaultStarterDeck.js';
import { hasValidCardImage } from './game/utils/cardImageHelper.js';
import { AI_DIFFICULTIES } from './game/ai/AIPlayer.js';
import { installPharaohAlert } from './game/utils/AlertManager.js';
import { PharaohAlertModal } from './ui/components/PharaohAlertModal.jsx';

// Intercept standard window.alert globally with Egyptian Youth Pharaonic UI
installPharaohAlert();

class PharaohErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Pharaoh ErrorBoundary caught error:', error, errorInfo);
    if (typeof window !== 'undefined') {
      window.__lastPharaohError = error;
      window.__lastPharaohErrorInfo = errorInfo;
    }
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--pharaoh-bg-deep)',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            className="stone-panel"
            style={{
              padding: 28,
              maxWidth: 520,
              border: '2px solid var(--pharaoh-gold-bright)',
              borderRadius: 12,
            }}
          >
            <h2 style={{ color: 'var(--pharaoh-gold-bright)', marginBottom: 12, fontSize: 18, fontWeight: 900 }}>
              حصل هنج بسيط يا غالي
            </h2>
            <p style={{ color: 'var(--pharaoh-text-light)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              حصلت حركة غير متوقعة في الشاشة دي، ما تقلقش! ارجع لشاشة البداية وكمل لعبك عادي يا بطل.
            </p>
            {this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 16,
                  color: '#fca5a5',
                  fontSize: 11,
                  textAlign: 'left',
                  direction: 'ltr',
                  maxHeight: 140,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>{this.state.error.toString()}</div>
                {this.state.error.stack && (
                  <pre style={{ fontSize: 9, opacity: 0.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  if (this.props.onReset) this.props.onReset();
                }}
                className="btn-pharaoh-gold"
                style={{ padding: '10px 24px', fontSize: 13, fontWeight: 900 }}
              >
                ارجع لشاشة البداية
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="btn-pharaoh-stone"
                style={{ padding: '10px 16px', fontSize: 13, fontWeight: 800 }}
              >
                جرب تاني
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const loadActiveDeckFromStorage = () => {
  const saved = localStorage.getItem('yugioh_active_deck');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(hasValidCardImage);
        if (valid.length >= 40) return valid;
      }
    } catch (e) {
      // Fallback
    }
  }

  // Initialize with balanced 40-card Pharaoh Legendary Starter Deck on first launch
  const starter = getPharaohStarterDeck();
  if (starter && starter.length >= 40) {
    try {
      localStorage.setItem('yugioh_active_deck', JSON.stringify(starter));
      localStorage.setItem('yugioh_active_deck_name', 'مجموعة الفرعون الأسطورية');
    } catch (e) {}
    return starter;
  }
  return (decksData[0] || {}).mainDeck || [];
};

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState('title');
  const [playerDeckIndex, setPlayerDeckIndex] = useState(0);
  const [aiDifficulty, setAiDifficulty] = useState(() => {
    return localStorage.getItem('yugioh_ai_difficulty') || 'hard';
  });
  const [opponentDeckIndex, setOpponentDeckIndex] = useState(() => {
    const savedDiff = localStorage.getItem('yugioh_ai_difficulty') || 'hard';
    return AI_DIFFICULTIES[savedDiff]?.deckIndex ?? 2;
  });
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('yugioh_theme') || 'dark';
  });

  const [customDeckCards, setCustomDeckCards] = useState(() => loadActiveDeckFromStorage());
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerData, setMultiplayerData] = useState(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yugioh_theme', theme);
  }, [theme]);

  // Request native fullscreen on initial user touch/click gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen && !document.fullscreenElement) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen && !document.webkitFullscreenElement) {
        docEl.webkitRequestFullscreen();
      }
    };
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('click', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize DuelEngine
  const engine = useMemo(() => {
    if (isMultiplayer && multiplayerData) {
      const { isHost, seed, myName, peerName, startingPlayer, gameMode, slots, settings, myTeam } = multiplayerData;
      const isTag = gameMode === 'tag_2v2';

      if (isTag) {
        // 4-player deck assignments from curated decks
        const d0 = (decksData[0] || {}).mainDeck || [];
        const d1 = (decksData[1] || {}).mainDeck || [];
        const d2 = (decksData[2] || {}).mainDeck || [];
        const d3 = (decksData[3] || {}).mainDeck || [];

        const mySlot = typeof multiplayerData.mySlot === 'number' ? multiplayerData.mySlot : (isHost ? 0 : 1);
        const myTeam = typeof multiplayerData.myTeam === 'number' ? multiplayerData.myTeam : (mySlot < 2 ? 0 : 1);
        const isTeam0 = myTeam === 0;

        // Player's OWN deck is always p0Cards so they hold their cards at the bottom of screen
        const p0Cards = mySlot === 0 ? d0 : (mySlot === 1 ? d1 : (mySlot === 2 ? d2 : d3));
        const tmSlot = isTeam0 ? (mySlot === 0 ? 1 : 0) : (mySlot === 2 ? 3 : 2);
        const p0TmCards = tmSlot === 0 ? d0 : (tmSlot === 1 ? d1 : (tmSlot === 2 ? d2 : d3));

        const oppLeaderSlot = isTeam0 ? 2 : 0;
        const oppTmSlot = isTeam0 ? 3 : 1;
        const p1Cards = oppLeaderSlot === 2 ? d2 : d0;
        const p1TmCards = oppTmSlot === 3 ? d3 : d1;

        const p0Name = slots?.[mySlot]?.name || myName || 'أنت';
        const p0TmName = slots?.[tmSlot]?.name || (isHost ? 'الزميل' : 'المستضيف');
        const p1Name = slots?.[oppLeaderSlot]?.name || peerName || 'سيتو كايبا (بوت)';
        const p1TmName = slots?.[oppTmSlot]?.name || 'يامي ماريك (بوت)';

        const tagConfig = {
          p0TeammateDeck: p0TmCards,
          p1TeammateDeck: p1TmCards,
          p0TeammateName: p0TmName,
          p1TeammateName: p1TmName,
          settings: settings || { lifePoints: 16000, summonRule: 'per_player', graveyardShare: true, teammateHandVisibility: 'visible' },
        };

        const globalStartingTeam = startingPlayer ?? 0;
        const localStartingPlayer = isTeam0 ? globalStartingTeam : (1 - globalStartingTeam);

        const tagEngine = new DuelEngine(
          p0Cards,
          p1Cards,
          p0Name,
          p1Name,
          seed,
          localStartingPlayer,
          true,
          tagConfig
        );
        tagEngine.state.deviceTeam = isTeam0 ? 0 : 1;
        tagEngine.state.mySlot = mySlot;
        tagEngine.state.tagActiveSlot = 0;
        return tagEngine;
      }

      const myActiveDeck = (customDeckCards && customDeckCards.length >= 40)
        ? customDeckCards
        : loadActiveDeckFromStorage();

      // On BOTH Host and Client, p0 is the LOCAL player!
      const p0Cards = (myActiveDeck && myActiveDeck.length >= 40)
        ? myActiveDeck
        : ((decksData[0] || {}).mainDeck || []);

      const p1Cards = (decksData[1] || {}).mainDeck || [];

      const p0Name = myName || (isHost ? 'يوجي' : 'سيتو كايبا');
      const p1Name = peerName || (isHost ? 'سيتو كايبا' : 'يوجي');

      const p0Seed = isHost ? seed : (seed ? seed + 1 : undefined);
      const p1Seed = isHost ? (seed ? seed + 1 : undefined) : seed;

      const p0State = createPlayerState(0, p0Name, p0Cards, p0Seed);
      const p1State = createPlayerState(1, p1Name, p1Cards, p1Seed);

      // Determine local starting player:
      // In 1v1 multiplayer:
      // If startingPlayerRole is provided ('host' | 'client'):
      //   Host starts if role === 'host'
      //   Client starts if role === 'client'
      // If only startingPlayer index (0 or 1) is provided:
      //   0 means Host starts globally, 1 means Client starts globally.
      let hostStarts = true;
      if (multiplayerData?.startingPlayerRole) {
        hostStarts = (multiplayerData.startingPlayerRole === 'host');
      } else if (typeof startingPlayerIndex === 'number') {
        hostStarts = (startingPlayerIndex === 0);
      } else if (typeof startingPlayer === 'number') {
        hostStarts = (startingPlayer === 0);
      }

      const localStartingPlayer = (isHost === hostStarts) ? 0 : 1;

      const customEngine = new DuelEngine(p0Cards, p1Cards, p0Name, p1Name, undefined, localStartingPlayer);
      customEngine.state.isTagMode = false;
      customEngine.state.players = [p0State, p1State];
      customEngine.state.players[0].teammateName = '';
      customEngine.state.players[1].teammateName = '';
      customEngine.state.currentTurnPlayer = localStartingPlayer;
      customEngine.state.deviceTeam = isHost ? 0 : 1;
      customEngine.state.mySlot = isHost ? 0 : 1;

      // Draw initial card only if it's currently local player's turn (p0)
      if (localStartingPlayer === 0) {
        drawCardForTurnPlayer(customEngine.state);
      }
      customEngine.state.phase = 'MAIN1';

      return customEngine;
    }

    const activeDeck = (customDeckCards && customDeckCards.length >= 40)
      ? customDeckCards
      : loadActiveDeckFromStorage();

    const p0Cards = (activeDeck && activeDeck.length >= 40)
      ? activeDeck
      : (decksData[playerDeckIndex] || decksData[0]).mainDeck;

    const p1Cards = (decksData[opponentDeckIndex] || decksData[1]).mainDeck;
    const p0Name = (activeDeck && activeDeck.length >= 40)
      ? (localStorage.getItem('yugioh_active_deck_name') || 'المجموعة المخصصة')
      : (decksData[playerDeckIndex]?.name || 'يوجي');

    const p1Name = isMultiplayer
      ? 'المنافس عبر الشبكة'
      : (AI_DIFFICULTIES[aiDifficulty]?.name || decksData[opponentDeckIndex]?.name || 'سيتو كايبا');

    return new DuelEngine(p0Cards, p1Cards, p0Name, p1Name, undefined, startingPlayerIndex);
  }, [playerDeckIndex, opponentDeckIndex, aiDifficulty, customDeckCards, isMultiplayer, multiplayerData, startingPlayerIndex, currentScreen]);

  const handleStartSoloDuel = (chosenDifficulty) => {
    const freshDeck = loadActiveDeckFromStorage();
    if (!freshDeck || freshDeck.length < 40) {
      alert(`عذراً يا بطل! مجموعتك تحتوي على ${freshDeck ? freshDeck.length : 0} بطاقة فقط.\nالحد الأدنى الرسمي للمجموعة هو 40 بطاقة لبدء المبارزة!\nيرجى إكمال مجموعتك في صانع المجموعات أولاً.`);
      setCurrentScreen('decks');
      return;
    }
    setCustomDeckCards(freshDeck);
    const diff = chosenDifficulty || aiDifficulty;
    setAiDifficulty(diff);
    localStorage.setItem('yugioh_ai_difficulty', diff);
    const targetDeckIdx = AI_DIFFICULTIES[diff]?.deckIndex ?? 2;
    setOpponentDeckIndex(targetDeckIdx);
    setIsMultiplayer(false);
    setMultiplayerData(null);
    setCurrentScreen('janken');
  };

  const handleSelectAiDifficulty = (diff) => {
    setAiDifficulty(diff);
    localStorage.setItem('yugioh_ai_difficulty', diff);
    const targetDeckIdx = AI_DIFFICULTIES[diff]?.deckIndex ?? 2;
    setOpponentDeckIndex(targetDeckIdx);
  };

  const handleStartMultiplayerDuel = (data) => {
    const freshDeck = loadActiveDeckFromStorage();
    if (!freshDeck || freshDeck.length < 40) {
      alert(`عذراً يا بطل! مجموعتك تحتوي على ${freshDeck ? freshDeck.length : 0} بطاقة فقط.\nالحد الأدنى الرسمي للمجموعة هو 40 بطاقة للمبارزة!\nيرجى إكمال مجموعتك في صانع المجموعات أولاً.`);
      setCurrentScreen('decks');
      return;
    }
    setIsMultiplayer(true);
    setMultiplayerData(data);
    setStartingPlayerIndex(data?.startingPlayer ?? 0);
    // In 1v1 multiplayer, if turnOrderMethod is 'janken' (the official duel ritual), route to Janken screen!
    if (data?.gameMode !== 'tag_2v2' && (data?.turnOrderMethod === 'janken' || !data?.turnOrderMethod)) {
      setCurrentScreen('janken');
    } else {
      setCurrentScreen('duel');
    }
  };

  return (
    <div data-theme={theme} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <PharaohErrorBoundary onReset={() => setCurrentScreen('title')}>
        {currentScreen === 'title' && (
        <TitleScreen
          onStartDuel={handleStartSoloDuel}
          onOpenMultiplayer={() => setCurrentScreen('multiplayer')}
          onOpenDeckBuilder={() => setCurrentScreen('decks')}
          onOpenCardCatalog={() => setCurrentScreen('cards')}
          theme={theme}
          onToggleTheme={toggleTheme}
          aiDifficulty={aiDifficulty}
          onSelectAiDifficulty={handleSelectAiDifficulty}
        />
      )}

      {currentScreen === 'janken' && (
        <RockPaperScissorsScreen
          isMultiplayer={isMultiplayer}
          multiplayerData={multiplayerData}
          playerDeckName={
            isMultiplayer
              ? (multiplayerData?.myName || 'أنت')
              : (((customDeckCards && customDeckCards.length >= 40) || loadActiveDeckFromStorage())
                ? (localStorage.getItem('yugioh_active_deck_name') || 'المجموعة المخصصة')
                : (decksData[playerDeckIndex]?.name || 'يوجي'))
          }
          opponentName={
            isMultiplayer
              ? (multiplayerData?.peerName || 'المنافس')
              : (AI_DIFFICULTIES[aiDifficulty]?.name || decksData[opponentDeckIndex]?.name || 'سيتو كايبا')
          }
          onComplete={({ startingPlayer, startingPlayerRole }) => {
            const finalStartPlayer = startingPlayer !== undefined ? startingPlayer : 0;
            const finalRole = startingPlayerRole || (isMultiplayer ? (finalStartPlayer === 0 ? (multiplayerData?.isHost ? 'host' : 'client') : (multiplayerData?.isHost ? 'client' : 'host')) : null);
            setStartingPlayerIndex(finalStartPlayer);
            if (isMultiplayer && multiplayerData) {
              setMultiplayerData((prev) => ({
                ...prev,
                startingPlayer: finalStartPlayer,
                startingPlayerRole: finalRole,
              }));
            }
            setCurrentScreen('duel');
          }}
          onCancel={() => {
            if (isMultiplayer) {
              connectionManager.cancel();
              setIsMultiplayer(false);
              setMultiplayerData(null);
              setCurrentScreen('multiplayer');
            } else {
              setCurrentScreen('title');
            }
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentScreen === 'duel' && (
        <DuelScreen
          engine={engine}
          onExit={() => {
            setIsMultiplayer(false);
            setMultiplayerData(null);
            setCurrentScreen('title');
          }}
          onRestartDuel={() => {
            if (!isMultiplayer) {
              handleStartSoloDuel(aiDifficulty);
            } else {
              setCurrentScreen('title');
            }
          }}
          isAiDuel={!isMultiplayer || (isMultiplayer && multiplayerData?.gameMode === 'tag_2v2' && (multiplayerData?.slots?.[2]?.isBot || multiplayerData?.slots?.[3]?.isBot))}
          aiDifficulty={aiDifficulty}
          onSelectAiDifficulty={setAiDifficulty}
          isMultiplayer={isMultiplayer}
          multiplayerData={multiplayerData}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentScreen === 'decks' && (
        <DeckBuilderScreen
          onBack={() => {
            const fresh = loadActiveDeckFromStorage();
            if (fresh && fresh.length >= 40) {
              setCustomDeckCards(fresh);
            }
            setCurrentScreen('title');
          }}
          selectedDeckIndex={playerDeckIndex}
          onSelectDeck={(idx) => {
            setPlayerDeckIndex(idx);
          }}
          onSaveCustomDeck={(cards) => {
            setCustomDeckCards(cards);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentScreen === 'cards' && (
        <CardListScreen
          onBack={() => setCurrentScreen('title')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentScreen === 'multiplayer' && (
        <MultiplayerScreen
          onBack={() => setCurrentScreen('title')}
          onStartDuel={handleStartMultiplayerDuel}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Global Pharaonic Egyptian Youth Alert Dialog */}
      <PharaohAlertModal />
      </PharaohErrorBoundary>
    </div>
  );
};

export default App;
