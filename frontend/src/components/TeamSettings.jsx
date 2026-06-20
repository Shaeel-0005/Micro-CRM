import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, Mail, Shield, Download, RefreshCw, AlertCircle,
  Copy, Check, MessageCircle, Link2,
} from 'lucide-react';
import workspaceService, {
  WORKSPACE_ROLE_DISPLAY,
  buildInviteAcceptUrl,
  buildWhatsAppInviteShareUrl,
} from '../services/workspaceService';
import api from '../services/api';

function InviteLinkActions({ invite, workspaceName }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = buildInviteAcceptUrl(invite.token);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select not needed for MVP */
    }
  };

  const whatsappUrl = buildWhatsAppInviteShareUrl({
    inviteUrl,
    workspaceName,
    role: invite.role,
    inviteeEmail: invite.email,
  });

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
        title={inviteUrl}
      >
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
      >
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </a>
    </div>
  );
}

function TeamSettings() {
  const [workspace, setWorkspace] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMsg, setInviteMsg] = useState('');
  const [lastInvite, setLastInvite] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const me = await workspaceService.getMe();
      setWorkspace(me.workspace);
      setPermissions(me.permissions || {});
      const memberData = await workspaceService.getMembers();
      setMembers(Array.isArray(memberData) ? memberData : memberData.results ?? []);
      if (me.permissions?.can_manage_invites) {
        const inviteData = await workspaceService.getInvites();
        setInvites(Array.isArray(inviteData) ? inviteData : []);
      }
      if (me.permissions?.can_view_audit_log) {
        const auditData = await workspaceService.getAuditLog();
        setAudit(Array.isArray(auditData) ? auditData : auditData.results ?? []);
      }
    } catch {
      setError('Failed to load team settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMsg('');
    setLastInvite(null);
    try {
      const invite = await workspaceService.createInvite(inviteEmail, inviteRole);
      setLastInvite(invite);
      setInviteMsg(`Invite created for ${invite.email}. Copy the link or share via WhatsApp.`);
      setInviteEmail('');
      fetchAll();
    } catch (err) {
      setInviteMsg(err.response?.data?.detail || 'Failed to create invite.');
    }
  };

  const handleRoleChange = async (memberId, role) => {
    await workspaceService.updateMember(memberId, { role });
    fetchAll();
  };

  const handleExport = async () => {
    const response = await api.get('/leads/export_csv/', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading team settings...</div>;
  }

  if (error) {
    return (
      <div className="p-6 flex items-center gap-2 text-rose-600 text-sm">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FF7F40]" />
              {workspace?.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Workspace team & permissions</p>
          </div>
          <button onClick={fetchAll} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF7F40]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="text-left py-2">Member</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{m.username}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </td>
                  <td className="py-3">
                    {permissions.can_manage_team ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                      >
                        {Object.entries(WORKSPACE_ROLE_DISPLAY).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      WORKSPACE_ROLE_DISPLAY[m.role] || m.role
                    )}
                  </td>
                  <td className="py-3 text-gray-600">{m.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {permissions.can_manage_invites && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#FF7F40]" /> Invite Team Member
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            No email is sent. After creating an invite, share the link via WhatsApp or copy — invitee signs up with the same email, then opens the link.
          </p>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@agency.com"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
            <button type="submit" className="rounded-lg bg-[#FF7F40] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
              Create Invite
            </button>
          </form>
          {inviteMsg && <p className="text-xs text-gray-600 mt-2">{inviteMsg}</p>}
          {lastInvite && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" /> Share invite for {lastInvite.email}
              </p>
              <p className="text-xs font-mono text-gray-600 break-all mb-2">
                {buildInviteAcceptUrl(lastInvite.token)}
              </p>
              <InviteLinkActions invite={lastInvite} workspaceName={workspace?.name} />
            </div>
          )}
          {invites.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase">Pending Invites</p>
              {invites.map((inv) => (
                <div key={inv.id} className="text-xs border border-gray-100 rounded-lg p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-gray-700">
                      {inv.email} ({WORKSPACE_ROLE_DISPLAY[inv.role]})
                    </span>
                    <span className="text-gray-400">expires {new Date(inv.expires_at).toLocaleDateString()}</span>
                  </div>
                  <InviteLinkActions invite={inv} workspaceName={workspace?.name} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {permissions.can_export_csv && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> Export Leads CSV
          </button>
        </div>
      )}

      {permissions.can_view_audit_log && audit.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#FF7F40]" /> Activity Audit Log
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {audit.slice(0, 20).map((entry) => (
              <div key={entry.id} className="text-xs border-b border-gray-50 pb-2">
                <span className="font-medium text-gray-900">{entry.action}</span>
                <span className="text-gray-500"> — {entry.actor_name || 'System'} — {new Date(entry.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamSettings;
