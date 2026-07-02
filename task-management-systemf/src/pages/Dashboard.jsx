import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, Clock, Users, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useToastStore } from '../store/toast.store';
import useTeamStore from '../store/team.store';
import { useWebSocket } from '../hooks/useWebSocket';
import Topbar from '../components/layout/Topbar';

const fetchBoards = async (teamId) => {
  if (!teamId) return [];
  const { data } = await api.get(`/teams/${teamId}/boards`);
  return data;
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const queryClient = useQueryClient();
  const addToast = useToastStore(state => state.addToast);
  const { teams, activeTeamId } = useTeamStore();
  const { data: user } = useQuery({ queryKey: ['current-user'] });

  const activeTeam = teams.find(t => t.teamId === activeTeamId);
  const isTeamAdmin = activeTeam?.currentUserRole === 'TEAM_ADMIN';
  const isGlobalAdmin = user?.role === 'ADMIN';
  const canCreateBoard = isTeamAdmin || isGlobalAdmin;

  useWebSocket(null, activeTeamId);

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards', activeTeamId],
    queryFn: () => fetchBoards(activeTeamId),
    enabled: !!activeTeamId,
  });

  const createMutation = useMutation({
    mutationFn: async ({ boardname, description }) => {
      const { data } = await api.post(`/teams/${activeTeamId}/boards`, { boardname, description });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', activeTeamId] });
      setIsModalOpen(false);
      setNewBoardName('');
      setNewBoardDescription('');
      addToast({ type: 'success', message: 'Board created successfully' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create board' });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newBoardName.trim() && newBoardDescription.trim()) {
      createMutation.mutate({ 
        boardname: newBoardName.trim(), 
        description: newBoardDescription.trim() 
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <>
      <Topbar />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-base">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display font-semibold text-2xl text-primary mb-2">Recent Boards</h2>
            <p className="font-sans text-[14px] text-secondary">Manage your active projects and teams.</p>
          </div>

          {isLoading || !activeTeamId ? (
            <div className="flex items-center gap-2 text-secondary font-sans text-sm">
              <Loader2 size={16} className="animate-spin" />
              {activeTeamId ? 'Loading boards...' : 'Select a team...'}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {/* Create New Board Card */}
              {canCreateBoard && (
                <motion.button
                  variants={itemVariants}
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex h-[160px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-dim bg-surface hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base shadow-sm group-hover:scale-110 group-hover:bg-accent-blue group-hover:text-white transition-all text-secondary">
                    <Plus size={20} />
                  </div>
                  <span className="font-sans font-medium text-[14px] text-secondary group-hover:text-primary">Create New Board</span>
                </motion.button>
              )}

              {/* Board Cards */}
              {boards?.map((board) => (
                <motion.div variants={itemVariants} key={board.boardId}>
                  <Link
                    to={`/board/${board.boardId}`}
                    className="group block h-36 bg-elevated border border-subtle hover:border-moderate rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-secondary group-hover:text-accent-blue transition-colors duration-200">
                          <LayoutGrid size={16} />
                        </div>
                        <h3 className="font-display font-medium text-[16px] text-primary truncate">
                          {board.boardname}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-muted">
                          <Clock size={13} />
                          <span className="font-mono text-[11px]">
                            {board.updatedAt 
                              ? `Updated ${formatDistanceToNow(new Date(board.updatedAt.endsWith('Z') ? board.updatedAt : board.updatedAt + 'Z'), { addSuffix: true })}`
                              : 'Updated just now'}
                          </span>
                        </div>
                        <div className="flex -space-x-1.5">
                           <div className="w-5 h-5 rounded-full bg-surface border border-subtle flex items-center justify-center">
                             <Users size={10} className="text-muted" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-void/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-elevated border border-subtle rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 px-5 border-b border-dim flex items-center justify-between">
                <h3 className="font-display font-medium text-[16px] text-primary">Create Board</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-5">
                <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4"
                  placeholder="e.g. Q3 Roadmap"
                />

                <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                  Description
                </label>
                <div className="relative mb-6">
                  <textarea
                    required
                    maxLength={255}
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full h-24 bg-surface border border-subtle rounded-lg p-3 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none"
                    placeholder="What is this board for?"
                  />
                  {newBoardDescription.length >= 255 && (
                    <p className="absolute -bottom-5 left-0 text-red-500 text-[11px] font-sans">
                      Description has reached the limit of 255 characters.
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-9 px-4 rounded-md font-sans font-medium text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="h-9 px-4 rounded-md bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-medium text-[13px] shadow-sm flex items-center gap-2 transition-all"
                  >
                    {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    Create Board
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
