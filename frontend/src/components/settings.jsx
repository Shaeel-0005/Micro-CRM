/**
 * pages/Settings.jsx
 * User settings page with logout, profile, and preferences.
 * Branding: #FF7F40, white cards, same shadows as Layout/Overview.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, LogOut, ChevronRight,
  Moon, Globe, Trash2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

// ─── Row inside a section ─────────────────────────────────────────────────────
function SettingRow({ icon: Icon, label, description, children, danger }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 gap-4 ${danger ? 'hover:bg-rose-50' : 'hover:bg-gray-50'} transition-colors`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
          danger ? 'bg-rose-100' : 'bg-orange-50'
        }`}>
          <Icon className={`h-4 w-4 ${danger ? 'text-rose-500' : 'text-[#FF7F40]'}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-medium ${danger ? 'text-rose-600' : 'text-gray-900'}`}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-gray-500 truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#FF7F40]' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-[18px]' : 'translate-x-1'
      }`} />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Settings() {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification preferences (local state — connect to backend later)
  const [notifications, setNotifications] = useState({
    emailReminders:  true,
    leadUpdates:     true,
    weeklyDigest:    false,
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <Section title="Profile" description="Your account information">
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7F40] font-semibold text-lg border border-orange-200 flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.username ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email ?? 'No email on file'}</p>
          </div>
        </div>

        <SettingRow
          icon={User}
          label="Edit Profile"
          description="Update your name and contact details"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </SettingRow>

        <SettingRow
          icon={Shield}
          label="Change Password"
          description="Update your password regularly for security"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </SettingRow>
      </Section>

      {/* ── Notifications ────────────────────────────────────────────────── */}
      <Section title="Notifications" description="Choose what you want to be notified about">
        <SettingRow
          icon={Bell}
          label="Email Reminders"
          description="Get notified about upcoming follow-ups"
        >
          <Toggle
            enabled={notifications.emailReminders}
            onChange={(val) => setNotifications(n => ({ ...n, emailReminders: val }))}
          />
        </SettingRow>

        <SettingRow
          icon={Bell}
          label="Lead Updates"
          description="Alerts when a lead status changes"
        >
          <Toggle
            enabled={notifications.leadUpdates}
            onChange={(val) => setNotifications(n => ({ ...n, leadUpdates: val }))}
          />
        </SettingRow>

        <SettingRow
          icon={Globe}
          label="Weekly Digest"
          description="A summary of your pipeline every Monday"
        >
          <Toggle
            enabled={notifications.weeklyDigest}
            onChange={(val) => setNotifications(n => ({ ...n, weeklyDigest: val }))}
          />
        </SettingRow>
      </Section>

      {/* ── Appearance ───────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <SettingRow
          icon={Moon}
          label="Dark Mode"
          description="Coming soon"
        >
          <Toggle enabled={false} onChange={() => {}} />
        </SettingRow>
      </Section>

      {/* ── Danger zone ──────────────────────────────────────────────────── */}
      <Section title="Account">

        {/* Logout */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full text-left"
        >
          <SettingRow
            icon={LogOut}
            label="Log Out"
            description="Sign out of your LeadFlow account"
            danger
          >
            <ChevronRight className="h-4 w-4 text-rose-400" />
          </SettingRow>
        </button>

        {/* Delete account — placeholder */}
        <SettingRow
          icon={Trash2}
          label="Delete Account"
          description="Permanently delete your account and all data"
          danger
        >
          <ChevronRight className="h-4 w-4 text-rose-400" />
        </SettingRow>
      </Section>

      {/* ── Logout confirmation modal ─────────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>

            <h3 className="text-center text-lg font-semibold text-gray-900 mb-1">
              Log out?
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              You'll need to sign in again to access your leads and dashboard.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-all"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}