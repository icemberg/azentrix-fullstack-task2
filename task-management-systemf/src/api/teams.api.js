import axiosInstance from './axios';

export const teamApi = {
    getUserTeams: async () => {
        const response = await axiosInstance.get('/teams');
        return response.data;
    },

    getTeam: async (teamId) => {
        const response = await axiosInstance.get(`/teams/${teamId}`);
        return response.data;
    },

    createTeam: async (teamData) => {
        const response = await axiosInstance.post('/teams', teamData);
        return response.data;
    },

    updateTeam: async (teamId, teamData) => {
        const response = await axiosInstance.patch(`/teams/${teamId}`, teamData);
        return response.data;
    },

    deleteTeam: async (teamId) => {
        const response = await axiosInstance.delete(`/teams/${teamId}`);
        return response.data;
    },

    getTeamMembers: async (teamId) => {
        const response = await axiosInstance.get(`/teams/${teamId}/members`);
        return response.data;
    },

    updateMemberRole: async (teamId, userId, role) => {
        const response = await axiosInstance.patch(`/teams/${teamId}/members/${userId}`, { role });
        return response.data;
    },

    removeMember: async (teamId, userId) => {
        const response = await axiosInstance.delete(`/teams/${teamId}/members/${userId}`);
        return response.data;
    },

    leaveTeam: async (teamId) => {
        const response = await axiosInstance.post(`/teams/${teamId}/leave`);
        return response.data;
    },

    // Boards in team
    createBoard: async (teamId, boardData) => {
        const response = await axiosInstance.post(`/teams/${teamId}/boards`, boardData);
        return response.data;
    },

    // Invitations
    createInvitation: async (teamId, email, role = 'TEAM_MEMBER') => {
        const response = await axiosInstance.post(`/teams/${teamId}/invitations`, { email, role });
        return response.data;
    },

    getPendingInvitations: async (teamId) => {
        const response = await axiosInstance.get(`/teams/${teamId}/invitations`);
        return response.data;
    },

    revokeInvitation: async (teamId, invitationId) => {
        const response = await axiosInstance.delete(`/teams/${teamId}/invitations/${invitationId}`);
        return response.data;
    },

    getInvitationDetails: async (token) => {
        const response = await axiosInstance.get(`/invitations/${token}`);
        return response.data;
    },

    acceptInvitation: async (token) => {
        const response = await axiosInstance.post(`/invitations/${token}/accept`);
        return response.data;
    }
};
