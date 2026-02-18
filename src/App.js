import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const projectLinks = [
  {
    name: 'Corthex',
    url: 'https://corthex.app',
    category: 'AI Product Studio',
    summary:
      'AI agents en automation-systemen die repetitief werk vervangen en teams sneller laten leveren.',
    impact: 'From concept to production assistants'
  },
  {
    name: 'Botforger',
    url: 'https://botforger.com',
    category: 'Automation Origins',
    summary:
      'Het fundament voor schaalbare chatbot-architectuur, workflows en no-nonsense implementatie.',
    impact: 'Early framework for practical AI workflows'
  },
  {
    name: 'Vizualy',
    url: 'https://vizualy.nl',
    category: 'Visual Product Concept',
    summary:
      'Visuele storytelling voor merken die sneller willen overtuigen met sterke, heldere presentaties.',
    impact: 'Presentation design with conversion focus'
  },
  {
    name: 'Refacthor',
    url: 'https://refacthor.nl',
    category: 'Engineering Quality',
    summary:
      'Refactoring-first development: minder technische schuld, meer snelheid en onderhoudbare codebases.',
    impact: 'Cleaner architecture, faster iteration'
  }
];

const capabilities = [
  {
    title: 'AI Strategy & Prototyping',
    text: 'Van use case mapping tot eerste werkende AI-flows in dagen, niet maanden.'
  },
  {
    title: 'Automation Engineering',
    text: 'Integraties, backend logic en agent orchestration die direct bedrijfsresultaat opleveren.'
  },
  {
    title: 'Full-Stack Product Build',
    text: 'Frontend, API en infrastructuur als één coherent systeem met premium UX en performance.'
  },
  {
    title: 'Technical Direction',
    text: 'Scherpe productkeuzes, maintainable architectuur en duidelijke technische roadmap.'
  }
];

const storyPoints = [
  '10+ jaar bouwen aan commerce, custom software en high-performance websites.',
  'Gefocust op bruikbare AI: echte workflows, meetbare output, geen demo-theater.',
  'Sterk in vertalen van business naar product: van strategy tot shipping.'
];

const defaultGreeting = {
  role: 'assistant',
  content:
    'Hi, ik ben Jay’s AI-assistent. Vraag me over zijn projecten, manier van werken, stack of hoe hij AI inzet voor echte business impact.'
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [messages, setMessages] = useState([defaultGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const revealRefs = useRef([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

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
      { threshold: 0.15 }
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
        throw new Error('De AI-endpoint gaf geen geldige JSON terug. Controleer de API-route op Vercel.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Onbekende fout bij AI-chat.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatError(err.message || 'AI-chat is momenteel niet beschikbaar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell">
      <div className="background-noise" aria-hidden="true" />
      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }} />

      <aside className="project-nav" aria-label="Project navigator">
        <p className="project-nav-label">Selected work</p>
        {projectLinks.map((project) => (
          <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="project-pill">
            {project.name}
          </a>
        ))}
      </aside>

      <main className="site">
        <header className="hero reveal" ref={(el) => (revealRefs.current[0] = el)}>
          <div className="hero-topline">
            <p className="eyebrow">Portfolio 2026 · AI Systems · Product Engineering</p>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle dark and light theme"
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          <h1>
            Premium digital products,
            <span> engineered for clarity and momentum.</span>
          </h1>

          <p className="lead">
            Ik ben <strong>Jaymian-Lee Reinartz</strong> — ik ontwerp en bouw AI-gedreven producten die teams
            sneller laten werken en merken sterker laten communiceren. Minimal, editorial en doelgericht.
          </p>

          <div className="hero-metrics" aria-label="Credibility highlights">
            <article>
              <p className="metric-value">AI + Product</p>
              <p className="metric-label">Praktische oplossingen van strategie tot shipping</p>
            </article>
            <article>
              <p className="metric-value">Full-stack</p>
              <p className="metric-label">Frontend, API, automation en integraties als één geheel</p>
            </article>
            <article>
              <p className="metric-value">Conversion-minded</p>
              <p className="metric-label">Sterke UX met meetbare business-impact</p>
            </article>
          </div>

          <div className="hero-actions">
            <a href="mailto:info@jaymian-lee.nl" className="btn btn-primary">Start een project</a>
            <a href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/" target="_blank" rel="noreferrer" className="btn btn-ghost">LinkedIn</a>
            <a href="https://github.com/Jaymian-Lee" target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>
          </div>
        </header>

        <section className="section split reveal" ref={(el) => (revealRefs.current[1] = el)}>
          <div>
            <p className="section-kicker">Story</p>
            <h2>Ik bouw met een editorial mindset: minder ruis, meer impact.</h2>
          </div>
          <ul className="story-list">
            {storyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[2] = el)}>
          <p className="section-kicker">Capabilities</p>
          <h2>Services die strategie, design en engineering verbinden.</h2>
          <div className="capabilities-grid">
            {capabilities.map((item) => (
              <article className="capability-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section reveal" ref={(el) => (revealRefs.current[3] = el)}>
          <p className="section-kicker">Selected work</p>
          <h2>Producten en initiatieven die groei, snelheid en kwaliteit samenbrengen.</h2>
          <div className="work-grid">
            {projectLinks.map((project) => (
              <article className="work-card" key={project.name}>
                <div className="work-top">
                  <p className="work-category">{project.category}</p>
                  <a href={project.url} target="_blank" rel="noreferrer" className="work-link">
                    Visit ↗
                  </a>
                </div>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
                <p className="work-impact">{project.impact}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className={`ai-widget ${isChatOpen ? 'open' : ''}`}>
        <button
          className="ai-orb"
          onClick={() => setIsChatOpen((prev) => !prev)}
          aria-label={isChatOpen ? 'Sluit AI assistent' : 'Open AI assistent'}
          aria-expanded={isChatOpen}
        >
          <span className="orb-core" />
          AI
        </button>

        <section className="chat-panel" aria-label="AI assistant panel">
          <header className="chat-header">
            <div>
              <p className="chat-title">Ask Jay’s AI</p>
              <p className="chat-subtitle">Over projecten, aanpak en expertise</p>
            </div>
            <button type="button" className="chat-close" onClick={() => setIsChatOpen(false)} aria-label="Sluit chat">
              ✕
            </button>
          </header>

          <div className="chat-box" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="message assistant">Even nadenken…</div>}
            <div ref={messageEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-form">
            <label htmlFor="chat-input" className="sr-only">Typ je vraag</label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bijv: Hoe helpt Jay bedrijven met AI?"
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>Verstuur</button>
          </form>

          {chatError && <p className="chat-error">{chatError}</p>}
        </section>
      </div>
    </div>
  );
}

export default App;
