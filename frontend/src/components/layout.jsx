/**
 * components/Layout.jsx
 * Day 9 fix:
 *  1. Complete toggle inside bell popover — badge drops immediately
 *  2. Badge polls every 60s so it stays accurate
 *  3. Toast appears automatically when a reminder becomes due
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Users, BarChart3,
  Inbox, Settings, Menu, X, Search, Bell, Plus,
  Clock, AlertCircle, CheckCircle, Loader2, Check, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import reminderService from '../services/reminderService';

const PRIMARY_NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
];

const PAGE_META = [
  { path: '/dashboard', section: 'Dashboard', title: 'Overview' },
  { path: '/pipeline', section: 'Leads', title: 'Pipeline' },
  { path: '/contacts', section: 'Leads', title: 'Contacts' },
  { path: '/reports', section: 'Analytics', title: 'Reports' },
  { path: '/inbox', section: 'Follow-ups', title: 'Inbox' },
  { path: '/settings', section: 'Workspace', title: 'Settings' },
];

function getPageMeta(pathname) {
  return (
    PAGE_META.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`)) ??
    PAGE_META[0]
  );
}

function SidebarNavLink({ to, label, icon, end = false, badge, onClick }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
        isActive
          ? 'bg-orange-50 text-gray-900 border border-orange-100'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto rounded-full bg-[#FF7F40] px-2 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function WorkspaceQuickLink({ to, label, icon, active = false, onClick }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-orange-50 text-gray-900 border border-orange-100'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="h-4 w-4 text-[#FF7F40]" />
      <span>{label}</span>
    </Link>
  );
}

// ─── Due toast ────────────────────────────────────────────────────────────────
// Appears in bottom-right when a reminder just became due.

function DueToast({ reminder, onDismiss, onComplete }) {
  const [completing, setCompleting] = useState(false);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await reminderService.toggleComplete(reminder.id);
      onComplete(reminder.id);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80 bg-white border border-orange-200 rounded-xl shadow-xl shadow-orange-100 p-4 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Clock className="h-4 w-4 text-[#FF7F40]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#FF7F40] uppercase tracking-wider mb-0.5">
            Reminder Due
          </p>
          <p className="text-sm font-medium text-gray-900 truncate">{reminder.title}</p>
          {reminder.lead_name && (
            <p className="text-xs text-gray-500 mt-0.5">{reminder.lead_name}</p>
          )}
        </div>
        <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onDismiss}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Dismiss
        </button>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="flex-1 rounded-lg bg-[#FF7F40] py-1.5 text-xs font-medium text-white hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {completing
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Check className="h-3 w-3" />
          }
          Mark done
        </button>
      </div>
    </div>
  );
}

// ─── Bell popover ─────────────────────────────────────────────────────────────

function BellPopover({ onClose, onBadgeChange }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState(null);
  const navigate                  = useNavigate();

  // Fetch on open
  useEffect(() => {
    (async () => {
      try {
        const [all, s] = await Promise.all([
          reminderService.getAll(),
          reminderService.getStats(),
        ]);
        const list = Array.isArray(all) ? all : all.results ?? [];
        setReminders(
          list
            .filter((r) => !r.is_completed)
            .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
            .slice(0, 6)
        );
        setStats(s);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Mark complete from inside the popover ──────────────────────────────────
  const handleComplete = async (id) => {
    try {
      await reminderService.toggleComplete(id);
      // Remove from popover list immediately
      setReminders((prev) => prev.filter((r) => r.id !== id));
      // Update stats
      setStats((prev) =>
        prev ? { ...prev, pending: Math.max(0, prev.pending - 1) } : prev
      );
      // Tell Layout to drop the badge count by 1
      onBadgeChange((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const isOverdue = (r) => new Date(r.reminder_date) < new Date();

  const formatDue = (dateString) => {
    const diff  = new Date(dateString) - new Date();
    const hours = Math.floor(Math.abs(diff) / 3_600_000);
    const days  = Math.floor(Math.abs(diff) / 86_400_000);
    if (diff < 0) return hours < 24 ? `${hours}h overdue` : `${days}d overdue`;
    if (hours < 1)  return 'Due now';
    if (hours < 24) return `In ${hours}h`;
    if (days === 1) return 'Tomorrow';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/60 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#FF7F40]" />
          <span className="text-sm font-semibold text-gray-900">Reminders</span>
          {stats && stats.pending > 0 && (
            <span className="rounded-full bg-[#FF7F40] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
              {stats.pending}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Overdue banner */}
      {stats?.overdue > 0 && (
        <div className="flex items-center gap-2 bg-rose-50 border-b border-rose-100 px-4 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
          <p className="text-xs text-rose-600 font-medium">
            {stats.overdue} overdue reminder{stats.overdue !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Body */}
      <div className="max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <CheckCircle className="h-7 w-7 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">All caught up!</p>
            <p className="text-xs text-gray-400">No pending reminders.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reminders.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-3 px-4 py-3 group hover:bg-gray-50 transition-colors ${
                  isOverdue(r) ? 'bg-rose-50/40' : ''
                }`}
              >
                {/* Complete button */}
                <button
                  onClick={() => handleComplete(r.id)}
                  className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                    isOverdue(r)
                      ? 'border-rose-300 hover:border-rose-500 hover:bg-rose-100'
                      : 'border-gray-300 hover:border-[#FF7F40] hover:bg-orange-50'
                  }`}
                  title="Mark as done"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  {r.lead_name && (
                    <p className="text-xs text-gray-400 truncate">{r.lead_name}</p>
                  )}
                </div>

                {/* Due badge */}
                <span className={`flex-shrink-0 text-[10px] font-semibold rounded-md px-1.5 py-0.5 ${
                  isOverdue(r)
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-orange-50 text-[#FF7F40]'
                }`}>
                  {formatDue(r.reminder_date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <button
          onClick={() => { navigate('/inbox'); onClose(); }}
          className="w-full rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-100 py-2 text-xs font-medium text-gray-600 hover:text-[#FF7F40] transition-all"
        >
          View all in Inbox →
        </button>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout() {
  const { user, workspace, permissions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [reminderBadge, setReminderBadge] = useState(0);
  const [dueToast, setDueToast] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const bellRef = useRef(null);

  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);
  const workspaceName = workspace?.name ?? user?.workspace?.name ?? 'LeadFlow Workspace';
  const roleLabel = workspace?.role_display ?? workspace?.role ?? user?.workspace?.role_display ?? user?.workspace?.role ?? 'Member';
  const userName = user?.username ?? 'Guest';
  const userInitial = (userName.trim().charAt(0) || 'U').toUpperCase();

  const workspaceLinks = useMemo(() => {
    const links = [];
    if (permissions?.can_manage_invites || permissions?.can_manage_team) {
      links.push({ to: '/settings#team', label: 'Team & Invites', icon: Users, hash: '#team' });
    }
    if (permissions?.can_view_audit_log) {
      links.push({ to: '/settings#audit', label: 'Activity Log', icon: Clock, hash: '#audit' });
    }
    if (permissions?.can_export_csv) {
      links.push({ to: '/settings#export', label: 'CSV Export', icon: Download, hash: '#export' });
    }
    return links;
  }, [permissions]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // ── Fetch badge count ───────────────────────────────────────────────────────
  const refreshBadge = useCallback(async () => {
    try {
      const s = await reminderService.getStats();
      setReminderBadge(s.pending ?? 0);
    } catch {
      // silently ignore
    }
  }, []);

  // On mount + every 60s — keeps badge accurate
  useEffect(() => {
    const initialLoad = setTimeout(refreshBadge, 0);
    const interval = setInterval(refreshBadge, 60_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [refreshBadge]);

  // ── Poll for due reminders every 60s → show toast ──────────────────────────
  useEffect(() => {
    const checkDue = async () => {
      try {
        const overdue = await reminderService.getOverdue();
        const list    = Array.isArray(overdue) ? overdue : overdue.results ?? [];
        // Show toast for the most urgent one (if not already showing)
        if (list.length > 0 && !dueToast) {
          setDueToast(list[0]);
        }
      } catch {
        // silently ignore
      }
    };

    checkDue();
    const interval = setInterval(checkDue, 60_000);
    return () => clearInterval(interval);
  }, [dueToast]);

  // ── Close popover on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  // ── Toast handlers ──────────────────────────────────────────────────────────
  const dismissToast = useCallback(() => setDueToast(null), []);

  const completeFromToast = useCallback(() => {
    setDueToast(null);
    setReminderBadge((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    const query = searchValue.trim();
    setSidebarOpen(false);
    setBellOpen(false);
    navigate(query ? `/contacts?search=${encodeURIComponent(query)}` : '/contacts');
  }, [navigate, searchValue]);

  const handleAddLead = useCallback(() => {
    setSidebarOpen(false);
    setBellOpen(false);
    navigate('/contacts?new=1');
  }, [navigate]);

  const closeSidebarMenu = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleMobileSearch = useCallback(() => {
    setSidebarOpen(false);
    navigate('/contacts');
  }, [navigate]);

  const closeLeadFormQuery = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.delete('new');
    const query = params.toString();
    navigate(
      query ? { pathname: '/contacts', search: `?${query}` } : '/contacts',
      { replace: true }
    );
  }, [location.search, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFCF8] text-gray-800 antialiased selection:bg-orange-100 selection:text-orange-600">

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/50 z-30 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:relative w-64 h-full flex flex-col border-r border-gray-100 bg-white z-40 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF7F40] shadow-lg shadow-orange-500/20" />
            <div className="min-w-0">
              <span className="block text-base sm:text-lg font-medium tracking-tight text-gray-900">
                LeadFlow
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-gray-400">
                {workspaceName}
              </span>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pt-4 sm:pt-6 px-2 sm:px-3 pb-4 sm:pb-6 space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <SidebarNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              end={item.end}
              badge={item.to === '/inbox' && reminderBadge > 0 ? (reminderBadge > 9 ? '9+' : reminderBadge) : null}
              onClick={closeSidebarMenu}
            />
          ))}

          {workspaceLinks.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Workspace
              </p>
              <div className="space-y-1">
                {workspaceLinks.map((item) => (
                  <WorkspaceQuickLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    active={location.pathname === '/settings' && location.hash === item.hash}
                    onClick={closeSidebarMenu}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3 sm:p-4">
          <NavLink
            to="/settings"
            onClick={closeSidebarMenu}
            className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-medium transition-all ${
              isActive ? 'bg-orange-50 text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-900" />
            Settings
          </NavLink>
          <div className="mt-3 sm:mt-4 flex items-center gap-3 px-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-[#FF7F40] ring-2 ring-white">
              {userInitial}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-gray-900">{userName}</p>
              <p className="truncate text-xs text-gray-400">
                {workspaceName} - {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FFFCF8]">

        {/* Header */}
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-1" onClick={toggleSidebar}>
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#FF7F40]" />
              <div className="min-w-0">
                <span className="block text-base sm:text-lg font-medium tracking-tight text-gray-900">
                  LeadFlow
                </span>
                <span className="block text-[10px] text-gray-400">{pageMeta.title}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <nav className="flex items-center text-sm font-medium text-gray-500">
              <span className="text-gray-500">{workspaceName}</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-900">{pageMeta.title}</span>
            </nav>
            <p className="mt-1 text-xs text-gray-400">{pageMeta.section}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
            <button
              type="button"
              className="sm:hidden rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              onClick={handleMobileSearch}
            >
              <Search className="h-5 w-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search leads..."
                className="h-9 w-40 md:w-56 lg:w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none ring-orange-200 transition-all focus:bg-white focus:ring-2 focus:border-transparent placeholder:text-gray-400"
              />
            </form>

            {/* Bell with popover */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen((open) => !open)}
                className={`relative rounded-lg p-2 transition-colors ${
                  bellOpen ? 'bg-orange-50 text-[#FF7F40]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <Bell className="h-5 w-5" />
                {reminderBadge > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF7F40] text-[9px] font-bold text-white border-2 border-white">
                    {reminderBadge > 9 ? '9+' : reminderBadge}
                  </span>
                )}
              </button>

              {bellOpen && (
                <BellPopover
                  onClose={() => {
                    setBellOpen(false);
                    refreshBadge();
                  }}
                  onBadgeChange={setReminderBadge}
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleAddLead}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF7F40] px-3 sm:px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
          <Outlet context={{ closeLeadFormQuery }} />
        </div>
      </main>

      {/* ── Due toast — bottom right ─────────────────────────────────────────── */}
      {dueToast && (
        <DueToast
          reminder={dueToast}
          onDismiss={dismissToast}
          onComplete={completeFromToast}
        />
      )}
    </div>
  );
}
