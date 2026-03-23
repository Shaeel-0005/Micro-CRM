/**
 * context/AuthContext.jsx
 * Global authentication state.
 * Wrap your app with <AuthProvider> and consume with useAuth().
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true on first mount while we verify token

  /**
   * On mount: if a token exists in localStorage, fetch the current user
   * so the app knows who is logged in after a page refresh.
   */
 useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    // Token exists — treat user as authenticated
    // If you add a /auth/user/ endpoint later, fetch it here
    setUser({ username: 'user' });
    setLoading(false);
  };

  initAuth();
}, []);
  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Login — stores tokens and sets user state.
   * Called by LoginPage after a successful authAPI.login() response.
   */
  const login = useCallback((tokens, userData) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
  }, []);

  /**
   * Logout — clears tokens and user state.
   * PrivateRoute and Layout can call this.
   */
  const logout = useCallback(() => {
    authAPI.logout(); // clears localStorage
    setUser(null);
  }, []);

  // ── Value ────────────────────────────────────────────────────────────────────

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAuth()
 * Access auth state anywhere in the app.
 *
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

export default AuthContext;