import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import MainFooter from '../components/MainFooter';
import './SP500CalculatorPage.css';

const SITE_URL = 'https://jaymian-lee.nl';
const PAGE_PATH = '/sp500-calculator';

const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const HISTORICAL_PERIODS = [
  { id: '10y', label: 'Gemiddelde laatste 10 jaar', cagr: 0.122, volatility: 0.145, years: 10 },
  { id: '20y', label: 'Gemiddelde laatste 20 jaar', cagr: 0.091, volatility: 0.165, years: 20 },
  { id: '30y', label: 'Gemiddelde laatste 30 jaar', cagr: 0.099, volatility: 0.176, years: 30 },
  { id: 'all', label: 'Lange termijn (sinds 1957)', cagr: 0.103, volatility: 0.184, years: 68 },
  { id: 'custom', label: 'Aangepast percentage', cagr: 0.08, volatility: 0.184, years: 0 }
];

const SP500_ANNUAL_RETURNS = [
  { year: 2010, pct: 12.8 }, { year: 2011, pct: 0.0 }, { year: 2012, pct: 13.4 },
  { year: 2013, pct: 29.6 }, { year: 2014, pct: 11.4 }, { year: 2015, pct: -0.7 },
  { year: 2016, pct: 9.5 }, { year: 2017, pct: 19.4 }, { year: 2018, pct: -6.2 },
  { year: 2019, pct: 28.9 }, { year: 2020, pct: 16.3 }, { year: 2021, pct: 26.9 },
  { year: 2022, pct: -19.4 }, { year: 2023, pct: 24.2 }, { year: 2024, pct: 23.3 },
  { year: 2025, pct: 11.2 }
];

const uiCopy = {
  nl: {
    back: '← Terug naar home',
    heroKicker: 'S&P 500 calculator voor Nederland',
    heroTitle: 'Bereken je potentiële S&P 500 rendement met historische data',
    heroSub: 'Gebaseerd op echte historische percentages, met slimme scenario\'s, visuele grafiek en duidelijke output.',
    liveLabel: 'Huidige S&P 500 waarde',
    settingsTitle: 'Bereken direct',
    startAmount: 'Startbedrag',
    ageNow: 'Leeftijd nu',
    ageEnd: 'Eindleeftijd',
    monthly: 'Maandelijkse inleg',
    historical: 'Historische basis',
    goal: 'Doelvermogen (€ optioneel)',
    calc: 'Bereken',
    reset: 'Reset',
    learnMore: 'Meer leren over S&P 500 beleggen ↓',
    futureAt: 'Verwachte totaalwaarde op',
    duration: 'Looptijd vanaf nu',
    scenarioTitle: 'Scenario uitkomst',
    compareTitle: 'Scenario vergelijking'
  },
  en: {
    back: '← Back to home',
    heroKicker: 'S&P 500 calculator',
    heroTitle: 'Estimate your potential S&P 500 return with historical data',
    heroSub: 'Based on historical percentages, smart scenarios, visual charting, and clear output.',
    liveLabel: 'Current S&P 500 value',
    settingsTitle: 'Calculate now',
    startAmount: 'Starting amount',
    ageNow: 'Current age',
    ageEnd: 'End age',
    monthly: 'Monthly contribution',
    historical: 'Historical baseline',
    goal: 'Target amount (€ optional)',
    calc: 'Calculate',
    reset: 'Reset',
    learnMore: 'Learn more about S&P 500 investing ↓',
    futureAt: 'Projected total value at age',
    duration: 'Time horizon from now',
    scenarioTitle: 'Scenario outcomes',
    compareTitle: 'Scenario comparison'
  }
};

const formatEuro = (value) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

const formatPct = (value) => `${(value * 100).toFixed(1)}%`;
const formatIndexValue = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value) || 0);

const percentile = (arr, p) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};

const buildSeries = ({ years, initial, monthly, annualRate }) => {
  const months = years * 12;
  const mRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const points = [];
  let value = initial;

  points.push({ x: 0, y: value });

  for (let month = 1; month <= months; month += 1) {
    value = value * (1 + mRate) + monthly;
    if (month % 12 === 0) {
      points.push({ x: month / 12, y: value });
    }
  }

  return points;
};

