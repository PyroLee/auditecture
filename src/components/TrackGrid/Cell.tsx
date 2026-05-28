import { CellState } from '../../types/project';
import { PaletteEntry } from '../../lib/palette';

interface CellProps {
  state: CellState;
  palette: PaletteEntry;
  seedShift: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  title?: string;
}

export function Cell({ state, palette, seedShift, onClick, onContextMenu, title }: CellProps) {
  return (
    <div
      className="cell relative min-w-0 rounded-[3px] overflow-hidden cursor-pointer hover:outline hover:outline-[1.5px] hover:outline-dashed hover:outline-inkMute"
      style={{ outlineOffset: -2 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={title}
    >
      {state === 'empty' && <EmptyCell />}
      {state === 'active' && <ActiveCell palette={palette} seedShift={seedShift} />}
      {state === 'fade-in' && <FadeInCell palette={palette} />}
      {state === 'fade-out' && <FadeOutCell palette={palette} />}
    </div>
  );
}

function EmptyCell() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x={2.5}
        y={2.5}
        width={95}
        height={95}
        rx={3}
        ry={3}
        fill="url(#empty-dots)"
        stroke="rgba(42,38,32,0.18)"
        strokeWidth={0.8}
        strokeDasharray="3 3"
        filter="url(#ink-bleed-soft)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ActiveCell({ palette, seedShift }: { palette: PaletteEntry; seedShift: number }) {
  const filterId = seedShift % 2 === 0 ? 'ink-bleed' : 'ink-bleed-2';
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={3}
        ry={3}
        fill={palette.fill}
        fillOpacity={0.52}
        stroke={palette.ink}
        strokeWidth={1.4}
        filter={`url(#${filterId})`}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={3}
        ry={3}
        fill={palette.fill}
        fillOpacity={0.14}
        filter="url(#marker-fill)"
      />
    </svg>
  );
}

function FadeInCell({ palette }: { palette: PaletteEntry }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g mask="url(#m-fade-in)">
        <rect
          x={3}
          y={3}
          width={94}
          height={94}
          rx={3}
          ry={3}
          fill={palette.fill}
          fillOpacity={0.52}
          stroke={palette.ink}
          strokeWidth={1.4}
          filter="url(#ink-bleed)"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={3}
        ry={3}
        fill={`url(#${palette.hatchId})`}
        stroke={palette.ink}
        strokeWidth={1}
        strokeDasharray="3 3"
        strokeOpacity={0.6}
        filter="url(#ink-bleed-soft)"
        vectorEffect="non-scaling-stroke"
      />
      <g transform="translate(72 50)" filter="url(#ink-bleed-soft)">
        <path
          d="M0 0 L14 0 M9 -4 L14 0 L9 4"
          stroke={palette.ink}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

function FadeOutCell({ palette }: { palette: PaletteEntry }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g mask="url(#m-fade-out)">
        <rect
          x={3}
          y={3}
          width={94}
          height={94}
          rx={3}
          ry={3}
          fill={palette.fill}
          fillOpacity={0.52}
          stroke={palette.ink}
          strokeWidth={1.4}
          filter="url(#ink-bleed)"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={3}
        ry={3}
        fill={`url(#${palette.hatchId})`}
        stroke={palette.ink}
        strokeWidth={1}
        strokeDasharray="3 3"
        strokeOpacity={0.45}
        filter="url(#ink-bleed-soft)"
        vectorEffect="non-scaling-stroke"
      />
      <g transform="translate(14 50)" filter="url(#ink-bleed-soft)">
        <path
          d="M0 0 L14 0 M9 -4 L14 0 L9 4"
          stroke={palette.ink}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.55}
        />
      </g>
    </svg>
  );
}
