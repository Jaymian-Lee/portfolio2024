import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import FloatingUtilityBar from '../components/FloatingUtilityBar';
import MainFooter from '../components/MainFooter';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import services, { getServiceBySlug } from '../data/services';
import './ServiceLandingPage.css';

const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export default function ServiceLandingPage() {
  const { slug } = useParams();
  const [theme, setTheme] = React.useState('light');
  const [language, setLanguage] = React.useState('en');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');
    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme());
    setLanguage(savedLanguage === 'en' || savedLanguage === 'nl' ? savedLanguage : detectBrowserLanguage());
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('portfolio-language', language);
  }, [language]);

  const service = getServiceBySlug(slug);
  const t = useMemo(() => {
    if (!service) return null;
    return {
      title: service.title[language],
      headline: service.headline[language],
      description: service.description[language],
      summary: service.summary[language]
    };
  }, [language, service]);

  const jsonLd = useMemo(() => {
    if (!service) return null;
    const canonical = `${siteSeo.siteUrl}/services/${service.slug}`;
    const serviceKeywords = service.keywords.join(', ');
    return {
      '@context': 'https://schema.org',
      '@graph': [
        createWebsiteSchema({ language: ['en', 'nl'] }),
        createWebPageSchema({
          name: t.title,
          url: canonical,
          description: t.description,
          language: language === 'nl' ? 'nl-NL' : 'en-US'
        }),
        createBreadcrumbSchema([
          { name: 'Home', item: siteSeo.siteUrl },
          { name: 'Services', item: `${siteSeo.siteUrl}/#services` },
          { name: t.title, item: canonical }
        ]),
        {
          '@type': 'Service',
          name: t.title,
          description: t.description,
          serviceType: serviceKeywords,
          provider: {
            '@type': 'Person',
            name: siteSeo.personName,
            url: siteSeo.personUrl
          },
          areaServed: ['Nederland', 'Limburg', 'Europe'],
          url: canonical
        },
        {
          '@type': 'FAQPage',
          mainEntity: service.faq[language].map((item) => ({
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
  }, [language, service, t]);

  if (!service) {
    return <Navigate to="/" replace />;
  }

  const canonicalPath = `/services/${service.slug}`;
  const relatedServices = services.filter((item) => item.slug !== service.slug).slice(0, 4);

  return (
    <div className="service-page">
      <Seo
        title={`${t.title} | Jaymian-Lee Reinartz`}
        description={t.description}
        canonicalPath={canonicalPath}
        language={language}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt={`${t.title} by Jaymian-Lee Reinartz`}
        jsonLd={jsonLd}
      />

      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={language === 'nl' ? 'Vragen?' : 'Questions?'}
        onAsk={() => window.location.href = '/#contact'}
        askAriaLabel={language === 'nl' ? 'Ga naar contact' : 'Go to contact'}
      />

      <main className="service-shell">
        <section className="service-hero">
          <div className="service-kicker-row">
            <Link to="/" className="service-back">{language === 'nl' ? '← Terug naar home' : '← Back to home'}</Link>
            <Link to="/lab" className="service-back">{language === 'nl' ? 'Open lab' : 'Open lab'}</Link>
          </div>
          <p className="service-kicker">{language === 'nl' ? 'Service pagina' : 'Service page'}</p>
          <h1>{t.headline}</h1>
          <p className="service-lead">{t.description}</p>
          <p className="service-summary">{t.summary}</p>
          <div className="service-tags" aria-label="Service keywords">
            {service.keywords.map((keyword) => (
              <span key={keyword} className="service-tag">{keyword}</span>
            ))}
          </div>
        </section>

        <section className="service-copy-grid">
          <article className="service-panel">
            <h2>{language === 'nl' ? 'Wat je krijgt' : 'What you get'}</h2>
            <ul>
              {language === 'nl' ? [
                'Duidelijke scope en inhoud',
                'Sterke informatie-architectuur',
                'SEO-vriendelijke headings en metadata',
                'Praktische output die echt gebruikt kan worden'
              ] : [
                'Clear scope and content',
                'Strong information architecture',
                'SEO-friendly headings and metadata',
                'Practical output that can actually be used'
              ].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="service-panel">
            <h2>{language === 'nl' ? 'Waarom deze pagina bestaat' : 'Why this page exists'}</h2>
            <p>
              {language === 'nl'
                ? 'Deze service landingspagina is gemaakt om zoekintenties zoals AI automation, SEO, PrestaShop modules en WordPress plugins heel duidelijk af te vangen.'
                : 'This service landing page exists to clearly capture search intent for terms like AI automation, SEO, PrestaShop modules, and WordPress plugins.'}
            </p>
            <p>
              {language === 'nl'
                ? 'De inhoud is kort, specifiek en breed genoeg voor zowel mensen als AI systemen.'
                : 'The content is short, specific, and broad enough for both people and AI systems.'}
            </p>
          </article>
        </section>

        <section className="service-faq" aria-label={language === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked questions'}>
          <p className="service-section-kicker">{language === 'nl' ? 'FAQ' : 'FAQ'}</p>
          <h2>{language === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked questions'}</h2>
          <div className="service-faq-grid">
            {service.faq[language].map((item) => (
              <article key={item.q} className="service-faq-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-related">
          <p className="service-section-kicker">{language === 'nl' ? 'Meer services' : 'More services'}</p>
          <h2>{language === 'nl' ? 'Bekijk ook deze paginas' : 'See also these pages'}</h2>
          <div className="service-related-grid">
            {relatedServices.map((item) => (
              <Link key={item.slug} to={`/services/${item.slug}`} className="service-related-card">
                <span>{item.title[language]}</span>
                <strong>{item.headline[language]}</strong>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <MainFooter language={language} />
    </div>
  );
}
