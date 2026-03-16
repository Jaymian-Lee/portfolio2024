import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const footerQuickLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Case studies', href: '/#case-studies' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Stream', href: '/stream' },
  { label: 'Toepen', href: '/toepen' },
  { label: 'S&P 500 Calculator', href: '/sp500-calculator' }
];

const footerProjects = [
  { label: 'Botforger', href: 'https://botforger.com' },
  { label: 'Corthex', href: 'https://corthex.app' },
  { label: 'Vizualy', href: 'https://vizualy.nl' },
  { label: 'Twigsie', href: 'https://twigsie.com' },
  { label: 'Vizualy Prints', href: 'https://vizualyprints.com' },
  { label: 'Refacthor', href: 'https://refacthor.nl' },
  { label: 'MartijnKozijn.nl', href: 'https://martijnkozijn.nl' },
  { label: 'Stream Dashboard', href: 'https://jaymian-lee.nl/stream' },
  { label: 'Toepen', href: 'https://jaymian-lee.nl/toepen' },
  { label: 'S&P 500 Calculator', href: 'https://jaymian-lee.nl/sp500-calculator' }
];

const footerConnect = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/' },
  { label: 'GitHub', href: 'https://github.com/Jaymian-Lee' },
  { label: 'Twitch', href: 'https://twitch.tv/jaymianlee' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JaymianLee' },
  { label: 'Instagram', href: 'https://www.instagram.com/jaymianlee_/' }
];

const copy = {
  en: {
    footerBrandPosition: 'Full stack developer for AI automation and ecommerce growth.',
    footerBrandText: 'Building warm, minimal digital products with strategy, engineering, and measurable outcomes.',
    footerQuickLinksTitle: 'Quick links',
    footerProjectsTitle: 'Projects',
    footerConnectTitle: 'Connect',
    footerWordleeTitle: 'Word-Lee',
    footerWordleeText: 'Try the daily word challenge built for curious minds.',
    footerWordleeCta: 'Play Word-Lee',
    footerDomain: 'jaymian-lee.nl',
    footerBuilt: 'Built with care in Limburg',
    twitchLiveLabel: 'Twitch live now',
    twitchOfflineLabel: 'Twitch currently offline'
  },
  nl: {
    footerBrandPosition: 'Full stack developer voor AI automation en ecommerce groei.',
    footerBrandText: 'Bouwt warme, minimal digitale producten met strategie, engineering en meetbaar resultaat.',
    footerQuickLinksTitle: 'Snelle links',
    footerProjectsTitle: 'Projecten',
    footerConnectTitle: 'Connect',
    footerWordleeTitle: 'Word-Lee',
    footerWordleeText: 'Speel de dagelijkse woord challenge voor nieuwsgierige denkers.',
    footerWordleeCta: 'Speel Word-Lee',
    footerDomain: 'jaymian-lee.nl',
    footerBuilt: 'Met zorg gebouwd in Limburg',
    twitchLiveLabel: 'Twitch nu live',
    twitchOfflineLabel: 'Twitch nu offline'
  }
};

export default function MainFooter({ language = 'en', twitchLive = null }) {
  const t = copy[language] || copy.en;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <section className="footer-brand" aria-label="Brand">
            <p className="footer-kicker">Brand</p>
            <h2>Jaymian-Lee Reinartz</h2>
            <p className="footer-position">{t.footerBrandPosition}</p>
            <p className="footer-description">{t.footerBrandText}</p>
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
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="footer-column" aria-label={t.footerConnectTitle}>
            <p className="footer-kicker">{t.footerConnectTitle}</p>
            <ul>
              {footerConnect.map((item) => (
                <li key={`connect-${item.label}`}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="footer-wordly" aria-label="Word-Lee">
            <p className="footer-kicker">{t.footerWordleeTitle}</p>
            <h3>Daily challenge</h3>
            <p>{t.footerWordleeText}</p>
            <Link to="/daily-word" className="footer-wordly-cta">
              {t.footerWordleeCta}
            </Link>
          </section>
        </div>

        <div className="footer-bottomline" aria-label="Copyright">
          <p>© {currentYear} Jaymian-Lee Reinartz</p>
          <p>{t.footerDomain}</p>
          <p>{t.footerBuilt}</p>
          {typeof twitchLive === 'boolean' && (
            <a
              href="https://twitch.tv/jaymianlee"
              target="_blank"
              rel="noreferrer"
              className={`twitch-live-indicator ${twitchLive ? 'is-live' : 'is-offline'}`}
            >
              <span className="dot" />
              {twitchLive ? t.twitchLiveLabel : t.twitchOfflineLabel}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
