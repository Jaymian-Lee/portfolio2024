export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'nl'];

export const getLocaleFromPathname = (pathname = '/') => (
  pathname === '/nl' || pathname.startsWith('/nl/') ? 'nl' : DEFAULT_LOCALE
);

export const stripLocalePrefix = (pathname = '/') => {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutLocale = path.replace(/^\/nl(?=\/|$)/, '');
  return withoutLocale || '/';
};

export const localizePath = (pathname = '/', locale = DEFAULT_LOCALE) => {
  const basePath = stripLocalePrefix(pathname);
  if (locale !== 'nl') return basePath;
  return basePath === '/' ? '/nl' : `/nl${basePath}`;
};

export const getAlternateLocalePaths = (pathname = '/') => {
  const basePath = stripLocalePrefix(pathname);
  return {
    en: localizePath(basePath, 'en'),
    nl: localizePath(basePath, 'nl')
  };
};

export const getLanguageSwitchPath = (pathname, targetLocale, search = '', hash = '') => (
  `${localizePath(pathname, targetLocale)}${search}${hash}`
);
