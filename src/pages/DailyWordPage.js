import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DAILY_WORDS } from '../data/dailyWords';
import { WORD_RULES, buildStorageKey, evaluateGuess, getDailyWord, getTodayKey } from '../utils/dailyWord';
import './DailyWordPage.css';

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

const footerQuickLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Case studies', href: '/#case-studies' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' }
];

const footerProjects = [
  { label: 'Corthex', href: 'https://corthex.app' },
  { label: 'Botforger', href: 'https://botforger.com' },
  { label: 'Vizualy', href: 'https://vizualy.nl' },
  { label: 'Refacthor', href: 'https://refacthor.nl' }
];

const footerConnect = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', href: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', href: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram', href: 'https://www.instagram.com/jaymianlee_/' }
];

const copy = {
  en: {
    title: 'Wordly',
    subtitle: 'One fun word every day.',
    switchLang: 'Language',
    reset: 'Reset today',
    back: 'Back to portfolio',
    howTo: 'Guess the 5 letter word in 6 tries.',
    placeholder: 'Type with keyboard or tap below',
    won: 'Great job. You solved today\'s word.',
    lost: 'Round complete. Come back tomorrow.',
    next: 'New word every day at local midnight.',
    enter: 'Enter',
    del: 'Delete',
    invalid: 'Use exactly 5 letters.',
    alreadyDone: 'You already finished this language today.',
    answer: 'Today\'s word'
  },
  nl: {
    title: 'Wordly',
    subtitle: 'Elke dag een leuk woord.',
    switchLang: 'Taal',
    reset: 'Reset vandaag',
    back: 'Terug naar portfolio',
    howTo: 'Raad het woord van 5 letters in 6 pogingen.',
    placeholder: 'Typ met toetsenbord of tik hieronder',
    won: 'Lekker bezig. Je hebt het woord geraden.',
    lost: 'Ronde klaar. Kom morgen terug.',
    next: 'Elke dag om middernacht een nieuw woord.',
    enter: 'Enter',
    del: 'Wissen',
    invalid: 'Gebruik precies 5 letters.',
    alreadyDone: 'Je hebt deze taal vandaag al uitgespeeld.',
    answer: 'Woord van vandaag',
    footerQuickLinksTitle: 'Snelle links',
    footerProjectsTitle: 'Projecten',
    footerConnectTitle: 'Connect',
    footerWordlyText: 'Wordly is je dagelijkse taalworkout met warme, speelse woorden.',
    footerWordlyCta: 'Speel Wordly',
    footerBuilt: 'Met zorg gebouwd in Limburg'
  }
};

const getInitialState = (language, dateKey) => {
  const key = buildStorageKey(language, dateKey);
  const saved = localStorage.getItem(key);
  if (!saved) {
    return { guesses: [], evaluations: [], status: 'playing' };
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.guesses) && Array.isArray(parsed.evaluations) && parsed.status) {
      return parsed;
    }
  } catch {
    return { guesses: [], evaluations: [], status: 'playing' };
  }

  return { guesses: [], evaluations: [], status: 'playing' };
};

