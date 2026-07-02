import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, X, Loader2, User as UserIcon, Trash2, ShieldAlert, Monitor, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createCard, updateCard, deleteCard } from '../api/cards.api';
import { getAllUsers } from '../api/users.api';
import { useToastStore } from '../store/toast.store';
import useTeamStore from '../store/team.store';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/ui/Modal';
import { debounce } from '../utils/debounce';

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
  const [shakeCreateForm, setShakeCreateForm] = useState(false);

  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardDueDate, setEditCardDueDate] = useState('');
  const [editCardPriority, setEditCardPriority] = useState('MEDIUM');
  const [editCardAssignee, setEditCardAssignee] = useState('');
  const [isDirtyConfirmOpen, setIsDirtyConfirmOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [pendingCardId, setPendingCardId] = useState(() => {
    return new URLSearchParams(window.location.search).get('card')
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const debounced = debounce(check, 150);
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
  }, []);

  const { isConnected } = useWebSocket(id);
  
  const { data: currentUser } = useQuery({ queryKey: ['current-user'] });
  const { teams, activeTeamId } = useTeamStore();
  const activeTeam = teams.find(t => t.teamId === activeTeamId);
  const currentUserTeamRole = activeTeam?.currentUserRole;
  const isTeamAdmin = currentUserTeamRole === 'TEAM_ADMIN';
  const isGlobalAdmin = currentUser?.role === 'ADMIN';
  const isAdmin = isTeamAdmin || isGlobalAdmin;

  const canEditCard = (card) => {
    if (!card || !currentUser) return false;
    return (
      currentUser.role === 'ADMIN' ||
      currentUserTeamRole === 'TEAM_ADMIN' ||
      card.assigneeId === currentUser.id ||
      card.createdBy === currentUser.id
    );
  };

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', Number(id)],
    queryFn: () => getBoardById(id),
    retry: (failureCount, error) => {
      // Don't retry on 403 or 404
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveColumnStatus('TODO');
        setIsCreateCardModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const moveMutation = useMutation({
    mutationFn: moveCard,
    onMutate: async ({ boardId, cardId, shift }) => {
      await queryClient.cancelQueries({ queryKey: ['board', Number(boardId)] });
      const previousBoard = queryClient.getQueryData(['board', Number(boardId)]);
      
      queryClient.setQueryData(['board', Number(boardId)], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(c => String(c.id) === String(cardId) ? { ...c, state: shift } : c)
        };
      });
      return { previousBoard, boardId };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', Number(context.boardId)], context.previousBoard);
      }
      addToast({ type: 'error', message: "Couldn't move card. Try again." });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(variables.boardId)] });
    }
  });

  const createCardMutation = useMutation({
    mutationFn: createCard,
    onMutate: async (newCardData) => {
      await queryClient.cancelQueries({ queryKey: ['board', Number(newCardData.boardId)] });
      const previousBoard = queryClient.getQueryData(['board', Number(newCardData.boardId)]);
      
      queryClient.setQueryData(['board', Number(newCardData.boardId)], (old) => {
        if (!old) return old;
        const optimisticCard = {
          id: Math.random(), // temporary ID
          title: newCardData.title,
          description: newCardData.description,
          dueDate: newCardData.dueDate,
          priority: newCardData.priority,
          state: newCardData.state,
          user: users?.find(u => u.userId === newCardData.assigneeId) || null,
          createdAt: new Date().toISOString()
        };
        return { ...old, cards: [...old.cards, optimisticCard] };
      });
      return { previousBoard, boardId: newCardData.boardId };
    },
    onSuccess: () => {
      setIsCreateCardModalOpen(false);
      setNewCardTitle('');
      setNewCardDescription('');
      setNewCardDueDate('');
      setNewCardPriority('MEDIUM');
      setNewCardAssignee('');
      addToast({ type: 'success', message: 'Card created successfully' });
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', Number(context.boardId)], context.previousBoard);
      }
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create card' });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(variables.boardId)] });
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: updateCard,
    onMutate: async ({ boardId, id: cardId, cardData }) => {
      await queryClient.cancelQueries({ queryKey: ['board', Number(boardId)] });
      const previousBoard = queryClient.getQueryData(['board', Number(boardId)]);
      
      queryClient.setQueryData(['board', Number(boardId)], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(c => String(c.id) === String(cardId) ? { 
            ...c, 
            ...cardData,
            user: users?.find(u => u.userId === cardData.assigneeId) || c.user
          } : c)
        };
      });
      return { previousBoard, boardId };
    },
    onSuccess: () => {
      setIsEditCardModalOpen(false);
      setEditingCard(null);
      addToast({ type: 'success', message: 'Card updated successfully' });
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', Number(context.boardId)], context.previousBoard);
      }
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update card' });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(variables.boardId)] });
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: deleteCard,
    onMutate: async ({ boardId, id: cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['board', Number(boardId)] });
      const previousBoard = queryClient.getQueryData(['board', Number(boardId)]);
      
      queryClient.setQueryData(['board', Number(boardId)], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.filter(c => String(c.id) !== String(cardId))
        };
      });
      return { previousBoard, boardId };
    },
    onSuccess: (data, variables) => {
      setIsEditCardModalOpen(false);
      setEditingCard(null);
      const prevCard = variables.card;
      addToast({ 
        type: 'success', 
        message: 'Card deleted', 
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            createCardMutation.mutate({
              boardId: variables.boardId,
              title: prevCard.title,
              description: prevCard.description,
              dueDate: prevCard.dueDate,
              priority: prevCard.priority,
              state: prevCard.state,
              assigneeId: prevCard.user?.userId
            });
          }
        }
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', Number(context.boardId)], context.previousBoard);
      }
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete card' });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', Number(variables.boardId)] });
    }
  });

  const handleCreateCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) {
      setShakeCreateForm(true);
      setTimeout(() => setShakeCreateForm(false), 500);
      return;
    }

    createCardMutation.mutate({
      boardId: id,
      title: newCardTitle.trim(),
      description: newCardDescription.trim(),
      dueDate: newCardDueDate ? new Date(newCardDueDate).toISOString() : undefined,
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

  useEffect(() => {
    if (!pendingCardId || !board?.cards || board.cards.length === 0) return;
    const target = board.cards.find(c => String(c.id) === String(pendingCardId));
    if (target) {
      handleCardClick(target);
      setPendingCardId(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [board?.cards, pendingCardId]);

  const handleEditModalClose = () => {
    if (!editingCard) {
      setIsEditCardModalOpen(false);
      return;
    }

    const originalTitle = editingCard.title || '';
    const originalDescription = editingCard.description || '';
    const originalDueDate = editingCard.dueDate ? new Date(editingCard.dueDate).toISOString().split('T')[0] : '';
    const originalPriority = editingCard.priority || 'MEDIUM';
    const originalAssignee = editingCard.user?.userId || '';

    const isDirty = 
      editCardTitle !== originalTitle ||
      editCardDescription !== originalDescription ||
      editCardDueDate !== originalDueDate ||
      editCardPriority !== originalPriority ||
      String(editCardAssignee) !== String(originalAssignee);

    if (isDirty) {
      setIsDirtyConfirmOpen(true);
    } else {
      setIsEditCardModalOpen(false);
      setEditingCard(null);
    }
  };

  const handleUpdateCard = (e) => {
    if (e) e.preventDefault();
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
    // Modal closes on success (in onSettled/onSuccess if we had one, but we have onSettled on the mutation. We can just close it here)
    setIsEditCardModalOpen(false);
    setIsDirtyConfirmOpen(false);
    setEditingCard(null);
  };

  const handleDeleteCard = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate({ id: editingCard.id, boardId: id, card: editingCard });
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

    // Remove direct setQueryData here since onMutate in moveMutation handles it

    moveMutation.mutate({
      boardId: id,
      cardId: activeId,
      shift: targetStatus
    });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-secondary">Loading board...</div>;
  }

  if (error) {
    if (error?.response?.status === 403) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-base p-6">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
              <ShieldAlert size={40} />
            </div>
            <h1 className="mb-2 font-display text-3xl font-bold text-primary">Access Denied</h1>
            <p className="mb-8 font-sans text-[15px] text-secondary leading-relaxed">
              You don't have permission to view this board. If you believe this is a mistake, please contact the team administrator to request access.
            </p>
            <Link 
              to="/dashboard"
              className="rounded-lg bg-accent-blue px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      );
    }
    return <div className="flex h-screen items-center justify-center text-accent-red">Error loading board: {error.message}</div>;
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
                cards={cardsByState[col.id] || []}
                onAddCard={openCreateModal}
                onCardClick={handleCardClick}
                isAdmin={isAdmin}
                currentUserId={currentUser?.id}
                canEditCard={canEditCard}
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
              animate={shakeCreateForm ? { x: [-10, 10, -10, 10, -5, 5, 0], scale: 1, opacity: 1, y: 0 } : { scale: 1, opacity: 1, y: 0, x: 0 }}
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
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className={`w-full h-10 bg-surface border ${shakeCreateForm && !newCardTitle.trim() ? 'border-red-500' : 'border-subtle'} rounded-lg px-3 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors mb-4`}
                    placeholder="e.g. Implement Login API"
                  />

                  <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                    Description
                  </label>
                  <textarea
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
            onClick={handleEditModalClose}
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
                  onClick={handleEditModalClose}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="overflow-y-auto">
                {canEditCard(editingCard) ? (
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
                          onClick={handleEditModalClose}
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
                ) : (
                  <div className="p-5">
                    <div className="flex items-center gap-2 bg-surface px-3.5 py-2 mb-5 border-b border-dim rounded-md">
                      <Lock size={14} className="text-muted" />
                      <span className="font-sans font-normal text-[13px] text-muted">You can view this card but can't edit it</span>
                    </div>

                    <div className="mb-6">
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-1">
                        Title
                      </label>
                      <h3 className="font-sans text-[15px] font-medium text-primary">
                        {editingCard.title}
                      </h3>
                    </div>

                    <div className="mb-6">
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-1">
                        Description
                      </label>
                      <div className="font-sans text-[14px] text-primary whitespace-pre-wrap leading-relaxed">
                        {editingCard.description || <span className="text-muted italic">No description provided</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                          Due Date
                        </label>
                        <div className="font-sans text-[14px] text-primary bg-surface px-3 py-2 rounded-md inline-block">
                          {editingCard.dueDate ? new Date(editingCard.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                      <div>
                        <label className="block font-sans font-medium text-[13px] text-secondary mb-2">
                          Priority
                        </label>
                        <div className="font-sans text-[14px] text-primary bg-surface px-3 py-2 rounded-md inline-block">
                          {editingCard.priority || 'MEDIUM'}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block font-sans font-medium text-[13px] text-secondary mb-2 flex items-center gap-1.5">
                        <UserIcon size={14} /> Assignee
                      </label>
                      <div className="font-sans text-[14px] text-primary bg-surface px-3 py-2 rounded-md inline-block">
                        {editingCard.assigneeUsername || 'Unassigned'}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-dim mt-2">
                      <button
                        type="button"
                        onClick={handleEditModalClose}
                        className="h-9 px-4 rounded-md font-sans font-medium text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Confirmation Modal */}
      <Modal 
        isOpen={isDirtyConfirmOpen} 
        onClose={() => setIsDirtyConfirmOpen(false)}
        title="Unsaved Changes"
      >
        <div className="p-5">
          <p className="font-sans text-[14px] text-secondary mb-6 leading-relaxed">
            You have unsaved changes on this card. What would you like to do?
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => {
                setIsDirtyConfirmOpen(false);
                setIsEditCardModalOpen(false);
                setEditingCard(null);
              }}
              className="h-10 px-4 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 active:scale-[0.98] font-sans font-medium text-[13px] transition-colors order-3 sm:order-1"
            >
              Discard changes
            </button>
            <button
              onClick={() => setIsDirtyConfirmOpen(false)}
              className="h-10 px-4 rounded-md border border-subtle text-primary hover:bg-hover active:scale-[0.98] font-sans font-medium text-[13px] transition-colors order-2 sm:order-2"
            >
              Keep editing
            </button>
            <button
              onClick={(e) => {
                handleUpdateCard(e);
              }}
              className="h-10 px-4 rounded-md bg-accent-blue text-white hover:bg-[#3d7ae6] active:scale-[0.98] font-sans font-medium text-[13px] shadow-sm transition-all order-1 sm:order-3"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Mobile View Overlay */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-base/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            style={{ top: '64px' }} /* Push down below topbar */
          >
            <Monitor size={48} className="text-muted mb-4" />
            <h2 className="font-sans font-medium text-[16px] text-secondary max-w-[250px] leading-relaxed">
              Switch to desktop for the best experience
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Board;
