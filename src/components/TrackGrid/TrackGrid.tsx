import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CellState } from '../../types/project';
import { useProjectStore } from '../../store/useProjectStore';
import { paletteForName } from '../../lib/palette';
import { sectionsGridTemplate } from '../SectionTimeline/SectionTimeline';
import { Cell } from './Cell';
import { CellContextMenu } from './CellContextMenu';
import { TrackHeader } from './TrackHeader';
import { TrackGhost } from './TrackGhost';

const TRACK_ROTATIONS = [-0.4, 0.3, -0.5, 0.4, -0.3, 0.5, -0.6, 0.4];

export function TrackGrid() {
  const sections = useProjectStore((s) => s.sections);
  const tracks = useProjectStore((s) => s.tracks);
  const cells = useProjectStore((s) => s.cells);
  const removeTrack = useProjectStore((s) => s.removeTrack);
  const renameTrack = useProjectStore((s) => s.renameTrack);
  const reorderTracks = useProjectStore((s) => s.reorderTracks);
  const cycleCellState = useProjectStore((s) => s.cycleCellState);
  const setCellState = useProjectStore((s) => s.setCellState);

  const [menu, setMenu] = useState<{
    trackId: string;
    sectionId: string;
    current: CellState;
    x: number;
    y: number;
  } | null>(null);
  const [draggingTrackId, setDraggingTrackId] = useState<string | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);
  const template = sectionsGridTemplate(sortedSections.map((s) => s.bars));

  const cellMap = new Map<string, CellState>();
  for (const c of cells) cellMap.set(`${c.trackId}:${c.sectionId}`, c.state);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setDraggingTrackId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingTrackId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sortedTracks.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderTracks(arrayMove(ids, oldIndex, newIndex));
  }

  const draggingTrack = draggingTrackId
    ? sortedTracks.find((t) => t.id === draggingTrackId)
    : null;

  return (
    <section
      className="grid gap-[10px] items-stretch pt-1.5 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-sketch"
      style={{ gridTemplateColumns: '140px 1fr 50px', alignContent: 'start' }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedTracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-[6px]">
            {sortedTracks.map((track, i) => (
              <TrackHeader
                key={track.id}
                track={track}
                rotation={TRACK_ROTATIONS[i % TRACK_ROTATIONS.length]}
                onRename={renameTrack}
                onRequestDelete={(id) => removeTrack(id)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {draggingTrack && <TrackGhost track={draggingTrack} />}
        </DragOverlay>
      </DndContext>

      {sortedTracks.length === 0 ? (
        <div
          className="flex items-center justify-center font-hand text-inkMute border border-dashed border-inkFaint rounded"
          style={{ fontSize: 22, height: 58 }}
        >
          ↖ Click "Add track" up top to start drawing
        </div>
      ) : (
      <div
        className="grid gap-[6px]"
        style={{ gridTemplateRows: `repeat(${sortedTracks.length}, 58px)` }}
      >
        {sortedTracks.map((track, rowIdx) => (
          <div
            key={track.id}
            className="grid gap-[6px]"
            style={{ gridTemplateColumns: template }}
          >
            {sortedSections.map((section, colIdx) => {
              const state = cellMap.get(`${track.id}:${section.id}`) ?? 'empty';
              const palette = paletteForName(section.name);
              return (
                <Cell
                  key={section.id}
                  state={state}
                  palette={palette}
                  seedShift={rowIdx + colIdx}
                  title={`${track.name} · ${section.name}: ${state}`}
                  onClick={() => cycleCellState(track.id, section.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenu({
                      trackId: track.id,
                      sectionId: section.id,
                      current: state,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      )}

      <div />

      {menu && (
        <CellContextMenu
          x={menu.x}
          y={menu.y}
          current={menu.current}
          onPick={(state) => setCellState(menu.trackId, menu.sectionId, state)}
          onClose={() => setMenu(null)}
        />
      )}
    </section>
  );
}
