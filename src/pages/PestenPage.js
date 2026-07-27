import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { getAlternateLocalePaths, getLanguageSwitchPath, getLocaleFromPathname, localizePath } from '../utils/locale';
import './ToepenPage.css';

const STATE_KEY = 'pesten-scoreboard-state-v1';
const HISTORY_KEY = 'pesten-scoreboard-history-v1';

const createPlayer = (name) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: name.trim(),
  score: 0,
  eliminated: false,
  place: null
});

const initialState = () => ({ setupNames: [], targetScore: 10, game: null });

const copy = {
  nl: {
    back: '← Terug naar portfolio', title: 'Pesten scorebord', subtitle: 'LocalStorage only, zonder database.',
    setup: 'Setup', targetScore: 'Eindscore (bij deze score lig je eruit)', addName: 'Naam toevoegen', namePlaceholder: 'Bijv. Jay', add: 'Toevoegen', remove: 'Verwijder', startGame: 'Start spel', resetAll: 'Alles resetten',
    runningGame: 'Lopend spel', endScore: 'Eindscore', winner: 'Winnaar', active: 'Actief', score: 'Score', eliminated: 'Uitgeschakeld', place: 'plaats', newGame: 'Nieuw spel opzetten', history: 'Historie (laatste 25)', noHistory: 'Nog geen afgeronde spellen.', ask: 'Vragen?',
    guide: {
      eyebrow: 'Handleiding', title: 'Zo werkt het Pesten-scorebord.',
      lead: 'Pesten kent veel huisregels. Dit bord is daarom gemaakt voor jullie eigen puntensysteem: voer na elke ronde precies de straf- of rondepunten in waar jullie aan tafel voor kiezen.',
      roundsTitle: 'Pesten in het kort', roundsText: 'Iedere speler probeert als eerste zijn of haar kaarten kwijt te raken. Actiekaarten en afspraken aan tafel bepalen wie kaarten pakt of extra punten krijgt.',
      rulesTitle: 'Spreek dit eerst af', rulesText: 'Bepaal vóór de eerste ronde welke kaarten acties zijn, hoe strafpunten tellen en wanneer iemand bij de eindscore uit het spel ligt.',
      scoreTitle: 'Stand bijhouden',
      steps: [
        { title: 'Kies jullie limiet', text: 'Laat 10 staan of kies de eindscore die bij jullie spel past.' },
        { title: 'Voeg alle spelers toe', text: 'Typ een naam en start zodra er minimaal twee spelers klaarstaan.' },
        { title: 'Verwerk een ronde', text: 'Geef na iedere ronde een strafpunt met +1. Tik vaker als iemand meerdere punten krijgt; −1 corrigeert een invoerfout.' },
        { title: 'Speel door tot één winnaar', text: 'Wie de eindscore bereikt, wordt automatisch uitgeschakeld. De laatste actieve speler wint.' }
      ],
      exampleTitle: 'Voorbeeld', exampleText: 'Jullie spelen tot 10. Sam staat op 7 en krijgt na een ronde 3 strafpunten. Tik drie keer op +1: Sam komt op 10 en ligt eruit. De rest speelt door.',
      note: 'Tip: dit bord bewaart alleen namen, stand en de laatste 25 afgeronde spellen op dit apparaat. Het deelt niets met anderen en heeft geen database.'
    }
  },
  en: {
    back: '← Back to portfolio', title: 'Pesten scoreboard', subtitle: 'LocalStorage only, no database.',
    setup: 'Setup', targetScore: 'End score (at this score you are out)', addName: 'Add name', namePlaceholder: 'e.g. Jay', add: 'Add', remove: 'Remove', startGame: 'Start game', resetAll: 'Reset all',
    runningGame: 'Current game', endScore: 'End score', winner: 'Winner', active: 'Active', score: 'Score', eliminated: 'Eliminated', place: 'place', newGame: 'Set up new game', history: 'History (last 25)', noHistory: 'No finished games yet.', ask: 'Questions?',
    guide: {
      eyebrow: 'Guide', title: 'How the Pesten scoreboard works.',
      lead: 'Pesten has many house rules. This board is deliberately flexible: after each round, enter the penalty or round points your table agreed on.',
      roundsTitle: 'Pesten in brief', roundsText: 'Every player tries to get rid of their cards first. Action cards and table agreements decide who draws cards or receives extra points.',
      rulesTitle: 'Agree this first', rulesText: 'Before the first round, decide which cards are actions, how penalty points count, and when someone is out at the end score.',
      scoreTitle: 'Keeping score',
      steps: [
        { title: 'Choose your limit', text: 'Keep 10 or set the end score that fits your game.' },
        { title: 'Add every player', text: 'Type a name and start once at least two players are ready.' },
        { title: 'Log a round', text: 'Give a penalty point with +1 after every round. Tap again for multiple points; −1 corrects an input mistake.' },
        { title: 'Play until one winner remains', text: 'Reaching the end score eliminates a player automatically. The last active player wins.' }
      ],
      exampleTitle: 'Example', exampleText: 'You play to 10. Sam is on 7 and receives 3 penalty points after a round. Press +1 three times: Sam reaches 10 and is out. Everyone else keeps playing.',
      note: 'Tip: this board stores only names, scores, and the last 25 finished games on this device. It has no database and shares nothing with anyone.'
    }
  }
};

