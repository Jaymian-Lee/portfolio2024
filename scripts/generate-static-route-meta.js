const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://www.jaymian-lee.nl';
const buildDir = path.resolve(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');

const projectSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'projectCases.js'), 'utf8');
const projectCases = JSON.parse(projectSource.slice(projectSource.indexOf('['), projectSource.indexOf('];') + 1));
const projectBySlug = Object.fromEntries(projectCases.map((project) => [project.slug, project]));
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const pages = [
  {"path":"/projects/deurwebshop","image":"/projects/deurwebshop.svg","en":["Deurwebshop.nl | Door webshop & 3D configurator","From the size of your opening to a door that fits. Compare models, choose your options and explore the result in 3D."],"nl":["Deurwebshop.nl | Deurenwebshop & 3D-configurator","Van de maat van je opening naar een passende deur. Modellen vergelijken, opties kiezen en het resultaat in 3D bekijken."]},
  { path: '/', en: ['Jaymian-Lee Reinartz | Full-Stack Developer in Limburg, NL', 'Full-stack developer in Limburg (NL). I build sharp software, ecommerce and marketing tools, with AI where it adds value. Nothing is impossible.'], nl: ['Jaymian-Lee Reinartz | Full-stack developer uit Limburg', 'Full-stack developer uit Limburg. Ik bouw sterke software, e-commerce en marketingtools, met AI waar het echt iets toevoegt. Kan niet bestaat niet.'] },
  { path: '/lab', en: ['The Lab | Experimental subprojects', 'Explore experimental tools, games and utilities by Jaymian-Lee Reinartz.'], nl: ['The Lab | Experimentele subprojecten', 'Bekijk experimentele tools, games en utilities van Jaymian-Lee Reinartz.'] },
  { path: '/word-lee', en: ['Word-Lee | Daily word game', 'Play Word-Lee, a daily 5-letter word game with a leaderboard and local-first progress.'], nl: ['Word-Lee | Dagelijkse woordgame', 'Speel Word-Lee, een dagelijkse 5-letter woordgame met leaderboard en lokale voortgang.'] },
  { path: '/toepen', en: ['Toepen scoreboard | Card game scorekeeper', 'A quick local scoreboard for Toepen game nights.'], nl: ['Toepen scorebord | Score bijhouden', 'Een snel, lokaal scorebord voor Toepen-avonden.'] },
  { path: '/pesten', en: ['Pesten scoreboard | Card game scorekeeper', 'A flexible scorekeeper for Pesten, built around your house rules.'], nl: ['Pesten scorebord | Score bijhouden', 'Een flexibele scorekeeper voor Pesten, afgestemd op jullie huisregels.'] },
  { path: '/sp500-calculator', en: ['S&P 500 Calculator | Estimate returns', 'Estimate long-term S&P 500 scenarios with historical data and clear charts.'], nl: ['S&P 500 Calculator | Rendement berekenen', 'Bereken mogelijke S&P 500-scenario’s met historische data en heldere grafieken.'] },
  { path: '/stream', en: ['Stream Dashboard | Live stream hub', 'A live hub for multi-chat, stream status and platform monitoring.'], nl: ['Stream-dashboard | Live stream hub', 'Een live-hub voor multichat, streamstatus en platformmonitoring.'] },
  { path: '/stream/chat', en: ['Stream Chat | Multi-platform chat', 'A focused multi-platform chat dashboard for live streams.'], nl: ['Stream Chat | Multiplatform chat', 'Een gefocust chatdashboard voor live streams op meerdere platformen.'] },
  { path: '/projects/sjmoeleboek', image: '/projects/sjmoeleboek.svg', en: ['Sjmoeleboek | Limburg carnival platform', 'A free carnival web app with groups, Sjmoelkaarten, Sjmoeldex and AI editor Dirk.'], nl: ['Sjmoeleboek | Limburgs carnavalsplatform', 'Een gratis carnavalswebapp met groepen, Sjmoelkaarten, Sjmoeldex en AI-redacteur Dirk.'] },
  { path: '/projects/publion', image: '/projects/publion.svg', en: ['Publion | AI content for WordPress', 'AI content planning, SEO briefs, reviewed drafts and images for WordPress.'], nl: ['Publion | AI-content voor WordPress', 'AI-contentplanning, SEO-briefs, gecontroleerde concepten en afbeeldingen voor WordPress.'] },
  { path: '/projects/corthex', image: '/projects/corthex-app.png', en: ['Corthex | AI knowledge platform', 'A case study about business-aware AI chatbots that answer questions and take actions.'], nl: ['Corthex | AI-kennisplatform', 'Een case study over AI-chatbots die bedrijfsinformatie gebruiken en acties uitvoeren.'] },
  { path: '/projects/vizualy', image: '/projects/vizualy-nl.jpg', en: ['Vizualy | AI renovation visualizer', 'A case study about helping homeowners visualise renovation choices.'], nl: ['Vizualy | AI-renovatievisualizer', 'Een case study over renovatiekeuzes zichtbaar maken voor huiseigenaren.'] },
  { path: '/projects/martijnkozijn', image: '/projects/martijnkozijn-hero.png', en: ['MartijnKozijn.nl | Ecommerce architecture', 'A case study about a continuously improved ecommerce experience for made-to-measure products.'], nl: ['MartijnKozijn.nl | E-commercearchitectuur', 'Een case study over e-commerce voor kozijnen, deuren en producten op maat.'] },
  { path: '/projects/slecto', image: '/projects/slecto-app.png', en: ['Slecto | Guided selling platform', 'A case study about guided selling, forms and email marketing in one platform.'], nl: ['Slecto | Guided selling-platform', 'Een case study over keuzehulpen, formulieren en e-mailmarketing in één platform.'] },
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

  const slug = page.path.startsWith('/projects/') ? page.path.split('/').pop() : null;
  const project = slug ? projectBySlug[slug] : null;
  const image = project ? `/projects/og/${slug}.png` : page.image;

  return {
    path: pathName,
    project,
    isHome: page.path === '/',
    alternatePath,
    language,
    title,
    description,
    image: `${siteUrl}${image || '/jay.png'}`,
    hasOgSize: Boolean(project),
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
  const inLanguage = route.language === 'nl' ? 'nl-NL' : 'en-US';
  const home = route.language === 'nl' ? `${siteUrl}/nl` : `${siteUrl}/`;
  const webPage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: route.title,
    url,
    inLanguage,
    description: route.description,
    isPartOf: { '@id': websiteId },
    primaryImageOfPage: { '@type': 'ImageObject', url: route.image }
  };
  const graph = [webPage];

  if (route.isHome) {
    graph.push(
      {
        '@type': 'Person',
        '@id': personId,
        name: 'Jaymian-Lee Reinartz',
        url: `${siteUrl}/`,
        image: `${siteUrl}/jay.png`,
        jobTitle: 'Full Stack Developer',
        description: route.description,
        address: { '@type': 'PostalAddress', addressRegion: 'Limburg', addressCountry: 'NL' },
        sameAs: [
          'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/',
          'https://github.com/Jaymian-Lee',
          'https://twitch.tv/jaymianlee',
          'https://www.youtube.com/@JaymianLee',
          'https://www.instagram.com/jaymianlee/',
          'https://www.instagram.com/jaymianlee_/'
        ],
        knowsAbout: ['Full-stack development', 'Ecommerce development', 'Technical SEO', 'Marketing automation', 'Product engineering', 'AI systems']
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: 'Jaymian-Lee Reinartz Portfolio',
        inLanguage: ['nl', 'en'],
        publisher: { '@id': personId }
      },
      {
        '@type': 'ItemList',
        name: route.language === 'nl' ? 'Projecten van Jaymian-Lee Reinartz' : 'Projects by Jaymian-Lee Reinartz',
        itemListElement: projectCases.map((project, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: project.name,
          url: `${siteUrl}${route.language === 'nl' ? '/nl' : ''}/projects/${project.slug}`
        }))
      }
    );
  } else {
    graph.push({ '@type': 'WebSite', '@id': websiteId, url: `${siteUrl}/`, name: 'Jaymian-Lee Reinartz Portfolio', inLanguage: ['nl', 'en'] });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jaymian-Lee Reinartz', item: home },
        ...(route.project ? [{ '@type': 'ListItem', position: 2, name: route.language === 'nl' ? 'Projecten' : 'Projects', item: `${home}#projects` }] : []),
        { '@type': 'ListItem', position: route.project ? 3 : 2, name: route.title.split(' | ')[0], item: url }
      ]
    });
  }

  if (route.project) {
    const content = route.project[route.language] || route.project.en;
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${url}#project`,
      name: route.project.name,
      description: content.intro,
      image: route.image,
      url,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      creator: { '@id': personId },
      inLanguage,
      ...(route.project.url ? { sameAs: route.project.url } : {})
    });
  }

  const schema = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });

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
  html = html.replace(/<meta\b(?=[^>]*\bproperty=["']og:image:(?:width|height|type)["'])[^>]*>/gi, '');
  if (route.hasOgSize) {
    html = html.replace('</head>', `    <meta property="og:image:type" content="image/png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n  </head>`);
  }
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

const notFoundHtml = source
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>404 | Page not found</title>')
  .replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi, '<meta name="description" content="This page does not exist or has moved." />')
  .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, '<meta name="robots" content="noindex,follow" />')
  .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, '')
  .replace(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi, '')
  .replace(/<script\b(?=[^>]*\bdata-seo-jsonld=["']true["'])[^>]*>[\s\S]*?<\/script>/gi, '');
fs.writeFileSync(path.join(buildDir, '404.html'), notFoundHtml);
console.log('Wrote 404.html (noindex).');
