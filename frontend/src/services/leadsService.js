import api from './api';

const leadsService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/leads/?${queryString}` : '/leads/';
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/leads/${id}/`);
    return response.data;
  },

  create: async (leadData) => {
    const response = await api.post('/leads/', leadData);
    return response.data;
  },

  update: async (id, leadData) => {
    const response = await api.put(`/leads/${id}/`, leadData);
    return response.data;
  },

  partialUpdate: async (id, leadData) => {
    const response = await api.patch(`/leads/${id}/`, leadData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/leads/${id}/`);
    return response.data;
  },

  getByStatus: async (status) => leadsService.getAll({ status }),

  getStats: async () => {
    const response = await api.get('/leads/stats/');
    return response.data;
  },

  getMoneyStats: async () => {
    const response = await api.get('/leads/money_stats/');
    return response.data;
  },

  search: async (query) => leadsService.getAll({ search: query }),
};

export const LEAD_STATUS = {
  NEW_LEAD: 'new_lead',
  DISCOVERY_CALL: 'discovery_call',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
};

export const LEAD_STATUS_DISPLAY = {
  new_lead: 'New Lead',
  discovery_call: 'Discovery Call',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_SOURCE = {
  REFERRAL: 'referral',
  FB_ADS: 'fb_ads',
  LINKEDIN: 'linkedin',
  COLD_OUTREACH: 'cold_outreach',
  WEBSITE: 'website',
  WHATSAPP: 'whatsapp',
};

export const LEAD_SOURCE_DISPLAY = {
  referral: 'Referral',
  fb_ads: 'FB Ads',
  linkedin: 'LinkedIn',
  cold_outreach: 'Cold Outreach',
  website: 'Website',
  whatsapp: 'WhatsApp',
};

export const LOST_REASON = {
  PRICE: 'price',
  GHOSTED: 'ghosted',
  COMPETITOR: 'competitor',
  FEATURES: 'features',
  TIMING: 'timing',
};

export const LOST_REASON_DISPLAY = {
  price: 'Price',
  ghosted: 'Ghosted',
  competitor: 'Competitor',
  features: 'Features',
  timing: 'Timing',
};

export const OPEN_PIPELINE_STATUSES = [
  'new_lead',
  'discovery_call',
  'proposal_sent',
  'negotiation',
];

export default leadsService;
