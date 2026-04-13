import React from 'react';
import { Link } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome';
import PlatformIcon from '../components/PlatformIcon';
import Seo from '../components/Seo';
import { createBreadcrumbSchema, createWebPageSchema, createWebsiteSchema, siteSeo } from '../data/seo';
import './StreamPages.css';

export default function StreamDashboardPage() {
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      createWebsiteSchema({ language: ['en', 'nl'] }),
      createWebPageSchema({
        name: 'Stream Dashboard',
        url: `${siteSeo.siteUrl}/stream`,
        description: 'A live stream hub for monitoring chat, stream status, and multi-platform workflows.',
        language: 'en-US'
      }),
      createBreadcrumbSchema([
        { name: 'Home', item: siteSeo.siteUrl },
        { name: 'Stream Dashboard', item: `${siteSeo.siteUrl}/stream` }
      ])
    ]
  };

  return (
    <SiteChrome>
      <Seo
        title="Stream Dashboard | Jaymian-Lee Reinartz"
        description="Live stream hub for multi-chat, stream status, and platform monitoring."
        canonicalPath="/stream"
        language="en"
        image={`${siteSeo.siteUrl}/jay.png`}
        imageAlt="Stream Dashboard overview for Jaymian-Lee Reinartz"
        jsonLd={pageJsonLd}
      />

    <main className="stream-shell">
      <section className="stream-card">
        <p className="stream-kicker">Stream Dashboard</p>
        <h1>Live stream hub</h1>
        <p>
          Hier kun je straks alles rondom je stream beheren vanaf 1 plek.
        </p>

        <div className="stream-grid">
          <article className="stream-panel">
            <h2>Multi-chat</h2>
            <p>
              Combineer Twitch, TikTok en YouTube chat in 1 overzicht en zet per platform aan of uit wat je wilt zien.
            </p>
            <Link className="stream-btn" to="/stream/chat">
              Open chat dashboard
            </Link>
          </article>

          <article className="stream-panel">
            <h2>Status</h2>
            <ul>
              <li><span className="platform-symbol"><PlatformIcon platform="twitch" /></span> Twitch: voorbereid</li>
              <li><span className="platform-symbol"><PlatformIcon platform="tiktok" /></span> TikTok: voorbereid</li>
              <li><span className="platform-symbol"><PlatformIcon platform="youtube" /></span> YouTube: voorbereid</li>
            </ul>
          </article>
        </div>

        <div className="stream-actions">
          <Link className="stream-link" to="/">
            Terug naar home
          </Link>
        </div>
      </section>
    </main>
    </SiteChrome>
  );
}
