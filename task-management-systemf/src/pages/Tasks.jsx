import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUserTasks } from '../api/tasks.api';
import Topbar from '../components/layout/Topbar';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const Tasks = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['user-tasks'],
    queryFn: getAllUserTasks,
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-secondary">Loading tasks...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Failed to load tasks</div>;
  }

  const leftContent = (
    <h1 className="font-sans font-semibold text-[15px] text-primary">My Tasks</h1>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
      case 'LOW': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-secondary bg-hover';
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case 'TODO': return 'border-secondary/30 text-secondary';
      case 'IN_PROGRESS': return 'border-primary/50 text-primary';
      case 'DONE': return 'border-green-500/50 text-green-500';
      default: return 'border-secondary/30 text-secondary';
    }
  };

  return (
    <>
      <Topbar leftContent={leftContent} />
      <main className="flex-1 overflow-y-auto p-8 bg-base">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tight">Your Work</h2>
              <p className="text-secondary mt-1 text-sm">Here are all the tasks assigned to you across all boards.</p>
            </div>
            <div className="text-sm font-medium text-secondary">
              {tasks?.length || 0} tasks
            </div>
          </div>
          
          <div className="grid gap-4 mt-8">
            {tasks?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-divider rounded-xl">
                <p className="text-secondary">You don't have any tasks assigned to you right now.</p>
              </div>
            ) : (
              tasks?.map((task) => (
                <div 
                  key={task.id} 
                  className="group relative flex items-center justify-between p-4 bg-surface border border-divider rounded-xl hover:border-primary/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full border ${getStatusColor(task.state)}`}>
                      {task.state.replace('_', ' ')}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-primary mb-1 group-hover:text-primary transition-colors">{task.title}</h3>
                      <div className="flex items-center gap-3 text-[13px] text-secondary">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="opacity-70" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        {task.boardId && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                            Board #{task.boardId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {task.labels?.map((label, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs font-medium bg-hover text-secondary rounded">
                        {label}
                      </span>
                    ))}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      <AlertCircle size={14} />
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Tasks;
