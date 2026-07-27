import React from 'react';
import AnimatedIcon from './AnimatedIcon';
import './FloatingUtilityBar.css';

function FloatingUtilityBar({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  askLabel,
  onAsk,
  askAriaLabel = 'Open questions',
  wordLee = null,
  className = ''
}) {
  return (
    <div className={`floating-utility-dock ${className}`.trim()} aria-label="Display controls">
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
        <AnimatedIcon name="mail" size={15} />
        <span className="fud-label fud-ask-label">{askLabel}</span>
      </button>

      {wordLee && (
        <a className="fud-card fud-wordlee" href={wordLee.href || '/word-lee'} aria-label={`${wordLee.label}: ${wordLee.hint}`} title={wordLee.label}>
          <span className="wordlee-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <AnimatedIcon name="gamepad" size={19} className="fud-wordlee-gamepad" aria-hidden="true" />
          <span className="fud-label fud-wordlee-label">{wordLee.label}</span>
          <span className="fud-wordlee-hint">{wordLee.hint} <AnimatedIcon name="arrow-right" size={13} /></span>
        </a>
      )}
    </div>
  );
}

export default FloatingUtilityBar;
