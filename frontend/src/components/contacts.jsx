/**
 * components/Contacts.jsx
 * Day 11: Added sort controls (name, date added, status).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search, Plus, Mail, Phone,
  Star, StarOff, Trash2, Building2,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
} from '../services/leadsService';
import metaService from '../services/metaService';
import { useAuth } from '../context/AuthContext';
import LeadDetailPanel from './LeadDetailPanel';
import LeadForm from './Leadform';

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

const STATUS_COLORS = {
  new_lead: 'bg-gray-100 text-gray-700 ring-gray-200',
  discovery_call: 'bg-blue-100 text-blue-700 ring-blue-200',
  proposal_sent: 'bg-orange-100 text-orange-700 ring-orange-200',
  negotiation: 'bg-amber-100 text-amber-700 ring-amber-200',
  won: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  lost: 'bg-rose-100 text-rose-700 ring-rose-200',
};

const STATUS_ORDER = {
  new_lead: 0, discovery_call: 1, proposal_sent: 2, negotiation: 3, won: 4, lost: 5,
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All', active: 'bg-gray-900 text-white' },
  { key: 'new_lead', label: 'New Lead', active: 'bg-gray-500 text-white' },
  { key: 'discovery_call', label: 'Discovery', active: 'bg-blue-500 text-white' },
  { key: 'proposal_sent', label: 'Proposal', active: 'bg-orange-500 text-white' },
  { key: 'negotiation', label: 'Negotiation', active: 'bg-amber-500 text-white' },
  { key: 'won', label: 'Won', active: 'bg-emerald-500 text-white' },
  { key: 'lost', label: 'Lost', active: 'bg-rose-500 text-white' },
];

// ─── Sort button ──────────────────────────────────────────────────────────────

function SortButton({ label, field, current, direction, onChange }) {
  const active = current === field;
  return (
    <button
      onClick={() => {
        if (active) {
          onChange(field, direction === 'asc' ? 'desc' : 'asc');
        } else {
          onChange(field, 'asc');
        }
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-orange-50 text-[#FF7F40] border border-orange-200'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
      {active
        ? direction === 'asc'
          ? <ArrowUp className="h-3 w-3" />
          : <ArrowDown className="h-3 w-3" />
        : <ArrowUpDown className="h-3 w-3 opacity-40" />
      }
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Contacts() {
  const { canExportCsv } = useAuth();
  const outletContext = useOutletContext() ?? {};
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchFromLayout = searchParams.get('search') ?? '';
  const openCreateLead = searchParams.get('new') === '1';
  const [contacts, setContacts]         = useState([]);
  const [tags, setTags]                 = useState([]);
  const [savedViews, setSavedViews]     = useState([]);
  const [filterTag, setFilterTag]       = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField]       = useState('created_at');
  const [sortDir, setSortDir]           = useState('desc');
  const [detailLead, setDetailLead]     = useState(null);
  const [isAdding, setIsAdding]         = useState(false);
  const [starred, setStarred]           = useState({});

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const data = await leadsService.getAll(params);
      setContacts(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(filterTag ? { tag: filterTag } : {});
  }, [fetchContacts, filterTag]);

  useEffect(() => {
    metaService.getTags().then((data) => {
      setTags(Array.isArray(data) ? data : data.results ?? []);
    }).catch(() => setTags([]));
    metaService.getSavedViews().then((data) => {
      setSavedViews(Array.isArray(data) ? data : data.results ?? []);
    }).catch(() => setSavedViews([]));
  }, []);

  useEffect(() => {
    setSearchQuery(searchFromLayout);
  }, [searchFromLayout]);

  useEffect(() => {
    setIsAdding(openCreateLead);
  }, [openCreateLead]);

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSort = (field, dir) => {
    setSortField(field);
    setSortDir(dir);
  };

  // ── Client-side sort + filter ───────────────────────────────────────────────
  const processedContacts = [...contacts]
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) ||
         (c.company ?? '').toLowerCase().includes(q) ||
         (c.email ?? '').toLowerCase().includes(q)) &&
        (filterStatus === 'all' || c.status === filterStatus)
      );
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'status') {
        valA = STATUS_ORDER[a.status] ?? 99;
        valB = STATUS_ORDER[b.status] ?? 99;
      } else {
        // created_at
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const toggleStar = (e, id) => { e.stopPropagation(); setStarred((prev) => ({ ...prev, [id]: !prev[id] })); };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this contact?')) return;
    try {
      await leadsService.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (detailLead?.id === id) setDetailLead(null);
    } catch { alert('Failed to delete contact.'); }
  };

  const handleCreateLead = async (payload) => {
    await leadsService.create(payload);
    await fetchContacts(filterTag ? { tag: filterTag } : {});
  };

  const handleCloseLeadForm = () => {
    setIsAdding(false);
    if (typeof outletContext.closeLeadFormQuery === 'function') {
      outletContext.closeLeadFormQuery();
      return;
    }

    const params = new URLSearchParams(location.search);
    params.delete('new');
    const query = params.toString();
    navigate(query ? { pathname: '/contacts', search: `?${query}` } : '/contacts', { replace: true });
  };

  const applySavedView = (view) => {
    const filters = view.filters || {};
    if (filters.status) setFilterStatus(filters.status);
    if (filters.tag) setFilterTag(String(filters.tag));
  };

  const handleExport = async () => {
    const blob = await leadsService.exportCsv();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleLeadUpdate = (id, newStatus) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (detailLead?.id === id) setDetailLead((prev) => ({ ...prev, status: newStatus }));
  };

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
          <button onClick={fetchContacts} className="mt-4 px-4 py-2 bg-[#FF7F40] text-white rounded-lg hover:bg-orange-600 text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">{contacts.length} total contacts</p>
          </div>
          <div className="flex items-center gap-2">
            {canExportCsv && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>
            )}
            <button onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Add Contact
          </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search contacts..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none ring-orange-200 transition-all focus:ring-2 focus:border-transparent" />
        </div>

        {/* Saved views + tag filters */}
        {(savedViews.length > 0 || tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {savedViews.map((view) => (
              <button
                key={view.id}
                onClick={() => applySavedView(view)}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-50 text-[#FF7F40] border border-orange-100"
              >
                {view.name}
              </button>
            ))}
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(filterTag === String(tag.id) ? '' : String(tag.id))}
                className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                  filterTag === String(tag.id)
                    ? 'bg-[#FF7F40] text-white border-[#FF7F40]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button key={opt.key} onClick={() => setFilterStatus(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === opt.key ? opt.active : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort controls — Day 11 */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort by:</span>
            <SortButton label="Name"   field="name"       current={sortField} direction={sortDir} onChange={handleSort} />
            <SortButton label="Date"   field="created_at" current={sortField} direction={sortDir} onChange={handleSort} />
            <SortButton label="Status" field="status"     current={sortField} direction={sortDir} onChange={handleSort} />
          </div>
        </div>
      </div>

      {/* Contact list */}
      {processedContacts.length === 0
        ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              {searchQuery || filterStatus !== 'all' ? 'No contacts match your search.' : 'No contacts yet. Add your first contact!'}
            </p>
          </div>
        )
        : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {processedContacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setDetailLead(contact)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold">{getInitials(contact.name)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-xs text-gray-500">{contact.company || '—'}</p>
                      </div>
                    </div>
                    <button onClick={(e) => toggleStar(e, contact.id)} className="text-gray-400 hover:text-amber-500 transition-colors">
                      {starred[contact.id] ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {contact.email && <div className="flex items-center gap-2 text-xs text-gray-600"><Mail className="h-3 w-3" /><span className="truncate">{contact.email}</span></div>}
                    {contact.phone && <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="h-3 w-3" /><span>{contact.phone}</span></div>}
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
                  {processedContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailLead(contact)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm flex-shrink-0">{getInitials(contact.name)}</div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-700">{contact.company || '—'}</span></div></td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {contact.email && <div className="flex items-center gap-2 text-xs text-gray-600"><Mail className="h-3 w-3" /><span className="truncate max-w-[160px]">{contact.email}</span></div>}
                          {contact.phone && <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="h-3 w-3" /><span>{contact.phone}</span></div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[contact.status] ?? STATUS_COLORS.new}`}>
                          {LEAD_STATUS_DISPLAY[contact.status] ?? contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4"><span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{LEAD_SOURCE_DISPLAY[contact.source] ?? contact.source}</span></td>
                      <td className="px-6 py-4"><span className="text-xs text-gray-400">{formatDate(contact.created_at)}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => toggleStar(e, contact.id)} className="text-gray-400 hover:text-amber-500 transition-colors">
                            {starred[contact.id] ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button onClick={(e) => handleDelete(e, contact.id)} className="text-gray-400 hover:text-rose-600 transition-colors">
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

      {detailLead && <LeadDetailPanel lead={detailLead} onClose={() => setDetailLead(null)} onUpdate={handleLeadUpdate} />}

      <LeadForm
        isOpen={isAdding}
        onClose={handleCloseLeadForm}
        onSubmit={handleCreateLead}
      />
    </>
  );
}
