import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome';
import PlatformIcon from '../components/PlatformIcon';
import Seo from '../components/Seo';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import { getAlternateLocalePaths, getLocaleFromPathname, localizePath } from '../utils/locale';
import './StreamPages.css';

export default function StreamDashboardPage() {
  const location = useLocation();
  const language = getLocaleFromPathname(location.pathname);
  const isNl = language === 'nl';
  const canonicalPath = localizePath('/stream', language);
  const alternatePaths = getAlternateLocalePaths(canonicalPath);
  const t = useMemo(() => (isNl ? {
    title: 'Stream-dashboard', description: 'Live-hub voor multichat, streamstatus en platformmonitoring.',
    kicker: 'Stream-dashboard', heading: 'Live-streamhub', lead: 'Beheer straks alles rond je stream vanaf één plek.',
    chatTitle: 'Multichat', chatText: 'Combineer Twitch-, TikTok- en YouTube-chat in één overzicht en kies per platform wat je ziet.',
    openChat: 'Open chatdashboard', status: 'Status', ready: 'voorbereid', back: 'Terug naar home'
  } : {
    title: 'Stream Dashboard', description: 'Live hub for multi-chat, stream status, and platform monitoring.',
    kicker: 'Stream Dashboard', heading: 'Live stream hub', lead: 'Manage everything around your stream from one place.',
    chatTitle: 'Multi-chat', chatText: 'Combine Twitch, TikTok, and YouTube chat in one view and choose what each platform shows.',
    openChat: 'Open chat dashboard', status: 'Status', ready: 'ready', back: 'Back to home'
  }), [isNl]);
  const pageJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      createWebsiteSchema({ language: ['en', 'nl'] }),
      createWebPageSchema({
        name: t.title,
        url: `${siteSeo.siteUrl}${canonicalPath}`,
        description: t.description,
        language: isNl ? 'nl-NL' : 'en-US'
      }),
      createBreadcrumbSchema([
        { name: 'Home', item: `${siteSeo.siteUrl}${localizePath('/', language)}` },
        { name: t.title, item: `${siteSeo.siteUrl}${canonicalPath}` }
      ])
    ]
  }), [canonicalPath, isNl, language, t]);

  return (
    <SiteChrome>
      <Seo
        title={`${t.title} | Jaymian-Lee Reinartz`}
        description={t.description}
        canonicalPath={canonicalPath}
        language={language}
        alternatePaths={alternatePaths}
        defaultLocalePath={alternatePaths.en}
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt="Stream Dashboard overview for Jaymian-Lee Reinartz"
        jsonLd={pageJsonLd}
      />

    <main className="stream-shell ui-page">
      <section className="stream-card ui-panel">
        <p className="stream-kicker">{t.kicker}</p>
        <h1>{t.heading}</h1>
        <p>{t.lead}</p>

        <div className="stream-grid">
          <article className="stream-panel">
            <h2>{t.chatTitle}</h2>
            <p>{t.chatText}</p>
            <Link className="stream-btn" to={localizePath('/stream/chat', language)}>
              {t.openChat}
            </Link>
          </article>

          <article className="stream-panel">
            <h2>{t.status}</h2>
            <ul>
              <li><span className="platform-symbol"><PlatformIcon platform="twitch" /></span> Twitch: {t.ready}</li>
              <li><span className="platform-symbol"><PlatformIcon platform="tiktok" /></span> TikTok: {t.ready}</li>
              <li><span className="platform-symbol"><PlatformIcon platform="youtube" /></span> YouTube: {t.ready}</li>
            </ul>
          </article>
        </div>

        <div className="stream-actions">
          <Link className="stream-link" to={localizePath('/', language)}>
            {t.back}
          </Link>
        </div>
      </section>
    </main>
    </SiteChrome>
  );
}
