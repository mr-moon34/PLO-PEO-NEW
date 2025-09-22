// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaUsers, 
  FaUpload, 
  FaTable, 
  FaChartBar, 
  FaThList, 
  FaSignOutAlt, 
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../AuthContext';

const navLinks = [
  { to: '/admin',         label: 'Dashboard',    icon: <FaChartBar /> },
  { to: '/',              label: 'PLO Analysis', icon: <FaUpload /> },
  { to: '/results',       label: 'PLO All Records',  icon: <FaThList /> },
  // { to: '/results-table', label: 'All Records Table', icon: <FaTable /> },
  { to: '/peo-analysis',  label: 'PEO Analysis', icon: <FaChartBar /> },
  { to: '/peo-responses', label: 'PEO All Records', icon: <FaTable /> },
  { to: '/users/add',     label: 'Add User',     icon: <FaUser /> },
  { to: '/users',         label: 'View Users', icon: <FaUsers /> },
  { to: '/final-result-upload', label: 'Final Result Analysis', icon: <FaTable /> },
  { to: '/final-result-records', label: 'All Final Result Analysis Record', icon: <FaThList /> },
  { to: '/predictions', label: 'Predictions', icon: <FaChartBar /> },
  { to: '/predictions/bulk', label: 'Bulk Predictions', icon: <FaChartBar /> },
];

const adminOnlyLinks = ['/admin', '/users/add', '/users'];

const Sidebar = ({ onLogout }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(mobile ? false : true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebar = () => {
    if (isMobile) setOpen(false);
  };

  const handleLogout = () => {
    onLogout();
  };

  // Filter navLinks based on user role
  const filteredNavLinks = user && user.isAdmin
    ? navLinks
    : navLinks.filter(link => !adminOnlyLinks.includes(link.to));

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !open && (
        <button
          className="fixed top-4 left-4 z-30 bg-black text-white p-3 rounded-xl shadow-lg transition-transform hover:scale-105"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Mobile-only full-screen sidebar + overlay */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-20 flex 
            ${open ? 'translate-x-0' : '-translate-x-full'} 
            transition-transform duration-300 ease-in-out`}
        >
          <aside className="w-72 h-screen bg-black text-white shadow-2xl">
            <SidebarContent
              navLinks={filteredNavLinks}
              location={location}
              onLinkClick={closeSidebar}
              onLogout={handleLogout}
              isMobile={true}
            />
          </aside>

          {/* semi-transparent overlay */}
          {open && (
            <div
              className="flex-1 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={closeSidebar}
            />
          )}
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-black text-white shadow-2xl">
          <SidebarContent
            navLinks={filteredNavLinks}
            location={location}
            onLinkClick={() => {}}
            onLogout={handleLogout}
            isMobile={false}
          />
        </aside>
      )}
    </>
  );
};

const SidebarContent = ({ navLinks, location, onLinkClick, onLogout, isMobile }) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-900 rounded-lg">
          <FaChartBar className="text-white text-xl" />
        </div>
        <span className="text-xl font-bold">PLO Analysis</span>
      </div>
      {isMobile && (
        <button
          onClick={onLinkClick}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <FaTimes className="text-white" />
        </button>
      )}
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 flex flex-col mt-6 px-3 overflow-y-auto">
      {navLinks.map((link) => {
        const active = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 transition-all duration-200
              ${active ? 'bg-gray-800 shadow-inner text-white' : 'text-gray-300 hover:bg-gray-800 hover:shadow-md'}`}
            onClick={onLinkClick}
          >
            <span className={`text-lg ${active ? 'text-white' : 'text-gray-400'}`}>
              {link.icon}
            </span>
            <span className="flex-1">{link.label}</span>
            {active
              ? <FaChevronDown className="text-xs text-gray-400" />
              : <FaChevronRight className="text-xs text-gray-500" />
            }
          </Link>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="w-full px-4 py-3 bg-black border-t border-gray-800">
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all duration-300 shadow"
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  </div>
);

export default Sidebar;
