import { useEffect, useRef } from 'react';
import { CellState } from '../../types/project';

const STATE_LABELS: Array<[CellState, string]> = [
  ['empty', 'Empty'],
  ['active', 'Active'],
  ['fade-in', 'Fade in'],
  ['fade-out', 'Fade out'],
];

interface CellContextMenuProps {
  x: number;
  y: number;
  current: CellState;
  onPick: (state: CellState) => void;
  onClose: () => void;
}

export function CellContextMenu({ x, y, current, onPick, onClose }: CellContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('mousedown', handle);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handle);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-paper border border-ruleStrong rounded shadow-lg py-1 min-w-[120px]"
      style={{ left: x, top: y }}
    >
      {STATE_LABELS.map(([state, label]) => (
        <button
          key={state}
          className={
            'block w-full text-left px-3 py-1.5 font-sans text-xs hover:bg-paperDeep ' +
            (state === current ? 'font-semibold text-accent' : 'text-inkSoft')
          }
          onClick={() => {
            onPick(state);
            onClose();
          }}
        >
          {label}
          {state === current ? ' ✓' : ''}
        </button>
      ))}
    </div>
  );
}
