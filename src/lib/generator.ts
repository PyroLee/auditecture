import { Cell, CellState, Section, Track } from '../types/project';
import { makeId } from './id';
import { paletteForName } from './palette';

/**
 * Random song-structure generator.
 *
 * The goal: random but *musically sensible* sketches — not noise. Three layers:
 *  1. A style archetype picks BPM range + a track palette + an energy mood.
 *  2. A section grammar picks a real EDM arrangement template (Intro → Build →
 *     Drop → Break → …) and randomizes phrase lengths.
 *  3. A cell probability matrix decides each track's state per section role,
 *     encoding common production logic (kick slams in the drop, drops out in
 *     the break; risers fade-in during builds; everything fades out in the outro).
 */

// ---------- RNG helpers ----------
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function chance(p: number): boolean {
  return Math.random() < p;
}
function weightedPick(weights: StateWeights): CellState {
  const entries = Object.entries(weights) as [CellState, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [state, w] of entries) {
    r -= w;
    if (r <= 0) return state;
  }
  return entries[entries.length - 1][0];
}

// ---------- Section grammar ----------
type SectionRole = 'intro' | 'build' | 'drop' | 'break' | 'verse' | 'bridge' | 'outro';

const ENERGETIC_TEMPLATES: SectionRole[][] = [
  // classic double drop
  ['intro', 'build', 'drop', 'break', 'build', 'drop', 'outro'],
  // song-form with verses
  ['intro', 'verse', 'build', 'drop', 'break', 'verse', 'build', 'drop', 'outro'],
  // minimal / DJ tool
  ['intro', 'drop', 'break', 'build', 'drop', 'outro'],
  // breakdown with a bridge
  ['intro', 'build', 'drop', 'break', 'bridge', 'build', 'drop', 'outro'],
  // triple drop
  ['intro', 'drop', 'break', 'build', 'drop', 'break', 'build', 'drop', 'outro'],
  // verse-led with double breakdown
  ['intro', 'verse', 'build', 'drop', 'break', 'build', 'drop', 'break', 'outro'],
];

const CALM_TEMPLATES: SectionRole[][] = [
  ['intro', 'build', 'drop', 'break', 'outro'],
  ['intro', 'verse', 'break', 'verse', 'bridge', 'outro'],
  ['intro', 'build', 'drop', 'break', 'bridge', 'outro'],
  ['intro', 'verse', 'build', 'drop', 'outro'],
];

// Phrase lengths in bars — weighted toward musically common values per role.
const BARS_BY_ROLE: Record<SectionRole, number[]> = {
  intro: [8, 16, 16, 16, 32],
  build: [4, 8, 8, 8, 16],
  drop: [16, 16, 32, 32, 32],
  break: [8, 16, 16, 32],
  verse: [16, 16, 16, 32],
  bridge: [8, 16, 16],
  outro: [8, 16, 16, 32],
};

const DISPLAY_BY_ROLE: Record<SectionRole, string> = {
  intro: 'Intro',
  build: 'Build',
  drop: 'Drop',
  break: 'Break',
  verse: 'Verse',
  bridge: 'Bridge',
  outro: 'Outro',
};

// ---------- Track roles & cell matrix ----------
type TrackRole = 'kick' | 'snare' | 'bass' | 'lead' | 'pad' | 'vocal' | 'perc' | 'fx';

function trackRole(name: string): TrackRole {
  const n = name.toLowerCase();
  if (/kick|drum|beat/.test(n)) return 'kick';
  if (/snare|clap/.test(n)) return 'snare';
  if (/bass|sub|reese|growl|rumble|808/.test(n)) return 'bass';
  if (/pad|atmos|drone|texture|string|swell|chord/.test(n)) return 'pad';
  if (/vocal|vox|sax|choir/.test(n)) return 'vocal';
  if (/hat|perc|ride|tom|cymbal|break|shaker/.test(n)) return 'perc';
  if (/fx|riser|impact|noise|field|vinyl|sweep|fall/.test(n)) return 'fx';
  return 'lead'; // lead / melody / pluck / arp / supersaw / rhodes / bell / pluck …
}

type StateWeights = Partial<Record<CellState, number>>;
type MatrixCol = 'intro' | 'build' | 'drop' | 'break' | 'verse' | 'outro';

// bridge behaves like a (melodic) break for fill purposes
function matrixCol(role: SectionRole): MatrixCol {
  return role === 'bridge' ? 'break' : role;
}

