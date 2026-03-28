/**
 * components/Contacts.jsx
 * Day 8: Rewritten — uses backend status values directly,
 * old detail modal replaced with LeadDetailPanel slide-out.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Mail, Phone,
  Star, StarOff, Trash2, Building2
} from 'lucide-react';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
} from '../services/leadsService';
import LeadDetailPanel from './LeadDetailPanel';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const diff  = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 7)   return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
};

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Maps backend status → badge color classes
const STATUS_COLORS = {
  new:         'bg-gray-100 text-gray-700 ring-gray-200',
  contacted:   'bg-blue-100 text-blue-700 ring-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 ring-amber-200',
  won:         'bg-emerald-100 text-emerald-700 ring-emerald-200',
  lost:        'bg-rose-100 text-rose-700 ring-rose-200',
};

// Filter bar options — all, then each real backend status
const FILTER_OPTIONS = [
  { key: 'all',         label: 'All',         active: 'bg-gray-900 text-white' },
  { key: 'new',         label: 'New',         active: 'bg-gray-500 text-white' },
  { key: 'contacted',   label: 'Contacted',   active: 'bg-blue-500 text-white' },
  { key: 'in_progress', label: 'In Progress', active: 'bg-amber-500 text-white' },
  { key: 'won',         label: 'Won',         active: 'bg-emerald-500 text-white' },
  { key: 'lost',        label: 'Lost',        active: 'bg-rose-500 text-white' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Contacts() {
  const [contacts, setContacts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailLead, setDetailLead]     = useState(null);
  const [isAdding, setIsAdding]         = useState(false);
  const [starred, setStarred]           = useState({});

  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', company: '', email: '',
    phone: '', status: 'new', notes: '', source: 'other',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsService.getAll();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setContacts(list);
    } catch {
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q);
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleStar = (e, id) => {
    e.stopPropagation();
    setStarred((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this contact?')) return;
    try {
      await leadsService.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (detailLead?.id === id) setDetailLead(null);
    } catch {
      alert('Failed to delete contact.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await leadsService.create({
        name:    formData.name,
        email:   formData.email || undefined,
        phone:   formData.phone || undefined,
        company: formData.company || undefined,
        status:  formData.status,
        source:  formData.source,
        notes:   formData.notes || undefined,
      });
      await fetchContacts();
      setIsAdding(false);
      setFormData({ name: '', company: '', email: '', phone: '', status: 'new', notes: '', source: 'other' });
    } catch (err) {
      const data = err.response?.data;
      if (data?.email)  setFormError(data.email[0]);
      else if (data?.phone) setFormError(data.phone[0]);
      else if (data?.name)  setFormError(data.name[0]);
      else setFormError('Failed to create contact. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Called by LeadDetailPanel when status changes
  const handleLeadUpdate = (id, newStatus) => {
    setContacts((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: newStatus } : c)
    );
    // Update the open panel lead too
    if (detailLead?.id === id) {
      setDetailLead((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7F40] mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-rose-600 text-sm">{error}</p>
          <button
            onClick={fetchContacts}
            className="mt-4 px-4 py-2 bg-[#FF7F40] text-white rounded-lg hover:bg-orange-600 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">{contacts.length} total contacts</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none ring-orange-200 transition-all focus:ring-2 focus:border-transparent"
            />
          </div>

          {/* Filter buttons — real backend statuses */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilterStatus(opt.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === opt.key
                    ? opt.active
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contact list ───────────────────────────────────────────────────── */}
      {filteredContacts.length === 0
        ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              {searchQuery || filterStatus !== 'all'
                ? 'No contacts match your search.'
                : 'No contacts yet. Add your first contact!'}
            </p>
          </div>
        )
        : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setDetailLead(contact)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold">
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-xs text-gray-500">{contact.company || '—'}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => toggleStar(e, contact.id)}
                      className="text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      {starred[contact.id]
                        ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        : <StarOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[contact.status] ?? STATUS_COLORS.new}`}>
                      {LEAD_STATUS_DISPLAY[contact.status] ?? contact.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(contact.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-left">Company</th>
                    <th className="px-6 py-3 text-left">Contact Info</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Source</th>
                    <th className="px-6 py-3 text-left">Added</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setDetailLead(contact)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm flex-shrink-0">
                            {getInitials(contact.name)}
                          </div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{contact.company || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[160px]">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[contact.status] ?? STATUS_COLORS.new}`}>
                          {LEAD_STATUS_DISPLAY[contact.status] ?? contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          {LEAD_SOURCE_DISPLAY[contact.source] ?? contact.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">{formatDate(contact.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => toggleStar(e, contact.id)}
                            className="text-gray-400 hover:text-amber-500 transition-colors"
                          >
                            {starred[contact.id]
                              ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              : <StarOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, contact.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      }

      {/* ── Lead detail panel ───────────────────────────────────────────────── */}
      {detailLead && (
        <LeadDetailPanel
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {/* ── Add contact modal ───────────────────────────────────────────────── */}
      {isAdding && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsAdding(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any notes about this contact..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setFormError(''); }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}