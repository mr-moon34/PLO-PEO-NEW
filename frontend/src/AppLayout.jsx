import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { useAuth } from './AuthContext';

const AppLayout = () => {
  const { logout } = useAuth();

  console.log('AppLayout component rendering');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar onLogout={logout} />
      <main className="flex-1 md:ml-72 p-4 md:p-8 transition-all duration-200 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout; 