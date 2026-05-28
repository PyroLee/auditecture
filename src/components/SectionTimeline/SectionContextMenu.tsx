import { useEffect, useRef } from 'react';
import { SECTION_PRESET_NAMES } from '../../lib/defaults';

interface SectionContextMenuProps {
  x: number;
  y: number;
  onPick: (name: string) => void;
  onClose: () => void;
}

export function SectionContextMenu({ x, y, onPick, onClose }: SectionContextMenuProps) {
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
      className="fixed z-50 bg-paper border border-ruleStrong rounded shadow-lg py-1 min-w-[140px]"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-inkSoft border-b border-rule">
        Rename to…
      </div>
      {SECTION_PRESET_NAMES.map((name) => (
        <button
          key={name}
          className="block w-full text-left px-3 py-1.5 font-hand text-lg hover:bg-paperDeep"
          onClick={() => {
            onPick(name);
            onClose();
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
