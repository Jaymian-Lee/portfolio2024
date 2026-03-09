import React from 'react';
import { Link } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome';
import './StreamPages.css';

export default function StreamDashboardPage() {
  return (
    <SiteChrome>
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
              <li>Twitch: voorbereid</li>
              <li>TikTok: voorbereid</li>
              <li>YouTube: voorbereid</li>
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
