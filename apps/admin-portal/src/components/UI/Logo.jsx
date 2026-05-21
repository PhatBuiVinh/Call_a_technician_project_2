import React from 'react';

export default function Logo({ className = '' }) {
  // Inline SVG brand mark that echoes the original logo but with transparent background.
  // Scales nicely and preserves aspect ratio. Tailwind sizing classes can be passed via `className`.
  return (
    <svg
      className={className}
      viewBox="0 0 600 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Call-a-Technician"
      preserveAspectRatio="xMinYMid meet"
    >
      <title>Call-a-Technician</title>
      <defs>
        <clipPath id="circleClip">
          <circle cx="80" cy="80" r="60" />
        </clipPath>
      </defs>

      {/* Left emblem: circle + rays + lower arc */}
      <g transform="translate(0,0)">
        {/* rays */}
        <g transform="translate(80,80)">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = -75 + i * 13; // spread across top
            const x1 = Math.cos((angle * Math.PI) / 180) * 42;
            const y1 = Math.sin((angle * Math.PI) / 180) * 42;
            const x2 = Math.cos((angle * Math.PI) / 180) * 70;
            const y2 = Math.sin((angle * Math.PI) / 180) * 70;
            const colors = ['#1A58D3', '#52D5FF', '#31EE88'];
            const color = colors[i % colors.length];
            return (
              <rect
                key={i}
                x={x1}
                y={y1 - 6}
                width={Math.max(10, Math.hypot(x2 - x1, y2 - y1))}
                height={12}
                rx={3}
                transform={`rotate(${angle} ${x1} ${y1})`}
                fill={color}
                opacity={0.98}
              />
            );
          })}
        </g>

        {/* inner circle */}
        <circle cx="80" cy="80" r="28" fill="#31EE88" />

        {/* lower white arc */}
        <path d="M20,110 A60,60 0 0,0 140,110 L140,125 A75,75 0 0,1 20,125 Z" fill="#ffffff" />
      </g>

      {/* Brand text: two lines */}
      <g transform="translate(170,36)">
        <text x="0" y="32" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="48" fill="#31EE88">
          CALL-A-
        </text>
        <text x="0" y="96" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="64" fill="#ffffff">
          TECHNICIAN
        </text>
      </g>
    </svg>
  );
}
