import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-stone-600">జై కిసాన్ లోడ్ అవుతోంది... / Loading Jai Kisan...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not onboarded and trying to access app pages (except /onboarding)
  if (user && !user.is_onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Admin access check
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
