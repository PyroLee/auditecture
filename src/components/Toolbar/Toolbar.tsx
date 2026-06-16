import { useEffect, useState } from 'react';
import { Check, Undo2, Redo2, Dices } from 'lucide-react';
import { useProjectStore, getCurrentProject } from '../../store/useProjectStore';
import { downloadProjectJson, pickAndImportProjectJson } from '../../lib/io';
import { downloadMidi } from '../../lib/midi';
import { KEY_ROOTS } from '../../lib/keys';

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Toolbar() {
  const name = useProjectStore((s) => s.name);
  const bpm = useProjectStore((s) => s.bpm);
  const musicalKey = useProjectStore((s) => s.key);
  const sections = useProjectStore((s) => s.sections);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const setBpm = useProjectStore((s) => s.setBpm);
  const setKey = useProjectStore((s) => s.setKey);
  const loadProject = useProjectStore((s) => s.loadProject);
  const resetProject = useProjectStore((s) => s.resetProject);
  const randomizeProject = useProjectStore((s) => s.randomizeProject);
  const saveStatus = useProjectStore((s) => s.saveStatus);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const historyPast = useProjectStore((s) => s.history.past.length);
  const historyFuture = useProjectStore((s) => s.history.future.length);

  const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);
  const totalSeconds = bpm > 0 ? (totalBars * 4 * 60) / bpm : 0;

  const [bpmDraft, setBpmDraft] = useState(String(bpm));
  useEffect(() => setBpmDraft(String(bpm)), [bpm]);

  return (
    <header
      className="flex items-center gap-[22px] px-1 pb-[14px]"
      style={{ borderBottom: '1px dashed rgba(60,50,35,0.22)' }}
    >
      <div
        className="flex items-center gap-2 font-hand text-accent leading-none"
        style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px' }}
      >
        <span style={{ transform: 'rotate(-4deg)', marginRight: 2 }}>
          <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M3 17 Q3 5 11 5 Q19 5 19 17"
              stroke="#1a2332"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              filter="url(#ink-bleed-soft)"
            />
            <circle cx={6} cy={17} r={2.4} fill="#1a2332" filter="url(#ink-bleed-soft)" />
            <circle cx={16} cy={17} r={2.4} fill="#1a2332" filter="url(#ink-bleed-soft)" />
          </svg>
        </span>
        Auditecture<span className="text-sectionWine">.</span>
      </div>

      <span className="w-px h-[22px] bg-ruleStrong" />

      <input
        className="font-hand bg-transparent border-none outline-none px-1 pb-0.5 leading-none focus:!border-solid"
        style={{
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '-0.4px',
          width: 230,
          borderBottom: '1.5px dotted rgba(42,38,32,0.42)',
          transform: 'rotate(-0.35deg)',
        }}
        value={name}
        spellCheck={false}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <span className="w-px h-[22px] bg-ruleStrong" />

      <Field label="BPM">
        <input
          className="bg-transparent border-none outline-none font-sans"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#2a2620',
            width: 38,
            borderBottom: '1.5px dotted rgba(42,38,32,0.42)',
            paddingBottom: 1,
          }}
          value={bpmDraft}
          onChange={(e) => setBpmDraft(e.target.value)}
          onBlur={() => {
            const n = Number(bpmDraft);
            if (!Number.isNaN(n) && n > 0) setBpm(n);
            else setBpmDraft(String(bpm));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      </Field>

      <Field label="Key">
        <select
          className="bg-transparent border-none outline-none font-sans cursor-pointer hover:text-accent"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#2a2620',
            borderBottom: '1.5px dotted rgba(42,38,32,0.42)',
            paddingBottom: 1,
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
          value={musicalKey}
          onChange={(e) => setKey(e.target.value)}
          title="Project key — pick or roll a random one"
        >
          <optgroup label="Minor">
            {KEY_ROOTS.map((root) => (
              <option key={`${root}-minor`} value={`${root} minor`}>
                {root} minor
              </option>
            ))}
          </optgroup>
          <optgroup label="Major">
            {KEY_ROOTS.map((root) => (
              <option key={`${root}-major`} value={`${root} major`}>
                {root} major
              </option>
            ))}
          </optgroup>
        </select>
      </Field>

      <Field label="Total">
        <span className="font-sans" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px' }}>
          {formatDuration(totalSeconds)}
        </span>
      </Field>

      <Field label="Bars">
        <span className="font-sans" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px' }}>
          {totalBars}
        </span>
      </Field>

      <span className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          aria-label="Undo"
          title="Undo (⌘Z)"
          className="p-1.5 rounded text-inkSoft hover:text-ink hover:bg-paperDeep disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={historyPast === 0}
          onClick={undo}
        >
          <Undo2 size={16} strokeWidth={1.8} />
        </button>
        <button
          aria-label="Redo"
          title="Redo (⌘⇧Z)"
          className="p-1.5 rounded text-inkSoft hover:text-ink hover:bg-paperDeep disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={historyFuture === 0}
          onClick={redo}
        >
          <Redo2 size={16} strokeWidth={1.8} />
        </button>
      </div>

      <SavePill status={saveStatus} />

      <button
        className="group flex items-center gap-1.5 cursor-pointer font-sans uppercase font-semibold text-paper hover:brightness-110"
        style={{
          fontSize: 11,
          padding: '5px 11px',
          letterSpacing: '0.08em',
          background: '#99454f',
          border: '1px solid #5a232a',
          borderRadius: 6,
          transform: 'rotate(0.5deg)',
        }}
        title="Roll a fresh random song-structure template — your creative prompt for the week (⌘Z to undo)"
        onClick={randomizeProject}
      >
        <Dices size={14} strokeWidth={2} className="transition-transform group-hover:rotate-12" />
        Random
      </button>

      <button
        className="bg-transparent cursor-pointer font-sans uppercase font-semibold text-accent hover:text-ink"
        style={{
          fontSize: 11,
          padding: '5px 9px',
          letterSpacing: '0.08em',
          border: '1px dashed rgba(60,50,35,0.32)',
          borderRadius: 6,
          transform: 'rotate(-0.5deg)',
        }}
        title="Export as DAW template (.mid) — tempo + section markers + ghost-note regions"
        onClick={() => {
          try {
            downloadMidi(getCurrentProject());
          } catch (err) {
            alert('MIDI export failed: ' + String(err));
          }
        }}
      >
        ↓ MIDI
      </button>

      <button
        className="bg-transparent border-none cursor-pointer font-sans uppercase font-medium text-inkSoft hover:text-ink"
        style={{ fontSize: 11, padding: '6px 4px', letterSpacing: '0.06em' }}
        onClick={async () => {
          try {
            const p = await pickAndImportProjectJson();
            loadProject(p);
          } catch (err) {
            alert(String(err));
          }
        }}
      >
        Import
      </button>
      <button
        className="bg-transparent border-none cursor-pointer font-sans uppercase font-medium text-inkSoft hover:text-ink"
        style={{ fontSize: 11, padding: '6px 4px', letterSpacing: '0.06em' }}
        onClick={() => downloadProjectJson(getCurrentProject())}
      >
        Export
      </button>
      <button
        className="bg-transparent border-none cursor-pointer font-sans uppercase font-medium text-inkMute hover:text-sectionWineInk"
        style={{ fontSize: 11, padding: '6px 4px', letterSpacing: '0.06em' }}
        title="Reset to a fresh default project"
        onClick={() => {
          if (confirm('Reset to a fresh default project? Your current sketch will be lost (unless you Export first).')) {
            resetProject();
          }
        }}
      >
        New
      </button>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="font-sans uppercase font-medium text-inkSoft"
        style={{ fontSize: 10, letterSpacing: '0.14em' }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function SavePill({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  const label =
    status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved · just now' : 'Not saved yet';
  return (
    <div
      className="inline-flex items-center gap-[6px] font-sans font-medium text-inkSoft"
      style={{
        fontSize: 12,
        padding: '4px 11px 4px 9px',
        border: '1px solid rgba(60,50,35,0.22)',
        borderRadius: 14,
        background: 'rgba(255,251,238,0.45)',
        letterSpacing: '0.02em',
      }}
    >
      {status === 'saved' && (
        <span
          className="rounded-full inline-flex items-center justify-center bg-saveOk"
          style={{ width: 12, height: 12 }}
        >
          <Check size={7} color="white" strokeWidth={3} />
        </span>
      )}
      {status !== 'saved' && (
        <span
          className="rounded-full inline-block"
          style={{
            width: 8,
            height: 8,
            background: status === 'saving' ? '#c19139' : 'rgba(42,38,32,0.3)',
          }}
        />
      )}
      {label}
    </div>
  );
}
