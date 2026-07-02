import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

const Column = ({ title, status, cards, onAddCard, onCardClick, isAdmin, currentUserId, canEditCard }) => {
  const parentRef = useRef(null);

  const { setNodeRef } = useDroppable({
    id: status,
  });

  const shouldVirtualise = cards.length >= 50;

  const virtualizer = useVirtualizer({
    count: shouldVirtualise ? cards.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 5,
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
        ref={(node) => {
          parentRef.current = node;
          setNodeRef(node);
        }}
        style={{ height: 'calc(100dvh - 244px)', overflowY: 'auto' }}
        className="flex flex-col p-3"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {shouldVirtualise ? (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const card = cards[virtualItem.index];
                const canEdit = canEditCard ? canEditCard(card) : (isAdmin || card.assigneeId === currentUserId);
                return (
                  <div
                    key={card.id}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '12px',
                    }}
                  >
                    <CardItem card={card} onClick={onCardClick} canEdit={canEdit} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cards.map(card => {
                const canEdit = canEditCard ? canEditCard(card) : (isAdmin || card.assigneeId === currentUserId);
                return (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    onClick={onCardClick} 
                    canEdit={canEdit} 
                  />
                );
              })}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
