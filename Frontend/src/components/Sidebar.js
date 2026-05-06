import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, FolderOpen, Settings as SettingsIcon, ChevronDown, X, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [ppdbOpen, setPpdbOpen] = useState(true);

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:static top-0 left-0 w-72 h-screen bg-primary-800 border-r border-primary-700 flex flex-col z-50 transition-transform duration-300 overflow-y-auto hide-scrollbar shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-primary-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-0.5">
              <img src="/images/logo mts.jpg" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
              {!document.querySelector('img[alt="Logo"]')?.complete && (
                <span className="font-black text-primary-600 text-xl tracking-tighter">M</span>
              )}
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-tight">MTSN 3</h1>
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Sanggau</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-primary-200 hover:text-white p-2 rounded-xl hover:bg-primary-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-6 px-3">
            <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-3">Menu Utama</p>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
              `}
            >
              <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {user.role === 'admin' && (
            <div className="mb-6 px-3">
              <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-3">PPDB</p>
              <div className="space-y-1">
                <NavLink
                  to="/dashboard/applicants"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <Users className="w-5 h-5" />
                  <span className="uppercase tracking-wide">Pendaftar</span>
                </NavLink>
                <NavLink
                  to="/dashboard/verification"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <FolderOpen className="w-5 h-5" />
                  <span className="uppercase tracking-wide">Data Verifikasi</span>
                </NavLink>
                <NavLink
                  to="/dashboard/results"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="uppercase tracking-wide">Lolos Seleksi</span>
                </NavLink>
              </div>
            </div>
          )}

          {user.role === 'superadmin' && (
            <div className="space-y-6">
              <div className="px-3">
                <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-3">Manajemen PPDB</p>
                <div className="space-y-1">
                    <NavLink
                      to="/dashboard/applicants"
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                        ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                      `}
                    >
                      <Users className="w-5 h-5" />
                      <span>Semua Pendaftar</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/announcements"
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                        ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                      `}
                    >
                      <Megaphone className="w-5 h-5" />
                      <span>Manajemen Pengumuman</span>
                    </NavLink>
                  <NavLink
                    to="/dashboard/settings"
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                      ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                    `}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span>Setup Sistem</span>
                  </NavLink>
                </div>
              </div>

              <div className="px-3">
                <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-3">Administrator</p>
                <NavLink
                  to="/dashboard/users"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <Users className="w-5 h-5" />
                  <span>Manajemen Akun</span>
                </NavLink>
              </div>
            </div>
          )}

          {user.role === 'user' && (
            <div className="mb-6 px-3">
              <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-3">Pendaftaran</p>
              <div className="space-y-1">
                <NavLink
                  to="/dashboard/profile"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <FolderOpen className="w-5 h-5" />
                  <span>Biodata</span>
                </NavLink>
                <NavLink
                  to="/dashboard/status"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}
                  `}
                >
                  <Home className="w-5 h-5" />
                  <span>Status</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-primary-700 mt-auto shrink-0 bg-primary-800">
          <div className="flex items-center gap-3 bg-primary-900 p-3 rounded-2xl border border-primary-700">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name || 'Administrator'}</p>
              <p className="text-[10px] text-primary-300 font-medium uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
        </div>

      </motion.aside>
    </>
  );
};

export default Sidebar;
