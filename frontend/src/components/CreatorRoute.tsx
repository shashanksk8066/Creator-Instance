import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const CreatorRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, profile } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent admins from accidentally viewing creator dashboard which might crash without a subdomain/tenant setup
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
