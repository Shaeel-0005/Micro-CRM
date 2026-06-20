import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import { useAuth } from '../context/AuthContext';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const acceptToken = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      await workspaceService.acceptInvite(trimmed);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept invite.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-accept when user opens a share link while already signed in
  useEffect(() => {
    if (authLoading || !isAuthenticated || !tokenFromUrl || success || loading) return;
    acceptToken(tokenFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
      return;
    }
    await acceptToken(token);
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
            <p className="text-sm text-gray-500">
              {tokenFromUrl ? 'Accepting your team invite…' : 'Paste your invite link or token'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="flex items-center gap-3 text-emerald-600 text-sm">
            <CheckCircle className="h-5 w-5" />
            Invite accepted! Redirecting to dashboard...
          </div>
        ) : loading && tokenFromUrl ? (
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF7F40]" />
            Joining workspace...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}
            {!tokenFromUrl && (
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
            )}
            {!isAuthenticated && (
              <p className="text-xs text-gray-500">
                Sign up or <Link to={`/login?next=${encodeURIComponent(`/invite/accept?token=${token || tokenFromUrl}`)}`} className="text-[#FF7F40] font-medium">log in</Link> with the email your admin used for the invite, then return to this link.
              </p>
            )}
            {!tokenFromUrl && (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#FF7F40] py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Accept Invite'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
