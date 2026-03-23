/**
 * components/Pipeline.jsx
 * Kanban board — one column per lead status.
 * Fully connected to backend via leadsService.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Mail, Phone, MoreVertical } from 'lucide-react';
import leadsService, { LEAD_SOURCE_DISPLAY } from '../services/leadsService';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'new',         label: 'New',         color: 'bg-gray-400',    light: 'bg-gray-50',    border: 'border-gray-200' },
  { key: 'contacted',   label: 'Contacted',   color: 'bg-blue-400',    light: 'bg-blue-50',    border: 'border-blue-100' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-[#FF7F40]',   light: 'bg-orange-50',  border: 'border-orange-100' },
  { key: 'won',         label: 'Won',         color: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'lost',        label: 'Lost',        color: 'bg-rose-400',    light: 'bg-rose-50',    border: 'border-rose-100' },
];

// ─── Lead card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const otherStatuses = COLUMNS.filter((c) => c.key !== lead.status);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
            <p className="text-xs text-gray-500 truncate">{lead.company || '—'}</p>
          </div>
        </div>

        {/* Move to status menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 text-gray-400"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 text-sm"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Move to
              </p>
              {otherStatuses.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    onStatusChange(lead.id, s.key);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-orange-50 hover:text-[#FF7F40] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source badge */}
      <div className="mb-3">
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
          {LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({ column, leads, onStatusChange, loading }) {
  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${column.light} border ${column.border} mb-3`}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${column.color}`} />
          <span className="text-xs font-semibold text-gray-700">{column.label}</span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-white rounded-md px-2 py-0.5 border border-gray-100">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {loading
          ? [...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
              </div>
            ))
          : leads.length === 0
            ? (
              <div className={`border-2 border-dashed ${column.border} rounded-xl p-6 text-center`}>
                <p className="text-xs text-gray-400">No leads here</p>
              </div>
            )
            : leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onStatusChange={onStatusChange}
                />
              ))
        }
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Pipeline() {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsService.getAll();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setLeads(list);
    } catch {
      setError('Failed to load pipeline. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update — move card immediately, revert on failure
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    try {
      await leadsService.partialUpdate(id, { status: newStatus });
    } catch {
      fetchLeads();
    }
  };

  const leadsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = leads.filter((l) => l.status === col.key);
    return acc;
  }, {});

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} across all stages
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            column={col}
            leads={leadsByStatus[col.key] ?? []}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}