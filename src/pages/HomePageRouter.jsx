// ./components/HomePageRouter.js (or ./pages/HomePageRouter.js)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';


export default function HomePageRouter() {
  const { userData } = useAuth();

  // Wait for userData to be available
  if (!userData) {
    // You could show a loading spinner here if userData is fetched asynchronously
    // For now, if AuthContext loads it synchronously from localStorage, this might not be hit often
    // or means data is missing.
    console.log("HomePageRouter: userData not yet available, showing generic Dashboard or could load...");
    return <Dashboard />; // Or a loading indicator
  }

  if (userData.role) {
    const userRole = userData.role.toUpperCase();
    switch (userRole) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'VENDOR':
        return <Navigate to="/dashboard/vendor" replace />;
      case 'MANAGER':
        return <Navigate to="/dashboard/manager" replace />;
      // Add other roles as needed
      // e.g. case 'USER': return <Navigate to="/user/profile" replace />
      default:
        // For any other role or if role doesn't match, show the generic Dashboard
        return <Dashboard />;
    }
  }

  // Fallback if userData exists but role doesn't (should ideally not happen)
  return <Dashboard />;
}