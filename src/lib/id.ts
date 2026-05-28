const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function makeId(prefix = ''): string {
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return prefix ? `${prefix}_${id}` : id;
}