export default function PestenPage() {
  const [nameInput, setNameInput] = useState('');
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);
  const isNl = language === 'nl';
  const canonicalPath = localizePath('/pesten', language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark');
  const t = copy[language] || copy.en;

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STATE_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedState) setState(JSON.parse(savedState));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch {
      setState(initialState());
      setHistory([]);
    }
  }, []);

  useEffect(() => { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('portfolio-theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.setAttribute('lang', language); localStorage.setItem('portfolio-language', language); }, [language]);

  const game = state.game;
  const setupPlayers = state.setupNames || [];
  const activePlayers = useMemo(() => game?.players.filter((player) => !player.eliminated) || [], [game]);
  const winnerName = game?.finished ? game.players.find((player) => player.id === game.winnerId)?.name : null;
  const pageJsonLd = useMemo(() => {
    const canonical = `${siteSeo.siteUrl}${canonicalPath}`;
    const title = isNl ? 'Pesten scorebord' : 'Pesten scoreboard';
    const description = isNl ? 'Lokaal Pesten scorebord met flexibele eindscore, snelle invoer en spelhistorie.' : 'Local Pesten scoreboard with a flexible end score, quick input, and game history.';
    return {
      '@context': 'https://schema.org',
      '@graph': [
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({ name: title, url: canonical, description, language: isNl ? 'nl-NL' : 'en-US' }),
        createBreadcrumbSchema([{ name: 'Home', item: `${siteSeo.siteUrl}${localizePath('/', language)}` }, { name: title, item: canonical }])
      ]
    };
  }, [canonicalPath, isNl, language]);

  const addName = () => {
    const name = nameInput.trim();
    if (!name || setupPlayers.some((player) => player.toLowerCase() === name.toLowerCase())) return setNameInput('');
    setState((previous) => ({ ...previous, setupNames: [...previous.setupNames, name] }));
    setNameInput('');
  };

  const startGame = () => {
    if (setupPlayers.length < 2) return;
    const players = setupPlayers.map(createPlayer);
    setState((previous) => ({ ...previous, game: { id: `${Date.now()}`, startedAt: new Date().toISOString(), targetScore: Number(previous.targetScore) || 10, finished: false, winnerId: null, players } }));
  };

  const changeScore = (playerId, delta) => {
    setState((previous) => {
      if (!previous.game || previous.game.finished) return previous;
      const currentGame = previous.game;
      const nextPlayers = currentGame.players.map((player) => {
        if (player.id !== playerId || player.eliminated) return player;
        const score = Math.max(0, player.score + delta);
        const eliminated = score >= currentGame.targetScore;
        return { ...player, score, eliminated, place: eliminated ? currentGame.players.filter((item) => !item.eliminated).length : null };
      });
      const remaining = nextPlayers.filter((player) => !player.eliminated);
      if (remaining.length !== 1) return { ...previous, game: { ...currentGame, players: nextPlayers } };
      const winnerId = remaining[0].id;
      const players = nextPlayers.map((player) => player.id === winnerId ? { ...player, place: 1 } : player);
      const finishedAt = new Date().toISOString();
      const finishedGame = { ...currentGame, players, finished: true, winnerId, finishedAt };
      setHistory((previousHistory) => [{ id: currentGame.id, targetScore: currentGame.targetScore, finishedAt, results: [...players].sort((a, b) => a.place - b.place).map(({ name, place, score }) => ({ name, place, score })) }, ...previousHistory].slice(0, 25));
      return { ...previous, game: finishedGame };
    });
  };

  const clearAll = () => { setState(initialState()); setHistory([]); localStorage.removeItem(STATE_KEY); localStorage.removeItem(HISTORY_KEY); };

  return (
    <main className="toepen-page ui-page">
      <Seo title={`${t.title} | Jaymian-Lee Reinartz`} description={isNl ? 'Lokaal Pesten scorebord met flexibele eindscore, snelle invoer en spelhistorie.' : 'Local Pesten scoreboard with a flexible end score, quick input, and game history.'} canonicalPath={canonicalPath} language={language} alternatePaths={alternatePaths} defaultLocalePath={alternatePaths.en} image={`${siteSeo.siteUrl}/jay.png`} imageAlt={isNl ? 'Pesten scorebord van Jaymian-Lee Reinartz' : 'Pesten scoreboard by Jaymian-Lee Reinartz'} jsonLd={pageJsonLd} />
      <div className="toepen-wrap ui-container">
        <header className="toepen-header"><Link to={localizePath('/', language)} className="toepen-back">{t.back}</Link><h1>{t.title}</h1><p>{t.subtitle}</p></header>
        <section className="toepen-card">
          <h2>{t.setup}</h2>
          <label className="toepen-label" htmlFor="pesten-target-score">{t.targetScore}</label>
          <input id="pesten-target-score" type="number" min="1" value={state.targetScore} onChange={(event) => setState((previous) => ({ ...previous, targetScore: Math.max(1, Number(event.target.value) || 1) }))} />
          <label className="toepen-label" htmlFor="pesten-name-input">{t.addName}</label>
          <div className="toepen-row"><input id="pesten-name-input" type="text" value={nameInput} onChange={(event) => setNameInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addName(); }} placeholder={t.namePlaceholder} /><button type="button" onClick={addName}>{t.add}</button></div>
          <ul className="toepen-names">{setupPlayers.map((name) => <li key={name}><span>{name}</span><button type="button" onClick={() => setState((previous) => ({ ...previous, setupNames: previous.setupNames.filter((item) => item !== name) }))}>{t.remove}</button></li>)}</ul>
          <div className="toepen-row"><button type="button" onClick={startGame} disabled={setupPlayers.length < 2}>{t.startGame}</button><button type="button" className="ghost" onClick={clearAll}>{t.resetAll}</button></div>
        </section>
        {game && <section className="toepen-card"><h2>{t.runningGame}</h2><p>{t.endScore}: <strong>{game.targetScore}</strong></p>{game.finished ? <p className="winner">{t.winner}: <strong>{winnerName}</strong></p> : <p>{t.active}: {activePlayers.map((player) => player.name).join(', ')}</p>}<ul className="toepen-scores">{game.players.map((player) => <li key={player.id} className={player.eliminated ? 'out' : ''}><div className="toepen-score-badge" aria-label={`${t.score} ${player.score}`}>{player.score}</div><div className="toepen-player-main"><strong>{player.name}</strong>{player.eliminated && <p>{t.eliminated} ({t.place} {player.place})</p>}</div><div className="toepen-score-actions"><button type="button" disabled={game.finished || player.eliminated || player.score === 0} onClick={() => changeScore(player.id, -1)}>−1</button><button type="button" disabled={game.finished || player.eliminated} onClick={() => changeScore(player.id, 1)}>+1</button></div></li>)}</ul><button type="button" className="ghost" onClick={() => setState((previous) => ({ ...previous, game: null }))}>{t.newGame}</button></section>}
        <section className="toepen-card"><h2>{t.history}</h2>{history.length === 0 ? <p>{t.noHistory}</p> : <div className="history-list">{history.map((item) => <article key={item.id}><p><strong>{new Date(item.finishedAt).toLocaleString(isNl ? 'nl-NL' : 'en-US')}</strong> · {t.endScore} {item.targetScore}</p><ol>{item.results.map((row) => <li key={`${item.id}-${row.name}`}>#{row.place} {row.name} ({row.score})</li>)}</ol></article>)}</div>}</section>
        <details className="toepen-guide"><summary><span className="toepen-guide-summary-copy"><small>{t.guide.eyebrow}</small><strong>{t.guide.title}</strong></span><span className="toepen-guide-toggle" aria-hidden="true">+</span></summary><div className="toepen-guide-body"><p className="toepen-guide-lead">{t.guide.lead}</p><div className="toepen-guide-basics"><section><h2>{t.guide.roundsTitle}</h2><p>{t.guide.roundsText}</p></section><section><h2>{t.guide.rulesTitle}</h2><p>{t.guide.rulesText}</p></section></div><section className="toepen-guide-score"><h2>{t.guide.scoreTitle}</h2><ol className="toepen-guide-steps">{t.guide.steps.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section><aside className="toepen-guide-example"><p>{t.guide.exampleTitle}</p><strong>7 + 3 = 10</strong><span>{t.guide.exampleText}</span></aside><p className="toepen-guide-note">{t.guide.note}</p></div></details>
      </div>
      <FloatingUtilityBar language={language} onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, isNl ? 'en' : 'nl', location.search, location.hash))} theme={theme} onToggleTheme={() => setTheme((previous) => previous === 'dark' ? 'light' : 'dark')} askLabel={t.ask} askAriaLabel={t.ask} onAsk={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </main>
  );
}
