import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const projectLinks = [
  {
    name: 'Corthex',
    url: 'https://corthex.app',
    category: { en: 'Product Studio', nl: 'Product Studio' },
    summary: {
      en: 'Designing practical automation systems that save teams real time.',
      nl: 'Praktische automation systemen die teams merkbaar tijd besparen.'
    },
    impact: { en: 'From concept to live workflow', nl: 'Van concept tot live workflow' }
  },
  {
    name: 'Botforger',
    url: 'https://botforger.com',
    category: { en: 'Automation Foundation', nl: 'Automation Foundation' },
    summary: {
      en: 'A clear foundation for chatbot architecture, workflows, and hands-on implementation.',
      nl: 'Een heldere basis voor chatbot architectuur, workflows en praktische implementatie.'
    },
    impact: { en: 'Early system for reliable automations', nl: 'Vroeg systeem voor betrouwbare automations' }
  },
  {
    name: 'Vizualy',
    url: 'https://vizualy.nl',
    category: { en: 'Visual Direction', nl: 'Visual Direction' },
    summary: {
      en: 'Visual storytelling for brands that want clarity and stronger presentations.',
      nl: 'Visual storytelling voor merken die duidelijke, sterke presentaties willen.'
    },
    impact: { en: 'Narrative design with business focus', nl: 'Narrative design met business focus' }
  },
  {
    name: 'Refacthor',
    url: 'https://refacthor.nl',
    category: { en: 'Engineering Quality', nl: 'Engineering Quality' },
    summary: {
      en: 'Refactoring focused development for cleaner architecture and better speed over time.',
      nl: 'Refactoring gerichte ontwikkeling voor schonere architectuur en duurzame snelheid.'
    },
    impact: { en: 'Less friction, better shipping rhythm', nl: 'Minder frictie, beter shipping ritme' }
  }
];

const capabilities = {
  en: [
    {
      title: 'Product Strategy',
      text: 'Turning ideas into clear product decisions and realistic plans.'
    },
    {
      title: 'Automation Engineering',
      text: 'Connecting tools, APIs, and workflows that support daily operations.'
    },
    {
      title: 'Full Stack Build',
      text: 'Building frontend and backend as one coherent, maintainable product.'
    },
    {
      title: 'Technical Direction',
      text: 'Making practical choices that keep teams fast and codebases healthy.'
    }
  ],
  nl: [
    {
      title: 'Productstrategie',
      text: 'Ideeën vertalen naar heldere productkeuzes en realistische plannen.'
    },
    {
      title: 'Automation Engineering',
      text: 'Tools, APIs en workflows verbinden die dagelijks werk ondersteunen.'
    },
    {
      title: 'Full Stack Build',
      text: 'Frontend en backend bouwen als één samenhangend en onderhoudbaar product.'
    },
    {
      title: 'Technische Richting',
      text: 'Praktische keuzes maken die teams snel houden en code gezond houden.'
    }
  ]
};

const storyPoints = {
  en: [
    'Over 10 years building commerce platforms, custom software, and modern web products.',
    'Focused on useful automation with measurable outcomes and no hype.',
    'Strong bridge between business goals, product thinking, and execution.'
  ],
  nl: [
    'Meer dan 10 jaar ervaring met commerce platforms, maatwerk software en moderne webproducten.',
    'Focus op bruikbare automation met meetbare resultaten en zonder hype.',
    'Sterke brug tussen business doelen, productdenken en uitvoering.'
  ]
};

