import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Tentukan apakah ini jalur admin berdasarkan prop roles
    // Jika roles ada dan TIDAK menyertakan 'user', berarti ini area admin
    const isRestrictedAdminArea = roles && !roles.includes('user');
    const isExplicitAdminPath = location.pathname.startsWith('/admin');
    const isAdminPath = isRestrictedAdminArea || isExplicitAdminPath;
    
    return <Navigate to={isAdminPath ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Jika user biasa mencoba akses admin, lempar ke dashboard peserta
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
