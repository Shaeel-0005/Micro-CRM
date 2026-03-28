/**
 * pages/Overview.jsx
 * Day 10: Added upcoming reminders widget.
 * Day 13: Stats now from analyticsService (Pandas endpoint).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Target, PieChart, Briefcase,
  ChevronUp, TrendingDown, RefreshCw, AlertCircle,
  Clock, CheckCircle, ArrowRight, TrendingUp
} from 'lucide-react';
import analyticsService from '../services/analyticsService';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
} from '../services/leadsService';
import reminderService from '../services/reminderService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const diff  = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  if (days < 7)   return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
};

const formatDueDate = (dateString) => {
  const diff  = new Date(dateString) - new Date();
  const hours = Math.floor(Math.abs(diff) / 3_600_000);
  const days  = Math.floor(Math.abs(diff) / 86_400_000);
  if (diff < 0) return hours < 24 ? `${hours}h overdue` : `${days}d overdue`;
  if (hours < 1)  return 'Due now';
  if (hours < 24) return `In ${hours}h`;
  if (days === 1) return 'Tomorrow';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statusToColor = (status) => ({
  won: 'emerald', in_progress: 'orange', contacted: 'blue', lost: 'rose', new: 'gray',
}[status] ?? 'gray');

const statusToActivity = (status) => ({
  won: 'Deal closed — Won 🎉', lost: 'Deal marked as lost',
  in_progress: 'Lead moved to In Progress', contacted: 'Lead contacted', new: 'New lead added',
}[status] ?? 'Lead updated');

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, isPositive, subtext, loading }) {
  return (
    <div className="transition-transform hover:-translate-y-0.5 bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FF7F40]" />
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-3 sm:items-baseline">
        {loading
          ? <div className="h-7 w-20 rounded-md bg-gray-100 animate-pulse" />
          : (
            <>
              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">{value}</span>
              {change !== undefined && (
                <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium rounded py-0.5 px-1.5 w-fit ${
                  isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                }`}>
                  {isPositive ? <ChevronUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {change}
                </span>
              )}
              {subtext && <span className="text-[10px] sm:text-xs font-medium text-gray-500">{subtext}</span>}
            </>
          )
        }
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>{[...Array(5)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
      </td>
    ))}</tr>
  );
}

// ─── Reminders widget ─────────────────────────────────────────────────────────

function RemindersWidget({ loading, reminders, onComplete }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] h-fit">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Upcoming Reminders</h3>
        <button
          onClick={() => navigate('/inbox')}
          className="text-xs text-[#FF7F40] hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          : reminders.length === 0
            ? (
              <div className="flex flex-col items-center py-4 gap-2 text-center">
                <CheckCircle className="h-7 w-7 text-gray-200" />
                <p className="text-xs text-gray-400">No upcoming reminders</p>
              </div>
            )
            : reminders.map((r) => {
                const isOverdue = new Date(r.reminder_date) < new Date();
                return (
                  <div key={r.id} className="flex items-start gap-3 group">
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      isOverdue ? 'bg-rose-100' : 'bg-orange-50'
                    }`}>
                      <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-500' : 'text-[#FF7F40]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      {r.lead_name && (
                        <p className="text-xs text-gray-500 truncate">{r.lead_name}</p>
                      )}
                      <p className={`text-xs font-medium mt-0.5 ${isOverdue ? 'text-rose-500' : 'text-[#FF7F40]'}`}>
                        {formatDueDate(r.reminder_date)}
                      </p>
                    </div>
                    <button
                      onClick={() => onComplete(r.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-5 w-5 rounded-full border-2 border-gray-300 hover:border-[#FF7F40] hover:bg-orange-50 mt-1"
                      title="Mark done"
                    />
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Overview() {
  const [analytics, setAnalytics]   = useState(null);
  const [recentLeads, setLeads]     = useState([]);
  const [reminders, setReminders]   = useState([]);
  const [loadingA, setLoadingA]     = useState(true);
  const [loadingL, setLoadingL]     = useState(true);
  const [loadingR, setLoadingR]     = useState(true);
  const [error, setError]           = useState(null);

  const fetchAll = useCallback(async () => {
    setLoadingA(true); setLoadingL(true); setLoadingR(true);
    setError(null);

    try {
      const [analyticsData, leadsData, remindersData] = await Promise.all([
        analyticsService.getDashboard(),
        leadsService.getAll({ ordering: '-created_at' }),
        reminderService.getUpcoming(),
      ]);

      setAnalytics(analyticsData);

      const leads = Array.isArray(leadsData) ? leadsData : leadsData.results ?? [];
      setLeads(leads.slice(0, 5));

      const rems = Array.isArray(remindersData) ? remindersData : remindersData.results ?? [];
      setReminders(rems);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoadingA(false); setLoadingL(false); setLoadingR(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReminderComplete = async (id) => {
    try {
      await reminderService.toggleComplete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silently ignore */ }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const total    = analytics?.total ?? 0;
  const won      = analytics?.by_status?.won ?? 0;
  const active   = (analytics?.by_status?.new ?? 0)
                 + (analytics?.by_status?.contacted ?? 0)
                 + (analytics?.by_status?.in_progress ?? 0);
  const winRate  = analytics?.win_rate ?? 0;
  const trendPct = analytics?.trend_pct ?? 0;

  const pipelineStages = [
    { name: 'New',         leads: analytics?.by_status?.new ?? 0,         highlight: false },
    { name: 'Contacted',   leads: analytics?.by_status?.contacted ?? 0,   highlight: false },
    { name: 'In Progress', leads: analytics?.by_status?.in_progress ?? 0, highlight: false },
    { name: 'Won',         leads: won,                                     highlight: true  },
  ].map((s) => ({
    ...s,
    percentage: total > 0 ? Math.round((s.leads / total) * 100) : 0,
  }));

  const sourceEntries = Object.entries(analytics?.by_source ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const statsCards = [
    { label: 'Total Leads',  value: total.toString(),    icon: Target,    change: trendPct !== 0 ? `${Math.abs(trendPct)}%` : undefined, isPositive: trendPct >= 0 },
    { label: 'Active',       value: active.toString(),   icon: Briefcase  },
    { label: 'Won',          value: won.toString(),       icon: DollarSign },
    { label: 'Win Rate',     value: `${winRate}%`,        icon: PieChart,  isPositive: winRate >= 30 },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button onClick={fetchAll} className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-all">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsCards.map((card, idx) => (
          <StatCard key={idx} {...card} loading={loadingA} />
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-3">

        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Recent leads table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Your latest lead activity</p>
              </div>
              <button onClick={fetchAll} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 w-fit transition-all">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {loadingL
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 space-y-2 animate-pulse">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                  ))
                : recentLeads.length === 0
                  ? <div className="p-6 text-center text-sm text-gray-500">No leads yet.</div>
                  : recentLeads.map((lead) => (
                      <div key={lead.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">
                              {lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{lead.name}</p>
                              <p className="text-xs text-gray-500">{lead.company || '—'}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                            {LEAD_STATUS_DISPLAY[lead.status]}
                          </span>
                        </div>
                      </div>
                    ))
              }
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs uppercase font-medium text-gray-400">
                    <th className="px-6 py-3">Lead</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingL
                    ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                    : recentLeads.length === 0
                      ? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No leads yet.</td></tr>
                      : recentLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">
                                  {lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <p className="font-medium text-gray-900">{lead.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{lead.company || '—'}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                {LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                                {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-gray-400">
                              {formatRelativeTime(lead.created_at)}
                            </td>
                          </tr>
                        ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline + Source charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline by Status</h3>
              {loadingA
                ? <div className="space-y-4">{[...Array(4)].map((_, i) => (<div key={i} className="space-y-1"><div className="h-3 w-24 bg-gray-100 animate-pulse rounded" /><div className="h-2 w-full bg-gray-100 animate-pulse rounded-full" /></div>))}</div>
                : <div className="space-y-4">{pipelineStages.map((s, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 font-medium group-hover:text-gray-900">{s.name}</span>
                        <span className="text-gray-900 font-medium">{s.leads} lead{s.leads !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${s.highlight ? 'bg-emerald-500' : 'bg-[#FF7F40]'}`} style={{ width: `${s.percentage}%` }} />
                      </div>
                    </div>
                  ))}</div>
              }
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Leads by Source</h3>
              {loadingA
                ? <div className="space-y-3">{[...Array(4)].map((_, i) => (<div key={i} className="flex items-center justify-between"><div className="h-3 w-20 bg-gray-100 animate-pulse rounded" /><div className="h-3 w-8 bg-gray-100 animate-pulse rounded" /></div>))}</div>
                : sourceEntries.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-6">No source data yet</p>
                  : <div className="space-y-3">{sourceEntries.map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#FF7F40]" />
                          <span className="text-sm text-gray-600">{LEAD_SOURCE_DISPLAY[source] ?? source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-[#FF7F40]" style={{ width: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%' }} />
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-4 text-right">{count}</span>
                        </div>
                      </div>
                    ))}</div>
              }
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Reminders widget — Day 10 */}
          <RemindersWidget
            loading={loadingR}
            reminders={reminders}
            onComplete={handleReminderComplete}
          />

          {/* Activity feed */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] h-fit">
            <div className="border-b border-gray-100 px-4 sm:px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {loadingL
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 bg-gray-100 rounded" />
                        <div className="h-3 w-1/2 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))
                : recentLeads.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
                  : recentLeads.map((lead) => {
                      const color = statusToColor(lead.status);
                      return (
                        <div key={lead.id} className="flex gap-3">
                          <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                            color === 'emerald' ? 'bg-emerald-100' : color === 'orange' ? 'bg-orange-100' : color === 'blue' ? 'bg-blue-100' : color === 'rose' ? 'bg-rose-100' : 'bg-gray-100'
                          }`}>
                            <div className={`h-2 w-2 rounded-full ${
                              color === 'emerald' ? 'bg-emerald-500' : color === 'orange' ? 'bg-[#FF7F40]' : color === 'blue' ? 'bg-blue-400' : color === 'rose' ? 'bg-rose-400' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{statusToActivity(lead.status)}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {lead.name}{lead.company ? ` · ${lead.company}` : ''} · {formatRelativeTime(lead.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}