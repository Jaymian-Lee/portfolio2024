import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import AnimatedIcon from '../components/AnimatedIcon';
import LabBackLink from '../components/LabBackLink';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { getAlternateLocalePaths, getLanguageSwitchPath, getLocaleFromPathname, localizePath } from '../utils/locale';
import './LabPage.css';

const detectBrowserTheme = () => {
  return 'dark';
};

const copy = {
  nl: {
    back: 'Terug naar home',
    kicker: 'Experimental Space',
    title: 'The Lab.',
    lead: 'Alle subprojecten op één logische plek. Hier staan experiments, tools en speelse builds.',
    sectionTitle: 'Subprojecten',
    open: 'Open project',
    home: 'Home',
    categories: {
      games: { title: 'Games', description: 'Kleine speelse experiments en dagelijkse challenges.', icon: 'gamepad' },
      scoreboards: { title: 'Scoreboards', description: 'Duidelijke scorekeepers voor kaartavonden.', icon: 'trophy' },
      calculators: { title: 'Calculators', description: 'Scenario-tools die cijfers inzichtelijk maken.', icon: 'calculator' },
      streaming: { title: 'Streaming', description: 'Tools voor live status, chat en moderatie.', icon: 'radio' }
    }
  },
  en: {
    back: 'Back to home',
    kicker: 'Experimental Space',
    title: 'The Lab.',
    lead: 'All sub projects in one clear place. This is where experiments, tools, and playful builds live.',
    sectionTitle: 'Sub projects',
    open: 'Open project',
    home: 'Home',
    categories: {
      games: { title: 'Games', description: 'Playful experiments and daily challenges.', icon: 'gamepad' },
      scoreboards: { title: 'Scoreboards', description: 'Clear scorekeepers for card game nights.', icon: 'trophy' },
      calculators: { title: 'Calculators', description: 'Scenario tools that make numbers easier to understand.', icon: 'calculator' },
      streaming: { title: 'Streaming', description: 'Tools for live status, chat and moderation.', icon: 'radio' }
    }
  }
};

const projects = {
  nl: [
      {
        name: 'Word-Lee',
        path: '/word-lee',
        category: 'games',
        badge: 'Word Game',
        description: 'Dagelijkse woordchallenge met leaderboard, wereldrecord en snelle rounds.',
        tags: ['React', 'Game', 'Realtime ranking']
    },
    {
      name: 'Stream Dashboard',
      path: '/stream',
      category: 'streaming',
      badge: 'Streaming Tool',
      description: 'Live dashboard voor streamstatus, quick controls en realtime monitoring.',
      tags: ['Dashboard', 'Realtime', 'Web']
    },
    {
      name: 'Stream Chat',
      path: '/stream/chat',
      category: 'streaming',
      badge: 'Chat Utility',
      description: 'Losse chat-view voor stream interactie over meerdere platformen.',
      tags: ['Chat', 'Multi-platform', 'Live']
    },
    {
      name: 'Toepen Scoreboard',
      path: '/toepen',
      category: 'scoreboards',
      badge: 'Card Game Utility',
      description: 'Snel score bijhouden voor Toepen met simpele invoer en duidelijk overzicht.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'Pesten Scoreboard',
      path: '/pesten',
      category: 'scoreboards',
      badge: 'Card Game Utility',
      description: 'Flexibele scorekeeper voor Pesten, afgestemd op jullie eigen huisregels.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'S&P 500 Calculator',
      path: '/sp500-calculator',
      category: 'calculators',
      badge: 'Finance Tool',
      description: 'Rekent scenario’s door met historische groei en heldere visualisatie.',
      tags: ['Finance', 'Calculator', 'Data viz']
    }
  ],
  en: [
      {
        name: 'Word-Lee',
        path: '/word-lee',
        category: 'games',
        badge: 'Word Game',
        description: 'Daily word challenge with leaderboard, world record, and quick rounds.',
        tags: ['React', 'Game', 'Realtime ranking']
    },
    {
      name: 'Stream Dashboard',
      path: '/stream',
      category: 'streaming',
      badge: 'Streaming Tool',
      description: 'Live dashboard for stream status, quick controls, and realtime monitoring.',
      tags: ['Dashboard', 'Realtime', 'Web']
    },
    {
      name: 'Stream Chat',
      path: '/stream/chat',
      category: 'streaming',
      badge: 'Chat Utility',
      description: 'Standalone chat view for stream interaction across platforms.',
      tags: ['Chat', 'Multi-platform', 'Live']
    },
    {
      name: 'Toepen Scoreboard',
      path: '/toepen',
      category: 'scoreboards',
      badge: 'Card Game Utility',
      description: 'Simple Toepen scoreboard for game nights with fast input.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'Pesten Scoreboard',
      path: '/pesten',
      category: 'scoreboards',
      badge: 'Card Game Utility',
      description: 'Flexible Pesten scorekeeper built around your own house rules.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'S&P 500 Calculator',
      path: '/sp500-calculator',
      category: 'calculators',
      badge: 'Finance Tool',
      description: 'Runs long-term scenarios with historical growth and clear charts.',
      tags: ['Finance', 'Calculator', 'Data viz']
    }
  ]
};

