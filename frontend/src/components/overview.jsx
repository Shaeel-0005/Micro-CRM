/**
 * pages/Overview.jsx
 * Dashboard overview — fully connected to backend via leadsService.
 * No hardcoded sample data. All stats and leads are real.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Target, PieChart, Briefcase,
  ChevronUp, TrendingDown, RefreshCw, AlertCircle
} from 'lucide-react';
import leadsService, {
  LEAD_STATUS_DISPLAY,
  LEAD_SOURCE_DISPLAY,
} from '../services/leadsService';


// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a relative timestamp from an ISO date string.
 * e.g. "2 hours ago", "3 days ago"
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
};

/**
 * Map a backend status value to a Tailwind color token for activity dots.
 */
const statusToColor = (status) => {
  if (status === 'won') return 'emerald';
  if (status === 'in_progress' || status === 'contacted') return 'orange';
  return 'gray';
};

/**
 * Map a backend status to a human-readable activity description.
 */
const statusToActivity = (status) => {
  const map = {
    won:         'Deal closed — Won',
    lost:        'Deal marked as lost',
    in_progress: 'Proposal in progress',
    contacted:   'Lead contacted',
    new:         'New lead added',
  };
  return map[status] ?? 'Lead updated';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, change, isPositive, subtext, icon: Icon, loading }) {
  return (
    <div className="transition-transform hover:-translate-y-0.5 bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FF7F40]" />
      </div>

      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-3 sm:items-baseline">
        {loading ? (
          <div className="h-7 w-20 rounded-md bg-gray-100 animate-pulse" />
        ) : (
          <>
            <span className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              {value}
            </span>

            {change !== undefined && (
              <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium rounded py-0.5 px-1.5 w-fit ${
                isPositive
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-rose-600 bg-rose-50'
              }`}>
                {isPositive
                  ? <ChevronUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {change}
              </span>
            )}

            {subtext && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                {subtext}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Overview() {
  const [stats, setStats]           = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError]           = useState(null);

  // Fetch stats and recent leads in parallel
  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingLeads(true);
    setError(null);

    try {
      const [statsData, leadsData] = await Promise.all([
        leadsService.getStats(),
        leadsService.getAll({ ordering: '-created_at' }),
      ]);

      setStats(statsData);

      // Use the 5 most recent leads for the table + activity feed
      const leads = Array.isArray(leadsData)
        ? leadsData
        : leadsData.results ?? [];

      setRecentLeads(leads.slice(0, 5));
    } catch (err) {
      console.error('Overview fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoadingStats(false);
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived display values ──────────────────────────────────────────────────

  const total     = stats?.total ?? 0;
  const won       = stats?.by_status?.won ?? 0;
  const active    = (stats?.by_status?.new ?? 0)
                  + (stats?.by_status?.contacted ?? 0)
                  + (stats?.by_status?.in_progress ?? 0);
  const winRate   = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';

  // Pipeline stages derived from real stats
  const pipelineStages = [
    {
      name:    'New',
      leads:   stats?.by_status?.new ?? 0,
      percentage: total > 0 ? Math.round(((stats?.by_status?.new ?? 0) / total) * 100) : 0,
    },
    {
      name:    'Contacted',
      leads:   stats?.by_status?.contacted ?? 0,
      percentage: total > 0 ? Math.round(((stats?.by_status?.contacted ?? 0) / total) * 100) : 0,
    },
    {
      name:    'In Progress',
      leads:   stats?.by_status?.in_progress ?? 0,
      percentage: total > 0 ? Math.round(((stats?.by_status?.in_progress ?? 0) / total) * 100) : 0,
    },
    {
      name:    'Won',
      leads:   won,
      percentage: total > 0 ? Math.round((won / total) * 100) : 0,
      highlight: true,
    },
  ];

  // Source breakdown for activity sidebar
  const sourceBreakdown = Object.entries(stats?.by_source ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // ── Stat cards config ───────────────────────────────────────────────────────
  const statsCards = [
    {
      label:      'Total Leads',
      value:      total.toString(),
      change:     undefined,
      icon:       Target,
    },
    {
      label:      'Active Leads',
      value:      active.toString(),
      isPositive: true,
      icon:       Briefcase,
    },
    {
      label:      'Won',
      value:      won.toString(),
      isPositive: true,
      icon:       DollarSign,
    },
    {
      label:      'Win Rate',
      value:      `${winRate}%`,
      isPositive: parseFloat(winRate) >= 30,
      icon:       PieChart,
    },
  ];

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsCards.map((card, idx) => (
          <StatCard key={idx} {...card} loading={loadingStats} />
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-3">

        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Recent Leads Table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  Your latest lead activity
                </p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 w-fit transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>

            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-gray-100">
              {loadingLeads
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                      <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
                    </div>
                  ))
                : recentLeads.length === 0
                  ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No leads yet. Add your first lead to get started.
                    </div>
                  )
                  : recentLeads.map((lead) => {
                      const initials = lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <div key={lead.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{lead.name}</p>
                                <p className="text-xs text-gray-500">{lead.company || '—'}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-[#FF7F40] ring-1 ring-inset ring-orange-100">
                              {LEAD_STATUS_DISPLAY[lead.status] ?? lead.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {LEAD_SOURCE_DISPLAY[lead.source] ?? lead.source}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(lead.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
              }
            </div>

            {/* Desktop table view */}
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
                  {loadingLeads
                    ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                    : recentLeads.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                            No leads yet. Add your first lead to get started.
                          </td>
                        </tr>
                      )
                      : recentLeads.map((lead) => {
                          const initials = lead.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <tr
                              key={lead.id}
                              className="group hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#FF7F40] font-semibold text-xs border border-orange-100">
                                    {initials}
                                  </div>
                                  <p className="font-medium text-gray-900">{lead.name}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {lead.company || '—'}
                              </td>
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
                          );
                        })
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            {/* Pipeline by status */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline by Status</h3>
              {loadingStats
                ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
                        <div className="h-2 w-full bg-gray-100 animate-pulse rounded-full" />
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div className="space-y-4">
                    {pipelineStages.map((stage, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 font-medium group-hover:text-gray-900">
                            {stage.name}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {stage.leads} lead{stage.leads !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              stage.highlight ? 'bg-emerald-500' : 'bg-[#FF7F40]'
                            }`}
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            {/* Leads by source */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Leads by Source</h3>
              {loadingStats
                ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
                        <div className="h-3 w-8 bg-gray-100 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                )
                : sourceBreakdown.length === 0
                  ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No source data yet
                    </p>
                  )
                  : (
                    <div className="space-y-3">
                      {sourceBreakdown.map(([source, count], idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#FF7F40]" />
                            <span className="text-sm text-gray-600">
                              {LEAD_SOURCE_DISPLAY[source] ?? source}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-[#FF7F40]"
                                style={{
                                  width: total > 0
                                    ? `${Math.round((count / total) * 100)}%`
                                    : '0%'
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-900 w-4 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          </div>
        </div>

        {/* Right column — Activity feed */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] h-fit">
          <div className="border-b border-gray-100 px-4 sm:px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {loadingLeads
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))
              : recentLeads.length === 0
                ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No activity yet
                  </p>
                )
                : recentLeads.map((lead) => {
                    const color = statusToColor(lead.status);
                    return (
                      <div key={lead.id} className="flex gap-3">
                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                          color === 'emerald' ? 'bg-emerald-100'
                          : color === 'orange' ? 'bg-orange-100'
                          : 'bg-gray-100'
                        }`}>
                          <div className={`h-2 w-2 rounded-full ${
                            color === 'emerald' ? 'bg-emerald-500'
                            : color === 'orange' ? 'bg-[#FF7F40]'
                            : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {statusToActivity(lead.status)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {lead.name}
                            {lead.company ? ` · ${lead.company}` : ''}
                            {' · '}
                            {formatRelativeTime(lead.created_at)}
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
  );
}