import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'danger',
  URGENT: 'danger',
};

const CardItem = ({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { ...card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 rounded-lg border bg-elevated p-4 transition-all duration-200",
        isDragging 
          ? "border-accent-blue shadow-glow-blue z-50 rotate-3 opacity-90 scale-[1.02]" 
          : "border-subtle hover:border-moderate hover:-translate-y-[2px] shadow-sm hover:shadow-md"
      )}
      onClick={() => onClick(card)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {card.labels?.map((label, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded-md bg-surface border border-subtle font-sans text-[11px] font-medium text-secondary">
              {label}
            </span>
          ))}
          <span className={cn(
            "px-1.5 py-0.5 rounded-md font-sans text-[11px] font-medium border",
            card.priority === 'HIGH' || card.priority === 'URGENT' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' :
            card.priority === 'MEDIUM' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' :
            'bg-surface text-secondary border-subtle'
          )}>
            {card.priority}
          </span>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted hover:text-primary active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
      </div>

      <div>
        <h4 className="font-sans text-[14px] font-medium text-primary leading-snug">
          {card.title}
        </h4>
        {card.description && (
          <p className="mt-1.5 font-sans text-[12px] text-secondary line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted">
          <Clock size={13} />
          <span className="font-mono text-[11px] font-medium">{format(new Date(card.dueDate), 'MMM d')}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-surface border border-subtle flex items-center justify-center">
          <span className="font-display font-bold text-[10px] text-secondary">
            {card.user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