const categoryOrder = ['games', 'scoreboards', 'calculators', 'streaming'];

export default function LabPage() {
  const [theme, setTheme] = useState('dark');
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);
  const canonicalPath = localizePath('/lab', language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    document.documentElement.setAttribute('lang', language);
    document.title = language === 'nl' ? 'Lab | Jaymian-Lee Reinartz' : 'Lab | Jaymian-Lee Reinartz';
  }, [language]);

  const t = copy[language] || copy.en;
  const labProjects = useMemo(() => projects[language] || projects.en, [language]);
  const labCategories = useMemo(() => (
    categoryOrder.map((category) => ({
      id: category,
      ...t.categories[category],
      projects: labProjects.filter((project) => project.category === category)
    })).filter((category) => category.projects.length > 0)
  ), [labProjects, t.categories]);
  const labSeoJsonLd = useMemo(() => {
    const canonical = `${siteSeo.siteUrl}${canonicalPath}`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({
          name: language === 'nl' ? 'The Lab | Experimentele subprojecten' : 'The Lab | Experimental subprojects',
          url: canonical,
          description: language === 'nl'
            ? 'The Lab bundelt de experimentele tools, games en utilities van Jaymian-Lee Reinartz op een centrale pagina.'
            : 'The Lab brings together Jaymian-Lee Reinartz experiments, games, and utilities on one central page.',
          language: language === 'nl' ? 'nl-NL' : 'en-US'
        }),
        createBreadcrumbSchema([
          { name: 'Home', item: siteSeo.siteUrl },
          { name: 'Lab', item: canonical }
        ])
      ]
    };
  }, [canonicalPath, language]);

  return (
    <div className="lab-page-shell ui-page">
      <Seo
        title={language === 'nl' ? 'The Lab | Experimentele subprojecten' : 'The Lab | Experimental subprojects'}
        description={language === 'nl'
          ? 'Bekijk The Lab: een overzicht van experimentele tools, games en utilities zoals Word-Lee, Stream Dashboard, Stream Chat, Toepen en de S&P 500 calculator.'
          : 'Explore The Lab: an overview of experimental tools, games, and utilities such as Word-Lee, Stream Dashboard, Stream Chat, Toepen, and the S&P 500 calculator.'}
        canonicalPath={canonicalPath}
        language={language}
        alternatePaths={alternatePaths}
        defaultLocalePath={alternatePaths.en}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={language === 'nl'
          ? 'The Lab overzichtspagina met experimentele projecten van Jaymian-Lee Reinartz'
          : 'The Lab overview page with experimental projects by Jaymian-Lee Reinartz'}
        jsonLd={labSeoJsonLd}
      />

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, language === 'en' ? 'nl' : 'en', location.search, location.hash))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={language === 'nl' ? 'Mail' : 'Email'}
        askAriaLabel={language === 'nl' ? 'Stuur een e-mail' : 'Send an email'}
        onAsk={() => { window.location.href = 'mailto:info@jaymian-lee.nl'; }}
      />

      <main className="lab-main ui-container">
        <LabBackLink to={localizePath('/', language)}>{t.back}</LabBackLink>

        <header className="lab-hero">
          <p className="lab-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
        </header>

        <section className="lab-section" aria-label={t.sectionTitle}>
          {labCategories.map((category, categoryIndex) => (
            <section className="lab-category" key={category.id} aria-labelledby={`lab-category-${category.id}`}>
              <header className="lab-category-header">
                <span className="lab-category-icon" aria-hidden="true"><AnimatedIcon name={category.icon} size={21} /></span>
                <div>
                  <p>{String(categoryIndex + 1).padStart(2, '0')} / {category.projects.length} {category.projects.length === 1 ? 'tool' : 'tools'}</p>
                  <h2 id={`lab-category-${category.id}`}>{category.title}</h2>
                  <span>{category.description}</span>
                </div>
              </header>
              <div className="lab-grid">
                {category.projects.map((project) => (
                  <Link
                    className="lab-card"
                    key={project.name}
                    to={localizePath(project.path, language)}
                    aria-label={`${t.open}: ${project.name}`}
                  >
                    <p className="lab-card-badge">{project.badge}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="lab-tags" aria-label="Project tags">
                      {project.tags.map((tag) => (
                        <span className="lab-tag" key={`${project.name}-${tag}`}>{tag}</span>
                      ))}
                    </div>
                    <span className="lab-open-link">{t.open} <AnimatedIcon name="arrow-right" size={17} /></span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>
    </div>
  );
}
