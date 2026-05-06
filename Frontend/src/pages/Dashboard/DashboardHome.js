import React from 'react';
import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';
import SuperAdminDashboard from './SuperAdmin/SuperAdminDashboard';
import AdminDashboard from './Admin/AdminDashboard';

const DashboardHome = ({ tab = 'dashboard' }) => {
  const { user } = useAuth();

  if (user.role === 'superadmin') {
    return <SuperAdminDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard tab={tab} />;
};

export default DashboardHome;
