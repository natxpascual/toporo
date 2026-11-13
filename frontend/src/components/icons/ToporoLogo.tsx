import React from 'react';

interface ToporoLogoProps {
  className?: string;
}

/**
 * Toporo Brand Mark — simplified 1-to-3 topology gateway inspired by Azure Application Gateway,
 * rendered in Toporo's deep forest (#0b1d0b), crisp white (#ffffff), and mint (#a7e68f) palette.
 */
export const ToporoLogo: React.FC<ToporoLogoProps> = ({ className = 'w-8 h-8' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#0b1d0b" />
    <rect
      x="2.5"
      y="2.5"
      width="27"
      height="27"
      rx="5.5"
      stroke="#a7e68f"
      strokeOpacity="0.28"
    />
    {/* Topology distribution paths from gateway root to 3 downstream nodes */}
    <path
      d="M16 11V16.5M16 16.5L9 21.5M16 16.5V21.5M16 16.5L23 21.5"
      stroke="#ffffff"
      strokeOpacity="0.9"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Gateway root node */}
    <circle cx="16" cy="9.25" r="2.5" fill="#ffffff" />
    {/* Downstream topology nodes */}
    <circle cx="9" cy="23" r="2.25" fill="#a7e68f" />
    <circle cx="16" cy="23" r="2.25" fill="#a7e68f" />
    <circle cx="23" cy="23" r="2.25" fill="#a7e68f" />
  </svg>
);

