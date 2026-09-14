import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ComponentProps } from 'react';
import { TaskCard } from './TaskCard';

type Props = ComponentProps<typeof TaskCard>;

/** Drag handle for TaskCard — kept separate so TaskCard stays dnd-kit-free. */
export function DraggableTaskCard(props: Props) {
  const { setNodeRef, listeners, attributes, isDragging, transform, transition } = useSortable({
    id: props.card.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
    >
      <TaskCard {...props} />
    </div>
  );
}
