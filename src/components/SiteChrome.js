import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingUtilityBar from './FloatingUtilityBar';
import MainFooter from './MainFooter';

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
    home: 'Home',
    stream: 'Stream',
    chat: 'Chat'
  }), []);

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

      <MainFooter language={language} />
    </>
  );
}
