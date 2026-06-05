import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login but save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireAuth;
