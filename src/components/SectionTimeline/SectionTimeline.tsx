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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useProjectStore } from '../../store/useProjectStore';
import { paletteForName } from '../../lib/palette';
import { SectionBlock } from './SectionBlock';
import { SectionContextMenu } from './SectionContextMenu';
import { SectionGhost } from './SectionGhost';
import { AddSectionButton } from './AddSectionButton';
import { AddTrackButton } from '../TrackGrid/AddTrackButton';

export function sectionsGridTemplate(bars: number[]): string {
  if (bars.length === 0) return '1fr';
  return bars.map((b) => `${b}fr`).join(' ');
}

const ROTATIONS = [-0.8, 0.6, -1, 0.5, -0.5, 1, -0.4, 0.7, -0.6, 0.4];

export function SectionTimeline() {
  const sections = useProjectStore((s) => s.sections);
  const addSection = useProjectStore((s) => s.addSection);
  const removeSection = useProjectStore((s) => s.removeSection);
  const renameSection = useProjectStore((s) => s.renameSection);
  const reorderSections = useProjectStore((s) => s.reorderSections);
  const addTrack = useProjectStore((s) => s.addTrack);

  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const template = sectionsGridTemplate(sorted.map((s) => s.bars));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sorted.map((s) => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderSections(arrayMove(ids, oldIndex, newIndex));
  }

  const draggingSection = draggingId ? sorted.find((s) => s.id === draggingId) : null;

  return (
    <section className="grid gap-[10px] items-stretch py-1" style={{ gridTemplateColumns: '140px 1fr 50px' }}>
      <div className="flex flex-col justify-between items-start py-0.5">
        <AddTrackButton onClick={addTrack} />
        <span
          className="font-sans font-semibold uppercase text-accent border border-inkFaint rounded-[10px] px-[7px] py-[3px]"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            transform: 'rotate(-2deg)',
          }}
        >
          Sections
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sorted.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          {sorted.length === 0 ? (
            <div
              className="flex items-center justify-center font-hand text-inkMute border border-dashed border-inkFaint rounded"
              style={{ fontSize: 22, height: 84 }}
            >
              Click + to add your first section →
            </div>
          ) : (
          <div className="grid gap-[6px]" style={{ gridTemplateColumns: template }}>
            {sorted.map((section, i) => {
              const palette = paletteForName(section.name);
              const rotation = ROTATIONS[i % ROTATIONS.length];
              const filterId = i % 2 === 0 ? 'ink-bleed' : 'ink-bleed-2';
              const useMarkerOverlay = palette.role === 'wine';
              const useEmptyDots = palette.role === 'grey';
              return (
                <SectionBlock
                  key={section.id}
                  section={section}
                  palette={palette}
                  rotation={rotation}
                  filterId={filterId}
                  useMarkerOverlay={useMarkerOverlay}
                  useEmptyDots={useEmptyDots}
                  onRename={(id, name) => renameSection(id, name)}
                  onRequestDelete={(id) => removeSection(id)}
                  onPickPreset={(id, e) => setMenu({ id, x: e.clientX, y: e.clientY })}
                />
              );
            })}
          </div>
          )}
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {draggingSection && (
            <SectionGhost section={draggingSection} palette={paletteForName(draggingSection.name)} />
          )}
        </DragOverlay>
      </DndContext>

      <AddSectionButton onClick={addSection} />

      {menu && (
        <SectionContextMenu
          x={menu.x}
          y={menu.y}
          onPick={(name) => renameSection(menu.id, name, { recolor: true })}
          onClose={() => setMenu(null)}
        />
      )}
    </section>
  );
}
