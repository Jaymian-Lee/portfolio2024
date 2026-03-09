import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingUtilityBar from './FloatingUtilityBar';

const detectBrowserLanguage = () => {
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('nl') ? 'nl' : 'en';
};

const detectBrowserTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export default function SiteChrome({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLanguage = localStorage.getItem('portfolio-language');
    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme());
    setLanguage(savedLanguage === 'en' || savedLanguage === 'nl' ? savedLanguage : detectBrowserLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = useMemo(() => ({
    home: language === 'nl' ? 'Home' : 'Home',
    stream: language === 'nl' ? 'Stream' : 'Stream',
    chat: language === 'nl' ? 'Chat' : 'Chat',
    built: language === 'nl' ? 'Met zorg gebouwd in Limburg' : 'Built with care in Limburg'
  }), [language]);

  return (
    <>
      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'nl' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={t.home}
        askAriaLabel={t.home}
        onAsk={() => { window.location.href = '/'; }}
      />

      <nav className="stream-top-nav" aria-label="Site navigatie">
        <Link to="/">{t.home}</Link>
        <Link to="/stream">{t.stream}</Link>
        <Link to="/stream/chat">{t.chat}</Link>
      </nav>

      {children}

      <footer className="site-footer stream-site-footer" aria-label="Footer">
        <div className="footer-shell">
          <div className="footer-bottomline" aria-label="Copyright">
            <p>© {new Date().getFullYear()} Jaymian-Lee Reinartz</p>
            <p>jaymian-lee.nl</p>
            <p>{t.built}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
