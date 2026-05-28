export interface HistoryState<T> {
  past: T[];
  future: T[];
}

export const HISTORY_LIMIT = 50;

export function emptyHistory<T>(): HistoryState<T> {
  return { past: [], future: [] };
}

export function pushHistory<T>(history: HistoryState<T>, snapshot: T): HistoryState<T> {
  const past = [...history.past, snapshot];
  if (past.length > HISTORY_LIMIT) {
    past.shift();
  }
  return { past, future: [] };
}

export interface UndoResult<T> {
  snapshot: T;
  history: HistoryState<T>;
}

export function undo<T>(history: HistoryState<T>, current: T): UndoResult<T> | null {
  if (history.past.length === 0) return null;
  const past = history.past.slice(0, -1);
  const snapshot = history.past[history.past.length - 1];
  const future = [current, ...history.future];
  return { snapshot, history: { past, future } };
}

export function redo<T>(history: HistoryState<T>, current: T): UndoResult<T> | null {
  if (history.future.length === 0) return null;
  const [snapshot, ...future] = history.future;
  const past = [...history.past, current];
  if (past.length > HISTORY_LIMIT) {
    past.shift();
  }
  return { snapshot, history: { past, future } };
}
