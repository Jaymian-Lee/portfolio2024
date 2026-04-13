import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import MainFooter from '../components/MainFooter';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import './LabPage.css';

const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const copy = {
  nl: {
    back: '← Terug naar home',
    kicker: 'Experimental Space',
    title: 'The Lab.',
    lead: 'Alle subprojecten op één logische plek. Hier staan experiments, tools en speelse builds.',
    sectionTitle: 'Subprojecten',
    open: 'Open project',
    home: 'Home'
  },
  en: {
    back: '← Back to home',
    kicker: 'Experimental Space',
    title: 'The Lab.',
    lead: 'All sub projects in one clear place. This is where experiments, tools, and playful builds live.',
    sectionTitle: 'Sub projects',
    open: 'Open project',
    home: 'Home'
  }
};

const projects = {
  nl: [
      {
        name: 'Word-Lee',
        path: '/word-lee',
        badge: 'Word Game',
        description: 'Dagelijkse woordchallenge met leaderboard, wereldrecord en snelle rounds.',
        tags: ['React', 'Game', 'Realtime ranking']
    },
    {
      name: 'Stream Dashboard',
      path: '/stream',
      badge: 'Streaming Tool',
      description: 'Live dashboard voor streamstatus, quick controls en realtime monitoring.',
      tags: ['Dashboard', 'Realtime', 'Web']
    },
    {
      name: 'Stream Chat',
      path: '/stream/chat',
      badge: 'Chat Utility',
      description: 'Losse chat-view voor stream interactie over meerdere platformen.',
      tags: ['Chat', 'Multi-platform', 'Live']
    },
    {
      name: 'Toepen Scoreboard',
      path: '/toepen',
      badge: 'Card Game Utility',
      description: 'Snel score bijhouden voor Toepen met simpele invoer en duidelijk overzicht.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'S&P 500 Calculator',
      path: '/sp500-calculator',
      badge: 'Finance Tool',
      description: 'Rekent scenario’s door met historische groei en heldere visualisatie.',
      tags: ['Finance', 'Calculator', 'Data viz']
    }
  ],
  en: [
      {
        name: 'Word-Lee',
        path: '/word-lee',
        badge: 'Word Game',
        description: 'Daily word challenge with leaderboard, world record, and quick rounds.',
        tags: ['React', 'Game', 'Realtime ranking']
    },
    {
      name: 'Stream Dashboard',
      path: '/stream',
      badge: 'Streaming Tool',
      description: 'Live dashboard for stream status, quick controls, and realtime monitoring.',
      tags: ['Dashboard', 'Realtime', 'Web']
    },
    {
      name: 'Stream Chat',
      path: '/stream/chat',
      badge: 'Chat Utility',
      description: 'Standalone chat view for stream interaction across platforms.',
      tags: ['Chat', 'Multi-platform', 'Live']
    },
    {
      name: 'Toepen Scoreboard',
      path: '/toepen',
      badge: 'Card Game Utility',
      description: 'Simple Toepen scoreboard for game nights with fast input.',
      tags: ['Utility', 'Local first', 'Game night']
    },
    {
      name: 'S&P 500 Calculator',
      path: '/sp500-calculator',
      badge: 'Finance Tool',
      description: 'Runs long-term scenarios with historical growth and clear charts.',
      tags: ['Finance', 'Calculator', 'Data viz']
    }
  ]
};

export default function LabPage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');

    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme());
    setLanguage(savedLanguage === 'en' || savedLanguage === 'nl' ? savedLanguage : detectBrowserLanguage());
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
  const labSeoJsonLd = useMemo(() => {
    const canonical = `${siteSeo.siteUrl}/lab`;
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
  }, [language]);

  return (
    <div className="lab-page-shell">
      <Seo
        title={language === 'nl' ? 'The Lab | Experimentele subprojecten' : 'The Lab | Experimental subprojects'}
        description={language === 'nl'
          ? 'Bekijk The Lab: een overzicht van experimentele tools, games en utilities zoals Word-Lee, Stream Dashboard, Stream Chat, Toepen en de S&P 500 calculator.'
          : 'Explore The Lab: an overview of experimental tools, games, and utilities such as Word-Lee, Stream Dashboard, Stream Chat, Toepen, and the S&P 500 calculator.'}
        canonicalPath="/lab"
        language={language}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={language === 'nl'
          ? 'The Lab overzichtspagina met experimentele projecten van Jaymian-Lee Reinartz'
          : 'The Lab overview page with experimental projects by Jaymian-Lee Reinartz'}
        jsonLd={labSeoJsonLd}
      />

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={t.home}
        askAriaLabel={t.home}
        onAsk={() => { window.location.href = '/'; }}
      />

      <main className="lab-main">
        <Link to="/" className="lab-back-link">{t.back}</Link>

        <header className="lab-hero">
          <p className="lab-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
        </header>

        <section className="lab-section" aria-label={t.sectionTitle}>
          <div className="lab-grid">
            {labProjects.map((project) => (
              <article className="lab-card" key={project.name}>
                <p className="lab-card-badge">{project.badge}</p>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <div className="lab-tags" aria-label="Project tags">
                  {project.tags.map((tag) => (
                    <span className="lab-tag" key={`${project.name}-${tag}`}>{tag}</span>
                  ))}
                </div>
                <Link to={project.path} className="lab-open-link">{t.open} →</Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <MainFooter language={language} />
    </div>
  );
}
