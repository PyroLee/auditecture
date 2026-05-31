import { Midi } from '@tonejs/midi';
import { CellState, Project } from '../types/project';

/**
 * MIDI export — turns an Auditecture project into a Standard MIDI File
 * suitable as a DAW project template.
 *
 * Output structure:
 *  - Conductor track (track 0): tempo + 4/4 time signature + one marker
 *    meta event per Auditecture section
 *  - One MIDI track per Auditecture track, in the same order
 *  - Each non-empty cell -> one "ghost" note (C1, velocity 1) spanning the
 *    section's full duration, so DAWs render it as a placeholder region
 *  - fade-in / fade-out cells currently render the same as active. A future
 *    iteration can add CC11 expression ramps to express the curve.
 */

const PPQ = 480;
const TICKS_PER_BAR = PPQ * 4; // assumes 4/4
const GHOST_NOTE_MIDI = 24; // C1
const GHOST_NOTE_VELOCITY = 1 / 127; // lowest non-zero velocity, ~inaudible

export function buildMidi(project: Project): Midi {
  const midi = new Midi();
  // @tonejs/midi defaults to PPQ=480, matching our TICKS_PER_BAR constant.
  // The PPQ property is read-only post-construction, but the default is what we want.
  midi.header.setTempo(project.bpm);
  midi.header.timeSignatures.push({
    ticks: 0,
    timeSignature: [4, 4],
  });

  const sortedSections = [...project.sections].sort((a, b) => a.order - b.order);
  const sortedTracks = [...project.tracks].sort((a, b) => a.order - b.order);

  // Pre-compute each section's start tick and duration
  const sectionStarts = new Map<string, number>();
  const sectionDurations = new Map<string, number>();
  let cursor = 0;
  for (const section of sortedSections) {
    const durationTicks = section.bars * TICKS_PER_BAR;
    sectionStarts.set(section.id, cursor);
    sectionDurations.set(section.id, durationTicks);
    midi.header.meta.push({
      type: 'marker',
      text: section.name,
      ticks: cursor,
    });
    cursor += durationTicks;
  }

  // Index cells for O(1) lookup
  const cellStates = new Map<string, CellState>();
  for (const c of project.cells) {
    cellStates.set(`${c.trackId}:${c.sectionId}`, c.state);
  }

  // Per-track: one MIDI track each, named after the Auditecture track
  for (const track of sortedTracks) {
    const midiTrack = midi.addTrack();
    midiTrack.name = track.name;

    for (const section of sortedSections) {
      const state = cellStates.get(`${track.id}:${section.id}`) ?? 'empty';
      if (state === 'empty') continue;

      const startTicks = sectionStarts.get(section.id)!;
      const durationTicks = sectionDurations.get(section.id)!;

      midiTrack.addNote({
        midi: GHOST_NOTE_MIDI,
        ticks: startTicks,
        durationTicks,
        velocity: GHOST_NOTE_VELOCITY,
      });
    }
  }

  return midi;
}

export function downloadMidi(project: Project): void {
  const midi = buildMidi(project);
  const bytes = midi.toArray();
  const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const safeName = (project.name || 'project').replace(/[^\w\-]+/g, '_').toLowerCase();
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
