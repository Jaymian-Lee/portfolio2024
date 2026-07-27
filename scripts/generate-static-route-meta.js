const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://www.jaymian-lee.nl';
const buildDir = path.resolve(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');

const pages = [
  { path: '/', en: ['Jaymian-Lee Reinartz | Full-Stack Developer', 'Portfolio of Jaymian-Lee Reinartz, a full-stack developer building software, ecommerce and AI products.'], nl: ['Jaymian-Lee Reinartz | Full-stack developer', 'Portfolio van Jaymian-Lee Reinartz: software, e-commerce-ervaringen en praktische AI-producten.'] },
  { path: '/lab', en: ['The Lab | Experimental subprojects', 'Explore experimental tools, games and utilities by Jaymian-Lee Reinartz.'], nl: ['The Lab | Experimentele subprojecten', 'Bekijk experimentele tools, games en utilities van Jaymian-Lee Reinartz.'] },
  { path: '/word-lee', en: ['Word-Lee | Daily word game', 'Play Word-Lee, a daily 5-letter word game with a leaderboard and local-first progress.'], nl: ['Word-Lee | Dagelijkse woordgame', 'Speel Word-Lee, een dagelijkse 5-letter woordgame met leaderboard en lokale voortgang.'] },
  { path: '/toepen', en: ['Toepen scoreboard | Card game scorekeeper', 'A quick local scoreboard for Toepen game nights.'], nl: ['Toepen scorebord | Score bijhouden', 'Een snel, lokaal scorebord voor Toepen-avonden.'] },
  { path: '/pesten', en: ['Pesten scoreboard | Card game scorekeeper', 'A flexible scorekeeper for Pesten, built around your house rules.'], nl: ['Pesten scorebord | Score bijhouden', 'Een flexibele scorekeeper voor Pesten, afgestemd op jullie huisregels.'] },
  { path: '/sp500-calculator', en: ['S&P 500 Calculator | Estimate returns', 'Estimate long-term S&P 500 scenarios with historical data and clear charts.'], nl: ['S&P 500 Calculator | Rendement berekenen', 'Bereken mogelijke S&P 500-scenario’s met historische data en heldere grafieken.'] },
  { path: '/stream', en: ['Stream Dashboard | Live stream hub', 'A live hub for multi-chat, stream status and platform monitoring.'], nl: ['Stream-dashboard | Live stream hub', 'Een live-hub voor multichat, streamstatus en platformmonitoring.'] },
  { path: '/stream/chat', en: ['Stream Chat | Multi-platform chat', 'A focused multi-platform chat dashboard for live streams.'], nl: ['Stream Chat | Multiplatform chat', 'Een gefocust chatdashboard voor live streams op meerdere platformen.'] },
  { path: '/projects/corthex', image: '/projects/corthex-app.png', en: ['Corthex | AI knowledge platform', 'A case study about deployable AI assistants and collaborative knowledge workspaces.'], nl: ['Corthex | AI-kennisplatform', 'Een case study over inzetbare AI-assistenten en samenwerkende kennis-workspaces.'] },
  { path: '/projects/vizualy', image: '/projects/vizualy-nl.jpg', en: ['Vizualy | AI renovation visualizer', 'A case study about helping homeowners visualise renovation choices.'], nl: ['Vizualy | AI-renovatievisualizer', 'Een case study over renovatiekeuzes zichtbaar maken voor huiseigenaren.'] },
  { path: '/projects/martijnkozijn', image: '/projects/martijnkozijn-hero.png', en: ['MartijnKozijn.nl | Ecommerce architecture', 'A case study about a continuously improved ecommerce experience for made-to-measure products.'], nl: ['MartijnKozijn.nl | E-commercearchitectuur', 'Een case study over e-commerce voor kozijnen, deuren en producten op maat.'] },
  { path: '/projects/slecto', image: '/projects/slecto-app.png', en: ['Slecto | Guided selling platform', 'A case study about guiding ecommerce visitors to the right product choice.'], nl: ['Slecto | Guided selling-platform', 'Een case study over webshopbezoekers naar de juiste productkeuze begeleiden.'] },
  { path: '/projects/refacthor', image: '/projects/refacthor-hero.png', en: ['Refacthor | Digital product studio', 'A case study about strategy, design, engineering and search performance.'], nl: ['Refacthor | Digitale productstudio', 'Een case study over strategie, design, engineering en vindbaarheid.'] },
  { path: '/projects/woonproblemen', image: '/projects/woonproblemen-hero.png', en: ['Woonproblemen | WordPress SEO experiment', 'A case study about topic-led editorial automation and organic search.'], nl: ['Woonproblemen | WordPress SEO-experiment', 'Een case study over contentautomatisering en organische vindbaarheid.'] },
  { path: '/projects/botforger', image: '/projects/botforger-com.png', en: ['Botforger | AI chatbot builder', 'A case study about an embeddable AI chatbot product.'], nl: ['Botforger | AI-chatbotbuilder', 'Een case study over een embeddable AI-chatbotproduct.'] },
  { path: '/projects/twigsie', image: '/projects/twigsie-com.jpg', en: ['Twigsie | Plant ecommerce concept', 'A case study about an approachable ecommerce experience for plant cuttings.'], nl: ['Twigsie | Plant-e-commerceconcept', 'Een case study over een toegankelijke e-commerce-ervaring voor plantenstekken.'] },
  { path: '/projects/vizualy-prints', image: '/projects/vizualyprints-com.jpg', en: ['Vizualy Prints | Poster ecommerce', 'A case study about visual discovery and buying art online.'], nl: ['Vizualy Prints | Poster-e-commerce', 'Een case study over visuele ontdekking en kunst online kopen.'] },
  { path: '/projects/mintventory', image: '/projects/mintventory-com.svg', en: ['Mintventory | Trading-card data platform', 'A case study about structured trading-card data and market signals.'], nl: ['Mintventory | Trading-carddataplatform', 'Een case study over gestructureerde trading-carddata en marktsignalen.'] }
];

const routes = pages.flatMap((page) => ['en', 'nl'].map((language) => {
  const [title, description] = page[language];
  const pathName = language === 'nl'
    ? (page.path === '/' ? '/nl' : `/nl${page.path}`)
    : page.path;
  const alternatePath = language === 'nl'
    ? page.path
    : (page.path === '/' ? '/nl' : `/nl${page.path}`);

  return {
    path: pathName,
    alternatePath,
    language,
    title,
    description,
    image: `${siteUrl}${page.image || '/jay.png'}`,
    imageAlt: title
  };
}));

if (!fs.existsSync(indexPath)) {
  throw new Error(`Expected build file not found: ${indexPath}`);
}

const replaceTag = (html, selector, tag) => html.replace(selector, tag);

function createRouteHtml(source, route) {
  const url = `${siteUrl}${route.path}`;
  const alternateLinks = [
    `<link rel="alternate" hreflang="${route.language}" href="${url}" />`,
    `<link rel="alternate" hreflang="${route.language === 'nl' ? 'en' : 'nl'}" href="${siteUrl}${route.alternatePath}" />`,
    `<link rel="alternate" hreflang="x-default" href="${route.language === 'nl' ? `${siteUrl}${route.alternatePath}` : url}" />`
  ].join('\n    ');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.title,
    url,
    inLanguage: route.language === 'nl' ? 'nl-NL' : 'en-US',
    description: route.description
  });

  let html = source;
  html = replaceTag(html, /<html\b[^>]*>/i, `<html lang="${route.language}">`);
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi, `<meta name="description" content="${route.description}" />`);
  html = replaceTag(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi, '');
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:locale["'])[^>]*>/gi, `<meta property="og:locale" content="${route.language === 'nl' ? 'nl_NL' : 'en_US'}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/gi, `<meta property="og:title" content="${route.title}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/gi, `<meta property="og:description" content="${route.description}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi, `<meta property="og:url" content="${url}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/gi, `<meta property="og:image" content="${route.image}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bproperty=["']og:image:alt["'])[^>]*>/gi, `<meta property="og:image:alt" content="${route.imageAlt}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/gi, `<meta name="twitter:title" content="${route.title}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/gi, `<meta name="twitter:description" content="${route.description}" />`);
  html = replaceTag(html, /<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>/gi, `<meta name="twitter:image" content="${route.image}" />`);
  html = html.replace(/<script\b(?=[^>]*\bdata-seo-jsonld=["']true["'])[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace('</head>', `    ${alternateLinks}\n    <script type="application/ld+json">${schema}</script>\n  </head>`);
  return html;
}

const source = fs.readFileSync(indexPath, 'utf8');
routes.forEach((route) => {
  const outputDir = path.join(buildDir, ...route.path.split('/').filter(Boolean));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), createRouteHtml(source, route));
});

console.log(`Wrote static metadata fallbacks for ${routes.length} public routes.`);
