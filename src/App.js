import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import FloatingUtilityBar from './components/FloatingUtilityBar';
import MainFooter from './components/MainFooter';
import Seo from './components/Seo';
import {
  createBreadcrumbSchema,
  createPersonSchema,
  createWebPageSchema,
  createWebsiteSchema,
  siteSeo
} from './data/seo';
import services from './data/services';
import { buildAiContext } from './utils/aiContext';
import './App.css';

const SITE_URL = 'https://jaymian-lee.nl';
const SITE_NAME = 'Jaymian-Lee Reinartz Portfolio';


const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const projectLinks = [
  {
    name: 'Botforger',
    url: 'https://botforger.com',
    image: '/projects/botforger-com.jpg',
    category: { en: 'AI Chatbot Builder', nl: 'AI Chatbot Builder' },
    summary: {
      en: 'Built as a no-code chatbot platform for creating and embedding AI chatbots with practical automation features.',
      nl: 'Gebouwd als no-code chatbot platform om AI chatbots te maken en te embedden met praktische automation features.'
    },
    impact: {
      en: 'Laid the product and architecture foundation later expanded in Corthex.',
      nl: 'Legde de product- en architectuurbasis die later verder is uitgebouwd in Corthex.'
    }
  },
  {
    name: 'Corthex',
    url: 'https://corthex.app',
    image: '/projects/corthex-app.jpg',
    category: { en: 'AI Knowledge Platform', nl: 'AI Knowledge Platform' },
    summary: {
      en: 'Developed an AI platform where teams can deploy assistants and collaborative workspaces grounded in their own knowledge.',
      nl: 'Ontwikkeld als AI platform waarmee teams assistants en collaboratieve workspaces op hun eigen kennis kunnen uitrollen.'
    },
    impact: {
      en: 'From quick deployment to grounded multi-agent workflows on proprietary data.',
      nl: 'Van snelle deployment naar grounded multi-agent workflows op proprietary data.'
    }
  },
  {
    name: 'Vizualy',
    url: 'https://vizualy.nl',
    image: '/projects/vizualy-nl.jpg',
    category: { en: 'Renovation Visualizer', nl: 'Renovatie Visualizer' },
    summary: {
      en: 'Created an AI renovation dashboard for facade scans, before/after comparisons, and direct product placement previews.',
      nl: 'Een AI renovatie-dashboard gemaakt voor gevelopnames, voor/na vergelijkingen en directe productplaatsing previews.'
    },
    impact: {
      en: 'Helps customers make faster home-improvement decisions with visual clarity.',
      nl: 'Helpt klanten sneller beslissen over woningverbetering met visuele duidelijkheid.'
    }
  },
  {
    name: 'Twigsie',
    url: 'https://twigsie.com',
    image: '/projects/twigsie-com.jpg',
    category: { en: 'Plant Ecommerce', nl: 'Planten Ecommerce' },
    summary: {
      en: 'Delivered an ecommerce storefront for plant cuttings and accessories, including care guidance and beginner-focused FAQs.',
      nl: 'Een ecommerce storefront opgeleverd voor plantenstekjes en accessoires, inclusief verzorgingshulp en beginnergerichte FAQ.'
    },
    impact: {
      en: 'Made product discovery and post-purchase plant care easier for new customers.',
      nl: 'Maakte productontdekking en nazorg voor planten eenvoudiger voor nieuwe klanten.'
    }
  },
  {
    name: 'Mintventory.com',
    url: 'https://mintventory.com',
    image: '/projects/mintventory-com.svg',
    category: { en: 'Inventory Platform', nl: 'Inventory platform' },
    summary: {
      en: 'Built a collector platform for trading card inventory, catalog search, card scanning, and grading across Pokemon, Magic: The Gathering, Lorcana, One Piece, and sealed product.',
      nl: 'Een collector platform gebouwd voor trading card inventory, cataloguszoeker, card scanning en grading voor Pokemon, Magic: The Gathering, Lorcana, One Piece en sealed product.'
    },
    impact: {
      en: 'Helps collectors identify cards faster, track condition and value, and keep the collection organized in one fast workflow.',
      nl: 'Helpt verzamelaars kaarten sneller te vinden, conditie en waarde te volgen en de collectie in één snelle workflow te organiseren.'
    }
  },
  {
    name: 'Vizualy Prints',
    url: 'https://vizualyprints.com',
    image: '/projects/vizualyprints-com.jpg',
    category: { en: 'Poster Ecommerce', nl: 'Poster Ecommerce' },
    summary: {
      en: 'Built and optimized a poster and wall decor webshop with structured categories and conversion-focused content sections.',
      nl: 'Een poster- en wanddecoratie webshop gebouwd en geoptimaliseerd met duidelijke categorieën en conversiegerichte contentsecties.'
    },
    impact: {
      en: 'Improved browsing flow from inspiration to checkout-ready product choices.',
      nl: 'Verbeterde de browse-flow van inspiratie naar checkout-klare productkeuzes.'
    }
  },
  {
    name: 'MartijnKozijn.nl',
    url: 'https://martijnkozijn.nl',
    image: '/projects/martijnkozijn-nl.jpg',
    category: { en: 'PrestaShop Refactor', nl: 'PrestaShop Refactor' },
    summary: {
      en: 'Completed a full website refactor to PrestaShop for a high-volume kozijnen en deuren webshop, focused on speed and maintainability.',
      nl: 'Een volledige website-refactor naar PrestaShop afgerond voor een high-volume kozijnen en deuren webshop, met focus op snelheid en onderhoudbaarheid.'
    },
    impact: {
      en: 'More stable ecommerce operations with cleaner structure for long-term growth.',
      nl: 'Stabielere ecommerce-operatie met een schonere structuur voor groei op lange termijn.'
    }
  },
  {
    name: 'Refacthor',
    url: 'https://refacthor.nl',
    image: '/projects/refacthor-site-screenshot.png',
    category: { en: 'Owner Project', nl: 'Eigen project' },
    summary: {
      en: 'Owner-led platform focused on practical digital solutions, robust builds, and long-term performance for real businesses.',
      nl: 'Eigen platform met focus op praktische digitale oplossingen, robuuste builds en duurzame performance voor echte bedrijven.'
    },
    impact: {
      en: 'Acts as a flagship showcase for product quality, structure, and conversion-minded implementation.',
      nl: 'Fungeert als vlaggenschip voor productkwaliteit, structuur en conversiegerichte implementatie.'
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
    'Based in Limburg, active across Nederland and international projects.',
    'Also involved in digital work for deOostelijkeKrant.'
  ],
  nl: [
    '10+ jaar ervaring met webproducten, ecommerce oplossingen en software voor groeiende teams.',
    'Focus op bruikbare AI automation en chatbot automation met meetbare business resultaten.',
    'Gebaseerd in Limburg, actief in heel Nederland en internationale projecten.',
    'Ook betrokken bij digitaal werk voor deOostelijkeKrant.'
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
    },
    {
      role: 'Lead Developer',
      company: 'MartijnKozijn.nl',
      website: 'https://martijnkozijn.nl',
      period: '2023 to Present',
      summary:
        'Lead developer for an innovative online webshop selling windows and doors, focused on scalable ecommerce architecture and smooth buying flows.',
      highlight: 'Improved platform reliability, conversion flow, and technical delivery speed for ongoing growth.'
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
    },
    {
      role: 'Lead Developer',
      company: 'MartijnKozijn.nl',
      website: 'https://martijnkozijn.nl',
      period: '2023 tot Nu',
      summary:
        'Lead developer voor een innovatieve online webshop die kozijnen en deuren verkoopt, met focus op schaalbare ecommerce architectuur en een soepele koopflow.',
      highlight: 'Versterkte platformstabiliteit, conversieflow en technische doorloopsnelheid voor verdere groei.'
    }
  ]
};

