import { useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import { SketchyDefs } from './components/SketchyDefs';
import { Toolbar } from './components/Toolbar/Toolbar';
import { SectionTimeline } from './components/SectionTimeline/SectionTimeline';
import { TrackGrid } from './components/TrackGrid/TrackGrid';

export default function App() {
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <>
      <SketchyDefs />
      <div
        className="canvas notebook-rule relative w-full h-screen"
        style={{
          minHeight: 840,
          padding: '20px 40px 32px',
          display: 'grid',
          gridTemplateRows: '48px 92px 1fr',
          rowGap: 18,
        }}
      >
        <Toolbar />
        <SectionTimeline />
        <TrackGrid />
      </div>
    </>
  );
}
