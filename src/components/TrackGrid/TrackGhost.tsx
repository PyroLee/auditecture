import { Track } from '../../types/project';

interface TrackGhostProps {
  track: Track;
}

/** Compact preview rendered inside <DragOverlay> while a track is being dragged. */
export function TrackGhost({ track }: TrackGhostProps) {
  return (
    <div
      className="flex items-center gap-2.5 px-2 py-1 font-hand bg-paper border border-ruleStrong rounded-md"
      style={{
        fontSize: 26,
        letterSpacing: '-0.3px',
        height: 44,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)',
        transform: 'rotate(-1.5deg)',
        cursor: 'grabbing',
      }}
    >
      <span className="inline-flex text-inkFaint" aria-hidden="true">
        <svg width={12} height={20} viewBox="0 0 12 20">
          <g fill="currentColor">
            <circle cx={3} cy={4} r={1.4} />
            <circle cx={9} cy={4} r={1.4} />
            <circle cx={3} cy={10} r={1.4} />
            <circle cx={9} cy={10} r={1.4} />
            <circle cx={3} cy={16} r={1.4} />
            <circle cx={9} cy={16} r={1.4} />
          </g>
        </svg>
      </span>
      <span className="font-medium whitespace-nowrap">{track.name}</span>
    </div>
  );
}
