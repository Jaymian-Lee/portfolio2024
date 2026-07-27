import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedIcon from './AnimatedIcon';
import './LabBackLink.css';

export default function LabBackLink({ to, children, ariaLabel }) {
  return (
    <Link className="lab-tool-back" to={to} aria-label={ariaLabel || children}>
      <AnimatedIcon name="arrow-left" size={17} />
      <span>{children}</span>
    </Link>
  );
}
