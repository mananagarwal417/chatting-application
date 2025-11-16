import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // Make sure this path is correct

function AppLayout() {
  return (
    // h-screen and overflow-hidden are key for an app layout
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar isLoggedIn={true} /> {/* Pass the prop here */}
      
      {/* 'flex-grow' and 'h-full' make the Outlet (Dashboard) fill the rest */}
      <main className="grow h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
export default AppLayout;
