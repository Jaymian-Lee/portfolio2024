import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import './App.css';

const SITE_URL = 'https://jaymian-lee.nl';
const SITE_NAME = 'Jaymian-Lee Reinartz Portfolio';

const projectLinks = [
  {
    name: 'Corthex',
    url: 'https://corthex.app',
    category: { en: 'AI Automation Product Studio', nl: 'AI Automation Product Studio' },
    summary: {
      en: 'Designing practical AI automation systems that save teams measurable time in daily work.',
      nl: 'Praktische AI automation systemen die teams dagelijks aantoonbaar tijd besparen.'
    },
    impact: {
      en: 'From strategy and product engineering to live workflows',
      nl: 'Van strategie en product engineering naar live workflows'
    }
  },
  {
    name: 'Botforger',
    url: 'https://botforger.com',
    category: { en: 'Chatbot Automation', nl: 'Chatbot Automation' },
    summary: {
      en: 'A strong base for chatbot automation, conversation flow design, and maintainable implementation. Later merged into Corthex.',
      nl: 'Een sterke basis voor chatbot automation, conversatieflow design en onderhoudbare implementatie. Later samengevoegd in Corthex.'
    },
    impact: {
      en: 'Reliable architecture that is now part of Corthex',
      nl: 'Betrouwbare architectuur die nu onderdeel is van Corthex'
    }
  },
  {
    name: 'Vizualy',
    url: 'https://vizualy.nl',
    category: { en: 'Brand and Product Communication', nl: 'Brand en Product Communicatie' },
    summary: {
      en: 'Visual storytelling for brands that need clear communication and stronger digital presence.',
      nl: 'Visual storytelling voor merken die heldere communicatie en een sterkere digitale presence zoeken.'
    },
    impact: {
      en: 'Clarity focused design that supports growth',
      nl: 'Design met focus op helderheid en groei'
    }
  },
  {
    name: 'Refacthor',
    url: 'https://refacthor.nl',
    category: { en: 'Full Stack Development', nl: 'Full Stack Development' },
    summary: {
      en: 'Full stack development focused on maintainable code, speed, and clean architecture over time.',
      nl: 'Full stack development met focus op onderhoudbare code, snelheid en schone architectuur op de lange termijn.'
    },
    impact: {
      en: 'Lower technical debt and smoother release cycles',
      nl: 'Minder technische schuld en soepelere releasecycli'
    }
  }
];

const capabilities = {
  en: [
    {
      title: 'AI Automation Engineering',
      text: 'Workflow automation with APIs, agents, and practical AI features that support operations.'
    },
    {
      title: 'Full Stack Development',
      text: 'From React frontend to backend APIs, data models, and deployment pipelines.'
    },
    {
      title: 'Ecommerce Development',
      text: 'Conversion focused ecommerce builds, custom checkout flows, and performance improvements.'
    },
    {
      title: 'PrestaShop and WordPress Extensions',
      text: 'Custom PrestaShop modules and WordPress plugins for business specific requirements.'
    }
  ],
  nl: [
    {
      title: 'AI Automation Engineering',
      text: 'Workflow automation met APIs, agents en praktische AI features die dagelijkse operatie ondersteunen.'
    },
    {
      title: 'Full Stack Development',
      text: 'Van React frontend tot backend APIs, datamodellen en deployment pipelines.'
    },
    {
      title: 'Ecommerce Development',
      text: 'Conversiegerichte ecommerce builds, custom checkout flows en performance verbeteringen.'
    },
    {
      title: 'PrestaShop en WordPress Extensies',
      text: 'Maatwerk PrestaShop modules en WordPress plugins voor specifieke business behoeften.'
    }
  ]
};

const storyPoints = {
  en: [
    '10+ years building web products, ecommerce solutions, and software for growing teams.',
    'Focused on useful AI automation and chatbot automation with measurable business outcomes.',
    'Based in Limburg, active across Nederland and international projects.'
  ],
  nl: [
    '10+ jaar ervaring met webproducten, ecommerce oplossingen en software voor groeiende teams.',
    'Focus op bruikbare AI automation en chatbot automation met meetbare business resultaten.',
    'Gebaseerd in Limburg, actief in heel Nederland en internationale projecten.'
  ]
};

