import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import { useAuth } from '../context/AuthContext';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?next=/invite/accept?token=${encodeURIComponent(token)}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await workspaceService.acceptInvite(token.trim());
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_-8px_rgba(255,127,64,0.15)] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-[#FF7F40]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Join Workspace</h1>
            <p className="text-sm text-gray-500">Enter your invite token to join the team</p>
          </div>
        </div>

        {success ? (
          <div className="flex items-center gap-3 text-emerald-600 text-sm">
            <CheckCircle className="h-5 w-5" />
            Invite accepted! Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Invite Token</label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste invite token"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-gray-500">
                You need to <Link to="/login" className="text-[#FF7F40] font-medium">sign in</Link> first with the email the invite was sent to.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#FF7F40] py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Accept Invite'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
