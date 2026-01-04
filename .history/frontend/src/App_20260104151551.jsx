import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Login, Signup, C_Dashboard } from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<C_Dashboard />} />
    </Routes>
  );
}

export default App;
