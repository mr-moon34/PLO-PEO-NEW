import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user, 'Loading:', loading);
  
  if (loading) {
    console.log('ProtectedRoute - Showing loading');
    return <div>Loading...</div>;
  }
  
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - Rendering children');
  return children;
};

export default ProtectedRoute; 