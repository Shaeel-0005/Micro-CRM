/**
 * services/analyticsService.js
 * Day 13: Calls the Pandas analytics endpoint.
 */

import api from './api';

const analyticsService = {
  /**
   * GET /api/analytics/dashboard/
   * Returns: total, by_status, by_source, win_rate, conversion_rate,
   *          monthly_new, monthly_won, trend_pct, last_30_days
   */
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard/');
    return response.data;
  },
};

export default analyticsService;