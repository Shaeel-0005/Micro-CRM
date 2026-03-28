/**
 * services/activityService.js
 * Day 8: API calls for lead activities.
 * All endpoints are nested under a lead: /api/leads/{leadId}/activities/
 */

import api from './api';

export const ACTIVITY_TYPES = {
  NOTE:    'note',
  CALL:    'call',
  EMAIL:   'email',
  MEETING: 'meeting',
};

export const ACTIVITY_TYPE_DISPLAY = {
  note:    'Note',
  call:    'Call',
  email:   'Email',
  meeting: 'Meeting',
};

export const ACTIVITY_TYPE_ICONS = {
  note:    '📝',
  call:    '📞',
  email:   '✉️',
  meeting: '🤝',
};

const activityService = {
  /**
   * Get all activities for a lead.
   * GET /api/leads/{leadId}/activities/
   */
  getAll: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/activities/`);
    return response.data;
  },

  /**
   * Add a new activity to a lead.
   * POST /api/leads/{leadId}/activities/
   */
  create: async (leadId, activityData) => {
    const response = await api.post(`/leads/${leadId}/activities/`, activityData);
    return response.data;
  },

  /**
   * Delete an activity.
   * DELETE /api/leads/{leadId}/activities/{activityId}/
   */
  delete: async (leadId, activityId) => {
    const response = await api.delete(`/leads/${leadId}/activities/${activityId}/`);
    return response.data;
  },
};

export default activityService;