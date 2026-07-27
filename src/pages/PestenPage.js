import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import AnimatedIcon from '../components/AnimatedIcon';
import LabBackLink from '../components/LabBackLink';
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
    back: 'Terug naar The Lab', title: 'Pesten scorebord', subtitle: 'LocalStorage only, zonder database.',
    setup: 'Setup', targetScore: 'Eindscore (bij deze score lig je eruit)', addName: 'Naam toevoegen', namePlaceholder: 'Bijv. Jay', add: 'Toevoegen', remove: 'Verwijder', startGame: 'Start spel', resetAll: 'Alles resetten',
    runningGame: 'Lopend spel', endScore: 'Eindscore', winner: 'Winnaar', active: 'Actief', score: 'Score', eliminated: 'Uitgeschakeld', place: 'plaats', newGame: 'Nieuw spel opzetten', history: 'Historie (laatste 25)', noHistory: 'Nog geen afgeronde spellen.', ask: 'Vragen?',
    guide: {
      eyebrow: 'Handleiding', title: 'Zo werkt het Pesten-scorebord.',
      lead: 'Pesten kent veel huisregels. Hieronder staat een veelgebruikte Nederlandse basisvariant. Spreek vóór je begint af welke acties en straffen jullie precies gebruiken; dit scorebord blijft bewust flexibel voor jullie eigen puntensysteem.',
      roundsTitle: 'Benodigdheden en doel', roundsText: 'Speel met minstens twee spelers, een volledig pak van 52 kaarten en meestal jokers. Deel vaak zeven kaarten per speler. Leg de rest als trekstapel neer en draai één startkaart om. Wie als eerste alle handkaarten legaal weg speelt, wint de ronde.',
      rulesTitle: 'Veelgebruikte actiekaarten', rulesText: 'Deze effecten komen vaak voor in Nederlands Pesten. Zijn jullie iets anders gewend? Kies jullie huisregel en houd die de hele ronde aan.',
      gameTitle: 'Een ronde spelen',
      gameSteps: [
        { title: 'Kijk naar de bovenste kaart', text: 'Speel met de klok mee. Je mag meestal een kaart leggen met dezelfde kleur of dezelfde waarde als de bovenste kaart van de aflegstapel.' },
        { title: 'Kun je niet leggen?', text: 'Trek één kaart van de trekstapel. Mag die kaart direct op de aflegstapel, dan mogen jullie afspreken dat je hem meteen speelt.' },
        { title: 'Los acties meteen op', text: 'Een pestkaart verandert de beurt, laat iemand trekken of geeft je een extra beurt. Maak eerst het effect af voordat de volgende speler speelt.' },
        { title: 'Roep laatste kaart', text: 'Heb je nog één kaart? Zeg “laatste kaart” of klop op tafel, afhankelijk van jullie afspraak. Vergeet je het, dan volgt vaak een strafkaart.' },
        { title: 'Win de ronde', text: 'Leg je laatste kaart volgens jullie regels af, dan win je. Veel groepen staan niet toe dat een actiekaart de allerlaatste kaart is. Spreek dit vooraf af.' }
      ],
      actions: [
        { card: '2', title: 'Twee pakken', text: 'De volgende speler legt een 2 terug of pakt twee kaarten. Stapelen is een veelgebruikte huisregel.' },
        { card: '7', title: 'Zeven blijft kleven', text: 'Je mag nog een kaart spelen.' },
        { card: '8', title: 'Acht wacht', text: 'De volgende speler slaat een beurt over.' },
        { card: 'J', title: 'Boer kiest kleur', text: 'Een boer mag vaak altijd; de speler kiest de kleur waarmee verder wordt gespeeld.' },
        { card: 'joker', title: 'Joker', text: 'De volgende speler legt een joker terug of pakt vaak vijf kaarten. Dit aantal is een huisregel.' }
      ],
      scoreTitle: 'Stand bijhouden',
      steps: [
        { title: 'Kies jullie limiet', text: 'Laat 10 staan of kies de eindscore die bij jullie spel past.' },
        { title: 'Voeg alle spelers toe', text: 'Typ een naam en start zodra er minimaal twee spelers klaarstaan.' },
        { title: 'Verwerk een ronde', text: 'Geef na iedere ronde een strafpunt met +1. Tik vaker als iemand meerdere punten krijgt; −1 corrigeert een invoerfout.' },
        { title: 'Speel door tot één winnaar', text: 'Wie de eindscore bereikt, wordt automatisch uitgeschakeld. De laatste actieve speler wint.' }
      ],
      exampleTitle: 'Voorbeelden', exampleText: 'Er ligt ruiten 9. Jij mag een ruitenkaart of een 9 van een andere kleur spelen. Legt iemand daarna een 2, dan legt de volgende speler een 2 terug of pakt twee kaarten volgens jullie afspraak. Voor een speelavond tot 10: Sam staat op 7 en krijgt 3 strafpunten na een ronde; tik drie keer op +1 en Sam ligt eruit.',
      note: 'Tip: dit bord bewaart alleen namen, stand en de laatste 25 afgeronde spellen op dit apparaat. Het deelt niets met anderen en heeft geen database.'
    }
  },
  en: {
    back: 'Back to The Lab', title: 'Pesten scoreboard', subtitle: 'LocalStorage only, no database.',
    setup: 'Setup', targetScore: 'End score (at this score you are out)', addName: 'Add name', namePlaceholder: 'e.g. Jay', add: 'Add', remove: 'Remove', startGame: 'Start game', resetAll: 'Reset all',
    runningGame: 'Current game', endScore: 'End score', winner: 'Winner', active: 'Active', score: 'Score', eliminated: 'Eliminated', place: 'place', newGame: 'Set up new game', history: 'History (last 25)', noHistory: 'No finished games yet.', ask: 'Questions?',
    guide: {
      eyebrow: 'Guide', title: 'How the Pesten scoreboard works.',
      lead: 'Pesten has many house rules. This guide uses a common Dutch base variant. Agree your exact actions and penalties before you start; this board deliberately stays flexible for your own scoring system.',
      roundsTitle: 'What you need and the goal', roundsText: 'Play with at least two players, a full 52-card deck and usually jokers. Deal seven cards to each player, make a draw pile, then turn one starter card face up. The first player to legally play all cards from their hand wins the round.',
      rulesTitle: 'Common action cards', rulesText: 'These effects are common in Dutch Pesten. If your table knows a different version, agree it first and use it consistently for the whole round.',
      gameTitle: 'Playing a round',
      gameSteps: [
        { title: 'Read the top card', text: 'Play clockwise. You can usually play a card that matches either the suit or the value of the top card on the discard pile.' },
        { title: 'Cannot play?', text: 'Draw one card from the draw pile. If it is playable, your table can agree that it may be played straight away.' },
        { title: 'Resolve actions immediately', text: 'An action card changes the turn, makes someone draw, or gives you another play. Finish its effect before the next player acts.' },
        { title: 'Call your last card', text: 'When you have one card left, say “last card” or knock on the table, depending on your agreement. Forgetting it often means a penalty card.' },
        { title: 'Win the round', text: 'Play your last card legally to win. Many tables do not allow an action card as the final card, so agree this before dealing.' }
      ],
      actions: [
        { card: '2', title: 'Draw two', text: 'The next player plays a 2 back or draws two cards. Stacking is a common house rule.' },
        { card: '7', title: 'Play again', text: 'You may immediately play another card.' },
        { card: '8', title: 'Wait', text: 'The next player skips a turn.' },
        { card: 'J', title: 'Jack chooses suit', text: 'A jack is often playable at any time; the player chooses the suit that continues.' },
        { card: 'joker', title: 'Joker', text: 'The next player plays another joker or often draws five cards. The amount is a house rule.' }
      ],
      scoreTitle: 'Keeping score',
      steps: [
        { title: 'Choose your limit', text: 'Keep 10 or set the end score that fits your game.' },
        { title: 'Add every player', text: 'Type a name and start once at least two players are ready.' },
        { title: 'Log a round', text: 'Give a penalty point with +1 after every round. Tap again for multiple points; −1 corrects an input mistake.' },
        { title: 'Play until one winner remains', text: 'Reaching the end score eliminates a player automatically. The last active player wins.' }
      ],
      exampleTitle: 'Examples', exampleText: 'The pile shows the 9 of diamonds. You may play a diamond or a 9 of another suit. If someone then plays a 2, the next player plays another 2 or draws two under your agreement. For a game to 10: Sam is on 7 and receives 3 penalty points after a round; press +1 three times and Sam is out.',
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
        createBreadcrumbSchema([{ name: 'Home', item: `${siteSeo.siteUrl}${localizePath('/', language)}` }, { name: 'The Lab', item: `${siteSeo.siteUrl}${localizePath('/lab', language)}` }, { name: title, item: canonical }])
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
        <header className="toepen-header"><LabBackLink to={localizePath('/lab', language)}>{t.back}</LabBackLink><h1>{t.title}</h1><p>{t.subtitle}</p></header>
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
        <details className="toepen-guide"><summary><span className="toepen-guide-summary-copy"><small>{t.guide.eyebrow}</small><strong>{t.guide.title}</strong></span><span className="toepen-guide-toggle" aria-hidden="true"><AnimatedIcon name="plus" size={18} /></span></summary><div className="toepen-guide-body"><p className="toepen-guide-lead">{t.guide.lead}</p><div className="toepen-guide-basics"><section><h2>{t.guide.roundsTitle}</h2><p>{t.guide.roundsText}</p></section><section><h2>{t.guide.rulesTitle}</h2><p>{t.guide.rulesText}</p></section></div><section className="toepen-guide-score"><h2>{t.guide.gameTitle}</h2><ol className="toepen-guide-steps">{t.guide.gameSteps.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section><section className="toepen-guide-actions" aria-label={t.guide.rulesTitle}>{t.guide.actions.map((action) => <article key={action.card}><span>{action.card === 'joker' ? <AnimatedIcon name="sparkles" size={18} /> : action.card}</span><div><h3>{action.title}</h3><p>{action.text}</p></div></article>)}</section><section className="toepen-guide-score"><h2>{t.guide.scoreTitle}</h2><ol className="toepen-guide-steps">{t.guide.steps.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section><aside className="toepen-guide-example"><p>{t.guide.exampleTitle}</p><strong>7 + 3 = 10</strong><span>{t.guide.exampleText}</span></aside><p className="toepen-guide-note">{t.guide.note}</p></div></details>
      </div>
      <FloatingUtilityBar language={language} onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, isNl ? 'en' : 'nl', location.search, location.hash))} theme={theme} onToggleTheme={() => setTheme((previous) => previous === 'dark' ? 'light' : 'dark')} askLabel={isNl ? 'Mail' : 'Email'} askAriaLabel={isNl ? 'Stuur een e-mail' : 'Send an email'} onAsk={() => { window.location.href = 'mailto:info@jaymian-lee.nl'; }} />
    </main>
  );
}
