import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DAILY_WORDS } from '../data/dailyWords';
import { WORD_RULES, buildStorageKey, evaluateGuess, getDailyWord, getTodayKey } from '../utils/dailyWord';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
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
    title: 'Word-Lee',
    subtitle: 'One fun word every day.',
    back: 'Back to portfolio',
    howTo: 'Guess the 5 letter word in 6 tries.',
    oneRoundRule: 'You can only play 1 full round per day per language.',
    placeholder: 'Type with keyboard or tap below',
    won: 'Great job. You solved today\'s word.',
    lost: 'Round complete. Come back tomorrow.',
    next: 'New word every day at local midnight.',
    enter: 'Enter',
    del: 'Delete',
    invalid: 'Use exactly 5 letters.',
    invalidWord: 'That word does not exist in the Word-Lee list.',
    alreadyDone: 'You already finished this language today.',
    answer: 'Today\'s word',
    askMe: 'Questions?',
    askTitle: 'Questions?',
    askSubtitle: 'Ask anything about Jaymian-Lee, projects, services, and this website.',
    askPlaceholder: 'Type your question',
    askSend: 'Send',
    askThinking: 'Thinking...',
    askError: 'The assistant is temporarily unavailable.',
    askGreeting: 'Hi, ask me anything about Jaymian-Lee, this portfolio, services, projects, and Word-Lee.',
    leaderboardTitle: 'Daily top 3',
    leaderboardSubtitle: 'Today\'s fastest solves',
    yesterdayWinnerTitle: 'Topper of the week',
    dailyTopperTitle: 'Topper of the day',
    yesterdayWinnerEmpty: 'No weekly topper yet.',
    leaderboardEmpty: 'No scores yet today. Be the first.',
    leaderboardNameLabel: 'Your name',
    leaderboardNamePlaceholder: 'Type your name',
    leaderboardSubmit: 'Submit score',
    leaderboardSubmitted: 'Score submitted',
    leaderboardHint: 'Only available after solving.',
    leaderboardAttempts: 'tries',
    leaderboardError: 'Could not update leaderboard.',
    joinBoardCta: 'Join leaderboard',
    joinBoardTitle: 'Join today\'s leaderboard',
    joinBoardText: 'Want your name on the board? Enter it now.',
    joinBoardCongrats: 'Congrats! Lock in your name and share the win.',
    myScoresTitle: 'Your scores',
    myScoresSearchPlaceholder: 'Search or pick a player',
    myScoresEmpty: 'No scores saved yet for this name.',
    durationLabel: 'time',
    durationNA: 'N/A',
    worldRecord: 'WR',
    myScoresPR: 'PR',
    footerQuickLinksTitle: 'Quick links',
    footerProjectsTitle: 'Projects',
    footerConnectTitle: 'Connect',
    footerWordleeText: 'Word-Lee is your daily language workout with warm, playful words.',
    footerBuilt: 'Built with care in Limburg'
  },
  nl: {
    title: 'Word-Lee',
    subtitle: 'Elke dag een leuk woord.',
    back: 'Terug naar portfolio',
    howTo: 'Raad het woord van 5 letters in 6 pogingen.',
    oneRoundRule: 'Je kunt per taal maar 1 volledige ronde per dag spelen.',
    placeholder: 'Typ met toetsenbord of tik hieronder',
    won: 'Lekker bezig. Je hebt het woord geraden.',
    lost: 'Ronde klaar. Kom morgen terug.',
    next: 'Elke dag om middernacht een nieuw woord.',
    enter: 'Enter',
    del: 'Wissen',
    invalid: 'Gebruik precies 5 letters.',
    invalidWord: 'Dit woord staat niet in de Word-Lee woordenlijst.',
    alreadyDone: 'Je hebt deze taal vandaag al uitgespeeld.',
    answer: 'Woord van vandaag',
    askMe: 'Vragen?',
    askTitle: 'Vragen?',
    askSubtitle: 'Vraag alles over Jaymian-Lee, projecten, services en deze website.',
    askPlaceholder: 'Typ je vraag',
    askSend: 'Verstuur',
    askThinking: 'Even denken...',
    askError: 'De assistent is tijdelijk niet beschikbaar.',
    askGreeting: 'Hi, vraag me alles over Jaymian-Lee, deze portfolio, services, projecten en Word-Lee.',
    leaderboardTitle: 'Top 3 van vandaag',
    leaderboardSubtitle: 'Snelste oplossingen van vandaag',
    yesterdayWinnerTitle: 'De topper van de week',
    dailyTopperTitle: 'Topper van de dag',
    yesterdayWinnerEmpty: 'Nog geen weektopper beschikbaar.',
    leaderboardEmpty: 'Nog geen scores vandaag. Jij kan de eerste zijn.',
    leaderboardNameLabel: 'Jouw naam',
    leaderboardNamePlaceholder: 'Vul je naam in',
    leaderboardSubmit: 'Score opslaan',
    leaderboardSubmitted: 'Score opgeslagen',
    leaderboardHint: 'Pas beschikbaar nadat je hebt gewonnen.',
    leaderboardAttempts: 'pogingen',
    leaderboardError: 'Scorebord kon niet worden bijgewerkt.',
    joinBoardCta: 'Naar scorebord',
    joinBoardTitle: 'Op het scorebord van vandaag?',
    joinBoardText: 'Wil je op het scorebord? Vul dan nu je naam in.',
    joinBoardCongrats: 'Gefeliciteerd! Zet je naam erbij en maak het officieel.',
    myScoresTitle: 'Jouw scores',
    myScoresSearchPlaceholder: 'Zoek of kies een speler',
    myScoresEmpty: 'Nog geen scores opgeslagen voor deze naam.',
    durationLabel: 'tijd',
    durationNA: 'N/A',
    worldRecord: 'WR',
    myScoresPR: 'PR',
    footerQuickLinksTitle: 'Snelle links',
    footerProjectsTitle: 'Projecten',
    footerConnectTitle: 'Connect',
    footerWordleeText: 'Word-Lee is je dagelijkse taalworkout met warme, speelse woorden.',
    footerBuilt: 'Met zorg gebouwd in Limburg'
  }
};

