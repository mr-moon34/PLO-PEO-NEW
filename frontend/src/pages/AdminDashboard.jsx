import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import universityLogo from '../assets/logo.png'; // Replace with your university logo
import { FiUsers, FiBarChart2, FiTrendingUp, FiUserPlus, FiSettings, FiArrowRight } from 'react-icons/fi';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';

const QUOTES = [
  "Leadership is the capacity to translate vision into reality.",
  "Success is not the key to happiness. Happiness is the key to success.",
  "The best way to predict the future is to create it.",
  "Great things never come from comfort zones."
];

const getInitialDark = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark';
  }
  return false;
};

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, assessments: 0, peos: 0, finalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchStats();
    AOS.init({ duration: 800, once: true });
  }, [user, navigate, token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, assessmentsRes, peosRes, finalResultsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/count`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upload/count`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/peo/count`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/final-result/count`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      console.log(usersRes.data, assessmentsRes.data, peosRes.data, finalResultsRes.data);
      setStats({
        users: usersRes.data.count,
        assessments: assessmentsRes.data.count,
        peos: peosRes.data.count,
        finalResults: finalResultsRes.data.count,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) return null;

  // Avatar: first letter of name
  const avatar = user?.name ? user.name[0].toUpperCase() : 'A';

  return (
    <div className="min-h-screen relative transition-colors duration-300 bg-gray-100">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Welcome + Avatar + Quote */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 mt-2">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
              {avatar}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'Admin'}!</div>
              <div className="text-indigo-500 font-medium text-base mt-1">{quote}</div>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="mb-8 rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 via-white to-indigo-100 p-6 border border-gray-200">
          <div className="flex items-center gap-6">
            <img
              src={universityLogo}
              alt="Logo"
              className="h-16 w-16 rounded-2xl shadow ring-2 ring-indigo-200 bg-white object-contain transition-transform duration-200 hover:scale-105"
              style={{ background: 'white' }}
            />
            <div>
              <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight">Admin Portal</h1>
              <p className="text-lg text-indigo-500 font-medium mt-1">University Management Dashboard</p>
            </div>
          </div>
          <div className="flex space-x-4 mt-6 border-t border-indigo-100 pt-4">
            <Link to="/dashboard" className="text-blue-700 font-semibold hover:text-indigo-600 transition-colors text-xs">Dashboard</Link>
            <Link to="/plo-analysis" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">PLO Analysis</Link>
            <Link to="/plo-records" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">PLO All Records</Link>
            <Link to="/peo-analysis" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">PEO Analysis</Link>
            <Link to="/peo-records" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">PEO All Records</Link>
            <Link to="/users/add" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">Add User</Link>
            <Link to="/users" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">View Users</Link>
            <Link to="/final-result-analysis" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">Final Result Analysis</Link>
            <Link to="/final-result-records" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-xs">All Final Result Analysis Record</Link>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FiBarChart2 className="text-indigo-500 text-2xl" />
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
              title="Total Users" 
              value={stats.users} 
              loading={loading}
              change="12% increase from last week"
              icon={<FiUsers className="text-3xl text-blue-500" />}
            />
            <StatCard 
              title="PLO Records" 
              value={stats.assessments} 
              loading={loading}
              change="8% increase from last week"
              icon={<FiBarChart2 className="text-3xl text-indigo-500" />}
            />
            <StatCard 
              title="PEO Analyses" 
              value={stats.peos} 
              loading={loading}
              change="3% decrease from last week"
              icon={<FiTrendingUp className="text-3xl text-purple-500" />}
            />
            <StatCard 
              title="Final Result Analyses" 
              value={stats.finalResults} 
              loading={loading}
              change="N/A"
              icon={<FiBarChart2 className="text-3xl text-green-500" />}
            />
          </div>
        </div>
        <hr className="my-10 border-indigo-100" />
        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FiSettings className="text-indigo-500 text-2xl" />
            <h2 className="text-2xl font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActionCard 
              title="Add New User"
              description="Create new admin or faculty accounts"
              link="/users/add"
              icon={<FiUserPlus className="text-2xl text-blue-500" />}
            />
            <ActionCard 
              title="Manage Users"
              description="View and edit user accounts"
              link="/users"
              icon={<FiUsers className="text-2xl text-indigo-500" />}
            />
            <ActionCard 
              title="View Reports"
              description="Analyze PLO assessment data"
              link="/results"
              icon={<FiBarChart2 className="text-2xl text-purple-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, loading, change, icon }) => (
  <div
    className={
      `p-6 rounded-2xl shadow-2xl hover:ring-2 hover:ring-indigo-500/30 transition-all duration-200 group cursor-pointer backdrop-blur-md
      bg-white/70 border border-white/40 text-indigo-900`
    }
    data-aos="fade-up"
  >
    <div className="flex items-center gap-4 mb-2">
      <div className="bg-white rounded-xl p-3 shadow group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-4xl font-extrabold mb-2 group-hover:text-blue-700 transition-colors">
      {loading ? '...' : <CountUp end={value} duration={1.2} separator="," />}
    </p>
    <p className="text-sm text-gray-500">{change}</p>
  </div>
);

const ActionCard = ({ title, description, link, icon }) => (
  <Link
    to={link}
    className={`p-6 rounded-2xl shadow-2xl hover:ring-2 hover:ring-indigo-500/30 hover:scale-105 transition-all duration-200 flex flex-col gap-3 group relative overflow-hidden backdrop-blur-md bg-white/70 border border-white/40 text-indigo-900`}
    data-aos="fade-up"
  >
    <div className="flex items-center gap-3">
      <div className="bg-white rounded-xl p-3 shadow transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 flex-1">{description}</p>
    <div className="flex items-center gap-2 mt-2 text-indigo-600 font-semibold group-hover:text-blue-700 transition-colors">
      Go <FiArrowRight />
    </div>
    {/* Ripple effect */}
    <span className="absolute inset-0 pointer-events-none group-active:animate-ping bg-indigo-100 opacity-0 group-active:opacity-30 rounded-2xl" />
  </Link>
);

export default AdminDashboard;