import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getBoardById } from '../api/boards.api';
import { moveCard } from '../api/cards.api';
import { useWebSocket } from '../hooks/useWebSocket';
import Topbar from '../components/layout/Topbar';
import Column from '../components/board/Column';
import CardItem from '../components/board/CardItem';
import { ArrowLeft, X, Loader2, User as UserIcon, Trash2 } from 'lucide-react';
import { createCard, updateCard, deleteCard } from '../api/cards.api';
import { getAllUsers } from '../api/users.api';
import { useToastStore } from '../store/toast.store';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' }
];

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore(state => state.addToast);
  const [activeCard, setActiveCard] = useState(null);
  
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [activeColumnStatus, setActiveColumnStatus] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [newCardPriority, setNewCardPriority] = useState('MEDIUM');
  const [newCardAssignee, setNewCardAssignee] = useState('');

  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardDueDate, setEditCardDueDate] = useState('');
  const [editCardPriority, setEditCardPriority] = useState('MEDIUM');
  const [editCardAssignee, setEditCardAssignee] = useState('');

  const { isConnected } = useWebSocket(id);

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', Number(id)],
    queryFn: () => getBoardById(id),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const moveMutation = useMutation({
    mutationFn: moveCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(id)] });
    }
  });

  const createCardMutation = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(id)] });
      setIsCreateCardModalOpen(false);
      setNewCardTitle('');
      setNewCardDescription('');
      setNewCardDueDate('');
      setNewCardPriority('MEDIUM');
      setNewCardAssignee('');
      addToast({ type: 'success', message: 'Card created successfully' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create card' });
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: updateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(id)] });
      setIsEditCardModalOpen(false);
      setEditingCard(null);
      addToast({ type: 'success', message: 'Card updated successfully' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update card' });
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(id)] });
      setIsEditCardModalOpen(false);
      setEditingCard(null);
      addToast({ type: 'success', message: 'Card deleted successfully' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete card' });
    }
  });

  const handleCreateCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !newCardDueDate) return;

    createCardMutation.mutate({
      boardId: id,
      title: newCardTitle.trim(),
      description: newCardDescription.trim(),
      dueDate: new Date(newCardDueDate).toISOString(),
      priority: newCardPriority,
      state: activeColumnStatus,
      assigneeId: newCardAssignee ? Number(newCardAssignee) : undefined
    });
  };

  const openCreateModal = (status) => {
    setActiveColumnStatus(status);
    setIsCreateCardModalOpen(true);
  };

  const handleCardClick = (card) => {
    setEditingCard(card);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description || '');
    setEditCardDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    setEditCardPriority(card.priority);
    setEditCardAssignee(card.user?.userId || ''); // Assuming user holds assignee info, backend assigns to user.userId if not set
    setIsEditCardModalOpen(true);
  };

  const handleUpdateCard = (e) => {
    e.preventDefault();
    if (!editCardTitle.trim() || !editCardDueDate) return;

    updateCardMutation.mutate({
      id: editingCard.id,
      boardId: id,
      cardData: {
        title: editCardTitle.trim(),
        description: editCardDescription.trim(),
        dueDate: new Date(editCardDueDate).toISOString(),
        priority: editCardPriority,
        state: editingCard.state,
        assigneeId: editCardAssignee ? Number(editCardAssignee) : undefined,
        boardId: id
      }
    });
  };

  const handleDeleteCard = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate({ id: editingCard.id, boardId: id });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveCard(active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determine the target status (either a column id or the status of the card we dropped over)
    const activeCardData = active.data.current;
    let targetStatus = null;
    
    if (COLUMNS.find(c => c.id === overId)) {
      targetStatus = overId;
    } else {
      const overCardData = over.data.current;
      targetStatus = overCardData?.state;
    }

    if (!targetStatus || activeCardData.state === targetStatus) return;

    // Optimistic update
    queryClient.setQueryData(['board', Number(id)], (old) => {
      if (!old) return old;
      const newCards = old.cards.map(c => 
        c.id === activeId ? { ...c, state: targetStatus } : c
      );
      return { ...old, cards: newCards };
    });

    moveMutation.mutate({
      boardId: id,
      cardId: activeId,
      shift: targetStatus
    });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-secondary">Loading board...</div>;
  }

  const cardsByState = {
    TODO: board?.cards?.filter(c => c.state === 'TODO') || [],
    IN_PROGRESS: board?.cards?.filter(c => c.state === 'IN_PROGRESS') || [],
    DONE: board?.cards?.filter(c => c.state === 'DONE') || []
  };

  const leftContent = (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => navigate('/dashboard')}
        className="w-8 h-8 flex items-center justify-center rounded-md text-secondary hover:text-primary hover:bg-hover transition-colors"
      >
        <ArrowLeft size={16} />
      </button>
      <div className="h-4 w-px bg-dim" />
      <h1 className="font-sans font-semibold text-[15px] text-primary">{board?.boardname}</h1>
    </div>
  );

  return (
    <>
      <Topbar leftContent={leftContent} />
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-base">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full items-start gap-6">
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                title={col.title}
                status={col.id}
                cards={cardsByState[col.id]}
                onAddCard={openCreateModal}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <CardItem card={activeCard} onClick={() => {}} isOverlay={true} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Create Card Modal */}
      <AnimatePresence>
        {isCreateCardModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-void/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsCreateCardModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-elevated border border-subtle rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 px-5 border-b border-dim flex items-center justify-between shrink-0">
                <h3 className="font-display font-medium text-[16px] text-primary">Create Card</h3>
                <button 
                  onClick={() => setIsCreateCardModalOpen(false)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="overflow-y-auto">
                <form onSubmit={handleCreateCard} className="p-5">
                  <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4"
                    placeholder="e.g. Implement Login API"
                  />

                  <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    className="w-full h-24 bg-surface border border-subtle rounded-lg p-3 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4 resize-none"
                    placeholder="Card details..."
                  />

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newCardDueDate}
                        onChange={(e) => setNewCardDueDate(e.target.value)}
                        className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                        Priority
                      </label>
                      <select
                        value={newCardPriority}
                        onChange={(e) => setNewCardPriority(e.target.value)}
                        className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block font-sans font-medium text-[13px] text-secondary mb-2 flex items-center gap-1.5">
                      <UserIcon size={14} /> Assignee
                    </label>
                    <select
                      value={newCardAssignee}
                      onChange={(e) => setNewCardAssignee(e.target.value)}
                      className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    >
                      <option value="">Unassigned (Defaults to you)</option>
                      {users?.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-dim mt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateCardModalOpen(false)}
                      className="h-9 px-4 rounded-md font-sans font-medium text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createCardMutation.isPending}
                      className="h-9 px-4 rounded-md bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-medium text-[13px] shadow-sm flex items-center gap-2 transition-all"
                    >
                      {createCardMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Create Card
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Card Modal */}
      <AnimatePresence>
        {isEditCardModalOpen && editingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-void/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsEditCardModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-elevated border border-subtle rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 px-5 border-b border-dim flex items-center justify-between shrink-0">
                <h3 className="font-display font-medium text-[16px] text-primary">Edit Card</h3>
                <button 
                  onClick={() => setIsEditCardModalOpen(false)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="overflow-y-auto">
                <form onSubmit={handleUpdateCard} className="p-5">
                  <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editCardTitle}
                    onChange={(e) => setEditCardTitle(e.target.value)}
                    className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4"
                  />

                  <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={editCardDescription}
                    onChange={(e) => setEditCardDescription(e.target.value)}
                    className="w-full h-24 bg-surface border border-subtle rounded-lg p-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={editCardDueDate}
                        onChange={(e) => setEditCardDueDate(e.target.value)}
                        className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                        Priority
                      </label>
                      <select
                        value={editCardPriority}
                        onChange={(e) => setEditCardPriority(e.target.value)}
                        className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block font-sans font-medium text-[13px] text-secondary mb-2 flex items-center gap-1.5">
                      <UserIcon size={14} /> Assignee
                    </label>
                    <select
                      value={editCardAssignee}
                      onChange={(e) => setEditCardAssignee(e.target.value)}
                      className="w-full h-10 bg-surface border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {users?.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-dim mt-2">
                    <button
                      type="button"
                      onClick={handleDeleteCard}
                      disabled={deleteCardMutation.isPending}
                      className="h-9 px-3 rounded-md text-accent-red hover:bg-accent-red/10 flex items-center gap-2 font-sans font-medium text-[13px] transition-colors"
                    >
                      {deleteCardMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditCardModalOpen(false)}
                        className="h-9 px-4 rounded-md font-sans font-medium text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateCardMutation.isPending}
                        className="h-9 px-4 rounded-md bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-medium text-[13px] shadow-sm flex items-center gap-2 transition-all"
                      >
                        {updateCardMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Board;