const experience = {
  en: [
    {
      role: 'Founder and Product Engineer',
      company: 'Corthex',
      period: '2023 to Present',
      summary:
        'Leads product strategy and delivery for automation systems used by teams that need reliable operations and faster execution.',
      highlight: 'Designed and shipped end to end workflows that reduced repetitive manual work.'
    },
    {
      role: 'Founder',
      company: 'Botforger',
      period: '2021 to Present',
      summary:
        'Built a practical framework for chatbot architecture and implementation, focused on quality, clarity, and maintainability.',
      highlight: 'Helped teams move from fragmented bots to structured, production ready systems.'
    },
    {
      role: 'Lead Full Stack Developer',
      company: 'Independent Client Work',
      period: '2016 to Present',
      summary:
        'Partners with founders and operators to design and build scalable products across web, commerce, and internal tooling.',
      highlight: 'Delivered multiple full stack platforms from discovery to launch with long term support.'
    },
    {
      role: 'Ecommerce Technical Lead',
      company: 'Digital Commerce Projects',
      period: '2012 to 2016',
      summary:
        'Owned technical direction for online stores and conversion focused websites, aligning code quality with business growth.',
      highlight: 'Improved checkout performance, reliability, and release velocity across multiple projects.'
    }
  ],
  nl: [
    {
      role: 'Founder en Product Engineer',
      company: 'Corthex',
      period: '2023 tot Nu',
      summary:
        'Stuurt productstrategie en delivery voor automation systemen die teams helpen met betrouwbare operatie en snellere uitvoering.',
      highlight: 'Ontwierp en lanceerde end to end workflows die repetitief handmatig werk verminderden.'
    },
    {
      role: 'Founder',
      company: 'Botforger',
      period: '2021 tot Nu',
      summary:
        'Bouwde een praktisch framework voor chatbot architectuur en implementatie, met focus op kwaliteit, helderheid en onderhoudbaarheid.',
      highlight: 'Hielp teams van losse bots naar gestructureerde, production ready systemen.'
    },
    {
      role: 'Lead Full Stack Developer',
      company: 'Onafhankelijke klantprojecten',
      period: '2016 tot Nu',
      summary:
        'Werkt samen met founders en operators aan schaalbare producten voor web, commerce en interne tooling.',
      highlight: 'Leverde meerdere full stack platforms van discovery tot livegang met langdurige ondersteuning.'
    },
    {
      role: 'Ecommerce Technical Lead',
      company: 'Digital Commerce projecten',
      period: '2012 tot 2016',
      summary:
        'Verantwoordelijk voor technische richting van online stores en conversiegerichte websites, in lijn met businessgroei.',
      highlight: 'Verbeterde checkout performance, betrouwbaarheid en release snelheid in meerdere projecten.'
    }
  ]
};

const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', url: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', url: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube · jaymianlee', url: 'https://www.youtube.com/results?search_query=jaymianlee' },
  { label: 'Instagram', url: 'https://www.instagram.com/' }
];

const copy = {
  en: {
    eyebrow: 'Portfolio 2026',
    heroTitleA: 'Calm digital products',
    heroTitleB: 'designed to be useful.',
    lead: 'I am Jaymian-Lee Reinartz. I design and build products, websites, and automations with a clean visual style and practical outcomes.',
    metricA: 'Strategy to Build',
    metricAText: 'Clear thinking from first concept to launch',
    metricB: 'Full Stack',
    metricBText: 'Frontend, backend, and workflows in one line',
    metricC: 'Quiet Craft',
    metricCText: 'Minimal details that improve trust and clarity',
    ctaPrimary: 'Start a project',
    storyKicker: 'Approach',
    storyTitle: 'Simple where it should be, strong where it matters.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'A focused mix of strategy, design, and engineering.',
    experienceKicker: 'Experience',
    experienceTitle: 'High impact roles across product, automation, and engineering.',
    socialsKicker: 'Connect',
    socialsTitle: 'Find me on the platforms below.',
    workKicker: 'Selected work',
    workTitle: 'Projects built for clarity, speed, and long-term quality.',
    visit: 'Visit',
    askMe: 'Ask Me',
    askTitle: 'Ask Me',
    askSubtitle: 'Questions about projects, process, or collaboration',
    closeChat: 'Close chat',
    openChat: 'Open chat',
    thinking: 'Thinking...',
    inputPlaceholder: 'Example: What kind of projects do you take on?',
    send: 'Send',
    typeQuestion: 'Type your question',
    chatError: 'The assistant is temporarily unavailable.',
    greeting:
      'Hi, I can help with questions about Jay’s work, services, and project approach.'
  },
  nl: {
    eyebrow: 'Portfolio 2026',
    heroTitleA: 'Rustige digitale producten',
    heroTitleB: 'gemaakt om echt te helpen.',
    lead: 'Ik ben Jaymian-Lee Reinartz. Ik ontwerp en bouw producten, websites en automations met een cleane stijl en praktische resultaten.',
    metricA: 'Strategie tot Build',
    metricAText: 'Duidelijke keuzes van eerste idee tot livegang',
    metricB: 'Full Stack',
    metricBText: 'Frontend, backend en workflows op één lijn',
    metricC: 'Rustige Craft',
    metricCText: 'Minimal details die vertrouwen en helderheid vergroten',
    ctaPrimary: 'Start een project',
    storyKicker: 'Aanpak',
    storyTitle: 'Eenvoud waar het kan, kracht waar het telt.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'Een gerichte mix van strategie, design en engineering.',
    experienceKicker: 'Ervaring',
    experienceTitle: 'High impact rollen in product, automation en engineering.',
    socialsKicker: 'Connect',
    socialsTitle: 'Vind me op de onderstaande platformen.',
    workKicker: 'Geselecteerd werk',
    workTitle: 'Projecten gebouwd voor helderheid, snelheid en duurzame kwaliteit.',
    visit: 'Bekijk',
    askMe: 'Ask Me',
    askTitle: 'Ask Me',
    askSubtitle: 'Vragen over projecten, proces of samenwerking',
    closeChat: 'Sluit chat',
    openChat: 'Open chat',
    thinking: 'Even denken...',
    inputPlaceholder: 'Bijvoorbeeld: Wat voor projecten pak je op?',
    send: 'Verstuur',
    typeQuestion: 'Typ je vraag',
    chatError: 'De assistent is tijdelijk niet beschikbaar.',
    greeting: 'Hi, ik help je graag met vragen over Jay zijn werk, services en manier van samenwerken.'
  }
};

