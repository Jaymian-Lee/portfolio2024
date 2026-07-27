import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import SiteChrome from '../components/SiteChrome';
import { getLocaleFromPathname, localizePath } from '../utils/locale';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const location = useLocation();
  const language = getLocaleFromPathname(location.pathname);
  const isNl = language === 'nl';

  return (
    <SiteChrome>
      <main className="not-found-page ui-page">
      <Seo
        title={isNl ? '404 | Pagina niet gevonden' : '404 | Page not found'}
        description={isNl ? 'Deze pagina bestaat niet of is verplaatst.' : 'This page does not exist or has moved.'}
        canonicalPath={location.pathname}
        language={language}
        noIndex
      />
      <section className="not-found-content" aria-labelledby="not-found-title">
        <p>404</p>
        <h1 id="not-found-title">{isNl ? 'Deze pagina bestaat niet.' : 'This page does not exist.'}</h1>
        <Link to={localizePath('/', language)}>{isNl ? 'Terug naar de homepage' : 'Back to the homepage'}</Link>
      </section>
      </main>
    </SiteChrome>
  );
}
