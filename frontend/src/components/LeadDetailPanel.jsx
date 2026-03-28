/**
 * components/LeadDetailPanel.jsx
 * Day 8: Slide-out panel showing lead details + full activity log.
 * Opens when a lead is clicked from Contacts or Overview.
 *
 * Props:
 *   lead     — lead object (from leadsService)
 *   onClose  — function to close the panel
 *   onUpdate — function called after status change (to refresh parent list)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Mail, Phone, Building2, Tag, Clock,
  Plus, Trash2, FileText, PhoneCall, AtSign, Users,
  ChevronDown, AlertCircle, Loader2
} from 'lucide-react';
import activityService, {
  ACTIVITY_TYPE_DISPLAY,
  ACTIVITY_TYPE_ICONS,
} from '../services/activityService';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
  LEAD_STATUS,
} from '../services/leadsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const diff  = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_COLORS = {
  new:         'bg-gray-100 text-gray-700 ring-gray-200',
  contacted:   'bg-blue-100 text-blue-700 ring-blue-200',
  in_progress: 'bg-orange-100 text-[#FF7F40] ring-orange-200',
  won:         'bg-emerald-100 text-emerald-700 ring-emerald-200',
  lost:        'bg-rose-100 text-rose-700 ring-rose-200',
};

const ACTIVITY_ICON_COMPONENTS = {
  note:    FileText,
  call:    PhoneCall,
  email:   AtSign,
  meeting: Users,
};

// ─── Activity item ────────────────────────────────────────────────────────────

function ActivityItem({ activity, leadId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const Icon = ACTIVITY_ICON_COMPONENTS[activity.activity_type] ?? FileText;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await activityService.delete(leadId, activity.id);
      onDelete(activity.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      {/* Icon */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-[#FF7F40]" />
        </div>
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF7F40] ring-1 ring-inset ring-orange-100 mb-1">
              {ACTIVITY_TYPE_DISPLAY[activity.activity_type]}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed break-words">
              {activity.description}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50"
          >
            {deleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />
            }
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatDate(activity.created_at)}</p>
      </div>
    </div>
  );
}

// ─── Add activity form ────────────────────────────────────────────────────────

function AddActivityForm({ leadId, onAdded }) {
  const [open, setOpen]   = useState(false);
  const [type, setType]   = useState('note');
  const [desc, setDesc]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError('Please enter a description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const activity = await activityService.create(leadId, {
        activity_type: type,
        description:   desc.trim(),
      });
      onAdded(activity);
      setDesc('');
      setType('note');
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.description?.[0] ?? 'Failed to add activity.');
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-3"
    >
      {/* Type selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {Object.entries(ACTIVITY_TYPE_DISPLAY).map(([key, label]) => {
          const Icon = ACTIVITY_ICON_COMPONENTS[key];
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

      {/* Description */}
      <textarea
        value={desc}
        onChange={(e) => { setDesc(e.target.value); setError(''); }}
        placeholder={`What happened on this ${ACTIVITY_TYPE_DISPLAY[type].toLowerCase()}?`}
        rows={3}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent resize-none placeholder:text-gray-400"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setDesc(''); setError(''); }}
          className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-[#FF7F40] py-2 text-xs font-medium text-white hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function LeadDetailPanel({ lead, onClose, onUpdate }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Fetch activities ────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await activityService.getAll(lead.id);
      const list = Array.isArray(data) ? data : data.results ?? [];
      setActivities(list);
    } catch {
      setError('Failed to load activities.');
    } finally {
      setLoading(false);
    }
  }, [lead.id]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  // ── Activity handlers ───────────────────────────────────────────────────────
  const handleActivityAdded = (activity) => {
    setActivities((prev) => [activity, ...prev]);
  };

  const handleActivityDeleted = (activityId) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  };

  // ── Status change ───────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setStatusMenuOpen(false);
    setChangingStatus(true);
    try {
      await leadsService.partialUpdate(lead.id, { status: newStatus });
      if (onUpdate) onUpdate(lead.id, newStatus);
    } catch {
      // silently ignore — parent will still reflect old status
    } finally {
      setChangingStatus(false);
    }
  };

  const otherStatuses = Object.entries(LEAD_STATUS_DISPLAY).filter(
    ([key]) => key !== lead.status
  );

  // ── Close on Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{lead.name}</h2>
              {lead.company && (
                <p className="text-xs text-gray-500">{lead.company}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Lead info */}
          <div className="px-6 py-5 space-y-4 border-b border-gray-100">

            {/* Status — clickable dropdown */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  disabled={changingStatus}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all ${
                    STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {changingStatus
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : null
                  }
                  {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute right-0 top-8 z-10 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1">
                    {otherStatuses.map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#FF7F40] transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2.5">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gray-700 hover:text-[#FF7F40] transition-colors truncate"
                  >
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-gray-700 hover:text-[#FF7F40] transition-colors"
                  >
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{lead.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">
                  {LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">Added {formatDate(lead.created_at)}</span>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Activity log */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Activity Log
              {activities.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({activities.length})
                </span>
              )}
            </h3>

            {/* Add activity form */}
            <div className="mb-5">
              <AddActivityForm
                leadId={lead.id}
                onAdded={handleActivityAdded}
              />
            </div>

            {/* Activity timeline */}
            {loading
              ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-1/4 bg-gray-100 animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )
              : error
                ? (
                  <div className="flex items-center gap-2 text-rose-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )
                : activities.length === 0
                  ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No activity logged yet.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Use the button above to log a call, note, email, or meeting.
                      </p>
                    </div>
                  )
                  : (
                    <div>
                      {activities.map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          leadId={lead.id}
                          onDelete={handleActivityDeleted}
                        />
                      ))}
                    </div>
                  )
            }
          </div>
        </div>
      </div>
    </>
  );
}