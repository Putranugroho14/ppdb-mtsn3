import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Auth/Login';
import AdminLogin from './pages/Auth/AdminLogin';
import Register from './pages/Auth/Register';
import Home from './pages/Public/Home';
import Announcements from './pages/Public/Announcements';
import AnnouncementDetail from './pages/Public/AnnouncementDetail';
import ProfilMadrasah from './pages/Public/ProfilMadrasah';
import SyaratKetentuan from './pages/Public/SyaratKetentuan';
import AlurPendaftaran from './pages/Public/AlurPendaftaran';
import JadwalPPDB from './pages/Public/JadwalPPDB';
import Contact from './pages/Public/Contact';
import UserManagement from './pages/Dashboard/SuperAdmin/UserManagement';
import SystemSettings from './pages/Dashboard/SuperAdmin/SystemSettings';
import DashboardHome from './pages/Dashboard/DashboardHome';
import MainLayout from './layouts/MainLayout';

// Admin Pages
import Applicants from './pages/Dashboard/Admin/Applicants';
import Verification from './pages/Dashboard/Admin/Verification';
import Results from './pages/Dashboard/Admin/Results';
import ManageAnnouncements from './pages/Dashboard/Admin/ManageAnnouncements';

// Pages (Placeholder)
const DashboardContainer = ({ children }) => (
  <MainLayout>
    {children}
  </MainLayout>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/announcement/:id" element={<AnnouncementDetail />} />
          <Route path="/profil-madrasah" element={<ProfilMadrasah />} />
          <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
          <Route path="/alur-pendaftaran" element={<AlurPendaftaran />} />
          <Route path="/jadwal-ppdb" element={<JadwalPPDB />} />
          <Route path="/kontak" element={<Contact />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <DashboardHome tab="dashboard" />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <DashboardHome tab="profile" />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/documents" 
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <DashboardHome tab="documents" />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/status" 
            element={
              <ProtectedRoute>
                <DashboardContainer>
                  <DashboardHome tab="status" />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute roles={['superadmin']}>
                <DashboardContainer>
                  <SystemSettings />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard/users" 
            element={
              <ProtectedRoute roles={['superadmin']}>
                <DashboardContainer>
                  <UserManagement />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/dashboard/applicants" 
            element={
              <ProtectedRoute roles={['admin', 'superadmin']}>
                <DashboardContainer>
                  <Applicants />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/verification" 
            element={
              <ProtectedRoute roles={['admin', 'superadmin']}>
                <DashboardContainer>
                  <Verification />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/results" 
            element={
              <ProtectedRoute roles={['admin', 'superadmin']}>
                <DashboardContainer>
                  <Results />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/announcements" 
            element={
              <ProtectedRoute roles={['superadmin']}>
                <DashboardContainer>
                  <ManageAnnouncements />
                </DashboardContainer>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
