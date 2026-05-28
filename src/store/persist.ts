import { PROJECT_VERSION, Project } from '../types/project';

export const STORAGE_KEY = 'auditecture:project:default';
export const SAVE_DEBOUNCE_MS = 500;

export function loadProjectFromStorage(): Project | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.version !== PROJECT_VERSION) return null;
    return data as Project;
  } catch {
    return null;
  }
}

export function saveProjectToStorage(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    // localStorage may be full or disabled — fail silently for v1
  }
}

export function createDebouncedSaver(delay = SAVE_DEBOUNCE_MS) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let onSaving: (() => void) | null = null;
  let onSaved: (() => void) | null = null;

  function schedule(project: Project) {
    if (timer) clearTimeout(timer);
    onSaving?.();
    timer = setTimeout(() => {
      saveProjectToStorage(project);
      timer = null;
      onSaved?.();
    }, delay);
  }

  function flush(project: Project) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    saveProjectToStorage(project);
    onSaved?.();
  }

  return {
    schedule,
    flush,
    onSaving(cb: () => void) {
      onSaving = cb;
    },
    onSaved(cb: () => void) {
      onSaved = cb;
    },
  };
}
