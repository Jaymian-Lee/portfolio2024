import { useEffect } from 'react';

const SITE_URL = 'https://jaymian-lee.nl';
const SITE_NAME = 'Jaymian-Lee Reinartz Portfolio';
const DEFAULT_IMAGE = `${SITE_URL}/jay.png`;

const upsertMeta = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      tag.setAttribute(key, value);
    }
  });

  return tag;
};

const upsertLink = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('link');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      tag.setAttribute(key, value);
    }
  });

  return tag;
};

const removeStaleScripts = (selector, keepId) => {
  document.head.querySelectorAll(selector).forEach((node) => {
    if (keepId && node.getAttribute('data-seo-id') === keepId) return;
    node.remove();
  });
};

export default function Seo({
  title,
  description,
  canonicalPath = '/',
  image = DEFAULT_IMAGE,
  imageAlt = SITE_NAME,
  language = 'en',
  type = 'website',
  noIndex = false,
  keywords = '',
  jsonLd = null,
  author = 'Jaymian-Lee Reinartz'
}) {
  useEffect(() => {
    const canonicalUrl = canonicalPath.startsWith('http')
      ? canonicalPath
      : `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    const robotsContent = noIndex
      ? 'noindex,nofollow'
      : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

    document.title = title;
    document.documentElement.setAttribute('lang', language);

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robotsContent });
    upsertMeta('meta[name="author"]', { name: 'author', content: author });

    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
    }

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: language === 'nl' ? 'nl_NL' : 'en_US' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });

    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    if (jsonLd) {
      let script = document.head.querySelector('script[data-seo-jsonld="true"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        document.head.appendChild(script);
      }
      script.setAttribute('data-seo-id', title);
      script.textContent = JSON.stringify(jsonLd);
      removeStaleScripts('script[data-seo-jsonld="true"]', title);
    }
  }, [author, canonicalPath, description, image, imageAlt, jsonLd, language, keywords, noIndex, title, type]);

  return null;
}

