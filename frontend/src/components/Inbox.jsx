/**
 * components/Inbox.jsx
 * Day 9: Fully wired — real reminders + real activity feed from backend.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Clock, CheckCircle, AlertCircle, RefreshCw,
  Calendar, Plus, X, Loader2, Check, Trash2
} from 'lucide-react';
import reminderService from '../services/reminderService';
import leadsService, { LEAD_STATUS_DISPLAY } from '../services/leadsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const diff  = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDueDate = (dateString) => {
  if (!dateString) return '—';
  const diff  = new Date(dateString) - new Date();
  const hours = Math.floor(Math.abs(diff) / 3_600_000);
  const days  = Math.floor(Math.abs(diff) / 86_400_000);
  if (diff < 0) return hours < 24 ? `${hours}h overdue` : `${days}d overdue`;
  if (hours < 1)  return 'Due now';
  if (hours < 24) return `Due in ${hours}h`;
  if (days === 1) return 'Due tomorrow';
  return `Due ${new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const statusDotColor  = (s) => ({ won: 'bg-emerald-500', lost: 'bg-rose-400', in_progress: 'bg-[#FF7F40]', contacted: 'bg-blue-400', new: 'bg-gray-400' }[s] ?? 'bg-gray-300');
const statusRingColor = (s) => ({ won: 'bg-emerald-50',  lost: 'bg-rose-50',  in_progress: 'bg-orange-50',  contacted: 'bg-blue-50',  new: 'bg-gray-50'  }[s] ?? 'bg-gray-50');
const statusToActivity= (s) => ({ won: 'Deal closed — Won 🎉', lost: 'Deal marked as lost', in_progress: 'Lead moved to In Progress', contacted: 'Lead contacted', new: 'New lead added' }[s] ?? 'Lead updated');

// ─── Add Reminder Form ────────────────────────────────────────────────────────

function AddReminderForm({ leads, onAdded, onClose }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const [form, setForm]     = useState({ title: '', message: '', reminder_date: tomorrow.toISOString().slice(0, 16), lead: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const reminder = await reminderService.create({
        title:         form.title.trim(),
        message:       form.message.trim() || undefined,
        reminder_date: new Date(form.reminder_date).toISOString(),
        lead:          form.lead || undefined,
      });
      onAdded(reminder);
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.title?.[0] ?? d?.reminder_date?.[0] ?? 'Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add Reminder</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-600">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Follow up on proposal"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date & Time *</label>
            <input type="datetime-local" required value={form.reminder_date} onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Linked Lead <span className="text-gray-400 font-normal">(optional)</span></label>
            <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent">
              <option value="">No lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.name}{l.company ? ` — ${l.company}` : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={2} placeholder="Any extra context..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2 focus:border-transparent resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-[#FF7F40] py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Saving...' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reminder card ────────────────────────────────────────────────────────────

function ReminderCard({ reminder, onComplete, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try { onComplete(await reminderService.toggleComplete(reminder.id)); }
    finally { setCompleting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await reminderService.delete(reminder.id); onDelete(reminder.id); }
    finally { setDeleting(false); }
  };

  return (
    <div className={`flex items-start gap-3 bg-white border rounded-xl p-4 shadow-sm ${
      reminder.is_completed ? 'border-gray-100 opacity-60' : reminder.is_overdue ? 'border-rose-200 bg-rose-50/30' : 'border-orange-100'
    }`}>
      <button onClick={handleComplete} disabled={completing}
        className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
          reminder.is_completed ? 'border-emerald-500 bg-emerald-500' : reminder.is_overdue ? 'border-rose-400' : 'border-gray-300 hover:border-[#FF7F40]'
        }`}>
        {completing ? <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
          : reminder.is_completed ? <Check className="h-2.5 w-2.5 text-white" /> : null}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${reminder.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{reminder.title}</p>
        {reminder.lead_name && <p className="text-xs text-gray-500 mt-0.5">{reminder.lead_name}</p>}
        <p className={`text-xs mt-1 font-medium ${reminder.is_completed ? 'text-gray-400' : reminder.is_overdue ? 'text-rose-500' : 'text-[#FF7F40]'}`}>
          {reminder.is_completed ? 'Completed' : formatDueDate(reminder.reminder_date)}
        </p>
      </div>

      <button onClick={handleDelete} disabled={deleting}
        className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('reminders');
  const [reminders, setReminders] = useState([]);
  const [leads, setLeads]         = useState([]);
  const [loadingR, setLoadingR]   = useState(true);
  const [loadingL, setLoadingL]   = useState(true);
  const [errorR, setErrorR]       = useState(null);
  const [errorL, setErrorL]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [stats, setStats]         = useState(null);

  const fetchReminders = useCallback(async () => {
    setLoadingR(true); setErrorR(null);
    try {
      const [all, s] = await Promise.all([reminderService.getAll(), reminderService.getStats()]);
      setReminders(Array.isArray(all) ? all : all.results ?? []);
      setStats(s);
    } catch { setErrorR('Failed to load reminders.'); }
    finally { setLoadingR(false); }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoadingL(true); setErrorL(null);
    try {
      const data = await leadsService.getAll({ ordering: '-created_at' });
      setLeads((Array.isArray(data) ? data : data.results ?? []).slice(0, 30));
    } catch { setErrorL('Failed to load activity.'); }
    finally { setLoadingL(false); }
  }, []);

  useEffect(() => { fetchReminders(); fetchLeads(); }, [fetchReminders, fetchLeads]);

  const pendingCount = reminders.filter((r) => !r.is_completed).length;
  const overdueCount = reminders.filter((r) => r.is_overdue).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats ? `${stats.pending} pending · ${stats.overdue} overdue` : 'Reminders and activity'}
          </p>
        </div>
        <button onClick={() => { fetchReminders(); fetchLeads(); }}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
          <p className="text-sm text-rose-700 font-medium">
            {overdueCount} reminder{overdueCount !== 1 ? 's are' : ' is'} overdue
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {[
          { key: 'reminders', label: 'Reminders', icon: Calendar, count: pendingCount },
          { key: 'activity',  label: 'Activity',  icon: Bell,     count: leads.length },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                activeTab === tab.key ? 'bg-orange-100 text-[#FF7F40]' : 'bg-gray-200 text-gray-500'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Reminders tab ──────────────────────────────────────────────────── */}
      {activeTab === 'reminders' && (
        <div className="space-y-3">
          <button onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-orange-200 hover:text-[#FF7F40] transition-all">
            <Plus className="h-4 w-4" /> Add Reminder
          </button>

          {loadingR
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-gray-100 rounded" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))
            : errorR
              ? <div className="text-center py-8"><p className="text-sm text-rose-600">{errorR}</p><button onClick={fetchReminders} className="mt-2 text-xs text-[#FF7F40] underline">Retry</button></div>
              : reminders.length === 0
                ? (
                  <div className="bg-white border border-gray-100 rounded-xl flex flex-col items-center py-12 gap-2">
                    <CheckCircle className="h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700">All caught up!</p>
                    <p className="text-xs text-gray-400">No reminders yet.</p>
                  </div>
                )
                : reminders.map((r) => (
                    <ReminderCard key={r.id} reminder={r}
                      onComplete={(updated) => setReminders((prev) => prev.map((x) => x.id === updated.id ? updated : x))}
                      onDelete={(id) => setReminders((prev) => prev.filter((x) => x.id !== id))}
                    />
                  ))
          }
        </div>
      )}

      {/* ── Activity tab ───────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Lead Activity</h2>
          </div>
          {loadingL
            ? <div className="divide-y divide-gray-50">{[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-6 py-4 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-3 w-3/4 bg-gray-100 rounded" /><div className="h-3 w-1/2 bg-gray-100 rounded" /></div>
                </div>))}</div>
            : errorL
              ? <div className="flex flex-col items-center py-10 gap-2"><p className="text-sm text-rose-600">{errorL}</p><button onClick={fetchLeads} className="text-xs text-[#FF7F40] underline">Retry</button></div>
              : leads.length === 0
                ? <div className="flex flex-col items-center py-12 gap-2"><Bell className="h-8 w-8 text-gray-300" /><p className="text-sm text-gray-400">No activity yet</p></div>
                : <div className="divide-y divide-gray-50">{leads.map((lead) => (
                    <div key={lead.id} className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${statusRingColor(lead.status)}`}>
                        <div className={`h-2.5 w-2.5 rounded-full ${statusDotColor(lead.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{statusToActivity(lead.status)}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate"><span className="font-medium text-gray-700">{lead.name}</span>{lead.company ? ` · ${lead.company}` : ''}</p>
                        <span className="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100 mt-1.5">
                          {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{formatDate(lead.created_at)}</span>
                    </div>))}</div>
          }
        </div>
      )}

      {showForm && <AddReminderForm leads={leads} onAdded={(r) => setReminders((prev) => [r, ...prev])} onClose={() => setShowForm(false)} />}
    </div>
  );
}