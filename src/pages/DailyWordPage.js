import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DAILY_WORDS } from '../data/dailyWords';
import Seo from '../components/Seo';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { WORD_RULES, buildStorageKey, evaluateGuess, getDailyWord, getTodayKey, normalizeWord } from '../utils/dailyWord';
import { validateWord } from '../utils/wordValidation';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import MainFooter from '../components/MainFooter';
import { buildAiContext } from '../utils/aiContext';
import './DailyWordPage.css';

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const LETTER_INPUT_REGEX = /^\p{L}$/u;
const NAME_COMPARABLE_REGEX = /[^a-z0-9]/g;

const normalizeGuessChar = (value) => normalizeWord(value);
const normalizeComparableName = (value) => normalizeWord(value).replace(NAME_COMPARABLE_REGEX, '');

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = new Array(b.length + 1).fill(0).map((_, i) => i);
  const current = new Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
};

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
    invalidWord: 'That word is not in the dictionary.',
    wordValidationError: 'Could not verify that word right now. Try again.',
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
    yesterdayWinnerTitle: 'World record of this month',
    dailyTopperTitle: 'Topper of the day',
    weeklyTopppersTitle: 'Top performers of this week',
    weeklyTopppersSubtitle: 'Scoreboard from Monday to Sunday',
    yesterdayWinnerEmpty: 'No world record yet this month.',
    leaderboardEmpty: 'No scores yet today. Be the first.',
    leaderboardNameLabel: 'Your name',
    leaderboardNamePlaceholder: 'Type your name',
    leaderboardNameExists: 'That name already exists as',
    leaderboardNameSuggestion: 'Did you mean',
    leaderboardNameDecision: 'Use the existing name to keep scores together, or create a new one.',
    leaderboardNameUseExisting: 'Use existing',
    leaderboardNameCreateNew: 'Create new',
    leaderboardNameEdit: 'Edit name',
    leaderboardNameCreatedNew: 'A new name will be created.',
    leaderboardNameRequired: 'Choose first: use the existing name or create a new one.',
    leaderboardSubmit: 'Submit score',
    leaderboardSubmitLoading: 'Saving...',
    leaderboardSubmitted: 'Score submitted',
    leaderboardHint: 'Only available after solving.',
    leaderboardAttempts: 'tries',
    leaderboardError: 'Could not update leaderboard.',
    joinBoardCta: 'Join leaderboard',
    joinBoardTitle: 'Join today\'s leaderboard',
    joinBoardText: 'Want your name on the board? Enter it now.',
    joinBoardCongrats: 'Congrats! Lock in your name and share the win.',
    myScoresTitle: 'Score spotlight',
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
    invalidWord: 'Dit woord staat niet in het woordenboek.',
    wordValidationError: 'Dit woord kon nu niet worden gecontroleerd. Probeer het opnieuw.',
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
    yesterdayWinnerTitle: 'Wereldrecord van deze maand',
    dailyTopperTitle: 'Topper van de dag',
    weeklyTopppersTitle: 'Toppers van deze week',
    weeklyTopppersSubtitle: 'Scorebord van maandag tot zondag',
    yesterdayWinnerEmpty: 'Nog geen wereldrecord deze maand.',
    leaderboardEmpty: 'Nog geen scores vandaag. Jij kan de eerste zijn.',
    leaderboardNameLabel: 'Jouw naam',
    leaderboardNamePlaceholder: 'Vul je naam in',
    leaderboardNameExists: 'Die naam bestaat al als',
    leaderboardNameSuggestion: 'Bedoel je soms',
    leaderboardNameDecision: 'Gebruik de bestaande naam om scores samen te houden, of maak een nieuwe naam.',
    leaderboardNameUseExisting: 'Gebruik bestaande',
    leaderboardNameCreateNew: 'Maak nieuwe',
    leaderboardNameEdit: 'Pas naam aan',
    leaderboardNameCreatedNew: 'Er wordt een nieuwe naam aangemaakt.',
    leaderboardNameRequired: 'Kies eerst: bestaande naam gebruiken of nieuwe naam maken.',
    leaderboardSubmit: 'Score opslaan',
    leaderboardSubmitLoading: 'Opslaan...',
    leaderboardSubmitted: 'Score opgeslagen',
    leaderboardHint: 'Pas beschikbaar nadat je hebt gewonnen.',
    leaderboardAttempts: 'pogingen',
    leaderboardError: 'Scorebord kon niet worden bijgewerkt.',
    joinBoardCta: 'Naar scorebord',
    joinBoardTitle: 'Op het scorebord van vandaag?',
    joinBoardText: 'Wil je op het scorebord? Vul dan nu je naam in.',
    joinBoardCongrats: 'Gefeliciteerd! Zet je naam erbij en maak het officieel.',
    myScoresTitle: 'Score spotlight',
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
    return { guesses: [], evaluations: [], status: 'playing', startedAt: null, durationMs: null };
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.guesses) && Array.isArray(parsed.evaluations) && parsed.status) {
      return {
        guesses: parsed.guesses,
        evaluations: parsed.evaluations,
        status: parsed.status,
        startedAt: Number.isInteger(parsed.startedAt) ? parsed.startedAt : null,
        durationMs: Number.isInteger(parsed.durationMs) ? parsed.durationMs : null
      };
    }
  } catch {
    return { guesses: [], evaluations: [], status: 'playing', startedAt: null, durationMs: null };
  }

  return { guesses: [], evaluations: [], status: 'playing', startedAt: null, durationMs: null };
};



