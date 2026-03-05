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

const TAUNTS = {
  nl: [
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
    '{name}, dit was geen nederlaag, dit was content.',
    '{name}, hahaha. Die deed pijn.',
    '{name}, stop maar gewoon.',
    '{name}, speelde je wel serieus???',
    '{name}, een blinde legt nog betere kaarten dan jij 💀',
    '{name}, pffffff.',
    '{name}, 💀'
  ],
  en: [
    '{name}, rough one. Are you really this bad??',
    '{name}, that round was premium chaos.',
    '{name}, the cards were against you today.',
    '{name}, more falling than playing, honestly.',
    '{name}, respect for trying anyway.',
    '{name}, you went all-in on bad luck.',
    '{name}, this was a masterclass in almost.',
    '{name}, maybe next game with extra luck?',
    '{name}, the cards whispered: nope.',
    '{name}, good tactic, questionable execution.',
    '{name}, your score said: time to rest.',
    '{name}, speedrun to elimination achieved.',
    '{name}, lots of character, not many points.',
    '{name}, the table defeated you today.',
    '{name}, oof. That was a hard landing.',
    '{name}, from hope to goodbye in one round.',
    '{name}, comeback patch coming soon.',
    '{name}, this was strategic chaos.',
    '{name}, your cards did not cooperate.',
    '{name}, welcome to the unlucky league.',
    '{name}, everyone saw it coming except you.',
    '{name}, nice try, painful result.',
    '{name}, this round was anti-{name}.',
    '{name}, warm up first next time.',
    '{name}, not a loss, this is content.'
  ]
};

const copy = {
  nl: {
    back: '← Terug naar portfolio',
    title: 'Toepen scorebord',
    subtitle: 'LocalStorage only, zonder database.',
    setup: 'Setup',
    targetScore: 'Eindscore (bij deze score lig je eruit)',
    addName: 'Naam toevoegen',
    namePlaceholder: 'Bijv. Jay',
    add: 'Toevoegen',
    remove: 'Verwijder',
    startGame: 'Start spel',
    resetAll: 'Alles resetten',
    runningGame: 'Lopend spel',
    endScore: 'Eindscore',
    winner: 'Winnaar',
    active: 'Actief',
    score: 'Score',
    eliminated: 'Uitgeschakeld',
    place: 'plaats',
    newGame: 'Nieuw spel opzetten',
    history: 'Historie (laatste 25)',
    noHistory: 'Nog geen afgeronde spellen.'
  },
  en: {
    back: '← Back to portfolio',
    title: 'Toepen scoreboard',
    subtitle: 'LocalStorage only, no database.',
    setup: 'Setup',
    targetScore: 'End score (at this score you are out)',
    addName: 'Add name',
    namePlaceholder: 'e.g. Jay',
    add: 'Add',
    remove: 'Remove',
    startGame: 'Start game',
    resetAll: 'Reset all',
    runningGame: 'Current game',
    endScore: 'End score',
    winner: 'Winner',
    active: 'Active',
    score: 'Score',
    eliminated: 'Eliminated',
    place: 'place',
    newGame: 'Set up new game',
    history: 'History (last 25)',
    noHistory: 'No finished games yet.'
  }
};

const getTauntForPlayer = (name, score, language) => {
  const seed = `${name}-${score}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const set = TAUNTS[language] || TAUNTS.en;
  const index = Math.abs(hash) % set.length;
  return set[index].replaceAll('{name}', name);
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
      if (!prev.game) return prev;

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

      const remaining = nextPlayers.filter((p) => !p.eliminated);
      const isFinished = remaining.length === 1;
      const winnerId = isFinished ? remaining[0].id : null;

      const normalizedPlayers = nextPlayers.map((p) => {
        if (winnerId && p.id === winnerId) return { ...p, place: 1 };
        if (!p.eliminated) return { ...p, place: null };
        return p;
      });

      return {
        ...prev,
        game: {
          ...currentGame,
          players: normalizedPlayers,
          finished: isFinished,
          winnerId,
          finishedAt: isFinished ? currentGame.finishedAt || new Date().toISOString() : null
        }
      };
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
  const t = copy[language] || copy.en;

  return (
    <main className="toepen-page">
      <div className="toepen-wrap">
        <header className="toepen-header">
          <Link to="/" className="toepen-back">{t.back}</Link>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        <section className="toepen-card">
          <h2>{t.setup}</h2>
          <label className="toepen-label" htmlFor="target-score">{t.targetScore}</label>
          <input
            id="target-score"
            type="number"
            min="1"
            value={state.targetScore}
            onChange={(e) => setState((prev) => ({ ...prev, targetScore: Math.max(1, Number(e.target.value) || 1) }))}
          />

          <label className="toepen-label" htmlFor="name-input">{t.addName}</label>
          <div className="toepen-row">
            <input
              id="name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.namePlaceholder}
            />
            <button type="button" onClick={addSetupName}>{t.add}</button>
          </div>

          <ul className="toepen-names">
            {setupPlayers.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <button type="button" onClick={() => removeSetupName(name)}>{t.remove}</button>
              </li>
            ))}
          </ul>

          <div className="toepen-row">
            <button type="button" onClick={startGame} disabled={setupPlayers.length < 2}>{t.startGame}</button>
            <button type="button" className="ghost" onClick={clearAll}>{t.resetAll}</button>
          </div>
        </section>

        {game && (
          <section className="toepen-card">
            <h2>{t.runningGame}</h2>
            <p>{t.endScore}: <strong>{game.targetScore}</strong></p>
            {game.finished ? (
              <p className="winner">{t.winner}: <strong>{winnerName}</strong></p>
            ) : (
              <p>{t.active}: {activePlayers.map((p) => p.name).join(', ')}</p>
            )}

            <ul className="toepen-scores">
              {orderedPlayers.map((player) => (
                <li key={player.id} className={player.eliminated ? 'out' : ''}>
                  <div className="toepen-score-badge" aria-label={`${t.score} ${player.score}`}>
                    {player.score}
                  </div>
                  <div className="toepen-player-main">
                    <strong>{player.name}</strong>
                    <p>
                      {t.score}
                      {player.eliminated ? ` · ${t.eliminated} (${t.place} ${player.place})` : ''}
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
                      <span>{getTauntForPlayer(player.name, player.score, language)}</span>
                      <button
                        type="button"
                        className="toepen-overlay-undo"
                        onClick={() => decrementScore(player.id)}
                      >
                        -1
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" className="ghost" onClick={resetCurrentGame}>{t.newGame}</button>
          </section>
        )}

        <section className="toepen-card">
          <h2>{t.history}</h2>
          {history.length === 0 ? (
            <p>{t.noHistory}</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article key={item.id}>
                  <p><strong>{new Date(item.finishedAt).toLocaleString(language === 'nl' ? 'nl-NL' : 'en-US')}</strong> · {t.endScore} {item.targetScore}</p>
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
