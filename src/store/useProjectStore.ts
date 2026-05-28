import { create } from 'zustand';
import { CellState, Project, Section, Track } from '../types/project';
import {
  colorForSectionName,
  makeDefaultProject,
} from '../lib/defaults';
import { makeId } from '../lib/id';
import {
  HistoryState,
  emptyHistory,
  pushHistory,
  redo as redoHistory,
  undo as undoHistory,
} from './history';
import {
  createDebouncedSaver,
  loadProjectFromStorage,
} from './persist';

type ProjectSnapshot = Pick<Project, 'name' | 'bpm' | 'sections' | 'tracks' | 'cells'>;

export type SaveStatus = 'idle' | 'saving' | 'saved';

interface ProjectState extends ProjectSnapshot {
  createdAt: string;
  history: HistoryState<ProjectSnapshot>;
  inTransaction: boolean;
  saveStatus: SaveStatus;

  // Project-level
  setProjectName: (name: string) => void;
  setBpm: (bpm: number) => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;

  // Sections
  addSection: () => void;
  removeSection: (id: string) => void;
  renameSection: (id: string, name: string, opts?: { recolor?: boolean }) => void;
  resizeSection: (id: string, bars: number) => void;
  reorderSections: (orderedIds: string[]) => void;
  setSectionColor: (id: string, color: string) => void;

  // Tracks
  addTrack: () => void;
  removeTrack: (id: string) => void;
  renameTrack: (id: string, name: string) => void;
  reorderTracks: (orderedIds: string[]) => void;

  // Cells
  setCellState: (trackId: string, sectionId: string, state: CellState) => void;
  cycleCellState: (trackId: string, sectionId: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Transaction (for drag operations — group many mutations into one history entry)
  beginTransaction: () => void;
  endTransaction: () => void;
}

const CELL_CYCLE: CellState[] = ['empty', 'active', 'fade-in', 'fade-out'];

function nextCellState(current: CellState): CellState {
  const i = CELL_CYCLE.indexOf(current);
  return CELL_CYCLE[(i + 1) % CELL_CYCLE.length];
}

function snapshot(state: ProjectSnapshot): ProjectSnapshot {
  return {
    name: state.name,
    bpm: state.bpm,
    sections: state.sections.map((s) => ({ ...s })),
    tracks: state.tracks.map((t) => ({ ...t })),
    cells: state.cells.map((c) => ({ ...c })),
  };
}

function reindex<T extends { order: number }>(items: T[]): T[] {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, i) => ({ ...item, order: i }));
}

function initialState(): ProjectSnapshot & { createdAt: string } {
  const stored = loadProjectFromStorage();
  const project = stored ?? makeDefaultProject();
  return {
    name: project.name,
    bpm: project.bpm,
    sections: project.sections,
    tracks: project.tracks,
    cells: project.cells,
    createdAt: project.createdAt,
  };
}

const saver = createDebouncedSaver();

