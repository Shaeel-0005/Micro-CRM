import api from './api';

const workspaceService = {
  getMe: async () => {
    const response = await api.get('/workspaces/me/');
    return response.data;
  },

  getMembers: async () => {
    const response = await api.get('/workspaces/members/');
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await api.patch(`/workspaces/members/${id}/`, data);
    return response.data;
  },

  getInvites: async () => {
    const response = await api.get('/workspaces/invites/');
    return response.data;
  },

  createInvite: async (email, role = 'member') => {
    const response = await api.post('/workspaces/invites/', { email, role });
    return response.data;
  },

  acceptInvite: async (token) => {
    const response = await api.post('/workspaces/invites/accept/', { token });
    return response.data;
  },

  getAuditLog: async () => {
    const response = await api.get('/workspaces/audit/');
    return response.data;
  },
};

export const WORKSPACE_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

export const WORKSPACE_ROLE_DISPLAY = {
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
};

export default workspaceService;