const caseStudies = {
  en: [
    {
      title: 'Automation platform foundation',
      summary:
        'Designed a modular backend for automation workflows with clear observability and faster iteration speed.',
      result: 'Lower manual workload and better release rhythm for product teams.'
    },
    {
      title: 'Ecommerce growth and custom integrations',
      summary:
        'Implemented custom ecommerce integrations for catalog management, checkout logic, and analytics alignment.',
      result: 'Improved conversion quality and stronger operational stability.'
    },
    {
      title: 'Plugin and module engineering',
      summary:
        'Built maintainable WordPress plugins and PrestaShop modules for client specific workflows and features.',
      result: 'Faster updates and less dependence on heavy third party tooling.'
    }
  ],
  nl: [
    {
      title: 'Basis voor automation platform',
      summary:
        'Een modulaire backend ontworpen voor automation workflows met duidelijke observability en snellere iteratie.',
      result: 'Minder handmatig werk en een beter release ritme voor productteams.'
    },
    {
      title: 'Ecommerce groei en custom integraties',
      summary:
        'Custom ecommerce integraties gebouwd voor catalogbeheer, checkout logica en analytics afstemming.',
      result: 'Betere conversiekwaliteit en stabielere operatie.'
    },
    {
      title: 'Plugin en module engineering',
      summary:
        'Onderhoudbare WordPress plugins en PrestaShop modules gebouwd voor klantspecifieke workflows en features.',
      result: 'Snellere updates en minder afhankelijkheid van zware third party tooling.'
    }
  ]
};

const experience = {
  en: [
    {
      role: 'Co-Founder',
      company: 'Corthex',
      website: 'https://corthex.app',
      period: '2026 to Present',
      summary:
        'Building practical AI products and automation workflows with a strong focus on real business outcomes.',
      highlight: 'Leading product direction, delivery quality, and long term roadmap decisions.'
    },
    {
      role: 'Founder',
      company: 'Botforger',
      website: 'https://botforger.com',
      period: '2025 to 2026',
      summary:
        'Created the foundation for scalable chatbot and workflow automation systems before it was merged into Corthex.',
      highlight: 'Set the base architecture and product vision that now lives on in Corthex.'
    },
    {
      role: 'Software Developer | Owner',
      company: 'Refacthor',
      website: 'https://refacthor.nl',
      period: 'November 2021 to Present',
      summary:
        'Develops custom web solutions focused on digital growth, usability, and technical reliability.',
      highlight: 'Delivers high performance websites and structured development workflows for clients.'
    }
  ],
  nl: [
    {
      role: 'Co-Founder',
      company: 'Corthex',
      website: 'https://corthex.app',
      period: '2026 tot Nu',
      summary:
        'Bouwt praktische AI-producten en automation workflows met focus op echte business resultaten.',
      highlight: 'Stuurt productrichting, opleverkwaliteit en langetermijn roadmap keuzes.'
    },
    {
      role: 'Founder',
      company: 'Botforger',
      website: 'https://botforger.com',
      period: '2025 tot 2026',
      summary: 'Bouwde de basis voor schaalbare chatbot en workflow automation systemen, later samengevoegd in Corthex.',
      highlight: 'Zette de basisarchitectuur en productvisie neer die nu doorleeft in Corthex.'
    },
    {
      role: 'Softwareontwikkelaar | Eigenaar',
      company: 'Refacthor',
      website: 'https://refacthor.nl',
      period: 'november 2021 tot Nu',
      summary:
        'Ontwikkelt maatwerk websites met focus op digitale groei, gebruiksvriendelijkheid en technische betrouwbaarheid.',
      highlight: 'Levert snelle websites en gestructureerde ontwikkeltrajecten voor klanten.'
    }
  ]
};

const socialLinks = [
  { label: 'LinkedIn profile', url: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub repositories', url: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch channel', url: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube channel @JaymianLee', url: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram professional', url: 'https://www.instagram.com/jaymianlee_/' }
];



const footerQuickLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Case studies', href: '#case-studies' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' }
];