function DailyWordPage() {
  const [language, setLanguage] = useState(() => localStorage.getItem('portfolio-language') || 'en');
  const [currentGuess, setCurrentGuess] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const [popRow, setPopRow] = useState(-1);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'light');

  const dateKey = useMemo(() => getTodayKey(), []);
  const answer = useMemo(() => getDailyWord(language, DAILY_WORDS, dateKey), [language, dateKey]);
  const [game, setGame] = useState(() => getInitialState(language, dateKey));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    const nextState = getInitialState(language, dateKey);
    setGame(nextState);
    setCurrentGuess('');
    setError('');
    localStorage.setItem('portfolio-language', language);
  }, [language, dateKey]);

  useEffect(() => {
    localStorage.setItem(buildStorageKey(language, dateKey), JSON.stringify(game));
  }, [language, dateKey, game]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (game.status !== 'playing') return;

      if (event.key === 'Enter') {
        submitGuess();
        return;
      }

      if (event.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key) && currentGuess.length < WORD_RULES.WORD_LENGTH) {
        setCurrentGuess((prev) => `${prev}${event.key.toLowerCase()}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const usedKeys = useMemo(() => {
    const score = {};
    game.guesses.forEach((guess, rowIndex) => {
      const row = game.evaluations[rowIndex];
      guess.split('').forEach((char, i) => {
        const next = row[i];
        const current = score[char];
        if (current === 'correct') return;
        if (current === 'present' && next === 'absent') return;
        score[char] = next;
      });
    });
    return score;
  }, [game]);

  const submitGuess = () => {
    if (currentGuess.length !== WORD_RULES.WORD_LENGTH) {
      setError(copy[language].invalid);
      setShakeRow(game.guesses.length);
      setTimeout(() => setShakeRow(-1), 380);
      return;
    }

    const nextEvaluation = evaluateGuess(currentGuess, answer);
    const nextGuesses = [...game.guesses, currentGuess];
    const nextEvaluations = [...game.evaluations, nextEvaluation];

    let status = 'playing';
    if (currentGuess === answer) status = 'won';
    if (nextGuesses.length >= WORD_RULES.MAX_GUESSES && currentGuess !== answer) status = 'lost';

    setGame({ guesses: nextGuesses, evaluations: nextEvaluations, status });
    setPopRow(nextGuesses.length - 1);
    setTimeout(() => setPopRow(-1), 460);
    setCurrentGuess('');
    setError('');
  };

  const onVirtualKey = (key) => {
    if (game.status !== 'playing') return;
    if (key === 'enter') {
      submitGuess();
      return;
    }
    if (key === 'backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (currentGuess.length >= WORD_RULES.WORD_LENGTH) return;
    setCurrentGuess((prev) => `${prev}${key}`);
  };

  const onResetToday = () => {
    localStorage.removeItem(buildStorageKey(language, dateKey));
    setGame({ guesses: [], evaluations: [], status: 'playing' });
    setCurrentGuess('');
    setError('');
  };

  return (
    <main className="daily-page">
      <div className="daily-wrap">
        <header className="daily-header">
          <Link to="/" className="daily-back">{copy[language].back}</Link>
          <div className="daily-header-controls">
            <button type="button" className="reset-btn" onClick={onResetToday}>{copy[language].reset}</button>
          </div>
        </header>

        <section className="daily-hero">
          <h1>{copy[language].title}</h1>
          <p>{copy[language].subtitle}</p>
          <p className="daily-help">{copy[language].howTo}</p>
          <p className="daily-meta">{dateKey} · {copy[language].next}</p>
        </section>

        <section className="daily-grid" aria-label="Word grid">
          {Array.from({ length: WORD_RULES.MAX_GUESSES }).map((_, rowIndex) => {
            const savedGuess = game.guesses[rowIndex] || '';
            const liveGuess = rowIndex === game.guesses.length ? currentGuess : '';
            const letters = (savedGuess || liveGuess).padEnd(WORD_RULES.WORD_LENGTH).split('');

            return (
              <div
                className={`daily-row ${rowIndex === shakeRow ? 'shake' : ''} ${rowIndex === popRow ? 'pop' : ''}`}
                key={`row-${rowIndex}`}
              >
                {letters.map((char, colIndex) => {
                  const state = game.evaluations[rowIndex]?.[colIndex] || 'empty';
                  return (
                    <div className={`tile ${state}`} key={`tile-${rowIndex}-${colIndex}`}>
                      {char.trim()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        <p className="daily-tip">{copy[language].placeholder}</p>

        {error && <p className="daily-error">{error}</p>}
        {game.status === 'won' && <p className="daily-status win">{copy[language].won}</p>}
        {game.status === 'lost' && (
          <p className="daily-status lose">{copy[language].lost} {copy[language].answer}: <strong>{answer.toUpperCase()}</strong></p>
        )}
        {game.status !== 'playing' && <p className="daily-done">{copy[language].alreadyDone}</p>}

        <section className="keyboard" aria-label="Virtual keyboard">
          {KEY_ROWS.map((row) => (
            <div className="key-row" key={row}>
              {row.split('').map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={`key ${usedKeys[letter] || ''}`}
                  onClick={() => onVirtualKey(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="key-row">
            <button type="button" className="key key-wide" onClick={() => onVirtualKey('enter')}>
              {copy[language].enter}
            </button>
            <button type="button" className="key key-wide" onClick={() => onVirtualKey('backspace')}>
              {copy[language].del}
            </button>
          </div>
        </section>
      </div>

      <div className="daily-utility-dock" aria-label="Display controls">
        <button
          type="button"
          className="dock-card control"
          onClick={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
          aria-label="Toggle language"
          title={language === 'en' ? 'Switch to Dutch' : 'Switch to English'}
        >
          <span className="dock-label">Language</span>
          <span className={`language-toggle ${language}`} aria-hidden="true">
            <span className="lang-knob" />
            <span className="lang-option en">EN</span>
            <span className="lang-option nl">NL</span>
          </span>
        </button>

        <button
          type="button"
          className="dock-card control"
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span className="dock-label">Theme</span>
          <span className={`theme-toggle ${theme}`}>
            <span className="theme-track" aria-hidden="true">
              <span className="sun" />
              <span className="moon" />
            </span>
          </span>
        </button>
      </div>

      <footer className="daily-site-footer" aria-label="Footer">
        <div className="daily-footer-shell">
          <div className="daily-footer-grid">
            <section className="daily-footer-brand" aria-label="Brand">
              <p className="daily-footer-kicker">Brand</p>
              <h2>Jaymian-Lee Reinartz</h2>
              <p>{copy[language].subtitle}</p>
              <p>{copy[language].footerWordlyText}</p>
            </section>

            <nav className="daily-footer-column" aria-label={copy[language].footerQuickLinksTitle}>
              <p className="daily-footer-kicker">{copy[language].footerQuickLinksTitle}</p>
              <ul>
                {footerQuickLinks.map((item) => (
                  <li key={`quick-${item.label}`}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <section className="daily-footer-column" aria-label={copy[language].footerProjectsTitle}>
              <p className="daily-footer-kicker">{copy[language].footerProjectsTitle}</p>
              <ul>
                {footerProjects.map((item) => (
                  <li key={`project-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="daily-footer-column" aria-label={copy[language].footerConnectTitle}>
              <p className="daily-footer-kicker">{copy[language].footerConnectTitle}</p>
              <ul>
                {footerConnect.map((item) => (
                  <li key={`connect-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="daily-footer-bottomline" aria-label="Copyright">
            <p>© {new Date().getFullYear()} Jaymian-Lee Reinartz</p>
            <p>jaymian-lee.nl</p>
            <p>{copy[language].footerBuilt}</p>
          </div>
        </div>
      </footer>

    </main>
  );
}

export default DailyWordPage;
