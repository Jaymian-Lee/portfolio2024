import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLocaleFromPathname, localizePath } from '../utils/locale';
import './SubpageBrand.css';

export default function SubpageBrand() {
  const location = useLocation();
  const language = getLocaleFromPathname(location.pathname);
  const isHome = location.pathname === '/' || location.pathname === '/nl';

  useEffect(() => {
    document.documentElement.classList.toggle('has-subpage-brand', !isHome);
    return () => document.documentElement.classList.remove('has-subpage-brand');
  }, [isHome]);

  if (isHome) return null;

  return (
    <Link className="subpage-brand" to={localizePath('/', language)} aria-label="Jaymian-Lee Reinartz home">
      <img src="/favicon.svg" alt="" width="28" height="28" />
      <span>Jaymian-Lee</span>
    </Link>
  );
}
