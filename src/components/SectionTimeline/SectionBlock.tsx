import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '../../types/project';
import { PaletteEntry } from '../../lib/palette';
import { useProjectStore } from '../../store/useProjectStore';
import { ConfirmableDelete } from '../common/ConfirmableDelete';

interface SectionBlockProps {
  section: Section;
  palette: PaletteEntry;
  rotation: number;
  filterId: 'ink-bleed' | 'ink-bleed-2';
  useMarkerOverlay?: boolean;
  useEmptyDots?: boolean;
  onRename: (id: string, name: string) => void;
  onRequestDelete: (id: string) => void;
  onPickPreset: (id: string, e: React.MouseEvent) => void;
}

export function SectionBlock({
  section,
  palette,
  rotation,
  filterId,
  useMarkerOverlay,
  useEmptyDots,
  onRename,
  onRequestDelete,
  onPickPreset,
}: SectionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.name);
  const [hovering, setHovering] = useState(false);
  const [resizeTip, setResizeTip] = useState<{ bars: number; x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);

  const beginTransaction = useProjectStore((s) => s.beginTransaction);
  const endTransaction = useProjectStore((s) => s.endTransaction);
  const resizeSection = useProjectStore((s) => s.resizeSection);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commitRename() {
    const next = draft.trim();
    if (next && next !== section.name) onRename(section.id, next);
    else setDraft(section.name);
    setEditing(false);
  }

  // Resize handle: pointer-based, snap to 1-bar increments
  function onResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const el = blockRef.current;
    if (!el) return;
    const startRect = el.getBoundingClientRect();
    const startWidth = startRect.width;
    const startBars = section.bars;
    if (startWidth <= 0 || startBars <= 0) return;
    const pxPerBar = startWidth / startBars;
    const startX = e.clientX;

    beginTransaction();
    let lastBars = startBars;
    setResizeTip({ bars: startBars, x: e.clientX, y: e.clientY });

    function onMove(ev: PointerEvent) {
      const deltaBars = (ev.clientX - startX) / pxPerBar;
      const nextBars = Math.max(1, Math.round(startBars + deltaBars));
      if (nextBars !== lastBars) {
        resizeSection(section.id, nextBars);
        lastBars = nextBars;
      }
      setResizeTip({ bars: nextBars, x: ev.clientX, y: ev.clientY });
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      endTransaction();
      setResizeTip(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 5 : undefined,
  };

  return (
    <div
      ref={(node) => {
        blockRef.current = node;
        setNodeRef(node);
      }}
      className="section relative flex flex-col justify-between min-w-0 cursor-grab select-none px-3 py-[9px]"
      style={{
        ...sortableStyle,
        transform: hovering && !isDragging ? `translateY(-1px) ${sortableStyle.transform ?? ''}` : sortableStyle.transform,
        transition: hovering ? 'transform 120ms' : sortableStyle.transition,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        onPickPreset(section.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(section.name);
        setEditing(true);
      }}
      title="Drag to reorder · Drag right edge to resize · Double-click to rename · Right-click for presets"
      {...attributes}
      {...listeners}
    >
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
          rx={4}
          ry={4}
          fill={palette.fill}
          fillOpacity={0.3}
          stroke={palette.ink}
          strokeWidth={palette.role === 'wine' ? 1.6 : 1.4}
          filter={`url(#${filterId})`}
          vectorEffect="non-scaling-stroke"
        />
        {useMarkerOverlay && (
          <rect
            x={3}
            y={3}
            width={94}
            height={94}
            rx={4}
            ry={4}
            fill={palette.fill}
            fillOpacity={0.08}
            filter="url(#marker-fill)"
          />
        )}
        {useEmptyDots && (
          <rect
            x={3}
            y={3}
            width={94}
            height={94}
            rx={4}
            ry={4}
            fill="url(#empty-dots)"
            opacity={0.4}
            filter="url(#ink-bleed-soft)"
          />
        )}
      </svg>

      <div className="relative z-[2] flex flex-col justify-between h-full min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              else if (e.key === 'Escape') {
                setDraft(section.name);
                setEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="font-hand text-2xl bg-transparent border-b border-dotted outline-none w-full p-0 leading-[0.95]"
            style={{ color: palette.ink }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="font-hand font-semibold leading-[0.95] tracking-[-0.5px] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{
              color: palette.ink,
              fontSize: 24,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {section.name}
          </div>
        )}
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

      {hovering && !editing && !isDragging && (
        <div className="absolute top-1 right-2 z-[4]">
          <ConfirmableDelete
            ariaLabel="Delete section"
            className="text-sm font-bold text-inkSoft hover:text-sectionWineInk leading-none"
            onConfirm={() => onRequestDelete(section.id)}
          />
        </div>
      )}

      <span
        className="resize-handle"
        aria-hidden="true"
        onPointerDown={onResizePointerDown}
        onClick={(e) => e.stopPropagation()}
      />

      {resizeTip && (
        <div
          className="fixed z-[60] pointer-events-none font-hand text-accent bg-paper border border-ruleStrong rounded-md px-2 py-0.5 shadow-md"
          style={{
            left: resizeTip.x + 12,
            top: resizeTip.y - 28,
            fontSize: 18,
            letterSpacing: '-0.3px',
          }}
        >
          {resizeTip.bars} bars
        </div>
      )}
    </div>
  );
}
