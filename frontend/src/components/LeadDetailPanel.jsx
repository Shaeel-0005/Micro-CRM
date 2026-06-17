/**
 * components/LeadDetailPanel.jsx
 * Slide-out panel with lead details, WhatsApp, and notes timeline.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Mail, Phone, Building2, Tag, Clock, Calendar, User, DollarSign,
  Plus, Trash2, FileText, PhoneCall, AtSign, MessageCircle,
  ChevronDown, AlertCircle, Loader2
} from 'lucide-react';
import noteService, { NOTE_TYPE_DISPLAY } from '../services/noteService';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
  LOST_REASON_DISPLAY,
} from '../services/leadsService';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_COLORS = {
  new_lead: 'bg-gray-100 text-gray-700 ring-gray-200',
  discovery_call: 'bg-blue-100 text-blue-700 ring-blue-200',
  proposal_sent: 'bg-orange-100 text-[#FF7F40] ring-orange-200',
  negotiation: 'bg-amber-100 text-amber-700 ring-amber-200',
  won: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  lost: 'bg-rose-100 text-rose-700 ring-rose-200',
};

const NOTE_ICON_COMPONENTS = {
  call: PhoneCall,
  email: AtSign,
  whatsapp: MessageCircle,
  general: FileText,
};

function buildWhatsAppUrl(lead) {
  const phone = (lead.phone || '').replace(/\D/g, '');
  if (!phone) return null;
  const message = `Hi ${lead.name}, this is following up from our agency regarding ${lead.company || 'your inquiry'}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function NoteItem({ note, leadId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const Icon = NOTE_ICON_COMPONENTS[note.note_type] ?? FileText;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await noteService.delete(leadId, note.id);
      onDelete(note.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-[#FF7F40]" />
        </div>
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF7F40] ring-1 ring-inset ring-orange-100 mb-1">
              {NOTE_TYPE_DISPLAY[note.note_type]}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed break-words">{note.content}</p>
            {note.created_by_name && (
              <p className="text-xs text-gray-400 mt-1">by {note.created_by_name}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatDate(note.created_at)}</p>
      </div>
    </div>
  );
}

function AddNoteForm({ leadId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter note content.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const note = await noteService.create(leadId, { note_type: type, content: content.trim() });
      onAdded(note);
      setContent('');
      setType('general');
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.content?.[0] ?? 'Failed to add note.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-orange-200 hover:text-[#FF7F40] transition-all"
      >
        <Plus className="h-4 w-4" />
        Log activity
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {Object.entries(NOTE_TYPE_DISPLAY).map(([key, label]) => {
          const Icon = NOTE_ICON_COMPONENTS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-all ${
                type === key
                  ? 'bg-[#FF7F40] text-white shadow-sm shadow-orange-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-[#FF7F40]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(''); }}
        placeholder={`What happened on this ${NOTE_TYPE_DISPLAY[type].toLowerCase()}?`}
        rows={3}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent resize-none"
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => { setOpen(false); setContent(''); setError(''); }}
          className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 rounded-lg bg-[#FF7F40] py-2 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-1">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function LeadDetailPanel({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const whatsappUrl = buildWhatsAppUrl(lead);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noteService.getAll(lead.id);
      const list = Array.isArray(data) ? data : data.results ?? [];
      setNotes(list);
    } catch {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [lead.id]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStatusChange = async (newStatus) => {
    setStatusMenuOpen(false);
    setChangingStatus(true);
    try {
      await leadsService.partialUpdate(lead.id, { status: newStatus });
      if (onUpdate) onUpdate(lead.id, newStatus);
    } catch { /* ignore */ } finally {
      setChangingStatus(false);
    }
  };

  const otherStatuses = Object.entries(LEAD_STATUS_DISPLAY).filter(([key]) => key !== lead.status);
  const dealLabel = lead.deal_value
    ? `${lead.deal_currency === 'USD' ? '$' : 'Rs '}${Number(lead.deal_value).toLocaleString()}`
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm">
              {lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{lead.name}</h2>
              {lead.company && <p className="text-xs text-gray-500">{lead.company}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  disabled={changingStatus}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {changingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
                  {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {statusMenuOpen && (
                  <div className="absolute right-0 top-8 z-10 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1">
                    {otherStatuses.map(([key, label]) => (
                      <button key={key} onClick={() => handleStatusChange(key)}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#FF7F40]">
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {dealLabel && (
              <div className="flex items-center gap-2.5 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{dealLabel}</span>
              </div>
            )}
            {lead.expected_close_date && (
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">Close: {new Date(lead.expected_close_date).toLocaleDateString()}</span>
              </div>
            )}
            {lead.assigned_to_name && (
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">Assigned: {lead.assigned_to_name}</span>
              </div>
            )}
            {lead.lost_reason && (
              <div className="flex items-center gap-2.5 text-sm">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span className="text-rose-600">{LOST_REASON_DISPLAY[lead.lost_reason]}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${lead.email}`} className="text-gray-700 hover:text-[#FF7F40] truncate">{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${lead.phone}`} className="text-gray-700 hover:text-[#FF7F40]">{lead.phone}</a>
                </div>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open WhatsApp
                </a>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Added {formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Activity Log
              {notes.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({notes.length})</span>}
            </h3>
            <div className="mb-5">
              <AddNoteForm leadId={lead.id} onAdded={(note) => setNotes((prev) => [note, ...prev])} />
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-rose-600 text-sm">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No activity logged yet.</p>
            ) : (
              notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  leadId={lead.id}
                  onDelete={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