function App() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([{ role: 'assistant', content: copy.en.greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const revealRefs = useRef([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    }
    if (savedLanguage === 'en' || savedLanguage === 'nl') {
      setLanguage(savedLanguage);
      setMessages([{ role: 'assistant', content: copy[savedLanguage].greeting }]);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: copy[language].greeting }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      document.documentElement.style.setProperty('--scrollY', `${window.scrollY}px`);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.2 }
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading, isChatOpen]);

  const apiMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' || m.role === 'assistant').slice(-12),
    [messages]
  );

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setChatError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...apiMessages, userMessage] })
      });

      const raw = await response.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('The assistant endpoint returned invalid JSON.');
      }

      if (!response.ok) {
        throw new Error(data?.error || copy[language].chatError);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatError(err.message || copy[language].chatError);
    } finally {
      setLoading(false);
    }
  };

  const t = copy[language];

  return (
    <div className="site-shell">
      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }} />

      <aside className="project-nav" aria-label="Project navigator">
        <p className="project-nav-label">Selected work</p>
        {projectLinks.map((project) => (
          <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="project-pill">
            {project.name}
          </a>
        ))}
      </aside>

      <aside className="social-rail" aria-label="Social links">
        <p className="social-rail-label">Connect</p>
        {socialLinks.map((social) => (
          <a key={social.label} href={social.url} target="_blank" rel="noreferrer" className="social-link">
            {social.label}
          </a>
        ))}
      </aside>

      <main className="site">
        <header className="hero reveal" ref={(el) => (revealRefs.current[0] = el)}>
          <div className="hero-topline">
            <p className="eyebrow">{t.eyebrow}</p>

            <div className="top-controls">
              <div className="language-switch" aria-label="Language switch">
                <button
                  type="button"
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => setLanguage('en')}
                  aria-pressed={language === 'en'}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={language === 'nl' ? 'active' : ''}
                  onClick={() => setLanguage('nl')}
                  aria-pressed={language === 'nl'}
                >
                  NL
                </button>
              </div>

              <button
                type="button"
                className={`theme-toggle ${theme}`}
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                <span className="theme-track" aria-hidden="true">
                  <span className="sun" />
                  <span className="moon" />
                </span>
              </button>
            </div>
          </div>

          <h1>
            {t.heroTitleA}
            <span> {t.heroTitleB}</span>
          </h1>

          <p className="lead">{t.lead}</p>

          <div className="hero-metrics" aria-label="Credibility highlights">
            <article>
              <p className="metric-value">{t.metricA}</p>
              <p className="metric-label">{t.metricAText}</p>
            </article>
            <article>
              <p className="metric-value">{t.metricB}</p>
              <p className="metric-label">{t.metricBText}</p>
            </article>
            <article>
              <p className="metric-value">{t.metricC}</p>
              <p className="metric-label">{t.metricCText}</p>
            </article>
          </div>

          <div className="hero-actions">
            <a href="mailto:info@jaymian-lee.nl" className="btn btn-primary">
              {t.ctaPrimary}
            </a>
            <a
              href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              LinkedIn
            </a>
            <a href="https://github.com/Jaymian-Lee" target="_blank" rel="noreferrer" className="btn btn-ghost">
              GitHub
            </a>
          </div>
        </header>

        <section className="section split reveal" ref={(el) => (revealRefs.current[1] = el)}>
          <div>
            <p className="section-kicker">{t.storyKicker}</p>
            <h2>{t.storyTitle}</h2>
          </div>
          <ul className="story-list">
            {storyPoints[language].map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[2] = el)}>
          <p className="section-kicker">{t.capabilitiesKicker}</p>
          <h2>{t.capabilitiesTitle}</h2>
          <div className="capabilities-grid">
            {capabilities[language].map((item) => (
              <article className="capability-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[3] = el)}>
          <p className="section-kicker">{t.socialsKicker}</p>
          <h2>{t.socialsTitle}</h2>
          <div className="social-inline-list" aria-label="Social links inline">
            {socialLinks.map((social) => (
              <a key={`inline-${social.label}`} href={social.url} target="_blank" rel="noreferrer" className="social-inline-link">
                {social.label}
              </a>
            ))}
          </div>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[4] = el)}>
          <p className="section-kicker">{t.experienceKicker}</p>
          <h2>{t.experienceTitle}</h2>
          <div className="experience-grid">
            {experience[language].map((item) => (
              <article className="experience-card" key={`${item.company}-${item.role}`}>
                <div className="experience-top">
                  <p className="experience-role">{item.role}</p>
                  <p className="experience-period">{item.period}</p>
                </div>
                <h3>{item.company}</h3>
                <p>{item.summary}</p>
                <p className="experience-highlight">{item.highlight}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[5] = el)}>
          <p className="section-kicker">{t.workKicker}</p>
          <h2>{t.workTitle}</h2>
          <div className="work-grid">
            {projectLinks.map((project) => (
              <article className="work-card" key={project.name}>
                <div className="work-top">
                  <p className="work-category">{project.category[language]}</p>
                  <a href={project.url} target="_blank" rel="noreferrer" className="work-link">
                    {t.visit} ↗
                  </a>
                </div>
                <h3>{project.name}</h3>
                <p>{project.summary[language]}</p>
                <p className="work-impact">{project.impact[language]}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className={`ask-widget ${isChatOpen ? 'open' : ''}`}>
        <button
          className="ask-trigger"
          onClick={() => setIsChatOpen((prev) => !prev)}
          aria-label={isChatOpen ? t.closeChat : t.openChat}
          aria-expanded={isChatOpen}
        >
          <span className="dot" />
          {t.askMe}
        </button>

        <section className="chat-panel" aria-label="Assistant panel">
          <header className="chat-header">
            <div>
              <p className="chat-title">{t.askTitle}</p>
              <p className="chat-subtitle">{t.askSubtitle}</p>
            </div>
            <button type="button" className="chat-close" onClick={() => setIsChatOpen(false)} aria-label={t.closeChat}>
              ✕
            </button>
          </header>

          <div className="chat-box" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="message assistant">{t.thinking}</div>}
            <div ref={messageEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-form">
            <label htmlFor="chat-input" className="sr-only">
              {t.typeQuestion}
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {t.send}
            </button>
          </form>

          {chatError && <p className="chat-error">{chatError}</p>}
        </section>
      </div>
    </div>
  );
}

export default App;
