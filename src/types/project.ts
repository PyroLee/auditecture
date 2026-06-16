export type CellState = 'empty' | 'active' | 'fade-in' | 'fade-out';

export interface Section {
  id: string;
  name: string;
  bars: number;
  color: string;
  order: number;
}

export interface Track {
  id: string;
  name: string;
  order: number;
}

export interface Cell {
  trackId: string;
  sectionId: string;
  state: Exclude<CellState, 'empty'>;
}

export interface Project {
  version: 1;
  name: string;
  bpm: number;
  key: string; // e.g. "A minor"; added post-v1, old files default to DEFAULT_KEY on load
  sections: Section[];
  tracks: Track[];
  cells: Cell[];
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_VERSION = 1 as const;
