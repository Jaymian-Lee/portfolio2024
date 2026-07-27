import React, { useState } from 'react';
import { motion } from 'motion/react';

// Motion behavior follows the hover-driven approach used by lucide-animated.
// https://lucide-animated.com/
const iconShapes = {
  'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  'arrow-left': <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  'arrow-down': <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  mail: <><rect width="18" height="14" x="3" y="5" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  gamepad: <><path d="M6 12h4" /><path d="M8 10v4" /><path d="M15 13h.01" /><path d="M18 11h.01" /><path d="M6.4 5h11.2a3.4 3.4 0 0 1 3.32 4.12l-1.13 5.08A2.4 2.4 0 0 1 17.45 16H6.55a2.4 2.4 0 0 1-2.34-1.8L3.08 9.12A3.4 3.4 0 0 1 6.4 5Z" /></>,
  'graduation-cap': <><path d="m22 10-10-5L2 10l10 5 10-5Z" /><path d="M6 12v5c3 1.5 9 1.5 12 0v-5" /><path d="M22 10v6" /></>,
  archive: <><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></>,
  'flask-conical': <><path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a5 5 0 1 1-4 0" /><path d="M5.5 16h13" /></>,
  trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4V2h10v2" /><path d="M17 4H7v6a5 5 0 0 0 10 0V4Z" /><path d="M5 6H3v1a4 4 0 0 0 4 4" /><path d="M19 6h2v1a4 4 0 0 1-4 4" /></>,
  sparkles: <><path d="m12 3-1.9 5.8L4.3 10.7l5.8 1.9L12 18.4l1.9-5.8 5.8-1.9-5.8-1.9L12 3Z" /><path d="m19 3 .7 2.3L22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.7L19 3Z" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  calculator: <><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M8 6h8" /><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></>,
  radio: <><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2a6 6 0 0 1 0-8.4" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8a6 6 0 0 1 0 8.4" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  moon: <path d="M12 3a6.8 6.8 0 1 0 9 9 9 9 0 1 1-9-9Z" />
};

export default function AnimatedIcon({ name, size = 20, className = '', title, ...props }) {
  const [isActive, setIsActive] = useState(false);
  const shape = iconShapes[name] || iconShapes['arrow-right'];

  return (
    <motion.svg
      className={`animated-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      {...props}
    >
      {title && <title>{title}</title>}
      <motion.g
        animate={isActive ? { x: name.includes('right') ? [0, 2, 0] : name.includes('left') ? [0, -2, 0] : 0, y: name === 'arrow-down' ? [0, 2, 0] : name === 'graduation-cap' ? [0, -1, 0] : name === 'archive' ? [0, 1, 0] : name === 'flask-conical' ? [0, -1, 0] : name === 'trophy' ? [0, -1, 0] : name === 'calculator' ? [0, -1, 0] : 0, rotate: name === 'gamepad' ? [0, -5, 5, 0] : name === 'graduation-cap' ? [0, -3, 3, 0] : name === 'flask-conical' ? [0, -4, 4, 0] : name === 'trophy' ? [0, -3, 3, 0] : name === 'pencil' ? [0, -6, 0] : name === 'radio' ? [0, -4, 4, 0] : 0, scale: ['plus', 'x', 'mail', 'sun', 'moon', 'archive', 'sparkles', 'calculator'].includes(name) ? [1, 0.88, 1] : 1 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: 'easeInOut' }}
      >
        {shape}
      </motion.g>
    </motion.svg>
  );
}