const footerProjects = [
  { label: 'Corthex', href: 'https://corthex.app' },
  { label: 'Botforger', href: 'https://botforger.com' },
  { label: 'Vizualy', href: 'https://vizualy.nl' },
  { label: 'Refacthor', href: 'https://refacthor.nl' }
];

const footerConnect = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', href: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', href: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram', href: 'https://www.instagram.com/jaymianlee_/' }
];

const PRELOADER_GREETINGS = ['Hello', 'Hey', 'Hola', 'Olà', 'Hallo', 'Ciao', 'こんにちは', 'مرحبا'];

const copy = {
  en: {
    eyebrow: 'Portfolio 2026',
    heroTitleA: 'Full stack developer for',
    heroTitleB: 'AI automation and ecommerce growth.',
    lead: 'I am Jaymian-Lee Reinartz. I help companies build useful digital products with AI automation, chatbot automation, ecommerce development, and product engineering.',
    metricA: 'Product Engineering',
    metricAText: 'From concept to validated release',
    metricB: 'AI + Ecommerce',
    metricBText: 'Automation that supports real customer journeys',
    metricC: 'Limburg, Nederland',
    metricCText: 'Local collaboration with international delivery',
    ctaPrimary: 'Start a project',
    ctaSecondary: 'Jump to services',
    ctaDaily: 'Wordly',
    stickyDaily: 'Play Wordly',
    popupWordlyTitle: 'Wordly is live',
    popupWordlyText: 'Have you played Wordly today?',
    popupWordlyCta: 'Play Wordly',
    popupDismiss: 'Later',
    quickLinksLabel: 'Quick links',
    storyKicker: 'Approach',
    storyTitle: 'Simple where it should be, strong where it matters.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'Technical services for scalable digital products.',
    caseKicker: 'Case studies',
    caseTitle: 'Recent outcomes across automation and ecommerce.',
    experienceKicker: 'Experience',
    experienceTitle: 'Roles across product, engineering, and automation.',
    socialsKicker: 'Connect',
    socialsTitle: 'Professional channels and project updates.',
    workKicker: 'Selected work',
    workTitle: 'Projects built for clarity, speed, and long term quality.',
    contactKicker: 'Contact',
    contactTitle: 'Let us discuss your next build.',
    contactText:
      'Available for product engineering, ecommerce development, PrestaShop modules, WordPress plugins, and AI automation projects.',
    contactCta: 'Send an email',
    visit: 'Visit project',
    askMe: 'Questions?',
    askTitle: 'Questions?',
    askSubtitle: 'Questions about projects, process, or collaboration',
    closeChat: 'Close chat',
    openChat: 'Open chat',
    thinking: 'Thinking...',
    inputPlaceholder: 'Example: Can you help with a PrestaShop module and chatbot flow?',
    send: 'Send',
    typeQuestion: 'Type your question',
    chatError: 'The assistant is temporarily unavailable.',
    greeting:
      'Hi, I can help with questions about Jay\'s services, AI automation work, and product engineering approach.',
    footerBrandPosition: 'Full stack developer for AI automation and ecommerce growth.',
    footerBrandText: 'Building warm, minimal digital products with strategy, engineering, and measurable outcomes.',
    footerQuickLinksTitle: 'Quick links',
    footerProjectsTitle: 'Projects',
    footerConnectTitle: 'Connect',
    footerWordlyTitle: 'Wordly',
    footerWordlyText: 'Try the daily word challenge built for curious minds.',
    footerWordlyCta: 'Play Wordly',
    footerDomain: 'jaymian-lee.nl',
    footerBuilt: 'Built with care in Limburg'
  },
  nl: {
    eyebrow: 'Portfolio 2026',
    heroTitleA: 'Full stack developer voor',
    heroTitleB: 'AI automation en ecommerce groei.',
    lead: 'Ik ben Jaymian-Lee Reinartz. Ik help bedrijven met bruikbare digitale producten via AI automation, chatbot automation, ecommerce development en product engineering.',
    metricA: 'Product Engineering',
    metricAText: 'Van concept naar gevalideerde release',
    metricB: 'AI + Ecommerce',
    metricBText: 'Automation die echte klantreizen ondersteunt',
    metricC: 'Limburg, Nederland',
    metricCText: 'Lokaal samenwerken met internationale oplevering',
    ctaPrimary: 'Start een project',
    ctaSecondary: 'Ga naar services',
    ctaDaily: 'Wordly',
    stickyDaily: 'Speel Wordly',
    popupWordlyTitle: 'Wordly staat klaar',
    popupWordlyText: 'Heb je vandaag Wordly al gedaan?',
    popupWordlyCta: 'Speel Wordly',
    popupDismiss: 'Later',
    quickLinksLabel: 'Snelle links',
    storyKicker: 'Aanpak',
    storyTitle: 'Eenvoud waar het kan, kracht waar het telt.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'Technische services voor schaalbare digitale producten.',
    caseKicker: 'Case studies',
    caseTitle: 'Recente resultaten in automation en ecommerce.',
    experienceKicker: 'Ervaring',
    experienceTitle: 'Rollen binnen product, engineering en automation.',
    socialsKicker: 'Connect',
    socialsTitle: 'Professionele kanalen en project updates.',
    workKicker: 'Geselecteerde projecten',
    workTitle: 'Projecten gebouwd voor helderheid, snelheid en duurzame kwaliteit.',
    contactKicker: 'Contact',
    contactTitle: 'Laten we je volgende build bespreken.',
    contactText:
      'Beschikbaar voor product engineering, ecommerce development, PrestaShop modules, WordPress plugins en AI automation projecten.',
    contactCta: 'Stuur een e-mail',
    visit: 'Bekijk project',
    askMe: 'Vragen?',
    askTitle: 'Vragen?',
    askSubtitle: 'Vragen over projecten, proces of samenwerking',
    closeChat: 'Sluit chat',
    openChat: 'Open chat',
    thinking: 'Even denken...',
    inputPlaceholder: 'Bijvoorbeeld: Kun je helpen met een PrestaShop module en chatbot flow?',
    send: 'Verstuur',
    typeQuestion: 'Typ je vraag',
    chatError: 'De assistent is tijdelijk niet beschikbaar.',
    greeting: 'Hi, ik help je graag met vragen over Jay zijn services, AI automation werk en product engineering aanpak.',
    footerBrandPosition: 'Full stack developer voor AI automation en ecommerce groei.',
    footerBrandText: 'Bouwt warme, minimal digitale producten met strategie, engineering en meetbaar resultaat.',
    footerQuickLinksTitle: 'Snelle links',
    footerProjectsTitle: 'Projecten',
    footerConnectTitle: 'Connect',
    footerWordlyTitle: 'Wordly',
    footerWordlyText: 'Speel de dagelijkse woord challenge voor nieuwsgierige denkers.',
    footerWordlyCta: 'Speel Wordly',
    footerDomain: 'jaymian-lee.nl',
    footerBuilt: 'Met zorg gebouwd in Limburg'
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderExiting, setPreloaderExiting] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [showWordlyPopup, setShowWordlyPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 840px)');
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMobile);
      return () => mediaQuery.removeEventListener('change', updateMobile);
    }

    mediaQuery.addListener(updateMobile);
    return () => mediaQuery.removeListener(updateMobile);
  }, []);


  useEffect(() => {
    const greetings = prefersReducedMotion ? PRELOADER_GREETINGS.slice(0, 4) : PRELOADER_GREETINGS;
    const exitDuration = prefersReducedMotion ? 200 : 650;
    const totalDuration = prefersReducedMotion ? 1600 : 3000;
    const transitionDuration = prefersReducedMotion ? 70 : 140;
    const stepDuration = Math.max(120, Math.floor((totalDuration - exitDuration) / greetings.length));

    let timer;
    let cancelled = false;
    let step = 0;

    const finish = () => {
      setPreloaderExiting(true);
      timer = setTimeout(() => {
        if (!cancelled) setShowPreloader(false);
      }, exitDuration);
    };

    const cycle = () => {
      if (cancelled) return;
      if (step >= greetings.length - 1) {
        timer = setTimeout(finish, Math.max(80, stepDuration - transitionDuration));
        return;
      }

      timer = setTimeout(() => {
        setGreetingVisible(false);
        timer = setTimeout(() => {
          if (cancelled) return;
          step += 1;
          setGreetingIndex(step);
          setGreetingVisible(true);
          cycle();
        }, transitionDuration);
      }, Math.max(80, stepDuration - transitionDuration));
    };

    setGreetingIndex(0);
    setGreetingVisible(true);
    setShowPreloader(true);
    setPreloaderExiting(false);
    cycle();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    document.body.style.overflow = showPreloader ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreloader]);

  useEffect(() => {
    if (showPreloader || !isMobile) {
      setShowWordlyPopup(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `wordly-popup-seen:${today}`;
    if (!localStorage.getItem(key)) {
      setShowWordlyPopup(true);
      localStorage.setItem(key, '1');
    }
  }, [showPreloader, isMobile]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    document.documentElement.setAttribute('lang', language);
    document.title =
      language === 'nl'
        ? 'Jaymian-Lee Reinartz | Full Stack Developer, AI Automation en Ecommerce Development'
        : 'Jaymian-Lee Reinartz | Full Stack Developer, AI Automation and Ecommerce Development';

    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: copy[language].greeting }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${SITE_URL}/#person`,
          name: 'Jaymian-Lee Reinartz',
          url: SITE_URL,
          image: `${SITE_URL}/jay.png`,
          jobTitle: 'Full Stack Developer',
          description:
            'Full stack developer focused on AI automation, ecommerce development, chatbot automation, and product engineering.',
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'Limburg',
            addressCountry: 'NL'
          },
          sameAs: socialLinks.map((item) => item.url)
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          inLanguage: ['en', 'nl']
        },
        {
          '@type': 'ProfessionalService',
          '@id': `${SITE_URL}/#service`,
          name: 'Jaymian-Lee Reinartz Development Services',
          url: SITE_URL,
          areaServed: ['Nederland', 'Limburg', 'Europe'],
          founder: { '@id': `${SITE_URL}/#person` },
          serviceType: [
            'AI automation',
            'Full stack development',
            'Ecommerce development',
            'PrestaShop modules',
            'WordPress plugins',
            'Chatbot automation',
            'Product engineering'
          ]
        }
      ]
    };

    let script = document.querySelector('script[data-seo-jsonld="true"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, []);

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
  const currentYear = new Date().getFullYear();
  const activeGreetings = prefersReducedMotion ? PRELOADER_GREETINGS.slice(0, 4) : PRELOADER_GREETINGS;

  return (
    <div className={`site-shell ${showPreloader ? 'is-preloading' : ''}`}>
      {showPreloader && (
        <div className={`preloader ${preloaderExiting ? 'exit' : ''}`} aria-hidden="true">
          <div className="preloader-inner">
            <p className={`preloader-greeting ${greetingVisible ? 'show' : 'hide'}`} key={activeGreetings[greetingIndex]}>
              {activeGreetings[greetingIndex]}
            </p>
          </div>
        </div>
      )}

      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="scroll-indicator" style={{ width: `${scrollProgress}%` }} />

      <aside className="project-nav" aria-label="Project navigator">
        <p className="project-nav-label">{t.workKicker}</p>
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

      <div className="utility-dock" aria-label="Display controls">
        <button
          type="button"
          className="dock-card control"
          onClick={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
          aria-label="Toggle language"
          title={language === 'en' ? 'Switch to Dutch' : 'Switch to English'}
        >
          <p className="dock-label">Language</p>
          <span className={`language-toggle ${language}`} aria-hidden="true">
            <span className="lang-knob" />
            <span className="lang-option en">EN</span>
            <span className="lang-option nl">NL</span>
          </span>
        </button>

        <button
          type="button"
          className="dock-card control"
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <p className="dock-label">Theme</p>
          <span className={`theme-toggle ${theme}`}>
            <span className="theme-track" aria-hidden="true">
              <span className="sun" />
              <span className="moon" />
            </span>
          </span>
        </button>

        <button
          type="button"
          className={`dock-card control dock-ask-mobile ${isChatOpen ? 'open' : ''}`}
          onClick={() => setIsChatOpen((prev) => !prev)}
          aria-label={isChatOpen ? t.closeChat : t.openChat}
          title={isChatOpen ? t.closeChat : t.openChat}
        >
          <p className="dock-label ask-label">{t.askMe}</p>
        </button>
      </div>

      <main className="site" id="main-content" aria-hidden={showPreloader}>
        <div className="card-stack" aria-label="Portfolio card stack">
        <header className="hero reveal stack-card" ref={(el) => (revealRefs.current[0] = el)} style={{ '--stack-index': 0, '--stack-layer': 1 }}>
          <div className="section-card stack-panel hero-card">
            <div className="hero-topline">
              <p className="eyebrow">{t.eyebrow}</p>
            </div>

            <div className="hero-intro">
              <figure className="portrait-wrap hero-portrait">
                <img
                  src="/jay-portrait.jpg"
                  alt="Jaymian-Lee Reinartz"
                  loading="lazy"
                  decoding="async"
                  className="portrait-image"
                  width="1050"
                  height="1400"
                />
              </figure>

              <div className="hero-copy">
                <h1>
                  {t.heroTitleA}
                  <span> {t.heroTitleB}</span>
                </h1>

                <p className="lead">{t.lead}</p>

                <nav className="quick-links" aria-label={t.quickLinksLabel}>
                  <a href="#services">Services</a>
                  <a href="#case-studies">Case Studies</a>
                  <a href="#experience">Experience</a>
                  <a href="#contact">Contact</a>
                </nav>

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
                  <a href="mailto:info@jaymian-lee.nl" className="btn btn-primary" aria-label="Email Jaymian-Lee to start a project">
                    {t.ctaPrimary}
                  </a>
                  <a href="#services" className="btn btn-ghost" aria-label="Read about services">
                    {t.ctaSecondary}
                  </a>
                  <Link to="/daily-word" className="btn btn-daily" aria-label="Open Wordly game">
                    {t.ctaDaily}
                  </Link>
                  <a
                    href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                    aria-label="Open LinkedIn profile"
                  >
                    LinkedIn profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="section reveal stack-card" id="about" ref={(el) => (revealRefs.current[1] = el)} style={{ '--stack-index': 1, '--stack-layer': 2 }}>
          <div className="section-card stack-panel">
            <div className="split">
              <div>
                <p className="section-kicker">{t.storyKicker}</p>
                <h2>{t.storyTitle}</h2>
              </div>
              <div>
                <ul className="story-list">
                  {storyPoints[language].map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {/* portrait moved to intro */}
              </div>
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="services" ref={(el) => (revealRefs.current[2] = el)} style={{ '--stack-index': 2, '--stack-layer': 3 }}>
          <div className="section-card stack-panel">
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
          </div>
        </section>

        <section className="section reveal stack-card" id="case-studies" ref={(el) => (revealRefs.current[3] = el)} style={{ '--stack-index': 3, '--stack-layer': 4 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.caseKicker}</p>
            <h2>{t.caseTitle}</h2>
            <div className="experience-grid">
              {caseStudies[language].map((item) => (
                <article className="experience-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <p className="experience-highlight">{item.result}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="experience" ref={(el) => (revealRefs.current[4] = el)} style={{ '--stack-index': 4, '--stack-layer': 5 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.experienceKicker}</p>
            <h2>{t.experienceTitle}</h2>
            <div className="experience-grid">
              {experience[language].map((item) => (
                <article className="experience-card" key={`${item.company}-${item.role}`}>
                  <div className="experience-top">
                    <p className="experience-role">{item.role}</p>
                    <p className="experience-period">{item.period}</p>
                  </div>
                  <h3>{item.website ? (<a href={item.website} target="_blank" rel="noreferrer" className="experience-link">{item.company}</a>) : item.company}</h3>
                  <p>{item.summary}</p>
                  <p className="experience-highlight">{item.highlight}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="selected-work" ref={(el) => (revealRefs.current[5] = el)} style={{ '--stack-index': 5, '--stack-layer': 6 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.workKicker}</p>
            <h2>{t.workTitle}</h2>
            <div className="work-grid">
              {projectLinks.map((project) => (
                <article className="work-card" key={project.name}>
                  <div className="work-top">
                    <p className="work-category">{project.category[language]}</p>
                    <a href={project.url} target="_blank" rel="noreferrer" className="work-link" aria-label={`Visit ${project.name} project`}>
                      {t.visit} ↗
                    </a>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.summary[language]}</p>
                  <p className="work-impact">{project.impact[language]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="connect" ref={(el) => (revealRefs.current[6] = el)} style={{ '--stack-index': 6, '--stack-layer': 7 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.socialsKicker}</p>
            <h2>{t.socialsTitle}</h2>
            <div className="social-inline-list" aria-label="Social links inline">
              {socialLinks.map((social) => (
                <a
                  key={`inline-${social.label}`}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="social-inline-link"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="contact" ref={(el) => (revealRefs.current[7] = el)} style={{ '--stack-index': 7, '--stack-layer': 8 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.contactKicker}</p>
            <h2>{t.contactTitle}</h2>
            <p className="lead">{t.contactText}</p>
            <div className="hero-actions">
              <a href="mailto:info@jaymian-lee.nl" className="btn btn-primary" aria-label="Contact Jaymian-Lee by email">
                {t.contactCta}
              </a>
            </div>
          </div>
        </section>
        </div>
      </main>

      {!isMobile && (
        <Link to="/daily-word" className="floating-daily-cta" aria-label="Open Wordly game">
          {t.stickyDaily}
        </Link>
      )}

      {showWordlyPopup && isMobile && (
        <div className="wordly-popup" role="dialog" aria-modal="false" aria-label={t.popupWordlyTitle}>
          <div className="wordly-popup-inner">
            <p className="wordly-popup-title">{t.popupWordlyTitle}</p>
            <p className="wordly-popup-text">{t.popupWordlyText}</p>
            <div className="wordly-popup-actions">
              <button type="button" className="wordly-popup-dismiss" onClick={() => setShowWordlyPopup(false)}>
                {t.popupDismiss}
              </button>
              <Link to="/daily-word" className="wordly-popup-cta" onClick={() => setShowWordlyPopup(false)}>
                {t.popupWordlyCta}
              </Link>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer" aria-label="Footer">
        <div className="footer-shell">
          <div className="footer-grid">
            <section className="footer-brand" aria-label="Brand">
              <p className="footer-kicker">Brand</p>
              <h2>Jaymian-Lee Reinartz</h2>
              <p className="footer-position">{t.footerBrandPosition}</p>
              <p className="footer-description">{t.footerBrandText}</p>
            </section>

            <nav className="footer-column" aria-label={t.footerQuickLinksTitle}>
              <p className="footer-kicker">{t.footerQuickLinksTitle}</p>
              <ul>
                {footerQuickLinks.map((item) => (
                  <li key={`quick-${item.label}`}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <section className="footer-column" aria-label={t.footerProjectsTitle}>
              <p className="footer-kicker">{t.footerProjectsTitle}</p>
              <ul>
                {footerProjects.map((item) => (
                  <li key={`project-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="footer-column" aria-label={t.footerConnectTitle}>
              <p className="footer-kicker">{t.footerConnectTitle}</p>
              <ul>
                {footerConnect.map((item) => (
                  <li key={`connect-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="footer-wordly" aria-label="Wordly">
              <p className="footer-kicker">{t.footerWordlyTitle}</p>
              <h3>Daily challenge</h3>
              <p>{t.footerWordlyText}</p>
              <Link to="/daily-word" className="footer-wordly-cta">
                {t.footerWordlyCta}
              </Link>
            </section>
          </div>

          <div className="footer-bottomline" aria-label="Copyright">
            <p>© {currentYear} Jaymian-Lee Reinartz</p>
            <p>{t.footerDomain}</p>
            <p>{t.footerBuilt}</p>
          </div>
        </div>
      </footer>

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

        <section className="chat-panel" aria-label="Assistant panel" aria-hidden={!isChatOpen}>
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
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, children, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
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
