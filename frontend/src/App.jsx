// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import WebsiteLayout from './WebsiteLayout';
import AppLayout from './AppLayout';

// Website Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

// App Page
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* 1. Routes for your Website (with Footer) */}
      <Route element={<WebsiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        {/* You might move Login/Register outside this layout too */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 2. Routes for your App (no Footer, full-height) */}
      {/* You would wrap this in a <ProtectedRoute> component later */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other app routes here, e.g., /settings, /profile */}
      </Route>

      {/* (Your other routes like /privacy, /terms) */}
    </Routes>
  );
}

export default App;