const MATRIX: Record<TrackRole, Record<MatrixCol, StateWeights>> = {
  kick: {
    intro: { empty: 4, 'fade-in': 3, active: 1 },
    build: { active: 5, 'fade-out': 2, empty: 1 },
    drop: { active: 10 },
    break: { empty: 5, 'fade-out': 2, active: 1 },
    verse: { active: 5, empty: 1 },
    outro: { 'fade-out': 4, empty: 3, active: 1 },
  },
  snare: {
    intro: { empty: 5, 'fade-in': 1 },
    build: { active: 5, 'fade-in': 2 },
    drop: { active: 6, empty: 1 },
    break: { empty: 3, active: 2 },
    verse: { active: 3, empty: 2 },
    outro: { 'fade-out': 3, empty: 3 },
  },
  bass: {
    intro: { empty: 4, 'fade-in': 2 },
    build: { active: 4, 'fade-out': 2 },
    drop: { active: 10 },
    break: { empty: 4, active: 2 },
    verse: { active: 5, empty: 1 },
    outro: { 'fade-out': 4, empty: 2 },
  },
  lead: {
    intro: { empty: 3, 'fade-in': 3 },
    build: { 'fade-in': 4, active: 2 },
    drop: { active: 6, empty: 1 },
    break: { active: 4, 'fade-in': 2, empty: 1 },
    verse: { active: 3, empty: 2 },
    outro: { 'fade-out': 3, empty: 3 },
  },
  pad: {
    intro: { active: 4, 'fade-in': 3 },
    build: { active: 4, 'fade-out': 1 },
    drop: { active: 3, empty: 2 },
    break: { active: 5, 'fade-in': 1 },
    verse: { active: 4, empty: 1 },
    outro: { 'fade-out': 3, active: 2 },
  },
  vocal: {
    intro: { empty: 5, 'fade-in': 1 },
    build: { active: 3, 'fade-in': 2, empty: 1 },
    drop: { active: 3, empty: 3 },
    break: { active: 4, empty: 2 },
    verse: { active: 4, empty: 2 },
    outro: { 'fade-out': 2, empty: 4 },
  },
  perc: {
    intro: { empty: 3, 'fade-in': 2, active: 1 },
    build: { active: 3, 'fade-in': 2 },
    drop: { active: 6 },
    break: { empty: 3, active: 2 },
    verse: { active: 4, empty: 1 },
    outro: { 'fade-out': 3, empty: 2 },
  },
  fx: {
    intro: { active: 2, empty: 3, 'fade-in': 1 },
    build: { active: 5, 'fade-in': 2 },
    drop: { active: 2, empty: 3 },
    break: { active: 2, empty: 3 },
    verse: { empty: 4, active: 1 },
    outro: { empty: 3, active: 1, 'fade-out': 1 },
  },
};

// ---------- Style archetypes ----------
interface Style {
  name: string;
  bpm: [number, number];
  mood: 'energetic' | 'calm';
  // ordered: index 0 = core drums, index 1 = core bass; both always kept
  tracks: string[];
}

const STYLES: Style[] = [
  { name: 'Tech House', bpm: [124, 128], mood: 'energetic',
    tracks: ['Kick', 'Bass', 'Rumble', 'Hats', 'Clap', 'Lead', 'Vox Chop', 'FX'] },
  { name: 'Melodic Techno', bpm: [122, 126], mood: 'energetic',
    tracks: ['Kick', 'Sub Bass', 'Arp', 'Pad', 'Lead', 'Pluck', 'Atmos', 'FX'] },
  { name: 'Progressive House', bpm: [126, 130], mood: 'energetic',
    tracks: ['Kick', 'Bass', 'Pluck', 'Lead', 'Pad', 'Vocal', 'Arp', 'FX'] },
  { name: 'Trance', bpm: [134, 140], mood: 'energetic',
    tracks: ['Kick', 'Bass', 'Lead', 'Pad', 'Arp', 'Pluck', 'Vocal', 'FX'] },
  { name: 'Drum & Bass', bpm: [172, 176], mood: 'energetic',
    tracks: ['Drums', 'Reese Bass', 'Sub', 'Lead', 'Pad', 'Breaks', 'Vocal', 'FX'] },
  { name: 'Future Bass', bpm: [148, 160], mood: 'energetic',
    tracks: ['Kick', 'Bass', 'Supersaw', 'Vocal Chop', 'Pluck', 'Pad', 'Snare', 'FX'] },
  { name: 'Dubstep', bpm: [140, 150], mood: 'energetic',
    tracks: ['Kick', 'Growl Bass', 'Sub', 'Snare', 'Lead', 'Atmos', 'Vox', 'FX'] },
  { name: 'Synthwave', bpm: [100, 118], mood: 'energetic',
    tracks: ['Kick', 'Bass', 'Lead', 'Pads', 'Arp', 'Toms', 'Vocal', 'FX'] },
  { name: 'Lo-fi', bpm: [78, 92], mood: 'calm',
    tracks: ['Drums', 'Bass', 'Rhodes', 'Vinyl', 'Pad', 'Melody', 'Sax', 'FX'] },
  { name: 'Downtempo', bpm: [90, 110], mood: 'calm',
    tracks: ['Drums', 'Bass', 'Pad', 'Pluck', 'Lead', 'Atmos', 'Vocal', 'FX'] },
  { name: 'Ambient', bpm: [70, 90], mood: 'calm',
    tracks: ['Drone', 'Sub', 'Pad', 'Texture', 'Bells', 'Lead', 'Field Rec', 'FX'] },
];

