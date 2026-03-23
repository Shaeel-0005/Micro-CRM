/**
 * components/Inbox.jsx
 * Reminders + activity feed.
 * Activity pulled from leadsService (real data).
 * Reminders section is UI-ready — connects to reminders API once built (Day 9).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Clock, CheckCircle, AlertCircle,
  RefreshCw, Calendar, Plus, X
} from 'lucide-react';
import leadsService, { LEAD_STATUS_DISPLAY } from '../services/leadsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const diff  = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
};

const statusToActivity = (status) => ({
  won:         'Deal closed — Won 🎉',
  lost:        'Deal marked as lost',
  in_progress: 'Lead moved to In Progress',
  contacted:   'Lead contacted',
  new:         'New lead added',
}[status] ?? 'Lead updated');

const statusDotColor = (status) => ({
  won:         'bg-emerald-500',
  lost:        'bg-rose-400',
  in_progress: 'bg-[#FF7F40]',
  contacted:   'bg-blue-400',
  new:         'bg-gray-400',
}[status] ?? 'bg-gray-300');

const statusRingColor = (status) => ({
  won:         'bg-emerald-50',
  lost:        'bg-rose-50',
  in_progress: 'bg-orange-50',
  contacted:   'bg-blue-50',
  new:         'bg-gray-50',
}[status] ?? 'bg-gray-50');

// ─── Reminder card ────────────────────────────────────────────────────────────

function ReminderCard({ reminder, onDismiss }) {
  return (
    <div className="flex items-start gap-3 bg-white border border-orange-100 rounded-xl p-4 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
        <Clock className="h-4 w-4 text-[#FF7F40]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{reminder.lead} · {reminder.due}</p>
      </div>
      <button
        onClick={() => onDismiss(reminder.id)}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Inbox() {
  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'reminders'

  // Placeholder reminders — replace with real API call on Day 9
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Follow up on proposal',   lead: 'Sample Lead', due: 'Today' },
    { id: 2, title: 'Send contract draft',      lead: 'Sample Lead', due: 'Tomorrow' },
    { id: 3, title: 'Schedule demo call',       lead: 'Sample Lead', due: 'In 3 days' },
  ]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsService.getAll({ ordering: '-created_at' });
      const list = Array.isArray(data) ? data : data.results ?? [];
      setLeads(list.slice(0, 20)); // latest 20 for activity feed
    } catch {
      setError('Failed to load activity. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const dismissReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">Reminders and recent activity</p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {[
          { key: 'activity',  label: 'Activity',  icon: Bell,     count: leads.length },
          { key: 'reminders', label: 'Reminders', icon: Calendar, count: reminders.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                activeTab === tab.key
                  ? 'bg-orange-100 text-[#FF7F40]'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Activity tab ───────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Lead Activity</h2>
          </div>

          {error
            ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <p className="text-sm text-rose-600">{error}</p>
                <button
                  onClick={fetchLeads}
                  className="text-xs text-[#FF7F40] underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )
            : loading
              ? (
                <div className="divide-y divide-gray-50">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-3 px-6 py-4">
                      <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )
              : leads.length === 0
                ? (
                  <EmptyState
                    icon={Bell}
                    title="No activity yet"
                    sub="Add your first lead to start tracking activity"
                  />
                )
                : (
                  <div className="divide-y divide-gray-50">
                    {leads.map((lead) => (
                      <div key={lead.id} className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                        {/* Status dot */}
                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${statusRingColor(lead.status)}`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${statusDotColor(lead.status)}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {statusToActivity(lead.status)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            <span className="font-medium text-gray-700">{lead.name}</span>
                            {lead.company ? ` · ${lead.company}` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                              {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                            </span>
                          </div>
                        </div>

                        {/* Time */}
                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                          {formatRelativeTime(lead.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
          }
        </div>
      )}

      {/* ── Reminders tab ──────────────────────────────────────────────────── */}
      {activeTab === 'reminders' && (
        <div>
          {/* Notice — reminders API coming Day 9 */}
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
            <Clock className="h-4 w-4 text-[#FF7F40] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-700">
              Reminder notifications are coming in a future update. These are preview placeholders.
            </p>
          </div>

          {reminders.length === 0
            ? (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
                <EmptyState
                  icon={CheckCircle}
                  title="All caught up!"
                  sub="No pending reminders"
                />
              </div>
            )
            : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onDismiss={dismissReminder} />
                ))}

                {/* Add reminder button — placeholder for Day 9 */}
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm text-gray-400 hover:border-orange-200 hover:text-[#FF7F40] transition-all">
                  <Plus className="h-4 w-4" />
                  Add reminder
                </button>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}