const getMondayWeekStart = (dateKey) => {
  const base = new Date(`${dateKey}T00:00:00`);
  const jsDay = base.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  base.setDate(base.getDate() + mondayOffset);
  return base;
};

const getWeekDateKeys = (dateKey) => {
  const monday = getMondayWeekStart(dateKey);
  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  });
};

const formatWeekdayLabel = (dateKey, language) => {
  const locale = language === 'nl' ? 'nl-NL' : 'en-US';
  const date = new Date(`${dateKey}T00:00:00`);
  const dayLabel = date.toLocaleDateString(locale, { weekday: 'long' });
  const normalizedDayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
  const shortDate = date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  return `${normalizedDayLabel} (${shortDate})`;
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
  const [pendingGuess, setPendingGuess] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const [invalidRow, setInvalidRow] = useState(-1);
  const [popRow, setPopRow] = useState(-1);
  const [error, setError] = useState('');
  const [isCheckingGuess, setIsCheckingGuess] = useState(false);
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
  const [monthlyWorldRecord, setMonthlyWorldRecord] = useState(null);
  const [weeklyTopDays, setWeeklyTopDays] = useState([]);
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
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [nameChoice, setNameChoice] = useState('');

  const dateKey = useMemo(() => getTodayKey(), []);
  const gameStorageKeyRef = useRef(buildStorageKey(language, dateKey));
  const dailySeoJsonLd = useMemo(() => {
    const canonical = `${siteSeo.siteUrl}/word-lee`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({
          name: language === 'nl' ? 'Word-Lee | Dagelijkse woordgame' : 'Word-Lee | Daily word game',
          url: canonical,
          description: language === 'nl'
            ? 'Word-Lee is een dagelijkse woordgame met 5 letters, leaderboard, local-first opslag en een AI assistent voor vragen over deze portfolio.'
            : 'Word-Lee is a daily 5-letter word game with a leaderboard, local-first storage, and an AI assistant for questions about this portfolio.',
          language: language === 'nl' ? 'nl-NL' : 'en-US'
        }),
        createBreadcrumbSchema([
          { name: 'Home', item: siteSeo.siteUrl },
          { name: 'Word-Lee', item: canonical }
        ]),
        {
          '@type': 'SoftwareApplication',
          name: 'Word-Lee',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          url: canonical,
          inLanguage: language === 'nl' ? 'nl-NL' : 'en-US'
        }
      ]
    };
  }, [language]);
  const monthDateKeys = useMemo(() => {
    const base = new Date(`${dateKey}T00:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }).map((_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
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
    gameStorageKeyRef.current = buildStorageKey(language, dateKey);
    setGame(nextState);
    setCurrentGuess('');
    setPendingGuess('');
    setError('');
    setShakeRow(-1);
    setInvalidRow(-1);
    setIsCheckingGuess(false);
    localStorage.setItem('portfolio-language', language);

    const rememberedName = localStorage.getItem(getScoreNameKey(language, dateKey)) || '';
    setScoreName(rememberedName);
    setNameChoice('');
    setMyScoresQuery(rememberedName);
    setScoreSubmitted(localStorage.getItem(getScoreSubmittedKey(language, dateKey)) === '1');
  }, [language, dateKey]);

  useEffect(() => {
    localStorage.setItem(gameStorageKeyRef.current, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    if (game.status !== 'playing' || !Number.isInteger(game.startedAt)) return undefined;
    const timerId = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [game.status, game.startedAt]);

  useEffect(() => {
    setClockNow(Date.now());
  }, [language, dateKey, game.status]);


  useEffect(() => {
    if (game.status === 'won' && !scoreSubmitted) {
      setShowJoinPopup(true);
    }
  }, [game.status, scoreSubmitted]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (game.status !== 'playing' || isCheckingGuess) return;

      if (event.key === 'Enter') {
        submitGuess();
        return;
      }

      if (event.key === 'Backspace') {
        setError('');
        setInvalidRow(-1);
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (LETTER_INPUT_REGEX.test(event.key) && currentGuess.length < WORD_RULES.WORD_LENGTH) {
        const nextChar = normalizeGuessChar(event.key);
        if (nextChar.length !== 1 || !/^[a-z]$/.test(nextChar)) return;
        setError('');
        setInvalidRow(-1);
        setCurrentGuess((prev) => `${prev}${nextChar}`);
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

        const monthlyResponses = await Promise.all(monthDateKeys.map((key) => fetch(`/api/wordlee/leaderboard?date=${key}&language=${language}`)));
        const monthlyData = await Promise.all(monthlyResponses.map((response) => safeJson(response)));

        const monthlyCandidates = [];
        monthlyResponses.forEach((response, index) => {
          if (!response.ok) return;
          const top = Array.isArray(monthlyData[index]?.top3) ? monthlyData[index].top3[0] : null;
          if (top) monthlyCandidates.push({ ...top, dateKey: monthDateKeys[index] });
        });

        monthlyCandidates.sort((a, b) => {
          const aDuration = Number.isInteger(a.durationMs) ? a.durationMs : Number.MAX_SAFE_INTEGER;
          const bDuration = Number.isInteger(b.durationMs) ? b.durationMs : Number.MAX_SAFE_INTEGER;
          if (aDuration !== bDuration) return aDuration - bDuration;
          if (a.attempts !== b.attempts) return a.attempts - b.attempts;
          return String(a.dateKey).localeCompare(String(b.dateKey));
        });

        setMonthlyWorldRecord(monthlyCandidates[0] || null);

        const weekDateKeys = getWeekDateKeys(dateKey);
        const weeklyResponses = await Promise.all(
          weekDateKeys.map((key) => fetch(`/api/wordlee/leaderboard?date=${key}&language=${language}`))
        );
        const weeklyData = await Promise.all(weeklyResponses.map((response) => safeJson(response)));

        const weekRows = weekDateKeys
          .map((key, index) => {
            if (!weeklyResponses[index].ok) return null;
            const entries = Array.isArray(weeklyData[index]?.top3) ? weeklyData[index].top3 : [];
            if (entries.length === 0) return null;
            return {
              dateKey: key,
              label: formatWeekdayLabel(key, language),
              entries
            };
          })
          .filter(Boolean);

        setWeeklyTopDays(weekRows);
      } catch (err) {
        setLeaderboardError(err.message || copy[language].leaderboardError);
        setWeeklyTopDays([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    loadLeaderboard();
  }, [language, dateKey, monthDateKeys]);


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


  const dailyTopper = leaderboard.length > 0 ? leaderboard[0] : null;
  const filteredPlayerOptions = useMemo(() => {
    return playerOptions;
  }, [playerOptions]);
  const nameResolution = useMemo(() => {
    const typedName = scoreName.trim();
    const typedComparable = normalizeComparableName(typedName);
    if (typedName.length < 2 || !typedComparable) return null;

    const candidates = Array.from(new Set(playerOptions.map((name) => String(name || '').trim()).filter(Boolean)));
    if (!candidates.length) return null;

    const exactExisting = candidates.find((candidate) => normalizeComparableName(candidate) === typedComparable);
    if (exactExisting && exactExisting !== typedName) {
      return { kind: 'exact', suggestedName: exactExisting };
    }

    if (exactExisting) return null;

    let best = null;
    for (const candidate of candidates) {
      const candidateComparable = normalizeComparableName(candidate);
      if (!candidateComparable) continue;
      const distance = levenshteinDistance(typedComparable, candidateComparable);
      const ratio = distance / Math.max(typedComparable.length, candidateComparable.length);
      if (!best || distance < best.distance || (distance === best.distance && ratio < best.ratio)) {
        best = { candidate, distance, ratio, candidateComparable };
      }
    }

    if (!best) return null;
    if (Math.min(typedComparable.length, best.candidateComparable.length) < 4) return null;
    if (best.distance <= 2 || best.ratio <= 0.24) {
      return { kind: 'suggestion', suggestedName: best.candidate };
    }

    return null;
  }, [playerOptions, scoreName]);

  const formatDuration = (durationMs) => {
    if (!Number.isInteger(durationMs) || durationMs < 0) return copy[language].durationNA;
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const liveDurationMs = useMemo(() => {
    if (Number.isInteger(game.durationMs)) return game.durationMs;
    if (game.status === 'playing' && Number.isInteger(game.startedAt)) {
      return Math.max(0, clockNow - game.startedAt);
    }
    return 0;
  }, [clockNow, game.durationMs, game.startedAt, game.status]);

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

  const submitGuess = async () => {
    if (game.status !== 'playing' || isCheckingGuess) return;

    const normalizedGuess = normalizeWord(currentGuess);

    if (normalizedGuess.length !== WORD_RULES.WORD_LENGTH) {
      setError(copy[language].invalid);
      setShakeRow(game.guesses.length);
      setTimeout(() => setShakeRow(-1), 380);
      return;
    }

    setIsCheckingGuess(true);
    setPendingGuess(normalizedGuess);
    setCurrentGuess('');

    try {
      const data = await validateWord(language, normalizedGuess);

      if (!data?.valid) {
        setPendingGuess('');
        setCurrentGuess(normalizedGuess);
        setError(copy[language].invalidWord);
        setShakeRow(game.guesses.length);
        setInvalidRow(game.guesses.length);
        setTimeout(() => {
          setShakeRow(-1);
          setInvalidRow(-1);
        }, 380);
        return;
      }

      const nextEvaluation = evaluateGuess(normalizedGuess, answer);
      const nextGuesses = [...game.guesses, normalizedGuess];
      const nextEvaluations = [...game.evaluations, nextEvaluation];

      let status = 'playing';
      if (normalizedGuess === answer) status = 'won';
      if (nextGuesses.length >= WORD_RULES.MAX_GUESSES && normalizedGuess !== answer) status = 'lost';

      const startedAt = Number.isInteger(game.startedAt) ? game.startedAt : Date.now();
      const durationMs = status === 'playing' ? null : Math.max(0, Date.now() - startedAt);

      setInvalidRow(-1);
      setPendingGuess('');
      setGame({ guesses: nextGuesses, evaluations: nextEvaluations, status, startedAt, durationMs });
      setPopRow(nextGuesses.length - 1);
      setTimeout(() => setPopRow(-1), 460);
      setError('');
    } catch (err) {
      setPendingGuess('');
      setCurrentGuess(normalizedGuess);
      setError(err.message || copy[language].wordValidationError);
      setShakeRow(game.guesses.length);
      setTimeout(() => setShakeRow(-1), 380);
    } finally {
      setIsCheckingGuess(false);
    }
  };

  const onVirtualKey = (key) => {
    if (game.status !== 'playing' || isCheckingGuess) return;
    if (key === 'enter') {
      submitGuess();
      return;
    }
    if (key === 'backspace') {
      setError('');
      setInvalidRow(-1);
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (currentGuess.length >= WORD_RULES.WORD_LENGTH) return;
    setError('');
    setInvalidRow(-1);
    setCurrentGuess((prev) => `${prev}${key}`);
  };

  const submitScore = async (event) => {
    event.preventDefault();
    if (game.status !== 'won' || scoreSubmitted) return;

    const typedName = scoreName.trim();
    if (nameResolution && !nameChoice) {
      setLeaderboardError(copy[language].leaderboardNameRequired);
      return;
    }

    const safeName = nameResolution && nameChoice === 'use-existing'
      ? nameResolution.suggestedName
      : typedName;

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
      setNameChoice('');
    } catch (err) {
      setLeaderboardError(err.message || copy[language].leaderboardError);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const applyExistingName = () => {
    if (!nameResolution) return;
    setScoreName(nameResolution.suggestedName);
    setNameChoice('use-existing');
    setLeaderboardError('');
  };

  const chooseCreateNewName = () => {
    setNameChoice('create-new');
    setLeaderboardError('');
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
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
          context: buildAiContext({ page: 'word-lee', language })
        })
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
      <Seo
        title={language === 'nl' ? 'Word-Lee | Dagelijkse woordgame' : 'Word-Lee | Daily word game'}
        description={language === 'nl'
          ? 'Speel Word-Lee, een dagelijkse 5-letter woordgame met leaderboard, local-first opslag en een AI assistent voor vragen over Jaymian-Lee en zijn portfolio.'
          : 'Play Word-Lee, a daily 5-letter word game with a leaderboard, local-first storage, and an AI assistant for questions about Jaymian-Lee and the portfolio.'}
        canonicalPath="/word-lee"
        language={language}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={language === 'nl'
          ? 'Word-Lee dagelijkse woordgame van Jaymian-Lee Reinartz'
          : 'Word-Lee daily word game by Jaymian-Lee Reinartz'}
        jsonLd={dailySeoJsonLd}
      />

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
          <div className="daily-meta-row">
            <p className="daily-meta">{dateKey} · {copy[language].next}</p>
            <p className="daily-timer">{copy[language].durationLabel}: {formatDuration(liveDurationMs)}</p>
          </div>
        </section>




        <section className="daily-grid" aria-label="Word grid">
          {Array.from({ length: WORD_RULES.MAX_GUESSES }).map((_, rowIndex) => {
            const savedGuess = game.guesses[rowIndex] || '';
            const liveGuess = rowIndex === game.guesses.length ? (pendingGuess || currentGuess) : '';
            const letters = (savedGuess || liveGuess).padEnd(WORD_RULES.WORD_LENGTH).split('');

            return (
              <div
                className={`daily-row ${rowIndex === shakeRow ? 'shake' : ''} ${rowIndex === popRow ? 'pop' : ''} ${rowIndex === invalidRow ? 'invalid' : ''} ${rowIndex === game.guesses.length && isCheckingGuess ? 'pending' : ''}`}
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
            {monthlyWorldRecord ? (
              <div className="yesterday-winner-card">
                <span className="winner-crown" aria-hidden="true">👑</span>
                <span className="yesterday-winner-name">{monthlyWorldRecord.name}</span>
                <span className="yesterday-winner-score">{monthlyWorldRecord.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(monthlyWorldRecord.durationMs)} <strong>({copy[language].worldRecord})</strong></span>
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
                <span className="yesterday-winner-score">{dailyTopper.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(dailyTopper.durationMs)}</span>
              </div>
            ) : (
              <p className="daily-tip">{copy[language].leaderboardEmpty}</p>
            )}
          </div>


          <div className="weekly-topppers" aria-label={copy[language].weeklyTopppersTitle}>
            <p className="yesterday-winner-title">{copy[language].weeklyTopppersTitle}</p>
            <p className="leaderboard-subtitle weekly-topppers-subtitle">{copy[language].weeklyTopppersSubtitle}</p>
            {weeklyTopDays.length === 0 ? (
              <p className="daily-tip">{copy[language].leaderboardEmpty}</p>
            ) : (
              <div className="weekly-topppers-grid">
                {weeklyTopDays.map((day) => (
                  <article key={day.dateKey} className="weekly-day-card">
                    <h4 className="weekly-day-title">{day.label}</h4>
                    <ol className="weekly-day-list">
                      {day.entries.map((entry, index) => (
                        <li key={`${day.dateKey}-${entry.name}-${entry.submittedAt || index}`}>
                          <span className="weekly-rank">#{index + 1}</span>
                          <span className="weekly-name">{entry.name}</span>
                          <span className="weekly-score">{entry.attempts} {copy[language].leaderboardAttempts} · {copy[language].durationLabel}: {formatDuration(entry.durationMs)}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>
            )}
          </div>

          {leaderboardLoading && <p className="daily-tip">Loading...</p>}
          {!leaderboardLoading && leaderboard.length === 0 && (
            <p className="daily-tip">{copy[language].leaderboardEmpty}</p>
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
            <button type="button" className="join-popup-close" onClick={() => setShowJoinPopup(false)} aria-label="Close" disabled={leaderboardLoading}>✕</button>
            <div className="join-popup-body">
              <p className="join-popup-kicker">Word-Lee</p>
              <h3>{copy[language].joinBoardTitle}</h3>
              <p className="join-popup-lead">{copy[language].joinBoardText}</p>
              <p className="join-popup-congrats">{copy[language].joinBoardCongrats}</p>
              <form className={`leaderboard-form ${leaderboardLoading ? 'is-loading' : ''}`} onSubmit={submitScore} aria-busy={leaderboardLoading}>
                <label htmlFor="leaderboard-name">{copy[language].leaderboardNameLabel}</label>
                <div className="leaderboard-form-row">
                  <input
                    id="leaderboard-name"
                    type="text"
                    value={scoreName}
                    disabled={leaderboardLoading}
                    onChange={(e) => {
                      setScoreName(e.target.value.slice(0, 24));
                      setNameChoice('');
                      setLeaderboardError('');
                    }}
                    placeholder={copy[language].leaderboardNamePlaceholder}
                  />
                  <button type="submit" disabled={leaderboardLoading}>
                    {leaderboardLoading ? copy[language].leaderboardSubmitLoading : copy[language].leaderboardSubmit}
                  </button>
                </div>
                {nameResolution && (
                  <div className="name-resolution-box" role="status" aria-live="polite">
                    {nameResolution.kind === 'exact' ? (
                      <p className="name-resolution-text">
                        {copy[language].leaderboardNameExists}: <strong>{nameResolution.suggestedName}</strong>
                      </p>
                    ) : (
                      <p className="name-resolution-text">
                        {copy[language].leaderboardNameSuggestion}: <strong>{nameResolution.suggestedName}</strong>?
                      </p>
                    )}
                    <p className="name-resolution-help">{copy[language].leaderboardNameDecision}</p>
                    <div className="name-resolution-actions">
                      <button type="button" className="name-choice-btn" onClick={applyExistingName} disabled={leaderboardLoading}>
                        {copy[language].leaderboardNameUseExisting}
                      </button>
                      <button type="button" className="name-choice-btn ghost" onClick={chooseCreateNewName} disabled={leaderboardLoading}>
                        {copy[language].leaderboardNameCreateNew}
                      </button>
                      <button type="button" className="name-choice-btn ghost" onClick={() => document.getElementById('leaderboard-name')?.focus()} disabled={leaderboardLoading}>
                        {copy[language].leaderboardNameEdit}
                      </button>
                    </div>
                    {nameChoice === 'create-new' && (
                      <p className="name-resolution-note">{copy[language].leaderboardNameCreatedNew}</p>
                    )}
                  </div>
                )}
                {leaderboardLoading && (
                  <div className="leaderboard-submit-skeleton" aria-hidden="true">
                    <span />
                    <span />
                  </div>
                )}
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

      <MainFooter language={language} />

    </main>
  );
}

export default DailyWordPage;
