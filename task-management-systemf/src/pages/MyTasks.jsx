import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isBefore, isToday, parseISO, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { getMyTasks } from '../api/users.api';
import Topbar from '../components/layout/Topbar';
import { cn } from '../utils/cn';

const priorityColors = {
  LOW: 'bg-surface border-subtle',
  MEDIUM: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  HIGH: 'bg-accent-red/10 text-accent-red border-accent-red/20',
  URGENT: 'bg-accent-red/20 text-accent-red font-bold border-accent-red/30',
};

const statusColors = {
  TODO: 'bg-accent-blue/10 text-accent-blue',
  IN_PROGRESS: 'bg-accent-amber/10 text-accent-amber',
  DONE: 'bg-accent-emerald/10 text-accent-emerald',
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'DONE': return 'Done';
    default: return status;
  }
};

const getUrgencyScore = (card) => {
  if (!card.dueDate) return 4; // Lowest urgency
  const date = parseISO(card.dueDate);
  const today = startOfDay(new Date());
  
  if (isBefore(date, today)) return 1; // Overdue
  if (isToday(date)) return 2; // Due Today
  return 3; // Upcoming
};

const MyTasks = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
  });

  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');

  const boards = useMemo(() => {
    if (!tasks) return [];
    const uniqueBoards = new Map();
    tasks.forEach(task => {
      if (!uniqueBoards.has(task.boardId)) {
        uniqueBoards.set(task.boardId, task.boardName || `Board #${task.boardId}`);
      }
    });
    return Array.from(uniqueBoards.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    let filtered = tasks;
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    if (boardFilter !== 'ALL') {
      filtered = filtered.filter(t => String(t.boardId) === boardFilter);
    }
    
    return [...filtered].sort((a, b) => {
      // Sort by urgency category first
      const urgencyA = getUrgencyScore(a);
      const urgencyB = getUrgencyScore(b);
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      
      // If same urgency category, sort by date
      if (a.dueDate && b.dueDate) {
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      }
      
      // Finally, sort by priority
      const pMap = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      return (pMap[a.priority] || 5) - (pMap[b.priority] || 5);
    });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-base">
        <Topbar />
        <div className="flex flex-1 items-center justify-center text-secondary">
          <Loader2 size={24} className="animate-spin mr-2" />
          Loading your tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-base">
        <Topbar />
        <div className="flex flex-1 items-center justify-center text-accent-red gap-2">
          <AlertCircle size={24} />
          Error loading tasks: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base">
      <Topbar />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-2xl text-primary mb-2">My Tasks</h2>
              <p className="font-sans text-[14px] text-secondary">A unified view of everything assigned to you across all boards.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm"
              >
                <option value="ALL">All Boards</option>
                {boards.map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-dim overflow-hidden shadow-sm">
            <table className="w-full text-left font-sans">
              <thead className="bg-elevated border-b border-dim text-[12px] uppercase text-muted font-semibold tracking-wider">
                <tr>
                  <th className="w-2 pl-4 py-3"></th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3 hidden md:table-cell">Board</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dim text-[14px]">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-secondary">
                      You have no tasks assigned to you right now. You're all caught up!
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => {
                    const urgency = getUrgencyScore(task);
                    const isOverdue = urgency === 1 && task.state !== 'DONE';
                    const isDueToday = urgency === 2 && task.state !== 'DONE';
                    
                    return (
                      <tr 
                        key={task.id} 
                        className="group hover:bg-hover/50 transition-colors"
                      >
                        {/* Priority indicator bar */}
                        <td className="w-2 pl-4 py-0 h-full">
                          <div className={cn(
                            "h-[40px] w-1 rounded-full",
                            task.priority === 'URGENT' || task.priority === 'HIGH' ? "bg-accent-red" :
                            task.priority === 'MEDIUM' ? "bg-accent-amber" : "bg-dim"
                          )} />
                        </td>
                        
                        {/* Title */}
                        <td className="px-4 py-3">
                          <Link 
                            to={`/board/${task.boardId}?card=${task.id}`}
                            className="font-medium text-primary hover:text-accent-blue transition-colors block"
                          >
                            {task.title}
                          </Link>
                        </td>

                        {/* Board */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Link to={`/board/${task.boardId}?card=${task.id}`}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-dim/40 border border-dim text-secondary hover:bg-dim hover:text-primary transition-colors cursor-pointer">
                              {task.boardName || `Board #${task.boardId}`}
                            </span>
                          </Link>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-3">
                          <div className={cn(
                            "flex items-center gap-1.5 text-[13px] font-medium",
                            isOverdue ? "text-accent-red" : 
                            isDueToday ? "text-accent-amber" : 
                            "text-secondary"
                          )}>
                            <Clock size={14} className={isOverdue || isDueToday ? "opacity-100" : "opacity-60"} />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide",
                            statusColors[task.state]
                          )}>
                            {getStatusLabel(task.state)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
