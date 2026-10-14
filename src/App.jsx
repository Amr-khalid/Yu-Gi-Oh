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

class PharaohErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Pharaoh ErrorBoundary caught error:', error, errorInfo);
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
              maxWidth: 480,
              border: '2px solid var(--pharaoh-gold-bright)',
              borderRadius: 12,
            }}
          >
            <h2 style={{ color: 'var(--pharaoh-gold-bright)', marginBottom: 12, fontSize: 18, fontWeight: 900 }}>
              تنبيه اللوحة الملكية
            </h2>
            <p style={{ color: 'var(--pharaoh-text-light)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              حدثت مشكلة غير متوقعة أثناء عرض الشاشة، يمكنك الرجوع لشاشة البداية ومتابعة اللعب بأمان.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onReset) this.props.onReset();
              }}
              className="btn-pharaoh-gold"
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 900 }}
            >
              الرجوع لشاشة البداية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState('title');
  const [playerDeckIndex, setPlayerDeckIndex] = useState(0);
  const [opponentDeckIndex, setOpponentDeckIndex] = useState(1);
  const [startingPlayerIndex, setStartingPlayerIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('yugioh_theme') || 'dark';
  });

  const [customDeckCards, setCustomDeckCards] = useState(() => {
    const saved = localStorage.getItem('yugioh_active_deck');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerData, setMultiplayerData] = useState(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yugioh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize DuelEngine
  const engine = useMemo(() => {
    if (isMultiplayer && multiplayerData) {
      const { isHost, seed, myName, peerName, startingPlayer } = multiplayerData;
      const hostCards = (decksData[0] || {}).mainDeck || [];
      const clientCards = (decksData[1] || {}).mainDeck || [];

      const p0Cards = isHost ? hostCards : clientCards;
      const p1Cards = isHost ? clientCards : hostCards;
      const p0Name = myName || (isHost ? 'يوجي' : 'سيتو كايبا');
      const p1Name = peerName || (isHost ? 'سيتو كايبا' : 'يوجي');

      const p0Seed = isHost ? seed : (seed ? seed + 1 : undefined);
      const p1Seed = isHost ? (seed ? seed + 1 : undefined) : seed;

      const p0State = createPlayerState(0, p0Name, p0Cards, p0Seed);
      const p1State = createPlayerState(1, p1Name, p1Cards, p1Seed);

      const customEngine = new DuelEngine(p0Cards, p1Cards, p0Name, p1Name, undefined, startingPlayer);
      customEngine.state.players = [p0State, p1State];
      customEngine.state.currentTurnPlayer = startingPlayer;
      drawCardForTurnPlayer(customEngine.state);
      customEngine.state.phase = 'MAIN1';

      return customEngine;
    }

    const p0Cards = (customDeckCards && customDeckCards.length >= 20)
      ? customDeckCards
      : (decksData[playerDeckIndex] || decksData[0]).mainDeck;

    const p1Cards = (decksData[opponentDeckIndex] || decksData[1]).mainDeck;
    const p0Name = (customDeckCards && customDeckCards.length >= 20)
      ? (localStorage.getItem('yugioh_active_deck_name') || 'المجموعة المخصصة')
      : (decksData[playerDeckIndex]?.name || 'يوجي');

    const p1Name = isMultiplayer ? 'المنافس عبر الشبكة' : (decksData[opponentDeckIndex]?.name || 'سيتو كايبا');

    return new DuelEngine(p0Cards, p1Cards, p0Name, p1Name, undefined, startingPlayerIndex);
  }, [playerDeckIndex, opponentDeckIndex, customDeckCards, isMultiplayer, multiplayerData, startingPlayerIndex, currentScreen]);

  const handleStartSoloDuel = () => {
    setIsMultiplayer(false);
    setMultiplayerData(null);
    setCurrentScreen('janken');
  };

  const handleStartMultiplayerDuel = (data) => {
    setIsMultiplayer(true);
    setMultiplayerData(data);
    setCurrentScreen('janken');
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
        />
      )}

      {currentScreen === 'janken' && (
        <RockPaperScissorsScreen
          isMultiplayer={isMultiplayer}
          multiplayerData={multiplayerData}
          playerDeckName={
            isMultiplayer
              ? (multiplayerData?.myName || 'أنت')
              : ((customDeckCards && customDeckCards.length >= 20)
                ? (localStorage.getItem('yugioh_active_deck_name') || 'المجموعة المخصصة')
                : (decksData[playerDeckIndex]?.name || 'يوجي'))
          }
          opponentName={
            isMultiplayer
              ? (multiplayerData?.peerName || 'المنافس')
              : (decksData[opponentDeckIndex]?.name || 'سيتو كايبا')
          }
          onComplete={({ startingPlayer }) => {
            const finalStartPlayer = startingPlayer !== undefined ? startingPlayer : 0;
            setStartingPlayerIndex(finalStartPlayer);
            if (isMultiplayer && multiplayerData) {
              setMultiplayerData((prev) => ({
                ...prev,
                startingPlayer: finalStartPlayer,
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
          isAiDuel={!isMultiplayer}
          isMultiplayer={isMultiplayer}
          multiplayerData={multiplayerData}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentScreen === 'decks' && (
        <DeckBuilderScreen
          onBack={() => setCurrentScreen('title')}
          selectedDeckIndex={playerDeckIndex}
          onSelectDeck={(idx) => {
            setPlayerDeckIndex(idx);
            setCustomDeckCards(null);
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
      </PharaohErrorBoundary>
    </div>
  );
};

export default App;
