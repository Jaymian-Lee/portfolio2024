import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './StreamPages.css';

const DEFAULT_FILTERS = {
  twitch: true,
  tiktok: true,
  youtube: true
};

const platformLabel = {
  twitch: 'Twitch',
  tiktok: 'TikTok',
  youtube: 'YouTube'
};

export default function StreamChatPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [messages, setMessages] = useState([]);
  const [lastError, setLastError] = useState('');

  const activePlatforms = useMemo(
    () => Object.entries(filters).filter(([, enabled]) => enabled).map(([key]) => key),
    [filters]
  );

  useEffect(() => {
    let stop = false;

    const loadMessages = async () => {
      try {
        const params = new URLSearchParams({
          platforms: activePlatforms.join(','),
          limit: '120'
        });
        const response = await fetch(`/api/stream/chat/messages?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Kon chatberichten niet laden.');
        }

        if (!stop) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setLastError('');
        }
      } catch (err) {
        if (!stop) {
          setLastError(err.message || 'Kon chatberichten niet laden.');
        }
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);

    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, [activePlatforms]);

  const toggle = (platform) => {
    setFilters((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <main className="stream-shell">
      <section className="stream-card">
        <p className="stream-kicker">Stream Chat</p>
        <h1>Gecombineerde live chat</h1>
        <p>
          Zet platformen aan of uit en bekijk alle berichten in 1 feed.
        </p>

        <div className="stream-filters" role="group" aria-label="Chat filters">
          {Object.keys(DEFAULT_FILTERS).map((platform) => (
            <label key={platform} className="stream-filter">
              <input
                type="checkbox"
                checked={filters[platform]}
                onChange={() => toggle(platform)}
              />
              <span>{platformLabel[platform]}</span>
            </label>
          ))}
        </div>

        <div className="stream-chat-feed" role="log" aria-live="polite">
          {messages.length === 0 && (
            <p className="stream-muted">Nog geen berichten voor de geselecteerde platformen.</p>
          )}

          {messages.map((message) => (
            <article key={message.id} className={`stream-message platform-${message.platform}`}>
              <header>
                <span className="platform-pill">{platformLabel[message.platform] || message.platform}</span>
                <strong>{message.author}</strong>
                <time>{new Date(message.timestamp).toLocaleTimeString('nl-NL')}</time>
              </header>
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        {lastError && <p className="stream-error">{lastError}</p>}

        <div className="stream-actions">
          <Link className="stream-link" to="/stream">
            Terug naar stream dashboard
          </Link>
          <Link className="stream-link" to="/">
            Terug naar home
          </Link>
        </div>
      </section>
    </main>
  );
}
