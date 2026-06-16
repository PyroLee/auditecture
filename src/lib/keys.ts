/**
 * Musical key constants + random picker.
 * A "key" here is a simple display string like "A minor" / "F# major".
 */

export const KEY_ROOTS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

// minor first — electronic music leans heavily minor
export const KEY_MODES = ['minor', 'major'] as const;

export const DEFAULT_KEY = 'A minor';

export const MUSICAL_KEYS: string[] = KEY_MODES.flatMap((mode) =>
  KEY_ROOTS.map((root) => `${root} ${mode}`),
);

export function randomKey(): string {
  const root = KEY_ROOTS[Math.floor(Math.random() * KEY_ROOTS.length)];
  // ~75% minor — matches the prevailing mood of most electronic genres
  const mode = Math.random() < 0.75 ? 'minor' : 'major';
  return `${root} ${mode}`;
}
