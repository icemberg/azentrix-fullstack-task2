import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/teams.api';
import useTeamStore from '../store/team.store';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import Topbar from '../components/layout/Topbar';
import { Mail, Shield, UserX, Plus, Loader2 } from 'lucide-react';

const Teams = () => {
  const { activeTeamId, teams, setActiveTeam } = useTeamStore();
  const { user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');

  const activeTeam = teams.find(t => t.teamId === activeTeamId);
  const isAdmin = activeTeam?.currentUserRole === 'TEAM_ADMIN';

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['teamMembers', activeTeamId],
    queryFn: () => teamApi.getTeamMembers(activeTeamId),
    enabled: !!activeTeamId,
  });

  const { data: invitations, isLoading: loadingInvites } = useQuery({
    queryKey: ['teamInvitations', activeTeamId],
    queryFn: () => teamApi.getPendingInvitations(activeTeamId),
    enabled: !!activeTeamId && isAdmin,
  });

  const inviteMutation = useMutation({
    mutationFn: (email) => teamApi.createInvitation(activeTeamId, email),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamInvitations', activeTeamId]);
      setInviteEmail('');
      addToast({ type: 'success', message: 'Invitation sent' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to send invite' });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => teamApi.removeMember(activeTeamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers', activeTeamId]);
      addToast({ type: 'success', message: 'Member removed' });
    }
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (inviteId) => teamApi.revokeInvitation(activeTeamId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamInvitations', activeTeamId]);
      addToast({ type: 'success', message: 'Invitation revoked' });
    }
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteMutation.mutate(inviteEmail.trim());
    }
  };

  if (!activeTeamId) {
    return (
      <>
        <Topbar />
        <div className="flex-1 p-8 bg-base flex items-center justify-center">
          <p className="text-secondary font-sans">Select a team from the sidebar to manage.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-base">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display font-semibold text-2xl text-primary mb-2">Team Settings: {activeTeam?.name}</h2>
            <p className="font-sans text-[14px] text-secondary">Manage members and invitations for this workspace.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Members List */}
              <div className="bg-surface border border-dim rounded-xl p-5">
                <h3 className="font-display font-medium text-[16px] text-primary mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-accent-blue" />
                  Team Members
                </h3>
                
                {loadingMembers ? (
                  <div className="flex items-center gap-2 text-secondary text-sm">
                    <Loader2 size={16} className="animate-spin" /> Loading members...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members?.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border border-subtle bg-elevated">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold text-sm">
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-sans font-medium text-[14px] text-primary">{member.username}</p>
                            <p className="font-sans text-[12px] text-secondary">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[11px] px-2 py-1 rounded font-medium ${
                            member.role === 'TEAM_ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {member.role.replace('TEAM_', '')}
                          </span>
                          
                          {isAdmin && member.userId !== user.userId && (
                            <button
                              onClick={() => removeMemberMutation.mutate(member.userId)}
                              className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                              title="Remove Member"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Invites Sidebar */}
            {isAdmin && (
              <div className="space-y-6">
                <div className="bg-surface border border-dim rounded-xl p-5">
                  <h3 className="font-display font-medium text-[16px] text-primary mb-4">Invite Member</h3>
                  <form onSubmit={handleInvite} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full h-10 bg-elevated border border-subtle rounded-lg px-3 font-sans text-[14px] text-primary focus:border-accent-blue outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={inviteMutation.isPending}
                      className="w-full h-10 bg-accent-blue hover:bg-[#3d7ae6] text-white rounded-lg font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {inviteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Send Invitation
                    </button>
                  </form>
                </div>

                <div className="bg-surface border border-dim rounded-xl p-5">
                  <h3 className="font-display font-medium text-[16px] text-primary mb-4">Pending Invites</h3>
                  {loadingInvites ? (
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Loader2 size={14} className="animate-spin" /> Loading...
                    </div>
                  ) : invitations?.length === 0 ? (
                    <p className="text-secondary text-[13px]">No pending invitations.</p>
                  ) : (
                    <div className="space-y-2">
                      {invitations?.map(inv => (
                        <div key={inv.id} className="flex flex-col gap-2 p-2.5 rounded-lg border border-subtle bg-elevated">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[13px] text-primary truncate" title={inv.invitedEmail}>
                              {inv.invitedEmail}
                            </span>
                            <button
                              onClick={() => revokeInviteMutation.mutate(inv.id)}
                              className="text-muted hover:text-red-500 transition-colors"
                              title="Revoke"
                            >
                              <UserX size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted">
                            <Mail size={12} />
                            <span className="text-[11px]">Sent by {inv.invitedBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Teams;