const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', url: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', url: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube', url: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram', url: 'https://www.instagram.com/jaymianlee_/' }
];



const PRELOADER_GREETINGS = ['Hello', 'Hey', 'Hola', 'Olà', 'Hallo', 'Ciao', 'こんにちは', 'Jaymian-Lee'];

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
    ctaDaily: 'Word-Lee',
    ctaLab: 'Open Lab',
    stickyDaily: 'Play Word-Lee',
    sp500SpotlightTitle: 'New: Word-Lee',
    sp500SpotlightText: 'Play the daily word challenge built for curious minds, with leaderboard support and a clean, focused flow.',
    sp500SpotlightCta: 'Play Word-Lee',
    popupWordleeTitle: 'Word-Lee is live',
    popupWordleeText: 'Have you played Word-Lee today?',
    popupWordleeCta: 'Play Word-Lee',
    popupDismiss: 'Later',
    twitchLiveTitle: 'Jaymian-Lee is live on Twitch',
    twitchLiveText: 'He is live now. Watch the stream.',
    twitchLiveCta: 'Watch now',
    twitchOfflineLabel: 'Twitch currently offline',
    twitchLiveLabel: 'Twitch live now',
    quickLinksLabel: 'Quick links',
    storyKicker: 'Approach',
    storyTitle: 'Simple where it should be, strong where it matters.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'Technical services for scalable digital products.',
    servicePagesKicker: 'Landing pages',
    servicePagesTitle: 'SEO landing pages for specific search intent.',
    caseKicker: 'Case studies',
    caseTitle: 'Recent outcomes across automation and ecommerce.',
    experienceKicker: 'Experience',
    experienceTitle: 'Roles across product, engineering, and automation.',
    socialsKicker: 'Connect',
    socialsTitle: 'Professional channels and project updates.',
    workKicker: 'Selected work',
    workTitle: 'Projects built for clarity, speed, and long term quality.',
    refacthorBadge: 'Owner Refacthor',
    refacthorTitle: 'Why Refacthor?',
    refacthorText: 'Refacthor is where product vision, architecture, and execution come together. It reflects how I build fast, stable, conversion-minded web platforms with long-term maintainability.',
    refacthorCta: 'View more 👉',
    contactKicker: 'Contact',
    contactTitle: 'Let us discuss your next build.',
    contactText:
      'Available for product engineering, ecommerce development, PrestaShop modules, WordPress plugins, and AI automation projects.',
    contactCta: 'Send an email',
    seoKicker: 'SEO and AI search',
    seoTitle: 'Clear answers for people, search engines, and AI assistants.',
    seoText:
      'This portfolio is structured around the services, projects, and outcomes people search for most often. That means direct copy, crawlable headings, meaningful image alt text, and page-level context that helps AI systems understand what I do.',
    seoFaqTitle: 'Frequently asked questions',
    seoFaq: [
      {
        q: 'What kind of work do you do?',
        a: 'I build full stack web products, AI automation flows, ecommerce improvements, PrestaShop modules, WordPress plugins, and chatbot systems.'
      },
      {
        q: 'Do you work on projects outside Limburg?',
        a: 'Yes. I am based in Limburg, but I work with clients and teams across the Netherlands and on international projects.'
      },
      {
        q: 'Can you help with SEO and AI SEO?',
        a: 'Yes. I can structure pages, improve content hierarchy, add schema, optimize metadata, and make content more understandable for search engines and AI systems.'
      }
    ],
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
    footerWordleeTitle: 'Word-Lee',
    footerWordleeText: 'Try the daily word challenge built for curious minds.',
    footerWordleeCta: 'Play Word-Lee',
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
    ctaDaily: 'Word-Lee',
    ctaLab: 'Open Lab',
    stickyDaily: 'Speel Word-Lee',
    sp500SpotlightTitle: 'Nieuw: Word-Lee',
    sp500SpotlightText: 'Speel de dagelijkse woordchallenge voor nieuwsgierige denkers, met leaderboard en een rustige, gerichte flow.',
    sp500SpotlightCta: 'Speel Word-Lee',
    popupWordleeTitle: 'Word-Lee staat klaar',
    popupWordleeText: 'Heb je vandaag Word-Lee al gedaan?',
    popupWordleeCta: 'Speel Word-Lee',
    popupDismiss: 'Later',
    twitchLiveTitle: 'Jaymian-Lee is live op Twitch',
    twitchLiveText: 'Hij is nu live. Kijk direct mee.',
    twitchLiveCta: 'Nu kijken',
    twitchOfflineLabel: 'Twitch nu offline',
    twitchLiveLabel: 'Twitch nu live',
    quickLinksLabel: 'Snelle links',
    storyKicker: 'Aanpak',
    storyTitle: 'Eenvoud waar het kan, kracht waar het telt.',
    capabilitiesKicker: 'Services',
    capabilitiesTitle: 'Technische services voor schaalbare digitale producten.',
    servicePagesKicker: 'Landingspagina\'s',
    servicePagesTitle: 'SEO landingspagina\'s voor specifieke zoekintentie.',
    caseKicker: 'Case studies',
    caseTitle: 'Recente resultaten in automation en ecommerce.',
    experienceKicker: 'Ervaring',
    experienceTitle: 'Rollen binnen product, engineering en automation.',
    socialsKicker: 'Connect',
    socialsTitle: 'Professionele kanalen en project updates.',
    workKicker: 'Geselecteerde projecten',
    workTitle: 'Projecten gebouwd voor helderheid, snelheid en duurzame kwaliteit.',
    refacthorBadge: 'Eigenaar Refacthor',
    refacthorTitle: 'Waarom Refacthor?',
    refacthorText: 'Refacthor is de plek waar productvisie, architectuur en uitvoering samenkomen. Het laat zien hoe ik snelle, stabiele en conversiegerichte webplatforms bouw met focus op onderhoudbaarheid op lange termijn.',
    refacthorCta: 'Bekijk meer 👉',
    contactKicker: 'Contact',
    contactTitle: 'Laten we je volgende build bespreken.',
    contactText:
      'Beschikbaar voor product engineering, ecommerce development, PrestaShop modules, WordPress plugins en AI automation projecten.',
    contactCta: 'Stuur een e-mail',
    seoKicker: 'SEO en AI search',
    seoTitle: 'Duidelijke antwoorden voor mensen, zoekmachines en AI assistants.',
    seoText:
      'Deze portfolio is opgebouwd rond de services, projecten en resultaten waar mensen het vaakst op zoeken. Dat betekent directe copy, crawlbare headings, zinvolle alt teksten en paginacontext die AI-systemen helpt begrijpen wat ik doe.',
    seoFaqTitle: 'Veelgestelde vragen',
    seoFaq: [
      {
        q: 'Wat voor werk doe je?',
        a: 'Ik bouw full stack webproducten, AI automation flows, ecommerce verbeteringen, PrestaShop modules, WordPress plugins en chatbot systemen.'
      },
      {
        q: 'Werk je alleen in Limburg?',
        a: 'Nee. Ik zit in Limburg, maar werk met klanten en teams in heel Nederland en aan internationale projecten.'
      },
      {
        q: 'Kun je helpen met SEO en AI SEO?',
        a: 'Ja. Ik kan paginastructuur verbeteren, content hiërarchie aanscherpen, schema toevoegen, metadata optimaliseren en content beter leesbaar maken voor zoekmachines en AI systemen.'
      }
    ],
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
    footerWordleeTitle: 'Word-Lee',
    footerWordleeText: 'Speel de dagelijkse woord challenge voor nieuwsgierige denkers.',
    footerWordleeCta: 'Speel Word-Lee',
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
  const [showWordleePopup, setShowWordleePopup] = useState(false);
  const [showTwitchLivePopup, setShowTwitchLivePopup] = useState(false);
  const [twitchLive, setTwitchLive] = useState(false);

  const revealRefs = useRef([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');

    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme();
    const nextLanguage = savedLanguage === 'en' || savedLanguage === 'nl' ? savedLanguage : detectBrowserLanguage();

    setTheme(nextTheme);
    setLanguage(nextLanguage);
    setMessages([{ role: 'assistant', content: copy[nextLanguage].greeting }]);
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

;


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
    if (showPreloader) {
      setShowWordleePopup(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `wordly-popup-seen:${today}`;
    if (!localStorage.getItem(key)) {
      setShowWordleePopup(true);
      localStorage.setItem(key, '1');
    }
  }, [showPreloader]);

  useEffect(() => {
    if (showPreloader) return;

    let cancelled = false;

    const checkLiveStatus = async () => {
      try {
        const response = await fetch('/api/stream/twitch/live');

        const raw = await response.text();
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
        if (!response.ok) return;

        const isLiveNow = Boolean(data?.live);
        if (cancelled) return;

        setTwitchLive(isLiveNow);

        if (isLiveNow) {
          const fingerprint = String(data?.uptime || data?.checkedAt || Date.now());
          const popupKey = `twitch-live-popup-v1:${fingerprint}`;
          if (!sessionStorage.getItem(popupKey)) {
            setShowTwitchLivePopup(true);
            sessionStorage.setItem(popupKey, '1');
          }
        }
      } catch {
        if (!cancelled) setTwitchLive(false);
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 120000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showPreloader]);

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
    if (prefersReducedMotion) return;

    let rafId = 0;

    const updateStackProgress = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const cards = document.querySelectorAll('.stack-card');

      if (!isMobile || !cards.length) {
        cards.forEach((card) => card.style.setProperty('--stack-progress', '0'));
        return;
      }

      const stackTop = 12;
      const distance = window.innerHeight * 0.65;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const raw = (stackTop - rect.top) / distance;
        const progress = Math.max(0, Math.min(1, raw));
        card.style.setProperty('--stack-progress', progress.toFixed(4));
      });
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateStackProgress);
    };

    updateStackProgress();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [prefersReducedMotion]);

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
        body: JSON.stringify({
          messages: [...apiMessages, userMessage],
          context: buildAiContext({ page: 'home', language })
        })
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
  const homeSeoJsonLd = useMemo(() => {
    const canonical = siteSeo.siteUrl;
    const pageTitle = language === 'nl'
      ? 'Jaymian-Lee Reinartz | Full stack developer voor AI automation en ecommerce groei'
      : 'Jaymian-Lee Reinartz | Full stack developer for AI automation and ecommerce growth';
    const pageDescription = language === 'nl'
      ? 'Portfolio van Jaymian-Lee Reinartz, full stack developer uit Limburg, gespecialiseerd in AI automation, ecommerce development, chatbot automation, PrestaShop modules en WordPress plugins.'
      : 'Portfolio of Jaymian-Lee Reinartz, a full stack developer in Limburg focused on AI automation, ecommerce development, chatbot automation, PrestaShop modules, and WordPress plugins.';

    return {
      '@context': 'https://schema.org',
      '@graph': [
        createPersonSchema(),
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({
          name: pageTitle,
          url: canonical,
          description: pageDescription,
          language: language === 'nl' ? 'nl-NL' : 'en-US',
          image: `${siteSeo.siteUrl}/jay.png`
        }),
        createBreadcrumbSchema([
          { name: 'Home', item: canonical }
        ]),
        {
          '@type': 'FAQPage',
          mainEntity: t.seoFaq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a
            }
          }))
        }
      ]
    };
  }, [language, t.seoFaq]);

  const activeGreetings = prefersReducedMotion ? PRELOADER_GREETINGS.slice(0, 4) : PRELOADER_GREETINGS;

  return (
    <div className={`site-shell ${showPreloader ? 'is-preloading' : ''}`}>
      <Seo
        title={language === 'nl'
          ? 'Jaymian-Lee Reinartz | Full stack developer voor AI automation en ecommerce groei'
          : 'Jaymian-Lee Reinartz | Full stack developer for AI automation and ecommerce growth'}
        description={language === 'nl'
          ? 'Portfolio van Jaymian-Lee Reinartz, full stack developer uit Limburg, gespecialiseerd in AI automation, ecommerce development, chatbot automation, PrestaShop modules en WordPress plugins.'
          : 'Portfolio of Jaymian-Lee Reinartz, a full stack developer in Limburg focused on AI automation, ecommerce development, chatbot automation, PrestaShop modules, and WordPress plugins.'}
        canonicalPath="/"
        language={language}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={language === 'nl'
          ? 'Portret van Jaymian-Lee Reinartz, full stack developer uit Limburg'
          : 'Portrait of Jaymian-Lee Reinartz, full stack developer based in Limburg'}
        jsonLd={homeSeoJsonLd}
      />

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

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={t.askMe}
        onAsk={() => setIsChatOpen((prev) => !prev)}
        askAriaLabel={isChatOpen ? t.closeChat : t.openChat}
      />

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
                  alt={language === 'nl'
                    ? 'Portret van Jaymian-Lee Reinartz, full stack developer gespecialiseerd in AI automation en ecommerce'
                    : 'Portrait of Jaymian-Lee Reinartz, full stack developer specialized in AI automation and ecommerce'}
                  loading="eager"
                  decoding="async"
                  className="portrait-image"
                  fetchPriority="high"
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
                  <Link to="/lab">Lab</Link>
                  <Link to="/word-lee">Word-Lee</Link>
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
                  <a
                    href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                    aria-label="Open LinkedIn profile"
                  >
                    LinkedIn profile
                  </a>
                  <Link to="/word-lee" className="btn btn-daily" aria-label="Open Word-Lee game">
                    {t.ctaDaily}
                  </Link>
                  <Link to="/lab" className="btn btn-ghost" aria-label="Open Lab page">
                    {t.ctaLab}
                  </Link>
                </div>

                <div className="hero-sp500-spotlight" aria-label="Word-Lee highlight">
                  <p className="section-kicker">{t.sp500SpotlightTitle}</p>
                  <p>{t.sp500SpotlightText}</p>
                  <Link to="/word-lee" className="btn btn-ghost" aria-label="Go to Word-Lee page">
                    {t.sp500SpotlightCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="section reveal stack-card refacthor-spotlight" id="refacthor" ref={(el) => (revealRefs.current[1] = el)} style={{ '--stack-index': 1, '--stack-layer': 2 }}>
          <div className="section-card stack-panel">
            <article className="refacthor-card">
              <div className="refacthor-visual-wrap">
                <img
                  src="/projects/refacthor-site-screenshot.png"
                  alt="Refacthor website screenshot"
                  className="refacthor-image"
                  loading="lazy"
                  decoding="async"
                  width="1600"
                  height="900"
                />
                <span className="refacthor-badge">{t.refacthorBadge}</span>
              </div>

              <div className="refacthor-content">
                <h2>{t.refacthorTitle}</h2>
                <p>{t.refacthorText}</p>
                <a href="https://refacthor.nl" target="_blank" rel="noreferrer" className="btn btn-primary refacthor-cta">
                  {t.refacthorCta}
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="section reveal stack-card" id="about" ref={(el) => (revealRefs.current[2] = el)} style={{ '--stack-index': 2, '--stack-layer': 3 }}>
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

        <section className="section reveal stack-card" id="services" ref={(el) => (revealRefs.current[3] = el)} style={{ '--stack-index': 3, '--stack-layer': 4 }}>
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

        <section className="section reveal stack-card" id="service-pages" ref={(el) => (revealRefs.current[10] = el)} style={{ '--stack-index': 3.5, '--stack-layer': 4.5 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.servicePagesKicker}</p>
            <h2>{t.servicePagesTitle}</h2>
            <div className="capabilities-grid">
              {services.map((service) => (
                <article className="capability-card" key={service.slug}>
                  <h3>{service.title[language]}</h3>
                  <p>{service.summary[language]}</p>
                  <Link to={`/services/${service.slug}`} className="work-link">
                    {language === 'nl' ? 'Open pagina' : 'Open page'} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal stack-card" id="case-studies" ref={(el) => (revealRefs.current[4] = el)} style={{ '--stack-index': 4, '--stack-layer': 5 }}>
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

        <section className="section reveal stack-card" id="experience" ref={(el) => (revealRefs.current[5] = el)} style={{ '--stack-index': 5, '--stack-layer': 6 }}>
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

        <section className="section reveal stack-card" id="selected-work" ref={(el) => (revealRefs.current[6] = el)} style={{ '--stack-index': 6, '--stack-layer': 7 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.workKicker}</p>
            <h2>{t.workTitle}</h2>
            <div className="work-grid">
              {projectLinks.map((project) => (
                <article className="work-card" key={project.name}>
                  <img
                    src={project.image}
                    alt={
                      language === 'nl'
                        ? `${project.name} project screenshot, voorbeeld van ${project.category[language].toLowerCase()}`
                        : `${project.name} project screenshot showing the ${project.category[language].toLowerCase()} product`
                    }
                    className="work-image"
                    loading="lazy"
                    decoding="async"
                    width="1600"
                    height="900"
                  />
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

        <section className="section reveal stack-card" id="connect" ref={(el) => (revealRefs.current[7] = el)} style={{ '--stack-index': 7, '--stack-layer': 8 }}>
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

        <section className="section reveal stack-card" id="contact" ref={(el) => (revealRefs.current[8] = el)} style={{ '--stack-index': 8, '--stack-layer': 9 }}>
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

        <section className="section reveal stack-card" id="seo-faq" ref={(el) => (revealRefs.current[9] = el)} style={{ '--stack-index': 9, '--stack-layer': 10 }}>
          <div className="section-card stack-panel">
            <p className="section-kicker">{t.seoKicker}</p>
            <h2>{t.seoTitle}</h2>
            <p className="lead">{t.seoText}</p>
            <div className="experience-grid">
              {t.seoFaq.map((item) => (
                <article className="experience-card" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        </div>
      </main>

      {showTwitchLivePopup && (
        <div className="wordly-popup-overlay" role="dialog" aria-modal="true" aria-label={t.twitchLiveTitle}>
          <div className="wordly-popup-card twitch-live-popup-card">
            <button
              type="button"
              className="wordly-popup-close"
              aria-label="Sluit Twitch live popup"
              onClick={() => setShowTwitchLivePopup(false)}
            >
              ✕
            </button>
            <div className="wordly-popup-body">
              <p className="wordly-popup-kicker">Live now</p>
              <h3>{t.twitchLiveTitle}</h3>
              <p className="wordly-popup-text">{t.twitchLiveText}</p>
              <div className="wordly-popup-actions">
                <button type="button" className="wordly-popup-dismiss" onClick={() => setShowTwitchLivePopup(false)}>
                  {t.popupDismiss}
                </button>
                <a
                  href="https://twitch.tv/jaymianlee"
                  target="_blank"
                  rel="noreferrer"
                  className="wordly-popup-cta"
                  onClick={() => setShowTwitchLivePopup(false)}
                >
                  {t.twitchLiveCta}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWordleePopup && (
        <div className="wordly-popup-overlay" role="dialog" aria-modal="true" aria-label={t.popupWordleeTitle}>
          <div className="wordly-popup-card">
            <button
              type="button"
              className="wordly-popup-close"
              aria-label="Sluit Word-Lee popup"
              onClick={() => setShowWordleePopup(false)}
            >
              ✕
            </button>
            <div className="wordly-popup-body">
              <p className="wordly-popup-kicker">Daily ritual</p>
              <h3>{t.popupWordleeTitle}</h3>
              <p className="wordly-popup-text">{t.popupWordleeText}</p>
              <div className="wordly-popup-actions">
                <button type="button" className="wordly-popup-dismiss" onClick={() => setShowWordleePopup(false)}>
                  {t.popupDismiss}
                </button>
                  <Link to="/word-lee" className="wordly-popup-cta" onClick={() => setShowWordleePopup(false)}>
                  {t.popupWordleeCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <MainFooter language={language} twitchLive={twitchLive} />

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