const getInitialState = (language, dateKey) => {
  const key = buildStorageKey(language, dateKey);
  const saved = localStorage.getItem(key);
  if (!saved) {
    return { guesses: [], evaluations: [], status: 'playing', startedAt: Date.now(), durationMs: null };
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.guesses) && Array.isArray(parsed.evaluations) && parsed.status) {
      return {
        guesses: parsed.guesses,
        evaluations: parsed.evaluations,
        status: parsed.status,
        startedAt: Number.isInteger(parsed.startedAt) ? parsed.startedAt : Date.now(),
        durationMs: Number.isInteger(parsed.durationMs) ? parsed.durationMs : null
      };
    }
  } catch {
    return { guesses: [], evaluations: [], status: 'playing', startedAt: Date.now(), durationMs: null };
  }

  return { guesses: [], evaluations: [], status: 'playing' };
};


const safeJson = async (response) => {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { error: 'API gaf geen JSON terug. Controleer of de backend draait.' };
  }
};


const getScoreNameKey = (language, dateKey) => `wordlee-score-name:${language}:${dateKey}`;
const getScoreSubmittedKey = (language, dateKey) => `wordlee-score-submitted:${language}:${dateKey}`;


const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

function DailyWordPage() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('portfolio-language');
    if (saved === 'en' || saved === 'nl') return saved;
    return detectBrowserLanguage();
  });
  const [currentGuess, setCurrentGuess] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const [popRow, setPopRow] = useState(-1);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return detectBrowserTheme();
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', content: copy.en.askGreeting }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyTopper, setWeeklyTopper] = useState(null);
  const [scoreName, setScoreName] = useState('');
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [myScores, setMyScores] = useState([]);
  const [myScoresLoading, setMyScoresLoading] = useState(false);
  const [myScoresQuery, setMyScoresQuery] = useState('');
  const [playerOptions, setPlayerOptions] = useState([]);
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  const dateKey = useMemo(() => getTodayKey(), []);
  const weekDateKeys = useMemo(() => {
    const base = new Date(`${dateKey}T00:00:00`);
    return Array.from({ length: 7 }).map((_, index) => {
      const d = new Date(base);
      d.setDate(base.getDate() - index);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  }, [dateKey]);
  const answer = useMemo(() => getDailyWord(language, DAILY_WORDS, dateKey), [language, dateKey]);
  const [game, setGame] = useState(() => getInitialState(language, dateKey));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    setChatMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: copy[language].askGreeting }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    const nextState = getInitialState(language, dateKey);
    setGame(nextState);
    setCurrentGuess('');
    setError('');
    localStorage.setItem('portfolio-language', language);

    const rememberedName = localStorage.getItem(getScoreNameKey(language, dateKey)) || '';
    setScoreName(rememberedName);
    setMyScoresQuery(rememberedName);
    setScoreSubmitted(localStorage.getItem(getScoreSubmittedKey(language, dateKey)) === '1');
  }, [language, dateKey]);

  useEffect(() => {
    localStorage.setItem(buildStorageKey(language, dateKey), JSON.stringify(game));
  }, [language, dateKey, game]);


  useEffect(() => {
    if (game.status === 'won' && !scoreSubmitted) {
      setShowJoinPopup(true);
    }
  }, [game.status, scoreSubmitted]);

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

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError('');
      try {
        const todayResponse = await fetch(`/api/wordlee/leaderboard?date=${dateKey}&language=${language}`);
        const todayData = await safeJson(todayResponse);
        if (!todayResponse.ok) throw new Error(todayData?.error || copy[language].leaderboardError);
        setLeaderboard(Array.isArray(todayData.top3) ? todayData.top3 : []);

        const weeklyResponses = await Promise.all(weekDateKeys.map((key) => fetch(`/api/wordlee/leaderboard?date=${key}&language=${language}`)));
        const weeklyData = await Promise.all(weeklyResponses.map((response) => safeJson(response)));

        const weeklyCandidates = [];
        weeklyResponses.forEach((response, index) => {
          if (!response.ok) return;
          const top = Array.isArray(weeklyData[index]?.top3) ? weeklyData[index].top3[0] : null;
          if (top) weeklyCandidates.push({ ...top, dateKey: weekDateKeys[index] });
        });

        weeklyCandidates.sort((a, b) => {
          if (a.attempts !== b.attempts) return a.attempts - b.attempts;
          const aDuration = Number.isInteger(a.durationMs) ? a.durationMs : Number.MAX_SAFE_INTEGER;
          const bDuration = Number.isInteger(b.durationMs) ? b.durationMs : Number.MAX_SAFE_INTEGER;
          if (aDuration !== bDuration) return aDuration - bDuration;
          return String(a.dateKey).localeCompare(String(b.dateKey));
        });

        setWeeklyTopper(weeklyCandidates[0] || null);
      } catch (err) {
        setLeaderboardError(err.message || copy[language].leaderboardError);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    loadLeaderboard();
  }, [language, dateKey, weekDateKeys]);


  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch(`/api/wordlee/players?language=${language}`);
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data?.error || copy[language].leaderboardError);
        setPlayerOptions(Array.isArray(data.players) ? data.players : []);
      } catch {
        setPlayerOptions([]);
      }
    };

    loadPlayers();
  }, [language]);

  useEffect(() => {
    const loadMyScores = async () => {
      const name = myScoresQuery.trim();
      if (name.length < 2) {
        setMyScores([]);
        return;
      }

      setMyScoresLoading(true);
      try {
        const response = await fetch(`/api/wordlee/history?name=${encodeURIComponent(name)}&language=${language}`);
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data?.error || copy[language].leaderboardError);
        setMyScores(Array.isArray(data.records) ? data.records : []);
      } catch {
        setMyScores([]);
      } finally {
        setMyScoresLoading(false);
      }
    };

    loadMyScores();
  }, [language, myScoresQuery]);


  const getRankBadge = (index) => {
    if (index === 0) return '👑 #1';
    if (index === 1) return '🥈 #2';
    if (index === 2) return '🥉 #3';
    return `#${index + 1}`;
  };

  const validWordSet = useMemo(() => {
    const words = DAILY_WORDS?.[language] || [];
    return new Set(words.map((word) => String(word).toLowerCase()));
  }, [language]);

  const dailyTopper = leaderboard.length > 0 ? leaderboard[0] : null;
  const filteredPlayerOptions = useMemo(() => {
    const q = myScoresQuery.trim().toLowerCase();
    const base = q ? playerOptions.filter((name) => name.toLowerCase().includes(q)) : playerOptions;
    return base.slice(0, 12);
  }, [myScoresQuery, playerOptions]);

  const formatDuration = (durationMs) => {
    if (!Number.isInteger(durationMs) || durationMs < 0) return copy[language].durationNA;
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

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

    if (!validWordSet.has(currentGuess)) {
      setError(copy[language].invalidWord);
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

    const startedAt = Number.isInteger(game.startedAt) ? game.startedAt : Date.now();
    const durationMs = status === 'playing' ? null : Math.max(0, Date.now() - startedAt);

    setGame({ guesses: nextGuesses, evaluations: nextEvaluations, status, startedAt, durationMs });
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

  const submitScore = async (event) => {
    event.preventDefault();
    if (game.status !== 'won' || scoreSubmitted) return;

    const safeName = scoreName.trim();
    if (safeName.length < 2) {
      setLeaderboardError(copy[language].leaderboardError);
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError('');

    try {
      const response = await fetch('/api/wordlee/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: safeName,
          dateKey,
          language,
          attempts: game.guesses.length,
          durationMs: Number.isInteger(game.durationMs) ? game.durationMs : null
        })
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data?.error || copy[language].leaderboardError);

      setLeaderboard(Array.isArray(data.top3) ? data.top3 : []);
      setScoreSubmitted(true);
      setShowJoinPopup(false);
      localStorage.setItem(getScoreSubmittedKey(language, dateKey), '1');
      localStorage.setItem(getScoreNameKey(language, dateKey), safeName);
    } catch (err) {
      setLeaderboardError(err.message || copy[language].leaderboardError);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const formatDateTime = (record) => {
    const base = record?.submittedAt ? new Date(record.submittedAt) : new Date(`${record.dateKey}T00:00:00`);
    return base.toLocaleString(language === 'nl' ? 'nl-NL' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const submitChat = async (event) => {
    event.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: chatInput.trim() };
    const nextMessages = [...chatMessages, userMessage];

    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-12) })
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data?.error || copy[language].askError);

      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatError(err.message || copy[language].askError);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="daily-page">
      <div className="daily-wrap">
        <header className="daily-header">
          <Link to="/" className="daily-back" aria-label={copy[language].back}>
            <span className="daily-back-arrow" aria-hidden="true">←</span>
            <span>{copy[language].back}</span>
          </Link>
        </header>

        <section className="daily-hero">
          <h1>{copy[language].title}</h1>
          <p>{copy[language].subtitle}</p>
          <p className="daily-help">{copy[language].howTo}</p>
          <p className="daily-help strong-rule">{copy[language].oneRoundRule}</p>
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


      <div className="leaderboard-spotlight">
<section className="leaderboard" aria-label={copy[language].leaderboardTitle}>
          <h2>{copy[language].leaderboardTitle}</h2>
          <p className="leaderboard-subtitle">{copy[language].leaderboardSubtitle}</p>


          <div className="yesterday-winner" aria-label={copy[language].yesterdayWinnerTitle}>
            <p className="yesterday-winner-title">{copy[language].yesterdayWinnerTitle}</p>
            {weeklyTopper ? (
              <div className="yesterday-winner-card">
                <span className="winner-crown" aria-hidden="true">👑</span>
                <span className="yesterday-winner-name">{weeklyTopper.name}</span>
                <span className="yesterday-winner-score">{weeklyTopper.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(weeklyTopper.durationMs)}</span>
              </div>
            ) : (
              <p className="daily-tip">{copy[language].yesterdayWinnerEmpty}</p>
            )}
          </div>

          <div className="yesterday-winner" aria-label={copy[language].dailyTopperTitle}>
            <p className="yesterday-winner-title">{copy[language].dailyTopperTitle}</p>
            {dailyTopper ? (
              <div className="yesterday-winner-card">
                <span className="winner-crown" aria-hidden="true">🏆</span>
                <span className="yesterday-winner-name">{dailyTopper.name}</span>
                <span className="yesterday-winner-score">{dailyTopper.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(dailyTopper.durationMs)} <strong>({copy[language].worldRecord})</strong></span>
              </div>
            ) : (
              <p className="daily-tip">{copy[language].leaderboardEmpty}</p>
            )}
          </div>

          {leaderboardLoading && <p className="daily-tip">Loading...</p>}
          {!leaderboardLoading && leaderboard.length === 0 && (
            <p className="daily-tip">{copy[language].leaderboardEmpty}</p>
          )}

          {leaderboard.length > 0 && (
            <ol className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <li key={`${entry.name}-${entry.attempts}-${entry.submittedAt || index}`}>
                  <span className={`leaderboard-rank`}>{getRankBadge(index)}</span>
                  <span className="leaderboard-name">{entry.name} {index === 0 ? <strong>({copy[language].worldRecord})</strong> : null}</span>
                  <span className="leaderboard-score">{entry.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(entry.durationMs)}</span>
                </li>
              ))}
            </ol>
          )}

          {game.status === 'won' && !scoreSubmitted && (
            <div className="leaderboard-join-wrap">
              <button type="button" className="leaderboard-join-btn" onClick={() => setShowJoinPopup(true)}>
                {copy[language].joinBoardCta}
              </button>
            </div>
          )}

          {(game.status !== 'won' || scoreSubmitted) && (
            <p className="daily-tip">{game.status !== 'won' ? copy[language].leaderboardHint : copy[language].leaderboardSubmitted}</p>
          )}



          <div className="my-scores" aria-label={copy[language].myScoresTitle}>
            <h3>{copy[language].myScoresTitle}</h3>
            <div className="my-scores-search-wrap">
              <input
                type="text"
                value={myScoresQuery}
                onChange={(e) => {
                  setMyScoresQuery(e.target.value.slice(0, 24));
                  setShowPlayerDropdown(true);
                }}
                onFocus={() => setShowPlayerDropdown(true)}
                placeholder={copy[language].myScoresSearchPlaceholder}
                className="my-scores-search"
              />
              <button
                type="button"
                className="my-scores-dropdown-btn"
                aria-label="Toggle player list"
                onClick={() => setShowPlayerDropdown((prev) => !prev)}
              >
                ▾
              </button>
              {showPlayerDropdown && filteredPlayerOptions.length > 0 && (
                <div className="my-scores-dropdown">
                  {filteredPlayerOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="my-scores-dropdown-item"
                      onClick={() => {
                        setMyScoresQuery(name);
                        setShowPlayerDropdown(false);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {myScoresLoading && <p className="daily-tip">Loading...</p>}
            {!myScoresLoading && myScores.length === 0 && (
              <p className="daily-tip">{copy[language].myScoresEmpty}</p>
            )}
            {myScores.length > 0 && (
              <ul className="my-scores-list">
                {myScores.map((record) => (
                  <li key={`${record.dateKey}-${record.submittedAt || 0}`}>
                    <span className="my-scores-date">{formatDateTime(record)}</span>
                    <span className="my-scores-attempts">{record.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(record.durationMs)}</span>
                    {record.isPR && <span className="my-scores-pr">🏆 {copy[language].myScoresPR}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

                    {leaderboardError && <p className="daily-error">{leaderboardError}</p>}
        </section>
      </div>
        
      </div>


      {showJoinPopup && game.status === 'won' && !scoreSubmitted && (
        <div className="join-popup" role="dialog" aria-modal="true" aria-label={copy[language].joinBoardTitle}>
          <div className="join-popup-inner">
            <button type="button" className="join-popup-close" onClick={() => setShowJoinPopup(false)} aria-label="Close">✕</button>
            <div className="join-popup-body">
              <p className="join-popup-kicker">Word-Lee</p>
              <h3>{copy[language].joinBoardTitle}</h3>
              <p className="join-popup-lead">{copy[language].joinBoardText}</p>
              <p className="join-popup-congrats">{copy[language].joinBoardCongrats}</p>
              <form className="leaderboard-form" onSubmit={submitScore}>
                <label htmlFor="leaderboard-name">{copy[language].leaderboardNameLabel}</label>
                <div className="leaderboard-form-row">
                  <input
                    id="leaderboard-name"
                    type="text"
                    value={scoreName}
                    onChange={(e) => setScoreName(e.target.value.slice(0, 24))}
                    placeholder={copy[language].leaderboardNamePlaceholder}
                  />
                  <button type="submit" disabled={leaderboardLoading}>
                    {copy[language].leaderboardSubmit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className={`daily-ask-widget ${isChatOpen ? 'open' : ''}`}>
        <section className="daily-chat-panel" aria-label="Assistant panel" aria-hidden={!isChatOpen}>
          <header className="daily-chat-header">
            <div>
              <p className="daily-chat-title">{copy[language].askTitle}</p>
              <p className="daily-chat-subtitle">{copy[language].askSubtitle}</p>
            </div>
            <button type="button" className="daily-chat-close" onClick={() => setIsChatOpen(false)} aria-label="Close">
              ✕
            </button>
          </header>

          <div className="daily-chat-box" role="log" aria-live="polite">
            {chatMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`daily-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {chatLoading && <div className="daily-message assistant">{copy[language].askThinking}</div>}
          </div>

          <form onSubmit={submitChat} className="daily-chat-form">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={copy[language].askPlaceholder}
              autoComplete="off"
            />
            <button type="submit" disabled={chatLoading}>{copy[language].askSend}</button>
          </form>

          {chatError && <p className="daily-chat-error">{chatError}</p>}
        </section>
      </div>

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={copy[language].askMe}
        onAsk={() => setIsChatOpen((prev) => !prev)}
        askAriaLabel={copy[language].askTitle}
      />

      <footer className="daily-site-footer" aria-label="Footer">
        <div className="daily-footer-shell">
          <div className="daily-footer-grid">
            <section className="daily-footer-brand" aria-label="Brand">
              <p className="daily-footer-kicker">Brand</p>
              <h2>Jaymian-Lee Reinartz</h2>
              <p>{copy[language].subtitle}</p>
              <p>{copy[language].footerWordleeText}</p>
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
