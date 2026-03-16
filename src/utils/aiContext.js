const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const pickToepenSnapshot = () => {
  const state = safeParse(localStorage.getItem('toepen-state-v1'), null);
  const history = safeParse(localStorage.getItem('toepen-history-v1'), []);

  if (!state) {
    return {
      hasData: false,
      activeGame: null,
      recentGames: []
    };
  }

  const activeGame = state.game
    ? {
        targetScore: state.game.targetScore,
        finished: Boolean(state.game.finished),
        winnerId: state.game.winnerId || null,
        players: Array.isArray(state.game.players)
          ? state.game.players.map((p) => ({
              name: p.name,
              score: p.score,
              eliminated: Boolean(p.eliminated),
              place: p.place ?? null
            }))
          : []
      }
    : null;

  return {
    hasData: true,
    setupNames: Array.isArray(state.setupNames) ? state.setupNames : [],
    targetScore: state.targetScore ?? null,
    activeGame,
    recentGames: Array.isArray(history)
      ? history.slice(0, 5).map((g) => ({
          finishedAt: g.finishedAt,
          targetScore: g.targetScore,
          results: Array.isArray(g.results) ? g.results : []
        }))
      : []
  };
};

const pickWordleeSnapshot = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith('wordlee-') || key.startsWith('wordlee:') || key.startsWith('daily-word:')) {
      keys.push(key);
    }
  }

  const values = keys.slice(0, 30).map((key) => {
    const raw = localStorage.getItem(key);
    const parsed = safeParse(raw, raw);
    return { key, value: parsed };
  });

  return {
    keyCount: keys.length,
    items: values
  };
};

const pickSp500Snapshot = () => {
  const state = safeParse(localStorage.getItem('sp500-calculator-settings-v1'), null);
  if (!state) {
    return { hasData: false };
  }

  return {
    hasData: true,
    initialInvestment: Number(state.initialInvestment) || 0,
    monthlyContribution: Number(state.monthlyContribution) || 0,
    currentAge: Number(state.currentAge) || null,
    endAge: Number(state.endAge) || null,
    selectedPeriodId: state.selectedPeriodId || null,
    targetAmount: Number(state.targetAmount) || 0,
    customAnnualReturnPct: Number(state.customAnnualReturnPct) || 0
  };
};

export const buildAiContext = ({ page, language }) => {
  return {
    page,
    language,
    profile: {
      name: 'Jaymian-Lee Reinartz',
      location: 'Limburg, Netherlands',
      focus: ['AI automation', 'ecommerce growth', 'full stack development']
    },
    localData: {
      toepen: pickToepenSnapshot(),
      wordlee: pickWordleeSnapshot(),
      sp500: pickSp500Snapshot(),
      ui: {
        theme: localStorage.getItem('portfolio-theme') || null,
        language: localStorage.getItem('portfolio-language') || language || null
      }
    }
  };
};