const toPath = (series, width, height, maxY) => {
  if (!series.length || maxY <= 0) return '';
  return series
    .map((point, index) => {
      const x = (point.x / series[series.length - 1].x) * width;
      const y = height - (point.y / maxY) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};

export default function SP500CalculatorPage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('nl');
  const [sp500Quote, setSp500Quote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [hoverYear, setHoverYear] = useState(null);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [currentAge, setCurrentAge] = useState(30);
  const [endAge, setEndAge] = useState(70);
  const [years, setYears] = useState(40);
  const [targetAmount, setTargetAmount] = useState(0);
  const [customAnnualReturnPct, setCustomAnnualReturnPct] = useState(8);
  const [selectedPeriodId, setSelectedPeriodId] = useState('20y');

  const selectedPeriod = useMemo(() => {
    const found = HISTORICAL_PERIODS.find((period) => period.id === selectedPeriodId) || HISTORICAL_PERIODS[1];
    if (found.id === 'custom') {
      return { ...found, cagr: customAnnualReturnPct / 100, label: `Aangepast (${customAnnualReturnPct.toFixed(1)}%)` };
    }
    return found;
  }, [selectedPeriodId, customAnnualReturnPct]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');
    const savedSp500 = localStorage.getItem('sp500-calculator-settings-v1');

    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme();
    const nextLanguage = savedLanguage === 'en' || savedLanguage === 'nl' ? savedLanguage : detectBrowserLanguage();

    setTheme(nextTheme);
    setLanguage(nextLanguage);

    if (savedSp500) {
      try {
        const parsed = JSON.parse(savedSp500);
        if (Number.isFinite(parsed.initialInvestment)) setInitialInvestment(Math.max(0, parsed.initialInvestment));
        if (Number.isFinite(parsed.monthlyContribution)) setMonthlyContribution(Math.max(0, parsed.monthlyContribution));
        if (Number.isFinite(parsed.currentAge)) setCurrentAge(Math.min(120, Math.max(0, parsed.currentAge)));
        if (Number.isFinite(parsed.endAge)) setEndAge(Math.min(120, Math.max(0, parsed.endAge)));
        if (Number.isFinite(parsed.targetAmount)) setTargetAmount(Math.max(0, parsed.targetAmount));
        if (Number.isFinite(parsed.customAnnualReturnPct)) setCustomAnnualReturnPct(Math.min(30, Math.max(-20, parsed.customAnnualReturnPct)));
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = uiCopy[language] || uiCopy.nl;
  const annualReturns = useMemo(() => SP500_ANNUAL_RETURNS.map((item) => item.pct / 100), []);

  useEffect(() => {
    const fallbackLocal = () => ({
      symbol: 'S&P 500',
      value: 5230,
      date: new Date().toISOString().slice(0, 10),
      dayChangePct: null,
      warning: 'Live koers tijdelijk niet beschikbaar, indicatieve waarde getoond.'
    });

    const loadQuote = async () => {
      try {
        const response = await fetch('/api/market/sp500-current');
        const data = await response.json();
        if (!response.ok || !Number.isFinite(Number(data?.value))) throw new Error(data?.error || 'API quote failed');
        setSp500Quote(data);
        setQuoteError('');
        return;
      } catch {}

      try {
        const yahooProxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=1d');
        const response = await fetch(yahooProxy);
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta || {};
        const current = Number(meta.regularMarketPrice);
        const prev = Number(meta.previousClose);
        if (!Number.isFinite(current) || current <= 0) throw new Error('Proxy quote failed');

        setSp500Quote({
          symbol: 'S&P 500',
          value: current,
          date: new Date((meta.regularMarketTime || Date.now() / 1000) * 1000).toISOString().slice(0, 10),
          dayChangePct: Number.isFinite(prev) && prev > 0 ? ((current - prev) / prev) * 100 : null,
          warning: 'Koers via externe fallback bron.'
        });
        setQuoteError('');
        return;
      } catch {}

      const local = fallbackLocal();
      setSp500Quote(local);
      setQuoteError(local.warning);
    };

    loadQuote();
  }, []);

  useEffect(() => {
    setYears(Math.max(1, endAge - currentAge));
  }, [currentAge, endAge]);

  useEffect(() => {
    localStorage.setItem('sp500-calculator-settings-v1', JSON.stringify({
      initialInvestment,
      monthlyContribution,
      currentAge,
      endAge,
      selectedPeriodId,
      targetAmount,
      customAnnualReturnPct
    }));
  }, [initialInvestment, monthlyContribution, currentAge, endAge, selectedPeriodId, targetAmount, customAnnualReturnPct]);

  const assumptions = useMemo(() => {
    const median = percentile(annualReturns, 0.5);
    const p25 = percentile(annualReturns, 0.25);
    const p75 = percentile(annualReturns, 0.75);

    return {
      base: selectedPeriod.cagr,
      conservative: Math.max(-0.15, p25),
      realistic: median,
      optimistic: Math.min(0.22, Math.max(p75, selectedPeriod.cagr + 0.02))
    };
  }, [annualReturns, selectedPeriod.cagr]);

  const results = useMemo(() => {
    const totalInvested = initialInvestment + monthlyContribution * years * 12;

    const scenarios = [
      {
        key: 'conservative',
        label: 'Defensief scenario (historische 25e percentiel)',
        rate: assumptions.conservative,
        color: '#ff7a8a'
      },
      {
        key: 'realistic',
        label: 'Realistisch scenario (historische mediaan)',
        rate: assumptions.realistic,
        color: '#7f8bff'
      },
      {
        key: 'base',
        label: `${selectedPeriod.label}`,
        rate: assumptions.base,
        color: '#2ce1d2'
      },
      {
        key: 'optimistic',
        label: 'Sterk scenario (historische 75e percentiel)',
        rate: assumptions.optimistic,
        color: '#ffd166'
      }
    ];

    return scenarios.map((scenario) => {
      const series = buildSeries({
        years,
        initial: initialInvestment,
        monthly: monthlyContribution,
        annualRate: scenario.rate
      });

      const finalValue = series[series.length - 1]?.y || 0;
      const growth = finalValue - totalInvested;

      const goalPoint = targetAmount > 0 ? series.find((point) => point.y >= targetAmount) : null;

      return {
        ...scenario,
        series,
        finalValue,
        growth,
        totalInvested,
        goalYear: goalPoint ? goalPoint.x : null
      };
    });
  }, [assumptions, initialInvestment, monthlyContribution, selectedPeriod.label, targetAmount, years]);

  const bestValue = Math.max(...results.map((scenario) => scenario.finalValue), 1);
  const baseScenario = results.find((scenario) => scenario.key === 'base') || results[0];

  const chartDims = {
    width: 1000,
    height: 420,
    marginLeft: 86,
    marginRight: 26,
    marginTop: 22,
    marginBottom: 52
  };
  const plotWidth = chartDims.width - chartDims.marginLeft - chartDims.marginRight;
  const plotHeight = chartDims.height - chartDims.marginTop - chartDims.marginBottom;
  const activeYear = hoverYear === null ? years : Math.min(years, Math.max(0, hoverYear));

  useEffect(() => {
    const title = language === 'nl'
      ? 'S&P 500 Calculator Nederland, rendement berekenen met historische data'
      : 'S&P 500 Calculator, estimate returns with historical data';
    const description = language === 'nl'
      ? 'Bereken je potentiële S&P 500 rendement met historische gemiddelden, scenariovergelijking en heldere grafieken. Gratis Nederlandse S&P 500 calculator.'
      : 'Estimate potential S&P 500 returns with historical averages, scenario comparison, and visual charts.';
    const canonical = `${SITE_URL}${PAGE_PATH}`;

    document.title = title;

    const ensureMeta = (selector, attrs) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
        document.head.appendChild(tag);
      }
      return tag;
    };

    ensureMeta('meta[name="description"]', { name: 'description' }).setAttribute('content', description);
    ensureMeta('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', title);
    ensureMeta('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', description);
    ensureMeta('meta[property="og:type"]', { property: 'og:type' }).setAttribute('content', 'website');
    ensureMeta('meta[property="og:url"]', { property: 'og:url' }).setAttribute('content', canonical);
    ensureMeta('meta[name="robots"]', { name: 'robots' }).setAttribute('content', 'index,follow,max-image-preview:large');
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute('content', 'summary_large_image');
    ensureMeta('meta[name="keywords"]', { name: 'keywords' }).setAttribute('content', 's&p 500 calculator nederland,s&p 500 rendement berekenen,sp500 maandelijkse inleg,sp500 pensioen berekenen,etf rendement calculator nederlands,s&p 500 eindkapitaal berekenen');

    let canonicalTag = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'S&P 500 Calculator Nederland',
          url: canonical,
          inLanguage: 'nl-NL',
          description
        },
        {
          '@type': 'SoftwareApplication',
          name: 'S&P 500 Calculator Nederland',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          inLanguage: 'nl-NL',
          url: canonical
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'S&P 500 Calculator', item: canonical }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Welke percentages gebruikt deze S&P 500 calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'De calculator gebruikt historische jaarrendementen van de S&P 500 om mediaan, percentielen en lange-termijn CAGR scenarios te tonen.'
              }
            },
            {
              '@type': 'Question',
              name: 'Kan ik maandelijkse inleg berekenen?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ja, je kunt startkapitaal, maandelijkse inleg en looptijd instellen om een totaalverwachting inclusief samengesteld rendement te zien.'
              }
            }
          ]
        }
      ]
    };

    let script = document.querySelector('script[data-sp500-jsonld="true"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-sp500-jsonld', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [language]);

  return (
    <div className="sp500-shell">
      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={language === 'nl' ? 'Vragen?' : 'Questions?'}
        onAsk={() => {}}
        askAriaLabel={language === 'nl' ? 'Open chat' : 'Open chat'}
      />
      <main className="sp500-page">
      <section className="sp500-hero">
        <div className="sp500-top-nav">
          <Link to="/" className="sp500-back-link">{t.back}</Link>
        </div>
        <p className="sp500-kicker">{t.heroKicker}</p>
        <h1>{t.heroTitle}</h1>
        <p className="sp500-subtitle">{t.heroSub}</p>
        <div className="sp500-live-strip">
          <p className="live-label">{t.liveLabel}</p>
          {sp500Quote ? (
            <>
              <p className="live-value">{formatIndexValue(sp500Quote.value)} punten</p>
              <p className="live-meta">
                Datum: {sp500Quote.date} · Dagverandering: {sp500Quote.dayChangePct === null ? 'n.v.t.' : `${sp500Quote.dayChangePct.toFixed(2)}%`}
              </p>
              {sp500Quote.warning && <p className="live-meta">{sp500Quote.warning}</p>}
            </>
          ) : (
            <p className="live-meta">{quoteError || 'Koers ophalen...'}</p>
          )}
        </div>
      </section>

      <section className="sp500-simulator-grid">
        <article className="sp500-controls-panel">
          <h2 className="sim-title">{t.settingsTitle}</h2>

          <label className="calc-input-card">
            <span>{t.startAmount}</span>
            <input
              type="number"
              min="0"
              step="500"
              value={initialInvestment}
              onChange={(event) => setInitialInvestment(Number(event.target.value) || 0)}
            />
          </label>

          <label className="calc-input-card">
            <span>{t.ageNow}</span>
            <input
              type="number"
              min="0"
              max="120"
              value={currentAge}
              onChange={(event) => setCurrentAge(Math.min(120, Math.max(0, Number(event.target.value) || 0)))}
            />
          </label>

          <label className="calc-input-card">
            <span>{t.ageEnd}</span>
            <input
              type="number"
              min="0"
              max="120"
              value={endAge}
              onChange={(event) => setEndAge(Math.min(120, Math.max(0, Number(event.target.value) || 0)))}
            />
          </label>

          <label className="calc-input-card">
            <span>{t.monthly}</span>
            <input
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(event) => setMonthlyContribution(Number(event.target.value) || 0)}
            />
          </label>

          <label className="calc-input-card">
            <span>{t.goal}</span>
            <input
              type="number"
              min="0"
              step="10000"
              value={targetAmount}
              onChange={(event) => setTargetAmount(Math.max(0, Number(event.target.value) || 0))}
            />
          </label>

          <fieldset>
            <legend>{t.historical}</legend>
            {HISTORICAL_PERIODS.map((period) => (
              <label key={period.id} className="radio-line">
                <input
                  type="radio"
                  name="historicalPeriod"
                  checked={selectedPeriodId === period.id}
                  onChange={() => setSelectedPeriodId(period.id)}
                />
                <span>{period.label} ({formatPct(period.cagr)})</span>
              </label>
            ))}
          </fieldset>

          {selectedPeriodId === 'custom' && (
            <label className="calc-input-card">
              <span>Aangepast jaarlijks rendement (%)</span>
              <input
                type="number"
                min="-20"
                max="30"
                step="0.1"
                value={customAnnualReturnPct}
                onChange={(event) => setCustomAnnualReturnPct(Math.min(30, Math.max(-20, Number(event.target.value) || 0)))}
              />
            </label>
          )}

          <button type="button" className="sim-cta-main">{t.calc}</button>
          <button
            type="button"
            className="sim-cta-secondary"
            onClick={() => {
              setInitialInvestment(10000);
              setMonthlyContribution(300);
              setCurrentAge(30);
              setEndAge(70);
              setTargetAmount(0);
              setCustomAnnualReturnPct(8);
              setSelectedPeriodId('20y');
            }}
          >
            {t.reset}
          </button>
          <a href="#faq-sp500" className="sim-cta-secondary">{t.learnMore}</a>
        </article>

        <article className="sp500-future-card">
          <div className="future-card-inner">
            <p className="future-kicker">Future Value</p>
            <h2>{formatEuro(baseScenario.finalValue)}</h2>
            <p className="future-sub">{t.futureAt} <strong>{endAge}</strong></p>
            <p className="future-sub">{t.duration}: <strong>{years} {language === 'nl' ? 'jaar' : 'years'}</strong></p>
            <p className="future-sub">{language === 'nl' ? 'Gekozen basisrendement' : 'Selected base return'}: <strong>{formatPct(baseScenario.rate)}</strong></p>
            <div className="future-metrics">
              <p>Totale inleg</p>
              <strong>{formatEuro(baseScenario.totalInvested)}</strong>
              <p>Verwachte groei</p>
              <strong>{formatEuro(baseScenario.growth)}</strong>
            </div>
            <p className="future-disclaimer">Historische prestaties zijn geen garantie voor toekomstige resultaten.</p>
          </div>
          <div className="future-mountains" aria-hidden="true" />
        </article>
      </section>

      <section className="sp500-card sp500-results">
        <h2>{t.scenarioTitle}</h2>
        <div className="scenario-list">
          {results.map((scenario) => (
            <div key={scenario.key} className="scenario-item" style={{ '--scenario-color': scenario.color }}>
              <div className="scenario-head">
                <p>{scenario.label}</p>
                <strong>{formatPct(scenario.rate)}</strong>
              </div>
              <p className="scenario-final">Eindwaarde: {formatEuro(scenario.finalValue)}</p>
              <p className="scenario-growth">Groei boven inleg: {formatEuro(scenario.growth)}</p>
              {targetAmount > 0 && (
                <p className="scenario-growth">
                  Doel {formatEuro(targetAmount)}: {scenario.goalYear === null ? 'niet bereikt' : `rond jaar ${scenario.goalYear} (leeftijd ${currentAge + scenario.goalYear})`}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="sp500-card sp500-comparison-card">
        <h2>{t.compareTitle}</h2>
        <div className="comparison-grid" role="table" aria-label="Scenario vergelijking tabel">
          {results.map((scenario) => (
            <article key={`cmp-${scenario.key}`} className="comparison-item" role="row">
              <h3>{scenario.label}</h3>
              <p>Rendement: <strong>{formatPct(scenario.rate)}</strong></p>
              <p>Eindwaarde: <strong>{formatEuro(scenario.finalValue)}</strong></p>
              <p>Totale inleg: <strong>{formatEuro(scenario.totalInvested)}</strong></p>
              <p>Netto groei: <strong>{formatEuro(scenario.growth)}</strong></p>
            </article>
          ))}
        </div>
      </section>

      <section className="sp500-card chart-card">
        <h2>Groei simulatie per scenario</h2>
        <svg
          viewBox={`0 0 ${chartDims.width} ${chartDims.height}`}
          role="img"
          aria-label="S&P 500 scenario groeigrafiek"
          className="growth-chart"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * chartDims.width;
            const plotX = Math.min(plotWidth, Math.max(0, x - chartDims.marginLeft));
            setHoverYear(Math.round((plotX / plotWidth) * years));
          }}
          onMouseLeave={() => setHoverYear(null)}
        >
          <defs>
            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface-strong)" />
              <stop offset="100%" stopColor="var(--surface)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={chartDims.width} height={chartDims.height} fill="url(#chartBg)" rx="20" />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartDims.marginTop + plotHeight * (1 - ratio);
            const value = bestValue * ratio;
            return (
              <g key={`y-${ratio}`}>
                <line x1={chartDims.marginLeft} x2={chartDims.width - chartDims.marginRight} y1={y} y2={y} stroke="var(--line)" strokeDasharray="4 6" />
                <text x={chartDims.marginLeft - 10} y={y + 4} textAnchor="end" className="axis-label">{formatEuro(value)}</text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const yearValue = Math.round(years * ratio);
            const x = chartDims.marginLeft + plotWidth * ratio;
            return (
              <g key={`x-${ratio}`}>
                <line x1={x} x2={x} y1={chartDims.marginTop} y2={chartDims.height - chartDims.marginBottom} stroke="var(--line)" strokeDasharray="4 6" />
                <text x={x} y={chartDims.height - chartDims.marginBottom + 22} textAnchor="middle" className="axis-label">{yearValue}j</text>
              </g>
            );
          })}

          <line x1={chartDims.marginLeft} x2={chartDims.marginLeft} y1={chartDims.marginTop} y2={chartDims.height - chartDims.marginBottom} stroke="var(--border)" />
          <line x1={chartDims.marginLeft} x2={chartDims.width - chartDims.marginRight} y1={chartDims.height - chartDims.marginBottom} y2={chartDims.height - chartDims.marginBottom} stroke="var(--border)" />

          {hoverYear !== null && (
            <line
              x1={chartDims.marginLeft + (activeYear / years) * plotWidth}
              x2={chartDims.marginLeft + (activeYear / years) * plotWidth}
              y1={chartDims.marginTop}
              y2={chartDims.height - chartDims.marginBottom}
              stroke="var(--accent)"
              strokeDasharray="3 4"
            />
          )}

          {results.map((scenario) => (
            <g key={scenario.key}>
              <path
                d={toPath(scenario.series, plotWidth, plotHeight, bestValue)}
                transform={`translate(${chartDims.marginLeft},${chartDims.marginTop})`}
                fill="none"
                stroke={scenario.color}
                strokeWidth="4"
                strokeLinecap="round"
              />
              {scenario.series.map((point, pointIndex) => {
                const x = chartDims.marginLeft + (point.x / scenario.series[scenario.series.length - 1].x) * plotWidth;
                const y = chartDims.marginTop + (plotHeight - (point.y / bestValue) * plotHeight);
                const isActive = point.x === activeYear;
                return (
                  <circle
                    key={`${scenario.key}-${pointIndex}`}
                    cx={x}
                    cy={y}
                    r={isActive ? 5 : 2.6}
                    className="chart-dot"
                    fill={scenario.color}
                  >
                    <title>{`${scenario.label} · Jaar ${point.x}: ${formatEuro(point.y)}`}</title>
                  </circle>
                );
              })}
            </g>
          ))}
        </svg>

        <div className="chart-hover-readout">
          <strong>Jaar {activeYear}</strong>
          {results.map((scenario) => {
            const point = scenario.series.find((p) => p.x === activeYear) || scenario.series[scenario.series.length - 1];
            return (
              <span key={`hover-${scenario.key}`}>
                <i style={{ backgroundColor: scenario.color }} />
                {scenario.label}: {formatEuro(point.y)}
              </span>
            );
          })}
        </div>

        <div className="chart-legend">
          {results.map((scenario) => (
            <span key={`legend-${scenario.key}`}>
              <i style={{ backgroundColor: scenario.color }} />
              {scenario.label}
            </span>
          ))}
        </div>
      </section>

      <section className="sp500-grid info-grid">
        <article className="sp500-card">
          <h2>S&P 500 extra inzichten</h2>
          <ul className="insights-list">
            <li>Gemiddeld historisch lange-termijn rendement: <strong>{formatPct(HISTORICAL_PERIODS[3].cagr)}</strong></li>
            <li>Mediaan jaarrendement laatste 16 jaar: <strong>{formatPct(percentile(SP500_ANNUAL_RETURNS.map((r) => r.pct / 100), 0.5))}</strong></li>
            <li>Beste jaar in dataset: <strong>{Math.max(...SP500_ANNUAL_RETURNS.map((r) => r.pct)).toFixed(1)}%</strong></li>
            <li>Zwakste jaar in dataset: <strong>{Math.min(...SP500_ANNUAL_RETURNS.map((r) => r.pct)).toFixed(1)}%</strong></li>
          </ul>
        </article>

        <article className="sp500-card" id="faq-sp500">
          <h2>Veelgestelde vragen</h2>
          <details>
            <summary>Is dit een garantie voor toekomstig rendement?</summary>
            <p>Nee. Deze tool gebruikt historische trends als indicatie. Werkelijke resultaten kunnen sterk verschillen.</p>
          </details>
          <details>
            <summary>Waarom meerdere scenario&apos;s?</summary>
            <p>Omdat markten variëren. Door defensief, realistisch en sterk te vergelijken krijg je een realistischer beeld.</p>
          </details>
          <details>
            <summary>Is dit bedoeld voor Nederlandse beleggers?</summary>
            <p>Ja. De pagina en output zijn Nederlandstalig en geoptimaliseerd voor zoekopdrachten zoals &quot;S&P 500 calculator Nederland&quot;.</p>
          </details>
        </article>
      </section>

      <section className="sp500-card sp500-seo-content">
        <h2>Wat is de S&amp;P 500 en waarom gebruiken beleggers deze index?</h2>
        <p>
          De S&amp;P 500 is een aandelenindex met 500 grote Amerikaanse bedrijven. Deze index wordt vaak gebruikt als benchmark voor
          lange-termijn beleggen, pensioenopbouw en maandelijkse ETF-inleg. Zoekopdrachten zoals <strong>S&amp;P 500 berekenen per maand</strong>,
          <strong> S&amp;P 500 calculator met inleg</strong> en <strong>rendement S&amp;P 500 lange termijn</strong> sluiten aan op wat deze pagina laat zien.
        </p>
        <p>
          Deze Nederlandse S&amp;P 500 rekentool helpt je om realistischer te plannen met meerdere scenario&apos;s in plaats van één percentage.
          Dat is vooral nuttig voor mensen die zoeken op long-tail termen zoals <em>hoeveel wordt 100 euro per maand in S&amp;P 500</em> of
          <em> S&amp;P 500 rendement berekenen met startbedrag</em>.
        </p>
      </section>

      <section className="sp500-footnote">
        <p>
          Let op: dit is een educatieve rekentool en geen financieel advies. Gebruik deze calculator om scenario&apos;s te verkennen,
          niet als harde voorspelling.
        </p>
      </section>
      </main>
      <MainFooter language={language} />
    </div>
  );
}
