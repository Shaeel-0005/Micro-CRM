import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import Overview from "./components/Overview";
import Contacts from "./components/Contacts";

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