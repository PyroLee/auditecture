/**
 * Shared SVG <defs> — filters, hatch patterns, fade masks, dot pattern.
 * Mounted once at app root. Every section/cell SVG references these by id.
 */
export function SketchyDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="ink-bleed" x="-3%" y="-8%" width="106%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.04" numOctaves={2} seed={5} />
          <feDisplacementMap in="SourceGraphic" scale={2.6} />
        </filter>
        <filter id="ink-bleed-2" x="-3%" y="-8%" width="106%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves={2} seed={11} />
          <feDisplacementMap in="SourceGraphic" scale={2.0} />
        </filter>
        <filter id="ink-bleed-soft" x="-3%" y="-8%" width="106%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={1} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={1.2} />
        </filter>

        <filter id="marker-fill" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0.30 0" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>

        <pattern
          id="hatch-grey"
          patternUnits="userSpaceOnUse"
          width={7}
          height={7}
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={7} stroke="#4a4338" strokeWidth={1.4} opacity={0.55} />
        </pattern>
        <pattern
          id="hatch-blue"
          patternUnits="userSpaceOnUse"
          width={7}
          height={7}
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={7} stroke="#2f4754" strokeWidth={1.4} opacity={0.55} />
        </pattern>
        <pattern
          id="hatch-ochre"
          patternUnits="userSpaceOnUse"
          width={7}
          height={7}
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={7} stroke="#6e4d10" strokeWidth={1.4} opacity={0.55} />
        </pattern>
        <pattern
          id="hatch-wine"
          patternUnits="userSpaceOnUse"
          width={7}
          height={7}
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={7} stroke="#5a232a" strokeWidth={1.4} opacity={0.55} />
        </pattern>

        <linearGradient id="fade-in" x1={0} y1={0} x2={1} y2={0}>
          <stop offset="0%" stopColor="white" stopOpacity={0} />
          <stop offset="100%" stopColor="white" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="fade-out" x1={0} y1={0} x2={1} y2={0}>
          <stop offset="0%" stopColor="white" stopOpacity={1} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask id="m-fade-in">
          <rect width="100%" height="100%" fill="url(#fade-in)" />
        </mask>
        <mask id="m-fade-out">
          <rect width="100%" height="100%" fill="url(#fade-out)" />
        </mask>

        <pattern id="empty-dots" patternUnits="userSpaceOnUse" width={8} height={8}>
          <circle cx={1} cy={1} r={0.6} fill="#2a2620" opacity={0.13} />
        </pattern>
      </defs>
    </svg>
  );
}
