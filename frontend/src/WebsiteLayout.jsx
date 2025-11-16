
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function WebsiteLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="grow">
        <Outlet /> {/* This renders the child route (e.g., Home, Contact) */}
      </main>
      <Footer />
    </div>
  );
}
export default WebsiteLayout;