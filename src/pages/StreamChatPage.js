import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome';
import PlatformIcon from '../components/PlatformIcon';
import './StreamPages.css';

const DEFAULT_FILTERS = {
  twitch: true,
  tiktok: false,
  youtube: true
};

const platformLabel = {
  twitch: 'Twitch',
  tiktok: 'TikTok',
  youtube: 'YouTube'
};


function UserHoverCard({ message }) {
  const meta = message?.metadata || {};
  return (
    <div className="stream-user-hover-card" role="tooltip">
      <strong>{message.author}</strong>
      {message.username && <p>@{message.username}</p>}
      {meta.channelId && <p>Channel: {meta.channelId}</p>}
      {message.platform === 'twitch' && (
        <>
          <p>Mod: {meta.isMod ? 'Ja' : 'Nee'}</p>
          <p>Sub: {meta.isSubscriber ? 'Ja' : 'Nee'}</p>
          <p>VIP: {meta.isVip ? 'Ja' : 'Nee'}</p>
          {Array.isArray(meta.badges) && meta.badges.length > 0 && (
            <p>Badges: {meta.badges.map((badge) => badge.label).join(', ')}</p>
          )}
        </>
      )}
      {message.platform === 'youtube' && (
        <>
          <p>Owner: {meta.isChatOwner ? 'Ja' : 'Nee'}</p>
          <p>Moderator: {meta.isChatModerator ? 'Ja' : 'Nee'}</p>
          <p>Sponsor: {meta.isChatSponsor ? 'Ja' : 'Nee'}</p>
        </>
      )}
    </div>
  );
}

async function fetchJsonWithFallback(urls) {
  let lastStatus = 0;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      lastStatus = response.status;
      const raw = await response.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
      if (response.ok) return { ok: true, data, status: response.status };
    } catch {}
  }
  return { ok: false, status: lastStatus || 0 };
}

export default function StreamChatPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [messages, setMessages] = useState([]);
  const [lastError, setLastError] = useState('');
  const [config, setConfig] = useState(null);

  const activePlatforms = useMemo(
    () => Object.entries(filters).filter(([, enabled]) => enabled).map(([key]) => key),
    [filters]
  );

  useEffect(() => {
    let stop = false;

    const loadConfig = async () => {
      try {
        const result = await fetchJsonWithFallback(['/api/stream/chat/config', '/api/stream-chat-config']);
        if (result.ok && !stop) setConfig(result.data);
      } catch {
        // noop
      }
    };

    loadConfig();
    const interval = setInterval(loadConfig, 6000);
    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let stop = false;

    const loadMessages = async () => {
      try {
        const params = new URLSearchParams({
          platforms: activePlatforms.join(','),
          limit: '200'
        });
        const query = params.toString();
        const result = await fetchJsonWithFallback([
          `/api/stream/chat/messages?${query}`,
          `/api/stream-chat-messages?${query}`
        ]);

        if (!result.ok) {
          if (result.status === 404) {
            throw new Error('Chat API route ontbreekt op de live server.');
          }
          throw new Error('Kon chatberichten niet laden.');
        }

        if (!stop) {
          setMessages(Array.isArray(result.data.messages) ? result.data.messages : []);
          setLastError('');
        }
      } catch (err) {
        if (!stop) {
          setLastError(err.message || 'Kon chatberichten niet laden.');
        }
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2500);

    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, [activePlatforms]);

  const toggle = (platform) => {
    setFilters((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <SiteChrome>
      <main className="stream-shell">
        <section className="stream-card">
          <p className="stream-kicker">Stream Chat</p>
          <h1>Gecombineerde live chat</h1>
          <p>Zet platformen aan of uit en bekijk alle berichten in 1 feed.</p>

          <div className="stream-status-row">
            <span className={`stream-status-pill ${(config?.platforms?.twitch?.connected) ? 'ok' : 'warn'}`}>
              <span className="platform-symbol"><PlatformIcon platform="twitch" /></span>
              Twitch {config?.platforms?.twitch?.connected ? 'connected' : 'niet verbonden'}
            </span>
            <span className={`stream-status-pill ${(config?.platforms?.tiktok?.connected) ? 'ok' : 'warn'}`}>
              <span className="platform-symbol"><PlatformIcon platform="tiktok" /></span>
              TikTok {config?.platforms?.tiktok?.connected ? 'connected' : 'niet verbonden'}
            </span>
            <span className={`stream-status-pill ${(config?.platforms?.youtube?.connected) ? 'ok' : 'warn'}`}>
              <span className="platform-symbol"><PlatformIcon platform="youtube" /></span>
              YouTube {config?.platforms?.youtube?.connected ? 'connected' : 'niet verbonden'}
            </span>
          </div>

          <div className="stream-filters" role="group" aria-label="Chat filters">
            {Object.keys(DEFAULT_FILTERS).map((platform) => (
              <label key={platform} className="stream-filter">
                <input type="checkbox" checked={filters[platform]} onChange={() => toggle(platform)} />
                <span><span className="platform-symbol"><PlatformIcon platform={platform} /></span> {platformLabel[platform]}</span>
              </label>
            ))}
          </div>

          <div className="stream-chat-feed" role="log" aria-live="polite">
            {messages.length === 0 && <p className="stream-muted">Nog geen berichten voor de geselecteerde platformen.</p>}

            {messages.map((message) => (
              <article key={message.id} className={`stream-message platform-${message.platform}`}>
                <header>
                  <span className="platform-pill"><span className="platform-symbol"><PlatformIcon platform={message.platform} /></span> {platformLabel[message.platform] || message.platform}</span>
                  <div className="stream-author-wrap" style={{ color: message?.metadata?.color || 'inherit' }}>
                    <strong>{message.author}</strong>
                    <UserHoverCard message={message} />
                  </div>
                  <time>{new Date(message.timestamp).toLocaleTimeString('nl-NL')}</time>
                </header>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          {lastError && <p className="stream-error">{lastError}</p>}

          <div className="stream-actions">
            <Link className="stream-link" to="/stream">Terug naar stream dashboard</Link>
            <Link className="stream-link" to="/">Terug naar home</Link>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
