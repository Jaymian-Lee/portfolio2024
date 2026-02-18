import React from 'react';
import './FloatingUtilityBar.css';

function FloatingUtilityBar({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  askLabel,
  onAsk,
  askAriaLabel = 'Open questions'
}) {
  return (
    <div className="floating-utility-dock" aria-label="Display controls">
      <button
        type="button"
        className="fud-card fud-control"
        onClick={onToggleLanguage}
        aria-label="Toggle language"
        title={language === 'en' ? 'Switch to Dutch' : 'Switch to English'}
      >
        <span className="fud-label">Language</span>
        <span className={`fud-language-toggle ${language}`} aria-hidden="true">
          <span className="fud-lang-knob" />
          <span className="fud-lang-option en">EN</span>
          <span className="fud-lang-option nl">NL</span>
        </span>
      </button>

      <button
        type="button"
        className="fud-card fud-control"
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className="fud-label">Theme</span>
        <span className={`fud-theme-toggle ${theme}`}>
          <span className="fud-theme-track" aria-hidden="true">
            <span className="fud-sun" />
            <span className="fud-moon" />
          </span>
        </span>
      </button>

      <button
        type="button"
        className="fud-card fud-control fud-ask"
        onClick={onAsk}
        aria-label={askAriaLabel}
        title={askAriaLabel}
      >
        <span className="fud-dot" aria-hidden="true" />
        <span className="fud-label fud-ask-label">{askLabel}</span>
      </button>
    </div>
  );
}

export default FloatingUtilityBar;
