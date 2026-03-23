/**
 * App.jsx
 * PrivateRoute wraps all dashboard routes.
 * Public routes (/, /login, /signup) remain open.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Login, Signup } from './pages';
import { Layout, Overview, Contacts, Settings, Pipeline, Reports, Inbox } from './components';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ───────────────────────────────────────────────── */}
      <Route path="/"       element={<Home />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ── Protected routes ────────────────────────────────────────────── */}
      {/* PrivateRoute checks auth. If not logged in → /login              */}
      {/* Layout renders the sidebar + header shell via <Outlet />         */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/contacts"  element={<Contacts />} />
          <Route path="/pipeline" element={<Pipeline />} />
<Route path="/reports"  element={<Reports />} />
<Route path="/inbox"    element={<Inbox />} />
         <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}