import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import LabBackLink from '../components/LabBackLink';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { getAlternateLocalePaths, getLanguageSwitchPath, getLocaleFromPathname, localizePath } from '../utils/locale';
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
    back: 'Terug naar The Lab',
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
    noHistory: 'Nog geen afgeronde spellen.',
    guide: {
      eyebrow: 'Handleiding',
      title: 'Zo werken Toepen en dit scorebord.',
      lead: 'Toepen is een kaartspel vol slagen, bluf en strafpunten. Dit bord bewaart de stand; jullie bepalen zelf welke huisregels aan tafel gelden.',
      roundsTitle: 'De basis in één minuut',
      roundsText: 'Speel met 2 tot 8 spelers en een pak van 32 kaarten. Iedereen krijgt vier kaarten. Volg kleur als je kunt; de hoogste kaart in de gevraagde kleur wint de slag. De winnaar van de vierde slag wint de hand.',
      orderTitle: 'Kaartvolgorde',
      orderText: 'Van sterk naar zwak: 10, 9, 8, 7, aas, heer, vrouw, boer.',
      gameTitle: 'Een hand spelen',
      gameSteps: [
        { title: 'Deel en kom uit', text: 'De deler geeft iedereen vier kaarten. De speler links van de deler komt uit met een kaart; er is geen troef.' },
        { title: 'Volg kleur als dat kan', text: 'Heb je de gevraagde kleur, dan moet je die spelen. Kun je niet volgen, dan mag je een andere kleur wegspelen.' },
        { title: 'Bepaal de slag', text: 'De hoogste kaart van de kleur waarmee is uitgekomen wint. De winnaar opent de volgende slag.' },
        { title: 'Alleen slag vier telt', text: 'Na vier slagen wint degene met de vierde slag de hand. De andere spelers krijgen de afgesproken inzet als strafpunten.' },
        { title: 'Durf te toepen', text: 'Wil je de inzet verhogen? Toep voordat je een kaart speelt. De andere spelers gaan mee of passen volgens jullie afspraak.' }
      ],
      scoreTitle: 'Score bijhouden',
      steps: [
        { title: 'Kies de eindscore', text: 'Standaard is 10. Wie die score bereikt, ligt uit het spel.' },
        { title: 'Voeg alle spelers toe', text: 'Typ een naam, kies Toevoegen en start zodra er minstens twee spelers klaarstaan.' },
        { title: 'Verwerk elke hand', text: 'Klik +1 voor iedere strafpunt die iemand krijgt. Gebruik −1 meteen als je een punt te veel hebt ingevoerd.' },
        { title: 'Laat het bord rangschikken', text: 'Bij de eindscore markeert het bord een speler automatisch als uitgeschakeld. De laatste actieve speler wint.' }
      ],
      exampleTitle: 'Voorbeeld',
      exampleText: 'De eindscore is 10. Jay staat op 8 en krijgt na een hand 2 strafpunten: tik twee keer op +1. Jay komt op 10 en ligt eruit. Iemand op 3 die één strafpunt krijgt, eindigt gewoon op 4.',
      note: 'Tip: spreken jullie een andere toep- of pasregel af? Geen probleem. Voer alleen het uiteindelijke aantal strafpunten van de hand in. De laatste 25 afgeronde spellen blijven alleen op dit apparaat bewaard.'
    }
  },
  en: {
    back: 'Back to The Lab',
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
    noHistory: 'No finished games yet.',
    guide: {
      eyebrow: 'Guide',
      title: 'How Toepen and this scoreboard work.',
      lead: 'Toepen is a trick-taking card game built around bluffing and penalty points. This board tracks the score while your table keeps its own house rules.',
      roundsTitle: 'The basics in one minute',
      roundsText: 'Play with 2 to 8 players and a 32-card deck. Everyone receives four cards. Follow suit whenever possible; the highest card in the led suit wins the trick. The winner of the fourth trick wins the hand.',
      orderTitle: 'Card order',
      orderText: 'Strongest to weakest: 10, 9, 8, 7, ace, king, queen, jack.',
      gameTitle: 'Playing a hand',
      gameSteps: [
        { title: 'Deal and lead', text: 'The dealer gives everyone four cards. The player to the dealer’s left leads one card; there is no trump suit.' },
        { title: 'Follow suit when possible', text: 'If you hold the led suit, you must play it. If you cannot follow, you may discard any other suit.' },
        { title: 'Resolve the trick', text: 'The highest card in the led suit wins. That player leads the next trick.' },
        { title: 'Only trick four counts', text: 'After four tricks, the player who won the fourth wins the hand. The others receive the agreed stake as penalty points.' },
        { title: 'Raise by toeping', text: 'Want to raise the stake? Toep before playing a card. The other players continue or pass under your table’s agreement.' }
      ],
      scoreTitle: 'Keeping score',
      steps: [
        { title: 'Choose the end score', text: 'The default is 10. Reaching that score eliminates a player.' },
        { title: 'Add every player', text: 'Type a name, choose Add, then start once at least two players are ready.' },
        { title: 'Log each hand', text: 'Press +1 for every penalty point a player receives. Use −1 immediately if you entered one too many.' },
        { title: 'Let the board rank the game', text: 'At the end score, a player is automatically marked eliminated. The last active player wins.' }
      ],
      exampleTitle: 'Example',
      exampleText: 'The end score is 10. Jay is on 8 and receives 2 penalty points after a hand: press +1 twice. Jay reaches 10 and is eliminated. A player on 3 who receives one penalty simply moves to 4.',
      note: 'Tip: do you play with a different toep or pass rule? That is fine. Only enter the final number of penalty points from the hand. The last 25 finished games are saved on this device only.'
    }
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

const detectBrowserTheme = () => {
  return 'dark';
};

function ToepenPage() {
  const [nameInput, setNameInput] = useState('');
  const [state, setState] = useState(createInitialState);
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);
  const canonicalPath = localizePath('/toepen', language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);
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
  const toePenSeoJsonLd = useMemo(() => {
    const canonical = `${siteSeo.siteUrl}${canonicalPath}`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({
          name: language === 'nl' ? 'Toepen scorebord' : 'Toepen scoreboard',
          url: canonical,
          description: language === 'nl'
            ? 'Een lokaal scorebord voor Toepen met snelle invoer, historische gamegeschiedenis en duidelijke statussen.'
            : 'A local Toepen scoreboard with fast input, game history, and clear status tracking.',
          language: language === 'nl' ? 'nl-NL' : 'en-US'
        }),
        createBreadcrumbSchema([
          { name: 'Home', item: siteSeo.siteUrl },
          { name: 'The Lab', item: `${siteSeo.siteUrl}${localizePath('/lab', language)}` },
          { name: 'Toepen', item: canonical }
        ])
      ]
    };
  }, [canonicalPath, language]);

  return (
    <main className="toepen-page ui-page">
      <Seo
        title={language === 'nl' ? 'Toepen scorebord' : 'Toepen scoreboard'}
        description={language === 'nl'
          ? 'Toepen scorebord met localStorage-only opslag, snelle score-invoer en een complete spelgeschiedenis voor game nights.'
          : 'Toepen scoreboard with localStorage-only storage, fast score entry, and full game history for game nights.'}
        canonicalPath={canonicalPath}
        language={language}
        alternatePaths={alternatePaths}
        defaultLocalePath={alternatePaths.en}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={language === 'nl'
          ? 'Toepen scorebord van Jaymian-Lee Reinartz'
          : 'Toepen scoreboard by Jaymian-Lee Reinartz'}
        jsonLd={toePenSeoJsonLd}
      />

      <div className="toepen-wrap ui-container">
        <header className="toepen-header">
          <LabBackLink to={localizePath('/lab', language)}>{t.back}</LabBackLink>
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
                    {player.eliminated ? <p>{t.eliminated} ({t.place} {player.place})</p> : null}
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

        <details className="toepen-guide">
          <summary>
            <span className="toepen-guide-summary-copy"><small>{t.guide.eyebrow}</small><strong>{t.guide.title}</strong></span>
            <span className="toepen-guide-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="toepen-guide-body">
            <p className="toepen-guide-lead">{t.guide.lead}</p>
            <div className="toepen-guide-basics">
              <section>
                <h2>{t.guide.roundsTitle}</h2>
                <p>{t.guide.roundsText}</p>
              </section>
              <section>
                <h2>{t.guide.orderTitle}</h2>
                <p>{t.guide.orderText}</p>
                <div className="toepen-card-order" aria-label={t.guide.orderTitle}>
                  {['10', '9', '8', '7', 'A', 'K', 'Q', 'J'].map((card) => <span key={card}>{card}</span>)}
                </div>
              </section>
            </div>
            <section className="toepen-guide-score">
              <h2>{t.guide.gameTitle}</h2>
              <ol className="toepen-guide-steps">
                {t.guide.gameSteps.map((step, index) => (
                  <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
                ))}
              </ol>
            </section>
            <section className="toepen-guide-score">
              <h2>{t.guide.scoreTitle}</h2>
              <ol className="toepen-guide-steps">
                {t.guide.steps.map((step, index) => (
                  <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
                ))}
              </ol>
            </section>
            <aside className="toepen-guide-example">
              <p>{t.guide.exampleTitle}</p>
              <strong>8 + 2 = 10</strong>
              <span>{t.guide.exampleText}</span>
            </aside>
            <p className="toepen-guide-note">{t.guide.note}</p>
          </div>
        </details>
      </div>

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, language === 'en' ? 'nl' : 'en', location.search, location.hash))}
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
