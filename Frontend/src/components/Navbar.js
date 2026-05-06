import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Bell, Search, Info, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper to format path to title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('users') || path.includes('applicants')) return 'Data Pendaftar';
    if (path.includes('verification')) return 'Data Verifikasi';
    if (path.includes('results')) return 'Lolos Seleksi';
    if (path.includes('settings')) return 'Setup PPDB';
    if (path.includes('profile')) return 'Formulir Biodata';
    if (path.includes('documents')) return 'Upload Dokumen';
    if (path.includes('status')) return 'Status Kelulusan';
    return 'Dashboard Overview';
  };

  return (
    <nav className="bg-slate-50/50 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {user && (
          <button onClick={onMenuClick} className="lg:hidden p-2 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <div className="hidden lg:block">
          {/* We can put breadcrumbs or welcome text here */}
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Pantau dan kelola data PPDB Anda di sini.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* User Profile Pill */}
        <div className="flex items-center bg-white rounded-full p-1.5 pr-4 shadow-sm border border-slate-100 gap-3 hover:border-primary-200 transition-all">
          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-black text-slate-800 leading-none mb-1">{user?.name || 'Admin'}</span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">{user?.role || 'Staff'}</span>
          </div>

          <button
            onClick={logout}
            className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
