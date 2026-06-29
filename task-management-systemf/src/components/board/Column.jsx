import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import CardItem from './CardItem';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const columnColors = {
  TODO: 'bg-accent-blue/10 text-accent-blue',
  IN_PROGRESS: 'bg-accent-amber/10 text-accent-amber',
  DONE: 'bg-accent-emerald/10 text-accent-emerald',
};

const Column = ({ title, status, cards, onAddCard, onCardClick }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex max-h-full w-80 shrink-0 flex-col rounded-xl bg-surface border border-dim shadow-sm">
      <div className="rounded-t-xl p-4 border-b border-dim flex items-center justify-between shrink-0">
        <h3 className="font-sans font-semibold text-[14px] text-primary flex items-center gap-2">
          {title}
          <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[11px] font-mono", columnColors[status])}>
            {cards.length}
          </span>
        </h3>
        <button 
          onClick={() => onAddCard(status)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 min-h-0"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card.id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
