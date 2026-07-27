import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import FloatingUtilityBar from './components/FloatingUtilityBar';
import AnimatedIcon from './components/AnimatedIcon';
import Seo from './components/Seo';
import { createPersonSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from './data/seo';
import './App.css';

const projects = [
  {
    name: 'Corthex',
    url: 'https://corthex.app',
    image: '/projects/corthex-app.png',
    logo: 'https://www.google.com/s2/favicons?domain=corthex.app&sz=256',
    monogram: 'C',
    number: '01',
    type: 'AI knowledge platform',
    year: 'Building · 2026',
    summary: 'AI workspaces and capable assistants, grounded in a team’s own knowledge.',
    tags: ['Product', 'AI systems', 'Co-founder'],
    tone: 'blue',
    note: 'Currently shaping the next release'
  },
  {
    name: 'Vizualy',
    url: 'https://vizualy.nl',
    image: '/projects/vizualy-nl.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=vizualy.nl&sz=256',
    monogram: 'V',
    number: '02',
    type: 'Renovation visualizer',
    year: '2025',
    summary: 'A visual decision tool for façades, materials, and before-and-after possibilities.',
    tags: ['Computer vision', 'Dashboard', 'UX'],
    tone: 'sun',
    note: 'Visual workflows, made practical'
  },
  {
    name: 'MartijnKozijn.nl',
    url: 'https://martijnkozijn.nl',
    image: '/projects/martijnkozijn-nl.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=martijnkozijn.nl&sz=256',
    monogram: 'MK',
    number: '03',
    type: 'Ecommerce architecture',
    year: 'Ongoing',
    summary: 'A faster, more maintainable buying experience for windows and doors.',
    tags: ['PrestaShop', 'Ecommerce', 'Lead developer'],
    tone: 'mint',
    note: 'Ongoing improvements & releases'
  },
  {
    name: 'Slecto',
    url: null,
    image: '/projects/slecto-app.png',
    logo: 'https://slecto.app/_next/image?url=%2Fbrand%2Fslecto-icon.png&w=48&q=75',
    monogram: 'S',
    number: '04',
    type: 'Digital product',
    year: 'In ontwikkeling',
    summary: 'A new digital product currently taking shape from the ground up.',
    tags: ['Product', 'Development', 'In progress'],
    tone: 'orange',
    note: 'More soon'
  },
  {
    name: 'Botforger',
    url: 'https://botforger.com',
    image: '/projects/botforger-com.png',
    logo: 'https://www.google.com/s2/favicons?domain=botforger.com&sz=256',
    monogram: 'B',
    number: '05',
    type: 'No-code chatbot builder',
    year: '2025–2026',
    summary: 'The product foundation for no-code AI chatbots and useful automation.',
    tags: ['SaaS', 'Automation', 'Founder'],
    tone: 'purple',
    note: 'Evolved into Corthex'
  },
  {
    name: 'Mintventory',
    url: 'https://mintventory.com',
    image: '/projects/mintventory-com.svg',
    logo: 'https://www.google.com/s2/favicons?domain=mintventory.com&sz=256',
    monogram: 'M',
    number: '06',
    type: 'Collector platform',
    year: 'Building',
    summary: 'Inventory, scanning, grading and discovery for serious trading-card collectors.',
    tags: ['Mobile flow', 'Data', 'Product'],
    tone: 'rose',
    note: 'In active development'
  },
  {
    name: 'Twigsie',
    url: 'https://twigsie.com',
    image: '/projects/twigsie-com.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=twigsie.com&sz=256',
    monogram: 'T',
    number: '07',
    type: 'Plant ecommerce',
    year: '2025',
    summary: 'A gentle ecommerce experience for plant cuttings, care and first-time growers.',
    tags: ['Ecommerce', 'Content', 'Design system'],
    tone: 'green',
    note: 'Designed for easy discovery'
  },
  {
    name: 'Refacthor',
    url: 'https://refacthor.nl',
    image: '/projects/refacthor-site-screenshot.png',
    logo: 'https://www.google.com/s2/favicons?domain=refacthor.nl&sz=256',
    monogram: 'R',
    number: '08',
    type: 'Digital product studio',
    year: 'Ongoing',
    summary: 'The studio where strategy, engineering and conversion-minded delivery come together.',
    tags: ['Strategy', 'Web', 'Owner'],
    tone: 'blue',
    note: 'The practice behind the work'
  },
  {
    name: 'Vizualy Prints',
    url: 'https://vizualyprints.com',
    image: '/projects/vizualyprints-com.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=vizualyprints.com&sz=256',
    monogram: 'VP',
    number: '09',
    type: 'Poster ecommerce',
    year: '2025',
    summary: 'A clearer route from visual inspiration to a confident, checkout-ready choice.',
    tags: ['Ecommerce', 'Conversion', 'Content'],
    tone: 'sun',
    note: 'Built to make browsing feel easy'
  }
];

const archivedProjectNames = new Set(['Mintventory', 'Twigsie', 'Vizualy Prints']);
const activeProjects = projects.filter((project) => !archivedProjectNames.has(project.name));
const archivedProjects = projects.filter((project) => archivedProjectNames.has(project.name));

const socials = [
  { label: 'GitHub', handle: '@Jaymian-Lee', url: 'https://github.com/Jaymian-Lee', nl: 'Code, experimenten en de bouwstenen achter mijn producten.', en: 'Code, experiments and the building blocks behind my products.' },
  { label: 'LinkedIn', handle: 'Jaymian-Lee Reinartz', url: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/', nl: 'Updates over productontwikkeling, AI en de dingen die ik aan het maken ben.', en: 'Updates on product work, AI and the things I am building.' },
  { label: 'Instagram', handle: '@jaymianlee', url: 'https://www.instagram.com/jaymianlee/', nl: 'Een persoonlijk kijkje achter de schermen, van idee naar release.', en: 'A personal look behind the scenes, from idea to release.' },
  { label: 'YouTube', handle: '@JaymianLee', url: 'https://www.youtube.com/@JaymianLee', nl: 'Video’s, walkthroughs en de verhalen achter de builds.', en: 'Videos, walkthroughs and the stories behind the builds.' },
  { label: 'Twitch', handle: 'twitch.tv/jaymianlee', url: 'https://twitch.tv/jaymianlee', nl: 'Live bouwen, experimenteren en praten met de community.', en: 'Live building, experimenting and talking with the community.' }
];

function App() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('nl');
  const [activeView, setActiveView] = useState('work');

  useEffect(() => {
    const storedTheme = localStorage.getItem('portfolio-theme');
    const storedLanguage = localStorage.getItem('portfolio-language');
    setTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark');
    setLanguage(storedLanguage === 'en' || storedLanguage === 'nl' ? storedLanguage : 'nl');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('portfolio-theme', theme);
    localStorage.setItem('portfolio-language', language);
  }, [language, theme]);

  useEffect(() => {
    const scriptId = 'corthex-chat-widget';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) return undefined;

    const widgetScript = document.createElement('script');
    widgetScript.id = scriptId;
    widgetScript.src = 'https://www.corthex.app/widget.js';
    widgetScript.dataset.botId = '57ac4b69-39d1-4b57-a530-244604877cbc';
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    return () => {
      widgetScript.remove();
    };
  }, []);

  const isNl = language === 'nl';
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      createPersonSchema(),
      createWebsiteSchema({ language: ['nl', 'en'] }),
      createWebPageSchema({
        name: 'Jaymian-Lee Reinartz — Project portfolio',
        url: siteSeo.siteUrl,
        description: 'Selected projects in AI, ecommerce and product engineering by Jaymian-Lee Reinartz.',
        language: isNl ? 'nl-NL' : 'en-US',
        image: `${siteSeo.siteUrl}/jay-portrait.png`
      })
    ]
  }), [isNl]);

  return (
    <div className="portfolio-shell">
      <Seo
        title="Jaymian-Lee Reinartz — Building useful digital products"
        description="Selected work in AI systems, ecommerce and product engineering by Jaymian-Lee Reinartz."
        canonicalPath="/"
        language={language}
        image={`${siteSeo.siteUrl}/jay-portrait.png`}
        imageAlt="Portrait of Jaymian-Lee Reinartz"
        jsonLd={jsonLd}
      />

      <a className="skip-link" href="#projects">{isNl ? 'Naar projecten' : 'Skip to projects'}</a>
      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((value) => (value === 'nl' ? 'en' : 'nl'))}
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        askLabel={isNl ? 'Mail' : 'Email'}
        askAriaLabel={isNl ? 'Stuur een e-mail' : 'Send an email'}
        onAsk={() => { window.location.href = 'mailto:info@jaymian-lee.nl'; }}
        wordLee={{ label: 'Word-Lee', hint: isNl ? 'Daily challenge' : 'Daily challenge' }}
      />

      <main className="portfolio-layout">
        <aside className="identity-panel">
          <div className="identity-topline">
            <span className="availability-dot" aria-hidden="true" />
            <span>{isNl ? 'Beschikbaar voor select werk' : 'Available for selected work'}</span>
          </div>

          <div className="portrait-orbit">
            <img src="/jay-portrait.png" alt="Jaymian-Lee Reinartz" width="1066" height="1600" fetchPriority="high" />
          </div>

          <div className="identity-copy">
            <p className="identity-kicker">Jaymian-Lee Reinartz</p>
            <h1>{isNl ? <>Digitale producten<br />die iets dóén.</> : <>Digital products<br />that do the work.</>}</h1>
            <p className="identity-motto">{isNl ? 'Kan niet bestaat niet.' : '“Impossible” is not in my vocabulary.'}</p>
            <p className="identity-summary">
              {isNl
                ? 'Full-stack developer uit Limburg. Ik bouw AI-systemen, slimme ecommerce en software die teams echt verder brengt.'
                : 'Full-stack developer in Limburg. I build AI systems, sharp ecommerce and software that moves teams forward.'}
            </p>
          </div>

          <div className="identity-actions">
            <a className="primary-action" href="mailto:info@jaymian-lee.nl">
              {isNl ? 'Start iets moois' : 'Start something good'} <AnimatedIcon name="arrow-right" size={18} />
            </a>
            <a className="text-action" href="#projects">{isNl ? 'Bekijk het werk' : 'See the work'} <AnimatedIcon name="arrow-down" size={17} /></a>
          </div>

          <div className="identity-footer">
            <p>AI · Ecommerce · Product engineering</p>
            <nav aria-label="Social links">
              {socials.map((social) => <a key={social.label} href={social.url} target="_blank" rel="noreferrer">{social.label}</a>)}
            </nav>
          </div>
        </aside>

        <section className="project-area" id="projects" aria-labelledby="project-title">
          <header className="project-header">
            <p className="eyebrow-line"><span>{isNl ? 'Geselecteerd werk' : 'Selected work'}</span><span>2024—26</span></p>
            <div className="project-heading-row">
              <h2 id="project-title">{isNl ? 'Kan niet bestaat niet.' : 'Nothing is impossible.'}</h2>
              <p>{isNl ? 'Een kleine selectie van producten die ik heb gebouwd, vormgegeven of verder ontwikkel.' : 'A focused selection of products I have built, shaped or continue to develop.'}</p>
            </div>
            <button
              type="button"
              className="project-view-toggle"
              onClick={() => setActiveView((view) => (view === 'work' ? 'socials' : 'work'))}
              aria-pressed={activeView === 'socials'}
              aria-controls="project-content"
            >
              <AnimatedIcon name={activeView === 'work' ? 'plus' : 'arrow-left'} size={15} />
              {activeView === 'work' ? (isNl ? 'Bekijk mijn socials' : 'View my socials') : (isNl ? 'Terug naar werk' : 'Back to work')}
            </button>
          </header>

          <AnimatePresence mode="wait" initial={false}>
          {activeView === 'work' ? (
            <motion.div
              id="project-content"
              key="work"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
          <div className="project-list">
            {activeProjects.map((project, index) => (
              <article
                className={`project-entry tone-${project.tone}`}
                key={project.name}
                style={{ '--entry-index': index, '--project-shot': project.image ? `url(${project.image})` : 'none' }}
              >
                {project.url ? (
                  <a className="project-visual" href={project.url} target="_blank" rel="noreferrer" aria-label={`${isNl ? 'Open' : 'Open'} ${project.name}`}>
                    <span className="project-logo" aria-hidden="true">
                      {project.logo ? <img src={project.logo} alt="" /> : <span className="project-monogram">{project.monogram}</span>}
                    </span>
                    <span className="visual-arrow"><AnimatedIcon name="arrow-right" size={19} /></span>
                    <span className="visual-no">{project.number}</span>
                  </a>
                ) : (
                  <div className="project-visual" aria-hidden="true">
                    <span className="project-logo">
                      {project.logo ? <img src={project.logo} alt="" /> : <span className="project-monogram">{project.monogram}</span>}
                    </span>
                    <span className="visual-no">{project.number}</span>
                  </div>
                )}
                <div className="project-info">
                  <div className="project-meta"><span>{project.type}</span><span>{project.year}</span></div>
                  <h3>{project.url ? <a href={project.url} target="_blank" rel="noreferrer">{project.name}</a> : project.name}</h3>
                  <p className="project-summary">{project.summary}</p>
                  <div className="project-bottom">
                    <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <p className="release-note"><i aria-hidden="true" />{project.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="lab-strip" aria-label="The Lab">
            <p>{isNl ? 'Tussen projecten door' : 'Between projects'}</p>
            <h2>{isNl ? 'Ik experimenteer ook in het openbaar.' : 'I also experiment in public.'}</h2>
            <div>
              <Link to="/lab">{isNl ? 'Open mijn Lab' : 'Open the Lab'} <AnimatedIcon name="arrow-right" size={17} /></Link>
              <Link to="/word-lee">Word-Lee <AnimatedIcon name="gamepad" size={17} /></Link>
            </div>
          </section>

          <section className="archive-section" aria-labelledby="archive-title">
            <div>
              <p>{isNl ? 'Projectarchief' : 'Project archive'}</p>
              <h2 id="archive-title">{isNl ? 'Afgerond, gearchiveerd of deprecated.' : 'Finished, archived or deprecated.'}</h2>
            </div>
            <ul>
              {archivedProjects.map((project) => (
                <li key={project.name}>
                  <span className="archive-mark">↘</span>
                  <span><strong>{project.name}</strong><small>{project.type}</small></span>
                  <em>{isNl ? 'Gearchiveerd' : 'Archived'}</em>
                </li>
              ))}
            </ul>
          </section>

            </motion.div>
          ) : (
            <motion.section
              id="project-content"
              key="socials"
              className="socials-showcase"
              aria-label={isNl ? 'Sociale profielen' : 'Social profiles'}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <p className="socials-intro">{isNl ? 'Volg het proces' : 'Follow the process'}</p>
              <div className="socials-list">
                {socials.map((social, index) => (
                  <a className="social-row" key={social.label} href={social.url} target="_blank" rel="noreferrer">
                    <span className="social-number">0{index + 1}</span>
                    <span className="social-copy"><strong>{social.label}</strong><small>{social.handle}</small></span>
                    <span className="social-description">{isNl ? social.nl : social.en}</span>
                    <AnimatedIcon name="arrow-right" size={22} />
                  </a>
                ))}
              </div>
              <a className="socials-mail" href="mailto:info@jaymian-lee.nl">
                <AnimatedIcon name="mail" size={19} />
                {isNl ? 'Liever direct contact? Stuur me een mail.' : 'Prefer a direct line? Send me an email.'}
              </a>
            </motion.section>
          )}
          </AnimatePresence>

          <footer className="portfolio-footer">
            <p>© {new Date().getFullYear()} Jaymian-Lee Reinartz</p>
            <a href="mailto:info@jaymian-lee.nl">info@jaymian-lee.nl</a>
            <p>Limburg, NL</p>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
