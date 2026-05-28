import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '../../types/project';
import { ConfirmableDelete } from '../common/ConfirmableDelete';

interface TrackHeaderProps {
  track: Track;
  rotation: number;
  onRename: (id: string, name: string) => void;
  onRequestDelete: (id: string) => void;
}

export function TrackHeader({ track, rotation, onRename, onRequestDelete }: TrackHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(track.name);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    const next = draft.trim();
    if (next && next !== track.name) onRename(track.id, next);
    else setDraft(track.name);
    setEditing(false);
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    height: 58,
    fontSize: 26,
    letterSpacing: '-0.3px',
  };

  return (
    <div
      ref={setNodeRef}
      className="track-label relative flex items-center gap-2.5 px-1 font-hand select-none"
      style={{
        ...style,
        transform: isDragging
          ? style.transform
          : `rotate(${rotation}deg) ${style.transform ?? ''}`,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onDoubleClick={() => {
        setDraft(track.name);
        setEditing(true);
      }}
      title="Drag grip to reorder · Double-click to rename"
    >
      <span
        className="inline-flex text-inkFaint cursor-grab flex-shrink-0"
        aria-hidden="true"
        {...attributes}
        {...listeners}
      >
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
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') {
              setDraft(track.name);
              setEditing(false);
            }
          }}
          className="font-hand bg-transparent border-b border-dotted border-inkMute outline-none w-full"
          style={{ fontSize: 26, letterSpacing: '-0.3px', padding: 0 }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="track-name whitespace-nowrap overflow-hidden font-medium">{track.name}</span>
      )}
      {hovering && !editing && (
        <div className="absolute right-1 top-1">
          <ConfirmableDelete
            ariaLabel="Delete track"
            className="text-sm font-bold text-inkMute hover:text-sectionWineInk leading-none"
            onConfirm={() => onRequestDelete(track.id)}
          />
        </div>
      )}
    </div>
  );
}