function pickTracks(style: Style): string[] {
  const chosen: string[] = [];
  style.tracks.forEach((t, i) => {
    if (i < 2) chosen.push(t); // always keep the two core tracks
    else if (chance(0.6)) chosen.push(t);
  });
  // ensure at least 5 tracks
  for (const t of style.tracks) {
    if (chosen.length >= 5) break;
    if (!chosen.includes(t)) chosen.push(t);
  }
  return chosen.slice(0, 8);
}

// ---------- Poetic project names ----------
const ADJECTIVES = [
  'Midnight', 'Velvet', 'Neon', 'Crimson', 'Glass', 'Hollow', 'Lunar', 'Static',
  'Amber', 'Cobalt', 'Faded', 'Electric', 'Distant', 'Molten', 'Paper', 'Silent',
  'Drowned', 'Golden', 'Phantom', 'Frozen', 'Violet', 'Dusty', 'Marble', 'Wired',
];
const NOUNS = [
  'Circuit', 'Drift', 'Mirage', 'Pulse', 'Horizon', 'Echo', 'Cascade', 'Vapor',
  'Tide', 'Bloom', 'Signal', 'Ember', 'Vertex', 'Halo', 'Current', 'Fracture',
  'Lattice', 'Specter', 'Monsoon', 'Aurora', 'Cinder', 'Lagoon', 'Comet', 'Relic',
];

function randomName(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

// ---------- Assembly ----------
export interface RandomSketch {
  name: string;
  bpm: number;
  sections: Section[];
  tracks: Track[];
  cells: Cell[];
}

export function generateRandomSketch(): RandomSketch {
  const style = pick(STYLES);
  const bpm = randInt(style.bpm[0], style.bpm[1]);
  const templates = style.mood === 'calm' ? CALM_TEMPLATES : ENERGETIC_TEMPLATES;
  const roleSeq = pick(templates);

  // Build sections, numbering repeated roles ("Drop", "Drop 2", …)
  const counts: Partial<Record<SectionRole, number>> = {};
  const paired = roleSeq.map((role, i) => {
    const n = (counts[role] = (counts[role] ?? 0) + 1);
    const base = DISPLAY_BY_ROLE[role];
    const display = n >= 2 ? `${base} ${n}` : base;
    const section: Section = {
      id: makeId('s'),
      name: display,
      bars: pick(BARS_BY_ROLE[role]),
      color: paletteForName(display).fill,
      order: i,
    };
    return { section, role };
  });
  const sections = paired.map((p) => p.section);

  // Tracks
  const tracks: Track[] = pickTracks(style).map((name, i) => ({
    id: makeId('t'),
    name,
    order: i,
  }));

  // Cells — sparse, only non-empty states stored
  const cells: Cell[] = [];
  for (const t of tracks) {
    const role = trackRole(t.name);
    for (const { section, role: secRole } of paired) {
      const state = weightedPick(MATRIX[role][matrixCol(secRole)]);
      if (state !== 'empty') {
        cells.push({ trackId: t.id, sectionId: section.id, state });
      }
    }
  }

  return { name: randomName(), bpm, sections, tracks, cells };
}
