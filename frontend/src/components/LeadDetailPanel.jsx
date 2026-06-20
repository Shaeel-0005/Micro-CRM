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
import metaService, { PROPOSAL_STATUS_DISPLAY } from '../services/metaService';

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

function ProposalsSection({ leadId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('drafted');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await metaService.getProposalsForLead(leadId);
      setProposals(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await metaService.createProposal({ lead: leadId, title: title.trim(), status });
      setTitle('');
      setStatus('drafted');
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-5 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Proposals</h3>
      <form onSubmit={handleCreate} className="flex gap-2 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Proposal title"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2">
          {Object.entries(PROPOSAL_STATUS_DISPLAY).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" disabled={saving} className="text-xs bg-[#FF7F40] text-white px-3 py-1.5 rounded-lg">Add</button>
      </form>
      {loading ? (
        <p className="text-xs text-gray-400">Loading proposals...</p>
      ) : proposals.length === 0 ? (
        <p className="text-xs text-gray-400">No proposals yet.</p>
      ) : (
        <div className="space-y-2">
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2">
              <span className="font-medium text-gray-800">{p.title}</span>
              <span className="text-xs text-gray-500">{PROPOSAL_STATUS_DISPLAY[p.status] ?? p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TagsSection({ lead, onTagsChange }) {
  const [allTags, setAllTags] = useState([]);
  const [selected, setSelected] = useState((lead.tags ?? []).map((t) => t.id));
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    metaService.getTags().then((data) => {
      setAllTags(Array.isArray(data) ? data : data.results ?? []);
    }).catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    setSelected((lead.tags ?? []).map((t) => t.id));
  }, [lead.tags]);

  const saveTags = async (tagIds) => {
    setSaving(true);
    try {
      const updated = await leadsService.partialUpdate(lead.id, { tag_ids: tagIds });
      onTagsChange?.(updated);
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId) => {
    const next = selected.includes(tagId)
      ? selected.filter((id) => id !== tagId)
      : [...selected, tagId];
    setSelected(next);
    saveTags(next);
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const tag = await metaService.createTag({ name: newTag.trim() });
    setAllTags((prev) => [...prev, tag]);
    const next = [...selected, tag.id];
    setSelected(next);
    setNewTag('');
    saveTags(next);
  };

  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
        {saving && <span className="text-xs text-gray-400">Saving...</span>}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {allTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              selected.includes(tag.id)
                ? 'bg-orange-50 text-[#FF7F40] border-orange-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
            style={selected.includes(tag.id) ? { borderColor: tag.color } : undefined}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <form onSubmit={handleCreateTag} className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag"
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1"
        />
        <button type="submit" className="text-xs text-[#FF7F40] font-medium">+ Add</button>
      </form>
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
  const [leadState, setLeadState] = useState(lead);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => { setLeadState(lead); }, [lead]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noteService.getAll(leadState.id);
      const list = Array.isArray(data) ? data : data.results ?? [];
      setNotes(list);
    } catch {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [leadState.id]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStatusChange = async (newStatus) => {
    setStatusMenuOpen(false);
    setChangingStatus(true);
    setStatusError('');
    try {
      const updated = await leadsService.partialUpdate(leadState.id, { status: newStatus });
      setLeadState((prev) => ({
        ...prev,
        status: updated.status ?? newStatus,
        lost_reason: updated.lost_reason ?? null,
      }));
      if (onUpdate) onUpdate(leadState.id, newStatus);
    } catch (err) {
      const data = err.response?.data;
      const message = data?.lost_reason?.[0]
        ?? data?.detail
        ?? data?.status?.[0]
        ?? 'Failed to update status. Please try again.';
      setStatusError(message);
    } finally {
      setChangingStatus(false);
    }
  };

  const otherStatuses = Object.entries(LEAD_STATUS_DISPLAY).filter(([key]) => key !== leadState.status);
  const dealLabel = leadState.deal_value
    ? `${leadState.deal_currency === 'USD' ? '$' : 'Rs '}${Number(leadState.deal_value).toLocaleString()}`
    : null;
  const whatsappUrl = buildWhatsAppUrl(leadState);

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm">
              {leadState.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{leadState.name}</h2>
              {leadState.company && <p className="text-xs text-gray-500">{leadState.company}</p>}
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[leadState.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {changingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
                  {LEAD_STATUS_DISPLAY[leadState.status] ?? leadState.status}
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
            {statusError && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {statusError}
              </div>
            )}

            {dealLabel && (
              <div className="flex items-center gap-2.5 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{dealLabel}</span>
              </div>
            )}
            {leadState.expected_close_date && (
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">Close: {new Date(leadState.expected_close_date).toLocaleDateString()}</span>
              </div>
            )}
            {leadState.assigned_to_name && (
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">Assigned: {leadState.assigned_to_name}</span>
              </div>
            )}
            {leadState.lost_reason && (
              <div className="flex items-center gap-2.5 text-sm">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span className="text-rose-600">{LOST_REASON_DISPLAY[leadState.lost_reason]}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {leadState.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${leadState.email}`} className="text-gray-700 hover:text-[#FF7F40] truncate">{leadState.email}</a>
                </div>
              )}
              {leadState.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${leadState.phone}`} className="text-gray-700 hover:text-[#FF7F40]">{leadState.phone}</a>
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
                <span className="text-gray-700">{LEAD_SOURCE_DISPLAY[leadState.source] ?? leadState.source}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Added {formatDate(leadState.created_at)}</span>
              </div>
            </div>
          </div>

          <TagsSection
            lead={leadState}
            onTagsChange={(updated) => setLeadState(updated)}
          />
          <ProposalsSection leadId={leadState.id} />

          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Activity Log
              {notes.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({notes.length})</span>}
            </h3>
            <div className="mb-5">
              <AddNoteForm leadId={leadState.id} onAdded={(note) => setNotes((prev) => [note, ...prev])} />
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
                  leadId={leadState.id}
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
