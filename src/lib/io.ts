import { PROJECT_VERSION, Project } from '../types/project';

export function exportProjectToJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function downloadProjectJson(project: Project): void {
  const blob = new Blob([exportProjectToJson(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const safeName = (project.name || 'project').replace(/[^\w\-]+/g, '_').toLowerCase();
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.auditecture.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseProjectJson(raw: string): Project {
  const data = JSON.parse(raw);
  if (data == null || typeof data !== 'object') {
    throw new Error('Invalid project file: not an object');
  }
  if (data.version !== PROJECT_VERSION) {
    throw new Error(`Unsupported project version: ${data.version}`);
  }
  if (!Array.isArray(data.sections) || !Array.isArray(data.tracks) || !Array.isArray(data.cells)) {
    throw new Error('Invalid project file: missing sections/tracks/cells');
  }
  return data as Project;
}

export function pickAndImportProjectJson(): Promise<Project> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.auditecture.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      try {
        const raw = await file.text();
        resolve(parseProjectJson(raw));
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}
