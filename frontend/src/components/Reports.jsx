/**
 * components/Reports.jsx
 * Day 13: Wired to Pandas analytics endpoint via analyticsService.
 * Includes monthly trend chart from real data.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, Target, Award, XCircle } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import { LEAD_SOURCE_DISPLAY, LEAD_STATUS_DISPLAY } from '../services/leadsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, loading }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#FF7F40]" />
        </div>
      </div>
      {loading
        ? <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
        : <>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </>
      }
    </div>
  );
}

// ─── Bar row ──────────────────────────────────────────────────────────────────

function BarRow({ label, count, total, color }) {
  const width = pct(count, total);
  return (
    <div className="group">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{label}</span>
        <span className="text-gray-900 font-semibold">{count}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${width}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{width}% of total</p>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

function DonutChart({ segments, total }) {
  if (total === 0) return <div className="flex items-center justify-center h-32 text-sm text-gray-400">No data yet</div>;

  let cumulative = 0;
  const radius = 40, cx = 60, cy = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0 -rotate-90">
        {segments.map((seg, i) => {
          const fraction   = seg.count / total;
          const dashArray  = `${fraction * circumference} ${circumference}`;
          const dashOffset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
              stroke={seg.hex} strokeWidth="18"
              strokeDasharray={dashArray} strokeDashoffset={dashOffset}
              className="transition-all duration-700" />
          );
        })}
        <circle cx={cx} cy={cy} r="28" fill="white" />
      </svg>
      <div className="space-y-2 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: seg.hex }} />
              <span className="text-xs text-gray-600">{seg.label}</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly trend chart ──────────────────────────────────────────────────────

function MonthlyTrendChart({ data, loading }) {
  if (loading) return <div className="h-24 bg-gray-50 animate-pulse rounded-xl" />;
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-6">No trend data yet</p>;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full relative flex-1 flex items-end">
            <div
              className="w-full bg-[#FF7F40] hover:bg-orange-600 rounded-t-sm transition-all duration-500 relative group"
              style={{ height: `${Math.max((d.count / max) * 100, 8)}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                {d.count} lead{d.count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <span className="text-[9px] text-gray-400 truncate w-full text-center">
            {d.month?.slice(5) ?? ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Reports() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await analyticsService.getDashboard();
      setData(result);
    } catch {
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total    = data?.total ?? 0;
  const won      = data?.by_status?.won ?? 0;
  const lost     = data?.by_status?.lost ?? 0;
  const active   = (data?.by_status?.new ?? 0) + (data?.by_status?.contacted ?? 0) + (data?.by_status?.in_progress ?? 0);
  const winRate  = data?.win_rate ?? 0;
  const convRate = data?.conversion_rate ?? 0;

  const statusSegments = [
    { label: 'New',         count: data?.by_status?.new ?? 0,         hex: '#9ca3af' },
    { label: 'Contacted',   count: data?.by_status?.contacted ?? 0,   hex: '#60a5fa' },
    { label: 'In Progress', count: data?.by_status?.in_progress ?? 0, hex: '#FF7F40' },
    { label: 'Won',         count: won,                                hex: '#10b981' },
    { label: 'Lost',        count: lost,                               hex: '#f87171' },
  ].filter((s) => s.count > 0);

  const sourceEntries  = Object.entries(data?.by_source ?? {}).sort(([, a], [, b]) => b - a);
  const statusColors   = { new: 'bg-gray-400', contacted: 'bg-blue-400', in_progress: 'bg-[#FF7F40]', won: 'bg-emerald-500', lost: 'bg-rose-400' };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-all">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Pandas-powered pipeline analytics</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target}     label="Total Leads"  value={total}          loading={loading} />
        <StatCard icon={TrendingUp} label="Active"       value={active}         loading={loading} sub="New + contacted + in progress" />
        <StatCard icon={Award}      label="Win Rate"     value={`${winRate}%`}  loading={loading} sub="Won vs closed deals" />
        <StatCard icon={XCircle}    label="Conversion"   value={`${convRate}%`} loading={loading} sub="Won vs total leads" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Leads by Status</h2>
          {loading ? <div className="h-28 bg-gray-50 animate-pulse rounded-xl" /> : <DonutChart segments={statusSegments} total={total} />}
        </div>

        {/* Monthly trend — from Pandas */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Monthly New Leads</h2>
          <MonthlyTrendChart data={data?.monthly_new} loading={loading} />
        </div>

        {/* Source bars */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Leads by Source</h2>
          {loading
            ? <div className="space-y-4">{[...Array(4)].map((_, i) => (<div key={i} className="space-y-1.5"><div className="h-3 w-24 bg-gray-100 animate-pulse rounded" /><div className="h-2 w-full bg-gray-100 animate-pulse rounded-full" /></div>))}</div>
            : sourceEntries.length === 0
              ? <p className="text-sm text-gray-400 text-center py-8">No source data yet</p>
              : <div className="space-y-4">{sourceEntries.map(([source, count]) => (<BarRow key={source} label={LEAD_SOURCE_DISPLAY[source] ?? source} count={count} total={total} color="bg-[#FF7F40]" />))}</div>
          }
        </div>

        {/* Win/loss */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Win / Loss Summary</h2>
          {loading
            ? <div className="h-32 bg-gray-50 animate-pulse rounded-xl" />
            : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-emerald-600">Won</span>
                    <span className="font-semibold text-gray-900">{won}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct(won, total)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-rose-500">Lost</span>
                    <span className="font-semibold text-gray-900">{lost}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full transition-all duration-700" style={{ width: `${pct(lost, total)}%` }} />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last 30 days</span>
                  <span className="text-sm font-semibold text-gray-900">{data?.last_30_days ?? 0} new leads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Win rate (closed)</span>
                  <span className="text-lg font-semibold text-gray-900">{winRate}%</span>
                </div>
              </div>
            )
          }
        </div>

      </div>
    </div>
  );
}