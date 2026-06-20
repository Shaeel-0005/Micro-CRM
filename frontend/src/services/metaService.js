import api from './api';

const metaService = {
  getTags: async () => {
    const response = await api.get('/leads/tags/');
    return response.data;
  },

  createTag: async (data) => {
    const response = await api.post('/leads/tags/', data);
    return response.data;
  },

  deleteTag: async (id) => {
    await api.delete(`/leads/tags/${id}/`);
  },

  getSavedViews: async () => {
    const response = await api.get('/leads/saved-views/');
    return response.data;
  },

  createSavedView: async (data) => {
    const response = await api.post('/leads/saved-views/', data);
    return response.data;
  },

  deleteSavedView: async (id) => {
    await api.delete(`/leads/saved-views/${id}/`);
  },

  getProposals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/leads/proposals/?${query}` : '/leads/proposals/';
    const response = await api.get(url);
    return response.data;
  },

  getProposalsForLead: async (leadId) => {
    const response = await api.get('/leads/proposals/', { params: { lead: leadId } });
    return response.data;
  },

  createProposal: async (data) => {
    const response = await api.post('/leads/proposals/', data);
    return response.data;
  },

  updateProposal: async (id, data) => {
    const response = await api.patch(`/leads/proposals/${id}/`, data);
    return response.data;
  },

  deleteProposal: async (id) => {
    await api.delete(`/leads/proposals/${id}/`);
  },
};

export const PROPOSAL_STATUS_DISPLAY = {
  drafted: 'Drafted',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default metaService;
