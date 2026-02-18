import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const projects = [
  {
    name: 'Corthex',
    subtitle: 'AI automation platform',
    description:
      'Praktische AI-oplossingen voor ondernemers: van assistant workflows tot slimme integraties die tijd besparen en omzet ondersteunen.'
  },
  {
    name: 'Botforger',
    subtitle: 'Voorloper van Corthex',
    description:
      'Vroege chatbot- en automationsuite waarmee de basis werd gelegd voor schaalbare AI-implementaties in klantprocessen.'
  },
  {
    name: 'Vizualy',
    subtitle: 'Visual-first product concept',
    description:
      'Concept rond visuele storytelling en productpresentatie, met focus op heldere communicatie, merkbeleving en conversie.'
  },
  {
    name: 'Refacthor',
    subtitle: 'Code quality & snelheid',
    description:
      'Initiatief rondom refactoring, technische schuldreductie en onderhoudbare architectuur om teams sneller te laten leveren.'
  },
  {
    name: 'PrestaShop modules',
    subtitle: 'E-commerce maatwerk',
    description:
      'Custom modules voor checkout, backoffice flows, API-koppelingen en procesautomatisering voor webshops.'
  },
  {
    name: 'WordPress modules/plugins',
    subtitle: 'Content + commerce extensies',
    description:
      'Ontwikkeling van plugins en thema-uitbreidingen met aandacht voor performance, beheerbaarheid en business-doelen.'
  }
];

const defaultGreeting = {
  role: 'assistant',
  content:
    'Hoi! Ik ben Jay’s AI-assistent. Vraag me gerust over projecten zoals Corthex, Botforger, Vizualy, Refacthor of maatwerk modules.'
};

function App() {
  const [messages, setMessages] = useState([defaultGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const revealRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll);
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

  const apiMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
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

      const data = await response.json();

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
    <div className="site">
      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }} />

      <header className="hero reveal" ref={(el) => (revealRefs.current[0] = el)}>
        <p className="eyebrow">Portfolio · AI · Development</p>
        <h1>Jaymian-Lee Reinartz</h1>
        <p className="lead">
          Ik bouw digitale producten die <strong>praktisch werken</strong>: van AI-assistants en
          automatiseringen tot snelle webplatforms met focus op conversie en onderhoudbaarheid.
        </p>
        <div className="hero-actions">
          <a href="mailto:info@jaymian-lee.nl" className="btn btn-primary">Neem contact op</a>
          <a href="https://github.com/Jaymian-Lee" target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>
          <a href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/" target="_blank" rel="noreferrer" className="btn btn-ghost">LinkedIn</a>
        </div>
      </header>

      <section className="section reveal" ref={(el) => (revealRefs.current[1] = el)}>
        <h2>Projecten & Producten</h2>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="card" key={project.name}>
              <h3>{project.name}</h3>
              <p className="subtitle">{project.subtitle}</p>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section reveal" ref={(el) => (revealRefs.current[2] = el)}>
        <h2>Wat ik lever</h2>
        <ul className="value-list">
          <li>AI workflows en assistants die direct bruikbaar zijn voor teams</li>
          <li>Full-stack development met duidelijke architectuur en schaalbaarheid</li>
          <li>Integraties (API, CMS, e-commerce) voor soepelere bedrijfsprocessen</li>
          <li>UX en content met een heldere waardepropositie voor je doelgroep</li>
        </ul>
      </section>

      <section className="section reveal chat-section" ref={(el) => (revealRefs.current[3] = el)}>
        <h2>Vraag het aan de AI-assistent</h2>
        <p className="chat-intro">Stel een vraag over projecten, aanpak of technische expertise.</p>

        <div className="chat-box" role="log" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
          {loading && <div className="message assistant">Even nadenken…</div>}
        </div>

        <form onSubmit={sendMessage} className="chat-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bijv: Waar staat Corthex voor?"
            aria-label="Chat vraag"
          />
          <button type="submit" disabled={loading}>Verstuur</button>
        </form>

        {chatError && <p className="chat-error">{chatError}</p>}
      </section>
    </div>
  );
}

export default App;
