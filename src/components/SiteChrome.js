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

const footerQuickLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Case studies', href: '/#case-studies' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Stream', href: '/stream' },
  { label: 'Toepen', href: '/toepen' }
];

const footerProjects = [
  { label: 'Botforger', href: 'https://botforger.com' },
  { label: 'Corthex', href: 'https://corthex.app' },
  { label: 'Vizualy', href: 'https://vizualy.nl' },
  { label: 'Twigsie', href: 'https://twigsie.com' },
  { label: 'Vizualy Prints', href: 'https://vizualyprints.com' },
  { label: 'MartijnKozijn.nl', href: 'https://martijnkozijn.nl' },
  { label: 'Stream Dashboard', href: 'https://jaymian-lee.nl/stream' }
];

const footerConnect = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', href: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', href: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram', href: 'https://www.instagram.com/jaymianlee_/' }
];

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
    chat: 'Chat',
    built: language === 'nl' ? 'Met zorg gebouwd in Limburg' : 'Built with care in Limburg',
    footerQuickLinksTitle: language === 'nl' ? 'Snelle links' : 'Quick links',
    footerProjectsTitle: language === 'nl' ? 'Projecten' : 'Projects',
    footerConnectTitle: 'Connect',
    footerWordleeTitle: 'Word-Lee',
    footerWordleeText: language === 'nl' ? 'Speel de dagelijkse woord challenge voor nieuwsgierige denkers.' : 'Try the daily word challenge built for curious minds.',
    footerWordleeCta: language === 'nl' ? 'Speel Word-Lee' : 'Play Word-Lee'
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
          <div className="footer-grid">
            <section className="footer-brand" aria-label="Brand">
              <p className="footer-kicker">Brand</p>
              <h2>Jaymian-Lee Reinartz</h2>
              <p className="footer-position">Full stack developer voor AI automation en ecommerce groei.</p>
              <p className="footer-description">Bouwt warme, minimal digitale producten met strategie, engineering en meetbaar resultaat.</p>
            </section>

            <nav className="footer-column" aria-label={t.footerQuickLinksTitle}>
              <p className="footer-kicker">{t.footerQuickLinksTitle}</p>
              <ul>
                {footerQuickLinks.map((item) => (
                  <li key={`quick-${item.label}`}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <section className="footer-column" aria-label={t.footerProjectsTitle}>
              <p className="footer-kicker">{t.footerProjectsTitle}</p>
              <ul>
                {footerProjects.map((item) => (
                  <li key={`project-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="footer-column" aria-label={t.footerConnectTitle}>
              <p className="footer-kicker">{t.footerConnectTitle}</p>
              <ul>
                {footerConnect.map((item) => (
                  <li key={`connect-${item.label}`}>
                    <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="footer-wordly" aria-label="Word-Lee">
              <p className="footer-kicker">{t.footerWordleeTitle}</p>
              <h3>Daily challenge</h3>
              <p>{t.footerWordleeText}</p>
              <Link to="/daily-word" className="footer-wordly-cta">{t.footerWordleeCta}</Link>
            </section>
          </div>

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
