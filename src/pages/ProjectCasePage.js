import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AnimatedIcon from '../components/AnimatedIcon';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import Seo from '../components/Seo';
import NotFoundPage from './NotFoundPage';
import { getProjectCase, getProjectCasePath, projectCases } from '../data/projectCases';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { getAlternateLocalePaths, getLanguageSwitchPath, getLocaleFromPathname, localizePath } from '../utils/locale';
import './ProjectCasePage.css';

const copy = {
  en: {
    back: 'Back to portfolio', role: 'Role', period: 'Timeline', status: 'Status', brief: 'The brief', approach: 'The approach', focus: 'What shaped the build', outcome: 'Why it matters', visit: 'Visit project', related: 'More work', viewCase: 'View case', mail: 'Start a conversation', ask: 'Ask about a project'
  },
  nl: {
    back: 'Terug naar portfolio', role: 'Rol', period: 'Periode', status: 'Status', brief: 'De opdracht', approach: 'De aanpak', focus: 'Wat de build vormgaf', outcome: 'Waarom dit telt', visit: 'Bezoek project', related: 'Meer werk', viewCase: 'Bekijk case', mail: 'Start een gesprek', ask: 'Vraag over een project'
  }
};

export default function ProjectCasePage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);
  const isNl = language === 'nl';
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark');
  const project = getProjectCase(slug);
  const t = copy[language] || copy.en;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('portfolio-theme', theme);
  }, [language, theme]);

  if (!project) return <NotFoundPage />;

  const content = project[language] || project.en;
  const canonicalPath = localizePath(getProjectCasePath(project.slug), language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);
  const pageUrl = `${siteSeo.siteUrl}${canonicalPath}`;
  const imageUrl = `${siteSeo.siteUrl}${project.image}`;
  const jsonLd = [
    createWebsiteSchema({ language: ['en', 'nl'] }),
    createWebPageSchema({ name: `${project.name} | ${content.label}`, url: pageUrl, description: content.intro, language: isNl ? 'nl-NL' : 'en-US', image: imageUrl }),
    createBreadcrumbSchema([
      { name: 'Jaymian-Lee Reinartz', item: `${siteSeo.siteUrl}${localizePath('/', language)}` },
      { name: isNl ? 'Projecten' : 'Projects', item: `${siteSeo.siteUrl}${localizePath('/', language)}#projects` },
      { name: project.name, item: pageUrl }
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: content.intro,
      image: imageUrl,
      url: pageUrl,
      creator: { '@id': `${siteSeo.siteUrl}/#person` },
      inLanguage: isNl ? 'nl-NL' : 'en-US',
      keywords: [content.label, project.role, ...project[language].features.map((feature) => feature.title)].join(', ')
    }
  ];

  const toggleLanguage = () => navigate(getLanguageSwitchPath(location.pathname, isNl ? 'en' : 'nl', location.search, location.hash));
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  const otherProjects = projectCases.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <div className="project-case-page">
      <Seo
        title={`${project.name} | ${content.label} | Jaymian-Lee Reinartz`}
        description={content.intro}
        canonicalPath={canonicalPath}
        image={imageUrl}
        imageAlt={`${project.name} project overview by Jaymian-Lee Reinartz`}
        language={language}
        type="article"
        keywords={`${project.name}, ${content.label}, Jaymian-Lee Reinartz, ${project.role}`}
        alternatePaths={alternatePaths}
        defaultLocalePath={getProjectCasePath(project.slug)}
        jsonLd={jsonLd}
      />

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        askLabel={isNl ? 'Mail' : 'Mail'}
        askAriaLabel={t.ask}
        onAsk={() => { window.location.href = 'mailto:info@jaymian-lee.nl'; }}
        wordLee={{ href: localizePath('/word-lee', language), label: 'Word-Lee', hint: isNl ? 'Daily challenge' : 'Daily challenge' }}
      />

      <main>
        <section className="case-hero" style={{ '--case-image': `url(${project.image})` }}>
          <div className="case-hero-overlay" aria-hidden="true" />
          <div className="case-hero-inner">
            <Link className="case-back" to={localizePath('/', language) + '#projects'}><AnimatedIcon name="arrow-left" size={17} />{t.back}</Link>
            <div className="case-hero-grid">
              <div className="case-title-block">
                <p className="case-kicker">{content.label}</p>
                <h1>{project.name}</h1>
                <p className="case-intro">{content.intro}</p>
                <div className="case-actions">
                  <a className="case-primary-action" href={project.url} target="_blank" rel="noreferrer">{t.visit}<AnimatedIcon name="arrow-right" size={18} /></a>
                  <span className={`case-status ${project.status.toLowerCase()}`}><i aria-hidden="true" />{project.status}</span>
                </div>
              </div>
              <div className="case-logo-wrap">
                {project.logo ? <img className="case-logo" src={project.logo} alt={`${project.name} logo`} /> : <span className="case-monogram" aria-label={`${project.name} monogram`}>{project.monogram || project.name.slice(0, 2)}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="case-content">
          <div className="case-facts" aria-label={`${project.name} facts`}>
            <div><span>{t.role}</span><strong>{project.role}</strong></div>
            <div><span>{t.period}</span><strong>{project.period}</strong></div>
            <div><span>{t.status}</span><strong>{project.status}</strong></div>
          </div>

          <div className="case-story-grid">
            <div className="case-story">
              <p className="case-section-label">01 / {t.brief}</p>
              <h2>{t.approach}</h2>
              <p>{content.story}</p>
            </div>
            <div className="case-outcome">
              <p className="case-section-label">02 / {t.outcome}</p>
              <p>{content.outcome}</p>
            </div>
          </div>

          <section className="case-features" aria-labelledby="case-features-title">
            <p className="case-section-label">03 / {t.focus}</p>
            <h2 id="case-features-title">{isNl ? 'Van idee naar een bruikbare ervaring.' : 'From idea to a usable experience.'}</h2>
            <ol>
              {content.features.map((feature, index) => (
                <li key={feature.title}>
                  <span>0{index + 1}</span>
                  <div><h3>{feature.title}</h3><p>{feature.text}</p></div>
                  <AnimatedIcon name="arrow-right" size={20} />
                </li>
              ))}
            </ol>
          </section>

          <section className="case-related" aria-labelledby="case-related-title">
            <div><p className="case-section-label">04 / {t.related}</p><h2 id="case-related-title">{isNl ? 'Andere builds in beweging.' : 'Other builds in motion.'}</h2></div>
            <div className="case-related-list">
              {otherProjects.map((item) => (
                <Link key={item.slug} to={localizePath(getProjectCasePath(item.slug), language)} className="case-related-link">
                  {item.logo ? <img src={item.logo} alt="" /> : <span className="case-related-monogram" aria-hidden="true">{item.monogram || item.name.slice(0, 2)}</span>}
                  <span><strong>{item.name}</strong><small>{(item[language] || item.en).label}</small></span>
                  <AnimatedIcon name="arrow-right" size={18} />
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
