import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/teams.api';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import useTeamStore from '../store/team.store';
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Invite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const { fetchTeams, setActiveTeam } = useTeamStore();
  const queryClient = useQueryClient();

  const { data: invite, isLoading, isError, error } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => teamApi.getInvitationDetails(token),
    retry: false
  });

  const acceptMutation = useMutation({
    mutationFn: () => teamApi.acceptInvitation(token),
    onSuccess: async (team) => {
      await fetchTeams();
      setActiveTeam(team.teamId);
      queryClient.invalidateQueries(['teams']);
      addToast({ type: 'success', message: `Joined ${team.name} successfully!` });
      navigate('/dashboard');
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to join team' });
    }
  });

  const handleAccept = () => {
    if (!isAuthenticated) {
      addToast({ type: 'warning', message: 'You must log in or register first to accept this invitation' });
      navigate('/login'); // We could pass a returnUrl in state to come back here
      return;
    }
    acceptMutation.mutate();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-base p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-dim rounded-2xl shadow-2xl p-8 text-center"
      >
        <img src="/favicon.svg" alt="TaskFlow" className="w-12 h-12 rounded-[12px] shadow-glow-blue object-contain bg-white p-1 mb-6" />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-secondary">
            <Loader2 size={32} className="animate-spin text-accent-blue" />
            <p className="font-sans">Loading invitation details...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <h2 className="font-display font-semibold text-xl text-primary">Invalid Invitation</h2>
            <p className="font-sans text-secondary">{error.response?.data?.message || 'This invitation link is invalid or has expired.'}</p>
            <Link to="/" className="mt-4 text-accent-blue hover:underline text-[14px]">Return to Home</Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="font-display font-semibold text-2xl text-primary mb-2">You're Invited!</h2>
            <p className="font-sans text-[15px] text-secondary mb-8">
              <strong className="text-primary">{invite.invitedBy}</strong> has invited you to join <strong className="text-primary">{invite.teamName}</strong>.
            </p>
            
            {!isAuthenticated ? (
              <div className="w-full space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-[13px] text-left">
                  You need an account matching <strong>{invite.invitedEmail}</strong> to accept this invitation.
                </div>
                <Link 
                  to="/register" 
                  state={{ from: { pathname: `/invite/${token}` } }}
                  className="w-full h-11 bg-primary text-base flex items-center justify-center rounded-lg font-medium transition-transform hover:scale-[1.02]"
                >
                  Create an account
                </Link>
                <Link 
                  to="/login" 
                  state={{ from: { pathname: `/invite/${token}` } }}
                  className="w-full h-11 border border-dim text-primary flex items-center justify-center rounded-lg font-medium transition-colors hover:bg-hover"
                >
                  Log in
                </Link>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="w-full h-11 bg-accent-blue hover:bg-[#3d7ae6] text-white flex items-center justify-center gap-2 rounded-lg font-medium transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {acceptMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Accept Invitation
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Invite;
