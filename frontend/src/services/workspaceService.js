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

/** Shareable accept link — no email required; admin sends via WhatsApp/copy. */
export function buildInviteAcceptUrl(token) {
  const base = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/invite/accept?token=${token}`;
}

export function buildWhatsAppInviteShareUrl({ inviteUrl, workspaceName, role, inviteeEmail }) {
  const roleLabel = WORKSPACE_ROLE_DISPLAY[role] || role;
  const message = [
    `You're invited to join ${workspaceName} on LeadFlow as ${roleLabel}.`,
    inviteeEmail ? `Use this email when signing up: ${inviteeEmail}` : '',
    `Open this link after signing in: ${inviteUrl}`,
  ].filter(Boolean).join('\n');
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default workspaceService;
