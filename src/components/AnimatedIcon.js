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
        animate={isActive ? { x: name.includes('right') ? [0, 2, 0] : name.includes('left') ? [0, -2, 0] : 0, y: name === 'arrow-down' ? [0, 2, 0] : 0, rotate: name === 'gamepad' ? [0, -5, 5, 0] : 0, scale: ['plus', 'x', 'mail', 'sun', 'moon'].includes(name) ? [1, 0.88, 1] : 1 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: 'easeInOut' }}
      >
        {shape}
      </motion.g>
    </motion.svg>
  );
}
