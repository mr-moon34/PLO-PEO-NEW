import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          PLO Analysis System
        </Link>
        {user ? (
          <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0">
            <Link to="/" className="hover:underline font-medium">
              Upload Files
            </Link>
            <Link to="/results" className="hover:underline font-medium">
              PLO All Records
            </Link>
           
            <Link to="/peo-analysis" className="hover:underline font-medium">
              PEO Analysis
            </Link>
            <Link to="/peo-responses" className="hover:underline font-medium">
              All PEO Responses
            </Link>
            {user.isAdmin && (
              <Link to="/admin" className="hover:underline font-medium">
                Admin Dashboard
              </Link>
            )}
            <span className="font-semibold bg-blue-800 px-3 py-1 rounded text-sm">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-4 py-1 rounded font-semibold hover:bg-blue-100 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4 mt-3 md:mt-0">
            <Link to="/login" className="hover:underline font-medium">
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;