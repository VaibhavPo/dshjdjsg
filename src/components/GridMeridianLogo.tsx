export function GridMeridianLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Grid Meridian Logo"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Outer Sphere */}
      <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      {/* Longitude / Meridian Ellipses */}
      <ellipse cx="18" cy="18" rx="8.5" ry="16" stroke="currentColor" strokeWidth="1.75" />
      <line x1="18" y1="2" x2="18" y2="34" stroke="currentColor" strokeWidth="1.75" />
      {/* Equator & Parallels */}
      <line x1="2" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="1.75" />
      <ellipse cx="18" cy="18" rx="15" ry="7" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 2" opacity="0.55" />
      {/* Dynamic Grid Nodes */}
      <circle cx="18" cy="18" r="2.2" fill="#38bdf8" />
      <circle cx="9.5" cy="18" r="1.6" fill="#38bdf8" />
      <circle cx="26.5" cy="18" r="1.6" fill="#38bdf8" />
      <circle cx="18" cy="9.5" r="1.6" fill="#38bdf8" />
      <circle cx="18" cy="26.5" r="1.6" fill="#38bdf8" />
      <circle cx="18" cy="2" r="1.8" fill="#B45309" />
      <circle cx="18" cy="34" r="1.8" fill="#B45309" />
    </svg>
  );
}
