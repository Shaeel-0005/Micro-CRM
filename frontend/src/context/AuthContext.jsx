/**
 * context/AuthContext.jsx
 * Global authentication + workspace permissions state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import workspaceService from '../services/workspaceService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setWorkspace(null);
      setPermissions({});
      return null;
    }

    try {
      const [whoami, wsMe] = await Promise.all([
        authAPI.whoami(),
        workspaceService.getMe().catch(() => null),
      ]);
      const profile = {
        id: whoami.id,
        username: whoami.username,
        email: whoami.email,
        workspace: whoami.workspace ?? wsMe?.workspace ?? null,
        role: whoami.workspace?.role ?? wsMe?.role ?? null,
      };
      setUser(profile);
      setWorkspace(wsMe?.workspace ?? whoami.workspace ?? null);
      setPermissions(wsMe?.permissions ?? {});
      return profile;
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setWorkspace(null);
      setPermissions({});
      return null;
    }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = useCallback(async (tokens, fallbackUser) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    if (fallbackUser?.id) {
      setUser(fallbackUser);
    }
    await fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setWorkspace(null);
    setPermissions({});
  }, []);

  const value = {
    user,
    workspace,
    permissions,
    loading,
    login,
    logout,
    refreshProfile: fetchProfile,
    isAuthenticated: !!user,
    canAssignLeads: !!permissions.can_assign_leads,
    canExportCsv: !!permissions.can_export_csv,
    canManageTeam: !!permissions.can_manage_team,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

export default AuthContext;
