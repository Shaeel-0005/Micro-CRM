import api from './api';

export const NOTE_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  GENERAL: 'general',
};

export const NOTE_TYPE_DISPLAY = {
  call: 'Call',
  email: 'Email',
  whatsapp: 'WhatsApp',
  general: 'General',
};

export const NOTE_TYPE_ICONS = {
  call: '📞',
  email: '✉️',
  whatsapp: '💬',
  general: '📝',
};

const noteService = {
  getAll: async (leadId) => {
    const response = await api.get(`/leads/${leadId}/notes/`);
    return response.data;
  },

  create: async (leadId, noteData) => {
    const response = await api.post(`/leads/${leadId}/notes/`, noteData);
    return response.data;
  },

  delete: async (leadId, noteId) => {
    const response = await api.delete(`/leads/${leadId}/notes/${noteId}/`);
    return response.data;
  },
};

export default noteService;
