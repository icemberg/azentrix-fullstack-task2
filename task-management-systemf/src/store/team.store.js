import { create } from 'zustand';
import { teamApi } from '../api/teams.api';

const useTeamStore = create((set, get) => ({
    teams: [],
    activeTeamId: null,
    members: {},
    invitations: {},
    isLoading: false,
    error: null,

    fetchTeams: async () => {
        set({ isLoading: true, error: null });
        try {
            const teams = await teamApi.getUserTeams();
            set({ teams, isLoading: false });
            
            // Auto-select personal workspace if no active team
            if (!get().activeTeamId && teams.length > 0) {
                const personal = teams.find(t => t.isPersonal) || teams[0];
                set({ activeTeamId: personal.teamId });
            }
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load teams', isLoading: false });
        }
    },

    setActiveTeam: (teamId) => set({ activeTeamId: teamId }),

    createTeam: async (teamData) => {
        try {
            const newTeam = await teamApi.createTeam(teamData);
            set((state) => ({ 
                teams: [...state.teams, newTeam],
                activeTeamId: newTeam.teamId
            }));
            return newTeam;
        } catch (error) {
            throw error;
        }
    },

    fetchMembers: async (teamId) => {
        try {
            const teamMembers = await teamApi.getTeamMembers(teamId);
            set((state) => ({
                members: { ...state.members, [teamId]: teamMembers }
            }));
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    },

    fetchInvitations: async (teamId) => {
        try {
            const pendingInvs = await teamApi.getPendingInvitations(teamId);
            set((state) => ({
                invitations: { ...state.invitations, [teamId]: pendingInvs }
            }));
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        }
    },

    // Optimistic UI actions for real-time
    addMemberToState: (teamId, member) => {
        set((state) => {
            const currentMembers = state.members[teamId] || [];
            if (!currentMembers.find(m => m.userId === member.userId)) {
                return { members: { ...state.members, [teamId]: [...currentMembers, member] } };
            }
            return state;
        });
    },

    removeMemberFromState: (teamId, userId) => {
        set((state) => ({
            members: {
                ...state.members,
                [teamId]: (state.members[teamId] || []).filter(m => m.userId !== userId)
            }
        }));
    },
    
    updateMemberRoleInState: (teamId, userId, newRole) => {
        set((state) => ({
            members: {
                ...state.members,
                [teamId]: (state.members[teamId] || []).map(m => m.userId === userId ? { ...m, role: newRole } : m)
            }
        }));
    }
}));

export default useTeamStore;
