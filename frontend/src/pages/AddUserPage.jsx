import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FiUser, FiMail, FiPhone, FiBook, FiUsers, FiLock, FiCheck, FiKey } from 'react-icons/fi';

const AddUserPage = () => {
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    department: '', 
    batch: '', 
    password: '', 
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); 
    setError(null); 
    setSuccess(null);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/add-user`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User added successfully!');
      setTimeout(() => navigate('/users'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Form Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FiUser className="text-blue-600 text-3xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mt-4">Add New User</h2>
          <p className="text-center text-gray-500 mt-1">Enter user details below</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Column - Name, Email, Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="031-xxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Right Column - Department, Batch, Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBook className="text-gray-400" />
                </div>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Computer Science"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUsers className="text-gray-400" />
                </div>
                <input
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2021"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          
        

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center">
              <FiCheck className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating User...
              </span>
            ) : (
              'Create User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage;
