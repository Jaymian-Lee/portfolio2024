import React from 'react';

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false'
};

export default function PlatformIcon({ platform }) {
  if (platform === 'twitch') {
    return (
      <svg {...iconProps}>
        <path d="M4 3L3 7v12h4v3l3-3h4l7-7V3H4zm15 8l-4 4h-4l-3 3v-3H5V5h14v6z" />
        <path d="M15 7h2v5h-2zm-4 0h2v5h-2z" />
      </svg>
    );
  }

  if (platform === 'tiktok') {
    return (
      <svg {...iconProps}>
        <path d="M14.5 3v8.2a3.3 3.3 0 1 1-2.3-3.1V6.2a5.5 5.5 0 1 0 4.6 5.4V8.7c1.1.8 2.5 1.3 4 1.3V7.7c-1.7 0-3.2-1.1-3.8-2.7H14.5z" />
      </svg>
    );
  }

  if (platform === 'youtube') {
    return (
      <svg {...iconProps}>
        <path d="M23 12s0-3.2-.4-4.7a3 3 0 0 0-2.1-2.1C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a3 3 0 0 0-2.1 2.1C1 8.8 1 12 1 12s0 3.2.4 4.7a3 3 0 0 0 2.1 2.1c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a3 3 0 0 0 2.1-2.1c.4-1.5.4-4.7.4-4.7zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
