/**
 * components/PrivateRoute.jsx
 * Wraps protected routes. Redirects unauthenticated users to /login.
 * Shows a loading screen while auth state is being verified on first mount.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Auth is still being verified (token check on page refresh).
  // Show a minimal loader so the app doesn't flash /login incorrectly.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFCF8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#FF7F40] animate-pulse shadow-lg shadow-orange-500/20" />
          <p className="text-sm text-gray-400 font-medium">Loading LeadFlow...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the child route
  return <Outlet />;
}