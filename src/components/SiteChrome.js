import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FloatingUtilityBar from './FloatingUtilityBar';
import { getLanguageSwitchPath, getLocaleFromPathname, localizePath } from '../utils/locale';

const detectBrowserTheme = () => {
  return 'dark';
};

export default function SiteChrome({ children }) {
  const [theme, setTheme] = useState('dark');
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLocaleFromPathname(location.pathname);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : detectBrowserTheme());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const t = useMemo(() => ({
    home: 'Home',
    stream: 'Stream',
    chat: 'Chat'
  }), []);

  return (
    <>
      <FloatingUtilityBar
        language={language}
        onToggleLanguage={() => navigate(getLanguageSwitchPath(location.pathname, language === 'en' ? 'nl' : 'en', location.search, location.hash))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        askLabel={t.home}
        askAriaLabel={t.home}
        onAsk={() => { window.location.href = localizePath('/', language); }}
      />

      <nav className="stream-top-nav" aria-label="Site navigatie">
        <Link to={localizePath('/', language)}>{t.home}</Link>
        <Link to={localizePath('/stream', language)}>{t.stream}</Link>
        <Link to={localizePath('/stream/chat', language)}>{t.chat}</Link>
      </nav>

      {children}
    </>
  );
}
