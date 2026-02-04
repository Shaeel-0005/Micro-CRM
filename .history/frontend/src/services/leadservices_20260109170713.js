import api from './api';

/**
 * Leads Service
 * Handles all lead-related API calls
 */

const leadsService = {
  /**
   * Get all leads for the authenticated user
   * @param {Object} params - Query parameters (status, ordering, etc.)
   * @returns {Promise} Array of leads
   */
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/leads/?${queryString}` : '/leads/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  /**
   * Get a single lead by ID
   * @param {number} id - Lead ID
   * @returns {Promise} Lead object
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @returns {Promise} Created lead object
   */
  create: async (leadData) => {
    try {
      const response = await api.post('/leads/', leadData);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  /**
   * Update an existing lead
   * @param {number} id - Lead ID
   * @param {Object} leadData - Updated lead data
   * @returns {Promise} Updated lead object
   */
  update: async (id, leadData) => {
    try {
      const response = await api.put(`/leads/${id}/`, leadData);
      return response.data;
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Partially update a lead
   * @param {number} id - Lead ID
   * @param {Object} leadData - Partial lead data
   * @returns {Promise} Updated lead object
   */
  partialUpdate: async (id, leadData) => {
    try {
      const response = await api.patch(`/leads/${id}/`, leadData);
      return response.data;
    } catch (error) {
      console.error(`Error partially updating lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a lead
   * @param {number} id - Lead ID
   * @returns {Promise}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/leads/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get leads by status
   * @param {string} status - Lead status (new, contacted, in_progress, won, lost)
   * @returns {Promise} Array of leads
   */
  getByStatus: async (status) => {
    return leadsService.getAll({ status });
  },

  /**
   * Get leads statistics
   * @returns {Promise} Statistics object
   */
  getStats: async () => {
    try {
      const response = await api.get('/leads/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      throw error;
    }
  },

  /**
   * Search leads
   * @param {string} query - Search query
   * @returns {Promise} Array of leads
   */
  search: async (query) => {
    return leadsService.getAll({ search: query });
  },
};

// Export status and source options for use in forms
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  IN_PROGRESS: 'in_progress',
  WON: 'won',
  LOST: 'lost',
};

export const LEAD_STATUS_DISPLAY = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_SOURCE = {
  WEBSITE: 'website',
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  REFERRAL: 'referral',
  OTHER: 'other',
};

export const LEAD_SOURCE_DISPLAY = {
  website: 'Website',
  linkedin: 'LinkedIn',
  email: 'Email',
  referral: 'Referral',
  other: 'Other',
};

export default leadsService;