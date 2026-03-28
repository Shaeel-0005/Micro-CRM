/**
 * services/reminderService.js
 * Day 9: API calls for reminders.
 */

import api from './api';

const reminderService = {
  getAll:          async ()       => (await api.get('/reminders/')).data,
  getUpcoming:     async ()       => (await api.get('/reminders/upcoming/')).data,
  getOverdue:      async ()       => (await api.get('/reminders/overdue/')).data,
  getStats:        async ()       => (await api.get('/reminders/stats/')).data,
  create:          async (data)   => (await api.post('/reminders/', data)).data,
  update:          async (id, data) => (await api.patch(`/reminders/${id}/`, data)).data,
  delete:          async (id)     => (await api.delete(`/reminders/${id}/`)).data,
  toggleComplete:  async (id)     => (await api.post(`/reminders/${id}/complete/`)).data,
};

export default reminderService;