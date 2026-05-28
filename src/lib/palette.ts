export type PaletteRole = 'grey' | 'blue' | 'ochre' | 'wine';

export interface PaletteEntry {
  role: PaletteRole;
  fill: string;
  ink: string;
  hatchId: string;
}

export const PALETTE: Record<PaletteRole, PaletteEntry> = {
  grey: { role: 'grey', fill: '#968d7e', ink: '#4a4338', hatchId: 'hatch-grey' },
  blue: { role: 'blue', fill: '#5e7d92', ink: '#2f4754', hatchId: 'hatch-blue' },
  ochre: { role: 'ochre', fill: '#c19139', ink: '#6e4d10', hatchId: 'hatch-ochre' },
  wine: { role: 'wine', fill: '#99454f', ink: '#5a232a', hatchId: 'hatch-wine' },
};

const ROLE_BY_NAME: Array<[RegExp, PaletteRole]> = [
  [/intro|outro/i, 'grey'],
  [/verse|break|bridge/i, 'blue'],
  [/build|pre[\s-]?chorus/i, 'ochre'],
  [/drop|chorus|hook/i, 'wine'],
];

export function roleForName(name: string): PaletteRole {
  for (const [pattern, role] of ROLE_BY_NAME) {
    if (pattern.test(name)) return role;
  }
  return 'grey';
}

export function paletteForName(name: string): PaletteEntry {
  return PALETTE[roleForName(name)];
}
