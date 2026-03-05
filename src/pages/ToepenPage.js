import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import './ToepenPage.css';

const STORAGE_STATE_KEY = 'toepen-state-v1';
const STORAGE_HISTORY_KEY = 'toepen-history-v1';

const createPlayer = (name) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: name.trim(),
  score: 0,
  eliminated: false,
  eliminatedAt: null,
  place: null
});

const createInitialState = () => ({
  setupNames: [],
  targetScore: 10,
  game: null
});

const TAUNTS = [
  '{name}, jammer joh. Ben je nu zo slecht??',
  '{name}, deze ronde was echt premium drama.',
  '{name}, kaartjes waren tegen je vandaag.',
  '{name}, dit was meer vallen dan spelen.',
  '{name}, respect dat je het toch probeerde.',
  '{name}, je ging all-in op pech blijkbaar.',
  '{name}, dit was een masterclass net-niet.',
  '{name}, volgende pot misschien met geluk erbij?',
  '{name}, de kaarten fluisterden: nee.',
  '{name}, tactiek was goed, uitvoering... minder.',
  '{name}, je score zei: tijd om te rusten.',
  '{name}, dit was speedrun naar uitschakeling.',
  '{name}, je had wel karakter, geen punten.',
  '{name}, de tafel heeft je vandaag verslagen.',
  '{name}, oei. Dit was een harde landing.',
  '{name}, je ging van hoop naar doei.',
  '{name}, de comeback patch komt later.',
  '{name}, dit was strategisch chaos.',
  '{name}, je kaarten deden niet mee.',
  '{name}, je bent officieel in de pech-liga.',
  '{name}, iedereen zag het aankomen behalve jij.',
  '{name}, knap geprobeerd, pijnlijk resultaat.',
  '{name}, deze ronde was anti-{name}.',
  '{name}, volgende keer eerst warmdraaien.',
  '{name}, dit was geen nederlaag, dit was content.'
];