function buildProject(state: ProjectState): Project {
  return {
    version: 1,
    name: state.name,
    bpm: state.bpm,
    sections: state.sections,
    tracks: state.tracks,
    cells: state.cells,
    createdAt: state.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

export const useProjectStore = create<ProjectState>((set, get) => {
  const base = initialState();

  // ---- helper: apply a mutation that should be tracked in history ----
  function commit(producer: (draft: ProjectSnapshot) => void) {
    const state = get();
    const before = snapshot(state);
    const draft = snapshot(state);
    producer(draft);
    const nextHistory = state.inTransaction ? state.history : pushHistory(state.history, before);
    set({
      ...draft,
      history: nextHistory,
    });
  }

  // ---- saver wiring ----
  saver.onSaving(() => set({ saveStatus: 'saving' }));
  saver.onSaved(() => set({ saveStatus: 'saved' }));

  // Subscribe ourselves: when relevant state changes, schedule save.
  // Done after store is created (see bottom of file).

  return {
    ...base,
    history: emptyHistory<ProjectSnapshot>(),
    inTransaction: false,
    saveStatus: 'idle',

    // ---- Project-level ----
    setProjectName: (name) => commit((d) => void (d.name = name)),
    setBpm: (bpm) => {
      const clamped = Math.max(40, Math.min(240, Math.round(bpm)));
      commit((d) => void (d.bpm = clamped));
    },
    loadProject: (project) => {
      set({
        name: project.name,
        bpm: project.bpm,
        sections: project.sections,
        tracks: project.tracks,
        cells: project.cells,
        createdAt: project.createdAt,
        history: emptyHistory(),
        inTransaction: false,
      });
    },
    resetProject: () => {
      const fresh = makeDefaultProject();
      set({
        name: fresh.name,
        bpm: fresh.bpm,
        sections: fresh.sections,
        tracks: fresh.tracks,
        cells: fresh.cells,
        createdAt: fresh.createdAt,
        history: emptyHistory(),
        inTransaction: false,
      });
    },

    // ---- Sections ----
    addSection: () => {
      commit((d) => {
        const order = d.sections.length;
        const name = `Section ${order + 1}`;
        const section: Section = {
          id: makeId('s'),
          name,
          bars: 8,
          color: colorForSectionName(name),
          order,
        };
        d.sections.push(section);
      });
    },
    removeSection: (id) => {
      commit((d) => {
        d.sections = reindex(d.sections.filter((s) => s.id !== id));
        d.cells = d.cells.filter((c) => c.sectionId !== id);
      });
    },
    renameSection: (id, name, opts) => {
      commit((d) => {
        const section = d.sections.find((s) => s.id === id);
        if (!section) return;
        section.name = name;
        if (opts?.recolor) {
          section.color = colorForSectionName(name);
        }
      });
    },
    resizeSection: (id, bars) => {
      const clamped = Math.max(1, Math.round(bars));
      commit((d) => {
        const section = d.sections.find((s) => s.id === id);
        if (section) section.bars = clamped;
      });
    },
    reorderSections: (orderedIds) => {
      commit((d) => {
        const byId = new Map(d.sections.map((s) => [s.id, s]));
        d.sections = orderedIds
          .map((id, i) => {
            const s = byId.get(id);
            return s ? { ...s, order: i } : null;
          })
          .filter((s): s is Section => s !== null);
      });
    },
    setSectionColor: (id, color) => {
      commit((d) => {
        const section = d.sections.find((s) => s.id === id);
        if (section) section.color = color;
      });
    },

    // ---- Tracks ----
    addTrack: () => {
      commit((d) => {
        const order = d.tracks.length;
        d.tracks.push({
          id: makeId('t'),
          name: `Track ${order + 1}`,
          order,
        });
      });
    },
    removeTrack: (id) => {
      commit((d) => {
        d.tracks = reindex(d.tracks.filter((t) => t.id !== id));
        d.cells = d.cells.filter((c) => c.trackId !== id);
      });
    },
    renameTrack: (id, name) => {
      commit((d) => {
        const track = d.tracks.find((t) => t.id === id);
        if (track) track.name = name;
      });
    },
    reorderTracks: (orderedIds) => {
      commit((d) => {
        const byId = new Map(d.tracks.map((t) => [t.id, t]));
        d.tracks = orderedIds
          .map((id, i) => {
            const t = byId.get(id);
            return t ? { ...t, order: i } : null;
          })
          .filter((t): t is Track => t !== null);
      });
    },

    // ---- Cells ----
    setCellState: (trackId, sectionId, state) => {
      commit((d) => {
        d.cells = d.cells.filter((c) => !(c.trackId === trackId && c.sectionId === sectionId));
        if (state !== 'empty') {
          d.cells.push({ trackId, sectionId, state });
        }
      });
    },
    cycleCellState: (trackId, sectionId) => {
      const current =
        get().cells.find((c) => c.trackId === trackId && c.sectionId === sectionId)?.state ??
        'empty';
      const next = nextCellState(current);
      get().setCellState(trackId, sectionId, next);
    },

    // ---- History ----
    undo: () => {
      const state = get();
      const result = undoHistory(state.history, snapshot(state));
      if (!result) return;
      set({ ...result.snapshot, history: result.history });
    },
    redo: () => {
      const state = get();
      const result = redoHistory(state.history, snapshot(state));
      if (!result) return;
      set({ ...result.snapshot, history: result.history });
    },
    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    // ---- Transaction ----
    beginTransaction: () => {
      const state = get();
      if (state.inTransaction) return;
      set({
        inTransaction: true,
        history: pushHistory(state.history, snapshot(state)),
      });
    },
    endTransaction: () => {
      set({ inTransaction: false });
    },
  };
});

// ---- Auto-save: subscribe to state changes that affect the persisted project ----
let lastSavedKey = '';
useProjectStore.subscribe((state) => {
  const project = buildProject(state as ProjectState);
  const key = JSON.stringify({
    n: project.name,
    b: project.bpm,
    s: project.sections,
    t: project.tracks,
    c: project.cells,
  });
  if (key === lastSavedKey) return;
  lastSavedKey = key;
  saver.schedule(project);
});

export function getCurrentProject(): Project {
  return buildProject(useProjectStore.getState());
}
