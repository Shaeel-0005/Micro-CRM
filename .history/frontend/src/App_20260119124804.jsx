import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Login, Signup } from "./pages";
import {Layout,Overview,Contacts,Layout} from "./components/index";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/pipeline" element={<div>Pipeline Page</div>} />
        <Route path="/reports" element={<div>Reports Page</div>} />
        <Route path="/inbox" element={<div>Inbox Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Route>
    </Routes>
  );
}

export default App;