const getTauntForPlayer = (name, score) => {
  const seed = `${name}-${score}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TAUNTS.length;
  return TAUNTS[index].replaceAll('{name}', name);
};

const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

function ToepenPage() {
  const [nameInput, setNameInput] = useState('');
  const [state, setState] = useState(createInitialState);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('portfolio-language');
    if (saved === 'en' || saved === 'nl') return saved;
    return detectBrowserLanguage();
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return detectBrowserTheme();
  });

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_STATE_KEY);
      const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (savedState) setState(JSON.parse(savedState));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch {
      setState(createInitialState());
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('portfolio-language', language);
  }, [language]);

  const setupPlayers = state.setupNames || [];
  const game = state.game;

  const activePlayers = useMemo(() => {
    if (!game) return [];
    return game.players.filter((p) => !p.eliminated);
  }, [game]);

  const orderedPlayers = useMemo(() => {
    if (!game) return [];
    return game.players;
  }, [game]);

  const addSetupName = () => {
    const clean = nameInput.trim();
    if (!clean) return;
    if (setupPlayers.some((name) => name.toLowerCase() === clean.toLowerCase())) {
      setNameInput('');
      return;
    }

    setState((prev) => ({ ...prev, setupNames: [...prev.setupNames, clean] }));
    setNameInput('');
  };

  const removeSetupName = (target) => {
    setState((prev) => ({ ...prev, setupNames: prev.setupNames.filter((name) => name !== target) }));
  };

  const startGame = () => {
    if (setupPlayers.length < 2) return;

    const players = setupPlayers.map((name) => createPlayer(name));
    setState((prev) => ({
      ...prev,
      game: {
        id: `${Date.now()}`,
        startedAt: new Date().toISOString(),
        targetScore: Number(prev.targetScore) || 10,
        finished: false,
        winnerId: null,
        players
      }
    }));
  };

  const incrementScore = (playerId) => {
    setState((prev) => {
      if (!prev.game || prev.game.finished) return prev;

      const currentGame = prev.game;
      const player = currentGame.players.find((p) => p.id === playerId);
      if (!player || player.eliminated) return prev;

      const nextPlayers = currentGame.players.map((p) => {
        if (p.id !== playerId) return p;

        const nextScore = p.score + 1;
        if (nextScore < currentGame.targetScore) {
          return { ...p, score: nextScore };
        }

        const activeCount = currentGame.players.filter((x) => !x.eliminated).length;
        return {
          ...p,
          score: nextScore,
          eliminated: true,
          eliminatedAt: new Date().toISOString(),
          place: activeCount
        };
      });

      const remaining = nextPlayers.filter((p) => !p.eliminated);
      if (remaining.length !== 1) {
        return { ...prev, game: { ...currentGame, players: nextPlayers } };
      }

      const winnerId = remaining[0].id;
      const finalPlayers = nextPlayers.map((p) =>
        p.id === winnerId
          ? {
              ...p,
              place: 1
            }
          : p
      );

      const finishedGame = {
        ...currentGame,
        players: finalPlayers,
        finished: true,
        winnerId,
        finishedAt: new Date().toISOString()
      };

      const resultRecord = {
        id: finishedGame.id,
        targetScore: finishedGame.targetScore,
        startedAt: finishedGame.startedAt,
        finishedAt: finishedGame.finishedAt,
        results: [...finalPlayers]
          .sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
          .map((p) => ({
            name: p.name,
            place: p.place,
            score: p.score
          }))
      };

      setHistory((prevHistory) => [resultRecord, ...prevHistory].slice(0, 25));
      return { ...prev, game: finishedGame };
    });
  };

  const decrementScore = (playerId) => {
    setState((prev) => {
      if (!prev.game || prev.game.finished) return prev;

      const currentGame = prev.game;
      const nextPlayers = currentGame.players.map((p) => {
        if (p.id !== playerId) return p;

        const nextScore = Math.max(0, p.score - 1);
        const shouldRevive = p.eliminated && nextScore < currentGame.targetScore;

        return {
          ...p,
          score: nextScore,
          eliminated: shouldRevive ? false : p.eliminated,
          eliminatedAt: shouldRevive ? null : p.eliminatedAt,
          place: shouldRevive ? null : p.place
        };
      });

      return { ...prev, game: { ...currentGame, players: nextPlayers } };
    });
  };

  const resetCurrentGame = () => {
    setState((prev) => ({ ...prev, game: null }));
  };

  const clearAll = () => {
    setState(createInitialState());
    setHistory([]);
    localStorage.removeItem(STORAGE_STATE_KEY);
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  };

  const winnerName = game?.finished ? game.players.find((p) => p.id === game.winnerId)?.name : null;

  const askLabel = language === 'nl' ? 'Vragen?' : 'Questions?';

  return (
    <main className="toepen-page">
      <div className="toepen-wrap">
        <header className="toepen-header">
          <Link to="/" className="toepen-back">← Terug naar portfolio</Link>
          <h1>Toepen scorebord</h1>
          <p>LocalStorage only, zonder database.</p>
        </header>

        <section className="toepen-card">
          <h2>Setup</h2>
          <label className="toepen-label" htmlFor="target-score">Eindscore (bij deze score lig je eruit)</label>
          <input
            id="target-score"
            type="number"
            min="1"
            value={state.targetScore}
            onChange={(e) => setState((prev) => ({ ...prev, targetScore: Math.max(1, Number(e.target.value) || 1) }))}
          />

          <label className="toepen-label" htmlFor="name-input">Naam toevoegen</label>
          <div className="toepen-row">
            <input
              id="name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Bijv. Jay"
            />
            <button type="button" onClick={addSetupName}>Toevoegen</button>
          </div>

          <ul className="toepen-names">
            {setupPlayers.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <button type="button" onClick={() => removeSetupName(name)}>Verwijder</button>
              </li>
            ))}
          </ul>

          <div className="toepen-row">
            <button type="button" onClick={startGame} disabled={setupPlayers.length < 2}>Start spel</button>
            <button type="button" className="ghost" onClick={clearAll}>Alles resetten</button>
          </div>
        </section>

        {game && (
          <section className="toepen-card">
            <h2>Lopend spel</h2>
            <p>Eindscore: <strong>{game.targetScore}</strong></p>
            {game.finished ? (
              <p className="winner">Winnaar: <strong>{winnerName}</strong></p>
            ) : (
              <p>Actief: {activePlayers.map((p) => p.name).join(', ')}</p>
            )}

            <ul className="toepen-scores">
              {orderedPlayers.map((player) => (
                <li key={player.id} className={player.eliminated ? 'out' : ''}>
                  <div className="toepen-score-badge" aria-label={`Score ${player.score}`}>
                    {player.score}
                  </div>
                  <div className="toepen-player-main">
                    <strong>{player.name}</strong>
                    <p>
                      Score
                      {player.eliminated ? ` · Uitgeschakeld (plaats ${player.place})` : ''}
                    </p>
                  </div>
                  <div className="toepen-score-actions">
                    <button
                      type="button"
                      disabled={game.finished}
                      onClick={() => decrementScore(player.id)}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      disabled={game.finished || player.eliminated}
                      onClick={() => incrementScore(player.id)}
                    >
                      +1
                    </button>
                  </div>
                  {player.eliminated && (
                    <div className="toepen-taunt-overlay" aria-live="polite">
                      <span>{getTauntForPlayer(player.name, player.score)}</span>
                      <button
                        type="button"
                        className="toepen-overlay-undo"
                        disabled={game.finished}
                        onClick={() => decrementScore(player.id)}
                      >
                        -1
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" className="ghost" onClick={resetCurrentGame}>Nieuw spel opzetten</button>
          </section>
        )}

        <section className="toepen-card">
          <h2>Historie (laatste 25)</h2>
          {history.length === 0 ? (
            <p>Nog geen afgeronde spellen.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article key={item.id}>
                  <p><strong>{new Date(item.finishedAt).toLocaleString('nl-NL')}</strong> · Eindscore {item.targetScore}</p>
                  <ol>
                    {item.results.map((row) => (
                      <li key={`${item.id}-${row.name}-${row.place}`}>
                        #{row.place} {row.name} ({row.score})
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={askLabel}
        onAsk={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        askAriaLabel={askLabel}
      />
    </main>
  );
}

export default ToepenPage;
