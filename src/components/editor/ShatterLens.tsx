import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ShatterLensProps {
  content: string;
  onChange: (newContent: string) => void;
  fontSize: number;
}

interface Beat {
  id: string;
  text: string;
}

const SortableBeat = ({ beat, fontSize, onChange }: { beat: Beat, fontSize: number, onChange: (id: string, newText: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: beat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group flex items-start gap-4 p-4 rounded-lg border transition-all ${isDragging ? 'bg-surface-container-highest border-primary/50 shadow-2xl scale-[1.02]' : 'bg-surface-container-low border-white/5 hover:border-white/10'}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="mt-2 p-2 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing text-on-surface-variant/40 hover:text-primary transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <textarea
        value={beat.text}
        onChange={(e) => onChange(beat.id, e.target.value)}
        className="flex-1 bg-transparent border-none focus:outline-none resize-none overflow-hidden text-on-surface font-serif leading-relaxed"
        style={{ fontSize: `${fontSize}px`, minHeight: '80px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    </div>
  );
};

export const ShatterLens: React.FC<ShatterLensProps> = ({ content, onChange, fontSize }) => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const lastEmittedContent = React.useRef(content);

  useEffect(() => {
    if (content === lastEmittedContent.current && beats.length > 0) {
      return; // Ignore updates that we just emitted
    }
    // Split content into paragraphs, ignoring empty ones
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBeats(paragraphs.map((p, i) => ({ id: `beat-${i}-${Date.now()}`, text: p })));
    lastEmittedContent.current = content;
  }, [content, beats.length]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBeats((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newBeats = arrayMove(items, oldIndex, newIndex);
        const newContent = newBeats.map(b => b.text).join('\n\n');
        lastEmittedContent.current = newContent;
        onChange(newContent);
        return newBeats;
      });
    }
  };

  const handleBeatChange = (id: string, newText: string) => {
    setBeats(prev => {
      const newBeats = prev.map(b => b.id === id ? { ...b, text: newText } : b);
      const newContent = newBeats.map(b => b.text).join('\n\n');
      lastEmittedContent.current = newContent;
      onChange(newContent);
      return newBeats;
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={beats.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {beats.map(beat => (
              <SortableBeat 
                key={beat.id} 
                beat={beat} 
                fontSize={fontSize}
                onChange={handleBeatChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
