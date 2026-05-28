import { PROJECT_VERSION, Project, Section, Track } from '../types/project';
import { makeId } from './id';
import { paletteForName } from './palette';

export const SECTION_PRESET_NAMES = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Break',
  'Build',
  'Drop',
  'Bridge',
  'Outro',
] as const;

export const DEFAULT_TRACK_NAMES = ['Kick', 'Bass', 'Lead Synth', 'Pad', 'Vocal', 'FX'];

export function colorForSectionName(name: string): string {
  return paletteForName(name).fill;
}

// PRD 附录 A 的 Tech House 示例 — 跟原型图保持一致
export function makeDefaultSections(): Section[] {
  const spec = [
    ['Intro', 16],
    ['Verse', 16],
    ['Build', 8],
    ['Drop', 32],
    ['Break', 16],
    ['Build 2', 8],
    ['Drop 2', 32],
    ['Outro', 16],
  ] as const;
  return spec.map(([name, bars], i) => ({
    id: makeId('s'),
    name,
    bars,
    color: colorForSectionName(name),
    order: i,
  }));
}

export function makeDefaultTracks(): Track[] {
  return DEFAULT_TRACK_NAMES.map((name, i) => ({
    id: makeId('t'),
    name,
    order: i,
  }));
}

export function makeDefaultProject(): Project {
  const now = new Date().toISOString();
  return {
    version: PROJECT_VERSION,
    name: 'Tech House Sketch',
    bpm: 128,
    sections: makeDefaultSections(),
    tracks: makeDefaultTracks(),
    cells: [],
    createdAt: now,
    updatedAt: now,
  };
}
