import { useDraggable } from '@dnd-kit/core';
import type { ComponentProps } from 'react';
import { TaskCard } from './TaskCard';

type Props = ComponentProps<typeof TaskCard>;

/** Drag handle for TaskCard — kept separate so TaskCard stays dnd-kit-free. */
export function DraggableTaskCard(props: Props) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: props.card.id });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <TaskCard {...props} />
    </div>
  );
}
