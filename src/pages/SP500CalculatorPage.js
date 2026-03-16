import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './SP500CalculatorPage.css';

const SITE_URL = 'https://jaymian-lee.nl';
const PAGE_PATH = '/sp500-calculator';

const HISTORICAL_PERIODS = [
  { id: '10y', label: 'Gemiddelde laatste 10 jaar', cagr: 0.122, volatility: 0.145, years: 10 },
  { id: '20y', label: 'Gemiddelde laatste 20 jaar', cagr: 0.091, volatility: 0.165, years: 20 },
  { id: '30y', label: 'Gemiddelde laatste 30 jaar', cagr: 0.099, volatility: 0.176, years: 30 },
  { id: 'all', label: 'Lange termijn (sinds 1957)', cagr: 0.103, volatility: 0.184, years: 68 }
];

const SP500_ANNUAL_RETURNS = [
  { year: 2010, pct: 12.8 }, { year: 2011, pct: 0.0 }, { year: 2012, pct: 13.4 },
  { year: 2013, pct: 29.6 }, { year: 2014, pct: 11.4 }, { year: 2015, pct: -0.7 },
  { year: 2016, pct: 9.5 }, { year: 2017, pct: 19.4 }, { year: 2018, pct: -6.2 },
  { year: 2019, pct: 28.9 }, { year: 2020, pct: 16.3 }, { year: 2021, pct: 26.9 },
  { year: 2022, pct: -19.4 }, { year: 2023, pct: 24.2 }, { year: 2024, pct: 23.3 },
  { year: 2025, pct: 11.2 }
];

const formatEuro = (value) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

const formatPct = (value) => `${(value * 100).toFixed(1)}%`;

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
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [currentAge, setCurrentAge] = useState(30);
  const [years, setYears] = useState(40);
  const [selectedPeriodId, setSelectedPeriodId] = useState('20y');

  const selectedPeriod = useMemo(
    () => HISTORICAL_PERIODS.find((period) => period.id === selectedPeriodId) || HISTORICAL_PERIODS[1],
    [selectedPeriodId]
  );

  const annualReturns = useMemo(() => SP500_ANNUAL_RETURNS.map((item) => item.pct / 100), []);

  useEffect(() => {
    setYears(Math.max(1, 70 - currentAge));
  }, [currentAge]);

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

      return {
        ...scenario,
        series,
        finalValue,
        growth,
        totalInvested
      };
    });
  }, [assumptions, initialInvestment, monthlyContribution, selectedPeriod.label, years]);

  const bestValue = Math.max(...results.map((scenario) => scenario.finalValue), 1);
  const baseScenario = results.find((scenario) => scenario.key === 'base') || results[0];

  useEffect(() => {
    const title = 'S&P 500 Calculator Nederland, rendement berekenen met historische data';
    const description =
      'Bereken je potentiële S&P 500 rendement met historische gemiddelden, scenariovergelijking en heldere grafieken. Gratis Nederlandse S&P 500 calculator.';
    const canonical = `${SITE_URL}${PAGE_PATH}`;

    document.title = title;
    document.documentElement.setAttribute('lang', 'nl');

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
  }, []);

  return (
    <main className="sp500-page">
      <section className="sp500-hero">
        <div className="sp500-top-nav">
          <Link to="/" className="sp500-back-link">← Terug naar home</Link>
        </div>
        <p className="sp500-kicker">S&P 500 calculator voor Nederland</p>
        <h1>Bereken je potentiële S&P 500 rendement met historische data</h1>
        <p className="sp500-subtitle">
          Gebaseerd op echte historische percentages, met slimme scenario&apos;s, visuele grafiek en duidelijke output.
        </p>
      </section>

      <section className="sp500-simulator-grid">
        <article className="sp500-controls-panel">
          <h2 className="sim-title">Bereken direct</h2>

          <label className="calc-input-card">
            <span>Startbedrag</span>
            <input
              type="number"
              min="0"
              step="500"
              value={initialInvestment}
              onChange={(event) => setInitialInvestment(Number(event.target.value) || 0)}
            />
          </label>

          <label className="calc-input-card">
            <span>Leeftijd nu</span>
            <input
              type="number"
              min="18"
              max="69"
              value={currentAge}
              onChange={(event) => setCurrentAge(Math.min(69, Math.max(18, Number(event.target.value) || 18)))}
            />
          </label>

          <label className="calc-input-card">
            <span>Maandelijkse inleg</span>
            <input
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(event) => setMonthlyContribution(Number(event.target.value) || 0)}
            />
          </label>

          <fieldset>
            <legend>Historische basis</legend>
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

          <button type="button" className="sim-cta-main">Bereken</button>
          <a href="#faq-sp500" className="sim-cta-secondary">Meer leren over S&P 500 beleggen ↓</a>
        </article>

        <article className="sp500-future-card">
          <div className="future-card-inner">
            <p className="future-kicker">Future Value</p>
            <h2>{formatEuro(baseScenario.finalValue)}</h2>
            <p className="future-sub">Verwachte totaalwaarde op 70-jarige leeftijd</p>
            <p className="future-sub">Looptijd vanaf nu: <strong>{years} jaar</strong></p>
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
        <h2>Scenario uitkomst</h2>
        <div className="scenario-list">
          {results.map((scenario) => (
            <div key={scenario.key} className="scenario-item" style={{ '--scenario-color': scenario.color }}>
              <div className="scenario-head">
                <p>{scenario.label}</p>
                <strong>{formatPct(scenario.rate)}</strong>
              </div>
              <p className="scenario-final">Eindwaarde: {formatEuro(scenario.finalValue)}</p>
              <p className="scenario-growth">Groei boven inleg: {formatEuro(scenario.growth)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sp500-card chart-card">
        <h2>Groei simulatie per scenario</h2>
        <svg viewBox="0 0 1000 420" role="img" aria-label="S&P 500 scenario groeigrafiek" className="growth-chart">
          <defs>
            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(127, 139, 255, 0.22)" />
              <stop offset="100%" stopColor="rgba(17, 18, 38, 0.06)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="420" fill="url(#chartBg)" rx="20" />
          {[0.2, 0.4, 0.6, 0.8].map((line) => (
            <line key={line} x1="30" x2="970" y1={420 * line} y2={420 * line} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 8" />
          ))}
          {results.map((scenario) => (
            <path
              key={scenario.key}
              d={toPath(scenario.series, 940, 360, bestValue)}
              transform="translate(30,30)"
              fill="none"
              stroke={scenario.color}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </svg>
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

      <section className="sp500-footnote">
        <p>
          Let op: dit is een educatieve rekentool en geen financieel advies. Gebruik deze calculator om scenario&apos;s te verkennen,
          niet als harde voorspelling.
        </p>
      </section>
    </main>
  );
}
