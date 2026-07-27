import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import FloatingUtilityBar from './components/FloatingUtilityBar';
import AnimatedIcon from './components/AnimatedIcon';
import Seo from './components/Seo';
import { createItemListSchema, createPersonSchema, createProfessionalServiceSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from './data/seo';
import { getProjectCasePath } from './data/projectCases';
import { getAlternateLocalePaths, getLanguageSwitchPath, getLocaleFromPathname, localizePath } from './utils/locale';
import './App.css';

const projectData = [
  {
    name: 'Corthex',
    slug: 'corthex',
    url: 'https://corthex.app',
    image: '/projects/corthex-app.png',
    logo: 'https://www.google.com/s2/favicons?domain=corthex.app&sz=256',
    monogram: 'C',
    number: '01',
    timeline: { start: '2026', end: 'ongoing' },
    type: 'AI knowledge platform',
    summary: 'AI workspaces and capable assistants, grounded in a team’s own knowledge.',
    tags: ['Product', 'AI systems', 'Co-founder'],
    tone: 'blue',
    note: 'Currently shaping the next release'
  },
  {
    name: 'Vizualy',
    slug: 'vizualy',
    url: 'https://vizualy.nl',
    image: '/projects/vizualy-nl.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=vizualy.nl&sz=256',
    monogram: 'V',
    number: '02',
    timeline: { start: '2026', end: 'ongoing' },
    type: 'Renovation visualizer',
    summary: 'A visual decision tool for façades, materials, and before-and-after possibilities.',
    tags: ['Computer vision', 'Dashboard', 'Founder'],
    tone: 'sun',
    note: 'Visual workflows, made practical'
  },
  {
    name: 'MartijnKozijn.nl',
    slug: 'martijnkozijn',
    url: 'https://martijnkozijn.nl',
    image: '/projects/martijnkozijn-hero.png',
    logo: 'https://www.google.com/s2/favicons?domain=martijnkozijn.nl&sz=256',
    monogram: 'MK',
    number: '03',
    timeline: { start: '2023', end: 'ongoing' },
    type: 'Ecommerce architecture',
    summary: 'A faster, more maintainable buying experience for windows and doors.',
    tags: ['PrestaShop', 'Ecommerce', 'Lead developer'],
    tone: 'mint',
    note: 'Ongoing improvements & releases'
  },
  {
    name: 'Slecto',
    slug: 'slecto',
    url: null,
    image: '/projects/slecto-app.png',
    logo: 'https://slecto.app/_next/image?url=%2Fbrand%2Fslecto-icon.png&w=48&q=75',
    monogram: 'S',
    number: '04',
    timeline: { start: '2026', end: 'ongoing' },
    type: 'Digital product',
    summary: 'A new digital product currently taking shape from the ground up.',
    tags: ['Product', 'Development', 'Founder'],
    tone: 'orange',
    note: 'More soon'
  },
  {
    name: 'Botforger',
    slug: 'botforger',
    url: 'https://botforger.com',
    image: '/projects/botforger-com.png',
    logo: 'https://www.google.com/s2/favicons?domain=botforger.com&sz=256',
    monogram: 'B',
    number: '05',
    timeline: { start: '2025', end: '2026' },
    type: 'No-code chatbot builder',
    summary: 'The product foundation for no-code AI chatbots and useful automation.',
    tags: ['SaaS', 'Automation', 'Founder'],
    tone: 'purple',
    note: 'Evolved into Corthex'
  },
  {
    name: 'Mintventory',
    slug: 'mintventory',
    url: 'https://mintventory.com',
    image: '/projects/mintventory-com.svg',
    logo: 'https://www.google.com/s2/favicons?domain=mintventory.com&sz=256',
    monogram: 'M',
    number: '06',
    timeline: { start: '2026', end: '2026' },
    type: 'Collector platform',
    summary: 'Inventory, scanning, grading and discovery for serious trading-card collectors.',
    tags: ['Mobile flow', 'Data', 'Product'],
    tone: 'rose',
    note: 'In active development'
  },
  {
    name: 'Twigsie',
    slug: 'twigsie',
    url: 'https://twigsie.com',
    image: '/projects/twigsie-com.jpg',
    logo: 'https://www.google.com/s2/favicons?domain=twigsie.com&sz=256',
    monogram: 'T',
    number: '07',
    timeline: { start: '2025', end: '2026' },
    type: 'Plant ecommerce',
    summary: 'A gentle ecommerce experience for plant cuttings, care and first-time growers.',
    tags: ['Ecommerce', 'Content', 'Design system'],
    tone: 'green',
    note: 'Designed for easy discovery'
  },
  {
    name: 'Refacthor',
    slug: 'refacthor',
    url: 'https://refacthor.nl',
    image: '/projects/refacthor-hero.png',
    logo: 'https://www.google.com/s2/favicons?domain=refacthor.nl&sz=256',
    monogram: 'R',
    number: '08',
    timeline: { start: '2026', end: 'ongoing' },
    type: 'Digital product studio',
    summary: 'The studio where strategy, engineering and conversion-minded delivery come together.',
    tags: ['Strategy', 'Web', 'Founder'],
    tone: 'blue',
    note: 'The practice behind the work'
  },
  {
    name: 'Woonproblemen',
    slug: 'woonproblemen',
    url: 'https://woonproblemen.nl',
    image: '/projects/woonproblemen-hero.png',
    logo: 'https://woonproblemen.nl/wp-content/uploads/2026/01/Woonproblemen-cartoon.png',
    monogram: 'W',
    timeline: { start: '2026', end: 'ongoing' },
    type: 'WordPress SEO experiment',
    summary: 'A custom WordPress module that writes topic-led blog pages to test Search Console signals, indexing and organic rankings.',
    tags: ['WordPress', 'SEO automation', 'Search Console'],
    tone: 'blue',
    note: 'Testing search performance'
  },
  {
    name: 'Vizualy Prints',
    slug: 'vizualy-prints',
    url: 'https://vizualyprints.com',
    image: '/projects/vizualyprints-com.jpg',
    logo: null,
    monogram: 'VP',
    number: '09',
    timeline: { start: '2025', end: '2026' },
    type: 'Poster ecommerce',
    summary: 'A clearer route from visual inspiration to a confident, checkout-ready choice.',
    tags: ['Ecommerce', 'Conversion', 'Content'],
    tone: 'sun',
    note: 'Built to make browsing feel easy'
  }
];

// Keep portfolio work ordered from newest launch to oldest everywhere it is rendered.
// The 2026 releases use a deliberate showcase order after Corthex.
const projects = projectData
  .sort((first, second) => {
    const launchDifference = Number(second.timeline.start) - Number(first.timeline.start);

    if (launchDifference !== 0) return launchDifference;
    if (first.slug === 'slecto' && second.slug === 'vizualy') return -1;
    if (first.slug === 'vizualy' && second.slug === 'slecto') return 1;

    return 0;
  })
  .map((project, index) => ({
    ...project,
    number: String(index + 1).padStart(2, '0')
  }));

const archivedProjectNames = new Set(['Mintventory', 'Twigsie', 'Vizualy Prints']);
const activeProjects = projects.filter((project) => !archivedProjectNames.has(project.name));
const archivedProjects = projects.filter((project) => archivedProjectNames.has(project.name));
const formatProjectTimeline = ({ start, end }) => `${start} - ${end}`;

const socials = [
  { label: 'GitHub', handle: '@Jaymian-Lee', url: 'https://github.com/Jaymian-Lee', nl: 'Code, experimenten en de bouwstenen achter mijn producten.', en: 'Code, experiments and the building blocks behind my products.' },
  { label: 'LinkedIn', handle: 'Jaymian-Lee Reinartz', url: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/', nl: 'Updates over productontwikkeling, AI en de dingen die ik aan het maken ben.', en: 'Updates on product work, AI and the things I am building.' },
  { label: 'Instagram', handle: '@jaymianlee', url: 'https://www.instagram.com/jaymianlee/', nl: 'Een persoonlijk kijkje achter de schermen, van idee naar release.', en: 'A personal look behind the scenes, from idea to release.' },
  { label: 'Content IG', handle: '@jaymianlee_', url: 'https://www.instagram.com/jaymianlee_/', nl: 'Content, experimenten en korte updates over wat ik aan het maken ben.', en: 'Content, experiments and short updates on what I am making.' },
  { label: 'YouTube', handle: '@JaymianLee', url: 'https://www.youtube.com/@JaymianLee', nl: 'Video’s, walkthroughs en de verhalen achter de builds.', en: 'Videos, walkthroughs and the stories behind the builds.' },
  { label: 'Twitch', handle: 'twitch.tv/jaymianlee', url: 'https://twitch.tv/jaymianlee', nl: 'Live bouwen, experimenteren en praten met de community.', en: 'Live building, experimenting and talking with the community.' }
];

const education = [
  { school: 'Zuyd Hogeschool', nl: 'HBO-ICT', en: 'HBO-ICT', period: 'Sep 2022 - Jul 2024' },
  { school: 'VISTA college', nl: 'Applicatie- & mediaontwikkelaar · MBO 4', en: 'Application & media developer · MBO 4', period: 'Sep 2019 - Jul 2022' }
];

function App() {
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('work');
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);
  const canonicalPath = localizePath('/', language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);

  useEffect(() => {
    const storedTheme = localStorage.getItem('portfolio-theme');
    setTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('portfolio-theme', theme);
    localStorage.setItem('portfolio-language', language);
  }, [language, theme]);

  const isNl = language === 'nl';
  const homeSeo = isNl
    ? {
        title: 'Jaymian-Lee Reinartz | Software, e-commerce en digitale groei',
        description: 'Portfolio van Jaymian-Lee Reinartz: software, e-commerce-ervaringen, marketingtools, technische SEO en praktische AI-producten.'
      }
    : {
        title: 'Jaymian-Lee Reinartz | Software, ecommerce & digital growth',
        description: 'Portfolio of Jaymian-Lee Reinartz: software, ecommerce experiences, marketing systems, technical SEO and practical AI products.'
      };
  const toggleProjectView = () => {
    setActiveView((view) => (view === 'work' ? 'socials' : 'work'));
  };

  const toggleProjectViewFromIntro = () => {
    toggleProjectView();
    window.setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      createPersonSchema(),
      createWebsiteSchema({ language: ['nl', 'en'] }),
      createProfessionalServiceSchema(),
      createWebPageSchema({
        name: homeSeo.title,
        url: `${siteSeo.siteUrl}${canonicalPath}`,
        description: homeSeo.description,
        language: isNl ? 'nl-NL' : 'en-US',
        image: `${siteSeo.siteUrl}/jay-portrait.png`
      }),
      createItemListSchema({
        name: isNl ? 'Projecten van Jaymian-Lee Reinartz' : 'Projects by Jaymian-Lee Reinartz',
        url: `${siteSeo.siteUrl}${canonicalPath}#projects`,
        items: activeProjects.map(({ name, slug }) => ({ name, url: `${siteSeo.siteUrl}${localizePath(getProjectCasePath(slug), language)}` }))
      })
    ]
  }), [canonicalPath, homeSeo.description, homeSeo.title, isNl, language]);

  return (
    <div className="portfolio-shell">
      <Seo
        title={homeSeo.title}
        description={homeSeo.description}
        canonicalPath={canonicalPath}
        language={language}
        alternatePaths={alternatePaths}
        defaultLocalePath={alternatePaths.en}
        image={`${siteSeo.siteUrl}/jay-portrait.png`}
        imageAlt="Portrait of Jaymian-Lee Reinartz"
        jsonLd={jsonLd}
      />

      <a className="skip-link" href="#projects">{isNl ? 'Naar projecten' : 'Skip to projects'}</a>
      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, language === 'nl' ? 'en' : 'nl', location.search, location.hash))}
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        askLabel={isNl ? 'Mail' : 'Email'}
        askAriaLabel={isNl ? 'Stuur een e-mail' : 'Send an email'}
        onAsk={() => { window.location.href = 'mailto:info@jaymian-lee.nl'; }}
        wordLee={{ label: 'Word-Lee', hint: isNl ? 'Daily challenge' : 'Daily challenge', href: localizePath('/word-lee', language) }}
      />

      <main className="portfolio-layout">
        <aside className="identity-panel">
          <div className="identity-topline">
            <span className="availability-dot" aria-hidden="true" />
            <span>{isNl ? 'Beschikbaar voor select werk' : 'Available for selected work'}</span>
          </div>

          <div className="portrait-orbit">
            <img src="/jay-portrait.png" alt={isNl ? 'Portret van Jaymian-Lee Reinartz, full-stack developer' : 'Portrait of Jaymian-Lee Reinartz, full-stack developer'} width="1066" height="1600" fetchPriority="high" />
          </div>

          <div className="identity-copy">
            <p className="identity-kicker">Full-stack developer · Limburg</p>
            <h1>Jaymian-Lee<br />Reinartz.</h1>
            <p className="identity-motto">{isNl ? 'Kan niet bestaat niet.' : '“Impossible” is not in my vocabulary.'}</p>
            <p className="identity-summary">
              {isNl
                ? 'Full-stack developer uit Limburg. Ik bouw sterke software, e-commerce en marketingtools die teams vooruithelpen, met AI waar het echt iets toevoegt.'
                : 'Full-stack developer in Limburg. I build sharp software, ecommerce and marketing tools that move teams forward, with AI where it truly adds value.'}
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
            <button
              type="button"
              className="footer-social-action"
              onClick={toggleProjectViewFromIntro}
              aria-pressed={activeView === 'socials'}
              aria-controls="project-content"
            >
              <AnimatedIcon name={activeView === 'work' ? 'plus' : 'x'} size={14} />
              {activeView === 'work' ? (isNl ? 'Bekijk mijn socials' : 'View my socials') : (isNl ? 'Terug naar werk' : 'Back to work')}
            </button>
          </div>
        </aside>

        <section className="project-area" id="projects" aria-labelledby="project-title">
          <header className="project-header">
            <div className="project-heading-row">
              <h2 id="project-title">{isNl ? 'Kan niet bestaat niet.' : 'Nothing is impossible.'}</h2>
              <p>{isNl ? 'Een kleine selectie van producten die ik heb gebouwd, vormgegeven of verder ontwikkel.' : 'A focused selection of products I have built, shaped or continue to develop.'}</p>
            </div>
            <button
              type="button"
              className="project-view-toggle"
              onClick={toggleProjectView}
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
                {project.slug ? (
                  <Link className="project-visual" to={localizePath(getProjectCasePath(project.slug), language)} aria-label={`${isNl ? 'Bekijk' : 'View'} ${project.name}`}>
                    <span className="project-logo" aria-hidden="true">
                      {project.logo ? <img src={project.logo} alt="" /> : <span className="project-monogram">{project.monogram}</span>}
                    </span>
                    <span className="visual-arrow"><AnimatedIcon name="arrow-right" size={19} /></span>
                    <span className="visual-no">{project.number}</span>
                  </Link>
                ) : (
                  <div className="project-visual" aria-hidden="true">
                    <span className="project-logo">
                      {project.logo ? <img src={project.logo} alt="" /> : <span className="project-monogram">{project.monogram}</span>}
                    </span>
                    <span className="visual-no">{project.number}</span>
                  </div>
                )}
                <div className="project-info">
                  <div className="project-meta"><span>{project.type}</span><span>{formatProjectTimeline(project.timeline)}</span></div>
                  <h3>{project.slug ? <Link to={localizePath(getProjectCasePath(project.slug), language)}>{project.name}</Link> : project.name}</h3>
                  <p className="project-summary">{project.summary}</p>
                  <div className="project-bottom">
                    <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <p className="release-note"><i aria-hidden="true" />{project.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="lab-bridge" aria-label={isNl ? 'Naar het Lab' : 'Go to the Lab'}>
            <span className="lab-bridge-icon" aria-hidden="true"><AnimatedIcon name="flask-conical" size={22} /></span>
            <div>
              <p>{isNl ? 'Tussen de builds door' : 'Between the builds'}</p>
              <strong>{isNl ? 'Experimenten, games en kleine tools.' : 'Experiments, games and small tools.'}</strong>
            </div>
            <Link to={localizePath('/lab', language)}>{isNl ? 'Bekijk het Lab' : 'See the Lab'} <AnimatedIcon name="arrow-right" size={18} /></Link>
          </section>

          <section className="education-section" aria-labelledby="education-title">
            <div>
              <p>{isNl ? 'Opleiding' : 'Education'}</p>
              <h2 id="education-title">{isNl ? 'De basis achter de builds.' : 'The foundation behind the builds.'}</h2>
            </div>
            <ul>
              {education.map((item) => (
                <li key={item.school}>
                  <span className="education-mark"><AnimatedIcon name="graduation-cap" size={18} /></span>
                  <span><strong>{item.school}</strong><small>{isNl ? item.nl : item.en}</small></span>
                  <em>{item.period}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="archive-section" aria-labelledby="archive-title">
            <div>
              <p>{isNl ? 'Projectarchief' : 'Project archive'}</p>
              <h2 id="archive-title">{isNl ? 'Afgerond, gearchiveerd of deprecated.' : 'Finished, archived or deprecated.'}</h2>
            </div>
            <ul>
              {archivedProjects.map((project) => (
                <li key={project.name}>
                  <span className="archive-mark"><AnimatedIcon name="archive" size={18} /></span>
                  <span><Link to={localizePath(getProjectCasePath(project.slug), language)}><strong>{project.name}</strong></Link><small>{project.type}</small></span>
                  <em>{formatProjectTimeline(project.timeline)} · {isNl ? 'Gearchiveerd' : 'Archived'}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="lab-strip" aria-label="The Lab">
            <p>{isNl ? 'Tussen projecten door' : 'Between projects'}</p>
            <h2>{isNl ? 'Ik experimenteer ook in het openbaar.' : 'I also experiment in public.'}</h2>
            <div>
              <Link to={localizePath('/lab', language)}>{isNl ? 'Open mijn Lab' : 'Open the Lab'} <AnimatedIcon name="arrow-right" size={17} /></Link>
              <Link to={localizePath('/word-lee', language)}>Word-Lee <AnimatedIcon name="gamepad" size={17} /></Link>
            </div>
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
