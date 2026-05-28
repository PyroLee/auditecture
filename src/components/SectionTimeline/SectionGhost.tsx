import { Section } from '../../types/project';
import { PaletteEntry } from '../../lib/palette';

interface SectionGhostProps {
  section: Section;
  palette: PaletteEntry;
  width?: number;
}

/** Compact preview rendered inside <DragOverlay> while a section is being dragged. */
export function SectionGhost({ section, palette, width = 160 }: SectionGhostProps) {
  return (
    <div
      className="relative flex flex-col justify-between px-3 py-[9px] rounded-[4px]"
      style={{
        width,
        height: 76,
        background: palette.fill + '4D',
        border: `1.4px solid ${palette.ink}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)',
        transform: 'rotate(-2deg)',
        cursor: 'grabbing',
      }}
    >
      <div
        className="font-hand font-semibold leading-[0.95] whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ color: palette.ink, fontSize: 24, letterSpacing: '-0.5px' }}
      >
        {section.name}
      </div>
      <div
        className="font-sans uppercase font-medium mt-1"
        style={{
          color: palette.ink,
          opacity: 0.78,
          fontSize: 10,
          letterSpacing: '0.13em',
        }}
      >
        {section.bars} bars
      </div>
    </div>
  );
}
