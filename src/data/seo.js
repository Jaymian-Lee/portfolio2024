const SITE_URL = 'https://jaymian-lee.nl';
const SITE_NAME = 'Jaymian-Lee Reinartz Portfolio';
const PERSON_NAME = 'Jaymian-Lee Reinartz';
const PERSON_URL = `${SITE_URL}/`;
const PERSON_IMAGE = `${SITE_URL}/jay.png`;

const socialLinks = [
  'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/',
  'https://github.com/Jaymian-Lee',
  'https://twitch.tv/jaymianlee',
  'https://www.youtube.com/@JaymianLee',
  'https://www.instagram.com/jaymianlee_/'
];

export const siteSeo = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  personName: PERSON_NAME,
  personUrl: PERSON_URL,
  personImage: PERSON_IMAGE,
  socialLinks
};

export const createPersonSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: PERSON_NAME,
  url: PERSON_URL,
  image: PERSON_IMAGE,
  jobTitle: 'Full Stack Developer',
  description: 'Full stack developer focused on AI automation, ecommerce development, chatbot automation, and product engineering.',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Limburg',
    addressCountry: 'NL'
  },
  sameAs: socialLinks
});

export const createWebsiteSchema = ({ language = ['en', 'nl'] } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: language
});

export const createBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.item
  }))
});

export const createWebPageSchema = ({ name, url, description, language = 'en-US', image = PERSON_IMAGE, isPartOf = `${SITE_URL}/#website` }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  url,
  description,
  inLanguage: language,
  image,
  isPartOf
});

