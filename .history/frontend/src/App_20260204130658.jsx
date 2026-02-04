import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Login, Signup } from "./pages";
import { Layout, Overview, Contacts } from "./components/index";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes with Layout wrapper */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Overview />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="pipeline" element={<div>Pipeline Page Coming Soon</div>} />
        <Route path="reports" element={<div>Reports Page Coming Soon</div>} />
        <Route path="inbox" element={<div>Inbox Page Coming Soon</div>} />
        <Route path="settings" element={<div>Settings Page Coming Soon</div>} />
      </Route>
    </Routes>
  );
}

export default App;